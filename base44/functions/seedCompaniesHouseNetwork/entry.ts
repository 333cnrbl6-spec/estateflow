/**
 * seedCompaniesHouseNetwork
 * 
 * Phase 1: Powell Network Seeder
 * - Starts from known Powell seed company numbers
 * - Fetches officers, PSC, filing history for each
 * - Discovers their other directorships (1 level deep)
 * - Stores everything as CompaniesHouseProfile + OwnershipRelationship records
 * - Zero LLM credits — pure CH API + entity writes
 * 
 * Runs gently: processes a small batch per invocation to stay within rate limits.
 */

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const CH_BASE = 'https://api.company-information.service.gov.uk';

// Seed strategy: we search CH for "Powell" property companies dynamically
// rather than hardcoding numbers that may be wrong.
// The DISCOVER_QUERIES array drives the initial population.
// Once companies are found and stored, the officer network expansion takes over.
const DISCOVER_QUERIES = [
  'Powell property management',
  'Powell letting agents',
  'Powell estates',
  'Powell real estate',
  'Powell block management',
  'Powell residential',
  'Powell freeholds',
  'Powell ground rent',
];

// Fallback: known real UK property management company numbers (verified active)
// These anchor the graph even if searches return nothing
const POWELL_SEED_COMPANIES = [];

// Geographic filter — only expand into companies registered in these postcode prefixes
// Keeps data relevant, avoids noise
const TARGET_POSTCODE_PREFIXES = [
  'SW', 'SE', 'W', 'E', 'N', 'NW', 'EC', 'WC', // London
  'BR', 'CR', 'DA', 'EN', 'HA', 'IG', 'KT', 'RM', 'SM', 'TN', 'TW', 'UB', 'WD', // Greater London
  'GU', 'RH', 'BN', 'SO', 'PO', // South East
];

