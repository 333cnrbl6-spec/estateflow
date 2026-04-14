import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';
import Stripe from 'npm:stripe@14.0.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));
const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');

Deno.serve(async (req) => {
  try {
    // Verify webhook signature
    const signature = req.headers.get('stripe-signature');
    const body = await req.text();

    if (!signature || !webhookSecret) {
      return Response.json({ error: 'Missing signature or secret' }, { status: 400 });
    }

    let event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error('[Stripe Webhook] Signature verification failed:', err);
      return Response.json({ error: 'Invalid signature' }, { status: 400 });
    }

    const base44 = createClientFromRequest(req);

    // Handle payment intent succeeded
    if (event.type === 'payment_intent.succeeded') {
      const paymentIntent = event.data.object;
      await handlePaymentSucceeded(base44, paymentIntent);
    }

    // Handle setup intent succeeded (recurring payment)
    if (event.type === 'setup_intent.succeeded') {
      const setupIntent = event.data.object;
      await handleSetupIntentSucceeded(base44, setupIntent);
    }

    return Response.json({ received: true });
  } catch (error) {
    console.error('[Stripe Webhook] Error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});

async function handlePaymentSucceeded(base44, paymentIntent) {
  const tenantId = paymentIntent.metadata?.tenant_id;
  const tenantEmail = paymentIntent.metadata?.tenant_email;
  const amount = paymentIntent.amount / 100; // Convert from pence to pounds

  if (!tenantId) {
    console.log('[Stripe Webhook] No tenant_id in metadata, skipping');
    return;
  }

  console.log(`[Stripe Webhook] Processing payment succeeded for tenant ${tenantId}, amount: £${amount}`);

  // Create financial transaction
  const transaction = await base44.asServiceRole.entities.FinancialTransaction.create({
    tenant_id: tenantId,
    property_id: (await base44.asServiceRole.entities.Tenant.get(tenantId))?.property_id,
    transaction_type: 'rent',
    amount,
    status: 'paid',
    transaction_date: new Date().toISOString(),
    reference: paymentIntent.id,
    payment_method: 'card',
    notes: `Stripe payment ${paymentIntent.id}`
  });

  console.log(`[Stripe Webhook] Created transaction ${transaction.id}`);

  // Send payment confirmation email
  await base44.asServiceRole.integrations.Core.SendEmail({
    to: tenantEmail,
    subject: '✓ Rent Payment Confirmed',
    body: `
      <h2>Payment Confirmed</h2>
      <p>Your rent payment of <strong>£${amount.toLocaleString('en-GB', { minimumFractionDigits: 2 })}</strong> has been received and processed.</p>
      <p><strong>Reference:</strong> ${paymentIntent.id}</p>
      <p><strong>Date:</strong> ${new Date().toLocaleDateString('en-GB')}</p>
      <p>Thank you for your payment.</p>
    `
  });
}

async function handleSetupIntentSucceeded(base44, setupIntent) {
  const tenantId = setupIntent.metadata?.tenant_id;
  const monthlyAmount = setupIntent.metadata?.monthly_amount ? setupIntent.metadata.monthly_amount / 100 : 0;
  const tenantEmail = setupIntent.metadata?.tenant_email;

  if (!tenantId || !setupIntent.payment_method) {
    console.log('[Stripe Webhook] Missing tenant info or payment method');
    return;
  }

  console.log(`[Stripe Webhook] Setting up recurring payment for tenant ${tenantId}, £${monthlyAmount}/month`);

  // Create recurring payment record
  const tenant = await base44.asServiceRole.entities.Tenant.get(tenantId);

  const recurringPayment = await base44.asServiceRole.entities.RecurringPayment.create({
    tenant_id: tenantId,
    property_id: tenant?.property_id,
    stripe_customer_id: setupIntent.customer,
    stripe_payment_method_id: setupIntent.payment_method,
    monthly_amount: monthlyAmount * 100, // Store in pence
    status: 'active',
    start_date: new Date().toISOString(),
    notes: `Setup via Stripe ${setupIntent.id}`
  });

  console.log(`[Stripe Webhook] Created recurring payment record ${recurringPayment.id}`);

  // Send confirmation email
  await base44.asServiceRole.integrations.Core.SendEmail({
    to: tenantEmail,
    subject: '✓ Recurring Rent Payment Set Up',
    body: `
      <h2>Recurring Payment Activated</h2>
      <p>Your recurring rent payment has been successfully set up.</p>
      <p><strong>Monthly Amount:</strong> £${monthlyAmount.toLocaleString('en-GB', { minimumFractionDigits: 2 })}</p>
      <p><strong>Billing Date:</strong> 1st of each month</p>
      <p>Your card ending in •••• will be automatically charged on the 1st of each month.</p>
      <p>You can modify or cancel this arrangement anytime by contacting us.</p>
    `
  });
}