import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    const { request_type } = await req.json();

    if (!user || !['access', 'deletion', 'portability'].includes(request_type)) {
      return Response.json({ error: 'Invalid request' }, { status: 400 });
    }

    // Check for existing open request
    const existing = await base44.asServiceRole.entities.GDPRRequest.filter({
      user_id: user.id,
      status: 'pending'
    });

    if (existing.length > 0) {
      return Response.json({ error: 'You already have a pending GDPR request' }, { status: 409 });
    }

    // Create GDPR request
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 30); // 30-day deadline

    const gdprRequest = await base44.asServiceRole.entities.GDPRRequest.create({
      user_id: user.id,
      request_type,
      status: 'pending',
      requested_at: new Date().toISOString(),
      due_date: dueDate.toISOString().split('T')[0]
    });

    // Log security event
    await base44.asServiceRole.entities.SecurityAuditLog.create({
      user_id: user.id,
      event_type: 'data_exported',
      details: { request_type },
      status: 'success',
      timestamp: new Date().toISOString()
    });

    // Send confirmation email
    await base44.integrations.Core.SendEmail({
      to: user.email,
      subject: 'GDPR Request Received',
      body: `We received your ${request_type} request. We'll process it within 30 days (by ${dueDate.toDateString()}).`
    });

    return Response.json({
      message: 'GDPR request received',
      gdprRequest,
      deadline: dueDate.toISOString()
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});