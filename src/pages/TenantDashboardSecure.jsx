import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Home, FileText, Wrench, CreditCard, AlertCircle } from 'lucide-react';
import LeaseDetailsCard from '@/components/tenant/LeaseDetailsCard';
import TenantRequestForm from '@/components/maintenance/TenantRequestForm';
import RentPaymentHistory from '@/components/tenant/RentPaymentHistory';
import PropertyDocumentsViewer from '@/components/tenant/PropertyDocumentsViewer';

export default function TenantDashboardSecure() {
  const [activeTab, setActiveTab] = useState('overview');

  // Get current user (tenant)
  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me()
  });

  // Fetch tenant record
  const { data: tenants = [] } = useQuery({
    queryKey: ['tenant', user?.email],
    enabled: !!user?.email,
    queryFn: () => base44.entities.Tenant.filter({ email: user.email }, '-updated_date', 1)
  });

  const tenant = tenants[0];

  // Fetch lease information
  const { data: leases = [] } = useQuery({
    queryKey: ['lease', tenant?.id],
    enabled: !!tenant?.id,
    queryFn: () => base44.entities.Tenancy.filter({ tenant_id: tenant.id }, '-created_date', 1)
  });

  // Fetch unit details
  const { data: units = [] } = useQuery({
    queryKey: ['unit', tenant?.unit_id],
    enabled: !!tenant?.unit_id,
    queryFn: () => base44.entities.Unit.list({ id: tenant.unit_id })
  });

  // Fetch property details
  const { data: properties = [] } = useQuery({
    queryKey: ['property', tenant?.property_id],
    enabled: !!tenant?.property_id,
    queryFn: () => base44.entities.Property.list({ id: tenant.property_id })
  });

  // Fetch maintenance requests
  const { data: maintenanceRequests = [] } = useQuery({
    queryKey: ['maintenance-requests', tenant?.id],
    enabled: !!tenant?.id,
    queryFn: () => base44.entities.MaintenanceRequest.filter({ tenant_id: tenant.id }, '-created_date', 20)
  });

  // Fetch rent transactions
  const { data: rentTransactions = [] } = useQuery({
    queryKey: ['rent-transactions', tenant?.id],
    enabled: !!tenant?.id,
    queryFn: () => base44.entities.FinancialTransaction.filter({ tenant_id: tenant.id }, '-transaction_date', 50)
  });

  if (!user || !tenant) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground">Loading your dashboard...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const lease = leases[0];
  const property = properties[0];
  const unit = units[0];
  const activeMaintenanceRequests = maintenanceRequests.filter(r => !['resolved', 'closed'].includes(r.status));
  const paidRent = rentTransactions.filter(t => t.transaction_type === 'rent_payment').length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900">Welcome back, {tenant.full_name}!</h1>
          <p className="text-muted-foreground mt-2">
            {property?.name || 'Your Property'} • Unit {unit?.name || tenant.unit_id}
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <Home className="w-6 h-6 text-primary mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Lease Status</p>
                <p className="text-xl font-bold text-slate-900 mt-1">
                  {lease?.status === 'active' ? '✓ Active' : 'Inactive'}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <Wrench className="w-6 h-6 text-orange-600 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Active Requests</p>
                <p className="text-xl font-bold text-slate-900 mt-1">{activeMaintenanceRequests.length}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <CreditCard className="w-6 h-6 text-green-600 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Payments Made</p>
                <p className="text-xl font-bold text-slate-900 mt-1">{paidRent}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <FileText className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Documents</p>
                <p className="text-xl font-bold text-slate-900 mt-1">View</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Lease</TabsTrigger>
            <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
            <TabsTrigger value="payments">Payments</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
          </TabsList>

          {/* Lease Tab */}
          <TabsContent value="overview">
            <LeaseDetailsCard
              lease={lease}
              property={property}
              unit={unit}
              tenant={tenant}
            />
          </TabsContent>

          {/* Maintenance Tab */}
          <TabsContent value="maintenance" className="space-y-6">
            <TenantRequestForm
              propertyId={tenant.property_id}
              unitId={tenant.unit_id}
              tenantId={tenant.id}
              tenantEmail={tenant.email}
              tenantPhone={tenant.phone}
              onSuccess={() => {
                // Refresh requests
                setTimeout(() => window.location.reload(), 1500);
              }}
            />

            {maintenanceRequests.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-slate-900">Your Maintenance History</h3>
                <div className="grid gap-4">
                  {maintenanceRequests.map(request => (
                    <Card key={request.id}>
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-semibold text-slate-900">{request.title}</h4>
                            <p className="text-sm text-muted-foreground mt-1">{request.description}</p>
                          </div>
                          <Badge className={
                            request.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            request.status === 'assigned' ? 'bg-blue-100 text-blue-800' :
                            request.status === 'in_progress' ? 'bg-purple-100 text-purple-800' :
                            request.status === 'resolved' ? 'bg-green-100 text-green-800' :
                            'bg-slate-100 text-slate-800'
                          }>
                            {request.status.replace('_', ' ')}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-2 text-sm">
                        <p>Category: <span className="font-medium capitalize">{request.category}</span></p>
                        {request.assigned_contractor_name && (
                          <p>Contractor: <span className="font-medium">{request.assigned_contractor_name}</span></p>
                        )}
                        {request.scheduled_date && (
                          <p>Scheduled: <span className="font-medium">{new Date(request.scheduled_date).toLocaleDateString()}</span></p>
                        )}
                        <p className="text-xs text-muted-foreground">
                          Submitted: {new Date(request.created_date).toLocaleDateString()}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>

          {/* Payments Tab */}
          <TabsContent value="payments">
            <RentPaymentHistory
              tenantId={tenant.id}
              monthlyRent={lease?.monthly_rent || 0}
              transactions={rentTransactions}
            />
          </TabsContent>

          {/* Documents Tab */}
          <TabsContent value="documents">
            <PropertyDocumentsViewer
              propertyId={tenant.property_id}
              tenantId={tenant.id}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}