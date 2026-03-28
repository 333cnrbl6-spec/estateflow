import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import PageHeader from '@/components/shared/PageHeader';
import StatCard from '@/components/shared/StatCard';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Clock, TrendingUp, Target, Zap } from 'lucide-react';

const COLORS = ['#0ea5e9', '#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'];

export default function OperationalMetricsDashboard() {
  const { data: calls = [] } = useQuery({
    queryKey: ['callMetrics'],
    queryFn: () =>
      base44.entities.OutOfHoursCall.list('-call_date_time', 500),
  });

  const { data: properties = [] } = useQuery({
    queryKey: ['propertiesMetrics'],
    queryFn: () =>
      base44.entities.Property.list('-created_date', 500),
  });

  const { data: services = [] } = useQuery({
    queryKey: ['servicesMetrics'],
    queryFn: () =>
      base44.entities.OutOfHoursService.list('-created_date', 100),
  });

  // Calculate metrics
  const metrics = useMemo(() => {
    if (calls.length === 0) {
      return {
        avgResponseTime: 0,
        resolutionRate: 0,
        totalCalls: 0,
        criticalCalls: 0,
        callsByProperty: [],
        callsByTier: [],
        resolutionTrend: [],
        responseTimeTrend: [],
      };
    }

    // Response time calculation
    const callsWithResponseTime = calls.filter((c) => c.response_time_minutes);
    const avgResponseTime =
      callsWithResponseTime.length > 0
        ? Math.round(
            callsWithResponseTime.reduce((sum, c) => sum + c.response_time_minutes, 0) /
            callsWithResponseTime.length
          )
        : 0;

    // Resolution rate
    const resolvedCalls = calls.filter((c) => c.action_taken === 'resolved').length;
    const resolutionRate =
      calls.length > 0 ? Math.round((resolvedCalls / calls.length) * 100) : 0;

    // Calls by severity
    const criticalCalls = calls.filter((c) => c.severity === 'critical').length;

    // Calls by property
    const callsByProperty = {};
    calls.forEach((call) => {
      if (call.property_address) {
        callsByProperty[call.property_address] =
          (callsByProperty[call.property_address] || 0) + 1;
      }
    });

    const propertyData = Object.entries(callsByProperty)
      .map(([property, count]) => ({
        name: property.length > 30 ? property.substring(0, 27) + '...' : property,
        calls: count,
      }))
      .sort((a, b) => b.calls - a.calls)
      .slice(0, 10);

    // Calls by tier
    const tierMap = {};
    services.forEach((service) => {
      const tierCalls = calls.filter((c) => c.matched_company_id === service.company_id).length;
      tierMap[service.service_tier] = (tierMap[service.service_tier] || 0) + tierCalls;
    });

    const tierData = Object.entries(tierMap).map(([tier, count]) => ({
      name: tier.charAt(0).toUpperCase() + tier.slice(1),
      value: count,
    }));

    // Call trend by severity
    const severityMap = { critical: 0, high: 0, medium: 0, low: 0 };
    calls.forEach((c) => {
      if (c.severity && severityMap[c.severity] !== undefined) {
        severityMap[c.severity]++;
      }
    });

    const resolutionTrend = [
      { name: 'Critical', value: severityMap.critical, fill: '#ef4444' },
      { name: 'High', value: severityMap.high, fill: '#f97316' },
      { name: 'Medium', value: severityMap.medium, fill: '#eab308' },
      { name: 'Low', value: severityMap.low, fill: '#3b82f6' },
    ];

    // Response time trend over last 7 days
    const last7Days = {};
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dateStr = date.toLocaleDateString('en-GB', {
        month: 'short',
        day: 'numeric',
      });
      last7Days[dateStr] = [];
    }

    calls.forEach((c) => {
      if (c.call_date_time && c.response_time_minutes) {
        const callDate = new Date(c.call_date_time);
        const dateStr = callDate.toLocaleDateString('en-GB', {
          month: 'short',
          day: 'numeric',
        });
        if (last7Days[dateStr]) {
          last7Days[dateStr].push(c.response_time_minutes);
        }
      }
    });

    const responseTimeTrend = Object.entries(last7Days)
      .map(([date, times]) => ({
        date,
        avgTime: times.length > 0 ? Math.round(times.reduce((a, b) => a + b, 0) / times.length) : 0,
        callCount: times.length,
      }))
      .filter((d) => d.callCount > 0);

    return {
      avgResponseTime,
      resolutionRate,
      totalCalls: calls.length,
      criticalCalls,
      callsByProperty: propertyData,
      callsByTier: tierData,
      resolutionTrend,
      responseTimeTrend,
    };
  }, [calls, services]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Operational Metrics"
        subtitle="Track performance and efficiency across your out-of-hours service"
      />

      {/* Key Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          icon={Clock}
          title="Avg Response Time"
          value={`${metrics.avgResponseTime}m`}
          subtitle="minutes"
        />
        <StatCard
          icon={Target}
          title="Resolution Rate"
          value={`${metrics.resolutionRate}%`}
        />
        <StatCard
          icon={TrendingUp}
          title="Total Calls"
          value={metrics.totalCalls}
        />
        <StatCard
          icon={Zap}
          title="Critical Calls"
          value={metrics.criticalCalls}
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Call Volume by Property */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Call Volume by Property</CardTitle>
          </CardHeader>
          <CardContent>
            {metrics.callsByProperty.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No data available</p>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={metrics.callsByProperty}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 12 }}
                    angle={-45}
                    textAnchor="end"
                    height={100}
                  />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--card)',
                      border: '1px solid var(--border)',
                    }}
                  />
                  <Bar dataKey="calls" fill="var(--primary)" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Service Tier Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Calls by Service Tier</CardTitle>
          </CardHeader>
          <CardContent>
            {metrics.callsByTier.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No data available</p>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={metrics.callsByTier}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {metrics.callsByTier.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Response Time Trend */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">Response Time Trend (Last 7 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            {metrics.responseTimeTrend.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No data available</p>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={metrics.responseTimeTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                  <YAxis yAxisId="left" tick={{ fontSize: 12 }} label={{ value: 'Avg Time (min)', angle: -90, position: 'insideLeft' }} />
                  <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} label={{ value: 'Call Count', angle: 90, position: 'insideRight' }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--card)',
                      border: '1px solid var(--border)',
                    }}
                  />
                  <Legend />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="avgTime"
                    stroke="var(--primary)"
                    strokeWidth={2}
                    name="Avg Response Time"
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="callCount"
                    stroke="var(--accent)"
                    strokeWidth={2}
                    name="Call Count"
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Call Severity Distribution */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">Call Severity Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              {metrics.resolutionTrend.map((item) => (
                <div key={item.name} className="flex-1 min-w-64">
                  <div className="flex items-center gap-3 mb-3">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: item.fill }}
                    />
                    <span className="text-sm font-semibold">{item.name}</span>
                  </div>
                  <div className="text-3xl font-bold text-foreground">{item.value}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {metrics.totalCalls > 0
                      ? Math.round((item.value / metrics.totalCalls) * 100)
                      : 0}
                    % of total calls
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}