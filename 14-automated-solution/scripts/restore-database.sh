#!/bin/bash
# Database Restore Script
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

# === CONFIGURATION ===
BACKUP_DIR="/home/admin_/backups/postgres"
DB_NAME="system_reports"
DB_USER="postgres"

# === USAGE ===
usage() {
    echo "Usage: $0 [backup_file]"
    echo ""
    echo "Arguments:"
    echo "  backup_file    Path to backup file (.sql.gz or .sql)"
    echo "                 If not provided, will list available backups"
    echo ""
    echo "Examples:"
    echo "  $0                                    # List available backups"
    echo "  $0 latest                             # Restore latest backup"
    echo "  $0 /home/admin_/backups/postgres/backup_0001_20260128_120000.sql.gz"
    echo ""
    exit 1
}

# === MAIN LOGIC ===
main() {
    echo "========================================================================"
    echo "Database Restore - $(date '+%Y-%m-%d %H:%M:%S')"
    echo "========================================================================"

    # Step 1: Find postgres container
    log_step "Step 1: Tìm postgres container..."
    POSTGRES_CONTAINER=$(docker ps --filter "name=postgres" --format "{{.Names}}" | grep -E "thong-ke-he-thong.*postgres|thong_ke_he_thong.*postgres" | head -1)

    if [ -z "$POSTGRES_CONTAINER" ]; then
        log_error "Không tìm thấy postgres container!"
        docker ps --format "table {{.Names}}\t{{.Status}}"
        exit 1
    fi
    log_info "Found container: $POSTGRES_CONTAINER"

    # Step 2: Determine backup file
    BACKUP_FILE="$1"

    if [ -z "$BACKUP_FILE" ]; then
        # List available backups
        log_step "Step 2: Liệt kê các backup có sẵn..."
        echo ""
        echo "Available backups in $BACKUP_DIR:"
        echo ""
        if [ -d "$BACKUP_DIR" ] && [ "$(ls -A $BACKUP_DIR/*.sql.gz 2>/dev/null)" ]; then
            ls -lh "$BACKUP_DIR"/*.sql.gz | awk '{print NR". "$9" ("$5")"}'
            echo ""
            echo "Để restore, chạy:"
            echo "  $0 <đường_dẫn_file>"
            echo "  $0 latest    # restore file mới nhất"
        else
            log_warn "Không có backup nào trong $BACKUP_DIR"
        fi
        exit 0
    fi

    if [ "$BACKUP_FILE" = "latest" ]; then
        BACKUP_FILE=$(ls -t "$BACKUP_DIR"/*.sql.gz 2>/dev/null | head -1)
        if [ -z "$BACKUP_FILE" ]; then
            log_error "Không tìm thấy backup nào!"
            exit 1
        fi
        log_info "Latest backup: $BACKUP_FILE"
    fi

    # Step 3: Check backup file exists
    log_step "Step 2: Kiểm tra file backup..."
    if [ ! -f "$BACKUP_FILE" ]; then
        log_error "File không tồn tại: $BACKUP_FILE"
        exit 1
    fi

    BACKUP_SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
    log_info "Backup file: $BACKUP_FILE ($BACKUP_SIZE)"

    # Step 4: Check current data
    log_step "Step 3: Kiểm tra dữ liệu hiện tại..."
    CURRENT_COUNT=$(docker exec "$POSTGRES_CONTAINER" psql -U "$DB_USER" -d "$DB_NAME" -t -c "SELECT COUNT(*) FROM systems;" 2>/dev/null | tr -d ' ' || echo "0")
    log_warn "Hiện có $CURRENT_COUNT systems trong database"

    # Step 5: Confirm restore
    echo ""
    log_warn "⚠️  CẢNH BÁO: Restore sẽ XÓA toàn bộ dữ liệu hiện tại!"
    echo ""
    read -p "Bạn có chắc chắn muốn restore? (yes/no): " -r
    echo ""
    if [[ ! "$REPLY" = "yes" ]]; then
        log_info "Hủy bỏ restore"
        exit 0
    fi

    # Step 6: Create a backup of current data first
    log_step "Step 4: Backup dữ liệu hiện tại trước..."
    CURRENT_BACKUP="$BACKUP_DIR/pre_restore_$(date '+%Y%m%d_%H%M%S').sql.gz"
    docker exec "$POSTGRES_CONTAINER" pg_dump -U "$DB_USER" -d "$DB_NAME" | gzip > "$CURRENT_BACKUP"
    log_info "Đã backup dữ liệu hiện tại: $CURRENT_BACKUP"

    # Step 7: Drop and recreate database
    log_step "Step 5: Reset database..."
    docker exec "$POSTGRES_CONTAINER" psql -U "$DB_USER" -c "DROP DATABASE IF EXISTS ${DB_NAME};"
    docker exec "$POSTGRES_CONTAINER" psql -U "$DB_USER" -c "CREATE DATABASE ${DB_NAME};"
    log_info "Database đã được reset"

    # Step 8: Restore from backup
    log_step "Step 6: Restore từ backup..."

    if [[ "$BACKUP_FILE" == *.gz ]]; then
        # Compressed backup
        gunzip -c "$BACKUP_FILE" | docker exec -i "$POSTGRES_CONTAINER" psql -U "$DB_USER" -d "$DB_NAME"
    else
        # Uncompressed backup
        cat "$BACKUP_FILE" | docker exec -i "$POSTGRES_CONTAINER" psql -U "$DB_USER" -d "$DB_NAME"
    fi
    log_info "Restore hoàn tất!"

    # Step 9: Verify restore
    log_step "Step 7: Xác minh kết quả..."
    NEW_COUNT=$(docker exec "$POSTGRES_CONTAINER" psql -U "$DB_USER" -d "$DB_NAME" -t -c "SELECT COUNT(*) FROM systems;" 2>/dev/null | tr -d ' ' || echo "0")
    log_info "Số systems sau restore: $NEW_COUNT"

    # Step 10: Run migrations (in case schema changed)
    log_step "Step 8: Chạy migrations..."
    BACKEND_CONTAINER=$(docker ps --filter "name=backend" --format "{{.Names}}" | grep -E "thong-ke-he-thong.*backend|thong_ke_he_thong.*backend" | head -1)
    if [ -n "$BACKEND_CONTAINER" ]; then
        docker exec "$BACKEND_CONTAINER" python manage.py migrate --noinput 2>/dev/null || log_warn "Migrations có thể cần chạy thủ công"
    fi

    echo ""
    echo "========================================================================"
    echo "✅ Restore hoàn tất!"
    echo "========================================================================"
    echo ""
    echo "Kết quả:"
    echo "  • Trước: $CURRENT_COUNT systems"
    echo "  • Sau: $NEW_COUNT systems"
    echo ""
    echo "Backup dữ liệu cũ: $CURRENT_BACKUP"
    echo ""
    echo "Nếu cần rollback:"
    echo "  $0 $CURRENT_BACKUP"
    echo ""
}

# Check for help
if [ "$1" = "-h" ] || [ "$1" = "--help" ]; then
    usage
fi

main "$@"
