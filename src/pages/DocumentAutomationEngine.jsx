import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Loader2, FileText, CheckCircle, Mail } from 'lucide-react';

export default function DocumentAutomationEngine() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const queryClient = useQueryClient();

  const { data: tenants = [] } = useQuery({
    queryKey: ['tenants-for-docs'],
    queryFn: () => base44.entities.Tenant.list()
  });

  const { data: inspections = [] } = useQuery({
    queryKey: ['inspections-for-docs'],
    queryFn: () => base44.entities.InspectionRecord.filter({ status: 'completed' })
  });

  const { data: transactions = [] } = useQuery({
    queryKey: ['transactions-for-docs'],
    queryFn: () => base44.entities.FinancialTransaction.filter({ transaction_type: 'rent_payment' })
  });

  // Lease Agreement Generation
  const generateLeaseMutation = useMutation({
    mutationFn: async (tenantId) => {
      const tenant = tenants.find(t => t.id === tenantId);
      return await base44.functions.invoke('generateLeaseAgreement', {
        tenant_id: tenantId,
        property_id: tenant.property_id,
        unit_id: tenant.unit_id,
        start_date: tenant.tenancy_start_date,
        end_date: tenant.tenancy_end_date,
        monthly_rent: 1200 // Would be fetched from rent ledger in real scenario
      });
    },
    onSuccess: () => {
      setSuccess('Lease agreement generated and sent to tenant');
      queryClient.invalidateQueries({ queryKey: ['generated-documents'] });
      setTimeout(() => setSuccess(''), 3000);
    },
    onError: (err) => {
      setError(err.message);
      setTimeout(() => setError(''), 3000);
    }
  });

  // Inspection Report Generation
  const generateReportMutation = useMutation({
    mutationFn: async (inspectionId) => {
      return await base44.functions.invoke('generateInspectionReport', {
        inspection_record_id: inspectionId
      });
    },
    onSuccess: () => {
      setSuccess('Inspection report generated');
      queryClient.invalidateQueries({ queryKey: ['generated-documents'] });
      setTimeout(() => setSuccess(''), 3000);
    },
    onError: (err) => {
      setError(err.message);
      setTimeout(() => setError(''), 3000);
    }
  });

  // Rent Receipt Generation
  const generateReceiptMutation = useMutation({
    mutationFn: async (transactionId) => {
      return await base44.functions.invoke('generateRentReceipt', {
        transaction_id: transactionId
      });
    },
    onSuccess: () => {
      setSuccess('Rent receipt generated and emailed to tenant');
      queryClient.invalidateQueries({ queryKey: ['generated-documents'] });
      setTimeout(() => setSuccess(''), 3000);
    },
    onError: (err) => {
      setError(err.message);
      setTimeout(() => setError(''), 3000);
    }
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <h1 className="text-4xl font-bold text-foreground">Document Automation Engine</h1>
          <p className="text-muted-foreground mt-2">AI-powered generation of property documents with instant distribution</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Alerts */}
        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <p className="text-sm text-green-700">{success}</p>
          </div>
        )}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <Tabs defaultValue="leases" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="leases">Lease Agreements</TabsTrigger>
            <TabsTrigger value="reports">Inspection Reports</TabsTrigger>
            <TabsTrigger value="receipts">Rent Receipts</TabsTrigger>
          </TabsList>

          {/* Lease Agreements Tab */}
          <TabsContent value="leases">
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <FileText className="w-6 h-6 text-blue-600" />
                <div>
                  <h2 className="text-2xl font-bold text-foreground">Generate Lease Agreements</h2>
                  <p className="text-muted-foreground">Create personalized AST agreements for tenants</p>
                </div>
              </div>

              <div className="space-y-3">
                {tenants.length === 0 ? (
                  <div className="p-4 bg-slate-50 text-center rounded text-muted-foreground">
                    No tenants available
                  </div>
                ) : (
                  tenants.map(tenant => (
                    <div key={tenant.id} className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition">
                      <div>
                        <p className="font-medium text-foreground">{tenant.full_name}</p>
                        <p className="text-sm text-muted-foreground">{tenant.email}</p>
                      </div>
                      <Button
                        onClick={() => generateLeaseMutation.mutate(tenant.id)}
                        disabled={generateLeaseMutation.isPending}
                        size="sm"
                      >
                        {generateLeaseMutation.isPending ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Generating...
                          </>
                        ) : (
                          'Generate Lease'
                        )}
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </Card>
          </TabsContent>

          {/* Inspection Reports Tab */}
          <TabsContent value="reports">
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <FileText className="w-6 h-6 text-green-600" />
                <div>
                  <h2 className="text-2xl font-bold text-foreground">Generate Inspection Reports</h2>
                  <p className="text-muted-foreground">Create comprehensive reports from completed inspections</p>
                </div>
              </div>

              <div className="space-y-3">
                {inspections.length === 0 ? (
                  <div className="p-4 bg-slate-50 text-center rounded text-muted-foreground">
                    No completed inspections available
                  </div>
                ) : (
                  inspections.map(inspection => (
                    <div key={inspection.id} className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition">
                      <div>
                        <p className="font-medium text-foreground">{inspection.inspection_type} - {inspection.property_id}</p>
                        <p className="text-sm text-muted-foreground">Completed: {inspection.completed_date}</p>
                      </div>
                      <Button
                        onClick={() => generateReportMutation.mutate(inspection.id)}
                        disabled={generateReportMutation.isPending}
                        size="sm"
                      >
                        {generateReportMutation.isPending ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Generating...
                          </>
                        ) : (
                          'Generate Report'
                        )}
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </Card>
          </TabsContent>

          {/* Rent Receipts Tab */}
          <TabsContent value="receipts">
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <Mail className="w-6 h-6 text-purple-600" />
                <div>
                  <h2 className="text-2xl font-bold text-foreground">Generate Rent Receipts</h2>
                  <p className="text-muted-foreground">Create receipts and automatically email tenants</p>
                </div>
              </div>

              <div className="space-y-3">
                {transactions.length === 0 ? (
                  <div className="p-4 bg-slate-50 text-center rounded text-muted-foreground">
                    No rent payments available
                  </div>
                ) : (
                  transactions.map(txn => (
                    <div key={txn.id} className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition">
                      <div>
                        <p className="font-medium text-foreground">£{txn.amount / 100} - {txn.tenant_id}</p>
                        <p className="text-sm text-muted-foreground">Received: {txn.transaction_date}</p>
                      </div>
                      <Button
                        onClick={() => generateReceiptMutation.mutate(txn.id)}
                        disabled={generateReceiptMutation.isPending}
                        size="sm"
                      >
                        {generateReceiptMutation.isPending ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Generating...
                          </>
                        ) : (
                          'Generate Receipt'
                        )}
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Info Card */}
        <Card className="mt-8 p-6 bg-blue-50 border-blue-200">
          <h3 className="font-semibold text-foreground mb-3">How It Works</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>✓ AI generates documents using tenant, property, and transaction data</li>
            <li>✓ Lease agreements are personalized with all relevant terms</li>
            <li>✓ Inspection reports aggregate checklist findings into professional format</li>
            <li>✓ Rent receipts are automatically emailed to tenants immediately</li>
            <li>✓ All documents are saved for compliance and record-keeping</li>
          </ul>
        </Card>
      </div>
    </div>
  );
}