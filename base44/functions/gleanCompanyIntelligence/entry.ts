import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { company_name, company_website, company_number } = await req.json();

    if (!company_name) {
      return Response.json({ error: 'company_name required' }, { status: 400 });
    }

    // Phase 1: Research company fundamentals
    const fundamentalsRes = await base44.integrations.Core.InvokeLLM({
      prompt: `Research ${company_name}${company_website ? ` (website: ${company_website})` : ''}${company_number ? ` (Companies House: ${company_number})` : ''} as a property management company. Find and structure:

1. COMPANY BASICS: registered name, headquarters, founded year, company number, status
2. PORTFOLIO: estimated number of properties, units, estimated portfolio value, geographic regions
3. SERVICES: what they offer (lettings, block management, RTM, sales, etc.)
4. TEAM: estimated team size, leadership info from LinkedIn if available
5. TECHNOLOGY: any visible tech stack (websites, platforms mentioned, integrations)
6. REPUTATION: customer reviews, ratings, complaints data if public

Return as structured JSON with all available data.`,
      add_context_from_internet: true,
      response_json_schema: {
        type: 'object',
        properties: {
          company_name: { type: 'string' },
          company_number: { type: 'string' },
          registered_address: { type: 'string' },
          founded_year: { type: 'number' },
          portfolio_size: {
            type: 'object',
            properties: {
              estimated_properties: { type: 'number' },
              estimated_units: { type: 'number' },
              estimated_value_gbp: { type: 'number' },
            },
          },
          services_offered: { type: 'array', items: { type: 'string' } },
          geographic_regions: { type: 'array', items: { type: 'string' } },
          team_size: { type: 'string' },
          visible_technology: { type: 'array', items: { type: 'string' } },
          reputation_score: { type: 'string' },
          customer_reviews: { type: 'string' },
        },
      },
    });

    // Phase 2: Identify data sources
    const dataSourcesRes = await base44.integrations.Core.InvokeLLM({
      prompt: `For ${company_name}, identify likely data sources and systems they use:

1. ACCOUNTING SYSTEMS: Do they likely use Xero, Sage, QuickBooks, FreeAgent, Wave? Evidence?
2. CLOUD STORAGE: Google Workspace, Microsoft 365, Dropbox, OneDrive? Evidence?
3. RENTAL PLATFORMS: OpenRent, Rightmove, SpareRoom, Airbnb property management? Evidence?
4. CRMS/COMMUNICATION: Slack, Teams, HubSpot, Pipedrive? Evidence?
5. PROPERTY SYSTEMS: Specialist property management software (RentLogic, TMPA, ARLA systems)?
6. DATA LIKELY IN: Email, spreadsheets, PDF files, cloud drives, accounting software
7. DATA ACCESSIBILITY: Can they export data? Is it in standard formats (CSV, JSON)?

For each system, rate confidence 0-100% based on evidence found.

Also identify: What data they're most likely to have (properties, tenants, maintenance, finances, compliance), what's scattered across multiple tools, what might be paper-based only.`,
      add_context_from_internet: true,
      response_json_schema: {
        type: 'object',
        properties: {
          accounting_systems: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                system: { type: 'string' },
                confidence_percent: { type: 'number' },
                evidence: { type: 'string' },
              },
            },
          },
          cloud_storage: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                provider: { type: 'string' },
                confidence_percent: { type: 'number' },
              },
            },
          },
          rental_platforms: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                platform: { type: 'string' },
                confidence_percent: { type: 'number' },
              },
            },
          },
          specialist_software: { type: 'array', items: { type: 'string' } },
          data_categories: {
            type: 'object',
            properties: {
              properties: { type: 'string' },
              tenants: { type: 'string' },
              maintenance: { type: 'string' },
              financials: { type: 'string' },
              compliance: { type: 'string' },
            },
          },
          export_capability: { type: 'string' },
          likely_bottlenecks: { type: 'array', items: { type: 'string' } },
        },
      },
    });

    // Phase 3: Predict complexity
    const complexityRes = await base44.integrations.Core.InvokeLLM({
      prompt: `Based on the following company profile, predict their data import complexity for Premiso:

Company: ${company_name}
Portfolio: ${fundamentalsRes.portfolio_size?.estimated_properties} properties, ${fundamentalsRes.portfolio_size?.estimated_units} units
Services: ${fundamentalsRes.services_offered?.join(', ')}
Team Size: ${fundamentalsRes.team_size}
Likely Systems: ${dataSourcesRes.accounting_systems?.map(s => s.system).join(', ')}
Data Scattered Across: Multiple tools
Tech Stack Maturity: ${fundamentalsRes.visible_technology?.length > 0 ? 'Modern' : 'Legacy/Mixed'}

Score their import complexity across these factors:

1. DATA VOLUME: 1-10 (higher = more complex). Formula: (properties/10 + units/50 + transactions/1000) / 3
2. SYSTEM FRAGMENTATION: 1-10 (how scattered data is across systems)
3. DATA QUALITY: 1-10 (estimated data cleanliness, duplicates, missing values)
4. TECH MATURITY: 1-10 (are they digitized or paper-based?)
5. COMPLIANCE READINESS: 1-10 (do they have certificates, records, audit trails?)

Overall Complexity Score: 1-100 (average of above, weighted). Also categorize as SIMPLE (<30), MODERATE (30-60), COMPLEX (60-80), VERY_COMPLEX (80+).

For each factor, provide:
- Score
- Rationale
- Key risks or issues

Also provide:
- Estimated import time in hours
- Top 3 pain points they'll encounter
- Top 3 quick wins (easiest data to import first)`,
      response_json_schema: {
        type: 'object',
        properties: {
          complexity_factors: {
            type: 'object',
            properties: {
              data_volume: { type: 'number' },
              system_fragmentation: { type: 'number' },
              data_quality: { type: 'number' },
              tech_maturity: { type: 'number' },
              compliance_readiness: { type: 'number' },
            },
          },
          overall_score: { type: 'number' },
          complexity_category: { type: 'string' },
          rationale: { type: 'string' },
          estimated_hours: { type: 'number' },
          pain_points: { type: 'array', items: { type: 'string' } },
          quick_wins: { type: 'array', items: { type: 'string' } },
          risks: { type: 'array', items: { type: 'string' } },
        },
      },
    });

    // Phase 4: Generate onboarding profile
    const onboardingProfile = {
      company_info: {
        name: fundamentalsRes.company_name,
        number: fundamentalsRes.company_number,
        address: fundamentalsRes.registered_address,
        founded: fundamentalsRes.founded_year,
      },
      portfolio: {
        properties: fundamentalsRes.portfolio_size?.estimated_properties || 0,
        units: fundamentalsRes.portfolio_size?.estimated_units || 0,
        value_estimate: fundamentalsRes.portfolio_size?.estimated_value_gbp,
        regions: fundamentalsRes.geographic_regions || [],
      },
      services: fundamentalsRes.services_offered || [],
      team_size: fundamentalsRes.team_size,
      technology_detected: fundamentalsRes.visible_technology || [],
      
      data_sources: {
        accounting_systems: dataSourcesRes.accounting_systems?.map(s => ({
          name: s.system,
          confidence: s.confidence_percent,
        })) || [],
        cloud_storage: dataSourcesRes.cloud_storage || [],
        rental_platforms: dataSourcesRes.rental_platforms || [],
        specialist_software: dataSourcesRes.specialist_software || [],
      },

      data_location_map: dataSourcesRes.data_categories || {},
      export_capability: dataSourcesRes.export_capability,
      bottlenecks: dataSourcesRes.likely_bottlenecks || [],

      complexity: {
        overall_score: complexityRes.overall_score,
        category: complexityRes.complexity_category,
        factors: complexityRes.complexity_factors,
        estimated_hours: complexityRes.estimated_hours,
        pain_points: complexityRes.pain_points || [],
        quick_wins: complexityRes.quick_wins || [],
        risks: complexityRes.risks || [],
      },

      recommended_actions: generateRecommendedActions(
        fundamentalsRes,
        dataSourcesRes,
        complexityRes
      ),

      gleaning_metadata: {
        gleaned_at: new Date().toISOString(),
        data_freshness: 'real-time',
        confidence_level: calculateConfidenceLevel(fundamentalsRes, dataSourcesRes),
      },
    };

    return Response.json(onboardingProfile);
  } catch (error) {
    console.error('Gleaning error:', error);
    return Response.json(
      { error: error.message || 'Gleaning failed' },
      { status: 500 }
    );
  }
});

