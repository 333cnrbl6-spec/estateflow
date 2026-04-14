import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { transaction_id } = await req.json();

    // Fetch transaction
    const transaction = await base44.entities.FinancialTransaction.get(transaction_id);
    if (!transaction) {
      return Response.json({ error: 'Transaction not found' }, { status: 404 });
    }

    // Fetch tenant for receipt
    const tenant = await base44.entities.Tenant.get(transaction.tenant_id);
    if (!tenant) {
      return Response.json({ error: 'Tenant not found' }, { status: 404 });
    }

    // Fetch property
    const property = await base44.entities.Property.get(transaction.property_id);

    // Generate receipt HTML
    const receiptDate = new Date(transaction.transaction_date);
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Rent Receipt</title>
        <style>
          body { font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; color: #333; }
          .receipt-container { border: 2px solid #2563eb; border-radius: 8px; padding: 30px; background: #f9fafb; }
          .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #2563eb; padding-bottom: 20px; }
          .header h1 { margin: 0; color: #1e40af; font-size: 28px; }
          .receipt-number { color: #666; font-size: 12px; margin-top: 5px; }
          .section { margin-bottom: 25px; }
          .section-title { font-weight: bold; color: #1e40af; margin-bottom: 10px; font-size: 12px; text-transform: uppercase; }
          .row { display: flex; justify-content: space-between; padding: 8px 0; }
          .row.total { border-top: 2px solid #1e40af; border-bottom: 2px solid #1e40af; font-weight: bold; font-size: 18px; padding: 15px 0; margin: 20px 0; }
          .label { color: #666; }
          .value { font-weight: bold; }
          .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #666; font-size: 12px; }
          .payment-method { background: #dbeafe; padding: 10px; border-radius: 5px; margin: 10px 0; }
        </style>
      </head>
      <body>
        <div class="receipt-container">
          <div class="header">
            <h1>RENT PAYMENT RECEIPT</h1>
            <p class="receipt-number">Reference: ${transaction.reference || transaction.id.slice(0, 16).toUpperCase()}</p>
          </div>

          <div class="section">
            <div class="section-title">Receipt Details</div>
            <div class="row">
              <span class="label">Date:</span>
              <span class="value">${receiptDate.toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
            </div>
            <div class="row">
              <span class="label">Period:</span>
              <span class="value">${receiptDate.toLocaleDateString('en-GB', { year: 'numeric', month: 'long' })}</span>
            </div>
          </div>

          <div class="section">
            <div class="section-title">Tenant Information</div>
            <div class="row">
              <span class="label">Name:</span>
              <span class="value">${tenant.full_name}</span>
            </div>
            <div class="row">
              <span class="label">Email:</span>
              <span class="value">${tenant.email}</span>
            </div>
            ${tenant.phone ? `
              <div class="row">
                <span class="label">Phone:</span>
                <span class="value">${tenant.phone}</span>
              </div>
            ` : ''}
          </div>

          <div class="section">
            <div class="section-title">Property Information</div>
            <div class="row">
              <span class="label">Address:</span>
              <span class="value">${property?.address || 'N/A'}</span>
            </div>
          </div>

          <div class="section">
            <div class="section-title">Payment Details</div>
            <div class="row total">
              <span class="label">Amount Paid:</span>
              <span class="value">£${(transaction.amount || 0).toLocaleString('en-GB', { minimumFractionDigits: 2 })}</span>
            </div>
            ${transaction.payment_method ? `
              <div class="payment-method">
                <strong>Payment Method:</strong> ${transaction.payment_method.charAt(0).toUpperCase() + transaction.payment_method.slice(1)}
              </div>
            ` : ''}
            ${transaction.notes ? `
              <div class="row">
                <span class="label">Notes:</span>
                <span class="value">${transaction.notes}</span>
              </div>
            ` : ''}
          </div>

          <div class="footer">
            <p><strong>✓ Payment Received</strong></p>
            <p>This receipt confirms that the above payment was received and processed.</p>
            <p style="margin-top: 20px; color: #999; font-size: 11px;">Generated: ${new Date().toLocaleDateString('en-GB')}</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return Response.json({
      success: true,
      html_content: htmlContent,
      receipt_url: null // Would be generated by PDF service
    });
  } catch (error) {
    console.error('Error generating receipt:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});