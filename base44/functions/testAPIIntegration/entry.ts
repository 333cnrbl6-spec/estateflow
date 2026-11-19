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

    // SECURITY: block server-side requests to private, loopback, link-local or cloud-metadata addresses
    let endpointUrl;
    try {
      endpointUrl = new URL(integration.api_endpoint);
    } catch (err) {
      return Response.json({ error: 'Invalid API endpoint' }, { status: 400 });
    }

    const host = endpointUrl.hostname.toLowerCase();
    const blockedHost =
      endpointUrl.protocol !== 'https:' ||
      host === 'localhost' ||
      host.endsWith('.localhost') ||
      host === 'metadata.google.internal' ||
      host === '169.254.169.254' ||
      /^127\./.test(host) ||
      /^10\./.test(host) ||
      /^192\.168\./.test(host) ||
      /^172\.(1[6-9]|2\d|3[01])\./.test(host) ||
      /^169\.254\./.test(host) ||
      host === '::1' ||
      host.startsWith('[');

    if (blockedHost) {
      return Response.json({ error: 'API endpoint must be a public HTTPS address' }, { status: 400 });
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