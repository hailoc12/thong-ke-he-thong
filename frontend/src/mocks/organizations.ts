/**
 * Mock data: Organizations (Các đơn vị trực thuộc Bộ KH&CN)
 * Based on Nghị định 55/2025/NĐ-CP
 */

export const mockOrganizations = [
  // Các Vụ
  { id: 1, code: 'VBC', name: 'Vụ Bưu chính', type: 'Vụ' },
  { id: 2, code: 'VĐTTCN', name: 'Vụ Đánh giá và Thẩm định công nghệ', type: 'Vụ' },
  { id: 3, code: 'VKHKTCN', name: 'Vụ Khoa học kỹ thuật và công nghệ', type: 'Vụ' },
  { id: 4, code: 'VKHXH', name: 'Vụ Khoa học Xã hội, Nhân văn và Tự nhiên', type: 'Vụ' },
  { id: 5, code: 'VKTXHS', name: 'Vụ Kinh tế và Xã hội số', type: 'Vụ' },
  { id: 6, code: 'VKHTC', name: 'Vụ Kế hoạch - Tài chính', type: 'Vụ' },
  { id: 7, code: 'VHQT', name: 'Vụ Hợp tác quốc tế', type: 'Vụ' },
  { id: 8, code: 'VPC', name: 'Vụ Pháp chế', type: 'Vụ' },
  { id: 9, code: 'VTCCB', name: 'Vụ Tổ chức cán bộ', type: 'Vụ' },

  // Văn phòng, Thanh tra
  { id: 10, code: 'VPB', name: 'Văn phòng Bộ', type: 'Văn phòng' },
  { id: 11, code: 'TTB', name: 'Thanh tra Bộ', type: 'Thanh tra' },

  // Các Cục
  { id: 12, code: 'CATN', name: 'Cục An toàn bức xạ và hạt nhân', type: 'Cục' },
  { id: 13, code: 'CBCTW', name: 'Cục Bưu điện Trung ương', type: 'Cục' },
  { id: 14, code: 'VISTA', name: 'Cục Thông tin, Thống kê Khoa học và Công nghệ', type: 'Cục' },
  { id: 15, code: 'CVT', name: 'Cục Viễn thông', type: 'Cục' },
  { id: 16, code: 'CPTTB', name: 'Cục Phát thanh, Truyền hình và Thông tin điện tử', type: 'Cục' },
  { id: 17, code: 'CBC', name: 'Cục Báo chí', type: 'Cục' },
  { id: 18, code: 'CXBPTXB', name: 'Cục Xuất bản, In và Phát hành', type: 'Cục' },
  { id: 19, code: 'CSH', name: 'Cục Sở hữu trí tuệ', type: 'Cục' },
  { id: 20, code: 'CQLCL', name: 'Cục Quản lý Chất lượng', type: 'Cục' },

  // Tổng cục
  { id: 21, code: 'TCĐLVN', name: 'Tổng cục Đo lường Chất lượng Việt Nam', type: 'Tổng cục' },
  { id: 22, code: 'TCNLVN', name: 'Tổng cục Năng lượng nguyên tử Việt Nam', type: 'Tổng cục' },

  // Đơn vị sự nghiệp
  { id: 23, code: 'VAST', name: 'Viện Hàn lâm Khoa học và Công nghệ Việt Nam', type: 'Viện' },
  { id: 24, code: 'BTTVT', name: 'Ban Tần số vô tuyến điện', type: 'Ban' },
  { id: 25, code: 'CTTĐT', name: 'Cổng Thông tin điện tử Bộ', type: 'Đơn vị sự nghiệp' },
];

export const getOrganizationById = (id: number) => {
  return mockOrganizations.find(org => org.id === id);
};

export const getOrganizationByCode = (code: string) => {
  return mockOrganizations.find(org => org.code === code);
};
