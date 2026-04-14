import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Download, TrendingUp, DollarSign, AlertCircle } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';

export default function FinancialReportingModule() {
  const [selectedProperty, setSelectedProperty] = useState('');
  const [startDate, setStartDate] = useState('2025-01-01');
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedMetrics, setSelectedMetrics] = useState(['total_income', 'total_expenses']);
  const [forecastMonths, setForecastMonths] = useState(12);

  const { data: properties = [] } = useQuery({
    queryKey: ['properties-for-reports'],
    queryFn: () => base44.entities.Property.list()
  });

  // Generate P&L Statement
  const plMutation = useMutation({
    mutationFn: async () => {
      return await base44.functions.invoke('generateFinancialStatements', {
        property_id: selectedProperty,
        start_date: startDate,
        end_date: endDate,
        statement_type: 'pl'
      });
    }
  });

  // Forecast rental income
  const forecastMutation = useMutation({
    mutationFn: async () => {
      return await base44.functions.invoke('forecastRentalIncome', {
        property_id: selectedProperty,
        forecast_months: forecastMonths
      });
    }
  });

  // Custom report
  const customReportMutation = useMutation({
    mutationFn: async () => {
      return await base44.functions.invoke('executeCustomReport', {
        properties: [selectedProperty],
        metrics: selectedMetrics,
        start_date: startDate,
        end_date: endDate
      });
    }
  });

  const handleMetricToggle = (metric) => {
    setSelectedMetrics(prev =>
      prev.includes(metric) ? prev.filter(m => m !== metric) : [...prev, metric]
    );
  };

  const availableMetrics = [
    { value: 'total_income', label: 'Total Income' },
    { value: 'total_expenses', label: 'Total Expenses' },
    { value: 'arrears', label: 'Rental Arrears' },
    { value: 'occupancy_rate', label: 'Occupancy Rate' },
    { value: 'maintenance_cost', label: 'Maintenance Cost' },
    { value: 'yield', label: 'Property Yield' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <h1 className="text-4xl font-bold text-foreground">Financial Reporting Suite</h1>
          <p className="text-muted-foreground mt-2">Generate statements, custom reports, and forecasts</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Property & Date Selector */}
        <Card className="p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4 text-foreground">Report Parameters</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Property</label>
              <select
                value={selectedProperty}
                onChange={(e) => setSelectedProperty(e.target.value)}
                className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground"
              >
                <option value="">Select property...</option>
                {properties.map(p => (
                  <option key={p.id} value={p.id}>{p.address}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Forecast Months</label>
              <input
                type="number"
                min="1"
                max="36"
                value={forecastMonths}
                onChange={(e) => setForecastMonths(parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground"
              />
            </div>
          </div>
        </Card>

        <Tabs defaultValue="statements" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="statements">P&L Statements</TabsTrigger>
            <TabsTrigger value="custom">Custom Reports</TabsTrigger>
            <TabsTrigger value="forecast">Income Forecast</TabsTrigger>
          </TabsList>

          {/* P&L Statements */}
          <TabsContent value="statements">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <DollarSign className="w-6 h-6 text-green-600" />
                  <div>
                    <h3 className="text-xl font-semibold text-foreground">Profit & Loss Statement</h3>
                    <p className="text-sm text-muted-foreground">Monthly and annual financial summaries</p>
                  </div>
                </div>
                <Button
                  onClick={() => plMutation.mutate()}
                  disabled={!selectedProperty || plMutation.isPending}
                >
                  {plMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4 mr-2" />
                      Generate P&L
                    </>
                  )}
                </Button>
              </div>

              {plMutation.data && (
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <Card className="p-4 bg-green-50 border-green-200">
                      <p className="text-sm text-muted-foreground mb-1">Total Income</p>
                      <p className="text-2xl font-bold text-green-600">
                        £{plMutation.data.summary.totalIncome.toLocaleString()}
                      </p>
                    </Card>
                    <Card className="p-4 bg-red-50 border-red-200">
                      <p className="text-sm text-muted-foreground mb-1">Total Expenses</p>
                      <p className="text-2xl font-bold text-red-600">
                        £{plMutation.data.summary.totalExpenses.toLocaleString()}
                      </p>
                    </Card>
                    <Card className="p-4 bg-blue-50 border-blue-200">
                      <p className="text-sm text-muted-foreground mb-1">Net Profit</p>
                      <p className="text-2xl font-bold text-blue-600">
                        £{plMutation.data.summary.netProfit.toLocaleString()}
                      </p>
                    </Card>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                    <p className="text-sm font-medium text-foreground mb-2">Generated Statement:</p>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                      {plMutation.data.plStatement.substring(0, 500)}...
                    </p>
                  </div>
                </div>
              )}
            </Card>
          </TabsContent>

          {/* Custom Reports */}
          <TabsContent value="custom">
            <Card className="p-6">
              <h3 className="text-xl font-semibold mb-6 text-foreground">Custom Report Builder</h3>

              <div className="mb-6">
                <p className="text-sm font-medium text-foreground mb-3">Select Metrics</p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {availableMetrics.map(metric => (
                    <button
                      key={metric.value}
                      onClick={() => handleMetricToggle(metric.value)}
                      className={`p-3 border rounded-lg transition ${
                        selectedMetrics.includes(metric.value)
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-slate-200 bg-white hover:bg-slate-50'
                      }`}
                    >
                      <p className="text-sm font-medium text-foreground">{metric.label}</p>
                    </button>
                  ))}
                </div>
              </div>

              <Button
                onClick={() => customReportMutation.mutate()}
                disabled={!selectedProperty || selectedMetrics.length === 0 || customReportMutation.isPending}
                className="w-full"
              >
                {customReportMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating Report...
                  </>
                ) : (
                  'Generate Custom Report'
                )}
              </Button>

              {customReportMutation.data && (
                <div className="mt-6 p-4 bg-slate-50 rounded-lg border border-slate-200">
                  <p className="text-sm font-medium text-foreground mb-3">Report Results:</p>
                  <div className="space-y-2">
                    {Object.entries(customReportMutation.data.reportData[selectedProperty]?.metrics || {}).map(([key, value]) => (
                      <div key={key} className="flex justify-between text-sm">
                        <span className="text-muted-foreground capitalize">{key.replace(/_/g, ' ')}:</span>
                        <span className="font-medium text-foreground">
                          {typeof value === 'number' && key.includes('rate') ? `${value.toFixed(1)}%` : `£${(value / 100).toLocaleString()}`}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </Card>
          </TabsContent>

          {/* Income Forecast */}
          <TabsContent value="forecast">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <TrendingUp className="w-6 h-6 text-purple-600" />
                  <div>
                    <h3 className="text-xl font-semibold text-foreground">Rental Income & Expense Forecast</h3>
                    <p className="text-sm text-muted-foreground">12-36 month projections based on historical data</p>
                  </div>
                </div>
                <Button
                  onClick={() => forecastMutation.mutate()}
                  disabled={!selectedProperty || forecastMutation.isPending}
                >
                  {forecastMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    'Generate Forecast'
                  )}
                </Button>
              </div>

              {forecastMutation.data && (
                <div className="space-y-6">
                  {/* Summary */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card className="p-4">
                      <p className="text-xs text-muted-foreground mb-1">Avg Monthly Rent</p>
                      <p className="text-lg font-bold text-foreground">
                        £{forecastMutation.data.summary.avgMonthlyRent.toLocaleString()}
                      </p>
                    </Card>
                    <Card className="p-4">
                      <p className="text-xs text-muted-foreground mb-1">Avg Monthly Expenses</p>
                      <p className="text-lg font-bold text-foreground">
                        £{forecastMutation.data.summary.avgMonthlyExpense.toLocaleString()}
                      </p>
                    </Card>
                    <Card className="p-4">
                      <p className="text-xs text-muted-foreground mb-1">Trend Factor</p>
                      <p className="text-lg font-bold text-foreground">
                        {(forecastMutation.data.summary.trendFactor * 100).toFixed(1)}%
                      </p>
                    </Card>
                    <Card className="p-4">
                      <p className="text-xs text-muted-foreground mb-1">Total Projected Profit</p>
                      <p className="text-lg font-bold text-green-600">
                        £{forecastMutation.data.summary.totalProjectedProfit.toLocaleString()}
                      </p>
                    </Card>
                  </div>

                  {/* Chart */}
                  <div className="h-80 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={forecastMutation.data.forecast.slice(0, 12)}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip formatter={(value) => `£${(value / 100).toLocaleString()}`} />
                        <Legend />
                        <Bar dataKey="projectedRent" fill="#10b981" name="Projected Rent" />
                        <Bar dataKey="projectedExpense" fill="#ef4444" name="Projected Expense" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Analysis */}
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm font-medium text-foreground mb-2">AI Analysis:</p>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                      {forecastMutation.data.analysis.substring(0, 300)}...
                    </p>
                  </div>
                </div>
              )}
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}