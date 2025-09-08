#!/bin/bash

# Production setup script for SplitSet App
# This script prepares the app for first-time deployment

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

echo "🚀 Setting up SplitSet app for production..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

log_step() {
    echo -e "${BLUE}[STEP]${NC} $1"
}

# Generate secure secrets
generate_secrets() {
    log_step "Generating secure secrets..."
    
    # Generate JWT secret (64 characters)
    JWT_SECRET=$(openssl rand -hex 32)
    
    # Generate encryption key (32 characters for AES-256)
    ENCRYPTION_KEY=$(openssl rand -hex 32)
    
    # Generate database password
    DB_PASSWORD=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-25)
    
    # Generate Redis password
    REDIS_PASSWORD=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-25)
    
    log_info "✅ Secrets generated successfully"
    
    # Save to temporary file for manual copying
    cat > "$PROJECT_ROOT/.secrets-generated" << EOF
# Generated secrets for production deployment
# IMPORTANT: Copy these to your .env.production file and delete this file!

JWT_SECRET=$JWT_SECRET
ENCRYPTION_KEY=$ENCRYPTION_KEY
POSTGRES_PASSWORD=$DB_PASSWORD
REDIS_PASSWORD=$REDIS_PASSWORD

# Generated on: $(date)
EOF

    log_warn "⚠️  Secrets saved to .secrets-generated file"
    log_warn "⚠️  Copy these to your .env.production and delete the .secrets-generated file!"
}

# Create production environment file
create_production_env() {
    log_step "Creating production environment file..."
    
    if [ ! -f "$PROJECT_ROOT/.secrets-generated" ]; then
        log_error "Secrets file not found. Run generate_secrets first."
        return 1
    fi
    
    # Read generated secrets
    source "$PROJECT_ROOT/.secrets-generated"
    
    cat > "$PROJECT_ROOT/.env.production" << EOF
# Production Environment Configuration
# Generated on: $(date)

# Server Configuration
NODE_ENV=production
PORT=5000
FRONTEND_URL=https://your-frontend-domain.com

# Database Configuration (PostgreSQL for production)
DATABASE_URL=postgresql://postgres:${POSTGRES_PASSWORD}@db:5432/shopify_bundle_app

# Redis Configuration (for job queue)
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=${REDIS_PASSWORD}
REDIS_DB=0

# Authentication & Security
JWT_SECRET=${JWT_SECRET}
JWT_EXPIRES_IN=24h
ENCRYPTION_KEY=${ENCRYPTION_KEY}
BCRYPT_ROUNDS=12
MAX_LOGIN_ATTEMPTS=5
LOCKOUT_MINUTES=30

# Rate Limiting (more restrictive in production)
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=500

# Logging (structured JSON in production)
LOG_LEVEL=info

# Analytics Configuration
ANALYTICS_REFRESH_MINUTES=30
ENABLE_CLEANUP=true
CLEANUP_INTERVAL_HOURS=24

# Health Check Settings
HEALTH_CHECK_TIMEOUT_MS=5000

# Performance
ENABLE_REQUEST_LOGGING=false
ENABLE_PERFORMANCE_LOGGING=true
EOF

    log_info "✅ Production environment file created"
}

# Create Docker Compose environment file
create_docker_env() {
    log_step "Creating Docker Compose environment file..."
    
    if [ ! -f "$PROJECT_ROOT/.secrets-generated" ]; then
        log_error "Secrets file not found. Run generate_secrets first."
        return 1
    fi
    
    # Read generated secrets
    source "$PROJECT_ROOT/.secrets-generated"
    
    cat > "$PROJECT_ROOT/.env" << EOF
# Docker Compose environment variables
POSTGRES_PASSWORD=${DB_PASSWORD}
REDIS_PASSWORD=${REDIS_PASSWORD}
EOF

    log_info "✅ Docker environment file created"
}

# Setup database
setup_database() {
    log_step "Setting up database..."
    
    cd "$PROJECT_ROOT/backend"
    
    # Install dependencies if needed
    if [ ! -d "node_modules" ]; then
        log_info "Installing backend dependencies..."
        npm install
    fi
    
    # Run migrations
    log_info "Running database migrations..."
    npm run migrate
    
    log_info "✅ Database setup complete"
}

# Build frontend
build_frontend() {
    log_step "Building frontend for production..."
    
    cd "$PROJECT_ROOT/frontend"
    
    # Install dependencies if needed
    if [ ! -d "node_modules" ]; then
        log_info "Installing frontend dependencies..."
        npm install
    fi
    
    # Build for production
    log_info "Building frontend..."
    npm run build
    
    log_info "✅ Frontend build complete"
}

