# Fix: Organizations Pagination Issue - Excel Export Only Shows 20 of 32 Organizations

## Root Cause Analysis

### Problem
The Excel export function was only showing 20 organizations instead of all 32 organizations in the system.

### Root Cause
The `fetchOrganizations` function in `Dashboard.tsx` was calling `/organizations/` without pagination parameters. The backend has DRF's `PageNumberPagination` enabled globally, which defaults to a page size of approximately 10-20 items.

**Before (Line 107-114):**
```typescript
const fetchOrganizations = async () => {
  try {
    const response = await api.get('/organizations/');
    setOrganizations(response.data.results || response.data);
  } catch (error) {
    console.error('Failed to fetch organizations:', error);
  }
};
```

### Fix Applied
Added `page_size=1000` parameter to fetch ALL organizations in a single request.

**After:**
```typescript
const fetchOrganizations = async () => {
  try {
    // Fetch ALL organizations without pagination for Excel export
    const response = await api.get('/organizations/?page_size=1000');
    setOrganizations(response.data.results || response.data);
  } catch (error) {
    console.error('Failed to fetch organizations:', error);
  }
};
```

## Files Modified
- `frontend/src/pages/Dashboard.tsx` - Line 110

## Server Status (2026-01-26)
- Server IP: 34.142.152.104
- Ping: ✅ Working (79ms average)
- SSH (Port 22): ❌ Connection refused
- HTTP: ❌ 502 Bad Gateway

## Deployment Instructions

### Method 1: Automated Script
Run the deployment script when SSH becomes available:
```bash
cd ~/Dropbox/9.\ active/consultant/support_b4t/thong_ke_he_thong
./deploy-orgs-pagination-fix.sh
```

### Method 2: Manual Deployment
```bash
# 1. SSH to server
ssh admin@34.142.152.104
# Password: aivnews_xinchao_#*2020

# 2. Navigate to project
cd ~/thong_ke_he_thong

# 3. Update the file (copy from local or edit with nano/vim)
# In fetchOrganizations function, change:
#   const response = await api.get('/organizations/');
# To:
#   const response = await api.get('/organizations/?page_size=1000');

# 4. Clear Docker build cache
docker builder prune -af

# 5. Rebuild frontend without cache
DOCKER_BUILDKIT=0 docker compose build frontend --no-cache

# 6. Restart frontend
docker compose up -d frontend

# 7. Verify
docker compose ps frontend
```

## Verification Steps
1. Open Dashboard admin panel
2. Click "Xuất Excel" button
3. Check Sheet 2 "Theo đơn vị" - should now show all 32 organizations
4. Check Sheet 4 "Lưu ý đôn đốc" - should include all organizations needing follow-up

## Additional Notes
- The `mergeOrganizationsWithCompletionStats` function in `exportExcel.ts` is already implemented correctly
- It merges all organizations (including those without systems) with completion stats
- The only issue was that `organizations` state didn't contain all 32 orgs

## Related Files
- `frontend/src/pages/Dashboard.tsx` - Main dashboard component
- `frontend/src/utils/exportExcel.ts` - Excel export utility with merge function
- `backend/apps/organizations/views.py` - Organizations ViewSet
- `backend/config/settings.py` - Global pagination configuration
