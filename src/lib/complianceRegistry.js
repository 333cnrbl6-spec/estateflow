// Professional credentials and regulatory requirements by role/type
export const PROFESSIONAL_CREDENTIALS = {
  gas_engineer: {
    required: ['gas_safe_register'],
    recommended: ['corgi_legacy'],
    jurisdiction: 'UK',
    regulatory_body: 'Gas Safe Register',
    verification_url: 'https://www.gassaferegister.co.uk/',
    minimum_insurance: 6000000, // £6M
    renewal_frequency: 12 // months
  },
  electrician: {
    required: ['niceic', 'napit_or_equivalent'],
    recommended: ['qualified_supervisor'],
    jurisdiction: 'UK',
    regulatory_body: 'NICEIC/NAPIT/ELECSA',
    minimum_insurance: 2000000, // £2M
    renewal_frequency: 12
  },
  plumber: {
    required: ['g_mark_or_ciphe'],
    recommended: ['watersafe'],
    jurisdiction: 'UK',
    regulatory_body: 'CIPHE/G-Mark/WaterSafe',
    minimum_insurance: 1000000, // £1M
    renewal_frequency: 12
  },
  surveyor: {
    required: ['chartered_status', 'rics_registration'],
    recommended: ['professional_indemnity'],
    jurisdiction: 'UK',
    regulatory_body: 'Royal Institution of Chartered Surveyors (RICS)',
    verification_url: 'https://www.rics.org/',
    minimum_insurance: 1000000,
    renewal_frequency: 12
  },
  architect: {
    required: ['riba_registration', 'cpl'],
    jurisdiction: 'UK',
    regulatory_body: 'Royal Institute of British Architects (RIBA)',
    minimum_insurance: 1000000,
    renewal_frequency: 12
  },
  general_contractor: {
    required: ['public_liability_insurance'],
    recommended: ['accreditation'],
    jurisdiction: 'UK',
    minimum_insurance: 1000000,
    renewal_frequency: 12
  },
  landlord: {
    required: ['right_to_rent_check', 'deposit_protection'],
    recommended: ['property_accreditation'],
    jurisdiction: 'UK',
    regulations: ['Housing Act 2004', 'Tenant Fees Act 2019', 'GDPR']
  },
  customer: {
    required: ['identity_verification'],
    recommended: [],
    jurisdiction: 'UK',
    regulations: ['GDPR', 'Anti-Money Laundering']
  }
};

export const GEOGRAPHICAL_COMPLIANCE = {
  'England': {
    key_legislation: [
      'Housing Act 2004',
      'Electrical Safety Standards in the Private Rented Sector (England) Regulations 2020',
      'Gas Safety (Installation and Use) Regulations 1998',
      'Furniture and Furnishings (Fire Safety) Regulations 1988',
      'Tenant Fees Act 2019',
      'Building Safety Act 2022'
    ],
    fire_safety_requirements: true,
    epc_required: true,
    hmo_licensing: true,
    gas_safety_frequency: 12, // months
    electrical_testing_frequency: 60 // months (5 years)
  },
  'Scotland': {
    key_legislation: [
      'Housing (Scotland) Act 2006',
      'Standards of Conduct for Letting Agents',
      'Private Tenancies (Scotland) Act 2016',
      'Building Standards'
    ],
    fire_safety_requirements: true,
    epc_required: true,
    hmo_licensing: true,
    gas_safety_frequency: 12,
    electrical_testing_frequency: 60,
    property_factor: 'may apply'
  },
  'Wales': {
    key_legislation: [
      'Housing Act 2004',
      'Renting Homes (Wales) Act 2016',
      'Building Regulations 2010',
      'Environmental Protection Act 1990'
    ],
    fire_safety_requirements: true,
    epc_required: true,
    hmo_licensing: false,
    gas_safety_frequency: 12,
    electrical_testing_frequency: 60
  },
  'Northern Ireland': {
    key_legislation: [
      'Housing Order 1992',
      'Private Tenancies (Northern Ireland) Order 2006',
      'Building Regulations'
    ],
    fire_safety_requirements: true,
    epc_required: true,
    hmo_licensing: false,
    gas_safety_frequency: 12,
    electrical_testing_frequency: 60
  }
};

export const RELATIONSHIP_TYPES = {
  vendor: {
    label: 'Vendor/Contractor',
    primary_checks: ['insurance', 'credentials', 'registration'],
    audit_frequency: 12 // months
  },
  supplier: {
    label: 'Supplier',
    primary_checks: ['payment_terms', 'contract', 'insurance'],
    audit_frequency: 12
  },
  subcontractor: {
    label: 'Subcontractor',
    primary_checks: ['insurance', 'credentials', 'health_safety'],
    audit_frequency: 6
  },
  landlord: {
    label: 'Landlord',
    primary_checks: ['ownership_verification', 'deposit_protection', 'compliance'],
    audit_frequency: 24
  },
  customer: {
    label: 'Customer/Tenant',
    primary_checks: ['identity', 'right_to_rent', 'screening'],
    audit_frequency: null
  },
  property_manager: {
    label: 'Property Manager',
    primary_checks: ['credentials', 'insurance', 'registration'],
    audit_frequency: 12
  },
  financial_advisor: {
    label: 'Financial Advisor',
    primary_checks: ['fca_registration', 'insurance', 'credentials'],
    audit_frequency: 12
  }
};

export function getCredentialsForRole(role) {
  return PROFESSIONAL_CREDENTIALS[role] || null;
}

export function getGeographicalRequirements(jurisdiction) {
  return GEOGRAPHICAL_COMPLIANCE[jurisdiction] || GEOGRAPHICAL_COMPLIANCE['England'];
}

export function getRelationshipType(type) {
  return RELATIONSHIP_TYPES[type] || null;
}

export const COMPLIANCE_CATEGORIES = [
  'registration',
  'insurance',
  'credentials',
  'health_safety',
  'data_protection',
  'anti_money_laundering',
  'deposit_protection',
  'contract',
  'payment_terms',
  'right_to_rent'
];