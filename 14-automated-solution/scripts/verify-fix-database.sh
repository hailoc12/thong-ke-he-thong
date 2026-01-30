#!/bin/bash
# Database Verification Script for transformFormValuesToAPIPayload Fix
# Purpose: Verify all fields are saved correctly after bug fix
# Created: 2026-01-25

set -euo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

log_info() { echo -e "${GREEN}✓${NC} $1"; }
log_warn() { echo -e "${YELLOW}!${NC} $1"; }
log_error() { echo -e "${RED}✗${NC} $1" >&2; }
log_step() { echo -e "${BLUE}▶${NC} $1"; }
log_heading() { echo -e "${CYAN}$1${NC}"; }

PROD_SERVER="admin_@34.142.152.104"
PROD_PATH="/home/admin_/thong_ke_he_thong"

echo "========================================================================"
log_heading "🔍 DATABASE VERIFICATION - Fix Validation"
echo "========================================================================"
echo ""

# Get system ID to check
if [ -z "${1:-}" ]; then
    log_warn "Usage: $0 <system_id>"
    log_warn "Fetching latest system ID..."
    SYSTEM_ID=""
else
    SYSTEM_ID="$1"
fi

log_step "Connecting to production database..."
echo ""

ssh "$PROD_SERVER" << ENDSSH
cd $PROD_PATH

# Execute SQL queries
docker compose exec -T postgres psql -U postgres -d system_reports << 'EOSQL'
\pset border 2
\pset format wrapped

-- Set SYSTEM_ID if not provided
\set system_id_var ${SYSTEM_ID:-}

\echo '========================================================================'
\echo '📊 SYSTEM DATA VERIFICATION'
\echo '========================================================================'
\echo ''

-- If no system_id provided, get the latest one
\echo '1️⃣  Latest Systems (most recent first):'
\echo ''
SELECT
    id,
    name,
    organization_id,
    status,
    created_at,
    updated_at
FROM systems
ORDER BY created_at DESC
LIMIT 5;

\echo ''
\echo '========================================================================'
\echo '2️⃣  VERIFY SYSTEM #${SYSTEM_ID:-LATEST} - ALL FIELDS'
\echo '========================================================================'
\echo ''

-- Get the latest system ID if not provided
\set latest_id '(SELECT id FROM systems ORDER BY created_at DESC LIMIT 1)'

\echo 'A. Main System Table Fields:'
\echo ''
SELECT
    id,
    name,
    description,
    organization_id,
    status,
    purpose_type,
    requirement_type,
    requirement_type_other,
    launch_date,
    website_url,
    user_count,
    business_unit,
    contact_person,
    contact_email,
    contact_phone,
    is_draft,
    created_by_id,
    created_at,
    updated_at
FROM systems
WHERE id = COALESCE(${SYSTEM_ID:-}, ${latest_id:-1})
\gx

\echo ''
\echo 'B. Architecture Data (system_architecture):'
\echo ''
SELECT
    id,
    system_id,
    architecture_type,
    has_architecture_diagram,
    architecture_description,
    backend_tech,
    frontend_tech,
    mobile_app,
    database_type,
    database_model,
    has_data_model_doc,
    hosting_type,
    cloud_provider,
    has_layered_architecture,
    layered_architecture_details,
    containerization,
    is_multi_tenant,
    api_style,
    messaging_queue,
    cache_system,
    search_engine,
    reporting_bi_tool,
    source_repository,
    has_cicd,
    cicd_tool,
    has_automated_testing,
    automated_testing_tools,
    created_at,
    updated_at
FROM system_architecture
WHERE system_id = COALESCE(${SYSTEM_ID:-}, ${latest_id:-1})
\gx

\echo ''
\echo 'C. Data Info (system_data_info):'
\echo ''
SELECT
    id,
    system_id,
    storage_size_gb,
    file_storage_size_gb,
    growth_rate_percent,
    data_types,
    has_api,
    api_endpoints_count,
    shared_with_systems,
    has_data_standard,
    has_personal_data,
    has_sensitive_data,
    data_classification,
    secondary_databases,
    file_storage_type,
    record_count,
    data_retention_policy,
    created_at,
    updated_at
FROM system_data_info
WHERE system_id = COALESCE(${SYSTEM_ID:-}, ${latest_id:-1})
\gx

\echo ''
\echo 'D. Operations Data (system_operations):'
\echo ''
SELECT
    id,
    system_id,
    dev_type,
    developer,
    dev_team_size,
    warranty_status,
    warranty_end_date,
    has_maintenance_contract,
    maintenance_end_date,
    operator,
    ops_team_size,
    vendor_dependency,
    can_self_maintain,
    support_level,
    avg_incident_response_hours,
    deployment_location,
    compute_type,
    compute_specifications,
    deployment_frequency,
    created_at,
    updated_at
FROM system_operations
WHERE system_id = COALESCE(${SYSTEM_ID:-}, ${latest_id:-1})
\gx

\echo ''
\echo 'E. Integration Data (system_integration):'
\echo ''
SELECT
    id,
    system_id,
    has_integration,
    integration_count,
    integration_types,
    connected_internal_systems,
    connected_external_systems,
    has_integration_diagram,
    integration_description,
    uses_standard_api,
    api_standard,
    has_api_gateway,
    api_gateway_name,
    has_api_versioning,
    has_rate_limiting,
    api_documentation,
    api_versioning_standard,
    has_integration_monitoring,
    created_at,
    updated_at
