# Premiso Production Readiness Audit
**Date:** 2026-04-13 | **Status:** Pre-Launch Review

---

## Executive Summary

Premiso is a feature-rich property management platform with solid architectural foundations but requires **critical hardening** before production deployment. Key areas: error handling, validation, security, and performance optimization.

**Risk Level:** 🟡 MEDIUM (fixable, 1-2 weeks of focused work)

---

## 1. CRITICAL ISSUES (Must Fix)

### 1.1 Data Validation & Sanitization
**Issue:** Backend functions lack input validation
```javascript
// ❌ CURRENT: No validation
Deno.serve(async (req) => {
  const data = await req.json();
  await base44.entities.Property.create(data); // Unsafe
});
```
**Fix:** Add validation layer
```javascript
// ✅ RECOMMENDED
import { z } from 'zod';

const PropertySchema = z.object({
  name: z.string().min(1, 'Name required').max(255),
  postcode: z.string().regex(/^[A-Z]{1,2}\d{1,2}\s?\d[A-Z]{2}$/i),
  property_type: z.enum(['freehold_block', 'leasehold_block', ...])
});

Deno.serve(async (req) => {
  const data = PropertySchema.parse(await req.json());
  // Safe to use data
});
```
**Impact:** HIGH - Prevents bad data, injection attacks

### 1.2 Authentication & Authorization
**Issue:** Admin-only functions lack verification (e.g., `cleanseAndStageData`)
```javascript
// ❌ CURRENT: No auth check
export async function cleanseAndStageData(req) {
  // Anyone can trigger this!
}
```
**Fix:** Add auth verification to sensitive operations
```javascript
// ✅ RECOMMENDED
export async function cleanseAndStageData(req) {
  const base44 = createClientFromRequest(req);
  const user = await base44.auth.me();
  
  if (!user || user.role !== 'admin') {
    return Response.json({ error: 'Forbidden' }, { status: 403 });
  }
  // Continue...
}
```
**Affected Functions:** `cleanseAndStageData`, `commitStagedData`, `analyzeDataQualityAndDuplicates`, `syncNominalFromAccounting`

### 1.3 Error Propagation in Automations
**Issue:** Automations fail silently without logging
```javascript
// ❌ Current: Silent failures
create_automation({
  name: "Rent Reminder",
  function_name: "sendRentReminder",
  // No error logging/retry mechanism
});
```
**Fix:** Add error tracking
```javascript
// ✅ Need error logging in automation-triggered functions
// Recommend CloudWatch/Sentry integration
```

### 1.4 Rate Limiting on Public Functions
**Issue:** Public APIs (tenant portal, contractor portal) lack rate limiting
**Fix:** Implement request throttling in functions
```javascript
// Add to key endpoints
const MAX_REQUESTS_PER_HOUR = 100;
// Track by user/IP, return 429 if exceeded
```

---

## 2. HIGH-PRIORITY IMPROVEMENTS

### 2.1 Environment Configuration
**Issue:** Hardcoded values, no env-based configuration
```javascript
// ❌ Hardcoded
const BASE_URL = 'https://api.premiso.local';
const COMPLIANCE_THRESHOLD_DAYS = 30;
```
**Fix:** Use environment variables
```javascript
// ✅ Use secrets/env vars
const BASE_URL = Deno.env.get('BASE_URL');
const COMPLIANCE_THRESHOLD_DAYS = parseInt(Deno.env.get('COMPLIANCE_THRESHOLD_DAYS') || '30');
```

### 2.2 Database Indexes
**Issue:** No mention of indexes on frequently-queried fields
**Recommended Indexes:**
```
// Entity queries by property_id (100K+ records expected)
Property: { name, postcode, region }
Unit: { property_id, status }
Tenant: { property_id, unit_id, status }
MaintenanceRequest: { property_id, status, priority, assigned_date }
FinancialTransaction: { property_id, date, type }
ComplianceTask: { property_id, status, expiry_date }
```

### 2.3 Pagination Issues
**Issue:** Some list queries lack pagination (Dashboard fetches all records)
```javascript
// ❌ CURRENT: No limit
const properties = await base44.entities.Property.list();
```
**Fix:** Always paginate
```javascript
// ✅ RECOMMENDED
const properties = await base44.entities.Property.list('-updated_date', 50);
const [page, setPage] = useState(0);
const pageSize = 20;
```

