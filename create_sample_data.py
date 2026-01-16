#!/usr/bin/env python3
"""
Create Sample Data for Thống kê Hệ thống
Based on real organizational units of Ministry of Science and Technology (Bộ KH&CN)

Data sources:
- Nghị định 55/2025/NĐ-CP (March 2, 2025)
- Quyết định 37/QĐ-TTg (January 8, 2026)
- https://mst.gov.vn/
"""

import json
from datetime import date

# ==================== ORGANIZATIONS ====================
# Based on real units from Bộ Khoa học và Công nghệ

ORGANIZATIONS = [
    {
        "code": "VPBO",
        "name": "Văn phòng Bộ",
        "description": "Tham mưu, giúp Bộ trưởng chỉ đạo, điều hành công tác văn thư, lưu trữ, hành chính, tổ chức hội nghị và các hoạt động chung của Bộ",
        "contact_person": "Nguyễn Văn A",
        "contact_email": "vanphong@most.gov.vn",
        "contact_phone": "024 3943 8970"
    },
    {
        "code": "TTBO",
        "name": "Thanh tra Bộ",
        "description": "Thực hiện chức năng thanh tra, kiểm tra việc chấp hành các quy định pháp luật, giải quyết khiếu nại tố cáo thuộc lĩnh vực quản lý của Bộ",
        "contact_person": "Trần Thị B",
        "contact_email": "thanhtra@most.gov.vn",
        "contact_phone": "024 3943 7200"
    },
    {
        "code": "VKHKTCN",
        "name": "Vụ Khoa học kỹ thuật và công nghệ",
        "description": "Quản lý, phát triển khoa học kỹ thuật và công nghệ, đánh giá và thẩm định các đề tài, dự án nghiên cứu khoa học",
        "contact_person": "Nguyễn Phú Hùng",
        "contact_email": "vanthu_cn@mst.gov.vn",
        "contact_phone": "024 3943 7100"
    },
    {
        "code": "VKHTC",
        "name": "Vụ Kế hoạch - Tài chính",
        "description": "Tham mưu về kế hoạch phát triển, quản lý tài chính, ngân sách, báo cáo thống kê tổng hợp của Bộ",
        "contact_person": "Lê Văn C",
        "contact_email": "kehoach@most.gov.vn",
        "contact_phone": "024 3943 7300"
    },
    {
        "code": "VTCCB",
        "name": "Vụ Tổ chức cán bộ",
        "description": "Quản lý tổ chức bộ máy, công tác cán bộ, đào tạo, bồi dưỡng công chức, viên chức của Bộ",
        "contact_person": "Hoàng Thị D",
        "contact_email": "tochuc@most.gov.vn",
        "contact_phone": "024 3943 7400"
    },
    {
        "code": "CATBXHN",
        "name": "Cục An toàn bức xạ và hạt nhân",
        "description": "Quản lý nhà nước về an toàn bức xạ và hạt nhân, cấp phép, thanh tra, kiểm soát các hoạt động sử dụng năng lượng nguyên tử",
        "contact_person": "Vũ Văn E",
        "contact_email": "varans@most.gov.vn",
        "contact_phone": "024 3942 4418"
    },
    {
        "code": "CSHTT",
        "name": "Cục Sở hữu trí tuệ",
        "description": "Quản lý nhà nước về sở hữu trí tuệ, thẩm định và cấp văn bằng bảo hộ sáng chế, nhãn hiệu, kiểu dáng công nghiệp",
        "contact_person": "Đinh Hữu Phí",
        "contact_email": "noip@most.gov.vn",
        "contact_phone": "024 3858 3069"
    },
    {
        "code": "VNLNTV",
        "name": "Viện Năng lượng nguyên tử Việt Nam",
        "description": "Nghiên cứu ứng dụng năng lượng nguyên tử trong y tế, nông nghiệp, công nghiệp và đào tạo nhân lực chuyên ngành hạt nhân",
        "contact_person": "Nguyễn Năng Hiếu",
        "contact_email": "vinatom@vinatom.gov.vn",
        "contact_phone": "024 3835 6347"
    },
    {
        "code": "VDMSTQG",
        "name": "Viện Đổi mới sáng tạo Quốc gia",
        "description": "Nghiên cứu, tư vấn chính sách đổi mới sáng tạo, hỗ trợ doanh nghiệp khởi nghiệp đổi mới sáng tạo, chuyển giao công nghệ",
        "contact_person": "Trần Văn F",
        "contact_email": "contact@nii.gov.vn",
        "contact_phone": "024 3852 3456"
    },
    {
        "code": "HVCNBCVT",
        "name": "Học viện Công nghệ Bưu chính Viễn thông",
        "description": "Đào tạo đại học, sau đại học và nghiên cứu khoa học trong lĩnh vực công nghệ thông tin, điện tử viễn thông",
        "contact_person": "Nguyễn Hữu Thanh",
        "contact_email": "dhbk@ptit.edu.vn",
        "contact_phone": "024 3577 1163"
    },
    {
        "code": "QPTKHCNCNQG",
        "name": "Quỹ Phát triển khoa học và công nghệ quốc gia",
        "description": "Tài trợ và đầu tư cho các hoạt động nghiên cứu khoa học, phát triển công nghệ và đổi mới sáng tạo",
        "contact_person": "Phan Đăng Tuất",
        "contact_email": "info@nafosted.gov.vn",
        "contact_phone": "024 3756 8033"
    },
    {
        "code": "VHTQT",
        "name": "Vụ Hợp tác quốc tế",
        "description": "Tham mưu về hợp tác quốc tế, quản lý các chương trình, dự án hợp tác song phương và đa phương trong lĩnh vực khoa học và công nghệ",
        "contact_person": "Trần Thị G",
        "contact_email": "hoptac@most.gov.vn",
        "contact_phone": "024 3943 7500"
    }
]

