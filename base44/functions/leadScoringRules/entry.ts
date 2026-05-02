import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// Updated lead scoring for Phase 1-4 positioning
const calculateLeadScore = (lead) => {
  let score = 0;

  // Company fit (40 points)
  if (lead.companyType === 'letting_agent') score += 15;
  if (lead.companyType === 'block_manager') score += 20; // Higher value
  if (lead.companyType === 'hmo_operator') score += 18;
  if (lead.companyType === 'property_group') score += 20;

  // Portfolio size (30 points)
  if (lead.portfolioSize >= 200) score += 30;
  else if (lead.portfolioSize >= 100) score += 20;
  else if (lead.portfolioSize >= 50) score += 10;
  else if (lead.portfolioSize >= 10) score += 5;

  // Engagement (20 points)
  if (lead.visitedCompliancePage) score += 8;
  if (lead.visitedAutomationPage) score += 8;
  if (lead.watchedDemoVideo) score += 6;
  if (lead.downloadedBrochure) score += 4;
  if (lead.bookedDemo) score += 10;

  // Pain points (10 points) — Phase 1-4 aligned
  if (lead.hasCertificateIssues) score += 5; // Compliance Intelligence
  if (lead.hasManualWorkflows) score += 4; // Workflow Automation
  if (lead.usesMultipleSystems) score += 3; // Integration Marketplace
  if (lead.teamSize > 5) score += 3; // Real-Time Collaboration

  return Math.min(100, Math.max(0, score));
};

const getRecommendedAction = (score) => {
  if (score >= 80) return 'IMMEDIATE_SALES_CALL';
  if (score >= 60) return 'SEND_DEMO_INVITE';
  if (score >= 40) return 'NURTURE_SEQUENCE';
  return 'AWARENESS_CONTENT';
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { leadId, leadData } = await req.json();

    const score = calculateLeadScore(leadData);
    const action = getRecommendedAction(score);

    // Update lead with score
    if (leadId) {
      await base44.entities.SalesLead.update(leadId, {
        leadScore: score,
        scoredAt: new Date().toISOString(),
        recommendedAction: action
      });
    }

    return Response.json({
      leadId,
      score,
      action,
      recommendation: action === 'IMMEDIATE_SALES_CALL' 
        ? 'High-value block manager/large portfolio — call within 24 hours'
        : action === 'SEND_DEMO_INVITE'
        ? 'Qualified lead — send personalized demo invite with Phase 1-4 overview'
        : action === 'NURTURE_SEQUENCE'
        ? 'Interested lead — send education emails (compliance intelligence, workflow automation)'
        : 'Early stage — share landing page & Phase 1-4 product overview'
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});