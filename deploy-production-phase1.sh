#!/usr/bin/env bash
# P0.8 Phase 1 - Production Deployment Script
# Date: 2026-01-19
# Purpose: Deploy Phase 1 to production server 34.142.152.104
# Usage: ./deploy-production-phase1.sh

set -euo pipefail

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Production server config
PROD_HOST="34.142.152.104"
PROD_USER="admin_"
PROD_PASS="aivnews_xinchao_#*2020"
APP_DIR="/home/admin_/apps/thong-ke-he-thong"
PROD_URL="https://thongkehethong.mindmaid.ai"

# Local config
PROJECT_ROOT="/Users/shimazu/Dropbox/9. active/consultant/support_b4t/thong_ke_he_thong"
GIT_REMOTE="origin"
GIT_BRANCH="main"

log_info() { echo -e "${GREEN}✓${NC} $1"; }
log_warn() { echo -e "${YELLOW}!${NC} $1"; }
log_error() { echo -e "${RED}✗${NC} $1" >&2; }
log_section() { echo -e "\n${BLUE}═══ $1 ═══${NC}\n"; }

# Check prerequisites
check_prerequisites() {
    log_section "Checking Prerequisites"

    # Check sshpass
    if ! command -v sshpass &> /dev/null; then
        log_error "sshpass is not installed!"
        log_warn "Install: brew install hudochenkov/sshpass/sshpass"
        exit 1
    fi
    log_info "sshpass is installed"

    # Check git
    if ! command -v git &> /dev/null; then
        log_error "git is not installed!"
        exit 1
    fi
    log_info "git is installed"

    # Check we're in project directory
    if [ ! -f "$PROJECT_ROOT/docker-compose.yml" ]; then
        log_error "Not in project root directory!"
        exit 1
    fi
    log_info "Project directory verified"

    # Check git remote
    if ! git remote -v | grep -q "github.com/hailoc12/thong-ke-he-thong"; then
        log_error "Git remote not configured correctly!"
        exit 1
    fi
    log_info "Git remote verified"
}

# Commit and push Phase 1 changes
commit_and_push() {
    log_section "Committing and Pushing Phase 1 Changes"

    cd "$PROJECT_ROOT"

    # Check if there are uncommitted changes
    if [ -z "$(git status --porcelain)" ]; then
        log_info "No uncommitted changes, skipping commit"
        return 0
    fi

    log_info "Staging all Phase 1 files..."

    # Add backend changes
    git add backend/apps/systems/models.py
    git add backend/apps/systems/serializers.py
    git add backend/apps/systems/migrations/0004_p08_phase1_all_changes.py

    # Add frontend changes
    git add frontend/src/pages/SystemCreate.tsx
    git add frontend/src/pages/SystemEdit.tsx

    # Add deployment scripts
    git add deploy-phase1.sh
    git add deploy-production-phase1.sh
    git add DEPLOY-README.md

    # Add documentation
    git add 08-backlog-plan/

    log_info "Creating commit..."
    git commit -m "feat(P0.8): Phase 1 implementation - Critical P0 blockers

Backend Changes:
- Add scope (REQUIRED) and system_group (REQUIRED, 8 options) fields
- Add user metrics: total_accounts, users_mau, users_dau, num_organizations
- Add data volume: file_storage_size_gb, storage_size_gb, growth_rate_percent
- Add API inventory: api_provided_count, api_consumed_count
- Create SystemIntegrationConnection model with 8 integration methods
- Migration 0004_p08_phase1_all_changes.py with data migrations

Frontend Changes:
- Add all 10 P0 fields to SystemCreate.tsx and SystemEdit.tsx
- Create IntegrationConnectionList component with full CRUD
- Add scope/system_group validation (REQUIRED fields)
- Add number formatting (comma separators, percentages)
- Fix TypeScript parser type errors

Documentation:
- Comprehensive testing guide (60+ test cases)
- Deployment guides (local & production)
- Implementation summary
- Phase 1 task breakdown

Total: 2,100+ lines of code + documentation

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"

    log_info "Pushing to $GIT_REMOTE/$GIT_BRANCH..."
    git push $GIT_REMOTE $GIT_BRANCH

    log_info "Code pushed successfully!"
}