# ==================== SYSTEMS ====================
# Realistic government systems based on common ministry needs

SYSTEMS = [
    {
        "org_code": "VPBO",
        "system_code": "QLVB-001",
        "system_name": "Hệ thống Quản lý văn bản điện tử",
        "system_name_en": "Electronic Document Management System",
        "purpose": "Quản lý toàn bộ văn bản đi, đến, nội bộ của Bộ. Hỗ trợ ký số, luân chuyển văn bản điện tử giữa các đơn vị",
        "scope": "org_wide",
        "target_users": ["leader", "staff"],
        "system_group": "business",
        "status": "operating",
        "go_live_date": "2022-03-15",
        "current_version": "3.2.1",
        "business_owner": "Chánh Văn phòng Bộ",
        "technical_owner": "Trung tâm Công nghệ thông tin",
        "responsible_person": "Nguyễn Văn A",
        "responsible_phone": "024 3943 8970",
        "responsible_email": "vanphong@most.gov.vn",
        "users_total": 850,
        "users_mau": 650,
        "users_dau": 180,
        "num_organizations": 25,
        "criticality_level": "critical"
    },
    {
        "org_code": "VKHKTCN",
        "system_code": "QLDT-002",
        "system_name": "Hệ thống Quản lý đề tài nghiên cứu khoa học",
        "system_name_en": "R&D Project Management System",
        "purpose": "Quản lý toàn bộ vòng đời đề tài nghiên cứu: từ đăng ký, thẩm định, phê duyệt, theo dõi tiến độ, đến nghiệm thu và thanh quyết toán",
        "scope": "org_wide",
        "target_users": ["staff", "business"],
        "system_group": "business",
        "status": "operating",
        "go_live_date": "2021-09-01",
        "current_version": "2.5.0",
        "business_owner": "Vụ trưởng Vụ KHKT&CN",
        "technical_owner": "Trung tâm Công nghệ thông tin",
        "responsible_person": "Nguyễn Phú Hùng",
        "responsible_phone": "024 3943 7100",
        "responsible_email": "vanthu_cn@mst.gov.vn",
        "users_total": 1200,
        "users_mau": 800,
        "users_dau": 150,
        "num_organizations": 14,
        "criticality_level": "high"
    },
    {
        "org_code": "VPBO",
        "system_code": "PORTAL-003",
        "system_name": "Cổng thông tin điện tử Bộ KH&CN",
        "system_name_en": "MOST Official Web Portal",
        "purpose": "Cung cấp thông tin chính thức về chính sách, hoạt động của Bộ đến công chúng. Cung cấp dịch vụ công trực tuyến mức độ 3 và 4",
        "scope": "external",
        "target_users": ["citizen", "business", "staff"],
        "system_group": "portal",
        "status": "operating",
        "go_live_date": "2020-06-15",
        "current_version": "4.1.2",
        "business_owner": "Chánh Văn phòng Bộ",
        "technical_owner": "Trung tâm Công nghệ thông tin",
        "responsible_person": "Nguyễn Văn A",
        "responsible_phone": "024 3943 8970",
        "responsible_email": "vanphong@most.gov.vn",
        "users_total": 45000,
        "users_mau": 28000,
        "users_dau": 3500,
        "num_organizations": 1,
        "criticality_level": "critical"
    },
    {
        "org_code": "CSHTT",
        "system_code": "IPVN-004",
        "system_name": "Hệ thống Quản lý sở hữu trí tuệ quốc gia",
        "system_name_en": "National Intellectual Property Management System",
        "purpose": "Tiếp nhận, thẩm định và cấp văn bằng bảo hộ sáng chế, giải pháp hữu ích, kiểu dáng công nghiệp, nhãn hiệu. Tra cứu thông tin sở hữu trí tuệ",
        "scope": "external",
        "target_users": ["business", "citizen", "staff"],
        "system_group": "business",
        "status": "operating",
        "go_live_date": "2019-11-20",
        "current_version": "5.3.0",
        "business_owner": "Cục trưởng Cục Sở hữu trí tuệ",
        "technical_owner": "Viện Sở hữu trí tuệ quốc gia",
        "responsible_person": "Đinh Hữu Phí",
        "responsible_phone": "024 3858 3069",
        "responsible_email": "noip@most.gov.vn",
        "users_total": 35000,
        "users_mau": 18000,
        "users_dau": 1800,
        "num_organizations": 1,
        "criticality_level": "high"
    },
    {
        "org_code": "VKHTC",
        "system_code": "BCTK-005",
        "system_name": "Hệ thống Báo cáo thống kê tổng hợp",
        "system_name_en": "Consolidated Reporting and Statistics System",
        "purpose": "Thu thập, tổng hợp và phân tích số liệu báo cáo từ các đơn vị trực thuộc. Tạo báo cáo định kỳ cho Lãnh đạo Bộ và Chính phủ",
        "scope": "org_wide",
        "target_users": ["leader", "staff"],
        "system_group": "bi",
        "status": "operating",
        "go_live_date": "2023-01-10",
        "current_version": "1.8.0",
        "business_owner": "Vụ trưởng Vụ Kế hoạch - Tài chính",
        "technical_owner": "Trung tâm Công nghệ thông tin",
        "responsible_person": "Lê Văn C",
        "responsible_phone": "024 3943 7300",
        "responsible_email": "kehoach@most.gov.vn",
        "users_total": 320,
        "users_mau": 280,
        "users_dau": 95,
        "num_organizations": 25,
        "criticality_level": "high"
    }
]


