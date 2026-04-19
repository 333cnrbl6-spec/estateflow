/**
 * Premiso Pricing & Competitive Structure
 * Updated April 2026 with platform unified improvements
 */

export const PREMISO_TIERS = [
  {
    id: 'starter',
    name: 'Starter',
    monthlyPrice: 199,
    annualPrice: 1990,
    annualSavings: 388,
    maxUnits: 75,
    maxProperties: 15,
    maxCompanies: 1,
    description: 'For individual landlords and boutique letting agencies',
    audience: ['Individual Landlords', 'Buy-to-Let Investors', 'Small Letting Agencies'],
    badge: 'Best for Solo Ops',
    features: [
      'Up to 75 units across 15 properties',
      'Multi-unit property support',
      'Tenant & landlord portal with online rent payment',
      'Maintenance request system with contractor portal',
      'Gas Safety, EPC, EICR, Boiler Service tracking',
      'Deposit protection compliance monitoring',
      'Automated rent payment reminders',
      'Rent ledger with arrears alerts',
      'Basic compliance dashboard',
      'Document upload & storage (unlimited)',
      'Email support (24-48 hour response)',
    ],
    notIncluded: ['Block management', 'Sales CRM', 'Out-of-hours service', 'Accounting sync', 'White-label portal'],
  },
  {
    id: 'professional',
    name: 'Professional',
    monthlyPrice: 449,
    annualPrice: 4490,
    annualSavings: 898,
    maxUnits: 400,
    maxProperties: 100,
    maxCompanies: 10,
    description: 'The complete unified platform for lettings, block management & compliance',
    audience: ['Established Lettings Agents', 'Block & Leasehold Managers', 'Multi-company Groups', 'Freeholders'],
    highlight: true,
    badge: 'Most Popular',
    features: [
      'Everything in Starter, plus:',
      'Up to 400 units across 100 properties',
      'Multi-company & group structure',
      'Block & leasehold management',
      'Service charge accounts with detailed budgeting',
      'Ground rent collection & tracking',
      'Section 20 consultation automation',
      'RTM company claim management',
      'Advanced compliance hub (15+ certificate types)',
      'Fire Safety Register with automated testing cycles',
      'Residential sales CRM (leads → valuations → completion)',
      'Automated reporting suite (P&L, cash flow, compliance)',
      'Xero, QuickBooks, Sage 50 live sync',
      'Predictive maintenance insights',
      'White-label tenant portal',
      'Webhook & custom API support',
      'Priority email & phone support (9am-6pm)',
    ],
    notIncluded: ['Out-of-hours 24/7 service', 'Custom integrations', 'Dedicated account manager'],
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    monthlyPrice: 999,
    annualPrice: 9990,
    annualSavings: 1998,
    maxUnits: null,
    maxProperties: null,
    maxCompanies: null,
    description: 'For large groups, multi-region operators and complex portfolios',
    audience: ['Large Management Groups', '500+ Unit Portfolios', 'Multi-location Operators', 'Institutional Landlords'],
    badge: 'Full Power',
    features: [
      'Everything in Professional, plus:',
      'Unlimited units, properties & companies',
      '24/7 out-of-hours emergency call centre (integrated)',
      'Automated emergency maintenance dispatch system',
      'Dedicated account manager & onboarding team',
      'Custom API & webhook framework with priority support',
      'Advanced user role management with granular permissions',
      'Custom reporting & interactive BI dashboards',
      'SLA guarantees (99.9% uptime)',
      'Full data migration & historical import',
      'Staff training & certification program',
      'Advanced analytics & business intelligence',
      'Multi-currency & international property support',
      'Custom branding & white-label all portals',
    ],
  },
];

// Competitor pricing for equivalent functionality bundles
export const COMPETITOR_COSTS = {
  smallPortfolio: {
    // 50-75 units, single company, basic lettings
    premiso: 199,
    goodlord: 120,
    keogh: 180,
    appfolio: 350,
    note: 'Basic lettings only, no block management',
  },
  mediumPortfolio: {
    // 200-400 units, multi-company, lettings + block mgmt
    premiso: 449, // All-in-one unified platform
    appfolio: 1200, // Base £600 + £300 block mgmt + £300 out-of-hours
    goodlord: 300, // £150 lettings + £150 separate block mgmt software
    yardi: 1500, // Minimum enterprise tier
    reapit: 800,
    note: 'Premiso unified vs competitors modular add-ons',
  },
  largePortfolio: {
    // 500+ units, unlimited companies, full suite
    premiso: 999, // All-in-one with 24/7 out-of-hours
    appfolio: 2400, // Multiple modules + dedicated support
    yardi: 3000, // Enterprise implementation
    rent_manager: 1800,
    rent_solution: 2200,
    note: 'Full suite comparison on larger operations',
  },
};

// Recommendation logic based on demo data
export const recommendTier = (portfolioSize, propertyTypes, currentSoftware, features) => {
  const unitCount = parsePortfolioSize(portfolioSize);
  const hasBlockMgmt = propertyTypes?.includes('Block Management');
  const hasSales = propertyTypes?.includes('Sales');

  if (unitCount <= 50 && !hasBlockMgmt && !hasSales) {
    return {
      recommendedTier: 'starter',
      reason: 'Your portfolio size and feature set align perfectly with Starter tier.',
      confidence: 'high',
    };
  } else if (unitCount <= 250 && (hasBlockMgmt || hasSales || unitCount > 50)) {
    return {
      recommendedTier: 'professional',
      reason: `Your ${unitCount}-unit portfolio${hasBlockMgmt ? ' with block management' : ''}${hasSales ? ' and sales requirements' : ''} is ideal for Professional tier.`,
      confidence: 'high',
    };
  } else {
    return {
      recommendedTier: 'enterprise',
      reason: `Your larger portfolio (${unitCount}+ units) and complexity require Enterprise features and dedicated support.`,
      confidence: 'high',
    };
  }
};

function parsePortfolioSize(sizeLabel) {
  const map = {
    '1–10 units': 10,
    '11–50 units': 50,
    '51–150 units': 150,
    '151–500 units': 500,
    '500+ units': 1000,
  };
  return map[sizeLabel] || 50;
}

// Annual cost comparison data generator
export const generateComparisonData = (portfolioSize, features) => {
  const unitCount = parsePortfolioSize(portfolioSize);
  let scenario = 'small';
  if (unitCount <= 250) scenario = 'medium';
  if (unitCount > 250) scenario = 'large';
  const key = `${scenario}Portfolio`;

  return {
    scenario: key,
    unitCount,
    premiso: PREMISO_TIERS[scenario === 'small' ? 0 : scenario === 'medium' ? 1 : 2],
    competitors: COMPETITOR_COSTS[key] || {},
  };
};

export default {
  PREMISO_TIERS,
  COMPETITOR_COSTS,
  recommendTier,
  generateComparisonData,
};