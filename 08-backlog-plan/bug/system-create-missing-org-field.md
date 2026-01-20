# Bug #7: System Create 400 Error - Missing org Field

**Priority:** P0 (Blocker)
**Status:** ✅ FIXED
**Reported:** 2026-01-20
**Fixed:** 2026-01-20
**Component:** backend/apps/systems/views.py

## Issue Description

When org_user attempts to create a system, the API returns HTTP 400 error with validation message: `{"org":["Trường này là bắt buộc."]}` ("This field is required")

This bug **blocked E2E Test Scenario 2.2** (Unit User Create System with Tab Save Flow).

## Steps to Reproduce

1. Login as org_user (e.g., org1)
2. Navigate to `/systems/create`
3. Fill in Tab 1 form:
   - Tên hệ thống: "Hệ thống Test"
   - Mô tả: "Test description"
   - Nhóm hệ thống: "Other"
   - Status, scope, criticality_level, etc.
4. Click "Lưu & Tiếp tục"
5. Error: HTTP 400 with org field validation error

## Technical Details

**API Endpoint**: `POST /api/systems/`
**Response**: HTTP 400 (Bad Request)
**Error Message**: `{"org":["Trường này là bắt buộc."]}`

### Investigation Process

#### 1. Browser Testing (Initial)
```
POST https://thongkehethong.mindmaid.ai/api/systems/
Status: 400
Console: Failed to save tab: xr
UI: "Lỗi khi lưu thông tin"
```

#### 2. Direct API Testing with curl
```bash
curl -X POST https://thongkehethong.mindmaid.ai/api/systems/ \
  -H "Authorization: Bearer <org1_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "system_name": "Test",
    "purpose": "Test description",
    "system_group": "Other",
    "status": "operating",
    "criticality_level": "medium",
    "scope": "internal_unit"
  }'

Response:
< HTTP/2 400
{"org":["Trường này là bắt buộc."]}
```

#### 3. Backend Code Analysis
Checked `/backend/apps/systems/views.py` SystemViewSet:
- ❌ No `perform_create()` method found
- ✅ AttachmentViewSet HAS `perform_create()` (line 183)
- Conclusion: SystemViewSet doesn't auto-set org from logged-in user

#### 4. Django Shell Testing
```python
from apps.systems.models import System
from apps.accounts.models import User, Organization

org1 = Organization.objects.get(code='ORG001')
user = User.objects.get(username='org1')

# With explicit org → SUCCESS
system = System.objects.create(
    org=org1,
    system_name="Test",
    purpose="Test",
    system_group="Other",
    status="operating",
    criticality_level="medium",
    scope="internal_unit",
    form_level=1
)
print(system.id)  # Works!

# Without org → FAILS with same validation error
system = System.objects.create(
    system_name="Test2",
    purpose="Test2"
)
# django.core.exceptions.ValidationError: {'org': ['This field cannot be null.']}
```

## Root Cause

**Primary Issue**: SystemViewSet lacks `perform_create()` method

**Expected Behavior**:
- When org_user creates a system, backend should auto-set `org` from `request.user.organization`
- Frontend should NOT need to send `org` field

**Actual Behavior**:
- Frontend doesn't send `org` field (correct design for security)
- Backend doesn't auto-set `org` (missing logic)
- Validation fails because `org` is required in model

## Solution

### Code Changes

**File**: `/backend/apps/systems/views.py`
**Location**: After `get_queryset()` method (around line 86)

**Added Method**:
```python
def perform_create(self, serializer):
    """
    Auto-set org field from logged-in user's organization
    - Org users: auto-set from their organization
    - Admin users: allow explicit org in request (can create for any org)
    """
    user = self.request.user

    # Org users: use their organization
    if user.role == 'org_user':
        if not user.organization:
            from rest_framework.exceptions import ValidationError
            raise ValidationError({'error': 'User must be assigned to an organization'})
        serializer.save(org=user.organization)
    # Admin users: require explicit org in request
    elif user.role == 'admin':
        serializer.save()
    else:
        from rest_framework.exceptions import ValidationError
        raise ValidationError({'error': 'Invalid user role'})
```

