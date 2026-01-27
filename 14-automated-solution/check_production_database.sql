-- SQL Script: Check Production Database for "test" System
-- Purpose: Query production database to find missing data
-- Created: 2026-01-25
-- Usage: Run on production PostgreSQL database

-- ================================================================
-- STEP 1: Find System by Name (Case-insensitive)
-- ================================================================

-- Search for systems with "test" in name or code
SELECT
    id,
    org_id,
    system_code,
    system_name,
    system_name_en,
    purpose,
    scope,
    status,
    system_group,
    created_at,
    updated_at
FROM systems
WHERE
    system_name ILIKE '%test%'
    OR system_code ILIKE '%test%'
    OR system_name_en ILIKE '%test%'
ORDER BY created_at DESC;

-- ================================================================
-- STEP 2: Get Full System Details (Replace <system_id> with ID from above)
-- ================================================================

-- Main system data
SELECT * FROM systems WHERE id = <system_id>;

-- Architecture data (Tab 3)
SELECT * FROM system_architecture WHERE system_id = <system_id>;

-- Data info (Tab 4)
SELECT * FROM system_data_info WHERE system_id = <system_id>;

-- Operations (Tab 8)
SELECT * FROM system_operations WHERE system_id = <system_id>;

-- Integration (Tab 5)
SELECT * FROM system_integration WHERE system_id = <system_id>;

-- Assessment (Tab 6)
SELECT * FROM system_assessment WHERE system_id = <system_id>;

-- Integration connections
SELECT * FROM system_integration_connections WHERE system_id = <system_id>;

-- ================================================================
-- STEP 3: Check for Missing/NULL Fields
-- ================================================================

-- Check which architecture fields are NULL
SELECT
    system_id,
    CASE WHEN architecture_type IS NULL THEN 'architecture_type' END,
    CASE WHEN containerization IS NULL THEN 'containerization' END,
    CASE WHEN is_multi_tenant IS NULL THEN 'is_multi_tenant' END,
    CASE WHEN has_layered_architecture IS NULL THEN 'has_layered_architecture' END,
    CASE WHEN has_cicd IS NULL THEN 'has_cicd' END,
    CASE WHEN has_automated_testing IS NULL THEN 'has_automated_testing' END
FROM system_architecture
WHERE system_id = <system_id>;

-- ================================================================
-- STEP 4: Get Recent Systems (Find Similar Entries)
-- ================================================================

-- Show last 10 systems created
SELECT
    id,
    system_code,
    system_name,
    org_id,
    status,
    created_at,
    updated_at
FROM systems
ORDER BY created_at DESC
LIMIT 10;

-- ================================================================
-- STEP 5: Search by Date Range (If you know when it was created)
-- ================================================================

-- Systems created today
SELECT * FROM systems
WHERE DATE(created_at) = CURRENT_DATE
ORDER BY created_at DESC;

-- Systems created this week
SELECT * FROM systems
WHERE created_at >= CURRENT_DATE - INTERVAL '7 days'
ORDER BY created_at DESC;

-- Systems created in specific date range
SELECT * FROM systems
WHERE created_at BETWEEN '2026-01-23' AND '2026-01-25'
ORDER BY created_at DESC;

-- ================================================================
-- STEP 6: Check for Deleted Systems (Soft Delete)
-- ================================================================

-- Find soft-deleted systems
SELECT
    id,
    system_code,
    system_name,
    is_deleted,
    deleted_at,
    deleted_by_id,
    created_at
FROM systems
WHERE
    is_deleted = true
    AND (
        system_name ILIKE '%test%'
        OR system_code ILIKE '%test%'
    )
ORDER BY deleted_at DESC;

-- ================================================================
-- STEP 7: Search by Organization (If you know which org)
-- ================================================================

-- List all systems for a specific organization
SELECT
    s.id,
    s.system_code,
    s.system_name,
    o.name as org_name,
    s.created_at
FROM systems s
JOIN organizations o ON s.org_id = o.id
WHERE o.id = <org_id>
ORDER BY s.created_at DESC;