### 2.4 File Upload Security
**Issue:** No file validation in document uploads
**Fix:** Add validation in `handleTenantDocumentUpload` and similar
```javascript
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = ['pdf', 'docx', 'doc', 'jpg', 'png'];

const validateFile = (file) => {
  if (file.size > MAX_FILE_SIZE) throw new Error('File too large');
  const ext = file.name.split('.').pop().toLowerCase();
  if (!ALLOWED_TYPES.includes(ext)) throw new Error('File type not allowed');
};
```

---

## 3. MEDIUM-PRIORITY IMPROVEMENTS

### 3.1 Missing Error Boundaries
**Issue:** Some pages lack error boundaries
- PropertyInspection
- ContractorPortal
- TenantPortal

**Fix:** Wrap pages with ErrorBoundary
```jsx
import ErrorBoundary from '@/components/ErrorBoundary';

export default function Page() {
  return <ErrorBoundary><YourPage /></ErrorBoundary>;
}
```

### 3.2 Loading States
**Issue:** Many components show no loading state while fetching
- MaintenanceWorkflow (initial load)
- Dashboard (slow on large portfolios)
- ComplianceAudit

**Fix:** Add skeleton loaders and loading indicators

### 3.3 CSV Import Validation
**Issue:** `DataCSVUploadAndMapping` lacks duplicate detection
**Fix:** Add deduplication check
```javascript
// Before staging, check for duplicates
const checkDuplicates = (records) => {
  const seen = new Set();
  return records.filter(r => {
    const key = `${r.full_name}|${r.email}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};
```

### 3.4 Compliance Certificate Alerts
**Issue:** 30-day alert threshold is hard-coded
**Fix:** Make configurable per certificate type
```javascript
const ALERT_THRESHOLDS = {
  gas_safety: 30,
  eicr: 60,
  fire_safety: 45,
  epc: 90,
};
```

### 3.5 Tenant Portal Authentication
**Issue:** URL token-based auth in `TenantPortal` may be bypassed
```javascript
// ❌ CURRENT: Only token param check
const token = urlParams.get('token');
if (!token) return <div>Invalid access</div>;
```
**Fix:** Validate token server-side
```javascript
// ✅ RECOMMENDED: Validate token signature
const validateTenantToken = async (token) => {
  const verified = await base44.functions.invoke('validateTenantAccessToken', { token });
  if (!verified) throw new Error('Invalid token');
};
```

---

## 4. PERFORMANCE OPTIMIZATIONS

### 4.1 React Query Caching
**Issue:** Some queries lack proper cache invalidation
```javascript
// ✅ GOOD: Has invalidation
await queryClient.invalidateQueries({ queryKey: ['maintenance'] });

// ❌ MISSING: Some mutations don't invalidate
const createTransaction = async () => {
  // Doesn't invalidate 'transactions' query
};
```

### 4.2 Component Memoization
**Issue:** Heavy components re-render unnecessarily
**Fix:** Memoize StatCard, PropertyCard, etc.
```javascript
export const StatCard = React.memo(({ title, value, icon }) => (
  // Component
));
```

### 4.3 Bundle Size
**Issue:** Three.js is imported but only used in 1-2 pages
**Fix:** Lazy load
```javascript
const ContractorPortal = lazy(() => import('./pages/ContractorPortal'));
const PropertyInspection = lazy(() => import('./pages/PropertyInspection'));
```

### 4.4 API Response Compression
**Issue:** Large entity lists not compressed
**Fix:** Ensure backend returns compressed responses (Deno handles automatically, verify)

---

## 5. SECURITY HARDENING

### 5.1 CORS & CSP
**Status:** Not mentioned in config
**Recommendation:** Ensure platform enforces strict CORS on backend

### 5.2 Secrets Management
**Current:** STRIPE_SECRET_KEY only
**Add:**
- DATABASE_ENCRYPTION_KEY
- JWT_SECRET (if using custom auth)
- API_RATE_LIMIT_KEY

### 5.3 SQL Injection / Data Injection
**Status:** Uses ORM (base44 SDK), safe from SQL injection ✅

### 5.4 XSS Protection
**Issue:** `react-markdown` renders untrusted content in messages
**Fix:** Sanitize markdown input
```javascript
import DOMPurify from 'dompurify';

