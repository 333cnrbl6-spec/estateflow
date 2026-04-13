# User Type Management System

## Overview
Premiso now supports modular, cross-functional user types with intelligent data scoping. This allows you to create custom roles for subscribers, sales people, and developers with granular permissions and automated data filtering.

## Architecture

### Core Entities

#### 1. **UserType** (`entities/UserType.json`)
Defines a user type configuration with:
- **Permissions**: Entity-level, feature-level, page-level access
- **UI Config**: Default dashboard, sidebar groups, hidden pages, branding
- **Data Scope**: Company, property, and region filters
- **Automation Rules**: Triggered actions for this user type

#### 2. **UserRole** (`entities/UserRole.json`)
Assigns users to types with:
- **User Reference**: Links to User entity
- **Company Assignment**: For data scoping
- **Property Assignments**: Specific properties user can access
- **Region Assignments**: Geographic access scope
- **Permission Overrides**: Custom overrides for individual users

### Permission System

**Three Permission Levels:**
1. **Entity Permissions**: CRUD operations on each entity type
2. **Feature Permissions**: Access to specific features (e.g., `sales_pipeline`, `maintenance`)
3. **Page Permissions**: Access to specific pages/routes

**Data Scoping:**
- **Company Filter**: Automatically filters data to user's company
- **Property Filter**: Limits access to assigned properties only
- **Region Filter**: Restricts to specific geographic regions
- **Custom Scope**: Advanced filtering with custom queries

## User Types

### 1. Subscriber (Property Manager)
**Purpose**: Full property management capabilities

**Permissions:**
- ✅ Properties: Read, Create, Update
- ✅ Units: Read, Create, Update
- ✅ Tenants: Read, Create, Update
- ✅ Financials: Read, Create
- ✅ Maintenance: Read, Create, Update
- ❌ Delete operations (restricted)

**Features:**
- Property management
- Tenant management
- Financial reporting
- Maintenance tracking
- Compliance monitoring

