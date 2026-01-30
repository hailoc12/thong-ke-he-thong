#!/bin/bash
# Excel Export Fix Deployment - Include All Organizations
# Purpose: Deploy fix to include ALL organizations in Excel export (including those without systems)
# Issue: Export only showed organizations with systems, missing those with 0 systems
# Created: 2026-01-26

set -euo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

log_info() { echo -e "${GREEN}✓${NC} $1"; }
log_warn() { echo -e "${YELLOW}!${NC} $1"; }
log_error() { echo -e "${RED}✗${NC} $1" >&2; }
log_step() { echo -e "${BLUE}▶${NC} $1"; }
log_heading() { echo -e "${CYAN}$1${NC}"; }

PROD_SERVER="admin@34.142.152.104"
PROD_PATH="~/thong_ke_he_thong"
PROJECT_ROOT="/Users/shimazu/Dropbox/9. active/consultant/support_b4t/thong_ke_he_thong"

echo "========================================================================"
log_heading "📊 EXCEL EXPORT FIX DEPLOYMENT"
log_heading "Fix: Include ALL organizations in Excel export (even those with 0 systems)"
echo "========================================================================"
echo ""

# Step 1: Verify the fix exists locally
log_step "STEP 1: Verifying fix exists in local codebase..."
cd "$PROJECT_ROOT"

# Check for merge function in exportExcel.ts
if ! grep -q "mergeOrganizationsWithCompletionStats" frontend/src/utils/exportExcel.ts; then
    log_error "mergeOrganizationsWithCompletionStats function not found in exportExcel.ts!"
    exit 1
fi

# Check for updated function signature
if ! grep -q "allOrganizations: Organization\[\] = \[\]" frontend/src/utils/exportExcel.ts; then
    log_error "Updated function signature not found in exportExcel.ts!"
    exit 1
fi

# Check for Dashboard.tsx passing organizations
if ! grep -q "await exportDashboardToExcel(
        statistics,
        completionStats,
        systemsResponse.data.results || \[\],
        organizations
      );" frontend/src/pages/Dashboard.tsx; then
    log_error "Dashboard.tsx not passing organizations to export function!"
    exit 1
fi

log_info "Fix verified in local codebase"
echo ""

# Step 2: Build frontend locally
log_step "STEP 2: Building frontend with fix..."
cd "$PROJECT_ROOT/frontend"

if ! npm run build > /dev/null 2>&1; then
    log_error "Frontend build failed!"
    exit 1
fi

log_info "Frontend built successfully"
echo ""

# Step 3: Deploy to production
log_step "STEP 3: Deploying to production server..."

# Copy frontend files to server
log_info "Copying frontend files to server..."
rsync -avz --delete \
  "$PROJECT_ROOT/frontend/" \
  "$PROD_SERVER:$PROD_PATH/frontend/" \
  --exclude='node_modules' \
  --exclude='.git' \
  --exclude='dist'

log_info "Files copied to server"
echo ""

# Step 4: Rebuild Docker container on server
log_step "STEP 4: Rebuilding Docker container on server..."

ssh "$PROD_SERVER" << 'ENDSSH'
cd ~/thong_ke_he_thong

echo "Clearing Docker build cache..."
docker builder prune -af

echo "Building frontend with DOCKER_BUILDKIT=0..."
DOCKER_BUILDKIT=0 docker compose build frontend --no-cache

echo "Restarting frontend container..."
docker compose up -d frontend

echo "Waiting for frontend to start..."
sleep 5

echo "Checking container status..."
docker compose ps frontend
ENDSSH

log_info "Docker container rebuilt and restarted"
echo ""

# Step 5: Verify deployment
log_step "STEP 5: Verifying deployment..."

# Check if frontend is responding
if curl -s -o /dev/null -w "%{http_code}" https://thongkehethong.mindmaid.ai/ | grep -q "200\|301\|302"; then
    log_info "Frontend is responding"
else
    log_warn "Frontend might not be responding correctly"
fi

echo ""
log_heading "========================================================================"
log_heading "✅ DEPLOYMENT COMPLETED SUCCESSFULLY!"
log_heading "========================================================================"
echo ""
echo "What was fixed:"
echo "  • exportExcel.ts now accepts all organizations as parameter"
echo "  • mergeOrganizationsWithCompletionStats() function adds orgs without systems"
echo "  • Dashboard.tsx passes full organizations list to export"
echo "  • Organizations with 0 systems show 'Chưa có dữ liệu' in Excel"
echo ""
echo "Testing instructions:"
echo "  1. Open https://thongkehethong.mindmaid.ai"
echo "  2. Login as admin"
echo "  3. Click 'Xuất Excel' button"
echo "  4. Open the downloaded Excel file"
echo "  5. Check sheet '2. Theo đơn vị' - should show ALL organizations"
echo "  6. Organizations without systems should show 'Chưa có dữ liệu'"
echo ""
