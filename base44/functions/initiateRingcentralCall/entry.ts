import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { callerPhone, propertyAddress, callType, description } = await req.json();

    // Create call record in OutOfHoursCall entity
    const call = await base44.entities.OutOfHoursCall.create({
      call_date_time: new Date().toISOString(),
      caller_phone: callerPhone,
      property_address: propertyAddress,
      call_type: callType,
      call_description: description,
      caller_name: 'Test Caller',
      severity: 'medium',
      validation_status: 'pending',
    });

    return Response.json({
      success: true,
      callId: call.id,
      message: 'Call initiated and logged successfully',
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});