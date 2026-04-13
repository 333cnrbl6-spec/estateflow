# Demo Data & Printable Materials Integration Guide

## Overview

This guide provides a complete workflow for setting up demo environments, generating printable sales/onboarding materials, and guiding new users through the guided onboarding wizard.

All three streams are interconnected:
- **Demo Setup** → Demo data functions
- **Printable Materials** → PDF/print generators
- **Guided Onboarding** → Interactive wizard interface

---

## Part 1: Demo Data Setup Functions

### Available Demo Setup Functions

#### 1. buildAgentDemo (SalesDemoSetup)
**Location:** `functions/buildAgentDemo.js`  
**UI:** `pages/SalesDemoSetup.jsx`  
**Purpose:** Create realistic UK property agency demo with companies, properties, tenants

**What It Creates:**
- 1 primary agency company (with Companies House lookup)
- 3-5 associated companies
- 10-15 properties across regions
- 40-50 tenants
- 20+ transactions
- Financial summaries by property

**When to Use:**
- Sales demonstrations to potential clients
- Internal training for new employees
- Platform feature walkthrough
- Performance testing with realistic data

**Setup Time:** ~5 minutes

**Related Materials:**
- 📄 [SalesBrochure.jsx](./pages/SalesBrochure) - Agent pitch deck
- 📄 [SalesOnePageSummary.jsx](./pages/SalesOnePageSummary) - Quick summary
- 📊 [SalesDashboard.jsx](./pages/SalesDashboard) - Demo dashboard view

---

#### 2. generateSalesDemoData (Standalone)
**Location:** `functions/generateSalesDemoData.js`  
**Purpose:** Lightweight demo data (sales-focused)

**What It Creates:**
- 1 company
- 5 properties
- 20 sales leads
- Viewing appointments
- Offers & transactions

**When to Use:**
- Sales pipeline demonstrations
- Quick internal testing
- Training sales team
- Feature reviews with stakeholders

**Setup Time:** ~2 minutes

---

#### 3. createRBMDemoUser
**Location:** `functions/createRBMDemoUser.js`  
**Purpose:** Create branded demo environment for RBM (specific partner)

**What It Creates:**
- Company branded as "RBM Limited"
- 8-10 properties (focus on block management)
- 60+ tenants
- Service charge scenarios
- Compliance certificates

**When to Use:**
- Partner-specific demonstrations
- Co-branded pitch materials
- Training RBM staff
- Customized onboarding flow

**Setup Time:** ~3 minutes

---

#### 4. populateRBMFullDemo
**Location:** `functions/populateRBMFullDemo.js`  
**Purpose:** Complete end-to-end RBM demo with all modules active

**What It Creates:**
- Full company structure
- Properties + units
- Tenants + leases
- Maintenance tickets with contractor assignments
- Financial transactions
- Compliance records
- Service charges
- Bank reconciliation

**When to Use:**
- Comprehensive product tours
- Full-feature demonstrations
- Extended trials (2-week demos)
- Client decision support

**Setup Time:** ~10 minutes

---

### How to Trigger Demo Setup

**Via UI (Easiest)**
1. Go to `/sales-demo-setup` (Sales team only)
2. Search for company (Real UK company or demo)
3. Click "Build Demo"
4. Wait ~5 minutes
5. Redirect to dashboard

**Via API (Automated)**
```javascript
// From admin function or script
const result = await base44.functions.invoke('buildAgentDemo', {
  company_name: "PropertyCo UK Ltd",
  company_number: "12345678",
  region: "london",
  property_count: 15,
});
```

**Via Admin Page (Direct)**
1. Go to `/dev-demo-switcher` (Admin only)
2. Select demo type
3. Click "Initialize"
4. Verify data created

---

## Part 2: Printable Materials Generation

### Available Materials

#### 1. Sales Brochure (PDF)
**Generator:** `pages/SalesBrochureGenerator.jsx`  
**Output:** 8-page A4 PDF  
**Time to Generate:** 2-3 minutes

**Contents:**
1. Cover page (company name, agent photo)
2. Platform overview
3. Key features (5 feature highlights)
4. Service comparison (vs. competitors)
5. Pricing tiers
6. Success stories (anonymized)
7. Implementation timeline
8. Contact & CTA

**Usage:**
- Download PDF for sales meetings
- Share via email with prospects
- Print for in-person pitches
- Include in proposal documents

**How to Generate:**
1. Go to `/sales-brochure-generator`
2. Enter company name / lookup from dashboard
3. Click "Generate PDF"
4. Download A4 PDF
5. Print or share digitally

**Customize:**
- Logo: Auto-loads from company profile
- Pricing: Pull from PRICING_TIERS config
- Features: Auto-populated from platform capabilities
- Testimonials: Can be hard-coded or pulled from CRM

