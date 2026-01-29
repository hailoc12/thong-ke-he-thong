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

// VENDOR_TYPE_LABELS - Reserved for future use

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

// Mobile App: Changed to show "Có/Không có" instead of specific type

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

// RISK_LABELS - Reserved for future use

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
/**
 * Format boolean value to Vietnamese Yes/No
 * - true → "Có"
 * - false → "Không"
 * - undefined/null → "Không" (since model defaults are false)
 *
 * Note: If you want to distinguish "not set" from "false", use formatBooleanAllowEmpty()
 */
function formatBoolean(value: boolean | undefined | null): string {
  if (value === true) return 'Có';
  // For false, undefined, null - return "Không"
  // This is because model defaults are typically false
  return 'Không';
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

// formatCurrency - Reserved for future use

function formatNumber(value: number | undefined | null): string {
  if (value === undefined || value === null) return '';
  return new Intl.NumberFormat('vi-VN').format(value);
}

// formatRating - Reserved for future use

function getLabel(map: Record<string, string>, value: string | undefined | null): string {
  if (!value) return '';
  return map[value] || value;
}

/**
 * Fix cells that SheetJS incorrectly interpreted as formulas
 * When aoa_to_sheet sees values starting with =, +, -, @ it creates formula cells
 * This function removes the formula and converts to plain text
 *
 * Important: SheetJS may create cells with type 'str' but still have a formula property (cell.f)
 * So we check for presence of cell.f, not just cell.t === 'f'
 */
function fixFormulaLikeCells(ws: XLSX.WorkSheet): void {
  const range = XLSX.utils.decode_range(ws['!ref'] || 'A1');

  for (let R = range.s.r; R <= range.e.r; ++R) {
    for (let C = range.s.c; C <= range.e.c; ++C) {
      const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
      const cell = ws[cellAddress];

      // Check if cell has a formula property (regardless of cell type)
      // SheetJS may use type 'str' for formula-like strings but still have cell.f
      if (cell && cell.f !== undefined) {
        // This cell has a formula - reconstruct the original text value
        // cell.f contains the formula text without the leading '='
        // cell.v may contain the cached result
        const formulaText = '=' + cell.f;
        const cachedValue = cell.v;

        // Combine formula and cached value if both exist (e.g., "=statistics, monitoring")
        let textValue: string;
        if (cachedValue !== undefined && cachedValue !== null && cachedValue !== '') {
          textValue = formulaText + ', ' + cachedValue;
        } else {
          textValue = formulaText;
        }

        // Convert to pure text cell by setting type to string and removing formula
        // No prefix needed - just ensuring it's treated as text
        cell.t = 's'; // Force type to string
        cell.v = textValue; // Set the text value
        cell.w = textValue; // Also set the formatted text
        delete cell.f; // Remove formula property completely
      }

      // For string cells starting with formula characters, no prefix needed
      // Just ensure they're marked as string type (t='s') which they already are
      // Excel won't re-interpret them when opening from xlsx format
    }
  }
}

/**
 * Escape special characters that Excel interprets as formulas
 * Also converts arrays to comma-separated strings to prevent SheetJS issues
 */
function escapeExcelValue(value: any): any {
  // Handle arrays - convert to comma-separated string
  if (Array.isArray(value)) {
    return value.join(', ');
  }

  // Handle strings
  if (typeof value === 'string' && value.length > 0) {
    // Don't escape - just return the string as-is
    // fixFormulaLikeCells will handle formula-like cells after sheet creation
    return value;
  }

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
 * Sheet 0: Full (All Fields)
 * Contains all fields from all sections in a single sheet
 * Row 1: Tab/Section info (để dễ nhận biết field thuộc tab nào)
 * Row 2: Column headers
 * Row 3+: Data
 */
function generateFullSheet(systems: SystemDetail[]): any[][] {
  // Define section info with column counts
  // Tab names match frontend SystemCreate.tsx tabs
  const sections = [
    { name: 'Cơ bản', count: 16 },       // Tab 1 (removed: Form Level)
    { name: 'Nghiệp vụ', count: 8 },     // Tab 2 (removed: transactions_per_year, reports_per_year)
    { name: 'Công nghệ', count: 21 },    // Tab 3 (removed: monitoring_tool, log_management)
    { name: 'Dữ liệu', count: 18 },      // Tab 4
    { name: 'Tích hợp', count: 13 },     // Tab 5 (removed: esb_integration_platform, data_exchange_format)
    { name: 'Bảo mật', count: 18 },      // Tab 6
    { name: 'Hạ tầng', count: 19 },      // Tab 7 (removed: server_location)
    { name: 'Vận hành', count: 17 },     // Tab 8 (removed: sla)
    { name: 'Đánh giá', count: 14 },     // Tab 9
    { name: 'Khác', count: 24 },         // Chi phí (9) + Nhà cung cấp (13) + Metadata (2)
  ];

  // Generate tab info row - each column shows which tab it belongs to
  const tabInfoRow: string[] = [];
  for (const section of sections) {
    for (let i = 0; i < section.count; i++) {
      tabInfoRow.push(section.name);
    }
  }

  const headers = [
    // Basic Info (16 cols) - removed: Form Level
    'STT', 'Mã hệ thống', 'Tên hệ thống', 'Tên tiếng Anh', 'Đơn vị',
    'Nhóm hệ thống', 'Trạng thái', 'Mức độ quan trọng', 'Mức bảo mật',
    'Phạm vi', 'Loại yêu cầu', 'Mục đích', 'Đã đưa vào sử dụng', 'Ngày vận hành',
    'Phiên bản', 'Hoàn thành (%)',
    // Business (8 cols) - removed: transactions_per_year, reports_per_year (not in model)
    'Mục tiêu kinh doanh', 'Quy trình nghiệp vụ', 'Loại người dùng',
    'Số người dùng/năm', 'Tổng số tài khoản', 'MAU', 'DAU',
    'Số đơn vị sử dụng',
    // Architecture (21 cols) - removed: monitoring_tool, log_management (not in model)
    'Kiểu kiến trúc', 'Mô tả kiến trúc phân tầng', 'Backend Tech', 'Frontend Tech', 'Mobile App',
    'Ngôn ngữ lập trình', 'Framework', 'Database', 'Database khác',
    'Database Model', 'Hosting', 'Cloud Provider', 'Container',
    'API Style', 'Message Queue', 'Cache', 'Search Engine',
    'BI/Reporting Tool', 'Source Repository', 'CI/CD Tool',
    'Công cụ test tự động',
    // Data (18 cols)
    'Nguồn dữ liệu', 'Phân loại dữ liệu', 'Khối lượng dữ liệu',
    'Storage (GB)', 'File Storage (GB)', 'Loại lưu trữ file', 'Tăng trưởng (%/năm)',
    'Loại dữ liệu', 'Secondary DBs', 'Số bản ghi',
    'Có Data Catalog', 'Ghi chú Data Catalog', 'Có MDM', 'Ghi chú MDM', 'Có dữ liệu cá nhân',
    'Có dữ liệu nhạy cảm', 'Có API', 'Số API endpoints',
    // Integration (13 cols) - removed: esb_integration_platform, data_exchange_format (not in model)
    'HT nội bộ tích hợp', 'HT bên ngoài tích hợp', 'Phương thức trao đổi',
    'Số API cung cấp', 'Số API sử dụng', 'Có tích hợp', 'Số kết nối',
    'Loại tích hợp', 'API Standard', 'API Gateway', 'Rate Limiting',
    'Tài liệu API', 'Data Exchange Method',
    // Security (18 cols)
    'Phương thức xác thực', 'Có mã hóa', 'Mức bảo mật (Security)', 'Có MFA', 'Có RBAC', 'Có mã hóa at rest',
    'Có mã hóa in transit', 'Có Audit Log', 'Tiêu chuẩn tuân thủ',
    'Có Firewall', 'Có WAF', 'Có IDS/IPS', 'Có Antivirus',
    'Ngày audit bảo mật gần nhất', 'Ngày pen test gần nhất',
    'Có quét lỗ hổng', 'Số sự cố bảo mật năm qua', 'Ghi chú bảo mật',
    // Infrastructure (19 cols) - removed: server_location (not in model)
    'Hosting Platform', 'Vị trí triển khai', 'Loại compute',
    'Cấu hình server', 'Số server', 'CPU cores', 'RAM (GB)',
    'Storage (TB)', 'Dung lượng lưu trữ', 'Bandwidth (Mbps)', 'Có CDN', 'Có Load Balancer',
    'Kế hoạch backup', 'Tần suất backup', 'Số ngày lưu backup', 'Kế hoạch DR', 'Có DR', 'RTO (giờ)', 'RPO (giờ)',
    // Operations (17 cols) - removed: sla (not in model)
    'Chủ sở hữu nghiệp vụ', 'Chủ sở hữu kỹ thuật', 'Người phụ trách',
    'SĐT phụ trách', 'Email phụ trách', 'Mức hỗ trợ', 'Loại phát triển',
    'Đơn vị phát triển', 'Quy mô team dev', 'Đơn vị vận hành',
    'Quy mô team ops', 'Tình trạng bảo hành', 'Hết bảo hành',
    'Có HĐ bảo trì', 'Hết bảo trì', 'Phụ thuộc vendor', 'Tự bảo trì',
    // Assessment (14 cols)
    'Sẵn sàng tích hợp', 'Vấn đề/Blockers', 'Khuyến nghị',
    'Điểm hiệu năng', 'Uptime (%)', 'Thời gian phản hồi (ms)',
    'Điểm hài lòng người dùng', 'Mức nợ kỹ thuật', 'Cần thay thế',
    'Kế hoạch thay thế', 'Vấn đề chính', 'Đề xuất cải tiến',
    'Kế hoạch tương lai', 'Ưu tiên hiện đại hóa',
    // Cost (9 cols)
    'Chi phí đầu tư ban đầu', 'Chi phí phát triển', 'Phí license/năm',
    'Phí bảo trì/năm', 'Phí hạ tầng/năm', 'Phí nhân sự/năm',
    'Tổng TCO', 'Ghi chú chi phí', 'Nguồn tài trợ',
    // Vendor (13 cols)
    'Tên nhà cung cấp', 'Loại nhà cung cấp', 'Liên hệ NCC',
    'SĐT NCC', 'Email NCC', 'Số hợp đồng', 'Ngày bắt đầu HĐ',
    'Ngày kết thúc HĐ', 'Giá trị hợp đồng', 'Điểm hiệu suất NCC',
    'Điểm phản hồi NCC', 'Rủi ro vendor lock-in', 'NCC thay thế',
    // Metadata (2 cols)
    'Ngày tạo', 'Ngày cập nhật',
  ];

  const rows = systems.map((sys, idx) => {
    const arch = sys.architecture || {};
    const data = sys.data_info || {};
    const ops = sys.operations || {};
    const intg = sys.integration || {};
    const sec = sys.security || {};
    const infra = sys.infrastructure || {};
    const assess = sys.assessment || {};
    const cost = sys.cost || {};
    const vendor = sys.vendor || {};

    return escapeRow([
      // Basic Info
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
      (sys as any).requirement_type || '',  // Fixed: was request_type
      sys.purpose || '',
      // is_go_live: null/undefined defaults to true (matches frontend behavior and model default)
      (sys as any).is_go_live === false ? 'Không' : 'Có',
      formatDate(sys.go_live_date),
      sys.current_version || '',
      sys.completion_percentage ? `${sys.completion_percentage.toFixed(1)}%` : '',
      // Business (removed: transactions_per_year, reports_per_year - not in model)
      formatArray((sys as any).business_objectives, BUSINESS_OBJECTIVES_LABELS),
      (sys as any).business_processes || '',
      formatArray(sys.target_users, TARGET_USERS_LABELS),
      formatNumber(sys.users_total),
      formatNumber((sys as any).total_accounts),
      formatNumber(sys.users_mau),
      formatNumber(sys.users_dau),
      formatNumber(sys.num_organizations),
      // Architecture
      formatArray((arch as any).architecture_type) || getLabel(ARCH_TYPE_LABELS, arch.architecture_type),  // CommaSeparatedListField
      arch.layered_architecture_details || (sys as any).layered_architecture_details || '',
      formatArray((arch as any).backend_tech) || '',  // CommaSeparatedListField returns array
      formatArray((arch as any).frontend_tech) || '',  // CommaSeparatedListField returns array
      // Mobile App: show "Có" if has value and not 'none', "Không có" otherwise
      (arch.mobile_app && arch.mobile_app !== 'none') || ((sys as any).mobile_app && (sys as any).mobile_app !== 'none')
        ? 'Có' : 'Không có',
      formatArray((sys as any).programming_language),  // CommaSeparatedListField returns array
      formatArray((sys as any).framework),  // CommaSeparatedListField returns array
      arch.database_type || (sys as any).database_name || '',
      formatArray((data as any).secondary_databases),  // JSONField returns array
      getLabel(DB_MODEL_LABELS, arch.database_model),
      getLabel(HOSTING_PLATFORM_LABELS, arch.hosting_type || (sys as any).hosting_platform),
      arch.cloud_provider || '',
      formatArray((arch as any).containerization),  // CommaSeparatedListField returns array
      formatArray((arch as any).api_style),  // CommaSeparatedListField returns array
      formatArray((arch as any).messaging_queue),  // CommaSeparatedListField returns array
      (arch as any).cache_system || '',  // FlexibleChoiceField returns string
      (arch as any).search_engine || '',  // FlexibleChoiceField returns string
      (arch as any).reporting_bi_tool || '',  // FlexibleChoiceField returns string
      (arch as any).source_repository || '',  // FlexibleChoiceField returns string
      (arch as any).cicd_tool || '',
      // Removed: monitoring_tool, log_management (not in model)
      formatArray((arch as any).automated_testing_tools) || '',  // May be array
      // Data
      formatArray((sys as any).data_sources),  // Fixed: was data_source (singular), data_sources is JSONField
      getLabel(DATA_CLASS_LABELS, data.data_classification),
      (sys as any).data_volume || '',
      formatNumber(data.storage_size_gb),
      formatNumber((data as any).file_storage_size_gb),  // Fixed: was file_storage_gb on sys
      (data as any).file_storage_type || (sys as any).file_storage_type || '',
      formatNumber(data.growth_rate_percent),
      formatArray(data.data_types),
      formatArray((data as any).secondary_databases),  // Fixed: is in data_info model as JSONField
      formatNumber((data as any).record_count),  // Fixed: record_count is in data_info model
      formatBoolean((sys as any).has_data_catalog),
      (sys as any).data_catalog_notes || '',
      formatBoolean((sys as any).has_mdm),
      (sys as any).mdm_notes || '',
      formatBoolean(data.has_personal_data),
      formatBoolean(data.has_sensitive_data),
      formatBoolean(data.has_api),
      formatNumber(data.api_endpoints_count),
      // Integration
      intg.connected_internal_systems || (sys as any).internal_systems_connected || '',
      intg.connected_external_systems || (sys as any).external_systems_connected || '',
      (sys as any).data_exchange_method || '',
      formatNumber((sys as any).api_provided_count),
      formatNumber((sys as any).api_consumed_count),
      formatBoolean(intg.has_integration),
      formatNumber(intg.integration_count),
      formatArray(intg.integration_types),
      intg.api_standard || (sys as any).api_standard || '',
      (intg as any).api_gateway_name || '',  // Fixed: was api_gateway on sys, field is api_gateway_name in integration
      formatBoolean((intg as any).has_rate_limiting),  // Fixed: field is in integration model
      (intg as any).api_documentation ? 'Có' : 'Không',  // Fixed: api_documentation is TEXT, not boolean has_api_documentation
      // Removed: esb_integration_platform, data_exchange_format (not in model)
      (sys as any).data_exchange_method || '',
      // Security
      sec.auth_method || (sys as any).authentication_method || '',
      formatBoolean((sys as any).has_encryption),
      (sys as any).security_level || '',
      formatBoolean(sec.has_mfa || (sys as any).has_mfa),
      formatBoolean(sec.has_rbac || (sys as any).has_rbac),
      formatBoolean(sec.has_data_encryption_at_rest),
      formatBoolean(sec.has_data_encryption_in_transit),
      formatBoolean((sys as any).has_audit_log),
      formatArray(sec.compliance_standards),
      formatBoolean(sec.has_firewall),
      formatBoolean(sec.has_waf),
      formatBoolean(sec.has_ids_ips),
      formatBoolean(sec.has_antivirus),
      formatDate(sec.last_security_audit_date),
      formatDate(sec.last_penetration_test_date),
      formatBoolean(sec.has_vulnerability_scanning),
      formatNumber(sec.security_incidents_last_year),
      sec.security_notes || '',
      // Infrastructure
      getLabel(HOSTING_PLATFORM_LABELS, (sys as any).hosting_platform),
      getLabel(DEPLOYMENT_LOCATION_LABELS, (ops as any).deployment_location || (sys as any).deployment_location),
      getLabel(COMPUTE_TYPE_LABELS, (ops as any).compute_type || (sys as any).compute_type),
      (sys as any).server_configuration || '',
      // Removed: server_location (not in model)
      formatNumber(infra.num_servers),
      formatNumber(infra.total_cpu_cores),
      formatNumber(infra.total_ram_gb),
      formatNumber(infra.total_storage_tb),
      (sys as any).storage_capacity || '',
      formatNumber(infra.bandwidth_mbps),
      formatBoolean(infra.has_cdn),
      formatBoolean(infra.has_load_balancer),
      (sys as any).backup_plan || '',
      infra.backup_frequency || '',
      formatNumber(infra.backup_retention_days),
      (sys as any).disaster_recovery_plan || '',
      formatBoolean(infra.has_disaster_recovery),
      formatNumber(infra.rto_hours),
      formatNumber(infra.rpo_hours),
      // Operations
      sys.business_owner || '',
      sys.technical_owner || '',
      sys.responsible_person || '',
      sys.responsible_phone || '',
      sys.responsible_email || '',
      ops.support_level || (sys as any).support_level || '',
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
      // Removed: sla (not in model)
      // Assessment
      getLabel(INTEGRATION_READINESS_LABELS, (sys as any).integration_readiness || (assess as any).integration_readiness),
      (assess as any).blockers || (sys as any).blockers || '',
      getLabel(RECOMMENDATION_LABELS, (assess as any).recommendation || (sys as any).recommendation),
      formatNumber(assess.performance_rating),
      formatNumber(assess.uptime_percent),
      formatNumber(assess.avg_response_time_ms),
      formatNumber(assess.user_satisfaction_rating),
      assess.technical_debt_level || '',
      formatBoolean(assess.needs_replacement),
      assess.replacement_plan || '',
      assess.major_issues || '',
      assess.improvement_suggestions || '',
      assess.future_plans || '',
      assess.modernization_priority || '',
      // Cost
      formatNumber(cost.initial_investment),
      formatNumber(cost.development_cost),
      formatNumber(cost.annual_license_cost),
      formatNumber(cost.annual_maintenance_cost),
      formatNumber(cost.annual_infrastructure_cost),
      formatNumber(cost.annual_personnel_cost),
      formatNumber(cost.total_cost_of_ownership),
      cost.cost_notes || '',
      cost.funding_source || '',
      // Vendor
      vendor.vendor_name || '',
      vendor.vendor_type || '',
      vendor.vendor_contact_person || '',
      vendor.vendor_phone || '',
      vendor.vendor_email || '',
      vendor.contract_number || '',
      formatDate(vendor.contract_start_date),
      formatDate(vendor.contract_end_date),
      formatNumber(vendor.contract_value),
      formatNumber(vendor.vendor_performance_rating),
      formatNumber(vendor.vendor_responsiveness_rating),
      vendor.vendor_lock_in_risk || '',
      vendor.alternative_vendors || '',
      // Metadata
      formatDate(sys.created_at),
      formatDate(sys.updated_at),
    ]);
  });

  // Return with tab info row first, then headers, then data
  return [tabInfoRow, headers, ...rows];
}

/**
 * Sheet 1: Cơ bản (Basic Info)
 */
function generateBasicSheet(systems: SystemDetail[]): any[][] {
  // Removed: Form Level
  const headers = [
    'STT', 'Mã hệ thống', 'Tên hệ thống', 'Tên tiếng Anh', 'Đơn vị',
    'Nhóm hệ thống', 'Trạng thái', 'Mức độ quan trọng', 'Mức bảo mật',
    'Phạm vi', 'Loại yêu cầu', 'Mục đích', 'Đã đưa vào sử dụng', 'Ngày vận hành',
    'Phiên bản', 'Hoàn thành (%)'
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
    (sys as any).requirement_type || '',  // Fixed: was request_type
    sys.purpose || '',
    // is_go_live: null/undefined defaults to true (matches frontend behavior and model default)
    (sys as any).is_go_live === false ? 'Không' : 'Có',
    formatDate(sys.go_live_date),
    sys.current_version || '',
    sys.completion_percentage ? `${sys.completion_percentage.toFixed(1)}%` : '',
  ]));

  return [headers, ...rows];
}

