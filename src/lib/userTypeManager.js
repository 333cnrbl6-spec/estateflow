import { base44 } from "@/api/base44Client";

/**
 * User Type Management System
 * Provides intelligent, modular access control for different subscriber types
 */

export const USER_TYPES = {
  SUBSCRIBER: 'subscriber',
  SALES_PERSON: 'sales_person',
  DEVELOPER: 'developer',
  ADMIN: 'admin',
  VIEWER: 'viewer'
};

export const PERMISSION_LEVELS = {
  NONE: 'none',
  READ: 'read',
  WRITE: 'write',
  ADMIN: 'admin'
};

/**
 * Get current user's role and permissions
 */
export async function getCurrentUserRole() {
  try {
    const user = await base44.auth.me();
    if (!user) return null;

    const userRoles = await base44.entities.UserRole.filter({
      user_id: user.id,
      is_active: true
    });

    if (!userRoles || userRoles.length === 0) {
      // Fallback to basic role
      return {
        user,
        user_type: user.role || 'viewer',
        permissions: getDefaultPermissions(user.role || 'viewer'),
        data_scope: {}
      };
    }

    const userRole = userRoles[0];
    const userTypeConfig = await base44.entities.UserType.get(userRole.user_type_id);

    return {
      user,
      userRole,
      userType: userTypeConfig,
      user_type: userRole.user_type,
      permissions: mergePermissions(userTypeConfig?.permissions, userRole.permissions_override),
      data_scope: buildDataScope(userRole, userTypeConfig)
    };
  } catch (error) {
    console.error('Error getting user role:', error);
    return null;
  }
}

/**
 * Check if current user has permission for an action
 */
export async function hasPermission(entityName, action) {
  const userRole = await getCurrentUserRole();
  if (!userRole) return false;

  const entityPermissions = userRole.permissions?.entities?.[entityName];
  if (!entityPermissions) return false;

  return entityPermissions[action] === true;
}

/**
 * Check if user has access to a specific feature
 */
export async function hasFeatureAccess(featureName) {
  const userRole = await getCurrentUserRole();
  if (!userRole) return false;

  return userRole.permissions?.features?.[featureName] === true;
}

/**
 * Check if user can access a specific page
 */
export async function hasPageAccess(pagePath) {
  const userRole = await getCurrentUserRole();
  if (!userRole) return true; // Default to allowed if no config

  const pagePermissions = userRole.permissions?.pages;
  if (!pagePermissions) return true;

  return pagePermissions[pagePath] !== false;
}

/**
 * Get filtered data based on user's scope
 */
export async function getScopedData(entityName, baseQuery = {}) {
  const userRole = await getCurrentUserRole();
  if (!userRole) return baseQuery;

  const scope = userRole.data_scope;
  const scopedQuery = { ...baseQuery };

  // Apply company filter
  if (scope.company_filter && userRole.userRole?.company_id) {
    if (entityName === 'Property' || entityName === 'Unit' || entityName === 'Tenant') {
      scopedQuery.owning_company = userRole.userRole.company_id;
    } else if (entityName === 'Company') {
      scopedQuery.id = userRole.userRole.company_id;
    }
  }

  // Apply property filter
  if (scope.property_filter && userRole.userRole?.assigned_properties?.length > 0) {
    if (entityName === 'Unit') {
      scopedQuery.property_id = userRole.userRole.assigned_properties;
    } else if (entityName === 'Tenant') {
      scopedQuery.property_id = userRole.userRole.assigned_properties;
    }
  }

  // Apply region filter
  if (scope.region_filter && userRole.userRole?.assigned_regions?.length > 0) {
    if (entityName === 'Property') {
      scopedQuery.region = userRole.userRole.assigned_regions;
    }
  }

  // Apply custom scope
  if (scope.custom_scope) {
    Object.assign(scopedQuery, scope.custom_scope);
  }

  return scopedQuery;
}

/**
 * Get default permissions for each user type
 */
