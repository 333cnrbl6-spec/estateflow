import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { title, description, pricing_structure, addon_pricing } = await req.json();

    const proposal = await base44.entities.PricingProposal.create({
      title,
      description,
      pricing_structure,
      addon_pricing,
      proposed_by: user.email,
      status: 'draft',
      votes: [],
      vote_result: {
        for: 0,
        against: 0,
        abstain: 0,
        total_eligible: 0,
        passed: false
      }
    });

    return Response.json({
      success: true,
      proposal_id: proposal.id,
      message: 'Pricing proposal created. Share with board for voting.'
    });

  } catch (error) {
    console.error('Error creating pricing proposal:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});