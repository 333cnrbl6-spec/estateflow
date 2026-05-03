import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TrendingUp, Home, MapPin, DollarSign, Zap } from 'lucide-react';
import ProcessingFeedback from '@/components/ui/ProcessingFeedback';
import RentalRecommendationCard from '@/components/rental/RentalRecommendationCard';
import MarketComparablesList from '@/components/rental/MarketComparablesList';
import { toast } from 'sonner';

export default function RentalPriceOptimization() {
  const [selectedPropertyId, setSelectedPropertyId] = useState(null);
  const queryClient = useQueryClient();

  // Fetch properties
  const { data: properties = [] } = useQuery({
    queryKey: ['properties'],
    queryFn: () => base44.entities.Property.list('-updated_date', 100)
  });

  // Fetch units with rental data
  const { data: units = [] } = useQuery({
    queryKey: ['units'],
    queryFn: () => base44.entities.Unit.list('-updated_date', 200)
  });

  // Fetch rental recommendations
  const { data: rentalRecommendations = [] } = useQuery({
    queryKey: ['rental-recommendations'],
    queryFn: () => base44.entities.RentalRecommendation?.list?.('-updated_date', 100) || Promise.resolve([])
  });

  // Analyze rental market and generate recommendations
  const analyzeRentalMutation = useMutation({
    mutationFn: async (propertyId) => {
      return await base44.functions.invoke('generateRentalPriceRecommendation', {
        property_id: propertyId
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rental-recommendations'] });
      toast.success('Rental analysis complete');
    },
    onError: (error) => {
      toast.error('Analysis failed: ' + error.message);
    }
  });

  const selectedProperty = properties.find(p => p.id === selectedPropertyId);
  const propertyUnits = units.filter(u => u.property_id === selectedPropertyId);
  const propertyRecommendation = rentalRecommendations.find(r => r.property_id === selectedPropertyId);

  // Calculate portfolio stats
  const totalIncome = propertyUnits.reduce((sum, u) => sum + (u.monthly_rent || 0), 0);
  const recommendedIncome = rentalRecommendations.reduce((sum, r) => {
    const propUnits = units.filter(u => u.property_id === r.property_id);
    return sum + (propUnits.reduce((s, u) => s + (r.recommended_rent || 0), 0));
  }, 0);
  const potentialGain = recommendedIncome - totalIncome;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 flex items-center gap-2">
            <TrendingUp className="w-8 h-8 text-primary" />
            Rental Price Optimizer
          </h1>
          <p className="text-muted-foreground mt-2">
            AI-powered market analysis for optimal rental pricing
          </p>
        </div>

        {/* Portfolio Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">Total Properties</p>
              <p className="text-3xl font-bold text-slate-900 mt-2">{properties.length}</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">Current Monthly Income</p>
              <p className="text-2xl font-bold text-slate-900 mt-2">
                £{(totalIncome / 100).toLocaleString()}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">Potential Monthly Gain</p>
              <p className={`text-2xl font-bold mt-2 ${potentialGain > 0 ? 'text-green-600' : 'text-slate-900'}`}>
                £{(potentialGain / 100).toLocaleString()}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">Analyzed</p>
              <p className="text-3xl font-bold text-slate-900 mt-2">{rentalRecommendations.length}</p>
            </CardContent>
          </Card>
        </div>

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
                {/* Property Info */}
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
                          {selectedProperty.address_line_1}
                        </p>
                      </div>
                      <Button
                        onClick={() => analyzeRentalMutation.mutate(selectedPropertyId)}
                        disabled={analyzeRentalMutation.isPending}
                        className="gap-2"
                      >
                        <Zap className="w-4 h-4" />
                        {analyzeRentalMutation.isPending ? 'Analyzing...' : 'Analyze Market'}
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Total Units</p>
                        <p className="text-2xl font-bold text-slate-900 mt-1">{propertyUnits.length}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Current Total Rent</p>
                        <p className="text-2xl font-bold text-slate-900 mt-1">
                          £{(propertyUnits.reduce((sum, u) => sum + (u.monthly_rent || 0), 0) / 100).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Processing */}
                {analyzeRentalMutation.isPending && (
                  <ProcessingFeedback
                    label="Analyzing rental market..."
                    detail="Comparing local listings and market trends"
                    tips={[
                      'Searching land registry comparable properties...',
                      'Analyzing local rental market trends...',
                      'Calculating optimal pricing...'
                    ]}
                  />
                )}

                {/* Rental Recommendation */}
                {propertyRecommendation && (
                  <RentalRecommendationCard
                    recommendation={propertyRecommendation}
                    units={propertyUnits}
                    property={selectedProperty}
                  />
                )}

                {/* Market Comparables */}
                {propertyRecommendation && propertyRecommendation.comparable_properties && (
                  <MarketComparablesList
                    comparables={propertyRecommendation.comparable_properties}
                  />
                )}

                {!propertyRecommendation && !analyzeRentalMutation.isPending && (
                  <Card>
                    <CardContent className="pt-6 text-center">
                      <p className="text-muted-foreground mb-4">No analysis yet</p>
                      <Button
                        onClick={() => analyzeRentalMutation.mutate(selectedPropertyId)}
                        className="gap-2"
                      >
                        <Zap className="w-4 h-4" />
                        Generate Analysis
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </div>
        ) : (
          // Properties List
          <div className="grid md:grid-cols-2 gap-4">
            {properties.length === 0 ? (
              <Card className="md:col-span-2">
                <CardContent className="pt-6 text-center">
                  <p className="text-muted-foreground">No properties found</p>
                </CardContent>
              </Card>
            ) : (
              properties.map(property => {
                const recommendation = rentalRecommendations.find(r => r.property_id === property.id);
                const propUnits = units.filter(u => u.property_id === property.id);
                const currentRent = propUnits.reduce((sum, u) => sum + (u.monthly_rent || 0), 0);
                const recommendedRent = recommendation?.recommended_rent || 0;
                const difference = recommendedRent - currentRent;
                const percentChange = currentRent > 0 ? ((difference / currentRent) * 100).toFixed(1) : 0;

                return (
                  <Card
                    key={property.id}
                    className="hover:shadow-lg transition-shadow cursor-pointer"
                    onClick={() => setSelectedPropertyId(property.id)}
                  >
                    <CardHeader>
                      <CardTitle className="text-lg">{property.name}</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">{property.postcode}</p>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Units</span>
                        <Badge variant="outline">{propUnits.length}</Badge>
                      </div>

                      {recommendation ? (
                        <div className="space-y-2 border-t pt-3">
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Current</span>
                            <span className="font-medium">£{(currentRent / 100).toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Recommended</span>
                            <span className="font-bold text-primary">
                              £{(recommendedRent / 100).toLocaleString()}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Change</span>
                            <Badge className={difference >= 0 ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'}>
                              {difference >= 0 ? '+' : ''}{(difference / 100).toFixed(2)} ({percentChange}%)
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground pt-2">
                            Updated: {new Date(recommendation.updated_date).toLocaleDateString()}
                          </p>
                        </div>
                      ) : (
                        <div className="text-center py-3">
                          <p className="text-sm text-muted-foreground mb-3">No analysis yet</p>
                          <Button
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              analyzeRentalMutation.mutate(property.id);
                            }}
                            disabled={analyzeRentalMutation.isPending}
                            className="gap-1"
                          >
                            <Zap className="w-3 h-3" />
                            Analyze
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
      </div>
    </div>
  );
}