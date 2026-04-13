# Production Readiness Fixes - Implementation Roadmap

**Target:** Ship-ready Premiso in 2-3 weeks

---

## Phase 1: CRITICAL FIXES (Week 1 - Days 1-5)

### Task 1.1: Validate & Sanitize All Backend Functions
**Status:** 🔴 NOT STARTED  
**Time:** 8-10 hours  
**Priority:** CRITICAL

**Files to update:**
```
functions/
├── cleanseAndStageData.js          ← Add validation
├── commitStagedData.js             ← Add validation + auth
├── analyzeDataQualityAndDuplicates.js
├── syncNominalFromAccounting.js
├── checkCertificateExpiryAlerts.js
├── sendRentReminder.js
├── processRecurringPayment.js
└── [20+ others]
```

**Implementation pattern:**
```javascript
import { z } from 'zod';

// Define schema
const PayloadSchema = z.object({
  property_id: z.string().uuid(),
  amount: z.number().positive().finite(),
  // ... other fields
});

Deno.serve(async (req) => {
  try {
    // 1. Validate input
    const payload = PayloadSchema.parse(await req.json());
    
    // 2. Check auth
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return new Response('Unauthorized', { status: 401 });
    
    // 3. Process safely
    const result = await base44.entities.Property.create(payload);
    return Response.json(result);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json({ errors: error.errors }, { status: 400 });
    }
    return Response.json({ error: error.message }, { status: 500 });
  }
});
```

**Checklist:**
- [ ] cleanseAndStageData - input + admin auth
- [ ] commitStagedData - input + admin auth
- [ ] analyzeDataQualityAndDuplicates - input + admin auth
- [ ] All file upload handlers - file type/size validation
- [ ] All payment functions - amount validation + user auth
- [ ] sendRentReminder - property exists check
- [ ] Create central validation utils file

### Task 1.2: Add Auth to Admin-Only Functions
**Status:** 🔴 NOT STARTED  
**Time:** 4-6 hours  
**Priority:** CRITICAL

**Pattern:**
```javascript
const adminCheck = async (req) => {
  const base44 = createClientFromRequest(req);
  const user = await base44.auth.me();
  if (!user || user.role !== 'admin') {
    throw new Error('Admin access required');
  }
  return user;
};

// In function:
const user = await adminCheck(req);
```

**Functions needing admin auth:**
- cleanseAndStageData
- commitStagedData
- generateBulkImportTestData
- syncAccounting (Xero, Sage, QB)
- checkCertificateExpiry (scheduled)
- generatePropertyPerformanceSummary
- createBulkDocuments
- auditComplianceGaps

### Task 1.3: Error Handling in Automations
**Status:** 🟡 PARTIAL (toast system exists)  
**Time:** 6-8 hours  
**Priority:** CRITICAL

**Add error logging to key automations:**
```javascript
// In functions/checkCertificateExpiryAlerts.js
try {
  // ... logic
} catch (error) {
  // Log error details
  console.error(`[AUTOMATION_ERROR] checkCertificateExpiryAlerts:`, {
    timestamp: new Date().toISOString(),
    error: error.message,
    property_id: data?.property_id,
    stack: error.stack
  });
  
  // Re-throw so automation logs failure
  throw error;
}
```

**Setup monitoring:**
- [ ] Configure Sentry (or CloudWatch)
- [ ] Create alerting rules for automation failures
- [ ] Document incident response

---

## Phase 2: HIGH-PRIORITY (Week 1 - Days 5-7)

### Task 2.1: Environment Configuration
**Status:** 🟡 PARTIAL  
**Time:** 2-3 hours

**Create `.env.example` and validate:**
```env
# Backend
BASE_URL=https://api.premiso.example.com
STRIPE_SECRET_KEY=sk_...
COMPLIANCE_ALERT_THRESHOLD_DAYS=30
MAX_FILE_UPLOAD_SIZE=10485760
LOG_LEVEL=debug
SENTRY_DSN=https://...

# Database (if exposed)
DATABASE_ENCRYPTION_KEY=...
```

### Task 2.2: Pagination Hardening
**Status:** 🟡 PARTIAL  
**Time:** 4-6 hours

**Update Dashboard & list pages:**
```javascript
// ❌ OLD
const properties = await base44.entities.Property.list();

// ✅ NEW
const [page, setPage] = useState(0);
const pageSize = 20;
const properties = await base44.entities.Property.list(
  '-updated_date',
  pageSize,
  page * pageSize
);
```

**Priority pages:**
- Dashboard (all widgets)
- ComplianceAudit
- MaintenanceWorkflow
- TenantPortal (messages, docs)
- PropertyInspection

### Task 2.3: File Upload Validation
**Status:** 🔴 NOT STARTED  
**Time:** 3-4 hours

**Create validation utility:**
```javascript
// lib/fileValidation.js
export const UPLOAD_LIMITS = {
  maxSize: 10 * 1024 * 1024, // 10MB
  maxFiles: 5,
  allowedTypes: ['pdf', 'docx', 'xlsx', 'jpg', 'png']
};

export const validateFile = (file) => {
  if (file.size > UPLOAD_LIMITS.maxSize) {
    throw new Error(`File exceeds ${UPLOAD_LIMITS.maxSize / 1024 / 1024}MB limit`);
  }
  
  const ext = file.name.split('.').pop().toLowerCase();
  if (!UPLOAD_LIMITS.allowedTypes.includes(ext)) {
    throw new Error(`File type .${ext} not allowed`);
  }
};
```

**Apply to:**
- TenantDocumentUpload
- CertificateUploadDialog
- PropertyInspection (photo uploads)
- BulkImportTester

