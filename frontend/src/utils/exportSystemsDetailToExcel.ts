/**
 * Export Systems Detail to Excel
 * Generates multi-sheet Excel file with all system fields organized by category
 */

import * as XLSX from 'xlsx';
import dayjs from 'dayjs';
import type { SystemDetail } from '../types';

// ===== VIETNAMESE LABELS =====
const STATUS_LABELS: Record<string, string> = {
  operating: 'Đang vận hành',
  pilot: 'Thí điểm',
  stopped: 'Dừng hoạt động',
  replacing: 'Sắp thay thế',
  testing: 'Đang thử nghiệm',
  active: 'Hoạt động',
  inactive: 'Ngưng',
  maintenance: 'Bảo trì',
  planning: 'Lập kế hoạch',
  draft: 'Bản nháp',
};

const CRITICALITY_LABELS: Record<string, string> = {
  high: 'Cực kỳ quan trọng',
  medium: 'Quan trọng',
  low: 'Bình thường',
  critical: 'Nghiêm trọng',
  other: 'Khác',
};

const SCOPE_LABELS: Record<string, string> = {
  internal_unit: 'Nội bộ đơn vị',
  org_wide: 'Toàn tổ chức',
  external: 'Đối ngoại',
  other: 'Khác',
};

const DEV_TYPE_LABELS: Record<string, string> = {
  internal: 'Nội bộ',
  outsource: 'Thuê ngoài',
  combined: 'Kết hợp',
  other: 'Khác',
};

const VENDOR_TYPE_LABELS: Record<string, string> = {
  domestic: 'Trong nước',
  foreign: 'Nước ngoài',
  joint_venture: 'Liên doanh',
};

const WARRANTY_LABELS: Record<string, string> = {
  active: 'Còn bảo hành',
  expired: 'Hết bảo hành',
  none: 'Không có',
  other: 'Khác',
};

const VENDOR_DEPENDENCY_LABELS: Record<string, string> = {
  high: 'Cao',
  medium: 'Trung bình',
  low: 'Thấp',
  none: 'Không phụ thuộc',
  other: 'Khác',
};

const ARCH_TYPE_LABELS: Record<string, string> = {
  monolithic: 'Monolithic',
  modular: 'Modular',
  microservices: 'Microservices',
  other: 'Khác',
};

const MOBILE_APP_LABELS: Record<string, string> = {
  native: 'Native',
  hybrid: 'Hybrid',
  pwa: 'PWA',
  none: 'Không có',
  other: 'Khác',
};

const DB_MODEL_LABELS: Record<string, string> = {
  centralized: 'Tập trung',
  distributed: 'Phân tán',
  per_app: 'Riêng/app',
  other: 'Khác',
};

const DATA_CLASS_LABELS: Record<string, string> = {
  public: 'Công khai',
  internal: 'Nội bộ',
  confidential: 'Bí mật',
  secret: 'Tối mật',
};

const RISK_LABELS: Record<string, string> = {
  high: 'Cao',
  medium: 'Trung bình',
  low: 'Thấp',
};

const RECOMMENDATION_LABELS: Record<string, string> = {
  keep: 'Giữ nguyên',
  upgrade: 'Nâng cấp',
  replace: 'Thay thế',
  merge: 'Sáp nhập',
};

const INTEGRATION_READINESS_LABELS: Record<string, string> = {
  ready: 'Sẵn sàng',
  partial: 'Một phần',
  not_ready: 'Chưa sẵn sàng',
  other: 'Khác',
};

const HOSTING_PLATFORM_LABELS: Record<string, string> = {
  cloud: 'Cloud',
  on_premise: 'On-premise',
  hybrid: 'Hybrid',
  other: 'Khác',
};

const DEPLOYMENT_LOCATION_LABELS: Record<string, string> = {
  datacenter: 'Data Center',
  cloud: 'Cloud',
  hybrid: 'Hybrid',
  other: 'Khác',
};

const COMPUTE_TYPE_LABELS: Record<string, string> = {
  vm: 'Virtual Machine',
  container: 'Container',
  serverless: 'Serverless',
  bare_metal: 'Bare Metal',
  other: 'Khác',
};

