/**
 * Pricing tier definitions and Stripe product mapping
 */

export const PRICING_TIERS = [
  {
    id: 'lite',
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
    stripe_product: process.env.REACT_APP_STRIPE_LITE_PRODUCT,
    stripe_price_monthly: process.env.REACT_APP_STRIPE_LITE_MONTHLY,
    stripe_price_annual: process.env.REACT_APP_STRIPE_LITE_ANNUAL,
    recommended: false,
  },
  {
    id: 'starter',
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
    stripe_product: process.env.REACT_APP_STRIPE_STARTER_PRODUCT,
    stripe_price_monthly: process.env.REACT_APP_STRIPE_STARTER_MONTHLY,
    stripe_price_annual: process.env.REACT_APP_STRIPE_STARTER_ANNUAL,
    recommended: false,
  },
  {
    id: 'professional',
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
    stripe_product: process.env.REACT_APP_STRIPE_PROFESSIONAL_PRODUCT,
    stripe_price_monthly: process.env.REACT_APP_STRIPE_PROFESSIONAL_MONTHLY,
    stripe_price_annual: process.env.REACT_APP_STRIPE_PROFESSIONAL_ANNUAL,
    recommended: true,
  },
  {
    id: 'enterprise',
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
    stripe_product: process.env.REACT_APP_STRIPE_ENTERPRISE_PRODUCT,
    stripe_price_monthly: process.env.REACT_APP_STRIPE_ENTERPRISE_MONTHLY,
    stripe_price_annual: process.env.REACT_APP_STRIPE_ENTERPRISE_ANNUAL,
    recommended: false,
  },
];

export const FOUNDER_DISCOUNT = 0.4; // 40% off

export function getTierById(id) {
  return PRICING_TIERS.find(t => t.id === id);
}

export function getRecommendedTier() {
  return PRICING_TIERS.find(t => t.recommended);
}

export function getMonthlyPrice(tierId, isFounder = false) {
  const tier = getTierById(tierId);
  if (!tier) return 0;
  const price = tier.price;
  return isFounder ? Math.round(price * (1 - FOUNDER_DISCOUNT)) : price;
}

export function getAnnualPrice(tierId, isFounder = false) {
  const tier = getTierById(tierId);
  if (!tier) return 0;
  const price = tier.annual_price;
  return isFounder ? Math.round(price * (1 - FOUNDER_DISCOUNT)) : price;
}