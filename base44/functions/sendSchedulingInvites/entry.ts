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

    // Send email to contractor
    if (contractor_email) {
      await base44.integrations.Core.SendEmail({
        to: contractor_email,
        subject: `Maintenance Job Assigned: ${maintenance_title} - ${dateFormatted}`,
        body: `
Hi ${contractor_name},

A maintenance job has been assigned to you:

**Job Details:**
- Task: ${maintenance_title}
- Property: ${property_address}
- Scheduled: ${dateFormatted} at ${timeFormatted}
- Duration: 2 hours

**What to do:**
1. Accept or decline this job in your Contractor Portal
2. Plan your travel to the property
3. Ensure you have all required tools and certifications

If you cannot make this appointment, please notify the property manager immediately.

Best regards,
Property Management System
        `,
      });
    }

    // Send email to tenant
    if (tenant_email) {
      await base44.integrations.Core.SendEmail({
        to: tenant_email,
        subject: `Scheduled Maintenance Visit - ${maintenance_title}`,
        body: `
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
        `,
      });
    }

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