import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { event, data } = await req.json();

    if (!data?.id) {
      return Response.json({ error: 'Call ID required' }, { status: 400 });
    }

    const call = data;

    // Get the company's service tier
    const service = await base44.entities.OutOfHoursService.filter(
      { company_id: call.matched_company_id },
      '-updated_date',
      1
    );

    if (!service || service.length === 0) {
      return Response.json({ error: 'No service found for company' }, { status: 404 });
    }

    const tier = service[0].service_tier;
    const actions = [];

    // Basic: Log and email
    if (['basic', 'standard', 'premium', 'enterprise'].includes(tier)) {
      if (call.action_taken === 'logged_and_email_sent') {
        actions.push({
          type: 'email_notification',
          status: 'completed',
        });
      }
    }

    // Standard: Create maintenance order
    if (['standard', 'premium', 'enterprise'].includes(tier)) {
      if (
        call.call_type === 'maintenance' ||
        call.severity === 'high' ||
        call.severity === 'critical'
      ) {
        const maintenanceOrder = await base44.entities.MaintenanceOrder.create({
          title: `Emergency: ${call.call_description}`,
          description: `Call from ${call.caller_name} (${call.caller_phone})\n${call.call_description}`,
          property_id: call.matched_property_id,
          unit_id: null,
          reported_by: call.handler_name || 'Out-of-Hours Handler',
          priority: call.severity === 'critical' ? 'emergency' : 'urgent',
          status: 'reported',
          category: mapCallTypeToCategory(call.call_type),
          notes: `Out-of-hours call ID: ${call.id}`,
        });

        actions.push({
          type: 'maintenance_order_created',
          order_id: maintenanceOrder.id,
          status: 'completed',
        });

        // Update the call with the order ID
        await base44.entities.OutOfHoursCall.update(call.id, {
          action_taken: 'maintenance_order_created',
          action_details: maintenanceOrder.id,
        });
      }
    }

    // Premium: Dispatch contractor
    if (['premium', 'enterprise'].includes(tier)) {
      if (call.severity === 'critical' && call.call_type === 'emergency') {
        // Get available contractors from the service
        const contractors = service[0].emergency_contractors || [];
        if (contractors.length > 0) {
          const contractor = contractors[0];

          // Create emergency callout
          const callout = await base44.entities.EmergencyCallout.create({
            property_id: call.matched_property_id,
            unit_id: null,
            caller_name: call.caller_name,
            caller_phone: call.caller_phone,
            call_received_date: call.call_date_time,
            call_type: mapCallTypeToEmergency(call.call_type),
            severity: call.severity,
            description: call.call_description,
            status: 'contractor_assigned',
            assigned_contractor_id: contractor.contractor_id,
            assigned_contractor_name: contractor.contractor_name,
            assigned_contractor_phone: contractor.phone,
            assigned_contractor_email: contractor.email,
            escalation_method: 'phone',
            escalation_time: new Date().toISOString(),
          });

          actions.push({
            type: 'contractor_dispatched',
            callout_id: callout.id,
            contractor: contractor.contractor_name,
            status: 'completed',
          });

          // Update the call
          await base44.entities.OutOfHoursCall.update(call.id, {
            action_taken: 'contractor_dispatched',
            action_details: callout.id,
          });
        }
      }
    }

    // Enterprise: Full workflow with escalation
    if (tier === 'enterprise') {
      if (call.severity === 'critical') {
        const escalation = service[0].escalation_contact;
        if (escalation) {
          // In production, this would trigger immediate notifications
          actions.push({
            type: 'escalation_triggered',
            contact: escalation.name,
            phone: escalation.phone,
            status: 'completed',
          });

          await base44.entities.OutOfHoursCall.update(call.id, {
            action_taken: 'escalated_to_manager',
            action_details: `Escalated to ${escalation.name}`,
          });
        }
      }
    }

    return Response.json({
      success: true,
      call_id: call.id,
      service_tier: tier,
      actions_executed: actions,
      action_count: actions.length,
    });
  } catch (error) {
    console.error('Error automating out-of-hours actions:', error);
    return Response.json(
      { error: error.message, details: error.stack },
      { status: 500 }
    );
  }
});

function mapCallTypeToCategory(callType) {
  const mapping = {
    heating_failure: 'general',
    water_leak: 'plumbing',
    electrical_fault: 'electrical',
    security_breach: 'security',
    fire_alarm: 'fire_safety',
    maintenance: 'general',
    emergency: 'general',
    contractor_dispatch: 'general',
  };
  return mapping[callType] || 'general';
}

function mapCallTypeToEmergency(callType) {
  const mapping = {
    heating_failure: 'heating_failure',
    water_leak: 'water_leak',
    electrical_fault: 'electrical_fault',
    security_breach: 'security_breach',
    fire_alarm: 'fire_alarm',
    maintenance: 'other',
    emergency: 'other',
    contractor_dispatch: 'other',
  };
  return mapping[callType] || 'other';
}