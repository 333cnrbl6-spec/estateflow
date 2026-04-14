import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import PricingPage from '@/components/billing/PricingPage';
import PageHeader from '@/components/shared/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, Loader2 } from 'lucide-react';

export default function Billing() {
  const { user, loading: authLoading } = useAuth();
  const [userSubscription, setUserSubscription] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && user) {
      // Load user subscription details
      setUserSubscription({
        tier: user.subscription_tier,
        status: user.subscription_status,
        isFounder: user.is_founder,
        endDate: user.subscription_end_date,
      });
      setLoading(false);
    }
  }, [user, authLoading]);

  const handleSubscribeSuccess = (subscriptionData) => {
    // Refresh user subscription info
    setUserSubscription({
      tier: subscriptionData.tierId,
      status: 'active',
      isFounder: subscriptionData.isFounder,
      endDate: subscriptionData.endDate,
    });
  };

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <PageHeader
          title="Billing & Subscription"
          subtitle="Manage your subscription and view billing history"
        />

        {/* Current Subscription Status */}
        {userSubscription?.tier && (
          <Card className="mb-8 border-primary/20 bg-primary/5">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between gap-6 flex-wrap">
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-1">
                    Current Plan: <span className="text-primary capitalize">{userSubscription.tier}</span>
                  </h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Status: <span className="font-medium capitalize">{userSubscription.status}</span>
                  </p>
                  {userSubscription.isFounder && (
                    <div className="inline-block px-3 py-1 bg-amber-100 border border-amber-300 text-amber-800 text-xs font-semibold rounded-full">
                      ⭐ Founding Member
                    </div>
                  )}
                </div>
                <div className="text-right">
                  {userSubscription.endDate && (
                    <p className="text-sm text-muted-foreground">
                      Renews: {new Date(userSubscription.endDate).toLocaleDateString()}
                    </p>
                  )}
                  <Button variant="outline" size="sm" className="mt-2">
                    Manage Subscription
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Trial or Upgrade Info */}
        {!userSubscription?.tier && (
          <Card className="mb-8 border-amber-200 bg-amber-50/50">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-amber-900">Get Started with a Plan</h3>
                  <p className="text-sm text-amber-800 mt-1">
                    You're currently on a free trial. Choose a plan below to get full access after your 14 days.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Pricing */}
        <PricingPage
          currentTierId={userSubscription?.tier}
          isFounder={userSubscription?.isFounder || false}
          onSubscribe={handleSubscribeSuccess}
        />
      </div>
    </div>
  );
}