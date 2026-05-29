import React from 'react';
import { Lock, ArrowUpRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { TIER_META } from '@/lib/tierConfig';

/**
 * FeatureLocked — full-page / full-section upgrade prompt.
 * For inline locked UI use <FeatureGate inline> instead.
 */
export default function FeatureLocked({ feature, tier = 'professional' }) {
  const meta = TIER_META[tier] || TIER_META.professional;

  return (
    <div className={`rounded-xl border p-12 text-center ${meta.bgColour} ${meta.borderColour}`}>
      <div className="flex flex-col items-center gap-4 max-w-sm mx-auto">
        <div className={`w-14 h-14 rounded-full flex items-center justify-center bg-white border-2 ${meta.borderColour}`}>
          <Lock className={`w-6 h-6 ${meta.colour}`} />
        </div>
        <div>
          <p className={`text-xs font-semibold uppercase tracking-wider mb-1 ${meta.colour}`}>{meta.name} Plan Required</p>
          <h3 className="text-lg font-semibold text-foreground mb-2">{feature}</h3>
          <p className="text-sm text-muted-foreground">
            Upgrade to <strong>{meta.name}</strong> (£{meta.price}/mo) to unlock this feature.
          </p>
        </div>
        <Button asChild size="lg">
          <Link to="/billing">Upgrade to {meta.name} <ArrowUpRight className="w-4 h-4 ml-1.5" /></Link>
        </Button>
      </div>
    </div>
  );
}