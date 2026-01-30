-- Sample Data for Thống kê Hệ thống
-- Based on real Ministry of Science and Technology organizational units
-- Generated: 2026-01-17

BEGIN;

-- ==================== ORGANIZATIONS ====================

INSERT INTO organizations (code, name, description, contact_person, contact_email, contact_phone, created_at, updated_at)
VALUES ('VPBO', 'Văn phòng Bộ', 'Tham mưu, giúp Bộ trưởng chỉ đạo, điều hành công tác văn thư, lưu trữ, hành chính, tổ chức hội nghị và các hoạt động chung của Bộ', 'Nguyễn Văn A', 'vanphong@most.gov.vn', '024 3943 8970', NOW(), NOW());

INSERT INTO organizations (code, name, description, contact_person, contact_email, contact_phone, created_at, updated_at)
VALUES ('TTBO', 'Thanh tra Bộ', 'Thực hiện chức năng thanh tra, kiểm tra việc chấp hành các quy định pháp luật, giải quyết khiếu nại tố cáo thuộc lĩnh vực quản lý của Bộ', 'Trần Thị B', 'thanhtra@most.gov.vn', '024 3943 7200', NOW(), NOW());

INSERT INTO organizations (code, name, description, contact_person, contact_email, contact_phone, created_at, updated_at)
VALUES ('VKHKTCN', 'Vụ Khoa học kỹ thuật và công nghệ', 'Quản lý, phát triển khoa học kỹ thuật và công nghệ, đánh giá và thẩm định các đề tài, dự án nghiên cứu khoa học', 'Nguyễn Phú Hùng', 'vanthu_cn@mst.gov.vn', '024 3943 7100', NOW(), NOW());

INSERT INTO organizations (code, name, description, contact_person, contact_email, contact_phone, created_at, updated_at)
VALUES ('VKHTC', 'Vụ Kế hoạch - Tài chính', 'Tham mưu về kế hoạch phát triển, quản lý tài chính, ngân sách, báo cáo thống kê tổng hợp của Bộ', 'Lê Văn C', 'kehoach@most.gov.vn', '024 3943 7300', NOW(), NOW());

INSERT INTO organizations (code, name, description, contact_person, contact_email, contact_phone, created_at, updated_at)
VALUES ('VTCCB', 'Vụ Tổ chức cán bộ', 'Quản lý tổ chức bộ máy, công tác cán bộ, đào tạo, bồi dưỡng công chức, viên chức của Bộ', 'Hoàng Thị D', 'tochuc@most.gov.vn', '024 3943 7400', NOW(), NOW());

INSERT INTO organizations (code, name, description, contact_person, contact_email, contact_phone, created_at, updated_at)
VALUES ('CATBXHN', 'Cục An toàn bức xạ và hạt nhân', 'Quản lý nhà nước về an toàn bức xạ và hạt nhân, cấp phép, thanh tra, kiểm soát các hoạt động sử dụng năng lượng nguyên tử', 'Vũ Văn E', 'varans@most.gov.vn', '024 3942 4418', NOW(), NOW());

INSERT INTO organizations (code, name, description, contact_person, contact_email, contact_phone, created_at, updated_at)
VALUES ('CSHTT', 'Cục Sở hữu trí tuệ', 'Quản lý nhà nước về sở hữu trí tuệ, thẩm định và cấp văn bằng bảo hộ sáng chế, nhãn hiệu, kiểu dáng công nghiệp', 'Đinh Hữu Phí', 'noip@most.gov.vn', '024 3858 3069', NOW(), NOW());

INSERT INTO organizations (code, name, description, contact_person, contact_email, contact_phone, created_at, updated_at)
VALUES ('VNLNTV', 'Viện Năng lượng nguyên tử Việt Nam', 'Nghiên cứu ứng dụng năng lượng nguyên tử trong y tế, nông nghiệp, công nghiệp và đào tạo nhân lực chuyên ngành hạt nhân', 'Nguyễn Năng Hiếu', 'vinatom@vinatom.gov.vn', '024 3835 6347', NOW(), NOW());

