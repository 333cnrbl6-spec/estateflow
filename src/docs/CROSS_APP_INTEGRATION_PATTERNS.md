# Cross-App Integration Patterns — Software Vendor Hub

**Goal:** Multiple Base44 apps (Premiso, future apps) operate as a unified software business ecosystem while maintaining independent deployments.

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    Software Vendor Hub                       │
│                   (Landing, License Mgmt)                    │
└─────────────────────────────────────────────────────────────┘
                              ↓
        ┌─────────────────────────────────────────┐
        │     Shared Services (Backend)            │
        │  • Licensing & entitlements              │
        │  • Multi-app user management             │
        │  • Cross-app data sync                   │
        │  • Usage analytics & billing             │
        └─────────────────────────────────────────┘
        │                   │                   │
        ↓                   ↓                   ↓
    ┌────────┐         ┌────────┐         ┌────────┐
    │ Premiso│         │ App 2  │         │ App 3  │
    │(Active)│         │(Future)│         │(Future)│
    └────────┘         └────────┘         └────────┘
```

---

## Patterns

### Pattern 1: Shared User & Organization Context

**Problem:** User logs into Premiso, should seamlessly access other apps without re-authentication.

**Solution:** Unified identity via Base44's built-in User entity + custom `SubscriptionContext`.

**Implementation:**

```typescript
// lib/SubscriptionContext.jsx — Shared across all apps
import { base44 } from '@/api/base44Client';

const SubscriptionContext = React.createContext(null);

export const SubscriptionProvider = ({ children }) => {
  const [user, setUser] = React.useState(null);
  const [subscription, setSubscription] = React.useState(null);
  const [entitlements, setEntitlements] = React.useState({});

  React.useEffect(() => {
    const initializeContext = async () => {
      // 1. Get authenticated user
      const currentUser = await base44.auth.me();
      setUser(currentUser);

      // 2. Fetch subscription & entitlements from shared entity
      const subs = await base44.entities.Subscription.filter(
        { user_email: currentUser.email }
      );
      
      if (subs.length > 0) {
        setSubscription(subs[0]);
        setEntitlements({
          premiso: subs[0].apps_included?.includes('premiso') || false,
          app2: subs[0].apps_included?.includes('app2') || false,
          app3: subs[0].apps_included?.includes('app3') || false,
        });
      }
    };

    initializeContext();
  }, []);

  return (
    <SubscriptionContext.Provider value={{ user, subscription, entitlements }}>
      {children}
    </SubscriptionContext.Provider>
  );
};

export const useSubscription = () => React.useContext(SubscriptionContext);
```

**Entity:**
```json
{
  "name": "Subscription",
  "type": "object",
  "properties": {
    "user_email": { "type": "string" },
    "organization_name": { "type": "string" },
    "subscription_tier": {
      "type": "string",
      "enum": ["starter", "professional", "enterprise"]
    },
    "apps_included": {
      "type": "array",
      "items": { "type": "string" },
      "description": "e.g., ['premiso', 'app2', 'app3']"
    },
    "active_until": { "type": "string", "format": "date" },
    "stripe_customer_id": { "type": "string" },
    "status": {
      "type": "string",
      "enum": ["active", "trial", "cancelled"]
    }
  },
  "required": ["user_email", "organization_name", "subscription_tier"]
}
```

---

### Pattern 2: Cross-App Data Access (Backend Functions)

**Problem:** Premiso needs to reference data from App 2, or vice versa.

**Solution:** Backend functions use `base44.asServiceRole.entities` to query shared entities cross-app.

**Implementation:**

```javascript
// functions/getSalesLeadsForProperty.js
// Called from Premiso: Get leads from a sales app for a property

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { propertyId } = await req.json();

    // Query cross-app entity (SalesLead exists in sales app, but accessible here)
    const leads = await base44.asServiceRole.entities.SalesLead.filter({
      property_id: propertyId,
      status: 'active'
    });

    return Response.json({ leads });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});
```

**Frontend Usage:**
```jsx
// In Premiso property detail page
const getSalesLeads = async (propertyId) => {
  const response = await base44.functions.invoke('getSalesLeadsForProperty', {
    propertyId
  });
  return response.data.leads;
};
```

---

### Pattern 3: Unified Analytics & Usage Tracking

**Problem:** Need to track which users use which apps, feature adoption, etc.

**Solution:** Shared `UsageMetric` entity logged from all apps.

**Implementation:**

```json
{
  "name": "UsageMetric",
  "type": "object",
  "properties": {
    "app_name": {
      "type": "string",
      "enum": ["premiso", "app2", "app3"]
    },
    "user_email": { "type": "string" },
    "feature_used": { "type": "string" },
    "action": {
      "type": "string",
      "enum": ["view", "create", "update", "delete", "export", "report"]
    },
    "entity_type": { "type": "string" },
    "record_count": { "type": "number" },
    "duration_ms": { "type": "number" },
    "timestamp": { "type": "string", "format": "date-time" }
  }
}
```

**Function to call from any app:**
```javascript
// lib/trackUsage.js (shared utility)
import { base44 } from '@/api/base44Client';

