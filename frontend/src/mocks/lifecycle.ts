/**
 * Mock data: System Lifecycle Management
 * For Feature 4
 */

export interface SystemLifecyclePhase {
  phase: 'planning' | 'development' | 'production' | 'maintenance' | 'sunset';
  startDate: string;
  endDate: string | null;
  milestones: Array<{ name: string; date: string; status: 'completed' | 'in_progress' | 'pending' }>;
}

export interface SystemRoadmapItem {
  id: number;
  systemId: number;
  systemName: string;
  systemCode: string;
  currentPhase: 'planning' | 'development' | 'production' | 'maintenance' | 'sunset';
  nextMilestone: string;
  nextMilestoneDate: string;
  healthScore: number; // 0-100
  budget: {
    allocated: number;
    spent: number;
    remaining: number;
  };
  team: {
    technical: number;
    business: number;
    external: number;
  };
  risks: Array<{ severity: 'high' | 'medium' | 'low'; description: string }>;
  timeline: SystemLifecyclePhase[];
}

export interface PlanningPipeline {
  id: number;
  projectName: string;
  projectCode: string;
  orgId: number;
  orgName: string;
  status: 'idea' | 'feasibility' | 'approved' | 'budgeted' | 'ready_to_start';
  priority: 'P0' | 'P1' | 'P2' | 'P3';
  estimatedBudget: number;
  estimatedDuration: string; // "12 months"
  expectedGoLive: string;
  businessValue: 'critical' | 'high' | 'medium' | 'low';
  roi: number; // Percentage
  stakeholders: string[];
  dependencies: string[];
  submittedDate: string;
  lastReviewDate: string;
}

export interface BudgetTracking {
  year: number;
  quarter: 'Q1' | 'Q2' | 'Q3' | 'Q4';
  category: 'development' | 'maintenance' | 'infrastructure' | 'license' | 'training';
  allocated: number;
  committed: number;
  spent: number;
  forecast: number;
  variance: number; // allocated - forecast
  variancePercent: number;
}

