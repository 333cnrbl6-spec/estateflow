import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    // This is an automated task — no user context required
    // but we'll fetch using service role
    
    console.log('[syncCompaniesHouseDataBatch] Starting batch sync...');

    // Get all Companies House profiles
    const profiles = await base44.asServiceRole.entities.CompaniesHouseProfile.list('-updated_date', 1000);
    
    if (!profiles || profiles.length === 0) {
      console.log('[syncCompaniesHouseDataBatch] No profiles to sync');
      return Response.json({ 
        synced: 0,
        status: 'no_profiles'
      });
    }

    let synced = 0;
    let errors = 0;

    // Sync each profile
    for (const profile of profiles) {
      try {
        console.log(`[syncCompaniesHouseDataBatch] Syncing ${profile.company_number}...`);
        
        // Call the sync function for each company
        const result = await base44.asServiceRole.functions.invoke('syncCompaniesHouseData', {
          company_number: profile.company_number,
          company_name: profile.company_name
        });

        if (result.status === 'synced') {
          synced++;
        } else {
          errors++;
        }
      } catch (err) {
        console.error(`[syncCompaniesHouseDataBatch] Error syncing ${profile.company_number}:`, err.message);
        errors++;
      }
    }

    console.log(`[syncCompaniesHouseDataBatch] Completed: ${synced} synced, ${errors} errors`);
    
    return Response.json({
      synced,
      errors,
      total: profiles.length,
      status: 'completed'
    });
  } catch (error) {
    console.error('[syncCompaniesHouseDataBatch] Fatal error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});