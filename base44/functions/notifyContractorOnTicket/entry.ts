import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { event_data } = await req.json();

    // Only send email when assigned (status changes to 'assigned')
    if (event_data.data?.status !== 'assigned' || !event_data.data?.assigned_contractor_email) {
      return Response.json({ success: false, reason: 'Not assigned yet or no contractor email' });
    }

    const ticket = event_data.data;
    const property = ticket.property_id ? await base44.entities.Property.get(ticket.property_id) : null;

    const emailBody = `
Dear ${ticket.assigned_contractor_name},

A new maintenance request has been assigned to you.

**Ticket Details:**
- Title: ${ticket.title}
- Priority: ${ticket.priority}
- Category: ${ticket.category?.replace(/_/g, ' ')}
- Property: ${property?.name || 'N/A'}
- Unit: ${ticket.unit_id || 'N/A'}

**Description:**
${ticket.description}

**Scheduled Date:** ${ticket.scheduled_date || 'To be confirmed'}
**Estimated Cost:** £${ticket.estimated_cost || 'TBD'}

Please acknowledge receipt and confirm your availability. If you have any questions, please contact the property manager.

Best regards,
Property Management System
    `.trim();

    const response = await base44.integrations.Core.SendEmail({
      to: ticket.assigned_contractor_email,
      subject: `[URGENT] New Maintenance Request: ${ticket.title}`,
      body: emailBody,
      from_name: 'Property Management'
    });

    return Response.json({
      success: true,
      contractor: ticket.assigned_contractor_name,
      email_sent_to: ticket.assigned_contractor_email
    });
  } catch (error) {
    console.error('Error notifying contractor:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});