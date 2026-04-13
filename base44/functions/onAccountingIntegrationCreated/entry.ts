import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = await req.json();
    const event = payload.event || {};
    const data = payload.data || {};

    // Only trigger on create or update of AccountingIntegration with status "connected"
    if (event.type !== 'create' && event.type !== 'update') {
      return Response.json({ success: true, skipped: true });
    }

    if (data.connection_status !== 'connected') {
      return Response.json({ success: true, skipped: 'Status not connected' });
    }

    const { company_id, package_type, access_token, refresh_token, tenant_id } = data;
    const integrationId = event.entity_id;

    console.log(`Syncing Chart of Accounts for ${package_type} (${company_id})`);

    // Call the sync function
    try {
      const syncResult = await base44.functions.invoke('syncNominalFromAccounting', {
        company_id,
        accounting_package: package_type,
        xero_connection: package_type === 'xero' ? { accessToken: access_token, tenantId: tenant_id } : null,
        sage_connection: package_type === 'sage' ? { accessToken: access_token } : null,
        quickbooks_connection: package_type === 'quickbooks' ? { accessToken: access_token, realmId: tenant_id } : null,
      });

      console.log(`Sync result:`, syncResult);

      // Update the AccountingIntegration record with sync details
      if (syncResult && syncResult.data) {
        await base44.entities.AccountingIntegration.update(integrationId, {
          last_synced: new Date().toISOString(),
          last_sync_error: null,
          nominal_records_created: syncResult.data.accounts_synced || 0,
        });
      }

      return Response.json({
        success: true,
        message: `Synced Chart of Accounts from ${package_type}`,
        sync_result: syncResult,
      });
    } catch (syncErr) {
      console.error(`Sync failed:`, syncErr);

      // Update integration with error status
      await base44.entities.AccountingIntegration.update(integrationId, {
        connection_status: 'error',
        last_sync_error: syncErr.message || 'Unknown sync error',
      });

      return Response.json({
        success: false,
        error: `Sync failed: ${syncErr.message}`,
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Handler error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});