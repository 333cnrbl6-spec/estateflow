/**
 * updatePricingTiers
 * Admin-only function to fetch Stripe pricing and generate updated pricingTiers.js file content
 */
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';
import Stripe from 'npm:stripe';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));

const TIER_CONFIG = {
  lite: {
    name: 'Lite',
    description: 'Get started with property management',
    price: 49,
    annual_price: 490,
    annual_savings: 98,
    properties: '1-2',
    users: '1',
    features: [
      'Up to 2 properties',
      '1 user account',
      'Read-only tenant portal',
      'Basic reporting',
      'Email support',
    ],
    excluded: [
      'Advanced compliance tracking',
      'Maintenance scheduling',
      'Service charge accounting',
      'API access',
      'Custom integrations',
    ],
    recommended: false,
  },
  starter: {
    name: 'Starter',
    description: 'For independent agents & small landlords',
    price: 79,
    annual_price: 790,
    annual_savings: 158,
    properties: '1-5',
    users: '1-2',
    features: [
      'Up to 5 properties',
      '2 user accounts',
      'Full tenant portal',
      'Maintenance tracking',
      'Financial reports',
      'Rent reminders',
      'Email & chat support',
    ],
    excluded: [
      'Block management',
      'Service charge accounting',
      'Advanced compliance',
      'API access',
    ],
    recommended: false,
  },
  professional: {
    name: 'Professional',
    description: 'For growing agencies & portfolio managers',
    price: 249,
    annual_price: 2490,
    annual_savings: 498,
    properties: '6-25',
    users: '3-5',
    features: [
      'Up to 25 properties',
      '5 user accounts',
      'Full tenant & contractor portals',
      'Compliance tracking (Gas, EICR, EPC)',
      'Service charge basics',
      'Xero/Sage integration',
      'Advanced reporting',
      'Priority email support',
    ],
    excluded: [
      'Block management (RTM)',
      'Out-of-hours service',
      'Dedicated account manager',
      'Custom workflows',
    ],
    recommended: true,
  },
  enterprise: {
    name: 'Enterprise',
    description: 'For large groups & block management',
    price: 899,
    annual_price: 8990,
    annual_savings: 1798,
    properties: '26+',
    users: 'Unlimited',
    features: [
      'Unlimited properties',
      'Unlimited user accounts',
      'Full block management suite',
      'Service charge accounting (full)',
      'Advanced compliance suite',
      'All integrations (Xero, Sage, QB)',
      'Out-of-hours API access',
      'Custom workflows & automation',
      'Dedicated account manager',
      'Phone & email support (24/5)',
    ],
    excluded: [],
    recommended: false,
  },
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    // Fetch all Stripe products
    const products = await stripe.products.list({ limit: 100 });
    const tierMap = {};

    // Map each tier to its Stripe product and prices
    for (const [tierId, config] of Object.entries(TIER_CONFIG)) {
      const product = products.data.find(p => p.name === config.name);

      if (!product) {
        console.warn(`Stripe product "${config.name}" not found`);
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

      // Extract monthly and annual price IDs
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

    // Build environment variable strings
    const envVars = [];
    for (const [tierId, ids] of Object.entries(tierMap)) {
      const prefix = `VITE_STRIPE_${tierId.toUpperCase()}`;
      envVars.push(`${prefix}_PRODUCT=${ids.product_id}`);
      envVars.push(`${prefix}_MONTHLY=${ids.monthly_price_id}`);
      envVars.push(`${prefix}_ANNUAL=${ids.annual_price_id}`);
    }

    return Response.json({
      success: true,
      message: 'Stripe pricing tiers fetched successfully',
      tiers: tierMap,
      environmentVariables: envVars,
      instructions:
        'Add these environment variables to your .env file or platform settings:\n' +
        envVars.join('\n'),
    });
  } catch (error) {
    console.error('Error updating pricing tiers:', error);
    return Response.json(
      { error: error.message || 'Failed to fetch Stripe pricing tiers' },
      { status: 500 }
    );
  }
});