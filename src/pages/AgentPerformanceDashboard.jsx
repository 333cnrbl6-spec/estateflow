import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
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
  AreaChart,
  Area
} from "recharts";
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  DollarSign, 
  Clock, 
  Target,
  Award,
  Activity,
  Calendar,
  Download,
  Filter,
  BarChart3,
  PieChart as PieChartIcon,
  LineChart as LineChartIcon
} from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

// Helper functions
const transformMonthlyData = (monthlyData) => {
  if (!monthlyData) return [];
  return Object.entries(monthlyData).map(([month, count]) => ({
    month: format(new Date(month + '-01'), 'MMM yyyy'),
    leads: count,
    sales: Math.round(count * 0.3),
  }));
};

export default function AgentPerformanceDashboard() {
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [dateRange, setDateRange] = useState('all');
  const [viewType, setViewType] = useState('overview');

  const { data: performanceData, isLoading } = useQuery({
    queryKey: ['agent-performance', selectedAgent, dateRange],
    queryFn: async () => {
      const response = await base44.functions.invoke('calculateAgentPerformance', {
        agent_id: selectedAgent,
        date_range: dateRange,
      });
      return response.data;
    },
  });

  const metrics = performanceData?.metrics;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-muted border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading performance data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold mb-2">Agent Performance Analytics</h1>
          <p className="text-muted-foreground">Track key metrics and identify improvement opportunities</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <Download className="w-4 h-4" />
            Export Report
          </Button>
          <Button variant="outline" className="gap-2">
            <Filter className="w-4 h-4" />
            Customize
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">Date Range:</label>
              <select 
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="border rounded-md px-3 py-2 text-sm"
              >
                <option value="all">All Time</option>
                <option value="30_days">Last 30 Days</option>
                <option value="90_days">Last 90 Days</option>
                <option value="1_year">Last Year</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">View:</label>
              <select 
                value={viewType}
                onChange={(e) => setViewType(e.target.value)}
                className="border rounded-md px-3 py-2 text-sm"
              >
                <option value="overview">Overview</option>
                <option value="charts">Charts</option>
                <option value="trends">Trends</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Lead Conversion Rate"
          value={`${metrics?.lead_conversion.conversion_rate || 0}%`}
          icon={Target}
          trend={`${metrics?.lead_conversion.converted_leads || 0}/${metrics?.lead_conversion.total_leads || 0} leads`}
          color="blue"
        />
        <MetricCard
          title="Offer-to-Sale Ratio"
          value={`${metrics?.offer_to_sale.completion_rate || 0}%`}
          icon={Award}
          trend={`${metrics?.offer_to_sale.completed_sales || 0} completed`}
          color="green"
        />
        <MetricCard
          title="Avg Time on Market"
          value={`${metrics?.time_on_market.average_days || 0} days`}
          icon={Clock}
          trend={`Median: ${metrics?.time_on_market.median_days || 0} days`}
          color="orange"
        />
        <MetricCard
          title="Total Value Sold"
          value={`£${(metrics?.summary.total_value_sold / 1000000).toFixed(2)}M`}
          icon={DollarSign}
          trend={`${metrics?.summary.deals_in_pipeline || 0} in pipeline`}
          color="purple"
        />
      </div>

      {/* Main Content */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="leads">Lead Analytics</TabsTrigger>
          <TabsTrigger value="sales">Sales Performance</TabsTrigger>
          <TabsTrigger value="outreach">Outreach</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Lead Conversion Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Lead Conversion by Priority
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Hot', value: metrics?.lead_conversion.by_priority.hot || 0 },
                        { name: 'Warm', value: metrics?.lead_conversion.by_priority.warm || 0 },
                        { name: 'Cold', value: metrics?.lead_conversion.by_priority.cold || 0 },
                      ]}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      <Cell fill="#ef4444" />
                      <Cell fill="#f59e0b" />
                      <Cell fill="#3b82f6" />
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Lead Source Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  Leads by Source
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    data={Object.entries(metrics?.lead_conversion.by_source || {}).map(([name, value]) => ({ name, value }))}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Sales Pipeline */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Sales Pipeline Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-4">
                <PipelineStat
                  label="Completed"
                  value={metrics?.offer_to_sale.completed_sales || 0}
                  color="green"
                />
                <PipelineStat
                  label="Pending"
                  value={metrics?.offer_to_sale.pending || 0}
                  color="blue"
                />
                <PipelineStat
                  label="Fallen Through"
                  value={metrics?.offer_to_sale.fallen_through || 0}
                  color="red"
                />
                <PipelineStat
                  label="Total"
                  value={metrics?.offer_to_sale.total_offers || 0}
                  color="gray"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="leads">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Lead Conversion Funnel</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <FunnelRow label="Total Leads" value={metrics?.lead_conversion.total_leads || 0} percent={100} />
                  <FunnelRow label="Contacted" value={Math.round((metrics?.lead_conversion.total_leads || 0) * 0.8)} percent={80} />
                  <FunnelRow label="Qualified" value={Math.round((metrics?.lead_conversion.total_leads || 0) * 0.6)} percent={60} />
                  <FunnelRow label="Converted" value={metrics?.lead_conversion.converted_leads || 0} percent={metrics?.lead_conversion.conversion_rate || 0} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Priority Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <PriorityBar label="Hot Leads" value={metrics?.lead_conversion.by_priority.hot || 0} color="bg-red-500" />
                  <PriorityBar label="Warm Leads" value={metrics?.lead_conversion.by_priority.warm || 0} color="bg-yellow-500" />
                  <PriorityBar label="Cold Leads" value={metrics?.lead_conversion.by_priority.cold || 0} color="bg-blue-500" />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="sales">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Time on Market Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Average Days</span>
                    <span className="text-2xl font-bold">{metrics?.time_on_market.average_days || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Median Days</span>
                    <span className="text-2xl font-bold">{metrics?.time_on_market.median_days || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Fastest Sale</span>
                    <span className="text-lg font-semibold text-green-600">TBD</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Slowest Sale</span>
                    <span className="text-lg font-semibold text-red-600">TBD</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Revenue Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-green-50 rounded-lg">
                    <p className="text-sm text-muted-foreground">Total Value Sold</p>
                    <p className="text-3xl font-bold text-green-700">
                      £{(metrics?.summary.total_value_sold / 1000000).toFixed(2)}M
                    </p>
                  </div>
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm text-muted-foreground">Active Listings Value</p>
                    <p className="text-3xl font-bold text-blue-700">
                      £{(metrics?.summary.active_listings_value / 1000000).toFixed(2)}M
                    </p>
                  </div>
                  <div className="p-4 bg-purple-50 rounded-lg">
                    <p className="text-sm text-muted-foreground">Deals in Pipeline</p>
                    <p className="text-3xl font-bold text-purple-700">
                      {metrics?.summary.deals_in_pipeline || 0}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="outreach">
          <Card>
            <CardHeader>
              <CardTitle>Communication Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <CommunicationStat
                  label="Total Communications"
                  value={metrics?.outreach.total_communications || 0}
                  icon={Activity}
                />
                <CommunicationStat
                  label="Avg Response Time"
                  value={`${metrics?.outreach.avg_response_time || 'N/A'} hrs`}
                  icon={Clock}
                />
                <CommunicationStat
                  label="Response Rate"
                  value={`${metrics?.outreach.response_rate || 'N/A'}%`}
                  icon={Target}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LineChartIcon className="w-5 h-5" />
                Monthly Performance Trends
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart
                  data={transformMonthlyData(metrics?.trends.monthly_leads || {})}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Area 
                    type="monotone" 
                    dataKey="leads" 
                    stroke="#3b82f6" 
                    fill="#3b82f6" 
                    fillOpacity={0.3}
                    name="Leads"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="sales" 
                    stroke="#22c55e" 
                    fill="#22c55e" 
                    fillOpacity={0.3}
                    name="Sales"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Sub-components
function MetricCard({ title, value, icon: Icon, trend, color = "blue" }) {
  const colorClasses = {
    blue: "text-blue-600 bg-blue-50",
    green: "text-green-600 bg-green-50",
    orange: "text-orange-600 bg-orange-50",
    purple: "text-purple-600 bg-purple-50",
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-3xl font-bold mt-2">{value}</p>
            <p className="text-xs text-muted-foreground mt-1">{trend}</p>
          </div>
          <div className={cn("p-3 rounded-full", colorClasses[color])}>
            <Icon className="w-6 h-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function PipelineStat({ label, value, color }) {
  const colorClasses = {
    green: "bg-green-100 text-green-800",
    blue: "bg-blue-100 text-blue-800",
    red: "bg-red-100 text-red-800",
    gray: "bg-gray-100 text-gray-800",
  };

  return (
    <div className={`p-4 rounded-lg ${colorClasses[color]}`}>
      <p className="text-sm font-medium">{label}</p>
      <p className="text-3xl font-bold mt-1">{value}</p>
    </div>
  );
}

function FunnelRow({ label, value, percent }) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span>{label}</span>
        <span className="font-medium">{value}</span>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div 
          className="h-full bg-blue-600 rounded-full"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}

function PriorityBar({ label, value, color }) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span>{label}</span>
        <span className="font-medium">{value}</span>
      </div>
      <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full`} style={{ width: `${value > 0 ? 100 : 0}%` }} />
      </div>
    </div>
  );
}

function CommunicationStat({ label, value, icon: Icon }) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-blue-50 rounded-full">
            <Icon className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="text-2xl font-bold">{value}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}