import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';
import Stripe from 'npm:stripe';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Verify this is called by admin/scheduled task
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { recurring_payment_id } = await req.json();

    if (!recurring_payment_id) {
      return Response.json({ error: 'Missing recurring_payment_id' }, { status: 400 });
    }

    const recurringPayment = await base44.entities.RecurringPayment.get(recurring_payment_id);

    if (!recurringPayment || recurringPayment.status !== 'active') {
      return Response.json({ error: 'Invalid or inactive recurring payment' }, { status: 400 });
    }

    const tenant = await base44.entities.Tenant.get(recurringPayment.tenant_id);
    const property = recurringPayment.property_id ? await base44.entities.Property.get(recurringPayment.property_id) : null;

    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));

    // Create payment intent using saved payment method
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(recurringPayment.amount * 100),
      currency: recurringPayment.currency || 'gbp',
      customer: recurringPayment.stripe_customer_id,
      payment_method: recurringPayment.payment_method_id,
      off_session: true,
      confirm: true,
      automatic_payment_methods: { enabled: true },
      description: `Monthly rent payment - ${property?.name || 'Property'} - ${tenant?.full_name}`,
      metadata: {
        recurring_payment_id: recurringPayment.id,
        tenant_id: tenant.id,
        property_id: property?.id || '',
        payment_type: 'recurring_rent',
      },
    });

    const paidDate = new Date().toISOString().split('T')[0];

    if (paymentIntent.status === 'requires_action') {
      // 3D Secure required - notify tenant
      await base44.entities.TenantNotification.create({
        tenant_id: tenant.id,
        title: `⚠️ Action Required: Rent Payment - £${recurringPayment.amount}`,
        message: `Your automatic rent payment requires additional verification. Please log in to complete the payment.`,
        notification_type: 'urgent',
        is_read: false,
        sent_date: new Date().toISOString(),
      });

      return Response.json({
        success: false,
        requires_action: true,
        payment_intent_id: paymentIntent.id,
        message: '3D Secure authentication required. Tenant notified.',
      });
    }

    if (paymentIntent.status !== 'succeeded') {
      // Update recurring payment status
      await base44.entities.RecurringPayment.update(recurringPayment.id, {
        status: 'failed',
        notes: `Payment failed on ${paidDate}: ${paymentIntent.status}`,
      });

      return Response.json({
        success: false,
        error: 'Payment failed',
        status: paymentIntent.status,
      }, { status: 400 });
    }

    // Create financial transaction record
    const transaction = await base44.entities.FinancialTransaction.create({
      description: `Monthly Rent Payment (Auto) - ${property?.name || 'Property'}`,
      transaction_type: 'rent_payment',
      amount: recurringPayment.amount,
      direction: 'income',
      status: 'paid',
      paid_date: paidDate,
      due_date: paidDate,
      property_id: property?.id,
      unit_id: null,
      tenant_id: tenant.id,
      company_id: null,
      reference: paymentIntent.id,
      notes: `Automatic recurring payment via Stripe. ID: ${paymentIntent.id}`,
    });

    // Update recurring payment record
    await base44.entities.RecurringPayment.update(recurringPayment.id, {
      last_payment_date: paidDate,
      next_payment_date: calculateNextPaymentDate(recurringPayment.next_payment_date, recurringPayment.day_of_month),
      total_payments: (recurringPayment.total_payments || 0) + 1,
      total_amount_paid: (recurringPayment.total_amount_paid || 0) + recurringPayment.amount,
      notes: `Last payment: ${paidDate}. Total paid: £${(recurringPayment.total_amount_paid || 0) + recurringPayment.amount}`,
    });

    // Generate receipt
    const receiptContent = `
RECURRING RENT PAYMENT RECEIPT
${new Date(paidDate).toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' })}

PROPERTY: ${property?.name || 'N/A'}
Address: ${[property?.address_line_1, property?.city, property?.postcode].filter(Boolean).join(' ') || 'N/A'}

TENANT: ${tenant?.full_name || 'N/A'}
Email: ${tenant?.email || 'N/A'}

PAYMENT DETAILS
Amount Paid: £${recurringPayment.amount}
Payment Type: AUTOMATIC RECURRING PAYMENT
Reference: ${paymentIntent.id}
Payment Method: Saved Card
Transaction Date: ${paidDate}
Payment Number: ${(recurringPayment.total_payments || 0) + 1}

STATUS: CONFIRMED ✓

This is an automatic monthly rent payment. You can cancel anytime by contacting your property manager.
    `.trim();

    const receipt = await base44.entities.Document.create({
      title: `Recurring Rent Receipt - ${property?.name || 'Property'} - ${paidDate}`,
      document_type: 'rent_statement',
      content: receiptContent,
      property_id: property?.id,
      tenant_id: tenant.id,
      status: 'filed',
      generated_date: paidDate,
      source: 'generated',
      tags: ['rent', 'recurring', 'automatic', 'receipt'],
      notes: `Recurring Payment ID: ${recurringPayment.id}. Stripe: ${paymentIntent.id}`,
    });

    // Send email confirmation
    const emailBody = `
Dear ${tenant.full_name},

Your automatic monthly rent payment has been successfully processed.

PAYMENT CONFIRMATION
Amount: £${recurringPayment.amount}
Date: ${new Date(paidDate).toLocaleDateString('en-GB')}
Property: ${property?.name || 'Your Property'}
Payment Method: Saved Card
Reference: ${paymentIntent.id}

Your next automatic payment is scheduled for: ${calculateNextPaymentDate(paidDate, recurringPayment.day_of_month)}

A receipt has been generated and is available in your Documents section.

Thank you for using automatic payments.

Best regards,
Property Management Team
    `.trim();

    await base44.asServiceRole.integrations.Core.SendEmail({
      to: tenant.email,
      subject: `✅ Rent Payment Received - £${recurringPayment.amount} - ${new Date(paidDate).toLocaleDateString('en-GB')}`,
      body: emailBody,
    });

    // Send notification
    await base44.entities.TenantNotification.create({
      tenant_id: tenant.id,
      title: `✅ Rent Payment Successful - £${recurringPayment.amount}`,
      message: `Your automatic rent payment has been processed. Receipt available in Documents.`,
      notification_type: 'success',
      is_read: false,
      sent_date: new Date().toISOString(),
      notes: `receipt:${receipt.id}`,
    });

    return Response.json({
      success: true,
      payment_id: paymentIntent.id,
      transaction_id: transaction.id,
      receipt_id: receipt.id,
      amount: recurringPayment.amount,
      paid_date: paidDate,
      next_payment_date: calculateNextPaymentDate(paidDate, recurringPayment.day_of_month),
      message: 'Recurring payment processed successfully. Email confirmation sent.',
    });

  } catch (error) {
    console.error('Recurring payment processing error:', error);
    return Response.json({
      success: false,
      error: error.message,
    }, { status: 500 });
  }
});

function calculateNextPaymentDate(currentDateStr, dayOfMonth) {
  const currentDate = new Date(currentDateStr);
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  
  // Set to next month
  const nextMonth = month === 11 ? 0 : month + 1;
  const nextYear = month === 11 ? year + 1 : year;
  
  // Set to specified day
  const nextPayment = new Date(nextYear, nextMonth, dayOfMonth);
  
  return nextPayment.toISOString().split('T')[0];
}