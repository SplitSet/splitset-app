# 🚀 SplitSet - Beginner's Deployment Guide (Cheapest & Easiest)

**Perfect for first-time deployment! Deploy your SplitSet app in 15 minutes for just $5-10/month.**

## 💰 **Cost Breakdown (Monthly)**
- **Railway App**: $5/month (includes 500 hours, auto-sleeps when not used)
- **PostgreSQL Database**: $0/month (Railway free tier: 1GB)
- **Redis**: $0/month (Railway free tier: 100MB)
- **Domain** (optional): $10/year (~$1/month)
- **Total**: **$5-6/month** 💰

## 🎯 **Why Railway?** (Recommended for Beginners)
- ✅ **Zero server management** - just click deploy
- ✅ **Automatic HTTPS** - SSL certificates included
- ✅ **Free database** - PostgreSQL + Redis included
- ✅ **Git integration** - deploys on every push
- ✅ **Environment variables** - easy setup in web UI
- ✅ **Monitoring included** - health checks and logs
- ✅ **Scales automatically** - handles traffic spikes

---

## 🚀 **Step-by-Step Deployment (15 minutes)**

### **Step 1: Prepare Your Code (2 minutes)**

```bash
cd /Users/ankurpandey/Desktop/GST

# Generate production secrets
./scripts/setup-production.sh

# When prompted, press 'y' to continue
# This creates secure passwords and encryption keys
```

**What this does**:
- Creates `.env.production` with secure secrets
- Generates JWT secret, encryption key, database passwords
- Prepares your app for deployment

### **Step 2: Create Railway Account (1 minute)**

