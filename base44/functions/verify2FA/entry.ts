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

    // SECURITY: the submitted code must actually match the stored factor.
    // TwoFactorAuth.secret holds the per-user TOTP secret set during enrolment.
    if (typeof code !== 'string' || !/^\d{6}$/.test(code)) {
      return Response.json({ error: 'Invalid code' }, { status: 400 });
    }

    // The submitted code is validated against the stored factor, not accepted on format alone.
    // setup2FA stores a 32-character base32 secret, so TOTP is computed over that secret.
    let matchesStoredCode = false;

    if (twoFA.method === 'totp' && twoFA.secret) {
      const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
      const clean = String(twoFA.secret).toUpperCase().replace(/[^A-Z2-7]/g, '');
      let bitString = '';
      for (const ch of clean) {
        const idx = alphabet.indexOf(ch);
        if (idx !== -1) bitString += idx.toString(2).padStart(5, '0');
      }

      const keyBytes = new Uint8Array(Math.floor(bitString.length / 8));
      for (let i = 0; i < keyBytes.length; i++) {
        keyBytes[i] = parseInt(bitString.slice(i * 8, i * 8 + 8), 2);
      }

      const counter = Math.floor(Date.now() / 30000);
      for (let drift = -1; drift <= 1 && !matchesStoredCode; drift++) {
        const step = counter + drift;
        const buf = new ArrayBuffer(8);
        const view = new DataView(buf);
        view.setUint32(0, Math.floor(step / 4294967296));
        view.setUint32(4, step >>> 0);

        const cryptoKey = await crypto.subtle.importKey(
          'raw', keyBytes, { name: 'HMAC', hash: 'SHA-1' }, false, ['sign']
        );
        const sig = new Uint8Array(await crypto.subtle.sign('HMAC', cryptoKey, buf));
        const offset = sig[sig.length - 1] & 0x0f;
        const binary = ((sig[offset] & 0x7f) << 24) |
          ((sig[offset + 1] & 0xff) << 16) |
          ((sig[offset + 2] & 0xff) << 8) |
          (sig[offset + 3] & 0xff);

        if (String(binary % 1000000).padStart(6, '0') === code) matchesStoredCode = true;
      }
    }

    if (!matchesStoredCode) {
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