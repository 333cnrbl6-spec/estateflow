/**
 * Client-side audit logging utility
 * Tracks mutations and backend function calls for compliance
 */

import { base44 } from '@/api/base44Client';

export const auditLogger = {
  /**
   * Log a mutation (create, update, delete)
   */
  logMutation: async (entity, action, entityId, data, userId = null) => {
    try {
      const timestamp = new Date().toISOString();
      const changeData = typeof data === 'object' ? JSON.stringify(data) : data;

      // Store locally first for offline resilience
      const auditLog = {
        entity_type: entity,
        action, // 'create', 'update', 'delete'
        entity_id: entityId,
        changes: changeData,
        user_email: userId,
        timestamp,
        status: 'pending',
      };

      // Try to send to backend
      try {
        await base44.functions.invoke('auditLog', {
          entity_type: entity,
          action,
          entity_id: entityId,
          changes: changeData,
          timestamp,
        });
        auditLog.status = 'synced';
      } catch (err) {
        console.warn('[Audit] Failed to sync audit log:', err);
        // Log will retry on next sync
      }

      // Store in localStorage as backup
      const auditQueue = JSON.parse(localStorage.getItem('audit_queue') || '[]');
      auditQueue.push(auditLog);
      localStorage.setItem('audit_queue', JSON.stringify(auditQueue.slice(-100))); // Keep last 100

      return auditLog;
    } catch (err) {
      console.error('[Audit] Error logging mutation:', err);
    }
  },

  /**
   * Log a function call
   */
  logFunctionCall: async (functionName, params, result, error = null) => {
    try {
      const timestamp = new Date().toISOString();

      const logEntry = {
        function_name: functionName,
        params: typeof params === 'object' ? JSON.stringify(params) : params,
        result: error ? null : (typeof result === 'object' ? JSON.stringify(result) : result),
        error: error ? error.message : null,
        timestamp,
        duration_ms: 0, // Can be calculated if needed
      };

      // Send to backend
      try {
        await base44.functions.invoke('auditLog', {
          function_name: functionName,
          params: logEntry.params,
          error: logEntry.error,
          timestamp,
        });
      } catch (err) {
        console.warn('[Audit] Failed to log function call:', err);
      }

      return logEntry;
    } catch (err) {
      console.error('[Audit] Error logging function call:', err);
    }
  },

  /**
   * Sync pending audit logs
   */
  syncPendingLogs: async () => {
    try {
      const auditQueue = JSON.parse(localStorage.getItem('audit_queue') || '[]');
      const pendingLogs = auditQueue.filter(log => log.status === 'pending');

      for (const log of pendingLogs) {
        try {
          await base44.functions.invoke('auditLog', {
            entity_type: log.entity_type,
            action: log.action,
            entity_id: log.entity_id,
            changes: log.changes,
            timestamp: log.timestamp,
          });
          log.status = 'synced';
        } catch (err) {
          console.warn('[Audit] Failed to sync log:', log, err);
        }
      }

      localStorage.setItem('audit_queue', JSON.stringify(auditQueue));
      return { synced: pendingLogs.filter(l => l.status === 'synced').length };
    } catch (err) {
      console.error('[Audit] Error syncing logs:', err);
    }
  },
};