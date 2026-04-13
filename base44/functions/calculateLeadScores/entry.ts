import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    // Get all sales leads
    const leads = await base44.entities.SalesLead.list();
    
    if (leads.length === 0) {
      return Response.json({ success: true, message: 'No leads to score', scored_count: 0 });
    }

    // Get recent sales listings and transactions for market context
    const listings = await base44.entities.SalesListing.list();
    const transactions = await base44.entities.SalesTransaction.list();

    // Calculate market velocity metrics
    const activeListings = listings.filter(l => ['active', 'under_offer'].includes(l.status));
    const avgDaysOnMarket = activeListings.length > 0 
      ? activeListings.reduce((sum, l) => sum + (l.viewing_count || 0), 0) / activeListings.length 
      : 30;

    const completedTransactions = transactions.filter(t => t.status === 'completed');
    const conversionRate = listings.length > 0 
      ? (completedTransactions.length / listings.length) * 100 
      : 15;

    // Score each lead using LLM analysis
    const scoredLeads = [];
    
    for (const lead of leads) {
      if (lead.status === 'converted' || lead.status === 'lost') {
        continue; // Skip already converted or lost leads
      }

      const scoringPrompt = `
You are an expert estate agent sales manager. Analyze this sales lead and calculate a completion probability score (0-100).

Lead Data:
- Type: ${lead.lead_type}
- Status: ${lead.status}
- Contact: ${lead.contact_name}
- Budget: £${lead.budget_min || 0} - £${lead.budget_max || 0}
- Property Type: ${lead.property_type || 'Not specified'}
- Location: ${lead.location_preference || 'Not specified'}
- Bedrooms: ${lead.bedrooms_min || 'Any'}
- Timescale: ${lead.timescale || 'Not specified'}
- Motivation: ${lead.motivation || 'Not specified'}
- Lead Score (current): ${lead.lead_score || 0}/100
- Last Contact: ${lead.last_contact_date || 'Never'}
- Next Follow-up: ${lead.next_follow_up_date || 'Not scheduled'}

Market Context:
- Average days on market: ${Math.round(avgDaysOnMarket)}
- Current conversion rate: ${conversionRate.toFixed(1)}%
- Active listings: ${activeListings.length}

Score based on these factors:
1. TIMESCALE URGENCY (25 points max):
   - immediate: 25 points
   - 1_month: 22 points
   - 3_months: 18 points
   - 6_months: 12 points
   - 12_months: 6 points
   - unsure: 3 points

2. MOTIVATION STRENGTH (25 points max):
   - Job relocation, chain-free, cash buyer: 22-25 points
   - Upsizing, downsizing, first time buyer: 15-20 points
   - Investment, "just looking": 5-12 points

3. FINANCIAL READINESS (20 points max):
   - Budget clearly defined and realistic: 15-20 points
   - Budget vague or unrealistic: 5-10 points
   - No budget specified: 0-5 points

4. ENGAGEMENT LEVEL (15 points max):
   - Recent contact + follow-up scheduled: 12-15 points
   - Recent contact, no follow-up: 8-10 points
   - Old contact (>30 days): 3-5 points
   - No contact yet: 0-2 points

5. PROPERTY MATCH (15 points max):
   - Clear property requirements matching available stock: 12-15 points
   - Vague requirements: 5-8 points
   - No requirements specified: 0-3 points

Return ONLY a JSON object with:
{
  "total_score": number (0-100),
  "score_breakdown": {
    "timescale": number,
    "motivation": number,
    "financial": number,
    "engagement": number,
    "property_match": number
  },
  "priority_tier": "hot"|"warm"|"cold",
  "recommended_action": string (specific next step),
  "completion_probability": string (e.g., "High - 75-85%", "Medium - 40-60%", "Low - 15-30%"),
  "risk_factors": [string],
  "positive_indicators": [string]
}
`;

      try {
        const scoring = await base44.asServiceRole.integrations.Core.InvokeLLM({
          prompt: scoringPrompt,
          add_context_from_internet: false,
          model: 'claude_sonnet_4_6',
          response_json_schema: {
            type: 'object',
            properties: {
              total_score: { type: 'number' },
              score_breakdown: {
                type: 'object',
                properties: {
                  timescale: { type: 'number' },
                  motivation: { type: 'number' },
                  financial: { type: 'number' },
                  engagement: { type: 'number' },
                  property_match: { type: 'number' }
                }
              },
              priority_tier: { type: 'string' },
              recommended_action: { type: 'string' },
              completion_probability: { type: 'string' },
              risk_factors: { type: 'array', items: { type: 'string' } },
              positive_indicators: { type: 'array', items: { type: 'string' } }
            }
          }
        });

        // Update the lead with scoring data
        const updatedLead = await base44.entities.SalesLead.update(lead.id, {
          lead_score: scoring.total_score,
          notes: lead.notes 
            ? `${lead.notes}\n\n[Scored: ${new Date().toLocaleDateString()}] Priority: ${scoring.priority_tier.toUpperCase()}. Action: ${scoring.recommended_action}`
            : `[Scored: ${new Date().toLocaleDateString()}] Priority: ${scoring.priority_tier.toUpperCase()}. Action: ${scoring.recommended_action}`,
          next_follow_up_date: scoring.recommended_action.includes('call') || scoring.recommended_action.includes('contact')
            ? new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
            : lead.next_follow_up_date
        });

        scoredLeads.push({
          lead_id: lead.id,
          contact_name: lead.contact_name,
          score: scoring.total_score,
          priority_tier: scoring.priority_tier,
          completion_probability: scoring.completion_probability,
          recommended_action: scoring.recommended_action,
          breakdown: scoring.score_breakdown,
          risk_factors: scoring.risk_factors,
          positive_indicators: scoring.positive_indicators
        });

      } catch (err) {
        console.error(`Failed to score lead ${lead.id}:`, err.message);
        scoredLeads.push({
          lead_id: lead.id,
          contact_name: lead.contact_name,
          score: lead.lead_score || 0,
          error: err.message
        });
      }
    }

    // Sort by score descending
    scoredLeads.sort((a, b) => b.score - a.score);

    return Response.json({
      success: true,
      scored_count: scoredLeads.length,
      hot_leads: scoredLeads.filter(l => l.priority_tier === 'hot').length,
      warm_leads: scoredLeads.filter(l => l.priority_tier === 'warm').length,
      cold_leads: scoredLeads.filter(l => l.priority_tier === 'cold').length,
      avg_score: Math.round(scoredLeads.reduce((sum, l) => sum + l.score, 0) / scoredLeads.length),
      leads: scoredLeads
    });

  } catch (error) {
    return Response.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
});