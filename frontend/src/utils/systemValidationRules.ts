/**
 * System Form Validation Rules
 * Centralized validation schema for SystemCreate and SystemEdit forms
 *
 * Features:
 * - ALL fields required (comprehensive validation)
 * - Vietnamese error messages
 * - Helper functions for batch validation
 * - Updated: 2026-01-23 - Made all fields required per user request
 */

import type { Rule } from 'antd/lib/form';
import type { FormInstance } from 'antd';

// ==================== VALIDATION MESSAGES ====================

export const ValidationMessages = {
  required: 'Vui lòng điền thông tin này',
  requiredSelect: 'Vui lòng chọn một giá trị',
  requiredAtLeastOne: 'Vui lòng chọn ít nhất một mục',
  requiredWhenEnabled: (fieldName: string) => `Vui lòng điền ${fieldName} khi đã bật tính năng này`,
};

// ==================== RULE CREATORS ====================

/**
 * Create a required field rule
 */
export const createRequiredRule = (message?: string): Rule => ({
  required: true,
  message: message || ValidationMessages.required,
});

/**
 * Create a required array rule (at least one item)
 */
export const createRequiredArrayRule = (message?: string): Rule => ({
  required: true,
  type: 'array',
  min: 1,
  message: message || ValidationMessages.requiredAtLeastOne,
});

// ==================== TAB 1: THÔNG TIN CƠ BẢN ====================

export const Tab1ValidationRules = {
  org: [createRequiredRule('Vui lòng chọn tổ chức')],
  system_name: [createRequiredRule('Vui lòng nhập tên hệ thống')],
  system_name_en: [createRequiredRule('Vui lòng nhập tên hệ thống tiếng Anh')],
  purpose: [createRequiredRule('Vui lòng nhập mục đích của hệ thống')],
  status: [createRequiredRule('Vui lòng chọn trạng thái')],
  criticality_level: [createRequiredRule('Vui lòng chọn mức độ quan trọng')],
  scope: [createRequiredRule('Vui lòng chọn phạm vi triển khai')],
  requirement_type: [createRequiredRule('Vui lòng chọn loại nhu cầu')],
  target_completion_date: [createRequiredRule('Vui lòng chọn thời gian mong muốn hoàn thành')],
  system_group: [createRequiredRule('Vui lòng chọn nhóm hệ thống')],
  go_live_date: [createRequiredRule('Vui lòng chọn ngày đưa vào vận hành')],
  current_version: [createRequiredRule('Vui lòng nhập phiên bản hiện tại')],

  // Additional notes
  additional_notes_tab1: [createRequiredRule('Vui lòng nhập ghi chú bổ sung cho tab này')],
};

// ==================== TAB 2: BỐI CẢNH NGHIỆP VỤ ====================

export const Tab2ValidationRules = {
  business_objectives: [createRequiredArrayRule('Vui lòng chọn ít nhất một mục tiêu nghiệp vụ')],
  business_processes: [createRequiredArrayRule('Vui lòng chọn ít nhất một quy trình nghiệp vụ')],
  user_types: [createRequiredArrayRule('Vui lòng chọn ít nhất một loại người dùng')],
  // annual_users: Removed - not required (null=True, blank=True in database)

  // Additional notes
  additional_notes_tab2: [createRequiredRule('Vui lòng nhập ghi chú bổ sung cho tab này')],
};

// ==================== TAB 3: KIẾN TRÚC CÔNG NGHỆ ====================

