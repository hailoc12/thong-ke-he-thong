/**
 * Mock data: Analytics & AI Insights
 * For Feature 1: Intelligent Analytics
 */

export interface AIInsight {
  id: number;
  type: 'risk' | 'opportunity' | 'warning' | 'recommendation';
  severity: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  description: string;
  impact: string;
  recommendation: string;
  affectedSystems: string[];
  potentialSaving?: number; // VNĐ/năm
  confidence: number; // 0-100%
}

export interface CostForecast {
  year: string;
  development: number; // Tỷ VNĐ
  maintenance: number;
  infrastructure: number;
  license: number;
  total: number;
  confidenceInterval?: {
    low: number;
    high: number;
  };
}

export interface SystemNode {
  id: string;
  name: string;
  tech: string;
  color: string;
  size: number; // Based on users or cost
  orgId: number;
  orgName: string;
}

export interface SystemLink {
  source: string;
  target: string;
  type: 'API' | 'Database' | 'SSO' | 'Data Sync';
  strength: number;
}

export interface TechnologySilo {
  id: number;
  technology: string;
  systemCount: number;
  systems: string[];
  issue: string;
  recommendation: string;
  potentialSaving: number;
}

// AI Insights
export const mockAIInsights: AIInsight[] = [
  {
    id: 1,
    type: 'risk',
    severity: 'critical',
    title: 'Phát hiện 3 hệ thống sử dụng công nghệ lỗi thời',
    description: 'Các hệ thống Cổng TT điện tử Bộ (cũ) đang dùng Joomla 2.5 (EOL 2014), Hệ thống Thống kê KH&CN (legacy) dùng ASP Classic, và Portal cũ sử dụng MySQL 5.6 (EOL 2021).',
    impact: 'Rủi ro bảo mật cao, không được hỗ trợ bản vá lỗi, khó tuyển nhân sự maintain',
    recommendation: 'Ưu tiên migrate 3 hệ thống này trong Q2-Q3 2026. Ước tính chi phí: 2-3 tỷ VNĐ. Nếu không migrate, rủi ro bị tấn công tăng 75%.',
    affectedSystems: ['VPB-PORTAL-OLD', 'VISTA-OLD', 'VPB-QLVB'],
    confidence: 95
  },
  {
    id: 2,
    type: 'warning',
    severity: 'high',
    title: '5 hệ thống có vendor dependency quá cao (>80%)',
    description: 'Các hệ thống Quản lý Bưu chính, Quản lý Nhân sự (SAP), Patent, Trademark và Văn bản điều hành phụ thuộc hoàn toàn vào nhà thầu. Chi phí bảo trì đắt, không thể tự maintain.',
    impact: 'Chi phí O&M cao hơn 40% so với industry average. Rủi ro gián đoạn dịch vụ nếu nhà thầu ngừng hỗ trợ.',
    recommendation: 'Đầu tư đào tạo đội ngũ nội bộ, yêu cầu knowledge transfer từ nhà thầu, xem xét giảm phụ thuộc dần từng module.',
    affectedSystems: ['VBC-QLBC', 'VPB-HCNS', 'IPVN-PATENT', 'IPVN-TM', 'VPB-QLVB'],
    confidence: 88
  },
  {
    id: 3,
    type: 'opportunity',
    severity: 'high',
    title: 'Cơ hội tích hợp: 8 hệ thống cần chức năng SSO',
    description: 'Phân tích cho thấy 8 hệ thống đang có authentication riêng biệt. Người dùng phải nhớ 8 tài khoản khác nhau.',
    impact: 'Giảm user experience, tăng rủi ro mật khẩu yếu, tăng chi phí support (reset password).',
    recommendation: 'Xây dựng hệ thống SSO tập trung. Ước tính tiết kiệm 300M VNĐ/năm chi phí support + tăng security. ROI: 18 tháng.',
    affectedSystems: ['VISTA-STATS', 'VKHKT-DUAN', 'IPVN-SEARCH', 'VPB-PORTAL-NEW', 'CVT-GIAYP HEP', 'CBC-GIAYP HEP', 'VHQT-HOPTAC', 'VAST-RESEARCH'],
    potentialSaving: 300000000,
    confidence: 82
  },
  {
    id: 4,
    type: 'recommendation',
    severity: 'medium',
    title: 'Nên hợp nhất 3 hệ thống cấp phép thành 1 platform',
    description: 'Các hệ thống cấp phép của Cục Viễn thông, Cục Báo chí, và Cục An toàn bức xạ có workflow tương tự 70%. Đang dùng 3 nền tảng khác nhau.',
    impact: 'Duplicate code, duplicate infrastructure, khó đồng bộ quy trình.',
    recommendation: 'Xây dựng Licensing Platform chung với workflow configurable. Ước tính tiết kiệm 800M VNĐ/năm chi phí vận hành.',
    affectedSystems: ['CVT-GIAYP HEP', 'CBC-GIAYP HEP', 'CATN-GIAYP HEP'],
    potentialSaving: 800000000,
    confidence: 75
  },
  {
    id: 5,
    type: 'opportunity',
    severity: 'medium',
    title: 'Cloud migration có thể tiết kiệm 25% chi phí infrastructure',
    description: '12 hệ thống on-premise có workload không đều (peak giờ hành chính). Cloud elasticity có thể tối ưu chi phí.',
    impact: 'Chi phí on-premise cố định cao, không tận dụng được scale-down khi ít traffic.',
    recommendation: 'Ưu tiên migrate các hệ thống có traffic biến động mạnh lên cloud. Ước tính tiết kiệm 1.2 tỷ VNĐ/năm.',
    affectedSystems: ['VISTA-PORTAL', 'VKHKT-NGHIEMTHU', 'VKHTC-TAISAN', 'CXBPTXB-ISBN', 'VHQT-HOPTAC'],
    potentialSaving: 1200000000,
    confidence: 70
  },
  {
    id: 6,
    type: 'risk',
    severity: 'high',
    title: '4 hệ thống không có disaster recovery plan',
    description: 'Các hệ thống critical như Quản lý Dự án KH&CN, Thống kê Quốc gia, Quản lý Sáng chế không có DR plan. RTO/RPO chưa định nghĩa.',
    impact: 'Nếu có sự cố, downtime có thể kéo dài >48h. Mất dữ liệu >24h. Ảnh hưởng nghiêm trọng hoạt động Bộ.',
    recommendation: 'Xây dựng DR plan ASAP. Đầu tư backup site. Ước tính chi phí: 500M VNĐ one-time + 200M VNĐ/năm vận hành.',
    affectedSystems: ['VKHKT-DUAN', 'VISTA-STATS', 'IPVN-PATENT', 'VPB-HCNS'],
    confidence: 92
  },
  {
    id: 7,
    type: 'warning',
    severity: 'medium',
    title: 'Database license Oracle đang chiếm 35% tổng chi phí license',
    description: '5 hệ thống dùng Oracle 12c/19c. Chi phí license + support Oracle rất cao: 4.5 tỷ VNĐ/năm.',
    impact: 'Chi phí license tăng 10-15%/năm theo renewal. Khó mở rộng do license đắt.',
    recommendation: 'Đánh giá migrate sang PostgreSQL hoặc cloud-managed database. Potential saving: 2-3 tỷ VNĐ/năm sau khi hoàn tất migration.',
    affectedSystems: ['VBC-QLBC', 'CVT-GIAYP HEP', 'VKHTC-NSNN', 'IPVN-PATENT', 'IPVN-TM'],
    potentialSaving: 2500000000,
    confidence: 68
  },
  {
    id: 8,
    type: 'recommendation',
    severity: 'low',
    title: 'API Gateway tập trung có thể cải thiện monitoring và security',
    description: 'Hiện có 15 hệ thống expose APIs nhưng không có API Gateway trung tâm. Khó monitor, rate limit, authentication.',
    impact: 'Khó phát hiện API abuse, không có centralized logging, khó implement consistent security policies.',
    recommendation: 'Triển khai Kong hoặc AWS API Gateway. Chi phí: 300M VNĐ/năm. Lợi ích: Better security, centralized monitoring, easier integration.',
    affectedSystems: ['VISTA-STATS', 'VKHKT-DUAN', 'IPVN-SEARCH', 'VPB-HCNS'],
    confidence: 65
  }
];

