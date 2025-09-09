# 🧪 SplitSet Test Users Guide

## 👥 **Existing Test Users**

Your production database has **3 test users** ready for testing:

### **User 1: Basic Test User**
```
Email: test@test.com
Name: Test User
Role: store_owner
Status: active
Password: [You need to know/reset this]
```

### **User 2: Alternative Test User**
```
Email: testuser@test.com
Name: Test User  
Role: store_owner
Status: active
Password: [You need to know/reset this]
```

### **User 3: DC Gallery Mumbai**
```
Email: dcgallerymumbai@gmail.com
Name: DC MUMBAI
Role: store_owner
Status: active
Password: [You need to know/reset this]
```

## 🔑 **Testing Authentication**

### **Option 1: Use Existing Users (if you know passwords)**

Test login with any of the above users:

```bash
# Test login endpoint
curl -X POST https://splitset-backend.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@test.com",
    "password": "your_password_here"
  }'
```

### **Option 2: Create New Test User**

Register a new user for testing:

```bash
# Register new test user
curl -X POST https://splitset-backend.onrender.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newtest@example.com",
    "password": "TestPassword123!",
    "firstName": "New",
    "lastName": "Tester"
  }'
```

### **Option 3: Reset Password (if needed)**

If you don't remember the passwords, you can:

1. **Use the forgot password endpoint**:
```bash
curl -X POST https://splitset-backend.onrender.com/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@test.com"
  }'
```

2. **Or create a password reset script** (run locally):

```javascript
// reset-password.js
require('dotenv').config();
const bcrypt = require('bcryptjs');
const db = require('./backend/db');

async function resetUserPassword(email, newPassword) {
  try {
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    
    const result = await db('users')
      .where({ email })
      .update({ 
        password_hash: hashedPassword,
        password_reset_token: null,
        password_reset_expires: null 
      });
    
    if (result > 0) {
      console.log(`✅ Password updated for ${email}`);
      console.log(`New password: ${newPassword}`);
    } else {
      console.log(`❌ User not found: ${email}`);
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
  
  process.exit(0);
}

// Usage: node reset-password.js
resetUserPassword('test@test.com', 'NewPassword123!');
```

## 🏪 **Adding Shopify Stores**

Once logged in, users need to add their Shopify stores:

### **Store Registration Process**

1. **Login to the app**
2. **Go to Store Settings** or **Add Store**
3. **Provide Shopify credentials**:
   ```json
   {
     "shopDomain": "your-store.myshopify.com",
     "accessToken": "shpat_xxxxxxxxxxxxxxxx",
     "appId": "your_app_id",
     "appSecret": "your_app_secret"
   }
   ```

### **Test Store Credentials**

For testing, you'll need:
- **Shopify Store Domain**: `your-store.myshopify.com`
- **Private App Access Token**: From Shopify Admin → Apps → Private Apps
- **Required Scopes**: `read_products,write_products,read_orders,write_orders,read_customers,write_customers,read_themes,write_themes`

## 🧪 **Testing Workflow**

### **Complete Test Flow**

1. **Authentication Test**:
   ```bash
   # 1. Register or login
   curl -X POST [backend]/api/auth/login -d '{"email":"test@test.com","password":"password"}'
   
   # 2. Get user info (with token from step 1)
   curl -H "Authorization: Bearer YOUR_TOKEN" [backend]/api/auth/me
   ```

2. **Store Management Test**:
   ```bash
   # 3. Add a Shopify store
   curl -X POST [backend]/api/stores -H "Authorization: Bearer YOUR_TOKEN" -d '{
     "shopDomain": "test-store.myshopify.com",
     "accessToken": "shpat_xxxxxxxx"
   }'
   
   # 4. List user stores
   curl -H "Authorization: Bearer YOUR_TOKEN" [backend]/api/stores
   ```

3. **SplitSet Features Test**:
   ```bash
   # 5. Get products from store
   curl -H "Authorization: Bearer YOUR_TOKEN" [backend]/api/products
   
   # 6. Process a set product
   curl -X POST [backend]/api/sets/process/PRODUCT_ID -H "Authorization: Bearer YOUR_TOKEN"
   
   # 7. Get analytics
   curl -H "Authorization: Bearer YOUR_TOKEN" [backend]/api/analytics/STORE_ID/summary
   ```

## 🚀 **Quick Test Script**

Save this as `test-app.js` and run with `node test-app.js`:

```javascript
const axios = require('axios');

const API_BASE = 'https://splitset-backend.onrender.com';

async function testSplitSetApp() {
  try {
    console.log('🧪 Testing SplitSet App...');
    
    // 1. Health check
    console.log('\n1. Health Check...');
    const health = await axios.get(`${API_BASE}/health`);
    console.log('✅ Health:', health.data.status);
    
    // 2. Register test user
    console.log('\n2. Register Test User...');
    const registerData = {
      email: `test-${Date.now()}@example.com`,
      password: 'TestPassword123!',
      firstName: 'Test',
      lastName: 'User'
    };
    
    const register = await axios.post(`${API_BASE}/api/auth/register`, registerData);
    console.log('✅ User registered:', register.data.user.email);
    
    const token = register.data.token;
    
    // 3. Get user info
    console.log('\n3. Get User Info...');
    const user = await axios.get(`${API_BASE}/api/auth/me`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ User info:', user.data.user.email);
    
    // 4. List stores (should be empty)
    console.log('\n4. List Stores...');
    const stores = await axios.get(`${API_BASE}/api/stores`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ Stores:', stores.data.length);
    
    console.log('\n🎉 All tests passed! SplitSet is working.');
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

testSplitSetApp();
```

## 🎯 **Next Steps**

1. **Wait for Render deployment** to complete (check dashboard)
2. **Test health endpoints** to ensure backend is running
3. **Try logging in** with existing users or create new ones
4. **Add a Shopify store** to test full functionality
5. **Test SplitSet features** (product splitting, analytics, etc.)

Your database has users ready - you just need the backend to be responsive! 🚀
