#!/usr/bin/env python3
from django.contrib.auth import get_user_model
from apps.organizations.models import Organization
from django.db import IntegrityError

User = get_user_model()

created_orgs = []
created_users = []
skipped_users = []
errors = []

# Process: Vụ Bưu chính
try:
    # Try to find existing org by name first
    try:
        org = Organization.objects.get(name='Vụ Bưu chính')
        print(f'Found existing org by name: {org.code} - Vụ Bưu chính')
    except Organization.DoesNotExist:
        # Try by code
        try:
            org = Organization.objects.get(code='VUBUUCHINH')
            print(f'Found existing org by code: VUBUUCHINH - {org.name}')
        except Organization.DoesNotExist:
            # Create new organization
            org = Organization.objects.create(
                code='VUBUUCHINH',
                name='Vụ Bưu chính'
            )
            created_orgs.append(org.code)
            print(f'Created org: VUBUUCHINH - Vụ Bưu chính')

    # Create user
    if not User.objects.filter(username='vu-buuchinh').exists():
        user = User.objects.create_user(
            username='vu-buuchinh',
            email='vu-buuchinh@thongke.vn',
            password='ThongkeCDS@2026#',
            role='org_user',
            organization=org,
            first_name='User',
            last_name=org.code,
            is_active=True
        )
        created_users.append(user.username)
        print(f'Created user: vu-buuchinh for org {org.code}')
    else:
        skipped_users.append('vu-buuchinh')
        print(f'Skipped user: vu-buuchinh (already exists)')
except Exception as e:
    errors.append(('vu-buuchinh', str(e)))
    print(f'ERROR processing vu-buuchinh: {e}')

# Process: Vụ Đánh giá và Thẩm định công nghệ
try:
    # Try to find existing org by name first
    try:
        org = Organization.objects.get(name='Vụ Đánh giá và Thẩm định công nghệ')
        print(f'Found existing org by name: {org.code} - Vụ Đánh giá và Thẩm định công nghệ')
    except Organization.DoesNotExist:
        # Try by code
        try:
            org = Organization.objects.get(code='VUDGTD')
            print(f'Found existing org by code: VUDGTD - {org.name}')
        except Organization.DoesNotExist:
            # Create new organization
            org = Organization.objects.create(
                code='VUDGTD',
                name='Vụ Đánh giá và Thẩm định công nghệ'
            )
            created_orgs.append(org.code)
            print(f'Created org: VUDGTD - Vụ Đánh giá và Thẩm định công nghệ')

    # Create user
    if not User.objects.filter(username='vu-dgtd').exists():
        user = User.objects.create_user(
            username='vu-dgtd',
            email='vu-dgtd@thongke.vn',
            password='ThongkeCDS@2026#',
            role='org_user',
            organization=org,
            first_name='User',
            last_name=org.code,
            is_active=True
        )
        created_users.append(user.username)
        print(f'Created user: vu-dgtd for org {org.code}')
    else:
        skipped_users.append('vu-dgtd')
        print(f'Skipped user: vu-dgtd (already exists)')
except Exception as e:
    errors.append(('vu-dgtd', str(e)))
    print(f'ERROR processing vu-dgtd: {e}')

# Process: Vụ Khoa học kỹ thuật và công nghệ
try:
    # Try to find existing org by name first
    try:
        org = Organization.objects.get(name='Vụ Khoa học kỹ thuật và công nghệ')
        print(f'Found existing org by name: {org.code} - Vụ Khoa học kỹ thuật và công nghệ')
    except Organization.DoesNotExist:
        # Try by code
        try:
            org = Organization.objects.get(code='VUKHKT')
            print(f'Found existing org by code: VUKHKT - {org.name}')
        except Organization.DoesNotExist:
            # Create new organization
            org = Organization.objects.create(
                code='VUKHKT',
                name='Vụ Khoa học kỹ thuật và công nghệ'
            )
            created_orgs.append(org.code)
            print(f'Created org: VUKHKT - Vụ Khoa học kỹ thuật và công nghệ')

    # Create user
    if not User.objects.filter(username='vu-khkt').exists():
        user = User.objects.create_user(
            username='vu-khkt',
            email='vu-khkt@thongke.vn',
            password='ThongkeCDS@2026#',
            role='org_user',
            organization=org,
            first_name='User',
            last_name=org.code,
            is_active=True
        )
        created_users.append(user.username)
        print(f'Created user: vu-khkt for org {org.code}')
    else:
        skipped_users.append('vu-khkt')
        print(f'Skipped user: vu-khkt (already exists)')
except Exception as e:
    errors.append(('vu-khkt', str(e)))
    print(f'ERROR processing vu-khkt: {e}')

# Process: Vụ Khoa học Xã hội, Nhân văn và Tự nhiên
try:
    # Try to find existing org by name first
    try:
        org = Organization.objects.get(name='Vụ Khoa học Xã hội, Nhân văn và Tự nhiên')
        print(f'Found existing org by name: {org.code} - Vụ Khoa học Xã hội, Nhân văn và Tự nhiên')
    except Organization.DoesNotExist:
        # Try by code
        try:
            org = Organization.objects.get(code='VUKHXH')
            print(f'Found existing org by code: VUKHXH - {org.name}')
        except Organization.DoesNotExist:
            # Create new organization
            org = Organization.objects.create(
                code='VUKHXH',
                name='Vụ Khoa học Xã hội, Nhân văn và Tự nhiên'
            )
            created_orgs.append(org.code)
            print(f'Created org: VUKHXH - Vụ Khoa học Xã hội, Nhân văn và Tự nhiên')

    # Create user
    if not User.objects.filter(username='vu-khxh').exists():
        user = User.objects.create_user(
            username='vu-khxh',
            email='vu-khxh@thongke.vn',
            password='ThongkeCDS@2026#',
            role='org_user',
            organization=org,
            first_name='User',
            last_name=org.code,
            is_active=True
        )
        created_users.append(user.username)
        print(f'Created user: vu-khxh for org {org.code}')
    else:
        skipped_users.append('vu-khxh')
        print(f'Skipped user: vu-khxh (already exists)')
except Exception as e:
    errors.append(('vu-khxh', str(e)))
    print(f'ERROR processing vu-khxh: {e}')

