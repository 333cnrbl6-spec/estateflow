# Comprehensive Testing Matrix: All User Types × All Subscriber Models

## Overview

This document defines in-depth testing scenarios for all combinations of:
- **4 User Journeys:** Developer, Sales, New User, New Subscriber
- **10 Subscriber Business Models:** Residential Lettings, Block Management, RTM, Freehold Management, Student Lets, Commercial, Sales, Out-of-Hours Service, Maintenance Only, Service Charge Accounting
- **3 Company Sizes:** Small (1-5 properties), Medium (5-100 properties), Large (100+ properties)

**Total Test Scenarios:** 40+ combinations × size variants × functional modules = 500+ discrete test cases

---

## Part 1: User Type × Subscriber Model Matrix

### Subscriber Business Models

| Model | Description | Key Entities | Modules Required | User Count | Complexity |
|-------|-------------|--------------|------------------|-----------|-----------|
| **Residential Lettings** | Individual/small agent managing rental properties | Properties, Tenants, Leases, Rent, Maintenance | Core, Tenant Portal, Reporting | 5-50 | Medium |
| **Block Management** | Managing service charges for leaseholders | Properties/Units, Leaseholders, Service Charges, Ground Rent | Core, Block Mgmt, Compliance | 10-200 | High |
| **Right to Manage (RTM)** | Leaseholder-run block management | Units, Members, Service Charges, Elections | Core, RTM, Governance | 5-100 | High |
| **Freehold Management** | Managing freehold communities | Properties, Freeholders, Maintenance, Insurance | Core, Freehold, Compliance | 5-50 | Medium |
| **Student Lets** | Managing student accommodation | Properties, Students (groups), Leases, Bills | Core, Student Module, Portal | 20-500 | Medium |
| **Commercial** | Commercial property management | Units, Tenants, Service Charges, Utilities | Core, Commercial Module | 3-50 | High |
| **Sales Agency** | Property sales & lettings | Properties, Leads, Offers, Viewings, Transactions | Sales Module, CRM, Reporting | 10-100 | High |
| **Out-of-Hours Service** | After-hours emergency support | Call Logs, Contractors, Escalations, Billing | Out-of-Hours Module, Telecom | 50-1000+ | Very High |
| **Maintenance Only** | Maintenance task management | Properties, Maintenance Requests, Contractors, Invoices | Maintenance Module, Contractor Portal | 5-50 | Low |
| **Service Charge Accounting** | Pure accounting service | Units, Charges, Invoices, Reconciliation | Accounting Module, Compliance | 10-1000+ | High |

---

## Part 2: Developer Testing

### Journey: Developer Building Test Environments

**Entry Point:** `/dev-demo-switcher` or API  
**Goal:** Create realistic test data for feature development

### Test Scenarios by Business Model

#### Scenario 1: Residential Lettings (Small)
**Setup:** 5 properties, 12 tenants, 3 months data

| Test Case | Steps | Success Criteria | Data Needed |
|-----------|-------|------------------|------------|
| **TC-DEV-RL-001** Create demo | 1. Select Residential Lettings 2. Set size=Small | Dashboard loads, 5 properties visible | Properties, Tenants, Rent transactions |
| **TC-DEV-RL-002** Verify data quality | 1. Check property details 2. Verify tenant info | All fields populated, no nulls | Correct data type, realistic values |
| **TC-DEV-RL-003** Test rent flow | 1. View rent ledger 2. Process payment | Payment recorded, balance updated | Tenants with outstanding rent |
| **TC-DEV-RL-004** Maintenance workflow | 1. Create request 2. Assign contractor 3. Close | Status transitions correct | Contractor pool, expense categories |
| **TC-DEV-RL-005** Report generation | 1. Generate monthly report 2. Export PDF | PDF contains all data, charts render | Financial data, property metrics |

#### Scenario 2: Block Management (Medium)
**Setup:** 15 blocks, 300 units, 12 months data, service charges

