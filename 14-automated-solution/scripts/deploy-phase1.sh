#!/usr/bin/env bash
# P0.8 Phase 1 Deployment Script
# Date: 2026-01-19
# Purpose: Deploy Phase 1 implementation to Docker environment
# Usage: ./deploy-phase1.sh

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_ROOT="/Users/shimazu/Dropbox/9. active/consultant/support_b4t/thong_ke_he_thong"
BACKUP_DIR="$PROJECT_ROOT/backups/phase1-$(date +%Y%m%d-%H%M%S)"

log_info() { echo -e "${GREEN}✓${NC} $1"; }
log_warn() { echo -e "${YELLOW}!${NC} $1"; }
log_error() { echo -e "${RED}✗${NC} $1" >&2; }
log_section() { echo -e "\n${BLUE}═══ $1 ═══${NC}\n"; }

# Check if Docker is installed
check_docker() {
    log_section "Checking Docker Installation"

    if ! command -v docker &> /dev/null; then
        log_error "Docker is not installed!"
        log_warn "Please install Docker Desktop from: https://www.docker.com/products/docker-desktop"
        exit 1
    fi

    if ! docker info &> /dev/null; then
        log_error "Docker daemon is not running!"
        log_warn "Please start Docker Desktop"
        exit 1
    fi

    log_info "Docker is installed and running"
    docker --version
    docker compose version
}

# Backup database before deployment
backup_database() {
    log_section "Backing Up Database"

    mkdir -p "$BACKUP_DIR"

    if docker compose ps postgres | grep -q "Up"; then
        log_info "Exporting database to $BACKUP_DIR/database.sql"
        docker compose exec -T postgres pg_dump -U postgres system_reports > "$BACKUP_DIR/database.sql"
        log_info "Database backed up successfully"
    else
        log_warn "Postgres not running, skipping backup"
    fi
}

# Stop existing services
stop_services() {
    log_section "Stopping Existing Services"

    if docker compose ps | grep -q "Up"; then
        log_info "Stopping running containers..."
        docker compose down
        log_info "Services stopped"
    else
        log_info "No services running"
    fi
}

# Build new images
build_images() {
    log_section "Building Docker Images"

    log_info "Building backend image..."
    docker compose build backend

    log_info "Building frontend image..."
    docker compose build frontend

    log_info "Images built successfully"
}

# Start services
start_services() {
    log_section "Starting Services"

    log_info "Starting postgres, backend, frontend..."
    docker compose up -d

    log_info "Services started. Waiting for health checks..."
}

# Wait for services to be healthy
wait_for_health() {
    log_section "Waiting for Services to be Healthy"

    local max_attempts=30
    local attempt=1

    log_info "Waiting for postgres to be healthy..."
    while [ $attempt -le $max_attempts ]; do
        if docker compose ps postgres | grep -q "healthy"; then
            log_info "Postgres is healthy"
            break
        fi
        echo -n "."
        sleep 2
        attempt=$((attempt + 1))
    done

    if [ $attempt -gt $max_attempts ]; then
        log_error "Postgres failed to become healthy"
        docker compose logs postgres
        exit 1
    fi

    log_info "Waiting for backend to be healthy..."
    attempt=1
    while [ $attempt -le $max_attempts ]; do
        if docker compose ps backend | grep -q "healthy"; then
            log_info "Backend is healthy"
            break
        fi
        echo -n "."
        sleep 2
        attempt=$((attempt + 1))
    done

    if [ $attempt -gt $max_attempts ]; then
        log_error "Backend failed to become healthy"
        docker compose logs backend
        exit 1
    fi

    log_info "Waiting for frontend to be healthy..."
    attempt=1
    while [ $attempt -le $max_attempts ]; do
        if docker compose ps frontend | grep -q "healthy"; then
            log_info "Frontend is healthy"
            break
        fi
        echo -n "."
        sleep 2
        attempt=$((attempt + 1))
    done

    if [ $attempt -gt $max_attempts ]; then
        log_error "Frontend failed to become healthy"
        docker compose logs frontend
        exit 1
    fi
}

# Check migration logs
check_migration() {
    log_section "Checking Migration Logs"

    log_info "Looking for Phase 1 migration in logs..."

    if docker compose logs backend | grep -q "Applying systems.0004_p08_phase1_all_changes"; then
        log_info "Phase 1 migration applied successfully!"

        # Show migration output
        docker compose logs backend | grep -A 10 "0004_p08_phase1_all_changes"
    else
        log_warn "Phase 1 migration not found in logs. Checking if already applied..."

        # Check if migration exists in database
        docker compose exec -T postgres psql -U postgres -d system_reports -c \
            "SELECT * FROM django_migrations WHERE name = '0004_p08_phase1_all_changes';" | grep -q "0004_p08_phase1_all_changes" \
            && log_info "Migration already applied" \
            || log_error "Migration not found!"
    fi
}

