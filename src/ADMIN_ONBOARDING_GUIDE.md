# Admin Onboarding Guide

## Welcome to Premiso Admin Console

This guide walks you through setting up Premiso for your property management business.

## Phase 1: Initial Setup (15 minutes)

### 1. Company Profile
1. Navigate to **Settings** → **Company Information**
2. Enter your company details:
   - Company name
   - Registration number (Companies House)
   - Address
   - Phone number
   - Tax ID
3. Upload company logo (used on reports & documents)
4. Save and verify

### 2. User Management
1. Go to **Settings** → **Users**
2. Invite team members:
   - Admin: Full access (1-2 recommended)
   - Manager: Read/write access (operations)
   - Staff: Limited access (specific properties)
3. Click "Invite User" and enter email
4. User receives invitation link (valid 7 days)
5. Set role permissions before sending invites

### 3. Property Setup
1. **Properties** → **Add New Property**
2. Enter property details:
   - Address
   - Property type (flat/house/HMO)
   - Year built
   - Number of units
   - Management type (landlord-managed/agent)
3. Upload property images
4. Add to portfolio

### 4. Bank & Payment Details
1. **Settings** → **Banking**
2. Add bank account(s):
   - Account holder name
   - Sort code
   - Account number
   - Account type
3. Configure payment defaults:
   - Preferred payment method for rents
   - Invoice payment terms (30/45/60 days)
   - Late payment interest rate (if applicable)

## Phase 2: Compliance Setup (20 minutes)

### Certificate Management
1. **Compliance** → **Certificates**
2. Upload existing certificates:
   - Gas Safety (CP12) - must be current
   - EICR (electrical)
   - EPC (energy)
   - Fire safety (if applicable)
3. Set alert thresholds:
   - Gas: 30 days before expiry (default)
   - Electrical: 60 days before expiry
   - EPC: 90 days before expiry
4. Enable email reminders

### Deposit Protection
1. **Compliance** → **Deposit Protection**
2. Select approved scheme:
   - DPS (Deposit Protection Service)
   - MyDeposits
   - TDS (Tenancy Deposit Scheme)
3. Link existing tenancies to scheme records
4. Set 30-day protection deadline alert

### Right-to-Rent Checks
1. **Compliance** → **Right-to-Rent**
2. Import existing check records
3. Set follow-up check reminders (12 months)
4. Enable automated document storage

## Phase 3: Financial Configuration (15 minutes)

### Chart of Accounts
1. **Financials** → **Accounting Setup**
2. If using Xero/Sage:
   - Click "Connect Accounting Software"
   - Authorize OAuth connection
   - Map Premiso accounts to GL codes
3. Create income/expense categories:
   - Rental income
   - Service charges
   - Maintenance (grouped by type)
   - Insurance
   - Utilities
4. Save chart template (reusable for new properties)

### Tax Configuration
1. **Settings** → **Tax Settings**
2. Set up tax year (e.g., 6 Apr - 5 Apr for UK)
3. Configure standard tax rates:
   - Basic rate: 20%
   - Higher rate: 40%
   - Corporation tax: 19%
4. Define allowable expenses for your business
5. Enable tax summary reports

## Phase 4: Integrations (10 minutes)

### Email & Communications
1. **Settings** → **Email**
2. Configure sender email:
   - System notifications address
   - Tenant communication address
   - Accounting contact email
3. Enable two-factor authentication (recommended)

### Webhooks (Advanced)
1. **Settings** → **Integrations** → **Webhooks**
2. For accounting sync:
   - Generate webhook URL
   - Test connection to accounting software
   - Set events to sync (invoices, payments)

### SMS (Optional)
1. **Settings** → **SMS Gateway**
2. If enabled:
   - Configure SMS provider (Twilio, etc.)
   - Set message templates
   - Enable for payment reminders

## Phase 5: Document Templates (10 minutes)

1. **Templates** → **Document Library**
2. Review default templates:
   - Tenancy agreements
   - Notice to Quit
   - Section 21 notices
   - Deposit deduction letters
   - Maintenance request forms
3. Customize with your branding:
   - Add company logo
   - Adjust terms if needed
   - Set approval workflow