/**
 * Sheet 2: Nghiệp vụ (Business Context)
 */
function generateBusinessSheet(systems: SystemDetail[]): any[][] {
  // Removed: transactions_per_year, reports_per_year (not in model)
  const headers = [
    'STT', 'Mã hệ thống', 'Tên hệ thống', 'Mục tiêu kinh doanh',
    'Quy trình nghiệp vụ', 'Loại người dùng', 'Số người dùng/năm',
    'Tổng số tài khoản', 'MAU', 'DAU', 'Số đơn vị sử dụng'
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
  ]));

  return [headers, ...rows];
}

/**
 * Sheet 3: Công nghệ (Technology/Architecture)
 * Note: Frontend tab name is "Công nghệ", not "Kiến trúc"
 */
function generateArchitectureSheet(systems: SystemDetail[]): any[][] {
  // Removed: monitoring_tool, log_management (not in model)
  const headers = [
    'STT', 'Mã hệ thống', 'Tên hệ thống', 'Kiểu kiến trúc',
    'Backend Tech', 'Frontend Tech', 'Mobile App', 'Ngôn ngữ lập trình',
    'Framework', 'Database', 'Database khác', 'Database Model',
    'Hosting', 'Cloud Provider', 'Container', 'API Style',
    'Message Queue', 'Cache', 'Search Engine', 'BI/Reporting Tool',
    'Source Repository', 'CI/CD Tool'
  ];

  const rows = systems.map((sys, idx) => {
    const arch = sys.architecture || {};
    const data = sys.data_info || {};  // Needed for secondary_databases
    return escapeRow([
      idx + 1,
      sys.system_code || '',
      sys.system_name || '',
      formatArray((arch as any).architecture_type) || getLabel(ARCH_TYPE_LABELS, arch.architecture_type),  // CommaSeparatedListField
      formatArray((arch as any).backend_tech) || '',  // CommaSeparatedListField returns array
      formatArray((arch as any).frontend_tech) || '',  // CommaSeparatedListField returns array
      // Mobile App: show "Có" if has value and not 'none', "Không có" otherwise
      (arch.mobile_app && arch.mobile_app !== 'none') || ((sys as any).mobile_app && (sys as any).mobile_app !== 'none')
        ? 'Có' : 'Không có',
      formatArray((sys as any).programming_language),  // CommaSeparatedListField returns array
      formatArray((sys as any).framework),  // CommaSeparatedListField returns array
      arch.database_type || (sys as any).database_name || '',
      formatArray((data as any).secondary_databases),  // JSONField returns array
      getLabel(DB_MODEL_LABELS, arch.database_model),
      getLabel(HOSTING_PLATFORM_LABELS, arch.hosting_type || (sys as any).hosting_platform),
      arch.cloud_provider || '',
      formatArray((arch as any).containerization),  // CommaSeparatedListField returns array
      formatArray((arch as any).api_style),  // CommaSeparatedListField returns array
      formatArray((arch as any).messaging_queue),  // CommaSeparatedListField returns array
      (arch as any).cache_system || '',  // FlexibleChoiceField returns string
      (arch as any).search_engine || '',  // FlexibleChoiceField returns string
      (arch as any).reporting_bi_tool || '',  // FlexibleChoiceField returns string
      (arch as any).source_repository || '',  // FlexibleChoiceField returns string
      (arch as any).cicd_tool || '',
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
      formatArray((sys as any).data_sources),  // Fixed: was data_source (singular), data_sources is JSONField
      getLabel(DATA_CLASS_LABELS, data.data_classification),
      (sys as any).data_volume || '',
      formatNumber(data.storage_size_gb),
      formatNumber((data as any).file_storage_size_gb),  // Fixed: was file_storage_gb on sys
      formatNumber(data.growth_rate_percent),
      formatArray(data.data_types),
      formatArray((data as any).secondary_databases),  // Fixed: is in data_info model as JSONField
      formatNumber((data as any).record_count),  // Fixed: record_count is in data_info model
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
  // Removed: esb_integration_platform, data_exchange_format (not in model)
  const headers = [
    'STT', 'Mã hệ thống', 'Tên hệ thống', 'HT nội bộ tích hợp',
    'HT bên ngoài tích hợp', 'Phương thức trao đổi', 'Số API cung cấp',
    'Số API sử dụng', 'Có tích hợp', 'Số kết nối', 'Loại tích hợp',
    'API Standard', 'API Gateway', 'Rate Limiting', 'Tài liệu API',
    'Data Exchange Method'
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
      (intg as any).api_gateway_name || '',  // Fixed: was api_gateway on sys, field is api_gateway_name in integration
      formatBoolean((intg as any).has_rate_limiting),  // Fixed: field is in integration model
      (intg as any).api_documentation ? 'Có' : 'Không',  // Fixed: api_documentation is TEXT, not boolean has_api_documentation
      (sys as any).data_exchange_method || '',
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
  // Removed: server_location (not in model)
  const headers = [
    'STT', 'Mã hệ thống', 'Tên hệ thống', 'Hosting Platform',
    'Vị trí triển khai', 'Loại compute', 'Số server', 'CPU cores',
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
  // Removed: sla (not in model)
  const headers = [
    'STT', 'Mã hệ thống', 'Tên hệ thống', 'Chủ sở hữu nghiệp vụ',
    'Chủ sở hữu kỹ thuật', 'Người phụ trách', 'SĐT phụ trách',
    'Email phụ trách', 'Loại phát triển', 'Đơn vị phát triển',
    'Quy mô team dev', 'Đơn vị vận hành', 'Quy mô team ops',
    'Tình trạng bảo hành', 'Hết bảo hành', 'Có HĐ bảo trì',
    'Hết bảo trì', 'Phụ thuộc vendor', 'Tự bảo trì'
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

// ===== STYLING FUNCTIONS =====

function setColumnWidths(ws: XLSX.WorkSheet, widths: number[]): void {
  ws['!cols'] = widths.map(w => ({ wch: w }));
}

// ===== MAIN EXPORT FUNCTION =====

export async function exportSystemsDetailToExcel(systems: SystemDetail[]): Promise<void> {
  try {
    // Create workbook
    const wb = XLSX.utils.book_new();

    // Sheet 0: Full (ALL fields) - Added as first sheet
    const sheetFull = XLSX.utils.aoa_to_sheet(generateFullSheet(systems));
    fixFormulaLikeCells(sheetFull);
    // Set column widths for Full sheet (approximate widths for each section)
    const fullColumnWidths = [
      // Basic Info (17 cols) - added is_go_live
      5, 15, 35, 35, 25, 15, 15, 18, 12, 15, 15, 40, 10, 12, 10, 12, 8,
      // Business (10 cols)
      30, 30, 25, 12, 12, 10, 10, 12, 12, 12,
      // Architecture (22 cols) - added layered_architecture_details, automated_testing_tools
      15, 30, 20, 20, 12, 15, 15, 15, 15, 12, 15, 15, 12, 12, 12, 12, 12, 15, 15, 12, 12, 20,
      // Data (18 cols) - added file_storage_type, data_catalog_notes, mdm_notes
      20, 15, 15, 10, 12, 15, 12, 20, 15, 12, 10, 25, 10, 25, 12, 12, 8, 10,
      // Integration (15 cols)
      25, 25, 15, 10, 10, 10, 10, 20, 12, 12, 10, 10, 18, 15, 12,
      // Security (18 cols) - added has_encryption, security_level
      18, 10, 15, 8, 8, 12, 12, 10, 25, 8, 8, 10, 10, 15, 15, 10, 10, 25,
      // Infrastructure (20 cols) - added server_configuration, storage_capacity, backup_plan, disaster_recovery_plan
      15, 15, 12, 25, 15, 8, 8, 8, 10, 18, 12, 8, 12, 25, 15, 12, 25, 8, 8, 8,
      // Operations (18 cols) - added support_level
      20, 20, 18, 15, 22, 15, 12, 20, 10, 18, 10, 15, 12, 10, 12, 12, 10, 12,
      // Assessment (14 cols)
      15, 30, 12, 10, 10, 15, 12, 15, 10, 25, 30, 30, 30, 15,
      // Cost (9 cols)
      18, 15, 12, 12, 12, 12, 12, 30, 15,
      // Vendor (13 cols)
      20, 15, 18, 15, 22, 15, 12, 12, 15, 10, 10, 15, 25,
      // Metadata (2 cols)
      12, 12,
    ];
    setColumnWidths(sheetFull, fullColumnWidths);
    XLSX.utils.book_append_sheet(wb, sheetFull, 'Full');

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

    // Sheet 3: Công nghệ
    const sheet3 = XLSX.utils.aoa_to_sheet(generateArchitectureSheet(systems));
    fixFormulaLikeCells(sheet3);
    setColumnWidths(sheet3, [5, 15, 30, 15, 20, 20, 12, 20, 20, 20, 20, 15, 15, 15, 12, 12, 15, 12, 15, 18, 18, 15, 15, 15]);
    XLSX.utils.book_append_sheet(wb, sheet3, '3. Công nghệ');

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

    // Generate file name
    const fileName = `Danh-sach-He-thong-${dayjs().format('YYYY-MM-DD')}.xlsx`;

    // Write file
    XLSX.writeFile(wb, fileName);
  } catch (error) {
    console.error('Error exporting systems to Excel:', error);
    throw error;
  }
}
