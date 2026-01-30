# Missing Required Field Markers - Production Audit Report

**Date:** 2026-01-23
**URL:** https://hientrangcds.mst.gov.vn/systems/create
**Source Code:** `/frontend/src/pages/SystemCreate.tsx`

## Executive Summary

- **Total Form Fields:** 100
- **Fields WITH required marker (*):** 72
- **Fields WITHOUT required marker (*):** 28

## Analysis Method

Since the production form enforces validation and prevents navigation between tabs without completing required fields, this audit was performed through source code analysis of `SystemCreate.tsx`. Fields were identified as "missing required marker" if they lack the `rules={AllValidationRules.xxx}` prop, which triggers the asterisk (*) display and validation.

---

## Tab 1: Cơ bản ✅

**Status:** All fields have required markers

All 11 fields in this tab properly have `rules={AllValidationRules.xxx}`:
- ✅ Tổ chức
- ✅ Tên hệ thống
- ✅ Tên tiếng Anh
- ✅ Mô tả
- ✅ Trạng thái
- ✅ Mức độ quan trọng
- ✅ Phạm vi sử dụng
- ✅ Nhu cầu
- ✅ Thời gian mong muốn hoàn thành
- ✅ Nhóm hệ thống
- ✅ Ghi chú bổ sung

---

## Tab 2: Nghiệp vụ ❌

**Missing Required Markers:** 7 fields

### Fields WITHOUT required (*):

1. **Có đủ hồ sơ phân tích thiết kế?**
   - Field name: `has_design_documents`
   - Type: Switch (Boolean)
   - Line: 1578

2. **Số lượng người dùng hàng năm**
   - Field name: `annual_users`
   - Type: InputNumber
   - Line: 1603

3. **Tổng số tài khoản**
   - Field name: `total_accounts`
   - Type: InputNumber
   - Line: 1621

4. **MAU (Monthly Active Users)**
   - Field name: `users_mau`
   - Type: InputNumber
   - Line: 1636

5. **DAU (Daily Active Users)**
   - Field name: `users_dau`
   - Type: InputNumber
   - Line: 1651

6. **Số đơn vị/địa phương sử dụng**
   - Field name: `num_organizations`
   - Type: InputNumber
   - Line: 1666

7. **Ghi chú bổ sung**
   - Field name: `additional_notes_tab2`
   - Type: TextArea
   - Line: 1682

---

## Tab 3: Công nghệ ❌

**Missing Required Markers:** 8 fields

### Fields WITHOUT required (*):

1. **Container hóa**
   - Field name: `containerization`
   - Type: SelectWithOther
   - Line: 1822

2. **API Style**
   - Field name: `api_style`
   - Type: SelectWithOther
   - Line: 1859

3. **Messaging/Queue**
   - Field name: `messaging_queue`
   - Type: SelectWithOther
   - Line: 1873

4. **Cache System**
   - Field name: `cache_system`
   - Type: Input
   - Line: 1887

5. **Search Engine**
   - Field name: `search_engine`
   - Type: Input
   - Line: 1896

6. **Reporting/BI Tool**
   - Field name: `reporting_bi_tool`
   - Type: Input
   - Line: 1905

7. **Source Repository**
   - Field name: `source_repository`
   - Type: Input
   - Line: 1914

8. **Ghi chú bổ sung**
   - Field name: `additional_notes_tab3`
   - Type: TextArea
   - Line: 1961

---

## Tab 4: Dữ liệu ❌

**Missing Required Markers:** 4 fields

### Fields WITHOUT required (*):

1. **Loại lưu trữ file**
   - Field name: `file_storage_type`
   - Type: Select
   - Line: 2108

2. **Số bản ghi**
   - Field name: `record_count`
   - Type: InputNumber
   - Line: 2122

3. **CSDL phụ/khác**
   - Field name: `secondary_databases`
   - Type: Select (mode="tags")
   - Line: 2133

4. **Ghi chú bổ sung**
   - Field name: `additional_notes_tab4`
   - Type: TextArea
   - Line: 2228

---

## Tab 5: Tích hợp ❌

**Missing Required Markers:** 9 fields

### Fields WITHOUT required (*):

1. **Chuẩn API**
   - Field name: `api_standard`
   - Type: SelectWithOther
   - Line: 2293

2. **Ghi chú bổ sung** (Tab 5)
   - Field name: `additional_notes_tab5`
   - Type: TextArea
   - Line: 2456

3. **Ghi chú bổ sung** (Tab 6)
   - Field name: `additional_notes_tab6`
   - Type: TextArea
   - Line: 2557

4. **Ghi chú bổ sung** (Tab 7)
   - Field name: `additional_notes_tab7`
   - Type: TextArea
   - Line: 2689

5. **Ghi chú bổ sung** (Tab 8)
   - Field name: `additional_notes_tab8`
   - Type: TextArea
   - Line: 2759

### Dynamic API List Fields (within modal):

6. **Xử lý lỗi/Retry** (in API list item editor)
   - Field name: `error_handling`
   - Type: TextArea
   - Line: 698, 811

7. **Có tài liệu API?** (in API list item editor)
   - Field name: `has_api_docs`
   - Type: Switch
   - Line: 706, 819

8. **Ghi chú** (in API list item editor)
   - Field name: `notes`
   - Type: TextArea
   - Line: 711, 824

**Note:** The dynamic API list fields appear twice because there are two instances of the API list component (one for viewing, one for editing).

---

## Tab 6: Bảo mật ✅

**Status:** All fields have required markers

All fields in this tab properly have `rules={AllValidationRules.xxx}`.

---

