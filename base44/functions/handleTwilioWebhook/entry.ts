import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const url = new URL(req.url);
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