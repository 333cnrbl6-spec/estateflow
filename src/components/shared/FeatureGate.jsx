import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Lock, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useStripeTier } from '@/hooks/useStripeTier';
import { hasTierAccess, TIER_META, getMinTierForCapability } from '@/lib/tierConfig';

/**
 * FeatureGate
 * Wraps any UI element and shows a locked state if the user's tier
 * doesn't meet the required tier for the feature.
 *
 * Props:
 *   capability  — key from TIER_CAPABILITIES (preferred)
 *   requiredTier — fallback: 'starter' | 'professional' | 'enterprise'
 *   featureName — human-readable name displayed in the locked banner
 *   description — optional extra context
 *   inline      — if true, shows a compact inline lock banner instead of a card
 *   children    — rendered when user has access
 */

const CAPABILITY_LABELS = {
  // Starter
  basic_compliance:             { label: 'Basic Compliance Tracking', tier: 'starter'      },
  rent_reminders:               { label: 'Rent Reminders',            tier: 'starter'      },
  maintenance_requests:         { label: 'Maintenance Requests',      tier: 'starter'      },
  document_storage:             { label: 'Document Storage',          tier: 'starter'      },

  // Professional
  advanced_compliance:          { label: 'Advanced Compliance Hub',        tier: 'professional' },
  block_management:             { label: 'Block Management',               tier: 'professional' },
  service_charge_accounting:    { label: 'Service Charge Accounting',      tier: 'professional' },
  section_20:                   { label: 'Section 20 Consultation',        tier: 'professional' },
  fire_safety_register:         { label: 'Fire Safety Register',           tier: 'professional' },
  sales_crm:                    { label: 'Residential Sales CRM',          tier: 'professional' },
  automated_reporting:          { label: 'Automated Reporting Suite',      tier: 'professional' },
  accounting_sync:              { label: 'Xero / QuickBooks / Sage Sync',  tier: 'professional' },
  predictive_maintenance:       { label: 'Predictive Maintenance Insights', tier: 'professional' },
  white_label_tenant_portal:    { label: 'White-Label Tenant Portal',      tier: 'professional' },
  webhook_api:                  { label: 'Webhooks & API Access',          tier: 'professional' },
  ai_document_draft:            { label: 'AI Document Drafting',           tier: 'professional' },
  pdf_export:                   { label: 'PDF Export',                     tier: 'professional' },
  advanced_analytics:           { label: 'Advanced Analytics',             tier: 'professional' },

  // Enterprise
  out_of_hours_service:         { label: '24/7 Out-of-Hours Call Centre',  tier: 'enterprise'   },
  emergency_dispatch:           { label: 'Emergency Maintenance Dispatch', tier: 'enterprise'   },
  dedicated_account_manager:    { label: 'Dedicated Account Manager',      tier: 'enterprise'   },
  custom_api:                   { label: 'Custom API & Webhook Framework', tier: 'enterprise'   },
  granular_permissions:         { label: 'Granular Role Permissions',      tier: 'enterprise'   },
  custom_reporting:             { label: 'Custom BI Reporting',            tier: 'enterprise'   },
  custom_branding:              { label: 'Full White-Label Branding',      tier: 'enterprise'   },
  bi_dashboards:                { label: 'Interactive BI Dashboards',      tier: 'enterprise'   },
  multi_currency:               { label: 'Multi-Currency Support',         tier: 'enterprise'   },
};

export default function FeatureGate({
  capability,
  requiredTier,
  featureName,
  description,
  inline = false,
  children,
}) {
  const { tier, isAdmin, hasTierAccess: check } = useStripeTier();

  // Resolve required tier from capability or explicit prop
  const resolved = capability ? (CAPABILITY_LABELS[capability]?.tier || 'professional') : (requiredTier || 'professional');
  const label    = featureName || (capability ? CAPABILITY_LABELS[capability]?.label : null) || 'This feature';
  const tierMeta = TIER_META[resolved] || TIER_META.professional;

  const hasAccess = isAdmin || hasTierAccess(tier, resolved);
  if (hasAccess) return children;

  if (inline) {
    return (
      <div className="flex items-center gap-2.5 px-3 py-2 bg-muted/60 border border-border rounded-lg">
        <Lock className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
        <span className="text-xs text-muted-foreground flex-1">
          <strong className="text-foreground">{label}</strong> — available on {tierMeta.name} plan
        </span>
        <Button size="sm" variant="outline" asChild className="h-7 text-xs">
          <Link to="/billing">Upgrade <ArrowUpRight className="w-3 h-3 ml-1" /></Link>
        </Button>
      </div>
    );
  }

  return (
    <div className={`rounded-xl border p-8 text-center ${tierMeta.bgColour} ${tierMeta.borderColour}`}>
      <div className="flex flex-col items-center gap-4 max-w-sm mx-auto">
        <div className={`w-12 h-12 rounded-full flex items-center justify-center bg-white border ${tierMeta.borderColour}`}>
          <Lock className={`w-5 h-5 ${tierMeta.colour}`} />
        </div>
        <div>
          <p className={`text-xs font-semibold uppercase tracking-wider mb-1 ${tierMeta.colour}`}>{tierMeta.name} Plan</p>
          <h3 className="text-base font-semibold text-foreground mb-1">{label}</h3>
          <p className="text-sm text-muted-foreground">{description || `Upgrade to ${tierMeta.name} to unlock this feature.`}</p>
        </div>
        <Button asChild>
          <Link to="/billing">Upgrade to {tierMeta.name} <ArrowUpRight className="w-4 h-4 ml-1.5" /></Link>
        </Button>
      </div>
    </div>
  );
}