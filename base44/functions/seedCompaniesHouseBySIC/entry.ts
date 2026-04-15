/**
 * seedCompaniesHouseBySIC
 *
 * Phase 2: SIC Code Discovery Seeder
 * - Queries Companies House for companies by SIC code
 * - Targets property management, letting agents, freeholders, RTM companies
 * - Stores CompaniesHouseProfile records + OwnershipRelationship data
 * - Also seeds Company records (potential prospects/customers)
 * - Zero LLM credits — pure CH API calls + entity writes
 *
 * Rotates through SIC codes each run — one SIC code per automation trigger.
 */

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const CH_BASE = 'https://api.company-information.service.gov.uk';

// Property & letting industry SIC codes — rotated each run
const PROPERTY_SIC_CODES = [
  { code: '68320', label: 'Management of real estate on a fee or contract basis', priority: 1 },
  { code: '68209', label: 'Other letting and operating of own or leased real estate', priority: 1 },
  { code: '68100', label: 'Buying and selling of own real estate', priority: 2 },
  { code: '68201', label: 'Renting and operating of housing association real estate', priority: 2 },
  { code: '68310', label: 'Real estate agencies', priority: 1 },
  { code: '41100', label: 'Development of building projects', priority: 3 },
  { code: '41201', label: 'Construction of commercial buildings', priority: 3 },
  { code: '41202', label: 'Construction of domestic buildings', priority: 3 },
  { code: '64209', label: 'Activities of other holding companies (freeholders)', priority: 2 },
  { code: '64191', label: 'Banks — often used by RTM/service charge entities', priority: 3 },
  { code: '98000', label: 'Residents associations / RTM companies', priority: 1 },
  { code: '69201', label: 'Accounting/auditing — property accountants', priority: 3 },
];

// Target London + South East postcodes for relevance
const TARGET_POSTCODES = [
  'SW', 'SE', 'W1', 'W2', 'W8', 'W11', 'W14',
  'E1', 'E2', 'E14', 'N1', 'N4', 'N8', 'NW1', 'NW3', 'NW6',
  'EC1', 'EC2', 'WC1', 'WC2',
  'BR', 'CR', 'DA', 'EN', 'HA', 'IG', 'KT', 'RM', 'SM', 'TW', 'UB',
  'GU', 'RH', 'BN', 'TN',
];

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

function toBase64(str) {
  return btoa(String.fromCharCode(...new TextEncoder().encode(str)));
}

async function chFetch(path, apiKey, retries = 3) {
  if (!apiKey) return null;
  const auth = toBase64(`${apiKey.trim()}:`);
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const res = await fetch(`${CH_BASE}${path}`, {
        headers: { 'Authorization': `Basic ${auth}`, 'User-Agent': 'Premiso/1.0' },
        signal: AbortSignal.timeout(12000),
      });
      if (res.status === 429) {
        await sleep(attempt * 3000);
        continue;
      }
      if (!res.ok) return null;
      return await res.json();
    } catch (err) {
      if (attempt === retries) return null;
      await sleep(attempt * 2000);
    }
  }
  return null;
}

function isInTargetRegion(company) {
  const addr = (company.registered_office_address?.postal_code || company.address_snippet || '').toUpperCase();
  if (!addr) return false;
  return TARGET_POSTCODES.some(p => addr.startsWith(p) || addr.includes(` ${p}`));
}

async function storePotentialProspect(base44, company, sicLabel) {
  try {
    // Check if Company record already exists
    const existing = await base44.asServiceRole.entities.Company.filter({ company_number: company.company_number });
    if (existing.length > 0) return;

    await base44.asServiceRole.entities.Company.create({
      name: company.company_name || company.title,
      company_number: company.company_number,
      company_type: company.company_type || 'ltd',
      status: company.company_status || 'active',
      registered_address: company.address_snippet || '',
      sic_codes: company.sic_codes || [],
      category: 'property_management', // tag as property sector
      notes: `Auto-discovered via SIC ${company.sic_codes?.[0] || 'unknown'} (${sicLabel}). Potential prospect.`,
    });
  } catch (err) {
    // Company entity may have different required fields — silent fail, CH profile is the priority
  }
}