INSERT INTO organizations (code, name, description, contact_person, contact_email, contact_phone, created_at, updated_at)
VALUES ('VDMSTQG', 'Viện Đổi mới sáng tạo Quốc gia', 'Nghiên cứu, tư vấn chính sách đổi mới sáng tạo, hỗ trợ doanh nghiệp khởi nghiệp đổi mới sáng tạo, chuyển giao công nghệ', 'Trần Văn F', 'contact@nii.gov.vn', '024 3852 3456', NOW(), NOW());

INSERT INTO organizations (code, name, description, contact_person, contact_email, contact_phone, created_at, updated_at)
VALUES ('HVCNBCVT', 'Học viện Công nghệ Bưu chính Viễn thông', 'Đào tạo đại học, sau đại học và nghiên cứu khoa học trong lĩnh vực công nghệ thông tin, điện tử viễn thông', 'Nguyễn Hữu Thanh', 'dhbk@ptit.edu.vn', '024 3577 1163', NOW(), NOW());

INSERT INTO organizations (code, name, description, contact_person, contact_email, contact_phone, created_at, updated_at)
VALUES ('QPTKHCNCNQG', 'Quỹ Phát triển khoa học và công nghệ quốc gia', 'Tài trợ và đầu tư cho các hoạt động nghiên cứu khoa học, phát triển công nghệ và đổi mới sáng tạo', 'Phan Đăng Tuất', 'info@nafosted.gov.vn', '024 3756 8033', NOW(), NOW());

INSERT INTO organizations (code, name, description, contact_person, contact_email, contact_phone, created_at, updated_at)
VALUES ('VHTQT', 'Vụ Hợp tác quốc tế', 'Tham mưu về hợp tác quốc tế, quản lý các chương trình, dự án hợp tác song phương và đa phương trong lĩnh vực khoa học và công nghệ', 'Trần Thị G', 'hoptac@most.gov.vn', '024 3943 7500', NOW(), NOW());

-- ==================== SYSTEMS ====================

INSERT INTO systems (
    org_id,
    system_code,
    system_name,
    system_name_en,
    purpose,
    scope,
    target_users,
    system_group,
    status,
    go_live_date,
    current_version,
    upgrade_history,
    business_owner,
    technical_owner,
    responsible_person,
    responsible_phone,
    responsible_email,
    users_total,
    users_mau,
    users_dau,
    num_organizations,
    criticality_level,
    form_level,
    created_at,
    updated_at
)
VALUES (
    (SELECT id FROM organizations WHERE code = 'VPBO'),
    'QLVB-001',
    'Hệ thống Quản lý văn bản điện tử',
    'Electronic Document Management System',
    'Quản lý toàn bộ văn bản đi, đến, nội bộ của Bộ. Hỗ trợ ký số, luân chuyển văn bản điện tử giữa các đơn vị',
    'org_wide',
    '["leader", "staff"]'::jsonb,
    'business',
    'operating',
    '2022-03-15',
    '3.2.1',
    '[]'::jsonb,
    'Chánh Văn phòng Bộ',
    'Trung tâm Công nghệ thông tin',
    'Nguyễn Văn A',
    '024 3943 8970',
    'vanphong@most.gov.vn',
    850,
    650,
    180,
    25,
    'critical',
    1,
    NOW(),
    NOW()
);

INSERT INTO systems (
    org_id,
    system_code,
    system_name,
    system_name_en,
    purpose,
    scope,
    target_users,
    system_group,
    status,
    go_live_date,
    current_version,
    upgrade_history,
    business_owner,
    technical_owner,
    responsible_person,
    responsible_phone,
    responsible_email,
    users_total,
    users_mau,
    users_dau,
    num_organizations,
    criticality_level,
    form_level,
    created_at,
    updated_at
)
VALUES (
    (SELECT id FROM organizations WHERE code = 'VKHKTCN'),
    'QLDT-002',
    'Hệ thống Quản lý đề tài nghiên cứu khoa học',
    'R&D Project Management System',
    'Quản lý toàn bộ vòng đời đề tài nghiên cứu: từ đăng ký, thẩm định, phê duyệt, theo dõi tiến độ, đến nghiệm thu và thanh quyết toán',
    'org_wide',
    '["staff", "business"]'::jsonb,
    'business',
    'operating',
    '2021-09-01',
    '2.5.0',
    '[]'::jsonb,
    'Vụ trưởng Vụ KHKT&CN',
    'Trung tâm Công nghệ thông tin',
    'Nguyễn Phú Hùng',
    '024 3943 7100',
    'vanthu_cn@mst.gov.vn',
    1200,
    800,
    150,
    14,
    'high',
    1,
    NOW(),
    NOW()
);

