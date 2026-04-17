import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { event } = await req.json();
    
    if (event.type !== 'update') {
      return Response.json({ status: 'ignored', reason: 'not_update_event' });
    }

    // Fetch the updated meeting
    const meeting = await base44.entities.BoardMeeting.get(event.entity_id);
    
    if (!meeting || !meeting.discussion_threads?.length) {
      return Response.json({ status: 'skipped', reason: 'no_discussions' });
    }

    // Get the latest discussion thread
    const latestThread = meeting.discussion_threads[meeting.discussion_threads.length - 1];
    
    if (!latestThread) {
      return Response.json({ status: 'skipped', reason: 'no_latest_thread' });
    }

    // Check for mentions in discussion content (format: @AgentName or @email)
    const mentionRegex = /@([\w\-\.@]+)/g;
    const mentions = [...(latestThread.content?.match(mentionRegex) || [])];
    
    if (mentions.length === 0) {
      return Response.json({ status: 'skipped', reason: 'no_mentions' });
    }

    // Extract mentioned members (remove @ symbol)
    const mentionedMembers = mentions.map(m => m.substring(1));
    
    // Get all board members to validate mentions
    const boardMembers = await base44.asServiceRole.entities.BoardMember.list();
    const memberMap = new Map(boardMembers.map(m => [m.member_name, m.email]));

    // Create notifications for mentioned members
    const notificationCount = await Promise.all(
      mentionedMembers
        .filter(mention => memberMap.has(mention) || mention.includes('@')) // Valid mention
        .map(mention => {
          const email = memberMap.has(mention) ? memberMap.get(mention) : mention;
          return base44.asServiceRole.entities.Notification.create({
            recipient_email: email,
            type: 'discussion_mention',
            title: `You were mentioned in: ${meeting.title}`,
            message: `${latestThread.from} mentioned you in a discussion thread. "${latestThread.content?.substring(0, 100)}..."`,
            board_meeting_id: meeting.id,
            triggered_by: latestThread.from,
            action_url: '/boardroom',
            read: false
          });
        })
    );

    return Response.json({
      status: 'success',
      meeting_id: event.entity_id,
      mentions_found: mentionedMembers.length,
      notifications_created: notificationCount.length
    });

  } catch (error) {
    console.error('Error notifying board mentions:', error);
    return Response.json({ 
      error: error.message,
      status: 'failed'
    }, { status: 500 });
  }
});