# Process: Vụ Kinh tế và Xã hội số
try:
    # Try to find existing org by name first
    try:
        org = Organization.objects.get(name='Vụ Kinh tế và Xã hội số')
        print(f'Found existing org by name: {org.code} - Vụ Kinh tế và Xã hội số')
    except Organization.DoesNotExist:
        # Try by code
        try:
            org = Organization.objects.get(code='VUKTXHS')
            print(f'Found existing org by code: VUKTXHS - {org.name}')
        except Organization.DoesNotExist:
            # Create new organization
            org = Organization.objects.create(
                code='VUKTXHS',
                name='Vụ Kinh tế và Xã hội số'
            )
            created_orgs.append(org.code)
            print(f'Created org: VUKTXHS - Vụ Kinh tế và Xã hội số')

    # Create user
    if not User.objects.filter(username='vu-ktxhs').exists():
        user = User.objects.create_user(
            username='vu-ktxhs',
            email='vu-ktxhs@thongke.vn',
            password='ThongkeCDS@2026#',
            role='org_user',
            organization=org,
            first_name='User',
            last_name=org.code,
            is_active=True
        )
        created_users.append(user.username)
        print(f'Created user: vu-ktxhs for org {org.code}')
    else:
        skipped_users.append('vu-ktxhs')
        print(f'Skipped user: vu-ktxhs (already exists)')
except Exception as e:
    errors.append(('vu-ktxhs', str(e)))
    print(f'ERROR processing vu-ktxhs: {e}')

# Process: Văn phòng Bộ
try:
    # Try to find existing org by name first
    try:
        org = Organization.objects.get(name='Văn phòng Bộ')
        print(f'Found existing org by name: {org.code} - Văn phòng Bộ')
    except Organization.DoesNotExist:
        # Try by code
        try:
            org = Organization.objects.get(code='VPB')
            print(f'Found existing org by code: VPB - {org.name}')
        except Organization.DoesNotExist:
            # Create new organization
            org = Organization.objects.create(
                code='VPB',
                name='Văn phòng Bộ'
            )
            created_orgs.append(org.code)
            print(f'Created org: VPB - Văn phòng Bộ')

    # Create user
    if not User.objects.filter(username='vpb').exists():
        user = User.objects.create_user(
            username='vpb',
            email='vpb@thongke.vn',
            password='ThongkeCDS@2026#',
            role='org_user',
            organization=org,
            first_name='User',
            last_name=org.code,
            is_active=True
        )
        created_users.append(user.username)
        print(f'Created user: vpb for org {org.code}')
    else:
        skipped_users.append('vpb')
        print(f'Skipped user: vpb (already exists)')
except Exception as e:
    errors.append(('vpb', str(e)))
    print(f'ERROR processing vpb: {e}')

# Process: Cục An toàn bức xạ và hạt nhân
try:
    # Try to find existing org by name first
    try:
        org = Organization.objects.get(name='Cục An toàn bức xạ và hạt nhân')
        print(f'Found existing org by name: {org.code} - Cục An toàn bức xạ và hạt nhân')
    except Organization.DoesNotExist:
        # Try by code
        try:
            org = Organization.objects.get(code='CUCATBX')
            print(f'Found existing org by code: CUCATBX - {org.name}')
        except Organization.DoesNotExist:
            # Create new organization
            org = Organization.objects.create(
                code='CUCATBX',
                name='Cục An toàn bức xạ và hạt nhân'
            )
            created_orgs.append(org.code)
            print(f'Created org: CUCATBX - Cục An toàn bức xạ và hạt nhân')

    # Create user
    if not User.objects.filter(username='cuc-atbx').exists():
        user = User.objects.create_user(
            username='cuc-atbx',
            email='cuc-atbx@thongke.vn',
            password='ThongkeCDS@2026#',
            role='org_user',
            organization=org,
            first_name='User',
            last_name=org.code,
            is_active=True
        )
        created_users.append(user.username)
        print(f'Created user: cuc-atbx for org {org.code}')
    else:
        skipped_users.append('cuc-atbx')
        print(f'Skipped user: cuc-atbx (already exists)')
except Exception as e:
    errors.append(('cuc-atbx', str(e)))
    print(f'ERROR processing cuc-atbx: {e}')

# Process: Cục Bưu điện điện Trung ương
try:
    # Try to find existing org by name first
    try:
        org = Organization.objects.get(name='Cục Bưu điện điện Trung ương')
        print(f'Found existing org by name: {org.code} - Cục Bưu điện điện Trung ương')
    except Organization.DoesNotExist:
        # Try by code
        try:
            org = Organization.objects.get(code='CUCBDTW')
            print(f'Found existing org by code: CUCBDTW - {org.name}')
        except Organization.DoesNotExist:
            # Create new organization
            org = Organization.objects.create(
                code='CUCBDTW',
                name='Cục Bưu điện điện Trung ương'
            )
            created_orgs.append(org.code)
            print(f'Created org: CUCBDTW - Cục Bưu điện điện Trung ương')

    # Create user
    if not User.objects.filter(username='cuc-bdtw').exists():
        user = User.objects.create_user(
            username='cuc-bdtw',
            email='cuc-bdtw@thongke.vn',
            password='ThongkeCDS@2026#',
            role='org_user',
            organization=org,
            first_name='User',
            last_name=org.code,
            is_active=True
        )
        created_users.append(user.username)
        print(f'Created user: cuc-bdtw for org {org.code}')
    else:
        skipped_users.append('cuc-bdtw')
        print(f'Skipped user: cuc-bdtw (already exists)')
except Exception as e:
    errors.append(('cuc-bdtw', str(e)))
    print(f'ERROR processing cuc-bdtw: {e}')

# Process: Cục Công nghiệp Công nghệ thông tin
try:
    # Try to find existing org by name first
    try:
        org = Organization.objects.get(name='Cục Công nghiệp Công nghệ thông tin')
        print(f'Found existing org by name: {org.code} - Cục Công nghiệp Công nghệ thông tin')
    except Organization.DoesNotExist:
        # Try by code
        try:
            org = Organization.objects.get(code='CUCCNCNTT')
            print(f'Found existing org by code: CUCCNCNTT - {org.name}')
        except Organization.DoesNotExist:
            # Create new organization
            org = Organization.objects.create(
                code='CUCCNCNTT',
                name='Cục Công nghiệp Công nghệ thông tin'
            )
            created_orgs.append(org.code)
            print(f'Created org: CUCCNCNTT - Cục Công nghiệp Công nghệ thông tin')

    # Create user
    if not User.objects.filter(username='cuc-cncntt').exists():
        user = User.objects.create_user(
            username='cuc-cncntt',
            email='cuc-cncntt@thongke.vn',
            password='ThongkeCDS@2026#',
            role='org_user',
            organization=org,
            first_name='User',
            last_name=org.code,
            is_active=True
        )
        created_users.append(user.username)
        print(f'Created user: cuc-cncntt for org {org.code}')
    else:
        skipped_users.append('cuc-cncntt')
        print(f'Skipped user: cuc-cncntt (already exists)')
