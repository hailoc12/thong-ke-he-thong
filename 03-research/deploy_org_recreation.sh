#!/usr/bin/env bash
# Script: deploy_org_recreation.sh
# Purpose: Deploy organization recreation to production server
# Usage: ./deploy_org_recreation.sh [--dry-run] [--execute]
# Created: 2026-01-21

set -euo pipefail

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() { echo -e "${GREEN}✓${NC} $1"; }
log_warn() { echo -e "${YELLOW}!${NC} $1"; }
log_error() { echo -e "${RED}✗${NC} $1" >&2; }
log_step() { echo -e "${BLUE}==>${NC} $1"; }

# Configuration
PROD_SERVER="admin_@34.142.152.104"
EXCEL_FILE="/Users/shimazu/Dropbox/9. active/consultant/support_b4t/thong_ke_he_thong/03-research/danh-sach-tai-khoan-don-vi-NEW.xlsx"
BACKEND_DIR="/home/admin_/thong_ke_he_thong"
CONTAINER_NAME="thong_ke_he_thong-backend-1"

# Parse arguments
DRY_RUN=true
EXECUTE=false

while [[ $# -gt 0 ]]; do
    case $1 in
        --execute)
            EXECUTE=true
            DRY_RUN=false
            shift
            ;;
        --dry-run)
            DRY_RUN=true
            EXECUTE=false
            shift
            ;;
        *)
            log_error "Unknown option: $1"
            exit 1
            ;;
    esac
done

# Banner
echo ""
echo -e "${RED}╔════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${RED}║  PRODUCTION DATABASE RECREATION - DANGER ZONE                  ║${NC}"
echo -e "${RED}╚════════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Show configuration
log_step "Configuration"
echo "  Server:     $PROD_SERVER"
echo "  Container:  $CONTAINER_NAME"
echo "  Excel file: $EXCEL_FILE"
echo "  Mode:       $([ "$DRY_RUN" = true ] && echo 'DRY RUN' || echo 'EXECUTE')"
echo ""

# Pre-flight checks
log_step "Pre-flight checks"

# Check Excel file exists
if [ ! -f "$EXCEL_FILE" ]; then
    log_error "Excel file not found: $EXCEL_FILE"
    exit 1
fi
log_info "Excel file exists"

# Check SSH connection
if ! ssh -o ConnectTimeout=5 "$PROD_SERVER" "exit" 2>/dev/null; then
    log_error "Cannot connect to production server"
    exit 1
fi
log_info "SSH connection OK"

# Check Docker container is running
if ! ssh "$PROD_SERVER" "docker ps --filter name=$CONTAINER_NAME --format '{{.Names}}'" | grep -q "$CONTAINER_NAME"; then
    log_error "Backend container is not running"
    exit 1
fi
log_info "Backend container is running"

echo ""

# Show current database state
log_step "Current production database state"
ssh "$PROD_SERVER" "docker exec $CONTAINER_NAME python manage.py shell -c \"
from apps.accounts.models import User
from apps.organizations.models import Organization

total_users = User.objects.count()
admin_users = User.objects.filter(role='admin').count()
org_users = User.objects.filter(role='org_user').count()
total_orgs = Organization.objects.count()

print(f'Organizations: {total_orgs}')
print(f'Total users:   {total_users}')
print(f'Admin users:   {admin_users}')
print(f'Org users:     {org_users}')
\"" | grep -v "^$"

echo ""

# Upload Excel file
log_step "Uploading Excel file to server"
scp -q "$EXCEL_FILE" "$PROD_SERVER:$BACKEND_DIR/danh-sach-tai-khoan-don-vi-NEW.xlsx"
log_info "Excel file uploaded"

echo ""

# Execute recreation command
if [ "$DRY_RUN" = true ]; then
    log_step "Running DRY RUN mode (no changes will be made)"

    ssh "$PROD_SERVER" "docker exec $CONTAINER_NAME python manage.py recreate_organizations \
        --excel /app/../danh-sach-tai-khoan-don-vi-NEW.xlsx \
        --dry-run"

    echo ""
    log_warn "DRY RUN completed - no changes were made"
    log_warn "Review the output above"
    log_warn "To execute for real, run: $0 --execute"

elif [ "$EXECUTE" = true ]; then
    log_step "EXECUTING RECREATION - This will DELETE and RECREATE data!"

    echo ""
    log_warn "═══════════════════════════════════════════════════════════════"
    log_warn "FINAL WARNING: This will permanently delete all organizations"
    log_warn "and organization users from the production database!"
    log_warn "═══════════════════════════════════════════════════════════════"
    echo ""

    read -p "Type 'I UNDERSTAND THE RISKS' to continue: " confirmation

    if [ "$confirmation" != "I UNDERSTAND THE RISKS" ]; then
        log_error "Aborted by user"
        exit 1
    fi

    echo ""
    log_step "Executing recreation command..."

    # Execute with backup (remove --yes to require confirmation on server)
    ssh "$PROD_SERVER" "docker exec -i $CONTAINER_NAME python manage.py recreate_organizations \
        --excel /app/../danh-sach-tai-khoan-don-vi-NEW.xlsx \
        --yes"

    echo ""
    log_info "Recreation completed!"

    # Show final state
    echo ""
    log_step "Final database state"
    ssh "$PROD_SERVER" "docker exec $CONTAINER_NAME python manage.py shell -c \"
from apps.accounts.models import User
from apps.organizations.models import Organization

total_users = User.objects.count()
admin_users = User.objects.filter(role='admin').count()
org_users = User.objects.filter(role='org_user').count()
total_orgs = Organization.objects.count()

print(f'Organizations: {total_orgs}')
print(f'Total users:   {total_users}')
print(f'Admin users:   {admin_users}')
print(f'Org users:     {org_users}')
\"" | grep -v "^$"

    echo ""
    log_info "All done! Organizations and users have been recreated."

else
    log_error "Invalid mode. Use --dry-run or --execute"
    exit 1
fi

echo ""
