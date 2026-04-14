import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// Companies House public API — no key required for these endpoints
const CH_BASE = 'https://api.company-information.service.gov.uk';
const CH_API_KEY = Deno.env.get('COMPANIES_HOUSE_API_KEY') || '';
console.log('CH_API_KEY loaded:', CH_API_KEY ? `yes, length=${CH_API_KEY.length}, starts=${CH_API_KEY.slice(0,4)}` : 'MISSING');

function chFetch(path) {
  // Companies House: API key as username, empty password
  const credentials = `${CH_API_KEY}:`;
  const encoded = btoa(unescape(encodeURIComponent(credentials)));
  const headers = {
    'Authorization': `Basic ${encoded}`,
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  };
  console.log('CH request:', `${CH_BASE}${path}`, 'key prefix:', CH_API_KEY?.slice(0, 8));
  return fetch(`${CH_BASE}${path}`, { headers });
}

Deno.serve(async (req) => {
  try {
    const createClientFromRequest_unused = createClientFromRequest; // keep import
    const { action, query, company_number, officer_id } = await req.json();

    // ── 1. Search companies by name ───────────────────────────────────────
    if (action === 'search_companies') {
      const res = await chFetch(`/search/companies?q=${encodeURIComponent(query)}&items_per_page=10`);
      if (!res.ok) {
        const errText = await res.text();
        console.error('CH API error', res.status, errText);
        return Response.json({ companies: [], error: `Companies House error: ${res.status} ${errText}`, fallback: true });
      }
      const data = await res.json();
      const companies = (data.items || []).map(c => ({
        company_number: c.company_number,
        company_name: c.title,
        registered_address: c.address_snippet || '',
        status: c.company_status || 'active',
        company_type: c.company_type || '',
        date_of_creation: c.date_of_creation || '',
        sic_codes: c.sic_codes || [],
      }));
      return Response.json({ companies });
    }

    // ── 2. Get company profile ────────────────────────────────────────────
    if (action === 'get_company') {
      const res = await chFetch(`/company/${company_number}`);
      if (!res.ok) return Response.json({ error: 'Not found' }, { status: 404 });
      const c = await res.json();
      return Response.json({
        company_number: c.company_number,
        company_name: c.company_name,
        registered_address: [
          c.registered_office_address?.address_line_1,
          c.registered_office_address?.address_line_2,
          c.registered_office_address?.locality,
          c.registered_office_address?.postal_code,
        ].filter(Boolean).join(', '),
        status: c.company_status,
        company_type: c.type,
        date_of_creation: c.date_of_creation,
        sic_codes: c.sic_codes || [],
      });
    }

    // ── 3. Get officers for a company ─────────────────────────────────────
    if (action === 'get_officers') {
      const res = await chFetch(`/company/${company_number}/officers?items_per_page=50`);
      if (!res.ok) return Response.json({ officers: [] });
      const data = await res.json();
      const officers = (data.items || []).map(o => ({
        name: o.name,
        role: o.officer_role,
        appointed_on: o.appointed_on || '',
        resigned_on: o.resigned_on || '',
        nationality: o.nationality || '',
        country_of_residence: o.country_of_residence || '',
        officer_id: o.links?.officer?.appointments?.split('/')?.[2] || '',
      }));
      return Response.json({ officers });
    }

    // ── 4. Get PSC (persons with significant control) ─────────────────────
    if (action === 'get_psc') {
      const res = await chFetch(`/company/${company_number}/persons-with-significant-control?items_per_page=50`);
      if (!res.ok) return Response.json({ psc: [] });
      const data = await res.json();
      const psc = (data.items || []).map(p => ({
        name: p.name,
        role: 'Person with Significant Control',
        nature_of_control: (p.natures_of_control || []).join(', '),
        notified_on: p.notified_on || '',
        nationality: p.nationality || '',
        country_of_residence: p.country_of_residence || '',
      }));
      return Response.json({ psc });
    }

    // ── 5. Get appointments (other companies) for an officer ──────────────
    if (action === 'get_officer_appointments') {
      // officer_id is the officer appointments path segment
      const res = await chFetch(`/officers/${officer_id}/appointments?items_per_page=50`);
      if (!res.ok) return Response.json({ appointments: [] });
      const data = await res.json();
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
      return Response.json({ appointments });
    }

    // ── 6. Search officers by name (to find their officer_id) ────────────
    if (action === 'search_officer') {
      const res = await chFetch(`/search/officers?q=${encodeURIComponent(query)}&items_per_page=10`);
      if (!res.ok) return Response.json({ officers: [] });
      const data = await res.json();
      const officers = (data.items || []).map(o => ({
        name: o.title,
        officer_id: o.links?.self?.split('/')?.[2] || '',
        appointments_count: o.appointment_count || 0,
        date_of_birth: o.date_of_birth ? `${o.date_of_birth.month}/${o.date_of_birth.year}` : '',
        address: o.address_snippet || '',
      }));
      return Response.json({ officers });
    }

    return Response.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});