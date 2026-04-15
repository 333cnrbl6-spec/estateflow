import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';
import { z } from 'npm:zod@3.24.2';

const AnalysisSchema = z.object({
  file_urls: z.array(z.string()).min(1, 'At least one file required'),
  scan_type: z.enum(['property', 'tenant', 'financial', 'certificate', 'all']).default('all'),
});

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let body;
    try {
      body = await req.json();
    } catch {
      return Response.json({ error: 'Invalid JSON' }, { status: 400 });
    }

    const validation = AnalysisSchema.safeParse(body);
    if (!validation.success) {
      return Response.json({ error: 'Validation failed', details: validation.error.errors }, { status: 400 });
    }

    const { file_urls, scan_type } = validation.data;

    // Use LLM to analyze files
    const prompt = `Analyze these uploaded files and identify property management data.
    
File URLs: ${file_urls.join(', ')}

For each file, determine:
1. Data category (property_info, tenant_data, financial_records, certificates, other)
2. Entity mapping (which Premiso entities this could populate: Property, Tenant, Unit, FinancialTransaction, GasSafetyCertificate, etc.)
3. Confidence score (0-100)
4. Suggested fields and sample data if identifiable
5. Any warnings or data quality issues

Focus on: ${scan_type === 'all' ? 'all categories' : `${scan_type} data`}

Return as JSON with structure:
{
  "discovered_files": [
    {
      "file_name": "string",
      "category": "string",
      "confidence": number,
      "suggested_entity": "string",
      "sample_fields": { "field_name": "description" },
      "data_quality_notes": "string"
    }
  ],
  "summary": {
    "total_files": number,
    "categories_found": ["string"],
    "recommended_import_order": ["entity_name"],
    "missing_data_categories": ["string"]
  }
}`;

    const result = await base44.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: 'object',
        properties: {
          discovered_files: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                file_name: { type: 'string' },
                category: { type: 'string' },
                confidence: { type: 'number' },
                suggested_entity: { type: 'string' },
                sample_fields: { type: 'object' },
                data_quality_notes: { type: 'string' },
              },
            },
          },
          summary: {
            type: 'object',
            properties: {
              total_files: { type: 'number' },
              categories_found: { type: 'array', items: { type: 'string' } },
              recommended_import_order: { type: 'array', items: { type: 'string' } },
              missing_data_categories: { type: 'array', items: { type: 'string' } },
            },
          },
        },
      },
    });

    return Response.json({
      success: true,
      analysis: result,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[Data Discovery] Error:', error.message);
    return Response.json({ error: 'Analysis failed. Please try again.' }, { status: 500 });
  }
});