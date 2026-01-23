-- ============================================================================
-- Migration Script: Fix Wrong Status Values in Systems Table
-- ============================================================================
-- Date: 2026-01-23
-- Purpose: Migrate systems with wrong status values to correct ones
-- Run this ONLY if there are existing systems with wrong status values
--
-- IMPORTANT: Run the CHECK query first to see if migration is needed!
-- ============================================================================

-- ============================================================================
-- STEP 1: CHECK FOR SYSTEMS WITH WRONG STATUS VALUES
-- ============================================================================
-- Run this first to see how many systems need migration
SELECT
    COUNT(*) as total_affected,
    status,
    STRING_AGG(system_code, ', ') as affected_systems
FROM systems
WHERE status NOT IN ('operating', 'pilot', 'testing', 'stopped', 'replacing')
GROUP BY status;

-- View individual systems with wrong status
SELECT
    id,
    system_code,
    system_name,
    status,
    created_at
FROM systems
WHERE status NOT IN ('operating', 'pilot', 'testing', 'stopped', 'replacing')
ORDER BY created_at DESC;


-- ============================================================================
-- STEP 2: BACKUP BEFORE MIGRATION (RECOMMENDED)
-- ============================================================================
-- Create a backup table with systems that will be updated
CREATE TABLE systems_status_backup_20260123 AS
SELECT *
FROM systems
WHERE status NOT IN ('operating', 'pilot', 'testing', 'stopped', 'replacing');


-- ============================================================================
-- STEP 3: MIGRATE WRONG STATUS VALUES
-- ============================================================================
-- ONLY run this section if STEP 1 shows systems with wrong status values

-- Migration mapping:
-- planning → operating (closest match - system is planned to operate)
-- development → pilot (system under development is like a pilot/trial)
-- inactive → stopped (direct translation)
-- maintenance → operating (maintenance is temporary state, system is still operational)

BEGIN;

-- Migrate 'planning' to 'operating'
UPDATE systems
SET status = 'operating'
WHERE status = 'planning';

-- Migrate 'development' to 'pilot'
UPDATE systems
SET status = 'pilot'
WHERE status = 'development';

-- Migrate 'inactive' to 'stopped'
UPDATE systems
SET status = 'stopped'
WHERE status = 'inactive';

-- Migrate 'maintenance' to 'operating'
UPDATE systems
SET status = 'operating'
WHERE status = 'maintenance';

-- Any other unknown status → 'operating' (safe default)
UPDATE systems
SET status = 'operating'
WHERE status NOT IN ('operating', 'pilot', 'testing', 'stopped', 'replacing');

-- Verify all systems now have valid status
SELECT
    COUNT(*) as total_systems,
    COUNT(CASE WHEN status IN ('operating', 'pilot', 'testing', 'stopped', 'replacing') THEN 1 END) as valid_status,
    COUNT(CASE WHEN status NOT IN ('operating', 'pilot', 'testing', 'stopped', 'replacing') THEN 1 END) as invalid_status
FROM systems;

-- If verification passes (invalid_status = 0), commit:
COMMIT;
-- If verification fails, rollback:
-- ROLLBACK;


-- ============================================================================
-- STEP 4: VERIFY MIGRATION
-- ============================================================================
-- Check status distribution after migration
SELECT
    status,
    COUNT(*) as count,
    ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 2) as percentage
FROM systems
GROUP BY status
ORDER BY count DESC;


-- ============================================================================
-- STEP 5: RESTORE FROM BACKUP (IF NEEDED)
-- ============================================================================
-- ONLY use this if migration went wrong and you need to restore

/*
-- Restore specific systems from backup
UPDATE systems s
SET status = b.status
FROM systems_status_backup_20260123 b
WHERE s.id = b.id;

-- Verify restore
SELECT COUNT(*) FROM systems
WHERE status NOT IN ('operating', 'pilot', 'testing', 'stopped', 'replacing');
*/


-- ============================================================================
-- CLEANUP (OPTIONAL)
-- ============================================================================
-- After confirming migration is successful and system is working,
-- you can drop the backup table to save space

-- DROP TABLE IF EXISTS systems_status_backup_20260123;


-- ============================================================================
-- NOTES
-- ============================================================================
--
-- Valid status values (from backend/apps/systems/models.py):
-- - 'operating'  → Đang vận hành
-- - 'pilot'      → Thí điểm
-- - 'testing'    → Đang thử nghiệm
-- - 'stopped'    → Dừng
-- - 'replacing'  → Sắp thay thế
--
-- Wrong values (from old frontend):
-- - 'planning'     → Đang lập kế hoạch (NOT in backend)
-- - 'development'  → Đang phát triển (NOT in backend)
-- - 'inactive'     → Ngừng hoạt động (wrong value, should be 'stopped')
-- - 'maintenance'  → Bảo trì (NOT in backend)
--
-- ============================================================================
