import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Loader2, Lock, CheckCircle2, AlertTriangle, Download, X, Repeat, Calendar, CreditCard
} from 'lucide-react';

export default function RentPaymentModal({ open, onOpenChange, amount, propertyName, dueDate, transactionId, tenantId, propertyId, onSuccess }) {
  const [cardDetails, setCardDetails] = useState({ number: '', expiry: '', cvc: '' });
  const [paymentMethod, setPaymentMethod] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [setupRecurring, setSetupRecurring] = useState(false);
  const [recurringDay, setRecurringDay] = useState(1);

  const processPayment = useMutation({
    mutationFn: async () => {
      if (!cardDetails.number || !cardDetails.expiry || !cardDetails.cvc) {
        throw new Error('Please fill in all card details');
      }

      // In production, use Stripe Elements/hosted form
      // For MVP, we'll create a PaymentMethod and process via backend
      const stripeResponse = await fetch('https://api.stripe.com/v1/payment_methods', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          type: 'card',
          'card[number]': cardDetails.number.replace(/\s/g, ''),
          'card[exp_month]': cardDetails.expiry.split('/')[0],
          'card[exp_year]': '20' + cardDetails.expiry.split('/')[1],
          'card[cvc]': cardDetails.cvc,
          key: 'pk_test_YOUR_PUBLISHABLE_KEY', // Should be from env
        }),
      });

      if (!stripeResponse.ok) {
        throw new Error('Failed to create payment method');
      }

      const pmData = await stripeResponse.json();

      // Call backend to process payment
      const res = await base44.functions.invoke('processRentPayment', {
        transaction_id: transactionId,
        payment_method_id: pmData.id,
        amount,
      });

      return res.data;
    },
    onSuccess: (data) => {
      setSuccess(data);
      if (onSuccess) {
        setTimeout(() => onSuccess(data), 2000);
      }
    },
    onError: (err) => {
      setError(err.message);
    },
  });

  const setupRecurringPayment = useMutation({
    mutationFn: async () => {
      const stripeResponse = await fetch('https://api.stripe.com/v1/payment_methods', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          type: 'card',
          'card[number]': cardDetails.number.replace(/\s/g, ''),
          'card[exp_month]': cardDetails.expiry.split('/')[0],
          'card[exp_year]': '20' + cardDetails.expiry.split('/')[1],
          'card[cvc]': cardDetails.cvc,
          key: 'pk_test_YOUR_PUBLISHABLE_KEY',
        }),
      });

      if (!stripeResponse.ok) throw new Error('Failed to create payment method');
      const pmData = await stripeResponse.json();

      const startDate = new Date();
      startDate.setDate(recurringDay);
      if (startDate < new Date()) startDate.setMonth(startDate.getMonth() + 1);

      const res = await base44.functions.invoke('setupRecurringPayment', {
        tenant_id: tenantId,
        payment_method_id: pmData.id,
        amount,
        start_date: startDate.toISOString().split('T')[0],
        day_of_month: recurringDay,
        property_id: propertyId,
      });

      return res.data;
    },
    onSuccess: (data) => {
      setSuccess({ ...data, recurring: true });
      if (onSuccess) setTimeout(() => onSuccess(data), 2000);
    },
    onError: (err) => setError(err.message),
  });

  const handlePaymentSubmit = () => {
    setError(null);
    if (setupRecurring && tenantId) {
      setupRecurringPayment.mutate();
    } else {
      processPayment.mutate();
    }
  };

  if (success) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md">
          <div className="text-center py-8">
            <CheckCircle2 className="w-12 h-12 text-green-600 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-slate-900 mb-2">Payment Successful</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Your rent payment of <strong>£{amount}</strong> has been received and processed.
            </p>
            <div className="bg-slate-50 rounded-lg p-4 mb-4 text-left text-xs">
              <p className="mb-2"><strong>Payment ID:</strong> {success.payment_id}</p>
              <p className="mb-2"><strong>Property:</strong> {propertyName}</p>
              <p><strong>Confirmed:</strong> {success.paid_date}</p>
            </div>
            <p className="text-xs text-muted-foreground mb-4">
            {success.recurring ? (
              <>A receipt has been generated. You'll receive email confirmations for all future automatic payments.</>
            ) : (
              <>A receipt has been generated and is available in your Documents.</>
            )}
            </p>
            <Button
              onClick={() => {
                setSuccess(null);
                setCardDetails({ number: '', expiry: '', cvc: '' });
                onOpenChange(false);
              }}
              className="w-full gap-2"
            >
              <CheckCircle2 className="w-4 h-4" /> Done
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Pay Rent</DialogTitle>
          <DialogDescription>
            Secure payment for {propertyName}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Payment Summary */}
          <div className="bg-slate-50 rounded-lg p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Property:</span>
              <span className="font-medium">{propertyName}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Due Date:</span>
              <span className="font-medium">{new Date(dueDate).toLocaleDateString()}</span>
            </div>
            <div className="border-t pt-2 flex justify-between">
              <span className="font-semibold">Amount Due:</span>
              <span className="text-lg font-bold text-primary">£{amount}</span>
            </div>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="w-4 h-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Recurring Payment Option */}
          {tenantId && (
            <div className="border rounded-lg p-3 bg-slate-50 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Repeat className="w-4 h-4 text-primary" />
                  <div>
                    <p className="text-sm font-medium">Set up automatic monthly payments</p>
                    <p className="text-xs text-muted-foreground">Never miss a payment - cancel anytime</p>
                  </div>
                </div>
                <Switch checked={setupRecurring} onCheckedChange={setSetupRecurring} />
              </div>

              {setupRecurring && (
                <div className="space-y-2 pt-2 border-t">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs">Payment day</Label>
                      <Input
                        type="number"
                        min="1"
                        max="31"
                        value={recurringDay}
                        onChange={(e) => setRecurringDay(parseInt(e.target.value) || 1)}
                        className="h-8"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Monthly amount</Label>
                      <div className="h-8 flex items-center text-sm font-medium">£{amount}</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-2 text-xs text-muted-foreground bg-blue-50 border border-blue-100 rounded p-2">
                    <Calendar className="w-3 h-3 mt-0.5 shrink-0" />
                    <p>Your card will be charged £{amount} on the {recurringDay}{getDaySuffix(recurringDay)} of each month. Email confirmation sent after each payment.</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Card Details Form */}
          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1">Card Number</label>
              <Input
                type="text"
                placeholder="4242 4242 4242 4242"
                value={cardDetails.number}
                onChange={(e) => {
                  let val = e.target.value.replace(/\s/g, '').replace(/[^\d]/g, '');
                  val = val.replace(/(\d{4})/g, '$1 ').trim();
                  setCardDetails({ ...cardDetails, number: val });
                }}
                maxLength="19"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-1">Expiry</label>
                <Input
                  type="text"
                  placeholder="MM/YY"
                  value={cardDetails.expiry}
                  onChange={(e) => {
                    let val = e.target.value.replace(/\D/g, '');
                    if (val.length >= 2) {
                      val = val.slice(0, 2) + '/' + val.slice(2, 4);
                    }
                    setCardDetails({ ...cardDetails, expiry: val });
                  }}
                  maxLength="5"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-1">CVC</label>
                <Input
                  type="text"
                  placeholder="123"
                  value={cardDetails.cvc}
                  onChange={(e) => setCardDetails({ ...cardDetails, cvc: e.target.value.replace(/\D/g, '').slice(0, 4) })}
                  maxLength="4"
                />
              </div>
            </div>
          </div>

          {/* Security Notice */}
          <div className="flex items-start gap-2 text-xs text-muted-foreground bg-blue-50 border border-blue-100 rounded-lg p-3">
            <Lock className="w-4 h-4 mt-0.5 shrink-0 text-blue-600" />
            <p>Your payment is secured with bank-level encryption. Card details are never stored on our servers.</p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={processPayment.isPending}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handlePaymentSubmit}
              disabled={!cardDetails.number || !cardDetails.expiry || !cardDetails.cvc || (setupRecurringPayment.isPending || processPayment.isPending)}
              className="flex-1 gap-2"
            >
              {(setupRecurringPayment.isPending || processPayment.isPending) ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Processing…</>
              ) : (
                <><Lock className="w-4 h-4" /> {setupRecurring ? 'Set Up Auto-Pay' : 'Pay'} £{amount}</>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function getDaySuffix(day) {
  if (day > 3 && day < 21) return 'th';
  switch (day % 10) {
    case 1: return 'st';
    case 2: return 'nd';
    case 3: return 'rd';
    default: return 'th';
  }
}