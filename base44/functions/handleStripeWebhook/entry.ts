/**
 * handleStripeWebhook
 * Processes Stripe webhook events (subscription.created, customer.subscription.updated, etc.)
 */
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';
import Stripe from 'npm:stripe';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));
const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');

Deno.serve(async (req) => {
  try {
    const signature = req.headers.get('stripe-signature');
    if (!signature) {
      return Response.json({ error: 'Missing signature' }, { status: 400 });
    }

    const body = await req.text();

    let event;
    try {
      event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret);
    } catch (err) {
      console.error('Webhook signature verification failed:', err.message);
      return Response.json({ error: 'Invalid signature' }, { status: 401 });
    }

    console.log(`Processing Stripe webhook: ${event.type}`);

    // Handle subscription events
    if (event.type === 'customer.subscription.created' || event.type === 'customer.subscription.updated') {
      const subscription = event.data.object;
      const base44 = createClientFromRequest(req);

      // Get user ID from metadata
      const userId = subscription.metadata?.userId;
      const tierId = subscription.metadata?.tierId;
      const isFounder = subscription.metadata?.isFounder === 'true';

      if (!userId) {
        console.error('Missing userId in subscription metadata');
        return Response.json({ success: true }); // Don't fail webhook
      }

      // Update user's subscription status
      try {
        await base44.asServiceRole.entities.User.update(userId, {
          subscription_tier: tierId,
          subscription_status: subscription.status,
          subscription_id: subscription.id,
          is_founder: isFounder,
          subscription_end_date: subscription.current_period_end ? new Date(subscription.current_period_end * 1000).toISOString() : null,
        });
        console.log(`Updated user ${userId} with subscription ${subscription.id}`);
      } catch (updateErr) {
        console.error('Failed to update user subscription:', updateErr.message);
      }
    }

    if (event.type === 'customer.subscription.deleted') {
      const subscription = event.data.object;
      const base44 = createClientFromRequest(req);
      const userId = subscription.metadata?.userId;

      if (userId) {
        try {
          await base44.asServiceRole.entities.User.update(userId, {
            subscription_status: 'cancelled',
            subscription_tier: null,
          });
          console.log(`Cancelled subscription for user ${userId}`);
        } catch (updateErr) {
          console.error('Failed to cancel user subscription:', updateErr.message);
        }
      }
    }

    if (event.type === 'invoice.payment_succeeded') {
      const invoice = event.data.object;
      console.log(`Payment succeeded for invoice ${invoice.id}`);
      // Could trigger email confirmation here
    }

    if (event.type === 'invoice.payment_failed') {
      const invoice = event.data.object;
      console.error(`Payment failed for invoice ${invoice.id}`);
      // Could trigger email retry notification here
    }

    return Response.json({ success: true });
  } catch (error) {
    console.error('Webhook handler error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});