# Premiso Platform — Comprehensive Pre-Launch Testing Guide
**Last Updated:** May 3, 2026  
**Purpose:** Deep human-journey testing, bug identification, code quality audit, and issue remediation

---

## PHASE 1: CRITICAL USER JOURNEYS

### 1.1 Tenant Maintenance Request Flow
**Goal:** Verify complete lifecycle from submission to completion

**Setup:**
- Login as tenant (use any active tenant account)
- Navigate to Tenant Portal (`/tenant-portal`)

**Steps:**
1. Click "Submit Maintenance Request"
2. Fill form:
   - Title: "Leaky tap in bathroom"
   - Category: "Plumbing"
   - Priority: "High"
   - Description: "Water dripping constantly"
3. Upload 2 test photos (any PNG/JPG)
4. Submit request
5. **Check:**
   - ✅ Request appears in tenant dashboard
   - ✅ Confirmation email received (check spam folder)
   - ✅ Status shows "Pending"
   - ✅ Photos display correctly in request detail

**Manager Flow:**
- Login as manager → Maintenance Board
- Locate the request you just created
- Assign contractor from dropdown
- **Check:**
   - ✅ Assignment email sent to contractor
   - ✅ Status changes to "Assigned"
   - ✅ Tenant receives "Contractor Assigned" notification
   - ✅ Timeline view shows assignment timestamp

**Contractor Flow:**
- Login as contractor → View assigned jobs
- Click job, mark as "In Progress"
- Upload progress photo
- Mark as "Completed"
- **Check:**
   - ✅ Manager receives completion email
   - ✅ Tenant receives completion notification
   - ✅ Status shows "Closed"
   - ✅ Request no longer in "Active" list

---

### 1.2 Property Valuation Request
**Goal:** Verify AI valuation engine and output accuracy

**Setup:**
- Navigate to Property Valuation (`/property-valuation`)
- Select any property from dropdown

**Steps:**
1. Click "Generate Valuation"
2. Wait for analysis (may take 10-15 seconds)
3. **Check:**
   - ✅ Valuation card displays (no blank fields)
   - ✅ Comparable properties show (min 3-5)
   - ✅ Market demand score is 0-100 (not >100 or negative)
   - ✅ Projected rental yield shows realistic percentage
   - ✅ "Generated on" timestamp is current

**Data Validation:**
- Comparable properties address formats are valid
- Rental yield calculations are positive
- Vacancy rates are between 0-100%
- No console errors (open F12 dev tools)

---

### 1.3 Rental Price Optimization
**Goal:** Verify price recommendations are market-sensible

**Setup:**
- Navigate to Rental Optimizer (`/rental-optimizer`)
- Select property with lowest rent

**Steps:**
1. Note current rent amount
2. View recommended rent in "Recommended Price" column
3. **Check:**
   - ✅ Recommended price is within ±15% of current (not >50% higher)
   - ✅ ROI calculator shows valid numbers
   - ✅ Market demand indicator present
   - ✅ Risk warnings appear if increase >10%
   - ✅ Per-unit analysis is accurate (math checks out)

**Edge Cases:**
- Test property with 0 days vacancy (should show confidence boost)
- Test property with high vacancy (should show caution flag)

---

### 1.4 Tenant Portal Dashboard
**Goal:** Complete tenant experience validation

**Setup:**
- Login as tenant
- Navigate to `/tenant-dashboard`

**Sections to Check:**
1. **Lease Details Card**
   - ✅ Expiration date displays (not in past)
   - ✅ Monthly rent amount is correct
   - ✅ Deposit amount shows
   - ✅ Link to lease document works

2. **Payment History**
   - ✅ Last 12 payments show in reverse chronological order
   - ✅ Payment dates are formatted consistently
   - ✅ Amounts match rental invoices
   - ✅ Reference numbers are present

3. **Maintenance Section**
   - ✅ "Submit Request" button is clickable
   - ✅ Historical requests load and display status
   - ✅ Photos display correctly in request detail

4. **Documents & Certificates**
   - ✅ Gas safety, EICR, fire safety certs visible
   - ✅ Expiry dates shown with color coding (green=valid, red=expired)
   - ✅ Download button works for each document
   - ✅ No broken image placeholders

**Performance:**
- Page loads in <3 seconds
- No layout shift when images load

---

### 1.5 Portfolio Trends Dashboard
**Goal:** Data accuracy and chart rendering

**Setup:**
- Navigate to `/portfolio-trends`

**Verify Each Tab:**

**Tab 1: Rental Yield Growth**
- ✅ Historical data line connects properly (no gaps)
- ✅ Projected line starts where historical ends
- ✅ Chart is responsive (resize browser, check it adjusts)
- ✅ Tooltip shows values on hover

**Tab 2: Regional Vacancy**
- ✅ All regions display in bar chart
- ✅ Wales has lowest bar (~8 days)
- ✅ South East has highest bar (~25 days)
- ✅ Green/amber indicators match recommendations

**Tab 3: Expense Ratios**
- ✅ Stacked bars show all 5 categories
- ✅ Total adds up correctly (visual check)
- ✅ Q2 2026 shows lowest ratio
- ✅ Color-coded by category (orange=maintenance, etc.)

---

## PHASE 2: CODE QUALITY AUDIT

### 2.1 Critical Component Review

