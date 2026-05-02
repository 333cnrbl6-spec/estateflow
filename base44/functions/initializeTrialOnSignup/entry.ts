import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';
import Stripe from 'npm:stripe@14.0.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Skip if trial already initialized
    if (user.trial_started_at) {
      return Response.json({ message: 'Trial already initialized' }, { status: 200 });
    }

    // Create Stripe customer
    const customer = await stripe.customers.create({
      email: user.email,
      metadata: { userId: user.id, businessName: user.business_name || user.email }
    });

    // Calculate trial end date (14 days from now)
    const now = new Date();
    const trialEndsAt = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);

    // Update user with trial info
    await base44.auth.updateMe({
      trial_started_at: now.toISOString(),
      trial_ends_at: trialEndsAt.toISOString(),
      subscription_status: 'trial',
      stripe_customer_id: customer.id,
      properties_limit: 5, // Starter tier default
      properties_used: 0
    });

    return Response.json({
      message: 'Trial initialized',
      trialEndsAt: trialEndsAt.toISOString(),
      stripeCustomerId: customer.id
    });
  } catch (error) {
    console.error('Trial init error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});