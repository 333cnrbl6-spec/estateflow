import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Admin only' }, { status: 403 });

    const body = await req.json().catch(() => ({}));
    const redirectUri = body.redirect_uri || '';

    const clientId = Deno.env.get('STRIPE_CONNECT_CLIENT_ID');
    if (!clientId) {
      return Response.json({ error: 'STRIPE_CONNECT_CLIENT_ID secret not set' }, { status: 500 });
    }

    const params = new URLSearchParams({
      response_type: 'code',
      client_id: clientId,
      scope: 'read_write',
      redirect_uri: redirectUri,
      state: user.id,
    });

    const url = `https://connect.stripe.com/oauth/authorize?${params.toString()}`;
    return Response.json({ url });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});