| Test Case | Steps | Success Criteria | Data Needed |
|-----------|-------|------------------|------------|
| **TC-DEV-BM-001** Create demo | 1. Select Block Management 2. Set size=Medium | 15 blocks + units visible | Block structure, unit numbers |
| **TC-DEV-BM-002** Service charge calculation | 1. Set charges 2. Allocate to units 3. Invoice | Charges correct, invoices generated | Cost categories, allocation rules |
| **TC-DEV-BM-003** Compliance certificates | 1. Upload gas safety 2. Set alerts 3. Track renewal | Alerts trigger on schedule | Certificate templates, expiry logic |
| **TC-DEV-BM-004** Leaseholder portal | 1. Login as leaseholder 2. View charges 3. Access documents | Portal displays correctly, docs accessible | Leaseholder users, sample docs |
| **TC-DEV-BM-005** AGM workflow | 1. Create AGM 2. Send notices 3. Track votes | Notices sent, voting system works | Leaseholder contacts, voting logic |

#### Scenario 3: Sales Agency (Large)
**Setup:** 200+ properties, 500+ leads, 100+ transactions

| Test Case | Steps | Success Criteria | Data Needed |
|-----------|-------|------------------|------------|
| **TC-DEV-SA-001** Create demo | 1. Select Sales Agency 2. Set size=Large | Dashboard shows portfolio stats | Properties, leads, transactions |
| **TC-DEV-SA-002** Lead scoring | 1. View leads 2. Check scoring logic | Leads ranked by value | Lead data, scoring algorithm |
| **TC-DEV-SA-003** Offer workflow | 1. Create offer 2. Negotiate 3. Accept | Status changes tracked | Offer templates, negotiation history |
| **TC-DEV-SA-004** Sales reporting | 1. View pipeline 2. Generate forecast | Pipeline chart accurate | Lead/offer timeline data |
| **TC-DEV-SA-005** Valuation estimates | 1. Request AI valuation 2. Compare comps | Valuations reasonable, comps shown | Property data, AI model |

---

## Part 3: Sales Testing

### Journey: Sales Creating Targeted Demo Datasets

**Entry Point:** `/sales-targeted-demo-builder`  
**Goal:** Create context-specific demo matching prospect's exact situation

### Test Scenarios: Sales Workflow

#### Scenario A: Targeting Residential Lettings Agent
**Setup:** Create demo matching "Local Lettings Ltd" - 25 properties, 60 tenants

| Test Case | Steps | Success Criteria |
|-----------|-------|------------------|
| **TC-SALES-001** Company research | 1. Search "Local Lettings Ltd" 2. Review findings | Shows: Company size, locations, services, tech stack |
| **TC-SALES-002** Competitive analysis | 1. Identify competitors 2. Show positioning | Display: 3-5 competitors, market positioning |
| **TC-SALES-003** Data profile prediction | 1. Analyze company 2. Predict what data they have | Suggest: 25 properties, ~60 tenants, 3-6 months financials |
| **TC-SALES-004** Create matching demo | 1. Build demo with predicted data | Demo has same property count, tenant distribution |
| **TC-SALES-005** Generate materials | 1. Create brochure 2. Generate ROI calc 3. Timeline | PDF with their data, ROI showing impact |
| **TC-SALES-006** Share demo + materials | 1. Generate shareable link 2. Include materials | Single URL with demo + PDF + timeline |
| **TC-SALES-007** Track engagement | 1. Monitor demo usage 2. Note feature usage | CRM logs: Pages viewed, time spent, features used |

#### Scenario B: Targeting Block Management Company
**Setup:** Create demo for "Westminster Estates" - 8 blocks, 250 units, service charges