---

#### 2. One-Page Summary
**Generator:** `pages/SalesOnePageSummary.jsx`  
**Output:** 1-page PDF or web view  
**Time to Generate:** <1 minute

**Contents:**
- Company logo
- 3-line value proposition
- 6 key benefits
- Pricing at a glance
- Call-to-action
- Contact details

**Usage:**
- Email introductions
- LinkedIn sales attachments
- Quick reference for prospects
- Follow-up materials

**How to Generate:**
1. Go to `/sales-one-pager`
2. Auto-pulls from company profile
3. Download or share

---

#### 3. Product Brochure
**Location:** `pages/ProductBrochure.jsx`  
**Output:** Static web page + printable  
**Time:** Always available

**Contents:**
- Platform architecture overview
- Module descriptions (Property, Tenant, Finance, etc.)
- Compliance features
- Integration ecosystem
- Security/data protection
- Team capabilities

**Usage:**
- Website resource
- Email material
- Training document
- Partner reference

---

#### 4. Market Reports
**Generator:** `functions/generateMarketReport.js`  
**Output:** PDF report with charts  
**Time to Generate:** 3-5 minutes

**Contents:**
- Market opportunity analysis
- Regional trends
- Competitor positioning
- Growth projections
- ROI calculations

**How to Generate:**
1. Call from admin
2. Specify region (London, Brighton, Leeds, etc.)
3. Report auto-generates with current data
4. Download PDF

**Usage:**
- Board presentations
- Investor pitches
- Strategic planning
- Partner discussions

---

#### 5. Admin Onboarding Checklist (Printable)
**Location:** [ADMIN_ONBOARDING_GUIDE.md](./ADMIN_ONBOARDING_GUIDE.md)  
**Output:** Markdown → Print as PDF  
**Time:** On-demand

**Contents:**
- 10-phase setup checklist
- Time estimates per phase
- Action items
- Success criteria

**How to Use:**
1. Open guide in browser
2. Print to PDF (Cmd+P)
3. Mark off as you complete phases
4. Share with team

---

### Material Generation Workflow

```
Sales Demo Setup
    ↓
    ├─→ Generate Brochure PDF → Email to prospect
    ├─→ Generate One-Pager → LinkedIn/email follow-up
    ├─→ Generate Market Report → Strategic discussion
    └─→ Create Demo Account → Interactive walkthrough

New User Signup
    ↓
    ├─→ Subscriber Onboarding Wizard → Step-by-step setup
    ├─→ Print Admin Checklist → Physical reference
    └─→ Generate Compliance Report → Ongoing reference
```

---

## Part 3: Guided Onboarding Module

### SubscriberOnboarding Wizard
**Location:** `pages/SubscriberOnboarding.jsx`  
**Route:** `/onboarding`  
**Triggered On:** New user signup / self-serve setup

### 13-Step Wizard Flow

```
Step 1: Company Search
  ├─ Companies House lookup (auto-fill)
  ├─ Manual entry option
  └─ Confirmation
     
Step 2: Officers & Control
  ├─ Fetch from Companies House
  ├─ Multi-select for significant officers
  └─ Auto-discover associated companies
     
Step 3: Addresses
  ├─ Registered address (pre-filled)
  └─ Add branch/trading addresses
     
Step 4: Services
  ├─ Multi-select (Lettings, Block Mgmt, RTM, etc.)
  ├─ Show 10 service types
  └─ Pre-select based on company profile
     
Step 5: Software
  ├─ Current accounting software (Xero, Sage, QB)
  ├─ Property mgmt software
  ├─ Portals (OpenRent, Rightmove)
  └─ File storage (Google Drive, OneDrive)
     
Step 6: Banking & Accounting
  ├─ Select banks
  ├─ Data storage locations
  └─ Accounting features
     
Step 7: Data Audit
  ├─ What data they have (Properties, Tenants, etc.)
  └─ Rough counts
     
Step 8: Data Sources
  ├─ Where data is stored (Drive, Dropbox, Email, etc.)
  └─ AI-guided data gleaning
     
Step 9: Import Pipeline
  ├─ AI analyzes sources
  └─ Recommends mapping strategy
     
Step 10: File Upload
  ├─ Drag-drop or CSV mode
  ├─ Smart file classification (AI)
  └─ Data preview
     
Step 11: Deduplication
  ├─ AI identifies duplicates
  └─ Merge suggestions
     
Step 12: Cleanse & Stage
  ├─ Standardize data
  ├─ Risk-free staging
  └─ Quality scores
     
Step 13: Review & Create
  ├─ Final review
  ├─ Approve & commit
  └─ Environment created
```

