#!/bin/bash

# 🚀 SplitSet Production Configuration Setup Script
# This script helps transition from development to production configuration

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Print functions
print_header() {
    echo -e "${BLUE}=== $1 ===${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Check if we're in the right directory
if [ ! -f "package.json" ] || [ ! -d "backend" ]; then
    print_error "Please run this script from the SplitSet project root directory"
    exit 1
fi

print_header "SplitSet Production Configuration Setup"

# Check current environment
print_info "Checking current configuration..."

if [ -f "backend/.env" ]; then
    NODE_ENV=$(grep "NODE_ENV=" backend/.env | cut -d'=' -f2 || echo "not set")
    print_info "Current NODE_ENV: $NODE_ENV"
    
    if [ "$NODE_ENV" = "development" ]; then
        print_warning "Currently configured for development"
    elif [ "$NODE_ENV" = "production" ]; then
        print_success "Already configured for production"
    else
        print_warning "NODE_ENV not properly set"
    fi
else
    print_warning "No .env file found in backend/"
fi

echo ""
print_header "Production Configuration Checklist"

# Function to generate secure random string
generate_secret() {
    node -e "console.log(require('crypto').randomBytes(32).toString('hex'))" 2>/dev/null || openssl rand -hex 32
}

# Function to generate 32-character key
generate_32char_key() {
    node -e "console.log(require('crypto').randomBytes(16).toString('hex'))" 2>/dev/null || openssl rand -hex 16
}

echo ""
print_info "We'll help you configure the following for production:"
echo "  1. Environment variables"
echo "  2. Database configuration"
echo "  3. Security secrets"
echo "  4. External service URLs"
echo ""

read -p "Do you want to continue with production setup? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    print_info "Setup cancelled."
    exit 0
fi

# Backup existing .env file
if [ -f "backend/.env" ]; then
    print_info "Backing up existing .env file..."
    cp backend/.env backend/.env.backup.$(date +%Y%m%d_%H%M%S)
    print_success "Backup created"
fi

# Generate secrets
print_header "Generating Secure Secrets"
JWT_SECRET=$(generate_secret)
ENCRYPTION_KEY=$(generate_32char_key)
APP_SECRET=$(generate_secret)
WEBHOOK_SECRET=$(generate_secret)

print_success "Secure secrets generated"

# Get production configuration from user
print_header "Production Configuration Input"

echo ""
print_info "Please provide your production configuration details:"

# Database URL
echo ""
print_info "Database Configuration:"
echo "Example: postgresql://user:password@host:5432/database"
read -p "Production Database URL: " DATABASE_URL

# Redis Configuration
echo ""
print_info "Redis Configuration:"
read -p "Redis Host: " REDIS_HOST
read -p "Redis Port (default 6379): " REDIS_PORT
REDIS_PORT=${REDIS_PORT:-6379}
read -p "Redis Password: " REDIS_PASSWORD

# Shopify Configuration
echo ""
print_info "Shopify App Configuration:"
read -p "Shopify API Key: " SHOPIFY_API_KEY
read -p "Shopify API Secret: " SHOPIFY_API_SECRET

# Domain Configuration
echo ""
print_info "Domain Configuration:"
read -p "Frontend URL (https://your-frontend.com): " FRONTEND_URL
read -p "Backend URL (https://your-backend.com): " APP_URL

# Create production .env file
print_header "Creating Production Environment File"

cat > backend/.env << EOF
# === PRODUCTION ENVIRONMENT CONFIGURATION ===
# Generated on $(date)

# === ENVIRONMENT ===
NODE_ENV=production
PORT=5000

# === DATABASE (Production PostgreSQL) ===
DATABASE_URL=${DATABASE_URL}

# === REDIS (Production) ===
REDIS_HOST=${REDIS_HOST}
REDIS_PORT=${REDIS_PORT}
REDIS_PASSWORD=${REDIS_PASSWORD}
REDIS_DB=0

# === SHOPIFY (Production App) ===
SHOPIFY_API_KEY=${SHOPIFY_API_KEY}
SHOPIFY_API_SECRET=${SHOPIFY_API_SECRET}
SHOPIFY_SCOPES=read_products,write_products,read_orders,write_orders,read_customers,write_customers,read_themes,write_themes

# === URLs (Production) ===
FRONTEND_URL=${FRONTEND_URL}
APP_URL=${APP_URL}
REDIRECT_URI=${APP_URL}/auth/callback

# === SECURITY (Production - Auto-Generated) ===
JWT_SECRET=${JWT_SECRET}
ENCRYPTION_KEY=${ENCRYPTION_KEY}
BCRYPT_ROUNDS=12
MAX_LOGIN_ATTEMPTS=5
LOCKOUT_MINUTES=30
APP_SECRET=${APP_SECRET}
WEBHOOK_SECRET=${WEBHOOK_SECRET}

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

# === MONITORING ===
HEALTH_CHECK_TIMEOUT_MS=5000

# === GENERATED SECRETS ===
# JWT_SECRET: ${JWT_SECRET:0:8}... (32 chars)
# ENCRYPTION_KEY: ${ENCRYPTION_KEY:0:8}... (32 chars)  
# APP_SECRET: ${APP_SECRET:0:8}... (64 chars)
# WEBHOOK_SECRET: ${WEBHOOK_SECRET:0:8}... (64 chars)
EOF

print_success "Production .env file created"

# Update frontend proxy configuration for production
print_header "Updating Frontend Configuration"

if [ -f "frontend/src/setupProxy.js" ]; then
    print_info "Updating frontend proxy configuration..."
    
    # Backup existing proxy file
    cp frontend/src/setupProxy.js frontend/src/setupProxy.js.backup
    
    # Update proxy to use production backend URL
    cat > frontend/src/setupProxy.js << EOF
const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  // In production, this proxy won't be used as the frontend will be served statically
  // But we configure it to use the production backend URL for development testing
  app.use(
    '/api',
    createProxyMiddleware({
      target: '${APP_URL}',
      changeOrigin: true,
      secure: true, // Use HTTPS in production
      headers: {
        'Connection': 'keep-alive',
      },
    })
  );
};
EOF
    print_success "Frontend proxy updated for production"
