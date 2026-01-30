#!/bin/bash
# Recover Data from Old Docker Volume
# Run this ON THE SERVER
# Date: 2026-01-28

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
echo "Khôi phục dữ liệu từ Docker Volume cũ"
echo "========================================================================"
echo ""
echo "Vấn đề: Khi chuyển từ Docker Compose project 'thong_ke_he_thong'"
echo "        sang 'thong-ke-he-thong', volume mới được tạo -> mất data"
echo ""
echo "Giải pháp: Dump data từ volume cũ và restore vào database mới"
echo ""

# Step 1: Check if old volume exists
log_step "Step 1: Kiểm tra volume cũ..."
if docker volume ls | grep -q "thong_ke_he_thong_postgres_data"; then
    log_info "Tìm thấy volume cũ: thong_ke_he_thong_postgres_data"
else
    log_error "Không tìm thấy volume cũ: thong_ke_he_thong_postgres_data"
    echo "Các volume hiện có:"
    docker volume ls
    exit 1
fi

# Step 2: Check if temp container already exists
log_step "Step 2: Kiểm tra và tạo temp container..."
if docker ps -a | grep -q "temp_old_postgres"; then
    log_warn "Container temp_old_postgres đã tồn tại, đang xóa..."
    docker rm -f temp_old_postgres 2>/dev/null || true
fi

# Start temp container with old volume
docker run -d \
    --name temp_old_postgres \
    -v thong_ke_he_thong_postgres_data:/var/lib/postgresql/data \
    -e POSTGRES_HOST_AUTH_METHOD=trust \
    postgres:14-alpine
log_info "Đã tạo temp container với volume cũ"

# Wait for postgres to be ready
log_step "Step 3: Chờ PostgreSQL khởi động..."
echo -n "Waiting"
for i in {1..30}; do
    sleep 1
    echo -n "."
    if docker exec temp_old_postgres pg_isready -U postgres > /dev/null 2>&1; then
        echo ""
        log_info "PostgreSQL đã sẵn sàng!"
        break
    fi
    if [ $i -eq 30 ]; then
        echo ""
        log_error "PostgreSQL không khởi động được sau 30 giây"
        docker logs temp_old_postgres
        exit 1
    fi
done

# Step 4: Check databases in old volume
log_step "Step 4: Kiểm tra databases trong volume cũ..."
echo "Databases:"
docker exec temp_old_postgres psql -U postgres -c "\\l" | grep -E "Name|system"
echo ""

# Step 5: Check if system_reports exists and has data
log_step "Step 5: Kiểm tra dữ liệu trong system_reports..."
OLD_COUNT=$(docker exec temp_old_postgres psql -U postgres -d system_reports -t -c "SELECT COUNT(*) FROM systems;" 2>/dev/null | tr -d ' ' || echo "0")
if [ "$OLD_COUNT" -gt 0 ]; then
    log_info "Tìm thấy $OLD_COUNT systems trong database cũ!"
else
    log_error "Không có dữ liệu trong database cũ"
    # Try other table names
    log_warn "Thử tìm với tên bảng khác..."
    docker exec temp_old_postgres psql -U postgres -d system_reports -c "\\dt" 2>/dev/null || true
    docker rm -f temp_old_postgres
    exit 1
fi

# Step 6: Dump data from old database
log_step "Step 6: Dump dữ liệu từ database cũ..."
BACKUP_FILE="/tmp/system_reports_backup_$(date +%Y%m%d_%H%M%S).sql"
docker exec temp_old_postgres pg_dump -U postgres -d system_reports --data-only --inserts > "$BACKUP_FILE"
if [ -s "$BACKUP_FILE" ]; then
    BACKUP_SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
    log_info "Đã dump data ra: $BACKUP_FILE ($BACKUP_SIZE)"
else
    log_error "File backup rỗng!"
    docker rm -f temp_old_postgres
    exit 1
fi