function generateRecommendedActions(fundamentals, dataSources, complexity) {
  const actions = [];

  // Priority based on complexity
  if (complexity.overall_score > 70) {
    actions.push({
      priority: 'critical',
      action: 'Schedule extended onboarding call',
      reason: 'High complexity - needs detailed planning',
    });
  }

  // Tech stack recommendations
  if (dataSources.accounting_systems?.some(s => s.confidence_percent > 70)) {
    actions.push({
      priority: 'high',
      action: 'Pre-authorize accounting integration',
      reason: 'Accounting system detected - setup OAuth early',
    });
  }

  if (dataSources.likely_bottlenecks?.includes('Paper-based records')) {
    actions.push({
      priority: 'high',
      action: 'Plan document scanning process',
      reason: 'Paper records require manual digitization',
    });
  }

  // Data quality recommendations
  if (complexity.complexity_factors?.data_quality < 5) {
    actions.push({
      priority: 'high',
      action: 'Plan data cleansing phase',
      reason: 'Significant data quality issues anticipated',
    });
  }

  // Quick wins
  if (complexity.quick_wins?.length > 0) {
    actions.push({
      priority: 'medium',
      action: `Start with quick wins: ${complexity.quick_wins[0]}`,
      reason: 'Build momentum with easy imports first',
    });
  }

  return actions;
}

function calculateConfidenceLevel(fundamentals, dataSources) {
  let confidence = 50; // baseline

  if (fundamentals.company_number) confidence += 20;
  if (fundamentals.visible_technology?.length > 2) confidence += 15;
  if (dataSources.accounting_systems?.some(s => s.confidence_percent > 80)) confidence += 15;

  return Math.min(confidence, 100);
}