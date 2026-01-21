#!/usr/bin/env python3
# Script to create organizations and users from Excel list
from django.contrib.auth import get_user_model
from apps.organizations.models import Organization

User = get_user_model()

# Create organizations and users
created_orgs = []
created_users = []
skipped = []

# Vụ Bưu chính
org, org_created = Organization.objects.get_or_create(
    code='VUBUUCHINH',
    defaults={'name': 'Vụ Bưu chính'}
)
if org_created:
    created_orgs.append(org.code)
    print(f'Created org: VUBUUCHINH - Vụ Bưu chính')

# Create user for vu-buuchinh
if not User.objects.filter(username='vu-buuchinh').exists():
    user = User.objects.create_user(
        username='vu-buuchinh',
        email='vu-buuchinh@thongke.vn',
        password='ThongkeCDS@2026#',
        role='org_user',
        organization=org,
        first_name='User',
        last_name='VUBUUCHINH',
        is_active=True
    )
    created_users.append(user.username)
    print(f'Created user: vu-buuchinh for org VUBUUCHINH')
else:
    skipped.append('vu-buuchinh')
    print(f'Skipped user: vu-buuchinh (already exists)')

# Vụ Đánh giá và Thẩm định công nghệ
org, org_created = Organization.objects.get_or_create(
    code='VUDGTD',
    defaults={'name': 'Vụ Đánh giá và Thẩm định công nghệ'}
)
if org_created:
    created_orgs.append(org.code)
    print(f'Created org: VUDGTD - Vụ Đánh giá và Thẩm định công nghệ')

# Create user for vu-dgtd
if not User.objects.filter(username='vu-dgtd').exists():
    user = User.objects.create_user(
        username='vu-dgtd',
        email='vu-dgtd@thongke.vn',
        password='ThongkeCDS@2026#',
        role='org_user',
        organization=org,
        first_name='User',
        last_name='VUDGTD',
        is_active=True
    )
    created_users.append(user.username)
    print(f'Created user: vu-dgtd for org VUDGTD')
else:
    skipped.append('vu-dgtd')
    print(f'Skipped user: vu-dgtd (already exists)')

# Vụ Khoa học kỹ thuật và công nghệ
org, org_created = Organization.objects.get_or_create(
    code='VUKHKT',
    defaults={'name': 'Vụ Khoa học kỹ thuật và công nghệ'}
)
if org_created:
    created_orgs.append(org.code)
    print(f'Created org: VUKHKT - Vụ Khoa học kỹ thuật và công nghệ')

# Create user for vu-khkt
if not User.objects.filter(username='vu-khkt').exists():
    user = User.objects.create_user(
        username='vu-khkt',
        email='vu-khkt@thongke.vn',
        password='ThongkeCDS@2026#',
        role='org_user',
        organization=org,
        first_name='User',
        last_name='VUKHKT',
        is_active=True
    )
    created_users.append(user.username)
    print(f'Created user: vu-khkt for org VUKHKT')
else:
    skipped.append('vu-khkt')
    print(f'Skipped user: vu-khkt (already exists)')

# Vụ Khoa học Xã hội, Nhân văn và Tự nhiên
org, org_created = Organization.objects.get_or_create(
    code='VUKHXH',
    defaults={'name': 'Vụ Khoa học Xã hội, Nhân văn và Tự nhiên'}
)
if org_created:
    created_orgs.append(org.code)
    print(f'Created org: VUKHXH - Vụ Khoa học Xã hội, Nhân văn và Tự nhiên')

# Create user for vu-khxh
if not User.objects.filter(username='vu-khxh').exists():
    user = User.objects.create_user(
        username='vu-khxh',
        email='vu-khxh@thongke.vn',
        password='ThongkeCDS@2026#',
        role='org_user',
        organization=org,
        first_name='User',
        last_name='VUKHXH',
        is_active=True
    )
    created_users.append(user.username)
    print(f'Created user: vu-khxh for org VUKHXH')
else:
    skipped.append('vu-khxh')
    print(f'Skipped user: vu-khxh (already exists)')

