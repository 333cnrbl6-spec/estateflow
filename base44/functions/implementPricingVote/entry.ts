import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (user?.role !== 'admin') {
      return Response.json({ error: 'Admin only' }, { status: 403 });
    }

    const { proposal_id } = await req.json();
    
    const proposal = await base44.asServiceRole.entities.PricingProposal.filter({ id: proposal_id });
    if (!proposal || proposal.length === 0) {
      return Response.json({ error: 'Proposal not found' }, { status: 404 });
    }

    const p = proposal[0];
    const voteResult = p.vote_result || { for: 0, against: 0 };

    // Majority rule: for > against
    const passed = voteResult.for > voteResult.against;

    if (!passed) {
      return Response.json({
        success: false,
        message: 'Proposal rejected',
        votes: voteResult
      });
    }

    // Update proposal status
    await base44.asServiceRole.entities.PricingProposal.update(proposal_id, {
      status: 'approved',
      implemented_date: new Date().toISOString()
    });

    // Save to pricing config (could be env var or settings)
    console.log('Pricing implemented:', {
      structure: p.pricing_structure,
      addons: p.addon_pricing
    });

    return Response.json({
      success: true,
      message: 'Pricing approved and ready to deploy',
      votes: voteResult,
      pricing: p.pricing_structure,
      addons: p.addon_pricing
    });

  } catch (error) {
    console.error('Error implementing pricing vote:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});