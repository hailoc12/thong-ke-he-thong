# HOT FIX: Text Field Length Limit - Deployment Instructions

## Bug Description
Users cannot save long text in "Khác" (Other) fields, causing system crashes.
Example field: "Nhóm hệ thống" (system_group) and other freeform text fields.

## Root Cause
CharField fields have max_length constraints (100-500 chars) but users need to input longer descriptions.

## Solution
Convert all freeform text CharField fields to TextField (unlimited length).

## Files Changed
1. `/backend/apps/systems/migrations/0021_convert_text_fields_to_textfield.py` - NEW migration
2. `/backend/apps/systems/models.py` - Updated model definitions

## Fields Fixed (Total: 27 fields)

### System Model
- system_group (255 → unlimited) **CRITICAL**
- programming_language
- framework
- database_name
- data_classification_type
- data_volume
- data_exchange_method
- authentication_method
- compliance_standards_list
- server_configuration
- storage_capacity
- backup_plan
- disaster_recovery_plan
- business_owner
- technical_owner
- responsible_person

### SystemArchitecture Model
- backend_tech
- frontend_tech
- database_type
- hosting_type
- cloud_provider
- containerization
- automated_testing_tools

### SystemOperations Model
- developer
- operator
- support_level

### SystemIntegration Model
- api_standard
- api_gateway_name
- api_versioning_standard

### SystemCost Model
- funding_source

### SystemVendor Model
- vendor_name
- vendor_contact_person

---

## Deployment Steps

### 1. Backup Database (CRITICAL!)
```bash
ssh admin_@34.142.152.104
cd /home/admin_/thong_ke_he_thong

# Create backup
pg_dump -U admin_ -h localhost system_reports > backup_before_hotfix_$(date +%Y%m%d_%H%M%S).sql

# Verify backup created
ls -lh backup_*.sql
```

### 2. Upload Migration File
```bash
# From local machine
scp backend/apps/systems/migrations/0021_convert_text_fields_to_textfield.py \
    admin_@34.142.152.104:/home/admin_/thong_ke_he_thong/backend/apps/systems/migrations/
```

### 3. Upload Updated models.py
```bash
# From local machine
scp backend/apps/systems/models.py \
    admin_@34.142.152.104:/home/admin_/thong_ke_he_thong/backend/apps/systems/
```

### 4. Run Migration on Production
```bash
ssh admin_@34.142.152.104
cd /home/admin_/thong_ke_he_thong/backend

# Activate virtual environment
source env/bin/activate  # or source venv/bin/activate

# Check migration
python manage.py showmigrations systems

# Run migration (DRY RUN FIRST - if available)
python manage.py migrate systems 0021 --fake-initial --plan

# Run migration FOR REAL
python manage.py migrate systems 0021

# Verify migration applied
python manage.py showmigrations systems | grep 0021
```

### 5. Restart Backend
```bash
# Find backend process
ps aux | grep python | grep manage.py

# Kill and restart
sudo systemctl restart thong_ke_he_thong_backend
# OR
sudo supervisorctl restart thong_ke_he_thong_backend
# OR if running manually:
# kill <PID>
# cd /home/admin_/thong_ke_he_thong/backend
# nohup python manage.py runserver 0.0.0.0:8000 &
```

### 6. Verify Fix
```bash
# SSH to server
ssh admin_@34.142.152.104
cd /home/admin_/thong_ke_he_thong/backend

# Test with Django shell
python manage.py shell

# In shell:
from apps.systems.models import System
from apps.organizations.models import Organization

# Create test system with LONG text
org = Organization.objects.first()
test_text = "Bao gồm: " + "Hệ thống quản lý nội bộ, " * 50  # Very long text

system = System.objects.create(
    org=org,
    system_name="TEST LONG TEXT",
    system_group=test_text,
    scope="internal_unit"
)

print(f"✓ Created system with {len(test_text)} characters in system_group")
print(f"✓ System ID: {system.id}")

# Retrieve and verify
s = System.objects.get(id=system.id)
print(f"✓ Retrieved system_group length: {len(s.system_group)}")

# Clean up test data
system.delete()
print("✓ Test data cleaned up")

# Exit shell
exit()
```

