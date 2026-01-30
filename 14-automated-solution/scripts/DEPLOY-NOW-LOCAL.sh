#!/bin/bash
# Local deployment helper - Run this on your Mac to deploy to production

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
echo "🚀 DEPLOY TO PRODUCTION SERVER"
echo "========================================================================"
echo ""

# Step 1: Verify git is clean and pushed
echo ""
log_step "STEP 1: Verifying git status..."
cd "/Users/shimazu/Dropbox/9. active/consultant/support_b4t/thong_ke_he_thong"

if [[ -n $(git status -s) ]]; then
    log_warn "Working directory has uncommitted changes:"
    git status -s
    echo ""
    read -p "Continue anyway? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        log_error "Deployment cancelled"
        exit 1
    fi
fi

log_info "Git status OK"

# Step 2: SSH and deploy
echo ""
log_step "STEP 2: SSH to production and deploy..."
echo ""
log_warn "You will need to enter SSH password for ubuntu@hientrangcds.mst.gov.vn"
echo ""

ssh ubuntu@hientrangcds.mst.gov.vn << 'ENDSSH'
set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() { echo -e "${GREEN}✓${NC} $1"; }
log_step() { echo -e "${BLUE}▶${NC} $1"; }

echo "========================================================================"
echo "📦 DEPLOYING ON PRODUCTION SERVER"
echo "========================================================================"
echo ""

cd /home/ubuntu/thong-ke-he-thong

# Pull latest code
log_step "Pulling latest code from git..."
git pull origin main
log_info "Code updated"

# Install dependencies
log_step "Installing dependencies..."
cd frontend
npm install --quiet
log_info "Dependencies installed"

# Build frontend
log_step "Building frontend..."
npm run build
log_info "Frontend built"
cd ..

# Restart containers
log_step "Restarting containers..."
docker compose restart frontend backend
sleep 5
log_info "Containers restarted"

# Verify
log_step "Verifying deployment..."
docker compose ps
echo ""

# Check database
log_step "Checking database state..."
docker compose exec -T postgres psql -U postgres -d thongke << 'EOSQL'
\echo '========================================================================'
\echo '📊 DATABASE CHECK'
\echo '========================================================================'
\echo ''
\echo '1️⃣  Tổng số đơn vị:'
SELECT COUNT(*) as "Count" FROM organizations;
\echo ''
\echo '2️⃣  Tổng số user đơn vị:'
SELECT COUNT(*) as "Count" FROM users WHERE role = 'org_user';
\echo ''
\echo '3️⃣  Thống kê:'
SELECT
    (SELECT COUNT(*) FROM organizations) as "Tổng đơn vị",
    (SELECT COUNT(*) FROM users WHERE role = 'org_user') as "Có user",
    (SELECT COUNT(*) FROM organizations o
     WHERE NOT EXISTS (
         SELECT 1 FROM users u
         WHERE u.organization_id = o.id AND u.role = 'org_user'
     )) as "Thiếu user";
EOSQL

echo ""
echo "========================================================================"
log_info "DEPLOYMENT COMPLETED!"
echo "========================================================================"
echo ""
echo "Next steps:"
echo "  1. Open: https://hientrangcds.mst.gov.vn"
echo "  2. Login with org_user to test organization dashboard"
echo "  3. Test validation on system create/edit"
echo ""

ENDSSH

# Done
echo ""
echo "========================================================================"
log_info "DEPLOYMENT SCRIPT COMPLETED!"
echo "========================================================================"
echo ""
log_warn "Testing checklist:"
echo "  [ ] https://hientrangcds.mst.gov.vn loads"
echo "  [ ] Login with org_user (e.g., vu-buuchinh)"
echo "  [ ] Dashboard shows completion percentage"
echo "  [ ] Validation works on system create"
echo ""
