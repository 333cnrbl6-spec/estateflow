import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertCircle } from 'lucide-react';
import PaymentHistory from '@/components/tenant/PaymentHistory';
import RentReceipts from '@/components/tenant/RentReceipts';
import MaintenanceRequestForm from '@/components/tenant/MaintenanceRequestForm';
import OpenTickets from '@/components/tenant/OpenTickets';

export default function TenantSelfServicePortal() {
  const [refreshKey, setRefreshKey] = useState(0);

  // Get current user
  const { data: user, isLoading: userLoading, error: userError } = useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      const me = await base44.auth.me();
      return me;
    },
  });

  // Get tenant record for this user
  const { data: tenant, isLoading: tenantLoading, error: tenantError } = useQuery({
    queryKey: ['tenant', user?.email],
    queryFn: async () => {
      if (!user?.email) return null;
      const tenants = await base44.entities.Tenant.filter({ email: user.email }, '', 1);
      return tenants[0] || null;
    },
    enabled: !!user?.email,
  });

  const isLoading = userLoading || tenantLoading;
  const error = userError || tenantError;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Alert variant="destructive">
          <AlertCircle className="w-4 h-4" />
          <AlertDescription>Failed to load portal. Please try again.</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!tenant) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Alert>
          <AlertCircle className="w-4 h-4" />
          <AlertDescription>No tenant record found. Please contact support.</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">My Account</h1>
          <p className="text-muted-foreground mt-2">Manage your payments, requests, and tickets</p>
        </div>

        {/* Welcome Card */}
        <Card className="mb-8 bg-gradient-to-r from-primary/5 to-blue-50 border-primary/20">
          <CardContent className="pt-6">
            <div>
              <p className="text-sm text-muted-foreground">Welcome back,</p>
              <h2 className="text-2xl font-bold text-slate-900 mt-1">{user?.full_name}</h2>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="payments" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger value="payments">Payments</TabsTrigger>
            <TabsTrigger value="receipts">Receipts</TabsTrigger>
            <TabsTrigger value="request">Request</TabsTrigger>
            <TabsTrigger value="tickets">Tickets</TabsTrigger>
          </TabsList>

          <TabsContent value="payments" className="space-y-4">
            <PaymentHistory tenantId={tenant.id} refreshKey={refreshKey} />
          </TabsContent>

          <TabsContent value="receipts" className="space-y-4">
            <RentReceipts tenantId={tenant.id} refreshKey={refreshKey} />
          </TabsContent>

          <TabsContent value="request" className="space-y-4">
            <MaintenanceRequestForm
              tenantId={tenant.id}
              unitId={tenant.unit_id}
              onSubmitSuccess={() => setRefreshKey(k => k + 1)}
            />
          </TabsContent>

          <TabsContent value="tickets" className="space-y-4">
            <OpenTickets tenantId={tenant.id} refreshKey={refreshKey} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}