except Exception as e:
    errors.append(('cuc-cncntt', str(e)))
    print(f'ERROR processing cuc-cncntt: {e}')

# Process: Cục Chuyển đổi số quốc gia
try:
    # Try to find existing org by name first
    try:
        org = Organization.objects.get(name='Cục Chuyển đổi số quốc gia')
        print(f'Found existing org by name: {org.code} - Cục Chuyển đổi số quốc gia')
    except Organization.DoesNotExist:
        # Try by code
        try:
            org = Organization.objects.get(code='CDS')
            print(f'Found existing org by code: CDS - {org.name}')
        except Organization.DoesNotExist:
            # Create new organization
            org = Organization.objects.create(
                code='CDS',
                name='Cục Chuyển đổi số quốc gia'
            )
            created_orgs.append(org.code)
            print(f'Created org: CDS - Cục Chuyển đổi số quốc gia')

    # Create user
    if not User.objects.filter(username='cds').exists():
        user = User.objects.create_user(
            username='cds',
            email='cds@thongke.vn',
            password='ThongkeCDS@2026#',
            role='org_user',
            organization=org,
            first_name='User',
            last_name=org.code,
            is_active=True
        )
        created_users.append(user.username)
        print(f'Created user: cds for org {org.code}')
    else:
        skipped_users.append('cds')
        print(f'Skipped user: cds (already exists)')
except Exception as e:
    errors.append(('cds', str(e)))
    print(f'ERROR processing cds: {e}')

# Process: Cục Đổi mới sáng tạo
try:
    # Try to find existing org by name first
    try:
        org = Organization.objects.get(name='Cục Đổi mới sáng tạo')
        print(f'Found existing org by name: {org.code} - Cục Đổi mới sáng tạo')
    except Organization.DoesNotExist:
        # Try by code
        try:
            org = Organization.objects.get(code='CUCDMST')
            print(f'Found existing org by code: CUCDMST - {org.name}')
        except Organization.DoesNotExist:
            # Create new organization
            org = Organization.objects.create(
                code='CUCDMST',
                name='Cục Đổi mới sáng tạo'
            )
            created_orgs.append(org.code)
            print(f'Created org: CUCDMST - Cục Đổi mới sáng tạo')

    # Create user
    if not User.objects.filter(username='cuc-dmst').exists():
        user = User.objects.create_user(
            username='cuc-dmst',
            email='cuc-dmst@thongke.vn',
            password='ThongkeCDS@2026#',
            role='org_user',
            organization=org,
            first_name='User',
            last_name=org.code,
            is_active=True
        )
        created_users.append(user.username)
        print(f'Created user: cuc-dmst for org {org.code}')
    else:
        skipped_users.append('cuc-dmst')
        print(f'Skipped user: cuc-dmst (already exists)')
except Exception as e:
    errors.append(('cuc-dmst', str(e)))
    print(f'ERROR processing cuc-dmst: {e}')

# Process: Cục Khởi nghiệp và Doanh nghiệp công nghệ
try:
    # Try to find existing org by name first
    try:
        org = Organization.objects.get(name='Cục Khởi nghiệp và Doanh nghiệp công nghệ')
        print(f'Found existing org by name: {org.code} - Cục Khởi nghiệp và Doanh nghiệp công nghệ')
    except Organization.DoesNotExist:
        # Try by code
        try:
            org = Organization.objects.get(code='CUCKNCN')
            print(f'Found existing org by code: CUCKNCN - {org.name}')
        except Organization.DoesNotExist:
            # Create new organization
            org = Organization.objects.create(
                code='CUCKNCN',
                name='Cục Khởi nghiệp và Doanh nghiệp công nghệ'
            )
            created_orgs.append(org.code)
            print(f'Created org: CUCKNCN - Cục Khởi nghiệp và Doanh nghiệp công nghệ')

    # Create user
    if not User.objects.filter(username='cuc-kncn').exists():
        user = User.objects.create_user(
            username='cuc-kncn',
            email='cuc-kncn@thongke.vn',
            password='ThongkeCDS@2026#',
            role='org_user',
            organization=org,
            first_name='User',
            last_name=org.code,
            is_active=True
        )
        created_users.append(user.username)
        print(f'Created user: cuc-kncn for org {org.code}')
    else:
        skipped_users.append('cuc-kncn')
        print(f'Skipped user: cuc-kncn (already exists)')
except Exception as e:
    errors.append(('cuc-kncn', str(e)))
    print(f'ERROR processing cuc-kncn: {e}')

# Process: Cục Sở hữu trí tuệ
try:
    # Try to find existing org by name first
    try:
        org = Organization.objects.get(name='Cục Sở hữu trí tuệ')
        print(f'Found existing org by name: {org.code} - Cục Sở hữu trí tuệ')
    except Organization.DoesNotExist:
        # Try by code
        try:
            org = Organization.objects.get(code='SHTT')
            print(f'Found existing org by code: SHTT - {org.name}')
        except Organization.DoesNotExist:
            # Create new organization
            org = Organization.objects.create(
                code='SHTT',
                name='Cục Sở hữu trí tuệ'
            )
            created_orgs.append(org.code)
            print(f'Created org: SHTT - Cục Sở hữu trí tuệ')

    # Create user
    if not User.objects.filter(username='shtt').exists():
        user = User.objects.create_user(
            username='shtt',
            email='shtt@thongke.vn',
            password='ThongkeCDS@2026#',
            role='org_user',
            organization=org,
            first_name='User',
            last_name=org.code,
            is_active=True
        )
        created_users.append(user.username)
        print(f'Created user: shtt for org {org.code}')
    else:
        skipped_users.append('shtt')
        print(f'Skipped user: shtt (already exists)')
except Exception as e:
    errors.append(('shtt', str(e)))
    print(f'ERROR processing shtt: {e}')

