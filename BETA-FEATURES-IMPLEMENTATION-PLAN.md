# Plan Triển Khai 5 Premium Features (BETA Demo)

**Mục tiêu:** Minh họa tiềm năng của các premium features với sample data, chưa thu phí
**Trạng thái:** BETA - Demo only
**Timeline ước tính:** 2-3 tuần full-time development

---

## 🎯 OVERVIEW

Triển khai 5 features ở chế độ demo/mockup với:
- ✅ Sample data realistic
- ✅ UI/UX đẹp, professional
- ✅ Enough functionality để showcase value
- ✅ "BETA" badge trên mỗi feature
- ❌ KHÔNG có pricing info
- ❌ KHÔNG có payment/subscription logic

---

## 📋 IMPLEMENTATION PLAN

### Feature 1: Intelligent Analytics & AI-Powered Insights

**Route:** `/analytics` (new page)

**UI Components:**

1. **System Landscape Map**
   - Interactive network graph (nodes = systems, edges = integrations)
   - Color-coded by technology stack (React = blue, .NET = green, Java = orange)
   - Hover để xem system details
   - Zoom & pan controls
   - Library: `react-force-graph-2d` hoặc `reactflow`

2. **AI Insights Dashboard**
   - Card grid với các insights:
     - 🔴 "Phát hiện 3 hệ thống sử dụng công nghệ lỗi thời (PHP 5.6, Python 2.7)"
     - 🟡 "5 hệ thống có vendor dependency cao (>80%)"
     - 🟢 "Cơ hội tích hợp: Hệ thống A và B đều cần chức năng X"
     - 💰 "Dự báo chi phí 2026: 45B VND (+12% vs 2025)"
   - Each card có "View Details" button

3. **Cost Forecast Chart**
   - Line chart dự báo chi phí 2026-2028
   - Breakdown by: Development, Maintenance, Infrastructure, License
   - Confidence interval (best/worst case scenarios)

4. **Technology Silo Detection**
   - Table showing duplicate technology stacks:
     - "3 hệ thống đều dùng PostgreSQL nhưng không share data"
     - "4 hệ thống có chức năng authentication riêng"
   - Recommendation: "Xây dựng shared services có thể tiết kiệm 800M VND/năm"

**Sample Data:**
```javascript
// Mock AI insights
const insights = [
  {
    type: 'risk',
    severity: 'high',
    title: 'Phát hiện 3 hệ thống sử dụng công nghệ lỗi thời',
    description: 'Hệ thống Quản lý văn bản (PHP 5.6), Hệ thống Kế toán cũ (Python 2.7), Portal cũ (AngularJS 1.x)',
    impact: 'Rủi ro bảo mật cao, khó maintain',
    recommendation: 'Ưu tiên migrate trong Q2-Q3 2026'
  },
  // ... 8-10 insights
];

// Mock cost forecast
const costForecast = {
  '2026': { development: 15, maintenance: 18, infrastructure: 8, license: 4 },
  '2027': { development: 17, maintenance: 20, infrastructure: 9, license: 5 },
  '2028': { development: 18, maintenance: 22, infrastructure: 10, license: 6 }
};

// Mock system connections for graph
const systemGraph = {
  nodes: [
    { id: 1, name: 'Hệ thống quản lý văn bản', tech: 'React', color: '#0066e6' },
    { id: 2, name: 'Hệ thống nhân sự', tech: '.NET', color: '#52c41a' },
    // ... 20-30 systems
  ],
  links: [
    { source: 1, target: 2, type: 'API' },
    // ... integrations
  ]
};
```

**Technical Implementation:**
- New page: `frontend/src/pages/Analytics.tsx`
- Components:
  - `SystemLandscapeGraph.tsx` (network visualization)
  - `AIInsightsGrid.tsx` (insight cards)
  - `CostForecastChart.tsx` (Recharts)
  - `TechnologySiloTable.tsx`
- Mock data: `frontend/src/mocks/analytics.ts`

---

### Feature 2: Approval Workflow & Digital Signature

**Route:** `/approvals` (new page)

**UI Components:**

1. **Workflow Kanban Board**
   - 4 columns: Pending Review → In Progress → Approved → Rejected
   - Draggable cards (react-beautiful-dnd)
   - Each card shows:
     - System name
     - Requester
     - Current approver
     - Days pending
     - Urgency badge

2. **Approval Detail Modal**
   - System information
   - Approval history timeline:
     - ✅ Technical Owner approved (2 days ago)
     - 🔄 Business Owner reviewing (current)
     - ⏳ CIO pending
   - Comment thread
   - "Ký số" button (simulated - shows success modal)
   - Attach files (mockup)

