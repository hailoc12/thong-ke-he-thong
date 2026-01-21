/**
 * System Form Validation Rules
 * Centralized validation schema for SystemCreate and SystemEdit forms
 *
 * Features:
 * - 72 required field validations across 9 tabs
 * - 6 conditional validations based on field dependencies
 * - Vietnamese error messages
 * - Helper functions for batch validation
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
  system_group: [createRequiredRule('Vui lòng chọn nhóm hệ thống')],
  go_live_date: [createRequiredRule('Vui lòng chọn ngày đưa vào vận hành')],
  current_version: [createRequiredRule('Vui lòng nhập phiên bản hiện tại')],
};

// ==================== TAB 2: BỐI CẢNH NGHIỆP VỤ ====================

export const Tab2ValidationRules = {
  business_objectives: [createRequiredArrayRule('Vui lòng chọn ít nhất một mục tiêu nghiệp vụ')],
  business_processes: [createRequiredArrayRule('Vui lòng chọn ít nhất một quy trình nghiệp vụ')],
  user_types: [createRequiredArrayRule('Vui lòng chọn ít nhất một loại người dùng')],
  annual_users: [createRequiredRule('Vui lòng nhập số người dùng hàng năm')],
};

// ==================== TAB 3: KIẾN TRÚC CÔNG NGHỆ ====================

export const Tab3ValidationRules = {
  // Always required
  programming_language: [createRequiredRule('Vui lòng chọn ngôn ngữ lập trình')],
  framework: [createRequiredRule('Vui lòng nhập framework/thư viện')],
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

  // Conditional: required when hosting_type = 'cloud'
  cloud_provider: [
    {
      validator: async (_: any, value: any) => {
        const formValues = (window as any).__formValues || {};
        if (formValues.hosting_type === 'cloud') {
          if (!value || value.trim() === '') {
            return Promise.reject(new Error('Vui lòng nhập nhà cung cấp cloud khi chọn hosting type là Cloud'));
          }
        }
        return Promise.resolve();
      },
    },
  ],

  // Conditional: required when has_cicd = true
  cicd_tool: [
    {
      validator: async (_: any, value: any) => {
        const formValues = (window as any).__formValues || {};
        if (formValues.has_cicd === true) {
          if (!value || value.trim() === '') {
            return Promise.reject(new Error('Vui lòng chọn công cụ CI/CD khi đã chọn "CI/CD Pipeline"'));
          }
        }
        return Promise.resolve();
      },
    },
  ],

  // Conditional: required when has_automated_testing = true
  automated_testing_tools: [
    {
      validator: async (_: any, value: any) => {
        const formValues = (window as any).__formValues || {};
        if (formValues.has_automated_testing === true) {
          if (!value || value.trim() === '') {
            return Promise.reject(new Error('Vui lòng nhập công cụ automated testing khi đã chọn tính năng này'));
          }
        }
        return Promise.resolve();
      },
    },
  ],

  // Conditional: required when has_layered_architecture = true
  layered_architecture_details: [
    {
      validator: async (_: any, value: any) => {
        const formValues = (window as any).__formValues || {};
        if (formValues.has_layered_architecture === true) {
          if (!value || value.trim() === '') {
            return Promise.reject(new Error('Vui lòng mô tả chi tiết kiến trúc phân lớp'));
          }
        }
        return Promise.resolve();
      },
    },
  ],
};

// ==================== TAB 4: KIẾN TRÚC DỮ LIỆU ====================

export const Tab4ValidationRules = {
  // Always required
  data_sources: [createRequiredArrayRule('Vui lòng chọn ít nhất một nguồn dữ liệu')],
  data_types: [createRequiredArrayRule('Vui lòng chọn ít nhất một loại dữ liệu')],
  data_classification_type: [createRequiredArrayRule('Vui lòng chọn ít nhất một loại phân loại dữ liệu')],
  data_volume: [createRequiredRule('Vui lòng nhập khối lượng dữ liệu')],
  storage_size_gb: [createRequiredRule('Vui lòng nhập dung lượng CSDL (GB)')],
  file_storage_size_gb: [createRequiredRule('Vui lòng nhập dung lượng file đính kèm (GB)')],
  growth_rate_percent: [createRequiredRule('Vui lòng nhập tốc độ tăng trưởng dữ liệu (%)')],
  file_storage_type: [createRequiredArrayRule('Vui lòng chọn ít nhất một loại lưu trữ file')],
  record_count: [createRequiredRule('Vui lòng nhập số bản ghi')],
  secondary_databases: [createRequiredArrayRule('Vui lòng nhập CSDL phụ/khác (nếu không có, nhập "Không có")')],
  data_retention_policy: [createRequiredRule('Vui lòng nhập chính sách lưu trữ dữ liệu')],

  // Conditional: required when has_data_catalog = true
  data_catalog_notes: [
    {
      validator: async (_: any, value: any) => {
        const formValues = (window as any).__formValues || {};
        if (formValues.has_data_catalog === true) {
          if (!value || value.trim() === '') {
            return Promise.reject(new Error('Vui lòng nhập ghi chú về Data Catalog'));
          }
        }
        return Promise.resolve();
      },
    },
  ],

  // Conditional: required when has_mdm = true
  mdm_notes: [
    {
      validator: async (_: any, value: any) => {
        const formValues = (window as any).__formValues || {};
        if (formValues.has_mdm === true) {
          if (!value || value.trim() === '') {
            return Promise.reject(new Error('Vui lòng nhập ghi chú về Master Data Management'));
          }
        }
        return Promise.resolve();
      },
    },
  ],
};

// ==================== TAB 5: TÍCH HỢP HỆ THỐNG ====================

export const Tab5ValidationRules = {
  data_exchange_method: [createRequiredRule('Vui lòng nhập phương thức trao đổi dữ liệu')],
  api_provided_count: [createRequiredRule('Vui lòng nhập số API cung cấp')],
};

// ==================== TAB 6: AN TOÀN THÔNG TIN ====================

export const Tab6ValidationRules = {
  authentication_method: [createRequiredArrayRule('Vui lòng chọn ít nhất một phương thức xác thực')],
  has_encryption: [createRequiredRule('Vui lòng chọn có mã hóa dữ liệu hay không')],
  has_audit_log: [createRequiredRule('Vui lòng chọn có log audit trail hay không')],
  security_level: [createRequiredRule('Vui lòng chọn mức độ an toàn thông tin')],
};

// ==================== TAB 7: HẠ TẦNG ====================

export const Tab7ValidationRules = {
  server_configuration: [createRequiredRule('Vui lòng nhập cấu hình server')],
  backup_plan: [createRequiredRule('Vui lòng nhập kế hoạch backup')],
  storage_capacity: [createRequiredRule('Vui lòng nhập dung lượng lưu trữ')],
  disaster_recovery_plan: [createRequiredRule('Vui lòng nhập kế hoạch phục hồi thảm họa')],
};

// ==================== TAB 8: VẬN HÀNH ====================

export const Tab8ValidationRules = {
  business_owner: [createRequiredRule('Vui lòng nhập người chịu trách nhiệm nghiệp vụ')],
  technical_owner: [createRequiredRule('Vui lòng nhập người chịu trách nhiệm kỹ thuật')],
  responsible_person: [createRequiredRule('Vui lòng nhập người chịu trách nhiệm')],
  responsible_phone: [createRequiredRule('Vui lòng nhập số điện thoại liên hệ')],
  responsible_email: [createRequiredRule('Vui lòng nhập email liên hệ')],
  support_level: [createRequiredRule('Vui lòng chọn mức độ hỗ trợ')],
  users_total: [createRequiredRule('Vui lòng nhập tổng số người dùng')],
  users_mau: [createRequiredRule('Vui lòng nhập số người dùng hoạt động hàng tháng (MAU)')],
  users_dau: [createRequiredRule('Vui lòng nhập số người dùng hoạt động hàng ngày (DAU)')],
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
  '1': ['org', 'system_name', 'system_name_en', 'purpose', 'status', 'criticality_level', 'scope', 'system_group', 'go_live_date', 'current_version'],
  '2': ['business_objectives', 'business_processes', 'user_types', 'annual_users'],
  '3': ['programming_language', 'framework', 'database_name', 'hosting_platform', 'architecture_type', 'architecture_description', 'backend_tech', 'frontend_tech', 'mobile_app', 'database_type', 'database_model', 'hosting_type', 'cloud_provider', 'cicd_tool', 'automated_testing_tools', 'layered_architecture_details'],
  '4': ['data_sources', 'data_types', 'data_classification_type', 'data_volume', 'storage_size_gb', 'file_storage_size_gb', 'growth_rate_percent', 'file_storage_type', 'record_count', 'secondary_databases', 'data_retention_policy', 'data_catalog_notes', 'mdm_notes'],
  '5': ['data_exchange_method', 'api_provided_count'],
  '6': ['authentication_method', 'has_encryption', 'has_audit_log', 'security_level'],
  '7': ['server_configuration', 'backup_plan', 'storage_capacity', 'disaster_recovery_plan'],
  '8': ['business_owner', 'technical_owner', 'responsible_person', 'responsible_phone', 'responsible_email', 'support_level', 'users_total', 'users_mau', 'users_dau'],
  '9': ['performance_rating', 'user_satisfaction_rating', 'technical_debt_level', 'recommendation', 'integration_readiness', 'blockers', 'uptime_percent', 'avg_response_time_ms', 'replacement_plan', 'major_issues', 'improvement_suggestions', 'future_plans', 'modernization_priority'],
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
