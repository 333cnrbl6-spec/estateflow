import React from 'react';
import { Button } from '@/components/ui/button';

// TODO: Replace all placeholder pricing with final confirmed prices before launch
const TIERS = [
  {
    name: 'Starter',
    price: '£99',
    period: '/month',
    desc: 'Perfect for independent letting agents managing a small portfolio.',
    units: 'Up to 50 units',
    highlight: false,
    features: [
      'Properties & unit management',
      'Tenant & landlord portal',
      'Rent ledger & arrears tracking',
      'Basic compliance certificates',
      'Maintenance request management',
      'Document templates (10)',
      'Email support',
    ],
    cta: 'Start Free Trial',
  },
  {
    name: 'Professional',
    price: '£249',
    period: '/month',
    desc: 'For growing agencies that need the full suite with accounting integration.',
    units: 'Up to 250 units',
    highlight: true,
    badge: 'Most Popular',
    features: [
      'Everything in Starter',
      'Block & leasehold management',
      'Service charges & ground rent',
      'Bank reconciliation',
      'Xero / Sage / QuickBooks sync',
      'Out-of-hours call handling',
      'Full compliance hub',
      'Unlimited document templates',
      'Sales CRM',
      'Priority support',
    ],
    cta: 'Start Free Trial',
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: '',
    desc: 'For large agencies, block management companies and multi-branch operators.',
    units: 'Unlimited units',
    highlight: false,
    features: [
      'Everything in Professional',
      'Unlimited companies & regions',
      'Custom branding & white-label',
      'Dedicated account manager',
      'Custom integrations & API access',
      'SLA guarantee',
      'Onboarding & data migration',
      'Staff training sessions',
    ],
    cta: 'Talk to Sales',
  },
];

export default function PricingSection({ onChoosePlan }) {
  return (
    <section id="pricing" className="py-24 bg-slate-50">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-6">
          {/* TODO: Remove this banner before launch */}
          <div className="inline-block bg-amber-100 text-amber-800 text-xs font-medium px-4 py-2 rounded-full mb-6">
            ⚠️ Pricing is indicative — confirm before launch
          </div>
        </div>

        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-slate-900 mb-4">Simple, transparent pricing</h2>
          <p className="text-xl text-slate-500">
            All plans include a 30-day free trial. No setup fees. Cancel anytime.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {TIERS.map((tier) => (
            <div
              key={tier.name}
              className={`rounded-2xl p-8 relative ${
                tier.highlight
                  ? 'bg-primary text-white shadow-2xl scale-105'
                  : 'bg-white border border-slate-200 shadow-sm'
              }`}
            >
              {tier.badge && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-amber-400 text-slate-900 text-xs font-bold px-4 py-1 rounded-full">
                  {tier.badge}
                </div>
              )}

              <h3 className={`text-xl font-bold mb-1 ${tier.highlight ? 'text-white' : 'text-slate-900'}`}>
                {tier.name}
              </h3>
              <p className={`text-sm mb-4 ${tier.highlight ? 'text-white/70' : 'text-slate-500'}`}>
                {tier.desc}
              </p>

              <div className="mb-2">
                <span className={`text-4xl font-bold ${tier.highlight ? 'text-white' : 'text-slate-900'}`}>
                  {tier.price}
                </span>
                <span className={`text-sm ${tier.highlight ? 'text-white/70' : 'text-slate-500'}`}>
                  {tier.period}
                </span>
              </div>
              <p className={`text-xs font-medium mb-6 ${tier.highlight ? 'text-amber-300' : 'text-primary'}`}>
                {tier.units}
              </p>

              <Button
                onClick={onChoosePlan}
                className={`w-full mb-8 ${
                  tier.highlight
                    ? 'bg-white text-primary hover:bg-slate-100'
                    : 'bg-primary text-white hover:bg-primary/90'
                }`}
              >
                {tier.cta}
              </Button>

              <ul className="space-y-3">
                {tier.features.map(f => (
                  <li key={f} className={`flex items-start gap-2 text-sm ${tier.highlight ? 'text-white/90' : 'text-slate-600'}`}>
                    <span className={tier.highlight ? 'text-amber-300' : 'text-green-500'}>✓</span>
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <p className="text-center text-slate-400 text-sm mt-10">
          All prices exclude VAT. Annual billing available with 2 months free. Volume discounts for 500+ units.
        </p>
      </div>
    </section>
  );
}