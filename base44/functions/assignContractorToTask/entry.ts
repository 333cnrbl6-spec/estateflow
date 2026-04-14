import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { maintenance_request_id, contractor_email, notes } = await req.json();

    // Get maintenance request
    const maintenanceRequest = await base44.asServiceRole.entities.MaintenanceRequest.get(maintenance_request_id);
    if (!maintenanceRequest) {
      return Response.json({ error: 'Maintenance request not found' }, { status: 404 });
    }

    // Update request with contractor assignment
    await base44.asServiceRole.entities.MaintenanceRequest.update(maintenance_request_id, {
      assigned_contractor: contractor_email,
      status: 'assigned',
      assignment_notes: notes,
      assigned_date: new Date().toISOString(),
      assigned_by: user.email
    });

    console.log(`[Maintenance] Assigned contractor ${contractor_email} to request ${maintenance_request_id}`);

    // Send notification to contractor
    await base44.asServiceRole.integrations.Core.SendEmail({
      to: contractor_email,
      subject: `New Task Assigned: ${maintenanceRequest.title}`,
      body: `
        <h2>New Maintenance Task</h2>
        <p><strong>Task:</strong> ${maintenanceRequest.title}</p>
        <p><strong>Priority:</strong> ${maintenanceRequest.priority}</p>
        <p><strong>Description:</strong> ${maintenanceRequest.description}</p>
        ${notes ? `<p><strong>Notes:</strong> ${notes}</p>` : ''}
        <p>Please log in to the platform to view full details and start the task.</p>
      `
    });

    // Send notification to tenant
    const tenant = await base44.asServiceRole.entities.Tenant.get(maintenanceRequest.tenant_id);
    if (tenant) {
      await base44.asServiceRole.integrations.Core.SendEmail({
        to: tenant.email,
        subject: `Your Maintenance Request Has Been Assigned`,
        body: `
          <h2>Maintenance Request Update</h2>
          <p>Your maintenance request "<strong>${maintenanceRequest.title}</strong>" has been assigned to a contractor.</p>
          <p>You will receive further updates as work progresses. You can track the status in your tenant portal.</p>
        `
      });
    }

    return Response.json({
      success: true,
      message: 'Contractor assigned successfully'
    });
  } catch (error) {
    console.error('[Maintenance] Assignment error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});