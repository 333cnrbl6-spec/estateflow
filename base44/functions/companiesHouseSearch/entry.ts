import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const CH_BASE = 'https://api.company-information.service.gov.uk';

// Fetch with exponential backoff retry
async function chFetch(path, apiKey, retries = 3) {
  if (!apiKey) {
    console.error('[chFetch] No API key provided');
    return null;
  }
  const auth = btoa(`${apiKey}:`);
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
        console.error(`[chFetch] API returned ${res.status} for ${path}`);
        return null;
      }
      return await res.json();
    } catch (err) {
      if (attempt === retries) {
        console.error(`[chFetch] All ${retries} attempts failed for ${path}: ${err.message}`);
        return null;
      }
      const wait = attempt * 1500;
      console.warn(`[chFetch] Attempt ${attempt} failed, retrying in ${wait}ms: ${err.message}`);
      await new Promise(r => setTimeout(r, wait));
    }
  }
  return null;
}

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const body = await req.json();
  const { action, query, company_number, officer_id } = body;

  const apiKey = Deno.env.get('COMPANIES_HOUSE_API_KEY');
  if (!apiKey) {
    return Response.json({
      error: 'Companies House API key not configured',
      source: 'unavailable',
      companies: [], officers: [], psc: [], appointments: []
    }, { status: 500 });
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