# Tài khoản Hệ thống

**Production URL:** https://thongkehethong.mindmaid.ai

---

## 1. Tài khoản Admin

**Quản trị viên hệ thống**

- **Username:** admin
- **Email:** admin@mindmaid.ai
- **Password:** [Xem ADMIN_CREDENTIALS.md]
- **Role:** admin (Quản trị viên)

**Quyền hạn:**
- ✅ Toàn quyền truy cập hệ thống
- ✅ Quản lý người dùng (tạo, sửa, xóa, kích hoạt/vô hiệu hóa)
- ✅ Quản lý đơn vị (tạo, sửa, xóa)
- ✅ Xem tất cả hệ thống của mọi đơn vị
- ✅ Tạo/sửa/xóa hệ thống cho bất kỳ đơn vị nào

**Menu hiển thị:**
- 📊 Dashboard
- 💻 Hệ thống
- 🏢 Đơn vị
- 👥 Người dùng

---

## 2. Tài khoản Organization Users

**Người dùng đơn vị (Sample Accounts)**

### 2.1 Sở Khoa học và Công nghệ Hà Nội (SKHCN-HN)

- **Username:** org1
- **Email:** org1@example.com
- **Password:** Test1234!
- **Role:** org_user (Người dùng đơn vị)
- **Organization:** Sở Khoa học và Công nghệ Hà Nội
- **Organization Code:** SKHCN-HN

**Quyền hạn:**
- ✅ Xem Dashboard (chỉ dữ liệu đơn vị mình)
- ✅ Quản lý hệ thống CNTT của đơn vị SKHCN-HN
- ✅ Tạo/sửa/xóa hệ thống cho đơn vị mình
- ❌ KHÔNG thể xem hệ thống của đơn vị khác
- ❌ KHÔNG thể truy cập Người dùng
- ❌ KHÔNG thể truy cập Đơn vị

**Menu hiển thị:**
- 📊 Dashboard
- 💻 Hệ thống

---

### 2.2 Viện Khoa học Công nghệ Việt Nam (VAST-TEST)

- **Username:** org2
- **Email:** org2@example.com
- **Password:** Test1234!
- **Role:** org_user (Người dùng đơn vị)
- **Organization:** Viện Khoa học Công nghệ Việt Nam
- **Organization Code:** VAST-TEST

**Quyền hạn:**
- ✅ Xem Dashboard (chỉ dữ liệu đơn vị mình)
- ✅ Quản lý hệ thống CNTT của đơn vị VAST-TEST
- ✅ Tạo/sửa/xóa hệ thống cho đơn vị mình
- ❌ KHÔNG thể xem hệ thống của đơn vị khác
- ❌ KHÔNG thể truy cập Người dùng
- ❌ KHÔNG thể truy cập Đơn vị

**Menu hiển thị:**
- 📊 Dashboard
- 💻 Hệ thống

---

## 3. So sánh quyền hạn

| Tính năng | Admin | Org User |
|-----------|-------|----------|
| Đăng nhập hệ thống | ✅ | ✅ |
| Xem Dashboard | ✅ Tất cả | ✅ Chỉ đơn vị mình |
| Xem danh sách Hệ thống | ✅ Tất cả | ✅ Chỉ đơn vị mình |
| Tạo Hệ thống | ✅ Cho mọi đơn vị | ✅ Chỉ cho đơn vị mình |
| Sửa Hệ thống | ✅ Tất cả | ✅ Chỉ của đơn vị mình |
| Xóa Hệ thống | ✅ Tất cả | ✅ Chỉ của đơn vị mình |
| Xem Đơn vị | ✅ | ❌ |
| Tạo/Sửa/Xóa Đơn vị | ✅ | ❌ |
| Xem Người dùng | ✅ | ❌ |
| Tạo/Sửa/Xóa Người dùng | ✅ | ❌ |
| Kích hoạt/Vô hiệu hóa User | ✅ | ❌ |

---

## 4. Cách tạo tài khoản mới

### 4.1 Qua Web Interface (Admin only)

1. Đăng nhập với tài khoản admin
2. Vào menu "Người dùng"
3. Click "Tạo người dùng"
4. Điền form:
   - Tên đăng nhập: (VD: org3)
   - Email: (VD: org3@example.com)
   - Mật khẩu: (VD: Test1234!)
   - Họ: (VD: User)
   - Tên: (VD: Tên đơn vị)
   - Vai trò: Người dùng đơn vị
   - Đơn vị: Chọn đơn vị
5. Click "Tạo người dùng"

### 4.2 Qua Django Shell (SSH to server)

```bash
# SSH vào server
ssh admin_@34.142.152.104

# Vào shell
docker compose exec backend python manage.py shell

# Tạo user
from apps.accounts.models import User
from apps.organizations.models import Organization

# Lấy organization
org = Organization.objects.get(code="ORG_CODE")

# Tạo user
user = User.objects.create_user(
    username="orgX",
    email="orgX@example.com",
    password="Test1234!",
    role='org_user',
    organization=org,
    first_name="User",
    last_name=org.code,
    is_active=True
)

print(f"Created: {user.username} for {org.name}")
exit()
```

