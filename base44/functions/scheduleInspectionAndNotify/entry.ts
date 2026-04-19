import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { 
      propertyId, 
      inspection_type, 
      scheduled_date, 
      inspector_name, 
      inspector_email 
    } = await req.json();

    if (!propertyId || !inspection_type || !scheduled_date || !inspector_name || !inspector_email) {
      return Response.json({ 
        error: 'Missing required fields' 
      }, { status: 400 });
    }

    // Get property details
    const property = await base44.asServiceRole.entities.Property.get(propertyId);
    if (!property) {
      return Response.json({ 
        error: 'Property not found' 
      }, { status: 404 });
    }

    // Create inspection record
    const inspection = await base44.asServiceRole.entities.PropertyInspection.create({
      property_id: propertyId,
      inspection_type: inspection_type,
      scheduled_date: scheduled_date,
      inspector_name: inspector_name,
      inspector_email: inspector_email,
      status: 'scheduled'
    });

    // Get all tenants at this property
    const tenants = await base44.asServiceRole.entities.Tenant.filter({
      property_id: propertyId,
      status: 'active'
    });

    const notifiedTenants = [];
    const scheduledDateObj = new Date(scheduled_date);
    const formattedDate = scheduledDateObj.toLocaleDateString('en-GB', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    const formattedTime = scheduledDateObj.toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit'
    });

    // Send notifications to all tenants
    for (const tenant of tenants || []) {
      // Send email notification
      await base44.integrations.Core.SendEmail({
        to: tenant.email,
        subject: `Property Inspection Scheduled - ${property.name}`,
        body: generateTenantNotificationHTML(
          tenant.full_name,
          property.name,
          inspection_type,
          formattedDate,
          formattedTime,
          inspector_name
        )
      });

      // Create in-app notification
      await base44.asServiceRole.entities.Notification.create({
        recipient_email: tenant.email,
        type: 'inspection_scheduled',
        title: 'Property Inspection Scheduled',
        message: `A ${inspection_type.replace('_', ' ')} inspection has been scheduled for ${property.name} on ${formattedDate} at ${formattedTime}. Inspector: ${inspector_name}`,
        triggered_by: 'system',
        action_url: '/tenant-portal'
      });

      notifiedTenants.push({
        tenant_id: tenant.id,
        email: tenant.email,
        name: tenant.full_name
      });
    }

    // Send confirmation to inspector
    await base44.integrations.Core.SendEmail({
      to: inspector_email,
      subject: `Inspection Scheduled - ${property.name}`,
      body: generateInspectorNotificationHTML(
        inspector_name,
        property,
        inspection_type,
        formattedDate,
        formattedTime,
        tenants
      )
    });

    return Response.json({
      success: true,
      inspection_id: inspection.id,
      tenants_notified: notifiedTenants.length,
      notified_tenants: notifiedTenants
    });

  } catch (error) {
    console.error('Inspection scheduling error:', error);
    return Response.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
});

function generateTenantNotificationHTML(tenantName, propertyName, inspectionType, date, time, inspectorName) {
  const typeLabel = inspectionType.replace(/_/g, ' ');
  
  return `
    <html>
      <body style="font-family: Arial, sans-serif; color: #333;">
        <h2>Property Inspection Scheduled</h2>
        <p>Dear ${tenantName},</p>

        <p>A <strong>${typeLabel}</strong> has been scheduled for your property:</p>

        <div style="background-color: #f5f5f5; padding: 15px; border-left: 4px solid #3498db; margin: 20px 0;">
          <p><strong>Property:</strong> ${propertyName}</p>
          <p><strong>Date:</strong> ${date}</p>
          <p><strong>Time:</strong> ${time}</p>
          <p><strong>Inspector:</strong> ${inspectorName}</p>
        </div>

        <p><strong>What to expect:</strong></p>
        <ul>
          <li>The inspector will visit the property to conduct a ${typeLabel}</li>
          <li>The inspection typically takes 30-60 minutes</li>
          <li>Please ensure the property is clean and accessible</li>
          <li>You may be present during the inspection</li>
          <li>A full report will be provided within 5 business days</li>
        </ul>

        <p><strong>If you have any questions or need to reschedule:</strong><br>
        Please contact your property manager at your earliest convenience.</p>

        <p>Best regards,<br>The Property Management Team</p>
      </body>
    </html>
  `;
}

function generateInspectorNotificationHTML(inspectorName, property, inspectionType, date, time, tenants) {
  const tenantList = tenants?.map(t => `${t.full_name} (${t.email})`).join('<br>') || 'No tenants';
  const typeLabel = inspectionType.replace(/_/g, ' ');

  return `
    <html>
      <body style="font-family: Arial, sans-serif; color: #333;">
        <h2>Inspection Scheduled</h2>
        <p>Dear ${inspectorName},</p>

        <p>A new inspection has been scheduled:</p>

        <div style="background-color: #f5f5f5; padding: 15px; border-left: 4px solid #27ae60; margin: 20px 0;">
          <p><strong>Property:</strong> ${property.name}</p>
          <p><strong>Address:</strong> ${property.address_line_1}, ${property.city}, ${property.postcode}</p>
          <p><strong>Inspection Type:</strong> ${typeLabel}</p>
          <p><strong>Date:</strong> ${date}</p>
          <p><strong>Time:</strong> ${time}</p>
        </div>

        <p><strong>Tenants at Property:</strong><br>
        ${tenantList}</p>

        <p>Please arrive 10 minutes early and carry proper identification. Upload your inspection report and photos immediately after the visit.</p>

        <p>Thank you,<br>The Property Management Team</p>
      </body>
    </html>
  `;
}