3. **Approval Stats Dashboard**
   - KPI cards:
     - Average approval time: 4.2 days
     - Success rate: 87%
     - Pending approvals: 12
   - Chart: Approval time trend (last 6 months)

4. **E-Signature Simulation**
   - Modal showing "Đang kết nối với VNPT CA..."
   - Success animation
   - Download signed PDF (mock file)

**Sample Data:**
```javascript
const approvalRequests = [
  {
    id: 1,
    systemName: 'Hệ thống Quản lý Dự án Khoa học',
    requester: 'Nguyễn Văn A - Vụ Khoa học',
    status: 'pending_business_owner',
    stages: [
      { role: 'Technical Owner', user: 'Trần B', status: 'approved', date: '2026-01-16', comment: 'Kiến trúc hợp lý' },
      { role: 'Business Owner', user: 'Lê C', status: 'reviewing', date: null },
      { role: 'CIO', user: 'Phạm D', status: 'pending', date: null }
    ],
    daysPending: 2,
    urgency: 'high'
  },
  // ... 15-20 requests
];
```

**Technical Implementation:**
- New page: `frontend/src/pages/Approvals.tsx`
- Components:
  - `ApprovalKanban.tsx` (kanban board)
  - `ApprovalDetailModal.tsx`
  - `ApprovalTimeline.tsx`
  - `ESignatureSimulator.tsx` (modal with animation)
- Mock data: `frontend/src/mocks/approvals.ts`

---

### Feature 3: Benchmarking Database

**Route:** `/benchmarking` (new page)

**UI Components:**

1. **Comparison Dashboard**
   - Select your system to compare
   - Radar chart comparing 6 metrics:
     - Cost per user
     - Uptime %
     - Response time
     - User satisfaction
     - Vendor dependency
     - Technical debt level
   - Your system vs Industry average (color-coded)

2. **Benchmark Table**
   - Filterable table showing:
     - Metric name
     - Your value
     - Industry avg
     - Best in class
     - Percentile rank
     - Trend (↑↓→)
   - Click to see detailed breakdown

3. **Best Practices Library**
   - Categorized accordion:
     - 📋 RFP Templates (3 templates)
     - 📄 SLA Templates (2 templates)
     - 🔧 O&M Contract Templates (2 templates)
     - 📚 Migration Case Studies (5 studies)
   - Each item: Title, Description, Download button

4. **Case Studies Showcase**
   - Card grid showing success stories:
     - "Bộ A migrate từ Oracle sang PostgreSQL - Tiết kiệm 2B VND/năm"
     - "Sở B hợp nhất 5 hệ thống thành 1 - Giảm 60% chi phí vận hành"
   - Click để xem full case study (modal với timeline, challenges, results)

**Sample Data:**
```javascript
const benchmarks = {
  systemId: 5,
  systemName: 'Hệ thống Quản lý Văn bản',
  metrics: [
    {
      name: 'Chi phí/người dùng/năm',
      yourValue: 850000,
      industryAvg: 720000,
      bestInClass: 520000,
      percentile: 35,
      trend: 'up'
    },
    // ... 10-12 metrics
  ]
};

const bestPractices = [
  {
    category: 'RFP Templates',
    items: [
      {
        title: 'RFP Mẫu - Hệ thống Quản lý Dự án',
        description: 'Template đầy đủ với yêu cầu kỹ thuật, tiêu chí đánh giá',
        size: '450 KB',
        downloads: 127
      },
      // ... 3 templates
    ]
  },
  // ... other categories
];

const caseStudies = [
  {
    id: 1,
    title: 'Migration Oracle → PostgreSQL',
    organization: 'Bộ A',
    year: 2024,
    challenge: 'Chi phí license Oracle quá cao',
    solution: 'Migrate toàn bộ sang PostgreSQL + pgAdmin',
    timeline: '6 tháng',
    results: {
      costSaving: '2B VND/năm',
      performanceImprovement: '+15%',
      downtimeRequired: '4 giờ'
    }
  },
  // ... 5 studies
];
```

**Technical Implementation:**
- New page: `frontend/src/pages/Benchmarking.tsx`
- Components:
  - `BenchmarkRadarChart.tsx` (Recharts radar)
  - `BenchmarkComparisonTable.tsx`
  - `BestPracticesLibrary.tsx` (accordion)
  - `CaseStudyCard.tsx` + `CaseStudyModal.tsx`
- Mock data: `frontend/src/mocks/benchmarking.ts`

---

### Feature 4: System Lifecycle & Planning Pipeline

**Route:** `/lifecycle` (new page)

