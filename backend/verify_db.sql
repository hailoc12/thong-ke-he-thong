-- Verification SQL: Check if nested data is saved
-- Run this in PostgreSQL to verify the fix

-- Check system 115 architecture data
SELECT
    s.id AS system_id,
    s.system_name,
    sa.backend_tech,
    sa.frontend_tech,
    sa.architecture_type,
    sa.mobile_app,
    sa.database_type
FROM
    systems_system s
LEFT JOIN
    systems_systemarchitecture sa ON s.id = sa.system_id
WHERE
    s.id = 115;

-- Count how many systems have architecture data
SELECT
    COUNT(*) AS total_systems,
    COUNT(sa.system_id) AS systems_with_architecture,
    ROUND(COUNT(sa.system_id)::numeric / COUNT(*)::numeric * 100, 1) AS percentage
FROM
    systems_system s
LEFT JOIN
    systems_systemarchitecture sa ON s.id = sa.system_id
WHERE
    s.is_deleted = FALSE;

-- Check all architecture fields for system 115
SELECT
    system_id,
    backend_tech,
    frontend_tech,
    architecture_type,
    mobile_app,
    database_type,
    database_model,
    containerization,
    api_style,
    messaging_queue
FROM
    systems_systemarchitecture
WHERE
    system_id = 115;

-- Check data_info data
SELECT
    di.system_id,
    s.system_name,
    di.data_storage_location,
    di.data_retention_period,
    di.has_personal_data
FROM
    systems_systemdatainfo di
JOIN
    systems_system s ON di.system_id = s.id
WHERE
    di.system_id = 115;
