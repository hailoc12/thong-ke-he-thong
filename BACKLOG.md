# Product Backlog - Thống Kê Hệ Thống

**Ngày tạo:** 2026-01-16
**Phiên bản:** 1.0
**Người tạo:** Claude Code AI Agent

---

## Executive Summary

Sau khi phân tích code và test UI, đã xác định được:

### ✅ Features đã có (Implemented)
1. **Authentication** - Login/Register ✅
2. **Dashboard** - Statistics overview ✅
3. **Tạo Đơn vị** (Add Organization) ✅
4. **Tạo Hệ thống** (Add System with wizard) ✅
5. **Danh sách Đơn vị** (Organizations list) ✅
6. **Danh sách Hệ thống** (Systems list) ✅

### ❌ Features còn thiếu (Missing)

**Backend API đã có đầy đủ**, nhưng **Frontend UI chưa implement**:

1. **System Detail** (Xem hệ thống) - Buttons có nhưng không làm gì
2. **System Edit** (Sửa hệ thống) - Buttons có nhưng không làm gì
3. **Organization Detail** (Xem đơn vị) - Buttons có nhưng không làm gì
4. **Organization Edit** (Sửa đơn vị) - Buttons có nhưng không làm gì
5. **User Management** - Quản lý tài khoản user (hoàn toàn thiếu)
6. **User Profile** - Thông tin cá nhân (menu có nhưng chưa có trang)

---

## Code Analysis Results

### Frontend Structure (Current)
```
frontend/src/pages/
├── Dashboard.tsx          ✅ Implemented
├── Login.tsx              ✅ Implemented
├── Register.tsx           ✅ Implemented
├── Systems.tsx            ✅ List only (View/Edit buttons dummy)
├── SystemCreate.tsx       ✅ Wizard fully working
├── Organizations.tsx      ✅ List only (View/Edit buttons dummy)
├── [MISSING] SystemDetail.tsx
├── [MISSING] SystemEdit.tsx
├── [MISSING] OrganizationDetail.tsx
├── [MISSING] OrganizationEdit.tsx
├── [MISSING] Users.tsx
├── [MISSING] UserCreate.tsx
├── [MISSING] UserEdit.tsx
└── [MISSING] Profile.tsx
```

### Backend API (Available)
```
✅ GET    /api/organizations/          (List)
✅ POST   /api/organizations/          (Create)
✅ GET    /api/organizations/{id}/     (Retrieve)
✅ PUT    /api/organizations/{id}/     (Update)
✅ PATCH  /api/organizations/{id}/     (Partial Update)
✅ DELETE /api/organizations/{id}/     (Delete)

✅ GET    /api/systems/                (List)
✅ POST   /api/systems/                (Create)
✅ GET    /api/systems/{id}/           (Retrieve)
✅ PUT    /api/systems/{id}/           (Update)
✅ PATCH  /api/systems/{id}/           (Partial Update)
✅ DELETE /api/systems/{id}/           (Delete)
✅ GET    /api/systems/statistics/     (Dashboard stats)

✅ GET    /api/users/                  (List users)
✅ POST   /api/users/register/         (Create user)
✅ GET    /api/users/me/               (Current user profile)
```

### Routes Missing in App.tsx
```typescript
// Current routes
<Route path="systems" element={<Systems />} />
<Route path="systems/create" element={<SystemCreate />} />
<Route path="organizations" element={<Organizations />} />

// Need to add:
<Route path="systems/:id" element={<SystemDetail />} />
<Route path="systems/:id/edit" element={<SystemEdit />} />
<Route path="organizations/:id" element={<OrganizationDetail />} />
<Route path="organizations/:id/edit" element={<OrganizationEdit />} />
<Route path="users" element={<Users />} />
<Route path="users/create" element={<UserCreate />} />
<Route path="users/:id/edit" element={<UserEdit />} />
<Route path="profile" element={<Profile />} />
```

---

## Prioritized Backlog

### Priority Legend
- **P0** - Critical (blocking users)
- **P1** - High (important for usability)
- **P2** - Medium (nice to have)
- **P3** - Low (future enhancement)

---

## P0 - Critical Features (Must Have Immediately)

### 1. System Detail Page (Xem hệ thống)
**Priority:** P0
**Status:** Not Started
**Effort:** 4 hours
**Dependencies:** None

**Description:**
Khi user click nút "Xem" ở bảng Systems, mở trang detail hiển thị đầy đủ thông tin hệ thống (read-only).

