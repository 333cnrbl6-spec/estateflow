/**
 * syncStripePricingTiers
 * Fetches all Stripe products and prices, extracts product/price IDs for each tier,
 * and returns the mapping to be used for updating lib/pricingTiers.js
 */
import Stripe from 'npm:stripe';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));

const TIER_NAMES = {
  lite: 'Lite',
  starter: 'Starter',
  professional: 'Professional',
  enterprise: 'Enterprise',
};

Deno.serve(async (req) => {
  try {
    // Fetch all products from Stripe
    const products = await stripe.products.list({ limit: 100 });
    
    const tierMap = {};

    // For each tier, find matching product and extract price IDs
    for (const [tierId, tierName] of Object.entries(TIER_NAMES)) {
      const product = products.data.find(p => p.name === tierName);
      
      if (!product) {
        console.warn(`Stripe product not found for tier: ${tierName}`);
        continue;
      }

      tierMap[tierId] = {
        product_id: product.id,
        monthly_price_id: null,
        annual_price_id: null,
      };

      // Fetch prices for this product
      const prices = await stripe.prices.list({
        product: product.id,
        limit: 100,
      });

      // Separate monthly and annual prices
      for (const price of prices.data) {
        if (price.billing_scheme === 'per_unit' && price.recurring) {
          if (price.recurring.interval === 'month') {
            tierMap[tierId].monthly_price_id = price.id;
          } else if (price.recurring.interval === 'year') {
            tierMap[tierId].annual_price_id = price.id;
          }
        }
      }
    }

    // Generate environment variable export format
    const envVars = [];
    for (const [tierId, data] of Object.entries(tierMap)) {
      const prefix = `VITE_STRIPE_${tierId.toUpperCase()}`;
      envVars.push(`${prefix}_PRODUCT=${data.product_id}`);
      envVars.push(`${prefix}_MONTHLY=${data.monthly_price_id}`);
      envVars.push(`${prefix}_ANNUAL=${data.annual_price_id}`);
    }

    return Response.json({
      success: true,
      tiers: tierMap,
      envVarExport: envVars.join('\n'),
      instructions: 'Copy the envVarExport values to your .env file or platform settings',
    });
  } catch (error) {
    console.error('Stripe sync error:', error);
    return Response.json(
      { error: error.message || 'Failed to sync Stripe pricing tiers' },
      { status: 500 }
    );
  }
});