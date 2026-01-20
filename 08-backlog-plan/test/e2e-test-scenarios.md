# E2E Test Scenarios - Hệ thống Thống kê Hệ thống

**Production URL**: https://thongkehethong.mindmaid.ai
**Test Date**: 2026-01-20
**Test Tool**: Playwright MCP

---

## Vai trò 1: Admin Hệ thống

### Scenario 1.1: Login Admin & Xem Dashboard Tổng thể

**Mục đích**: Kiểm tra luồng đăng nhập admin và dashboard hiển thị đúng

**Steps**:
1. Truy cập https://thongkehethong.mindmaid.ai
2. Login với tài khoản admin (username: admin)
3. Verify dashboard hiển thị:
   - Tổng số hệ thống
   - Tổng số đơn vị
   - Các thống kê tổng thể
4. Kiểm tra navigation menu hiển thị đầy đủ:
   - Dashboard (/)
   - Hệ thống (/systems)
   - Đơn vị (/organizations)
   - Người dùng (/users)

**Expected Results**:
- ✅ Login thành công
- ✅ Dashboard hiển thị đầy đủ thống kê
- ✅ Navigation menu có đủ 4 mục
- ✅ Admin có quyền xem tất cả

---

### Scenario 1.2: Admin Quản lý Đơn vị

**Mục đích**: Kiểm tra admin có thể tạo/sửa/xóa đơn vị

**Steps**:
1. Login admin
2. Vào trang "Đơn vị" (/organizations)
3. Click "Tạo đơn vị mới"
4. Nhập thông tin:
   - Tên đơn vị: "Sở KH&CN Hà Nội - Test"
   - Mã đơn vị: "TEST_HN_001"
   - Cấp: "province"
5. Click "Lưu"
6. Verify đơn vị xuất hiện trong danh sách
7. Click "Sửa" đơn vị vừa tạo
8. Đổi tên thành "Sở KH&CN Hà Nội - Test Updated"
9. Click "Lưu"
10. Verify tên đã cập nhật
11. Click "Xóa" đơn vị test
12. Confirm xóa
13. Verify đơn vị đã bị xóa

**Expected Results**:
- ✅ Tạo đơn vị thành công
- ✅ Sửa đơn vị thành công
- ✅ Xóa đơn vị thành công
- ✅ Cascade warning hiển thị khi xóa

---

### Scenario 1.3: Admin Quản lý Người dùng

**Mục đích**: Kiểm tra admin có thể tạo/sửa/xóa user

**Steps**:
1. Login admin
2. Vào trang "Người dùng" (/users)
3. Click "Tạo người dùng"
4. Nhập thông tin:
   - Username: "testuser_e2e"
   - Email: "testuser@example.com"
   - Password: "Test@12345"
   - Vai trò: "unit_user"
   - Đơn vị: Select đơn vị bất kỳ
5. Click "Lưu"
6. Verify user xuất hiện trong danh sách
7. Click "Sửa" user vừa tạo
8. Đổi email thành "testuser_updated@example.com"
9. Click "Lưu"
10. Click "Xóa" user test
11. Verify user đã bị xóa

**Expected Results**:
- ✅ Tạo user thành công
- ✅ Sửa user thành công
- ✅ Xóa user thành công
- ✅ Password được hash

---

### Scenario 1.4: Admin Xem Tất cả Hệ thống

**Mục đích**: Kiểm tra admin thấy hệ thống của tất cả đơn vị

**Steps**:
1. Login admin
2. Vào trang "Hệ thống" (/systems)
3. Verify danh sách hiển thị hệ thống từ nhiều đơn vị
4. Kiểm tra filter theo đơn vị hoạt động
5. Click xem chi tiết 1 hệ thống
6. Verify hiển thị đầy đủ 9 tabs
7. Kiểm tra nút "Sửa" hiển thị

**Expected Results**:
- ✅ Admin xem được tất cả hệ thống
- ✅ Filter hoạt động
- ✅ Chi tiết hiển thị đầy đủ
- ✅ Admin có quyền edit

---

## Vai trò 2: Kỹ thuật Đơn vị (unit_user)

### Scenario 2.1: Login Unit User & Xem Unit Dashboard

**Mục đích**: Kiểm tra user đơn vị login và thấy dashboard riêng

**Steps**:
1. Logout (nếu đang login admin)
2. Login với tài khoản unit_user
3. Verify redirect tới Unit Dashboard (/unit-dashboard)
4. Kiểm tra dashboard hiển thị:
   - Tên đơn vị của user
   - Tổng số hệ thống của đơn vị
   - Tiến độ tổng thể (%)
   - Hệ thống chưa hoàn thành
