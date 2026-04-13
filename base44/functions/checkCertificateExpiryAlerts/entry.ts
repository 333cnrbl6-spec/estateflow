import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';
import { differenceInDays, parseISO } from 'npm:date-fns@3.6.0';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Verify admin access
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Admin access required' }, { status: 403 });
    }

    // Get all alert configurations
    const configs = await base44.entities.ComplianceAlertConfig.list();
    if (configs.length === 0) {
      return Response.json({ message: 'No alert configurations found', alertsSent: 0 });
    }

    // Get all certificates
    const certificates = await base44.entities.SafetyCertificate.list();
    const today = new Date();
    let alertsSent = 0;

    for (const config of configs) {
      if (!config.enabled) continue;

      // Filter certificates by type
      let relevantCerts = certificates;
      if (config.certificate_type !== 'all') {
        relevantCerts = certificates.filter(c => c.certificate_type === config.certificate_type);
      }

      // Check each certificate
      for (const cert of relevantCerts) {
        if (!cert.expiry_date) continue;

        const expiryDate = parseISO(cert.expiry_date);
        const daysUntilExpiry = differenceInDays(expiryDate, today);

        // Check if within alert threshold
        if (daysUntilExpiry <= config.threshold_days && daysUntilExpiry >= 0) {
          // Create alert notification
          const alertData = {
            certificate_id: cert.id,
            property_id: cert.property_id,
            certificate_type: cert.certificate_type,
            expiry_date: cert.expiry_date,
            days_until_expiry: daysUntilExpiry,
            threshold_days: config.threshold_days,
            status: 'pending',
          };

          // Create notification record
          const notification = await base44.entities.CertificateExpiryAlert.create(alertData);

          // Send notifications based on config
          if (config.notify_email && config.recipients) {
            // Get recipient emails
            const emails = await getRecipientEmails(base44, config.recipients, config.custom_email);
            
            for (const email of emails) {
              try {
                await base44.integrations.Core.SendEmail({
                  to: email,
                  subject: `Certificate Expiry Alert - ${getCertTypeName(cert.certificate_type)}`,
                  body: generateEmailBody(cert, daysUntilExpiry, config.threshold_days),
                });
                alertsSent++;
              } catch (emailError) {
                console.error('Failed to send email:', emailError);
              }
            }
          }

          if (config.notify_dashboard) {
            alertsSent++; // Count dashboard alert
          }
        }
      }
    }

    return Response.json({ 
      message: `Processed ${certificates.length} certificates against ${configs.length} configurations`,
      alertsSent 
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});

async function getRecipientEmails(base44, recipients, customEmail) {
  const emails = [];
  
  // Get users by role
  const users = await base44.entities.User.list();
  
  for (const recipient of recipients) {
    if (recipient === 'custom' && customEmail) {
      emails.push(customEmail);
    } else if (recipient === 'property_manager') {
      const managers = users.filter(u => u.role === 'admin');
      managers.forEach(m => { if (m.email) emails.push(m.email); });
    } else if (recipient === 'compliance_officer') {
      // Look for users with compliance role or admin
      const officers = users.filter(u => u.role === 'admin');
      officers.forEach(o => { if (o.email) emails.push(o.email); });
    } else if (recipient === 'maintenance_team') {
      // Could be extended with specific maintenance team users
      const admins = users.filter(u => u.role === 'admin');
      admins.forEach(a => { if (a.email) emails.push(a.email); });
    } else if (recipient === 'landlord') {
      // Could be extended with landlord contacts
      const contacts = await base44.entities.Contact.filter({ contact_type: 'landlord' });
      contacts.forEach(c => { if (c.email) emails.push(c.email); });
    }
  }
  
  // Remove duplicates
  return [...new Set(emails)];
}

function getCertTypeName(type) {
  const names = {
    gas_safety: 'Gas Safety Certificate',
    eicr: 'Electrical Safety (EICR)',
    fire_safety: 'Fire Safety Certificate',
    asbestos: 'Asbestos Survey',
    legionella: 'Legionella Risk Assessment',
    pat_testing: 'PAT Testing',
    boiler_service: 'Boiler Service',
    lift_safety: 'Lift Safety',
    other: 'Safety Certificate',
  };
  return names[type] || 'Safety Certificate';
}

function generateEmailBody(cert, daysUntil, threshold) {
  const urgency = daysUntil <= 7 ? 'URGENT' : daysUntil <= 30 ? 'IMPORTANT' : 'REMINDER';
  
  return `
${urgency}: Certificate Expiry Alert

Dear Property Manager,

This is an automated alert regarding an upcoming certificate expiry.

CERTIFICATE DETAILS:
- Type: ${getCertTypeName(cert.certificate_type)}
- Property ID: ${cert.property_id}
- Certificate Number: ${cert.certificate_number || 'N/A'}
- Issue Date: ${cert.issue_date || 'N/A'}
- Expiry Date: ${cert.expiry_date}
- Days Until Expiry: ${daysUntil}
- Alert Threshold: ${threshold} days

${daysUntil <= 7 ? 'ACTION REQUIRED IMMEDIATELY' : 'ACTION REQUIRED'}:
Please arrange for certificate renewal before the expiry date to maintain compliance.

This is an automated message from Premiso Compliance System.
  `.trim();
}