| Test Case | Steps | Success Criteria |
|-----------|-------|------------------|
| **TC-SALES-BM-001** Research block management needs | 1. Fetch company data 2. Identify pain points | Show: Current challenges (service charge delays, compliance) |
| **TC-SALES-BM-002** Customize to their complexity | 1. Match block count 2. Match unit count 3. Match service charges | Demo shows 8 blocks, 250 units, realistic charge structure |
| **TC-SALES-BM-003** Highlight relevant features | 1. Emphasize: Service charge automation 2. Compliance tracking 3. Leaseholder portal | Feature demo focused on their needs |
| **TC-SALES-BM-004** ROI based on their size | 1. Calculate time saved 2. Estimate cost reduction | Show: 10 hours/month saved, £X cost reduction |
| **TC-SALES-BM-005** Success story from similar company | 1. Find comparable block mgmt customer 2. Share story | Show: How similar company achieved results |

---

## Part 4: New User Testing (No Company Lookup)

### Journey: Individual/Startup Creating Company from Scratch

**Entry Point:** `/onboarding-new-user`  
**Goal:** Setup simple environment for freelancer/startup

### Test Scenarios

#### Scenario: Freelance Lettings Agent Starting Out
**Assumptions:** New entrant, 2-3 properties, minimal data

| Test Case | Steps | Success Criteria |
|-----------|-------|------------------|
| **TC-NU-001** Create company profile | 1. Enter: Name, address, services | Profile created, can be edited |
| **TC-NU-002** Services selection | 1. Select: Residential Lettings 2. Confirm | Dashboard shows correct service type |
| **TC-NU-003** Portfolio size | 1. Enter: 3 properties, 8 tenants | Dashboard reflects numbers |
| **TC-NU-004** Manual data entry | 1. Create 3 properties manually 2. Add tenants | Properties + tenants created, visible |
| **TC-NU-005** First rent collection | 1. Record rent payment 2. Generate receipt | Transaction logged, receipt generated |
| **TC-NU-006** Basic report | 1. Generate monthly summary | Report shows income, tenants, status |
| **TC-NU-007** Invite team member | 1. Add manager user 2. Set permissions | User invited, can log in |
| **TC-NU-008** Export data | 1. Generate CSV 2. Download | Data exports cleanly |

---

## Part 5: New Subscriber Testing (Full Intelligence)

### Journey: Established Company with Deep Company Research

**Entry Point:** `/subscriber-intelligent-onboarding`  
**Goal:** Full onboarding with auto-populated context

### Test Scenarios by Company Size & Business Type

#### Scenario 1: Small Residential Lettings (1-5 properties)
**Example:** Independent agent with 3 properties, 7 tenants

| Test Case | Steps | Success Criteria | Expected Data |
|-----------|-------|------------------|----------------|
| **TC-SUB-SRL-001** Company search | 1. Search Companies House | Company found, details populated | Name, number, address, directors |
| **TC-SUB-SRL-002** Auto-populate from web | 1. Scrape website 2. Fetch social media | Services identified, portfolio estimated | Services: Lettings, regions, size |
| **TC-SUB-SRL-003** Director verification | 1. List all directors 2. Multi-select to invite | Directors shown, can select as users | All director names + roles |
| **TC-SUB-SRL-004** Associated companies | 1. Find related entities 2. Review | No associated companies (solo agent) | Clean data |
| **TC-SUB-SRL-005** Data profile prediction | 1. Predict what data they have | Show: 3 properties, ~7 tenants, 6 months financials | Predictions match business |
| **TC-SUB-SRL-006** Data import guidance | 1. Show: Where to find data 2. Templates provided | Templates for properties, tenants, transactions | CSV templates, cloud storage links |
| **TC-SUB-SRL-007** Import from legacy system | 1. Export from legacy 2. Upload CSV 3. Map fields | Data imports cleanly, no errors | All fields correctly mapped |
| **TC-SUB-SRL-008** Verify data quality | 1. Check: Nulls, duplicates, inconsistencies | Quality score 95%+, warnings minimal | Clean data, high quality |
| **TC-SUB-SRL-009** First live transaction | 1. Record rent payment 2. Send receipt | Transaction visible in ledger | Proper balance updates |
| **TC-SUB-SRL-010** Go-live sign-off | 1. User confirms ready 2. Legacy system deactivated | Environment stable, all data accessible | No downtime |