// Cost Forecast (2024-2028)
export const mockCostForecast: CostForecast[] = [
  {
    year: '2024',
    development: 8.5,
    maintenance: 12.3,
    infrastructure: 6.8,
    license: 4.2,
    total: 31.8,
    confidenceInterval: { low: 30.5, high: 33.2 }
  },
  {
    year: '2025',
    development: 10.2,
    maintenance: 13.8,
    infrastructure: 7.5,
    license: 4.8,
    total: 36.3,
    confidenceInterval: { low: 34.8, high: 38.1 }
  },
  {
    year: '2026',
    development: 15.5,
    maintenance: 18.2,
    infrastructure: 8.2,
    license: 4.5,
    total: 46.4,
    confidenceInterval: { low: 43.8, high: 49.5 }
  },
  {
    year: '2027',
    development: 17.8,
    maintenance: 20.5,
    infrastructure: 9.1,
    license: 5.2,
    total: 52.6,
    confidenceInterval: { low: 49.2, high: 56.8 }
  },
  {
    year: '2028',
    development: 18.5,
    maintenance: 22.8,
    infrastructure: 10.2,
    license: 6.1,
    total: 57.6,
    confidenceInterval: { low: 53.5, high: 62.5 }
  }
];

// System Landscape Graph
export const mockSystemNodes: SystemNode[] = [
  { id: '1', name: 'Portal Bộ (mới)', tech: 'Next.js', color: '#0066e6', size: 25, orgId: 10, orgName: 'Văn phòng Bộ' },
  { id: '2', name: 'Quản lý Văn bản', tech: '.NET', color: '#52c41a', size: 28, orgId: 10, orgName: 'Văn phòng Bộ' },
  { id: '3', name: 'Quản lý Nhân sự', tech: 'SAP', color: '#faad14', size: 32, orgId: 10, orgName: 'Văn phòng Bộ' },
  { id: '4', name: 'Thống kê Quốc gia', tech: 'Python', color: '#1890ff', size: 30, orgId: 14, orgName: 'VISTA' },
  { id: '5', name: 'Portal VISTA', tech: 'WordPress', color: '#722ed1', size: 25, orgId: 14, orgName: 'VISTA' },
  { id: '6', name: 'Quản lý Dự án KH&CN', tech: 'Java', color: '#fa8c16', size: 29, orgId: 3, orgName: 'Vụ KHKT' },
  { id: '7', name: 'Nghiệm thu Đề tài', tech: 'PHP', color: '#13c2c2', size: 18, orgId: 3, orgName: 'Vụ KHKT' },
  { id: '8', name: 'Quản lý Sáng chế', tech: '.NET', color: '#52c41a', size: 20, orgId: 19, orgName: 'Cục SH TT' },
  { id: '9', name: 'Đăng ký Nhãn hiệu', tech: '.NET', color: '#52c41a', size: 22, orgId: 19, orgName: 'Cục SH TT' },
  { id: '10', name: 'Tra cứu SH TT', tech: 'Elasticsearch', color: '#eb2f96', size: 26, orgId: 19, orgName: 'Cục SH TT' },
  { id: '11', name: 'Cấp phép Viễn thông', tech: 'Java', color: '#fa8c16', size: 19, orgId: 15, orgName: 'Cục VT' },
  { id: '12', name: 'Giám sát QoS VT', tech: 'Python', color: '#1890ff', size: 12, orgId: 15, orgName: 'Cục VT' },
  { id: '13', name: 'Cấp phép Báo chí', tech: '.NET', color: '#52c41a', size: 17, orgId: 17, orgName: 'Cục BC' },
  { id: '14', name: 'Giám sát Báo chí', tech: 'Python', color: '#1890ff', size: 10, orgId: 17, orgName: 'Cục BC' },
  { id: '15', name: 'Quản lý Bưu chính', tech: 'Java', color: '#fa8c16', size: 24, orgId: 1, orgName: 'Vụ BC' },
  { id: '16', name: 'Portal Vụ BC', tech: 'React', color: '#0066e6', size: 14, orgId: 1, orgName: 'Vụ BC' },
  { id: '17', name: 'Quản lý NSNN', tech: 'TABMIS', color: '#faad14', size: 20, orgId: 6, orgName: 'Vụ KHTC' },
  { id: '18', name: 'Quản lý Tài sản', tech: 'PHP', color: '#13c2c2', size: 15, orgId: 6, orgName: 'Vụ KHTC' },
  { id: '19', name: 'BI và Báo cáo', tech: 'Power BI', color: '#faad14', size: 16, orgId: 6, orgName: 'Vụ KHTC' },
  { id: '20', name: 'Cấp phép AT Bức xạ', tech: '.NET', color: '#52c41a', size: 13, orgId: 12, orgName: 'Cục ATBN' },
  { id: '21', name: 'Giám sát Bức xạ', tech: 'LabVIEW', color: '#722ed1', size: 11, orgId: 22, orgName: 'VAEC' },
  { id: '22', name: 'Thư viện số VAST', tech: 'DSpace', color: '#eb2f96', size: 21, orgId: 23, orgName: 'VAST' },
  { id: '23', name: 'Quản lý NC VAST', tech: 'Java', color: '#fa8c16', size: 18, orgId: 23, orgName: 'VAST' },
  { id: '24', name: 'Cấp mã ISBN', tech: 'PHP', color: '#13c2c2', size: 17, orgId: 18, orgName: 'Cục XB' },
  { id: '25', name: 'QL Hợp tác QT', tech: 'Node.js', color: '#0066e6', size: 12, orgId: 7, orgName: 'Vụ HQTQ' },
  { id: '26', name: 'Chatbot hỗ trợ', tech: 'Rasa', color: '#1890ff', size: 22, orgId: 10, orgName: 'Văn phòng Bộ' }
];

