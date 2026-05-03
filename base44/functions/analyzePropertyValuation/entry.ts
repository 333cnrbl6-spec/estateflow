import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { property_id } = await req.json();

    // Fetch property details
    const properties = await base44.entities.Property.list({ id: property_id });
    const property = properties[0];

    if (!property) {
      return Response.json({ error: 'Property not found' }, { status: 404 });
    }

    // Fetch units for this property
    const units = await base44.entities.Unit.filter({ property_id });

    // Fetch historical transactions
    const transactions = await base44.entities.FinancialTransaction.filter({ property_id }, '-transaction_date', 100);

    // Fetch rent ledger for historical rental data
    const rentLedger = await base44.entities.RentLedger?.filter?.({ property_id }, '-payment_date', 50) || [];

    // Calculate basic metrics
    const totalUnits = units.length;
    const averageRent = units.length > 0
      ? units.reduce((sum, u) => sum + (u.monthly_rent || 0), 0) / units.length
      : 0;

    const rentPayments = transactions.filter(t => t.transaction_type === 'rent_payment');
    const averageMonthlyIncome = rentPayments.length > 0
      ? rentPayments.reduce((sum, t) => sum + (t.amount || 0), 0) / Math.max(rentPayments.length, 1)
      : averageRent;

    // Call InvokeLLM to analyze market data and provide valuation
    const valuationAnalysis = await base44.integrations.Core.InvokeLLM({
      prompt: `You are an expert property valuation AI. Analyze the following property data and provide a comprehensive property valuation estimate with market analysis.

PROPERTY DETAILS:
- Name: ${property.name}
- Address: ${property.address_line_1}, ${property.postcode}
- Type: ${property.property_type || 'Residential'}
- Region: ${property.region || 'London'}
- Units: ${totalUnits}
- Average Unit Rent: £${(averageRent / 100).toFixed(2)}
- Monthly Income: £${(averageMonthlyIncome / 100).toFixed(2)}
- Created: ${new Date(property.created_date).toLocaleDateString()}

MARKET CONTEXT:
- Provide a valuation based on current UK property market conditions as of May 2026
- Consider comparable property values in the ${property.region || 'London'} area
- Analyze rental growth trends for ${property.property_type || 'residential'} properties
- Factor in regional economic growth and demand

PROVIDE YOUR ANALYSIS IN THIS JSON FORMAT:
{
  "estimated_value": <integer in pence, e.g., 250000000 for £250,000>,
  "estimated_yield": <decimal percentage, e.g., 5.5>,
  "market_demand_score": <0-100 integer>,
  "projected_growth_rate": <decimal percentage, positive or negative>,
  "rental_growth_rate": <decimal percentage>,
  "average_rental_yield": <decimal percentage>,
  "vacancy_rate": <decimal percentage>,
  "comparable_properties": [
    { "name": "string", "value": <pence>, "beds": <number> }
  ],
  "key_factors": ["factor1", "factor2", "factor3"],
  "analysis_summary": "2-3 sentence summary of the valuation",
  "rental_forecast": "One sentence forecast of rental trends",
  "tenant_demand_level": "High/Medium/Low",
  "price_per_sqft": <decimal>,
  "region_growth_rate": <decimal percentage>,
  "area_description": "Brief description of the area and market conditions",
  "neighborhood_score": <0-10 integer>,
  "recommendation": "Investment recommendation based on current market conditions",
  "risk_factors": "Summary of key risks to monitor"
}`,
      response_json_schema: {
        type: 'object',
        properties: {
          estimated_value: { type: 'number' },
          estimated_yield: { type: 'number' },
          market_demand_score: { type: 'number' },
          projected_growth_rate: { type: 'number' },
          rental_growth_rate: { type: 'number' },
          average_rental_yield: { type: 'number' },
          vacancy_rate: { type: 'number' },
          comparable_properties: { type: 'array' },
          key_factors: { type: 'array' },
          analysis_summary: { type: 'string' },
          rental_forecast: { type: 'string' },
          tenant_demand_level: { type: 'string' },
          price_per_sqft: { type: 'number' },
          region_growth_rate: { type: 'number' },
          area_description: { type: 'string' },
          neighborhood_score: { type: 'number' },
          recommendation: { type: 'string' },
          risk_factors: { type: 'string' }
        }
      }
    });

    // Store or update valuation in database
    // Try to find existing valuation for this property
    const existingValuations = await base44.entities.PropertyValuation?.filter?.({ property_id }) || [];
    const existingValuation = existingValuations[0];

    const valuationData = {
      property_id,
      estimated_value: Math.round(valuationAnalysis.estimated_value),
      estimated_yield: valuationAnalysis.estimated_yield,
      market_demand_score: valuationAnalysis.market_demand_score,
      projected_growth_rate: valuationAnalysis.projected_growth_rate,
      rental_growth_rate: valuationAnalysis.rental_growth_rate,
      average_rental_yield: valuationAnalysis.average_rental_yield,
      vacancy_rate: valuationAnalysis.vacancy_rate,
      comparable_properties: valuationAnalysis.comparable_properties,
      key_factors: valuationAnalysis.key_factors,
      analysis_summary: valuationAnalysis.analysis_summary,
      rental_forecast: valuationAnalysis.rental_forecast,
      tenant_demand_level: valuationAnalysis.tenant_demand_level,
      price_per_sqft: valuationAnalysis.price_per_sqft,
      region_growth_rate: valuationAnalysis.region_growth_rate,
      area_description: valuationAnalysis.area_description,
      neighborhood_score: valuationAnalysis.neighborhood_score,
      recommendation: valuationAnalysis.recommendation,
      risk_factors: valuationAnalysis.risk_factors
    };

    let valuation;
    if (existingValuation) {
      // Update existing
      await base44.entities.PropertyValuation.update(existingValuation.id, valuationData);
      valuation = { ...existingValuation, ...valuationData };
    } else {
      // Create new
      valuation = await base44.entities.PropertyValuation.create(valuationData);
    }

    // Audit log
    await base44.functions.invoke('auditLog', {
      event_type: 'property_valuation_generated',
      details: {
        property_id,
        estimated_value: valuationData.estimated_value,
        market_demand_score: valuationData.market_demand_score
      }
    });

    return Response.json({
      success: true,
      valuation_id: valuation.id,
      estimated_value: valuationData.estimated_value,
      estimated_yield: valuationData.estimated_yield
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});