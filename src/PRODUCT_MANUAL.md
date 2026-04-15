# PREMISO: Complete Product Manual & Feature Guide

**Enterprise Property Management Intelligence Platform**  
**Version 3.0 | April 2026**

---

## Table of Contents

1. [Introduction](#introduction)
2. [Core Modules](#core-modules)
3. [Feature Catalog](#feature-catalog)
4. [Getting Started](#getting-started)
5. [Administration](#administration)
6. [API & Integrations](#api--integrations)
7. [FAQ](#faq)

---

## Introduction

### What is Premiso?

Premiso is a unified, cloud-based platform that consolidates compliance, risk management, financial analytics, and operational workflows for UK property managers, agents, and investors.

**In one dashboard, you get:**
- 🛡️ Real-time compliance & risk scoring
- 🔍 AI-powered conflict of interest detection
- 💰 Financial intelligence & forecasting
- 📋 Automated document generation
- 🔧 Maintenance scheduling & tracking
- 🤝 Tenant & contractor portals

### Who Uses Premiso?

| User Type | Primary Use |
|-----------|------------|
| **Property Managers** (50–5k units) | Portfolio compliance, financials, operations |
| **Independent Agents** | Tenant screening, document automation, compliance tracking |
| **Corporate Real Estate Teams** | Centralized reporting, audit trails, KPIs |
| **Franchisors/Networks** | Standardization, brand consistency, compliance oversight |
| **Investors** | Performance analytics, risk dashboards, deal flow |

---

## Core Modules

### 1. Compliance & Risk Management

**What it does:** Tracks 40+ UK compliance obligations automatically.

**Key Features:**
- **Certificate Tracking:** Gas safety, electrical, fire safety, EPC expiry dates
- **Compliance Scoring:** Real-time risk score (0–100) for each property
- **Alert Engine:** Proactive notifications for expirations, breaches, remedial actions
- **Audit Trail:** Immutable log of all compliance actions for regulatory inspections
- **Legal Context:** Statutory references for each compliance obligation

**Dashboard Highlights:**
- Compliance risk heat map (by property, by type)
- Upcoming expirations (next 90 days)
- Non-compliant properties flagged with remediation workflow
- Certification upload & verification

**Use Case:** A property manager with 200 units gets alerted 30 days before gas safety certs expire. One click to schedule inspector. Cert automatically uploaded and verified. Zero manual tracking.

---

### 2. Relationship Intelligence & COI Detection

**What it does:** Maps ownership structures and automatically detects conflicts of interest.

**Key Features:**
- **Relationship Graph:** Visualizes directors, PSCs, leaseholders, letting agents, managing agents
- **Conflict Patterns:** Automatically detects 7+ known COI patterns (e.g., leaseholder controls letting agent)
- **Risk Scoring:** Assigns severity (critical/high/medium) based on pattern
- **Remediation Workflow:** Suggests actions to resolve conflicts
- **Scenario Library:** Pre-loaded knowledge of complex ownership chains (offshore entities, RTM, etc.)

**Example COI Detected:**
```
Pattern: Leaseholder Controls Letting Agent
Entities: Jane Doe (director of Letting Co A) + Jane Doe (leaseholder at Property X)
Severity: HIGH — Potential conflict in setting rents, lease terms
Action: Review arm's-length pricing, document approval trails
```

**Use Case:** A network manager discovers that 15 of 200 properties have undetected COIs. Premiso flags all 15. Each gets a remediation plan. Legal team approves bulk fixes. Audit-ready.

---

### 3. Financial Intelligence

**What it does:** Real-time P&L, predictive budgeting, and cash flow forecasting.

**Key Features:**
- **Property-Level P&L:** Income (rents, ground rent, service charges) vs. expenses (maintenance, management fees, utilities)
- **Yield Analysis:** Rental yield, cap rate, CoC by property
- **Predictive Maintenance Budget:** ML forecasts future capex based on property age, type, history
- **Accounting Integrations:** Sync with Xero, QuickBooks, Sage for real-time financials
- **Cash Flow Forecasting:** Projects rent collection, expense payouts 12 months ahead
- **Tax Summary:** Allowable deductions, CGT exposure, dividend capacity

**Dashboard Highlights:**
- Portfolio revenue trend (YTD, month-on-month)
- Top 10 highest-yield properties
- Maintenance spend forecasts (next 12 months)
- Overdue rents (tenant by tenant)

**Use Case:** A landlord with 10 properties sees that Property A is generating 8.2% yield but Property B is only 3.5%. Drill down: Property B has £15k in predicted maintenance. System suggests refinancing or repositioning. All data export-ready for accountant.

---

### 4. Compliance Automation & Document Generation

**What it does:** Auto-generates legal documents, tenancy agreements, notices, prescribed information.

**Key Features:**
- **Template Library:** 20+ pre-approved UK legal templates (AST, regulated tenancy, deposit schedule, notices)
- **Merge Fields:** Auto-populate with tenant, property, financial data
- **Signature Workflows:** Digital signing via DocuSign integration
- **Version Control:** Track all amendments, approvals, signatures
- **Audit Trail:** Complete record for legal proceedings

**Supported Documents:**
- Assured Shorthold Tenancy (AST) agreements
- Prescribed information (deposit protection)
- Notice to Quit (s21, s8)
- Inspection reports
- Deposit schedules
- Service charge breakdowns

**Use Case:** Agent onboards new tenant. System auto-generates AST with all property details. Tenant signs digitally. Deposit prescribed info auto-sends. All stored with expiry date. Zero manual paperwork.

---

### 5. Maintenance & Operations

**What it does:** Unified platform for maintenance requests, contractor scheduling, budget tracking.

**Key Features:**
- **Maintenance Board:** Kanban-style task tracking (pending → in progress → completed)
- **Contractor Portal:** Mobile-friendly portal for contractors to accept jobs, upload proofs, invoice
- **Scheduling:** Calendar view, conflict detection, SLA tracking
- **Budget Tracking:** Compare estimated vs. actual spend by property, contractor, issue type
- **Photo Proofs:** Contractors upload before/after photos; automatic storage
- **Performance Metrics:** Track contractor response time, completion rate, quality scores

**Integrations:**
- Accounting (auto-create GL entries)
- Tenant portal (notify tenants of scheduled access)
- Risk module (flag high-maintenance properties for preventive action)

**Use Case:** Tenant reports broken boiler. System creates task, finds available plumbers, schedules visit. Plumber gets SMS. Photos uploaded post-repair. Invoice auto-matched to GL. If same property had 5 boiler repairs in 2 years, system flags for capital replacement forecast.

---

### 6. Tenant Portal

**What it does:** Self-service portal for tenants to manage rent, maintenance, documents, announcements.

**Features:**
- **Payment Portal:** View rent due, pay via card/bank transfer, download receipts
- **Maintenance Requests:** Report issues, track status in real-time
- **Document Access:** Download tenancy agreement, prescribed info, inspection reports, safety certs
- **Announcements:** Receive important messages (maintenance schedules, rule changes)
- **Profile Management:** Update contact info, emergency contacts
- **Mobile-First:** Works on any device

**Access Model:**
- Secure token-based login (no password sharing)
- Automatic expiry after tenancy ends
- Role-based permissions (can't access neighbor's data)

**Use Case:** Tenant logs in, sees rent due date, pays immediately. Next day, notices maintenance issue. Reports it. Gets SMS confirmation. Updates address. All within the portal. No phone calls needed.

---

### 7. Reporting & Analytics

**What it does:** Generate customizable reports for stakeholders (CFO, investors, compliance officers).

**Report Types:**
- **Executive Summary:** KPIs, top risks, action items (C-level)
- **Compliance Audit Report:** All cert statuses, audit trail, recommendations (legal/regulators)
- **Financial Statement:** P&L, balance sheet, cash flow (accountant/lender)
- **Maintenance Forecast:** Predicted capex, risk-based prioritization (facilities manager)
- **Portfolio Performance:** Yield, occupancy, maintenance spend vs. industry benchmarks
- **Risk Dashboard:** Compliance score, COI patterns, overdue items

**Export Formats:**
- PDF (for printing, sharing)
- Excel (for further analysis)
- API (for third-party BI tools)

**Use Case:** Every month, system auto-generates compliance report. CFO gets financial summary. Legal team reviews audit trail. Lenders get proof of asset maintenance. All generated in <5 minutes vs. 2 days manually.

---

## Feature Catalog

### Dashboard & Navigation

| Feature | What It Does |
|---------|------------|
| **Main Dashboard** | At-a-glance: portfolio stats, top risks, urgent actions, recent activity |
| **Sidebar Navigation** | Quick access to all modules: Compliance, Relationships, Financials, Maintenance, Tenants, Reporting |
| **Search** | Global search across properties, tenants, contractors, documents |
| **Notifications** | Real-time alerts for expirations, breaches, overdue items (in-app, email, SMS) |
| **Dark Mode** | Eye-friendly dark theme for evening/mobile usage |

### Compliance Module

| Feature | What It Does |
|---------|------------|
| **Certificate Tracker** | Upload, verify, track expiry for 15+ certificate types |
| **Compliance Checklist** | Property-specific compliance items with visual status (✓ compliant, ⚠ due soon, ✗ overdue) |
| **Inspection Scheduler** | Schedule property inspections, manage access confirmation with tenants |
| **Fire Safety Register** | Dedicated module for fire assessments, remedial actions, inspection history |
| **Health & Safety Audit** | Pre-built audit templates aligned with Housing Act, Health & Safety regulations |
| **Legal Knowledge Base** | Searchable library of statutory obligations, with relevant case law + guidance |

### Relationship Intelligence Module

| Feature | What It Does |
|---------|------------|
| **Relationship Map** | Visual graph showing all ownership connections (person → company → property) |
| **COI Scanner** | Automated scan for 7 common conflict patterns; flags each with severity & remedy |
| **Director Lookup** | Auto-sync director data from Companies House; flag changes |
| **PSC Registry** | Track Persons with Significant Control; alert if ownership structure changes |
| **Relationship Timeline** | View when relationships started/ended (lease expiry, director appointment, resignation) |
| **Conflict Remediation Workflow** | Step-by-step checklist to resolve each detected COI |

### Financial Module

| Feature | What It Does |
|---------|------------|
| **Property P&L** | Real-time income vs. expenses for each property |
| **Tenant Rent Ledger** | Rent received, arrears, payment history by tenant |
| **Expense Tracking** | Categorize spending (maintenance, utilities, management, tax) |
| **Yield Calculator** | Gross/net yield, CoC, cap rate by property |
| **Maintenance Budget Forecast** | ML-predicted capex for next 12 months based on age, type, history |
| **Accounting Sync** | Bi-directional sync with Xero, QuickBooks, Sage |
| **Tax Summary** | Allowable deductions, CGT exposure, dividend capacity for accountant |
| **Invoice Management** | Track all vendor invoices, match to GL, manage payments |

### Maintenance Module

| Feature | What It Does |
|---------|------------|
| **Task Board (Kanban)** | Drag-and-drop tasks: pending → assigned → in-progress → completed |
| **Contractor Portal** | Mobile portal for contractors to accept jobs, update status, upload photos, invoice |
| **Maintenance History** | Complete log of all past work on each property (preventive pattern analysis) |
| **SLA Tracking** | Monitor contractor response time, completion time vs. agreed SLA |
| **Scheduling Calendar** | Visual calendar to assign jobs, prevent double-bookings |
| **Cost Tracking** | Compare estimated vs. actual by property, contractor, issue type |
| **Preventive Maintenance** | Flag properties needing capital replacement (boiler, roof, windows) based on age/history |

### Tenant Portal

| Feature | What It Does |
|---------|------------|
| **Payment Portal** | View rent due, pay via card/bank, download receipts |
| **Maintenance Requests** | Report issues, attach photos, track status in real-time |
| **Document Library** | Download tenancy agreement, prescribed info, safety certs, inspection reports |
| **Announcements** | Receive maintenance schedules, rule changes, notices |
| **Right to Rent Check Status** | View if RTR verified, expiry date, next check due |
| **Profile Management** | Update contact info, emergency contacts, occupancy details |

### Document Automation

| Feature | What It Does |
|---------|------------|
| **Template Library** | 20+ pre-approved UK legal templates (AST, notices, prescribed info, schedules) |
| **Merge Fields** | Auto-populate with tenant, property, financial data from database |
| **Signature Workflows** | Digital signing via DocuSign; track approval chain |
| **Version Control** | Track all amendments, approvals, timestamps |
| **Bulk Generation** | Generate 100+ documents in one go (e.g., all ASTs for renewal) |
| **Audit Trail** | Complete record for legal proceedings |

### Reporting & Analytics

| Feature | What It Does |
|---------|------------|
| **Executive Summary** | High-level KPIs for CFO/board (portfolio stats, top risks, ROI) |
| **Compliance Audit Report** | Full audit trail, cert statuses, recommendations for regulators |
| **Financial Statements** | P&L, balance sheet, cash flow for accountants/lenders |
| **Maintenance Forecast** | Predicted capex, prioritized by risk, for budget planning |
| **Custom Report Builder** | Drag-and-drop to create custom reports; schedule auto-delivery |
| **Export Formats** | PDF (print), Excel (analysis), API (BI tools) |
| **Benchmarking** | Compare your yield, maintenance spend, occupancy to industry standards |

### Administration

| Feature | What It Does |
|---------|------------|
| **User Management** | Add/remove users, assign roles (admin, manager, viewer, contractor) |
| **Permissions** | Granular role-based access (e.g., contractor only sees assigned tasks) |
| **Audit Log** | Complete record of who changed what, when (immutable for compliance) |
| **Backup & Restore** | Automatic daily backups; manual restore points |
| **API Keys** | Generate keys for third-party integrations |
| **Settings** | Customize timezone, currency, branding, notification preferences |

---

## Getting Started

### For New Users

**Step 1: Create Account**
- Visit www.premiso.io/signup
- Enter email, create password
- Verify email

**Step 2: Setup Your Organization**
- Organization name
- Address, phone, website
- Upload logo (optional)

**Step 3: Add Properties**
- Property address
- Type (house, flat, commercial, etc.)
- Units (if multi-unit)
- Key contact
- Upload photos/documents (optional)

**Step 4: Invite Team**
- Email team members
- Assign roles (admin, manager, viewer)
- Customize permissions

**Step 5: Onboard Tenants (Optional)**
- Generate tenant access tokens
- Send invitations to portal
- Tenants can pay rent, report maintenance, access docs

### Onboarding Best Practices

1. **Set Up Compliance First**
   - Upload all current certificates
   - System will alert for expirations
   - Schedule inspections for due items

2. **Connect Accounting**
   - Link Xero/QuickBooks/Sage
   - System syncs income/expenses
   - Financial reports auto-populate

3. **Add Contractors**
   - Create contractor accounts
   - Assign to specific properties/issue types
   - Enable mobile portal access

4. **Configure Notifications**
   - Set alert preferences (in-app, email, SMS)
   - Configure frequency (real-time, daily digest, weekly)
   - Assign owners for each alert type

---

## Administration

### User Roles & Permissions

| Role | Access Level | Typical User |
|------|--------------|--------------|
| **Super Admin** | Full access to all features, settings, user management | Founder, COO |
| **Admin** | Full access to compliance, financial, operations; can manage users in organization | Property manager, accountant |
| **Manager** | Access to assigned properties only; can view/edit compliance, financials, maintenance | Team member, assistant |
| **Viewer** | Read-only access to assigned properties | Client, external advisor, investor |
| **Contractor** | Access to task board, scheduling, photos, invoicing | Plumber, electrician, gardener |
| **Tenant** | Tenant portal only: pay rent, report maintenance, access docs | Residential/commercial tenant |

### Backup & Restore

**Automatic Backups**
- Daily snapshots of all data
- Retained for 30 days
- Encrypted, stored geographically distributed

**Manual Backups**
- Create point-in-time snapshot any time
- Full data export (CSV/JSON)
- Restore to specific date if needed

**Disaster Recovery**
- RTO (Recovery Time Objective): <1 hour
- RPO (Recovery Point Objective): <15 minutes

---

## API & Integrations

### Pre-Built Integrations

| Service | What It Does |
|---------|------------|
| **Xero** | Bi-directional sync: property P&L, expense categorization, reporting |
| **QuickBooks** | Sync invoices, expenses, income; auto-GL posting |
| **Sage** | Similar to Xero/QB; UK-specific features |
| **Stripe** | Accept tenant rent payments; process automatically |
| **DocuSign** | Digital signatures for tenancy agreements, documents |
| **Twilio** | SMS notifications for maintenance, rent reminders, alerts |
| **Google Drive** | Auto-backup documents, certificates, inspection photos |
| **Companies House API** | Auto-sync director data; real-time change alerts |

### REST API

**Base URL:** `https://api.premiso.io/v1`

**Authentication:** Bearer token (OAuth 2.0)

**Example: List All Properties**
```bash
curl -H "Authorization: Bearer YOUR_API_KEY" \
  https://api.premiso.io/v1/properties
```

**Common Endpoints:**
- `GET /properties` — List properties
- `GET /properties/{id}` — Get property details
- `POST /properties` — Create property
- `GET /properties/{id}/compliance` — Get compliance status
- `GET /tenants` — List tenants
- `POST /maintenance/tasks` — Create maintenance task
- `GET /financials/{id}/p-l` — Get property P&L

**Documentation:** Full API docs at docs.premiso.io

---

## FAQ

### General

**Q: How much does Premiso cost?**  
A: Plans start at £250/month for solo agents (up to 25 properties), £2,000/month for large portfolios (1,000+ units). Custom enterprise pricing available.

**Q: Is my data secure?**  
A: Yes. All data encrypted in transit (TLS) and at rest (AES-256). Regular security audits, SOC 2 Type II certified.

**Q: Can I export my data?**  
A: Yes. Full data export available anytime (CSV, JSON, XML). No lock-in.

**Q: Do you offer training?**  
A: Yes. Included: onboarding call, video tutorial library, documentation. Optional: in-person training (£500/day).

### Compliance

**Q: Does Premiso replace a lawyer?**  
A: No. Premiso helps you stay compliant and organized, but doesn't replace legal advice. Use for tracking, automation, and alerts; consult solicitors for complex issues.

**Q: Are documents legally binding?**  
A: Yes, if generated from our templates and signed digitally via DocuSign. Templates reviewed by UK property law specialists annually.

**Q: How often are certificates verified?**  
A: Real-time monitoring. If a certificate is invalid/revoked, we alert you immediately (synced with Companies House, gas safety registries, etc.).

### Financial

**Q: Can Premiso do my tax return?**  
A: No, but it provides all the data your accountant needs: income, expenses, allowable deductions, capex. Makes tax time 80% faster.

**Q: Does it integrate with my accountant's software?**  
A: Yes. Xero, QuickBooks, Sage all supported. We can also export tailored reports for any accounting software.

### Maintenance

**Q: Can contractors use it on their phone?**  
A: Yes. Fully mobile-responsive portal. Contractors can accept jobs, update status, upload photos, all from phone.

**Q: Does it manage warranties on work?**  
A: Basic support: you can note warranty period in task description. Full warranty management coming in Q3 2026.

### Tenant Portal

**Q: Is the tenant portal mandatory?**  
A: No. It's optional. You can still manage tenants manually if preferred, though portal saves significant admin time.

**Q: Can tenants see other tenants' data?**  
A: No. Role-based access control ensures tenants only see their own property, rent, maintenance, documents.

**Q: Does it handle deposit deductions?**  
A: Yes. Full deposit schedule, proposed deductions workflow, tenant dispute workflow. Ready for DPS/MyDeposits API integration.

### Reporting

**Q: Can I schedule automated reports?**  
A: Yes. Create custom report, set frequency (weekly, monthly, quarterly), and auto-deliver via email.

**Q: What formats do reports export to?**  
A: PDF (for sharing), Excel (for further analysis), and API (for BI tools like Power BI, Tableau).

---

## Contact & Support

**Email Support:** support@premiso.io (24–48hr response)  
**Phone:** +44 (0)20 XXXX XXXX (weekdays 9am–5pm GMT)  
**Knowledge Base:** help.premiso.io  
**Community Forum:** community.premiso.io  

**Sales:** sales@premiso.io  
**Partnerships:** partners@premiso.io  

---

**Version History:**
- v3.0 (April 2026): Phase 3 release — Backup/Restore, Performance Metrics
- v2.5 (March 2026): Phase 2 release — Validation, Rate Limiting, Pagination
- v2.0 (January 2026): Phase 1 release — Error Handling, Zod Validation, Auth Guards
- v1.0 (June 2025): Initial launch

---

**Document Confidentiality:** This manual is confidential and for authorized users only.

*Last Updated: April 15, 2026*