/**
 * PREMISO — Single source of truth for tier-based access control.
 * Tiers: starter | professional | enterprise
 * These align exactly with pricingConfig.js (PREMISO_TIERS).
 *
 * Usage:
 *   import { TIER_FEATURES, hasTierAccess, getMinTierForFeature } from '@/lib/tierConfig';
 */

// Canonical tier order (ascending)
export const TIER_ORDER = ['starter', 'professional', 'enterprise'];

// All feature keys and the minimum tier required to access them
export const TIER_FEATURES = {
  // ── Available on ALL tiers (Starter+) ──────────────────────────────
  dashboard:                    'starter',
  properties:                   'starter',
  units:                        'starter',
  tenants:                      'starter',
  contacts:                     'starter',
  maintenance:                  'starter',
  pipeline:                     'starter',
  'rent-ledger':                'starter',
  'tenant-portal':              'starter',
  'document-repository':        'starter',
  'certificate-management':     'starter',  // Gas Safety, EPC, EICR, boiler
  'deposit-protection':         'starter',
  'maintenance-board':          'starter',
  settings:                     'starter',
  help:                         'starter',
  'guided-setup':               'starter',
  'tenant-screening':           'starter',

  // ── Professional+ ──────────────────────────────────────────────────
  compliance:                   'professional',
  'compliance-hub':             'professional',
  'compliance-dashboard':       'professional',
  'compliance-risk-analytics':  'professional',
  financials:                   'professional',
  banking:                      'professional',
  expenses:                     'professional',
  'service-charges':            'professional',
  'ground-rent':                'professional',
  'block-management':           'professional',
  'rtm-management':             'professional',
  'building-safety-register':   'professional',
  sales:                        'professional',
  viewings:                     'professional',
  'buyer-portal':               'professional',
  'market-reports':             'professional',
  crm:                          'professional',
  reporting:                    'professional',
  'financial-reporting':        'professional',
  'financial-reports':          'professional',
  'landlord-portal':            'professional',
  'owner-portal':               'professional',
  'owner-financials':           'professional',
  'bank-reconciliation':        'professional',
  accounting:                   'professional',
  'document-templates':         'professional',
  'document-automation':        'professional',
  'leaseholder-portal':         'professional',
  'service-charges-management': 'professional',
  'block-compliance-dashboard': 'professional',
  'hmo-dashboard':              'professional',
  workflows:                    'professional',
  'automation-templates':       'professional',
  messages:                     'professional',
  tasks:                        'professional',
  integrations:                 'professional',

  // ── Enterprise only ────────────────────────────────────────────────
  'out-of-hours':               'enterprise',
  'out-of-hours-pipeline':      'enterprise',
  'out-of-hours-reporting':     'enterprise',
  'call-center-config':         'enterprise',
  'virtual-call-center':        'enterprise',
  'api-integrations':           'enterprise',
  'api-docs':                   'enterprise',
  'white-label':                'enterprise',
  'operational-metrics':        'enterprise',
  'kpi-dashboard':              'enterprise',
  'advanced-search':            'enterprise',
  'bulk-operations':            'enterprise',
  'workflow-builder':           'enterprise',
  'integrations-marketplace':   'enterprise',
  'collaboration':              'enterprise',
  'custom-reports':             'enterprise',
  'performance-metrics':        'enterprise',
  team:                         'enterprise',
  security:                     'enterprise',
  'role-management':            'enterprise',
};

