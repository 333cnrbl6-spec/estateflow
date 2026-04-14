import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

async function syncCompanyData(base44, company) {
  try {
    const company_number = company.company_number;
    if (!company_number) {
      console.log('[autoSyncCompanyCompliance] No company number, skipping CH sync');
      return null;
    }

    console.log(`[autoSyncCompanyCompliance] Syncing ${company.name} (${company_number})`);

    // Fetch company details from CH
    const chRes = await base44.functions.invoke('companiesHouseSearch', {
      action: 'get_company_details',
      company_number
    });

    if (!chRes || !chRes.company) {
      console.warn('[autoSyncCompanyCompliance] No CH data found');
      return null;
    }

    const chData = chRes.company;

    // Fetch officers
    const officersRes = await base44.functions.invoke('companiesHouseSearch', {
      action: 'get_officers',
      company_number
    });

    // Fetch PSC
    const pscRes = await base44.functions.invoke('companiesHouseSearch', {
      action: 'get_psc',
      company_number
    });

    // Create CompaniesHouseProfile with auto-generated alerts
    const profile = await base44.asServiceRole.entities.CompaniesHouseProfile.create({
      company_number,
      company_name: chData.company_name,
      company_status: chData.company_status,
      company_type: chData.company_type,
      incorporation_date: chData.date_of_creation,
      registered_address: chData.registered_office_address ? 
        `${chData.registered_office_address.address_line_1}, ${chData.registered_office_address.postal_code}` : '',
      directors: officersRes?.officers || [],
      persons_with_significant_control: pscRes?.psc || [],
      accounts_filing_due: chData.accounts_overdue ? new Date().toISOString().split('T')[0] : null,
      accounts_filing_overdue: chData.accounts_overdue || false,
      confirmation_statement_due: chData.confirmation_statement_overdue ? new Date().toISOString().split('T')[0] : null,
      last_synced: new Date().toISOString(),
      critical_alerts: generateAlerts(chData, officersRes?.officers || [])
    });

    console.log(`[autoSyncCompanyCompliance] Profile created: ${profile.id}`);
    return profile;
  } catch (err) {
    console.error('[autoSyncCompanyCompliance] Sync failed:', err.message);
    return null;
  }
}

function generateAlerts(chData, officers) {
  const alerts = [];

  if (chData.accounts_overdue) {
    alerts.push({
      alert_id: `accounts_${Date.now()}`,
      type: 'accounts_overdue',
      severity: 'critical',
      message: 'Annual accounts filing is overdue',
      generated_date: new Date().toISOString(),
      status: 'active'
    });
  }

  if (chData.company_status === 'dissolved') {
    alerts.push({
      alert_id: `status_${Date.now()}`,
      type: 'status_change',
      severity: 'high',
      message: 'Company is dissolved',
      generated_date: new Date().toISOString(),
      status: 'active'
    });
  }

  return alerts;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    const { company_id, company_number, company_name } = body;

    if (!company_number) {
      return Response.json({ 
        error: 'company_number required',
        status: 'skipped'
      }, { status: 400 });
    }

    // Perform sync
    const profile = await syncCompanyData(base44, { 
      company_number, 
      name: company_name 
    });

    return Response.json({
      status: 'synced',
      profile_id: profile?.id,
      alerts: profile?.critical_alerts?.length || 0
    });
  } catch (error) {
    console.error('[autoSyncCompanyCompliance] Error:', error.message);
    return Response.json({ 
      error: error.message,
      status: 'failed'
    }, { status: 500 });
  }
});