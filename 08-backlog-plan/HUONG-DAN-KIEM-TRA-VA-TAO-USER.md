# Hướng Dẫn Kiểm Tra và Tạo User Cho Các Đơn Vị

## 📋 Tổng Quan

Script này giúp bạn:
1. ✅ Kiểm tra tổng số đơn vị trong database
2. ✅ Kiểm tra tổng số user type "đơn vị" (role='org_user')
3. ✅ Tìm các đơn vị đang thiếu user
4. ✅ Tạo user cho các đơn vị thiếu user (dựa trên file Excel)

---

## 📁 Files Đã Tạo

### 1. SQL Query File
**File**: `check-database-state.sql`

Chứa các queries để kiểm tra:
- Tổng số đơn vị
- Tổng số user đơn vị
- Danh sách đơn vị có user
- Danh sách đơn vị thiếu user
- Thống kê tổng hợp

### 2. Shell Script - Chạy Kiểm Tra
**File**: `RUN-check-database.sh`

Script bash để chạy các queries kiểm tra database.

### 3. Python Script - Tạo User Tự Động
**File**: `check-and-create-missing-users.py`

Script Django để:
- Đọc file Excel `danh-sach-tai-khoan-don-vi-ok.xlsx`
- Tìm các đơn vị thiếu user
- Tạo user tự động cho các đơn vị thiếu

---

## 🚀 Cách Sử Dụng

### Bước 1: Kiểm Tra Database (Chỉ xem, không sửa)

```bash
cd "/Users/shimazu/Dropbox/9. active/consultant/support_b4t/thong_ke_he_thong/08-backlog-plan"
./RUN-check-database.sh
```

**Script này sẽ:**
1. Tự động tìm và khởi động Docker (nếu chưa chạy)
2. Chạy queries kiểm tra database
3. Hiển thị kết quả:
   - Tổng số đơn vị
   - Tổng số user đơn vị
   - Danh sách đơn vị có user
   - Danh sách đơn vị THIẾU user

**Output mẫu:**
```
======================================================================
1️⃣  TỔNG SỐ ĐƠN VỊ (ORGANIZATIONS)
======================================================================
Tổng số đơn vị
--------------
        39

======================================================================
2️⃣  TỔNG SỐ USER TYPE ĐƠN VỊ (role = org_user)
======================================================================
Tổng số user đơn vị
-------------------
        34

======================================================================
4️⃣  DANH SÁCH CÁC ĐƠN VỊ THIẾU USER
======================================================================
Mã đơn vị          | Tên đơn vị
-------------------+------------------------------------
SOKHDT_HANOI       | Sở Khoa học và Công nghệ Hà Nội
...
```

---

### Bước 2: Tạo User Cho Các Đơn Vị Thiếu (Nếu Có)

#### Phương án A: Chạy qua Docker (Khuyên dùng)

```bash
cd "/Users/shimazu/Dropbox/9. active/consultant/support_b4t/thong_ke_he_thong"

# Copy script vào container
docker compose cp 08-backlog-plan/check-and-create-missing-users.py backend:/app/

# Chạy script
docker compose exec backend python /app/check-and-create-missing-users.py
```

#### Phương án B: Chạy qua Django Management Command

```bash
cd "/Users/shimazu/Dropbox/9. active/consultant/support_b4t/thong_ke_he_thong"

# Chạy Python script như Django shell
docker compose exec backend python manage.py shell < 08-backlog-plan/check-and-create-missing-users.py
```

#### Phương án C: Tạo User Thủ Công

Nếu chỉ thiếu vài user, bạn có thể tạo thủ công:

```bash
# Vào Django shell
docker compose exec backend python manage.py shell

# Trong shell, chạy lệnh:
from django.contrib.auth import get_user_model
from apps.organizations.models import Organization

User = get_user_model()

# Tìm đơn vị thiếu user (ví dụ: SOKHDT_HANOI)
org = Organization.objects.get(code='SOKHDT_HANOI')

# Tạo user
user = User.objects.create_user(
    username='sokhdt-hanoi',
    email='sokhdt-hanoi@thongke.vn',
    password='ThongkeCDS@2026#',
    role='org_user',
    organization=org,
    first_name='User',
    last_name='SOKHDT_HANOI',
    is_active=True
)

print(f"✅ Tạo thành công user: {user.username}")
```

