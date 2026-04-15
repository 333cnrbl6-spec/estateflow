import React, { createContext, useContext, useState, useCallback } from 'react';
import { ROLES, ROLE_FEATURES, canAccessRoute, hasFeatureAccess, getDataAccess } from './roleConfig';

const RoleContext = createContext();

export function RoleProvider({ children }) {
  const [currentRole, setCurrentRole] = useState(ROLES.SUBSCRIBER);
  const [demoMode, setDemoMode] = useState(false); // Indicates if using demo/test role

  const switchRole = useCallback((newRole) => {
    // CRITICAL: Only allow role switching in DEMO mode - never persist to localStorage
    // Frontend role is for UI only; backend must verify actual user role
    if (Object.values(ROLES).includes(newRole)) {
      setCurrentRole(newRole);
      setDemoMode(true); // Switching roles puts us in demo mode
      // NEVER store role in localStorage—it's user-editable and exploitable
      // Clear any persisted role to force backend auth on page reload
      localStorage.removeItem('demo_role');
      localStorage.removeItem('user_role');
      console.warn('[RoleContext] Role switched for demo only—backend auth required for actual operations');
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
    currentRole,
    switchRole,
    resetRole,
    demoMode,
    canAccess,
    hasFeature,
    getDataLevel,
    // CRITICAL: Frontend role is for UI ONLY—backend always validates actual user role
    // These should NEVER be used to gate sensitive operations
    isAdmin: currentRole === ROLES.ADMIN && demoMode, // Only in demo mode
    isSales: currentRole === ROLES.SALES && demoMode, // Only in demo mode
    isSubscriber: currentRole === ROLES.SUBSCRIBER,
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