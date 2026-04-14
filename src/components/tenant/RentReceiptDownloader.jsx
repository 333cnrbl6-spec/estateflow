import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Download, Loader2, FileText, Eye } from 'lucide-react';
import { format } from 'date-fns';

export default function RentReceiptDownloader({ tenant }) {
  const [downloadingId, setDownloadingId] = useState(null);

  const { data: receipts = [], isLoading } = useQuery({
    queryKey: ['rent-receipts', tenant.id],
    queryFn: async () => {
      return await base44.entities.FinancialTransaction.filter(
        { tenant_id: tenant.id, transaction_type: 'rent', status: 'paid' },
        '-transaction_date',
        50
      );
    }
  });

  const downloadReceiptMutation = useMutation({
    mutationFn: async (transactionId) => {
      return await base44.functions.invoke('generateRentReceipt', {
        transaction_id: transactionId
      });
    },
    onSuccess: (result) => {
      if (result.data.receipt_url) {
        const link = document.createElement('a');
        link.href = result.data.receipt_url;
        link.download = `receipt-${downloadingId}.pdf`;
        link.click();
      }
      setDownloadingId(null);
    },
    onError: () => {
      setDownloadingId(null);
    }
  });

  const handleDownload = async (transactionId) => {
    setDownloadingId(transactionId);
    await downloadReceiptMutation.mutateAsync(transactionId);
  };

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-3"></div>
        <p className="text-muted-foreground">Loading receipts...</p>
      </div>
    );
  }

  if (receipts.length === 0) {
    return (
      <Card className="p-12 bg-white text-center">
        <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
        <p className="text-muted-foreground">No settled transactions with receipts yet</p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {receipts.map(receipt => (
        <Card key={receipt.id} className="p-4 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-2">
                <FileText className="w-5 h-5 text-blue-600 shrink-0" />
                <h3 className="font-semibold text-foreground truncate">
                  {format(new Date(receipt.transaction_date), 'MMMM yyyy')} Rent Receipt
                </h3>
                <Badge className="bg-green-100 text-green-700 shrink-0">Paid</Badge>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                <div>
                  <p className="text-muted-foreground">Amount</p>
                  <p className="font-semibold text-foreground">
                    £{receipt.amount?.toLocaleString('en-GB', { minimumFractionDigits: 2 }) || '0.00'}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Date Paid</p>
                  <p className="font-semibold text-foreground">
                    {format(new Date(receipt.transaction_date), 'dd MMM yyyy')}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Reference</p>
                  <p className="font-mono text-xs text-foreground">{receipt.reference?.slice(0, 12)}</p>
                </div>
                {receipt.payment_method && (
                  <div>
                    <p className="text-muted-foreground">Payment Method</p>
                    <p className="text-foreground capitalize text-sm">{receipt.payment_method}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-2 shrink-0">
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleDownload(receipt.id)}
                disabled={downloadingId === receipt.id}
              >
                {downloadingId === receipt.id ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    <span className="hidden sm:inline ml-1">Download</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        </Card>
      ))}

      {/* Info Box */}
      <Card className="p-4 bg-blue-50 border-blue-200">
        <p className="text-sm text-blue-900">
          <strong>Note:</strong> Receipts are automatically generated for all paid rent transactions and can be downloaded in PDF format.
        </p>
      </Card>
    </div>
  );
}