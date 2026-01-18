/**
 * Mock data: API Catalog & Integration
 * For Feature 5
 */

export interface APIDefinition {
  id: number;
  apiName: string;
  apiCode: string;
  version: string;
  systemId: number;
  systemName: string;
  category: 'public' | 'internal' | 'partner' | 'deprecated';
  protocol: 'REST' | 'GraphQL' | 'SOAP' | 'gRPC' | 'WebSocket';
  baseUrl: string;
  authMethod: 'API Key' | 'OAuth 2.0' | 'JWT' | 'Basic Auth' | 'mTLS';
  status: 'active' | 'beta' | 'deprecated' | 'sunset';
  rateLimit: string; // "1000 req/min"
  sla: {
    uptime: number; // percentage
    responseTime: number; // ms
    errorRate: number; // percentage
  };
  documentation: string; // URL to Swagger/OpenAPI
  endpoints: number;
  consumers: number; // Number of applications using this API
  callsPerDay: number;
  lastUpdated: string;
  owner: string;
  contactEmail: string;
}

export interface APIHealth {
  apiId: number;
  apiCode: string;
  timestamp: string;
  status: 'healthy' | 'degraded' | 'down';
  uptime: number; // percentage
  avgResponseTime: number; // ms
  p95ResponseTime: number; // ms
  p99ResponseTime: number; // ms
  errorRate: number; // percentage
  requestsToday: number;
  errorsToday: number;
  lastIncident: string | null;
  alerts: Array<{
    severity: 'critical' | 'warning' | 'info';
    message: string;
    timestamp: string;
  }>;
}

export interface APIIntegration {
  id: number;
  sourceSystemId: number;
  sourceSystemName: string;
  targetSystemId: number;
  targetSystemName: string;
  apiId: number;
  apiName: string;
  integrationType: 'real-time' | 'batch' | 'event-driven' | 'scheduled';
  frequency: string; // "every 5 min", "hourly", "daily"
  dataVolume: string; // "~1000 records/day"
  status: 'active' | 'inactive' | 'error';
  lastSyncTime: string;
  lastSyncStatus: 'success' | 'failed' | 'partial';
  errorCount24h: number;
}

export interface APIMarketplace {
  id: number;
  name: string;
  provider: string;
  category: 'authentication' | 'payment' | 'notification' | 'analytics' | 'ai' | 'mapping' | 'data';
  description: string;
  pricing: 'free' | 'freemium' | 'paid';
  popularity: number; // 1-5 stars
  useCase: string;
  documentation: string;
  featured: boolean;
}

