import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { invoiceId, stripeCustomerId } = body;

    if (!invoiceId || !stripeCustomerId) {
      return Response.json(
        { error: 'Missing invoiceId or stripeCustomerId' },
        { status: 400 }
      );
    }

    // Fetch invoice
    const invoices = await base44.entities.Invoice.filter(
      { id: invoiceId },
      undefined,
      1
    );

    if (!invoices.length) {
      return Response.json(
        { error: 'Invoice not found' },
        { status: 404 }
      );
    }

    const invoice = invoices[0];

    // Check if already paid
    if (invoice.payment_status === 'succeeded') {
      return Response.json(
        { error: 'Invoice already paid' },
        { status: 400 }
      );
    }

    const stripeApiKey = Deno.env.get('STRIPE_SECRET_KEY');
    if (!stripeApiKey) {
      return Response.json(
        { error: 'Stripe not configured' },
        { status: 500 }
      );
    }

    // Create Stripe PaymentIntent
    const paymentIntentResponse = await fetch(
      'https://api.stripe.com/v1/payment_intents',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${stripeApiKey}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          amount: Math.round(invoice.amount * 100), // Convert to pence
          currency: 'gbp',
          customer: stripeCustomerId,
          description: `Invoice ${invoice.invoice_number}`,
          metadata: {
            invoice_id: invoice.id,
            invoice_number: invoice.invoice_number,
          },
        }),
      }
    );

    if (!paymentIntentResponse.ok) {
      const error = await paymentIntentResponse.json();
      return Response.json(
        { error: error.error.message },
        { status: 400 }
      );
    }

    const paymentIntent = await paymentIntentResponse.json();

    // Update invoice with Stripe details
    await base44.entities.Invoice.update(invoiceId, {
      stripe_payment_intent_id: paymentIntent.id,
      payment_method: 'stripe',
      payment_status: 'pending',
      status: 'sent',
    });

    return Response.json({
      success: true,
      client_secret: paymentIntent.client_secret,
      payment_intent_id: paymentIntent.id,
    });
  } catch (error) {
    console.error('Payment processing error:', error);
    return Response.json(
      { error: error.message },
      { status: 500 }
    );
  }
});