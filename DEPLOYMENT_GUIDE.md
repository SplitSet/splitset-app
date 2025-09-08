# SplitSet - Production Deployment Guide

This guide covers deploying the multi-store SplitSet app to production environments that can handle 100-200 stores.

## 🏗️ Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Load Balancer │────│   App Servers   │────│   Database      │
│   (Nginx/ALB)   │    │   (Node.js)     │    │   (PostgreSQL)  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │
                       ┌─────────────────┐
                       │   Queue/Cache   │
                       │   (Redis)       │
                       └─────────────────┘
```

## 🚀 Deployment Options

### Option 1: Docker Compose (Recommended for VPS)

**Best for**: Single server deployments, VPS, dedicated servers
**Cost**: $20-50/month
**Capacity**: 100-200 stores easily

#### Prerequisites
- Ubuntu 20.04+ or similar Linux distribution
- Docker and Docker Compose installed
- 4GB RAM minimum, 8GB recommended
- 50GB SSD storage minimum

#### Steps

1. **Clone and Setup**
```bash
git clone your-repo-url
cd shopify-bundle-app
```

2. **Configure Environment**
```bash
# Copy and edit production environment
cp backend/env.production .env.production

# Edit the file with your settings
nano .env.production
```

3. **Set Required Environment Variables**
```bash
# Create .env file for Docker Compose
cat > .env << EOF
POSTGRES_PASSWORD=your-secure-db-password
REDIS_PASSWORD=your-secure-redis-password
EOF
```

4. **Deploy**
```bash
# Make deployment script executable
chmod +x scripts/deploy.sh

# Run deployment
./scripts/deploy.sh production
```

5. **Verify Deployment**
```bash
# Check all services are running
docker-compose -f docker-compose.prod.yml ps

# Test health endpoint
curl http://localhost:5000/health

# Check logs
docker-compose -f docker-compose.prod.yml logs -f app
```

### Option 2: Railway (Easiest for beginners)

**Best for**: Quick deployment, minimal DevOps experience
**Cost**: $5-20/month
**Capacity**: 50-100 stores

#### Steps

1. **Connect Repository**
   - Go to [Railway.app](https://railway.app)
   - Connect your GitHub repository
   - Select the backend folder as root

2. **Add Services**
   - PostgreSQL (from Railway marketplace)
   - Redis (from Railway marketplace)

3. **Configure Environment Variables**
```bash
NODE_ENV=production
DATABASE_URL=${{Postgres.DATABASE_URL}}
REDIS_HOST=${{Redis.REDIS_HOST}}
REDIS_PORT=${{Redis.REDIS_PORT}}
REDIS_PASSWORD=${{Redis.REDIS_PASSWORD}}
FRONTEND_URL=https://your-frontend.vercel.app
```

4. **Deploy**
   - Railway auto-deploys on git push
   - Monitor deployment in Railway dashboard

### Option 3: AWS/GCP (Enterprise scale)

**Best for**: 200+ stores, enterprise requirements
**Cost**: $100-500/month
**Capacity**: Unlimited with proper scaling

#### Architecture
- **Compute**: ECS/Cloud Run containers
- **Database**: RDS PostgreSQL/Cloud SQL
- **Cache**: ElastiCache Redis/Memorystore
- **Load Balancer**: ALB/Cloud Load Balancer
- **Storage**: S3/Cloud Storage for logs/backups

#### Steps
1. Use provided Terraform configurations
2. Configure CI/CD pipeline
3. Set up monitoring and alerting
4. Configure auto-scaling

## 🔧 Environment Configuration

### Required Environment Variables

```bash
# Server
NODE_ENV=production
PORT=5000
FRONTEND_URL=https://your-frontend-domain.com

# Database (PostgreSQL for production)
DATABASE_URL=postgresql://user:password@host:5432/database

# Redis (for job queue)
REDIS_HOST=redis-host
REDIS_PORT=6379
REDIS_PASSWORD=secure-password

# Security
BCRYPT_ROUNDS=12
RATE_LIMIT_MAX_REQUESTS=500

# Monitoring (optional)
BETTER_STACK_TOKEN=your-token
PAPERTRAIL_TOKEN=your-token
```

### Optional Environment Variables

```bash
# Analytics
ANALYTICS_REFRESH_MINUTES=30
CLEANUP_INTERVAL_HOURS=24

# Performance
RATE_LIMIT_WINDOW_MS=900000
LOG_LEVEL=info

# Health Checks
HEALTH_CHECK_TIMEOUT_MS=5000
```

## 🗄️ Database Setup

### Initial Migration
```bash
# Run migrations
npm run migrate

# Check migration status
npm run migrate:status
```

### Backup Strategy
```bash
# Daily automated backup
0 2 * * * pg_dump $DATABASE_URL > /backups/daily_$(date +\%Y\%m\%d).sql

