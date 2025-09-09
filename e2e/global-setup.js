const { chromium } = require('@playwright/test');

async function globalSetup() {
  console.log('🚀 Starting E2E Global Setup...');
  
  // Wait for services to be ready
  await waitForServices();
  
  // Setup test data
  await setupTestData();
  
  console.log('✅ E2E Global Setup Complete');
}

async function waitForServices() {
  const maxWaitTime = 60000; // 60 seconds
  const startTime = Date.now();
  
  console.log('⏳ Waiting for backend service...');
  
  while (Date.now() - startTime < maxWaitTime) {
    try {
      const response = await fetch('http://localhost:5001/health');
      if (response.ok) {
        console.log('✅ Backend service is ready');
        break;
      }
    } catch (error) {
      // Service not ready yet
    }
    
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log('⏳ Waiting for frontend service...');
  
  while (Date.now() - startTime < maxWaitTime) {
    try {
      const response = await fetch('http://localhost:3001');
      if (response.ok) {
        console.log('✅ Frontend service is ready');
        break;
      }
    } catch (error) {
      // Service not ready yet
    }
    
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
}

async function setupTestData() {
  console.log('📊 Setting up test data...');
  
  try {
    // Create admin user session for data setup
    const loginResponse = await fetch('http://localhost:5001/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'admin@splitset.app',
        password: 'AdminPass123!'
      })
    });
    
    if (loginResponse.ok) {
      console.log('✅ Test admin user authenticated');
    } else {
      console.warn('⚠️  Could not authenticate test admin user');
    }
    
    // Additional test data setup could go here
    
  } catch (error) {
    console.warn('⚠️  Test data setup failed:', error.message);
  }
}

module.exports = globalSetup;
