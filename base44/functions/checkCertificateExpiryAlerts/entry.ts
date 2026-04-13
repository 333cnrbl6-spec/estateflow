import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const today = new Date();
    const alertThresholdDays = 30;
    const alertDate = new Date(today);
    alertDate.setDate(alertDate.getDate() + alertThresholdDays);

    const alerts = [];
    const alertsCreated = [];

    // Check Gas Safety Certificates
    const gasCerts = await base44.entities.GasSafetyCertificate.list('-expiry_date', 500);
    for (const cert of gasCerts) {
      if (cert.expiry_date && cert.status !== 'expired') {
        const expiryDate = new Date(cert.expiry_date);
        const daysUntilExpiry = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));

        if (daysUntilExpiry > 0 && daysUntilExpiry <= alertThresholdDays) {
          alerts.push({
            type: 'gas_safety',
            certificate_id: cert.id,
            property_id: cert.property_id,
            unit_id: cert.unit_id,
            certificate_number: cert.certificate_number,
            expiry_date: cert.expiry_date,
            days_until_expiry: daysUntilExpiry,
            engineer: cert.engineer_name,
            email: null,
          });
        }
      }
    }

    // Check EICR Certificates
    const eicrCerts = await base44.entities.EICRCertificate.list('-next_due_date', 500);
    for (const cert of eicrCerts) {
      if (cert.next_due_date && cert.status !== 'expired') {
        const dueDate = new Date(cert.next_due_date);
        const daysUntilDue = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));

        if (daysUntilDue > 0 && daysUntilDue <= alertThresholdDays) {
          alerts.push({
            type: 'eicr',
            certificate_id: cert.id,
            property_id: cert.property_id,
            unit_id: cert.unit_id,
            certificate_number: cert.certificate_reference,
            expiry_date: cert.next_due_date,
            days_until_expiry: daysUntilDue,
            contractor: cert.contractor_name,
            email: null,
          });
        }
      }
    }

    // Check SafetyCertificate (generic, includes EPC)
    const safetyCerts = await base44.entities.SafetyCertificate.list('-expiry_date', 500);
    for (const cert of safetyCerts) {
      if (cert.expiry_date && cert.status !== 'expired') {
        const expiryDate = new Date(cert.expiry_date);
        const daysUntilExpiry = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));

        if (daysUntilExpiry > 0 && daysUntilExpiry <= alertThresholdDays) {
          alerts.push({
            type: cert.certificate_type,
            certificate_id: cert.id,
            property_id: cert.property_id,
            certificate_number: cert.certificate_number,
            expiry_date: cert.expiry_date,
            days_until_expiry: daysUntilExpiry,
            issuer: cert.issuing_body,
            email: null,
          });
        }
      }
    }

    // Create/update alert records
    for (const alert of alerts) {
      // Check if alert already exists
      const existing = await base44.entities.CertificateExpiryAlert.filter(
        {
          certificate_id: alert.certificate_id,
          status: 'pending',
        },
        '-created_date',
        1
      );

      if (existing.length === 0) {
        // Create new alert
        const alertRecord = await base44.entities.CertificateExpiryAlert.create({
          certificate_id: alert.certificate_id,
          property_id: alert.property_id,
          certificate_type: alert.type,
          expiry_date: alert.expiry_date,
          days_until_expiry: alert.days_until_expiry,
          threshold_days: alertThresholdDays,
          status: 'pending',
          sent_to: [],
        });
        alertsCreated.push(alertRecord);
      }
    }

    // Send notifications for pending alerts
    const pendingAlerts = await base44.entities.CertificateExpiryAlert.filter(
      { status: 'pending' },
      '-created_date',
      500
    );

    const notificationsSent = [];
    for (const alert of pendingAlerts) {
      const property = await base44.entities.Property.get(alert.property_id);

      let recipients = [];
      // In a real system, you'd look up property managers and contractors
      // For now, we'll assume default admin notifications
      if (user.email) {
        recipients.push({ email: user.email, name: user.full_name || 'Property Manager' });
      }

      if (recipients.length > 0) {
        const emailBody = `
COMPLIANCE ALERT: Certificate Expiring Soon

Property: ${property?.name || 'Unknown Property'}
Certificate Type: ${alert.certificate_type.toUpperCase()}
Days Until Expiry: ${alert.days_until_expiry}
Expiry Date: ${new Date(alert.expiry_date).toLocaleDateString('en-GB')}

Action Required:
Please arrange for renewal of this certificate immediately to avoid compliance breaches.

Best regards,
Compliance Monitoring System
        `.trim();

        try {
          await base44.integrations.Core.SendEmail({
            to: recipients[0].email,
            subject: `⚠️ URGENT: ${alert.certificate_type.replace(/_/g, ' ').toUpperCase()} Expires in ${alert.days_until_expiry} Days`,
            body: emailBody,
            from_name: 'Compliance Alerts',
          });

          // Update alert status
          await base44.entities.CertificateExpiryAlert.update(alert.id, {
            status: 'sent',
            sent_at: new Date().toISOString(),
            sent_to: recipients.map(r => r.email),
          });

          notificationsSent.push(alert.id);
        } catch (emailError) {
          console.error(`Failed to send alert for certificate ${alert.certificate_id}:`, emailError);
        }
      }
    }

    return Response.json({
      success: true,
      certificates_scanned: {
        gas_safety: gasCerts.length,
        eicr: eicrCerts.length,
        safety: safetyCerts.length,
      },
      alerts_found: alerts.length,
      alerts_created: alertsCreated.length,
      notifications_sent: notificationsSent.length,
      summary: `Scanned ${gasCerts.length + eicrCerts.length + safetyCerts.length} certificates. Found ${alerts.length} expiring within 30 days. Created ${alertsCreated.length} new alerts and sent ${notificationsSent.length} notifications.`,
    });
  } catch (error) {
    console.error('Error checking certificate expiries:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});