export const mockAPIDefinitions: APIDefinition[] = [
  {
    id: 1,
    apiName: 'Portal Authentication API',
    apiCode: 'VPB-AUTH-API',
    version: 'v2.1.0',
    systemId: 1,
    systemName: 'Cổng Thông tin điện tử Bộ KH&CN',
    category: 'internal',
    protocol: 'REST',
    baseUrl: 'https://api.most.gov.vn/auth',
    authMethod: 'OAuth 2.0',
    status: 'active',
    rateLimit: '5000 req/min',
    sla: { uptime: 99.9, responseTime: 150, errorRate: 0.1 },
    documentation: 'https://api.most.gov.vn/auth/swagger',
    endpoints: 12,
    consumers: 18,
    callsPerDay: 450000,
    lastUpdated: '2026-01-10',
    owner: 'Nguyễn Văn Minh',
    contactEmail: 'nvm@most.gov.vn'
  },
  {
    id: 2,
    apiName: 'Statistical Data API',
    apiCode: 'VISTA-STATS-API',
    version: 'v3.0.0',
    systemId: 3,
    systemName: 'Hệ thống Thống kê Khoa học và Công nghệ Quốc gia',
    category: 'public',
    protocol: 'REST',
    baseUrl: 'https://api.vista.gov.vn/v3',
    authMethod: 'API Key',
    status: 'active',
    rateLimit: '10000 req/hour',
    sla: { uptime: 99.5, responseTime: 300, errorRate: 0.5 },
    documentation: 'https://api.vista.gov.vn/docs',
    endpoints: 28,
    consumers: 156,
    callsPerDay: 280000,
    lastUpdated: '2025-12-15',
    owner: 'Trương Văn Phúc',
    contactEmail: 'tvp@vista.gov.vn'
  },
  {
    id: 3,
    apiName: 'Research Project Management API',
    apiCode: 'VKHKT-PROJECT-API',
    version: 'v1.5.2',
    systemId: 5,
    systemName: 'Hệ thống Quản lý Đề tài Khoa học',
    category: 'internal',
    protocol: 'REST',
    baseUrl: 'https://api-projects.most.gov.vn',
    authMethod: 'JWT',
    status: 'active',
    rateLimit: '2000 req/min',
    sla: { uptime: 99.7, responseTime: 200, errorRate: 0.2 },
    documentation: 'https://api-projects.most.gov.vn/openapi.json',
    endpoints: 45,
    consumers: 12,
    callsPerDay: 95000,
    lastUpdated: '2026-01-05',
    owner: 'Ngô Văn Thành',
    contactEmail: 'nvt@most.gov.vn'
  },
  {
    id: 4,
    apiName: 'Financial Budgeting API',
    apiCode: 'VKHTC-FINANCE-API',
    version: 'v2.0.0',
    systemId: 8,
    systemName: 'Hệ thống Quản lý Tài chính Ngân sách',
    category: 'internal',
    protocol: 'SOAP',
    baseUrl: 'https://finance-api.most.gov.vn/soap',
    authMethod: 'Basic Auth',
    status: 'deprecated',
    rateLimit: '500 req/min',
    sla: { uptime: 98.5, responseTime: 800, errorRate: 1.2 },
    documentation: 'https://finance-api.most.gov.vn/wsdl',
    endpoints: 18,
    consumers: 8,
    callsPerDay: 12000,
    lastUpdated: '2023-06-20',
    owner: 'Phạm Anh Tuấn',
    contactEmail: 'pat@most.gov.vn'
  },
  {
    id: 5,
    apiName: 'Document Management API',
    apiCode: 'VPB-EOFFICE-API',
    version: 'v1.8.1',
    systemId: 15,
    systemName: 'Hệ thống eOffice Văn phòng điện tử',
    category: 'internal',
    protocol: 'REST',
    baseUrl: 'https://eoffice-api.most.gov.vn/v1',
    authMethod: 'OAuth 2.0',
    status: 'active',
    rateLimit: '3000 req/min',
    sla: { uptime: 99.8, responseTime: 180, errorRate: 0.15 },
    documentation: 'https://eoffice-api.most.gov.vn/swagger',
    endpoints: 34,
    consumers: 22,
    callsPerDay: 320000,
    lastUpdated: '2025-11-30',
    owner: 'Phan Thị Mai',
    contactEmail: 'ptm@most.gov.vn'
  },
  {
    id: 6,
    apiName: 'Intellectual Property Search API',
    apiCode: 'CSH-IP-API',
    version: 'v2.3.0',
    systemId: 20,
    systemName: 'Hệ thống Quản lý Hồ sơ Sở hữu trí tuệ',
    category: 'public',
    protocol: 'REST',
    baseUrl: 'https://api-ip.most.gov.vn',
    authMethod: 'API Key',
    status: 'active',
    rateLimit: '5000 req/hour',
    sla: { uptime: 99.6, responseTime: 250, errorRate: 0.3 },
    documentation: 'https://api-ip.most.gov.vn/docs',
    endpoints: 22,
    consumers: 89,
    callsPerDay: 165000,
    lastUpdated: '2025-12-20',
    owner: 'Vương Thị Hằng',
    contactEmail: 'vth@most.gov.vn'
  },
  {
    id: 7,
    apiName: 'Telecommunications Registry API',
    apiCode: 'CVT-TELECOM-API',
    version: 'v1.2.0',
    systemId: 16,
    systemName: 'Hệ thống Quản lý Viễn thông',
    category: 'partner',
    protocol: 'REST',
    baseUrl: 'https://telecom-api.most.gov.vn',
    authMethod: 'mTLS',
    status: 'active',
    rateLimit: '10000 req/min',
    sla: { uptime: 99.95, responseTime: 100, errorRate: 0.05 },
    documentation: 'https://telecom-api.most.gov.vn/openapi',
    endpoints: 16,
    consumers: 45,
    callsPerDay: 580000,
    lastUpdated: '2026-01-12',
    owner: 'Nguyễn Thanh Sơn',
    contactEmail: 'nts@most.gov.vn'
  },
  {
    id: 8,
    apiName: 'Media Content Distribution API',
    apiCode: 'CPTTB-MEDIA-API',
    version: 'v1.0.5',
    systemId: 17,
    systemName: 'Hệ thống Quản lý Phát thanh Truyền hình',
    category: 'partner',
    protocol: 'REST',
    baseUrl: 'https://media-api.most.gov.vn',
    authMethod: 'API Key',
    status: 'beta',
    rateLimit: '8000 req/hour',
    sla: { uptime: 99.0, responseTime: 400, errorRate: 1.0 },
    documentation: 'https://media-api.most.gov.vn/beta-docs',
    endpoints: 12,
    consumers: 8,
    callsPerDay: 42000,
    lastUpdated: '2026-01-08',
    owner: 'Hoàng Thị Bích',
    contactEmail: 'htb@most.gov.vn'
  },
  {
    id: 9,
    apiName: 'Nuclear Safety Monitoring API',
    apiCode: 'CATN-MONITOR-API',
    version: 'v2.0.0',
    systemId: 12,
    systemName: 'Hệ thống Giám sát Bức xạ Môi trường',
    category: 'internal',
    protocol: 'WebSocket',
    baseUrl: 'wss://monitor-api.most.gov.vn',
    authMethod: 'JWT',
    status: 'active',
    rateLimit: 'N/A (real-time)',
    sla: { uptime: 99.99, responseTime: 50, errorRate: 0.01 },
    documentation: 'https://monitor-api.most.gov.vn/ws-docs',
    endpoints: 8,
    consumers: 5,
    callsPerDay: 2500000,
    lastUpdated: '2025-10-15',
    owner: 'Võ Thanh Tùng',
    contactEmail: 'vtt@most.gov.vn'
  },
  {
    id: 10,
    apiName: 'HR Personnel Management API',
    apiCode: 'VTCCB-HRM-API',
    version: 'v1.6.0',
    systemId: 9,
    systemName: 'Hệ thống Quản lý Nhân sự Tổ chức',
    category: 'internal',
    protocol: 'REST',
    baseUrl: 'https://hrm-api.most.gov.vn',
    authMethod: 'OAuth 2.0',
    status: 'active',
    rateLimit: '1000 req/min',
    sla: { uptime: 99.5, responseTime: 220, errorRate: 0.4 },
    documentation: 'https://hrm-api.most.gov.vn/swagger',
    endpoints: 38,
    consumers: 15,
    callsPerDay: 68000,
    lastUpdated: '2025-12-05',
    owner: 'Đặng Thị Phương',
    contactEmail: 'dtp@most.gov.vn'
  }
];