5. Verify navigation menu CHỈ có:
   - Dashboard (/unit-dashboard)
   - Hệ thống (/systems)
6. Verify KHÔNG thấy menu "Đơn vị" và "Người dùng"

**Expected Results**:
- ✅ Login thành công
- ✅ Redirect đúng trang
- ✅ Dashboard hiển thị đúng data của đơn vị
- ✅ Menu giới hạn phù hợp vai trò
- ✅ Không có permission vào admin pages

---

### Scenario 2.2: Unit User Tạo Hệ thống Mới (Tab-by-Tab Save)

**Mục đích**: Kiểm tra P1 Tab Navigation Save Flow

**Steps**:
1. Login unit_user
2. Vào "Hệ thống" → Click "Tạo hệ thống"
3. **Tab 1 - Thông tin cơ bản**:
   - Nhập "Tên hệ thống": "Hệ thống Test E2E"
   - Nhập "Mã hệ thống": "E2E_TEST_001"
   - Chọn "Nhóm hệ thống": "Khác" → Nhập "Nhóm custom"
   - Click "Lưu & Tiếp tục"
   - **Verify**: Toast "Đã lưu thông tin!" xuất hiện
   - **Verify**: Tự động chuyển sang Tab 2

4. **Tab 2 - Mục tiêu và đối tượng**:
   - Check "Loại người dùng": "Cán bộ nội bộ"
   - Check "Mục tiêu kinh doanh": "Số hóa quy trình nghiệp vụ"
   - Click "Lưu & Tiếp tục"
   - **Verify**: Chuyển sang Tab 3

5. **Tab 3 - Công nghệ**:
   - Chọn "Ngôn ngữ lập trình": "Python"
   - Chọn "Framework": "Django"
   - Chọn "Database": "PostgreSQL"
   - Click "Lưu & Tiếp tục"
   - **Verify**: Chuyển sang Tab 4

6. **Test Navigation Guard**:
   - Ở Tab 4, nhập "Loại dữ liệu": "Dữ liệu cá nhân"
   - KHÔNG click "Lưu"
   - Click trực tiếp vào Tab 6
   - **Verify**: Warning modal xuất hiện với message: "Bạn cần hoàn thiện nhập thông tin ở tab hiện tại..."
   - **Verify**: 3 nút: "Ở lại tab hiện tại", "Tiếp tục (không lưu)", "Lưu & Tiếp tục"
   - Click "Lưu & Tiếp tục"
   - **Verify**: Tab 4 được lưu và chuyển sang Tab 6

7. **Tab 5-8**: Nhập thông tin tối thiểu, click "Lưu & Tiếp tục"

8. **Tab 9 - Đánh giá**:
   - Nhập "Điểm mạnh": "Hệ thống test"
   - Nhập "Hạn chế": "Chưa có"
   - **Verify**: Nút hiển thị là "Lưu hệ thống" (KHÔNG phải "Lưu & Tiếp tục")
   - Click "Lưu hệ thống"
   - **Verify**: Toast "Tạo hệ thống thành công!"
   - **Verify**: Redirect về /systems

9. **Verify Draft Save**:
   - Tạo hệ thống mới
   - Tab 1: Nhập thông tin, click "Lưu" (KHÔNG click "Lưu & Tiếp tục")
   - Click "Hủy"
   - Quay lại danh sách hệ thống
   - **Verify**: Hệ thống vừa lưu draft xuất hiện trong danh sách

**Expected Results**:
- ✅ Tab navigation flow hoạt động đúng
- ✅ "Lưu & Tiếp tục" lưu và chuyển tab
- ✅ "Lưu" chỉ lưu, không chuyển tab
- ✅ Navigation guard hoạt động
- ✅ Warning modal hiển thị đúng
- ✅ Tab 9 hiển thị "Lưu hệ thống"
- ✅ Draft save hoạt động
- ✅ Final save thành công

---

### Scenario 2.3: Unit User Sửa Hệ thống (Tab Save Flow)

**Mục đích**: Kiểm tra edit mode tab save flow

**Steps**:
1. Login unit_user
2. Vào danh sách hệ thống
3. Click "Sửa" hệ thống vừa tạo
4. **Verify**: Form pre-fill đúng data
5. Chuyển sang Tab 3
6. Đổi "Framework" thành "Flask"
7. Click "Lưu" (stay on tab)
8. **Verify**: Toast "Đã lưu thông tin!"
9. **Verify**: Vẫn ở Tab 3
10. Click "Lưu & Tiếp tục"
11. **Verify**: Chuyển sang Tab 4
12. Tab 9: Click "Lưu hệ thống"
13. **Verify**: Toast "Cập nhật hệ thống thành công!"
14. **Verify**: Redirect về /systems

