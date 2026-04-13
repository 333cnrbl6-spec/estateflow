import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Loader2, TrendingUp, DollarSign, Wrench, AlertTriangle } from 'lucide-react';

const COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#14b8a6'];

export default function MaintenanceAnalyticsDashboard() {
  // Fetch all maintenance requests
  const { data: maintenanceRequests = [], isLoading } = useQuery({
    queryKey: ['maintenance-analytics'],
    queryFn: async () => {
      const requests = await base44.entities.MaintenanceRequest.filter(
        { status: ['completed', 'in_progress'] },
        '-completion_date',
        500
      );
      return requests;
    },
  });

  // Fetch properties for reference
  const { data: properties = [] } = useQuery({
    queryKey: ['properties'],
    queryFn: async () => {
      return await base44.entities.Property.list('-updated_date', 100);
    },
  });

  // Calculate analytics
  const analytics = useMemo(() => {
    if (maintenanceRequests.length === 0) return null;

    // 1. Spend per property
    const spendByProperty = {};
    const requestsByProperty = {};

    // 2. Costs by category
    const costsByCategory = {};
    const requestsByCategory = {};

    // 3. Repair frequency by asset type (using description keywords)
    const repairFrequency = {};
    const costsByAsset = {};

    maintenanceRequests.forEach(req => {
      const propertyId = req.property_id;
      const cost = req.actual_cost || req.estimated_cost || 0;
      const category = req.category || 'general';
      const description = (req.description || '').toLowerCase();

      // Spend per property
      if (!spendByProperty[propertyId]) {
        spendByProperty[propertyId] = 0;
        requestsByProperty[propertyId] = 0;
      }
      spendByProperty[propertyId] += cost;
      requestsByProperty[propertyId]++;

      // Costs by category
      if (!costsByCategory[category]) {
        costsByCategory[category] = 0;
        requestsByCategory[category] = 0;
      }
      costsByCategory[category] += cost;
      requestsByCategory[category]++;

      // Identify fixture types from description
      const fixtureKeywords = {
        plumbing: ['pipe', 'sink', 'toilet', 'tap', 'water', 'drain', 'bathroom', 'shower'],
        electrical: ['electric', 'wire', 'switch', 'light', 'socket', 'breaker', 'panel'],
        heating: ['boiler', 'radiator', 'heating', 'furnace', 'thermostat', 'gas'],
        roofing: ['roof', 'tile', 'leak', 'gutter', 'chimney'],
        flooring: ['floor', 'carpet', 'tile', 'wood', 'laminate'],
        doors: ['door', 'lock', 'frame', 'hinge', 'handle'],
        windows: ['window', 'glass', 'frame', 'seal'],
        general: ['maintenance', 'repair'],
      };

      let assetType = 'other';
      for (const [type, keywords] of Object.entries(fixtureKeywords)) {
        if (keywords.some(kw => description.includes(kw))) {
          assetType = type;
          break;
        }
      }

      if (!repairFrequency[assetType]) {
        repairFrequency[assetType] = 0;
        costsByAsset[assetType] = 0;
      }
      repairFrequency[assetType]++;
      costsByAsset[assetType] += cost;
    });

    // Build data for charts
    const propertyChartData = properties
      .filter(p => spendByProperty[p.id])
      .map(p => ({
        name: p.name || 'Property',
        spend: spendByProperty[p.id],
        requests: requestsByProperty[p.id],
      }))
      .sort((a, b) => b.spend - a.spend);

    const categoryChartData = Object.entries(costsByCategory).map(([category, cost]) => ({
      name: category.charAt(0).toUpperCase() + category.slice(1),
      value: cost,
      requests: requestsByCategory[category],
    }));

    const assetChartData = Object.entries(repairFrequency)
      .map(([asset, frequency]) => ({
        name: asset.charAt(0).toUpperCase() + asset.slice(1),
        frequency,
        cost: costsByAsset[asset],
      }))
      .sort((a, b) => b.frequency - a.frequency);

    const totalSpend = Object.values(costsByCategory).reduce((a, b) => a + b, 0);
    const avgCostPerRequest = totalSpend / maintenanceRequests.length;
    const highestFrequencyAsset = assetChartData[0];

    return {
      propertyChartData,
      categoryChartData,
      assetChartData,
      totalSpend,
      avgCostPerRequest,
      highestFrequencyAsset,
      totalRequests: maintenanceRequests.length,
    };
  }, [maintenanceRequests, properties]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3 text-blue-600" />
          <p className="text-muted-foreground">Loading maintenance analytics...</p>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="p-6">
        <Card className="bg-slate-50">
          <CardContent className="pt-6">
            <p className="text-muted-foreground text-center">No completed maintenance requests found.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Maintenance Analytics</h1>
        <p className="text-muted-foreground mt-1">Performance metrics and cost analysis</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-green-600" />
              Total Spend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-slate-900">£{analytics.totalSpend.toFixed(2)}</p>
            <p className="text-xs text-muted-foreground mt-1">{analytics.totalRequests} requests</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Wrench className="w-4 h-4 text-blue-600" />
              Avg Cost/Request
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-slate-900">£{analytics.avgCostPerRequest.toFixed(2)}</p>
            <p className="text-xs text-muted-foreground mt-1">per maintenance job</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-purple-600" />
              Most Frequent
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-slate-900">{analytics.highestFrequencyAsset?.name}</p>
            <p className="text-xs text-muted-foreground mt-1">{analytics.highestFrequencyAsset?.frequency} repairs</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              Top Asset Cost
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-slate-900">£{analytics.highestFrequencyAsset?.cost.toFixed(2)}</p>
            <p className="text-xs text-muted-foreground mt-1">{analytics.highestFrequencyAsset?.name}</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Spend by Property */}
        <Card>
          <CardHeader>
            <CardTitle>Spend by Property</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.propertyChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                <YAxis />
                <Tooltip formatter={(value) => `£${value.toFixed(2)}`} />
                <Bar dataKey="spend" fill="#3b82f6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Costs by Category */}
        <Card>
          <CardHeader>
            <CardTitle>Costs by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={analytics.categoryChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => `${entry.name}: £${entry.value.toFixed(0)}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {analytics.categoryChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `£${value.toFixed(2)}`} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Repair Frequency by Asset */}
      <Card>
        <CardHeader>
          <CardTitle>Repair Frequency by Asset Type</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analytics.assetChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis yAxisId="left" label={{ value: 'Frequency', angle: -90, position: 'insideLeft' }} />
              <YAxis yAxisId="right" orientation="right" label={{ value: 'Cost (£)', angle: 90, position: 'insideRight' }} />
              <Tooltip />
              <Legend />
              <Bar yAxisId="left" dataKey="frequency" fill="#10b981" name="Repairs" radius={[8, 8, 0, 0]} />
              <Bar yAxisId="right" dataKey="cost" fill="#f59e0b" name="Total Cost (£)" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Asset Details Table */}
      <Card>
        <CardHeader>
          <CardTitle>Asset Type Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b bg-slate-50">
                <tr>
                  <th className="text-left py-3 px-4 font-semibold text-slate-900">Asset Type</th>
                  <th className="text-right py-3 px-4 font-semibold text-slate-900">Frequency</th>
                  <th className="text-right py-3 px-4 font-semibold text-slate-900">Total Cost</th>
                  <th className="text-right py-3 px-4 font-semibold text-slate-900">Avg Cost</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {analytics.assetChartData.map((asset) => (
                  <tr key={asset.name} className="hover:bg-slate-50">
                    <td className="py-3 px-4 text-slate-900 font-medium">{asset.name}</td>
                    <td className="text-right py-3 px-4">
                      <Badge variant="outline">{asset.frequency}</Badge>
                    </td>
                    <td className="text-right py-3 px-4 font-semibold text-slate-900">
                      £{asset.cost.toFixed(2)}
                    </td>
                    <td className="text-right py-3 px-4 text-muted-foreground">
                      £{(asset.cost / asset.frequency).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}