# Process: Cục Tần số vô tuyến điện
try:
    # Try to find existing org by name first
    try:
        org = Organization.objects.get(name='Cục Tần số vô tuyến điện')
        print(f'Found existing org by name: {org.code} - Cục Tần số vô tuyến điện')
    except Organization.DoesNotExist:
        # Try by code
        try:
            org = Organization.objects.get(code='CUCTSWTD')
            print(f'Found existing org by code: CUCTSWTD - {org.name}')
        except Organization.DoesNotExist:
            # Create new organization
            org = Organization.objects.create(
                code='CUCTSWTD',
                name='Cục Tần số vô tuyến điện'
            )
            created_orgs.append(org.code)
            print(f'Created org: CUCTSWTD - Cục Tần số vô tuyến điện')

    # Create user
    if not User.objects.filter(username='cuc-tswtd').exists():
        user = User.objects.create_user(
            username='cuc-tswtd',
            email='cuc-tswtd@thongke.vn',
            password='ThongkeCDS@2026#',
            role='org_user',
            organization=org,
            first_name='User',
            last_name=org.code,
            is_active=True
        )
        created_users.append(user.username)
        print(f'Created user: cuc-tswtd for org {org.code}')
    else:
        skipped_users.append('cuc-tswtd')
        print(f'Skipped user: cuc-tswtd (already exists)')
except Exception as e:
    errors.append(('cuc-tswtd', str(e)))
    print(f'ERROR processing cuc-tswtd: {e}')

# Process: Cục Thông tin, Thống kê
try:
    # Try to find existing org by name first
    try:
        org = Organization.objects.get(name='Cục Thông tin, Thống kê')
        print(f'Found existing org by name: {org.code} - Cục Thông tin, Thống kê')
    except Organization.DoesNotExist:
        # Try by code
        try:
            org = Organization.objects.get(code='CUCTTTK')
            print(f'Found existing org by code: CUCTTTK - {org.name}')
        except Organization.DoesNotExist:
            # Create new organization
            org = Organization.objects.create(
                code='CUCTTTK',
                name='Cục Thông tin, Thống kê'
            )
            created_orgs.append(org.code)
            print(f'Created org: CUCTTTK - Cục Thông tin, Thống kê')

    # Create user
    if not User.objects.filter(username='cuc-tttk').exists():
        user = User.objects.create_user(
            username='cuc-tttk',
            email='cuc-tttk@thongke.vn',
            password='ThongkeCDS@2026#',
            role='org_user',
            organization=org,
            first_name='User',
            last_name=org.code,
            is_active=True
        )
        created_users.append(user.username)
        print(f'Created user: cuc-tttk for org {org.code}')
    else:
        skipped_users.append('cuc-tttk')
        print(f'Skipped user: cuc-tttk (already exists)')
except Exception as e:
    errors.append(('cuc-tttk', str(e)))
    print(f'ERROR processing cuc-tttk: {e}')

# Process: Cục Viễn thông
try:
    # Try to find existing org by name first
    try:
        org = Organization.objects.get(name='Cục Viễn thông')
        print(f'Found existing org by name: {org.code} - Cục Viễn thông')
    except Organization.DoesNotExist:
        # Try by code
        try:
            org = Organization.objects.get(code='VIENTHONG')
            print(f'Found existing org by code: VIENTHONG - {org.name}')
        except Organization.DoesNotExist:
            # Create new organization
            org = Organization.objects.create(
                code='VIENTHONG',
                name='Cục Viễn thông'
            )
            created_orgs.append(org.code)
            print(f'Created org: VIENTHONG - Cục Viễn thông')

    # Create user
    if not User.objects.filter(username='vienthong').exists():
        user = User.objects.create_user(
            username='vienthong',
            email='vienthong@thongke.vn',
            password='ThongkeCDS@2026#',
            role='org_user',
            organization=org,
            first_name='User',
            last_name=org.code,
            is_active=True
        )
        created_users.append(user.username)
        print(f'Created user: vienthong for org {org.code}')
    else:
        skipped_users.append('vienthong')
        print(f'Skipped user: vienthong (already exists)')
except Exception as e:
    errors.append(('vienthong', str(e)))
    print(f'ERROR processing vienthong: {e}')

# Process: Uỷ ban Tiêu chuẩn Đo lường Chất lượng quốc gia
try:
    # Try to find existing org by name first
    try:
        org = Organization.objects.get(name='Uỷ ban Tiêu chuẩn Đo lường Chất lượng quốc gia')
        print(f'Found existing org by name: {org.code} - Uỷ ban Tiêu chuẩn Đo lường Chất lượng quốc gia')
    except Organization.DoesNotExist:
        # Try by code
        try:
            org = Organization.objects.get(code='UBTCCLQG')
            print(f'Found existing org by code: UBTCCLQG - {org.name}')
        except Organization.DoesNotExist:
            # Create new organization
            org = Organization.objects.create(
                code='UBTCCLQG',
                name='Uỷ ban Tiêu chuẩn Đo lường Chất lượng quốc gia'
            )
            created_orgs.append(org.code)
            print(f'Created org: UBTCCLQG - Uỷ ban Tiêu chuẩn Đo lường Chất lượng quốc gia')

    # Create user
    if not User.objects.filter(username='ub-tcclqg').exists():
        user = User.objects.create_user(
            username='ub-tcclqg',
            email='ub-tcclqg@thongke.vn',
            password='ThongkeCDS@2026#',
            role='org_user',
            organization=org,
            first_name='User',
            last_name=org.code,
            is_active=True
        )
        created_users.append(user.username)
        print(f'Created user: ub-tcclqg for org {org.code}')
    else:
        skipped_users.append('ub-tcclqg')
        print(f'Skipped user: ub-tcclqg (already exists)')
except Exception as e:
    errors.append(('ub-tcclqg', str(e)))
    print(f'ERROR processing ub-tcclqg: {e}')

