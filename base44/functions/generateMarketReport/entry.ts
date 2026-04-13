import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    // Get user's portfolio regions
    const properties = await base44.entities.Property.list();
    const regions = [...new Set(properties.map(p => p.region).filter(Boolean))];
    
    if (regions.length === 0) {
      return Response.json({ 
        error: 'No properties found. Add properties to your portfolio first.', 
        status: 400 
      });
    }

    // Fetch property portal data using LLM with web search
    const marketDataPrompt = `
You are a UK property market analyst. Research current property market data for these regions: ${regions.join(', ')}.

Search property portals (Rightmove, Zoopla, OnTheMarket) and gather:
1. Current average property prices by property type (detached, semi-detached, terraced, flat)
2. Price trends over the last 6 months (estimate if exact data unavailable)
3. Number of properties currently for sale in each area
4. Average time on market
5. Rental yields if available
6. Demand indicators (properties sold STC, rental demand)

Use real, current data from property portals and market reports.

Return JSON matching this schema:
{
  "regions": [
    {
      "region_name": string,
      "avg_price_by_type": {
        "detached": number,
        "semi_detached": number,
        "terraced": number,
        "flat": number
      },
      "overall_avg_price": number,
      "properties_for_sale": number,
      "avg_days_on_market": number,
      "monthly_data": [
        {"month": "YYYY-MM", "avg_price": number, "listings_count": number}
      ]
    }
  ],
  "market_summary": string
}
`;

    const marketData = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: marketDataPrompt,
      add_context_from_internet: true,
      model: 'gemini_3_flash',
      response_json_schema: {
        type: 'object',
        properties: {
          regions: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                region_name: { type: 'string' },
                avg_price_by_type: { type: 'object' },
                overall_avg_price: { type: 'number' },
                properties_for_sale: { type: 'number' },
                avg_days_on_market: { type: 'number' },
                monthly_data: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      month: { type: 'string' },
                      avg_price: { type: 'number' },
                      listings_count: { type: 'number' }
                    }
                  }
                }
              }
            }
          },
          market_summary: { type: 'string' }
        }
      }
    });

    // Generate demand forecast and recommendations
    const forecastPrompt = `
Based on this market data for ${regions.join(', ')}:
${JSON.stringify(marketData, null, 2)}

Generate:
1. Demand forecast scores (0-100) for each area based on:
   - Properties for sale vs population
   - Price trends (rising = high demand)
   - Days on market (lower = higher demand)
   - Seasonal factors

2. Strategic recommendations for property investors/landlords:
   - Which areas to focus on
   - Property types in demand
   - Pricing strategies
   - Investment opportunities

Return JSON:
{
  "demand_forecast": {
    "area_breakdown": [
      {"area": string, "demand_score": number, "trend": "rising"|"stable"|"falling", "reasoning": string}
    ]
  },
  "recommendations": [string],
  "executive_summary": string
}
`;

    const forecast = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: forecastPrompt,
      add_context_from_internet: false,
      model: 'claude_sonnet_4_6',
      response_json_schema: {
        type: 'object',
        properties: {
          demand_forecast: {
            type: 'object',
            properties: {
              area_breakdown: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    area: { type: 'string' },
                    demand_score: { type: 'number' },
                    trend: { type: 'string' },
                    reasoning: { type: 'string' }
                  }
                }
              }
            }
          },
          recommendations: { type: 'array', items: { type: 'string' } },
          executive_summary: { type: 'string' }
        }
      }
    });

    // Calculate key metrics
    const allRegions = marketData.regions || [];
    const totalAvgPrice = allRegions.reduce((sum, r) => sum + (r.overall_avg_price || 0), 0) / (allRegions.length || 1);
    const totalListings = allRegions.reduce((sum, r) => sum + (r.properties_for_sale || 0), 0);
    
    // Calculate price change from monthly data
    let priceChangePercent = 0;
    if (allRegions.length > 0 && allRegions[0].monthly_data?.length >= 2) {
      const latest = allRegions[0].monthly_data[allRegions[0].monthly_data.length - 1]?.avg_price;
      const previous = allRegions[0].monthly_data[allRegions[0].monthly_data.length - 2]?.avg_price;
      if (latest && previous) {
        priceChangePercent = ((latest - previous) / previous) * 100;
      }
    }

    const hottestArea = forecast.demand_forecast?.area_breakdown
      ?.sort((a, b) => b.demand_score - a.demand_score)[0]?.area || regions[0];

    // Create market report entity
    const marketReport = await base44.entities.MarketReport.create({
      generated_date: new Date().toISOString(),
      regions_covered: regions,
      executive_summary: forecast.executive_summary || marketData.market_summary || '',
      key_metrics: {
        avg_price_change_percent: Math.round(priceChangePercent * 10) / 10,
        properties_for_sale: totalListings,
        hottest_area: hottestArea,
        average_price: Math.round(totalAvgPrice),
        avg_days_on_market: Math.round(allRegions.reduce((sum, r) => sum + (r.avg_days_on_market || 0), 0) / (allRegions.length || 1))
      },
      price_trends: {
        monthly_data: allRegions[0]?.monthly_data || []
      },
      demand_forecast: forecast.demand_forecast || { area_breakdown: [] },
      recommendations: forecast.recommendations || [],
      raw_data: marketData,
      generated_by: user.email
    });

    return Response.json({
      success: true,
      report_id: marketReport.id,
      summary: forecast.executive_summary || 'Market report generated successfully',
      regions_analyzed: regions.length,
      data_points: totalListings
    });

  } catch (error) {
    return Response.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
});