# 🚀 HƯỚNG DẪN DEPLOY TẤT CẢ THAY ĐỔI LÊN PRODUCTION

## 📋 Tổng quan các thay đổi

### 1. Database Changes
- ✅ Xóa toàn bộ email của users (set email = '')

### 2. Frontend UI Changes
- ✅ **Trang Quản lý người dùng**: Ẩn columns "Email" và "Họ và tên"
- ✅ **Trang Danh sách Đơn vị**: Hiển thị tổng số đơn vị
- ✅ **Dashboard**: Xóa dummy data trong "Hoạt động gần đây"

---

## 🎯 CÁCH DEPLOY - 1 LỆNH DUY NHẤT

### Option 1: Chạy script tự động (KHUYẾN NGHỊ)

Mở Terminal và chạy:

```bash
bash "/Users/shimazu/Dropbox/9. active/consultant/support_b4t/thong_ke_he_thong/08-backlog-plan/DEPLOY-ALL-CHANGES.sh"
```

Script sẽ tự động:
1. Xóa emails trong database
2. Rebuild frontend
3. Restart services
4. Verify deployment

**Thời gian**: ~2-3 phút

---

### Option 2: Chạy từng bước thủ công

Nếu muốn chạy từng bước, làm theo:

#### Bước 1: Xóa emails

```bash
cd "/Users/shimazu/Dropbox/9. active/consultant/support_b4t/thong_ke_he_thong"
cat 08-backlog-plan/clear-all-emails.sql | docker compose exec -T postgres psql -U postgres -d thongke
```

#### Bước 2: Rebuild frontend

```bash
cd "/Users/shimazu/Dropbox/9. active/consultant/support_b4t/thong_ke_he_thong/frontend"
npm run build
```

#### Bước 3: Restart frontend service

```bash
cd "/Users/shimazu/Dropbox/9. active/consultant/support_b4t/thong_ke_he_thong"
docker compose restart frontend
```

#### Bước 4: Verify

```bash
# Check services
docker compose ps

# Check emails cleared
docker compose exec postgres psql -U postgres -d thongke -c "SELECT COUNT(*) as total, SUM(CASE WHEN email = '' THEN 1 ELSE 0 END) as empty_emails FROM users;"
```

---

## ✅ Kiểm tra sau khi deploy

### 1. Kiểm tra trang Quản lý người dùng
- Truy cập: https://hientrangcds.mst.gov.vn/users
- ✅ Verify: Không thấy columns "Email" và "Họ và tên"
- ✅ Verify: Chỉ còn: Tên đăng nhập | Vai trò | Đơn vị | Trạng thái | Hành động

### 2. Kiểm tra trang Danh sách Đơn vị
- Truy cập: https://hientrangcds.mst.gov.vn/organizations
- ✅ Verify: Thấy dòng "Tổng số: **XX** đơn vị" ngay dưới tiêu đề

### 3. Kiểm tra Dashboard
- Truy cập: https://hientrangcds.mst.gov.vn (admin dashboard)
- ✅ Verify: Mục "Hoạt động gần đây" TRỐNG (không có dummy data)

### 4. Kiểm tra database
```bash
docker compose exec postgres psql -U postgres -d thongke -c "SELECT username, email FROM users LIMIT 10;"
```
- ✅ Verify: Tất cả email đều là empty string (rỗng)

---

## 🔧 Troubleshooting

### Vấn đề 1: Chưa thấy thay đổi UI
**Giải pháp**: Hard refresh browser
- Chrome/Firefox: `Ctrl + Shift + R` (Windows) hoặc `Cmd + Shift + R` (Mac)
- Hoặc xóa cache browser

### Vấn đề 2: Frontend build failed
**Giải pháp**:
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Vấn đề 3: Docker services không start
**Giải pháp**:
```bash
docker compose down
docker compose up -d
```

### Vấn đề 4: Cannot connect to Docker
**Giải pháp**: Đảm bảo Docker Desktop đang chạy

---

## 📁 Files liên quan

Các files đã được tạo/chỉnh sửa:

### Database Scripts
- `08-backlog-plan/clear-all-emails.sql` - SQL xóa emails
- `08-backlog-plan/RUN-clear-emails.sh` - Shell script xóa emails

### Frontend Changes
- `frontend/src/pages/Users.tsx` - Ẩn columns Email và Họ và tên
- `frontend/src/pages/Organizations.tsx` - Hiển thị tổng số đơn vị
- `frontend/src/pages/Dashboard.tsx` - Xóa dummy data "Hoạt động gần đây"

### Deployment Scripts
- `08-backlog-plan/DEPLOY-ALL-CHANGES.sh` - Script deploy tự động
- `08-backlog-plan/DEPLOY-INSTRUCTIONS.md` - File này

---

## 🎉 Kết luận

Sau khi chạy script deployment, tất cả thay đổi sẽ có hiệu lực ngay lập tức.

**URL production**: https://hientrangcds.mst.gov.vn

Nếu gặp vấn đề, kiểm tra logs:
```bash
docker compose logs -f frontend
docker compose logs -f backend
```

---

## 📞 Support

Nếu cần hỗ trợ, cung cấp:
1. Output của `docker compose ps`
2. Logs của services có vấn đề
3. Screenshots lỗi (nếu có)
