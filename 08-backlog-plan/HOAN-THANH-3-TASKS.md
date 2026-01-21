# HOÀN THÀNH 3 TASKS

## ✅ Task 1: Hide columns trong trang Quản lý người dùng

**File**: `frontend/src/pages/Users.tsx`

**Thay đổi**:
- ✅ Đã ẩn column "Email" (lines 177-183)
- ✅ Đã ẩn column "Họ và tên" (lines 184-195)

**Kết quả**: Bảng Users giờ chỉ hiển thị:
- Tên đăng nhập
- Vai trò
- Đơn vị
- Trạng thái
- Hành động

---

## ✅ Task 2: Xóa toàn bộ email của users

**Files tạo**:
- `08-backlog-plan/clear-all-emails.sql` - SQL script
- `08-backlog-plan/RUN-clear-emails.sh` - Shell script để chạy

**Cách chạy**:
```bash
cd "/Users/shimazu/Dropbox/9. active/consultant/support_b4t/thong_ke_he_thong"

# Method 1: Run shell script
bash 08-backlog-plan/RUN-clear-emails.sh

# Method 2: Run SQL directly
cat 08-backlog-plan/clear-all-emails.sql | docker compose exec -T postgres psql -U postgres -d thongke
```

**SQL thực hiện**:
```sql
UPDATE users SET email = '' WHERE TRUE;
```

**Kết quả**: Tất cả users sẽ có email = '' (empty string)

---

## ✅ Task 3: Hiển thị tổng số đơn vị

**File**: `frontend/src/pages/Organizations.tsx`

**Thay đổi**:
- Thêm dòng hiển thị tổng số đơn vị bên dưới tiêu đề "Danh sách Đơn vị"
- Format: "Tổng số: **XX** đơn vị" (số màu xanh, bold)

**Vị trí**: Header của trang, ngay dưới tiêu đề "Danh sách Đơn vị"

**Kết quả**: User có thể dễ dàng kiểm tra tổng số đơn vị có trong hệ thống

---

## 🚀 Deploy Frontend Changes

Để áp dụng thay đổi frontend, chạy:

```bash
cd "/Users/shimazu/Dropbox/9. active/consultant/support_b4t/thong_ke_he_thong"

# Rebuild frontend
cd frontend
npm run build

# Restart services
cd ..
docker compose restart frontend
```

---

## 📋 Checklist hoàn thành

- [x] Hide column Email trong trang Users
- [x] Hide column Họ và tên trong trang Users
- [x] Tạo SQL script xóa toàn bộ email
- [x] Tạo shell script để chạy SQL
- [x] Hiển thị tổng số đơn vị trong trang Organizations
- [ ] **TODO**: User cần chạy script clear emails
- [ ] **TODO**: User cần rebuild và restart frontend

---

## 🔍 Kiểm tra sau khi deploy

### 1. Kiểm tra trang Users
- Vào `/users`
- Verify: Không thấy columns "Email" và "Họ và tên"

### 2. Kiểm tra email đã xóa
```bash
docker compose exec postgres psql -U postgres -d thongke -c "SELECT username, email FROM users WHERE is_superuser = false LIMIT 10;"
```
Tất cả email phải là empty string.

### 3. Kiểm tra trang Organizations
- Vào `/organizations`
- Verify: Thấy dòng "Tổng số: XX đơn vị" ngay dưới tiêu đề

---

## 📝 Ghi chú

- Frontend changes cần rebuild mới có hiệu lực
- SQL script xóa email cần chạy 1 lần duy nhất
- Tổng số đơn vị sẽ tự động cập nhật khi thêm/xóa đơn vị
