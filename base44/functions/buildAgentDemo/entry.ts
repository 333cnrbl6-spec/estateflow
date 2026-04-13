import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { action, agent_name, agent_location, search_query, research } = body;

    // ── STEP 1: RESEARCH ───────────────────────────────────────────────
    if (action === 'research') {
      const prompt = `
You are a property industry researcher. Search for and compile factual, publicly available information about the letting/estate agency called "${agent_name}" based in ${agent_location}, UK.

Find and return all available information including:
- Their official trading name and any legal company name
- Companies House registration number (if available)
- Registered/trading address
- Year founded or established
- Website URL
- Phone number
- Services offered (e.g. lettings, property management, block management, sales, surveying)
- Key directors or partners by name and role
- Background narrative (2-3 sentences about the company history and focus)
- Typical portfolio size (residential lettings, block management units etc)

CRITICAL - Also extract brand identity by visiting their actual website:
- primary_color: the dominant brand colour as a precise hex code (e.g. #1a3a52) — inspect their header background, logo, primary buttons, nav bar. Do NOT guess; examine the actual page.
- secondary_color: the secondary/supporting brand colour as hex — look at secondary buttons, subheadings, hover states
- accent_color: the accent/highlight/CTA colour as hex — look at calls-to-action, highlights, badges
- logo_url: the direct image URL of their logo from the website (src of the <img> tag in the header). Must be a real, accessible URL.
- tagline: their actual strapline or tagline as text from the website homepage
- font_hint: the primary Google Font or web font family name they use (check CSS font-family on body or headings)
- brand_tone: one of 'professional', 'modern', 'traditional', 'friendly' based on the website tone

Based on the scale of this agency, recommend realistic demo data numbers:
- demo_properties: how many properties to create (3-8)
- demo_units: how many units total across those properties (10-40)  
- demo_tenants: how many tenants (8-30)

If certain details are not publicly available, use "Not publicly available" or a reasonable estimate.

Return as JSON matching this schema:
{
  "trading_name": string,
  "legal_entity": string,
  "company_number": string or null,
  "registered_address": string,
  "founded": string,
  "website": string or null,
  "phone": string or null,
  "services": array of strings,
  "services_description": string,
  "key_people": [{"name": string, "role": string}],
  "background_notes": string,
  "demo_properties": number,
  "demo_units": number,
  "demo_tenants": number,
  "portfolio_notes": string,
  "brand": {
    "primary_color": string,
    "secondary_color": string,
    "accent_color": string,
    "logo_url": string,
    "tagline": string,
    "font_hint": string,
    "brand_tone": string
  }
}
`;

      const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
        prompt,
        add_context_from_internet: true,
        response_json_schema: {
          type: 'object',
          properties: {
            trading_name: { type: 'string' },
            legal_entity: { type: 'string' },
            company_number: { type: 'string' },
            registered_address: { type: 'string' },
            founded: { type: 'string' },
            website: { type: 'string' },
            phone: { type: 'string' },
            services: { type: 'array', items: { type: 'string' } },
            services_description: { type: 'string' },
            key_people: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  role: { type: 'string' }
                }
              }
            },
            background_notes: { type: 'string' },
            demo_properties: { type: 'number' },
            demo_units: { type: 'number' },
            demo_tenants: { type: 'number' },
            portfolio_notes: { type: 'string' },
            brand: {
              type: 'object',
              properties: {
                primary_color: { type: 'string' },
                secondary_color: { type: 'string' },
                accent_color: { type: 'string' },
                logo_url: { type: 'string' },
                tagline: { type: 'string' },
                font_hint: { type: 'string' },
                brand_tone: { type: 'string' }
              }
            }
          }
        }
      });

      return Response.json({ success: true, research: result });
    }

    // ── STEP 2: BUILD ──────────────────────────────────────────────────
    if (action === 'build') {
      const r = research;
      const agentName = agent_name;
      const location = agent_location || 'UK';

      // Generate realistic property/tenant data using LLM seeded with research
      const dataPrompt = `
You are building realistic demo data for a property management platform for the letting agency "${agentName}" based in ${location}.

Agency background: ${r.background_notes || 'Local letting agency'}
Services: ${(r.services || []).join(', ')}
Portfolio notes: ${r.portfolio_notes || 'Mix of residential and HMO properties'}

Generate a complete but realistic demo dataset with:
- ${r.demo_properties || 3} properties (realistic street names and postcodes appropriate to ${location})
- Each property has 2-8 units
- ${r.demo_tenants || 10} tenants with realistic UK names
- Postcodes must be realistic and appropriate to the ${location} area

Return as JSON:
{
  "company": {
    "name": string,
    "company_number": string,
    "registered_address": string,
    "category": "management",
    "region": string,
    "sic_code": "68320",
    "sic_description": "Management of real estate on a fee or contract basis",
    "notes": string
  },
  "properties": [
    {
      "name": string,
      "address_line_1": string,
      "city": string,
          "postcode": string,
          "region": string,
      "property_type": "freehold_block or house",
      "ownership_type": "freehold or leasehold",
      "total_units": number,
      "notes": string
    }
  ],
  "units": [
    {
      "unit_reference": string,
      "property_index": number,
      "floor": string,
      "bedrooms": number,
      "unit_type": "flat or house",
      "tenure": "assured_shorthold",
      "status": "occupied or vacant",
      "monthly_rent": number
    }
  ],
  "tenants": [
    {
      "full_name": string,
      "email": string,
      "phone": string,
      "tenant_type": "assured_shorthold",
      "unit_index": number,
      "status": "active",
      "deposit_amount": number
    }
  ],
  "contacts": [
    {
      "full_name": string,
      "contact_type": "director or contractor",
      "company_name": string,
      "notes": string
    }
  ]
}
`;

      const demoData = await base44.asServiceRole.integrations.Core.InvokeLLM({
        prompt: dataPrompt,
        add_context_from_internet: false,
        response_json_schema: {
          type: 'object',
          properties: {
            company: { type: 'object' },
            properties: { type: 'array', items: { type: 'object' } },
            units: { type: 'array', items: { type: 'object' } },
            tenants: { type: 'array', items: { type: 'object' } },
            contacts: { type: 'array', items: { type: 'object' } }
          }
        }
      });

      // Insert Company
      const company = await base44.asServiceRole.entities.Company.create({
        ...demoData.company,
        name: demoData.company?.name || agentName,
        directors: (r.key_people || []).map(p => ({
          name: p.name,
          role: p.role,
          appointed_date: '2015-01-01'
        }))
      });

      // Set this as the active demo company on the user's profile, including brand
      const demoBrand = r.brand ? {
        primary_color: r.brand.primary_color || '#1a3a52',
        secondary_color: r.brand.secondary_color || '#2d5a8c',
        accent_color: r.brand.accent_color || '#f0ad4e',
        logo_url: r.brand.logo_url || null,
        tagline: r.brand.tagline || null,
        font_hint: r.brand.font_hint || null,
        brand_tone: r.brand.brand_tone || 'professional',
        company_name: agentName,
        website: r.website || null,
      } : null;
      await base44.auth.updateMe({ current_demo_company_id: company.id, demo_brand: demoBrand });

      // Insert Properties and track IDs
      const propertyIds = [];
      for (const prop of (demoData.properties || [])) {
        const created = await base44.asServiceRole.entities.Property.create({
          ...prop,
          owning_company: company.id
        });
        propertyIds.push(created.id);
      }

      // Insert Units and track IDs
      const unitIds = [];
      for (const unit of (demoData.units || [])) {
        const propId = propertyIds[unit.property_index] || propertyIds[0];
        const { property_index, ...unitData } = unit;
        const created = await base44.asServiceRole.entities.Unit.create({
          ...unitData,
          property_id: propId
        });
        unitIds.push(created.id);
      }

      // Insert Tenants
      const tenantIds = [];
      for (const tenant of (demoData.tenants || [])) {
        const unitId = unitIds[tenant.unit_index] || unitIds[0];
        const { unit_index, ...tenantData } = tenant;
        // Find the unit's property so each tenant is linked to the correct property
        const unitRecord = demoData.units?.[tenant.unit_index];
        const unitPropId = unitRecord ? (propertyIds[unitRecord.property_index] || propertyIds[0]) : propertyIds[0];
        const created = await base44.asServiceRole.entities.Tenant.create({
          ...tenantData,
          unit_id: unitId,
          property_id: unitPropId
        });
        tenantIds.push(created.id);
      }

      // Insert Contacts (key people + contractors from research)
      const allContacts = [
        ...(r.key_people || []).map(p => ({
          full_name: p.name,
          contact_type: 'director',
          company_name: agentName,
          related_company_id: company.id,
          notes: p.role
        })),
        ...(demoData.contacts || []).filter(c => c.contact_type !== 'director').map(c => ({ ...c, related_company_id: company.id }))
      ];
      for (const contact of allContacts) {
        await base44.asServiceRole.entities.Contact.create(contact);
      }

      // Create sample financial transactions
      const now = new Date();
      for (let i = 0; i < Math.min(tenantIds.length, 8); i++) {
        await base44.asServiceRole.entities.FinancialTransaction.create({
          description: `Rent - ${(demoData.tenants || [])[i]?.full_name || 'Tenant'}`,
          transaction_type: 'rent_payment',
          amount: (demoData.units || [])[i]?.monthly_rent || 750,
          direction: 'income',
          status: 'paid',
          paid_date: new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0],
          property_id: propertyIds[0],
          unit_id: unitIds[i] || unitIds[0],
          tenant_id: tenantIds[i]
        });
      }

      // ── Run expansion research in parallel ────────────────────────
      let expansionReport = null;
      try {
        const expansionPrompt = `
You are a property technology analyst and sales consultant for Premiso, a UK property management SaaS platform.

Research the letting/estate agent or property company called "${agentName}" based in ${location}.

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

Agent services: ${(r.services || []).join(', ')}
Agent background: ${r.background_notes || ''}

Your task:
1. For each service, classify as: in_scope, buildable, integration, or out_of_scope
2. Identify software/CRM/platforms they likely already use
3. For out-of-scope/buildable services, identify main competitor software in the UK market
4. For competitor software with APIs, assess integration feasibility
5. Recommend integration/build opportunities prioritised by business value

Return JSON matching this schema.
`;
        expansionReport = await base44.asServiceRole.integrations.Core.InvokeLLM({
          prompt: expansionPrompt,
          add_context_from_internet: true,
          model: 'gemini_3_flash',
          response_json_schema: {
            type: 'object',
            properties: {
              agent_name: { type: 'string' },
              agent_summary: { type: 'string' },
              services_overview: { type: 'string' },
              services: { type: 'array', items: { type: 'object', properties: { name: { type: 'string' }, description: { type: 'string' }, scope: { type: 'string' }, build_notes: { type: 'string' } } } },
              existing_software: { type: 'array', items: { type: 'object', properties: { name: { type: 'string' }, category: { type: 'string' }, description: { type: 'string' }, pricing: { type: 'string' }, has_api: { type: 'boolean' }, integration_type: { type: 'string' }, website: { type: 'string' }, confidence: { type: 'string' } } } },
              competitor_software: { type: 'array', items: { type: 'object', properties: { name: { type: 'string' }, vendor: { type: 'string' }, covers: { type: 'string' }, pricing: { type: 'string' }, has_api: { type: 'boolean' }, integration_feasibility: { type: 'string' }, api_notes: { type: 'string' } } } },
              integration_opportunities: { type: 'array', items: { type: 'object', properties: { title: { type: 'string' }, description: { type: 'string' }, priority: { type: 'string' }, technical_approach: { type: 'string' }, effort: { type: 'string' } } } },
              recommendation: { type: 'string' }
            }
          }
        });

        // Save expansion report as entity
        await base44.asServiceRole.entities.AgentExpansionReport.create({
          agent_name: agentName,
          agent_location: location,
          agent_summary: expansionReport.agent_summary || '',
          services_overview: expansionReport.services_overview || '',
          services: expansionReport.services || [],
          existing_software: expansionReport.existing_software || [],
          competitor_software: expansionReport.competitor_software || [],
          integration_opportunities: expansionReport.integration_opportunities || [],
          recommendation: expansionReport.recommendation || ''
        });
      } catch (expErr) {
        console.error('Expansion research failed (non-blocking):', expErr.message);
      }

      // Create sample maintenance orders
      const maintenanceItems = [
        { title: 'Boiler service required', category: 'plumbing', priority: 'standard' },
        { title: 'External gutter repair', category: 'structural', priority: 'urgent' },
        { title: 'Communal lighting fault', category: 'electrical', priority: 'standard' },
      ];
      for (const item of maintenanceItems) {
        await base44.asServiceRole.entities.MaintenanceOrder.create({
          ...item,
          description: 'Reported by tenant. Action required.',
          property_id: propertyIds[0],
          status: 'reported'
        });
      }

      return Response.json({
        success: true,
        summary: `${agentName} demo created with ${propertyIds.length} properties, ${unitIds.length} units, ${tenantIds.length} tenants and financial records.`,
        counts: {
          companies: 1,
          properties: propertyIds.length,
          units: unitIds.length,
          tenants: tenantIds.length
        },
        expansion_included: !!expansionReport,
        expansion_summary: expansionReport ? {
          services_count: (expansionReport.services || []).length,
          buildable_count: (expansionReport.services || []).filter(s => s.scope === 'buildable').length,
          integrations_count: (expansionReport.integration_opportunities || []).length,
          software_detected: (expansionReport.existing_software || []).length
        } : null
      });
    }

    return Response.json({ error: 'Invalid action' }, { status: 400 });

  } catch (error) {
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
});