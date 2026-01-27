# Task Definition: Interactive System Architecture Visualization

**Date**: 2026-01-24
**User Type**: Lãnh đạo Bộ KH&CN (Bộ trưởng)
**Feature**: System Visualization cho Dashboard

---

## 1. Problem Statement

### Current State
- Lãnh đạo Bộ không có cái nhìn tổng quan trực quan về kiến trúc hệ thống
- Khó nắm bắt quy hoạch tổng thể 5 tầng
- Không rõ hiện trạng các hệ thống đã triển khai
- Khó tư duy chiến lược về phát triển platform

### Desired State
- Dashboard hiển thị **kiến trúc tổng thể 5 tầng** một cách trực quan
- **Click vào bất kỳ phần nào** → Drill-down xem chi tiết
- Liên kết với **các hệ thống đã khai báo** trong database
- Hiển thị **hiện trạng** của từng hệ thống (status, metrics)
- Hỗ trợ **tư duy chiến lược** về phát triển platform

---

## 2. User Story

**As a** Bộ trưởng Bộ KH&CN
**I want to** xem kiến trúc tổng thể hệ thống dưới dạng visualization tương tác
**So that** tôi có thể:
- Nắm bắt toàn cảnh quy hoạch 5 tầng
- Click vào từng tầng/khối để xem chi tiết
- Biết hiện trạng các hệ thống đã triển khai
- Tư duy chiến lược về phát triển platform tương lai

---

## 3. Functional Requirements

### FR-1: Hiển thị Kiến trúc Tổng thể
**Priority**: P0
**Description**: Hiển thị diagram 5 tầng kiến trúc

**Acceptance Criteria**:
- ✅ Hiển thị 5 tầng rõ ràng với labels
- ✅ Color-coded theo tầng (infrastructure → application)
- ✅ Responsive layout (desktop, tablet)
- ✅ Clean, minimal design phù hợp executive dashboard

**Components to show**:
- Tầng 1: Infrastructure (6 components)
- Tầng 2: Data & AI/ML (15+ databases & modules)
- Tầng 3: Services (30+ services grouped by clusters)
- Tầng 4: Integration (4 components)
- Tầng 5: Applications (8 applications)

---

### FR-2: Interactive Drill-Down
**Priority**: P0
**Description**: Click vào bất kỳ phần nào để xem chi tiết

**Acceptance Criteria**:
- ✅ Hover vào tầng → Highlight + tooltip
- ✅ Click vào tầng → Expand để xem các khối chức năng
- ✅ Click vào khối → Expand để xem danh sách hệ thống
- ✅ Click vào hệ thống → Mở modal chi tiết
- ✅ Smooth animation khi expand/collapse
- ✅ Breadcrumb navigation

**Drill-down Levels**:
```
Level 0: Tổng quan 5 tầng
    ↓ (click Tầng 3)
Level 1: Tầng 3 - Dịch vụ
    → Khối quản trị, điều hành
    → Khối chuyên ngành dùng chung
    → Khối nghiệp vụ riêng
    → Khối core services
    → Khối giao tiếp dữ liệu
    ↓ (click Khối core services)
Level 2: Khối Core Services
    → MST Identity SSO
    → MST Authentication
    → MST Workflow
    → ...
    ↓ (click MST Identity SSO)
Level 3: Chi tiết hệ thống
    → Thông tin chi tiết
    → Status & metrics
    → Dependencies
    → Link to system detail page
```

---

### FR-3: Liên kết với Hệ thống đã khai báo
**Priority**: P0
**Description**: Mapping visualization với systems trong database

**Acceptance Criteria**:
- ✅ Mỗi component trên diagram map với 1 hoặc nhiều systems
- ✅ Hiển thị số lượng systems: "MST Core Services (8)"
- ✅ Click vào → Hiển thị danh sách systems thuộc component đó
- ✅ Link từ visualization → System detail page
- ✅ Highlight systems chưa khai báo (planned vs implemented)

**Mapping Logic**:
- Systems table có field: `architecture_layer` (L1-L5)
- Systems table có field: `architecture_component` (tên component)
- Query systems by layer + component
- Count và display real-time

---

### FR-4: Hiển thị Hiện trạng
**Priority**: P0
**Description**: Show current status của các hệ thống

**Acceptance Criteria**:
- ✅ Status badge cho mỗi system:
  - 🟢 Running (đang vận hành)
  - 🟡 In Development (đang phát triển)
  - 🔵 Planned (đã quy hoạch, chưa triển khai)
  - 🔴 Error/Stopped (lỗi hoặc dừng)
- ✅ Tỷ lệ completion: "Tầng 3: 24/35 systems (68%)"
- ✅ Visual indicator: progress bar hoặc pie chart
- ✅ Timestamp: "Cập nhật: 2026-01-24 10:30"

