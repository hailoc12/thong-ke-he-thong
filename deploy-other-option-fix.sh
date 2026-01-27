#!/bin/bash
# Deploy script for "Other" option fix
# Fix: hosting_platform and database_model now accept "other" value
# Date: 2026-01-27

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log_info() { echo -e "${GREEN}✓${NC} $1"; }
log_warn() { echo -e "${YELLOW}!${NC} $1"; }
log_error() { echo -e "${RED}✗${NC} $1" >&2; }

echo "========================================="
echo "Deploying 'Other' Option Fix"
echo "========================================="
echo ""

# Step 1: Navigate to project directory
cd /Users/shimazu/Dropbox/9.\ active/consultant/support_b4t/thong_ke_he_thong

# Step 2: Stop backend (keep DB running)
log_info "Stopping backend..."
docker compose stop backend

# Step 3: Remove old backend container
log_info "Removing old backend container..."
docker compose rm -f backend

# Step 4: Rebuild backend (no cache to ensure fresh build)
log_info "Rebuilding backend..."
docker compose build backend --no-cache

# Step 5: Start backend (will run migrations automatically)
log_info "Starting backend..."
docker compose up -d backend

# Step 6: Wait for backend to be healthy
log_info "Waiting for backend to be ready..."
sleep 10

# Check backend health
for i in {1..30}; do
    if docker compose exec backend curl -f http://localhost:8000/api/ > /dev/null 2>&1; then
        log_info "Backend is healthy!"
        break
    fi
    if [ $i -eq 30 ]; then
        log_error "Backend failed to start"
        exit 1
    fi
    echo "Waiting... ($i/30)"
    sleep 2
done

echo ""
log_info "✅ Deployment completed!"
echo ""
echo "========================================="
echo "Next Steps:"
echo "========================================="
echo "1. Test hosting_platform field with 'Other' option"
echo "2. Test architecture_data fields with 'Other' option"
echo "3. Verify no more validation errors"
echo ""
