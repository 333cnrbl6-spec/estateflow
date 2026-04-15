/**
 * auditLog — Backend audit logging function
 * Stores all mutations and sensitive operations for compliance audits
 */

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';
import { z } from 'npm:zod@3.24.2';

const AuditLogSchema = z.object({
  entity_type: z.string().optional(),
  action: z.string(),
  entity_id: z.string().optional(),
  changes: z.string().optional(),
  function_name: z.string().optional(),
  params: z.string().optional(),
  error: z.string().optional(),
  timestamp: z.string().datetime(),
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

    const validation = AuditLogSchema.safeParse(body);
    if (!validation.success) {
      const errors = validation.error.errors.map(e => `${e.path.join('.')}: ${e.message}`);
      return Response.json({ error: 'Validation failed', details: errors }, { status: 400 });
    }

    const { entity_type, action, entity_id, changes, function_name, params, error, timestamp } = validation.data;

    // Create audit log record
    const auditLog = await base44.asServiceRole.entities.AuditLog.create({
      action: action || function_name || 'unknown',
      entity_type,
      entity_id,
      function_name,
      changes,
      params,
      error,
      user_email: user.email,
      timestamp: new Date(timestamp).toISOString(),
      performed_by: user.email,
      ip_address: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown',
    });

    return Response.json({
      success: true,
      audit_id: auditLog.id,
      timestamp: auditLog.timestamp,
    });
  } catch (error) {
    console.error('[Audit Log Error]', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});