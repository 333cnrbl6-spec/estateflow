import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Get all users with trial status and trial_ends_at < now
    const now = new Date();
    const users = await base44.asServiceRole.entities.User.list('-updated_date', 1000);
    
    const expiredTrials = users.filter(u => 
      u.subscription_status === 'trial' && 
      u.trial_ends_at && 
      new Date(u.trial_ends_at) < now
    );

    // Pause each expired trial
    for (const user of expiredTrials) {
      await base44.asServiceRole.entities.User.update(user.id, {
        subscription_status: 'paused',
        properties_limit: 0 // Revoke access
      });

      // Send notification email
      await base44.integrations.Core.SendEmail({
        to: user.email,
        subject: 'Your Premiso trial has expired',
        body: `Your 14-day trial ended on ${new Date(user.trial_ends_at).toDateString()}. Upgrade now to continue using Premiso: https://app.premiso.io/billing`
      });
    }

    return Response.json({
      message: `Paused ${expiredTrials.length} expired trials`,
      count: expiredTrials.length
    });
  } catch (error) {
    console.error('Trial expiry check error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});