# Vụ Kinh tế và Xã hội số
org, org_created = Organization.objects.get_or_create(
    code='VUKTXHS',
    defaults={'name': 'Vụ Kinh tế và Xã hội số'}
)
if org_created:
    created_orgs.append(org.code)
    print(f'Created org: VUKTXHS - Vụ Kinh tế và Xã hội số')

# Create user for vu-ktxhs
if not User.objects.filter(username='vu-ktxhs').exists():
    user = User.objects.create_user(
        username='vu-ktxhs',
        email='vu-ktxhs@thongke.vn',
        password='ThongkeCDS@2026#',
        role='org_user',
        organization=org,
        first_name='User',
        last_name='VUKTXHS',
        is_active=True
    )
    created_users.append(user.username)
    print(f'Created user: vu-ktxhs for org VUKTXHS')
else:
    skipped.append('vu-ktxhs')
    print(f'Skipped user: vu-ktxhs (already exists)')

# Văn phòng Bộ
org, org_created = Organization.objects.get_or_create(
    code='VPB',
    defaults={'name': 'Văn phòng Bộ'}
)
if org_created:
    created_orgs.append(org.code)
    print(f'Created org: VPB - Văn phòng Bộ')

# Create user for vpb
if not User.objects.filter(username='vpb').exists():
    user = User.objects.create_user(
        username='vpb',
        email='vpb@thongke.vn',
        password='ThongkeCDS@2026#',
        role='org_user',
        organization=org,
        first_name='User',
        last_name='VPB',
        is_active=True
    )
    created_users.append(user.username)
    print(f'Created user: vpb for org VPB')
else:
    skipped.append('vpb')
    print(f'Skipped user: vpb (already exists)')

# Cục An toàn bức xạ và hạt nhân
org, org_created = Organization.objects.get_or_create(
    code='CUCATBX',
    defaults={'name': 'Cục An toàn bức xạ và hạt nhân'}
)
if org_created:
    created_orgs.append(org.code)
    print(f'Created org: CUCATBX - Cục An toàn bức xạ và hạt nhân')

# Create user for cuc-atbx
if not User.objects.filter(username='cuc-atbx').exists():
    user = User.objects.create_user(
        username='cuc-atbx',
        email='cuc-atbx@thongke.vn',
        password='ThongkeCDS@2026#',
        role='org_user',
        organization=org,
        first_name='User',
        last_name='CUCATBX',
        is_active=True
    )
    created_users.append(user.username)
    print(f'Created user: cuc-atbx for org CUCATBX')
else:
    skipped.append('cuc-atbx')
    print(f'Skipped user: cuc-atbx (already exists)')

# Cục Bưu điện điện Trung ương
org, org_created = Organization.objects.get_or_create(
    code='CUCBDTW',
    defaults={'name': 'Cục Bưu điện điện Trung ương'}
)
if org_created:
    created_orgs.append(org.code)
    print(f'Created org: CUCBDTW - Cục Bưu điện điện Trung ương')

# Create user for cuc-bdtw
if not User.objects.filter(username='cuc-bdtw').exists():
    user = User.objects.create_user(
        username='cuc-bdtw',
        email='cuc-bdtw@thongke.vn',
        password='ThongkeCDS@2026#',
        role='org_user',
        organization=org,
        first_name='User',
        last_name='CUCBDTW',
        is_active=True
    )
    created_users.append(user.username)
    print(f'Created user: cuc-bdtw for org CUCBDTW')
else:
    skipped.append('cuc-bdtw')
    print(f'Skipped user: cuc-bdtw (already exists)')

# Cục Công nghiệp Công nghệ thông tin
org, org_created = Organization.objects.get_or_create(
    code='CUCCNCNTT',
    defaults={'name': 'Cục Công nghiệp Công nghệ thông tin'}
)
if org_created:
    created_orgs.append(org.code)
    print(f'Created org: CUCCNCNTT - Cục Công nghiệp Công nghệ thông tin')

