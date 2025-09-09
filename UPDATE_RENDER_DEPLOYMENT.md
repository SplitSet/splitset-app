# 🔄 Update Your Existing Render Deployment

You're right - you already have SplitSet deployed on Render! Here's how to update it with the new production configuration.

## 📋 Current Deployment Status

- ✅ **Backend**: `https://splitset-backend.onrender.com` (deployed)
- ✅ **Database**: PostgreSQL on Render (connected)
- ✅ **Redis**: Redis on Render (connected)
- ⚠️ **Environment Variables**: Need updating with new production config

## 🔧 Step 1: Update Environment Variables on Render

1. **Go to Render Dashboard**: https://dashboard.render.com
2. **Find your backend service** (probably named `splitset-backend`)
3. **Click on your service** → **Environment tab**
4. **Update/Add these variables**:

```env
# Core Environment
NODE_ENV=production
PORT=5000

# Database (your existing PostgreSQL)
DATABASE_URL=postgresql://splitset_production_user:ByJwpQYIascAovCe4DeSIjGFEmpLJ4D4@dpg-d2vkkr8dl3ps7399sc0g-a.oregon-postgres.render.com/splitset_production

# Redis (your new Redis instance)
REDIS_URL=rediss://red-d308hk6r433s73fvmh4g:GFxuxrpfcUmtYJNL752mNfxi7TmnQoGc@oregon-keyvalue.render.com:6379
REDIS_HOST=oregon-keyvalue.render.com
REDIS_PORT=6379
REDIS_PASSWORD=GFxuxrpfcUmtYJNL752mNfxi7TmnQoGc
REDIS_DB=0

# URLs (match your actual deployment)
FRONTEND_URL=https://splitset.in
APP_URL=https://splitset-backend.onrender.com
REDIRECT_URI=https://splitset-backend.onrender.com/auth/callback

# Security (NEW - Generated secrets)
JWT_SECRET=d7564645039068ad9d37f6fc5f5119389320ffe952aa8388a95931a9e06d4568
ENCRYPTION_KEY=a5df7cae19272feeed6a475c672ec770
BCRYPT_ROUNDS=12
MAX_LOGIN_ATTEMPTS=5
LOCKOUT_MINUTES=30
APP_SECRET=00b5742a36821a65f732ac36a383fa9a14783685e2ddac1f766e1329c7f2a3ce
WEBHOOK_SECRET=4863a964483e10571e5e57e671d7be80c84dc679d4fae309347321c084e802fc

# Performance
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=500
ANALYTICS_REFRESH_MINUTES=30
ENABLE_CLEANUP=true
CLEANUP_INTERVAL_HOURS=24

# Logging
LOG_LEVEL=info
ENABLE_REQUEST_LOGGING=false
ENABLE_PERFORMANCE_LOGGING=true

# Monitoring
HEALTH_CHECK_TIMEOUT_MS=5000

# Shopify (leave empty - per-user credentials)
SHOPIFY_API_KEY=
SHOPIFY_API_SECRET=
SHOPIFY_SCOPES=read_products,write_products,read_orders,write_orders,read_customers,write_customers,read_themes,write_themes
```

## 🚀 Step 2: Trigger Redeploy

After updating environment variables:

1. **Go to "Deploy" tab** in your Render service
2. **Click "Trigger Deploy"** or push a commit to trigger auto-deploy
3. **Wait for deployment** to complete (usually 2-3 minutes)

## ✅ Step 3: Verify Updated Deployment

After redeployment, test these endpoints:

```bash
# Health check
curl https://splitset-backend.onrender.com/health

# Should return:
# {
#   "success": true,
#   "status": "OK",
#   "timestamp": "...",
#   "uptime": ...,
#   "message": "SplitSet API is running"
# }

# Database check
curl https://splitset-backend.onrender.com/ready

# Redis check (should work now with new Redis config)
```

## 🎯 What This Update Accomplishes

### ✅ **Before Update**
- Backend deployed but possibly using development config
- No Redis connection
- Basic JWT secrets
- Limited functionality

### ✅ **After Update**
- Production PostgreSQL database with all tables
- Production Redis for caching and sessions
- Secure JWT and encryption keys
- Multi-store authentication ready
- Analytics and billing tracking enabled
- Component management functional
- All production features unlocked

## 🔧 Alternative: Quick Environment Update Script

If you prefer to update via CLI:

```bash
# Install Render CLI (if not installed)
npm install -g @render-com/cli

# Login to Render
render login

# List your services
render services list

# Update environment variables (replace SERVICE_ID with your actual service ID)
render env set NODE_ENV=production --service-id=YOUR_SERVICE_ID
render env set DATABASE_URL="postgresql://splitset_production_user:ByJwpQYIascAovCe4DeSIjGFEmpLJ4D4@dpg-d2vkkr8dl3ps7399sc0g-a.oregon-postgres.render.com/splitset_production" --service-id=YOUR_SERVICE_ID
render env set REDIS_URL="rediss://red-d308hk6r433s73fvmh4g:GFxuxrpfcUmtYJNL752mNfxi7TmnQoGc@oregon-keyvalue.render.com:6379" --service-id=YOUR_SERVICE_ID
# ... continue with other variables

# Trigger redeploy
render deploy --service-id=YOUR_SERVICE_ID
```

## 📱 Frontend Update (Optional)

Your frontend is already configured correctly to use `https://splitset-backend.onrender.com`. No changes needed!

## 🎉 Result

After this update, your SplitSet application will be **fully production-ready** with:

- ✅ **Multi-store Shopify integration**
- ✅ **User authentication and role management**
- ✅ **Automated product splitting**
- ✅ **Real-time analytics with Redis caching**
- ✅ **Component visibility management**
- ✅ **Secure credential encryption**
- ✅ **Production-grade performance**

**Your existing deployment just needs the environment variables updated to unlock all the production features!** 🚀

---

**Next Steps:**
1. Update environment variables on Render dashboard
2. Trigger redeploy
3. Test the updated application
4. Start onboarding Shopify stores!
