import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { 
      unit_id, 
      type, 
      subject, 
      description, 
      amount_disputed,
      service_charge_id,
      property_id 
    } = await req.json();

    // Create complaint record in LeaseholderRights
    const leaseholderRights = await base44.entities.LeaseholderRights.filter({
      unit_id: unit_id,
    });

    if (leaseholderRights.length === 0) {
      return Response.json({ error: 'Leaseholder record not found' }, { status: 404 });
    }

    const record = leaseholderRights[0];

    // Add complaint to existing complaints or create new
    const complaints = record.complaint_handling || [];
    const newComplaint = {
      complaint_date: new Date().toISOString().split('T')[0],
      subject: type,
      description: description,
      status: 'submitted',
      resolution_date: null,
      resolution: null,
    };

    complaints.push(newComplaint);

    // Update the leaseholder rights record
    await base44.entities.LeaseholderRights.update(record.id, {
      complaint_handling: complaints,
    });

    // If it's a service charge dispute, update the ServiceCharge entity
    if (type === 'service_charge' && service_charge_id) {
      const serviceCharges = await base44.entities.ServiceCharge.filter({
        id: service_charge_id,
      });

      if (serviceCharges.length > 0) {
        const sc = serviceCharges[0];
        const disputes = sc.disputed_items || [];
        
        disputes.push({
          unit_id: unit_id,
          category: subject,
          amount_disputed: amount_disputed,
          reason: description,
          filed_date: new Date().toISOString().split('T')[0],
          resolution_status: 'pending',
        });

        await base44.entities.ServiceCharge.update(service_charge_id, {
          disputed_items: disputes,
          status: 'disputed',
        });
      }
    }

    return Response.json({
      success: true,
      complaint_id: `COMPLAINT-${Date.now()}`,
      message: 'Your complaint has been filed successfully. Reference: COMPLAINT-' + Date.now(),
      status: 'submitted',
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});