export const trackUsage = async (appName, feature, action, entityType, count = 1, durationMs = 0) => {
  await base44.entities.UsageMetric.create({
    app_name: appName,
    user_email: await base44.auth.me().email,
    feature_used: feature,
    action,
    entity_type: entityType,
    record_count: count,
    duration_ms: durationMs,
    timestamp: new Date().toISOString()
  });
};
```

---

### Pattern 4: App-Specific Navigation & License Gating

**Problem:** User should only see/access apps they're licensed for.

**Implementation:**

```jsx
// components/HubNavigation.jsx (shared)
import { useSubscription } from '@/lib/SubscriptionContext';
import { Link } from 'react-router-dom';

export const HubNavigation = () => {
  const { entitlements } = useSubscription();

  return (
    <nav className="flex gap-4">
      <Link to="/dashboard" className="font-bold">Home</Link>
      {entitlements.premiso && <Link to="/premiso">Premiso</Link>}
      {entitlements.app2 && <Link to="/app2">App 2</Link>}
      {entitlements.app3 && <Link to="/app3">App 3</Link>}
      <Link to="/account">Account</Link>
    </nav>
  );
};
```

```jsx
// App.jsx (in each app)
const ProtectedAppRoute = ({ appName, element }) => {
  const { entitlements } = useSubscription();

  if (!entitlements[appName]) {
    return <UpgradePrompt appName={appName} />;
  }

  return element;
};

// Usage
<Route
  path="/premiso/*"
  element={<ProtectedAppRoute appName="premiso" element={<PremisoDashboard />} />}
/>
```

---

### Pattern 5: Shared Entities Between Apps

**Problem:** Property, Tenant, Contact entities used by multiple apps.

**Solution:** Design core entities as "shared" in the hub; apps reference them.

**Example:**
- **Hub owns:** Property, Unit, Tenant, Contact, Company, Document
- **Premiso extends:** Adds compliance-specific fields (certificates, maintenance logs)
- **Sales App extends:** Adds viewing, offer, valuation data to same Property
- **Finance App extends:** Adds invoices, payments to same Property/Tenant

```json
{
  "name": "Property",
  "description": "Shared across all apps",
  "properties": {
    "name": { "type": "string" },
    "address": { "type": "string" },
    
    // Premiso-specific
    "listed_building": { "type": "boolean" },
    "hmo_license_required": { "type": "boolean" },
    
    // Sales-specific (can be nullable in Premiso)
    "market_value": { "type": "number" },
    "last_valuation_date": { "type": "string" }
  }
}
```

---

### Pattern 6: Webhooks & Real-Time Sync

**Problem:** When a tenant is created in Premiso, a lead should auto-sync to Sales App.

**Solution:** Automation triggered on entity creation.

**Implementation:**
```javascript
// Automation: When Tenant created in Premiso, create Lead in Sales App
create_automation({
  automation_type: 'entity',
  name: 'Sync New Tenant to Sales',
  function_name: 'syncTenantToSalesLead',
  entity_name: 'Tenant',
  event_types: ['create']
});

// functions/syncTenantToSalesLead.js
Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const { data: tenant } = await req.json();

  // Create corresponding sales lead
  await base44.asServiceRole.entities.SalesLead.create({
    property_id: tenant.property_id,
    contact_name: tenant.full_name,
    contact_email: tenant.email,
    contact_phone: tenant.phone,
    source: 'auto_sync_from_premiso',
    status: 'contact_info_captured'
  });

  return Response.json({ synced: true });
});
```

---

## Deployment Strategy

### Option A: Monorepo (Single Base44 Project)
**Pros:** Shared UI components, single entity schema, easy cross-app calls
**Cons:** All apps must deploy together; harder to version independently

```
/src
  /pages/premiso/...
  /pages/app2/...
  /pages/app3/...
  /components/shared/...
  /lib/shared/...
  /entities/... (all apps' entities)
  /functions/... (all apps' functions)
App.jsx (routes to all three apps)
```

### Option B: Multi-Project (Separate Base44 Apps)
**Pros:** Independent deployments, separate codebases, isolated scaling
**Cons:** More complex cross-app communication, entity duplication

```
/premiso (Base44 Project 1)
/app2 (Base44 Project 2)
/app3 (Base44 Project 3)
/hub (Base44 Project 4 — landing, licensing, user mgmt)
```

**Recommendation:** Start with **Option A** (monorepo). Move to **Option B** only when Premiso is proven and other apps have separate customers/roadmaps.

---

## Billing & Licensing

**Hub Function:**
```javascript
// functions/checkAppEntitlement.js
Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const user = await base44.auth.me();
  const { appName } = await req.json();

  const subscription = await base44.asServiceRole.entities.Subscription.filter({
    user_email: user.email
  });

  if (!subscription?.[0]?.apps_included?.includes(appName)) {
    return Response.json({ authorized: false }, { status: 403 });
  }

  return Response.json({ authorized: true });
});
```

---

## Summary

| Pattern | Use Case |
|---------|----------|
| **Shared User Context** | Single login for all apps |
| **Cross-App Entity Queries** | One app reads another's data |
| **Usage Analytics** | Track feature adoption across apps |
| **License Gating** | Show/hide apps by subscription tier |
| **Shared Core Entities** | Property, Tenant, Contact used by all |
| **Webhooks & Sync** | Auto-sync between apps on entity change |

This structure lets you scale from 1 app (Premiso) → 3+ apps while maintaining coherence as a unified software vendor business.