### 4.3 Qua Script (Bulk creation)

Sử dụng script `create_sample_users.py` (xem P0.5_DEPLOYMENT_GUIDE.md Step 9)

---

## 5. Quản lý tài khoản

### 5.1 Kích hoạt/Vô hiệu hóa user

**Admin only:**
1. Vào "Người dùng"
2. Tìm user cần xử lý
3. Click "Kích hoạt" hoặc "Vô hiệu hóa"

**Trạng thái:**
- 🟢 **Hoạt động** (is_active=True): User có thể đăng nhập
- 🔴 **Vô hiệu hóa** (is_active=False): User KHÔNG thể đăng nhập

### 5.2 Reset mật khẩu

**Hiện tại cần làm qua Django shell:**

```bash
docker compose exec backend python manage.py shell

from apps.accounts.models import User
user = User.objects.get(username="USERNAME")
user.set_password("NEW_PASSWORD")
user.save()
print(f"Password updated for {user.username}")
exit()
```

**Lưu ý:** Tính năng đổi mật khẩu qua web sẽ có trong P1.

### 5.3 Xóa user (Không khuyến nghị)

Nên **vô hiệu hóa** thay vì xóa để giữ lại dữ liệu lịch sử.

Nếu thực sự cần xóa:
```bash
docker compose exec backend python manage.py shell

from apps.accounts.models import User
user = User.objects.get(username="USERNAME")
user.delete()
exit()
```

---

## 6. Bảo mật

### 6.1 Yêu cầu mật khẩu

Mật khẩu phải:
- Ít nhất 8 ký tự
- Chứa chữ hoa, chữ thường, số
- Có thể chứa ký tự đặc biệt

Ví dụ mật khẩu hợp lệ:
- `Test1234!`
- `Bkhcn@2026`
- `SecurePass123`

### 6.2 Lưu ý bảo mật

- ⚠️ Đổi mật khẩu mẫu (`Test1234!`) ngay sau khi nhận tài khoản
- ⚠️ Không chia sẻ mật khẩu qua email/chat
- ⚠️ Sử dụng mật khẩu mạnh, khác nhau cho từng tài khoản
- ⚠️ Đăng xuất sau khi sử dụng xong

### 6.3 Session và token

- Access token có thời hạn (thiết lập trong backend settings)
- Sau khi hết hạn, user cần đăng nhập lại
- Session được lưu trong localStorage của browser

---

## 7. Troubleshooting

### User không đăng nhập được

**Kiểm tra:**
1. Username/Password có đúng không?
2. User có bị vô hiệu hóa không? (is_active=False)
3. Organization của user có tồn tại không?
4. Backend có lỗi không? (check logs)

**Verify qua shell:**
```bash
docker compose exec backend python manage.py shell

from apps.accounts.models import User
user = User.objects.get(username="USERNAME")
print(f"Active: {user.is_active}")
print(f"Role: {user.role}")
print(f"Organization: {user.organization}")
exit()
```

### User thấy menu không đúng

**Expected behavior:**
- Admin: thấy Dashboard, Hệ thống, Đơn vị, Người dùng
- Org User: chỉ thấy Dashboard, Hệ thống

**Nếu sai:**
1. Kiểm tra role của user:
```bash
docker compose exec backend python manage.py shell
from apps.accounts.models import User
user = User.objects.get(username="USERNAME")
print(user.role)  # Should be 'admin' or 'org_user'
exit()
```

2. Xóa cache browser và đăng nhập lại

### Org user thấy hệ thống của đơn vị khác

**This should NOT happen!** Đây là bug nghiêm trọng về data isolation.

**Debug:**
1. Check backend logs:
```bash
docker compose logs backend --tail=100 | grep -i error
```

2. Verify API filtering:
```bash
# Test với token của org user
curl -H "Authorization: Bearer TOKEN" https://thongkehethong.mindmaid.ai/api/systems/
```

3. Contact development team immediately!

---

## 8. Next Steps

### Sau khi deploy P0.5

1. **Tạo real organization users:**
   - Lấy danh sách đơn vị và người phụ trách
   - Tạo tài khoản cho từng đơn vị
   - Gửi thông tin đăng nhập cho người phụ trách

2. **Hướng dẫn end-users:**
   - Gửi USER_GUIDE.md
   - Tổ chức training session nếu cần
   - Hỗ trợ onboarding

3. **Monitoring:**
   - Theo dõi logs để phát hiện lỗi sớm
   - Thu thập feedback từ users
   - Fix bugs nếu phát hiện

4. **Planning P1:**
   - Mobile-responsive design
   - Change password feature
   - Export reports (Excel/PDF)
   - Remember Me login

---

**Cập nhật lần cuối:** 2026-01-17
**Phiên bản:** P0.5 Multi-Tenancy
**Status:** ✅ Production Ready
