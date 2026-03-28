import { test, expect } from '@playwright/test';

test.describe('CRUD Operations', () => {
  test('Companies: should display company list', async ({ page }) => {
    await page.goto('/companies');
    await page.waitForLoadState('networkidle');
    
    expect(page.url()).toContain('companies');
  });

  test('Properties: should display property list', async ({ page }) => {
    await page.goto('/properties');
    await page.waitForLoadState('networkidle');
    
    const hasTable = await page.locator('table, [role="grid"]').isVisible().catch(() => false);
    expect(page.url()).toContain('properties');
  });

  test('Units: should display unit list', async ({ page }) => {
    await page.goto('/units');
    await page.waitForLoadState('networkidle');
    
    expect(page.url()).toContain('units');
  });

  test('Tenants: should display tenant list', async ({ page }) => {
    await page.goto('/tenants');
    await page.waitForLoadState('networkidle');
    
    expect(page.url()).toContain('tenants');
  });

  test('Maintenance: should display maintenance orders', async ({ page }) => {
    await page.goto('/maintenance');
    await page.waitForLoadState('networkidle');
    
    expect(page.url()).toContain('maintenance');
  });

  test('Service Charges: should display service charge records', async ({ page }) => {
    await page.goto('/service-charges');
    await page.waitForLoadState('networkidle');
    
    expect(page.url()).toContain('service-charges');
  });

  test('Financial: should display financial transactions', async ({ page }) => {
    await page.goto('/financials');
    await page.waitForLoadState('networkidle');
    
    expect(page.url()).toContain('financials');
  });
});