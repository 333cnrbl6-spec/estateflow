/**
 * createCheckoutSession
 * Creates a Stripe Checkout session for subscription signup
 */
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';
import Stripe from 'npm:stripe';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { priceId } = body;

    if (!priceId) {
      return Response.json({ error: 'Missing priceId' }, { status: 400 });
    }

    // SECURITY: the tier, billing mode and founder status are resolved server-side from Stripe
    // and the user record — never taken from the request body.
    const price = await stripe.prices.retrieve(priceId, { expand: ['product'] });
    if (!price || price.active === false || price.type !== 'recurring') {
      return Response.json({ error: 'Invalid subscription price' }, { status: 400 });
    }

    const tierId = price.metadata?.tier || price.product?.metadata?.tier || 'unknown';
    const isFounder = user.is_founder === true;
    const billingMode = price.recurring?.interval === 'year' ? 'annual' : 'monthly';

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      customer_email: user.email,
      client_reference_id: user.id,
      metadata: {
        userId: user.id,
        email: user.email,
        tierId,
        billingMode,
        isFounder: isFounder ? 'true' : 'false',
      },
      success_url: `${Deno.env.get('APP_URL')}/billing/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${Deno.env.get('APP_URL')}/pricing`,
      subscription_data: {
        metadata: {
          userId: user.id,
          tierId,
          isFounder: isFounder ? 'true' : 'false',
        },
      },
    });

    return Response.json({ sessionId: session.id });
  } catch (error) {
    console.error('Checkout session error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});