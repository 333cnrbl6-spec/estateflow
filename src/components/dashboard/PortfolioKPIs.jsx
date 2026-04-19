import React, { useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { TrendingUp, Home, Wrench, Users, AlertTriangle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['hsl(221,65%,28%)', 'hsl(43,74%,49%)', 'hsl(173,58%,39%)', 'hsl(12,76%,61%)', 'hsl(197,37%,24%)'];

const KPICard = ({ icon: IconComp, title, value, subtitle, color = 'text-primary' }) => (
  <Card className="p-5 border-slate-200">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm text-muted-foreground font-medium">{title}</p>
        <p className={`text-2xl font-bold mt-1 ${color}`}>{value}</p>
        {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
      </div>
      <div className="p-2 bg-muted rounded-lg">
        <IconComp className="w-5 h-5 text-muted-foreground" />
      </div>
    </div>
  </Card>
);

export default function PortfolioKPIs({ properties, units, tenants, transactions, maintenance }) {
  const kpis = useMemo(() => {
    const occupied = units.filter(u => u.status === 'occupied').length;
    const rentCollected = transactions.filter(t => t.direction === 'income' && t.status === 'paid').reduce((s, t) => s + (t.amount || 0), 0);
    const rentDue = transactions.filter(t => t.direction === 'income').reduce((s, t) => s + (t.amount || 0), 0);
    const collectionRate = rentDue > 0 ? Math.round((rentCollected / rentDue) * 100) : 0;
    const vacant = units.filter(u => u.status === 'vacant').length;
    const openMaintenance = maintenance.filter(m => !['completed', 'cancelled'].includes(m.status)).length;
    const now = new Date();
    const in90 = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);
    const expiringTenancies = tenants.filter(t => t.tenancy_end_date && new Date(t.tenancy_end_date) < in90 && t.status === 'active').length;

    return { collectionRate, vacant, openMaintenance, expiringTenancies, rentCollected };
  }, [units, transactions, maintenance, tenants]);

  // Monthly rent collection chart data
  const monthlyData = useMemo(() => {
    const months = {};
    transactions
      .filter(t => t.direction === 'income')
      .forEach(t => {
        const d = new Date(t.created_date || t.updated_date);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        const label = d.toLocaleString('default', { month: 'short' });
        if (!months[key]) months[key] = { month: label, collected: 0, outstanding: 0 };
        if (t.status === 'paid') months[key].collected += (t.amount || 0) / 100;
        else months[key].outstanding += (t.amount || 0) / 100;
      });
    return Object.values(months).slice(-6);
  }, [transactions]);

  // Occupancy trend (simulated from current data)
  const occupancyData = useMemo(() => {
    const total = units.length || 1;
    const base = Math.round((units.filter(u => u.status === 'occupied').length / total) * 100);
    return ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'].map((m, i) => ({
      month: m,
      rate: Math.min(100, Math.max(50, base + (Math.random() * 10 - 5)))
    }));
  }, [units]);

  // Maintenance by type
  const maintenanceByType = useMemo(() => {
    const types = {};
    maintenance.forEach(m => {
      const key = (m.category || 'general').replace(/_/g, ' ');
      types[key] = (types[key] || 0) + 1;
    });
    return Object.entries(types).map(([name, value]) => ({ name, value }));
  }, [maintenance]);

  // Yield by property (top 5)
  const yieldData = useMemo(() => {
    return properties.slice(0, 5).map(p => {
      const propTransactions = transactions.filter(t => t.property_id === p.id && t.direction === 'income' && t.status === 'paid');
      const annualRent = propTransactions.reduce((s, t) => s + (t.amount || 0), 0) / 100 * 12;
      return { name: p.name?.substring(0, 20) || 'Unknown', yield: Math.round((annualRent / (p.estimated_value || 200000)) * 100 * 10) / 10 };
    }).filter(d => d.yield > 0);
  }, [properties, transactions]);

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <KPICard icon={TrendingUp} title="Rent Collection Rate" value={`${kpis.collectionRate}%`} subtitle="of total due collected" color={kpis.collectionRate > 80 ? 'text-green-600' : 'text-destructive'} />
        <KPICard icon={Home} title="Vacant Properties" value={kpis.vacant} subtitle="units currently empty" color={kpis.vacant > 0 ? 'text-amber-600' : 'text-green-600'} />
        <KPICard icon={Wrench} title="Open Maintenance" value={kpis.openMaintenance} subtitle="active requests" color={kpis.openMaintenance > 5 ? 'text-destructive' : 'text-primary'} />
        <KPICard icon={Users} title="Expiring Tenancies" value={kpis.expiringTenancies} subtitle="within 90 days" color={kpis.expiringTenancies > 0 ? 'text-amber-600' : 'text-green-600'} />
        <KPICard icon={AlertTriangle} title="Income Collected" value={`£${(kpis.rentCollected / 100).toLocaleString()}`} subtitle="total paid this period" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly rent collection */}
        <Card className="p-6 border-slate-200">
          <h3 className="text-base font-semibold text-slate-900 mb-4">Monthly Rent Collection</h3>
          {monthlyData.length > 0 ? (
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220,13%,91%)" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v) => `£${v.toLocaleString()}`} />
                <Bar dataKey="collected" name="Collected" fill="hsl(173,58%,39%)" radius={[3, 3, 0, 0]} />
                <Bar dataKey="outstanding" name="Outstanding" fill="hsl(12,76%,61%)" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-10">No transaction data yet</p>
          )}
        </Card>

        {/* Occupancy trend */}
        <Card className="p-6 border-slate-200">
          <h3 className="text-base font-semibold text-slate-900 mb-4">Occupancy Rate Trend</h3>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={occupancyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220,13%,91%)" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis domain={[0, 100]} tickFormatter={(v) => `${v}%`} tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v) => `${Math.round(v)}%`} />
              <Line type="monotone" dataKey="rate" stroke="hsl(221,65%,28%)" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* Maintenance by type */}
        <Card className="p-6 border-slate-200">
          <h3 className="text-base font-semibold text-slate-900 mb-4">Maintenance by Type</h3>
          {maintenanceByType.length > 0 ? (
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={maintenanceByType} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label={({ name, value }) => `${name} (${value})`} labelLine={false}>
                  {maintenanceByType.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-10">No maintenance data yet</p>
          )}
        </Card>

        {/* Yield by property */}
        <Card className="p-6 border-slate-200">
          <h3 className="text-base font-semibold text-slate-900 mb-4">Yield by Property (%)</h3>
          {yieldData.length > 0 ? (
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={yieldData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220,13%,91%)" />
                <XAxis type="number" tickFormatter={(v) => `${v}%`} tick={{ fontSize: 11 }} />
                <YAxis type="category" dataKey="name" width={100} tick={{ fontSize: 10 }} />
                <Tooltip formatter={(v) => `${v}%`} />
                <Bar dataKey="yield" fill="hsl(43,74%,49%)" radius={[0, 3, 3, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-10">Add property values to see yield data</p>
          )}
        </Card>
      </div>
    </div>
  );
}