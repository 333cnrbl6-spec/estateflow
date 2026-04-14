# Stripe Subscription Setup Guide

## Overview
This guide walks you through configuring Stripe for subscription billing on Premiso.

## 1. Stripe Account & API Keys

### Get Your Keys
1. Log in to [Stripe Dashboard](https://dashboard.stripe.com)
2. Navigate to **Developers** → **API Keys**
3. Copy your **Publishable Key** and **Secret Key**

### Environment Variables
Add these to your Base44 app secrets/environment:

```
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_xxxx...
STRIPE_SECRET_KEY=sk_test_xxxx...
STRIPE_WEBHOOK_SECRET=whsec_xxxx...
APP_URL=https://app.premiso.co.uk (or your domain)
```

## 2. Create Products & Prices in Stripe

### Products
Create 4 products in Stripe Dashboard (Products → Add Product):

| Product | Description |
|---------|-------------|
| **Lite** | Basic property management (1-2 properties) |
| **Starter** | Growing agencies (1-5 properties) |
| **Professional** | Mid-size agencies (6-25 properties) |
| **Enterprise** | Large groups & block management (26+) |

### Prices (Recurring)
For each product, create 2 recurring prices:

**Lite:**
- Monthly: £49 (bill monthly)
- Annual: £490 (bill yearly)

**Starter:**
- Monthly: £79 (bill monthly)
- Annual: £790 (bill yearly)

**Professional:**
- Monthly: £249 (bill monthly)
- Annual: £2,490 (bill yearly)

**Enterprise:**
- Monthly: £899 (bill monthly)
- Annual: £8,990 (bill yearly)

### Record Price IDs
After creating prices, note the **Price IDs** and add to environment:

```
REACT_APP_STRIPE_LITE_PRODUCT=prod_xxxx
REACT_APP_STRIPE_LITE_MONTHLY=price_xxxx
REACT_APP_STRIPE_LITE_ANNUAL=price_xxxx

REACT_APP_STRIPE_STARTER_PRODUCT=prod_xxxx
REACT_APP_STRIPE_STARTER_MONTHLY=price_xxxx
REACT_APP_STRIPE_STARTER_ANNUAL=price_xxxx

REACT_APP_STRIPE_PROFESSIONAL_PRODUCT=prod_xxxx
REACT_APP_STRIPE_PROFESSIONAL_MONTHLY=price_xxxx
REACT_APP_STRIPE_PROFESSIONAL_ANNUAL=price_xxxx

REACT_APP_STRIPE_ENTERPRISE_PRODUCT=prod_xxxx
REACT_APP_STRIPE_ENTERPRISE_MONTHLY=price_xxxx
REACT_APP_STRIPE_ENTERPRISE_ANNUAL=price_xxxx
```

## 3. Webhook Configuration

### Create Webhook Endpoint
1. Go to **Developers** → **Webhooks**
2. Click **Add endpoint**
3. URL: `https://your-app.herokuapp.com/api/webhooks/stripe` (replace with your domain)
4. Events to listen for:
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`

### Copy Webhook Secret
After creating the webhook, copy the **Signing Secret** and add to environment:

```
STRIPE_WEBHOOK_SECRET=whsec_xxxx...
```

## 4. Test Mode

### Testing Payments
Use Stripe's test cards:
- **Success:** 4242 4242 4242 4242 (CVC: any 3 digits, Exp: any future date)
- **Decline:** 4000 0000 0000 0002

### Test Webhook
Use the Stripe CLI to forward webhook events:

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

Then use test card above to trigger events.

## 5. User Entity Updates

Ensure your User entity has these fields to track subscriptions:

```json
{
  "subscription_tier": "string (lite|starter|professional|enterprise)",
  "subscription_status": "string (trialing|active|past_due|canceled|unpaid)",
  "subscription_id": "string (Stripe subscription ID)",
  "is_founder": "boolean",
  "subscription_end_date": "string (ISO date)"
}
```

## 6. Frontend Integration

### Pricing Page
Navigate to `/billing` to see the pricing tiers and checkout flow.

### Components
- `PricingPage` — Main pricing display
- `PricingTierCard` — Individual tier card
- `SubscriptionCheckout` — Checkout flow with Stripe session creation

## 7. Production Checklist

- [ ] Switch Stripe keys from test to live
- [ ] Update webhook URL to production domain
- [ ] Test full subscription flow with live card
- [ ] Verify webhook events in Stripe dashboard
- [ ] Set up email confirmations for subscription events
- [ ] Document refund policy
- [ ] Create billing FAQ page
- [ ] Set up Stripe customer portal for self-service management

## Support & Troubleshooting

### Common Issues

**"Missing priceId" error:**
- Ensure all REACT_APP_STRIPE_* environment variables are set
- Price IDs must be valid (start with `price_`)

**Webhook not triggering:**
- Check webhook secret is correct
- Verify endpoint URL is publicly accessible
- Test with Stripe CLI locally first

**Payment declined in checkout:**
- Use test card: 4000 0000 0000 0002 (in test mode)
- Verify currency is GBP

For help, contact Stripe Support: https://support.stripe.com