#!/usr/bin/env bash
# Deploy Premium Features to Production
# Run this script ON THE PRODUCTION SERVER

set -euo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() { echo -e "${GREEN}✓${NC} $1"; }
log_warn() { echo -e "${YELLOW}!${NC} $1"; }
log_error() { echo -e "${RED}✗${NC} $1" >&2; }
log_step() { echo -e "${BLUE}▸${NC} $1"; }

echo "======================================================================"
echo "  DEPLOY PREMIUM FEATURES - THỐNG KÊ HỆ THỐNG"
echo "======================================================================"
echo ""

# Step 1: Navigate to project directory
log_step "Step 1: Navigating to project directory..."
cd /root/thong-ke-he-thong || {
    log_error "Project directory not found!"
    exit 1
}
log_info "In directory: $(pwd)"
echo ""

# Step 2: Pull latest code
log_step "Step 2: Pulling latest code from GitHub..."
git pull origin main || {
    log_error "Failed to pull code!"
    exit 1
}
log_info "Code pulled successfully"
echo ""

# Step 3: Check current git commit
CURRENT_COMMIT=$(git log -1 --oneline)
log_info "Current commit: $CURRENT_COMMIT"
echo ""

# Step 4: Build frontend with premium features
log_step "Step 4: Rebuilding frontend Docker image..."
docker compose build frontend || {
    log_error "Failed to build frontend!"
    exit 1
}
log_info "Frontend built successfully"
echo ""

# Step 5: Restart containers
log_step "Step 5: Restarting containers..."
docker compose restart || {
    log_error "Failed to restart containers!"
    exit 1
}
log_info "Containers restarted"
echo ""

# Step 6: Wait for services to be ready
log_step "Step 6: Waiting for services to be ready (30 seconds)..."
sleep 30
log_info "Services should be ready now"
echo ""

# Step 7: Check container status
log_step "Step 7: Checking container status..."
docker compose ps
echo ""

# Step 8: Check frontend logs
log_step "Step 8: Checking frontend logs (last 20 lines)..."
docker compose logs frontend --tail=20
echo ""

# Deployment summary
echo "======================================================================"
echo "  DEPLOYMENT COMPLETE!"
echo "======================================================================"
echo ""
log_info "Premium features deployed:"
echo "  1. Analytics - Phân tích thông minh"
echo "  2. Approvals - Phê duyệt & Chữ ký"
echo "  3. Benchmarking - So sánh chuẩn mực"
echo "  4. Lifecycle - Quản lý vòng đời"
echo "  5. API Catalog - Danh mục API"
echo ""
echo "Access the application at:"
echo "  → https://thongkehethong.mindmaid.ai"
echo ""
echo "Next steps:"
echo "  1. Login as admin"
echo "  2. Navigate to each premium feature from the menu"
echo "  3. Verify all features are working correctly"
echo ""
log_warn "Note: All premium features are in BETA mode with sample data"
echo ""
echo "======================================================================"