export const mockAPIHealth: APIHealth[] = [
  {
    apiId: 1,
    apiCode: 'VPB-AUTH-API',
    timestamp: '2026-01-18T10:30:00Z',
    status: 'healthy',
    uptime: 99.94,
    avgResponseTime: 142,
    p95ResponseTime: 185,
    p99ResponseTime: 220,
    errorRate: 0.08,
    requestsToday: 448250,
    errorsToday: 358,
    lastIncident: null,
    alerts: []
  },
  {
    apiId: 2,
    apiCode: 'VISTA-STATS-API',
    timestamp: '2026-01-18T10:30:00Z',
    status: 'healthy',
    uptime: 99.62,
    avgResponseTime: 285,
    p95ResponseTime: 420,
    p99ResponseTime: 580,
    errorRate: 0.42,
    requestsToday: 278500,
    errorsToday: 1170,
    lastIncident: '2026-01-12',
    alerts: [
      { severity: 'info', message: 'Response time trending up slightly', timestamp: '2026-01-18T09:15:00Z' }
    ]
  },
  {
    apiId: 3,
    apiCode: 'VKHKT-PROJECT-API',
    timestamp: '2026-01-18T10:30:00Z',
    status: 'healthy',
    uptime: 99.78,
    avgResponseTime: 195,
    p95ResponseTime: 280,
    p99ResponseTime: 350,
    errorRate: 0.18,
    requestsToday: 93800,
    errorsToday: 169,
    lastIncident: null,
    alerts: []
  },
  {
    apiId: 4,
    apiCode: 'VKHTC-FINANCE-API',
    timestamp: '2026-01-18T10:30:00Z',
    status: 'degraded',
    uptime: 98.12,
    avgResponseTime: 950,
    p95ResponseTime: 1500,
    p99ResponseTime: 2200,
    errorRate: 1.85,
    requestsToday: 11200,
    errorsToday: 207,
    lastIncident: '2026-01-17',
    alerts: [
      { severity: 'warning', message: 'High response time detected', timestamp: '2026-01-18T08:45:00Z' },
      { severity: 'warning', message: 'Error rate above threshold', timestamp: '2026-01-18T09:30:00Z' }
    ]
  },
  {
    apiId: 5,
    apiCode: 'VPB-EOFFICE-API',
    timestamp: '2026-01-18T10:30:00Z',
    status: 'healthy',
    uptime: 99.85,
    avgResponseTime: 172,
    p95ResponseTime: 215,
    p99ResponseTime: 270,
    errorRate: 0.12,
    requestsToday: 318400,
    errorsToday: 382,
    lastIncident: null,
    alerts: []
  },
  {
    apiId: 7,
    apiCode: 'CVT-TELECOM-API',
    timestamp: '2026-01-18T10:30:00Z',
    status: 'healthy',
    uptime: 99.97,
    avgResponseTime: 95,
    p95ResponseTime: 125,
    p99ResponseTime: 180,
    errorRate: 0.04,
    requestsToday: 576200,
    errorsToday: 230,
    lastIncident: null,
    alerts: []
  },
  {
    apiId: 9,
    apiCode: 'CATN-MONITOR-API',
    timestamp: '2026-01-18T10:30:00Z',
    status: 'healthy',
    uptime: 99.99,
    avgResponseTime: 48,
    p95ResponseTime: 62,
    p99ResponseTime: 85,
    errorRate: 0.009,
    requestsToday: 2487600,
    errorsToday: 224,
    lastIncident: null,
    alerts: []
  }
];

