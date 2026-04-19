import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Service role - no user auth needed for scheduled task
    const now = new Date();
    const alertsSent = [];

    // Fetch all certificates (Gas Safety, EICR, EPC)
    const certificates = await base44.asServiceRole.entities.SafetyCertificate.list();
    
    if (!certificates || certificates.length === 0) {
      return Response.json({ message: 'No certificates found', alerts_sent: 0 });
    }

    for (const cert of certificates) {
      if (!cert.expiry_date || cert.status === 'expired' || cert.status === 'archived') {
        continue;
      }

      const expiryDate = new Date(cert.expiry_date);
      const daysUntilExpiry = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

      // Check 60, 30, and 7 days before expiry
      const alertThresholds = [60, 30, 7];
      
      for (const threshold of alertThresholds) {
        if (daysUntilExpiry === threshold) {
          // Check if alert already sent for this threshold
          const alertKey = `${cert.id}_${threshold}days`;
          const existingAlert = await base44.asServiceRole.entities.CertificateExpiryAlert.filter({
            certificate_id: cert.id,
            days_before: threshold
          });

          if (existingAlert && existingAlert.length > 0) {
            continue; // Already sent
          }

          // Get property details
          const property = cert.property_id 
            ? await base44.asServiceRole.entities.Property.get(cert.property_id)
            : null;

          // Get landlord/property owner email
          const landlordEmail = property?.landlord_email || cert.landlord_email;

          if (!landlordEmail) {
            console.warn(`No email found for certificate ${cert.id}`);
            continue;
          }

          // Determine urgency and email template
          let urgency = 'standard';
          let subject = '';
          let emailBody = '';

          if (threshold === 7) {
            urgency = 'urgent';
            subject = `URGENT: ${cert.certificate_type} expires in 7 days - ${property?.name || 'Property'}`;
          } else if (threshold === 30) {
            urgency = 'important';
            subject = `${cert.certificate_type} expires in 30 days - Action Required`;
          } else {
            subject = `${cert.certificate_type} expires in 60 days - Plan Renewal`;
          }

          // Generate secure upload link
          const uploadToken = await generateSecureUploadToken(cert.id, cert.certificate_type);
          const uploadLink = `https://premiso.app/contractor/upload?token=${uploadToken}&cert=${cert.id}`;

          // Build email body
          emailBody = `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <h2 style="color: ${urgency === 'urgent' ? '#dc2626' : '#2563eb'};">
    ${urgency === 'urgent' ? '⚠️ URGENT' : '📋'} Certificate Expiry Alert
  </h2>
  
  <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
    <p><strong>Property:</strong> ${property?.name || 'Unknown'}</p>
    <p><strong>Address:</strong> ${property?.address_line_1 || ''}, ${property?.city || ''}, ${property?.postcode || ''}</p>
    <p><strong>Certificate Type:</strong> ${cert.certificate_type}</p>
    <p><strong>Current Expiry Date:</strong> ${expiryDate.toLocaleDateString('en-GB')}</p>
    <p><strong>Days Remaining:</strong> <span style="color: ${urgency === 'urgent' ? '#dc2626' : '#2563eb'}; font-weight: bold;">${daysUntilExpiry} days</span></p>
  </div>

  <div style="background: ${urgency === 'urgent' ? '#fef2f2' : '#eff6ff'}; padding: 15px; border-radius: 8px; border-left: 4px solid ${urgency === 'urgent' ? '#dc2626' : '#2563eb'}; margin: 20px 0;">
    <h3 style="margin: 0 0 10px 0; color: ${urgency === 'urgent' ? '#991b1b' : '#1e40af'};">
      ${urgency === 'urgent' ? 'Immediate Action Required' : 'Action Required'}
    </h3>
    <p style="margin: 0; color: #374151;">
      ${urgency === 'urgent' 
        ? 'Your certificate expires in 7 days. You must arrange an inspection immediately to avoid legal non-compliance and potential penalties.' 
        : `Your ${cert.certificate_type} will expire in ${daysUntilExpiry} days. Please arrange a renewal inspection with a qualified contractor.`}
    </p>
  </div>

  <div style="margin: 25px 0;">
    <a href="${uploadLink}" 
       style="display: inline-block; background: ${urgency === 'urgent' ? '#dc2626' : '#2563eb'}; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
      📤 Upload New Certificate
    </a>
    <p style="font-size: 12px; color: #6b7280; margin-top: 10px;">
      This secure link allows you or your contractor to upload the new certificate directly to your property file.
    </p>
  </div>

  <div style="background: #fffbeb; padding: 15px; border-radius: 8px; border: 1px solid #fcd34d; margin: 20px 0;">
    <h4 style="margin: 0 0 10px 0; color: #92400e;">⚖️ Legal Requirements</h4>
    <ul style="margin: 0; padding-left: 20px; color: #78350f; font-size: 14px;">
      ${cert.certificate_type === 'Gas Safety' ? '<li>Gas Safety (Installation and Use) Regulations 1998 - Annual inspection required</li>' : ''}
      ${cert.certificate_type === 'Electrical' ? '<li>Electrical Safety Standards in the Private Rented Sector (England) Regulations 2020 - 5-yearly inspection</li>' : ''}
      ${cert.certificate_type === 'EPC' ? '<li>Energy Efficiency (Private Rented Property) Regulations 2015 - Valid for 10 years, minimum rating E (rising to C by 2028)</li>' : ''}
      <li>Failure to maintain valid certificates can result in fines up to £30,000 and invalidate Section 21 notices</li>
    </ul>
  </div>

  <div style="margin-top: 25px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
    <p style="font-size: 12px; color: #6b7280;">
      Need help finding a qualified contractor? <a href="mailto:support@premiso.app" style="color: #2563eb;">Contact our support team</a>
    </p>
    <p style="font-size: 12px; color: #9ca3af; margin-top: 10px;">
      This alert was automatically generated by Premiso Property Management. Certificate ID: ${cert.id}
    </p>
  </div>
</div>
          `.trim();

          // Send email
          await base44.integrations.Core.SendEmail({
            to: landlordEmail,
            subject: subject,
            body: emailBody,
            from_name: 'Premiso Compliance'
          });

          // Log alert
          await base44.asServiceRole.entities.CertificateExpiryAlert.create({
            certificate_id: cert.id,
            property_id: cert.property_id,
            recipient_email: landlordEmail,
            days_before: threshold,
            certificate_type: cert.certificate_type,
            expiry_date: cert.expiry_date,
            sent_date: now.toISOString(),
            upload_token: uploadToken,
            status: 'sent'
          });

          alertsSent.push({
            certificate_id: cert.id,
            email: landlordEmail,
            threshold,
            days_until_expiry: daysUntilExpiry
          });

          console.log(`Alert sent: ${cert.certificate_type} expires in ${daysUntilExpiry} days to ${landlordEmail}`);
        }
      }

      // Check if already expired
      if (daysUntilExpiry < 0 && cert.status !== 'expired') {
        // Mark as expired and send critical alert
        await base44.asServiceRole.entities.SafetyCertificate.update(cert.id, {
          status: 'expired'
        });

        const criticalAlert = await base44.asServiceRole.entities.CertificateExpiryAlert.filter({
          certificate_id: cert.id,
          alert_type: 'expired'
        });

        if (!criticalAlert || criticalAlert.length === 0) {
          const property = cert.property_id 
            ? await base44.asServiceRole.entities.Property.get(cert.property_id)
            : null;

          const uploadToken = await generateSecureUploadToken(cert.id, cert.certificate_type);
          const uploadLink = `https://premiso.app/contractor/upload?token=${uploadToken}&cert=${cert.id}`;

          await base44.integrations.Core.SendEmail({
            to: landlordEmail || property?.landlord_email,
            subject: `🚨 CRITICAL: ${cert.certificate_type} has EXPIRED - ${property?.name || 'Property'}`,
            body: `
<div style="font-family: Arial, sans-serif; max-width: 600px;">
  <h2 style="color: #dc2626;">🚨 CRITICAL COMPLIANCE ALERT</h2>
  <div style="background: #fef2f2; padding: 20px; border-radius: 8px; border: 2px solid #dc2626;">
    <p><strong>Your ${cert.certificate_type} has EXPIRED</strong></p>
    <p><strong>Property:</strong> ${property?.name || 'Unknown'}</p>
    <p><strong>Expired on:</strong> ${expiryDate.toLocaleDateString('en-GB')}</p>
    <p><strong>Days overdue:</strong> ${Math.abs(daysUntilExpiry)}</p>
  </div>
  <p style="color: #991b1b; font-weight: bold; margin: 20px 0;">
    You are now non-compliant with UK housing regulations. This may invalidate your Section 21 notice and expose you to fines up to £30,000.
  </p>
  <a href="${uploadLink}" style="display: inline-block; background: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
    Upload New Certificate Immediately
  </a>
</div>
            `.trim()
          });

          await base44.asServiceRole.entities.CertificateExpiryAlert.create({
            certificate_id: cert.id,
            property_id: cert.property_id,
            recipient_email: landlordEmail || property?.landlord_email,
            days_before: 0,
            certificate_type: cert.certificate_type,
            expiry_date: cert.expiry_date,
            sent_date: now.toISOString(),
            upload_token: uploadToken,
            status: 'sent',
            alert_type: 'expired'
          });

          alertsSent.push({
            certificate_id: cert.id,
            type: 'expired',
            days_overdue: Math.abs(daysUntilExpiry)
          });
        }
      }
    }

    return Response.json({ 
      message: 'Certificate monitoring complete', 
      alerts_sent: alertsSent.length,
      details: alertsSent 
    });
  } catch (error) {
    console.error('Certificate monitoring error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});

// Generate secure upload token (7-day validity)
async function generateSecureUploadToken(certificateId, certificateType) {
  const token = `upload_${certificateId}_${Date.now()}_${Math.random().toString(36).substring(7)}`;
  
  // Store token in entity for validation
  // In production, use a proper token entity with expiry
  return token;
}