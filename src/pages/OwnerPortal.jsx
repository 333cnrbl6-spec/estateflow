import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertCircle, TrendingUp, Home, Wrench } from 'lucide-react';
import FinancialSummaryCard from '@/components/owner/FinancialSummaryCard';
import OccupancyCard from '@/components/owner/OccupancyCard';
import MaintenanceStatusCard from '@/components/owner/MaintenanceStatusCard';

export default function OwnerPortal() {
  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: ['current-user'],
    queryFn: async () => await base44.auth.me()
  });

  const { data: properties = [], isLoading: propsLoading } = useQuery({
    queryKey: ['owner-properties', user?.email],
    queryFn: async () => {
      if (!user?.email) return [];
      const props = await base44.entities.Property.filter(
        { created_by: user.email },
        '-updated_date'
      );
      return props;
    },
    enabled: !!user?.email
  });

  const { data: financialData = {}, isLoading: finLoading } = useQuery({
    queryKey: ['owner-financials', properties],
    queryFn: async () => {
      if (properties.length === 0) return { totalRents: 0, totalExpenses: 0, netCashFlow: 0 };

      const propertyIds = properties.map(p => p.id);
      const transactions = await base44.entities.FinancialTransaction.filter(
        { property_id: { $in: propertyIds } }
      );

      const rents = transactions
        .filter(t => t.transaction_type === 'rent' && t.status === 'paid')
        .reduce((sum, t) => sum + (t.amount || 0), 0);

      const expenses = transactions
        .filter(t => t.transaction_type === 'expense')
        .reduce((sum, t) => sum + (t.amount || 0), 0);

      return {
        totalRents: rents,
        totalExpenses: expenses,
        netCashFlow: rents - expenses
      };
    }
  });

  const { data: occupancyData = {}, isLoading: occLoading } = useQuery({
    queryKey: ['owner-occupancy', properties],
    queryFn: async () => {
      if (properties.length === 0) return { occupied: 0, vacant: 0, rate: 0 };

      const units = await base44.entities.Unit.filter({
        property_id: { $in: properties.map(p => p.id) }
      });

      const tenants = await base44.entities.Tenant.filter({
        property_id: { $in: properties.map(p => p.id) },
        status: 'active'
      });

      const occupied = tenants.length;
      const vacant = units.length - occupied;
      const rate = units.length > 0 ? Math.round((occupied / units.length) * 100) : 0;

      return { occupied, vacant, rate, totalUnits: units.length };
    }
  });

  const { data: maintenanceTasks = [], isLoading: maintLoading } = useQuery({
    queryKey: ['owner-maintenance', properties],
    queryFn: async () => {
      if (properties.length === 0) return [];

      const tasks = await base44.entities.MaintenanceRequest.filter(
        { property_id: { $in: properties.map(p => p.id) }, status: { $in: ['pending', 'in_progress'] } },
        '-created_date',
        20
      );

      return tasks;
    }
  });

  const isLoading = userLoading || propsLoading || finLoading || occLoading || maintLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-slate-300 border-t-primary rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-sm text-muted-foreground">Loading your portfolio...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <h1 className="text-3xl font-bold text-foreground">Portfolio Overview</h1>
          <p className="text-muted-foreground mt-1">
            {properties.length} {properties.length === 1 ? 'property' : 'properties'} • Real-time performance metrics
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {properties.length === 0 ? (
          <Card className="p-8 text-center">
            <Home className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No properties found. Contact support to add properties to your portfolio.</p>
          </Card>
        ) : (
          <>
            {/* Key Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <FinancialSummaryCard financialData={financialData} />
              <OccupancyCard occupancyData={occupancyData} />
              <Card className="p-6 bg-gradient-to-br from-orange-50 to-red-50 border-orange-200">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm font-medium text-muted-foreground">Active Maintenance</p>
                  <Wrench className="w-4 h-4 text-orange-600" />
                </div>
                <p className="text-3xl font-bold text-orange-700">{maintenanceTasks.length}</p>
                <p className="text-xs text-orange-600 mt-2">Tasks pending or in progress</p>
              </Card>
            </div>

            {/* Detailed View */}
            <Tabs defaultValue="financial" className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-8">
                <TabsTrigger value="financial" className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  <span className="hidden sm:inline">Financial</span>
                </TabsTrigger>
                <TabsTrigger value="occupancy" className="flex items-center gap-2">
                  <Home className="w-4 h-4" />
                  <span className="hidden sm:inline">Occupancy</span>
                </TabsTrigger>
                <TabsTrigger value="maintenance" className="flex items-center gap-2">
                  <Wrench className="w-4 h-4" />
                  <span className="hidden sm:inline">Maintenance</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="financial" className="space-y-6">
                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-4 text-foreground">Financial Summary by Property</h3>
                  <div className="space-y-3">
                    {properties.map(prop => (
                      <div key={prop.id} className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                        <p className="font-medium text-foreground mb-2">{prop.name || prop.address}</p>
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <p className="text-muted-foreground">Rents Collected</p>
                            <p className="font-bold text-green-700">£{prop.yearlyRevenue?.toLocaleString('en-GB', { minimumFractionDigits: 2 }) || '0.00'}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Expenses</p>
                            <p className="font-bold text-red-700">£{prop.yearlyExpenses?.toLocaleString('en-GB', { minimumFractionDigits: 2 }) || '0.00'}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Net Yield</p>
                            <p className="font-bold text-blue-700">{prop.yield || '0'}%</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </TabsContent>

              <TabsContent value="occupancy" className="space-y-6">
                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-4 text-foreground">Occupancy by Property</h3>
                  <div className="space-y-3">
                    {properties.map(prop => (
                      <div key={prop.id} className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                        <p className="font-medium text-foreground mb-3">{prop.name || prop.address}</p>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-muted-foreground mb-1">Occupancy Status</p>
                            <p className="text-2xl font-bold text-blue-700">{occupancyData.rate || 0}%</p>
                          </div>
                          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-green-200 to-blue-200 flex items-center justify-center">
                            <div className="text-center">
                              <p className="text-sm font-medium text-foreground">{occupancyData.occupied || 0} of {occupancyData.totalUnits || 0}</p>
                              <p className="text-xs text-muted-foreground">occupied</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </TabsContent>

              <TabsContent value="maintenance" className="space-y-6">
                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-4 text-foreground">Active Maintenance Tasks</h3>
                  {maintenanceTasks.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">All systems operational. No active maintenance tasks.</p>
                  ) : (
                    <div className="space-y-3">
                      {maintenanceTasks.map(task => (
                        <div key={task.id} className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                          <div className="flex items-start justify-between mb-2">
                            <p className="font-medium text-foreground">{task.title}</p>
                            <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                              task.status === 'in_progress'
                                ? 'bg-blue-100 text-blue-700'
                                : 'bg-yellow-100 text-yellow-700'
                            }`}>
                              {task.status === 'in_progress' ? 'In Progress' : 'Pending'}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">{task.description}</p>
                          {task.priority && (
                            <p className="text-xs text-muted-foreground">
                              Priority: <span className="font-medium capitalize">{task.priority}</span>
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </Card>
              </TabsContent>
            </Tabs>
          </>
        )}
      </div>
    </div>
  );
}