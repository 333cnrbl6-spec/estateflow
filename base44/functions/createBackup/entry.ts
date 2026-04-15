/**
 * createBackup — Create a snapshot of specified entities
 * Used for manual backups or pre-bulk-operation safety
 */

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';
import { z } from 'npm:zod@3.24.2';

const CreateBackupSchema = z.object({
  backup_name: z.string().min(1, 'Backup name required'),
  entities_to_backup: z.array(z.string()).min(1, 'At least one entity required'),
  backup_type: z.enum(['manual', 'scheduled', 'pre_bulk_import']).default('manual'),
  notes: z.string().optional(),
});

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let body;
    try {
      body = await req.json();
    } catch {
      return Response.json({ error: 'Invalid JSON' }, { status: 400 });
    }

    const validation = CreateBackupSchema.safeParse(body);
    if (!validation.success) {
      const errors = validation.error.errors.map(e => `${e.path.join('.')}: ${e.message}`);
      return Response.json({ error: 'Validation failed', details: errors }, { status: 400 });
    }

    const { backup_name, entities_to_backup, backup_type, notes } = validation.data;

    // Create backup record first to mark as 'creating'
    const backupRecord = await base44.asServiceRole.entities.Backup.create({
      backup_name,
      entities_included: entities_to_backup,
      backup_type,
      created_by: user.email,
      backup_timestamp: new Date().toISOString(),
      status: 'creating',
      notes,
      total_records: 0,
      backup_size_bytes: 0,
    });

    // Fetch all entities and store snapshot
    const snapshotData = {};
    let totalRecords = 0;

    for (const entityName of entities_to_backup) {
      try {
        const records = await base44.asServiceRole.entities[entityName].list();
        snapshotData[entityName] = records;
        totalRecords += records.length;
      } catch (err) {
        console.warn(`[Backup] Failed to snapshot ${entityName}:`, err);
        snapshotData[entityName] = [];
      }
    }

    // Calculate size
    const snapshotJson = JSON.stringify(snapshotData);
    const backupSizeBytes = new TextEncoder().encode(snapshotJson).length;

    // Update backup record with snapshot and size
    await base44.asServiceRole.entities.Backup.update(backupRecord.id, {
      snapshot_data: snapshotData,
      total_records: totalRecords,
      backup_size_bytes: backupSizeBytes,
      status: 'ready',
      is_verified: true,
    });

    // Log audit
    await base44.functions.invoke('auditLog', {
      entity_type: 'Backup',
      action: 'create',
      entity_id: backupRecord.id,
      function_name: 'createBackup',
      changes: `Created backup: ${backup_name} (${totalRecords} records, ${backupSizeBytes} bytes)`,
      timestamp: new Date().toISOString(),
    });

    return Response.json({
      success: true,
      backup_id: backupRecord.id,
      total_records: totalRecords,
      backup_size_bytes: backupSizeBytes,
      message: `Backup "${backup_name}" created successfully`,
    });
  } catch (error) {
    console.error('[Backup Creation Error]', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});