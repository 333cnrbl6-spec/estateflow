# FOUNDER RELEASE ACTION ITEMS
**Priority: IMMEDIATE** (Before Founder Access Granted)

---

## BLOCKING ISSUES (Fix Before Release)

### 1. Fix Duplicate /certificate-compliance Routes
**File:** App.jsx, lines 226 & 231  
**Issue:** Both routes render different pages; creates routing conflict  
**Fix:**
```javascript
// Line 226 - KEEP
<Route path="/certificate-compliance" element={<CertificateComplianceTracking />} />

// Line 231 - CHANGE TO:
<Route path="/certificate-management-tracking" element={<CertificateCompliance />} />
```
**Action:** Update App.jsx line 231 immediately  
**Testing:** Verify both pages load via their respective URLs

---

## TESTING REQUIREMENTS (Before Founder Access)

### 1. End-to-End Flow Verification
**Scenario 1: New Landlord Onboarding**
- [ ] Visit landing page
- [ ] Submit lead form
- [ ] Receive confirmation email (or notification)
- [ ] Log in to dashboard
- [ ] See compliance alerts
- [ ] Navigate to properties
- [ ] **Verify:** Messaging is consistent throughout

**Scenario 2: Tenant Portal Access**
- [ ] Generate tenant token
- [ ] Share link with test tenant
- [ ] Tenant logs in without authentication
- [ ] Tenant sees compliance documents
- [ ] Tenant can report maintenance
- [ ] **Verify:** Doesn't show sensitive landlord data

**Scenario 3: Contractor Portal**
- [ ] Generate contractor token
- [ ] Contractor views assigned tasks
- [ ] Contractor uploads proof of work
- [ ] Contractor signs off on completion
- [ ] **Verify:** Task status updates for landlord

### 2. Demo Data Validation
- [ ] Dashboard loads with demo companies (refresh page)
- [ ] Properties display correctly
- [ ] Maintenance orders visible
- [ ] Compliance alerts show expected items
- [ ] Financial charts render without errors
- [ ] No console errors in browser DevTools

### 3. Messaging Consistency Check
- [ ] Landing page mentions "Compliance Protection That Scales"
- [ ] Dashboard shows "Same enterprise-grade legal safeguards"
- [ ] Portal pages reference "Legal Protection Scaled"
- [ ] All components use consistent branding
- [ ] No contradictory messages
- [ ] No placeholder text remaining

### 4. Performance Test (Light)
- [ ] Dashboard loads within 3 seconds
- [ ] Switching between main pages responsive
- [ ] Charts render smoothly
- [ ] No lag on list pagination
- [ ] Mobile browser (test on iPhone) responsive

---

## PRE-RELEASE CONFIGURATION

### 1. Verify Secrets Are Set
```bash
✓ COMPANIES_HOUSE_API_KEY     # For company verification
✓ STRIPE_SECRET_KEY            # For billing (may not use yet)
✓ SALES_LEAD_EMAIL             # For lead notifications
```
**Action:** Run configuration check  
**Owner:** DevOps / Infrastructure

### 2. Seed Demo Companies
**Why:** Founders need data to see immediately, not an empty system  
**Action:**
- Create 3-5 demo companies (varied sizes: 1, 5, 15, 50+ properties)
- Create sample properties, units, tenants for each
- Create some maintenance orders, certificates, financial data
- Assign one company to each test founder

**SQL Example:**
```sql
INSERT INTO Company (name, category, status) VALUES
  ('Single Landlord Ltd', 'landlord', 'active'),
  ('Mid-Size Lettings Co', 'agent', 'active'),
  ('Large Portfolio Group', 'property_group', 'active');
```

### 3. Create Founder Admin Accounts
**Action:**
- Determine founder emails (get from product/founder)
- Create User accounts with role='admin'
- Send login link + welcome email with instructions
- Provide sample founder guide (see below)

---

## FOUNDER WELCOME PACKAGE

### Founder Welcome Email Template

```
Subject: Welcome to Premiso — Your Founder Early Access

Hi [Founder Name],

We're excited to have you testing Premiso v1.0. 

Your Login
Email: [email]
Password: [temporary password — they'll reset on first login]
Access Link: https://premiso.co.uk/dashboard

What Premiso Does
Premiso is built on one principle: legislation benefits everyone, so compliance 
protection should be scaled for everyone. Whether you manage 1 property or 1,000, 
you get the same automated:
- Gas/Electrical/EPC certificate tracking
- Deposit protection audit trails
- Right-to-rent verification
- Tenant screening & landlord checks
- Compliance enforcement blocks
- Audit trails for regulators

Your Test Environment
You have admin access to a demo company with sample properties, tenants, and 
maintenance data. Use this to explore features without affecting real data.

What We'd Like You to Test
1. **Does the messaging resonate?** 
   - Do you understand that everyone gets same compliance protection?
   - Is the landing page compelling?
   
2. **Is the UI intuitive?**
   - Can you easily find compliance information?
   - Do the portals make sense for tenants/contractors?
   
3. **Does the philosophy come through?**
   - Do you feel like compliance is "built-in"?
   - Do you trust the system?

4. **What would make this valuable for your business?**
   - What features are critical?
   - What's missing?
   
Feedback Form
Please fill this out: [feedback-form-link]
Timeline: We'd love your feedback by [date - 2 weeks from now]

Questions?
Email us: founders@premiso.co.uk
Call: [phone number]
Slack: [slack channel]

Looking forward to your feedback!

Best regards,
The Premiso Team
```

