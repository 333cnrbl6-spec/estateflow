import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';

const STATUS_CONFIG = {
  completed: { variant: 'default', label: 'Paid' },
  pending: { variant: 'secondary', label: 'Pending' },
  failed: { variant: 'destructive', label: 'Failed' },
  cancelled: { variant: 'outline', label: 'Cancelled' },
};

export default function PaymentHistory({ tenantId, refreshKey }) {
  const { data: payments, isLoading } = useQuery({
    queryKey: ['tenantPayments', tenantId, refreshKey],
    queryFn: async () => {
      const result = await base44.entities.FinancialTransaction.filter({
        tenant_id: tenantId,
        type: 'rent_payment',
      }, '-transaction_date', 50);
      return result;
    },
  });

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  if (!payments || payments.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Payment History</CardTitle>
          <CardDescription>Your rent payments and transactions</CardDescription>
        </CardHeader>
        <CardContent className="text-center py-8 text-muted-foreground">
          No payments recorded yet
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Payment History</CardTitle>
        <CardDescription>View your rent payments and transaction status</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {payments.map(payment => {
            const config = STATUS_CONFIG[payment.status] || STATUS_CONFIG.pending;
            const date = new Date(payment.transaction_date);
            const month = date.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });

            return (
              <div
                key={payment.id}
                className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/30 transition-colors"
              >
                <div className="flex-1">
                  <p className="font-medium text-slate-900">{month} Rent Payment</p>
                  <p className="text-sm text-muted-foreground">
                    {date.toLocaleDateString('en-GB')}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="font-semibold text-slate-900">
                      £{payment.amount?.toFixed(2)}
                    </p>
                    <Badge variant={config.variant} className="mt-1">
                      {config.label}
                    </Badge>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}