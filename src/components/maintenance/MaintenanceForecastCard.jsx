import React, { useState } from 'react';
import { AlertTriangle, TrendingDown, DollarSign, CheckCircle2, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format, parseISO } from 'date-fns';

export default function MaintenanceForecastCard({ forecast, property, compact = false }) {
  const [expanded, setExpanded] = useState(!compact);

  const getRiskColor = (level) => {
    switch(level) {
      case 'critical': return 'border-red-300 bg-red-50 dark:bg-red-950 dark:border-red-800';
      case 'high': return 'border-orange-300 bg-orange-50 dark:bg-orange-950 dark:border-orange-800';
      case 'medium': return 'border-yellow-300 bg-yellow-50 dark:bg-yellow-950 dark:border-yellow-800';
      default: return 'border-green-300 bg-green-50 dark:bg-green-950 dark:border-green-800';
    }
  };

  const getRiskTextColor = (level) => {
    switch(level) {
      case 'critical': return 'text-red-800 dark:text-red-100';
      case 'high': return 'text-orange-800 dark:text-orange-100';
      case 'medium': return 'text-yellow-800 dark:text-yellow-100';
      default: return 'text-green-800 dark:text-green-100';
    }
  };

  const costSavings = forecast.cost_analysis?.cost_savings_vs_emergency || 0;

  return (
    <div className={`border-2 rounded-lg p-4 ${getRiskColor(forecast.risk_level)}`}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-3">
            <AlertTriangle className={`w-5 h-5 shrink-0 mt-0.5 ${getRiskTextColor(forecast.risk_level)}`} />
            <div className="flex-1 min-w-0">
              <h4 className={`font-semibold ${getRiskTextColor(forecast.risk_level)}`}>
                {forecast.component_description}
              </h4>
              {property && (
                <p className={`text-sm ${getRiskTextColor(forecast.risk_level)} opacity-75 mt-0.5`}>
                  {property.address_line_1}, {property.postcode}
                </p>
              )}
            </div>
          </div>

          {expanded && (
            <div className="mt-4 space-y-3 pt-4 border-t border-current opacity-75">
              {/* Key Metrics */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className={`text-xs font-medium ${getRiskTextColor(forecast.risk_level)} uppercase`}>Days Until Failure</p>
                  <p className={`text-lg font-bold ${getRiskTextColor(forecast.risk_level)} mt-1`}>
                    {forecast.days_until_failure > 0 ? forecast.days_until_failure : 'Overdue'}
                  </p>
                </div>
                <div>
                  <p className={`text-xs font-medium ${getRiskTextColor(forecast.risk_level)} uppercase`}>Confidence</p>
                  <p className={`text-lg font-bold ${getRiskTextColor(forecast.risk_level)} mt-1`}>
                    {forecast.confidence_score}%
                  </p>
                </div>
              </div>

              {/* Cost Analysis */}
              {forecast.cost_analysis && (
                <div className="grid grid-cols-2 gap-4 pt-2 border-t border-current opacity-50">
                  <div>
                    <p className={`text-xs font-medium ${getRiskTextColor(forecast.risk_level)} uppercase`}>Proactive Cost</p>
                    <p className={`text-sm font-bold ${getRiskTextColor(forecast.risk_level)} mt-1`}>
                      £{forecast.cost_analysis.estimated_repair_cost?.toLocaleString() || 0}
                    </p>
                  </div>
                  <div>
                    <p className={`text-xs font-medium ${getRiskTextColor(forecast.risk_level)} uppercase`}>If Emergency</p>
                    <p className={`text-sm font-bold ${getRiskTextColor(forecast.risk_level)} mt-1`}>
                      £{forecast.cost_analysis.potential_emergency_cost?.toLocaleString() || 0}
                    </p>
                  </div>
                </div>
              )}

              {/* Recommendations */}
              {forecast.maintenance_recommendations && forecast.maintenance_recommendations.length > 0 && (
                <div className="pt-2 border-t border-current opacity-75">
                  <p className={`text-xs font-medium ${getRiskTextColor(forecast.risk_level)} uppercase`}>Recommended Actions</p>
                  <ul className={`text-sm ${getRiskTextColor(forecast.risk_level)} mt-2 space-y-1 ml-4 list-disc`}>
                    {forecast.maintenance_recommendations[0].actions_required?.map((action, idx) => (
                      <li key={idx}>{action}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Pattern Info */}
              {forecast.supporting_data?.pattern_detected && (
                <div className="pt-2 border-t border-current opacity-75">
                  <p className={`text-xs font-medium ${getRiskTextColor(forecast.risk_level)} uppercase`}>Pattern Identified</p>
                  <p className={`text-sm ${getRiskTextColor(forecast.risk_level)} mt-1`}>
                    {forecast.supporting_data.pattern_detected}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Side - Cost Savings Badge */}
        {costSavings > 0 && (
          <div className="shrink-0 text-right">
            <div className="inline-flex items-center gap-1 text-xs font-bold text-green-700 dark:text-green-300 bg-white/50 dark:bg-black/20 px-2 py-1 rounded">
              <DollarSign className="w-3 h-3" />
              Save £{costSavings.toLocaleString()}
            </div>
          </div>
        )}
      </div>

      {compact && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setExpanded(!expanded)}
          className={`w-full mt-3 ${getRiskTextColor(forecast.risk_level)}`}
        >
          {expanded ? 'Hide Details' : 'View Details'}
        </Button>
      )}
    </div>
  );
}