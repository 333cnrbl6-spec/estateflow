import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Get current active pages/features
    const [properties, companies, tenants, units] = await Promise.all([
      base44.asServiceRole.entities.Property.list('-created_date', 1),
      base44.asServiceRole.entities.Company.list('-created_date', 1),
      base44.asServiceRole.entities.Tenant.list('-created_date', 1),
      base44.asServiceRole.entities.Unit.list('-created_date', 1),
    ]);

    const hasData = properties.length > 0 && companies.length > 0 && tenants.length > 0 && units.length > 0;

    // Core features
    const features = [
      { name: 'Property Management', description: 'Manage properties, units, and tenant allocations', active: true },
      { name: 'Tenant Portal', description: 'Self-service tenant access to documents and maintenance requests', active: true },
      { name: 'Maintenance Tracking', description: 'Order, assign, and track maintenance across portfolio', active: true },
      { name: 'Financial Reporting', description: 'Automated rental income, expense, and profit tracking', active: true },
      { name: 'Compliance Hub', description: 'Safety certificates, audit logs, and compliance checklists', active: true },
      { name: 'Bank Reconciliation', description: 'AI-powered matching of bank transactions to invoices', active: true },
      { name: 'Document Management', description: 'Upload, store, and share documents securely', active: true },
      { name: 'Communication Hub', description: 'Tenant-admin messaging with notification trail', active: true },
      { name: 'Reporting Dashboard', description: 'Monthly/quarterly AI-powered portfolio analytics', active: true },
      { name: 'Service Charge Management', description: 'Calculate and distribute service charges to leaseholders', active: true },
      { name: 'RTM Management', description: 'Right to Manage company workflows and documentation', active: true },
      { name: 'Building Safety', description: 'HRRB compliance, fire safety, and structural defect registers', active: true },
      { name: 'Out-of-Hours Service', description: 'Emergency call handling and contractor dispatch', active: true },
      { name: 'Block Management', description: 'Dedicated tools for managing multi-unit blocks', active: true },
    ];

    // Generate brochure content
    const brochureContent = generateBrochureHTML(features, hasData);

    // Update or create sales brochure record
    const existing = await base44.asServiceRole.entities.FinancialReport.filter({ notes: 'sales-materials-master' });

    if (existing.length > 0) {
      await base44.asServiceRole.entities.FinancialReport.update(existing[0].id, {
        notes: 'sales-materials-master',
        description: `Last updated: ${new Date().toISOString()}`,
        report_data: JSON.stringify({
          features,
          feature_count: features.length,
          has_sample_data: hasData,
          last_updated: new Date().toISOString(),
        }),
      });
    } else {
      await base44.asServiceRole.entities.FinancialReport.create({
        title: 'Sales Materials Master',
        notes: 'sales-materials-master',
        description: `Last updated: ${new Date().toISOString()}`,
        report_data: JSON.stringify({
          features,
          feature_count: features.length,
          has_sample_data: hasData,
          last_updated: new Date().toISOString(),
        }),
      });
    }

    return Response.json({
      success: true,
      updated_at: new Date().toISOString(),
      features_count: features.length,
      has_sample_data: hasData,
      message: 'Sales materials updated successfully',
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});

function generateBrochureHTML(features, hasData) {
  return `
    <!DOCTYPE html>
    <html>
    <head><title>Premiso - Property Management Platform</title></head>
    <body>
      <h1>Premiso Platform Overview</h1>
      <p>Updated: ${new Date().toLocaleDateString()}</p>
      <h2>Available Features (${features.length})</h2>
      <ul>
        ${features.map(f => `<li><strong>${f.name}</strong> - ${f.description}</li>`).join('\n')}
      </ul>
      <p>${hasData ? '✓ Sample data available' : '⚠ No sample data yet'}</p>
    </body>
    </html>
  `;
}