const BUSINESS_OBJECTIVES_LABELS: Record<string, string> = {
  digitize_processes: 'Số hóa quy trình',
  integration: 'Tích hợp',
  increase_transparency: 'Tăng minh bạch',
  reduce_processing_time: 'Giảm thời gian xử lý',
  improve_quality: 'Nâng cao chất lượng',
  cost_reduction: 'Giảm chi phí',
  compliance: 'Tuân thủ quy định',
  data_analytics: 'Phân tích dữ liệu',
  customer_experience: 'Trải nghiệm khách hàng',
  automation: 'Tự động hóa',
  other: 'Khác',
};

const TARGET_USERS_LABELS: Record<string, string> = {
  internal_staff: 'Nhân viên nội bộ',
  management: 'Lãnh đạo',
  citizens: 'Công dân',
  businesses: 'Doanh nghiệp',
  partners: 'Đối tác',
  other: 'Khác',
};

// ===== HELPER FUNCTIONS =====
function formatBoolean(value: boolean | undefined | null): string {
  if (value === true) return 'Có';
  if (value === false) return 'Không';
  return '';
}

function formatArray(value: string[] | undefined | null, labelMap?: Record<string, string>): string {
  if (!value || !Array.isArray(value)) return '';
  if (labelMap) {
    return value.map(v => labelMap[v] || v).join(', ');
  }
  return value.join(', ');
}

function formatDate(value: string | undefined | null): string {
  if (!value) return '';
  return dayjs(value).format('DD/MM/YYYY');
}

function formatCurrency(value: number | undefined | null): string {
  if (value === undefined || value === null) return '';
  return new Intl.NumberFormat('vi-VN').format(value);
}

function formatNumber(value: number | undefined | null): string {
  if (value === undefined || value === null) return '';
  return new Intl.NumberFormat('vi-VN').format(value);
}

function formatRating(value: number | undefined | null): string {
  if (!value) return '';
  return `${value}/5`;
}

function getLabel(map: Record<string, string>, value: string | undefined | null): string {
  if (!value) return '';
  return map[value] || value;
}

/**
 * Fix cells that SheetJS incorrectly interpreted as formulas
 * When aoa_to_sheet sees values starting with =, +, -, @ it creates formula cells
 * This function converts them back to text cells
 */
function fixFormulaLikeCells(ws: XLSX.WorkSheet): void {
  const range = XLSX.utils.decode_range(ws['!ref'] || 'A1');

  for (let R = range.s.r; R <= range.e.r; ++R) {
    for (let C = range.s.c; C <= range.e.c; ++C) {
      const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
      const cell = ws[cellAddress];

      if (cell && cell.t === 'f' && cell.f) {
        // This is a formula cell - convert to text
        // The formula text doesn't include the leading '='
        // So we need to reconstruct the original value
        const originalValue = '=' + cell.f;
        cell.t = 's'; // Change type to string
        cell.v = originalValue; // Set value to the original text
        delete cell.f; // Remove formula property
      }

      // Also handle cells that start with +, -, @ which might be interpreted as formulas
      if (cell && cell.t === 's' && typeof cell.v === 'string') {
        const firstChar = cell.v.charAt(0);
        if (firstChar === '+' || firstChar === '-' || firstChar === '@') {
          // Keep as string but ensure it's not interpreted as formula
          // The value is already a string, so no change needed
        }
      }
    }
  }
}

/**
 * Escape special characters that Excel interprets as formulas
 * Note: This prefix doesn't work with aoa_to_sheet, but kept for documentation
 * The actual fix is done by fixFormulaLikeCells after sheet creation
 */
function escapeExcelValue(value: any): any {
  // Note: The ' prefix doesn't work with programmatic Excel writing
  // Values starting with = are already handled by fixFormulaLikeCells
  return value;
}

/**
 * Escape all values in a row
 */
function escapeRow(row: any[]): any[] {
  return row.map(escapeExcelValue);
}

// ===== SHEET GENERATORS =====

/**
 * Sheet 1: Cơ bản (Basic Info)
 */
