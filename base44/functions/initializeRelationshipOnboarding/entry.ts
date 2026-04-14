import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { entityId, entityType, relationshipType, jurisdictions } = await req.json();

    // Fetch entity
    const entity = await base44.asServiceRole.entities[entityType]?.get?.(entityId);
    if (!entity) {
      return Response.json({ error: 'Entity not found' }, { status: 404 });
    }

    // Get onboarding stages based on relationship type
    const stages = getOnboardingStages(relationshipType);

    // Create workflow record
    const workflow = await base44.asServiceRole.entities.Workflow?.create?.({
      entity_id: entityId,
      entity_type: entityType,
      relationship_type: relationshipType,
      name: `${relationshipType.replace(/_/g, ' ')} Onboarding - ${entity.name || entity.full_name}`,
      status: 'pending',
      current_stage: 0,
      total_stages: stages.length,
      stages: stages.map((s, idx) => ({ ...s, stage_number: idx + 1, status: 'pending' })),
      created_date: new Date().toISOString(),
      due_date: calculateDueDate(relationshipType)
    }).catch(() => null);

    if (!workflow) {
      return Response.json({ error: 'Failed to create workflow' }, { status: 500 });
    }

    // Trigger first stage
    await triggerStage(base44, workflow, 0, entity, relationshipType);

    // Notify admins
    await notifyAdminsOfNewWorkflow(base44, entity, relationshipType, workflow.id);

    return Response.json({
      success: true,
      workflow_id: workflow.id,
      entity: entity.name || entity.full_name,
      stages: stages.length,
      current_stage: 'Document Collection'
    });
  } catch (error) {
    console.error('Onboarding error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});

function getOnboardingStages(relationshipType) {
  const stageMap = {
    vendor: [
      {
        name: 'Document Collection',
        description: 'Request registration, insurance, and business documents',
        documents_required: ['registration_certificate', 'insurance_policy', 'tax_id'],
        duration_days: 7,
        task_type: 'document_request'
      },
      {
        name: 'Compliance Assessment',
        description: 'Run automated compliance checks',
        duration_days: 3,
        task_type: 'compliance_check',
        auto_trigger: true
      },
      {
        name: 'Admin Review',
        description: 'Manual review by admin team',
        duration_days: 5,
        task_type: 'admin_review',
        assign_to_role: 'admin'
      },
      {
        name: 'Agreement Signing',
        description: 'Send service agreement for signing',
        duration_days: 7,
        task_type: 'agreement_signing'
      },
      {
        name: 'Final Approval',
        description: 'Complete and activate vendor',
        duration_days: 2,
        task_type: 'final_approval',
        assign_to_role: 'admin'
      }
    ],
    supplier: [
      {
        name: 'Supplier Profile',
        description: 'Collect supplier details and contact info',
        documents_required: ['company_info', 'contact_details', 'payment_terms'],
        duration_days: 5,
        task_type: 'document_request'
      },
      {
        name: 'Financial Verification',
        description: 'Verify payment terms and financial stability',
        duration_days: 5,
        task_type: 'financial_check',
        assign_to_role: 'admin'
      },
      {
        name: 'Contract Setup',
        description: 'Create and sign supplier agreement',
        duration_days: 7,
        task_type: 'contract_setup'
      }
    ],
    subcontractor: [
      {
        name: 'Credentials Verification',
        description: 'Verify professional certifications',
        documents_required: ['certifications', 'insurance', 'h_and_s_documents'],
        duration_days: 7,
        task_type: 'document_request'
      },
      {
        name: 'Compliance & Safety Check',
        description: 'Comprehensive compliance assessment',
        duration_days: 5,
        task_type: 'compliance_check',
        auto_trigger: true
      },
      {
        name: 'Team Assignment',
        description: 'Assign to project teams',
        duration_days: 3,
        task_type: 'team_assignment',
        assign_to_role: 'admin'
      }
    ],
    landlord: [
      {
        name: 'Property Verification',
        description: 'Verify property ownership and details',
        documents_required: ['title_deed', 'property_info'],
        duration_days: 7,
        task_type: 'document_request'
      },
      {
        name: 'Deposit Protection Setup',
        description: 'Ensure deposit protection scheme is in place',
        duration_days: 5,
        task_type: 'deposit_protection'
      },
      {
        name: 'Compliance Briefing',
        description: 'Provide landlord compliance documentation',
        duration_days: 3,
        task_type: 'compliance_briefing'
      }
    ],
    customer: [
      {
        name: 'Identity Verification',
        description: 'Verify customer identity',
        documents_required: ['id_document', 'proof_of_address'],
        duration_days: 3,
        task_type: 'identity_check'
      },
      {
        name: 'Right to Rent Check',
        description: 'Conduct right to rent verification',
        duration_days: 2,
        task_type: 'right_to_rent_check'
      }
    ]
  };

  return stageMap[relationshipType] || stageMap.vendor;
}

async function triggerStage(base44, workflow, stageIndex, entity, relationshipType) {
  const stage = workflow.stages[stageIndex];
  if (!stage) return;

  // Update workflow stage
  await base44.asServiceRole.entities.Workflow?.update?.(workflow.id, {
    current_stage: stageIndex,
    status: 'in_progress'
  }).catch(() => null);

  // Create task for stage
  if (stage.task_type === 'document_request') {
    await createDocumentRequestTask(base44, workflow, stage, entity);
  } else if (stage.task_type === 'compliance_check') {
    // Auto-trigger compliance assessment
    await base44.functions.invoke('assessBusinessRelationshipCompliance', {
      entityId: entity.id,
      entityType: workflow.entity_type,
      relationshipType,
      auditMode: false
    }).catch(() => null);
  } else if (stage.task_type === 'admin_review' || stage.task_type === 'final_approval') {
    await createAdminTask(base44, workflow, stage, entity);
  } else if (stage.task_type === 'agreement_signing') {
    await sendAgreementForSigning(base44, workflow, stage, entity);
  }
}

async function createDocumentRequestTask(base44, workflow, stage, entity) {
  const documents = stage.documents_required?.map(d => ({
    type: d,
    status: 'pending',
    requested_date: new Date().toISOString()
  })) || [];

  await base44.asServiceRole.entities.Task?.create?.({
    title: `[${workflow.relationship_type}] ${stage.name}`,
    description: `${stage.description}\n\nDocuments required: ${documents.map(d => d.type).join(', ')}`,
    property_id: `relationship_${workflow.entity_id}`,
    assigned_to: entity.email || entity.contact_email || 'support@example.com',
    assigned_by: 'system',
    status: 'pending',
    priority: 'high',
    deadline: new Date(Date.now() + stage.duration_days * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    linked_entity_type: 'none',
    linked_entity_id: workflow.id,
    category: 'admin',
    notes: `Onboarding stage ${workflow.current_stage + 1} of ${workflow.total_stages}`
  }).catch(() => null);
}

async function createAdminTask(base44, workflow, stage, entity) {
  const adminUsers = await base44.asServiceRole.entities.User?.filter?.({
    role: 'admin'
  }) || [];

  const adminEmail = adminUsers.length > 0 ? adminUsers[0].email : 'admin@example.com';

  await base44.asServiceRole.entities.Task?.create?.({
    title: `[ADMIN] ${workflow.relationship_type.replace(/_/g, ' ')} - ${stage.name}`,
    description: `${stage.description}\n\nEntity: ${entity.name || entity.full_name}\nRelationship Type: ${workflow.relationship_type}`,
    property_id: `relationship_${workflow.entity_id}`,
    assigned_to: adminEmail,
    assigned_by: 'system',
    status: 'pending',
    priority: 'high',
    deadline: new Date(Date.now() + stage.duration_days * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    linked_entity_type: 'none',
    linked_entity_id: workflow.id,
    category: 'admin',
    notes: `Onboarding stage ${workflow.current_stage + 1} of ${workflow.total_stages}`
  }).catch(() => null);
}

async function sendAgreementForSigning(base44, workflow, stage, entity) {
  // Create task to send agreement
  await base44.asServiceRole.entities.Task?.create?.({
    title: `[${workflow.relationship_type}] Send Agreement for Signing`,
    description: `Send service agreement to ${entity.name || entity.full_name} for signing`,
    property_id: `relationship_${workflow.entity_id}`,
    assigned_to: entity.email || entity.contact_email || 'support@example.com',
    assigned_by: 'system',
    status: 'pending',
    priority: 'high',
    deadline: new Date(Date.now() + stage.duration_days * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    linked_entity_type: 'none',
    linked_entity_id: workflow.id,
    category: 'admin'
  }).catch(() => null);
}

async function notifyAdminsOfNewWorkflow(base44, entity, relationshipType, workflowId) {
  const adminUsers = await base44.asServiceRole.entities.User?.filter?.({
    role: 'admin'
  }) || [];

  const emailList = adminUsers.map(u => u.email).filter(e => e);

  const subject = `New Onboarding Workflow: ${relationshipType.replace(/_/g, ' ')} - ${entity.name || entity.full_name}`;
  const body = `
A new ${relationshipType.replace(/_/g, ' ')} onboarding workflow has been initiated.

Entity: ${entity.name || entity.full_name}
Contact: ${entity.email || entity.contact_email || 'N/A'}
Phone: ${entity.phone || 'N/A'}

Workflow ID: ${workflowId}

Next Steps:
1. Review document requirements
2. Monitor completion of each onboarding stage
3. Approve compliance assessment
4. Finalize and activate relationship

Action Required: Monitor and approve onboarding stages as they are completed.
  `;

  await Promise.all(
    emailList.map(email =>
      base44.integrations.Core.SendEmail({
        to: email,
        subject,
        body
      }).catch(err => console.error(`Email failed to ${email}:`, err))
    )
  );
}

function calculateDueDate(relationshipType) {
  const dueDateMap = {
    vendor: 30,
    supplier: 21,
    subcontractor: 21,
    landlord: 14,
    customer: 7
  };

  const days = dueDateMap[relationshipType] || 30;
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().split('T')[0];
}