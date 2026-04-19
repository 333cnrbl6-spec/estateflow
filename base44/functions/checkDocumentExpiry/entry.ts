import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Get all documents with expiry dates
    const documents = await base44.asServiceRole.entities.Document.list();
    
    if (!documents || documents.length === 0) {
      return Response.json({ success: true, alerted: 0 });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    let alertCount = 0;

    for (const doc of documents) {
      if (!doc.expiry_date || !doc.property_id) continue;

      const expiryDate = new Date(doc.expiry_date);
      const daysUntilExpiry = Math.floor((expiryDate - today) / (1000 * 60 * 60 * 24));

      // Check if document is expired or expiring within 30 days
      if (daysUntilExpiry <= 30 && daysUntilExpiry >= 0) {
        try {
          // Get property details
          const property = await base44.asServiceRole.entities.Property.get(doc.property_id);
          if (!property) continue;

          // Create in-app notification for property manager
          await base44.asServiceRole.entities.TenantNotification.create({
            tenant_id: property.owning_company || 'manager',
            type: 'document_expiring',
            title: `Document Expiring: ${getDocumentLabel(doc.document_type)}`,
            message: `The ${getDocumentLabel(doc.document_type)} for ${property.name} expires on ${expiryDate.toLocaleDateString('en-GB')}. Please renew it.`,
            related_entity_id: doc.id,
            related_entity_type: 'Document',
            due_date: doc.expiry_date,
            action_url: '/property-documents',
            created_at: new Date().toISOString()
          });

          alertCount++;
        } catch (err) {
          console.error(`Error creating alert for document ${doc.id}:`, err);
        }
      } else if (daysUntilExpiry < 0) {
        // Document is expired
        try {
          const property = await base44.asServiceRole.entities.Property.get(doc.property_id);
          if (!property) continue;

          // Create urgent notification
          await base44.asServiceRole.entities.TenantNotification.create({
            tenant_id: property.owning_company || 'manager',
            type: 'document_expiring',
            title: `URGENT: ${getDocumentLabel(doc.document_type)} Expired`,
            message: `The ${getDocumentLabel(doc.document_type)} for ${property.name} expired on ${expiryDate.toLocaleDateString('en-GB')}. This must be renewed immediately for compliance.`,
            related_entity_id: doc.id,
            related_entity_type: 'Document',
            due_date: doc.expiry_date,
            action_url: '/property-documents',
            created_at: new Date().toISOString()
          });

          alertCount++;
        } catch (err) {
          console.error(`Error creating urgent alert for document ${doc.id}:`, err);
        }
      }
    }

    return Response.json({
      success: true,
      alerted: alertCount,
      checked: documents.length
    });
  } catch (error) {
    console.error('Document expiry check error:', error);
    return Response.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
});

function getDocumentLabel(type) {
  const labels = {
    gas_safety_certificate: 'Gas Safety Certificate',
    epc: 'Energy Performance Certificate',
    electrical_inspection: 'Electrical Installation Condition Report',
    boiler_service: 'Boiler Service Certificate',
    fire_safety: 'Fire Safety Certificate',
    hmo_license: 'HMO License',
    building_regulations: 'Building Regulations Approval',
    insurance: 'Insurance Certificate',
    property_deed: 'Property Deed',
    other: 'Document'
  };
  return labels[type] || 'Document';
}