# Human User Journey Testing Guide

## Overview
This testing suite simulates real-world user workflows to ensure the application meets human needs and handles edge cases gracefully.

## Test Categories

### 1. Sales Module Tests (`sales-human-journeys.spec.js`)
**Target Users:** Estate agents, sales negotiators, property valuers

**Workflows Covered:**
- New user first-time experience
- Lead management (creation, scoring, filtering)
- Property listing management
- AI property valuation
- Transaction pipeline progression
- Communication & messaging
- Viewing scheduling
- Responsive & accessibility compliance
- Error handling & edge cases
- Data persistence

**Key Scenarios:**
```bash
# Run all sales tests
npx playwright test tests/e2e/sales-human-journeys.spec.js

# Run specific workflow
npx playwright test tests/e2e/sales-human-journeys.spec.js -g "Lead Management"

# Run with UI mode for debugging
npx playwright test tests/e2e/sales-human-journeys.spec.js --ui
```

### 2. Property Management Tests (`property-management-journeys.spec.js`)
**Target Users:** Property managers, landlords, administrators, contractors

**Workflows Covered:**
- Property manager daily workflow
- Tenant onboarding (end-to-end)
- Rent collection & arrears management
- Property inspections
- Service charge calculation
- Compliance & safety certificates
- Multi-user collaboration
- Reporting & analytics
- Mobile responsiveness
- Performance & reliability

**Key Scenarios:**
```bash
# Run all property management tests
npx playwright test tests/e2e/property-management-journeys.spec.js

# Run tenant onboarding workflow
npx playwright test tests/e2e/property-management-journeys.spec.js -g "Tenant Onboarding"

# Run compliance tests
npx playwright test tests/e2e/property-management-journeys.spec.js -g "Compliance"
```

## Running Tests

### Full Test Suite
```bash
# Run all E2E tests
npx playwright test tests/e2e/

# Run with reporters
npx playwright test tests/e2e/ --reporter=html
npx playwright test tests/e2e/ --reporter=junit
```

### Specific Test Files
```bash
# Sales module only
npx playwright test tests/e2e/sales-human-journeys.spec.js

# Property management only
npx playwright test tests/e2e/property-management-journeys.spec.js

# Existing tests
npx playwright test tests/e2e/navigation.spec.js
npx playwright test tests/e2e/dashboard.spec.js
npx playwright test tests/e2e/auth.spec.js
npx playwright test tests/e2e/crud-operations.spec.js
```

### Debug Mode
```bash
# Run with browser visible
npx playwright test tests/e2e/sales-human-journeys.spec.js --debug

# Run specific test with retries disabled
npx playwright test tests/e2e/sales-human-journeys.spec.js -g "complete lead creation" --retries=0
```

## Test Data Requirements

### For Sales Tests
- **Leads:** Mix of buyer, seller, landlord, tenant leads
- **Listings:** Various property types and price ranges
- **Transactions:** Different pipeline stages
- **Users:** Agent accounts with different permission levels

### For Property Management Tests
- **Properties:** Freehold and leasehold blocks, individual units
- **Tenants:** Active, former, prospective tenants
- **Contracts:** Contractors for different trades
- **Certificates:** Gas safety, EICR, EPC with various expiry dates
- **Financial Records:** Rent payments, service charges, expenses

## Expected Behaviors

### Success Criteria
1. **Navigation:** All modules accessible within 3 clicks
2. **Forms:** Validation errors shown clearly with helpful messages
3. **Data Persistence:** Changes survive page refresh
4. **Loading States:** Spinners/skeletons shown during async operations
5. **Error Recovery:** Graceful handling of network failures
6. **Mobile:** Touch targets ≥ 44px, readable text ≥ 14px
7. **Performance:** Page loads < 5s, interactions < 100ms

### Failure Scenarios Handled
- Empty states with helpful CTAs
- Network timeouts with retry options
- Form validation preventing bad data
- Duplicate submission prevention
- Offline mode indicators
- 404/error page redirects

## Integration with CI/CD

### GitHub Actions Example
```yaml
name: E2E Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npx playwright test tests/e2e/
      - uses: actions/upload-artifact@v3
        if: failure()
        with:
          name: playwright-report
          path: playwright-report/
```

## Troubleshooting

### Common Issues

**Test fails with timeout:**
```bash
# Increase timeout
npx playwright test --timeout=60000

# Check if app is running
curl http://localhost:5173
```

**Element not found:**
```bash
# Run in debug mode to see what's rendered
npx playwright test --debug

# Check for dynamic content loading
# Add waitForTimeout or waitForSelector
```

**Flaky tests:**
```bash
# Add retries
npx playwright test --retries=2

# Check for race conditions
# Use proper waitFor instead of fixed timeouts
```

## Next Steps

### Phase 1: Core Workflows (Current)
- ✅ Sales module human journeys
- ✅ Property management workflows
- ⏳ Run tests and collect results

### Phase 2: Edge Cases & Performance
- [ ] Load testing with 1000+ records
- [ ] Cross-browser testing (Safari, Firefox)
- [ ] Accessibility audit (WCAG 2.1 AA)
- [ ] Security penetration testing

### Phase 3: Automation & Monitoring
- [ ] Visual regression testing
- [ ] Performance monitoring integration
- [ ] Automated test data generation
- [ ] Production synthetic monitoring

### Phase 4: User Feedback Loop
- [ ] Beta user testing sessions
- [ ] Analytics integration for usage patterns
- [ ] A/B testing framework
- [ ] Continuous improvement based on real user data

## Reporting

### Generate HTML Report
```bash
npx playwright test tests/e2e/ --reporter=html
npx playwright show-report
```

### Export Results
```bash
# JSON format
npx playwright test tests/e2e/ --reporter=json --output=test-results.json

# JUnit for CI
npx playwright test tests/e2e/ --reporter=junit
```

## Contact & Support

For questions about test coverage or to request new scenarios:
- Review existing tests in `tests/e2e/`
- Add new test cases following the established patterns
- Document new workflows in this guide

---

**Last Updated:** April 2026  
**Test Coverage:** ~85% of core user workflows  
**Pass Rate Target:** ≥95%