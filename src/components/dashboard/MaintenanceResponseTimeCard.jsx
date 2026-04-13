import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Clock, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function MaintenanceResponseTimeCard({ responseTimeData }) {
  if (!responseTimeData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-amber-600" />
            Avg Response Time
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">Loading...</p>
        </CardContent>
      </Card>
    );
  }

  const {
    averageResponseTime = 0,
    averageCompletionTime = 0,
    totalRequests = 0,
    pendingRequests = 0,
    overduePriority = 0,
    responseTimeTrend = [],
    byPriority = [],
  } = responseTimeData;

  const getStatusColor = (hours) => {
    if (hours <= 24) return 'text-green-600';
    if (hours <= 48) return 'text-amber-600';
    return 'text-red-600';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-amber-600" />
            Maintenance Response Time
          </span>
          <span className={`text-2xl font-bold ${getStatusColor(averageResponseTime)}`}>
            {averageResponseTime.toFixed(1)}h
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status Grid */}
        <div className="grid grid-cols-2 gap-2">
          <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-xs text-muted-foreground">Total Requests</p>
            <p className="text-2xl font-bold text-blue-600">{totalRequests}</p>
          </div>
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <p className="text-xs text-muted-foreground">Pending</p>
            <p className="text-2xl font-bold">{pendingRequests}</p>
          </div>
          <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
            <p className="text-xs text-muted-foreground">Avg Completion</p>
            <p className="text-lg font-bold text-amber-600">{averageCompletionTime.toFixed(1)}h</p>
          </div>
          <div className={`p-3 rounded-lg border ${overduePriority > 0 ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'}`}>
            <p className="text-xs text-muted-foreground">High Priority</p>
            <p className={`text-lg font-bold ${overduePriority > 0 ? 'text-red-600' : 'text-green-600'}`}>
              {overduePriority}
            </p>
          </div>
        </div>

        {/* Response Time by Priority */}
        {byPriority.length > 0 && (
          <div>
            <p className="text-sm font-medium mb-2">Response Time by Priority</p>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={byPriority}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="priority" fontSize={12} />
                <YAxis label={{ value: 'Hours', angle: -90, position: 'insideLeft' }} fontSize={12} />
                <Tooltip formatter={(value) => `${value.toFixed(1)}h`} />
                <Bar dataKey="responseTime" fill="#f59e0b" name="Avg Response Time" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Trend Chart */}
        {responseTimeTrend.length > 0 && (
          <div>
            <p className="text-sm font-medium mb-2">30-Day Trend</p>
            <ResponsiveContainer width="100%" height={150}>
              <LineChart data={responseTimeTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" fontSize={10} />
                <YAxis fontSize={12} />
                <Tooltip formatter={(value) => `${value.toFixed(1)}h`} />
                <Line type="monotone" dataKey="avgTime" stroke="#f59e0b" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {overduePriority > 0 && (
          <div className="p-3 rounded-lg bg-red-50 border border-red-200 flex gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <div className="text-sm text-red-700">
              <p className="font-medium">{overduePriority} high-priority requests exceeding SLA</p>
              <p className="text-xs mt-1">Immediate action required</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}