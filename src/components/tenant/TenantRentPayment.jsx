import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CreditCard, Loader2, CheckCircle } from 'lucide-react';
import { loadStripe } from '@stripe/stripe-js';
import { CardElement, Elements, useStripe, useElements } from '@stripe/react-stripe-js';
import { format } from 'date-fns';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_KEY || '');

export default function TenantRentPayment({ tenant }) {
  const [paymentType, setPaymentType] = useState('one-time');
  const [selectedAmount, setSelectedAmount] = useState('');

  const { data: outstandingBalance = 0, isLoading: balanceLoading } = useQuery({
    queryKey: ['outstanding-balance', tenant.id],
    queryFn: async () => {
      const transactions = await base44.entities.FinancialTransaction.filter(
        { tenant_id: tenant.id, transaction_type: 'rent', status: 'overdue' },
        '-transaction_date',
        100
      );
      return transactions.reduce((sum, t) => sum + (t.amount || 0), 0);
    }
  });

  const { data: upcomingPayment } = useQuery({
    queryKey: ['upcoming-payment', tenant.id],
    queryFn: async () => {
      const transactions = await base44.entities.FinancialTransaction.filter(
        { tenant_id: tenant.id, transaction_type: 'rent', status: 'pending' },
        'transaction_date',
        1
      );
      return transactions[0] || null;
    }
  });

  return (
    <div className="space-y-6">
      {/* Balance Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card className="p-6 bg-gradient-to-br from-red-50 to-orange-50 border-red-200">
          <p className="text-sm text-muted-foreground mb-1">Outstanding Balance</p>
          <p className="text-3xl font-bold text-red-700">
            £{outstandingBalance.toLocaleString('en-GB', { minimumFractionDigits: 2 })}
          </p>
          {outstandingBalance > 0 && (
            <p className="text-xs text-red-600 mt-2">Requires immediate payment</p>
          )}
        </Card>

        {upcomingPayment && (
          <Card className="p-6 bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
            <p className="text-sm text-muted-foreground mb-1">Next Payment Due</p>
            <p className="text-xl font-bold text-blue-700 mb-2">
              £{(upcomingPayment.amount || 0).toLocaleString('en-GB', { minimumFractionDigits: 2 })}
            </p>
            <p className="text-xs text-blue-600">
              {format(new Date(upcomingPayment.transaction_date), 'dd MMM yyyy')}
            </p>
          </Card>
        )}
      </div>

      {/* Payment Options */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 text-foreground">Make a Payment</h3>

        {/* Payment Type Selection */}
        <div className="flex gap-3 mb-6">
          <button
            onClick={() => setPaymentType('one-time')}
            className={`flex-1 py-3 px-4 rounded-lg border-2 transition ${
              paymentType === 'one-time'
                ? 'border-blue-600 bg-blue-50 text-blue-700 font-medium'
                : 'border-slate-200 bg-white text-foreground hover:border-blue-300'
            }`}
          >
            One-Time Payment
          </button>
          <button
            onClick={() => setPaymentType('recurring')}
            className={`flex-1 py-3 px-4 rounded-lg border-2 transition ${
              paymentType === 'recurring'
                ? 'border-green-600 bg-green-50 text-green-700 font-medium'
                : 'border-slate-200 bg-white text-foreground hover:border-green-300'
            }`}
          >
            Set Up Recurring
          </button>
        </div>

        {/* Amount Selection */}
        {paymentType === 'one-time' && (
          <PaymentForm
            tenant={tenant}
            outstandingBalance={outstandingBalance}
            upcomingPayment={upcomingPayment}
            paymentType="one-time"
          />
        )}

        {paymentType === 'recurring' && (
          <RecurringPaymentForm tenant={tenant} />
        )}
      </Card>

      {/* Info Box */}
      <Card className="p-4 bg-blue-50 border-blue-200">
        <p className="text-sm text-blue-900">
          <strong>🔒 Secure Payment:</strong> All payments are processed securely through Stripe. Your card details are never stored on our servers.
        </p>
      </Card>
    </div>
  );
}

function PaymentForm({ tenant, outstandingBalance, upcomingPayment, paymentType }) {
  const [customAmount, setCustomAmount] = useState('');
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const createPaymentIntentMutation = useMutation({
    mutationFn: async (amount) => {
      return await base44.functions.invoke('createStripePaymentIntent', {
        tenant_id: tenant.id,
        amount: Math.round(amount * 100),
        payment_type: 'rent'
      });
    }
  });

  const handlePayment = async (amount) => {
    if (!stripe || !elements) return;

    setLoading(true);
    setError(null);

    try {
      const result = await createPaymentIntentMutation.mutateAsync(amount);
      const { clientSecret } = result.data;

      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement),
          billing_details: {
            name: tenant.full_name,
            email: tenant.email
          }
        }
      });

      if (stripeError) {
        setError(stripeError.message);
      } else if (paymentIntent.status === 'succeeded') {
        setSuccess(true);
        setTimeout(() => window.location.reload(), 2000);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="text-center py-8">
        <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-3" />
        <p className="font-semibold text-foreground mb-1">Payment Successful!</p>
        <p className="text-sm text-muted-foreground">Your payment has been processed.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Amount Options */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-3">Select or Enter Amount</label>
        <div className="grid grid-cols-2 gap-2 mb-3">
          {outstandingBalance > 0 && (
            <button
              onClick={() => setCustomAmount(outstandingBalance.toString())}
              className={`p-3 border rounded-lg transition ${
                customAmount === outstandingBalance.toString()
                  ? 'border-blue-600 bg-blue-50'
                  : 'border-slate-200 hover:border-blue-300'
              }`}
            >
              <p className="text-xs text-muted-foreground">Outstanding</p>
              <p className="font-bold text-foreground">£{outstandingBalance.toLocaleString('en-GB', { minimumFractionDigits: 2 })}</p>
            </button>
          )}
          {upcomingPayment && (
            <button
              onClick={() => setCustomAmount(upcomingPayment.amount.toString())}
              className={`p-3 border rounded-lg transition ${
                customAmount === upcomingPayment.amount.toString()
                  ? 'border-blue-600 bg-blue-50'
                  : 'border-slate-200 hover:border-blue-300'
              }`}
            >
              <p className="text-xs text-muted-foreground">Next Payment</p>
              <p className="font-bold text-foreground">£{(upcomingPayment.amount || 0).toLocaleString('en-GB', { minimumFractionDigits: 2 })}</p>
            </button>
          )}
        </div>

        <input
          type="number"
          placeholder="Or enter custom amount"
          value={customAmount}
          onChange={(e) => setCustomAmount(e.target.value)}
          min="0.01"
          step="0.01"
          className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground"
        />
      </div>

      {/* Card Element */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">Card Details</label>
        <div className="p-3 border border-input rounded-md bg-background">
          <CardElement />
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-600" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      <Button
        onClick={() => handlePayment(parseFloat(customAmount))}
        disabled={!customAmount || loading || !stripe}
        className="w-full"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Processing...
          </>
        ) : (
          <>
            <CreditCard className="w-4 h-4 mr-2" />
            Pay £{parseFloat(customAmount || 0).toLocaleString('en-GB', { minimumFractionDigits: 2 })}
          </>
        )}
      </Button>
    </div>
  );
}

