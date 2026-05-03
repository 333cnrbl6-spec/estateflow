# Permission & Data Isolation Architecture

## Overview
App reorganized by user permissions with tier-based subscription access and strict data isolation between users.

## User Roles & Access Levels

### 1. **Developer (333cnrbl6@gmail.com)**
- **Access**: Sales, marketing materials, admin tools, demo management
- **Routes**: 
  - `/developer-portal` — Sales/marketing hub
  - `/sales-brochure`, `/sales-one-pager`, `/marketing-assets`
  - `/demo-station`, `/dev-demo-switcher`
  - `/settings`, `/team`, `/role-management`
- **Restrictions**: DeveloperAccessPortal enforces email check; denies all others

### 2. **Admin Users** (any user with role='admin')
- **Access**: System administration, team management, see own subscription data
- **Routes**: Settings, team management, billing, compliance oversight
- **Data**: Can see only their own company/properties/subscriptions

### 3. **Regular Users** (role='user')
- **Access**: Platform features based on subscription tier
- **Routes**: Dashboard, financials, maintenance, compliance (tier-dependent)
- **Data**: Strictly isolated — no cross-user visibility

---

## Subscription Tiers

### Starter ($149/mo)
- **Modules**: Properties, Units, Tenants, Maintenance, Financials
- **Limit**: Up to 50 units
- **Reports**: Basic rent ledger

### Professional ($349/mo) ★
- **Modules**: Starter + Compliance, Reporting, CRM
- **Limit**: Up to 200 units
- **Reports**: Advanced financial reports, compliance tracking

### Enterprise ($749+/mo)
- **Modules**: All (includes Workflows, Integrations, API)
- **Limit**: Unlimited units
- **Reports**: Custom reports, API access, dedicated support

---

## Data Isolation Implementation

### Frontend
1. **PermissionContext** — Central permission state
   - Loads user role, tier, email from auth
   - Determines module access based on tier
   - Caches permission level

2. **PermissionGate** — Enforces access control
   ```jsx
   <PermissionGate requiredTier="professional">
     <AdvancedReporting />
   </PermissionGate>
   ```

3. **SubscriberFacingDashboard** (`/subscription`)
   - Shows only current user's subscription
   - Displays their properties, users, tier
   - Links to relevant documentation/support

### Backend
- **loadSubscriberData()** function must:
  - Get current authenticated user
  - Return ONLY that user's data (properties, subscription, team)
  - Never expose other users' data via query parameters or leaks

### Data Flow Audit
✅ **SalesOnePageSummary** 
- Before: Hardcoded RBM (North West) Limited, phone, email
- After: Generic "For Sales Partners", sales@premiso.io only

✅ **RBMBrandingProvider**
- Reads demo_brand from current user context only
- No global state pollution

✅ **BrandingContext**
- Loads user.branding from authenticated user
- Updateable only by that user

---

## Routes by Access Level

### Public (No Auth)
- `/` — Landing
- `/founder-launch` — Founder recruiting
- `/vendor-self-service` — Contractor signup

### Developer Only (333cnrbl6@gmail.com)
- `/developer-portal` — Access hub
- `/sales-brochure`, `/sales-one-pager`, `/marketing-assets`
- `/demo-station`, `/dev-demo-switcher`
- `/api-docs` (readable by all, editable by dev)

### Admin + Developer
- `/settings`, `/team`, `/role-management`, `/security`
- `/billing`, `/error-monitoring`

### All Authenticated Users (Tier-Gated)
- `/dashboard` — Home
- `/properties`, `/units`, `/tenants` — Core
- `/maintenance` — All tiers
- `/financials` — All tiers
- `/compliance` — Professional+
- `/reporting` — Professional+
- `/subscription` — View own subscription
- `/help`, `/api-docs` — Public docs

---

## Checking Permission in Code

### React Components
```jsx
import { usePermissions } from '@/lib/PermissionContext';

function MyComponent() {
  const { tier, modules, role, canAccessReporting } = usePermissions();
  
  if (tier === 'starter') return <LimitedView />;
  if (!modules.includes('compliance')) return <LockedFeature />;
  
  return <FullFeature />;
}
```

### Conditional Rendering
```jsx
import PermissionGate from '@/components/PermissionGate';

<PermissionGate requiredTier="professional" requiredModule="reporting">
  <AdvancedDashboard />
</PermissionGate>
```

---

## Security Checklist

- ✅ RBM branding removed from Premiso-facing pages
- ✅ Developer email hardcoded, not configurable
- ✅ Subscription data loads per-user only
- ✅ Backend queries filter by authenticated user ID
- ✅ Frontend modules list based on tier
- ✅ No cross-user data visible in any view
- ✅ Admin can see users but not other admins' data

---

## Migration Path

1. **Enable on user entity**: Add `subscription_tier` and `demo_brand` fields
2. **Seed test users**:
   - 333cnrbl6@gmail.com (role=admin for now, system treats as developer)
   - test-starter@example.com (tier=starter)
   - test-pro@example.com (tier=professional)
3. **Test each tier**: Verify modules appear/disappear correctly
4. **Audit backend**: Ensure all queries filter by current user ID
5. **Enable in routes**: Wrap sales/dev pages with developer check

---

## Future Enhancements

- API key management per user
- Audit logs for data access
- Usage analytics by tier (queries, API calls)
- Team member invitations with role presets
- SSO integration for enterprises