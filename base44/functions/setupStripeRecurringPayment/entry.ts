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

    const { tenant_id, property_id, unit_id, payment_method_id, monthly_amount, start_date } = await req.json();

    if (!tenant_id || !monthly_amount || !payment_method_id) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Fetch tenant
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
        metadata: {
          tenant_id,
          property_id,
          unit_id
        }
      });

      // Store Stripe customer ID in tenant
      await base44.asServiceRole.entities.Tenant.update(tenant_id, {
        stripe_customer_id: stripeCustomer.id
      });
    }

    // Create subscription
    const subscription = await stripe.subscriptions.create({
      customer: stripeCustomer.id,
      items: [
        {
          price_data: {
            currency: 'gbp',
            product_data: {
              name: `Rent Payment - ${property_id}`
            },
            recurring: {
              interval: 'month',
              interval_count: 1
            },
            unit_amount: Math.round(monthly_amount * 100) // Convert to pence
          }
        }
      ],
      payment_settings: {
        payment_method_types: ['card']
      },
      default_payment_method: payment_method_id,
      off_session: true,
      metadata: {
        tenant_id,
        property_id,
        unit_id
      },
      billing_cycle_anchor: start_date ? Math.floor(new Date(start_date).getTime() / 1000) : undefined
    });

    // Store recurring payment record
    const recurringPayment = await base44.asServiceRole.entities.RecurringPayment.create({
      tenant_id,
      property_id,
      unit_id,
      stripe_subscription_id: subscription.id,
      stripe_customer_id: stripeCustomer.id,
      payment_method_id,
      monthly_amount,
      start_date: start_date || new Date().toISOString(),
      status: 'active',
      next_payment_date: new Date(subscription.current_period_end * 1000).toISOString(),
      created_at: new Date().toISOString()
    });

    // Log audit
    await base44.asServiceRole.entities.AuditLog.create({
      action: 'recurring_payment.created',
      entity_type: 'RecurringPayment',
      entity_id: recurringPayment.id,
      user_email: user.email,
      notes: `Recurring payment setup for tenant ${tenant.full_name}`,
      timestamp: new Date().toISOString()
    });

    return Response.json({
      success: true,
      recurring_payment_id: recurringPayment.id,
      stripe_subscription_id: subscription.id,
      status: 'active',
      next_payment_date: recurringPayment.next_payment_date
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});