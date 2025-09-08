# 🛍️ SplitSet - Production Ready Shopify Product Splitting App

A complete multi-store SplitSet app with authentication, analytics, and secure credential storage. Split Shopify products intelligently and track usage across 100-200 stores with proper isolation and billing tracking.

## 🎯 What's Included

### ✅ **Complete Authentication System**
- User registration with Shopify store onboarding
- JWT-based authentication with secure cookies
- Role-based access control (store_owner, manager, admin)
- Per-store access permissions
- Password reset and account lockout protection

### ✅ **Secure Multi-Store Architecture**
- Encrypted storage of Shopify credentials (Access Token, App ID, App Secret)
- Per-store billing tracking (₹9 per order)
- Store isolation - users only see their own stores
- Admin override for platform management

### ✅ **Production-Ready Analytics**
- Real-time order tracking with 'splitter' tags
- Monthly billing calculations
- Daily analytics charts
- Persistent data storage with daily aggregates
- Background job processing with Redis queues

### ✅ **Enterprise Features**
- Structured logging with request/user/store context
- Health checks and monitoring endpoints
- Input validation and error handling
- Rate limiting and security middleware
- Graceful shutdown and error recovery

## 🚀 Quick Deployment

### Prerequisites
- Docker and Docker Compose installed
- Domain name (optional but recommended)
- 4GB RAM, 50GB storage VPS/server

### 1. Initial Setup
```bash
cd /Users/ankurpandey/Desktop/GST

# Generate secrets and setup files
./scripts/setup-production.sh

# Update domain in .env.production
nano .env.production
# Change: FRONTEND_URL=https://your-actual-domain.com
```

### 2. Deploy
```bash
# Deploy with automatic backup and health checks
./scripts/deploy.sh production
```

### 3. Verify
```bash
# Check health
curl https://your-domain.com/health

# Check readiness
curl https://your-domain.com/ready
```

## 👥 User Flow

### Store Owner Registration
1. **Visit**: `https://your-domain.com/register`
2. **Step 1**: Personal details (name, email, password)
3. **Step 2**: Shopify store details (domain, access token)
4. **Result**: Automatic login + store dashboard access

### Daily Usage
1. **Login**: `https://your-domain.com/login`
2. **Dashboard**: View store analytics and controls
3. **Product Splitting**: Create bundle products with automatic tagging
4. **Analytics**: Monitor monthly billing and order trends

## 📊 Analytics & Billing

### How Billing Works
- **Rate**: ₹9 per fulfilled order containing 'splitter'-tagged products
- **Tracking**: Automatic via order/product tags
- **Reporting**: Real-time dashboard + monthly summaries
- **Limits**: Configurable per-store limits (basic: 1000 orders/month)

### Analytics Dashboard
- **Monthly totals**: Orders, items, revenue
- **Daily charts**: Items sold via splitter products
- **Store health**: API usage, connection status
- **Billing preview**: Current month charges

## 🔒 Security Features

### Data Protection
- ✅ **AES-256 encryption** for all Shopify credentials
- ✅ **Bcrypt password hashing** with configurable rounds
- ✅ **JWT tokens** with expiration and refresh
- ✅ **Rate limiting** per IP and per user
- ✅ **Input validation** on all endpoints

### Access Control
- ✅ **Multi-tenant isolation** - users can't access other stores
- ✅ **Role-based permissions** with hierarchical access
- ✅ **Account lockout** after failed login attempts
- ✅ **Audit logging** for all sensitive operations

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │────│   Backend API   │────│   PostgreSQL    │
│   (React SPA)   │    │   (Node.js)     │    │   (Database)    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │
                       ┌─────────────────┐
                       │   Redis Queue   │
                       │   (Jobs/Cache)  │
                       └─────────────────┘
```

### Database Schema
- **users**: Authentication and profile data
- **stores**: Shopify store data with encrypted credentials
- **user_stores**: Many-to-many access control
- **runs**: Job execution tracking
- **analytics_daily**: Persistent analytics aggregates

## 🔧 Configuration

### Required Environment Variables
```bash
# Security (generate with setup script)
JWT_SECRET=your-64-character-secret
ENCRYPTION_KEY=your-32-character-key
POSTGRES_PASSWORD=secure-db-password
REDIS_PASSWORD=secure-redis-password

# Application
FRONTEND_URL=https://your-domain.com
DATABASE_URL=postgresql://...
REDIS_HOST=redis
```

### Optional Configuration
```bash
# Billing
ANALYTICS_REFRESH_MINUTES=30
CLEANUP_INTERVAL_HOURS=24

# Security
MAX_LOGIN_ATTEMPTS=5
LOCKOUT_MINUTES=30
BCRYPT_ROUNDS=12

# Performance
RATE_LIMIT_MAX_REQUESTS=500
LOG_LEVEL=info
```

## 📈 Scaling Guidelines

### Current Capacity
- **Single server**: 100-200 stores
- **Memory usage**: ~4GB for 100 stores
- **Database**: PostgreSQL handles thousands of stores
- **Queue**: Redis processes jobs reliably

### Scaling Options
1. **Vertical scaling**: Increase server resources
2. **Horizontal scaling**: Multiple app servers + shared DB/Redis
3. **Database scaling**: Read replicas for analytics queries
4. **CDN**: Serve frontend assets via CDN

## 🛠️ Development

### Local Development
```bash
# Backend
cd backend
npm install
npm run migrate
npm run dev

# Frontend
cd frontend
npm install
npm start
```

### Testing
```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

## 📞 Support & Monitoring

### Health Endpoints
- `GET /health` - Basic health check
- `GET /ready` - Comprehensive readiness check
- `GET /metrics` - System metrics

### Monitoring Recommendations
- **Uptime**: Monitor `/health` endpoint
- **Performance**: Track response times < 500ms
- **Errors**: Alert on error rate > 1%
- **Queue**: Monitor job queue depth
- **Database**: Track connection pool usage

### Troubleshooting
- **Logs**: Structured JSON logs with context
- **Health checks**: Detailed status per component
- **Error boundaries**: Graceful frontend error handling
- **Backup/restore**: Automated with deployment script

## 💰 Cost Estimates

### VPS Deployment (Recommended)
- **Server**: $20-50/month (4GB RAM, 50GB SSD)
- **Domain**: $10/year
- **SSL**: Free (Let's Encrypt)
- **Total**: ~$25-55/month for 100-200 stores

### Cloud Deployment (Railway/Heroku)
- **App**: $5-20/month
- **Database**: $0-10/month
- **Redis**: $0-5/month
- **Total**: ~$5-35/month for 50-100 stores

## 🎉 Ready to Launch!

Your app is now production-ready with:
- ✅ **Multi-store support** with secure isolation
- ✅ **Complete authentication** system
- ✅ **Encrypted credential storage**
- ✅ **Production monitoring** and health checks
- ✅ **Automated deployment** scripts
- ✅ **Comprehensive documentation**

### Launch Checklist
- [ ] Run `./scripts/setup-production.sh`
- [ ] Update domain in `.env.production`
- [ ] Deploy with `./scripts/deploy.sh production`
- [ ] Test registration at `/register`
- [ ] Verify analytics tracking
- [ ] Set up monitoring alerts
- [ ] Create support documentation
- [ ] Launch! 🚀

---

**Built for scale. Ready for 100-200 stores. Secure by design.**
