import React, { useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, AlertTriangle, Clock, Zap, TrendingUp } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { format, parseISO } from 'date-fns';

const COLORS = ['#10b981', '#ef4444', '#f59e0b'];

export default function CompaniesHouseSyncDashboard() {
  const { data: profiles = [], isLoading: profilesLoading } = useQuery({
    queryKey: ['companies-house-profiles'],
    queryFn: () => base44.entities.CompaniesHouseProfile?.list?.('-last_synced', 100) || Promise.resolve([])
  });

  const { data: metrics = [], isLoading: metricsLoading } = useQuery({
    queryKey: ['performance-metrics-ch'],
    queryFn: async () => {
      const allMetrics = await base44.entities.PerformanceMetric?.list?.('-recorded_at', 500) || [];
      return allMetrics.filter(m => m.name?.includes('Companies') || m.name?.includes('companies'));
    }
  });

  const { data: auditLogs = [], isLoading: auditLoading } = useQuery({
    queryKey: ['audit-logs-ch'],
    queryFn: async () => {
      const logs = await base44.entities.AuditLog?.list?.('-timestamp', 200) || [];
      return logs.filter(l => l.entity_type === 'CompaniesHouseProfile');
    }
  });

  const syncStats = useMemo(() => {
    const successful = profiles.filter(p => !p.sync_error).length;
    const failed = profiles.filter(p => p.sync_error).length;
    const overdue = profiles.filter(p => {
      const nextDue = p.next_sync_due ? new Date(p.next_sync_due) : new Date();
      return nextDue < new Date();
    }).length;

    return {
      total: profiles.length,
      successful,
      failed,
      overdue,
      successRate: profiles.length > 0 ? ((successful / profiles.length) * 100).toFixed(1) : 0
    };
  }, [profiles]);

  const apiPerformance = useMemo(() => {
    if (metrics.length === 0) return [];
    
    const last30 = metrics.slice(0, 30).reverse();
    const grouped = {};
    
    last30.forEach(m => {
      const date = m.recorded_at ? format(parseISO(m.recorded_at), 'dd MMM') : 'Unknown';
      if (!grouped[date]) {
        grouped[date] = { date, success: 0, error: 0, avgTime: 0, count: 0, totalTime: 0 };
      }
      grouped[date].count++;
      grouped[date].totalTime += m.duration_ms || 0;
      if (m.status === 'success') grouped[date].success++;
      else grouped[date].error++;
    });

    return Object.values(grouped).map(g => ({
      ...g,
      avgTime: Math.round(g.totalTime / g.count)
    }));
  }, [metrics]);

  const errorBreakdown = useMemo(() => {
    const errors = profiles.filter(p => p.sync_error).map(p => p.sync_error);
    const breakdown = {};
    
    errors.forEach(err => {
      const type = err?.split(':')[0]?.slice(0, 30) || 'Unknown';
      breakdown[type] = (breakdown[type] || 0) + 1;
    });

    return Object.entries(breakdown).map(([name, value]) => ({ name, value }));
  }, [profiles]);

  const recentSyncs = useMemo(() => {
    return profiles
      .filter(p => p.last_synced)
      .sort((a, b) => new Date(b.last_synced) - new Date(a.last_synced))
      .slice(0, 10);
  }, [profiles]);

  const alertBreakdown = useMemo(() => {
    const types = {};
    profiles.forEach(p => {
      if (p.critical_alerts?.length > 0) {
        p.critical_alerts.forEach(alert => {
          types[alert.type] = (types[alert.type] || 0) + 1;
        });
      }
    });
    return Object.entries(types).map(([type, count]) => ({
      type: type.replace(/_/g, ' '),
      count
    }));
  }, [profiles]);

  if (profilesLoading || metricsLoading || auditLoading) {
    return (
      <div className="p-6 flex justify-center">
        <div className="text-center">
          <Clock className="w-8 h-8 animate-spin mx-auto mb-2 text-slate-400" />
          <p className="text-slate-600">Loading sync data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Companies House Sync Performance</h1>
        <p className="text-slate-600">Real-time monitoring of Companies House data synchronization</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-blue-900">Total Companies</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-900">{syncStats.total}</div>
          </CardContent>
        </Card>

        <Card className="border-green-200 bg-green-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-green-900 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              Successful
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-900">{syncStats.successful}</div>
            <p className="text-xs text-green-700 mt-1">{syncStats.successRate}% success rate</p>
          </CardContent>
        </Card>

        <Card className="border-red-200 bg-red-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-red-900 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              Failed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-900">{syncStats.failed}</div>
            <p className="text-xs text-red-700 mt-1">requires attention</p>
          </CardContent>
        </Card>

        <Card className="border-amber-200 bg-amber-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-amber-900 flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Overdue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-amber-900">{syncStats.overdue}</div>
            <p className="text-xs text-amber-700 mt-1">past sync schedule</p>
          </CardContent>
        </Card>
      </div>

      {/* API Performance */}
      {apiPerformance.length > 0 && (
        <Card className="border-slate-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-500" />
              API Performance (Last 30 Calls)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={apiPerformance}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis yAxisId="left" tick={{ fontSize: 11 }} label={{ value: 'Response Time (ms)', angle: -90, position: 'insideLeft' }} />
                <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} label={{ value: 'Status Count', angle: 90, position: 'insideRight' }} />
                <Tooltip />
                <Legend />
                <Line yAxisId="left" type="monotone" dataKey="avgTime" stroke="#3b82f6" name="Avg Response Time (ms)" strokeWidth={2} />
                <Line yAxisId="right" type="stepAfter" dataKey="success" stroke="#10b981" name="Successful Calls" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Error Breakdown */}
        {errorBreakdown.length > 0 && (
          <Card className="border-slate-200">
            <CardHeader>
              <CardTitle>Error Types</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={errorBreakdown}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} angle={-45} textAnchor="end" height={80} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#ef4444" name="Occurrences" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Alert Types */}
        {alertBreakdown.length > 0 && (
          <Card className="border-slate-200">
            <CardHeader>
              <CardTitle>Critical Alerts Detected</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={alertBreakdown} dataKey="count" nameKey="type" cx="50%" cy="50%" outerRadius={100} label={{ fontSize: 11 }}>
                    {alertBreakdown.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Recent Syncs */}
      <Card className="border-slate-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-500" />
            Recent Sync History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-3 px-3 font-semibold text-slate-700">Company</th>
                  <th className="text-left py-3 px-3 font-semibold text-slate-700">Last Synced</th>
                  <th className="text-left py-3 px-3 font-semibold text-slate-700">Next Due</th>
                  <th className="text-left py-3 px-3 font-semibold text-slate-700">Status</th>
                  <th className="text-left py-3 px-3 font-semibold text-slate-700">Alerts</th>
                </tr>
              </thead>
              <tbody>
                {recentSyncs.map(profile => (
                  <tr key={profile.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="py-3 px-3 font-medium text-slate-900">{profile.company_name}</td>
                    <td className="py-3 px-3 text-slate-600">
                      {profile.last_synced ? format(parseISO(profile.last_synced), 'dd MMM yyyy HH:mm') : 'Never'}
                    </td>
                    <td className="py-3 px-3 text-slate-600">
                      {profile.next_sync_due ? format(parseISO(profile.next_sync_due), 'dd MMM yyyy') : '-'}
                    </td>
                    <td className="py-3 px-3">
                      {profile.sync_error ? (
                        <Badge className="bg-red-100 text-red-800 border-red-200">Error</Badge>
                      ) : (
                        <Badge className="bg-green-100 text-green-800 border-green-200">Success</Badge>
                      )}
                    </td>
                    <td className="py-3 px-3">
                      {profile.critical_alerts?.length > 0 ? (
                        <Badge variant="destructive">{profile.critical_alerts.length} active</Badge>
                      ) : (
                        <span className="text-slate-500">None</span>
                      )}
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