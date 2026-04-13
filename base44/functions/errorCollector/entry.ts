/**
 * Server-side error collection & monitoring
 * Receives error batches from frontend
 */

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return Response.json({ error: 'Method not allowed' }, { status: 405 });
  }

  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { errors } = await req.json();

    if (!Array.isArray(errors) || errors.length === 0) {
      return Response.json({ error: 'Invalid payload' }, { status: 400 });
    }

    // Store errors in database
    const storedErrors = await Promise.all(
      errors.map(error =>
        base44.asServiceRole.entities.ErrorLog.create({
          user_id: user.id,
          user_email: user.email,
          error_type: error.type,
          message: error.message,
          severity: error.severity || 'error',
          url: error.url,
          timestamp: error.timestamp,
          stack_trace: error.stack,
          user_agent: error.userAgent,
          environment: error.environment,
        })
      )
    );

    // Alert on critical errors
    const criticalErrors = errors.filter(e => e.type === 'api_error' && e.status >= 500);
    if (criticalErrors.length > 0) {
      console.error('[CRITICAL_ERRORS_DETECTED]', criticalErrors);
      // TODO: Send alert (Slack, email, etc.)
    }

    return Response.json({
      success: true,
      stored: storedErrors.length,
    });
  } catch (error) {
    console.error('[ERROR_COLLECTOR_ERROR]', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});