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
      tenant_id,
      payment_method_id,
      amount,
      currency = 'gbp',
      start_date,
      day_of_month = 1,
      property_id,
    } = await req.json();

    if (!tenant_id || !payment_method_id || !amount || !start_date) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const tenant = await base44.entities.Tenant.get(tenant_id);
    const property = property_id ? await base44.entities.Property.get(property_id) : null;

    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));

    // Create Stripe Customer if not exists
    let customerId = tenant.email;
    try {
      const existingCustomers = await stripe.customers.list({ email: tenant.email });
      if (existingCustomers.data.length > 0) {
        customerId = existingCustomers.data[0].id;
      } else {
        const customer = await stripe.customers.create({
          email: tenant.email,
          name: tenant.full_name,
          metadata: { tenant_id, property_id: property_id || '' },
        });
        customerId = customer.id;
      }
    } catch (e) {
      console.error('Stripe customer error:', e);
    }

    // Create Payment Method attachment to customer
    await stripe.paymentMethods.attach(payment_method_id, {
      customer: customerId,
    });

    // Set as default payment method
    await stripe.customers.update(customerId, {
      invoice_settings: {
        default_payment_method: payment_method_id,
      },
    });

    // Create Stripe Subscription Schedule for recurring payments
    const subscriptionSchedule = await stripe.subscriptionSchedules.create({
      customer: customerId,
      start_date: Math.floor(new Date(start_date).getTime() / 1000),
      end_behavior: 'release',
      phases: [{
        iterations: 120, // 10 years max
        interval: 'month',
        items: [{
          price_data: {
            currency,
            product_data: {
              name: `Monthly Rent - ${property?.name || 'Property'}`,
            },
            unit_amount: Math.round(amount * 100),
            recurring: {
              interval: 'month',
            },
          },
          quantity: 1,
        }],
      }],
      metadata: {
        tenant_id,
        property_id: property_id || '',
        amount: amount.toString(),
        day_of_month: day_of_month.toString(),
      },
    });

    // Create recurring payment record in database
    const recurringPayment = await base44.entities.RecurringPayment.create({
      tenant_id,
      property_id,
      stripe_customer_id: customerId,
      stripe_subscription_schedule_id: subscriptionSchedule.id,
      payment_method_id,
      amount,
      currency,
      day_of_month,
      start_date,
      status: 'active',
      next_payment_date: start_date,
      total_payments: 0,
      total_amount_paid: 0,
      last_payment_date: null,
      notes: `Recurring rent payment setup on ${new Date().toISOString().split('T')[0]}`,
    });

    // Send confirmation email
    const emailBody = `
Dear ${tenant.full_name},

Your recurring monthly rent payment has been successfully set up.

PAYMENT DETAILS
Amount: £${amount}/month
Start Date: ${new Date(start_date).toLocaleDateString('en-GB')}
Payment Day: ${day_of_month}${getDaySuffix(day_of_month)} of each month
Property: ${property?.name || 'Your Property'}
Payment Method: Card ending in ****

A payment confirmation email will be sent to you after each successful transaction.

You can cancel or modify this recurring payment at any time by contacting your property manager.

Thank you for setting up automatic payments.

Best regards,
Property Management Team
    `.trim();

    await base44.asServiceRole.integrations.Core.SendEmail({
      to: tenant.email,
      subject: `✅ Recurring Rent Payment Confirmed - £${amount}/month`,
      body: emailBody,
    });

    return Response.json({
      success: true,
      recurring_payment_id: recurringPayment.id,
      subscription_schedule_id: subscriptionSchedule.id,
      customer_id: customerId,
      next_payment_date: start_date,
      message: 'Recurring payment setup successfully. Confirmation email sent.',
    });

  } catch (error) {
    console.error('Recurring payment setup error:', error);
    return Response.json({
      success: false,
      error: error.message,
    }, { status: 500 });
  }
});

function getDaySuffix(day) {
  if (day > 3 && day < 21) return 'th';
  switch (day % 10) {
    case 1: return 'st';
    case 2: return 'nd';
    case 3: return 'rd';
    default: return 'th';
  }
}