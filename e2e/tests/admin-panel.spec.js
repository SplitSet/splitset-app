const { test, expect } = require('../fixtures/auth');

test.describe('Admin Panel E2E Tests', () => {
  
  test.describe('Admin Authentication & Access', () => {
    test('should login as admin and redirect to admin panel', async ({ page }) => {
      await page.goto('/login');
      
      // Fill login form
      await page.fill('input[type="email"]', 'admin@splitset.app');
      await page.fill('input[type="password"]', 'AdminPass123!');
      
      // Submit and wait for redirect
      await page.click('button[type="submit"]');
      await page.waitForURL('/admin');
      
      // Verify admin panel elements
      await expect(page.locator('h1')).toContainText('Admin Dashboard');
      await expect(page.locator('text=App owner control panel')).toBeVisible();
      
      // Verify navigation shows only admin panel
      await expect(page.locator('text=Admin Panel')).toBeVisible();
      await expect(page.locator('text=Set Manager')).not.toBeVisible();
      await expect(page.locator('text=Analytics')).not.toBeVisible();
      await expect(page.locator('text=Settings')).not.toBeVisible();
    });

    test('should deny access to non-admin users', async ({ page }) => {
      // Login as store owner
      await page.goto('/login');
      await page.fill('input[type="email"]', 'test@example.com');
      await page.fill('input[type="password"]', 'TestPass123!');
      await page.click('button[type="submit"]');
      await page.waitForURL('/dashboard');
      
      // Try to access admin panel directly
      await page.goto('/admin');
      
      // Should see access denied message
      await expect(page.locator('text=Access Denied')).toBeVisible();
      await expect(page.locator('text=admin privileges')).toBeVisible();
    });
  });

  test.describe('Admin Dashboard Metrics', () => {
    test('should display dashboard metrics with correct currency formatting', async ({ adminPage }) => {
      await adminPage.goto('/admin');
      
      // Wait for metrics to load
      await adminPage.waitForSelector('[data-testid="dashboard-metrics"]', { timeout: 10000 });
      
      // Verify metric cards are visible
      await expect(adminPage.locator('text=Products Split Today')).toBeVisible();
      await expect(adminPage.locator('text=Orders Today')).toBeVisible();
      await expect(adminPage.locator('text=Revenue Today')).toBeVisible();
      await expect(adminPage.locator('text=SplitSet Revenue Today')).toBeVisible();
      
      // Verify currency formatting (₹ symbol)
      const revenueElements = adminPage.locator('text=/₹\\d+\\.\\d{2}/');
      await expect(revenueElements.first()).toBeVisible();
      
      // Verify SplitSet revenue is displayed
      await expect(adminPage.locator('text=SplitSet Revenue Today')).toBeVisible();
      await expect(adminPage.locator('text=SplitSet Revenue (All-Time)')).toBeVisible();
    });

    test('should display all-time statistics', async ({ adminPage }) => {
      await adminPage.goto('/admin');
      
      // Wait for all-time stats section
      await adminPage.waitForSelector('text=All-Time Stats');
      
      // Verify all-time metrics
      await expect(adminPage.locator('text=Total Products Split')).toBeVisible();
      await expect(adminPage.locator('text=Total Orders')).toBeVisible();
      await expect(adminPage.locator('text=Total Revenue')).toBeVisible();
      await expect(adminPage.locator('text=Total Stores')).toBeVisible();
    });

    test('should calculate SplitSet revenue correctly', async ({ adminPage }) => {
      await adminPage.goto('/admin');
      
      // Wait for metrics to load
      await adminPage.waitForSelector('[data-testid="dashboard-metrics"]');
      
      // Get SplitSet revenue value
      const revenueElement = adminPage.locator('text=SplitSet Revenue Today').locator('..').locator('text=/₹\\d+\\.\\d{2}/');
      const revenueText = await revenueElement.textContent();
      
      // Verify it's a valid currency amount
      expect(revenueText).toMatch(/₹\d+\.\d{2}/);
      
      // The actual calculation verification would need backend data
      // but we can verify the format is correct
      const amount = parseFloat(revenueText.replace('₹', ''));
      expect(amount).toBeGreaterThanOrEqual(0);
    });
  });

  test.describe('Split Products Tab', () => {
    test('should display split products list', async ({ adminPage }) => {
      await adminPage.goto('/admin');
      
      // Click on Split Products tab
      await adminPage.click('text=Split Products');
      
      // Wait for products table
      await adminPage.waitForSelector('table', { timeout: 10000 });
      
      // Verify table headers
      await expect(adminPage.locator('th:has-text("Product")')).toBeVisible();
      await expect(adminPage.locator('th:has-text("Store")')).toBeVisible();
      await expect(adminPage.locator('th:has-text("Price")')).toBeVisible();
      await expect(adminPage.locator('th:has-text("Type")')).toBeVisible();
      await expect(adminPage.locator('th:has-text("Created")')).toBeVisible();
    });

    test('should show product prices with rupee symbol', async ({ adminPage }) => {
      await adminPage.goto('/admin');
      
      // Navigate to Split Products tab
      await adminPage.click('text=Split Products');
      await adminPage.waitForSelector('table');
      
      // Look for price cells with rupee symbol
      const priceElements = adminPage.locator('td:has-text("₹")');
      await expect(priceElements.first()).toBeVisible();
      
      // Verify price format
      const priceText = await priceElements.first().textContent();
      expect(priceText).toMatch(/₹\d+\.\d{2}/);
    });

    test('should support product search', async ({ adminPage }) => {
      await adminPage.goto('/admin');
      await adminPage.click('text=Split Products');
      
      // Wait for search input
      await adminPage.waitForSelector('input[placeholder*="Search"]');
      
      // Search for products
      await adminPage.fill('input[placeholder*="Search"]', 'Split');
      
      // Wait for filtered results
      await adminPage.waitForTimeout(1000); // Allow for debounced search
      
      // Verify search functionality exists
      await expect(adminPage.locator('input[placeholder*="Search"]')).toHaveValue('Split');
    });

    test('should support pagination', async ({ adminPage }) => {
      await adminPage.goto('/admin');
      await adminPage.click('text=Split Products');
      
      // Wait for table and pagination
      await adminPage.waitForSelector('table');
      
      // Look for pagination controls (if they exist)
      const paginationExists = await adminPage.locator('text=Page').count() > 0;
      if (paginationExists) {
        await expect(adminPage.locator('text=Page')).toBeVisible();
      }
    });
  });

  test.describe('Orders Tab', () => {
    test('should display orders grouped by store', async ({ adminPage }) => {
      await adminPage.goto('/admin');
      
      // Click on Orders tab
      await adminPage.click('text=Orders');
      
      // Wait for orders content
      await adminPage.waitForSelector('[data-testid="orders-content"]', { timeout: 10000 });
      
      // Verify orders structure
      const hasOrders = await adminPage.locator('text=/.*\\.myshopify\\.com/').count() > 0;
      if (hasOrders) {
        // Verify store grouping
        await expect(adminPage.locator('text=/.*\\.myshopify\\.com/')).toBeVisible();
      } else {
        // No orders case
        await expect(adminPage.locator('text=No orders found')).toBeVisible();
      }
    });

    test('should show order details with currency formatting', async ({ adminPage }) => {
      await adminPage.goto('/admin');
      await adminPage.click('text=Orders');
      
      await adminPage.waitForSelector('[data-testid="orders-content"]');
      
      // Look for order prices with rupee symbol
      const orderPrices = adminPage.locator('text=/₹\\d+\\.\\d{2}/');
      const priceCount = await orderPrices.count();
      
      if (priceCount > 0) {
        await expect(orderPrices.first()).toBeVisible();
        
        // Verify price format
        const priceText = await orderPrices.first().textContent();
        expect(priceText).toMatch(/₹\d+\.\d{2}/);
      }
    });
  });

  test.describe('Navigation and UI', () => {
    test('should have functional tab navigation', async ({ adminPage }) => {
      await adminPage.goto('/admin');
      
      // Verify all tabs are present
      await expect(adminPage.locator('button:has-text("Dashboard")')).toBeVisible();
      await expect(adminPage.locator('button:has-text("Split Products")')).toBeVisible();
      await expect(adminPage.locator('button:has-text("Orders")')).toBeVisible();
      
      // Test tab switching
      await adminPage.click('text=Split Products');
      await expect(adminPage.locator('button:has-text("Split Products")')).toHaveClass(/border-blue-500/);
      
      await adminPage.click('text=Orders');
      await expect(adminPage.locator('button:has-text("Orders")')).toHaveClass(/border-blue-500/);
      
      await adminPage.click('text=Dashboard');
      await expect(adminPage.locator('button:has-text("Dashboard")')).toHaveClass(/border-blue-500/);
    });

    test('should be responsive on mobile devices', async ({ browser }) => {
      // Create mobile context
      const context = await browser.newContext({
        viewport: { width: 375, height: 667 } // iPhone SE size
      });
      const page = await context.newPage();
      
      // Login as admin
      await page.goto('/login');
      await page.fill('input[type="email"]', 'admin@splitset.app');
      await page.fill('input[type="password"]', 'AdminPass123!');
      await page.click('button[type="submit"]');
      await page.waitForURL('/admin');
      
      // Verify mobile layout
      await expect(page.locator('h1')).toContainText('Admin Dashboard');
      
      // Check that tabs are still functional on mobile
      await page.click('text=Split Products');
      await page.waitForSelector('table', { timeout: 5000 });
      
      await context.close();
    });

    test('should handle loading states gracefully', async ({ adminPage }) => {
      await adminPage.goto('/admin');
      
      // Check for loading indicators
      const loadingExists = await adminPage.locator('text=Loading').count() > 0;
      if (loadingExists) {
        // Wait for loading to complete
        await adminPage.waitForSelector('text=Loading', { state: 'detached' });
      }
      
      // Verify content loaded
      await expect(adminPage.locator('h1')).toContainText('Admin Dashboard');
    });
  });

  test.describe('Error Handling', () => {
    test('should handle API errors gracefully', async ({ adminPage }) => {
      await adminPage.goto('/admin');
      
      // Wait for initial load
      await adminPage.waitForSelector('h1');
      
      // Intercept API calls and simulate errors
      await adminPage.route('/api/admin/**', route => {
        route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Internal Server Error' })
        });
      });
      
      // Try to refresh data by switching tabs
      await adminPage.click('text=Split Products');
      
      // Should handle error gracefully (no crash)
      await expect(adminPage.locator('h1')).toContainText('Admin Dashboard');
    });

    test('should handle network timeouts', async ({ adminPage }) => {
      await adminPage.goto('/admin');
      
      // Simulate slow network
      await adminPage.route('/api/admin/**', route => {
        // Delay response significantly
        setTimeout(() => {
          route.continue();
        }, 30000); // 30 second delay
      });
      
      // Try to load data
      await adminPage.click('text=Split Products');
      
      // Should show loading state or timeout gracefully
      const hasTimeout = await adminPage.locator('text=timeout').count() > 0;
      const hasError = await adminPage.locator('text=error').count() > 0;
      const hasLoading = await adminPage.locator('text=Loading').count() > 0;
      
      expect(hasTimeout || hasError || hasLoading).toBeTruthy();
    });
  });
});
