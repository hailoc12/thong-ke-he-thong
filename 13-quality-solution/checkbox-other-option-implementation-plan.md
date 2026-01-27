# Task List: Thêm option "Khác" vào Integration Readiness & Blockers

**Date:** 2026-01-26
**Status:** Pending Review
**Priority:** High

---

## Overview

Thêm option "Khác" vào 2 field checkbox trong Tab 9 (Đánh giá):
1. **Điểm phù hợp cho tích hợp** (integration_readiness)
2. **Điểm vướng mắc** (blockers)

Đồng thời fix bug: Khi chọn "Khác" và nhập text, sau khi refresh/page reload, checkbox "Khác" không được check nhưng text vẫn hiển thị, gây khó khăn khi edit/re-save.

---

## Bug Analysis

### Root Cause

**File:** `frontend/src/components/form/CheckboxGroupWithOther.tsx`

**Current Behavior:**
1. User selects "Khác" + enters custom text "Vấn đề khác"
2. Value sent to API: `['outdated_tech', 'Vấn đề khác']` (custom text trực tiếp, không có "other")
3. On refresh/edit:
   - Component sees "Vấn đề khác" as custom text (not in predefined options)
   - Shows custom input with "Vấn đề khác" ✓
   - BUT "Khác" checkbox is NOT checked ✗
   - Because `checkedValues` only contains predefined values, not "other"

**Expected Behavior:**
- When custom text exists, "Khác" checkbox should be checked automatically
- This maintains visual consistency between the custom input and the checkbox that enabled it

---

## Task List

### Phase 1: Fix Bug in CheckboxGroupWithOther Component

**File:** `frontend/src/components/form/CheckboxGroupWithOther.tsx`

**Location:** Lines 44-62 (useEffect initialization)

**Change:**
```typescript
// BEFORE (Current Code - BUGGY):
value.forEach(val => {
  if (predefinedOptionValues.includes(val)) {
    predefinedChecked.push(val);
  } else {
    // This is custom text (not a predefined option)
    customText = val;
  }
});

setCheckedValues(predefinedChecked);

// If there's custom text or "other" is checked, show custom input
if (customText || predefinedChecked.includes(otherValue)) {
  setShowCustomInput(true);
  setCustomValue(customText);
} else {
  setShowCustomInput(false);
  setCustomValue('');
}
```

```typescript
// AFTER (Fixed Code):
value.forEach(val => {
  if (predefinedOptionValues.includes(val)) {
    predefinedChecked.push(val);
  } else {
    // This is custom text (not a predefined option)
    customText = val;
    // BUG FIX: When custom text exists, ensure "other" checkbox is checked
    if (!predefinedChecked.includes(otherValue)) {
      predefinedChecked.push(otherValue);
    }
  }
});

setCheckedValues(predefinedChecked);

// If there's custom text or "other" is checked, show custom input
if (customText || predefinedChecked.includes(otherValue)) {
  setShowCustomInput(true);
  setCustomValue(customText);
} else {
  setShowCustomInput(false);
  setCustomValue('');
}
```

**Impact:**
- Fixes the bug for ALL existing CheckboxGroupWithOther usages
- No changes needed in individual form files

---

### Phase 2: Add "Khác" Option to integration_readiness

**Files:**
- `frontend/src/pages/SystemCreate.tsx`
- `frontend/src/pages/SystemEdit.tsx`

**Location:** Integration readiness options array (around line 354-359)

**Change:**
```typescript
// BEFORE:
const integrationReadinessOptions = [
  { label: 'Dễ chuẩn hóa', value: 'easy_to_standardize' },
  { label: 'Có API tốt', value: 'good_api' },
  { label: 'Dữ liệu rõ nguồn gốc', value: 'clear_data_source' },
  { label: 'Có thể tách dịch vụ', value: 'can_split_service' },
];

// AFTER:
const integrationReadinessOptions = [
  { label: 'Dễ chuẩn hóa', value: 'easy_to_standardize' },
  { label: 'Có API tốt', value: 'good_api' },
  { label: 'Dữ liệu rõ nguồn gốc', value: 'clear_data_source' },
  { label: 'Có thể tách dịch vụ', value: 'can_split_service' },
  { label: 'Khác', value: 'other' },  // NEW
];
```

---

### Phase 3: Add "Khác" Option to blockers

