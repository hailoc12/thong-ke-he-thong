# Phase 1 Testing Checklist

**Date**: 2026-01-19
**Status**: Waiting for Cloudflare cache purge

## Changes Deployed

### 1. SelectWithOther Component Bug Fix (commit cb7ebba)
**File**: `/frontend/src/components/form/SelectWithOther.tsx`

**Bug**: Custom input field didn't appear when `initialValue="other"` was set

**Root Cause**: useEffect treated "other" as predefined option

**Fix**: Added explicit check for `value === otherValue` before checking predefined options

```typescript
// Added at start of useEffect (lines 32-38):
if (value === otherValue) {
  setSelectedOption(otherValue);
  setShowCustomInput(true);
  setCustomValue('');
  return;
}
```

### 2. Remove P0.8 References (commit ed69730)
**Files Modified**:
- `/frontend/src/pages/SystemCreate.tsx`
- `/frontend/src/pages/SystemEdit.tsx`
- `/frontend/src/pages/SystemDetail.tsx`
- `/frontend/src/pages/Dashboard.tsx`

**Total Changes**: 54+ instances of "P0.8" text removed

---

## Pre-Testing Requirements

⚠️ **Before testing, ensure**:
1. Cloudflare cache has been purged
2. Browser cache cleared (Ctrl+Shift+R / Cmd+Shift+R)
3. Verify new JavaScript file is loaded:
   - Open DevTools → Network tab
   - Look for `index-BDkSrweE.js` (NOT `index-DdGijo3R.js`)

---

## Test Case 1: Verify P0.8 Text Removal

### Steps:
1. Navigate to `https://thongkehethong.mindmaid.ai/systems/create`
2. Scroll through all 8 tabs
3. Verify NO "P0.8" text appears anywhere

### Expected Result:
✅ No visible "P0.8:" prefixes in any label, tooltip, or description
✅ Page footer shows: "Form mới với 8 phần" (NOT "P0.8: Form mới với 8 phần")

### Success Criteria:
- [ ] No "P0.8" text in Tab 1 (Thông tin cơ bản)
- [ ] No "P0.8" text in Tab 2 (Bối cảnh nghiệp vụ)
- [ ] No "P0.8" text in Tab 3 (Kiến trúc công nghệ)
- [ ] No "P0.8" text in Tab 4 (Kiến trúc dữ liệu)
- [ ] No "P0.8" text in Tab 5 (Tích hợp hệ thống)
- [ ] No "P0.8" text in Tab 6 (An toàn thông tin)
- [ ] No "P0.8" text in Tab 7 (Hạ tầng kỹ thuật)
- [ ] No "P0.8" text in Tab 8 (Vận hành)

---

## Test Case 2: SelectWithOther - system_group Field

### Location: Tab 1 - Thông tin cơ bản

### Steps:
1. Navigate to Create System page
2. Find "Nhóm hệ thống" field (should be a dropdown)
3. Click dropdown → Verify options appear
4. Select "Khác" option
5. **CRITICAL**: Verify custom input field appears BELOW dropdown
6. Type custom text: "Test Custom Group"
7. Scroll down to verify text was entered
8. Fill required fields (org, code, name, status, criticality)
9. Submit form
10. Navigate back to Systems list
11. Open the created system
12. Verify "Nhóm hệ thống" shows "Test Custom Group"

### Expected Result:
✅ Step 5: Custom input field MUST appear when "Khác" is selected
✅ Step 6: Can type into custom input
✅ Step 12: Custom value persisted correctly

### Success Criteria:
- [ ] Dropdown shows predefined options + "Khác"
- [ ] Selecting "Khác" shows custom input (2 elements total)
- [ ] Custom input is focused automatically
- [ ] Custom text can be entered
- [ ] Form submits successfully
- [ ] Custom value saves to database
- [ ] Edit mode shows "Khác" + custom text correctly

---

## Test Case 3: SelectWithOther - authentication_method Field

### Location: Tab 6 - An toàn thông tin

### Steps:
1. Navigate to Create System page → Tab 6
2. Find "Phương thức xác thực" field
3. Click dropdown → Select "Khác"
4. Verify custom input appears
5. Type: "Test Auth Method"
6. Complete form and submit
7. Verify saved correctly

### Expected Result:
✅ Custom input appears on selecting "Khác"
✅ Custom value saves and displays in edit mode

### Success Criteria:
- [ ] Dropdown has options: Username/Password, SSO, LDAP, OAuth, SAML, Biometric, Khác
- [ ] "Khác" option shows custom input
- [ ] Custom value persists

---

## Test Case 4: SelectWithOther - integration_method Field

### Location: Tab 5 - Tích hợp hệ thống → Integration Connection List

