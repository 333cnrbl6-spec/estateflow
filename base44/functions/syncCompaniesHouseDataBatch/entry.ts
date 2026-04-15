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
    const timeout = 30000; // 30-second timeout per profile

    // Sync each profile with timeout protection
    for (const profile of profiles) {
      try {
        console.log(`[syncCompaniesHouseDataBatch] Syncing ${profile.company_number}...`);
        
        // Call the sync function with explicit timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        let result;
        try {
          result = await Promise.race([
            base44.asServiceRole.functions.invoke('syncCompaniesHouseData', {
              company_number: profile.company_number,
              company_name: profile.company_name
            }),
            new Promise((_, reject) => 
              setTimeout(() => reject(new Error(`Sync timeout after ${timeout}ms`)), timeout)
            )
          ]);
        } finally {
          clearTimeout(timeoutId);
        }

        if (result?.data?.status === 'synced') {
          synced++;
        } else {
          errors++;
        }
      } catch (err) {
        console.error(`[syncCompaniesHouseDataBatch] Error syncing ${profile.company_number}:`, err.message);
        errors++;
        // Continue to next profile instead of failing entire batch
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