export const mockSystemLinks: SystemLink[] = [
  // Portal Bộ integrations
  { source: '1', target: '2', type: 'SSO', strength: 3 },
  { source: '1', target: '3', type: 'SSO', strength: 3 },
  { source: '1', target: '4', type: 'API', strength: 2 },
  { source: '1', target: '6', type: 'API', strength: 2 },
  { source: '1', target: '26', type: 'API', strength: 2 },

  // Văn phòng Bộ internal
  { source: '2', target: '3', type: 'Data Sync', strength: 2 },
  { source: '2', target: '17', type: 'Data Sync', strength: 1 },

  // VISTA connections
  { source: '4', target: '5', type: 'API', strength: 3 },
  { source: '4', target: '6', type: 'Data Sync', strength: 2 },
  { source: '4', target: '8', type: 'Data Sync', strength: 1 },
  { source: '4', target: '22', type: 'Data Sync', strength: 1 },

  // Dự án KH&CN
  { source: '6', target: '7', type: 'API', strength: 3 },
  { source: '6', target: '17', type: 'Data Sync', strength: 2 },
  { source: '6', target: '23', type: 'Data Sync', strength: 1 },

  // Sở hữu trí tuệ
  { source: '8', target: '9', type: 'Database', strength: 2 },
  { source: '8', target: '10', type: 'API', strength: 3 },
  { source: '9', target: '10', type: 'API', strength: 3 },

  // Viễn thông
  { source: '11', target: '12', type: 'API', strength: 2 },

  // Báo chí
  { source: '13', target: '14', type: 'API', strength: 2 },

  // Bưu chính
  { source: '15', target: '16', type: 'API', strength: 2 },

  // Kế hoạch - Tài chính
  { source: '17', target: '18', type: 'Data Sync', strength: 2 },
  { source: '17', target: '19', type: 'Data Sync', strength: 3 },
  { source: '18', target: '19', type: 'API', strength: 1 },

  // VAST
  { source: '22', target: '23', type: 'API', strength: 2 },

  // Cross-organization
  { source: '3', target: '6', type: 'SSO', strength: 1 },
  { source: '3', target: '8', type: 'SSO', strength: 1 },
  { source: '3', target: '11', type: 'SSO', strength: 1 },
  { source: '3', target: '13', type: 'SSO', strength: 1 },
  { source: '19', target: '4', type: 'Data Sync', strength: 2 },
  { source: '19', target: '6', type: 'Data Sync', strength: 2 }
];

