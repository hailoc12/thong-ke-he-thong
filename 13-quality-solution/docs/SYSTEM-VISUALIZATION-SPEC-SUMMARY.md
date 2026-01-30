# System Visualization Feature - Specification Summary

**Date**: 2026-01-24
**Status**: ✅ Complete Specification Ready
**For**: Lãnh đạo Bộ KH&CN Dashboard

---

## 🎯 Tính năng là gì?

Dashboard hiển thị **kiến trúc tổng thể hệ thống 5 tầng** một cách trực quan, cho phép:
- ✅ Xem tổng quan quy hoạch platform
- ✅ **Click để drill-down** từ tầng → khối → hệ thống cụ thể
- ✅ Liên kết với **các hệ thống đã khai báo** trong database
- ✅ Hiển thị **hiện trạng real-time** (đang chạy, đang phát triển, lỗi)
- ✅ Hỗ trợ **tư duy chiến lược** về phát triển platform

---

## 📊 Demo Workflow

```
User lands on dashboard
    ↓
Thấy 5 tầng (L1-L5) với completion rate
    ↓
Click "Tầng 3 - Dịch vụ" → Expand
    ↓
Thấy 5 khối: Quản trị, Chuyên ngành, Core, Nghiệp vụ, Dữ liệu
    ↓
Click "Khối Core Services" → Expand
    ↓
Thấy danh sách 10 systems: MST Identity, MST Auth, MST Workflow...
    ↓
Click "MST Identity SSO" → Modal
    ↓
Xem chi tiết: Status, Dependencies, Metadata
    ↓
Click "View Full Details" → Navigate to system page
```

---

## 🏗️ Kiến trúc UI

### Accordion View (MVP) ⭐ Recommended

```
┌─────────────────────────────────────────────┐
│ ▼ Tầng 5 - Ứng dụng          [24/28] 85%   │
│   ┌─────────────────────────────────────┐   │
│   │ L5.1 - Kênh truy cập Bộ    [6/7]   │   │
│   │   • MST UGP Portal        🟢        │   │
│   │   • MST Leader Dashboard  🟢        │   │
│   │   • MST Officer Workspace 🟡        │   │
│   └─────────────────────────────────────┘   │
│                                             │
│ ► Tầng 4 - Tích hợp           [4/4] 100%   │
│ ► Tầng 3 - Dịch vụ            [32/45] 71%  │
│ ► Tầng 2 - Dữ liệu & AI       [15/18] 83%  │
│ ► Tầng 1 - Hạ tầng            [6/6] 100%   │
└─────────────────────────────────────────────┘
```

**Lý do chọn Accordion**:
- ✅ Dễ sử dụng, intuitive
- ✅ Mobile-friendly
- ✅ Dễ implement (2-3 tuần)
- ✅ Phù hợp với executive dashboard

---

## 🗄️ Database Schema

### Bảng mới cần tạo:

1. **`architecture_layers`** - 5 tầng (L1-L5)
2. **`architecture_components`** - Các khối/cụm trong mỗi tầng (50+ components)
3. **`system_dependencies`** - Quan hệ giữa systems
4. **`architecture_metrics`** - Metrics theo thời gian (optional)

### Bảng cần modify:

**`systems`** table - Add columns:
- `architecture_layer_id`
- `architecture_component_id`
- `deployment_status` (planned, production, etc)
- `health_status` (healthy, degraded, down)

---

## 🔌 API Endpoints

| Endpoint | Purpose |
|----------|---------|
| `GET /architecture/layers` | Get 5 layers with metrics |
| `GET /architecture/components?layer_id=3` | Get components by layer |
| `GET /architecture/systems?component_id=19` | Get systems by component |
| `GET /architecture/systems/123` | Get system detail with dependencies |
| `GET /architecture/metrics` | Get overall metrics |
| `GET /architecture/summary` | Get dashboard summary |

---

## 💻 Tech Stack

