import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';
import Stripe from 'npm:stripe@14.0.0';
import { z } from 'npm:zod@3.24.2';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));

const PaymentSchema = z.object({
  tenant_id: z.string().min(1, 'Tenant ID required'),
  amount: z.number().int().positive('Amount must be positive'),
  payment_type: z.enum(['rent', 'deposit', 'service_charge']).default('rent'),
});

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let body;
    try {
      body = await req.json();
    } catch {
      return Response.json({ error: 'Invalid JSON' }, { status: 400 });
    }

    // Validate input
    const validation = PaymentSchema.safeParse(body);
    if (!validation.success) {
      const errors = validation.error.errors.map(e => `${e.path.join('.')}: ${e.message}`);
      return Response.json({ error: 'Validation failed', details: errors }, { status: 400 });
    }

    const { tenant_id, amount, payment_type } = validation.data;

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
    // Never expose error details to client—log securely server-side only
    console.error('[Stripe Payment] Error:', error.message);
    return Response.json({ error: 'Payment intent creation failed. Please try again or contact support.' }, { status: 500 });
    }
});