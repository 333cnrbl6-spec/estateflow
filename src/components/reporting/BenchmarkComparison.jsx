import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';

export default function BenchmarkComparison() {
  // Sample benchmarking data
  const benchmarkData = [
    { property: 'Property A', occupancy: 92, yield: 4.2, portfolio_avg_occupancy: 85, portfolio_avg_yield: 4.0 },
    { property: 'Property B', occupancy: 88, yield: 3.8, portfolio_avg_occupancy: 85, portfolio_avg_yield: 4.0 },
    { property: 'Property C', occupancy: 95, yield: 4.5, portfolio_avg_occupancy: 85, portfolio_avg_yield: 4.0 },
    { property: 'Property D', occupancy: 78, yield: 3.2, portfolio_avg_occupancy: 85, portfolio_avg_yield: 4.0 }
  ];

  const scatterData = [
    { x: 92, y: 4.2, name: 'Property A' },
    { x: 88, y: 3.8, name: 'Property B' },
    { x: 95, y: 4.5, name: 'Property C' },
    { x: 78, y: 3.2, name: 'Property D' }
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Occupancy vs Yield (Your Portfolio vs Benchmark)</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="x" name="Occupancy %" />
              <YAxis dataKey="y" name="Yield %" />
              <Tooltip cursor={{ strokeDasharray: '3 3' }} />
              <Scatter name="Your Properties" data={scatterData} fill="hsl(221, 65%, 28%)" />
            </ScatterChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Occupancy Rate by Property</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={benchmarkData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="property" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="occupancy" fill="hsl(173, 58%, 39%)" />
              <Bar dataKey="portfolio_avg_occupancy" fill="hsl(220, 15%, 93%)" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Performance Benchmark Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 bg-green-50 rounded-lg">
              <p className="text-sm text-slate-600">Your Avg Occupancy</p>
              <p className="text-2xl font-bold text-green-700">88.25%</p>
              <p className="text-xs text-slate-600 mt-1">vs 85% benchmark</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-slate-600">Your Avg Yield</p>
              <p className="text-2xl font-bold text-blue-700">3.93%</p>
              <p className="text-xs text-slate-600 mt-1">vs 4.0% benchmark</p>
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <p className="text-sm font-semibold text-slate-900">Insights</p>
            <ul className="text-sm text-slate-700 mt-2 space-y-1">
              <li>✅ Above-average occupancy (88% vs 85%)</li>
              <li>⚠️ Yield slightly below benchmark (-7 bps)</li>
              <li>💡 Property C is outperforming (95% occupancy, 4.5% yield)</li>
              <li>📊 Property D underperforming - recommend review</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}