export const Tab3ValidationRules = {
  // Core technology fields - always required
  programming_language: [createRequiredArrayRule('Vui lòng chọn ít nhất một ngôn ngữ lập trình')],
  framework: [createRequiredArrayRule('Vui lòng chọn ít nhất một framework/thư viện')],
  database_name: [createRequiredRule('Vui lòng nhập tên cơ sở dữ liệu')],
  hosting_platform: [createRequiredRule('Vui lòng nhập nền tảng hosting')],
  architecture_type: [createRequiredRule('Vui lòng chọn loại kiến trúc')],
  architecture_description: [createRequiredRule('Vui lòng mô tả kiến trúc hệ thống')],
  backend_tech: [createRequiredRule('Vui lòng nhập công nghệ backend')],
  frontend_tech: [createRequiredRule('Vui lòng nhập công nghệ frontend')],
  mobile_app: [createRequiredRule('Vui lòng chọn loại ứng dụng mobile')],
  database_type: [createRequiredRule('Vui lòng nhập loại database')],
  database_model: [createRequiredRule('Vui lòng chọn mô hình database')],
  hosting_type: [createRequiredRule('Vui lòng nhập loại hosting')],

  // Infrastructure & architecture fields - converted from conditional to always required
  cloud_provider: [createRequiredRule('Vui lòng nhập nhà cung cấp cloud')],
  containerization: [createRequiredArrayRule('Vui lòng chọn ít nhất một công nghệ containerization')],
  // REMOVED: api_style, messaging_queue, cache_system, search_engine, reporting_bi_tool, source_repository
  // Reason: These fields are commented out in database models (no migrations exist)

  // Boolean switches - now required
  has_cicd: [createRequiredRule('Vui lòng chọn có CI/CD pipeline hay không')],
  has_automated_testing: [createRequiredRule('Vui lòng chọn có automated testing hay không')],
  is_multi_tenant: [createRequiredRule('Vui lòng chọn có hỗ trợ multi-tenant hay không')],
  has_layered_architecture: [createRequiredRule('Vui lòng chọn có kiến trúc phân lớp hay không')],

  // Tool fields - converted from conditional to always required
  cicd_tool: [createRequiredRule('Vui lòng chọn công cụ CI/CD')],
  automated_testing_tools: [createRequiredRule('Vui lòng nhập công cụ automated testing')],
  layered_architecture_details: [createRequiredRule('Vui lòng mô tả chi tiết kiến trúc phân lớp')],

  // Additional notes
  additional_notes_tab3: [createRequiredRule('Vui lòng nhập ghi chú bổ sung cho tab này')],
};

// ==================== TAB 4: KIẾN TRÚC DỮ LIỆU ====================

export const Tab4ValidationRules = {
  // Core data fields - always required
  data_sources: [createRequiredArrayRule('Vui lòng chọn ít nhất một nguồn dữ liệu')],
  data_types: [createRequiredArrayRule('Vui lòng chọn ít nhất một loại dữ liệu')],
  data_classification_type: [createRequiredArrayRule('Vui lòng chọn ít nhất một loại phân loại dữ liệu')],
  data_volume: [createRequiredRule('Vui lòng nhập khối lượng dữ liệu')],
  storage_size_gb: [createRequiredRule('Vui lòng nhập dung lượng CSDL (GB)')],
  file_storage_size_gb: [createRequiredRule('Vui lòng nhập dung lượng file đính kèm (GB)')],
  growth_rate_percent: [createRequiredRule('Vui lòng nhập tốc độ tăng trưởng dữ liệu (%)')],
  // REMOVED: file_storage_type, record_count, secondary_databases, data_retention_policy
  // Reason: These fields are commented out in database models (no migrations exist)

  // Boolean switches - now required
  has_data_catalog: [createRequiredRule('Vui lòng chọn có Data Catalog hay không')],
  has_mdm: [createRequiredRule('Vui lòng chọn có Master Data Management hay không')],

  // Data governance notes - converted from conditional to always required
  data_catalog_notes: [createRequiredRule('Vui lòng nhập ghi chú về Data Catalog')],
  mdm_notes: [createRequiredRule('Vui lòng nhập ghi chú về Master Data Management')],

  // Additional notes
  additional_notes_tab4: [createRequiredRule('Vui lòng nhập ghi chú bổ sung cho tab này')],
};

// ==================== TAB 5: TÍCH HỢP HỆ THỐNG ====================

