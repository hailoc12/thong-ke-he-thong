-- Script: Delete soft-deleted systems permanently
-- Purpose: Remove systems that have been soft-deleted (is_deleted = TRUE) from database
-- Date: 2026-01-28

-- First, check how many systems will be deleted
SELECT COUNT(*) AS total_soft_deleted FROM systems_system WHERE is_deleted = TRUE;

-- Show details of systems to be deleted
SELECT id, name, system_status, deleted_at
FROM systems_system
WHERE is_deleted = TRUE
ORDER BY deleted_at DESC;

-- Delete soft-deleted systems permanently
-- Uncomment the line below to execute deletion
DELETE FROM systems_system WHERE is_deleted = TRUE;

-- Verify deletion
SELECT COUNT(*) AS remaining_soft_deleted FROM systems_system WHERE is_deleted = TRUE;
SELECT COUNT(*) AS total_active_systems FROM systems_system WHERE is_deleted = FALSE;
