import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { file_url, document_type, context = {} } = await req.json();

    if (!file_url) {
      return Response.json({ error: 'file_url is required' }, { status: 400 });
    }

    // Use claude_opus_4_6 for complex document analysis
    const { data } = await base44.integrations.Core.InvokeLLM({
      model: "claude_opus_4_6",
      prompt: `You are a UK property compliance expert. Analyse this uploaded document: ${file_url}

Document Type: ${document_type || 'Unknown'}
Context: ${JSON.stringify(context)}

Tasks:
1. Detect file type (pdf, docx, jpg, png, etc.)
2. Classify content category (contract/certificate/report/financial/legal/compliance/other)
3. Extract key fields relevant to ${document_type || 'property management'}
4. Validate against UK Housing Act 2004, Gas Safety, EPC, and deposit protection rules
5. Assess risk level and recommend actions

Output structured JSON with confidence scores.`,
      response_json_schema: {
        type: "object",
        properties: {
          file_type: { type: "string" },
          content_category: { type: "string" },
          extracted_fields: { type: "object" },
          compliance_check: {
            type: "object",
            properties: {
              housing_act_compliant: { type: "boolean" },
              gas_safety_valid: { type: "boolean" },
              epc_valid: { type: "boolean" },
              deposit_protected: { type: "boolean" }
            }
          },
          risk_level: { type: "string", enum: ["low", "medium", "high", "critical"] },
          action_required: { type: "string", enum: ["none", "review", "immediate", "block"] },
          auto_sort_destination: { type: "string" },
          confidence_score: { type: "number", minimum: 0, maximum: 1 },
          recommended_actions: { type: "array", items: { type: "string" } }
        },
        required: ["file_type", "content_category", "extracted_fields", "risk_level", "action_required", "confidence_score"]
      }
    });

    // Log to audit trail
    await base44.entities.AuditLog.create({
      action: "compliance_document_processed",
      user_email: user.email,
      entity_type: "Document",
      timestamp: new Date().toISOString(),
      changes: { document_type, risk_level: data.risk_level, auto_sort_destination: data.auto_sort_destination }
    });

    return Response.json({ data });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});