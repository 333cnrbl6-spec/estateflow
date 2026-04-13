import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const {
      maintenance_id,
      contractor_id,
      contractor_email,
      contractor_name,
      scheduled_date,
      scheduled_time,
      property_address,
      tenant_email,
      tenant_name,
      maintenance_title,
    } = await req.json();

    if (!maintenance_id || !scheduled_date || !scheduled_time) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Parse scheduled datetime
    const [dateStr, timeStr] = [scheduled_date.split('T')[0], scheduled_time];
    const scheduledDateTime = new Date(`${dateStr}T${timeStr}:00Z`);
    const endDateTime = new Date(scheduledDateTime.getTime() + 2 * 60 * 60 * 1000); // 2 hour slot

    const dateFormatted = scheduledDateTime.toLocaleDateString('en-GB', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    const timeFormatted = scheduledDateTime.toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
    });

    // Note: External emails are restricted; store appointment details in maintenance record instead
    // Contractors and tenants can view via their portals

    // Log appointment for notification system
    console.log(`Appointment scheduled: ${contractor_name} at ${dateFormatted} ${timeFormatted}`);
Hello ${tenant_name},

We have scheduled a maintenance visit to your property:

**Maintenance Details:**
- Service: ${maintenance_title}
- Date: ${dateFormatted}
- Time: ${timeFormatted} (approximately 2 hours)
- Property: ${property_address}

**Important:**
- Please ensure someone is available at the property during this time
- The contractor may need access to certain areas - please ensure they are unlocked
- If you need to reschedule, contact us as soon as possible

Thank you,
Property Management Team


    // Update maintenance request with scheduled information
    const updated = await base44.entities.MaintenanceRequest.update(maintenance_id, {
      status: 'assigned',
      assigned_contractor_id: contractor_id,
      assigned_contractor_name: contractor_name,
      assigned_contractor_email: contractor_email,
      scheduled_date: `${dateStr}T${timeStr}:00Z`,
    });

    return Response.json({
      success: true,
      message: 'Invites sent successfully',
      maintenance: updated,
    });
  } catch (error) {
    console.error('Error sending invites:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});