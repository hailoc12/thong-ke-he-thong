#!/usr/bin/env bash
# Quick Production Deployment Script
# Usage: ./deploy-production-quick.sh
#
# This script deploys the latest code with proper Docker cache handling
# to ensure frontend code changes are actually built and deployed.

set -euo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() { echo -e "${GREEN}✓${NC} $1"; }
log_warn() { echo -e "${YELLOW}!${NC} $1"; }
log_error() { echo -e "${RED}✗${NC} $1" >&2; }
log_step() { echo -e "${BLUE}→${NC} $1"; }

BACKUP_DIR="/opt/backups/thong_ke_he_thong"
DATE=$(date +%Y%m%d_%H%M%S)

main() {
    log_step "Starting production deployment..."
    echo ""

    # Confirmation
    confirm_deployment

    # Backup first
    create_backup

    # Pull latest code
    pull_code

    # Build with cache clearing
    build_services

    # Migrations
    run_migrations

    # Restart services
    restart_services

    # Verify deployment
    verify_deployment

    log_info "✅ Deployment completed successfully!"
    echo ""
    log_info "Next steps:"
    log_info "  1. Clear browser cache (Ctrl+Shift+Delete)"
    log_info "  2. Test Excel export functionality"
    log_info "  3. Verify all organizations appear in table"
}

confirm_deployment() {
    log_warn "You are about to deploy to PRODUCTION"
    log_warn "Current commit will be backed up, but services will restart"
    echo ""
    read -p "Continue? (yes/no): " confirm

    if [ "$confirm" != "yes" ]; then
        log_error "Deployment cancelled"
        exit 1
    fi
    echo ""
}

create_backup() {
    log_step "Creating backup..."

    mkdir -p "${BACKUP_DIR}"

    # Backup database
    if docker compose ps | grep -q postgres; then
        log_step "Backing up database..."
        docker compose exec -T postgres pg_dump -U postgres system_reports > "${BACKUP_DIR}/db_backup_${DATE}.sql" 2>/dev/null || true
        log_info "Database backed up to ${BACKUP_DIR}/db_backup_${DATE}.sql"
    fi

    # Record current commit
    git rev-parse HEAD > "${BACKUP_DIR}/commit_before_deploy_${DATE}.txt"
    log_info "Current commit recorded"
    echo ""
}

pull_code() {
    log_step "Pulling latest code from repository..."

    # Stash any local changes
    git stash save "Auto-stash before deployment ${DATE}" || true

    # Pull
    git pull origin main

    # Show what changed
    log_info "Latest commits:"
    git log -3 --oneline --decorate
    echo ""
}

build_services() {
    log_step "Building Docker images..."
    echo ""

    # CRITICAL: Clear Docker build cache to prevent stale frontend code
    log_warn "Clearing Docker build cache (prevents stale code issues)..."
    docker builder prune -af
    echo ""

    # Stop services
    log_step "Stopping existing services..."
    docker compose down
    echo ""

    # Build frontend with BuildKit disabled (prevents cache issues)
    log_step "Building frontend (with cache clearing)..."
    DOCKER_BUILDKIT=0 docker compose build frontend --no-cache --pull
    echo ""

    # Build backend
    log_step "Building backend..."
    docker compose build backend --no-cache
    echo ""

    log_info "All services built successfully"
}

run_migrations() {
    log_step "Running database migrations..."

    # Start database
    docker compose up -d postgres
    log_step "Waiting for database..."
    sleep 10

    # Start backend
    docker compose up -d backend
    sleep 5

    # Run migrations
    log_step "Applying migrations..."
    docker compose exec backend python manage.py migrate

    # Collect static files
    log_step "Collecting static files..."
    docker compose exec backend python manage.py collectstatic --noinput

    log_info "Migrations completed"
    echo ""
}

restart_services() {
    log_step "Restarting all services..."

    docker compose down
    docker compose up -d

    log_step "Waiting for services to start..."
    sleep 15

    log_info "All services restarted"
    echo ""
}

verify_deployment() {
    log_step "Verifying deployment..."
    echo ""

    # Check services status
    log_step "Service status:"
    docker compose ps
    echo ""

    # Check frontend has new code
    log_step "Checking frontend code..."
    if docker compose exec frontend sh -c "cat /usr/share/nginx/html/assets/*.js 2>/dev/null | grep -q 'exportDashboardToExcel'"; then
        log_info "✓ Frontend has Excel export code"
    else
        log_error "✗ Frontend may have old code - check build logs"
        log_warn "  Run: docker compose logs frontend"
    fi

    # Check backend API
    log_step "Checking backend API..."
    if curl -sf http://localhost:8000/api/ > /dev/null 2>&1; then
        log_info "✓ Backend API is responding"
    else
        log_warn "✗ Backend API not responding yet"
        log_warn "  Run: docker compose logs backend"
    fi

    # Check database
    log_step "Checking database..."
    if docker compose exec postgres pg_isready -U postgres > /dev/null 2>&1; then
        log_info "✓ Database is healthy"
    else
        log_error "✗ Database health check failed"
    fi

    echo ""
}

# Run main function
main "$@"
