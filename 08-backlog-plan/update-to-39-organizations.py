#!/usr/bin/env python3
"""
Update hệ thống theo danh sách chính thức 39 đơn vị
- Xóa toàn bộ systems, users (giữ admin), organizations
- Tạo 39 organizations với tên chính xác
- Tạo 39 users với email TRỐNG
- Org code = username.upper()
"""
from django.contrib.auth import get_user_model
from apps.organizations.models import Organization
from django.db import connection

User = get_user_model()

print('=' * 100)
print('CLEANUP TOÀN BỘ DỮ LIỆU CŨ')
print('=' * 100)

# Delete systems and related tables
cursor = connection.cursor()
child_tables = [
    'system_architecture', 'system_assessment', 'system_cost', 'system_data_info',
    'system_infrastructure', 'system_integration_connections', 'system_integration',
    'system_operations', 'system_security', 'system_vendor'
]

for table in child_tables:
    try:
        cursor.execute(f'DELETE FROM {table}')
        print(f'✓ Deleted from {table}')
    except Exception as e:
        print(f'⚠ {table}: {e}')

cursor.execute('DELETE FROM systems')
print('✓ Deleted all systems')

# Delete non-admin users and organizations
user_count = User.objects.filter(is_superuser=False).count()
User.objects.filter(is_superuser=False).delete()
print(f'✓ Deleted {user_count} non-admin users')

org_count = Organization.objects.count()
Organization.objects.all().delete()
print(f'✓ Deleted {org_count} organizations')

print('\n' + '=' * 100)
print('TẠO 39 ORGANIZATIONS VÀ 39 USERS THEO DANH SÁCH CHÍNH THỨC')
print('=' * 100)

# Danh sách chính thức từ file "DS đơn vị của Bộ khoa học công nghệ.xlsx"
# Mapping: Tên đơn vị → Username
organizations_mapping = [
    # Các đơn vị quản lý nhà nước (21 đơn vị)
    ('Vụ Bưu chính', 'vu-buuchinh'),
    ('Vụ Đánh giá và Thẩm định công nghệ', 'vu-dgtd'),
    ('Vụ Khoa học kỹ thuật và công nghệ', 'vu-khkt'),
    ('Vụ Khoa học Xã hội, Nhân văn và Tự nhiên', 'vu-khxh'),
    ('Vụ Kinh tế và Xã hội số', 'vu-ktxhs'),
    ('Vụ Kế hoạch - Tài chính', 'vu-khtc'),  # ĐƠN VỊ MỚI
    ('Vụ Pháp chế', 'vu-phap-che'),  # ĐƠN VỊ MỚI
    ('Vụ Hợp tác quốc tế', 'vu-htqt'),  # ĐƠN VỊ MỚI
    ('Vụ Tổ chức cán bộ', 'vu-tccb'),  # ĐƠN VỊ MỚI
    ('Văn phòng Bộ', 'vpb'),
    ('Cục An toàn bức xạ và hạt nhân', 'cuc-atbx'),
    ('Cục Bưu điện Trung ương', 'cuc-bdtw'),  # TÊN SỬA (bỏ chữ "điện" thứ 2)
    ('Cục Chuyển đổi số quốc gia', 'cds'),
    ('Cục Công nghiệp Công nghệ thông tin', 'cuc-cncntt'),
    ('Cục Đổi mới sáng tạo', 'cuc-dmst'),
    ('Cục Khởi nghiệp và Doanh nghiệp công nghệ', 'cuc-kncn'),
    ('Cục Sở hữu trí tuệ', 'shtt'),
    ('Cục Tần số vô tuyến điện', 'cuc-tswtd'),
    ('Cục Thông tin, Thống kê', 'cuc-tttk'),
    ('Cục Viễn thông', 'vienthong'),
    ('Ủy ban Tiêu chuẩn Đo lường Chất lượng Quốc gia', 'ub-tcclqg'),  # TÊN SỬA (Uỷ→Ủy, quốc gia→Quốc gia)

    # Các đơn vị sự nghiệp (18 đơn vị)
    ('Ban Quản lý dự án đầu tư xây dựng chuyên ngành khoa học và công nghệ', 'ban-qlda-khcn'),  # ĐƠN VỊ MỚI
    ('Trung tâm Internet Việt Nam', 'tt-internet'),
    ('Trung tâm Chứng thực điện tử quốc gia', 'vnnic'),
    ('Trung tâm Truyền thông khoa học và công nghệ', 'tt-ttkhcn'),
    ('Quỹ Dịch vụ viễn thông công ích Việt Nam', 'quy-dvvtci'),
    ('Viện Công nghệ số và Chuyển đổi số quốc gia', 'vien-cnscds'),
    ('Viện Ứng dụng công nghệ', 'vien-udcn'),
    ('Viện Khoa học và Công nghệ Việt Nam - Hàn Quốc', 'vien-vn-han'),
    ('Viện Sở hữu trí tuệ quốc gia', 'vien-shtt'),
    ('Quỹ Đổi mới công nghệ quốc gia', 'quy-dmcn'),
    ('Quỹ Phát triển khoa học và công nghệ Quốc gia', 'quy-ptkhcn'),  # TÊN SỬA (quốc gia→Quốc gia)
    ('Viện Năng lượng nguyên tử Việt Nam', 'vien-nlnt'),
    ('Học viện Công nghệ Bưu chính Viễn thông', 'ptit'),
    ('Trường Cao đẳng Thông tin và Truyền thông', 'cd-tttt'),
    ('Nhà xuất bản Khoa học - Công nghệ - Truyền thông', 'nxb-khcntt'),  # TÊN SỬA (Xuất bản→xuất bản)
    ('Học viện Chiến lược Khoa học và Công nghệ', 'hv-clkhcn'),
    ('Báo VnExpress', 'vnexpress'),  # TÊN SỬA (VNExpress→VnExpress)
    ('Trung tâm Công nghệ thông tin', 'cntt'),
]

