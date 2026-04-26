import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { AlertCircle, Loader2, TrendingDown } from 'lucide-react';
import { toast } from 'sonner';

const COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#06b6d4'];

export default function PortfolioRiskAnalyzer() {
  const [selectedProperties, setSelectedProperties] = useState([]);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);

  const { data: properties = [] } = useQuery({
    queryKey: ['commercial-properties'],
    queryFn: () => base44.entities.CommercialProperty.list(),
  });

  const handlePropertyToggle = (id) => {
    setSelectedProperties(prev =>
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  const handleAnalyze = async () => {
    if (selectedProperties.length === 0) {
      toast.error('Please select at least one property');
      return;
    }

    setLoading(true);
    try {
      const result = await base44.functions.invoke('analyzePortfolioRisk', {
        property_ids: selectedProperties,
      });
      setAnalysis(result);
    } catch (error) {
      toast.error('Failed to analyze portfolio: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Prepare sector data for chart
  const sectorData = analysis ? Object.entries(analysis.sector_breakdown).map(([name, value]) => ({
    name: name.replace(/_/g, ' '),
    value
  })) : [];

  return (
    <div className="space-y-6">
      {/* Property Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Select Properties for Risk Analysis</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {properties.length === 0 ? (
            <p className="text-sm text-muted-foreground">No properties found</p>
          ) : (
            <>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {properties.map(prop => (
                  <div key={prop.id} className="flex items-start gap-3 p-2 hover:bg-slate-50 rounded">
                    <Checkbox
                      checked={selectedProperties.includes(prop.id)}
                      onCheckedChange={() => handlePropertyToggle(prop.id)}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{prop.address}</p>
                      <p className="text-xs text-slate-500">
                        {prop.property_type} • £{(prop.estimated_value / 100000000).toFixed(1)}M • {(prop.occupancy_rate || 0).toFixed(0)}% occupied
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <Button 
                onClick={handleAnalyze} 
                disabled={selectedProperties.length === 0 || loading}
                className="w-full gap-2"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <TrendingDown className="w-4 h-4" />}
                Analyze Portfolio Risk
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      {/* Analysis Results */}
      {analysis && (
        <>
          {/* Risk Rating */}
          <Card className={`border-l-4 ${
            analysis.risk_analysis.overall_risk_rating === 'low' ? 'border-l-green-600' :
            analysis.risk_analysis.overall_risk_rating === 'medium' ? 'border-l-amber-600' :
            'border-l-red-600'
          }`}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Overall Risk Rating</span>
                <span className={`text-2xl font-bold ${
                  analysis.risk_analysis.overall_risk_rating === 'low' ? 'text-green-600' :
                  analysis.risk_analysis.overall_risk_rating === 'medium' ? 'text-amber-600' :
                  'text-red-600'
                }`}>
                  {analysis.risk_analysis.overall_risk_rating.toUpperCase()}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground">Diversification Score</p>
                  <p className="text-3xl font-bold">{analysis.risk_analysis.diversification_score}</p>
                  <div className="w-full bg-slate-200 rounded-full h-2 mt-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${analysis.risk_analysis.diversification_score}%` }}
                    />
                  </div>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Lease Risk Level</p>
                  <p className={`text-lg font-bold capitalize ${
                    analysis.risk_analysis.lease_risk_level === 'low' ? 'text-green-600' :
                    analysis.risk_analysis.lease_risk_level === 'medium' ? 'text-amber-600' :
                    'text-red-600'
                  }`}>
                    {analysis.risk_analysis.lease_risk_level}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Portfolio Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Total Portfolio Value</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">£{(analysis.portfolio_metrics.total_value / 100000000).toFixed(1)}M</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Average Yield</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{analysis.portfolio_metrics.average_yield.toFixed(2)}%</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">London Concentration</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{analysis.portfolio_metrics.london_concentration.toFixed(0)}%</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Leases Expiring (3y)</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{analysis.portfolio_metrics.lease_expiry_concentration.toFixed(0)}%</p>
              </CardContent>
            </Card>
          </div>

          {/* Sector Breakdown */}
          {sectorData.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Sector Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={sectorData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name} ${value.toFixed(0)}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {sectorData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          {/* Risks & Recommendations */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-red-700 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5" />
                  Concentration Risks
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {analysis.risk_analysis.concentration_risks?.map((risk, i) => (
                    <li key={i} className="text-sm text-slate-600">• {risk}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-blue-700">Recommended Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {analysis.risk_analysis.recommended_actions?.map((action, i) => (
                    <li key={i} className="text-sm text-slate-600">→ {action}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}