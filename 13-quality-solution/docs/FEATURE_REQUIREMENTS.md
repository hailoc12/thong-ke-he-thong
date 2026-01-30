# Feature Requirements - System Form Validation & Dashboard Stats

**Date**: 2026-01-21
**Project**: Hệ thống Thống kê Hệ thống CNTT
**Workflow**: AI Vibe Coding Agent (5-Phase)
**Status**: Phase 1 - Requirements Documentation

---

## 📋 Feature Overview

### Feature 1: Required Field Validation with Tab Navigation Blocking
**User Story**: As a user creating/editing a system, I cannot proceed to the next tab until all required fields in the current tab are filled, preventing incomplete submissions.

### Feature 2: Dashboard Statistics with System Completion Percentage
**User Story**: As an admin or organization user, I want to see how many systems each organization has and what percentage of required fields have been filled for each system, so I can track data completion status.

---

## 🎯 Feature 1: Tab Navigation Blocking

### Current State Analysis

**Files Involved**:
- `frontend/src/pages/SystemCreate.tsx` - System creation form
- `frontend/src/pages/SystemEdit.tsx` - System editing form
- `frontend/src/utils/systemValidationRules.ts` - Validation schema

**Current Implementation**:
- ✅ 25 required fields across 9 tabs already defined
- ✅ Validation helper functions exist: `validateTab()`, `validateAllTabs()`
- ✅ Tab structure with Ant Design Tabs component
- ❌ Tab navigation NOT blocked - users can switch tabs freely
- ❌ No visual indicator of which tabs have validation errors
- ❌ Users can submit form with incomplete tabs

**Tab Structure & Required Fields**:

| Tab # | Tab Name | Required Fields | Count |
|-------|----------|-----------------|-------|
| 1 | Thông tin cơ bản | org, system_name, purpose, status, criticality_level, scope, system_group | 7 |
| 2 | Bối cảnh nghiệp vụ | business_objectives, business_processes, user_types | 3 |
| 3 | Kiến trúc công nghệ | programming_language, framework, database_name, hosting_platform, cicd_tool*, automated_testing_tools*, layered_architecture_details* | 4-7 |
| 4 | Kiến trúc dữ liệu | data_sources, data_types, data_classification_type, data_catalog_notes*, mdm_notes* | 3-5 |
| 5 | Tích hợp hệ thống | (none) | 0 |
| 6 | An toàn thông tin | authentication_method | 1 |
| 7 | Hạ tầng | (none) | 0 |
| 8 | Vận hành | business_owner, technical_owner | 2 |
| 9 | Đánh giá | (none) | 0 |

**Note**: Fields marked with `*` are conditionally required (depend on checkbox values)

### Requirements

#### FR-1.1: Block Tab Navigation
**Priority**: P0 (Must Have)

**Behavior**:
- User clicks on Tab N+1
- System validates all required fields in Tab N
- If validation fails:
  - Tab navigation is prevented
  - Error message displayed: "Vui lòng điền đủ các trường bắt buộc trước khi chuyển tab"
  - Invalid fields are highlighted with red border
  - First invalid field is focused
- If validation passes:
  - Tab switches normally

**Edge Cases**:
- User clicks "Previous" button → Allow (no validation needed for backward navigation)
- User clicks "Submit" button → Validate all tabs
- Conditional required fields (cicd_tool, automated_testing_tools, etc.) → Must validate based on window.__formValues

#### FR-1.2: Visual Tab Status Indicators
**Priority**: P1 (Should Have)

**Behavior**:
- Each tab label shows validation status:
  - ✅ Green checkmark: All required fields filled
  - ⚠️ Yellow warning: Some fields filled but not all
  - ⭕ No indicator: No required fields OR tab not visited yet
- Indicator updates in real-time as user fills fields

#### FR-1.3: Tab Click Handler
**Priority**: P0 (Must Have)

**Implementation Details**:
- Override Ant Design Tabs `onChange` prop
- Before switching tab, call `validateTab(form, currentTabKey)`
- If validation fails, call `event.preventDefault()` and show error notification
- Store tab validation status in component state

#### FR-1.4: Form Submission Validation
**Priority**: P0 (Must Have)

**Behavior**:
- User clicks "Submit" (in SystemCreate) or "Update" (in SystemEdit)
- System calls `validateAllTabs(form)`
- If any tab has errors:
  - Show notification: "Còn X tab chưa điền đủ thông tin: [Tab names]"
  - Jump to first invalid tab
  - Highlight all invalid fields
