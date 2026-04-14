import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Get all users with admin role
    const admins = await base44.asServiceRole.entities.User.filter({ role: 'admin' });
    
    let emailsSent = 0;
    const errors = [];

    for (const admin of admins) {
      try {
        // Get pending alerts
        const alerts = await base44.asServiceRole.entities.ComplianceAlertPreference.filter({
          user_email: admin.email,
          enabled: true,
          email_frequency: 'daily_digest'
        });

        if (!alerts.length) continue;

        // Get critical issues
        const profiles = await base44.asServiceRole.entities.CompaniesHouseProfile.list('', 50);
        const criticalIssues = profiles.filter(p => 
          p.critical_alerts && p.critical_alerts.some(a => a.severity === 'critical')
        );

        const expiryAlerts = await base44.asServiceRole.entities.CertificateExpiryAlert.filter({
          alert_status: 'pending'
        });

        // Build digest email
        const subject = `[Daily Compliance Digest] ${new Date().toLocaleDateString()}`;
        const body = `
Compliance Digest for ${admin.full_name || admin.email}

CRITICAL ISSUES (${criticalIssues.length}):
${criticalIssues.slice(0, 5).map(p => `- ${p.company_name}: ${p.critical_alerts[0].message}`).join('\n')}

CERTIFICATE EXPIRY ALERTS (${expiryAlerts.length}):
${expiryAlerts.slice(0, 5).map(a => `- ${a.certificate_type}: ${a.days_until_expiry} days remaining`).join('\n')}

View full details: [Dashboard Link]
        `;

        await base44.integrations.Core.SendEmail({
          to: admin.email,
          subject,
          body,
          from_name: 'Compliance System'
        });

        emailsSent++;
      } catch (err) {
        errors.push({ email: admin.email, error: err.message });
      }
    }

    return Response.json({ 
      emailsSent,
      totalAdmins: admins.length,
      errors,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});