### Steps:
1. Navigate to Create System page → Tab 5
2. Scroll to "Danh sách tích hợp chi tiết"
3. Click "Thêm tích hợp" button
4. In the integration form, find "Phương thức tích hợp" dropdown
5. Select "Khác"
6. Verify custom input appears
7. Type: "Test Integration Method"
8. Fill other required integration fields
9. Click OK to save integration
10. Verify integration appears in list

### Expected Result:
✅ Custom input appears in nested integration form
✅ Custom integration method saved correctly

### Success Criteria:
- [ ] Integration form has "Phương thức tích hợp" field
- [ ] "Khác" option shows custom input
- [ ] Custom value appears in integration list
- [ ] Form submission includes custom integration

---

## Test Case 5: Edit Mode with Existing Custom Values

### Steps:
1. Create system with custom values in all 3 fields:
   - system_group: "Custom Group A"
   - authentication_method: "Custom Auth B"
   - integration_method: "Custom Integration C"
2. Save system
3. Navigate to Edit page for that system
4. Verify ALL 3 fields show:
   - Dropdown = "Khác"
   - Custom input = original text
5. Modify one custom value
6. Save and verify change persisted

### Expected Result:
✅ Edit mode correctly loads "Khác" + custom text for all fields
✅ Can modify custom values
✅ Changes persist correctly

### Success Criteria:
- [ ] system_group shows "Khác" + "Custom Group A"
- [ ] authentication_method shows "Khác" + "Custom Auth B"
- [ ] integration_method shows "Khác" + "Custom Integration C"
- [ ] Can change custom values
- [ ] Changes save successfully

---

## Test Case 6: Switch Between Predefined and Custom

### Steps:
1. Navigate to Create System page → Tab 1
2. Select "Nhóm hệ thống" → Choose "Nền tảng quốc gia" (predefined)
3. Verify: Only dropdown visible (NO custom input)
4. Change to "Khác"
5. Verify: Custom input appears
6. Type: "Test"
7. Change BACK to "Nền tảng quốc gia"
8. Verify: Custom input DISAPPEARS and custom text is CLEARED
9. Change to "Khác" again
10. Verify: Custom input is EMPTY (previous "Test" was cleared)

### Expected Result:
✅ Custom input shows/hides correctly
✅ Custom text clears when switching to predefined
✅ No leftover state when switching

### Success Criteria:
- [ ] Predefined selection: only dropdown (1 element)
- [ ] "Khác" selection: dropdown + input (2 elements)
- [ ] Switching clears custom input
- [ ] No console errors during switching

---

## Regression Testing

### Verify Existing Functionality Still Works:
- [ ] Can create system with ALL predefined values
- [ ] Can create system with MIX of predefined + custom
- [ ] Form validation still works correctly
- [ ] All 8 tabs navigate properly
- [ ] Dynamic lists (business objectives, data sources) still work
- [ ] Checkbox groups (user_types) still work
- [ ] Integration connection list still works
- [ ] Form submission sends correct API payload
- [ ] Backend accepts and saves values correctly

---

## Deployment Verification Commands

```bash
# 1. Check current JavaScript hash in production
curl -sL "https://thongkehethong.mindmaid.ai/" | grep -o 'index-[^"]*\.js'
# Expected: index-BDkSrweE.js (NOT index-DdGijo3R.js)

# 2. Verify P0.8 removed from JavaScript
curl -sL "https://thongkehethong.mindmaid.ai/assets/index-BDkSrweE.js" | grep -c "P0.8"
# Expected: 0 (NOT 1)

# 3. Check SelectWithOther component exists in new build
curl -sL "https://thongkehethong.mindmaid.ai/assets/index-BDkSrweE.js" | grep -c "SelectWithOther"
# Expected: > 0
```

---

## Success Criteria Summary

### Phase 1 is COMPLETE when:
1. ✅ Cloudflare serves new JavaScript file (`index-BDkSrweE.js`)
2. ✅ All P0.8 text removed from UI (0 occurrences)
3. ✅ SelectWithOther component works for all 3 fields:
   - system_group (Tab 1)
   - authentication_method (Tab 6)
   - integration_method (Tab 5)
4. ✅ Custom input appears when "Khác" selected
5. ✅ Custom values save to database
6. ✅ Edit mode loads custom values correctly
7. ✅ Switching between predefined/custom works smoothly
8. ✅ No regression bugs in existing functionality

---

## Known Issues

### Issue 1: Cloudflare CDN Caching
- **Status**: Pending user action
- **Impact**: New code not visible to users
- **Resolution**: Purge Cloudflare cache
- **ETA**: Depends on user access to Cloudflare Dashboard

---

## Contact

If any test fails, document:
1. Which test case
2. Expected vs actual behavior
3. Browser console errors (if any)
4. Screenshots
5. Network tab showing which JavaScript file loaded

Report issues to development team with above information.
