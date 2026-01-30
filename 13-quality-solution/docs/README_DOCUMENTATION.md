# Tài liệu Hệ thống Báo cáo Thống kê - Bộ KH&CN

**Production URL:** https://thongkehethong.mindmaid.ai
**Version:** P0.5 Multi-Tenancy
**Status:** ✅ Deployed and Verified
**Date:** 2026-01-17

---

## 📚 Danh sách tài liệu

### 1. Deployment & Technical Documentation

#### 📘 [P0.5_DEPLOYMENT_GUIDE.md](./P0.5_DEPLOYMENT_GUIDE.md)
**Dành cho: DevOps, System Admin**

Hướng dẫn chi tiết từng bước để deploy P0.5 Multi-Tenancy lên production server.

**Nội dung:**
- Hướng dẫn deployment từng bước (Step 1-10)
- ⚠️ **Bug fix quan trọng** (Step 8.1): Xử lý paginated API responses
- Hướng dẫn tạo sample organization users
- Troubleshooting guide
- Rollback plan

**Khi nào dùng:**
- Triển khai P0.5 lần đầu
- Redeploy sau khi có updates
- Gặp issues cần troubleshoot
- Tạo organization users mới

---

#### 📗 [P0.5_DEPLOYMENT_STATUS.md](./P0.5_DEPLOYMENT_STATUS.md)
**Dành cho: Project Manager, Technical Lead**

Báo cáo tổng hợp chi tiết về deployment P0.5.

**Nội dung:**
- Deployment summary
- Post-deployment bug fix (TypeError: fe.some)
- Verification results (browser testing)
- Production user accounts
- Technical details (commits, migrations, containers)
- Remaining tasks

**Khi nào dùng:**
- Review deployment status
- Báo cáo cho stakeholders
- Kiểm tra checklist hoàn thành
- Reference cho future deployments

---

#### 📙 [ACCOUNTS.md](./ACCOUNTS.md)
**Dành cho: Admin, DevOps**

Tài liệu chi tiết về quản lý tài khoản và phân quyền.

**Nội dung:**
- Admin account details
- Organization user accounts (org1, org2)
- Quyền hạn và so sánh (Admin vs Org User)
- Cách tạo tài khoản mới (Web UI, Django shell, Script)
- Quản lý tài khoản (kích hoạt/vô hiệu hóa, reset password)
- Bảo mật và troubleshooting

**Khi nào dùng:**
- Tạo tài khoản cho đơn vị mới
- Reset password cho users
- Kiểm tra quyền hạn của từng role
- Troubleshoot login issues

---

### 2. User Documentation

#### 📕 [USER_GUIDE.md](./USER_GUIDE.md)
**Dành cho: Organization Users (End Users)**

Hướng dẫn sử dụng hệ thống cho người dùng đơn vị.

**Nội dung:**
- Hướng dẫn đăng nhập
- Giới thiệu giao diện (Dashboard, Menu)
- Quản lý hệ thống CNTT (Tạo, Xem, Sửa, Xóa)
- Tìm kiếm và lọc
- Cấp độ biểu mẫu (Cấp 1 vs Cấp 2)
- Trạng thái và mức độ quan trọng
- FAQs
- Lưu ý bảo mật
- Hỗ trợ kỹ thuật

**Khi nào dùng:**
- Onboarding users mới
- Training sessions
- User support
- Reference khi sử dụng hệ thống

---

### 3. Credentials (Private)

#### 🔐 [ADMIN_CREDENTIALS.md](./ADMIN_CREDENTIALS.md)
**⚠️ CONFIDENTIAL - Admin Only**

Thông tin đăng nhập server và admin account.

**Lưu ý bảo mật:**
- ⛔ KHÔNG commit lên Git
- ⛔ KHÔNG share qua email/chat
- ✅ Lưu trữ an toàn (password manager, encrypted storage)
- ✅ Chỉ cấp cho người có quyền

---

### 4. Deployment Resources (Scripts)

#### 🔧 [create_sample_users.py](./create_sample_users.py)
**Dành cho: Admin, DevOps**

Script tự động tạo organization user accounts cho tất cả organizations.

**Usage:**
```bash
docker compose exec backend python manage.py shell < create_sample_users.py
```

**Output:**
- Tạo user với pattern: org1, org2, org3, ...
- Password mặc định: Test1234!
- In ra danh sách credentials

---

#### 🔧 [test-multi-tenancy.sh](./test-multi-tenancy.sh)
**Dành cho: QA, DevOps**

Script tự động test các tính năng multi-tenancy trên production.

**Usage:**
```bash
./test-multi-tenancy.sh
```

**Tests:**
- Admin login
- Users API access
- Organizations API
- Systems API
- Organization user creation
- Org user login
- Permission checks

---

## 🎯 Quick Start Guide