1. **Go to**: [railway.app](https://railway.app)
2. **Click**: "Start a New Project"
3. **Sign up** with GitHub (recommended) or email
4. **Verify** your account

### **Step 3: Connect Your Code (2 minutes)**

#### **Option A: GitHub (Recommended)**
1. **Push your code to GitHub**:
   ```bash
   cd /Users/ankurpandey/Desktop/GST
   git init
   git add .
   git commit -m "Initial SplitSet deployment"
   
   # Create new GitHub repo and push
   # (Replace with your actual repo URL)
   git remote add origin https://github.com/yourusername/splitset.git
   git push -u origin main
   ```

2. **In Railway**:
   - Click "Deploy from GitHub repo"
   - Select your SplitSet repository
   - Choose the `backend` folder as root directory

#### **Option B: Direct Upload (If no GitHub)**
1. **In Railway**: Click "Deploy from local folder"
2. **Select**: `/Users/ankurpandey/Desktop/GST/backend` folder
3. **Upload**: Railway will upload your code

### **Step 4: Add Database Services (3 minutes)**

1. **In Railway Project Dashboard**:
   - Click "➕ New Service"
   - Select "Database" → "PostgreSQL"
   - Click "Add PostgreSQL"

2. **Add Redis**:
   - Click "➕ New Service" again
   - Select "Database" → "Redis"  
   - Click "Add Redis"

3. **Wait 1-2 minutes** for databases to initialize

### **Step 5: Configure Environment Variables (5 minutes)**

1. **Click on your main app service** (not the databases)
2. **Go to "Variables" tab**
3. **Add these variables** (copy from your `.env.production` file):

```bash
# Required Variables (copy the generated values from .env.production)
NODE_ENV=production
PORT=5000
JWT_SECRET=your-generated-jwt-secret-from-env-file
ENCRYPTION_KEY=your-generated-encryption-key-from-env-file

# Database (Railway will auto-populate these)
DATABASE_URL=${{Postgres.DATABASE_URL}}
REDIS_HOST=${{Redis.REDIS_HOST}}
REDIS_PORT=${{Redis.REDIS_PORT}}
REDIS_PASSWORD=${{Redis.REDIS_PASSWORD}}

# Your domain (update after deployment)
FRONTEND_URL=https://your-app-name.up.railway.app

# Security
BCRYPT_ROUNDS=12
MAX_LOGIN_ATTEMPTS=5
LOCKOUT_MINUTES=30

# Analytics
ANALYTICS_REFRESH_MINUTES=30
LOG_LEVEL=info
```

**Important**: Replace the JWT_SECRET and ENCRYPTION_KEY with the values from your `.env.production` file!

### **Step 6: Deploy! (2 minutes)**

1. **Railway automatically deploys** when you add variables
2. **Wait 2-3 minutes** for build to complete
3. **Check deployment logs** in Railway dashboard
4. **Get your app URL**: `https://your-app-name.up.railway.app`

### **Step 7: Test Your Deployment (2 minutes)**

```bash
# Test health endpoint
curl https://your-app-name.up.railway.app/health

# Should return:
# {"success":true,"data":{"status":"healthy",...}}
```

---

## 🧪 **Testing with Your Shopify Store**

### **Step 1: Create Custom App in Shopify (5 minutes)**

1. **Go to your Shopify Admin**
2. **Settings** → **Apps and sales channels**
3. **Develop apps** → **Create an app**
   - **App name**: `SplitSet Analytics`
   - **App developer**: `Your Store`

4. **Configure Admin API scopes**:
   - ✅ `read_products`
   - ✅ `write_products` 
   - ✅ `read_orders`
   - ✅ `read_fulfillments`

5. **Install app** → Copy the **Admin API access token**

### **Step 2: Register Your Store (2 minutes)**

1. **Visit**: `https://your-app-name.up.railway.app/register`
2. **Fill in**:
   - Your name and email
   - Password (8+ characters)
   - Shop domain: `your-store.myshopify.com`
   - Access token: `shpat_xxxxxx` (from Step 1)
3. **Click**: "Create Account"

### **Step 3: Test Product Splitting (5 minutes)**

1. **Login** to your SplitSet dashboard
2. **Go to**: "Set Manager" 
3. **Select a product** to split (preferably a set/outfit)
4. **Configure splitting** options
5. **Click**: "Create Set"
6. **Verify**: New products appear in Shopify with 'splitter' tags

### **Step 4: Test Analytics (10 minutes)**

1. **Create a test order** in your Shopify store with the split products
2. **Mark order as fulfilled** in Shopify admin
3. **Wait 30 minutes** for analytics refresh
4. **Check SplitSet dashboard** → Analytics page
5. **Verify**: Order appears in monthly count

---

## 💡 **Cost Optimization Tips**

### **Free Tier Usage**
- **Railway**: 500 hours/month free (auto-sleeps when inactive)
- **Database**: 1GB PostgreSQL free
- **Redis**: 100MB free
- **Bandwidth**: 100GB/month free

### **How to Stay Under $10/month**
- **Use Railway's sleep feature** - app sleeps when not used
- **Optimize images** - smaller Docker images
- **Efficient queries** - reduce database load
- **Monitor usage** - Railway dashboard shows costs

### **When to Upgrade**
- **>50 stores**: Consider upgrading Railway plan ($20/month)
- **>100 stores**: Consider VPS deployment ($20-30/month)
- **>200 stores**: Enterprise deployment with auto-scaling

---

## 🔧 **Alternative Deployment Options**

### **Option 2: Vercel + PlanetScale (Frontend + Backend)**
**Cost**: $0-20/month
**Setup**: 20 minutes
**Best for**: Developers familiar with Vercel

### **Option 3: DigitalOcean App Platform**  
**Cost**: $5-12/month
**Setup**: 15 minutes
**Best for**: Simple deployment with managed databases

### **Option 4: Heroku (Classic choice)**
**Cost**: $7-25/month  
**Setup**: 10 minutes
**Best for**: Traditional deployment

---

## 🚨 **Troubleshooting**

### **Common Issues & Solutions**

#### **"Build Failed" Error**
```bash
# Check Railway build logs
# Usually missing dependencies or wrong folder
```
**Solution**: Ensure you selected `backend` folder as root

#### **"Database Connection Failed"**
**Solution**: Check that DATABASE_URL variable is set to `${{Postgres.DATABASE_URL}}`

#### **"JWT Secret Error"**
**Solution**: Copy the JWT_SECRET from your `.env.production` file to Railway variables

#### **"Cannot Access App"**
**Solution**: Check that PORT is set to `5000` and app is listening on `0.0.0.0`

### **Getting Help**
- **Railway Docs**: [docs.railway.app](https://docs.railway.app)
- **Railway Discord**: Active community support
- **SplitSet Logs**: Check Railway deployment logs

---

## ✅ **Deployment Checklist**

### **Pre-Deployment**
- [ ] Code is ready in `/Users/ankurpandey/Desktop/GST`
- [ ] Ran `./scripts/setup-production.sh` successfully
- [ ] Have `.env.production` file with secrets
- [ ] Railway account created

### **During Deployment**
- [ ] Connected GitHub repo or uploaded code
- [ ] Added PostgreSQL service
- [ ] Added Redis service
- [ ] Configured all environment variables
- [ ] Deployment completed successfully

### **Post-Deployment Testing**
- [ ] Health check passes: `curl https://your-app.railway.app/health`
- [ ] Created Shopify Custom App
- [ ] Registered first user successfully
- [ ] Can access dashboard
- [ ] Created test product split
- [ ] Analytics tracking works

### **Go-Live**
- [ ] Updated FRONTEND_URL to your actual domain
- [ ] SSL certificate working (automatic with Railway)
- [ ] Monitoring set up
- [ ] Ready to onboard stores! 🎉

---

## 🎉 **You're Ready to Deploy!**

**Total time**: ~15 minutes
**Total cost**: ~$5/month
**Capacity**: 50-100 stores easily

### **Next Steps After Deployment**
1. **Test thoroughly** with your Shopify store
2. **Create documentation** for your store owners
3. **Start onboarding** your first 5-10 stores
4. **Monitor performance** and costs
5. **Scale up** as you grow

**Your SplitSet app will be live and ready to serve store owners with accurate ₹9 billing tracking!** 🚀

Need help with any step? The Railway dashboard has excellent documentation and their Discord community is very helpful for beginners.
