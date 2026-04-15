import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const SCENARIO_DATA = {
  companies: [
    {
      company_number: 'TC001001',
      company_name: 'Consensus Business Group Limited',
      company_status: 'active',
      company_type: 'plc',
      incorporation_date: '1995-05-12',
      registered_address: 'Mayfair Tower, London, UK',
      sic_codes: ['68209'],
      notes: 'Master freehold company controlled by Vincent Tchenguiz. Owns/controls 3000+ residential freeholds across England. Epic ground rent scandal leading to LRFA 2024.',
    },
    {
      company_number: 'TC002015',
      company_name: 'Riverside Properties (Tchenguiz SPV)',
      company_status: 'active',
      company_type: 'ltd',
      incorporation_date: '2001-11-03',
      registered_address: '52 Montpelier Square, London, UK',
      sic_codes: ['68209'],
      notes: 'Single-purpose freehold vehicle. Ground rent doubles every 10 years. Offshore ultimate ownership obscured.',
    },
    {
      company_number: 'TC003042',
      company_name: 'Equity Trust & Nominees Ltd',
      company_status: 'active',
      company_type: 'ltd',
      incorporation_date: '1998-02-19',
      registered_address: 'Jersey, Channel Islands',
      sic_codes: ['70229'],
      notes: 'Offshore trustee vehicle hiding ultimate beneficial ownership of UK freeholds. No PSC filed.',
    },
    {
      company_number: 'TC004891',
      company_name: 'Consensus Insurance Solutions Ltd',
      company_status: 'active',
      company_type: 'ltd',
      incorporation_date: '2004-07-22',
      registered_address: 'Mayfair Tower, London, UK',
      sic_codes: ['66290'],
      notes: 'Captive insurance company also owned by Tchenguiz empire. Leaseholders forced to buy buildings insurance through this company at 3-4x market rates.',
    },
  ],
  contacts: [
    {
      full_name: 'Vincent Tchenguiz',
      email: 'v.tchenguiz@consensus-group.co.uk',
      phone: '+44 20 XXXX XXXX',
      company: 'Consensus Business Group Limited',
      role: 'Executive Chairman & Beneficial Owner',
      notes: 'Ultimate beneficial owner of 3000+ UK freeholds. Deployed doubling ground rent clauses affecting 130,000+ leaseholders. FCA case 2013-2017 (later overturned on procedural grounds but reputation destroyed). Driving force behind LRFA 2024 reform.',
    },
    {
      full_name: 'David Furst',
      email: 'd.furst@consensus-group.co.uk',
      phone: '+44 20 YYYY YYYY',
      company: 'Consensus Business Group Limited',
      role: 'Chief Operating Officer',
      notes: 'Second-in-command. Oversaw deployment of doubling ground rent clauses. Controlled insurance captive profits.',
    },
    {
      full_name: 'Jersey Trustee Services',
      email: 'trustees@equity-trust.je',
      phone: '+44 1534 ZZZZ ZZ',
      company: 'Equity Trust & Nominees Ltd',
      role: 'Trustee',
      notes: 'Offshore trustee obscuring beneficial ownership. No significant control filing.',
    },
  ],
  relationships: [
    // Vincent Tchenguiz — beneficial owner of master holding company
    {
      from_entity_type: 'person',
      from_entity_id: 'TC_VINCENT_TCHENGUIZ',
      from_label: 'Vincent Tchenguiz',
      to_entity_type: 'company',
      to_entity_id: 'TC001001',
      to_label: 'Consensus Business Group Limited',
      relationship_type: 'beneficial_owner_of',
      relationship_label: 'Beneficial Owner (Ultimate)',
      date_from: '1995-05-12',
      date_to: null,
      control_type: 'beneficial',
      verified: false,
      source: 'auto_detected',
      notes: 'Ultimate beneficial owner through complex nominee/trust structures.',
      conflict_of_interest: false,
      risk_score: 0,
      scenario_tag: 'tchenguiz_ground_rent_empire',
    },
    // Vincent — director
    {
      from_entity_type: 'person',
      from_entity_id: 'TC_VINCENT_TCHENGUIZ',
      from_label: 'Vincent Tchenguiz',
      to_entity_type: 'company',
      to_entity_id: 'TC001001',
      to_label: 'Consensus Business Group Limited',
      relationship_type: 'director_of',
      relationship_label: 'Executive Chairman',
      date_from: '1995-05-12',
      date_to: null,
      control_type: 'direct',
      verified: true,
      source: 'companies_house',
      notes: 'Companies House confirmation.',
      conflict_of_interest: false,
      risk_score: 0,
      scenario_tag: 'tchenguiz_ground_rent_empire',
    },
    // Consensus owns SPV (Riverside)
    {
      from_entity_type: 'company',
      from_entity_id: 'TC001001',
      from_label: 'Consensus Business Group Limited',
      to_entity_type: 'company',
      to_entity_id: 'TC002015',
      to_label: 'Riverside Properties (Tchenguiz SPV)',
      relationship_type: 'owns_freehold',
      relationship_label: '100% Freehold Owner',
      date_from: '2001-11-03',
      date_to: null,
      control_type: 'direct',
      verified: false,
      source: 'auto_detected',
      notes: 'Consensus controls this SPV which holds freehold of 12 apartment blocks (480 units). Ground rent doubles every 10 years.',
      conflict_of_interest: true,
      conflict_description: 'Doubling ground rent clauses — leaseholders face exponential costs (£150 → £300 → £600 → £1200 within 30 years). Creates financial trap.',
      auto_detected_coi: true,
      coi_pattern: 'offshore_freehold_no_psc',
      risk_score: 95,
      scenario_tag: 'tchenguiz_ground_rent_empire',
    },
    // Offshore concealment — Equity Trust owns Consensus
    {
      from_entity_type: 'company',
      from_entity_id: 'TC003042',
      from_label: 'Equity Trust & Nominees Ltd',
      to_entity_type: 'company',
      to_entity_id: 'TC001001',
      to_label: 'Consensus Business Group Limited',
      relationship_type: 'beneficial_owner_of',
      relationship_label: 'Trustee (Offshore Concealment)',
      date_from: '1998-02-19',
      date_to: null,
      control_type: 'nominee',
      control_type_description: 'Jersey trustee nominee masking true beneficial owner',
      verified: false,
      source: 'auto_detected',
      notes: 'Jersey-registered trustee holds Consensus shares. No PSC filing. Designed to obscure Vincent Tchenguiz beneficial ownership for regulatory arbitrage.',
      conflict_of_interest: true,
      conflict_description: 'Offshore structure prevents transparency — leaseholders cannot identify true beneficial owner to exercise rights. Deliberate concealment of control.',
      auto_detected_coi: true,
      coi_pattern: 'offshore_freehold_no_psc',
      risk_score: 92,
      scenario_tag: 'tchenguiz_ground_rent_empire',
    },
    // Insurance captive abuse
    {
      from_entity_type: 'company',
      from_entity_id: 'TC001001',
      from_label: 'Consensus Business Group Limited',
      to_entity_type: 'company',
      to_entity_id: 'TC004891',
      to_label: 'Consensus Insurance Solutions Ltd',
      relationship_type: 'owns_freehold',
      relationship_label: 'Owns Captive Insurance Company',
      date_from: '2004-07-22',
      date_to: null,
      control_type: 'direct',
      verified: false,
      source: 'auto_detected',
      notes: 'Consensus owns captive insurer. Leaseholders forced to buy buildings insurance through this company at 3-4x market rates. Additional revenue extraction.',
      conflict_of_interest: true,
      conflict_description: 'Freeholder controls captive insurance company — leaseholders legally required to insure through this company. Inflated premiums = hidden profit to freeholder.',
      auto_detected_coi: true,
      coi_pattern: 'service_charge_vehicle_same_directors',
      risk_score: 78,
      scenario_tag: 'tchenguiz_ground_rent_empire',
    },
    // David Furst — director of both companies (conflict)
    {
      from_entity_type: 'person',
      from_entity_id: 'TC_DAVID_FURST',
      from_label: 'David Furst',
      to_entity_type: 'company',
      to_entity_id: 'TC001001',
      to_label: 'Consensus Business Group Limited',
      relationship_type: 'director_of',
      relationship_label: 'Chief Operating Officer',
      date_from: '2001-06-15',
      date_to: null,
      control_type: 'direct',
      verified: true,
      source: 'companies_house',
      notes: 'Companies House confirmation.',
      conflict_of_interest: false,
      risk_score: 0,
      scenario_tag: 'tchenguiz_ground_rent_empire',
    },
    {
      from_entity_type: 'person',
      from_entity_id: 'TC_DAVID_FURST',
      from_label: 'David Furst',
      to_entity_type: 'company',
      to_entity_id: 'TC004891',
      to_label: 'Consensus Insurance Solutions Ltd',
      relationship_type: 'director_of',
      relationship_label: 'Director',
      date_from: '2004-07-22',
      date_to: null,
      control_type: 'direct',
      verified: true,
      source: 'companies_house',
      notes: 'Companies House confirmation.',
      conflict_of_interest: true,
      conflict_description: 'Director of both master company and insurance captive — position to funnel inflated insurance premiums to freehold company.',
      auto_detected_coi: true,
      coi_pattern: 'service_charge_vehicle_same_directors',
      risk_score: 74,
      scenario_tag: 'tchenguiz_ground_rent_empire',
    },
  ],
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    // Seed companies
    const createdCompanies = [];
    for (const c of SCENARIO_DATA.companies) {
      try {
        const existing = await base44.asServiceRole.entities.CompaniesHouseProfile.filter({ company_number: c.company_number });
        if (existing.length === 0) {
          const res = await base44.asServiceRole.entities.CompaniesHouseProfile.create(c);
          createdCompanies.push(res);
        }
      } catch (e) {
        console.log(`Company ${c.company_number} already exists or error:`, e.message);
      }
    }

    // Seed contacts
    const createdContacts = [];
    for (const c of SCENARIO_DATA.contacts) {
      try {
        const res = await base44.asServiceRole.entities.Contact.create(c);
        createdContacts.push(res);
      } catch (e) {
        console.log(`Contact ${c.full_name} error:`, e.message);
      }
    }

    // Seed relationships
    const createdRels = [];
    for (const r of SCENARIO_DATA.relationships) {
      try {
        const res = await base44.asServiceRole.entities.OwnershipRelationship.create(r);
        createdRels.push(res);
      } catch (e) {
        console.log(`Relationship error:`, e.message);
      }
    }

    return Response.json({
      success: true,
      summary: `Scenario F: Tchenguiz Ground Rent Empire — ${createdCompanies.length} companies, ${createdContacts.length} contacts, ${createdRels.length} relationships seeded.`,
      scenario_tag: 'tchenguiz_ground_rent_empire',
      patterns_trained: [
        'offshore_freehold_no_psc',
        'service_charge_vehicle_same_directors',
      ],
      key_coi_findings: [
        '3000+ freeholds with doubling ground rent clauses affecting 130,000+ leaseholders',
        'Offshore trustee (Jersey) conceals beneficial ownership — no PSC filing',
        'Captive insurance company forces leaseholders to pay 3-4x market rates for buildings insurance',
        'Exponential rent trap: £150 → £300 → £600 → £1200 within 30 years',
      ],
      legal_significance: 'Landmark case driving LRFA 2024 reforms. s.119 now caps ground rent at 0%. Criminal penalties for concealing beneficial ownership (Economic Crime Act 2022 s.40).',
      affected_leaseholders: '130000+',
      criminal_potential: 'Beneficial ownership concealment (s.40 Economic Crime Act 2022), potential fraud, predatory commercial practices',
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});