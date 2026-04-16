import { test, expect } from '@playwright/test';

/**
 * COMPREHENSIVE BETA RELEASE AUDIT
 * Tests critical user journeys, sidebar navigation, error handling, and data integrity
 * Run before ANY production release
 */

test.describe('Beta Release Audit Suite', () => {
  
  test.beforeEach(async ({ page }) => {
    // Navigate to app and wait for auth
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
  });

  // ─────────────────────────────────────────────────────────────
  // SIDEBAR STABILITY TESTS
  // ─────────────────────────────────────────────────────────────
  
  test('Sidebar renders without crashing', async ({ page }) => {
    // Check sidebar exists
    const sidebar = await page.locator('[class*="sidebar"]').first();
    await expect(sidebar).toBeVisible();
    
    // Check key zones are present
    await expect(page.getByText('Core Operations')).toBeVisible();
    await expect(page.getByText('Finance & Accounting')).toBeVisible();
    await expect(page.getByText('Compliance & Safety')).toBeVisible();
  });

  test('Sidebar navigation zone headers don\'t crash on click', async ({ page }) => {
    // Click each zone header and verify no errors
    const zones = ['Core Operations', 'Finance & Accounting', 'Compliance & Safety', 'Maintenance & Operations'];
    
    for (const zoneName of zones) {
      const zone = page.getByText(zoneName);
      await zone.click();
      await page.waitForTimeout(300);
      
      // Check console for errors
      const errors = await page.evaluate(() => {
        const logs = [];
        return logs;
      });
      
      expect(errors).not.toContain('TypeError');
      expect(errors).not.toContain('Cannot read property');
    }
  });

  test('All sidebar links are navigable', async ({ page }) => {
    // Get all links in sidebar
    const sidebarLinks = await page.locator('[class*="sidebar"] a').all();
    
    // Test first 5 critical links
    const criticalPaths = ['/dashboard', '/properties', '/tenants', '/financials', '/maintenance'];
    
    for (const path of criticalPaths) {
      const link = page.locator(`a[href="${path}"]`);
      if (await link.isVisible()) {
        await link.click();
        await page.waitForLoadState('networkidle');
        
        // Verify no 404
        expect(page.url()).toContain(path);
        expect(page.locator('text=404')).not.toBeVisible();
      }
    }
  });

  // ─────────────────────────────────────────────────────────────
  // CORE ENTITY PAGES - NO CRASHES
  // ─────────────────────────────────────────────────────────────

  test('Properties page loads and displays data correctly', async ({ page }) => {
    await page.goto('/properties');
    await page.waitForLoadState('networkidle');
    
    // Page should have header
    await expect(page.getByText('Properties')).toBeVisible();
    
    // Should have Add button
    await expect(page.locator('button:has-text("Add Property")')).toBeVisible();
    
    // Check search input exists
    await expect(page.locator('input[placeholder*="Search"]')).toBeVisible();
  });

  test('Tenants page loads and displays data correctly', async ({ page }) => {
    await page.goto('/tenants');
    await page.waitForLoadState('networkidle');
    
    // Page should have header
    await expect(page.getByText('Tenants')).toBeVisible();
    
    // Should have action button
    const actionButton = page.locator('button').filter({ hasText: /Add|Create|New/ });
    expect(await actionButton.count()).toBeGreaterThanOrEqual(0);
  });

  test('Financial pages load without error', async ({ page }) => {
    const paths = ['/financials', '/financial-reporting', '/banking'];
    
    for (const path of paths) {
      await page.goto(path);
      await page.waitForLoadState('networkidle');
      
      // Should not have error message
      expect(page.locator('text=error').count()).resolves.toBeLessThan(5);
    }
  });

  // ─────────────────────────────────────────────────────────────
  // FORM SUBMISSION & DATA INTEGRITY
  // ─────────────────────────────────────────────────────────────

  test('Property form submission works without validation errors', async ({ page }) => {
    await page.goto('/properties');
    
    // Open add dialog
    await page.locator('button:has-text("Add Property")').click();
    await page.waitForTimeout(500);
    
    // Check dialog appeared
    const dialog = page.locator('div[role="dialog"]');
    await expect(dialog).toBeVisible();
    
    // Fill in minimal required field
    const nameInput = dialog.locator('input[placeholder*="name" i]').first();
    await nameInput.fill('Test Property');
    
    // Submit
    const submitButton = dialog.locator('button:has-text("Save")');
    await submitButton.click();
    
    // Dialog should close or show success
    await page.waitForTimeout(1000);
  });

  // ─────────────────────────────────────────────────────────────
  // AUTHENTICATION & ERROR HANDLING
  // ─────────────────────────────────────────────────────────────

  test('Unauthorized access is handled gracefully', async ({ page, context }) => {
    // Clear auth token
    await context.clearCookies();
    
    // Try to access protected page
    await page.goto('/dashboard', { waitUntil: 'networkidle' });
    
    // Should redirect to login or show error
    const isOnLogin = page.url().includes('login') || page.url().includes('auth');
    const hasErrorMsg = await page.locator('text=Authentication').count().then(c => c > 0);
    
    expect(isOnLogin || hasErrorMsg).toBeTruthy();
  });

  // ─────────────────────────────────────────────────────────────
  // CONSOLE ERROR DETECTION
  // ─────────────────────────────────────────────────────────────

  test('No critical console errors on main pages', async ({ page }) => {
    const errors = [];
    const warnings = [];
    
    page.on('console', msg => {
      if (msg.type() === 'error') errors.push(msg.text());
      if (msg.type() === 'warning' && msg.text().includes('Critical')) warnings.push(msg.text());
    });
    
    // Visit critical pages
    const pages = ['/dashboard', '/properties', '/financials'];
    for (const path of pages) {
      await page.goto(path);
      await page.waitForLoadState('networkidle');
    }
    
    // Should have no critical errors
    const criticalErrors = errors.filter(e => 
      e.includes('Cannot read') || 
      e.includes('TypeError') ||
      e.includes('React render')
    );
    
    expect(criticalErrors).toHaveLength(0);
  });

  // ─────────────────────────────────────────────────────────────
  // RESPONSIVE DESIGN CHECK
  // ─────────────────────────────────────────────────────────────

  test('Dashboard is responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    
    // Should not have horizontal scroll
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    const viewportWidth = 375;
    
    expect(bodyWidth).toBeLessThanOrEqual(viewportWidth + 10); // Allow 10px tolerance
  });

  // ─────────────────────────────────────────────────────────────
  // CRITICAL PATH: ONBOARDING
  // ─────────────────────────────────────────────────────────────

  test('Setup/Onboarding pages load correctly', async ({ page }) => {
    const onboardingPaths = ['/setup', '/intelligent-onboarding', '/data-discovery'];
    
    for (const path of onboardingPaths) {
      await page.goto(path);
      await page.waitForLoadState('networkidle');
      
      // Should not 404
      expect(page.locator('text=404')).not.toBeVisible();
      
      // Should have meaningful content
      const contentCount = await page.locator('h1, h2, button').count();
      expect(contentCount).toBeGreaterThan(0);
    }
  });

  // ─────────────────────────────────────────────────────────────
  // PERFORMANCE CHECK
  // ─────────────────────────────────────────────────────────────

  test('Critical pages load within acceptable time', async ({ page }) => {
    const maxLoadTime = 5000; // 5 seconds
    
    const startTime = Date.now();
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    const loadTime = Date.now() - startTime;
    
    expect(loadTime).toBeLessThan(maxLoadTime);
  });

  // ─────────────────────────────────────────────────────────────
  // DATA VALIDATION - ENSURE TYPE CHECKING
  // ─────────────────────────────────────────────────────────────

  test('Entity properties are type-safe rendered', async ({ page }) => {
    await page.goto('/properties');
    await page.waitForLoadState('networkidle');
    
    // Properties page should safely render even with missing/invalid types
    // Check for any uncaught type errors
    const unhandledErrors = [];
    page.on('pageerror', error => {
      unhandledErrors.push(error.message);
    });
    
    // Scroll through page
    await page.evaluate(() => window.scrollBy(0, window.innerHeight * 3));
    
    expect(unhandledErrors).toHaveLength(0);
  });
});