# Multi-App Data Isolation & Permission Implementation Guide

**Copy this entire guide into your other apps to ensure consistent permission logic, data isolation, and branding.**

---

## 🔐 Core Principles

1. **No Data Bleed**: Users see ONLY their own subscription data, properties, and team
2. **Tier-Based Access**: Features unlock by subscription level, not hardcoded
3. **Brand Isolation**: Each app has its own branding context; no cross-app data in UI
4. **Developer Access**: Single privileged email (configurable) for sales/marketing/admin
5. **Frontend Enforcement**: Permissions checked before rendering sensitive components

---

## 📋 Step 1: Create Permission Context

Create `lib/PermissionContext.jsx` in your app:

```jsx
import React, { createContext, useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';

export const PermissionContext = createContext();

export function PermissionProvider({ children }) {
  const [permissions, setPermissions] = useState({
    role: 'user',
    tier: 'starter',
    modules: [],
    canAccessSales: false,
    canAccessMarketing: false,
    canAccessAdmin: false,
    canManageTeam: false,
    canAccessReporting: false,
    loading: true
  });

  // CONFIGURE THIS FOR YOUR APP
  const DEVELOPER_EMAIL = 'your-developer@yourdomain.com'; // Change to your developer email

  useEffect(() => {
    loadPermissions();
  }, []);

  const loadPermissions = async () => {
    try {
      const user = await base44.auth.me();
      if (!user) {
        setPermissions(prev => ({ ...prev, loading: false }));
        return;
      }

      const isDeveloper = user.email === DEVELOPER_EMAIL;
      const roleFromUser = user.role || 'user';
      const actualRole = isDeveloper ? 'developer' : roleFromUser;
      const tier = user.subscription_tier || 'starter';

      // CUSTOMIZE MODULES BY TIER FOR YOUR APP
      const baseModules = {
        'starter': ['dashboard', 'properties', 'tenants'],
        'professional': ['dashboard', 'properties', 'tenants', 'reporting', 'compliance'],
        'enterprise': ['dashboard', 'properties', 'tenants', 'reporting', 'compliance', 'api', 'integrations']
      };

      const modules = baseModules[tier] || baseModules.starter;

      setPermissions({
        role: actualRole,
        tier,
        modules,
        canAccessSales: isDeveloper || actualRole === 'admin',
        canAccessMarketing: isDeveloper || actualRole === 'admin',
        canAccessAdmin: isDeveloper || actualRole === 'admin',
        canManageTeam: actualRole === 'admin' || actualRole === 'developer',
        canAccessReporting: tier === 'professional' || tier === 'enterprise' || actualRole === 'admin',
        email: user.email,
        loading: false
      });
    } catch (err) {
      console.error('Failed to load permissions:', err);
      setPermissions(prev => ({ ...prev, loading: false }));
    }
  };

  return (
    <PermissionContext.Provider value={{ ...permissions, reloadPermissions: loadPermissions }}>
      {children}
    </PermissionContext.Provider>
  );
}

export function usePermissions() {
  const ctx = React.useContext(PermissionContext);
  if (!ctx) throw new Error('usePermissions must be used within PermissionProvider');
  return ctx;
}
```

---

## 🚪 Step 2: Create Permission Gate Component

Create `components/PermissionGate.jsx`:

```jsx
import React from 'react';
import { usePermissions } from '@/lib/PermissionContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Lock } from 'lucide-react';

export default function PermissionGate({ 
  children, 
  requiredRole = null,
  requiredTier = null,
  requiredModule = null,
  fallback = null
}) {
  const permissions = usePermissions();

  if (permissions.loading) {
    return <div className="flex items-center justify-center p-8">Loading access...</div>;
  }

  if (requiredRole && permissions.role !== requiredRole && permissions.role !== 'developer') {
    return fallback || <LockedFeature reason={`Requires ${requiredRole} access`} />;
  }

  const tierHierarchy = { 'starter': 0, 'professional': 1, 'enterprise': 2 };
  if (requiredTier && tierHierarchy[permissions.tier] < tierHierarchy[requiredTier]) {
    return fallback || <LockedFeature reason={`Requires ${requiredTier} subscription`} />;
  }

  if (requiredModule && !permissions.modules.includes(requiredModule)) {
    return fallback || <LockedFeature reason={`Module not available in your plan`} />;
  }

  return children;
}

function LockedFeature({ reason }) {
  return (
    <Card className="border-amber-200 bg-amber-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-amber-900">
          <Lock className="w-5 h-5" />
          Feature Unavailable
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-amber-800">{reason}</p>
      </CardContent>
    </Card>
  );
}
```

