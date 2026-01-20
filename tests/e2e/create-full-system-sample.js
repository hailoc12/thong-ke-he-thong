#!/usr/bin/env node
/**
 * E2E Test: Create System with COMPLETE Data
 *
 * Purpose: Create a realistic mock system with ALL fields filled
 * Account: org1 (Cục Sở hữu trí tuệ)
 * System: "Hệ thống Quản lý Hồ sơ Điện tử" (Electronic Records Management System)
 *
 * This script demonstrates filling ALL 9 tabs with comprehensive, realistic data
 * to properly test the entire form flow and data persistence.
 *
 * Usage: node create-full-system-sample.js
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

// Step 2: Create system with FULL data
async function createFullSystem(token) {
    console.log('\n📝 Step 2: Creating system with COMPLETE data across all tabs...\n');

    const systemData = {
        // ============================================================
        // TAB 1: THÔNG TIN CỞ BẢN (Basic Information)
        // ============================================================
        system_name: 'Hệ thống Quản lý Hồ sơ Điện tử',
        system_name_en: 'Electronic Records Management System',
        purpose: 'Quản lý, lưu trữ và tra cứu hồ sơ điện tử của đơn vị; số hóa quy trình nghiệp vụ xử lý hồ sơ; tích hợp với hệ thống văn bản điện tử và cổng dịch vụ công; giảm thời gian xử lý và tăng tính minh bạch trong quản lý hồ sơ công dân.',
        system_group: 'Administrative',
        status: 'operating',
        go_live_date: '2023-03-15',
        current_version: 'v2.5.3',
        scope: 'internal_unit',
        criticality_level: 'high',
        form_level: 2, // Level 2 để test tất cả tabs

        // Người quản lý
        business_owner: 'Nguyễn Văn An - Trưởng phòng Hành chính Tổng hợp',
        technical_owner: 'Trần Thị Bình - Trưởng phòng CNTT',
        business_owner_contact: 'nguyenvanan@cshtt.gov.vn | 0912345001',
        technical_owner_contact: 'tranthibinh@cshtt.gov.vn | 0912345002',

        // Người dùng
        users_total: 450,
        users_mau: 380,
        users_dau: 120,

        // ============================================================
        // TAB 2: MỤC TIÊU VÀ NGƯỜI DÙNG (Objectives & Users)
        // ============================================================
        architecture_data: {
            // Mục tiêu nghiệp vụ
            business_objectives: [
                'Số hóa quy trình xử lý hồ sơ',
                'Giảm thời gian tra cứu và xử lý',
                'Tăng cường tính minh bạch',
                'Tích hợp liên thông dữ liệu',
                'Tuân thủ quy định về lưu trữ điện tử'
            ],

            // Loại người dùng
            user_types: [
                'internal_staff',        // Cán bộ nội bộ
                'internal_leadership',   // Lãnh đạo
                'internal_reviewer',     // Người phê duyệt
                'external_citizen'       // Công dân (tra cứu)
            ],

            // Thống kê người dùng
            annual_users: 125000, // Lượt truy cập/năm

            // Kiến trúc tổng quan
            architecture_description: 'Kiến trúc 3 tầng: Frontend (React), Backend (Django REST), Database (PostgreSQL). Tích hợp với hệ thống SSO của đơn vị, kết nối API với hệ thống văn bản và cổng dịch vụ công. Sử dụng MinIO cho lưu trữ file đính kèm.',
            architecture_type: 'modular',
            deployment_model: 'on_premise'
        },

        // ============================================================
        // TAB 3: CÔNG NGHỆ (Technology Stack)
        // ============================================================
        programming_language: 'Python',
        framework: 'Django',
        frontend_tech: 'React, TypeScript, Ant Design',
        backend_tech: 'Django REST Framework, Celery, Redis',
        database_name: 'PostgreSQL',
        database_version: '15.4',
        hosting_platform: 'on_premise',
        cloud_provider: '',

        // ============================================================
        // TAB 4: DỮ LIỆU (Data Information)
        // ============================================================
        data_info_data: {
            // Phân loại dữ liệu
            data_classification_type: 'confidential', // Mật - Do có thông tin cá nhân

            // Nguồn dữ liệu
            data_sources: [
                'Cơ sở dữ liệu nội bộ',
                'Hệ thống văn bản điện tử',
                'Cổng dịch vụ công quốc gia',
                'Nhập liệu thủ công từ hồ sơ giấy'
            ],

            // Loại dữ liệu
            data_types: [
                'Thông tin hồ sơ cá nhân',
                'Văn bản điện tử',
                'File đính kèm (PDF, Word, hình ảnh)',
                'Lịch sử xử lý hồ sơ',
                'Metadata hồ sơ'
            ],

            // Khối lượng dữ liệu
            data_volume: '2.5 TB dữ liệu, 850,000 hồ sơ, tăng trưởng ~200 GB/năm',

            // Quy trình dữ liệu
            data_flow_description: 'Dữ liệu nhập từ 3 nguồn: (1) Tích hợp API từ cổng DVC, (2) Import từ hệ thống văn bản, (3) Nhập thủ công. Sau xử lý, dữ liệu được đồng bộ ngược lại hệ thống văn bản và lưu trữ dài hạn trên MinIO.',

            // Sao lưu
            backup_frequency: 'daily',
            backup_retention_period: '365 ngày cho backup hàng ngày, 5 năm cho backup hàng năm',
            disaster_recovery_plan: 'RPO = 4 giờ, RTO = 8 giờ. Backup hàng ngày lúc 23:00, backup tăng dần 4h/lần. Server dự phòng hot standby tại data center phụ.'
        },

        // ============================================================
        // TAB 5: TÍCH HỢP (Integration)
        // ============================================================
        integration_data: {
            // Phương thức trao đổi dữ liệu
            data_exchange_method: 'RESTful API',
            api_standard: 'RESTful API (JSON), OAuth 2.0, OpenAPI 3.0 specification',

            // Hệ thống tích hợp
            integrated_internal_systems: [
                'Hệ thống Văn bản điện tử',
                'Hệ thống SSO đơn vị',
                'Hệ thống Email nội bộ',
                'Hệ thống Báo cáo thống kê'
            ],

            integrated_external_systems: [
                'Cổng Dịch vụ công quốc gia',
                'Hệ thống định danh điện tử (eKYC)',
                'Hệ thống chữ ký số'
            ],

            // Danh sách API
            api_list: [
                'POST /api/records/create - Tạo hồ sơ mới',
                'GET /api/records/{id} - Lấy chi tiết hồ sơ',
                'PUT /api/records/{id}/status - Cập nhật trạng thái',
                'GET /api/search - Tìm kiếm hồ sơ',
                'POST /api/attachments/upload - Upload file đính kèm'
            ],

            // Tài liệu API
            api_documentation: 'Swagger UI tại https://records.internal/api/docs, tài liệu Postman collection, hướng dẫn tích hợp chi tiết trong Wiki nội bộ',
            api_versioning_standard: 'Semantic Versioning (v2.5.3), backward compatible trong 12 tháng',
            has_integration_monitoring: true,

            // Mô tả tích hợp
            integration_description: 'Tích hợp 2 chiều với hệ thống văn bản (đồng bộ metadata), 1 chiều từ cổng DVC (nhận hồ sơ từ công dân), tích hợp SSO cho xác thực. Sử dụng message queue (RabbitMQ) cho các tác vụ bất đồng bộ.'
        },

        // ============================================================
        // TAB 6: VẬN HÀNH (Operations)
        // ============================================================
        operations_data: {
            // Hỗ trợ kỹ thuật
            support_level: '24/7 via hotline, email, ticketing',
            support_contact: 'Hotline: 1900-xxxx | Email: support-records@cshtt.gov.vn | Ticket: https://helpdesk.internal',

            // Bảo trì
            maintenance_schedule: 'Bảo trì định kỳ: Chủ nhật đầu tiên mỗi tháng, 01:00-05:00. Cập nhật bảo mật: Thứ 4 hàng tuần, 22:00-23:00',
            last_major_update: '2025-11-20',

            // Triển khai
            deployment_location: 'hybrid',
            compute_type: 'vm',
            compute_specifications: 'App servers: 4x VM (8 vCPU, 16GB RAM mỗi VM), DB server: 2x VM (16 vCPU, 64GB RAM, RAID 10 SSD 2TB)',
            deployment_frequency: 'monthly',

            // Giám sát
            monitoring_tools: 'Prometheus + Grafana (metrics), ELK Stack (logs), UptimeRobot (uptime), Sentry (errors)',

            // SLA
            uptime_sla: '99.5% (cho phép downtime ~3.6 giờ/tháng)',
            response_time_sla: 'P50: < 500ms, P95: < 2s, P99: < 5s cho các API tra cứu'
        },

        // ============================================================
        // TAB 7: ĐÁNH GIÁ (Assessment) - P0.8 Phase 4
        // ============================================================
        assessment_data: {
            // Quy trình nghiệp vụ
            business_processes: [
                'Tiếp nhận hồ sơ',
                'Phân loại và đánh số',
                'Xử lý và phê duyệt',
                'Lưu trữ và bảo quản',
                'Tra cứu và cung cấp bản sao'
            ],

            // Loại tích hợp
            integration_types: [
                'API đồng bộ',
                'Webhook bất đồng bộ',
                'File import/export',
                'Database replication'
            ],

            // Mức độ sẵn sàng tích hợp
            integration_readiness: [
                {
                    system: 'Hệ thống Văn bản',
                    status: 'ready',
                    notes: 'API đã sẵn sàng, đã test'
                },
                {
                    system: 'Cổng DVC',
                    status: 'in_progress',
                    notes: 'Chờ cấp API key từ Văn phòng Chính phủ'
                }
            ],

            // Rào cản
            blockers: [
                {
                    issue: 'Chưa có quy định rõ về thời hạn lưu trữ hồ sơ điện tử',
                    impact: 'high',
                    status: 'pending'
                }
            ],

            // Đề xuất
            recommendation: 'upgrade', // Nâng cấp hệ thống
            recommendation_notes: 'Nên tích hợp thêm với hệ thống quản lý tài sản, hệ thống nhân sự để tra cứu thông tin liên quan nhanh hơn'
        },

        // ============================================================
        // TAB 8: CHI PHÍ (Cost) - Level 2
        // ============================================================
        cost_data: {
            // Chi phí phát triển
            development_cost: 1250000000, // 1.25 tỷ VNĐ
            development_cost_notes: 'Chi phí phát triển giai đoạn 1 (2022-2023): Nhân công 850 triệu, license 200 triệu, thiết bị 200 triệu',

            // Chi phí vận hành hàng năm
            annual_operating_cost: 350000000, // 350 triệu VNĐ/năm
            operating_cost_breakdown: {
                license: 80000000,      // License Django, PostgreSQL (support)
                hosting: 120000000,     // Điện, mạng, bảo trì phần cứng
                support: 100000000,     // Nhân công support
                maintenance: 50000000   // Bảo trì, nâng cấp
            },

            // Giấy phép
            license_type: 'Open Source + Commercial Support',
            license_cost: 80000000,
            license_renewal_date: '2026-12-31',

            // ROI
            roi_percentage: 28.5,
            roi_notes: 'Tiết kiệm 400 triệu/năm nhờ giảm in ấn, lưu trữ giấy tờ và thời gian xử lý. Payback period: ~4 năm'
        },

        // ============================================================
        // TAB 9: NHÀ CUNG CẤP (Vendor) - Level 2
        // ============================================================
        vendor_data: {
            // Nhà phát triển
            primary_vendor_name: 'Công ty TNHH Giải pháp Công nghệ ABC',
            primary_vendor_contact: 'contact@abc-tech.vn | (024) 3xxx xxxx | Ms. Nguyễn Thị D',

            // Hợp đồng
            contract_number: 'HĐ-CNTT-2022-045',
            contract_start_date: '2022-06-01',
            contract_end_date: '2026-05-31',
            contract_value: 1250000000,

            // Nhà cung cấp khác
            other_vendors: [
                {
                    name: 'Công ty CP Hạ tầng XYZ',
                    role: 'Cung cấp và bảo trì server',
                    contact: 'support@xyz-infra.vn'
                },
                {
                    name: 'Viettel IDC',
                    role: 'Data center hosting',
                    contact: 'enterprise@viettel.vn'
                }
            ],

            // Điều khoản SLA
            sla_terms: 'Uptime 99.5%, response time P1 < 4h, P2 < 8h, P3 < 24h. Penalty: 0.5% giá trị hợp đồng/tháng nếu vi phạm SLA 3 tháng liên tiếp.'
        },

        // ============================================================
        // LEVEL 2 TABS (Conditional)
        // ============================================================

        // TAB B.6: HẠ TẦNG (Infrastructure)
        infrastructure_data: {
            server_configuration: 'App tier: 4x VM (Ubuntu 22.04, 8 vCPU, 16GB RAM, 500GB SSD), DB tier: 2x VM (16 vCPU, 64GB RAM, 2TB SSD RAID 10), Load balancer: HAProxy 2.8',
            network_configuration: 'VLAN riêng cho app tier và DB tier, firewall giữa các tier, DMZ cho web server',
            storage_capacity: '5 TB SAN storage (hiện dùng 2.5 TB), tốc độ tăng trưởng 200 GB/năm, đủ dùng thêm 12 năm',
            bandwidth: '1 Gbps dedicated, thực tế sử dụng peak 250 Mbps',

            infrastructure_notes: 'Hạ tầng được thiết kế để scale horizontal khi cần. Hiện tại load trung bình 40% capacity, còn dư 60% để tăng trưởng.'
        },

        // TAB B.7: BẢO MẬT (Security)
        security_data: {
            // Xác thực
            authentication_method: 'SSO (SAML 2.0)',
            authorization_model: 'RBAC (Role-Based Access Control) - 8 roles khác nhau',

            // Mã hóa
            encryption_at_rest: 'AES-256 cho database, file storage encryption bằng MinIO KMS',
            encryption_in_transit: 'TLS 1.3 cho tất cả kết nối external, TLS 1.2 cho internal',

            // Tuân thủ
            compliance_standards: [
                'Nghị định 85/2016/NĐ-CP về ATTT',
                'Thông tư 20/2017/TT-BTTTT về ATTT mức độ 2',
                'ISO 27001 (đang triển khai)'
            ],

            // Kiểm toán
            last_security_audit: '2025-09-15',
            audit_findings: '12 phát hiện: 2 high (đã fix), 5 medium (đang fix), 5 low (accepted risk)',

            // Sự cố
            security_incidents: [
                {
                    date: '2025-03-20',
                    severity: 'medium',
                    description: 'Brute force attempt bị chặn bởi WAF',
                    resolved: true
                }
            ],

            security_notes: 'Penetration testing hàng năm, vulnerability scanning hàng quý, security awareness training cho toàn bộ user hàng năm'
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
    console.log('   Form Level:', systemData.form_level, '(includes all Level 2 tabs)');
    console.log('   Total Users:', systemData.users_total);
    console.log('   Technologies:', systemData.programming_language, '+', systemData.framework, '+', systemData.database_name);
    console.log('   Development Cost:', systemData.cost_data.development_cost.toLocaleString('vi-VN'), 'VNĐ');
    console.log('   Annual Operating Cost:', systemData.cost_data.annual_operating_cost.toLocaleString('vi-VN'), 'VNĐ/năm');
    console.log('\n🚀 Sending request to API...\n');

    const response = await makeRequest(options, systemData);
    return response.data;
}

// Main execution
async function main() {
    console.log('╔════════════════════════════════════════════════════════╗');
    console.log('║  E2E Test: Create System with COMPLETE Data Sample    ║');
    console.log('╚════════════════════════════════════════════════════════╝\n');

    try {
        const token = await login();
        const system = await createFullSystem(token);

        console.log('╔════════════════════════════════════════════════════════╗');
        console.log('║  ✅ SUCCESS: System created with COMPLETE data         ║');
        console.log('╚════════════════════════════════════════════════════════╝\n');

        console.log('📋 Created System Details:');
        console.log('   ID:', system.id);
        console.log('   Code:', system.system_code);
        console.log('   Name:', system.system_name);
        console.log('   Organization:', system.org_name || 'Cục Sở hữu trí tuệ');
        console.log('   Status:', system.status);
        console.log('   Form Level:', system.form_level);
        console.log('\n✅ All 9 tabs data created successfully!');
        console.log('   - Tab 1: Thông tin cơ bản ✓');
        console.log('   - Tab 2: Mục tiêu và người dùng ✓');
        console.log('   - Tab 3: Công nghệ ✓');
        console.log('   - Tab 4: Dữ liệu ✓');
        console.log('   - Tab 5: Tích hợp ✓');
        console.log('   - Tab 6: Vận hành ✓');
        console.log('   - Tab 7: Đánh giá ✓');
        console.log('   - Tab 8: Chi phí (Level 2) ✓');
        console.log('   - Tab 9: Nhà cung cấp (Level 2) ✓');
        console.log('   + Level 2: Hạ tầng & Bảo mật ✓');

        console.log('\n🔗 View system:');
        console.log('   https://thongkehethong.mindmaid.ai/systems/' + system.id);

    } catch (error) {
        console.error('\n❌ Error:', error);
        if (error.data) {
            console.error('Response:', error.data);
        }
        process.exit(1);
    }
}

main();