function generateBasicSheet(systems: SystemDetail[]): any[][] {
  const headers = [
    'STT', 'Mã hệ thống', 'Tên hệ thống', 'Tên tiếng Anh', 'Đơn vị',
    'Nhóm hệ thống', 'Trạng thái', 'Mức độ quan trọng', 'Mức bảo mật',
    'Phạm vi', 'Loại yêu cầu', 'Mục đích', 'Ngày vận hành',
    'Phiên bản', 'Hoàn thành (%)', 'Form Level'
  ];

  const rows = systems.map((sys, idx) => escapeRow([
    idx + 1,
    sys.system_code || '',
    sys.system_name || '',
    sys.system_name_en || '',
    sys.org_name || '',
    sys.system_group || '',
    getLabel(STATUS_LABELS, sys.status),
    getLabel(CRITICALITY_LABELS, sys.criticality_level),
    (sys as any).security_level || '',
    getLabel(SCOPE_LABELS, sys.scope),
    (sys as any).request_type || '',
    sys.purpose || '',
    formatDate(sys.go_live_date),
    sys.current_version || '',
    sys.completion_percentage ? `${sys.completion_percentage.toFixed(1)}%` : '',
    sys.form_level || 1,
  ]));

  return [headers, ...rows];
}

/**
 * Sheet 2: Nghiệp vụ (Business Context)
 */
function generateBusinessSheet(systems: SystemDetail[]): any[][] {
  const headers = [
    'STT', 'Mã hệ thống', 'Tên hệ thống', 'Mục tiêu kinh doanh',
    'Quy trình nghiệp vụ', 'Loại người dùng', 'Số người dùng/năm',
    'Tổng số tài khoản', 'MAU', 'DAU', 'Số đơn vị sử dụng',
    'Số giao dịch/năm', 'Số báo cáo/năm'
  ];

  const rows = systems.map((sys, idx) => escapeRow([
    idx + 1,
    sys.system_code || '',
    sys.system_name || '',
    formatArray((sys as any).business_objectives, BUSINESS_OBJECTIVES_LABELS),
    (sys as any).business_processes || '',
    formatArray(sys.target_users, TARGET_USERS_LABELS),
    formatNumber(sys.users_total),
    formatNumber((sys as any).total_accounts),
    formatNumber(sys.users_mau),
    formatNumber(sys.users_dau),
    formatNumber(sys.num_organizations),
    formatNumber((sys as any).transactions_per_year),
    formatNumber((sys as any).reports_per_year),
  ]));

  return [headers, ...rows];
}

/**
 * Sheet 3: Kiến trúc (Architecture)
 */
function generateArchitectureSheet(systems: SystemDetail[]): any[][] {
  const headers = [
    'STT', 'Mã hệ thống', 'Tên hệ thống', 'Kiểu kiến trúc',
    'Backend Tech', 'Frontend Tech', 'Mobile App', 'Ngôn ngữ lập trình',
    'Framework', 'Database', 'Database khác', 'Database Model',
    'Hosting', 'Cloud Provider', 'Container', 'API Style',
    'Message Queue', 'Cache', 'Search Engine', 'BI/Reporting Tool',
    'Source Repository', 'CI/CD Tool', 'Monitoring Tool', 'Log Management'
  ];

  const rows = systems.map((sys, idx) => {
    const arch = sys.architecture || {};
    return escapeRow([
      idx + 1,
      sys.system_code || '',
      sys.system_name || '',
      getLabel(ARCH_TYPE_LABELS, arch.architecture_type),
      arch.backend_tech || (sys as any).backend_tech || '',
      arch.frontend_tech || (sys as any).frontend_tech || '',
      getLabel(MOBILE_APP_LABELS, arch.mobile_app || (sys as any).mobile_app),
      (sys as any).programming_language || '',
      (sys as any).framework || '',
      arch.database_type || (sys as any).database_name || '',
      (sys as any).secondary_databases || '',
      getLabel(DB_MODEL_LABELS, arch.database_model),
      getLabel(HOSTING_PLATFORM_LABELS, arch.hosting_type || (sys as any).hosting_platform),
      arch.cloud_provider || '',
      (sys as any).containerization || '',
      (sys as any).api_style || '',
      (sys as any).message_queue || '',
      (sys as any).caching_solution || '',
      (sys as any).search_engine || '',
      (sys as any).reporting_bi_tool || '',
      (sys as any).source_code_repository || '',
      (sys as any).cicd_tool || '',
      (sys as any).monitoring_tool || '',
      (sys as any).log_management || '',
    ]);
  });

  return [headers, ...rows];
}

