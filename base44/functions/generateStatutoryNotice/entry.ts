import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

const NOTICE_TEMPLATES = {
  s20_consultation: {
    title: 'Notice under Section 20 Landlord and Tenant Act 1985',
    getContent: (data) => `
NOTICE UNDER SECTION 20 LANDLORD AND TENANT ACT 1985

To: The Leaseholders at ${data.property_name}

Date: ${data.notice_date}
Reference: ${data.notice_reference}

IMPORTANT - THIS IS A STATUTORY NOTICE

This notice is given to you under section 20 of the Landlord and Tenant Act 1985, as amended by the Commonhold and Leasehold Reform Act 2002.

PROPOSED COSTS FOR SERVICE CHARGE ITEMS:

${data.cost_items.map(item => `
${item.category.toUpperCase()}
Estimated Cost: £${item.estimated_cost.toLocaleString()}
Brief Description: ${item.description}
`).join('\n')}

TOTAL ESTIMATED COST: £${data.total_estimated_cost.toLocaleString()}

YOUR RIGHTS

You have the right to make representations about these proposals within 30 days of receiving this notice. Any representations must be in writing and delivered or sent to:

${data.managing_agent_address}

CONSULTATION PERIOD DEADLINE: ${data.consultation_deadline}

If you have any questions about these proposals, please contact:
${data.managing_agent_contact}
Phone: ${data.managing_agent_phone}

This notice is given in accordance with legislation and your lease terms.
    `,
  },
  rtm_claim: {
    title: 'Notice of Right to Manage - RTM Claim Notice',
    getContent: (data) => `
NOTICE OF RIGHT TO MANAGE
Commonhold and Leasehold Reform Act 2002, Section 71

To: The Freeholder/Landlord

Date: ${data.notice_date}
Reference: ${data.notice_reference}

Property: ${data.property_name}

NOTICE IS HEREBY GIVEN

The leaseholders of the above property hereby serve notice on you claiming the Right to Manage (RTM) in accordance with sections 71-113 of the Commonhold and Leasehold Reform Act 2002.

DETAILS OF THE RTM COMPANY:
Company Name: ${data.company_name}
Company Number: ${data.company_number}
Registered Office: ${data.company_address}

LEASEHOLDER PARTICIPATION:
Total Leaseholders: ${data.total_leaseholders}
Participating Leaseholders: ${data.participating_leaseholders}
Percentage: ${data.percentage_participation}%

PROPOSED ACQUISITION DATE: ${data.proposed_acquisition_date}

YOUR RIGHTS AND OBLIGATIONS

Within 30 days of receiving this notice, you may serve a counternotice if you consider the claim is invalid. The 30-day period for serving a counternotice will expire on: ${data.counternotice_deadline}

If no valid counternotice is served, the RTM company shall be entitled to acquire the right to manage the building and the costs of its management on the date specified above (or 90 days after service of this notice, whichever is later).

For further information, contact the RTM company representatives:
${data.rtm_contact}
Phone: ${data.rtm_phone}

    `,
  },
  s21_notice: {
    title: 'Notice to Quit - Section 21 Housing Act 1988',
    getContent: (data) => `
NOTICE TO QUIT

To: ${data.tenant_name}
At: ${data.property_address}

Date: ${data.notice_date}
Reference: ${data.notice_reference}

IMPORTANT - THIS IS A LEGAL NOTICE

This notice requires you to vacate the property by 4pm on ${data.termination_date}.

REASON FOR NOTICE:
${data.reason}

YOUR RIGHTS

You have the right to challenge this notice if:
- The notice period is less than 2 months
- The notice does not comply with prescribed information requirements
- The deposit was not properly protected

If you believe this notice is invalid, you should seek legal advice immediately.

For further information, contact:
${data.managing_agent_name}
${data.managing_agent_address}
Phone: ${data.managing_agent_phone}

    `,
  },
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { notice_type, property_id, data } = await req.json();

    if (!notice_type || !NOTICE_TEMPLATES[notice_type]) {
      return Response.json({ error: 'Invalid notice type' }, { status: 400 });
    }

    const template = NOTICE_TEMPLATES[notice_type];
    const content = template.getContent(data);

    // Create document record
    const documentRecord = await base44.entities.Document.create({
      title: template.title,
      type: notice_type,
      property_id: property_id,
      content: content,
      status: 'draft',
      created_by: user.email,
      generated_date: new Date().toISOString().split('T')[0],
    });

    return Response.json({
      success: true,
      document_id: documentRecord.id,
      title: template.title,
      content: content,
      type: notice_type,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});