# Playwright UI Test Guide - "Other" Option Fix
**Date:** 2026-01-27

---

## 🎯 Objective

Test all 8 fields with 'Other' (Khác) option through the actual web UI to ensure:
1. Dropdown shows 'Khác' option
2. User can select 'Khác'
3. Form saves without validation errors
4. Data persists correctly

---

## 🤖 Option 1: Automated Playwright Test (Recommended)

### Prerequisites
```bash
# On the server
pip3 install playwright
playwright install chromium
```

### Run Test
```bash
# Copy test script to server
scp playwright_manual_test.py admin_@34.142.152.104:~/thong_ke_he_thong/

# SSH to server
ssh admin_@34.142.152.104

# Run test
cd ~/thong_ke_he_thong
python3 playwright_manual_test.py
```

### Expected Output
```
======================================================================
Playwright UI Test: 'Other' Option in Forms
======================================================================

▶ Step 1: Navigating to login page...
✓ Page loaded

▶ Step 2: Logging in...
✓ Logged in

▶ Step 3: Navigating to create system page...
✓ Form loaded

▶ Step 4: Filling basic system information...
✓ Basic info filled

▶ Step 5: Testing hosting_platform = 'other'...
✅ PASS: hosting_platform set to 'other'

▶ Step 6: Testing Architecture tab fields...
✅ PASS: database_model set to 'other'
✅ PASS: mobile_app set to 'other'

▶ Step 7: Testing Operations tab fields...
✅ PASS: dev_type set to 'other'
✅ PASS: warranty_status set to 'other'
✅ PASS: vendor_dependency set to 'other'
✅ PASS: deployment_location set to 'other'
✅ PASS: compute_type set to 'other'

▶ Step 8: Submitting form...
✅ PASS: Form submitted successfully

▶ Taking screenshot...
✓ Screenshot saved: playwright_test_result.png

======================================================================
Test Complete
======================================================================
```

---

## 👤 Option 2: Manual UI Test

If Playwright can't be installed, follow these manual steps:

### Test Case 1: System.hosting_platform
1. **Login** to web UI
2. **Navigate** to Create New System
3. **Find** "Hosting Platform" field
4. **Check** dropdown contains option "Khác" (Other)
5. **Select** "Khác"
6. **Fill** required fields (system name, organization, scope)
7. **Save** form
8. **Verify** no validation error
9. **Expected:** ✅ Form saves successfully

---

### Test Case 2: SystemArchitecture.database_model
1. **Continue** from Test Case 1 OR create new system
2. **Navigate** to "Kiến trúc" (Architecture) tab
3. **Find** "Database Model" field
4. **Check** dropdown contains option "Khác"
5. **Select** "Khác"
6. **Save** form
7. **Verify** no validation error
8. **Expected:** ✅ Form saves successfully

---

### Test Case 3: SystemArchitecture.mobile_app
1. **In** Architecture tab
2. **Find** "Mobile App" field
3. **Check** dropdown contains option "Khác"
4. **Select** "Khác"
5. **Save** form
6. **Verify** no validation error
7. **Expected:** ✅ Form saves successfully

---

### Test Case 4: SystemOperations.dev_type
1. **Navigate** to "Vận hành" (Operations) tab
2. **Find** "Development Type" field
3. **Check** dropdown contains option "Khác"
4. **Select** "Khác"
5. **Save** form
6. **Verify** no validation error
7. **Expected:** ✅ Form saves successfully

---

### Test Case 5: SystemOperations.warranty_status
1. **In** Operations tab
2. **Find** "Warranty Status" field
3. **Check** dropdown contains option "Khác"
4. **Select** "Khác"
5. **Save** form
6. **Verify** no validation error
7. **Expected:** ✅ Form saves successfully

---

### Test Case 6: SystemOperations.vendor_dependency
1. **In** Operations tab
2. **Find** "Vendor Dependency" field
3. **Check** dropdown contains option "Khác"
4. **Select** "Khác"
5. **Save** form
6. **Verify** no validation error
7. **Expected:** ✅ Form saves successfully

---

