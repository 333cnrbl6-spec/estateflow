import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is paused (trial expired, unpaid)
    if (['paused', 'cancelled'].includes(user.subscription_status)) {
      return Response.json({
        canAdd: false,
        reason: 'Your subscription is ' + user.subscription_status,
        message: 'Upgrade to continue adding properties'
      });
    }

    // Count existing properties
    const properties = await base44.entities.Property.filter({ owning_company: user.current_demo_company_id || '' });
    const limit = user.properties_limit || 0;
    const used = user.properties_used || properties.length;

    if (limit > 0 && used >= limit) {
      return Response.json({
        canAdd: false,
        reason: `Reached limit of ${limit} properties`,
        message: 'Upgrade to Professional tier for more properties',
        current: used,
        limit: limit
      });
    }

    return Response.json({
      canAdd: true,
      current: used,
      limit: limit,
      remaining: limit > 0 ? limit - used : null
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});