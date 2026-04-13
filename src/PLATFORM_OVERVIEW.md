# 🏗️ PREMISO - PLATFORM OVERVIEW & ARCHITECTURE

**Version**: 2.0.0  
**Date**: 2026-04-13  
**Status**: Production-Ready  
**Compliance Coverage**: 65% (15 areas)

---

## 🎯 EXECUTIVE SUMMARY

Premiso is a **compliance-driven property management platform** for UK letting agents, property managers, and landlords.

**Unique Value**: First property management software with compliance as the driver, not an afterthought.

**Key Metrics**:
- 65% compliance coverage (industry: 20-40%)
- 28 entities, 88 pages, 30+ functions
- 11 automations running daily
- £500k+ penalty exposure tracking
- 4 user portals (tenant, landlord, leaseholder, contractor)

---

## 📊 WHAT PREMISO CAN DO TODAY

### ✅ Property Management
- Manage unlimited properties and units
- Track tenancies, tenants, contacts
- Company registration (RTM, managing agents)
- Document storage and messaging

### ✅ Financial Management
- Stripe payments (recurring rent)
- Automated rent reminders
- Bank reconciliation
- Landlord statements
- Service charge accounting

### ✅ Compliance Management (65% Coverage)
- 15 compliance areas tracked
- Automated expiry alerts
- Penalty exposure calculator
- Gas Safety, EICR, Deposits, Right to Rent
- Building Safety Act register
- RTM management

### ✅ Maintenance
- AI-powered triage
- Contractor assignment
- Emergency callouts (24/7)
- Out-of-hours service tiers

### ✅ Sales & Lettings
- Lead scoring (AI-powered)
- Viewing scheduling
- Offer management
- Sales progression (14 stages)
- Brochure generation (PDF)
- Market reports (AI)

### ✅ Automation
- Daily compliance checks
- Rent payment processing
- Tenant onboarding
- Custom workflows (no-code)

### ✅ Portals
- Tenant (rent, maintenance, documents)
- Landlord (financials, updates)
- Leaseholder (service charges, RTM)
- Contractor (job management)
- Buyer (offer tracking)

---

## 🏛️ TECHNICAL ARCHITECTURE

### Stack Overview
```
Frontend: React 18 + TypeScript + Tailwind CSS + Radix UI
Backend: Base44 Platform (BaaS) + Deno Deploy
Database: Base44 Entities (NoSQL)
Integrations: Stripe, Companies House, Land Registry, Base44 AI
```

### Architecture Diagram
```
┌─────────────────┐
│  User Interface │ (70+ pages, 100+ components)
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  React Router   │ (88 routes, auth protection)
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Base44 SDK     │ (entities, functions, auth)
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Base44 Platform │ (database, auth, automations)
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│Backend Functions│ (30+ Deno functions)
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│External Services│ (Stripe, AI, OAuth)
└─────────────────┘
```

