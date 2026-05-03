import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, AlertCircle } from 'lucide-react';

export default function RentalRecommendationCard({ recommendation, units, property }) {
  const currentRent = units.reduce((sum, u) => sum + (u.monthly_rent || 0), 0);
  const recommendedRent = recommendation.recommended_rent;
  const monthlyDifference = recommendedRent - currentRent;
  const annualIncrease = monthlyDifference * 12;
  const percentageChange = currentRent > 0 ? ((monthlyDifference / currentRent) * 100).toFixed(1) : 0;

  const getRecommendationType = () => {
    if (percentageChange > 5) return { label: 'Strong Increase', color: 'text-green-600' };
    if (percentageChange > 0) return { label: 'Moderate Increase', color: 'text-green-500' };
    if (percentageChange > -5) return { label: 'Slight Decrease', color: 'text-orange-500' };
    return { label: 'Significant Decrease', color: 'text-red-600' };
  };

  const recType = getRecommendationType();

  return (
    <div className="space-y-4">
      {/* Main Recommendation */}
      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            Rental Price Recommendation
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Price Comparison */}
          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
              <p className="text-sm text-muted-foreground">Current Monthly Rent</p>
              <p className="text-3xl font-bold text-slate-900 mt-2">
                £{(currentRent / 100).toLocaleString()}
              </p>
            </div>

            <div className="bg-primary/5 rounded-lg p-4 border border-primary/20">
              <p className="text-sm text-muted-foreground">Recommended Monthly Rent</p>
              <p className="text-3xl font-bold text-primary mt-2">
                £{(recommendedRent / 100).toLocaleString()}
              </p>
            </div>

            <div className={`${monthlyDifference >= 0 ? 'bg-green-50' : 'bg-orange-50'} rounded-lg p-4 border ${monthlyDifference >= 0 ? 'border-green-200' : 'border-orange-200'}`}>
              <p className="text-sm text-muted-foreground">Monthly Difference</p>
              <p className={`text-3xl font-bold mt-2 ${monthlyDifference >= 0 ? 'text-green-600' : 'text-orange-600'}`}>
                {monthlyDifference >= 0 ? '+' : ''}£{(monthlyDifference / 100).toFixed(2)}
              </p>
              <p className={`text-xs mt-1 font-semibold ${monthlyDifference >= 0 ? 'text-green-600' : 'text-orange-600'}`}>
                {percentageChange > 0 ? '+' : ''}{percentageChange}%
              </p>
            </div>
          </div>

          {/* Annual Impact */}
          <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg p-4 border border-primary/20">
            <p className="text-sm text-muted-foreground mb-1">Annual Revenue Impact</p>
            <p className={`text-2xl font-bold ${monthlyDifference >= 0 ? 'text-green-600' : 'text-orange-600'}`}>
              {monthlyDifference >= 0 ? '+' : ''}£{(annualIncrease / 100).toLocaleString()}
            </p>
          </div>

          {/* Recommendation Type */}
          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200">
            <div>
              <p className="text-sm text-muted-foreground">Recommendation</p>
              <p className={`text-lg font-semibold mt-1 ${recType.color}`}>{recType.label}</p>
            </div>
            <Badge className={
              percentageChange > 5 ? 'bg-green-100 text-green-800' :
              percentageChange > 0 ? 'bg-green-50 border-green-200 text-green-700' :
              percentageChange > -5 ? 'bg-orange-50 border-orange-200 text-orange-700' :
              'bg-orange-100 text-orange-800'
            }>
              {percentageChange > 0 ? '+' : ''}{percentageChange}%
            </Badge>
          </div>

          {/* Analysis Notes */}
          {recommendation.analysis_summary && (
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <p className="text-sm font-semibold text-blue-900 mb-2">Market Analysis</p>
              <p className="text-sm text-blue-700 leading-relaxed">
                {recommendation.analysis_summary}
              </p>
            </div>
          )}

          {/* Key Factors */}
          {recommendation.key_factors && Array.isArray(recommendation.key_factors) && (
            <div className="space-y-2">
              <p className="text-sm font-semibold text-slate-900">Key Market Factors</p>
              <div className="space-y-2">
                {recommendation.key_factors.map((factor, idx) => (
                  <div key={idx} className="flex gap-2 text-sm">
                    <span className="text-primary font-bold">•</span>
                    <span className="text-slate-700">{factor}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Risk Warning */}
          {percentageChange > 10 && (
            <div className="flex gap-3 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-yellow-900">Large Price Increase</p>
                <p className="text-sm text-yellow-800 mt-1">
                  Consider gradually increasing rent to avoid tenant turnover. Market conditions support this increase, but phased approach may be prudent.
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}