**User Story:**
> Là một quản trị viên, tôi muốn xem chi tiết thông tin của một hệ thống để hiểu rõ cấu hình và trạng thái hiện tại.

**Acceptance Criteria:**
- [ ] Click "Xem" button navigate to `/systems/{id}`
- [ ] Display all system information in read-only format
- [ ] Show all 6 sections (for Level 1) or 10 sections (for Level 2)
- [ ] Include "Sửa" button to go to edit page
- [ ] Include "Quay lại" button to go back to list
- [ ] Handle 404 if system not found
- [ ] Show loading state while fetching data

**Technical Tasks:**
1. Create `frontend/src/pages/SystemDetail.tsx`
2. Update `Systems.tsx`: Add onClick to "Xem" button → `navigate(/systems/${record.id})`
3. Add route in `App.tsx`: `<Route path="systems/:id" element={<SystemDetail />} />`
4. Fetch data: `GET /api/systems/{id}/`
5. Display data in Ant Design Descriptions/Card components
6. Add breadcrumb navigation
7. Style similar to SystemCreate but read-only

---

### 2. Organization Detail Page (Xem đơn vị)
**Priority:** P0
**Status:** Not Started
**Effort:** 2 hours
**Dependencies:** None

**Description:**
Khi user click nút "Xem" ở bảng Organizations, mở trang detail hiển thị thông tin đơn vị.

**User Story:**
> Là một quản trị viên, tôi muốn xem chi tiết thông tin của một đơn vị để biết thông tin liên hệ và số hệ thống liên quan.

**Acceptance Criteria:**
- [ ] Click "Xem" button navigate to `/organizations/{id}`
- [ ] Display organization info (code, name, description, contact, email, phone)
- [ ] Show list of systems belonging to this organization
- [ ] Include "Sửa" button to go to edit page
- [ ] Include "Quay lại" button
- [ ] Handle 404 if not found

**Technical Tasks:**
1. Create `frontend/src/pages/OrganizationDetail.tsx`
2. Update `Organizations.tsx`: Add onClick to "Xem" button
3. Add route in `App.tsx`
4. Fetch data: `GET /api/organizations/{id}/`
5. Display in Ant Design Card/Descriptions
6. List related systems in a table

---

### 3. System Edit Page (Sửa hệ thống)
**Priority:** P0
**Status:** Not Started
**Effort:** 6 hours
**Dependencies:** System Detail Page

**Description:**
Cho phép chỉnh sửa thông tin hệ thống đã tồn tại, sử dụng lại wizard từ SystemCreate.

**User Story:**
> Là một quản trị viên, tôi muốn cập nhật thông tin hệ thống khi có thay đổi về cấu hình, trạng thái, hoặc thông tin kỹ thuật.

**Acceptance Criteria:**
- [ ] Click "Sửa" button navigate to `/systems/{id}/edit`
- [ ] Reuse SystemCreate wizard component
- [ ] Pre-fill all existing data
- [ ] Save changes: `PATCH /api/systems/{id}/`
- [ ] Show success message and redirect to detail page
- [ ] Validate all required fields
- [ ] Handle update errors

**Technical Tasks:**
1. Create `frontend/src/pages/SystemEdit.tsx`
2. Refactor SystemCreate to support edit mode (add `mode` prop)
3. Fetch existing data: `GET /api/systems/{id}/`
4. Pre-populate form fields with fetched data
5. Change submit button from "Tạo mới" to "Cập nhật"
6. Update API call from POST to PATCH
7. Add route in `App.tsx`
8. Update "Sửa" button in Systems.tsx and SystemDetail.tsx

---

### 4. Organization Edit Page (Sửa đơn vị)
**Priority:** P0
**Status:** Not Started
**Effort:** 3 hours
**Dependencies:** Organization Detail Page

**Description:**
Cho phép chỉnh sửa thông tin đơn vị.

**User Story:**
> Là một quản trị viên, tôi muốn cập nhật thông tin liên hệ hoặc mô tả của đơn vị khi có thay đổi.

**Acceptance Criteria:**
- [ ] Click "Sửa" button navigate to `/organizations/{id}/edit`
- [ ] Show modal or dedicated page with form
- [ ] Pre-fill existing data
- [ ] Save changes: `PATCH /api/organizations/{id}/`
- [ ] Success message and redirect
- [ ] Validation for required fields

