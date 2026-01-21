#!/usr/bin/env python3
from django.contrib.auth import get_user_model
from apps.organizations.models import Organization

User = get_user_model()

print('=' * 80)
print('CREATING FRESH ORGANIZATIONS AND USERS')
print('=' * 80)

# Create organizations
organizations = [
    'Vụ Bưu chính',
    'Vụ Đánh giá và Thẩm định công nghệ',
    'Vụ Khoa học kỹ thuật và công nghệ',
    'Vụ Khoa học Xã hội, Nhân văn và Tự nhiên',
    'Vụ Kinh tế và Xã hội số',
    'Văn phòng Bộ',
    'Cục An toàn bức xạ và hạt nhân',
    'Cục Bưu điện điện Trung ương',
    'Cục Công nghiệp Công nghệ thông tin',
    'Cục Chuyển đổi số quốc gia',
    'Cục Đổi mới sáng tạo',
    'Cục Khởi nghiệp và Doanh nghiệp công nghệ',
    'Cục Sở hữu trí tuệ',
    'Cục Tần số vô tuyến điện',
    'Cục Thông tin, Thống kê',
    'Cục Viễn thông',
    'Uỷ ban Tiêu chuẩn Đo lường Chất lượng quốc gia',
    'Trung tâm Công nghệ thông tin',
    'Học viện Công nghệ Bưu chính Viễn thông',
    'Học viện Chiến lược Khoa học và Công nghệ',
    'Báo VNExpress',
    'Quỹ Phát triển khoa học và công nghệ quốc gia',
    'Quỹ Đổi mới công nghệ quốc gia',
    'Quỹ Dịch vụ viễn thông công ích Việt Nam',
    'Viện Công nghệ số và Chuyển đổi số quốc gia',
    'Viện Năng lượng nguyên tử Việt Nam',
    'Viện Khoa học và Công nghệ Việt Nam - Hàn Quốc',
    'Viện Sở hữu trí tuệ quốc gia',
    'Viện Ứng dụng công nghệ',
    'Trung tâm Chứng thực điện tử quốc gia',
    'Trung tâm Internet Việt Nam',
    'Trung tâm Truyền thông khoa học và công nghệ',
    'Nhà Xuất bản Khoa học - Công nghệ - Truyền thông',
    'Trường Cao đẳng Thông tin và Truyền thông',
]

created_orgs = {}
for org_name in organizations:
    # Generate code from name (remove spaces, commas, hyphens, limit to 20 chars)
    code = org_name.replace(' ', '').replace(',', '').replace('-', '').upper()[:20]
    org = Organization.objects.create(code=code, name=org_name)
    created_orgs[org_name] = org
    print(f'✓ Created org: {code} - {org_name}')

print(f'\nTotal organizations created: {len(created_orgs)}')

