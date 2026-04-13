import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { property_id, days_threshold = 30 } = await req.json();

    // Fetch all safety certificates for the property
    const gasCerts = await base44.entities.GasSafetyCertificate.filter({
      property_id: property_id || { $exists: true }
    });
    const eicrs = await base44.entities.EICRCertificate.filter({
      property_id: property_id || { $exists: true }
    });
    const safetyCerts = await base44.entities.SafetyCertificate.filter({
      property_id: property_id || { $exists: true }
    });

    const tasks = [];
    const today = new Date();
    const thresholdDate = new Date();
    thresholdDate.setDate(thresholdDate.getDate() + days_threshold);

    // Process Gas Safety Certificates
    gasCerts.forEach(cert => {
      const expiry = new Date(cert.expiry_date);
      if (expiry <= thresholdDate && expiry > today) {
        const daysLeft = Math.floor((expiry - today) / (1000 * 60 * 60 * 24));
        tasks.push(createTask('gas_safety', cert, daysLeft, 'warning'));
      } else if (expiry <= today) {
        tasks.push(createTask('gas_safety', cert, 0, 'overdue'));
      }
    });

    // Process EICR Certificates
    eicrs.forEach(cert => {
      const expiry = new Date(cert.next_due_date);
      if (expiry <= thresholdDate && expiry > today) {
        const daysLeft = Math.floor((expiry - today) / (1000 * 60 * 60 * 24));
        tasks.push(createTask('eicr', cert, daysLeft, 'warning'));
      } else if (expiry <= today) {
        tasks.push(createTask('eicr', cert, 0, 'overdue'));
      }
    });

    // Process Generic Safety Certificates
    safetyCerts.forEach(cert => {
      const expiry = new Date(cert.expiry_date);
      if (expiry <= thresholdDate && expiry > today) {
        const daysLeft = Math.floor((expiry - today) / (1000 * 60 * 60 * 24));
        tasks.push(createTask('safety_cert', cert, daysLeft, 'warning'));
      } else if (expiry <= today) {
        tasks.push(createTask('safety_cert', cert, 0, 'overdue'));
      }
    });

    // Generate or update tasks in database
    const createdTasks = [];
    for (const task of tasks) {
      try {
        const existing = await base44.entities.ComplianceTask.filter({
          property_id: task.property_id,
          certificate_type: task.certificate_type,
          certificate_id: task.certificate_id,
          status: { $in: ['pending', 'reminder_sent'] }
        });

        if (existing.length === 0) {
          const created = await base44.entities.ComplianceTask.create(task);
          createdTasks.push(created);
        }
      } catch (e) {
        console.error('Error creating compliance task:', e);
      }
    }

    return Response.json({
      success: true,
      tasks_created: createdTasks.length,
      total_tasks_identified: tasks.length,
      tasks: createdTasks.slice(0, 10)
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});

function createTask(certType, certificate, daysLeft, priority) {
  const today = new Date();
  
  return {
    certificate_type: certType,
    certificate_id: certificate.id,
    property_id: certificate.property_id,
    unit_id: certificate.unit_id || null,
    expiry_date: certificate.expiry_date || certificate.next_due_date || certificate.next_inspection_due,
    days_until_expiry: daysLeft,
    priority: priority,
    status: 'pending',
    task_type: daysLeft <= 0 ? 'urgent_renewal' : daysLeft <= 7 ? 'immediate_renewal' : 'scheduled_renewal',
    created_date: today.toISOString(),
    due_date: new Date(today.getTime() - daysLeft * 24 * 60 * 60 * 1000).toISOString(),
    contractor_required: true,
    estimated_cost: estimateRenewalCost(certType),
    notes: `${certType.toUpperCase()} renewal required in ${Math.max(1, daysLeft)} day(s)`
  };
}

function estimateRenewalCost(certType) {
  const costs = {
    gas_safety: 100,
    eicr: 150,
    safety_cert: 120,
    epc: 80,
    fire_safety: 250,
    asbestos: 300
  };
  return costs[certType] || 100;
}