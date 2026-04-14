import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { taskId, vendorId, scheduledDate } = await req.json();

    // Fetch task and vendor
    const task = await base44.asServiceRole.entities.MaintenanceOrder?.get?.(taskId);
    const vendor = await base44.asServiceRole.entities.Vendor?.get?.(vendorId);

    if (!task || !vendor) {
      return Response.json({ error: 'Task or vendor not found' }, { status: 404 });
    }

    // Update task with vendor assignment
    const updated = await base44.asServiceRole.entities.MaintenanceOrder?.update?.(taskId, {
      assigned_to_vendor: vendorId,
      assigned_vendor_name: vendor.name,
      scheduled_date: scheduledDate,
      status: 'assigned'
    });

    // Create notification task for vendor
    await base44.asServiceRole.entities.Task?.create?.({
      title: `[MAINTENANCE] ${task.title}`,
      description: `Scheduled maintenance task\n\nProperty: ${task.property_id}\nDate: ${new Date(scheduledDate).toLocaleDateString()}\n\nDetails: ${task.description}`,
      property_id: task.property_id,
      assigned_to: vendor.email || vendor.contact_email,
      assigned_by: 'system',
      status: 'pending',
      priority: task.priority || 'medium',
      deadline: scheduledDate,
      linked_entity_type: 'maintenance_request',
      linked_entity_id: taskId,
      category: 'maintenance'
    }).catch(() => null);

    // Send email to vendor
    const vendorEmail = vendor.email || vendor.contact_email;
    if (vendorEmail) {
      await base44.integrations.Core.SendEmail({
        to: vendorEmail,
        subject: `New Maintenance Assignment: ${task.title}`,
        body: `
Dear ${vendor.contact_name || vendor.name},

You have been assigned a new maintenance task.

Task: ${task.title}
Scheduled Date: ${new Date(scheduledDate).toLocaleDateString()}
Priority: ${task.priority || 'Medium'}

Location: ${task.property_id}

Description:
${task.description}

Please confirm your availability and let us know if you have any questions.

Best regards,
Maintenance Scheduling Team
        `
      }).catch(() => null);
    }

    return Response.json({
      success: true,
      task_id: taskId,
      vendor_id: vendorId,
      scheduled_date: scheduledDate,
      vendor_name: vendor.name
    });
  } catch (error) {
    console.error('Assignment error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});