FROM system_integration
WHERE system_id = COALESCE(${SYSTEM_ID:-}, ${latest_id:-1})
\gx

\echo ''
\echo 'F. Assessment Data (system_assessment):'
\echo ''
SELECT
    id,
    system_id,
    recommendation,
    recommendation_other,
    blockers,
    integration_readiness,
    created_at,
    updated_at
FROM system_assessment
WHERE system_id = COALESCE(${SYSTEM_ID:-}, ${latest_id:-1})
\gx

\echo ''
\echo '========================================================================'
\echo '3️⃣  FIELD COUNT VERIFICATION'
\echo '========================================================================'
\echo ''

\echo 'Checking for NULL/missing fields in critical tables:'
\echo ''

-- Count NULL fields in each table
SELECT
    'system_architecture' as table_name,
    COUNT(*) FILTER (WHERE backend_tech IS NULL) as backend_tech_nulls,
    COUNT(*) FILTER (WHERE frontend_tech IS NULL) as frontend_tech_nulls,
    COUNT(*) FILTER (WHERE database_type IS NULL) as database_type_nulls,
    COUNT(*) FILTER (WHERE hosting_type IS NULL) as hosting_type_nulls
FROM system_architecture
WHERE system_id = COALESCE(${SYSTEM_ID:-}, ${latest_id:-1})

UNION ALL

SELECT
    'system_data_info' as table_name,
    COUNT(*) FILTER (WHERE storage_size_gb IS NULL) as storage_size_gb_nulls,
    COUNT(*) FILTER (WHERE api_endpoints_count IS NULL) as api_endpoints_count_nulls,
    COUNT(*) FILTER (WHERE has_api IS NULL) as has_api_nulls,
    COUNT(*) FILTER (WHERE data_classification IS NULL) as data_classification_nulls
FROM system_data_info
WHERE system_id = COALESCE(${SYSTEM_ID:-}, ${latest_id:-1})

UNION ALL

SELECT
    'system_operations' as table_name,
    COUNT(*) FILTER (WHERE developer IS NULL) as developer_nulls,
    COUNT(*) FILTER (WHERE warranty_status IS NULL) as warranty_status_nulls,
    COUNT(*) FILTER (WHERE operator IS NULL) as operator_nulls,
    COUNT(*) FILTER (WHERE deployment_location IS NULL) as deployment_location_nulls
FROM system_operations
WHERE system_id = COALESCE(${SYSTEM_ID:-}, ${latest_id:-1})

UNION ALL

SELECT
    'system_integration' as table_name,
    COUNT(*) FILTER (WHERE has_integration IS NULL) as has_integration_nulls,
    COUNT(*) FILTER (WHERE integration_count IS NULL) as integration_count_nulls,
    COUNT(*) FILTER (WHERE integration_types IS NULL) as integration_types_nulls,
    COUNT(*) FILTER (WHERE uses_standard_api IS NULL) as uses_standard_api_nulls
FROM system_integration
WHERE system_id = COALESCE(${SYSTEM_ID:-}, ${latest_id:-1})

UNION ALL

SELECT
    'system_assessment' as table_name,
    COUNT(*) FILTER (WHERE recommendation IS NULL) as recommendation_nulls,
    COUNT(*) FILTER (WHERE integration_readiness IS NULL) as integration_readiness_nulls,
    0 as col3_nulls,
    0 as col4_nulls
FROM system_assessment
WHERE system_id = COALESCE(${SYSTEM_ID:-}, ${latest_id:-1});

\echo ''
\echo '========================================================================'
\echo '4️⃣  SYSTEM #115 "Test" - Previously Broken System'
\echo '========================================================================'
\echo ''
\echo 'Checking if System #115 (the one with missing data) still has issues:'
\echo ''

SELECT
    'Main System' as table_name,
    COUNT(*) as record_count
FROM systems WHERE id = 115

UNION ALL

SELECT
    'Architecture' as table_name,
    COUNT(*) as record_count
FROM system_architecture WHERE system_id = 115

UNION ALL

SELECT
    'Data Info' as table_name,
    COUNT(*) as record_count
FROM system_data_info WHERE system_id = 115

UNION ALL

SELECT
    'Operations' as table_name,
    COUNT(*) as record_count
FROM system_operations WHERE system_id = 115

UNION ALL

SELECT
    'Integration' as table_name,
    COUNT(*) as record_count
FROM system_integration WHERE system_id = 115

UNION ALL

SELECT
    'Assessment' as table_name,
    COUNT(*) as record_count
FROM system_assessment WHERE system_id = 115;

\echo ''
\echo '========================================================================'
\echo 'VERIFICATION COMPLETE'
\echo '========================================================================'
\echo ''

EOSQL

ENDSSH

echo ""
echo "========================================================================"
log_heading "✅ VERIFICATION RESULTS INTERPRETATION:"
echo "========================================================================"
echo ""
echo "1. Check if nested tables (architecture, data_info, operations, etc.) have data"
echo "2. NULL counts should match user input (if user didn't fill a field, NULL is OK)"
echo "3. If user DID fill fields but they're NULL → BUG STILL EXISTS"
echo "4. System #115 should have records in all related tables"
echo ""
log_warn "If you see missing data that was inputted, report immediately!"
echo ""
