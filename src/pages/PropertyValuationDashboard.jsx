import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TrendingUp, Home, MapPin, DollarSign, Zap, RefreshCw } from 'lucide-react';
import ProcessingFeedback from '@/components/ui/ProcessingFeedback';
import PropertyValuationCard from '@/components/valuation/PropertyValuationCard';
import MarketAnalysisPanel from '@/components/valuation/MarketAnalysisPanel';
import { toast } from 'sonner';

export default function PropertyValuationDashboard() {
  const [selectedPropertyId, setSelectedPropertyId] = useState(null);
  const queryClient = useQueryClient();

  // Fetch all properties
  const { data: properties = [] } = useQuery({
    queryKey: ['properties'],
    queryFn: () => base44.entities.Property.list('-updated_date', 100)
  });

  // Fetch units for property details
  const { data: units = [] } = useQuery({
    queryKey: ['units'],
    queryFn: () => base44.entities.Unit.list('-updated_date', 200)
  });

  // Fetch valuations
  const { data: valuations = [] } = useQuery({
    queryKey: ['property-valuations'],
    queryFn: () => base44.entities.PropertyValuation?.list?.('-updated_date', 100) || Promise.resolve([])
  });

  // Analyze and generate valuation
  const analyzeValuationMutation = useMutation({
    mutationFn: async (propertyId) => {
      return await base44.functions.invoke('analyzePropertyValuation', {
        property_id: propertyId
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['property-valuations'] });
      toast.success('Property valuation analysis complete');
    },
    onError: (error) => {
      toast.error('Valuation failed: ' + error.message);
    }
  });

  const selectedProperty = properties.find(p => p.id === selectedPropertyId);
  const propertyUnits = units.filter(u => u.property_id === selectedPropertyId);
  const propertyValuation = valuations.find(v => v.property_id === selectedPropertyId);

  // Calculate stats
  const hasValuations = valuations.length > 0;
  const avgValuation = hasValuations
    ? Math.round(valuations.reduce((sum, v) => sum + (v.estimated_value || 0), 0) / valuations.length)
    : 0;
  const recentValuations = valuations.slice(0, 5);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 flex items-center gap-2">
            <TrendingUp className="w-8 h-8 text-primary" />
            Property Valuation Engine
          </h1>
          <p className="text-muted-foreground mt-2">
            AI-powered market analysis and automated property value estimates
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">Total Properties</p>
              <p className="text-3xl font-bold text-slate-900 mt-2">{properties.length}</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">Valuations Generated</p>
              <p className="text-3xl font-bold text-slate-900 mt-2">{valuations.length}</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">Avg Portfolio Value</p>
              <p className="text-2xl font-bold text-slate-900 mt-2">£{(avgValuation / 100).toLocaleString()}</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">Last Updated</p>
              <p className="text-sm font-medium text-slate-900 mt-2">
                {recentValuations[0]?.updated_date
                  ? new Date(recentValuations[0].updated_date).toLocaleDateString()
                  : 'Never'}
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="properties" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="properties">Properties</TabsTrigger>
            <TabsTrigger value="analysis">Market Analysis</TabsTrigger>
          </TabsList>

          {/* Properties Tab */}
          <TabsContent value="properties" className="space-y-4">
            {selectedPropertyId ? (
              // Property Detail View
              <div className="space-y-6">
                <Button
                  variant="outline"
                  onClick={() => setSelectedPropertyId(null)}
                  className="gap-1"
                >
                  ← Back to Properties
                </Button>

                {selectedProperty && (
                  <div className="space-y-6">
                    {/* Property Header */}
                    <Card>
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="flex items-center gap-2">
                              <Home className="w-5 h-5" />
                              {selectedProperty.name}
                            </CardTitle>
                            <p className="text-sm text-muted-foreground mt-2 flex items-center gap-1">
                              <MapPin className="w-4 h-4" />
                              {selectedProperty.address_line_1}, {selectedProperty.postcode}
                            </p>
                          </div>
                          <Button
                            onClick={() => analyzeValuationMutation.mutate(selectedPropertyId)}
                            disabled={analyzeValuationMutation.isPending}
                            className="gap-2"
                          >
                            <Zap className="w-4 h-4" />
                            {analyzeValuationMutation.isPending ? 'Analyzing...' : 'Generate Valuation'}
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid md:grid-cols-3 gap-4">
                          <div>
                            <p className="text-sm text-muted-foreground">Property Type</p>
                            <p className="font-semibold text-slate-900 mt-1 capitalize">
                              {selectedProperty.property_type || 'Residential'}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Units</p>
                            <p className="font-semibold text-slate-900 mt-1">{propertyUnits.length}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Region</p>
                            <p className="font-semibold text-slate-900 mt-1 capitalize">
                              {selectedProperty.region || 'N/A'}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Processing Feedback */}
                    {analyzeValuationMutation.isPending && (
                      <ProcessingFeedback
                        label="Analyzing property..."
                        detail="Comparing market data, rental trends, and comparable listings"
                        tips={[
                          'Analyzing local comparable properties...',
                          'Processing historical rental data...',
                          'Calculating market demand indicators...'
                        ]}
                      />
                    )}

                    {/* Valuation Results */}
                    {propertyValuation && (
                      <PropertyValuationCard
                        property={selectedProperty}
                        valuation={propertyValuation}
                        units={propertyUnits}
                      />
                    )}

                    {/* Market Analysis */}
                    {propertyValuation && (
                      <MarketAnalysisPanel
                        property={selectedProperty}
                        valuation={propertyValuation}
                      />
                    )}

                    {!propertyValuation && !analyzeValuationMutation.isPending && (
                      <Card>
                        <CardContent className="pt-6 text-center">
                          <p className="text-muted-foreground">No valuation generated yet</p>
                          <Button
                            onClick={() => analyzeValuationMutation.mutate(selectedPropertyId)}
                            className="mt-4 gap-2"
                          >
                            <Zap className="w-4 h-4" />
                            Generate First Valuation
                          </Button>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                )}
              </div>
            ) : (
              // Properties List View
              <div className="grid md:grid-cols-2 gap-4">
                {properties.length === 0 ? (
                  <Card className="md:col-span-2">
                    <CardContent className="pt-6 text-center">
                      <p className="text-muted-foreground">No properties found</p>
                    </CardContent>
                  </Card>
                ) : (
                  properties.map(property => {
                    const valuation = valuations.find(v => v.property_id === property.id);
                    const propUnits = units.filter(u => u.property_id === property.id);

                    return (
                      <Card
                        key={property.id}
                        className="hover:shadow-lg transition-shadow cursor-pointer"
                        onClick={() => setSelectedPropertyId(property.id)}
                      >
                        <CardHeader>
                          <CardTitle className="text-lg flex items-center gap-2">
                            <Home className="w-5 h-5 text-primary" />
                            {property.name}
                          </CardTitle>
                          <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {property.postcode}
                          </p>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Units</span>
                            <Badge variant="outline">{propUnits.length}</Badge>
                          </div>

                          {valuation ? (
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-muted-foreground">Estimated Value</span>
                                <span className="text-lg font-bold text-primary">
                                  £{(valuation.estimated_value / 100).toLocaleString()}
                                </span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-muted-foreground">Est. Yield</span>
                                <span className="text-sm font-semibold text-slate-900">
                                  {valuation.estimated_yield?.toFixed(2)}%
                                </span>
                              </div>
                              <p className="text-xs text-muted-foreground">
                                Updated: {new Date(valuation.updated_date).toLocaleDateString()}
                              </p>
                            </div>
                          ) : (
                            <div className="text-center py-4">
                              <p className="text-sm text-muted-foreground mb-3">No valuation yet</p>
                              <Button
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  analyzeValuationMutation.mutate(property.id);
                                }}
                                disabled={analyzeValuationMutation.isPending}
                                className="gap-1"
                              >
                                <Zap className="w-3 h-3" />
                                Generate
                              </Button>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })
                )}
              </div>
            )}
          </TabsContent>

          {/* Market Analysis Tab */}
          <TabsContent value="analysis" className="space-y-4">
            {valuations.length === 0 ? (
              <Card>
                <CardContent className="pt-6 text-center">
                  <p className="text-muted-foreground">Generate valuations to view market analysis</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Portfolio Market Insights</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4">
                        <p className="text-sm text-blue-700">Total Portfolio Value</p>
                        <p className="text-2xl font-bold text-blue-900 mt-1">
                          £{valuations.reduce((sum, v) => sum + (v.estimated_value || 0), 0).toLocaleString() / 100}
                        </p>
                      </div>

                      <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4">
                        <p className="text-sm text-green-700">Average Yield</p>
                        <p className="text-2xl font-bold text-green-900 mt-1">
                          {(valuations.reduce((sum, v) => sum + (v.estimated_yield || 0), 0) / valuations.length).toFixed(2)}%
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div className="space-y-4">
                  {recentValuations.map(valuation => {
                    const prop = properties.find(p => p.id === valuation.property_id);
                    return (
                      <Card key={valuation.id}>
                        <CardHeader>
                          <CardTitle className="text-base">{prop?.name || 'Property'}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Estimated Value</span>
                            <span className="font-semibold">
                              £{(valuation.estimated_value / 100).toLocaleString()}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Market Demand</span>
                            <Badge className="text-xs">
                              {valuation.market_demand_score ? `${valuation.market_demand_score}/100` : 'N/A'}
                            </Badge>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Growth Forecast</span>
                            <span className="font-semibold text-green-600">
                              {valuation.projected_growth_rate ? `+${valuation.projected_growth_rate.toFixed(1)}%` : 'N/A'}
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}