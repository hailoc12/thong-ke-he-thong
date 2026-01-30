# Production Deployment Guide - 2026-01-26

## Changes in This Release

### Backend
- Include all organizations in statistics (even those without systems)
- Sort organizations by name for consistent display

### Frontend
- Add Excel export functionality with 4 sheets:
  1. Tổng quan (Summary statistics)
  2. Theo đơn vị (Organizations with completion rates)
  3. Danh sách HT (All systems list)
  4. Lưu ý đôn đốc (Follow-up notes for low completion orgs)
- Add pagination for organization completion table
- Fetch all organizations (page_size=1000) for complete export data
- Update dependencies for Excel export (xlsx library)

### Commits
- ef3eb5f: feat: Add Excel export and improve organizations display
- 43efdc4: feat(ui): Hide org column for org users
- 93059ab: fix(pagination): Always show size changer and quick jumper

---

## Deployment Steps (Run on Production Server)

### 1. SSH to Production Server
```bash
ssh user@production-server
cd /opt/thong_ke_he_thong
```

### 2. Pull Latest Code
```bash
git pull origin main
```

Expected output:
```
Updating 43efdc4..ef3eb5f
Fast-forward
 8 files changed, 494 insertions(+), 103 deletions(-)
 create mode 100644 frontend/src/utils/exportExcel.ts
```

### 3. **CRITICAL: Clear Docker Build Cache**

⚠️ **Docker BuildKit cache có thể khiến frontend code mới KHÔNG được build!**

```bash
# Clear Docker build cache
docker builder prune -af

# Disable BuildKit và build frontend
DOCKER_BUILDKIT=0 docker compose build frontend --no-cache --pull

# Build backend
docker compose build backend --no-cache
```

### 4. Run Migrations (if any)
```bash
docker compose up -d postgres
sleep 10
docker compose up -d backend
sleep 5
docker compose exec backend python manage.py migrate
docker compose exec backend python manage.py collectstatic --noinput
```

### 5. Restart All Services
```bash
docker compose down
docker compose up -d
```

### 6. Verify Deployment

#### Check Frontend Code
```bash
# Verify frontend has new Excel export code
docker compose exec frontend sh -c "ls -la /usr/share/nginx/html/assets/*.js"

# Check if exportExcel code exists in bundle
docker compose exec frontend sh -c "cat /usr/share/nginx/html/assets/*.js | grep -o 'exportDashboardToExcel' | head -1"
```

Expected: Should print "exportDashboardToExcel"

#### Check Backend API
```bash
# Test organizations endpoint (should include orgs without systems)
curl -s http://localhost:8000/api/systems/completion_stats/ | jq '.summary.organizations | length'
```

Expected: Should show total count of ALL organizations (not just those with systems)

#### Check Services Status
```bash
docker compose ps
```

All services should be "Up" and healthy.

### 7. Browser Testing

1. **Clear browser cache** (Ctrl+Shift+Delete)
2. Open Dashboard: http://production-url/
3. Test Excel Export:
   - Click "Export Excel" button
   - File should download: `Bao-cao-CDS-DD-MM-YYYY.xlsx`
   - Open file and verify 4 sheets:
     - Sheet 1: Tổng quan
     - Sheet 2: Theo đơn vị (should list ALL organizations)
     - Sheet 3: Danh sách HT
     - Sheet 4: Lưu ý đôn đốc

4. Test Organizations Display:
   - Check that ALL organizations appear in table
   - Organizations without systems should show "0" or "Chưa có dữ liệu"
   - Table should have pagination with size changer

---

## Rollback Plan (If Issues Occur)

### Quick Rollback
```bash
# Go back to previous commit
git reset --hard 43efdc4

# Rebuild and restart
docker builder prune -af
DOCKER_BUILDKIT=0 docker compose build frontend --no-cache
docker compose build backend --no-cache
docker compose down
docker compose up -d
```

### Restore Database (if needed)
```bash
# Find latest backup
ls -lt /opt/backups/thong_ke_he_thong/

# Restore
docker compose exec -T postgres psql -U postgres system_reports < /opt/backups/thong_ke_he_thong/db_backup_YYYYMMDD_HHMMSS.sql
```

---

## Troubleshooting

### Issue: Excel export button not visible
**Cause**: Browser cache showing old frontend code
**Fix**: Hard refresh (Ctrl+Shift+R) or clear browser cache

### Issue: Frontend shows old code after build
**Cause**: Docker BuildKit cache
**Fix**:
```bash
docker builder prune -af
DOCKER_BUILDKIT=0 docker compose build frontend --no-cache --pull
docker compose restart frontend
```

### Issue: Organizations table missing some orgs
**Cause**: Backend not including orgs without systems
**Fix**: Verify code pulled correctly
```bash
git log -1 --oneline
# Should show: ef3eb5f feat: Add Excel export and improve organizations display

# Check backend code
grep -A 10 "Include all organizations" backend/apps/systems/views.py
```

---

## Post-Deployment Monitoring

### Check Logs
```bash
# Frontend logs
docker compose logs -f --tail=100 frontend

# Backend logs
docker compose logs -f --tail=100 backend

# Database logs
docker compose logs -f --tail=100 postgres
```

### Performance Check
```bash
# Check CPU/Memory
docker stats

# Check disk space
df -h
```

---

## Contact

If any issues occur during deployment, contact:
- Developer: [Your contact info]
- Time of deployment: 2026-01-26
- Commit hash: ef3eb5f
