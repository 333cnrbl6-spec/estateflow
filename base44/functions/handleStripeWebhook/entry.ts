import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const stripeWebhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');
    if (!stripeWebhookSecret) {
      return Response.json(
        { error: 'Webhook secret not configured' },
        { status: 500 }
      );
    }

    const signature = req.headers.get('stripe-signature');
    const body = await req.text();

    // Verify webhook signature using Stripe webhook library
    const stripe = await import('npm:stripe@17.0.0').then(m => new m.default(
      Deno.env.get('STRIPE_SECRET_KEY')
    ));

    let event;
    try {
      event = await stripe.webhooks.constructEventAsync(
        body,
        signature,
        stripeWebhookSecret
      );
    } catch (err) {
      return Response.json(
        { error: `Webhook signature verification failed: ${err.message}` },
        { status: 400 }
      );
    }

    // Now authenticate with Base44
    const base44 = createClientFromRequest(req);

    // Handle payment intent events
    if (event.type === 'payment_intent.succeeded') {
      const paymentIntent = event.data.object;
      const invoiceId = paymentIntent.metadata?.invoice_id;

      if (invoiceId) {
        const today = new Date();
        await base44.asServiceRole.entities.Invoice.update(invoiceId, {
          payment_status: 'succeeded',
          status: 'paid',
          paid_date: today.toISOString().split('T')[0],
          stripe_payment_intent_id: paymentIntent.id,
          payment_method: 'stripe',
        });
      }
    } else if (event.type === 'payment_intent.payment_failed') {
      const paymentIntent = event.data.object;
      const invoiceId = paymentIntent.metadata?.invoice_id;

      if (invoiceId) {
        await base44.asServiceRole.entities.Invoice.update(invoiceId, {
          payment_status: 'failed',
          status: 'issued',
        });
      }
    }

    return Response.json({ received: true });
  } catch (error) {
    console.error('Webhook processing error:', error);
    return Response.json(
      { error: error.message },
      { status: 500 }
    );
  }
});