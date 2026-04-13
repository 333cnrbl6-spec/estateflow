/**
 * Admin action audit logging for compliance
 * Tracks all critical operations: entity changes, user actions, access events
 */

export const AUDIT_ACTIONS = {
  // User management
  USER_CREATED: 'user.created',
  USER_UPDATED: 'user.updated',
  USER_DELETED: 'user.deleted',
  USER_ROLE_CHANGED: 'user.role_changed',
  
  // Entity changes
  ENTITY_CREATED: 'entity.created',
  ENTITY_UPDATED: 'entity.updated',
  ENTITY_DELETED: 'entity.deleted',
  ENTITY_BULK_IMPORTED: 'entity.bulk_imported',
  
  // Financial operations
  INVOICE_APPROVED: 'invoice.approved',
  INVOICE_REJECTED: 'invoice.rejected',
  PAYMENT_PROCESSED: 'payment.processed',
  REFUND_ISSUED: 'refund.issued',
  
  // Compliance
  CERTIFICATE_UPLOADED: 'certificate.uploaded',
  COMPLIANCE_ISSUE_RESOLVED: 'compliance.issue_resolved',
  
  // Access
  LOGIN_SUCCESS: 'login.success',
  LOGIN_FAILED: 'login.failed',
  LOGOUT: 'logout',
  UNAUTHORIZED_ACCESS_ATTEMPT: 'unauthorized_access',
};

export async function recordAuditLog(action, details = {}) {
  const log = {
    action,
    user_email: details.user_email || 'system',
    timestamp: new Date().toISOString(),
    ip_address: details.ip_address || null,
    entity_type: details.entity_type || null,
    entity_id: details.entity_id || null,
    changes: details.changes || null,
    status: details.status || 'success',
    notes: details.notes || null,
  };

  try {
    // Log to database (if backend function available)
    if (typeof window === 'undefined') {
      console.log('[AUDIT]', JSON.stringify(log));
    } else {
      // Frontend - send to backend
      await fetch('/api/audit-logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(log),
      }).catch(e => console.warn('Audit log failed:', e));
    }
  } catch (error) {
    console.error('Audit logging error:', error);
  }

  return log;
}

export function filterAuditLogs(logs, filters = {}) {
  return logs.filter(log => {
    if (filters.action && log.action !== filters.action) return false;
    if (filters.user_email && log.user_email !== filters.user_email) return false;
    if (filters.entity_type && log.entity_type !== filters.entity_type) return false;
    if (filters.status && log.status !== filters.status) return false;
    if (filters.startDate && new Date(log.timestamp) < new Date(filters.startDate)) return false;
    if (filters.endDate && new Date(log.timestamp) > new Date(filters.endDate)) return false;
    return true;
  });
}

export function exportAuditLog(logs, format = 'json') {
  const data = JSON.stringify(logs, null, 2);
  const blob = new Blob([data], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `audit-log-${new Date().toISOString()}.${format}`;
  a.click();
}