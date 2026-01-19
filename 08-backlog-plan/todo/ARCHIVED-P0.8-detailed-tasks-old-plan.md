# P0.8: System Form Redesign - Detailed Task Breakdown

**Priority:** P0.8 (HIGHEST - Customer Request)
**Status:** DOING
**Date:** 2026-01-19
**Customer Decisions Confirmed:**
1. ✅ Migrate "Cực kỳ quan trọng" → "Quan trọng"
2. ✅ Section 5: Implement theo customer suggestion
3. ✅ Required fields: Theo customer feedback + reasonable defaults + allow gradual completion
4. ✅ Implementation: ALL 44 fields IMMEDIATELY (no phased rollout)
5. ✅ Existing data: OK to leave blank for new fields

**Estimated Total Effort:** 23-29 hours
**Implementation Strategy:** Backend → Frontend → Data Migration → Deploy

---

## 📋 PHASE 1: Backend Implementation (8-10 hours)

### Task 1.1: Database Schema Design & Migrations (2 hours)
**Status:** TODO
**File:** `backend/apps/systems/migrations/000X_system_form_redesign.py`

**Subtasks:**
- [ ] Remove 6 fields from System model
  - Remove `code` (will be auto-generated)
  - Remove organization field from form (keep in model, auto-fill)
  - Remove other deprecated fields per customer feedback
- [ ] Add 30+ new fields to System model
  - Business context fields (objectives, processes, design docs, user types, annual users)
  - Technology fields (programming language, framework, database, hosting)
  - Data architecture fields (data sources, classification, volume)
  - Integration fields (internal/external systems, APIs, data exchange)
  - Security fields (authentication, encryption, audit, compliance)
  - Infrastructure fields (servers, storage, backup, disaster recovery)
- [ ] Modify 5 existing fields
  - Change `importance_level` choices (remove "Cực kỳ quan trọng", keep 3 options)
  - Update `status` field options if needed
  - Make fields nullable for existing data compatibility
- [ ] Create migration with data migration for importance_level
  ```python
  def migrate_importance_level(apps, schema_editor):
      System = apps.get_model('systems', 'System')
      System.objects.filter(importance_level='critical').update(importance_level='high')
  ```

**Acceptance Criteria:**
- Migration runs without errors
- All new fields are nullable or have defaults
- Data migration converts "Cực kỳ quan trọng" → "Quan trọng"
- No data loss on existing systems

---

### Task 1.2: Update System Model (1.5 hours)
**Status:** TODO
**File:** `backend/apps/systems/models.py`

**Subtasks:**
- [ ] Add all new model fields with proper types:
  - JSONField for arrays (business_objectives, business_processes, user_types, etc.)
  - CharField for text fields
  - BooleanField for yes/no fields
  - TextField for long text
- [ ] Add auto-generation for `code` field
  ```python
  def generate_system_code(self):
      org_code = self.organization.code
      year = timezone.now().year
      count = System.objects.filter(
          organization=self.organization,
          created_at__year=year
      ).count() + 1
      return f"SYS-{org_code}-{year}-{count:04d}"

  def save(self, *args, **kwargs):
      if not self.code:
          self.code = self.generate_system_code()
      super().save(*args, **kwargs)
  ```
- [ ] Add choices for new select fields
- [ ] Add validation in clean() method
- [ ] Update __str__ method if needed

**Acceptance Criteria:**
- Model validates correctly
- Auto-generation works for system code
- All fields have proper constraints

---

### Task 1.3: Update Serializers (1.5 hours)
**Status:** TODO
**File:** `backend/apps/systems/serializers.py`

**Subtasks:**
- [ ] Add all new fields to SystemSerializer
- [ ] Handle organization_id logic:
  ```python
  def create(self, validated_data):
      user = self.context['request'].user
      if user.role != 'admin':
          # Org user: auto-fill organization
          validated_data['organization_id'] = user.organization_id
      return super().create(validated_data)
  ```
- [ ] Add validation for required fields
- [ ] Add validation for JSON fields (array format)
- [ ] Add validation for max lengths
- [ ] Custom validation for business rules

