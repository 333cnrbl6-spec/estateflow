import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { event, data } = await req.json();

    if (!data || !data.id) return Response.json({ success: true });

    // Find related compliance tasks
    const tasks = await base44.asServiceRole.entities.ComplianceTask.filter({
      certificate_id: data.id,
      status: { $in: ['pending', 'reminder_sent', 'reminder_needed'] }
    });

    // If new certificate uploaded, mark old tasks as completed
    if (data.expiry_date && tasks.length > 0) {
      for (const task of tasks) {
        // Check if new cert is newer than task's cert
        if (new Date(data.expiry_date) > new Date(task.expiry_date)) {
          await base44.asServiceRole.entities.ComplianceTask.update(task.id, {
            status: 'completed',
            completed_date: new Date().toISOString(),
            completion_notes: 'Certificate renewed and uploaded'
          });
        }
      }
    }

    return Response.json({ success: true, tasks_updated: tasks.length });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});