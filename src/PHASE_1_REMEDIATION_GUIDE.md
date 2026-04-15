# Phase 1: Critical Stabilization (Week 1–2)
**Detailed Step-by-Step Remediation**

---

## Task 1: Error Boundaries on All Routes (3 hours)

### 1.1 Current State
- ✅ Root `ErrorBoundary` exists at app level
- ❌ No error boundaries wrapping individual pages
- ❌ Single page crash = entire route breaks

### 1.2 Implementation

**Step 1:** Create route-level error boundary
```jsx
// components/RouteErrorBoundary.jsx
import ErrorBoundary from '@/components/ErrorBoundary';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function RouteErrorBoundary({ children }) {
  return (
    <ErrorBoundary
      fallback={({ error, reset }) => (
        <div className="flex flex-col items-center justify-center h-screen gap-4">
          <AlertTriangle className="w-12 h-12 text-destructive" />
          <h1 className="text-2xl font-bold">Something went wrong</h1>
          <p className="text-sm text-muted-foreground max-w-md text-center">
            {error?.message || 'An unexpected error occurred'}
          </p>
          <Button onClick={reset}>Try again</Button>
        </div>
      )}
    >
      {children}
    </ErrorBoundary>
  );
}
```

**Step 2:** Update `App.jsx` — wrap all authenticated routes
```jsx
// In App.jsx
<Route element={<AppLayout />}>
  <Route path="/dashboard" element={<RouteErrorBoundary><Dashboard /></RouteErrorBoundary>} />
  <Route path="/relationship-intelligence" element={<RouteErrorBoundary><RelationshipIntelligence /></RouteErrorBoundary>} />
  {/* ... repeat for all routes ... */}
</Route>
```

**Automation:** Script to generate wrapper for all routes:
```bash
# Find all page routes and wrap them
grep -r 'path="/.*" element=<' src/App.jsx | wc -l
# Expected: ~80 routes
```

**Time Estimate:** 2.5 hours (50 routes × 3 min per wrap).

---

## Task 2: Request Validation with Zod (4 hours)

### 2.1 Current State
- ❌ No validation on backend function inputs
- ❌ Invalid data silently corrupts database

### 2.2 Implementation

**Step 1:** Create validation schemas
```javascript
// lib/validationSchemas.js
import { z } from 'zod';

export const AddRelationshipSchema = z.object({
  from_entity_id: z.string().uuid('Invalid entity ID'),
  from_entity_type: z.enum(['person', 'company', 'property', 'unit']),
  from_label: z.string().min(1).max(255),
  to_entity_id: z.string().uuid('Invalid entity ID'),
  to_entity_type: z.enum(['person', 'company', 'property', 'unit']),
  to_label: z.string().min(1).max(255),
  relationship_type: z.enum([
    'director_of', 'psc_of', 'owns_freehold', 'holds_leasehold',
    // ... other types
  ]),
  conflict_of_interest: z.boolean().optional(),
  conflict_description: z.string().optional(),
});

export const COIScanSchema = z.object({
  action: z.enum(['scan', 'fix']),
  dry_run: z.boolean().default(true),
});
```

**Step 2:** Apply to backend functions
```javascript
// In detectConflictsOfInterest.js (example)
Deno.serve(async (req) => {
  try {
    const body = await req.json();
    const validated = COIScanSchema.parse(body);
    // Now proceed with validated data
    // ...
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }
    // ... other errors
  }
});
```

**Coverage:** Apply to all 30+ functions accepting input.  
**Time Estimate:** 3–4 hours.

---

## Task 3: Auth Checks on Admin Functions (2 hours)

### 3.1 Current State
- ✅ Some functions check `user.role === 'admin'`
- ❌ Inconsistent pattern; some functions don't check

### 3.2 Implementation

**Step 1:** Create auth utility
```javascript
// lib/authHelpers.js
export async function requireAdminRole(req) {
  const base44 = createClientFromRequest(req);
  const user = await base44.auth.me();
  if (!user) {
    throw new Error('Unauthorized');
  }
  if (user.role !== 'admin') {
    throw new Error('Forbidden: Admin access required');
  }
  return user;
}
```

**Step 2:** Apply to all admin functions
```javascript
// Before: inconsistent checks
// After: consistent pattern
Deno.serve(async (req) => {
  try {
    const user = await requireAdminRole(req);
    // ... proceed with operation
  } catch (error) {
    if (error.message === 'Unauthorized') {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (error.message === 'Forbidden: Admin access required') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }
    return Response.json({ error: error.message }, { status: 500 });
  }
});
```

**Audit:** Grep all functions for `role` checks
```bash
grep -l "user.role" functions/*.js | wc -l
# Expected: <10 currently have checks
# Target: ALL admin functions
```

**Time Estimate:** 1.5–2 hours (scan + fix ~15 functions).

---

## Task 4: Fix Subscription Leaks (4 hours)

### 4.1 Current State
- ❌ `RelationshipIntelligence`, `MaintenanceBoard` subscribe but don't unsubscribe
- ❌ Memory leak: multiple subscriptions fire when switching pages

### 4.2 Implementation

**Step 1:** Identify all subscription patterns
```javascript
// Search for these patterns:
grep -r "\.subscribe\(" src/pages/*.jsx | grep -v "useEffect" | grep -v "return () =>"
```

**Step 2:** Fix each component
```javascript
// BAD:
useEffect(() => {
  base44.entities.OwnershipRelationship.subscribe((event) => {
    setRelationships(prev => [...prev, event.data]);
  });
}, []);

// GOOD:
useEffect(() => {
  const unsubscribe = base44.entities.OwnershipRelationship.subscribe((event) => {
    setRelationships(prev => [...prev, event.data]);
  });
  
  return () => unsubscribe(); // Cleanup on unmount
}, []);
```

