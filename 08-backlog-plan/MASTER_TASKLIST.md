# MASTER TASK LIST - Hệ thống Báo cáo Thống kê

**Project**: System Report Management
**Created**: 2026-01-15
**Stack**: Django + React + PostgreSQL

---

## 📊 OVERVIEW

| Phase | Tasks | Status | Priority |
|-------|-------|--------|----------|
| Phase 1: Core Setup | 7 tasks | 🟡 TODO | P0 |
| Phase 2: Forms & Features | TBD | ⚪ Pending | P1 |
| Phase 3: Reports & Export | TBD | ⚪ Pending | P1 |
| Phase 4: Polish & Production | TBD | ⚪ Pending | P2 |

---

## 🎯 PHASE 1: CORE SETUP (Week 1)

**Goal**: Foundation - Django backend + React frontend + Deployment

### Backend Tasks

| ID | Task | Estimate | Status | File |
|----|------|----------|--------|------|
| TODO-001 | Init Django Project Structure | 2h | ⚪ TODO | `todo/01-init-django-project.md` |
| TODO-002 | Create Database Models (14 tables) | 4h | ⚪ TODO | `todo/02-database-models.md` |
| TODO-003 | Configure Django Admin Panel | 3h | ⚪ TODO | `todo/03-django-admin-config.md` |
| TODO-004 | Setup REST API with DRF | 4h | ⚪ TODO | `todo/04-rest-api-setup.md` |

**Subtotal**: 13 hours

### DevOps Tasks

| ID | Task | Estimate | Status | File |
|----|------|----------|--------|------|
| TODO-005 | Docker Setup (Compose + Containers) | 2h | ⚪ TODO | `todo/05-docker-setup.md` |
| TODO-007 | Git + GitHub + Deployment | 3h | ⚪ TODO | `todo/07-git-github-deployment.md` |

**Subtotal**: 5 hours

### Frontend Tasks

| ID | Task | Estimate | Status | File |
|----|------|----------|--------|------|
| TODO-006 | Init React Frontend (Login + Org List) | 3h | ⚪ TODO | `todo/06-frontend-init.md` |

**Subtotal**: 3 hours

### **PHASE 1 TOTAL**: 21 hours (~3 working days)

---

## 🔄 PHASE 2: SYSTEM MANAGEMENT & FORMS (Week 2-3)

**Goal**: Level 1 Forms (6 phần) + File Upload + Validation

### Tasks (To be detailed)

- [ ] System CRUD APIs (Architecture, DataInfo, Operations)
- [ ] Integration Management APIs
- [ ] Assessment APIs
- [ ] File Upload Service
- [ ] Attachment Management
- [ ] Form Wizard Component (6 steps)
- [ ] Draft Auto-save (localStorage)
- [ ] Validation Rules (5 rules - frontend & backend)
- [ ] Pagination & Filtering
- [ ] Organization Detail Page
- [ ] System List Page
- [ ] System Create Page (Form Wizard)
- [ ] System Edit Page
- [ ] System Detail Page (Read-only)

**Estimated**: 40 hours (~1 week)

---

## 📊 PHASE 3: ADVANCED FEATURES (Week 3-4)

**Goal**: Level 2 Forms + Export (Word/Excel) + Dashboard

### Tasks (To be detailed)

- [ ] Level 2 Additional Models (Cost, Vendor, Infrastructure, Security)
- [ ] Level 2 Serializers & APIs
- [ ] Word Export Service (python-docx)
- [ ] Excel Export Service (openpyxl) - 3 sheets
- [ ] Report Export Page (UI)
- [ ] Dashboard Page (Stats + Charts)
- [ ] Admin Consolidated Reports
- [ ] Advanced Filters
- [ ] Audit Logs

**Estimated**: 35 hours (~1 week)

---

## 🎨 PHASE 4: POLISH & PRODUCTION (Week 4-5)

**Goal**: Testing + Documentation + Production Ready

### Tasks (To be detailed)

