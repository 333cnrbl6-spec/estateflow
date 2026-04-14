import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { inspection_id } = await req.json();

    // Get inspection details
    const inspection = await base44.asServiceRole.entities.InspectionRecord.get(inspection_id);
    if (!inspection) {
      return Response.json({ error: 'Inspection not found' }, { status: 404 });
    }

    // Get property
    const property = await base44.asServiceRole.entities.Property.get(inspection.property_id);

    // Get tenants for this property/unit
    const tenantQuery = inspection.unit_id ? 
      { property_id: inspection.property_id, unit_id: inspection.unit_id, status: 'active' } :
      { property_id: inspection.property_id, status: 'active' };

    const tenants = await base44.asServiceRole.entities.Tenant.filter(tenantQuery, 'full_name', 50);

    console.log(`[Notify Inspection] Sending notifications to ${tenants.length} tenant(s)`);

    const scheduledDate = new Date(inspection.scheduled_date);
    const formattedDate = scheduledDate.toLocaleDateString('en-GB', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });

    // Send email to each tenant
    for (const tenant of tenants) {
      try {
        const emailBody = `
          <h2>Property Inspection Notice</h2>
          
          <p>Dear ${tenant.full_name},</p>
          
          <p>We are scheduling a ${inspection.inspection_type} inspection of your property as part of our regular maintenance and compliance checks.</p>
          
          <h3>Inspection Details</h3>
          <table style="width: 100%; border-collapse: collapse; margin: 15px 0;">
            <tr style="background: #f3f4f6;">
              <th style="text-align: left; padding: 10px; border: 1px solid #e5e7eb;">Property</th>
              <td style="padding: 10px; border: 1px solid #e5e7eb;">${property?.address || inspection.property_id}</td>
            </tr>
            <tr>
              <th style="text-align: left; padding: 10px; border: 1px solid #e5e7eb;">Inspection Type</th>
              <td style="padding: 10px; border: 1px solid #e5e7eb; text-transform: capitalize;">${inspection.inspection_type}</td>
            </tr>
            <tr style="background: #f3f4f6;">
              <th style="text-align: left; padding: 10px; border: 1px solid #e5e7eb;">Scheduled Date</th>
              <td style="padding: 10px; border: 1px solid #e5e7eb;"><strong>${formattedDate}</strong></td>
            </tr>
          </table>

          <h3>What to Expect</h3>
          <ul>
            <li>Inspector will check the general condition of the property</li>
            <li>Inspection typically takes 30-60 minutes</li>
            <li>Access to all areas is required</li>
            <li>A formal report will be provided afterwards</li>
          </ul>

          <h3>Please Confirm Access</h3>
          <p>Please confirm that you (or an authorized person) will be available to provide access on the scheduled date. If this date doesn't work, please contact us as soon as possible to reschedule.</p>

          <p style="background: #f0fdf4; border-left: 4px solid #16a34a; padding: 15px; margin: 20px 0; border-radius: 3px;">
            <strong>✓ How to Confirm:</strong> Reply to this email to confirm access or request an alternative date.
          </p>

          ${inspection.notes ? `
            <h3>Additional Information</h3>
            <p>${inspection.notes}</p>
          ` : ''}

          <p>If you have any questions, please don't hesitate to contact us.</p>
          
          <p>Best regards,<br/>
          <strong>Property Management Team</strong></p>
        `;

        await base44.asServiceRole.integrations.Core.SendEmail({
          to: tenant.email,
          subject: `Property Inspection Scheduled - ${formattedDate}`,
          body: emailBody
        });

        console.log(`[Notify Inspection] Sent notification to ${tenant.email}`);
      } catch (emailError) {
        console.error(`[Notify Inspection] Error sending email to ${tenant.email}:`, emailError);
      }
    }

    return Response.json({
      success: true,
      tenants_notified: tenants.length
    });
  } catch (error) {
    console.error('[Notify Inspection] Error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});