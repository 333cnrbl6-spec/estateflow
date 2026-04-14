import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { tenant_id, property_id, unit_id, start_date, end_date, monthly_rent } = await req.json();

    // Fetch tenant and property data
    const [tenant, property, unit] = await Promise.all([
      base44.asServiceRole.entities.Tenant.get(tenant_id),
      base44.asServiceRole.entities.Property.get(property_id),
      unit_id ? base44.asServiceRole.entities.Unit.get(unit_id) : null
    ]);

    if (!tenant || !property) {
      return Response.json({ error: 'Tenant or property not found' }, { status: 404 });
    }

    // Generate lease agreement using LLM
    const prompt = `Generate a professional UK Assured Shorthold Tenancy (AST) agreement with the following details:

Landlord/Agent Information:
- Company: ${property.owner_name || 'Property Management Company'}
- Address: ${property.address}

Tenant Information:
- Name: ${tenant.full_name}
- Email: ${tenant.email}
- Phone: ${tenant.phone}

Property Details:
- Address: ${property.address}
- Unit: ${unit?.name || 'N/A'}
- Furnished Status: ${unit?.furnished_status || 'Unfurnished'}

Tenancy Terms:
- Start Date: ${start_date}
- End Date: ${end_date}
- Monthly Rent: £${monthly_rent}
- Deposit Amount: £${tenant.deposit_amount || monthly_rent * 5}
- Deposit Scheme: ${tenant.deposit_scheme || 'DPS'}

Include standard AST clauses for:
- Rent payment terms and methods
- Maintenance responsibilities
- Tenant obligations (keeping clean, not causing damage)
- Landlord responsibilities
- Deposit protection information
- Right to rent verification
- Council tax responsibility
- Utilities responsibility

Format as a professional legal document with clear sections and numbering.`;

    const leaseContent = await base44.integrations.Core.InvokeLLM({
      prompt,
      model: 'gpt_5'
    });

    // Save generated document
    const generatedDoc = await base44.asServiceRole.entities.GeneratedDocument.create({
      template_id: 'ast-001',
      template_code: 'AST',
      property_id,
      unit_id,
      tenant_id,
      document_name: `Lease_Agreement_${tenant.full_name}_${new Date().getTime()}.pdf`,
      document_type: 'Lease Agreement',
      generated_date: new Date().toISOString(),
      generated_by: user.email,
      data_used: {
        tenant_name: tenant.full_name,
        property_address: property.address,
        monthly_rent,
        start_date,
        end_date
      },
      document_url: '', // Would be set after PDF generation
      status: 'draft'
    });

    console.log(`[Document] Generated lease agreement ${generatedDoc.id}`);

    // Send to tenant for review
    await base44.asServiceRole.integrations.Core.SendEmail({
      to: tenant.email,
      subject: `Your Lease Agreement - ${property.address}`,
      body: `
        <h2>Your Lease Agreement</h2>
        <p>Dear ${tenant.full_name},</p>
        <p>Your tenancy agreement for ${property.address} has been prepared and is ready for your review.</p>
        <p>Please review the terms carefully. If you have any questions, please contact your property manager.</p>
        <p>Once you're satisfied with the terms, we'll arrange for signatures from both parties.</p>
      `
    });

    return Response.json({
      success: true,
      documentId: generatedDoc.id,
      content: leaseContent
    });
  } catch (error) {
    console.error('[Document] Lease generation error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});