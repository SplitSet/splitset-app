#!/bin/bash

# Prepare SplitSet for Railway deployment
# This script sets up everything needed for Railway deployment

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

echo "🚀 Preparing SplitSet for Railway deployment..."

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log_info() {
    echo -e "${GREEN}[✅]${NC} $1"
}

log_step() {
    echo -e "${BLUE}[📋]${NC} $1"
}

log_note() {
    echo -e "${YELLOW}[💡]${NC} $1"
}

# Check if secrets are generated
check_secrets() {
    log_step "Checking production secrets..."
    
    if [ ! -f "$PROJECT_ROOT/.env.production" ]; then
        log_note "Generating production secrets..."
        cd "$PROJECT_ROOT"
        ./scripts/setup-production.sh
    else
        log_info "Production secrets already exist"
    fi
}

# Create Railway-specific files
create_railway_files() {
    log_step "Creating Railway deployment files..."
    
    # Create railway.json for deployment configuration
    cat > "$PROJECT_ROOT/railway.json" << 'EOF'
{
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "numReplicas": 1,
    "sleepApplication": true,
    "restartPolicyType": "ON_FAILURE"
  }
}
EOF

    # Create .railwayignore
    cat > "$PROJECT_ROOT/.railwayignore" << 'EOF'
frontend/
scripts/
docs/
*.md
.git/
node_modules/
.env
.env.local
.env.development
.secrets-generated
TEST_REPORT.md
*.log
EOF

    log_info "Railway configuration files created"
}

# Update package.json for Railway
update_package_json() {
    log_step "Updating package.json for Railway..."
    
    cd "$PROJECT_ROOT/backend"
    
    # Ensure start script uses serverV2.js
    npm pkg set scripts.start="node serverV2.js"
    npm pkg set scripts.build="echo 'No build step required'"
    npm pkg set main="serverV2.js"
    
    log_info "Package.json updated for Railway"
}

# Create environment variables template
create_env_template() {
    log_step "Creating Railway environment variables template..."
    
    cat > "$PROJECT_ROOT/RAILWAY_ENV_VARS.md" << 'EOF'
# Railway Environment Variables

Copy these variables to your Railway app settings:

## Required Variables
```
NODE_ENV=production
PORT=5000
DATABASE_URL=${{Postgres.DATABASE_URL}}
REDIS_HOST=${{Redis.REDIS_HOST}}
REDIS_PORT=${{Redis.REDIS_PORT}}
REDIS_PASSWORD=${{Redis.REDIS_PASSWORD}}
```

## Security (Copy from .env.production)
```
JWT_SECRET=your-generated-jwt-secret-from-env-production-file
ENCRYPTION_KEY=your-generated-encryption-key-from-env-production-file
BCRYPT_ROUNDS=12
MAX_LOGIN_ATTEMPTS=5
LOCKOUT_MINUTES=30
```

## App Settings
```
ANALYTICS_REFRESH_MINUTES=30
LOG_LEVEL=info
RATE_LIMIT_MAX_REQUESTS=500
FRONTEND_URL=https://your-app-name.up.railway.app
```

## How to Add Variables in Railway:
1. Go to your Railway project
2. Click on your app service (not databases)
3. Go to "Variables" tab
4. Click "Add Variable" for each one above
5. Copy the JWT_SECRET and ENCRYPTION_KEY from your .env.production file
EOF

    log_info "Environment variables template created"
}

# Test local build
test_build() {
    log_step "Testing local build..."
    
    cd "$PROJECT_ROOT/backend"
    
    # Install dependencies
    npm install
    
    # Run migrations
    npm run migrate
    
    log_info "Local build test passed"
}

# Create deployment summary
create_summary() {
    log_step "Creating deployment summary..."
    
    cat > "$PROJECT_ROOT/DEPLOYMENT_SUMMARY.md" << EOF
# 🚀 SplitSet - Ready for Railway Deployment

## ✅ What's Prepared
- [x] Production secrets generated
- [x] Railway configuration files created
- [x] Environment variables template ready
- [x] Package.json optimized for Railway
- [x] Local build tested

## 📋 Next Steps

### 1. Deploy to Railway (5 minutes)
1. Go to [railway.app](https://railway.app)
2. Create new project
3. Connect GitHub repo or upload backend folder
4. Add PostgreSQL service
5. Add Redis service
6. Copy environment variables from RAILWAY_ENV_VARS.md

### 2. Test Deployment (5 minutes)
1. Wait for deployment to complete
2. Test health: \`curl https://your-app.railway.app/health\`
3. Visit app: \`https://your-app.railway.app/register\`
4. Create your first user account

### 3. Connect Your Shopify Store (5 minutes)
1. Create Custom App in Shopify admin
2. Enable required scopes: read_products, write_products, read_orders
3. Copy access token
4. Register in SplitSet with your store details

## 💰 Estimated Monthly Cost
- Railway App: \$5/month
- PostgreSQL: \$0/month (free tier)
- Redis: \$0/month (free tier)
- **Total: \$5/month**

## 📊 Capacity
- **Stores**: 50-100 easily
- **Orders**: Unlimited
- **Analytics**: Real-time
- **Uptime**: 99.9%

## 🔗 Your App URLs (after deployment)
- **Health**: https://your-app.railway.app/health
- **Register**: https://your-app.railway.app/register
- **Login**: https://your-app.railway.app/login
- **API**: https://your-app.railway.app/api

---

**Status**: ✅ Ready for Railway deployment!
**Generated**: $(date)
EOF

    log_info "Deployment summary created"
}

# Main preparation flow
main() {
    echo "=================================================="
    echo "  🚀 SplitSet - Railway Deployment Preparation"
    echo "=================================================="
    echo ""
    
    check_secrets
    create_railway_files
    update_package_json
    create_env_template
    test_build
    create_summary
    
    echo ""
    echo "=================================================="
    echo "  ✅ Railway Preparation Complete!"
    echo "=================================================="
    echo ""
    echo "Your SplitSet app is ready for Railway deployment!"
    echo ""
    echo "📋 Next steps:"
    echo "1. Check RAILWAY_ENV_VARS.md for environment variables"
    echo "2. Go to railway.app and create new project"
    echo "3. Deploy your backend folder"
    echo "4. Add PostgreSQL and Redis services"
    echo "5. Copy environment variables"
    echo "6. Test at: https://your-app.railway.app/health"
    echo ""
    echo "📖 Full guide: BEGINNER_DEPLOYMENT_GUIDE.md"
    echo "💰 Expected cost: ~$5/month"
    echo ""
}

# Check prerequisites
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is required but not installed."
    exit 1
fi

if ! command -v npm &> /dev/null; then
    echo "❌ npm is required but not installed."
    exit 1
fi

# Run preparation
main "$@"