## Tab 7: Hạ tầng ✅

**Status:** All fields have required markers

All fields in this tab properly have `rules={AllValidationRules.xxx}`.

---

## Tab 8: Vận hành ✅

**Status:** All fields have required markers

All fields in this tab properly have `rules={AllValidationRules.xxx}`.

---

## Tab 9: Đánh giá ✅

**Status:** All fields have required markers

All fields in this tab properly have `rules={AllValidationRules.xxx}`.

---

## Action Required

### Files to Modify:

1. **`/frontend/src/pages/SystemCreate.tsx`**
   - Add `rules={AllValidationRules.xxx}` prop to 28 Form.Item components

2. **`/frontend/src/utils/systemValidationRules.ts`**
   - Add validation rule definitions for the 28 missing fields

### Implementation Steps:

1. **Step 1:** Define validation rules in `systemValidationRules.ts`:
   ```typescript
   // Tab 2 - Nghiệp vụ
   has_design_documents: [{ required: true, message: 'Vui lòng chọn' }],
   annual_users: [{ required: true, message: 'Vui lòng nhập số lượng người dùng hàng năm' }],
   total_accounts: [{ required: true, message: 'Vui lòng nhập tổng số tài khoản' }],
   users_mau: [{ required: true, message: 'Vui lòng nhập MAU' }],
   users_dau: [{ required: true, message: 'Vui lòng nhập DAU' }],
   num_organizations: [{ required: true, message: 'Vui lòng nhập số đơn vị/địa phương' }],
   additional_notes_tab2: [{ required: true, message: 'Vui lòng nhập ghi chú bổ sung' }],

   // Tab 3 - Công nghệ
   containerization: [{ required: true, message: 'Vui lòng chọn loại container hóa' }],
   api_style: [{ required: true, message: 'Vui lòng chọn API style' }],
   messaging_queue: [{ required: true, message: 'Vui lòng chọn messaging/queue' }],
   cache_system: [{ required: true, message: 'Vui lòng nhập cache system' }],
   search_engine: [{ required: true, message: 'Vui lòng nhập search engine' }],
   reporting_bi_tool: [{ required: true, message: 'Vui lòng nhập reporting/BI tool' }],
   source_repository: [{ required: true, message: 'Vui lòng nhập source repository' }],
   additional_notes_tab3: [{ required: true, message: 'Vui lòng nhập ghi chú bổ sung' }],

   // Tab 4 - Dữ liệu
   file_storage_type: [{ required: true, message: 'Vui lòng chọn loại lưu trữ file' }],
   record_count: [{ required: true, message: 'Vui lòng nhập số bản ghi' }],
   secondary_databases: [{ required: true, message: 'Vui lòng nhập CSDL phụ/khác' }],
   additional_notes_tab4: [{ required: true, message: 'Vui lòng nhập ghi chú bổ sung' }],

   // Tab 5 - Tích hợp
   api_standard: [{ required: true, message: 'Vui lòng chọn chuẩn API' }],
   additional_notes_tab5: [{ required: true, message: 'Vui lòng nhập ghi chú bổ sung' }],
   additional_notes_tab6: [{ required: true, message: 'Vui lòng nhập ghi chú bổ sung' }],
   additional_notes_tab7: [{ required: true, message: 'Vui lòng nhập ghi chú bổ sung' }],
   additional_notes_tab8: [{ required: true, message: 'Vui lòng nhập ghi chú bổ sung' }],

   // Dynamic API list fields
   error_handling: [{ required: true, message: 'Vui lòng nhập xử lý lỗi/retry' }],
   has_api_docs: [{ required: true, message: 'Vui lòng chọn' }],
   notes: [{ required: true, message: 'Vui lòng nhập ghi chú' }],
   ```

2. **Step 2:** Add `rules` prop to each Form.Item in `SystemCreate.tsx`:
   ```tsx
   // Example for Tab 2
   <Form.Item
     label="Số lượng người dùng hàng năm"
     name="annual_users"
     rules={AllValidationRules.annual_users}  // ADD THIS LINE
   >
     <InputNumber ... />
   </Form.Item>
   ```

3. **Step 3:** Test all tabs to ensure:
   - Required asterisks (*) appear
   - Validation messages display correctly
   - Form submission validates all fields

---

## Summary by Tab

| Tab | Name | Fields Missing Required | Status |
|-----|------|------------------------|--------|
| 1 | Cơ bản | 0 | ✅ Complete |
| 2 | Nghiệp vụ | 7 | ❌ Needs Fix |
| 3 | Công nghệ | 8 | ❌ Needs Fix |
| 4 | Dữ liệu | 4 | ❌ Needs Fix |
| 5 | Tích hợp | 9 | ❌ Needs Fix |
| 6 | Bảo mật | 0 | ✅ Complete |
| 7 | Hạ tầng | 0 | ✅ Complete |
| 8 | Vận hành | 0 | ✅ Complete |
| 9 | Đánh giá | 0 | ✅ Complete |

**Total:** 28 fields across 4 tabs need required marker implementation.

---

## Notes

1. **Tab Validation Logic:** The current code already prevents users from navigating to subsequent tabs without completing Tab 1 fields, which is working correctly.

2. **"Ghi chú bổ sung" Fields:** There appears to be a mapping issue where the "Ghi chú bổ sung" fields for Tabs 6, 7, and 8 are defined within the Tab 5 section. These should be verified during implementation.

3. **Dynamic API List:** The API list modal contains 3 additional fields that should also have required markers for consistency.

4. **Backend Validation:** After adding frontend validation, ensure backend models also enforce these fields as required if applicable.