### Backend
- FastAPI + SQLAlchemy + Pydantic
- PostgreSQL + Redis (cache)

### Frontend
- React 18 + TypeScript
- Zustand (UI state) + React Query (server state)
- Tailwind CSS + Framer Motion
- Headless UI + Lucide Icons

---

## 📅 Timeline & Phases

### Phase 1: MVP - Accordion View (2-3 weeks) ⭐
- Database migration + seed data
- Backend API (6 endpoints)
- Frontend accordion view
- System detail modal
- Search & filters

**Team**: 1 Backend + 1 Frontend Dev
**Priority**: P0 (Must have)

### Phase 2: Enhancement (1-2 weeks)
- Animations & polish
- Export to PNG/PDF
- Real-time updates
- Better UX

**Team**: 1 Frontend Dev
**Priority**: P1 (Should have)

### Phase 3: Diagram View (2 weeks) - Optional
- Visual blocks view
- Toggle between views
- Desktop only

**Team**: 1 Frontend Dev
**Priority**: P2 (Nice to have)

---

## 📁 Spec Documents (Vibe Coding Structure)

Tất cả spec được organize theo 17-folder structure:

```
03-research/
├── bo-truong-dashboard-best-practices.md    # Executive dashboard research
└── architecture-analysis.md                  # Phân tích kiến trúc 5 tầng

04-task-definition/
└── system-visualization-requirements.md      # Complete requirements (FR, NFR, UI/UX)

05-ideas/
└── visualization-implementation-approaches.md # Brainstorm 5 approaches + comparison

08-backlog-plan/
└── system-visualization-implementation-roadmap.md  # Implementation roadmap

13-quality-solution/
├── database-schema-architecture-visualization.md   # Complete DB schema + migration
├── api-endpoints-architecture-visualization.md     # API spec + sample code
└── frontend-component-architecture.md              # React components + code
```

---

## ✅ Next Steps

### For Stakeholders
1. **Review** this summary + detailed specs
2. **Approve** approach (Accordion view)
3. **Allocate** resources (1 BE + 1 FE developer)
4. **Set** go-live date

### For Development Team
1. **Backend**: Review database schema → Create migration
2. **Frontend**: Review component architecture → Setup project
3. **QA**: Review requirements → Prepare test cases

### Quick Start
```bash
# Backend
cd backend
# Create migration from: 13-quality-solution/database-schema-...
# Implement APIs from: 13-quality-solution/api-endpoints-...

# Frontend
cd frontend
# Create folder structure from: 13-quality-solution/frontend-component-...
# Implement components
```

---

## 🎯 Success Criteria

- ✅ **80%+ Lãnh đạo Bộ** access weekly
- ✅ **Average session > 5 min**
- ✅ **Find system < 30 seconds**
- ✅ **90%+ users navigate without help**

---

## 💡 Key Decisions Made

1. **Accordion View** (not node graph) - Easier to use, faster to implement
2. **React Query + Zustand** - Best practice for React data fetching
3. **Lazy loading** - Only fetch data when user expands
4. **Progressive disclosure** - Start simple, add complexity later
5. **MVP first** - Phase 1 delivers value, Phase 3 optional

---

## 🚀 Ready to Implement?

**Estimated Timeline**: 3-5 weeks
**Estimated Effort**: 6-8 person-weeks
**Risk Level**: Medium (mitigatable)

**All specs are ready**. Development can start immediately after stakeholder approval.

---

## 📞 Questions?

Refer to detailed specs in respective folders:
- **Requirements**: `04-task-definition/system-visualization-requirements.md`
- **Database**: `13-quality-solution/database-schema-architecture-visualization.md`
- **API**: `13-quality-solution/api-endpoints-architecture-visualization.md`
- **Frontend**: `13-quality-solution/frontend-component-architecture.md`
- **Roadmap**: `08-backlog-plan/system-visualization-implementation-roadmap.md`

**Status**: ✅ Spec Complete - Ready for Implementation
