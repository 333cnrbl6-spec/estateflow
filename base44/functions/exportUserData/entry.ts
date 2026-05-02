import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch all user data
    const [properties, tenants, units, maintenance, transactions, certificates] = await Promise.all([
      base44.entities.Property.list('-updated_date', 1000),
      base44.entities.Tenant.list('-updated_date', 1000),
      base44.entities.Unit.list('-updated_date', 1000),
      base44.entities.MaintenanceOrder?.list?.('-updated_date', 1000).catch(() => []) || [],
      base44.entities.FinancialTransaction?.list?.('-updated_date', 1000).catch(() => []) || [],
      base44.entities.GasSafetyCertificate?.list?.('-updated_date', 100).catch(() => []) || []
    ]);

    const exportData = {
      exportDate: new Date().toISOString(),
      user: user,
      properties: properties,
      tenants: tenants,
      units: units,
      maintenance: maintenance,
      transactions: transactions,
      certificates: certificates
    };

    // Generate CSV/JSON
    const jsonString = JSON.stringify(exportData, null, 2);
    const filename = `premiso-export-${user.email}-${Date.now()}.json`;

    return new Response(jsonString, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename=${filename}`
      }
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});