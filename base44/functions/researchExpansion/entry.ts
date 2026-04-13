import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { agent_name, agent_location } = await req.json();

    const prompt = `
You are a property technology analyst and sales consultant for Premiso, a UK property management SaaS platform.

Research the letting/estate agent or property company called "${agent_name}" based in ${agent_location}.

Premiso's CURRENT SCOPE includes:
- Portfolio management (companies, properties, units, leases)
- Residential lettings & tenancy management
- Block management & service charges
- RTM (Right to Manage) processes
- Compliance tracking (gas safety, EPC, EICR, fire safety, building safety)
- Maintenance order management
- Financial management (rent ledger, ground rent, service charges, banking)
- Document generation & templates
- CRM & contact management
- Out-of-hours call handling
- Tenant & leaseholder portals

OUTSIDE current scope (but potentially buildable): residential property SALES, mortgage referrals, conveyancing, property surveys/valuations, auction management, holiday lets, commercial property management, student accommodation platforms, build-to-rent platforms, HMO licensing management, energy performance certification issuance.

Your task:
1. Research what services ${agent_name} actually offers (use internet search)
2. For each service, classify it as: in_scope, buildable, integration, or out_of_scope
3. Identify what software/CRM/platforms they likely already use (search for clues: job ads, reviews, social media, their website tech stack, common software for their type of agency)
4. For out-of-scope/buildable services, identify the main competitor software products available in the UK market
5. For competitor software with APIs, assess integration feasibility with Premiso
6. Recommend integration/build opportunities prioritised by business value

Return as JSON:
{
  "agent_name": string,
  "agent_summary": string (2 sentences about the company),
  "services_overview": string (what types of property work they do),
  "services": [
    {
      "name": string,
      "description": string,
      "scope": "in_scope" | "buildable" | "integration" | "out_of_scope",
      "build_notes": string or null (if buildable: what Premiso would need to build, estimate weeks)
    }
  ],
  "existing_software": [
    {
      "name": string,
      "category": string (e.g. "Sales CRM", "Lettings Platform", "Portal Listing"),
      "description": string,
      "pricing": string (e.g. "£150-400/mo", "per-transaction"),
      "has_api": boolean,
      "integration_type": string or null (e.g. "REST API", "Webhook", "CSV export"),
      "website": string or null,
      "confidence": string (e.g. "High - mentioned on their website", "Medium - common for this type of agency")
    }
  ],
  "competitor_software": [
    {
      "name": string,
      "vendor": string,
      "covers": string (which out-of-scope service),
      "pricing": string,
      "has_api": boolean,
      "integration_feasibility": "high" | "medium" | "low",
      "api_notes": string
    }
  ],
  "integration_opportunities": [
    {
      "title": string,
      "description": string,
      "priority": "high" | "medium" | "low",
      "technical_approach": string (e.g. "REST API OAuth2 sync", "Webhook receive"),
      "effort": string (e.g. "2-4 weeks build")
    }
  ],
  "recommendation": string (1 paragraph sales pitch: what to highlight to this agent about Premiso + what to offer to build)
}
`;

    const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt,
      add_context_from_internet: true,
      model: 'gemini_3_flash',
      response_json_schema: {
        type: 'object',
        properties: {
          agent_name: { type: 'string' },
          agent_summary: { type: 'string' },
          services_overview: { type: 'string' },
          services: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                name: { type: 'string' },
                description: { type: 'string' },
                scope: { type: 'string' },
                build_notes: { type: 'string' }
              }
            }
          },
          existing_software: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                name: { type: 'string' },
                category: { type: 'string' },
                description: { type: 'string' },
                pricing: { type: 'string' },
                has_api: { type: 'boolean' },
                integration_type: { type: 'string' },
                website: { type: 'string' },
                confidence: { type: 'string' }
              }
            }
          },
          competitor_software: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                name: { type: 'string' },
                vendor: { type: 'string' },
                covers: { type: 'string' },
                pricing: { type: 'string' },
                has_api: { type: 'boolean' },
                integration_feasibility: { type: 'string' },
                api_notes: { type: 'string' }
              }
            }
          },
          integration_opportunities: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                title: { type: 'string' },
                description: { type: 'string' },
                priority: { type: 'string' },
                technical_approach: { type: 'string' },
                effort: { type: 'string' }
              }
            }
          },
          recommendation: { type: 'string' }
        }
      }
    });

    return Response.json({ success: true, ...result });

  } catch (error) {
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
});