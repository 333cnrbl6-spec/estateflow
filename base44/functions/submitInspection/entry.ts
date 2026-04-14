import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { inspection_id, checklist_data, photos, notes } = await req.json();

    // Update inspection record
    const inspection = await base44.asServiceRole.entities.InspectionRecord.update(inspection_id, {
      status: 'completed',
      completed_date: new Date().toISOString(),
      completed_by: user.email,
      checklist_data,
      findings: notes,
      photos_count: photos.length
    });

    console.log(`[Submit Inspection] Inspection ${inspection_id} completed`);

    return Response.json({
      success: true,
      inspection_id
    });
  } catch (error) {
    console.error('[Submit Inspection] Error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});