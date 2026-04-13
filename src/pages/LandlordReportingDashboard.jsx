import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import {
  TrendingUp, Home, AlertTriangle, CheckCircle2, Wrench, PoundSterling,
  Calendar, Loader2, Download, RefreshCw, Sparkles, Shield, Users, DollarSign
} from 'lucide-react';

const COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#06b6d4'];

function StatCard({ label, value, subtext, icon: Icon, color }) {
  return (
    <Card>
      <CardContent className="pt-5 pb-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground mb-1">{label}</p>
            <p className={`text-2xl font-bold ${color}`}>{value}</p>
            {subtext && <p className="text-xs text-muted-foreground mt-1">{subtext}</p>}
          </div>
          <Icon className={`w-6 h-6 ${color} opacity-50`} />
        </div>
      </CardContent>
    </Card>
  );
}

export default function LandlordReportingDashboard() {
  const qc = useQueryClient();
  const [monthsBack, setMonthsBack] = useState(3);
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState(null);
  const [error, setError] = useState(null);

  const generateReport = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await base44.functions.invoke('generateLandlordReports', { months_back: monthsBack });
      setReport(res.data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const downloadReport = () => {
    if (!report) return;
    const csv = generateCSV(report);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `landlord-report-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const generateCSV = (data) => {
    const rows = [];
    rows.push(['Landlord Portfolio Report', data.generated_date]);
    rows.push(['Period', data.period]);
    rows.push([]);

    rows.push(['PROPERTY PERFORMANCE']);
    rows.push(['Property', 'Total Units', 'Occupied', 'Occupancy %', 'Income', 'Expenses', 'Net Return']);
    data.property_performance?.forEach(p => {
      rows.push([p.property_name, p.total_units, p.occupied_units, p.occupancy_rate, p.rental_income, p.expenses, p.net_return]);
    });
    rows.push([]);

    rows.push(['MAINTENANCE COSTS BY CATEGORY']);
    rows.push(['Category', 'Total Cost']);
    Object.entries(data.maintenance_breakdown?.by_category || {}).forEach(([cat, cost]) => {
      rows.push([cat, cost]);
    });
    rows.push([]);

    rows.push(['TENANT ARREARS']);
    rows.push(['Tenant', 'Total Arrears', 'Days Overdue']);
    data.arrears?.top_arrears?.forEach(a => {
      const daysOverdue = a.oldest_arrears_date ? Math.floor((Date.now() - new Date(a.oldest_arrears_date)) / 86400000) : 0;
      rows.push([a.tenant_name, a.total_arrears, daysOverdue]);
    });

    return rows.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-primary" /> Landlord Reporting Dashboard
          </h1>
          <p className="text-sm text-muted-foreground mt-1">AI-powered portfolio insights and performance analytics</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={monthsBack.toString()} onValueChange={v => setMonthsBack(parseInt(v))}>
            <SelectTrigger className="w-40">
              <Calendar className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">Last 1 Month</SelectItem>
              <SelectItem value="3">Last 3 Months</SelectItem>
              <SelectItem value="6">Last 6 Months</SelectItem>
              <SelectItem value="12">Last 12 Months</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={generateReport} disabled={loading} className="gap-2">
            {loading ? <><Loader2 className="w-4 h-4 animate-spin" />Generating…</> : <><Sparkles className="w-4 h-4" />Generate Report</>}
          </Button>
          {report && (
            <Button variant="outline" onClick={downloadReport} className="gap-2">
              <Download className="w-4 h-4" /> Export CSV
            </Button>
          )}
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-700 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4" /> {error}
        </div>
      )}

      {report && (
        <>
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <StatCard
              label="Total Rental Income"
              value={`£${(report.property_performance?.reduce((s, p) => s + p.rental_income, 0) || 0).toLocaleString()}`}
              icon={DollarSign}
              color="text-green-700"
            />
            <StatCard
              label="Total Expenses"
              value={`£${(report.maintenance_breakdown?.total_spent || 0).toLocaleString()}`}
              icon={Wrench}
              color="text-orange-700"
            />
            <StatCard
              label="Tenant Arrears"
              value={`£${report.arrears?.total_arrears?.toLocaleString()}`}
              subtext={`${report.arrears?.tenants_in_arrears || 0} tenants`}
              icon={AlertTriangle}
              color={report.arrears?.total_arrears > 0 ? 'text-red-700' : 'text-slate-700'}
            />
            <StatCard
              label="Avg Occupancy"
              value={`${(report.property_performance?.reduce((s, p) => s + p.occupancy_rate, 0) / (report.property_performance?.length || 1)).toFixed(1)}%`}
              icon={Users}
              color="text-blue-700"
            />
          </div>

          {/* Property Performance */}
          {report.property_performance && report.property_performance.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Home className="w-5 h-5" /> Property Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={report.property_performance.slice(0, 8)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="property_name" angle={-45} textAnchor="end" height={100} />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Legend />
                    <Bar yAxisId="left" dataKey="rental_income" fill="#10b981" name="Income" />
                    <Bar yAxisId="left" dataKey="expenses" fill="#ef4444" name="Expenses" />
                  </BarChart>
                </ResponsiveContainer>
                <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-2 text-xs">
                  {report.property_performance.map(p => (
                    <div key={p.property_id} className="bg-slate-50 rounded-lg p-3">
                      <p className="font-semibold text-slate-800">{p.property_name}</p>
                      <div className="mt-1 space-y-0.5 text-muted-foreground">
                        <p>Occupancy: <span className="font-bold text-slate-700">{p.occupancy_rate}%</span></p>
                        <p>Units: {p.occupied_units}/{p.total_units}</p>
                        <p className={p.net_return > 0 ? 'text-green-700' : 'text-red-700'}>
                          Net: £{p.net_return.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Maintenance Costs */}
          {report.maintenance_breakdown?.by_category && Object.keys(report.maintenance_breakdown.by_category).length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Wrench className="w-5 h-5" /> Maintenance by Category
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie data={Object.entries(report.maintenance_breakdown.by_category).map(([k, v]) => ({ name: k, value: v }))} cx="50%" cy="50%" labelLine={false} label={({ name }) => name} outerRadius={80} fill="#8884d8" dataKey="value">
                        {Object.entries(report.maintenance_breakdown.by_category).map((_, i) => (
                          <Cell key={`cell-${i}`} fill={COLORS[i % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <PoundSterling className="w-5 h-5" /> Costs by Category
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {Object.entries(report.maintenance_breakdown.by_category)
                      .sort((a, b) => b[1] - a[1])
                      .map(([cat, cost], i) => (
                        <div key={cat} className="flex items-center justify-between py-2 border-b last:border-b-0">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                            <span className="text-sm font-medium capitalize">{cat.replace(/_/g, ' ')}</span>
                          </div>
                          <span className="text-sm font-bold text-slate-900">£{Number(cost).toLocaleString()}</span>
                        </div>
                      ))}
                    <div className="flex items-center justify-between py-3 border-t-2 font-bold">
                      <span>Total</span>
                      <span className="text-primary">£{report.maintenance_breakdown.total_spent.toLocaleString()}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Tenant Arrears */}
          {report.arrears && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <AlertTriangle className="w-5 h-5" /> Tenant Arrears Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="bg-red-50 rounded-lg p-3">
                    <p className="text-xs text-muted-foreground">Total Arrears</p>
                    <p className="text-2xl font-bold text-red-700">£{report.arrears.total_arrears.toLocaleString()}</p>
                  </div>
                  <div className="bg-orange-50 rounded-lg p-3">
                    <p className="text-xs text-muted-foreground">Tenants in Arrears</p>
                    <p className="text-2xl font-bold text-orange-700">{report.arrears.tenants_in_arrears}</p>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-3">
                    <p className="text-xs text-muted-foreground">Average per Tenant</p>
                    <p className="text-2xl font-bold text-slate-700">£{report.arrears.average_arrears.toLocaleString()}</p>
                  </div>
                </div>
                {report.arrears.top_arrears && report.arrears.top_arrears.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-muted-foreground">Top Arrears Cases</p>
                    {report.arrears.top_arrears.map((a, i) => (
                      <div key={i} className="flex items-center justify-between p-2 bg-slate-50 rounded-lg text-sm">
                        <div>
                          <p className="font-medium text-slate-800">{a.tenant_name}</p>
                          <p className="text-xs text-muted-foreground">{a.arrears_count} overdue payment(s)</p>
                        </div>
                        <span className="font-bold text-red-700">£{a.total_arrears.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Compliance Status */}
          {report.compliance && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Shield className="w-5 h-5" /> Compliance Status Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {Object.entries(report.compliance).map(([type, data]) => (
                    <div key={type} className={`rounded-lg border p-3 ${parseFloat(data.coverage_percent) === 100 ? 'bg-green-50 border-green-200' : 'bg-amber-50 border-amber-200'}`}>
                      <p className="text-xs font-semibold text-slate-800 capitalize mb-1">{type.replace(/_/g, ' ')}</p>
                      <p className={`text-2xl font-bold ${parseFloat(data.coverage_percent) === 100 ? 'text-green-700' : 'text-amber-700'}`}>
                        {data.coverage_percent}%
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {data.properties_with_valid} of {data.properties_with_doc} properties
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* AI Insights */}
          {report.insights && report.insights.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Sparkles className="w-5 h-5" /> AI Insights & Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {report.insights.map((insight, i) => (
                    <div key={i} className="flex gap-3 pb-3 border-b last:border-b-0">
                      <Badge className={`shrink-0 capitalize ${
                        insight.priority === 'high' ? 'bg-red-100 text-red-700' :
                        insight.priority === 'medium' ? 'bg-amber-100 text-amber-700' :
                        'bg-slate-100 text-slate-700'
                      }`}>
                        {insight.priority}
                      </Badge>
                      <p className="text-sm text-slate-700">{insight.insight}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {!report && !error && !loading && (
        <Card>
          <CardContent className="text-center py-12">
            <TrendingUp className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">Click "Generate Report" to create your AI-powered portfolio analysis.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}