import React from 'react';
import { Check, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const SERVICE_TIERS = [
  {
    name: 'Basic',
    monthlyPrice: 75,
    description: 'Perfect for small portfolios',
    callHandling: 'Email notifications only',
    features: [
      'Call logging & recording',
      'Caller identity verification',
      'Email notifications to property manager',
      'Call history archive',
      'Basic reports',
    ],
    notIncluded: [
      'Maintenance order creation',
      'Contractor dispatch',
      'Emergency response coordination',
      'Service charge tracking',
      'Priority support',
    ],
    recommended: false,
  },
  {
    name: 'Standard',
    monthlyPrice: 200,
    description: 'Most popular choice',
    callHandling: 'Maintenance order creation',
    features: [
      'Call logging & recording',
      'Caller identity verification',
      'Email notifications',
      'Automatic maintenance order creation',
      'Call history & escalation tracking',
      'Service gap identification',
      'Monthly reports',
      'Dedicated support email',
    ],
    notIncluded: [
      'Contractor dispatch',
      'Emergency response coordination',
      'Premium reporting',
      'Phone support',
    ],
    recommended: true,
  },
  {
    name: 'Premium',
    monthlyPrice: 450,
    description: 'For active portfolios',
    callHandling: 'Contractor dispatch included',
    features: [
      'All Standard features',
      'Contractor network access',
      'Automated contractor dispatch',
      'Response time guarantees',
      'Emergency escalation protocols',
      'Weekly performance reports',
      'Phone support (9am-6pm)',
      'Custom call routing',
      'Service charge allocation',
    ],
    notIncluded: [
      '24/7 dedicated support',
      'Custom SLA agreements',
      'Advanced compliance reporting',
    ],
    recommended: false,
  },
  {
    name: 'Enterprise',
    monthlyPrice: 900,
    description: 'Full managed service',
    callHandling: 'Complete management',
    features: [
      'All Premium features',
      'Dedicated call handlers (outsourced)',
      'Full workflow management',
      'Advanced compliance & GDPR reporting',
      '24/7 phone support',
      'Custom SLA agreements',
      'Monthly strategy reviews',
      'Tenant communication templates',
      'Performance analytics dashboard',
      'Integration with accounting software',
    ],
    notIncluded: [],
    recommended: false,
  },
];

export default function ServiceTierPricing() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Out-of-Hours Service Tiers</h2>
        <p className="text-muted-foreground">
          Flexible pricing options for managing after-hours tenant and landlord calls
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {SERVICE_TIERS.map((tier) => (
          <Card
            key={tier.name}
            className={cn(
              'relative transition-all',
              tier.recommended && 'ring-2 ring-primary shadow-lg scale-105'
            )}
          >
            {tier.recommended && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <Badge className="bg-primary">Most Popular</Badge>
              </div>
            )}

            <CardHeader>
              <CardTitle className="text-xl">{tier.name}</CardTitle>
              <p className="text-xs text-muted-foreground mt-1">{tier.description}</p>
              <div className="mt-4">
                <div className="text-3xl font-bold">£{tier.monthlyPrice}</div>
                <p className="text-xs text-muted-foreground">per month, per company</p>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              <div className="p-3 bg-secondary/50 rounded-lg">
                <p className="text-xs font-semibold text-foreground mb-1">Call Handling</p>
                <p className="text-sm font-medium">{tier.callHandling}</p>
              </div>

              <div>
                <p className="text-xs font-semibold text-foreground mb-3">Included</p>
                <ul className="space-y-2">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-xs">
                      <Check className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {tier.notIncluded.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-foreground mb-3">Not Included</p>
                  <ul className="space-y-2">
                    {tier.notIncluded.map((feature) => (
                      <li key={feature} className="flex items-start gap-2 text-xs">
                        <X className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                        <span className="text-muted-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-secondary/30 border-secondary">
        <CardHeader>
          <CardTitle className="text-base">Pricing Notes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <p>
            <span className="font-semibold text-foreground">Per Company:</span> Pricing is charged per company subscription. Multi-company setups receive volume discounts.
          </p>
          <p>
            <span className="font-semibold text-foreground">Call Volume:</span> All tiers include unlimited call volume. No per-call charges.
          </p>
          <p>
            <span className="font-semibold text-foreground">Setup:</span> One-time setup fee of £150-300 depending on tier complexity (waived for annual commitments).
          </p>
          <p>
            <span className="font-semibold text-foreground">Minimum Term:</span> Monthly billing available; 12-month contracts receive 10% discount.
          </p>
          <p>
            <span className="font-semibold text-foreground">Support Hours:</span> Standard tier includes email support Mon-Fri. Premium/Enterprise add phone support.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}