async function storeCompaniesHouseProfile(base44, companyNumber, companyData, apiKey) {
  try {
    // Don't re-fetch if recently stored
    const existing = await base44.asServiceRole.entities.CompaniesHouseProfile.filter({ company_number: companyNumber });
    if (existing.length > 0 && existing[0].last_synced) {
      const ageDays = (Date.now() - new Date(existing[0].last_synced).getTime()) / 86400000;
      if (ageDays < 14) {
        return existing[0]; // fresh enough
      }
    }

    await sleep(200);

    // Fetch full company details
    const fullData = await chFetch(`/company/${companyNumber}`, apiKey);
    if (!fullData) return null;

    const officersRes = await chFetch(`/company/${companyNumber}/officers?items_per_page=50`, apiKey);
    await sleep(150);
    const pscRes = await chFetch(`/company/${companyNumber}/persons-with-significant-control?items_per_page=50`, apiKey);

    const officers = (officersRes?.items || []).map(o => ({
      name: o.name,
      role: o.officer_role,
      appointed_on: o.appointed_on || '',
      resigned_on: o.resigned_on || '',
      officer_id: o.links?.officer?.appointments?.split('/')?.[2] || '',
    }));

    const psc = (pscRes?.items || []).map(p => ({
      name: p.name,
      nature_of_control: (p.natures_of_control || []).join(', '),
      notified_on: p.notified_on || '',
    }));

    const address = fullData.registered_office_address
      ? `${fullData.registered_office_address.address_line_1 || ''}, ${fullData.registered_office_address.postal_code || ''}`.trim().replace(/^,\s*/, '')
      : '';

    const profileData = {
      company_number: companyNumber,
      company_name: fullData.company_name,
      company_status: fullData.company_status || 'unknown',
      company_type: fullData.type || '',
      incorporation_date: fullData.date_of_creation || '',
      registered_address: address,
      sic_codes: fullData.sic_codes || [],
      directors: officers,
      persons_with_significant_control: psc,
      has_active_mortgages: fullData.has_charges || false,
      accounts_filing_due: fullData.accounts?.next_due || null,
      accounts_filing_overdue: fullData.accounts_overdue || false,
      confirmation_statement_due: fullData.confirmation_statement?.next_due || null,
      critical_alerts: [],
      last_synced: new Date().toISOString(),
      next_sync_due: new Date(Date.now() + 14 * 86400000).toISOString(),
    };

    let profile;
    if (existing.length > 0) {
      profile = await base44.asServiceRole.entities.CompaniesHouseProfile.update(existing[0].id, profileData);
    } else {
      profile = await base44.asServiceRole.entities.CompaniesHouseProfile.create(profileData);
    }

    // Create director/PSC relationships
    for (const officer of officers.filter(o => !o.resigned_on)) {
      try {
        const relExists = await base44.asServiceRole.entities.OwnershipRelationship.filter({
          from_entity_id: officer.officer_id || officer.name.replace(/\s+/g, '_').toLowerCase(),
          to_entity_id: companyNumber,
          relationship_type: 'director_of',
        });
        if (relExists.length === 0) {
          await base44.asServiceRole.entities.OwnershipRelationship.create({
            from_entity_type: 'person',
            from_entity_id: officer.officer_id || officer.name.replace(/\s+/g, '_').toLowerCase(),
            from_label: officer.name,
            to_entity_type: 'company',
            to_entity_id: companyNumber,
            to_label: fullData.company_name,
            relationship_type: officer.role === 'secretary' ? 'secretary_of' : 'director_of',
            relationship_label: officer.role === 'secretary' ? 'Secretary of' : 'Director of',
            verified: true,
            source: 'companies_house',
            conflict_of_interest: false,
          });
          await sleep(30);
        }
      } catch (_) {}
    }

    return profile;
  } catch (err) {
    console.error(`[SIC seeder] Error for ${companyNumber}: ${err.message}`);
    return null;
  }
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));

    const apiKey = Deno.env.get('COMPANIES_HOUSE_API_KEY');
    if (!apiKey) {
      return Response.json({ error: 'COMPANIES_HOUSE_API_KEY not configured' }, { status: 500 });
    }

    // Determine which SIC code to process this run
    // Rotate based on hour of day so each run hits a different SIC
    const { sic_index } = body;
    const idx = sic_index !== undefined ? sic_index : (new Date().getHours() % PROPERTY_SIC_CODES.length);
    const targetSIC = PROPERTY_SIC_CODES[idx];

    console.log(`[SIC seeder] Processing SIC ${targetSIC.code} — ${targetSIC.label}`);

    // Search CH for companies with this SIC code using advanced search
    // Limit to London location for relevance, size=100 is the per-page param
    const searchData = await chFetch(
      `/advanced-search/companies?sic_codes=${targetSIC.code}&company_status=active&size=100`,
      apiKey
    );

    if (!searchData || !searchData.items) {
      console.warn(`[SIC seeder] No results for SIC ${targetSIC.code}`);
      return Response.json({
        sic_code: targetSIC.code,
        label: targetSIC.label,
        found: 0,
        stored: 0,
        message: 'No results from CH advanced search'
      });
    }

    // Filter to target region
    const regional = searchData.items.filter(c => isInTargetRegion(c));
    console.log(`[SIC seeder] Found ${searchData.items.length} total, ${regional.length} in target region`);

    // Get existing profiles to avoid re-processing
    const existingProfiles = await base44.asServiceRole.entities.CompaniesHouseProfile.list('', 500);
    const processedSet = new Set(existingProfiles.map(p => p.company_number).filter(Boolean));

    // Process up to 10 new companies per run — stay gentle
    const toProcess = regional
      .filter(c => !processedSet.has(c.company_number))
      .slice(0, 10);

    const results = { sic_code: targetSIC.code, label: targetSIC.label, found: regional.length, stored: 0, prospects_added: 0, errors: 0, companies: [] };

    for (const company of toProcess) {
      const profile = await storeCompaniesHouseProfile(base44, company.company_number, company, apiKey);
      if (profile) {
        results.stored++;
        results.companies.push(company.company_name || company.company_number);
        await storePotentialProspect(base44, company, targetSIC.label);
        results.prospects_added++;
        await sleep(600); // gentle pause between companies
      } else {
        results.errors++;
      }
    }

    console.log(`[SIC seeder] Done: ${results.stored} stored, ${results.prospects_added} prospects added`);
    return Response.json({
      ...results,
      next_sic_index: (idx + 1) % PROPERTY_SIC_CODES.length,
      total_profiles_in_db: existingProfiles.length + results.stored,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error('[SIC seeder] Fatal:', err.message);
    return Response.json({ error: err.message }, { status: 500 });
  }
});