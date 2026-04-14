import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation } from '@tanstack/react-query';
import { CreditCard, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function TenantRentPayment({ tenant, units }) {
  const [selectedUnit, setSelectedUnit] = useState(units[0]?.id || '');
  const [amount, setAmount] = useState('');
  const [processing, setProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState(null);

  // Fetch rent ledger for selected unit
  const rentLedgerQuery = useQuery({
    queryKey: ['rent-ledger', selectedUnit, tenant.id],
    enabled: !!selectedUnit,
    queryFn: async () => {
      const records = await base44.entities.RentLedger.filter(
        { tenant_id: tenant.id, unit_id: selectedUnit },
        '-created_date',
        12
      );
      return records;
    },
  });

  const { data: rentLedger = [] } = rentLedgerQuery;

  // Calculate outstanding balance
  const outstandingBalance = rentLedger
    .filter(r => r.status === 'overdue' || r.status === 'due')
    .reduce((sum, r) => sum + (r.amount || 0), 0);

  // Process payment
  const processPaymentMutation = useMutation({
    mutationFn: async () => {
      setProcessing(true);
      try {
        const result = await base44.functions.invoke('processRentPayment', {
          tenantId: tenant.id,
          unitId: selectedUnit,
          amount: parseFloat(amount),
          email: tenant.email,
        });
        return result.data;
      } finally {
        setProcessing(false);
      }
    },
    onSuccess: (data) => {
      if (data.success) {
        setPaymentStatus({ type: 'success', message: `Payment of £${amount} processed successfully!` });
        setAmount('');
        setTimeout(() => setPaymentStatus(null), 5000);
      } else {
        setPaymentStatus({ type: 'error', message: data.message || 'Payment failed' });
      }
    },
    onError: (error) => {
      setPaymentStatus({ type: 'error', message: error.message });
    },
  });

  const handlePayment = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      alert('Please enter a valid amount');
      return;
    }
    await processPaymentMutation.mutateAsync();
  };

  return (
    <div className="space-y-8">
      {/* Payment Status */}
      {paymentStatus && (
        <div className={`flex items-center gap-3 p-4 rounded-lg border ${
          paymentStatus.type === 'success'
            ? 'bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800 text-green-700 dark:text-green-100'
            : 'bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800 text-red-700 dark:text-red-100'
        }`}>
          {paymentStatus.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 shrink-0" />
          )}
          <span className="font-semibold">{paymentStatus.message}</span>
        </div>
      )}

      {/* Payment Form */}
      <div className="bg-card rounded-lg border border-border p-6 space-y-4">
        <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <CreditCard className="w-5 h-5" />
          Pay Your Rent Online
        </h3>

        <div>
          <label className="block text-sm font-semibold text-foreground mb-2">Unit</label>
          <select
            value={selectedUnit}
            onChange={(e) => setSelectedUnit(e.target.value)}
            className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          >
            {units.map(unit => (
              <option key={unit.id} value={unit.id}>{unit.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-foreground mb-2">Amount (£)</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Enter amount"
            step="0.01"
            min="0"
            className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        {outstandingBalance > 0 && (
          <div className="bg-orange-50 dark:bg-orange-950 border border-orange-200 dark:border-orange-800 rounded-lg p-4">
            <p className="text-sm text-orange-700 dark:text-orange-100">
              <strong>Outstanding Balance:</strong> £{outstandingBalance.toFixed(2)}
            </p>
          </div>
        )}

        <Button
          onClick={handlePayment}
          disabled={!amount || processing}
          className="w-full gap-2"
        >
          {processing ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Processing Payment...
            </>
          ) : (
            <>
              <CreditCard className="w-4 h-4" />
              Pay Now via Stripe
            </>
          )}
        </Button>

        <p className="text-xs text-muted-foreground text-center">
          Payments are processed securely via Stripe. No card details are stored.
        </p>
      </div>

      {/* Payment History */}
      {rentLedger.length > 0 && (
        <div>
          <h4 className="text-lg font-semibold text-foreground mb-4">Payment History</h4>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {rentLedger.slice(0, 12).map((record) => (
              <div key={record.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    {new Date(record.created_date).toLocaleDateString()}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {record.description || 'Rent Payment'}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-foreground">£{record.amount.toFixed(2)}</p>
                  <p className={`text-xs font-medium ${
                    record.status === 'paid' ? 'text-green-600' :
                    record.status === 'overdue' ? 'text-red-600' :
                    'text-yellow-600'
                  }`}>
                    {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}