- If all valid:
  - Submit form normally

### Acceptance Criteria

**AC-1.1**: Given I am on Tab 1 with empty required fields, When I click Tab 2, Then tab does not switch and error message is displayed

**AC-1.2**: Given I am on Tab 1 with all required fields filled, When I click Tab 2, Then tab switches successfully

**AC-1.3**: Given I have conditional required fields (e.g., has_cicd = true), When I try to switch tabs without filling cicd_tool, Then navigation is blocked

**AC-1.4**: Given I am on Tab 3, When I click Tab 2 (backward navigation), Then tab switches without validation

**AC-1.5**: Given I have errors in Tab 2 and Tab 4, When I click Submit, Then I see notification "Còn 2 tab chưa điền đủ thông tin: Bối cảnh nghiệp vụ, Kiến trúc dữ liệu" and form jumps to Tab 2

**AC-1.6**: Given all tabs are valid, When I click Submit, Then form submits successfully

### Technical Considerations

**State Management**:
- Track current tab index in component state
- Track validation status per tab: `Record<string, boolean>`
- Update validation status on field change

**Performance**:
- Debounce field validation to avoid excessive validation calls
- Use memo/useMemo for validation status calculations

**Accessibility**:
- ARIA labels for validation errors
- Screen reader announcements when navigation is blocked
- Keyboard navigation support (Tab key should still work for fields)

---

## 📊 Feature 2: Dashboard Statistics - System Completion Percentage

### Current State Analysis

**Files Involved**:
- `frontend/src/pages/Dashboard.tsx` - Admin dashboard (lines 40-930)
- `frontend/src/pages/OrganizationDashboard.tsx` - Org user dashboard (need to check)
- `backend/apps/systems/views.py` - Statistics API endpoint (need to check)
- `backend/apps/systems/models.py` - System model (need to check)

**Current Dashboard Features**:
- ✅ Total systems count
- ✅ Systems by status (operating, stopped, pilot, replacing)
- ✅ Systems by criticality (high, medium, low)
- ✅ Filter by organization (line 59, 92-96)
- ✅ Total users count
- ❌ NO per-organization system count
- ❌ NO per-system completion percentage
- ❌ NO list of systems with completion status

**API Endpoint**:
- Current: `/systems/statistics/` (line 95)
- Returns: `SystemStatistics` type with aggregated counts
- Supports: `?org=<id>` filter (line 92-94)

### Requirements

#### FR-2.1: Organization System Count
**Priority**: P0 (Must Have)

**Admin Dashboard**:
- Show table/list: "Thống kê theo đơn vị"
- Columns:
  - Tên đơn vị
  - Số hệ thống
  - % hoàn thành trung bình của đơn vị
  - Actions: "Xem chi tiết"

**Organization Dashboard**:
- Show card: "Hệ thống của đơn vị"
- Display:
  - Tổng số hệ thống: X
  - % hoàn thành trung bình: Y%
  - Button: "Xem danh sách"

#### FR-2.2: System Completion Percentage Calculation
**Priority**: P0 (Must Have)

**Formula**:
```
Completion % = (Filled Required Fields / Total Required Fields) × 100
```

**Required Fields (25 total)**:
- Tab 1: 7 fields (always required)
- Tab 2: 3 fields (always required)
- Tab 3: 4-7 fields (conditional: cicd_tool, automated_testing_tools, layered_architecture_details)
- Tab 4: 3-5 fields (conditional: data_catalog_notes, mdm_notes)
- Tab 5: 0 fields
- Tab 6: 1 field (always required)
- Tab 7: 0 fields
- Tab 8: 2 fields (always required)
- Tab 9: 0 fields

**Calculation Logic**:
1. For each system, check all fields in `TabFieldGroups`
2. For conditional fields:
   - If has_cicd = false → cicd_tool NOT counted in total
   - If has_cicd = true → cicd_tool counted in total AND must be filled
3. Count filled vs total
4. Return percentage rounded to 1 decimal place

**Example**:
```
System A:
- has_cicd = false
- has_automated_testing = false
- has_layered_architecture = false
- has_data_catalog = false
- has_mdm = false
→ Total required fields: 7 + 3 + 4 + 3 + 0 + 1 + 0 + 2 + 0 = 20
→ Filled fields: 18
→ Completion: 90.0%

System B:
- has_cicd = true
- has_automated_testing = true
- has_layered_architecture = true
- has_data_catalog = true
- has_mdm = true
→ Total required fields: 7 + 3 + 7 + 5 + 0 + 1 + 0 + 2 + 0 = 25
→ Filled fields: 25
→ Completion: 100.0%
```

