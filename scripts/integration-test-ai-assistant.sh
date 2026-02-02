#!/usr/bin/env bash
# =============================================================================
# AI Assistant Integration Test Runner
# =============================================================================
# This script runs integration tests that make ACTUAL API requests.
# These tests should ONLY be run on NON-PRODUCTION environments.
#
# WARNING: These tests make REAL API calls and create REAL data!
# DO NOT run on production without explicit confirmation!
#
# Usage: ./scripts/integration-test-ai-assistant.sh [options]
#
# Options:
#   --force         Force run even on production (requires confirmation)
#   -v, --verbose   Verbose output
#   --show-skipped  Show skipped tests
#   -h, --help      Show this help message
#
# Exit codes:
#   0 - All tests passed
#   1 - One or more tests failed
#   2 - Invalid arguments
#   3 - Safety check failed (production environment)
#   4 - User cancelled forced run
# =============================================================================

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
NC='\033[0m' # No Color

# Script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Configuration
BACKEND_DIR="$PROJECT_ROOT/backend"
INTEGRATION_TEST_FILE="apps/systems/tests/integration_test_ai_assistant.py"

# Production hosts to protect
PRODUCTION_HOSTS=("34.142.152.104" "hientrangcds.mst.gov.vn")

# Options
FORCE_RUN=false
VERBOSE=false
SHOW_SKIPPED=false

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

print_warning() {
    echo -e "\n${MAGENTA}╔════════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${MAGENTA}║${NC} ${YELLOW}⚠️  WARNING: INTEGRATION TESTS${NC}                         ${MAGENTA}║${NC}"
    echo -e "${MAGENTA}╠════════════════════════════════════════════════════════════════╣${NC}"
    echo -e "${MAGENTA}║${NC} These tests make ${RED}ACTUAL API calls${NC} and create ${RED}REAL data${NC}!    ${MAGENTA}║${NC}"
    echo -e "${MAGENTA}║${NC}                                                                ${MAGENTA}║${NC}"
    echo -e "${MAGENTA}║${NC} Tests will:                                                     ${MAGERA}║${NC}"
    echo -e "${MAGENTA}║${NC}  • Create real user accounts                                    ${MAGENTA}║${NC}"
    echo -e "${MAGENTA}║${NC}  • Create real conversations                                    ${MAGENTA}║${NC}"
    echo -e "${MAGENTA}║${NC}  • Add real messages to conversations                           ${MAGENTA}║${NC}"
    echo -e "${MAGENTA}║${NC}  • Make real AI API calls                                      ${MAGENTA}║${NC}"
    echo -e "${MAGENTA}║${NC}                                                                ${MAGENTA}║${NC}"
    echo -e "${MAGENTA}║${NC} ${RED}NEVER run on production!${NC}                                   ${MAGENTA}║${NC}"
    echo -e "${MAGENTA}╚════════════════════════════════════════════════════════════════╝${NC}\n"
}

print_test_summary() {
    log_section "Integration Test Summary"
    echo -e "${GREEN}Test Coverage:${NC}"
    echo "  ✓ Conversation CRUD operations (10 tests)"
    echo "  ✓ AI Query streaming (quick & deep mode) (2 tests)"
    echo "  ✓ AI Request Logging (2 tests)"
    echo "  ✓ Error Handling (5 tests)"
    echo ""
    echo -e "${BLUE}Total: 19 integration tests${NC}"
    echo ""
    echo -e "${YELLOW}What these tests do:${NC}"
    echo "  • Make real HTTP requests to the API"
    echo "  • Test full user flow from login to AI query"
    echo "  • Verify SSE streaming works end-to-end"
    echo "  • Validate response data structure"
    echo "  • Test error handling with invalid inputs"
    echo ""
}

show_help() {
    grep '^#' "$SCRIPT_DIR/integration-test-ai-assistant.sh" | sed 's/^# //' | sed 's/^#//'
    exit 0
}

# =============================================================================
# Safety Checks
# =============================================================================

