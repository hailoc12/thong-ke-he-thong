# Deploy Excel Export Fix

**Date:** 2026-01-29
**Commit:** 3d69561

## Issues Fixed

### 1. completion_percentage Empty in Export
- **Problem:** Column "Hoàn thành (%)" was empty in Excel export despite showing 98% in UI
- **Root Cause:** `SystemDetailSerializer` (used by `/api/systems/export_data/`) was missing `completion_percentage` field
- **Fix:** Added `completion_percentage` SerializerMethodField to `SystemDetailSerializer` in `backend/apps/systems/serializers.py`

### 2. Boolean Fields Showing Empty Instead of "Không"
- **Problem:** Boolean fields from nested models (SystemSecurity, SystemInfrastructure) showed empty instead of "Không" when the nested record doesn't exist
- **Root Cause:** `formatBoolean(undefined)` returned '' (empty string)
- **Fix:** Modified `formatBoolean()` in `frontend/src/utils/exportSystemsDetailToExcel.ts` to return "Không" for undefined/null

## Deployment Steps

### SSH to Server
```bash
ssh root@103.145.63.61
# or
ssh root@hientrangcds.mst.gov.vn
```

### Pull Latest Code
```bash
cd /root/thong-ke-he-thong
git pull origin main
```

### Rebuild Frontend (with cache clearing)
```bash
# Clear Docker build cache
docker builder prune -af

# Rebuild frontend with no cache
DOCKER_BUILDKIT=0 docker compose build frontend --no-cache

# Restart frontend container
docker compose up -d frontend
```

### Restart Backend (for serializer changes)
```bash
docker compose restart backend
```

### Verify Deployment
```bash
# Check containers are running
docker compose ps

# Check frontend has new code (look for new JS hash)
docker compose exec frontend ls -la /usr/share/nginx/html/assets/

# Check backend logs
docker compose logs --tail=50 backend
```

## Test After Deployment

1. Login to https://hientrangcds.mst.gov.vn
2. Go to Systems page
3. Click "Xuất Excel" → "Xuất file"
4. Open Excel file and check:
   - Column 16 "Hoàn thành (%)" should have values like "98.0%"
   - Boolean columns like "Có MFA", "Có Firewall" should show "Không" instead of empty

## Files Changed

1. `frontend/src/utils/exportSystemsDetailToExcel.ts`
   - `formatBoolean()` now returns "Không" for undefined/null

2. `backend/apps/systems/serializers.py`
   - Added `completion_percentage` to `SystemDetailSerializer`
   - Added `get_completion_percentage()` method

## Git Log
```
commit 3d69561
Author: shimazu
Date:   2026-01-29

    fix(export): Fix boolean fields showing empty + add completion_percentage to export

    1. Frontend: formatBoolean() now returns "Không" for undefined/null values
       instead of empty string, since model defaults are False

    2. Backend: Added completion_percentage SerializerMethodField to
       SystemDetailSerializer so export_data endpoint returns this field
```
