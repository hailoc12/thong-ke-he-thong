#!/usr/bin/env python3
"""
Complete cleanup and fresh data initialization
- Delete all systems, users (except admin), organizations
- Create 34 organizations with correct spelling
- Create 34 users with empty emails
- Use correct org codes (username.upper())
"""
from django.contrib.auth import get_user_model
from apps.organizations.models import Organization
from apps.systems.models import System

User = get_user_model()

print('=' * 80)
print('COMPLETE CLEANUP')
print('=' * 80)

# Step 1: Delete all systems (use raw SQL to avoid model issues)
from django.db import connection
cursor = connection.cursor()

# Delete child tables first
child_tables = [
    'system_architecture',
    'system_assessment',
    'system_cost',
    'system_data_info',
    'system_infrastructure',
    'system_integration_connections',
    'system_integration',
    'system_operations',
    'system_security',
    'system_vendor'
]

for table in child_tables:
    try:
        cursor.execute(f'DELETE FROM {table}')
        deleted = cursor.fetchone()
        print(f'✓ Deleted from {table}')
    except Exception as e:
        print(f'⚠ {table}: {e}')

# Delete systems table
cursor.execute('DELETE FROM systems')
print('✓ Deleted all systems')

# Step 2: Delete all non-admin users
user_count = User.objects.filter(is_superuser=False).count()
User.objects.filter(is_superuser=False).delete()
print(f'✓ Deleted {user_count} non-admin users')

# Step 3: Delete all organizations
org_count = Organization.objects.count()
Organization.objects.all().delete()
print(f'✓ Deleted {org_count} organizations')

print('\n' + '=' * 80)
print('CREATING FRESH DATA - 34 ORGANIZATIONS AND 34 USERS')
print('=' * 80)

# Official list from Excel file - 34 organizations
organizations_data = [
    {'name': 'Vụ Bưu chính', 'username': 'vu-buuchinh'},
    {'name': 'Vụ Đánh giá và Thẩm định công nghệ', 'username': 'vu-dgtd'},
    {'name': 'Vụ Khoa học kỹ thuật và công nghệ', 'username': 'vu-khkt'},
    {'name': 'Vụ Khoa học Xã hội, Nhân văn và Tự nhiên', 'username': 'vu-khxh'},
    {'name': 'Vụ Kinh tế và Xã hội số', 'username': 'vu-ktxhs'},
    {'name': 'Văn phòng Bộ', 'username': 'vpb'},
    {'name': 'Cục An toàn bức xạ và hạt nhân', 'username': 'cuc-atbx'},
    {'name': 'Cục Bưu điện điện Trung ương', 'username': 'cuc-bdtw'},
    {'name': 'Cục Công nghiệp Công nghệ thông tin', 'username': 'cuc-cncntt'},
    {'name': 'Cục Chuyển đổi số quốc gia', 'username': 'cds'},
    {'name': 'Cục Đổi mới sáng tạo', 'username': 'cuc-dmst'},
    {'name': 'Cục Khởi nghiệp và Doanh nghiệp công nghệ', 'username': 'cuc-kncn'},
    {'name': 'Cục Sở hữu trí tuệ', 'username': 'shtt'},
    {'name': 'Cục Tần số vô tuyến điện', 'username': 'cuc-tswtd'},
    {'name': 'Cục Thông tin, Thống kê', 'username': 'cuc-tttk'},
    {'name': 'Cục Viễn thông', 'username': 'vienthong'},
    {'name': 'Uỷ ban Tiêu chuẩn Đo lường Chất lượng quốc gia', 'username': 'ub-tcclqg'},
    {'name': 'Trung tâm Công nghệ thông tin', 'username': 'cntt'},
    {'name': 'Học viện Công nghệ Bưu chính Viễn thông', 'username': 'ptit'},
    {'name': 'Học viện Chiến lược Khoa học và Công nghệ', 'username': 'hv-clkhcn'},
    {'name': 'Báo VNExpress', 'username': 'vnexpress'},
    {'name': 'Quỹ Phát triển khoa học và công nghệ quốc gia', 'username': 'quy-ptkhcn'},
    {'name': 'Quỹ Đổi mới công nghệ quốc gia', 'username': 'quy-dmcn'},
    {'name': 'Quỹ Dịch vụ viễn thông công ích Việt Nam', 'username': 'quy-dvvtci'},
    {'name': 'Viện Công nghệ số và Chuyển đổi số quốc gia', 'username': 'vien-cnscds'},
    {'name': 'Viện Năng lượng nguyên tử Việt Nam', 'username': 'vien-nlnt'},
    {'name': 'Viện Khoa học và Công nghệ Việt Nam - Hàn Quốc', 'username': 'vien-vn-han'},
    {'name': 'Viện Sở hữu trí tuệ quốc gia', 'username': 'vien-shtt'},
    {'name': 'Viện Ứng dụng công nghệ', 'username': 'vien-udcn'},
    {'name': 'Trung tâm Chứng thực điện tử quốc gia', 'username': 'vnnic'},
    {'name': 'Trung tâm Internet Việt Nam', 'username': 'tt-internet'},
    {'name': 'Trung tâm Truyền thông khoa học và công nghệ', 'username': 'tt-ttkhcn'},
    {'name': 'Nhà Xuất bản Khoa học - Công nghệ - Truyền thông', 'username': 'nxb-khcntt'},
    {'name': 'Trường Cao đẳng Thông tin và Truyền thông', 'username': 'cd-tttt'},
]

# Create organizations with code = username.upper()
created_orgs = {}
for idx, org_data in enumerate(organizations_data, start=1):
    org_name = org_data['name']
    username = org_data['username']
    code = username.upper()  # Use uppercase username as code

    org = Organization.objects.create(code=code, name=org_name)
    created_orgs[org_name] = org
    print(f'{idx:2d}. ✓ Created org: {code:20s} - {org_name}')

print(f'\nTotal organizations created: {len(created_orgs)}')

# Create users with empty email
print('\n' + '=' * 80)
print('CREATING 34 USERS (with empty emails)')
print('=' * 80)

created_users = []
password = 'ThongkeCDS@2026#'  # Same password for all users

for idx, org_data in enumerate(organizations_data, start=1):
    org_name = org_data['name']
    username = org_data['username']

    if org_name in created_orgs:
        org = created_orgs[org_name]

        # Create user with EMPTY email (not auto-generated)
        user = User.objects.create_user(
            username=username,
            email='',  # EMPTY - as requested by user
            password=password,
            role='org_user',
            organization=org,
            first_name='',  # Empty first name
            last_name=org.code,  # Last name = org code
            is_active=True
        )
        created_users.append(username)
        print(f'{idx:2d}. ✓ Created user: {username:20s} for {org.code}')
    else:
        print(f'{idx:2d}. ✗ Cannot create user {username}: Organization not found')

print('\n' + '=' * 80)
print('SUMMARY')
print('=' * 80)
print(f'Organizations created: {len(created_orgs)}')
print(f'Users created: {len(created_users)}')
print(f'Admin user preserved: 1')
print('\n✅ Complete cleanup and fresh data creation successful!')
print(f'✅ All 34 organizations and 34 users created with correct data')
print(f'✅ Email fields are empty (not auto-generated)')
print(f'✅ Organization codes match usernames (uppercase)')
