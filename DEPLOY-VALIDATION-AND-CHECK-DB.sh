#!/bin/bash
# Deploy validation features and check database on production server
# Usage: Run this script ON THE PRODUCTION SERVER

set -e

echo "========================================================================="
echo "🚀 DEPLOY VALIDATION FEATURES + DATABASE CHECK"
echo "========================================================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log_info() { echo -e "${GREEN}✓${NC} $1"; }
log_warn() { echo -e "${YELLOW}!${NC} $1"; }
log_error() { echo -e "${RED}✗${NC} $1" >&2; }
log_step() { echo -e "${BLUE}▶${NC} $1"; }

# Check if running on server
if [ ! -d "/home/ubuntu/thong-ke-he-thong" ]; then
    log_error "This script must be run ON THE PRODUCTION SERVER"
    log_warn "Detected path: $(pwd)"
    log_warn "Expected path: /home/ubuntu/thong-ke-he-thong"
    exit 1
fi

cd /home/ubuntu/thong-ke-he-thong

# Step 1: Pull latest code
echo ""
log_step "STEP 1: Pulling latest code from git..."
git pull origin main
log_info "Code pulled successfully"

# Step 2: Build frontend
echo ""
log_step "STEP 2: Building frontend..."
cd frontend
npm install --quiet
npm run build
log_info "Frontend built successfully"
cd ..

# Step 3: Restart containers
echo ""
log_step "STEP 3: Restarting containers..."
docker compose restart frontend
sleep 5
log_info "Containers restarted"

# Step 4: Verify deployment
echo ""
log_step "STEP 4: Verifying deployment..."
docker compose ps | grep -E "frontend|backend|postgres"
log_info "Deployment verified"

# Step 5: Run database check
echo ""
echo "========================================================================="
log_step "STEP 5: Checking database state..."
echo "========================================================================="
echo ""

docker compose exec -T postgres psql -U postgres -d thongke <<'EOSQL'
\echo '========================================================================'
\echo '1️⃣  TỔNG SỐ ĐƠN VỊ (ORGANIZATIONS)'
\echo '========================================================================'
SELECT COUNT(*) as "Tổng số đơn vị" FROM organizations;
\echo ''

\echo '========================================================================'
\echo '2️⃣  TỔNG SỐ USER TYPE ĐƠN VỊ (role = org_user)'
\echo '========================================================================'
SELECT COUNT(*) as "Tổng số user đơn vị" FROM users WHERE role = 'org_user';
\echo ''

\echo '========================================================================'
\echo '3️⃣  DANH SÁCH CÁC ĐƠN VỊ CÓ USER'
\echo '========================================================================'
SELECT
    o.code as "Mã đơn vị",
    o.name as "Tên đơn vị",
    u.username as "Username",
    u.is_active as "Active"
FROM organizations o
LEFT JOIN users u ON u.organization_id = o.id AND u.role = 'org_user'
WHERE u.username IS NOT NULL
ORDER BY o.name;
\echo ''

\echo '========================================================================'
\echo '4️⃣  DANH SÁCH CÁC ĐƠN VỊ THIẾU USER'
\echo '========================================================================'
SELECT
    o.code as "Mã đơn vị",
    o.name as "Tên đơn vị"
FROM organizations o
LEFT JOIN users u ON u.organization_id = o.id AND u.role = 'org_user'
WHERE u.id IS NULL
ORDER BY o.name;
\echo ''

\echo '========================================================================'
\echo '📊 THỐNG KÊ TỔNG HỢP'
\echo '========================================================================'
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
echo "========================================================================="
log_info "DEPLOYMENT AND DATABASE CHECK COMPLETED!"
echo "========================================================================="
echo ""
log_warn "Next steps:"
echo "  1. Review the database check results above"
echo "  2. If organizations are missing users, run:"
echo "     docker compose cp 08-backlog-plan/check-and-create-missing-users.py backend:/app/"
echo "     docker compose exec backend python /app/check-and-create-missing-users.py"
echo "  3. Verify validation features at: https://hientrangcds.mst.gov.vn/systems/create"
echo ""
