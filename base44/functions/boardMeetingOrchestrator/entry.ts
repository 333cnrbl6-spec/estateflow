import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { action, topic, attendees, meeting_id, member, response, recommendation } = await req.json();

    // Create new meeting
    if (action === 'create') {
      const meeting = await base44.entities.BoardMeeting.create({
        title: topic,
        called_by: user.email,
        meeting_date: new Date().toISOString(),
        attendees: attendees,
        status: 'in_progress',
        agenda_items: [],
        discussion_threads: []
      });

      // Notify each attendee (invoke their agent functions)
      for (const attendee of attendees) {
        try {
          await base44.asServiceRole.functions.invoke('memberResponse', {
            meeting_id: meeting.id,
            member: attendee,
            topic: topic
          });
        } catch (err) {
          console.log(`Could not reach ${attendee}`);
        }
      }

      return Response.json({ meeting_id: meeting.id, status: 'meeting_created' });
    }

    // Add member response
    if (action === 'add_response') {
      const meeting = await base44.entities.BoardMeeting.get(meeting_id);
      
      if (!meeting.discussion_threads) {
        meeting.discussion_threads = [];
      }

      meeting.discussion_threads.push({
        from: member,
        timestamp: new Date().toISOString(),
        content: response,
        recommendation: recommendation
      });

      await base44.entities.BoardMeeting.update(meeting_id, {
        discussion_threads: meeting.discussion_threads
      });

      return Response.json({ status: 'response_recorded' });
    }

    // Conclude meeting & record decisions
    if (action === 'conclude') {
      const { decisions } = await req.json();
      
      await base44.entities.BoardMeeting.update(meeting_id, {
        status: 'concluded',
        decisions: decisions
      });

      return Response.json({ status: 'meeting_concluded' });
    }

    return Response.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});