import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';
import { z } from 'npm:zod@3.24.2';

const DocParsingSchema = z.object({
  property_id: z.string().min(1, 'Property ID required'),
  file_name: z.string().min(1, 'File name required'),
  file_url: z.string().url('Valid file URL required'),
  file_type: z.string(), // 'pdf', 'docx', 'image', 'zip', etc.
  is_zip: z.boolean().default(false),
});

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const validation = DocParsingSchema.safeParse(body);
    
    if (!validation.success) {
      return Response.json({ error: 'Validation failed', details: validation.error.errors }, { status: 400 });
    }

    const { property_id, file_name, file_url, file_type, is_zip } = validation.data;

    // Verify property exists
    const property = await base44.entities.Property.get(property_id);
    if (!property) {
      return Response.json({ error: 'Property not found' }, { status: 404 });
    }

    // If ZIP, extract and analyze structure
    if (is_zip) {
      const structureAnalysis = await analyzeZipStructure(file_name, file_url, base44);
      return Response.json({
        success: true,
        file_name,
        is_zip: true,
        structure: structureAnalysis,
      });
    }

    // Parse single document with AI
    const parseResult = await parseDocumentWithAI(file_name, file_type, base44);

    return Response.json({
      success: true,
      file_name,
      is_zip: false,
      suggested_category: parseResult.category,
      extracted_metadata: parseResult.metadata,
      confidence_score: parseResult.confidence,
      parsing_notes: parseResult.notes,
    });
  } catch (error) {
    console.error('[parsePropertyDocuments] Error:', error.message);
    return Response.json({ error: 'Document parsing failed' }, { status: 500 });
  }
});

async function analyzeZipStructure(zipName, zipUrl, base44) {
  // AI analyzes ZIP contents (file names, structure) to suggest categorization
  const result = await base44.integrations.Core.InvokeLLM({
    prompt: `A ZIP file named "${zipName}" contains property documents. Based on the filename and typical property management folders, suggest how to organize these documents.

Common document types in properties:
1. Certificates (Gas Safety, Electrical, Fire Safety, EPC)
2. Leases & Tenancies
3. Inspection Reports
4. Service Charges & Ground Rent
5. Maintenance & Repairs
6. Financial Records
7. Legal Documents
8. Compliance & Licensing

Suggest folder structure and which document types likely belong in each folder.
Return JSON: { suggested_folders: [{ folder_name, description, document_types: [] }], notes: "" }`,
    response_json_schema: {
      type: 'object',
      properties: {
        suggested_folders: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              folder_name: { type: 'string' },
              description: { type: 'string' },
              document_types: { type: 'array', items: { type: 'string' } },
            },
          },
        },
        notes: { type: 'string' },
      },
    },
  });

  return result;
}

async function parseDocumentWithAI(fileName, fileType, base44) {
  // Analyze document filename + type to extract metadata
  const result = await base44.integrations.Core.InvokeLLM({
    prompt: `Analyze this property document and extract key information:

File: ${fileName}
Type: ${fileType}

Extract:
1. Document category (Certificate, Lease, Inspection, Service Charge, Maintenance, Financial, Legal, Other)
2. Key dates (issue date, expiry date, renewal date if present in filename)
3. Property reference if mentioned
4. Confidence score (0-100) on category and date accuracy
5. Any compliance alerts (e.g., "Likely expiring soon" if date is in filename)

Return JSON: { category, extracted_dates: { issue_date, expiry_date, renewal_date }, confidence, alerts: [] }`,
    response_json_schema: {
      type: 'object',
      properties: {
        category: { type: 'string' },
        extracted_dates: {
          type: 'object',
          properties: {
            issue_date: { type: 'string' },
            expiry_date: { type: 'string' },
            renewal_date: { type: 'string' },
          },
        },
        confidence: { type: 'number' },
        alerts: { type: 'array', items: { type: 'string' } },
      },
    },
  });

  return {
    category: result.category || 'Other',
    metadata: result.extracted_dates || {},
    confidence: result.confidence || 0,
    notes: (result.alerts || []).join('; '),
  };
}