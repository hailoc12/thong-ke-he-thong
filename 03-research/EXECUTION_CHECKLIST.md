# Organization Recreation - Execution Checklist

**Date**: _____________

**Executed by**: _____________

**Production Server**: `admin_@34.142.152.104`

---

## Pre-Execution Checklist

### Phase 1: Preparation
- [ ] Read `ORGANIZATION_RECREATION_GUIDE.md` completely
- [ ] Read `SUMMARY_ORGANIZATION_RECREATION.md`
- [ ] Understand risks and safety mechanisms
- [ ] Verify Excel file exists at correct path
- [ ] Ensure SSH access to production server
- [ ] Verify you have necessary permissions

### Phase 2: Excel File Verification
```bash
open "/Users/shimazu/Dropbox/9. active/consultant/support_b4t/thong_ke_he_thong/03-research/danh-sach-tai-khoan-don-vi-NEW.xlsx"
```

- [ ] Total organizations: **34** ✓
- [ ] All organization names are correct
- [ ] All usernames are appropriate
- [ ] Password is `ThongkeCDS@2026#`
- [ ] No duplicate organization names
- [ ] No duplicate usernames

### Phase 3: Pre-flight Checks
```bash
# Test SSH connection
ssh admin_@34.142.152.104 "echo 'SSH OK'"
```
- [ ] SSH connection successful

```bash
# Check Docker containers
ssh admin_@34.142.152.104 "docker ps | grep backend"
```
- [ ] Backend container is running

```bash
# Check current database state
ssh admin_@34.142.152.104 "docker exec thong_ke_he_thong-backend-1 python manage.py shell -c '
from apps.organizations.models import Organization
from apps.accounts.models import User
print(f\"Organizations: {Organization.objects.count()}\")
print(f\"Admin users: {User.objects.filter(role=\"admin\").count()}\")
print(f\"Org users: {User.objects.filter(role=\"org_user\").count()}\")
'"
```

**Current State** (record for reference):
- Organizations: __________
- Admin users: __________
- Org users: __________

- [ ] Recorded current state

---

## Execution Checklist

### Phase 4: Dry-Run Execution
```bash
cd "/Users/shimazu/Dropbox/9. active/consultant/support_b4t/thong_ke_he_thong/03-research"
./deploy_org_recreation.sh --dry-run
```

**Dry-Run Results**:
- [ ] Script completed without errors
- [ ] Shows correct current state
- [ ] Shows correct planned actions (DELETE 34 + CREATE 34)
- [ ] Sample organizations look correct
- [ ] Message: "DRY RUN MODE - No changes made"

**Time completed**: __________

### Phase 5: Production Execution (DANGER!)
```bash
cd "/Users/shimazu/Dropbox/9. active/consultant/support_b4t/thong_ke_he_thong/03-research"
./deploy_org_recreation.sh --execute
```

**During Execution**:
- [ ] Confirmation prompt appeared
- [ ] Typed: `I UNDERSTAND THE RISKS`
- [ ] Excel file uploaded successfully
- [ ] Backup created (note backup filename: _______________)
- [ ] Organization users deleted
- [ ] Organizations deleted
- [ ] New organizations created
- [ ] New users created
- [ ] Script completed successfully

**Backup File**: `/tmp/org_backup_____________________`

**Time started**: __________
**Time completed**: __________

---

## Post-Execution Verification

### Phase 6: Database State Verification
```bash
ssh admin_@34.142.152.104 "docker exec thong_ke_he_thong-backend-1 python manage.py shell -c '
from apps.organizations.models import Organization
from apps.accounts.models import User
print(f\"Organizations: {Organization.objects.count()}\")
print(f\"Admin users: {User.objects.filter(role=\"admin\").count()}\")
print(f\"Org users: {User.objects.filter(role=\"org_user\").count()}\")
print(\"\nSample organizations:\")
for org in Organization.objects.all()[:5]:
    print(f\"  - {org.name}\")
'"
```

**Final State**:
- Organizations: __________ (expected: 34)
- Admin users: __________ (expected: unchanged from Phase 3)
- Org users: __________ (expected: 34)

