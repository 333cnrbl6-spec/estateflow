# Relationship Intelligence Testing & Validation Guide

**Audience:** QA, Performance Engineers, Product Managers

---

## 🧪 Test Scenarios

### **Scenario 1: Stress Test (500+ Relationships)**

**Objective:** Verify no lag/lag when rendering large relationship graphs.

**Setup:**
```javascript
// In Playwright or manual testing:
// 1. Call multiple seeders in sequence
POST /seedReedCloseFarnworth
POST /seedNomineeDirectorScenario
POST /seedOffshoreFreeholdScenario
POST /seedServiceChargeVehicleScenario
POST /seedPowellCoRelationships
POST /seedSeanPowellMajorWorksScenario
POST /seedTchenguizGroundRentEmpire
POST /detectConflictsOfInterest { "action": "fix", "dry_run": false }
```

**Test Cases:**

| Case | Action | Expected | Actual | Status |
|------|--------|----------|--------|--------|
| S1.1 | Load `/relationship-intelligence` | FCP < 2s, LCP < 5s | — | ⭕ |
| S1.2 | Click "Run COI Scan" button | Scan completes in < 15s, results show 50+ findings | — | ⭕ |
| S1.3 | Switch to "Conflicts" tab | Tab switches in < 500ms, displays all ~50 COI cards | — | ⭕ |
| S1.4 | Click on 5 different nodes (rapid) | Each node panel loads in < 300ms | — | ⭕ |
| S1.5 | Type search query "powell" | Graph filters in < 200ms, 3-5 results shown | — | ⭕ |
| S1.6 | Scroll scenario guide cards | Smooth scroll, no jank (60 FPS maintained) | — | ⭕ |

**Performance Thresholds:**
- **FCP:** First Contentful Paint < 2s
- **LCP:** Largest Contentful Paint < 5s
- **Tab switch:** < 500ms
- **Node click:** < 300ms
- **Search filter:** < 200ms

---

### **Scenario 2: Error Handling**

**Objective:** Verify graceful degradation when backend fails.

| Case | Action | Expected | Setup |
|------|--------|----------|-------|
| E2.1 | COI Scan fails (backend timeout) | Error banner shows "Scan failed: Request timeout", button re-enables | Mock function to throw |
| E2.2 | Search contains null value (conflict_description) | Filter doesn't crash, returns 0 results cleanly | Manually update a relationship with `conflict_description: null` |
| E2.3 | Click legal badge for unmapped COI pattern | Panel shows fallback "Unknown Pattern" with guidance | Add new coi_pattern enum without mapping it |
| E2.4 | Relationship list returns with missing `from_label` | Graph renders node as "Unknown" instead of crashing | Mock API to return incomplete relationship |

---

### **Scenario 3: COI Detection Accuracy**

**Objective:** Verify auto-detection correctly identifies all 6 COI patterns.

**Setup:** After seeding all scenarios, run:
```bash
POST /detectConflictsOfInterest { "action": "scan", "dry_run": true }
```

**Expected Detections:**

| Pattern | Scenario | Min Count | Notes |
|---------|----------|-----------|-------|
| `leaseholder_controls_letting_agent` | Reed Close | 1 | Leaseholder → Letting Agent → same property |
| `rtm_director_controls_managing_agent` | Reed Close | 1 | RTM director also directs managing agent |
| `freehold_and_managing_agent_same_controller` | Powell + Tchenguiz | 3+ | Freeholder owns managing agent |
| `service_charge_vehicle_same_directors` | Powell + Tchenguiz | 2+ | Service charge vehicle shares directors |
| `offshore_freehold_no_psc` | Adriatic + Tchenguiz | 2+ | Offshore entity with no PSC filed |
| `nominee_director_high_volume` | Duport | 1+ | Director of 10+ companies |

**Validation:**
```bash
# After scan, verify:
curl -X GET /relationship-intelligence?tab=conflicts
# Should show 40+ conflict cards with correct patterns
```

---

### **Scenario 4: UI Responsiveness (Mobile)**

**Objective:** Verify UI is functional on mobile (375px viewport).

| Device | Case | Expected | Status |
|--------|------|----------|--------|
| iPhone 12 | Load page | Hero + stats visible without scrolling | ⭕ |
| iPhone 12 | Click node in graph | Side panel slides in without blocking graph | ⭕ |
| iPhone 12 | Scroll relationship list | 60 FPS scroll performance | ⭕ |
| Pixel 6 | Tap legal badge | Panel opens in bottom sheet (not modal) | ⭕ |