---

## Phase 3: MEDIUM-PRIORITY (Week 2)

### Task 3.1: Error Boundaries & Loading States
**Status:** 🟡 PARTIAL  
**Time:** 6-8 hours

**Add to pages lacking it:**
- PropertyInspection
- ContractorPortal
- LeaseholderPortalView
- OutOfHoursCallCenter
- ComplianceAudit

```jsx
import ErrorBoundary from '@/components/ErrorBoundary';

export default function Page() {
  return (
    <ErrorBoundary>
      <PageContent />
    </ErrorBoundary>
  );
}
```

### Task 3.2: Database Indexes
**Status:** 🔴 NOT STARTED  
**Time:** 2 hours (planning) + backend implementation

**Required indexes:**
```
// High-volume queries
Property(postcode, region)
Unit(property_id, status)
Tenant(property_id, email)
MaintenanceRequest(property_id, status, priority)
FinancialTransaction(property_id, date, type)
ComplianceTask(property_id, expiry_date, status)
```

### Task 3.3: React Query Optimization
**Status:** 🟡 PARTIAL  
**Time:** 4-6 hours

**Ensure all mutations invalidate:**
```javascript
const createTenant = useMutation({
  mutationFn: (data) => invoke('createTenant', data),
  onSuccess: (data) => {
    queryClient.invalidateQueries({ queryKey: ['tenants'] });
    queryClient.invalidateQueries({ queryKey: ['properties', data.property_id] });
  },
});
```

### Task 3.4: Performance Testing
**Status:** 🔴 NOT STARTED  
**Time:** 8 hours

**Load test scenarios:**
- 1000 properties with 5000 units → Dashboard load
- Bulk import 10,000 tenant records
- 100 concurrent users on maintenance board
- Generate reports for 1-year period with 100K transactions

---

## Phase 4: SECURITY (Week 2-3)

### Task 4.1: Rate Limiting
**Status:** 🔴 NOT STARTED  
**Time:** 4-6 hours

**Add to public endpoints:**
```javascript
// functions/generateTenantToken.js
const RATE_LIMITS = {
  perHour: 10,
  perDay: 50,
};

// Track requests by tenant_id/email
```

**Apply to:**
- generateTenantToken
- validateTenantAccessToken
- paymentFunction
- notifyContractorOnTicket

### Task 4.2: Secrets Management
**Status:** 🟡 PARTIAL (STRIPE_SECRET_KEY exists)  
**Time:** 2 hours

**Add missing secrets:**
```
SENTRY_DSN
DATABASE_ENCRYPTION_KEY
JWT_SECRET (if custom auth)
API_RATE_LIMIT_KEY
EMAIL_SERVICE_API_KEY
```

### Task 4.3: Input Sanitization for Markdown
**Status:** 🔴 NOT STARTED  
**Time:** 2 hours

```javascript
// In message/document components
import DOMPurify from 'dompurify';

const renderMarkdown = (content) => {
  const html = marked(content);
  return DOMPurify.sanitize(html);
};
```

---

## Phase 5: TESTING & DOCUMENTATION (Week 3)

### Task 5.1: Unit Tests
**Status:** 🟡 PARTIAL  
**Time:** 16 hours

**Create test suite for:**
```
tests/unit/
├── functions/
│   ├── cleanseAndStageData.test.js
│   ├── checkCertificateExpiryAlerts.test.js
│   ├── processRecurringPayment.test.js
│   └── [others]
├── lib/
│   ├── fileValidation.test.js
│   ├── dateFormatting.test.js
│   └── [others]
└── hooks/
    ├── useBackendFunctionError.test.js
    └── [others]
```

**Target coverage:** 80% for core functions

### Task 5.2: Documentation
**Status:** 🟡 PARTIAL  
**Time:** 12 hours

**Create:**
- [ ] API_ENDPOINTS.md (all functions)
- [ ] ENTITY_SCHEMA_REFERENCE.md
- [ ] DEPLOYMENT.md
- [ ] BACKUP_AND_RECOVERY.md
- [ ] RUNBOOKS/ (incident response, maintenance, etc.)
- [ ] COMPLIANCE_CHECKLIST.md

### Task 5.3: Monitoring Setup
**Status:** 🔴 NOT STARTED  
**Time:** 6 hours

**Configure:**
- [ ] Sentry for error tracking
- [ ] CloudWatch/Stackdriver for logs
- [ ] Uptime monitoring
- [ ] Database performance alerts
- [ ] Automation failure alerts

---

## Summary

| Phase | Timeline | Hours | Status |
|-------|----------|-------|--------|
| 1: Critical | Week 1 (Days 1-5) | 25 | 🔴 |
| 2: High-Priority | Week 1 (Days 5-7) | 20 | 🟡 |
| 3: Medium | Week 2 | 25 | 🟡 |
| 4: Security | Week 2-3 | 12 | 🔴 |
| 5: Testing & Docs | Week 3 | 28 | 🟡 |
| **TOTAL** | **3 weeks** | **110 hours** | |

**Key milestones:**
- ✅ Day 5: All critical validations & auth checks complete
- ✅ Day 10: High-priority fixes + initial testing
- ✅ Day 15: Full test coverage + monitoring live
- ✅ Day 21: Documentation complete, ready for production

---

## Success Criteria

- [ ] Zero critical security vulnerabilities
- [ ] 80%+ unit test coverage
- [ ] All automations have error logging
- [ ] 99.5% API response validation
- [ ] Load test passes (1000 concurrent users)
- [ ] All pages load in < 3 seconds
- [ ] Complete documentation
- [ ] Team trained on runbooks
- [ ] Backup/restore tested end-to-end