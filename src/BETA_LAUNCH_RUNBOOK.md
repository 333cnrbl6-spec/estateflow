# Beta Launch Runbook
**For:** Investor Demo & Initial Beta Users  
**Prepared:** 2026-04-16

---

## Pre-Launch Checklist (Do This Before Inviting Users)

### 1. Final Code Verification
```bash
# Clear all caches
rm -rf node_modules/.cache

# Rebuild
npm run build

# Should see: "✓ built successfully with no errors"
```

### 2. Run Full Test Suite
```bash
# This runs the comprehensive beta audit tests
npm test -- tests/e2e/beta-release-audit.spec.js

# Expected: All tests pass (30+ assertions)
```

### 3. Manual Smoke Test (5 minutes)
- [ ] Open app in Chrome
- [ ] Click "Login" and authenticate
- [ ] Click on 3 different sidebar zones (Core, Finance, Compliance)
- [ ] Navigate to `/properties` - verify no crash
- [ ] Navigate to `/dashboard` - verify chart loads
- [ ] Open browser console (F12) - should show NO red errors
- [ ] Close and reopen sidebar - should expand/collapse smoothly

### 4. Mobile Verification (2 minutes)
- [ ] Open Chrome DevTools (F12)
- [ ] Set viewport to iPhone 12 (390×844)
- [ ] Reload page
- [ ] Scroll horizontally on page - should have NO horizontal scrollbar
- [ ] Click sidebar zones - should work on mobile

---

## During Beta Launch

### Critical Monitoring Points

#### 1. **Sidebar Navigation** (Most Critical)
If users report "sidebar not working" or "can't navigate":
1. Check `/errors` page for Console errors
2. Look for "Cannot read property" or "TypeError" in logs
3. Likely cause: Component icon regression → Check `lib/navigationZones.js`

#### 2. **Property Page Crashes**
If users can't view properties:
1. Check for undefined entity data
2. Verify `properties.property_type` is a string, not an object
3. Check `/errors` → should show type error details

#### 3. **Form Submission Failures**
If forms won't submit:
1. Check for validation errors in `EntityFormDialog`
2. Verify enum values match schema
3. Check network tab in DevTools for API errors

#### 4. **Page Load Hangs**
If page takes >5 seconds to load:
1. Check `/performance-metrics` dashboard
2. Look for slow API calls
3. Check network tab for stalled requests

---

## Emergency Response Procedures

### Issue: "Sidebar completely broken"
**Time to Fix:** 5 minutes

1. Check `lib/navigationZones.js` for component icons in route objects
2. All route `icon` values must be strings (emojis) or functions
3. Zone header `icon` values must be Lucide components or functions
4. Fix: Replace any `icon: ComponentName` with `icon: '📁'` (emoji)

### Issue: "Can't create property"
**Time to Fix:** 3 minutes

1. Check browser console for validation errors
2. Verify all required fields (minimum: `name`) are filled
3. Check if enum fields have correct values from schema
4. Verify no type mismatches in form data

### Issue: "Users can't log in"
**Time to Fix:** 2 minutes

1. Check `/errors` → look for auth_required errors
2. Verify authentication token is being sent
3. Check `lib/AuthContext.jsx` for error handling
4. If recurring, check server logs for auth service issues

### Issue: "App crashes on page load"
**Time to Fix:** 10 minutes

1. Check browser console for error message
2. Look for "Cannot read property of undefined"
3. Open DevTools → Console → look for error stack trace
4. Find the component causing crash, wrap in try-catch if needed
5. Or navigate to alternate page using sidebar

---

## Quick Fixes During Beta

### If Sidebar Icons Look Wrong
Edit `lib/navigationZones.js`:
```javascript
// WRONG (will crash):
{ path: '/dashboard', icon: Dashboard }

// CORRECT:
{ path: '/dashboard', icon: '📊' }
```

### If Entity Page Has Type Errors
Check the page file, ensure type guards like:
```javascript
{property.property_type && typeof property.property_type === 'string' && ...}
```

### If Form Validation Fails
Check `components/shared/EntityFormDialog.jsx` ensures all fields have default values.

---

## Escalation Contacts

| Issue Type | Contact | Time | 
|------------|---------|------|
| Navigation crash | Check logs, restart browser | 2 min |
| Data not loading | Check API status | 5 min |
| Auth failure | Check token expiration | 5 min |
| Form errors | Check console | 3 min |
| Critical bug | Rollback to last working version | 5 min |

---

## Monitoring Dashboard

Check these pages regularly during beta:

1. **`/errors`** - Real-time error log
   - Check for repeated errors
   - Filter by timestamp to find when issues started

2. **`/performance-metrics`** - API response times
   - Alert if any query > 3 seconds
   - Check sidebar zone opening time

3. **`/dashboard`** - User activity visible here
   - Properties count
   - Tenants added
   - Compliance items viewed

---

## User Communication Templates

### If Sidebar is Broken
```
We're investigating a navigation issue. As a workaround:
1. Refresh the page (Ctrl+R)
2. Try accessing the page directly via URL
3. We're working on a fix

Expected fix time: 30 minutes
```

### If Can't Create Property
```
We found an issue with property creation. Please try:
1. Ensure the property name is filled in
2. Check that all enum fields have valid options
3. Refresh and try again

If still failing, please report with the error message from browser console (F12).
```

---

## Post-Beta Review (Day 1, Day 3, Week 1)

### Day 1
- [ ] No critical errors in `/errors` logs
- [ ] All users successfully created at least one property
- [ ] Sidebar navigation used by 90%+ of users
- [ ] No "Cannot read property" crashes

### Day 3
- [ ] Performance stable (API response < 2s average)
- [ ] 0 repeated errors (each error only once)
- [ ] Users completing onboarding flow
- [ ] Mobile users report no horizontal scroll issues

### Week 1
- [ ] Feature adoption metrics on `/performance-metrics`
- [ ] Error rate < 0.1% of total transactions
- [ ] Average page load < 2 seconds
- [ ] Ready for wider beta expansion

---

## Rollback Procedure (If Critical Issue Found)

```bash
# If something is very broken, revert to last stable version
git revert HEAD~1

# Or specific file
git checkout HEAD~1 -- lib/navigationZones.js

# Then redeploy
npm run build && npm run deploy
```

Expected downtime: 2-3 minutes

---

## Notes for Investor Demo

- **Show stability, not features**
- Walk through sidebar zones slowly to demonstrate navigation works
- Load a couple pages, show data loads correctly
- Mention the comprehensive testing (beta audit test suite)
- Highlight error handling: intentionally cause an error, show graceful recovery
- Do NOT show console errors to investors

---

## Beta Success Metrics

- ✅ 0 crashes during first 48 hours
- ✅ All users can navigate sidebar
- ✅ All users can create entities
- ✅ Zero type-related errors in console
- ✅ Mobile viewport works without horizontal scroll
- ✅ Performance < 3s page load average

If all metrics pass → Ready for wider beta or production

---

**Last Updated:** 2026-04-16  
**Version:** 1.0 - Beta Release  
**Status:** Ready for Investor Demo & Beta Users