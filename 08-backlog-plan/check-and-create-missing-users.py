#!/usr/bin/env python3
"""
Script to check database state and create missing users
Requires: openpyxl (pip install openpyxl)
"""
import sys
import os

# Add Django project to path
sys.path.insert(0, '/Users/shimazu/Dropbox/9. active/consultant/support_b4t/thong_ke_he_thong/backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')

import django
django.setup()

from django.contrib.auth import get_user_model
from apps.organizations.models import Organization
import openpyxl

User = get_user_model()

print("=" * 80)
print("KIỂM TRA VÀ TẠO USER CHO CÁC ĐƠN VỊ")
print("=" * 80)
print()

# Step 1: Count total organizations
total_orgs = Organization.objects.count()
print(f"1️⃣  TỔNG SỐ ĐỚN VỊ: {total_orgs}")
print()

# Step 2: Count users with role 'org_user'
total_org_users = User.objects.filter(role='org_user').count()
print(f"2️⃣  TỔNG SỐ USER TYPE ĐƠN VỊ (role='org_user'): {total_org_users}")
print()

# Step 3: Read Excel file to get expected users
print("📖 Đọc file Excel: danh-sach-tai-khoan-don-vi-ok.xlsx")
excel_path = '/Users/shimazu/Dropbox/9. active/consultant/support_b4t/thong_ke_he_thong/03-research/danh-sach-tai-khoan-don-vi-ok.xlsx'

try:
    wb = openpyxl.load_workbook(excel_path)
    ws = wb.active

    # Assuming structure: Column A = Org Name, Column B = Username, Column C = Password
    # Skip header row
    expected_users = {}
    for row in ws.iter_rows(min_row=2, values_only=True):
        if row[0] and row[1]:  # Has org name and username
            org_name = str(row[0]).strip()
            username = str(row[1]).strip()
            password = str(row[2]).strip() if row[2] else 'ThongkeCDS@2026#'
            expected_users[username] = {
                'org_name': org_name,
                'password': password
            }

    print(f"✅ Đọc được {len(expected_users)} user từ Excel")
    print()

except Exception as e:
    print(f"❌ LỖI đọc file Excel: {e}")
    print("Sử dụng danh sách mặc định từ create-users-script-v2.py")
    print()

    # Fallback: Use hardcoded list from the script
    expected_users = {
        'vu-buuchinh': {'org_name': 'Vụ Bưu chính', 'password': 'ThongkeCDS@2026#'},
        'vu-dgtd': {'org_name': 'Vụ Đánh giá và Thẩm định công nghệ', 'password': 'ThongkeCDS@2026#'},
        'vu-khcnct': {'org_name': 'Vụ Khoa học kỹ thuật và công nghệ', 'password': 'ThongkeCDS@2026#'},
        'vu-ptth': {'org_name': 'Vụ Phát thanh, Truyền hình và Thông tin điện tử', 'password': 'ThongkeCDS@2026#'},
        'vu-qlxb': {'org_name': 'Vụ Quản lý Xuất bản, In và Phát hành', 'password': 'ThongkeCDS@2026#'},
        'vu-ttbchi': {'org_name': 'Vụ Thông tin Báo chí', 'password': 'ThongkeCDS@2026#'},
        'vu-ttdt': {'org_name': 'Vụ Thông tin Đối ngoại', 'password': 'ThongkeCDS@2026#'},
        'cctx-khtc': {'org_name': 'Cục Chuyển đổi số và Phát triển Kinh tế số', 'password': 'ThongkeCDS@2026#'},
        'cuc-ptvt': {'org_name': 'Cục Phát thanh, Truyền hình và Thông tin điện tử', 'password': 'ThongkeCDS@2026#'},
        'cuc-bc': {'org_name': 'Cục Báo chí', 'password': 'ThongkeCDS@2026#'},
        'cuc-xb': {'org_name': 'Cục Xuất bản, In và Phát hành', 'password': 'ThongkeCDS@2026#'},
        'ttdt-anninh': {'org_name': 'Cục An ninh mạng và Phòng, chống tội phạm sử dụng công nghệ cao', 'password': 'ThongkeCDS@2026#'},
        'ttdt-viendientu': {'org_name': 'Cục Viễn thông', 'password': 'ThongkeCDS@2026#'},
        'ttdt-tanso': {'org_name': 'Cục Tần số Vô tuyến điện', 'password': 'ThongkeCDS@2026#'},
        'thanh-tra': {'org_name': 'Thanh tra Bộ', 'password': 'ThongkeCDS@2026#'},
        'vp-bo': {'org_name': 'Văn phòng Bộ', 'password': 'ThongkeCDS@2026#'},
    }

# Step 4: Check which organizations are missing users
print("3️⃣  KIỂM TRA CÁC ĐƠN VỊ THIẾU USER:")
print()

all_orgs = Organization.objects.all().order_by('name')
orgs_missing_users = []

for org in all_orgs:
    # Check if org has a corresponding org_user
    has_user = User.objects.filter(organization=org, role='org_user').exists()
    if not has_user:
        orgs_missing_users.append(org)
        print(f"  ❌ {org.code:20s} - {org.name:50s} - THIẾU USER")
    else:
        user = User.objects.filter(organization=org, role='org_user').first()
        print(f"  ✅ {org.code:20s} - {org.name:50s} - CÓ USER: {user.username}")

print()
print(f"📊 Tổng kết: {len(orgs_missing_users)}/{total_orgs} đơn vị THIẾU USER")
print()

# Step 5: Create missing users
if orgs_missing_users:
    print("4️⃣  TẠO USER CHO CÁC ĐƠN VỊ THIẾU:")
    print()

    created_count = 0
    error_count = 0

    for org in orgs_missing_users:
        # Try to find matching username from expected_users by org name
        matching_username = None
        matching_password = 'ThongkeCDS@2026#'

        for username, data in expected_users.items():
            if data['org_name'].lower() in org.name.lower() or org.name.lower() in data['org_name'].lower():
                matching_username = username
                matching_password = data['password']
                break

        # If no match found, generate username from org code
        if not matching_username:
            matching_username = org.code.lower().replace('_', '-')

        try:
            # Check if username already exists
            if User.objects.filter(username=matching_username).exists():
                # Username exists but for different org - try with suffix
                matching_username = f"{org.code.lower().replace('_', '-')}-user"

            user = User.objects.create_user(
                username=matching_username,
                email=f"{matching_username}@thongke.vn",
                password=matching_password,
                role='org_user',
                organization=org,
                first_name='User',
                last_name=org.code,
                is_active=True
            )
            created_count += 1
            print(f"  ✅ Tạo thành công: {matching_username:30s} cho {org.name}")
        except Exception as e:
            error_count += 1
            print(f"  ❌ LỖI tạo user cho {org.name}: {e}")

    print()
    print(f"📊 Kết quả: Tạo thành công {created_count} user, {error_count} lỗi")
else:
    print("✅ TẤT CẢ CÁC ĐƠN VỊ ĐÃ CÓ USER!")

print()
print("=" * 80)
print("HOÀN TẤT")
print("=" * 80)