### Test Case 7: SystemOperations.deployment_location
1. **In** Operations tab
2. **Find** "Deployment Location" field
3. **Check** dropdown contains option "Khác"
4. **Select** "Khác"
5. **Save** form
6. **Verify** no validation error
7. **Expected:** ✅ Form saves successfully

---

### Test Case 8: SystemOperations.compute_type
1. **In** Operations tab
2. **Find** "Compute Type" field
3. **Check** dropdown contains option "Khác"
4. **Select** "Khác"
5. **Save** form
6. **Verify** no validation error
7. **Expected:** ✅ Form saves successfully

---

## 📊 Test Results Template

Copy and fill this table:

| Test Case | Field | Tab | Dropdown Has 'Khác'? | Can Select? | Saves OK? | Notes |
|-----------|-------|-----|----------------------|-------------|-----------|-------|
| 1 | hosting_platform | General | ☐ Yes ☐ No | ☐ Yes ☐ No | ☐ Yes ☐ No | |
| 2 | database_model | Architecture | ☐ Yes ☐ No | ☐ Yes ☐ No | ☐ Yes ☐ No | |
| 3 | mobile_app | Architecture | ☐ Yes ☐ No | ☐ Yes ☐ No | ☐ Yes ☐ No | |
| 4 | dev_type | Operations | ☐ Yes ☐ No | ☐ Yes ☐ No | ☐ Yes ☐ No | |
| 5 | warranty_status | Operations | ☐ Yes ☐ No | ☐ Yes ☐ No | ☐ Yes ☐ No | |
| 6 | vendor_dependency | Operations | ☐ Yes ☐ No | ☐ Yes ☐ No | ☐ Yes ☐ No | |
| 7 | deployment_location | Operations | ☐ Yes ☐ No | ☐ Yes ☐ No | ☐ Yes ☐ No | |
| 8 | compute_type | Operations | ☐ Yes ☐ No | ☐ Yes ☐ No | ☐ Yes ☐ No | |

---

## 🔍 What to Look For

### Success Indicators ✅
- Dropdown contains "Khác" option
- Can select "Khác" without UI error
- Form submission succeeds
- Success message appears
- No validation error messages
- Can see saved data when editing system

### Failure Indicators ❌
- Dropdown missing "Khác" option
- Cannot select "Khác"
- Validation error: "other is not valid choice"
- Form submission fails
- Data not saved

---

## 🐛 Troubleshooting

### Issue: "Khác" option not visible in dropdown
**Cause:** Frontend cache not cleared
**Solution:**
```bash
# On server
cd ~/thong_ke_he_thong
docker compose restart frontend

# In browser
- Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
- Clear browser cache
```

### Issue: Validation error "other is not valid choice"
**Cause:** Backend not restarted after migration
**Solution:**
```bash
# On server
cd ~/thong_ke_he_thong
docker compose restart backend
```

### Issue: Form saves but 'other' value not persisted
**Cause:** Serializer not handling field correctly
**Solution:** Check `backend/apps/systems/serializers.py`

---

## 📝 Notes

1. **API Test Already Passed**: The automated API test (`live_test_other_option.py`) already verified all 8 fields work correctly at the API level.

2. **UI Test Purpose**: This UI test verifies:
   - Frontend dropdowns are correctly populated
   - Browser cache doesn't interfere
   - End-to-end user experience works

3. **Test Data**: Test creates a system named "Playwright Test - Other Options" which can be deleted after testing.

---

## ✅ Completion Checklist

After running tests (automated or manual):

- [ ] All 8 dropdowns show "Khác" option
- [ ] Can select "Khác" in all fields
- [ ] Form saves without errors
- [ ] Data persists correctly
- [ ] Screenshots captured (if using Playwright)
- [ ] Test results documented
- [ ] Test system deleted (cleanup)

---

## 📞 Support

If you encounter any issues:
1. Check `docker compose logs backend` for backend errors
2. Check browser console (F12) for frontend errors
3. Verify migration 0024 is applied: `docker compose exec backend python manage.py showmigrations systems`
4. Re-run API test to verify backend works: `python3 live_test_other_option.py`
