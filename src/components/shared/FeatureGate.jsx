import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Lock } from 'lucide-react';
import { useStripeTier } from '@/hooks/useStripeTier';
import UpgradeModal from '@/components/billing/UpgradeModal';

const FEATURE_CONFIG = {
  ai_draft: { requiredTier: 'professional', label: 'AI Document Drafting', roi: 'One AI-drafted tenancy agreement saves 2 hours of solicitor time' },
  pdf_export: { requiredTier: 'professional', label: 'PDF Export', roi: 'Professional PDF reports with your branding' },
  advanced_analytics: { requiredTier: 'professional', label: 'Advanced Analytics', roi: 'Portfolio-level insights to maximise returns' },
  unlimited_properties: { requiredTier: 'professional', label: 'Unlimited Properties', roi: 'Scale your portfolio without limits' },
  api_access: { requiredTier: 'enterprise', label: 'API Access', roi: 'Integrate Premiso data with your own systems' },
  white_label: { requiredTier: 'enterprise', label: 'White-Label Reports', roi: 'Deliver branded reports to your clients' },
};

export default function FeatureGate({ feature, children }) {
  const { tier } = useStripeTier();
  const [showUpgrade, setShowUpgrade] = useState(false);

  const config = FEATURE_CONFIG[feature] || { requiredTier: 'professional', label: feature, roi: '' };
  const requiredTiers = config.requiredTier === 'enterprise' ? ['enterprise'] : ['professional', 'enterprise'];
  const hasAccess = requiredTiers.includes(tier);

  if (!hasAccess) {
    return (
      <>
        <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg cursor-pointer hover:bg-amber-100 transition-colors" onClick={() => setShowUpgrade(true)}>
          <Lock className="w-4 h-4 text-amber-600 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium text-amber-900">{config.label} — {config.requiredTier.charAt(0).toUpperCase() + config.requiredTier.slice(1)} Plan</p>
            <p className="text-xs text-amber-700">{config.roi}</p>
          </div>
          <Button size="sm" className="flex-shrink-0">Upgrade</Button>
        </div>
        <UpgradeModal open={showUpgrade} onClose={() => setShowUpgrade(false)} requiredTier={config.requiredTier} featureName={config.label} />
      </>
    );
  }

  return children;
}