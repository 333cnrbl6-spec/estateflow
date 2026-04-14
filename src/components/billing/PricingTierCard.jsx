import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function PricingTierCard({ tier, isFounder = false, onSelect, isActive = false }) {
  const monthlyPrice = isFounder ? Math.round(tier.price * 0.6) : tier.price;
  const annualPrice = isFounder ? Math.round(tier.annual_price * 0.6) : tier.annual_price;
  const monthlyFromAnnual = Math.round(annualPrice / 12);

  return (
    <div className={cn(
      'relative border rounded-2xl p-6 md:p-8 transition-all duration-300',
      tier.recommended
        ? 'border-primary bg-primary/5 shadow-lg ring-1 ring-primary/20 md:scale-105'
        : 'border-border hover:border-primary/40',
      isActive && 'ring-2 ring-green-500 bg-green-50/50'
    )}>
      {tier.recommended && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <Badge className="bg-primary text-primary-foreground">Most Popular</Badge>
        </div>
      )}

      {isActive && (
        <div className="absolute -top-3 right-6">
          <Badge className="bg-green-600 text-white">Current Plan</Badge>
        </div>
      )}

      <div className="mb-6">
        <h3 className="text-xl font-bold text-foreground">{tier.name}</h3>
        <p className="text-sm text-muted-foreground mt-1">{tier.description}</p>
      </div>

      {/* Pricing */}
      <div className="mb-6 pb-6 border-b border-border">
        <div className="flex items-baseline gap-1 mb-2">
          <span className="text-4xl font-bold text-foreground">£{monthlyPrice}</span>
          <span className="text-muted-foreground">/month</span>
        </div>
        <div className="text-sm text-muted-foreground">
          or <span className="font-semibold text-foreground">£{annualPrice}</span> annually
          <span className="ml-1 text-green-600 font-medium">Save £{tier.annual_savings}</span>
        </div>
        {isFounder && (
          <div className="mt-2 text-xs bg-amber-50 border border-amber-200 rounded px-2 py-1 text-amber-800">
            ✓ Founder pricing applied (40% discount for 24 months)
          </div>
        )}
      </div>

      {/* Limits */}
      <div className="mb-6 space-y-2 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Properties</span>
          <span className="font-semibold text-foreground">{tier.properties}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Users</span>
          <span className="font-semibold text-foreground">{tier.users}</span>
        </div>
      </div>

      {/* CTA */}
      <Button
        onClick={onSelect}
        variant={tier.recommended ? 'default' : 'outline'}
        className="w-full mb-6"
        disabled={isActive}
      >
        {isActive ? 'Current Plan' : `Choose ${tier.name}`}
      </Button>

      {/* Features */}
      <div className="space-y-3 mb-6">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Included</p>
        {tier.features.map((feature, i) => (
          <div key={i} className="flex items-start gap-2">
            <Check className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
            <span className="text-sm text-foreground">{feature}</span>
          </div>
        ))}
      </div>

      {/* Excluded */}
      {tier.excluded.length > 0 && (
        <div className="space-y-3 border-t border-border pt-6">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Not Included</p>
          {tier.excluded.map((feature, i) => (
            <div key={i} className="flex items-start gap-2 opacity-50">
              <X className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
              <span className="text-sm text-slate-500">{feature}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}