/**
 * Sheet 4: Dữ liệu (Data Info)
 */
function generateDataSheet(systems: SystemDetail[]): any[][] {
  const headers = [
    'STT', 'Mã hệ thống', 'Tên hệ thống', 'Nguồn dữ liệu',
    'Phân loại dữ liệu', 'Khối lượng dữ liệu', 'Storage (GB)',
    'File Storage (GB)', 'Tăng trưởng (%/năm)', 'Loại dữ liệu',
    'Secondary DBs', 'Số bản ghi', 'Có Data Catalog', 'Có MDM',
    'Có dữ liệu cá nhân', 'Có dữ liệu nhạy cảm', 'Có API', 'Số API endpoints'
  ];

  const rows = systems.map((sys, idx) => {
    const data = sys.data_info || {};
    return escapeRow([
      idx + 1,
      sys.system_code || '',
      sys.system_name || '',
      (sys as any).data_source || '',
      getLabel(DATA_CLASS_LABELS, data.data_classification),
      (sys as any).data_volume || '',
      formatNumber(data.storage_size_gb),
      formatNumber((sys as any).file_storage_gb),
      formatNumber(data.growth_rate_percent),
      formatArray(data.data_types),
      (sys as any).secondary_databases || '',
      formatNumber((sys as any).record_count),
      formatBoolean((sys as any).has_data_catalog),
      formatBoolean((sys as any).has_mdm),
      formatBoolean(data.has_personal_data),
      formatBoolean(data.has_sensitive_data),
      formatBoolean(data.has_api),
      formatNumber(data.api_endpoints_count),
    ]);
  });

  return [headers, ...rows];
}

/**
 * Sheet 5: Tích hợp (Integration)
 */
function generateIntegrationSheet(systems: SystemDetail[]): any[][] {
  const headers = [
    'STT', 'Mã hệ thống', 'Tên hệ thống', 'HT nội bộ tích hợp',
    'HT bên ngoài tích hợp', 'Phương thức trao đổi', 'Số API cung cấp',
    'Số API sử dụng', 'Có tích hợp', 'Số kết nối', 'Loại tích hợp',
    'API Standard', 'API Gateway', 'Rate Limiting', 'Tài liệu API',
    'ESB/Integration Platform', 'Data Exchange Method', 'Data Exchange Format'
  ];

  const rows = systems.map((sys, idx) => {
    const intg = sys.integration || {};
    return escapeRow([
      idx + 1,
      sys.system_code || '',
      sys.system_name || '',
      intg.connected_internal_systems || (sys as any).internal_systems_connected || '',
      intg.connected_external_systems || (sys as any).external_systems_connected || '',
      (sys as any).data_exchange_method || '',
      formatNumber((sys as any).api_provided_count),
      formatNumber((sys as any).api_consumed_count),
      formatBoolean(intg.has_integration),
      formatNumber(intg.integration_count),
      formatArray(intg.integration_types),
      intg.api_standard || (sys as any).api_standard || '',
      (sys as any).api_gateway || '',
      formatBoolean((sys as any).has_rate_limiting),
      formatBoolean((sys as any).has_api_documentation),
      (sys as any).esb_integration_platform || '',
      (sys as any).data_exchange_method || '',
      (sys as any).data_exchange_format || '',
    ]);
  });

  return [headers, ...rows];
}

/**
 * Sheet 6: Bảo mật (Security)
 */
function generateSecuritySheet(systems: SystemDetail[]): any[][] {
  const headers = [
    'STT', 'Mã hệ thống', 'Tên hệ thống', 'Phương thức xác thực',
    'Có MFA', 'Có RBAC', 'Có mã hóa at rest', 'Có mã hóa in transit',
    'Có Audit Log', 'Tiêu chuẩn tuân thủ'
  ];

  const rows = systems.map((sys, idx) => {
    const sec = sys.security || {};
    return escapeRow([
      idx + 1,
      sys.system_code || '',
      sys.system_name || '',
      sec.auth_method || (sys as any).authentication_method || '',
      formatBoolean(sec.has_mfa || (sys as any).has_mfa),
      formatBoolean(sec.has_rbac || (sys as any).has_rbac),
      formatBoolean(sec.has_data_encryption_at_rest),
      formatBoolean(sec.has_data_encryption_in_transit),
      formatBoolean((sys as any).has_audit_log),
      formatArray(sec.compliance_standards),
    ]);
  });

  return [headers, ...rows];
}

