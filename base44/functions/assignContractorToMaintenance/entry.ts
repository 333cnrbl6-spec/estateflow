import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { request_id, contractor_id } = await req.json();

    // Fetch request & contractor
    const requests = await base44.entities.MaintenanceRequest.list({ id: request_id });
    const request = requests[0];

    const vendors = await base44.entities.Vendor.list({ id: contractor_id });
    const vendor = vendors[0];

    if (!request || !vendor) {
      return Response.json({ error: 'Request or contractor not found' }, { status: 404 });
    }

    // Update request with contractor assignment
    await base44.entities.MaintenanceRequest.update(request_id, {
      assigned_contractor_id: contractor_id,
      assigned_contractor_name: vendor.name,
      assigned_at: new Date().toISOString(),
      status: 'assigned'
    });

    // Notify contractor
    await base44.integrations.Core.SendEmail({
      to: vendor.email,
      subject: `🔧 New Job Assigned: ${request.title}`,
      body: `
Hi ${vendor.name},

A new maintenance job has been assigned to you:

Job ID: ${request_id}
Issue: ${request.title}
Category: ${request.category}
Priority: ${request.priority.toUpperCase()}

Property Details:
Property: ${request.property_id}
Unit: ${request.unit_id}

Tenant Contact:
Email: ${request.contact_email}
Phone: ${request.contact_phone}

Details:
${request.description}

Please contact the tenant to arrange a convenient time for the work.
Update the job status in your contractor portal as work progresses.
      `.trim()
    });

    // Notify tenant of contractor assignment
    await base44.integrations.Core.SendEmail({
      to: request.contact_email,
      subject: `✓ Contractor Assigned: ${request.title}`,
      body: `
Hi,

Good news! A contractor has been assigned to fix your issue.

Contractor: ${vendor.name}
Phone: ${vendor.phone}
Email: ${vendor.email}

Issue: ${request.title}
Priority: ${request.priority}

The contractor will contact you shortly to schedule a convenient time for the work.

Best regards,
Premiso Management
      `.trim()
    });

    return Response.json({
      success: true,
      contractor_name: vendor.name,
      contractor_email: vendor.email
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});