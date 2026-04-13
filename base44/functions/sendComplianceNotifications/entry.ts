import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { task_ids } = await req.json();

    const tasks = await base44.entities.ComplianceTask.filter({
      id: { $in: task_ids || [] },
      status: { $in: ['pending', 'reminder_needed'] }
    });

    const notifications = [];

    for (const task of tasks) {
      // Fetch property and related contacts
      const property = await base44.entities.Property.filter({ id: task.property_id });
      if (property.length === 0) continue;

      const prop = property[0];

      // Find landlord/owner
      const company = await base44.entities.Company.filter({ id: prop.owning_company });
      const contacts = await base44.entities.Contact.filter({
        related_company_id: prop.owning_company,
        contact_type: { $in: ['landlord', 'director'] }
      });

      // Find contractors for this certificate type
      const contractors = await base44.entities.Contact.filter({
        contact_type: 'contractor',
        related_company_id: prop.owning_company
      });

      // Send notifications based on urgency
      if (task.priority === 'overdue') {
        // Send urgent email to landlord and contractors
        for (const contact of [...contacts, ...contractors]) {
          if (contact.email) {
            notifications.push(await sendUrgentNotification(contact, task, prop));
          }
        }
      } else if (task.priority === 'warning' && task.days_until_expiry <= 14) {
        // Send reminder email
        for (const contact of contacts) {
          if (contact.email) {
            notifications.push(await sendReminderEmail(contact, task, prop));
          }
        }
      }

      // Update task status
      await base44.entities.ComplianceTask.update(task.id, {
        status: task.priority === 'overdue' ? 'escalated' : 'reminder_sent',
        last_reminder_sent: new Date().toISOString()
      });
    }

    return Response.json({
      success: true,
      notifications_sent: notifications.length,
      tasks_updated: tasks.length
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});

async function sendUrgentNotification(contact, task, property) {
  try {
    const emailBody = `
URGENT: Compliance Certificate Renewal Required

Property: ${property.name || property.address_line_1}
Certificate Type: ${task.certificate_type.toUpperCase()}
Status: OVERDUE

Action Required:
Your ${task.certificate_type} certificate has expired and requires immediate renewal.

Estimated Cost: £${task.estimated_cost}
Next Steps:
1. Contact an approved contractor immediately
2. Schedule inspection within 48 hours
3. Upload renewed certificate once completed

Failure to renew may result in:
- Legal penalties
- Tenant safety issues
- Property management disruption

Contact support for contractor recommendations.
    `.trim();

    // Send via email integration
    await base44.integrations.Core.SendEmail({
      to: contact.email,
      subject: `🚨 URGENT: ${task.certificate_type.toUpperCase()} Renewal Required - ${property.name || 'Property'}`,
      body: emailBody,
      from_name: 'Premiso Compliance'
    });

    return {
      contact: contact.email,
      type: 'urgent',
      sent_at: new Date().toISOString()
    };
  } catch (error) {
    console.error('Failed to send urgent notification:', error);
    return null;
  }
}

async function sendReminderEmail(contact, task, property) {
  try {
    const emailBody = `
Compliance Reminder: Certificate Renewal Due

Property: ${property.name || property.address_line_1}
Certificate Type: ${task.certificate_type.toUpperCase()}
Days Until Expiry: ${task.days_until_expiry}

Action Required:
Your ${task.certificate_type} certificate expires in ${task.days_until_expiry} days.

Estimated Cost: £${task.estimated_cost}
Recommended Actions:
1. Contact approved contractors to schedule inspection
2. Book inspection for ${Math.max(1, task.days_until_expiry - 7)} days from now
3. Plan budget for renewal (approximately £${task.estimated_cost})

Early renewal ensures:
- No service disruption
- Compliance with regulations
- Tenant confidence and safety

View more details in your Premiso dashboard.
    `.trim();

    await base44.integrations.Core.SendEmail({
      to: contact.email,
      subject: `Reminder: ${task.certificate_type.toUpperCase()} Renewal Due in ${task.days_until_expiry} Days - ${property.name || 'Property'}`,
      body: emailBody,
      from_name: 'Premiso Compliance'
    });

    return {
      contact: contact.email,
      type: 'reminder',
      sent_at: new Date().toISOString()
    };
  } catch (error) {
    console.error('Failed to send reminder email:', error);
    return null;
  }
}