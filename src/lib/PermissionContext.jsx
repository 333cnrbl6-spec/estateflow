import React, { createContext, useState, useEffect, useContext } from 'react';
import { base44 } from '@/api/base44Client';
import {
  hasTierAccess,
  canAccessFeature,
  hasCapability,
  getTierLimits,
  TIER_META,
} from '@/lib/tierConfig';

export const PermissionContext = createContext();

// Developer / internal email — always gets full access regardless of tier.
const DEVELOPER_EMAILS = ['333cnrbl6@gmail.com'];

export function PermissionProvider({ children }) {
  const [permissions, setPermissions] = useState({ loading: true });

  useEffect(() => {
    loadPermissions();
  }, []);

  const loadPermissions = async () => {
    try {
      const user = await base44.auth.me();
      if (!user) {
        setPermissions({ loading: false, authenticated: false });
        return;
      }

      const isDeveloper = DEVELOPER_EMAILS.includes(user.email);
      const platformRole = user.role || 'user'; // 'admin' | 'user'
      const isAdmin = platformRole === 'admin' || isDeveloper;
      const tier = user.subscription_tier || 'starter';
      const tierMeta = TIER_META[tier] || TIER_META.starter;
      const limits = getTierLimits(tier);

      setPermissions({
        loading: false,
        authenticated: true,
        userId: user.id,
        email: user.email,
        fullName: user.full_name,
        platformRole,      // 'admin' | 'user'
        isDeveloper,
        isAdmin,

        // Subscription
        tier,              // 'starter' | 'professional' | 'enterprise'
        tierName: tierMeta.name,
        subscriptionStatus: user.subscription_status || 'trial',
        isSubscribed: user.is_subscribed || false,
        isTrial: (user.subscription_status || 'trial') === 'trial',

        // Limits
        limits,
        propertiesUsed: user.properties_used || 0,

        // Capability helpers (true/false)
        canAccessSales:       isAdmin || tier !== 'starter',  // Professional+ can see sales module
        canAccessMarketing:   isAdmin,
        canAccessAdmin:       isAdmin,
        canManageTeam:        isAdmin || hasTierAccess(tier, 'enterprise'),
        canAccessReporting:   isAdmin || hasTierAccess(tier, 'professional'),
        canAccessBlockMgmt:   isAdmin || hasTierAccess(tier, 'professional'),
        canAccessAccounting:  isAdmin || hasTierAccess(tier, 'professional'),
        canAccessOutOfHours:  isAdmin || hasTierAccess(tier, 'enterprise'),
        canAccessAPI:         isAdmin || hasTierAccess(tier, 'enterprise'),
        canAccessWhiteLabel:  isAdmin || hasTierAccess(tier, 'enterprise'),
        canAccessCompliance:  isAdmin || hasTierAccess(tier, 'professional'),
        canUsePredictiveMaint:isAdmin || hasTierAccess(tier, 'professional'),
        canUseAIDraft:        isAdmin || hasTierAccess(tier, 'professional'),
        canExportPDF:         isAdmin || hasTierAccess(tier, 'professional'),

        // Raw check helpers
        hasTierAccess:   (required) => isAdmin || hasTierAccess(tier, required),
        canAccessFeature:(featureKey) => isAdmin || canAccessFeature(tier, featureKey, platformRole),
        hasCapability:   (cap) => isAdmin || hasCapability(tier, cap, platformRole),
      });
    } catch (err) {
      console.error('Failed to load permissions:', err);
      setPermissions({ loading: false, authenticated: false });
    }
  };

  return (
    <PermissionContext.Provider value={{ ...permissions, reloadPermissions: loadPermissions }}>
      {children}
    </PermissionContext.Provider>
  );
}

export function usePermissions() {
  const ctx = useContext(PermissionContext);
  if (!ctx) throw new Error('usePermissions must be used within PermissionProvider');
  return ctx;
}