**Expected Results**:
- ✅ Edit form pre-fill đúng
- ✅ "Lưu" hoạt động (stay on tab)
- ✅ "Lưu & Tiếp tục" hoạt động
- ✅ Final update thành công

---

### Scenario 2.4: Unit User Không Xem Được Hệ thống Đơn vị Khác

**Mục đích**: Kiểm tra data isolation

**Steps**:
1. Login unit_user (ví dụ: thuộc "Sở KH&CN Hà Nội")
2. Vào danh sách hệ thống
3. **Verify**: CHỈ thấy hệ thống của đơn vị mình
4. **Verify**: KHÔNG thấy hệ thống của đơn vị khác
5. Thử truy cập trực tiếp URL hệ thống của đơn vị khác (nếu biết ID)
6. **Verify**: 403 Forbidden hoặc redirect

**Expected Results**:
- ✅ User chỉ thấy data của đơn vị mình
- ✅ Backend enforce permission
- ✅ Không thể bypass bằng direct URL

---

### Scenario 2.5: Unit User Xem Progress Dashboard

**Mục đích**: Kiểm tra Unit Dashboard cập nhật đúng

**Steps**:
1. Login unit_user
2. Vào Unit Dashboard
3. **Verify**: Tiến độ tổng thể tính đúng (completion_percentage)
4. **Verify**: Số hệ thống hoàn thành vs chưa hoàn thành đúng
5. **Verify**: Bảng danh sách hệ thống hiển thị
6. **Verify**: Progress bar màu sắc đúng:
   - ≥100%: Xanh (success)
   - ≥70%: Xanh dương (primary)
   - ≥50%: Vàng (warning)
   - <50%: Đỏ (error)
7. **Verify**: KHÔNG có NaN% hiển thị

**Expected Results**:
- ✅ Dashboard tính toán đúng
- ✅ Progress bar màu sắc đúng
- ✅ Không có bug NaN%
- ✅ Real-time update

---

## Cross-Cutting Scenarios

### Scenario 3.1: Tab Multi-Row Display

**Mục đích**: Kiểm tra tab không bị horizontal scroll

**Steps**:
1. Login (admin hoặc unit_user)
2. Vào trang tạo/sửa hệ thống
3. Resize browser window về 1024px width
4. **Verify**: 9 tabs hiển thị trên nhiều rows
5. **Verify**: KHÔNG có horizontal scroll
6. **Verify**: Tất cả tabs đều click được

**Expected Results**:
- ✅ Tabs wrap to multiple rows
- ✅ No horizontal scroll
- ✅ All tabs accessible

---

### Scenario 3.2: Multi-Select Fields

**Mục đích**: Kiểm tra 18 fields đã convert sang multi-select

**Steps**:
1. Vào form tạo hệ thống
2. **Tab 3 - Công nghệ**:
   - Verify "Ngôn ngữ lập trình" là multi-select
   - Verify "Framework" là multi-select
   - Verify "Database" là multi-select
   - Select nhiều giá trị (e.g., Python + JavaScript)
   - **Verify**: Hiển thị tags
3. **Tab 4 - Dữ liệu**:
   - Verify "Nguồn dữ liệu" là multi-select
4. Lưu hệ thống
5. Edit lại
6. **Verify**: Multi-select values pre-fill đúng

**Expected Results**:
- ✅ 18 fields là multi-select
- ✅ Select nhiều giá trị hoạt động
- ✅ Pre-fill đúng khi edit

---

### Scenario 3.3: Responsive Design

**Mục đích**: Kiểm tra responsive trên mobile/tablet

**Steps**:
1. Login
2. Resize browser: 375px (mobile), 768px (tablet), 1920px (desktop)
3. Test các trang:
   - Dashboard
   - Danh sách hệ thống
   - Form tạo/sửa
4. **Verify**: UI không bị vỡ
5. **Verify**: Navigation menu responsive
6. **Verify**: Tables có horizontal scroll khi cần

**Expected Results**:
- ✅ Mobile friendly
- ✅ Tablet friendly
- ✅ Desktop optimal

---

## Bug Tracking

### Bugs Found During Testing:
(Will be updated during test execution)

| ID | Scenario | Description | Severity | Status |
|----|----------|-------------|----------|--------|
| BUG-001 | TBD | TBD | P0 | Open |

---

## Test Execution Log

**Test Run 1**: 2026-01-20
- Tester: Playwright MCP
- Environment: Production (https://thongkehethong.mindmaid.ai)
- Browser: Chromium

Results: TBD
