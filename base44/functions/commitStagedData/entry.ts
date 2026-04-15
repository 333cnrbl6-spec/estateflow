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
      status: 'approved',
    });
    const recordsToCommit = approvedRecords.filter(r => approved_ids.includes(r.id));

    const committed = { properties: 0, units: 0, tenants: 0, transactions: 0, other: 0 };
    const failures = [];

    // CRITICAL: Validate foreign keys BEFORE committing any record
    // Group by entity type and validate dependencies first
    const propertiesBySession = new Map();
    const unitsBySession = new Map();

    for (const stagingRecord of recordsToCommit) {
      const { entity_type, staged_data } = stagingRecord;

      // Pre-validate all dependencies before creating anything
      if (entity_type === 'property') {
        if (!staged_data.owning_company) throw new Error('Property missing owning_company');
      } else if (entity_type === 'unit') {
        if (!staged_data.property_id) throw new Error('Unit missing property_id');
        const prop = await base44.entities.Property.get(staged_data.property_id).catch(() => null);
        if (!prop) throw new Error(`Unit references missing property ${staged_data.property_id}`);
      } else if (entity_type === 'tenant') {
        if (staged_data.unit_id) {
          const unit = await base44.entities.Unit.get(staged_data.unit_id).catch(() => null);
          if (!unit) throw new Error(`Tenant references missing unit ${staged_data.unit_id}`);
        }
      }
    }

    // Now commit with rollback capability
    const committedIds = [];
    for (const stagingRecord of recordsToCommit) {
      try {
        const { entity_type, staged_data, company_id } = stagingRecord;
        let createdId = null;

        if (entity_type === 'property') {
          const result = await base44.entities.Property.create({ ...staged_data, owning_company: company_id });
          createdId = result.id;
          committedIds.push({ id: createdId, type: 'property' });
          committed.properties++;
        } else if (entity_type === 'unit') {
          const result = await base44.entities.Unit.create(staged_data);
          createdId = result.id;
          committedIds.push({ id: createdId, type: 'unit' });
          committed.units++;
        } else if (entity_type === 'tenant') {
          const result = await base44.entities.Tenant.create(staged_data);
          createdId = result.id;
          committedIds.push({ id: createdId, type: 'tenant' });
          committed.tenants++;
        } else if (entity_type === 'financial_transaction') {
          const result = await base44.entities.FinancialTransaction.create(staged_data);
          createdId = result.id;
          committedIds.push({ id: createdId, type: 'transaction' });
          committed.transactions++;
        } else if (entity_type === 'nominal') {
          const result = await base44.entities.Nominal.create({ ...staged_data, company_id });
          createdId = result.id;
          committedIds.push({ id: createdId, type: 'nominal' });
          committed.other++;
        }

        // Update staging record with committed status
        await base44.entities.DataImportStaging.update(stagingRecord.id, {
          status: 'committed',
          committed_entity_id: createdId,
          commit_notes: `Committed to production at ${new Date().toISOString()}`,
        });
      } catch (err) {
        // CRITICAL: If ANY commit fails, log it and abort remaining commits
        console.error(`[CommitStagedData] Commit failed for ${stagingRecord.entity_type}:`, err.message);
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

        // Stop processing remaining records if we hit critical errors
        break;
      }
    }

    return Response.json({
      success: failures.length === 0,
      message: `Committed ${recordsToCommit.length - failures.length} of ${recordsToCommit.length} records`,
      committed,
      failures,
      stats: {
        total_requested: approved_ids.length,
        total_found: approvedRecords.length,
        total_processed: recordsToCommit.length,
        successfully_committed: recordsToCommit.length - failures.length,
        failed: failures.length,
      },
    });
  } catch (error) {
    console.error('Commit error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});