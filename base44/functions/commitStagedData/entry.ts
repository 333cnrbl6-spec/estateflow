import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = await req.json();
    const { import_session_id, approved_ids } = payload;

    if (!approved_ids || approved_ids.length === 0) {
      return Response.json({ error: 'No records to commit' }, { status: 400 });
    }

    // Get approved staging records
    const approvedRecords = await base44.entities.DataImportStaging.filter({
      import_session_id,
      id: { $in: approved_ids },
      status: 'approved',
    });

    const committed = { properties: 0, units: 0, tenants: 0, transactions: 0, other: 0 };
    const failures = [];

    // Commit each record by entity type
    for (const stagingRecord of approvedRecords) {
      try {
        const { entity_type, staged_data, company_id } = stagingRecord;
        let createdId = null;

        if (entity_type === 'property') {
          const result = await base44.entities.Property.create({ ...staged_data, owning_company: company_id });
          createdId = result.id;
          committed.properties++;
        } else if (entity_type === 'unit') {
          const result = await base44.entities.Unit.create(staged_data);
          createdId = result.id;
          committed.units++;
        } else if (entity_type === 'tenant') {
          const result = await base44.entities.Tenant.create(staged_data);
          createdId = result.id;
          committed.tenants++;
        } else if (entity_type === 'financial_transaction') {
          const result = await base44.entities.FinancialTransaction.create(staged_data);
          createdId = result.id;
          committed.transactions++;
        } else if (entity_type === 'nominal') {
          const result = await base44.entities.Nominal.create({ ...staged_data, company_id });
          createdId = result.id;
          committed.other++;
        } else {
          committed.other++;
        }

        // Update staging record with committed status
        await base44.entities.DataImportStaging.update(stagingRecord.id, {
          status: 'committed',
          committed_entity_id: createdId,
          commit_notes: `Committed to production at ${new Date().toISOString()}`,
        });
      } catch (err) {
        failures.push({
          staging_id: stagingRecord.id,
          entity_type: stagingRecord.entity_type,
          error: err.message,
        });

        // Mark as failed
        await base44.entities.DataImportStaging.update(stagingRecord.id, {
          status: 'failed',
          commit_notes: `Commit failed: ${err.message}`,
        });
      }
    }

    return Response.json({
      success: failures.length === 0,
      message: `Committed ${approvedRecords.length - failures.length} records`,
      committed,
      failures,
      stats: {
        total_approved: approvedRecords.length,
        successfully_committed: approvedRecords.length - failures.length,
        failed: failures.length,
      },
    });
  } catch (error) {
    console.error('Commit error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});