// Named capability flags (used in UI to enable/disable specific features)
export const TIER_CAPABILITIES = {
  // Starter
  basic_compliance:             'starter',
  rent_reminders:               'starter',
  maintenance_requests:         'starter',
  document_storage:             'starter',
  tenant_portal_basic:          'starter',
  contractor_portal:            'starter',

  // Professional
  advanced_compliance:          'professional',
  block_management:             'professional',
  service_charge_accounting:    'professional',
  section_20:                   'professional',
  fire_safety_register:         'professional',
  sales_crm:                    'professional',
  automated_reporting:          'professional',
  accounting_sync:              'professional',  // Xero, QB, Sage
  predictive_maintenance:       'professional',
  white_label_tenant_portal:    'professional',
  webhook_api:                  'professional',
  ai_document_draft:            'professional',
  pdf_export:                   'professional',
  advanced_analytics:           'professional',

  // Enterprise
  out_of_hours_service:         'enterprise',
  emergency_dispatch:           'enterprise',
  dedicated_account_manager:    'enterprise',
  custom_api:                   'enterprise',
  granular_permissions:         'enterprise',
  custom_reporting:             'enterprise',
  custom_branding:              'enterprise',
  unlimited_companies:          'enterprise',
  bi_dashboards:                'enterprise',
  multi_currency:               'enterprise',
};

// Tier limits
export const TIER_LIMITS = {
  starter:      { maxUnits: 75,   maxProperties: 15,  maxCompanies: 1,    maxUsers: 3  },
  professional: { maxUnits: 400,  maxProperties: 100, maxCompanies: 10,   maxUsers: 10 },
  enterprise:   { maxUnits: null, maxProperties: null, maxCompanies: null, maxUsers: null }, // unlimited
};

// Tier display metadata
export const TIER_META = {
  starter:      { name: 'Starter',      price: 199, badge: 'Best for Solo Ops',  colour: 'text-blue-600',   bgColour: 'bg-blue-50',   borderColour: 'border-blue-200'   },
  professional: { name: 'Professional', price: 449, badge: 'Most Popular',       colour: 'text-primary',    bgColour: 'bg-primary/5', borderColour: 'border-primary/20' },
  enterprise:   { name: 'Enterprise',   price: 999, badge: 'Full Power',         colour: 'text-accent',     bgColour: 'bg-accent/10', borderColour: 'border-accent/20'  },
};

/**
 * Returns true if the user's tier meets or exceeds the required tier.
 * Admins / developers always have access.
 */
export function hasTierAccess(userTier, requiredTier, userRole = 'user') {
  if (userRole === 'admin' || userRole === 'developer') return true;
  if (!userTier || !requiredTier) return false;
  const userIdx = TIER_ORDER.indexOf(userTier);
  const reqIdx  = TIER_ORDER.indexOf(requiredTier);
  if (userIdx === -1 || reqIdx === -1) return false;
  return userIdx >= reqIdx;
}

/**
 * Returns true if the user can access a named route/feature key.
 */
export function canAccessFeature(userTier, featureKey, userRole = 'user') {
  if (userRole === 'admin' || userRole === 'developer') return true;
  const required = TIER_FEATURES[featureKey];
  if (!required) return true; // Unknown feature = allow
  return hasTierAccess(userTier, required, userRole);
}

/**
 * Returns true if the user has a named capability.
 */
export function hasCapability(userTier, capability, userRole = 'user') {
  if (userRole === 'admin' || userRole === 'developer') return true;
  const required = TIER_CAPABILITIES[capability];
  if (!required) return false;
  return hasTierAccess(userTier, required, userRole);
}

/**
 * Returns the minimum tier name required for a feature.
 */
export function getMinTierForFeature(featureKey) {
  return TIER_FEATURES[featureKey] || null;
}

/**
 * Returns the minimum tier name required for a capability.
 */
export function getMinTierForCapability(capability) {
  return TIER_CAPABILITIES[capability] || null;
}

/**
 * Returns the limits for a tier.
 */
export function getTierLimits(tier) {
  return TIER_LIMITS[tier] || TIER_LIMITS.starter;
}

export default {
  TIER_ORDER,
  TIER_FEATURES,
  TIER_CAPABILITIES,
  TIER_LIMITS,
  TIER_META,
  hasTierAccess,
  canAccessFeature,
  hasCapability,
  getTierLimits,
};