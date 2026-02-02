#!/usr/bin/env bash
# =============================================================================
# AI Assistant Feature Test Runner
# =============================================================================
# This script runs all unit tests for the AI Assistant feature
# Usage: ./scripts/test-ai-assistant.sh [options]
#
# Options:
#   -b, --backend     Run backend tests only
#   -f, --frontend    Run frontend tests only
#   -a, --all         Run all tests (default)
#   -v, --verbose     Verbose output
#   -c, --coverage    Generate coverage report
#   --unsafe          ALLOW running on production database (DANGEROUS!)
#   -h, --help        Show this help message
#
# WARNING: This script creates a SEPARATE test database by default.
# NEVER run with --reuse-db or --no-migrations on production!
#
# Examples:
#   ./scripts/test-ai-assistant.sh              # Run all tests (safe - uses test DB)
#   ./scripts/test-ai-assistant.sh -b           # Run backend tests only
#   ./scripts/test-ai-assistant.sh -f -v        # Run frontend tests with verbose output
#   ./scripts/test-ai-assistant.sh -a -c        # Run all tests with coverage
#
# Exit codes:
#   0 - All tests passed
#   1 - One or more tests failed
#   2 - Invalid arguments
#   3 - Safety check failed (production database detected)
# =============================================================================

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Configuration
BACKEND_DIR="$PROJECT_ROOT/backend"
FRONTEND_DIR="$PROJECT_ROOT/frontend"
BACKEND_TEST_FILE="apps/systems/tests/test_ai_assistant.py"
FRONTEND_TEST_FILE="frontend/src/components/__tests__/StrategicDashboard.test.tsx"

# Options
RUN_BACKEND=false
RUN_FRONTEND=false
RUN_ALL=true
VERBOSE=false
COVERAGE=false
UNSAFE_MODE=false

# Safety flag: Detect production environment
PRODUCTION_HOSTS=("34.142.152.104" "hientrangcds.mst.gov.vn")

# =============================================================================
# Helper Functions
# =============================================================================

log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

log_section() {
    echo -e "\n${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}  $1${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"
}

show_help() {
    grep '^#' "$SCRIPT_DIR/test-ai-assistant.sh" | sed 's/^# //' | sed 's/^#//'
    exit 0
}

# =============================================================================
# Safety Checks
# =============================================================================

check_production_safety() {
    """Check if running on production and warn user"""

    # Get current hostname
    local current_host
    current_host=$(hostname 2>/dev/null || echo "unknown")

    # Check if we're on a known production host
    for prod_host in "${PRODUCTION_HOSTS[@]}"; do
        if [[ "$current_host" == "$prod_host" ]] || [[ "$current_host" == *"admin_"* ]]; then
            log_warn "⚠️  PRODUCTION ENVIRONMENT DETECTED: $current_host"
            echo ""
            log_error "Running tests on production will create test data in the database!"
            log_error "This includes test users, conversations, and messages."
            echo ""

            if [[ "$UNSAFE_MODE" == true ]]; then
                log_warn "⚠️  --unsafe flag is set. Proceeding with production tests..."
                log_warn "⚠️  Test data WILL be created. You have been warned!"
                echo ""
                # Add a 5 second delay to allow user to cancel
                for i in {5..1}; do
                    echo -e "${YELLOW}Starting in $i seconds... (Ctrl+C to cancel)${NC}"
                    sleep 1
                done
                return 0
            else
                log_error "❌ Refusing to run tests on production without --unsafe flag"
                echo ""
                log_info "To run tests anyway (NOT RECOMMENDED):"
                log_info "  $0 --unsafe"
                echo ""
                log_info "Better alternative: Run tests in a staging/development environment"
                return 1
            fi
        fi
    done

    # Not on production - safe to proceed
    log_info "✅ Environment check passed (not production)"
    return 0
}