const safeHTML = DOMPurify.sanitize(markdownHTML);
```

---

## 6. TESTING GAPS

### 6.1 Existing Tests
- ✅ E2E tests exist (auth, CRUD, navigation, etc.)
- ✅ Unit tests for some functions

### 6.2 Missing Coverage
- ❌ CSV import validation tests
- ❌ Compliance alert logic tests
- ❌ Data cleansing tests
- ❌ Financial calculation tests (yield, occupancy rates)

### 6.3 Recommendation
Create unit test suite:
```javascript
// tests/unit/functions/cleanseAndStageData.test.js
describe('cleanseAndStageData', () => {
  test('removes invalid emails', () => {
    const result = cleanseEmail('invalid@');
    expect(result).toBe(null);
  });
  
  test('standardizes phone numbers', () => {
    const result = cleansePhone('+44 1234 567890');
    expect(result).toBe('01234567890');
  });
});
```

---

## 7. DOCUMENTATION GAPS

### 7.1 Missing Docs
- ❌ API endpoint documentation
- ❌ Entity schema reference (partially covered)
- ❌ Data flow diagrams
- ❌ Backup & recovery procedures
- ❌ Disaster recovery plan

### 7.2 Create
```markdown
# docs/
  ├── API_ENDPOINTS.md (list all functions, params, responses)
  ├── ENTITY_SCHEMA_REFERENCE.md
  ├── DATA_FLOW.md (diagrams of import, compliance, maintenance workflows)
  ├── DEPLOYMENT.md
  ├── BACKUP_AND_RECOVERY.md
  └── RUNBOOKS/ (operational procedures)
```

---

## 8. OPERATIONAL READINESS

### 8.1 Monitoring & Logging
**Status:** No mention of centralized logging
**Recommendation:**
- Sentry or similar for error tracking
- CloudWatch / Stackdriver for infrastructure logs
- Custom logging for business events (payments, compliance alerts, etc.)

### 8.2 Alerts
**Missing:**
- ❌ Compliance certificate expiry (should trigger 30 days before)
- ❌ Failed automations
- ❌ High error rate in functions
- ❌ Database performance degradation

### 8.3 Backups
**Status:** Not documented
**Must implement:**
- Automated daily backups of database
- Test restore procedures
- Backup retention policy (90 days minimum)

### 8.4 Incident Response
**Missing:** On-call procedures, escalation paths, SLAs

---

## 9. DEPLOYMENT CHECKLIST

- [ ] All input validation implemented
- [ ] Auth checks on admin functions
- [ ] Error handling in automations with logging
- [ ] Rate limiting on public endpoints
- [ ] Environment variables configured
- [ ] Database indexes created
- [ ] File upload validation
- [ ] CORS/CSP properly configured
- [ ] Error boundaries on all pages
- [ ] Loading states added
- [ ] Unit tests > 80% coverage
- [ ] E2E tests all critical flows
- [ ] Security audit completed
- [ ] Performance tested (load test)
- [ ] Backup/restore tested
- [ ] Documentation completed
- [ ] Monitoring & alerts configured
- [ ] Runbooks written
- [ ] Team training completed

---

## 10. QUICK WINS (1-3 Days)

1. ✅ **Add validation to cleanseAndStageData** (30 min)
2. ✅ **Add auth checks to admin functions** (1 hour)
3. ✅ **Add pagination to Dashboard queries** (2 hours)
4. ✅ **Add error boundaries to all pages** (3 hours)
5. ✅ **Add rate limiting stubs to public functions** (2 hours)
6. ✅ **Document required environment variables** (1 hour)

---

## Recommended Priority

**Week 1:**
- Critical issues (1.1-1.4)
- High-priority (2.1-2.4)
- Quick wins (#10)

**Week 2:**
- Medium-priority improvements
- Performance optimizations
- Testing & documentation

**Week 3:**
- Security hardening (5.1-5.4)
- Monitoring & alerts setup
- Runbook creation & training

---

## Conclusion

Premiso has **solid foundations** but needs **security and validation hardening** before production. Most issues are fixable within 2-3 weeks with focused effort. The newly created error handling and CSV import systems are good additions but need authentication validation.

**Estimated effort to production-ready: 200-300 developer hours**

Start with **Critical Issues (Section 1)** immediately.