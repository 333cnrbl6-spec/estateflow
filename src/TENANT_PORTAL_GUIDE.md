# Tenant Portal - Self-Service Feature Guide

## Overview

The Tenant Portal is a comprehensive self-service platform that allows tenants to independently manage their tenancy, reducing administrative burden on property managers while improving tenant experience.

## Features

### 1. **Lease & Property Details** ✓
Tenants can view:
- Property address and details
- Unit information (floor, bedrooms, type)
- Tenancy start and end dates
- Tenancy type (leaseholder, AST, etc.)
- Monthly rent amount
- Deposit information and protection scheme
- Emergency contact details
- Days remaining on lease

### 2. **Rent Payments** ✓
Complete payment management:
- **One-time payments**: Pay rent instantly via secure card payment
- **Recurring payments**: Set up automatic monthly payments
- **Payment history**: View all past and upcoming payments
- **Payment status**: Track paid, pending, and overdue transactions
- **Stripe integration**: Bank-level secure payment processing
- **Receipts**: Automatic receipt generation

### 3. **Maintenance Requests** ✓
Full maintenance workflow:
- **Submit requests**: Create detailed maintenance requests
- **Photo uploads**: Attach photos/videos of issues
- **Priority selection**: Emergency, urgent, standard, low
- **Category selection**: Plumbing, electrical, structural, etc.
- **Track progress**: Visual timeline showing request status
- **Contractor info**: See assigned contractor details
- **Scheduling**: View scheduled work dates
- **Communication**: Message about maintenance issues

### 4. **Document Access** ✓
Secure document repository:
- Tenancy agreements
- Welcome packs
- Emergency contact lists
- Inspection reports
- Safety certificates (gas, EICR, EPC)
- Leaseholder information
- Any documents shared by property manager

### 5. **Notifications & Updates** ✓
Stay informed with:
- Urgent alerts (🚨)
- Reminders (⏰)
- General updates (ℹ️)
- Document notifications (📄)
- Maintenance updates (🔧)
- Read/unread tracking

### 6. **Messaging** ✓
Direct communication:
- Message property manager
- Create new threads
- Reply to existing conversations
- Attach files
- Real-time updates
- Message history
- Read receipts

## Access & Security

### Generating Portal Access

**For Property Managers:**

1. Navigate to **Tenants** module
2. Find the tenant card
3. Click **"Portal Access"** button
4. Click **"Generate Access"**
5. Options to:
   - Copy portal link
   - Email link directly to tenant
   - Open portal in new tab
   - Regenerate link (if needed)

**Security Features:**
- Secure token-based authentication
- 90-day expiry (configurable)
- Unique per tenant
- Admin-only generation
- Stored in `TenantAccessToken` entity
- Can be regenerated anytime

### Tenant Access Flow

1. Tenant receives secure link via email
2. Clicks link to access portal
3. No login required (token-based)
4. Access expires after 90 days
5. Property manager can regenerate

## Technical Architecture

### Components

**Frontend:**
- `pages/TenantPortal.jsx` - Main portal page
- `components/tenants/TenantPortalAccess.jsx` - Access generation dialog
- `components/payments/RentPaymentModal.jsx` - Payment processing
- `components/messaging/MessageHub.jsx` - Messaging system

**Backend:**
- `functions/generateTenantToken.js` - Token generation
- `functions/processRentPayment.js` - Payment processing
- `functions/setupRecurringPayment.js` - Recurring payment setup
- `functions/notifyNewMessage.js` - Message notifications

**Entities:**
- `Tenant` - Tenant information
- `TenantAccessToken` - Portal access tokens
- `FinancialTransaction` - Payment records
- `MaintenanceOrder` - Maintenance requests
- `Message` - Communications
- `Document` - Shared documents
- `TenantNotification` - Alerts and updates

### Data Flow

```
Property Manager → Generate Token → TenantAccessToken
                       ↓
                Email Link to Tenant
                       ↓
            Tenant Clicks Link → Validates Token
                       ↓
              Access Portal (no login)
                       ↓
        Fetch: Tenant → Unit → Property → Documents
```

## Integration Points

### With Tenants Module
- Direct portal access button on tenant cards
- Auto-populates tenant information
- Links to property and unit data

### With Financials Module
- Real-time payment status
- Transaction history
- Recurring payment management
- Stripe integration

### With Maintenance Module
- Submit requests directly
- Track progress
- View contractor assignments
- Communication thread

### With Documents Module
- Access shared documents
- Download capability
- Secure storage
- Role-based access

## User Experience

### Dashboard Summary
Upon login, tenants see:
- Unit reference
- Lease end date
- Monthly rent
- Unread notification count

### Navigation
Six main tabs:
1. **Lease** - Property and tenancy details
2. **Payments** - Pay rent and view history
3. **Repairs** - Submit and track maintenance
4. **Updates** - Notifications and alerts
5. **Docs** - Document repository
6. **Messages** - Communication hub

