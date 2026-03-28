import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const url = new URL(req.url);
    const callId = url.searchParams.get('callId');

    const body = new URLSearchParams(await req.text());
    const callStatus = body.get('CallStatus');
    const callDuration = body.get('CallDuration');
    const recordingUrl = body.get('RecordingUrl');

    if (callId) {
      // Update call record with status and recording
      await base44.asServiceRole.entities.OutOfHoursCall.update(callId, {
        duration_minutes: callDuration ? Math.round(parseInt(callDuration) / 60) : 0,
        notes: recordingUrl ? `Recording: ${recordingUrl}` : '',
        action_taken:
          callStatus === 'completed' ? 'logged_and_email_sent' : 'logged_and_email_sent',
      });
    }

    // Return TwiML for interactive voice response
    const twiml = `<?xml version="1.0" encoding="UTF-8"?>
      <Response>
        <Say>Thank you for contacting our out of hours service. Your call has been logged.</Say>
        <Hangup/>
      </Response>`;

    return new Response(twiml, {
      headers: { 'Content-Type': 'application/xml' },
    });
  } catch (error) {
    console.error('Webhook error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});