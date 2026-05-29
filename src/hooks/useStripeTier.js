import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { hasTierAccess, hasCapability, getTierLimits, TIER_META } from '@/lib/tierConfig';

/**
 * useStripeTier
 * Returns the current user's subscription tier and derived feature flags.
 * Aligned to the canonical Premiso tiers: starter | professional | enterprise
 */
export function useStripeTier() {
  const { data: user, isLoading } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
    staleTime: 5 * 60 * 1000,
  });

  const tier = user?.subscription_tier || 'starter';
  const role = user?.role || 'user';
  const isAdmin = role === 'admin';
  const meta = TIER_META[tier] || TIER_META.starter;
  const limits = getTierLimits(tier);

  const check = (required) => isAdmin || hasTierAccess(tier, required, role);
  const cap   = (capability) => isAdmin || hasCapability(tier, capability, role);

  return {
    // Raw tier & user
    tier,
    user,
    isLoading,
    tierName: meta.name,
    isAdmin,

    // Tier booleans
    isStarter:      tier === 'starter',
    isProfessional: tier === 'professional',
    isEnterprise:   tier === 'enterprise',

    // Limits
    limits,
    maxUnits:       limits.maxUnits,
    maxProperties:  limits.maxProperties,
    maxCompanies:   limits.maxCompanies,
    maxUsers:       limits.maxUsers,

    // Starter+ features (all tiers)
    canUseTenantPortal:   true,
    canTrackMaintenance:  true,
    canTrackCertificates: true,
    canTrackDeposits:     true,
    canSendReminders:     true,

    // Professional+ features
    canAccessAIDraft:           cap('ai_document_draft'),
    canExportPDF:               cap('pdf_export'),
    canAccessAdvancedCompliance: cap('advanced_compliance'),
    canUseBlockManagement:      cap('block_management'),
    canUseServiceCharges:       cap('service_charge_accounting'),
    canUseSection20:            cap('section_20'),
    canUseFireSafetyRegister:   cap('fire_safety_register'),
    canUseSalesCRM:             cap('sales_crm'),
    canUseAccountingSync:       cap('accounting_sync'),
    canAccessReporting:         check('professional'),
    canUsePredictiveMaint:      cap('predictive_maintenance'),
    canUseWebhookAPI:           cap('webhook_api'),
    canUseWhiteLabelTenantPortal: cap('white_label_tenant_portal'),

    // Enterprise+ features
    canUseOutOfHours:           cap('out_of_hours_service'),
    canUseEmergencyDispatch:    cap('emergency_dispatch'),
    canUseCustomAPI:            cap('custom_api'),
    canUseGranularPermissions:  cap('granular_permissions'),
    canUseCustomReporting:      cap('custom_reporting'),
    canUseCustomBranding:       cap('custom_branding'),
    canUseBIDashboards:         cap('bi_dashboards'),

    // Generic check function
    hasTierAccess: check,
    hasCapability: cap,
  };
}