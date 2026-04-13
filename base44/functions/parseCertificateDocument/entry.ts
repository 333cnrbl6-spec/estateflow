import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { file_url } = await req.json();
    if (!file_url) return Response.json({ error: 'file_url is required' }, { status: 400 });

    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `You are a UK property compliance document analyser.
Examine this document image/file and extract all relevant compliance information.
Documents may include: Gas Safety Certificate (CP12), EICR (Electrical Installation Condition Report), EPC (Energy Performance Certificate), Fire Risk Assessment, Asbestos Survey, Legionella Risk Assessment, PAT Testing Certificate, Boiler Service Report, Lift Safety Certificate.

Extract and return:
- certificate_type: one of gas_safety | eicr | fire_safety | asbestos | legionella | pat_testing | boiler_service | lift_safety | other
- issue_date: ISO date (YYYY-MM-DD) or null
- expiry_date: ISO date (YYYY-MM-DD) or null
- certificate_number: reference number printed on the document or null
- issuing_body: name of the engineer, company or certification body
- property_address: full address as printed on the document or null
- status: valid | expired | failed | unknown — based on outcome field if present
- outcome_notes: any pass/fail result or advisory notes (max 200 chars)
- confidence: high | medium | low — your confidence in the extraction

If any field cannot be found, use null. Never guess expiry dates.`,
      file_urls: [file_url],
      response_json_schema: {
        type: 'object',
        properties: {
          certificate_type: { type: 'string' },
          issue_date: { type: 'string' },
          expiry_date: { type: 'string' },
          certificate_number: { type: 'string' },
          issuing_body: { type: 'string' },
          property_address: { type: 'string' },
          status: { type: 'string' },
          outcome_notes: { type: 'string' },
          confidence: { type: 'string' },
        }
      }
    });

    return Response.json({ success: true, extracted: result });
  } catch (error) {
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
});