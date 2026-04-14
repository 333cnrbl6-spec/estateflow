import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import PageHeader from '@/components/shared/PageHeader';
import MaintenanceForecastCard from '@/components/maintenance/MaintenanceForecastCard';
import { AlertTriangle, TrendingDown, DollarSign, Zap, Loader2, CheckCircle2 } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { useDemoFilter } from '@/hooks/useDemoFilter';

export default function MaintenanceForecasting() {
  const queryClient = useQueryClient();
  const { demoCompanyId, propertyIds, loading: demoLoading } = useDemoFilter();
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [lastRun, setLastRun] = useState(null);
  const [running, setRunning] = useState(false);

  // Fetch properties
  const { data: properties = [] } = useQuery({
    queryKey: ['properties-forecasting', demoCompanyId],
    enabled: !demoLoading,
    queryFn: async () => {
      if (demoCompanyId) {
        const p = await base44.entities.Property.get(demoCompanyId);
        return p ? [p] : [];
      }
      return base44.entities.Property.list('-updated_date', 100);
    }
  });

  // Fetch forecasts
  const { data: forecasts = [], isLoading: forecastsLoading } = useQuery({
    queryKey: ['maintenance-forecasts', selectedProperty],
    queryFn: async () => {
      if (selectedProperty) {
        return base44.entities.MaintenanceForecast.filter(
          { property_id: selectedProperty },
          '-days_until_failure',
          100
        );
      }
      return base44.entities.MaintenanceForecast.list('-days_until_failure', 200);
    }
  });

  // Run prediction analysis
  const runPredictionMutation = useMutation({
    mutationFn: async () => {
      return await base44.functions.invoke('predictMaintenanceNeeds', {});
    },
    onSuccess: () => {
      setLastRun(new Date());
      queryClient.invalidateQueries({ queryKey: ['maintenance-forecasts'] });
    }
  });

  const handleRunPredictions = async () => {
    setRunning(true);
    try {
      await runPredictionMutation.mutateAsync();
    } catch (err) {
      console.error('Failed to run predictions:', err);
    } finally {
      setRunning(false);
    }
  };

  // Calculate statistics
  const stats = {
    totalForecasts: forecasts.length,
    criticalRisk: forecasts.filter(f => f.risk_level === 'critical').length,
    highRisk: forecasts.filter(f => f.risk_level === 'high').length,
    potentialSavings: forecasts.reduce((sum, f) => 
      sum + ((f.cost_analysis?.cost_savings_vs_emergency || 0)), 0
    )
  };

  const criticalForecasts = forecasts.filter(f => f.risk_level === 'critical' || f.risk_level === 'high')
    .sort((a, b) => a.days_until_failure - b.days_until_failure);

  const lowRiskForecasts = forecasts.filter(f => f.risk_level === 'low' || f.risk_level === 'medium');

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background">
      <div className="p-8 max-w-[1400px] mx-auto">
        <PageHeader
          title="Maintenance Forecasting"
          subtitle="Predictive analytics for property maintenance needs and cost optimization"
        >
          <Button
            onClick={handleRunPredictions}
            disabled={running || forecastsLoading}
            size="sm"
          >
            {running ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 mr-2" />
                Run Analysis
              </>
            )}
          </Button>
        </PageHeader>

        {lastRun && (
          <div className="mb-6 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
              <p className="text-sm text-green-800 dark:text-green-200">
                Analysis completed {lastRun.toLocaleTimeString()}
              </p>
            </div>
          </div>
        )}

        {/* Statistics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-card border border-border rounded-lg p-4">
            <p className="text-sm text-muted-foreground">Total Forecasts</p>
            <p className="text-2xl font-bold text-foreground mt-1">{stats.totalForecasts}</p>
          </div>
          <div className="bg-card border border-red-200 dark:border-red-800 rounded-lg p-4">
            <p className="text-sm text-red-700 dark:text-red-300 font-semibold">Critical Risk</p>
            <p className="text-2xl font-bold text-red-600 mt-1">{stats.criticalRisk}</p>
          </div>
          <div className="bg-card border border-orange-200 dark:border-orange-800 rounded-lg p-4">
            <p className="text-sm text-orange-700 dark:text-orange-300 font-semibold">High Risk</p>
            <p className="text-2xl font-bold text-orange-600 mt-1">{stats.highRisk}</p>
          </div>
          <div className="bg-card border border-green-200 dark:border-green-800 rounded-lg p-4">
            <p className="text-sm text-green-700 dark:text-green-300 font-semibold">Potential Savings</p>
            <p className="text-2xl font-bold text-green-600 mt-1">£{stats.potentialSavings.toLocaleString()}</p>
          </div>
        </div>

        <Tabs defaultValue="critical" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="critical">
              Critical & High Risk ({stats.criticalRisk + stats.highRisk})
            </TabsTrigger>
            <TabsTrigger value="all">All Forecasts ({stats.totalForecasts})</TabsTrigger>
            <TabsTrigger value="analysis">Analysis Details</TabsTrigger>
          </TabsList>

          {/* Critical Forecasts */}
          <TabsContent value="critical" className="mt-6 space-y-4">
            {forecastsLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            ) : criticalForecasts.length === 0 ? (
              <div className="bg-card border border-border rounded-lg p-12 text-center">
                <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-3 opacity-50" />
                <p className="text-muted-foreground font-semibold">No critical issues</p>
                <p className="text-sm text-muted-foreground mt-1">All properties are in good maintenance condition</p>
              </div>
            ) : (
              criticalForecasts.map(forecast => (
                <MaintenanceForecastCard
                  key={forecast.id}
                  forecast={forecast}
                  property={properties.find(p => p.id === forecast.property_id)}
                />
              ))
            )}
          </TabsContent>

          {/* All Forecasts */}
          <TabsContent value="all" className="mt-6 space-y-4">
            {forecastsLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            ) : forecasts.length === 0 ? (
              <div className="bg-card border border-border rounded-lg p-12 text-center">
                <AlertTriangle className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                <p className="text-muted-foreground font-semibold">No forecasts yet</p>
                <p className="text-sm text-muted-foreground mt-1">Click "Run Analysis" to generate maintenance forecasts</p>
              </div>
            ) : (
              <div className="space-y-4">
                {criticalForecasts.map(forecast => (
                  <MaintenanceForecastCard
                    key={forecast.id}
                    forecast={forecast}
                    property={properties.find(p => p.id === forecast.property_id)}
                    compact={true}
                  />
                ))}
                {lowRiskForecasts.length > 0 && (
                  <>
                    <h4 className="font-semibold text-foreground mt-6 mb-3">Lower Risk Items</h4>
                    {lowRiskForecasts.map(forecast => (
                      <MaintenanceForecastCard
                        key={forecast.id}
                        forecast={forecast}
                        property={properties.find(p => p.id === forecast.property_id)}
                        compact={true}
                      />
                    ))}
                  </>
                )}
              </div>
            )}
          </TabsContent>

          {/* Analysis Details */}
          <TabsContent value="analysis" className="mt-6">
            <div className="space-y-6">
              {/* ROI Analysis */}
              <div className="bg-card border border-border rounded-lg p-6">
                <h4 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-green-600" />
                  Proactive vs Emergency Cost Analysis
                </h4>
                
                <div className="space-y-4">
                  <div className="p-4 bg-muted/50 rounded-lg border border-border">
                    <p className="text-sm font-medium text-foreground">Total Estimated Repair Costs</p>
                    <p className="text-2xl font-bold text-foreground mt-2">
                      £{forecasts.reduce((sum, f) => sum + (f.cost_analysis?.estimated_repair_cost || 0), 0).toLocaleString()}
                    </p>
                  </div>

                  <div className="p-4 bg-red-50 dark:bg-red-950 rounded-lg border border-red-200 dark:border-red-800">
                    <p className="text-sm font-medium text-red-900 dark:text-red-100">Cost if Becomes Emergency</p>
                    <p className="text-2xl font-bold text-red-600 mt-2">
                      £{forecasts.reduce((sum, f) => sum + (f.cost_analysis?.potential_emergency_cost || 0), 0).toLocaleString()}
                    </p>
                  </div>

                  <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800">
                    <p className="text-sm font-medium text-green-900 dark:text-green-100">Potential Cost Savings</p>
                    <p className="text-2xl font-bold text-green-600 mt-2">
                      £{stats.potentialSavings.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Component Risk Distribution */}
              <div className="bg-card border border-border rounded-lg p-6">
                <h4 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                  <TrendingDown className="w-5 h-5 text-primary" />
                  Risk Distribution by Component
                </h4>

                <div className="space-y-3">
                  {['critical', 'high', 'medium', 'low'].map(level => {
                    const count = forecasts.filter(f => f.risk_level === level).length;
                    const percentage = stats.totalForecasts > 0 ? (count / stats.totalForecasts) * 100 : 0;
                    
                    return (
                      <div key={level} className="space-y-1">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-foreground capitalize">{level} Risk</p>
                          <p className="text-sm text-muted-foreground">{count} forecasts</p>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${
                              level === 'critical' ? 'bg-red-600' :
                              level === 'high' ? 'bg-orange-600' :
                              level === 'medium' ? 'bg-yellow-600' :
                              'bg-green-600'
                            }`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Next Maintenance Timeline */}
              <div className="bg-card border border-border rounded-lg p-6">
                <h4 className="font-semibold text-foreground mb-4">Next Maintenance Timeline</h4>
                
                <div className="space-y-3">
                  {[30, 60, 90, 180].map(days => {
                    const count = forecasts.filter(f => f.days_until_failure && f.days_until_failure <= days).length;
                    
                    return (
                      <div key={days} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg border border-border">
                        <p className="text-sm font-medium text-foreground">Next {days} days</p>
                        <span className="text-lg font-bold text-primary">{count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}