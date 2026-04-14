import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import PageHeader from '@/components/shared/PageHeader';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CheckCircle2, AlertTriangle, Clock, Loader2, Search, Shield } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import TenantScreeningCard from '@/components/screening/TenantScreeningCard';
import TenantScreeningDetail from '@/components/screening/TenantScreeningDetail';
import { useDemoFilter } from '@/hooks/useDemoFilter';

export default function TenantScreening() {
  const queryClient = useQueryClient();
  const { demoCompanyId, loading: demoLoading } = useDemoFilter();
  const [selectedTenant, setSelectedTenant] = useState(null);

  // Fetch prospective tenants
  const { data: tenants = [], isLoading } = useQuery({
    queryKey: ['prospective-tenants', demoCompanyId],
    enabled: !demoLoading,
    queryFn: async () => {
      const allTenants = await base44.entities.Tenant.filter(
        { status: 'prospective' },
        '-created_date',
        100
      );
      return allTenants;
    }
  });

  // Screen tenant mutation
  const screenMutation = useMutation({
    mutationFn: async (tenantId) => {
      return await base44.functions.invoke('screenTenantApplicant', { tenant_id: tenantId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prospective-tenants'] });
    }
  });

  const handleScreenTenant = async (tenantId) => {
    try {
      await screenMutation.mutateAsync(tenantId);
    } catch (err) {
      console.error('Screening failed:', err);
    }
  };

  const screenedTenants = tenants.filter(t => t.screening?.overall_score !== undefined);
  const unscreenedTenants = tenants.filter(t => !t.screening?.overall_score);

  const getRecommendationStats = () => {
    return {
      approve: screenedTenants.filter(t => t.screening.recommendation === 'approve').length,
      review: screenedTenants.filter(t => t.screening.recommendation === 'review').length,
      decline: screenedTenants.filter(t => t.screening.recommendation === 'decline').length
    };
  };

  const stats = getRecommendationStats();

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background">
      <div className="p-8 max-w-[1400px] mx-auto">
        <PageHeader
          title="Tenant Screening"
          subtitle="Automated credit and reference checks for applicant evaluation"
        >
          <Button
            variant="outline"
            size="sm"
            disabled={unscreenedTenants.length === 0 || screenMutation.isPending}
          >
            {screenMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Screening...
              </>
            ) : (
              <>
                <Shield className="w-4 h-4 mr-2" />
                Bulk Screen ({unscreenedTenants.length})
              </>
            )}
          </Button>
        </PageHeader>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-card border border-border rounded-lg p-4">
            <p className="text-sm text-muted-foreground">Total Applicants</p>
            <p className="text-3xl font-bold text-foreground mt-2">{tenants.length}</p>
          </div>
          <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg p-4">
            <p className="text-sm text-green-800 dark:text-green-200 font-semibold">Approved</p>
            <p className="text-3xl font-bold text-green-600 mt-2">{stats.approve}</p>
          </div>
          <div className="bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
            <p className="text-sm text-yellow-800 dark:text-yellow-200 font-semibold">Under Review</p>
            <p className="text-3xl font-bold text-yellow-600 mt-2">{stats.review}</p>
          </div>
          <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <p className="text-sm text-red-800 dark:text-red-200 font-semibold">Declined</p>
            <p className="text-3xl font-bold text-red-600 mt-2">{stats.decline}</p>
          </div>
        </div>

        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all">All ({tenants.length})</TabsTrigger>
            <TabsTrigger value="approved">
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Approved ({stats.approve})
            </TabsTrigger>
            <TabsTrigger value="review">
              <AlertTriangle className="w-4 h-4 mr-2" />
              Review ({stats.review})
            </TabsTrigger>
            <TabsTrigger value="pending">
              <Clock className="w-4 h-4 mr-2" />
              Pending ({unscreenedTenants.length})
            </TabsTrigger>
          </TabsList>

          {/* All Tenants */}
          <TabsContent value="all" className="mt-6 space-y-4">
            {isLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            ) : tenants.length === 0 ? (
              <div className="bg-card border border-border rounded-lg p-12 text-center">
                <Search className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                <p className="text-muted-foreground font-semibold">No applicants</p>
              </div>
            ) : (
              tenants.map(tenant => (
                <TenantScreeningCard
                  key={tenant.id}
                  tenant={tenant}
                  onSelect={() => setSelectedTenant(tenant)}
                  onScreen={() => handleScreenTenant(tenant.id)}
                  isScreening={screenMutation.isPending && screenMutation.variables === tenant.id}
                />
              ))
            )}
          </TabsContent>

          {/* Approved */}
          <TabsContent value="approved" className="mt-6 space-y-4">
            {screenedTenants
              .filter(t => t.screening.recommendation === 'approve')
              .map(tenant => (
                <TenantScreeningCard
                  key={tenant.id}
                  tenant={tenant}
                  onSelect={() => setSelectedTenant(tenant)}
                />
              ))}
          </TabsContent>

          {/* Review */}
          <TabsContent value="review" className="mt-6 space-y-4">
            {screenedTenants
              .filter(t => t.screening.recommendation === 'review')
              .map(tenant => (
                <TenantScreeningCard
                  key={tenant.id}
                  tenant={tenant}
                  onSelect={() => setSelectedTenant(tenant)}
                />
              ))}
          </TabsContent>

          {/* Pending */}
          <TabsContent value="pending" className="mt-6 space-y-4">
            {unscreenedTenants.map(tenant => (
              <TenantScreeningCard
                key={tenant.id}
                tenant={tenant}
                onSelect={() => setSelectedTenant(tenant)}
                onScreen={() => handleScreenTenant(tenant.id)}
                isScreening={screenMutation.isPending && screenMutation.variables === tenant.id}
              />
            ))}
          </TabsContent>
        </Tabs>

        {/* Detail Panel */}
        {selectedTenant && (
          <div className="mt-8 fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-card rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-card border-b border-border p-6 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-foreground">{selectedTenant.full_name}</h2>
                <button
                  onClick={() => setSelectedTenant(null)}
                  className="text-muted-foreground hover:text-foreground text-2xl"
                >
                  ×
                </button>
              </div>
              <div className="p-6">
                <TenantScreeningDetail tenant={selectedTenant} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}