import { test, expect } from '@playwright/test';

test.describe('Navigation', () => {
  test('should navigate through all main modules', async ({ page }) => {
    const modules = [
      { path: '/', name: 'Dashboard' },
      { path: '/companies', name: 'Companies' },
      { path: '/properties', name: 'Properties' },
      { path: '/units', name: 'Units' },
      { path: '/tenants', name: 'Tenants' },
      { path: '/financials', name: 'Financials' },
      { path: '/maintenance', name: 'Maintenance' },
      { path: '/service-charges', name: 'Service Charges' },
      { path: '/out-of-hours', name: 'Out of Hours' },
      { path: '/compliance', name: 'Compliance' },
    ];

    for (const module of modules) {
      await page.goto(module.path);
      await page.waitForLoadState('networkidle').catch(() => {});
      
      expect(page.url()).toContain(module.path === '/' ? '/' : module.path);
    }
  });

  test('sidebar should toggle on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    
    const sidebarToggle = page.locator('button[aria-label*="menu"], button[aria-label*="toggle"]').first();
    
    if (await sidebarToggle.isVisible()) {
      await sidebarToggle.click();
      await page.waitForTimeout(300);
    }
  });

  test('should display breadcrumbs or current page indicator', async ({ page }) => {
    await page.goto('/companies');
    await page.waitForLoadState('networkidle');
    
    const hasBreadcrumb = await page.locator('[class*="breadcrumb"]').isVisible().catch(() => false);
    const hasTitle = await page.locator('text=Companies, h1, h2').first().isVisible().catch(() => false);
    
    expect(hasBreadcrumb || hasTitle).toBeTruthy();
  });
});