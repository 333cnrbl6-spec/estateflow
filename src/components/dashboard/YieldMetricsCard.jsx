import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { TrendingUp } from 'lucide-react';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

export default function YieldMetricsCard({ yieldData }) {
  if (!yieldData || yieldData.properties.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-600" />
            Property Yields
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">No property data available</p>
        </CardContent>
      </Card>
    );
  }

  const { portfolioYield = 0, properties = [] } = yieldData;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-600" />
            Property Yields
          </span>
          <span className="text-2xl font-bold text-green-600">{portfolioYield.toFixed(2)}%</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3 max-h-64 overflow-y-auto">
          {properties.map((prop, idx) => (
            <div key={prop.id} className="p-3 bg-slate-50 rounded-lg">
              <div className="flex justify-between items-start mb-1">
                <div>
                  <p className="font-medium text-sm">{prop.name}</p>
                  <p className="text-xs text-muted-foreground">Annual Income</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-green-600">{prop.yield.toFixed(2)}%</p>
                  <p className="text-xs text-muted-foreground">£{prop.annualIncome.toLocaleString('en-GB', { maximumFractionDigits: 0 })}</p>
                </div>
              </div>
              <div className="w-full bg-slate-200 rounded h-1.5">
                <div
                  className="bg-green-600 rounded h-1.5 transition-all"
                  style={{ width: `${Math.min(prop.yield * 2, 100)}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="pt-2 border-t">
          <p className="text-xs text-muted-foreground mb-2">Portfolio Distribution</p>
          <ResponsiveContainer width="100%" height={150}>
            <PieChart>
              <Pie
                data={properties}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={60}
                dataKey="annualIncome"
                nameKey="name"
                label={false}
              >
                {properties.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => `£${value.toLocaleString('en-GB', { maximumFractionDigits: 0 })}`} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}