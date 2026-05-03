import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ScatterChart, Scatter } from 'recharts';
import { TrendingUp, Home, DollarSign } from 'lucide-react';

export default function PortfolioTrendsDashboard() {
  // Mock historical rental yield data
  const yieldData = [
    { month: 'Jan 2025', historical: 4.2, projected: 4.2 },
    { month: 'Apr 2025', historical: 4.35, projected: 4.35 },
    { month: 'Jul 2025', historical: 4.5, projected: 4.5 },
    { month: 'Oct 2025', historical: 4.65, projected: 4.65 },
    { month: 'Jan 2026', historical: 4.8, projected: 4.8 },
    { month: 'Apr 2026', historical: 5.1, projected: 5.1 },
    { month: 'Jul 2026', historical: 5.3, projected: 5.45 },
    { month: 'Oct 2026', historical: null, projected: 5.6 },
    { month: 'Jan 2027', historical: null, projected: 5.75 },
    { month: 'Apr 2027', historical: null, projected: 5.88 },
  ];

  // Vacancy duration by region (in days)
  const vacancyData = [
    { region: 'London', avgDuration: 18, count: 4, percentOccupied: 92 },
    { region: 'Greater Manchester', avgDuration: 12, count: 8, percentOccupied: 95 },
    { region: 'Midlands', avgDuration: 22, count: 3, percentOccupied: 88 },
    { region: 'Yorkshire', avgDuration: 15, count: 5, percentOccupied: 93 },
    { region: 'South East', avgDuration: 25, count: 2, percentOccupied: 86 },
    { region: 'Wales', avgDuration: 8, count: 3, percentOccupied: 97 },
  ];

  // Year-over-year operational expense ratio
  const expenseData = [
    { quarter: 'Q1 2025', maintenance: 8.2, utilities: 3.1, insurance: 2.5, admin: 1.8, other: 0.9, total: 16.5 },
    { quarter: 'Q2 2025', maintenance: 9.1, utilities: 2.8, insurance: 2.5, admin: 1.9, other: 0.7, total: 17.0 },
    { quarter: 'Q3 2025', maintenance: 7.5, utilities: 3.4, insurance: 2.5, admin: 1.8, other: 1.2, total: 16.4 },
    { quarter: 'Q4 2025', maintenance: 10.2, utilities: 4.1, insurance: 2.5, admin: 2.1, other: 0.8, total: 19.7 },
    { quarter: 'Q1 2026', maintenance: 8.7, utilities: 3.2, insurance: 2.5, admin: 1.9, other: 0.9, total: 17.2 },
    { quarter: 'Q2 2026', maintenance: 8.3, utilities: 2.9, insurance: 2.5, admin: 1.8, other: 0.6, total: 16.1 },
  ];

  const getSavingsOpportunity = () => {
    const q2_2026 = expenseData[5].total;
    const avg = (expenseData[0].total + expenseData[1].total + expenseData[2].total + expenseData[3].total + expenseData[4].total) / 5;
    const saving = avg - q2_2026;
    return { amount: saving.toFixed(1), percent: ((saving / avg) * 100).toFixed(1) };
  };

  const savings = getSavingsOpportunity();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-12 px-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2 flex items-center gap-2">
            <TrendingUp className="w-8 h-8" />
            Portfolio Trends & Analytics
          </h1>
          <p className="text-lg text-slate-600">Portfolio-wide performance metrics and cost optimization insights</p>
        </div>

        {/* Summary Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm">
                <TrendingUp className="w-4 h-4 text-green-600" />
                Current Yield Growth
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-green-600">+5.1%</p>
              <p className="text-xs text-slate-600 mt-1">Apr 2026 (+0.3% vs last quarter)</p>
              <p className="text-xs text-slate-500 mt-2">Projected to reach 5.88% by Q2 2027</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm">
                <Home className="w-4 h-4 text-blue-600" />
                Avg Vacancy Duration
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-blue-600">15.8 days</p>
              <p className="text-xs text-slate-600 mt-1">Across all regions</p>
              <p className="text-xs text-slate-500 mt-2">Best: Wales (8 days) | Highest: South East (25 days)</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm">
                <DollarSign className="w-4 h-4 text-purple-600" />
                Cost Savings Achieved
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-purple-600">{savings.amount}%</p>
              <p className="text-xs text-slate-600 mt-1">Q2 2026 expense reduction</p>
              <p className="text-xs text-slate-500 mt-2">{savings.percent}% below rolling 5-quarter avg</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <Tabs defaultValue="yield" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="yield">Rental Yield Growth</TabsTrigger>
            <TabsTrigger value="vacancy">Regional Vacancy Analysis</TabsTrigger>
            <TabsTrigger value="expenses">Expense Ratio Trends</TabsTrigger>
          </TabsList>

          {/* Yield Growth Chart */}
          <TabsContent value="yield">
            <Card>
              <CardHeader>
                <CardTitle>Historical vs Projected Rental Yield Growth</CardTitle>
                <p className="text-sm text-slate-600 mt-1">Portfolio average yield trend and forecast through Q2 2027</p>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={yieldData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis domain={[3.5, 6.2]} />
                    <Tooltip 
                      formatter={(value) => value ? `${value.toFixed(2)}%` : 'N/A'}
                      labelFormatter={(label) => `${label}`}
                    />
                    <Legend />
                    <Line type="monotone" dataKey="historical" stroke="#2563eb" strokeWidth={2} dot={{ r: 4 }} name="Historical Yield" />
                    <Line type="monotone" dataKey="projected" stroke="#10b981" strokeWidth={2} strokeDasharray="5 5" dot={{ r: 4 }} name="Projected Yield" />
                  </LineChart>
                </ResponsiveContainer>
                <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="font-semibold text-blue-900 text-sm mb-2">📊 Key Insights</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Current yield of 5.1% represents 21% growth from baseline (4.2% Jan 2025)</li>
                    <li>• Projected to reach 5.88% by Q2 2027 — additional 15% growth potential</li>
                    <li>• Growth driven by rent increases in London, Manchester, and Yorkshire markets</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Vacancy Analysis */}
          <TabsContent value="vacancy">
            <Card>
              <CardHeader>
                <CardTitle>Vacancy Duration Analysis by Region</CardTitle>
                <p className="text-sm text-slate-600 mt-1">Average days vacant and occupancy rates — identify regional market dynamics</p>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={vacancyData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="region" />
                    <YAxis yAxisId="left" label={{ value: 'Days Vacant', angle: -90, position: 'insideLeft' }} />
                    <YAxis yAxisId="right" orientation="right" label={{ value: 'Occupancy %', angle: 90, position: 'insideRight' }} />
                    <Tooltip 
                      formatter={(value, name) => {
                        if (name === 'avgDuration') return `${value} days`;
                        if (name === 'percentOccupied') return `${value}%`;
                        return value;
                      }}
                    />
                    <Legend />
                    <Bar yAxisId="left" dataKey="avgDuration" fill="#ef4444" name="Avg Days Vacant" />
                  </BarChart>
                </ResponsiveContainer>
                <div className="mt-6 grid md:grid-cols-2 gap-4">
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <h4 className="font-semibold text-green-900 text-sm mb-2">✅ High Performers</h4>
                    <ul className="text-sm text-green-800 space-y-1">
                      <li>• <strong>Wales:</strong> 8 days (97% occupancy)</li>
                      <li>• <strong>Manchester:</strong> 12 days (95% occupancy)</li>
                      <li>• <strong>Yorkshire:</strong> 15 days (93% occupancy)</li>
                    </ul>
                  </div>
                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                    <h4 className="font-semibold text-amber-900 text-sm mb-2">⚠️ Improvement Needed</h4>
                    <ul className="text-sm text-amber-800 space-y-1">
                      <li>• <strong>South East:</strong> 25 days (86% occupancy)</li>
                      <li>• <strong>Midlands:</strong> 22 days (88% occupancy)</li>
                      <li>• Action: Consider rent adjustment or marketing boost</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Expense Ratio Trends */}
          <TabsContent value="expenses">
            <Card>
              <CardHeader>
                <CardTitle>Year-over-Year Operational Expense Ratio</CardTitle>
                <p className="text-sm text-slate-600 mt-1">Percentage of rental income spent on operations — identify cost-saving opportunities</p>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={expenseData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="quarter" />
                    <YAxis label={{ value: 'Expense Ratio (%)', angle: -90, position: 'insideLeft' }} />
                    <Tooltip formatter={(value) => `${value.toFixed(1)}%`} />
                    <Legend />
                    <Bar dataKey="maintenance" stackId="a" fill="#f97316" name="Maintenance" />
                    <Bar dataKey="utilities" stackId="a" fill="#0ea5e9" name="Utilities" />
                    <Bar dataKey="insurance" stackId="a" fill="#ec4899" name="Insurance" />
                    <Bar dataKey="admin" stackId="a" fill="#8b5cf6" name="Admin" />
                    <Bar dataKey="other" stackId="a" fill="#64748b" name="Other" />
                  </BarChart>
                </ResponsiveContainer>
                <div className="mt-6 grid md:grid-cols-2 gap-4">
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h4 className="font-semibold text-blue-900 text-sm mb-2">📈 Quarterly Trend</h4>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>• Q4 2025: Peak at 19.7% (seasonal maintenance surge)</li>
                      <li>• Q2 2026: 16.1% (best performance — 18% reduction)</li>
                      <li>• Maintenance costs trending down</li>
                    </ul>
                  </div>
                  <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                    <h4 className="font-semibold text-purple-900 text-sm mb-2">💡 Cost-Saving Opportunities</h4>
                    <ul className="text-sm text-purple-800 space-y-1">
                      <li>• Reduce maintenance by 8-10% through preventative planning</li>
                      <li>• Utilities: Look for bulk energy discounts (currently 2.9-3.4%)</li>
                      <li>• Target total ratio: 15% or lower by Q4 2026</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Recommendations */}
        <Card className="border-2 border-primary/20 bg-gradient-to-r from-primary/5 to-primary/10">
          <CardHeader>
            <CardTitle className="text-lg">Strategic Recommendations</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex gap-3">
              <span className="text-2xl">🎯</span>
              <div>
                <p className="font-semibold text-slate-900">Rental Yield:</p>
                <p className="text-sm text-slate-700">Continue targeted rent increases in underperforming regions (South East, Midlands) to align with growth trajectory.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <span className="text-2xl">🏘️</span>
              <div>
                <p className="font-semibold text-slate-900">Vacancy Reduction:</p>
                <p className="text-sm text-slate-700">South East market shows highest vacancy (25 days). Consider rental adjustment, property upgrades, or marketing refresh.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <span className="text-2xl">💰</span>
              <div>
                <p className="font-semibold text-slate-900">Cost Optimization:</p>
                <p className="text-sm text-slate-700">Q2 2026 achieved 16.1% ratio. Lock in maintenance supplier contracts and utilities deals to sustain improvements.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}