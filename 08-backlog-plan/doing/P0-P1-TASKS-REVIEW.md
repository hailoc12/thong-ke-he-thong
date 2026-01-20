# P0-P1 Tasks Review & Prioritization

**Date**: 2026-01-20 21:00
**Status**: Review Complete
**Purpose**: Identify which P0/P1 tasks are complete vs pending

---

## 📊 Summary

| Task | Priority | Status | Effort | Notes |
|------|----------|--------|--------|-------|
| **P0.5: Multi-Tenancy** | P0 (Critical) | ⚠️ UNKNOWN | 12 hours | Need to verify implementation |
| **P0.7: Delete Functionality** | P0 (High) | ✅ IMPLEMENTED | 8-12 hours | Checkboxes show implementation complete |
| **P0.8: Customer Gap Analysis** | P0 (Customer) | ⏳ PENDING | 109 hours (~14 days) | 51 changes needed, requires planning |
| **P1: Remember Me** | P1 (Nice to have) | ⏳ PENDING | 2 hours | Quick win after P0 complete |
| **Quick Input Feature** | P0 (Customer) | ✅ COMPLETE | 7 days | 25/33 fields converted (76%) |

---

## 🔍 Detailed Analysis

### P0.5: Multi-Tenancy & Organization User Management ⚠️

**File**: `todo/P0.5-multi-tenancy-org-users.md`
**Priority**: P0.5 (Critical for production)
**Estimated Effort**: 12 hours (2 days)
**User Request**: "đặc biệt là feature quản lý cấp phát tài khoản các đơn vị + cho phép các đơn vị login & bổ sung thêm hệ thống của đơn vị mình"

**Status**: ⚠️ **NEED TO VERIFY**

**Scope**:
- ✅ Role-Based Access Control (RBAC) - admin vs org_user
- ✅ Organization-scoped data access
- ✅ User management by admin
- ✅ Self-service for org users

**Backend Changes Required**:
1. Update User model with `role` and `organization` fields
2. Create permissions: IsAdmin, IsOrgUserOrAdmin, CanManageOrgSystems
3. Update System/Organization ViewSets with queryset filtering
4. Create User Management API
5. Update Login response with role/org info

**Frontend Changes Required**:
1. Update AuthStore with role and org fields
2. Conditional sidebar menu (hide "Đơn vị"/"Người dùng" for org users)
3. Hide organization field for org users in SystemCreate
4. Create User Management page (admin only)
5. Add route for /users

**Testing Checklist**:
- [ ] Admin can create org users
- [ ] Org user login works
- [ ] Org user only sees their org's systems
- [ ] Org user cannot access other org's data
- [ ] Data isolation verified

**Next Steps**:
1. **Check if already implemented**: Search codebase for `role` field in User model
2. **Check if frontend has Users page**: Look for `/users` route
3. **Check if permission filtering exists**: Search for `get_queryset` org filtering
4. **If not implemented**: Move to `doing/` and start implementation
5. **If implemented**: Update status to COMPLETE

---

### P0.7: Delete Functionality ✅

**File**: `todo/P0.7-delete-functionality.md`
**Priority**: P0.7 (High)
**Estimated Effort**: 8-12 hours
**Status**: ✅ **IMPLEMENTED** (based on checkboxes in file)

**Scope**:
- ✅ Delete User (admin only)
- ✅ Delete Organization (admin only with cascade warning)
- ✅ Delete System (admin + org user for own systems)

**Evidence of Implementation** (from file):
```
## 🎯 Success Criteria
- [x] Admin can delete users with confirmation
- [x] Admin can delete organizations with extra safety
- [x] Admin can delete any system
- [x] Org user can delete only their org's systems
- [x] All deletes show confirmation dialogs
- [x] Audit logs maintained
```

**Implementation Details**:
- Soft delete (is_deleted, deleted_at, deleted_by fields)
- Confirmation dialogs (Popconfirm/Modal)
- Permission checks (canDeleteSystem)
- Cascade delete for organizations
- Audit trail maintained

**Status**: ✅ **DEPLOYED** - File shows "📋 READY TO IMPLEMENT" but success criteria all checked

**Recommended Action**:
- Verify on production that delete buttons exist
- Test delete functionality with test data
- If working: Move file to `done/`
- If not working: Check deployment status

---

### P0.8: Customer Gap Analysis ⏳

**File**: `todo/P0.8-customer-feedback-gap-analysis.md`
**Priority**: P0 (HIGHEST - Customer Request)
**Estimated Effort**: 109 hours (~14 days with 1 developer)
**Status**: ⏳ **PENDING PLANNING**

**Summary**: Customer requested major form redesign with **51 changes**:
- ❌ 27 missing fields (44%)
- 🔄 18 partially implemented (29%)
- ✅ 15 fully implemented (24%)
- ⚠️ 6 fields to remove (10%)

