# Phase 1 Deployment - Quick Start

**Status:** ✅ READY FOR DEPLOYMENT
**Date:** 2026-01-19

---

## Prerequisites

- Docker Desktop installed and running
- 4GB RAM available
- Ports 3000, 8000, 5432 available

---

## Quick Deploy (30 seconds)

```bash
# 1. Open terminal and navigate to project
cd /Users/shimazu/Dropbox/9.\ active/consultant/support_b4t/thong_ke_he_thong

# 2. Run automated deployment
./deploy-phase1.sh
```

That's it! The script will:
- ✅ Check Docker
- ✅ Backup database
- ✅ Build images
- ✅ Start services
- ✅ Run smoke tests

**Access:**
- Frontend: http://localhost:3000
- Backend: http://localhost:8000/api/

---

## Manual Deploy (if script fails)

```bash
# Stop existing services
docker compose down

# Build new images
docker compose build

# Start services
docker compose up -d

# Check status
docker compose ps

# View logs
docker compose logs -f backend
```

---

## What's New in Phase 1?

### 10 New P0 Fields:

1. **Phạm vi sử dụng** (scope) - REQUIRED
2. **Nhóm hệ thống** (system_group) - REQUIRED with 8 options
3. **Tổng số tài khoản** (total_accounts)
4. **MAU** (Monthly Active Users)
5. **DAU** (Daily Active Users)
6. **Số đơn vị/địa phương** (num_organizations)
7. **Dung lượng CSDL** (storage_size_gb)
8. **Dung lượng file** (file_storage_size_gb)
9. **Tốc độ tăng trưởng** (growth_rate_percent)
10. **Danh sách tích hợp chi tiết** (integration_connections_data)

### New Features:

- 🆕 SystemIntegrationConnection model
- 🆕 Dynamic integration connection form (Add/Edit/Delete)
- 🆕 8 integration methods, 7 frequency options
- 🔒 Required field validation for scope & system_group

---

## Verify Deployment

```bash
# 1. Check services are healthy
docker compose ps
# All should show "Up (healthy)"

# 2. Test frontend
open http://localhost:3000

# 3. Test backend
curl http://localhost:8000/api/

# 4. Check migration applied
docker compose exec backend python manage.py showmigrations systems
# Should show [X] 0004_p08_phase1_all_changes
```

---

## Full Testing

After deployment succeeds:

1. **Read:** `08-backlog-plan/doing/P0.8-PHASE1-TESTING-GUIDE.md`
2. **Run:** All 60+ test cases
3. **Test:** Integration connection CRUD operations
4. **Verify:** Data persistence

**Estimated testing time:** 1-5 hours

---

## Rollback (if needed)

```bash
# Rollback migration only
docker compose exec backend python manage.py migrate systems 0002

# Full rollback
docker compose down
# Restore database from backups/phase1-*/database.sql
git checkout <previous_commit>
docker compose up -d
```

---

## Documentation

- 📘 **Deployment Guide:** `08-backlog-plan/doing/P0.8-PHASE1-DEPLOYMENT-GUIDE.md`
- 🧪 **Testing Guide:** `08-backlog-plan/doing/P0.8-PHASE1-TESTING-GUIDE.md`
- 📊 **Implementation Summary:** `08-backlog-plan/doing/P0.8-PHASE1-IMPLEMENTATION-SUMMARY.md`
- 📋 **Task Breakdown:** `08-backlog-plan/doing/P0.8-PHASE1-critical-gaps.md`

---

## Troubleshooting

**Services won't start:**
```bash
docker compose logs
```

**Port already in use:**
```bash
lsof -i :3000  # or :8000, :5432
kill -9 <PID>
```

**Migration errors:**
```bash
docker compose logs backend
```

**Need help?**
- Check deployment guide for detailed troubleshooting
- Review logs: `docker compose logs -f`

---

## Success Criteria ✅

- [ ] Services show "Up (healthy)"
- [ ] Migration 0004 applied
- [ ] Frontend loads at :3000
- [ ] Backend responds at :8000
- [ ] No NULL scope/system_group values
- [ ] Can create/edit systems
- [ ] Integration connections work

---

**Next:** Run full testing → Get customer sign-off → Plan Phase 2
