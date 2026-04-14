import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

function formatDeadlineEmail(alerts, recipientEmail) {
  const alertsByCompany = {};
  
  alerts.forEach(alert => {
    if (!alertsByCompany[alert.company_name]) {
      alertsByCompany[alert.company_name] = {
        company_number: alert.company_number,
        alerts: []
      };
    }
    alertsByCompany[alert.company_name].alerts.push(alert);
  });

  let htmlBody = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #333; line-height: 1.6; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #221f2e; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
          .content { background: #f9f9f9; padding: 20px; border: 1px solid #ddd; border-radius: 0 0 8px 8px; margin-bottom: 20px; }
          .company { background: white; padding: 15px; margin-bottom: 15px; border: 1px solid #e0e0e0; border-radius: 6px; }
          .company-name { font-size: 16px; font-weight: bold; color: #221f2e; margin-bottom: 10px; }
          .company-number { font-size: 12px; color: #999; margin-bottom: 10px; }
          .alert { padding: 12px; margin: 8px 0; border-left: 4px solid #ddd; background: #f5f5f5; border-radius: 4px; }
          .alert.critical { border-left-color: #dc2626; background: #fef2f2; }
          .alert.high { border-left-color: #ea580c; background: #fffbf0; }
          .alert.medium { border-left-color: #eab308; background: #fefce8; }
          .alert.low { border-left-color: #2563eb; background: #eff6ff; }
          .alert-title { font-weight: bold; font-size: 14px; margin-bottom: 4px; }
          .alert-message { font-size: 13px; color: #555; }
          .alert-date { font-size: 12px; color: #888; margin-top: 6px; }
          .footer { font-size: 12px; color: #666; text-align: center; margin-top: 20px; border-top: 1px solid #ddd; padding-top: 15px; }
          .cta { display: inline-block; background: #221f2e; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; margin: 15px 0; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin: 0;">Compliance Deadline Alerts</h1>
            <p style="margin: 8px 0 0 0; opacity: 0.9;">${new Date().toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>
          
          <div class="content">
            <p>You have <strong>${alerts.length}</strong> upcoming compliance deadline${alerts.length !== 1 ? 's' : ''}:</p>
  `;

  Object.entries(alertsByCompany).forEach(([companyName, data]) => {
    htmlBody += `
      <div class="company">
        <div class="company-name">${companyName}</div>
        <div class="company-number">Company number: <strong>${data.company_number}</strong></div>
    `;

    data.alerts.forEach(alert => {
      htmlBody += `
        <div class="alert ${alert.severity}">
          <div class="alert-title">${alert.type.replace(/_/g, ' ').toUpperCase()}</div>
          <div class="alert-message">${alert.message}</div>
          ${alert.due_date ? `<div class="alert-date">Due: ${new Date(alert.due_date).toLocaleDateString('en-GB')}</div>` : ''}
        </div>
      `;
    });

    htmlBody += `</div>`;
  });

  htmlBody += `
            <a href="${process.env.APP_URL || 'https://app.premiso.io'}/companies-house-profiles" class="cta">View All Deadlines →</a>
          </div>
          
          <div class="footer">
            <p>This is an automated compliance alert from Premiso.</p>
            <p>You can manage your alert preferences in your account settings.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  return htmlBody;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    const { alerts, recipient_email } = body;

    if (!alerts || alerts.length === 0) {
      return Response.json({ error: 'No alerts provided' }, { status: 400 });
    }

    if (!recipient_email) {
      return Response.json({ error: 'recipient_email required' }, { status: 400 });
    }

    const htmlBody = formatDeadlineEmail(alerts, recipient_email);

    // Send email via Core integration
    const emailRes = await base44.integrations.Core.SendEmail({
      to: recipient_email,
      subject: `${alerts.length} Compliance Deadline${alerts.length !== 1 ? 's' : ''} — Action Required`,
      body: htmlBody,
      from_name: 'Premiso Compliance'
    });

    return Response.json({
      status: 'sent',
      recipient: recipient_email,
      alerts_sent: alerts.length
    });
  } catch (error) {
    console.error('[sendComplianceAlertEmail] Error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});