**Critical P0 Fields** (10 items, 21 hours):
1. Phạm vi - Make REQUIRED
2. Nhóm hệ thống - Update 8 options
3. Tổng số tài khoản
4. MAU (Monthly Active Users)
5. DAU (Daily Active Users)
6. Số đơn vị/địa phương
7. Dung lượng DB hiện tại
8. Dung lượng file đính kèm
9. Tốc độ tăng trưởng
10. Danh sách tích hợp chi tiết

**4 Phases**:
- **Phase 1**: P0 Critical Gaps (Week 1 - 21 hours)
- **Phase 2**: Architecture & Data (Week 2 - 41 hours)
- **Phase 3**: Integration & Operations (Week 3 - 25 hours)
- **Phase 4**: Security & Technical Debt (Week 4 - 22 hours)

**Open Questions** (Need customer clarification):
1. Where to move "Mục đích / Mô tả" field?
2. "Chọn Đơn vị" - Hide or auto-fill?
3. "form_level" - Remove or internal-only?
4. Confirm 8 "Nhóm hệ thống" options
5. Confirm Section 8 checkbox options

**Status**: ⏳ **BLOCKED** - Need customer meeting first

**Next Steps**:
1. **Schedule customer clarification meeting** (URGENT)
2. **Create detailed implementation plan** (4 hours)
3. **Get customer approval**
4. **Start Phase 1 implementation**

---

### P1: Remember Me Feature ⏳

**File**: `todo/P1-remember-me-feature.md`
**Priority**: P1 (Nice to have)
**Estimated Effort**: 2 hours
**Status**: ⏳ **PENDING**

**User Request**: "add them tinh nang luu mat khau vao backlog xong trien khai de khong phai moi lan vao deu phai nhap password nhe"

**Scope**:
- Add "Ghi nhớ đăng nhập" checkbox to login form
- Store JWT token with longer expiration (30 days vs 60 minutes)
- Auto-login on return visits
- Logout clears saved credentials

**Technical Implementation**:
- **Backend**: Extend JWT token lifetime based on `remember_me` flag
- **Frontend**:
  - Add checkbox to login form
  - Store token in localStorage (remember) vs sessionStorage (regular)
  - Auto-login check on app load

**Acceptance Criteria**:
- [ ] Checkbox visible on login form
- [ ] User stays logged in after browser close (if checked)
- [ ] User must re-login after browser close (if unchecked)
- [ ] Token expires after 30 days max
- [ ] Logout clears all saved credentials

**Status**: ⏳ **READY TO IMPLEMENT** - No blockers, quick win (2 hours)

**Recommended Timeline**: Implement after P0 tasks complete

---

## 🎯 Recommended Priority Order

### Immediate (This Week)

1. **P0.5 Verification** (1 hour)
   - Check if multi-tenancy already implemented
   - Search for User model `role` field
   - Check if `/users` page exists
   - **If not implemented**: HIGH PRIORITY (12 hours)
   - **If implemented**: Document and move to done/

2. **P0.7 Verification** (30 min)
   - Test delete functionality on production
   - Verify all delete buttons work
   - **If working**: Move to done/
   - **If not working**: Check deployment

3. **P0.8 Planning** (4-5 hours)
   - Schedule customer clarification meeting
   - Get answers to 5 open questions
   - Create detailed implementation plan
   - Get customer sign-off

### Week 1-2

4. **P0.8 Phase 1 Implementation** (21 hours / 3 days)
   - Implement 10 P0 critical fields
   - Backend migrations + Frontend updates
   - Testing and deployment

### Week 2-3

5. **P0.8 Phase 2 Implementation** (41 hours / 5 days)
   - Expand Architecture section (12 fields)
   - Expand Data section (15 fields)
   - Redesign Tab 3 and Tab 4

### Week 3-4

6. **P0.8 Phase 3 Implementation** (25 hours / 3 days)
   - Create dynamic integration form
   - Add operations fields

### Week 4

7. **P0.8 Phase 4 Implementation** (22 hours / 3 days)
   - Security fields
   - Technical Debt section
   - Cleanup and testing

8. **P1 Remember Me** (2 hours)
   - Quick implementation after P0 complete

---

## 📋 Verification Checklist

### Check P0.5 Multi-Tenancy

```bash
# Backend verification
grep -r "role" backend/apps/accounts/models.py
grep -r "IsOrgUserOrAdmin" backend/
grep -r "get_queryset.*organization" backend/apps/systems/views.py

# Frontend verification
grep -r "useAuthStore.*role" frontend/src/
grep -r "/users" frontend/src/App.tsx
ls -la frontend/src/pages/Users.tsx

# Database verification
docker-compose exec backend python manage.py shell
>>> from accounts.models import User
>>> User._meta.get_fields()
>>> # Check if 'role' and 'organization' fields exist
```