- [ ] Organization count is correct (34)
- [ ] Admin user count unchanged
- [ ] Org user count is correct (34)
- [ ] Sample organizations look correct

### Phase 7: Login Testing

Test 5 sample accounts:

**Test 1**: Vụ Bưu chính
```bash
curl -X POST http://34.142.152.104:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"username":"vu-buuchinh","password":"ThongkeCDS@2026#"}'
```
- [ ] Login successful
- [ ] Returned JWT token

**Test 2**: PTIT
```bash
curl -X POST http://34.142.152.104:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"username":"ptit","password":"ThongkeCDS@2026#"}'
```
- [ ] Login successful

**Test 3**: VNNIC
```bash
curl -X POST http://34.142.152.104:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"username":"vnnic","password":"ThongkeCDS@2026#"}'
```
- [ ] Login successful

**Test 4**: STAMEQ
```bash
curl -X POST http://34.142.152.104:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"username":"stameq","password":"ThongkeCDS@2026#"}'
```
- [ ] Login successful

**Test 5**: VNExpress
```bash
curl -X POST http://34.142.152.104:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"username":"vnexpress","password":"ThongkeCDS@2026#"}'
```
- [ ] Login successful

### Phase 8: Admin Account Verification
```bash
# Test existing admin account (use actual admin credentials)
curl -X POST http://34.142.152.104:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"username":"<admin_username>","password":"<admin_password>"}'
```
- [ ] Admin login still works
- [ ] Admin can access all organizations

### Phase 9: Frontend Testing
- [ ] Open frontend application
- [ ] Test organization login with sample account
- [ ] Verify organization selection dropdown shows 34 organizations
- [ ] Verify organization data loads correctly
- [ ] Test creating a new system under organization
- [ ] Test logging out and logging back in

### Phase 10: Backup Management
```bash
# Secure the backup file
ssh admin_@34.142.152.104 "chmod 600 /tmp/org_backup_*.json"

# Verify backup file
ssh admin_@34.142.152.104 "ls -lh /tmp/org_backup_*.json"
```

**Backup file size**: __________

- [ ] Backup file secured (permissions 600)
- [ ] Backup file size is reasonable (not empty)
- [ ] Backup filename recorded

**Backup retention decision**:
- [ ] Keep for 30 days then delete
- [ ] Archive to secure storage: __________
- [ ] Delete after verification (not recommended)

---

## Issue Log

If any issues occurred during execution, document here:

| Issue # | Phase | Description | Resolution | Time |
|---------|-------|-------------|------------|------|
| 1 | | | | |
| 2 | | | | |
| 3 | | | | |

---

## Post-Migration Tasks

### Immediate (Today)
- [ ] Document any issues encountered
- [ ] Notify stakeholders of successful completion
- [ ] Send credentials to organization contacts
- [ ] Update internal documentation

### Short-term (This Week)
- [ ] Monitor support requests for login issues
- [ ] Verify all 34 organizations can login successfully
- [ ] Collect feedback from users
- [ ] Archive this checklist

### Long-term (This Month)
- [ ] Review password policy
- [ ] Consider implementing password change on first login
- [ ] Plan for future organization management improvements
- [ ] Update disaster recovery procedures

---

## Sign-off

**Execution Completed By**:

Name: _________________________

Role: _________________________

Signature: _________________________

Date: _________________________

**Verified By** (if applicable):

Name: _________________________

Role: _________________________

Signature: _________________________

Date: _________________________

---

## Rollback Executed?

- [ ] Yes (document reason below)
- [ ] No

**Rollback Reason** (if applicable):

_______________________________________________________________

_______________________________________________________________

**Rollback Method**:

_______________________________________________________________

**Rollback Result**:

_______________________________________________________________

---

## Notes

Additional notes or observations:

_______________________________________________________________

_______________________________________________________________

_______________________________________________________________

_______________________________________________________________

---

**Checklist Version**: 1.0
**Date Created**: 2026-01-21
**Last Updated**: 2026-01-21
