-- ============================================================
-- DATABASE SCHEMA - HỆ THỐNG BÁO CÁO THỐNG KÊ HỆ THỐNG
-- ============================================================
-- Database: PostgreSQL 14+
-- Date: 2026-01-14
-- Description: Full schema for System Report application
-- ============================================================

-- Create database (run as superuser)
-- CREATE DATABASE system_reports OWNER app;

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- 1. ORGANIZATIONS TABLE
-- ============================================================

CREATE TABLE organizations (
    id SERIAL PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    contact_person VARCHAR(255),
    phone VARCHAR(20),
    email VARCHAR(255),
    submission_date TIMESTAMP,
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'approved')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE organizations IS 'Đơn vị trong Bộ';
COMMENT ON COLUMN organizations.code IS 'Mã đơn vị (unique)';
COMMENT ON COLUMN organizations.status IS 'draft: đang nhập, submitted: đã nộp, approved: đã duyệt';

-- ============================================================
-- 2. SYSTEMS TABLE (Core entity)
-- ============================================================

CREATE TABLE systems (
    id SERIAL PRIMARY KEY,
    org_id INTEGER NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    system_code VARCHAR(100),
    system_name VARCHAR(255) NOT NULL,
    system_name_en VARCHAR(255),

    -- PHẦN 1: Basic info
    purpose TEXT,
    scope VARCHAR(50) CHECK (scope IN ('internal_unit', 'org_wide', 'external')),
    target_users JSONB,

    -- System group
    system_group VARCHAR(50) CHECK (system_group IN (
        'platform', 'business', 'portal', 'website', 'bi', 'esb', 'other'
    )),

    -- Status & version
    status VARCHAR(20) CHECK (status IN ('operating', 'pilot', 'stopped', 'replacing')),
    go_live_date DATE,
    current_version VARCHAR(50),
    upgrade_history JSONB,

    -- Business owner & technical owner (PHẦN B.1 Level 2)
    business_owner VARCHAR(255),
    technical_owner VARCHAR(255),
    responsible_person VARCHAR(255),
    responsible_phone VARCHAR(20),
    responsible_email VARCHAR(255),

    -- Users (PHẦN 1.2 / B.2)
    users_total INTEGER,
    users_mau INTEGER,
    users_dau INTEGER,
    num_organizations INTEGER,

    -- Criticality (PHẦN 2 / B.2)
    criticality_level VARCHAR(20) CHECK (criticality_level IN (
        'critical', 'high', 'medium', 'low'
    )),

    -- Form level
    form_level INTEGER DEFAULT 1 CHECK (form_level IN (1, 2)),

    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    UNIQUE(org_id, system_code)
);

COMMENT ON TABLE systems IS 'Hệ thống/ứng dụng của đơn vị';
COMMENT ON COLUMN systems.target_users IS 'JSON array: ["leader", "staff", "business", "citizen"]';
COMMENT ON COLUMN systems.form_level IS '1: Level 1 (6 phần), 2: Level 2 (11 phần)';

-- ============================================================
-- 3. SYSTEM_ARCHITECTURE TABLE (PHẦN 2 / B.3)
-- ============================================================

