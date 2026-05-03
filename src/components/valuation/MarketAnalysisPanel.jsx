import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Users, Home, Zap } from 'lucide-react';

export default function MarketAnalysisPanel({ property, valuation }) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
        <Zap className="w-5 h-5 text-primary" />
        Detailed Market Analysis
      </h3>

      <div className="grid md:grid-cols-2 gap-4">
        {/* Rental Trends */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Rental Trends
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {valuation.rental_growth_rate && (
              <div>
                <p className="text-sm text-muted-foreground">Annual Rent Growth</p>
                <p className="text-2xl font-bold text-green-600 mt-1">
                  +{valuation.rental_growth_rate.toFixed(2)}%
                </p>
              </div>
            )}
            {valuation.average_rental_yield && (
              <div>
                <p className="text-sm text-muted-foreground">Average Rental Yield</p>
                <p className="text-lg font-bold text-slate-900 mt-1">
                  {valuation.average_rental_yield.toFixed(2)}%
                </p>
              </div>
            )}
            {valuation.rental_forecast && (
              <div className="bg-blue-50 rounded p-2 text-sm text-blue-700">
                {valuation.rental_forecast}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Market Demand */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="w-4 h-4" />
              Market Demand
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {valuation.market_demand_score && (
              <div>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">Demand Score</p>
                  <Badge className="bg-green-100 text-green-800">
                    {valuation.market_demand_score}/100
                  </Badge>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2 mt-2">
                  <div
                    className="bg-green-600 h-2 rounded-full"
                    style={{ width: `${valuation.market_demand_score}%` }}
                  ></div>
                </div>
              </div>
            )}
            {valuation.tenant_demand_level && (
              <div>
                <p className="text-sm text-muted-foreground">Tenant Demand Level</p>
                <Badge variant="outline" className="mt-2">
                  {valuation.tenant_demand_level}
                </Badge>
              </div>
            )}
            {valuation.vacancy_rate && (
              <div>
                <p className="text-sm text-muted-foreground">Local Vacancy Rate</p>
                <p className="text-lg font-bold text-slate-900 mt-1">
                  {valuation.vacancy_rate.toFixed(1)}%
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Comparable Analysis */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Home className="w-4 h-4" />
              Comparable Properties
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {valuation.comparables_average_price && (
              <div>
                <p className="text-sm text-muted-foreground">Average Comp Price</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">
                  £{(valuation.comparables_average_price / 100).toLocaleString()}
                </p>
              </div>
            )}
            {valuation.price_per_sqft && (
              <div>
                <p className="text-sm text-muted-foreground">Price per Sq Ft</p>
                <p className="text-lg font-bold text-slate-900 mt-1">
                  £{valuation.price_per_sqft.toFixed(2)}
                </p>
              </div>
            )}
            {valuation.comparables_data && (
              <div className="bg-slate-50 rounded p-2 text-sm text-slate-700">
                {valuation.comparables_data}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Regional Insights */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Regional Insights</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {valuation.region_growth_rate && (
              <div>
                <p className="text-sm text-muted-foreground">Region Growth Rate</p>
                <p className="text-2xl font-bold text-primary mt-1">
                  {valuation.region_growth_rate > 0 ? '+' : ''}{valuation.region_growth_rate.toFixed(2)}%
                </p>
              </div>
            )}
            {valuation.area_description && (
              <div className="bg-slate-50 rounded p-2 text-sm text-slate-700">
                {valuation.area_description}
              </div>
            )}
            {valuation.neighborhood_score && (
              <div>
                <p className="text-sm text-muted-foreground">Neighborhood Score</p>
                <Badge className="mt-2">
                  {valuation.neighborhood_score}/10
                </Badge>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recommendation */}
      {valuation.recommendation && (
        <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
          <CardHeader>
            <CardTitle className="text-base">AI Recommendation</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-700 leading-relaxed">
              {valuation.recommendation}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}