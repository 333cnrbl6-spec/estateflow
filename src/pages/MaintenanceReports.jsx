import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import {
  TrendingUp, TrendingDown, Clock, DollarSign, AlertTriangle, CheckCircle,
  Building, Wrench, Calendar, Filter, Download, Loader2, Info
} from 'lucide-react';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FFC658', '#FF6B6B'];

export default function MaintenanceReports() {
  const [reportType, setReportType] = useState('recurring_issues');
  const [propertyId, setPropertyId] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const { data: properties = [] } = useQuery({
    queryKey: ['properties'],
    queryFn: () => base44.entities.Property.list(),
  });

  const { data: report, isLoading, error, refetch } = useQuery({
    queryKey: ['maintenance-report', reportType, propertyId, dateFrom, dateTo],
    queryFn: async () => {
      const response = await base44.functions.invoke('generateMaintenanceReports', {
        report_type: reportType,
        property_id: propertyId === 'all' ? null : propertyId,
        date_from: dateFrom || null,
        date_to: dateTo || null,
      });
      return response.data;
    },
  });

  const handleGenerate = () => {
    refetch();
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <TrendingUp className="w-7 h-7" /> Maintenance Analytics
          </h1>
          <p className="text-muted-foreground mt-1">Analyze maintenance performance and identify improvement opportunities</p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Report Type</label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recurring_issues">🔄 Recurring Issues</SelectItem>
                  <SelectItem value="turnaround_times">⏱️ Turnaround Times</SelectItem>
                  <SelectItem value="contractor_efficiency">👷 Contractor Efficiency</SelectItem>
                  <SelectItem value="cost_analysis">💰 Cost Analysis</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Property</label>
              <Select value={propertyId} onValueChange={setPropertyId}>
                <SelectTrigger>
                  <SelectValue placeholder="All Properties" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Properties</SelectItem>
                  {properties.map(p => (
                    <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">From Date</label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>

            <div className="flex items-end">
              <Button onClick={handleGenerate} disabled={isLoading} className="w-full gap-2">
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Filter className="w-4 h-4" />}
                Generate Report
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Report Content */}
      {isLoading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <span className="ml-3 text-muted-foreground">Generating report...</span>
        </div>
      )}

      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <p className="text-red-600">Error: {error.message}</p>
          </CardContent>
        </Card>
      )}

      {!isLoading && !error && report && (
        <>
          {/* Recurring Issues Report */}
          {reportType === 'recurring_issues' && <RecurringIssuesReport report={report} />}

          {/* Turnaround Times Report */}
          {reportType === 'turnaround_times' && <TurnaroundTimesReport report={report} />}

          {/* Contractor Efficiency Report */}
          {reportType === 'contractor_efficiency' && <ContractorEfficiencyReport report={report} />}

          {/* Cost Analysis Report */}
          {reportType === 'cost_analysis' && <CostAnalysisReport report={report} />}
        </>
      )}
    </div>
  );
}

