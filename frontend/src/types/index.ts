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
}

export interface User {
  id: number;
  username: string;
  email: string;
  is_superuser: boolean;
  organization?: number;
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

// System related models
export interface SystemArchitecture {
  architecture_type?: string;
  backend_tech?: string;
  frontend_tech?: string;
  database_type?: string;
  mobile_platform?: string;
  deployment_model?: string;
  hosting_location?: string;
  notes?: string;
}

export interface SystemDataInfo {
  data_volume?: string;
  data_types?: string[];
  data_sharing?: string;
  api_count?: number;
  api_types?: string[];
  external_connections?: string[];
}

export interface SystemDetail extends System {
  architecture?: SystemArchitecture;
  data_info?: SystemDataInfo;
  // ... other related models
}

// Statistics
export interface SystemStatistics {
  total: number;
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
