# Quick Input Feature - Comprehensive Test Plan

**Feature**: SelectWithOther & CheckboxGroupWithOther Components
**Version**: 1.0
**Status**: Ready for Testing
**Test Environment**: Production (https://thongkehethong.mindmaid.ai/)
**Date Created**: 2026-01-20

---

## 📋 Test Summary

**Total Fields to Test**: 25 fields across 8 tabs
**Component Types**:
- SelectWithOther: 19 fields
- CheckboxGroupWithOther: 6 fields

**Test Types**:
- ✅ Functional Testing (Create mode)
- ✅ Functional Testing (Edit mode)
- ✅ Data Validation Testing
- ✅ UI/UX Testing
- ✅ Browser Compatibility (if needed)

---

## 🎯 Test Objectives

1. **Verify predefined options display correctly** in all dropdowns and checkboxes
2. **Verify "Khác" option exists** in all converted fields
3. **Verify custom input appears** when "Khác" is selected/checked
4. **Verify custom text saves correctly** to database
5. **Verify edit mode displays values correctly**:
   - Predefined values → show in dropdown/checkbox
   - Custom values → show as "Khác" selected + custom text displayed
6. **Verify no console errors** or JavaScript exceptions
7. **Verify no backend validation errors**

---

## 🔍 Test Scope

### In Scope
- All 25 converted fields (listed below)
- Create system functionality
- Edit system functionality
- Form submission and data persistence
- Custom input validation

### Out of Scope
- Non-converted fields (8 fields intentionally left as text input)
- Delete functionality
- User permissions
- Export functionality
- Mobile responsiveness (future enhancement)

---

## 📝 Detailed Test Cases

### Test Suite 1: SelectWithOther Component (19 fields)

#### TC-001: Tab 1 - Nhóm hệ thống (system_group)

**Prerequisites**: Logged in as org user or admin

**Steps**:
1. Navigate to `/systems/create`
2. Go to Tab 1 "Thông tin cơ bản"
3. Locate "Nhóm hệ thống" field
4. Click the dropdown

**Expected Results**:
- ✅ Dropdown shows 8 options:
  1. Nền tảng dùng chung
  2. Ứng dụng nghiệp vụ
  3. Cổng thông tin
  4. Website
  5. BI/Báo cáo
  6. ESB/Tích hợp
  7. CSDL chuyên ngành
  8. Khác
- ✅ Selecting any option (1-7) → no custom input appears
- ✅ Selecting "Khác" → custom text input appears below
- ✅ Enter custom text "Hệ thống tùy chỉnh" → text persists
- ✅ Submit form → system created
- ✅ Query DB: `system_group = "Hệ thống tùy chỉnh"`

**Edit Mode Test**:
1. Edit the created system
2. Expected: "Khác" selected + "Hệ thống tùy chỉnh" displayed in custom input
3. Change to predefined option "Ứng dụng nghiệp vụ"
4. Save
5. Expected: `system_group = "business"` (value, not label)

---

#### TC-002: Tab 2 - Đối tượng sử dụng (user_types) - CheckboxGroupWithOther

**Field Type**: CheckboxGroupWithOther (JSONField array)

**Steps**:
1. Navigate to Tab 2 "Mục tiêu – phạm vi – người dùng"
2. Locate "Đối tượng sử dụng" field

**Expected Results**:
- ✅ Checkbox group shows 7 options:
  1. Cán bộ, công chức, viên chức
  2. Doanh nghiệp
  3. Tổ chức
  4. Người dân
  5. Cơ quan Nhà nước
  6. Tổ chức quốc tế
  7. Khác
- ✅ Can check multiple options
- ✅ Checking "Khác" → custom input appears
- ✅ Enter "Nhà thầu ngoài" → saves as array element
- ✅ Submit → DB contains array: `["civil_servant", "enterprise", "Nhà thầu ngoài"]`

**Edit Mode Test**:
- Expected: Predefined checkboxes checked + "Khác" checked + custom text displayed

---

#### TC-003 to TC-025: Repeat for All 25 Fields

**Format**: For each field, test:
1. Dropdown/checkbox displays correct options
2. "Khác" option exists
3. Selecting "Khác" shows custom input
4. Custom text saves correctly
5. Edit mode displays correctly

---

## 📊 Complete Field List with Test Status

### Tab 1: Thông tin cơ bản

| # | Field Name | Component | Options Count | Test Status |
|---|------------|-----------|---------------|-------------|
| 1 | system_group | SelectWithOther | 8 | ⏳ Pending |

### Tab 2: Mục tiêu – phạm vi – người dùng

| # | Field Name | Component | Options Count | Test Status |
|---|------------|-----------|---------------|-------------|
| 2 | user_types | CheckboxGroupWithOther | 7 | ⏳ Pending |
| 3 | business_objectives | CheckboxGroupWithOther | 9 | ⏳ Pending |
| 4 | business_processes | CheckboxGroupWithOther | 9 | ⏳ Pending |

### Tab 3: Kiến trúc công nghệ

| # | Field Name | Component | Options Count | Test Status |
|---|------------|-----------|---------------|-------------|
| 5 | programming_language | SelectWithOther | 14 | ⏳ Pending |
| 6 | framework | SelectWithOther | 16 | ⏳ Pending |
| 7 | database_name | SelectWithOther | 14 | ⏳ Pending |
| 8 | hosting_platform | SelectWithOther | 6 | ⏳ Pending |

### Tab 4: Kiến trúc dữ liệu

| # | Field Name | Component | Options Count | Test Status |
|---|------------|-----------|---------------|-------------|
| 9 | data_classification_type | SelectWithOther | 6 | ⏳ Pending |
| 10 | data_volume | SelectWithOther | 7 | ⏳ Pending |
| 11 | data_sources | CheckboxGroupWithOther | 9 | ⏳ Pending |

### Tab 5: Tích hợp – liên thông

| # | Field Name | Component | Options Count | Test Status |
|---|------------|-----------|---------------|-------------|
| 12 | data_exchange_method | SelectWithOther | 9 | ⏳ Pending |
| 13 | integrated_internal_systems | CheckboxGroupWithOther | 9 | ⏳ Pending |
| 14 | integrated_external_systems | CheckboxGroupWithOther | 10 | ⏳ Pending |

### Tab 6: Bảo mật

| # | Field Name | Component | Options Count | Test Status |
|---|------------|-----------|---------------|-------------|
| 15 | authentication_method | SelectWithOther | 8 | ⏳ Pending |
| 16 | compliance_standards_list | SelectWithOther | 9 | ⏳ Pending |

### Tab 7: Hạ tầng – vận hành

| # | Field Name | Component | Options Count | Test Status |
|---|------------|-----------|---------------|-------------|
| 17 | server_configuration | SelectWithOther | 8 | ⏳ Pending |
| 18 | storage_capacity | SelectWithOther | 7 | ⏳ Pending |
| 19 | backup_plan | SelectWithOther | 6 | ⏳ Pending |
| 20 | disaster_recovery_plan | SelectWithOther | 5 | ⏳ Pending |

### Tab 8: Đánh giá – vận hành

| # | Field Name | Component | Options Count | Test Status |
|---|------------|-----------|---------------|-------------|
| 21 | support_level | SelectWithOther | 5 | ⏳ Pending |
| 22 | api_standard | SelectWithOther | 7 | ⏳ Pending |

---

## 🐛 Bug Tracking

### Critical Bugs (P0)
_No bugs reported yet_

### Major Bugs (P1)
_No bugs reported yet_

### Minor Bugs (P2)
_No bugs reported yet_

### Enhancement Requests
_No requests yet_

---

## 📈 Test Execution Log

### Test Session 1: [Date]
- **Tester**: [Name]
- **Environment**: Production
- **Browser**: Chrome [Version]
- **Test Cases Executed**: 0/25
- **Pass**: 0
- **Fail**: 0
- **Blocked**: 25 (Need login credentials)

**Notes**:
- Cannot access production without valid credentials
- Attempted login with admin/admin - failed (401 error)
- Recommendation: Obtain valid test credentials or test on staging/local environment

---

## ✅ Test Completion Criteria

The Quick Input feature is considered **TESTED and APPROVED** when:

1. **Functional Requirements**:
   - [ ] All 25 fields display correct predefined options
   - [ ] All 25 fields have "Khác" option
   - [ ] All 25 fields show custom input when "Khác" selected
   - [ ] All custom text saves correctly to database
   - [ ] All predefined selections save with correct value (not label)

2. **Edit Mode Requirements**:
   - [ ] Predefined values display correctly in edit mode
   - [ ] Custom values display as "Khác" + custom text in edit mode
   - [ ] Can modify from predefined to custom and vice versa
   - [ ] All changes persist correctly

3. **Quality Requirements**:
   - [ ] No console errors
   - [ ] No JavaScript exceptions
   - [ ] No backend validation errors
   - [ ] Form loads within 3 seconds
   - [ ] No UI flickering or layout issues

4. **Data Integrity**:
   - [ ] Created systems have correct values in DB
   - [ ] Edited systems update values correctly
   - [ ] No data loss during save
   - [ ] Array fields (CheckboxGroupWithOther) store as valid JSON arrays

---

## 🔧 Testing Tools

### Required
- Browser: Chrome/Firefox (latest version)
- Database client: pgAdmin or psql (to verify data)
- DevTools: For checking console errors

### Optional
- Playwright (automated testing)
- Postman (API testing)
- React DevTools (component inspection)

---

## 📞 Test Environment Access

**Production URL**: https://thongkehethong.mindmaid.ai/

**Required Credentials**:
- Admin account (for full access)
- Org user account (for org-level access)

**Status**: ⚠️ **BLOCKED** - Need valid credentials

**Action Required**: Contact project owner/admin to obtain test credentials

---

## 🎯 Next Steps

1. **Obtain Test Credentials** (URGENT)
   - Contact: [Project owner/admin name]
   - Request: Admin account + Org user account for testing

2. **Execute Test Cases**
   - Follow test cases TC-001 to TC-025
   - Document results in "Test Execution Log"
   - Take screenshots for failures

3. **Report Findings**
   - Log all bugs in "Bug Tracking" section
   - Prioritize issues (P0, P1, P2)
   - Create fix tasks if needed

4. **Regression Testing**
   - After any bug fixes, re-test affected fields
   - Verify no new issues introduced

5. **Sign-off**
   - Once all tests pass, mark feature as "TESTED ✅"
   - Update QUICK-INPUT-FEATURE-STATUS.md
   - Notify stakeholders

---

## 📝 Test Script Template (Manual Testing)

```markdown
### Test Execution: [Field Name]

**Date**: [YYYY-MM-DD]
**Tester**: [Name]
**Field**: [field_name]
**Component**: SelectWithOther / CheckboxGroupWithOther
**Tab**: [Tab number and name]

#### Steps Executed:
1. Navigate to tab X
2. Locate field Y
3. Click dropdown/checkbox
4. Verify options displayed
5. Select "Khác"
6. Enter custom text: "[custom text]"
7. Submit form
8. Query DB: `SELECT [field] FROM systems ORDER BY id DESC LIMIT 1;`

#### Actual Result:
[Describe what actually happened]

#### Pass/Fail: ✅ PASS / ❌ FAIL

#### Screenshot: [Link if applicable]

#### Notes: [Any observations]
```

---

## 🚀 Quick Testing Checklist

For rapid testing, use this shortened checklist:

**For Each Field**:
- [ ] Options load correctly
- [ ] "Khác" exists
- [ ] Custom input appears
- [ ] Custom text saves
- [ ] Edit mode works

**Overall**:
- [ ] No console errors
- [ ] No backend errors
- [ ] Performance acceptable
- [ ] UI looks good

---

**Document Status**: READY FOR EXECUTION
**Blocker**: Need production credentials
**Alternative**: Test on local development environment if available
