import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // SECURITY: a telephony webhook cannot require a login, so the caller is verified with a
    // shared secret instead of being trusted anonymously.
    const webhookSecret = Deno.env.get('TELEPHONY_WEBHOOK_SECRET');
    if (!webhookSecret) {
      console.error('[handleTwilioWebhook] TELEPHONY_WEBHOOK_SECRET is not configured');
      return Response.json({ error: 'Webhook secret not configured' }, { status: 503 });
    }

    const url = new URL(req.url);
    const suppliedSecret = url.searchParams.get('secret') || req.headers.get('x-webhook-secret');
    if (suppliedSecret !== webhookSecret) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const callId = url.searchParams.get('callId');

    // Parse RingCentral webhook payload
    const body = await req.json();
    const callStatus = body.status || 'unknown';
    const callDuration = body.duration || 0;
    const recordingUrl = body.recording?.uri || null;
    const callerId = body.from?.phoneNumber || 'unknown';

    if (callId) {
      // Update call record with status and recording
      await base44.asServiceRole.entities.OutOfHoursCall.update(callId, {
        duration_minutes: callDuration ? Math.round(callDuration / 60) : 0,
        notes: recordingUrl ? `Recording: ${recordingUrl}` : '',
        action_taken: callStatus === 'Completed' ? 'logged_and_email_sent' : 'logged_and_email_sent',
      });
    }

    return Response.json({
      success: true,
      message: 'Call webhook processed successfully',
    });
  } catch (error) {
    console.error('Webhook error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});