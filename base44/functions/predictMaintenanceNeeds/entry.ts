import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const today = new Date();
    const results = {
      forecastsCreated: 0,
      forecastsUpdated: 0,
      propertiesAnalyzed: 0,
      totalCostSavingsPotential: 0,
      errors: []
    };

    // Fetch all properties
    const properties = await base44.asServiceRole.entities.Property.list('-updated_date', 500);

    for (const property of properties) {
      try {
        // Fetch maintenance history
        const maintenanceRecords = await base44.asServiceRole.entities.MaintenanceOrder.filter(
          { property_id: property.id },
          '-created_date',
          200
        );

        if (maintenanceRecords.length === 0) {
          continue;
        }

        results.propertiesAnalyzed++;

        // Analyze historical data
        const analysis = analyzeMaintenanceHistory(maintenanceRecords, property);

        // Use LLM to generate predictions
        const predictions = await base44.integrations.Core.InvokeLLM({
          prompt: `You are a property maintenance expert. Analyze this property maintenance data and predict future maintenance needs:

Property: ${property.address_line_1}, ${property.postcode}
Property Type: ${property.property_type || 'residential'}
Age (years): ${property.year_built ? new Date().getFullYear() - parseInt(property.year_built) : 'unknown'}

Historical Maintenance Analysis:
${JSON.stringify(analysis, null, 2)}

Based on this data:
1. Identify the top 3 most critical maintenance components that will likely need attention soon
2. For each, predict when failure might occur (in days)
3. Estimate repair costs and potential emergency costs
4. Suggest preventive maintenance schedules
5. Calculate cost savings from proactive maintenance

Respond in JSON format with array of predictions, each containing:
{
  "component_type": "hvac|roofing|plumbing|electrical|water_heater|etc",
  "component_description": "specific component description",
  "days_until_failure": number,
  "confidence_score": 0-100,
  "risk_level": "low|medium|high|critical",
  "average_repair_cost": number,
  "estimated_emergency_cost": number,
  "recommendation": "specific action to take",
  "suggested_date": "YYYY-MM-DD",
  "pattern_detected": "description of maintenance pattern"
}`,
          response_json_schema: {
            type: 'object',
            properties: {
              predictions: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    component_type: { type: 'string' },
                    component_description: { type: 'string' },
                    days_until_failure: { type: 'number' },
                    confidence_score: { type: 'number' },
                    risk_level: { type: 'string' },
                    average_repair_cost: { type: 'number' },
                    estimated_emergency_cost: { type: 'number' },
                    recommendation: { type: 'string' },
                    suggested_date: { type: 'string' },
                    pattern_detected: { type: 'string' }
                  }
                }
              }
            }
          }
        });

        // Store forecasts
        for (const pred of predictions.predictions || []) {
          const suggestedDate = new Date(pred.suggested_date);
          const daysUntil = Math.ceil((suggestedDate - today) / (1000 * 60 * 60 * 24));

          // Check if forecast already exists for this component
          const existingForecasts = await base44.asServiceRole.entities.MaintenanceForecast.filter(
            {
              property_id: property.id,
              component_type: pred.component_type
            },
            '-forecast_date',
            1
          );

          const forecastData = {
            property_id: property.id,
            component_type: pred.component_type,
            component_description: pred.component_description,
            forecast_date: today.toISOString(),
            predicted_failure_date: pred.suggested_date,
            days_until_failure: daysUntil,
            confidence_score: pred.confidence_score,
            risk_level: pred.risk_level,
            historical_frequency: analysis.componentFrequency[pred.component_type] || {},
            cost_analysis: {
              average_cost_per_repair: pred.average_repair_cost,
              estimated_repair_cost: pred.average_repair_cost,
              potential_emergency_cost: pred.estimated_emergency_cost,
              emergency_multiplier: pred.estimated_emergency_cost / pred.average_repair_cost
            },
            maintenance_recommendations: [
              {
                recommendation_id: 'rec_1',
                recommendation: pred.recommendation,
                priority: pred.risk_level === 'critical' ? 'urgent' : 
                         pred.risk_level === 'high' ? 'high' :
                         pred.risk_level === 'medium' ? 'medium' : 'low',
                suggested_date: pred.suggested_date,
                estimated_cost: pred.average_repair_cost,
                cost_savings_vs_emergency: pred.estimated_emergency_cost - pred.average_repair_cost,
                actions_required: [
                  'Schedule inspection',
                  'Get contractor quotes',
                  'Plan maintenance window'
                ]
              }
            ],
            supporting_data: {
              analysis_basis: `${maintenanceRecords.length} historical records analyzed`,
              pattern_detected: pred.pattern_detected,
              comparison_to_benchmark: 'Property maintenance pattern requires attention'
            },
            status: 'pending'
          };

          if (existingForecasts.length > 0) {
            await base44.asServiceRole.entities.MaintenanceForecast.update(
              existingForecasts[0].id,
              forecastData
            );
            results.forecastsUpdated++;
          } else {
            await base44.asServiceRole.entities.MaintenanceForecast.create(forecastData);
            results.forecastsCreated++;
          }

          results.totalCostSavingsPotential += (pred.estimated_emergency_cost - pred.average_repair_cost);
        }

      } catch (err) {
        results.errors.push({
          property_id: property.id,
          property_name: property.address_line_1,
          error: err.message
        });
      }
    }

    return Response.json({
      success: true,
      timestamp: new Date().toISOString(),
      summary: results
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});

function analyzeMaintenanceHistory(records, property) {
  const componentFrequency = {};
  const componentCosts = {};
  const componentDates = {};

  for (const record of records) {
    const category = record.category || 'other';
    
    if (!componentFrequency[category]) {
      componentFrequency[category] = {
        count: 0,
        dates: [],
        costs: []
      };
    }

    componentFrequency[category].count++;
    if (record.created_date) {
      componentFrequency[category].dates.push(new Date(record.created_date));
    }
    if (record.estimated_cost || record.actual_cost) {
      componentFrequency[category].costs.push(record.actual_cost || record.estimated_cost || 0);
    }
  }

  // Calculate intervals and averages
  for (const [component, data] of Object.entries(componentFrequency)) {
    const costs = data.costs;
    const dates = data.dates.sort((a, b) => a - b);

    let avgInterval = null;
    if (dates.length > 1) {
      const intervals = [];
      for (let i = 1; i < dates.length; i++) {
        intervals.push((dates[i] - dates[i-1]) / (1000 * 60 * 60 * 24));
      }
      avgInterval = Math.round(intervals.reduce((a, b) => a + b, 0) / intervals.length);
    }

    const avgCost = costs.length > 0 ? costs.reduce((a, b) => a + b, 0) / costs.length : 0;

    componentFrequency[component] = {
      past_12_months: data.count,
      average_interval_days: avgInterval,
      last_maintenance_date: dates.length > 0 ? dates[dates.length - 1].toISOString().split('T')[0] : null,
      average_cost_per_repair: Math.round(avgCost)
    };
  }

  return {
    total_records: records.length,
    date_range: {
      oldest: Math.min(...records.map(r => new Date(r.created_date).getTime())) ? new Date(Math.min(...records.map(r => new Date(r.created_date).getTime()))).toISOString().split('T')[0] : null,
      newest: records.length > 0 ? new Date(records[0].created_date).toISOString().split('T')[0] : null
    },
    componentFrequency: componentFrequency,
    total_maintenance_cost: Object.values(componentFrequency).reduce((sum, comp) => sum + (comp.average_cost_per_repair * comp.past_12_months), 0)
  };
}