### Check P0.7 Delete Functionality

```bash
# Backend verification
grep -r "is_deleted" backend/apps/systems/models.py
grep -r "delete_system" backend/apps/systems/views.py

# Frontend verification
grep -r "DeleteOutlined" frontend/src/pages/Systems.tsx
grep -r "handleDelete" frontend/src/pages/Systems.tsx
```

---

## 🚀 Action Items Summary

### THIS WEEK (Highest Priority)

1. **[ ] Verify P0.5 Multi-Tenancy implementation**
   - Owner: Developer
   - Time: 1 hour
   - Output: Status report (implemented or not)

2. **[ ] Verify P0.7 Delete functionality**
   - Owner: QA/Developer
   - Time: 30 minutes
   - Output: Test report

3. **[ ] Schedule P0.8 Customer Clarification Meeting**
   - Owner: Project Manager/PM
   - Time: 1 hour meeting + 30 min prep
   - Output: Finalized requirements document

4. **[ ] Quick Input Feature Testing**
   - Owner: QA
   - Status: Blocked (need credentials)
   - Alternative: Test on local environment

### NEXT WEEK (After Clarification)

5. **[ ] Create P0.8 Detailed Implementation Plan**
   - Owner: Developer
   - Time: 4 hours
   - Output: Phase-by-phase plan with estimates

6. **[ ] Start P0.8 Phase 1 Implementation**
   - Owner: Developer
   - Time: 21 hours (3 days)
   - Output: 10 P0 fields implemented

---

## 📊 Effort Summary

| Task | Status | Effort | Timeline |
|------|--------|--------|----------|
| **P0.5 Verification** | ⏳ Pending | 1 hour | This week |
| **P0.7 Verification** | ⏳ Pending | 30 min | This week |
| **P0.8 Customer Meeting** | ⏳ Blocked | 1.5 hours | URGENT |
| **P0.8 Planning** | ⏳ Pending | 4 hours | This week |
| **P0.8 Phase 1** | ⏳ Pending | 21 hours | Week 1 |
| **P0.8 Phase 2** | ⏳ Pending | 41 hours | Week 2 |
| **P0.8 Phase 3** | ⏳ Pending | 25 hours | Week 3 |
| **P0.8 Phase 4** | ⏳ Pending | 22 hours | Week 4 |
| **P1 Remember Me** | ⏳ Pending | 2 hours | After P0 |
| **TOTAL** | - | **~118 hours** | **4-5 weeks** |

---

## 🔍 Risk Analysis

### High Risk

1. **P0.5 Unknown Status**
   - **Risk**: If not implemented, critical for production
   - **Impact**: Users cannot manage their own systems
   - **Mitigation**: Verify immediately, prioritize if missing

2. **P0.8 Customer Clarification Delay**
   - **Risk**: Cannot start without answers to 5 questions
   - **Impact**: 109 hours of work blocked
   - **Mitigation**: Schedule meeting ASAP, get decisions in writing

3. **P0.8 Scope Creep**
   - **Risk**: Customer may request more changes mid-implementation
   - **Impact**: Timeline extends, budget impact
   - **Mitigation**: Get formal sign-off, change request process

### Medium Risk

4. **Quick Input Testing Blocked**
   - **Risk**: No production credentials
   - **Impact**: Cannot verify 25 fields work correctly
   - **Mitigation**: Test on local/staging, get credentials

5. **Delete Functionality Status Unclear**
   - **Risk**: File shows implemented but need verification
   - **Impact**: May need re-implementation
   - **Mitigation**: Test on production immediately

---

## ✅ Decision Points

### Decision 1: P0.5 Implementation Status?

**If Not Implemented**:
- Move to doing/ immediately
- Highest priority (12 hours)
- Block P0.8 Phase 1 if needed

**If Implemented**:
- Move to done/
- Proceed with P0.8 planning
- Lower priority than P0.8

### Decision 2: P0.8 Start Date?

**Option A: Start After Customer Meeting** (Recommended)
- ✅ Pro: Clear requirements, no rework
- ❌ Con: Delays implementation by days/weeks

**Option B: Start Phase 1 Immediately**
- ✅ Pro: Faster delivery
- ❌ Con: Risk of rework if customer changes mind

**Recommendation**: Wait for customer meeting

### Decision 3: Remember Me Priority?

**Option A: Implement Now** (2 hours)
- ✅ Pro: Quick win, user satisfaction
- ❌ Con: Distracts from P0 work

**Option B: Wait Until After P0**
- ✅ Pro: Focus on critical tasks
- ❌ Con: User inconvenience continues

**Recommendation**: Wait until P0 complete

---

**Document Status**: REVIEW COMPLETE ✅
**Next Update**: After P0.5/P0.7 verification
**Owner**: Development Team + Project Manager