### Design System
- **Colors**: Navy Blue (#1E3A8A), Gold (#F59E0B)
- **Fonts**: Inter (sans-serif), Playfair Display (serif)
- **Components**: 40+ Shadcn/UI + 50+ custom
- **Responsive**: Mobile, tablet, desktop
- **Accessible**: WCAG 2.1 AA

---

## 📦 ENTITY FRAMEWORK (28 Entities)

### Core Entities (20)
1. **Company** - RTM companies, managing agents, directors
2. **Property** - Buildings, developments, land
3. **Unit** - Flats, apartments, rooms
4. **Tenant** - Individuals, organizations
5. **Contact** - Business network (contractors, solicitors)
6. **FinancialTransaction** - Income, expenses, transfers
7. **MaintenanceOrder** - Repairs, inspections
8. **SafetyCertificate** - Generic certificates
9. **GasSafetyCertificate** - CP12 annual records
10. **EICRCertificate** - Electrical (5-year cycle)
11. **BuildingSafety** - Building Safety Act 2023
12. **RTMManagement** - Right to Manage administration
13. **LeaseholderRights** - Statutory rights tracking
14. **DepositProtection** - 30-day protection
15. **RightToRentCheck** - Immigration Act compliance
16. **CertificateExpiryAlert** - Automated alerts
17. **ComplianceAlertConfig** - Alert configuration
18. **EmergencyCallout** - 24/7 emergencies
19. **Message** - Communication tracking
20. **Tenancy** - Lease agreements

### Sales Module (8)
21. **SalesListing** - Property listings
22. **Offer** - Purchase offers
23. **ViewingAppointment** - Viewings
24. **SalesLead** - CRM leads
25. **SalesCommunication** - Message threads
26. **SalesTransaction** - Sales progression
27. **BuyerPortalOffer** - Portal offers
28. **MarketReport** - AI market analysis

---

## 📋 MODULE BREAKDOWN (12 Modules)

### 1. Property Management
- `/properties`, `/units`, `/tenants`, `/contacts`, `/companies`
- Property search, unit tracking, tenant management

### 2. Compliance Dashboard
- `/compliance`, `/compliance-audit`, `/compliance-dashboard-2`
- `/certificate-compliance`, `/building-safety-register`
- 65% coverage, penalty tracking, automated alerts

### 3. Financial Management
- `/financials`, `/rent-ledger`, `/service-charges`, `/ground-rent`
- `/banking`, `/expenses`, `/financial-reporting`
- Stripe payments, recurring rent, bank reconciliation

### 4. Maintenance Management
- `/maintenance`, `/maintenance-workflow`, `/emergency-callouts`
- `/out-of-hours`, `/contractor-portal`
- AI triage, contractor assignment, 24/7 emergencies

### 5. Sales & Lettings CRM
- `/sales`, `/crm`, `/viewings`, `/buyer-portal`
- `/market-reports`, `/agent-performance`
- Lead scoring, sales progression, AI valuations

### 6. Document Management
- `/document-repository`, `/document-templates`
- `/document-automation`
- Bulk generation, template merging

### 7. Workflow Automation
- `/workflows`, `/workflow-executions`
- No-code builder, entity triggers, email/SMS actions

### 8. Block Management
- `/block-management`, `/rtm-management`
- `/service-charges-management`, `/leaseholder-portal`
- RTM claims, service charges, leaseholder rights

### 9. Tenant & Leaseholder Portals
- `/tenant-portal`, `/leaseholder-portal`
- Self-service: rent, maintenance, documents

### 10. Out-of-Hours Call Center
- `/out-of-hours`, `/call-center-config`
- `/out-of-hours-pricing`, `/out-of-hours-onboarding`
- 24/7 call handling, tier routing, SLA tracking

### 11. Integrations & API
- `/integrations`, `/api-integrations`, `/accounting`
- Stripe, Companies House, Land Registry, QuickBooks/Xero

### 12. Setup & Configuration
- `/setup`, `/dev-demo-switcher`, `/demo-station`
- User management, demo data, white-label branding

---

## ⚙️ AUTOMATION ENGINE (11 Active)

### Scheduled Automations (7)
1. **Daily Certificate Expiry Check** (8:00 AM) - Email alerts
2. **Daily Recurring Rent Payments** (5:00 AM) - Stripe processing
3. **Daily Rent Notifications** (5:00 AM) - Due/arrears emails
4. **Daily Sales Materials Update** (7:00 AM) - Brochure refresh
5. **Daily Compliance Gap Audit** (6:00 AM) - Gap analysis
6. *(2 additional configured)*

### Entity Automations (4)
1. **Offer Status Change** - SMS/email on offer update
2. **Automatic Tenant Onboarding** - Portal account + welcome email
3. **Out-of-Hours Auto-Escalation** - Tier-based contractor routing
4. *(1 additional configured)*

### Connector Automations (Available)
- Google Calendar (viewings)
- Slack (notifications)
- Stripe webhooks (payments)

---

## 🔧 BACKEND FUNCTIONS (30+)

### By Category
- **Compliance** (8): Expiry checks, gap audits, notice generation
- **Payments** (6): Stripe processing, recurring rent, webhooks
- **Sales** (7): Brochures, valuations, market reports, performance
- **Maintenance** (4): AI triage, reports, emergency escalation
- **Documents** (4): Bulk generation, template merging
- **Communication** (3): Notifications, SMS, confirmations
- **Integrations** (3): API testing, accounting sync
- **Demo/Setup** (3): Demo data, user creation
- **Out-of-Hours** (2): Automation setup, escalation

### Function Pattern
```javascript
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const user = await base44.auth.me();
  
  if (!user || user.role !== 'admin') {
    return Response.json({ error: 'Unauthorized' }, { status: 401/403 });
  }
  
  // Function logic
  return Response.json({ success: true, data: result });
});
```

---

## 🔐 SECURITY & COMPLIANCE

### Security Measures
- **Auth**: Base44 built-in, JWT sessions, MFA (planned)
- **Authorization**: RBAC (admin/user/contractor/tenant/landlord)
- **Encryption**: TLS 1.3 (transit), AES-256 (rest)
- **Validation**: Input schemas, SQL injection prevention, XSS protection
- **Audit**: Access logging, change tracking

### GDPR Compliance
- **Lawful Basis**: Contract performance
- **Rights**: Access, rectification, erasure, portability
- **Measures**: Privacy by design, data minimization, encryption
- **Docs**: Privacy Policy (required), DPA template (required)

---

## 📈 CURRENT CAPABILITIES

### Production-Ready ✅
- Property & tenant management
- Financial processing (Stripe test mode)
- Compliance tracking (65% coverage)
- Maintenance workflow
- Sales CRM
- Document automation
- 4 user portals
- 11 automations
- 30+ backend functions

### Pre-Launch Requirements ⚠️
- [ ] Legal: ToS, Privacy Policy, DPA (£2-3k)
- [ ] Stripe: Live mode + webhooks
- [ ] Domain: Custom domain + email (£50-100)
- [ ] Support: Help docs, videos, ticketing
- [ ] Monitoring: Uptime, errors, analytics
- [ ] Marketing: Landing page, launch announcement

**Timeline**: 7-day sprint to launch  
**Budget**: £2,500-4,000 one-time + £31/month

---

## 🗺️ ROADMAP

### Phase 2 (Weeks 1-2): Launch
- Legal documents
- Stripe live
- Custom domain
- Support setup
- **Target**: 5-10 customers

### Phase 3 (Weeks 3-8): Enhanced Compliance
- EPC & MEES
- Smoke/CO alarms
- HMO licensing
- Legionella
- **Target**: 95% compliance coverage

### Phase 4 (Months 3-6): Scale
- Mobile apps
- Advanced analytics
- AI chatbot
- API marketplace
- **Target**: 100+ customers, £10k MRR

### Phase 5 (Months 6-12): Expansion
- Scotland/Wales compliance
- International (Ireland, Australia)
- Commercial property
- **Target**: 500+ customers, £50k MRR

---

## 📊 BUSINESS METRICS

### Development
- **Time**: 8 weeks
- **Code**: 50,000+ lines
- **Entities**: 28
- **Pages**: 88
- **Functions**: 30+

### Launch Targets (Month 1)
- Customers: 5-10
- MRR: £245-£495
- Visitors: 100
- Conversion: 25%

### Growth Targets (Month 3)
- Customers: 30+
- MRR: £1,470+
- Visitors: 1,000
- Churn: <5%

### Scale Targets (Month 12)
- Customers: 200+
- MRR: £10,000+
- Market: Top 3 UK compliance tech

---

## 🎯 UNIQUE SELLING POINTS

1. **First Compliance-Driven Platform**
   - 65% coverage vs 20-40% industry average
   - Proactive vs reactive compliance

2. **Automated Penalty Prevention**
   - £500k+ exposure tracked in real-time
   - Alerts before breaches occur

3. **Unified Dashboard**
   - All compliance in one place
   - 0-100% compliance score

4. **UK Legislation Focus**
   - Built on latest regulations
   - Gas Safety, EICR, Building Safety Act, Right to Rent

---

## 📞 NEXT STEPS

**Immediate** (This Week):
1. Review `IMMEDIATE_ACTION_PLAN.md`
2. Choose launch path (7-day vs 14-day)
3. Engage solicitor for legal docs
4. Purchase domain + set up email
5. Configure Stripe live mode

**Documentation Available**:
- `LAUNCH_CHECKLIST.md` - 90-day comprehensive checklist
- `LAUNCH_FAST_TRACK.md` - 14-day accelerated plan
- `IMMEDIATE_ACTION_PLAN.md` - 7-day sprint
- `EXECUTIVE_SUMMARY.md` - Investor-ready summary
- `COMPLIANCE_ROADMAP.md` - Full compliance audit
- `PLATFORM_ENTITY_REFERENCE.md` - Entity details (separate file)
- `PLATFORM_MODULES_GUIDE.md` - Module details (separate file)

---

**Premiso - Compliance-Driven Property Management**  
*"The first property management software with compliance as the driver"*

**Contact**: hello@premiso.co.uk  
**Web**: www.premiso.co.uk  
**Status**: Production-Ready, Pre-Launch