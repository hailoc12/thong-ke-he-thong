# Deploy Organization Dashboard + Validation Features

## 📋 Tổng Quan Changes

### Changes đã được push lên git (3 commits):

1. **feat(validation)**: Required field validation với 25 fields
   - Validation rules centralized trong systemValidationRules.ts
   - Real-time validation với debounce
   - Disabled button states
   - Green checkmarks trên tabs hợp lệ
   - Vietnamese error messages

2. **chore**: Deployment script với database check
   - `DEPLOY-VALIDATION-AND-CHECK-DB.sh`
   - Tự động pull, build, restart, check database

3. **feat(dashboard)**: Organization Dashboard với completion %
   - Backend: Calculation logic cho 25 required fields + 5 conditional fields
   - Frontend: OrganizationDashboard component mới
   - Conditional rendering: org_user thấy org dashboard, admin thấy admin dashboard
   - Completion % color-coded: Green (≥80%), Yellow (50-79%), Red (<50%)

4. **docs**: Deployment instructions
   - `RUN-ON-SERVER.md`
   - `DEPLOY-ORG-DASHBOARD.md` (file này)

---

## 🚀 Deployment Instructions

### Prerequisites
- SSH access to production server
- Server: `ubuntu@hientrangcds.mst.gov.vn`
- Docker & Docker Compose installed on server

---

## Method 1: Automated Deployment (Khuyên dùng ✅)

### On production server:

```bash
# Step 1: SSH vào server
ssh ubuntu@hientrangcds.mst.gov.vn

# Step 2: Chuyển đến project directory
cd /home/ubuntu/thong-ke-he-thong

# Step 3: Pull latest code
git pull origin main

# Step 4: Build frontend
cd frontend
npm install
npm run build
cd ..

# Step 5: Restart containers
docker compose restart frontend backend

# Step 6: Verify deployment
docker compose ps
```

---

## Method 2: Run Automated Script

```bash
ssh ubuntu@hientrangcds.mst.gov.vn
cd /home/ubuntu/thong-ke-he-thong
./DEPLOY-VALIDATION-AND-CHECK-DB.sh
```

Script này sẽ:
1. ✅ Pull code từ git
2. ✅ Build frontend
3. ✅ Restart containers
4. ✅ Chạy database check (tổng đơn vị, tổng user, đơn vị thiếu user)
5. ✅ Hiển thị kết quả

---

## 🧪 Testing After Deployment

### Test 1: Validation Features (Tất cả users)

1. Đăng nhập với bất kỳ account nào
2. Vào **Hệ thống > Tạo mới** (`/systems/create`)
3. **Test blocking validation**:
   - Thử save Tab 1 mà không điền required fields → Phải bị block
   - Điền đầy đủ → Button "Lưu & Tiếp tục" sáng lên
   - Tab có checkmark xanh ✓ khi valid
4. **Test conditional validation**:
   - Tab 3: Bật switch "CI/CD Pipeline" → Field "CI/CD Tool" trở thành required
   - Không điền CI/CD Tool → Không thể save
   - Điền CI/CD Tool → Save thành công

**Expected result**: ✅ Validation hoạt động, block save khi chưa đủ thông tin

---

### Test 2: Organization Dashboard (org_user only)

1. **Đăng nhập với org_user account** (ví dụ: `vu-buuchinh`, password: `ThongkeCDS@2026#`)
2. Vào **Dashboard** (`/`)
3. **Verify dashboard mới**:
   - ✅ Thấy 3 cards: "Tổng số hệ thống", "% Hoàn thành trung bình", "Tiến độ báo cáo"
   - ✅ Thấy table danh sách hệ thống với cột "% Hoàn thành"
   - ✅ Progress bar màu:
     - Green (≥80%): "Hoàn thành tốt"
     - Yellow (50-79%): "Cần bổ sung"
     - Red (<50%): "Chưa đủ thông tin"
   - ✅ Button "Xem" và "Sửa" trên mỗi hệ thống

**Expected result**: ✅ Org_user thấy dashboard riêng với completion stats

---

### Test 3: Admin Dashboard (admin only)

1. **Đăng nhập với admin account**
2. Vào **Dashboard** (`/`)
3. **Verify dashboard cũ** (không thay đổi):
   - ✅ Thấy tổng quan toàn hệ thống
   - ✅ Charts theo status, criticality
   - ✅ Organization filter dropdown
   - ✅ KHÔNG thấy dummy "Hoạt động gần đây" (đã xóa)

**Expected result**: ✅ Admin thấy dashboard tổng quan như cũ

---

## 📊 Features Checklist