export const mockAPIIntegrations: APIIntegration[] = [
  {
    id: 1,
    sourceSystemId: 1,
    sourceSystemName: 'Cổng Thông tin điện tử',
    targetSystemId: 15,
    targetSystemName: 'eOffice',
    apiId: 1,
    apiName: 'Portal Authentication API',
    integrationType: 'real-time',
    frequency: 'on-demand',
    dataVolume: '~450K logins/day',
    status: 'active',
    lastSyncTime: '2026-01-18T10:28:15Z',
    lastSyncStatus: 'success',
    errorCount24h: 2
  },
  {
    id: 2,
    sourceSystemId: 3,
    sourceSystemName: 'VISTA Stats',
    targetSystemId: 1,
    targetSystemName: 'Portal',
    apiId: 2,
    apiName: 'Statistical Data API',
    integrationType: 'scheduled',
    frequency: 'hourly',
    dataVolume: '~12K records/hour',
    status: 'active',
    lastSyncTime: '2026-01-18T10:00:00Z',
    lastSyncStatus: 'success',
    errorCount24h: 0
  },
  {
    id: 3,
    sourceSystemId: 5,
    sourceSystemName: 'Research Projects',
    targetSystemId: 8,
    targetSystemName: 'Finance System',
    apiId: 3,
    apiName: 'Research Project Management API',
    integrationType: 'batch',
    frequency: 'daily at 23:00',
    dataVolume: '~500 projects/day',
    status: 'active',
    lastSyncTime: '2026-01-17T23:05:32Z',
    lastSyncStatus: 'success',
    errorCount24h: 0
  },
  {
    id: 4,
    sourceSystemId: 8,
    sourceSystemName: 'Finance System',
    targetSystemId: 9,
    targetSystemName: 'HRM System',
    apiId: 4,
    apiName: 'Financial Budgeting API',
    integrationType: 'scheduled',
    frequency: 'every 6 hours',
    dataVolume: '~200 transactions/sync',
    status: 'error',
    lastSyncTime: '2026-01-18T08:00:00Z',
    lastSyncStatus: 'failed',
    errorCount24h: 12
  },
  {
    id: 5,
    sourceSystemId: 15,
    sourceSystemName: 'eOffice',
    targetSystemId: 1,
    targetSystemName: 'Portal',
    apiId: 5,
    apiName: 'Document Management API',
    integrationType: 'event-driven',
    frequency: 'real-time (webhook)',
    dataVolume: '~8K docs/day',
    status: 'active',
    lastSyncTime: '2026-01-18T10:29:42Z',
    lastSyncStatus: 'success',
    errorCount24h: 1
  },
  {
    id: 6,
    sourceSystemId: 20,
    sourceSystemName: 'IP Management',
    targetSystemId: 1,
    targetSystemName: 'Portal',
    apiId: 6,
    apiName: 'Intellectual Property Search API',
    integrationType: 'real-time',
    frequency: 'on-demand',
    dataVolume: '~165K searches/day',
    status: 'active',
    lastSyncTime: '2026-01-18T10:27:55Z',
    lastSyncStatus: 'success',
    errorCount24h: 3
  },
  {
    id: 7,
    sourceSystemId: 16,
    sourceSystemName: 'Telecom Registry',
    targetSystemId: 1,
    targetSystemName: 'Portal',
    apiId: 7,
    apiName: 'Telecommunications Registry API',
    integrationType: 'real-time',
    frequency: 'on-demand',
    dataVolume: '~580K requests/day',
    status: 'active',
    lastSyncTime: '2026-01-18T10:29:58Z',
    lastSyncStatus: 'success',
    errorCount24h: 0
  },
  {
    id: 8,
    sourceSystemId: 12,
    sourceSystemName: 'Nuclear Safety Monitor',
    targetSystemId: 27,
    targetSystemName: 'BI Dashboard',
    apiId: 9,
    apiName: 'Nuclear Safety Monitoring API',
    integrationType: 'real-time',
    frequency: 'continuous stream',
    dataVolume: '~2.5M events/day',
    status: 'active',
    lastSyncTime: '2026-01-18T10:30:02Z',
    lastSyncStatus: 'success',
    errorCount24h: 0
  }
];

