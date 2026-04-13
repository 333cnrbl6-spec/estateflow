import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { agent_name, research, expansion } = await req.json();

    const prompt = `
You are a senior proptech sales director creating a highly compelling, personalised sales brochure for "Premiso" — a next-generation UK property management platform.

The brochure is personalised for: "${agent_name}"

ABOUT THIS COMPANY:
- Services: ${(research?.services || []).join(', ')}
- Background: ${research?.background_notes || 'UK letting / property management agency'}
- Services description: ${research?.services_description || ''}
- Portfolio notes: ${research?.portfolio_notes || ''}
- Key people: ${(research?.key_people || []).map(p => `${p.name} (${p.role})`).join(', ')}
- Founded: ${research?.founded || 'established'}
- Location: ${research?.registered_address || 'UK'}
- Website: ${research?.website || ''}

SOFTWARE THEY LIKELY USE / COMPETITOR CONTEXT:
${expansion ? JSON.stringify(expansion.existing_software || [], null, 2) : 'Not available'}

COMPETITOR PRODUCTS THEY MIGHT COMPARE US TO:
${expansion ? JSON.stringify(expansion.competitor_software || [], null, 2) : 'Not available'}

EXPANSION OPPORTUNITIES IDENTIFIED:
${expansion ? JSON.stringify(expansion.services || [], null, 2) : 'Not available'}

---
PREMISO PLATFORM — FULL FEATURE REFERENCE:

PORTFOLIO MANAGEMENT:
- Multi-company structure: manage unlimited legal entities, SPVs, RTM companies under one login
- Companies House direct API: auto-pull incorporation dates, directors, confirmation statement deadlines, accounts due dates
- Compliance calendar: accounts filing, confirmation statements, SIC changes, director appointments all tracked
- Portfolio dashboards: occupancy, income, arrears, maintenance KPIs across all properties at a glance
- Regional grouping: manage portfolios across multiple offices/regions with consolidated reporting

RESIDENTIAL LETTINGS:
- Tenancy pipeline: Kanban-style board from enquiry to move-in to renewal — drag-and-drop workflow
- Rent ledger: full double-entry rent accounting per tenancy, automated statements, arrears alerts
- Deposit management: DPS / myDeposits / TDS scheme integration, prescribed information tracking
- Tenant portal: self-service maintenance, payment history, documents
- Referencing tracking: applicant checklist, document upload, approval workflow
- Arrears workflow: automated escalation emails, notice tracking, payment plans

BLOCK MANAGEMENT:
- Service charge accounts: budgeting, actuals, variance, per-unit allocation
- Section 20 consultation tracker: statutory notice periods, tribunal management
- Ground rent register: escalation schedules, notices, payment tracking
- Leaseholder portal: view accounts, raise requests, access documents
- RTM management: eligibility calculator, claim process tracker, company formation workflow
- Reserve fund management: sinking fund tracking, audit history

COMPLIANCE:
- Gas Safety / EICR / EPC / PAT / Asbestos / Legionella / Lift — all in one hub
- Building Safety Act 2023: accountable persons, safety case register, resident communication log
- Expiry alerts: configurable lead times, automated reminders
- Certificate upload: drag-and-drop upload linked to property record
- Client Money Protection: CMP scheme tracking, reconciliation records

MAINTENANCE:
- Work order lifecycle: reported → assigned → in progress → completed
- Contractor dispatch: preferred contractor lists, SMS/email alerts, scheduling
- Emergency callout tracker with contractor arrival times
- Cost tracking: estimates vs actuals, linked to service charge or expense
- Section 20 major works flagging

FINANCIAL:
- Bank transaction import and reconciliation
- Expense categorisation with receipt upload
- Financial reports: P&L, cashflow, income by property/company
- Accountancy exports: Xero, Sage, QuickBooks compatible format
- Owner financial statements: income/expense breakdown per landlord

DOCUMENT AUTOMATION:
- Template library: tenancy agreements, Section 21/8 notices, service charge statements, maintenance notices
- Mail merge: auto-populate with tenant/property/company data
- Bulk generation: produce 100+ documents in one click
- Digital delivery to tenants/leaseholders
- Version control and audit trail

CRM & PIPELINES:
- Contact directory: landlords, tenants, solicitors, contractors, surveyors
- Tenancy pipeline: visual lead-to-let pipeline
- Out-of-hours service pipeline: prospect management for OOH onboarding
- Interaction logging: calls, emails, meetings with follow-up reminders

OUT-OF-HOURS EMERGENCY CALL HANDLING (ADD-ON):
- 24/7 365 days UK-based professional call answering team
- GDPR-validated caller ID on every call — property matched to your database
- Real-time call log created in Premiso on every call
- Automated maintenance order created from every relevant call
- Emergency contractor dispatch — plumbers, electricians, locksmiths on network
- Escalation to on-call manager if required
- Next-morning summary report to property manager
- WhatsApp / SMS tenant confirmation post-call
- Tiers: Basic £49/mo, Standard £99/mo, Premium £179/mo, Enterprise POA

---
COMPETITOR INTELLIGENCE (DO NOT COPY — USE TO DIFFERENTIATE):

Key competitors and their known weaknesses:

1. Arthur Online — Good interface but weak on block management, no Companies House integration, limited compliance tracking, service charges module is basic. No out-of-hours service.

2. Reapit — Enterprise-focused, expensive (£300-600+/mo), complex to implement, very long onboarding (3-6 months), built for large corporates not independent agents. Poor block management.

3. Goodlord — Referencing/onboarding focused only. Not a full property management platform. No maintenance, compliance, financials, or block management. Expensive per-tenancy fees.

4. Jupix / Dezrez — Legacy platforms, dated interface, expensive annual contracts, limited API, no block management, poor compliance tracking. Slow development pace.

5. Fixflo — Maintenance-only platform. No financials, no compliance hub, no tenancy management. Requires additional software for everything else.

6. PayProp — Payment processing only. No tenancy management, no maintenance, no compliance. Just a reconciliation tool.

7. Landlord Vision — Good for landlords, not agents. No multi-tenancy agency features, no client money accounting, limited for professional agents.

8. SME Professional / Qube — Enterprise pricing, require consultants for setup, annual licence fees £5,000-£30,000+, no self-serve onboarding.

9. Propertyware / Yardi — US-built platforms with poor UK compliance knowledge. No Companies House, no UK-specific legislation (RTM, S.20, Building Safety Act, etc.).

10. Fixflo + Jupix combo (common stack) — Two separate subscriptions, no shared data, manual duplication, no unified reporting.

Premiso's core differentiators:
- ALL-IN-ONE: lettings + block + compliance + finance + OOH in ONE platform
- UK-first: built specifically for UK legislation (RTM, S.20, Building Safety Act 2023, Landlord & Tenant Act 1985)
- Companies House API built in — no other platform has this natively
- Out-of-hours as a native add-on, not a separate company
- Block management as first-class feature, not an afterthought
- Modern, intuitive UI — not legacy software
- Transparent monthly pricing — no annual lock-in contracts
- Fast onboarding: go live in days, not months
- All data in one place — no multi-system duplication
---

Generate deeply compelling, specific, well-written content for each section. Be specific to ${agent_name} — reference their actual services, location, and team where possible.

For the competitor_comparison, use 2 real competitors from the list above that are most relevant to this agency's profile (based on their services and likely existing software). Use real specific feature comparisons.

For feature_match, create one row per service the agency offers, mapping it precisely to Premiso's modules. Write specific, compelling benefit statements — not generic.

For pain_points, identify the 6 most likely pain points for this specific agency based on their services and size. Be highly specific.

For module_highlights, pick the 4 modules most relevant to this agency and write genuinely compelling module descriptions.

Return JSON with this EXACT structure (all arrays must have real data):
{
  "executive_summary": "3-4 sentence compelling pitch specifically for this agency — reference their name, services, location, and what Premiso changes for them",

  "pain_points": [
    { "problem": "specific pain point this agency has", "solution": "precise how Premiso solves it", "icon": "one of: Clock, AlertTriangle, FileX, DollarSign, Users, Shield, Zap, Phone, TrendingUp" }
  ],

  "feature_match": [
    { "their_service": "one of their actual services from the list above", "premiso_module": "exact Premiso module name", "benefit": "specific 1-sentence benefit for this agency", "coverage": "full|partial|addon" }
  ],

  "competitor_comparison": {
    "competitor_names": ["Real Competitor 1", "Real Competitor 2"],
    "rows": [
      { "feature": "feature name", "premiso": "Premiso's specific capability", "c1": "Competitor 1 specific limitation", "c2": "Competitor 2 specific limitation", "premiso_wins": true }
    ]
  },

  "stats": [
    { "value": "e.g. 40%", "label": "Time saved on admin", "context": "brief explanation" }
  ],

  "module_highlights": [
    { "module": "Module Name", "headline": "punchy benefit headline", "description": "2-3 sentences of specific value and capability", "relevant_to": "why specifically relevant to this agency" }
  ],

  "out_of_hours": {
    "headline": "tailored OOH headline for this agency's context",
    "why_relevant": "2-3 sentences specifically about this agency's out-of-hours risk based on their portfolio and services",
    "benefits": ["specific benefit 1", "specific benefit 2", "specific benefit 3", "specific benefit 4", "specific benefit 5"],
    "tier_recommendation": "1-2 sentences recommending a specific tier and explaining why it suits this agency"
  },

  "expansion_opportunities": [
    { "title": "specific opportunity", "description": "what this unlocks for this agency", "timeline": "0-3 months|3-6 months|6-12 months|12+ months", "revenue_potential": "low|medium|high" }
  ],

  "expansion_narrative": "2-3 sentence narrative about growth with Premiso specific to this agency",

  "testimonial_placeholder": "A realistic testimonial quote from a plausible director of a similar UK property company — make it specific and believable, not generic",

  "next_steps": [
    { "step": "step title", "description": "short specific action" }
  ],

  "cover_headline": "compelling 5-8 word headline tailored to this agency",
  "cover_subheading": "one compelling sentence supporting the headline"
}

Minimum data requirements:
- pain_points: at least 6 items
- feature_match: at least 8 items (one per service where possible)
- competitor_comparison.rows: at least 10 rows of genuine, specific comparisons
- stats: exactly 4 items with compelling numbers
- module_highlights: exactly 4 items, most relevant to this agency
- out_of_hours.benefits: exactly 5 items
- expansion_opportunities: at least 5 items
- next_steps: exactly 4 steps

Write like a senior B2B copywriter. Every sentence should earn its place. No filler.
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