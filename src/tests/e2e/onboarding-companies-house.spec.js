import { test, expect } from '@playwright/test';

test.describe('Subscriber Onboarding - Companies House Integration', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/onboarding');
  });

  test('Should complete onboarding with Companies House data fetch', async ({ page }) => {
    // Step 1: Company Search
    const companyInput = page.locator('input[placeholder="Company name or number e.g. RBM Property Ltd"]');
    await companyInput.fill('04352022');
    
    const searchButton = page.locator('button:has-text("Search")').first();
    await searchButton.click();
    
    // Wait for search results
    await page.waitForTimeout(3000);
    
    const companyResult = page.locator('text=Admiral Point').first();
    if (await companyResult.isVisible()) {
      await companyResult.click();
      await expect(page.locator('text=Company confirmed')).toBeVisible();
    }
    
    // Step 2: Continue to Directors step
    const continueButton = page.locator('button:has-text("Continue")').first();
    await continueButton.click();
    
    // Step 3: Fetch Directors from Companies House
    const fetchButton = page.locator('button:has-text("Fetch Officers from Companies House")');
    await expect(fetchButton).toBeVisible();
    await fetchButton.click();
    
    // Wait for Companies House data
    await page.waitForTimeout(3000);
    
    // Should see directors section
    const directorsSection = page.locator('text=Directors');
    await expect(directorsSection).toBeVisible({ timeout: 5000 });
    
    // Select first director
    const firstDirector = page.locator('[class*="rounded-lg"][class*="border"]').nth(0);
    await firstDirector.click();
    
    // Verify officer selection shows
    const selectedCount = page.locator('text=/\\d+ officer\\(s\\) selected/');
    await expect(selectedCount).toBeVisible();
  });

  test('Should search for and add associated companies', async ({ page }) => {
    // Navigate to directors step
    const companyInput = page.locator('input[placeholder="Company name or number e.g. RBM Property Ltd"]');
    await companyInput.fill('RBM Property Management Ltd');
    
    const searchButton = page.locator('button:has-text("Search")').first();
    await searchButton.click();
    
    await page.waitForTimeout(2000);
    
    // Select company
    const companyResult = page.locator('[class*="rounded-xl"][class*="border"][class*="cursor-pointer"]').first();
    await companyResult.click();
    
    // Continue to directors
    await page.locator('button:has-text("Continue")').first().click();
    
    // Fetch officers
    const fetchButton = page.locator('button:has-text("Fetch Officers from Companies House")');
    await fetchButton.click();
    
    await page.waitForTimeout(3000);
    
    // Select officers
    const officers = page.locator('[class*="rounded-lg"][class*="border"]').nth(0);
    await officers.click();
    
    // Click "Search for Associated Companies"
    const searchAssociatedButton = page.locator('button:has-text("Search for Associated Companies")');
    await expect(searchAssociatedButton).toBeVisible();
    await searchAssociatedButton.click();
    
    // Wait for results
    await page.waitForTimeout(3000);
    
    // Should show associated companies
    const associatedSection = page.locator('text=/Found \\d+ associated companies/');
    if (await associatedSection.isVisible()) {
      const addAllButton = page.locator('button:has-text("Add All")').first();
      await expect(addAllButton).toBeVisible();
    }
  });

  test('Should display multiple officer types correctly', async ({ page }) => {
    const companyInput = page.locator('input[placeholder="Company name or number e.g. RBM Property Ltd"]');
    await companyInput.fill('04352022');
    
    const searchButton = page.locator('button:has-text("Search")').first();
    await searchButton.click();
    
    await page.waitForTimeout(2000);
    
    const companyResult = page.locator('[class*="rounded-xl"][class*="border"]').first();
    await companyResult.click();
    
    await page.locator('button:has-text("Continue")').first().click();
    
    const fetchButton = page.locator('button:has-text("Fetch Officers from Companies House")');
    await fetchButton.click();
    
    await page.waitForTimeout(3000);
    
    // Check for different officer sections
    const directorsSection = page.locator('text=Directors');
    const officersSection = page.locator('text=Other Officers');
    const pscSection = page.locator('text=Persons with Significant Control');
    
    // At least Directors should be visible
    await expect(directorsSection).toBeVisible();
    
    // Check that checkboxes work
    const firstOfficer = page.locator('[class*="rounded-lg"][class*="border"]').nth(0);
    const checkIcon = firstOfficer.locator('[class*="text-primary"]');
    
    await firstOfficer.click();
    await expect(checkIcon).toBeVisible();
  });

  test('Should allow manual director entry when no Companies House data', async ({ page }) => {
    // Skip Companies House fetch and go manual
    const companyInput = page.locator('input[placeholder="Company name or number e.g. RBM Property Ltd"]');
    await companyInput.fill('Test Company Ltd');
    
    const manualButton = page.locator('button:has-text("Confirm Details")');
    await manualButton.click();
    
    // Continue to directors
    await page.locator('button:has-text("Continue")').first().click();
    
    // Add manual director
    const addButton = page.locator('button:has-text("Add director manually")');
    await expect(addButton).toBeVisible();
    await addButton.click();
    
    // Fill in director details
    const inputs = page.locator('input[placeholder="Full name"]');
    await inputs.first().fill('John Smith');
    
    const roleInput = page.locator('input[placeholder="Role"]');
    await roleInput.first().fill('Managing Director');
    
    // Should be able to continue
    await page.locator('button:has-text("Continue")').first().click();
    await expect(page.locator('text=Addresses')).toBeVisible();
  });

  test('Should complete full onboarding flow', async ({ page }) => {
    // Step 1: Company
    const companyInput = page.locator('input[placeholder="Company name or number e.g. RBM Property Ltd"]');
    await companyInput.fill('RBM');
    
    const searchBtn = page.locator('button:has-text("Search")').first();
    await searchBtn.click();
    
    await page.waitForTimeout(2000);
    
    const company = page.locator('[class*="rounded-xl"][class*="border"]').first();
    await company.click();
    
    // Step 2: Directors
    await page.locator('button:has-text("Continue")').first().click();
    
    const fetchBtn = page.locator('button:has-text("Fetch Officers from Companies House")');
    if (await fetchBtn.isVisible({ timeout: 2000 })) {
      await fetchBtn.click();
      await page.waitForTimeout(2000);
      
      const officer = page.locator('[class*="rounded-lg"][class*="border"]').nth(0);
      if (await officer.isVisible()) {
        await officer.click();
      }
    }
    
    await page.locator('button:has-text("Continue")').first().click();
    
    // Step 3: Addresses
    await expect(page.locator('text=Addresses')).toBeVisible();
    await page.locator('button:has-text("Continue")').first().click();
    
    // Step 4: Services
    await expect(page.locator('text=What services do you offer')).toBeVisible();
    const serviceButton = page.locator('button').filter({ hasText: 'Residential Lettings' }).first();
    if (await serviceButton.isVisible()) {
      await serviceButton.click();
    }
    
    await page.locator('button:has-text("Continue")').first().click();
    
    // Step 5: Software
    await expect(page.locator('text=What software do you currently use')).toBeVisible();
    const softwareBtn = page.locator('button').filter({ hasText: 'Xero' }).first();
    if (await softwareBtn.isVisible()) {
      await softwareBtn.click();
    }
    
    await page.locator('button:has-text("Continue")').first().click();
    
    // Continue through remaining steps
    await page.locator('button:has-text("Continue")').first().click();
    await page.locator('button:has-text("Continue")').first().click();
    
    // Step 8: Upload (can skip)
    await page.locator('button:has-text("Continue")').first().click();
    
    // Step 9: Review
    await expect(page.locator('text=Review & Create')).toBeVisible();
    const reviewButton = page.locator('button:has-text("Create My Premiso Environment")');
    await expect(reviewButton).toBeVisible();
  });
});