---

## 📊 Hiểu Kết Quả

### Tình Huống 1: Tất Cả Đơn Vị Đã Có User
```
📊 Thống kê tổng hợp:
Tổng đơn vị | Có user | Thiếu user
------------+---------+-----------
     39     |    39   |     0

✅ HOÀN HẢO! Không cần làm gì thêm.
```

### Tình Huống 2: Một Số Đơn Vị Thiếu User
```
📊 Thống kê tổng hợp:
Tổng đơn vị | Có user | Thiếu user
------------+---------+-----------
     39     |    34   |     5

⚠️  CẦN TẠO USER CHO 5 ĐƠN VỊ
```

**Các bước tiếp theo:**
1. Xem danh sách các đơn vị thiếu user (trong output Section 4️⃣)
2. Kiểm tra file Excel `danh-sach-tai-khoan-don-vi-ok.xlsx` xem có username/password cho các đơn vị này không
3. Chạy script `check-and-create-missing-users.py` để tạo tự động
4. Hoặc tạo thủ công từng user

---

## 🔍 Troubleshooting

### Lỗi: "Docker không chạy"
**Giải pháp:**
1. Mở Docker Desktop
2. Đợi cho đến khi thấy icon Docker màu xanh lá
3. Chạy lại script

### Lỗi: "Command not found: docker"
**Giải pháp:**
```bash
# Kiểm tra Docker có cài không
ls -la /usr/local/bin/docker

# Nếu không có, cài Docker Desktop:
# https://www.docker.com/products/docker-desktop/
```

### Lỗi: "No such file or directory"
**Giải pháp:**
```bash
# Đảm bảo bạn đang ở đúng thư mục
cd "/Users/shimazu/Dropbox/9. active/consultant/support_b4t/thong_ke_he_thong"

# Kiểm tra containers đang chạy
docker compose ps
```

### Script Không Đọc Được File Excel
**Giải pháp:**
1. Kiểm tra file Excel tồn tại:
   ```bash
   ls -la /Users/shimazu/Dropbox/9.\ active/consultant/support_b4t/thong_ke_he_thong/03-research/danh-sach-tai-khoan-don-vi-ok.xlsx
   ```
2. Cài openpyxl trong container:
   ```bash
   docker compose exec backend pip install openpyxl
   ```

---

## 📝 Ghi Chú

### Về Password
- Tất cả user đơn vị dùng password: `ThongkeCDS@2026#`
- Password được hash bằng Django's `make_password()` - AN TOÀN
- User phải đổi password sau lần đăng nhập đầu tiên

### Về Username Format
Script tự động tạo username theo pattern:
- Từ org code: `SOKHDT_HANOI` → `sokhdt-hanoi`
- Hoặc từ tên: `Sở KHCN Hà Nội` → `so-khcn-ha-noi`

### Về Organization Matching
Script thông minh match đơn vị từ Excel với database:
1. So khớp tên chính xác
2. So khớp tên gần đúng (lowercase, ignore diacritics)
3. Fallback: tạo username từ org code

---

## ✅ Checklist Sau Khi Tạo User

- [ ] Kiểm tra lại database: `./RUN-check-database.sh`
- [ ] Verify tổng số user = tổng số đơn vị
- [ ] Test đăng nhập với 1-2 user mới tạo
- [ ] Gửi thông tin tài khoản cho các đơn vị
- [ ] Yêu cầu các đơn vị đổi password

---

## 🆘 Cần Trợ Giúp?

Nếu gặp vấn đề, cung cấp thông tin sau:
1. Output của `./RUN-check-database.sh`
2. Output của `docker compose ps`
3. Error message đầy đủ
4. Screenshot (nếu có)

---

**Created**: 2026-01-21
**Version**: 1.0
**Status**: ✅ READY TO USE