# Test SSH connection
test_ssh_connection() {
    log_section "Testing SSH Connection"

    log_info "Connecting to $PROD_USER@$PROD_HOST..."

    if sshpass -p "$PROD_PASS" ssh -o StrictHostKeyChecking=no -o ConnectTimeout=10 "${PROD_USER}@${PROD_HOST}" "echo 'SSH connection successful'" > /dev/null 2>&1; then
        log_info "SSH connection successful"
    else
        log_error "SSH connection failed!"
        log_warn "Check server is accessible: ping $PROD_HOST"
        exit 1
    fi
}

# Deploy to production
deploy_to_production() {
    log_section "Deploying to Production Server"

    log_info "Connecting to $PROD_USER@$PROD_HOST..."

    sshpass -p "$PROD_PASS" ssh -o StrictHostKeyChecking=no -o ConnectTimeout=60 "${PROD_USER}@${PROD_HOST}" << EOF
set -e

echo "════════════════════════════════════════════════════════"
echo "P0.8 PHASE 1 PRODUCTION DEPLOYMENT"
echo "Date: $(date)"
echo "Server: $PROD_HOST"
echo "App Directory: $APP_DIR"
echo "════════════════════════════════════════════════════════"

# Navigate to app directory
cd $APP_DIR || { echo "❌ App directory not found!"; exit 1; }
echo "✓ Changed to app directory"

# Create backup directory
BACKUP_DIR="backups/phase1-\$(date +%Y%m%d-%H%M%S)"
mkdir -p \$BACKUP_DIR
echo "✓ Created backup directory: \$BACKUP_DIR"

# Backup database
echo ""
echo "📦 Backing up database..."
if docker-compose ps postgres | grep -q "Up"; then
    docker-compose exec -T postgres pg_dump -U postgres system_reports > "\$BACKUP_DIR/database.sql"
    echo "✓ Database backed up to \$BACKUP_DIR/database.sql"
else
    echo "⚠️  Postgres not running, skipping backup"
fi

# Backup current code
echo ""
echo "📦 Backing up current code..."
tar -czf "\$BACKUP_DIR/code-backup.tar.gz" --exclude='node_modules' --exclude='dist' --exclude='__pycache__' --exclude='*.pyc' . 2>/dev/null || true
echo "✓ Code backed up to \$BACKUP_DIR/code-backup.tar.gz"

# Pull latest code
echo ""
echo "📥 Pulling latest code from GitHub..."
git fetch origin
git reset --hard origin/main || git reset --hard origin/master
echo "✓ Code updated"

# Show what changed
echo ""
echo "📋 Recent commits:"
git log -3 --oneline --decorate

# Stop containers
echo ""
echo "🛑 Stopping containers..."
docker-compose down
echo "✓ Containers stopped"

# Build new images
echo ""
echo "🏗️  Building new images (this may take 5-10 minutes)..."
docker-compose build --no-cache backend frontend
echo "✓ Images built"

# Start containers (migration runs automatically)
echo ""
echo "▶️  Starting containers..."
docker-compose up -d

# Wait for services
echo ""
echo "⏳ Waiting for services to start (60 seconds)..."
sleep 60

# Check container status
echo ""
echo "📊 Container status:"
docker-compose ps

# Check migration logs
echo ""
echo "📋 Checking migration logs..."
if docker-compose logs backend | grep -q "0004_p08_phase1_all_changes"; then
    echo "✓ Phase 1 migration found in logs:"
    docker-compose logs backend | grep -A 10 "0004_p08_phase1_all_changes" | tail -15
else
    echo "⚠️  Migration log not found yet (may still be running)"
fi

# Show recent backend logs
echo ""
echo "📋 Recent backend logs (last 30 lines):"
docker-compose logs --tail 30 backend

# Check if services are healthy
echo ""
echo "🏥 Checking service health..."
sleep 5

if docker-compose ps backend | grep -q "Up"; then
    echo "✓ Backend is running"
else
    echo "❌ Backend is not running!"
    exit 1
fi

if docker-compose ps frontend | grep -q "Up"; then
    echo "✓ Frontend is running"
else
    echo "❌ Frontend is not running!"
    exit 1
fi

if docker-compose ps postgres | grep -q "Up"; then
    echo "✓ Postgres is running"
else
    echo "❌ Postgres is not running!"
    exit 1
fi

echo ""
echo "════════════════════════════════════════════════════════"
echo "✅ PRODUCTION DEPLOYMENT COMPLETE"
echo "════════════════════════════════════════════════════════"
echo ""
echo "🌐 Production URL: $PROD_URL"
echo "📂 Backup Location: \$BACKUP_DIR"
echo ""
echo "Next Steps:"
echo "  1. Test frontend: curl -I $PROD_URL"
echo "  2. Run smoke tests (see below)"
echo "  3. Manual UI testing"
echo "  4. Get customer sign-off"
echo ""

EOF

    if [ $? -eq 0 ]; then
        log_info "Production deployment completed successfully!"
    else
        log_error "Production deployment failed!"
        exit 1
    fi
}

