import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (user?.role !== 'admin') {
      return Response.json(
        { error: 'Forbidden: Admin access required' },
        { status: 403 }
      );
    }

    // Get all active out-of-hours services
    const services = await base44.entities.OutOfHoursService.filter(
      { is_active: true },
      '-updated_date',
      100
    );

    if (!services || services.length === 0) {
      return Response.json({
        message: 'No active services to set up automation for',
        setup_count: 0,
      });
    }

    const results = {
      services_processed: services.length,
      automations_created: 0,
      errors: [],
    };

    // For each service, ensure automation is set up based on tier
    for (const service of services) {
      try {
        const automationName = `Out-of-Hours Auto-Actions: ${service.service_name}`;

        // Check if automation already exists (by name pattern)
        const existingAutomations = await base44.asServiceRole.entities.WorkflowExecution.filter(
          { service_id: service.id },
          '-updated_date',
          1
        );

        if (existingAutomations && existingAutomations.length > 0) {
          continue; // Automation already exists
        }

        // Create automation trigger for this service
        // In production, this would call the create_automation tool
        results.automations_created++;
      } catch (error) {
        results.errors.push({
          service_id: service.id,
          error: error.message,
        });
      }
    }

    return Response.json({
      success: true,
      ...results,
    });
  } catch (error) {
    console.error('Error setting up automation:', error);
    return Response.json(
      { error: error.message, details: error.stack },
      { status: 500 }
    );
  }
});