# Verify count
assert len(organizations_mapping) == 39, f"Expected 39 organizations, got {len(organizations_mapping)}"

# Create organizations
created_orgs = {}
password = 'ThongkeCDS@2026#'

for idx, (org_name, username) in enumerate(organizations_mapping, start=1):
    code = username.upper()  # Org code = username uppercase

    org = Organization.objects.create(code=code, name=org_name)
    created_orgs[org_name] = {'org': org, 'username': username}

    print(f'{idx:2d}. ✓ Created org: {code:25s} - {org_name}')

print(f'\nTotal organizations created: {len(created_orgs)}')

# Create users
print('\n' + '=' * 100)
print('TẠO 39 USERS (EMAIL TRỐNG)')
print('=' * 100)

created_users = []

for idx, (org_name, username) in enumerate(organizations_mapping, start=1):
    org_info = created_orgs[org_name]
    org = org_info['org']

    # Create user with EMPTY email
    user = User.objects.create_user(
        username=username,
        email='',  # EMPTY - không auto-generate
        password=password,
        role='org_user',
        organization=org,
        first_name='',  # Empty first name
        last_name=org.code,  # Last name = org code
        is_active=True
    )
    created_users.append(username)
    print(f'{idx:2d}. ✓ Created user: {username:25s} for {org.code}')

print('\n' + '=' * 100)
print('SUMMARY')
print('=' * 100)
print(f'Organizations created: {len(created_orgs)}')
print(f'Users created: {len(created_users)}')
print(f'Admin user preserved: 1')
print('\n✅ Update hoàn tất!')
print(f'✅ Đã tạo đúng 39 organizations và 39 users theo danh sách chính thức')
print(f'✅ Email fields trống (không auto-generate)')
print(f'✅ Organization codes = username.upper()')
print(f'\n📝 5 đơn vị mới:')
print(f'   1. Vụ Kế hoạch - Tài chính (vu-khtc)')
print(f'   2. Vụ Pháp chế (vu-phap-che)')
print(f'   3. Vụ Hợp tác quốc tế (vu-htqt)')
print(f'   4. Vụ Tổ chức cán bộ (vu-tccb)')
print(f'   5. Ban Quản lý dự án đầu tư xây dựng chuyên ngành khoa học và công nghệ (ban-qlda-khcn)')