# Validate setup
validate_setup() {
    log_step "Validating setup..."
    
    local errors=0
    
    # Check required files
    if [ ! -f "$PROJECT_ROOT/.env.production" ]; then
        log_error "Missing .env.production file"
        ((errors++))
    fi
    
    if [ ! -f "$PROJECT_ROOT/.env" ]; then
        log_error "Missing Docker .env file"
        ((errors++))
    fi
    
    if [ ! -f "$PROJECT_ROOT/docker-compose.prod.yml" ]; then
        log_error "Missing docker-compose.prod.yml file"
        ((errors++))
    fi
    
    if [ ! -f "$PROJECT_ROOT/Dockerfile" ]; then
        log_error "Missing Dockerfile"
        ((errors++))
    fi
    
    # Check backend dependencies
    if [ ! -d "$PROJECT_ROOT/backend/node_modules" ]; then
        log_error "Backend dependencies not installed"
        ((errors++))
    fi
    
    # Check frontend build
    if [ ! -d "$PROJECT_ROOT/frontend/build" ]; then
        log_warn "Frontend not built for production"
    fi
    
    if [ $errors -eq 0 ]; then
        log_info "✅ Setup validation passed"
        return 0
    else
        log_error "❌ Setup validation failed with $errors errors"
        return 1
    fi
}

# Display next steps
show_next_steps() {
    echo ""
    echo "=================================================="
    echo "  🎉 Setup Complete! Next Steps:"
    echo "=================================================="
    echo ""
    echo "1. 🔐 Update your domain in .env.production:"
    echo "   FRONTEND_URL=https://your-actual-domain.com"
    echo ""
    echo "2. 🚀 Deploy using one of these options:"
    echo ""
    echo "   Option A: Docker Compose (VPS/Dedicated Server)"
    echo "   ./scripts/deploy.sh production"
    echo ""
    echo "   Option B: Railway"
    echo "   - Connect your GitHub repo to Railway"
    echo "   - Add PostgreSQL and Redis services"
    echo "   - Copy environment variables from .env.production"
    echo ""
    echo "   Option C: Manual deployment"
    echo "   - Copy backend/ to your server"
    echo "   - Set up PostgreSQL and Redis"
    echo "   - Run: npm install && npm run migrate && npm start"
    echo ""
    echo "3. 📊 Test your deployment:"
    echo "   curl https://your-domain.com/health"
    echo ""
    echo "4. 👥 Create your first user:"
    echo "   Visit: https://your-domain.com/register"
    echo ""
    echo "5. 📈 Monitor your app:"
    echo "   Health: https://your-domain.com/ready"
    echo "   Metrics: https://your-domain.com/metrics"
    echo ""
    echo "💡 Need help? Check DEPLOYMENT_GUIDE.md for detailed instructions."
    echo ""
}

# Cleanup function
cleanup() {
    log_info "Cleaning up temporary files..."
    
    if [ -f "$PROJECT_ROOT/.secrets-generated" ]; then
        log_warn "🔐 Remember to delete .secrets-generated after copying secrets to .env.production"
    fi
}

# Main setup flow
main() {
    echo "=================================================="
    echo "  SplitSet App - Production Setup"
    echo "=================================================="
    echo ""
    echo "This script will:"
    echo "  ✅ Generate secure secrets"
    echo "  ✅ Create production environment files"
    echo "  ✅ Setup database with migrations"
    echo "  ✅ Build frontend for production"
    echo "  ✅ Validate setup"
    echo ""
    read -p "Continue? (y/N): " -n 1 -r
    echo
    
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Setup cancelled."
        exit 0
    fi
    
    generate_secrets
    create_production_env
    create_docker_env
    setup_database
    build_frontend
    
    if validate_setup; then
        show_next_steps
        cleanup
        log_info "🎉 Production setup completed successfully!"
    else
        log_error "❌ Setup failed. Please check the errors above."
        exit 1
    fi
}

# Handle script interruption
trap 'log_error "Setup interrupted!"; exit 1' INT TERM

# Check prerequisites
if ! command -v openssl &> /dev/null; then
    log_error "openssl is required but not installed."
    exit 1
fi

if ! command -v node &> /dev/null; then
    log_error "Node.js is required but not installed."
    exit 1
fi

if ! command -v npm &> /dev/null; then
    log_error "npm is required but not installed."
    exit 1
fi

# Run main function
main "$@"
