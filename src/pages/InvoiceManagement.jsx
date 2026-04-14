import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { FileText, Send, AlertTriangle, CheckCircle2, Clock, DollarSign, Download, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import PageHeader from '@/components/shared/PageHeader';
import StatusBadge from '@/components/shared/StatusBadge';
import { format, addMonths } from 'date-fns';

export default function InvoiceManagement() {
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterProperty, setFilterProperty] = useState('all');
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const queryClient = useQueryClient();

  // Fetch data
  const invoicesQuery = useQuery({
    queryKey: ['invoices'],
    queryFn: () => base44.entities.Invoice.list('-updated_date', 500),
  });

  const propertiesQuery = useQuery({
    queryKey: ['properties'],
    queryFn: () => base44.entities.Property.list('-updated_date', 100),
  });

  const tenantsQuery = useQuery({
    queryKey: ['tenants'],
    queryFn: () => base44.entities.Tenant.list('-updated_date', 100),
  });

  const { data: invoices = [] } = invoicesQuery;
  const { data: properties = [] } = propertiesQuery;
  const { data: tenants = [] } = tenantsQuery;

  // Generate invoices mutation
  const generateInvoicesMutation = useMutation({
    mutationFn: async (month) => {
      return await base44.functions.invoke('generateMonthlyInvoices', { month });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      setShowGenerateModal(false);
    },
  });

  // Send reminder mutation
  const sendReminderMutation = useMutation({
    mutationFn: async (invoiceId) => {
      return await base44.functions.invoke('sendRentReminder', { invoiceId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
    },
  });

  // Update payment status mutation
  const updatePaymentStatusMutation = useMutation({
    mutationFn: async ({ invoiceId, status, paymentDate, paymentReference }) => {
      return await base44.entities.Invoice.update(invoiceId, {
        status,
        paid_date: paymentDate,
        payment_reference: paymentReference,
        approved_date: new Date().toISOString(),
        approved_by: 'system',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
    },
  });

  // Filter invoices
  const filteredInvoices = invoices.filter(inv => {
    if (filterStatus !== 'all' && inv.status !== filterStatus) return false;
    if (filterProperty !== 'all' && inv.maintenance_request_id !== filterProperty) return false;
    return true;
  });

  // Calculate statistics
  const stats = {
    totalInvoices: filteredInvoices.length,
    paidInvoices: filteredInvoices.filter(i => i.status === 'paid').length,
    pendingInvoices: filteredInvoices.filter(i => i.status === 'pending_approval').length,
    overdue: filteredInvoices.filter(i => {
      if (i.status === 'paid') return false;
      const invoiceDate = new Date(i.submitted_date);
      const daysOld = Math.floor((new Date() - invoiceDate) / (1000 * 60 * 60 * 24));
      return daysOld > 30;
    }).length,
    totalValue: filteredInvoices.reduce((sum, i) => sum + (i.amount || 0), 0),
    paidValue: filteredInvoices.filter(i => i.status === 'paid').reduce((sum, i) => sum + (i.amount || 0), 0),
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background">
      <div className="p-8 max-w-[1400px] mx-auto">
        <PageHeader 
          title="Invoice Management" 
          subtitle="Generate, track, and manage rental invoices with automated reminders"
        >
          <Button onClick={() => setShowGenerateModal(true)} className="gap-2">
            <FileText className="w-4 h-4" />
            Generate Invoices
          </Button>
        </PageHeader>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <div className="bg-card rounded-lg border border-border p-4">
            <p className="text-xs text-muted-foreground mb-1">Total Invoices</p>
            <p className="text-2xl font-bold text-foreground">{stats.totalInvoices}</p>
          </div>
          <div className="bg-card rounded-lg border border-border p-4">
            <p className="text-xs text-muted-foreground mb-1">Paid</p>
            <p className="text-2xl font-bold text-green-600">{stats.paidInvoices}</p>
          </div>
          <div className="bg-card rounded-lg border border-border p-4">
            <p className="text-xs text-muted-foreground mb-1">Pending</p>
            <p className="text-2xl font-bold text-blue-600">{stats.pendingInvoices}</p>
          </div>
          <div className="bg-card rounded-lg border border-border p-4">
            <p className="text-xs text-muted-foreground mb-1">Overdue</p>
            <p className="text-2xl font-bold text-red-600">{stats.overdue}</p>
          </div>
          <div className="bg-card rounded-lg border border-border p-4">
            <p className="text-xs text-muted-foreground mb-1">Total Value</p>
            <p className="text-xl font-bold text-foreground">£{stats.totalValue.toLocaleString()}</p>
          </div>
          <div className="bg-card rounded-lg border border-border p-4">
            <p className="text-xs text-muted-foreground mb-1">Paid Value</p>
            <p className="text-xl font-bold text-green-600">£{stats.paidValue.toLocaleString()}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-card rounded-lg border border-border p-4 mb-8 flex gap-4 flex-wrap items-end">
          <div>
            <label className="text-xs font-semibold text-muted-foreground block mb-2">Status</label>
            <select 
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="all">All Statuses</option>
              <option value="pending_approval">Pending Approval</option>
              <option value="approved">Approved</option>
              <option value="paid">Paid</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>

        {/* Generate Modal */}
        {showGenerateModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-card rounded-xl border border-border p-6 max-w-md w-full">
              <h3 className="text-lg font-bold text-foreground mb-4">Generate Monthly Invoices</h3>
              <p className="text-sm text-muted-foreground mb-4">
                This will generate invoices for all active rental agreements for the selected month.
              </p>
              <div className="mb-6">
                <label className="text-sm font-semibold text-foreground block mb-2">Month</label>
                <input 
                  type="month"
                  defaultValue={format(new Date(), 'yyyy-MM')}
                  id="month-input"
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div className="flex gap-3">
                <Button 
                  variant="outline"
                  onClick={() => setShowGenerateModal(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={() => {
                    const input = document.getElementById('month-input');
                    generateInvoicesMutation.mutate(input.value);
                  }}
                  className="flex-1"
                  disabled={generateInvoicesMutation.isPending}
                >
                  {generateInvoicesMutation.isPending ? 'Generating...' : 'Generate'}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Invoices Table */}
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted border-b border-border">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-foreground">Invoice</th>
                  <th className="px-4 py-3 text-left font-semibold text-foreground">Tenant</th>
                  <th className="px-4 py-3 text-left font-semibold text-foreground">Amount</th>
                  <th className="px-4 py-3 text-left font-semibold text-foreground">Due Date</th>
                  <th className="px-4 py-3 text-left font-semibold text-foreground">Status</th>
                  <th className="px-4 py-3 text-left font-semibold text-foreground">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredInvoices.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-4 py-8 text-center text-muted-foreground">No invoices found</td>
                  </tr>
                ) : (
                  filteredInvoices.map((invoice) => {
                    const isOverdue = invoice.status !== 'paid' && 
                      new Date(invoice.submitted_date) < new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
                    const tenant = tenants.find(t => t.id === invoice.contractor_id);
                    
                    return (
                      <tr key={invoice.id} className="hover:bg-muted/50 transition-colors">
                        <td className="px-4 py-3">
                          <div>
                            <p className="font-semibold text-foreground">Invoice #{invoice.id.slice(0, 8)}</p>
                            <p className="text-xs text-muted-foreground">
                              {format(new Date(invoice.submitted_date), 'dd MMM yyyy')}
                            </p>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm">{tenant?.name || invoice.submitted_by}</td>
                        <td className="px-4 py-3 font-semibold text-foreground">£{invoice.amount.toLocaleString()}</td>
                        <td className="px-4 py-3 text-sm">{invoice.submitted_date ? format(new Date(invoice.submitted_date), 'dd MMM yyyy') : '-'}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            {isOverdue && <AlertTriangle className="w-4 h-4 text-red-600" />}
                            <StatusBadge status={invoice.status} />
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2">
                            {invoice.status === 'pending_approval' && (
                              <>
                                <Button 
                                  size="sm"
                                  variant="outline"
                                  onClick={() => updatePaymentStatusMutation.mutate({
                                    invoiceId: invoice.id,
                                    status: 'approved',
                                  })}
                                  disabled={updatePaymentStatusMutation.isPending}
                                >
                                  Approve
                                </Button>
                              </>
                            )}
                            {(invoice.status === 'approved' || isOverdue) && invoice.status !== 'paid' && (
                              <Button 
                                size="sm"
                                variant="outline"
                                onClick={() => sendReminderMutation.mutate(invoice.id)}
                                disabled={sendReminderMutation.isPending}
                                className="gap-1"
                              >
                                <Send className="w-3 h-3" />
                                Remind
                              </Button>
                            )}
                            {invoice.status === 'approved' && (
                              <Button 
                                size="sm"
                                variant="outline"
                                onClick={() => updatePaymentStatusMutation.mutate({
                                  invoiceId: invoice.id,
                                  status: 'paid',
                                  paymentDate: new Date().toISOString(),
                                })}
                                disabled={updatePaymentStatusMutation.isPending}
                                className="gap-1"
                              >
                                <CheckCircle2 className="w-3 h-3" />
                                Mark Paid
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}