**UI Components:**

1. **Lifecycle Roadmap**
   - Timeline visualization (horizontal) showing all systems
   - Color-coded by phase:
     - 🔵 Planning (5 systems)
     - 🟢 Development (3 systems)
     - 🟡 Active (45 systems)
     - 🟠 Maintenance (8 systems)
     - 🔴 Retirement planned (2 systems)
   - Zoom controls (1 year / 3 years / 5 years view)
   - Hover to see details + milestones

2. **Planning Pipeline**
   - Table of systems in planning phase:
     - System name
     - Budget estimate
     - Vendor selection status
     - Expected go-live
     - Priority
     - Owner
   - Click row để xem planning details

3. **Budget Planning Dashboard**
   - Stacked area chart: Plan vs Actual spend (2024-2026)
   - Budget breakdown pie chart (by system type)
   - Forecast for 2027-2028
   - Alert cards:
     - ⚠️ "Hệ thống X vượt ngân sách 15%"
     - ✅ "Hệ thống Y tiết kiệm được 800M VND"

4. **System Lifecycle Details Modal**
   - Tab navigation:
     - Overview (current phase, milestones)
     - Timeline (Gantt chart of past/future milestones)
     - Budget (planned vs actual)
     - Dependencies (what systems depend on this)
     - Documents (requirements, contracts)

**Sample Data:**
```javascript
const lifecycleTimeline = [
  {
    systemId: 1,
    systemName: 'Portal mới',
    phase: 'development',
    milestones: [
      { name: 'Kick-off', date: '2025-10-01', status: 'completed' },
      { name: 'Design complete', date: '2025-12-15', status: 'completed' },
      { name: 'Development', date: '2026-03-30', status: 'in_progress' },
      { name: 'UAT', date: '2026-05-15', status: 'planned' },
      { name: 'Go-live', date: '2026-06-30', status: 'planned' }
    ],
    budget: { planned: 5000000000, actual: 3800000000 }
  },
  // ... 20 systems
];

const planningPipeline = [
  {
    systemName: 'Hệ thống AI Chatbot',
    budgetEstimate: 3000000000,
    vendorSelectionStatus: 'RFP sent - waiting responses',
    expectedGoLive: '2026-Q4',
    priority: 'high',
    owner: 'Vụ CNTT'
  },
  // ... 5-8 systems
];
```

**Technical Implementation:**
- New page: `frontend/src/pages/Lifecycle.tsx`
- Components:
  - `LifecycleRoadmap.tsx` (custom timeline visualization)
  - `PlanningPipelineTable.tsx`
  - `BudgetPlanningChart.tsx` (Recharts)
  - `SystemLifecycleModal.tsx` (tabbed interface)
- Mock data: `frontend/src/mocks/lifecycle.ts`
- Library: `react-chrono` hoặc `vis-timeline` cho timeline

---

### Feature 5: API Catalog & Integration Hub

**Route:** `/api-catalog` (new page)

**UI Components:**

1. **API Catalog Table**
   - Filterable/searchable table:
     - API name
     - System
     - Endpoint (e.g., `GET /api/v1/users`)
     - Authentication type
     - Status (Active/Deprecated)
     - Health (uptime %)
     - Last tested
   - Click row để xem API details

2. **API Detail Panel**
   - OpenAPI/Swagger UI embedded (mockup)
   - Tabs:
     - **Overview:** Description, owner, SLA
     - **Documentation:** Request/response examples
     - **Health:** Uptime chart, response time chart
     - **Usage:** Which systems are consuming this API
     - **SDK:** Sample code (Python, JavaScript, Java)

3. **Integration Marketplace**
   - Card grid showing "pre-built integrations":
     - "Hệ thống A ↔ Hệ thống B: User sync"
     - "Hệ thống C ↔ Hệ thống D: Document sharing"
   - Each card:
     - Title
     - Description
     - Systems involved
     - "Use this integration" button (shows setup guide)

4. **API Health Monitoring Dashboard**
   - World map showing API endpoints (mockup - all Vietnam)
   - Real-time status board:
     - 🟢 42 APIs healthy
     - 🟡 3 APIs slow (>500ms)
     - 🔴 1 API down
   - Alert feed (recent incidents)