# Process: Trung tâm Công nghệ thông tin
try:
    # Try to find existing org by name first
    try:
        org = Organization.objects.get(name='Trung tâm Công nghệ thông tin')
        print(f'Found existing org by name: {org.code} - Trung tâm Công nghệ thông tin')
    except Organization.DoesNotExist:
        # Try by code
        try:
            org = Organization.objects.get(code='CNTT')
            print(f'Found existing org by code: CNTT - {org.name}')
        except Organization.DoesNotExist:
            # Create new organization
            org = Organization.objects.create(
                code='CNTT',
                name='Trung tâm Công nghệ thông tin'
            )
            created_orgs.append(org.code)
            print(f'Created org: CNTT - Trung tâm Công nghệ thông tin')

    # Create user
    if not User.objects.filter(username='cntt').exists():
        user = User.objects.create_user(
            username='cntt',
            email='cntt@thongke.vn',
            password='ThongkeCDS@2026#',
            role='org_user',
            organization=org,
            first_name='User',
            last_name=org.code,
            is_active=True
        )
        created_users.append(user.username)
        print(f'Created user: cntt for org {org.code}')
    else:
        skipped_users.append('cntt')
        print(f'Skipped user: cntt (already exists)')
except Exception as e:
    errors.append(('cntt', str(e)))
    print(f'ERROR processing cntt: {e}')

# Process: Học viện Công nghệ Bưu chính Viễn thông
try:
    # Try to find existing org by name first
    try:
        org = Organization.objects.get(name='Học viện Công nghệ Bưu chính Viễn thông')
        print(f'Found existing org by name: {org.code} - Học viện Công nghệ Bưu chính Viễn thông')
    except Organization.DoesNotExist:
        # Try by code
        try:
            org = Organization.objects.get(code='PTIT')
            print(f'Found existing org by code: PTIT - {org.name}')
        except Organization.DoesNotExist:
            # Create new organization
            org = Organization.objects.create(
                code='PTIT',
                name='Học viện Công nghệ Bưu chính Viễn thông'
            )
            created_orgs.append(org.code)
            print(f'Created org: PTIT - Học viện Công nghệ Bưu chính Viễn thông')

    # Create user
    if not User.objects.filter(username='ptit').exists():
        user = User.objects.create_user(
            username='ptit',
            email='ptit@thongke.vn',
            password='ThongkeCDS@2026#',
            role='org_user',
            organization=org,
            first_name='User',
            last_name=org.code,
            is_active=True
        )
        created_users.append(user.username)
        print(f'Created user: ptit for org {org.code}')
    else:
        skipped_users.append('ptit')
        print(f'Skipped user: ptit (already exists)')
except Exception as e:
    errors.append(('ptit', str(e)))
    print(f'ERROR processing ptit: {e}')

# Process: Học viện Chiến lược Khoa học và Công nghệ
try:
    # Try to find existing org by name first
    try:
        org = Organization.objects.get(name='Học viện Chiến lược Khoa học và Công nghệ')
        print(f'Found existing org by name: {org.code} - Học viện Chiến lược Khoa học và Công nghệ')
    except Organization.DoesNotExist:
        # Try by code
        try:
            org = Organization.objects.get(code='HVCLKHCN')
            print(f'Found existing org by code: HVCLKHCN - {org.name}')
        except Organization.DoesNotExist:
            # Create new organization
            org = Organization.objects.create(
                code='HVCLKHCN',
                name='Học viện Chiến lược Khoa học và Công nghệ'
            )
            created_orgs.append(org.code)
            print(f'Created org: HVCLKHCN - Học viện Chiến lược Khoa học và Công nghệ')

    # Create user
    if not User.objects.filter(username='hv-clkhcn').exists():
        user = User.objects.create_user(
            username='hv-clkhcn',
            email='hv-clkhcn@thongke.vn',
            password='ThongkeCDS@2026#',
            role='org_user',
            organization=org,
            first_name='User',
            last_name=org.code,
            is_active=True
        )
        created_users.append(user.username)
        print(f'Created user: hv-clkhcn for org {org.code}')
    else:
        skipped_users.append('hv-clkhcn')
        print(f'Skipped user: hv-clkhcn (already exists)')
except Exception as e:
    errors.append(('hv-clkhcn', str(e)))
    print(f'ERROR processing hv-clkhcn: {e}')

# Process: Báo VNExpress
try:
    # Try to find existing org by name first
    try:
        org = Organization.objects.get(name='Báo VNExpress')
        print(f'Found existing org by name: {org.code} - Báo VNExpress')
    except Organization.DoesNotExist:
        # Try by code
        try:
            org = Organization.objects.get(code='VNEXPRESS')
            print(f'Found existing org by code: VNEXPRESS - {org.name}')
        except Organization.DoesNotExist:
            # Create new organization
            org = Organization.objects.create(
                code='VNEXPRESS',
                name='Báo VNExpress'
            )
            created_orgs.append(org.code)
            print(f'Created org: VNEXPRESS - Báo VNExpress')

    # Create user
    if not User.objects.filter(username='vnexpress').exists():
        user = User.objects.create_user(
            username='vnexpress',
            email='vnexpress@thongke.vn',
            password='ThongkeCDS@2026#',
            role='org_user',
            organization=org,
            first_name='User',
            last_name=org.code,
            is_active=True
        )
        created_users.append(user.username)
        print(f'Created user: vnexpress for org {org.code}')
    else:
        skipped_users.append('vnexpress')
        print(f'Skipped user: vnexpress (already exists)')
except Exception as e:
    errors.append(('vnexpress', str(e)))
    print(f'ERROR processing vnexpress: {e}')

# Process: Quỹ Phát triển khoa học và công nghệ quốc gia
try:
    # Try to find existing org by name first
    try:
        org = Organization.objects.get(name='Quỹ Phát triển khoa học và công nghệ quốc gia')
        print(f'Found existing org by name: {org.code} - Quỹ Phát triển khoa học và công nghệ quốc gia')
    except Organization.DoesNotExist:
        # Try by code
        try:
            org = Organization.objects.get(code='QUYPTKHCN')
            print(f'Found existing org by code: QUYPTKHCN - {org.name}')
        except Organization.DoesNotExist:
            # Create new organization
            org = Organization.objects.create(
                code='QUYPTKHCN',
                name='Quỹ Phát triển khoa học và công nghệ quốc gia'
            )
            created_orgs.append(org.code)
            print(f'Created org: QUYPTKHCN - Quỹ Phát triển khoa học và công nghệ quốc gia')

    # Create user
    if not User.objects.filter(username='quy-ptkhcn').exists():
        user = User.objects.create_user(
            username='quy-ptkhcn',
            email='quy-ptkhcn@thongke.vn',
            password='ThongkeCDS@2026#',
            role='org_user',
            organization=org,
            first_name='User',
            last_name=org.code,
            is_active=True
        )
        created_users.append(user.username)
        print(f'Created user: quy-ptkhcn for org {org.code}')
    else:
        skipped_users.append('quy-ptkhcn')
        print(f'Skipped user: quy-ptkhcn (already exists)')