check_production_safety() {
    """Check if running on production and block/confirm"""

    # Get current hostname
    local current_host
    current_host=$(hostname 2>/dev/null || echo "unknown")

    # Check if we're on a known production host
    for prod_host in "${PRODUCTION_HOSTS[@]}"; do
        if [[ "$current_host" == "$prod_host" ]] || [[ "$current_host" == *"admin_"* ]]; then
            log_error "⛔ PRODUCTION ENVIRONMENT DETECTED: $current_host"
            echo ""

            if [[ "$FORCE_RUN" == true ]]; then
                print_warning

                log_warn "⚠️  --force flag is set. Are you REALLY sure?"
                echo ""
                echo -e "${RED}This will create TEST DATA in your production database!${NC}"
                echo ""
                echo -n "Type 'YES-I-UNDERSTAND-THE-RISKS' to proceed: "
                read -r confirmation

                if [[ "$confirmation" == "YES-I-UNDERSTAND-THE-RISKS" ]]; then
                    log_warn "⚠️  Proceeding with integration tests on PRODUCTION..."
                    log_warn "⚠️  You have 10 seconds to cancel (Ctrl+C)..."
                    sleep 10
                    return 0
                else
                    log_error "❌ Confirmation failed. Aborting."
                    exit 4
                fi
            else
                log_error "❌ Integration tests CANNOT run on production!"
                echo ""
                log_info "To run integration tests:"
                log_info "  1. Use a staging/development environment"
                log_info "  2. Or use --force flag (NOT RECOMMENDED for production)"
                echo ""
                log_info "Example: $0 --force"
                exit 3
            fi
        fi
    done

    # Not on production - safe to proceed
    return 0
}

# =============================================================================
# Run Integration Tests
# =============================================================================

run_integration_tests() {
    log_section "Running AI Assistant Integration Tests"

    cd "$BACKEND_DIR"

    # Check if test file exists
    if [[ ! -f "$INTEGRATION_TEST_FILE" ]]; then
        log_error "Integration test file not found: $INTEGRATION_TEST_FILE"
        return 1
    fi

    # Build manage.py test command
    local test_cmd="docker compose exec backend python manage.py test"
    test_cmd="$test_cmd $INTEGRATION_TEST_FILE"

    if [[ "$VERBOSE" == true ]]; then
        test_cmd="$test_cmd -v 2"
    else
        test_cmd="$test_cmd -v 1"
    fi

    if [[ "$SHOW_SKIPPED" == true ]]; then
        test_cmd="$test_cmd --show-skipped"
    fi

    log_info "Running: $test_cmd"
    echo ""

    # Run the tests
    if eval "$test_cmd"; then
        log_info "✅ All integration tests passed!"
        return 0
    else
        log_error "❌ Some integration tests failed!"
        return 1
    fi
}

# =============================================================================
# Parse Arguments
# =============================================================================

parse_arguments() {
    while [[ $# -gt 0 ]]; do
        case $1 in
            --force)
                FORCE_RUN=true
                shift
                ;;
            -v|--verbose)
                VERBOSE=true
                shift
                ;;
            --show-skipped)
                SHOW_SKIPPED=true
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

# =============================================================================
# Main Execution
# =============================================================================

main() {
    echo -e "${MAGENTA}"
    echo "╔════════════════════════════════════════════════════════════════╗"
    echo "║          AI Assistant Integration Test Runner               ║"
    echo "╚════════════════════════════════════════════════════════════════╝"
    echo -e "${NC}"

    parse_arguments "$@"

    # Show warning
    print_warning

    # Show test summary
    print_test_summary

    # Safety check
    if ! check_production_safety; then
        exit 3
    fi

    # Run tests
    local result=0
    if ! run_integration_tests; then
        result=1
    fi

    # Print final result
    echo ""
    log_section "Test Result"
    if [[ $result -eq 0 ]]; then
        log_info "🎉 Integration tests completed successfully!"
        echo ""
        log_info "Next steps:"
        log_info "  • Review test results above"
        log_info "  • Check any warnings or failures"
        log_info "  • Verify no unexpected data was created"
        exit 0
    else
        log_error "❌ Integration tests failed!"
        echo ""
        log_info "Troubleshooting:"
        log_info "  • Check error messages above"
        log_info "  • Verify backend is running: docker compose ps"
        log_info "  • Check backend logs: docker compose logs backend"
        log_info "  • Ensure test database is accessible"
        exit 1
    fi
}

# Run main function
main "$@"
