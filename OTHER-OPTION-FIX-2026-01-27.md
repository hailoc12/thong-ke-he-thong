# Bug Fix: "Other" Option Validation Error

**Date:** 2026-01-27
**Issue:** Fields `hosting_platform` and `database_model` reject "Other" option with validation error
**Status:** ✅ FIXED

---

## Problem Description

When users select "Other" (Khác) option in the following fields, the backend returns validation error:
- `hosting_platform` - "other is not valid choice"
- `database_model` (in architecture_data) - "other is not valid choice"

### Root Cause
Model field choices were missing the 'other' option:
1. **System.hosting_platform** - Only had: `cloud`, `on_premise`, `hybrid`
2. **SystemArchitecture.database_model** - Only had: `centralized`, `distributed`, `per_app`

---

## Solution

### Changes Made

#### 1. Model Changes (backend/apps/systems/models.py)

**hosting_platform field:**
```python
# BEFORE
hosting_platform = models.CharField(
    choices=[
        ('cloud', 'Cloud'),
        ('on_premise', 'On-premise'),
        ('hybrid', 'Hybrid'),
    ],
    ...
)

# AFTER
hosting_platform = models.CharField(
    choices=[
        ('cloud', 'Cloud'),
        ('on_premise', 'On-premise'),
        ('hybrid', 'Hybrid'),
        ('other', 'Khác'),  # ✅ ADDED
    ],
    ...
)
```

**database_model field:**
```python
# BEFORE
DATABASE_MODEL_CHOICES = [
    ('centralized', 'Tập trung'),
    ('distributed', 'Phân tán'),
    ('per_app', 'Riêng từng app'),
]

# AFTER
DATABASE_MODEL_CHOICES = [
    ('centralized', 'Tập trung'),
    ('distributed', 'Phân tán'),
    ('per_app', 'Riêng từng app'),
    ('other', 'Khác'),  # ✅ ADDED
]
```

#### 2. Migration
Created: `backend/apps/systems/migrations/0023_add_other_option_to_choices.py`

---

## Deployment

### Step 1: Deploy the Fix
```bash
./deploy-other-option-fix.sh
```

This script will:
1. Stop backend container
2. Rebuild backend (no cache)
3. Start backend (migrations run automatically)
4. Verify backend health

### Step 2: Verify the Fix
```bash
python3 live_test_other_option.py
```

This script will:
1. Test creating system with `hosting_platform = 'other'`
2. Test creating system with `database_model = 'other'`
3. Test updating existing system with 'other' options
4. Clean up test data

---

## Test Results

### Expected Behavior
✅ System can be created with `hosting_platform = 'other'`
✅ System can be created with `database_model = 'other'`
✅ System can be updated with these 'other' options
✅ No validation errors

### Test Cases

**Test 1: Create with hosting_platform = 'other'**
```bash
POST /api/systems/
{
    "hosting_platform": "other",
    ...
}
# Expected: 201 Created
```

**Test 2: Create with database_model = 'other'**
```bash
POST /api/systems/
{
    "architecture_data": {
        "database_model": "other"
    },
    ...
}
# Expected: 201 Created
```

**Test 3: Update with 'other' options**
```bash
PATCH /api/systems/{id}/
{
    "hosting_platform": "other",
    "architecture_data": {
        "database_model": "other"
    }
}
# Expected: 200 OK
```

---

## Files Modified

1. `backend/apps/systems/models.py` - Added 'other' to choices
2. `backend/apps/systems/migrations/0023_add_other_option_to_choices.py` - Migration file
3. `deploy-other-option-fix.sh` - Deployment script
4. `live_test_other_option.py` - Live test script

---

## Verification Checklist

After deployment, verify:
- [ ] Backend starts without errors
- [ ] Migration 0023 applied successfully
- [ ] Can create system with `hosting_platform = 'other'`
- [ ] Can create system with `database_model = 'other'`
- [ ] Can update existing systems with 'other' options
- [ ] No validation errors on frontend
- [ ] All live tests pass

---

## Rollback Plan (If Needed)

If issues occur:
```bash
# 1. Revert migration
docker compose exec backend python manage.py migrate systems 0022_cicd_tool_remove_choices

# 2. Restore old models.py from git
git checkout HEAD~1 backend/apps/systems/models.py

# 3. Rebuild and restart
docker compose stop backend
docker compose rm -f backend
docker compose build backend --no-cache
docker compose up -d backend
```

---

## Related Fields (Already Have 'other')

These fields already support 'other' option (no fix needed):
- `system_group` (TextField, accepts any value)
- `requirement_type` (has 'other' option)
- `architecture_type` (has 'other' option)
- `api_style` (has 'other' option)
- `messaging_queue` (has 'other' option)
- `cache_system` (has 'other' option)
- `search_engine` (has 'other' option)
- `reporting_bi_tool` (has 'other' option)
- `source_repository` (has 'other' option)

---

## Notes

- This is a backwards-compatible change (only adds new valid options)
- Existing data is not affected
- Frontend already supports "Other" option in SelectWithOther component
- No frontend changes needed

---

**Fix completed:** 2026-01-27
**Tested by:** [To be filled after live test]
**Deployed to production:** [To be filled after deployment]