export const Tab5ValidationRules = {
  // API statistics - always required
  api_provided_count: [createRequiredRule('Vui lòng nhập số API cung cấp')],
  api_consumed_count: [createRequiredRule('Vui lòng nhập số API tiêu thụ')],
  api_standard: [createRequiredArrayRule('Vui lòng chọn ít nhất một chuẩn API')],

  // API Gateway & Management - now required
  has_api_gateway: [createRequiredRule('Vui lòng chọn có API Gateway hay không')],
  api_gateway_name: [createRequiredRule('Vui lòng chọn tên API Gateway')],
  has_api_versioning: [createRequiredRule('Vui lòng chọn có API versioning hay không')],
  has_rate_limiting: [createRequiredRule('Vui lòng chọn có rate limiting hay không')],

  // API Documentation & Monitoring - now required
  api_documentation: [createRequiredRule('Vui lòng nhập tài liệu API')],
  api_versioning_standard: [createRequiredRule('Vui lòng chọn chuẩn phiên bản API')],
  has_integration_monitoring: [createRequiredRule('Vui lòng chọn có giám sát tích hợp hay không')],

  // Integration systems - now required
  integrated_internal_systems: [createRequiredArrayRule('Vui lòng chọn ít nhất một hệ thống nội bộ tích hợp')],
  integrated_external_systems: [createRequiredArrayRule('Vui lòng chọn ít nhất một hệ thống bên ngoài tích hợp')],
  data_exchange_method: [createRequiredArrayRule('Vui lòng chọn ít nhất một phương thức trao đổi dữ liệu')],

  // Additional notes
  additional_notes_tab5: [createRequiredRule('Vui lòng nhập ghi chú bổ sung cho tab này')],
};

// ==================== TAB 6: AN TOÀN THÔNG TIN ====================

export const Tab6ValidationRules = {
  // Core security fields - always required
  authentication_method: [createRequiredArrayRule('Vui lòng chọn ít nhất một phương thức xác thực')],
  has_encryption: [createRequiredRule('Vui lòng chọn có mã hóa dữ liệu hay không')],
  has_audit_log: [createRequiredRule('Vui lòng chọn có log audit trail hay không')],
  security_level: [createRequiredRule('Vui lòng chọn mức độ an toàn thông tin')],

  // Security documentation - now required
  has_security_documents: [createRequiredRule('Vui lòng chọn có tài liệu ATTT hay không')],

  // Additional notes
  additional_notes_tab6: [createRequiredRule('Vui lòng nhập ghi chú bổ sung cho tab này')],
};

// ==================== TAB 7: HẠ TẦNG ====================

export const Tab7ValidationRules = {
  // Core infrastructure fields - always required
  server_configuration: [createRequiredRule('Vui lòng nhập cấu hình server')],
  backup_plan: [createRequiredArrayRule('Vui lòng chọn ít nhất một phương án backup')],
  storage_capacity: [createRequiredRule('Vui lòng nhập dung lượng lưu trữ')],
  disaster_recovery_plan: [createRequiredRule('Vui lòng nhập kế hoạch phục hồi thảm họa')],

  // Deployment & infrastructure details - now required
  deployment_location: [createRequiredRule('Vui lòng chọn vị trí triển khai')],
  compute_specifications: [createRequiredRule('Vui lòng nhập cấu hình tính toán')],
  compute_type: [createRequiredRule('Vui lòng chọn loại hạ tầng tính toán')],
  deployment_frequency: [createRequiredRule('Vui lòng chọn tần suất triển khai')],

  // Additional notes
  additional_notes_tab7: [createRequiredRule('Vui lòng nhập ghi chú bổ sung cho tab này')],
};

// ==================== TAB 8: VẬN HÀNH ====================

export const Tab8ValidationRules = {
  business_owner: [createRequiredRule('Vui lòng nhập người chịu trách nhiệm nghiệp vụ')],
  technical_owner: [createRequiredRule('Vui lòng nhập người chịu trách nhiệm kỹ thuật')],
  responsible_person: [createRequiredRule('Vui lòng nhập người chịu trách nhiệm')],
  responsible_phone: [createRequiredRule('Vui lòng nhập số điện thoại liên hệ')],
  responsible_email: [createRequiredRule('Vui lòng nhập email liên hệ')],
  support_level: [createRequiredRule('Vui lòng chọn mức độ hỗ trợ')],
  // users_total, users_mau, users_dau: Removed - not required (null=True, blank=True in database)
  // These are metrics that may not be available when creating a new system

  // Additional notes
  additional_notes_tab8: [createRequiredRule('Vui lòng nhập ghi chú bổ sung cho tab này')],
};

// ==================== TAB 9: ĐÁNH GIÁ ====================