// Technology Silos
export const mockTechnologySilos: TechnologySilo[] = [
  {
    id: 1,
    technology: 'Authentication riêng biệt',
    systemCount: 8,
    systems: ['VISTA-STATS', 'VKHKT-DUAN', 'IPVN-SEARCH', 'CVT-GIAYP HEP', 'CBC-GIAYP HEP', 'VHQT-HOPTAC', 'VAST-RESEARCH', 'CXBPTXB-ISBN'],
    issue: '8 hệ thống có authentication system riêng. Người dùng phải nhớ 8 username/password khác nhau.',
    recommendation: 'Xây dựng SSO tập trung (OAuth 2.0/SAML 2.0). Tích hợp với Active Directory hoặc Azure AD.',
    potentialSaving: 300000000
  },
  {
    id: 2,
    technology: 'PostgreSQL',
    systemCount: 6,
    systems: ['VBC-PORTAL', 'VISTA-STATS', 'VKHKT-DUAN', 'IPVN-SEARCH', 'VAEC-GIAMSAT', 'VAST-RESEARCH'],
    issue: '6 hệ thống đều dùng PostgreSQL nhưng không share knowledge, không có DBA chung, mỗi team tự maintain.',
    recommendation: 'Thiết lập Database Team chung. Standardize configuration, backup strategy, monitoring. Shared learning.',
    potentialSaving: 150000000
  },
  {
    id: 3,
    technology: 'Workflow cấp phép',
    systemCount: 3,
    systems: ['CVT-GIAYP HEP', 'CBC-GIAYP HEP', 'CATN-GIAYP HEP'],
    issue: '3 hệ thống cấp phép có workflow tương tự 70% nhưng mỗi hệ thống build lại từ đầu.',
    recommendation: 'Xây dựng Licensing Platform chung với workflow engine configurable (Camunda BPM hoặc tương tự).',
    potentialSaving: 800000000
  },
  {
    id: 4,
    technology: 'Monitoring & Logging',
    systemCount: 15,
    systems: ['VBC-QLBC', 'VISTA-STATS', 'VKHKT-DUAN', 'IPVN-PATENT', 'IPVN-TM', 'CVT-GIAYP HEP', 'CBC-GIAYP HEP', 'VPB-QLVB', 'VPB-HCNS', 'CATN-GIAYP HEP', 'VAST-RESEARCH', 'VKHTC-BI', 'CVT-GIAMSAT', 'CBC-GIAMSAT', 'VHQT-HOPTAC'],
    issue: '15 hệ thống có cách logging riêng. Không có centralized monitoring. Khó troubleshoot khi có vấn đề cross-system.',
    recommendation: 'Triển khai ELK Stack (Elasticsearch + Logstash + Kibana) hoặc Grafana + Loki. Centralized logging & monitoring.',
    potentialSaving: 450000000
  },
  {
    id: 5,
    technology: '.NET Framework',
    systemCount: 7,
    systems: ['VPB-QLVB', 'IPVN-PATENT', 'IPVN-TM', 'CBC-GIAYP HEP', 'CATN-GIAYP HEP', 'CVT-BLOCKCHAIN', 'VKHTC-BI'],
    issue: '7 hệ thống dùng .NET nhưng versions khác nhau (.NET Framework 4.8, .NET Core 3.1, .NET 6, .NET 8). Khó maintain.',
    recommendation: 'Standardize lên .NET 8 (LTS). Training team .NET chung. Shared libraries và best practices.',
    potentialSaving: 200000000
  },
  {
    id: 6,
    technology: 'API Documentation',
    systemCount: 12,
    systems: ['VISTA-STATS', 'VKHKT-DUAN', 'IPVN-SEARCH', 'VPB-HCNS', 'CVT-GIAYP HEP', 'CBC-GIAMSAT', 'VKHTC-BI', 'VAST-RESEARCH', 'VHQT-HOPTAC', 'VPB-CHATBOT', 'CXBPTXB-ISBN', 'VAEC-GIAMSAT'],
    issue: '12 hệ thống có APIs nhưng documentation không chuẩn. Một số dùng Swagger, một số dùng Postman, nhiều hệ thống không có docs.',
    recommendation: 'Standardize API documentation với OpenAPI 3.0. Deploy Swagger UI tập trung. API Catalog với examples.',
    potentialSaving: 180000000
  }
];
