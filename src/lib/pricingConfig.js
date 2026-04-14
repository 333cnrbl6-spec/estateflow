/**
 * Premiso Pricing & Competitive Structure
 * Updated April 2026 with platform unified improvements
 */

export const PREMISO_TIERS = [
  {
    id: 'starter',
    name: 'Starter',
    monthlyPrice: 149,
    annualPrice: 1490,
    annualSavings: 298,
    maxUnits: 50,
    maxProperties: 10,
    maxCompanies: 1,
    description: 'Perfect for individual landlords and small portfolios',
    audience: ['Individual Landlords', 'Small Portfolio Owners', 'First-time Investors'],
    features: [
      'Up to 50 units across 10 properties',
      'Tenant portal with rent payment',
      'Maintenance job board & contractor portal',
      'Gas Safety & EICR certificate tracking',
      'Basic compliance alerts',
      'Rent ledger & payment collection',
      'Email support',
    ],
    notIncluded: ['Block management', 'Sales CRM', 'Out-of-hours service', 'Advanced reporting'],
  },
  {
    id: 'professional',
    name: 'Professional',
    monthlyPrice: 349,
    annualPrice: 3490,
    annualSavings: 698,
    maxUnits: 250,
    maxProperties: 50,
    maxCompanies: 5,
    description: 'For established lettings agents and block managers',
    audience: ['Lettings Agents', 'Block Managers', 'Freeholders', 'Multi-company Groups'],
    highlight: true,
    features: [
      'Up to 250 units across 50 properties',
      'All Starter features, plus:',
      'Block & leasehold management',
      'Service charge accounts & budgets',
      'Section 20 consultation automation',
      'RTM claim management',
      'Full compliance hub (all certificates)',
      'Residential sales CRM (valuations → completion)',
      'Multi-company group structure',
      'Landlord, leaseholder & contractor portals',
      'Automated reporting suite',
      'Xero, Sage, QuickBooks sync',
      'Priority email & phone support',
    ],
    notIncluded: ['Out-of-hours 24/7 service', 'White-label reseller'],
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    monthlyPrice: 799,
    annualPrice: 7990,
    annualSavings: 1598,
    maxUnits: null,
    maxProperties: null,
    maxCompanies: null,
    description: 'For large management groups and enterprise requirements',
    audience: ['Large Management Groups', '500+ Unit Portfolios', 'Multi-region Operators'],
    features: [
      'Unlimited units, properties & companies',
      'All Professional features, plus:',
      '24/7 out-of-hours call centre (built-in)',
      'Automated emergency maintenance dispatch',
      'Dedicated account manager',
      'Custom API integrations & webhooks',
      'White-label option available',
      'Advanced user role management',
      'Custom reporting & dashboards',
      'SLA guarantees & dedicated support',
      'Onboarding assistance',
    ],
  },
];

// Competitor pricing for equivalent functionality bundles
export const COMPETITOR_COSTS = {
  smallPortfolio: {
    // 50 units, single company, basic lettings
    premiso: 149,
    goodlord: 79,
    keogh: 125,
    appfolio: 250,
    note: 'Basic lettings only',
  },
  mediumPortfolio: {
    // 150 units, 5 companies, lettings + block mgmt
    premiso: 349,
    appfolio: 450, // +£120 block management module
    goodlord: 200, // Plus £150/mo separate block mgmt software
    reapit: 300,
    jupix: 320,
    yardi: 600, // Minimum enterprise tier
    note: 'Unified lettings + block management',
  },
  largePortfolio: {
    // 500+ units, multi-company, full suite
    premiso: 799,
    appfolio: 1200, // Multiple modules + out-of-hours add-on
    yardi: 2500, // Typical enterprise implementation
    rent_manager: 1400,
    rent_solution: 1100,
    note: 'Full suite with out-of-hours service',
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