export const Tab9ValidationRules = {
  performance_rating: [createRequiredRule('Vui lòng chọn đánh giá hiệu năng')],
  user_satisfaction_rating: [createRequiredRule('Vui lòng chọn đánh giá hài lòng người dùng')],
  technical_debt_level: [createRequiredRule('Vui lòng chọn mức độ nợ kỹ thuật')],
  recommendation: [createRequiredRule('Vui lòng chọn đề xuất hành động')],
  integration_readiness: [createRequiredArrayRule('Vui lòng chọn ít nhất một điểm phù hợp cho tích hợp')],
  blockers: [createRequiredArrayRule('Vui lòng chọn ít nhất một điểm vướng mắc')],
  uptime_percent: [createRequiredRule('Vui lòng nhập phần trăm uptime (%)')],
  avg_response_time_ms: [createRequiredRule('Vui lòng nhập thời gian phản hồi trung bình (ms)')],
  replacement_plan: [createRequiredRule('Vui lòng nhập kế hoạch thay thế (nếu không có, nhập "Không có")')],
  major_issues: [createRequiredRule('Vui lòng nhập các vấn đề chính (nếu không có, nhập "Không có")')],
  improvement_suggestions: [createRequiredRule('Vui lòng nhập đề xuất cải tiến')],
  future_plans: [createRequiredRule('Vui lòng nhập kế hoạch tương lai')],
  modernization_priority: [createRequiredRule('Vui lòng chọn mức độ ưu tiên hiện đại hóa')],
};

// ==================== ALL VALIDATION RULES ====================

export const AllValidationRules = {
  ...Tab1ValidationRules,
  ...Tab2ValidationRules,
  ...Tab3ValidationRules,
  ...Tab4ValidationRules,
  ...Tab5ValidationRules,
  ...Tab6ValidationRules,
  ...Tab7ValidationRules,
  ...Tab8ValidationRules,
  ...Tab9ValidationRules,
};

// ==================== TAB FIELD GROUPS ====================

export const TabFieldGroups: Record<string, string[]> = {
  '1': [
    'org', 'system_name', 'system_name_en', 'purpose', 'status',
    'criticality_level', 'scope', 'requirement_type', 'target_completion_date',
    'system_group', 'go_live_date', 'current_version',
    'additional_notes_tab1'
  ],
  '2': [
    'business_objectives', 'business_processes', 'user_types',
    'additional_notes_tab2'
  ],
  '3': [
    // Core technology
    'programming_language', 'framework', 'database_name', 'hosting_platform',
    'architecture_type', 'architecture_description', 'backend_tech', 'frontend_tech',
    'mobile_app', 'database_type', 'database_model', 'hosting_type',
    // Infrastructure & architecture (removed non-existent fields)
    'cloud_provider', 'containerization',
    // Boolean switches
    'has_cicd', 'has_automated_testing', 'is_multi_tenant', 'has_layered_architecture',
    // Tool fields (now always required)
    'cicd_tool', 'automated_testing_tools', 'layered_architecture_details',
    'additional_notes_tab3'
  ],
  '4': [
    // Core data fields (removed non-existent fields)
    'data_sources', 'data_types', 'data_classification_type', 'data_volume',
    'storage_size_gb', 'file_storage_size_gb', 'growth_rate_percent',
    // Data governance
    'has_data_catalog', 'has_mdm', 'data_catalog_notes', 'mdm_notes',
    'additional_notes_tab4'
  ],
  '5': [
    // API statistics
    'api_provided_count', 'api_consumed_count', 'api_standard',
    // API Gateway & Management
    'has_api_gateway', 'api_gateway_name', 'has_api_versioning', 'has_rate_limiting',
    // API Documentation & Monitoring
    'api_documentation', 'api_versioning_standard', 'has_integration_monitoring',
    // Integration systems
    'integrated_internal_systems', 'integrated_external_systems', 'data_exchange_method',
    'additional_notes_tab5'
  ],
  '6': [
    'authentication_method', 'has_encryption', 'has_audit_log', 'security_level',
    'has_security_documents',
    'additional_notes_tab6'
  ],
  '7': [
    // Core infrastructure
    'server_configuration', 'backup_plan', 'storage_capacity', 'disaster_recovery_plan',
    // Deployment & infrastructure details
    'deployment_location', 'compute_specifications', 'compute_type', 'deployment_frequency',
    'additional_notes_tab7'
  ],
  '8': [
    'business_owner', 'technical_owner', 'responsible_person',
    'responsible_phone', 'responsible_email', 'support_level',
    'additional_notes_tab8'
  ],
  '9': [
    'performance_rating', 'user_satisfaction_rating', 'technical_debt_level',
    'recommendation', 'integration_readiness', 'blockers',
    'uptime_percent', 'avg_response_time_ms', 'replacement_plan',
    'major_issues', 'improvement_suggestions', 'future_plans', 'modernization_priority'
  ],
};