### Validation Features (All users)
- [ ] Cannot save tab without required fields
- [ ] Cannot navigate to next tab with incomplete data
- [ ] Final save validates all tabs
- [ ] Conditional fields only required when switch enabled
- [ ] Error messages in Vietnamese
- [ ] Button disabled when tab invalid
- [ ] Tab checkmarks show validation status
- [ ] Scroll to first error on validation fail

### Organization Dashboard (org_user)
- [ ] Shows total systems count
- [ ] Shows average completion percentage
- [ ] Shows progress breakdown (Good/Need/Insufficient)
- [ ] Table lists all systems with completion %
- [ ] Progress bars color-coded correctly
- [ ] Can click "Xem" to view system
- [ ] Can click "Sửa" to edit system
- [ ] Data only shows systems from user's org

### Admin Dashboard (admin)
- [ ] Shows overview of all systems
- [ ] Organization filter works
- [ ] Dummy "Recent Activities" removed
- [ ] Charts display correctly
- [ ] Statistics accurate

---

## 🔍 Database Check Results

Sau khi deploy, script sẽ tự động check:

### Expected output:

```
========================================================================
1️⃣  TỔNG SỐ ĐƠN VỊ (ORGANIZATIONS)
========================================================================
Tổng số đơn vị
--------------
        39

========================================================================
2️⃣  TỔNG SỐ USER TYPE ĐƠN VỊ (role = org_user)
========================================================================
Tổng số user đơn vị
-------------------
        34

========================================================================
4️⃣  DANH SÁCH CÁC ĐƠN VỊ THIẾU USER
========================================================================
Mã đơn vị          | Tên đơn vị
-------------------+------------------------------------
SOKHDT_HANOI       | Sở Khoa học và Công nghệ Hà Nội
...

========================================================================
📊 THỐNG KÊ TỔNG HỢP
========================================================================
Tổng đơn vị | Có user | Thiếu user
-----------+---------+-----------
     39     |    34   |     5
```

### Nếu còn đơn vị thiếu user:

```bash
# Copy script vào container
docker compose cp 08-backlog-plan/check-and-create-missing-users.py backend:/app/

# Chạy script tạo user tự động
docker compose exec backend python /app/check-and-create-missing-users.py

# Check lại
docker compose exec postgres psql -U postgres -d thongke -f /08-backlog-plan/check-database-state.sql
```

---

## 🐛 Troubleshooting

### Issue: Frontend không update

**Solution**:
```bash
cd /home/ubuntu/thong-ke-he-thong/frontend
rm -rf node_modules package-lock.json dist
npm install
npm run build
cd ..
docker compose restart frontend
```

### Issue: Backend lỗi import utils

**Solution**:
```bash
docker compose restart backend
docker compose logs backend
```

### Issue: Completion % không hiển thị

**Cause**: Backend utils.py chưa update

**Solution**:
```bash
# Verify backend code có CONDITIONAL_FIELDS_MAP không
docker compose exec backend cat /app/apps/systems/utils.py | grep CONDITIONAL_FIELDS_MAP

# Nếu không có, pull lại code
cd /home/ubuntu/thong-ke-he-thong
git pull origin main
docker compose restart backend
```

### Issue: Org_user vẫn thấy admin dashboard

**Cause**: Frontend chưa build lại

**Solution**:
```bash
cd /home/ubuntu/thong-ke-he-thong/frontend
npm run build
cd ..
docker compose restart frontend
```

### Issue: Permission denied

**Solution**:
```bash
chmod +x DEPLOY-VALIDATION-AND-CHECK-DB.sh
./DEPLOY-VALIDATION-AND-CHECK-DB.sh
```

---

## 📝 Post-Deployment Checklist

- [ ] All containers running: `docker compose ps`
- [ ] Frontend accessible: https://hientrangcds.mst.gov.vn
- [ ] Can login with admin account
- [ ] Can login with org_user account
- [ ] Validation works on system create/edit
- [ ] Org_user sees organization dashboard
- [ ] Admin sees admin dashboard
- [ ] Database check shows correct counts
- [ ] No console errors in browser DevTools
- [ ] No errors in backend logs: `docker compose logs backend --tail=50`

---

## 🔄 Rollback Plan (If needed)

```bash
cd /home/ubuntu/thong-ke-he-thong

# Revert to previous commit
git log --oneline -5  # Find previous commit hash
git reset --hard <previous-commit-hash>

# Rebuild
cd frontend
npm run build
cd ..

# Restart
docker compose restart frontend backend
```

---

## 📞 Support

Nếu gặp vấn đề, cung cấp:
1. Output của `docker compose ps`
2. Output của `docker compose logs backend --tail=100`
3. Screenshot của browser console (F12 → Console tab)
4. Username và role đang test

---

**Created**: 2026-01-21
**Version**: 1.0
**Status**: ✅ READY TO DEPLOY
**Git commits**: 47523f6, 34650da, c9c99f1, 20e1993
