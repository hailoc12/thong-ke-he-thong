/**
 * Mock data: Approval Workflow & E-Signature
 * For Feature 2
 */

export interface ApprovalStage {
  role: string;
  user: string;
  status: 'approved' | 'reviewing' | 'pending' | 'rejected';
  date: string | null;
  comment?: string;
}

export interface ApprovalRequest {
  id: number;
  systemId: number;
  systemName: string;
  systemCode: string;
  requester: string;
  requesterOrg: string;
  status: 'pending_technical' | 'pending_business' | 'pending_cio' | 'approved' | 'rejected';
  stages: ApprovalStage[];
  daysPending: number;
  urgency: 'critical' | 'high' | 'medium' | 'low';
  submittedDate: string;
  requestType: 'new_system' | 'upgrade' | 'contract_renewal' | 'budget_increase';
  estimatedCost?: number;
}

export const mockApprovalRequests: ApprovalRequest[] = [
  {
    id: 1,
    systemId: 11,
    systemName: 'Cổng Thông tin điện tử Bộ KH&CN (mới)',
    systemCode: 'VPB-PORTAL-NEW',
    requester: 'Nguyễn Văn Minh',
    requesterOrg: 'Văn phòng Bộ',
    status: 'pending_business',
    stages: [
      { role: 'Technical Owner', user: 'Trần Đức Hải - Phó Vụ trưởng CNTT', status: 'approved', date: '2026-01-16', comment: 'Kiến trúc hợp lý, công nghệ phù hợp với xu hướng hiện đại' },
      { role: 'Business Owner', user: 'Lê Thị Thu Hương - Chánh Văn phòng', status: 'reviewing', date: null },
      { role: 'CIO', user: 'Phạm Công Tạc - Thứ trưởng', status: 'pending', date: null }
    ],
    daysPending: 2,
    urgency: 'high',
    submittedDate: '2026-01-14',
    requestType: 'new_system',
    estimatedCost: 2500000000
  },
  {
    id: 2,
    systemId: 25,
    systemName: 'Hệ thống AI Hỗ trợ Đánh giá Đề tài',
    systemCode: 'VKHKT-AI',
    requester: 'Hoàng Minh Tuấn',
    requesterOrg: 'Vụ Khoa học kỹ thuật và công nghệ',
    status: 'approved',
    stages: [
      { role: 'Technical Owner', user: 'Nguyễn Quang Huy', status: 'approved', date: '2026-01-10', comment: 'AI model phù hợp, data pipeline rõ ràng' },
      { role: 'Business Owner', user: 'Vũ Đức Minh - Vụ trưởng', status: 'approved', date: '2026-01-12', comment: 'Giải quyết được pain point trong đánh giá đề tài' },
      { role: 'CIO', user: 'Phạm Công Tạc - Thứ trưởng', status: 'approved', date: '2026-01-15', comment: 'Phê duyệt. Triển khai pilot Q2/2026' }
    ],
    daysPending: 0,
    urgency: 'medium',
    submittedDate: '2026-01-08',
    requestType: 'new_system',
    estimatedCost: 1800000000
  },
  {
    id: 3,
    systemId: 26,
    systemName: 'Hệ thống Blockchain Chứng chỉ số',
    systemCode: 'CVT-BLOCKCHAIN',
    requester: 'Đinh Văn Cường',
    requesterOrg: 'Cục Viễn thông',
    status: 'pending_technical',
    stages: [
      { role: 'Technical Owner', user: 'Trần Đức Hải', status: 'reviewing', date: null },
      { role: 'Business Owner', user: 'Nguyễn Thanh Sơn - Cục trưởng CVT', status: 'pending', date: null },
      { role: 'CIO', user: 'Phạm Công Tạc', status: 'pending', date: null }
    ],
    daysPending: 1,
    urgency: 'medium',
    submittedDate: '2026-01-17',
    requestType: 'new_system',
    estimatedCost: 2200000000
  },
  {
    id: 4,
    systemId: 3,
    systemName: 'Hệ thống Thống kê Khoa học và Công nghệ Quốc gia',
    systemCode: 'VISTA-STATS',
    requester: 'Trương Văn Phúc',
    requesterOrg: 'Cục VISTA',
    status: 'pending_cio',
    stages: [
      { role: 'Technical Owner', user: 'Trần Đức Hải', status: 'approved', date: '2026-01-10', comment: 'Upgrade infrastructure hợp lý' },
      { role: 'Business Owner', user: 'Nguyễn Thanh Tùng - Cục trưởng VISTA', status: 'approved', date: '2026-01-13', comment: 'Cần thiết để tăng performance' },
      { role: 'CIO', user: 'Phạm Công Tạc', status: 'reviewing', date: null }
    ],
    daysPending: 5,
    urgency: 'high',
    submittedDate: '2026-01-11',
    requestType: 'upgrade',
    estimatedCost: 800000000
  },
  {
    id: 5,
    systemId: 15,
    systemName: 'Hệ thống eOffice Văn phòng điện tử',
    systemCode: 'VPB-EOFFICE',
    requester: 'Phan Thị Mai',
    requesterOrg: 'Văn phòng Bộ',
    status: 'approved',
    stages: [
      { role: 'Technical Owner', user: 'Nguyễn Quang Huy', status: 'approved', date: '2025-12-20', comment: 'Gia hạn hợp đồng với FPT' },
      { role: 'Business Owner', user: 'Lê Thị Thu Hương', status: 'approved', date: '2025-12-22', comment: 'Đồng ý gia hạn 2 năm' },
      { role: 'CIO', user: 'Phạm Công Tạc', status: 'approved', date: '2025-12-28', comment: 'Phê duyệt hợp đồng' }
    ],
    daysPending: 0,
    urgency: 'medium',
    submittedDate: '2025-12-18',
    requestType: 'contract_renewal',
    estimatedCost: 1500000000
  },
  {
    id: 6,
    systemId: 6,
    systemName: 'Hệ thống Quản lý Bưu chính',
    systemCode: 'VBC-POST',
    requester: 'Lý Văn Dũng',
    requesterOrg: 'Vụ Bưu chính',
    status: 'rejected',
    stages: [
      { role: 'Technical Owner', user: 'Trần Đức Hải', status: 'approved', date: '2026-01-05', comment: 'Kỹ thuật khả thi' },
      { role: 'Business Owner', user: 'Hoàng Minh Đức - Vụ trưởng VBC', status: 'rejected', date: '2026-01-09', comment: 'Chi phí quá cao, cần nghiên cứu lại phương án rẻ hơn' },
      { role: 'CIO', user: 'Phạm Công Tạc', status: 'pending', date: null }
    ],
    daysPending: 0,
    urgency: 'low',
    submittedDate: '2026-01-03',
    requestType: 'budget_increase',
    estimatedCost: 3000000000
  },
  {
    id: 7,
    systemId: 12,
    systemName: 'Hệ thống Giám sát Bức xạ Môi trường',
    systemCode: 'CATN-MONITOR',
    requester: 'Võ Thanh Tùng',
    requesterOrg: 'Cục An toàn bức xạ và hạt nhân',
    status: 'pending_technical',
    stages: [
      { role: 'Technical Owner', user: 'Nguyễn Quang Huy', status: 'reviewing', date: null, comment: 'Đang đánh giá kiến trúc IoT sensors' },
      { role: 'Business Owner', user: 'Phan Xuân Dũng - Cục trưởng CATN', status: 'pending', date: null },
      { role: 'CIO', user: 'Phạm Công Tạc', status: 'pending', date: null }
    ],
    daysPending: 3,
    urgency: 'critical',
    submittedDate: '2026-01-15',
    requestType: 'upgrade',
    estimatedCost: 4500000000
  },
  {
    id: 8,
    systemId: 18,
    systemName: 'Hệ thống Quản lý Xuất bản In ấn',
    systemCode: 'CXBPT-PMS',
    requester: 'Đỗ Thị Lan',
    requesterOrg: 'Cục Xuất bản, In và Phát hành',
    status: 'pending_business',
    stages: [
      { role: 'Technical Owner', user: 'Trần Đức Hải', status: 'approved', date: '2026-01-14', comment: 'Stack công nghệ ổn định' },
      { role: 'Business Owner', user: 'Nguyễn Ngọc Phương - Cục trưởng', status: 'reviewing', date: null },
      { role: 'CIO', user: 'Phạm Công Tạc', status: 'pending', date: null }
    ],
    daysPending: 4,
    urgency: 'medium',
    submittedDate: '2026-01-13',
    requestType: 'contract_renewal',
    estimatedCost: 900000000
  },
  {
    id: 9,
    systemId: 22,
    systemName: 'Hệ thống Quản lý Tần số Vô tuyến điện',
    systemCode: 'BTTVT-FREQ',
    requester: 'Bùi Hoàng Long',
    requesterOrg: 'Ban Tần số vô tuyến điện',
    status: 'approved',
    stages: [
      { role: 'Technical Owner', user: 'Nguyễn Quang Huy', status: 'approved', date: '2025-12-28', comment: 'Upgrade cần thiết cho 5G planning' },
      { role: 'Business Owner', user: 'Trần Đức Lai - Trưởng ban', status: 'approved', date: '2026-01-02', comment: 'Ưu tiên cao cho 5G' },
      { role: 'CIO', user: 'Phạm Công Tạc', status: 'approved', date: '2026-01-08', comment: 'Phê duyệt ngân sách Q1' }
    ],
    daysPending: 0,
    urgency: 'critical',
    submittedDate: '2025-12-26',
    requestType: 'upgrade',
    estimatedCost: 2800000000
  },
  {
    id: 10,
    systemId: 5,
    systemName: 'Hệ thống Quản lý Đề tài Khoa học',
    systemCode: 'VKHKT-PROJECT',
    requester: 'Ngô Văn Thành',
    requesterOrg: 'Vụ Khoa học kỹ thuật và công nghệ',
    status: 'pending_cio',
    stages: [
      { role: 'Technical Owner', user: 'Trần Đức Hải', status: 'approved', date: '2026-01-08', comment: 'Module AI scoring cần bổ sung' },
      { role: 'Business Owner', user: 'Vũ Đức Minh - Vụ trưởng', status: 'approved', date: '2026-01-12', comment: 'Đồng ý bổ sung tính năng' },
      { role: 'CIO', user: 'Phạm Công Tạc', status: 'reviewing', date: null }
    ],
    daysPending: 6,
    urgency: 'high',
    submittedDate: '2026-01-07',
    requestType: 'budget_increase',
    estimatedCost: 600000000
  },
  {
    id: 11,
    systemId: 20,
    systemName: 'Hệ thống Quản lý Hồ sơ Sở hữu trí tuệ',
    systemCode: 'CSH-IP',
    requester: 'Vương Thị Hằng',
    requesterOrg: 'Cục Sở hữu trí tuệ',
    status: 'pending_business',
    stages: [
      { role: 'Technical Owner', user: 'Nguyễn Quang Huy', status: 'approved', date: '2026-01-16', comment: 'Migrate sang cloud hợp lý' },
      { role: 'Business Owner', user: 'Lê Xuân Thành - Cục trưởng CSH', status: 'reviewing', date: null },
      { role: 'CIO', user: 'Phạm Công Tạc', status: 'pending', date: null }
    ],
    daysPending: 2,
    urgency: 'medium',
    submittedDate: '2026-01-15',
    requestType: 'upgrade',
    estimatedCost: 1200000000
  },
  {
    id: 12,
    systemId: 28,
    systemName: 'Hệ thống Customer Support Chatbot',
    systemCode: 'VPB-CHATBOT',
    requester: 'Trần Minh Quang',
    requesterOrg: 'Văn phòng Bộ',
    status: 'pending_technical',
    stages: [
      { role: 'Technical Owner', user: 'Trần Đức Hải', status: 'reviewing', date: null },
      { role: 'Business Owner', user: 'Lê Thị Thu Hương', status: 'pending', date: null },
      { role: 'CIO', user: 'Phạm Công Tạc', status: 'pending', date: null }
    ],
    daysPending: 7,
    urgency: 'low',
    submittedDate: '2026-01-11',
    requestType: 'new_system',
    estimatedCost: 450000000
  },
  {
    id: 13,
    systemId: 8,
    systemName: 'Hệ thống Quản lý Tài chính Ngân sách',
    systemCode: 'VKHTC-FINANCE',
    requester: 'Phạm Anh Tuấn',
    requesterOrg: 'Vụ Kế hoạch - Tài chính',
    status: 'approved',
    stages: [
      { role: 'Technical Owner', user: 'Nguyễn Quang Huy', status: 'approved', date: '2026-01-05', comment: 'SAP ERP upgrade path rõ ràng' },
      { role: 'Business Owner', user: 'Đinh Văn Thắng - Vụ trưởng', status: 'approved', date: '2026-01-09', comment: 'Critical cho báo cáo năm 2026' },
      { role: 'CIO', user: 'Phạm Công Tạc', status: 'approved', date: '2026-01-14', comment: 'Phê duyệt ưu tiên cao' }
    ],
    daysPending: 0,
    urgency: 'critical',
    submittedDate: '2026-01-03',
    requestType: 'upgrade',
    estimatedCost: 3500000000
  },
  {
    id: 14,
    systemId: 17,
    systemName: 'Hệ thống Quản lý Phát thanh Truyền hình',
    systemCode: 'CPTTB-MEDIA',
    requester: 'Hoàng Thị Bích',
    requesterOrg: 'Cục Phát thanh, Truyền hình và Thông tin điện tử',
    status: 'pending_cio',
    stages: [
      { role: 'Technical Owner', user: 'Trần Đức Hải', status: 'approved', date: '2026-01-10', comment: 'Video streaming infrastructure tốt' },
      { role: 'Business Owner', user: 'Lê Quang Tú Dũng - Cục trưởng', status: 'approved', date: '2026-01-14', comment: 'Upgrade cần thiết cho 4K content' },
      { role: 'CIO', user: 'Phạm Công Tạc', status: 'reviewing', date: null }
    ],
    daysPending: 4,
    urgency: 'high',
    submittedDate: '2026-01-13',
    requestType: 'budget_increase',
    estimatedCost: 2100000000
  },
  {
    id: 15,
    systemId: 13,
    systemName: 'Hệ thống Quản lý Chất lượng ISO',
    systemCode: 'CQLCL-QMS',
    requester: 'Lê Văn Sơn',
    requesterOrg: 'Cục Quản lý Chất lượng',
    status: 'pending_business',
    stages: [
      { role: 'Technical Owner', user: 'Nguyễn Quang Huy', status: 'approved', date: '2026-01-15', comment: 'Tích hợp ISO 9001:2015 compliance' },
      { role: 'Business Owner', user: 'Trần Văn Vinh - Cục trưởng', status: 'reviewing', date: null },
      { role: 'CIO', user: 'Phạm Công Tạc', status: 'pending', date: null }
    ],
    daysPending: 3,
    urgency: 'medium',
    submittedDate: '2026-01-14',
    requestType: 'contract_renewal',
    estimatedCost: 750000000
  },
  {
    id: 16,
    systemId: 21,
    systemName: 'Hệ thống Quản lý Báo chí Truyền thông',
    systemCode: 'CBC-PRESS',
    requester: 'Nguyễn Thanh Hải',
    requesterOrg: 'Cục Báo chí',
    status: 'pending_technical',
    stages: [
      { role: 'Technical Owner', user: 'Trần Đức Hải', status: 'reviewing', date: null },
      { role: 'Business Owner', user: 'Lê Quang Hồ - Cục trưởng CBC', status: 'pending', date: null },
      { role: 'CIO', user: 'Phạm Công Tạc', status: 'pending', date: null }
    ],
    daysPending: 1,
    urgency: 'low',
    submittedDate: '2026-01-17',
    requestType: 'new_system',
    estimatedCost: 980000000
  },
  {
    id: 17,
    systemId: 9,
    systemName: 'Hệ thống Quản lý Nhân sự Tổ chức',
    systemCode: 'VTCCB-HRM',
    requester: 'Đặng Thị Phương',
    requesterOrg: 'Vụ Tổ chức cán bộ',
    status: 'approved',
    stages: [
      { role: 'Technical Owner', user: 'Nguyễn Quang Huy', status: 'approved', date: '2026-01-06', comment: 'Oracle HCM Cloud migration plan tốt' },
      { role: 'Business Owner', user: 'Bùi Thế Dũng - Vụ trưởng', status: 'approved', date: '2026-01-10', comment: 'Cần thiết cho digital HR transformation' },
      { role: 'CIO', user: 'Phạm Công Tạc', status: 'approved', date: '2026-01-15', comment: 'Phê duyệt. Triển khai từ Q2' }
    ],
    daysPending: 0,
    urgency: 'high',
    submittedDate: '2026-01-04',
    requestType: 'upgrade',
    estimatedCost: 2400000000
  },
  {
    id: 18,
    systemId: 27,
    systemName: 'Hệ thống Business Intelligence Dashboard',
    systemCode: 'VPB-BI',
    requester: 'Vũ Minh Châu',
    requesterOrg: 'Văn phòng Bộ',
    status: 'pending_business',
    stages: [
      { role: 'Technical Owner', user: 'Trần Đức Hải', status: 'approved', date: '2026-01-16', comment: 'Power BI + Azure stack phù hợp' },
      { role: 'Business Owner', user: 'Lê Thị Thu Hương', status: 'reviewing', date: null },
      { role: 'CIO', user: 'Phạm Công Tạc', status: 'pending', date: null }
    ],
    daysPending: 2,
    urgency: 'medium',
    submittedDate: '2026-01-15',
    requestType: 'new_system',
    estimatedCost: 1100000000
  }
];
