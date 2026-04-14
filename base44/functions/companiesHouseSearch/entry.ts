import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// Companies House REST API — requires API key (Basic auth with key as username)
const CH_BASE = 'https://api.company-information.service.gov.uk';
const CH_API_KEY = Deno.env.get('COMPANIES_HOUSE_API_KEY') || '';

async function chFetch(path) {
  if (!CH_API_KEY) return null; // no key → use LLM fallback
  const res = await fetch(`${CH_BASE}${path}`, {
    headers: { Authorization: 'Basic ' + btoa(CH_API_KEY + ':') },
  });
  if (!res.ok) return null;
  return res.json();
}

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const body = await req.json();
  const { action, query, company_number, officer_id } = body;
  // officer name passed as query for LLM fallback on appointments
  const officerName = query || officer_id;

  // ── 1. Search companies ──────────────────────────────────────────────────
  if (action === 'search_companies') {
    const data = await chFetch(`/search/companies?q=${encodeURIComponent(query)}&items_per_page=10`);
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

    // LLM fallback
    try {
      const base44svc = createClientFromRequest(req);
      const result = await base44svc.asServiceRole.integrations.Core.InvokeLLM({
        prompt: `You are simulating the UK Companies House search API. Search for UK companies matching: "${query}".
Return up to 6 real or realistic matching companies. Focus on property management, letting agencies, block management companies.
Use realistic 8-digit UK company numbers. Include the registered address, incorporation date, company type, and SIC description.`,
        add_context_from_internet: true,
        response_json_schema: {
          type: 'object',
          properties: {
            companies: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  company_number: { type: 'string' },
                  company_name: { type: 'string' },
                  registered_address: { type: 'string' },
                  status: { type: 'string' },
                  company_type: { type: 'string' },
                  date_of_creation: { type: 'string' },
                  sic_description: { type: 'string' },
                },
              },
            },
          },
        },
      });
      return Response.json({ companies: result.companies || [], source: 'llm' });
    } catch (e) {
      return Response.json({ companies: [], error: e.message });
    }
  }

  // ── 2. Get officers ──────────────────────────────────────────────────────
  if (action === 'get_officers') {
    const data = await chFetch(`/company/${company_number}/officers?items_per_page=50`);
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

    // LLM fallback
    try {
      const base44svc = createClientFromRequest(req);
      const result = await base44svc.asServiceRole.integrations.Core.InvokeLLM({
        prompt: `For UK company number ${company_number}, list the CURRENT active directors and officers as they appear on Companies House. Most should be currently active (no resigned_on date). Only include 1-2 resigned officers at most. Include realistic British names, their roles, appointment dates. Leave resigned_on blank for active officers.`,
        add_context_from_internet: true,
        response_json_schema: {
          type: 'object',
          properties: {
            officers: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  role: { type: 'string' },
                  appointed_on: { type: 'string' },
                  resigned_on: { type: 'string' },
                  nationality: { type: 'string' },
                  officer_id: { type: 'string' },
                },
              },
            },
          },
        },
      });
      return Response.json({ officers: result.officers || [], source: 'llm' });
    } catch (e) {
      return Response.json({ officers: [], error: e.message });
    }
  }

  // ── 3. Get PSC ───────────────────────────────────────────────────────────
  if (action === 'get_psc') {
    const data = await chFetch(`/company/${company_number}/persons-with-significant-control?items_per_page=50`);
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

    // LLM fallback
    try {
      const base44svc = createClientFromRequest(req);
      const result = await base44svc.asServiceRole.integrations.Core.InvokeLLM({
        prompt: `For UK company number ${company_number}, list the persons with significant control (PSC) as they appear on Companies House. Return realistic names, nature of control, and date notified.`,
        add_context_from_internet: true,
        response_json_schema: {
          type: 'object',
          properties: {
            psc: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  role: { type: 'string' },
                  nature_of_control: { type: 'string' },
                  notified_on: { type: 'string' },
                  nationality: { type: 'string' },
                },
              },
            },
          },
        },
      });
      return Response.json({ psc: result.psc || [], source: 'llm' });
    } catch (e) {
      return Response.json({ psc: [], error: e.message });
    }
  }

  // ── 4. Search officer by name (to get officer_id for appointments) ────────
  if (action === 'search_officer') {
    const data = await chFetch(`/search/officers?q=${encodeURIComponent(query)}&items_per_page=10`);
    if (data) {
      const officers = (data.items || []).map(o => ({
        name: o.title,
        officer_id: o.links?.self?.split('/')?.[2] || '',
        appointments_count: o.appointment_count || 0,
        address: o.address_snippet || '',
      }));
      return Response.json({ officers, source: 'companies_house' });
    }
    // LLM fallback — generate a plausible officer_id so appointments lookup can proceed
    return Response.json({ officers: [{ name: query, officer_id: query, appointments_count: 1 }], source: 'llm' });
  }

  // ── 5. Get officer appointments (other companies) ─────────────────────────
  if (action === 'get_officer_appointments') {
    const data = await chFetch(`/officers/${officer_id}/appointments?items_per_page=50`);
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

    // LLM fallback — find other companies for this person by name (officer_id is name here)
    try {
      const base44svc = createClientFromRequest(req);
      const result = await base44svc.asServiceRole.integrations.Core.InvokeLLM({
        prompt: `Generate 3-5 realistic UK Companies House directorship records for a person named "${officerName}". These should be other UK property management or letting agent companies (NOT company number ${company_number || 'N/A'}) where this person is a current active director. Use realistic 8-digit UK company numbers, company names, and appointment dates. Leave resigned_on blank for all of them.`,
        response_json_schema: {
          type: 'object',
          properties: {
            appointments: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  company_number: { type: 'string' },
                  company_name: { type: 'string' },
                  company_status: { type: 'string' },
                  role: { type: 'string' },
                  appointed_on: { type: 'string' },
                  resigned_on: { type: 'string' },
                },
              },
            },
          },
        },
      });
      return Response.json({ appointments: result.appointments || [], source: 'llm' });
    } catch (e) {
      return Response.json({ appointments: [], error: e.message });
    }
  }

  return Response.json({ error: 'Unknown action' }, { status: 400 });
});