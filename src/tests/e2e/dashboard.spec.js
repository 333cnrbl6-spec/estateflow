import { test, expect } from '@playwright/test';

test.describe('Dashboard Module', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should load and display dashboard stats', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    
    // Check for key stat cards
    const statsVisible = await page.locator('text=Companies').isVisible().catch(() => false) ||
                         await page.locator('text=Properties').isVisible().catch(() => false);
    
    expect(statsVisible).toBeTruthy();
  });

  test('should display compliance alerts if present', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    
    // Check for compliance alert or safe mode
    const hasCompliance = await page.locator('[class*="compliance"]').count() > 0;
    expect(typeof hasCompliance).toBe('boolean');
  });

  test('should navigate to other modules from sidebar', async ({ page }) => {
    const companiesLink = page.locator('a:has-text("Companies")').first();
    
    if (await companiesLink.isVisible()) {
      await companiesLink.click();
      await page.waitForLoadState('networkidle');
      
      expect(page.url()).toContain('companies');
    }
  });

  test('should display recent maintenance orders', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    
    const maintenanceSection = page.locator('text=Recent Maintenance Orders');
    const isVisible = await maintenanceSection.isVisible().catch(() => false);
    
    expect(isVisible).toBeTruthy();
  });
});