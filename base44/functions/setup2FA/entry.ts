import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { method } = await req.json();

    if (!['totp', 'sms', 'email'].includes(method)) {
      return Response.json({ error: 'Invalid 2FA method' }, { status: 400 });
    }

    // Generate TOTP secret or send SMS/email code
    let secret, qrCode;

    if (method === 'totp') {
      // Generate random secret for TOTP
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
      secret = Array(32).fill(0).map(() => chars[Math.floor(Math.random() * chars.length)]).join('');
      
      // Generate QR code (simplified - in production use a library)
      qrCode = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=otpauth://totp/Premiso:${user.email}?secret=${secret}`;
    }

    // Create 2FA record (unverified)
    const twoFA = await base44.asServiceRole.entities.TwoFactorAuth.create({
      user_id: user.id,
      method,
      enabled: false,
      verified: false,
      secret: secret || null
    });

    return Response.json({
      message: '2FA setup started',
      twoFAId: twoFA.id,
      method,
      ...(method === 'totp' && { qrCode, secret })
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});