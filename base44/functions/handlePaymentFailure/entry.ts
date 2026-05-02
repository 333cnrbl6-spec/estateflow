import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';
import Stripe from 'npm:stripe@14.0.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { event } = await req.json();

    // Handle Stripe payment failure webhook
    if (event.type === 'invoice.payment_failed') {
      const invoice = event.data.object;
      const customerId = invoice.customer;

      // Get user by stripe_customer_id
      const users = await base44.asServiceRole.entities.User.list('-updated_date', 100);
      const user = users.find(u => u.stripe_customer_id === customerId);

      if (!user) return Response.json({ error: 'User not found' });

      // Day 1: Mark as past_due + send email
      if (!user.payment_failure_notified_at) {
        await base44.asServiceRole.entities.User.update(user.id, {
          subscription_status: 'past_due',
          payment_failure_notified_at: new Date().toISOString()
        });

        await base44.integrations.Core.SendEmail({
          to: user.email,
          subject: 'Payment failed - Action required',
          body: `Your payment of £${(invoice.amount_due / 100).toFixed(2)} failed. Update your payment method: https://app.premiso.io/billing/payment-methods`
        });
      }

      // Day 7: Pause account if still unpaid
      const notifiedDate = new Date(user.payment_failure_notified_at);
      const daysSinceFailed = (Date.now() - notifiedDate.getTime()) / (1000 * 60 * 60 * 24);

      if (daysSinceFailed > 7) {
        await base44.asServiceRole.entities.User.update(user.id, {
          subscription_status: 'paused',
          properties_limit: 0
        });

        await base44.integrations.Core.SendEmail({
          to: user.email,
          subject: 'Your Premiso account has been paused',
          body: 'Your account is now paused due to payment failure. Resolve this within 30 days or your data will be deleted.'
        });
      }
    }

    return Response.json({ success: true });
  } catch (error) {
    console.error('Payment failure handler error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});