**Acceptance Criteria:**
- Serializer handles all new fields
- Organization auto-fill works for org users
- Validation prevents invalid data

---

### Task 1.4: Update API Views (1 hour)
**Status:** TODO
**File:** `backend/apps/systems/views.py`

**Subtasks:**
- [ ] Update SystemViewSet to handle new fields
- [ ] Add filtering for new fields if needed
- [ ] Update permissions if needed
- [ ] Handle file uploads for design documents (if needed)

**Acceptance Criteria:**
- API returns all new fields
- Create/update operations work correctly
- Permissions are properly enforced

---

### Task 1.5: Write Backend Tests (2 hours)
**Status:** TODO
**File:** `backend/apps/systems/tests/test_models.py`, `test_views.py`

**Subtasks:**
- [ ] Test auto-generation of system code
- [ ] Test organization auto-fill for org users
- [ ] Test validation for all new fields
- [ ] Test data migration for importance_level
- [ ] Test API endpoints with new fields
- [ ] Test edge cases (empty arrays, null values, etc.)

**Acceptance Criteria:**
- All tests pass
- Coverage > 80%
- Edge cases handled

---

## 📋 PHASE 2: Frontend Implementation (10-12 hours)

### Task 2.1: Design New Form Structure (1 hour)
**Status:** TODO
**File:** `frontend/src/pages/SystemCreate.tsx` (planning)

**Subtasks:**
- [ ] Design 8-section tabbed layout:
  1. Thông tin cơ bản (Basic Info)
  2. Bối cảnh nghiệp vụ (Business Context)
  3. Kiến trúc công nghệ (Technology Architecture)
  4. Kiến trúc dữ liệu (Data Architecture)
  5. Tích hợp hệ thống (System Integration)
  6. An toàn thông tin (Security)
  7. Hạ tầng kỹ thuật (Infrastructure)
  8. Vận hành & Bảo trì (Operations)
- [ ] Decide on component structure
- [ ] Plan validation strategy

**Acceptance Criteria:**
- Wireframe/structure approved
- Component hierarchy clear

---

### Task 2.2: Create Reusable Form Components (2 hours)
**Status:** TODO
**Files:** `frontend/src/components/forms/`

**Subtasks:**
- [ ] Create `DynamicListInput.tsx` - for adding/removing list items
- [ ] Create `SystemCodeDisplay.tsx` - shows auto-generated code
- [ ] Create `OrganizationAutoFill.tsx` - handles org selection logic
- [ ] Create `UserTypeCheckboxGroup.tsx` - user types checkboxes
- [ ] Create form validation helpers

**Acceptance Criteria:**
- Components are reusable
- Components handle validation
- Good UX for dynamic lists

---

### Task 2.3: Implement Section 1 - Thông tin cơ bản (1 hour)
**Status:** TODO
**File:** `frontend/src/components/forms/SystemFormSection1.tsx`

**Fields:**
- Organization (admin only, hidden for org users)
- System name (required)
- System code (auto-generated, read-only)
- Description (required)
- Status (required)
- Importance level (3 options only)

**Acceptance Criteria:**
- All fields render correctly
- Organization logic works for admin/org user
- System code displays as read-only

---

### Task 2.4: Implement Section 2 - Bối cảnh nghiệp vụ (1.5 hours)
**Status:** TODO
**File:** `frontend/src/components/forms/SystemFormSection2.tsx`

**Fields:**
- Mục tiêu nghiệp vụ (dynamic list, max 5)
- Quy trình nghiệp vụ chính (dynamic list)
- Có đủ hồ sơ phân tích thiết kế? (switch)
- Đối tượng sử dụng (checkbox group)
- Số lượng người dùng hàng năm (number input)

**Acceptance Criteria:**
- Dynamic lists work (add/remove)
- Checkbox group for user types
- All validations work

---

### Task 2.5: Implement Section 3 - Kiến trúc công nghệ (1 hour)
**Status:** TODO
**File:** `frontend/src/components/forms/SystemFormSection3.tsx`

**Fields:**
- Ngôn ngữ lập trình (text)
- Framework/Thư viện (text)
- Cơ sở dữ liệu (text)
- Nền tảng triển khai (select: Cloud/On-premise/Hybrid)

