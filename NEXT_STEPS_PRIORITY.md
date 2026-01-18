# NEXT STEPS - PRIORITY BACKLOG

**Updated**: 2026-01-17
**Status**: Ready for Implementation

---

## ✅ COMPLETED (P0 Features)
- ✅ P0-1: System Detail Page
- ✅ P0-2: Organization Detail Page
- ✅ P0-3: System Edit Page
- ✅ P0-4: Organization Edit Page

**Result:** All must-have CRUD features complete and deployed to production!

---

## 🎯 NEXT PRIORITIES (User Requested)

Based on user requirements from 2026-01-17:

### **TOP 3 CRITICAL FEATURES**

#### 1. **P0.5: Multi-Tenancy & Organization User Management** ⭐⭐⭐
**Priority**: HIGHEST (Critical for production use)
**Estimate**: 12 hours (2 working days)
**File**: `08-backlog-plan/todo/P0.5-multi-tenancy-org-users.md`

**User Request:**
> "đặc biệt là feature quản lý cấp phát tài khoản các đơn vị + cho phép các đơn vị login & bổ sung thêm hệ thống của đơn vị mình"

**What it does:**
- Admin có thể tạo tài khoản cho từng đơn vị
- Mỗi đơn vị có user riêng để login
- User của đơn vị chỉ thấy và quản lý hệ thống của đơn vị mình
- Role-based access control (Admin vs Org User)

**Why it's critical:**
- Hiện tại chỉ có 1 admin account → Không scale được
- Các đơn vị không thể tự quản lý hệ thống của mình
- Security risk: Tất cả dùng chung 1 account

---

#### 2. **P1: Mobile-Responsive Design** ⭐⭐
**Priority**: HIGH
**Estimate**: 8 hours (1 working day)
**File**: See BACKLOG.md #16

**User Request:**
> "va feature mobile friendly, de co the thao tac va view duoc tot tren mobile brwoser"

**What it does:**
- Responsive breakpoints (mobile < 640px, tablet 640-1024px, desktop > 1024px)
- Hamburger menu for mobile
- Tables convert to cards on mobile
- Touch-friendly buttons (44x44px minimum)
- Bottom action bars for forms
- Works perfectly on iPhone, Android, iPad

**Why it's important:**
- Nhiều user sẽ truy cập từ điện thoại
- Hiện tại giao diện chỉ tốt trên desktop
- Mobile traffic chiếm 40-60% usage

---

#### 3. **P1: UI/UX Modernization** ⭐⭐
**Priority**: HIGH
**Estimate**: 6 hours (1 working day)
**File**: See BACKLOG.md #15

**User Request:**
> "va improve giao dien nhien cho hien dai, chuyen nghiep nua"

**What it does:**
- Modern color scheme (blue/green professional tones)
- Better typography (Inter or Be Vietnam Pro font)
- Improved spacing and padding
- Rounded corners on cards (12px border-radius)
- Gradient buttons for primary actions
- Smooth hover effects and animations
- Better empty states and loading states
- Modern icons (Lucide React)

**Why it's important:**
- First impression matters
- Professional look increases trust
- Better UX = higher productivity

---

#### 4. **P1: Remember Me Feature** ⭐
**Priority**: MEDIUM
**Estimate**: 2 hours
**File**: `08-backlog-plan/todo/P1-remember-me-feature.md`

**User Request** (earlier):
> "add them tinh nang luu mat khau vao backlog xong trien khai de khong phai moi lan vao deu phai nhap password nhe"

**What it does:**
- "Ghi nhớ đăng nhập" checkbox on login form
- Auto-login when returning to site
- Token stored for 30 days
- No need to re-enter password every time

---

## 📋 IMPLEMENTATION ORDER

### **PHASE 1: Core Multi-Tenancy (Week 1)** 🎯
**Focus**: Enable multiple organizations to use the system

**Day 1-2: Backend Multi-Tenancy**
- [ ] Update User model (add role, organization fields)
- [ ] Create permissions (IsAdmin, IsOrgUserOrAdmin)
- [ ] Update System/Organization ViewSets with filtering
- [ ] Create User Management API
- [ ] Add User serializers
- [ ] Update Login response with user role/org info
- [ ] Run migrations
- [ ] Test API with Postman

