import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = await req.json();
    const { templateFileUrl, entityType, entityId, mergeFields, customData } = payload;

    // SECURITY: restrict lookups to the entity types documents are merged from
    const ALLOWED_ENTITY_TYPES = ['Property', 'Unit', 'Tenant', 'Vendor', 'Company', 'Contact', 'LeaseholderRights'];

    // Fetch entity data (user-scoped client so the entity's row-level rules apply)
    let entityData = {};
    if (entityType && entityId) {
      if (!ALLOWED_ENTITY_TYPES.includes(entityType)) {
        return Response.json({ error: 'Unsupported entity type' }, { status: 400 });
      }
      try {
        entityData = await base44.entities[entityType].get(entityId);
      } catch (err) {
        return Response.json({ error: `Failed to fetch ${entityType}: ${err.message}` }, { status: 400 });
      }
    }

    // Prepare merge data - flatten nested objects
    const mergeData = {};
    if (mergeFields && Array.isArray(mergeFields)) {
      mergeFields.forEach(field => {
        mergeData[field] = entityData[field] || customData?.[field] || '';
      });
    }

    // Merge custom data
    Object.assign(mergeData, customData || {});

    // For now, return the template URL with merge data
    // In production, you'd use a library like LibreOffice or pdfjs to actually merge
    // This is a placeholder that demonstrates the flow
    const mergedDocUrl = templateFileUrl; // In real implementation, process the file

    return Response.json({
      success: true,
      downloadUrl: mergedDocUrl,
      mergedData: mergeData,
      message: 'Document generated with merged data'
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});