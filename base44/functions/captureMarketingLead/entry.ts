import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();

    const {
      name, email, phone, company,
      portfolio_size, property_types, current_software,
      demo_type, notes
    } = body;

    if (!name || !email) {
      return Response.json({ error: 'Name and email required' }, { status: 400 });
    }

    // Create sales lead
    const lead = await base44.asServiceRole.entities.SalesLead.create({
      contact_name: name,
      email,
      phone: phone || '',
      company_name: company || '',
      source: 'landing_page',
      status: 'new',
      notes: `Portfolio: ${portfolio_size || 'unknown'} | Types: ${property_types || 'unknown'} | Current software: ${current_software || 'unknown'} | Demo: ${demo_type || 'slideshow'} | Notes: ${notes || ''}`,
      lead_score: 50,
    });

    // Notify sales lead routing email
    // TODO: Change to domain-based email at launch
    try {
      await base44.asServiceRole.integrations.Core.SendEmail({
        to: '333cnrbl6@gmail.com',
        from_name: 'Premiso Website',
        subject: `New Lead: ${name} from ${company || 'unknown company'}`,
        body: `
A new prospect has registered interest via the Premiso landing page.

Name: ${name}
Email: ${email}
Phone: ${phone || 'Not provided'}
Company: ${company || 'Not provided'}
Portfolio Size: ${portfolio_size || 'Not provided'}
Property Types: ${property_types || 'Not provided'}
Current Software: ${current_software || 'Not provided'}
Demo Type Chosen: ${demo_type || 'Slideshow'}
Notes: ${notes || 'None'}

Lead ID: ${lead.id}

Log in to Premiso CRM to follow up.
        `.trim(),
      });
    } catch (emailErr) {
      console.error('Email notification failed:', emailErr.message);
    }

    // Send confirmation to prospect
    try {
      await base44.asServiceRole.integrations.Core.SendEmail({
        to: email,
        from_name: 'Premiso',
        subject: 'Thanks for your interest in Premiso',
        body: `
Hi ${name},

Thank you for your interest in Premiso — the all-in-one property management platform built for modern letting agents and block managers.

We've received your details and a member of our team will be in touch within 1 business day.

In the meantime, you can explore your personalised demo at any time by returning to our website.

Best regards,
The Premiso Team

— 
PLACEHOLDER: Update this email signature with domain, phone and company details before launch.
        `.trim(),
      });
    } catch (emailErr) {
      console.error('Confirmation email failed:', emailErr.message);
    }

    return Response.json({ success: true, leadId: lead.id });
  } catch (error) {
    console.error('Lead capture error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});