import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const {
      tenant_id,
      property_id,
      unit_id,
      document_type,
      file_name,
      file_url,
      file_size,
    } = await req.json();

    if (!tenant_id || !file_url || !document_type) {
      return Response.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create document record
    const documentRecord = await base44.asServiceRole.entities.Document.create({
      tenant_id,
      property_id,
      unit_id,
      document_type,
      file_name,
      file_url,
      file_size,
      status: 'pending_review',
      uploaded_by: user.email,
      uploaded_date: new Date().toISOString(),
    });

    // Fetch property to get manager info
    let propertyManager = null;
    if (property_id) {
      const property = await base44.asServiceRole.entities.Property.get(property_id);
      if (property && property.owning_company) {
        // Get company admins to notify
        const users = await base44.asServiceRole.entities.User.filter({
          company_id: property.owning_company,
          role: 'admin',
        });
        propertyManager = users?.[0];
      }
    }

    // Trigger notification
    if (propertyManager && propertyManager.email) {
      try {
        await base44.integrations.Core.SendEmail({
          to: propertyManager.email,
          subject: `New Document Upload - ${document_type}`,
          body: `A tenant has uploaded a new document: ${document_type}

File: ${file_name}
Size: ${(file_size / 1024).toFixed(0)} KB
Uploaded by: ${user.full_name || user.email}
Date: ${new Date().toLocaleDateString('en-GB')}

Please review the document in the tenant portal.`,
        });
      } catch (emailError) {
        console.error('Email notification failed:', emailError);
        // Don't fail the upload if email fails
      }
    }

    return Response.json({
      success: true,
      document_id: documentRecord.id,
      message: 'Document uploaded successfully',
    });
  } catch (error) {
    console.error('Error in handleTenantDocumentUpload:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});