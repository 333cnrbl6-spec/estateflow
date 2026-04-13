import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = await req.json();
    const { classified_files, data_gleans, data_types } = payload;

    if (!classified_files || classified_files.length === 0) {
      return Response.json({ error: 'No files provided' }, { status: 400 });
    }

    // Extract all raw data from classified files
    const extractedData = classified_files
      .filter(f => f.classification?.extracted_records)
      .flatMap(f => f.classification.extracted_records || []);

    if (extractedData.length === 0) {
      return Response.json({
        success: true,
        analysis: {
          total_records: 0,
          duplicates_found: 0,
          quality_issues: [],
          merge_suggestions: [],
        },
      });
    }

    // AI analysis for duplicates and data quality
    const analysis = await base44.integrations.Core.InvokeLLM({
      prompt: `Analyze the following extracted property management records for:
1. Potential duplicates (same entity appearing multiple times with slight variations)
2. Data quality issues (missing required fields, inconsistent formats, obvious errors)
3. Merge candidates (records that should be combined)
4. Data standardization recommendations

Records to analyze:
${JSON.stringify(extractedData, null, 2)}

Return structured analysis with:
- total_records: count
- duplicates_found: count
- duplicate_groups: array of { group_id, type, records (indices), confidence (0-100), reason }
- merge_suggestions: array of { merge_id, type, from_indices, to_index, action, expected_result }
- quality_issues: array of { record_index, field, issue, severity (low/medium/high), fix_suggestion }
- data_standardization: array of { field, current_patterns, recommended_format, sample_fixes }

Only include HIGH confidence duplicates (>80%) in merge_suggestions.`,
      response_json_schema: {
        type: 'object',
        properties: {
          total_records: { type: 'number' },
          duplicates_found: { type: 'number' },
          duplicate_groups: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                group_id: { type: 'string' },
                type: { type: 'string' },
                records: { type: 'array', items: { type: 'number' } },
                confidence: { type: 'number' },
                reason: { type: 'string' },
              },
            },
          },
          merge_suggestions: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                merge_id: { type: 'string' },
                type: { type: 'string' },
                from_indices: { type: 'array', items: { type: 'number' } },
                to_index: { type: 'number' },
                action: { type: 'string', enum: ['merge', 'deduplicate', 'combine_addresses'] },
                expected_result: { type: 'string' },
              },
            },
          },
          quality_issues: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                record_index: { type: 'number' },
                field: { type: 'string' },
                issue: { type: 'string' },
                severity: { type: 'string', enum: ['low', 'medium', 'high'] },
                fix_suggestion: { type: 'string' },
              },
            },
          },
          data_standardization: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                field: { type: 'string' },
                current_patterns: { type: 'array', items: { type: 'string' } },
                recommended_format: { type: 'string' },
              },
            },
          },
        },
      },
    });

    return Response.json({
      success: true,
      analysis: {
        ...analysis,
        extracted_records: extractedData.length,
        sources_analyzed: classified_files.map(f => f.name),
      },
    });
  } catch (error) {
    console.error('Analysis error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});