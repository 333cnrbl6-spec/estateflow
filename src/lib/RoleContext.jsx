import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { ROLES, ROLE_FEATURES, canAccessRoute, hasFeatureAccess, getDataAccess } from './roleConfig';

const RoleContext = createContext();

/**
 * Unified Role Management Context
 * - Manages both demo mode and authenticated user roles
 * - Always validates backend permissions; frontend is UI-only
 * - Supports role hierarchies (admin > subscriber > viewer)
 */
export function RoleProvider({ children }) {
  const [currentRole, setCurrentRole] = useState(ROLES.SUBSCRIBER);
  const [demoMode, setDemoMode] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [permissions, setPermissions] = useState({});
  const [loading, setLoading] = useState(true);

  // Load authenticated user's actual role on mount
  useEffect(() => {
    const loadUserRole = async () => {
      try {
        const user = await base44.auth.me();
        if (user) {
          setCurrentRole(user.role || ROLES.SUBSCRIBER);
          setUserRole(user);
          // Backend validates all actual permissions
          setPermissions(getDefaultPermissions(user.role));
        }
      } catch (e) {
        // Not authenticated, use default
        setCurrentRole(ROLES.SUBSCRIBER);
      } finally {
        setLoading(false);
      }
    };
    loadUserRole();
  }, []);

  const switchRole = useCallback((newRole) => {
    // CRITICAL: Only allow role switching in DEMO mode—never persist to localStorage
    if (Object.values(ROLES).includes(newRole)) {
      setCurrentRole(newRole);
      setDemoMode(true);
      localStorage.removeItem('demo_role');
      localStorage.removeItem('user_role');
      console.warn('[RoleContext] Role switched for demo only—backend validates actual role on page reload');
    }
  }, []);

  const resetRole = useCallback(() => {
    setCurrentRole(ROLES.SUBSCRIBER);
    setDemoMode(false);
    localStorage.removeItem('demo_role');
    localStorage.removeItem('user_role');
  }, []);

  const canAccess = useCallback((routePath) => {
    return canAccessRoute(currentRole, routePath);
  }, [currentRole]);

  const hasFeature = useCallback((feature) => {
    return hasFeatureAccess(currentRole, feature);
  }, [currentRole]);

  const getDataLevel = useCallback((dataType) => {
    return getDataAccess(currentRole, dataType);
  }, [currentRole]);

  const value = {
    // Current role state
    currentRole,
    userRole,
    permissions,
    loading,
    demoMode,
    isAdmin: currentRole === ROLES.ADMIN,
    isSales: currentRole === ROLES.SALES,
    isSubscriber: currentRole === ROLES.SUBSCRIBER,

    // Role switching (demo only)
    switchRole,
    resetRole,

    // Permission checks (UI hints only—backend validates)
    canAccess,
    hasFeature,
    getDataLevel,
  };

  return (
    <RoleContext.Provider value={value}>
      {children}
    </RoleContext.Provider>
  );
}

export function useRole() {
  const context = useContext(RoleContext);
  if (!context) {
    throw new Error('useRole must be used within a RoleProvider');
  }
  return context;
}

/**
 * Get default permissions for a role
 */
function getDefaultPermissions(role) {
  const perms = ROLE_FEATURES[role] || {};
  return {
    ...perms,
    // Ensure backend validates all sensitive operations
    canManageRoles: role === ROLES.ADMIN,
    canManageUsers: role === ROLES.ADMIN,
    canAccessAuditLogs: role === ROLES.ADMIN,
  };
}