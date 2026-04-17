import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { event } = await req.json();
    
    if (event.type !== 'create') {
      return Response.json({ status: 'ignored', reason: 'not_create_event' });
    }

    // Fetch the new meeting
    const meeting = await base44.entities.BoardMeeting.get(event.entity_id);
    
    if (!meeting || !meeting.attendees?.length) {
      return Response.json({ status: 'skipped', reason: 'no_attendees' });
    }

    // Create notifications for each attendee
    const notificationCount = await Promise.all(
      meeting.attendees.map(attendeeEmail => 
        base44.asServiceRole.entities.Notification.create({
          recipient_email: attendeeEmail,
          type: 'board_invitation',
          title: `Invited to Board Meeting: ${meeting.title}`,
          message: `You have been invited to join "${meeting.title}" called by ${meeting.called_by}. The meeting is scheduled for ${new Date(meeting.meeting_date).toLocaleString()}.`,
          board_meeting_id: meeting.id,
          triggered_by: meeting.called_by,
          action_url: '/boardroom',
          read: false
        })
      )
    );

    return Response.json({
      status: 'success',
      meeting_id: event.entity_id,
      notifications_created: notificationCount.length
    });

  } catch (error) {
    console.error('Error notifying board meeting invites:', error);
    return Response.json({ 
      error: error.message,
      status: 'failed'
    }, { status: 500 });
  }
});