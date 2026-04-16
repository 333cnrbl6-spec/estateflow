# Premiso — Complete Reference

**Tagline:** Institutional property management intelligence. Built on relationship expertise, not generic compliance.

---

## Core Value Proposition

Premiso detects what others miss:
- **Hidden conflicts of interest** via relationship mapping (beneficial owners, nominees, offshore structures)
- **Regulatory compliance gaps** (certificates, filings, statutory notices)
- **Financial risk** in property portfolios (yield, occupancy, cash flow)
- **Operational inefficiency** in maintenance, tenant management, vendor lifecycle

**Unique:** Relationship Intelligence Engine — automatically maps corporate structures, detects beneficial ownership chains, flags conflicts before auditors or regulators do.

---

## Core Entities

### Relationship & Structure
- **OwnershipRelationship** — Maps person→company→property chains; detects COI patterns
- **Company** — Companies House data, directors, financial status, risk scoring
- **Contact** — Directors, agents, contractors, solicitors
- **CompaniesHouseProfile** — Synced CH data; critical alerts (overdue filings, strike-off)

### Property & Units
- **Property** — Buildings, blocks, freehold/leasehold
- **Unit** — Individual flats, offices within properties
- **Tenant** — Leaseholders, assured shorthold, licensees; screening data
- **DepositProtection** — DPS/TDS compliance, prescribed info tracking

### Operations
- **MaintenanceRequest** — Tenant-raised or inspector-triggered; workflow tracking
- **MaintenanceOrder** — Vendor assignments, invoicing, completion proof
- **Vendor** — Contractors; insurance, payment terms, SLAs
- **Task** — Property-wide projects, admin work, compliance actions

### Compliance & Safety
- **GasSafetyCertificate, EICRCertificate, FireSafetyRegister** — Certificate storage & expiry tracking
- **CertificateExpiryAlert** — Automated alerts 30/60/90 days pre-expiry
- **ComplianceAuditLog** — Full audit trail of all compliance actions
- **FireRiskAssessment, HMOLicense** — Specialist compliance docs

### Finance
- **FinancialTransaction** — Rent, expenses, repairs
- **Invoice** — Vendor invoices, payment status
- **RentLedger** — Tenant rent tracking, arrears flagging
- **ServiceCharge** — Service charge calculations, apportionments
- **GroundRent** — Ground rent tracking for leaseholders

### Documents & Communication
- **Document** — Tenancy agreements, certificates, inspection reports
- **GeneratedDocument** — Auto-generated leases, notices, reports
- **Message** — Internal comms on maintenance/financial transactions

---

## Key Backend Functions

### Relationship Intelligence
- `detectConflictsOfInterest()` — Scans all relationships; flags nominee directors, offshore owners, service charge vehicle misalignment
- `getRelationshipsOptimized()` — Fast relationship chain lookup (person→director→company→property)
- `assessBusinessRelationshipCompliance()` — Flags regulatory risks in corporate structures

### Compliance Automation
- `checkCertificateExpiryDaily()` — Scheduled; creates alerts 30/60/90 days pre-expiry
- `syncCompaniesHouseDataBatch()` — Syncs CH profiles; flags status changes, overdue filings
- `auditLog()` — Records all entity changes for regulatory audit trails
- `generateComplianceReport()` — PDF audit-ready compliance summaries

### Maintenance & Operations
- `submitMaintenanceRequest()` — Tenant portal submission → triage → contractor assignment
- `scheduleInspection()` — Coordinate inspections; auto-generate reports
- `assignContractorToTask()` — Vendor assignment, SLA tracking, payment processing

### Financial Automation
- `checkOverdueRentDaily()` — Flags arrears; triggers reminders/legal notices
- `generateMonthlyInvoices()` — Automated rent/service charge invoicing
- `reconcileBankTransactions()` — Matches bank feeds to entities
- `generateFinancialReportPDF()` — P&L, balance sheet, cash flow by property

### Tenant Lifecycle
- `screenTenantApplicant()` — Credit check, reference checks, right-to-rent, identity verification
- `generateTenantAccessToken()` — Portal access for maintenance, docs, payments
- `submitInspection()` — Move-out inspection → deduction calculations → dispute handling

### Document Automation
- `generateDocument()` — Leases, notices, certificates from templates
- `generateLeaseAgreement()` — Personalized tenancy agreements
- `generateStatutoryNotice()` — Section 21, ground rent notices, etc.

