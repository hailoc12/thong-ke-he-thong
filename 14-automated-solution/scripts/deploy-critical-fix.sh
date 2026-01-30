#!/bin/bash
# Critical Bug Fix Deployment - Transform Form Values Fix
# Purpose: Deploy transformFormValuesToAPIPayload fix to production
# Bug: User form data not saved due to flat/nested structure mismatch
# Created: 2026-01-25

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

PROD_SERVER="admin_@34.142.152.104"
PROD_PATH="/home/admin_/thong_ke_he_thong"
PROJECT_ROOT="/Users/shimazu/Dropbox/9. active/consultant/support_b4t/thong_ke_he_thong"

echo "========================================================================"
log_heading "🚨 CRITICAL BUG FIX DEPLOYMENT"
log_heading "Fix: transformFormValuesToAPIPayload (Frontend-Backend Data Mismatch)"
echo "========================================================================"
echo ""

# Step 1: Verify the fix exists locally
log_step "STEP 1: Verifying fix exists in local codebase..."
cd "$PROJECT_ROOT"

if ! grep -q "transformFormValuesToAPIPayload" frontend/src/pages/SystemEdit.tsx; then
    log_error "Fix not found in SystemEdit.tsx!"
    exit 1
fi

if ! grep -q "transformFormValuesToAPIPayload" frontend/src/pages/SystemCreate.tsx; then
    log_error "Fix not found in SystemCreate.tsx!"
    exit 1
fi

log_info "Fix verified in local codebase"
echo ""

# Step 2: Build frontend locally
log_step "STEP 2: Building frontend with fix..."
cd frontend

if [ ! -d "node_modules" ]; then
    log_warn "node_modules not found, running npm install..."
    npm install
fi

log_step "Running TypeScript compilation..."
npx tsc -b

log_step "Building with Vite..."
npm run build

if [ ! -d "dist" ]; then
    log_error "Build failed - dist directory not created!"
    exit 1
fi

log_info "Frontend built successfully"
echo ""

# Step 3: Backup current production build
log_step "STEP 3: Creating backup of production frontend..."
ssh "$PROD_SERVER" "
    cd $PROD_PATH
    if [ -d frontend/dist ]; then
        timestamp=\$(date +%Y%m%d_%H%M%S)
        cp -r frontend/dist frontend/dist.backup.\$timestamp
        echo 'Backup created: frontend/dist.backup.'\$timestamp
    fi
"
log_info "Production backup created"
echo ""

# Step 4: Deploy built files to production
log_step "STEP 4: Deploying built frontend to production..."
cd "$PROJECT_ROOT/frontend"

log_step "Syncing dist folder to production..."
rsync -avz --progress dist/ "$PROD_SERVER:$PROD_PATH/frontend/dist/"

log_info "Frontend files deployed"
echo ""

# Step 5: Also deploy source files (in case production rebuilds)
log_step "STEP 5: Deploying source files..."
rsync -avz --progress src/ "$PROD_SERVER:$PROD_PATH/frontend/src/"

log_info "Source files synced"
echo ""

# Step 6: Restart frontend service
log_step "STEP 6: Restarting frontend service on production..."
ssh "$PROD_SERVER" "
    cd $PROD_PATH
    echo 'Restarting frontend container...'
    docker compose restart frontend || docker-compose restart frontend
    sleep 3
    echo 'Checking container status...'
    docker compose ps frontend || docker-compose ps frontend
"
log_info "Frontend service restarted"
echo ""

# Step 7: Verify deployment
log_step "STEP 7: Verifying fix deployed on production..."
ssh "$PROD_SERVER" "
    cd $PROD_PATH/frontend/src/pages
    if grep -q 'transformFormValuesToAPIPayload' SystemEdit.tsx; then
        echo '✓ Fix found in SystemEdit.tsx'
    else
        echo '✗ Fix NOT found in SystemEdit.tsx'
        exit 1
    fi

    if grep -q 'transformFormValuesToAPIPayload' SystemCreate.tsx; then
        echo '✓ Fix found in SystemCreate.tsx'
    else
        echo '✗ Fix NOT found in SystemCreate.tsx'
        exit 1
    fi
"
log_info "Fix verified on production"
echo ""

echo "========================================================================"
log_info "DEPLOYMENT COMPLETED!"
echo "========================================================================"
echo ""
log_heading "📋 NEXT STEPS - MANUAL TESTING REQUIRED:"
echo ""
echo "1. Open browser: http://34.142.152.104 or production domain"
echo "2. Login as admin or org_user"
echo "3. Create a NEW test system with data in ALL 8 tabs:"
echo "   - Tab 1: Basic Info (name, description, etc.)"
echo "   - Tab 2: Architecture (backend_tech, frontend_tech, etc.)"
echo "   - Tab 3: Data Info (storage_size_gb, api_endpoints_count, etc.)"
echo "   - Tab 4: Operations (developer, warranty_status, etc.)"
echo "   - Tab 5: Integration (has_integration, integration_count, etc.)"
echo "   - Tab 6: Users"
echo "   - Tab 7: Attachments"
echo "   - Tab 8: Assessment (recommendation, blockers, etc.)"
echo "4. Save each tab as you go"
echo "5. Click 'Hoàn thành' to finalize"
echo "6. Verify in database that ALL fields are saved"
echo ""
log_heading "🔍 DATABASE VERIFICATION:"
echo ""
echo "Connect to database and check:"
echo ""
echo "  ssh $PROD_SERVER"
echo "  cd $PROD_PATH"
echo "  docker compose exec postgres psql -U postgres -d system_reports"
echo ""
echo "  -- Check latest system"
echo "  SELECT id, name, created_at FROM systems ORDER BY created_at DESC LIMIT 1;"
echo ""
echo "  -- Verify architecture_data"
echo "  SELECT id, backend_tech, frontend_tech, database_type FROM system_architecture WHERE system_id = [ID];"
echo ""
echo "  -- Verify data_info_data"
echo "  SELECT id, storage_size_gb, api_endpoints_count FROM system_data_info WHERE system_id = [ID];"
echo ""
echo "  -- Verify operations_data"
echo "  SELECT id, developer, warranty_status FROM system_operations WHERE system_id = [ID];"
echo ""
echo "  -- Verify integration_data"
echo "  SELECT id, has_integration, integration_count FROM system_integration WHERE system_id = [ID];"
echo ""
echo "  -- Verify assessment_data"
echo "  SELECT id, recommendation, integration_readiness FROM system_assessment WHERE system_id = [ID];"
echo ""
log_heading "⚠️  CRITICAL VERIFICATION:"
echo ""
echo "If ANY fields are still missing after creating test system:"
echo "  1. Check browser console for errors"
echo "  2. Check backend logs: docker compose logs backend"
echo "  3. Verify API payload in Network tab"
echo "  4. Report back with specific error details"
echo ""
log_warn "Save this output for reference during testing!"
echo ""
