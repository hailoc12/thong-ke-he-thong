# 📋 Manual Deployment Instructions

**Code đã sẵn sàng trên GitHub**: commit `7ff9b3a`

Server hiện không thể SSH được (Connection refused). Vui lòng làm theo hướng dẫn sau khi có thể kết nối server.

---

## ⚡ Quick Deploy (5 phút)

### Bước 1: SSH vào Production Server

Thử các cách sau:

**Option 1: Direct SSH**
```bash
ssh ubuntu@hientrangcds.mst.gov.vn
# Hoặc
ssh admin_@34.142.152.104
```

**Option 2: Nếu SSH port khác**
```bash
ssh -p [PORT] ubuntu@hientrangcds.mst.gov.vn
# Thử các port thông dụng: 2222, 22022, 10022
```

**Option 3: Qua VPN (nếu có)**
```bash
# Connect VPN trước, sau đó SSH
ssh ubuntu@hientrangcds.mst.gov.vn
```

### Bước 2: Navigate to Project Directory

Sau khi SSH thành công, vào thư mục project:

```bash
# Try these paths:
cd /home/ubuntu/thong-ke-he-thong
# Or
cd /home/admin_/apps/thong-ke-he-thong
# Or
cd /home/admin_/thong_ke_he_thong

# Verify you're in the right place
ls -la
# Should see: backend/ frontend/ docker-compose.yml
```

### Bước 3: Pull Latest Code

```bash
# Pull from GitHub
git pull origin main

# Verify latest commit
git log -1 --oneline
# Should show: 7ff9b3a docs: Add production deployment guide
```

### Bước 4: Clear Docker Cache & Rebuild

**⚠️ QUAN TRỌNG**: Phải clear cache để frontend code mới được build!

```bash
# Clear Docker build cache
docker builder prune -af

# Build frontend (disable BuildKit to prevent cache issues)
DOCKER_BUILDKIT=0 docker compose build frontend --no-cache --pull

# Build backend
docker compose build backend --no-cache
```

### Bước 5: Run Migrations (if any)

```bash
# Start database
docker compose up -d postgres
sleep 10

# Run migrations
docker compose up -d backend
sleep 5
docker compose exec backend python manage.py migrate

# Collect static files
docker compose exec backend python manage.py collectstatic --noinput
```

### Bước 6: Restart All Services

```bash
# Restart all containers
docker compose down
docker compose up -d

# Wait for services to start
sleep 15
```

### Bước 7: Verify Deployment

```bash
# Check services status
docker compose ps
# All should be "Up"

# Check frontend has new Excel export code
docker compose exec frontend sh -c "cat /usr/share/nginx/html/assets/*.js 2>/dev/null | grep -q 'exportDashboardToExcel' && echo 'Excel export code found ✓' || echo 'Excel export code NOT found ✗'"

# Check backend API
curl -s http://localhost:8000/api/ > /dev/null && echo "Backend API OK ✓" || echo "Backend API ERROR ✗"

# Check logs for errors
docker compose logs --tail=50 backend frontend
```

---

## 🎯 What's New in This Deployment

### Features Added
1. **Excel Export**: Button "Export Excel" on dashboard
   - 4 sheets: Tổng quan, Theo đơn vị, Danh sách HT, Lưu ý đôn đốc
   - All organizations included (even those without systems)

2. **Organizations Display**: Shows ALL organizations in table
   - Organizations without systems show "Chưa có dữ liệu"
   - Better pagination controls

3. **UI Improvements**: Organization column hidden for org users

### Files Changed
```
backend/apps/systems/views.py          (Organizations logic)
frontend/src/pages/Dashboard.tsx       (Excel export button)
frontend/src/utils/exportExcel.ts      (Excel generation - NEW)
frontend/package.json                  (Added xlsx dependency)
```

---

## ✅ Post-Deployment Testing

### 1. Test Excel Export
```bash
# From browser:
1. Login to https://hientrangcds.mst.gov.vn
2. Go to Dashboard
3. Click "Export Excel" button (or similar)
4. File should download: Bao-cao-CDS-DD-MM-YYYY.xlsx
5. Open Excel:
   - Check 4 sheets exist
   - Sheet "Theo đơn vị" should list ALL organizations
```

### 2. Test Organizations Display
```bash
# From browser:
1. Go to Dashboard or Organizations page
2. Verify ALL organizations appear (not just those with systems)
3. Organizations without systems should show:
   - System count: "0" or "Chưa có dữ liệu"
   - Completion: "Chưa có dữ liệu"
```

### 3. Clear Browser Cache
**IMPORTANT**: Users must clear browser cache!
```
Press: Ctrl+Shift+Delete
Select: "Cached images and files"
Clear and reload page
```

---

## 🔄 Rollback (If Issues)

If something goes wrong:

```bash
# Go back to previous commit
git reset --hard 43efdc4

# Rebuild
docker builder prune -af
DOCKER_BUILDKIT=0 docker compose build frontend --no-cache
docker compose build backend --no-cache

# Restart
docker compose down
docker compose up -d
```

---

## 🐛 Troubleshooting

### Issue: Excel export button not visible
**Fix**: Hard refresh browser (Ctrl+Shift+R) or clear cache

### Issue: Frontend shows old code
**Fix**: Rebuild frontend with cache clearing
```bash
docker builder prune -af
DOCKER_BUILDKIT=0 docker compose build frontend --no-cache --pull
docker compose restart frontend
```

### Issue: Organizations table missing some orgs
**Fix**: Verify backend code updated
```bash
git log -1
# Should show: 7ff9b3a

grep -A 10 "Include all organizations" backend/apps/systems/views.py
# Should show the new code
```

### Issue: Services won't start
**Fix**: Check logs
```bash
docker compose logs backend frontend postgres
docker compose ps
```

---

## 📊 Monitoring After Deployment

```bash
# Watch logs live
docker compose logs -f --tail=100

# Check resource usage
docker stats

# Check disk space
df -h

# Check service health
docker compose ps
curl -s http://localhost:8000/api/health || echo "API not healthy"
```

---

## 📞 Support

If you encounter any issues:

1. Check logs: `docker compose logs -f`
2. Check service status: `docker compose ps`
3. Check Docker status: `docker ps -a`
4. Verify code version: `git log -1`

**Current Deployment**:
- Commit: `7ff9b3a`
- Date: 2026-01-26
- Features: Excel export + all organizations display

---

## 🎉 Expected Results

After successful deployment:

- ✅ Excel export button appears on dashboard
- ✅ Excel file downloads with 4 sheets
- ✅ All organizations appear in "Theo đơn vị" sheet
- ✅ Organizations table shows complete list
- ✅ Pagination works correctly
- ✅ No console errors
- ✅ Backend API responds normally

**Test URL**: https://hientrangcds.mst.gov.vn

Good luck with deployment! 🚀
