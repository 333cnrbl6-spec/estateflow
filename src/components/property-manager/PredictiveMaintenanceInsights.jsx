import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { base44 } from '@/api/base44Client';
import { AlertTriangle, AlertCircle, Zap, TrendingUp } from 'lucide-react';

const RISK_COLORS = {
  critical: { bg: 'bg-red-100', text: 'text-red-800', icon: AlertTriangle, label: 'Critical' },
  high: { bg: 'bg-orange-100', text: 'text-orange-800', icon: AlertCircle, label: 'High' },
  medium: { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: Zap, label: 'Medium' },
  low: { bg: 'bg-green-100', text: 'text-green-800', icon: TrendingUp, label: 'Low' }
};

export default function PredictiveMaintenanceInsights() {
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPredictions();
  }, []);

  const loadPredictions = async () => {
    try {
      const result = await base44.functions.invoke('predictMaintenanceNeeds', {});
      if (result.data?.predictions) {
        setPredictions(result.data.predictions);
      }
    } catch (err) {
      console.error('Error loading predictions:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Card><CardContent className="py-8 text-center text-muted-foreground">Analyzing maintenance patterns...</CardContent></Card>;
  }

  if (predictions.length === 0) {
    return <Card><CardContent className="py-8 text-center text-muted-foreground">No properties to analyze</CardContent></Card>;
  }

  const criticalProps = predictions.filter(p => p.riskLevel === 'critical');
  const highProps = predictions.filter(p => p.riskLevel === 'high');

  return (
    <div className="space-y-4">
      {/* Summary Alert */}
      {(criticalProps.length > 0 || highProps.length > 0) && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="pt-6">
            <div className="flex gap-3">
              <AlertTriangle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-sm text-orange-900">Maintenance Alert</p>
                <p className="text-sm text-orange-800 mt-1">
                  {criticalProps.length} properties need urgent attention, {highProps.length} properties are at high risk
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Predictions by Risk Level */}
      {['critical', 'high', 'medium', 'low'].map(level => {
        const props = predictions.filter(p => p.riskLevel === level);
        if (props.length === 0) return null;

        const riskConfig = RISK_COLORS[level];
        const Icon = riskConfig.icon;

        return (
          <div key={level}>
            <h3 className="font-semibold mb-3 text-sm flex items-center gap-2">
              <Icon className={`w-4 h-4 ${riskConfig.text}`} />
              <span className="capitalize">{riskConfig.label} Risk ({props.length})</span>
            </h3>

            <div className="space-y-3">
              {props.map(prop => (
                <Card key={prop.propertyId} className={`${riskConfig.bg} border-0`}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h4 className={`font-semibold ${riskConfig.text}`}>{prop.propertyName}</h4>

                        <div className="mt-3 space-y-1">
                          {prop.riskFactors.map((factor, idx) => (
                            <div key={idx} className={`text-xs ${riskConfig.text} flex items-start gap-2`}>
                              <span className="flex-shrink-0 mt-1">•</span>
                              <span>{factor}</span>
                            </div>
                          ))}
                        </div>

                        <div className="mt-4 grid grid-cols-3 gap-3 text-xs">
                          <div>
                            <p className="text-muted-foreground">Maintenance</p>
                            <p className={`font-semibold ${riskConfig.text}`}>{prop.maintenanceCount} jobs</p>
                          </div>
                          {prop.expiredDocuments > 0 && (
                            <div>
                              <p className="text-muted-foreground">Expired Docs</p>
                              <p className="font-semibold text-red-700">{prop.expiredDocuments}</p>
                            </div>
                          )}
                          {prop.expiringDocuments > 0 && (
                            <div>
                              <p className="text-muted-foreground">Expiring Soon</p>
                              <p className={`font-semibold ${riskConfig.text}`}>{prop.expiringDocuments}</p>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="text-right flex-shrink-0">
                        <div className={`text-3xl font-bold ${riskConfig.text}`}>{prop.riskScore}</div>
                        <p className="text-xs text-muted-foreground">Risk Score</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}