function RecurringIssuesReport({ report }) {
  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          title="Orders Analyzed"
          value={report.summary.total_orders_analyzed}
          icon={Wrench}
          color="blue"
        />
        <StatCard
          title="Units with Recurring Issues"
          value={report.summary.units_with_recurring_issues}
          icon={AlertTriangle}
          color="amber"
        />
        <StatCard
          title="Most Common Category"
          value={report.summary.most_common_category}
          icon={TrendingUp}
          color="green"
        />
      </div>

      {/* Units with Recurring Issues */}
      {report.units_with_recurring_issues.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              Units with Recurring Issues
            </CardTitle>
            <CardDescription>Units experiencing repeated maintenance problems</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {report.units_with_recurring_issues.slice(0, 10).map((unit, idx) => (
                <div key={idx} className="border rounded-lg p-4 bg-slate-50">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-semibold">Unit {unit.unit_id}</p>
                      <p className="text-sm text-muted-foreground">{unit.total_requests} total requests</p>
                    </div>
                    <Badge variant="destructive">{unit.recurring_problems.length} recurring issues</Badge>
                  </div>
                  <div className="space-y-2">
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-1">Recurring Problems:</p>
                      <div className="flex flex-wrap gap-2">
                        {unit.recurring_problems.map((problem, i) => (
                          <Badge key={i} variant="secondary" className="text-xs">
                            {problem.issue} ({problem.count}x)
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-1">Top Categories:</p>
                      <div className="flex flex-wrap gap-2">
                        {unit.top_categories.map((cat, i) => (
                          <Badge key={i} className="text-xs bg-blue-100 text-blue-800">
                            {cat.category} ({cat.count})
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Category Analysis Chart */}
      {report.category_analysis.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Issues by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={report.category_analysis.slice(0, 10)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="category" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#8884d8" name="Issue Count" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function TurnaroundTimesReport({ report }) {
  const categoryData = report.average_by_category.map(cat => ({
    name: cat.category,
    'Avg Days': cat.avg_days,
    Min: cat.min_days,
    Max: cat.max_days,
  }));

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          title="Completed Orders"
          value={report.summary.total_completed_orders}
          icon={CheckCircle}
          color="green"
        />
        <StatCard
          title="Overall Avg Turnaround"
          value={`${report.summary.overall_avg_turnaround_days} days`}
          icon={Clock}
          color="blue"
        />
        <StatCard
          title="Fastest Completion"
          value={`${report.summary.min_turnaround_days} day(s)`}
          icon={TrendingUp}
          color="emerald"
        />
        <StatCard
          title="Slowest Completion"
          value={`${report.summary.max_turnaround_days} days`}
          icon={TrendingDown}
          color="amber"
        />
      </div>

      {/* Turnaround by Category */}
      {categoryData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Average Turnaround by Category</CardTitle>
            <CardDescription>Time from report to completion (in days)</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={categoryData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="Avg Days" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Fastest & Slowest */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-600">
              <TrendingUp className="w-5 h-5" /> Fastest Completions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {report.fastest_completions.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center text-sm border-b pb-2 last:border-0">
                  <span className="text-muted-foreground">{item.category}</span>
                  <Badge className="bg-green-100 text-green-800">{item.total_turnaround_days} days</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-600">
              <TrendingDown className="w-5 h-5" /> Slowest Completions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {report.slowest_completions.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center text-sm border-b pb-2 last:border-0">
                  <span className="text-muted-foreground">{item.category}</span>
                  <Badge className="bg-amber-100 text-amber-800">{item.total_turnaround_days} days</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function ContractorEfficiencyReport({ report }) {
  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <StatCard
          title="Total Contractors"
          value={report.summary.total_contractors}
          icon={Wrench}
          color="blue"
        />
        <StatCard
          title="Total Jobs Assigned"
          value={report.summary.total_jobs_assigned}
          icon={Calendar}
          color="green"
        />
      </div>

      {/* Contractor Rankings */}
      <Card>
        <CardHeader>
          <CardTitle>Contractor Performance Rankings</CardTitle>
          <CardDescription>Ranked by cost-efficiency score (completion rate, cost, turnaround)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {report.contractor_rankings.map((contractor, idx) => (
              <div
                key={idx}
                className="border rounded-lg p-4 flex items-center justify-between hover:bg-slate-50"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${
                    idx === 0 ? 'bg-yellow-500' : idx === 1 ? 'bg-gray-400' : idx === 2 ? 'bg-amber-600' : 'bg-slate-300'
                  }`}>
                    {idx + 1}
                  </div>
                  <div>
                    <p className="font-semibold">{contractor.contractor_name || 'Unnamed Contractor'}</p>
                    <div className="flex gap-3 text-sm text-muted-foreground mt-1">
                      <span>{contractor.total_jobs} jobs</span>
                      <span>•</span>
                      <span>{contractor.completion_rate}% completion</span>
                      {contractor.avg_turnaround_days && (
                        <>
                          <span>•</span>
                          <span>{contractor.avg_turnaround_days}d avg</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <Badge className="text-lg mb-1" style={{ backgroundColor: getScoreColor(contractor.cost_efficiency_score) }}>
                    {contractor.cost_efficiency_score}
                  </Badge>
                  <p className="text-xs text-muted-foreground">Efficiency Score</p>
                  <p className="text-sm font-medium mt-1">£{contractor.avg_cost_per_job}/job</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function CostAnalysisReport({ report }) {
  const categoryData = report.cost_by_category.map(cat => ({
    name: cat.category,
    Actual: cat.actual_total,
    Estimated: cat.estimated_total,
  }));

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          title="Total Orders"
          value={report.summary.total_orders}
          icon={Wrench}
          color="blue"
        />
        <StatCard
          title="Total Actual Cost"
          value={`£${report.summary.total_actual_cost.toLocaleString()}`}
          icon={DollarSign}
          color="green"
        />
        <StatCard
          title="Total Estimated"
          value={`£${report.summary.total_estimated_cost.toLocaleString()}`}
          icon={DollarSign}
          color="blue"
        />
        <StatCard
          title="Variance"
          value={`${report.summary.variance_percent}%`}
          icon={report.summary.variance >= 0 ? TrendingUp : TrendingDown}
          color={report.summary.variance >= 0 ? 'green' : 'red'}
        />
      </div>

      {/* Cost by Category */}
      {categoryData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Cost Analysis by Category</CardTitle>
            <CardDescription>Estimated vs Actual costs</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={categoryData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="Estimated" fill="#8884d8" />
                <Bar dataKey="Actual" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Top Properties by Cost */}
      {report.cost_by_property.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Top Properties by Maintenance Cost</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {report.cost_by_property.slice(0, 10).map((prop, idx) => (
                <div key={idx} className="flex justify-between items-center border-b pb-2 last:border-0">
                  <span className="text-sm font-medium">Property {prop.property_id}</span>
                  <div className="text-right">
                    <p className="font-semibold">£{prop.total_cost.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">{prop.count} jobs</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function StatCard({ title, value, icon: Icon, color }) {
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    amber: 'bg-amber-100 text-amber-600',
    red: 'bg-red-100 text-red-600',
    emerald: 'bg-emerald-100 text-emerald-600',
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold mt-1">{value}</p>
          </div>
          <div className={`p-3 rounded-full ${colorClasses[color] || colorClasses.blue}`}>
            <Icon className="w-5 h-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function getScoreColor(score) {
  if (score >= 80) return '#22c55e';
  if (score >= 60) return '#84cc16';
  if (score >= 40) return '#eab308';
  return '#ef4444';
}