**Data Scope:**
- Company filter: ✅ (sees only their company's data)
- Property filter: ❌ (sees all company properties)

### 2. Sales Person (Sales Agent)
**Purpose**: Sales pipeline and CRM management

**Permissions:**
- ✅ Sales Leads: Full access
- ✅ Sales Listings: Full access
- ✅ Viewings: Full access
- ✅ Offers: Full access
- ✅ Contacts: Full access
- ⚠️ Properties: Read-only
- ⚠️ Companies: Read-only

**Features:**
- Sales pipeline
- Lead management
- Viewing scheduling
- Offer management
- CRM interactions

**Data Scope:**
- Company filter: ✅
- Region filter: ✅ (assigned regions only)

### 3. Developer
**Purpose**: Property development and land acquisition

**Permissions:**
- ✅ Properties: Full access (CRUD)
- ✅ Units: Full access (CRUD)
- ✅ Companies: Full access
- ✅ Land Registry: Full access
- ✅ Building Safety: Full access
- ✅ RTM Management: Full access

**Features:**
- Development pipeline
- Land acquisition
- Planning applications
- Construction tracking
- Compliance management

**Data Scope:**
- Company filter: ✅

### 4. Admin
**Purpose**: System administration

**Permissions:**
- ✅ All entities: Full CRUD
- ✅ All features: Enabled
- ✅ All pages: Access granted

### 5. Viewer
**Purpose**: Read-only access

**Permissions:**
- ✅ All entities: Read-only
- ❌ No create/update/delete
- ⚠️ Limited pages

## Usage

### Programmatic Access

```javascript
import { 
  getCurrentUserRole, 
  hasPermission, 
  hasFeatureAccess,
  getScopedData 
} from '@/lib/userTypeManager';

// Check permissions
const canEditProperty = await hasPermission('Property', 'update');

// Check feature access
const canAccessSales = await hasFeatureAccess('sales_pipeline');

// Get filtered data
const scopedQuery = await getScopedData('Property', { status: 'active' });
const properties = await base44.entities.Property.filter(scopedQuery);
```

### UI Components

**Access the manager at:** `/user-type-manager`

**Tabs:**
1. **User Types**: View/edit user type configurations
2. **User Assignments**: Manage individual user role assignments
3. **Permission Matrix**: Overview of permissions across types

### Creating Custom User Types

1. Navigate to `/user-type-manager`
2. Click "Create User Type"
3. Configure:
   - Type name and display name
   - Description
   - Enable/disable status
   - Data scoping (company/property/region filters)
   - Default dashboard
4. Save

### Assigning Users to Types

1. Go to "User Assignments" tab
2. Click "Assign User"
3. Select user, user type, and company
4. Optionally assign specific properties/regions
5. Save

## Data Scoping Examples

### Example 1: Sales Person - London Region Only
```json
{
  "user_type": "sales_person",
  "company_id": "comp_123",
  "assigned_regions": ["london"],
  "data_scope": {
    "company_filter": true,
    "region_filter": true
  }
}
```
**Result**: User sees only London properties for their company

### Example 2: Property Manager - Specific Buildings
```json
{
  "user_type": "subscriber",
  "company_id": "comp_123",
  "assigned_properties": ["prop_456", "prop_789"],
  "data_scope": {
    "company_filter": true,
    "property_filter": true
  }
}
```
**Result**: User sees only assigned properties

### Example 3: Developer - All Properties
```json
{
  "user_type": "developer",
  "company_id": "comp_123",
  "data_scope": {
    "company_filter": true
  }
}
```
**Result**: User sees all company properties

## Permission Inheritance

**Hierarchy:**
1. **UserType Defaults**: Base permissions for the type
2. **UserRole Overrides**: Individual customizations
3. **Final Permissions**: Merged result (overrides take precedence)

**Merge Logic:**
```javascript
finalPermissions = {
  ...defaultPermissions,
  ...userRoleOverrides
}
```

## Automation Rules

User types can trigger automated actions:

```json
{
  "automation_rules": [
    {
      "trigger": "user_login",
      "action": "send_welcome_notification",
      "conditions": {
        "first_login": true
      }
    },
    {
      "trigger": "property_assigned",
      "action": "send_email_notification",
      "conditions": {
        "user_type": "sales_person"
      }
    }
  ]
}
```

## UI Customization

### Per-User-Type Branding
```json
{
  "ui_config": {
    "branding": {
      "primary_color": "#1e40af",
      "logo_url": "https://...",
      "theme": "light"
    }
  }
}
```

### Sidebar Groups
```json
{
  "ui_config": {
    "sidebar_groups": ["properties", "tenants", "financials"]
  }
}
```

### Hidden Pages
```json
{
  "ui_config": {
    "hidden_pages": ["/user-type-manager", "/setup"]
  }
}
```

## Best Practices

1. **Start with Defaults**: Use "Initialize Defaults" to create standard types
2. **Least Privilege**: Grant minimum necessary permissions
3. **Test Thoroughly**: Verify data scoping works as expected
4. **Document Custom Types**: Add clear descriptions
5. **Review Regularly**: Audit permissions quarterly
6. **Use Overrides Sparingly**: Prefer type-level configuration

## Migration Guide

### For New Subscribers
1. System automatically creates default user types
2. Assign users to appropriate types during onboarding
3. Configure data scoping based on subscription tier

### For Existing Users
1. Existing users maintain current access (backward compatible)
2. Gradually migrate to new permission system
3. Use UserType Manager to configure custom roles

## API Reference

### Functions

**`getCurrentUserRole()`**
- Returns: User role with permissions and data scope
- Usage: `const role = await getCurrentUserRole()`

**`hasPermission(entityName, action)`**
- Returns: Boolean
- Usage: `const canEdit = await hasPermission('Property', 'update')`

**`hasFeatureAccess(featureName)`**
- Returns: Boolean
- Usage: `const hasSales = await hasFeatureAccess('sales_pipeline')`

**`hasPageAccess(pagePath)`**
- Returns: Boolean
- Usage: `const canAccess = await hasPageAccess('/financials')`

**`getScopedData(entityName, baseQuery)`**
- Returns: Filtered query object
- Usage: `const query = await getScopedData('Property', { status: 'active' })`

**`getUserTypeConfig(typeName)`**
- Returns: UserType configuration
- Usage: `const config = await getUserTypeConfig('subscriber')`

**`initializeDefaultUserTypes()`**
- Returns: void
- Usage: Creates default user types if they don't exist

## Troubleshooting

### Issue: User can't see expected data
**Solution**: Check data scope configuration and assigned properties/regions

### Issue: Permission denied unexpectedly
**Solution**: Verify user type permissions and check for overrides

### Issue: Changes not taking effect
**Solution**: User may need to log out and back in to refresh permissions

### Issue: Can't create user type
**Solution**: Ensure you have admin permissions

## Support

For issues or questions:
1. Check UserType Manager for configuration
2. Review permission matrix
3. Test with different user accounts
4. Contact support for assistance