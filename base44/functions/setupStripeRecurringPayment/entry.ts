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

    const { tenant_id, monthly_amount, tenant_email, tenant_name } = await req.json();

    const tenant = await base44.asServiceRole.entities.Tenant.get(tenant_id);

    // SECURITY: only an admin or the tenant concerned may set up a recurring charge
    const canManage = user.role === 'admin' || (tenant && (
      tenant.created_by_id === user.id ||
      (tenant.email && user.email && tenant.email.toLowerCase() === user.email.toLowerCase())
    ));
    if (!canManage) {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }
    if (!tenant) {
      return Response.json({ error: 'Tenant not found' }, { status: 404 });
    }

    // Get or create Stripe customer
    let stripeCustomerId = tenant.stripe_customer_id;

    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: tenant_email,
        name: tenant_name,
        metadata: {
          tenant_id: tenant_id
        }
      });
      stripeCustomerId = customer.id;

      await base44.asServiceRole.entities.Tenant.update(tenant_id, {
        stripe_customer_id: stripeCustomerId
      });
    }

    // Create setup intent for recurring payment
    const setupIntent = await stripe.setupIntents.create({
      customer: stripeCustomerId,
      payment_method_types: ['card'],
      metadata: {
        tenant_id,
        monthly_amount,
        tenant_email
      }
    });

    console.log(`[Stripe Recurring] Created setup intent ${setupIntent.id} for tenant ${tenant_id}`);

    return Response.json({
      success: true,
      clientSecret: setupIntent.client_secret,
      setupIntentId: setupIntent.id
    });
  } catch (error) {
    console.error('[Stripe Recurring] Error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});