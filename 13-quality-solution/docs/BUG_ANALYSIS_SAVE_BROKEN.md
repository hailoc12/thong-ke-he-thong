# CRITICAL BUG ANALYSIS: Save Functionality Broken

**Date:** 2026-01-23
**Status:** ROOT CAUSE IDENTIFIED
**Severity:** P0 - Blocking all system creation/editing

---

## 1. PROBLEM SUMMARY

Users cannot save forms on production at `/systems/create`. Both draft and final save operations fail.

---

## 2. ROOT CAUSE

**Frontend-Backend Schema Mismatch**: The frontend validation rules require 5 fields that don't exist in the backend database:

1. `containerization` (array/CheckboxGroupWithOther)
2. `is_multi_tenant` (boolean/Switch)
3. `has_layered_architecture` (boolean/Switch)
4. `has_cicd` (boolean/Switch)
5. `has_automated_testing` (boolean/Switch)

### Why It Fails:

```
User fills form → Frontend validates (PASS) → Submit to backend
  → Backend receives fields in payload → Tries to save to database
  → Database ERROR: columns don't exist → Save FAILS
```

---

## 3. EVIDENCE

### 3.1 Frontend Validation Rules (REQUIRING these fields)

**File:** `/frontend/src/utils/systemValidationRules.ts`

```typescript
// Lines 100, 111-114
export const Tab3ValidationRules = {
  containerization: [createRequiredArrayRule('Vui lòng chọn ít nhất một công nghệ containerization')],  // LINE 100
  has_cicd: [createRequiredRule('Vui lòng chọn có CI/CD pipeline hay không')],  // LINE 111
  has_automated_testing: [createRequiredRule('Vui lòng chọn có automated testing hay không')],  // LINE 112
  is_multi_tenant: [createRequiredRule('Vui lòng chọn có hỗ trợ multi-tenant hay không')],  // LINE 113
  has_layered_architecture: [createRequiredRule('Vui lòng chọn có kiến trúc phân lớp hay không')],  // LINE 114
  // ... more fields
};
```

### 3.2 Backend Models (Fields COMMENTED OUT)

**File:** `/backend/apps/systems/models.py`

```python
# Lines 636-726 in SystemArchitecture model
class SystemArchitecture(models.Model):
    # ...existing fields...

    # P1 Gap Analysis: Additional Architecture Fields
    # NOTE: These fields were added without migrations, causing 500 errors. Commented out.
    # TODO: Re-add via proper migrations if needed in future

    # has_layered_architecture = models.BooleanField(
    #     default=False,
    #     verbose_name=_('Has Layered Architecture (4-tier)')
    # )

    # containerization = models.CharField(
    #     max_length=50,
    #     choices=CONTAINERIZATION_CHOICES,
    #     blank=True,
    #     verbose_name=_('Containerization')
    # )

    # has_cicd = models.BooleanField(
    #     default=False,
    #     verbose_name=_('Has CI/CD Pipeline')
    # )

    # has_automated_testing = models.BooleanField(
    #     default=False,
    #     verbose_name=_('Has Automated Testing')
    # )

    # NOTE: is_multi_tenant is NOT even in the commented code!
```

### 3.3 Migration Status

**Latest migration:** `0019_add_recommendation_other.py` (added recommendation_other field)

**Missing migrations:** No migrations exist for the 5 fields above.

---

## 4. WHEN DID THIS BREAK?

Recent changes that triggered the issue:

1. **2026-01-23**: Updated `systemValidationRules.ts` to make ALL fields required, including the 5 problematic fields
2. **Before**: These fields had conditional validation (only required if certain switches were enabled)
3. **Now**: Fields are always required, so forms always send them to backend
4. **Backend**: Cannot save because database columns don't exist

---

## 5. IMPACT

- **Users CANNOT create new systems**
- **Users CANNOT edit existing systems**
- **All form saves fail** (both draft and final)
- **Production is blocked**

---

## 6. THE FIX

### Option 1: Quick Fix - Remove Required Validation (NOT RECOMMENDED)

Remove the 5 fields from required validation in `systemValidationRules.ts`.

**Pros:** Quick, no database changes
**Cons:**
- Loses data collection for important fields
- Doesn't solve the root problem
- Fields still sent if user fills them

### Option 2: Proper Fix - Add Database Columns (RECOMMENDED)

Create migration to add the 5 fields to `SystemArchitecture` model.

**Steps:**

1. Create migration file: `0020_add_missing_architecture_fields.py`
2. Add fields to `SystemArchitecture` model:
   - `containerization` (CharField with CommaSeparatedListField in serializer)
   - `is_multi_tenant` (BooleanField, default=False)
   - `has_layered_architecture` (BooleanField, default=False)
   - `has_cicd` (BooleanField, default=False)
   - `has_automated_testing` (BooleanField, default=False)
   - Plus their related text fields (cicd_tool, automated_testing_tools, layered_architecture_details)
3. Update serializers to include new fields
4. Run migration on production
5. Test save functionality

---

## 7. RECOMMENDED ACTION PLAN

### Immediate (Next 30 minutes):

1. ✅ Create migration file `0020_add_missing_architecture_fields.py`
2. ✅ Uncomment and fix fields in `models.py` (SystemArchitecture)
3. ✅ Add `is_multi_tenant` field (new field, not in commented code)
4. ✅ Update serializers if needed
5. ✅ Test locally with `python manage.py migrate`
6. ✅ Test save functionality locally

### Deployment (Next 1 hour):

7. Commit changes with clear message: "fix: Add missing architecture fields causing save failures"
8. Deploy to production
9. SSH to production server
10. Run migration: `docker-compose exec backend python manage.py migrate`
11. Test save on production: https://hientrangcds.mst.gov.vn/systems/create
12. Verify with both draft and final save

### Verification:

13. Create test system with all Tab 3 fields filled
14. Save as draft → Should succeed
15. Complete all tabs → Save final → Should succeed
16. Check database to confirm fields are saved
17. Edit existing system → Should work

---

## 8. FILES TO MODIFY

### Backend:

1. `/backend/apps/systems/models.py`
   - SystemArchitecture: Uncomment and add fields

2. `/backend/apps/systems/migrations/0020_add_missing_architecture_fields.py`
   - New migration file

3. `/backend/apps/systems/serializers.py`
   - SystemArchitectureSerializer: Add CommaSeparatedListField for containerization

### Testing:

4. Verify frontend already handles these fields correctly (already implemented)

---

## 9. RISK ASSESSMENT

**Risk Level:** LOW

- Migration is additive only (no data loss)
- Fields are optional (blank=True, default values)
- No existing data will be affected
- Rollback is simple: just revert code and run reverse migration

---

## 10. PREVENTION

To prevent this in future:

1. **Always create migrations** when adding model fields
2. **Run migrations immediately** after creating them
3. **Test on staging** before deploying to production
4. **Sync frontend and backend** - don't add frontend validation for non-existent fields
5. **Code review** should catch model changes without migrations

---

## 11. NEXT STEPS

**Assignee:** Claude Code Agent
**ETA:** 30 minutes for fix + 30 minutes for deployment

1. Create migration file
2. Update models.py
3. Update serializers if needed
4. Test locally
5. Deploy to production
6. Verify fix
7. Close ticket

---

## 12. RELATED ISSUES

- Migration 0018 added 9 fields successfully (api_style, messaging_queue, etc.)
- These 5 fields were commented out due to previous migration issues
- Need to uncomment and properly migrate them now

---

**STATUS: Ready to implement fix**