-- ================================================================
-- STEP 8: Export Full System Data to JSON (For Recovery)
-- ================================================================

-- Export system with all related data as JSON
SELECT row_to_json(combined_data)
FROM (
    SELECT
        s.*,
        (SELECT row_to_json(sa) FROM system_architecture sa WHERE sa.system_id = s.id) as architecture,
        (SELECT row_to_json(sd) FROM system_data_info sd WHERE sd.system_id = s.id) as data_info,
        (SELECT row_to_json(so) FROM system_operations so WHERE so.system_id = s.id) as operations,
        (SELECT row_to_json(si) FROM system_integration si WHERE si.system_id = s.id) as integration,
        (SELECT row_to_json(sa2) FROM system_assessment sa2 WHERE sa2.system_id = s.id) as assessment,
        (
            SELECT json_agg(row_to_json(sic))
            FROM system_integration_connections sic
            WHERE sic.system_id = s.id
        ) as integration_connections
    FROM systems s
    WHERE s.id = <system_id>
) combined_data;

-- ================================================================
-- STEP 9: Compare with Expected Fields (Data Validation)
-- ================================================================

-- Check if system has required fields populated
SELECT
    s.id,
    s.system_name,
    CASE WHEN s.scope IS NULL OR s.scope = '' THEN 'MISSING' ELSE 'OK' END as scope_status,
    CASE WHEN s.system_group IS NULL OR s.system_group = '' THEN 'MISSING' ELSE 'OK' END as system_group_status,
    CASE WHEN s.status IS NULL OR s.status = '' THEN 'MISSING' ELSE 'OK' END as status_status,
    CASE WHEN sa.containerization IS NULL OR sa.containerization = '' THEN 'MISSING' ELSE 'OK' END as containerization_status,
    CASE WHEN sa.is_multi_tenant IS NULL THEN 'MISSING' ELSE 'OK' END as is_multi_tenant_status,
    CASE WHEN sa.has_cicd IS NULL THEN 'MISSING' ELSE 'OK' END as has_cicd_status
FROM systems s
LEFT JOIN system_architecture sa ON sa.system_id = s.id
WHERE s.id = <system_id>;

-- ================================================================
-- STEP 10: Find Systems with Partial Data (Similar to "test" case)
-- ================================================================

-- Systems that might have similar missing data issues
SELECT
    s.id,
    s.system_code,
    s.system_name,
    sa.containerization,
    sa.is_multi_tenant,
    sa.has_cicd,
    sa.has_automated_testing,
    sa.has_layered_architecture
FROM systems s
LEFT JOIN system_architecture sa ON sa.system_id = s.id
WHERE
    sa.containerization IS NULL
    OR sa.is_multi_tenant IS NULL
    OR sa.has_cicd IS NULL
ORDER BY s.created_at DESC
LIMIT 20;

-- ================================================================
-- USAGE INSTRUCTIONS
-- ================================================================

-- HOW TO RUN THIS SCRIPT ON PRODUCTION:
--
-- 1. SSH to production server:
--    ssh admin_@34.142.152.104
--
-- 2. Navigate to project directory:
--    cd /home/admin_/thong_ke_he_thong
--
-- 3. Connect to PostgreSQL:
--    docker-compose exec db psql -U postgres -d hientrang
--
-- 4. Run queries one by one, replacing <system_id> and <org_id> as needed
--
-- 5. To save results to file:
--    docker-compose exec db psql -U postgres -d hientrang -f query.sql > results.txt
--
-- ================================================================

-- QUICK SEARCH TEMPLATE (Copy-paste friendly)
-- Replace "test" with your search term:

\echo 'Searching for systems matching "test"...'

SELECT
    id,
    system_code,
    system_name,
    system_name_en,
    created_at
FROM systems
WHERE
    system_name ILIKE '%test%'
    OR system_code ILIKE '%test%'
    OR system_name_en ILIKE '%test%'
ORDER BY created_at DESC;

-- If system found, get its ID and run:
-- \set system_id <ID_HERE>
-- SELECT * FROM systems WHERE id = :system_id;
-- SELECT * FROM system_architecture WHERE system_id = :system_id;
