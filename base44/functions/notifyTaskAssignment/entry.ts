import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { task_id } = await req.json();

    // Fetch task details
    const task = await base44.asServiceRole.entities.Task.get(task_id);

    // Send notification email to contractor
    const emailBody = `
      <h2>New Task Assignment</h2>
      <p><strong>Task:</strong> ${task.title}</p>
      <p><strong>Description:</strong> ${task.description || 'N/A'}</p>
      <p><strong>Priority:</strong> ${task.priority}</p>
      <p><strong>Deadline:</strong> ${task.deadline}</p>
      <p><strong>Assigned by:</strong> ${task.assigned_by}</p>
      ${task.linked_entity_id ? `<p><strong>Related to:</strong> ${task.linked_entity_type}</p>` : ''}
      <p>Please log in to the contractor portal to view full details.</p>
    `;

    await base44.integrations.Core.SendEmail({
      to: task.assigned_to,
      subject: `New Task Assignment: ${task.title}`,
      body: emailBody
    });

    console.log(`[Task] Sent assignment notification to ${task.assigned_to}`);

    return Response.json({
      success: true,
      message: 'Notification sent'
    });
  } catch (error) {
    console.error('[Task] Notification error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});