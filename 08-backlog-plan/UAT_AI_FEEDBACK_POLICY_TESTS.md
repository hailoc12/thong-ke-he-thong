# UAT Test Cases - AI Feedback & Policy Management

## Overview
User Acceptance Testing for AI Feedback & Policy Management feature on UAT server.

**UAT Server:** https://thong-ke-he-thong-uat.mindmaid.ai
**Test Role:** lanhdaobo (admin with leader role)
**Test Date:** 2026-02-06

---

## Test Environment Setup

### Prerequisites
1. UAT server deployed with latest code
2. Test account: `admin` / `Admin@2026`
3. Browser: Chrome/Firefox (latest version)
4. Clear browser cache before testing

### Test Data Setup
Before running tests, ensure:
- At least 5 AI feedback records exist (mix of positive/negative)
- At least 2 custom policies exist
- Test user has lanhdaobo or staff role

---

## UAT Test Case 1: Page Load and Statistics Display

**Objective:** Verify AI Feedback & Policy Management page loads correctly and displays statistics

**Test Steps:**
1. Login with admin credentials
2. Navigate to "AI Feedback & Policies" from sidebar menu
3. Wait for page to fully load

**Expected Results:**
- ✅ Page loads without errors (no 404, 500, or loading spinner stuck)
- ✅ Statistics cards display:
  - Total Feedbacks (number)
  - Positive Feedbacks (number with green icon)
  - Negative Feedbacks (number with red icon)
  - Satisfaction Rate (percentage)
- ✅ Policy Injection Status banner shows:
  - "Policy đang hoạt động: [number]"
  - "Auto-generated: [number]"
  - "Custom: [number]"
  - Green checkmark icon if policies > 0
- ✅ Active Policies section loads with collapse panels
- ✅ Each policy panel shows:
  - Category badge
  - Priority badge (High/Medium/Low with colors)
  - Rule text
  - Rationale text
  - Edit button (for custom policies)
  - Delete button (for custom policies, red color)

**Pass Criteria:**
- All UI elements render correctly
- Numbers match actual data
- No console errors in browser DevTools

---

## UAT Test Case 2: Create Custom Policy Flow

**Objective:** Test creating a new custom policy through the UI

**Test Steps:**
1. From AI Feedback & Policies page
2. Click "Tạo Policy Mới" button (blue, top right)
3. Fill in the form:
   - Category: Select "Accuracy"
   - Rule: "Always verify SQL query results before responding"
   - Priority: Select "High"
   - Rationale: "Users reported data inaccuracies multiple times"
4. Click "Tạo Policy" button
5. Wait for success message

