import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { integration_id } = await req.json();

    const integration = await base44.entities.APIIntegration.get(integration_id);
    if (!integration) {
      return Response.json({ error: 'Integration not found' }, { status: 404 });
    }

    // Test the API connection
    try {
      const response = await fetch(`${integration.api_endpoint}/health`, {
        headers: {
          Authorization: `Bearer ${integration.api_key_prefix}`,
          'Content-Type': 'application/json',
        },
      });

      const status = response.ok ? 'success' : 'failed';
      const statusCode = response.status;

      // Log the webhook event
      await base44.entities.WebhookLog.create({
        integration_id,
        event_type: 'health_check',
        status,
        status_code: statusCode,
        timestamp: new Date().toISOString(),
      });

      return Response.json({
        success: response.ok,
        statusCode,
        message: response.ok ? 'Connection successful' : 'Connection failed',
      });
    } catch (error) {
      // Log failed attempt
      await base44.entities.WebhookLog.create({
        integration_id,
        event_type: 'health_check',
        status: 'failed',
        error_message: error.message,
        timestamp: new Date().toISOString(),
      });

      return Response.json({
        success: false,
        error: error.message,
      });
    }
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});