**Day 3-4: Frontend Multi-Tenancy**
- [ ] Create auth store with user role tracking
- [ ] Update Login handler
- [ ] Conditional sidebar menu (hide Orgs/Users for org_user)
- [ ] Hide organization field in SystemCreate for org_user
- [ ] Create Users management page
- [ ] Add Users route
- [ ] Test data isolation

**Deliverable:**
✅ Admin can create org users
✅ Org users can login and only see their data
✅ Full RBAC working

---

### **PHASE 2: Mobile-Responsive (Week 2)** 📱
**Focus**: Make the system work perfectly on mobile

**Day 1: Layout & Navigation**
- [ ] Add responsive breakpoints
- [ ] Hamburger menu for mobile
- [ ] Collapsible sidebar
- [ ] Mobile-friendly header

**Day 2: Tables & Forms**
- [ ] Tables → Card layout on mobile
- [ ] Full-width form inputs on mobile
- [ ] Larger touch targets (44x44px)
- [ ] Bottom action bars for forms
- [ ] Mobile date pickers

**Day 3: Dashboard & Polish**
- [ ] Stack dashboard cards vertically on mobile
- [ ] Test on real devices (iPhone, Android, iPad)
- [ ] Fix any scroll/overflow issues
- [ ] Test touch gestures

**Deliverable:**
✅ Perfect mobile experience
✅ No horizontal scroll
✅ All functions work on mobile

---

### **PHASE 3: UI/UX Modernization (Week 2-3)** 🎨
**Focus**: Make it beautiful and professional

**Day 1: Design System**
- [ ] Define color palette (primary, secondary, accent)
- [ ] Update Ant Design theme config
- [ ] Add Be Vietnam Pro font
- [ ] Update spacing variables

**Day 2: Components**
- [ ] Modernize cards (rounded corners, shadows)
- [ ] Gradient buttons for primary actions
- [ ] Smooth hover effects
- [ ] Better icons (Lucide React)

**Day 3: Pages & Animations**
- [ ] Update all pages with new design
- [ ] Add skeleton loaders
- [ ] Empty state illustrations
- [ ] Micro-interactions (Framer Motion)

**Deliverable:**
✅ Modern, professional UI
✅ Consistent design language
✅ Smooth animations

---

### **PHASE 4: Remember Me (Week 3)** 🔐
**Focus**: Convenience feature

**Tasks:**
- [ ] Add checkbox to login form
- [ ] Update backend JWT settings
- [ ] localStorage vs sessionStorage logic
- [ ] Auto-login on app load
- [ ] Update logout to clear both storages

**Deliverable:**
✅ Users can stay logged in
✅ Auto-login working

---

## 🎯 QUICK START: IMPLEMENTING P0.5 NOW

Since you requested implementation, I'll start with **P0.5: Multi-Tenancy** immediately.

**Step 1: Backend Changes** (Starting now)
1. Update User model
2. Create permissions
3. Update ViewSets
4. Create User management API

**Step 2: Frontend Changes**
1. Auth store
2. User management page
3. Conditional UI

**Step 3: Testing**
1. Create sample org users
2. Test data isolation
3. Verify security

---

## 📊 SUMMARY

| Priority | Feature | Estimate | Impact |
|----------|---------|----------|--------|
| P0.5 | Multi-Tenancy & Org Users | 12h | 🔥 Critical |
| P1 | Mobile-Responsive | 8h | ⭐ High |
| P1 | UI/UX Modernization | 6h | ⭐ High |
| P1 | Remember Me | 2h | ✓ Medium |

**Total estimate**: ~28 hours (~4 working days)

---

## ✅ SUCCESS CRITERIA

**After all features complete:**
- [ ] Multiple organizations can use the system independently
- [ ] Each org has their own users and data
- [ ] Perfect mobile experience (no bugs on phones/tablets)
- [ ] Modern, professional UI
- [ ] Convenient auto-login feature
- [ ] Fully tested and deployed to production

---

**Next Action**: Start implementing P0.5 Multi-Tenancy (Backend first)

**Command to begin:**
```
Bắt đầu implement P0.5: Multi-Tenancy & Organization User Management
```