**Sample Data:**
```javascript
const apiCatalog = [
  {
    id: 1,
    name: 'User Management API',
    system: 'Hệ thống Quản lý Nhân sự',
    baseUrl: 'https://hr.mindmaid.ai/api/v1',
    endpoints: [
      { method: 'GET', path: '/users', description: 'List all users' },
      { method: 'POST', path: '/users', description: 'Create user' },
      { method: 'GET', path: '/users/{id}', description: 'Get user detail' }
    ],
    authentication: 'OAuth 2.0',
    status: 'active',
    health: {
      uptime: 99.8,
      avgResponseTime: 145,
      lastTested: '2026-01-18T10:30:00Z'
    },
    consumers: ['Hệ thống Portal', 'Hệ thống Văn bản']
  },
  // ... 15-20 APIs
];

const integrations = [
  {
    id: 1,
    name: 'HR ↔ Portal: Single Sign-On',
    description: 'Đồng bộ users từ HR sang Portal, SSO tự động',
    systems: ['Hệ thống Nhân sự', 'Portal'],
    type: 'User sync',
    setupTime: '2 hours',
    documentation: 'https://docs.example.com/hr-portal-sso'
  },
  // ... 8-10 integrations
];
```

**Technical Implementation:**
- New page: `frontend/src/pages/APICatalog.tsx`
- Components:
  - `APICatalogTable.tsx`
  - `APIDetailPanel.tsx` (drawer or modal)
  - `IntegrationMarketplace.tsx` (card grid)
  - `APIHealthDashboard.tsx`
  - `SwaggerUIEmbed.tsx` (mockup - not real Swagger)
- Mock data: `frontend/src/mocks/apiCatalog.ts`

---

## 🎨 GLOBAL UI ELEMENTS

### BETA Badge Component
```tsx
// Add to all 5 feature pages
<Tag color="blue" icon={<ExperimentOutlined />}>
  BETA
</Tag>
```

### Feature Info Card
```tsx
// Top of each page
<Alert
  message="Tính năng BETA - Đang trong giai đoạn thử nghiệm"
  description="Dữ liệu hiển thị là mẫu để minh họa tiềm năng của tính năng. Vui lòng liên hệ để được tư vấn chi tiết."
  type="info"
  showIcon
  closable
/>
```

### Navigation Updates
Add to main menu (Layout.tsx):
```tsx
{
  key: 'analytics',
  icon: <LineChartOutlined />,
  label: 'Phân tích thông minh',
  badge: 'BETA'
},
{
  key: 'approvals',
  icon: <CheckCircleOutlined />,
  label: 'Phê duyệt & Ký số',
  badge: 'BETA'
},
{
  key: 'benchmarking',
  icon: <BarChartOutlined />,
  label: 'Benchmarking',
  badge: 'BETA'
},
{
  key: 'lifecycle',
  icon: <ProjectOutlined />,
  label: 'Quản lý vòng đời',
  badge: 'BETA'
},
{
  key: 'api-catalog',
  icon: <ApiOutlined />,
  label: 'API Catalog',
  badge: 'BETA'
}
```

---

## 📁 FILE STRUCTURE

```
frontend/src/
├── pages/
│   ├── Analytics.tsx                    # NEW
│   ├── Approvals.tsx                    # NEW
│   ├── Benchmarking.tsx                 # NEW
│   ├── Lifecycle.tsx                    # NEW
│   └── APICatalog.tsx                   # NEW
│
├── components/
│   ├── analytics/
│   │   ├── SystemLandscapeGraph.tsx     # NEW
│   │   ├── AIInsightsGrid.tsx           # NEW
│   │   ├── CostForecastChart.tsx        # NEW
│   │   └── TechnologySiloTable.tsx      # NEW
│   │
│   ├── approvals/
│   │   ├── ApprovalKanban.tsx           # NEW
│   │   ├── ApprovalDetailModal.tsx      # NEW
│   │   ├── ApprovalTimeline.tsx         # NEW
│   │   └── ESignatureSimulator.tsx      # NEW
│   │
│   ├── benchmarking/
│   │   ├── BenchmarkRadarChart.tsx      # NEW
│   │   ├── BenchmarkComparisonTable.tsx # NEW
│   │   ├── BestPracticesLibrary.tsx     # NEW
│   │   ├── CaseStudyCard.tsx            # NEW
│   │   └── CaseStudyModal.tsx           # NEW
│   │
│   ├── lifecycle/
│   │   ├── LifecycleRoadmap.tsx         # NEW
│   │   ├── PlanningPipelineTable.tsx    # NEW
│   │   ├── BudgetPlanningChart.tsx      # NEW
│   │   └── SystemLifecycleModal.tsx     # NEW
│   │
│   ├── api-catalog/
│   │   ├── APICatalogTable.tsx          # NEW
│   │   ├── APIDetailPanel.tsx           # NEW
│   │   ├── IntegrationMarketplace.tsx   # NEW
│   │   ├── APIHealthDashboard.tsx       # NEW
│   │   └── SwaggerUIEmbed.tsx           # NEW
│   │
│   └── common/
│       └── BetaBadge.tsx                # NEW
│
├── mocks/
│   ├── analytics.ts                     # NEW
│   ├── approvals.ts                     # NEW
│   ├── benchmarking.ts                  # NEW
│   ├── lifecycle.ts                     # NEW
│   └── apiCatalog.ts                    # NEW
│
└── routes.tsx                           # MODIFIED (add new routes)
```

