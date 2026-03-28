import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Building2, Home, Users, PoundSterling, Wrench, DoorOpen, AlertTriangle, TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import PageHeader from '@/components/shared/PageHeader';
import StatCard from '@/components/shared/StatCard';
import StatusBadge from '@/components/shared/StatusBadge';
import ComplianceAlert from '@/components/dashboard/ComplianceAlert';
import SetupProgressCard from '@/components/dashboard/SetupProgressCard';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';
import { useDemoFilter } from '@/hooks/useDemoFilter';

const COLORS = ['hsl(222,47%,15%)', 'hsl(43,74%,49%)', 'hsl(173,58%,39%)', 'hsl(12,76%,61%)', 'hsl(197,37%,24%)'];

export default function Dashboard() {
  const { demoCompanyId, propertyIds } = useDemoFilter();

  const { data: companies = [] } = useQuery({ 
    queryKey: ['companies', demoCompanyId], 
    queryFn: async () => {
      if (demoCompanyId) {
        return [await base44.entities.Company.get(demoCompanyId)];
      }
      return base44.entities.Company.list();
    }
  });
  
  const { data: properties = [] } = useQuery({ 
    queryKey: ['properties', demoCompanyId], 
    queryFn: async () => {
      if (demoCompanyId) {
        return await base44.entities.Property.filter({ owning_company: demoCompanyId });
      }
      return base44.entities.Property.list();
    }
  });
  
  const { data: units = [] } = useQuery({ 
    queryKey: ['units', propertyIds], 
    queryFn: async () => {
      if (propertyIds) {
        const allUnits = await base44.entities.Unit.list();
        return allUnits.filter(u => propertyIds.includes(u.property_id));
      }
      return base44.entities.Unit.list();
    }
  });
  
  const { data: tenants = [] } = useQuery({ 
    queryKey: ['tenants', propertyIds], 
    queryFn: async () => {
      if (propertyIds) {
        const allTenants = await base44.entities.Tenant.list();
        return allTenants.filter(t => propertyIds.includes(t.property_id));
      }
      return base44.entities.Tenant.list();
    }
  });
  
  const { data: transactions = [] } = useQuery({ 
    queryKey: ['transactions', propertyIds], 
    queryFn: async () => {
      if (propertyIds) {
        const allTx = await base44.entities.FinancialTransaction.list();
        return allTx.filter(t => propertyIds.includes(t.property_id));
      }
      return base44.entities.FinancialTransaction.list();
    }
  });
  
  const { data: maintenance = [] } = useQuery({ 
    queryKey: ['maintenance', propertyIds], 
    queryFn: async () => {
      if (propertyIds) {
        const allMaint = await base44.entities.MaintenanceOrder.list();
        return allMaint.filter(m => propertyIds.includes(m.property_id));
      }
      return base44.entities.MaintenanceOrder.list();
    }
  });

  const totalIncome = transactions.filter(t => t.direction === 'income' && t.status === 'paid').reduce((s, t) => s + (t.amount || 0), 0);
  const totalExpenses = transactions.filter(t => t.direction === 'expense' && t.status === 'paid').reduce((s, t) => s + (t.amount || 0), 0);
  const overdueCount = transactions.filter(t => t.status === 'overdue').length;
  const occupiedUnits = units.filter(u => u.status === 'occupied').length;
  const occupancyRate = units.length > 0 ? Math.round((occupiedUnits / units.length) * 100) : 0;
  const activeMaintenance = maintenance.filter(m => !['completed', 'cancelled'].includes(m.status)).length;

  const regionData = properties.reduce((acc, p) => {
    const region = p.region || 'other';
    const existing = acc.find(r => r.name === region);
    if (existing) existing.value++;
    else acc.push({ name: region, value: 1 });
    return acc;
  }, []);

  const companyCategories = companies.reduce((acc, c) => {
    const cat = c.category || 'other';
    const label = cat.replace(/_/g, ' ');
    const existing = acc.find(r => r.name === label);
    if (existing) existing.count++;
    else acc.push({ name: label, count: 1 });
    return acc;
  }, []);

  const recentMaintenance = [...maintenance].sort((a, b) => new Date(b.created_date) - new Date(a.created_date)).slice(0, 5);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background">
      <div className="p-8 max-w-[1400px] mx-auto">
        {/* Hero Section */}
        <div className="mb-8 border-b border-border pb-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-4xl font-serif font-bold text-foreground mb-1">Dashboard</h1>
              <p className="text-base text-muted-foreground">{demoCompanyId ? companies[0]?.name || 'Demo' : 'EstateFlow Property Group'} — Portfolio Overview</p>
            </div>
            <div className="hidden lg:flex items-center gap-3 px-4 py-2 bg-card rounded-lg border border-border">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs font-medium text-foreground">System Live</span>
            </div>
          </div>
        </div>

        <ComplianceAlert />

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard title="Companies" value={companies.length} icon={Building2} subtitle={`${companies.filter(c => c.status === 'active').length} active`} />
        <StatCard title="Properties" value={properties.length} icon={Home} subtitle={`${units.length} total units`} />
        <StatCard title="Occupancy" value={`${occupancyRate}%`} icon={DoorOpen} subtitle={`${occupiedUnits} of ${units.length} units`} />
        <StatCard title="Active Tenants" value={tenants.filter(t => t.status === 'active').length} icon={Users} subtitle={`${tenants.filter(t => t.status === 'in_arrears').length} in arrears`} />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard title="Income (Paid)" value={`£${totalIncome.toLocaleString()}`} icon={TrendingUp} subtitle="sample data — import actuals" />
        <StatCard title="Expenses (Paid)" value={`£${totalExpenses.toLocaleString()}`} icon={PoundSterling} subtitle="sample data — import actuals" />
        <StatCard title="Overdue Items" value={overdueCount} icon={AlertTriangle} />
        <StatCard title="Open Maintenance" value={activeMaintenance} icon={Wrench} />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-card rounded-xl border border-border p-6">
          <h3 className="text-sm font-medium text-muted-foreground mb-4 uppercase tracking-wider">Companies by Category</h3>
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
          <h3 className="text-sm font-medium text-muted-foreground mb-4 uppercase tracking-wider">Properties by Region</h3>
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

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-0">
        <div className="lg:col-span-2">
          {/* Recent Maintenance */}
          <div className="bg-card rounded-xl border border-border p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">Recent Maintenance Orders</h3>
              <Link to="/maintenance" className="text-xs font-medium text-primary hover:text-primary/80 transition-colors">View all →</Link>
            </div>
            {recentMaintenance.length > 0 ? (
              <div className="divide-y divide-border">
                {recentMaintenance.map(m => (
                  <div key={m.id} className="flex items-center justify-between py-3 hover:bg-muted/30 px-2 -mx-2 rounded transition-colors">
                    <div>
                      <p className="text-sm font-medium text-foreground">{m.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{m.category?.replace(/_/g, ' ')} · {format(new Date(m.created_date), 'dd MMM yyyy')}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <StatusBadge status={m.priority} />
                      <StatusBadge status={m.status} />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground py-8 text-center">No maintenance orders yet</p>
            )}
          </div>
        </div>
        <div>
          <SetupProgressCard />
        </div>
      </div>
      </div>
      </div>
      );
}