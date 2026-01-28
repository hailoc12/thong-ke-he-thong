# SPEC: Thêm Field "Thời gian đưa vào vận hành" vào Tab Cơ bản

## Tóm tắt

Thêm field "Thời gian đưa vào vận hành" vào tab Cơ bản của System Create/Edit form.

## Yêu cầu

| Aspect | Requirement |
|--------|-------------|
| Tên field | Thời gian đưa vào vận hành |
| Vị trí | Tab "Cơ bản" (Tab 1) |
| Frontend | **Required** khi edit (bắt buộc nhập) |
| Backend | **Không required** (null=True), default null cho hệ thống cũ |

## Phân tích hiện trạng

### Backend (Đã có sẵn)
- **File:** `backend/apps/systems/models.py:281`
- **Field:** `go_live_date = models.DateField(null=True, blank=True, verbose_name=_('Go Live Date'))`
- **Status:** ✅ Đã tồn tại, đã `null=True, blank=True` → Đáp ứng yêu cầu

### Frontend (Cần thêm UI)
- **Validation rule đã có:** `systemValidationRules.ts:57` → `go_live_date: [createRequiredRule('Vui lòng chọn ngày đưa vào vận hành')]`
- **Date conversion đã có:** `SystemEdit.tsx:1574` → Đã có trong `dateFields` array
- **Format for API đã có:** `SystemEdit.tsx:862` → Đã có trong `formatDateFieldsForAPI`
- **UI Component:** ❌ **CHƯA CÓ** - Field không được render trong form

---

## Danh sách công việc

### 1. Backend - Không cần thay đổi ✅
- Field `go_live_date` đã có với `null=True, blank=True`
- Serializer đã handle field này (auto-include trong ModelSerializer)
- Không cần migration

### 2. Frontend - SystemCreate.tsx
**File:** `frontend/src/pages/SystemCreate.tsx`

| Task | Mô tả |
|------|-------|
| 2.1 | Thêm Form.Item cho "Thời gian đưa vào vận hành" vào Tab 1 |
| 2.2 | Đặt sau field "Thời gian mong muốn hoàn thành" (`target_completion_date`) |
| 2.3 | Sử dụng DatePicker với format `DD/MM/YYYY` (full date, không chỉ month) |
| 2.4 | **Không required** trong Create form (hệ thống mới có thể chưa go-live) |

**Code mẫu:**
```tsx
<Form.Item
  label="Thời gian đưa vào vận hành"
  name="go_live_date"
  tooltip="Thời điểm hệ thống chính thức đưa vào vận hành"
>
  <DatePicker
    placeholder="Chọn ngày"
    format="DD/MM/YYYY"
    style={{ width: '100%' }}
  />
</Form.Item>
```

### 3. Frontend - SystemEdit.tsx
**File:** `frontend/src/pages/SystemEdit.tsx`

| Task | Mô tả |
|------|-------|
| 3.1 | Thêm Form.Item cho "Thời gian đưa vào vận hành" vào Tab 1 |
| 3.2 | Đặt sau field "Thời gian mong muốn hoàn thành" |
| 3.3 | **Required** trong Edit form (bắt buộc nhập khi edit) |
| 3.4 | Verify date conversion đã hoạt động (đã có sẵn trong code) |

**Code mẫu:**
```tsx
<Form.Item
  label="Thời gian đưa vào vận hành"
  name="go_live_date"
  rules={[{ required: true, message: 'Vui lòng chọn thời gian đưa vào vận hành' }]}
  tooltip="Thời điểm hệ thống chính thức đưa vào vận hành"
>
  <DatePicker
    placeholder="Chọn ngày"
    format="DD/MM/YYYY"
    style={{ width: '100%' }}
  />
</Form.Item>
```

### 4. Frontend - systemValidationRules.ts
**File:** `frontend/src/utils/systemValidationRules.ts`

| Task | Mô tả |
|------|-------|
| 4.1 | Verify rule `go_live_date` đã có (đã có sẵn ở line 57) |
| 4.2 | Không cần thay đổi |

---

## Checklist triển khai

- [ ] **2.1** SystemCreate.tsx: Thêm Form.Item cho `go_live_date` trong Tab 1
- [ ] **2.2** SystemCreate.tsx: Đặt sau `target_completion_date`
- [ ] **2.3** SystemCreate.tsx: Sử dụng DatePicker full date (DD/MM/YYYY)
- [ ] **3.1** SystemEdit.tsx: Thêm Form.Item cho `go_live_date` trong Tab 1
- [ ] **3.2** SystemEdit.tsx: Đặt sau `target_completion_date`
- [ ] **3.3** SystemEdit.tsx: Set `required: true`
- [ ] **Test** Create mới system, để trống go_live_date → Phải thành công
- [ ] **Test** Edit system, để trống go_live_date → Phải báo lỗi required
- [ ] **Test** Edit system, nhập go_live_date → Phải lưu thành công

---

## Ghi chú kỹ thuật

1. **Date format:**
   - Display: `DD/MM/YYYY` (format người dùng nhìn thấy)
   - API: `YYYY-MM-DD` (ISO 8601, tự động convert qua `formatDateFieldsForAPI`)

2. **So sánh với `target_completion_date`:**
   - `target_completion_date`: Dùng month picker (`picker="month"`, format `MM/YYYY`)
   - `go_live_date`: Dùng full date picker (format `DD/MM/YYYY`)

3. **Lý do không required ở Create:**
   - Khi tạo mới hệ thống, có thể chưa xác định được ngày go-live
   - Chỉ bắt buộc khi edit (hệ thống đã tồn tại nên cần có thông tin này)

---

## Ước lượng

- **Số file cần sửa:** 2 files (SystemCreate.tsx, SystemEdit.tsx)
- **Số dòng code:** ~20-30 dòng mỗi file
- **Risk level:** Thấp (thêm UI component, không thay đổi logic backend)