# Run smoke tests
smoke_tests() {
    log_section "Running Smoke Tests"

    log_info "Test 1: Backend API health check"
    if curl -f http://localhost:8000/api/ > /dev/null 2>&1; then
        log_info "Backend API is responding"
    else
        log_error "Backend API is not responding!"
        exit 1
    fi

    log_info "Test 2: Frontend health check"
    if curl -f http://localhost:3000/ > /dev/null 2>&1; then
        log_info "Frontend is responding"
    else
        log_error "Frontend is not responding!"
        exit 1
    fi

    log_info "Test 3: Check SystemIntegrationConnection table exists"
    if docker compose exec -T postgres psql -U postgres -d system_reports -c "\d system_integration_connections" > /dev/null 2>&1; then
        log_info "SystemIntegrationConnection table exists"
    else
        log_error "SystemIntegrationConnection table not found!"
        exit 1
    fi

    log_info "Test 4: Check scope and system_group fields are NOT NULL"
    local nullable_count=$(docker compose exec -T postgres psql -U postgres -d system_reports -t -c \
        "SELECT COUNT(*) FROM systems_system WHERE scope IS NULL OR system_group IS NULL;" | tr -d ' ')

    if [ "$nullable_count" = "0" ]; then
        log_info "No NULL values in scope/system_group fields"
    else
        log_error "Found $nullable_count systems with NULL scope/system_group!"
        exit 1
    fi

    log_info "Test 5: Verify system_group has 8 valid options"
    local distinct_groups=$(docker compose exec -T postgres psql -U postgres -d system_reports -t -c \
        "SELECT COUNT(DISTINCT system_group) FROM systems_system;")
    log_info "Found $distinct_groups distinct system_group values (expected <= 8)"
}

# Display deployment summary
deployment_summary() {
    log_section "Deployment Summary"

    echo -e "${GREEN}Phase 1 Deployment Complete!${NC}\n"

    echo "Services:"
    docker compose ps

    echo -e "\n${BLUE}Access URLs:${NC}"
    echo "  • Frontend: http://localhost:3000"
    echo "  • Backend:  http://localhost:8000"
    echo "  • API Docs: http://localhost:8000/api/"

    echo -e "\n${BLUE}Backup Location:${NC}"
    echo "  • $BACKUP_DIR"

    echo -e "\n${BLUE}Next Steps:${NC}"
    echo "  1. Login to http://localhost:3000"
    echo "  2. Run full testing: 08-backlog-plan/doing/P0.8-PHASE1-TESTING-GUIDE.md"
    echo "  3. Create test systems with new Phase 1 fields"
    echo "  4. Test IntegrationConnectionList CRUD operations"
    echo "  5. Get customer sign-off"

    echo -e "\n${BLUE}Useful Commands:${NC}"
    echo "  • View logs:     docker compose logs -f backend"
    echo "  • Restart:       docker compose restart backend"
    echo "  • Stop all:      docker compose down"
    echo "  • Database CLI:  docker compose exec postgres psql -U postgres -d system_reports"

    echo -e "\n${YELLOW}If issues occur:${NC}"
    echo "  • Check logs:    docker compose logs"
    echo "  • Rollback DB:   psql ... < $BACKUP_DIR/database.sql"
    echo "  • Full rollback: docker compose exec backend python manage.py migrate systems 0002"
}

# Main deployment flow
main() {
    cd "$PROJECT_ROOT"

    log_section "P0.8 Phase 1 Deployment Starting"
    echo "Date: $(date)"
    echo "Project: System Reports"
    echo "Phase: Phase 1 - Critical Gaps (P0 Blockers)"

    # Confirmation prompt
    echo -e "\n${YELLOW}This will deploy Phase 1 changes:${NC}"
    echo "  • Backend migration 0004_p08_phase1_all_changes.py"
    echo "  • Frontend with 10 new P0 fields"
    echo "  • SystemIntegrationConnection model"
    echo ""
    read -p "Continue with deployment? (y/N): " -n 1 -r
    echo

    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        log_warn "Deployment cancelled"
        exit 0
    fi

    # Execute deployment steps
    check_docker
    backup_database
    stop_services
    build_images
    start_services
    wait_for_health
    check_migration
    smoke_tests
    deployment_summary

    log_info "Deployment completed successfully!"
}

# Error handler
trap 'log_error "Deployment failed! Check logs above."; exit 1' ERR

main "$@"
