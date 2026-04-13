import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts';
import {
  Building2, PoundSterling, Wrench, Users, TrendingUp, TrendingDown,
  AlertTriangle, CheckCircle2, Clock, Mail, Lock, Download, Loader2, Sparkles
} from 'lucide-react';
import { format, parseISO, startOfMonth, subMonths } from 'date-fns';

const COLORS = ['#1e3a5f', '#f0ad4e', '#16a34a', '#dc2626', '#7c3aed', '#0891b2'];

function safeFormat(d, fmt = 'dd MMM yyyy') {
  if (!d) return '—';
  try { return format(parseISO(d), fmt); } catch { return d; }
}

function StatCard({ label, value, sub, icon: Icon, color = 'text-primary', bg = 'bg-primary/5', trend }) {
  return (
    <div className={`rounded-xl border p-4 ${bg}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className={`text-2xl font-bold mt-1 ${color}`}>{value}</p>
          {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
        </div>
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${bg}`}>
          <Icon className={`w-5 h-5 ${color}`} />
        </div>
      </div>
      {trend !== undefined && (
        <div className={`flex items-center gap-1 mt-2 text-xs font-medium ${trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
          {trend >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
          {Math.abs(trend)}% vs last month
        </div>
      )}
    </div>
  );
}

// ── Overview Tab ──────────────────────────────────────────────────
function OverviewTab({ properties, units, tenants, transactions, maintenance }) {
  const occupied = units.filter(u => u.status === 'occupied').length;
  const occupancyRate = units.length ? Math.round((occupied / units.length) * 100) : 0;

  const income = transactions.filter(t => t.direction === 'income' && t.status === 'paid').reduce((s, t) => s + (t.amount || 0), 0);
  const expenses = transactions.filter(t => t.direction === 'expense').reduce((s, t) => s + (t.amount || 0), 0);
  const arrears = transactions.filter(t => t.status === 'overdue').reduce((s, t) => s + (t.amount || 0), 0);

  const openMaint = maintenance.filter(m => !['completed', 'cancelled'].includes(m.status)).length;
  const maintCost = maintenance.reduce((s, m) => s + (m.actual_cost || m.estimated_cost || 0), 0);

  // Monthly income chart (last 6 months)
  const monthlyData = useMemo(() => {
    return Array.from({ length: 6 }, (_, i) => {
      const month = subMonths(new Date(), 5 - i);
      const key = format(month, 'yyyy-MM');
      const monthIncome = transactions
        .filter(t => t.direction === 'income' && t.paid_date?.startsWith(key))
        .reduce((s, t) => s + (t.amount || 0), 0);
      const monthExpense = transactions
        .filter(t => t.direction === 'expense' && t.created_date?.startsWith(key))
        .reduce((s, t) => s + (t.amount || 0), 0);
      return { month: format(month, 'MMM yy'), income: monthIncome, expense: monthExpense };
    });
  }, [transactions]);

  // Property occupancy breakdown
  const propData = properties.map(p => {
    const propUnits = units.filter(u => u.property_id === p.id);
    const propOccupied = propUnits.filter(u => u.status === 'occupied').length;
    return { name: p.name?.slice(0, 18), total: propUnits.length, occupied: propOccupied, vacant: propUnits.length - propOccupied };
  }).filter(p => p.total > 0);

  return (
    <div className="space-y-6">
      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Occupancy Rate" value={`${occupancyRate}%`} sub={`${occupied}/${units.length} units`}
          icon={Building2} color="text-primary" bg="bg-primary/5" />
        <StatCard label="Total Income" value={`£${income.toLocaleString()}`} sub="Paid transactions"
          icon={PoundSterling} color="text-green-700" bg="bg-green-50" />
        <StatCard label="Rent Arrears" value={`£${arrears.toLocaleString()}`} sub="Overdue balance"
          icon={AlertTriangle} color={arrears > 0 ? 'text-red-600' : 'text-slate-600'} bg={arrears > 0 ? 'bg-red-50' : 'bg-slate-50'} />
        <StatCard label="Open Maintenance" value={openMaint} sub={`£${maintCost.toLocaleString()} est. cost`}
          icon={Wrench} color="text-amber-700" bg="bg-amber-50" />
      </div>

      {/* Income chart */}
      <Card>
        <CardHeader><CardTitle className="text-sm">Income vs Expenses (Last 6 Months)</CardTitle></CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={monthlyData} barSize={24}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `£${(v/1000).toFixed(0)}k`} />
              <Tooltip formatter={v => `£${v.toLocaleString()}`} />
              <Legend />
              <Bar dataKey="income" name="Income" fill="#16a34a" radius={[4,4,0,0]} />
              <Bar dataKey="expense" name="Expenses" fill="#dc2626" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Property occupancy */}
      {propData.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="text-sm">Occupancy by Property</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={propData} layout="vertical" barSize={16}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis dataKey="name" type="category" width={110} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="occupied" name="Occupied" fill="#1e3a5f" radius={[0,4,4,0]} stackId="a" />
                <Bar dataKey="vacant" name="Vacant" fill="#e5e7eb" radius={[0,4,4,0]} stackId="a" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// ── Maintenance Costs Tab ─────────────────────────────────────────
function MaintenanceCostsTab({ maintenance, properties }) {
  const [filterProp, setFilterProp] = useState('all');

  const filtered = filterProp === 'all' ? maintenance : maintenance.filter(m => m.property_id === filterProp);
  const propMap = Object.fromEntries(properties.map(p => [p.id, p.name]));

  // Cost by category
  const byCat = useMemo(() => {
    const map = {};
    filtered.forEach(m => {
      const cat = m.category || 'general';
      if (!map[cat]) map[cat] = { name: cat.replace(/_/g, ' '), estimated: 0, actual: 0, count: 0 };
      map[cat].estimated += m.estimated_cost || 0;
      map[cat].actual += m.actual_cost || 0;
      map[cat].count++;
    });
    return Object.values(map).sort((a, b) => b.estimated - a.estimated);
  }, [filtered]);

  // Cost by property
  const byProp = useMemo(() => {
    const map = {};
    filtered.forEach(m => {
      const pid = m.property_id || 'unknown';
      const name = propMap[pid] || 'Unknown';
      if (!map[pid]) map[pid] = { name, estimated: 0, actual: 0, count: 0 };
      map[pid].estimated += m.estimated_cost || 0;
      map[pid].actual += m.actual_cost || 0;
      map[pid].count++;
    });
    return Object.values(map).sort((a, b) => b.estimated - a.estimated);
  }, [filtered]);

  const totalEst = filtered.reduce((s, m) => s + (m.estimated_cost || 0), 0);
  const totalAct = filtered.filter(m => m.status === 'completed').reduce((s, m) => s + (m.actual_cost || 0), 0);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex gap-4">
          <div className="text-center"><p className="text-xl font-bold text-slate-700">£{totalEst.toLocaleString()}</p><p className="text-xs text-muted-foreground">Total Estimated</p></div>
          <div className="text-center"><p className="text-xl font-bold text-green-700">£{totalAct.toLocaleString()}</p><p className="text-xs text-muted-foreground">Actual Spend</p></div>
          <div className="text-center"><p className="text-xl font-bold text-slate-700">{filtered.length}</p><p className="text-xs text-muted-foreground">Total Jobs</p></div>
        </div>
        <Select value={filterProp} onValueChange={setFilterProp}>
          <SelectTrigger className="w-48"><SelectValue placeholder="Filter by property" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Properties</SelectItem>
            {properties.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div className="grid md:grid-cols-2 gap-5">
        {/* By category */}
        <Card>
          <CardHeader><CardTitle className="text-sm">Cost by Category</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={byCat} barSize={18}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 9 }} />
                <YAxis tick={{ fontSize: 10 }} tickFormatter={v => `£${v}`} />
                <Tooltip formatter={v => `£${Number(v).toLocaleString()}`} />
                <Bar dataKey="estimated" name="Estimated" fill="#1e3a5f" radius={[4,4,0,0]} />
                <Bar dataKey="actual" name="Actual" fill="#16a34a" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* By property */}
        <Card>
          <CardHeader><CardTitle className="text-sm">Cost by Property</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2">
              {byProp.map((p, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between text-xs mb-0.5">
                      <span className="font-medium truncate">{p.name}</span>
                      <span className="text-muted-foreground">£{p.estimated.toLocaleString()}</span>
                    </div>
                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-primary rounded-full"
                        style={{ width: `${byProp[0]?.estimated ? (p.estimated / byProp[0].estimated) * 100 : 0}%` }} />
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground shrink-0">{p.count} jobs</span>
                </div>
              ))}
              {byProp.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No data</p>}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Job table */}
      <Card>
        <CardHeader><CardTitle className="text-sm">Recent Jobs</CardTitle></CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="bg-slate-50 border-b">
                {['Job', 'Property', 'Contractor', 'Status', 'Est.', 'Actual'].map(h => (
                  <th key={h} className="px-3 py-2 text-left text-xs font-semibold text-slate-500">{h}</th>
                ))}
              </tr></thead>
              <tbody>
                {filtered.slice(0, 20).map(m => (
                  <tr key={m.id} className="border-b last:border-0 hover:bg-slate-50">
                    <td className="px-3 py-2 font-medium max-w-40 truncate">{m.title}</td>
                    <td className="px-3 py-2 text-xs text-muted-foreground">{propMap[m.property_id] || '—'}</td>
                    <td className="px-3 py-2 text-xs">{m.assigned_contractor_name || '—'}</td>
                    <td className="px-3 py-2"><span className="text-xs bg-slate-100 px-2 py-0.5 rounded-full capitalize">{m.status?.replace(/_/g, ' ')}</span></td>
                    <td className="px-3 py-2 text-xs">{m.estimated_cost ? `£${m.estimated_cost.toLocaleString()}` : '—'}</td>
                    <td className="px-3 py-2 text-xs text-green-700">{m.actual_cost ? `£${m.actual_cost.toLocaleString()}` : '—'}</td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={6} className="px-3 py-6 text-center text-muted-foreground text-sm">No maintenance records</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ── Tenant Communication Tab ──────────────────────────────────────
function TenantCommTab({ tenants, properties, units }) {
  const propMap = Object.fromEntries(properties.map(p => [p.id, p.name]));
  const unitMap = Object.fromEntries(units.map(u => [u.id, u.unit_reference]));

  const STATUS_STYLES = {
    active: 'bg-green-100 text-green-700',
    in_arrears: 'bg-red-100 text-red-700',
    notice_given: 'bg-amber-100 text-amber-700',
    former: 'bg-slate-100 text-slate-500',
    prospective: 'bg-blue-100 text-blue-700',
  };

  const active = tenants.filter(t => t.status === 'active').length;
  const arrears = tenants.filter(t => t.status === 'in_arrears').length;
  const notice = tenants.filter(t => t.status === 'notice_given').length;

  return (
    <div className="space-y-5">
      {/* Summary pills */}
      <div className="flex flex-wrap gap-3">
        {[
          { label: 'Active Tenants', value: active, color: 'bg-green-50 text-green-700' },
          { label: 'In Arrears', value: arrears, color: 'bg-red-50 text-red-700' },
          { label: 'Notice Given', value: notice, color: 'bg-amber-50 text-amber-700' },
          { label: 'Total Tenants', value: tenants.length, color: 'bg-slate-50 text-slate-700' },
        ].map(s => (
          <div key={s.label} className={`rounded-xl px-4 py-3 ${s.color}`}>
            <p className="text-xl font-bold">{s.value}</p>
            <p className="text-xs mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Tenant table */}
      <Card>
        <CardHeader><CardTitle className="text-sm flex items-center gap-2"><Users className="w-4 h-4" /> Tenant Directory</CardTitle></CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="bg-slate-50 border-b">
                {['Tenant', 'Property', 'Unit', 'Lease End', 'Rent', 'Status'].map(h => (
                  <th key={h} className="px-3 py-2 text-left text-xs font-semibold text-slate-500">{h}</th>
                ))}
              </tr></thead>
              <tbody>
                {tenants.map(t => {
                  const unit = units.find(u => u.id === t.unit_id);
                  return (
                    <tr key={t.id} className="border-b last:border-0 hover:bg-slate-50">
                      <td className="px-3 py-2">
                        <p className="font-medium">{t.full_name}</p>
                        {t.email && <p className="text-xs text-muted-foreground">{t.email}</p>}
                      </td>
                      <td className="px-3 py-2 text-xs text-muted-foreground">{propMap[t.property_id] || '—'}</td>
                      <td className="px-3 py-2 text-xs">{unitMap[t.unit_id] || '—'}</td>
                      <td className="px-3 py-2 text-xs">
                        {t.tenancy_end_date ? (
                          <span className={new Date(t.tenancy_end_date) < new Date(Date.now() + 60 * 86400000) ? 'text-amber-600 font-semibold' : ''}>
                            {safeFormat(t.tenancy_end_date, 'dd MMM yy')}
                          </span>
                        ) : '—'}
                      </td>
                      <td className="px-3 py-2 text-xs font-medium">{unit?.monthly_rent ? `£${unit.monthly_rent.toLocaleString()}/mo` : '—'}</td>
                      <td className="px-3 py-2">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_STYLES[t.status] || 'bg-slate-100 text-slate-600'}`}>
                          {t.status?.replace(/_/g, ' ')}
                        </span>
                      </td>
                    </tr>
                  );
                })}
                {tenants.length === 0 && (
                  <tr><td colSpan={6} className="px-3 py-6 text-center text-muted-foreground text-sm">No tenants found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Lease expiry alerts */}
      {tenants.filter(t => {
        if (!t.tenancy_end_date) return false;
        const days = Math.ceil((new Date(t.tenancy_end_date) - new Date()) / 86400000);
        return days > 0 && days <= 90;
      }).length > 0 && (
        <Card className="border-amber-200 bg-amber-50">
          <CardHeader><CardTitle className="text-sm flex items-center gap-2 text-amber-700">
            <AlertTriangle className="w-4 h-4" /> Leases Expiring Within 90 Days
          </CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2">
              {tenants.filter(t => {
                if (!t.tenancy_end_date) return false;
                const days = Math.ceil((new Date(t.tenancy_end_date) - new Date()) / 86400000);
                return days > 0 && days <= 90;
              }).map(t => {
                const days = Math.ceil((new Date(t.tenancy_end_date) - new Date()) / 86400000);
                return (
                  <div key={t.id} className="flex items-center justify-between text-sm">
                    <span className="font-medium">{t.full_name}</span>
                    <span className={`text-xs font-semibold ${days <= 30 ? 'text-red-600' : 'text-amber-600'}`}>
                      {days} days · {safeFormat(t.tenancy_end_date, 'dd MMM yyyy')}
                    </span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// ── Main Portal ───────────────────────────────────────────────────
export default function LandlordPortal() {
  const { data: properties = [], isLoading: loadingProps } = useQuery({
    queryKey: ['landlord-portal-properties'],
    queryFn: () => base44.entities.Property.list('name', 200),
  });
  const { data: units = [] } = useQuery({
    queryKey: ['landlord-portal-units'],
    queryFn: () => base44.entities.Unit.list('unit_reference', 500),
  });
  const { data: tenants = [] } = useQuery({
    queryKey: ['landlord-portal-tenants'],
    queryFn: () => base44.entities.Tenant.list('full_name', 500),
  });
  const { data: transactions = [] } = useQuery({
    queryKey: ['landlord-portal-txns'],
    queryFn: () => base44.entities.FinancialTransaction.list('-created_date', 1000),
  });
  const { data: maintenance = [] } = useQuery({
    queryKey: ['landlord-portal-maint'],
    queryFn: () => base44.entities.MaintenanceOrder.list('-created_date', 500),
  });

  if (loadingProps) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const income = transactions.filter(t => t.direction === 'income' && t.status === 'paid').reduce((s, t) => s + (t.amount || 0), 0);
  const netProfit = income - transactions.filter(t => t.direction === 'expense').reduce((s, t) => s + (t.amount || 0), 0);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-primary" /> Landlord Portfolio Portal
            </h1>
            <p className="text-xs text-muted-foreground">{properties.length} properties · {units.length} units</p>
          </div>
          <div className="flex items-center gap-3 text-right">
            <div>
              <p className="text-sm font-bold text-green-700">£{income.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">Total income</p>
            </div>
            <div className={`rounded-lg px-3 py-1.5 ${netProfit >= 0 ? 'bg-green-50' : 'bg-red-50'}`}>
              <p className={`text-sm font-bold ${netProfit >= 0 ? 'text-green-700' : 'text-red-600'}`}>
                {netProfit >= 0 ? '+' : ''}£{netProfit.toLocaleString()}
              </p>
              <p className="text-xs text-muted-foreground">Net P&L</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        <Tabs defaultValue="overview">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="overview" className="gap-2"><TrendingUp className="w-4 h-4" /> Portfolio Overview</TabsTrigger>
            <TabsTrigger value="maintenance" className="gap-2"><Wrench className="w-4 h-4" /> Maintenance Costs</TabsTrigger>
            <TabsTrigger value="tenants" className="gap-2"><Users className="w-4 h-4" /> Tenant Communications</TabsTrigger>
          </TabsList>
          <TabsContent value="overview">
            <OverviewTab properties={properties} units={units} tenants={tenants} transactions={transactions} maintenance={maintenance} />
          </TabsContent>
          <TabsContent value="maintenance">
            <MaintenanceCostsTab maintenance={maintenance} properties={properties} />
          </TabsContent>
          <TabsContent value="tenants">
            <TenantCommTab tenants={tenants} properties={properties} units={units} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}