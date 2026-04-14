import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const {
      task_id,
      entity_type,
      entity_id
    } = await req.json();

    if (!task_id || !entity_type || !entity_id) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const validTypes = ['maintenance_request', 'financial_transaction', 'inspection_record', 'property', 'none'];
    if (!validTypes.includes(entity_type)) {
      return Response.json({ error: 'Invalid entity type' }, { status: 400 });
    }

    // Update the task with the linked entity
    await base44.asServiceRole.entities.Task.update(task_id, {
      linked_entity_type: entity_type,
      linked_entity_id: entity_id
    });

    // If linking to maintenance request, update the maintenance request with the task ID
    if (entity_type === 'maintenance_request') {
      const maintenanceRequest = await base44.asServiceRole.entities.MaintenanceRequest.get(entity_id);
      const linkedTasks = maintenanceRequest.linked_tasks || [];
      if (!linkedTasks.includes(task_id)) {
        linkedTasks.push(task_id);
        await base44.asServiceRole.entities.MaintenanceRequest.update(entity_id, {
          linked_tasks: linkedTasks
        });
      }
    }

    console.log(`[Task] Linked task ${task_id} to ${entity_type} ${entity_id}`);

    return Response.json({
      success: true,
      message: `Task linked to ${entity_type}`
    });
  } catch (error) {
    console.error('[Task] Link error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});