# Step 7: Check new postgres container
log_step "Step 7: Kiểm tra container mới..."
NEW_CONTAINER=$(docker ps --filter "name=postgres" --format "{{.Names}}" | grep -E "thong-ke-he-thong.*postgres" | head -1)
if [ -z "$NEW_CONTAINER" ]; then
    log_error "Không tìm thấy container postgres mới (thong-ke-he-thong-*-postgres-*)"
    echo "Các container đang chạy:"
    docker ps --format "table {{.Names}}\t{{.Status}}"
    docker rm -f temp_old_postgres
    exit 1
fi
log_info "Container mới: $NEW_CONTAINER"

# Step 8: Check current data in new container
log_step "Step 8: Kiểm tra dữ liệu hiện tại trong container mới..."
NEW_COUNT=$(docker exec "$NEW_CONTAINER" psql -U postgres -d system_reports -t -c "SELECT COUNT(*) FROM systems;" 2>/dev/null | tr -d ' ' || echo "0")
log_warn "Hiện có $NEW_COUNT systems trong database mới"

if [ "$NEW_COUNT" -gt 0 ]; then
    echo ""
    log_warn "⚠️  Database mới đã có $NEW_COUNT records!"
    read -p "Bạn có muốn xóa data cũ và restore từ backup không? (y/n): " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        log_warn "Hủy bỏ. File backup vẫn được giữ tại: $BACKUP_FILE"
        docker rm -f temp_old_postgres
        exit 0
    fi

    # Clear existing data
    log_step "Xóa dữ liệu hiện tại..."
    docker exec "$NEW_CONTAINER" psql -U postgres -d system_reports -c "TRUNCATE systems CASCADE;" 2>/dev/null || true
fi

# Step 9: Restore data to new container
log_step "Step 9: Restore dữ liệu vào database mới..."
# First, try to disable foreign key checks during restore
docker exec -i "$NEW_CONTAINER" psql -U postgres -d system_reports -c "SET session_replication_role = replica;" 2>/dev/null || true

# Restore the data
cat "$BACKUP_FILE" | docker exec -i "$NEW_CONTAINER" psql -U postgres -d system_reports

# Re-enable foreign key checks
docker exec -i "$NEW_CONTAINER" psql -U postgres -d system_reports -c "SET session_replication_role = DEFAULT;" 2>/dev/null || true

log_info "Đã restore dữ liệu!"

# Step 10: Verify restore
log_step "Step 10: Xác minh kết quả..."
FINAL_COUNT=$(docker exec "$NEW_CONTAINER" psql -U postgres -d system_reports -t -c "SELECT COUNT(*) FROM systems;" | tr -d ' ')
log_info "Số systems sau khi restore: $FINAL_COUNT"

if [ "$FINAL_COUNT" -eq "$OLD_COUNT" ]; then
    log_info "✅ Khôi phục thành công! ($FINAL_COUNT systems)"
else
    log_warn "⚠️ Số lượng records khác nhau: cũ=$OLD_COUNT, mới=$FINAL_COUNT"
    log_warn "Có thể do constraints hoặc foreign keys. Kiểm tra logs để xem chi tiết."
fi

# Step 11: Cleanup
log_step "Step 11: Dọn dẹp..."
docker rm -f temp_old_postgres
log_info "Đã xóa temp container"

echo ""
echo "========================================================================"
echo "✅ Hoàn tất khôi phục dữ liệu!"
echo "========================================================================"
echo ""
echo "File backup được lưu tại: $BACKUP_FILE"
echo ""
echo "Kiểm tra trên web:"
echo "  1. Refresh trang https://your-domain/systems"
echo "  2. Kiểm tra danh sách systems hiển thị đúng"
echo ""
echo "Nếu cần khôi phục lại:"
echo "  cat $BACKUP_FILE | docker exec -i $NEW_CONTAINER psql -U postgres -d system_reports"
echo ""
