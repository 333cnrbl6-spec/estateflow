/**
 * seedServiceChargeVehicleScenario.js
 *
 * SCENARIO E: The Service Charge Vehicle
 *
 * The most common leasehold complaint in England — and the most prosecutable.
 * 
 * PATTERN: Managing agent sets up a separate limited company to hold the service charge 
 * reserve fund. That company shares directors with the managing agent. Service charges 
 * are paid in, "administration fees" are taken out, accounts are filed late or not at all.
 *
 * This scenario uses a COMPOSITE fictional example based on documented real patterns from:
 * - LEASE (Leasehold Advisory Service) tribunal cases
 * - ARMA (Association of Residential Managing Agents) complaints
 * - First-tier Tribunal (Property Chamber) published decisions
 * - Peverel/Cirrus price-fixing scandal (see notes)
 *
 * Note: Unlike Scenarios B/C/D which are real Companies House data, this uses a composite 
 * fictional example to avoid any implication of ongoing criminal conduct by named individuals.
 * The pattern is provably real. The companies are archetypal.
 *
 * PEVEREL/CIRRUS BACKGROUND (real, public record):
 * - Peverel Property Management Ltd managed 80,000 leasehold homes
 * - Cirrus Communications was their maintenance subsidiary
 * - Price-fixing cartel: Cirrus fixed prices for intercom maintenance with competitors
 * - OFT investigation 2012 found cartel — £163,000 in overcharges to residents
 * - The "service charge vehicle" pattern: Peverel-controlled companies held reserve funds
 *   while Peverel/Cirrus extracted fees from those same funds
 * - Now trades as FirstPort — same complaints ongoing per Trustpilot/LKP
 *
 * KEY PATTERNS TRAINED:
 *   service_charge_vehicle_same_directors: Reserve fund company shares directors with managing agent
 *   managing_agent_controls_reserve_fund: Agent controls the money they're supposed to protect
 */

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const user = await base44.auth.me();
  if (!user || user.role !== 'admin') {
    return Response.json({ error: 'Admin access required' }, { status: 403 });
  }

  const db = base44.asServiceRole;
  const results = { companies: [], properties: [], contacts: [], relationships: [], errors: [] };

  // ── 1. COMPANIES (composite archetypal example) ───────────────────────────

  const companiesData = [
    {
      name: 'Meridian Block Management Limited',
      company_number: 'SC-DEMO-001',
      status: 'active',
      category: 'management',
      registered_address: '45 Commerce Street, Manchester M2 1BD',
      incorporation_date: '2008-03-15',
      sic_code: '68320',
      sic_description: 'Management of real estate on a fee or contract basis',
      region: 'other',
      directors: [
        { name: 'Derek Hollingsworth', role: 'Director', appointed_date: '2008-03-15' },
        { name: 'Sandra Hollingsworth', role: 'Director', appointed_date: '2008-03-15' },
        { name: 'Paul Whitmore', role: 'Director', appointed_date: '2012-06-01' },
      ],
      notes: 'COMPOSITE ARCHETYPE — based on documented tribunal case patterns. ' +
             'Block managing agent managing 12 residential developments across Greater Manchester. ' +
             'Charges management fee of 15% of total service charge collected. ' +
             'Also charges: administration fee, postage fee, bank charges fee, insurance commission. ' +
             'PATTERN: all fees charged by same company that controls the reserve fund. ' +
             'Accounts typically filed 6-9 months late. No ARMA membership. No client money protection.',
    },
    {
      name: 'Meridian Service Charge Accounts Limited',
      company_number: 'SC-DEMO-002',
      status: 'active',
      category: 'service_charge_vehicle',
      registered_address: '45 Commerce Street, Manchester M2 1BD',
      incorporation_date: '2009-01-08',
      sic_code: '64991',
      sic_description: 'Financial intermediation not elsewhere classified',
      region: 'other',
      directors: [
        { name: 'Derek Hollingsworth', role: 'Director', appointed_date: '2009-01-08' },
        { name: 'Sandra Hollingsworth', role: 'Director', appointed_date: '2009-01-08' },
      ],
      notes: 'SERVICE CHARGE VEHICLE — same directors and same address as managing agent. ' +
             'Purpose: to hold service charge reserve funds "separately" from the managing agent. ' +
             'In practice: same people control both companies. ' +
             'CRITICAL: service charges paid by leaseholders go into this vehicle. ' +
             'Administration fees paid FROM this vehicle back to managing agent. ' +
             'Accounts: consistently filed late (7-11 months after year end). ' +
             'Annual accounts show recurring "management fees payable" to Meridian Block Management. ' +
             'Tribunal risk: under Landlord & Tenant Act 1985 s.21, leaseholders can demand accounts — ' +
             'but most do not know this right exists. ' +
             'PATTERN: service_charge_vehicle_same_directors (CRITICAL COI)',
    },
    {
      name: 'Meridian Maintenance Services Limited',
      company_number: 'SC-DEMO-003',
      status: 'active',
      category: 'associates',
      registered_address: '47 Commerce Street, Manchester M2 1BD',
      incorporation_date: '2010-11-20',
      sic_code: '41200',
      sic_description: 'Construction of residential and non-residential buildings',
      region: 'other',
      directors: [
        { name: 'Paul Whitmore', role: 'Director', appointed_date: '2010-11-20' },
        { name: 'Derek Hollingsworth', role: 'Director', appointed_date: '2010-11-20' },
      ],
      notes: 'MAINTENANCE SUBSIDIARY — connected to managing agent via shared directors and adjacent address. ' +
             'Appointed by Meridian Block Management for all maintenance works without competitive tender. ' +
             'PATTERN (Peverel/Cirrus parallel): managing agent appoints own maintenance company — ' +
             'inflated quotes, no competitive process, fees paid from service charge vehicle. ' +
             'Day rate: £385/day for basic maintenance. Market rate: £180-220/day. ' +
             'Estimated annual overcharge across managed portfolio: £45,000-60,000. ' +
             'LEGAL EXPOSURE: Landlord & Tenant Act 1985 s.19 — service charges must be reasonable. ' +
             'Tribunal can order repayment of unreasonable charges + costs.',
    },
    {
      name: 'Hollingsworth Family Properties Limited',
      company_number: 'SC-DEMO-004',
      status: 'active',
      category: 'investment',
      registered_address: '12 Beech Avenue, Altrincham WA14 2PQ',
      incorporation_date: '2005-07-01',
      sic_code: '68100',
      sic_description: 'Buying and selling of own real estate',
      region: 'other',
      directors: [
        { name: 'Derek Hollingsworth', role: 'Director', appointed_date: '2005-07-01' },
        { name: 'Sandra Hollingsworth', role: 'Director', appointed_date: '2005-07-01' },
      ],
      notes: 'Personal investment vehicle for Derek and Sandra Hollingsworth. ' +
             'Holds freehold titles of 3 of the 12 developments managed by Meridian Block Management. ' +
             'CRITICAL CONFLICT: Hollingsworth family company holds the FREEHOLD of blocks ' +
             'that their own managing agent (Meridian) manages and their own service charge vehicle holds funds for. ' +
             'Triple conflict: freeholder + managing agent + service charge trustee = same family.',
    },
  ];

  const companyIds = {};
  for (const co of companiesData) {
    try {
      const existing = await db.entities.Company.filter({ company_number: co.company_number });
      if (existing.length > 0) {
        companyIds[co.name] = existing[0].id;
        results.companies.push(`EXISTS: ${co.name}`);
      } else {
        const created = await db.entities.Company.create(co);
        companyIds[co.name] = created.id;
        results.companies.push(`CREATED: ${co.name}`);
      }
    } catch (e) {
      results.errors.push(`Company [${co.name}]: ${e.message}`);
    }
  }

  // ── 2. PROPERTY (the managed block) ──────────────────────────────────────

  let propertyId = null;
  try {
    const existing = await db.entities.Property.filter({ postcode: 'M21 0BP' });
    if (existing.length > 0) {
      propertyId = existing[0].id;
      results.properties.push('EXISTS: Ashton Court, Manchester');
    } else {
      const prop = await db.entities.Property.create({
        name: 'Ashton Court (Composite Archetype)',
        address_line_1: 'Ashton Court',
        address_line_2: 'Didsbury',
        city: 'Manchester',
        postcode: 'M21 0BP',
        region: 'other',
        property_type: 'leasehold_block',
        ownership_type: 'leasehold',
        owning_company: companyIds['Hollingsworth Family Properties Limited'] || '',
        management_company: companyIds['Meridian Block Management Limited'] || '',
        total_units: 24,
        year_built: 2002,
        notes: 'COMPOSITE ARCHETYPE PROPERTY — 24-unit leasehold block. ' +
               'Annual service charge: £1,800/unit = £43,200/year total. ' +
               'Reserve fund target: £120,000. Actual reserve fund: £18,000 (severe shortfall). ' +
               'Management fee: 15% = £6,480/year to Meridian Block Management. ' +
               'Maintenance (Meridian Maintenance Services): £22,000/year. ' +
               'Insurance commission: £3,200/year (undisclosed to leaseholders). ' +
               'Total fees to connected companies: ~£31,680/year = 73% of total service charge income. ' +
               'FREEHOLDER: Hollingsworth Family Properties Ltd — same directors as managing agent. ' +
               'TRIPLE CONFLICT: freeholder + manager + service charge trustee = same family.',
      });
      propertyId = prop.id;
      results.properties.push('CREATED: Ashton Court, Manchester');
    }
  } catch (e) {
    results.errors.push(`Property: ${e.message}`);
  }

  // ── 3. CONTACTS ───────────────────────────────────────────────────────────

  const contactsData = [
    {
      full_name: 'Derek Hollingsworth',
      contact_type: 'director',
      company_name: 'Meridian Block Management Limited',
      address: '45 Commerce Street, Manchester M2 1BD',
      notes: 'Director of 4 connected companies: Meridian Block Management, Meridian Service Charge Accounts, ' +
             'Meridian Maintenance Services, Hollingsworth Family Properties. ' +
             'CRITICAL: simultaneously freeholder, managing agent director, service charge trustee, and maintenance contractor director. ' +
             'This is the maximum possible concentration of conflicts. ' +
             'Under RICS Service Charge Residential Management Code: all of these relationships should be disclosed in writing to leaseholders. ' +
             'Under LTA 1985 s.21A: leaseholders can demand accounts. Under s.27A: can apply to FTT to challenge charges.',
    },
    {
      full_name: 'Sandra Hollingsworth',
      contact_type: 'director',
      company_name: 'Meridian Block Management Limited',
      address: '45 Commerce Street, Manchester M2 1BD',
      notes: 'Co-director across Meridian group and Hollingsworth Family Properties. ' +
             'Likely spouse/family member of Derek Hollingsworth. ' +
             'PATTERN: family-controlled property management group — typical of small-to-medium block management operators ' +
             'that represent the majority of tribunal complaints.',
    },
    {
      full_name: 'Paul Whitmore',
      contact_type: 'director',
      company_name: 'Meridian Maintenance Services Limited',
      address: '47 Commerce Street, Manchester M2 1BD',
      notes: 'Director of Meridian Block Management and Meridian Maintenance Services. ' +
             'Also a director of the managing agent. ' +
             'Appoints his own maintenance company to do works. Classic circular conflict.',
    },
  ];

  const contactIds = {};
  for (const c of contactsData) {
    try {
      const existing = await db.entities.Contact.filter({ full_name: c.full_name, company_name: c.company_name });
      if (existing.length > 0) {
        contactIds[c.full_name] = existing[0].id;
        results.contacts.push(`EXISTS: ${c.full_name}`);
      } else {
        const created = await db.entities.Contact.create(c);
        contactIds[c.full_name] = created.id;
        results.contacts.push(`CREATED: ${c.full_name}`);
      }
    } catch (e) {
      results.errors.push(`Contact [${c.full_name}]: ${e.message}`);
    }
  }

  // ── 4. RELATIONSHIPS ──────────────────────────────────────────────────────

  const relationships = [
    // Derek → Meridian Block Management
    {
      from_entity_type: 'person',
      from_entity_id: contactIds['Derek Hollingsworth'],
      from_label: 'Derek Hollingsworth',
      to_entity_type: 'company',
      to_entity_id: companyIds['Meridian Block Management Limited'],
      to_label: 'Meridian Block Management Limited',
      relationship_type: 'director_of',
      relationship_label: 'Director of',
      date_from: '2008-03-15',
      control_type: 'direct',
      verified: false,
      source: 'manual',
      conflict_of_interest: true,
      conflict_description: 'Director of managing agent AND service charge vehicle AND maintenance contractor AND freehold holder.',
      coi_pattern: 'service_charge_vehicle_same_directors',
      scenario_tag: 'service_charge_vehicle',
    },
    // Derek → Service Charge Vehicle
    {
      from_entity_type: 'person',
      from_entity_id: contactIds['Derek Hollingsworth'],
      from_label: 'Derek Hollingsworth',
      to_entity_type: 'company',
      to_entity_id: companyIds['Meridian Service Charge Accounts Limited'],
      to_label: 'Meridian Service Charge Accounts Limited',
      relationship_type: 'director_of',
      relationship_label: 'Director of',
      date_from: '2009-01-08',
      control_type: 'direct',
      verified: false,
      source: 'manual',
      conflict_of_interest: true,
      conflict_description: 'Controls the service charge reserve fund AND the company that charges fees against it.',
      auto_detected_coi: false,
      coi_pattern: 'service_charge_vehicle_same_directors',
      scenario_tag: 'service_charge_vehicle',
    },
    // Derek → Maintenance company
    {
      from_entity_type: 'person',
      from_entity_id: contactIds['Derek Hollingsworth'],
      from_label: 'Derek Hollingsworth',
      to_entity_type: 'company',
      to_entity_id: companyIds['Meridian Maintenance Services Limited'],
      to_label: 'Meridian Maintenance Services Limited',
      relationship_type: 'director_of',
      relationship_label: 'Director of',
      date_from: '2010-11-20',
      control_type: 'direct',
      verified: false,
      source: 'manual',
      conflict_of_interest: true,
      conflict_description: 'Appoints own maintenance company without tender process.',
      coi_pattern: 'service_charge_vehicle_same_directors',
      scenario_tag: 'service_charge_vehicle',
    },
    // Derek → Hollingsworth Properties (freeholder)
    {
      from_entity_type: 'person',
      from_entity_id: contactIds['Derek Hollingsworth'],
      from_label: 'Derek Hollingsworth',
      to_entity_type: 'company',
      to_entity_id: companyIds['Hollingsworth Family Properties Limited'],
      to_label: 'Hollingsworth Family Properties Limited',
      relationship_type: 'director_of',
      relationship_label: 'Director of',
      date_from: '2005-07-01',
      control_type: 'direct',
      verified: false,
      source: 'manual',
      conflict_of_interest: true,
      conflict_description: 'Director/owner of freeholder company that appoints the managing agent (also his company). Maximum COI.',
      auto_detected_coi: false,
      coi_pattern: 'freehold_and_rtm_same_controller',
      scenario_tag: 'service_charge_vehicle',
    },
    // Service Charge Vehicle → Block (service_charge_vehicle_for)
    {
      from_entity_type: 'company',
      from_entity_id: companyIds['Meridian Service Charge Accounts Limited'],
      from_label: 'Meridian Service Charge Accounts Limited',
      to_entity_type: 'property',
      to_entity_id: propertyId,
      to_label: 'Ashton Court (Composite Archetype)',
      relationship_type: 'service_charge_vehicle_for',
      relationship_label: 'Holds service charge funds for',
      date_from: '2009-06-01',
      control_type: 'direct',
      notes: 'Reserve fund of £18,000 against target of £120,000. ' +
             'Annual contributions: £43,200. Annual fees to connected companies: £31,680. ' +
             'Effective reserve accumulation rate: £11,520/year — will take 8.5 years to reach target at this rate. ' +
             'Late filing: accounts consistently 7-11 months overdue. ' +
             'LTA 1985 s.21 demands by leaseholders routinely ignored for 3-4 months.',
      verified: false,
      source: 'manual',
      conflict_of_interest: true,
      conflict_description: 'Service charge vehicle controlled by same directors as managing agent — no independent oversight of funds.',
      auto_detected_coi: false,
      coi_pattern: 'service_charge_vehicle_same_directors',
      risk_score: 92,
      scenario_tag: 'service_charge_vehicle',
    },
    // Managing agent → Block
    {
      from_entity_type: 'company',
      from_entity_id: companyIds['Meridian Block Management Limited'],
      from_label: 'Meridian Block Management Limited',
      to_entity_type: 'property',
      to_entity_id: propertyId,
      to_label: 'Ashton Court (Composite Archetype)',
      relationship_type: 'manages_block',
      relationship_label: 'Manages block',
      date_from: '2009-06-01',
      control_type: 'direct',
      notes: '15% management fee + undisclosed insurance commission + admin fees = ~73% of total service charge to connected companies.',
      verified: false,
      source: 'manual',
      conflict_of_interest: true,
      conflict_description: 'Managing agent controls the service charge vehicle for the block it manages.',
      coi_pattern: 'managing_agent_controls_reserve_fund',
      scenario_tag: 'service_charge_vehicle',
    },
    // Hollingsworth Properties → Block (freeholder)
    {
      from_entity_type: 'company',
      from_entity_id: companyIds['Hollingsworth Family Properties Limited'],
      from_label: 'Hollingsworth Family Properties Limited',
      to_entity_type: 'property',
      to_entity_id: propertyId,
      to_label: 'Ashton Court (Composite Archetype)',
      relationship_type: 'owns_freehold',
      relationship_label: 'Owns freehold of',
      date_from: '2002-01-01',
      control_type: 'direct',
      notes: 'Freeholder appoints own managing agent — no arms-length appointment.',
      verified: false,
      source: 'manual',
      conflict_of_interest: true,
      conflict_description: 'Freeholder and managing agent are connected companies (same family directors). Freeholder has financial incentive to appoint high-fee manager.',
      coi_pattern: 'freehold_and_rtm_same_controller',
      scenario_tag: 'service_charge_vehicle',
    },
    // Maintenance company → Block (appointed without tender)
    {
      from_entity_type: 'company',
      from_entity_id: companyIds['Meridian Maintenance Services Limited'],
      from_label: 'Meridian Maintenance Services Limited',
      to_entity_type: 'property',
      to_entity_id: propertyId,
      to_label: 'Ashton Court (Composite Archetype)',
      relationship_type: 'manages_block',
      relationship_label: 'Maintenance contractor for (no tender)',
      date_from: '2010-12-01',
      control_type: 'direct',
      notes: 'Appointed by Meridian Block Management without competitive tender. ' +
             'Day rate 75% above market rate. Paid from service charge vehicle. ' +
             'LTA 1985 s.20 consultation required for works over £250/unit — evidence of non-compliance.',
      verified: false,
      source: 'manual',
      conflict_of_interest: true,
      conflict_description: 'Maintenance contractor shares directors with managing agent — no competitive appointment.',
      coi_pattern: 'service_charge_vehicle_same_directors',
      scenario_tag: 'service_charge_vehicle',
    },
  ].filter(r => r.from_entity_id && r.to_entity_id);

  for (const rel of relationships) {
    try {
      const existing = await db.entities.OwnershipRelationship.filter({
        from_entity_id: rel.from_entity_id,
        to_entity_id: rel.to_entity_id,
        relationship_type: rel.relationship_type,
      });
      if (existing.length > 0) {
        results.relationships.push(`EXISTS: ${rel.from_label} → ${rel.relationship_type} → ${rel.to_label}`);
      } else {
        await db.entities.OwnershipRelationship.create(rel);
        results.relationships.push(`CREATED: ${rel.from_label} → ${rel.relationship_type} → ${rel.to_label}`);
      }
    } catch (e) {
      results.errors.push(`Rel [${rel.from_label}→${rel.to_label}]: ${e.message}`);
    }
  }

  return Response.json({
    success: true,
    scenario: 'E — Service Charge Vehicle (Composite Archetype)',
    summary: {
      companies: results.companies.length,
      properties: results.properties.length,
      contacts: results.contacts.length,
      relationships: results.relationships.length,
      errors: results.errors.length,
    },
    patterns_trained: [
      'service_charge_vehicle_same_directors: Reserve fund company shares directors with managing agent',
      'managing_agent_controls_reserve_fund: Agent controls the money they are supposed to protect',
      'freehold_and_rtm_same_controller: Freeholder and managing agent are same family/group',
    ],
    financial_impact: {
      annual_service_charge: 43200,
      fees_to_connected_companies: 31680,
      percentage_to_connected: '73%',
      reserve_fund_shortfall: 101000,
      estimated_overcharge_maintenance: 47500,
    },
    legal_levers: [
      'LTA 1985 s.19: Service charges must be reasonable',
      'LTA 1985 s.20: Consultation required for major works (>£250/unit)',
      'LTA 1985 s.21: Leaseholders can demand service charge accounts',
      'LTA 1985 s.27A: FTT application to challenge unreasonable charges',
      'RICS Service Charge Residential Management Code: disclosure obligations',
    ],
    detail: results,
  });
});