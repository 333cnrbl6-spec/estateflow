import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';
import Stripe from 'npm:stripe';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));

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

    // Fetch transaction details
    const transaction = await base44.entities.FinancialTransaction.list();
    const txn = transaction.find(t => t.id === transaction_id);

    if (!txn) {
      return Response.json({ error: 'Transaction not found' }, { status: 404 });
    }

    if (txn.status === 'paid') {
      return Response.json({ error: 'This payment has already been made' }, { status: 400 });
    }

    // Get tenant and property details
    const tenant = await base44.entities.Tenant.list();
    const tenantData = tenant.find(t => t.id === txn.tenant_id);

    const properties = await base44.entities.Property.list();
    const propertyData = properties.find(p => p.id === txn.property_id);

    // Create Stripe PaymentIntent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to pence
      currency,
      payment_method: payment_method_id,
      confirm: true,
      automatic_payment_methods: { enabled: true },
      description: `Rent payment - ${propertyData?.name || 'Property'} - ${tenantData?.full_name || 'Tenant'}`,
      metadata: {
        transaction_id: txn.id,
        tenant_id: txn.tenant_id,
        property_id: txn.property_id,
      },
    });

    if (paymentIntent.status !== 'succeeded') {
      return Response.json({
        success: false,
        error: 'Payment failed',
        status: paymentIntent.status,
      }, { status: 400 });
    }

    const paidDate = new Date().toISOString().split('T')[0];

    // Update transaction status to paid
    await base44.entities.FinancialTransaction.update(txn.id, {
      status: 'paid',
      paid_date: paidDate,
      reference: paymentIntent.id,
      notes: `Paid via Stripe on ${paidDate}`,
    });

    // Generate receipt document
    const receiptContent = generateReceipt({
      transaction: txn,
      tenant: tenantData,
      property: propertyData,
      paymentIntent,
      paidDate,
    });

    const receipt = await base44.entities.Document.create({
      title: `Rent Payment Receipt - ${propertyData?.name || 'Property'} - ${paidDate}`,
      document_type: 'rent_statement',
      content: receiptContent,
      property_id: txn.property_id,
      tenant_id: txn.tenant_id,
      status: 'filed',
      generated_date: paidDate,
      source: 'generated',
      tags: ['rent', 'payment', 'receipt'],
      notes: `Stripe Payment ID: ${paymentIntent.id}`,
    });

    // Create tenant notification
    await base44.entities.TenantNotification.create({
      tenant_id: txn.tenant_id,
      title: `✅ Rent Payment Received - £${amount}`,
      message: `Your rent payment of £${amount} has been successfully processed for ${propertyData?.name || 'your property'}.`,
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

function generateReceipt({ transaction, tenant, property, paymentIntent, paidDate }) {
  return `
RENT PAYMENT RECEIPT
${new Date(paidDate).toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' })}

PROPERTY DETAILS
Property: ${property?.name || 'N/A'}
Address: ${property?.address_line_1 || ''} ${property?.city || ''} ${property?.postcode || ''}

TENANT DETAILS
Name: ${tenant?.full_name || 'N/A'}
Email: ${tenant?.email || 'N/A'}

PAYMENT DETAILS
Amount Paid: £${transaction?.amount || 0}
Reference: ${transaction?.reference || 'N/A'}
Payment Method: Stripe
Transaction Date: ${paidDate}
Stripe ID: ${paymentIntent?.id || 'N/A'}

PAYMENT CONFIRMATION
Receipt ID: ${paymentIntent?.id}
Status: CONFIRMED
Received Date: ${paidDate}

This receipt confirms that payment has been successfully received and processed.
For your records, please retain this receipt.

If you have any questions, please contact your property manager.
  `.trim();
}