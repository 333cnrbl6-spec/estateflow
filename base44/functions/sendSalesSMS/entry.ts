import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { contact_phone, message, listing_address } = await req.json();

    if (!contact_phone || !message) {
      return Response.json({ error: 'Phone number and message required' }, { status: 400 });
    }

    // Use Twilio integration if available, otherwise mock success
    const TWILIO_ACCOUNT_SID = Deno.env.get('TWILIO_ACCOUNT_SID');
    const TWILIO_AUTH_TOKEN = Deno.env.get('TWILIO_AUTH_TOKEN');
    const TWILIO_PHONE_NUMBER = Deno.env.get('TWILIO_PHONE_NUMBER');

    if (TWILIO_ACCOUNT_SID && TWILIO_AUTH_TOKEN && TWILIO_PHONE_NUMBER) {
      const authHeader = 'Basic ' + btoa(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`);
      
      const response = await fetch(
        `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`,
        {
          method: 'POST',
          headers: {
            'Authorization': authHeader,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            From: TWILIO_PHONE_NUMBER,
            To: contact_phone,
            Body: `${listing_address ? listing_address + ': ' : ''}${message}`,
          }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to send SMS');
      }

      const result = await response.json();
      return Response.json({ 
        success: true, 
        message_sid: result.sid,
        status: result.status 
      });
    } else {
      // Mock success for demo/testing
      console.log('SMS would be sent to:', contact_phone);
      console.log('Message:', message);
      return Response.json({ 
        success: true, 
        message_sid: 'mock_' + Date.now(),
        status: 'queued',
        demo_mode: true 
      });
    }
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});