export const mockSystemRoadmaps: SystemRoadmapItem[] = [
  {
    id: 1,
    systemId: 11,
    systemName: 'Cổng Thông tin điện tử Bộ KH&CN (mới)',
    systemCode: 'VPB-PORTAL-NEW',
    currentPhase: 'development',
    nextMilestone: 'UAT Completion',
    nextMilestoneDate: '2026-03-15',
    healthScore: 78,
    budget: {
      allocated: 2500000000,
      spent: 1200000000,
      remaining: 1300000000
    },
    team: {
      technical: 8,
      business: 3,
      external: 12
    },
    risks: [
      { severity: 'medium', description: 'Integration với legacy systems phức tạp hơn dự kiến' },
      { severity: 'low', description: 'Một số yêu cầu UI/UX chưa finalize' }
    ],
    timeline: [
      {
        phase: 'planning',
        startDate: '2025-10-01',
        endDate: '2025-11-30',
        milestones: [
          { name: 'Requirements gathering', date: '2025-10-15', status: 'completed' },
          { name: 'Architecture design', date: '2025-11-15', status: 'completed' },
          { name: 'Budget approval', date: '2025-11-30', status: 'completed' }
        ]
      },
      {
        phase: 'development',
        startDate: '2025-12-01',
        endDate: null,
        milestones: [
          { name: 'Sprint 1-3: Core features', date: '2026-01-15', status: 'completed' },
          { name: 'Sprint 4-6: Integrations', date: '2026-02-28', status: 'in_progress' },
          { name: 'UAT', date: '2026-03-15', status: 'pending' },
          { name: 'Go-live', date: '2026-04-01', status: 'pending' }
        ]
      }
    ]
  },
  {
    id: 2,
    systemId: 25,
    systemName: 'Hệ thống AI Hỗ trợ Đánh giá Đề tài',
    systemCode: 'VKHKT-AI',
    currentPhase: 'planning',
    nextMilestone: 'Pilot deployment',
    nextMilestoneDate: '2026-04-01',
    healthScore: 85,
    budget: {
      allocated: 1800000000,
      spent: 150000000,
      remaining: 1650000000
    },
    team: {
      technical: 5,
      business: 4,
      external: 8
    },
    risks: [
      { severity: 'high', description: 'Training data quality và quantity chưa đủ' },
      { severity: 'medium', description: 'Model accuracy cần đạt > 90% để được accept' }
    ],
    timeline: [
      {
        phase: 'planning',
        startDate: '2026-01-08',
        endDate: null,
        milestones: [
          { name: 'Data collection & labeling', date: '2026-02-15', status: 'in_progress' },
          { name: 'Model training & validation', date: '2026-03-15', status: 'pending' },
          { name: 'Pilot deployment', date: '2026-04-01', status: 'pending' }
        ]
      }
    ]
  },
  {
    id: 3,
    systemId: 3,
    systemName: 'Hệ thống Thống kê Khoa học và Công nghệ Quốc gia',
    systemCode: 'VISTA-STATS',
    currentPhase: 'production',
    nextMilestone: 'Performance optimization sprint',
    nextMilestoneDate: '2026-02-28',
    healthScore: 72,
    budget: {
      allocated: 800000000,
      spent: 200000000,
      remaining: 600000000
    },
    team: {
      technical: 6,
      business: 2,
      external: 5
    },
    risks: [
      { severity: 'medium', description: 'Database queries slow với large datasets' },
      { severity: 'low', description: 'UI cần refresh theo design mới' }
    ],
    timeline: [
      {
        phase: 'production',
        startDate: '2021-11-20',
        endDate: null,
        milestones: [
          { name: 'Version 2.0 release', date: '2025-06-01', status: 'completed' },
          { name: 'Performance upgrade', date: '2026-02-28', status: 'in_progress' },
          { name: 'Mobile app launch', date: '2026-06-30', status: 'pending' }
        ]
      }
    ]
  },
  {
    id: 4,
    systemId: 6,
    systemName: 'Hệ thống Quản lý Bưu chính',
    systemCode: 'VBC-POST',
    currentPhase: 'sunset',
    nextMilestone: 'Migration to new platform',
    nextMilestoneDate: '2026-09-30',
    healthScore: 45,
    budget: {
      allocated: 500000000,
      spent: 100000000,
      remaining: 400000000
    },
    team: {
      technical: 2,
      business: 1,
      external: 3
    },
    risks: [
      { severity: 'high', description: 'Legacy system unstable, nhiều bugs' },
      { severity: 'high', description: 'Vendor không còn support, khó maintain' }
    ],
    timeline: [
      {
        phase: 'sunset',
        startDate: '2026-01-01',
        endDate: '2026-09-30',
        milestones: [
          { name: 'New platform selection', date: '2026-03-31', status: 'in_progress' },
          { name: 'Data migration plan', date: '2026-06-30', status: 'pending' },
          { name: 'Go-live new platform', date: '2026-09-30', status: 'pending' }
        ]
      }
    ]
  },
  {
    id: 5,
    systemId: 15,
    systemName: 'Hệ thống eOffice Văn phòng điện tử',
    systemCode: 'VPB-EOFFICE',
    currentPhase: 'maintenance',
    nextMilestone: 'Security audit',
    nextMilestoneDate: '2026-03-01',
    healthScore: 88,
    budget: {
      allocated: 300000000,
      spent: 80000000,
      remaining: 220000000
    },
    team: {
      technical: 4,
      business: 2,
      external: 6
    },
    risks: [
      { severity: 'low', description: 'Minor bugs reported by users' }
    ],
    timeline: [
      {
        phase: 'maintenance',
        startDate: '2023-07-01',
        endDate: null,
        milestones: [
          { name: 'Annual security audit', date: '2026-03-01', status: 'pending' },
          { name: 'Bug fix sprint', date: '2026-02-15', status: 'in_progress' }
        ]
      }
    ]
  }
];

