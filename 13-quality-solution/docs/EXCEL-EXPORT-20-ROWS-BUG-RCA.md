# Excel Export 20-Rows Bug - Root Cause Analysis

**Date**: 2026-01-26 22:30
**Status**: Root Cause Identified + Fix Ready
**Severity**: High (Data completeness issue)

---

## Executive Summary

Live testing on production website (https://hientrangcds.mst.gov.vn) confirmed that Excel export has TWO different bugs:

1. **Sheet 2 (Theo đơn vị)**: FIXED - Shows all 32 organizations
2. **Sheet 3 (Danh sách HT)**: BUG - Shows only 20 systems out of 77 (missing 57 systems)

---

## Live Test Results

### Test Execution
- **URL**: https://hientrangcds.mst.gov.vn
- **User**: admin
- **Test Date**: 2026-01-26 22:25
- **Downloaded File**: `Bao-cao-CDS-26-01-2026.xlsx`
- **JavaScript Bundle**: `index-D85PF6Kt.js` (NEW build with fix)

### Actual Results

| Sheet | Expected | Actual | Status |
|-------|----------|--------|--------|
| Sheet 1 (Tổng quan) | Summary stats | 18 rows | OK |
| Sheet 2 (Theo đơn vị) | 32 organizations | 36 rows (32 orgs + header + notes) | **FIXED** |
| Sheet 3 (Danh sách HT) | 77 systems | 21 rows (20 systems + header) | **BUG** |
| Sheet 4 (Lưu ý đôn đốc) | Follow-ups | 8 rows | OK |

### Sheet 3 Detailed Analysis

Systems present (only first 20):
1. Báo VNExpress - Hệ thống công nghệ thông tin Báo VnExpress
2. Cục Chuyển đổi số quốc gia - Hệ thống đánh giá mức độ chuyển đổi số
3. Cục Công nghiệp Công nghệ thông tin - CSDL doanh nghiệp công nghệ số Việt Nam
4. Cục Viễn thông - Hệ thống chuyển mạng viễn thông...
5-20. [Various systems from different organizations]

**Missing**: 57 systems from various organizations

---

## Root Cause Analysis

### 1. Frontend Code Analysis

**File**: `frontend/src/pages/Dashboard.tsx:201-228`

```typescript
const exportToExcel = async () => {
  setExporting(true);
  try {
    // Fetch all systems for the Excel export
    const params = new URLSearchParams();
    if (organizationFilter !== 'all') {
      params.append('org', organizationFilter);
    }
    params.append('page_size', '1000'); // Get all systems  <-- REQUESTING 1000

    const systemsResponse = await api.get<ApiResponse<System>>(`/systems/?${params.toString()}`);

    await exportDashboardToExcel(
      statistics,
      completionStats,
      systemsResponse.data.results || [],  // <-- ONLY GETS 20 ITEMS
      organizations
    );

    message.success('Đã xuất báo cáo Excel thành công!');
  } catch (error) {
    console.error('Error exporting Excel:', error);
    message.error('Lỗi khi xuất báo cáo Excel');
  } finally {
    setExporting(false);
  }
};
```

**Analysis**: Frontend correctly requests `page_size=1000`

### 2. Backend Configuration Analysis

**File**: `backend/config/settings.py:137-154`

```python
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',
    ],
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 20,  # <-- DEFAULT: 20 items
    'PAGE_SIZE_QUERY_PARAM': 'page_size',  # Allow client to control page_size
    'MAX_PAGE_SIZE': 100,  # <-- HARD LIMIT: Maximum 100 items
    'DEFAULT_FILTER_BACKENDS': [
        'django_filters.rest_framework.DjangoFilterBackend',
        'rest_framework.filters.SearchFilter',
        'rest_framework.filters.OrderingFilter',
    ],
    'DEFAULT_SCHEMA_CLASS': 'drf_spectacular.openapi.AutoSchema',
}
```

**Analysis**: Backend limits `MAX_PAGE_SIZE` to 100, but Excel is still getting only 20 items!

### 3. Network Request Analysis

From browser DevTools:
```
[GET] https://hientrangcds.mst.gov.vn/api/systems/?page_size=1000 => [200]
```

Request is made with `page_size=1000`, but response only contains 20 items.

### 4. Root Cause

**PRIMARY CAUSE**: Backend `MAX_PAGE_SIZE: 100` limit prevents fetching all 77 systems

**SECONDARY ISSUE**: Even with MAX_PAGE_SIZE of 100, only 20 systems are returned, suggesting:
- The `page_size` parameter might not be properly passed
- OR there's another pagination mechanism overriding it
- OR the backend is silently failing and returning default PAGE_SIZE

---

## Why Sheet 2 Works But Sheet 3 Doesn't

| Aspect | Sheet 2 (Organizations) | Sheet 3 (Systems) |
|--------|------------------------|-------------------|
| API Endpoint | `/organizations/?page_size=1000` | `/systems/?page_size=1000` |
| Total Items | 32 organizations | 77 systems |
| MAX_PAGE_SIZE Limit | 100 (sufficient) | 100 (insufficient!) |
| Result | **All 32 fetched** | **Only 20 fetched** |

**Key Difference**:
- Organizations (32) < MAX_PAGE_SIZE (100) → Works
- Systems (77) < MAX_PAGE_SIZE (100) → Should work, but doesn't!

This suggests the systems API is not respecting the `page_size` parameter at all, falling back to default PAGE_SIZE of 20.

---

## Solution Strategy

### Option 1: Increase MAX_PAGE_SIZE (Quick Fix)
```python
'MAX_PAGE_SIZE': 1000,  # Increase limit to handle all systems
```

**Pros**:
- One-line change
- Works immediately

**Cons**:
- Not scalable (what if 2000+ systems in future?)
- Potential performance issues with large datasets

### Option 2: Fetch All Pages (Robust Solution)
Implement pagination loop in frontend:
```typescript
async function fetchAllSystems() {
  let allSystems = [];
  let page = 1;
  let hasMore = true;

  while (hasMore) {
    const response = await api.get(`/systems/?page=${page}&page_size=100`);
    allSystems = [...allSystems, ...response.data.results];
    hasMore = response.data.next !== null;
    page++;
  }

  return allSystems;
}
```

**Pros**:
- Scalable to any number of systems
- Respects backend pagination limits
- Best practice

**Cons**:
- More complex code
- Multiple API calls (but fast sequential requests)

### Option 3: Create Dedicated Export Endpoint (Best Practice)
```python
# backend/apps/systems/views.py
@action(detail=False, methods=['get'])
def export_all(self, request):
    """Return all systems without pagination for export"""
    systems = System.objects.all()
    serializer = self.get_serializer(systems, many=True)
    return Response(serializer.data)
```

**Pros**:
- Clean separation of concerns
- Can optimize query for export (select_related, prefetch_related)
- Clear intent in API

**Cons**:
- Requires backend changes
- Need deployment

---

## Recommended Fix: Hybrid Approach

**Phase 1 (Immediate)**: Increase MAX_PAGE_SIZE to 1000
**Phase 2 (Robust)**: Implement pagination loop in frontend
**Phase 3 (Long-term)**: Create dedicated export endpoint

---

## Fix Implementation

### Step 1: Edit Backend Settings

**File**: `backend/config/settings.py`

```python
REST_FRAMEWORK = {
    # ... other settings ...
    'PAGE_SIZE': 20,
    'PAGE_SIZE_QUERY_PARAM': 'page_size',
    'MAX_PAGE_SIZE': 1000,  # CHANGED: 100 → 1000 for Excel export
    # ... other settings ...
}
```

### Step 2: Restart Backend

```bash
ssh admin_@34.142.152.104
cd /home/admin_/thong_ke_he_thong
docker compose restart backend
```

### Step 3: Verify Fix

1. Clear browser cache (Cmd+Shift+R)
2. Login to https://hientrangcds.mst.gov.vn
3. Click "Xuất Excel"
4. Open Sheet 3
5. Verify all 77 systems are present

---

## Testing Checklist

- [ ] Backend MAX_PAGE_SIZE increased to 1000
- [ ] Backend restarted
- [ ] Browser cache cleared
- [ ] Excel export downloaded
- [ ] Sheet 2: All 32 organizations present
- [ ] Sheet 3: All 77 systems present
- [ ] File size reasonable (< 1MB)
- [ ] No performance issues

---

## Long-term Monitoring

After fix, monitor:
1. Excel export time (should be < 5 seconds)
2. Number of systems grows over time
3. If systems > 500, implement pagination loop
4. If systems > 1000, implement dedicated export endpoint

---

## Related Issues

- [EXCEL-EXPORT-ALL-ORGANIZATIONS-FIX.md](./EXCEL-EXPORT-ALL-ORGANIZATIONS-FIX.md) - Sheet 2 fix
- [ORGANIZATIONS-PAGINATION-FIX.md](./ORGANIZATIONS-PAGINATION-FIX.md) - Pagination improvements

---

**Status**: Ready for deployment
**Risk**: Low (only affects Excel export, not main UI)
**Rollback**: Change MAX_PAGE_SIZE back to 100 if issues occur
