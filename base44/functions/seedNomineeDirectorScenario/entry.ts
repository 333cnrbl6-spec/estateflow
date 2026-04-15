/**
 * seedNomineeDirectorScenario.js
 *
 * SCENARIO B: The Nominee Director Web
 *
 * Based on VERIFIED, REAL public record data — Companies House.
 *
 * DUPORT DIRECTOR LIMITED (Company No. 03524904)
 * Registered address: 2 Southfield Road, Westbury-On-Trym, Bristol BS9 3BH
 * Total Companies House appointments: 17,054
 * Role type: NOMINEE DIRECTOR — appointed for 1 day then resigned, repeatedly
 *
 * This is the most prolific verified example of a nominee director company in UK Companies House.
 * They appear in the Adriatic Land 1 (GR3) filing history (appointed & resigned same day, June 2005).
 *
 * COMPANION: DUPORT SECRETARY LIMITED (same group, same address)
 * Also appears in Adriatic Land 1 (GR3) as Nominee Secretary.
 *
 * THE PATTERN:
 * Company formation agents provide "nominee directors" to satisfy the legal requirement
 * for a director at point of incorporation. The nominee is appointed, signs paperwork,
 * then resigns — often within 24-48 hours. The real beneficial owner then takes over.
 *
 * WHY THIS MATTERS FOR PROPERTY:
 * 1. Offshore SPVs (like Adriatic Land entities) use nominees at incorporation
 * 2. RTM companies formed by managing agents use nominees to obscure who really controls the RTM
 * 3. Service charge vehicles use nominees to create false impression of independence
 * 4. Property fraud: nominee directors used to transfer title, take loans, then vanish
 *
 * THE KEY DISTINCTION (what Premiso must learn):
 * NOMINAL control: person named as director but has no real power (nominee, formation agent)
 * BENEFICIAL control: person who actually makes decisions and receives economic benefit
 *
 * A nominee director is LEGAL. But when combined with:
 * - An offshore entity with no PSC
 * - A freehold company owning residential blocks
 * - A service charge vehicle
 * → it becomes a RED FLAG for beneficial ownership concealment.
 *
 * DATA SOURCES: Companies House public record, Adriatic Land 1 (GR3) filing history,
 * Alison Wright Substack investigation (Temple Secretaries / Stanley Davis Group)
 */

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const user = await base44.auth.me();
  if (!user || user.role !== 'admin') {
    return Response.json({ error: 'Admin access required' }, { status: 403 });
  }

  const db = base44.asServiceRole;
  const results = { companies: [], contacts: [], relationships: [], errors: [] };

  // ── 1. COMPANIES ──────────────────────────────────────────────────────────

  const companiesData = [
    {
      name: 'Duport Director Limited',
      company_number: '03524904',
      status: 'active',
      category: 'associates',
      registered_address: '2 Southfield Road, Westbury-On-Trym, Bristol BS9 3BH',
      incorporation_date: '1998-02-01',
      sic_code: '82990',
      sic_description: 'Other business support service activities not elsewhere classified',
      region: 'other',
      directors: [],
      notes: 'VERIFIED REAL ENTITY — Companies House record. ' +
             'Total appointments: 17,054 (as Nominee Director). ' +
             'Typical appointment duration: 1 day (appointed and resigned same day). ' +
             'Operated by Duport Associates Ltd (company formation agents), Bristol. ' +
             'Appears in Adriatic Land 1 (GR3) filing history: Nominee Director 23 June 2005, resigned same day. ' +
             'PATTERN: nominee_director_high_volume at extreme scale. ' +
             'HOW TO DISTINGUISH: search for control_type = nominee + appointment duration < 7 days. ' +
             'LEGAL STATUS: entirely legal — company formation practice. ' +
             'RISK FLAG: when nominee directs an entity with offshore owner, no PSC, and property assets = critical.',
    },
    {
      name: 'Duport Secretary Limited',
      company_number: '03524910',
      status: 'active',
      category: 'associates',
      registered_address: '2 Southfield Road, Westbury-On-Trym, Bristol BS9 3BH',
      incorporation_date: '1998-02-01',
      sic_code: '82990',
      sic_description: 'Other business support service activities not elsewhere classified',
      region: 'other',
      directors: [],
      notes: 'Companion to Duport Director Ltd — same address, same formation agent group. ' +
             'Provides nominee SECRETARY service (not director). ' +
             'Also appears in Adriatic Land 1 (GR3): Nominee Secretary 23 June 2005, resigned same day. ' +
             'Together they provide a complete "instant company" service — both roles covered for day 1.',
    },
    {
      name: 'Temple Secretaries Limited',
      company_number: '01269945',
      status: 'active',
      category: 'associates',
      registered_address: '6th Floor, One London Wall, London EC2Y 5EB',
      incorporation_date: '1976-06-01',
      sic_code: '82990',
      sic_description: 'Other business support service activities not elsewhere classified',
      region: 'london',
      directors: [],
      notes: 'VERIFIED REAL ENTITY — one of the UK\'s largest company formation/nominee service providers. ' +
             'Thousands of appointments as nominee director across property, finance, and other sectors. ' +
             'Now owned by Stanley Davis Group (A1 Company Services). ' +
             'PATTERN: same-day appointment and resignation as nominee director at incorporation. ' +
             'ALISON WRIGHT INVESTIGATION: Temple Secretaries connected to shell company creation schemes ' +
             'where nominees were used in chains to obscure beneficial ownership of property assets. ' +
             'Used legitimately by thousands of businesses — but also used to obscure property ownership.',
    },
    {
      name: 'Apex Group Secretaries (UK) Limited',
      company_number: '08334728',
      status: 'active',
      category: 'associates',
      registered_address: '4th Floor, 140 Aldersgate Street, London EC1A 4HY',
      incorporation_date: '2012-12-14',
      sic_code: '82990',
      sic_description: 'Other business support service activities not elsewhere classified',
      region: 'london',
      directors: [],
      notes: 'VERIFIED REAL ENTITY — professional fund administration secretary. ' +
             'Current secretary of Adriatic Land 1 (GR3) Limited (appointed November 2013). ' +
             'Apex Group is a legitimate $3.5bn AUM fund administrator. ' +
             'DISTINCTION FROM DUPORT: Apex is ongoing (not day-1-resign) — represents PROFESSIONAL NOMINEE, ' +
             'not evasion. But still means the secretary has no beneficial interest or accountability to leaseholders. ' +
             'PATTERN: nominee_director_high_volume (but professional/legitimate variant — different risk profile).',
    },
    // A fictional property company that used nominees at formation to demonstrate the pattern
    {
      name: 'Riverside Portfolio Properties Limited',
      company_number: 'DEMO-NOM-001',
      status: 'active',
      category: 'freehold',
      registered_address: '2 Southfield Road, Westbury-On-Trym, Bristol BS9 3BH',
      incorporation_date: '2015-04-01',
      sic_code: '68100',
      sic_description: 'Buying and selling of own real estate',
      region: 'other',
      directors: [
        { name: 'Marcus Delancey', role: 'Director', appointed_date: '2015-04-02' },
      ],
      notes: 'COMPOSITE ARCHETYPE — demonstrates the nominee-to-real-director transition pattern. ' +
             'Incorporated 1 April 2015 with Duport Director Ltd as day-1 nominee. ' +
             'Duport resigned same day; Marcus Delancey appointed as real director 2 April 2015. ' +
             'Company then acquired 14 residential freeholds across the North West. ' +
             'Delancey is the BENEFICIAL CONTROLLER — not identifiable on day-1 incorporation filing. ' +
             'No PSC filed for first 8 months (pre-PSC regime). ' +
             'RISK: the 24-hour nominee window is used to obscure who really set up the company.',
    },
  ];

  const companyIds = {};
  for (const co of companiesData) {
    try {
      const existing = co.company_number && !co.company_number.startsWith('DEMO')
        ? await db.entities.Company.filter({ company_number: co.company_number })
        : [];
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

  // ── 2. CONTACTS ───────────────────────────────────────────────────────────

  const contactsData = [
    {
      full_name: 'Marcus Delancey',
      contact_type: 'director',
      company_name: 'Riverside Portfolio Properties Limited',
      address: 'Riverside Business Centre, Salford M5 4FP',
      notes: 'COMPOSITE ARCHETYPE PERSON — beneficial controller of Riverside Portfolio Properties. ' +
             'Real director, not a nominee. Appointed day after Duport Director resigned. ' +
             'Holds 14 residential freeholds through this vehicle. ' +
             'KEY LEARNING: how to distinguish nominee (day-1, resigned) from beneficial controller (day-2+, ongoing). ' +
             'PSC: Marcus Delancey registered as PSC with 75%+ voting rights.',
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

  // ── 3. RELATIONSHIPS ──────────────────────────────────────────────────────

  const relationships = [
    // Duport Director → Adriatic Land 1 (GR3) — find the Adriatic company in DB
    // We reference by name since we seeded it earlier
    ...(companyIds['Duport Director Limited'] && companyIds['Adriatic Land 1 (GR3) Limited'] ? [{
      from_entity_type: 'company',
      from_entity_id: companyIds['Duport Director Limited'],
      from_label: 'Duport Director Limited',
      to_entity_type: 'company',
      to_entity_id: companyIds['Adriatic Land 1 (GR3) Limited'],
      to_label: 'Adriatic Land 1 (GR3) Limited',
      relationship_type: 'nominee_director_of',
      relationship_label: 'Nominee Director of (1 day)',
      date_from: '2005-06-23',
      date_to: '2005-06-23',
      is_historical: true,
      control_type: 'nominee',
      notes: 'Appointed as Nominee Director at incorporation 23 June 2005. Resigned same day. ' +
             '17,054 such appointments across Companies House. Legally valid. ' +
             'Significance: real beneficial controller (eventually Long Harbour/Astor) not visible on day-1 filing. ' +
             'Pattern: offshore_freehold_no_psc + nominee_director_high_volume = CRITICAL combination.',
      verified: true,
      source: 'companies_house',
      conflict_of_interest: false,
      coi_pattern: 'nominee_director_high_volume',
      risk_score: 70,
      scenario_tag: 'nominee_director_web',
    }] : []),

    // Duport Secretary → Adriatic Land 1 (GR3)
    ...(companyIds['Duport Secretary Limited'] && companyIds['Adriatic Land 1 (GR3) Limited'] ? [{
      from_entity_type: 'company',
      from_entity_id: companyIds['Duport Secretary Limited'],
      from_label: 'Duport Secretary Limited',
      to_entity_type: 'company',
      to_entity_id: companyIds['Adriatic Land 1 (GR3) Limited'],
      to_label: 'Adriatic Land 1 (GR3) Limited',
      relationship_type: 'secretary_of',
      relationship_label: 'Nominee Secretary of (1 day)',
      date_from: '2005-06-23',
      date_to: '2005-06-23',
      is_historical: true,
      control_type: 'nominee',
      notes: 'Nominee Secretary at incorporation. Same day resignation. Companion to Duport Director Ltd.',
      verified: true,
      source: 'companies_house',
      conflict_of_interest: false,
      coi_pattern: 'nominee_director_high_volume',
      scenario_tag: 'nominee_director_web',
    }] : []),

    // Apex Group → Adriatic Land 1 (GR3) — ongoing professional nominee secretary
    ...(companyIds['Apex Group Secretaries (UK) Limited'] && companyIds['Adriatic Land 1 (GR3) Limited'] ? [{
      from_entity_type: 'company',
      from_entity_id: companyIds['Apex Group Secretaries (UK) Limited'],
      from_label: 'Apex Group Secretaries (UK) Limited',
      to_entity_type: 'company',
      to_entity_id: companyIds['Adriatic Land 1 (GR3) Limited'],
      to_label: 'Adriatic Land 1 (GR3) Limited',
      relationship_type: 'secretary_of',
      relationship_label: 'Professional Secretary of (ongoing)',
      date_from: '2013-11-29',
      control_type: 'nominee',
      notes: 'Current secretary. Apex Group is a legitimate $3.5bn fund administrator. ' +
             'Ongoing role (not day-1 resign) = professional nominee. Lower risk than formation nominees. ' +
             'Still means no accountability to leaseholders — Apex acts for the fund, not residents.',
      verified: true,
      source: 'companies_house',
      conflict_of_interest: false,
      coi_pattern: 'nominee_director_high_volume',
      scenario_tag: 'nominee_director_web',
    }] : []),

    // Duport Director → Riverside Portfolio (day-1 nominee)
    ...(companyIds['Duport Director Limited'] && companyIds['Riverside Portfolio Properties Limited'] ? [{
      from_entity_type: 'company',
      from_entity_id: companyIds['Duport Director Limited'],
      from_label: 'Duport Director Limited',
      to_entity_type: 'company',
      to_entity_id: companyIds['Riverside Portfolio Properties Limited'],
      to_label: 'Riverside Portfolio Properties Limited',
      relationship_type: 'nominee_director_of',
      relationship_label: 'Nominee Director of (day 1 only)',
      date_from: '2015-04-01',
      date_to: '2015-04-01',
      is_historical: true,
      control_type: 'nominee',
      notes: 'Day-1 nominee director at incorporation. Resigned same day. ' +
             'Real director (Marcus Delancey) appointed following day. ' +
             'TEACHING EXAMPLE: this is the standard pattern — nominee visible, beneficial controller hidden until day 2.',
      verified: false,
      source: 'manual',
      conflict_of_interest: false,
      coi_pattern: 'nominee_director_high_volume',
      risk_score: 40,
      scenario_tag: 'nominee_director_web',
    }] : []),

    // Marcus Delancey → Riverside Portfolio (beneficial controller)
    ...(contactIds['Marcus Delancey'] && companyIds['Riverside Portfolio Properties Limited'] ? [{
      from_entity_type: 'person',
      from_entity_id: contactIds['Marcus Delancey'],
      from_label: 'Marcus Delancey',
      to_entity_type: 'company',
      to_entity_id: companyIds['Riverside Portfolio Properties Limited'],
      to_label: 'Riverside Portfolio Properties Limited',
      relationship_type: 'director_of',
      relationship_label: 'Director of (beneficial)',
      date_from: '2015-04-02',
      control_type: 'beneficial',
      notes: 'Appointed day after Duport nominee resigned. Real beneficial controller. ' +
             'PSC: 75%+ voting rights. Holds 14 residential freeholds through this vehicle. ' +
             'CONTRAST: this relationship has control_type=beneficial, Duport has control_type=nominee. ' +
             'Premiso should flag Duport connection but highlight Delancey as the true controller.',
      verified: false,
      source: 'manual',
      conflict_of_interest: false,
      scenario_tag: 'nominee_director_web',
    }] : []),

    // Delancey → owns freeholds (beneficial_owner_of company that holds freeholds)
    ...(contactIds['Marcus Delancey'] && companyIds['Riverside Portfolio Properties Limited'] ? [{
      from_entity_type: 'person',
      from_entity_id: contactIds['Marcus Delancey'],
      from_label: 'Marcus Delancey',
      to_entity_type: 'company',
      to_entity_id: companyIds['Riverside Portfolio Properties Limited'],
      to_label: 'Riverside Portfolio Properties Limited',
      relationship_type: 'psc_of',
      relationship_label: 'Person with Significant Control of',
      date_from: '2016-04-06',
      control_type: 'beneficial',
      notes: 'PSC registered from 6 April 2016 (PSC regime start date). ' +
             '75%+ voting rights. ' +
             'NOTE: Between April 2015 (incorporation) and April 2016 (PSC regime), beneficial owner was NOT recorded. ' +
             'This 12-month gap is significant — transactions during this period left no public beneficial ownership trail.',
      verified: false,
      source: 'manual',
      conflict_of_interest: false,
      scenario_tag: 'nominee_director_web',
    }] : []),
  ];

  for (const rel of relationships) {
    if (!rel.from_entity_id || !rel.to_entity_id) continue;
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
    scenario: 'B — Nominee Director Web (Duport Director Ltd / formation agents)',
    summary: {
      companies: results.companies.length,
      contacts: results.contacts.length,
      relationships: results.relationships.length,
      errors: results.errors.length,
    },
    patterns_trained: [
      'nominee_director_high_volume: Entity with 17,054 appointments — extreme volume = formation agent, not beneficial controller',
      'control_type distinction: nominee vs beneficial — the key to seeing through corporate veils',
      'date_from = date_to (same day): appointment duration < 1 day = definitive nominee indicator',
      'PSC gap window: 12 months between incorporation and PSC regime = beneficial ownership concealment window',
    ],
    detection_rules: {
      definitive_nominee: 'date_from === date_to AND control_type === nominee',
      suspicious_combination: 'offshore_owner_of + nominee_director_high_volume + no PSC = CRITICAL',
      safe_professional: 'control_type === nominee AND appointment_count < 100 AND ongoing role = MEDIUM (professional admin)',
      beneficial_controller: 'control_type === beneficial AND psc_of = CONFIRMED owner',
    },
    detail: results,
  });
});