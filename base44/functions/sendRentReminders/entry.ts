import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Get all tenants and recurring payments
    const [tenants, recurringPayments, rentLedgers] = await Promise.all([
      base44.asServiceRole.entities.Tenant.list(),
      base44.asServiceRole.entities.RecurringPayment.list(),
      base44.asServiceRole.entities.RentLedger.list()
    ]);

    const today = new Date();
    const threeDaysLater = new Date(today);
    threeDaysLater.setDate(threeDaysLater.getDate() + 3);

    const remindersSent = [];

    // Check each recurring payment for rent due in 3 days
    for (const payment of recurringPayments || []) {
      if (payment.type !== 'rent') continue;
      if (payment.status !== 'active') continue;

      const tenant = tenants?.find(t => t.id === payment.tenant_id);
      if (!tenant || !tenant.email) continue;

      // Check if payment due date is approximately 3 days away
      const nextDueDate = new Date(payment.next_due_date);
      const daysUntilDue = Math.ceil((nextDueDate - today) / (1000 * 60 * 60 * 24));

      if (daysUntilDue === 3) {
        // Calculate outstanding balance
        const tenantLedgers = rentLedgers?.filter(l => l.tenant_id === payment.tenant_id) || [];
        const outstandingBalance = tenantLedgers.reduce((sum, ledger) => {
          return sum + (ledger.balance_due || 0);
        }, 0);

        // Generate secure payment portal link
        const portalUrl = `${Deno.env.get('APP_URL')}/tenant-payments?token=${tenant.id}`;

        // Send email
        await base44.integrations.Core.SendEmail({
          to: tenant.email,
          subject: `Rent Payment Due in 3 Days - ${nextDueDate.toLocaleDateString('en-GB')}`,
          body: `<html>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
              <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                <h2 style="color: #2c3e50;">Hello ${tenant.full_name},</h2>
                
                <p>This is a friendly reminder that your rent payment is due in <strong>3 days</strong>.</p>
                
                <div style="background-color: #f8f9fa; border-left: 4px solid #3498db; padding: 15px; margin: 20px 0;">
                  <p><strong>Payment Due Date:</strong> ${nextDueDate.toLocaleDateString('en-GB')}</p>
                  <p><strong>Outstanding Balance:</strong> £${(outstandingBalance / 100).toFixed(2)}</p>
                  <p><strong>Property:</strong> ${payment.property_name || 'Your Property'}</p>
                </div>

                <p style="margin: 20px 0;">
                  <a href="${portalUrl}" style="background-color: #27ae60; color: white; padding: 12px 30px; text-decoration: none; border-radius: 4px; display: inline-block; font-weight: bold;">
                    Pay Now
                  </a>
                </p>

                <p style="color: #7f8c8d; font-size: 14px;">
                  If you've already made this payment, please disregard this message. If you have any questions about your account, please contact our support team.
                </p>

                <hr style="border: none; border-top: 1px solid #ecf0f1; margin: 20px 0;">
                <p style="color: #95a5a6; font-size: 12px; margin: 0;">
                  This is an automated message. Please do not reply to this email.
                </p>
              </div>
            </body>
          </html>`
        });

        remindersSent.push({
          tenant_id: tenant.id,
          tenant_email: tenant.email,
          amount: outstandingBalance,
          due_date: nextDueDate.toISOString()
        });
      }
    }

    return Response.json({
      success: true,
      remindersSent: remindersSent.length,
      details: remindersSent
    });

  } catch (error) {
    console.error('Rent reminder error:', error);
    return Response.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
});