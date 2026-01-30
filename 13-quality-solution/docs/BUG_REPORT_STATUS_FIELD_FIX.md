# Bug Report: Status Field Validation Error

**Date**: 2026-01-23
**Severity**: CRITICAL
**Status**: ✅ FIXED
**Affected Pages**: SystemCreate, SystemEdit
**Production URL**: https://hientrangcds.mst.gov.vn

---

## Problem Description

The "Trạng thái" (status) field was showing "is not a valid choice" errors for ALL status options when creating or editing systems. This was blocking users from creating or updating any systems in production.

---

## Root Cause Analysis

### The Bug

There was a **complete mismatch** between frontend status options and backend STATUS_CHOICES:

**Backend STATUS_CHOICES** (`backend/apps/systems/models.py` lines 25-31):
```python
STATUS_CHOICES = [
    ('operating', 'Đang vận hành'),
    ('pilot', 'Thí điểm'),
    ('testing', 'Đang thử nghiệm'),
    ('stopped', 'Dừng'),
    ('replacing', 'Sắp thay thế'),
]
```

**Frontend BEFORE Fix** (SystemCreate.tsx & SystemEdit.tsx):
```tsx
<Select>
  <Select.Option value="operating">Đang vận hành</Select.Option>
  <Select.Option value="planning">Đang lập kế hoạch</Select.Option>    ❌ NOT in backend
  <Select.Option value="development">Đang phát triển</Select.Option>   ❌ NOT in backend
  <Select.Option value="testing">Đang thử nghiệm</Select.Option>
  <Select.Option value="inactive">Ngừng hoạt động</Select.Option>      ❌ Should be "stopped"
  <Select.Option value="maintenance">Bảo trì</Select.Option>            ❌ NOT in backend
</Select>
```

### Why It Failed

Django's ChoiceField validation only accepts values defined in STATUS_CHOICES. When the frontend sent:
- `planning` → Backend rejected (not in choices)
- `development` → Backend rejected (not in choices)
- `inactive` → Backend rejected (should be `stopped`)
- `maintenance` → Backend rejected (not in choices)

Only `operating` and `testing` would have worked, but even those failed because users selected other options.

### How This Happened

Looking at `SystemCreate.tsx.backup`, the correct values were there before:
```tsx
<Select.Option value="operating">Đang vận hành</Select.Option>
<Select.Option value="pilot">Thí điểm</Select.Option>
<Select.Option value="stopped">Dừng</Select.Option>
<Select.Option value="replacing">Sắp thay thế</Select.Option>
```

This indicates a **regression** - someone changed the options and introduced wrong values.

---

## The Fix

### Files Changed

1. **frontend/src/pages/SystemCreate.tsx** (line 1430-1437)
2. **frontend/src/pages/SystemEdit.tsx** (line 1470-1477)

### Changes Made

**BEFORE:**
```tsx
<Select>
  <Select.Option value="operating">Đang vận hành</Select.Option>
  <Select.Option value="planning">Đang lập kế hoạch</Select.Option>
  <Select.Option value="development">Đang phát triển</Select.Option>
  <Select.Option value="testing">Đang thử nghiệm</Select.Option>
  <Select.Option value="inactive">Ngừng hoạt động</Select.Option>
  <Select.Option value="maintenance">Bảo trì</Select.Option>
</Select>
```

**AFTER (CORRECT):**
```tsx
<Select>
  <Select.Option value="operating">Đang vận hành</Select.Option>
  <Select.Option value="pilot">Thí điểm</Select.Option>
  <Select.Option value="testing">Đang thử nghiệm</Select.Option>
  <Select.Option value="stopped">Dừng</Select.Option>
  <Select.Option value="replacing">Sắp thay thế</Select.Option>
</Select>
```

### Verification

✅ All 5 status options now match backend STATUS_CHOICES exactly:
- `operating` → Đang vận hành
- `pilot` → Thí điểm
- `testing` → Đang thử nghiệm
- `stopped` → Dừng
- `replacing` → Sắp thay thế

---

## Deployment Instructions

### Option 1: Quick Fix (Recommended)

If you have SSH access to production server:

```bash
# 1. SSH to production
ssh root@hientrangcds.mst.gov.vn

# 2. Navigate to project
cd /home/thong_ke_he_thong

# 3. Pull latest changes
git pull origin main

# 4. Rebuild frontend
cd frontend
npm run build

# 5. Copy to nginx location (if needed)
# Check your nginx config for correct path
sudo cp -r dist/* /var/www/html/thong_ke_he_thong/

# 6. Restart nginx (if needed)
sudo systemctl reload nginx

# 7. Clear browser cache
# Users should hard refresh (Ctrl+Shift+R / Cmd+Shift+R)
```

