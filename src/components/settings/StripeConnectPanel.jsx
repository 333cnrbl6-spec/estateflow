import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, AlertCircle, ExternalLink, Loader2, CreditCard, Zap } from 'lucide-react';
import { toast } from 'sonner';

/**
 * Stripe Connect Panel — allows an admin to connect THEIR OWN Stripe account
 * so that rent payments collected in the app are routed to their account.
 *
 * Flow:
 * 1. Admin clicks "Connect Stripe Account"
 * 2. Backend function generates a Stripe Connect OAuth URL
 * 3. User completes OAuth in new tab
 * 4. On return, the stripe_account_id is stored on the user record
 */
export default function StripeConnectPanel() {
  const qc = useQueryClient();
  const [connecting, setConnecting] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);

  const { data: user, isLoading } = useQuery({
    queryKey: ['me-stripe'],
    queryFn: () => base44.auth.me(),
  });

  const isConnected = !!user?.stripe_account_id;
  const accountId = user?.stripe_account_id;

  // Handle OAuth callback — ?stripe_code=... in URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('stripe_code');
    if (code && !isConnected) {
      handleOAuthCallback(code);
    }
  }, []);

  const handleOAuthCallback = async (code) => {
    setConnecting(true);
    try {
      const res = await base44.functions.invoke('stripeConnectCallback', { code });
      if (res.data?.stripe_account_id) {
        await base44.auth.updateMe({ stripe_account_id: res.data.stripe_account_id });
        qc.invalidateQueries({ queryKey: ['me-stripe'] });
        toast.success('Stripe account connected successfully!');
        // Clean URL
        window.history.replaceState({}, '', window.location.pathname);
      }
    } catch (err) {
      toast.error('Failed to complete Stripe connection: ' + err.message);
    } finally {
      setConnecting(false);
    }
  };

  const handleConnect = async () => {
    setConnecting(true);
    try {
      const res = await base44.functions.invoke('stripeConnectLink', {
        redirect_uri: window.location.href
      });
      if (res.data?.url) {
        window.location.href = res.data.url;
      } else {
        toast.error('Could not generate Stripe Connect link');
      }
    } catch (err) {
      toast.error('Failed to initiate Stripe Connect: ' + err.message);
    } finally {
      setConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    setDisconnecting(true);
    try {
      await base44.auth.updateMe({ stripe_account_id: null });
      qc.invalidateQueries({ queryKey: ['me-stripe'] });
      toast.success('Stripe account disconnected');
    } catch (err) {
      toast.error('Failed to disconnect: ' + err.message);
    } finally {
      setDisconnecting(false);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-violet-100 rounded-lg">
            <CreditCard className="w-5 h-5 text-violet-600" />
          </div>
          <div>
            <CardTitle className="text-base">Stripe Connect — Rent Collection</CardTitle>
            <CardDescription className="text-sm mt-0.5">
              Connect your Stripe account so rent payments go directly to you
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Connection Status */}
        <div className={`flex items-center justify-between p-4 rounded-lg border ${
          isConnected
            ? 'bg-green-50 border-green-200'
            : 'bg-slate-50 border-slate-200'
        }`}>
          <div className="flex items-center gap-3">
            {isConnected ? (
              <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-slate-400 flex-shrink-0" />
            )}
            <div>
              <p className={`text-sm font-semibold ${isConnected ? 'text-green-800' : 'text-slate-700'}`}>
                {isConnected ? 'Stripe Account Connected' : 'No Stripe Account Connected'}
              </p>
              {isConnected ? (
                <p className="text-xs text-green-600 mt-0.5">
                  Account ID: <code className="font-mono">{accountId}</code>
                </p>
              ) : (
                <p className="text-xs text-slate-500 mt-0.5">
                  Rent payments will not be routed to your account until you connect Stripe
                </p>
              )}
            </div>
          </div>
          <Badge className={isConnected ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}>
            {isConnected ? 'Connected' : 'Not connected'}
          </Badge>
        </div>

        {/* How it works */}
        {!isConnected && (
          <div className="space-y-2">
            <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide">How it works</p>
            <div className="space-y-2">
              {[
                'Click "Connect Stripe Account" below',
                'Log in to your Stripe account (or create one free)',
                'Authorise Premiso to send payments to your account',
                'Rent collected from tenants routes directly to you',
              ].map((step, i) => (
                <div key={i} className="flex items-start gap-2 text-xs text-slate-600">
                  <span className="flex-shrink-0 w-4 h-4 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-[10px]">
                    {i + 1}
                  </span>
                  {step}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Features when connected */}
        {isConnected && (
          <div className="space-y-2">
            <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Enabled Features</p>
            <div className="grid grid-cols-1 gap-1.5">
              {[
                'Collect rent directly into your Stripe account',
                'Send payment links to tenants',
                'Automated rent reminders',
                'Real-time payment tracking in Premiso',
              ].map((f, i) => (
                <div key={i} className="flex items-center gap-2 text-xs text-slate-700">
                  <Zap className="w-3 h-3 text-green-500 flex-shrink-0" />
                  {f}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          {!isConnected ? (
            <Button onClick={handleConnect} disabled={connecting} className="gap-2">
              {connecting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <ExternalLink className="w-4 h-4" />
              )}
              {connecting ? 'Connecting...' : 'Connect Stripe Account'}
            </Button>
          ) : (
            <>
              <Button
                variant="outline"
                onClick={() => window.open('https://dashboard.stripe.com', '_blank')}
                className="gap-2"
              >
                <ExternalLink className="w-4 h-4" /> Stripe Dashboard
              </Button>
              <Button
                variant="outline"
                onClick={handleDisconnect}
                disabled={disconnecting}
                className="gap-2 text-destructive hover:text-destructive"
              >
                {disconnecting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                Disconnect
              </Button>
            </>
          )}
        </div>

        <p className="text-xs text-muted-foreground">
          Stripe Connect is free to set up. Standard Stripe processing fees apply to each payment (typically 1.4% + 20p for UK cards).
        </p>
      </CardContent>
    </Card>
  );
}