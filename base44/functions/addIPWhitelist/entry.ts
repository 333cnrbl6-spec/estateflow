import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    const { ip_address, description } = await req.json();

    if (!user || !ip_address) {
      return Response.json({ error: 'IP address required' }, { status: 400 });
    }

    // Validate IP format (simplified)
    const ipRegex = /^(\d{1,3}\.){3}\d{1,3}(\/\d{1,2})?$/;
    if (!ipRegex.test(ip_address)) {
      return Response.json({ error: 'Invalid IP address format' }, { status: 400 });
    }

    // Add to whitelist
    const whitelist = await base44.asServiceRole.entities.IPWhitelist.create({
      user_id: user.id,
      ip_address,
      description: description || 'Added ' + new Date().toLocaleDateString(),
      status: 'active',
      added_at: new Date().toISOString()
    });

    // Log security event
    await base44.asServiceRole.entities.SecurityAuditLog.create({
      user_id: user.id,
      event_type: 'ip_whitelist_added',
      details: { ip_address },
      status: 'success',
      timestamp: new Date().toISOString()
    });

    return Response.json({
      message: 'IP added to whitelist',
      whitelist
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});