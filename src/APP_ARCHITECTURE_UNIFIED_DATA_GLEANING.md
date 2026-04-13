# Unified App Architecture: Intelligent Data Gleaning System

## Vision

A single, intelligent **Data Gleaning & Research Engine** that powers all user journeys:
- **Developer**: Test with rich demo data
- **Sales**: Build contextual demo datasets for targeted sales
- **New User**: Self-serve with guided company research
- **New Subscriber**: Complete onboarding with auto-populated company context

All journeys follow the same 7-step intelligence gathering process, just with different UI flows.

---

## Core Engine: Intelligent Company Research & Data Gleaning

### Step 1: Company Identification
**Input:** Company name or number  
**Output:** Verified company entity with all public data

```javascript
// Unified API
const company = await gleaning.searchCompany({
  query: "RBM Property Management",        // Name search
  companyNumber: "12345678",                // Or Companies House number
  includeAssociated: true,                  // Find related companies
  depth: "full"                             // Full research mode
});

// Returns:
{
  primary: {
    name: "RBM Property Management Ltd",
    number: "12345678",
    status: "active",
    registered_address: "...",
    sic_code: "6832 - Management of real estate on a fee or contract basis",
    incorporation_date: "2015-03-20",
    officers: [...],
    persons_with_control: [...]
  },
  associated_companies: [...],           // Sister companies, group entities
  web_presence: {
    website: "www.rbmproperty.co.uk",
    social_media: {...},
    phone: "020 XXXX XXXX",
    email: "info@rbmproperty.co.uk"
  },
  business_profile: {
    services: ["Residential Lettings", "Block Management", "..."],
    portfolio_size: "~150 properties",
    regions: ["London", "Brighton"],
    estimated_revenue: "£X-Y million"
  },
  compliance_status: {
    fca_regulated: boolean,
    redress_scheme: "...",
    client_money_protection: boolean
  }
}
```

### Step 2: Officer & Shareholder Intelligence
**Extract:** All directors, officers, PSCs, shareholders

```javascript
const officers = await gleaning.getOfficers({
  companyNumber: "12345678",
  includeNationality: true,
  includeAppointmentHistory: true,
  findOtherDirectorships: true  // Find all other companies these people direct
});

// Returns officers + their other company involvements
```

### Step 3: Associated Companies Discovery
**Auto-discover:** Sister companies, group entities, parent/subsidiaries

```javascript
const associated = await gleaning.findAssociatedCompanies({
  primaryCompany: "12345678",
  includeHistorical: true,        // Dissolved/merged companies
  findByOfficers: true,            // Companies shared officers direct
  findByAddress: true,             // Companies at same address
  depth: 3                          // 3 levels of association
});
```

### Step 4: Business Intelligence Gleaning
**Source:** Public websites, business directories, social media

```javascript
const businessData = await gleaning.gatherBusinessIntelligence({
  company: "RBM Property Management Ltd",
  website: "www.rbmproperty.co.uk",
  sources: [
    "website_scrape",              // Parse their website
    "social_media",                // LinkedIn, Facebook, Twitter
    "google_maps",                 // Branch locations from Maps
    "rightmove/zoopla",            // Property listings
    "trustpilot/reviews",          // Customer reviews
    "business_databases"           // Credit reports, turnover
  ]
});

// Returns:
{
  services: [
    "Residential Lettings",
    "Block Management",
    "Service Charge Accounting",
    "Compliance Management"
  ],
  portfolio: {
    total_properties: 147,
    breakdown_by_type: {
      residential_units: 2100,
      blocks_managed: 15,
      commercial: 23
    },
    regions: ["London", "Brighton", "Ipswich"],
    price_range: "£1,200 - £5,000/month"
  },
  locations: [
    { address: "...", type: "HQ", employees: 45 },
    { address: "...", type: "Branch", employees: 12 }
  ],
  staff_estimate: 120,
  technology_stack: [
    "Xero",                        // Accounting software (from IT setup)
    "OpenRent",
    "Rightmove"
  ],
  reputation: {
    average_rating: 4.3,
    review_count: 87,
    common_complaints: ["Response time", "..."],
    common_praise: ["Professional", "..."]
  }
}
```

### Step 5: Regulatory & Compliance Status
**Verify:** FCA registration, redress schemes, client money protection

