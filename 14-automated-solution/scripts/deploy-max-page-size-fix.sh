#!/bin/bash
set -euo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() { echo -e "${GREEN}✓${NC} $1"; }
log_warn() { echo -e "${YELLOW}!${NC} $1"; }
log_error() { echo -e "${RED}✗${NC} $1" >&2; }
log_section() { echo -e "\n${BLUE}==>${NC} $1\n"; }

SERVER_HOST="34.142.152.104"
SERVER_USER="admin_"
SERVER_PASS="aivnews_xinchao_#*2020"
PROJECT_PATH="/home/admin_/thong_ke_he_thong"

log_section "Excel Export Fix Deployment"
echo "This script will fix the MAX_PAGE_SIZE limit issue"
echo "Fix: Backend settings.py MAX_PAGE_SIZE: 100 → 1000"
echo ""
echo "Target server: ${SERVER_HOST}"
echo "Project path: ${PROJECT_PATH}"
echo ""

read -p "Press Enter to continue or Ctrl+C to cancel..."

log_section "Step 1: Backup Current Settings"
log_info "Creating backup of settings.py..."
sshpass -p "${SERVER_PASS}" ssh -o StrictHostKeyChecking=no ${SERVER_USER}@${SERVER_HOST} << 'EOF'
cd /home/admin_/thong_ke_he_thong
cp backend/config/settings.py backend/config/settings.py.backup.$(date +%Y%m%d_%H%M%S)
echo "Backup created: backend/config/settings.py.backup.$(date +%Y%m%d_%H%M%S)"
EOF

log_section "Step 2: Apply Fix to Backend Settings"
log_info "Updating MAX_PAGE_SIZE from 100 to 1000..."
sshpass -p "${SERVER_PASS}" ssh -o StrictHostKeyChecking=no ${SERVER_USER}@${SERVER_HOST} << 'EOF'
cd /home/admin_/thong_ke_he_thong

# Apply fix
sed -i "s/'MAX_PAGE_SIZE': 100/'MAX_PAGE_SIZE': 1000/" backend/config/settings.py

# Verify change
echo ""
echo "Verifying change:"
grep MAX_PAGE_SIZE backend/config/settings.py
EOF

log_section "Step 3: Restart Backend Service"
log_info "Restarting backend container..."
sshpass -p "${SERVER_PASS}" ssh -o StrictHostKeyChecking=no ${SERVER_USER}@${SERVER_HOST} << 'EOF'
cd /home/admin_/thong_ke_he_thong
docker compose restart backend
echo "Waiting for backend to start..."
sleep 10
EOF

log_section "Step 4: Verify Backend Status"
log_info "Checking backend logs..."
sshpass -p "${SERVER_PASS}" ssh -o StrictHostKeyChecking=no ${SERVER_USER}@${SERVER_HOST} << 'EOF'
cd /home/admin_/thong_ke_he_thong
docker compose logs backend --tail=20 | grep -E "Django|Starting|settings"
EOF

log_section "Deployment Complete!"
echo ""
log_info "Backend MAX_PAGE_SIZE has been increased to 1000"
log_info "Backend service has been restarted"
echo ""
log_warn "Next steps:"
echo "  1. Clear browser cache (Cmd+Shift+R or Ctrl+Shift+R)"
echo "  2. Go to https://hientrangcds.mst.gov.vn"
echo "  3. Login and click 'Xuất Excel'"
echo "  4. Verify Sheet 3 has all 77 systems (78 rows including header)"
echo ""
log_warn "Expected result: Sheet 3 should have 78 rows (previously had 21 rows)"
echo ""
