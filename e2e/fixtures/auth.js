const { test as base, expect } = require('@playwright/test');

// Test users
const TEST_USERS = {
  admin: {
    email: 'admin@splitset.app',
    password: 'AdminPass123!',
    role: 'admin',
    expectedRedirect: '/admin'
  },
  storeOwner: {
    email: 'test@example.com',
    password: 'TestPass123!',
    role: 'store_owner',
    expectedRedirect: '/dashboard'
  }
};

// Extend Playwright test with authentication helpers
const test = base.extend({
  // Admin user context
  adminContext: async ({ browser }, use) => {
    const context = await browser.newContext();
    const page = await context.newPage();
    
    await loginUser(page, TEST_USERS.admin);
    
    await use(context);
    await context.close();
  },

  // Store owner user context  
  storeOwnerContext: async ({ browser }, use) => {
    const context = await browser.newContext();
    const page = await context.newPage();
    
    await loginUser(page, TEST_USERS.storeOwner);
    
    await use(context);
    await context.close();
  },

  // Authenticated admin page
  adminPage: async ({ adminContext }, use) => {
    const page = await adminContext.newPage();
    await use(page);
  },

  // Authenticated store owner page
  storeOwnerPage: async ({ storeOwnerContext }, use) => {
    const page = await storeOwnerContext.newPage();
    await use(page);
  },
});

// Helper function to login a user
async function loginUser(page, user) {
  await page.goto('/login');
  
  // Wait for login form
  await page.waitForSelector('form');
  
  // Fill login form
  await page.fill('input[type="email"]', user.email);
  await page.fill('input[type="password"]', user.password);
  
  // Submit form
  await page.click('button[type="submit"]');
  
  // Wait for redirect based on user role
  await page.waitForURL(user.expectedRedirect);
  
  // Verify user is logged in
  if (user.role === 'admin') {
    await expect(page.locator('text=Admin Panel')).toBeVisible();
  } else {
    await expect(page.locator('text=Dashboard')).toBeVisible();
  }
}

// Helper function to logout
async function logoutUser(page) {
  // Look for logout button/link
  await page.click('[data-testid="logout-button"], text=Logout, text=Sign Out');
  
  // Wait for redirect to login
  await page.waitForURL('/login');
  
  // Verify we're on login page
  await expect(page.locator('text=Sign In')).toBeVisible();
}

// Helper function to verify authentication state
async function verifyAuthenticationState(page, expectedRole = null) {
  if (expectedRole === 'admin') {
    await expect(page.locator('text=Admin Panel')).toBeVisible();
    await expect(page.locator('text=App owner control panel')).toBeVisible();
  } else if (expectedRole === 'store_owner') {
    await expect(page.locator('text=Dashboard')).toBeVisible();
    await expect(page.locator('text=Set Manager')).toBeVisible();
  } else {
    // Not authenticated - should be on login page
    await expect(page.locator('text=Sign In')).toBeVisible();
  }
}

module.exports = {
  test,
  expect,
  TEST_USERS,
  loginUser,
  logoutUser,
  verifyAuthenticationState
};