async function sleep(ms) {
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
        const wait = attempt * 3000;
        console.warn(`[chFetch] Rate limited — waiting ${wait}ms`);
        await sleep(wait);
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

function isInTargetRegion(address) {
  if (!address) return true; // include if no address — don't exclude by default
  const upper = address.toUpperCase();
  return TARGET_POSTCODE_PREFIXES.some(prefix => upper.includes(` ${prefix}`) || upper.startsWith(prefix));
}

async function fetchAndStoreCompany(base44, companyNumber, apiKey, depth = 0) {
  try {
    // Check if already stored and recently synced (skip if < 7 days old)
    const existing = await base44.asServiceRole.entities.CompaniesHouseProfile.filter({ company_number: companyNumber });
    if (existing.length > 0 && existing[0].last_synced) {
      const ageDays = (Date.now() - new Date(existing[0].last_synced).getTime()) / 86400000;
      if (ageDays < 7) {
        console.log(`[seed] Skipping ${companyNumber} — synced ${Math.round(ageDays)}d ago`);
        return existing[0];
      }
    }

    console.log(`[seed] Fetching company ${companyNumber} (depth ${depth})`);
    await sleep(200); // gentle — 5 req/sec max

    const [companyRes, officersRes, pscRes, filingRes] = await Promise.all([
      chFetch(`/company/${companyNumber}`, apiKey),
      chFetch(`/company/${companyNumber}/officers?items_per_page=50`, apiKey),
      chFetch(`/company/${companyNumber}/persons-with-significant-control?items_per_page=50`, apiKey),
      chFetch(`/company/${companyNumber}/filing-history?items_per_page=10`, apiKey),
    ]);

    if (!companyRes) {
      console.warn(`[seed] No data for ${companyNumber}`);
      return null;
    }

    const address = companyRes.registered_office_address
      ? `${companyRes.registered_office_address.address_line_1 || ''}, ${companyRes.registered_office_address.postal_code || ''}`
      : '';

    const officers = (officersRes?.items || []).map(o => ({
      name: o.name,
      role: o.officer_role,
      appointed_on: o.appointed_on || '',
      resigned_on: o.resigned_on || '',
      nationality: o.nationality || '',
      officer_id: o.links?.officer?.appointments?.split('/')?.[2] || '',
    }));

    const psc = (pscRes?.items || []).map(p => ({
      name: p.name,
      nature_of_control: (p.natures_of_control || []).join(', '),
      notified_on: p.notified_on || '',
      nationality: p.nationality || '',
    }));

    const filings = (filingRes?.items || []).map(f => ({
      date: f.date,
      type: f.type,
      description: f.description,
      category: f.category,
    }));

    // Build critical alerts
    const alerts = [];
    if (companyRes.accounts_overdue) {
      alerts.push({ type: 'accounts_overdue', severity: 'high', message: 'Annual accounts overdue', status: 'active', generated_date: new Date().toISOString() });
    }
    if (['dissolved', 'liquidation', 'administration'].includes(companyRes.company_status)) {
      alerts.push({ type: 'status_change', severity: 'critical', message: `Company status: ${companyRes.company_status}`, status: 'active', generated_date: new Date().toISOString() });
    }

    const profileData = {
      company_number: companyNumber,
      company_name: companyRes.company_name,
      company_status: companyRes.company_status || 'unknown',
      company_type: companyRes.type || '',
      incorporation_date: companyRes.date_of_creation || '',
      registered_address: address,
      sic_codes: companyRes.sic_codes || [],
      directors: officers,
      persons_with_significant_control: psc,
      filing_history: filings,
      has_active_mortgages: companyRes.has_charges || false,
      mortgages_count: companyRes.charges_count || 0,
      accounts_filing_due: companyRes.accounts?.next_due || null,
      accounts_filing_overdue: companyRes.accounts_overdue || false,
      confirmation_statement_due: companyRes.confirmation_statement?.next_due || null,
      critical_alerts: alerts,
      last_synced: new Date().toISOString(),
      next_sync_due: new Date(Date.now() + 7 * 86400000).toISOString(),
    };

    let profile;
    if (existing.length > 0) {
      profile = await base44.asServiceRole.entities.CompaniesHouseProfile.update(existing[0].id, profileData);
    } else {
      profile = await base44.asServiceRole.entities.CompaniesHouseProfile.create(profileData);
    }

    console.log(`[seed] Stored ${companyRes.company_name} (${companyNumber}), ${officers.length} officers, ${psc.length} PSC`);
    return profile;
  } catch (err) {
    console.error(`[seed] Error for ${companyNumber}: ${err.message}`);
    return null;
  }
}

async function buildRelationships(base44, profile, officers, psc) {
  const relationships = [];

  // Officer → Company relationships
  for (const officer of officers.filter(o => !o.resigned_on)) {
    relationships.push({
      from_entity_type: 'person',
      from_entity_id: officer.officer_id || officer.name.replace(/\s+/g, '_').toLowerCase(),
      from_label: officer.name,
      to_entity_type: 'company',
      to_entity_id: profile.company_number,
      to_label: profile.company_name,
      relationship_type: officer.role === 'secretary' ? 'secretary_of' : 'director_of',
      relationship_label: officer.role === 'secretary' ? 'Secretary of' : 'Director of',
      verified: true,
      source: 'companies_house',
      conflict_of_interest: false,
    });
  }

  // PSC → Company relationships
  for (const p of psc) {
    relationships.push({
      from_entity_type: 'person',
      from_entity_id: p.name.replace(/\s+/g, '_').toLowerCase(),
      from_label: p.name,
      to_entity_type: 'company',
      to_entity_id: profile.company_number,
      to_label: profile.company_name,
      relationship_type: 'psc_of',
      relationship_label: 'PSC of',
      notes: p.nature_of_control,
      verified: true,
      source: 'companies_house',
      conflict_of_interest: false,
    });
  }

  for (const rel of relationships) {
    try {
      // Check for existing to avoid duplicates
      const existing = await base44.asServiceRole.entities.OwnershipRelationship.filter({
        from_entity_id: rel.from_entity_id,
        to_entity_id: rel.to_entity_id,
        relationship_type: rel.relationship_type,
      });
      if (existing.length === 0) {
        await base44.asServiceRole.entities.OwnershipRelationship.create(rel);
        await sleep(50); // gentle writes
      }
    } catch (err) {
      console.warn(`[seed] Relationship write skipped: ${err.message}`);
    }
  }
}

async function discoverOfficerAppointments(base44, officer, apiKey, processedCompanies) {
  if (!officer.officer_id) return [];
  try {
    await sleep(300);
    const data = await chFetch(`/officers/${officer.officer_id}/appointments?items_per_page=50`, apiKey);
    if (!data) return [];

    const newCompanies = [];
    for (const appt of (data.items || [])) {
      const cn = appt.appointed_to?.company_number;
      if (cn && !processedCompanies.has(cn) && !appt.resigned_on) {
        const addr = appt.appointed_to?.registered_office_address?.postal_code || '';
        if (isInTargetRegion(addr) || addr === '') {
          newCompanies.push(cn);
        }
      }
    }
    return newCompanies;
  } catch (err) {
    return [];
  }
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));
    const { batch_size = 5, depth = 1 } = body; // small default batch — gentle

    const apiKey = Deno.env.get('COMPANIES_HOUSE_API_KEY');
    if (!apiKey) {
      return Response.json({ error: 'COMPANIES_HOUSE_API_KEY not configured' }, { status: 500 });
    }

    // Get already-processed company numbers to avoid reprocessing
    const existingProfiles = await base44.asServiceRole.entities.CompaniesHouseProfile.list('', 500);
    const processedCompanies = new Set(existingProfiles.map(p => p.company_number).filter(Boolean));

    let workQueue = [];

    if (existingProfiles.length === 0 || POWELL_SEED_COMPANIES.filter(cn => !processedCompanies.has(cn)).length > 0) {
      // Phase 1: Use search queries to discover initial Powell-related companies
      const queryIdx = body.query_index !== undefined ? body.query_index : (new Date().getHours() % DISCOVER_QUERIES.length);
      const searchQuery = DISCOVER_QUERIES[queryIdx];
      console.log(`[seed] Discovery phase — searching: "${searchQuery}"`);

      const searchData = await chFetch(`/search/companies?q=${encodeURIComponent(searchQuery)}&items_per_page=20`, apiKey);
      if (searchData?.items) {
        for (const c of searchData.items) {
          if (!processedCompanies.has(c.company_number)) {
            const addr = c.address_snippet || '';
            if (isInTargetRegion(addr) || addr === '') {
              workQueue.push(c.company_number);
            }
          }
        }
      }
      console.log(`[seed] Search found ${workQueue.length} new companies to process`);
    }

    // Phase 2: Expand via officer appointment networks
    if (workQueue.length < batch_size && depth > 0 && existingProfiles.length > 0) {
      console.log('[seed] Expanding officer networks...');
      const recentProfiles = existingProfiles.slice(0, 15);
      for (const profile of recentProfiles) {
        if (!profile.directors) continue;
        for (const officer of profile.directors.filter(o => o.officer_id && !o.resigned_on).slice(0, 3)) {
          const discovered = await discoverOfficerAppointments(base44, officer, apiKey, processedCompanies);
          workQueue.push(...discovered.slice(0, 3));
          if (workQueue.length >= batch_size * 3) break;
        }
        if (workQueue.length >= batch_size * 3) break;
      }
      workQueue = [...new Set(workQueue)].slice(0, batch_size * 2);
    }

    const thisBatch = workQueue.slice(0, batch_size);
    const results = { processed: 0, stored: 0, relationships: 0, errors: 0, companies: [] };

    for (const companyNumber of thisBatch) {
      results.processed++;
      const profile = await fetchAndStoreCompany(base44, companyNumber, apiKey, depth);
      if (profile) {
        results.stored++;
        results.companies.push(profile.company_name || companyNumber);
        // Build relationships for this company
        await buildRelationships(base44, profile, profile.directors || [], profile.persons_with_significant_control || []);
        await sleep(500); // pause between companies — stay gentle
      } else {
        results.errors++;
      }
    }

    console.log(`[seedCompaniesHouseNetwork] Batch complete: ${results.stored}/${results.processed} stored`);
    return Response.json({
      ...results,
      queue_remaining: workQueue.length - thisBatch.length,
      total_profiles_in_db: existingProfiles.length + results.stored,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error('[seedCompaniesHouseNetwork] Fatal:', err.message);
    return Response.json({ error: err.message }, { status: 500 });
  }
});