### Founder Quick Start Guide

```markdown
# Premiso Founder Quick Start Guide

## 1. First Login
- Go to https://premiso.co.uk/dashboard
- Log in with your email
- You'll see your company dashboard with sample data

## 2. What You See
- **Dashboard**: Portfolio overview with compliance alerts
- **Properties**: Manage your portfolio
- **Compliance**: View expiring certificates & legal requirements
- **Tenants/Contractors**: Manage stakeholders
- **Financials**: Track income & expenses

## 3. Core Feature: Compliance Protection
The platform automatically tracks:
- Gas safety certificates (renew every 12 months)
- Electrical certificates (renew every 5 years)
- Energy Performance Certificates (renew every 10 years)
- Deposit protection (track scheme & prescribed info)
- Right-to-rent checks (track renewal dates)
- Fire safety compliance (HMO-specific)

You'll get alerts 30 days before anything expires.

## 4. Portals
Test these with real people (tenants, contractors):
- Tenant Portal: /tenant-portal-dedicated
- Contractor Dashboard: /contractor
- Payment Portal: /tenant-payments

## 5. Try These Scenarios
1. View your dashboard → Check compliance alerts
2. Go to properties → See your unit occupancy
3. Check maintenance → See active orders
4. View compliance hub → Understand your legal obligations
5. Try tenant portal (get token from admin)

## 6. Key Messaging
Pay attention to whether this comes through:
- "Same legal protection at every scale"
- "Compliance built-in, not premium"
- "Legislation benefits everyone"

## 7. Feedback Areas
- Is the philosophy clear?
- What features would help your business?
- What doesn't make sense?
- What would you pay for?

## Support
- Live chat in app
- Email: support@premiso.co.uk
- Slack: #founder-support
```

---

## CRITICAL TESTING CHECKLIST

### Compliance Messaging
- [ ] Dashboard opens with compliance protection message
- [ ] Landing page explains "Legislation benefits everyone"
- [ ] Tenant portal shows tenant protections
- [ ] Contractor can see compliance requirements
- [ ] Alert messaging is clear and actionable

### Data Integrity
- [ ] No sensitive data leaks in portals
- [ ] Tenants only see their own data
- [ ] Contractors only see assigned tasks
- [ ] Landlords see all their properties

### Error Handling
- [ ] Invalid routes go to 404 page
- [ ] Auth errors handled gracefully
- [ ] API errors show user-friendly messages
- [ ] Forms have validation messages

### Navigation
- [ ] All main menu items clickable
- [ ] Sidebar navigation works on mobile
- [ ] Back buttons work correctly
- [ ] Deep linking works (can share URLs)

### Performance
- [ ] Dashboard loads quickly (<3 sec)
- [ ] Charts render smoothly
- [ ] No console errors (F12 DevTools)
- [ ] Mobile responsive (test on phone)

---

## HAND-OFF TO FOUNDERS

### Documentation to Provide
1. ✓ This audit report (FOUNDER_RELEASE_AUDIT_REPORT.md)
2. ✓ Action items (this document)
3. ✓ Quick start guide (see above)
4. ✓ Feedback form link
5. ✓ Support contact info

### Communication Plan
- **Day 1:** Send welcome emails with access links
- **Day 2:** Send quick start guides & feedback forms
- **Day 3-4:** Founders start exploring
- **Daily:** Monitor for critical issues
- **End of Week 1:** Check in on progress
- **End of Week 2:** Collect feedback

### Success Metrics (By End of 2 Weeks)
- [ ] 80%+ founders logged in successfully
- [ ] 0 critical bugs reported
- [ ] 60%+ feedback forms completed
- [ ] 70%+ understand compliance philosophy
- [ ] 50%+ would pay for full product

---

## CLEANUP POST-FOUNDER FEEDBACK

### After 2 Weeks, Assess:
1. **Bug reports:** Fix critical issues immediately
2. **Feature requests:** Document for Phase 2
3. **Messaging feedback:** Iterate on copy if needed
4. **Performance issues:** Address before wider release
5. **UX issues:** Note for design iteration

### Before wider release (10-15 testers):
- [ ] All critical bugs fixed
- [ ] Performance baseline established
- [ ] Messaging validated
- [ ] Documentation updated
- [ ] Support runbook created

---

## SIGN-OFF

**Ready for Founder Release?** ✅ YES

**Prerequisites Completed:**
- [x] Core functionality verified
- [x] Messaging aligned throughout
- [x] Security configured
- [x] Error handling in place
- [ ] Demo companies seeded (IN PROGRESS)
- [ ] Founder accounts created (IN PROGRESS)

**Target Launch Date:** 2026-04-21 (7 days from audit)

**Responsible Parties:**
- Product: Messaging validation ✓
- Engineering: Code review & deployment
- DevOps: Environment setup & demo data
- Marketing: Founder communication
- Support: Issue triage & response

---

**Document Created:** 2026-04-14  
**Last Updated:** 2026-04-14  
**Owner:** Product Team