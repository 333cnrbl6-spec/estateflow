import React, { useMemo, useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Building2, Home, Users, PoundSterling, Wrench, DoorOpen, AlertTriangle, TrendingUp, ChevronRight } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import StatCard from '@/components/shared/StatCard';
import StatusBadge from '@/components/shared/StatusBadge';
import ComplianceAlert from '@/components/dashboard/ComplianceAlert';
import ComplianceAlertsWidget from '@/components/dashboard/ComplianceAlertsWidget';
import CompaniesHouseAlertWidget from '@/components/compliance/CompaniesHouseAlertWidget';
import SetupProgressCard from '@/components/dashboard/SetupProgressCard';
import ExecutiveDashboard from '@/components/dashboard/ExecutiveDashboard';
import MarketIntelligenceWidget from '@/components/dashboard/MarketIntelligenceWidget';
import { useFounderTour } from '@/components/onboarding/useFounderTour';

import DataQualityWidget from '@/components/dashboard/DataQualityWidget';
import PropertyMapView from '@/components/dashboard/PropertyMapView';
import ComplianceReportGenerator from '@/components/reporting/ComplianceReportGenerator';
import PortfolioKPIs from '@/components/dashboard/PortfolioKPIs';
import SmartAlerts from '@/components/dashboard/SmartAlerts';
import SmartAlertsEngine from '@/components/alerts/SmartAlertsEngine';
import OnboardingCompletionCheck from '@/components/onboarding/OnboardingCompletionCheck';
import PortfolioAnalyticsDashboard from '@/components/dashboard/PortfolioAnalyticsDashboard';
import { format } from 'date-fns';
import { Link, useNavigate } from 'react-router-dom';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import { useDemoFilter } from '@/hooks/useDemoFilter';
import { useQueryError } from '@/hooks/useQueryError';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const COLORS = ['hsl(222,47%,15%)', 'hsl(43,74%,49%)', 'hsl(173,58%,39%)', 'hsl(12,76%,61%)', 'hsl(197,37%,24%)'];