---

## Integrations & Connectors

### Built-in
- **Companies House API** — Syncs director info, SIC codes, filing status, PSC data
- **Land Registry** — Property ownership chains (freehold, leasehold, RTM)
- **Stripe** — Rent/service charge payments, recurring subscriptions

### Supported
- **Accounting** — Xero, Sage, QuickBooks (nominal sync, P&L export)
- **Banking** — Bank transaction feeds for reconciliation
- **Communications** — Email reminders, SMS notifications, WhatsApp templates

---

## Data Model Highlights

### Conflict of Interest Detection
```
Person (director) → Company A → Property (freehold owner)
Person (same director) → Company B → Property (managing agent)
↓
FLAGGED: Director controls both freehold and management
```

### Compliance Audit Trail
Every entity change triggers `ComplianceAuditLog` entry:
- WHO made the change (user email, role)
- WHAT changed (before/after values)
- WHEN it happened (timestamp)
- WHY (linked compliance rule/alert)

### Financial Tracking
Property → Units → Tenants → Rent transactions → Ledger balances → Arrears flagging → Legal action

---

## Use Cases

### Property Manager (10-50 properties)
- Dashboard: occupancy, maintenance backlog, compliance alerts, arrears
- Maintenance: assign contractors, track SLAs, auto-invoice
- Compliance: certificate expiry alerts, Companies House sync, audit-ready reports
- Finance: rent ledger, service charge apportionments, monthly P&L

### Block Management Agent
- Relationship intelligence: detect nominee directors hiding beneficial ownership
- Service charge automation: calculate, apportion, invoice leaseholders
- RTM tracking: monitor Right-to-Manage takeovers, compliance
- Leaseholder portal: service charge statements, payment history, documents

### Institutional Landlord (100+ units)
- Portfolio analytics: yield, occupancy, maintenance forecast by property/region
- Compliance at scale: sync 50+ company profiles, flag regulatory risks
- Tenant screening: automated credit/reference checks, deposit protection compliance
- Vendor management: SLA tracking, payment automation, insurance compliance

### Accountant/Tax Advisor
- Multi-portfolio reporting: consolidated P&L, tax-ready summaries
- Bank reconciliation: auto-match transactions to entities
- Companies House tracking: alert on filing deadlines for client companies
- Audit evidence: complete audit trail for compliance reviews

---

## Competitive Moat

1. **Relationship Intelligence** — Detects conflicts no one else catches
2. **UK Property Expertise** — Codified decades of domain knowledge
3. **Compliance-First** — Designed for regulatory requirements, not feature creep
4. **Audit-Ready** — Every action logged; reports exportable for regulators
5. **Scalable Automation** — Reduces manual compliance work from hours to minutes

---

## Roadmap (Notional)

- **Q2 2026:** Real-time beneficial ownership tracking (Companies House PSC webhooks)
- **Q3 2026:** Predictive COI engine (AI-flagged relationships before human review)
- **Q4 2026:** International expansion (EU property structures)
- **2027:** Lease negotiation automation, dispute resolution workflows
- **2028+:** Adjacent verticals (corporate secretarial, trustee management)

---

## Technology Stack

- **Frontend:** React, Tailwind, shadcn/ui (responsive, accessible)
- **Backend:** Deno Deploy (serverless functions), Base44 SDK
- **Data:** Base44 entities (PostgreSQL-backed), full audit logging
- **Integrations:** OAuth (Companies House, Land Registry, Stripe, Xero), webhooks (bank feeds, communications)

---

## Revenue Model

- **SaaS subscription** — Per property or per unit (SMB/mid-market)
- **Enterprise license** — Portfolio-based for REITs, institutional landlords
- **Compliance consulting** — Audit, remediation, risk assessment services
- **White-label** — For accountants, legal firms, managing agents

---

## What Makes It Valuable

**Not features. Not workflows. Not pretty dashboards.**

Premiso is valuable because it **prevents expensive mistakes:**
- Avoids compliance fines (certificate expiry, statutory breaches)
- Catches fraud (beneficial owner hiding, nominee structures)
- Reduces maintenance costs (predictive scheduling, vendor accountability)
- Automates compliance drudgery (alerts, reports, audit trails)

Every user saves 10-20 hours/month and reduces regulatory risk. That's worth paying for.