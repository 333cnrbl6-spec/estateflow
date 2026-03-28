import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    // Invite Powell & Co demo user
    await base44.users.inviteUser('demo@powellandco.com', 'admin');

    return Response.json({
      success: true,
      message: 'Powell & Co demo user invited',
      email: 'demo@powellandco.com',
      instructions: 'The user will receive an invite email. Once they accept, update their profile to set business_name to "Powell & Co"'
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});