### 7. Test from Frontend
1. Login to application: http://34.142.152.104:3000
2. Navigate to Systems → Create New System
3. Fill "Nhóm hệ thống" dropdown: Select "Khác" (Other)
4. Type a VERY LONG text (500+ characters):
   ```
   Bao gồm: Hệ thống quản lý nội bộ, hệ thống biên tập, phê duyệt tin bài cho báo. Hệ thống lưu trữ và cung cấp dịch vụ cho độc giả bên ngoài. Hệ thống phân tích dữ liệu, báo cáo thống kê. Hệ thống quản lý người dùng, phân quyền. Hệ thống tích hợp thanh toán điện tử. Hệ thống quản lý nội dung đa phương tiện. Hệ thống backup và khôi phục dữ liệu. Hệ thống giám sát và cảnh báo. Hệ thống quản lý workflow nghiệp vụ.
   ```
5. Click Save
6. Verify: No crash, data saved successfully
7. Edit the system and verify the long text is displayed correctly

---

## Rollback Plan (If Something Goes Wrong)

### Option 1: Restore from Backup
```bash
ssh admin_@34.142.152.104
cd /home/admin_/thong_ke_he_thong

# Stop backend
sudo systemctl stop thong_ke_he_thong_backend

# Restore database
psql -U admin_ -h localhost system_reports < backup_before_hotfix_TIMESTAMP.sql

# Restart backend
sudo systemctl start thong_ke_he_thong_backend
```

### Option 2: Reverse Migration
```bash
cd /home/admin_/thong_ke_he_thong/backend
source env/bin/activate

# Reverse to previous migration
python manage.py migrate systems 0020

# Restart backend
sudo systemctl restart thong_ke_he_thong_backend
```

---

## Post-Deployment Verification Checklist

- [ ] Database backup created successfully
- [ ] Migration 0021 applied without errors
- [ ] Backend restarted successfully
- [ ] Django shell test passed (long text saved and retrieved)
- [ ] Frontend test passed (user can input 500+ chars and save)
- [ ] No errors in backend logs
- [ ] No errors in frontend console
- [ ] Existing systems still load correctly
- [ ] User confirms bug is fixed

---

## Expected Migration Output

```
Operations to perform:
  Apply all migrations: systems
Running migrations:
  Applying systems.0021_convert_text_fields_to_textfield... OK

--- Migration completed successfully ---
```

---

## Troubleshooting

### Error: Migration already applied
```bash
# Check migration status
python manage.py showmigrations systems

# If 0021 shows [X], it's already applied
# If issues persist, check database schema directly:
python manage.py dbshell

# In psql:
\d systems;
\d system_architecture;

# Check if fields are already text:
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'systems'
AND column_name IN ('system_group', 'programming_language', 'framework');

# Exit psql
\q
```

### Error: Backend won't restart
```bash
# Check logs
sudo journalctl -u thong_ke_he_thong_backend -n 100

# Check Python errors
cd /home/admin_/thong_ke_he_thong/backend
python manage.py check

# Try running manually
python manage.py runserver 0.0.0.0:8000
```

---

## Contact

If you encounter any issues during deployment:
1. DO NOT PANIC
2. Check backup is intact: `ls -lh backup_*.sql`
3. Contact support with error logs
4. Consider rollback if critical

---

## Estimated Downtime

- Database backup: 30 seconds
- Migration execution: 10-30 seconds (depends on data volume)
- Backend restart: 5-10 seconds
- **Total: ~1-2 minutes**

Migration is NON-DESTRUCTIVE (only changing field types from VARCHAR to TEXT).
Data will NOT be lost.

---

## Success Criteria

✅ User can input 1000+ characters in "Nhóm hệ thống" field
✅ System saves without crash
✅ Data retrieval works correctly
✅ No performance degradation
✅ All existing systems load normally

---

**Status**: Ready for deployment
**Priority**: URGENT - Production bug affecting users
**Risk Level**: LOW (non-destructive migration + backup strategy)
