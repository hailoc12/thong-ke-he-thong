# Organization Recreation Guide

**DANGER: Production Database Operation**

This guide documents the process to recreate all 34 organizations and their users in the production database based on the authoritative list from the Word document.

## Overview

- **Production Server**: `admin_@34.142.152.104`
- **Database**: PostgreSQL (system_reports)
- **Current State**: 34 organizations + their users
- **Target State**: Recreate 34 organizations from authoritative list
- **Risk Level**: 🔴 **HIGH** (involves deletion of production data)

## What This Process Does

1. ✅ **Preserves**: Admin users (role='admin')
2. ❌ **Deletes**: All organization users (role='org_user')
3. ❌ **Deletes**: All organizations
4. ✅ **Creates**: 34 new organizations from Excel file
5. ✅ **Creates**: 34 new organization users with credentials from Excel

## Files Created

### 1. Excel File with Account List
**Path**: `/Users/shimazu/Dropbox/9. active/consultant/support_b4t/thong_ke_he_thong/03-research/danh-sach-tai-khoan-don-vi-NEW.xlsx`

**Columns**:
- `Tên đơn vị`: Organization name (Vietnamese)
- `Username`: Generated username (slug format)
- `Password`: `ThongkeCDS@2026#` (same for all)

**Sample usernames**:
```
Vụ Bưu chính                          → vu-buuchinh
Cục An toàn bức xạ và hạt nhân        → cuc-atbxhn
Học viện Công nghệ Bưu chính Viễn thông → ptit
Báo VNExpress                         → vnexpress
Trung tâm Internet Việt Nam           → vnnic
```

**Total**: 34 organizations

### 2. Django Management Command
**Path**: `/Users/shimazu/Dropbox/9. active/consultant/support_b4t/thong_ke_he_thong/backend/apps/organizations/management/commands/recreate_organizations.py`

**Features**:
- ✅ Automatic backup before deletion (saved to `/tmp/org_backup_YYYYMMDD_HHMMSS.json`)
- ✅ Dry-run mode to preview changes
- ✅ Transaction safety (all-or-nothing)
- ✅ Confirmation prompts
- ✅ Preserves admin users
- ✅ Validates Excel data before execution

**Usage**:
```bash
# Dry run (preview only)
python manage.py recreate_organizations --excel /path/to/file.xlsx --dry-run

# Execute with backup
python manage.py recreate_organizations --excel /path/to/file.xlsx

# Execute with backup, skip confirmation
python manage.py recreate_organizations --excel /path/to/file.xlsx --yes

# Execute without backup (NOT RECOMMENDED)
python manage.py recreate_organizations --excel /path/to/file.xlsx --no-backup
```

### 3. Deployment Script
**Path**: `/Users/shimazu/Dropbox/9. active/consultant/support_b4t/thong_ke_he_thong/03-research/deploy_org_recreation.sh`

**Features**:
- ✅ SSH connection validation
- ✅ Docker container health check
- ✅ Shows current database state
- ✅ Uploads Excel file to server
- ✅ Executes management command in Docker container
- ✅ Shows final database state
- ✅ Dry-run mode

**Usage**:
```bash
# Dry run (safe preview)
./deploy_org_recreation.sh --dry-run

# Execute for real
./deploy_org_recreation.sh --execute
```

## Database Schema

### User Model
```python
class User(AbstractUser):
    role = CharField(choices=['admin', 'org_user'])
    organization = ForeignKey(Organization, on_delete=SET_NULL, null=True)
    phone = CharField(max_length=20)
```

**Key Points**:
- `organization` uses `SET_NULL`, NOT `CASCADE`
- Admin users have `role='admin'` and `organization=NULL`
- Organization users have `role='org_user'` and `organization=<org_id>`

### Organization Model
```python
class Organization(Model):
    name = CharField(max_length=255, unique=True)
    code = CharField(max_length=50, unique=True, null=True)
    description = TextField(blank=True)
    contact_person = CharField(max_length=255, blank=True)
    contact_email = EmailField(blank=True)
    contact_phone = CharField(max_length=20, blank=True)
```

## Safety Mechanisms

### 1. Backup
Before any deletion, a JSON backup is created with:
```json
{
  "timestamp": "2026-01-21T10:30:00",
  "organizations": [...],
  "org_users": [...]
}
```

**Backup location**: `/tmp/org_backup_YYYYMMDD_HHMMSS.json` on production server

### 2. Transaction Safety
All operations are wrapped in `transaction.atomic()`:
- If ANY step fails, ALL changes are rolled back
- Database remains in consistent state

### 3. Admin Preservation
- Admin users are NEVER touched
- Only `role='org_user'` users are deleted
- Admin users can still login after recreation

### 4. Dry-Run Mode
- Preview all changes without modifying database
- Shows exactly what will be deleted and created
- No confirmation prompts in dry-run

### 5. Confirmation Prompts
- Deployment script requires: `I UNDERSTAND THE RISKS`
- Management command requires: `DELETE ALL ORGANIZATIONS`
- Can be skipped with `--yes` flag (use with caution!)

## Execution Steps

### Step 1: Review Excel File
```bash
open "/Users/shimazu/Dropbox/9. active/consultant/support_b4t/thong_ke_he_thong/03-research/danh-sach-tai-khoan-don-vi-NEW.xlsx"
```

Verify:
- ✅ 34 organizations
- ✅ All organization names are correct
- ✅ All usernames are unique
- ✅ Password is `ThongkeCDS@2026#`

### Step 2: Run Dry-Run on Production
```bash
cd "/Users/shimazu/Dropbox/9. active/consultant/support_b4t/thong_ke_he_thong/03-research"
./deploy_org_recreation.sh --dry-run
```

