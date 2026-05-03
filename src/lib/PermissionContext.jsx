import React, { createContext, useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';

export const PermissionContext = createContext();

export function PermissionProvider({ children }) {
  const [permissions, setPermissions] = useState({
    role: 'user', // 'admin', 'developer', 'user'
    tier: 'starter', // 'starter', 'professional', 'enterprise'
    modules: [],
    canAccessSales: false,
    canAccessMarketing: false,
    canAccessAdmin: false,
    canManageTeam: false,
    canAccessReporting: false,
    loading: true
  });

  const DEVELOPER_EMAIL = '333cnrbl6@gmail.com';

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

      // Determine actual role
      const actualRole = isDeveloper ? 'developer' : roleFromUser;

      // Tier from user subscription (stored on user entity)
      const tier = user.subscription_tier || 'starter';

      // Base modules by tier
      const baseModules = {
        'starter': ['properties', 'units', 'tenants', 'maintenance', 'financials'],
        'professional': ['properties', 'units', 'tenants', 'maintenance', 'financials', 'compliance', 'reporting', 'crm'],
        'enterprise': ['properties', 'units', 'tenants', 'maintenance', 'financials', 'compliance', 'reporting', 'crm', 'workflows', 'integrations']
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