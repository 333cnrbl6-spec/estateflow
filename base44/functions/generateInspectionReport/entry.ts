import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { inspection_record_id } = await req.json();

    // Fetch inspection record
    const inspection = await base44.asServiceRole.entities.InspectionRecord.get(inspection_record_id);
    if (!inspection) {
      return Response.json({ error: 'Inspection record not found' }, { status: 404 });
    }

    // Fetch related property and tenant
    const [property, tenant] = await Promise.all([
      base44.asServiceRole.entities.Property.get(inspection.property_id),
      inspection.unit_id ? base44.asServiceRole.entities.Unit.get(inspection.unit_id) : null
    ]);

    // Generate comprehensive inspection report using LLM
    const prompt = `Generate a detailed UK property inspection report based on the following data:

Property Information:
- Address: ${property.address}
- Type: ${property.property_type}
- Inspection Date: ${inspection.assessment_date}
- Inspection Type: ${inspection.inspection_type}

Checklist Items Completed:
${Object.entries(inspection.checklist_data || {})
  .map(([key, value]) => `- ${key}: ${value ? 'PASS' : 'FAIL'}`)
  .join('\n')}

Inspector Findings:
${inspection.findings || 'No specific findings noted'}

Photos Attached: ${inspection.photos_count || 0} images

Create a professional report with:
1. Executive Summary
2. Property Details
3. Inspection Scope and Limitations
4. Detailed Findings by Room/Area
5. Defects Found (if any) with severity levels
6. Maintenance Recommendations
7. Health & Safety Issues (if applicable)
8. Next Steps for Property Owner
9. Inspector Sign-off

Format as a professional PDF-ready document with proper structure and professional language.`;

    const reportContent = await base44.integrations.Core.InvokeLLM({
      prompt,
      model: 'gpt_5'
    });

    // Save generated document
    const generatedDoc = await base44.asServiceRole.entities.GeneratedDocument.create({
      template_id: 'inspection-report-001',
      template_code: 'INSPECTION_REPORT',
      property_id: inspection.property_id,
      unit_id: inspection.unit_id,
      document_name: `Inspection_Report_${property.address}_${inspection.scheduled_date}.pdf`,
      document_type: 'Inspection Report',
      generated_date: new Date().toISOString(),
      generated_by: user.email,
      data_used: {
        property_address: property.address,
        inspection_date: inspection.scheduled_date,
        inspection_type: inspection.inspection_type,
        photos_count: inspection.photos_count
      },
      document_url: '',
      status: 'draft'
    });

    console.log(`[Document] Generated inspection report ${generatedDoc.id}`);

    // Send to property owner
    const owner = await base44.asServiceRole.entities.User.list().then(users => 
      users.find(u => u.role === 'admin' || u.role === 'property_owner')
    );

    if (owner) {
      await base44.asServiceRole.integrations.Core.SendEmail({
        to: owner.email,
        subject: `Property Inspection Report - ${property.address}`,
        body: `
          <h2>Property Inspection Report</h2>
          <p>An inspection has been completed for ${property.address} on ${inspection.scheduled_date}.</p>
          <p>The detailed report has been generated and is available in the platform.</p>
          <p>Please review the findings and recommendations at your earliest convenience.</p>
        `
      });
    }

    return Response.json({
      success: true,
      documentId: generatedDoc.id,
      content: reportContent
    });
  } catch (error) {
    console.error('[Document] Inspection report error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});