#### Scenario 2: Medium Block Management (5-100 properties/100-1000 units)
**Example:** Regional block manager with 12 blocks, 450 units

| Test Case | Steps | Success Criteria | Expected Data |
|-----------|-------|------------------|----------------|
| **TC-SUB-MBM-001** Company research | 1. Lookup company 2. Identify all locations | All 12 block locations identified | Block addresses, unit counts |
| **TC-SUB-MBM-002** Business intelligence | 1. Auto-gather info 2. Verify portfolio estimate | Portfolio estimated at ~12 blocks, 450 units | Accurate size prediction |
| **TC-SUB-MBM-003** Officers & shareholders | 1. Fetch directors 2. Identify key contacts | All directors shown, can assign roles | Director names, voting rights |
| **TC-SUB-MBM-004** Compliance requirements | 1. Check regulations 2. Display requirements | Show: Gas safety, EICR, insurance, deposit schemes | All compliance items listed |
| **TC-SUB-MBM-005** Data structure | 1. Auto-create block structure 2. Create units | 12 blocks + 450 units created with nesting | Proper hierarchy |
| **TC-SUB-MBM-006** Import service charges | 1. Upload service charge data 2. Allocate to units | Charges calculated, invoices generated | All units charged correctly |
| **TC-SUB-MBM-007** Leaseholder setup | 1. Import leaseholder list 2. Create accounts | 450 leaseholder accounts created, portal ready | Leaseholders can log in |
| **TC-SUB-MBM-008** Maintenance tickets | 1. Import maintenance history 2. Assign contractors | Historical maintenance visible, contractors assigned | Complete audit trail |
| **TC-SUB-MBM-009** Financial reconciliation | 1. Import bank statements 2. Reconcile | All transactions matched, zero variance | Clean reconciliation |
| **TC-SUB-MBM-010** Compliance certificates | 1. Upload 12 sets of gas certs 2. Set alerts | Alerts configured, renewals tracked | Annual compliance cycle |
| **TC-SUB-MBM-011** AGM workflow | 1. Setup AGM 2. Generate notices 3. Create voting | 450 leaseholders can vote, results tracked | Full AGM cycle |
| **TC-SUB-MBM-012** Go-live testing | 1. Full month cycle test 2. Service charges re-run 3. Leaseholder payments | All systems working, data accurate | 0 errors |

#### Scenario 3: Large Sales Agency (100+ properties, 500+ leads)
**Example:** Multi-branch sales agency with 250 properties, 2000+ leads

| Test Case | Steps | Success Criteria | Expected Data |
|-----------|-------|------------------|----------------|
| **TC-SUB-LSA-001** Multi-branch structure | 1. Identify branches 2. Create branch users | 5 branches created, managers assigned | Branch offices, staff allocation |
| **TC-SUB-LSA-002** Property import | 1. Bulk import 250 properties 2. Verify | All properties imported, indexed for search | Property details, images |
| **TC-SUB-LSA-003** CRM lead import | 1. Export from legacy CRM 2. Import leads | 2000+ leads imported with history | Lead data, interaction history |
| **TC-SUB-LSA-004** Lead scoring | 1. Run scoring algorithm 2. Review ranking | Leads ranked by value, hot leads identified | Hot leads: 20-30 top quality |
| **TC-SUB-LSA-005** Pipeline analysis | 1. View sales pipeline 2. Forecast revenue | Pipeline chart accurate, forecasts reasonable | 90-day forecast |
| **TC-SUB-LSA-006** Offer workflow | 1. Test offer creation 2. Negotiate 3. Accept | Full cycle works, audit trail complete | Offers tracked end-to-end |
| **TC-SUB-LSA-007** Valuation automation | 1. Bulk-value properties 2. Compare comps | 250 properties valued, comps identified | Valuations within 5% of market |
| **TC-SUB-LSA-008** Team performance | 1. Run agent metrics 2. Compare performance | Agent rankings accurate, top performers identified | Agent performance data |
| **TC-SUB-LSA-009** Financial reporting | 1. Generate sales report 2. Calculate commissions | Commission calc accurate, by agent/branch | Revenue + commission reporting |
| **TC-SUB-LSA-010** Database migration | 1. Verify all 2000+ leads migrated 2. Check data quality | Zero data loss, 99%+ quality | Complete migration |

