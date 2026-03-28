import React, { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import PageHeader from '@/components/shared/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
import { Calendar, TrendingUp, Clock, AlertCircle, Download } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const ISSUE_COLORS = {
  emergency: '#ef4444',
  maintenance: '#3b82f6',
  general_enquiry: '#8b5cf6',
  complaint: '#f59e0b',
  urgent: '#ec4899',
  contractor_dispatch: '#10b981',
  heating_failure: '#f97316',
  water_leak: '#06b6d4',
  security_breach: '#6366f1',
  access_issue: '#14b8a6',
};

export default function OutOfHoursReporting() {
  const [dateRange, setDateRange] = useState('30');

  const { data: calls = [], isLoading } = useQuery({
    queryKey: ['outOfHoursCalls'],
    queryFn: () => base44.entities.OutOfHoursCall.list('-call_date_time', 500),
  });

  const analytics = useMemo(() => {
    const now = new Date();
    const rangeMs = parseInt(dateRange) * 24 * 60 * 60 * 1000;
    const cutoffDate = new Date(now.getTime() - rangeMs);

    const filteredCalls = calls.filter(
      (call) => new Date(call.call_date_time) >= cutoffDate
    );

    // Call volume by hour
    const byHour = Array(24)
      .fill(0)
      .map((_, i) => ({ hour: `${String(i).padStart(2, '0')}:00`, count: 0 }));

    filteredCalls.forEach((call) => {
      const hour = new Date(call.call_date_time).getHours();
      byHour[hour].count += 1;
    });

    // Issues by category
    const issueMap = {};
    filteredCalls.forEach((call) => {
      const type = call.call_type || 'unknown';
      issueMap[type] = (issueMap[type] || 0) + 1;
    });

    const issuesByCategory = Object.entries(issueMap)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);

    // Resolution time calculation
    const resolvedCalls = filteredCalls.filter(
      (call) => call.action_taken && call.status === 'resolved'
    );

    let avgResolutionTime = 0;
    if (resolvedCalls.length > 0) {
      const totalDuration = resolvedCalls.reduce(
        (sum, call) => sum + (call.duration_minutes || 0),
        0
      );
      avgResolutionTime = Math.round(totalDuration / resolvedCalls.length);
    }

    // Call status distribution
    const statusMap = {};
    filteredCalls.forEach((call) => {
      const status = call.status || 'unknown';
      statusMap[status] = (statusMap[status] || 0) + 1;
    });

    const statusDistribution = Object.entries(statusMap)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);

    // Action outcomes
    const actionMap = {};
    filteredCalls.forEach((call) => {
      const action = call.action_taken || 'pending';
      actionMap[action] = (actionMap[action] || 0) + 1;
    });

    const actionOutcomes = Object.entries(actionMap)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);

    return {
      totalCalls: filteredCalls.length,
      avgResolutionTime,
      resolvedCount: resolvedCalls.length,
      ongoingCount: filteredCalls.filter((c) => c.status !== 'resolved').length,
      byHour,
      issuesByCategory,
      statusDistribution,
      actionOutcomes,
    };
  }, [calls, dateRange]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-muted-foreground">Loading analytics...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Out-of-Hours Reporting"
        subtitle="Call volumes, issue trends, and resolution metrics"
      >
        <div className="flex items-center gap-2">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
              <SelectItem value="365">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon">
            <Download className="w-4 h-4" />
          </Button>
        </div>
      </PageHeader>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={AlertCircle}
          title="Total Calls"
          value={analytics.totalCalls}
        />
        <StatCard
          icon={TrendingUp}
          title="Resolved"
          value={analytics.resolvedCount}
          subtitle={`${
            analytics.totalCalls > 0
              ? Math.round((analytics.resolvedCount / analytics.totalCalls) * 100)
              : 0
          }% resolution rate`}
        />
        <StatCard
          icon={Clock}
          title="Avg Resolution Time"
          value={`${analytics.avgResolutionTime}m`}
          subtitle="minutes"
        />
        <StatCard
          icon={Calendar}
          title="Ongoing Cases"
          value={analytics.ongoingCount}
        />
      </div>

      {/* Charts Grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Call Volume by Hour */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Call Volume by Time of Day</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.byHour}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="hour"
                  stroke="hsl(var(--muted-foreground))"
                  style={{ fontSize: '12px' }}
                />
                <YAxis stroke="hsl(var(--muted-foreground))" style={{ fontSize: '12px' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '6px',
                  }}
                />
                <Bar dataKey="count" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Issue Categories */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Calls by Issue Type</CardTitle>
          </CardHeader>
          <CardContent>
            {analytics.issuesByCategory.length === 0 ? (
              <div className="flex items-center justify-center h-80">
                <p className="text-sm text-muted-foreground">No data available</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={analytics.issuesByCategory}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value, percent }) =>
                      `${name}: ${(percent * 100).toFixed(0)}%`
                    }
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {analytics.issuesByCategory.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={ISSUE_COLORS[entry.name] || '#8884d8'}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Action Outcomes */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Actions Taken</CardTitle>
          </CardHeader>
          <CardContent>
            {analytics.actionOutcomes.length === 0 ? (
              <div className="flex items-center justify-center h-80">
                <p className="text-sm text-muted-foreground">No data available</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={analytics.actionOutcomes}
                  layout="vertical"
                  margin={{ left: 150 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis type="number" stroke="hsl(var(--muted-foreground))" />
                  <YAxis
                    dataKey="name"
                    type="category"
                    stroke="hsl(var(--muted-foreground))"
                    style={{ fontSize: '12px' }}
                    width={140}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '6px',
                    }}
                  />
                  <Bar dataKey="value" fill="hsl(var(--primary))" radius={[0, 8, 8, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Call Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Call Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analytics.statusDistribution.map((status) => {
                const percentage =
                  analytics.totalCalls > 0
                    ? Math.round((status.value / analytics.totalCalls) * 100)
                    : 0;
                return (
                  <div key={status.name}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium capitalize">{status.name}</span>
                      <span className="text-sm text-muted-foreground">
                        {status.value} ({percentage}%)
                      </span>
                    </div>
                    <div className="w-full bg-secondary rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Issues Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Top Issue Categories</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {analytics.issuesByCategory.slice(0, 10).map((issue, idx) => (
              <div key={issue.name} className="flex items-center justify-between p-2 hover:bg-secondary/50 rounded">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-muted-foreground">#{idx + 1}</span>
                  <span className="text-sm font-medium capitalize">{issue.name}</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-sm text-muted-foreground">
                    {issue.value} calls
                  </div>
                  <div className="w-24 bg-secondary rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full"
                      style={{
                        width: `${
                          analytics.issuesByCategory[0]
                            ? (issue.value / analytics.issuesByCategory[0].value) * 100
                            : 0
                        }%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}