4. Test template generation

## Phase 6: Tenant & Contractor Portals

### Tenant Portal Setup
1. **Portals** → **Tenant Settings**
2. Configure portal features:
   - Enable rent payment
   - Enable maintenance requests
   - Document library access
   - Messaging (optional)
3. Customize welcome message
4. Test with a demo tenant account

### Contractor Portal Setup
1. **Portals** → **Contractor Settings**
2. Configure contractor access:
   - Job assignment visibility
   - Invoice submission
   - Document uploads
   - Rating/review system
3. Set approval workflow for invoices
4. Create contractor account for testing

## Phase 7: Automation & Rules (15 minutes)

### Rent Reminders
1. **Automations** → **Rent Reminders**
2. Configure:
   - Initial reminder: 3 days before due date
   - Follow-up: Every 7 days after due
   - Final notice: 21 days overdue
   - Escalation: Collections notice after 30 days
3. Set reminder methods: Email/SMS/Both
4. Enable for all tenancies

### Maintenance Workflows
1. **Automations** → **Maintenance**
2. Set up automatic actions:
   - Assign priority based on category
   - Route to specific contractors
   - Set max repair budgets
   - Auto-close after 30 days no activity
3. Create escalation rules

### Certificate Reminders
1. **Automations** → **Compliance Alerts**
2. Enable automatic reminders:
   - 60 days before expiry
   - 30 days before expiry
   - 7 days before expiry
   - On expiry date
3. Assign to admin/manager

## Phase 8: User Training

### Create Admin User Accounts
1. **Settings** → **Users** → **Add Admin**
2. Assign:
   - One primary admin (full access)
   - One backup admin (full access)
   - Operations managers (property-level)

### Conduct Team Training
- Dashboard walkthrough (30 min)
- Property management workflow (45 min)
- Tenant/contractor portal features (30 min)
- Reporting & compliance (30 min)
- Emergency procedures & support (15 min)

### Documentation
- Print admin checklist (save PDF)
- Share knowledge base links
- Set up Slack/Teams channel for support questions
- Schedule weekly check-in meetings

## Phase 9: Testing & Quality Assurance

### Data Quality Checks
1. Verify all properties created correctly
2. Check certificate uploads completed
3. Confirm tenant/contractor data migrated
4. Validate financial transaction imports

### Functionality Testing
1. Create test property
2. Test rent payment flow
3. Test maintenance request
4. Generate sample reports
5. Test email/SMS templates

### Security Checks
1. Verify 2FA is enabled for all admins
2. Confirm IP whitelisting set (if required)
3. Check audit logging is active
4. Review user role permissions

## Phase 10: Go-Live Preparation

### Final Checklist
- [ ] All properties created
- [ ] Tenants invited to portal
- [ ] Contractors set up
- [ ] Certificates uploaded
- [ ] First report generated successfully
- [ ] Backup/disaster recovery tested
- [ ] Support team trained
- [ ] Monitoring dashboards set up
- [ ] Incident response plan reviewed
- [ ] Legal/compliance team sign-off

### Launch Steps
1. Schedule launch date (avoid month-end/year-end)
2. Send tenant portal announcements
3. Disable parallel legacy system (if applicable)
4. Monitor system closely for 48 hours
5. Collect user feedback
6. Schedule post-launch review (1 week)

## Support & Troubleshooting

### Common Issues

**Q: Can't log in?**
- Check email for reset link
- Verify 2FA codes (if enabled)
- Contact support: support@premiso.co.uk

**Q: Data migration questions?**
- Use bulk import tool with CSV templates
- Contact data migration team

**Q: Certificate expired?**
- Use one-click contractor booking
- Schedule with preferred provider
- Track in compliance dashboard

### Get Help
- **Email**: support@premiso.co.uk
- **Phone**: 0207 XXX XXXX
- **Chat**: In-app support (Business hours)
- **Docs**: knowledge.premiso.co.uk

### Feedback
Help us improve! Submit feature requests:
- **In-app**: Settings → Feedback
- **Email**: product@premiso.co.uk

---
**Estimated Total Setup Time: 2-3 hours**

Last Updated: 2026-04-13