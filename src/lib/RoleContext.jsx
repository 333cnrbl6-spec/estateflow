import React, { createContext, useContext, useState, useCallback } from 'react';
import { ROLES, ROLE_FEATURES, canAccessRoute, hasFeatureAccess, getDataAccess } from './roleConfig';

const RoleContext = createContext();

export function RoleProvider({ children }) {
  const [currentRole, setCurrentRole] = useState(ROLES.SUBSCRIBER);
  const [demoMode, setDemoMode] = useState(false); // Indicates if using demo/test role

  const switchRole = useCallback((newRole) => {
    if (Object.values(ROLES).includes(newRole)) {
      setCurrentRole(newRole);
      setDemoMode(true); // Switching roles puts us in demo mode
      localStorage.setItem('demo_role', newRole);
    }
  }, []);

  const resetRole = useCallback(() => {
    setCurrentRole(ROLES.SUBSCRIBER);
    setDemoMode(false);
    localStorage.removeItem('demo_role');
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
    // Helper to check if role is admin
    isAdmin: currentRole === ROLES.ADMIN,
    isSales: currentRole === ROLES.SALES,
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