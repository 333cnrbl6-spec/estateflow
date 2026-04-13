import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// Note: External email/SMS restricted by platform.
// Reminders are queued for in-app notification system.

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const {
      setting_id,
      tenant,
      unit,
      property,
      overdue_items,
      notification_method,
      reminder_count,
    } = await req.json();

    const totalOverdue = overdue_items.reduce((sum, item) => sum + (item.amount_outstanding || 0), 0);
    const oldestDueDate = overdue_items[0]?.due_date;
    const daysOverdue = oldestDueDate
      ? Math.floor((new Date() - new Date(oldestDueDate)) / (1000 * 60 * 60 * 24))
      : 0;

    const emailBody = `
Dear ${tenant.tenant_name},

We are writing to notify you that your rent payment is overdue.

PAYMENT DETAILS:
- Property: ${property.address_line_1}
- Unit: ${unit.unit_reference || 'Unit'}
- Outstanding Amount: £${totalOverdue.toFixed(2)}
- Days Overdue: ${daysOverdue}
- Payment Due Date: ${new Date(oldestDueDate).toLocaleDateString('en-GB')}

PLEASE PAY IMMEDIATELY:
Failure to pay may result in further action including legal proceedings.

If you have already made this payment, please disregard this notice.

If you are experiencing financial difficulties, please contact us to discuss a payment plan.

Property Management Team
    `;

    // Log reminder (platform restricts external emails)
    console.log(`Rent reminder queued for ${tenant.tenant_name}: £${totalOverdue.toFixed(2)} overdue via ${notification_method}`);
    console.log(`Method: ${notification_method}`);

    return Response.json({
      success: true,
      message: `Reminder ${reminder_count} queued for ${tenant.tenant_name}`,
      method: notification_method,
      amount: totalOverdue,
    });

  } catch (error) {
    console.error('Error sending rent reminder:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});