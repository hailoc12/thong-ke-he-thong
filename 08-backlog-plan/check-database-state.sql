-- Script để kiểm tra trạng thái database
-- Chạy với: docker compose exec postgres psql -U postgres -d thongke -f check-database-state.sql

\echo '========================================================================'
\echo '1️⃣  TỔNG SỐ ĐƠN VỊ (ORGANIZATIONS)'
\echo '========================================================================'
SELECT COUNT(*) as "Tổng số đơn vị" FROM organizations;
\echo ''

\echo '========================================================================'
\echo '2️⃣  TỔNG SỐ USER TYPE ĐƠN VỊ (role = org_user)'
\echo '========================================================================'
SELECT COUNT(*) as "Tổng số user đơn vị" FROM users WHERE role = 'org_user';
\echo ''

\echo '========================================================================'
\echo '3️⃣  DANH SÁCH CÁC ĐƠN VỊ CÓ USER'
\echo '========================================================================'
SELECT
    o.code as "Mã đơn vị",
    o.name as "Tên đơn vị",
    u.username as "Username",
    u.is_active as "Active"
FROM organizations o
LEFT JOIN users u ON u.organization_id = o.id AND u.role = 'org_user'
WHERE u.username IS NOT NULL
ORDER BY o.name;
\echo ''

\echo '========================================================================'
\echo '4️⃣  DANH SÁCH CÁC ĐƠN VỊ THIẾU USER'
\echo '========================================================================'
SELECT
    o.code as "Mã đơn vị",
    o.name as "Tên đơn vị"
FROM organizations o
LEFT JOIN users u ON u.organization_id = o.id AND u.role = 'org_user'
WHERE u.id IS NULL
ORDER BY o.name;
\echo ''

\echo '========================================================================'
\echo '📊 THỐNG KÊ TỔNG HỢP'
\echo '========================================================================'
SELECT
    (SELECT COUNT(*) FROM organizations) as "Tổng đơn vị",
    (SELECT COUNT(*) FROM users WHERE role = 'org_user') as "Có user",
    (SELECT COUNT(*) FROM organizations o
     WHERE NOT EXISTS (
         SELECT 1 FROM users u
         WHERE u.organization_id = o.id AND u.role = 'org_user'
     )) as "Thiếu user";
