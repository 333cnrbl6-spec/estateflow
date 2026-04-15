import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const CH_BASE = 'https://api.company-information.service.gov.uk';

async function chFetch(path, apiKey, retries = 3) {
  if (!apiKey) return null;
  const auth = btoa(`${apiKey}:`);
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const res = await fetch(`${CH_BASE}${path}`, {
        headers: {
          'Authorization': `Basic ${auth}`,
          'User-Agent': 'Premiso/1.0'
        },
        signal: AbortSignal.timeout(10000),
      });
      if (res.status === 429) {
        const wait = attempt * 2000;
        console.warn(`[chFetch] Rate limited, waiting ${wait}ms (attempt ${attempt}/${retries})`);
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
        console.error(`[chFetch] All ${retries} attempts failed: ${err.message}`);
        return null;
      }
      await new Promise(r => setTimeout(r, attempt * 1500));
    }
  }
  return null;
}

function calculateDeadlines(companyData) {
  const deadlines = {};
  
  if (companyData.confirmation_statement_next_due_date) {
    deadlines.confirmation_statement_due = companyData.confirmation_statement_next_due_date;
  }
  
  if (companyData.accounts_next_due_date) {
    deadlines.accounts_filing_due = companyData.accounts_next_due_date;
    // Check if overdue
    const dueDate = new Date(companyData.accounts_next_due_date);
    deadlines.accounts_filing_overdue = dueDate < new Date();
  }
  
  return deadlines;
}