#### Scenario 4: Out-of-Hours Service (1000+ call events/month)
**Example:** Out-of-hours provider handling 5000+ calls/month, 50+ contractors

| Test Case | Steps | Success Criteria | Expected Data |
|-----------|-------|------------------|----------------|
| **TC-SUB-OHS-001** Service configuration | 1. Setup service areas 2. Define escalation | Coverage map complete, escalation rules set | Geographic coverage |
| **TC-SUB-OHS-002** Contractor setup | 1. Import 50+ contractors 2. Set availability | Contractors available, response times defined | Contractor pool, ratings |
| **TC-SUB-OHS-003** Call volume test | 1. Simulate 100 calls/hour 2. Monitor routing | Calls routed correctly, no overflow | Call distribution even |
| **TC-SUB-OHS-004** Integration with Twilio | 1. Setup phone routing 2. Test call flow | Calls received, recorded, routed | Call logs, recordings |
| **TC-SUB-OHS-005** Contractor dispatch | 1. Auto-dispatch callout 2. Confirm assignment | Nearest contractor assigned, ETA calculated | Dispatch logic accurate |
| **TC-SUB-OHS-006** Cost tracking | 1. Log costs per callout 2. Aggregate | Total costs calculated, margins maintained | Cost per callout |
| **TC-SUB-OHS-007** Performance metrics | 1. Generate KPIs 2. Compare contractors | Response times, customer satisfaction tracked | SLA compliance 95%+ |
| **TC-SUB-OHS-008** Billing integration | 1. Process call charges 2. Batch invoice | Customers billed correctly, reconciliation clean | Billing accuracy 100% |
| **TC-SUB-OHS-009** Callback & follow-up | 1. Log callback 2. Track resolution | Callbacks tracked, resolutions logged | Issue resolution rate 98%+ |

---

## Part 6: Integration & End-to-End Testing

### Cross-Module Testing

#### Test Suite 1: Rent Ledger + Maintenance + Reporting
**Scenario:** Small residential lettings, 3 months live

| Test | Expected Flow | Success Criteria |
|------|---------------|------------------|
| **ITE-001** Record rent | Month 1: Rent received → Tenant A pays £1200 | Ledger balance updated |
| **ITE-002** Overdue rent alert | Month 2: Tenant B is 2 weeks late | Alert generated, reminder sent |
| **ITE-003** Maintenance request | Tenant A reports leak | Request created, contractor assigned |
| **ITE-004** Contractor invoice | Work completed, contractor invoices £400 | Invoice awaiting approval |
| **ITE-005** Payment + approval | Approve invoice, process payment | Expense recorded, balance updated |
| **ITE-006** Monthly report | Generate month-end report | Report shows: Rent, expenses, maintenance, net |
| **ITE-007** Export report | Download PDF | PDF renders correctly, all data accurate |
| **ITE-008** Tenant statement | Generate tenant statement | Shows: Rent, deposit, any deductions |

#### Test Suite 2: Service Charges + Leaseholder Portal + Compliance
**Scenario:** Block management, 1 year live

| Test | Expected Flow | Success Criteria |
|------|---------------|------------------|
| **ITE-201** Charge calculation | Jan: Calculate charges for 100 units | Charges accurate, allocations correct |
| **ITE-202** Invoice generation | Generate invoices for 100 leaseholders | 100 invoices created, sent |
| **ITE-203** Payment processing | 95 leaseholders pay on time | Ledger updated, 95% collection rate |
| **ITE-204** Arrears tracking | 5 leaseholders overdue | Arrears list, reminders sent |
| **ITE-205** Complaint handling | 2 leaseholders dispute charges | Complaints logged, investigated |
| **ITE-206** Compliance certs | Gas safety cert expires in 3 months | Alert generated 60 days before |
| **ITE-207** Renewal | Gas cert renewed | New cert uploaded, alert cleared |
| **ITE-208** Audit trail | View charge audit | All changes logged, by user + date |
| **ITE-209** Year-end report | Generate annual accounts | Report shows: Income, expenses, reserves |
| **ITE-210** Leaseholder access | Leaseholder views charges via portal | Portal shows: Charges, payments, certs |

