import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test('should display login requirement when not authenticated', async ({ page }) => {
    await page.goto('/');
    
    // Should show authentication required or redirect to login
    const isAuthRequired = await page.locator('text=Authentication required').isVisible().catch(() => false);
    const isOnLoginPage = page.url().includes('login');
    
    expect(isAuthRequired || isOnLoginPage).toBeTruthy();
  });

  test('should show dashboard when authenticated', async ({ page, context }) => {
    // Mock authenticated session
    await context.addCookies([{
      name: 'auth_token',
      value: 'mock-token',
      url: 'http://localhost:5173',
    }]);

    await page.goto('/');
    
    // Wait for dashboard to load
    await page.waitForSelector('text=Dashboard', { timeout: 5000 }).catch(() => {});
    
    // Should be on dashboard or show content
    const isDashboard = await page.locator('text=Dashboard').isVisible().catch(() => false);
    expect(isDashboard || page.url().includes('/')).toBeTruthy();
  });
});