```javascript
const compliance = await gleaning.checkComplianceStatus({
  company: "RBM Property Management Ltd",
  check: [
    "fca_regulation",
    "redress_scheme",
    "client_money_protection",
    "gdpr_compliance",
    "deposit_schemes",
    "gas_safety"
  ]
});
```

### Step 6: Competitor Intelligence (Sales Context)
**For Sales:** Understand competitive positioning

```javascript
const competitors = await gleaning.findCompetitors({
  primaryCompany: "RBM Property Management Ltd",
  region: "London",
  propertyTypes: ["residential", "commercial"],
  estimatedCompetitors: 5
});

// Returns: Top 5 competitors, their size, pricing, positioning
```

### Step 7: Data Readiness Assessment
**Predict:** What data they likely have & where it's stored

```javascript
const dataProfile = await gleaning.predictDataProfile({
  company: "RBM Property Management Ltd",
  companySize: "medium",                    // 100-500 staff
  services: ["Lettings", "Block Mgmt"],
  technology: ["Xero", "OpenRent"],
  regions: 3
});

// Returns prediction:
{
  likely_data_types: {
    properties: { estimate: 150, maturity: "high" },
    tenants: { estimate: 2100, maturity: "high" },
    financial: { estimate: "3 years", maturity: "medium" },
    maintenance: { estimate: "1 year", maturity: "low" }
  },
  likely_storage: [
    "Xero exports (accounting)",
    "OpenRent (properties/tenants)",
    "Google Drive (documents)",
    "Email archives"
  ],
  data_import_complexity: "medium",
  estimated_setup_time: "4-6 hours"
}
```

---

## Unified User Journeys Using Same Engine

### Journey 1: Developer / Internal Testing
**Entry Point:** `/dev-demo-switcher` or API  
**Goal:** Create realistic test data quickly

```
1. Select company type (Agency, Lettings, Block Mgmt)
2. Engine generates: Company + officers + properties + tenants
3. Pre-loads test scenarios (overdue rent, maintenance, compliance)
4. Instant dashboard with data
```

**Uses:** Step 1 (basic) + auto-generation

---

### Journey 2: Sales Team Building Targeted Demo
**Entry Point:** `/sales-targeted-demo-builder` (NEW)  
**Goal:** Create demo that mirrors prospect's exact situation

```
Sales Person Flow:
├─ 1. Search prospect company
│   └─ Engine runs Steps 1-7 (full intelligence gather)
│
├─ 2. Review company profile
│   ├─ Show: Services, size, locations, tech stack
│   ├─ Show: Competitors they're losing to
│   └─ Show: Data complexity estimate
│
├─ 3. Build matching demo dataset
│   ├─ Match property count to their portfolio
│   ├─ Match services to their offering
│   ├─ Match regions to their locations
│   └─ Pre-populate with realistic scenarios
│
├─ 4. Generate sales materials
│   ├─ Customized brochure (reference their competitors)
│   ├─ ROI calculator (based on their size)
│   ├─ Implementation timeline (based on complexity)
│   └─ Success story from similar company
│
└─ 5. Share demo + materials
    └─ Single link: Demo + brochure + timeline + calculator
```

**Uses:** All Steps 1-7, custom dataset building

---

### Journey 3: New User (Self-Serve, No Existing Company)
**Entry Point:** `/onboarding` (RESTRUCTURED)  
**Goal:** Create company profile from scratch with auto-populated context

```
New User (Individual/Startup):
├─ 1. Create company profile
│   ├─ Name, address, registration info
│   └─ Engine verifies if exists in Companies House
│
├─ 2. Select services offered
│   ├─ Dropdown: Lettings, Block Mgmt, etc.
│   └─ Show market size for chosen services
│
├─ 3. Portfolio size estimate
│   ├─ Number of properties
│   ├─ Number of tenants/units
│   └─ Regions covered
│
├─ 4. Technology setup
│   ├─ Current accounting software
│   ├─ Current property management software
│   └─ File storage location
│
├─ 5. Data import (if any)
│   ├─ Upload CSV/files
│   ├─ Engine predicts import complexity
│   └─ Guides through data cleansing
│
└─ 6. Create environment
    └─ Ready to go with basic setup
```

