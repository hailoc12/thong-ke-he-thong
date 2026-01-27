# Pagination Fix - Excel Export Now Shows All Data

**Date:** 2026-01-26
**Status:** ✅ FIXED AND VERIFIED
**Impact:** HIGH - Excel export now includes all systems

---

## Problem Summary

User reported that Excel export only showed 20 systems instead of all 77 systems in the database.

## Root Cause Analysis

### Investigation Steps

1. **Frontend Code Review:**
   - ✅ Frontend correctly requests `page_size=1000` in API calls
   - ✅ Excel export function passes correct parameters

2. **Backend Configuration Review:**
   - ✅ settings.py has `MAX_PAGE_SIZE: 1000`
   - ❌ But Django REST Framework's `PageNumberPagination` doesn't automatically use global settings

3. **API Testing:**
   - Network logs showed `?page_size=1000` in requests
   - But API only returned 20 items (default PAGE_SIZE)

### Root Cause

Django REST Framework's `PageNumberPagination` class does NOT automatically pick up `PAGE_SIZE_QUERY_PARAM` and `MAX_PAGE_SIZE` from the global `REST_FRAMEWORK` settings dictionary. These attributes must be explicitly set on a custom pagination class.

## Solution Implemented

### 1. Created Custom Pagination Class

**File:** `backend/config/pagination.py`

```python
from rest_framework.pagination import PageNumberPagination

class CustomPageNumberPagination(PageNumberPagination):
    """
    Custom pagination that allows client to control page size.
    - Default: 20 items per page
    - Client can request up to 1000 items via ?page_size=1000
    """
    page_size = 20
    page_size_query_param = 'page_size'
    max_page_size = 1000
```

### 2. Updated Settings to Use Custom Pagination

**File:** `backend/config/settings.py`

Changed:
```python
'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
```

To:
```python
'DEFAULT_PAGINATION_CLASS': 'config.pagination.CustomPageNumberPagination',
```

## Verification Results

### Before Fix:
- Sheet 3 "Danh sách HT": **20 systems** ❌
- Missing: 57 systems (74% of data)

### After Fix:
- Sheet 3 "Danh sách HT": **77 systems** ✅
- All data included

### Detailed Sheet Analysis:

| Sheet | Expected Rows | Actual Rows | Status |
|-------|---------------|-------------|--------|
| 1. Tổng quan | 17 | 17 | ✅ |
| 2. Theo đơn vị | ~50 | 51 | ✅ |
| 3. Danh sách HT | **77** | **77** | ✅ |
| 4. Lưu ý đôn đốc | ~13 | 13 | ✅ |

## Deployment Steps

1. Created `backend/config/pagination.py`
2. Updated `backend/config/settings.py`
3. Deployed to production server
4. Restarted backend container
5. Verified with browser test
6. Downloaded and analyzed Excel file

## Files Changed

- `backend/config/pagination.py` (new file)
- `backend/config/settings.py` (modified)
- `deploy-pagination-fix.sh` (deployment script)

## Testing Evidence

**Production URL:** https://hientrangcds.mst.gov.vn

**Test Performed:**
1. Logged in as admin
2. Clicked "Xuất Excel" button
3. Downloaded file: `Bao-cao-CDS-26-01-2026.xlsx`
4. Analyzed with Python/openpyxl
5. Confirmed: **77 systems in Sheet 3** ✅

**Success Message:** "Đã xuất báo cáo Excel thành công!"

## Impact

- ✅ All 77 systems now included in Excel export
- ✅ Organizations without systems now shown in Sheet 2
- ✅ Complete data for reporting and analysis
- ✅ No changes needed to frontend code
- ✅ Backward compatible (default page_size still 20)

## Lessons Learned

1. **Django REST Framework Global Settings Gotcha:**
   - Not all pagination settings in `REST_FRAMEWORK` dict are automatically used
   - `PageNumberPagination` requires explicit class attributes

2. **Testing API Directly:**
   - Always test both frontend requests AND backend responses
   - Network inspector shows request params but not actual returned data count

3. **Verification is Critical:**
   - Don't assume configuration changes work without testing
   - Download and analyze actual output files

## References

- **Django REST Framework Pagination Docs:**
  https://www.django-rest-framework.org/api-guide/pagination/

- **Commit:** See git log for "fix(api): Fix pagination to respect page_size parameter"

---

**Deployed By:** Claude Sonnet 4.5
**Verified By:** Live production test
**Sign-off:** ✅ WORKING AS EXPECTED