fi

# Database migration check
print_header "Database Setup"

print_info "Testing database connection..."
if command -v node &> /dev/null; then
    cd backend
    if node -e "
        require('dotenv').config();
        const db = require('./db');
        db.raw('SELECT 1')
            .then(() => { console.log('✅ Database connection successful'); process.exit(0); })
            .catch(err => { console.error('❌ Database connection failed:', err.message); process.exit(1); });
    " 2>/dev/null; then
        print_success "Database connection verified"
        
        print_info "Running database migrations..."
        if npx knex migrate:latest 2>/dev/null; then
            print_success "Database migrations completed"
        else
            print_warning "Database migrations failed - you may need to run them manually"
        fi
    else
        print_warning "Database connection failed - please verify your DATABASE_URL"
    fi
    cd ..
else
    print_warning "Node.js not found - skipping database verification"
fi

# Final checklist
print_header "Production Setup Complete"

print_success "Configuration files updated for production"
echo ""
print_info "Next Steps:"
echo "  1. Verify all configuration values in backend/.env"
echo "  2. Test database connectivity"
echo "  3. Test Redis connectivity"  
echo "  4. Deploy to your production environment"
echo "  5. Run health checks"
echo ""

print_warning "Important Security Notes:"
echo "  • Never commit the .env file to version control"
echo "  • Store secrets securely in your deployment platform"
echo "  • Use environment variable injection in production"
echo "  • Regularly rotate secrets"
echo ""

print_info "Configuration Summary:"
echo "  • Environment: production"
echo "  • Database: PostgreSQL (${DATABASE_URL:0:20}...)"
echo "  • Redis: ${REDIS_HOST}:${REDIS_PORT}"
echo "  • Frontend: ${FRONTEND_URL}"
echo "  • Backend: ${APP_URL}"
echo "  • Secrets: Auto-generated and secure"
echo ""

print_header "Verification Commands"
echo ""
print_info "Test your production configuration:"
echo "  Backend health: curl ${APP_URL}/health"
echo "  Database ready: curl ${APP_URL}/ready"
echo "  Shopify test:   curl ${APP_URL}/api/shopify/test-connection"
echo ""

print_success "🚀 SplitSet is now configured for production!"
print_info "Review the PRODUCTION_SETUP_GUIDE.md for detailed deployment instructions."
