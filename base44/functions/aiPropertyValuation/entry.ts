import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { property_data, listing_id } = await req.json();

    // Prepare prompt for AI valuation
    const prompt = `You are an expert property valuer analyzing UK real estate data. Based on the following property information and market data, provide a professional valuation.

PROPERTY DETAILS:
- Name: ${property_data.property.name}
- Location: ${property_data.property.address}
- Region: ${property_data.property.region}
- Type: ${property_data.property.property_type}
- Ownership: ${property_data.property.ownership_type}
- Total Units: ${property_data.property.total_units}
- Year Built: ${property_data.property.year_built}

COMPARABLE LISTINGS (Current Market):
${property_data.comparables.length > 0 
  ? property_data.comparables.map((c, i) => 
      `${i + 1}. £${c.asking_price?.toLocaleString()} - ${c.property_type}, ${c.bedrooms} bed, Status: ${c.status}, Listed: ${c.listed_date}`
    ).join('\n')
  : 'No comparable active listings available'}

RECENT SALES (Completed Transactions):
${property_data.recent_sales.length > 0
  ? property_data.recent_sales.map((s, i) => 
      `${i + 1}. Sold: £${s.sale_price?.toLocaleString()}, Date: ${s.sale_date}, Days on Market: ${s.days_on_market}`
    ).join('\n')
  : 'No recent sales data available'}

MARKET METRICS:
- Active Listings: ${property_data.market_metrics.total_active_listings}
- Average Days on Market: ${property_data.market_metrics.average_days_on_market || 'N/A'}
- Median Sale Price: ${property_data.market_metrics.median_sale_price ? `£${property_data.market_metrics.median_sale_price.toLocaleString()}` : 'N/A'}

Provide a valuation in the following JSON format:
{
  "estimated_value": number (GBP),
  "valuation_range": {
    "low": number (GBP),
    "high": number (GBP)
  },
  "confidence_score": number (0-100),
  "price_per_sqft": number (optional),
  "valuation_date": "YYYY-MM-DD",
  "methodology": "brief explanation of valuation approach",
  "key_factors": ["factor 1", "factor 2", ...],
  "market_conditions": "summary of current market conditions",
  "recommendations": ["recommendation 1", "recommendation 2"],
  "comparable_analysis": "analysis of how comparables influenced valuation",
  "risk_factors": ["risk 1", "risk 2"]
}

Consider:
1. Location desirability and regional trends
2. Property type and characteristics
3. Current market velocity (days on market)
4. Price trends from comparables
5. Supply/demand dynamics
6. Seasonal factors
7. Economic conditions affecting the area

Be conservative in your estimates and account for market uncertainty.`;

    const aiResult = await base44.integrations.Core.InvokeLLM({
      prompt: prompt,
      response_json_schema: {
        type: "object",
        properties: {
          estimated_value: { type: "number", description: "Estimated property value in GBP" },
          valuation_range: {
            type: "object",
            properties: {
              low: { type: "number" },
              high: { type: "number" }
            },
            required: ["low", "high"]
          },
          confidence_score: { type: "number", description: "Confidence score 0-100" },
          price_per_sqft: { type: "number" },
          valuation_date: { type: "string" },
          methodology: { type: "string" },
          key_factors: { type: "array", items: { type: "string" } },
          market_conditions: { type: "string" },
          recommendations: { type: "array", items: { type: "string" } },
          comparable_analysis: { type: "string" },
          risk_factors: { type: "array", items: { type: "string" } }
        },
        required: ["estimated_value", "valuation_range", "confidence_score", "valuation_date", "methodology", "key_factors", "market_conditions"]
      },
      model: "claude_sonnet_4_6"
    });

    return Response.json({
      success: true,
      valuation: {
        ...aiResult,
        property_id: property_data.property.name,
        generated_at: new Date().toISOString(),
      }
    });
  } catch (error) {
    console.error('Error in AI valuation:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});