#### Test Suite 3: Lead Pipeline + Offers + Valuation (Sales)
**Scenario:** Sales agency, 2-month sales cycle

| Test | Expected Flow | Success Criteria |
|------|---------------|------------------|
| **ITE-301** Lead creation | New lead: John Smith, interested in Kensington flat | Lead created, score 72/100 |
| **ITE-302** Viewings | Schedule 2 viewings | Appointments scheduled, confirm sent |
| **ITE-303** Valuation | Request AI valuation | Valuation: £850k, range £820k-£880k |
| **ITE-304** Offer | Offer made: £840k | Offer tracked, negotiation starts |
| **ITE-305** Counter-offer | Seller counters: £860k | Counter logged, new negotiation round |
| **ITE-306** Acceptance | Buyer accepts £855k | Offer accepted, contract prep |
| **ITE-307** Commission calc | Calculate agent commission (1.5%) | Commission: £12,825 |
| **ITE-308** Close transaction | Record completion date | Transaction marked closed |
| **ITE-309** Report | Agent closes deal report | Agent: 15 sales, £2.3M revenue |

---

## Part 7: Data Quality & Compliance Testing

### Data Quality Tests

| Test Case | Check | Success Criteria |
|-----------|-------|------------------|
| **DQ-001** Duplicate detection | Import duplicate tenants | System flags duplicates, allows merge |
| **DQ-002** Missing required fields | Import property without address | System warns, requires before save |
| **DQ-003** Data type validation | Import text as date | System rejects, shows error |
| **DQ-004** Business logic | Property with 0 units | System warns, allows (might be parking) |
| **DQ-005** Referential integrity | Delete tenant with active lease | System prevents, shows warning |
| **DQ-006** Historical consistency | Rent payment before lease start | System warns, allows (backdated) |
| **DQ-007** Audit trail | Track all changes | Every change logged with user + timestamp |
| **DQ-008** Data export | Export to CSV | CSV properly formatted, no corruption |

### Compliance Tests

| Test Case | Check | Success Criteria |
|-----------|-------|------------------|
| **COMP-001** GDPR right-to-be-forgotten | User requests deletion | All tenant data purged within 30 days |
| **COMP-002** Data retention | Data older than 7 years | Archived/purged per policy |
| **COMP-003** Client money protection | Segregated accounts | Money held correctly, audit trail |
| **COMP-004** Audit logging | Check audit log | All actions logged, immutable |
| **COMP-005** Access control | Non-admin tries admin function | Access denied, logged |
| **COMP-006** Encryption | Check data at rest | Data encrypted using AES-256 |
| **COMP-007** Transport security | Check HTTPS | All traffic encrypted with TLS 1.2+ |

---

## Part 8: Performance & Load Testing

### Performance Benchmarks

| Scenario | Test | Target | Measurement |
|----------|------|--------|-------------|
| **Small (5 props)** | Load dashboard | <2 sec | Time to first render |
| **Medium (50 props)** | Search properties | <1 sec | Time to see results |
| **Large (500 props)** | Generate report | <10 sec | PDF generation time |
| **Very Large (5000 props)** | Export all data | <60 sec | CSV generation time |
| **Concurrent users** | 10 users simultaneously | <5 sec response | Response time under load |
| **API rate limit** | 1000 req/min | Rate limited to 100/min | 429 response |

### Load Testing

```
Day 1: 10 concurrent users → Monitor response time
Day 2: 50 concurrent users → Check for bottlenecks
Day 3: 100 concurrent users → Verify auto-scaling
Day 4: 200 concurrent users → Stress test
```

