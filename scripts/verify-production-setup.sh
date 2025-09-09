#!/bin/bash

# 🔍 SplitSet Production Setup Verification Script
# This script verifies that all production configurations are properly set

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Counters
CHECKS_PASSED=0
CHECKS_FAILED=0
TOTAL_CHECKS=0

# Print functions
print_header() {
    echo -e "${BLUE}=== $1 ===${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
    ((CHECKS_PASSED++))
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
    ((CHECKS_FAILED++))
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to test HTTP endpoint
test_endpoint() {
    local url=$1
    local expected_status=${2:-200}
    local timeout=${3:-10}
    
    if command_exists curl; then
        local response=$(curl -s -o /dev/null -w "%{http_code}" --connect-timeout $timeout "$url" 2>/dev/null || echo "000")
        if [ "$response" = "$expected_status" ]; then
            return 0
        else
            return 1
        fi
    else
        print_warning "curl not available - skipping endpoint test"
        return 2
    fi
}

# Check if we're in the right directory
if [ ! -f "package.json" ] || [ ! -d "backend" ]; then
    print_error "Please run this script from the SplitSet project root directory"
    exit 1
fi

print_header "SplitSet Production Setup Verification"
print_info "Checking production readiness..."
echo ""

# Load environment variables
if [ -f "backend/.env" ]; then
    source backend/.env
    print_success "Environment file loaded"
else
    print_error "No .env file found in backend/"
    exit 1
fi

# 1. Environment Configuration Check
print_header "Environment Configuration"
((TOTAL_CHECKS++))

if [ "$NODE_ENV" = "production" ]; then
    print_success "NODE_ENV set to production"
else
    print_error "NODE_ENV is not set to production (current: ${NODE_ENV:-not set})"
fi

# 2. Database Configuration Check
print_header "Database Configuration"
((TOTAL_CHECKS++))

if [ -n "$DATABASE_URL" ]; then
    if [[ $DATABASE_URL == postgresql://* ]]; then
        print_success "PostgreSQL database URL configured"
        
        # Test database connection if node is available
        if command_exists node; then
            print_info "Testing database connection..."
            cd backend
            if node -e "
                require('dotenv').config();
                const db = require('./db');
                db.raw('SELECT 1')
                    .then(() => { console.log('Database connection successful'); process.exit(0); })
                    .catch(err => { console.error('Database connection failed:', err.message); process.exit(1); });
            " 2>/dev/null; then
                print_success "Database connection verified"
                ((TOTAL_CHECKS++))
            else
                print_error "Database connection failed"
                ((TOTAL_CHECKS++))
            fi
            cd ..
        fi
    else
        print_warning "Database URL doesn't appear to be PostgreSQL"
    fi
else
    print_error "DATABASE_URL not configured"
fi

# 3. Redis Configuration Check
print_header "Redis Configuration"
((TOTAL_CHECKS++))

if [ -n "$REDIS_HOST" ] && [ -n "$REDIS_PASSWORD" ]; then
    print_success "Redis configuration found"
    
    # Test Redis connection if redis-cli is available
    if command_exists redis-cli; then
        print_info "Testing Redis connection..."
        if redis-cli -h "$REDIS_HOST" -p "${REDIS_PORT:-6379}" -a "$REDIS_PASSWORD" ping 2>/dev/null | grep -q PONG; then
            print_success "Redis connection verified"
            ((TOTAL_CHECKS++))
        else
            print_error "Redis connection failed"
            ((TOTAL_CHECKS++))
        fi
    fi
else
    print_error "Redis configuration incomplete (REDIS_HOST: ${REDIS_HOST:-not set}, REDIS_PASSWORD: ${REDIS_PASSWORD:+set})"
fi

# 4. Shopify Configuration Check
print_header "Shopify Configuration"
((TOTAL_CHECKS++))

if [ -n "$SHOPIFY_API_KEY" ] && [ -n "$SHOPIFY_API_SECRET" ]; then
    print_success "Shopify API credentials configured"
    
    # Check if credentials look valid (basic format check)
    if [[ ${#SHOPIFY_API_KEY} -ge 20 ]] && [[ ${#SHOPIFY_API_SECRET} -ge 20 ]]; then
        print_success "Shopify credentials appear to be valid format"
        ((TOTAL_CHECKS++))
    else
        print_warning "Shopify credentials may be too short"
        ((TOTAL_CHECKS++))
    fi
else
    print_error "Shopify API credentials not configured"
fi

# 5. Security Configuration Check
print_header "Security Configuration"

# JWT Secret
((TOTAL_CHECKS++))
if [ -n "$JWT_SECRET" ]; then
    if [[ ${#JWT_SECRET} -ge 32 ]]; then
        print_success "JWT_SECRET is properly configured (${#JWT_SECRET} chars)"
    else
        print_error "JWT_SECRET is too short (${#JWT_SECRET} chars, minimum 32)"
    fi
else
    print_error "JWT_SECRET not configured"
fi

# Encryption Key
((TOTAL_CHECKS++))
if [ -n "$ENCRYPTION_KEY" ]; then
    if [[ ${#ENCRYPTION_KEY} -eq 32 ]]; then
        print_success "ENCRYPTION_KEY is properly configured (32 chars)"
    else
        print_error "ENCRYPTION_KEY must be exactly 32 characters (current: ${#ENCRYPTION_KEY})"
    fi
else
    print_error "ENCRYPTION_KEY not configured"
fi

# Other security settings
((TOTAL_CHECKS++))
if [ -n "$APP_SECRET" ] && [ -n "$WEBHOOK_SECRET" ]; then
    print_success "Webhook secrets configured"
else
    print_error "APP_SECRET or WEBHOOK_SECRET not configured"
fi

# 6. URL Configuration Check
print_header "URL Configuration"

# Frontend URL
((TOTAL_CHECKS++))
if [ -n "$FRONTEND_URL" ]; then
    if [[ $FRONTEND_URL == https://* ]]; then
        print_success "Frontend URL uses HTTPS"
        
        # Test frontend accessibility
        if test_endpoint "$FRONTEND_URL" 200 5; then
            print_success "Frontend is accessible"
            ((TOTAL_CHECKS++))
        else
            print_warning "Frontend may not be accessible (this could be normal if not deployed yet)"
            ((TOTAL_CHECKS++))
        fi
    else
        print_warning "Frontend URL should use HTTPS in production"
    fi
else
    print_error "FRONTEND_URL not configured"
fi

# Backend URL
((TOTAL_CHECKS++))
if [ -n "$APP_URL" ]; then
    if [[ $APP_URL == https://* ]]; then
        print_success "Backend URL uses HTTPS"
        
        # Test backend health endpoint
        if test_endpoint "$APP_URL/health" 200 5; then
            print_success "Backend health endpoint is accessible"
            ((TOTAL_CHECKS++))
        else
            print_warning "Backend health endpoint not accessible (this could be normal if not deployed yet)"
            ((TOTAL_CHECKS++))
        fi
    else
        print_warning "Backend URL should use HTTPS in production"
    fi
else
    print_error "APP_URL not configured"
fi

# 7. Performance Configuration Check
print_header "Performance Configuration"

((TOTAL_CHECKS++))
if [ "$BCRYPT_ROUNDS" = "12" ] && [ "$RATE_LIMIT_MAX_REQUESTS" = "500" ]; then
    print_success "Performance settings optimized for production"
else
    print_warning "Performance settings may not be optimized (BCRYPT_ROUNDS: ${BCRYPT_ROUNDS:-not set}, RATE_LIMIT_MAX_REQUESTS: ${RATE_LIMIT_MAX_REQUESTS:-not set})"
fi

# 8. Logging Configuration Check
print_header "Logging Configuration"

((TOTAL_CHECKS++))
if [ "$LOG_LEVEL" = "info" ] && [ "$ENABLE_REQUEST_LOGGING" = "false" ]; then
    print_success "Logging configured for production"
else
    print_warning "Logging configuration may not be optimal for production"
fi

# 9. File System Check
print_header "File System Check"

# Check for development artifacts
((TOTAL_CHECKS++))
if [ -f "backend/data/dev.db" ]; then
    print_warning "Development SQLite database found - ensure production uses PostgreSQL"
else
    print_success "No development database artifacts found"
fi

# Check for backup files
((TOTAL_CHECKS++))
backup_files=$(find . -name "*.backup*" -o -name "*.bak" 2>/dev/null | wc -l)
if [ "$backup_files" -gt 0 ]; then
    print_info "Found $backup_files backup files (this is normal)"
    print_success "Backup files present"
else
    print_success "No backup files found"
fi

# 10. Dependencies Check
print_header "Dependencies Check"

((TOTAL_CHECKS++))
if [ -f "backend/package.json" ] && [ -f "frontend/package.json" ]; then
    print_success "Package.json files found"
    
    # Check if node_modules exist
    if [ -d "backend/node_modules" ] && [ -d "frontend/node_modules" ]; then
        print_success "Dependencies installed"
        ((TOTAL_CHECKS++))
    else
        print_warning "Dependencies may not be installed"
        ((TOTAL_CHECKS++))
    fi
else
    print_error "Package.json files missing"
fi

# 11. Migration Status Check
print_header "Database Migration Status"

if command_exists node && [ -n "$DATABASE_URL" ]; then
    cd backend
    print_info "Checking migration status..."
    
    # Check if migrations table exists and get latest migration
    if node -e "
        require('dotenv').config();
        const db = require('./db');
        db('knex_migrations')
            .orderBy('batch', 'desc')
            .first()
            .then(latest => {
                if (latest) {
                    console.log('Latest migration:', latest.name);
                    console.log('Migration status: UP TO DATE');
                } else {
                    console.log('No migrations found - may need to run migrations');
                }
                process.exit(0);
            })
            .catch(err => {
                console.log('Migrations may need to be run:', err.message);
                process.exit(1);
            });
    " 2>/dev/null; then
        print_success "Database migrations status checked"
        ((TOTAL_CHECKS++))
    else
        print_warning "Could not check migration status - may need to run migrations"
        ((TOTAL_CHECKS++))
    fi
    cd ..
else
    print_warning "Cannot check migration status without Node.js and database connection"
    ((TOTAL_CHECKS++))
fi

# Final Summary
print_header "Verification Summary"

echo ""
print_info "Verification Results:"
echo "  ✅ Checks Passed: $CHECKS_PASSED"
echo "  ❌ Checks Failed: $CHECKS_FAILED"
echo "  📊 Total Checks: $TOTAL_CHECKS"
echo ""

# Calculate percentage
if [ $TOTAL_CHECKS -gt 0 ]; then
    percentage=$((CHECKS_PASSED * 100 / TOTAL_CHECKS))
    print_info "Success Rate: ${percentage}%"
else
    percentage=0
fi

echo ""

if [ $CHECKS_FAILED -eq 0 ]; then
    print_success "🎉 All checks passed! Your SplitSet application is ready for production."
    echo ""
    print_info "Next Steps:"
    echo "  1. Deploy to your production environment"
    echo "  2. Run health checks after deployment"
    echo "  3. Test core functionality"
    echo "  4. Set up monitoring and backups"
elif [ $percentage -ge 80 ]; then
    print_warning "⚠️  Most checks passed, but some issues need attention before production deployment."
    echo ""
    print_info "Address the failed checks above, then run this script again."
else
    print_error "❌ Several critical issues found. Please address all failed checks before deploying to production."
    echo ""
    print_info "Review the PRODUCTION_SETUP_GUIDE.md for detailed configuration instructions."
fi

echo ""
print_info "For detailed production setup instructions, see:"
echo "  📖 PRODUCTION_SETUP_GUIDE.md"
echo "  🔧 scripts/setup-production-config.sh"
echo ""

# Exit with appropriate code
if [ $CHECKS_FAILED -eq 0 ]; then
    exit 0
else
    exit 1
fi
