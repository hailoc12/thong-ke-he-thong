# System Creation - Correct Data Structure Guide

## Purpose
This document shows the CORRECT data structure for creating a system with COMPLETE data across all 9 tabs.

**Problem với script hiện tại**: Một số fields được đặt sai vị trí (nested vs top-level).

---

## Data Structure Overview

```javascript
{
    // =========================================================================
    // TOP-LEVEL SYSTEM MODEL FIELDS (System table)
    // =========================================================================

    // Tab 1: Thông tin cơ bản
    system_name: 'Hệ thống X',
    system_name_en: 'System X',
    purpose: 'Purpose description...',
    system_group: 'Administrative',
    status: 'operating',
    go_live_date: '2023-03-15',
    current_version: 'v2.5.3',
    scope: 'internal_unit',
    criticality_level: 'high',
    form_level: 2,

    business_owner: 'Nguyễn Văn A',
    technical_owner: 'Trần Thị B',
    business_owner_contact: 'email@example.com | 0912345678',
    technical_owner_contact: 'email@example.com | 0912345678',

    users_total: 450,
    users_mau: 380,
    users_dau: 120,

    // Tab 2: MỤC TIÊU & NGƯỜI DÙNG (TOP-LEVEL, not in architecture_data!)
    business_objectives: [
        'Mục tiêu 1',
        'Mục tiêu 2',
        // Max 5 recommended
    ],
    target_users: [
        'leader',
        'staff',
        'citizen'
    ],
    business_processes: [
        'Quy trình 1',
        'Quy trình 2'
    ],

    // Tab 3: CÔNG NGHỆ (TOP-LEVEL)
    programming_language: 'Python',
    framework: 'Django',
    database_name: 'PostgreSQL',
    database_version: '15.4',
    hosting_platform: 'on_premise',  // choices: cloud, on_premise, hybrid
    cloud_provider: '',

    // =========================================================================
    // NESTED: SystemArchitecture (Tab 2 - kiến trúc, Tab 3 - tech stack)
    // =========================================================================
    architecture_data: {
        // Tab 2: User và Architecture
        user_types: [
            'internal_staff',
            'internal_leadership',
            'external_citizen'
        ],
        annual_users: 125000,

        // Kiến trúc
        architecture_description: 'Mô tả kiến trúc...',
        architecture_type: 'modular',  // choices: monolithic, modular, microservices, soa, serverless, saas, other
        deployment_model: 'on_premise',
        has_architecture_diagram: false,

        // Tab 3: Technology Stack (IMPORTANT: These go in architecture_data!)
        backend_tech: 'Django REST Framework, Celery, Redis',
        frontend_tech: 'React, TypeScript, Ant Design',
        mobile_app: 'none',  // choices: native, hybrid, pwa, none

        // Database info
        database_type: '',
        database_model: '',  // choices: centralized, distributed, per_app
        has_data_model_doc: false,

        // Cloud info
        hosting_type: '',
        cloud_provider: ''
    },

    // =========================================================================
    // NESTED: SystemDataInfo (Tab 4: Dữ liệu)
    // =========================================================================
    data_info_data: {
        // Phân loại
        data_classification_type: 'confidential',  // NOT 'data_classification'!

        // Nguồn dữ liệu
        data_sources: [
            'Cơ sở dữ liệu nội bộ',
            'Hệ thống khác',
            'Nhập thủ công'
        ],

        // Loại dữ liệu
        data_types: [
            'Thông tin cá nhân',
            'Văn bản',
            'File đính kèm'
        ],

        // Khối lượng
        data_volume: '2.5 TB dữ liệu, 850,000 hồ sơ',
        storage_size_gb: 2500,
        file_storage_size_gb: 500,
        growth_rate_percent: 8.0,

        // Quy trình
        data_flow_description: 'Mô tả data flow...',

        // Sao lưu
        backup_frequency: 'daily',
        backup_retention_period: '365 ngày',
        disaster_recovery_plan: 'RPO = 4h, RTO = 8h...',

        // API
        has_api: true,
        api_endpoints_count: 15,

        // Chia sẻ
        shared_with_systems: 'Hệ thống A, Hệ thống B',

        // Standards
        has_data_standard: true,
        has_personal_data: true,
        has_sensitive_data: true
    },

    // =========================================================================
    // NESTED: SystemIntegration (Tab 5: Tích hợp)
    // =========================================================================
    integration_data: {
        // Phương thức
        data_exchange_method: 'RESTful API',
        api_standard: 'RESTful API (JSON), OAuth 2.0, OpenAPI 3.0',

        // Hệ thống tích hợp
        integrated_internal_systems: [
            'Hệ thống Văn bản',
            'Hệ thống SSO'
        ],
        integrated_external_systems: [
            'Cổng DVC',
            'eKYC'
        ],

        // API
        api_list: [
            'POST /api/records/create',
            'GET /api/records/{id}',
            'PUT /api/records/{id}/status'
        ],

        // Tài liệu
        api_documentation: 'Swagger UI tại https://...',
        api_versioning_standard: 'Semantic Versioning',
        has_integration_monitoring: true,

        // Mô tả
        integration_description: 'Tích hợp 2 chiều với...',

        // Additional fields
        has_integration: true,
        integration_count: 5,
        integration_types: ['API đồng bộ', 'Webhook'],
        connected_internal_systems: 'Văn bản, SSO',
        connected_external_systems: 'DVC, eKYC',
        has_integration_diagram: true,
        uses_standard_api: true,
        has_api_gateway: false,
        api_gateway_name: '',
        has_api_versioning: true,
        has_rate_limiting: true,
        api_provided_count: 8,
        api_consumed_count: 7
    },

    // =========================================================================
    // NESTED: SystemOperations (Tab 6: Vận hành)
    // =========================================================================
    operations_data: {
        // Hỗ trợ
        support_level: '24/7 hotline, email, ticket',  // Max 50 chars!
        support_contact: 'Hotline: 1900-xxxx | Email: support@example.com',
        avg_incident_response_hours: 4.5,

        // Bảo trì
        maintenance_schedule: 'Chủ nhật đầu mỗi tháng, 01:00-05:00',
        last_major_update: '2025-11-20',
        has_maintenance_contract: true,
        maintenance_end_date: '2026-12-31',

        // Triển khai
        deployment_location: 'hybrid',  // choices: datacenter, cloud, hybrid
        compute_type: 'vm',  // choices: vm, container, serverless, bare_metal
        compute_specifications: 'App: 4x VM (8 vCPU, 16GB), DB: 2x VM (16 vCPU, 64GB)',
        deployment_frequency: 'monthly',  // choices: daily, weekly, monthly, quarterly, yearly, on_demand

        // Giám sát
        monitoring_tools: 'Prometheus, Grafana, ELK, Sentry',

        // SLA
        uptime_sla: '99.5%',
        response_time_sla: 'P50: <500ms, P95: <2s',

        // Dev & Ops info
        dev_type: '',
        developer: 'ABC Tech Company',
        dev_team_size: 8,
        warranty_status: 'active',
        warranty_end_date: '2026-05-31',
        operator: 'Internal IT Team',
        ops_team_size: 5,
        vendor_dependency: 'low',
        can_self_maintain: true
    },

    // =========================================================================
    // NESTED: SystemAssessment (Tab 7: Đánh giá - P0.8 Phase 4)
    // =========================================================================
    assessment_data: {
        // Quy trình (Top-level field 'business_processes', but also here)
        business_processes: [
            'Tiếp nhận',
            'Xử lý',
            'Lưu trữ',
            'Tra cứu'
        ],

        // Tích hợp
        integration_types: [
            'API đồng bộ',
            'Webhook',
            'File import'
        ],

        // Sẵn sàng tích hợp
        integration_readiness: [
            {
                system: 'Hệ thống Văn bản',
                status: 'ready',
                notes: 'API sẵn sàng'
            },
            {
                system: 'Cổng DVC',
                status: 'in_progress',
                notes: 'Chờ API key'
            }
        ],

        // Rào cản
        blockers: [
            {
                issue: 'Chưa có quy định về lưu trữ',
                impact: 'high',
                status: 'pending'
            }
        ],

        // Đề xuất
        recommendation: 'upgrade',  // choices: keep, upgrade, replace, merge
        recommendation_notes: 'Nên tích hợp thêm với...',

        // Performance
        performance_rating: 4.5,
        uptime_percent: 99.5,
        avg_response_time_ms: 450,
        user_satisfaction_rating: 4.2,

        // Technical debt
        technical_debt_level: 'medium',
        needs_replacement: false,
        replacement_plan: '',
        major_issues: 'Cần nâng cấp database',
        improvement_suggestions: 'Thêm caching layer',
        future_plans: 'Migrate to microservices',
        modernization_priority: 'medium'
    },

    // =========================================================================
    // NESTED: SystemCost (Tab 8: Chi phí - Level 2 ONLY)
    // =========================================================================
    cost_data: {
        // Development
        initial_investment: 1200000000,
        development_cost: 1250000000,
        development_cost_notes: 'Chi phí giai đoạn 1...',

        // Annual costs
        annual_license_cost: 80000000,
        annual_maintenance_cost: 50000000,
        annual_infrastructure_cost: 120000000,
        annual_personnel_cost: 100000000,
        annual_operating_cost: 350000000,  // Total annual

        // ROI
        total_cost_of_ownership: 2500000000,
        roi_percentage: 28.5,
        roi_notes: 'Tiết kiệm 400 triệu/năm...',

        // License
        license_type: 'Open Source + Commercial Support',
        license_cost: 80000000,
        license_renewal_date: '2026-12-31',

        // Cost breakdown
        operating_cost_breakdown: {
            license: 80000000,
            hosting: 120000000,
            support: 100000000,
            maintenance: 50000000
        },

        cost_notes: 'Chi tiết breakdown...',
        funding_source: 'Ngân sách nhà nước'
    },

    // =========================================================================
    // NESTED: SystemVendor (Tab 9: Nhà cung cấp - Level 2 ONLY)
    // =========================================================================
    vendor_data: {
        // Primary vendor
        primary_vendor_name: 'Công ty TNHH ABC',
        primary_vendor_contact: 'contact@abc.vn | (024) 3xxx',
        vendor_name: 'Công ty TNHH ABC',
        vendor_type: 'system_integrator',
        vendor_contact_person: 'Ms. Nguyễn Thị D',
        vendor_phone: '(024) 3xxx xxxx',
        vendor_email: 'contact@abc.vn',

        // Contract
        contract_number: 'HĐ-CNTT-2022-045',
        contract_start_date: '2022-06-01',
        contract_end_date: '2026-05-31',
        contract_value: 1250000000,

        // Performance
        vendor_performance_rating: 4.5,
        vendor_responsiveness_rating: 4.2,
        vendor_lock_in_risk: 'low',
        alternative_vendors: 'Công ty XYZ, Công ty DEF',

        // Other vendors
        other_vendors: [
            {
                name: 'Viettel IDC',
                role: 'Data center hosting',
                contact: 'enterprise@viettel.vn'
            }
        ],

        // SLA
        sla_terms: 'Uptime 99.5%, penalty 0.5%/month...'
    },

    // =========================================================================
    // NESTED: SystemInfrastructure (Level 2: Hạ tầng)
    // =========================================================================
    infrastructure_data: {
        // Server
        num_servers: 6,
        server_configuration: 'App: 4x VM (Ubuntu, 8vCPU, 16GB), DB: 2x VM (16vCPU, 64GB)',
        server_specs: 'Intel Xeon, 2.5GHz',
        total_cpu_cores: 64,
        total_ram_gb: 192,
        total_storage_tb: 5,

        // Network
        network_configuration: 'VLAN per tier, firewall, DMZ',
        bandwidth_mbps: 1000,
        has_cdn: false,
        has_load_balancer: true,

        // Storage
        storage_capacity: '5 TB SAN, hiện dùng 2.5 TB',

        // Backup & DR
        backup_frequency: 'daily',
        backup_retention_days: 365,
        has_disaster_recovery: true,
        rto_hours: 8,
        rpo_hours: 4,

        infrastructure_notes: 'Thiết kế scale horizontal...'
    },

    // =========================================================================
    // NESTED: SystemSecurity (Level 2: Bảo mật)
    // =========================================================================
    security_data: {
        // Authentication
        authentication_method: 'SSO (SAML 2.0)',  // NOT 'SSO' - choices: password, sso, mfa, certificate, biometric
        auth_method: 'sso',
        has_mfa: true,
        has_rbac: true,
        authorization_model: 'RBAC - 8 roles',

        // Encryption
        encryption_at_rest: 'AES-256 database, MinIO KMS files',
        encryption_in_transit: 'TLS 1.3 external, TLS 1.2 internal',
        has_data_encryption_at_rest: true,
        has_data_encryption_in_transit: true,

        // Security tools
        has_firewall: true,
        has_waf: true,
        has_ids_ips: true,
        has_antivirus: true,
        has_vulnerability_scanning: true,

        // Compliance
        compliance_standards: [
            'Nghị định 85/2016/NĐ-CP',
            'Thông tư 20/2017/TT-BTTTT',
            'ISO 27001 (đang triển khai)'
        ],

        // Audit
        last_security_audit: '2025-09-15',
        last_security_audit_date: '2025-09-15',
        last_penetration_test_date: '2025-09-15',
        audit_findings: '12 findings: 2 high (fixed), 5 medium, 5 low',

        // Incidents
        security_incidents: [
            {
                date: '2025-03-20',
                severity: 'medium',
                description: 'Brute force blocked by WAF',
                resolved: true
            }
        ],
        security_incidents_last_year: 1,

        security_notes: 'Pentest yearly, vuln scan quarterly...',
        security_improvements_needed: 'Deploy SIEM'
    }
}
```

