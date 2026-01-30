# Fix Org User Permissions - Deployment Guide

**Commit:** `f9bf368`
**Issue:** Organization users cannot view or edit system details
**Root Cause:** Permission check field name mismatch (`org` vs `organization`)
**Status:** ✅ Code fixed and pushed to Github

---

## Issue Summary

### Problem
- Organization users (org1, org2) can **list** systems in Systems page
- But **CANNOT view details** when clicking on system name
- **CANNOT edit** systems (edit button not working)

### Root Cause
Backend permissions were checking wrong field name:
- **System model** uses field name: `org`
- **Permissions** were checking: `organization`
- Result: `has_object_permission()` always returned `False` for org_user

### Fix Applied
Updated 2 permission classes in `backend/apps/accounts/permissions.py`:

1. **IsOrgUserOrAdmin** - Now checks both field names:
```python
# Check both 'organization' and 'org' field names
if hasattr(obj, 'organization'):
    return obj.organization == request.user.organization
elif hasattr(obj, 'org'):
    return obj.org == request.user.organization
```

2. **CanManageOrgSystems** - Uses getattr for flexibility:
```python
# Check both 'organization' and 'org' field names
if request.user.role == 'org_user':
    org_field = getattr(obj, 'organization', None) or getattr(obj, 'org', None)
    return org_field == request.user.organization
```

---

## Deployment Steps

### Step 1: SSH to Production Server

```bash
ssh admin_@34.142.152.104
# Password: [from ADMIN_CREDENTIALS.md]
```

### Step 2: Navigate to Project Directory

```bash
cd /root/thong-ke-he-thong
```

### Step 3: Pull Latest Code

```bash
git pull origin main
```

Expected output:
```
Updating 863d49e..f9bf368
Fast-forward
 backend/apps/accounts/permissions.py | 7 ++++++-
 1 file changed, 6 insertions(+), 1 deletion(-)
```

### Step 4: Restart Backend Container

```bash
docker compose restart backend
```

Wait for backend to fully restart (about 10-20 seconds).

### Step 5: Verify Backend Status

```bash
docker compose logs backend --tail=50
```

Should show no errors. Look for:
```
Listening at: http://0.0.0.0:8000
```

---

## Testing

### Test 1: Login as Org User

1. Go to: https://thongkehethong.mindmaid.ai/login
2. Login with:
   - Username: `org1`
   - Password: `Test1234!`

### Test 2: View System Detail

1. Go to "Hệ thống" page
2. Click on any system name in the list
3. **Expected**: System detail page loads successfully
4. **Should see**: All system information (Mã, Tên, Đơn vị, etc.)

### Test 3: Edit System

1. On system detail page, click "Chỉnh sửa" button
2. **Expected**: Navigate to edit page successfully
3. Modify any field (e.g., change Purpose)
4. Click "Cập nhật hệ thống"
5. **Expected**: Update successful message

### Test 4: Verify Data Isolation

1. Login as `org1`
2. Should only see systems from "Sở Khoa học và Công nghệ Hà Nội"
3. Should NOT see systems from other organizations

4. Logout and login as `org2`
5. Should only see systems from "Viện Khoa học Công nghệ Việt Nam"

---

## Post-Deployment Checklist

- [ ] Code pulled from Github
- [ ] Backend restarted successfully
- [ ] No errors in backend logs
- [ ] org1 can view system details
- [ ] org1 can edit systems
- [ ] org2 can view system details
- [ ] org2 can edit systems
- [ ] Data isolation still working (org1 can't see org2's systems)
- [ ] Admin still has full access

---

## Rollback Plan (If Issues Occur)

If critical issues arise:

```bash
# Rollback to previous commit
git reset --hard 863d49e
docker compose restart backend
```

Then investigate and fix properly.

---

## Technical Details

### Files Changed
- `backend/apps/accounts/permissions.py` - Fixed field name checks

### No Database Changes
This is a code-only fix. No migrations needed.

### No Frontend Changes
Frontend was already correct. Issue was purely backend permissions.

---

## Expected Behavior After Fix

| User Type | Can List Systems | Can View Details | Can Edit | Can See Other Orgs |
|-----------|-----------------|------------------|----------|-------------------|
| Admin | ✅ All | ✅ All | ✅ All | ✅ Yes |
| org1 | ✅ Own org only | ✅ Own org only | ✅ Own org only | ❌ No |
| org2 | ✅ Own org only | ✅ Own org only | ✅ Own org only | ❌ No |

---

## Additional Notes

### Why This Bug Existed
- During P0.5 Multi-Tenancy development, we standardized on using `organization` field name for User model
- But System model was created earlier with `org` field name for brevity
- Permission classes assumed all models use `organization`, but didn't check System's actual field name
- This wasn't caught because:
  1. List view uses `get_queryset()` filtering (which works correctly)
  2. Detail/Edit views use `has_object_permission()` which failed silently for org_user

### Prevention for Future
- Document field name conventions clearly
- Add integration tests for org_user permissions on all models
- Consider adding a helper method to get organization field dynamically

---

**Deployment Date:** 2026-01-17 (Evening)
**Priority:** Critical - Blocks core functionality
**Estimated Downtime:** ~30 seconds (backend restart only)
**Risk Level:** Low (code-only change, no breaking changes)

---

## Support

If deployment fails or issues persist:

1. Check backend logs:
```bash
docker compose logs backend --tail=100
```

2. Check if permissions are imported correctly:
```bash
docker compose exec backend python manage.py shell
>>> from apps.accounts.permissions import IsOrgUserOrAdmin
>>> # Should import without errors
```

3. Contact development team with error messages.
