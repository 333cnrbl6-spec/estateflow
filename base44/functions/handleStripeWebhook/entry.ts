import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';
import Stripe from 'npm:stripe@13.0.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));
const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');

Deno.serve(async (req) => {
  try {
    if (!webhookSecret) {
      return Response.json({ error: 'Webhook secret not configured' }, { status: 500 });
    }

    const signature = req.headers.get('stripe-signature');
    const body = await req.text();

    let event;
    try {
      event = await stripe.webhooks.constructEventAsync(
        body,
        signature,
        webhookSecret
      );
    } catch (err) {
      return Response.json({ error: `Webhook error: ${err.message}` }, { status: 400 });
    }

    const base44 = createClientFromRequest(req);

    // Handle different event types
    switch (event.type) {
      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(base44, event.data.object);
        break;

      case 'invoice.payment_failed':
        await handlePaymentFailed(base44, event.data.object);
        break;

      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(base44, event.data.object);
        break;

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(base44, event.data.object);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return Response.json({ received: true });

  } catch (error) {
    console.error('Webhook error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});

async function handlePaymentSucceeded(base44, invoice) {
  try {
    // Find recurring payment by subscription ID
    const recurringPayments = await base44.asServiceRole.entities.RecurringPayment.filter(
      { stripe_subscription_id: invoice.subscription },
      '-created_at',
      1
    );

    if (recurringPayments.length === 0) {
      console.log(`No recurring payment found for subscription ${invoice.subscription}`);
      return;
    }

    const recurringPayment = recurringPayments[0];
    const tenant_id = recurringPayment.tenant_id;
    const property_id = recurringPayment.property_id;

    // Create rent ledger entry as paid
    const rentLedger = await base44.asServiceRole.entities.RentLedger.create({
      tenant_id,
      property_id,
      unit_id: recurringPayment.unit_id,
      amount_due: recurringPayment.monthly_amount,
      amount_paid: recurringPayment.monthly_amount,
      due_date: new Date(invoice.period_start * 1000).toISOString().split('T')[0],
      paid_date: new Date().toISOString(),
      payment_method: 'stripe',
      payment_reference: invoice.id,
      status: 'paid',
      notes: `Auto-paid via Stripe subscription ${invoice.subscription}`
    });

    // Update next payment date
    await base44.asServiceRole.entities.RecurringPayment.update(recurringPayment.id, {
      last_payment_date: new Date().toISOString(),
      next_payment_date: new Date(invoice.period_end * 1000).toISOString()
    });

    // Log
    await base44.asServiceRole.entities.AuditLog.create({
      action: 'payment.succeeded',
      entity_type: 'RentLedger',
      entity_id: rentLedger.id,
      notes: `Rent payment received via Stripe for ${recurringPayment.monthly_amount} GBP`,
      timestamp: new Date().toISOString()
    });

    // Send confirmation email
    try {
      await base44.integrations.Core.SendEmail({
        to: recurringPayment.tenant_email || await getTenantEmail(base44, tenant_id),
        subject: 'Rent Payment Received',
        body: `Your rent payment of £${(recurringPayment.monthly_amount / 100).toFixed(2)} has been successfully processed.`
      });
    } catch (err) {
      console.log('Email send failed:', err.message);
    }

  } catch (error) {
    console.error('Payment succeeded handler error:', error);
  }
}

async function handlePaymentFailed(base44, invoice) {
  try {
    const recurringPayments = await base44.asServiceRole.entities.RecurringPayment.filter(
      { stripe_subscription_id: invoice.subscription },
      '-created_at',
      1
    );

    if (recurringPayments.length === 0) return;

    const recurringPayment = recurringPayments[0];
    const tenant_id = recurringPayment.tenant_id;

    // Create failed payment record
    const rentLedger = await base44.asServiceRole.entities.RentLedger.create({
      tenant_id,
      property_id: recurringPayment.property_id,
      unit_id: recurringPayment.unit_id,
      amount_due: recurringPayment.monthly_amount,
      amount_paid: 0,
      due_date: new Date(invoice.period_start * 1000).toISOString().split('T')[0],
      status: 'pending',
      payment_method: 'stripe',
      notes: `Payment failed: ${invoice.last_finalization_error?.message || 'Unknown error'}`
    });

    // Send failure notification
    try {
      await base44.integrations.Core.SendEmail({
        to: recurringPayment.tenant_email || await getTenantEmail(base44, tenant_id),
        subject: 'Rent Payment Failed',
        body: `Your rent payment of £${(recurringPayment.monthly_amount / 100).toFixed(2)} could not be processed. Please update your payment method or contact support.`
      });
    } catch (err) {
      console.log('Email send failed:', err.message);
    }

  } catch (error) {
    console.error('Payment failed handler error:', error);
  }
}

async function handleSubscriptionUpdated(base44, subscription) {
  try {
    const recurringPayments = await base44.asServiceRole.entities.RecurringPayment.filter(
      { stripe_subscription_id: subscription.id },
      '-created_at',
      1
    );

    if (recurringPayments.length === 0) return;

    // Update subscription status
    const newStatus = subscription.status === 'active' ? 'active' : 'paused';
    await base44.asServiceRole.entities.RecurringPayment.update(recurringPayments[0].id, {
      status: newStatus
    });

  } catch (error) {
    console.error('Subscription updated handler error:', error);
  }
}

async function handleSubscriptionDeleted(base44, subscription) {
  try {
    const recurringPayments = await base44.asServiceRole.entities.RecurringPayment.filter(
      { stripe_subscription_id: subscription.id },
      '-created_at',
      1
    );

    if (recurringPayments.length === 0) return;

    // Mark as cancelled
    await base44.asServiceRole.entities.RecurringPayment.update(recurringPayments[0].id, {
      status: 'cancelled',
      cancelled_date: new Date().toISOString()
    });

  } catch (error) {
    console.error('Subscription deleted handler error:', error);
  }
}

async function getTenantEmail(base44, tenant_id) {
  const tenant = await base44.asServiceRole.entities.Tenant.get(tenant_id);
  return tenant?.email || '';
}