INSERT INTO systems (
    org_id,
    system_code,
    system_name,
    system_name_en,
    purpose,
    scope,
    target_users,
    system_group,
    status,
    go_live_date,
    current_version,
    upgrade_history,
    business_owner,
    technical_owner,
    responsible_person,
    responsible_phone,
    responsible_email,
    users_total,
    users_mau,
    users_dau,
    num_organizations,
    criticality_level,
    form_level,
    created_at,
    updated_at
)
VALUES (
    (SELECT id FROM organizations WHERE code = 'VPBO'),
    'PORTAL-003',
    'Cổng thông tin điện tử Bộ KH&CN',
    'MOST Official Web Portal',
    'Cung cấp thông tin chính thức về chính sách, hoạt động của Bộ đến công chúng. Cung cấp dịch vụ công trực tuyến mức độ 3 và 4',
    'external',
    '["citizen", "business", "staff"]'::jsonb,
    'portal',
    'operating',
    '2020-06-15',
    '4.1.2',
    '[]'::jsonb,
    'Chánh Văn phòng Bộ',
    'Trung tâm Công nghệ thông tin',
    'Nguyễn Văn A',
    '024 3943 8970',
    'vanphong@most.gov.vn',
    45000,
    28000,
    3500,
    1,
    'critical',
    1,
    NOW(),
    NOW()
);

INSERT INTO systems (
    org_id,
    system_code,
    system_name,
    system_name_en,
    purpose,
    scope,
    target_users,
    system_group,
    status,
    go_live_date,
    current_version,
    upgrade_history,
    business_owner,
    technical_owner,
    responsible_person,
    responsible_phone,
    responsible_email,
    users_total,
    users_mau,
    users_dau,
    num_organizations,
    criticality_level,
    form_level,
    created_at,
    updated_at
)
VALUES (
    (SELECT id FROM organizations WHERE code = 'CSHTT'),
    'IPVN-004',
    'Hệ thống Quản lý sở hữu trí tuệ quốc gia',
    'National Intellectual Property Management System',
    'Tiếp nhận, thẩm định và cấp văn bằng bảo hộ sáng chế, giải pháp hữu ích, kiểu dáng công nghiệp, nhãn hiệu. Tra cứu thông tin sở hữu trí tuệ',
    'external',
    '["business", "citizen", "staff"]'::jsonb,
    'business',
    'operating',
    '2019-11-20',
    '5.3.0',
    '[]'::jsonb,
    'Cục trưởng Cục Sở hữu trí tuệ',
    'Viện Sở hữu trí tuệ quốc gia',
    'Đinh Hữu Phí',
    '024 3858 3069',
    'noip@most.gov.vn',
    35000,
    18000,
    1800,
    1,
    'high',
    1,
    NOW(),
    NOW()
);

INSERT INTO systems (
    org_id,
    system_code,
    system_name,
    system_name_en,
    purpose,
    scope,
    target_users,
    system_group,
    status,
    go_live_date,
    current_version,
    upgrade_history,
    business_owner,
    technical_owner,
    responsible_person,
    responsible_phone,
    responsible_email,
    users_total,
    users_mau,
    users_dau,
    num_organizations,
    criticality_level,
    form_level,
    created_at,
    updated_at
)
VALUES (
    (SELECT id FROM organizations WHERE code = 'VKHTC'),
    'BCTK-005',
    'Hệ thống Báo cáo thống kê tổng hợp',
    'Consolidated Reporting and Statistics System',
    'Thu thập, tổng hợp và phân tích số liệu báo cáo từ các đơn vị trực thuộc. Tạo báo cáo định kỳ cho Lãnh đạo Bộ và Chính phủ',
    'org_wide',
    '["leader", "staff"]'::jsonb,
    'bi',
    'operating',
    '2023-01-10',
    '1.8.0',
    '[]'::jsonb,
    'Vụ trưởng Vụ Kế hoạch - Tài chính',
    'Trung tâm Công nghệ thông tin',
    'Lê Văn C',
    '024 3943 7300',
    'kehoach@most.gov.vn',
    320,
    280,
    95,
    25,
    'high',
    1,
    NOW(),
    NOW()
);

COMMIT;