# Weekly backup with compression
0 1 * * 0 pg_dump $DATABASE_URL | gzip > /backups/weekly_$(date +\%Y\%m\%d).sql.gz
```

## 📊 Monitoring and Alerting

### Health Endpoints
- `GET /health` - Basic health check
- `GET /ready` - Comprehensive readiness check
- `GET /metrics` - System metrics

### Key Metrics to Monitor
- Response time (< 500ms average)
- Error rate (< 1%)
- Queue depth (< 100 jobs)
- Database connections (< 80% of pool)
- Memory usage (< 80%)
- CPU usage (< 70%)

### Alerting Rules
```yaml
# Response time alert
- alert: HighResponseTime
  expr: avg_response_time > 1000
  for: 5m

# Error rate alert  
- alert: HighErrorRate
  expr: error_rate > 0.05
  for: 2m

# Queue backup alert
- alert: QueueBackup
  expr: queue_depth > 50
  for: 10m
```

## 🔒 Security Checklist

### Pre-deployment
- [ ] Environment variables secured
- [ ] Database credentials rotated
- [ ] Redis password set
- [ ] CORS origins configured
- [ ] Rate limiting enabled
- [ ] Helmet security headers active

### Post-deployment
- [ ] SSL certificate installed
- [ ] Firewall configured
- [ ] Database access restricted
- [ ] Redis access restricted
- [ ] Logs configured (no sensitive data)
- [ ] Backup strategy implemented

## 🚨 Troubleshooting

### Common Issues

#### 1. Database Connection Failed
```bash
# Check database status
docker-compose -f docker-compose.prod.yml exec db pg_isready

# Check connection string
echo $DATABASE_URL

# Test connection manually
psql $DATABASE_URL -c "SELECT 1"
```

#### 2. Redis Connection Failed
```bash
# Check Redis status
docker-compose -f docker-compose.prod.yml exec redis redis-cli ping

# Check Redis logs
docker-compose -f docker-compose.prod.yml logs redis
```

#### 3. High Memory Usage
```bash
# Check memory usage
docker stats

# Restart app container
docker-compose -f docker-compose.prod.yml restart app
```

#### 4. Queue Jobs Stuck
```bash
# Check queue status via API
curl http://localhost:5000/api/analytics/1/queue/stats

# Clear failed jobs
docker-compose -f docker-compose.prod.yml exec redis redis-cli FLUSHDB
```

### Log Analysis
```bash
# View application logs
docker-compose -f docker-compose.prod.yml logs -f app

# Search for errors
docker-compose -f docker-compose.prod.yml logs app | grep ERROR

# Monitor real-time logs
tail -f /var/log/shopify-bundle-app/app.log
```

## 📈 Scaling Guidelines

### Vertical Scaling (Single Server)
- **50 stores**: 2GB RAM, 2 CPU cores
- **100 stores**: 4GB RAM, 4 CPU cores  
- **200 stores**: 8GB RAM, 8 CPU cores

### Horizontal Scaling (Multiple Servers)
- Load balancer with multiple app instances
- Shared PostgreSQL and Redis
- Session-less architecture (stateless)

### Database Scaling
- **Read replicas** for analytics queries
- **Connection pooling** (PgBouncer)
- **Partitioning** by store_id for large datasets

## 🔄 Maintenance

### Daily Tasks
- Monitor error rates and response times
- Check queue depth and failed jobs
- Verify backup completion

### Weekly Tasks  
- Review and rotate logs
- Update dependencies (security patches)
- Performance analysis

### Monthly Tasks
- Database maintenance (VACUUM, ANALYZE)
- Capacity planning review
- Security audit

## 📞 Support

### Runbooks Location
- `/docs/runbooks/` - Operational procedures
- `/docs/api/` - API documentation
- `/docs/troubleshooting/` - Common issues

### Emergency Contacts
- On-call engineer: [contact info]
- Database admin: [contact info]
- DevOps team: [contact info]

### Escalation Procedure
1. Check health endpoints
2. Review recent deployments
3. Check monitoring dashboards
4. Review application logs
5. Contact on-call engineer if unresolved in 30 minutes

---

## 🎯 Quick Start Checklist

For a production deployment in under 30 minutes:

1. [ ] Server provisioned (4GB RAM, 50GB SSD)
2. [ ] Docker and Docker Compose installed
3. [ ] Repository cloned
4. [ ] Environment variables configured
5. [ ] `./scripts/deploy.sh production` executed
6. [ ] Health check passed (`curl http://localhost:5000/health`)
7. [ ] SSL certificate configured (Let's Encrypt recommended)
8. [ ] Monitoring configured
9. [ ] Backup strategy implemented
10. [ ] Documentation updated with server details

**Estimated time**: 20-30 minutes for experienced developers
**Monthly cost**: $20-50 for VPS hosting 100-200 stores
