import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Get all CompaniesHouseProfile records
    const profiles = await base44.asServiceRole.entities.CompaniesHouseProfile.list('', 100);
    
    if (!profiles.length) {
      return Response.json({ synced: 0, message: 'No profiles to sync' });
    }

    let synced = 0;
    const errors = [];

    for (const profile of profiles) {
      try {
        // Call the existing companiesHouseSearch function to fetch fresh data
        const freshData = await base44.asServiceRole.functions.invoke('companiesHouseSearch', {
          action: 'get_company',
          company_number: profile.company_number
        });

        if (freshData && freshData.company) {
          // Update the profile with fresh data
          await base44.asServiceRole.entities.CompaniesHouseProfile.update(profile.id, {
            company_status: freshData.company.company_status,
            status_changed_date: freshData.company.date_of_creation,
            last_synced: new Date().toISOString(),
            sync_error: null
          });
          synced++;
        }
      } catch (err) {
        errors.push({ company_number: profile.company_number, error: err.message });
        await base44.asServiceRole.entities.CompaniesHouseProfile.update(profile.id, {
          sync_error: err.message,
          last_synced: new Date().toISOString()
        });
      }
    }

    return Response.json({ 
      synced, 
      total: profiles.length,
      errors,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});