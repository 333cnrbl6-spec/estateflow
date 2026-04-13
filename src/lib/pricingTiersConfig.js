export const PRICING_TIERS = {
  lettings: {
    id: 'lettings',
    name: 'Lettings Management',
    description: 'Core rental property management',
    icon: 'Home',
    color: 'bg-blue-50',
    textColor: 'text-blue-900',
    badgeColor: 'bg-blue-100',
    features: [
      'Tenant applications & screening',
      'Tenancy agreements & e-signing',
      'Rent collection & payment processing',
      'Rent ledger & payment history',
      'Tenant portal access',
      'Maintenance request management',
      'Property inspections',
      'Document repository',
      'Basic compliance (Gas Safe, EICR)',
      'Messaging & notifications',
      'Financial reporting per property',
    ],
    limits: {
      properties: 'Unlimited',
      tenants: 'Unlimited',
      users: '5',
    },
    pricing: 'Starting from £99/month',
  },
  blockManagement: {
    id: 'blockManagement',
    name: 'Block Management',
    description: 'Comprehensive leasehold & block management',
    icon: 'Building2',
    color: 'bg-amber-50',
    textColor: 'text-amber-900',
    badgeColor: 'bg-amber-100',
    features: [
      'All Lettings features',
      'Service charge management',
      'Leaseholder portals',
      'Deposit protection & prescribed info',
      'Ground rent tracking',
      'Safety certificates (Gas, Electrical, Fire)',
      'Building Safety Act compliance',
      'Defect register & remediation tracking',
      'Reserve fund management',
      'Statutory notices & s21 letters',
      'Advanced financial reporting',
      'Multi-property consolidated reporting',
      'Emergency callout management',
      'Third-party contractor scheduling',
    ],
    limits: {
      properties: 'Unlimited',
      tenants: 'Unlimited',
      users: '15',
    },
    pricing: 'Starting from £299/month',
  },
  rtm: {
    id: 'rtm',
    name: 'RTM Management',
    description: 'Right to Manage & tenant-controlled blocks',
    icon: 'Users',
    color: 'bg-green-50',
    textColor: 'text-green-900',
    badgeColor: 'bg-green-100',
    features: [
      'All Block Management features',
      'RTM company structure & governance',
      'Leaseholder voting & consents',
      'Annual General Meeting management',
      'Service charge budget & estimates',
      'Contractor quote comparison',
      'Works authorization workflows',
      'Resident communication portal',
      'Annual accounts & AGM documentation',
      'Reserves auditing & forecasting',
      'Compliance with RTM regulations',
      'Transition & handover management',
      'Insurance procurement & tracking',
      'Covenant enforcement tools',
    ],
    limits: {
      properties: 'Unlimited',
      tenants: 'Unlimited',
      users: '25',
    },
    pricing: 'Starting from £499/month',
  },
};

export const TIER_FEATURES_BY_CATEGORY = {
  'tenant_management': ['Tenant applications & screening', 'Tenancy agreements & e-signing', 'Tenant portal access'],
  'rent_financial': ['Rent collection & payment processing', 'Rent ledger & payment history', 'Financial reporting per property', 'Advanced financial reporting', 'Multi-property consolidated reporting'],
  'maintenance': ['Maintenance request management', 'Property inspections', 'Third-party contractor scheduling', 'Emergency callout management'],
  'compliance': ['Basic compliance (Gas Safe, EICR)', 'Safety certificates (Gas, Electrical, Fire)', 'Building Safety Act compliance', 'Deposit protection & prescribed info'],
  'leasehold': ['Service charge management', 'Leaseholder portals', 'Ground rent tracking', 'Covenant enforcement tools'],
  'rtm_specific': ['RTM company structure & governance', 'Leaseholder voting & consents', 'Annual General Meeting management', 'Service charge budget & estimates'],
};

export function getTierByName(name) {
  return PRICING_TIERS[name];
}

export function getAllTiers() {
  return Object.values(PRICING_TIERS);
}

export function compareTiers() {
  const tiers = getAllTiers();
  const allFeatures = new Set();
  tiers.forEach(tier => {
    tier.features.forEach(f => allFeatures.add(f));
  });
  
  return {
    tiers,
    features: Array.from(allFeatures),
  };
}