import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { maintenance_request_id, message_text, sender_email, sender_name } = await req.json();

    // Create message record
    const message = await base44.asServiceRole.entities.Message.create({
      entity_type: 'maintenance_request',
      entity_id: maintenance_request_id,
      sender_email,
      sender_name,
      message_text,
      created_date: new Date().toISOString()
    });

    console.log(`[Maintenance Chat] Message created ${message.id} on request ${maintenance_request_id}`);

    return Response.json({
      success: true,
      messageId: message.id
    });
  } catch (error) {
    console.error('[Maintenance Chat] Error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});