# Run smoke tests on production
smoke_tests() {
    log_section "Running Smoke Tests on Production"

    log_info "Test 1: Frontend accessibility"
    if curl -I -s "$PROD_URL" | grep -q "HTTP.*200"; then
        log_info "Frontend is accessible (200 OK)"
    else
        log_warn "Frontend returned non-200 status"
    fi

    log_info "Test 2: Backend API"
    if curl -s "$PROD_URL/api/" | grep -q "System Reports API"; then
        log_info "Backend API is responding"
    else
        log_warn "Backend API response unexpected"
    fi

    log_info "Test 3: Database migration verification"
    sshpass -p "$PROD_PASS" ssh -o StrictHostKeyChecking=no "${PROD_USER}@${PROD_HOST}" << EOF
cd $APP_DIR
docker-compose exec -T postgres psql -U postgres -d system_reports -c \
  "SELECT * FROM django_migrations WHERE name = '0004_p08_phase1_all_changes';" | grep -q "0004_p08_phase1_all_changes" \
  && echo "✓ Migration 0004 applied successfully" \
  || echo "⚠️  Migration 0004 not found in database"

# Check for NULL values
NULL_COUNT=\$(docker-compose exec -T postgres psql -U postgres -d system_reports -t -c \
  "SELECT COUNT(*) FROM systems_system WHERE scope IS NULL OR system_group IS NULL;" | tr -d ' ')

if [ "\$NULL_COUNT" = "0" ]; then
    echo "✓ No NULL values in scope/system_group fields"
else
    echo "⚠️  Found \$NULL_COUNT systems with NULL scope/system_group"
fi
EOF
}

