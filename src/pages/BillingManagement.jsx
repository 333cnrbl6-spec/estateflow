import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import PageHeader from '@/components/shared/PageHeader';
import StatCard from '@/components/shared/StatCard';
import { FileText, DollarSign, Clock, CheckCircle2, AlertCircle, Download, Send } from 'lucide-react';
import { cn } from '@/lib/utils';

const STATUS_COLORS = {
  draft: 'bg-gray-100 text-gray-900',
  issued: 'bg-blue-100 text-blue-900',
  sent: 'bg-cyan-100 text-cyan-900',
  viewed: 'bg-purple-100 text-purple-900',
  paid: 'bg-green-100 text-green-900',
  overdue: 'bg-red-100 text-red-900',
  cancelled: 'bg-gray-100 text-gray-900',
};

const PAYMENT_STATUS_COLORS = {
  unpaid: 'text-orange-600',
  pending: 'text-blue-600',
  succeeded: 'text-green-600',
  failed: 'text-red-600',
  cancelled: 'text-gray-600',
};

export default function BillingManagement() {
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const queryClient = useQueryClient();

  const { data: invoices = [], isLoading } = useQuery({
    queryKey: ['invoices'],
    queryFn: () =>
      base44.entities.Invoice.list('-issue_date', 100),
  });

  const { data: services = [] } = useQuery({
    queryKey: ['services'],
    queryFn: () =>
      base44.entities.OutOfHoursService.list('-created_date', 50),
  });

  const generateInvoicesMutation = useMutation({
    mutationFn: () => base44.functions.invoke('generateMonthlyInvoices', {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
    },
  });

  const processPaymentMutation = useMutation({
    mutationFn: (data) =>
      base44.functions.invoke('processStripePayment', data),
  });

  const downloadInvoice = (invoice) => {
    // Generate simple PDF download link
    const content = `
Invoice #${invoice.invoice_number}

Billing Period: ${invoice.billing_period_start} to ${invoice.billing_period_end}
Amount: £${(invoice.amount / 100).toFixed(2)}
Due Date: ${invoice.due_date}
Status: ${invoice.status}

Line Items:
${invoice.line_items
  ?.map((item) => `- ${item.description}: £${(item.amount / 100).toFixed(2)}`)
  .join('\n')}

Total: £${(invoice.amount / 100).toFixed(2)}
    `;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${invoice.invoice_number}.txt`;
    a.click();
  };

  const stats = {
    totalInvoiced: invoices.reduce((sum, inv) => sum + (inv.amount || 0), 0),
    paidInvoices: invoices.filter((inv) => inv.payment_status === 'succeeded').length,
    pendingPayment: invoices.filter((inv) => inv.status === 'overdue').length,
    activeServices: services.filter((s) => s.is_active).length,
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-muted-foreground">Loading billing data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Billing & Invoices"
        subtitle="Manage invoices and payment tracking"
      >
        <Button
          onClick={() => generateInvoicesMutation.mutate()}
          disabled={generateInvoicesMutation.isPending}
        >
          {generateInvoicesMutation.isPending ? 'Generating...' : 'Generate Monthly Invoices'}
        </Button>
      </PageHeader>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          icon={DollarSign}
          title="Total Invoiced"
          value={`£${(stats.totalInvoiced / 100).toFixed(0)}`}
        />
        <StatCard
          icon={CheckCircle2}
          title="Paid Invoices"
          value={stats.paidInvoices}
        />
        <StatCard
          icon={AlertCircle}
          title="Overdue"
          value={stats.pendingPayment}
        />
        <StatCard
          icon={FileText}
          title="Active Services"
          value={stats.activeServices}
        />
      </div>

      {/* Invoices Table */}
      <Card>
        <CardHeader>
          <CardTitle>Invoices</CardTitle>
        </CardHeader>
        <CardContent>
          {invoices.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No invoices yet</p>
          ) : (
            <div className="space-y-3">
              {invoices.map((invoice) => (
                <button
                  key={invoice.id}
                  onClick={() => setSelectedInvoice(invoice)}
                  className="w-full text-left"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 border border-border rounded-lg hover:bg-secondary/30 transition-colors">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-foreground">
                        {invoice.invoice_number}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {invoice.billing_period_start} to {invoice.billing_period_end}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="font-bold text-foreground">
                          £{(invoice.amount / 100).toFixed(2)}
                        </p>
                        <p className={cn(
                          'text-xs font-semibold',
                          PAYMENT_STATUS_COLORS[invoice.payment_status]
                        )}>
                          {invoice.payment_status}
                        </p>
                      </div>
                      <Badge className={STATUS_COLORS[invoice.status]}>
                        {invoice.status}
                      </Badge>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Invoice Detail Modal */}
      {selectedInvoice && (
        <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50">
          <Card className="w-full sm:w-96 sm:max-h-96 overflow-y-auto">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">
                {selectedInvoice.invoice_number}
              </CardTitle>
              <button
                onClick={() => setSelectedInvoice(null)}
                className="text-muted-foreground hover:text-foreground"
              >
                ✕
              </button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase">
                  Amount
                </p>
                <p className="text-2xl font-bold">
                  £{(selectedInvoice.amount / 100).toFixed(2)}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground">Issue Date</p>
                  <p className="text-sm font-medium">{selectedInvoice.issue_date}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Due Date</p>
                  <p className="text-sm font-medium">{selectedInvoice.due_date}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Status</p>
                  <Badge className={STATUS_COLORS[selectedInvoice.status]} className="mt-1">
                    {selectedInvoice.status}
                  </Badge>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Payment</p>
                  <Badge variant="outline" className="mt-1">
                    {selectedInvoice.payment_status}
                  </Badge>
                </div>
              </div>

              {selectedInvoice.line_items && selectedInvoice.line_items.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase mb-2">
                    Line Items
                  </p>
                  <div className="space-y-2">
                    {selectedInvoice.line_items.map((item, idx) => (
                      <div key={idx} className="flex justify-between text-sm">
                        <span>{item.description}</span>
                        <span className="font-semibold">
                          £{(item.amount / 100).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-2 pt-4 border-t border-border">
                <Button
                  onClick={() => downloadInvoice(selectedInvoice)}
                  variant="outline"
                  size="sm"
                  className="flex-1"
                >
                  <Download className="w-4 h-4 mr-1" />
                  Download
                </Button>
                {selectedInvoice.payment_status === 'unpaid' && (
                  <Button
                    onClick={() => {
                      setShowPaymentModal(true);
                    }}
                    size="sm"
                    className="flex-1"
                  >
                    <Send className="w-4 h-4 mr-1" />
                    Pay Now
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}