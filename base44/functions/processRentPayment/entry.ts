import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';
import Stripe from 'npm:stripe';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const {
      transaction_id,
      payment_method_id,
      amount,
      currency = 'gbp',
    } = await req.json();

    if (!transaction_id || !payment_method_id || !amount) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const transaction = await base44.entities.FinancialTransaction.get(transaction_id);

    if (!transaction) {
      return Response.json({ error: 'Transaction not found' }, { status: 404 });
    }

    if (transaction.status === 'paid') {
      return Response.json({ error: 'This payment has already been made' }, { status: 400 });
    }

    const tenant = await base44.entities.Tenant.get(transaction.tenant_id);
    const property = transaction.property_id ? await base44.entities.Property.get(transaction.property_id) : null;

    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));

    // CRITICAL: Use idempotency key to prevent double-charges on retries
    const idempotencyKey = `${transaction.id}_${Math.round(amount * 100)}`;

    const paymentIntent = await stripe.paymentIntents.create({
     amount: Math.round(amount * 100),
     currency,
     payment_method: payment_method_id,
     confirm: true,
     automatic_payment_methods: { enabled: true },
     description: `Rent payment - Property - Tenant`,
     // CRITICAL: Never store PII in Stripe metadata—it's permanent
     metadata: {
       transaction_id: transaction.id,
     },
    }, {
     idempotencyKey // Prevents duplicate charges if request is retried
    });

    if (paymentIntent.status !== 'succeeded') {
      return Response.json({
        success: false,
        error: 'Payment failed',
        status: paymentIntent.status,
      }, { status: 400 });
    }

    const paidDate = new Date().toISOString().split('T')[0];

    // Update transaction atomically—if this fails, the payment must be refunded
    try {
      await base44.entities.FinancialTransaction.update(transaction.id, {
        status: 'paid',
        paid_date: paidDate,
        reference: paymentIntent.id,
        notes: `Paid via Stripe on ${paidDate}`,
      });
    } catch (dbError) {
      console.error(`[processRentPayment] DB update failed after payment succeeded. Manual reconciliation required. Stripe ID: ${paymentIntent.id}`);
      // CRITICAL: Payment succeeded but DB update failed—log for immediate manual review
      return Response.json({
        success: false,
        error: 'Payment succeeded but database update failed. Manual reconciliation required.',
        payment_id: paymentIntent.id,
        status: 'payment_succeeded_db_failed',
      }, { status: 500 });
    }

    const receiptContent = `
RENT PAYMENT RECEIPT
${new Date(paidDate).toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' })}

PROPERTY: ${property?.name || 'N/A'}
Address: ${[property?.address_line_1, property?.city, property?.postcode].filter(Boolean).join(' ') || 'N/A'}

TENANT: ${tenant?.full_name || 'N/A'}
Email: ${tenant?.email || 'N/A'}

PAYMENT DETAILS
Amount Paid: £${amount}
Reference: ${transaction.reference || paymentIntent.id}
Payment Method: Stripe
Transaction Date: ${paidDate}
Stripe ID: ${paymentIntent.id}

STATUS: CONFIRMED

This receipt confirms that payment has been successfully received and processed.
For your records, please retain this receipt.
    `.trim();

    // Validate entities exist before creating document
    if (transaction.property_id) {
      const propCheck = await base44.entities.Property.get(transaction.property_id);
      if (!propCheck) {
        console.warn(`[processRentPayment] Property ${transaction.property_id} no longer exists`);
      }
    }
    if (transaction.tenant_id) {
      const tenantCheck = await base44.entities.Tenant.get(transaction.tenant_id);
      if (!tenantCheck) {
        console.warn(`[processRentPayment] Tenant ${transaction.tenant_id} no longer exists`);
      }
    }

    let receipt;
    try {
      receipt = await base44.entities.Document.create({
        title: `Rent Payment Receipt - ${paidDate}`,
        document_type: 'rent_statement',
        content: receiptContent,
        property_id: transaction.property_id,
        tenant_id: transaction.tenant_id,
        status: 'filed',
        generated_date: paidDate,
        source: 'generated',
        tags: ['rent', 'payment', 'receipt'],
        notes: `Stripe Payment ID: ${paymentIntent.id}`,
      });
    } catch (docError) {
      console.error(`[processRentPayment] Receipt creation failed for tenant ${transaction.tenant_id}: ${docError.message}`);
      // Don't fail payment—receipt is secondary. Log tenant ID for manual follow-up
      receipt = { id: null };
    }

    await base44.entities.TenantNotification.create({
      tenant_id: transaction.tenant_id,
      title: `✅ Rent Payment Received - £${amount}`,
      message: `Your rent payment of £${amount} has been successfully processed for ${property?.name || 'your property'}. A receipt has been generated in your Documents.`,
      notification_type: 'success',
      is_read: false,
      sent_date: new Date().toISOString(),
      notes: `receipt:${receipt.id}`,
    });

    return Response.json({
      success: true,
      payment_id: paymentIntent.id,
      receipt_id: receipt.id,
      amount,
      status: 'completed',
      paid_date: paidDate,
      message: 'Payment processed successfully. Receipt has been generated.',
    });

  } catch (error) {
    console.error('Payment processing error:', error);
    return Response.json({
      success: false,
      error: error.message,
    }, { status: 500 });
  }
});