export default function Dashboard() {
  const { demoCompanyId, propertyIds, loading: demoLoading } = useDemoFilter();
  useFounderTour({ enabled: true });
  const navigate = useNavigate();

  // Auto-redirect developer to developer portal, new users to onboarding
  const { data: currentUser } = useQuery({
    queryKey: ['current-user-onboarding'],
    queryFn: () => base44.auth.me(),
    staleTime: 60 * 1000,
  });
  useEffect(() => {
    if (currentUser) {
      // Developer auto-redirect to portal
      if (currentUser.email === '333cnrbl6@gmail.com') {
        navigate('/developer-portal');
        return;
      }
      // New user to onboarding
      if (currentUser.onboarding_complete === false) {
        navigate('/onboarding-wizard');
      }
    }
  }, [currentUser, navigate]);

  const companiesQuery = useQuery({
    queryKey: ['companies', demoCompanyId],
    enabled: !demoLoading,
    staleTime: 5 * 60 * 1000,
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
    staleTime: 5 * 60 * 1000,
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
    enabled: !demoLoading,
    staleTime: 5 * 60 * 1000,
    queryFn: () => base44.entities.Unit.list('-updated_date', 100)
  });
  useQueryError(unitsQuery, 'units');
  const { data: units = [] } = unitsQuery;

  const tenantsQuery = useQuery({
    queryKey: ['tenants', propertyIds],
    enabled: !demoLoading,
    staleTime: 5 * 60 * 1000,
    queryFn: () => base44.entities.Tenant.list('-updated_date', 50)
  });
  useQueryError(tenantsQuery, 'tenants');
  const { data: tenants = [] } = tenantsQuery;

  const transactionsQuery = useQuery({
    queryKey: ['transactions', propertyIds],
    enabled: !demoLoading,
    staleTime: 5 * 60 * 1000,
    queryFn: () => base44.entities.FinancialTransaction.list('-updated_date', 100)
  });
  useQueryError(transactionsQuery, 'transactions');
  const { data: transactions = [] } = transactionsQuery;

  const maintenanceQuery = useQuery({
    queryKey: ['maintenance', propertyIds],
    enabled: !demoLoading,
    staleTime: 5 * 60 * 1000,
    queryFn: () => base44.entities.MaintenanceOrder.list('-updated_date', 30)
  });
  useQueryError(maintenanceQuery, 'maintenance orders');
  const { data: maintenance = [] } = maintenanceQuery;

  const certificatesQuery = useQuery({
    queryKey: ['certificates', propertyIds],
    enabled: !demoLoading,
    staleTime: 10 * 60 * 1000,
    queryFn: async () => {
      try {
        const [gas, eicr, epc] = await Promise.all([
          base44.entities.GasSafetyCertificate?.list?.('-updated_date', 30).catch(() => []) || Promise.resolve([]),
          base44.entities.EICRCertificate?.list?.('-updated_date', 30).catch(() => []) || Promise.resolve([]),
          base44.entities.EnergyPerformanceCertificate?.list?.('-updated_date', 30).catch(() => []) || Promise.resolve([])
        ]);
        return [...(gas || []), ...(eicr || []), ...(epc || [])];
      } catch (e) {
        console.warn('Error fetching certificates:', e);
        return [];
      }
    }
  });
  useQueryError(certificatesQuery, 'certificates');
  const { data: certificates = [] } = certificatesQuery;

  const totalIncome = (transactions || []).filter(t => t.direction === 'income' && t.status === 'paid').reduce((s, t) => s + (t.amount || 0), 0);
  const totalExpenses = (transactions || []).filter(t => t.direction === 'expense' && t.status === 'paid').reduce((s, t) => s + (t.amount || 0), 0);
  const overdueCount = (transactions || []).filter(t => t.status === 'overdue').length;
  const occupiedUnits = (units || []).filter(u => u.status === 'occupied').length;
  const occupancyRate = (units?.length || 0) > 0 ? Math.round((occupiedUnits / units.length) * 100) : 0;
  const activeMaintenance = (maintenance || []).filter(m => !['completed', 'cancelled'].includes(m.status)).length;

  const regionData = useMemo(() => (properties || []).reduce((acc, p) => {
    const region = p?.region || 'other';
    const existing = acc.find(r => r.name === region);
    if (existing) existing.value++;
    else acc.push({ name: region, value: 1 });
    return acc;
  }, []), [properties]);

  const companyCategories = useMemo(() => (companies || []).reduce((acc, c) => {
    const cat = c?.category || 'other';
    const label = String(cat).replace(/_/g, ' ');
    const existing = acc.find(r => r.name === label);
    if (existing) existing.count++;
    else acc.push({ name: label, count: 1 });
    return acc;
  }, []), [companies]);

  const recentMaintenance = useMemo(() => {
    try {
      return [...(maintenance || [])].sort((a, b) => {
        const dateA = a?.created_date ? new Date(a.created_date) : new Date(0);
        const dateB = b?.created_date ? new Date(b.created_date) : new Date(0);
        return dateB - dateA;
      }).slice(0, 5);
    } catch (e) {
      console.warn('Error sorting maintenance:', e);
      return [];
    }
  }, [maintenance]);

  // Determine if new subscriber (0 properties = setup mode)
  const isNewSubscriber = properties.length === 0;

  return (
    <div className="min-h-screen bg-background">
      <OnboardingCompletionCheck />
      
      <div className="px-6 lg:px-8 py-8 max-w-[1400px] mx-auto">
        
        <DashboardHeader user={currentUser} propertiesCount={properties.length} />

        {/* CRITICAL ALERTS ONLY (first exposure) */}
        {(
          <>
            <ComplianceAlert />
            <ComplianceAlertsWidget />
            <div className="compliance-alerts-widget mb-8">
              <CompaniesHouseAlertWidget limit={5} />
            </div>
          </>
        )}

        {/* NEW SUBSCRIBER SETUP FLOW */}
        {isNewSubscriber ? (
          <div className="space-y-6 mb-12">
            <Card className="border-2 border-primary/20 bg-primary/5 p-8">
              <div className="space-y-4">
                <div>
                  <h2 className="text-2xl font-bold text-foreground mb-2">Let's get you started</h2>
                  <p className="text-muted-foreground">Set up your first property to unlock your dashboard</p>
                </div>
                <Button asChild className="w-fit h-11 px-6 text-base">
                  <Link to="/properties/add">Add Your First Property</Link>
                </Button>
              </div>
            </Card>

            {/* Quick orientation */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { icon: '🏢', title: 'Add Properties', desc: 'Import your property details' },
                { icon: '👥', title: 'Invite Tenants', desc: 'Set up tenant records' },
                { icon: '🛡️', title: 'Enable Compliance', desc: 'Track certificates & safety' }
              ].map((step, i) => (
                <Card key={i} className="p-6 border-slate-200 hover:border-slate-300 hover:shadow-md transition-all">
                  <div className="text-3xl mb-3">{step.icon}</div>
                  <h3 className="font-semibold text-foreground mb-1">{step.title}</h3>
                  <p className="text-sm text-muted-foreground">{step.desc}</p>
                </Card>
              ))}
            </div>
          </div>
        ) : (
          <>
            {/* ESTABLISHED SUBSCRIBER - Progressive disclosure */}
            
            {/* Smart Alerts Engine */}
            <div className="mb-8">
              <Card className="p-6">
                <h3 className="text-lg font-bold text-foreground mb-4">Active Alerts</h3>
                <SmartAlertsEngine />
              </Card>
            </div>

            {/* Setup Progress (if incomplete) */}
            <div className="mb-8">
              <SetupProgressCard />
            </div>

            {/* Data Quality Alert (soft, not alarming) */}
            <div className="mb-8">
              <DataQualityWidget />
            </div>

            {/* Primary KPIs */}
            <div className="mb-8">
              <h2 className="text-xl font-bold text-foreground mb-4">At a glance</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard title="Properties" value={properties.length} icon={Home} subtitle={`${units.length} units`} colorIndex={1} />
                <StatCard title="Occupancy" value={`${occupancyRate}%`} icon={DoorOpen} subtitle={`${occupiedUnits}/${units.length} occupied`} colorIndex={2} />
                <StatCard title="Active Tenants" value={tenants.filter(t => t.status === 'active').length} icon={Users} subtitle={`${tenants.filter(t => t.status === 'in_arrears').length} in arrears`} colorIndex={3} />
                <StatCard title="Active Tasks" value={activeMaintenance} icon={Wrench} subtitle="maintenance items" colorIndex={1} />
              </div>
            </div>

            {/* Financial Summary */}
            <div className="mb-8">
              <h2 className="text-xl font-bold text-foreground mb-4">Financial overview</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <StatCard title="Income (Paid)" value={`£${totalIncome.toLocaleString()}`} icon={TrendingUp} subtitle="this period" colorIndex={2} />
                <StatCard title="Expenses" value={`£${totalExpenses.toLocaleString()}`} icon={PoundSterling} subtitle="this period" colorIndex={4} />
                <StatCard title="Overdue" value={overdueCount} icon={AlertTriangle} subtitle="items need attention" colorIndex={4} />
              </div>
            </div>

            {/* Recent Activity & Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              {/* Recent Maintenance */}
              <div className="lg:col-span-2">
                <Card className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-bold text-foreground">Recent activity</h3>
                    <Link to="/maintenance" className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1">
                      View all <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>
                  {recentMaintenance.length > 0 ? (
                    <div className="divide-y divide-slate-200">
                      {recentMaintenance.slice(0, 4).map(m => (
                        <div key={m.id} className="flex items-center justify-between py-3 first:pt-0 last:pb-0 hover:bg-slate-50 px-2 -mx-2 rounded transition-colors">
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
                    <p className="text-sm text-slate-500 text-center py-8">No maintenance orders yet</p>
                  )}
                </Card>
              </div>

              {/* Executive Summary */}
              <div>
                <ExecutiveDashboard properties={properties} units={units} transactions={transactions} tenants={tenants} />
              </div>
            </div>

            {/* Analytics (collapsed by default for new users) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <Card className="p-6">
                <h3 className="text-lg font-bold text-foreground mb-6">Properties by region</h3>
                {regionData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie data={regionData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, value }) => `${name} (${value})`}>
                        {regionData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-sm text-slate-500 py-8 text-center">Add properties to see region breakdown</p>
                )}
              </Card>

              <Card className="p-6">
                <h3 className="text-lg font-bold text-foreground mb-6">Companies by category</h3>
                {companyCategories.length > 0 ? (
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={companyCategories}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(220,13%,89%)" />
                      <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip />
                      <Bar dataKey="count" fill="hsl(221,65%,28%)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-sm text-slate-500 py-8 text-center">No companies yet</p>
                )}
              </Card>
            </div>

            {/* Advanced widgets (collapsible insights) */}
            <div className="mb-8">
              <h2 className="text-xl font-bold text-foreground mb-4">Insights & Intelligence</h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <PropertyMapView properties={properties} units={units} maintenance={maintenance} />
                <ComplianceReportGenerator 
                  properties={properties}
                  certificates={certificates}
                  maintenance={maintenance}
                />
              </div>
            </div>

            {/* Portfolio Analytics Dashboard */}
            <div className="mb-8">
              <h2 className="text-xl font-bold text-foreground mb-4">Portfolio Analytics</h2>
              <PortfolioAnalyticsDashboard />
            </div>

            {/* Market Intelligence */}
            <div className="mb-8">
              <MarketIntelligenceWidget />
            </div>
          </>
        )}
      </div>
    </div>
  );
}