**Technical Tasks:**
1. Create `frontend/src/pages/OrganizationEdit.tsx`
2. Fetch data: `GET /api/organizations/{id}/`
3. Render form similar to create modal
4. Submit: `PATCH /api/organizations/{id}/`
5. Add route
6. Update "Sửa" button handlers

---

## P1 - High Priority Features

### 5. User Management Page (Quản lý người dùng)
**Priority:** P1
**Status:** Not Started
**Effort:** 8 hours
**Dependencies:** None

**Description:**
Trang quản lý danh sách user, thêm user mới, chỉnh sửa, vô hiệu hóa user.

**User Story:**
> Là một quản trị viên, tôi muốn quản lý tài khoản người dùng để kiểm soát ai có quyền truy cập hệ thống.

**Acceptance Criteria:**
- [ ] Add "Người dùng" menu item in sidebar
- [ ] Display users table with columns: username, email, full name, role, status, actions
- [ ] Search users by name/email
- [ ] "Thêm người dùng" button opens create form
- [ ] "Sửa" button for each user
- [ ] "Vô hiệu hóa" button to deactivate users
- [ ] Pagination support

**Technical Tasks:**
1. Create `frontend/src/pages/Users.tsx`
2. API: `GET /api/users/` for list
3. Table with search functionality
4. Add menu item in Layout.tsx sidebar
5. Add route in App.tsx
6. Create UserCreate modal/page
7. Create UserEdit modal/page
8. Implement activate/deactivate user

**API Endpoints Needed:**
```
GET    /api/users/                    ✅ Already exists
POST   /api/users/register/           ✅ Already exists (adapt for admin)
PATCH  /api/users/{id}/               ❌ Need to add
DELETE /api/users/{id}/               ❌ Need to add (or deactivate)
```

---

### 6. User Profile Page (Thông tin cá nhân)
**Priority:** P1
**Status:** Not Started
**Effort:** 3 hours
**Dependencies:** None

**Description:**
Trang hiển thị và chỉnh sửa thông tin cá nhân của user đang login.

**User Story:**
> Là một người dùng, tôi muốn xem và cập nhật thông tin cá nhân như email, tên hiển thị, và đổi mật khẩu.

**Acceptance Criteria:**
- [ ] Click "Thông tin cá nhân" in user dropdown navigate to `/profile`
- [ ] Display current user info (username, email, full name)
- [ ] Allow edit email and full name
- [ ] "Đổi mật khẩu" section with old/new password fields
- [ ] Save changes: `PATCH /api/users/me/`
- [ ] Success notification

**Technical Tasks:**
1. Create `frontend/src/pages/Profile.tsx`
2. Fetch: `GET /api/users/me/`
3. Form with editable fields
4. Update: `PATCH /api/users/me/`
5. Add route in App.tsx
6. Update "Thông tin cá nhân" menu item onClick

---

## P2 - Medium Priority Features

### 7. Delete System Feature
**Priority:** P2
**Status:** Not Started
**Effort:** 2 hours
**Dependencies:** System Detail Page

**Description:**
Cho phép xóa hệ thống với confirmation dialog.

**Acceptance Criteria:**
- [ ] "Xóa" button in SystemDetail page
- [ ] Confirmation modal with warning message
- [ ] Delete: `DELETE /api/systems/{id}/`
- [ ] Redirect to systems list after delete
- [ ] Show success message

---

### 8. Delete Organization Feature
**Priority:** P2
**Status:** Not Started
**Effort:** 2 hours
**Dependencies:** Organization Detail Page

**Description:**
Cho phép xóa đơn vị (nếu không có hệ thống nào thuộc đơn vị đó).

**Acceptance Criteria:**
- [ ] "Xóa" button in OrganizationDetail page
- [ ] Check if org has systems → show warning if yes
- [ ] Confirmation modal
- [ ] Delete: `DELETE /api/organizations/{id}/`
- [ ] Success message

---

### 9. Advanced Search & Filters
**Priority:** P2
**Status:** Not Started
**Effort:** 4 hours
**Dependencies:** None

**Description:**
Tìm kiếm nâng cao cho Systems và Organizations.

**Features:**
- [ ] Filter systems by: status, importance, organization, date range
- [ ] Filter organizations by: number of systems
- [ ] Export search results to Excel/CSV
- [ ] Save search filters

---

### 10. File Attachments Management
**Priority:** P2
**Status:** Not Started
**Effort:** 5 hours
**Dependencies:** System Detail/Edit