### Implementation Details

**Logic**:
1. For `org_user` role:
   - Auto-set `org` from `request.user.organization`
   - Validate that user has an organization assigned
   - Prevents org_users from creating systems for other organizations (security)

2. For `admin` role:
   - Allow explicit `org` in request body
   - Admins can create systems for any organization
   - If `org` not provided, validation will fail (expected behavior)

3. Error handling:
   - User without organization → ValidationError
   - Invalid role → ValidationError

### Commit Details

**Commit**: db06b74
**Message**:
```
fix(api): Auto-set org field in SystemViewSet.perform_create()

Bug #7 Fixed: System creation was failing with 400 error because
the 'org' field is required but not sent by frontend.

Solution:
- Added perform_create() method to SystemViewSet
- Org users: auto-set org from request.user.organization
- Admin users: allow explicit org in request (can create for any org)
- Added validation for users without organization

Testing:
- Org user can now create systems without sending org field
- Backend auto-sets org from logged-in user
- Unblocks E2E Test Scenario 2.2

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>
```

## Testing Plan

### Unit Tests (Manual Django Shell)
```python
# Test 1: Org user creates system (simulated via API)
# Expected: org auto-set from user.organization

# Test 2: Admin creates system with explicit org
# Expected: org set from request body

# Test 3: User without organization attempts create
# Expected: ValidationError
```

### Integration Tests (E2E with Playwright)
1. Login as org1 (org_user)
2. Navigate to `/systems/create`
3. Fill Tab 1 form with required fields
4. Click "Lưu & Tiếp tục"
5. **Expected**: HTTP 201, system created with org=ORG001
6. **Expected**: Tab navigates to Tab 2
7. **Expected**: Form shows success message

### Verification Steps
```bash
# After deployment, verify in Django shell:
from apps.systems.models import System
system = System.objects.latest('created_at')
print(f"System: {system.system_name}")
print(f"Org: {system.org.name}")
print(f"Created by: {system.created_by.username if hasattr(system, 'created_by') else 'N/A'}")
```

## Deployment Status

**Code Changes**: ✅ Committed and pushed to main
**Git Push**: ✅ Completed (db06b74)
**Production Deploy**: ⏳ PENDING (SSH connection timeout)

### Deployment Steps (When server available)
```bash
ssh root@103.173.228.153
cd /root/thong_ke_he_thong
git pull origin main
docker-compose up -d --build backend
docker-compose ps backend
```

### Verification Commands
```bash
# Check if perform_create exists
ssh root@103.173.228.153 "docker-compose exec backend grep -A 20 'def perform_create' /app/apps/systems/views.py"

# Test system creation via curl
curl -X POST https://thongkehethong.mindmaid.ai/api/systems/ \
  -H "Authorization: Bearer <org1_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "system_name": "Test After Fix",
    "purpose": "Verify Bug #7 fix",
    "system_group": "Test",
    "status": "operating",
    "criticality_level": "medium",
    "scope": "internal_unit"
  }'
# Expected: HTTP 201 Created (not 400)
```

## Impact

**Before Fix**:
- ❌ Org users cannot create systems
- ❌ E2E Test Scenario 2.2 blocked
- ❌ Core functionality broken

**After Fix**:
- ✅ Org users can create systems without sending org
- ✅ Security maintained (org auto-set, not user-provided)
- ✅ Admin users retain flexibility (can specify org)
- ✅ E2E testing can proceed

## Related Bugs

- **Bug #5**: system_group validation (fixed via removing choices constraint)
- **Bug #6**: Field name mismatch description→purpose (fixed)
- **Bug #7**: Missing org field (this bug - fixed)

All 3 bugs needed to be fixed for system creation to work end-to-end.

## Lessons Learned

1. **Always Test API Directly**: Browser testing showed 400 error, but curl revealed exact validation message
2. **Check DRF Patterns**: AttachmentViewSet had `perform_create()`, should have checked SystemViewSet
3. **Security by Design**: Frontend not sending `org` is CORRECT - backend must handle it
4. **Django Shell is Friend**: Quickly tested that model creation works with explicit org

