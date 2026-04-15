import React, { useMemo, useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Building2, Home, Users, PoundSterling, Wrench, DoorOpen, AlertTriangle, TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import PageHeader from '@/components/shared/PageHeader';
import StatCard from '@/components/shared/StatCard';
import StatusBadge from '@/components/shared/StatusBadge';
import ComplianceAlert from '@/components/dashboard/ComplianceAlert';
import ComplianceAlertsWidget from '@/components/dashboard/ComplianceAlertsWidget';
import CompaniesHouseAlertWidget from '@/components/compliance/CompaniesHouseAlertWidget';
import SetupProgressCard from '@/components/dashboard/SetupProgressCard';
import ExecutiveDashboard from '@/components/dashboard/ExecutiveDashboard';
import MarketIntelligenceWidget from '@/components/dashboard/MarketIntelligenceWidget';
import DashboardTutorial from '@/components/onboarding/DashboardTutorial';
import DataQualityWidget from '@/components/dashboard/DataQualityWidget';
import ErrorAnalyticsWidget from '@/components/dashboard/ErrorAnalyticsWidget';
import PropertyMapView from '@/components/dashboard/PropertyMapView';
import ComplianceReportGenerator from '@/components/reporting/ComplianceReportGenerator';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';
import { useDemoFilter } from '@/hooks/useDemoFilter';
import { useQueryError } from '@/hooks/useQueryError';

const COLORS = ['hsl(222,47%,15%)', 'hsl(43,74%,49%)', 'hsl(173,58%,39%)', 'hsl(12,76%,61%)', 'hsl(197,37%,24%)'];

export default function Dashboard() {
  const [showTutorial, setShowTutorial] = useState(false);
  const { demoCompanyId, propertyIds, loading: demoLoading } = useDemoFilter();

  useEffect(() => {
    // Show tutorial if this is first login and tutorial hasn't been completed
    const isFirstLogin = localStorage.getItem('premiso_first_login') === 'true';
    const tutorialCompleted = localStorage.getItem('premiso_tutorial_completed') === 'true';
    if (isFirstLogin && !tutorialCompleted) {
      setShowTutorial(true);
      localStorage.removeItem('premiso_first_login');
    }
  }, []);

  const companiesQuery = useQuery({
    queryKey: ['companies', demoCompanyId],
    enabled: !demoLoading,
    queryFn: async () => {
      if (demoCompanyId) {
        const c = await base44.entities.Company.get(demoCompanyId);
        return c ? [c] : [];
      }
      return base44.entities.Company.list('-updated_date', 50);
    }
  });
  useQueryError(companiesQuery, 'companies');
  const { data: companies = [] } = companiesQuery;

  const propertiesQuery = useQuery({
    queryKey: ['properties', demoCompanyId],
    enabled: !demoLoading,
    queryFn: async () => {
      if (demoCompanyId) {
        return base44.entities.Property.filter({ owning_company: demoCompanyId }, '-updated_date', 20);
      }
      return base44.entities.Property.list('-updated_date', 20);
    }
  });
  useQueryError(propertiesQuery, 'properties');
  const { data: properties = [] } = propertiesQuery;

  const unitsQuery = useQuery({
    queryKey: ['units', propertyIds],
    enabled: !demoLoading && propertyIds?.length > 0,
    queryFn: () => base44.entities.Unit.list('-updated_date', 100)
  });
  useQueryError(unitsQuery, 'units');
  const { data: units = [] } = unitsQuery;

  const tenantsQuery = useQuery({
    queryKey: ['tenants', propertyIds],
    enabled: !demoLoading,
    queryFn: () => base44.entities.Tenant.list('-updated_date', 50)
  });
  useQueryError(tenantsQuery, 'tenants');
  const { data: tenants = [] } = tenantsQuery;

  const transactionsQuery = useQuery({
    queryKey: ['transactions', propertyIds],
    enabled: !demoLoading,
    queryFn: () => base44.entities.FinancialTransaction.list('-updated_date', 100)
  });
  useQueryError(transactionsQuery, 'transactions');
  const { data: transactions = [] } = transactionsQuery;

  const maintenanceQuery = useQuery({
    queryKey: ['maintenance', propertyIds],
    enabled: !demoLoading,
    queryFn: () => base44.entities.MaintenanceOrder.list('-updated_date', 30)
  });
  useQueryError(maintenanceQuery, 'maintenance orders');
  const { data: maintenance = [] } = maintenanceQuery;

  const certificatesQuery = useQuery({
    queryKey: ['certificates', propertyIds],
    enabled: !demoLoading,
    queryFn: async () => {
      const [gas, eicr, epc] = await Promise.all([
        base44.entities.GasSafetyCertificate?.list?.('-updated_date', 30) || Promise.resolve([]),
        base44.entities.EICRCertificate?.list?.('-updated_date', 30) || Promise.resolve([]),
        base44.entities.EnergyPerformanceCertificate?.list?.('-updated_date', 30) || Promise.resolve([])
      ]);
      return [...(gas || []), ...(eicr || []), ...(epc || [])];
    }
  });
  useQueryError(certificatesQuery, 'certificates');
  const { data: certificates = [] } = certificatesQuery;

  const totalIncome = transactions.filter(t => t.direction === 'income' && t.status === 'paid').reduce((s, t) => s + (t.amount || 0), 0);
  const totalExpenses = transactions.filter(t => t.direction === 'expense' && t.status === 'paid').reduce((s, t) => s + (t.amount || 0), 0);
  const overdueCount = transactions.filter(t => t.status === 'overdue').length;
  const occupiedUnits = units.filter(u => u.status === 'occupied').length;
  const occupancyRate = units.length > 0 ? Math.round((occupiedUnits / units.length) * 100) : 0;
  const activeMaintenance = maintenance.filter(m => !['completed', 'cancelled'].includes(m.status)).length;

  const regionData = useMemo(() => properties.reduce((acc, p) => {
    const region = p.region || 'other';
    const existing = acc.find(r => r.name === region);
    if (existing) existing.value++;
    else acc.push({ name: region, value: 1 });
    return acc;
  }, []), [properties]);

  const companyCategories = useMemo(() => companies.reduce((acc, c) => {
    const cat = c.category || 'other';
    const label = cat.replace(/_/g, ' ');
    const existing = acc.find(r => r.name === label);
    if (existing) existing.count++;
    else acc.push({ name: label, count: 1 });
    return acc;
  }, []), [companies]);

  const recentMaintenance = useMemo(() => [...maintenance].sort((a, b) => new Date(b.created_date) - new Date(a.created_date)).slice(0, 5), [maintenance]);

  return (
    <div className="min-h-screen bg-background">
      {showTutorial && <DashboardTutorial onComplete={() => setShowTutorial(false)} />}
      <div className="p-6 lg:p-8 max-w-[1600px] mx-auto space-y-8">
        {/* Header */}
        <div className="space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold text-foreground">Dashboard</h1>
              <p className="text-muted-foreground mt-1">{companies[0]?.name || 'Portfolio'} — Scaled Legal Protection</p>
            </div>
            <div className="hidden lg:flex items-center gap-3 px-4 py-2 bg-card rounded-lg border border-border">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs font-medium">System Live</span>
            </div>
          </div>
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-900">
              <span className="font-semibold">🛡️ Compliance Protected</span> — Enterprise-grade legal safeguards across your entire portfolio
            </p>
          </div>
        </div>

        {/* Alerts */}
        <div className="space-y-4">
          <ComplianceAlert />
          <ComplianceAlertsWidget />
          <div className="compliance-alerts-widget">
            <CompaniesHouseAlertWidget limit={5} />
          </div>
        </div>

        {/* Executive Summary */}
        <div>
          <ExecutiveDashboard properties={properties} units={units} transactions={transactions} tenants={tenants} />
        </div>

        {/* Key Metrics Grid */}
        <div className="space-y-4">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Key Metrics</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard title="Companies" value={companies.length} icon={Building2} subtitle={`${companies.filter(c => c.status === 'active').length} active`} colorIndex={0} />
            <StatCard title="Properties" value={properties.length} icon={Home} subtitle={`${units.length} units`} colorIndex={1} />
            <StatCard title="Occupancy" value={`${occupancyRate}%`} icon={DoorOpen} subtitle={`${occupiedUnits}/${units.length} occupied`} colorIndex={2} />
            <StatCard title="Active Tenants" value={tenants.filter(t => t.status === 'active').length} icon={Users} subtitle={`${tenants.filter(t => t.status === 'in_arrears').length} in arrears`} colorIndex={3} />
          </div>
        </div>

        {/* Financial Metrics Grid */}
        <div className="space-y-4">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Finance & Operations</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard title="Income (Paid)" value={`£${totalIncome.toLocaleString()}`} icon={TrendingUp} subtitle="demo data" colorIndex={2} />
            <StatCard title="Expenses (Paid)" value={`£${totalExpenses.toLocaleString()}`} icon={PoundSterling} subtitle="demo data" colorIndex={4} />
            <StatCard title="Overdue Items" value={overdueCount} icon={AlertTriangle} subtitle={`items`} colorIndex={4} />
            <StatCard title="Active Maintenance" value={activeMaintenance} icon={Wrench} subtitle={`tasks`} colorIndex={1} />
          </div>
        </div>

        {/* Error Monitoring */}
        <div>
          <ErrorAnalyticsWidget />
        </div>

        {/* Analytics & Insights Grid */}
        <div className="space-y-4">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Analytics & Insights</h2>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <PropertyMapView properties={properties} units={units} maintenance={maintenance} />
            </div>
            <div>
              <ComplianceReportGenerator 
                properties={properties}
                certificates={certificates}
                maintenance={maintenance}
              />
            </div>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-card rounded-xl border border-border p-6">
            <h3 className="text-sm font-semibold text-foreground mb-6">Companies by Category</h3>
            {companyCategories.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={companyCategories}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(220,13%,89%)" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="count" fill="hsl(222,47%,15%)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-muted-foreground py-12 text-center">No data yet</p>
            )}
          </div>

          <div className="bg-card rounded-xl border border-border p-6">
            <h3 className="text-sm font-semibold text-foreground mb-6">Properties by Region</h3>
            {regionData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={regionData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label={({ name, value }) => `${name} (${value})`}>
                    {regionData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-muted-foreground py-12 text-center">No data yet</p>
            )}
          </div>
        </div>

        {/* Market Intelligence & Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <MarketIntelligenceWidget />
          </div>
          <div className="bg-card rounded-xl border border-border p-6">
            <h3 className="text-sm font-semibold text-foreground mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <Link to="/sales" className="block p-3 rounded-lg bg-blue-50 hover:bg-blue-100 transition-colors">
                <p className="text-sm font-medium text-blue-900">Sales Dashboard</p>
                <p className="text-xs text-blue-700 mt-1">View listings & leads</p>
              </Link>
              <Link to="/market-reports" className="block p-3 rounded-lg bg-green-50 hover:bg-green-100 transition-colors">
                <p className="text-sm font-medium text-green-900">Market Reports</p>
                <p className="text-xs text-green-700 mt-1">Generate insights</p>
              </Link>
            </div>
          </div>
        </div>

        {/* Maintenance & Setup */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-card rounded-xl border border-border p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-foreground">Recent Maintenance</h3>
              <Link to="/maintenance" className="text-xs font-medium text-primary hover:text-primary/80">View all →</Link>
            </div>
            {recentMaintenance.length > 0 ? (
              <div className="divide-y divide-border">
                {recentMaintenance.map(m => (
                  <div key={m.id} className="flex items-center justify-between py-3 hover:bg-muted/30 px-2 -mx-2 rounded transition-colors">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">{m.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{m.category?.replace(/_/g, ' ')}{m.created_date ? ` · ${format(new Date(m.created_date), 'dd MMM')}` : ''}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <StatusBadge status={m.priority} />
                      <StatusBadge status={m.status} />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground py-8 text-center">No maintenance orders</p>
            )}
          </div>
          <div className="space-y-6">
            <SetupProgressCard />
            <DataQualityWidget />
          </div>
        </div>
      </div>
    </div>
  );
}