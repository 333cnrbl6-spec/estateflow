import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, Home, AlertCircle, Wrench } from 'lucide-react';

export default function PortfolioAnalyticsDashboard() {
  const { data: properties = [] } = useQuery({
    queryKey: ['properties'],
    queryFn: () => base44.entities.Property.list(),
  });

  const { data: transactions = [] } = useQuery({
    queryKey: ['transactions'],
    queryFn: () => base44.entities.FinancialTransaction.list(),
  });

  const { data: tenants = [] } = useQuery({
    queryKey: ['tenants'],
    queryFn: () => base44.entities.Tenant.list(),
  });

  const { data: maintenance = [] } = useQuery({
    queryKey: ['maintenance'],
    queryFn: () => base44.entities.MaintenanceRequest?.list?.() || Promise.resolve([]),
  });

  // KPI Calculations
  const totalValue = properties.reduce((sum, p) => sum + (p.estimated_value || 0), 0);
  const rentDue = transactions.filter(t => t.status === 'pending').reduce((sum, t) => sum + (t.amount || 0), 0);
  const rentPaid = transactions.filter(t => t.status === 'completed').reduce((sum, t) => sum + (t.amount || 0), 0);
  const rentCollectionRate = rentPaid > 0 ? Math.round((rentPaid / (rentPaid + rentDue)) * 100) : 100;
  const occupiedProperties = tenants.filter(t => t.status === 'active').length;
  const vacantProperties = properties.length - occupiedProperties;
  const openMaintenance = maintenance.filter(m => !['completed', 'cancelled'].includes(m.status))?.length || 0;
  
  const expiringTenancies = tenants.filter(t => {
    if (!t.tenancy_end_date) return false;
    const daysLeft = Math.floor((new Date(t.tenancy_end_date) - new Date()) / (1000 * 60 * 60 * 24));
    return daysLeft > 0 && daysLeft <= 90;
  }).length;

  // Chart data
  const rentByMonth = Array.from({ length: 12 }, (_, i) => {
    const month = new Date(2026, i);
    const monthTxns = transactions.filter(t => {
      const txnMonth = new Date(t.created_date).getMonth();
      return txnMonth === i;
    });
    return {
      month: month.toLocaleDateString('en-GB', { month: 'short' }),
      collected: monthTxns.filter(t => t.status === 'completed').reduce((sum, t) => sum + (t.amount || 0), 0) / 100,
      due: monthTxns.filter(t => t.status === 'pending').reduce((sum, t) => sum + (t.amount || 0), 0) / 100,
    };
  });

  const maintenanceByType = maintenance.reduce((acc, m) => {
    const type = m.category || 'Other';
    const existing = acc.find(a => a.name === type);
    if (existing) existing.value++;
    else acc.push({ name: type, value: 1 });
    return acc;
  }, []);

  const COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b'];

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Portfolio Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">£{(totalValue / 100000).toFixed(1)}M</div>
            <p className="text-xs text-muted-foreground mt-1">{properties.length} properties</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Rent Collection</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{rentCollectionRate}%</div>
            <p className="text-xs text-muted-foreground mt-1">£{(rentPaid / 100).toLocaleString()} collected</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Occupancy</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{occupiedProperties}/{properties.length}</div>
            <p className="text-xs text-muted-foreground mt-1">{vacantProperties} vacant</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Open Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold flex items-center gap-2">
              {openMaintenance}
              {openMaintenance > 0 && <AlertCircle className="w-5 h-5 text-amber-500" />}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Maintenance requests</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Rent Collection by Month */}
        <Card>
          <CardHeader>
            <CardTitle>Rent Collection by Month</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={rentByMonth}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="collected" fill="#10b981" name="Collected" />
                <Bar dataKey="due" fill="#ef4444" name="Outstanding" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Maintenance by Type */}
        <Card>
          <CardHeader>
            <CardTitle>Maintenance by Type</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={maintenanceByType}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name} (${value})`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {maintenanceByType.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Alerts */}
      {(expiringTenancies > 0 || vacantProperties > 0 || openMaintenance > 0) && (
        <Card className="bg-amber-50 border-amber-200">
          <CardHeader>
            <CardTitle className="text-base">Active Alerts</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {expiringTenancies > 0 && <p>⚠️ {expiringTenancies} tenancies expiring within 90 days</p>}
            {vacantProperties > 0 && <p>🏠 {vacantProperties} properties vacant</p>}
            {openMaintenance > 0 && <p>🔧 {openMaintenance} maintenance requests open</p>}
          </CardContent>
        </Card>
      )}
    </div>
  );
}