/**
 * Sheet 7: Hạ tầng (Infrastructure)
 */
function generateInfrastructureSheet(systems: SystemDetail[]): any[][] {
  const headers = [
    'STT', 'Mã hệ thống', 'Tên hệ thống', 'Hosting Platform',
    'Vị trí triển khai', 'Loại compute', 'Server Location', 'Số server', 'CPU cores',
    'RAM (GB)', 'Storage (TB)', 'Bandwidth (Mbps)', 'Có CDN', 'Có Load Balancer'
  ];

  const rows = systems.map((sys, idx) => {
    const infra = sys.infrastructure || {};
    const ops = sys.operations || {};
    return escapeRow([
      idx + 1,
      sys.system_code || '',
      sys.system_name || '',
      getLabel(HOSTING_PLATFORM_LABELS, (sys as any).hosting_platform),
      getLabel(DEPLOYMENT_LOCATION_LABELS, (ops as any).deployment_location || (sys as any).deployment_location),
      getLabel(COMPUTE_TYPE_LABELS, (ops as any).compute_type || (sys as any).compute_type),
      (sys as any).server_location || '',
      formatNumber(infra.num_servers),
      formatNumber(infra.total_cpu_cores),
      formatNumber(infra.total_ram_gb),
      formatNumber(infra.total_storage_tb),
      formatNumber(infra.bandwidth_mbps),
      formatBoolean(infra.has_cdn),
      formatBoolean(infra.has_load_balancer),
    ]);
  });

  return [headers, ...rows];
}

/**
 * Sheet 8: Vận hành (Operations)
 */
function generateOperationsSheet(systems: SystemDetail[]): any[][] {
  const headers = [
    'STT', 'Mã hệ thống', 'Tên hệ thống', 'Chủ sở hữu nghiệp vụ',
    'Chủ sở hữu kỹ thuật', 'Người phụ trách', 'SĐT phụ trách',
    'Email phụ trách', 'Loại phát triển', 'Đơn vị phát triển',
    'Quy mô team dev', 'Đơn vị vận hành', 'Quy mô team ops',
    'Tình trạng bảo hành', 'Hết bảo hành', 'Có HĐ bảo trì',
    'Hết bảo trì', 'Phụ thuộc vendor', 'Tự bảo trì', 'SLA'
  ];

  const rows = systems.map((sys, idx) => {
    const ops = sys.operations || {};
    return escapeRow([
      idx + 1,
      sys.system_code || '',
      sys.system_name || '',
      sys.business_owner || '',
      sys.technical_owner || '',
      sys.responsible_person || '',
      sys.responsible_phone || '',
      sys.responsible_email || '',
      getLabel(DEV_TYPE_LABELS, ops.dev_type || (sys as any).development_type),
      ops.developer || (sys as any).developer_name || '',
      formatNumber(ops.dev_team_size),
      ops.operator || (sys as any).operator_name || '',
      formatNumber(ops.ops_team_size),
      getLabel(WARRANTY_LABELS, ops.warranty_status),
      formatDate(ops.warranty_end_date),
      formatBoolean(ops.has_maintenance_contract),
      formatDate(ops.maintenance_end_date),
      getLabel(VENDOR_DEPENDENCY_LABELS, ops.vendor_dependency),
      formatBoolean(ops.can_self_maintain),
      (sys as any).sla || '',
    ]);
  });

  return [headers, ...rows];
}

/**
 * Sheet 9: Đánh giá (Assessment)
 */
function generateAssessmentSheet(systems: SystemDetail[]): any[][] {
  const headers = [
    'STT', 'Mã hệ thống', 'Tên hệ thống', 'Sẵn sàng tích hợp',
    'Vấn đề/Blockers', 'Khuyến nghị'
  ];

  const rows = systems.map((sys, idx) => {
    const assess = sys.assessment || {};
    return escapeRow([
      idx + 1,
      sys.system_code || '',
      sys.system_name || '',
      getLabel(INTEGRATION_READINESS_LABELS, (sys as any).integration_readiness || (assess as any).integration_readiness),
      (assess as any).blockers || (sys as any).blockers || '',
      getLabel(RECOMMENDATION_LABELS, (assess as any).recommendation || (sys as any).recommendation),
    ]);
  });

  return [headers, ...rows];
}

