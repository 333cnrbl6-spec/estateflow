import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    const { flag_name } = await req.json();

    if (!user || !flag_name) {
      return Response.json({ error: 'Invalid request' }, { status: 400 });
    }

    // Get feature flag config
    const flags = await base44.asServiceRole.entities.FeatureFlag.filter({ flag_name: flag_name });
    const flag = flags[0];

    if (!flag) {
      return Response.json({ enabled: false, reason: 'Flag not found' });
    }

    // Check if feature is enabled
    if (!flag.enabled) {
      return Response.json({ enabled: false, reason: 'Feature not enabled' });
    }

    // Check tier access
    if (flag.allowed_tiers && !flag.allowed_tiers.includes(user.subscription_tier)) {
      return Response.json({ enabled: false, reason: 'Tier not allowed' });
    }

    // Check user whitelist
    if (flag.allowed_users && !flag.allowed_users.includes(user.email)) {
      // Random rollout
      const rolloutHash = Array.from(user.email).reduce((a, c) => a + c.charCodeAt(0), 0);
      if ((rolloutHash % 100) > flag.rollout_percentage) {
        return Response.json({ enabled: false, reason: 'Not in rollout' });
      }
    }

    return Response.json({ 
      enabled: true, 
      flag: flag.display_name,
      status: flag.status
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});