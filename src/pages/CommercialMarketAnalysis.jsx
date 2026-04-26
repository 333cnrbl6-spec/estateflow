import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, BarChart3, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function CommercialMarketAnalysis() {
  const [region, setRegion] = useState('london');
  const [propertyType, setPropertyType] = useState('office');
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);

  const { data: benchmarks = [] } = useQuery({
    queryKey: ['benchmarks', region, propertyType],
    queryFn: () => base44.entities.LeaseBenchmark.filter({ region, property_type: propertyType }),
  });

  const handleAnalyze = async () => {
    setLoading(true);
    try {
      const result = await base44.functions.invoke('analyzeMarketTrends', {
        region,
        property_type: propertyType,
      });
      setAnalysis(result);
    } catch (error) {
      toast.error('Failed to analyze market: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const benchmark = benchmarks[0];

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Select value={region} onValueChange={setRegion}>
          <SelectTrigger>
            <SelectValue placeholder="Region" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="london">London</SelectItem>
            <SelectItem value="manchester">Manchester</SelectItem>
            <SelectItem value="midlands">Midlands</SelectItem>
            <SelectItem value="leeds">Leeds</SelectItem>
            <SelectItem value="bristol">Bristol</SelectItem>
          </SelectContent>
        </Select>

        <Select value={propertyType} onValueChange={setPropertyType}>
          <SelectTrigger>
            <SelectValue placeholder="Property Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="office">Office</SelectItem>
            <SelectItem value="industrial">Industrial</SelectItem>
            <SelectItem value="retail">Retail</SelectItem>
            <SelectItem value="logistics">Logistics</SelectItem>
          </SelectContent>
        </Select>

        <Button onClick={handleAnalyze} disabled={loading} className="gap-2">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <BarChart3 className="w-4 h-4" />}
          Analyze Market
        </Button>
      </div>

      {/* Market Metrics */}
      {analysis && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Average Yield</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{analysis.market_metrics.avg_yield.toFixed(2)}%</div>
              <p className="text-xs text-muted-foreground mt-1">Market average</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Occupancy Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{analysis.market_metrics.avg_occupancy.toFixed(1)}%</div>
              <p className="text-xs text-muted-foreground mt-1">Average across market</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Market Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 mt-2">
                {analysis.analysis.market_trend === 'strong' ? (
                  <TrendingUp className="w-5 h-5 text-green-600" />
                ) : analysis.analysis.market_trend === 'weak' ? (
                  <TrendingDown className="w-5 h-5 text-red-600" />
                ) : (
                  <BarChart3 className="w-5 h-5 text-slate-600" />
                )}
                <span className="font-semibold capitalize">{analysis.analysis.market_trend}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Market Intelligence */}
      {analysis && (
        <Card>
          <CardHeader>
            <CardTitle>Market Intelligence</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium text-slate-900 mb-2">Market Outlook</p>
              <p className="text-sm text-slate-600">{analysis.analysis.outlook}</p>
            </div>

            <div>
              <p className="text-sm font-medium text-slate-900 mb-2">Projected Rent Growth (YoY)</p>
              <p className="text-2xl font-bold">{(analysis.analysis.rent_growth_forecast_yoy * 100).toFixed(1)}%</p>
            </div>

            <div>
              <p className="text-sm font-medium text-slate-900 mb-2">Key Drivers</p>
              <ul className="space-y-1">
                {analysis.analysis.key_drivers?.map((driver, i) => (
                  <li key={i} className="text-sm text-slate-600">• {driver}</li>
                ))}
              </ul>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded p-3">
              <p className="text-sm font-medium text-blue-900 mb-1">Recommended Action</p>
              <p className="text-sm text-blue-800">{analysis.analysis.recommended_action}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Benchmark Comparison */}
      {benchmark && (
        <Card>
          <CardHeader>
            <CardTitle>Benchmark Data</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-muted-foreground">Average Lease Term</p>
              <p className="text-2xl font-bold">{benchmark.average_lease_term_years} years</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Benchmark Rent/sqft</p>
              <p className="text-2xl font-bold">£{(benchmark.benchmark_rent_psf / 100).toFixed(2)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Market Conditions</p>
              <p className="text-2xl font-bold capitalize">{benchmark.market_conditions}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Comparable Transactions</p>
              <p className="text-2xl font-bold">{benchmark.sample_size}</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}