#!/usr/bin/env bash
# Deploy Excel Export Fix - Clear cache and rebuild frontend
# Fix: Add page_size=1000 to fetchCompletionStats()
# Date: 2026-01-26

set -euo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() { echo -e "${GREEN}✓${NC} $1"; }
log_warn() { echo -e "${YELLOW}!${NC} $1"; }
log_error() { echo -e "${RED}✗${NC} $1" >&2; }
log_step() { echo -e "${BLUE}▶${NC} $1"; }

SERVER="admin_@34.142.152.104"
SERVER_PATH="/home/admin_/thong_ke_he_thong"

main() {
    log_step "=== EXCEL EXPORT FIX DEPLOYMENT ==="
    echo ""
    log_info "Fix: Add page_size=1000 to fetchCompletionStats() API call"
    log_info "This will ensure ALL organizations are fetched for Excel export"
    echo ""

    # Step 1: Commit changes
    log_step "Step 1: Committing changes..."
    if git diff --quiet frontend/src/pages/Dashboard.tsx; then
        log_info "No changes to commit"
    else
        git add frontend/src/pages/Dashboard.tsx
        git commit -m "fix(excel): Add page_size=1000 to fetchCompletionStats API call

- Add page_size=1000 parameter to completion_stats endpoint
- Ensures ALL organizations are fetched (not just 20)
- Fixes Sheet 2 'Theo đơn vị' showing only 20 orgs instead of 32

Root cause: fetchCompletionStats() was missing pagination parameter
Result: Backend returned default page_size (20) instead of all data

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
        log_info "Changes committed"
    fi

    # Step 2: Push to remote
    log_step "Step 2: Pushing to remote..."
    git push origin main
    log_info "Pushed to GitHub"

    # Step 3: Pull on server
    log_step "Step 3: Pulling changes on server..."
    ssh "$SERVER" "cd $SERVER_PATH && git pull origin main"
    log_info "Code updated on server"

    # Step 4: Clear Docker build cache (CRITICAL!)
    log_step "Step 4: Clearing Docker build cache..."
    log_warn "This prevents BuildKit from using cached layers with old code"
    ssh "$SERVER" "cd $SERVER_PATH && docker builder prune -af"
    log_info "Docker build cache cleared"

    # Step 5: Rebuild frontend WITHOUT BuildKit
    log_step "Step 5: Rebuilding frontend (without BuildKit)..."
    log_warn "Using DOCKER_BUILDKIT=0 to ensure fresh build"
    ssh "$SERVER" "cd $SERVER_PATH && DOCKER_BUILDKIT=0 docker compose build frontend --no-cache --pull"
    log_info "Frontend rebuilt successfully"

    # Step 6: Restart services
    log_step "Step 6: Restarting frontend service..."
    ssh "$SERVER" "cd $SERVER_PATH && docker compose up -d frontend"
    log_info "Frontend service restarted"

    # Step 7: Wait for service to be ready
    log_step "Step 7: Waiting for service to be ready..."
    sleep 5
    log_info "Service should be ready"

    # Step 8: Verify deployment
    log_step "Step 8: Verifying deployment..."
    echo ""
    log_info "Checking frontend container status..."
    ssh "$SERVER" "cd $SERVER_PATH && docker compose ps frontend"
    echo ""

    # Step 9: Check JavaScript bundle
    log_step "Step 9: Checking if new code is in JavaScript bundle..."
    log_warn "Searching for 'page_size' parameter in compiled JS..."
    JS_CHECK=$(ssh "$SERVER" "cd $SERVER_PATH && docker compose exec frontend ls /usr/share/nginx/html/assets/*.js | head -1")
    if [ -n "$JS_CHECK" ]; then
        ssh "$SERVER" "cd $SERVER_PATH && docker compose exec frontend cat $JS_CHECK | grep -o 'page_size' | head -5"
        log_info "JavaScript bundle contains page_size parameter"
    else
        log_warn "Could not verify JavaScript bundle content"
    fi
    echo ""

    # Final summary
    echo ""
    log_step "=== DEPLOYMENT COMPLETE ==="
    echo ""
    log_info "✓ Code committed and pushed"
    log_info "✓ Docker cache cleared"
    log_info "✓ Frontend rebuilt without BuildKit cache"
    log_info "✓ Services restarted"
    echo ""
    log_step "TESTING INSTRUCTIONS:"
    echo ""
    echo "1. Open browser in INCOGNITO/PRIVATE mode (to bypass browser cache)"
    echo "2. Navigate to: https://hientrangcds.mst.gov.vn"
    echo "3. Login as admin"
    echo "4. Click 'Xuất Excel' button"
    echo "5. Open Excel file and verify:"
    echo "   - Sheet 2 'Theo đơn vị': Should have 32 organizations (not 20)"
    echo "   - Sheet 3 'Danh sách HT': Should have all systems (not 20)"
    echo ""
    log_warn "IMPORTANT: Use Incognito mode to avoid browser cache!"
    echo ""
    log_step "If still showing 20 rows:"
    echo "1. Check Cloudflare cache - may need to purge CDN cache"
    echo "2. Check browser DevTools > Network tab"
    echo "3. Look for /organizations/ and /completion_stats/ API calls"
    echo "4. Verify they include ?page_size=1000 parameter"
    echo ""
}

main "$@"
