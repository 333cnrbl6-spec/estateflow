import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TrendingUp, TrendingDown, Home, MapPin, Calendar, RefreshCw, ExternalLink, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

export default function MarketIntelligenceWidget() {
  const [lastGenerated, setLastGenerated] = useState(null);
  const [generating, setGenerating] = useState(false);

  const { data: marketReport, refetch } = useQuery({
    queryKey: ['market-report'],
    queryFn: async () => {
      const reports = await base44.entities.MarketReport.list(undefined, 1);
      if (reports.length > 0) {
        setLastGenerated(reports[0].generated_date);
        return reports[0];
      }
      return null;
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

  if (!marketReport) {
    return (
      <Card className="border-2 border-dashed border-muted">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-blue-50 rounded-lg">
                <TrendingUp className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <CardTitle className="text-base">Market Intelligence</CardTitle>
                <p className="text-xs text-muted-foreground">AI-powered property market analysis</p>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-sm text-muted-foreground mb-4">No market report generated yet</p>
            <Button onClick={handleGenerateReport} disabled={generating} className="gap-2">
              {generating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <TrendingUp className="w-4 h-4" />}
              {generating ? 'Generating Report...' : 'Generate Market Report'}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const trendData = marketReport.price_trends?.monthly_data || [];
  const demandData = marketReport.demand_forecast?.area_breakdown || [];

  return (
    <Card className="border-2 border-blue-100 bg-gradient-to-br from-blue-50/50 to-white">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-100 rounded-lg">
              <TrendingUp className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <CardTitle className="text-base">Market Intelligence Report</CardTitle>
              <p className="text-xs text-muted-foreground">
                {lastGenerated ? `Generated ${new Date(lastGenerated).toLocaleDateString()}` : 'Real-time analysis'}
              </p>
            </div>
          </div>
          <Button onClick={handleGenerateReport} disabled={generating} variant="outline" size="sm" className="gap-2">
            <RefreshCw className={`w-3 h-3 ${generating ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Executive Summary */}
        <div className="bg-white rounded-lg p-4 border border-blue-100">
          <div className="flex items-start gap-3 mb-3">
            <div className="p-2 bg-blue-50 rounded-lg mt-0.5">
              <Calendar className="w-4 h-4 text-blue-600" />
            </div>
            <div className="flex-1">
              <p className="text-xs font-semibold text-blue-900 uppercase tracking-wide mb-2">Executive Summary</p>
              <p className="text-sm text-slate-700 leading-relaxed">{marketReport.executive_summary}</p>
            </div>
          </div>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white rounded-lg p-3 border border-green-100">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-green-600" />
              <span className="text-xs text-slate-600">Avg Price Change</span>
            </div>
            <p className="text-lg font-bold text-green-700">
              {marketReport.key_metrics?.avg_price_change_percent > 0 ? '+' : ''}{marketReport.key_metrics?.avg_price_change_percent}%
            </p>
            <div className="flex items-center gap-1 mt-1">
              {marketReport.key_metrics?.avg_price_change_percent > 0 ? (
                <ArrowUpRight className="w-3 h-3 text-green-600" />
              ) : marketReport.key_metrics?.avg_price_change_percent < 0 ? (
                <ArrowDownRight className="w-3 h-3 text-red-600" />
              ) : null}
              <span className="text-xs text-slate-500">vs last month</span>
            </div>
          </div>

          <div className="bg-white rounded-lg p-3 border border-blue-100">
            <div className="flex items-center gap-2 mb-2">
              <Home className="w-4 h-4 text-blue-600" />
              <span className="text-xs text-slate-600">Properties for Sale</span>
            </div>
            <p className="text-lg font-bold text-blue-700">{marketReport.key_metrics?.properties_for_sale}</p>
            <p className="text-xs text-slate-500 mt-1">in your areas</p>
          </div>

          <div className="bg-white rounded-lg p-3 border border-purple-100">
            <div className="flex items-center gap-2 mb-2">
              <MapPin className="w-4 h-4 text-purple-600" />
              <span className="text-xs text-slate-600">Hottest Area</span>
            </div>
            <p className="text-sm font-bold text-purple-700 truncate">{marketReport.key_metrics?.hottest_area}</p>
            <p className="text-xs text-slate-500 mt-1">highest demand</p>
          </div>
        </div>

        {/* Price Trend Chart */}
        {trendData.length > 0 && (
          <div className="bg-white rounded-lg p-4 border border-slate-100">
            <p className="text-xs font-semibold text-slate-700 uppercase tracking-wide mb-3">Price Trends (6 Months)</p>
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} tickFormatter={(value) => `£${value/1000}K`} />
                <Tooltip formatter={(value) => [`£${value.toLocaleString()}`, 'Average Price']} />
                <Area type="monotone" dataKey="avg_price" stroke="#3b82f6" fillOpacity={1} fill="url(#colorPrice)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Demand Forecast by Area */}
        {demandData.length > 0 && (
          <div className="bg-white rounded-lg p-4 border border-slate-100">
            <p className="text-xs font-semibold text-slate-700 uppercase tracking-wide mb-3">Demand Forecast by Area</p>
            <div className="space-y-2">
              {demandData.slice(0, 4).map((area, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3 h-3 text-slate-400" />
                    <span className="text-sm font-medium text-slate-700">{area.area}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${
                          area.demand_score >= 75 ? 'bg-green-500' : 
                          area.demand_score >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${area.demand_score}%` }}
                      />
                    </div>
                    <span className={`text-xs font-semibold w-8 text-right ${
                      area.demand_score >= 75 ? 'text-green-600' : 
                      area.demand_score >= 50 ? 'text-yellow-600' : 'text-red-600'
                    }`}>{area.demand_score}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recommendations */}
        {marketReport.recommendations?.length > 0 && (
          <div className="bg-amber-50 rounded-lg p-4 border border-amber-100">
            <p className="text-xs font-semibold text-amber-900 uppercase tracking-wide mb-2">Strategic Recommendations</p>
            <ul className="space-y-1.5">
              {marketReport.recommendations.slice(0, 3).map((rec, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-amber-600 mt-0.5">•</span>
                  <span className="text-sm text-amber-900">{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* View Full Report Link */}
        <div className="pt-2 border-t border-slate-100">
          <Button variant="ghost" size="sm" className="w-full gap-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50">
            <ExternalLink className="w-3 h-3" />
            View Full Market Analysis
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}