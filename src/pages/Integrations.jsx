import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import PageHeader from '@/components/shared/PageHeader';
import { CreditCard } from 'lucide-react';

export default function Integrations() {
  const [showStripeDialog, setShowStripeDialog] = useState(false);
  const [stripePublicKey, setStripePublicKey] = useState('');
  const [stripeSecretKey, setStripeSecretKey] = useState('');
  const [loading, setLoading] = useState(false);

  const handleStripeSetup = async () => {
    if (!stripePublicKey || !stripeSecretKey) {
      alert('Please enter both Stripe keys');
      return;
    }

    setLoading(true);
    try {
      // Store keys as secrets via backend
      const response = await fetch('/api/integrations/stripe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          publicKey: stripePublicKey,
          secretKey: stripeSecretKey,
        }),
      });

      if (response.ok) {
        alert('Stripe integration configured successfully');
        setShowStripeDialog(false);
        setStripePublicKey('');
        setStripeSecretKey('');
      } else {
        alert('Failed to save Stripe keys');
      }
    } catch (error) {
      alert('Error setting up Stripe: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8">
      <PageHeader title="Integrations" subtitle="Connect external services to enhance Powell & Co" />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Stripe Card */}
        <div className="border border-border rounded-lg p-6 bg-card hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-primary/10 rounded-lg">
              <CreditCard className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Stripe Payments</h3>
              <p className="text-xs text-muted-foreground">Accept rent payments</p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Enable tenants to pay rent securely via card, bank transfer, and more.
          </p>
          <Button
            onClick={() => setShowStripeDialog(true)}
            className="w-full"
            variant="default"
          >
            Configure Stripe
          </Button>
        </div>
      </div>

      {/* Stripe Setup Dialog */}
      <Dialog open={showStripeDialog} onOpenChange={setShowStripeDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Setup Stripe</DialogTitle>
            <DialogDescription>
              Enter your Stripe API keys to enable payment processing. Get them from{' '}
              <a
                href="https://dashboard.stripe.com/apikeys"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline"
              >
                your Stripe dashboard
              </a>
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground">Publishable Key</label>
              <Input
                placeholder="pk_live_..."
                value={stripePublicKey}
                onChange={(e) => setStripePublicKey(e.target.value)}
                className="mt-2"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-foreground">Secret Key</label>
              <Input
                type="password"
                placeholder="sk_live_..."
                value={stripeSecretKey}
                onChange={(e) => setStripeSecretKey(e.target.value)}
                className="mt-2"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => setShowStripeDialog(false)}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button onClick={handleStripeSetup} disabled={loading} className="flex-1">
                {loading ? 'Saving...' : 'Save & Continue'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}