/**
 * Sheet 10: Chi phí L2 (Cost - Level 2 only)
 */
function generateCostSheet(systems: SystemDetail[]): any[][] {
  const headers = [
    'STT', 'Mã hệ thống', 'Tên hệ thống', 'Đầu tư ban đầu',
    'Chi phí phát triển', 'License/năm', 'Bảo trì/năm',
    'Hạ tầng/năm', 'Nhân sự/năm', 'TCO', 'Nguồn tài trợ', 'Ghi chú'
  ];

  const rows = systems
    .filter(sys => sys.form_level === 2)
    .map((sys, idx) => {
      const cost = sys.cost || {};
      return escapeRow([
        idx + 1,
        sys.system_code || '',
        sys.system_name || '',
        formatCurrency(cost.initial_investment),
        formatCurrency(cost.development_cost),
        formatCurrency(cost.annual_license_cost),
        formatCurrency(cost.annual_maintenance_cost),
        formatCurrency(cost.annual_infrastructure_cost),
        formatCurrency(cost.annual_personnel_cost),
        formatCurrency(cost.total_cost_of_ownership),
        cost.funding_source || '',
        cost.cost_notes || '',
      ]);
    });

  return [headers, ...rows];
}

/**
 * Sheet 11: Nhà cung cấp L2 (Vendor - Level 2 only)
 */
function generateVendorSheet(systems: SystemDetail[]): any[][] {
  const headers = [
    'STT', 'Mã hệ thống', 'Tên hệ thống', 'Tên NCC', 'Loại NCC',
    'Người liên hệ', 'SĐT', 'Email', 'Số hợp đồng',
    'Bắt đầu HĐ', 'Kết thúc HĐ', 'Đánh giá NCC', 'Rủi ro vendor lock-in'
  ];

  const rows = systems
    .filter(sys => sys.form_level === 2)
    .map((sys, idx) => {
      const vendor = sys.vendor || {};
      return escapeRow([
        idx + 1,
        sys.system_code || '',
        sys.system_name || '',
        vendor.vendor_name || '',
        getLabel(VENDOR_TYPE_LABELS, vendor.vendor_type),
        vendor.vendor_contact_person || '',
        vendor.vendor_phone || '',
        vendor.vendor_email || '',
        vendor.contract_number || '',
        formatDate(vendor.contract_start_date),
        formatDate(vendor.contract_end_date),
        formatRating(vendor.vendor_performance_rating),
        getLabel(RISK_LABELS, vendor.vendor_lock_in_risk),
      ]);
    });

  return [headers, ...rows];
}

/**
 * Sheet 12: Hạ tầng chi tiết L2 (Infrastructure Detail - Level 2 only)
 */
function generateInfrastructureDetailSheet(systems: SystemDetail[]): any[][] {
  const headers = [
    'STT', 'Mã hệ thống', 'Tên hệ thống', 'Số server', 'Specs server',
    'Tổng CPU cores', 'Tổng RAM (GB)', 'Tổng Storage (TB)',
    'Bandwidth (Mbps)', 'Có CDN', 'Có Load Balancer',
    'Tần suất backup', 'Retention days', 'Có DR', 'RTO (hours)', 'RPO (hours)'
  ];

  const rows = systems
    .filter(sys => sys.form_level === 2)
    .map((sys, idx) => {
      const infra = sys.infrastructure || {};
      return escapeRow([
        idx + 1,
        sys.system_code || '',
        sys.system_name || '',
        formatNumber(infra.num_servers),
        infra.server_specs || '',
        formatNumber(infra.total_cpu_cores),
        formatNumber(infra.total_ram_gb),
        formatNumber(infra.total_storage_tb),
        formatNumber(infra.bandwidth_mbps),
        formatBoolean(infra.has_cdn),
        formatBoolean(infra.has_load_balancer),
        infra.backup_frequency || '',
        formatNumber(infra.backup_retention_days),
        formatBoolean(infra.has_disaster_recovery),
        formatNumber(infra.rto_hours),
        formatNumber(infra.rpo_hours),
      ]);
    });

  return [headers, ...rows];
}

