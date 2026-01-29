# SPEC: Thêm Field "Thời gian đưa vào vận hành" vào Tab Cơ bản

## Tóm tắt

Thêm checkbox "Đã đưa vào sử dụng?" và field "Thời gian đưa vào vận hành" vào tab Cơ bản của System Create/Edit form với conditional required logic.

## Yêu cầu

| Aspect | Requirement |
|--------|-------------|
| Checkbox | "Đã đưa vào sử dụng?" - mặc định **ON** |
| Date field | "Thời gian đưa vào vận hành" |
| Logic | Checkbox ON → Date field **required** (cả Create & Edit) |
| Logic | Checkbox OFF → Date field không required, có thể để trống |
| Vị trí | Tab "Cơ bản" (Tab 1) |
| Backend | Thêm field `is_go_live` (Boolean, default=True, nullable cho data cũ) |
| Backend | `go_live_date` giữ nguyên null=True (chấp nhận null cho hệ thống cũ) |

---

## Phân tích hiện trạng

### Backend
- **File:** `backend/apps/systems/models.py:281`
- **Field date đã có:** `go_live_date = models.DateField(null=True, blank=True)`
- **Field checkbox:** ❌ **CHƯA CÓ** - Cần thêm `is_go_live`

### Frontend
- **Date conversion đã có:** `SystemEdit.tsx:1574` → Đã có trong `dateFields` array
- **Format for API đã có:** `SystemEdit.tsx:862` → Đã có trong `formatDateFieldsForAPI`
- **UI Component:** ❌ **CHƯA CÓ** - Cả checkbox và date field đều chưa render

---

## Danh sách công việc

### 1. Backend - Model
**File:** `backend/apps/systems/models.py`

| Task | Mô tả |
|------|-------|
| 1.1 | Thêm field `is_go_live = models.BooleanField(default=True)` |
| 1.2 | Đặt gần field `go_live_date` để dễ quản lý |

**Code thêm vào (sau line 281):**
```python
is_go_live = models.BooleanField(default=True, verbose_name=_('Is Go Live'))
```

### 2. Backend - Migration
| Task | Mô tả |
|------|-------|
| 2.1 | Chạy `python manage.py makemigrations` |
| 2.2 | Chạy `python manage.py migrate` |
| 2.3 | Hệ thống cũ sẽ có `is_go_live=True` (default) |

### 3. Frontend - SystemCreate.tsx
**File:** `frontend/src/pages/SystemCreate.tsx`

| Task | Mô tả |
|------|-------|
| 3.1 | Thêm state `isGoLive` với default `true` |
| 3.2 | Thêm Checkbox "Đã đưa vào sử dụng?" |
| 3.3 | Thêm DatePicker "Thời gian đưa vào vận hành" |
| 3.4 | Conditional required: nếu checkbox ON → date required |
| 3.5 | Đặt sau field `target_completion_date` |

**Code mẫu:**
```tsx
// State
const [isGoLive, setIsGoLive] = useState(true);

// JSX - Checkbox
<Form.Item
  name="is_go_live"
  valuePropName="checked"
  initialValue={true}
>
  <Checkbox onChange={(e) => setIsGoLive(e.target.checked)}>
    Đã đưa vào sử dụng?
  </Checkbox>
</Form.Item>

// JSX - DatePicker (conditional required)
<Form.Item
  label="Thời gian đưa vào vận hành"
  name="go_live_date"
  rules={isGoLive ? [{ required: true, message: 'Vui lòng chọn thời gian đưa vào vận hành' }] : []}
  tooltip="Thời điểm hệ thống chính thức đưa vào vận hành"
>
  <DatePicker
    placeholder="Chọn ngày"
    format="DD/MM/YYYY"
    style={{ width: '100%' }}
    disabled={!isGoLive}
  />
</Form.Item>
```

### 4. Frontend - SystemEdit.tsx
**File:** `frontend/src/pages/SystemEdit.tsx`

| Task | Mô tả |
|------|-------|
| 4.1 | Thêm state `isGoLive` |
| 4.2 | Init state từ data load (từ API response) |
| 4.3 | Thêm Checkbox "Đã đưa vào sử dụng?" |
| 4.4 | Thêm DatePicker "Thời gian đưa vào vận hành" |
| 4.5 | Conditional required: nếu checkbox ON → date required |

**Code mẫu:**
```tsx
// State
const [isGoLive, setIsGoLive] = useState(true);

// Trong useEffect load data, set state từ API
useEffect(() => {
  if (systemData) {
    setIsGoLive(systemData.is_go_live ?? true);
  }
}, [systemData]);

// JSX giống SystemCreate
```

### 5. Frontend - Validation Logic
| Task | Mô tả |
|------|-------|
| 5.1 | Khi submit, nếu `is_go_live=true` và `go_live_date` trống → báo lỗi |
| 5.2 | Khi submit, nếu `is_go_live=false` → clear `go_live_date` (set null) |

---

## Checklist triển khai

### Backend
- [ ] **1.1** Thêm field `is_go_live` vào model System
- [ ] **2.1** Chạy makemigrations
- [ ] **2.2** Chạy migrate

### Frontend - SystemCreate.tsx
- [ ] **3.1** Thêm state `isGoLive`
- [ ] **3.2** Thêm Checkbox với `initialValue={true}`
- [ ] **3.3** Thêm DatePicker
- [ ] **3.4** Implement conditional required logic

### Frontend - SystemEdit.tsx
- [ ] **4.1** Thêm state `isGoLive`
- [ ] **4.2** Init state từ API data
- [ ] **4.3** Thêm Checkbox
- [ ] **4.4** Thêm DatePicker
- [ ] **4.5** Implement conditional required logic

### Testing
- [ ] **Test 1** Create: Checkbox ON + date trống → Báo lỗi required
- [ ] **Test 2** Create: Checkbox ON + date nhập → Lưu OK
- [ ] **Test 3** Create: Checkbox OFF + date trống → Lưu OK
- [ ] **Test 4** Edit: Checkbox ON + date trống → Báo lỗi required
- [ ] **Test 5** Edit: Toggle checkbox OFF → Date field disabled, có thể lưu
- [ ] **Test 6** Verify hệ thống cũ có `is_go_live=true` sau migrate

---

## UI Layout

```
┌─────────────────────────────────────────────────────────┐
│ Tab: Cơ bản                                             │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ Thời gian mong muốn hoàn thành: [____MM/YYYY____]       │
│                                                         │
│ ☑ Đã đưa vào sử dụng?                                   │
│                                                         │
│ Thời gian đưa vào vận hành: [____DD/MM/YYYY____] *      │
│ (* required khi checkbox checked)                       │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## Ghi chú kỹ thuật

1. **Date format:**
   - Display: `DD/MM/YYYY`
   - API: `YYYY-MM-DD` (ISO 8601)

2. **Default values:**
   - `is_go_live`: `true` (default ON)
   - `go_live_date`: `null` (cho hệ thống cũ chưa có data)

3. **Behavior khi toggle checkbox:**
   - ON → Enable date picker, required
   - OFF → Disable date picker, không required, clear value khi submit

4. **Migration safety:**
   - `is_go_live` default=True → Hệ thống cũ sẽ tự động có is_go_live=True
   - `go_live_date` đã null=True → An toàn cho data cũ

---

## Ước lượng

- **Số file cần sửa:** 3 files (models.py, SystemCreate.tsx, SystemEdit.tsx)
- **Migration:** 1 migration (add is_go_live field)
- **Risk level:** Thấp (thêm field mới với default, không ảnh hưởng data cũ)
