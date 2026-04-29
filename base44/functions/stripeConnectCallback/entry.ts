import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const { code } = body;
    if (!code) return Response.json({ error: 'Missing code' }, { status: 400 });

    const secretKey = Deno.env.get('STRIPE_SECRET_KEY');
    if (!secretKey) return Response.json({ error: 'Stripe not configured' }, { status: 500 });

    // Exchange code for access token via Stripe OAuth
    const tokenRes = await fetch('https://connect.stripe.com/oauth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        client_secret: secretKey,
      }).toString(),
    });

    const tokenData = await tokenRes.json();
    if (tokenData.error) {
      return Response.json({ error: tokenData.error_description || tokenData.error }, { status: 400 });
    }

    const stripe_account_id = tokenData.stripe_user_id;
    return Response.json({ stripe_account_id });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});