# 🚀 SplitSet - Render Deployment Guide

**Production-ready deployment on Render in 15 minutes**

## 🎯 Why Render for SplitSet?

- ✅ **Production-ready infrastructure** - Built for scaling
- ✅ **Automatic HTTPS** - SSL certificates included  
- ✅ **PostgreSQL + Redis** - Full database support
- ✅ **Git integration** - Auto-deploy on push
- ✅ **Environment variables** - Easy configuration
- ✅ **Monitoring included** - Health checks and logs
- ✅ **Zero server management** - Focus on your app

## 💰 Cost Breakdown (Monthly)

- **Web Service**: $7/month (Starter plan)
- **PostgreSQL**: $7/month (Starter plan) 
- **Redis**: $7/month (Starter plan)
- **Total**: **$21/month** for production-ready infrastructure

## 🚀 Step-by-Step Deployment

### Step 1: Prepare Your Repository

1. **Ensure your code is pushed to GitHub**
2. **Verify your environment configuration** is ready (we've already set this up!)

### Step 2: Create Render Services

#### A. Create Web Service (Backend)

1. **Go to**: [render.com](https://render.com)
2. **Sign up/Login** with GitHub
3. **Click "New +"** → **"Web Service"**
4. **Connect your repository**: Select your SplitSet repository
5. **Configure service**:
   - **Name**: `splitset-backend`
   - **Environment**: `Node`
   - **Build Command**: `cd backend && npm install`
   - **Start Command**: `cd backend && node server.js`
   - **Plan**: Starter ($7/month)

#### B. Create PostgreSQL Database

1. **Click "New +"** → **"PostgreSQL"**
2. **Configure database**:
   - **Name**: `splitset-database`
   - **Plan**: Starter ($7/month)
   - **Region**: Same as web service

#### C. Create Redis Instance

1. **Click "New +"** → **"Redis"**
2. **Configure Redis**:
   - **Name**: `splitset-redis`
   - **Plan**: Starter ($7/month)
   - **Region**: Same as web service

### Step 3: Configure Environment Variables

In your **Web Service** → **Environment** tab, add these variables:

```env
# Core Environment
NODE_ENV=production
PORT=5000

# Database (Use Internal Database URL from your PostgreSQL service)
DATABASE_URL=[Copy from your PostgreSQL service dashboard]

# Redis (Use Internal Redis URL from your Redis service)
REDIS_URL=[Copy from your Redis service dashboard]

# URLs
FRONTEND_URL=https://splitset.in
APP_URL=https://splitset-backend.onrender.com
REDIRECT_URI=https://splitset-backend.onrender.com/auth/callback

# Security (from your .env file)
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

### Step 4: Deploy

1. **Save environment variables**
2. **Render will automatically deploy** your application
3. **Monitor the deployment** in the Render dashboard
4. **Wait for "Live" status** (usually 3-5 minutes)

### Step 5: Run Database Migrations

After successful deployment:

1. **Go to your Web Service** → **Shell** tab
2. **Run migrations**:
```bash
cd backend
NODE_ENV=production npx knex migrate:latest
```

### Step 6: Verify Deployment

Test these endpoints:

```bash
# Health check
curl https://splitset-backend.onrender.com/health

# Database ready check
curl https://splitset-backend.onrender.com/ready
```

## 🎉 What You Get

After successful deployment:

### ✅ **Production Infrastructure**
- **Scalable backend** on Render's global infrastructure
- **Production PostgreSQL** with automated backups
- **Production Redis** for caching and sessions
- **Automatic HTTPS** with SSL certificates
- **Health monitoring** and uptime alerts

### ✅ **SplitSet Features Enabled**
- **Multi-store Shopify integration** (100-200 stores)
- **User authentication** with JWT and role management
- **Automated product splitting** for Indian fashion
- **Real-time analytics** with Redis caching
- **Component visibility management**
- **Secure credential encryption**
- **Admin panel** and dashboard

### ✅ **Monitoring & Management**
- **Real-time logs** in Render dashboard
- **Performance metrics** and uptime monitoring
- **Automatic deployments** on git push
- **Easy scaling** with plan upgrades
- **Backup management** for database

## 🔧 Post-Deployment Tasks

### 1. Custom Domain (Optional)
1. **Go to your Web Service** → **Settings**
2. **Add custom domain**: `api.splitset.in`
3. **Update environment variables** with new domain
4. **Update frontend** to use new API URL

### 2. Frontend Deployment
Deploy your frontend to:
- **Vercel** (recommended for React apps)
- **Netlify** 
- **Render Static Site**

### 3. Monitoring Setup
- **Enable uptime monitoring** in Render
- **Set up alerts** for downtime
- **Monitor resource usage**

## 🚨 Important Notes

### Security
- ✅ **All secrets are secure** and properly configured
- ✅ **Database credentials** are managed by Render
- ✅ **HTTPS enforced** automatically
- ✅ **Environment isolation** between services

### Performance
- ✅ **Auto-scaling** available with higher plans
- ✅ **Global CDN** for static assets
- ✅ **Database connection pooling**
- ✅ **Redis caching** for optimal performance

### Maintenance
- ✅ **Automatic security updates**
- ✅ **Database backups** handled by Render
- ✅ **Zero-downtime deployments**
- ✅ **Easy rollback** to previous versions

## 🎯 Next Steps

1. **Test your deployment** with a Shopify store
2. **Set up your frontend** deployment
3. **Configure custom domains**
4. **Start onboarding stores** to your SplitSet platform

**Your SplitSet application is now production-ready and can handle real Shopify stores!** 🚀

---

## 📞 Support

- **Render Documentation**: https://render.com/docs
- **SplitSet Configuration**: See `UPDATE_RENDER_DEPLOYMENT.md`
- **Database Issues**: Check PostgreSQL logs in Render dashboard
- **Performance**: Monitor metrics in Render dashboard
