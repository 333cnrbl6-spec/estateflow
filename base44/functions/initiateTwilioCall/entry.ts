import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json(
        { error: 'Unauthorized: Admin access required' },
        { status: 403 }
      );
    }

    const { callerPhone, propertyAddress, callType, description } = await req.json();

    if (!callerPhone) {
      return Response.json({ error: 'Missing callerPhone' }, { status: 400 });
    }

    // Get Twilio credentials from environment
    const TWILIO_ACCOUNT_SID = Deno.env.get('TWILIO_ACCOUNT_SID');
    const TWILIO_AUTH_TOKEN = Deno.env.get('TWILIO_AUTH_TOKEN');
    const TWILIO_PHONE_NUMBER = Deno.env.get('TWILIO_PHONE_NUMBER');

    if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_PHONE_NUMBER) {
      return Response.json(
        { error: 'Twilio credentials not configured' },
        { status: 500 }
      );
    }

    // Create call log in database
    const callRecord = await base44.asServiceRole.entities.OutOfHoursCall.create({
      call_date_time: new Date().toISOString(),
      caller_name: 'Inbound Caller',
      caller_phone: callerPhone,
      property_address: propertyAddress || 'Unknown',
      call_type: callType || 'general_enquiry',
      call_description: description || 'Inbound call from Twilio',
      severity: 'medium',
      validation_status: 'pending',
      gdpr_consent_recorded: true,
      handler_name: 'Virtual Call Queue',
    });

    // Twilio API call to initiate call (optional - for outbound routing)
    // For inbound, the call would come through Twilio webhook to your system
    const twilioAuth = btoa(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`);

    const twilioResponse = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Calls.json`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${twilioAuth}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          From: TWILIO_PHONE_NUMBER,
          To: callerPhone,
          Url: `${Deno.env.get('APP_URL')}/functions/handleTwilioWebhook?callId=${callRecord.id}`,
          StatusCallback: `${Deno.env.get('APP_URL')}/functions/handleTwilioStatus?callId=${callRecord.id}`,
        }).toString(),
      }
    );

    if (!twilioResponse.ok) {
      const error = await twilioResponse.text();
      console.error('Twilio error:', error);
    }

    return Response.json({
      success: true,
      callId: callRecord.id,
      message: 'Call initiated and logged',
    });
  } catch (error) {
    console.error('Error:', error);
    return Response.json(
      { error: error.message },
      { status: 500 }
    );
  }
});