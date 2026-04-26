import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Loader2, TrendingUp, Star } from 'lucide-react';
import { toast } from 'sonner';

export default function InvestmentOpportunityScoring() {
  const [oppId, setOppId] = useState('');
  const [askingPrice, setAskingPrice] = useState('');
  const [annualIncome, setAnnualIncome] = useState('');
  const [region, setRegion] = useState('london');
  const [propertyType, setPropertyType] = useState('office');
  const [scoring, setScoring] = useState(null);
  const [loading, setLoading] = useState(false);

  const { data: opportunities = [] } = useQuery({
    queryKey: ['opportunities'],
    queryFn: () => base44.entities.InvestmentOpportunity.filter({ status: ['new', 'under_review'] }),
  });

  const handleScore = async () => {
    if (!askingPrice || !annualIncome) {
      toast.error('Please enter asking price and annual income');
      return;
    }

    setLoading(true);
    try {
      const result = await base44.functions.invoke('scoreInvestmentOpportunity', {
        asking_price: parseInt(askingPrice) * 100, // Convert to pence
        annual_rental_income: parseInt(annualIncome) * 100,
        region,
        property_type: propertyType,
      });
      setScoring(result);
    } catch (error) {
      toast.error('Failed to score opportunity: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const getRecommendationColor = (rec) => {
    if (rec === 'strong_buy') return 'bg-green-100 text-green-800';
    if (rec === 'buy') return 'bg-blue-100 text-blue-800';
    if (rec === 'hold') return 'bg-amber-100 text-amber-800';
    return 'bg-red-100 text-red-800';
  };

  return (
    <div className="space-y-6">
      {/* Scoring Form */}
      <Card>
        <CardHeader>
          <CardTitle>Score Investment Opportunity</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Asking Price (£)</label>
              <Input
                type="number"
                placeholder="e.g., 5000000"
                value={askingPrice}
                onChange={(e) => setAskingPrice(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Annual Rental Income (£)</label>
              <Input
                type="number"
                placeholder="e.g., 250000"
                value={annualIncome}
                onChange={(e) => setAnnualIncome(e.target.value)}
              />
            </div>
          </div>

          <Button onClick={handleScore} disabled={loading} className="w-full gap-2">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Star className="w-4 h-4" />}
            Score Opportunity
          </Button>
        </CardContent>
      </Card>

      {/* Scoring Results */}
      {scoring && (
        <>
          {/* Score */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Opportunity Score</span>
                <div className="text-4xl font-bold text-blue-600">{scoring.scoring.opportunity_score}</div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="w-full bg-slate-200 rounded-full h-3">
                <div 
                  className="bg-blue-600 h-3 rounded-full transition-all"
                  style={{ width: `${scoring.scoring.opportunity_score}%` }}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Cap Rate</p>
                  <p className="text-2xl font-bold">{scoring.metrics.cap_rate.toFixed(2)}%</p>
                  <p className="text-xs text-slate-600 mt-1">
                    {scoring.metrics.cap_rate_vs_benchmark > 0 ? '+' : ''}{scoring.metrics.cap_rate_vs_benchmark.toFixed(2)}% vs benchmark
                  </p>
                </div>

                <div>
                  <p className="text-xs text-muted-foreground mb-1">Valuation</p>
                  <Badge className={`capitalize ${
                    scoring.scoring.valuation_assessment === 'undervalued' ? 'bg-green-100 text-green-800' :
                    scoring.scoring.valuation_assessment === 'fair' ? 'bg-blue-100 text-blue-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {scoring.scoring.valuation_assessment}
                  </Badge>
                </div>

                <div>
                  <p className="text-xs text-muted-foreground mb-1">5-Year ROI</p>
                  <p className="text-2xl font-bold">{(scoring.scoring.estimated_roi_5yr * 100).toFixed(1)}%</p>
                </div>
              </div>

              <div className="bg-slate-50 border rounded p-3 space-y-2">
                <p className="text-sm font-medium">Recommendation</p>
                <Badge className={`capitalize ${getRecommendationColor(scoring.scoring.recommendation)}`}>
                  {scoring.scoring.recommendation.replace(/_/g, ' ')}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Strengths & Risks */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-green-700">Key Strengths</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {scoring.scoring.key_strengths?.map((strength, i) => (
                    <li key={i} className="text-sm text-slate-600 flex items-start gap-2">
                      <span className="text-green-600 mt-1">✓</span>
                      <span>{strength}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-red-700">Key Risks</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {scoring.scoring.key_risks?.map((risk, i) => (
                    <li key={i} className="text-sm text-slate-600 flex items-start gap-2">
                      <span className="text-red-600 mt-1">!</span>
                      <span>{risk}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </>
      )}

      {/* Opportunities List */}
      {opportunities.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Opportunities</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {opportunities.slice(0, 5).map(opp => (
                <div key={opp.id} className="p-3 border rounded hover:bg-slate-50 cursor-pointer">
                  <p className="font-medium">{opp.address}</p>
                  <div className="flex justify-between items-center mt-2">
                    <p className="text-xs text-slate-600">Cap Rate: {(opp.cap_rate || 0).toFixed(2)}%</p>
                    <Badge variant="outline">Score: {opp.opportunity_score}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}