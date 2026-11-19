import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (user.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { event, data, old_data } = await req.json();

    // Only process update events
    if (event.type !== 'update') {
      return Response.json({ success: true, message: 'No action needed' });
    }

    // SECURITY: the rule is loaded from the database and never trusted from the request body,
    // so its name/description cannot be used as phishing content in an alert email.
    if (!data?.id) {
      return Response.json({ error: 'Rule id required' }, { status: 400 });
    }
    const rule = await base44.asServiceRole.entities.ComplianceRule.get(data.id);
    if (!rule) {
      return Response.json({ error: 'Rule not found' }, { status: 404 });
    }
    const oldRule = old_data;

    // Check if status changed to overdue
    const statusChanged = oldRule?.status !== rule?.status;
    const isNowOverdue = rule?.status === 'overdue' || 
                         (rule?.effective_until && new Date(rule.effective_until) < new Date());

    if (!statusChanged && !isNowOverdue) {
      return Response.json({ success: true, message: 'No compliance action triggered' });
    }

    const actions = [];

    // 1. Create or update compliance task
    if (isNowOverdue && rule?.rule_code) {
      try {
        const existingTasks = await base44.asServiceRole.entities.ComplianceTask.filter(
          { 
            rule_id: rule.id,
            status: { $nin: ['completed', 'cancelled'] }
          },
          '-created_date',
          1
        );

        if (!existingTasks || existingTasks.length === 0) {
          const task = await base44.asServiceRole.entities.ComplianceTask.create({
            rule_id: rule.id,
            rule_code: rule.rule_code,
            rule_name: rule.rule_name,
            framework_id: rule.framework_id,
            description: `${rule.rule_name} - Status: OVERDUE. Action required immediately.`,
            assigned_to: user.email,
            priority: rule.penalties?.has_penalty ? 'critical' : 'high',
            status: 'pending',
            due_date: new Date().toISOString(),
            task_type: 'compliance_action',
          });
          actions.push({ type: 'task_created', task_id: task.id });
        }
      } catch (error) {
        console.error('Error creating compliance task:', error.message);
      }
    }

    // 2. Send escalation alert if overdue
    if (isNowOverdue) {
      try {
        // SECURITY: alerts go to real admins only — never to an address supplied with the event
        const admins = await base44.asServiceRole.entities.User.filter({ role: 'admin' });
        const alertRecipients = (admins || []).map(a => a.email).filter(Boolean);
        
        // Build alert message
        const alertMessage = `
          COMPLIANCE ALERT - ACTION REQUIRED
          
          Rule: ${rule.rule_name}
          Code: ${rule.rule_code}
          Status: OVERDUE
          
          ${rule.description || 'No description provided.'}
          
          Required Actions:
          - Review this compliance requirement immediately
          - Take corrective action if needed
          - Document any evidence of compliance
          - Update status in the system
          
          Penalties for non-compliance:
          ${rule.penalties?.penalty_description || 'See compliance framework for details'}
          
          Framework: ${rule.framework_id}
          Enforcement Body: ${rule.enforcement_body || 'See compliance rules'}
          
          This is an automated alert. Do not reply to this email.
        `;

        await Promise.all(alertRecipients.map((recipient) =>
          base44.integrations.Core.SendEmail({
            to: recipient,
            subject: `URGENT: Compliance Rule Overdue - ${rule.rule_name}`,
            body: alertMessage,
            from_name: 'Compliance System',
          })
        ));

        actions.push({ type: 'alert_sent', recipient_count: alertRecipients.length });
      } catch (error) {
        console.error('Error sending alert email:', error.message);
      }
    }

    // 3. Log audit entry
    try {
      await base44.asServiceRole.entities.AuditLog.create({
        action: 'compliance.rule_status_changed',
        entity_type: 'ComplianceRule',
        entity_id: rule.id,
        user_email: user.email,
        changes: {
          old_status: oldRule?.status,
          new_status: rule?.status,
          rule_code: rule.rule_code,
          rule_name: rule.rule_name,
        },
        status: 'success',
        notes: `Compliance workflow triggered for rule status change to ${rule.status}`,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error logging audit:', error.message);
    }

    return Response.json({
      success: true,
      actions_triggered: actions,
      message: `Compliance workflow executed: ${actions.length} action(s) taken`,
    });
  } catch (error) {
    console.error('Compliance rule workflow error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});