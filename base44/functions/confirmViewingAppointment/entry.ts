import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { viewing_id } = await req.json();

    if (!viewing_id) {
      return Response.json({ error: 'Viewing ID required' }, { status: 400 });
    }

    // Get viewing details
    const viewing = await base44.entities.ViewingAppointment.get(viewing_id);
    if (!viewing) {
      return Response.json({ error: 'Viewing not found' }, { status: 404 });
    }

    // Get listing details
    const listing = await base44.entities.SalesListing.get(viewing.sales_listing_id);

    const appointmentDate = new Date(viewing.scheduled_date);
    const formattedDate = appointmentDate.toLocaleDateString('en-GB', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
    const formattedTime = appointmentDate.toLocaleTimeString('en-GB', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });

    // Send confirmation SMS
    if (viewing.contact_phone) {
      const smsResult = await base44.functions.invoke('sendSalesSMS', {
        contact_phone: viewing.contact_phone,
        message: `Viewing confirmed for ${listing?.property_id || 'property'} on ${formattedDate} at ${formattedTime}. ${viewing.meeting_instructions || 'We look forward to seeing you!'}`,
        listing_address: listing?.marketing_text?.substring(0, 50),
      });

      if (smsResult.data?.success) {
        await base44.entities.ViewingAppointment.update(viewing_id, {
          reminder_sent: true,
          reminder_sent_at: new Date().toISOString(),
        });
      }
    }

    // Create communication record
    const communication = await base44.entities.SalesCommunication.create({
      sales_listing_id: viewing.sales_listing_id,
      sales_lead_id: viewing.sales_lead_id,
      thread_id: `viewing_${viewing_id}`,
      sender_type: 'agent',
      sender_id: user.id,
      sender_name: user.full_name,
      sender_email: user.email,
      recipient_type: 'buyer',
      recipient_id: viewing.contact_id,
      recipient_name: viewing.contact_name,
      recipient_email: viewing.contact_email,
      subject: `Viewing Confirmation - ${formattedDate} at ${formattedTime}`,
      body: `Dear ${viewing.contact_name},\n\nYour viewing has been confirmed:\n\nDate: ${formattedDate}\nTime: ${formattedTime}\nDuration: ${viewing.duration_minutes} minutes\nType: ${viewing.appointment_type.replace(/_/g, ' ')}\n\n${viewing.meeting_instructions ? 'Meeting Instructions:\n' + viewing.meeting_instructions + '\n\n' : ''}Please arrive 5 minutes early. If you need to reschedule, please contact us as soon as possible.\n\nBest regards,\n${viewing.agent_name}`,
      message_type: 'viewing_confirmation',
      status: 'sent',
      is_sms_sent: viewing.reminder_sent,
    });

    return Response.json({ 
      success: true, 
      communication_id: communication.id,
      viewing_status: viewing.status 
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});