/**
 * Sheet 13: Bảo mật chi tiết L2 (Security Detail - Level 2 only)
 */
function generateSecurityDetailSheet(systems: SystemDetail[]): any[][] {
  const headers = [
    'STT', 'Mã hệ thống', 'Tên hệ thống', 'Phương thức xác thực',
    'Có MFA', 'Có RBAC', 'Mã hóa at rest', 'Mã hóa in transit',
    'Có Firewall', 'Có WAF', 'Có IDS/IPS', 'Có Antivirus',
    'Ngày audit cuối', 'Ngày pentest cuối', 'Có quét lỗ hổng',
    'Số sự cố/năm', 'Ghi chú bảo mật'
  ];

  const rows = systems
    .filter(sys => sys.form_level === 2)
    .map((sys, idx) => {
      const sec = sys.security || {};
      return escapeRow([
        idx + 1,
        sys.system_code || '',
        sys.system_name || '',
        sec.auth_method || '',
        formatBoolean(sec.has_mfa),
        formatBoolean(sec.has_rbac),
        formatBoolean(sec.has_data_encryption_at_rest),
        formatBoolean(sec.has_data_encryption_in_transit),
        formatBoolean(sec.has_firewall),
        formatBoolean(sec.has_waf),
        formatBoolean(sec.has_ids_ips),
        formatBoolean(sec.has_antivirus),
        formatDate(sec.last_security_audit_date),
        formatDate(sec.last_penetration_test_date),
        formatBoolean(sec.has_vulnerability_scanning),
        formatNumber(sec.security_incidents_last_year),
        sec.security_notes || '',
      ]);
    });

  return [headers, ...rows];
}

// ===== STYLING FUNCTIONS =====

function setColumnWidths(ws: XLSX.WorkSheet, widths: number[]): void {
  ws['!cols'] = widths.map(w => ({ wch: w }));
}

// ===== MAIN EXPORT FUNCTION =====