---

## 🎯 Step 3: Wrap App with PermissionProvider

Update `App.jsx`:

```jsx
import { PermissionProvider } from '@/lib/PermissionContext';

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <BrandingProvider>
          <ThemeWrapper>
            <QueryClientProvider client={queryClientInstance}>
              <RoleProvider>
                <PermissionProvider>  {/* ADD THIS */}
                  <YourBrandingProvider>
                    <ErrorBoundaryWrapper>
                      <Router>
                        {/* Your routes */}
                      </Router>
                    </ErrorBoundaryWrapper>
                  </YourBrandingProvider>
                </PermissionProvider>
              </RoleProvider>
            </QueryClientProvider>
          </ThemeWrapper>
        </BrandingProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}
```

---

## 📊 Step 4: Create User Subscription Dashboard

Create `pages/SubscriberView.jsx` (only shows CURRENT user's data):

```jsx
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { usePermissions } from '@/lib/PermissionContext';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Lock } from 'lucide-react';

export default function SubscriberView() {
  const { tier, modules, email } = usePermissions();
  const [data, setData] = useState(null);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    // BACKEND REQUIREMENT:
    // This function MUST only return data for the authenticated user
    // NEVER expose other users' data via this endpoint
    try {
      // const response = await base44.functions.invoke('loadCurrentUserSubscription', {});
      // setData(response.data);
      setData({
        tier,
        email,
        properties: 5, // LOAD FROM BACKEND - user's count only
        users: 2,      // LOAD FROM BACKEND - their team count only
      });
    } catch (err) {
      console.error('Failed to load subscription:', err);
    }
  };

  const allModules = {
    'dashboard': 'Dashboard',
    'properties': 'Property Management',
    'tenants': 'Tenant Management',
    'reporting': 'Advanced Reporting',
    'compliance': 'Compliance',
    'api': 'API Access',
    'integrations': 'Integrations'
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Your Subscription</h1>
          <p className="text-slate-600 mt-2">Account: {email}</p>
        </div>

        <Card className="border-2 border-primary">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl capitalize">{tier} Plan</CardTitle>
              <Badge>Active</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {data && (
              <>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="bg-blue-50 rounded-lg p-4">
                    <p className="text-sm text-blue-600 font-semibold">Properties</p>
                    <p className="text-2xl font-bold text-blue-900">{data.properties}</p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-4">
                    <p className="text-sm text-green-600 font-semibold">Team Members</p>
                    <p className="text-2xl font-bold text-green-900">{data.users}</p>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-slate-900 mb-3">Your Modules</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    {Object.entries(allModules).map(([key, label]) => (
                      <div 
                        key={key}
                        className={`flex items-center gap-3 p-3 rounded-lg border ${
                          modules.includes(key) 
                            ? 'bg-green-50 border-green-200' 
                            : 'bg-gray-50 border-gray-200'
                        }`}
                      >
                        {modules.includes(key) ? (
                          <CheckCircle2 className="w-5 h-5 text-green-600" />
                        ) : (
                          <Lock className="w-5 h-5 text-gray-400" />
                        )}
                        <span className={modules.includes(key) ? 'text-slate-900' : 'text-slate-500'}>
                          {label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
```

---

## 🔑 Step 5: Create Developer Access Portal

Create `pages/DeveloperPortal.jsx` (email-gated):

```jsx
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { usePermissions } from '@/lib/PermissionContext';
import { AlertCircle } from 'lucide-react';

export default function DeveloperPortal() {
  const permissions = usePermissions();
  const DEVELOPER_EMAIL = 'your-developer@yourdomain.com'; // MUST MATCH PermissionContext
  const isDeveloper = permissions.email === DEVELOPER_EMAIL;

  if (!isDeveloper) {
    return (
      <div className="min-h-screen bg-red-50 p-6 flex items-center justify-center">
        <Card className="max-w-md border-red-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-900">
              <AlertCircle className="w-6 h-6" />
              Access Denied
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-red-800">
              This portal is restricted to authorized developers only.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Developer-only tools here
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 p-6">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-slate-900">Developer Portal</h1>
        
        <Card className="mt-8 border-2 border-indigo-200">
          <CardHeader>
            <CardTitle>Admin & Sales Tools</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-700">Add your app-specific developer tools here:</p>
            <ul className="mt-4 space-y-2">
              <li>• Sales materials management</li>
              <li>• Marketing asset generation</li>
              <li>• Demo data seeding</li>
              <li>• System configuration</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
```

---

## 🎨 Step 6: Enforce Brand Isolation

**CRITICAL**: Audit every UI page for hardcoded company data:

```jsx
// ❌ WRONG - Contains previous build data
<div>
  <h1>RBM Platform</h1>
  <p>01204 695919 · info@rbm-nw.co.uk</p>
</div>

// ✅ CORRECT - Generic or dynamically branded
<div>
  <h1>Your App Name</h1>
  <p>Use email/contact from branding context only</p>
</div>
```

**Search your codebase for:**
- Hardcoded phone numbers
- Hardcoded company names
- Hardcoded email addresses
- Hardcoded contact info
- Previous build company references

Replace with:
1. `useBranding()` hook to get app-specific branding
2. Generic placeholder text
3. Environment variables (`import.meta.env.VITE_*`)

---

## 🚀 Step 7: Use PermissionGate in Routes & Components

```jsx
// Route-level gating
<Route 
  path="/reporting" 
  element={
    <PermissionGate requiredTier="professional">
      <ReportingDashboard />
    </PermissionGate>
  } 
/>

// Component-level gating
<PermissionGate requiredModule="api">
  <APIDocumentation />
</PermissionGate>

// With fallback UI
<PermissionGate requiredTier="enterprise" fallback={<UpgradePrompt />}>
  <AdvancedFeature />
</PermissionGate>
```

---

## ✅ Data Isolation Checklist

- [ ] Backend: `loadCurrentUserSubscription()` filters by `base44.auth.me().id`
- [ ] Frontend: All data endpoints use current user context
- [ ] UI: No hardcoded company names, emails, phone numbers from previous builds
- [ ] Branding: App-specific logo, colors, tagline only
- [ ] Routes: `/subscription` shows only current user's data
- [ ] Routes: `/developer-portal` checks email, denies non-developers
- [ ] Components: PermissionGate wraps premium features
- [ ] Modules: Tier-gated (starter < professional < enterprise)
- [ ] Tests: Verify user A cannot see user B's data

---

## 📝 Backend Function Template

**Create a backend function that loads ONLY current user's data:**

```jsx
// functions/loadCurrentUserSubscription.js
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // CRITICAL: Filter by current user ID only
    const properties = await base44.entities.Property.filter(
      { created_by: user.email }, // or user.id depending on your schema
      '-updated_date',
      100
    );

    return Response.json({
      tier: user.subscription_tier || 'starter',
      email: user.email,
      properties: properties.length,
      users: user.team_members?.length || 1
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});
```

---

## 🔍 Common Mistakes to Avoid

❌ **Loading all users' data** — Only load authenticated user's data
❌ **Storing company name in UI** — Use branding context or environment variables
❌ **Skipping PermissionGate checks** — Gate EVERY premium feature
❌ **Showing RBM/previous build info** — Scrub all hardcoded references
❌ **Sharing subscription tier state globally** — Load per-user from auth
❌ **Trusting URL params for data** — Always verify with backend auth

---

## 🎯 Implementation Order

1. Create `PermissionContext.jsx` → Change `DEVELOPER_EMAIL` to YOUR developer email
2. Create `PermissionGate.jsx` → Copy as-is
3. Wrap App with `<PermissionProvider>`
4. Create `SubscriberView.jsx` → Add to `/subscription` route
5. Create `DeveloperPortal.jsx` → Add to `/developer-portal` route
6. Audit ALL pages for hardcoded company data → Replace with dynamic branding
7. Gate premium routes with `PermissionGate`
8. Test: Verify starter users can't access professional features
9. Test: Verify non-developer can't access `/developer-portal`
10. Test: Verify user A can't see user B's properties

---

## 📞 Support

If you encounter data bleed:
1. Check `DEVELOPER_EMAIL` matches your developer's email
2. Verify backend function filters by current user
3. Ensure PermissionGate is wrapping the component
4. Check browser console for permission errors
5. Test with different tier accounts

Good luck! 🚀