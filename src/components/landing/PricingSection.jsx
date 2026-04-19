import React from 'react';
import { Button } from '@/components/ui/button';

const TIERS = [
  {
    name: 'Starter',
    price: '£199',
    period: '/month',
    desc: 'Perfect for individual landlords and boutique letting agencies managing small portfolios.',
    units: 'Up to 75 units',
    badge: 'Best Solo',
    highlight: false,
    features: [
      'Multi-unit property management',
      'Tenant & landlord portal with online rent payment',
      'Full maintenance request system',
      'Gas Safety, EPC, EICR, Boiler certificates',
      'Deposit protection monitoring',
      'Automated rent reminders',
      'Rent ledger with arrears alerts',
      'Unlimited document storage',
      'Email support',
    ],
    notIncluded: ['Block management', 'Sales CRM', 'Accounting sync'],
    cta: 'Start Free Trial',
    annualSaving: '£388/year',
  },
  {
    name: 'Professional',
    price: '£449',
    period: '/month',
    desc: 'The complete unified platform for lettings agents, block managers, and multi-company groups.',
    units: 'Up to 400 units',
    badge: 'Most Popular',
    highlight: true,
    features: [
      'Everything in Starter, plus:',
      'Block & leasehold management',
      'Service charge budgeting',
      'Multi-company structure',
      'Section 20 automation',
      'Advanced compliance hub (15+ certificates)',
      'Fire Safety Register',
      'Residential sales CRM',
      'Automated reporting (P&L, cash flow)',
      'Xero, QB, Sage 50 live sync',
      'Predictive maintenance insights',
      'White-label tenant portal',
      'Priority support',
    ],
    cta: 'Start Free Trial',
    annualSaving: '£898/year',
  },
  {
    name: 'Enterprise',
    price: '£999',
    period: '/month',
    desc: 'For large groups, multi-region operators and complex institutional portfolios.',
    units: 'Unlimited units',
    badge: 'Full Power',
    highlight: false,
    features: [
      'Everything in Professional, plus:',
      '24/7 emergency call centre',
      'Dedicated account manager',
      'Custom API & webhooks',
      'Advanced analytics & BI',
      'SLA guarantee (99.9%)',
      'White-label all portals',
      'Multi-currency support',
      'Full data migration',
      'Staff training program',
    ],
    cta: 'Talk to Sales',
    annualSaving: '£1,998/year',
  },
];

export default function PricingSection({ onChoosePlan }) {
  return (
    <section id="pricing" className="py-24 bg-slate-50">
      <div className="max-w-6xl mx-auto px-6">
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
              <p className={`text-xs font-medium mb-3 ${tier.highlight ? 'text-amber-300' : 'text-primary'}`}>
                {tier.units}
              </p>
              {tier.annualSaving && (
                <p className={`text-xs mb-6 ${tier.highlight ? 'text-amber-100' : 'text-green-600'}`}>
                  💰 Save {tier.annualSaving} on annual billing
                </p>
              )}

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

              <ul className="space-y-2 mb-4">
                {tier.features.map(f => (
                  <li key={f} className={`flex items-start gap-2 text-xs ${tier.highlight ? 'text-white/90' : 'text-slate-600'}`}>
                    <span className={tier.highlight ? 'text-amber-300' : 'text-green-500'}>✓</span>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>

              {tier.notIncluded && (
                <div className={`text-xs p-2 rounded ${tier.highlight ? 'bg-white/10' : 'bg-slate-100'}`}>
                  <p className={`font-medium mb-1 ${tier.highlight ? 'text-white' : 'text-slate-600'}`}>Not included:</p>
                  <ul className="space-y-1">
                    {tier.notIncluded.map(f => (
                      <li key={f} className={tier.highlight ? 'text-white/60' : 'text-slate-500'}>
                        • {f}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-12 bg-blue-50 rounded-lg p-6 text-center">
          <h4 className="font-semibold text-slate-900 mb-2">Why Premiso Stands Out</h4>
          <div className="grid md:grid-cols-4 gap-4 text-sm text-slate-700">
            <div>
              <p className="font-semibold text-primary mb-1">Unified Platform</p>
              <p>No expensive add-on modules like competitors</p>
            </div>
            <div>
              <p className="font-semibold text-primary mb-1">UK-Regulated</p>
              <p>Built for MEES, Companies House, Renting Homes Act</p>
            </div>
            <div>
              <p className="font-semibold text-primary mb-1">Best Value</p>
              <p>50% cheaper than AppFolio & Yardi on comparable portfolios</p>
            </div>
            <div>
              <p className="font-semibold text-primary mb-1">Developer Friendly</p>
              <p>Webhooks, APIs, custom integrations on all tiers</p>
            </div>
          </div>
        </div>

        <p className="text-center text-slate-500 text-sm mt-10">
          All prices exclude VAT. Annual billing saves 2 months. 30-day free trial. Cancel anytime.
        </p>
      </div>
    </section>
  );
}