#!/bin/bash

# Shopify Bundle App Startup Script with Absolute Paths
# This prevents directory path confusion

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

print_header() {
    echo -e "${PURPLE}========================================${NC}"
    echo -e "${PURPLE}  🛍️  Starting Shopify Bundle App${NC}"
    echo -e "${PURPLE}========================================${NC}"
    echo ""
}

print_step() {
    echo -e "${BLUE}[STEP $1]${NC} $2"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

# Define absolute paths
PROJECT_ROOT="/Users/ankurpandey/Desktop/GSTBundle"
BACKEND_DIR="$PROJECT_ROOT/backend"
FRONTEND_DIR="$PROJECT_ROOT/frontend"

# Function to handle cleanup
cleanup() {
    echo ""
    print_info "🛑 Shutting down servers..."
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null || true
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

main() {
    print_header
    
    # Verify directories exist
    if [ ! -d "$PROJECT_ROOT" ]; then
        print_error "Project directory not found: $PROJECT_ROOT"
        exit 1
    fi
    
    if [ ! -d "$BACKEND_DIR" ]; then
        print_error "Backend directory not found: $BACKEND_DIR"
        exit 1
    fi
    
    if [ ! -d "$FRONTEND_DIR" ]; then
        print_error "Frontend directory not found: $FRONTEND_DIR"
        exit 1
    fi
    
    print_step "1" "Killing any existing processes..."
    pkill -f "node.*server.js" 2>/dev/null || true
    pkill -f "react-scripts" 2>/dev/null || true
    sleep 2
    
    print_step "2" "Starting backend server..."
    cd "$BACKEND_DIR"
    
    # Verify server.js exists
    if [ ! -f "server.js" ]; then
        print_error "server.js not found in $BACKEND_DIR"
        exit 1
    fi
    
    # Start backend with explicit path
    /Users/ankurpandey/.nvm/versions/node/v18.20.8/bin/node "$BACKEND_DIR/server.js" > "$PROJECT_ROOT/backend.log" 2>&1 &
    BACKEND_PID=$!
    
    print_info "Backend started with PID: $BACKEND_PID"
    print_info "Backend log: $PROJECT_ROOT/backend.log"
    
    # Wait for backend to start
    sleep 5
    
    # Test backend connection
    print_step "3" "Testing backend connection..."
    if curl -s http://localhost:5000/health > /dev/null 2>&1; then
        print_success "✅ Backend is running on port 5000"
    else
        print_error "❌ Backend failed to start or not responding"
        print_info "Check backend log: tail -f $PROJECT_ROOT/backend.log"
        exit 1
    fi
    
    print_step "4" "Starting frontend server..."
    cd "$FRONTEND_DIR"
    
    # Verify package.json exists
    if [ ! -f "package.json" ]; then
        print_error "package.json not found in $FRONTEND_DIR"
        exit 1
    fi
    
    # Start frontend with explicit path
    npm start > "$PROJECT_ROOT/frontend.log" 2>&1 &
    FRONTEND_PID=$!
    
    print_info "Frontend started with PID: $FRONTEND_PID"
    print_info "Frontend log: $PROJECT_ROOT/frontend.log"
    
    print_step "5" "Application started successfully!"
    echo ""
    print_success "🎉 Shopify Bundle App is running!"
    echo ""
    print_info "📱 Frontend: http://localhost:3000"
    print_info "🔧 Backend:  http://localhost:5000"
    print_info "📊 Health:   http://localhost:5000/health"
    print_info "🛍️ Shopify:  http://localhost:5000/api/shopify/test-connection"
    echo ""
    print_info "📋 Logs:"
    print_info "   Backend: tail -f $PROJECT_ROOT/backend.log"
    print_info "   Frontend: tail -f $PROJECT_ROOT/frontend.log"
    echo ""
    print_info "Press Ctrl+C to stop all servers"
    echo ""
    
    # Wait for processes
    wait $BACKEND_PID $FRONTEND_PID
}

# Run main function
main "$@"