---

## 📦 NEW DEPENDENCIES

```json
{
  "dependencies": {
    "react-force-graph-2d": "^1.25.4",      // For system landscape graph
    "react-beautiful-dnd": "^13.1.1",       // For kanban drag-drop
    "react-chrono": "^2.6.1",               // For timeline visualization
    "@ant-design/charts": "^2.0.0",         // Advanced charts
    "swagger-ui-react": "^5.11.0"           // For API documentation UI (mockup)
  }
}
```

---

## 🔧 TECHNICAL APPROACH

### 1. Mock Data Strategy
- All data in `frontend/src/mocks/*.ts` files
- TypeScript interfaces matching backend models
- Realistic Vietnamese data (tên hệ thống, tên người, đơn vị thực tế)
- 20-30 items per dataset để có đủ data for charts/tables

### 2. State Management
- Use React Context hoặc Zustand cho mock data
- No API calls needed (all client-side)
- Easy to swap with real API later

### 3. Responsive Design
- All features mobile-responsive
- Use Ant Design Grid system
- Collapse complex views on mobile

### 4. Performance
- Lazy load feature pages (React.lazy + Suspense)
- Memoize expensive components (React.memo)
- Virtual scrolling for long lists (Ant Design Table built-in)

### 5. Code Quality
- TypeScript strict mode
- Consistent component structure
- Reusable utility functions in `utils/`

---

## ✅ IMPLEMENTATION PRIORITY

### Phase 1 (Week 1): Foundation + Feature 1, 2
- [ ] Setup new dependencies
- [ ] Create mock data files
- [ ] Build Feature 1: Analytics (System Landscape + AI Insights)
- [ ] Build Feature 2: Approvals (Kanban + E-Signature simulation)
- [ ] Update navigation menu with BETA badges

### Phase 2 (Week 2): Feature 3, 4
- [ ] Build Feature 3: Benchmarking (Radar chart + Best practices)
- [ ] Build Feature 4: Lifecycle (Roadmap + Planning pipeline)

### Phase 3 (Week 3): Feature 5 + Polish
- [ ] Build Feature 5: API Catalog (Table + Health monitoring)
- [ ] Polish all UIs (animations, loading states)
- [ ] Cross-browser testing
- [ ] Mobile responsive testing
- [ ] Documentation (cho từng feature)

---

## 🎯 SUCCESS CRITERIA

- [ ] All 5 features accessible from main menu
- [ ] Each feature có "BETA" badge rõ ràng
- [ ] Sample data đủ realistic để impress
- [ ] UI/UX professional, consistent với design system hiện tại
- [ ] Mobile-responsive
- [ ] No console errors
- [ ] Fast load time (<2s per page)
- [ ] KHÔNG có mention về pricing/payment anywhere

---

## 📝 DOCUMENTATION

Tạo file `BETA-FEATURES-GUIDE.md` để hướng dẫn:
- Mục đích của từng feature
- Cách sử dụng
- Sample data scenario
- Roadmap (khi nào release production)

---

## ❓ QUESTIONS FOR REVIEW

1. **Priority order:** Có muốn thay đổi thứ tự triển khai không? (Hiện tại: Analytics → Approvals → Benchmarking → Lifecycle → API Catalog)

2. **Mock data realism:** Có cần dữ liệu gần với thực tế Bộ KH&CN hơn không? (Tên hệ thống thực, tên Vụ/Cục thực?)

3. **Interactive level:** Features nào cần interactive cao (click được, filter được) vs nào chỉ cần static visualization?

4. **Branding:** Có cần thêm logo/branding riêng cho premium features không?

5. **Analytics mockup:** AI insights có cần "look smart" hơn (e.g., typing animation, percentage scores) hay đơn giản text cards là đủ?

---

**Estimated Effort:**
- **Development:** 80-100 hours (2-3 weeks full-time)
- **Testing & Polish:** 20 hours
- **Documentation:** 10 hours
- **Total:** ~110-130 hours

**Ready to proceed?** Review plan này và cho tôi biết:
- ✅ Approve as-is
- 🔄 Cần adjust gì
- ❌ Cần rethink approach
