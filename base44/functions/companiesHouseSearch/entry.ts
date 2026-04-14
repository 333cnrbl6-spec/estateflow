import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// Companies House REST API — requires API key (Basic auth with key as username)
const CH_BASE = 'https://api.company-information.service.gov.uk';

async function chFetch(path, apiKey) {
  if (!apiKey) return null; // no key → return error
  const res = await fetch(`${CH_BASE}${path}`, {
    headers: { Authorization: 'Basic ' + btoa(apiKey + ':') },
  });
  if (!res.ok) return null;
  return res.json();
}

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const body = await req.json();
  const { action, query, company_number, officer_id } = body;
  const officerName = query || officer_id;
  
  // Get API key from environment
  const apiKey = Deno.env.get('COMPANIES_HOUSE_API_KEY');
  if (!apiKey) {
    return Response.json({ 
      error: 'Companies House API key not configured', 
      source: 'unavailable',
      companies: [],
      officers: [],
      psc: [],
      appointments: []
    }, { status: 500 });
  }

  // ── 1. Search companies ──────────────────────────────────────────────────
  if (action === 'search_companies') {
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

    // API request failed — do not fabricate companies
    return Response.json({ companies: [], error: 'Companies House API request failed. Try again.', source: 'unavailable' });
  }

  // ── 2. Get officers ──────────────────────────────────────────────────────
  if (action === 'get_officers') {
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

    // API unavailable — return empty, do not fabricate real people
    return Response.json({ officers: [], error: 'Officers could not be retrieved.', source: 'unavailable' });
  }

  // ── 3. Get PSC ───────────────────────────────────────────────────────────
  if (action === 'get_psc') {
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

    // API unavailable — return empty, do not fabricate real people
    return Response.json({ psc: [], source: 'unavailable' });
  }

  // ── 4. Search officer by name (to get officer_id for appointments) ────────
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

  // ── 5. Get officer appointments (other companies) ─────────────────────────
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