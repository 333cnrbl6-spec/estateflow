import React from 'react';
import { Check, Info } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

const TIERS = [
  {
    id: 'basic',
    name: 'Basic',
    monthlyPrice: 75,
    features: [
      'Call logging & recording',
      'Caller verification',
      'Email notifications',
      'Basic monthly reports',
    ],
    description: 'For small portfolios with minimal evening call volume',
  },
  {
    id: 'standard',
    name: 'Standard',
    monthlyPrice: 200,
    features: [
      'All Basic features',
      'Automatic maintenance order creation',
      'Weekly escalation tracking',
      'Service gap identification',
      'Email support',
    ],
    description: 'Most popular choice for active property managers',
    recommended: true,
  },
  {
    id: 'premium',
    name: 'Premium',
    monthlyPrice: 450,
    features: [
      'All Standard features',
      'Contractor network & dispatch',
      'Emergency response protocols',
      'Phone support (9am-6pm)',
      'Custom call routing',
    ],
    description: 'For larger portfolios with 50+ units',
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    monthlyPrice: 900,
    features: [
      'All Premium features',
      'Dedicated call handlers',
      'Full workflow management',
      '24/7 phone support',
      'Custom SLA agreements',
      'Monthly strategy reviews',
    ],
    description: 'Complete white-glove managed service',
  },
];

export default function OnboardingStep3ServiceTier({ formData, updateFormData }) {
  const selectedTier = TIERS.find((t) => t.id === formData.selectedTier);

  return (
    <div className="space-y-6">
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex gap-2">
          <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
          <p className="text-sm text-blue-900">
            <span className="font-semibold">Service Tiers:</span> You can upgrade or downgrade at any time. Your
            selection determines call handling capabilities and support availability.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <RadioGroup value={formData.selectedTier} onValueChange={(value) => updateFormData('selectedTier', value)}>
          {TIERS.map((tier) => (
            <div key={tier.id}>
              <Label
                htmlFor={tier.id}
                className={cn(
                  'cursor-pointer block p-6 rounded-lg border-2 transition-all',
                  formData.selectedTier === tier.id
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                )}
              >
                <div className="flex items-start gap-4">
                  <RadioGroupItem value={tier.id} id={tier.id} className="mt-1" />

                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-lg">{tier.name}</h3>
                      {tier.recommended && (
                        <Badge className="bg-primary text-xs">Recommended</Badge>
                      )}
                    </div>

                    <p className="text-sm text-muted-foreground mb-3">{tier.description}</p>

                    <div className="mb-4">
                      <span className="text-2xl font-bold">£{tier.monthlyPrice}</span>
                      <span className="text-sm text-muted-foreground ml-2">/month</span>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-2">
                      {tier.features.map((feature) => (
                        <div key={feature} className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-green-600 shrink-0" />
                          <span className="text-sm text-foreground">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Billing Options</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3">
              <input
                type="radio"
                id="monthly"
                name="billing"
                checked={formData.billingCycle === 'monthly'}
                onChange={() => updateFormData('billingCycle', 'monthly')}
                className="w-4 h-4 cursor-pointer"
              />
              <label htmlFor="monthly" className="cursor-pointer flex-1">
                <span className="font-medium text-sm">Month-to-Month</span>
                <p className="text-xs text-muted-foreground">Standard billing, cancel anytime</p>
              </label>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="radio"
                id="annual"
                name="billing"
                checked={formData.billingCycle === 'annual'}
                onChange={() => updateFormData('billingCycle', 'annual')}
                className="w-4 h-4 cursor-pointer"
              />
              <label htmlFor="annual" className="cursor-pointer flex-1">
                <span className="font-medium text-sm">Annual (Save 10%)</span>
                <p className="text-xs text-muted-foreground">Billed once per year at discount rate</p>
              </label>
            </div>
          </CardContent>
        </Card>

        {selectedTier && (
          <Card className="bg-secondary/30">
            <CardHeader>
              <CardTitle className="text-base">Estimate</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Monthly cost:</span>
                <span className="font-semibold">£{selectedTier.monthlyPrice}</span>
              </div>
              {formData.billingCycle === 'annual' && (
                <>
                  <div className="h-px bg-border" />
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">10% discount:</span>
                    <span className="font-semibold text-green-600">
                      -£{Math.round(selectedTier.monthlyPrice * 12 * 0.1)}
                    </span>
                  </div>
                  <div className="h-px bg-border" />
                  <div className="flex justify-between items-center pt-2">
                    <span className="font-semibold">Annual total:</span>
                    <span className="text-xl font-bold">
                      £{Math.round(selectedTier.monthlyPrice * 12 * 0.9)}
                    </span>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
        <p className="text-sm text-amber-900">
          <span className="font-semibold">📌 Note:</span> Setup fee of £150-300 applies based on tier complexity.
          Waived for annual commitments.
        </p>
      </div>
    </div>
  );
}