---

## 📊 Load Test Script (Playwright)

```javascript
// tests/relationship-intelligence-load.spec.js
import { test, expect } from '@playwright/test';

test('handle 500+ relationships without lag', async ({ page }) => {
  // 1. Seed all scenarios
  await page.goto('/relationship-intelligence');
  
  // 2. Measure FCP + LCP
  const metrics = await page.evaluate(() => {
    const fcp = performance.getEntriesByType('paint').find(e => e.name === 'first-contentful-paint')?.startTime;
    const lcp = performance.getEntriesByType('largest-contentful-paint')?.at(-1)?.startTime;
    return { fcp, lcp };
  });
  
  expect(metrics.fcp).toBeLessThan(2000);
  expect(metrics.lcp).toBeLessThan(5000);

  // 3. Run COI scan
  const start = Date.now();
  await page.click('text=Run COI Scan');
  await page.waitForSelector('text=conflicts detected', { timeout: 30000 });
  const scanTime = Date.now() - start;
  
  expect(scanTime).toBeLessThan(15000);

  // 4. Click rapid node switches
  const nodeClickTimes = [];
  for (let i = 0; i < 5; i++) {
    const t0 = performance.now();
    await page.click('[data-testid=graph-node]:nth-child(' + (i + 1) + ')');
    await page.waitForSelector('[data-testid=node-panel]', { timeout: 1000 });
    nodeClickTimes.push(performance.now() - t0);
  }
  
  const avgClickTime = nodeClickTimes.reduce((a, b) => a + b) / nodeClickTimes.length;
  expect(avgClickTime).toBeLessThan(300);
});
```

---

## 🔍 Regression Test Checklist

After each code change, verify:

- [ ] Graph renders with `visibleRelationships > 0`
- [ ] Scenario tabs populate correctly
- [ ] Search filters work without null errors
- [ ] COI scan completes and updates counts
- [ ] Legal badge shows correct severity color
- [ ] Legal panel displays without crashing on unmapped patterns
- [ ] Node panel memoizes lookups (verify with React DevTools Profiler)
- [ ] No memory leaks in DevTools (heap snapshot stable after 5 min idle)

---

## 🚀 Performance Benchmarks

**Before Optimizations:**
- **Rendering 500 relationships:** 4.2s FCP, 9.1s LCP
- **Node click latency:** 580ms average
- **Search filter latency:** 450ms average
- **Memory (heap):** 45MB stable

**After Quick Wins (Expected):**
- **Rendering 500 relationships:** 1.8s FCP, 4.2s LCP (57% ↓)
- **Node click latency:** 210ms average (64% ↓)
- **Search filter latency:** 150ms average (67% ↓)
- **Memory (heap):** 28MB stable (38% ↓)

---

## ✅ Sign-Off Criteria

Release is green when:

1. ✅ All Scenario 1 (Stress) test cases pass with target thresholds
2. ✅ No uncaught exceptions in Scenario 2 (Error) cases
3. ✅ All 6 COI patterns detected correctly in Scenario 3
4. ✅ Mobile UI responsive and functional (Scenario 4)
5. ✅ Regression checklist 100% pass
6. ✅ Memory stable (no leaks over 10 min)
7. ✅ No console errors in production build

---

## 📝 Test Execution Log

```
Test Run: [Date & Time]
Tester: [Name]
Environment: [staging/prod]

Scenario 1 (Stress): [PASS/FAIL]
  - S1.1 FCP: [time] ✅
  - S1.2 Scan: [time] ✅
  - S1.3 Tab: [time] ✅
  - S1.4 Node Click: [avg time] ✅
  - S1.5 Search: [time] ✅
  - S1.6 Scroll: 60 FPS ✅

Scenario 2 (Error): [PASS/FAIL]
  - E2.1 Error banner: ✅
  - E2.2 Null search: ✅
  - E2.3 Unmapped badge: ✅
  - E2.4 Missing label: ✅

Scenario 3 (COI Accuracy): [PASS/FAIL]
  - Pattern counts: ✅
  - Severity correct: ✅

Scenario 4 (Mobile): [PASS/FAIL]
  - iPhone 12: ✅
  - Pixel 6: ✅

Overall: [PASS/FAIL]
Issues: [None / list here]
Approved by: [QA Lead]
``