---

## Key Takeaways

### Common Mistakes

1. **Placing fields in wrong location**:
   - `business_objectives` → Top-level System (NOT in architecture_data)
   - `target_users` → Top-level System (NOT in architecture_data)
   - `business_processes` → Top-level System (NOT in assessment_data, though also exists there)
   - `frontend_tech`, `backend_tech` → SystemArchitecture (IN architecture_data)

2. **Wrong field names**:
   - Use `data_classification_type` NOT `data_classification`
   - Use `authentication_method` choices NOT free text

3. **Wrong choice values**:
   - `hosting_platform`: `on_premise` NOT `On-Premise Servers`
   - `deployment_location`: `hybrid` NOT `On-premise tại Data Center...`
   - `compute_type`: `vm` NOT `Virtual Machines`
   - `recommendation`: `upgrade` NOT `expand`

4. **Character limits**:
   - `support_level`: Max 50 characters!

### Field Type Reference

- **CharField with choices**: Must use exact choice value from model
- **JSONField**: Can be array or object
  - Arrays: `['item1', 'item2']`
  - Objects: `[{key: 'value'}]`
- **IntegerField**: Numbers without quotes
- **DecimalField**: Strings with decimals: `"1250000000.00"`
- **DateField**: Format `YYYY-MM-DD`
- **BooleanField**: `true` / `false`

---

## Testing Strategy

1. **Create system via API** (script): Validates serializer correctly
2. **Get system detail via API**: Verifies nested data saved
3. **Edit system in browser**: Tests form pre-fill
4. **Query database**: Confirms data persistence

---

## File Location

- This guide: `/tests/e2e/SYSTEM_CREATE_DATA_STRUCTURE.md`
- Working script: `/tests/e2e/create-full-system-sample.js`
- Fix needed: Update script with correct field locations per this guide