except Exception as e:
    errors.append(('quy-ptkhcn', str(e)))
    print(f'ERROR processing quy-ptkhcn: {e}')

# Process: Quỹ Đổi mới công nghệ quốc gia
try:
    # Try to find existing org by name first
    try:
        org = Organization.objects.get(name='Quỹ Đổi mới công nghệ quốc gia')
        print(f'Found existing org by name: {org.code} - Quỹ Đổi mới công nghệ quốc gia')
    except Organization.DoesNotExist:
        # Try by code
        try:
            org = Organization.objects.get(code='QUYDMCN')
            print(f'Found existing org by code: QUYDMCN - {org.name}')
        except Organization.DoesNotExist:
            # Create new organization
            org = Organization.objects.create(
                code='QUYDMCN',
                name='Quỹ Đổi mới công nghệ quốc gia'
            )
            created_orgs.append(org.code)
            print(f'Created org: QUYDMCN - Quỹ Đổi mới công nghệ quốc gia')

    # Create user
    if not User.objects.filter(username='quy-dmcn').exists():
        user = User.objects.create_user(
            username='quy-dmcn',
            email='quy-dmcn@thongke.vn',
            password='ThongkeCDS@2026#',
            role='org_user',
            organization=org,
            first_name='User',
            last_name=org.code,
            is_active=True
        )
        created_users.append(user.username)
        print(f'Created user: quy-dmcn for org {org.code}')
    else:
        skipped_users.append('quy-dmcn')
        print(f'Skipped user: quy-dmcn (already exists)')
except Exception as e:
    errors.append(('quy-dmcn', str(e)))
    print(f'ERROR processing quy-dmcn: {e}')

# Process: Quỹ Dịch vụ viễn thông công ích Việt Nam
try:
    # Try to find existing org by name first
    try:
        org = Organization.objects.get(name='Quỹ Dịch vụ viễn thông công ích Việt Nam')
        print(f'Found existing org by name: {org.code} - Quỹ Dịch vụ viễn thông công ích Việt Nam')
    except Organization.DoesNotExist:
        # Try by code
        try:
            org = Organization.objects.get(code='QUYDVVTCI')
            print(f'Found existing org by code: QUYDVVTCI - {org.name}')
        except Organization.DoesNotExist:
            # Create new organization
            org = Organization.objects.create(
                code='QUYDVVTCI',
                name='Quỹ Dịch vụ viễn thông công ích Việt Nam'
            )
            created_orgs.append(org.code)
            print(f'Created org: QUYDVVTCI - Quỹ Dịch vụ viễn thông công ích Việt Nam')

    # Create user
    if not User.objects.filter(username='quy-dvvtci').exists():
        user = User.objects.create_user(
            username='quy-dvvtci',
            email='quy-dvvtci@thongke.vn',
            password='ThongkeCDS@2026#',
            role='org_user',
            organization=org,
            first_name='User',
            last_name=org.code,
            is_active=True
        )
        created_users.append(user.username)
        print(f'Created user: quy-dvvtci for org {org.code}')
    else:
        skipped_users.append('quy-dvvtci')
        print(f'Skipped user: quy-dvvtci (already exists)')
except Exception as e:
    errors.append(('quy-dvvtci', str(e)))
    print(f'ERROR processing quy-dvvtci: {e}')

# Process: Viện Công nghệ số và Chuyển đổi số quốc gia
try:
    # Try to find existing org by name first
    try:
        org = Organization.objects.get(name='Viện Công nghệ số và Chuyển đổi số quốc gia')
        print(f'Found existing org by name: {org.code} - Viện Công nghệ số và Chuyển đổi số quốc gia')
    except Organization.DoesNotExist:
        # Try by code
        try:
            org = Organization.objects.get(code='VIENCNSCDS')
            print(f'Found existing org by code: VIENCNSCDS - {org.name}')
        except Organization.DoesNotExist:
            # Create new organization
            org = Organization.objects.create(
                code='VIENCNSCDS',
                name='Viện Công nghệ số và Chuyển đổi số quốc gia'
            )
            created_orgs.append(org.code)
            print(f'Created org: VIENCNSCDS - Viện Công nghệ số và Chuyển đổi số quốc gia')

    # Create user
    if not User.objects.filter(username='vien-cnscds').exists():
        user = User.objects.create_user(
            username='vien-cnscds',
            email='vien-cnscds@thongke.vn',
            password='ThongkeCDS@2026#',
            role='org_user',
            organization=org,
            first_name='User',
            last_name=org.code,
            is_active=True
        )
        created_users.append(user.username)
        print(f'Created user: vien-cnscds for org {org.code}')
    else:
        skipped_users.append('vien-cnscds')
        print(f'Skipped user: vien-cnscds (already exists)')
except Exception as e:
    errors.append(('vien-cnscds', str(e)))
    print(f'ERROR processing vien-cnscds: {e}')

# Process: Viện Năng lượng nguyên tử Việt Nam
try:
    # Try to find existing org by name first
    try:
        org = Organization.objects.get(name='Viện Năng lượng nguyên tử Việt Nam')
        print(f'Found existing org by name: {org.code} - Viện Năng lượng nguyên tử Việt Nam')
    except Organization.DoesNotExist:
        # Try by code
        try:
            org = Organization.objects.get(code='VIENNLNT')
            print(f'Found existing org by code: VIENNLNT - {org.name}')
        except Organization.DoesNotExist:
            # Create new organization
            org = Organization.objects.create(
                code='VIENNLNT',
                name='Viện Năng lượng nguyên tử Việt Nam'
            )
            created_orgs.append(org.code)
            print(f'Created org: VIENNLNT - Viện Năng lượng nguyên tử Việt Nam')

    # Create user
    if not User.objects.filter(username='vien-nlnt').exists():
        user = User.objects.create_user(
            username='vien-nlnt',
            email='vien-nlnt@thongke.vn',
            password='ThongkeCDS@2026#',
            role='org_user',
            organization=org,
            first_name='User',
            last_name=org.code,
            is_active=True
        )
        created_users.append(user.username)
        print(f'Created user: vien-nlnt for org {org.code}')
    else:
        skipped_users.append('vien-nlnt')
        print(f'Skipped user: vien-nlnt (already exists)')
