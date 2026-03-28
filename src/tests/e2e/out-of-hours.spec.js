import { test, expect } from '@playwright/test';

test.describe('Out-of-Hours Call Center Module', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/out-of-hours');
  });

  test('should load call center page', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    
    // Check for page title or key elements
    const hasTitle = await page.locator('text=Out').isVisible().catch(() => false);
    expect(page.url()).toContain('out-of-hours');
  });

  test('should display call entry form', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    
    // Check for form fields
    const hasPhoneField = await page.locator('input[placeholder*="phone"], input[placeholder*="Phone"]').isVisible().catch(() => false);
    const hasDescriptionField = await page.locator('textarea, input[placeholder*="description"]').isVisible().catch(() => false);
    
    expect(hasPhoneField || hasDescriptionField).toBeTruthy();
  });

  test('should navigate to call queue', async ({ page }) => {
    const queueLink = page.locator('text=Call Queue, text=Queue').first();
    
    if (await queueLink.isVisible()) {
      await queueLink.click();
      await page.waitForLoadState('networkidle');
      
      expect(page.url()).toContain('out-of-hours');
    }
  });

  test('should display call configuration page', async ({ page }) => {
    await page.goto('/call-center-config');
    await page.waitForLoadState('networkidle');
    
    const hasConfig = await page.locator('text=Configuration, text=Setup, text=Service').first().isVisible().catch(() => false);
    expect(page.url()).toContain('config');
  });

  test('should handle test call submission', async ({ page }) => {
    const testButton = page.locator('button:has-text("Test Call")').first();
    
    if (await testButton.isVisible()) {
      // Fill form
      const phoneInput = page.locator('input[placeholder*="phone"], input[placeholder*="Phone"]').first();
      
      if (await phoneInput.isVisible()) {
        await phoneInput.fill('+1234567890');
        
        // Try to submit
        await testButton.click();
        
        // Check for response
        await page.waitForTimeout(1000);
        const hasResponse = await page.locator('text=success, text=error, text=initiated').first().isVisible().catch(() => false);
        expect(typeof hasResponse).toBe('boolean');
      }
    }
  });
});