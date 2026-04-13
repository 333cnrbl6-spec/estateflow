import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Fetch all pending rent transactions
    const transactions = await base44.asServiceRole.entities.FinancialTransaction.filter({
      transaction_type: 'rent_payment',
      status: 'pending',
    });

    const tenants = await base44.asServiceRole.entities.Tenant.list('-created_date', 1000);
    const properties = await base44.asServiceRole.entities.Property.list('-created_date', 500);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const emailsSent = {
      pre_due: 0,
      due_today: 0,
      arrears_warning: 0,
    };

    for (const txn of transactions) {
      const dueDate = new Date(txn.due_date);
      dueDate.setHours(0, 0, 0, 0);

      const tenant = tenants.find(t => t.id === txn.tenant_id);
      const property = properties.find(p => p.id === txn.property_id);

      if (!tenant || !tenant.email) continue;

      const daysUntilDue = Math.floor((dueDate - today) / (1000 * 60 * 60 * 24));
      const daysOverdue = Math.floor((today - dueDate) / (1000 * 60 * 60 * 24));

      // 3-day pre-due notification
      if (daysUntilDue === 3) {
        await sendEmail(base44, {
          to: tenant.email,
          subject: `Rent Payment Due in 3 Days - ${property?.name || 'Your Property'}`,
          body: `
Hi ${tenant.full_name},

Your rent payment is due in 3 days on ${dueDate.toLocaleDateString()}.

**Payment Details:**
- Property: ${property?.name || 'N/A'}
- Amount Due: £${txn.amount?.toLocaleString() || 'TBC'}
- Due Date: ${dueDate.toLocaleDateString()}

Please ensure payment is made by the due date to avoid late payment charges.

If you have any questions, please contact your property manager.

Best regards,
Premiso Property Management`,
        });
        emailsSent.pre_due++;
      }

      // Payment due today notification
      if (daysUntilDue === 0) {
        await sendEmail(base44, {
          to: tenant.email,
          subject: `Rent Payment Due Today - ${property?.name || 'Your Property'}`,
          body: `
Hi ${tenant.full_name},

Your rent payment is due TODAY.

**Payment Details:**
- Property: ${property?.name || 'N/A'}
- Amount Due: £${txn.amount?.toLocaleString() || 'TBC'}
- Due Date: ${dueDate.toLocaleDateString()}

Please make payment immediately to avoid arrears charges.

If you have any questions or payment difficulties, please contact your property manager urgently.

Best regards,
Premiso Property Management`,
        });
        emailsSent.due_today++;
      }

      // Arrears warning (5+ days overdue)
      if (daysOverdue >= 5) {
        await sendEmail(base44, {
          to: tenant.email,
          subject: `⚠️ URGENT: Rent Payment in Arrears - ${property?.name || 'Your Property'}`,
          body: `
Hi ${tenant.full_name},

Your rent payment is now ${daysOverdue} days overdue.

**Arrears Details:**
- Property: ${property?.name || 'N/A'}
- Amount Due: £${txn.amount?.toLocaleString() || 'TBC'}
- Due Date: ${dueDate.toLocaleDateString()}
- Days Overdue: ${daysOverdue}

Failure to pay rent can result in:
- Late payment charges
- Formal eviction proceedings
- Damage to your rental history

Please make payment immediately. If you are experiencing financial difficulties, contact your property manager to discuss payment options.

If payment is not received within 3 days, formal action will be taken.

Best regards,
Premiso Property Management`,
        });
        emailsSent.arrears_warning++;

        // Create admin notification
        await base44.asServiceRole.entities.TenantNotification.create({
          tenant_id: txn.tenant_id,
          title: `⚠️ ${tenant.full_name} - Rent ${daysOverdue} Days Overdue`,
          message: `${tenant.full_name} at ${property?.name} is ${daysOverdue} days overdue on £${txn.amount} rent payment.`,
          notification_type: 'alert',
          is_read: false,
          sent_date: new Date().toISOString(),
          notes: `arrears:${txn.id}`,
        });
      }
    }

    return Response.json({
      success: true,
      emails_sent: emailsSent,
      total_sent: emailsSent.pre_due + emailsSent.due_today + emailsSent.arrears_warning,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Error sending rent notifications:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});

async function sendEmail(base44, { to, subject, body }) {
  try {
    await base44.asServiceRole.integrations.Core.SendEmail({
      to,
      subject,
      body,
      from_name: 'Premiso Property Management',
    });
  } catch (e) {
    console.error(`Failed to send email to ${to}:`, e.message);
  }
}