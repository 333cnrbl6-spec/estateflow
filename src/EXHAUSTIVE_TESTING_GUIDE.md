# Exhaustive User Type Testing Guide

## Overview
Comprehensive E2E test suite covering all 7 user types and their complete workflows across the Premiso platform.

## User Types Tested

### 1. **Admin**
- **Access:** Full platform (all modules)
- **Key Workflows:**
  - Company setup & management
  - Property & unit creation
  - Tenant onboarding
  - Financial management
  - Compliance monitoring
  - User management & settings
- **Test Coverage:**
  - All core modules accessible
  - Company CRUD operations
  - Compliance hub access
  - Financial reconciliation
  - Settings management

### 2. **Sales User**
- **Access:** Sales-specific modules only
- **Key Workflows:**
  - Lead management & scoring
  - Property listings & valuations
  - Viewing appointments
  - Transaction pipeline
  - Market intelligence
- **Test Coverage:**
  - Sales dashboard access
  - Market reports
  - Buyer portal
  - Viewings management
  - Restricted from admin functions

### 3. **Property Manager**
- **Access:** Properties, units, tenants, maintenance, compliance, reconciliation
- **Key Workflows:**
  - Property oversight
  - Unit management
  - Tenant management
  - Maintenance coordination
  - Compliance monitoring
  - Financial reconciliation
- **Test Coverage:**
  - Property management
  - Unit management
  - Tenant management
  - Maintenance workflow
  - Compliance hub
  - Financial reconciliation

### 4. **Subscriber**
- **Access:** Limited modules during onboarding
- **Key Workflows:**
  - Company profile setup
  - Data import & migration
  - Property management
  - Tenant management
  - System configuration
- **Test Coverage:**
  - Onboarding access
  - Properties management
  - Tenants management
  - Maintenance access

### 5. **Contractor**
- **Access:** Portal & inspection modules only
- **Key Workflows:**
  - Job assignment acceptance
  - Inspection submission
  - Photo uploads
  - Invoice submission
  - Profile management
- **Test Coverage:**
  - Contractor portal access
  - Inspection submission
  - Restricted from admin functions

### 6. **Landlord**
- **Access:** Landlord portal, reporting, reconciliation
- **Key Workflows:**
  - Portfolio oversight
  - Financial reporting
  - Rent payment tracking
  - Property performance
  - Bank reconciliation
- **Test Coverage:**
  - Landlord portal access
  - Reporting dashboard
  - Bank reconciliation
  - Restricted from company management

### 7. **Tenant**
- **Access:** Tenant portal only
- **Key Workflows:**
  - Rent payment
  - Maintenance requests
  - Document access
  - Communication with PM
  - Lease information
- **Test Coverage:**
  - Tenant portal access
  - Read-only access enforced
  - Restricted from property management

## Test Files

### `tests/e2e/user-types-exhaustive.spec.js`
**Comprehensive individual role tests:**
- Admin module access & permissions
- Sales user restrictions & access
- Property Manager operations
- Subscriber onboarding
- Contractor portal workflows
- Landlord portal workflows
- Tenant portal workflows
- Role-Based Access Control (RBAC) enforcement
- Dashboard customization by role
- Critical workflows per role
- Permission enforcement

**Test Cases:** 50+

### `tests/e2e/user-types-workflows.spec.js`
**Cross-role integration workflows:**
- Complete admin lifecycle
- Complete PM lifecycle
- Complete sales lifecycle
- Complete contractor lifecycle
- Complete landlord lifecycle
- Complete tenant lifecycle
- Cross-role scenarios
- Module access matrix verification
- Data isolation verification

**Test Cases:** 20+

## Running Tests

### Run All User Type Tests
```bash
npx playwright test tests/e2e/user-types-exhaustive.spec.js tests/e2e/user-types-workflows.spec.js
```

### Run Specific Role Tests
```bash
# Admin tests only
npx playwright test -g "Admin User Workflow"

# Sales tests only
npx playwright test -g "Sales User Workflow"

# Property Manager tests
npx playwright test -g "Property Manager Workflow"

# Contractor tests
npx playwright test -g "Contractor Portal Workflow"

# Landlord tests
npx playwright test -g "Landlord Portal Workflow"

# Tenant tests
npx playwright test -g "Tenant Portal Workflow"
```

