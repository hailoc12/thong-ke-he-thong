#!/usr/bin/env bash
# Deploy Excel Export Feature
# Usage: ./deploy-excel-export.sh

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

main() {
    log_step "Deploying Excel Export Feature..."

    # Clear Docker build cache (IMPORTANT for frontend changes)
    log_step "Clearing Docker build cache..."
    docker builder prune -af

    # Rebuild frontend with DOCKER_BUILDKIT=0
    log_step "Rebuilding frontend..."
    DOCKER_BUILDKIT=0 docker compose build frontend --no-cache

    # Restart services
    log_step "Restarting services..."
    docker compose up -d frontend

    log_step "Waiting for frontend to start..."
    sleep 15

    # Health check
    log_step "Running health check..."
    if curl -sf http://localhost:3000/ > /dev/null; then
        log_info "Frontend is healthy"
    else
        log_error "Frontend health check failed"
        exit 1
    fi

    log_info "Excel Export Feature deployed successfully!"
    log_info "Check the 'Xuất Excel' button on Dashboard"
}

main "$@"
