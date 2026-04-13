// Granular Role-Based Access Control Configuration
// Defines what each persona can see and do

export const ROLES = {
  SALES: 'sales',
  ADMIN: 'admin',
  SUBSCRIBER: 'subscriber',
};

export const ROLE_LABELS = {
  sales: 'Sales Staff',
  admin: 'Administrator',
  subscriber: 'Subscriber',
};

export const ROLE_PERMISSIONS = {
  sales: {
    // Sales personas can access prospect research and demo tools
    features: [
      'sales-dashboard',
      'sales-brochure',
      'sales-one-pager',
      'sales-targeted-demo-builder',
      'sales-demo-setup',
      'demo-station',
      'market-reports',
      'expansion-opportunities',
      'agent-performance',
    ],
    // Sales can view but not edit subscriber data
    dataAccess: {
      properties: 'read',
      tenants: 'read',
      financials: 'read',
      compliance: 'read',
    },
    // Cannot access admin features
    adminTools: false,
    // Can create and manage demos
    demoManagement: true,
    // Cannot see subscriber-only pages
    subscriberPages: false,
  },

  admin: {
    // Admins see everything
    features: [
      // All pages accessible
    ],
    dataAccess: {
      properties: 'write',
      tenants: 'write',
      financials: 'write',
      compliance: 'write',
      users: 'write',
      settings: 'write',
    },
    // Full admin access
    adminTools: true,
    demoManagement: true,
    subscriberPages: true,
    // Admin can switch to other roles for testing
    canSwitchRoles: true,
  },

  subscriber: {
    // Subscribers only see their own portfolio & management tools
    features: [
      'properties',
      'units',
      'tenants',
      'financials',
      'maintenance',
      'contacts',
      'compliance',
      'rent-ledger',
      'service-charges',
      'ground-rent',
      'banking',
      'expenses',
      'crm',
      'pipeline',
      'workflows',
      'document-repository',
      'reporting',
      'settings',
      'intelligent-onboarding', // For new subscribers
    ],
    // Subscribers have full access to their own data
    dataAccess: {
      properties: 'write',
      tenants: 'write',
      financials: 'write',
      compliance: 'write',
      settings: 'write',
    },
    // No admin tools
    adminTools: false,
    // No demo management
    demoManagement: false,
    // No sales pages
    subscriberPages: true,
  },
};

// Menu/Navigation visibility by role
export const VISIBLE_NAV_ITEMS = {
  sales: [
    { label: 'Sales Dashboard', path: '/sales', icon: 'TrendingUp' },
    { label: 'Demo Builder', path: '/sales-targeted-demo-builder', icon: 'Sparkles' },
    { label: 'Demo Station', path: '/demo-station', icon: 'PlayCircle' },
    { label: 'Brochure', path: '/sales-brochure', icon: 'FileText' },
    { label: 'Market Reports', path: '/market-reports', icon: 'BarChart3' },
  ],

  admin: [
    // All nav items visible
  ],

  subscriber: [
    { label: 'Dashboard', path: '/', icon: 'Home' },
    { label: 'Properties', path: '/properties', icon: 'Building2' },
    { label: 'Tenants', path: '/tenants', icon: 'Users' },
    { label: 'Financials', path: '/financials', icon: 'BarChart3' },
    { label: 'Maintenance', path: '/maintenance', icon: 'Wrench' },
    { label: 'Compliance', path: '/compliance', icon: 'Shield' },
    { label: 'Reporting', path: '/reporting', icon: 'FileText' },
    { label: 'Settings', path: '/settings', icon: 'Settings' },
  ],
};

// Feature flags by role
export const ROLE_FEATURES = {
  sales: {
    canCreateDemos: true,
    canAccessProspects: true,
    canViewDemoData: true,
    canDownloadMaterials: true,
    canTrackDemos: true,
    canAccessAnalytics: true,
    canCreateCustomReports: false,
    canManageUsers: false,
    canConfigureIntegrations: false,
  },

  admin: {
    canCreateDemos: true,
    canAccessProspects: true,
    canViewDemoData: true,
    canDownloadMaterials: true,
    canTrackDemos: true,
    canAccessAnalytics: true,
    canCreateCustomReports: true,
    canManageUsers: true,
    canConfigureIntegrations: true,
    canSwitchRoles: true,
    canAccessAuditLogs: true,
    canManageCompliance: true,
  },

  subscriber: {
    canCreateDemos: false,
    canAccessProspects: false,
    canViewDemoData: false,
    canDownloadMaterials: false,
    canTrackDemos: false,
    canAccessAnalytics: true,
    canCreateCustomReports: true,
    canManageUsers: true, // Can manage their own team
    canConfigureIntegrations: true,
    canAccessAuditLogs: true,
    canManageCompliance: true,
  },
};

// Default role for demo/testing purposes
export const DEFAULT_DEMO_ROLE = ROLES.SUBSCRIBER;

// Check if user has permission for a feature
export function hasFeatureAccess(role, feature) {
  if (!role || !ROLE_FEATURES[role]) return false;
  return ROLE_FEATURES[role][feature] === true;
}

// Check if user can access a route
export function canAccessRoute(role, routePath) {
  if (!role || !ROLE_PERMISSIONS[role]) return false;

  const permissions = ROLE_PERMISSIONS[role];

  // Admins can access everything
  if (role === ROLES.ADMIN) return true;

  // Check if route is in allowed features
  const routeKey = routePath.replace(/^\//, '').split('/')[0];
  if (permissions.features.length === 0) return true; // No restrictions
  return permissions.features.includes(routeKey);
}

// Get data access level for a role
export function getDataAccess(role, dataType) {
  if (!role || !ROLE_PERMISSIONS[role]) return null;
  return ROLE_PERMISSIONS[role].dataAccess?.[dataType] || null;
}