**Expected Results:**
- ✅ Modal opens with form fields
- ✅ All fields are required (form won't submit if empty)
- ✅ Category dropdown has options: Accuracy, Clarity, Completeness, Performance, Custom
- ✅ Priority dropdown has: High, Medium, Low
- ✅ After successful creation:
  - Success message appears (green notification)
  - Modal closes automatically
  - New policy appears in Active Policies list
  - Policy has Edit and Delete buttons
  - Policy is marked as "Custom" (from backend is_custom flag)
- ✅ Policy count in banner increases by 1

**Pass Criteria:**
- Policy successfully created
- UI updates immediately
- New policy visible in list with correct data
- Policy has is_custom=true in API response

---

## UAT Test Case 3: Edit Custom Policy Flow

**Objective:** Test editing an existing custom policy

**Test Steps:**
1. From Active Policies section
2. Find a custom policy (has Edit button)
3. Click "Sửa" (Edit) button on the policy
4. In the modal, change:
   - Priority from "High" to "Medium"
   - Update Rule text: Add " and log all queries"
5. Click "Cập nhật" (Update) button
6. Wait for success message

**Expected Results:**
- ✅ Edit modal opens pre-filled with current policy data
- ✅ All fields editable except category (should be read-only or disabled)
- ✅ After successful update:
  - Success message appears
  - Modal closes
  - Policy updates in list immediately
  - Priority badge color changes (High=red → Medium=orange)
  - Rule text shows updated content
- ✅ No page refresh needed

**Pass Criteria:**
- Changes saved successfully
- UI reflects changes immediately
- Original policy data preserved except updated fields
- Policy updated_at timestamp changes

---

## UAT Test Case 4: Delete Custom Policy Flow

**Objective:** Test deleting a custom policy with confirmation

**Test Steps:**
1. From Active Policies section
2. Find a custom policy with Delete button
3. Click "Xóa" (Delete) button (red button)
4. Read confirmation dialog
5. Click "OK" to confirm deletion
6. Wait for success message

**Expected Results:**
- ✅ Confirmation modal appears asking: "Bạn có chắc chắn muốn xóa policy này?"
- ✅ Modal has two buttons: "Hủy" (Cancel) and "OK"
- ✅ If "Hủy" clicked: Modal closes, policy NOT deleted
- ✅ If "OK" clicked:
  - Success message appears
  - Policy removed from list immediately
  - Policy count in banner decreases by 1
  - No page refresh needed
- ✅ Deleted policy does NOT appear in list after deletion

**Alternative Test (Cancel deletion):**
1. Click Delete button
2. Click "Hủy" in confirmation
3. Verify policy still exists

**Pass Criteria:**
- Delete confirmation works
- Policy successfully removed from database
- UI updates immediately
- Cancel button prevents deletion

---

## UAT Test Case 5: Regenerate Policies and View System Prompt

**Objective:** Test regenerating policies from feedback and viewing system prompt

**Test Steps:**
1. From AI Feedback & Policies page
2. Click "Tạo lại từ Feedback" button (below statistics)
3. Wait for regeneration to complete
4. Check for success message
5. Click "Xem System Prompt" button
6. Review system prompt content in modal
7. Close modal

**Expected Results:**

**Regenerate Policies:**
- ✅ Loading spinner appears during regeneration
- ✅ Success message shows: "Đã tạo lại [X] policies từ feedback"
- ✅ Active Policies list refreshes
- ✅ New auto-generated policies appear (without Edit/Delete buttons)
- ✅ Policy counts in banner update

**View System Prompt:**
- ✅ Modal opens showing system prompt
- ✅ Prompt contains:
  - Introduction text
  - "Improvement Guidelines:" section
  - List of all active policies (both auto and custom)
  - Each policy formatted with category, priority, rule
- ✅ Modal is scrollable if content is long
- ✅ "Đóng" button closes modal

**Pass Criteria:**
- Regeneration completes without errors
- System prompt modal displays correctly
- All active policies visible in prompt
- Policies properly formatted in prompt text

---

## UAT Test Case 6: Permission Check for Non-Admin Users

**Objective:** Verify that non-admin users cannot access the page

**Test Steps:**
1. Logout from admin account
2. Login with org user: `vu-buuchinh` / `ThongkeCDS@2026#`
3. Try to access AI Feedback & Policies page via URL: `/ai-feedback`
4. Check response

**Expected Results:**
- ✅ User redirected to Dashboard or Home page
- ✅ OR: "Access Denied" message appears
- ✅ Sidebar menu does NOT show "AI Feedback & Policies" link for non-admin
- ✅ No way to access the page without admin/lanhdaobo role

**Pass Criteria:**
- Non-admin users blocked from accessing page
- No security bypass possible
- Proper error handling

---

## UAT Test Case 7: API Response Validation

**Objective:** Verify API responses match expected structure using browser DevTools

**Test Steps:**
1. Login as admin
2. Open browser DevTools (F12)
3. Go to Network tab
4. Navigate to AI Feedback & Policies page
5. Review API calls:
   - `/api/ai-feedback/active_policies/`
   - `/api/ai-feedback/policy_status/`
6. Create a custom policy and check:
   - `POST /api/custom-policies/`
7. Edit a policy and check:
   - `PATCH /api/custom-policies/{id}/`

**Expected Results:**

**Active Policies API:**
```json
{
  "policies": [
    {
      "category": "accuracy",
      "rule": "Rule text",
      "priority": "high",
      "rationale": "Rationale text",
      "is_custom": true,
      "id": 1
    }
  ]
}
```

**Policy Status API:**
```json
{
  "total_active_policies": 5,
  "auto_generated_count": 3,
  "custom_count": 2,
  "injection_points": [...]
}
```

**Pass Criteria:**
- All API responses have status 200/201
- Response structure matches expected format
- No 401, 403, 404, or 500 errors
- Data types correct (numbers, strings, booleans)

---

## UAT Test Case 8: UI Responsiveness and Error Handling

**Objective:** Test UI behavior under various conditions

**Test Steps:**
1. **Empty State Test:**
   - Delete all custom policies
   - Verify empty state message appears

2. **Loading State Test:**
   - Throttle network to Slow 3G (in DevTools)
   - Reload page
   - Verify loading spinners appear

3. **Error Handling Test:**
   - Disconnect network (offline mode)
   - Try to create a policy
   - Verify error message

4. **Form Validation Test:**
   - Try to submit create form with empty fields
   - Verify validation messages

**Expected Results:**
- ✅ Empty state shows helpful message
- ✅ Loading spinners appear during data fetch
- ✅ Network errors show user-friendly messages
- ✅ Form validation prevents invalid submissions
- ✅ Error messages in Vietnamese
- ✅ No UI crashes or blank screens

**Pass Criteria:**
- Graceful handling of all edge cases
- Clear error messages
- UI remains usable

---

## UAT Test Case 9: Policy Priority Ordering

**Objective:** Verify policies are displayed in correct priority order

**Test Steps:**
1. Create 3 custom policies with different priorities:
   - Policy A: Priority = Low
   - Policy B: Priority = High
   - Policy C: Priority = Medium
2. Refresh page
3. Check order in Active Policies list

**Expected Results:**
- ✅ Policies ordered: High → Medium → Low
- ✅ Order is Policy B → Policy C → Policy A
- ✅ Priority badges show correct colors:
  - High: Red/Error color
  - Medium: Orange/Warning color
  - Low: Gray/Default color

**Pass Criteria:**
- Correct sorting by priority
- Visual distinction between priorities
- Order persists after page reload

---

## UAT Test Case 10: End-to-End User Journey

**Objective:** Complete realistic user workflow from start to finish

**Scenario:** Admin wants to improve AI responses based on user feedback

**Test Steps:**
1. Login as admin
2. Navigate to AI Feedback & Policies page
3. Review statistics:
   - Note current satisfaction rate
   - Note number of negative feedbacks
4. Click "Tạo lại từ Feedback" to regenerate policies
5. Review auto-generated policies
6. Create 2 custom policies based on domain knowledge:
   - Policy 1: High priority accuracy rule
   - Policy 2: Medium priority clarity rule
7. Edit one auto-generated policy's priority
8. Click "Xem System Prompt" to verify all policies injected
9. Navigate away and return to verify data persists

**Expected Results:**
- ✅ Complete workflow executes without errors
- ✅ All data persists across page navigation
- ✅ System prompt contains all active policies
- ✅ Policies properly categorized and prioritized
- ✅ UI responsive and intuitive throughout

**Pass Criteria:**
- All operations successful
- Data persistence verified
- Professional UX throughout
- No bugs or crashes

---

## Test Summary Template

After completing all tests, fill out:

```
Test Date: ___________
Tester Name: ___________
Environment: UAT / Production

Results:
- Total Tests: 10
- Passed: ___
- Failed: ___
- Blocked: ___

Failed Tests (if any):
1. Test Case #: ___
   Issue: ___________
   Screenshot: ___________

2. Test Case #: ___
   Issue: ___________
   Screenshot: ___________

Critical Issues:
- [ ] None
- [ ] Issue 1: ___________
- [ ] Issue 2: ___________

Sign-off:
☐ Ready for Production
☐ Needs fixes before Production
☐ Major issues found
```

---

## Automated Testing Commands

After UAT, run automated tests to verify backend:

```bash
# SSH to server
ssh admin_@34.142.152.104

# Navigate to project
cd /home/admin_/apps/thong-ke-he-thong

# Run unit tests
docker compose exec backend python manage.py test apps.systems.tests.test_custom_policy_unit

# Run integration tests
docker compose exec backend python manage.py test apps.systems.tests.test_custom_policy_integration

# Run all tests
docker compose exec backend python manage.py test apps.systems.tests
```

---

## Notes for QA Team

1. **Take Screenshots:** Capture screenshots of all key UI states
2. **Record Console Errors:** Check browser console for any JavaScript errors
3. **Test on Multiple Browsers:** Chrome, Firefox, Safari
4. **Test on Mobile:** Responsive design check
5. **Performance:** Note any slow loading times
6. **Security:** Verify permission checks work correctly

---

## Success Criteria

All 10 UAT tests must pass before production deployment:
- ✅ No critical bugs (P0)
- ✅ No security vulnerabilities
- ✅ All features working as specified
- ✅ UI/UX meets quality standards
- ✅ Performance acceptable (<3s page load)
