// API Response types
export interface ApiResponse<T> {
  count?: number;
  next?: string | null;
  previous?: string | null;
  results?: T[];
  // Single object response
  [key: string]: any;
}

// Auth types
export interface LoginRequest {
  username: string;
  password: string;
}

export interface TokenResponse {
  access: string;
  refresh: string;
  user?: User;
}

export interface User {
  id: number;
  username: string;
  email: string;
  role: 'admin' | 'org_user';
  organization?: number;
  organization_name?: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  is_active?: boolean;
  is_superuser?: boolean;
}

// Organization types
export interface Organization {
  id: number;
  name: string;
  code: string;
  description?: string;
  contact_person?: string;
  contact_email?: string;
  contact_phone?: string;
  system_count?: number;
  created_at: string;
  updated_at?: string;
}

// System types
export interface System {
  id: number;
  system_code: string;
  system_name: string;
  system_name_en?: string;
  org: number;
  org_name?: string;
  purpose?: string;
  status: 'active' | 'inactive' | 'maintenance' | 'planning' | 'draft';
  status_display?: string;
  criticality_level: 'critical' | 'high' | 'medium' | 'low';
  criticality_display?: string;
  form_level: 1 | 2;
  scope?: string;
  target_users?: string[];
  system_group?: string;
  go_live_date?: string;
  current_version?: string;
  upgrade_history?: string[];
  business_owner?: string;
  technical_owner?: string;
  responsible_person?: string;
  responsible_phone?: string;
  responsible_email?: string;
  users_total?: number;
  users_mau?: number;
  users_dau?: number;
  num_organizations?: number;
  created_at: string;
  updated_at: string;
}

// System related models - Level 1
export interface SystemArchitecture {
  architecture_type?: 'monolithic' | 'modular' | 'microservices' | 'other';
  has_architecture_diagram?: boolean;
  architecture_description?: string;
  backend_tech?: string;
  frontend_tech?: string;
  mobile_app?: 'native' | 'hybrid' | 'pwa' | 'none';
  database_type?: string;
  database_model?: 'centralized' | 'distributed' | 'per_app';
  has_data_model_doc?: boolean;
  hosting_type?: string;
  cloud_provider?: string;
}

export interface SystemDataInfo {
  storage_size_gb?: number;
  growth_rate_percent?: number;
  data_types?: string[];
  has_api?: boolean;
  api_endpoints_count?: number;
  shared_with_systems?: string;
  has_data_standard?: boolean;
  has_personal_data?: boolean;
  has_sensitive_data?: boolean;
  data_classification?: 'public' | 'internal' | 'confidential' | 'secret';
}

export interface SystemOperations {
  dev_type?: 'internal' | 'outsource' | 'combined';
  developer?: string;
  dev_team_size?: number;
  warranty_status?: 'active' | 'expired' | 'none';
  warranty_end_date?: string;
  has_maintenance_contract?: boolean;
  maintenance_end_date?: string;
  operator?: string;
  ops_team_size?: number;
  vendor_dependency?: 'high' | 'medium' | 'low' | 'none';
  can_self_maintain?: boolean;
  support_level?: string;
  avg_incident_response_hours?: number;
}

export interface SystemIntegration {
  has_integration?: boolean;
  integration_count?: number;
  integration_types?: string[];
  connected_internal_systems?: string;
  connected_external_systems?: string;
  has_integration_diagram?: boolean;
  integration_description?: string;
  uses_standard_api?: boolean;
  api_standard?: string;
}

export interface SystemAssessment {
  performance_rating?: 1 | 2 | 3 | 4 | 5;
  uptime_percent?: number;
  avg_response_time_ms?: number;
  user_satisfaction_rating?: 1 | 2 | 3 | 4 | 5;
  technical_debt_level?: 'high' | 'medium' | 'low';
  needs_replacement?: boolean;
  replacement_plan?: string;
  major_issues?: string;
  improvement_suggestions?: string;
  future_plans?: string;
  modernization_priority?: 'high' | 'medium' | 'low';
}

