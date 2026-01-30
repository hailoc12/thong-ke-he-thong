#!/bin/bash
# Deploy "Other Option Fix" to Server
# Run this on the server after pushing changes
# Date: 2026-01-27

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() { echo -e "${GREEN}✓${NC} $1"; }
log_warn() { echo -e "${YELLOW}!${NC} $1"; }
log_error() { echo -e "${RED}✗${NC} $1" >&2; }
log_step() { echo -e "${BLUE}▶${NC} $1"; }

echo "========================================================================"
echo "Deploying: Add 'Other' Option to Choice Fields Fix"
echo "========================================================================"
echo ""
echo "This fix adds 'other' option to 8 fields across 3 models:"
echo "  • System: hosting_platform"
echo "  • SystemArchitecture: database_model, mobile_app"
echo "  • SystemOperations: dev_type, warranty_status, vendor_dependency,"
echo "                      deployment_location, compute_type"
echo ""

# Step 1: Pull latest code
log_step "Step 1: Pulling latest code from Git..."
git pull origin main
log_info "Code updated"

# Step 2: Check Docker is running
log_step "Step 2: Checking Docker status..."
if ! docker compose ps > /dev/null 2>&1; then
    log_error "Docker is not running or docker compose not available"
    exit 1
fi
log_info "Docker is running"

# Step 3: Stop backend
log_step "Step 3: Stopping backend container..."
docker compose stop backend
log_info "Backend stopped"

# Step 4: Remove old backend container
log_step "Step 4: Removing old backend container..."
docker compose rm -f backend
log_info "Old container removed"

# Step 5: Build new backend (no cache)
log_step "Step 5: Building backend with fresh code..."
log_warn "This may take 2-3 minutes..."
docker compose build backend --no-cache
log_info "Backend built successfully"

# Step 6: Start backend (migrations will run automatically)
log_step "Step 6: Starting backend..."
docker compose up -d backend
log_info "Backend started"

# Step 7: Wait for backend to be healthy
log_step "Step 7: Waiting for backend to be ready..."
echo -n "Checking"
for i in {1..30}; do
    sleep 2
    echo -n "."
    if docker compose exec -T backend curl -f http://localhost:8000/api/ > /dev/null 2>&1; then
        echo ""
        log_info "Backend is healthy!"
        break
    fi
    if [ $i -eq 30 ]; then
        echo ""
        log_error "Backend failed to start after 60 seconds"
        log_error "Check logs: docker compose logs backend"
        exit 1
    fi
done

# Step 8: Verify migration applied
log_step "Step 8: Verifying migration 0023 applied..."
if docker compose exec -T backend python manage.py showmigrations systems | grep -q "\[X\] 0023_add_other_option_to_choices"; then
    log_info "Migration 0023 applied successfully"
else
    log_error "Migration 0023 NOT applied"
    log_warn "You may need to run manually: docker compose exec backend python manage.py migrate"
fi

echo ""
echo "========================================================================"
echo "✅ Deployment Complete!"
echo "========================================================================"
echo ""
echo "Next Steps:"
echo "  1. Run live test: python3 live_test_other_option.py"
echo "  2. Or test manually in the web UI"
echo ""
echo "Test Cases:"
echo "  ✓ Select 'Khác' (Other) for Hosting Platform → should work"
echo "  ✓ Select 'Khác' (Other) for Database Model → should work"
echo "  ✓ Select 'Khác' (Other) for Mobile App → should work"
echo "  ✓ Select 'Khác' (Other) for Dev Type → should work"
echo "  ✓ And 4 more fields in Operations tab → should work"
echo ""
