import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, DollarSign, Percent, BarChart3 } from 'lucide-react';

export default function PropertyValuationCard({ property, valuation, units }) {
  const getValuationTrend = (value) => {
    if (!value) return { label: 'Stable', color: 'text-blue-600' };
    if (value > 5) return { label: 'Strong Growth', color: 'text-green-600' };
    if (value > 0) return { label: 'Modest Growth', color: 'text-green-500' };
    if (value > -5) return { label: 'Slight Decline', color: 'text-orange-500' };
    return { label: 'Declining', color: 'text-red-600' };
  };

  const trend = getValuationTrend(valuation.projected_growth_rate);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-primary" />
          Valuation Results
        </CardTitle>
        <p className="text-sm text-muted-foreground mt-2">
          Generated {new Date(valuation.updated_date).toLocaleDateString()} using AI market analysis
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Primary Valuation */}
        <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg p-6 border border-primary/20">
          <p className="text-sm text-muted-foreground">Estimated Market Value</p>
          <p className="text-4xl font-bold text-primary mt-2">
            £{(valuation.estimated_value / 100).toLocaleString()}
          </p>
          <div className="flex items-center gap-2 mt-3">
            <TrendingUp className={`w-4 h-4 ${trend.color}`} />
            <span className={`text-sm font-semibold ${trend.color}`}>
              {trend.label}
              {valuation.projected_growth_rate && ` (${valuation.projected_growth_rate > 0 ? '+' : ''}${valuation.projected_growth_rate.toFixed(1)}%)`}
            </span>
          </div>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid md:grid-cols-3 gap-4">
          <div className="border border-slate-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Percent className="w-4 h-4 text-blue-600" />
              <p className="text-sm text-muted-foreground">Estimated Yield</p>
            </div>
            <p className="text-2xl font-bold text-slate-900">
              {valuation.estimated_yield?.toFixed(2)}%
            </p>
          </div>

          <div className="border border-slate-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <BarChart3 className="w-4 h-4 text-purple-600" />
              <p className="text-sm text-muted-foreground">Market Demand</p>
            </div>
            <p className="text-2xl font-bold text-slate-900">
              {valuation.market_demand_score || 'N/A'}
              {valuation.market_demand_score && '/100'}
            </p>
          </div>

          <div className="border border-slate-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-green-600" />
              <p className="text-sm text-muted-foreground">Annual Growth</p>
            </div>
            <p className="text-2xl font-bold text-slate-900">
              {valuation.projected_growth_rate ? `${valuation.projected_growth_rate > 0 ? '+' : ''}${valuation.projected_growth_rate.toFixed(1)}%` : 'N/A'}
            </p>
          </div>
        </div>

        {/* Analysis Summary */}
        {valuation.analysis_summary && (
          <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
            <p className="text-sm font-semibold text-slate-900 mb-2">Market Analysis Summary</p>
            <p className="text-sm text-slate-700 leading-relaxed">
              {valuation.analysis_summary}
            </p>
          </div>
        )}

        {/* Valuation Factors */}
        {valuation.key_factors && (
          <div className="space-y-2">
            <p className="text-sm font-semibold text-slate-900">Key Valuation Factors</p>
            <div className="space-y-2">
              {Array.isArray(valuation.key_factors) ? (
                valuation.key_factors.map((factor, idx) => (
                  <div key={idx} className="flex gap-2 text-sm">
                    <span className="text-primary font-bold">•</span>
                    <span className="text-slate-700">{factor}</span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-700">{valuation.key_factors}</p>
              )}
            </div>
          </div>
        )}

        {/* Comparable Properties */}
        {valuation.comparable_properties && (
          <div className="space-y-3">
            <p className="text-sm font-semibold text-slate-900">Comparable Properties Analyzed</p>
            <div className="grid md:grid-cols-2 gap-2">
              {Array.isArray(valuation.comparable_properties) &&
                valuation.comparable_properties.slice(0, 4).map((prop, idx) => (
                  <div key={idx} className="bg-slate-50 rounded p-3 border border-slate-200 text-sm">
                    <p className="font-medium text-slate-900">{prop.name || `Property ${idx + 1}`}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      £{prop.value ? (prop.value / 100).toLocaleString() : 'N/A'} {prop.beds && `• ${prop.beds} beds`}
                    </p>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Risk Factors */}
        {valuation.risk_factors && (
          <div className="border-l-4 border-orange-400 bg-orange-50 p-4 rounded">
            <p className="text-sm font-semibold text-orange-900 mb-2">Risk Factors</p>
            <p className="text-sm text-orange-800">{valuation.risk_factors}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}