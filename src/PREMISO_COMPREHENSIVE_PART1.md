# PREMISO COMPLIANCE MANAGEMENT PLATFORM
## Complete Technical & User Documentation — PART 1

**Version:** 2.0  
**Date:** April 2026  
**Status:** Production Ready  

---

## TABLE OF CONTENTS (PART 1)

1. [Executive Summary](#executive-summary)
2. [Platform Overview](#platform-overview)
3. [Core Features](#core-features)
4. [System Architecture](#system-architecture)

---

## EXECUTIVE SUMMARY

**Premiso** is a next-generation **Compliance Management Platform** designed specifically for property management companies, block management firms, and landlords across the United Kingdom. The platform automates regulatory compliance tracking, certificate lifecycle management, financial reporting, and operational workflows—reducing manual administrative work by 80% while ensuring zero compliance breaches.

### Problem Statement
Property managers, landlords, and block management firms face a complex landscape of UK regulatory requirements:
- **Gas Safety Certificates** (CP12) — Must be renewed annually
- **Electrical Installation Condition Reports** (EICR) — Required every 5 years
- **Deposit Protection** — Must be registered within 30 days
- **Right to Rent Checks** — Immigration compliance
- **Companies House Filings** — Accounts, confirmation statements, officer changes
- **Fire Safety Compliance** — Regular inspections and reporting
- **Health & Safety** — Asbestos surveys, legionella checks, PAT testing

Managing these compliance deadlines manually is error-prone, time-consuming, and costly. **Missing a deadline can result in fines up to £30,000+, tenant disputes, or legal action.**

### Premiso Solution
Premiso automates compliance management by:

1. **Real-time Companies House Sync** — Daily automated checks for company status changes, upcoming filing deadlines, director changes
2. **Certificate Lifecycle Tracking** — Automatic reminders 30 days before expiry; stores documents; generates audit trails
3. **Proactive Alerts** — Email digests, dashboard notifications, configurable alert preferences
4. **Mobile Contractor Portal** — On-site contractors can submit invoices, upload photos, track job status on mobile
5. **Financial Integration** — Xero, Sage, QuickBooks sync for accounting records
6. **Audit Trail** — Complete history of all actions, compliance checks, and decisions
7. **Role-Based Dashboards** — Admin, Landlord, and Contractor each see relevant data only

---

## PLATFORM OVERVIEW

### What Premiso Does

Premiso is a **cloud-based SaaS platform** that serves as the central hub for compliance, operations, and financial management across property portfolios. It integrates with external services (Companies House, accounting software, banking APIs) and provides role-specific dashboards for different stakeholders.

### Key Statistics

| Metric | Value |
|--------|-------|
| Total Entities | 40+ |
| Automated Workflows | 6 |
| Scheduled Tasks | 3 daily, 2 weekly |
| Supported Integrations | 15+ |
| Mobile-Ready Pages | 8+ |
| Role Types | 3 (Admin, Landlord, Contractor) |
| Error Tracking Enabled | Yes (real-time) |
| Audit Logging | Full compliance trail |

### Technology Stack

**Frontend:**
- React 18.2 with TypeScript/JavaScript
- Tailwind CSS for responsive design
- Shadcn UI components (40+ pre-built)
- React Router for navigation
- Framer Motion for animations
- Recharts for data visualization
- React Query for async state management

**Backend:**
- Deno Deploy (serverless functions)
- Base44 SDK for database operations
- Automated scheduling (cron)
- Real-time subscriptions (WebSocket)

**Database:**
- Base44 entity-based data model
- 40+ entity types with JSON schemas
- Automatic timestamps (created_date, updated_date, created_by)
- Audit logging on all critical operations

**Integrations:**
- Companies House API (UK government)
- Stripe (payments)
- Xero/Sage/QuickBooks (accounting)
- Google Workspace (email, docs)
- Twilio/RingCentral (communications)

---

## CORE FEATURES

### 1. COMPANIES HOUSE INTEGRATION

**What It Does:**  
Automatically syncs company information from UK Companies House every day at 2 AM UTC.

**Details:**
- **Multi-Company Search:** Find companies by name, number, or registered address
- **Officer Tracking:** See all directors, their appointment dates, and any resignations
- **PSC Monitoring:** Track Persons with Significant Control (beneficial owners)
- **Filing History:** View recent filings (accounts, confirmation statements, charges)
- **Status Monitoring:** Track company status (Active, Dissolved, Liquidation, Administration)
- **Alert Triggers:**
  - Accounts filing due within 30 days
  - Confirmation statement due within 30 days
  - Director changes detected
  - Company status changes
  - Dissolution/strike-off notices

**How to Use:**
1. Go to **Compliance > Companies House Profiles**
2. Click **"Search Companies"**
3. Enter company name or number
4. Click **"Sync Now"** to get latest data
5. View critical alerts in red, warnings in orange

**Business Impact:**
- No more missed filing deadlines
- Automatic discovery of legal status changes
- Proactive alerts 30 days before critical dates
- Complete audit trail for compliance audits

---

### 2. CERTIFICATE LIFECYCLE MANAGEMENT

**What It Does:**  
Tracks all compliance certificates (Gas Safety, EICR, Fire Safety, etc.) with automatic renewal reminders and expiry alerts.

**Supported Certificate Types:**

#### Gas Safety Certificate (CP12)
- **Requirement:** Annual (12 months from issue)
- **Tenant Notification:** Within 28 days of issue
- **Managed By:** Gas Safe registered engineer
- **Premiso Features:**
  - Upload CP12 PDF with automatic data extraction
  - Track appliances tested and results
  - Monitor flue flow tests, gas tightness
  - Store defects and remedial actions
  - Tenant copy tracking
  - Expiry alert at 30 days

#### Electrical Installation Condition Report (EICR)
- **Requirement:** Every 5 years (or 10 years for pre-2020 lettings)
- **Standard:** BS 7909:2016
- **Contractor:** Qualified electrician (NICEIC/NAPIT/ELECSA)
- **Premiso Features:**
  - Store certificate reference and supply characteristics
  - Track classification codes (C1, C2, C3, FI, N/V)
  - Monitor remedial work deadlines (28 days for C1/C2)
  - Tenant copy verification
  - Local authority reporting
  - Unsatisfactory assessment alerts

#### Fire Safety Certificate
- **Requirement:** Annual inspection
- **Standard:** Fire Safety Order 2005
- **Contractor:** Qualified fire engineer
- **Premiso Features:**
  - Upload fire risk assessment
  - Track extinguisher maintenance
  - Monitor emergency lighting tests
  - Door closure checks
  - Evacuation plan reviews

#### Deposit Protection
- **Requirement:** Within 30 days of receipt
- **Schemes:** DPS, MyDeposits, TDS
- **Prescribed Info:** Serve within 30 days
- **Premiso Features:**
  - Track deposit receipt and protection dates
  - Monitor prescribed information service
  - Calculate days to protect (flag if >30)
  - Dispute resolution tracking
  - Return ledger with deductions
  - Late protection penalty calculator

### How to Upload Certificates

1. Navigate to **Compliance > Certificates**
2. Click **"Add Certificate"**
3. Select certificate type
4. Upload PDF document
5. Premiso extracts key data automatically (via AI)
6. Review extracted data and correct if needed
7. Set alert preferences (email/dashboard/SMS)
8. Click **"Save & Create Alert"**

### Alert System

**Timing:**
- **30 days before expiry:** First alert sent
- **14 days before expiry:** Escalation (daily reminders)
- **Day of expiry:** Critical alert
- **After expiry:** Overdue flagged (red dashboard banner)

**Alert Channels:**
- Email (daily digest or immediate)
- Dashboard notifications
- SMS (optional)
- In-app banner

**Customization:**
- Go to **Settings > Alert Preferences**
- Enable/disable by certificate type
- Choose alert timing
- Select recipients
- Set email frequency (immediate/daily/weekly)

---

### 3. PROPERTY MANAGEMENT

**What It Does:**  
Centralized management of properties, units, and occupancy tracking.

**Property Types Supported:**
- Freehold blocks
- Leasehold blocks
- Houses
- Mixed-use buildings
- Commercial properties
- Land holdings
- Converted buildings
- RTM (Right to Manage) blocks

**Data Tracked Per Property:**
- Address, postcode, region
- Ownership type (Freehold/Leasehold/Commonhold)
- Owning company & management company
- Total units
- Year built
- Listed building status
- Property image
- Notes

**Unit Management:**
Each unit within a property can track:
- Unit type (1-bed flat, 2-bed maisonette, etc.)
- Status (Vacant, Occupied, Under Refurbishment)
- Rent amount
- Tenant assigned
- Tenancy start/end dates
- Furnishing type
- Special features

**Occupancy Metrics:**
- Occupancy rate (%)
- Vacant units
- Pending units
- Units under repair
- Average rent per unit
- Yield calculations

**How to Use:**
1. **Manage Properties:** Operations > Properties
2. **Add Property:** Click "New Property", fill in details
3. **Create Units:** Click property, then "Add Unit"
4. **Assign Tenants:** Select unit, click "Assign Tenant"
5. **Track Maintenance:** Units show linked maintenance orders

---

### 4. TENANT & LANDLORD PORTAL

**What It Does:**  
Provides self-service portals for tenants to submit maintenance requests, view rent history, and pay rent online.

**Tenant Portal Features:**
- **Self-Service Maintenance:** Submit repair requests with photos
- **Rent Payment:** Pay online via Stripe
- **Payment History:** View receipt PDFs
- **Lease Documents:** Access tenancy agreement
- **Messages:** Communicate with landlord/property manager
- **Announcements:** Receive service charge updates

**Access Method:**
- Email invite sent to tenant
- Token-based access (no password needed)
- Mobile-friendly interface
- Can be accessed from anywhere

**Landlord Portal Features:**
- **Properties Dashboard:** Overview of all properties
- **Financial Summary:** Monthly/quarterly/annual income/expenses
- **Occupancy Tracker:** Current and upcoming vacancies
- **Maintenance Orders:** View and approve repair requests
- **Tenant Communication:** Send messages and announcements
- **Reports:** Monthly financial summaries
- **Compliance Status:** Certificate expiry dashboard

---

### 5. MAINTENANCE MANAGEMENT

**What It Does:**  
Tracks repair requests from tenant submission through contractor completion, with cost tracking and invoice management.

**Maintenance Workflow:**

1. **Tenant Reports Issue**
   - Submits maintenance request via tenant portal
   - Includes description, photos, preferred time slot
   - Status: "Reported"

2. **Manager Assigns Contractor**
   - Reviews request
   - Determines priority (Low/Standard/Urgent/Emergency)
   - Selects contractor from database
   - Sends job notification to contractor
   - Status: "Assigned"

3. **Contractor Accepts & Schedules**
   - Confirms job via mobile app
   - Sets scheduled date/time
   - Communicates with tenant
   - Status: "Scheduled"

4. **Work Completion**
   - Contractor arrives at property
   - Takes before/after photos
   - Records work completed
   - Gets tenant sign-off
   - Status: "Completed"

5. **Invoice Processing**
   - Contractor submits invoice with photos/receipt
   - Manager reviews invoice
   - Approves or requests revision
   - Payment processed
   - Status: "Paid"

**Cost Tracking:**
- Estimated cost vs. actual cost
- Cost by category (plumbing, electrical, etc.)
- Cost by contractor
- Monthly/quarterly cost reports

**Categories:**
- Plumbing
- Electrical
- Structural
- Roofing
- Heating
- Decorating
- Cleaning
- Fire Safety
- General
- Other

**Priority Levels:**
- **Low:** Non-urgent, can wait 2-4 weeks
- **Standard:** Routine repair, 1-2 weeks
- **Urgent:** Affecting habitability, 24-48 hours
- **Emergency:** Safety/health risk, same-day response

---

### 6. FINANCIAL MANAGEMENT

**What It Does:**  
Complete financial tracking including rent collection, service charges, ground rent, and expenses.

**Income Tracking:**
- Rent payments (by tenant, property, unit)
- Service charge payments
- Ground rent (for leasehold)
- Parking fees
- Utility charges

**Expense Tracking:**
- Maintenance costs
- Property management fees
- Insurance
- Utilities (if landlord-paid)
- Service charges payable
- Mortgage interest (if tracked)

**Reconciliation:**
- Bank transaction matching
- Auto-detection of unmatched items
- Monthly reconciliation workflow
- Export to accounting software

**Reporting:**
- Monthly income statement
- Quarterly financial summary
- Annual accounts preparation
- Yield calculations per property
- Profit/loss per unit

**Integration with Accounting:**
- Sync to Xero, Sage, QuickBooks
- Create general ledger entries
- Map to nominal accounts
- Track cost centers per property
- Multi-currency support (if international)

---

### 7. COMPLIANCE AUDIT & REPORTING

**What It Does:**  
Generates comprehensive compliance audit reports for regulatory bodies, lenders, and internal governance.

**Audit Report Sections:**

1. **Company Status**
   - Registration details
   - Officers and PSC
   - Filing status (accounts, confirmation statements)
   - Dissolution risk assessment

2. **Property Compliance**
   - Gas Safety certificates (all properties)
   - Electrical certificates (EICR)
   - Fire safety compliance
   - Asbestos survey status
   - Health & safety inspections

3. **Tenant Compliance**
   - Right to Rent checks (all tenants)
   - Deposit protection verification
   - Tenancy agreements signed
   - Prescribed information served

4. **Financial Health**
   - Revenue collected vs. outstanding
   - Arrears by property/tenant
   - Expense tracking
   - Profitability metrics

5. **Audit Trail**
   - All actions logged (who did what, when)
   - Changes to critical data
   - Approval workflows
   - Compliance checks performed

**Export Formats:**
- PDF (formatted for printing)
- Excel spreadsheet
- CSV for data analysis

**Recipients:**
- Lenders (for loan servicing)
- Regulatory bodies (compliance audits)
- Internal stakeholders
- Insurance providers

---

### 8. ERROR MONITORING & SYSTEM HEALTH

**What It Does:**  
Real-time tracking of system errors, with automatic logging and dashboard analytics.

**Error Types Tracked:**
- Uncaught JavaScript errors
- Unhandled promise rejections
- API/network errors
- Validation errors
- Authentication errors
- Payment processing errors
- Backend function errors

**Data Captured:**
- Error message and type
- Stack trace (for debugging)
- Browser/device information
- URL where error occurred
- User ID (if logged in)
- Timestamp

**Dashboard Analytics:**
- Error count by type
- Severity distribution (Info/Warning/Error/Critical)
- Timeline chart (7-day trend)
- Top errors by frequency
- Impact per user

**Status Tracking:**
- New (not yet reviewed)
- Reviewed (acknowledged)
- Resolved (fixed)
- Ignored (not actionable)

**How to Use:**
1. Go to **Admin > Error Monitoring**
2. View real-time error feed
3. Click error to see stack trace
4. Mark as reviewed/resolved
5. Check 7-day trend chart

**Benefits:**
- Catch bugs before users report them
- Understand user experience issues
- Prioritize fixes by impact
- Monitor system stability
- No external service required (vs. Sentry)

---

## SYSTEM ARCHITECTURE

### High-Level Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                   USER INTERFACES                            │
├─────────────────┬──────────────┬──────────┬─────────────────┤
│  Admin          │  Landlord    │ Tenant   │  Contractor     │
│  Dashboard      │  Portal      │  Portal  │  Mobile App     │
└────────┬────────┴──────┬───────┴────┬─────┴────────┬────────┘
         │                │            │               │
         └────────────────┼────────────┼───────────────┘
                          │
         ┌────────────────▼────────────────┐
         │    React Frontend + Router      │
         │   (Tailwind CSS, Shadcn UI)     │
         └────────────┬───────────────────┘
                      │
    ┌─────────────────┼─────────────────┐
    │                 │                 │
    │ Authentication  │ API Client      │ Error Tracking
    │ (Base44 Auth)   │ (React Query)   │ (Frontend hooks)
    │                 │                 │
    └─────────────────┼─────────────────┘
                      │
         ┌────────────▼────────────┐
         │   BASE44 SDK CLIENT     │
         │  • Entities             │
         │  • Functions            │
         │  • Integrations         │
         │  • Analytics            │
         └────────────┬────────────┘
                      │
    ┌─────────────────┼─────────────────┐
    │                 │                 │
    │ Database        │ Functions       │ Integrations
    │ (Entity REST)   │ (Deno Deploy)   │ (External APIs)
    │                 │                 │
    │ 40+ Entities    │ 50+ Functions   │ Companies House
    │ Auto Timestamps │ Scheduled Tasks │ Stripe
    │ Audit Logging   │ Error Handling  │ Xero/Sage/QB
    │                 │ Real-time       │ Google Workspace
    │                 │ Subscriptions   │ Twilio
    │                 │                 │
    └─────────────────┼─────────────────┘
                      │
    ┌─────────────────┼─────────────────┐
    │                 │                 │
    │ External APIs   │ Webhooks        │ Email Service
    │ • Companies     │ • Stripe        │ • Resend
    │   House         │ • Slack         │ • SendGrid
    │ • Google APIs   │ • Mailbox       │
    │ • Accounting    │                 │
    │                 │                 │
    └─────────────────┴─────────────────┘
```

### Data Flow

**User Action → Frontend → Backend → Database → Real-time Update → UI**

Example: Updating company status
1. User goes to Companies House Profiles page
2. Clicks "Sync Now" button
3. Frontend calls `base44.functions.invoke('syncCompaniesHouseData', { company_id })`
4. Backend function fetches latest data from Companies House API
5. Updates CompaniesHouseProfile entity in database
6. Returns alerts if status changed
7. Frontend receives response and updates UI
8. Real-time subscription notifies all connected clients

---

**Continue with Part 2 for data model, user roles, and workflows...**