import { useRole } from '@/lib/RoleContext';

/**
 * Hook to conditionally render UI based on role permissions
 * Usage: const { canSee, canEdit, hasFeature } = useRoleAccess();
 */
export function useRoleAccess() {
  const { currentRole, hasFeature, getDataLevel, isAdmin, isSales, isSubscriber } = useRole();

  return {
    // Current role info
    currentRole,
    isAdmin,
    isSales,
    isSubscriber,

    // Check specific features
    hasFeature,

    // Check data access level for CRUD operations
    canRead: (dataType) => {
      const level = getDataLevel(dataType);
      return level === 'read' || level === 'write';
    },
    canWrite: (dataType) => {
      return getDataLevel(dataType) === 'write';
    },

    // Shortcut helpers for common checks
    canViewDemos: hasFeature('canViewDemoData'),
    canCreateDemos: hasFeature('canCreateDemos'),
    canManageUsers: hasFeature('canManageUsers'),
    canAccessAnalytics: hasFeature('canAccessAnalytics'),
    canConfigureIntegrations: hasFeature('canConfigureIntegrations'),
  };
}

/**
 * Component wrapper to conditionally render based on feature access
 */
export function RoleGate({ feature, children, fallback = null }) {
  const { hasFeature } = useRoleAccess();

  if (!hasFeature(feature)) {
    return fallback;
  }

  return children;
}