except Exception as e:
    errors.append(('vien-nlnt', str(e)))
    print(f'ERROR processing vien-nlnt: {e}')

# Process: Viện Khoa học và Công nghệ Việt Nam - Hàn Quốc
try:
    # Try to find existing org by name first
    try:
        org = Organization.objects.get(name='Viện Khoa học và Công nghệ Việt Nam - Hàn Quốc')
        print(f'Found existing org by name: {org.code} - Viện Khoa học và Công nghệ Việt Nam - Hàn Quốc')
    except Organization.DoesNotExist:
        # Try by code
        try:
            org = Organization.objects.get(code='VIENVNHAN')
            print(f'Found existing org by code: VIENVNHAN - {org.name}')
        except Organization.DoesNotExist:
            # Create new organization
            org = Organization.objects.create(
                code='VIENVNHAN',
                name='Viện Khoa học và Công nghệ Việt Nam - Hàn Quốc'
            )
            created_orgs.append(org.code)
            print(f'Created org: VIENVNHAN - Viện Khoa học và Công nghệ Việt Nam - Hàn Quốc')

    # Create user
    if not User.objects.filter(username='vien-vn-han').exists():
        user = User.objects.create_user(
            username='vien-vn-han',
            email='vien-vn-han@thongke.vn',
            password='ThongkeCDS@2026#',
            role='org_user',
            organization=org,
            first_name='User',
            last_name=org.code,
            is_active=True
        )
        created_users.append(user.username)
        print(f'Created user: vien-vn-han for org {org.code}')
    else:
        skipped_users.append('vien-vn-han')
        print(f'Skipped user: vien-vn-han (already exists)')
except Exception as e:
    errors.append(('vien-vn-han', str(e)))
    print(f'ERROR processing vien-vn-han: {e}')

# Process: Viện Sở hữu trí tuệ quốc gia
try:
    # Try to find existing org by name first
    try:
        org = Organization.objects.get(name='Viện Sở hữu trí tuệ quốc gia')
        print(f'Found existing org by name: {org.code} - Viện Sở hữu trí tuệ quốc gia')
    except Organization.DoesNotExist:
        # Try by code
        try:
            org = Organization.objects.get(code='VIENSHTT')
            print(f'Found existing org by code: VIENSHTT - {org.name}')
        except Organization.DoesNotExist:
            # Create new organization
            org = Organization.objects.create(
                code='VIENSHTT',
                name='Viện Sở hữu trí tuệ quốc gia'
            )
            created_orgs.append(org.code)
            print(f'Created org: VIENSHTT - Viện Sở hữu trí tuệ quốc gia')

    # Create user
    if not User.objects.filter(username='vien-shtt').exists():
        user = User.objects.create_user(
            username='vien-shtt',
            email='vien-shtt@thongke.vn',
            password='ThongkeCDS@2026#',
            role='org_user',
            organization=org,
            first_name='User',
            last_name=org.code,
            is_active=True
        )
        created_users.append(user.username)
        print(f'Created user: vien-shtt for org {org.code}')
    else:
        skipped_users.append('vien-shtt')
        print(f'Skipped user: vien-shtt (already exists)')
except Exception as e:
    errors.append(('vien-shtt', str(e)))
    print(f'ERROR processing vien-shtt: {e}')

# Process: Viện Ứng dụng công nghệ
try:
    # Try to find existing org by name first
    try:
        org = Organization.objects.get(name='Viện Ứng dụng công nghệ')
        print(f'Found existing org by name: {org.code} - Viện Ứng dụng công nghệ')
    except Organization.DoesNotExist:
        # Try by code
        try:
            org = Organization.objects.get(code='VIENUDCN')
            print(f'Found existing org by code: VIENUDCN - {org.name}')
        except Organization.DoesNotExist:
            # Create new organization
            org = Organization.objects.create(
                code='VIENUDCN',
                name='Viện Ứng dụng công nghệ'
            )
            created_orgs.append(org.code)
            print(f'Created org: VIENUDCN - Viện Ứng dụng công nghệ')

    # Create user
    if not User.objects.filter(username='vien-udcn').exists():
        user = User.objects.create_user(
            username='vien-udcn',
            email='vien-udcn@thongke.vn',
            password='ThongkeCDS@2026#',
            role='org_user',
            organization=org,
            first_name='User',
            last_name=org.code,
            is_active=True
        )
        created_users.append(user.username)
        print(f'Created user: vien-udcn for org {org.code}')
    else:
        skipped_users.append('vien-udcn')
        print(f'Skipped user: vien-udcn (already exists)')
except Exception as e:
    errors.append(('vien-udcn', str(e)))
    print(f'ERROR processing vien-udcn: {e}')

# Process: Trung tâm Chứng thực điện tử quốc gia
try:
    # Try to find existing org by name first
    try:
        org = Organization.objects.get(name='Trung tâm Chứng thực điện tử quốc gia')
        print(f'Found existing org by name: {org.code} - Trung tâm Chứng thực điện tử quốc gia')
    except Organization.DoesNotExist:
        # Try by code
        try:
            org = Organization.objects.get(code='VNNIC')
            print(f'Found existing org by code: VNNIC - {org.name}')
        except Organization.DoesNotExist:
            # Create new organization
            org = Organization.objects.create(
                code='VNNIC',
                name='Trung tâm Chứng thực điện tử quốc gia'
            )
            created_orgs.append(org.code)
            print(f'Created org: VNNIC - Trung tâm Chứng thực điện tử quốc gia')

    # Create user
    if not User.objects.filter(username='vnnic').exists():
        user = User.objects.create_user(
            username='vnnic',
            email='vnnic@thongke.vn',
            password='ThongkeCDS@2026#',
            role='org_user',
            organization=org,
            first_name='User',
            last_name=org.code,
            is_active=True
        )
        created_users.append(user.username)
        print(f'Created user: vnnic for org {org.code}')
    else:
        skipped_users.append('vnnic')
        print(f'Skipped user: vnnic (already exists)')
except Exception as e:
    errors.append(('vnnic', str(e)))
    print(f'ERROR processing vnnic: {e}')

