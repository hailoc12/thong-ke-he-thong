/**
 * Mock data: Systems (Các hệ thống thông tin)
 * Realistic systems for Bộ KH&CN organizations
 */

export interface MockSystem {
  id: number;
  system_code: string;
  system_name: string;
  org_id: number;
  org_name: string;
  status: 'active' | 'inactive' | 'maintenance' | 'planning' | 'draft';
  criticality_level: 'critical' | 'high' | 'medium' | 'low';
  form_level: 1 | 2;
  users_total?: number;
  users_mau?: number;
  users_dau?: number;
  tech_stack?: string;
  database?: string;
  hosting?: string;
  go_live_date?: string;
  annual_cost?: number; // VNĐ
  vendor?: string;
  integration_count?: number;
}

export const mockSystems: MockSystem[] = [
  // Vụ Bưu chính (VBC)
  {
    id: 1,
    system_code: 'VBC-PORTAL',
    system_name: 'Cổng thông tin điện tử Vụ Bưu chính',
    org_id: 1,
    org_name: 'Vụ Bưu chính',
    status: 'active',
    criticality_level: 'high',
    form_level: 1,
    users_total: 150,
    users_mau: 120,
    users_dau: 45,
    tech_stack: 'React + Node.js',
    database: 'PostgreSQL',
    hosting: 'Cloud - AWS',
    go_live_date: '2023-06-15',
    annual_cost: 450000000,
    vendor: 'FPT Software',
    integration_count: 3
  },
  {
    id: 2,
    system_code: 'VBC-QLBC',
    system_name: 'Hệ thống Quản lý Bưu chính',
    org_id: 1,
    org_name: 'Vụ Bưu chính',
    status: 'active',
    criticality_level: 'critical',
    form_level: 2,
    users_total: 850,
    users_mau: 720,
    users_dau: 580,
    tech_stack: 'Java Spring',
    database: 'Oracle 19c',
    hosting: 'On-premise',
    go_live_date: '2020-03-10',
    annual_cost: 2500000000,
    vendor: 'Viettel Solutions',
    integration_count: 8
  },

  // VISTA (Cục Thông tin, Thống kê)
  {
    id: 3,
    system_code: 'VISTA-STATS',
    system_name: 'Hệ thống Thống kê Khoa học và Công nghệ Quốc gia',
    org_id: 14,
    org_name: 'Cục Thông tin, Thống kê Khoa học và Công nghệ',
    status: 'active',
    criticality_level: 'critical',
    form_level: 2,
    users_total: 1200,
    users_mau: 980,
    users_dau: 750,
    tech_stack: 'Python Django + React',
    database: 'PostgreSQL + Redis',
    hosting: 'Cloud - GCP',
    go_live_date: '2021-11-20',
    annual_cost: 3200000000,
    vendor: 'CMC Corporation',
    integration_count: 15
  },
  {
    id: 4,
    system_code: 'VISTA-PORTAL',
    system_name: 'Cổng Thông tin điện tử VISTA',
    org_id: 14,
    org_name: 'Cục Thông tin, Thống kê KH&CN',
    status: 'active',
    criticality_level: 'high',
    form_level: 1,
    users_total: 2500,
    users_mau: 1800,
    users_dau: 980,
    tech_stack: 'WordPress + Custom Plugins',
    database: 'MySQL',
    hosting: 'Cloud - AWS',
    go_live_date: '2019-08-05',
    annual_cost: 180000000,
    vendor: 'NCS Vietnam',
    integration_count: 4
  },

  // Cục Sở hữu trí tuệ
  {
    id: 5,
    system_code: 'IPVN-PATENT',
    system_name: 'Hệ thống Quản lý Sáng chế và Giải pháp hữu ích',
    org_id: 19,
    org_name: 'Cục Sở hữu trí tuệ',
    status: 'active',
    criticality_level: 'critical',
    form_level: 2,
    users_total: 450,
    users_mau: 380,
    users_dau: 290,
    tech_stack: '.NET Core + Angular',
    database: 'SQL Server 2019',
    hosting: 'On-premise',
    go_live_date: '2022-01-15',
    annual_cost: 1800000000,
    vendor: 'FPT IS',
    integration_count: 6
  },
  {
    id: 6,
    system_code: 'IPVN-TM',
    system_name: 'Hệ thống Đăng ký Nhãn hiệu',
    org_id: 19,
    org_name: 'Cục Sở hữu trí tuệ',
    status: 'active',
    criticality_level: 'critical',
    form_level: 2,
    users_total: 680,
    users_mau: 590,
    users_dau: 420,
    tech_stack: '.NET Core + React',
    database: 'SQL Server 2019',
    hosting: 'On-premise',
    go_live_date: '2021-09-10',
    annual_cost: 2100000000,
    vendor: 'FPT IS',
    integration_count: 5
  },
  {
    id: 7,
    system_code: 'IPVN-SEARCH',
    system_name: 'Cơ sở dữ liệu Tra cứu Sở hữu trí tuệ',
    org_id: 19,
    org_name: 'Cục Sở hữu trí tuệ',
    status: 'active',
    criticality_level: 'high',
    form_level: 1,
    users_total: 5200,
    users_mau: 3800,
    users_dau: 1950,
    tech_stack: 'Elasticsearch + React',
    database: 'Elasticsearch + PostgreSQL',
    hosting: 'Cloud - AWS',
    go_live_date: '2023-03-20',
    annual_cost: 950000000,
    vendor: 'Viettel Digital Service',
    integration_count: 8
  },

  // Vụ Khoa học kỹ thuật và công nghệ
  {
    id: 8,
    system_code: 'VKHKT-DUAN',
    system_name: 'Hệ thống Quản lý Dự án Khoa học và Công nghệ',
    org_id: 3,
    org_name: 'Vụ Khoa học kỹ thuật và công nghệ',
    status: 'active',
    criticality_level: 'critical',
    form_level: 2,
    users_total: 1850,
    users_mau: 1520,
    users_dau: 980,
    tech_stack: 'Java Spring Boot + Vue.js',
    database: 'PostgreSQL + MongoDB',
    hosting: 'Hybrid Cloud',
    go_live_date: '2020-07-01',
    annual_cost: 3500000000,
    vendor: 'VNPT Technology',
    integration_count: 12
  },
  {
    id: 9,
    system_code: 'VKHKT-NGHIEMTHU',
    system_name: 'Hệ thống Nghiệm thu Đề tài KH&CN',
    org_id: 3,
    org_name: 'Vụ Khoa học kỹ thuật và công nghệ',
    status: 'active',
    criticality_level: 'high',
    form_level: 2,
    users_total: 620,
    users_mau: 480,
    users_dau: 285,
    tech_stack: 'PHP Laravel + Vue.js',
    database: 'MySQL',
    hosting: 'On-premise',
    go_live_date: '2021-04-12',
    annual_cost: 1200000000,
    vendor: 'Vega Corporation',
    integration_count: 4
  },

  // Văn phòng Bộ
  {
    id: 10,
    system_code: 'VPB-QLVB',
    system_name: 'Hệ thống Quản lý Văn bản và Điều hành',
    org_id: 10,
    org_name: 'Văn phòng Bộ',
    status: 'active',
    criticality_level: 'critical',
    form_level: 2,
    users_total: 2800,
    users_mau: 2450,
    users_dau: 1880,
    tech_stack: '.NET Framework 4.8',
    database: 'SQL Server 2016',
    hosting: 'On-premise',
    go_live_date: '2018-05-20',
    annual_cost: 1800000000,
    vendor: 'CMC Telecom',
    integration_count: 10
  },
  {
    id: 11,
    system_code: 'VPB-PORTAL-NEW',
    system_name: 'Cổng Thông tin điện tử Bộ KH&CN (mới)',
    org_id: 10,
    org_name: 'Văn phòng Bộ',
    status: 'planning',
    criticality_level: 'critical',
    form_level: 2,
    users_total: 0,
    tech_stack: 'Next.js + Headless CMS',
    database: 'PostgreSQL + Strapi',
    hosting: 'Cloud - AWS',
    go_live_date: '2026-06-30',
    annual_cost: 2500000000,
    vendor: 'FPT Software',
    integration_count: 15
  },
  {
    id: 12,
    system_code: 'VPB-HCNS',
    system_name: 'Hệ thống Quản lý Nhân sự',
    org_id: 10,
    org_name: 'Văn phòng Bộ',
    status: 'active',
    criticality_level: 'high',
    form_level: 2,
    users_total: 3200,
    users_mau: 2950,
    users_dau: 2100,
    tech_stack: 'SAP HCM',
    database: 'SAP HANA',
    hosting: 'On-premise',
    go_live_date: '2019-09-15',
    annual_cost: 4500000000,
    vendor: 'SAP Vietnam',
    integration_count: 18
  },

  // Cục Viễn thông
  {
    id: 13,
    system_code: 'CVT-GIAYP HEP',
    system_name: 'Hệ thống Cấp phép Viễn thông',
    org_id: 15,
    org_name: 'Cục Viễn thông',
    status: 'active',
    criticality_level: 'critical',
    form_level: 2,
    users_total: 580,
    users_mau: 490,
    users_dau: 350,
    tech_stack: 'Java Spring + Angular',
    database: 'Oracle 12c',
    hosting: 'On-premise',
    go_live_date: '2020-11-08',
    annual_cost: 1900000000,
    vendor: 'Viettel Solutions',
    integration_count: 7
  },
  {
    id: 14,
    system_code: 'CVT-GIAMSAT',
    system_name: 'Hệ thống Giám sát Chất lượng dịch vụ Viễn thông',
    org_id: 15,
    org_name: 'Cục Viễn thông',
    status: 'active',
    criticality_level: 'high',
    form_level: 2,
    users_total: 180,
    users_mau: 155,
    users_dau: 95,
    tech_stack: 'Python + Grafana',
    database: 'InfluxDB + PostgreSQL',
    hosting: 'Cloud - GCP',
    go_live_date: '2022-08-22',
    annual_cost: 850000000,
    vendor: 'VNPT Net',
    integration_count: 5
  },

  // Cục Báo chí
  {
    id: 15,
    system_code: 'CBC-GIAYP HEP',
    system_name: 'Hệ thống Cấp phép Hoạt động báo chí',
    org_id: 17,
    org_name: 'Cục Báo chí',
    status: 'active',
    criticality_level: 'critical',
    form_level: 2,
    users_total: 420,
    users_mau: 350,
    users_dau: 215,
    tech_stack: '.NET Core + React',
    database: 'SQL Server 2019',
    hosting: 'On-premise',
    go_live_date: '2021-03-15',
    annual_cost: 1200000000,
    vendor: 'NCS Vietnam',
    integration_count: 6
  },
  {
    id: 16,
    system_code: 'CBC-GIAMSAT',
    system_name: 'Hệ thống Giám sát Nội dung Báo chí điện tử',
    org_id: 17,
    org_name: 'Cục Báo chí',
    status: 'active',
    criticality_level: 'high',
    form_level: 2,
    users_total: 95,
    users_mau: 85,
    users_dau: 65,
    tech_stack: 'Python NLP + Elasticsearch',
    database: 'Elasticsearch + MongoDB',
    hosting: 'Cloud - AWS',
    go_live_date: '2023-01-10',
    annual_cost: 980000000,
    vendor: 'FPT AI',
    integration_count: 4
  },

  // Vụ Kế hoạch - Tài chính
  {
    id: 17,
    system_code: 'VKHTC-NSNN',
    system_name: 'Hệ thống Quản lý Ngân sách Nhà nước',
    org_id: 6,
    org_name: 'Vụ Kế hoạch - Tài chính',
    status: 'active',
    criticality_level: 'critical',
    form_level: 2,
    users_total: 450,
    users_mau: 420,
    users_dau: 350,
    tech_stack: 'TABMIS (Bộ TC)',
    database: 'Oracle',
    hosting: 'On-premise',
    go_live_date: '2019-01-01',
    annual_cost: 0, // Hệ thống trung ương
    vendor: 'Bộ Tài chính',
    integration_count: 8
  },
  {
    id: 18,
    system_code: 'VKHTC-TAISAN',
    system_name: 'Hệ thống Quản lý Tài sản',
    org_id: 6,
    org_name: 'Vụ Kế hoạch - Tài chính',
    status: 'active',
    criticality_level: 'medium',
    form_level: 1,
    users_total: 280,
    users_mau: 240,
    users_dau: 180,
    tech_stack: 'PHP + MySQL',
    database: 'MySQL',
    hosting: 'On-premise',
    go_live_date: '2020-06-10',
    annual_cost: 350000000,
    vendor: 'Vega Corporation',
    integration_count: 3
  },

  // Tổng cục Năng lượng nguyên tử
  {
    id: 19,
    system_code: 'VAEC-GIAMSAT',
    system_name: 'Hệ thống Giám sát Bức xạ môi trường',
    org_id: 22,
    org_name: 'Tổng cục Năng lượng nguyên tử Việt Nam',
    status: 'active',
    criticality_level: 'critical',
    form_level: 2,
    users_total: 85,
    users_mau: 78,
    users_dau: 65,
    tech_stack: 'LabVIEW + Python',
    database: 'PostgreSQL + TimescaleDB',
    hosting: 'On-premise',
    go_live_date: '2021-12-01',
    annual_cost: 1500000000,
    vendor: 'International Vendor',
    integration_count: 4
  },

  // Cục An toàn bức xạ và hạt nhân
  {
    id: 20,
    system_code: 'CATN-GIAYP HEP',
    system_name: 'Hệ thống Cấp phép An toàn bức xạ',
    org_id: 12,
    org_name: 'Cục An toàn bức xạ và hạt nhân',
    status: 'active',
    criticality_level: 'critical',
    form_level: 2,
    users_total: 150,
    users_mau: 125,
    users_dau: 85,
    tech_stack: '.NET Core + Vue.js',
    database: 'SQL Server 2019',
    hosting: 'On-premise',
    go_live_date: '2022-05-20',
    annual_cost: 980000000,
    vendor: 'CMC Corporation',
    integration_count: 5
  },

  // Viện Hàn lâm KH&CN
  {
    id: 21,
    system_code: 'VAST-LIBRARY',
    system_name: 'Thư viện số Viện Hàn lâm',
    org_id: 23,
    org_name: 'Viện Hàn lâm KH&CN Việt Nam',
    status: 'active',
    criticality_level: 'medium',
    form_level: 1,
    users_total: 3800,
    users_mau: 2100,
    users_dau: 850,
    tech_stack: 'DSpace',
    database: 'PostgreSQL',
    hosting: 'On-premise',
    go_live_date: '2018-10-15',
    annual_cost: 450000000,
    vendor: 'Open Source',
    integration_count: 3
  },
  {
    id: 22,
    system_code: 'VAST-RESEARCH',
    system_name: 'Hệ thống Quản lý Nghiên cứu',
    org_id: 23,
    org_name: 'Viện Hàn lâm KH&CN Việt Nam',
    status: 'active',
    criticality_level: 'high',
    form_level: 2,
    users_total: 1200,
    users_mau: 980,
    users_dau: 650,
    tech_stack: 'Java Spring + React',
    database: 'PostgreSQL',
    hosting: 'Cloud - GCP',
    go_live_date: '2022-09-01',
    annual_cost: 1800000000,
    vendor: 'VNPT Technology',
    integration_count: 7
  },

  // Legacy/Maintenance systems
  {
    id: 23,
    system_code: 'VPB-PORTAL-OLD',
    system_name: 'Cổng Thông tin điện tử Bộ KH&CN (cũ)',
    org_id: 10,
    org_name: 'Văn phòng Bộ',
    status: 'maintenance',
    criticality_level: 'low',
    form_level: 1,
    users_total: 8500,
    users_mau: 6200,
    users_dau: 3100,
    tech_stack: 'Joomla 2.5',
    database: 'MySQL 5.6',
    hosting: 'On-premise',
    go_live_date: '2015-03-10',
    annual_cost: 120000000,
    vendor: 'Internal team',
    integration_count: 2
  },
  {
    id: 24,
    system_code: 'VISTA-OLD',
    system_name: 'Hệ thống Thống kê KH&CN (legacy)',
    org_id: 14,
    org_name: 'Cục Thông tin, Thống kê KH&CN',
    status: 'inactive',
    criticality_level: 'low',
    form_level: 1,
    users_total: 0,
    tech_stack: 'ASP Classic',
    database: 'SQL Server 2008',
    hosting: 'On-premise',
    go_live_date: '2012-06-15',
    annual_cost: 0,
    vendor: 'N/A',
    integration_count: 0
  },

  // Planning systems
  {
    id: 25,
    system_code: 'VKHKT-AI',
    system_name: 'Hệ thống AI Hỗ trợ Đánh giá Đề tài',
    org_id: 3,
    org_name: 'Vụ Khoa học kỹ thuật và công nghệ',
    status: 'planning',
    criticality_level: 'medium',
    form_level: 2,
    users_total: 0,
    tech_stack: 'Python + TensorFlow + React',
    database: 'PostgreSQL + Vector DB',
    hosting: 'Cloud - AWS',
    go_live_date: '2026-Q4',
    annual_cost: 1800000000,
    vendor: 'FPT AI',
    integration_count: 6
  },
  {
    id: 26,
    system_code: 'CVT-BLOCKCHAIN',
    system_name: 'Hệ thống Quản lý Chứng chỉ số trên Blockchain',
    org_id: 15,
    org_name: 'Cục Viễn thông',
    status: 'planning',
    criticality_level: 'medium',
    form_level: 2,
    users_total: 0,
    tech_stack: 'Hyperledger Fabric + React',
    database: 'CouchDB',
    hosting: 'Cloud - GCP',
    go_live_date: '2026-Q3',
    annual_cost: 2200000000,
    vendor: 'Viettel Cyber Security',
    integration_count: 8
  },

  // Recent systems
  {
    id: 27,
    system_code: 'VKHTC-BI',
    system_name: 'Hệ thống Business Intelligence và Báo cáo',
    org_id: 6,
    org_name: 'Vụ Kế hoạch - Tài chính',
    status: 'active',
    criticality_level: 'high',
    form_level: 2,
    users_total: 120,
    users_mau: 105,
    users_dau: 78,
    tech_stack: 'Power BI + Python',
    database: 'Data Warehouse - SQL Server',
    hosting: 'Cloud - Azure',
    go_live_date: '2024-02-15',
    annual_cost: 850000000,
    vendor: 'FPT IS',
    integration_count: 12
  },
  {
    id: 28,
    system_code: 'VPB-CHATBOT',
    system_name: 'Chatbot Hỗ trợ Người dùng',
    org_id: 10,
    org_name: 'Văn phòng Bộ',
    status: 'active',
    criticality_level: 'low',
    form_level: 1,
    users_total: 12000,
    users_mau: 4500,
    users_dau: 1200,
    tech_stack: 'Rasa NLU + React',
    database: 'MongoDB',
    hosting: 'Cloud - AWS',
    go_live_date: '2024-08-01',
    annual_cost: 380000000,
    vendor: 'FPT AI',
    integration_count: 4
  },

  // Cục Xuất bản
  {
    id: 29,
    system_code: 'CXBPTXB-ISBN',
    system_name: 'Hệ thống Cấp mã số ISBN',
    org_id: 18,
    org_name: 'Cục Xuất bản, In và Phát hành',
    status: 'active',
    criticality_level: 'high',
    form_level: 2,
    users_total: 850,
    users_mau: 680,
    users_dau: 420,
    tech_stack: 'PHP Laravel + Vue.js',
    database: 'MySQL',
    hosting: 'On-premise',
    go_live_date: '2021-07-20',
    annual_cost: 680000000,
    vendor: 'NCS Vietnam',
    integration_count: 3
  },

  // Vụ Hợp tác quốc tế
  {
    id: 30,
    system_code: 'VHQT-HOPTAC',
    system_name: 'Hệ thống Quản lý Hợp tác quốc tế',
    org_id: 7,
    org_name: 'Vụ Hợp tác quốc tế',
    status: 'active',
    criticality_level: 'medium',
    form_level: 2,
    users_total: 180,
    users_mau: 150,
    users_dau: 95,
    tech_stack: 'Node.js + React',
    database: 'PostgreSQL',
    hosting: 'Cloud - AWS',
    go_live_date: '2023-04-10',
    annual_cost: 580000000,
    vendor: 'Vega Corporation',
    integration_count: 5
  },
];

export const getSystemById = (id: number) => {
  return mockSystems.find(sys => sys.id === id);
};

export const getSystemsByOrg = (orgId: number) => {
  return mockSystems.filter(sys => sys.org_id === orgId);
};

export const getSystemsByStatus = (status: string) => {
  return mockSystems.filter(sys => sys.status === status);
};

export const getTotalSystemCost = () => {
  return mockSystems.reduce((sum, sys) => sum + (sys.annual_cost || 0), 0);
};