# Create user for cuc-cncntt
if not User.objects.filter(username='cuc-cncntt').exists():
    user = User.objects.create_user(
        username='cuc-cncntt',
        email='cuc-cncntt@thongke.vn',
        password='ThongkeCDS@2026#',
        role='org_user',
        organization=org,
        first_name='User',
        last_name='CUCCNCNTT',
        is_active=True
    )
    created_users.append(user.username)
    print(f'Created user: cuc-cncntt for org CUCCNCNTT')
else:
    skipped.append('cuc-cncntt')
    print(f'Skipped user: cuc-cncntt (already exists)')

# Cục Chuyển đổi số quốc gia
org, org_created = Organization.objects.get_or_create(
    code='CDS',
    defaults={'name': 'Cục Chuyển đổi số quốc gia'}
)
if org_created:
    created_orgs.append(org.code)
    print(f'Created org: CDS - Cục Chuyển đổi số quốc gia')

# Create user for cds
if not User.objects.filter(username='cds').exists():
    user = User.objects.create_user(
        username='cds',
        email='cds@thongke.vn',
        password='ThongkeCDS@2026#',
        role='org_user',
        organization=org,
        first_name='User',
        last_name='CDS',
        is_active=True
    )
    created_users.append(user.username)
    print(f'Created user: cds for org CDS')
else:
    skipped.append('cds')
    print(f'Skipped user: cds (already exists)')

# Cục Đổi mới sáng tạo
org, org_created = Organization.objects.get_or_create(
    code='CUCDMST',
    defaults={'name': 'Cục Đổi mới sáng tạo'}
)
if org_created:
    created_orgs.append(org.code)
    print(f'Created org: CUCDMST - Cục Đổi mới sáng tạo')

# Create user for cuc-dmst
if not User.objects.filter(username='cuc-dmst').exists():
    user = User.objects.create_user(
        username='cuc-dmst',
        email='cuc-dmst@thongke.vn',
        password='ThongkeCDS@2026#',
        role='org_user',
        organization=org,
        first_name='User',
        last_name='CUCDMST',
        is_active=True
    )
    created_users.append(user.username)
    print(f'Created user: cuc-dmst for org CUCDMST')
else:
    skipped.append('cuc-dmst')
    print(f'Skipped user: cuc-dmst (already exists)')

# Cục Khởi nghiệp và Doanh nghiệp công nghệ
org, org_created = Organization.objects.get_or_create(
    code='CUCKNCN',
    defaults={'name': 'Cục Khởi nghiệp và Doanh nghiệp công nghệ'}
)
if org_created:
    created_orgs.append(org.code)
    print(f'Created org: CUCKNCN - Cục Khởi nghiệp và Doanh nghiệp công nghệ')

# Create user for cuc-kncn
if not User.objects.filter(username='cuc-kncn').exists():
    user = User.objects.create_user(
        username='cuc-kncn',
        email='cuc-kncn@thongke.vn',
        password='ThongkeCDS@2026#',
        role='org_user',
        organization=org,
        first_name='User',
        last_name='CUCKNCN',
        is_active=True
    )
    created_users.append(user.username)
    print(f'Created user: cuc-kncn for org CUCKNCN')
else:
    skipped.append('cuc-kncn')
    print(f'Skipped user: cuc-kncn (already exists)')

# Cục Sở hữu trí tuệ
org, org_created = Organization.objects.get_or_create(
    code='SHTT',
    defaults={'name': 'Cục Sở hữu trí tuệ'}
)
if org_created:
    created_orgs.append(org.code)
    print(f'Created org: SHTT - Cục Sở hữu trí tuệ')

# Create user for shtt
if not User.objects.filter(username='shtt').exists():
    user = User.objects.create_user(
        username='shtt',
        email='shtt@thongke.vn',
        password='ThongkeCDS@2026#',
        role='org_user',
        organization=org,
        first_name='User',
        last_name='SHTT',
        is_active=True
    )
    created_users.append(user.username)
    print(f'Created user: shtt for org SHTT')
