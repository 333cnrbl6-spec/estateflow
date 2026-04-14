import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { PRICING_TIERS, getTierById, getMonthlyPrice, getAnnualPrice } from '@/lib/pricingTiers';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Loader2, ArrowLeft, AlertCircle } from 'lucide-react';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY 
  ? loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY)
  : Promise.resolve(null);

export default function SubscriptionCheckout({ tierId, billingMode, isFounder, onBack, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const tier = getTierById(tierId);
  if (!tier) return <div>Invalid tier</div>;

  const price = billingMode === 'annual' ? getAnnualPrice(tierId, isFounder) : getMonthlyPrice(tierId, isFounder);
  const stripePrice = billingMode === 'annual' ? tier.stripe_price_annual : tier.stripe_price_monthly;

  const handleCheckout = async () => {
    if (!import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY) {
      setError('Stripe is not configured. Please contact support.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Call backend function to create Stripe checkout session
      const response = await base44.functions.invoke('createCheckoutSession', {
        priceId: stripePrice,
        tierId: tier.id,
        billingMode,
        isFounder,
      });

      if (response.data?.sessionId) {
        const stripe = await stripePromise;
        const { error: stripeError } = await stripe.redirectToCheckout({
          sessionId: response.data.sessionId,
        });

        if (stripeError) {
          setError(stripeError.message);
        }
      }
    } catch (err) {
      console.error('Checkout error:', err);
      setError(err.message || 'Failed to start checkout. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-slate-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <Button variant="ghost" onClick={onBack} className="mb-8">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Plans
        </Button>

        <Card className="p-8 md:p-12">
          <h1 className="text-3xl font-bold text-foreground mb-2">Confirm Your Subscription</h1>
          <p className="text-muted-foreground mb-8">Review your selection and proceed to payment</p>

          {/* Order Summary */}
          <div className="bg-slate-50 rounded-lg p-6 mb-8 border border-border">
            <div className="space-y-4 mb-6">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-foreground">{tier.name} Plan</h3>
                  <p className="text-sm text-muted-foreground mt-1">{tier.description}</p>
                </div>
                <span className="text-sm font-semibold text-muted-foreground">{billingMode === 'annual' ? 'Annual' : 'Monthly'}</span>
              </div>
            </div>

            <div className="border-t border-border pt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subscription</span>
                <span className="font-medium">£{price}</span>
              </div>
              {isFounder && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Founder Discount (40%)</span>
                  <span>-£{Math.round(price / 0.6 * 0.4)}</span>
                </div>
              )}
              <div className="border-t border-border pt-2 flex justify-between font-semibold">
                <span>Total due {billingMode === 'annual' ? 'today' : 'per month'}</span>
                <span className="text-lg">£{price}</span>
              </div>
            </div>

            {billingMode === 'annual' && (
              <p className="text-xs text-green-600 mt-4 bg-green-50 p-2 rounded">
                ✓ You're saving £{tier.annual_savings} with annual billing
              </p>
            )}
          </div>

          {/* Plan Details */}
          <div className="mb-8">
            <h4 className="font-semibold text-foreground mb-3">What's Included</h4>
            <div className="space-y-2">
              {tier.features.slice(0, 5).map((feature, i) => (
                <div key={i} className="text-sm text-foreground flex items-center gap-2">
                  <span className="text-green-600">✓</span> {feature}
                </div>
              ))}
              {tier.features.length > 5 && (
                <div className="text-sm text-muted-foreground">+ {tier.features.length - 5} more features</div>
              )}
            </div>
          </div>

          {/* Terms */}
          <div className="mb-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex gap-3">
              <AlertCircle className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-semibold mb-1">14-day free trial</p>
                <p>You'll start your free trial immediately. No payment required for 14 days. Cancel anytime.</p>
                {isFounder && (
                  <p className="mt-2">
                    <strong>Founder Terms:</strong> 40% discount applies for 24 months, then standard pricing. Non-transferable account.
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              {error}
            </div>
          )}

          {/* CTA Buttons */}
          <div className="flex gap-3">
            <Button variant="outline" onClick={onBack} disabled={loading} className="flex-1">
              Back
            </Button>
            <Button
              onClick={handleCheckout}
              disabled={loading}
              className="flex-1"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                'Start Free Trial'
              )}
            </Button>
          </div>

          <p className="text-xs text-center text-muted-foreground mt-4">
            Secure payment powered by Stripe. Your payment information is encrypted.
          </p>
        </Card>
      </div>
    </div>
  );
}