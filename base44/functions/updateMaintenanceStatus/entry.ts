import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { request_id, status } = await req.json();

    // Fetch current request
    const requests = await base44.entities.MaintenanceRequest.list({ id: request_id });
    const request = requests[0];

    if (!request) {
      return Response.json({ error: 'Request not found' }, { status: 404 });
    }

    // Update request status
    await base44.entities.MaintenanceRequest.update(request_id, {
      status,
      ...(status === 'resolved' && { completed_date: new Date().toISOString() })
    });

    // Send notification to tenant about status change
    const statusMessages = {
      pending: 'Your request is pending review.',
      assigned: 'A contractor has been assigned to your request.',
      in_progress: 'Work is now in progress on your maintenance issue.',
      resolved: 'Work has been completed! Your contractor will follow up if needed.',
      closed: 'Your request has been closed.'
    };

    await base44.integrations.Core.SendEmail({
      to: request.contact_email,
      subject: `📋 Maintenance Request Update: ${status.toUpperCase()}`,
      body: `
Hi,

Here's an update on your maintenance request:

Request ID: ${request_id}
Issue: ${request.title}
New Status: ${status.toUpperCase()}

${statusMessages[status]}

${request.assigned_contractor_name ? `Contractor: ${request.assigned_contractor_name}` : ''}

If you have any questions, contact your property manager.

Best regards,
Premiso Management
      `.trim()
    });

    // Notify contractor if assigned
    if (request.assigned_contractor_id) {
      const vendors = await base44.entities.Vendor.list({ id: request.assigned_contractor_id });
      const vendor = vendors[0];

      await base44.integrations.Core.SendEmail({
        to: vendor.email,
        subject: `🔔 Maintenance Job Status Update: ${request.title}`,
        body: `
Hi ${vendor.name},

One of your assigned jobs has been updated:

Job: ${request.title}
Property: ${request.property_id}
Unit: ${request.unit_id}
New Status: ${status.toUpperCase()}

Tenant: ${request.contact_email} | ${request.contact_phone}

Log in to your contractor portal for more details.
      `.trim()
      });
    }

    return Response.json({ success: true, new_status: status });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});