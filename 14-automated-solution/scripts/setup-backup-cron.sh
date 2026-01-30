#!/bin/bash
# Setup Automatic Database Backup Cron Job
# Run this ON THE SERVER (one time only)
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
APP_DIR="/home/admin_/thong-ke-he-thong"
BACKUP_SCRIPT="$APP_DIR/backup-database.sh"
LOG_DIR="/home/admin_/backups/logs"

echo "========================================================================"
echo "Cài đặt Cron Job Backup Database Tự động"
echo "========================================================================"
echo ""
echo "Schedule: Mỗi 12 giờ (00:00 và 12:00)"
echo "Script: $BACKUP_SCRIPT"
echo ""

# Step 1: Check if backup script exists
log_step "Step 1: Kiểm tra backup script..."
if [ ! -f "$BACKUP_SCRIPT" ]; then
    log_error "Không tìm thấy backup script: $BACKUP_SCRIPT"
    echo "Vui lòng chạy: git pull origin main"
    exit 1
fi
log_info "Found: $BACKUP_SCRIPT"

# Step 2: Make script executable
log_step "Step 2: Cấp quyền thực thi..."
chmod +x "$BACKUP_SCRIPT"
log_info "chmod +x $BACKUP_SCRIPT"

# Step 3: Create log directory
log_step "Step 3: Tạo thư mục log..."
mkdir -p "$LOG_DIR"
log_info "Log directory: $LOG_DIR"

# Step 4: Create cron entry
log_step "Step 4: Tạo cron job..."

# Cron schedule: Run at 00:00 and 12:00 every day
CRON_SCHEDULE="0 0,12 * * *"
CRON_COMMAND="$BACKUP_SCRIPT >> $LOG_DIR/backup_\$(date +\\%Y\\%m\\%d).log 2>&1"
CRON_ENTRY="$CRON_SCHEDULE $CRON_COMMAND"

# Check if cron entry already exists
EXISTING_CRON=$(crontab -l 2>/dev/null | grep -F "backup-database.sh" || true)

if [ -n "$EXISTING_CRON" ]; then
    log_warn "Cron job đã tồn tại:"
    echo "  $EXISTING_CRON"
    echo ""
    read -p "Bạn có muốn thay thế không? (y/n): " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        log_info "Giữ nguyên cron job hiện tại"
        exit 0
    fi
    # Remove existing entry
    crontab -l 2>/dev/null | grep -vF "backup-database.sh" | crontab -
fi

# Add new cron entry
(crontab -l 2>/dev/null; echo "$CRON_ENTRY") | crontab -
log_info "Đã thêm cron job"

# Step 5: Verify cron
log_step "Step 5: Xác minh cron job..."
echo ""
echo "Cron jobs hiện tại:"
crontab -l | grep -v "^#" | grep -v "^$"
echo ""

# Step 6: Run first backup now
log_step "Step 6: Chạy backup đầu tiên ngay bây giờ..."
echo ""
"$BACKUP_SCRIPT"

echo ""
echo "========================================================================"
echo "✅ Cài đặt hoàn tất!"
echo "========================================================================"
echo ""
echo "Cron schedule: $CRON_SCHEDULE (00:00 và 12:00 mỗi ngày)"
echo ""
echo "Các file quan trọng:"
echo "  • Backup script: $BACKUP_SCRIPT"
echo "  • Backup folder: /home/admin_/backups/postgres/"
echo "  • Log folder: $LOG_DIR/"
echo ""
echo "Kiểm tra backup:"
echo "  ls -la /home/admin_/backups/postgres/"
echo ""
echo "Kiểm tra logs:"
echo "  cat $LOG_DIR/backup_\$(date +%Y%m%d).log"
echo ""
echo "Chạy backup thủ công:"
echo "  $BACKUP_SCRIPT"
echo ""
echo "Xóa cron job:"
echo "  crontab -l | grep -v backup-database.sh | crontab -"
echo ""
