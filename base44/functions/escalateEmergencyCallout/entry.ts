import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const {
      callout_id,
      contractor_phone,
      contractor_email,
      property_name,
      call_type,
      description,
      estimated_arrival_time,
    } = await req.json();

    let escalationMethods = [];
    const messages = [];

    // Send SMS if phone provided
    if (contractor_phone) {
      const smsMessage = `EMERGENCY CALLOUT: ${property_name}. Issue: ${call_type}. ${description.substring(0, 100)}. Estimated arrival: ${new Date(estimated_arrival_time).toLocaleTimeString()}. Reply to confirm.`;
      
      // In production, integrate with SMS service (Twilio, etc)
      messages.push({
        type: 'sms',
        to: contractor_phone,
        message: smsMessage,
        status: 'queued',
      });
      escalationMethods.push('sms');
    }

    // Send email if email provided
    if (contractor_email) {
      const emailSubject = `EMERGENCY CALLOUT - ${property_name}`;
      const emailBody = `
An emergency callout has been logged and escalated to you.

Property: ${property_name}
Issue Type: ${call_type}
Severity: High
Description: ${description}

Estimated Arrival Time: ${new Date(estimated_arrival_time).toLocaleString()}

Please confirm receipt and your estimated time of arrival.

This is an automated message. Do not reply to this email.
      `;

      messages.push({
        type: 'email',
        to: contractor_email,
        subject: emailSubject,
        body: emailBody,
        status: 'queued',
      });
      escalationMethods.push('email');
    }

    // Update callout status
    await base44.entities.EmergencyCallout.update(callout_id, {
      status: 'escalated',
      escalation_method: escalationMethods.length > 1 ? 'multiple' : escalationMethods[0],
      escalation_time: new Date().toISOString(),
    });

    return Response.json({
      success: true,
      callout_id: callout_id,
      escalated_via: escalationMethods,
      messages_queued: messages.length,
      message: `Escalation sent via ${escalationMethods.join(' and ')}`,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});