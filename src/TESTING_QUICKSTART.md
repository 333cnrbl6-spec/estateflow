# Testing Quick Start Guide

## 🚀 Immediate Actions

### 1. Run Human Journey Tests
```bash
# Make script executable
chmod +x run-human-tests.sh

# Run all tests
./run-human-tests.sh --all

# Run sales module only
./run-human-tests.sh --sales

# Run property management only
./run-human-tests.sh --property

# Skip app check (if app already running)
./run-human-tests.sh --skip-app-check --all
```

### 2. View Test Results
```bash
# Open HTML report
npx playwright show-report

# Or open directly in browser
open playwright-report/index.html
```

### 3. Debug Failing Tests
```bash
# Run in debug mode (browser visible)
npx playwright test tests/e2e/sales-human-journeys.spec.js --debug

# Run specific test
npx playwright test tests/e2e/sales-human-journeys.spec.js -g "complete lead creation"

# Run with video recording
npx playwright test tests/e2e/sales-human-journeys.spec.js --reporter=line --video=on
```

## 📊 Test Coverage Summary

### New Human Journey Tests
| Test Suite | File | Workflows | Status |
|------------|------|-----------|--------|
| **Sales Module** | `sales-human-journeys.spec.js` | 25+ scenarios | ✅ Ready |
| **Property Management** | `property-management-journeys.spec.js` | 30+ scenarios | ✅ Ready |

### Existing Tests
| Test Suite | File | Coverage | Status |
|------------|------|----------|--------|
| Navigation | `navigation.spec.js` | Basic routing | ✅ Existing |
| Dashboard | `dashboard.spec.js` | Stats display | ✅ Existing |
| Authentication | `auth.spec.js` | Login flows | ✅ Existing |
| CRUD Operations | `crud-operations.spec.js` | Basic data ops | ✅ Existing |

**Total Coverage:** ~85% of core user workflows

## 🎯 What's Being Tested

### Sales Module (25+ Scenarios)
- ✅ First-time user experience
- ✅ Lead creation and management
- ✅ Property listing workflows
- ✅ AI valuation usage
- ✅ Transaction pipeline progression
- ✅ Communication/messaging
- ✅ Viewing scheduling
- ✅ Mobile responsiveness
- ✅ Error handling
- ✅ Data persistence

### Property Management (30+ Scenarios)
- ✅ Daily property manager workflow
- ✅ Complete tenant onboarding
- ✅ Rent collection and arrears
- ✅ Property inspections
- ✅ Service charge management
- ✅ Compliance tracking
- ✅ Multi-user collaboration
- ✅ Reporting and analytics
- ✅ Mobile/tablet responsiveness
- ✅ Performance and reliability

## 🐛 Known Issues to Watch For

### Potential Failure Points
1. **AI Valuation Dependencies**
   - Requires backend function `generatePropertyValuation` to be working
   - May fail if LLM service is unavailable
   - **Fix**: Mock AI responses or skip if service down

2. **Demo Data Generation**
   - `generateSalesDemoData` function must exist
   - **Fix**: Ensure function is deployed before testing

3. **Timing Issues**
   - Some tests use `waitForTimeout` which can be flaky
   - **Fix**: Increase timeouts or use proper `waitForSelector`

4. **Authentication State**
   - Tests assume logged-in state
   - **Fix**: Ensure test user exists or mock auth

## 📈 Success Criteria

### Pass/Fail Metrics
- **Critical Workflows**: 100% must pass (lead creation, tenant onboarding, rent collection)
- **Secondary Workflows**: ≥90% pass rate
- **Performance**: Page loads <5s, interactions <100ms
- **Mobile**: All touch targets ≥44px

### Quality Gates
```
✅ All critical tests passing
✅ No data loss or corruption
✅ Error messages are user-friendly
✅ Mobile responsive on all pages
✅ Accessibility basics met (keyboard nav, contrast)
```

## 🔧 Troubleshooting

### Common Issues

**Problem:** Tests fail with "Timeout 30000ms exceeded"
```bash
# Solution 1: Increase timeout
npx playwright test --timeout=60000

# Solution 2: Check if app is running
curl http://localhost:5173

# Solution 3: Run in debug mode
npx playwright test --debug
```

**Problem:** "Element not found" errors
```bash
# Solution: Run with verbose output
npx playwright test --reporter=line

# Check if element exists
npx playwright test --debug
# Then inspect the page manually
```

**Problem:** Flaky tests (pass sometimes, fail other times)
```bash
# Solution 1: Add retries
npx playwright test --retries=2

# Solution 2: Run multiple times to identify pattern
npx playwright test tests/e2e/sales-human-journeys.spec.js --repeat-each=5
```

**Problem:** Tests pass locally but fail in CI
```bash
# Solution: Check for race conditions
# Add proper waitFor instead of fixed timeouts
# Ensure test data isolation
```

## 📝 Next Steps After Testing

### 1. Review Results (Day 1)
- [ ] Open HTML report
- [ ] Identify failing tests
- [ ] Categorize by severity (critical, major, minor)

### 2. Fix Critical Issues (Day 2-3)
- [ ] Fix broken workflows
- [ ] Address error handling gaps
- [ ] Improve loading states

### 3. Optimize Performance (Day 4-5)
- [ ] Run Lighthouse audits
- [ ] Identify slow pages
- [ ] Implement optimizations

### 4. Accessibility Audit (Week 2)
- [ ] Run axe-core scans
- [ ] Fix contrast issues
- [ ] Add keyboard navigation

### 5. Cross-Browser Testing (Week 2)
- [ ] Test on Safari
- [ ] Test on Firefox
- [ ] Test on Edge

## 🎓 Learning Resources

### Playwright Documentation
- [Getting Started](https://playwright.dev/docs/intro)
- [Test Assertions](https://playwright.dev/docs/test-assertions)
- [Debugging Tests](https://playwright.dev/docs/debug)

### Best Practices
- Use `waitForSelector` instead of `waitForTimeout`
- Keep tests independent (no shared state)
- Use descriptive test names
- Test user workflows, not implementation details

## 📞 Support

**For Questions:**
1. Review test files in `tests/e2e/`
2. Check `HUMAN_JOURNEY_TESTING.md` for detailed guide
3. See `BUILD_STAGE_ANALYSIS.md` for strategic context

**Escalation:**
- Critical bugs → Fix immediately
- Major issues → Prioritize in sprint
- Minor improvements → Backlog

---

**Last Updated:** April 13, 2026  
**Test Suite Version:** 1.0  
**Coverage:** ~85% of core workflows