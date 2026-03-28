import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { batch_name, document_type, company_id, property_ids } = await req.json();

    // Create bulk job record
    const bulkJob = await base44.entities.BulkDocumentGeneration.create({
      batch_name,
      document_type,
      company_id,
      total_documents: property_ids.length,
      status: 'in_progress',
      started_date: new Date().toISOString().split('T')[0],
    });

    // Generate documents for each property
    let successCount = 0;
    const errors = [];

    for (const propertyId of property_ids) {
      try {
        const property = await base44.entities.Property.get(propertyId);
        const units = await base44.entities.Unit.filter({ property_id: propertyId });

        for (const unit of units) {
          const doc = await base44.entities.Document.create({
            title: `${document_type} - ${property.name} ${unit.unit_reference}`,
            template_id: '',
            document_type,
            property_id: propertyId,
            unit_id: unit.id,
            status: 'generated',
            generated_date: new Date().toISOString().split('T')[0],
          });
          successCount++;
        }
      } catch (error) {
        errors.push(`Failed to generate for property ${propertyId}: ${error.message}`);
      }
    }

    // Update bulk job
    await base44.entities.BulkDocumentGeneration.update(bulkJob.id, {
      status: errors.length > 0 ? 'completed' : 'completed',
      generated_count: successCount,
      failed_count: errors.length,
      completed_date: new Date().toISOString().split('T')[0],
      errors: errors.slice(0, 10),
    });

    // Log compliance action
    await base44.entities.ComplianceAuditLog.create({
      action_type: 'document_created',
      entity_type: 'bulk_generation',
      entity_id: bulkJob.id,
      company_id,
      description: `Bulk generated ${successCount} ${document_type} documents`,
      performed_by: user.email,
      timestamp: new Date().toISOString(),
    });

    return Response.json({
      jobId: bulkJob.id,
      success: true,
      generated: successCount,
      failed: errors.length,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});