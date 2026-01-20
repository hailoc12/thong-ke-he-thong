#!/usr/bin/env node
/**
 * E2E Test: Create System with 100% COMPLETE Data (FIXED VERSION)
 *
 * Purpose: Create a realistic system with ALL fields correctly placed
 * Account: org1 (Cục Sở hữu trí tuệ)
 * System: "Hệ thống Quản lý Tài sản Công" (Public Asset Management System)
 *
 * All 9 tabs + Level 2 fields with CORRECT data structure
 *
 * Usage: node create-complete-system-fixed.js
 */

const https = require('https');

// Configuration
const API_BASE = 'https://thongkehethong.mindmaid.ai/api';
const USERNAME = 'org1';
const PASSWORD = 'Org1@2026';

// Helper: Make HTTPS request
function makeRequest(options, data = null) {
    return new Promise((resolve, reject) => {
        const req = https.request(options, (res) => {
            let body = '';
            res.on('data', (chunk) => { body += chunk; });
            res.on('end', () => {
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    resolve({ status: res.statusCode, data: JSON.parse(body) });
                } else {
                    reject({ status: res.statusCode, data: body });
                }
            });
        });
        req.on('error', reject);
        if (data) req.write(JSON.stringify(data));
        req.end();
    });
}

// Step 1: Login
async function login() {
    console.log('🔐 Step 1: Logging in as org1...');
    const options = {
        hostname: 'thongkehethong.mindmaid.ai',
        path: '/api/token/',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
    };
    const body = { username: USERNAME, password: PASSWORD };
    const response = await makeRequest(options, body);
    console.log('✅ Login successful');
    return response.data.access;
}

