/**
 * Email templates for marketing lead capture and sales notifications
 */

export function buildSalesTeamEmail(lead, score) {
  const { name, email, phone, company, company_number, portfolio_size, property_types, pain_points, current_software, demo_intelligence } = lead;
  
  const groupSummary = demo_intelligence?.all_companies?.length > 1
    ? `Group: ${demo_intelligence.all_companies.map(c => c.company_name).join(', ')}`
    : '';

  const getTierLabel = (s) => s >= 75 ? 'HOT' : s >= 55 ? 'WARM' : 'COLD';
  const getTierEmoji = (s) => s >= 75 ? '🔥' : s >= 55 ? '⚡' : '❄';

  return `
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
Terms Accepted:   ${lead.consent_given ? 'YES' : 'NO'} at ${lead.consent_timestamp || 'unknown'}
Marketing Opt-in: ${lead.marketing_consent ? 'YES' : 'NO'}

── LEAD SCORE ─────────────────────────────
Score: ${score}/100  |  Tier: ${getTierEmoji(score)} ${getTierLabel(score)}

Lead ID: ${lead.leadId}

Log in to Premiso CRM to follow up → https://app.premiso.co.uk/crm
  `.trim();
}

export function buildProspectConfirmationEmail(name, company, marketing_consent) {
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