// v2 - updated 2026-04-15
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const CH_BASE = 'https://api.company-information.service.gov.uk';

function toBase64(str) {
  try {
    // Safe base64 for any characters
    const encoded = new TextEncoder().encode(str);
    let binary = '';
    encoded.forEach(b => binary += String.fromCharCode(b));
    return btoa(binary);
  } catch (e) {
    console.error('[toBase64] Encoding failed:', e.message);
    throw e;
  }
}

// Fetch with exponential backoff retry
async function chFetch(path, apiKey, retries = 3) {
  if (!apiKey) {
    console.error('[chFetch] No API key provided');
    return null;
  }
  let auth;
  try {
    auth = toBase64(`${apiKey.trim()}:`);
    console.log(`[chFetch] Auth header generated, key length: ${apiKey.trim().length}`);
  } catch (e) {
    console.error('[chFetch] Failed to generate auth header:', e.message);
    return null;
  }
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const res = await fetch(`${CH_BASE}${path}`, {
        headers: {
          'Authorization': `Basic ${auth}`,
          'User-Agent': 'Premiso/1.0'
        },
        signal: AbortSignal.timeout(10000), // 10s timeout
      });

      if (res.status === 429) {
        // Rate limited — wait and retry
        const wait = attempt * 2000;
        console.warn(`[chFetch] Rate limited, waiting ${wait}ms before retry ${attempt}/${retries}`);
        await new Promise(r => setTimeout(r, wait));
        continue;
      }

      if (!res.ok) {
        const errBody = await res.text().catch(() => '');
        console.error(`[chFetch] API returned ${res.status} for ${path} — body: ${errBody.substring(0, 200)}`);
        return null;
      }
      return await res.json();
    } catch (err) {
      console.error(`[chFetch] Attempt ${attempt}/${retries} exception for ${path}: ${err.constructor?.name} — ${err.message}`);
      if (attempt === retries) return null;
      const wait = attempt * 1500;
      await new Promise(r => setTimeout(r, wait));
    }
  }
  return null;
}

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const body = await req.json().catch(() => ({}));
  const { action, query, company_number, officer_id } = body;
  console.log(`[companiesHouseSearch] action=${action} query=${query}`);

  const apiKey = Deno.env.get('COMPANIES_HOUSE_API_KEY');
  if (!apiKey) {
    return Response.json({
      error: 'Companies House API key not configured',
      source: 'unavailable',
      companies: [], officers: [], psc: [], appointments: []
    }, { status: 500 });
  }

  // ── 0. Connectivity test ─────────────────────────────────────────────────
  if (action === 'ping') {
    const apiKey2 = Deno.env.get('COMPANIES_HOUSE_API_KEY') || '';
    const auth2 = toBase64(`${apiKey2.trim()}:`);
    let status, body;
    const rawKey = Deno.env.get('COMPANIES_HOUSE_API_KEY') || '';
    const cleanKey = rawKey.replace(/\s/g, '');
    // Try 1: key as-is with colon (standard CH Basic auth)
    const auth3a = toBase64(`${cleanKey}:`);
    // Try 2: key without hyphens (in case UUID was entered)
    const keyNoHyphen = cleanKey.replace(/-/g, '');
    const auth3b = toBase64(`${keyNoHyphen}:`);

    const results = {};
    for (const [label, authHeader] of [['with-hyphens', auth3a], ['no-hyphens', auth3b]]) {
      try {
        const r = await fetch(`${CH_BASE}/search/companies?q=test&items_per_page=1`, {
          headers: { 'Authorization': `Basic ${authHeader}`, 'User-Agent': 'Premiso/1.0' },
          signal: AbortSignal.timeout(10000),
        });
        results[label] = { status: r.status, ok: r.status === 200 };
      } catch (e) {
        results[label] = { error: e.message };
      }
    }
    return Response.json({ results, rawKeyLength: rawKey.length, cleanKeyLength: cleanKey.length, noHyphenLength: keyNoHyphen.length });
  }

  // ── 1. Search companies ──────────────────────────────────────────────────
  if (action === 'search_companies') {
    console.log(`[companiesHouseSearch] Searching for: ${query}`);
    const data = await chFetch(`/search/companies?q=${encodeURIComponent(query)}&items_per_page=10`, apiKey);
    if (data) {
      const companies = (data.items || []).map(c => ({
        company_number: c.company_number,
        company_name: c.title,
        registered_address: c.address_snippet || '',
        status: c.company_status || 'active',
        company_type: c.company_type || '',
        date_of_creation: c.date_of_creation || '',
        sic_codes: c.sic_codes || [],
      }));
      return Response.json({ companies, source: 'companies_house' });
    }
    return Response.json({ companies: [], error: 'Companies House API temporarily unavailable. Please try again shortly.', source: 'unavailable' });
  }

  // ── 2. Get officers ──────────────────────────────────────────────────────
  if (action === 'get_officers') {
    // Try cache first
    try {
      const cached = await base44.asServiceRole.entities.CompaniesHouseProfile.filter({ company_number });
      if (cached.length > 0 && cached[0].directors && cached[0].last_synced) {
        const ageHours = (Date.now() - new Date(cached[0].last_synced).getTime()) / 3600000;
        if (ageHours < 24) {
          console.log(`[companiesHouseSearch] Serving officers from cache (${Math.round(ageHours)}h old)`);
          return Response.json({ officers: cached[0].directors || [], source: 'cache' });
        }
      }
    } catch (_) {}

    const data = await chFetch(`/company/${company_number}/officers?items_per_page=50`, apiKey);
    if (data) {
      const officers = (data.items || []).map(o => ({
        name: o.name,
        role: o.officer_role,
        appointed_on: o.appointed_on || '',
        resigned_on: o.resigned_on || '',
        nationality: o.nationality || '',
        officer_id: o.links?.officer?.appointments?.split('/')?.[2] || '',
      }));
      return Response.json({ officers, source: 'companies_house' });
    }
    return Response.json({ officers: [], error: 'Officers temporarily unavailable.', source: 'unavailable' });
  }

  // ── 3. Get PSC ───────────────────────────────────────────────────────────
  if (action === 'get_psc') {
    // Try cache first
    try {
      const cached = await base44.asServiceRole.entities.CompaniesHouseProfile.filter({ company_number });
      if (cached.length > 0 && cached[0].persons_with_significant_control && cached[0].last_synced) {
        const ageHours = (Date.now() - new Date(cached[0].last_synced).getTime()) / 3600000;
        if (ageHours < 24) {
          console.log(`[companiesHouseSearch] Serving PSC from cache (${Math.round(ageHours)}h old)`);
          return Response.json({ psc: cached[0].persons_with_significant_control || [], source: 'cache' });
        }
      }
    } catch (_) {}

    const data = await chFetch(`/company/${company_number}/persons-with-significant-control?items_per_page=50`, apiKey);
    if (data) {
      const psc = (data.items || []).map(p => ({
        name: p.name,
        role: 'Person with Significant Control',
        nature_of_control: (p.natures_of_control || []).join(', '),
        notified_on: p.notified_on || '',
        nationality: p.nationality || '',
      }));
      return Response.json({ psc, source: 'companies_house' });
    }
    return Response.json({ psc: [], source: 'unavailable' });
  }

  // ── 4. Search officer by name ─────────────────────────────────────────────
  if (action === 'search_officer') {
    const data = await chFetch(`/search/officers?q=${encodeURIComponent(query)}&items_per_page=10`, apiKey);
    if (data) {
      const officers = (data.items || []).map(o => ({
        name: o.title,
        officer_id: o.links?.self?.split('/')?.[2] || '',
        appointments_count: o.appointment_count || 0,
        address: o.address_snippet || '',
      }));
      return Response.json({ officers, source: 'companies_house' });
    }
    return Response.json({ officers: [], source: 'unavailable' });
  }

  // ── 5. Get officer appointments ───────────────────────────────────────────
  if (action === 'get_officer_appointments') {
    const data = await chFetch(`/officers/${officer_id}/appointments?items_per_page=50`, apiKey);
    if (data) {
      const appointments = (data.items || [])
        .filter(a => a.appointed_to?.company_number !== company_number)
        .map(a => ({
          company_number: a.appointed_to?.company_number || '',
          company_name: a.appointed_to?.company_name || '',
          company_status: a.appointed_to?.company_status || '',
          role: a.officer_role || '',
          appointed_on: a.appointed_on || '',
          resigned_on: a.resigned_on || '',
        }));
      return Response.json({ appointments, source: 'companies_house' });
    }
    return Response.json({ appointments: [], source: 'unavailable' });
  }

  return Response.json({ error: 'Unknown action' }, { status: 400 });
});