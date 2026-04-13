import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { property_data, listing_id } = await req.json();

    // Prepare comprehensive prompt for AI valuation
    const prompt = `You are an expert UK property valuer analyzing residential and investment property data. Provide a comprehensive valuation including sales value, rental potential, compliance requirements, licensing, and certifications.

PROPERTY DETAILS:
- Name: ${property_data.property.name}
- Location: ${property_data.property.address}
- Region: ${property_data.property.region}
- Type: ${property_data.property.property_type}
- Ownership: ${property_data.property.ownership_type}
- Total Units: ${property_data.property.total_units}
- Year Built: ${property_data.property.year_built}
- EPC Rating: ${property_data.property.epc_rating || 'Unknown'}

COMPARABLE SALES LISTINGS (Current Market):
${property_data.comparable_sales.length > 0 
  ? property_data.comparable_sales.map((c, i) => 
      `${i + 1}. £${c.asking_price?.toLocaleString()} - ${c.property_type}, ${c.bedrooms || 0} bed, ${c.bathrooms || 0} bath, Status: ${c.status}, EPC: ${c.epc_rating || 'N/A'}, Listed: ${c.listed_date}`
    ).join('\n')
  : 'No comparable active sales listings available'}

COMPARABLE RENTALS (Rental Market):
${property_data.comparable_rentals.length > 0 
  ? property_data.comparable_rentals.map((r, i) => 
      `${i + 1}. £${r.monthly_rent?.toLocaleString()}/month - ${r.unit_type}, ${r.bedrooms || 0} bed, Floor: ${r.floor || 'N/A'}`
    ).join('\n')
  : 'No comparable rental data available'}

RECENT SALES (Completed Transactions):
${property_data.recent_sales.length > 0
  ? property_data.recent_sales.map((s, i) => 
      `${i + 1}. Sold: £${s.sale_price?.toLocaleString()}, Date: ${s.sale_date}, Days on Market: ${s.days_on_market || 'N/A'}`
    ).join('\n')
  : 'No recent sales data available'}

COMPLIANCE & CERTIFICATES:
${property_data.compliance_data.certificates.length > 0
  ? property_data.compliance_data.certificates.map((cert, i) => 
      `${i + 1}. ${cert.type}: ${cert.status} (Issued: ${cert.issued_date}, Expires: ${cert.expiry_date || 'N/A'})`
    ).join('\n')
  : 'No compliance certificates on record'}

Current EPC: ${property_data.compliance_data.epc_current}
HMO Status: ${property_data.compliance_data.hmo_status}

MARKET METRICS:
- Active Sales Listings: ${property_data.market_metrics.total_active_listings}
- Rental Units Available: ${property_data.market_metrics.total_rental_units || 0}
- Average Days on Market: ${property_data.market_metrics.average_days_on_market || 'N/A'}
- Median Sale Price: ${property_data.market_metrics.median_sale_price ? `£${property_data.market_metrics.median_sale_price.toLocaleString()}` : 'N/A'}
- Average Rental Price: ${property_data.market_metrics.average_rental_price ? `£${property_data.market_metrics.average_rental_price}/month` : 'N/A'}
- Market Velocity: ${property_data.market_metrics.market_velocity}

LICENSING & COMPLIANCE REQUIREMENTS TO CONSIDER:
1. HMO Licensing (if 5+ unrelated tenants, 3+ storeys)
2. Selective Licensing (council-specific schemes)
3. Additional Licensing (area-specific requirements)
4. Gas Safety Certificate (annual requirement for rentals)
5. EICR - Electrical Installation Condition Report (5-year requirement)
6. EPC Rating (minimum E for rentals, valid 10 years)
7. Fire Safety Compliance (furniture, alarms, escape routes)
8. Building Safety Act 2022 (higher-risk buildings)
9. Local Authority Additional Requirements

Provide a comprehensive valuation in the following JSON format:
{
  "sales_valuation": {
    "estimated_value": number (GBP),
    "valuation_range": { "low": number, "high": number },
    "confidence_score": number (0-100),
    "price_per_sqft": number (optional)
  },
  "rental_valuation": {
    "estimated_monthly_rent": number (GBP),
    "rental_range": { "low": number, "high": number },
    "rental_yield_percent": number (annual yield),
    "rental_demand": "high|medium|low",
    "comparable_rent_analysis": "analysis text"
  },
  "compliance_status": {
    "hmo_license_required": boolean,
    "selective_licensing": boolean,
    "additional_licensing": boolean,
    "gas_safety_cert_required": boolean,
    "eicr_required": boolean,
    "epc_rating_current": "A-G",
    "epc_rating_required": "A-G",
    "epc_compliant": boolean,
    "fire_safety_compliance": "compliant|non-compliant|unknown",
    "building_safety_act_applicable": boolean,
    "local_authority_requirements": ["requirement 1", "requirement 2"]
  },
  "certifications_needed": [
    {
      "name": "certificate name",
      "required": boolean,
      "cost_estimate_gbp": number,
      "validity_period": "e.g., 1 year, 5 years, 10 years",
      "priority": "critical|important|recommended"
    }
  ],
  "valuation_date": "YYYY-MM-DD",
  "methodology": "comprehensive explanation including sales, rental, and compliance factors",
  "key_factors": ["factor 1", "factor 2"],
  "market_conditions": "summary of sales and rental market conditions",
  "investment_analysis": {
    "gross_yield": number,
    "estimated_annual_rental_income": number,
    "estimated_annual_costs": number,
    "net_yield": number
  },
  "recommendations": ["recommendation 1", "recommendation 2"],
  "comparable_analysis": "analysis of how sales and rental comparables influenced valuation",
  "risk_factors": ["risk 1", "risk 2"],
  "compliance_cost_estimate": {
    "immediate_costs": number,
    "annual_compliance_costs": number,
    "total_first_year_costs": number
  }
}

Consider:
1. Sales market: location desirability, property type, comparables, market velocity
2. Rental market: rental demand, comparable rents, yield potential
3. Compliance: current certificates, licensing requirements, gaps
4. Costs: certification costs, licensing fees, ongoing compliance
5. Investment potential: gross and net yields, rental income stability
6. Risk factors: compliance gaps, market conditions, property-specific issues
7. Local authority requirements and licensing schemes

Be conservative in estimates and account for all compliance costs in investment analysis.`;

    const aiResult = await base44.integrations.Core.InvokeLLM({
      prompt: prompt,
      response_json_schema: {
        type: "object",
        properties: {
          sales_valuation: {
            type: "object",
            properties: {
              estimated_value: { type: "number" },
              valuation_range: {
                type: "object",
                properties: {
                  low: { type: "number" },
                  high: { type: "number" }
                },
                required: ["low", "high"]
              },
              confidence_score: { type: "number" },
              price_per_sqft: { type: "number" }
            },
            required: ["estimated_value", "valuation_range", "confidence_score"]
          },
          rental_valuation: {
            type: "object",
            properties: {
              estimated_monthly_rent: { type: "number" },
              rental_range: {
                type: "object",
                properties: {
                  low: { type: "number" },
                  high: { type: "number" }
                }
              },
              rental_yield_percent: { type: "number" },
              rental_demand: { type: "string" },
              comparable_rent_analysis: { type: "string" }
            },
            required: ["estimated_monthly_rent", "rental_yield_percent", "rental_demand"]
          },
          compliance_status: {
            type: "object",
            properties: {
              hmo_license_required: { type: "boolean" },
              selective_licensing: { type: "boolean" },
              additional_licensing: { type: "boolean" },
              gas_safety_cert_required: { type: "boolean" },
              eicr_required: { type: "boolean" },
              epc_rating_current: { type: "string" },
              epc_rating_required: { type: "string" },
              epc_compliant: { type: "boolean" },
              fire_safety_compliance: { type: "string" },
              building_safety_act_applicable: { type: "boolean" },
              local_authority_requirements: { type: "array", items: { type: "string" } }
            },
            required: ["hmo_license_required", "gas_safety_cert_required", "eicr_required", "epc_compliant"]
          },
          certifications_needed: {
            type: "array",
            items: {
              type: "object",
              properties: {
                name: { type: "string" },
                required: { type: "boolean" },
                cost_estimate_gbp: { type: "number" },
                validity_period: { type: "string" },
                priority: { type: "string" }
              }
            }
          },
          valuation_date: { type: "string" },
          methodology: { type: "string" },
          key_factors: { type: "array", items: { type: "string" } },
          market_conditions: { type: "string" },
          investment_analysis: {
            type: "object",
            properties: {
              gross_yield: { type: "number" },
              estimated_annual_rental_income: { type: "number" },
              estimated_annual_costs: { type: "number" },
              net_yield: { type: "number" }
            }
          },
          recommendations: { type: "array", items: { type: "string" } },
          comparable_analysis: { type: "string" },
          risk_factors: { type: "array", items: { type: "string" } },
          compliance_cost_estimate: {
            type: "object",
            properties: {
              immediate_costs: { type: "number" },
              annual_compliance_costs: { type: "number" },
              total_first_year_costs: { type: "number" }
            }
          }
        },
        required: ["sales_valuation", "rental_valuation", "compliance_status", "certifications_needed", "valuation_date", "methodology"]
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
    console.error('Error in comprehensive AI valuation:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});