export async function exportSystemsDetailToExcel(systems: SystemDetail[]): Promise<void> {
  try {
    // Create workbook
    const wb = XLSX.utils.book_new();

    // Sheet 1: Cơ bản
    const sheet1 = XLSX.utils.aoa_to_sheet(generateBasicSheet(systems));
    fixFormulaLikeCells(sheet1);
    setColumnWidths(sheet1, [5, 15, 35, 35, 25, 15, 15, 18, 12, 15, 15, 40, 12, 10, 12, 8]);
    XLSX.utils.book_append_sheet(wb, sheet1, '1. Cơ bản');

    // Sheet 2: Nghiệp vụ
    const sheet2 = XLSX.utils.aoa_to_sheet(generateBusinessSheet(systems));
    fixFormulaLikeCells(sheet2);
    setColumnWidths(sheet2, [5, 15, 30, 40, 40, 25, 15, 15, 12, 12, 15, 15, 15]);
    XLSX.utils.book_append_sheet(wb, sheet2, '2. Nghiệp vụ');

    // Sheet 3: Kiến trúc
    const sheet3 = XLSX.utils.aoa_to_sheet(generateArchitectureSheet(systems));
    fixFormulaLikeCells(sheet3);
    setColumnWidths(sheet3, [5, 15, 30, 15, 20, 20, 12, 20, 20, 20, 20, 15, 15, 15, 12, 12, 15, 12, 15, 18, 18, 15, 15, 15]);
    XLSX.utils.book_append_sheet(wb, sheet3, '3. Kiến trúc');

    // Sheet 4: Dữ liệu
    const sheet4 = XLSX.utils.aoa_to_sheet(generateDataSheet(systems));
    fixFormulaLikeCells(sheet4);
    setColumnWidths(sheet4, [5, 15, 30, 30, 20, 15, 12, 15, 15, 25, 25, 15, 12, 12, 15, 15, 10, 12]);
    XLSX.utils.book_append_sheet(wb, sheet4, '4. Dữ liệu');

    // Sheet 5: Tích hợp
    const sheet5 = XLSX.utils.aoa_to_sheet(generateIntegrationSheet(systems));
    fixFormulaLikeCells(sheet5);
    setColumnWidths(sheet5, [5, 15, 30, 35, 35, 20, 12, 12, 10, 12, 25, 15, 15, 12, 12, 20, 18, 18]);
    XLSX.utils.book_append_sheet(wb, sheet5, '5. Tích hợp');

    // Sheet 6: Bảo mật
    const sheet6 = XLSX.utils.aoa_to_sheet(generateSecuritySheet(systems));
    fixFormulaLikeCells(sheet6);
    setColumnWidths(sheet6, [5, 15, 30, 20, 10, 10, 15, 15, 12, 30]);
    XLSX.utils.book_append_sheet(wb, sheet6, '6. Bảo mật');

    // Sheet 7: Hạ tầng
    const sheet7 = XLSX.utils.aoa_to_sheet(generateInfrastructureSheet(systems));
    fixFormulaLikeCells(sheet7);
    setColumnWidths(sheet7, [5, 15, 30, 18, 15, 15, 18, 10, 10, 10, 12, 12, 10, 12]);
    XLSX.utils.book_append_sheet(wb, sheet7, '7. Hạ tầng');

    // Sheet 8: Vận hành
    const sheet8 = XLSX.utils.aoa_to_sheet(generateOperationsSheet(systems));
    fixFormulaLikeCells(sheet8);
    setColumnWidths(sheet8, [5, 15, 30, 22, 22, 22, 15, 25, 15, 22, 12, 22, 12, 15, 12, 12, 12, 15, 10, 15]);
    XLSX.utils.book_append_sheet(wb, sheet8, '8. Vận hành');

    // Sheet 9: Đánh giá
    const sheet9 = XLSX.utils.aoa_to_sheet(generateAssessmentSheet(systems));
    fixFormulaLikeCells(sheet9);
    setColumnWidths(sheet9, [5, 15, 30, 18, 40, 15]);
    XLSX.utils.book_append_sheet(wb, sheet9, '9. Đánh giá');

    // Level 2 sheets (only if there are L2 systems)
    const hasLevel2 = systems.some(s => s.form_level === 2);

    if (hasLevel2) {
      // Sheet 10: Chi phí L2
      const sheet10 = XLSX.utils.aoa_to_sheet(generateCostSheet(systems));
      fixFormulaLikeCells(sheet10);
      setColumnWidths(sheet10, [5, 15, 30, 18, 18, 15, 15, 15, 15, 18, 22, 30]);
      XLSX.utils.book_append_sheet(wb, sheet10, '10. Chi phí L2');

      // Sheet 11: Nhà cung cấp L2
      const sheet11 = XLSX.utils.aoa_to_sheet(generateVendorSheet(systems));
      fixFormulaLikeCells(sheet11);
      setColumnWidths(sheet11, [5, 15, 30, 25, 15, 22, 15, 25, 18, 12, 12, 12, 15]);
      XLSX.utils.book_append_sheet(wb, sheet11, '11. NCC L2');

      // Sheet 12: Hạ tầng chi tiết L2
      const sheet12 = XLSX.utils.aoa_to_sheet(generateInfrastructureDetailSheet(systems));
      fixFormulaLikeCells(sheet12);
      setColumnWidths(sheet12, [5, 15, 30, 10, 30, 12, 12, 15, 12, 10, 12, 15, 12, 10, 12, 12]);
      XLSX.utils.book_append_sheet(wb, sheet12, '12. Hạ tầng L2');

      // Sheet 13: Bảo mật chi tiết L2
      const sheet13 = XLSX.utils.aoa_to_sheet(generateSecurityDetailSheet(systems));
      fixFormulaLikeCells(sheet13);
      setColumnWidths(sheet13, [5, 15, 30, 20, 10, 10, 12, 12, 10, 10, 10, 12, 12, 12, 12, 12, 35]);
      XLSX.utils.book_append_sheet(wb, sheet13, '13. Bảo mật L2');
    }

    // Generate file name
    const fileName = `Danh-sach-He-thong-${dayjs().format('YYYY-MM-DD')}.xlsx`;

    // Write file
    XLSX.writeFile(wb, fileName);
  } catch (error) {
    console.error('Error exporting systems to Excel:', error);
    throw error;
  }
}
