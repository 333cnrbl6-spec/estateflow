import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const {
      fileName,
      fileUrl,
      categorization,
      propertyId,
      unitId
    } = await req.json();

    // Determine document type based on categorization
    let documentType = 'general';
    let linkedEntityType = null;
    let linkedEntityId = null;

    if (categorization.certificateType) {
      documentType = 'certificate';
      linkedEntityType = categorization.certificateType.toLowerCase().replace(/\s+/g, '_');
    } else if (categorization.invoiceCategory) {
      documentType = 'invoice';
      linkedEntityType = 'invoice';
    } else if (categorization.propertyAddress) {
      documentType = 'property_document';
      linkedEntityType = 'property';
      if (propertyId) {
        linkedEntityId = propertyId;
      }
    }

    // Create document record
    const document = await base44.asServiceRole.entities.Document.create({
      title: categorization.documentTitle || fileName,
      file_url: fileUrl,
      document_type: documentType,
      category: categorization.certificateType || categorization.invoiceCategory || 'general',
      property_id: propertyId,
      unit_id: unitId,
      linked_entity_type: linkedEntityType,
      linked_entity_id: linkedEntityId,
      parsed_data: {
        propertyAddress: categorization.propertyAddress,
        certificateType: categorization.certificateType,
        invoiceCategory: categorization.invoiceCategory,
        issueDate: categorization.issueDate,
        expiryDate: categorization.expiryDate,
        confidence: categorization.confidence
      },
      upload_date: new Date().toISOString(),
      uploaded_by: user.email,
      status: 'processed'
    });

    // If it's a certificate, also create a SafetyCertificate or GasSafetyCertificate record
    if (categorization.certificateType && propertyId) {
      try {
        const certData = {
          property_id: propertyId,
          certificate_type: categorization.certificateType.toLowerCase().replace(/\s+/g, '_'),
          issue_date: categorization.issueDate,
          expiry_date: categorization.expiryDate,
          document_url: fileUrl,
          status: 'valid',
          parsed_from_upload: true
        };

        // Map certificate type to correct entity
        let certEntity = 'SafetyCertificate';
        if (categorization.certificateType.includes('Gas')) {
          certEntity = 'GasSafetyCertificate';
        } else if (categorization.certificateType.includes('Electrical')) {
          certEntity = 'EICRCertificate';
        }

        await base44.asServiceRole.entities[certEntity].create(certData);
      } catch (certError) {
        console.warn('Could not create certificate record:', certError.message);
      }
    }

    return Response.json({
      success: true,
      document: document,
      message: `Document "${document.title}" processed and categorized successfully`
    });
  } catch (error) {
    console.error('Error saving document categorization:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});