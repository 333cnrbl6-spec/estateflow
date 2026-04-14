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

    const { tenant_id, amount, payment_type } = await req.json();

    const tenant = await base44.asServiceRole.entities.Tenant.get(tenant_id);
    if (!tenant) {
      return Response.json({ error: 'Tenant not found' }, { status: 404 });
    }

    // Get or create Stripe customer
    let stripeCustomerId = tenant.stripe_customer_id;

    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: tenant.email,
        name: tenant.full_name,
        metadata: {
          tenant_id: tenant_id
        }
      });
      stripeCustomerId = customer.id;

      // Update tenant with Stripe customer ID
      await base44.asServiceRole.entities.Tenant.update(tenant_id, {
        stripe_customer_id: stripeCustomerId
      });
    }

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: 'gbp',
      customer: stripeCustomerId,
      metadata: {
        tenant_id,
        payment_type,
        tenant_email: tenant.email
      },
      description: `Rent payment for ${tenant.full_name}`
    });

    console.log(`[Stripe Payment] Created payment intent ${paymentIntent.id} for tenant ${tenant_id}`);

    return Response.json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id
    });
  } catch (error) {
    console.error('[Stripe Payment] Error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});