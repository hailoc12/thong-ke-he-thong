# Frontend "Other" Option Fix Report
**Date:** 2026-01-27
**Issue:** Frontend dropdown arrays missing 'other' option

---

## 🎯 Summary

Fixed frontend dropdown arrays to include 'Khác' (other) option to match backend CHOICES that already have 'other'.

---

## ✅ Fixed Fields (Frontend Dropdowns)

### 1. hosting_platform
**Status:** ✅ Already had 'other' option
**Location:** SystemCreate.tsx, SystemEdit.tsx
**Array:** `hostingPlatformOptions`

### 2. deployment_location
**Status:** ✅ Fixed - Added 'other' option
**Location:** SystemCreate.tsx line 316, SystemEdit.tsx line 316
**Array:** `deploymentLocationOptions`
**Change:**
```typescript
const deploymentLocationOptions = [
  { label: 'Data Center', value: 'datacenter' },
  { label: 'Cloud', value: 'cloud' },
  { label: 'Hybrid', value: 'hybrid' },
  { label: 'Khác', value: 'other' },  // ← ADDED
];
```

### 3. compute_type
**Status:** ✅ Fixed - Added 'other' option
**Location:** SystemCreate.tsx line 330, SystemEdit.tsx line 330
**Array:** `computeTypeOptions`
**Change:**
```typescript
const computeTypeOptions = [
  { label: 'Virtual Machine', value: 'vm' },
  { label: 'Container', value: 'container' },
  { label: 'Serverless', value: 'serverless' },
  { label: 'Bare Metal', value: 'bare_metal' },
  { label: 'Khác', value: 'other' },  // ← ADDED
];
```

---

## ❓ Not Found in Frontend (May Not Have Form Fields Yet)

The following fields have 'other' option in **backend models** but **do NOT have form fields** in frontend:

### 4. database_model (SystemArchitecture)
**Backend:** ✅ Has 'other' in CHOICES
**Frontend:** ❓ No options array found (form field may not exist)

### 5. mobile_app (SystemArchitecture)
**Backend:** ✅ Has 'other' in CHOICES
**Frontend:** ❓ No options array found (form field may not exist)

### 6. dev_type (SystemOperations)
**Backend:** ✅ Has 'other' in CHOICES
**Frontend:** ❓ No options array found (form field may not exist)

### 7. warranty_status (SystemOperations)
**Backend:** ✅ Has 'other' in CHOICES
**Frontend:** ❓ No options array found (form field may not exist)

### 8. vendor_dependency (SystemOperations)
**Backend:** ✅ Has 'other' in CHOICES
**Frontend:** ❓ No options array found (form field may not exist)

---

## 📊 Current Status

| Field | Backend | Frontend Dropdown | Status |
|-------|---------|------------------|--------|
| hosting_platform | ✅ Has 'other' | ✅ Has 'other' | ✅ OK |
| deployment_location | ✅ Has 'other' | ✅ Fixed - Added 'other' | ✅ FIXED |
| compute_type | ✅ Has 'other' | ✅ Fixed - Added 'other' | ✅ FIXED |
| database_model | ✅ Has 'other' | ❓ No form field | ⚠️ INCOMPLETE |
| mobile_app | ✅ Has 'other' | ❓ No form field | ⚠️ INCOMPLETE |
| dev_type | ✅ Has 'other' | ❓ No form field | ⚠️ INCOMPLETE |
| warranty_status | ✅ Has 'other' | ❓ No form field | ⚠️ INCOMPLETE |
| vendor_dependency | ✅ Has 'other' | ❓ No form field | ⚠️ INCOMPLETE |

---

## 🔄 Deployment Steps

### 1. Build Frontend
```bash
cd ~/thong_ke_he_thong
docker compose stop frontend
docker compose rm -f frontend

# Clear Docker build cache (CRITICAL for frontend changes)
docker builder prune -af

# Build with BuildKit disabled to ensure fresh build
DOCKER_BUILDKIT=0 docker compose build frontend --no-cache --pull

# Start frontend
docker compose up -d frontend
```

### 2. Verify Changes
After deployment, check:
- deployment_location dropdown has "Khác" option
- compute_type dropdown has "Khác" option
- Can select and save "Khác" without validation errors

### 3. Clear Browser Cache
**IMPORTANT:** Users must clear browser cache or hard refresh:
- **Windows/Linux:** Ctrl + Shift + R
- **Mac:** Cmd + Shift + R
- **Or:** Clear all browser cache for the site

---

## 🐛 Remaining Issues

### Issue 1: Missing Form Fields for Nested Data
**Fields affected:** database_model, mobile_app, dev_type, warranty_status, vendor_dependency

**Root cause:** Frontend may not have implemented form fields for these nested data fields yet.

**Possible solutions:**
1. **Check if fields exist under different names** - Some fields might use different naming
2. **Add form fields** - If truly missing, need to add Form.Item components
3. **Verify API usage** - Check if nested data is sent/received correctly

### Issue 2: Validation Error "value must be one of options"
If users still see this error after fix:

**Cause:** Frontend dropdown doesn't have 'other' in options list

**Solution:**
1. Check which specific field shows the error
2. Verify the field's options array has `{ label: 'Khác', value: 'other' }`
3. If not in list above, search and fix manually

---

## 🧪 Testing Guide

### Test Case 1: deployment_location
1. Navigate to Create/Edit System
2. Find "Vị trí triển khai" (Deployment Location) dropdown
3. Verify dropdown contains "Khác" option
4. Select "Khác"
5. Fill custom text (optional)
6. Save form
7. **Expected:** No validation error

### Test Case 2: compute_type
1. Navigate to Create/Edit System
2. Find "Loại hạ tầng tính toán" (Compute Type) dropdown
3. Verify dropdown contains "Khác" option
4. Select "Khác"
5. Fill custom text (optional)
6. Save form
7. **Expected:** No validation error

---

## 📝 Notes

1. **Backend already supports 'other'** - All 8 fields in backend models have 'other' in CHOICES and validation passes (verified via API tests)

2. **Frontend implementation incomplete** - Some fields have backend support but no frontend form fields

3. **SelectWithOther component** - Frontend uses a custom `SelectWithOther` component that:
   - Shows dropdown with predefined options
   - When "other" selected, shows textarea for custom input
   - Sends custom text value to backend (not just 'other')

4. **No additional validation needed** - Once 'other' is in options array, no other changes needed (no validation rules to remove)

---

## ✅ Completion Checklist

Frontend fixes:
- [x] Add 'other' to deploymentLocationOptions (SystemCreate.tsx)
- [x] Add 'other' to deploymentLocationOptions (SystemEdit.tsx)
- [x] Add 'other' to computeTypeOptions (SystemCreate.tsx)
- [x] Add 'other' to computeTypeOptions (SystemEdit.tsx)
- [ ] Investigate missing form fields for nested data
- [ ] Deploy frontend changes
- [ ] Test in browser with cache cleared
- [ ] Verify no validation errors

---

## 🚀 Next Steps

1. **Deploy frontend immediately** - Use deployment steps above
2. **User clear cache** - Instruct users to hard refresh browser
3. **Test 2 fixed fields** - deployment_location and compute_type
4. **Investigate nested fields** - Research if database_model, mobile_app, etc. truly have form fields
5. **Monitor for issues** - Check if users report other fields with same problem
