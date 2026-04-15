import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { token } = await req.json();

    if (!token) {
      return Response.json({ success: false, error: 'Token required' }, { status: 400 });
    }

    // Find and deactivate token
    const tokenRecord = await base44.asServiceRole.entities.TenantAccessToken.filter({
      token: token,
      is_active: true
    });

    if (tokenRecord.length > 0) {
      await base44.asServiceRole.entities.TenantAccessToken.update(tokenRecord[0].id, {
        is_active: false
      });
      console.log(`[revokeTenantAccessToken] Revoked token for tenant ${tokenRecord[0].tenant_id}`);
    }

    return Response.json({ success: true });
  } catch (error) {
    console.error('[revokeTenantAccessToken] Error:', error.message);
    return Response.json({ success: false, error: 'Revocation failed' }, { status: 500 });
  }
});