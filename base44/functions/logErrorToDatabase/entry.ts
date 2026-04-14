import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();

    const {
      user_email,
      error_type,
      message,
      severity,
      url,
      stack_trace,
      user_agent,
      environment,
      timestamp,
      ...metadata
    } = body;

    // Store error log
    const errorLog = await base44.asServiceRole.entities.ErrorLog.create({
      user_email: user_email || 'anonymous',
      error_type: error_type || 'uncaught_error',
      message: message || 'Unknown error',
      severity: severity || 'error',
      url,
      stack_trace,
      user_agent,
      environment: environment || 'production',
      timestamp: timestamp || new Date().toISOString(),
      status: 'new',
      notes: Object.keys(metadata).length > 0 ? JSON.stringify(metadata) : null
    });

    // For critical errors, send alert email
    if (severity === 'critical') {
      try {
        await base44.integrations.Core.SendEmail({
          to: Deno.env.get('SALES_LEAD_EMAIL') || 'admin@premiso.io',
          subject: `🚨 CRITICAL ERROR: ${message}`,
          body: `
A critical error was detected in your Premiso instance.

**Error:** ${message}
**Type:** ${error_type}
**User:** ${user_email}
**URL:** ${url}
**Time:** ${timestamp}

**Stack Trace:**
${stack_trace || 'N/A'}

---
View all errors at: /errors
          `.trim()
        });
      } catch (emailErr) {
        console.warn('[logErrorToDatabase] Failed to send alert email:', emailErr.message);
      }
    }

    return Response.json({
      status: 'logged',
      error_id: errorLog.id,
      severity
    });
  } catch (error) {
    console.error('[logErrorToDatabase] Error:', error.message);
    return Response.json({
      error: error.message,
      status: 'failed'
    }, { status: 500 });
  }
});