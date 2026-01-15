#!/usr/bin/env bash
# Deployment script for Production Server
# Usage: ./deploy.sh
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

# Configuration
APP_NAME="thong_ke_he_thong"
DEPLOY_DIR="/opt/${APP_NAME}"
BACKUP_DIR="/opt/backups/${APP_NAME}"
DATE=$(date +%Y%m%d_%H%M%S)

main() {
    log_step "Starting deployment for ${APP_NAME}..."

    # Check requirements
    check_requirements

    # Create backup
    create_backup

    # Pull latest code
    pull_code

    # Build and deploy
    build_services

    # Run migrations
    run_migrations

    # Start services
    start_services

    # Health check
    health_check

    log_info "Deployment completed successfully!"
}

check_requirements() {
    log_step "Checking requirements..."

    if ! command -v docker &> /dev/null; then
        log_error "Docker is not installed"
        exit 1
    fi

    if ! command -v git &> /dev/null; then
        log_error "Git is not installed"
        exit 1
    fi

    log_info "All requirements met"
}

create_backup() {
    log_step "Creating backup..."

    mkdir -p "${BACKUP_DIR}"

    # Backup database
    if docker compose ps | grep -q postgres; then
        log_step "Backing up database..."
        docker compose exec -T postgres pg_dump -U postgres system_reports > "${BACKUP_DIR}/db_backup_${DATE}.sql"
        log_info "Database backed up to ${BACKUP_DIR}/db_backup_${DATE}.sql"
    fi

    # Backup media files
    if [ -d "backend/media" ]; then
        log_step "Backing up media files..."
        tar -czf "${BACKUP_DIR}/media_backup_${DATE}.tar.gz" backend/media/
        log_info "Media files backed up"
    fi
}

pull_code() {
    log_step "Pulling latest code from repository..."

    if [ -d .git ]; then
        git fetch origin
        git pull origin main || git pull origin master
        log_info "Code updated to latest version"
    else
        log_warn "Not a git repository, skipping pull"
    fi
}

build_services() {
    log_step "Building Docker images..."

    # Stop services first
    log_step "Stopping existing services..."
    docker compose down

    # Build with no cache for clean build
    log_step "Building frontend..."
    docker compose build --no-cache frontend

    log_step "Building backend..."
    docker compose build --no-cache backend

    log_info "All services built successfully"
}

run_migrations() {
    log_step "Running database migrations..."

    # Start only database and backend for migrations
    docker compose up -d postgres

    # Wait for postgres to be ready
    log_step "Waiting for database to be ready..."
    sleep 10

    docker compose up -d backend
    sleep 5

    # Run migrations
    docker compose exec backend python manage.py migrate

    # Collect static files
    log_step "Collecting static files..."
    docker compose exec backend python manage.py collectstatic --noinput

    log_info "Migrations completed"
}

start_services() {
    log_step "Starting all services..."

    docker compose up -d

    log_step "Waiting for services to start..."
    sleep 10

    log_info "All services started"
}

health_check() {
    log_step "Running health checks..."

    # Check frontend
    if curl -sf http://localhost/health > /dev/null; then
        log_info "Frontend is healthy"
    else
        log_error "Frontend health check failed"
        exit 1
    fi

    # Check backend
    if curl -sf http://localhost:8000/api/ > /dev/null; then
        log_info "Backend is healthy"
    else
        log_error "Backend health check failed"
        exit 1
    fi

    # Check database
    if docker compose exec postgres pg_isready -U postgres > /dev/null; then
        log_info "Database is healthy"
    else
        log_error "Database health check failed"
        exit 1
    fi

    log_info "All health checks passed"
}

# Run main function
main "$@"
