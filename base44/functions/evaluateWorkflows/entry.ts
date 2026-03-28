import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';
import { differenceInDays, parseISO, subDays } from 'npm:date-fns@3.6.0';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user?.role || user.role !== 'admin') {
      return Response.json({ error: 'Admin access required' }, { status: 403 });
    }

    const today = new Date();
    const workflows = await base44.entities.Workflow.list();
    const activeWorkflows = workflows.filter(w => w.is_active);

    let createdExecutions = 0;

    for (const workflow of activeWorkflows) {
      if (workflow.trigger_type === 'gas_safety_expiry') {
        await handleGasSafetyTrigger(base44, workflow, today);
        createdExecutions++;
      } else if (workflow.trigger_type === 'epc_expiry') {
        await handleEPCTrigger(base44, workflow, today);
        createdExecutions++;
      } else if (workflow.trigger_type === 'electrical_expiry') {
        await handleElectricalTrigger(base44, workflow, today);
        createdExecutions++;
      } else if (workflow.trigger_type === 'rent_overdue') {
        await handleRentOverdueTrigger(base44, workflow, today);
        createdExecutions++;
      } else if (workflow.trigger_type === 'deposit_not_registered') {
        await handleDepositNotRegisteredTrigger(base44, workflow, today);
        createdExecutions++;
      }
    }

    return Response.json({ 
      success: true, 
      message: `Evaluated ${activeWorkflows.length} workflows, created ${createdExecutions} pending executions`,
      timestamp: today.toISOString()
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});

async function handleGasSafetyTrigger(base44, workflow, today) {
  const pipelines = await base44.entities.TenancyPipeline.list();
  
  for (const pipeline of pipelines) {
    if (!pipeline.gas_safety_expiry_date) continue;
    
    const expiryDate = parseISO(pipeline.gas_safety_expiry_date);
    const daysUntilExpiry = differenceInDays(expiryDate, today);
    
    const triggerDays = workflow.days_before || 30;
    
    if (daysUntilExpiry === triggerDays && daysUntilExpiry > 0) {
      const shouldApply = checkPropertyScope(base44, workflow, pipeline);
      if (!shouldApply) continue;

      const existingExecution = await base44.entities.WorkflowExecution.filter({
        workflow_id: workflow.id,
        pipeline_id: pipeline.id,
        status: { $in: ['pending', 'approved', 'executed'] }
      });

      if (existingExecution.length === 0) {
        await createExecution(base44, workflow, pipeline, expiryDate, 'gas_safety_expiry');
      }
    }
  }
}

async function handleEPCTrigger(base44, workflow, today) {
  const pipelines = await base44.entities.TenancyPipeline.list();
  
  for (const pipeline of pipelines) {
    if (!pipeline.epc_expiry_date) continue;
    
    const expiryDate = parseISO(pipeline.epc_expiry_date);
    const daysUntilExpiry = differenceInDays(expiryDate, today);
    
    const triggerDays = workflow.days_before || 60;
    
    if (daysUntilExpiry === triggerDays && daysUntilExpiry > 0) {
      const existingExecution = await base44.entities.WorkflowExecution.filter({
        workflow_id: workflow.id,
        pipeline_id: pipeline.id,
        status: { $in: ['pending', 'approved', 'executed'] }
      });

      if (existingExecution.length === 0) {
        await createExecution(base44, workflow, pipeline, expiryDate, 'epc_expiry');
      }
    }
  }
}

async function handleElectricalTrigger(base44, workflow, today) {
  const pipelines = await base44.entities.TenancyPipeline.list();
  
  for (const pipeline of pipelines) {
    if (!pipeline.eicr_expiry_date) continue;
    
    const expiryDate = parseISO(pipeline.eicr_expiry_date);
    const daysUntilExpiry = differenceInDays(expiryDate, today);
    
    const triggerDays = workflow.days_before || 60;
    
    if (daysUntilExpiry === triggerDays && daysUntilExpiry > 0) {
      const existingExecution = await base44.entities.WorkflowExecution.filter({
        workflow_id: workflow.id,
        pipeline_id: pipeline.id,
        status: { $in: ['pending', 'approved', 'executed'] }
      });

      if (existingExecution.length === 0) {
        await createExecution(base44, workflow, pipeline, expiryDate, 'electrical_expiry');
      }
    }
  }
}

async function handleRentOverdueTrigger(base44, workflow, today) {
  const rentLedgers = await base44.entities.RentLedger.filter({ status: 'overdue' });
  
  for (const ledger of rentLedgers) {
    const existingExecution = await base44.entities.WorkflowExecution.filter({
      workflow_id: workflow.id,
      tenant_id: ledger.tenant_id,
      trigger_type: 'rent_overdue',
      status: { $in: ['pending', 'approved', 'executed'] }
    });

    if (existingExecution.length === 0) {
      await createExecution(base44, workflow, null, today, 'rent_overdue', ledger);
    }
  }
}

async function handleDepositNotRegisteredTrigger(base44, workflow, today) {
  const pipelines = await base44.entities.TenancyPipeline.filter({
    stage: 'occupied',
    deposit_amount: { $gt: 0 },
    deposit_scheme: 'none'
  });

  for (const pipeline of pipelines) {
    if (!pipeline.tenancy_start_date) continue;

    const startDate = parseISO(pipeline.tenancy_start_date);
    const daysSinceStart = differenceInDays(today, startDate);

    const triggerDays = workflow.days_before || 7;

    if (daysSinceStart === triggerDays) {
      const existingExecution = await base44.entities.WorkflowExecution.filter({
        workflow_id: workflow.id,
        pipeline_id: pipeline.id,
        status: { $in: ['pending', 'approved'] }
      });

      if (existingExecution.length === 0) {
        await createExecution(base44, workflow, pipeline, today, 'deposit_not_registered');
      }
    }
  }
}

function checkPropertyScope(base44, workflow, pipeline) {
  if (workflow.apply_to_properties === 'all') return true;

  if (workflow.apply_to_properties === 'specific_properties' && workflow.property_ids) {
    return workflow.property_ids.includes(pipeline.property_id);
  }

  return true;
}

async function createExecution(base44, workflow, pipeline, triggerDate, triggerType, rentLedger = null) {
  const actionsToExecute = workflow.actions.map(action => ({
    action_type: action.action_type,
    status: 'pending',
    details: {
      email_subject: action.email_subject,
      email_body_template: action.email_body_template,
      maintenance_title: action.maintenance_title_template,
      maintenance_category: action.maintenance_category,
      crm_subject: action.crm_subject_template,
      crm_body: action.crm_body_template
    }
  }));

  const execution = {
    workflow_id: workflow.id,
    workflow_name: workflow.name,
    trigger_type: triggerType,
    property_id: pipeline?.property_id,
    property_address: pipeline?.property_address,
    unit_id: pipeline?.unit_reference,
    pipeline_id: pipeline?.id,
    tenant_id: rentLedger?.tenant_id,
    tenant_name: rentLedger?.tenant_name || pipeline?.applicant_name,
    trigger_date: triggerDate.toISOString().split('T')[0],
    status: 'pending',
    actions_to_execute: actionsToExecute
  };

  await base44.entities.WorkflowExecution.create(execution);
}