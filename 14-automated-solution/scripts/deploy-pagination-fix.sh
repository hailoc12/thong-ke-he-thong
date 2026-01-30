#!/usr/bin/env bash
# Deploy pagination fix to production
# This fixes the bug where page_size=1000 was not being respected

set -euo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log_info() { echo -e "${GREEN}✓${NC} $1"; }
log_warn() { echo -e "${YELLOW}!${NC} $1"; }
log_error() { echo -e "${RED}✗${NC} $1" >&2; }

REMOTE_USER="admin_"
REMOTE_HOST="34.142.152.104"
REMOTE_PATH="/home/admin_/thong_ke_he_thong"

log_info "Deploying pagination fix to production"

# Step 1: Copy new pagination.py file
log_info "Copying config/pagination.py to production..."
scp backend/config/pagination.py ${REMOTE_USER}@${REMOTE_HOST}:${REMOTE_PATH}/backend/config/

# Step 2: Copy updated settings.py
log_info "Copying updated settings.py to production..."
scp backend/config/settings.py ${REMOTE_USER}@${REMOTE_HOST}:${REMOTE_PATH}/backend/config/

# Step 3: Restart backend to apply changes
log_info "Restarting backend container..."
ssh ${REMOTE_USER}@${REMOTE_HOST} "cd ${REMOTE_PATH} && docker compose restart backend"

# Step 4: Wait for backend to be healthy
log_info "Waiting for backend to restart (30 seconds)..."
sleep 30

# Step 5: Verify backend is running
log_info "Checking backend status..."
ssh ${REMOTE_USER}@${REMOTE_HOST} "cd ${REMOTE_PATH} && docker compose ps backend"

log_info "Deployment complete!"
log_warn "Please test Excel export to verify all 77 systems are included"
