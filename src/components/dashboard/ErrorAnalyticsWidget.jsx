import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, TrendingUp, Activity, AlertCircle } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { format, subDays, startOfDay } from 'date-fns';

export default function ErrorAnalyticsWidget() {
  const { data: errors = [] } = useQuery({
    queryKey: ['errorLogs'],
    queryFn: () => base44.entities.ErrorLog.list('-timestamp', 100)
  });

  // Calculate metrics
  const metrics = useMemo(() => {
    const last24h = errors.filter(e => {
      const created = new Date(e.timestamp);
      const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      return created >= dayAgo;
    });

    const bySeverity = {
      critical: errors.filter(e => e.severity === 'critical').length,
      high: errors.filter(e => e.severity === 'high').length,
      error: errors.filter(e => e.severity === 'error').length,
      warning: errors.filter(e => e.severity === 'warning').length
    };

    const byType = {};
    errors.forEach(e => {
      byType[e.error_type] = (byType[e.error_type] || 0) + 1;
    });

    // Timeline: errors per day (last 7 days)
    const timeline = [];
    for (let i = 6; i >= 0; i--) {
      const date = subDays(startOfDay(new Date()), i);
      const count = errors.filter(e => {
        const eDate = startOfDay(new Date(e.timestamp));
        return eDate.getTime() === date.getTime();
      }).length;
      timeline.push({
        date: format(date, 'MMM d'),
        count,
        critical: errors.filter(e => {
          const eDate = startOfDay(new Date(e.timestamp));
          return eDate.getTime() === date.getTime() && e.severity === 'critical';
        }).length
      });
    }

    return {
      total: errors.length,
      last24h: last24h.length,
      bySeverity,
      byType,
      timeline,
      unresolvedCount: errors.filter(e => e.status === 'new').length
    };
  }, [errors]);

  const severityColors = {
    critical: 'text-red-600',
    high: 'text-orange-600',
    error: 'text-yellow-600',
    warning: 'text-blue-600'
  };

  return (
    <div className="space-y-6">
      {/* Key metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Total Errors</p>
              <p className="text-2xl font-bold text-foreground">{metrics.total}</p>
              <p className="text-xs text-muted-foreground mt-1">{metrics.last24h} in 24h</p>
            </div>
          </CardContent>
        </Card>

        <Card className={metrics.bySeverity.critical > 0 ? 'border-red-200 bg-red-50/50' : ''}>
          <CardContent className="pt-6">
            <div className="text-center">
              <AlertTriangle className={`w-5 h-5 mx-auto mb-2 ${metrics.bySeverity.critical > 0 ? 'text-red-600' : 'text-muted-foreground'}`} />
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Critical</p>
              <p className="text-2xl font-bold text-red-600">{metrics.bySeverity.critical}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <AlertCircle className="w-5 h-5 mx-auto mb-2 text-orange-600" />
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">High</p>
              <p className="text-2xl font-bold text-orange-600">{metrics.bySeverity.high}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <Activity className="w-5 h-5 mx-auto mb-2 text-blue-600" />
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Unresolved</p>
              <p className="text-2xl font-bold text-blue-600">{metrics.unresolvedCount}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Timeline chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Error Trend (7 days)</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={metrics.timeline}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220,13%,89%)" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="count" stroke="hsl(222,47%,15%)" name="All Errors" strokeWidth={2} />
              <Line type="monotone" dataKey="critical" stroke="hsl(0,72%,51%)" name="Critical" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Error types breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">By Error Type</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {Object.entries(metrics.byType)
              .sort(([, a], [, b]) => b - a)
              .slice(0, 5)
              .map(([type, count]) => (
                <div key={type} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <div className="w-2 h-2 rounded-full bg-primary shrink-0" />
                    <span className="text-foreground truncate">{type.replace(/_/g, ' ')}</span>
                  </div>
                  <span className="font-semibold text-foreground shrink-0">{count}</span>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>

      {/* Severity breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">By Severity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {Object.entries(metrics.bySeverity)
              .sort(([, a], [, b]) => b - a)
              .map(([severity, count]) => (
                <div key={severity} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${
                      severity === 'critical' ? 'bg-red-600' :
                      severity === 'high' ? 'bg-orange-600' :
                      severity === 'error' ? 'bg-yellow-600' :
                      'bg-blue-600'
                    }`} />
                    <span className="text-foreground capitalize">{severity}</span>
                  </div>
                  <span className={`font-semibold ${severityColors[severity]}`}>{count}</span>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}