**Uses:** Steps 1-2 (basic verification) + custom entries

---

### Journey 4: New Subscriber (Established Company)
**Entry Point:** `/subscriber-intelligent-onboarding` (RESTRUCTURED)  
**Goal:** Onboard with deep company research, auto-populated data, smart import

```
New Subscriber (Established Company):
├─ 1. Company Lookup (Step 1)
│   ├─ Search Companies House
│   └─ Show matching results
│
├─ 2. Verify Company & Review Officers (Steps 2)
│   ├─ Confirm primary company
│   ├─ See all directors/officers
│   ├─ Multi-select key personnel
│   └─ Auto-suggest admin users
│
├─ 3. Discover Associated Entities (Step 3)
│   ├─ Show sister companies, subsidiaries
│   ├─ Multi-select to manage together
│   └─ Explain group structure
│
├─ 4. Auto-Populate Business Profile (Steps 4-5)
│   ├─ Show: Services (from website/data)
│   ├─ Show: Portfolio size estimate
│   ├─ Show: Locations/branches
│   ├─ Show: Technology stack
│   └─ User can edit/confirm each
│
├─ 5. Regulatory Check (Step 5)
│   ├─ Display: FCA status, redress scheme, etc.
│   └─ Highlight: Compliance requirements
│
├─ 6. Data Profile Prediction (Step 7)
│   ├─ Show: "Based on your company, you likely have:"
│   ├─ Properties (estimated count)
│   ├─ Tenants (estimated count)
│   ├─ Financial records (estimated period)
│   ├─ Likely storage locations (Drive, Xero, etc.)
│   └─ Estimated import time
│
├─ 7. Data Import Planning
│   ├─ Guided by predicted profile
│   ├─ Smart file classification (based on company)
│   ├─ Auto-mapping for known software (Xero, OpenRent)
│   └─ Risk assessment
│
├─ 8. Smart Data Gleaning (Optional)
│   ├─ For missing data:
│   │   ├─ "Can't find your properties? Check Rightmove/Zoopla"
│   │   ├─ "Missing tenants? Export from OpenRent"
│   │   └─ "Branches not imported? Check Google Maps"
│   └─ AI-assisted gathering
│
├─ 9. Cleanse & Stage
│   ├─ Auto-cleanse based on company type
│   ├─ Pre-populate required fields (based on services)
│   └─ Risk scoring
│
├─ 10. Review & Create
│    └─ Go-live ready with context-aware setup
```

**Uses:** All Steps 1-7, full intelligence gathering

---

## Architecture: Code Organization

```
src/
├─ gleaning/                           (NEW - Core Engine)
│  ├─ CompanyResearch.js               (Steps 1-2)
│  ├─ AssociatedCompanies.js          (Step 3)
│  ├─ BusinessIntelligence.js         (Step 4)
│  ├─ ComplianceCheck.js              (Step 5)
│  ├─ CompetitorAnalysis.js           (Step 6)
│  ├─ DataProfilePrediction.js        (Step 7)
│  └─ GleaningOrchestrator.js         (Combines all)
│
├─ functions/
│  ├─ intelligentGleaning.js          (Backend: runs full engine)
│  ├─ companyResearch.js              (Step 1)
│  ├─ dataProfilePrediction.js        (Step 7)
│  └─ ...existing functions
│
├─ pages/
│  ├─ DeveloperDemoSwitcher.jsx       (Journey 1) [EXISTING, minimal change]
│  ├─ SalesTargetedDemoBuilder.jsx    (Journey 2) [NEW]
│  ├─ OnboardingNewUser.jsx           (Journey 3) [NEW]
│  └─ SubscriberIntelligentOnboarding.jsx (Journey 4) [RESTRUCTURE existing]
│
└─ components/
   ├─ CompanyResearchPanel.jsx        (Shared component)
   ├─ AssociatedCompaniesSelector.jsx (Shared component)
   ├─ BusinessProfileReview.jsx       (Shared component)
   ├─ DataProfilePredictor.jsx        (Shared component)
   └─ SmartImportPlanner.jsx          (Shared component)
```

---

## Implementation Phases

### Phase 1: Core Gleaning Engine (Week 1)
- [ ] `CompanyResearch.js` - Companies House integration
- [ ] `AssociatedCompanies.js` - Find related entities
- [ ] `BusinessIntelligence.js` - Web scraping/data gathering
- [ ] `ComplianceCheck.js` - Regulatory status
- [ ] Test all components