// ==================== TAB DISPLAY NAMES ====================

export const TabDisplayNames: Record<string, string> = {
  '1': 'Thông tin cơ bản',
  '2': 'Bối cảnh nghiệp vụ',
  '3': 'Kiến trúc công nghệ',
  '4': 'Kiến trúc dữ liệu',
  '5': 'Tích hợp hệ thống',
  '6': 'An toàn thông tin',
  '7': 'Hạ tầng',
  '8': 'Vận hành',
  '9': 'Đánh giá',
};

// ==================== HELPER FUNCTIONS ====================

/**
 * Get display name for a tab
 */
export const getTabDisplayName = (tabKey: string): string => {
  return TabDisplayNames[tabKey] || `Tab ${tabKey}`;
};

/**
 * Validate a specific tab
 * @param form Ant Design form instance
 * @param tabKey Tab key (1-9)
 * @returns Validation result with error details
 */
export const validateTab = async (
  form: FormInstance,
  tabKey: string
): Promise<{
  isValid: boolean;
  errorFields: string[];
  errorCount: number;
}> => {
  const fieldsToValidate = TabFieldGroups[tabKey] || [];

  if (fieldsToValidate.length === 0) {
    return { isValid: true, errorFields: [], errorCount: 0 };
  }

  // Store form values in window for conditional validators
  const allValues = form.getFieldsValue();
  (window as any).__formValues = allValues;

  try {
    await form.validateFields(fieldsToValidate);
    return { isValid: true, errorFields: [], errorCount: 0 };
  } catch (errorInfo: any) {
    const errorFields = errorInfo.errorFields?.map((ef: any) => ef.name[0]) || [];
    // BUGFIX: If no error fields found, consider it valid
    // This prevents "0 fields missing but can't save" contradiction
    if (errorFields.length === 0) {
      return { isValid: true, errorFields: [], errorCount: 0 };
    }
    return {
      isValid: false,
      errorFields,
      errorCount: errorFields.length,
    };
  }
};

/**
 * Validate all tabs
 * @param form Ant Design form instance
 * @returns Validation result with invalid tabs
 */
export const validateAllTabs = async (
  form: FormInstance
): Promise<{
  isValid: boolean;
  invalidTabs: string[];
  errorCount: number;
  tabErrors: Record<string, string[]>;
}> => {
  const tabKeys = Object.keys(TabFieldGroups);
  const results = await Promise.all(
    tabKeys.map(async (tabKey) => ({
      tabKey,
      result: await validateTab(form, tabKey),
    }))
  );

  const invalidTabs = results
    .filter((r) => !r.result.isValid)
    .map((r) => r.tabKey);

  const totalErrors = results.reduce((sum, r) => sum + r.result.errorCount, 0);

  const tabErrors: Record<string, string[]> = {};
  results.forEach((r) => {
    if (!r.result.isValid) {
      tabErrors[r.tabKey] = r.result.errorFields;
    }
  });

  return {
    isValid: invalidTabs.length === 0,
    invalidTabs,
    errorCount: totalErrors,
    tabErrors,
  };
};

/**
 * Get validation status for all tabs
 * @param form Ant Design form instance
 * @returns Map of tab keys to validation status
 */
export const getTabValidationStatus = async (
  form: FormInstance
): Promise<Record<string, boolean>> => {
  const tabKeys = Object.keys(TabFieldGroups);
  const results = await Promise.all(
    tabKeys.map(async (tabKey) => ({
      tabKey,
      isValid: (await validateTab(form, tabKey)).isValid,
    }))
  );

  const status: Record<string, boolean> = {};
  results.forEach((r) => {
    status[r.tabKey] = r.isValid;
  });

  return status;
};
