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
#   -h, --help        Show this help message
#
# Examples:
#   ./scripts/test-ai-assistant.sh              # Run all tests
#   ./scripts/test-ai-assistant.sh -b           # Run backend tests only
#   ./scripts/test-ai-assistant.sh -f -v        # Run frontend tests with verbose output
#   ./scripts/test-ai-assistant.sh -a -c        # Run all tests with coverage
#
# Exit codes:
#   0 - All tests passed
#   1 - One or more tests failed
#   2 - Invalid arguments
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