def generate_sql():
    """Generate SQL INSERT statements"""

    sql_statements = []

    # Header
    sql_statements.append("-- Sample Data for Thống kê Hệ thống")
    sql_statements.append("-- Based on real Ministry of Science and Technology organizational units")
    sql_statements.append("-- Generated: 2026-01-17")
    sql_statements.append("")
    sql_statements.append("BEGIN;")
    sql_statements.append("")

    # Organizations
    sql_statements.append("-- ==================== ORGANIZATIONS ====================")
    sql_statements.append("")

    for org in ORGANIZATIONS:
        sql = f"""INSERT INTO organizations (code, name, description, contact_person, contact_email, contact_phone, created_at, updated_at)
VALUES ('{org['code']}', '{org['name']}', '{org['description']}', '{org['contact_person']}', '{org['contact_email']}', '{org['contact_phone']}', NOW(), NOW());"""
        sql_statements.append(sql)
        sql_statements.append("")

    # Systems
    sql_statements.append("-- ==================== SYSTEMS ====================")
    sql_statements.append("")

    for system in SYSTEMS:
        target_users_json = json.dumps(system['target_users'])

        sql = f"""INSERT INTO systems (
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
    (SELECT id FROM organizations WHERE code = '{system['org_code']}'),
    '{system['system_code']}',
    '{system['system_name']}',
    '{system['system_name_en']}',
    '{system['purpose']}',
    '{system['scope']}',
    '{target_users_json}'::jsonb,
    '{system['system_group']}',
    '{system['status']}',
    '{system['go_live_date']}',
    '{system['current_version']}',
    '[]'::jsonb,
    '{system['business_owner']}',
    '{system['technical_owner']}',
    '{system['responsible_person']}',
    '{system['responsible_phone']}',
    '{system['responsible_email']}',
    {system['users_total']},
    {system['users_mau']},
    {system['users_dau']},
    {system['num_organizations']},
    '{system['criticality_level']}',
    1,
    NOW(),
    NOW()
);"""
        sql_statements.append(sql)
        sql_statements.append("")

    sql_statements.append("COMMIT;")

    return "\n".join(sql_statements)


