#!/bin/bash

# Production deployment script for SplitSet App
# Usage: ./scripts/deploy.sh [environment]

set -e

ENVIRONMENT=${1:-production}
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

echo "🚀 Starting deployment for environment: $ENVIRONMENT"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Helper functions
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if required files exist
check_prerequisites() {
    log_info "Checking prerequisites..."
    
    if [ ! -f "$PROJECT_ROOT/.env.$ENVIRONMENT" ]; then
        log_error "Environment file .env.$ENVIRONMENT not found!"
        exit 1
    fi
    
    if [ ! -f "$PROJECT_ROOT/docker-compose.prod.yml" ]; then
        log_error "docker-compose.prod.yml not found!"
        exit 1
    fi
    
    # Check if Docker is running
    if ! docker info > /dev/null 2>&1; then
        log_error "Docker is not running!"
        exit 1
    fi
    
    log_info "Prerequisites check passed ✅"
}

# Backup current deployment (if exists)
backup_current() {
    log_info "Creating backup of current deployment..."
    
    BACKUP_DIR="$PROJECT_ROOT/backups/$(date +%Y%m%d_%H%M%S)"
    mkdir -p "$BACKUP_DIR"
    
    # Backup database
    if docker ps | grep -q shopify-bundle-db; then
        log_info "Backing up database..."
        docker exec shopify-bundle-db pg_dump -U postgres shopify_bundle_app > "$BACKUP_DIR/database_backup.sql"
    fi
    
    # Backup application logs
    if docker ps | grep -q shopify-bundle-app; then
        log_info "Backing up application logs..."
        docker cp shopify-bundle-app:/app/logs "$BACKUP_DIR/app_logs" 2>/dev/null || true
    fi
    
    log_info "Backup created at: $BACKUP_DIR ✅"
}

# Build and deploy
deploy() {
    log_info "Starting deployment process..."
    
    cd "$PROJECT_ROOT"
    
    # Copy environment file
    cp ".env.$ENVIRONMENT" .env.production
    
    # Pull latest images
    log_info "Pulling latest base images..."
    docker-compose -f docker-compose.prod.yml pull
    
    # Build application image
    log_info "Building application image..."
    docker-compose -f docker-compose.prod.yml build --no-cache app
    
    # Stop existing containers
    log_info "Stopping existing containers..."
    docker-compose -f docker-compose.prod.yml down
    
    # Start new containers
    log_info "Starting new containers..."
    docker-compose -f docker-compose.prod.yml up -d
    
    # Wait for services to be ready
    log_info "Waiting for services to be ready..."
    sleep 10
    
    # Run database migrations
    log_info "Running database migrations..."
    docker-compose -f docker-compose.prod.yml exec -T app npm run migrate
    
    log_info "Deployment completed ✅"
}

# Health check
health_check() {
    log_info "Performing health check..."
    
    # Wait for app to be fully ready
    local max_attempts=30
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        if curl -f http://localhost:5000/health > /dev/null 2>&1; then
            log_info "Health check passed ✅"
            return 0
        fi
        
        log_warn "Health check attempt $attempt/$max_attempts failed, retrying in 10s..."
        sleep 10
        ((attempt++))
    done
    
    log_error "Health check failed after $max_attempts attempts!"
    return 1
}

# Rollback function
rollback() {
    log_warn "Rolling back deployment..."
    
    # Stop current containers
    docker-compose -f docker-compose.prod.yml down
    
    # Restore from latest backup
    LATEST_BACKUP=$(ls -t "$PROJECT_ROOT/backups" | head -n1)
    if [ -n "$LATEST_BACKUP" ]; then
        log_info "Restoring from backup: $LATEST_BACKUP"
        
        # Restore database if backup exists
        if [ -f "$PROJECT_ROOT/backups/$LATEST_BACKUP/database_backup.sql" ]; then
            docker-compose -f docker-compose.prod.yml up -d db
            sleep 10
            docker exec -i shopify-bundle-db psql -U postgres -d shopify_bundle_app < "$PROJECT_ROOT/backups/$LATEST_BACKUP/database_backup.sql"
        fi
    fi
    
    log_warn "Rollback completed. Please investigate the issue."
}

# Post-deployment tasks
post_deploy() {
    log_info "Running post-deployment tasks..."
    
    # Clean up old Docker images
    docker image prune -f
    
    # Clean up old backups (keep last 5)
    if [ -d "$PROJECT_ROOT/backups" ]; then
        cd "$PROJECT_ROOT/backups"
        ls -t | tail -n +6 | xargs -r rm -rf
    fi
    
    # Display deployment info
    log_info "Deployment Summary:"
    echo "  Environment: $ENVIRONMENT"
    echo "  Timestamp: $(date)"
    echo "  Containers:"
    docker-compose -f docker-compose.prod.yml ps
    
    log_info "Post-deployment tasks completed ✅"
}

# Main deployment flow
main() {
    echo "=================================================="
    echo "  SplitSet App - Production Deployment"
    echo "=================================================="
    
    check_prerequisites
    backup_current
    deploy
    
    if health_check; then
        post_deploy
        log_info "🎉 Deployment successful!"
        echo ""
        echo "Access your application at:"
        echo "  Health Check: http://localhost:5000/health"
        echo "  API: http://localhost:5000/api"
        echo ""
    else
        log_error "Deployment failed health check!"
        read -p "Do you want to rollback? (y/N): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            rollback
        fi
        exit 1
    fi
}

# Handle script interruption
trap 'log_error "Deployment interrupted!"; exit 1' INT TERM

# Run main function
main "$@"
