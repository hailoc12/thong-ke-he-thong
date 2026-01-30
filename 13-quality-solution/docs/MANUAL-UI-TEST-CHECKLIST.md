# ✅ Manual UI Test Checklist - "Other" Option Fix

**Ngày:** 2026-01-27
**Mục đích:** Kiểm tra thực tế trên giao diện web rằng các trường đã chấp nhận giá trị "Khác"

---

## 📋 Danh Sách Kiểm Tra Nhanh

### Tab 1: Thông Tin Chung (General)

#### ☐ Test 1: Hosting Platform
- **Vị trí:** Tab "Thông tin chung"
- **Trường:** "Hosting Platform"
- **Kiểm tra:**
  - [ ] Dropdown có option "Khác"?
  - [ ] Chọn được "Khác"?
  - [ ] Lưu form thành công?
  - [ ] Không có lỗi validation?

---

### Tab 2: Kiến Trúc (Architecture)

#### ☐ Test 2: Database Model
- **Vị trí:** Tab "Kiến trúc"
- **Trường:** "Database Model"
- **Kiểm tra:**
  - [ ] Dropdown có option "Khác"?
  - [ ] Chọn được "Khác"?
  - [ ] Lưu form thành công?
  - [ ] Không có lỗi validation?

#### ☐ Test 3: Mobile App
- **Vị trí:** Tab "Kiến trúc"
- **Trường:** "Mobile App"
- **Kiểm tra:**
  - [ ] Dropdown có option "Khác"?
  - [ ] Chọn được "Khác"?
  - [ ] Lưu form thành công?
  - [ ] Không có lỗi validation?

---

### Tab 3: Vận Hành (Operations)

#### ☐ Test 4: Development Type
- **Vị trí:** Tab "Vận hành"
- **Trường:** "Loại phát triển" / "Development Type"
- **Kiểm tra:**
  - [ ] Dropdown có option "Khác"?
  - [ ] Chọn được "Khác"?
  - [ ] Lưu form thành công?
  - [ ] Không có lỗi validation?

#### ☐ Test 5: Warranty Status
- **Vị trí:** Tab "Vận hành"
- **Trường:** "Tình trạng bảo hành" / "Warranty Status"
- **Kiểm tra:**
  - [ ] Dropdown có option "Khác"?
  - [ ] Chọn được "Khác"?
  - [ ] Lưu form thành công?
  - [ ] Không có lỗi validation?

#### ☐ Test 6: Vendor Dependency
- **Vị trí:** Tab "Vận hành"
- **Trường:** "Phụ thuộc nhà cung cấp" / "Vendor Dependency"
- **Kiểm tra:**
  - [ ] Dropdown có option "Khác"?
  - [ ] Chọn được "Khác"?
  - [ ] Lưu form thành công?
  - [ ] Không có lỗi validation?

#### ☐ Test 7: Deployment Location
- **Vị trí:** Tab "Vận hành"
- **Trường:** "Vị trí triển khai" / "Deployment Location"
- **Kiểm tra:**
  - [ ] Dropdown có option "Khác"?
  - [ ] Chọn được "Khác"?
  - [ ] Lưu form thành công?
  - [ ] Không có lỗi validation?

#### ☐ Test 8: Compute Type
- **Vị trí:** Tab "Vận hành"
- **Trường:** "Loại compute" / "Compute Type"
- **Kiểm tra:**
  - [ ] Dropdown có option "Khác"?
  - [ ] Chọn được "Khác"?
  - [ ] Lưu form thành công?
  - [ ] Không có lỗi validation?

---

## 🎯 Kết Quả Mong Đợi

### ✅ Thành Công Khi:
- Tất cả 8 dropdown đều có option "Khác"
- Có thể chọn "Khác" ở tất cả các trường
- Form lưu thành công không có lỗi
- Dữ liệu được lưu và hiển thị lại đúng khi edit

### ❌ Thất Bại Khi:
- Thiếu option "Khác" trong dropdown
- Không chọn được "Khác"
- Lỗi validation: "other is not valid choice"
- Form không lưu được

---

## 📝 Ghi Chú Khi Test

**Hệ thống test:** ______________________
**Người test:** ______________________
**Ngày test:** ______________________

### Vấn Đề Phát Hiện (nếu có):
```
_____________________________________________________________
_____________________________________________________________
_____________________________________________________________
```

### Screenshot (nếu có):
```
_____________________________________________________________
```

---

## 🚀 Hướng Dẫn Test Nhanh

1. **Đăng nhập** vào hệ thống
2. **Tạo hệ thống mới** hoặc **chỉnh sửa hệ thống có sẵn**
3. **Điền thông tin cơ bản** (tên, phạm vi, tổ chức)
4. **Lần lượt test 8 trường theo checklist trên**
5. **Tick vào checkbox** khi pass
6. **Ghi chú** nếu có vấn đề
7. **Xóa hệ thống test** sau khi hoàn thành

---

## ✅ Kết Luận

Sau khi test xong, đánh dấu:

- [ ] **Tất cả 8 trường đều PASS**
- [ ] **Có vấn đề** (ghi rõ ở phần "Vấn Đề Phát Hiện")

**Chữ ký người test:** ______________________

---

## 📞 Liên Hệ Khi Có Vấn Đề

1. **Kiểm tra backend logs:**
   ```bash
   docker compose logs backend | tail -50
   ```

2. **Kiểm tra migration đã chạy chưa:**
   ```bash
   docker compose exec backend python manage.py showmigrations systems | grep 0024
   ```
   Phải thấy: `[X] 0024_add_other_option_to_choices`

3. **Restart lại backend nếu cần:**
   ```bash
   docker compose restart backend
   ```

4. **Clear browser cache:**
   - Ctrl + Shift + R (Windows)
   - Cmd + Shift + R (Mac)