### Cho Admin/DevOps

1. **Deployment mới:**
   - Đọc: [P0.5_DEPLOYMENT_GUIDE.md](./P0.5_DEPLOYMENT_GUIDE.md)
   - Follow từng bước 1-10
   - ⚠️ Nhớ apply bug fix ở Step 8.1

2. **Tạo organization users:**
   - Xem: [ACCOUNTS.md](./ACCOUNTS.md) - Section 4
   - Method 1: Web UI (đơn giản)
   - Method 2: Script (bulk)

3. **Troubleshooting:**
   - Check: [P0.5_DEPLOYMENT_GUIDE.md](./P0.5_DEPLOYMENT_GUIDE.md) - Troubleshooting section
   - Check: [ACCOUNTS.md](./ACCOUNTS.md) - Section 7

### Cho End Users

1. **Đăng nhập lần đầu:**
   - Đọc: [USER_GUIDE.md](./USER_GUIDE.md) - Section 1
   - URL: https://thongkehethong.mindmaid.ai/login
   - Nhận credentials từ admin

2. **Sử dụng hệ thống:**
   - Đọc: [USER_GUIDE.md](./USER_GUIDE.md) - Section 3 (Quản lý Hệ thống)
   - Tạo hệ thống mới
   - Cập nhật thông tin

3. **Câu hỏi thường gặp:**
   - Đọc: [USER_GUIDE.md](./USER_GUIDE.md) - Section 10 (FAQs)

---

## 🚀 Features (P0.5)

### ✅ Deployed Features

- **Multi-Tenancy**: Mỗi organization chỉ thấy data của mình
- **Role-Based Access Control (RBAC)**:
  - Admin: Toàn quyền
  - Org User: Chỉ quản lý hệ thống đơn vị mình
- **User Management**: Admin có thể tạo/quản lý users
- **Data Isolation**: Backend API filtering theo organization
- **Conditional UI**: Menu hiển thị theo role

### 🐛 Bug Fixed

- **Pagination handling**: Fixed TypeError khi Users/Organizations API trả về paginated response
- **Docker build cache**: Đã resolve issues với frontend rebuild

---

## 📊 Current Status

### Production Data

**Organizations:** 2
- Sở Khoa học và Công nghệ Hà Nội (SKHCN-HN)
- Viện Khoa học Công nghệ Việt Nam (VAST-TEST)

**Users:** 4
- 1 admin user
- 2 organization users (org1, org2)
- 1 test user (testorg1768622669)

**Systems:** 1
- 1 system in SKHCN-HN

### Container Status

All containers running:
- ✅ backend (Django API)
- ✅ frontend (React + Vite)
- ✅ nginx (reverse proxy)
- ✅ postgres (database)

---

## 🔜 Roadmap

### P1 Features (Next Release)

- **Mobile Responsive Design** (8 hours)
  - Tối ưu cho điện thoại và tablet
  - Touch-friendly UI

- **UI/UX Improvements** (6 hours)
  - Modernize interface
  - Improve user experience

- **Remember Me Login** (2 hours)
  - Persistent login session
  - Better user convenience

- **Change Password** (3 hours)
  - Self-service password change
  - Password strength validation

- **Export Reports** (4 hours)
  - Excel export
  - PDF export

---

## 📞 Support

### For Technical Issues

**Check documentation:**
1. [P0.5_DEPLOYMENT_GUIDE.md](./P0.5_DEPLOYMENT_GUIDE.md) - Troubleshooting
2. [ACCOUNTS.md](./ACCOUNTS.md) - Section 7

**Check logs:**
```bash
# Backend logs
docker compose logs backend --tail=100

# Frontend logs
docker compose logs frontend --tail=50

# All containers
docker compose ps
```

**Contact:**
- Email: [admin email]
- Phone: [support phone]

### For User Support

**Direct users to:**
- [USER_GUIDE.md](./USER_GUIDE.md)
- Section 10 (FAQs)
- Section 12 (Hỗ trợ kỹ thuật)

---

## 📝 Change Log

### 2026-01-17 - P0.5 Multi-Tenancy

**Added:**
- Multi-tenancy support with organization-level isolation
- User management interface (admin only)
- Role-based access control (admin vs org_user)
- Conditional UI based on user role
- User activation/deactivation
- Sample organization user creation script
- Comprehensive testing script

**Fixed:**
- Pagination handling in Users and Organizations APIs
- Docker build cache issues
- Organization dropdown loading state

**Documentation:**
- P0.5_DEPLOYMENT_GUIDE.md
- P0.5_DEPLOYMENT_STATUS.md
- USER_GUIDE.md
- ACCOUNTS.md
- README_DOCUMENTATION.md (this file)

---

**Last Updated:** 2026-01-17
**Version:** P0.5 Multi-Tenancy
**Maintained by:** Development Team