**Status Data Source**:
- `systems.status` field
- `systems.deployment_status` field
- Real-time monitoring data (nếu có)

---

### FR-5: Search & Filter
**Priority**: P1
**Description**: Tìm kiếm và lọc hệ thống

**Acceptance Criteria**:
- ✅ Search box: tìm theo tên hệ thống
- ✅ Filter by layer: L1, L2, L3, L4, L5
- ✅ Filter by status: Running, Development, Planned, Error
- ✅ Filter by organization: Bộ, Cục A, Cục B, Địa phương
- ✅ Highlight matched systems trên diagram
- ✅ Clear filters button

---

### FR-6: Export & Share
**Priority**: P1
**Description**: Export diagram và chia sẻ

**Acceptance Criteria**:
- ✅ Export as PNG/JPG (high resolution)
- ✅ Export as PDF (vector)
- ✅ Export as SVG (editable)
- ✅ Copy shareable link
- ✅ Print-friendly view

---

## 4. Non-Functional Requirements

### NFR-1: Performance
- Initial load < 2 seconds
- Smooth 60fps animation
- Lazy load system details (không load hết lúc đầu)
- Cache diagram structure (chỉ fetch data mới)

### NFR-2: Usability
- Intuitive interaction (không cần training)
- Accessible (WCAG 2.1 AA)
- Mobile-responsive (tablet minimum)
- Tooltips hướng dẫn cho first-time users

### NFR-3: Maintainability
- Dynamic data từ database (không hardcode)
- Easy to add/remove/modify components
- Configurable color scheme
- Version control cho diagram structure

---

## 5. Data Model Requirements