### Mobile Responsive
- Fully responsive design
- Works on all devices
- Touch-friendly interface
- Optimized for mobile payments

## Benefits

### For Tenants
✓ 24/7 self-service access
✓ Instant payment processing
✓ Easy maintenance reporting
✓ Direct communication channel
✓ Document access anytime
✓ No password to remember

### For Property Managers
✓ Reduced admin workload
✓ Faster rent collection
✓ Better tenant satisfaction
✓ Automated notifications
✓ Centralized communication
✓ Professional portal presence

### For Business
✓ Modern, competitive feature
✓ Reduced phone calls/emails
✓ Better payment compliance
✓ Improved record keeping
✓ Enhanced tenant retention
✓ Scalable solution

## Configuration

### Token Expiry
Default: 90 days
Location: `functions/generateTenantToken.js`
```javascript
expires_at: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)
```

### Payment Integration
Stripe configuration in:
- `components/payments/RentPaymentModal.jsx`
- `functions/processRentPayment.js`
- Environment variables for API keys

### Branding
Customize in:
- `pages/TenantPortal.jsx` - Header and colors
- `index.css` - Design tokens
- `RBMBrandingProvider` - Brand configuration

## Common Use Cases

### 1. New Tenant Onboarding
1. Create tenant in system
2. Generate portal access
3. Email welcome message with link
4. Tenant accesses portal
5. Reviews lease details
6. Sets up recurring payment
7. Downloads welcome pack

### 2. Maintenance Request
1. Tenant notices issue
2. Logs into portal
3. Goes to Repairs tab
4. Clicks "New Request"
5. Fills in details + photos
6. Submits request
7. Tracks progress visually
8. Receives updates via notifications

### 3. Rent Payment
**One-time:**
1. Navigate to Payments
2. Click "Pay Now"
3. Enter card details
4. Confirm payment
5. Receive receipt

**Recurring:**
1. Navigate to Payments
2. Click "Manage" on Auto-Pay
3. Set payment day
4. Enter card details
5. Confirm setup
6. Automatic monthly payments

### 4. Document Sharing
**Property Manager:**
1. Upload document
2. Set tenant access
3. Tenant notified

**Tenant:**
1. Receives notification
2. Goes to Documents tab
3. Downloads file
4. Stores for reference

## Troubleshooting

### Portal Access Issues
**Problem:** Link not working
**Solutions:**
- Check token hasn't expired
- Verify tenant is active
- Regenerate token if needed
- Check URL is complete

### Payment Failures
**Problem:** Payment not processing
**Solutions:**
- Verify Stripe configuration
- Check card details are valid
- Ensure amount is correct
- Review error messages

### Document Access
**Problem:** Can't see documents
**Solutions:**
- Verify document has tenant_id or property_id set
- Check access_roles includes 'tenant'
- Ensure document status is not 'draft'

## Future Enhancements

### Planned Features
- Push notifications
- SMS alerts
- Calendar integration
- Viewing requests
- Lease renewal workflow
- Insurance options
- Utility tracking
- Visitor parking registration
- Package delivery notifications

### Advanced Features
- AI chatbot support
- Virtual assistant
- Predictive maintenance
- Smart home integration
- Community forum
- Local area information
- Moving guide
- Digital key storage

## Support

### For Property Managers
- Access portal via Tenants module
- Generate tokens as needed
- Monitor tenant activity
- Update property information

### For Tenants
- Contact property manager via Messages tab
- Check notifications regularly
- Keep contact details updated
- Save portal link for future access

## Metrics & Analytics

Track:
- Portal adoption rate
- Payment completion rate
- Maintenance request volume
- Document download frequency
- Message response times
- Token regeneration rate

## Security Best Practices

1. **Token Management**
   - Regular expiry checks
   - Regenerate when needed
   - Monitor for unusual activity

2. **Payment Security**
   - PCI compliance via Stripe
   - No card data stored locally
   - Encrypted transactions

3. **Data Privacy**
   - GDPR compliant
   - Role-based access
   - Secure document storage

4. **Communication**
   - Verified sender addresses
   - No PII in notifications
   - Secure messaging

---

## Quick Start Checklist

**Setting up Tenant Portal:**

- [ ] Enable Tenant entity
- [ ] Configure Stripe for payments
- [ ] Set up Document templates
- [ ] Create maintenance categories
- [ ] Configure notification templates
- [ ] Test token generation
- [ ] Send test portal access
- [ ] Verify all features work
- [ ] Train property managers
- [ ] Create tenant guide

**For Each New Tenant:**

- [ ] Create tenant record
- [ ] Link to property and unit
- [ ] Generate portal token
- [ ] Send welcome email with link
- [ ] Upload tenancy agreement
- [ ] Set up initial rent transactions
- [ ] Add to relevant documents
- [ ] Follow up on first login

---

**Version:** 1.0  
**Last Updated:** April 2026  
**Status:** Production Ready ✓