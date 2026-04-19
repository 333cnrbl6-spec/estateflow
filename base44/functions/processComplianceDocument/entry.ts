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

    // Use claude_opus_4_6 for complex document analysis - Premiso UK Property Compliance
    const { data } = await base44.integrations.Core.InvokeLLM({
      model: "claude_opus_4_6",
      prompt: `You are a UK property compliance expert specialising in the Housing Act 2004, Renters' Rights Act 2026, and related regulations.

Analyse this uploaded document: ${file_url}
Document Type: ${document_type || 'Unknown'}
Context: ${JSON.stringify(context)}

COMPLIANCE FRAMEWORK TO VALIDATE AGAINST:
- Housing Act 2004 (Section 21 validity, HMO licensing)
- Gas Safety (Installation and Use) Regulations 1998 (annual CP12 certificates)
- Electrical Safety Standards in the Private Rented Sector (England) Regulations 2020 (EICR every 5 years)
- Energy Efficiency (Private Rented Property) (England and Wales) Regulations 2015 (EPC minimum E, rising to C by 2028)
- Housing (Fitness for Human Habitation) Act 2018
- Tenant Fees Act 2019
- Deposit Protection: Housing Act 2004 Sections 212-215 (must protect within 30 days, serve prescribed information)
- Right to Rent: Immigration Act 2014
- Smoke and Carbon Monoxide Alarm (England) Regulations 2015
- HMO Licensing: Housing Act 2004 Part 2 (mandatory for 5+ persons, additional licensing may apply)

TASKS:
1. Detect file type and format
2. Classify: contract/certificate/report/financial/legal/compliance/inspection/notice/other
3. Extract domain-specific fields based on document type
4. Validate against the compliance framework above
5. Identify missing certificates, expired documents, or non-compliant terms
6. Assess risk level considering: legal liability, financial penalties, possession validity
7. Recommend specific actions with regulatory references

OUTPUT: Structured JSON with confidence scores and auto-sort destination.`,
      response_json_schema: {
        type: "object",
        properties: {
          file_type: { type: "string" },
          content_category: { 
            type: "string", 
            enum: ["tenancy_agreement", "gas_safety_certificate", "electrical_certificate", "epc", "deposit_protection", "right_to_rent", "hmo_license", "inspection_report", "section_21_notice", "section_8_notice", "financial_statement", "compliance_document", "other"]
          },
          extracted_fields: { type: "object" },
          compliance_check: {
            type: "object",
            properties: {
              housing_act_2004_compliant: { type: "boolean" },
              gas_safety_valid: { type: "boolean" },
              electrical_certificate_valid: { type: "boolean" },
              epc_rating: { type: "string" },
              epc_valid_until: { type: "string" },
              deposit_protected: { type: "boolean" },
              prescribed_information_served: { type: "boolean" },
              right_to_rent_completed: { type: "boolean" },
              hmo_license_required: { type: "boolean" },
              hmo_license_valid: { type: "boolean" },
              smoke_alarm_compliant: { type: "boolean" },
              co_alarm_compliant: { type: "boolean" },
              section_21_valid: { type: "boolean" },
              tenant_fees_act_compliant: { type: "boolean" }
            }
          },
          missing_requirements: { type: "array", items: { type: "string" } },
          expired_certificates: { type: "array", items: { type: "string" } },
          risk_level: { type: "string", enum: ["low", "medium", "high", "critical"] },
          risk_factors: { type: "array", items: { type: "string" } },
          action_required: { type: "string", enum: ["none", "review", "immediate", "block"] },
          auto_sort_destination: { type: "string" },
          confidence_score: { type: "number", minimum: 0, maximum: 1 },
          recommended_actions: { type: "array", items: { type: "string" } },
          regulatory_references: { type: "array", items: { type: "string" } }
        },
        required: ["file_type", "content_category", "extracted_fields", "compliance_check", "risk_level", "action_required", "confidence_score"]
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