### Phase 2: Shared Components (Week 2)
- [ ] `CompanyResearchPanel.jsx` - Reusable UI
- [ ] `BusinessProfileReview.jsx` - Display gathered data
- [ ] `DataProfilePredictor.jsx` - Show predictions
- [ ] `SmartImportPlanner.jsx` - Guide data import

### Phase 3: Sales Demo Builder (Week 3)
- [ ] Create `/sales-targeted-demo-builder`
- [ ] Deep company research UI
- [ ] Demo dataset customization
- [ ] Material generation (already have)
- [ ] Sharing & tracking

### Phase 4: Restructured Onboarding Flows (Week 4)
- [ ] Update existing onboarding to use gleaning engine
- [ ] New user flow (simpler, no company lookup)
- [ ] Subscriber flow (full intelligence)
- [ ] A/B test conversion rates

---

## Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│ All 4 Journeys Feed Into Shared Gleaning Engine                │
└─────────────────────────────────────────────────────────────────┘

Developer          Sales             New User        New Subscriber
    │               │                   │                 │
    └───────────────┴───────────────────┴─────────────────┘
                    │
                    ▼
        ┌──────────────────────────┐
        │ Intelligent Gleaning API │
        │  (7-step process)        │
        └──────────────────────────┘
                    │
        ┌───────────┼───────────────────────┐
        │           │                       │
        ▼           ▼                       ▼
    Company      Business             Compliance
    Research     Intelligence         & Regulatory
    (Steps 1-3)  (Steps 4, 6)        (Step 5)
        │           │                       │
        └───────────┼───────────────────────┘
                    │
                    ▼
        ┌──────────────────────────┐
        │ Data Profile Prediction  │
        │ (Step 7)                 │
        └──────────────────────────┘
                    │
        ┌───────────┴───────────────┐
        │                           │
        ▼                           ▼
    Demo Dataset            Subscriber Dataset
    Generation               Auto-Population
        │                           │
        └───────────────┬───────────┘
                        │
                        ▼
            Unified Data Import Engine
            (CSV, APIs, Cloud Storage)
                        │
                        ▼
            Production Environment Ready
```

---

## Key Features

### 1. Context-Aware Data Import
- Engine predicts what data user likely has
- Suggests where to find missing data
- Auto-maps fields based on company type

### 2. Competitive Intelligence (Sales)
- Show sales person what competitors user is evaluating
- Position Premiso against those competitors
- Customize ROI calculations

### 3. Smart Recommendations
- "Based on your size, import these 3 things first"
- "You're missing property data - import from Rightmove"
- "Your tech stack uses Xero - we auto-map those fields"

### 4. Predictive Complexity
- Estimate setup time upfront
- Identify data quality issues early
- Plan support needs

### 5. Unified User Experience
- Same intelligent research powers all journeys
- Consistent UI/UX across onboarding flows
- Reduces duplicate work

---

## Integration with Existing Systems

### Companies House API
```javascript
// Already used in SubscriberOnboarding
// Will be centralized in CompanyResearch.js
```

### Existing Demo Generators
```javascript
buildAgentDemo()           // Will use DataProfilePrediction
generateSalesDemoData()    // Will use DataProfilePrediction
createRBMDemoUser()        // Will use new intelligence
```

### Existing Onboarding Wizard
```javascript
// Steps 1-4 will be replaced with Gleaning Engine
// Steps 5-13 remain same but enhanced with predictions
```

---

## Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Onboarding completion rate | 90%+ | Wizard analytics |
| Average time to go-live | 2-3 hours | User timestamps |
| Demo quality rating (sales) | 4.5/5 | Sales feedback |
| Data import accuracy | 95%+ | Data validation |
| User satisfaction | 4.5/5 stars | Post-onboarding survey |
| Sales cycle reduction | 30% faster | Time to decision |

---

## Timeline & Resources

- **Developer Hours:** 120-160 hours (3-4 weeks)
- **QA:** 40 hours
- **Sales Training:** 8 hours
- **Launch Date:** Target end of Week 4

---

Last Updated: 2026-04-13  
Owner: Product & Engineering Teams