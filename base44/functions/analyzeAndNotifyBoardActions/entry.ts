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

    // Prepare discussion summary for AI analysis
    const discussionText = meeting.discussion_threads
      .map(t => `${t.from}: ${t.content}\nRecommendation: ${t.recommendation || 'None'}`)
      .join('\n\n');

    // Use AI to analyze discussions and extract action items
    const analysis = await base44.integrations.Core.InvokeLLM({
      prompt: `You are a strategic business analyst. Analyze the following board meeting discussion and extract:
1. Specific action items that need to be taken
2. Who should be responsible for each action (owner)
3. Suggested deadline (if any)
4. Priority level (high, medium, low)
5. Clear, concise decision summary

Meeting Topic: ${meeting.title}

Discussion:
${discussionText}

Format your response as a JSON object with:
{
  "actions": [
    {
      "item": "Action description",
      "owner": "Agent/Person responsible",
      "deadline": "Date (7 days from now format YYYY-MM-DD) or null",
      "priority": "high|medium|low"
    }
  ],
  "decisions": [
    {
      "item": "Decision topic",
      "decision": "Clear decision statement",
      "implementation_owner": "Primary owner"
    }
  ]
}`,
      response_json_schema: {
        type: 'object',
        properties: {
          actions: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                item: { type: 'string' },
                owner: { type: 'string' },
                deadline: { type: ['string', 'null'] },
                priority: { type: 'string', enum: ['high', 'medium', 'low'] }
              }
            }
          },
          decisions: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                item: { type: 'string' },
                decision: { type: 'string' },
                implementation_owner: { type: 'string' }
              }
            }
          }
        }
      }
    });

    // Extract action items and decisions from AI response
    const { actions = [], decisions = [] } = analysis || {};

    // Update meeting with analyzed decisions
    const updatedMeeting = await base44.entities.BoardMeeting.update(event.entity_id, {
      decisions: decisions.map(d => ({
        ...d,
        voted_by: meeting.attendees || []
      }))
    });

    // Create task notifications for each action owner
    if (actions.length > 0) {
      const uniqueOwners = [...new Set(actions.map(a => a.owner))];
      
      for (const owner of uniqueOwners) {
        const ownerActions = actions.filter(a => a.owner === owner);
        
        try {
          // Create a notification or task in the system
          await base44.integrations.Core.SendEmail({
            to: owner, // Assuming owner is an email
            subject: `Action Items from Board Meeting: ${meeting.title}`,
            body: `You have been assigned ${ownerActions.length} action item(s) from the board meeting "${meeting.title}".

${ownerActions.map((action, i) => `${i + 1}. ${action.item}
   Priority: ${action.priority}
   ${action.deadline ? `Deadline: ${action.deadline}` : 'Deadline: Not specified'}`).join('\n\n')}

Please log in to the Boardroom to view details and track progress.`
          });
        } catch (emailErr) {
          console.log(`Could not email ${owner}, likely not an email address`);
        }
      }
    }

    return Response.json({
      status: 'success',
      meeting_id: event.entity_id,
      actions_extracted: actions.length,
      decisions_recorded: decisions.length,
      action_owners_notified: [...new Set(actions.map(a => a.owner))].length
    });

  } catch (error) {
    console.error('Error analyzing board meeting:', error);
    return Response.json({ 
      error: error.message,
      status: 'failed'
    }, { status: 500 });
  }
});