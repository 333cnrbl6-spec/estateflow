/**
 * Backend audit logging function
 * Stores all critical operations for compliance audits
 */

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Verify admin
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Unauthorized' }, { status: 403 });
    }

    if (req.method === 'POST') {
      const logData = await req.json();
      
      // Validate required fields
      const required = ['action', 'entity_type'];
      const missing = required.filter(f => !logData[f]);
      if (missing.length > 0) {
        return Response.json(
          { error: `Missing fields: ${missing.join(', ')}` },
          { status: 400 }
        );
      }

      // Store audit log
      const auditRecord = await base44.asServiceRole.entities.AuditLog.create({
        action: logData.action,
        user_email: logData.user_email,
        entity_type: logData.entity_type,
        entity_id: logData.entity_id,
        changes: logData.changes,
        status: logData.status || 'success',
        notes: logData.notes,
        ip_address: logData.ip_address,
        timestamp: new Date().toISOString(),
      });

      return Response.json({ success: true, id: auditRecord.id });
    }

    if (req.method === 'GET') {
      const url = new URL(req.url);
      const action = url.searchParams.get('action');
      const days = parseInt(url.searchParams.get('days') || '30');
      
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const query = { timestamp: { $gte: startDate.toISOString() } };
      if (action) query.action = action;

      const logs = await base44.asServiceRole.entities.AuditLog.filter(
        query,
        '-timestamp',
        1000
      );

      return Response.json({ logs, count: logs.length });
    }

    return Response.json({ error: 'Method not allowed' }, { status: 405 });
  } catch (error) {
    console.error('[AUDIT_LOG_ERROR]', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});