CREATE TABLE system_architecture (
    id SERIAL PRIMARY KEY,
    system_id INTEGER UNIQUE NOT NULL REFERENCES systems(id) ON DELETE CASCADE,

    -- 2.1 / B.3.1 Architecture
    architecture_type VARCHAR(50) CHECK (architecture_type IN (
        'monolithic', 'modular', 'microservices', 'serverless', 'saas', 'other'
    )),
    has_layers JSONB,
    is_multi_tenant BOOLEAN,
    is_containerized BOOLEAN,
    container_tech VARCHAR(50),

    -- 2.2 / B.3.2 Technology
    frontend_tech VARCHAR(255),
    frontend_version VARCHAR(100),
    backend_tech VARCHAR(255),
    backend_version VARCHAR(100),
    mobile_app VARCHAR(50) CHECK (mobile_app IN ('native', 'hybrid', 'none')),
    api_style VARCHAR(50) CHECK (api_style IN ('rest', 'graphql', 'grpc', 'soap', 'other')),
    messaging_queue VARCHAR(100),
    cache_tech VARCHAR(100),
    search_tech VARCHAR(100),
    reporting_tool VARCHAR(100),
    auth_method VARCHAR(100),

    -- 2.3 / B.3.3 Code & CI/CD
    code_repository VARCHAR(255),
    branching_model VARCHAR(100),
    has_ci_cd BOOLEAN,
    ci_cd_tool VARCHAR(100),
    has_auto_test BOOLEAN,
    test_tools VARCHAR(255),

    -- Diagram
    has_architecture_diagram BOOLEAN,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE system_architecture IS 'Kiến trúc & công nghệ hệ thống';
COMMENT ON COLUMN system_architecture.has_layers IS 'JSON object: {"presentation": true, "business": true, ...}';

-- ============================================================
-- 4. SYSTEM_DATA_INFO TABLE (PHẦN 3 / B.4)
-- ============================================================

CREATE TABLE system_data_info (
    id SERIAL PRIMARY KEY,
    system_id INTEGER UNIQUE NOT NULL REFERENCES systems(id) ON DELETE CASCADE,

    -- 3.1 / B.4.1 Database
    db_type VARCHAR(100),
    db_version VARCHAR(50),
    db_secondary VARCHAR(255),
    file_storage_type VARCHAR(100),

    -- 3.1 / B.4.2 Data scale
    storage_db_size_gb NUMERIC(10,2) CHECK (storage_db_size_gb >= 0),
    storage_file_size_gb NUMERIC(10,2) CHECK (storage_file_size_gb >= 0),
    growth_rate_percent NUMERIC(5,2),
    growth_rate_gb_month NUMERIC(10,2),
    num_records BIGINT,
    retention_period VARCHAR(100),

    -- 3.2 / B.4.3 Data model
    data_model VARCHAR(50) CHECK (data_model IN ('centralized', 'distributed', 'per_app')),
    has_erd BOOLEAN,
    common_catalogs JSONB,
    master_data TEXT,
    has_sensitive_data BOOLEAN,
    sensitive_data_types TEXT,

    -- 3.2 Data types
    data_types JSONB,

    -- 3.3 / B.4 Data sharing
    has_api BOOLEAN,
    api_doc_available BOOLEAN,
    sharing_with TEXT,
    has_data_standard BOOLEAN,
    data_standard TEXT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE system_data_info IS 'Thông tin dữ liệu hệ thống';
COMMENT ON COLUMN system_data_info.data_types IS 'JSON array: ["business", "documents", "statistics", "master_data"]';
COMMENT ON COLUMN system_data_info.common_catalogs IS 'JSON array: ["units", "locations", "standards"]';

-- ============================================================
-- 5. SYSTEM_OPERATIONS TABLE (PHẦN 4 / B.6,7,8,9)
-- ============================================================

CREATE TABLE system_operations (
    id SERIAL PRIMARY KEY,
    system_id INTEGER UNIQUE NOT NULL REFERENCES systems(id) ON DELETE CASCADE,

    -- 4.1 Development team
    development_type VARCHAR(50) CHECK (development_type IN ('internal', 'outsourced', 'mixed')),
    vendor_name VARCHAR(255),

    -- 4.2 Warranty & maintenance
    warranty_status VARCHAR(50) CHECK (warranty_status IN ('active', 'expired', 'none')),
    warranty_end_date DATE,
    has_maintenance_contract BOOLEAN,
    maintenance_end_date DATE,

    -- 4.3 Operations
    operator VARCHAR(255),
    depends_on_vendor BOOLEAN,
    can_self_fix BOOLEAN,

    -- ========== LEVEL 2 ONLY (B.6-9) ==========

    -- B.6 Infrastructure
    environments JSONB,
    hosting_type VARCHAR(50) CHECK (hosting_type IN ('onprem', 'cloud', 'hybrid')),
    cloud_provider VARCHAR(100),
    compute_specs TEXT,
    os VARCHAR(100),
    network_config TEXT,
    domain VARCHAR(255),
    has_ssl BOOLEAN,
    has_waf BOOLEAN,
    monitoring_tool VARCHAR(100),
    backup_mechanism TEXT,
    backup_frequency VARCHAR(50),
    backup_location VARCHAR(255),
    has_backup_test BOOLEAN,
    has_dr BOOLEAN,
    dr_site VARCHAR(255),
    rpo_hours NUMERIC(5,1),
    rto_hours NUMERIC(5,1),

    -- B.7 Security
    security_level INTEGER CHECK (security_level BETWEEN 1 AND 5),
    has_security_docs BOOLEAN,
    iam_mechanism VARCHAR(100),
    encryption_in_transit BOOLEAN,
    encryption_at_rest BOOLEAN,
    log_retention_days INTEGER,
    log_access_control TEXT,
    last_vapt_date DATE,
    vapt_vendor VARCHAR(255),
    vapt_summary TEXT,
    vulnerabilities_high INTEGER DEFAULT 0,
    vulnerabilities_medium INTEGER DEFAULT 0,
    vulnerabilities_low INTEGER DEFAULT 0,

    -- B.8 Service operations
    sla_required_uptime NUMERIC(5,2),
    sla_required_response_time VARCHAR(50),
    sla_actual_uptime NUMERIC(5,2),
    incident_count_6months INTEGER,
    mttr_hours NUMERIC(6,2),
    ticket_per_month INTEGER,
    has_itsm BOOLEAN,
    itsm_tool VARCHAR(100),
    has_runbook BOOLEAN,
    has_24x7_support BOOLEAN,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE system_operations IS 'Vận hành, hạ tầng, ATTT, service ops';
COMMENT ON COLUMN system_operations.environments IS 'JSON: {"dev": true, "test": true, "prod": true}';
COMMENT ON COLUMN system_operations.security_level IS 'Cấp độ ATTT theo quy định (1-5)';

-- ============================================================
-- 6. INTEGRATIONS TABLE (PHẦN 5 / B.5)
-- ============================================================

CREATE TABLE integrations (
    id SERIAL PRIMARY KEY,
    system_id_from INTEGER NOT NULL REFERENCES systems(id) ON DELETE CASCADE,
    system_id_to INTEGER REFERENCES systems(id) ON DELETE SET NULL,
    external_system_name VARCHAR(255),

    data_exchanged TEXT NOT NULL,
    integration_method VARCHAR(50) CHECK (integration_method IN (
        'api', 'file', 'db_link', 'manual', 'other'
    )),
    frequency VARCHAR(50) CHECK (frequency IN (
        'realtime', 'hourly', 'daily', 'weekly', 'monthly', 'batch', 'other'
    )),

    has_retry_mechanism BOOLEAN,
    has_api_doc BOOLEAN,
    api_doc_url VARCHAR(500),

    owner VARCHAR(255),
    issues TEXT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE integrations IS 'Tích hợp giữa các hệ thống';
COMMENT ON COLUMN integrations.system_id_to IS 'NULL nếu là hệ thống bên ngoài';
COMMENT ON COLUMN integrations.external_system_name IS 'Tên hệ thống bên ngoài (nếu có)';

-- ============================================================
-- 7. API_INVENTORY TABLE (Level 2 - B.5.2)
-- ============================================================

CREATE TABLE api_inventory (
    id SERIAL PRIMARY KEY,
    system_id INTEGER NOT NULL REFERENCES systems(id) ON DELETE CASCADE,

    api_type VARCHAR(20) CHECK (api_type IN ('provided', 'consumed')),
    api_name VARCHAR(255) NOT NULL,
    api_endpoint VARCHAR(500),
    api_method VARCHAR(10),
    description TEXT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE api_inventory IS 'Danh mục API của hệ thống';
COMMENT ON COLUMN api_inventory.api_type IS 'provided: cung cấp, consumed: tiêu thụ';

-- ============================================================
-- 8. ATTACHMENTS TABLE
-- ============================================================

CREATE TABLE attachments (
    id SERIAL PRIMARY KEY,
    system_id INTEGER NOT NULL REFERENCES systems(id) ON DELETE CASCADE,

    file_type VARCHAR(50) CHECK (file_type IN (
        'architecture_diagram', 'erd', 'api_doc', 'contract',
        'security_report', 'runbook', 'other'
    )),
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size_kb INTEGER,
    mime_type VARCHAR(100),

    uploaded_by VARCHAR(255),
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE attachments IS 'File đính kèm của hệ thống';

-- ============================================================
-- 9. SYSTEM_ASSESSMENT TABLE (PHẦN 6 / B.11)
-- ============================================================

CREATE TABLE system_assessment (
    id SERIAL PRIMARY KEY,
    system_id INTEGER UNIQUE NOT NULL REFERENCES systems(id) ON DELETE CASCADE,

    -- PHẦN 6: Self assessment (Level 1)
    is_suitable_3_5_years BOOLEAN,
    strengths TEXT,
    weaknesses TEXT,
    would_change_if_restart TEXT,

    -- B.11: Architecture fit (Level 2)
    fit_points JSONB,
    issues JSONB,
    unit_proposal VARCHAR(50) CHECK (unit_proposal IN (
        'keep', 'upgrade', 'replace', 'merge'
    )),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE system_assessment IS 'Đánh giá tự nhận diện & khả năng hợp nhất';
COMMENT ON COLUMN system_assessment.fit_points IS 'JSON array: ["easy_to_standardize", "good_api", ...]';
COMMENT ON COLUMN system_assessment.issues IS 'JSON array: ["old_tech", "no_docs", ...]';

-- ============================================================
-- 10. SYSTEM_COSTS TABLE (Level 2 - B.10)
-- ============================================================

CREATE TABLE system_costs (
    id SERIAL PRIMARY KEY,
    system_id INTEGER UNIQUE NOT NULL REFERENCES systems(id) ON DELETE CASCADE,

    initial_cost NUMERIC(15,2),
    annual_operation_cost NUMERIC(15,2),
    annual_infrastructure_cost NUMERIC(15,2),
    annual_license_cost NUMERIC(15,2),
    annual_maintenance_cost NUMERIC(15,2),
    annual_personnel_cost NUMERIC(15,2),

    licenses JSONB,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE system_costs IS 'Chi phí & tài sản hệ thống';
COMMENT ON COLUMN system_costs.licenses IS 'JSON array: [{type, product, quantity, expiry_date}]';

-- ============================================================
-- 11. SYSTEM_VENDORS TABLE (Level 2 - B.9)
-- ============================================================

CREATE TABLE system_vendors (
    id SERIAL PRIMARY KEY,
    system_id INTEGER NOT NULL REFERENCES systems(id) ON DELETE CASCADE,

    vendor_type VARCHAR(50) CHECK (vendor_type IN (
        'development', 'maintenance', 'both', 'other'
    )),
    vendor_name VARCHAR(255) NOT NULL,
    contract_number VARCHAR(100),
    contract_date DATE,
    contract_value NUMERIC(15,2),
    scope TEXT,
    warranty_status VARCHAR(50) CHECK (warranty_status IN (
        'active', 'expired', 'none'
    )),
    warranty_end_date DATE,
    maintenance_end_date DATE,

    dependency_level VARCHAR(20) CHECK (dependency_level IN (
        'high', 'medium', 'low'
    )),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE system_vendors IS 'Nhà thầu & hợp đồng';

-- ============================================================
-- 12. SYSTEM_TEAMS TABLE (Level 2 - B.9)
-- ============================================================

CREATE TABLE system_teams (
    id SERIAL PRIMARY KEY,
    system_id INTEGER UNIQUE NOT NULL REFERENCES systems(id) ON DELETE CASCADE,

    team_size INTEGER,
    roles JSONB,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE system_teams IS 'Đội ngũ nội bộ';
COMMENT ON COLUMN system_teams.roles IS 'JSON array: [{role: "BA", count: 2}, {role: "Dev", count: 5}]';

-- ============================================================
-- 13. USERS TABLE
-- ============================================================

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    org_id INTEGER REFERENCES organizations(id),
    role VARCHAR(20) CHECK (role IN ('admin', 'org_admin', 'user')),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE users IS 'User accounts';
COMMENT ON COLUMN users.role IS 'admin: Bộ (full access), org_admin: quản lý đơn vị, user: người nhập liệu';

-- ============================================================
-- 14. AUDIT_LOGS TABLE
-- ============================================================

CREATE TABLE audit_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    action VARCHAR(50) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id INTEGER,
    details JSONB,
    ip_address VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE audit_logs IS 'Audit trail - nhật ký hoạt động';
COMMENT ON COLUMN audit_logs.details IS 'JSON object: full details of the action';

-- ============================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================

-- Organizations
CREATE INDEX idx_organizations_code ON organizations(code);
CREATE INDEX idx_organizations_status ON organizations(status);

-- Systems
CREATE INDEX idx_systems_org_id ON systems(org_id);
CREATE INDEX idx_systems_status ON systems(status);
CREATE INDEX idx_systems_system_group ON systems(system_group);
CREATE INDEX idx_systems_criticality ON systems(criticality_level);
CREATE INDEX idx_systems_created_at ON systems(created_at);

-- JSONB indexes
CREATE INDEX idx_systems_target_users ON systems USING GIN(target_users);

-- Integrations
CREATE INDEX idx_integrations_system_from ON integrations(system_id_from);
CREATE INDEX idx_integrations_system_to ON integrations(system_id_to);
CREATE INDEX idx_integrations_method ON integrations(integration_method);

-- API Inventory
CREATE INDEX idx_api_inventory_system_id ON api_inventory(system_id);
CREATE INDEX idx_api_inventory_type ON api_inventory(api_type);

-- Attachments
CREATE INDEX idx_attachments_system_id ON attachments(system_id);
CREATE INDEX idx_attachments_file_type ON attachments(file_type);

-- Users
CREATE INDEX idx_users_org_id ON users(org_id);
CREATE INDEX idx_users_role ON users(role);

-- Audit logs
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);

-- JSONB GIN indexes
CREATE INDEX idx_system_data_info_data_types ON system_data_info USING GIN(data_types);
CREATE INDEX idx_system_architecture_has_layers ON system_architecture USING GIN(has_layers);
CREATE INDEX idx_audit_logs_details ON audit_logs USING GIN(details);

-- ============================================================
-- TRIGGERS FOR updated_at
-- ============================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables with updated_at
CREATE TRIGGER update_organizations_updated_at BEFORE UPDATE ON organizations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_systems_updated_at BEFORE UPDATE ON systems
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_system_architecture_updated_at BEFORE UPDATE ON system_architecture
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_system_data_info_updated_at BEFORE UPDATE ON system_data_info
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_system_operations_updated_at BEFORE UPDATE ON system_operations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_system_assessment_updated_at BEFORE UPDATE ON system_assessment
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_system_costs_updated_at BEFORE UPDATE ON system_costs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- SAMPLE DATA (for testing)
-- ============================================================

-- Sample organization
INSERT INTO organizations (code, name, contact_person, email, phone, status)
VALUES ('CNTT', 'Cục Công nghệ thông tin', 'Nguyễn Văn A', 'a.nguyen@example.gov.vn', '024-12345678', 'draft');

-- Sample user (password: admin123, bcrypt hashed)
INSERT INTO users (username, email, hashed_password, full_name, org_id, role)
VALUES (
    'admin',
    'admin@example.gov.vn',
    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYqNZVxqL8W',
    'Administrator',
    1,
    'admin'
);

-- ============================================================
-- USEFUL QUERIES
-- ============================================================

-- Count systems by org
-- SELECT o.name, COUNT(s.id) as system_count
-- FROM organizations o
-- LEFT JOIN systems s ON o.id = s.org_id
-- GROUP BY o.id, o.name;

-- Systems by technology stack
-- SELECT
--     sa.backend_tech,
--     COUNT(*) as count
-- FROM systems s
-- JOIN system_architecture sa ON s.id = sa.system_id
-- GROUP BY sa.backend_tech
-- ORDER BY count DESC;

-- Integration map
-- SELECT
--     s1.system_name as from_system,
--     COALESCE(s2.system_name, i.external_system_name) as to_system,
--     i.data_exchanged,
--     i.integration_method
-- FROM integrations i
-- JOIN systems s1 ON i.system_id_from = s1.id
-- LEFT JOIN systems s2 ON i.system_id_to = s2.id;

-- Systems with expired warranty
-- SELECT
--     s.system_name,
--     so.warranty_end_date,
--     so.vendor_name
-- FROM systems s
-- JOIN system_operations so ON s.id = so.system_id
-- WHERE so.warranty_end_date < CURRENT_DATE
-- ORDER BY so.warranty_end_date;

-- ============================================================
-- END OF SCHEMA
-- ============================================================