check_test_data_pollution() {
    """Check if test data exists in database and warn"""

    if [[ "$UNSAFE_MODE" == true ]]; then
        log_warn "⚠️  Checking for existing test data..."

        # Check for test users
        local test_user_count
        test_user_count=$(docker compose exec -T backend python manage.py shell -c "
from apps.accounts.models import User
print(User.objects.filter(username__startswith='test').count())
" 2>/dev/null || echo "0")

        if [[ "$test_user_count" -gt 0 ]]; then
            log_warn "⚠️  Found $test_user_count test users in database"
        fi

        # Check for test conversations
        local test_convo_count
        test_convo_count=$(docker compose exec -T backend python manage.py shell -c "
from apps.systems.models import AIConversation
print(AIConversation.objects.filter(title__startswith='Test').count())
" 2>/dev/null || echo "0")

        if [[ "$test_convo_count" -gt 0 ]]; then
            log_warn "⚠️  Found $test_convo_count test conversations in database"
        fi
    fi
}

# =============================================================================
# Backend Tests
# =============================================================================

run_backend_tests() {
    log_section "Running Backend Tests"

    cd "$BACKEND_DIR"

    # Check if test file exists
    if [[ ! -f "$BACKEND_TEST_FILE" ]]; then
        log_error "Backend test file not found: $BACKEND_TEST_FILE"
        return 1
    fi

    # Build pytest command
    local pytest_cmd="docker compose exec backend python -m pytest"

    if [[ "$VERBOSE" == true ]]; then
        pytest_cmd="$pytest_cmd -v"
    else
        pytest_cmd="$pytest_cmd -q"
    fi

    if [[ "$COVERAGE" == true ]]; then
        pytest_cmd="$pytest_cmd --cov=apps.systems --cov-report=term-missing --cov-report=html"
    fi

    pytest_cmd="$pytest_cmd apps/systems/tests/test_ai_assistant.py"

    log_info "Running: $pytest_cmd"

    if eval "$pytest_cmd"; then
        log_info "✅ Backend tests passed!"
        return 0
    else
        log_error "❌ Backend tests failed!"
        return 1
    fi
}

# =============================================================================
# Frontend Tests
# =============================================================================

run_frontend_tests() {
    log_section "Running Frontend Tests"

    cd "$FRONTEND_DIR"

    # Check if test file exists
    if [[ ! -f "$FRONTEND_TEST_FILE" ]]; then
        log_error "Frontend test file not found: $FRONTEND_TEST_FILE"
        return 1
    fi

    # Check if vitest is available
    if ! docker compose exec -T frontend npx vitest --version &>/dev/null; then
        log_error "vitest not found. Installing..."
        docker compose exec frontend npm install -D vitest @vitest/ui @testing-library/react @testing-library/jest-dom @testing-library/user-event happy-dom
    fi

    # Build vitest command
    local vitest_cmd="docker compose exec -T frontend npx vitest run"

    if [[ "$VERBOSE" == true ]]; then
        vitest_cmd="$vitest_cmd --reporter=verbose"
    fi

    if [[ "$COVERAGE" == true ]]; then
        vitest_cmd="$vitest_cmd --coverage"
    fi

    log_info "Running: $vitest_cmd"

    if eval "$vitest_cmd"; then
        log_info "✅ Frontend tests passed!"
        return 0
    else
        log_error "❌ Frontend tests failed!"
        return 1
    fi
}

# =============================================================================
# Main Execution
# =============================================================================

parse_arguments() {
    while [[ $# -gt 0 ]]; do
        case $1 in
            -b|--backend)
                RUN_BACKEND=true
                RUN_ALL=false
                shift
                ;;
            -f|--frontend)
                RUN_FRONTEND=true
                RUN_ALL=false
                shift
                ;;
            -a|--all)
                RUN_ALL=true
                shift
                ;;
            -v|--verbose)
                VERBOSE=true
                shift
                ;;
            -c|--coverage)
                COVERAGE=true
                shift
                ;;
            --unsafe)
                UNSAFE_MODE=true
                shift
                ;;
            -h|--help)
                show_help
                ;;
            *)
                log_error "Unknown option: $1"
                show_help
                exit 2
                ;;
        esac
    done
}

main() {
    log_info "AI Assistant Feature Test Runner"
    log_info "================================"

    parse_arguments "$@"

    # Safety checks - prevent running on production
    if ! check_production_safety; then
        exit 3
    fi

    # Check for existing test data pollution
    check_test_data_pollution

    # Track results
    local backend_result=0
    local frontend_result=0

    # Run tests based on options
    if [[ "$RUN_ALL" == true ]] || [[ "$RUN_BACKEND" == true ]]; then
        if ! run_backend_tests; then
            backend_result=1
        fi
    fi

    if [[ "$RUN_ALL" == true ]] || [[ "$RUN_FRONTEND" == true ]]; then
        if ! run_frontend_tests; then
            frontend_result=1
        fi
    fi

    # Print summary
    log_section "Test Summary"

    if [[ "$RUN_ALL" == true ]] || [[ "$RUN_BACKEND" == true ]]; then
        if [[ $backend_result -eq 0 ]]; then
            log_info "✅ Backend: PASSED"
        else
            log_error "❌ Backend: FAILED"
        fi
    fi

    if [[ "$RUN_ALL" == true ]] || [[ "$RUN_FRONTEND" == true ]]; then
        if [[ $frontend_result -eq 0 ]]; then
            log_info "✅ Frontend: PASSED"
        else
            log_error "❌ Frontend: FAILED"
        fi
    fi

    # Coverage report location
    if [[ "$COVERAGE" == true ]]; then
        log_info "Coverage reports generated:"
        if [[ "$RUN_ALL" == true ]] || [[ "$RUN_BACKEND" == true ]]; then
            log_info "  - Backend: backend/htmlcov/index.html"
        fi
        if [[ "$RUN_ALL" == true ]] || [[ "$RUN_FRONTEND" == true ]]; then
            log_info "  - Frontend: frontend/coverage/index.html"
        fi
    fi

    # Exit with appropriate code
    if [[ $backend_result -eq 0 ]] && [[ $frontend_result -eq 0 ]]; then
        log_info "\n🎉 All tests passed!"
        exit 0
    else
        log_error "\n❌ Some tests failed!"
        exit 1
    fi
}

# Run main function
main "$@"
