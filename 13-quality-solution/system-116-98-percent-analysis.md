# System 116 - 98% Completion Analysis

**Date:** 2026-01-26
**System:** 116
**Issue:** Completion percentage shows 98% instead of 100%
**Status:** 🔍 Investigating

---

## 1. Root Cause Analysis

### Current Completion Rate Calculation

**Backend calculates completion based on:**
- 72 base required fields in `REQUIRED_FIELDS_MAP`
- 6 conditional fields in `CONDITIONAL_FIELDS_MAP`
- Total: 72-78 fields depending on conditions

**98% completion means:**
- 71 out of 72 fields filled
- **Exactly 1-2 fields missing**

### Frontend vs Backend Mismatch

**Issue Found:**
```typescript
// Frontend: systemValidationRules.ts line 232
// users_total, users_mau, users_dau: Removed - not required (null=True, blank=True in database)
```

```python
# Backend: utils.py line 18
'tab8': [..., 'users_mau', 'users_dau'],  # ❌ Still marked as required!
```

**The Mismatch:**
- Frontend says `users_mau`, `users_dau` are **optional**
- Backend still counts them as **required** for completion
- User may not have filled these fields (because frontend says optional)
- Result: 98% completion

### Most Likely Missing Fields (1-2 fields)

**Based on previous analysis and common patterns:**

| Field | Tab | Why Missing? |
|-------|-----|--------------|
| `go_live_date` | 1 | Date field, often left blank |
| `current_version` | 1 | Version field, often empty |
| `users_mau` | 8 | Optional in frontend, required in backend |
| `users_dau` | 8 | Optional in frontend, required in backend |
| `data_types` | 4 | Array field in data_info model |
| `blockers` | 9 | Array field, often "Không có" |

---

## 2. Proposed Solutions

### Option A: Fill Missing Data in Production (Quick Fix)

**Approach:** Update system 116 data in production to fill missing fields

**Steps:**
```bash
# 1. SSH to production server
ssh user@production-server

# 2. Run debug script to identify exact missing fields
docker compose exec backend python debug_system_116.py

# 3. Use Django shell to update missing fields
docker compose exec backend python manage.py shell

# Example update commands:
from apps.systems.models import System
s = System.objects.get(id=116)
s.go_live_date = "2020-01-01"  # Or appropriate date
s.current_version = "1.0"
s.save()

# For related model fields:
if s.operations:
    s.operations.users_mau = 0  # Or appropriate value
    s.operations.users_dau = 0
    s.operations.save()
```

**Pros:**
- Quick fix
- No code changes needed
- Data becomes complete

**Cons:**
- Requires access to production server
- May not have correct data values
- Doesn't fix root cause (code mismatch)

---

### Option B: Fix Code Mismatch (Recommended)

**Approach:** Align frontend and backend validation rules

#### B1. Remove users_mau/users_dau from Backend Required Fields

**File:** `backend/apps/systems/utils.py`

**Change:**
```python
# Before
REQUIRED_FIELDS_MAP: Dict[str, List[str]] = {
    # ...
    'tab8': ['business_owner', 'technical_owner', 'responsible_phone', 'responsible_email', 'support_level', 'users_mau', 'users_dau'],
    # ...
}

# After
REQUIRED_FIELDS_MAP: Dict[str, List[str]] = {
    # ...
    'tab8': ['business_owner', 'technical_owner', 'responsible_phone', 'responsible_email', 'support_level'],
    # ...
}
```

**Impact:**
- Reduces total required fields from 72 to 70
- Systems with only `users_mau`/`users_dau` missing will now show 100%
- Matches frontend validation (which says these fields are optional)

#### B2. Review Other Potential Mismatches

**Check these fields too:**
- `go_live_date` - Is this really required?
- `current_version` - Is this really required?
- `data_types` - Is array validation working correctly?
- `blockers` - Should this accept "Không có" as valid?

---

### Option C: Add Default Values (Alternative)

**Approach:** Set default values for commonly empty fields

**File:** `backend/apps/systems/models.py`