**Affected Files:**
- `pages/RelationshipIntelligence.jsx` (✅ FIXED)
- `pages/MaintenanceBoard.jsx` (needs fix)
- `pages/ComplianceHub.jsx` (needs fix)
- ~10 more pages with subscriptions

**Time Estimate:** 3–4 hours.

---

## Task 5: Rate Limiting on Public Endpoints (2 hours)

### 5.1 Current State
- ❌ No protection against brute force / API abuse
- ❌ Anyone can call expensive functions unlimited times

### 5.2 Implementation

**Step 1:** Create rate limit utility
```javascript
// lib/rateLimiter.js
const limiterStore = new Map();

export function createRateLimiter(maxRequests = 10, windowMs = 60000) {
  return (identifier) => {
    const key = `${identifier}:${Math.floor(Date.now() / windowMs)}`;
    const count = limiterStore.get(key) || 0;
    
    if (count >= maxRequests) {
      throw new Error('Rate limit exceeded');
    }
    
    limiterStore.set(key, count + 1);
    
    // Cleanup old entries
    if (limiterStore.size > 10000) {
      limiterStore.clear();
    }
  };
}
```

**Step 2:** Apply to sensitive functions
```javascript
// In detectConflictsOfInterest.js (expensive function)
const scanLimiter = createRateLimiter(5, 60000); // 5 scans per minute per user

Deno.serve(async (req) => {
  try {
    const user = await base44.auth.me();
    scanLimiter(user.email); // Rate limit by user
    
    // ... proceed with scan
  } catch (error) {
    if (error.message === 'Rate limit exceeded') {
      return Response.json(
        { error: 'Too many requests. Try again later.' },
        { status: 429 }
      );
    }
  }
});
```

**Functions to Protect:**
- `detectConflictsOfInterest` (expensive scan)
- `seedAllScenarios` (large operation)
- `generateSalesDemoData` (expensive)

**Time Estimate:** 2 hours.

---

## Task 6: Encrypt PII Fields (8 hours)

### 6.1 Current State
- ❌ All personal data stored as plain text
- ❌ Database breach = full PII exposure

### 6.2 Implementation Strategy

**Approach:** Encrypt sensitive fields using Deno's Web Crypto API.

**Step 1:** Create encryption utility
```javascript
// lib/encryption.js
async function encrypt(data, password) {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    'PBKDF2',
    false,
    ['deriveKey']
  );
  
  const derivedKey = await crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt: new Uint8Array(16), iterations: 100000, hash: 'SHA-256' },
    key,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt']
  );
  
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    derivedKey,
    encoder.encode(JSON.stringify(data))
  );
  
  return btoa(String.fromCharCode(...new Uint8Array(encrypted))) + ':' + btoa(String.fromCharCode(...iv));
}

async function decrypt(encrypted, password) {
  // Implementation
}

export { encrypt, decrypt };
```

**Step 2:** Update entity CRUD operations
```javascript
// When creating a Tenant:
const tenant = {
  full_name: await encrypt({ value: formData.full_name }, ENCRYPTION_KEY),
  email: await encrypt({ value: formData.email }, ENCRYPTION_KEY),
  phone: await encrypt({ value: formData.phone }, ENCRYPTION_KEY),
  // ... other fields
};

await base44.entities.Tenant.create(tenant);

// When reading:
const decrypted = await decrypt(tenant.email, ENCRYPTION_KEY);
```

**Fields to Encrypt (Priority 1):**
- `Tenant.email`, `Tenant.phone`, `Tenant.full_name`
- `Contact.email`, `Contact.phone`, `Contact.address`
- `Tenant.screening.credit_check` (sensitive)

**Note:** Requires backend migration + zero-downtime encryption.  
**Alternative (Simpler):** Use a third-party service like AWS Secrets Manager or HashiCorp Vault.

**Time Estimate:** 6–8 hours (implementation + testing).

---

## Execution Timeline

| Week | Day | Task | Hours | Owner |
|------|-----|------|-------|-------|
| 1 | Mon | Setup & Planning | 1 | Tech Lead |
| 1 | Mon-Tue | Error Boundaries | 3 | Frontend Dev |
| 1 | Tue-Wed | Zod Validation | 4 | Backend Dev |
| 1 | Wed | Auth Checks | 2 | Backend Dev |
| 1 | Thu | Subscription Leaks | 4 | Frontend Dev |
| 1 | Fri | Rate Limiting | 2 | Backend Dev |
| 2 | Mon-Thu | PII Encryption | 8 | Backend Dev + DB Admin |
| 2 | Fri | Testing & Documentation | 4 | QA + Tech Lead |

**Total Team Effort:** 28 hours (can compress to 8 days with 2–3 devs working in parallel).

---

## Testing Checklist (Before Merge)

- [ ] Error boundary catches rendering errors
- [ ] Invalid API payloads rejected with 400
- [ ] Non-admin users get 403 on admin endpoints
- [ ] Page switch doesn't leave dangling subscriptions (check DevTools Memory)
- [ ] Rate limit returns 429 after N requests
- [ ] Encrypted data readable after decryption
- [ ] No console errors in production build

---

## Sign-Off

Phase 1 complete when:
✅ All 6 tasks merged and tested  
✅ No regressions in existing functionality  
✅ Security audit passes critical checks  
✅ Performance benchmarks stable  

**Target Completion:** End of Week 2