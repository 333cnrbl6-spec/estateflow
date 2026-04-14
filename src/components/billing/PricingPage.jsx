import React, { useState } from 'react';
import { PRICING_TIERS } from '@/lib/pricingTiers';
import PricingTierCard from './PricingTierCard';
import SubscriptionCheckout from './SubscriptionCheckout';
import { Button } from '@/components/ui/button';
import { Toggle } from '@/components/ui/toggle';

export default function PricingPage({ currentTierId, isFounder = false, onSubscribe }) {
  const [selectedTierId, setSelectedTierId] = useState(null);
  const [billingMode, setBillingMode] = useState('monthly'); // monthly | annual
  const [showCheckout, setShowCheckout] = useState(false);

  const handleSelectTier = (tierId) => {
    setSelectedTierId(tierId);
    setShowCheckout(true);
  };

  if (showCheckout && selectedTierId) {
    return (
      <SubscriptionCheckout
        tierId={selectedTierId}
        billingMode={billingMode}
        isFounder={isFounder}
        onBack={() => setShowCheckout(false)}
        onSuccess={onSubscribe}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-slate-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Simple, Transparent Pricing
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Choose the plan that fits your property management needs. All plans include a 14-day free trial.
          </p>
        </div>

        {/* Billing Toggle */}
        <div className="flex justify-center mb-12">
          <div className="inline-flex rounded-lg border border-border bg-white p-1">
            <Button
              variant={billingMode === 'monthly' ? 'default' : 'ghost'}
              onClick={() => setBillingMode('monthly')}
              size="sm"
            >
              Monthly
            </Button>
            <Button
              variant={billingMode === 'annual' ? 'default' : 'ghost'}
              onClick={() => setBillingMode('annual')}
              size="sm"
            >
              Annual
              <span className="ml-2 text-xs font-semibold text-green-600">Save 20%</span>
            </Button>
          </div>
        </div>

        {/* Pricing Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {PRICING_TIERS.map(tier => (
            <PricingTierCard
              key={tier.id}
              tier={tier}
              isFounder={isFounder}
              onSelect={() => handleSelectTier(tier.id)}
              isActive={tier.id === currentTierId}
            />
          ))}
        </div>

        {/* FAQ Section */}
        <div className="max-w-4xl mx-auto mt-16 border-t border-border pt-12">
          <h2 className="text-2xl font-bold text-foreground mb-8 text-center">Frequently Asked Questions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              {
                q: 'Can I change plans?',
                a: 'Yes, you can upgrade or downgrade any time. Changes take effect on your next billing cycle.',
              },
              {
                q: 'Is there a free trial?',
                a: 'Yes, all plans include a 14-day free trial. No credit card required to start.',
              },
              {
                q: 'What payment methods do you accept?',
                a: 'We accept all major credit and debit cards via Stripe. Bank transfers available for Enterprise.',
              },
              {
                q: 'Do you offer discounts for annual billing?',
                a: 'Yes! Annual billing saves you 20% compared to monthly payments.',
              },
              {
                q: 'What happens if I exceed my property limit?',
                a: 'We\'ll notify you when you approach the limit. You can upgrade anytime without penalty.',
              },
              {
                q: 'Is there a setup fee?',
                a: 'No setup fees. You only pay the monthly or annual subscription price.',
              },
            ].map((item, i) => (
              <div key={i}>
                <h3 className="font-semibold text-foreground mb-2">{item.q}</h3>
                <p className="text-muted-foreground text-sm">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}