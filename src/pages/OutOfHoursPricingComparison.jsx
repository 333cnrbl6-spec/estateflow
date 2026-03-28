import React, { useState } from 'react';
import { Check, X, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const TIERS = [
  {
    name: 'Basic',
    monthlyPrice: 75,
    yearlyPrice: 810,
    description: 'Perfect for small landlords and boutique management companies with limited evening call volume',
    icon: '📞',
    features: [
      { name: 'Call logging & recording', included: true },
      { name: 'Caller identity verification', included: true },
      { name: 'Email notifications', included: true },
      { name: 'Call history archive', included: true },
      { name: 'Basic monthly reports', included: true },
      { name: 'Maintenance order creation', included: false },
      { name: 'Contractor dispatch', included: false },
      { name: 'Emergency response coordination', included: false },
      { name: 'Dedicated phone support', included: false },
    ],
    cta: 'Get Started',
    recommended: false,
  },
  {
    name: 'Standard',
    monthlyPrice: 200,
    yearlyPrice: 2160,
    description: 'The most popular choice for active property managers handling 5-50 units with mixed tenant types',
    icon: '⚙️',
    features: [
      { name: 'Call logging & recording', included: true },
      { name: 'Caller identity verification', included: true },
      { name: 'Email notifications', included: true },
      { name: 'Automatic maintenance order creation', included: true },
      { name: 'Call escalation tracking', included: true },
      { name: 'Service gap identification', included: true },
      { name: 'Monthly performance reports', included: true },
      { name: 'Dedicated support email', included: true },
      { name: 'Contractor dispatch', included: false },
      { name: 'Emergency response coordination', included: false },
      { name: 'Phone support', included: false },
    ],
    cta: 'Most Popular',
    recommended: true,
  },
  {
    name: 'Premium',
    monthlyPrice: 450,
    yearlyPrice: 4860,
    description: 'Comprehensive service for larger portfolios (50-150+ units) requiring contractor coordination',
    icon: '🎯',
    features: [
      { name: 'All Standard features', included: true },
      { name: 'Contractor network access', included: true },
      { name: 'Automated contractor dispatch', included: true },
      { name: 'Response time guarantees', included: true },
      { name: 'Emergency escalation protocols', included: true },
      { name: 'Weekly performance reports', included: true },
      { name: 'Phone support (9am-6pm)', included: true },
      { name: 'Custom call routing', included: true },
      { name: 'Service charge allocation', included: true },
      { name: '24/7 dedicated support', included: false },
      { name: 'Custom SLA agreements', included: false },
      { name: 'Advanced compliance reporting', included: false },
    ],
    cta: 'Try Premium',
    recommended: false,
  },
  {
    name: 'Enterprise',
    monthlyPrice: 900,
    yearlyPrice: 9720,
    description: 'Full white-glove management service for enterprise portfolios with complex requirements',
    icon: '👑',
    features: [
      { name: 'All Premium features', included: true },
      { name: 'Dedicated call handlers (outsourced)', included: true },
      { name: 'Full workflow management', included: true },
      { name: 'Advanced compliance & GDPR reporting', included: true },
      { name: '24/7 phone support', included: true },
      { name: 'Custom SLA agreements', included: true },
      { name: 'Monthly strategy reviews', included: true },
      { name: 'Tenant communication templates', included: true },
      { name: 'Performance analytics dashboard', included: true },
      { name: 'Integration with accounting software', included: true },
    ],
    cta: 'Contact Sales',
    recommended: false,
  },
];

export default function OutOfHoursPricingComparison() {
  const [billingPeriod, setBillingPeriod] = useState('monthly');

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/5 to-background py-16">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold font-serif mb-4 text-foreground">
            After-Hours Support Pricing
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Flexible service tiers designed for property managers of all sizes. From call logging to full managed services.
          </p>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center gap-4 mb-8">
            <button
              onClick={() => setBillingPeriod('monthly')}
              className={cn(
                'px-6 py-2 rounded-lg font-medium transition-all',
                billingPeriod === 'monthly'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
              )}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingPeriod('yearly')}
              className={cn(
                'px-6 py-2 rounded-lg font-medium transition-all flex items-center gap-2',
                billingPeriod === 'yearly'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
              )}
            >
              Annual
              <Badge className="bg-green-600 text-xs">Save 10%</Badge>
            </button>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {TIERS.map((tier) => (
            <Card
              key={tier.name}
              className={cn(
                'relative flex flex-col transition-all hover:shadow-lg',
                tier.recommended && 'ring-2 ring-primary shadow-lg md:scale-105'
              )}
            >
              {tier.recommended && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="bg-primary text-sm">MOST POPULAR</Badge>
                </div>
              )}

              <CardHeader>
                <div className="text-4xl mb-2">{tier.icon}</div>
                <CardTitle className="text-2xl">{tier.name}</CardTitle>
                <CardDescription className="text-xs mt-2">{tier.description}</CardDescription>

                <div className="mt-6">
                  <div className="text-4xl font-bold text-foreground">
                    £{billingPeriod === 'monthly' ? tier.monthlyPrice : Math.floor(tier.yearlyPrice / 12)}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {billingPeriod === 'monthly' ? 'per month' : 'per month (billed annually)'}
                  </p>
                </div>
              </CardHeader>

              <CardContent className="flex-1 flex flex-col">
                <Button
                  className={cn(
                    'w-full mb-6',
                    tier.recommended
                      ? 'bg-primary hover:bg-primary/90'
                      : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                  )}
                >
                  {tier.cta}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>

                <div className="space-y-2 flex-1">
                  {tier.features.map((feature) => (
                    <div key={feature.name} className="flex items-start gap-2 text-sm">
                      {feature.included ? (
                        <Check className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
                      ) : (
                        <X className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                      )}
                      <span
                        className={cn(
                          feature.included ? 'text-foreground' : 'text-muted-foreground line-through'
                        )}
                      >
                        {feature.name}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Comparison Table */}
        <Card className="mb-16">
          <CardHeader>
            <CardTitle className="text-2xl">Detailed Feature Comparison</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 font-semibold text-foreground">Feature</th>
                    {TIERS.map((tier) => (
                      <th key={tier.name} className="text-center py-3 px-4 font-semibold text-foreground">
                        {tier.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    { name: 'Call Logging & Recording', basic: true, standard: true, premium: true, enterprise: true },
                    { name: 'Caller Verification', basic: true, standard: true, premium: true, enterprise: true },
                    { name: 'Email Notifications', basic: true, standard: true, premium: true, enterprise: true },
                    { name: 'Maintenance Order Creation', basic: false, standard: true, premium: true, enterprise: true },
                    { name: 'Contractor Dispatch', basic: false, standard: false, premium: true, enterprise: true },
                    { name: 'Emergency Response', basic: false, standard: false, premium: true, enterprise: true },
                    { name: 'Monthly Reports', basic: true, standard: true, premium: true, enterprise: true },
                    { name: 'Weekly Reports', basic: false, standard: false, premium: true, enterprise: true },
                    { name: 'Phone Support', basic: false, standard: false, premium: true, enterprise: true },
                    { name: '24/7 Support', basic: false, standard: false, premium: false, enterprise: true },
                    { name: 'Dedicated Handlers', basic: false, standard: false, premium: false, enterprise: true },
                    { name: 'Custom SLAs', basic: false, standard: false, premium: false, enterprise: true },
                  ].map((row) => (
                    <tr key={row.name} className="border-b border-border hover:bg-secondary/30">
                      <td className="py-3 px-4 text-foreground font-medium">{row.name}</td>
                      {TIERS.map((tier) => (
                        <td key={tier.name} className="text-center py-3 px-4">
                          {row[tier.name.toLowerCase()] ? (
                            <Check className="w-5 h-5 text-green-600 mx-auto" />
                          ) : (
                            <X className="w-5 h-5 text-muted-foreground mx-auto" />
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* FAQ Section */}
        <div className="grid md:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Pricing Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-muted-foreground">
              <div>
                <p className="font-semibold text-foreground mb-1">Per Company</p>
                <p>Pricing is per company subscription. Multi-company setups receive volume discounts up to 15%.</p>
              </div>
              <div>
                <p className="font-semibold text-foreground mb-1">Call Volume</p>
                <p>All tiers include unlimited call volume. No per-call charges or hidden fees.</p>
              </div>
              <div>
                <p className="font-semibold text-foreground mb-1">Setup Fee</p>
                <p>One-time setup: £150-300 depending on tier. Waived for 12-month commitments.</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Getting Started</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-muted-foreground">
              <div>
                <p className="font-semibold text-foreground mb-1">Flexible Terms</p>
                <p>Month-to-month billing available. 12-month contracts include 10% discount.</p>
              </div>
              <div>
                <p className="font-semibold text-foreground mb-1">Free Trial</p>
                <p>Try Basic tier free for 14 days. No credit card required to start.</p>
              </div>
              <div>
                <p className="font-semibold text-foreground mb-1">Support</p>
                <p>Dedicated onboarding support. Migration assistance from existing providers.</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* CTA Section */}
        <Card className="mt-16 bg-primary text-primary-foreground border-primary">
          <CardContent className="py-12 text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to streamline after-hours support?</h2>
            <p className="text-lg opacity-90 mb-8 max-w-2xl mx-auto">
              Join property managers across the UK who trust EstateFlow to handle after-hours calls professionally.
            </p>
            <Button className="bg-primary-foreground text-primary hover:bg-secondary">
              Schedule a Demo
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}