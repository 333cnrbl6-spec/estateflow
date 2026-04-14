import React, { useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Building2, AlertCircle, Calendar, TrendingUp } from 'lucide-react';
import PageHeader from '@/components/shared/PageHeader';
import OccupancyOverviewCard from '@/components/property-manager/OccupancyOverviewCard';
import MaintenanceMetricsCard from '@/components/property-manager/MaintenanceMetricsCard';
import FinancialSummaryCard from '@/components/property-manager/FinancialSummaryCard';
import LeaseExpirationCard from '@/components/property-manager/LeaseExpirationCard';
import KeyMetricsCard from '@/components/property-manager/KeyMetricsCard';

export default function PropertyManagerDashboard() {
  // Fetch all required data
  const propertiesQuery = useQuery({
    queryKey: ['properties'],
    queryFn: () => base44.entities.Property.list('-updated_date', 100),
  });

  const unitsQuery = useQuery({
    queryKey: ['units'],
    queryFn: () => base44.entities.Unit.list('-updated_date', 500),
  });

  const tenantsQuery = useQuery({
    queryKey: ['tenants'],
    queryFn: () => base44.entities.Tenant.list('-updated_date', 200),
  });

  const maintenanceQuery = useQuery({
    queryKey: ['maintenance'],
    queryFn: () => base44.entities.MaintenanceRequest.list('-updated_date', 200),
  });

  const transactionsQuery = useQuery({
    queryKey: ['transactions'],
    queryFn: () => base44.entities.FinancialTransaction.list('-updated_date', 500),
  });

  const { data: properties = [] } = propertiesQuery;
  const { data: units = [] } = unitsQuery;
  const { data: tenants = [] } = tenantsQuery;
  const { data: maintenance = [] } = maintenanceQuery;
  const { data: transactions = [] } = transactionsQuery;

  // Calculate key metrics
  const metrics = useMemo(() => {
    const totalUnits = units.length;
    const occupiedUnits = units.filter(u => u.status === 'occupied').length;
    const occupancyRate = totalUnits > 0 ? Math.round((occupiedUnits / totalUnits) * 100) : 0;

    const pendingMaintenance = maintenance.filter(m => 
      !['completed', 'cancelled'].includes(m.status)
    ).length;

    const urgentMaintenance = maintenance.filter(m =>
      !['completed', 'cancelled'].includes(m.status) && m.priority === 'urgent'
    ).length;

    const totalIncome = transactions.filter(t => t.direction === 'income' && t.status === 'paid').reduce((s, t) => s + (t.amount || 0), 0);
    const totalExpenses = transactions.filter(t => t.direction === 'expense' && t.status === 'paid').reduce((s, t) => s + (t.amount || 0), 0);

    return {
      totalProperties: properties.length,
      totalUnits,
      occupiedUnits,
      occupancyRate,
      vacantUnits: totalUnits - occupiedUnits,
      activeTenantsCount: tenants.filter(t => t.status === 'active').length,
      pendingMaintenance,
      urgentMaintenance,
      totalIncome,
      totalExpenses,
      netProfit: totalIncome - totalExpenses,
    };
  }, [properties, units, tenants, maintenance, transactions]);

  // Maintenance by priority
  const maintenanceByPriority = useMemo(() => {
    const grouped = { low: 0, standard: 0, urgent: 0, emergency: 0 };
    maintenance.forEach(m => {
      if (!['completed', 'cancelled'].includes(m.status)) {
        grouped[m.priority] = (grouped[m.priority] || 0) + 1;
      }
    });
    return grouped;
  }, [maintenance]);

  // Monthly income/expense trend
  const monthlyTrend = useMemo(() => {
    const months = {};
    transactions.forEach(t => {
      const date = new Date(t.created_date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!months[monthKey]) months[monthKey] = { income: 0, expense: 0 };
      if (t.direction === 'income') months[monthKey].income += t.amount || 0;
      if (t.direction === 'expense') months[monthKey].expense += t.amount || 0;
    });

    return Object.entries(months)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .slice(-12)
      .map(([month, data]) => ({
        month: new Date(month + '-01').toLocaleString('default', { month: 'short', year: '2-digit' }),
        income: data.income,
        expense: data.expense,
      }));
  }, [transactions]);

  // Upcoming lease expirations (next 90 days)
  const upcomingExpirations = useMemo(() => {
    const now = new Date();
    const ninetyDaysFromNow = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);

    return tenants
      .filter(t => {
        if (!t.lease_end_date) return false;
        const endDate = new Date(t.lease_end_date);
        return endDate >= now && endDate <= ninetyDaysFromNow;
      })
      .sort((a, b) => new Date(a.lease_end_date) - new Date(b.lease_end_date))
      .slice(0, 10);
  }, [tenants]);

  const isLoading = propertiesQuery.isLoading || unitsQuery.isLoading || 
                   tenantsQuery.isLoading || maintenanceQuery.isLoading || 
                   transactionsQuery.isLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-muted border-t-primary rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-sm text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        <PageHeader 
          title="Property Manager Dashboard"
          subtitle={`Managing ${metrics.totalProperties} properties with ${metrics.totalUnits} units`}
        />

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <KeyMetricsCard
            title="Occupancy Rate"
            value={`${metrics.occupancyRate}%`}
            subtitle={`${metrics.occupiedUnits} of ${metrics.totalUnits} units`}
            icon={Building2}
            colorIndex={0}
          />
          <KeyMetricsCard
            title="Pending Maintenance"
            value={metrics.pendingMaintenance}
            subtitle={`${metrics.urgentMaintenance} urgent`}
            icon={AlertCircle}
            colorIndex={metrics.urgentMaintenance > 0 ? 4 : 1}
          />
          <KeyMetricsCard
            title="Lease Expirations"
            value={upcomingExpirations.length}
            subtitle="Next 90 days"
            icon={Calendar}
            colorIndex={2}
          />
          <KeyMetricsCard
            title="Net Profit"
            value={`£${metrics.netProfit.toLocaleString()}`}
            subtitle={`Income: £${metrics.totalIncome.toLocaleString()}`}
            icon={TrendingUp}
            colorIndex={3}
          />
        </div>

        {/* Main Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <OccupancyOverviewCard units={units} />
          <MaintenanceMetricsCard byPriority={maintenanceByPriority} />
        </div>

        {/* Financial & Lease Data */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <FinancialSummaryCard monthlyTrend={monthlyTrend} />
          </div>
          <LeaseExpirationCard upcomingExpirations={upcomingExpirations} />
        </div>
      </div>
    </div>
  );
}