// System related models - Level 2
export interface SystemCost {
  initial_investment?: number;
  development_cost?: number;
  annual_license_cost?: number;
  annual_maintenance_cost?: number;
  annual_infrastructure_cost?: number;
  annual_personnel_cost?: number;
  total_cost_of_ownership?: number;
  cost_notes?: string;
  funding_source?: string;
}

export interface SystemVendor {
  vendor_name?: string;
  vendor_type?: 'domestic' | 'foreign' | 'joint_venture';
  vendor_contact_person?: string;
  vendor_phone?: string;
  vendor_email?: string;
  contract_number?: string;
  contract_start_date?: string;
  contract_end_date?: string;
  contract_value?: number;
  vendor_performance_rating?: 1 | 2 | 3 | 4 | 5;
  vendor_responsiveness_rating?: 1 | 2 | 3 | 4 | 5;
  vendor_lock_in_risk?: 'high' | 'medium' | 'low';
  alternative_vendors?: string;
}

export interface SystemInfrastructure {
  num_servers?: number;
  server_specs?: string;
  total_cpu_cores?: number;
  total_ram_gb?: number;
  total_storage_tb?: number;
  bandwidth_mbps?: number;
  has_cdn?: boolean;
  has_load_balancer?: boolean;
  backup_frequency?: string;
  backup_retention_days?: number;
  has_disaster_recovery?: boolean;
  rto_hours?: number;
  rpo_hours?: number;
}

export interface SystemSecurity {
  auth_method?: string;
  has_mfa?: boolean;
  has_rbac?: boolean;
  has_data_encryption_at_rest?: boolean;
  has_data_encryption_in_transit?: boolean;
  has_firewall?: boolean;
  has_waf?: boolean;
  has_ids_ips?: boolean;
  has_antivirus?: boolean;
  last_security_audit_date?: string;
  last_penetration_test_date?: string;
  has_vulnerability_scanning?: boolean;
  compliance_standards?: string[];
  security_incidents_last_year?: number;
  security_notes?: string;
  security_improvements_needed?: string;
}

export interface SystemDetail extends System {
  architecture?: SystemArchitecture;
  data_info?: SystemDataInfo;
  operations?: SystemOperations;
  integration?: SystemIntegration;
  assessment?: SystemAssessment;
  cost?: SystemCost;
  vendor?: SystemVendor;
  infrastructure?: SystemInfrastructure;
  security?: SystemSecurity;
}

// System Create/Update payload
export interface SystemCreatePayload {
  org: number;
  system_code: string;
  system_name: string;
  system_name_en?: string;
  purpose?: string;
  scope?: string;
  target_users?: string[];
  system_group?: string;
  status: string;
  go_live_date?: string;
  current_version?: string;
  business_owner?: string;
  technical_owner?: string;
  responsible_person?: string;
  responsible_phone?: string;
  responsible_email?: string;
  users_total?: number;
  users_mau?: number;
  users_dau?: number;
  criticality_level: string;
  form_level: 1 | 2;
  architecture_data?: SystemArchitecture;
  data_info_data?: SystemDataInfo;
  operations_data?: SystemOperations;
  integration_data?: SystemIntegration;
  assessment_data?: SystemAssessment;
  cost_data?: SystemCost;
  vendor_data?: SystemVendor;
  infrastructure_data?: SystemInfrastructure;
  security_data?: SystemSecurity;
}

// Organization Create payload
export interface OrganizationCreatePayload {
  name: string;
  code?: string;
  description?: string;
  contact_person?: string;
  contact_email?: string;
  contact_phone?: string;
}

// Statistics
export interface SystemStatistics {
  total: number;
  users_total?: number;
  by_status: {
    active: number;
    inactive: number;
    maintenance: number;
    planning: number;
    draft: number;
  };
  by_criticality: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  by_form_level: {
    level_1: number;
    level_2: number;
  };
}
