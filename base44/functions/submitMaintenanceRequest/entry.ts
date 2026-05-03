import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const {
      property_id,
      unit_id,
      tenant_id,
      title,
      description,
      category,
      priority,
      contact_email,
      contact_phone
    } = await req.json();

    // Create maintenance request
    const maintenanceRequest = await base44.entities.MaintenanceRequest.create({
      property_id,
      unit_id,
      tenant_id,
      title,
      description,
      category,
      priority,
      status: 'pending',
      contact_email,
      contact_phone
    });

    // Get property & manager details for notification
    const property = await base44.entities.Property.list({ id: property_id });
    const managerEmail = property[0]?.manager_email || 'manager@premiso.io';

    // Send notification to manager
    await base44.integrations.Core.SendEmail({
      to: managerEmail,
      subject: `🔧 New ${priority === 'emergency' ? 'URGENT ' : ''}Maintenance Request: ${title}`,
      body: `
A new maintenance request has been submitted:

Property: ${property[0]?.name || property_id}
Unit: ${unit_id}
Priority: ${priority.toUpperCase()}
Category: ${category}

Issue: ${title}
Details: ${description}

Tenant Contact: ${contact_email} | ${contact_phone}

Action Required: Log in to assign a contractor and schedule the work.
Status: Pending Assignment
      `.trim()
    });

    // Send confirmation to tenant
    await base44.integrations.Core.SendEmail({
      to: contact_email,
      subject: '✓ Maintenance Request Received',
      body: `
Hi,

Your maintenance request has been received and assigned ID: ${maintenanceRequest.id}

What you reported: ${title}
Priority: ${priority}

A property manager will review your request and contact you within 24 hours to schedule the work.

In the meantime, here's what you can do:
- Ensure access to the affected area
- Document the issue with photos if possible
- Keep this confirmation for reference

Questions? Contact your property manager directly.

Best regards,
Premiso Management
      `.trim()
    });

    await base44.functions.invoke('auditLog', {
      event_type: 'maintenance_request_submitted',
      details: {
        request_id: maintenanceRequest.id,
        property_id,
        priority
      }
    });

    return Response.json({ request_id: maintenanceRequest.id, status: 'pending' });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});