/**
 * recordPerformanceMetric — Log performance data from frontend
 * Tracks query times, function calls, and operation durations
 */

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';
import { z } from 'npm:zod@3.24.2';

const MetricSchema = z.object({
  metric_type: z.enum(['query_time', 'function_call', 'api_response', 'entity_operation', 'page_load']),
  name: z.string().min(1),
  duration_ms: z.number().nonnegative(),
  status: z.enum(['success', 'error', 'timeout']).default('success'),
  entity_name: z.string().optional(),
  operation: z.enum(['list', 'create', 'update', 'delete', 'filter']).optional(),
  record_count: z.number().optional(),
  error_message: z.string().optional(),
  metadata: z.object({}).optional(),
});

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    let body;
    try {
      body = await req.json();
    } catch {
      return Response.json({ error: 'Invalid JSON' }, { status: 400 });
    }

    const validation = MetricSchema.safeParse(body);
    if (!validation.success) {
      const errors = validation.error.errors.map(e => `${e.path.join('.')}: ${e.message}`);
      return Response.json({ error: 'Validation failed', details: errors }, { status: 400 });
    }

    const metric = validation.data;

    // Store metric asynchronously (fire and forget)
    base44.asServiceRole.entities.PerformanceMetric.create({
      ...metric,
      user_email: user?.email || 'anonymous',
      recorded_at: new Date().toISOString(),
    }).catch(err => console.error('[Metric] Failed to store:', err));

    return Response.json({ success: true, recorded: true });
  } catch (error) {
    console.error('[Metric Recording Error]', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});