else:
    skipped.append('shtt')
    print(f'Skipped user: shtt (already exists)')

# Cục Tần số vô tuyến điện
org, org_created = Organization.objects.get_or_create(
    code='CUCTSWTD',
    defaults={'name': 'Cục Tần số vô tuyến điện'}
)
if org_created:
    created_orgs.append(org.code)
    print(f'Created org: CUCTSWTD - Cục Tần số vô tuyến điện')

# Create user for cuc-tswtd
if not User.objects.filter(username='cuc-tswtd').exists():
    user = User.objects.create_user(
        username='cuc-tswtd',
        email='cuc-tswtd@thongke.vn',
        password='ThongkeCDS@2026#',
        role='org_user',
        organization=org,
        first_name='User',
        last_name='CUCTSWTD',
        is_active=True
    )
    created_users.append(user.username)
    print(f'Created user: cuc-tswtd for org CUCTSWTD')
else:
    skipped.append('cuc-tswtd')
    print(f'Skipped user: cuc-tswtd (already exists)')

# Cục Thông tin, Thống kê
org, org_created = Organization.objects.get_or_create(
    code='CUCTTTK',
    defaults={'name': 'Cục Thông tin, Thống kê'}
)
if org_created:
    created_orgs.append(org.code)
    print(f'Created org: CUCTTTK - Cục Thông tin, Thống kê')

# Create user for cuc-tttk
if not User.objects.filter(username='cuc-tttk').exists():
    user = User.objects.create_user(
        username='cuc-tttk',
        email='cuc-tttk@thongke.vn',
        password='ThongkeCDS@2026#',
        role='org_user',
        organization=org,
        first_name='User',
        last_name='CUCTTTK',
        is_active=True
    )
    created_users.append(user.username)
    print(f'Created user: cuc-tttk for org CUCTTTK')
else:
    skipped.append('cuc-tttk')
    print(f'Skipped user: cuc-tttk (already exists)')

# Cục Viễn thông
org, org_created = Organization.objects.get_or_create(
    code='VIENTHONG',
    defaults={'name': 'Cục Viễn thông'}
)
if org_created:
    created_orgs.append(org.code)
    print(f'Created org: VIENTHONG - Cục Viễn thông')

# Create user for vienthong
if not User.objects.filter(username='vienthong').exists():
    user = User.objects.create_user(
        username='vienthong',
        email='vienthong@thongke.vn',
        password='ThongkeCDS@2026#',
        role='org_user',
        organization=org,
        first_name='User',
        last_name='VIENTHONG',
        is_active=True
    )
    created_users.append(user.username)
    print(f'Created user: vienthong for org VIENTHONG')
else:
    skipped.append('vienthong')
    print(f'Skipped user: vienthong (already exists)')

# Uỷ ban Tiêu chuẩn Đo lường Chất lượng quốc gia
org, org_created = Organization.objects.get_or_create(
    code='UBTCCLQG',
    defaults={'name': 'Uỷ ban Tiêu chuẩn Đo lường Chất lượng quốc gia'}
)
if org_created:
    created_orgs.append(org.code)
    print(f'Created org: UBTCCLQG - Uỷ ban Tiêu chuẩn Đo lường Chất lượng quốc gia')

# Create user for ub-tcclqg
if not User.objects.filter(username='ub-tcclqg').exists():
    user = User.objects.create_user(
        username='ub-tcclqg',
        email='ub-tcclqg@thongke.vn',
        password='ThongkeCDS@2026#',
        role='org_user',
        organization=org,
        first_name='User',
        last_name='UBTCCLQG',
        is_active=True
    )
    created_users.append(user.username)
    print(f'Created user: ub-tcclqg for org UBTCCLQG')
else:
    skipped.append('ub-tcclqg')
    print(f'Skipped user: ub-tcclqg (already exists)')

# Trung tâm Công nghệ thông tin
org, org_created = Organization.objects.get_or_create(
    code='CNTT',
    defaults={'name': 'Trung tâm Công nghệ thông tin'}
)
if org_created:
    created_orgs.append(org.code)
    print(f'Created org: CNTT - Trung tâm Công nghệ thông tin')

