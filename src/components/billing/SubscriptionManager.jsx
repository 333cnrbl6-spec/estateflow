import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle2, Clock, Zap } from 'lucide-react';

export default function SubscriptionManager() {
  const { data: user, isLoading } = useQuery({
    queryKey: ['current-user-subscription'],
    queryFn: () => base44.auth.me(),
    staleTime: 60 * 1000
  });

  if (isLoading) return <div className="text-center py-8">Loading subscription...</div>;
  if (!user) return <div>Not authenticated</div>;

  const isTrialActive = user.subscription_status === 'trial' && new Date(user.trial_ends_at) > new Date();
  const daysLeft = isTrialActive ? Math.ceil((new Date(user.trial_ends_at) - new Date()) / (1000 * 60 * 60 * 24)) : 0;

  const statusConfig = {
    trial: { icon: Clock, color: 'bg-blue-50', badge: 'Trial', badgeColor: 'bg-blue-100' },
    active: { icon: CheckCircle2, color: 'bg-green-50', badge: 'Active', badgeColor: 'bg-green-100' },
    paused: { icon: AlertCircle, color: 'bg-yellow-50', badge: 'Paused', badgeColor: 'bg-yellow-100' },
    past_due: { icon: AlertCircle, color: 'bg-red-50', badge: 'Past Due', badgeColor: 'bg-red-100' }
  };

  const config = statusConfig[user.subscription_status] || statusConfig.active;
  const Icon = config.icon;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Trial Banner */}
      {isTrialActive && (
        <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-slate-900 mb-1">Free Trial Active</h3>
                <p className="text-sm text-slate-600">{daysLeft} days remaining • Upgrade anytime</p>
              </div>
              <Button className="bg-blue-600 hover:bg-blue-700">Upgrade Now</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Subscription Status */}
      <Card className={`${config.color}`}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Icon className="w-5 h-5" />
              Subscription Status
            </CardTitle>
            <Badge className={config.badgeColor}>{config.badge}</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-slate-600">Tier</p>
              <p className="font-semibold text-slate-900">{user.subscription_tier || 'Starter'}</p>
            </div>
            <div>
              <p className="text-sm text-slate-600">Properties Limit</p>
              <p className="font-semibold text-slate-900">{user.properties_limit || 5} properties</p>
            </div>
            {isTrialActive && (
              <div>
                <p className="text-sm text-slate-600">Trial Ends</p>
                <p className="font-semibold text-slate-900">{new Date(user.trial_ends_at).toLocaleDateString()}</p>
              </div>
            )}
            {user.subscription_status === 'past_due' && (
              <div>
                <p className="text-sm text-slate-600">Action Required</p>
                <p className="font-semibold text-red-600">Update payment method</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Payment Method */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Method</CardTitle>
        </CardHeader>
        <CardContent>
          {user.stripe_customer_id ? (
            <div className="space-y-3">
              <p className="text-sm text-slate-600">Managed in Stripe</p>
              <Button variant="outline">Update Payment Method</Button>
            </div>
          ) : (
            <Button>Add Payment Method</Button>
          )}
        </CardContent>
      </Card>

      {/* Pricing Tiers */}
      <div>
        <h3 className="text-lg font-bold text-slate-900 mb-4">Available Plans</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { name: 'Starter', price: '£29', properties: 5, features: ['5 properties', 'Basic support', '14-day trial'] },
            { name: 'Professional', price: '£99', properties: 50, features: ['50 properties', 'Priority support', 'API access'], highlight: true },
            { name: 'Enterprise', price: 'Custom', properties: '∞', features: ['Unlimited properties', '24/7 support', 'Custom integrations'] }
          ].map(plan => (
            <Card key={plan.name} className={plan.highlight ? 'ring-2 ring-blue-500' : ''}>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-bold text-slate-900">{plan.name}</h4>
                    <p className="text-2xl font-bold text-slate-900 mt-2">{plan.price}<span className="text-sm text-slate-600">/month</span></p>
                  </div>
                  <ul className="space-y-2">
                    {plan.features.map(f => (
                      <li key={f} className="text-sm text-slate-600 flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Button 
                    variant={user.subscription_tier === plan.name ? 'outline' : 'default'}
                    className="w-full"
                    disabled={user.subscription_tier === plan.name}
                  >
                    {user.subscription_tier === plan.name ? 'Current Plan' : 'Upgrade'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}