**Expected output**:
```
Current production database state
Organizations: 34
Total users:   XX
Admin users:   X
Org users:     34

Planned actions:
   DELETE: 34 organization users
   DELETE: 34 organizations
   CREATE: 34 organizations
   CREATE: 34 organization users

Sample of new organizations:
   - Vụ Bưu chính → vu-buuchinh
   - ...

DRY RUN MODE - No changes made
```

### Step 3: Execute on Production (DANGER!)
```bash
cd "/Users/shimazu/Dropbox/9. active/consultant/support_b4t/thong_ke_he_thong/03-research"
./deploy_org_recreation.sh --execute
```

**You will be prompted**:
```
Type 'I UNDERSTAND THE RISKS' to continue:
```

**After confirmation**, the script will:
1. Upload Excel file to server
2. Create backup in `/tmp/`
3. Delete all org_user accounts
4. Delete all organizations
5. Create 34 new organizations
6. Create 34 new users
7. Show final state

### Step 4: Verify Results

**Check database state**:
```bash
ssh admin_@34.142.152.104 "docker exec thong_ke_he_thong-backend-1 python manage.py shell -c '
from apps.accounts.models import User
from apps.organizations.models import Organization

print(f\"Organizations: {Organization.objects.count()}\")
print(f\"Org users: {User.objects.filter(role=\"org_user\").count()}\")
print(f\"Admin users: {User.objects.filter(role=\"admin\").count()}\")
'"
```

**Expected**:
```
Organizations: 34
Org users: 34
Admin users: X (unchanged)
```

**Test login** with sample credentials:
```
Username: vu-buuchinh
Password: ThongkeCDS@2026#
```

## Rollback Plan

If something goes wrong, you can restore from backup:

### 1. Locate Backup File
```bash
ssh admin_@34.142.152.104 "ls -lht /tmp/org_backup_*.json | head -5"
```

### 2. Create Restore Script
```python
# restore_from_backup.py
import json
from apps.accounts.models import User
from apps.organizations.models import Organization
from django.contrib.auth.hashers import make_password

with open('/tmp/org_backup_YYYYMMDD_HHMMSS.json', 'r') as f:
    backup = json.load(f)

# Delete current data
User.objects.filter(role='org_user').delete()
Organization.objects.all().delete()

# Restore organizations
for org_data in backup['organizations']:
    Organization.objects.create(**org_data)

# Restore users (note: passwords are hashed in backup, cannot restore)
# Users will need password reset!
```

**⚠️ WARNING**: Backup does NOT include password hashes (security). Restored users will need password reset.

## Testing Before Production

If you want to test on a staging environment first:

### 1. Setup Local Test Environment
```bash
cd /Users/shimazu/Dropbox/9.\ active/consultant/support_b4t/thong_ke_he_thong
docker-compose up -d
```

### 2. Run Migration Locally
```bash
docker exec thong_ke_he_thong-backend-1 python manage.py recreate_organizations \
    --excel /app/../03-research/danh-sach-tai-khoan-don-vi-NEW.xlsx \
    --dry-run
```

### 3. Execute Locally
```bash
docker exec thong_ke_he_thong-backend-1 python manage.py recreate_organizations \
    --excel /app/../03-research/danh-sach-tai-khoan-don-vi-NEW.xlsx
```

### 4. Verify
```bash
docker exec thong_ke_he_thong-backend-1 python manage.py shell -c "
from apps.accounts.models import User
from apps.organizations.models import Organization
print(f'Orgs: {Organization.objects.count()}')
print(f'Users: {User.objects.filter(role=\"org_user\").count()}')
"
```

## Troubleshooting

### Issue: "Excel file not found"
**Solution**: Check Excel file path in deployment script matches actual location

### Issue: "Cannot connect to production server"
**Solution**:
```bash
ssh admin_@34.142.152.104  # Test SSH connection
```

### Issue: "Backend container is not running"
**Solution**:
```bash
ssh admin_@34.142.152.104 "docker ps"  # Check running containers
ssh admin_@34.142.152.104 "cd ~/thong_ke_he_thong && docker-compose up -d"
```

### Issue: "Duplicate organization names"
**Solution**: Check Excel file for duplicate entries in column A

### Issue: "Duplicate usernames"
**Solution**: Check Excel file for duplicate entries in column B

### Issue: "Transaction failed"
**Solution**:
- All changes are automatically rolled back
- Check backup file in `/tmp/`
- Review error message for root cause

## Post-Migration Checklist

After successful migration:

- [ ] Verify organization count: 34
- [ ] Verify org_user count: 34
- [ ] Verify admin users unchanged
- [ ] Test login with 3-5 sample accounts
- [ ] Test organization selection in frontend
- [ ] Notify users of new credentials (password: `ThongkeCDS@2026#`)
- [ ] Archive backup file for compliance
- [ ] Update documentation if organization list changes

## Security Notes

1. **Password**: All accounts use the same password `ThongkeCDS@2026#`
   - Consider forcing password change on first login
   - Implement password policy if not already in place

2. **Backup**: Contains sensitive user information
   - Delete backup files after verification
   - Or encrypt and archive securely

3. **Admin Access**: Ensure at least one admin account is working before migration
   - Test admin login before starting
   - Have backup admin account ready

## Contact

If you encounter issues:
- Check this guide's Troubleshooting section
- Review backup files in `/tmp/`
- Contact system administrator

---

**Last Updated**: 2026-01-21
**Created By**: Claude Code
**Version**: 1.0