# Create user for cntt
if not User.objects.filter(username='cntt').exists():
    user = User.objects.create_user(
        username='cntt',
        email='cntt@thongke.vn',
        password='ThongkeCDS@2026#',
        role='org_user',
        organization=org,
        first_name='User',
        last_name='CNTT',
        is_active=True
    )
    created_users.append(user.username)
    print(f'Created user: cntt for org CNTT')
else:
    skipped.append('cntt')
    print(f'Skipped user: cntt (already exists)')

# Học viện Công nghệ Bưu chính Viễn thông
org, org_created = Organization.objects.get_or_create(
    code='PTIT',
    defaults={'name': 'Học viện Công nghệ Bưu chính Viễn thông'}
)
if org_created:
    created_orgs.append(org.code)
    print(f'Created org: PTIT - Học viện Công nghệ Bưu chính Viễn thông')

# Create user for ptit
if not User.objects.filter(username='ptit').exists():
    user = User.objects.create_user(
        username='ptit',
        email='ptit@thongke.vn',
        password='ThongkeCDS@2026#',
        role='org_user',
        organization=org,
        first_name='User',
        last_name='PTIT',
        is_active=True
    )
    created_users.append(user.username)
    print(f'Created user: ptit for org PTIT')
else:
    skipped.append('ptit')
    print(f'Skipped user: ptit (already exists)')

# Học viện Chiến lược Khoa học và Công nghệ
org, org_created = Organization.objects.get_or_create(
    code='HVCLKHCN',
    defaults={'name': 'Học viện Chiến lược Khoa học và Công nghệ'}
)
if org_created:
    created_orgs.append(org.code)
    print(f'Created org: HVCLKHCN - Học viện Chiến lược Khoa học và Công nghệ')

# Create user for hv-clkhcn
if not User.objects.filter(username='hv-clkhcn').exists():
    user = User.objects.create_user(
        username='hv-clkhcn',
        email='hv-clkhcn@thongke.vn',
        password='ThongkeCDS@2026#',
        role='org_user',
        organization=org,
        first_name='User',
        last_name='HVCLKHCN',
        is_active=True
    )
    created_users.append(user.username)
    print(f'Created user: hv-clkhcn for org HVCLKHCN')
else:
    skipped.append('hv-clkhcn')
    print(f'Skipped user: hv-clkhcn (already exists)')

# Báo VNExpress
org, org_created = Organization.objects.get_or_create(
    code='VNEXPRESS',
    defaults={'name': 'Báo VNExpress'}
)
if org_created:
    created_orgs.append(org.code)
    print(f'Created org: VNEXPRESS - Báo VNExpress')

# Create user for vnexpress
if not User.objects.filter(username='vnexpress').exists():
    user = User.objects.create_user(
        username='vnexpress',
        email='vnexpress@thongke.vn',
        password='ThongkeCDS@2026#',
        role='org_user',
        organization=org,
        first_name='User',
        last_name='VNEXPRESS',
        is_active=True
    )
    created_users.append(user.username)
    print(f'Created user: vnexpress for org VNEXPRESS')
else:
    skipped.append('vnexpress')
    print(f'Skipped user: vnexpress (already exists)')

# Quỹ Phát triển khoa học và công nghệ quốc gia
org, org_created = Organization.objects.get_or_create(
    code='QUYPTKHCN',
    defaults={'name': 'Quỹ Phát triển khoa học và công nghệ quốc gia'}
)
if org_created:
    created_orgs.append(org.code)
    print(f'Created org: QUYPTKHCN - Quỹ Phát triển khoa học và công nghệ quốc gia')

# Create user for quy-ptkhcn
if not User.objects.filter(username='quy-ptkhcn').exists():
    user = User.objects.create_user(
        username='quy-ptkhcn',
        email='quy-ptkhcn@thongke.vn',
        password='ThongkeCDS@2026#',
        role='org_user',
        organization=org,
        first_name='User',
        last_name='QUYPTKHCN',
        is_active=True
    )
    created_users.append(user.username)
    print(f'Created user: quy-ptkhcn for org QUYPTKHCN')