#### FR-2.3: System List with Completion Status
**Priority**: P0 (Must Have)

**Location**: New page or expandable section in Dashboard

**Admin View**:
- Show all systems grouped by organization
- Columns:
  - Tên hệ thống
  - Đơn vị
  - Trạng thái
  - % hoàn thành
  - Progress bar (visual indicator)
  - Actions: "Xem chi tiết", "Chỉnh sửa"
- Filters:
  - By organization
  - By completion range (0-25%, 26-50%, 51-75%, 76-99%, 100%)
  - By status
- Sort by: completion % (asc/desc), name, organization

**Organization User View**:
- Show only systems of their organization
- Same columns as admin view
- Same filters (except organization filter)

#### FR-2.4: Completion Progress Bar
**Priority**: P1 (Should Have)

**Visual Design**:
- Use Ant Design Progress component
- Colors:
  - 0-25%: Red (#EF4444)
  - 26-50%: Orange (#F59E0B)
  - 51-75%: Yellow (#FBBF24)
  - 76-99%: Light Green (#84CC16)
  - 100%: Green (#22C55E)
- Show percentage text on bar

#### FR-2.5: Backend API Endpoint
**Priority**: P0 (Must Have)

**New Endpoint**: `/api/systems/completion-stats/`

**Query Parameters**:
- `org` (optional): Filter by organization ID
- `status` (optional): Filter by system status
- `completion_min` (optional): Min completion % (0-100)
- `completion_max` (optional): Max completion % (0-100)

**Response Format**:
```json
{
  "organizations": [
    {
      "id": 1,
      "name": "Tổng cục Thuế",
      "system_count": 15,
      "avg_completion": 85.3,
      "systems": [
        {
          "id": 1,
          "system_name": "Hệ thống quản lý thuế",
          "status": "operating",
          "completion_percentage": 92.0,
          "filled_fields": 23,
          "total_required_fields": 25,
          "incomplete_fields": ["cicd_tool", "automated_testing_tools"]
        },
        // ...
      ]
    },
    // ...
  ],
  "summary": {
    "total_systems": 50,
    "avg_completion_all": 78.5,
    "systems_100_percent": 12,
    "systems_below_50_percent": 5
  }
}
```

**Response for Org User**:
```json
{
  "organization": {
    "id": 1,
    "name": "Tổng cục Thuế",
    "system_count": 15,
    "avg_completion": 85.3
  },
  "systems": [
    {
      "id": 1,
      "system_name": "Hệ thống quản lý thuế",
      "status": "operating",
      "completion_percentage": 92.0,
      "filled_fields": 23,
      "total_required_fields": 25,
      "incomplete_fields": ["cicd_tool", "automated_testing_tools"]
    },
    // ...
  ]
}
```

### Acceptance Criteria

**AC-2.1**: Given I am an admin, When I view Dashboard, Then I see "Thống kê theo đơn vị" table showing all organizations with system counts and avg completion %

**AC-2.2**: Given I am an org user, When I view Dashboard, Then I see my organization's system count and avg completion %

**AC-2.3**: Given a system has 20 total required fields and 18 filled, When completion % is calculated, Then it shows 90.0%

**AC-2.4**: Given I click "Xem danh sách" in Dashboard, When system list loads, Then I see all systems with completion % and progress bars

**AC-2.5**: Given I filter systems by completion range "0-25%", When filter is applied, Then only systems with 0-25% completion are shown

**AC-2.6**: Given I am on system list page, When I click "Chỉnh sửa" on a 75% complete system, Then I am taken to SystemEdit page and can fill missing fields

**AC-2.7**: Given I call `/api/systems/completion-stats/?org=1`, When API responds, Then I receive only systems from organization 1 with their completion percentages

### Technical Considerations

**Backend Calculation**:
- Create utility function: `calculate_system_completion(system: System) -> dict`
- Function should:
  1. Get all field values from system object
  2. Check which conditional requirements apply (has_cicd, etc.)
  3. Count filled vs total required
  4. Return: `{ completion_percentage, filled_fields, total_required_fields, incomplete_fields }`
- Cache calculation results? (Consider if system table is large)

**Frontend Display**:
- Create new component: `SystemCompletionTable.tsx`
- Use Ant Design Table with expandable rows
- Use Progress component for visual bars
- Implement client-side filtering and sorting (or server-side pagination if data is large)

**Performance**:
- If many systems (>1000), implement pagination
- Consider caching completion stats (refresh every 5-10 minutes)
- Use database indexes on org, status, completion_percentage fields

**Data Integrity**:
- What if system is created before validation rules were added? (Some old systems may have missing required fields)
- Solution: Show completion % based on current validation rules, allow bulk edit to fix old data

---

## 🧪 Phase 5: Testing Plan

### Testing Approach: Vibe Testing Agent (Browser Automation)

**Tool**: Playwright MCP (same as used for pagination fix)

#### Test Scenario 1: Tab Navigation Blocking
```
Test: Verify required field validation blocks tab navigation
Steps:
1. Navigate to /systems/create
2. Leave all fields empty on Tab 1
3. Click Tab 2
Expected: Tab does not switch, error notification displayed
```

#### Test Scenario 2: Backward Navigation Allowed
```
Test: Verify backward navigation is not blocked
Steps:
1. Navigate to /systems/create
2. Fill all required fields in Tab 1
3. Switch to Tab 2
4. Click Tab 1 (backward)
Expected: Tab switches without validation
```

#### Test Scenario 3: Conditional Validation
```
Test: Verify conditional required fields are validated
Steps:
1. Navigate to /systems/create
2. Fill Tab 1-2 required fields
3. On Tab 3, check "CI/CD Pipeline" checkbox
4. Leave cicd_tool empty
5. Click Tab 4
Expected: Tab navigation blocked, cicd_tool highlighted
```

#### Test Scenario 4: Dashboard System Count
```
Test: Verify dashboard shows organization system counts
Steps:
1. Login as admin
2. Navigate to /dashboard
3. Check "Thống kê theo đơn vị" section
Expected: See list of organizations with system counts
```

#### Test Scenario 5: System Completion Percentage
```
Test: Verify completion % is displayed correctly
Steps:
1. Login as admin
2. Navigate to system list page
3. Check completion % column
Expected: See percentages and progress bars for each system
```

#### Test Scenario 6: Completion Filter
```
Test: Verify filtering by completion range works
Steps:
1. Navigate to system list page
2. Select filter "0-25%"
3. Check displayed systems
Expected: Only systems with 0-25% completion shown
```

---

## 📁 Files to Create/Modify

### Frontend

**Create**:
- `frontend/src/components/SystemCompletionTable.tsx` - Completion stats table component
- `frontend/src/pages/SystemCompletionList.tsx` - Full page for system list with completion
- `frontend/src/hooks/useTabValidation.ts` - Custom hook for tab validation logic (optional)

**Modify**:
- `frontend/src/pages/SystemCreate.tsx` - Add tab navigation blocking
- `frontend/src/pages/SystemEdit.tsx` - Add tab navigation blocking
- `frontend/src/pages/Dashboard.tsx` - Add organization stats section
- `frontend/src/pages/OrganizationDashboard.tsx` - Add completion stats card
- `frontend/src/utils/systemValidationRules.ts` - Export field count calculation helper (optional)

### Backend

**Create**:
- `backend/apps/systems/utils/completion_calculator.py` - Completion % calculation logic
- `backend/apps/systems/views.py` - Add `CompletionStatsView` or `@action` in SystemViewSet

**Modify**:
- `backend/apps/systems/serializers.py` - Add `completion_percentage` field to SystemSerializer
- `backend/apps/systems/urls.py` - Add route for completion stats endpoint

---

## 🎯 Success Metrics

### Feature 1: Tab Navigation Blocking
- ✅ 100% of required fields must be filled before tab navigation
- ✅ 0 form submissions with incomplete tabs (after feature release)
- ✅ User feedback: "Clear validation errors helped me complete the form"

### Feature 2: Dashboard Statistics
- ✅ Admins can see completion % for all systems
- ✅ Org users can see completion % for their systems
- ✅ Data quality improves: Average completion % increases from baseline to 90%+ within 3 months
- ✅ User feedback: "Easy to identify which systems need more data"

---

## 📝 Notes

- **Baseline Completion %**: Need to run initial calculation to establish baseline before feature release
- **Migration**: May need data migration to backfill completion % for existing systems
- **Monitoring**: Add analytics to track completion % trends over time
- **Notifications**: Future enhancement - send email reminders to org users when completion % is low

---

**Next Steps**: Move to Phase 2 (Design) to create technical specifications and API contracts.
