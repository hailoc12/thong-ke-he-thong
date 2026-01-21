/**
 * System Form Validation Rules
 * Centralized validation schema for SystemCreate and SystemEdit forms
 *
 * Features:
 * - 25 required field validations across 9 tabs
 * - Conditional validation based on field dependencies
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
  purpose: [createRequiredRule('Vui lòng nhập mục đích của hệ thống')],
  status: [createRequiredRule('Vui lòng chọn trạng thái')],
  criticality_level: [createRequiredRule('Vui lòng chọn mức độ quan trọng')],
  scope: [createRequiredRule('Vui lòng chọn phạm vi triển khai')],
  system_group: [createRequiredRule('Vui lòng chọn nhóm hệ thống')],
};

// ==================== TAB 2: BỐI CẢNH NGHIỆP VỤ ====================

export const Tab2ValidationRules = {
  business_objectives: [createRequiredArrayRule('Vui lòng chọn ít nhất một mục tiêu nghiệp vụ')],
  business_processes: [createRequiredArrayRule('Vui lòng chọn ít nhất một quy trình nghiệp vụ')],
  user_types: [createRequiredArrayRule('Vui lòng chọn ít nhất một loại người dùng')],
};

// ==================== TAB 3: KIẾN TRÚC CÔNG NGHỆ ====================

export const Tab3ValidationRules = {
  // Always required
  programming_language: [createRequiredRule('Vui lòng chọn ngôn ngữ lập trình')],
  framework: [createRequiredRule('Vui lòng nhập framework/thư viện')],
  database_name: [createRequiredRule('Vui lòng nhập tên cơ sở dữ liệu')],
  hosting_platform: [createRequiredRule('Vui lòng nhập nền tảng hosting')],

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
// No always-required fields

export const Tab5ValidationRules = {};

// ==================== TAB 6: AN TOÀN THÔNG TIN ====================

export const Tab6ValidationRules = {
  authentication_method: [createRequiredArrayRule('Vui lòng chọn ít nhất một phương thức xác thực')],
};

// ==================== TAB 7: HẠ TẦNG ====================
// No required fields

export const Tab7ValidationRules = {};

// ==================== TAB 8: VẬN HÀNH ====================

export const Tab8ValidationRules = {
  business_owner: [createRequiredRule('Vui lòng nhập người chịu trách nhiệm nghiệp vụ')],
  technical_owner: [createRequiredRule('Vui lòng nhập người chịu trách nhiệm kỹ thuật')],
};

// ==================== TAB 9: ĐÁNH GIÁ ====================
// No required fields

export const Tab9ValidationRules = {};

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
  '1': ['org', 'system_name', 'purpose', 'status', 'criticality_level', 'scope', 'system_group'],
  '2': ['business_objectives', 'business_processes', 'user_types'],
  '3': ['programming_language', 'framework', 'database_name', 'hosting_platform', 'cicd_tool', 'automated_testing_tools', 'layered_architecture_details'],
  '4': ['data_sources', 'data_types', 'data_classification_type', 'data_catalog_notes', 'mdm_notes'],
  '5': [], // No required fields
  '6': ['authentication_method'],
  '7': [], // No required fields
  '8': ['business_owner', 'technical_owner'],
  '9': [], // No required fields
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