function generateAlerts(oldProfile, newProfile) {
  const alerts = newProfile.critical_alerts || [];
  
  // Status change alert
  if (oldProfile && oldProfile.company_status !== newProfile.company_status) {
    if (['dissolved', 'liquidation', 'administration'].includes(newProfile.company_status)) {
      alerts.push({
        alert_id: `status_${Date.now()}`,
        type: 'status_change',
        severity: 'critical',
        message: `Company status changed to ${newProfile.company_status}`,
        generated_date: new Date().toISOString(),
        status: 'active'
      });
    }
  }
  
  // Accounts overdue
  if (newProfile.accounts_filing_overdue) {
    alerts.push({
      alert_id: `accounts_${Date.now()}`,
      type: 'accounts_overdue',
      severity: 'high',
      message: `Annual accounts filing overdue as of ${newProfile.accounts_filing_due}`,
      generated_date: new Date().toISOString(),
      status: 'active'
    });
  }
  
  // Confirmation statement due soon
  if (newProfile.confirmation_statement_due) {
    const dueDate = new Date(newProfile.confirmation_statement_due);
    const daysUntilDue = Math.ceil((dueDate - new Date()) / (1000 * 60 * 60 * 24));
    if (daysUntilDue > 0 && daysUntilDue <= 30) {
      alerts.push({
        alert_id: `confirm_${Date.now()}`,
        type: 'confirmation_statement_due',
        severity: daysUntilDue <= 7 ? 'high' : 'medium',
        message: `Confirmation statement due in ${daysUntilDue} days (${newProfile.confirmation_statement_due})`,
        generated_date: new Date().toISOString(),
        status: 'active'
      });
    }
  }
  
  // Director change alert
  if (oldProfile && oldProfile.directors) {
    const oldDirNames = new Set(oldProfile.directors.map(d => d.name));
    const newDirNames = new Set(newProfile.directors.map(d => d.name));
    
    const resigned = oldProfile.directors.filter(d => !newDirNames.has(d.name) && !d.resigned_on);
    const appointed = newProfile.directors.filter(d => !oldDirNames.has(d.name));
    
    if (resigned.length > 0 || appointed.length > 0) {
      alerts.push({
        alert_id: `directors_${Date.now()}`,
        type: 'director_change',
        severity: 'medium',
        message: `${appointed.length} director(s) appointed, ${resigned.length} resigned`,
        generated_date: new Date().toISOString(),
        status: 'active'
      });
    }
  }
  
  return alerts;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { company_number, company_name } = body;
    
    if (!company_number) {
      return Response.json({ error: 'company_number required' }, { status: 400 });
    }

    const apiKey = Deno.env.get('COMPANIES_HOUSE_API_KEY');
    if (!apiKey) {
      return Response.json({ error: 'API key not configured' }, { status: 500 });
    }

    console.log(`[syncCompaniesHouseData] Syncing ${company_number}...`);

    // Check cache first — if synced within last 12 hours, return cached data
    try {
      const cached = await base44.entities.CompaniesHouseProfile.filter({ company_number });
      if (cached.length > 0 && cached[0].last_synced) {
        const ageHours = (Date.now() - new Date(cached[0].last_synced).getTime()) / 3600000;
        if (ageHours < 12) {
          console.log(`[syncCompaniesHouseData] Cache hit for ${company_number} (${Math.round(ageHours)}h old), skipping live fetch`);
          return Response.json({ profile: cached[0], alerts: cached[0].critical_alerts || [], status: 'cached' });
        }
      }
    } catch (_) {}

    // Fetch company profile with retry
    const companyRes = await chFetch(`/company/${company_number}`, apiKey);
    if (!companyRes) {
      // Return stale cache if available rather than hard error
      try {
        const stale = await base44.entities.CompaniesHouseProfile.filter({ company_number });
        if (stale.length > 0) {
          console.warn(`[syncCompaniesHouseData] CH unavailable, returning stale cache for ${company_number}`);
          return Response.json({ profile: stale[0], alerts: stale[0].critical_alerts || [], status: 'stale_cache' });
        }
      } catch (_) {}
      return Response.json({ error: 'Companies House API temporarily unavailable. Please try again later.' }, { status: 503 });
    }

    // Fetch officers with validation
    const officersRes = await chFetch(`/company/${company_number}/officers?items_per_page=100`, apiKey);
    if (!officersRes) {
      console.warn(`[syncCompaniesHouseData] Officers fetch failed for ${company_number}`);
      return Response.json({ error: 'Failed to fetch officers data from Companies House' }, { status: 503 });
    }
    const officers = (Array.isArray(officersRes?.items) ? officersRes.items : []).map(o => ({
      name: o?.name || 'Unknown',
      role: o?.officer_role || '',
      appointed_on: o?.appointed_on || null,
      resigned_on: o?.resigned_on || null,
      nationality: o?.nationality || '',
      is_corporate: !!(o?.country_of_residence || (o?.occupation !== 'Judge' && o?.occupation))
    }));

    // Fetch PSC with validation
    const pscRes = await chFetch(`/company/${company_number}/persons-with-significant-control?items_per_page=100`, apiKey);
    const psc = (Array.isArray(pscRes?.items) ? pscRes.items : []).map(p => ({
      name: p?.name || 'Unknown',
      nature_of_control: (Array.isArray(p?.natures_of_control) ? p.natures_of_control : []).join(', '),
      notified_on: p?.notified_on || null
    }));

    // Fetch filing history with validation
    const filingRes = await chFetch(`/company/${company_number}/filing-history?items_per_page=15`, apiKey);
    const filings = (Array.isArray(filingRes?.items) ? filingRes.items : []).map(f => ({
      filing_id: f?.filing_id || '',
      date: f?.date || '',
      type: f?.type || '',
      description: f?.description || '',
      category: f?.category || '',
      action_date: f?.action_date || null,
      filing_date: f?.filing_date || null,
      pages: f?.pages || 0
    }));

    // Build profile
    const deadlines = calculateDeadlines(companyRes);
    const profileData = {
      company_number,
      company_name: company_name || companyRes.company_name,
      company_status: companyRes.company_status,
      status_changed_date: companyRes.has_been_liquidated ? new Date().toISOString() : null,
      company_type: companyRes.type,
      incorporation_date: companyRes.date_of_creation,
      registered_address: companyRes.registered_office_address
        ? `${companyRes.registered_office_address.address_line_1}, ${companyRes.registered_office_address.postal_code}`
        : '',
      registered_office_is_in_dispute: companyRes.registered_office_is_in_dispute || false,
      directors: officers,
      filing_history: filings,
      sic_codes: companyRes.sic_codes || [],
      has_active_mortgages: (companyRes.has_charges || false),
      mortgages_count: companyRes.charges_count || 0,
      persons_with_significant_control: psc,
      last_synced: new Date().toISOString(),
      next_sync_due: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      ...deadlines,
      critical_alerts: []
    };

    // Check for existing profile to compare
    let existingProfile = null;
    try {
      const existing = await base44.entities.CompaniesHouseProfile.filter({ company_number });
      if (existing.length > 0) {
        existingProfile = existing[0];
      }
    } catch (e) {
      console.log('[syncCompaniesHouseData] New profile');
    }

    // Generate alerts based on changes
    profileData.critical_alerts = generateAlerts(existingProfile, profileData);

    // Upsert profile
    let profile;
    if (existingProfile) {
      profile = await base44.entities.CompaniesHouseProfile.update(existingProfile.id, profileData);
    } else {
      profile = await base44.entities.CompaniesHouseProfile.create(profileData);
    }

    // Create ComplianceTask entries for alerts
    if (profileData.critical_alerts.length > 0) {
      for (const alert of profileData.critical_alerts) {
        // Map alert types to compliance task types
        const taskTypeMap = {
          'accounts_overdue': 'scheduled_renewal',
          'confirmation_statement_due': 'immediate_renewal',
          'director_change': 'pending',
          'status_change': 'urgent_renewal'
        };

        try {
          await base44.entities.ComplianceTask.create({
            certificate_type: 'other',
            certificate_id: profile.id,
            property_id: 'CH_' + company_number,
            expiry_date: new Date().toISOString(),
            days_until_expiry: alert.type === 'accounts_overdue' ? -1 : 14,
            priority: alert.severity === 'critical' ? 'overdue' : 'warning',
            status: 'pending',
            task_type: taskTypeMap[alert.type] || 'pending',
            notes: alert.message
          });
        } catch (e) {
          console.log('[syncCompaniesHouseData] ComplianceTask creation skipped:', e.message);
        }
      }
    }

    console.log(`[syncCompaniesHouseData] Synced ${company_number}: ${profileData.critical_alerts.length} alerts`);
    return Response.json({ 
      profile, 
      alerts: profileData.critical_alerts,
      status: 'synced'
    });
  } catch (error) {
    console.error('[syncCompaniesHouseData] Error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});