**Acceptance Criteria:**
- All fields render
- Select dropdown works

---

### Task 2.6: Implement Section 4 - Kiến trúc dữ liệu (1 hour)
**Status:** TODO
**File:** `frontend/src/components/forms/SystemFormSection4.tsx`

**Fields:**
- Nguồn dữ liệu (dynamic list)
- Phân loại dữ liệu (text)
- Khối lượng dữ liệu (text with unit)

**Acceptance Criteria:**
- Dynamic list for data sources works
- All fields render correctly

---

### Task 2.7: Implement Section 5 - Tích hợp hệ thống (1.5 hours)
**Status:** TODO
**File:** `frontend/src/components/forms/SystemFormSection5.tsx`

**Fields:**
- Hệ thống nội bộ tích hợp (dynamic list)
- Hệ thống bên ngoài tích hợp (dynamic list)
- API/Webservices (dynamic list)
- Phương thức trao đổi dữ liệu (text)

**Acceptance Criteria:**
- Multiple dynamic lists work
- Validation works

---

### Task 2.8: Implement Section 6 - An toàn thông tin (1 hour)
**Status:** TODO
**File:** `frontend/src/components/forms/SystemFormSection6.tsx`

**Fields:**
- Phương thức xác thực (select)
- Mã hóa dữ liệu (switch)
- Có log audit? (switch)
- Tuân thủ tiêu chuẩn (text)

**Acceptance Criteria:**
- All fields render
- Switches work correctly

---

### Task 2.9: Implement Section 7 - Hạ tầng kỹ thuật (1 hour)
**Status:** TODO
**File:** `frontend/src/components/forms/SystemFormSection7.tsx`

**Fields:**
- Cấu hình máy chủ (text)
- Dung lượng lưu trữ (text with unit)
- Phương án sao lưu (text)
- Kế hoạch khôi phục thảm họa (text)

**Acceptance Criteria:**
- All fields render correctly

---

### Task 2.10: Update SystemCreate & SystemEdit Pages (1.5 hours)
**Status:** TODO
**Files:** `frontend/src/pages/SystemCreate.tsx`, `SystemEdit.tsx`

**Subtasks:**
- [ ] Integrate all 8 sections with Tabs component
- [ ] Handle form submission with all new fields
- [ ] Add loading states
- [ ] Add error handling
- [ ] Add success notifications
- [ ] Handle organization logic (admin vs org user)

**Acceptance Criteria:**
- Form submits all data correctly
- Tab navigation works
- Loading/error states work
- Success notification appears

---

### Task 2.11: Update Systems Table & Detail Views (1 hour)
**Status:** TODO
**Files:** `frontend/src/pages/Systems.tsx`, `SystemDetail.tsx`

**Subtasks:**
- [ ] Update table columns if needed
- [ ] Update SystemDetail to display all new fields
- [ ] Organize detail view into sections
- [ ] Add "Edit" button if not present

**Acceptance Criteria:**
- Table displays correctly
- Detail view shows all new data
- Navigation works

---

## 📋 PHASE 3: Data Migration & Testing (3-4 hours)

### Task 3.1: Migrate Existing Systems Data (1 hour)
**Status:** TODO

**Subtasks:**
- [ ] Run Django migration
- [ ] Verify importance_level migration
- [ ] Verify no data loss
- [ ] Check that all existing systems still load

**Acceptance Criteria:**
- Migration completes without errors
- All existing systems accessible
- Importance level correctly migrated

---

### Task 3.2: End-to-End Testing (2 hours)
**Status:** TODO

**Test Scenarios:**
- [ ] **As Admin:** Create new system with all fields
- [ ] **As Admin:** Create system for different organization
- [ ] **As Org User:** Create system (org auto-filled)
- [ ] **As Org User:** Verify cannot select different org
- [ ] Edit existing system (verify old data preserved)
- [ ] Edit existing system and add new fields
- [ ] Verify system code auto-generation works
- [ ] Verify validation works for required fields
- [ ] Verify dynamic lists (add/remove items)
- [ ] Verify checkbox groups
- [ ] Verify all 8 sections save correctly
- [ ] Test with empty optional fields
- [ ] Test with maximum data (all fields filled)
- [ ] Mobile responsive check
- [ ] Browser compatibility (Chrome, Firefox, Safari)

