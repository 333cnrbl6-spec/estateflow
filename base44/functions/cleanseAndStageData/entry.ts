import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = await req.json();
    const {
      import_session_id,
      company_id,
      extracted_records,
      deduplication_analysis,
      deduplication_decisions,
    } = payload;

    if (!extracted_records || extracted_records.length === 0) {
      return Response.json({ error: 'No records to stage' }, { status: 400 });
    }

    // AI-powered cleansing
    const cleansedRecords = await base44.integrations.Core.InvokeLLM({
      prompt: `You are a data cleansing expert for property management. Clean and standardize these records:

${JSON.stringify(extracted_records, null, 2)}

Deduplication decisions: ${JSON.stringify(deduplication_decisions || {})}

For EACH record, return:
- cleaned_data: standardized record with corrected formatting
- entity_type: property | unit | tenant | landlord | contractor | financial_transaction | maintenance_order | service_charge | nominal
- quality_score: 0-100 confidence this is good data
- cleansing_applied: array of { rule, field, original_value, cleansed_value }
- validation_warnings: array of non-critical issues
- validation_errors: array of critical issues that block import

Cleansing rules:
1. Phone: Format as +44XXXXXXXXXX
2. Email: Lowercase, remove whitespace, validate format
3. Names: Title case, remove extra spaces
4. Addresses: Capitalize properly, format consistently
5. Dates: ISO format YYYY-MM-DD
6. Postcodes: Uppercase with space (A12 3BC)
7. Currency: Remove symbols, parse to numbers
8. Booleans: Convert yes/no/true/false to boolean
9. Duplicates: If approved in decisions, mark for merge
10. Missing required fields: Add validation error`,
      response_json_schema: {
        type: 'object',
        properties: {
          records: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                cleaned_data: { type: 'object' },
                entity_type: { type: 'string' },
                quality_score: { type: 'number' },
                cleansing_applied: { type: 'array' },
                validation_warnings: { type: 'array', items: { type: 'string' } },
                validation_errors: { type: 'array', items: { type: 'string' } },
              },
            },
          },
        },
      },
    });

    // Create staging records
    const stagingRecords = (cleansedRecords.records || []).map((r, idx) => ({
      import_session_id,
      company_id,
      entity_type: r.entity_type,
      source_file: extracted_records[idx]?.source_file || 'unknown',
      staged_data: r.cleaned_data,
      original_data: extracted_records[idx],
      cleansing_applied: r.cleansing_applied || [],
      quality_score: r.quality_score || 0,
      validation_warnings: r.validation_warnings || [],
      validation_errors: r.validation_errors || [],
      status: r.validation_errors?.length > 0 ? 'failed' : 'staged',
    }));

    // Bulk create staging records
    const created = await base44.entities.DataImportStaging.bulkCreate(stagingRecords);

    // Count by status
    const stats = {
      staged: created.filter(r => r.status === 'staged').length,
      failed: created.filter(r => r.status === 'failed').length,
      total: created.length,
      avg_quality_score: (created.reduce((sum, r) => sum + (r.quality_score || 0), 0) / created.length).toFixed(1),
    };

    return Response.json({
      success: true,
      message: `Cleansed and staged ${created.length} records`,
      staging_records_created: created.length,
      import_session_id,
      stats,
      sample_records: created.slice(0, 3),
    });
  } catch (error) {
    console.error('Cleanse error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});