import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { maintenance_id, contractor_ids } = await req.json();

    if (!maintenance_id || !contractor_ids || contractor_ids.length === 0) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Fetch maintenance request
    const maintenance = await base44.entities.MaintenanceRequest.get(maintenance_id);
    if (!maintenance) {
      return Response.json({ error: 'Maintenance request not found' }, { status: 404 });
    }

    const postedContractors = [];

    // Mark contractors as posted (they will see in their portal)
    for (const contractorId of contractor_ids) {
      try {
        const contractor = await base44.entities.Contact.get(contractorId);
        if (!contractor) continue;

        postedContractors.push({
          id: contractorId,
          name: contractor.contact_name,
          email: contractor.email_address,
        });

      } catch (error) {
        console.error(`Failed to process contractor ${contractorId}:`, error);
      }
    }

    // Update maintenance status to indicate quotes requested
    await base44.entities.MaintenanceRequest.update(maintenance_id, {
      status: 'assigned',
    });

    return Response.json({
      success: true,
      message: `Posted to ${postedContractors.length} contractor${postedContractors.length !== 1 ? 's' : ''}`,
      contractors: postedContractors,
    });

  } catch (error) {
    console.error('Error posting maintenance:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});