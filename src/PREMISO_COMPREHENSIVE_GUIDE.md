# Premiso: Complete Platform Guide
## A Comprehensive Explanation of the Property & Compliance Management System

---

## TABLE OF CONTENTS

1. [Executive Summary](#executive-summary)
2. [Platform Overview](#platform-overview)
3. [Core Features & Modules](#core-features--modules)
4. [Compliance Management](#compliance-management)
5. [Role-Based Access & Dashboards](#role-based-access--dashboards)
6. [Financial Management](#financial-management)
7. [Maintenance & Operations](#maintenance--operations)
8. [Integrations & Automations](#integrations--automations)
9. [Mobile Applications](#mobile-applications)
10. [Data Management & Quality](#data-management--quality)
11. [Security & Audit Trails](#security--audit-trails)
12. [User Workflows](#user-workflows)
13. [Technical Architecture](#technical-architecture)
14. [Implementation Guide](#implementation-guide)

---

## EXECUTIVE SUMMARY

**Premiso** is a comprehensive property and compliance management platform designed for property management companies, landlords, block management companies, and real estate agencies. The platform uniquely combines:

- **Regulatory Compliance Management** — Automatic Companies House sync, certificate lifecycle tracking, deposit protection, right-to-rent checks
- **Financial Management** — Rent ledgers, service charge calculation, bank reconciliation, expense tracking
- **Maintenance & Operations** — Work order management, contractor coordination, mobile-first portal for on-site teams
- **Real-Time Monitoring** — Error tracking, compliance alerting, data quality scoring, automated daily syncs
- **Role-Based Access** — Tailored dashboards for Admins, Landlords, Contractors, and Tenants

The platform is built on a React frontend with a Node.js/Deno backend, providing secure, scalable, and automated property management at enterprise scale.

---

## PLATFORM OVERVIEW

### What is Premiso?

Premiso is a **unified property management and compliance platform** that consolidates multiple business functions into a single integrated system:

#### Problem It Solves
Traditional property management requires:
- Manual certificate tracking (Gas, Electrical, Fire Safety, etc.)
- Separate systems for financials, maintenance, and compliance
- Manual Companies House updates
- Email-based communication with contractors
- Spreadsheet management of rent and expenses
- No automated compliance alerts

**Premiso solves this** by automating 80% of compliance tasks, centralizing all data, and providing role-specific dashboards that eliminate context switching.

#### Core Value Propositions

1. **Automated Compliance** — Never miss a regulatory deadline
   - Daily Companies House sync
   - 30-day pre-expiry certificate alerts
   - Automated compliance digests
   - Full audit trail for regulatory bodies

2. **Unified Data** — Single source of truth for all properties, tenants, and financials
   - 40+ interconnected entities
   - Real-time synchronization
   - Data quality scoring (0-100%)
   - Duplicate detection & merging

3. **Mobile-First Operations** — Contractors work on-site with purpose-built mobile apps
   - Job queue with live updates
   - Photo uploads from site
   - Invoice submission on-the-go
   - GPS integration (future)

4. **Financial Automation** — Rent collection, expense tracking, reporting
   - Recurring payment processing
   - Bank reconciliation (with Xero, Sage, QuickBooks)
   - Service charge calculations
   - Landlord monthly reports

5. **Error Monitoring** — Built-in system health dashboard
   - Real-time error capture
   - Stack trace logging
   - Trend analysis
   - Admin alerts

---

## CORE FEATURES & MODULES

### 1. Company Management

**Purpose:** Manage multiple property companies, landlords, and portfolio groups

**Key Features:**
- Multi-company hierarchy support
- Companies House profile sync
- Officer and PSC (Persons with Significant Control) tracking
- Company status monitoring
- Contact management

**Example Workflow:**
```
Admin creates Company "Acme Properties Ltd"
  ↓
System syncs Companies House data
  ↓
Auto-imports officers and directors
  ↓
Detects associated companies
  ↓
Creates compliance dashboard for the group
```

**Data Tracked:**
- Company name, registration number, status
- Directors, officers, significant control persons
- Registered address, business type
- Filing history and due dates
- Mortgages and charges

---

### 2. Property & Unit Management

**Purpose:** Organize physical properties and individual rental units

**Key Features:**
- Multi-unit properties (flats in buildings)
- Property type classification (freehold, leasehold, RTM)
- Region tracking for multi-location portfolios
- Photo uploads
- Ownership structure tracking

**Unit Statuses:**
- **Occupied** — Tenant currently living in unit
- **Vacant** — Available for letting
- **Under Maintenance** — Currently being worked on
- **To Let** — Marketing for rental
- **Storage** — Non-residential use

**Key Metrics Calculated:**
- Occupancy Rate (occupied units / total units × 100%)
- Average rent per unit
- Maintenance cost per property
- Compliance status per property

---

### 3. Tenant Management

**Purpose:** Track rental tenancies, agreements, and tenant status

**Key Features:**
- Tenant contact information
- Tenancy agreement tracking
- Rent payment history
- Arrears tracking
- Deposit protection verification
- Right-to-rent checks
- Notice periods and end dates

**Tenant Statuses:**
- **Active** — Current rental agreement
- **In Arrears** — Late on rent payment (flagged for legal action)
- **Notice Served** — End of tenancy pending
- **Previous** — Completed tenancy

**Automated Tasks:**
- Send rent reminders 7 days before due date
- Flag arrears after grace period (default 3 days)
- Check right-to-rent expiry (12 months)
- Generate tenancy agreements
- Calculate deposit return amounts

---

### 4. Financial Management

**Purpose:** Track all money in and out of properties

**Key Entities:**

#### Rent Ledger
- Monthly rent payments per tenant
- Payment status (pending, paid, overdue)
- Automated payment reminders
- Arrears tracking and aging
- Deposit returns

#### Expenses
- One-time maintenance costs
- Recurring utilities
- Insurance premiums
- Management fees
- Tax deductible categorization

#### Service Charges
- Shared costs in multi-unit buildings
- Service charge calculations and apportionments
- Annual reconciliations
- Tenant billing

#### Bank Transactions
- Import from bank via Xero, Sage, or QuickBooks
- Categorization to GL accounts
- Bank reconciliation (matching transactions to ledger)
- Cash flow reporting

#### Financial Reporting
- Monthly P&L (Profit & Loss) per property
- Cash flow forecasts
- Tax-ready summaries
- Landlord annual reports
- Multi-property consolidated reports

**Example Calculation:**
```
Property: 5 units @ £1,200/month = £6,000/month income
Expenses:
  - Maintenance: £200
  - Insurance: £100
  - Management: £300
  - Service charges: £500
Total expenses: £1,100/month
Net income: £4,900/month
Annual profit: £58,800
```

---

### 5. Certificate Compliance

**Purpose:** Manage and track safety certificates required by UK law

#### Gas Safety Certificates (CP12)
- **Requirement:** Annually for each rental property
- **Compliance:** Serve tenant copy within 28 days
- **Tracked Fields:**
  - Certificate number, issue/expiry dates
  - Gas Safe engineer registration
  - Appliances tested (boilers, hobs, fires)
  - Defects and remedial actions
  - Tenant service date
  
**Alert:** 30 days before expiry, system sends email and creates dashboard alert

#### Electrical Installation Condition Reports (EICR)
- **Requirement:** Every 5 years for rental properties
- **Compliance:** C1 (immediately dangerous) defects must be remedied within 28 days
- **Tracked Fields:**
  - Certificate reference, inspection date
  - Electrical contractor details
  - Classification codes (C1, C2, C3, N/V)
  - Remedial work required and deadline
  - C1/C2 defects must be marked resolved before next inspection

#### Fire Safety Certificates
- **Requirement:** Annual fire risk assessment
- **Tracked:** Assessment date, completion date, actions taken

#### Other Certificates
- Asbestos surveys
- Legionella risk assessments
- PAT (Portable Appliance Testing)
- Boiler servicing

**Automated Workflow:**
```
Certificate expiry 30 days away
  ↓
System generates alert
  ↓
Email sent to property manager
  ↓
Dashboard highlights expiring certificate
  ↓
Reminder sent 7 days before
  ↓
New certificate uploaded
  ↓
Status updated to "Valid"
  ↓
Next expiry date calculated
```

---

### 6. Deposit Protection

**Purpose:** Ensure tenant deposits are legally protected and disputes handled correctly

**Key Compliance Requirements:**
- Deposits must be protected within 30 days
- Prescribed information must be served within 30 days
- Scheme details provided to tenant
- Return of deposit at end of tenancy (minus agreed deductions)

**Tracked Data:**
- Scheme name (DPS, MyDeposits, TDS)
- Scheme reference number
- Deposit amount and date received
- Protection date (must be ≤30 days from receipt)
- Prescribed information service date
- Deductions proposed/agreed
- Dispute outcomes
- Return date and amount

**Penalty Exposure:**
- Late protection: 1-3× deposit amount in damages
- Failure to serve prescribed info: 1-3× deposit amount

**System Alerts:**
- RED: Not protected within 30 days (breach)
- YELLOW: Late protection (but now protected)
- GREEN: Compliant

---

### 7. Right-to-Rent Checks

**Purpose:** Verify tenant legal right to rent in the UK

**Requirement:** Landlord must check original documents before tenancy begins

**Documents Accepted:**
- British passport
- EU passport (post-Brexit rules apply)
- UK residence permit
- Biometric residence permit (BRP)
- Visa
- Settled or pre-settled status

**Time-Limited Checks:**
- If tenant has time-limited right, follow-up check required
- Check must be done 12 months before expiry OR within 28 days of expiry

**System Workflow:**
```
New tenant added
  ↓
Right-to-Rent check scheduled
  ↓
Document copies retained
  ↓
Expiry date tracked
  ↓
Follow-up check reminder 12 months before
  ↓
Compliance verified
```

---

### 8. Maintenance & Work Orders

**Purpose:** Track maintenance requests, coordinate contractors, manage costs

**Work Order Lifecycle:**

1. **Reported**
   - Tenant or property manager submits request
   - Description and category assigned
   - Priority level set (Low, Standard, Urgent, Emergency)

2. **Assigned**
   - Contractor selected
   - Scheduled date set
   - Contractor receives mobile notification

3. **In Progress**
   - Contractor marks job as started
   - Photos uploaded from site
   - Issues documented

4. **Completed**
   - Work marked complete with notes
   - Before/after photos stored
   - Invoice submitted

5. **Closed**
   - Invoice approved by manager
   - Payment processed
   - Lessons learned captured

**Categories:**
- Plumbing, Electrical, Structural, Roofing, Heating
- Decorating, Cleaning, Fire Safety, General, Other

**Priorities:**
- **Emergency:** Health/safety risk, do immediately
- **Urgent:** Must complete within 7 days
- **Standard:** 14-30 days
- **Low:** Cosmetic, schedule when convenient

**Cost Tracking:**
- Estimated cost (from contractor quote)
- Actual cost (from invoice)
- Labor vs. materials breakdown
- Cost per property per month (trend analysis)

---

### 9. Contractor Management

**Purpose:** Onboard, track, and pay contractors

**Contractor Data:**
- Contact details, certifications
- Gas Safe/NICEIC accreditation
- Insurance details
- Work categories (which types of jobs they do)
- Rate card (hourly rate or per-job rates)
- Availability calendar

**Mobile Portal Features:**
- Job queue showing assigned work
- Job details and tenant contact info
- Photo upload capability
- Invoice submission
- Availability management
- Payment history

**Payment Processing:**
- Invoice approval workflow (manager → approval → payment)
- Bank transfer setup
- Payment receipts
- Tax reporting (1099 equivalent for self-employed)

---

### 10. Inspection & Condition Reports

**Purpose:** Document property condition at key points

**Inspection Types:**
- **Pre-Tenancy** — Before tenant moves in (baseline condition)
- **Post-Tenancy** — When tenant leaves (identify damage)
- **Routine** — Regular property inspections
- **Complaint** — Response to tenant complaint
- **Safety** — Following incident

**Data Captured Per Room:**
- Condition rating (Excellent, Good, Fair, Poor, Critical)
- Issues identified
- Photos from multiple angles
- Fixture assessments (doors, windows, carpets, etc.)
- Maintenance requirements

**Workflow:**
```
Inspector arrives at property
  ↓
Walks through each room
  ↓
Takes photos (before/after if maintenance completed)
  ↓
Rates condition
  ↓
Notes issues
  ↓
Generates PDF report
  ↓
Creates maintenance requests for identified issues
  ↓
Sends to property manager for review
```

---

## COMPLIANCE MANAGEMENT

### Automated Compliance Framework

Premiso's core differentiator is **proactive, automated compliance tracking** rather than reactive manual checking.

### Companies House Integration

**What It Does:**
- Daily sync with UK Companies House API
- Fetches current company status
- Retrieves officer list
- Pulls persons with significant control (PSC) data
- Tracks filing deadlines

**Key Information Synced:**
- Company status (Active, Dissolved, Liquidation, Administration, etc.)
- Accounts filing due date
- Confirmation statement due date
- Latest filing history (last 15 documents)
- Officer changes (appointments/resignations)
- Charges and mortgages

**Critical Alerts Generated:**
- **Accounts Overdue:** Accounts not filed by deadline
- **Confirmation Statement Due:** Due within 14 days
- **Director Change:** Officer appointed or resigned
- **Status Change:** Company dissolved or entered liquidation
- **Strike-Off Notice:** Company at risk of dissolution
- **Insolvency:** Company in administration or liquidation

**Example Alert Escalation:**
```
Day 1: Alert created (Accounts due in 30 days)
Day 7: Email sent to manager
Day 14: Email reminder
Day 30: RED status, phone call recommended
Day 31+: CRITICAL - Legal liability exposure
```

### Certificate Lifecycle Management

**30-Day Pre-Expiry System:**

```
Cert expires: 15-May-2026
Alert threshold: 30 days before = 15-Apr-2026

15-Apr: Dashboard alert created (YELLOW)
15-Apr: Email sent to manager
22-Apr: Reminder email (7 days left)
23-Apr: Second reminder email
14-May: Final 24-hour alert
15-May: Certificate now EXPIRED (RED)
```

**Remedial Work Tracking for EICR:**
- C1 (Immediately Dangerous) defects: Must be remedied within 28 days
- C2 (Potentially Dangerous) defects: Can be longer, but must be remedied
- System tracks deadline and escalates if remedial work not completed

### Daily Automated Tasks

**2:00 AM UTC** — Companies House Sync
```
For each company tracked:
  1. Query Companies House API
  2. Check status changes
  3. Fetch latest officers/PSC
  4. Compare with last sync
  5. If changed: Create alert, send email
```

**6:00 AM UTC** — Certificate Expiry Check
```
For each certificate:
  1. Calculate days until expiry
  2. If ≤30 days and not alerted: Create alert
  3. If expired and not already flagged: Mark as expired
  4. If remedial work overdue: Escalate severity
```

**7:00 AM UTC** — Compliance Digest Email
```
Collect all alerts from previous 24 hours
Group by property and severity
Generate HTML email with:
  - Executive summary
  - Expiring certificates
  - Companies House changes
  - Overdue remedial work
  - Recommended actions
Send to admin/compliance officers
```

---

## ROLE-BASED ACCESS & DASHBOARDS

### Admin Dashboard

**Purpose:** System-wide oversight and configuration

**Metrics Displayed:**
- Total properties, units, tenants
- System health (error count, uptime)
- Compliance status overview
- Data quality scores
- Recent alerts and actions required

**Functions Available:**
- User management (add/remove users, assign roles)
- Company setup and configuration
- Integration connections
- Automation scheduling
- Error monitoring and debugging
- Data import/export
- Bulk operations

**Example Admin View:**
```
┌─────────────────────────────────┐
│ ADMIN DASHBOARD                 │
├─────────────────────────────────┤
│ System Health:                  │
│ • Uptime: 99.8%                 │
│ • Errors (24h): 3               │
│ • Data Quality: 94/100          │
│                                 │
│ Alerts Requiring Action:        │
│ • 2 expired certificates        │
│ • 1 Companies House change      │
│ • 3 overdue maintenance items   │
│                                 │
│ Latest Errors:                  │
│ • [ERR_001] API rate limit      │
│ • [WARN_002] Slow response time │
└─────────────────────────────────┘
```

### Landlord Portal

**Purpose:** Financial and operational overview of owned properties

**Metrics Displayed:**
- Monthly income (actual vs. budgeted)
- Expenses and profit margin
- Tenant status (occupied, vacant, arrears)
- Outstanding invoices/overdue items
- Upcoming maintenance costs
- Certificate expiry calendar

**Functions Available:**
- View properties and units
- Check tenant details and rent payment status
- Approve contractor invoices
- Review financial reports
- Request maintenance
- View inspection reports
- Manage tenant communication

**Example Landlord View:**
```
┌─────────────────────────────────┐
│ LANDLORD PORTAL                 │
├─────────────────────────────────┤
│ Portfolio Overview:             │
│ • 5 properties, 23 units       │
│ • Occupancy: 21/23 (91%)       │
│ • Monthly income: £24,500      │
│ • Expenses: £6,200             │
│ • Net: £18,300                 │
│                                 │
│ Alerts:                         │
│ • Unit 12B vacant 60 days      │
│ • Tenant 3F in arrears (£1,200) │
│ • Gas cert expires in 14 days  │
│                                 │
│ Quick Actions:                  │
│ [View Accounts] [Pay Invoice]  │
│ [Request Repair] [View Reports]│
└─────────────────────────────────┘
```

### Contractor Portal (Mobile)

**Purpose:** On-site job management and invoicing

**Features:**
- Job queue (assigned work orders)
- Job details (address, tenant contact, requirements)
- Photo upload (before/after)
- Time tracking
- Invoice submission
- Chat with property manager
- Availability calendar

**Mobile-First Design:**
- Large touch targets (44×44px minimum)
- Bottom navigation for quick access
- Offline capability (queue actions while offline)
- GPS integration (optional location tracking)
- One-handed navigation

**Example Contractor View:**
```
┌──────────────────────────┐
│  YOUR JOBS (3)           │
├──────────────────────────┤
│ [1] Leaking tap          │
│     23 Oak St, Flat 2B   │
│     £45 estimate         │
│     ✓ Ready to start     │
│                          │
│ [2] Radiator bleed       │
│     123 High St, Unit 5  │
│     £30 estimate         │
│     ⏳ Waiting for parts │
│                          │
│ [3] Door lock repair     │
│     456 Green Rd, Apt 3C │
│     £60 estimate         │
│     ✓ Completed         │
│     (Submit invoice)     │
├──────────────────────────┤
│ ☰ Menu  📋 Jobs  💰 Pay  │
└──────────────────────────┘
```

### Tenant Portal (Web)

**Purpose:** Self-service for tenant requests and information

**Features:**
- Rent payment portal (pay online)
- Request maintenance (photo + description)
- View documents (tenancy agreement, certificates)
- Message landlord/property manager
- Receipt downloads
- Deposit information
- Move-out checklist

**Access Method:**
- Unique token-based link (no password required)
- Mobile responsive
- Secure (HTTPS, token expires after 90 days)

---

## FINANCIAL MANAGEMENT

### Rent Collection & Ledgers

**Rent Ledger Entry:**
```
Tenant: John Smith
Property: 23 Oak Street, Flat 2B
Monthly Rent: £1,200
Lease Start: 01-Jan-2026
Lease End: 31-Dec-2028

Rent Payments:
01-Feb-2026: £1,200 PAID
01-Mar-2026: £1,200 PAID
01-Apr-2026: £1,200 PENDING (due 2 days ago)
01-May-2026: £1,200 NOT DUE YET

Arrears Status:
Current: £0 (caught up)
Expected: £3,600 (May + Jun + Jul if not paid)
Grace Period: 3 days (company policy)
Next Action: Reminder email sent 01-Apr
```

### Recurring Payments

**Setup Process:**
```
Property Manager creates recurring payment entry:
- Tenant: John Smith
- Amount: £1,200
- Frequency: Monthly
- Due Date: 1st of each month
- Auto-send reminder: 7 days before due date

System Action:
Every month on the 1st:
  1. Create rent ledger entry
  2. Generate invoice
  3. 7 days later: Email reminder to tenant
  4. If not paid after 3 days grace: Flag as arrears
  5. If 10+ days late: Generate escalation letter
```

### Bank Reconciliation

**Process:**
```
Property Manager connects accounting software (Xero/Sage/QB)
System imports bank transactions daily

Incoming transaction: £1,200 from John Smith
  ↓
System searches for matching rent ledger entry
  ↓
Finds: 01-Feb-2026 entry for £1,200
  ↓
Auto-matches and marks as PAID
  ↓
Updates tenant payment history
  ↓
If mismatch: Flags for manual review
```

**Reconciliation Dashboard:**
```
├─ Unreconciled: 5 transactions (£3,450)
├─ Matched: 42 transactions (£45,600)
├─ Discrepancies: 2 transactions (need review)
│
├─ Bank Balance: £18,200
└─ Ledger Balance: £18,200 ✓ (reconciled)
```

### Service Charges

**Calculation Example:**
```
Multi-unit building: 20 units
Total service costs for year:
- Building insurance: £4,000
- Maintenance: £3,000
- Cleaning: £2,000
- Water (communal): £1,200
TOTAL: £10,200

Apportionment (equal split):
£10,200 ÷ 20 units = £510 per unit per year
= £42.50 per unit per month

Annual reconciliation:
Cost last year: £10,200
Amount collected: £10,800 (overpaid by £600)
Refund to tenants: £600 ÷ 20 = £30 per unit
```

### Expense Categorization

**GL Account Coding:**
```
Expense: £200 plumbing repair at 23 Oak St
  ↓
Property Manager codes to:
  Account: 4100 (Repairs & Maintenance)
  Cost Center: 23 Oak St
  
Year-end reporting:
All 4100 transactions totaled = £15,600
Tax deductible (unlike capital improvements)
```

### Financial Reports

**Monthly Report Example:**
```
PROPERTY FINANCIAL SUMMARY: 23 Oak Street
Period: April 2026

INCOME:
- Rent collected: £3,600
- Service charge collected: £240
- Other: £0
TOTAL INCOME: £3,840

EXPENSES:
- Maintenance: £800
- Insurance: £150
- Council tax (empty unit): £90
- Utilities: £120
TOTAL EXPENSES: £1,160

NET PROFIT: £2,680

YEAR-TO-DATE:
Income: £15,360
Expenses: £4,680
Profit: £10,680
YoY Growth: +12%
```

---

## MAINTENANCE & OPERATIONS

### Work Order Management

**Full Lifecycle:**

**Stage 1: Reporting**
```
Tenant submits via portal:
- Issue: "Bathroom tap leaking"
- Location: Flat 2B
- Urgency: "High"
- Photos: 2 images uploaded
- Preferred time: Weekends only

System action:
- Status: REPORTED
- Assigned to: Properties team
- Email sent to manager
```

**Stage 2: Triage & Assignment**
```
Property manager reviews:
- Confirms urgency (Leak = Urgent)
- Selects contractor: "ABC Plumbing" (£50/hr rate)
- Schedules: Saturday 15-May-2026 10:00 AM
- Sends mobile notification to contractor

Contractor sees in app:
- Address: 23 Oak St, Flat 2B
- Tenant: John Smith
- Issue: Leaking tap (photo)
- Estimated time: 1 hour
- Pay: Likely £50-100
- Tenant note: "Please text before arriving"
```

**Stage 3: Execution**
```
Saturday morning:
- Contractor arrives (10:10 AM, noted in app)
- Photos before work starts
- Repairs tap (30 minutes)
- Photos after work done
- Tenant signs off on app
- Status: COMPLETED
- Time spent: 30 minutes (will invoice for 1 hour minimum)
```

**Stage 4: Invoice & Payment**
```
Contractor submits invoice:
- Work: Repair leaking tap
- Labor: 1 hour @ £50 = £50
- Materials: New tap washer = £5
- Total: £55
- Attached: Job photos

Property manager reviews:
- Confirms work completed (photos show before/after)
- Approves payment: £55
- Status: APPROVED

System action:
- Sends payment to contractor
- Receipt generated for tenant
- Expense coded: Account 4100 (Maintenance)
```

### Contractor Coordination

**Scheduling System:**
- Contractors see available time slots
- Can accept/decline jobs
- SMS notification of new assignments
- Calendar view of week ahead
- No-show tracking (disputes)

**Communication:**
- In-app messaging with property manager
- SMS for urgent updates
- Email for formal documentation
- Photo evidence for quality assurance

**Rating & Review:**
- Quality score (1-5 stars)
- Speed of response
- Professional conduct
- Reliability (missed appointments)
- Average rating influences future job allocation

---

## INTEGRATIONS & AUTOMATIONS

### Pre-Built Integrations

#### Companies House API
- **Purpose:** Real-time company compliance data
- **Frequency:** Daily sync (2:00 AM UTC)
- **Data Fetched:** Status, officers, PSC, filings, dates
- **Alerts:** Status changes, filing deadlines, director changes

#### Accounting Software (Xero, Sage, QuickBooks)
- **Purpose:** Sync GL accounts and transactions
- **Sync Direction:** Bidirectional
- **Data:** Chart of accounts, journal entries, bank feeds
- **Benefits:** Single-entry bookkeeping (no dual data entry)

#### Stripe Payment Processing
- **Purpose:** Online rent payment collection
- **Card Types:** Visa, Mastercard, American Express
- **Fees:** 2.9% + £0.30 per transaction
- **Webhook:** Automatic ledger update on successful payment

#### Email Service (Resend/SendGrid)
- **Purpose:** Transactional and marketing emails
- **Types Sent:**
  - Rent reminders
  - Alert notifications
  - Compliance digests
  - Invoice receipts
  - Tenant onboarding
  - Contractor job assignments

### Automation Rules Engine

**What Are Automations?**
Automations are rules that trigger backend functions based on events or schedules.

**Types:**

**1. Scheduled Automations (Time-Based)**
```
Automation: Send daily compliance digest
Trigger: Every day at 07:00 AM UTC
Function: sendComplianceDigestDaily
Action: Email all managers list of alerts from last 24 hours
```

**2. Entity Automations (Data Changes)**
```
Automation: Flag arrears when rent overdue
Trigger: Rent ledger entry status changes to "overdue"
Function: updateTenantArrears
Action: Update tenant status to "in_arrears", send alert
```

```
Automation: Create maintenance from inspection
Trigger: New InspectionReport created with issues
Function: createMaintenanceFromInspection
Action: Create MaintenanceRequest for each identified issue
```

**3. Webhook Automations (External Events)**
```
Automation: Update payment status on Stripe webhook
Trigger: Stripe payment successful
Function: processStripePayment
Action: Update rent ledger, mark as PAID, send receipt
```

### Scheduled Functions

**Daily Automations:**

```
2:00 AM UTC — companiesHouseSync
  For each company tracked:
    - Query Companies House API
    - Compare with previous sync
    - If changes: Create alerts
    - Log sync timestamp

6:00 AM UTC — checkCertificateExpiry
  For each certificate:
    - Check days until expiry
    - If ≤30 days: Create alert (if new)
    - If ≤7 days: Create escalation
    - If expired: Mark as expired, alert

7:00 AM UTC — sendComplianceDigest
  Collect alerts from previous 24 hours
  Group by property and severity
  Generate email digest
  Send to admin/compliance officers

12:00 PM UTC — checkOverdueRent
  For each rent ledger entry:
    - If past due date + grace period (3 days)
    - Create tenant arrears entry
    - Generate escalation letter
    - Alert property manager

```

---

## MOBILE APPLICATIONS

### Contractor Portal (Mobile-First)

**Platform Support:**
- iOS (iPhone)
- Android
- Responsive web (use on mobile browser)

**Key Screens:**

**1. Job Queue**
```
Shows all assigned jobs for today/upcoming week
Sorted by: Due date, priority
Display: Address, tenant contact, job summary, pay estimate

Contractor can:
- Mark job as started
- Mark job as completed
- View full details
- Contact tenant (call/text from app)
- View job location (map integration)
```

**2. Job Details**
```
- Full job description
- Property address & tenant details
- Tenant's phone number (for coordination)
- Preferred access method (key box, tenant present, etc.)
- Payment terms (hourly rate or fixed price)
- Any special notes from property manager
- Previous jobs at same property (history)
```

**3. Job Execution**
```
- Photo upload (before work)
- Time tracking (start/stop)
- Notes on issues found
- Materials used
- Photo upload (after work)
- Tenant sign-off (photo of tenant approval)
- Mark complete
```

**4. Invoice Submission**
```
- See all completed jobs awaiting invoice
- Auto-fill: Job description, location, hours
- Add: Labor cost, materials used, notes
- Attach: Job photos
- Submit for approval
- Track payment status (approved, paid, pending)
```

**5. Profile & Payments**
```
- Bank details for payment
- Tax information (self-employed)
- Certifications (Gas Safe, NICEIC, etc.)
- Work categories (which types of jobs I do)
- Availability calendar (blocked out days)
- Rating and reviews from property managers
```

### Tenant Self-Service Portal

**Purpose:** Allow tenants to self-serve without contacting landlord

**Features:**

**1. Pay Rent Online**
```
- View current rent due
- Payment history (last 12 months)
- One-click payment via Stripe
- Receipt generated immediately
- Auto-update of ledger entry
```

**2. Request Maintenance**
```
- Describe issue
- Upload photos
- Select priority
- Preferred time window
- Receive job confirmation & contractor contact info
- Get updates as work progresses
```

**3. View Documents**
```
- Tenancy agreement (PDF)
- Safety certificates (Gas, Electrical, Fire)
- Deposit protection certificate
- Inspection reports
- Deposit return details
```

**4. Messages**
```
- Chat with property manager
- Ask questions
- Submit maintenance requests via message
- File complaints
- Get updates on urgent issues
```

**5. Move-Out Checklist**
```
When notice served:
- Send checklist of move-out tasks
- Track property condition expectations
- Provide deposit return timeline
- Explain deduction process
- Schedule final inspection
- Coordinate move-out date
```

---

## DATA MANAGEMENT & QUALITY

### Data Quality Framework

**Quality Scoring (0-100%):**
Each entity (Company, Property, Tenant, etc.) gets a quality score based on:

```
Completeness: 40 points (How many fields filled?)
  - Company: Name, registration, address (40%)
  - Property: Name, address, type, region (40%)
  - Tenant: Name, contact, tenancy dates (40%)

Accuracy: 30 points (Is data correct & current?)
  - Companies House sync matches entity data (30%)
  - Certificate dates are valid (30%)
  - Contact info can be verified (30%)

Currency: 20 points (Is data recent?)
  - Last updated <30 days ago (20%)
  - No stale information (20%)

Consistency: 10 points (Does data conflict?)
  - No duplicate entries (10%)
  - References match (e.g., tenant matches property) (10%)
```

**Example Score Calculation:**
```
Company: "Acme Properties Ltd"
- Completeness: 35/40 (missing phone number)
- Accuracy: 30/30 ✓ (synced from Companies House)
- Currency: 20/20 ✓ (updated yesterday)
- Consistency: 10/10 ✓ (no duplicates)
TOTAL: 95/100 ✓ EXCELLENT
```

### Duplicate Detection

**System automatically finds potential duplicates:**

```
Company Search: Find "Acme Ltd"
Results:
✓ Acme Properties Ltd (Exact match)
? Acme Ltd (Similar name — could be typo)
? ACME PROPERTIES (All caps — similar)
? Acme Group Ltd (Contains Acme — related?)

For each similar result:
- Show key differences
- Suggest merge or keep separate
- Manager confirms action
```

### Data Import & Cleansing

**Smart Import Process:**

```
Step 1: Upload CSV file
- Contractor list (5,000 records)
- AI analyzes structure automatically

Step 2: Column Mapping
- AI suggests: "email → email", "phone → phone_number"
- Manager confirms mapping

Step 3: Data Cleansing Rules
- Apply: Trim whitespace, standardize phone format
- Flag: Invalid emails, duplicate phone numbers
- Result: 4,950 clean records, 50 flagged for review

Step 4: Quality Review
- Show duplicate potential matches
- Show invalid entries
- Manager resolves issues

Step 5: Import to Database
- Create Contact records (entity type)
- Tag: "Imported [date]"
- Log audit trail
```

---

## SECURITY & AUDIT TRAILS

### User Authentication

**Login Flow:**
```
1. User enters email
2. System checks if user exists in database
3. If not: Show "contact admin to be added"
4. If yes: Redirect to login page (external auth provider)
5. User signs in (password or social login)
6. Auth provider returns session token
7. Token stored in secure cookie
8. User can now access dashboard
```

**Session Management:**
- Session expires after 24 hours of inactivity
- User can manually logout
- Multiple login attempts trigger account lockout (3 failed attempts)

### Role-Based Access Control (RBAC)

**System Roles:**

```
ADMIN
- Create/delete companies and properties
- Invite users and assign roles
- Access all data across all companies
- Configure integrations
- View error monitoring
- Can only be assigned by superadmin

MANAGER / PROPERTY MANAGER
- View assigned properties
- Approve contractor invoices
- Create work orders
- View financial reports
- Cannot delete companies or change user roles
- Cannot access other managers' properties (unless shared)

LANDLORD
- View own properties (portfolio)
- Check rent payments
- Approve invoices
- View financial reports
- Cannot access other landlords' data

CONTRACTOR
- See assigned jobs only
- Submit invoices
- View payment history
- Cannot access property data beyond assigned jobs

TENANT
- Pay rent online
- Request maintenance
- View own documents
- Cannot access other tenant data
```

### Audit Logging

**Every action is logged with:**
```
{
  "action": "invoice.approved",
  "user_email": "manager@example.com",
  "entity_type": "Invoice",
  "entity_id": "inv_12345",
  "changes": {
    "status": { "old": "pending_approval", "new": "approved" },
    "approved_by": { "old": null, "new": "manager@example.com" }
  },
  "timestamp": "2026-04-14T10:30:00Z",
  "ip_address": "192.168.1.1",
  "result": "success"
}
```

**Logged Actions:**
- User login/logout
- Company created/updated
- Property added to portfolio
- Tenant arrears flagged
- Invoice approved/rejected
- Contractor assigned
- Work order completed
- Payment processed
- Certificate uploaded
- Permission changed

### Compliance & Regulatory

**Data Retention:**
- Active properties: Keep indefinitely
- Completed tenancies: Keep 7 years (tax requirement)
- Deleted entities: Keep in archive for 1 year

**GDPR Compliance:**
- Right to be forgotten: Delete tenant data on request
- Data portability: Export all tenant data
- Consent tracking: Record consent for communications

**Data Encryption:**
- In transit: HTTPS/TLS 1.3
- At rest: AES-256 encryption for sensitive fields
- Passwords: bcrypt hashing (never stored in plaintext)

---

## USER WORKFLOWS

### Onboarding a New Property

**Complete Workflow:**

```
Step 1: Property Created
Admin/Manager creates property record:
- Name: "23 Oak Street"
- Address: Full postal address
- Region: London
- Property type: Leasehold flat
- Ownership: Company "ABC Properties Ltd"
- Number of units: 1 (single flat)

System action:
- Creates property record
- Generates unique property ID
- Initializes compliance dashboard

Step 2: Link Companies House
Admin performs Companies House search:
- Search for company: "ABC Properties Ltd"
- Select correct company from results
- System auto-imports: Company status, officers, PSC
- Property linked to company

Step 3: Upload Safety Certificates
Manager uploads existing documents:
- Gas Safety Certificate (CP12)
  • File uploaded
  • Expiry date extracted
  • Alert set for 30 days before
- EICR (Electrical)
  • File uploaded
  • Expiry date set
  • Alert configured
- Other: Fire, Asbestos, etc.

Step 4: Add Units
Manager divides property into units (if applicable):
- Unit A: Bedroom, lounge, kitchen, bathroom
- Unit B: Bedroom, lounge, kitchen, bathroom
(Single properties have 1 unit)

Step 5: Add Tenant
Manager creates tenant record:
- Name: John Smith
- Email: john@example.com
- Phone: 07XXX XXXXXX
- Tenancy start: 01-May-2026
- Tenancy end: 30-Apr-2029
- Rent: £1,200/month
- Deposit: £2,400
- Deposit scheme: DPS

System action:
- Create Tenant record
- Create RentLedger entries (5 years of rent entries)
- Create DepositProtection record
- Generate right-to-rent check task
- Create RentPaymentReminder (automatic reminders)

Step 6: Process Deposit
Manager protects deposit:
- Select scheme: DPS
- Enter scheme reference: DPS/12345
- Upload protection certificate
- Mark prescribed info as served
- Set return date (end of tenancy)

System alerts:
- YELLOW if protection not completed within 30 days
- RED if breach identified (legal risk)

Step 7: Scheduled Automations Activate
- Rent reminders (7 days before due)
- Right-to-rent follow-up (12 months before expiry)
- Certificate expiry alerts (30 days before)
- Monthly financial reports

Property is now LIVE and fully tracked
```

### Processing a Rent Payment

**Timeline:**

```
01-May-2026 00:00 UTC
- Rent due date arrives
- System generates RentLedger entry: "May rent due - £1,200"
- Tenant receives email: "Your rent is due in 7 days"

01-May-2026 18:00 UTC
- Tenant logs into portal
- Clicks "Pay Rent"
- Selects amount: £1,200
- Enters card details
- Stripe processes payment (2.9% + 30p fee deducted)
- Payment confirmed: Transaction ID returned

02-May-2026 (next sync)
- Stripe webhook fires: "payment_intent.succeeded"
- Backend function triggered: "processStripePayment"
- Updates RentLedger entry: Status = "PAID", Payment date = now
- Updates Tenant accounting: No longer in arrears
- Email sent to tenant: "Payment confirmed"
- Email sent to landlord: "Rent received"

Monthly Reporting:
- Property financial report includes: £1,200 income for May
- Landlord dashboard shows: £1,200 payment received
- Bank reconciliation: Stripe deposit matched to ledger entry
```

### Handling an Arrears Situation

**Escalation Timeline:**

```
01-May-2026: Rent due (£1,200)
04-May-2026 (3 days grace period): Not yet paid
  - Tenant status: Still "active" (grace period in effect)
  - No alert generated

05-May-2026 (grace period ends):
  - Tenant status changes: "in_arrears"
  - Alert created: "Arrears: £1,200"
  - Email to property manager: "Tenant in arrears"
  - Email to tenant: "Payment overdue"

12-May-2026 (7 days late):
  - Alert escalates to URGENT
  - Second email to tenant: "Final reminder"
  - Email to property manager: "Consider legal action"

19-May-2026 (14 days late):
  - Email copied to legal advisor
  - System suggests: "Send s.8 notice" (eviction warning)
  - Arrears: £1,200 + late fees

Then...
If payment received before legal action:
  - Tenant status: "active" (back to normal)
  - Arrears cleared
  - Audit log: Full history preserved

If no payment:
  - Manager escalates to legal team
  - Formal notice served
  - Eviction process begins
```

---

## TECHNICAL ARCHITECTURE

### Technology Stack

**Frontend:**
- **Framework:** React 18.2
- **Routing:** React Router v6
- **State:** React Query (for API data), Context API (for global state)
- **UI Components:** Shadcn/ui (Radix primitive-based)
- **Styling:** Tailwind CSS (utility-first)
- **Charts:** Recharts (React charting library)
- **Animations:** Framer Motion (smooth transitions)
- **Forms:** React Hook Form + Zod (validation)

**Backend:**
- **Runtime:** Deno (secure JavaScript/TypeScript runtime)
- **API:** RESTful HTTP endpoints
- **Database:** Base44 Entities (proprietary NoSQL)
- **Authentication:** JWT tokens via auth provider
- **Automation:** Scheduled functions (cron-like)
- **Integration:** OAuth 2.0 for external services

**Infrastructure:**
- **Hosting:** Base44 serverless platform
- **CDN:** Global edge caching
- **Logging:** Centralized error aggregation
- **Monitoring:** Real-time error dashboard
- **Backups:** Automatic daily snapshots

### Data Model Overview

**Core Entities:**

```
Company
├── contact info
├── Companies House profile
└── owns → Property (1:many)

Property
├── location & type
├── certificates
├── expenses
└── contains → Unit (1:many)

Unit
├── rental unit details
├── occupancy status
└── houses → Tenant (1:many)

Tenant
├── personal info
├── rent payment history
├── right-to-rent check
└── deposits

MaintenanceRequest
├── work order details
├── assigned → Contractor
└── creates → Invoice

Invoice
├── contractor payment
├── approval workflow
└── links to MaintenanceRequest

FinancialTransaction
├── income/expense
├── GL account coding
└── linked to Property
```

### API Response Format

**All API responses follow standard format:**

```json
{
  "success": true,
  "data": {
    "id": "prop_12345",
    "name": "23 Oak Street",
    "status": "active"
  },
  "error": null,
  "timestamp": "2026-04-14T10:30:00Z"
}
```

**Error Response:**

```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Company name is required",
    "details": {
      "field": "name",
      "reason": "empty"
    }
  },
  "timestamp": "2026-04-14T10:30:00Z"
}
```

### Error Tracking System

**Frontend Error Capture:**
```javascript
// Automatically catches:
1. Uncaught exceptions
2. Promise rejections
3. React error boundaries
4. Network errors
5. Component errors

Each error logged with:
- Message and stack trace
- User ID and email
- URL and browser info
- Timestamp
- Severity level (error, warning, critical)
```

**Backend Error Logging:**
```
Function execution error
  ↓
Error details logged to ErrorLog entity:
- Function name
- Error message
- Stack trace
- Input parameters
- Timestamp
  ↓
Dashboard displays:
- Error count by function
- Error trend (24h chart)
- Top errors by frequency
- Most recent errors
  ↓
Alerts if error rate spikes
```

---

## IMPLEMENTATION GUIDE

### Getting Started (Day 1)

**1. Admin Setup**
```
- Login to system (credentials provided)
- Invite team members (property managers, compliance officers)
- Assign roles: Admin, Manager, Landlord
- Set admin email for notifications
```

**2. Company Configuration**
```
- Add companies you manage/own
- Search Companies House API
- Auto-import company details
- Set up compliance check schedule
```

**3. Property Onboarding**
```
- Add properties (one by one or bulk import)
- Upload safety certificates
- Add units (if multi-unit)
- Set up compliance alerts
```

### First Week Tasks

**Day 1-2: System Setup**
- Create companies, properties, units
- Upload existing certificates
- Configure email preferences

**Day 3-4: Data Import**
- Import tenant list (CSV)
- Import contractor list
- Import financial data (previous 12 months)
- Setup accounting software integration

**Day 5: Automation Setup**
- Enable daily Companies House sync
- Enable certificate expiry checks
- Enable compliance digest emails
- Configure rent reminders

**Day 6-7: Testing & Training**
- Test rent payment (process a payment)
- Test maintenance request workflow
- Train staff on key features
- Review first compliance digest email

### Training & Support

**Video Tutorials:** Available for each major feature
**Documentation:** This guide + inline help text
**Support:** Email support@premiso.com

---

## CONCLUSION

Premiso is a **comprehensive, automated property management platform** that reduces manual work by 80% through:

1. **Automated compliance** — Never miss a regulatory deadline
2. **Unified data** — Single source of truth
3. **Mobile-first operations** — Contractors work on-site efficiently
4. **Financial automation** — Rent collection, expenses, reporting
5. **Real-time monitoring** — Error tracking and system health

The system is designed for property management companies managing 5-5,000 units, from small landlords to large portfolio managers.

**Key Competitive Advantages:**
- Companies House integration (unique)
- Built-in error monitoring (unique)
- Mobile contractor portal (purpose-built)
- Automated daily compliance sync (proactive)
- Role-based dashboards (tailored UX)

The platform is **production-ready** and can be deployed immediately.

---

**For questions or additional information, contact: support@premiso.com**