# Create users
users_to_create = [
    {'unit_name': 'Vụ Bưu chính', 'username': 'vu-buuchinh', 'password': 'ThongkeCDS@2026#'},
    {'unit_name': 'Vụ Đánh giá và Thẩm định công nghệ', 'username': 'vu-dgtd', 'password': 'ThongkeCDS@2026#'},
    {'unit_name': 'Vụ Khoa học kỹ thuật và công nghệ', 'username': 'vu-khkt', 'password': 'ThongkeCDS@2026#'},
    {'unit_name': 'Vụ Khoa học Xã hội, Nhân văn và Tự nhiên', 'username': 'vu-khxh', 'password': 'ThongkeCDS@2026#'},
    {'unit_name': 'Vụ Kinh tế và Xã hội số', 'username': 'vu-ktxhs', 'password': 'ThongkeCDS@2026#'},
    {'unit_name': 'Văn phòng Bộ', 'username': 'vpb', 'password': 'ThongkeCDS@2026#'},
    {'unit_name': 'Cục An toàn bức xạ và hạt nhân', 'username': 'cuc-atbx', 'password': 'ThongkeCDS@2026#'},
    {'unit_name': 'Cục Bưu điện điện Trung ương', 'username': 'cuc-bdtw', 'password': 'ThongkeCDS@2026#'},
    {'unit_name': 'Cục Công nghiệp Công nghệ thông tin', 'username': 'cuc-cncntt', 'password': 'ThongkeCDS@2026#'},
    {'unit_name': 'Cục Chuyển đổi số quốc gia', 'username': 'cds', 'password': 'ThongkeCDS@2026#'},
    {'unit_name': 'Cục Đổi mới sáng tạo', 'username': 'cuc-dmst', 'password': 'ThongkeCDS@2026#'},
    {'unit_name': 'Cục Khởi nghiệp và Doanh nghiệp công nghệ', 'username': 'cuc-kncn', 'password': 'ThongkeCDS@2026#'},
    {'unit_name': 'Cục Sở hữu trí tuệ', 'username': 'shtt', 'password': 'ThongkeCDS@2026#'},
    {'unit_name': 'Cục Tần số vô tuyến điện', 'username': 'cuc-tswtd', 'password': 'ThongkeCDS@2026#'},
    {'unit_name': 'Cục Thông tin, Thống kê', 'username': 'cuc-tttk', 'password': 'ThongkeCDS@2026#'},
    {'unit_name': 'Cục Viễn thông', 'username': 'vienthong', 'password': 'ThongkeCDS@2026#'},
    {'unit_name': 'Uỷ ban Tiêu chuẩn Đo lường Chất lượng quốc gia', 'username': 'ub-tcclqg', 'password': 'ThongkeCDS@2026#'},
    {'unit_name': 'Trung tâm Công nghệ thông tin', 'username': 'cntt', 'password': 'ThongkeCDS@2026#'},
    {'unit_name': 'Học viện Công nghệ Bưu chính Viễn thông', 'username': 'ptit', 'password': 'ThongkeCDS@2026#'},
    {'unit_name': 'Học viện Chiến lược Khoa học và Công nghệ', 'username': 'hv-clkhcn', 'password': 'ThongkeCDS@2026#'},
    {'unit_name': 'Báo VNExpress', 'username': 'vnexpress', 'password': 'ThongkeCDS@2026#'},
    {'unit_name': 'Quỹ Phát triển khoa học và công nghệ quốc gia', 'username': 'quy-ptkhcn', 'password': 'ThongkeCDS@2026#'},
    {'unit_name': 'Quỹ Đổi mới công nghệ quốc gia', 'username': 'quy-dmcn', 'password': 'ThongkeCDS@2026#'},
    {'unit_name': 'Quỹ Dịch vụ viễn thông công ích Việt Nam', 'username': 'quy-dvvtci', 'password': 'ThongkeCDS@2026#'},
    {'unit_name': 'Viện Công nghệ số và Chuyển đổi số quốc gia', 'username': 'vien-cnscds', 'password': 'ThongkeCDS@2026#'},
    {'unit_name': 'Viện Năng lượng nguyên tử Việt Nam', 'username': 'vien-nlnt', 'password': 'ThongkeCDS@2026#'},
    {'unit_name': 'Viện Khoa học và Công nghệ Việt Nam - Hàn Quốc', 'username': 'vien-vn-han', 'password': 'ThongkeCDS@2026#'},
    {'unit_name': 'Viện Sở hữu trí tuệ quốc gia', 'username': 'vien-shtt', 'password': 'ThongkeCDS@2026#'},
    {'unit_name': 'Viện Ứng dụng công nghệ', 'username': 'vien-udcn', 'password': 'ThongkeCDS@2026#'},
    {'unit_name': 'Trung tâm Chứng thực điện tử quốc gia', 'username': 'vnnic', 'password': 'ThongkeCDS@2026#'},
    {'unit_name': 'Trung tâm Internet Việt Nam', 'username': 'tt-internet', 'password': 'ThongkeCDS@2026#'},
    {'unit_name': 'Trung tâm Truyền thông khoa học và công nghệ', 'username': 'tt-ttkhcn', 'password': 'ThongkeCDS@2026#'},
    {'unit_name': 'Nhà Xuất bản Khoa học - Công nghệ - Truyền thông', 'username': 'nxb-khcntt', 'password': 'ThongkeCDS@2026#'},
    {'unit_name': 'Trường Cao đẳng Thông tin và Truyền thông', 'username': 'cd-tttt', 'password': 'ThongkeCDS@2026#'},
]

created_users = []

for user_data in users_to_create:
    unit_name = user_data['unit_name']
    username = user_data['username']
    password = user_data['password']
    
    if unit_name in created_orgs:
        org = created_orgs[unit_name]
        
        user = User.objects.create_user(
            username=username,
            email=f'{username}@thongke.vn',
            password=password,
            role='org_user',
            organization=org,
            first_name='User',
            last_name=org.code,
            is_active=True
        )
        created_users.append(username)
        print(f'✓ Created user: {username} for {org.code}')
    else:
        print(f'✗ Cannot create user {username}: Organization "{unit_name}" not found')

print('\n' + '=' * 80)
print('SUMMARY')
print('=' * 80)
print(f'Organizations created: {len(created_orgs)}')
print(f'Users created: {len(created_users)}')
print('✅ Fresh data created successfully!')