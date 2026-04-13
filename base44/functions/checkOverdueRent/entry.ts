import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Admin access required' }, { status: 403 });
    }

    // Fetch all active reminder settings
    const reminderSettings = await base44.asServiceRole.entities.RentPaymentReminder.filter(
      { is_active: true },
      '-updated_date',
      1000
    );

    const today = new Date();
    const remindersToSend = [];

    // Check each tenant for overdue rent
    for (const setting of reminderSettings) {
      try {
        // Fetch tenant
        const tenant = await base44.asServiceRole.entities.Tenant.get(setting.tenant_id);
        if (!tenant) continue;

        // Fetch unit
        const unit = await base44.asServiceRole.entities.Unit.get(setting.unit_id);
        if (!unit) continue;

        // Fetch property
        const property = await base44.asServiceRole.entities.Property.get(setting.property_id);
        if (!property) continue;

        // Get outstanding rent (all unpaid balances)
        const rentLedger = await base44.asServiceRole.entities.RentLedger.filter(
          { unit_id: setting.unit_id, tenant_id: setting.tenant_id },
          '-due_date',
          100
        );

        // Find overdue items
        const overdue = rentLedger.filter(entry => {
          const dueDate = new Date(entry.due_date);
          const gracePeriodEnd = new Date(dueDate);
          gracePeriodEnd.setDate(gracePeriodEnd.getDate() + setting.grace_period_days);
          
          return entry.status === 'pending' && gracePeriodEnd <= today;
        });

        if (overdue.length === 0) continue;

        // Check if reminder should be sent based on frequency
        const lastReminder = setting.last_reminder_sent ? new Date(setting.last_reminder_sent) : null;
        const daysSinceLastReminder = lastReminder 
          ? Math.floor((today - lastReminder) / (1000 * 60 * 60 * 24))
          : null;

        const shouldSend = 
          !lastReminder ||
          daysSinceLastReminder >= setting.reminder_frequency_days;

        const exceedsMax = (setting.reminder_count || 0) >= setting.max_reminders;

        if (!shouldSend) continue;
        if (exceedsMax) {
          // Mark for escalation
          await base44.asServiceRole.entities.RentPaymentReminder.update(setting.id, {
            escalation_triggered: true,
          });
          continue;
        }

        // Queue reminder
        remindersToSend.push({
          setting_id: setting.id,
          tenant,
          unit,
          property,
          overdue_items: overdue,
          notification_method: setting.notification_method,
          grace_period: setting.grace_period_days,
          reminder_count: (setting.reminder_count || 0) + 1,
        });

      } catch (error) {
        console.error(`Error processing reminder for ${setting.tenant_id}:`, error);
      }
    }

    // Send all queued reminders
    const sent = [];
    for (const reminder of remindersToSend) {
      try {
        await base44.asServiceRole.functions.invoke('sendRentReminder', reminder);
        sent.push(reminder.setting_id);

        // Update reminder settings
        await base44.asServiceRole.entities.RentPaymentReminder.update(reminder.setting_id, {
          last_reminder_sent: today.toISOString(),
          reminder_count: reminder.reminder_count,
        });
      } catch (error) {
        console.error(`Failed to send reminder for setting ${reminder.setting_id}:`, error);
      }
    }

    return Response.json({
      success: true,
      message: `Checked ${reminderSettings.length} settings, sent ${sent.length} reminders`,
      reminders_sent: sent.length,
    });

  } catch (error) {
    console.error('Error in checkOverdueRent:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});