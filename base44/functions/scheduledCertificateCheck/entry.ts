import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Use service role for scheduled tasks
    console.log('Running scheduled certificate expiry check');

    // Directly run the alert checking logic using service role entities
    const configs = await base44.asServiceRole.entities.ComplianceAlertConfig.list();
    if (configs.length === 0) {
      return Response.json({ message: 'No alert configurations found', alertsSent: 0 });
    }

    const certificates = await base44.asServiceRole.entities.SafetyCertificate.list();
    const { differenceInDays, parseISO } = await import('npm:date-fns@3.6.0');
    const today = new Date();
    let alertsSent = 0;

    for (const config of configs) {
      if (!config.enabled) continue;

      let relevantCerts = certificates;
      if (config.certificate_type !== 'all') {
        relevantCerts = certificates.filter(c => c.certificate_type === config.certificate_type);
      }

      for (const cert of relevantCerts) {
        if (!cert.expiry_date) continue;

        const expiryDate = parseISO(cert.expiry_date);
        const daysUntilExpiry = differenceInDays(expiryDate, today);

        if (daysUntilExpiry <= config.threshold_days && daysUntilExpiry >= 0) {
          const alertData = {
            certificate_id: cert.id,
            property_id: cert.property_id,
            certificate_type: cert.certificate_type,
            expiry_date: cert.expiry_date,
            days_until_expiry: daysUntilExpiry,
            threshold_days: config.threshold_days,
            status: 'pending',
          };

          await base44.asServiceRole.entities.CertificateExpiryAlert.create(alertData);

          if (config.notify_email && config.recipients) {
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
            alertsSent++;
          }
        }
      }
    }

    return Response.json({ 
      success: true,
      message: `Processed ${certificates.length} certificates against ${configs.length} configurations`,
      alertsSent 
    });

  } catch (error) {
    console.error('Error in scheduled certificate check:', error);
    return Response.json({ 
      success: false,
      error: error.message 
    }, { status: 500 });
  }
});

async function getRecipientEmails(base44, recipients, customEmail) {
  const emails = [];
  const users = await base44.asServiceRole.entities.User.list();
  
  for (const recipient of recipients) {
    if (recipient === 'custom' && customEmail) {
      emails.push(customEmail);
    } else if (['property_manager', 'compliance_officer', 'maintenance_team'].includes(recipient)) {
      const admins = users.filter(u => u.role === 'admin');
      admins.forEach(a => { if (a.email) emails.push(a.email); });
    } else if (recipient === 'landlord') {
      const contacts = await base44.asServiceRole.entities.Contact.filter({ contact_type: 'landlord' });
      contacts.forEach(c => { if (c.email) emails.push(c.email); });
    }
  }
  
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