export function getDefaultPermissions(userType) {
  const defaults = {
    [USER_TYPES.ADMIN]: {
      entities: {
        all: { read: true, create: true, update: true, delete: true }
      },
      features: { all: true },
      pages: { all: true }
    },
    [USER_TYPES.SUBSCRIBER]: {
      entities: {
        Property: { read: true, create: true, update: true, delete: false },
        Unit: { read: true, create: true, update: true, delete: false },
        Tenant: { read: true, create: true, update: true, delete: false },
        Company: { read: true, create: false, update: true, delete: false },
        FinancialTransaction: { read: true, create: true, update: false, delete: false },
        MaintenanceOrder: { read: true, create: true, update: true, delete: false }
      },
      features: {
        property_management: true,
        tenant_management: true,
        financials: true,
        maintenance: true,
        compliance: true
      },
      pages: {
        '/properties': true,
        '/units': true,
        '/tenants': true,
        '/financials': true,
        '/maintenance': true,
        '/compliance': true
      }
    },
    [USER_TYPES.SALES_PERSON]: {
      entities: {
        SalesLead: { read: true, create: true, update: true, delete: false },
        SalesListing: { read: true, create: true, update: true, delete: false },
        ViewingAppointment: { read: true, create: true, update: true, delete: false },
        Offer: { read: true, create: true, update: true, delete: false },
        Contact: { read: true, create: true, update: true, delete: false },
        Property: { read: true, create: false, update: false, delete: false },
        Company: { read: true, create: false, update: false, delete: false }
      },
      features: {
        sales_pipeline: true,
        lead_management: true,
        viewings: true,
        offers: true,
        crm: true
      },
      pages: {
        '/sales': true,
        '/crm': true,
        '/viewings': true,
        '/properties': true,
        '/contacts': true
      }
    },
    [USER_TYPES.DEVELOPER]: {
      entities: {
        Property: { read: true, create: true, update: true, delete: true },
        Unit: { read: true, create: true, update: true, delete: true },
        Company: { read: true, create: true, update: true, delete: true },
        LandRegistry: { read: true, create: true, update: true, delete: true },
        BuildingSafety: { read: true, create: true, update: true, delete: true },
        RTMManagement: { read: true, create: true, update: true, delete: true }
      },
      features: {
        development_pipeline: true,
        land_acquisition: true,
        planning: true,
        construction: true,
        compliance: true
      },
      pages: {
        '/properties': true,
        '/land-registry': true,
        '/building-safety-register': true,
        '/rtm-management': true,
        '/development': true
      }
    },
    [USER_TYPES.VIEWER]: {
      entities: {
        all: { read: true, create: false, update: false, delete: false }
      },
      features: {
        view_only: true
      },
      pages: {
        '/dashboard': true
      }
    }
  };

  return defaults[userType] || defaults[USER_TYPES.VIEWER];
}

/**
 * Merge default permissions with overrides
 */
function mergePermissions(defaultPermissions, overrides) {
  if (!overrides) return defaultPermissions;

  const merged = { ...defaultPermissions };

  if (overrides.entities) {
    merged.entities = {
      ...merged.entities,
      ...overrides.entities
    };
  }

  if (overrides.features) {
    merged.features = {
      ...merged.features,
      ...overrides.features
    };
  }

  return merged;
}

/**
 * Build data scope configuration
 */
function buildDataScope(userRole, userTypeConfig) {
  return {
    company_filter: userTypeConfig?.data_scope?.company_filter || false,
    property_filter: userTypeConfig?.data_scope?.property_filter || false,
    region_filter: userTypeConfig?.data_scope?.region_filter || false,
    custom_scope: userTypeConfig?.data_scope?.custom_scope || null,
    assigned_properties: userRole?.assigned_properties || [],
    assigned_regions: userRole?.assigned_regions || [],
    company_id: userRole?.company_id || null
  };
}

/**
 * Get user type configuration by name
 */
export async function getUserTypeConfig(typeName) {
  const userTypes = await base44.entities.UserType.filter({
    type_name: typeName,
    enabled: true
  });
  
  return userTypes?.[0] || null;
}

/**
 * Create default user types for new subscribers
 */
export async function initializeDefaultUserTypes() {
  const defaultTypes = [
    {
      type_name: USER_TYPES.SUBSCRIBER,
      display_name: 'Property Manager',
      description: 'Full access to property management features',
      enabled: true,
      permissions: getDefaultPermissions(USER_TYPES.SUBSCRIBER),
      ui_config: {
        default_dashboard: '/dashboard',
        sidebar_groups: ['properties', 'tenants', 'financials', 'maintenance']
      },
      data_scope: {
        company_filter: true,
        property_filter: false
      }
    },
    {
      type_name: USER_TYPES.SALES_PERSON,
      display_name: 'Sales Agent',
      description: 'Access to sales and CRM features',
      enabled: true,
      permissions: getDefaultPermissions(USER_TYPES.SALES_PERSON),
      ui_config: {
        default_dashboard: '/sales',
        sidebar_groups: ['sales', 'crm', 'properties']
      },
      data_scope: {
        company_filter: true,
        region_filter: true
      }
    },
    {
      type_name: USER_TYPES.DEVELOPER,
      display_name: 'Developer',
      description: 'Access to development and land acquisition features',
      enabled: true,
      permissions: getDefaultPermissions(USER_TYPES.DEVELOPER),
      ui_config: {
        default_dashboard: '/properties',
        sidebar_groups: ['properties', 'development', 'compliance']
      },
      data_scope: {
        company_filter: true
      }
    }
  ];

  for (const userType of defaultTypes) {
    try {
      const existing = await getUserTypeConfig(userType.type_name);
      if (!existing) {
        await base44.entities.UserType.create(userType);
      }
    } catch (error) {
      console.error(`Error creating user type ${userType.type_name}:`, error);
    }
  }
}

export default {
  getCurrentUserRole,
  hasPermission,
  hasFeatureAccess,
  hasPageAccess,
  getScopedData,
  getDefaultPermissions,
  getUserTypeConfig,
  initializeDefaultUserTypes,
  USER_TYPES,
  PERMISSION_LEVELS
};