**Example:**
```python
class System(models.Model):
    go_live_date = models.DateField(default=None, null=True, blank=True)
    current_version = models.CharField(max_length=50, default='1.0', blank=True)
```

**For related models:**
```python
class SystemOperations(models.Model):
    users_mau = models.IntegerField(default=0, null=True, blank=True)
    users_dau = models.IntegerField(default=0, null=True, blank=True)
```

**Impact:**
- New systems will have default values
- Existing systems still need update

---

## 3. Recommended Action Plan

### Step 1: Verify Exact Missing Fields (Priority)

Run debug script on production:
```bash
# Copy debug_system_116.py to server and run:
docker compose exec backend python debug_system_116.py 116
```

This will show exactly which fields are missing.

### Step 2: Choose Solution Path

**If data is truly missing (user hasn't filled it):**
→ Use Option A (fill data)

**If code mismatch is the issue:**
→ Use Option B (fix code)

### Step 3: Implement Fix

**For Option B (Recommended):**

1. Update `backend/apps/systems/utils.py`
2. Test locally
3. Deploy to production
4. Verify system 116 shows 100%

---

## 4. Code Changes Required (Option B)

### File: backend/apps/systems/utils.py

```python
# Line 18 - Remove users_mau, users_dau from required fields
REQUIRED_FIELDS_MAP: Dict[str, List[str]] = {
    'tab1': ['org', 'system_name', 'system_name_en', 'purpose', 'status', 'criticality_level', 'scope', 'system_group'],
    'tab2': ['business_objectives', 'business_processes', 'user_types', 'annual_users'],
    'tab3': ['programming_language', 'framework', 'database_name', 'hosting_platform', 'architecture_type', 'backend_tech', 'frontend_tech', 'mobile_app'],
    'tab4': ['data_sources', 'data_types', 'data_classification_type', 'data_volume', 'storage_size_gb', 'file_storage_size_gb', 'growth_rate_percent', 'file_storage_type', 'record_count', 'secondary_databases'],
    'tab5': ['data_exchange_method', 'api_provided_count'],
    'tab6': ['authentication_method', 'has_encryption', 'has_audit_log', 'security_level'],
    'tab7': ['server_configuration', 'backup_plan', 'storage_capacity', 'disaster_recovery_plan'],
    'tab8': ['business_owner', 'technical_owner', 'responsible_phone', 'responsible_email', 'support_level'],  # ✅ Removed users_mau, users_dau
    'tab9': ['integration_readiness', 'blockers'],
}
```

**Total required fields changes from 72 to 70**

---

## 5. Deployment Steps (Option B)

```bash
# 1. Update code
cd backend
vim apps/systems/utils.py

# 2. Test locally
python manage.py shell
from apps.systems.utils import calculate_system_completion_percentage
# Test with sample data

# 3. Commit
git add apps/systems/utils.py
git commit -m "fix(completion): Remove users_mau/users_dau from required fields

These fields are marked as optional in frontend validation but were
still counted as required in backend completion calculation.

This fixes the issue where systems show 98% completion despite
having all visible required fields filled."

# 4. Deploy
git push
# On server: git pull && docker compose restart backend
```

---

## 6. Verification Steps

After deployment:

```bash
# Check system 116 completion
docker compose exec backend python manage.py shell -c "
from apps.systems.models import System
from apps.systems.utils import calculate_system_completion_percentage
s = System.objects.get(id=116)
print(f'Completion: {calculate_system_completion_percentage(s)}%')
"

# Expected output: 100.0%
```

---

## 7. Questions for User Review

1. **Should `users_mau` and `users_dau` be required or optional?**
   - If optional: Proceed with Option B
   - If required: Need to fill data (Option A)

2. **Should `go_live_date` be required?**
   - Many systems may not have this data

3. **Should `current_version` be required?**
   - Can default to "1.0" if not set

4. **Are there other fields showing similar mismatches?**
   - Need to audit all REQUIRED_FIELDS_MAP vs frontend validation

---

**Next Step:** Please review and confirm which solution to proceed with.