# Process: Trung tâm Internet Việt Nam
try:
    # Try to find existing org by name first
    try:
        org = Organization.objects.get(name='Trung tâm Internet Việt Nam')
        print(f'Found existing org by name: {org.code} - Trung tâm Internet Việt Nam')
    except Organization.DoesNotExist:
        # Try by code
        try:
            org = Organization.objects.get(code='TTINTERNET')
            print(f'Found existing org by code: TTINTERNET - {org.name}')
        except Organization.DoesNotExist:
            # Create new organization
            org = Organization.objects.create(
                code='TTINTERNET',
                name='Trung tâm Internet Việt Nam'
            )
            created_orgs.append(org.code)
            print(f'Created org: TTINTERNET - Trung tâm Internet Việt Nam')

    # Create user
    if not User.objects.filter(username='tt-internet').exists():
        user = User.objects.create_user(
            username='tt-internet',
            email='tt-internet@thongke.vn',
            password='ThongkeCDS@2026#',
            role='org_user',
            organization=org,
            first_name='User',
            last_name=org.code,
            is_active=True
        )
        created_users.append(user.username)
        print(f'Created user: tt-internet for org {org.code}')
    else:
        skipped_users.append('tt-internet')
        print(f'Skipped user: tt-internet (already exists)')
except Exception as e:
    errors.append(('tt-internet', str(e)))
    print(f'ERROR processing tt-internet: {e}')

# Process: Trung tâm Truyền thông khoa học và công nghệ
try:
    # Try to find existing org by name first
    try:
        org = Organization.objects.get(name='Trung tâm Truyền thông khoa học và công nghệ')
        print(f'Found existing org by name: {org.code} - Trung tâm Truyền thông khoa học và công nghệ')
    except Organization.DoesNotExist:
        # Try by code
        try:
            org = Organization.objects.get(code='TTTTKHCN')
            print(f'Found existing org by code: TTTTKHCN - {org.name}')
        except Organization.DoesNotExist:
            # Create new organization
            org = Organization.objects.create(
                code='TTTTKHCN',
                name='Trung tâm Truyền thông khoa học và công nghệ'
            )
            created_orgs.append(org.code)
            print(f'Created org: TTTTKHCN - Trung tâm Truyền thông khoa học và công nghệ')

    # Create user
    if not User.objects.filter(username='tt-ttkhcn').exists():
        user = User.objects.create_user(
            username='tt-ttkhcn',
            email='tt-ttkhcn@thongke.vn',
            password='ThongkeCDS@2026#',
            role='org_user',
            organization=org,
            first_name='User',
            last_name=org.code,
            is_active=True
        )
        created_users.append(user.username)
        print(f'Created user: tt-ttkhcn for org {org.code}')
    else:
        skipped_users.append('tt-ttkhcn')
        print(f'Skipped user: tt-ttkhcn (already exists)')
except Exception as e:
    errors.append(('tt-ttkhcn', str(e)))
    print(f'ERROR processing tt-ttkhcn: {e}')

# Process: Nhà Xuất bản Khoa học - Công nghệ - Truyền thông
try:
    # Try to find existing org by name first
    try:
        org = Organization.objects.get(name='Nhà Xuất bản Khoa học - Công nghệ - Truyền thông')
        print(f'Found existing org by name: {org.code} - Nhà Xuất bản Khoa học - Công nghệ - Truyền thông')
    except Organization.DoesNotExist:
        # Try by code
        try:
            org = Organization.objects.get(code='NXBKHCNTT')
            print(f'Found existing org by code: NXBKHCNTT - {org.name}')
        except Organization.DoesNotExist:
            # Create new organization
            org = Organization.objects.create(
                code='NXBKHCNTT',
                name='Nhà Xuất bản Khoa học - Công nghệ - Truyền thông'
            )
            created_orgs.append(org.code)
            print(f'Created org: NXBKHCNTT - Nhà Xuất bản Khoa học - Công nghệ - Truyền thông')

    # Create user
    if not User.objects.filter(username='nxb-khcntt').exists():
        user = User.objects.create_user(
            username='nxb-khcntt',
            email='nxb-khcntt@thongke.vn',
            password='ThongkeCDS@2026#',
            role='org_user',
            organization=org,
            first_name='User',
            last_name=org.code,
            is_active=True
        )
        created_users.append(user.username)
        print(f'Created user: nxb-khcntt for org {org.code}')
    else:
        skipped_users.append('nxb-khcntt')
        print(f'Skipped user: nxb-khcntt (already exists)')
except Exception as e:
    errors.append(('nxb-khcntt', str(e)))
    print(f'ERROR processing nxb-khcntt: {e}')

# Process: Trường Cao đẳng Thông tin và Truyền thông
try:
    # Try to find existing org by name first
    try:
        org = Organization.objects.get(name='Trường Cao đẳng Thông tin và Truyền thông')
        print(f'Found existing org by name: {org.code} - Trường Cao đẳng Thông tin và Truyền thông')
    except Organization.DoesNotExist:
        # Try by code
        try:
            org = Organization.objects.get(code='CDTTTT')
            print(f'Found existing org by code: CDTTTT - {org.name}')
        except Organization.DoesNotExist:
            # Create new organization
            org = Organization.objects.create(
                code='CDTTTT',
                name='Trường Cao đẳng Thông tin và Truyền thông'
            )
            created_orgs.append(org.code)
            print(f'Created org: CDTTTT - Trường Cao đẳng Thông tin và Truyền thông')

    # Create user
    if not User.objects.filter(username='cd-tttt').exists():
        user = User.objects.create_user(
            username='cd-tttt',
            email='cd-tttt@thongke.vn',
            password='ThongkeCDS@2026#',
            role='org_user',
            organization=org,
            first_name='User',
            last_name=org.code,
            is_active=True
        )
        created_users.append(user.username)
        print(f'Created user: cd-tttt for org {org.code}')
    else:
        skipped_users.append('cd-tttt')
        print(f'Skipped user: cd-tttt (already exists)')
except Exception as e:
    errors.append(('cd-tttt', str(e)))
    print(f'ERROR processing cd-tttt: {e}')

print('\n=== Summary ===')
print(f'Organizations created: {len(created_orgs)}')
print(f'Users created: {len(created_users)}')
print(f'Users skipped: {len(skipped_users)}')
print(f'Errors: {len(errors)}')
if errors:
    print('\nErrors:')
    for username, error in errors:
        print(f'  - {username}: {error}')