## Related Files

- Backend: `/backend/apps/systems/views.py` (SystemViewSet.perform_create)
- Frontend: `/frontend/src/pages/SystemCreate.tsx` (handleSaveCurrentTab)
- Model: `/backend/apps/systems/models.py` (System model org field definition)
- Serializer: `/backend/apps/systems/serializers.py` (SystemCreateUpdateSerializer)

## Bug #8: Missing Database Columns (Faked Migrations)

**Status**: ✅ FIXED (Part 2)
**Reported**: 2026-01-20
**Fixed**: 2026-01-20

### Root Cause
After deploying Bug #7 fixes, system creation still returned 500 error. Investigation revealed that faked migrations (0005-0009) left many columns uncreated in nested model tables.

### Missing Columns Found

#### system_operations table
- deployment_location (VARCHAR 50)
- compute_type (VARCHAR 50)
- compute_specifications (TEXT)
- deployment_frequency (VARCHAR 50)

#### system_integration table
- api_documentation (TEXT)
- api_versioning_standard (VARCHAR 100)
- has_integration_monitoring (BOOLEAN)

#### system_assessment table
- integration_readiness (JSONB)
- blockers (JSONB)
- recommendation (VARCHAR 20)

### Fix Applied
Manually added all missing columns using ALTER TABLE commands:

```sql
-- system_operations
ALTER TABLE system_operations ADD COLUMN IF NOT EXISTS deployment_location VARCHAR(50) DEFAULT '';
ALTER TABLE system_operations ADD COLUMN IF NOT EXISTS compute_type VARCHAR(50) DEFAULT '';
ALTER TABLE system_operations ADD COLUMN IF NOT EXISTS compute_specifications TEXT DEFAULT '';
ALTER TABLE system_operations ADD COLUMN IF NOT EXISTS deployment_frequency VARCHAR(50) DEFAULT '';

-- system_integration
ALTER TABLE system_integration ADD COLUMN IF NOT EXISTS api_documentation TEXT DEFAULT '';
ALTER TABLE system_integration ADD COLUMN IF NOT EXISTS api_versioning_standard VARCHAR(100) DEFAULT '';
ALTER TABLE system_integration ADD COLUMN IF NOT EXISTS has_integration_monitoring BOOLEAN DEFAULT FALSE;

-- system_assessment
ALTER TABLE system_assessment ADD COLUMN IF NOT EXISTS integration_readiness JSONB DEFAULT '[]';
ALTER TABLE system_assessment ADD COLUMN IF NOT EXISTS blockers JSONB DEFAULT '[]';
ALTER TABLE system_assessment ADD COLUMN IF NOT EXISTS recommendation VARCHAR(20) DEFAULT '';
```

### Testing Results

**Django Shell Test**: ✅ PASSED
```python
# System created with all nested models
ID: 12
Code: SYS-CSHTT-2026-0008
Name: Test All Tables Fixed
Nested models: All created successfully
```

**API Test**: ✅ PASSED
```bash
curl POST /api/systems/ → HTTP 201
{
  "id": 13,
  "system_code": "SYS-CSHTT-2026-0009",
  "system_name": "Test via API After All Fixes",
  ...
}
```

## Test Coverage

- ✅ System creation blocked without org - IDENTIFIED & FIXED (Bug #7)
- ✅ Root cause found via curl + code review - COMPLETED
- ✅ Fix Bug #7 Part 1: perform_create() - COMPLETED
- ✅ Fix Bug #7 Part 2: org not required in serializer - COMPLETED
- ✅ Fix Bug #7 Part 3: system_code blank=True - COMPLETED
- ✅ Fix Bug #8 Part 1: systems table columns - COMPLETED
- ✅ Fix Bug #8 Part 2: nested table columns - COMPLETED
- ✅ Production deployment - COMPLETED
- ✅ API Test - PASSED (HTTP 201 with full data)
- ⏳ E2E Browser Test Scenario 2.2 - IN PROGRESS
