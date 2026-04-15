import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { token } = await req.json();

    if (!token) {
      return Response.json({ valid: false, error: 'Token required' }, { status: 400 });
    }

    // Lookup token in database
    const tokenRecord = await base44.asServiceRole.entities.TenantAccessToken.filter({
      token: token,
      is_active: true
    });

    if (tokenRecord.length === 0) {
      return Response.json({ valid: false, error: 'Token not found' }, { status: 401 });
    }

    const tokenData = tokenRecord[0];
    const now = new Date();
    const expiresAt = new Date(tokenData.expires_at);

    // Check expiry
    if (expiresAt < now) {
      return Response.json({ valid: false, error: 'Token expired' }, { status: 401 });
    }

    // Update last_used timestamp
    await base44.asServiceRole.entities.TenantAccessToken.update(tokenData.id, {
      last_used: now.toISOString()
    });

    // Fetch tenant securely
    const tenant = await base44.asServiceRole.entities.Tenant.get(tokenData.tenant_id);
    if (!tenant) {
      return Response.json({ valid: false, error: 'Tenant not found' }, { status: 404 });
    }

    return Response.json({
      valid: true,
      tenant: {
        id: tenant.id,
        full_name: tenant.full_name,
        email: tenant.email,
        property_id: tokenData.property_id
      }
    });
  } catch (error) {
    console.error('[validateTenantAccessToken] Error:', error.message);
    return Response.json({ valid: false, error: 'Validation failed' }, { status: 500 });
  }
});