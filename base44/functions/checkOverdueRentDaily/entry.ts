import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Fetch all non-paid invoices
    const invoices = await base44.asServiceRole.entities.Invoice.filter({
      status: { $ne: 'paid' }
    }, '-submitted_date', 500);

    const today = new Date();
    const overdueInvoices = [];
    const remindersSent = [];

    for (const invoice of invoices) {
      const submittedDate = new Date(invoice.submitted_date);
      const daysOverdue = Math.floor((today - submittedDate) / (1000 * 60 * 60 * 24));

      // Send reminder if 7 days overdue, again at 14 days, and again at 30+ days
      const shouldSendReminder = daysOverdue === 7 || daysOverdue === 14 || daysOverdue >= 30;

      if (daysOverdue > 0) {
        overdueInvoices.push({
          invoiceId: invoice.id,
          daysOverdue,
          amount: invoice.amount,
        });

        if (shouldSendReminder) {
          try {
            // Fetch tenant
            const tenant = await base44.asServiceRole.entities.Tenant.get(invoice.contractor_id);
            
            if (tenant && tenant.email) {
              const severity = daysOverdue >= 30 ? 'URGENT' : 'REMINDER';
              const subject = `${severity}: Overdue Rent Payment - £${invoice.amount}`;
              
              const body = `
Dear ${tenant.name},

${daysOverdue >= 30 ? 'URGENT: ' : ''}Your rent payment is ${daysOverdue} days overdue.

Invoice Details:
- Amount: £${invoice.amount}
- Days Overdue: ${daysOverdue}
- Invoice Reference: ${invoice.id.slice(0, 8)}

Please arrange immediate payment to avoid further action.

If already paid, please disregard this notice.

Property Management Team
              `;

              await base44.asServiceRole.integrations.Core.SendEmail({
                to: tenant.email,
                subject: subject,
                body: body,
              });

              remindersSent.push({
                invoiceId: invoice.id,
                tenantEmail: tenant.email,
                daysOverdue,
              });
            }
          } catch (error) {
            console.error(`Error processing invoice ${invoice.id}:`, error);
          }
        }
      }
    }

    return Response.json({
      success: true,
      overdueInvoicesFound: overdueInvoices.length,
      remindersSent: remindersSent.length,
      details: {
        overdue: overdueInvoices,
        reminders: remindersSent,
      },
    });
  } catch (error) {
    console.error('Daily overdue check error:', error);
    return Response.json(
      { error: error.message || 'Failed to check overdue invoices' },
      { status: 500 }
    );
  }
});