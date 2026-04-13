import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { agent_name, research, expansion } = await req.json();

    const prompt = `
You are a senior property technology sales consultant creating a personalised sales brochure for the UK property management platform "Premiso".

The brochure is for: "${agent_name}"

Research data about this company:
- Services: ${(research?.services || []).join(', ')}
- Background: ${research?.background_notes || 'UK letting / property management agency'}
- Services description: ${research?.services_description || ''}
- Portfolio notes: ${research?.portfolio_notes || ''}
- Key people: ${(research?.key_people || []).map(p => `${p.name} (${p.role})`).join(', ')}
- Founded: ${research?.founded || 'established'}
- Location: ${research?.registered_address || 'UK'}

Expansion analysis (services they offer and how they map to Premiso):
${expansion ? JSON.stringify(expansion.services || [], null, 2) : 'Not available'}

Competitor software they likely use:
${expansion ? JSON.stringify(expansion.existing_software || [], null, 2) : 'Not available'}

Competitor products in their market:
${expansion ? JSON.stringify(expansion.competitor_software || [], null, 2) : 'Not available'}

Premiso's core platform includes:
- Portfolio & company management (multi-company, Companies House integration)
- Residential lettings (tenancy pipeline, rent ledger, deposit management, arrears)
- Block management (service charges, ground rent, RTM management, leaseholder portal)
- Compliance suite (gas safety, EICR, EPC, fire safety, Building Safety Act, asbestos)
- Maintenance order management with contractor dispatch
- Financial management (banking reconciliation, expense tracking, financial reporting)
- Document automation (templates, merge fields, bulk generation)
- CRM & contact management
- Tenant and leaseholder self-service portals
- Out-of-hours emergency call handling (add-on service)
- Regulatory hub (Landlord & Tenant Act, RTM, service charge legislation)

Out of Hours Add-On:
Premiso offers a premium Out-of-Hours emergency call handling service as an add-on:
- 24/7 phone answering by trained property professionals
- Real-time call logging directly into Premiso
- Automated maintenance order creation
- Emergency contractor dispatch
- Tenant GDPR validation on every call
- Tiers: Basic (log + email), Standard (maintenance creation), Premium (contractor dispatch), Enterprise (full managed)
- Pricing from £49/month per managed company

Generate a comprehensive, professional and highly persuasive sales brochure content package.

Be specific to ${agent_name} — reference their actual services, location, directors, background.
Use the competitor analysis to make Premiso comparisons meaningful and specific.

Return JSON with this exact structure:
{
  "executive_summary": "3-4 sentence compelling introduction specifically for this agency — reference their name, location, background, and what Premiso solves for them",

  "pain_points": [
    { "problem": "specific pain point this agency likely has", "solution": "how Premiso solves it precisely", "icon": "one of: Clock, AlertTriangle, FileX, DollarSign, Users, Shield" }
  ],

  "feature_match": [
    { "their_service": "one of their actual services", "premiso_module": "exact Premiso module name", "benefit": "specific benefit statement", "coverage": "full|partial|addon" }
  ],

  "competitor_comparison": {
    "competitor_names": ["Competitor A name", "Competitor B name"],
    "rows": [
      { "feature": "feature name", "premiso": "Premiso capability", "c1": "Competitor A capability", "c2": "Competitor B capability", "premiso_wins": true }
    ]
  },

  "stats": [
    { "value": "stat value", "label": "what it means", "context": "brief explanation" }
  ],

  "module_highlights": [
    { "module": "Module Name", "headline": "punchy headline for this module", "description": "2-3 sentences of specific value", "relevant_to": "why this is relevant to this specific agency" }
  ],

  "out_of_hours": {
    "headline": "tailored out-of-hours pitch headline for this agency",
    "why_relevant": "2-3 sentences specific to this agency's out-of-hours exposure",
    "benefits": ["benefit 1", "benefit 2", "benefit 3", "benefit 4"],
    "tier_recommendation": "which tier would suit them and why"
  },

  "expansion_opportunities": [
    { "title": "opportunity title", "description": "what this unlocks", "timeline": "0-3 months|3-6 months|6-12 months|12+ months", "revenue_potential": "low|medium|high" }
  ],

  "expansion_narrative": "2-3 sentence narrative about Premiso's expansion roadmap relevant to this agency",

  "testimonial_placeholder": "A realistic-sounding testimonial quote that could be from a company like this one — attribute to a plausible name and role",

  "next_steps": [
    { "step": "step title", "description": "short action" }
  ],

  "cover_headline": "compelling 5-8 word headline for the brochure cover",
  "cover_subheading": "supporting subheading sentence for cover"
}

Be highly specific, professional, compelling. Reference ${agent_name} by name throughout where appropriate.
`;

    const content = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt,
      add_context_from_internet: false,
      model: 'claude_sonnet_4_6',
      response_json_schema: {
        type: 'object',
        properties: {
          executive_summary: { type: 'string' },
          pain_points: { type: 'array', items: { type: 'object' } },
          feature_match: { type: 'array', items: { type: 'object' } },
          competitor_comparison: { type: 'object' },
          stats: { type: 'array', items: { type: 'object' } },
          module_highlights: { type: 'array', items: { type: 'object' } },
          out_of_hours: { type: 'object' },
          expansion_opportunities: { type: 'array', items: { type: 'object' } },
          expansion_narrative: { type: 'string' },
          testimonial_placeholder: { type: 'string' },
          next_steps: { type: 'array', items: { type: 'object' } },
          cover_headline: { type: 'string' },
          cover_subheading: { type: 'string' }
        }
      }
    });

    return Response.json({ success: true, content });

  } catch (error) {
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
});