**Files:**
- `frontend/src/pages/SystemCreate.tsx`
- `frontend/src/pages/SystemEdit.tsx`

**Location:** Blockers options array (around line 361-367)

**Change:**
```typescript
// BEFORE:
const blockersOptions = [
  { label: 'Công nghệ quá cũ', value: 'outdated_tech' },
  { label: 'Không có tài liệu', value: 'no_documentation' },
  { label: 'Không có API', value: 'no_api' },
  { label: 'Dữ liệu không sạch', value: 'dirty_data' },
  { label: 'Phụ thuộc nhà thầu', value: 'vendor_dependency' },
];

// AFTER:
const blockersOptions = [
  { label: 'Công nghệ quá cũ', value: 'outdated_tech' },
  { label: 'Không có tài liệu', value: 'no_documentation' },
  { label: 'Không có API', value: 'no_api' },
  { label: 'Dữ liệu không sạch', value: 'dirty_data' },
  { label: 'Phụ thuộc nhà thầu', value: 'vendor_dependency' },
  { label: 'Khác', value: 'other' },  // NEW
];
```

---

## Implementation Order

1. **Phase 1** (Bug Fix) - Fix CheckboxGroupWithOther component first
2. **Phase 2** - Add "Khác" to integration_readiness
3. **Phase 3** - Add "Khác" to blockers

---

## Testing Checklist

### Bug Fix Verification
- [ ] Create new system, select "Khác" in any CheckboxGroupWithOther field
- [ ] Enter custom text
- [ ] Save system
- [ ] Edit system - verify "Khác" checkbox is CHECKED
- [ ] Verify custom text is displayed in input field
- [ ] Modify selection, save again
- [ ] Verify changes persist correctly

### Integration Readiness Testing
- [ ] Create new system
- [ ] In Tab 9, check "Khác" in "Điểm phù hợp for tích hợp"
- [ ] Enter custom text (e.g., "API documentation rất đầy đủ")
- [ ] Save system
- [ ] Edit system - verify all selections persist correctly
- [ ] Uncheck "Khác", verify custom text is cleared

### Blockers Testing
- [ ] Create new system
- [ ] In Tab 9, check "Khác" in "Điểm vướng mắc"
- [ ] Enter custom text (e.g., "Legacy code khó maintain")
- [ ] Save system
- [ ] Edit system - verify all selections persist correctly
- [ ] Uncheck "Khác", verify custom text is cleared

### Edge Cases
- [ ] Select only "Khác" (no other checkboxes) + enter text
- [ ] Select multiple predefined + "Khác" + enter text
- [ ] Select predefined options, then add "Khác"
- [ ] Clear all selections
- [ ] Re-save existing system without touching "Khác" fields

---

## Backend Changes Required?

**NO** - No backend changes needed.

**Reasoning:**
- `integration_readiness` and `blockers` are JSONField in backend
- They store array of strings directly
- Custom text is stored as-is in the array
- Example: `['easy_to_standardize', 'good_api', 'Custom text here']`

---

## Files to Modify

1. `frontend/src/components/form/CheckboxGroupWithOther.tsx` (Bug fix)
2. `frontend/src/pages/SystemCreate.tsx` (Add "Khác" options)
3. `frontend/src/pages/SystemEdit.tsx` (Add "Khác" options)

---

## Deployment Plan

1. Build frontend locally
2. Test all changes thoroughly
3. Deploy to production
4. Smoke test on production

---

## Rollback Plan

If issues arise:
1. Revert CheckboxGroupWithOther.tsx to original version
2. Revert options arrays in SystemCreate.tsx and SystemEdit.tsx
3. Rebuild and redeploy

---

## Estimated Time

| Task | Time |
|------|------|
| Fix CheckboxGroupWithOther bug | 15 min |
| Add "Khác" to integration_readiness | 5 min |
| Add "Khác" to blockers | 5 min |
| Build & test locally | 20 min |
| Deploy to production | 10 min |
| **Total** | **~55 min** |

---

## Summary of Changes

### Phase 1: Bug Fix (Critical)
Fixes the core issue where custom text displays but "Khác" checkbox is not checked on edit.

### Phase 2 & 3: Feature Addition
Adds "Khác" option to 2 fields, allowing users to specify custom integration readiness factors and blockers.

---

**Please review this task list before I proceed with implementation.**