def generate_summary():
    """Generate summary markdown"""

    summary = []
    summary.append("# Sample Data Summary")
    summary.append("")
    summary.append("## Organizations (12 units)")
    summary.append("")
    summary.append("| Code | Name | Type |")
    summary.append("|------|------|------|")

    for org in ORGANIZATIONS:
        org_type = "Vụ" if org['code'].startswith('V') else \
                   "Cục" if org['code'].startswith('C') else \
                   "Viện" if org['code'].startswith('V') and 'Viện' in org['name'] else \
                   "Học viện" if 'Học viện' in org['name'] else \
                   "Quỹ" if 'Quỹ' in org['name'] else "Văn phòng/Thanh tra"
        summary.append(f"| {org['code']} | {org['name']} | {org_type} |")

    summary.append("")
    summary.append("## Systems (5 systems)")
    summary.append("")
    summary.append("| Code | Name | Organization | Type |")
    summary.append("|------|------|--------------|------|")

    for system in SYSTEMS:
        org_name = next(o['name'] for o in ORGANIZATIONS if o['code'] == system['org_code'])
        summary.append(f"| {system['system_code']} | {system['system_name']} | {org_name} | {system['system_group']} |")

    summary.append("")
    summary.append("## Data Sources")
    summary.append("")
    summary.append("- [Nghị định 55/2025/NĐ-CP](https://thuvienphapluat.vn/van-ban/Bo-may-hanh-chinh/Nghi-dinh-55-2025-ND-CP-chuc-nang-nhiem-vu-quyen-han-va-co-cau-to-chuc-Bo-Khoa-hoc-va-Cong-nghe-645212.aspx)")
    summary.append("- [Quyết định 37/QĐ-TTg](https://baochinhphu.vn/danh-sach-14-don-vi-su-nghiep-cong-lap-truc-thuoc-bo-khoa-hoc-va-cong-nghe-102260108163457314.htm)")
    summary.append("- [Cổng thông tin Bộ KH&CN](https://mst.gov.vn/)")
    summary.append("")

    return "\n".join(summary)


if __name__ == "__main__":
    # Generate SQL
    sql_content = generate_sql()
    with open("sample_data.sql", "w", encoding="utf-8") as f:
        f.write(sql_content)
    print("✅ Generated: sample_data.sql")

    # Generate Summary
    summary_content = generate_summary()
    with open("sample_data_summary.md", "w", encoding="utf-8") as f:
        f.write(summary_content)
    print("✅ Generated: sample_data_summary.md")

    print(f"\n📊 Summary:")
    print(f"   - Organizations: {len(ORGANIZATIONS)}")
    print(f"   - Systems: {len(SYSTEMS)}")
    print(f"\n🚀 Next: Execute sample_data.sql on the server")
