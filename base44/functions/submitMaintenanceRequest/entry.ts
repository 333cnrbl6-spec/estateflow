import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { tenant_id, property_id, title, description, priority, attachment_urls } = await req.json();

    // Verify tenant exists
    const tenant = await base44.asServiceRole.entities.Tenant.get(tenant_id);
    if (!tenant) {
      return Response.json({ error: 'Tenant not found' }, { status: 404 });
    }

    // Create maintenance request
    const maintenanceRequest = await base44.asServiceRole.entities.MaintenanceRequest.create({
      title,
      description,
      property_id,
      unit_id: tenant.unit_id,
      tenant_id,
      priority: priority || 'medium',
      status: 'pending',
      created_by: user.email,
      attachment_urls: attachment_urls || [],
      notes: `Submitted by tenant ${tenant.full_name} (${tenant.email})`
    });

    console.log(`[Maintenance] Created request ${maintenanceRequest.id} from tenant ${tenant_id}`);

    // Send notification to property managers
    const propertyUsers = await base44.asServiceRole.entities.User.list();
    const propertyManagers = propertyUsers.filter(u => 
      (u.role === 'admin' || u.role === 'property_manager') && u.email !== user.email
    );

    for (const pm of propertyManagers) {
      await base44.asServiceRole.integrations.Core.SendEmail({
        to: pm.email,
        subject: `New Maintenance Request: ${title}`,
        body: `
          <h2>New Maintenance Request</h2>
          <p><strong>Property:</strong> ${tenant.property_id}</p>
          <p><strong>Unit:</strong> ${tenant.unit_id}</p>
          <p><strong>Tenant:</strong> ${tenant.full_name} (${tenant.email})</p>
          <p><strong>Issue:</strong> ${title}</p>
          <p><strong>Priority:</strong> ${priority}</p>
          <p><strong>Description:</strong></p>
          <p>${description}</p>
          ${attachment_urls && attachment_urls.length > 0 ? `
            <p><strong>Attachments:</strong> ${attachment_urls.length} file(s) attached</p>
          ` : ''}
          <p>Please review and assign a contractor as soon as possible.</p>
        `
      });
    }

    return Response.json({
      success: true,
      maintenanceRequestId: maintenanceRequest.id
    });
  } catch (error) {
    console.error('[Maintenance] Error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});