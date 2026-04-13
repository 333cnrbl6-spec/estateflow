import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { event, data, entity_name } = await req.json();

    // Only process on Tenant creation
    if (entity_name !== 'Tenant' || event.type !== 'create') {
      return Response.json({ success: false, reason: 'Not a Tenant creation event' });
    }

    const tenant = data;
    if (!tenant || !tenant.id) {
      return Response.json({ error: 'Invalid tenant data' }, { status: 400 });
    }

    const { unit_id, property_id, email, full_name } = tenant;

    // Fetch related entities
    const [unit, property] = await Promise.all([
      unit_id ? base44.asServiceRole.entities.Unit.get(unit_id) : null,
      property_id ? base44.asServiceRole.entities.Property.get(property_id) : null,
    ]);

    // 1. Generate secure tenant portal token
    const tokenPayload = `${tenant.id}:${Date.now()}:${Math.random().toString(36).slice(2)}`;
    const portalToken = btoa(tokenPayload);
    const portalUrl = `${new URL(req.url).origin}/tenant-portal?token=${portalToken}`;

    // 2. Send welcome email
    const emailBody = `
Dear ${full_name},

Welcome to your Tenant Portal! Your lease has been successfully registered.

📋 Your Portal Login:
${portalUrl}

What you can do:
• View your lease details and payment schedule
• Submit maintenance requests with photos/videos
• Track your repairs and communicate with your landlord
• View and download important documents
• Access compliance certificates (Gas Safety, EPC, etc.)

📄 Next Steps:
Please log in and upload the following documents to your portal:
1. Proof of Identity (Passport, Driving Licence)
2. Proof of Address (Recent utility bill, bank statement)

You'll need these for your property file and to comply with legal requirements.

Property Details:
${property ? `Property: ${property.name}` : ''}
${unit ? `Unit: ${unit.unit_reference}` : ''}

If you have any questions, please contact your property manager.

Best regards,
Property Management Team
    `;

    await base44.asServiceRole.integrations.Core.SendEmail({
      to: email,
      subject: `Welcome to Your Tenant Portal - ${property?.name || 'Property'} ${unit?.unit_reference || ''}`,
      body: emailBody,
      from_name: 'Property Management',
    });

    // 3. Create compliance documents for this tenant
    // Fetch property-level compliance docs to link to tenant
    const propertyDocs = property_id
      ? await base44.asServiceRole.entities.Document.filter({ property_id })
      : [];

    const complianceTypes = ['gas_safety_cert', 'eicr', 'epc', 'fire_safety_cert'];
    const createdDocs = [];

    for (const docType of complianceTypes) {
      const existingDoc = propertyDocs.find(d => d.document_type === docType && d.expiry_date);
      if (!existingDoc) continue;

      // Link property compliance doc to this tenant
      const docRecord = await base44.asServiceRole.entities.Document.create({
        title: existingDoc.title || `${docType.replace(/_/g, ' ')}`,
        document_type: docType,
        property_id,
        unit_id,
        tenant_id: tenant.id,
        file_url: existingDoc.file_url,
        expiry_date: existingDoc.expiry_date,
        generated_date: existingDoc.generated_date,
        access_roles: ['tenant', 'admin'],
        status: 'filed',
        notes: `Auto-linked to tenant during onboarding. Original: ${existingDoc.id}`,
      });
      createdDocs.push(docRecord);
    }

    // 4. Create welcome notification
    await base44.asServiceRole.entities.TenantNotification.create({
      tenant_id: tenant.id,
      title: '👋 Welcome to Your Tenant Portal',
      message: `Hello ${full_name}! Your tenant portal is now active. Please log in to upload your identity documents and access your lease information.`,
      notification_type: 'update',
      is_read: false,
      sent_date: new Date().toISOString(),
    });

    // 5. Create a maintenance task reminder for document upload
    const uploadReminderTask = await base44.asServiceRole.entities.MaintenanceOrder.create({
      title: `Document Upload Reminder: ${full_name}`,
      description: `New tenant ${full_name} (${email}) should upload ID and proof of address to their portal. Portal link: ${portalUrl}`,
      property_id,
      unit_id,
      reported_by: tenant.id,
      category: 'general',
      priority: 'standard',
      status: 'reported',
      notes: `auto-onboarding:tenant-doc-reminder:${tenant.id}`,
    });

    return Response.json({
      success: true,
      tenant_id: tenant.id,
      tenant_name: full_name,
      portal_token_generated: true,
      portal_url: portalUrl,
      welcome_email_sent: true,
      compliance_docs_linked: createdDocs.length,
      notification_created: true,
      reminder_task_created: true,
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});