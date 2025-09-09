# 🚀 SplitSet Production Setup Guide

## 📋 Current Status Analysis

Based on the codebase analysis, here's what needs to be configured for **production-only** deployment:

### ✅ What's Already Production-Ready
- **Database**: Configured for PostgreSQL in production/staging environments
- **Redis**: Production Redis configuration available
- **Security**: JWT, encryption, and authentication systems in place
- **Monitoring**: Health checks and analytics systems implemented
- **Docker**: Production containerization ready
- **Railway**: Deployment configuration available

### ⚠️ What Needs Production Configuration

## 🔧 Step 1: Environment Configuration

### Current Environment File Status
```bash
backend/.env (current):
- JWT_SECRET=test-secret-key-for-development-only-32chars
- ENCRYPTION_KEY=test-encryption-key-for-dev-only-32chars  
- NODE_ENV=development
- PORT=5001
```

### Required Production Environment Variables

Create or update `backend/.env` with these production values:

```env
# === ENVIRONMENT ===
NODE_ENV=production
PORT=5000

# === DATABASE (Production PostgreSQL) ===
DATABASE_URL=postgresql://splitset_user:SECURE_PASSWORD@production-db-host:5432/splitset_production

# === REDIS (Production) ===
REDIS_HOST=production-redis-host
REDIS_PORT=6379
REDIS_PASSWORD=SECURE_REDIS_PASSWORD
REDIS_DB=0

# === SHOPIFY (Production App) ===
SHOPIFY_API_KEY=your-production-shopify-api-key
SHOPIFY_API_SECRET=your-production-shopify-api-secret
SHOPIFY_SCOPES=read_products,write_products,read_orders,write_orders,read_customers,write_customers,read_themes,write_themes

# === URLs (Production) ===
FRONTEND_URL=https://your-production-frontend.com
APP_URL=https://your-production-backend.com
REDIRECT_URI=https://your-production-backend.com/auth/callback

# === SECURITY (Production) ===
JWT_SECRET=GENERATE-32-CHAR-SECURE-SECRET-FOR-PRODUCTION
ENCRYPTION_KEY=GENERATE-32-CHAR-ENCRYPTION-KEY-FOR-PROD
BCRYPT_ROUNDS=12
MAX_LOGIN_ATTEMPTS=5
LOCKOUT_MINUTES=30
APP_SECRET=GENERATE-WEBHOOK-SECRET-FOR-PRODUCTION
WEBHOOK_SECRET=GENERATE-WEBHOOK-SECRET-FOR-SHOPIFY

# === PERFORMANCE ===
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=500
ANALYTICS_REFRESH_MINUTES=30
ENABLE_CLEANUP=true
CLEANUP_INTERVAL_HOURS=24

# === LOGGING ===
LOG_LEVEL=info
ENABLE_REQUEST_LOGGING=false
ENABLE_PERFORMANCE_LOGGING=true
```

## 🗄️ Step 2: Database Setup (Production PostgreSQL)

### Current Database Configuration
- **Development**: SQLite (`backend/data/dev.db`)
- **Production**: PostgreSQL (configured but needs setup)

### Setup Production Database

1. **Create Production PostgreSQL Database**:
```sql
-- Connect to your production PostgreSQL server
CREATE DATABASE splitset_production;
CREATE USER splitset_user WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE splitset_production TO splitset_user;
```

2. **Run Migrations**:
```bash
cd backend
NODE_ENV=production npx knex migrate:latest
```

3. **Verify Database**:
```bash
NODE_ENV=production node -e "
const db = require('./db');
db.raw('SELECT 1').then(() => console.log('✅ Database connected')).catch(console.error);
"
```

## 🔴 Step 3: Redis Setup (Production)

### Setup Production Redis
```bash
# Install Redis (Ubuntu/Debian)
sudo apt update
sudo apt install redis-server

# Configure Redis for production
sudo nano /etc/redis/redis.conf
# Set: requirepass your_secure_redis_password
# Set: bind 127.0.0.1 (or your production IP)

# Start Redis
sudo systemctl start redis-server
sudo systemctl enable redis-server

# Test connection
redis-cli -a your_secure_redis_password ping
```

## 🛍️ Step 4: Shopify App Configuration