**Acceptance Criteria:**
- All test scenarios pass
- No console errors
- Good UX on all devices

---

### Task 3.3: Fix Bugs Found in Testing (1 hour)
**Status:** TODO

**Subtasks:**
- [ ] Address any bugs found during E2E testing
- [ ] Retest after fixes
- [ ] Document any known issues

**Acceptance Criteria:**
- All critical bugs fixed
- No blockers for deployment

---

## 📋 PHASE 4: Deployment (2-3 hours)

### Task 4.1: Build & Deploy to Production (1.5 hours)
**Status:** TODO

**Subtasks:**
- [ ] Run backend tests locally
- [ ] Run frontend build locally
- [ ] Commit all changes
- [ ] Push to GitHub
- [ ] SSH to production server (34.142.152.104)
- [ ] Pull latest code
- [ ] Run Django migrations
- [ ] Rebuild backend container
- [ ] Rebuild frontend container
- [ ] Restart services
- [ ] Verify containers running

**Acceptance Criteria:**
- Deployment successful
- No errors in logs
- Services running

---

### Task 4.2: Production Smoke Testing (1 hour)
**Status:** TODO

**Test on Production:**
- [ ] Login as admin (admin / Admin@2026)
- [ ] Create new system with new form
- [ ] Verify all sections work
- [ ] Verify auto-generation of system code
- [ ] Login as org user
- [ ] Create system as org user
- [ ] Verify organization auto-filled
- [ ] Edit existing system
- [ ] Verify old systems still work
- [ ] Check importance level on old systems

**Acceptance Criteria:**
- All smoke tests pass
- No critical issues on production

---

### Task 4.3: Update Documentation (30 min)
**Status:** TODO

**Subtasks:**
- [ ] Create deployment completion report
- [ ] Update USER_GUIDE.md with new form instructions
- [ ] Document new field meanings
- [ ] Create admin guide for system code pattern

**Acceptance Criteria:**
- Documentation complete and clear

---

## 📊 Task Summary

**Total Tasks:** 29
**Estimated Hours:**
- Phase 1 (Backend): 8-10h
- Phase 2 (Frontend): 10-12h
- Phase 3 (Testing): 3-4h
- Phase 4 (Deployment): 2-3h
- **Total: 23-29h**

**Critical Path:**
1. Backend migrations → Backend models → Backend serializers
2. Frontend components → Frontend sections → Integration
3. Testing → Bug fixes
4. Deployment → Smoke testing

---

## 🚀 Execution Plan

**Day 1 (8 hours):**
- ✅ Task 1.1: Database migrations (2h)
- ✅ Task 1.2: Update models (1.5h)
- ✅ Task 1.3: Update serializers (1.5h)
- ✅ Task 1.4: Update views (1h)
- ✅ Task 2.1: Design form structure (1h)
- ✅ Task 2.2: Create reusable components (1h from 2h)

**Day 2 (8 hours):**
- ✅ Task 2.2: Finish reusable components (1h)
- ✅ Task 2.3-2.9: Implement all 8 form sections (8h total, ~1h each)

**Day 3 (8 hours):**
- ✅ Task 2.10: Update Create/Edit pages (1.5h)
- ✅ Task 2.11: Update table/detail views (1h)
- ✅ Task 1.5: Backend tests (2h)
- ✅ Task 3.1: Data migration (1h)
- ✅ Task 3.2: E2E testing (2h)
- ✅ Task 3.3: Bug fixes (0.5h)

**Day 4 (3 hours):**
- ✅ Task 4.1: Deploy to production (1.5h)
- ✅ Task 4.2: Smoke testing (1h)
- ✅ Task 4.3: Documentation (0.5h)

---

**Status:** ✅ READY TO START
**Created:** 2026-01-19
**Author:** Claude Code Agent (Vibe Coding Agent)
**Next Action:** Begin Task 1.1 - Database Schema Design & Migrations
