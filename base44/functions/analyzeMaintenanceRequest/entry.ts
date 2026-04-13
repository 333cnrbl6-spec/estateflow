import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { description, photo_urls = [] } = await req.json();

    if (!description) {
      return Response.json({ error: 'Description required' }, { status: 400 });
    }

    // Build prompt for AI analysis
    const analysisPrompt = `You are a property maintenance AI triage expert. Analyze this maintenance request and provide structured recommendations.

Maintenance Request:
Description: ${description}
${photo_urls.length > 0 ? `Photos attached: ${photo_urls.length} image(s)` : ''}

Analyze and respond with JSON containing:
1. "category" - one of: plumbing, electrical, structural, roofing, decorating, landscaping, cleaning, fire_safety, lift, security, general, other
2. "priority" - one of: emergency, urgent, standard, low
3. "is_urgent" - boolean (true if emergency or urgent)
4. "urgency_reason" - why this priority level (max 50 words)
5. "first_response_actions" - array of 2-3 immediate tenant actions before contractor arrives (e.g. "turn off water", "evacuate building", "use fire extinguisher")
6. "safety_risks" - array of identified safety hazards
7. "estimated_response_time" - "immediate", "within 24 hours", "within 3 days", or "non-urgent"
8. "contractor_specialties_needed" - array of needed expertise
9. "confidence_score" - 0-100 (how confident in this categorization)
10. "additional_questions" - array of 1-2 clarifying questions to ask tenant if confidence < 80

Return ONLY valid JSON, no other text.`;

    const analysisResult = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: analysisPrompt,
      file_urls: photo_urls,
      response_json_schema: {
        type: 'object',
        properties: {
          category: { type: 'string' },
          priority: { type: 'string' },
          is_urgent: { type: 'boolean' },
          urgency_reason: { type: 'string' },
          first_response_actions: { type: 'array', items: { type: 'string' } },
          safety_risks: { type: 'array', items: { type: 'string' } },
          estimated_response_time: { type: 'string' },
          contractor_specialties_needed: { type: 'array', items: { type: 'string' } },
          confidence_score: { type: 'number' },
          additional_questions: { type: 'array', items: { type: 'string' } },
        }
      }
    });

    return Response.json({
      success: true,
      analysis: analysisResult,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});