**Description:**
Quản lý file đính kèm cho hệ thống (tài liệu kỹ thuật, sơ đồ kiến trúc, etc.).

**Backend API:**
```
✅ AttachmentViewSet already exists
GET    /api/attachments/
POST   /api/attachments/
DELETE /api/attachments/{id}/
```

**Features:**
- [ ] Upload files in SystemEdit page
- [ ] View/download attachments in SystemDetail
- [ ] Delete attachments
- [ ] File type restrictions (PDF, DOCX, PNG, etc.)
- [ ] File size limit (10MB)

---

## P3 - Low Priority (Future Enhancements)

### 11. Activity Log / Audit Trail
**Priority:** P3
**Effort:** 8 hours

Track all changes to systems and organizations (who changed what, when).

---

### 12. Email Notifications
**Priority:** P3
**Effort:** 6 hours

Send notifications when:
- New system created
- System status changed
- System approaching end of life

---

### 13. Dashboard Charts & Analytics
**Priority:** P3
**Effort:** 6 hours

Enhanced dashboard with:
- System status pie chart
- Trend analysis
- Monthly/yearly statistics
- Export reports to PDF

---

### 14. Bulk Operations
**Priority:** P3
**Effort:** 5 hours

- Bulk update system status
- Bulk assign organization
- Bulk export to Excel

---

### 15. UI/UX Improvements - Giao diện đẹp & hiện đại hơn
**Priority:** P1
**Status:** Not Started
**Effort:** 6 hours

**Description:**
Cải thiện giao diện tổng thể cho đẹp mắt, hiện đại, professional hơn.

**User Story:**
> Là một người dùng, tôi muốn giao diện hệ thống đẹp, hiện đại, dễ nhìn để có trải nghiệm làm việc tốt hơn.

**Improvements:**
- [ ] **Color Scheme:** Update màu sắc chủ đạo sang tone xanh dương/xanh lá chuyên nghiệp
- [ ] **Typography:** Sử dụng font Inter hoặc Be Vietnam Pro cho tiếng Việt
- [ ] **Spacing:** Tăng khoảng trắng giữa các elements (padding, margin)
- [ ] **Cards:** Bo tròn góc cards (border-radius: 12px), shadow mềm mại hơn
- [ ] **Icons:** Đổi sang icon set hiện đại (Lucide React hoặc Heroicons)
- [ ] **Buttons:** Gradient buttons cho primary actions, smooth hover effects
- [ ] **Tables:** Alternating row colors, hover effects, sticky headers
- [ ] **Dashboard Cards:** Gradient backgrounds, animated counters, icons lớn hơn
- [ ] **Forms:** Floating labels, better focus states, inline validation
- [ ] **Sidebar:** Modern vertical navigation với icons rõ ràng hơn
- [ ] **Breadcrumbs:** Add breadcrumbs navigation ở mọi trang
- [ ] **Empty States:** Design empty state illustrations thay vì text trống
- [ ] **Loading States:** Skeleton loaders thay vì spinners đơn giản
- [ ] **Animations:** Smooth page transitions, hover effects, micro-interactions

**Design References:**
- Tailwind UI components
- Ant Design Pro layouts
- Vercel Dashboard design
- Linear app design

**Technical Tasks:**
1. Create custom theme config in `src/theme/`
2. Update Ant Design ConfigProvider with custom theme
3. Add CSS modules or Tailwind CSS
4. Update all pages with new styling
5. Add animation library (Framer Motion)
6. Create design system documentation

---

### 16. Mobile-Responsive Design (Thân thiện với Mobile)
**Priority:** P1
**Status:** Not Started
**Effort:** 8 hours

**Description:**
Tối ưu toàn bộ giao diện cho mobile devices (phones, tablets).

**User Story:**
> Là một người dùng mobile, tôi muốn sử dụng hệ thống trên điện thoại một cách dễ dàng mà không bị lỗi giao diện.

**Requirements:**
- [ ] **Responsive Breakpoints:**
  - Mobile: < 640px
  - Tablet: 640px - 1024px
  - Desktop: > 1024px

- [ ] **Sidebar Navigation:**
  - Collapse to hamburger menu on mobile
  - Full-screen overlay menu
  - Swipe to open/close

- [ ] **Tables:**
  - Horizontal scroll on mobile
  - Or convert to card layout
  - Sticky first column