### Architecture Layers Table
```sql
CREATE TABLE architecture_layers (
  id SERIAL PRIMARY KEY,
  code VARCHAR(10) NOT NULL,      -- L1, L2, L3, L4, L5
  name_vi VARCHAR(255),            -- "Hạ tầng", "Dữ liệu & AI"
  name_en VARCHAR(255),
  description TEXT,
  color_code VARCHAR(7),           -- Hex color
  display_order INT,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

### Architecture Components Table
```sql
CREATE TABLE architecture_components (
  id SERIAL PRIMARY KEY,
  layer_id INT REFERENCES architecture_layers(id),
  code VARCHAR(50) NOT NULL,       -- "L3_CORE_SERVICES"
  name_vi VARCHAR(255),            -- "Khối dịch vụ cốt lõi"
  name_en VARCHAR(255),
  description TEXT,
  icon VARCHAR(50),                -- Icon class or SVG path
  display_order INT,
  parent_component_id INT,         -- For nested grouping
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

### Systems Table (existing, add fields)
```sql
ALTER TABLE systems ADD COLUMN architecture_layer_id INT REFERENCES architecture_layers(id);
ALTER TABLE systems ADD COLUMN architecture_component_id INT REFERENCES architecture_components(id);
ALTER TABLE systems ADD COLUMN deployment_status VARCHAR(50);
ALTER TABLE systems ADD COLUMN health_status VARCHAR(50);
```

### Architecture Metrics (optional, for analytics)
```sql
CREATE TABLE architecture_metrics (
  id SERIAL PRIMARY KEY,
  layer_id INT,
  component_id INT,
  metric_type VARCHAR(50),         -- "completion_rate", "uptime"
  metric_value DECIMAL(10,2),
  recorded_at TIMESTAMP
);
```

---

## 6. UI/UX Requirements

### Layout Structure
```
┌─────────────────────────────────────────────────┐
│ Header: System Architecture Visualization      │
│ Filters: [Layer▾] [Status▾] [Org▾] [Search🔍] │
├─────────────────────────────────────────────────┤
│                                                 │
│  ┌───────────────────────────────────────────┐ │
│  │  Tầng 5 - Ứng dụng          [24/28] 85%  │ │
│  └───────────────────────────────────────────┘ │
│  ┌───────────────────────────────────────────┐ │
│  │  Tầng 4 - Tích hợp          [4/4]  100%  │ │
│  └───────────────────────────────────────────┘ │
│  ┌───────────────────────────────────────────┐ │
│  │  Tầng 3 - Dịch vụ           [32/45] 71%  │ │
│  │  ┌─────────────────────────────────────┐ │ │
│  │  │ ▶ Khối quản trị (8 systems)         │ │ │
│  │  │ ▶ Khối chuyên ngành (12 systems)    │ │ │
│  │  │ ▼ Khối core services (8 systems)    │ │ │ ← Expanded
│  │  │   • MST Identity SSO       🟢       │ │ │
│  │  │   • MST Authentication     🟢       │ │ │
│  │  │   • MST Workflow           🟡       │ │ │
│  │  └─────────────────────────────────────┘ │ │
│  └───────────────────────────────────────────┘ │
│  ┌───────────────────────────────────────────┐ │
│  │  Tầng 2 - Dữ liệu & AI      [15/18] 83%  │ │
│  └───────────────────────────────────────────┘ │
│  ┌───────────────────────────────────────────┐ │
│  │  Tầng 1 - Hạ tầng           [6/6]  100%  │ │
│  └───────────────────────────────────────────┘ │
│                                                 │
├─────────────────────────────────────────────────┤
│ Summary: 81/101 systems (80% completion)       │
│ Last updated: 2026-01-24 14:30                 │
└─────────────────────────────────────────────────┘
```

### System Detail Modal
```
┌─────────────────────────────────────────────┐
│ MST Identity SSO                      [✕]   │
├─────────────────────────────────────────────┤
│ Status: 🟢 Running                          │
│ Layer: Tầng 3 - Dịch vụ                    │
│ Component: Khối dịch vụ cốt lõi             │
│                                             │
│ Thông tin chi tiết:                         │
│ - Organization: Bộ KH&CN                    │
│ - Department: Vụ Công nghệ thông tin        │
│ - Deployment: Production                    │
│ - Version: v2.1.5                           │
│ - Uptime: 99.8%                             │
│                                             │
│ Dependencies:                               │
│ → MST API Gateway                           │
│ → MST Service Registry                      │
│ ← MST UGP Portal                            │
│ ← MST Officer Workspace                     │
│                                             │
│ [View Full Details] [Edit System]          │
└─────────────────────────────────────────────┘
```

### Color Scheme
- **Tầng 1**: `#607D8B` (Blue Grey)
- **Tầng 2**: `#9C27B0` (Purple)
- **Tầng 3**: `#4CAF50` (Green)
- **Tầng 4**: `#E91E63` (Pink)
- **Tầng 5**: `#FF9800` (Orange)

### Status Colors
- 🟢 Running: `#4CAF50`
- 🟡 Development: `#FFC107`
- 🔵 Planned: `#2196F3`
- 🔴 Error: `#F44336`

---

## 7. Technical Stack Recommendation

### Frontend
- **React** + TypeScript
- **D3.js** or **Recharts** for visualization
- **React Flow** for interactive node graph (alternative)
- **Framer Motion** for smooth animations
- **Tailwind CSS** for styling

### Backend API
- **GET /api/architecture/layers** - Get all layers
- **GET /api/architecture/components?layer_id={id}** - Get components by layer
- **GET /api/systems?component_id={id}** - Get systems by component
- **GET /api/systems/{id}** - Get system detail
- **GET /api/architecture/metrics** - Get completion metrics

### State Management
- React Query for data fetching
- Zustand for UI state (expanded/collapsed)

---

## 8. Success Metrics

### Adoption
- 80%+ Lãnh đạo Bộ login and view dashboard weekly
- Average session duration > 5 minutes
- 50%+ users interact with drill-down feature

### Usability
- Time to find specific system < 30 seconds
- 90%+ users can navigate without help
- < 5% error/confusion rate

### Business Impact
- Faster strategic decision-making (qualitative)
- Better platform roadmap planning
- Increased visibility of system status

---

## 9. Out of Scope (v1)

- ❌ Real-time system monitoring (logs, metrics)
- ❌ System performance analytics
- ❌ Incident alerting
- ❌ Cost tracking per system
- ❌ User access control matrix
- ❌ Editing diagram structure from UI
- ❌ AI-powered recommendations

These can be P2 features for future iterations.

---

## 10. Dependencies

### Data Dependencies
- Systems table must have `architecture_layer_id` and `architecture_component_id`
- Architecture layers and components data must be seeded
- System status data must be up-to-date

### Design Dependencies
- Figma mockup approval from stakeholders
- Color scheme aligned with overall dashboard design

### Technical Dependencies
- Backend API endpoints ready
- Authentication & authorization working
- Database schema migration complete

---

## 11. Risks & Mitigations

### Risk 1: Data không đầy đủ
**Impact**: Medium
**Probability**: High
**Mitigation**:
- Có fallback UI cho systems chưa map (show as "Unmapped")
- Admin tool để bulk assign layer/component

### Risk 2: Performance với nhiều systems
**Impact**: High
**Probability**: Medium
**Mitigation**:
- Lazy loading cho drill-down
- Pagination cho system list
- Caching với React Query

### Risk 3: Diagram quá phức tạp
**Impact**: Medium
**Probability**: Medium
**Mitigation**:
- Progressive disclosure (chỉ show detail khi cần)
- Grouping thông minh
- Configurable view (simple vs detailed)

---

## 12. Next Steps

1. ✅ Requirements defined → **This document**
2. ⏭️ Design wireframe/mockup
3. ⏭️ Database schema design
4. ⏭️ API endpoint specification
5. ⏭️ Frontend component architecture
6. ⏭️ Implementation plan