function RecurringPaymentForm({ tenant }) {
  const [monthlyAmount, setMonthlyAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const stripe = useStripe();
  const elements = useElements();

  const setupRecurringMutation = useMutation({
    mutationFn: async (amount) => {
      return await base44.functions.invoke('setupStripeRecurringPayment', {
        tenant_id: tenant.id,
        monthly_amount: Math.round(amount * 100),
        tenant_email: tenant.email,
        tenant_name: tenant.full_name
      });
    }
  });

  const handleSetupRecurring = async () => {
    if (!stripe || !elements || !monthlyAmount) return;

    setLoading(true);

    try {
      const result = await setupRecurringMutation.mutateAsync(parseFloat(monthlyAmount));
      const { clientSecret } = result.data;

      const { error: stripeError, setupIntent } = await stripe.confirmCardSetup(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement),
          billing_details: {
            name: tenant.full_name,
            email: tenant.email
          }
        }
      });

      if (stripeError) {
        alert(`Setup failed: ${stripeError.message}`);
      } else if (setupIntent.status === 'succeeded') {
        setSuccess(true);
        alert('Recurring payment set up successfully!');
        setTimeout(() => window.location.reload(), 2000);
      }
    } catch (err) {
      alert(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="text-center py-8">
        <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-3" />
        <p className="font-semibold text-foreground mb-1">Recurring Payment Set Up!</p>
        <p className="text-sm text-muted-foreground">Your monthly payment will be automatically charged.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">Monthly Amount (£)</label>
        <input
          type="number"
          placeholder="Enter monthly amount"
          value={monthlyAmount}
          onChange={(e) => setMonthlyAmount(e.target.value)}
          min="0.01"
          step="0.01"
          className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-2">Card Details</label>
        <div className="p-3 border border-input rounded-md bg-background">
          <CardElement />
        </div>
      </div>

      <Button
        onClick={handleSetupRecurring}
        disabled={!monthlyAmount || loading || !stripe}
        className="w-full"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Setting up...
          </>
        ) : (
          <>
            <CreditCard className="w-4 h-4 mr-2" />
            Set Up Recurring Payment
          </>
        )}
      </Button>

      <p className="text-xs text-muted-foreground text-center">
        Your card will be charged £{monthlyAmount || '0.00'} on the 1st of each month
      </p>
    </div>
  );
}