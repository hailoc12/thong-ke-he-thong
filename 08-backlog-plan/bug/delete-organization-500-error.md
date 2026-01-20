# Bug: Delete Organization Returns 500 Error

**Priority:** P1
**Status:** Under Investigation
**Reported:** 2026-01-20
**Component:** backend/apps/organizations/views.py

## Issue Description

When admin attempts to delete an organization, the API returns HTTP 500 error instead of successfully deleting.

## Steps to Reproduce

1. Login as admin
2. Navigate to `/organizations`
3. Click "Xóa" (Delete) button for any organization
4. Confirm deletion in modal
5. Error: "Có lỗi xảy ra khi xóa đơn vị"

## Technical Details

**API Endpoint**: `DELETE /api/organizations/{id}/`
**Response**: HTTP 500 (Server Error)
**Error in Console**: `Failed to delete organization: xr`

## Investigation

### Fix Attempt #1: Change HTTP Status Code

**Problem Identified**:
- Backend was returning `HTTP_204_NO_CONTENT` with a message body
- HTTP 204 responses must not have a body per HTTP spec

**Fix Applied** (Commit 3167470):
```python
# Changed from:
return Response(
    {'message': f'Đã xóa đơn vị "{org_name}" thành công'},
    status=status.HTTP_204_NO_CONTENT
)

# To:
return Response(
    {'message': f'Đã xóa đơn vị "{org_name}" thành công'},
    status=status.HTTP_200_OK
)
```

**Result**: Still returns 500 error after deploying fix

### Current State

- Backend code shows correct implementation
- Frontend code correctly handles delete API
- Verification:
  ```bash
  # Backend code is correct (confirmed via SSH)
  docker-compose exec backend tail -10 /app/apps/organizations/views.py
  # Shows: status=status.HTTP_200_OK
  ```

## Possible Root Causes

1. **Database Constraint**: Foreign key constraint preventing deletion
2. **Permission Issue**: Missing admin role check bypassing safety checks
3. **Transaction Error**: Database transaction failing silently
4. **Middleware/Proxy Issue**: Cloudflare or nginx intercepting and modifying response

## Next Steps

1. Enable Django DEBUG mode temporarily to get full traceback
2. Check PostgreSQL logs for constraint violations
3. Test delete with Django shell to isolate issue
4. Review database migrations for CASCADE settings

## Workaround

Manual deletion via Django admin panel or shell:
```python
from apps.organizations.models import Organization
org = Organization.objects.get(id=4)
org.delete()
```

## Impact

- **Severity**: Medium
- **Users Affected**: Admins only
- **Functionality**: Organization management
- **Workaround Available**: Yes (Django admin or shell)

## Related Code

- Backend: `/backend/apps/organizations/views.py` lines 71-119
- Frontend: `/frontend/src/pages/Organizations.tsx` lines 82-92
- Model: `/backend/apps/organizations/models.py`

## Test Coverage

- ✅ Create Organization - PASSED
- ✅ Edit Organization - PASSED
- ❌ Delete Organization - FAILED (500 error)