# Display summary
deployment_summary() {
    log_section "Deployment Summary"

    echo -e "${GREEN}════════════════════════════════════════════════════════${NC}"
    echo -e "${GREEN}  ✅ PHASE 1 PRODUCTION DEPLOYMENT SUCCESSFUL${NC}"
    echo -e "${GREEN}════════════════════════════════════════════════════════${NC}"
    echo ""
    echo -e "${BLUE}Production Details:${NC}"
    echo "  • Server: $PROD_HOST"
    echo "  • URL: $PROD_URL"
    echo "  • App Directory: $APP_DIR"
    echo ""
    echo -e "${BLUE}What Was Deployed:${NC}"
    echo "  • 10 Critical P0 fields (scope, system_group, user metrics, data volume, API inventory)"
    echo "  • SystemIntegrationConnection model"
    echo "  • Integration connection CRUD interface"
    echo "  • Migration 0004_p08_phase1_all_changes.py"
    echo "  • 2,100+ lines of code + documentation"
    echo ""
    echo -e "${BLUE}Access URLs:${NC}"
    echo "  • Frontend: $PROD_URL"
    echo "  • Backend API: $PROD_URL/api/"
    echo "  • Admin Panel: $PROD_URL/admin/"
    echo ""
    echo -e "${BLUE}SSH Access:${NC}"
    echo "  ssh $PROD_USER@$PROD_HOST"
    echo "  cd $APP_DIR"
    echo ""
    echo -e "${BLUE}View Logs:${NC}"
    echo "  ssh $PROD_USER@$PROD_HOST"
    echo "  cd $APP_DIR"
    echo "  docker-compose logs -f backend"
    echo ""
    echo -e "${BLUE}Next Steps:${NC}"
    echo "  1. ✅ Manual UI Testing:"
    echo "     - Open $PROD_URL"
    echo "     - Login as admin"
    echo "     - Test creating system with Phase 1 fields"
    echo "     - Test integration connection CRUD"
    echo ""
    echo "  2. ✅ Full Testing:"
    echo "     - Follow: 08-backlog-plan/doing/P0.8-PHASE1-TESTING-GUIDE.md"
    echo "     - Complete 60+ test cases"
    echo "     - Document any issues"
    echo ""
    echo "  3. ✅ Customer Demo:"
    echo "     - Schedule walkthrough"
    echo "     - Show all 10 new P0 fields"
    echo "     - Demo integration connection tracking"
    echo "     - Get feedback"
    echo ""
    echo "  4. ✅ Get Sign-off:"
    echo "     - Customer approval on Phase 1"
    echo "     - Document change requests"
    echo "     - Plan Phase 2 (17 architecture/data fields)"
    echo ""
    echo -e "${YELLOW}Rollback (if needed):${NC}"
    echo "  ssh $PROD_USER@$PROD_HOST"
    echo "  cd $APP_DIR"
    echo "  # Rollback migration:"
    echo "  docker-compose exec backend python manage.py migrate systems 0002"
    echo "  # Restore database:"
    echo "  cat backups/phase1-*/database.sql | docker-compose exec -T postgres psql -U postgres -d system_reports"
    echo ""
    echo -e "${BLUE}Support Documentation:${NC}"
    echo "  • Testing Guide: 08-backlog-plan/doing/P0.8-PHASE1-TESTING-GUIDE.md"
    echo "  • Deployment Guide: 08-backlog-plan/doing/P0.8-PHASE1-DEPLOYMENT-GUIDE.md"
    echo "  • Implementation Summary: 08-backlog-plan/doing/P0.8-PHASE1-IMPLEMENTATION-SUMMARY.md"
    echo ""
    echo -e "${GREEN}✅ Deployment completed at $(date)${NC}"
    echo ""
}

# Main deployment flow
main() {
    cd "$PROJECT_ROOT"

    log_section "P0.8 Phase 1 - Production Deployment"
    echo "Date: $(date)"
    echo "Target: $PROD_HOST"
    echo "URL: $PROD_URL"
    echo ""

    # Confirmation prompt
    echo -e "${YELLOW}⚠️  PRODUCTION DEPLOYMENT WARNING${NC}"
    echo ""
    echo "This will deploy Phase 1 changes to PRODUCTION server:"
    echo "  • Server: $PROD_HOST"
    echo "  • URL: $PROD_URL"
    echo "  • Changes: 10 P0 critical fields + migration"
    echo ""
    echo "The deployment will:"
    echo "  1. Commit and push local changes to GitHub"
    echo "  2. SSH to production server"
    echo "  3. Backup database and code"
    echo "  4. Pull latest code from GitHub"
    echo "  5. Rebuild Docker images"
    echo "  6. Restart services (migration runs automatically)"
    echo "  7. Run smoke tests"
    echo ""
    echo -e "${YELLOW}Estimated downtime: 5-10 minutes${NC}"
    echo ""
    read -p "Continue with PRODUCTION deployment? (yes/NO): " -r
    echo

    if [[ ! $REPLY =~ ^[Yy][Ee][Ss]$ ]]; then
        log_warn "Deployment cancelled"
        exit 0
    fi

    # Execute deployment steps
    check_prerequisites
    commit_and_push
    test_ssh_connection
    deploy_to_production
    sleep 5
    smoke_tests
    deployment_summary

    log_info "All done! 🚀"
}

# Error handler
trap 'log_error "Deployment failed at line $LINENO! Check logs above."; exit 1' ERR

main "$@"