### Run Integration Workflow Tests
```bash
npx playwright test tests/e2e/user-types-workflows.spec.js
```

### Run with Debug Mode
```bash
npx playwright test --debug tests/e2e/user-types-exhaustive.spec.js
```

### Run with UI Mode
```bash
npx playwright test --ui tests/e2e/user-types-exhaustive.spec.js
```

## Test Coverage Matrix

| Module | Admin | Sales | PM | Subscriber | Contractor | Landlord | Tenant |
|--------|-------|-------|----|-----------|-----------|---------|----|
| Dashboard | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Companies | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ |
| Properties | ✓ | ✗ | ✓ | ✓ | ✗ | ✗ | ✗ |
| Units | ✓ | ✗ | ✓ | ✓ | ✗ | ✗ | ✗ |
| Tenants | ✓ | ✗ | ✓ | ✓ | ✗ | ✗ | ✗ |
| Maintenance | ✓ | ✗ | ✓ | ✓ | ✓* | ✗ | ✓* |
| Sales | ✓ | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ |
| Compliance | ✓ | ✗ | ✓ | ✗ | ✗ | ✗ | ✗ |
| Financials | ✓ | ✗ | ✓ | ✓ | ✗ | ✓ | ✗ |
| Reconciliation | ✓ | ✗ | ✓ | ✗ | ✗ | ✓ | ✗ |
| Contractor Portal | ✗ | ✗ | ✗ | ✗ | ✓ | ✗ | ✗ |
| Landlord Portal | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ | ✗ |
| Tenant Portal | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ |

*Contractor sees assigned jobs only; Tenant can submit requests only

## Key Test Scenarios

### Admin Lifecycle
1. Create company
2. Add properties
3. Create units
4. Add tenants
5. Manage contractors
6. Monitor compliance
7. Review financials
8. Set up integrations

### Property Manager Lifecycle
1. View assigned properties
2. Manage units
3. Process maintenance requests
4. Track contractor work
5. Monitor compliance deadlines
6. Reconcile bank transactions
7. Communicate with tenants

### Sales Lifecycle
1. Qualify leads
2. List properties
3. Schedule viewings
4. Generate valuations
5. Track transaction pipeline
6. Generate market reports

### Contractor Lifecycle
1. Access portal with token
2. View assigned jobs
3. Submit inspection reports
4. Upload photos
5. Submit invoices

### Landlord Lifecycle
1. Access portal
2. View portfolio
3. Monitor financials
4. Review rent payments
5. Reconcile bank transactions

### Tenant Lifecycle
1. Access portal with token
2. View rent schedule
3. Make payments
4. Submit maintenance requests
5. Access documents

## Success Criteria

✓ All user types can access assigned modules
✓ No unauthorized access to restricted modules
✓ Role-based UI elements render correctly
✓ RBAC enforced at navigation level
✓ Data isolation maintained by role
✓ Critical workflows complete successfully
✓ Cross-role collaboration works seamlessly
✓ Dashboard customization by role applied

## Notes for Developers

### Authentication in Tests
Current tests use URL-based routing. In production, implement proper:
- Session validation
- JWT token verification
- Role middleware checks
- Route guards

### Data Isolation
Tests verify module access. Ensure:
- PM sees only assigned properties
- Tenant sees only their unit
- Contractor sees only assigned jobs
- Landlord sees only their properties

### Future Enhancements
1. Add actual auth flow testing
2. Implement data factory for test data
3. Add API-level permission tests
4. Test email/SMS notifications by role
5. Test mobile responsiveness per role
6. Add performance testing per role

## Troubleshooting

### Tests Timing Out
- Increase `waitForLoadState('networkidle')` timeout
- Check network tab for slow-loading resources
- Verify database queries are optimized

### Permission Tests Failing
- Verify RBAC middleware is enabled
- Check user role assignments
- Validate route protection logic
- Ensure localStorage/session cleared between tests

### Module Not Found Errors
- Verify all pages exist in `App.jsx`
- Check routing paths match test expectations
- Ensure page components load correctly

## Metrics to Track
- **Test Coverage:** 70+ test cases covering 7 user types
- **Module Coverage:** 13+ major modules tested
- **Workflow Coverage:** 15+ critical workflows validated
- **Success Rate:** Track pass/fail percentage by role
- **Execution Time:** Monitor test suite performance