else:
    skipped.append('quy-ptkhcn')
    print(f'Skipped user: quy-ptkhcn (already exists)')

# Quỹ Đổi mới công nghệ quốc gia
org, org_created = Organization.objects.get_or_create(
    code='QUYDMCN',
    defaults={'name': 'Quỹ Đổi mới công nghệ quốc gia'}
)
if org_created:
    created_orgs.append(org.code)
    print(f'Created org: QUYDMCN - Quỹ Đổi mới công nghệ quốc gia')

# Create user for quy-dmcn
if not User.objects.filter(username='quy-dmcn').exists():
    user = User.objects.create_user(
        username='quy-dmcn',
        email='quy-dmcn@thongke.vn',
        password='ThongkeCDS@2026#',
        role='org_user',
        organization=org,
        first_name='User',
        last_name='QUYDMCN',
        is_active=True
    )
    created_users.append(user.username)
    print(f'Created user: quy-dmcn for org QUYDMCN')
else:
    skipped.append('quy-dmcn')
    print(f'Skipped user: quy-dmcn (already exists)')

# Quỹ Dịch vụ viễn thông công ích Việt Nam
org, org_created = Organization.objects.get_or_create(
    code='QUYDVVTCI',
    defaults={'name': 'Quỹ Dịch vụ viễn thông công ích Việt Nam'}
)
if org_created:
    created_orgs.append(org.code)
    print(f'Created org: QUYDVVTCI - Quỹ Dịch vụ viễn thông công ích Việt Nam')

# Create user for quy-dvvtci
if not User.objects.filter(username='quy-dvvtci').exists():
    user = User.objects.create_user(
        username='quy-dvvtci',
        email='quy-dvvtci@thongke.vn',
        password='ThongkeCDS@2026#',
        role='org_user',
        organization=org,
        first_name='User',
        last_name='QUYDVVTCI',
        is_active=True
    )
    created_users.append(user.username)
    print(f'Created user: quy-dvvtci for org QUYDVVTCI')
else:
    skipped.append('quy-dvvtci')
    print(f'Skipped user: quy-dvvtci (already exists)')

# Viện Công nghệ số và Chuyển đổi số quốc gia
org, org_created = Organization.objects.get_or_create(
    code='VIENCNSCDS',
    defaults={'name': 'Viện Công nghệ số và Chuyển đổi số quốc gia'}
)
if org_created:
    created_orgs.append(org.code)
    print(f'Created org: VIENCNSCDS - Viện Công nghệ số và Chuyển đổi số quốc gia')

# Create user for vien-cnscds
if not User.objects.filter(username='vien-cnscds').exists():
    user = User.objects.create_user(
        username='vien-cnscds',
        email='vien-cnscds@thongke.vn',
        password='ThongkeCDS@2026#',
        role='org_user',
        organization=org,
        first_name='User',
        last_name='VIENCNSCDS',
        is_active=True
    )
    created_users.append(user.username)
    print(f'Created user: vien-cnscds for org VIENCNSCDS')
else:
    skipped.append('vien-cnscds')
    print(f'Skipped user: vien-cnscds (already exists)')

# Viện Năng lượng nguyên tử Việt Nam
org, org_created = Organization.objects.get_or_create(
    code='VIENNLNT',
    defaults={'name': 'Viện Năng lượng nguyên tử Việt Nam'}
)
if org_created:
    created_orgs.append(org.code)
    print(f'Created org: VIENNLNT - Viện Năng lượng nguyên tử Việt Nam')

# Create user for vien-nlnt
if not User.objects.filter(username='vien-nlnt').exists():
    user = User.objects.create_user(
        username='vien-nlnt',
        email='vien-nlnt@thongke.vn',
        password='ThongkeCDS@2026#',
        role='org_user',
        organization=org,
        first_name='User',
        last_name='VIENNLNT',
        is_active=True
    )
    created_users.append(user.username)
    print(f'Created user: vien-nlnt for org VIENNLNT')
