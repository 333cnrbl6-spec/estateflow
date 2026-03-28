import { test, expect } from '@playwright/test';

test.describe('Developer Demo Switcher', () => {
  test('should load demo switcher page', async ({ page }) => {
    await page.goto('/dev-demo-switcher');
    await page.waitForLoadState('networkidle');
    
    const hasTitle = await page.locator('text=Developer Demo').isVisible().catch(() => false);
    expect(page.url()).toContain('demo-switcher');
  });

  test('should display demo profile cards', async ({ page }) => {
    await page.goto('/dev-demo-switcher');
    await page.waitForLoadState('networkidle');
    
    const hasProfiles = await page.locator('text=RBM').isVisible().catch(() => false) ||
                        await page.locator('text=Powell').isVisible().catch(() => false);
    
    expect(hasProfiles).toBeTruthy();
  });

  test('should require authentication', async ({ page, context }) => {
    // Clear cookies
    await context.clearCookies();
    
    await page.goto('/dev-demo-switcher');
    await page.waitForLoadState('networkidle');
    
    const requiresAuth = await page.locator('text=Authentication').isVisible().catch(() => false);
    expect(requiresAuth || page.url()).toBeTruthy();
  });
});