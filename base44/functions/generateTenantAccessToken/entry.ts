import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const { tenant_id, tenant_email, property_id, expiry_days = 365 } = await req.json();

    if (!tenant_id || !tenant_email || !property_id) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Generate secure token
    const tokenData = {
      tenant_id,
      tenant_email,
      property_id,
      created_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + expiry_days * 24 * 60 * 60 * 1000).toISOString()
    };

    // Use crypto to create a hash-based token
    const encoder = new TextEncoder();
    const data = encoder.encode(JSON.stringify(tokenData) + Math.random());
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const token = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    // Store token record
    const tokenRecord = await base44.asServiceRole.entities.TenantAccessToken.create({
      tenant_id,
      tenant_email,
      property_id,
      token: token,
      created_at: tokenData.created_at,
      expires_at: tokenData.expires_at,
      is_active: true,
      last_used: null
    });

    // Log token generation (NOT the token itself, only ID and context)
    console.log(`[generateTenantAccessToken] Token created for tenant ${tenant_id}, expires ${tokenData.expires_at}`);

    return Response.json({
      success: true,
      token: token,
      tenant_id,
      property_id,
      expires_at: tokenData.expires_at,
      portal_url: `/tenant-communication?token=${encodeURIComponent(token)}`
    });

  } catch (error) {
    // Never leak error details to client
    console.error('[generateTenantAccessToken] Error:', error.message);
    return Response.json({ error: 'Failed to generate token' }, { status: 500 });
  }
});