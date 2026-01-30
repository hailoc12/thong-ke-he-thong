# Deployment Instructions: Status Field Fix

**CRITICAL BUG FIX - DEPLOY IMMEDIATELY**

**Date**: 2026-01-23
**Issue**: Status field validation failing for ALL options
**Status**: ✅ FIXED in code, ready to deploy
**Commits**:
- `07633ac` - Frontend fix
- `b9bfb6e` - Documentation

---

## Quick Summary

The "Trạng thái" (status) field was rejecting ALL values because frontend options didn't match backend choices. This is now fixed.

**What was wrong:**
- Frontend had: planning, development, inactive, maintenance (WRONG)
- Backend accepts: operating, pilot, testing, stopped, replacing (CORRECT)

**What was fixed:**
- Updated SystemCreate.tsx and SystemEdit.tsx to match backend exactly

---

## Deployment Steps

### OPTION 1: Git Pull (Recommended if you have SSH access)

```bash
# 1. SSH to production server
ssh root@hientrangcds.mst.gov.vn

# 2. Navigate to project directory
cd /home/thong_ke_he_thong

# 3. Pull latest changes
git pull origin main

# 4. Rebuild frontend
cd frontend
npm install  # Only if package.json changed
npm run build

# 5. Restart services (if using Docker)
docker-compose restart frontend
# OR copy dist to nginx location
sudo cp -r dist/* /var/www/html/thong_ke_he_thong/

# 6. Reload nginx
sudo systemctl reload nginx
```

### OPTION 2: Manual File Upload (If SSH not available)

If you cannot SSH to production:

1. **Build locally** (already done):
   ```bash
   # Files are in: /Users/shimazu/Dropbox/9. active/consultant/support_b4t/thong_ke_he_thong/frontend/dist
   ```

2. **Upload to production**:
   - Use FTP/SFTP client (FileZilla, Cyberduck, etc.)
   - Connect to: hientrangcds.mst.gov.vn
   - Upload `frontend/dist/*` to production web root
   - Overwrite existing files

3. **Verify**:
   - Open https://hientrangcds.mst.gov.vn in browser
   - Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
   - Test creating a system

---

## Testing After Deployment

### 1. Clear Browser Cache
**IMPORTANT**: Users must hard refresh to get new code:
- Windows/Linux: `Ctrl + Shift + R`
- Mac: `Cmd + Shift + R`
- Or clear browser cache completely

### 2. Test Create System
1. Go to Systems → Create New System
2. Fill required fields
3. For "Trạng thái" field, try each option:
   - ✅ Đang vận hành (operating)
   - ✅ Thí điểm (pilot)
   - ✅ Đang thử nghiệm (testing)
   - ✅ Dừng (stopped)
   - ✅ Sắp thay thế (replacing)
4. Submit form
5. **Expected**: No validation errors, system created successfully

### 3. Test Edit System
1. Open existing system
2. Change status to each option
3. Save
4. **Expected**: No errors, status updates successfully

### 4. Verify in Database
```sql
-- Check all systems have valid status
SELECT status, COUNT(*)
FROM systems
GROUP BY status;

-- Should only see: operating, pilot, testing, stopped, replacing
```

---

## Database Migration (If Needed)

If there are existing systems with wrong status values in the database, run the migration script:

### Check First
```bash
# SSH to production
ssh root@hientrangcds.mst.gov.vn

# Connect to PostgreSQL
docker-compose exec postgres psql -U postgres -d system_reports

# Check for systems with wrong status
SELECT status, COUNT(*) as count
FROM systems
WHERE status NOT IN ('operating', 'pilot', 'testing', 'stopped', 'replacing')
GROUP BY status;
```

### If Wrong Values Exist
```bash
# Run the migration script
psql -U postgres -d system_reports -f /path/to/migrate-wrong-status-values.sql
```

Or copy the SQL commands from:
`/Users/shimazu/Dropbox/9. active/consultant/support_b4t/thong_ke_he_thong/14-automated-solution/migrate-wrong-status-values.sql`

**Migration Mapping:**
- `planning` → `operating`
- `development` → `pilot`
- `inactive` → `stopped`
- `maintenance` → `operating`

---

## Rollback Plan (If Something Goes Wrong)

If the fix causes issues:

### Rollback Code
```bash
# SSH to production
ssh root@hientrangcds.mst.gov.vn
cd /home/thong_ke_he_thong

# Rollback to previous commit
git reset --hard HEAD~2
git pull origin main

# Rebuild
cd frontend
npm run build
# Copy to nginx or restart Docker
```

### Rollback Database (If Migration Was Run)
```sql
-- Restore from backup table
UPDATE systems s
SET status = b.status
FROM systems_status_backup_20260123 b
WHERE s.id = b.id;
```

---

## Verification Checklist

After deployment, confirm:

- [ ] Frontend deployed (check last modified date of JS/CSS files)
- [ ] Browser cache cleared (hard refresh)
- [ ] Create system with status "Đang vận hành" → Works
- [ ] Create system with status "Thí điểm" → Works
- [ ] Create system with status "Đang thử nghiệm" → Works
- [ ] Create system with status "Dừng" → Works
- [ ] Create system with status "Sắp thay thế" → Works
- [ ] Edit existing system status → Works
- [ ] No "is not a valid choice" errors
- [ ] No 400 Bad Request errors
- [ ] Database check shows only valid status values

---

## Contact Information

If you encounter issues during deployment:

**Developer**: Claude Sonnet 4.5
**Bug Report**: `/Users/shimazu/Dropbox/9. active/consultant/support_b4t/thong_ke_he_thong/BUG_REPORT_STATUS_FIELD_FIX.md`
**Migration Script**: `/Users/shimazu/Dropbox/9. active/consultant/support_b4t/thong_ke_he_thong/14-automated-solution/migrate-wrong-status-values.sql`

---

## Files Changed

1. `frontend/src/pages/SystemCreate.tsx` - Status Select options fixed
2. `frontend/src/pages/SystemEdit.tsx` - Status Select options fixed
3. `BUG_REPORT_STATUS_FIELD_FIX.md` - Detailed bug analysis
4. `14-automated-solution/migrate-wrong-status-values.sql` - Database migration script

---

## Timeline

- **Bug Discovered**: 2026-01-23
- **Root Cause Identified**: 2026-01-23
- **Fix Implemented**: 2026-01-23
- **Committed to Git**: 2026-01-23 (commits 07633ac, b9bfb6e)
- **Ready to Deploy**: 2026-01-23
- **Deployment**: PENDING

---

**Status**: ✅ READY TO DEPLOY
**Priority**: CRITICAL - Deploy immediately to unblock users