- [ ] **Forms:**
  - Full-width inputs on mobile
  - Larger touch targets (min 44x44px)
  - Bottom sheet modals instead of centered
  - Mobile-optimized date pickers

- [ ] **Dashboard Cards:**
  - Stack vertically on mobile
  - 2 columns on tablet
  - 4 columns on desktop

- [ ] **Wizard (SystemCreate):**
  - Vertical stepper on mobile
  - Progress bar instead of steps
  - One field per row

- [ ] **Action Buttons:**
  - Floating action button (FAB) for "Thêm mới"
  - Bottom action bar for forms on mobile
  - Larger tap targets

- [ ] **Typography:**
  - Scale font sizes for mobile (16px minimum for body text)
  - Readable line heights

- [ ] **Images & Icons:**
  - Responsive images with srcset
  - SVG icons that scale properly

**Testing Checklist:**
- [ ] Test on iPhone SE (smallest screen)
- [ ] Test on iPhone 14 Pro
- [ ] Test on iPad
- [ ] Test on Android phones
- [ ] Test landscape orientation
- [ ] Test with touch gestures
- [ ] No horizontal scroll issues
- [ ] All buttons reachable with thumb

**Technical Tasks:**
1. Add responsive CSS media queries
2. Use Ant Design Grid system (Row/Col)
3. Update all pages for mobile layout
4. Add responsive sidebar component
5. Test on real devices
6. Use Chrome DevTools responsive mode
7. Add viewport meta tag if missing
8. Implement touch-friendly interactions

---

### 17. Role-Based Access Control (RBAC)
**Priority:** P3
**Effort:** 10 hours

Different permissions for:
- Admin (full access)
- Manager (view + edit own org's systems)
- Viewer (read-only)

---

## Implementation Roadmap

### Sprint 1 (Week 1) - Core CRUD Features
**Goal:** Hoàn thiện các tính năng View và Edit cơ bản

**Tasks:**
1. ✅ Day 1-2: System Detail Page (P0-1)
2. ✅ Day 2-3: Organization Detail Page (P0-2)
3. ✅ Day 3-4: System Edit Page (P0-3)
4. ✅ Day 4-5: Organization Edit Page (P0-4)

**Deliverables:**
- Users can view full system details
- Users can view organization details
- Users can edit existing systems
- Users can edit existing organizations

---

### Sprint 2 (Week 2) - User Management
**Goal:** Implement quản lý người dùng

**Tasks:**
1. ✅ Day 1-3: User Management Page (P1-5)
2. ✅ Day 3-4: User Profile Page (P1-6)
3. ✅ Day 4-5: User Create/Edit features

**Deliverables:**
- Admin can manage users
- Users can update their profile
- Password change functionality

---

### Sprint 3 (Week 3) - Enhancements
**Goal:** Additional features và polish

**Tasks:**
1. Delete features (P2-7, P2-8)
2. Advanced search (P2-9)
3. File attachments (P2-10)

---

## Technical Debt & Code Quality

### Refactoring Opportunities
1. **Extract shared components:**
   - `<SystemForm>` component (shared by Create/Edit)
   - `<OrganizationForm>` component
   - `<ConfirmDeleteModal>` component

2. **API Service Layer:**
   - Create `src/services/api.ts` with typed API calls
   - Use React Query or SWR for data fetching
   - Centralize error handling

3. **Type Safety:**
   - Define TypeScript interfaces for all entities
   - Create `src/types/` directory

4. **Testing:**
   - Add unit tests for components
   - Add integration tests for forms
   - Add E2E tests for critical flows

---

## Acceptance Criteria for "Done"

For each feature to be considered complete:

- [ ] Code implemented and working locally
- [ ] Manual testing passed (all acceptance criteria met)
- [ ] Code reviewed (self-review minimum)
- [ ] Deployed to staging/production
- [ ] Documentation updated (if needed)
- [ ] No console errors
- [ ] Responsive design (works on mobile)
- [ ] Loading states implemented
- [ ] Error handling implemented
- [ ] Success messages shown

---

## Next Steps

1. **Review backlog** with stakeholders
2. **Confirm priorities** - Are P0 tasks correct?
3. **Start Sprint 1** - Begin with System Detail Page
4. **Daily progress** - Update backlog status daily

---

**Created by:** Claude Code AI Agent
**Last Updated:** 2026-01-16 16:45 UTC
**Status:** Ready for Implementation
