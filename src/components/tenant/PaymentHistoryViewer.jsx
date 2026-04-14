import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Download, Loader2, FileText } from 'lucide-react';
import { format } from 'date-fns';

export default function PaymentHistoryViewer({ tenant }) {
  const { data: transactions = [], isLoading } = useQuery({
    queryKey: ['rent-transactions', tenant.id],
    queryFn: async () => {
      return await base44.entities.FinancialTransaction.filter(
        { tenant_id: tenant.id, transaction_type: 'rent' },
        '-transaction_date',
        50
      );
    }
  });

  const generatePdfMutation = useMutation({
    mutationFn: async () => {
      return await base44.functions.invoke('generateRentPaymentStatement', {
        tenant_id: tenant.id,
        format: 'pdf'
      });
    },
    onSuccess: (result) => {
      if (result.data.pdf_url) {
        window.open(result.data.pdf_url, '_blank');
      }
    }
  });

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-3"></div>
        <p className="text-muted-foreground">Loading payment history...</p>
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <Card className="p-12 bg-white text-center">
        <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
        <p className="text-muted-foreground">No payment history yet</p>
      </Card>
    );
  }

  const statusConfig = {
    paid: { badge: 'bg-green-100 text-green-700', icon: '✓' },
    pending: { badge: 'bg-yellow-100 text-yellow-700', icon: '⏳' },
    overdue: { badge: 'bg-red-100 text-red-700', icon: '⚠️' },
    failed: { badge: 'bg-red-100 text-red-700', icon: '✗' }
  };

  return (
    <div className="space-y-6">
      {/* Download Full Statement */}
      <Card className="p-4 bg-blue-50 border-blue-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-semibold text-foreground">Download Full Statement</p>
            <p className="text-sm text-muted-foreground">Get a complete PDF statement of your payment history</p>
          </div>
          <Button
            onClick={() => generatePdfMutation.mutate()}
            disabled={generatePdfMutation.isPending}
            size="sm"
          >
            {generatePdfMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Download className="w-4 h-4 mr-2" />
                Download PDF
              </>
            )}
          </Button>
        </div>
      </Card>

      {/* Transaction List */}
      <div className="space-y-3">
        {transactions.map(transaction => {
          const config = statusConfig[transaction.status] || statusConfig.pending;
          
          return (
            <Card key={transaction.id} className="p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-lg">{config.icon}</span>
                    <h3 className="font-semibold text-foreground">
                      {format(new Date(transaction.transaction_date), 'MMMM yyyy')} Payment
                    </h3>
                    <Badge className={`text-xs ${config.badge}`}>
                      {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                    <div>
                      <p className="text-muted-foreground">Amount</p>
                      <p className="font-semibold text-foreground">
                        £{transaction.amount?.toLocaleString('en-GB', { minimumFractionDigits: 2 }) || '0.00'}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Date</p>
                      <p className="font-semibold text-foreground">
                        {format(new Date(transaction.transaction_date), 'dd MMM yyyy')}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Reference</p>
                      <p className="font-mono text-sm">{transaction.reference?.slice(0, 12) || 'N/A'}</p>
                    </div>
                    {transaction.payment_method && (
                      <div>
                        <p className="text-muted-foreground">Method</p>
                        <p className="text-foreground capitalize">{transaction.payment_method}</p>
                      </div>
                    )}
                  </div>

                  {transaction.notes && (
                    <p className="text-sm text-muted-foreground mt-2 italic">Note: {transaction.notes}</p>
                  )}
                </div>

                {transaction.status === 'paid' && (
                  <Button variant="outline" size="sm" className="shrink-0">
                    <Download className="w-4 h-4" />
                    <span className="hidden sm:inline ml-1">Receipt</span>
                  </Button>
                )}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}