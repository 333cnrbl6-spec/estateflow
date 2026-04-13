import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TrendingUp, Download, Calendar, MapPin, Home, RefreshCw, ExternalLink } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, BarChart, Bar } from 'recharts';
import PageHeader from '@/components/shared/PageHeader';

export default function MarketReports() {
  const [generating, setGenerating] = useState(false);

  const { data: reports = [], refetch } = useQuery({
    queryKey: ['market-reports'],
    queryFn: async () => {
      return await base44.entities.MarketReport.list('-generated_date', 10);
    }
  });

  const handleGenerateReport = async () => {
    setGenerating(true);
    try {
      await base44.functions.invoke('generateMarketReport', {});
      await refetch();
    } catch (error) {
      console.error('Failed to generate report:', error);
    } finally {
      setGenerating(false);
    }
  };

  const latestReport = reports[0];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background">
      <div className="p-8 max-w-[1400px] mx-auto">
        <PageHeader
          title="Market Intelligence"
          subtitle="AI-powered property market analysis and forecasts"
          icon={TrendingUp}
        />

        {/* Generate Report Section */}
        <Card className="mb-8 border-2 border-blue-100 bg-gradient-to-r from-blue-50 to-white">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl mb-2">Generate Market Report</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Analyze real-time data from Rightmove, Zoopla, and OnTheMarket for your portfolio regions
                </p>
              </div>
              <Button onClick={handleGenerateReport} disabled={generating} size="lg" className="gap-2">
                {generating ? (
                  <RefreshCw className="w-5 h-5 animate-spin" />
                ) : (
                  <TrendingUp className="w-5 h-5" />
                )}
                {generating ? 'Analyzing Market Data...' : 'Generate New Report'}
              </Button>
            </div>
          </CardHeader>
        </Card>

        {latestReport ? (
          <>
            {/* Executive Summary */}
            <Card className="mb-8">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Calendar className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle>Latest Market Analysis</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Generated on {new Date(latestReport.generated_date).toLocaleDateString('en-GB', { 
                        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
                      })}
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="w-4 h-4 text-blue-600" />
                      <span className="text-xs text-slate-600">Price Change</span>
                    </div>
                    <p className={`text-2xl font-bold ${
                      latestReport.key_metrics?.avg_price_change_percent > 0 ? 'text-green-600' : 
                      latestReport.key_metrics?.avg_price_change_percent < 0 ? 'text-red-600' : 'text-slate-600'
                    }`}>
                      {latestReport.key_metrics?.avg_price_change_percent > 0 ? '+' : ''}
                      {latestReport.key_metrics?.avg_price_change_percent}%
                    </p>
                    <p className="text-xs text-slate-500 mt-1">vs last month</p>
                  </div>

                  <div className="bg-green-50 rounded-lg p-4 border border-green-100">
                    <div className="flex items-center gap-2 mb-2">
                      <Home className="w-4 h-4 text-green-600" />
                      <span className="text-xs text-slate-600">Properties for Sale</span>
                    </div>
                    <p className="text-2xl font-bold text-green-700">
                      {latestReport.key_metrics?.properties_for_sale?.toLocaleString()}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">in your regions</p>
                  </div>

                  <div className="bg-purple-50 rounded-lg p-4 border border-purple-100">
                    <div className="flex items-center gap-2 mb-2">
                      <MapPin className="w-4 h-4 text-purple-600" />
                      <span className="text-xs text-slate-600">Hottest Area</span>
                    </div>
                    <p className="text-lg font-bold text-purple-700 truncate">
                      {latestReport.key_metrics?.hottest_area}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">highest demand</p>
                  </div>

                  <div className="bg-amber-50 rounded-lg p-4 border border-amber-100">
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="w-4 h-4 text-amber-600" />
                      <span className="text-xs text-slate-600">Avg Days on Market</span>
                    </div>
                    <p className="text-2xl font-bold text-amber-700">
                      {latestReport.key_metrics?.avg_days_on_market}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">days average</p>
                  </div>
                </div>

                <div className="bg-slate-50 rounded-lg p-6 border border-slate-200 mb-6">
                  <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide mb-3">Executive Summary</h3>
                  <p className="text-slate-700 leading-relaxed">{latestReport.executive_summary}</p>
                </div>

                {/* Price Trends Chart */}
                {latestReport.price_trends?.monthly_data?.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide mb-4">Price Trends (6 Months)</h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <AreaChart data={latestReport.price_trends.monthly_data}>
                        <defs>
                          <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                        <YAxis tick={{ fontSize: 11 }} tickFormatter={(value) => `£${value/1000}K`} />
                        <Tooltip formatter={(value) => [`£${value.toLocaleString()}`, 'Average Price']} />
                        <Area type="monotone" dataKey="avg_price" stroke="#3b82f6" fillOpacity={1} fill="url(#colorPrice)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                )}

                {/* Demand Forecast */}
                {latestReport.demand_forecast?.area_breakdown?.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide mb-4">Demand Forecast by Area</h3>
                    <ResponsiveContainer width="100%" height={250}>
                      <BarChart data={latestReport.demand_forecast.area_breakdown}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis dataKey="area" tick={{ fontSize: 10 }} angle={-45} textAnchor="end" height={80} />
                        <YAxis tick={{ fontSize: 11 }} domain={[0, 100]} />
                        <Tooltip formatter={(value) => [value, 'Demand Score']} />
                        <Bar dataKey="demand_score" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}

                {/* Recommendations */}
                {latestReport.recommendations?.length > 0 && (
                  <div className="bg-amber-50 rounded-lg p-6 border border-amber-200">
                    <h3 className="text-sm font-semibold text-amber-900 uppercase tracking-wide mb-4">Strategic Recommendations</h3>
                    <ul className="space-y-3">
                      {latestReport.recommendations.map((rec, idx) => (
                        <li key={idx} className="flex items-start gap-3">
                          <div className="w-6 h-6 bg-amber-200 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="text-xs font-bold text-amber-800">{idx + 1}</span>
                          </div>
                          <span className="text-slate-800">{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Historical Reports */}
            {reports.length > 1 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Historical Reports</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="divide-y divide-border">
                    {reports.slice(1).map((report) => (
                      <div key={report.id} className="flex items-center justify-between py-4">
                        <div>
                          <p className="text-sm font-medium">{new Date(report.generated_date).toLocaleDateString('en-GB', { 
                            weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' 
                          })}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {report.regions_covered?.length || 0} regions analyzed
                          </p>
                        </div>
                        <Button variant="ghost" size="sm">
                          <ExternalLink className="w-4 h-4 mr-2" />
                          View Details
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        ) : (
          <Card>
            <CardContent className="py-16 text-center">
              <TrendingUp className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-30" />
              <h3 className="text-lg font-semibold mb-2">No Market Reports Yet</h3>
              <p className="text-muted-foreground mb-6">Generate your first market analysis report to see insights</p>
              <Button onClick={handleGenerateReport} disabled={generating} size="lg" className="gap-2">
                {generating ? <RefreshCw className="w-5 h-5 animate-spin" /> : <TrendingUp className="w-5 h-5" />}
                {generating ? 'Generating Report...' : 'Generate First Report'}
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}