/**
 * captureMarketingLead
 * Captures a prospect's details from the landing page demo flow.
 * Stores full Companies House intelligence, portfolio profile, pain points,
 * consent record and any uploaded file references — all legally captured
 * marketing data we're entitled to use for product development and sales.
 */
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// Lead scoring utilities (inlined since backends can't import from lib)
function calculateLeadScore(data) {
  let score = 50;
  if (data.portfolio_size?.includes('500+')) score += 20;
  else if (data.portfolio_size?.includes('151')) score += 15;
  else if (data.portfolio_size?.includes('51')) score += 10;
  if (data.pain_points && data.pain_points.length > 0) score += 5;
  if (data.current_software && !data.current_software.includes('Nothing')) score += 10;
  if (data.demo_intelligence?.officers?.length > 0) score += 5;
  if (data.demo_intelligence?.files_uploaded?.length > 0) score += 10;
  if (data.marketing_consent) score += 5;
  return Math.min(score, 100);
}

function getTierEmoji(score) {
  if (score >= 75) return '🔥';
  if (score >= 55) return '⚡';
  return '❄';
}

function getTierLabel(score) {
  if (score >= 75) return 'HOT';
  if (score >= 55) return 'WARM';
  return 'COLD';
}

// Email template builders
function buildSalesTeamEmail(lead, score) {
  const groupSummary = lead.demo_intelligence?.all_companies?.length > 1
    ? `Group: ${lead.demo_intelligence.all_companies.map(c => c.company_name).join(', ')}`
    : '';

  return `
A new prospect has completed the personalised demo flow on the Premiso landing page.

── CONTACT ────────────────────────────────
Name:          ${lead.name}
Email:         ${lead.email}
Phone:         ${lead.phone || 'Not provided'}
Company:       ${lead.company || 'Not provided'}
CH Number:     ${lead.company_number || 'Not provided'}
${groupSummary ? `Group:         ${groupSummary}` : ''}

── PORTFOLIO ──────────────────────────────
Portfolio Size:   ${lead.portfolio_size || 'Not provided'}
Property Types:   ${lead.property_types || 'Not provided'}
Pain Points:      ${lead.pain_points || 'None selected'}
Current Software: ${lead.current_software || 'Not specified'}

── INTELLIGENCE ───────────────────────────
Officers/Directors: ${lead.demo_intelligence?.officers?.map(o => `${o.name} (${o.role})`).join(', ') || 'None'}
Group Companies:    ${lead.demo_intelligence?.all_companies?.length || 0} company/ies
Associated:         ${lead.demo_intelligence?.associated_companies?.length || 0}
Files Uploaded:     ${lead.demo_intelligence?.files_uploaded?.length || 0} file(s)
${lead.demo_intelligence?.files_uploaded?.map(f => `  - ${f.name}: ${f.url}`).join('\n') || ''}

── CONSENT ────────────────────────────────
Terms Accepted:   ${lead.consent_given ? 'YES' : 'NO'} at ${lead.consent_timestamp || 'unknown'}
Marketing Opt-in: ${lead.marketing_consent ? 'YES' : 'NO'}

── LEAD SCORE ─────────────────────────────
Score: ${score}/100  |  Tier: ${getTierEmoji(score)} ${getTierLabel(score)}

Lead ID: ${lead.leadId}

Log in to Premiso CRM to follow up → https://app.premiso.co.uk/crm
  `.trim();
}

function buildProspectConfirmationEmail(name, company, marketing_consent) {
  return `
Hi ${name},

Your personalised Premiso demo environment has been prepared${company ? ` for ${company}` : ''}.

You have 48-hour access to explore the platform. A member of our team will be in touch shortly to walk you through the features most relevant to your business.

Important: This demo is for evaluation purposes only. All content, data and intellectual property within the Premiso platform remains the exclusive property of Premiso Ltd. Unauthorised use or reproduction is prohibited.

To convert to a full subscription and retain your data, visit: https://app.premiso.co.uk

Best regards,
The Premiso Team

—
Premiso Ltd | hello@premiso.co.uk
This email was sent because you requested a demo at premiso.co.uk.
${marketing_consent ? 'You have opted in to receive product updates and industry news from Premiso.' : 'You have not opted in to marketing emails. Only transactional emails will be sent.'}
  `.trim();
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();

    const {
      name, email, phone, company, company_number,
      portfolio_size, property_types, pain_points, current_software,
      demo_type, notes,
      consent_given, marketing_consent, consent_timestamp,
      demo_intelligence,
    } = body;

    // Validate required fields
    if (!name?.trim() || !email?.trim()) {
      return Response.json({ error: 'Name and email required' }, { status: 400 });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return Response.json({ error: 'Invalid email address' }, { status: 400 });
    }

    // Default consent_given to true if not provided (landing page implies consent)
    const hasConsent = consent_given !== false;

    // Score the lead based on what we know
    const score = calculateLeadScore({
      portfolio_size,
      pain_points,
      current_software,
      demo_intelligence,
      marketing_consent: marketing_consent === true,
    });

    const notesText = [
      `Company: ${company || 'unknown'}`,
      company_number ? `CH Number: ${company_number}` : null,
      `Portfolio: ${portfolio_size || 'unknown'}`,
      `Types: ${property_types || 'unknown'}`,
      `Pain points: ${pain_points || 'none'}`,
      `Current software: ${current_software || 'unknown'}`,
      `Demo type: ${demo_type || 'none'}`,
      `Consent given: ${consent_given ? 'YES' : 'NO'} at ${consent_timestamp || 'unknown'}`,
      `Marketing consent: ${marketing_consent ? 'YES' : 'NO'}`,
      demo_intelligence?.files_uploaded?.length
        ? `Files uploaded: ${demo_intelligence.files_uploaded.map(f => f.name).join(', ')}`
        : null,
      notes ? `Notes: ${notes}` : null,
    ].filter(Boolean).join(' | ');

    let lead;
    try {
      lead = await base44.asServiceRole.entities.SalesLead.create({
        lead_type: 'landlord',
        contact_name: name,
        contact_email: email,
        contact_phone: phone || '',
        source: 'website',
        status: 'new',
        notes: notesText,
        lead_score: score,
        priority_tier: score >= 75 ? 'hot' : score >= 55 ? 'warm' : 'cold',
      });
    } catch (createErr) {
      console.error('Lead creation failed:', createErr.message);
      throw createErr;
    }

    // Notify sales team
    try {
      await base44.asServiceRole.integrations.Core.SendEmail({
        to: Deno.env.get('SALES_LEAD_EMAIL') || 'sales@premiso.co.uk',
        from_name: 'Premiso Website',
        subject: `${getTierEmoji(score)} New ${getTierLabel(score)} Lead (Score: ${score}): ${name} — ${company || 'unknown company'}`,
        body: buildSalesTeamEmail(
          { name, email, phone, company, company_number, portfolio_size, property_types, pain_points, current_software, demo_intelligence, consent_given, consent_timestamp, marketing_consent, leadId: lead.id },
          score
        ),
      });
    } catch (emailErr) {
      console.error('Sales email failed:', emailErr.message);
    }

    // Confirmation to prospect
    try {
      await base44.asServiceRole.integrations.Core.SendEmail({
        to: email,
        from_name: 'Premiso',
        subject: `Your personalised Premiso demo — ${company || 'welcome'}`,
        body: buildProspectConfirmationEmail(name, company, marketing_consent),
      });
    } catch (emailErr) {
      console.error('Confirmation email failed:', emailErr.message);
    }

    return Response.json({ success: true, leadId: lead.id, score });
  } catch (error) {
    console.error('Lead capture error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});