**Files to Audit:**
1. `pages/TenantDashboard.jsx` — Tenant portal core
2. `pages/PropertyValuationDashboard.jsx` — AI valuation
3. `pages/RentalPriceOptimization.jsx` — Rental optimizer
4. `components/maintenance/TenantMaintenanceSubmission.jsx` — Request form
5. `pages/PortfolioTrendsDashboard.jsx` — Analytics

**Check For:**
- ❌ Undefined variables or properties (e.g., `data?.property?.name` vs `data.property.name`)
- ❌ Missing error boundaries (wrapped in try/catch)
- ❌ Unhandled API failures (loading/error states)
- ❌ Console errors (F12 DevTools)
- ❌ Memory leaks (subscriptions not unsubscribed)
- ❌ Race conditions (async state updates)
- ❌ Input validation (form submission without validation)
- ❌ XSS vulnerabilities (unsanitized user input)
- ❌ Missing null checks (e.g., accessing array[0] without checking length)

### 2.2 Performance Checks

**Tenant Dashboard:**
- Cold load: <2 seconds
- Interactive: <1 second after load
- Large data set (100+ payments): Should still render smoothly

**Valuation Engine:**
- API call returns within 15 seconds
- Charts render smoothly (no janky animation)
- Comparable properties load without blocking UI

**Portfolio Trends:**
- All three tabs load instantly (no lazy load delay)
- Charts responsive to window resize
- Tooltip appears instantly on hover

### 2.3 Data Validation

**Form Inputs:**
- Required fields (maintenance request title, category) cannot submit empty
- Photo upload accepts only valid image formats
- Text fields strip HTML/scripts
- Numbers reject letters
- Dates reject past dates where applicable

**API Responses:**
- All JSON responses parse without error
- Missing fields handled gracefully (default values)
- Number fields validated as numbers (not strings)

---

## PHASE 3: KNOWN ISSUES & REMEDIATION LOG

**As of May 3, 2026:**

### Issue Tracking
| # | Component | Issue | Severity | Status | Fix Applied |
|----|-----------|-------|----------|--------|------------|
| 1 | TenantDashboard | Missing error handling on payment load | High | OPEN | |
| 2 | PropertyValuation | No loading state during API call | Medium | OPEN | |
| 3 | RentalOptimizer | Confidence % can exceed 100 | High | OPEN | |
| 4 | Portfolio Trends | Chart resize causes tooltip misalignment | Low | OPEN | |

---

## PHASE 4: TESTING CHECKLIST

### Day 1: Critical Journeys (4 hours)
- [ ] Tenant maintenance request (full lifecycle)
- [ ] Manager assignment workflow
- [ ] Contractor completion flow
- [ ] Tenant notification delivery
- [ ] Property valuation generation
- [ ] Rental price recommendation
- [ ] Tenant dashboard load and display

### Day 2: Edge Cases (3 hours)
- [ ] Submit maintenance without photo (should allow)
- [ ] Upload invalid file format (should reject)
- [ ] Property with 0 rental history (should handle gracefully)
- [ ] Request as multiple users simultaneously (race condition test)
- [ ] Navigate back/forward during load (should not break)

### Day 3: Performance & Data (3 hours)
- [ ] Load with 1000+ tenants (search, filter performance)
- [ ] Generate 10 valuations simultaneously (API throttle?)
- [ ] Portfolio trends with 5+ years data (chart performance)
- [ ] Monitor memory usage (DevTools → Performance tab)

### Day 4: Browser Compatibility (2 hours)
- [ ] Chrome/Edge (latest)
- [ ] Firefox (latest)
- [ ] Safari (Mac)
- [ ] Mobile Safari (iPhone)
- [ ] Mobile Chrome (Android)

### Day 5: Security & GDPR (2 hours)
- [ ] Verify tenant can only see own data
- [ ] Verify contractor cannot see other contractor jobs
- [ ] Test password reset flow
- [ ] Verify 2FA enables correctly
- [ ] Check audit logs record all actions

---

## PHASE 5: GO/NO-GO CRITERIA

### MUST-HAVE (Blocking)
- ✅ All critical journeys complete without errors
- ✅ No unhandled API failures
- ✅ Tenant data isolation verified
- ✅ Maintenance request lifecycle works end-to-end
- ✅ Forms validate input correctly
- ✅ No console errors in critical paths

### NICE-TO-HAVE (Non-blocking)
- ✅ Charts animate smoothly on load
- ✅ Tooltips position correctly on mobile
- ✅ Analytics load in <1 second

---

## ESCALATION PROCEDURE

**If Critical Issue Found:**
1. Log issue in Issue Tracking (above)
2. Flag as "BLOCKING"
3. Pull request with fix (include code review)
4. Re-test affected journey
5. Update checklist

**If Medium/Low Issue Found:**
1. Log issue
2. Assign to backlog
3. Include in next release

---

## TESTING ENVIRONMENT SETUP

**Test Accounts Available:**
- Tenant: `test-tenant@example.com` / `password123`
- Manager: `test-manager@example.com` / `password123`
- Contractor: `test-contractor@example.com` / `password123`

**Test Data:**
- 10 properties across UK regions
- 20 tenants with varied payment history
- 5 active maintenance requests
- 3 completed requests for history

**Dev Tools:**
- F12 Console: Check for errors/warnings
- Network tab: Monitor API response times
- Performance tab: Profile slow interactions
- React DevTools: Inspect component state

---

## SIGN-OFF

**Tester Name:** _______________  
**Date:** _______________  
**Result:** ☐ PASS ☐ FAIL ☐ CONDITIONAL (note issues above)

**Approved for Release:** ☐ Yes ☐ No ☐ With Fixes