---

## Part 9: Smoke Test Checklist

**Run before every release to all subscriber types:**

- [ ] Dashboard loads without errors
- [ ] Create property
- [ ] Create tenant
- [ ] Record rent payment
- [ ] Generate report
- [ ] Export to PDF
- [ ] Send email notification
- [ ] Login to portal (tenant/contractor)
- [ ] API endpoints respond correctly
- [ ] Database backup completes
- [ ] Error tracking captures errors
- [ ] Support chat functional

**Target:** All smoke tests pass in <10 minutes

---

## Part 10: Test Execution Plan

### Pre-Launch (Week Before)
- Run full test matrix (120+ hours)
- Focus: All 4 user journeys × 3 company sizes
- Priority: Critical paths only
- Success rate target: 95%+

### Launch Day
- Smoke tests every 15 minutes
- Monitor error rates
- Have rollback plan ready
- Team on standby

### Week 1 Post-Launch
- Daily smoke tests
- Monitor user reports
- Fix critical issues immediately
- Low-priority issues → backlog

### Month 1 Post-Launch
- Weekly performance reviews
- User feedback analysis
- Optimization iterations
- Plan next features

---

## Part 11: Test Data Requirements

### By Business Model

| Model | Properties | Tenants/Units | Months | Transactions | Contractors |
|-------|-----------|---------------|--------|--------------|-------------|
| Residential Lettings (Small) | 5 | 12 | 6 | 50 | 3 |
| Block Management (Medium) | 15 blocks | 300 | 12 | 500 | 10 |
| Sales Agency (Large) | 250 | 2000+ leads | 24 | 5000+ | N/A |
| Out-of-Hours (Very Large) | N/A | N/A | 3 months call volume | 5000+ calls | 50 |

### Data Generation

Use existing functions:
- `buildAgentDemo()` → Sales agency data
- `createRBMDemoUser()` → Block management data
- `populateRBMFullDemo()` → Full scenario
- Custom scripts → Specific business models

---

## Part 12: Success Criteria

### Overall Testing Success
- ✅ 100% smoke test pass rate
- ✅ 95%+ critical path coverage
- ✅ Zero critical bugs found in production
- ✅ User satisfaction 4.5+/5 stars
- ✅ Data import success 98%+
- ✅ System uptime 99.9%+

### Per User Type
| User Type | Criteria |
|-----------|----------|
| Developer | Can create any demo in <5 min, data quality 100% |
| Sales | Can create targeted demo in <10 min, materials generate in <5 min |
| New User | Complete onboarding in <1 hour, 90% completion rate |
| New Subscriber | Full data import + go-live in <4 hours, 0 data loss |

---

## Part 13: Known Issues & Workarounds

**Track during testing:**
- [ ] Issue type (Bug/Performance/Data/UI)
- [ ] Business model affected
- [ ] User type affected
- [ ] Severity (Critical/High/Medium/Low)
- [ ] Workaround (if any)
- [ ] Status (New/In Progress/Fixed/Deferred)

---

## Quick Reference: Test Execution

```bash
# Run all tests for a business model
npm run test:subscriber-model:block-management

# Run specific user journey
npm run test:journey:new-subscriber

# Run smoke tests
npm run test:smoke

# Load test
npm run test:load:concurrent-users:100

# Data quality check
npm run test:data-quality

# Compliance audit
npm run test:compliance
```

---

## Resources & Dependencies

- Test data functions: `functions/generate*.js`
- Test utilities: `tests/test-helpers.js`
- E2E tests: `tests/e2e/*.spec.js`
- Load testing: `tests/load/*.js`
- Reference: [TESTING_QUICKSTART.md](./TESTING_QUICKSTART.md)

---

## Version History

| Date | Version | Changes |
|------|---------|---------|
| 2026-04-13 | 1.0 | Initial matrix |

**Last Updated:** 2026-04-13  
**Owner:** QA Team  
**Next Review:** 2026-05-13