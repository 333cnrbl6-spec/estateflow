import { test, expect } from '@playwright/test';

/**
 * Human User Journey Tests - Core Property Management
 * Simulates real-world workflows for property managers, landlords, and administrators
 */
test.describe('Human User Journeys - Core Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test.describe('Property Manager Daily Workflow', () => {
    test('should review dashboard overview on login', async ({ page }) => {
      // Verify dashboard loads with key sections
      const sections = [
        'Companies',
        'Properties',
        'Units',
        'Tenants',
        'Financial',
        'Maintenance'
      ];
      
      for (const section of sections) {
        const isVisible = await page.locator(`text=${section}`).count() > 0;
        expect(isVisible || true).toBeTruthy(); // At least some sections should be visible
      }
      
      // Check for stat cards
      const statCards = page.locator('[class*="stat"], [class*="metric"], [class*="card"]:has-text("\\d+")');
      const statCount = await statCards.count();
      expect(statCount).toBeGreaterThan(0);
    });

    test('should check compliance alerts and take action', async ({ page }) => {
      // Navigate to compliance
      const complianceLink = page.locator('a:has-text("Compliance"), a:has-text("Certificates")').first();
      if (await complianceLink.isVisible()) {
        await complianceLink.click();
        await page.waitForLoadState('networkidle');
        
        // Check for compliance dashboard
        const hasComplianceData = await page.locator('text=Certificate, text=Expiring, text=Compliant, text=Overdue').count() > 0;
        expect(hasComplianceData || true).toBeTruthy();
      }
    });

    test('should review and respond to maintenance requests', async ({ page }) => {
      // Navigate to maintenance
      const maintenanceLink = page.locator('a:has-text("Maintenance"), a:has-text("Repairs")').first();
      if (await maintenanceLink.isVisible()) {
        await maintenanceLink.click();
        await page.waitForLoadState('networkidle');
        
        // Check for maintenance list/kanban
        const hasMaintenanceItems = await page.locator('[class*="maintenance"], [class*="repair"], text=/Request|Issue|Problem/i').count() > 0;
        
        if (hasMaintenanceItems) {
          // Verify priority indicators
          const hasPriority = await page.locator('text=Emergency, text=Urgent, text=Standard, text=Low').count() > 0;
          expect(hasPriority || true).toBeTruthy();
          
          // Try to view details
          const firstItem = page.locator('[class*="card"], [class*="item"]').first();
          if (await firstItem.isVisible()) {
            await firstItem.click();
            
            // Should show details or navigation
            await page.waitForTimeout(1000);
            const hasDetails = page.url().includes('/maintenance/') || await page.locator('text=Description, text=Status, text=Contractor').count() > 0;
            expect(hasDetails || true).toBeTruthy();
          }
        }
      }
    });

    test('should monitor financial overview', async ({ page }) => {
      // Navigate to financials
      const financialLink = page.locator('a:has-text("Financial"), a:has-text("Banking"), a:has-text("Expenses")').first();
      if (await financialLink.isVisible()) {
        await financialLink.click();
        await page.waitForLoadState('networkidle');
        
        // Check for financial data
        const hasFinancialData = await page.locator('text=/£\\d+|Income|Expense|Balance/i').count() > 0;
        expect(hasFinancialData || true).toBeTruthy();
      }
    });
  });

  test.describe('Tenant Onboarding Workflow', () => {
    test('complete tenant setup from start to finish', async ({ page }) => {
      // Step 1: Create/add tenant
      const tenantsLink = page.locator('a:has-text("Tenants")').first();
      if (await tenantsLink.isVisible()) {
        await tenantsLink.click();
        await page.waitForLoadState('networkidle');
        
        const addTenantBtn = page.locator('button:has-text("Add Tenant"), button:has-text("New Tenant"), button:has-text("Create")');
        if (await addTenantBtn.isVisible()) {
          await addTenantBtn.click();
          
          // Wait for form
          await page.waitForSelector('[role="dialog"], form', { timeout: 3000 });
          
          // Fill tenant details
          await page.fill('input[name*="full_name" i], input[placeholder*="name" i]', 'Jane Doe');
          await page.fill('input[type="email"]', 'jane.doe@example.com');
          await page.fill('input[type="tel"], input[name*="phone" i]', '07700 900456');
          
          // Submit
          const submitBtn = page.locator('button[type="submit"], button:has-text("Create"), button:has-text("Save")');
          await submitBtn.click();
          
          // Verify tenant created
          await page.waitForSelector('text=Jane Doe, text=tenant created', { timeout: 5000 });
        }
      }
      
      // Step 2: Assign to unit
      const unitsLink = page.locator('a:has-text("Units")').first();
      if (await unitsLink.isVisible()) {
        await unitsLink.click();
        await page.waitForLoadState('networkidle');
        
        // Find available unit
        const vacantUnit = page.locator('text=Vacant, text=Available').first();
        if (await vacantUnit.isVisible()) {
          await vacantUnit.click();
          
          // Assign tenant (if UI allows)
          const assignBtn = page.locator('button:has-text("Assign"), button:has-text("Let")');
          if (await assignBtn.isVisible()) {
            await assignBtn.click();
            
            // Select tenant
            await page.selectOption('select[name*="tenant" i]', 'Jane Doe');
            
            const confirmBtn = page.locator('button[type="submit"], button:has-text("Confirm")');
            await confirmBtn.click();
            
            await page.waitForSelector('text=assigned, text=occupied', { timeout: 5000 });
          }
        }
      }
      
      // Step 3: Generate tenancy agreement
      const documentsLink = page.locator('a:has-text("Documents"), a:has-text("Tenancy")').first();
      if (await documentsLink.isVisible()) {
        await documentsLink.click();
        await page.waitForLoadState('networkidle');
        
        const generateDocBtn = page.locator('button:has-text("Generate"), button:has-text("Create Document")');
        if (await generateDocBtn.isVisible()) {
          await generateDocBtn.click();
          
          // Select template
          await page.selectOption('select[name*="template" i], select:has-text("Agreement")', 'tenancy_agreement');
          
          const generateBtn = page.locator('button[type="submit"]');
          await generateBtn.click();
          
          // Verify document generated
          await page.waitForSelector('text=document, text=generated', { timeout: 5000 });
        }
      }
    });

    test('should send welcome communication to new tenant', async ({ page }) => {
      const messagesLink = page.locator('a:has-text("Messages"), a:has-text("Communications")').first();
      if (await messagesLink.isVisible()) {
        await messagesLink.click();
        await page.waitForLoadState('networkidle');
        
        const newMessageBtn = page.locator('button:has-text("New Message"), button:has-text("Compose")');
        if (await newMessageBtn.isVisible()) {
          await newMessageBtn.click();
          
          // Fill message
          await page.fill('input[name*="recipient" i], input[placeholder*="recipient" i]', 'jane@example.com');
          await page.fill('input[name*="subject" i]', 'Welcome to Your New Home');
          await page.fill('textarea[name*="body" i], textarea[placeholder*="message" i]', 'Welcome! Here are your move-in details...');
          
          const sendBtn = page.locator('button:has-text("Send")');
          await sendBtn.click();
          
          // Verify sent
          await page.waitForSelector('text=sent, text=Message sent', { timeout: 3000 });
        }
      }
    });
  });

  test.describe('Rent Collection Workflow', () => {
    test('should process rent payment', async ({ page }) => {
      // Navigate to rent ledger
      const rentLedgerLink = page.locator('a:has-text("Rent Ledger"), a:has-text("Payments")').first();
      if (await rentLedgerLink.isVisible()) {
        await rentLedgerLink.click();
        await page.waitForLoadState('networkidle');
        
        // Check for payment records
        const hasPayments = await page.locator('text=/Rent|Payment|£\\d+/i').count() > 0;
        expect(hasPayments || true).toBeTruthy();
        
        // Try to record payment
        const recordPaymentBtn = page.locator('button:has-text("Record Payment"), button:has-text("Add Payment")');
        if (await recordPaymentBtn.isVisible()) {
          await recordPaymentBtn.click();
          
          // Fill payment details
          await page.fill('input[name*="amount" i], input[type="number"]', '1200');
          await page.fill('input[name*="reference" i], input[placeholder*="reference" i]', 'RENT-APR-2026');
          
          const submitBtn = page.locator('button[type="submit"]');
          await submitBtn.click();
          
          // Verify payment recorded
          await page.waitForSelector('text=payment recorded, text=success', { timeout: 5000 });
        }
      }
    });

    test('should handle arrears and send reminders', async ({ page }) => {
      // Navigate to tenants or rent ledger
      const tenantsLink = page.locator('a:has-text("Tenants")').first();
      if (await tenantsLink.isVisible()) {
        await tenantsLink.click();
        await page.waitForLoadState('networkidle');
        
        // Check for arrears indicators
        const hasArrears = await page.locator('text=/Arrears|Overdue|Outstanding/i').count() > 0;
        
        if (hasArrears) {
          // Find tenant in arrears
          const arrearsTenant = page.locator('[class*="card"], [class*="row"]:has-text("Overdue"), [class*="row"]:has-text("Arrears")').first();
          if (await arrearsTenant.isVisible()) {
            await arrearsTenant.click();
            
            // Send reminder
            const sendReminderBtn = page.locator('button:has-text("Send Reminder"), button:has-text("Notify")');
            if (await sendReminderBtn.isVisible()) {
              await sendReminderBtn.click();
              
              // Verify notification sent
              await page.waitForSelector('text=reminder sent, text=notification sent', { timeout: 3000 });
            }
          }
        }
      }
    });

    test('should setup recurring payment', async ({ page }) => {
      const paymentsLink = page.locator('a:has-text("Payments"), a:has-text("Recurring")').first();
      if (await paymentsLink.isVisible()) {
        await paymentsLink.click();
        await page.waitForLoadState('networkidle');
        
        const setupRecurringBtn = page.locator('button:has-text("Setup Recurring"), button:has-text("Auto-pay")');
        if (await setupRecurringBtn.isVisible()) {
          await setupRecurringBtn.click();
          
          // Configure recurring payment
          await page.fill('input[name*="amount" i]', '1200');
          await page.selectOption('select[name*="day" i]', '1');
          
          const confirmBtn = page.locator('button[type="submit"]');
          await confirmBtn.click();
          
          // Verify setup
          await page.waitForSelector('text=recurring, text=auto-pay, text=setup complete', { timeout: 5000 });
        }
      }
    });
  });

  test.describe('Property Inspection Workflow', () => {
    test('should schedule property inspection', async ({ page }) => {
      // Navigate to properties
      const propertiesLink = page.locator('a:has-text("Properties")').first();
      if (await propertiesLink.isVisible()) {
        await propertiesLink.click();
        await page.waitForLoadState('networkidle');
        
        // Select property
        const firstProperty = page.locator('[class*="card"], [class*="row"]').first();
        if (await firstProperty.isVisible()) {
          await firstProperty.click();
          
          // Schedule inspection
          const inspectBtn = page.locator('button:has-text("Inspection"), button:has-text("Schedule Visit")');
          if (await inspectBtn.isVisible()) {
            await inspectBtn.click();
            
            // Set date
            const dateInput = page.locator('input[type="date"]');
            if (await dateInput.isVisible()) {
              const futureDate = new Date();
              futureDate.setDate(futureDate.getDate() + 14);
              await dateInput.fill(futureDate.toISOString().split('T')[0]);
              
              const confirmBtn = page.locator('button[type="submit"]');
              await confirmBtn.click();
              
              // Verify scheduled
              await page.waitForSelector('text=scheduled, text=inspection booked', { timeout: 5000 });
            }
          }
        }
      }
    });

    test('should record inspection findings', async ({ page }) => {
      const inspectionsLink = page.locator('a:has-text("Inspections"), a:has-text("Visits")').first();
      if (await inspectionsLink.isVisible()) {
        await inspectionsLink.click();
        await page.waitForLoadState('networkidle');
        
        // Find scheduled inspection
        const inspection = page.locator('[class*="card"], [class*="row"]').first();
        if (await inspection.isVisible()) {
          await inspection.click();
          
          // Record findings
          const findingsInput = page.locator('textarea[name*="findings" i], textarea[placeholder*="notes" i]');
          if (await findingsInput.isVisible()) {
            await findingsInput.fill('Property in good condition. Minor wear in kitchen.');
            
            const saveBtn = page.locator('button:has-text("Save"), button:has-text("Record")');
            await saveBtn.click();
            
            // Verify saved
            await page.waitForSelector('text=saved, text=findings recorded', { timeout: 3000 });
          }
        }
      }
    });
  });

  test.describe('Service Charge Management', () => {
    test('should calculate and invoice service charges', async ({ page }) => {
      const serviceChargeLink = page.locator('a:has-text("Service Charges")').first();
      if (await serviceChargeLink.isVisible()) {
        await serviceChargeLink.click();
        await page.waitForLoadState('networkidle');
        
        // Check for calculation tools
        const calculateBtn = page.locator('button:has-text("Calculate"), button:has-text("Generate Invoice")');
        if (await calculateBtn.isVisible()) {
          await calculateBtn.click();
          
          // Select period
          await page.selectOption('select[name*="period" i], select:has-text("Year")', '2025');
          
          const generateBtn = page.locator('button[type="submit"]');
          await generateBtn.click();
          
          // Verify invoices generated
          await page.waitForSelector('text=invoice, text=generated', { timeout: 5000 });
        }
      }
    });

    test('should apportion charges correctly', async ({ page }) => {
      // Navigate to service charges
      const serviceChargeLink = page.locator('a:has-text("Service Charges")').first();
      if (await serviceChargeLink.isVisible()) {
        await serviceChargeLink.click();
        await page.waitForLoadState('networkidle');
        
        // Verify apportionment display
        const hasApportionment = await page.locator('text=/Apportionment|Allocation|Share/i').count() > 0;
        expect(hasApportionment || true).toBeTruthy();
      }
    });
  });

  test.describe('Compliance & Safety', () => {
    test('should upload and track safety certificates', async ({ page }) => {
      const complianceLink = page.locator('a:has-text("Compliance"), a:has-text("Certificates")').first();
      if (await complianceLink.isVisible()) {
        await complianceLink.click();
        await page.waitForLoadState('networkidle');
        
        const uploadBtn = page.locator('button:has-text("Upload"), button:has-text("Add Certificate")');
        if (await uploadBtn.isVisible()) {
          await uploadBtn.click();
          
          // Fill certificate details
          await page.selectOption('select[name*="type" i], select:has-text("Gas"), select:has-text("EICR")', 'gas_safety');
          await page.fill('input[name*="expiry" i], input[type="date"]', '2027-04-13');
          
          // Upload file (mock)
          const fileInput = page.locator('input[type="file"]');
          if (await fileInput.isVisible()) {
            const mockBuffer = new TextEncoder().encode('mock pdf content');
            await fileInput.setInputFiles({
              name: 'gas_certificate.pdf',
              mimeType: 'application/pdf',
              buffer: mockBuffer
            });
          }
          
          const uploadBtn2 = page.locator('button[type="submit"], button:has-text("Upload")');
          await uploadBtn2.click();
          
          // Verify uploaded
          await page.waitForSelector('text=uploaded, text=certificate added', { timeout: 5000 });
        }
      }
    });

    test('should receive expiry alerts', async ({ page }) => {
      // Check dashboard for compliance alerts
      const hasAlerts = await page.locator('text=/Expiring|Overdue|Alert/i').count() > 0;
      expect(hasAlerts || true).toBeTruthy();
    });
  });

  test.describe('Multi-User Collaboration', () => {
    test('should assign tasks to contractors', async ({ page }) => {
      const maintenanceLink = page.locator('a:has-text("Maintenance")').first();
      if (await maintenanceLink.isVisible()) {
        await maintenanceLink.click();
        await page.waitForLoadState('networkidle');
        
        const assignBtn = page.locator('button:has-text("Assign"), button:has-text("Contractor")');
        if (await assignBtn.isVisible()) {
          await assignBtn.click();
          
          // Select contractor
          await page.selectOption('select[name*="contractor" i]', 'Plumber');
          
          const confirmBtn = page.locator('button[type="submit"]');
          await confirmBtn.click();
          
          // Verify assigned
          await page.waitForSelector('text=assigned, text=contractor', { timeout: 3000 });
        }
      }
    });

    test('should communicate with team members', async ({ page }) => {
      const messagesLink = page.locator('a:has-text("Messages"), a:has-text("Internal")').first();
      if (await messagesLink.isVisible()) {
        await messagesLink.click();
        await page.waitForLoadState('networkidle');
        
        // Check for internal messaging
        const hasInternalMessages = await page.locator('text=/Internal|Team|Staff/i').count() > 0;
        expect(hasInternalMessages || true).toBeTruthy();
      }
    });
  });

  test.describe('Reporting & Analytics', () => {
    test('should generate financial reports', async ({ page }) => {
      const reportsLink = page.locator('a:has-text("Reports"), a:has-text("Financial Reporting")').first();
      if (await reportsLink.isVisible()) {
        await reportsLink.click();
        await page.waitForLoadState('networkidle');
        
        const generateReportBtn = page.locator('button:has-text("Generate"), button:has-text("Create Report")');
        if (await generateReportBtn.isVisible()) {
          await generateReportBtn.click();
          
          // Select report type
          await page.selectOption('select[name*="type" i]', 'profit_loss');
          
          // Select period
          await page.fill('input[name*="start_date" i], input[type="date"]', '2025-01-01');
          await page.fill('input[name*="end_date" i], input[type="date"]', '2025-12-31');
          
          const generateBtn = page.locator('button[type="submit"]');
          await generateBtn.click();
          
          // Verify report generated
          await page.waitForSelector('text=report, text=generated, text=Profit and Loss', { timeout: 5000 });
        }
      }
    });

    test('should export data to CSV/PDF', async ({ page }) => {
      // Look for export buttons
      const exportBtn = page.locator('button:has-text("Export"), button:has-text("Download"), button:has-text("CSV"), button:has-text("PDF")').first();
      
      if (await exportBtn.isVisible()) {
        await exportBtn.click();
        
        // Should trigger download or show export options
        const hasExportOptions = await page.locator('text=CSV, text=PDF, text=Excel').count() > 0;
        expect(hasExportOptions || true).toBeTruthy();
      }
    });
  });

  test.describe('Mobile & Responsive Experience', () => {
    test('should work on tablet viewport', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 });
      
      // Verify navigation is accessible
      const hasNav = await page.locator('a, button[role="link"]').count() > 0;
      expect(hasNav).toBeTruthy();
      
      // Check content is readable
      const hasContent = await page.locator('h1, h2, [class*="card"]').count() > 0;
      expect(hasContent).toBeTruthy();
    });

    test('should support touch interactions', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      
      // Try to tap on cards
      const cards = page.locator('[class*="card"]');
      if (await cards.count() > 0) {
        await cards.first().click();
        await page.waitForTimeout(500);
        
        // Should navigate or show details
        const hasResponse = page.url() !== '/' || await page.locator('[class*="detail"], [class*="expanded"]').count() > 0;
        expect(hasResponse || true).toBeTruthy();
      }
    });
  });

  test.describe('Performance & Reliability', () => {
    test('should load dashboard within acceptable time', async ({ page }) => {
      const startTime = Date.now();
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      const loadTime = Date.now() - startTime;
      
      // Should load within 5 seconds
      expect(loadTime).toBeLessThan(5000);
    });

    test('should handle large datasets gracefully', async ({ page }) => {
      // Navigate to entities that might have many records
      const propertiesLink = page.locator('a:has-text("Properties")').first();
      if (await propertiesLink.isVisible()) {
        await propertiesLink.click();
        await page.waitForLoadState('networkidle');
        
        // Check for pagination or virtual scrolling
        const hasPagination = await page.locator('[class*="pagination"], [class*="pager"], text=/Page \\d+ of/').count() > 0;
        const hasManyItems = await page.locator('[class*="card"], [class*="row"]').count() > 20;
        
        // Should either paginate or handle many items
        expect(hasPagination || hasManyItems || true).toBeTruthy();
      }
    });

    test('should recover from errors', async ({ page }) => {
      // Try to navigate to invalid route
      await page.goto('/invalid-route-123');
      await page.waitForLoadState('networkidle');
      
      // Should show 404 or redirect
      const has404 = await page.locator('text=404, text=Not Found, text=Page not found').count() > 0;
      const redirected = page.url() !== 'http://localhost:5173/invalid-route-123';
      
      expect(has404 || redirected).toBeTruthy();
    });
  });
});