export const mockAPIMarketplace: APIMarketplace[] = [
  {
    id: 1,
    name: 'VNeID Authentication',
    provider: 'Bộ Công An',
    category: 'authentication',
    description: 'Tích hợp xác thực căn cước công dân điện tử VNeID cho hệ thống chính phủ',
    pricing: 'free',
    popularity: 5,
    useCase: 'Single Sign-On, eKYC, Digital Identity',
    documentation: 'https://api.vneid.gov.vn/docs',
    featured: true
  },
  {
    id: 2,
    name: 'VNPT ePay Gateway',
    provider: 'VNPT',
    category: 'payment',
    description: 'Cổng thanh toán điện tử tích hợp với 20+ ngân hàng và ví điện tử',
    pricing: 'paid',
    popularity: 4,
    useCase: 'Online payment, Fee collection, E-wallet integration',
    documentation: 'https://epay.vnpt.vn/api-docs',
    featured: true
  },
  {
    id: 3,
    name: 'Viettel SMS & Push Notification',
    provider: 'Viettel',
    category: 'notification',
    description: 'Gửi SMS, email, push notification hàng loạt với delivery tracking',
    pricing: 'paid',
    popularity: 5,
    useCase: 'OTP, Alert notifications, Marketing campaigns',
    documentation: 'https://api.viettel.vn/notification',
    featured: true
  },
  {
    id: 4,
    name: 'Google Analytics 4',
    provider: 'Google',
    category: 'analytics',
    description: 'Web và mobile analytics với AI insights và predictive metrics',
    pricing: 'freemium',
    popularity: 5,
    useCase: 'User behavior tracking, Conversion optimization',
    documentation: 'https://developers.google.com/analytics/devguides/collection/ga4',
    featured: false
  },
  {
    id: 5,
    name: 'OpenAI GPT-4',
    provider: 'OpenAI',
    category: 'ai',
    description: 'Large language model cho chatbot, content generation, translation',
    pricing: 'paid',
    popularity: 5,
    useCase: 'AI chatbot, Document summarization, Q&A systems',
    documentation: 'https://platform.openai.com/docs',
    featured: true
  },
  {
    id: 6,
    name: 'Google Maps Platform',
    provider: 'Google',
    category: 'mapping',
    description: 'Maps, geocoding, directions, places API cho location-based services',
    pricing: 'freemium',
    popularity: 5,
    useCase: 'Address lookup, Route planning, Location visualization',
    documentation: 'https://developers.google.com/maps/documentation',
    featured: false
  },
  {
    id: 7,
    name: 'Vietnam National Database',
    provider: 'Bộ Công An',
    category: 'data',
    description: 'Tra cứu dữ liệu dân cư quốc gia (CCCD, hộ khẩu, cư trú)',
    pricing: 'free',
    popularity: 4,
    useCase: 'Citizen verification, Population statistics',
    documentation: 'https://api.bocongan.gov.vn/database-docs',
    featured: true
  },
  {
    id: 8,
    name: 'FPT.AI Platform',
    provider: 'FPT',
    category: 'ai',
    description: 'Vietnamese NLP, speech-to-text, text-to-speech, OCR',
    pricing: 'freemium',
    popularity: 4,
    useCase: 'Vietnamese chatbot, Voice assistant, Document digitization',
    documentation: 'https://fpt.ai/docs',
    featured: true
  }
];

// Utility functions
export const getAPIsByCategory = (category: APIDefinition['category']) => {
  return mockAPIDefinitions.filter(api => api.category === category);
};

export const getAPIsByStatus = (status: APIDefinition['status']) => {
  return mockAPIDefinitions.filter(api => api.status === status);
};

export const getHealthyAPIs = () => {
  return mockAPIHealth.filter(h => h.status === 'healthy');
};

export const getDegradedAPIs = () => {
  return mockAPIHealth.filter(h => h.status === 'degraded' || h.status === 'down');
};

export const getActiveIntegrations = () => {
  return mockAPIIntegrations.filter(i => i.status === 'active');
};

export const getFailedIntegrations = () => {
  return mockAPIIntegrations.filter(i => i.status === 'error');
};

export const getFeaturedMarketplaceAPIs = () => {
  return mockAPIMarketplace.filter(api => api.featured);
};
