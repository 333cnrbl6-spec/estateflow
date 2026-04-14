import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';
import Stripe from 'npm:stripe@13.0.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { tenant_id } = await req.json();

    if (!tenant_id) {
      return Response.json({ error: 'Missing tenant_id' }, { status: 400 });
    }

    const tenant = await base44.asServiceRole.entities.Tenant.get(tenant_id);
    if (!tenant) {
      return Response.json({ error: 'Tenant not found' }, { status: 404 });
    }

    // Create or get Stripe customer
    let stripeCustomer;
    if (tenant.stripe_customer_id) {
      stripeCustomer = await stripe.customers.retrieve(tenant.stripe_customer_id);
    } else {
      stripeCustomer = await stripe.customers.create({
        email: tenant.email,
        name: tenant.full_name,
        metadata: { tenant_id }
      });

      await base44.asServiceRole.entities.Tenant.update(tenant_id, {
        stripe_customer_id: stripeCustomer.id
      });
    }

    // Create setup intent for future payments
    const setupIntent = await stripe.setupIntents.create({
      customer: stripeCustomer.id,
      payment_method_types: ['card'],
      usage: 'off_session'
    });

    return Response.json({
      success: true,
      client_secret: setupIntent.client_secret,
      stripe_customer_id: stripeCustomer.id
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});