export const mockPlanningPipeline: PlanningPipeline[] = [
  {
    id: 1,
    projectName: 'Nền tảng Open Data Khoa học và Công nghệ',
    projectCode: 'VISTA-OPENDATA',
    orgId: 14,
    orgName: 'Cục VISTA',
    status: 'approved',
    priority: 'P0',
    estimatedBudget: 3500000000,
    estimatedDuration: '18 months',
    expectedGoLive: '2027-07-01',
    businessValue: 'critical',
    roi: 250,
    stakeholders: ['Cục VISTA', 'Vụ KHKT', 'Academia', 'Enterprises'],
    dependencies: ['VISTA-STATS upgrade', 'Data governance framework'],
    submittedDate: '2025-11-10',
    lastReviewDate: '2026-01-15'
  },
  {
    id: 2,
    projectName: 'Hệ thống Quản lý Chứng chỉ Điện tử Blockchain',
    projectCode: 'CVT-CERT-BLOCKCHAIN',
    orgId: 15,
    orgName: 'Cục Viễn thông',
    status: 'feasibility',
    priority: 'P1',
    estimatedBudget: 4200000000,
    estimatedDuration: '24 months',
    expectedGoLive: '2028-01-01',
    businessValue: 'high',
    roi: 180,
    stakeholders: ['Cục Viễn thông', 'Telecom operators', 'Enterprises'],
    dependencies: ['Legal framework approval', 'Blockchain consortium setup'],
    submittedDate: '2026-01-05',
    lastReviewDate: '2026-01-18'
  },
  {
    id: 3,
    projectName: 'AI Chatbot Hỗ trợ Công dân 24/7',
    projectCode: 'VPB-CHATBOT-AI',
    orgId: 10,
    orgName: 'Văn phòng Bộ',
    status: 'budgeted',
    priority: 'P1',
    estimatedBudget: 1200000000,
    estimatedDuration: '10 months',
    expectedGoLive: '2026-11-01',
    businessValue: 'high',
    roi: 320,
    stakeholders: ['Văn phòng Bộ', 'All departments', 'Citizens'],
    dependencies: ['Knowledge base preparation', 'NLP model training'],
    submittedDate: '2025-12-01',
    lastReviewDate: '2026-01-10'
  },
  {
    id: 4,
    projectName: 'Nền tảng IoT Giám sát Môi trường Bức xạ',
    projectCode: 'CATN-IOT-ENV',
    orgId: 12,
    orgName: 'Cục An toàn bức xạ và hạt nhân',
    status: 'ready_to_start',
    priority: 'P0',
    estimatedBudget: 5800000000,
    estimatedDuration: '20 months',
    expectedGoLive: '2027-09-01',
    businessValue: 'critical',
    roi: 150,
    stakeholders: ['CATN', 'Bộ TN&MT', 'Nuclear facilities'],
    dependencies: ['Sensor procurement', 'Network infrastructure'],
    submittedDate: '2025-10-15',
    lastReviewDate: '2026-01-12'
  },
  {
    id: 5,
    projectName: 'Hệ thống Quản lý Đào tạo Trực tuyến (LMS)',
    projectCode: 'VTCCB-LMS',
    orgId: 9,
    orgName: 'Vụ Tổ chức cán bộ',
    status: 'approved',
    priority: 'P2',
    estimatedBudget: 980000000,
    estimatedDuration: '12 months',
    expectedGoLive: '2027-01-01',
    businessValue: 'medium',
    roi: 200,
    stakeholders: ['VTCCB', 'All ministry staff', 'Training providers'],
    dependencies: ['Content digitization', 'Integration with HRM system'],
    submittedDate: '2025-12-20',
    lastReviewDate: '2026-01-14'
  },
  {
    id: 6,
    projectName: 'Mobile App Tra cứu Thông tin Khoa học',
    projectCode: 'VISTA-MOBILE',
    orgId: 14,
    orgName: 'Cục VISTA',
    status: 'idea',
    priority: 'P2',
    estimatedBudget: 650000000,
    estimatedDuration: '8 months',
    expectedGoLive: '2026-12-01',
    businessValue: 'medium',
    roi: 140,
    stakeholders: ['VISTA', 'Researchers', 'Students'],
    dependencies: ['API readiness', 'UX research'],
    submittedDate: '2026-01-10',
    lastReviewDate: '2026-01-17'
  },
  {
    id: 7,
    projectName: 'Data Warehouse & BI Platform',
    projectCode: 'VPB-DWH-BI',
    orgId: 10,
    orgName: 'Văn phòng Bộ',
    status: 'budgeted',
    priority: 'P1',
    estimatedBudget: 2800000000,
    estimatedDuration: '16 months',
    expectedGoLive: '2027-05-01',
    businessValue: 'high',
    roi: 280,
    stakeholders: ['VPB', 'All Vụ/Cục', 'Leadership'],
    dependencies: ['Data integration from all systems', 'BI tool selection'],
    submittedDate: '2025-11-25',
    lastReviewDate: '2026-01-11'
  },
  {
    id: 8,
    projectName: 'Upgrade SAP ERP to S/4HANA',
    projectCode: 'VKHTC-SAP-UPGRADE',
    orgId: 6,
    orgName: 'Vụ Kế hoạch - Tài chính',
    status: 'feasibility',
    priority: 'P0',
    estimatedBudget: 8500000000,
    estimatedDuration: '24 months',
    expectedGoLive: '2028-01-01',
    businessValue: 'critical',
    roi: 160,
    stakeholders: ['VKHTC', 'All departments', 'SAP vendor'],
    dependencies: ['Business process reengineering', 'Change management plan'],
    submittedDate: '2025-12-05',
    lastReviewDate: '2026-01-16'
  }
];

