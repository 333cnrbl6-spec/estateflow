import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';
import { z } from 'npm:zod@3.24.2';

const TenantMaintenanceSchema = z.object({
  tenant_id: z.string().min(1, 'Tenant ID required'),
  title: z.string().min(1, 'Title required').max(255),
  category: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high', 'emergency']).default('medium'),
  description: z.string().optional(),
  photo_urls: z.array(z.string().url()).optional().default([]),
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

    // Validate input
    const validation = TenantMaintenanceSchema.safeParse(body);
    if (!validation.success) {
      const errors = validation.error.errors.map(e => `${e.path.join('.')}: ${e.message}`);
      return Response.json({ error: 'Validation failed', details: errors }, { status: 400 });
    }

    const {
      tenant_id,
      title,
      category,
      priority,
      description,
      photo_urls
    } = validation.data;

    // Fetch tenant to get property_id
    const tenant = await base44.entities.Tenant.get(tenant_id);
    if (!tenant) {
      return Response.json({ error: 'Tenant not found' }, { status: 404 });
    }

    // Create maintenance request
    const request = await base44.entities.MaintenanceRequest.create({
      tenant_id,
      property_id: tenant.property_id,
      unit_id: tenant.unit_id,
      title,
      category,
      priority,
      description,
      photo_urls: photo_urls || [],
      status: 'submitted',
      submitted_date: new Date().toISOString()
    });

    // Send notification email to landlord/property manager
    try {
      const property = await base44.entities.Property.get(tenant.property_id);
      const contactEmail = property?.contact_email || Deno.env.get('SALES_LEAD_EMAIL');

      if (contactEmail) {
        await base44.integrations.Core.SendEmail({
          to: contactEmail,
          subject: `New Maintenance Request - ${property?.name || 'Property'}`,
          body: `
            <h2>New Maintenance Request Submitted</h2>
            <p><strong>Tenant:</strong> ${tenant.full_name}</p>
            <p><strong>Property:</strong> ${property?.address || 'N/A'}</p>
            <p><strong>Issue:</strong> ${title}</p>
            <p><strong>Category:</strong> ${category}</p>
            <p><strong>Priority:</strong> ${priority}</p>
            <p><strong>Description:</strong> ${description}</p>
            ${photo_urls?.length ? `<p><strong>Photos Attached:</strong> ${photo_urls.length} image(s)</p>` : ''}
            <p><a href="${Deno.env.get('APP_URL') || 'http://localhost:5173'}/maintenance">View in Dashboard</a></p>
          `
        });
      }
    } catch (emailErr) {
      console.warn('Failed to send notification:', emailErr.message);
    }

    return Response.json({
      success: true,
      request_id: request.id,
      message: 'Maintenance request submitted successfully'
    });
  } catch (error) {
    console.error('Error creating maintenance request:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});