### Create Production Shopify App
1. Go to [Shopify Partners Dashboard](https://partners.shopify.com/)
2. Create new app: "SplitSet Production"
3. Configure scopes:
   - `read_products, write_products`
   - `read_orders, write_orders`
   - `read_customers, write_customers`
   - `read_themes, write_themes`
4. Set app URLs:
   - App URL: `https://your-production-backend.com`
   - Allowed redirection URLs: `https://your-production-backend.com/auth/callback`

### Update Environment Variables
```env
SHOPIFY_API_KEY=your_production_api_key
SHOPIFY_API_SECRET=your_production_api_secret
```

## 🌐 Step 5: Domain & SSL Setup

### Frontend Domain Configuration
Update `FRONTEND_URL` in environment variables:
```env
FRONTEND_URL=https://splitset-app.yourdomain.com
```

### Backend Domain Configuration
Update `APP_URL` in environment variables:
```env
APP_URL=https://splitset-api.yourdomain.com
```

### SSL Certificate Setup
Ensure both domains have valid SSL certificates (Let's Encrypt recommended).

## 🚀 Step 6: Deployment Options

### Option A: Railway Deployment
```bash
# Use existing Railway configuration
railway login
railway link
railway up

# Set environment variables in Railway dashboard
# Copy variables from your production .env file
```

### Option B: Docker Production Deployment
```bash
# Use existing Docker configuration
docker-compose -f docker-compose.prod.yml up -d

# Check health
curl https://your-production-backend.com/health
```

### Option C: Manual Server Deployment
```bash
# Install Node.js 18+ on production server
# Clone repository
git clone [your-repo-url] /var/www/splitset
cd /var/www/splitset

# Install dependencies
npm install
cd backend && npm install
cd ../frontend && npm install && npm run build

# Setup PM2 for process management
npm install -g pm2
pm2 start backend/server.js --name splitset-backend
pm2 startup
pm2 save
```

## 🔒 Step 7: Security Hardening

### Generate Secure Secrets
```bash
# Generate JWT secret (32+ characters)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Generate encryption key (32 characters exactly)
node -e "console.log(require('crypto').randomBytes(16).toString('hex'))"

# Generate webhook secrets
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Update Production Environment
Replace all placeholder secrets with generated values.

## 📊 Step 8: Monitoring Setup

### Health Check Endpoints
- Backend Health: `https://your-backend.com/health`
- Database Status: `https://your-backend.com/ready`

### Set Up Monitoring (Optional)
```env
BETTER_STACK_TOKEN=your_better_stack_token
PAPERTRAIL_TOKEN=your_papertrail_token
```

## ✅ Step 9: Production Verification

### Pre-Launch Checklist
- [ ] Environment variables set to production values
- [ ] Database migrated and accessible
- [ ] Redis connected and working
- [ ] Shopify app configured with production credentials
- [ ] SSL certificates installed and valid
- [ ] Health checks passing
- [ ] All secrets generated and secure
- [ ] Monitoring configured
- [ ] Backup strategy implemented

### Test Production Deployment
```bash
# Health check
curl https://your-backend.com/health

# Database connectivity
curl https://your-backend.com/ready

# Shopify connection
curl https://your-backend.com/api/shopify/test-connection

# Frontend accessibility
curl https://your-frontend.com
```

## 🔄 Step 10: Migration from Development

### Data Migration (if needed)
```bash
# Export development data
sqlite3 backend/data/dev.db .dump > dev_data.sql

# Import to PostgreSQL (manual review recommended)
# Manually review and import only necessary data
```

### Switch Environment
1. Update `NODE_ENV=production` in all environments
2. Restart all services
3. Verify all connections
4. Test core functionality

## 🚨 Important Production Notes

### Security Considerations
- **Never use development secrets in production**
- **All communication must use HTTPS**
- **Database must be on private network**
- **Regular security updates required**

### Performance Considerations
- **Enable Redis caching**
- **Configure proper rate limiting**
- **Monitor resource usage**
- **Set up log rotation**

### Backup Strategy
- **Daily database backups**
- **Configuration file backups**
- **Code repository backups**

## 📞 Support & Troubleshooting

### Common Issues
1. **Database Connection Failed**: Check `DATABASE_URL` and network connectivity
2. **Redis Connection Failed**: Verify Redis service and credentials
3. **Shopify API Errors**: Confirm API keys and scopes
4. **SSL Certificate Issues**: Verify domain configuration and certificate validity

### Logs Location
- Application logs: Check PM2 logs or Docker logs
- Database logs: PostgreSQL logs
- Web server logs: Nginx/Apache logs

---

## 🎯 Next Steps

After completing this setup, your SplitSet application will be running entirely on production infrastructure with:
- ✅ Production PostgreSQL database
- ✅ Production Redis cache
- ✅ Production Shopify app credentials
- ✅ Secure HTTPS communication
- ✅ Professional monitoring and logging
- ✅ Zero dependency on local development resources

**Your app will be ready for production traffic and multiple store deployments!**
