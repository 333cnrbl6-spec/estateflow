/**
 * PerformanceMetricsDashboard — Real-time system performance monitoring
 * Displays latencies, error rates, and slowest operations
 */

import { useState, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { Activity, AlertTriangle, Zap, TrendingUp, RotateCw } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const METRIC_COLORS = {
  query_time: '#3b82f6',
  function_call: '#10b981',
  api_response: '#f59e0b',
  entity_operation: '#8b5cf6',
  page_load: '#ec4899',
};

export default function PerformanceMetricsDashboard() {
  const [autoRefresh, setAutoRefresh] = useState(true);

  const { data: stats, isLoading, refetch } = useQuery({
    queryKey: ['performance-stats'],
    queryFn: () => base44.functions.invoke('getPerformanceStats', {}),
    refetchInterval: autoRefresh ? 30000 : false, // Refresh every 30s
  });

  const metricsData = useMemo(() => {
    if (!stats) return [];
    return Object.entries(stats.stats || {}).map(([type, data]) => ({
      name: type.replace(/_/g, ' '),
      p50: data.p50,
      p95: data.p95,
      p99: data.p99,
      avg: data.avg,
      count: data.total_operations,
      errorRate: parseFloat(data.error_rate),
      color: METRIC_COLORS[type] || '#6b7280',
    }));
  }, [stats]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-6 flex items-center justify-center">
        <div className="text-center">
          <Activity className="w-8 h-8 animate-spin mx-auto mb-2 text-primary" />
          <p className="text-muted-foreground">Loading metrics...</p>
        </div>
      </div>
    );
  }

  const statsList = stats?.stats || {};
  const slowestOps = stats?.slowest || [];
  const errorLogs = stats?.errors || [];

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
              <Activity className="w-8 h-8 text-primary" />
              Performance Monitor
            </h1>
            <p className="text-sm text-muted-foreground mt-1">Last {stats?.total_metrics} operations</p>
          </div>
          <div className="flex items-center gap-2">
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                className="rounded"
              />
              Auto-refresh (30s)
            </label>
            <Button size="sm" variant="outline" onClick={() => refetch()}>
              <RotateCw className="w-4 h-4 mr-1" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Latency Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-blue-500" />
              Latency Overview (ms)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={metricsData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} tick={{ fontSize: 12 }} />
                  <YAxis label={{ value: 'ms', angle: -90, position: 'insideLeft' }} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="p50" fill="#3b82f6" name="P50" />
                  <Bar dataKey="p95" fill="#f59e0b" name="P95" />
                  <Bar dataKey="p99" fill="#ef4444" name="P99" />
                </BarChart>
              </ResponsiveContainer>

              <div className="space-y-3">
                {metricsData.map((metric) => {
                  const data = statsList[metric.name.replace(/ /g, '_')];
                  return (
                    <div key={metric.name} className="p-3 rounded-lg bg-muted/50 border">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-semibold text-sm">{metric.name}</h4>
                        <Badge variant="outline" className="text-[10px]">{metric.count} ops</Badge>
                      </div>
                      <div className="text-xs text-muted-foreground space-y-1">
                        <div>
                          <span className="opacity-60">Avg:</span> {metric.avg.toFixed(0)}ms
                          <span className="ml-3 opacity-60">P95:</span> {metric.p95.toFixed(0)}ms
                        </div>
                        <div className="flex items-center gap-1">
                          <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full bg-green-500"
                              style={{ width: `${Math.min(100, (metric.p50 / metric.p99) * 100)}%` }}
                            />
                          </div>
                          <span className="text-[9px]">p50</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Error Rate & Success */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {metricsData.map((metric) => {
            const data = statsList[metric.name.replace(/ /g, '_')];
            return (
              <Card key={metric.name}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-semibold mb-1">{metric.name}</p>
                      <p className="text-2xl font-bold">{metric.errorRate.toFixed(1)}%</p>
                      <p className="text-xs text-muted-foreground mt-1">Error rate</p>
                    </div>
                    {metric.errorRate > 5 ? (
                      <AlertTriangle className="w-5 h-5 text-orange-500" />
                    ) : (
                      <Activity className="w-5 h-5 text-green-500" />
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Slowest Operations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-orange-500" />
              Slowest Operations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {slowestOps.length === 0 ? (
                <p className="text-sm text-muted-foreground">No slow operations recorded</p>
              ) : (
                slowestOps.map((op, i) => (
                  <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                    <div className="flex-1 min-w-0">
                      <p className="font-mono text-sm truncate">{op.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {op.entity} {op.operation && `• ${op.operation}`}
                      </p>
                    </div>
                    <Badge className="shrink-0 ml-2">
                      {op.duration_ms.toFixed(0)}ms
                    </Badge>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Errors */}
        {errorLogs.length > 0 && (
          <Card className="border-destructive/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-destructive" />
                Recent Errors ({errorLogs.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {errorLogs.map((err, i) => (
                  <div key={i} className="p-2 rounded-lg bg-destructive/10 border border-destructive/20">
                    <p className="font-mono text-sm text-destructive">{err.name}</p>
                    <p className="text-xs text-destructive/80 mt-1">{err.error}</p>
                    <p className="text-[10px] text-muted-foreground mt-1">
                      {formatDistanceToNow(new Date(err.recorded_at), { addSuffix: true })}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}