# Production Deployment - Phase 1

**Target:** https://thongkehethong.mindmaid.ai
**Server:** 34.142.152.104
**Status:** ✅ READY TO DEPLOY

---

## Quick Deploy (1 command)

```bash
./deploy-production-phase1.sh
```

**What it does:**
1. ✅ Commits Phase 1 changes to git
2. ✅ Pushes to GitHub
3. ✅ SSH to production server (34.142.152.104)
4. ✅ Backs up database & code
5. ✅ Pulls latest code from GitHub
6. ✅ Rebuilds Docker images
7. ✅ Restarts services (migration auto-runs)
8. ✅ Runs smoke tests
9. ✅ Displays summary

**Time:** 10-15 minutes
**Downtime:** 5-10 minutes

---

## What Will Be Deployed

### Backend (4 files)
- `backend/apps/systems/models.py` - 10 new P0 fields
- `backend/apps/systems/serializers.py` - Nested writes
- `backend/apps/systems/migrations/0004_p08_phase1_all_changes.py` - Migration with data fixes
- SystemIntegrationConnection model

### Frontend (2 files)
- `frontend/src/pages/SystemCreate.tsx` - All Phase 1 fields
- `frontend/src/pages/SystemEdit.tsx` - All Phase 1 fields
- IntegrationConnectionList component (full CRUD)

### Total Changes
- 2,100+ lines of code
- 10 critical P0 fields
- 8 integration methods, 7 frequencies
- 60+ test cases documented

---

## Production Server Info

```bash
Server: 34.142.152.104
User: admin_
App Directory: /home/admin_/apps/thong-ke-he-thong
Production URL: https://thongkehethong.mindmaid.ai
GitHub Repo: github.com/hailoc12/thong-ke-he-thong
```

---

## Before Deploying

### Prerequisites Check
- [x] sshpass installed (`brew install hudochenkov/sshpass/sshpass`)
- [x] SSH access to server (34.142.152.104)
- [x] Git configured with GitHub access
- [x] All Phase 1 code complete and validated
- [x] TypeScript build: PASSED
- [x] Migration syntax: VALIDATED

### Safety Measures
- ✅ Database backup created automatically
- ✅ Code backup created automatically
- ✅ Rollback procedure documented
- ✅ Services restarted gracefully
- ✅ Migration applied automatically by docker-compose

---

## Deployment Process

### Automated Flow

```bash
# Run deployment script
./deploy-production-phase1.sh

# You will be prompted:
# "Continue with PRODUCTION deployment? (yes/NO):"
# Type: yes

# Script will:
# 1. Check prerequisites (sshpass, git)
# 2. Commit changes with detailed message
# 3. Push to GitHub (github.com/hailoc12/thong-ke-he-thong)
# 4. Test SSH connection
# 5. Connect to server via SSH
# 6. Create backup directory: backups/phase1-YYYYMMDD-HHMMSS/
# 7. Backup database: pg_dump → database.sql
# 8. Backup code: tar → code-backup.tar.gz
# 9. Pull latest code: git pull origin main
# 10. Stop containers: docker-compose down
# 11. Build images: docker-compose build --no-cache
# 12. Start containers: docker-compose up -d
#     → Migration runs automatically here!
# 13. Wait 60 seconds for services to start
# 14. Check migration logs
# 15. Verify service health
# 16. Run smoke tests
# 17. Display summary
```

---

## After Deployment

### Immediate Checks (2 minutes)

```bash
# 1. Check frontend
curl -I https://thongkehethong.mindmaid.ai
# Expected: HTTP 200 OK

# 2. Check backend API
curl https://thongkehethong.mindmaid.ai/api/
# Expected: {"message": "System Reports API"}

# 3. Open in browser
open https://thongkehethong.mindmaid.ai
```

### Manual UI Testing (10 minutes)

1. Login to https://thongkehethong.mindmaid.ai
2. Click "Tạo hệ thống mới" (Create System)
3. Verify Phase 1 fields visible:
   - [ ] Phạm vi sử dụng (scope) - REQUIRED, 3 options
   - [ ] Nhóm hệ thống (system_group) - REQUIRED, 8 options
   - [ ] Tổng số tài khoản (total_accounts)
   - [ ] MAU, DAU, Số đơn vị/địa phương
   - [ ] Dung lượng CSDL, Dung lượng file, Tốc độ tăng trưởng
   - [ ] Số API cung cấp, Số API tiêu thụ
   - [ ] Integration connection list with "Thêm kết nối" button
4. Test required field validation (leave scope/system_group empty)
5. Create a test system with integration connections
6. Edit the system and verify data persists
7. Test integration connection CRUD (Add, Edit, Delete)

### Full Testing (1-5 hours)

Follow: `08-backlog-plan/doing/P0.8-PHASE1-TESTING-GUIDE.md`
- 60+ comprehensive test cases
- SQL verification queries
- Performance benchmarks
- Error scenario testing

---

## Monitoring

### View Production Logs

```bash
# SSH to server
ssh admin_@34.142.152.104
# Password: aivnews_xinchao_#*2020

# Navigate to app
cd /home/admin_/apps/thong-ke-he-thong

# View logs
docker-compose logs -f backend

# Check migration specifically
docker-compose logs backend | grep "0004_p08_phase1"

# Check service status
docker-compose ps
```

### Check Database