### Option 2: Manual File Copy

If you cannot SSH or run git pull:

1. **Build locally:**
   ```bash
   cd /Users/shimazu/Dropbox/9.\ active/consultant/support_b4t/thong_ke_he_thong/frontend
   npm run build
   ```

2. **Copy dist folder to production:**
   - Use FTP/SFTP client
   - Upload `frontend/dist/*` to production server
   - Overwrite existing files

3. **Verify deployment:**
   - Visit https://hientrangcds.mst.gov.vn
   - Hard refresh browser (Ctrl+Shift+R)
   - Test creating a system with each status option

---

## Testing Checklist

After deployment, verify ALL status options work:

### Create System Test
- [ ] Create system with status "Đang vận hành" (operating) → Should succeed
- [ ] Create system with status "Thí điểm" (pilot) → Should succeed
- [ ] Create system with status "Đang thử nghiệm" (testing) → Should succeed
- [ ] Create system with status "Dừng" (stopped) → Should succeed
- [ ] Create system with status "Sắp thay thế" (replacing) → Should succeed

### Edit System Test
- [ ] Edit existing system and change to each status → Should succeed
- [ ] No validation errors should appear
- [ ] Status should save correctly

### Verify No Errors
- [ ] No "is not a valid choice" errors
- [ ] No 400 Bad Request errors
- [ ] Systems save successfully

---

## Database Migration Considerations

### Existing Systems with Wrong Status

If there are existing systems in the database with the wrong status values (planning, development, inactive, maintenance), you may need to migrate them:

```sql
-- Check for systems with wrong status values
SELECT id, system_code, status
FROM systems
WHERE status NOT IN ('operating', 'pilot', 'testing', 'stopped', 'replacing');

-- Migrate wrong values to correct ones:
-- planning → operating (closest match)
UPDATE systems SET status = 'operating' WHERE status = 'planning';

-- development → pilot (closest match - under development/trial)
UPDATE systems SET status = 'pilot' WHERE status = 'development';

-- inactive → stopped (direct translation)
UPDATE systems SET status = 'stopped' WHERE status = 'inactive';

-- maintenance → operating (assuming maintenance is temporary)
UPDATE systems SET status = 'operating' WHERE status = 'maintenance';
```

**Run this ONLY if there are existing systems with wrong values.** Check first with the SELECT query.

---

## Prevention

To prevent this from happening again:

### 1. Create Shared Constants File

Create `frontend/src/constants/systemConstants.ts`:
```typescript
export const STATUS_CHOICES = [
  { value: 'operating', label: 'Đang vận hành' },
  { value: 'pilot', label: 'Thí điểm' },
  { value: 'testing', label: 'Đang thử nghiệm' },
  { value: 'stopped', label: 'Dừng' },
  { value: 'replacing', label: 'Sắp thay thế' },
] as const;
```

Then use in both files:
```tsx
import { STATUS_CHOICES } from '@/constants/systemConstants';

<Select>
  {STATUS_CHOICES.map(opt => (
    <Select.Option key={opt.value} value={opt.value}>
      {opt.label}
    </Select.Option>
  ))}
</Select>
```

### 2. Add Backend API Endpoint for Choices

Create an endpoint that returns valid choices:
```python
# backend/apps/systems/views.py
@api_view(['GET'])
def get_field_choices(request):
    return Response({
        'status': dict(System.STATUS_CHOICES),
        'scope': dict(System.SCOPE_CHOICES),
        # ... other choices
    })
```

Then fetch from frontend and validate before submit.

### 3. Add Type Safety

Use TypeScript types to ensure type safety:
```typescript
type SystemStatus = 'operating' | 'pilot' | 'testing' | 'stopped' | 'replacing';
```

---

## Summary

**Problem**: Frontend status options didn't match backend, causing ALL status validations to fail
**Cause**: Regression - someone changed the Select options to wrong values
**Impact**: Users couldn't create or edit systems in production
**Fix**: Updated SystemCreate.tsx and SystemEdit.tsx to match backend STATUS_CHOICES
**Status**: ✅ Fixed and committed to git (commit 07633ac)
**Next Step**: Deploy to production and test

---

## Commit Details

**Commit Hash**: 07633ac
**Files Changed**:
- frontend/src/pages/SystemCreate.tsx
- frontend/src/pages/SystemEdit.tsx

**Diff Summary**:
- Removed 4 wrong status options (planning, development, inactive, maintenance)
- Added 2 missing options (pilot, replacing)
- Fixed 1 wrong value (inactive → stopped)

---

**Fixed By**: Claude Sonnet 4.5
**Date**: 2026-01-23
