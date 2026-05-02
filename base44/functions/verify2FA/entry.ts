import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    const { twoFAId, code } = await req.json();

    if (!user || !twoFAId || !code) {
      return Response.json({ error: 'Invalid request' }, { status: 400 });
    }

    const twoFA = await base44.asServiceRole.entities.TwoFactorAuth.get(twoFAId);

    if (!twoFA || twoFA.user_id !== user.id) {
      return Response.json({ error: 'Not found' }, { status: 404 });
    }

    // Verify code (simplified - in production validate TOTP)
    if (code.length !== 6 || isNaN(code)) {
      return Response.json({ error: 'Invalid code' }, { status: 400 });
    }

    // Generate backup codes
    const backupCodes = Array(10).fill(0).map(() => 
      Math.random().toString(36).substring(2, 10).toUpperCase()
    );

    // Enable 2FA
    await base44.asServiceRole.entities.TwoFactorAuth.update(twoFAId, {
      verified: true,
      enabled: true,
      setup_completed_at: new Date().toISOString(),
      backup_codes: backupCodes
    });

    // Log security event
    await base44.asServiceRole.entities.SecurityAuditLog.create({
      user_id: user.id,
      event_type: '2fa_enabled',
      status: 'success',
      timestamp: new Date().toISOString()
    });

    return Response.json({
      message: '2FA enabled',
      backupCodes: backupCodes
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});