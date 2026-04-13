import React, { createContext, useContext, useEffect, useState } from "react";
import { getCurrentUserRole, hasPermission, hasFeatureAccess, hasPageAccess } from "@/lib/userTypeManager";

const UserRoleContext = createContext(null);

export function UserRoleProvider({ children }) {
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserRole();
  }, []);

  const loadUserRole = async () => {
    try {
      const role = await getCurrentUserRole();
      setUserRole(role);
    } catch (error) {
      console.error("Error loading user role:", error);
    } finally {
      setLoading(false);
    }
  };

  const value = {
    userRole,
    loading,
    hasPermission: async (entity, action) => {
      if (!userRole) return false;
      return hasPermission(entity, action);
    },
    hasFeatureAccess: async (feature) => {
      if (!userRole) return false;
      return hasFeatureAccess(feature);
    },
    hasPageAccess: async (page) => {
      if (!userRole) return true;
      return hasPageAccess(page);
    },
    refreshUserRole: loadUserRole
  };

  return (
    <UserRoleContext.Provider value={value}>
      {children}
    </UserRoleContext.Provider>
  );
}

export function useUserRole() {
  const context = useContext(UserRoleContext);
  if (!context) {
    throw new Error("useUserRole must be used within UserRoleProvider");
  }
  return context;
}

/**
 * Component wrapper for permission-based rendering
 */
export function PermissionGate({ entity, action, children, fallback = null }) {
  const { hasPermission } = useUserRole();
  const [allowed, setAllowed] = useState(null);

  useEffect(() => {
    hasPermission(entity, action).then(setAllowed);
  }, [entity, action]);

  if (allowed === null) return null;
  return allowed ? children : fallback;
}

/**
 * Component wrapper for feature-based rendering
 */
export function FeatureGate({ feature, children, fallback = null }) {
  const { hasFeatureAccess } = useUserRole();
  const [allowed, setAllowed] = useState(null);

  useEffect(() => {
    hasFeatureAccess(feature).then(setAllowed);
  }, [feature]);

  if (allowed === null) return null;
  return allowed ? children : fallback;
}

/**
 * Component wrapper for page access
 */
export function PageGate({ page, children, fallback = null }) {
  const { hasPageAccess } = useUserRole();
  const [allowed, setAllowed] = useState(null);

  useEffect(() => {
    hasPageAccess(page).then(setAllowed);
  }, [page]);

  if (allowed === null) return null;
  return allowed ? children : fallback;
}

/**
 * Hook for checking permissions in components
 */
export function usePermissions() {
  const { userRole, hasPermission, hasFeatureAccess, hasPageAccess } = useUserRole();

  return {
    user: userRole?.user,
    userType: userRole?.user_type,
    permissions: userRole?.permissions,
    dataScope: userRole?.data_scope,
    hasPermission,
    hasFeatureAccess,
    hasPageAccess,
    canEditEntity: (entity) => hasPermission(entity, 'update'),
    canCreateEntity: (entity) => hasPermission(entity, 'create'),
    canDeleteEntity: (entity) => hasPermission(entity, 'delete'),
    canViewEntity: (entity) => hasPermission(entity, 'read')
  };
}

export default {
  UserRoleProvider,
  useUserRole,
  PermissionGate,
  FeatureGate,
  PageGate,
  usePermissions
};