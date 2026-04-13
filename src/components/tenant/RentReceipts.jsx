import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Download, FileText } from 'lucide-react';

export default function RentReceipts({ tenantId, refreshKey }) {
  const [generatingId, setGeneratingId] = useState(null);

  const { data: payments, isLoading } = useQuery({
    queryKey: ['tenantPaymentsForReceipts', tenantId, refreshKey],
    queryFn: async () => {
      const result = await base44.entities.FinancialTransaction.filter({
        tenant_id: tenantId,
        type: 'rent_payment',
        status: 'completed',
      }, '-transaction_date', 50);
      return result;
    },
  });

  const generateReceipt = useMutation({
    mutationFn: async (payment) => {
      setGeneratingId(payment.id);
      try {
        const res = await base44.functions.invoke('generateRentReceipt', {
          payment_id: payment.id,
          tenant_id: tenantId,
        });
        return res.receipt_url;
      } finally {
        setGeneratingId(null);
      }
    },
    onSuccess: (url) => {
      if (url) window.open(url, '_blank');
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
          <CardTitle>Rent Receipts</CardTitle>
          <CardDescription>Download your payment receipts</CardDescription>
        </CardHeader>
        <CardContent className="text-center py-8 text-muted-foreground">
          No completed payments to generate receipts for
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Rent Receipts</CardTitle>
        <CardDescription>Download PDF receipts for your rent payments</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {payments.map(payment => {
            const date = new Date(payment.transaction_date);
            const month = date.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });

            return (
              <div
                key={payment.id}
                className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/30 transition-colors"
              >
                <div className="flex items-center gap-3 flex-1">
                  <FileText className="w-5 h-5 text-slate-400 shrink-0" />
                  <div>
                    <p className="font-medium text-slate-900">{month}</p>
                    <p className="text-sm text-muted-foreground">
                      £{payment.amount?.toFixed(2)}
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => generateReceipt.mutate(payment)}
                  disabled={generatingId === payment.id}
                  className="gap-2"
                >
                  {generatingId === payment.id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Download className="w-4 h-4" />
                  )}
                  {generatingId === payment.id ? 'Generating...' : 'Download'}
                </Button>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}