```bash
# SSH to server
ssh admin_@34.142.152.104
cd /home/admin_/apps/thong-ke-he-thong

# Connect to database
docker-compose exec postgres psql -U postgres -d system_reports

# Check migration applied
SELECT * FROM django_migrations WHERE name = '0004_p08_phase1_all_changes';

# Check no NULL values
SELECT COUNT(*) FROM systems_system WHERE scope IS NULL OR system_group IS NULL;
# Expected: 0

# Check new table exists
\d system_integration_connections

# Exit
\q
```

---

## Rollback (If Needed)

### Level 1: Rollback Migration Only

```bash
ssh admin_@34.142.152.104
cd /home/admin_/apps/thong-ke-he-thong

# Rollback migration
docker-compose exec backend python manage.py migrate systems 0002

# Restart backend
docker-compose restart backend
```

### Level 2: Full Rollback (Code + Database)

```bash
ssh admin_@34.142.152.104
cd /home/admin_/apps/thong-ke-he-thong

# Find backup directory
ls -lt backups/
# Use the most recent: backups/phase1-YYYYMMDD-HHMMSS/

# Stop services
docker-compose down

# Restore database
cat backups/phase1-YYYYMMDD-HHMMSS/database.sql | \
  docker-compose up -d postgres && \
  docker-compose exec -T postgres psql -U postgres -d system_reports

# Restore code
tar -xzf backups/phase1-YYYYMMDD-HHMMSS/code-backup.tar.gz

# Restart services
docker-compose up -d
```

### Level 3: Git Revert

```bash
ssh admin_@34.142.152.104
cd /home/admin_/apps/thong-ke-he-thong

# Find previous commit
git log --oneline -5

# Revert to previous commit
git reset --hard <previous_commit_hash>

# Rebuild and restart
docker-compose down
docker-compose build
docker-compose up -d
```

---

## Troubleshooting

### Deployment Script Fails

**Issue:** "sshpass not installed"
```bash
brew install hudochenkov/sshpass/sshpass
```

**Issue:** "SSH connection failed"
```bash
# Test manually
ssh admin_@34.142.152.104
# If fails, check server is running: ping 34.142.152.104
```

**Issue:** "Git push failed"
```bash
# Check git credentials
git config --list | grep user

# Try manual push
git push origin main
```

### Migration Fails on Server

**Check logs:**
```bash
ssh admin_@34.142.152.104
cd /home/admin_/apps/thong-ke-he-thong
docker-compose logs backend | grep -A 20 "Applying systems.0004"
```

**Common issues:**
- Syntax error → Check migration file syntax
- Database error → Check postgres is healthy
- Dependency error → Check models.py imports

**Fix:**
```bash
# Stop services
docker-compose down

# Rebuild backend
docker-compose build --no-cache backend

# Start services
docker-compose up -d

# Watch logs
docker-compose logs -f backend
```

### Services Won't Start

```bash
ssh admin_@34.142.152.104
cd /home/admin_/apps/thong-ke-he-thong

# Check logs
docker-compose logs

# Check disk space
df -h

# Check ports
netstat -tlnp | grep -E '3000|8000|5432'

# Restart
docker-compose restart
```

---

## Success Criteria

### Deployment Success ✅
- [ ] Script completed without errors
- [ ] All 3 services running (postgres, backend, frontend)
- [ ] Migration 0004 applied
- [ ] No errors in logs
- [ ] Frontend accessible at https://thongkehethong.mindmaid.ai
- [ ] Backend API responds
- [ ] Database has no NULL scope/system_group

### Feature Success ✅
- [ ] Can create system with Phase 1 fields
- [ ] Can add integration connections
- [ ] Required validation works
- [ ] Data persists correctly
- [ ] No console errors

### Customer Success ✅
- [ ] Customer can test new features
- [ ] Customer satisfied with 8 system_group options
- [ ] Customer satisfied with integration tracking
- [ ] Customer signs off on Phase 1

---

## Post-Deployment Tasks

### Immediate (Day 1)
- [ ] Manual UI testing (10 min)
- [ ] Smoke tests pass
- [ ] Notify customer deployment is complete
- [ ] Schedule demo

### Short-term (Week 1)
- [ ] Full testing suite (1-5 hours)
- [ ] Customer demo (30 min)
- [ ] Gather feedback
- [ ] Fix any critical bugs
- [ ] Get customer sign-off

### Medium-term (Week 2)
- [ ] Monitor production logs
- [ ] Track user feedback
- [ ] Plan Phase 2 (17 fields)
- [ ] Prepare Phase 2 implementation

---

## Contact & Support

**Production URL:** https://thongkehethong.mindmaid.ai
**Server:** 34.142.152.104
**SSH:** `ssh admin_@34.142.152.104`
**App Directory:** `/home/admin_/apps/thong-ke-he-thong`

**Documentation:**
- Testing Guide: `08-backlog-plan/doing/P0.8-PHASE1-TESTING-GUIDE.md`
- Deployment Guide: `08-backlog-plan/doing/P0.8-PHASE1-DEPLOYMENT-GUIDE.md`
- Implementation Summary: `08-backlog-plan/doing/P0.8-PHASE1-IMPLEMENTATION-SUMMARY.md`

**Emergency Commands:**
```bash
# Stop all services
ssh admin_@34.142.152.104
cd /home/admin_/apps/thong-ke-he-thong
docker-compose down

# View logs
docker-compose logs -f

# Restart services
docker-compose restart

# Full rebuild
docker-compose down
docker-compose build
docker-compose up -d
```

---

**Deployment Prepared:** 2026-01-19
**Status:** ✅ READY TO DEPLOY
**Command:** `./deploy-production-phase1.sh`