### Entry Points

**1. Self-Serve (New Customer)**
- Land on signup page
- Enter email → verification
- Redirect to `/onboarding`
- Complete 13-step wizard
- Environment created

**2. Sales-Assisted (With Demo)**
1. Sales team creates demo via `buildAgentDemo`
2. Shares `/sales-demo-setup?token=...`
3. Prospect explores demo
4. If interested, upgrade to `/onboarding` with pre-filled data
5. Skip steps 1-4 (already provided)
6. Resume at step 5

**3. Admin-Initiated**
- Admin goes to `/onboarding` manually
- Completes wizard
- Creates environment for client

---

## Part 4: Complete Workflow Integration

### Sales Prospect Journey

```
1. Marketing Website
   └─→ "See Demo" CTA
       └─→ /sales-demo-setup
           ├─ Search company
           ├─ Build demo (5 min)
           └─ Explore dashboard
               │
2. Sales Follow-up
   ├─ Download SalesBrochure PDF
   ├─ Send SalesOnePageSummary via email
   ├─ Schedule call
   └─ Share market report with decision-makers
       │
3. Decision & Purchase
   └─→ Redirect to /onboarding
       ├─ Pre-fill company info from demo
       ├─ Complete 13-step wizard
       ├─ Import live data
       └─ Go-live ready
```

### Internal Employee Training

```
1. Onboard New Employee
   ├─ Create demo: /dev-demo-switcher
   ├─ Select "Full RBM Demo"
   └─ 10 min setup
       │
2. Training Materials
   ├─ Print ProductBrochure.pdf
   ├─ Print AdminOnboarding checklist
   ├─ Share SalesBrochure for context
   └─ Share Knowledge Base links
       │
3. Hands-on Practice
   ├─ Access demo environment
   ├─ Follow [ADMIN_ONBOARDING_GUIDE.md](./ADMIN_ONBOARDING_GUIDE.md) phases
   ├─ Complete checklist items
   └─ Ask questions in #training Slack
       │
4. Certification
   └─ Manager sign-off on checklist
```

### Partner Onboarding (Co-branded)

```
1. Partner Agreement
   ├─ Sign partnership MOU
   └─ Allocate demo budget
       │
2. Create Branded Environment
   ├─ Call createRBMDemoUser or partner equivalent
   ├─ Customize branding
   └─ Load partner-specific data
       │
3. Generate Partner Materials
   ├─ Co-branded brochure (SalesBrochureGenerator)
   ├─ One-page summary with partner logo
   ├─ Market report for partner's market
   └─ Admin checklist for partner onboarding
       │
4. Partner Training
   ├─ Webinar walkthrough
   ├─ Share admin checklist
   ├─ Provide knowledge base
   └─ Assign technical contact
       │
5. Go-to-Market
   ├─ Partner launches demo to their customers
   ├─ Customers complete /onboarding wizard
   ├─ Premiso + Partner revenue share
   └─ Ongoing support
```

---

## Part 5: Material Customization

### Brochure Customization
Edit `/pages/SalesBrochureGenerator.jsx` to customize:
- Feature list (pull from CONFIG)
- Pricing display (reference PRICING_TIERS)
- Testimonials section (hardcode or API call)
- Company logo (auto-fetch or manual)

### One-Pager Customization
Edit `/pages/SalesOnePageSummary.jsx`:
- Value proposition text
- Benefit icons/descriptions
- CTA button text
- Contact details

### Admin Checklist Customization
Edit [ADMIN_ONBOARDING_GUIDE.md](./ADMIN_ONBOARDING_GUIDE.md):
- Add service-specific phases
- Adjust time estimates
- Add custom success criteria
- Include partner details

---

## Part 6: Quick Reference Matrix

### By User Type

| User Type | Start Here | Demo Setup | Materials | Onboarding |
|-----------|-----------|-----------|-----------|-----------|
| Sales Team | `/sales-demo-setup` | buildAgentDemo | SalesBrochure + OnePageSummary | Demo only, not onboarding |
| New Customer (Self-serve) | `/onboarding` | N/A (skip demo) | N/A | Full 13-step wizard |
| New Customer (Sales-assisted) | `/sales-demo-setup` then `/onboarding` | buildAgentDemo | All materials | Steps 5-13 |
| New Employee | `/dev-demo-switcher` | generateSalesDemoData or populateRBMFullDemo | ProductBrochure + AdminChecklist | [ADMIN_ONBOARDING_GUIDE.md](./ADMIN_ONBOARDING_GUIDE.md) |
| Partner | Partner dashboard | createRBMDemoUser | Co-branded materials | Partner-specific guide |
| Support Team | Dashboard | As needed | All guides | Knowledge base |

