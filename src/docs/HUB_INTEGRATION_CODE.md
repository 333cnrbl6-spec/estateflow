# Hub Integration — Copy & Paste Code

## 1. Add Route to App.jsx

**Add this import at the top:**
```javascript
import SynergyFlowDocs from './pages/SynergyFlowDocs';
```

**Add this route in the Routes section (inside AuthenticatedApp or wherever appropriate):**
```jsx
<Route path="/synergy-docs" element={<SynergyFlowDocs />} />
```

**Full example:**
```jsx
// In App.jsx, inside <Routes>
<Route element={<LightThemeLayout />}>
  {/* ... existing routes ... */}
  
  {/* Synergy Flow Hub */}
  <Route path="/synergy-docs" element={<SynergyFlowDocs />} />
  
  {/* ... more routes ... */}
</Route>
```

---

## 2. Add to Navigation (Optional)

**In your sidebar or nav component, add a link:**
```jsx
import { Book } from 'lucide-react';

// In your navigation menu/sidebar
<Link to="/synergy-docs" className="flex items-center gap-2 px-3 py-2">
  <Book className="w-4 h-4" />
  <span>Integration Docs</span>
</Link>
```

---

## 3. Create Subscription Entity (For Hub)

**Copy this to `entities/Subscription.json`:**
```json
{
  "name": "Subscription",
  "type": "object",
  "properties": {
    "user_email": {
      "type": "string",
      "description": "User email (links to User entity)"
    },
    "organization_name": {
      "type": "string",
      "description": "Organization/business name"
    },
    "subscription_tier": {
      "type": "string",
      "enum": ["starter", "professional", "enterprise"],
      "default": "starter",
      "description": "Subscription level"
    },
    "apps_included": {
      "type": "array",
      "items": { "type": "string" },
      "description": "Apps included in subscription (e.g., ['premiso', 'synergy_flow'])"
    },
    "active_until": {
      "type": "string",
      "format": "date",
      "description": "Subscription expiry date"
    },
    "stripe_customer_id": {
      "type": "string",
      "description": "Stripe customer ID for billing"
    },
    "status": {
      "type": "string",
      "enum": ["active", "trial", "cancelled"],
      "default": "active",
      "description": "Current subscription status"
    }
  },
  "required": ["user_email", "organization_name", "subscription_tier", "apps_included"]
}
```

---

## 4. Create SubscriptionContext (Shared Across Apps)

**Copy this to `lib/SubscriptionContext.jsx`:**
```jsx
import React from 'react';
import { base44 } from '@/api/base44Client';

const SubscriptionContext = React.createContext(null);

export const SubscriptionProvider = ({ children }) => {
  const [user, setUser] = React.useState(null);
  const [subscription, setSubscription] = React.useState(null);
  const [entitlements, setEntitlements] = React.useState({});
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const initializeContext = async () => {
      try {
        // Get authenticated user
        const currentUser = await base44.auth.me();
        setUser(currentUser);

        // Fetch subscription
        const subs = await base44.entities.Subscription.filter({
          user_email: currentUser.email
        });

        if (subs.length > 0) {
          const sub = subs[0];
          setSubscription(sub);
          
          // Build entitlements object
          const appEntitlements = {};
          (sub.apps_included || []).forEach(app => {
            appEntitlements[app] = true;
          });
          setEntitlements(appEntitlements);
        }
      } catch (error) {
        console.error('Failed to initialize subscription context:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeContext();
  }, []);

  return (
    <SubscriptionContext.Provider value={{ user, subscription, entitlements, loading }}>
      {children}
    </SubscriptionContext.Provider>
  );
};

export const useSubscription = () => {
  const context = React.useContext(SubscriptionContext);
  if (!context) {
    throw new Error('useSubscription must be used within SubscriptionProvider');
  }
  return context;
};
```

---

## 5. Wrap App with SubscriptionProvider

**In App.jsx, wrap your app:**
```jsx
import { SubscriptionProvider } from '@/lib/SubscriptionContext';

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <SubscriptionProvider>
          <BrandingProvider>
            <ThemeWrapper>
              <QueryClientProvider client={queryClientInstance}>
                <RoleProvider>
                  <RBMBrandingProvider>
                    <Router>
                      {/* Your routes */}
                    </Router>
                    {/* ... rest of app ... */}
                  </RBMBrandingProvider>
                </RoleProvider>
              </QueryClientProvider>
            </ThemeWrapper>
          </BrandingProvider>
        </SubscriptionProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}
```

---

## 6. Create License Gating Component (Optional)

**Copy to `components/ProtectedAppRoute.jsx`:**
```jsx
import React from 'react';
import { useSubscription } from '@/lib/SubscriptionContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Lock } from 'lucide-react';

export const ProtectedAppRoute = ({ appName, element }) => {
  const { entitlements, loading } = useSubscription();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-muted border-t-primary rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-muted-foreground">Loading subscription...</p>
        </div>
      </div>
    );
  }

  if (!entitlements[appName]) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background p-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <Lock className="w-8 h-8 mx-auto mb-4 text-muted-foreground" />
            <CardTitle>App Not Included</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground text-center">
              Your subscription doesn't include <strong>{appName}</strong>. Upgrade to access this app.
            </p>
            <Button asChild className="w-full">
              <Link to="/account">Upgrade Plan</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return element;
};
```

---

## 7. Use in Routes

```jsx
import { ProtectedAppRoute } from '@/components/ProtectedAppRoute';
import PremisoDashboard from './pages/Dashboard'; // Premiso main page
import SynergyFlowDashboard from './pages/SynergyFlow'; // Future app

// In Routes:
<Route
  path="/premiso/*"
  element={<ProtectedAppRoute appName="premiso" element={<PremisoDashboard />} />}
/>
<Route
  path="/synergy-flow/*"
  element={<ProtectedAppRoute appName="synergy_flow" element={<SynergyFlowDashboard />} />}
/>
```

---

## 8. Backend Function — Cross-App Query (Example)

**Copy to `functions/queryCrossApp.js`:**
```javascript
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { entityName, filter } = await req.json();

    // Query any entity via service role (cross-app)
    const results = await base44.asServiceRole.entities[entityName].filter(filter);

    return Response.json({ data: results });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});
```

**Call from frontend:**
```jsx
const results = await base44.functions.invoke('queryCrossApp', {
  entityName: 'Property',
  filter: { region: 'london' }
});
```

---

## Summary

**Copy-paste order:**
1. ✅ Create `entities/Subscription.json`
2. ✅ Create `lib/SubscriptionContext.jsx`
3. ✅ Create `components/ProtectedAppRoute.jsx`
4. ✅ Create `functions/queryCrossApp.js`
5. ✅ Create `pages/SynergyFlowDocs.jsx` (already created)
6. ✅ Update `App.jsx` (import SubscriptionProvider, add route)
7. ✅ Add docs link to nav/sidebar (optional)

**Now you have:**
- ✅ Shared authentication context
- ✅ License gating per app
- ✅ Cross-app entity queries
- ✅ Integration documentation page
- ✅ Foundation for Synergy Flow + future apps