- [ ] Backend Unit Tests (pytest)
- [ ] Frontend Component Tests (Vitest)
- [ ] Integration Tests
- [ ] Manual Testing Checklist
- [ ] UI/UX Polish (Loading states, error messages)
- [ ] Responsive Design Fixes
- [ ] API Documentation (OpenAPI/Swagger)
- [ ] User Manual (PDF)
- [ ] Admin Manual
- [ ] Technical Documentation
- [ ] Production Deployment Scripts
- [ ] Backup & Restore Scripts
- [ ] Monitoring Setup (optional)
- [ ] Training Materials

**Estimated**: 25 hours (~1 week)

---

## 🚀 EXECUTION PLAN

### Week 1: PHASE 1 (THIS WEEK - PRIORITY!)

**Day 1-2**:
1. ✅ Init Django project (TODO-001)
2. ✅ Create database models (TODO-002)
3. ✅ Configure admin panel (TODO-003)

**Day 3**:
4. ✅ Setup REST API (TODO-004)
5. ✅ Init React frontend (TODO-006)

**Day 4**:
6. ✅ Docker setup (TODO-005)
7. ✅ Git + GitHub + Deploy (TODO-007)

**Day 5**:
- Testing & bug fixes
- Documentation updates
- Plan PHASE 2

### Week 2-3: PHASE 2
- System forms & validation
- File upload
- CRUD operations
- Testing

### Week 3-4: PHASE 3
- Export features
- Dashboard
- Advanced filtering
- Testing

### Week 4-5: PHASE 4
- Polish
- Testing
- Documentation
- Production deployment

---

## 📋 CURRENT PRIORITIES

**IMMEDIATE (This Week)**:
1. **TODO-001**: Init Django Project ⚡ START HERE
2. **TODO-002**: Database Models
3. **TODO-003**: Django Admin
4. **TODO-004**: REST API
5. **TODO-005**: Docker
6. **TODO-006**: Frontend Init
7. **TODO-007**: Deploy First Commit 🎯 USER REQUEST

**NEXT (Week 2)**:
- Detailed tasks for PHASE 2
- Start Form development

---

## ✅ SUCCESS CRITERIA

### Phase 1 Done When:
- [ ] Django project running with admin panel
- [ ] Database models created & migrated
- [ ] REST API working (Organization + System CRUD)
- [ ] React frontend can login & list organizations
- [ ] Docker Compose works
- [ ] Code on GitHub
- [ ] **Deployed to https://thongkehethong.mindmaid.ai** ⭐
- [ ] Django admin accessible at `/admin`

### Full Project Done When:
- [ ] Level 1 & Level 2 forms working
- [ ] Word & Excel export functional
- [ ] Dashboard with charts
- [ ] All validation rules working
- [ ] Testing complete
- [ ] Documentation complete
- [ ] Production deployed
- [ ] Team trained

---

## 📂 TASK FILES STRUCTURE

```
08-backlog-plan/
├── MASTER_TASKLIST.md          # This file
├── implementation-roadmap.md   # High-level roadmap
│
├── todo/                       # Tasks not started
│   ├── 01-init-django-project.md
│   ├── 02-database-models.md
│   ├── 03-django-admin-config.md
│   ├── 04-rest-api-setup.md
│   ├── 05-docker-setup.md
│   ├── 06-frontend-init.md
│   └── 07-git-github-deployment.md
│
├── doing/                      # Tasks in progress
│   └── (move tasks here when starting)
│
└── done/                       # Completed tasks
    └── (move tasks here when completed)
```

---

## 🎯 NEXT ACTION

**START WITH**: `todo/01-init-django-project.md`

```bash
# Read the task
cat 08-backlog-plan/todo/01-init-django-project.md

# Move to doing
mv 08-backlog-plan/todo/01-init-django-project.md 08-backlog-plan/doing/

# Execute the task
cd backend
python3 -m venv venv
source venv/bin/activate
pip install Django==5.0.1 djangorestframework==3.14.0
django-admin startproject config .
# ... follow task steps
```

---

**Updated**: 2026-01-15
**Status**: PHASE 1 - Ready to Start ✅