export const mockBudgetTracking: BudgetTracking[] = [
  // 2026 Q1
  { year: 2026, quarter: 'Q1', category: 'development', allocated: 8500000000, committed: 7200000000, spent: 3100000000, forecast: 8200000000, variance: 300000000, variancePercent: 3.5 },
  { year: 2026, quarter: 'Q1', category: 'maintenance', allocated: 5200000000, committed: 4800000000, spent: 2600000000, forecast: 5100000000, variance: 100000000, variancePercent: 1.9 },
  { year: 2026, quarter: 'Q1', category: 'infrastructure', allocated: 3800000000, committed: 3600000000, spent: 1900000000, forecast: 3750000000, variance: 50000000, variancePercent: 1.3 },
  { year: 2026, quarter: 'Q1', category: 'license', allocated: 2100000000, committed: 2100000000, spent: 1800000000, forecast: 2100000000, variance: 0, variancePercent: 0 },
  { year: 2026, quarter: 'Q1', category: 'training', allocated: 850000000, committed: 600000000, spent: 250000000, forecast: 700000000, variance: 150000000, variancePercent: 17.6 },

  // 2026 Q2 (Forecast)
  { year: 2026, quarter: 'Q2', category: 'development', allocated: 9200000000, committed: 6500000000, spent: 0, forecast: 9100000000, variance: 100000000, variancePercent: 1.1 },
  { year: 2026, quarter: 'Q2', category: 'maintenance', allocated: 5500000000, committed: 4200000000, spent: 0, forecast: 5400000000, variance: 100000000, variancePercent: 1.8 },
  { year: 2026, quarter: 'Q2', category: 'infrastructure', allocated: 4200000000, committed: 3100000000, spent: 0, forecast: 4150000000, variance: 50000000, variancePercent: 1.2 },
  { year: 2026, quarter: 'Q2', category: 'license', allocated: 1800000000, committed: 1800000000, spent: 0, forecast: 1800000000, variance: 0, variancePercent: 0 },
  { year: 2026, quarter: 'Q2', category: 'training', allocated: 950000000, committed: 400000000, spent: 0, forecast: 850000000, variance: 100000000, variancePercent: 10.5 },

  // 2025 Q4 (Historical)
  { year: 2025, quarter: 'Q4', category: 'development', allocated: 7800000000, committed: 7500000000, spent: 7200000000, forecast: 7200000000, variance: 600000000, variancePercent: 7.7 },
  { year: 2025, quarter: 'Q4', category: 'maintenance', allocated: 4900000000, committed: 4850000000, spent: 4750000000, forecast: 4750000000, variance: 150000000, variancePercent: 3.1 },
  { year: 2025, quarter: 'Q4', category: 'infrastructure', allocated: 3500000000, committed: 3450000000, spent: 3420000000, forecast: 3420000000, variance: 80000000, variancePercent: 2.3 },
  { year: 2025, quarter: 'Q4', category: 'license', allocated: 2200000000, committed: 2200000000, spent: 2200000000, forecast: 2200000000, variance: 0, variancePercent: 0 },
  { year: 2025, quarter: 'Q4', category: 'training', allocated: 720000000, committed: 680000000, spent: 650000000, forecast: 650000000, variance: 70000000, variancePercent: 9.7 },
];

// Utility functions
export const getRoadmapsByPhase = (phase: SystemRoadmapItem['currentPhase']) => {
  return mockSystemRoadmaps.filter(r => r.currentPhase === phase);
};

export const getPipelineByStatus = (status: PlanningPipeline['status']) => {
  return mockPlanningPipeline.filter(p => p.status === status);
};

export const getBudgetByYearQuarter = (year: number, quarter: BudgetTracking['quarter']) => {
  return mockBudgetTracking.filter(b => b.year === year && b.quarter === quarter);
};
