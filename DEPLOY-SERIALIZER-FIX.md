# DEPLOYMENT: Fix Nested Data Save Issue

## Problem
Backend serializer receives nested data but doesn't save to related tables (0% success rate on system 115).

## Root Cause
Production server likely running old code without proper update()/create() methods for nested writes.

## Solution
Deploy current serializers.py which has correct implementation.

## Verification (Local Code is Correct)
✅ SystemCreateUpdateSerializer has custom update() method (lines 411-498)
✅ SystemCreateUpdateSerializer has custom create() method (lines 371-409)
✅ Both methods properly handle nested writes for:
  - architecture_data → system_architecture table
  - data_info_data → system_data_info table
  - operations_data → system_operations table
  - integration_data → system_integration table
  - assessment_data → system_assessment table

## Deployment Steps

### Step 1: Upload File to Production
```bash
# From local machine
scp /Users/shimazu/Dropbox/9.\ active/consultant/support_b4t/thong_ke_he_thong/backend/apps/systems/serializers.py \
  admin_@34.142.152.104:/home/admin_/thong_ke_he_thong/backend/apps/systems/serializers.py
```

### Step 2: SSH to Production
```bash
ssh admin_@34.142.152.104
# Password: aivnews_xinchao_#*2020
```

### Step 3: Verify File Uploaded
```bash
cd /home/admin_/thong_ke_he_thong/backend/apps/systems
ls -lh serializers.py
# Should show recent timestamp
```

### Step 4: Clear Python Cache (IMPORTANT!)
```bash
cd /home/admin_/thong_ke_he_thong
find . -type d -name __pycache__ -exec rm -rf {} + 2>/dev/null || true
find . -name "*.pyc" -delete
```

### Step 5: Restart Backend Container
```bash
cd /home/admin_/thong_ke_he_thong
docker-compose restart backend
```

### Step 6: Verify Container Restarted
```bash
docker-compose ps
# backend should show "Up" status with recent restart time
```

### Step 7: Check Logs
```bash
docker-compose logs -f --tail=50 backend
# Watch for any errors
# Press Ctrl+C to exit log view
```

## Testing After Deployment

### Test 1: Edit Existing System (System 115)
1. Login to admin panel
2. Navigate to system 115
3. Go to Tab 3 (Architecture)
4. Fill in:
   - Backend Technology: "Python, Django"
   - Frontend Technology: "React, TypeScript"
5. Click Save
6. Refresh page - verify values persisted

### Test 2: Verify Database
```bash
# SSH to production
ssh admin_@34.142.152.104

# Connect to PostgreSQL
docker-compose exec db psql -U postgres -d thongke_db

# Query system_architecture table
SELECT id, backend_tech, frontend_tech
FROM system_architecture
WHERE system_id = 115;

# Should show the values you just entered!
```

### Expected Results
- ✅ Form saves without errors
- ✅ Values persist after page refresh
- ✅ Database query shows data in system_architecture table
- ✅ Success rate: 100% (14/14 fields saved)

## Rollback (if needed)
```bash
# If deployment fails, restore from git
cd /home/admin_/thong_ke_he_thong
git checkout backend/apps/systems/serializers.py
docker-compose restart backend
```

## Success Criteria
- [ ] File uploaded successfully
- [ ] Python cache cleared
- [ ] Backend container restarted without errors
- [ ] Test edit system 115 - data persists
- [ ] Database query confirms data saved
- [ ] All 14 architecture fields (100%) save correctly

## Monitoring
After deployment, monitor for 10 minutes:
```bash
docker-compose logs -f backend | grep -i error
```

No errors = SUCCESS! 🎉