else:
    skipped.append('vien-nlnt')
    print(f'Skipped user: vien-nlnt (already exists)')

# Viện Khoa học và Công nghệ Việt Nam - Hàn Quốc
org, org_created = Organization.objects.get_or_create(
    code='VIENVNHAN',
    defaults={'name': 'Viện Khoa học và Công nghệ Việt Nam - Hàn Quốc'}
)
if org_created:
    created_orgs.append(org.code)
    print(f'Created org: VIENVNHAN - Viện Khoa học và Công nghệ Việt Nam - Hàn Quốc')

# Create user for vien-vn-han
if not User.objects.filter(username='vien-vn-han').exists():
    user = User.objects.create_user(
        username='vien-vn-han',
        email='vien-vn-han@thongke.vn',
        password='ThongkeCDS@2026#',
        role='org_user',
        organization=org,
        first_name='User',
        last_name='VIENVNHAN',
        is_active=True
    )
    created_users.append(user.username)
    print(f'Created user: vien-vn-han for org VIENVNHAN')
else:
    skipped.append('vien-vn-han')
    print(f'Skipped user: vien-vn-han (already exists)')

# Viện Sở hữu trí tuệ quốc gia
org, org_created = Organization.objects.get_or_create(
    code='VIENSHTT',
    defaults={'name': 'Viện Sở hữu trí tuệ quốc gia'}
)
if org_created:
    created_orgs.append(org.code)
    print(f'Created org: VIENSHTT - Viện Sở hữu trí tuệ quốc gia')

# Create user for vien-shtt
if not User.objects.filter(username='vien-shtt').exists():
    user = User.objects.create_user(
        username='vien-shtt',
        email='vien-shtt@thongke.vn',
        password='ThongkeCDS@2026#',
        role='org_user',
        organization=org,
        first_name='User',
        last_name='VIENSHTT',
        is_active=True
    )
    created_users.append(user.username)
    print(f'Created user: vien-shtt for org VIENSHTT')
else:
    skipped.append('vien-shtt')
    print(f'Skipped user: vien-shtt (already exists)')

# Viện Ứng dụng công nghệ
org, org_created = Organization.objects.get_or_create(
    code='VIENUDCN',
    defaults={'name': 'Viện Ứng dụng công nghệ'}
)
if org_created:
    created_orgs.append(org.code)
    print(f'Created org: VIENUDCN - Viện Ứng dụng công nghệ')

# Create user for vien-udcn
if not User.objects.filter(username='vien-udcn').exists():
    user = User.objects.create_user(
        username='vien-udcn',
        email='vien-udcn@thongke.vn',
        password='ThongkeCDS@2026#',
        role='org_user',
        organization=org,
        first_name='User',
        last_name='VIENUDCN',
        is_active=True
    )
    created_users.append(user.username)
    print(f'Created user: vien-udcn for org VIENUDCN')
else:
    skipped.append('vien-udcn')
    print(f'Skipped user: vien-udcn (already exists)')

# Trung tâm Chứng thực điện tử quốc gia
org, org_created = Organization.objects.get_or_create(
    code='VNNIC',
    defaults={'name': 'Trung tâm Chứng thực điện tử quốc gia'}
)
if org_created:
    created_orgs.append(org.code)
    print(f'Created org: VNNIC - Trung tâm Chứng thực điện tử quốc gia')

# Create user for vnnic
if not User.objects.filter(username='vnnic').exists():
    user = User.objects.create_user(
        username='vnnic',
        email='vnnic@thongke.vn',
        password='ThongkeCDS@2026#',
        role='org_user',
        organization=org,
        first_name='User',
        last_name='VNNIC',
        is_active=True
    )
    created_users.append(user.username)
    print(f'Created user: vnnic for org VNNIC')
else:
    skipped.append('vnnic')
    print(f'Skipped user: vnnic (already exists)')

