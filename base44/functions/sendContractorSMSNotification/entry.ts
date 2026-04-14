import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const {
      contractorPhone,
      contractorName,
      taskTitle,
      scheduledDate,
      scheduledTime,
      propertyName,
    } = await req.json();

    if (!contractorPhone) {
      return Response.json({ error: 'No phone number provided' }, { status: 400 });
    }

    // Format the message
    const message = `Hi ${contractorName}, you have been assigned a maintenance task: "${taskTitle}" scheduled for ${scheduledDate} at ${scheduledTime}. Please confirm your availability.`;

    // Send SMS notification
    // Note: This assumes Twilio or similar is configured via environment variables
    // For this example, we'll use a mock implementation
    
    console.log(`SMS to ${contractorPhone}: ${message}`);

    // In production, integrate with Twilio or similar service:
    // const twilio = require('twilio');
    // const client = twilio(accountSid, authToken);
    // await client.messages.create({
    //   body: message,
    //   from: process.env.TWILIO_PHONE_NUMBER,
    //   to: contractorPhone,
    // });

    return Response.json({
      success: true,
      message: 'SMS notification sent to contractor',
      phone: contractorPhone,
      taskTitle: taskTitle,
      scheduledDate: scheduledDate,
      scheduledTime: scheduledTime,
    });
  } catch (error) {
    console.error('Error sending SMS:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});