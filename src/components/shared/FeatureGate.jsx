import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Lock } from 'lucide-react';
import { useStripeTier } from '@/hooks/useStripeTier';

export default function FeatureGate({ feature, children }) {
  const { tier } = useStripeTier();
  
  // Feature requirements
  const requirements = {
    ai_draft: ['professional', 'enterprise'],
    pdf_export: ['professional', 'enterprise'],
    advanced_analytics: ['professional', 'enterprise'],
  };

  const requiredTier = requirements[feature];
  const hasAccess = requiredTier?.includes(tier);

  if (!hasAccess) {
    const tierDisplay = tier === 'free' ? 'Starter' : tier.charAt(0).toUpperCase() + tier.slice(1);
    const upcomingTier = feature === 'ai_draft' || feature === 'pdf_export' ? 'Professional' : 'Enterprise';

    return (
      <Card className="border-2 border-dashed border-amber-200 bg-amber-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Lock className="w-5 h-5 text-amber-600" />
            {feature.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())} — {upcomingTier} Feature
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-amber-900">
            This feature is only available on {upcomingTier} and above plans.
          </p>
          <p className="text-xs text-amber-800">
            Current plan: <strong>{tierDisplay}</strong>
          </p>
          <Button className="w-full">Upgrade to {upcomingTier}</Button>
        </CardContent>
      </Card>
    );
  }

  return children;
}