# Trung tâm Internet Việt Nam
org, org_created = Organization.objects.get_or_create(
    code='TTINTERNET',
    defaults={'name': 'Trung tâm Internet Việt Nam'}
)
if org_created:
    created_orgs.append(org.code)
    print(f'Created org: TTINTERNET - Trung tâm Internet Việt Nam')

# Create user for tt-internet
if not User.objects.filter(username='tt-internet').exists():
    user = User.objects.create_user(
        username='tt-internet',
        email='tt-internet@thongke.vn',
        password='ThongkeCDS@2026#',
        role='org_user',
        organization=org,
        first_name='User',
        last_name='TTINTERNET',
        is_active=True
    )
    created_users.append(user.username)
    print(f'Created user: tt-internet for org TTINTERNET')
else:
    skipped.append('tt-internet')
    print(f'Skipped user: tt-internet (already exists)')

# Trung tâm Truyền thông khoa học và công nghệ
org, org_created = Organization.objects.get_or_create(
    code='TTTTKHCN',
    defaults={'name': 'Trung tâm Truyền thông khoa học và công nghệ'}
)
if org_created:
    created_orgs.append(org.code)
    print(f'Created org: TTTTKHCN - Trung tâm Truyền thông khoa học và công nghệ')

# Create user for tt-ttkhcn
if not User.objects.filter(username='tt-ttkhcn').exists():
    user = User.objects.create_user(
        username='tt-ttkhcn',
        email='tt-ttkhcn@thongke.vn',
        password='ThongkeCDS@2026#',
        role='org_user',
        organization=org,
        first_name='User',
        last_name='TTTTKHCN',
        is_active=True
    )
    created_users.append(user.username)
    print(f'Created user: tt-ttkhcn for org TTTTKHCN')
else:
    skipped.append('tt-ttkhcn')
    print(f'Skipped user: tt-ttkhcn (already exists)')

# Nhà Xuất bản Khoa học - Công nghệ - Truyền thông
org, org_created = Organization.objects.get_or_create(
    code='NXBKHCNTT',
    defaults={'name': 'Nhà Xuất bản Khoa học - Công nghệ - Truyền thông'}
)
if org_created:
    created_orgs.append(org.code)
    print(f'Created org: NXBKHCNTT - Nhà Xuất bản Khoa học - Công nghệ - Truyền thông')

# Create user for nxb-khcntt
if not User.objects.filter(username='nxb-khcntt').exists():
    user = User.objects.create_user(
        username='nxb-khcntt',
        email='nxb-khcntt@thongke.vn',
        password='ThongkeCDS@2026#',
        role='org_user',
        organization=org,
        first_name='User',
        last_name='NXBKHCNTT',
        is_active=True
    )
    created_users.append(user.username)
    print(f'Created user: nxb-khcntt for org NXBKHCNTT')
else:
    skipped.append('nxb-khcntt')
    print(f'Skipped user: nxb-khcntt (already exists)')

# Trường Cao đẳng Thông tin và Truyền thông
org, org_created = Organization.objects.get_or_create(
    code='CDTTTT',
    defaults={'name': 'Trường Cao đẳng Thông tin và Truyền thông'}
)
if org_created:
    created_orgs.append(org.code)
    print(f'Created org: CDTTTT - Trường Cao đẳng Thông tin và Truyền thông')

# Create user for cd-tttt
if not User.objects.filter(username='cd-tttt').exists():
    user = User.objects.create_user(
        username='cd-tttt',
        email='cd-tttt@thongke.vn',
        password='ThongkeCDS@2026#',
        role='org_user',
        organization=org,
        first_name='User',
        last_name='CDTTTT',
        is_active=True
    )
    created_users.append(user.username)
    print(f'Created user: cd-tttt for org CDTTTT')
else:
    skipped.append('cd-tttt')
    print(f'Skipped user: cd-tttt (already exists)')

print(f'\n=== Summary ===')
print(f'Organizations created: {len(created_orgs)}')
print(f'Users created: {len(created_users)}')
print(f'Users skipped: {len(skipped)}')