// Step 2: Create system with COMPLETE data - FIXED VERSION
async function createCompleteSystem(token) {
    console.log('\n📝 Step 2: Creating system with 100% COMPLETE data (FIXED)...\n');

    const systemData = {
        // ============================================================
        // TAB 1: THÔNG TIN CƠ BẢN (Basic Information)
        // ============================================================
        system_name: 'Hệ thống Quản lý Tài sản Công',
        system_name_en: 'Public Asset Management System',
        purpose: 'Quản lý toàn bộ tài sản công của đơn vị; theo dõi quy trình mua sắm, bàn giao, sử dụng và thanh lý; tích hợp với hệ thống tài chính và kế toán; tạo báo cáo thống kê tài sản theo thời gian thực.',
        system_group: 'Administrative',
        status: 'operating',
        go_live_date: '2022-08-20',
        current_version: 'v3.1.2',
        scope: 'internal_unit',
        criticality_level: 'high',
        form_level: 2, // Level 2 to test all tabs

        // Người quản lý
        business_owner: 'Lê Văn Cường - Trưởng phòng Tài chính Kế toán',
        technical_owner: 'Phạm Thị Lan - Chuyên viên CNTT',
        business_owner_contact: 'levancuong@cshtt.gov.vn | 0912345678',
        technical_owner_contact: 'phamthilan@cshtt.gov.vn | 0987654321',

        // Người dùng
        users_total: 280,
        users_mau: 220,
        users_dau: 85,
        total_accounts: 315,
        num_organizations: 1,

        // Người chịu trách nhiệm
        responsible_person: 'Nguyễn Văn An - Trưởng phòng Quản lý tài sản',
        responsible_phone: '0912345123',

        // Bảo mật
        security_level: 3,
        has_security_documents: true,

        // Lịch sử nâng cấp
        upgrade_history: [
            {
                version: 'v3.0.0',
                date: '2024-01-15',
                description: 'Major upgrade: Added mobile support and REST API'
            },
            {
                version: 'v3.1.0',
                date: '2025-06-20',
                description: 'Feature update: Barcode scanning, batch import'
            }
        ],

        // ============================================================
        // TAB 2: MỤC TIÊU VÀ NGƯỜI DÙNG (TOP-LEVEL FIELDS!)
        // ============================================================
        business_objectives: [
            'Quản lý tập trung toàn bộ tài sản',
            'Tự động hóa quy trình mua sắm và thanh lý',
            'Tích hợp liên thông với hệ thống tài chính',
            'Báo cáo thống kê theo thời gian thực',
            'Tuân thủ quy định quản lý tài sản nhà nước'
        ],

        target_users: [
            'leader',    // Lãnh đạo
            'staff',     // Cán bộ
            'business'   // Đối tác kinh doanh
        ],

        business_processes: [
            'Đề xuất mua sắm tài sản',
            'Phê duyệt mua sắm',
            'Bàn giao tài sản',
            'Quản lý sử dụng',
            'Kiểm kê định kỳ',
            'Thanh lý tài sản'
        ],

        // Tài liệu thiết kế
        has_design_documents: true,

        // ============================================================
        // TAB 3: CÔNG NGHỆ (TOP-LEVEL)
        // ============================================================
        programming_language: 'Java',
        framework: 'Spring Boot',
        database_name: 'PostgreSQL',
        database_version: '14.8',
        hosting_platform: 'on_premise',
        cloud_provider: '',

        // ============================================================
        // NESTED: SystemArchitecture (Tab 2 + Tab 3)
        // ============================================================
        architecture_data: {
            // Tab 2: User types và annual users
            user_types: [
                'internal_staff',
                'internal_leadership',
                'internal_reviewer',
                'external_business'
            ],
            annual_users: 95000,

            // Kiến trúc
            architecture_description: 'Kiến trúc microservices với 5 services chính: Asset Service, Procurement Service, Finance Integration Service, Reporting Service, và Notification Service. Sử dụng API Gateway (Kong), message broker (Kafka), và cache (Redis).',
            architecture_type: 'microservices',
            deployment_model: 'on_premise',
            has_architecture_diagram: true,

            // Tab 3: Technology Stack (IN architecture_data!)
            backend_tech: 'Spring Boot 3.0, Spring Cloud, Hibernate, JWT Auth',
            frontend_tech: 'Vue.js 3, Vuex, Element Plus UI, TypeScript',
            mobile_app: 'hybrid',

            // Database
            database_type: 'PostgreSQL',
            database_model: 'centralized',
            has_data_model_doc: true,

            // Cloud
            hosting_type: 'dedicated_server',
            cloud_provider: ''
        },

        // ============================================================
        // NESTED: SystemDataInfo (Tab 4: Dữ liệu)
        // ============================================================
        data_info_data: {
            // Phân loại
            data_classification_type: 'internal',

            // Nguồn dữ liệu
            data_sources: [
                'Cơ sở dữ liệu tài sản hiện có',
                'Hệ thống tài chính kế toán',
                'Nhập liệu từ bộ phận quản lý tài sản',
                'Import từ file Excel định kỳ'
            ],

            // Loại dữ liệu
            data_types: [
                'Thông tin tài sản (mã, tên, loại, nguyên giá)',
                'Lịch sử mua sắm và thanh lý',
                'Thông tin đơn vị quản lý và người sử dụng',
                'File đính kèm (hóa đơn, hợp đồng, ảnh tài sản)',
                'Báo cáo kiểm kê và báo cáo thống kê'
            ],

            // Khối lượng
            data_volume: '1.8 TB dữ liệu, 120,000 tài sản, 45,000 file đính kèm. Tăng trưởng ~150 GB/năm.',
            storage_size_gb: 1800,
            file_storage_size_gb: 800,
            growth_rate_percent: 8.5,

            // Quy trình dữ liệu
            data_flow_description: 'Dữ liệu tài sản được nhập từ 3 nguồn: (1) Đề xuất mua sắm qua web form, (2) Tích hợp API từ hệ thống tài chính khi thanh toán, (3) Import batch từ Excel. Sau khi lưu, dữ liệu được đồng bộ sang hệ thống báo cáo và gửi notification cho người liên quan.',

            // Sao lưu
            backup_frequency: 'daily',
            backup_retention_period: '730 ngày (2 năm) cho backup hàng ngày, vĩnh viễn cho backup hàng năm',
            disaster_recovery_plan: 'RPO = 6 giờ, RTO = 12 giờ. Backup incremental mỗi 6 giờ, full backup hàng ngày lúc 02:00. Database replication sang server dự phòng real-time.',

            // API
            has_api: true,
            api_endpoints_count: 28,

            // Chia sẻ dữ liệu
            shared_with_systems: 'Hệ thống Tài chính Kế toán, Hệ thống Báo cáo Thống kê',

            // Data standards
            has_data_standard: true,
            has_personal_data: true,
            has_sensitive_data: false
        },

        // ============================================================
        // NESTED: SystemIntegration (Tab 5: Tích hợp)
        // ============================================================
        integration_data: {
            // Phương thức trao đổi
            data_exchange_method: 'RESTful API',
            api_standard: 'RESTful API (JSON), OAuth 2.0 Bearer Token, API versioning via URL path (/v1/, /v2/)',

            // Hệ thống tích hợp nội bộ
            integrated_internal_systems: [
                'Hệ thống Tài chính Kế toán',
                'Hệ thống Văn bản điện tử',
                'Hệ thống Nhân sự',
                'Hệ thống SSO đơn vị'
            ],

            // Hệ thống tích hợp ngoài
            integrated_external_systems: [
                'Hệ thống Kho bạc Nhà nước (thanh toán)',
                'Hệ thống VNPT CA (chữ ký số)'
            ],

            // Danh sách API
            api_list: [
                'POST /api/v1/assets - Tạo tài sản mới',
                'GET /api/v1/assets/{id} - Lấy thông tin tài sản',
                'PUT /api/v1/assets/{id} - Cập nhật tài sản',
                'DELETE /api/v1/assets/{id} - Xóa tài sản (soft delete)',
                'GET /api/v1/assets/search - Tìm kiếm tài sản',
                'POST /api/v1/procurement/create - Tạo đề xuất mua sắm',
                'GET /api/v1/reports/inventory - Báo cáo kiểm kê',
                'POST /api/v1/disposal/submit - Đề xuất thanh lý'
            ],

            // Tài liệu API
            api_documentation: 'Swagger UI tại https://assets.internal/api/docs, Postman Collection đầy đủ, API changelog, sandbox environment for testing',
            api_versioning_standard: 'URL path versioning (v1, v2), deprecated APIs maintained for 18 months',
            has_integration_monitoring: true,

            // Mô tả tích hợp
            integration_description: 'Tích hợp 2 chiều với hệ thống Tài chính (đồng bộ giá trị tài sản, trạng thái thanh toán), 1 chiều từ Nhân sự (lấy thông tin người sử dụng), 1 chiều đến Báo cáo (gửi dữ liệu thống kê). Sử dụng Kafka cho async events, REST API cho sync queries.',

            // Additional fields
            has_integration: true,
            integration_count: 6,
            integration_types: [
                'RESTful API đồng bộ',
                'Kafka event streaming',
                'Database view read-only',
                'File-based batch import'
            ],
            connected_internal_systems: 'Tài chính, Văn bản, Nhân sự, SSO',
            connected_external_systems: 'Kho bạc, VNPT CA',
            has_integration_diagram: true,
            uses_standard_api: true,
            has_api_gateway: true,
            api_gateway_name: 'Kong API Gateway',
            has_api_versioning: true,
            has_rate_limiting: true,
            api_provided_count: 28,
            api_consumed_count: 12
        },

        // ============================================================
        // NESTED: SystemOperations (Tab 6: Vận hành)
        // ============================================================
        operations_data: {
            // Hỗ trợ kỹ thuật
            support_level: '8x5 support (8AM-5PM, Mon-Fri)',
            support_contact: 'Hotline: 1800-xxxx | Email: support-assets@cshtt.gov.vn | Ticket system: https://helpdesk.internal/assets',
            avg_incident_response_hours: 2.5,

            // Bảo trì
            maintenance_schedule: 'Bảo trì định kỳ: Thứ 7 cuối tháng, 14:00-18:00. Cập nhật bảo mật: Thứ 3 hàng tuần, 23:00-24:00',
            last_major_update: '2025-12-10',
            has_maintenance_contract: true,
            maintenance_end_date: '2027-08-20',
            warranty_status: 'active',
            warranty_end_date: '2025-08-20',

            // Triển khai
            deployment_location: 'datacenter',
            compute_type: 'vm',
            compute_specifications: '5 microservices: 5x VM (4 vCPU, 8GB RAM mỗi VM), API Gateway: 1x VM (8 vCPU, 16GB), Database: 2x VM (16 vCPU, 64GB, RAID 10), Kafka: 3x VM (8 vCPU, 32GB)',
            deployment_frequency: 'weekly',

            // Dev & Ops
            dev_type: 'combined',  // 'internal', 'outsource', 'combined'
            developer: 'Công ty CP Giải pháp Công nghệ DEF',
            dev_team_size: 12,
            operator: 'Phòng CNTT - Cục Sở hữu trí tuệ',
            ops_team_size: 4,
            vendor_dependency: 'medium',
            can_self_maintain: true,

            // Giám sát
            monitoring_tools: 'Prometheus + Grafana (metrics), ELK Stack (centralized logs), Zipkin (distributed tracing), PagerDuty (incident alerting)',

            // SLA
            uptime_sla: '99.0% uptime (cho phép downtime ~7.2 giờ/tháng)',
            response_time_sla: 'P50: < 800ms, P95: < 3s, P99: < 8s cho các API CRUD tài sản'
        },

        // ============================================================
        // NESTED: SystemAssessment (Tab 7: Đánh giá)
        // ============================================================
        assessment_data: {
            // Performance metrics
            performance_rating: 4,  // Integer 1-5
            uptime_percent: 99.2,
            avg_response_time_ms: 650,
            user_satisfaction_rating: 4,  // Integer 1-5

            // Technical debt
            technical_debt_level: 'low',
            needs_replacement: false,
            replacement_plan: '',
            major_issues: 'Một số báo cáo phức tạp chạy chậm khi khối lượng dữ liệu lớn',
            improvement_suggestions: 'Thêm caching layer (Redis) cho các báo cáo hay dùng, optimize database indexes, implement read replicas',
            future_plans: 'Nâng cấp lên Spring Boot 3.2, migrate sang PostgreSQL 16, thêm full-text search với Elasticsearch',
            modernization_priority: 'low',

            // Integration readiness
            integration_readiness: [
                {
                    system: 'Hệ thống Tài chính Kế toán',
                    status: 'ready',
                    notes: 'API integration hoàn chỉnh, đã production'
                },
                {
                    system: 'Hệ thống Quản lý Dự án',
                    status: 'in_progress',
                    notes: 'Đang thiết kế API, dự kiến Q2/2026'
                },
                {
                    system: 'Hệ thống VNPT CA',
                    status: 'ready',
                    notes: 'Chữ ký số tích hợp đầy đủ'
                }
            ],

            // Blockers
            blockers: [
                {
                    issue: 'Chưa có guideline về phân loại tài sản thống nhất giữa các đơn vị',
                    impact: 'medium',
                    status: 'in_progress'
                },
                {
                    issue: 'API rate limit của Kho bạc quá thấp (10 req/min)',
                    impact: 'low',
                    status: 'accepted'
                }
            ],

            // Recommendation
            recommendation: 'keep',
            recommendation_notes: 'Hệ thống đang hoạt động tốt, chỉ cần nâng cấp nhỏ về performance. Nên giữ nguyên và đầu tư optimize thay vì thay thế.'
        },

        // ============================================================
        // NESTED: SystemCost (Tab 8: Chi phí - Level 2)
        // ============================================================
        cost_data: {
            // Development costs
            initial_investment: 1800000000,
            development_cost: 1850000000,
            development_cost_notes: 'Chi phí phát triển giai đoạn 2022-2023: Nhân công outsource 1.2 tỷ, license commercial libraries 150 triệu, training 100 triệu, testing & QA 200 triệu, infrastructure setup 200 triệu',

            // Annual operating costs
            annual_license_cost: 120000000,
            annual_maintenance_cost: 80000000,
            annual_infrastructure_cost: 180000000,
            annual_personnel_cost: 150000000,
            annual_operating_cost: 530000000,

            // Total cost
            total_cost_of_ownership: 3700000000,

            // ROI
            roi_percentage: 32.5,
            roi_notes: 'Tiết kiệm 550 triệu/năm nhờ: giảm thời gian kiểm kê (200 triệu), giảm sai sót trong quản lý tài sản (150 triệu), tự động hóa quy trình mua sắm (200 triệu). Payback period: ~3.4 năm',

            // License
            license_type: 'Commercial - Spring Boot Enterprise Support, Vue.js Enterprise, PostgreSQL Enterprise',
            license_cost: 120000000,
            license_renewal_date: '2026-08-20',

            // Cost breakdown
            operating_cost_breakdown: {
                license: 120000000,
                hosting: 180000000,
                support: 150000000,
                maintenance: 80000000
            },

            cost_notes: 'Chi phí hạ tầng bao gồm: Server (100tr), Storage (50tr), Network & Bandwidth (30tr)',
            funding_source: 'Ngân sách sự nghiệp năm 2022, Mục: Ứng dụng CNTT'
        },

        // ============================================================
        // NESTED: SystemVendor (Tab 9: Nhà cung cấp - Level 2)
        // ============================================================
        vendor_data: {
            // Development
            dev_type: 'contractor',
            developer: 'Công ty CP Giải pháp Công nghệ DEF',
            dev_team_size: 12,

            // Warranty
            warranty_status: 'active',
            warranty_end_date: '2026-12-31',

            // Maintenance
            has_maintenance_contract: true,
            maintenance_end_date: '2027-12-31',

            // Operations
            operator: 'FPT Software',
            ops_team_size: 5,
            vendor_dependency: 'Cao - Phụ thuộc vào FPT cho bảo trì và nâng cấp hệ thống',

            // Primary vendor
            primary_vendor_name: 'Công ty CP Giải pháp Công nghệ DEF',
            primary_vendor_contact: 'contact@def-tech.vn | (024) 3987 6543 | Mr. Trần Văn E',
            vendor_name: 'Công ty CP Giải pháp Công nghệ DEF',
            vendor_type: 'system_integrator',
            vendor_contact_person: 'Mr. Trần Văn E',
            vendor_phone: '(024) 3987 6543',
            vendor_email: 'tranevan@def-tech.vn',

            // Contract
            contract_number: 'HĐ-QLTS-2022-089',
            contract_start_date: '2022-03-01',
            contract_end_date: '2027-02-28',
            contract_value: 1850000000,

            // Performance
            vendor_performance_rating: 4,  // Integer 1-5
            vendor_responsiveness_rating: 5,  // Integer 1-5
            vendor_lock_in_risk: 'medium',
            alternative_vendors: 'Công ty TNHH ABC Solutions, Công ty CP XYZ Software, FPT Software',

            // Other vendors
            other_vendors: [
                {
                    name: 'Viettel IDC',
                    role: 'Data center colocation và hosting',
                    contact: 'enterprise@viettelidc.com.vn'
                },
                {
                    name: 'VNPT Technology',
                    role: 'Chữ ký số và tích hợp VNPT CA',
                    contact: 'ca-support@vnpt.vn'
                }
            ],

            // SLA
            sla_terms: 'Uptime 99.0%, Response time: P1 (critical) < 2h, P2 (high) < 4h, P3 (medium) < 8h, P4 (low) < 24h. Penalty: 1% giá trị hợp đồng/tháng nếu vi phạm SLA 2 tháng liên tiếp. Warranty 3 năm, free bug fixes, chargeable enhancement.'
        },

        // ============================================================
        // NESTED: SystemInfrastructure (Level 2: Hạ tầng)
        // ============================================================
        infrastructure_data: {
            // Servers
            num_servers: 13,
            server_configuration: '5 App VMs (4vCPU, 8GB each), 1 API Gateway VM (8vCPU, 16GB), 2 DB VMs (16vCPU, 64GB, PostgreSQL cluster), 3 Kafka VMs (8vCPU, 32GB), 1 Redis VM (8vCPU, 16GB), 1 Monitoring VM (4vCPU, 8GB)',
            server_specs: 'Intel Xeon E5-2680 v4, 2.4GHz, SSD Storage',
            total_cpu_cores: 136,
            total_ram_gb: 312,
            total_storage_tb: 8,

            // Network
            network_configuration: 'Segregated VLANs: App tier (VLAN 10), Data tier (VLAN 20), Management (VLAN 30). Stateful firewall giữa các tiers. Load balancer HA pair (active-standby).',
            bandwidth_mbps: 1000,
            has_cdn: false,
            has_load_balancer: true,

            // Storage
            storage_capacity: '8 TB SAN storage (Dell EMC Unity), hiện dùng 3.2 TB (40%), còn 4.8 TB. Tốc độ tăng ~600 GB/năm, đủ dùng thêm 8 năm',

            // Backup & DR
            backup_frequency: 'daily',
            backup_retention_days: 730,
            has_disaster_recovery: true,
            rto_hours: 12,
            rpo_hours: 6,

            infrastructure_notes: 'Hạ tầng được thiết kế để scale theo chiều ngang (horizontal scaling). Database sử dụng PostgreSQL cluster (primary-standby replication). Kafka cluster 3 nodes đảm bảo high availability. Redis cluster 3 nodes (1 master, 2 replicas).'
        },

        // ============================================================
        // NESTED: SystemSecurity (Level 2: Bảo mật)
        // ============================================================
        security_data: {
            // Authentication & Authorization
            authentication_method: 'sso',
            auth_method: 'sso',
            authorization_model: 'RBAC (Role-Based Access Control) với 12 roles chi tiết theo chức năng',
            has_mfa: true,
            has_rbac: true,

            // Encryption
            has_encryption: true,  // ✅ REQUIRED FIELD - Tab 6
            encryption_at_rest: 'AES-256 cho PostgreSQL Transparent Data Encryption (TDE), file storage trên SAN encrypted',
            encryption_in_transit: 'TLS 1.3 cho tất cả external connections, TLS 1.2 cho internal service-to-service',
            has_data_encryption_at_rest: true,
            has_data_encryption_in_transit: true,

            // Security tools
            has_firewall: true,
            has_waf: true,
            has_ids_ips: true,
            has_antivirus: true,
            has_vulnerability_scanning: true,

            // Audit logging
            has_audit_log: true,

            // Compliance
            compliance_standards_list: 'ISO 27001, NIST Cybersecurity Framework, Nghị định 85/2016/NĐ-CP, Thông tư 20/2017/TT-BTTTT',
            compliance_standards: [
                'Nghị định 85/2016/NĐ-CP về bảo đảm ATTT mạng',
                'Thông tư 20/2017/TT-BTTTT về bảo đảm ATTT cấp độ 2',
                'ISO/IEC 27001:2013 (đã chứng nhận)',
                'Quy chuẩn kỹ thuật quốc gia về ATTT QCVN 28:2019/BTTTT'
            ],

            // Audit & Testing
            last_security_audit: '2025-10-15',
            last_security_audit_date: '2025-10-15',
            last_penetration_test_date: '2025-11-20',
            audit_findings: '15 findings: 0 critical, 3 high (đã fix), 7 medium (đang fix), 5 low (accepted risk)',

            // Incidents
            security_incidents: [
                {
                    date: '2025-05-10',
                    severity: 'low',
                    description: 'SQL injection attempt blocked by WAF',
                    resolved: true
                },
                {
                    date: '2025-08-22',
                    severity: 'medium',
                    description: 'Phishing email target employees, blocked by email gateway',
                    resolved: true
                }
            ],
            security_incidents_last_year: 2,

            security_notes: 'Penetration testing hàng năm bởi bên thứ 3 độc lập. Vulnerability scanning hàng quý với Nessus. Security awareness training bắt buộc cho 100% users hàng năm. Incident response plan đã được test drill.',
            security_improvements_needed: 'Triển khai SIEM solution để tập trung log analysis và threat detection. Nâng cấp WAF lên version mới hơn. Implement API security gateway với OWASP API Security Top 10 controls.'
        }
    };

    const options = {
        hostname: 'thongkehethong.mindmaid.ai',
        path: '/api/systems/',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
    };

    console.log('📊 System Data Summary:');
    console.log('   Name:', systemData.system_name);
    console.log('   Name EN:', systemData.system_name_en);
    console.log('   Form Level:', systemData.form_level, '(includes ALL Level 2 tabs)');
    console.log('   Total Users:', systemData.users_total);
    console.log('   Technologies:', systemData.programming_language, '+', systemData.framework, '+', systemData.database_name);
    console.log('   Business Objectives:', systemData.business_objectives.length, 'items');
    console.log('   Target Users:', systemData.target_users.length, 'types');
    console.log('   Business Processes:', systemData.business_processes.length, 'processes');
    console.log('   Development Cost:', systemData.cost_data.development_cost.toLocaleString('vi-VN'), 'VNĐ');
    console.log('   Annual Operating Cost:', systemData.cost_data.annual_operating_cost.toLocaleString('vi-VN'), 'VNĐ/năm');
    console.log('   Total Servers:', systemData.infrastructure_data.num_servers);
    console.log('   Total CPU Cores:', systemData.infrastructure_data.total_cpu_cores);
    console.log('   Total RAM:', systemData.infrastructure_data.total_ram_gb, 'GB');
    console.log('\n🚀 Sending request to API...\n');

    const response = await makeRequest(options, systemData);
    return response.data;
}

