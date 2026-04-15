/**
 * restoreBackup — Restore entities from a backup snapshot
 * Admin-only operation with audit trail
 */

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';
import { z } from 'npm:zod@3.24.2';

const RestoreBackupSchema = z.object({
  backup_id: z.string().min(1, 'Backup ID required'),
  dry_run: z.boolean().default(false),
});

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Admin access required' }, { status: 403 });
    }

    let body;
    try {
      body = await req.json();
    } catch {
      return Response.json({ error: 'Invalid JSON' }, { status: 400 });
    }

    const validation = RestoreBackupSchema.safeParse(body);
    if (!validation.success) {
      const errors = validation.error.errors.map(e => `${e.path.join('.')}: ${e.message}`);
      return Response.json({ error: 'Validation failed', details: errors }, { status: 400 });
    }

    const { backup_id, dry_run } = validation.data;

    // Fetch backup
    const backup = await base44.asServiceRole.entities.Backup.read(backup_id);
    if (!backup) {
      return Response.json({ error: 'Backup not found' }, { status: 404 });
    }

    if (backup.status !== 'ready') {
      return Response.json({ error: 'Backup is not ready for restore' }, { status: 400 });
    }

    const restoreResults = {
      entities_restored: 0,
      total_records_restored: 0,
      entities: {},
      dry_run,
    };

    // If dry_run, just return what would be restored
    if (dry_run) {
      for (const entityName of backup.entities_included) {
        const records = backup.snapshot_data[entityName] || [];
        restoreResults.entities[entityName] = records.length;
        restoreResults.total_records_restored += records.length;
        restoreResults.entities_restored += 1;
      }

      return Response.json({
        success: true,
        message: 'Dry run: no data was restored',
        ...restoreResults,
      });
    }

    // Actual restore: for each entity, clear and rebuild
    for (const entityName of backup.entities_included) {
      const records = backup.snapshot_data[entityName] || [];
      
      try {
        // Fetch current records to delete
        const currentRecords = await base44.asServiceRole.entities[entityName].list();
        
        // Delete all current records
        for (const record of currentRecords) {
          try {
            await base44.asServiceRole.entities[entityName].delete(record.id);
          } catch (err) {
            console.warn(`[Restore] Failed to delete ${entityName}/${record.id}:`, err);
          }
        }

        // Re-insert backup records
        if (records.length > 0) {
          const recordsToCreate = records.map(r => {
            const { id, created_date, updated_date, created_by, ...data } = r;
            return data;
          });

          await base44.asServiceRole.entities[entityName].bulkCreate(recordsToCreate);
          restoreResults.entities[entityName] = records.length;
          restoreResults.total_records_restored += records.length;
        }

        restoreResults.entities_restored += 1;
      } catch (err) {
        console.error(`[Restore] Failed to restore ${entityName}:`, err);
        restoreResults.entities[entityName] = 0;
      }
    }

    // Update backup restore timestamp
    await base44.asServiceRole.entities.Backup.update(backup_id, {
      last_restored: new Date().toISOString(),
      restore_count: (backup.restore_count || 0) + 1,
    });

    // Log audit
    await base44.functions.invoke('auditLog', {
      entity_type: 'Backup',
      action: 'restore',
      entity_id: backup_id,
      function_name: 'restoreBackup',
      changes: `Restored backup: ${backup.backup_name} (${restoreResults.total_records_restored} records)`,
      timestamp: new Date().toISOString(),
    });

    return Response.json({
      success: true,
      message: `Restore completed: ${restoreResults.entities_restored} entities, ${restoreResults.total_records_restored} records`,
      ...restoreResults,
    });
  } catch (error) {
    console.error('[Backup Restore Error]', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});