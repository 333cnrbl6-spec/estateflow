import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';
import { z } from 'npm:zod@3.24.2';

const LeadMatchingSchema = z.object({
  lead_id: z.string().min(1, 'Lead ID required'),
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

    const validation = LeadMatchingSchema.safeParse(body);
    if (!validation.success) {
      const errors = validation.error.errors.map(e => `${e.path.join('.')}: ${e.message}`);
      return Response.json({ error: 'Validation failed', details: errors }, { status: 400 });
    }

    const { lead_id } = validation.data;

    // Fetch the lead
    const lead = await base44.entities.SalesLead.get(lead_id);
    if (!lead) {
      return Response.json({ error: 'Lead not found' }, { status: 404 });
    }

    // Fetch all active properties and listings
    const properties = await base44.entities.Property.list('-updated_date', 100);
    const listings = await base44.entities.SalesListing.filter({ status: 'active' }, '-listed_date', 100);

    // Build property inventory summary for LLM
    const inventorySummary = listings
      .slice(0, 20)
      .map(l => ({
        property_name: l.property_name || 'N/A',
        address: l.address || 'N/A',
        type: l.property_type || 'unknown',
        bedrooms: l.bedrooms,
        bathrooms: l.bathrooms,
        price: l.asking_price,
        status: l.status,
        description: l.description,
      }));

    // Use LLM to analyze and score matches
    const analysisPrompt = `
You are a real estate matching expert. Analyze this lead and match them to the best properties from our active inventory.

LEAD PROFILE:
- Name: ${lead.contact_name}
- Type: ${lead.lead_type} (buyer, seller, landlord, tenant)
- Budget: ${lead.budget_min ? `£${lead.budget_min} - £${lead.budget_max}` : 'Not specified'}
- Property Type: ${lead.property_type || 'Any'}
- Location: ${lead.location_preference || 'Any'}
- Bedrooms Min: ${lead.bedrooms_min || 'No minimum'}
- Motivation: ${lead.motivation || 'Not specified'}
- Timescale: ${lead.timescale || 'Unknown'}
- Tenure: ${lead.tenure_preference || 'Any'}

ACTIVE INVENTORY (${inventorySummary.length} properties):
${JSON.stringify(inventorySummary, null, 2)}

Score each property on a scale of 1-100 based on:
1. Price alignment with lead budget (20%)
2. Property type match (20%)
3. Location preference match (20%)
4. Size/bedroom match (20%)
5. Overall fit with lead motivation (20%)

Return a JSON array of the top 5 matches (or fewer if not available) with this structure:
{
  "matches": [
    {
      "property_name": "string",
      "address": "string",
      "score": 85,
      "match_reasons": ["reason1", "reason2"],
      "missing_fit": ["potential_issue1"]
    }
  ],
  "summary": "Brief analysis of lead and market fit"
}
`;

    const llmResult = await base44.integrations.Core.InvokeLLM({
      prompt: analysisPrompt,
      response_json_schema: {
        type: 'object',
        properties: {
          matches: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                property_name: { type: 'string' },
                address: { type: 'string' },
                score: { type: 'number' },
                match_reasons: { type: 'array', items: { type: 'string' } },
                missing_fit: { type: 'array', items: { type: 'string' } },
              },
            },
          },
          summary: { type: 'string' },
        },
      },
    });

    return Response.json({
      success: true,
      lead_id,
      lead_name: lead.contact_name,
      lead_type: lead.lead_type,
      matches: llmResult.matches || [],
      analysis_summary: llmResult.summary,
      inventory_scanned: inventorySummary.length,
    });
  } catch (error) {
    console.error('Error in lead matching:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});