/**
 * captureMarketingLead
 * Captures a prospect's details from the landing page demo flow.
 * Stores full Companies House intelligence, portfolio profile, pain points,
 * consent record and any uploaded file references — all legally captured
 * marketing data we're entitled to use for product development and sales.
 */
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

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

    if (!name || !email) {
      return Response.json({ error: 'Name and email required' }, { status: 400 });
    }

    if (!consent_given) {
      return Response.json({ error: 'Consent is required' }, { status: 400 });
    }

    // Score the lead based on what we know
    let score = 50;
    if (portfolio_size?.includes('500+')) score += 20;
    else if (portfolio_size?.includes('151')) score += 15;
    else if (portfolio_size?.includes('51')) score += 10;
    if (pain_points && pain_points.length > 0) score += 5;
    if (current_software && !current_software.includes('Nothing')) score += 10;
    if (demo_intelligence?.officers?.length > 0) score += 5;
    if (demo_intelligence?.files_uploaded?.length > 0) score += 10;
    if (marketing_consent) score += 5;
    score = Math.min(score, 100);

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
    const groupSummary = demo_intelligence?.all_companies?.length > 1
      ? `Group: ${demo_intelligence.all_companies.map(c => c.company_name).join(', ')}`
      : '';

    try {
      await base44.asServiceRole.integrations.Core.SendEmail({
        to: '333cnrbl6@gmail.com',
        from_name: 'Premiso Website',
        subject: `🔥 New ${score >= 75 ? 'HOT' : score >= 55 ? 'WARM' : 'COLD'} Lead (Score: ${score}): ${name} — ${company || 'unknown company'}`,
        body: `
A new prospect has completed the personalised demo flow on the Premiso landing page.

── CONTACT ────────────────────────────────
Name:          ${name}
Email:         ${email}
Phone:         ${phone || 'Not provided'}
Company:       ${company || 'Not provided'}
CH Number:     ${company_number || 'Not provided'}
${groupSummary ? `Group:         ${groupSummary}` : ''}

── PORTFOLIO ──────────────────────────────
Portfolio Size:   ${portfolio_size || 'Not provided'}
Property Types:   ${property_types || 'Not provided'}
Pain Points:      ${pain_points || 'None selected'}
Current Software: ${current_software || 'Not specified'}

── INTELLIGENCE ───────────────────────────
Officers/Directors: ${demo_intelligence?.officers?.map(o => `${o.name} (${o.role})`).join(', ') || 'None'}
Group Companies:    ${demo_intelligence?.all_companies?.length || 0} company/ies
Associated:         ${demo_intelligence?.associated_companies?.length || 0}
Files Uploaded:     ${demo_intelligence?.files_uploaded?.length || 0} file(s)
${demo_intelligence?.files_uploaded?.map(f => `  - ${f.name}: ${f.url}`).join('\n') || ''}

── CONSENT ────────────────────────────────
Terms Accepted:   ${consent_given ? 'YES' : 'NO'} at ${consent_timestamp || 'unknown'}
Marketing Opt-in: ${marketing_consent ? 'YES' : 'NO'}

── LEAD SCORE ─────────────────────────────
Score: ${score}/100  |  Tier: ${score >= 75 ? '🔥 HOT' : score >= 55 ? '⚡ WARM' : '❄ COLD'}

Lead ID: ${lead.id}

Log in to Premiso CRM to follow up → https://app.premiso.co.uk/crm
        `.trim(),
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
        body: `
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
        `.trim(),
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