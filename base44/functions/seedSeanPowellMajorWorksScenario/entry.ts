import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const SCENARIO_DATA = {
  companies: [
    {
      company_number: 'SP001234',
      company_name: 'Powell Freehold Investments Ltd',
      company_status: 'active',
      company_type: 'ltd',
      incorporation_date: '2008-03-15',
      registered_address: '42 Meadowbrook Lane, Surrey, UK',
      sic_codes: ['68209'],
      notes: 'Freeholder of multiple residential properties. Ultimate beneficial owner: Sean Powell. Known for aggressive major works billing and service charge inflation. FCA investigation 2022.',
    },
    {
      company_number: 'SP005678',
      company_name: 'Powell Property Management Ltd',
      company_status: 'active',
      company_type: 'ltd',
      incorporation_date: '2010-01-20',
      registered_address: '42 Meadowbrook Lane, Surrey, UK',
      sic_codes: ['68320'],
      notes: 'Managing agent for 47 residential blocks. Same address and directors as Powell Freehold. Charges 12-15% management fee. Leaseholders reported inflated major works quotes.',
    },
  ],
  contacts: [
    {
      full_name: 'Sean Powell',
      email: 'sean.powell@powell-properties.co.uk',
      phone: '+44 1372 XXX XXX',
      company: 'Powell Freehold Investments Ltd',
      role: 'Director & Beneficial Owner',
      notes: 'Freeholder and managing agent controller. Leaseholders report aggressive tactics. Major works bill for Meadowbrook Estate slashed from £723,450 to £158,290 after leaseholder challenge (2019). RTM threat led to settlement.',
    },
    {
      full_name: 'Sarah Chen',
      email: 'sarah.chen@powell-pm.co.uk',
      phone: '+44 1372 YYY YYY',
      company: 'Powell Property Management Ltd',
      role: 'Operations Director',
      notes: 'Director of managing agent. Also holds minor shareholding in freehold company. Signed off inflated major works specifications.',
    },
  ],
  relationships: [
    // Freeholder relationship
    {
      from_entity_type: 'person',
      from_entity_id: 'SP_SEAN_POWELL',
      from_label: 'Sean Powell',
      to_entity_type: 'company',
      to_entity_id: 'SP001234',
      to_label: 'Powell Freehold Investments Ltd',
      relationship_type: 'beneficial_owner_of',
      relationship_label: 'Beneficial Owner',
      date_from: '2008-03-15',
      date_to: null,
      control_type: 'beneficial',
      verified: false,
      source: 'auto_detected',
      notes: '100% beneficial ownership through nominee structures.',
      conflict_of_interest: true,
      conflict_description: 'Sean Powell benefits directly from inflated major works charges while controlling the managing agent that specifies them.',
      auto_detected_coi: true,
      coi_pattern: 'freehold_and_rtm_same_controller',
      risk_score: 85,
      scenario_tag: 'sean_powell_major_works',
    },
    // Director appointment
    {
      from_entity_type: 'person',
      from_entity_id: 'SP_SEAN_POWELL',
      from_label: 'Sean Powell',
      to_entity_type: 'company',
      to_entity_id: 'SP001234',
      to_label: 'Powell Freehold Investments Ltd',
      relationship_type: 'director_of',
      relationship_label: 'Director',
      date_from: '2008-03-15',
      date_to: null,
      control_type: 'direct',
      verified: true,
      source: 'companies_house',
      notes: 'Companies House records confirm directorship.',
      conflict_of_interest: false,
      risk_score: 0,
      scenario_tag: 'sean_powell_major_works',
    },
    // Managing agent company — Sean Powell controls both
    {
      from_entity_type: 'company',
      from_entity_id: 'SP001234',
      from_label: 'Powell Freehold Investments Ltd',
      to_entity_type: 'company',
      to_entity_id: 'SP005678',
      to_label: 'Powell Property Management Ltd',
      relationship_type: 'manages_block',
      relationship_label: 'Owns/Controls Managing Agent',
      date_from: '2010-01-20',
      date_to: null,
      control_type: 'beneficial',
      verified: false,
      source: 'auto_detected',
      notes: 'Freeholder wholly owns managing agent. Identical registered office and key directors. Circular profit extraction.',
      conflict_of_interest: true,
      conflict_description: 'Freehold company controls managing agent that specifies major works and service charges — creating incentive to inflate costs.',
      auto_detected_coi: true,
      coi_pattern: 'freehold_and_rtm_same_controller',
      risk_score: 88,
      scenario_tag: 'sean_powell_major_works',
    },
    // Sarah Chen — director of managing agent, also shareholder in freehold
    {
      from_entity_type: 'person',
      from_entity_id: 'SP_SARAH_CHEN',
      from_label: 'Sarah Chen',
      to_entity_type: 'company',
      to_entity_id: 'SP005678',
      to_label: 'Powell Property Management Ltd',
      relationship_type: 'director_of',
      relationship_label: 'Director',
      date_from: '2015-06-01',
      date_to: null,
      control_type: 'direct',
      verified: true,
      source: 'companies_house',
      notes: 'Companies House records confirm directorship.',
      conflict_of_interest: false,
      risk_score: 0,
      scenario_tag: 'sean_powell_major_works',
    },
    {
      from_entity_type: 'person',
      from_entity_id: 'SP_SARAH_CHEN',
      from_label: 'Sarah Chen',
      to_entity_type: 'company',
      to_entity_id: 'SP001234',
      to_label: 'Powell Freehold Investments Ltd',
      relationship_type: 'shareholder_of',
      relationship_label: '5% Shareholder',
      date_from: '2018-04-10',
      date_to: null,
      control_type: 'direct',
      verified: false,
      source: 'manual',
      notes: 'Minor shareholding creates conflict of interest in major works decisions.',
      conflict_of_interest: true,
      conflict_description: 'Director of managing agent also holds shareholding in freeholder — personal financial interest in inflating major works to boost freehold value.',
      auto_detected_coi: true,
      coi_pattern: 'service_charge_vehicle_same_directors',
      risk_score: 72,
      scenario_tag: 'sean_powell_major_works',
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
      summary: `Scenario E: Sean Powell Major Works Inflation — ${createdCompanies.length} companies, ${createdContacts.length} contacts, ${createdRels.length} relationships seeded.`,
      scenario_tag: 'sean_powell_major_works',
      patterns_trained: [
        'freehold_and_rtm_same_controller',
        'service_charge_vehicle_same_directors',
      ],
      key_coi_findings: [
        'Freeholder controls managing agent — £723k major works bill slashed to £158k after leaseholder challenge',
        'Director of managing agent holds shareholding in freehold — financial incentive to inflate costs',
        'Circular profit extraction — major works → freehold income + management fees',
      ],
      legal_significance: 'Landmark case demonstrating self-dealing abuse under Leasehold Reform Act 2024, s.16 (managing agent conflicts).',
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});