// Main execution
async function main() {
    console.log('╔════════════════════════════════════════════════════════════════╗');
    console.log('║  E2E Test: Create System with 100% COMPLETE Data (FIXED)      ║');
    console.log('╚════════════════════════════════════════════════════════════════╝\n');

    try {
        const token = await login();
        const system = await createCompleteSystem(token);

        console.log('╔════════════════════════════════════════════════════════════════╗');
        console.log('║  ✅ SUCCESS: System created with 100% COMPLETE data (FIXED)    ║');
        console.log('╚════════════════════════════════════════════════════════════════╝\n');

        console.log('📋 Created System Details:');
        console.log('   ID:', system.id);
        console.log('   Code:', system.system_code);
        console.log('   Name:', system.system_name);
        console.log('   Name EN:', system.system_name_en);
        console.log('   Organization:', system.org_name || 'Cục Sở hữu trí tuệ');
        console.log('   Status:', system.status);
        console.log('   Form Level:', system.form_level);
        console.log('   Criticality:', system.criticality_level);

        console.log('\n✅ ALL 9 TABS + Level 2 data created successfully!');
        console.log('   ✓ Tab 1: Thông tin cơ bản (Basic Info)');
        console.log('   ✓ Tab 2: Mục tiêu & Người dùng (Objectives & Users) - FIXED placement');
        console.log('   ✓ Tab 3: Công nghệ (Technology Stack) - FIXED placement');
        console.log('   ✓ Tab 4: Dữ liệu (Data Information)');
        console.log('   ✓ Tab 5: Tích hợp (Integration)');
        console.log('   ✓ Tab 6: Vận hành (Operations)');
        console.log('   ✓ Tab 7: Đánh giá (Assessment)');
        console.log('   ✓ Tab 8: Chi phí (Cost) - Level 2');
        console.log('   ✓ Tab 9: Nhà cung cấp (Vendor) - Level 2');
        console.log('   ✓ Level 2: Hạ tầng (Infrastructure)');
        console.log('   ✓ Level 2: Bảo mật (Security)');

        console.log('\n🔗 View system:');
        console.log('   https://thongkehethong.mindmaid.ai/systems/' + system.id);

        console.log('\n📊 Data Completeness Stats:');
        console.log('   - Business Objectives:', system.business_objectives?.length || 0, 'items');
        console.log('   - Target Users:', system.target_users?.length || 0, 'types');
        console.log('   - Business Processes:', system.business_processes?.length || 0, 'processes');
        console.log('   - User Types:', system.architecture?.user_types?.length || 0, 'types');
        console.log('   - Data Sources:', system.data_info?.data_sources?.length || 0, 'sources');
        console.log('   - Integration Types:', system.integration?.integration_types?.length || 0, 'types');
        console.log('   - Compliance Standards:', system.security?.compliance_standards?.length || 0, 'standards');

        // Return system ID for verification
        return system.id;

    } catch (error) {
        console.error('\n❌ Error:', error);
        if (error.data) {
            console.error('Response:', error.data);
        }
        process.exit(1);
    }
}

main().then(systemId => {
    console.log('\n✅ Test completed successfully!');
    console.log('System ID:', systemId);
    process.exit(0);
}).catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
});
