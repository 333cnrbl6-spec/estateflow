import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { CheckCircle, Zap, Lock, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';

const TIER_BENEFITS = {
  professional: {
    price: '£129/mo',
    name: 'Professional',
    color: 'blue',
    features: [
      'Unlimited properties',
      'AI document drafting (saves 2hrs/doc)',
      'PDF export with branding',
      '3 team seats',
      'Smart compliance alerts',
      'Portfolio analytics dashboard',
      'Priority support',
    ],
    roi: 'One AI-drafted tenancy agreement saves £200+ in solicitor time',
  },
  enterprise: {
    price: '£299/mo',
    name: 'Enterprise',
    color: 'purple',
    features: [
      'Everything in Professional',
      'Unlimited team seats',
      'API access',
      'White-label reports',
      'Dedicated account manager',
      'Custom integrations',
      'SLA guarantee',
    ],
    roi: 'Full agency white-labelling — sell as your own platform',
  },
};

export default function UpgradeModal({ open, onClose, requiredTier = 'professional', featureName = 'this feature' }) {
  const tier = TIER_BENEFITS[requiredTier] || TIER_BENEFITS.professional;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
              requiredTier === 'enterprise' ? 'bg-purple-100' : 'bg-blue-100'
            }`}>
              <Lock className={`w-5 h-5 ${requiredTier === 'enterprise' ? 'text-purple-600' : 'text-blue-600'}`} />
            </div>
            <DialogTitle className="text-lg">Unlock {tier.name}</DialogTitle>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          {/* ROI message */}
          <div className={`rounded-lg p-3 ${requiredTier === 'enterprise' ? 'bg-purple-50 border border-purple-200' : 'bg-blue-50 border border-blue-200'}`}>
            <div className="flex items-start gap-2">
              <TrendingUp className={`w-4 h-4 mt-0.5 flex-shrink-0 ${requiredTier === 'enterprise' ? 'text-purple-600' : 'text-blue-600'}`} />
              <p className="text-sm font-medium text-slate-800">{tier.roi}</p>
            </div>
          </div>

          <p className="text-sm text-slate-600">
            <strong>{featureName}</strong> requires the {tier.name} plan. Upgrade to unlock:
          </p>

          <ul className="space-y-2">
            {tier.features.map((f, i) => (
              <li key={i} className="flex items-center gap-2 text-sm text-slate-700">
                <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                {f}
              </li>
            ))}
          </ul>

          <div className="pt-2 space-y-2">
            <Button asChild className="w-full gap-2">
              <Link to="/billing" onClick={onClose}>
                <Zap className="w-4 h-4" />
                Upgrade to {tier.name} — {tier.price}
              </Link>
            </Button>
            <Button variant="ghost" className="w-full text-slate-500" onClick={onClose}>
              Maybe later
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}