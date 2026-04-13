import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { unitId, propertyId, title, description, category, photoUrls, priority = 'standard' } = await req.json();

    if (!unitId || !propertyId || !title || !description || !category) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // 1. Create maintenance request
    const maintenanceReq = await base44.entities.MaintenanceRequest.create({
      unit_id: unitId,
      property_id: propertyId,
      tenant_id: user.id,
      title,
      description,
      category,
      priority,
      status: 'reported',
      photos: photoUrls || [],
      internal_notes: `Submitted by tenant via portal on ${new Date().toISOString()}`,
    });

    // 2. Get property details for PM assignment
    const property = await base44.entities.Property.get(propertyId);
    if (!property) {
      return Response.json({ error: 'Property not found' }, { status: 404 });
    }

    // 3. Find available contractors for this category
    // In production, implement contractor matching logic
    const contractors = await base44.entities.Contact.filter({
      contact_type: 'contractor',
      specializations: category,
    });

    let assignedContractor = null;
    if (contractors?.length > 0) {
      // Pick first available contractor (in production, implement smarter matching)
      assignedContractor = contractors[0];
    }

    // 4. Get Property Manager email
    const pmUsers = await base44.asServiceRole.entities.User.filter({
      role: 'property_manager',
    });

    const pmEmail = pmUsers?.[0]?.email;

    // 5. Send notification to PM
    if (pmEmail) {
      try {
        await base44.integrations.Core.SendEmail({
          to: pmEmail,
          subject: `New Maintenance Request: ${title} - ${property.name}`,
          body: `
A new maintenance request has been submitted by a tenant.

**Property:** ${property.name}
**Unit:** ${unitId}
**Category:** ${category}
**Priority:** ${priority}
**Title:** ${title}
**Description:** ${description}

${photoUrls?.length > 0 ? `**Photos Attached:** ${photoUrls.length} image(s)` : ''}

${assignedContractor ? `**Suggested Contractor:** ${assignedContractor.name}` : '**Action Required:** Please assign a contractor'}

Ticket ID: ${maintenanceReq.id}

Log in to Premiso to assign a contractor and schedule the work.
          `,
        });
      } catch (emailErr) {
        console.error('Failed to send PM notification:', emailErr.message);
        // Don't fail the entire request if email fails
      }
    }

    // 6. If contractor available, auto-assign and notify
    if (assignedContractor) {
      try {
        // Update maintenance request with contractor assignment
        await base44.entities.MaintenanceRequest.update(maintenanceReq.id, {
          assigned_contractor_id: assignedContractor.id,
          assigned_contractor_name: assignedContractor.name,
          assigned_contractor_email: assignedContractor.email,
          assigned_date: new Date().toISOString(),
          status: 'assigned',
        });

        // Send notification to contractor
        await base44.integrations.Core.SendEmail({
          to: assignedContractor.email,
          subject: `New Job Assignment: ${title} - ${property.name}`,
          body: `
You have been assigned a new maintenance job.

**Property:** ${property.name}
**Unit:** ${unitId}
**Category:** ${category}
**Priority:** ${priority}
**Issue:** ${title}
**Details:** ${description}

${photoUrls?.length > 0 ? `**Photos Provided:** ${photoUrls.length} image(s)\n${photoUrls.map(url => `- ${url}`).join('\n')}` : ''}

**Next Steps:**
1. Review the job details in your contractor portal
2. Confirm availability and provide quote
3. Schedule the work with the tenant

Job ID: ${maintenanceReq.id}
          `,
        });
      } catch (err) {
        console.error('Failed to auto-assign contractor:', err.message);
      }
    }

    return Response.json({
      success: true,
      maintenanceRequestId: maintenanceReq.id,
      assigned: !!assignedContractor,
      assignedContractor: assignedContractor?.name || null,
      notificationsSent: {
        propertyManager: !!pmEmail,
        contractor: !!assignedContractor,
      },
    });
  } catch (error) {
    console.error('Error creating maintenance request:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});