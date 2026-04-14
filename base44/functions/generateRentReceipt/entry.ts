import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { transaction_id } = await req.json();

    // Fetch transaction record
    const transaction = await base44.asServiceRole.entities.FinancialTransaction.get(transaction_id);
    if (!transaction) {
      return Response.json({ error: 'Transaction not found' }, { status: 404 });
    }

    // Fetch tenant and property
    const [tenant, property] = await Promise.all([
      base44.asServiceRole.entities.Tenant.get(transaction.tenant_id),
      base44.asServiceRole.entities.Property.get(transaction.property_id)
    ]);

    if (!tenant) {
      return Response.json({ error: 'Tenant not found' }, { status: 404 });
    }

    // Generate rent receipt using LLM
    const prompt = `Generate a professional UK rent receipt/payment confirmation with the following details:

Receipt Information:
- Receipt Number: ${transaction.id}
- Receipt Date: ${new Date(transaction.created_date).toLocaleDateString()}
- Payment Date: ${transaction.transaction_date}

Landlord/Agent Details:
- Company: ${property.owner_name || 'Property Management'}
- Address: ${property.address}
- Contact: ${property.contact_email || 'contact@property.com'}

Tenant Details:
- Name: ${tenant.full_name}
- Email: ${tenant.email}
- Address: ${property.address}

Payment Details:
- Amount: £${transaction.amount / 100}
- Payment Method: ${transaction.payment_method || 'Bank Transfer'}
- Payment Type: ${transaction.transaction_type}
- Rent Period: ${transaction.rent_period_start} to ${transaction.rent_period_end}
- Reference: ${transaction.reference}

Generate a formal, professional rent receipt that includes:
1. Receipt Header and Number
2. Date of Receipt
3. Landlord/Agent Information
4. Tenant Information
5. Payment Amount in words and figures
6. Payment Method
7. Rent Period Covered
8. Any Balance Due (if applicable)
9. Formal Sign-off and Company Details
10. Tax Information (if applicable)

Format as a professional document suitable for printing and filing.`;

    const receiptContent = await base44.integrations.Core.InvokeLLM({
      prompt,
      model: 'gpt_5'
    });

    // Save generated document
    const generatedDoc = await base44.asServiceRole.entities.GeneratedDocument.create({
      template_id: 'rent-receipt-001',
      template_code: 'RENT_RECEIPT',
      property_id: transaction.property_id,
      tenant_id: transaction.tenant_id,
      document_name: `Rent_Receipt_${tenant.full_name}_${transaction.transaction_date}.pdf`,
      document_type: 'Rent Receipt',
      generated_date: new Date().toISOString(),
      generated_by: user.email,
      data_used: {
        tenant_name: tenant.full_name,
        amount: transaction.amount,
        payment_date: transaction.transaction_date,
        rent_period: `${transaction.rent_period_start} to ${transaction.rent_period_end}`
      },
      document_url: '',
      status: 'draft'
    });

    // Send receipt via email to tenant
    await base44.asServiceRole.integrations.Core.SendEmail({
      to: tenant.email,
      subject: `Rent Receipt - £${transaction.amount / 100} - ${property.address}`,
      body: `
        <h2>Rent Payment Confirmation</h2>
        <p>Dear ${tenant.full_name},</p>
        <p>Thank you for your rent payment of <strong>£${transaction.amount / 100}</strong> received on ${transaction.transaction_date}.</p>
        <p><strong>Payment Details:</strong></p>
        <ul>
          <li>Receipt Number: ${transaction.id}</li>
          <li>Property: ${property.address}</li>
          <li>Payment Period: ${transaction.rent_period_start} to ${transaction.rent_period_end}</li>
          <li>Payment Method: ${transaction.payment_method || 'Bank Transfer'}</li>
        </ul>
        <p>Your receipt is attached to this email. Please keep it for your records.</p>
        <p>If you have any questions about your payment, please contact us.</p>
        <p>Best regards,<br/>Property Management Team</p>
      `
    });

    console.log(`[Document] Generated rent receipt ${generatedDoc.id} and sent to ${tenant.email}`);

    return Response.json({
      success: true,
      documentId: generatedDoc.id,
      receiptContent,
      emailSent: true
    });
  } catch (error) {
    console.error('[Document] Rent receipt error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});