### By Material Type

| Material | Generator | Output | Use Case | Time |
|----------|-----------|--------|----------|------|
| Sales Brochure | SalesBrochureGenerator | 8-page PDF | Sales pitches | 2-3 min |
| One-Pager | SalesOnePageSummary | 1-page PDF | Quick reference | <1 min |
| Product Brochure | ProductBrochure page | Web + printable | General info | N/A |
| Market Report | generateMarketReport fn | PDF report | Strategic discussions | 3-5 min |
| Admin Checklist | ADMIN_ONBOARDING_GUIDE.md | Markdown→PDF | Setup reference | Print-on-demand |

---

## Part 7: Implementation Checklist

### Pre-Launch Setup
- [ ] All demo functions deployed and tested
- [ ] SalesBrochureGenerator functional
- [ ] SalesOnePageSummary functional
- [ ] Market report generation working
- [ ] Subscriber onboarding wizard complete
- [ ] Demo switcher (admin) functional
- [ ] Admin onboarding guide finalized
- [ ] Printable materials created

### Day 1 Testing
- [ ] Create test demo via /sales-demo-setup
- [ ] Generate sample brochure PDF
- [ ] Test onboarding wizard flow
- [ ] Verify data import in step 10
- [ ] Print and review admin checklist
- [ ] Test demo switcher (admin)

### Launch Communication
- [ ] Sales team briefed on demo process
- [ ] Support trained on onboarding wizard
- [ ] Partners provided co-branded materials
- [ ] Knowledge base published
- [ ] Quick reference guide shared

---

## Part 8: Ongoing Maintenance

### Monthly Tasks
- Review demo data freshness (update if stale)
- Update brochure with new pricing/features
- Refresh market report data
- Archive old demo environments

### Quarterly Tasks
- Update admin onboarding guide with new modules
- Create new partner materials
- Refresh training materials
- Collect feedback from onboarding users

### Annual Tasks
- Major refresh of all materials
- Update product brochure for new version
- Rewrite value propositions
- Archive old guides

---

## Support & Escalation

### Demo Issues
- Demo not creating: Check function logs
- Data not importing: Verify CSV format
- Brochure not generating: Check company data
- Contact: #demo-support Slack

### Onboarding Issues
- Wizard stuck: Clear browser cache
- Data not importing: Check file format
- User frustrated: Offer phone walkthrough
- Contact: support@premiso.co.uk

### Material Issues
- PDF not rendering: Try different browser
- Content outdated: Update source configs
- Printing issues: Use "Print to PDF" instead
- Contact: marketing@premiso.co.uk

---

## Integration Points

```
Sales Demo Setup (/sales-demo-setup)
  ├─ Uses: buildAgentDemo function
  ├─ Links to: SalesBrochureGenerator
  ├─ Links to: SalesOnePageSummary
  └─ Links to: Onboarding (if customer wants to upgrade)

SalesBrochureGenerator (/sales-brochure-generator)
  ├─ Uses: Company data from dashboard
  ├─ Generates: 8-page PDF
  └─ Downloadable: Yes

Subscriber Onboarding (/onboarding)
  ├─ 13-step wizard
  ├─ Uses: Companies House API, Cloud storage connectors
  ├─ Imports: CSV data via SmartDropZone
  ├─ Creates: Production company environment
  └─ Links to: Dashboard after completion

Admin Onboarding Guide (Markdown document)
  ├─ 10-phase structured guide
  ├─ Links to: All documentation
  ├─ Printable: Yes
  └─ For: Primary admin setup

Demo Switcher (/dev-demo-switcher)
  ├─ Admin-only page
  ├─ Uses: Demo setup functions
  ├─ Options: generateSalesDemoData, buildAgentDemo, createRBMDemoUser
  └─ Target: Internal training & testing
```

---

## Metrics & Success Criteria

### Demo Setup Metrics
- Demos created per month: Target 20+
- Conversion rate (demo → paid): Target 15%
- Time to create demo: Target <5 min
- User satisfaction: Target 4.5/5 stars

### Onboarding Metrics
- Wizard completion rate: Target 85%+
- Average completion time: Target 1-2 hours
- Data import success: Target 95%+
- User satisfaction: Target 4.5/5 stars

### Material Metrics
- Brochure downloads: Track monthly
- One-pager shares: Track via email
- Market report usage: Track in conversations
- Checklist prints: Estimate from usage
- Print quality feedback: Collect monthly

---

## Version History

| Date | Change | Version |
|------|--------|---------|
| 2026-04-13 | Initial integration guide | 1.0 |

Last Updated: 2026-04-13  
Owner: Product & Sales Teams