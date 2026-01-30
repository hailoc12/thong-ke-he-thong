#!/bin/bash
# Deploy Excel Export Feature to Server
# Run this ON THE SERVER after pushing changes
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
echo "Deploying: Excel Export Feature for Systems"
echo "========================================================================"
echo ""
echo "This feature adds:"
echo "  • Backend: GET /api/systems/export_data/ - Export all system details"
echo "  • Frontend: Export button + modal on Systems page"
echo "  • Frontend: exportSystemsDetailToExcel utility (13 sheets)"
echo ""
echo "Sheets: Cơ bản, Nghiệp vụ, Kiến trúc, Dữ liệu, Tích hợp, Bảo mật,"
echo "        Hạ tầng, Vận hành, Đánh giá, Chi phí L2, NCC L2,"
echo "        Hạ tầng L2, Bảo mật L2"
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

# Step 3: Stop backend container
log_step "Step 3: Stopping backend container..."
docker compose stop backend
log_info "Backend stopped"

# Step 4: Build backend (no cache)
log_step "Step 4: Building backend with fresh code..."
docker compose build backend --no-cache
log_info "Backend built successfully"

# Step 5: Start backend
log_step "Step 5: Starting backend..."
docker compose up -d backend
log_info "Backend started"

# Step 6: Stop frontend container
log_step "Step 6: Stopping frontend container..."
docker compose stop frontend
log_info "Frontend stopped"

# Step 7: Clear Docker build cache for frontend
log_step "Step 7: Clearing Docker build cache..."
docker builder prune -af
log_info "Build cache cleared"

# Step 8: Build frontend (no cache, BuildKit disabled)
log_step "Step 8: Building frontend with fresh code (BuildKit disabled)..."
log_warn "This may take 3-5 minutes..."
DOCKER_BUILDKIT=0 docker compose build frontend --no-cache
log_info "Frontend built successfully"

# Step 9: Start frontend
log_step "Step 9: Starting frontend..."
docker compose up -d frontend
log_info "Frontend started"

# Step 10: Wait for services to be ready
log_step "Step 10: Waiting for services to be ready..."
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

# Step 11: Verify export endpoint works
log_step "Step 11: Verifying export endpoint..."
if docker compose exec -T backend curl -s http://localhost:8000/api/systems/export_data/ | grep -q "results"; then
    log_info "Export endpoint works!"
else
    log_warn "Export endpoint may require authentication"
fi

echo ""
echo "========================================================================"
echo "✅ Deployment Complete!"
echo "========================================================================"
echo ""
echo "Test the feature:"
echo "  1. Go to https://your-domain/systems"
echo "  2. Click 'Xuất Excel' button"
echo "  3. Select 'Xuất tất cả' or 'Chỉ xuất kết quả tìm kiếm'"
echo "  4. Click 'Xuất file'"
echo "  5. Excel file should download with 13 sheets"
echo ""
echo "Troubleshooting:"
echo "  • Check backend logs: docker compose logs backend"
echo "  • Check frontend logs: docker compose logs frontend"
echo "  • Check frontend JS: docker compose exec frontend cat /usr/share/nginx/html/assets/*.js | grep exportSystemsDetailToExcel"
echo ""
