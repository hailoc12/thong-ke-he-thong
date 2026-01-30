#!/bin/bash
# Database Backup Script
# Run this ON THE SERVER
# Can be run manually or via cron job
# Date: 2026-01-28

set -e

# === CONFIGURATION ===
BACKUP_DIR="/home/admin_/backups/postgres"
DB_NAME="system_reports"
DB_USER="postgres"
MAX_BACKUPS=30  # Giữ tối đa 30 file backup (15 ngày nếu chạy mỗi 12h)

# === COLOR CODES ===
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() { echo -e "${GREEN}✓${NC} $1"; }
log_warn() { echo -e "${YELLOW}!${NC} $1"; }
log_error() { echo -e "${RED}✗${NC} $1" >&2; }
log_step() { echo -e "${BLUE}▶${NC} $1"; }

# === MAIN LOGIC ===
main() {
    echo "========================================================================"
    echo "Database Backup - $(date '+%Y-%m-%d %H:%M:%S')"
    echo "========================================================================"

    # Step 1: Create backup directory if not exists
    log_step "Step 1: Kiểm tra và tạo thư mục backup..."
    mkdir -p "$BACKUP_DIR"
    log_info "Backup directory: $BACKUP_DIR"

    # Step 2: Find postgres container
    log_step "Step 2: Tìm postgres container..."
    POSTGRES_CONTAINER=$(docker ps --filter "name=postgres" --format "{{.Names}}" | grep -E "thong-ke-he-thong.*postgres|thong_ke_he_thong.*postgres" | head -1)

    if [ -z "$POSTGRES_CONTAINER" ]; then
        log_error "Không tìm thấy postgres container!"
        echo "Các container đang chạy:"
        docker ps --format "table {{.Names}}\t{{.Status}}"
        exit 1
    fi
    log_info "Found container: $POSTGRES_CONTAINER"

    # Step 3: Generate backup filename with index
    log_step "Step 3: Tạo tên file backup..."

    # Get the highest existing index
    LATEST_INDEX=$(ls -1 "$BACKUP_DIR" 2>/dev/null | grep -oP 'backup_\K\d+(?=_)' | sort -n | tail -1)
    if [ -z "$LATEST_INDEX" ]; then
        NEXT_INDEX=1
    else
        NEXT_INDEX=$((LATEST_INDEX + 1))
    fi

    # Format: backup_NNNN_YYYYMMDD_HHMMSS.sql.gz
    BACKUP_FILENAME="backup_$(printf '%04d' $NEXT_INDEX)_$(date '+%Y%m%d_%H%M%S').sql.gz"
    BACKUP_PATH="$BACKUP_DIR/$BACKUP_FILENAME"

    log_info "Backup file: $BACKUP_FILENAME"

    # Step 4: Check database has data
    log_step "Step 4: Kiểm tra database..."
    RECORD_COUNT=$(docker exec "$POSTGRES_CONTAINER" psql -U "$DB_USER" -d "$DB_NAME" -t -c "SELECT COUNT(*) FROM systems;" 2>/dev/null | tr -d ' ' || echo "0")
    log_info "Current records in systems: $RECORD_COUNT"

    # Step 5: Create backup
    log_step "Step 5: Tạo backup..."

    # Dump and compress in one step
    docker exec "$POSTGRES_CONTAINER" pg_dump -U "$DB_USER" -d "$DB_NAME" | gzip > "$BACKUP_PATH"

    if [ -s "$BACKUP_PATH" ]; then
        BACKUP_SIZE=$(du -h "$BACKUP_PATH" | cut -f1)
        log_info "Backup thành công: $BACKUP_PATH ($BACKUP_SIZE)"
    else
        log_error "Backup thất bại - file rỗng!"
        rm -f "$BACKUP_PATH"
        exit 1
    fi

    # Step 6: Verify backup integrity
    log_step "Step 6: Xác minh backup..."
    if gunzip -t "$BACKUP_PATH" 2>/dev/null; then
        log_info "Backup integrity OK"
    else
        log_error "Backup file bị hỏng!"
        exit 1
    fi

    # Step 7: Cleanup old backups
    log_step "Step 7: Dọn dẹp backup cũ..."
    BACKUP_COUNT=$(ls -1 "$BACKUP_DIR"/backup_*.sql.gz 2>/dev/null | wc -l)

    if [ "$BACKUP_COUNT" -gt "$MAX_BACKUPS" ]; then
        DELETE_COUNT=$((BACKUP_COUNT - MAX_BACKUPS))
        log_warn "Có $BACKUP_COUNT backups, xóa $DELETE_COUNT file cũ nhất..."
        ls -1t "$BACKUP_DIR"/backup_*.sql.gz | tail -n "$DELETE_COUNT" | xargs rm -f
        log_info "Đã xóa $DELETE_COUNT backup cũ"
    else
        log_info "Có $BACKUP_COUNT backups (max: $MAX_BACKUPS)"
    fi

    # Step 8: Summary
    echo ""
    echo "========================================================================"
    echo "✅ Backup hoàn tất!"
    echo "========================================================================"
    echo ""
    echo "File: $BACKUP_PATH"
    echo "Size: $BACKUP_SIZE"
    echo "Records: $RECORD_COUNT systems"
    echo ""
    echo "Restore command:"
    echo "  gunzip -c $BACKUP_PATH | docker exec -i $POSTGRES_CONTAINER psql -U $DB_USER -d $DB_NAME"
    echo ""
}

main "$@"
