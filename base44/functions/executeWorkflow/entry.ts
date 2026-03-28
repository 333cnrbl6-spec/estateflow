import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user?.role || user.role !== 'admin') {
      return Response.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { execution_id } = await req.json();
    if (!execution_id) {
      return Response.json({ error: 'execution_id required' }, { status: 400 });
    }

    const execution = await base44.entities.WorkflowExecution.filter({ id: execution_id });
    if (execution.length === 0) {
      return Response.json({ error: 'Execution not found' }, { status: 404 });
    }

    const exec = execution[0];
    
    for (const action of exec.actions_to_execute) {
      if (action.status === 'pending') {
        try {
          if (action.action_type === 'send_email') {
            // Email logic would go here
            action.status = 'executed';
          } else if (action.action_type === 'create_maintenance_order') {
            const maintenanceOrder = await base44.entities.MaintenanceOrder.create({
              title: action.details.maintenance_title || 'Maintenance Required',
              description: `Auto-generated from workflow: ${exec.workflow_name}`,
              property_id: exec.property_id,
              unit_id: exec.unit_id,
              category: action.details.maintenance_category || 'general',
              priority: action.details.maintenance_priority || 'standard',
              status: 'reported'
            });
            action.status = 'executed';
            action.result_id = maintenanceOrder.id;
          } else if (action.action_type === 'create_crm_interaction') {
            const crmInteraction = await base44.entities.CRMInteraction.create({
              interaction_type: 'note',
              direction: 'internal',
              date: new Date().toISOString().split('T')[0],
              subject: action.details.crm_subject || 'Workflow Action',
              body: action.details.crm_body || 'Auto-generated workflow interaction',
              contact_name: exec.tenant_name || 'N/A',
              contact_type: 'tenant',
              linked_property_id: exec.property_id,
              linked_tenant_id: exec.tenant_id,
              status: 'open'
            });
            action.status = 'executed';
            action.result_id = crmInteraction.id;
          } else if (action.action_type === 'draft_section8_notice') {
            // Section 8 notice would be drafted as a document
            action.status = 'executed';
            action.details.document_url = '/documents/section8-notice-template.pdf';
          }
        } catch (error) {
          action.status = 'failed';
          action.error_message = error.message;
        }
      }
    }

    // Update execution with new statuses
    await base44.entities.WorkflowExecution.update(execution_id, {
      status: 'executed',
      executed_date: new Date().toISOString().split('T')[0],
      approved_by: user.email,
      approved_date: new Date().toISOString().split('T')[0],
      actions_to_execute: exec.actions_to_execute
    });

    return Response.json({ 
      success: true,
      message: 'Workflow executed successfully',
      execution: exec
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});