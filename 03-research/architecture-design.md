# KIẾN TRÚC HỆ THỐNG - BÁO CÁO THỐNG KÊ HỆ THỐNG

**Ngày thiết kế**: 2026-01-14
**Architect**: Claude Code
**Tech Stack**: Python FastAPI + React + PostgreSQL

---

## I. TỔNG QUAN KIẾN TRÚC

### 1.1. Kiến trúc 3-tier

```
┌─────────────────────────────────────────────────────────┐
│                    CLIENT TIER                          │
│  React + TypeScript + Ant Design                        │
│  - Form Builder (dynamic form generation)               │
│  - File Upload Component                                │
│  - Report Preview                                       │
│  - Dashboard / Analytics                                │
└─────────────────────────────────────────────────────────┘
                          ↓ REST API (JSON)
┌─────────────────────────────────────────────────────────┐
│                   APPLICATION TIER                       │
│  FastAPI (Python 3.10+)                                 │
│  - Auth & Authorization (JWT)                           │
│  - CRUD APIs for Organizations & Systems                │
│  - Validation Layer (Pydantic)                          │
│  - File Processing Service                              │
│  - Report Generation Service:                           │
│    • Word export (python-docx)                          │
│    • Excel export (openpyxl)                            │
│  - Integration Service (API for external systems)       │
└─────────────────────────────────────────────────────────┘
                          ↓ SQLAlchemy ORM
┌─────────────────────────────────────────────────────────┐
│                     DATA TIER                           │
│  PostgreSQL 14+                                         │
│  - organizations                                        │
│  - systems                                              │
│  - system_architecture                                  │
│  - system_data_info                                     │
│  - system_operations                                    │
│  - integrations                                         │
│  - attachments                                          │
│  - users / audit_logs                                   │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│                  FILE STORAGE                           │
│  Local File System / S3-compatible (MinIO)              │
│  - Architecture diagrams                                │
│  - ERD / Data Dictionary                                │
│  - API docs, Contracts, Reports                         │
└─────────────────────────────────────────────────────────┘
```

### 1.2. Design Principles

1. **Separation of Concerns**: Frontend/Backend/Database độc lập
2. **API-First**: RESTful API với OpenAPI docs
3. **Type Safety**: TypeScript frontend + Pydantic backend
4. **Validation-Driven**: Validate ở cả frontend & backend
5. **Stateless Backend**: JWT authentication, scale horizontal dễ
6. **File Independence**: File storage tách rời, có thể swap (local → S3)

---

## II. DATA ARCHITECTURE

### 2.1. Entity Relationship Diagram

```
┌─────────────────────┐
│   organizations     │
│  (Đơn vị)          │
│─────────────────────│
│ * id (PK)          │
│   code (UNIQUE)    │
│   name             │
│   contact_person   │
│   email, phone     │
│   status           │
└─────────────────────┘
          │ 1
          │
          │ N
          ▼
┌─────────────────────┐     1:N    ┌──────────────────────┐
│      systems        │────────────│  system_architecture  │
│  (Hệ thống)        │            │   (Kiến trúc)         │
│─────────────────────│            │──────────────────────│
│ * id (PK)          │            │ * id (PK)            │
│   org_id (FK)      │            │   system_id (FK)     │
│   system_code      │            │   architecture_type  │
│   system_name      │            │   frontend_tech      │
│   purpose          │            │   backend_tech       │
│   scope            │            │   db_type            │
│   form_level       │            │   has_ci_cd          │
│   go_live_date     │            │   ...                │
│   criticality      │            └──────────────────────┘
│   users_total      │
│   users_mau        │            ┌──────────────────────┐
│   status           │     1:N    │  system_data_info    │
└─────────────────────┘────────────│   (Dữ liệu)          │
          │                        │──────────────────────│
          │                        │ * id (PK)            │
          │ N                      │   system_id (FK)     │
          │                        │   db_type            │
          ▼                        │   storage_size_gb    │
┌─────────────────────┐            │   growth_rate        │
│   integrations      │            │   has_api            │
│   (Tích hợp)       │            │   ...                │
│─────────────────────│            └──────────────────────┘
│ * id (PK)          │
│   system_id_from   │            ┌──────────────────────┐
│   system_id_to     │     1:N    │  system_operations   │
│   data_exchanged   │────────────│   (Vận hành)         │
│   method           │            │──────────────────────│
│   frequency        │            │ * id (PK)            │
└─────────────────────┘            │   system_id (FK)     │
          │                        │   vendor_name        │
          │                        │   warranty_end_date  │
          │ N                      │   sla_uptime         │
          │                        │   ...                │
          ▼                        └──────────────────────┘
┌─────────────────────┐
│    attachments      │            ┌──────────────────────┐
│  (Tài liệu)        │     1:N    │  system_assessment   │
│─────────────────────│────────────│   (Đánh giá)         │
│ * id (PK)          │            │──────────────────────│
│   system_id (FK)   │            │ * id (PK)            │
│   file_type        │            │   system_id (FK)     │
│   file_name        │            │   strengths          │
│   file_path        │            │   weaknesses         │
│   file_size_kb     │            │   unit_proposal      │
└─────────────────────┘            └──────────────────────┘

                                   ┌──────────────────────┐
                            1:N    │   system_costs       │
                        ───────────│   (Chi phí)          │
                                   │──────────────────────│
                                   │ * id (PK)            │
                                   │   system_id (FK)     │
                                   │   initial_cost       │
                                   │   annual_cost        │
                                   └──────────────────────┘

                                   ┌──────────────────────┐
                            1:N    │   system_vendors     │
                        ───────────│   (Nhà thầu)         │
                                   │──────────────────────│
                                   │ * id (PK)            │
                                   │   system_id (FK)     │
                                   │   vendor_name        │
                                   │   contract_number    │
                                   └──────────────────────┘

┌─────────────────────┐
│       users         │
│  (Người dùng)      │
│─────────────────────│
│ * id (PK)          │
│   username         │
│   email            │
│   org_id (FK)      │
│   role             │
└─────────────────────┘
          │
          │ 1:N
          ▼
┌─────────────────────┐
│    audit_logs       │
│  (Nhật ký)         │
│─────────────────────│
│ * id (PK)          │
│   user_id (FK)     │
│   action           │
│   entity_type      │
│   entity_id        │
│   details (JSONB)  │
└─────────────────────┘
```

### 2.2. Key Tables Summary

| Table | Purpose | Key Fields | Cardinality |
|-------|---------|------------|-------------|
| **organizations** | Đơn vị trong Bộ | code, name, contact | Root entity |
| **systems** | Hệ thống/ứng dụng | system_code, name, form_level | 1 org → N systems |
| **system_architecture** | Kiến trúc kỹ thuật | arch_type, tech stack, ci/cd | 1:1 với system |
| **system_data_info** | Thông tin dữ liệu | storage, growth, has_api | 1:1 với system |
| **system_operations** | Vận hành & ATTT | vendor, sla, security | 1:1 với system |
| **integrations** | Tích hợp liên thông | from/to system, method | N:N giữa systems |
| **attachments** | File đính kèm | file_type, path, size | N per system |
| **system_assessment** | Đánh giá tự nhận | strengths, weaknesses | 1:1 với system |
| **system_costs** | Chi phí | initial_cost, annual_cost | 1:1 với system |
| **system_vendors** | Nhà thầu | vendor_name, contract | N per system |
| **users** | User accounts | username, role, org_id | N users |
| **audit_logs** | Audit trail | action, entity, details | Audit all actions |

### 2.3. JSONB Fields Strategy

PostgreSQL JSONB được dùng cho:

1. **Flexible Arrays**:
   - `target_users`: `["leader", "staff", "business"]`
   - `data_types`: `["business", "documents", "statistics"]`
   - `common_catalogs`: `["units", "locations", "standards"]`

2. **Complex Objects**:
   - `environments`: `{"dev": true, "test": true, "prod": true}`
   - `has_layers`: `{"presentation": true, "business": true}`
   - `licenses`: `[{"type": "DB", "product": "Oracle", "qty": 2}]`

3. **Audit Details**:
   - `audit_logs.details`: Store full diff of changes

**Lý do dùng JSONB**:
- Flexible schema cho dữ liệu không cố định
- Index được (GIN index)
- Query được với operators: `@>`, `?`, `?&`
- Tránh tạo quá nhiều tables nhỏ

---

## III. APPLICATION ARCHITECTURE

### 3.1. Backend Structure (FastAPI)

```
backend/
├── app/
│   ├── main.py                      # FastAPI app entry
│   ├── config.py                    # Settings (DB, secrets)
│   ├── database.py                  # SQLAlchemy connection
│   │
│   ├── models/                      # SQLAlchemy ORM models
│   │   ├── organization.py          # Organization model
│   │   ├── system.py                # System + related tables
│   │   ├── user.py                  # User & audit
│   │   └── ...
│   │
│   ├── schemas/                     # Pydantic schemas (validation)
│   │   ├── organization.py          # OrganizationCreate, Response
│   │   ├── system.py                # SystemCreate, Update, Response
│   │   └── ...
│   │
│   ├── api/                         # API routes
│   │   ├── deps.py                  # Dependency injection (auth, db)
│   │   ├── auth.py                  # POST /auth/login, /register
│   │   ├── organizations.py         # CRUD /organizations
│   │   ├── systems.py               # CRUD /systems
│   │   ├── integrations.py          # /systems/{id}/integrations
│   │   ├── attachments.py           # /systems/{id}/attachments
│   │   └── reports.py               # /reports/word, /reports/excel
│   │
│   ├── services/                    # Business logic
│   │   ├── word_export.py           # Generate Word report
│   │   ├── excel_export.py          # Generate Excel 3 sheets
│   │   ├── validation.py            # Business validation rules
│   │   └── file_storage.py          # File upload/download
│   │
│   └── core/                        # Core utilities
│       ├── security.py              # JWT, password hashing
│       └── utils.py                 # Helpers
```

### 3.2. API Design

**RESTful API Endpoints**:

```
Authentication
POST   /api/auth/login              # Login, return JWT
POST   /api/auth/register           # Register new user
GET    /api/auth/me                 # Get current user

Organizations
GET    /api/organizations           # List orgs (admin: all, user: own)
POST   /api/organizations           # Create org (admin only)
GET    /api/organizations/{id}      # Get org detail
PUT    /api/organizations/{id}      # Update org
DELETE /api/organizations/{id}      # Delete org

Systems
GET    /api/systems                 # List all systems (with filters)
GET    /api/systems?org_id={id}     # Filter by org
POST   /api/systems                 # Create system
GET    /api/systems/{id}            # Get system full detail (all relations)
PUT    /api/systems/{id}            # Update system
DELETE /api/systems/{id}            # Delete system (cascade)

System Relations
GET    /api/systems/{id}/architecture     # Get architecture info
PUT    /api/systems/{id}/architecture     # Update architecture
GET    /api/systems/{id}/data-info        # Get data info
PUT    /api/systems/{id}/data-info        # Update data info
GET    /api/systems/{id}/operations       # Get operations
PUT    /api/systems/{id}/operations       # Update operations
GET    /api/systems/{id}/assessment       # Get assessment
PUT    /api/systems/{id}/assessment       # Update assessment

Integrations
GET    /api/systems/{id}/integrations     # List integrations for system
POST   /api/systems/{id}/integrations     # Add integration
PUT    /api/integrations/{id}             # Update integration
DELETE /api/integrations/{id}             # Delete integration

Attachments
GET    /api/systems/{id}/attachments      # List files
POST   /api/systems/{id}/attachments      # Upload file
GET    /api/attachments/{id}/download     # Download file
DELETE /api/attachments/{id}              # Delete file

Reports
POST   /api/reports/word                  # Generate Word report
       Body: {system_ids: [...], form_level: 1|2}
       Returns: {download_url: "..."}

POST   /api/reports/excel                 # Generate Excel 3 sheets
       Body: {org_id?: number, system_ids?: [...]}
       Returns: {download_url: "..."}

Dashboard (Admin)
GET    /api/dashboard/stats               # Overall statistics
GET    /api/dashboard/systems-by-tech     # Group by tech stack
GET    /api/dashboard/integration-map     # Integration network
```

**Response Format**:
```json
{
  "success": true,
  "data": { ... },
  "message": "Success",
  "timestamp": "2026-01-14T10:00:00Z"
}
```

**Error Format**:
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": [
      {"field": "storage_size_gb", "message": "Phải có số liệu cụ thể"}
    ]
  },
  "timestamp": "2026-01-14T10:00:00Z"
}
```

### 3.3. Authentication & Authorization

**JWT-based Authentication**:
```python
# Token payload
{
  "sub": "user_id",
  "username": "john.doe",
  "org_id": 5,
  "role": "org_admin",
  "exp": 1704830400
}
```

**Roles**:
- `admin`: Bộ (full access)
- `org_admin`: Quản lý đơn vị (CRUD systems của org mình)
- `user`: Người nhập liệu (read/update systems của org mình)

**Permission Matrix**:

| Action | admin | org_admin | user |
|--------|-------|-----------|------|
| View all orgs | ✅ | ❌ (chỉ org mình) | ❌ |
| Create org | ✅ | ❌ | ❌ |
| Create system | ✅ | ✅ | ✅ |
| Edit system (own org) | ✅ | ✅ | ✅ |
| Edit system (other org) | ✅ | ❌ | ❌ |
| Delete system | ✅ | ✅ | ❌ |
| Export reports (own org) | ✅ | ✅ | ✅ |
| Export consolidated reports | ✅ | ❌ | ❌ |
| View dashboard | ✅ | ❌ (limited) | ❌ |

### 3.4. Validation Strategy

**5-layer Validation**:

1. **Frontend Validation** (React Hook Form + Zod)
   - Immediate feedback
   - Required fields
   - Format validation (email, phone, numbers)

2. **Backend Pydantic Validation**
   - Type checking
   - Range validation
   - Pattern matching

3. **Business Logic Validation** (services/validation.py)
   - **Rule 1**: No vague terms → Check for specific numbers
   - **Rule 2**: Contract info must have number + date
   - **Rule 3**: Integrations must list flows
   - **Rule 4**: Data must have size + growth + sensitivity
   - **Rule 5**: If no docs, must say "KHÔNG CÓ" + reason

4. **Database Constraints**
   - UNIQUE constraints (org code, system code)
   - Foreign keys
   - NOT NULL
   - CHECK constraints

5. **Custom Validators**
   ```python
   # Example: Validate no vague terms
   VAGUE_TERMS = ["ổn định", "lớn", "tốt", "nhiều"]

   def validate_no_vague_terms(text: str, field: str):
       for term in VAGUE_TERMS:
           if term in text.lower():
               raise ValidationError(
                   f"{field}: Không dùng từ '{term}'. "
                   f"Vui lòng cung cấp số liệu cụ thể."
               )
   ```

---

## IV. FRONTEND ARCHITECTURE

### 4.1. Technology Stack

- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite (fast HMR)
- **Routing**: React Router v6
- **UI Library**: Ant Design 5 (comprehensive components)
- **Form**: React Hook Form + Zod validation
- **State Management**:
  - Zustand (client state)
  - React Query (server state, caching)
- **HTTP Client**: Axios
- **Charts**: Recharts (for dashboard)

### 4.2. Component Architecture

```
src/
├── components/
│   ├── Layout/
│   │   ├── AppLayout.tsx            # Main layout with sidebar
│   │   ├── Header.tsx
│   │   └── Sidebar.tsx
│   │
│   ├── FormBuilder/                 # Dynamic form components
│   │   ├── FormSection.tsx          # Wrapper for each section
│   │   ├── BasicInfoForm.tsx        # PHẦN 1
│   │   ├── ArchitectureForm.tsx     # PHẦN 2
│   │   ├── DataInfoForm.tsx         # PHẦN 3
│   │   ├── OperationsForm.tsx       # PHẦN 4
│   │   ├── IntegrationForm.tsx      # PHẦN 5
│   │   ├── AssessmentForm.tsx       # PHẦN 6
│   │   └── DetailedForms/           # Level 2 additional sections
│   │       ├── InfrastructureForm.tsx   # PHẦN 6
│   │       ├── SecurityForm.tsx         # PHẦN 7
│   │       ├── ServiceOpsForm.tsx       # PHẦN 8
│   │       ├── VendorForm.tsx           # PHẦN 9
│   │       └── CostForm.tsx             # PHẦN 10
│   │
│   ├── FileUpload/
│   │   ├── FileUploader.tsx         # Drag & drop
│   │   └── FileList.tsx             # Show uploaded files
│   │
│   ├── DataTable/
│   │   ├── SystemsTable.tsx         # List systems with filters
│   │   └── IntegrationsTable.tsx    # List integrations
│   │
│   ├── Dashboard/
│   │   ├── StatsCards.tsx           # Summary cards
│   │   ├── TechStackChart.tsx       # Pie chart of tech
│   │   └── IntegrationMap.tsx       # Network graph
│   │
│   └── Common/
│       ├── LoadingSpinner.tsx
│       ├── ErrorBoundary.tsx
│       └── ConfirmDialog.tsx
│
├── pages/
│   ├── Login.tsx
│   ├── Dashboard.tsx                # Admin dashboard
│   │
│   ├── Organizations/
│   │   ├── OrganizationList.tsx
│   │   ├── OrganizationCreate.tsx
│   │   └── OrganizationDetail.tsx
│   │
│   ├── Systems/
│   │   ├── SystemList.tsx           # Table of all systems
│   │   ├── SystemCreate.tsx         # Multi-step form wizard
│   │   ├── SystemEdit.tsx           # Edit existing system
│   │   └── SystemDetail.tsx         # View full details
│   │
│   └── Reports/
│       └── ReportExport.tsx         # Select systems & export
│
├── services/                        # API clients
│   ├── api.ts                       # Axios instance + interceptors
│   ├── auth.service.ts
│   ├── organization.service.ts
│   ├── system.service.ts
│   └── report.service.ts
│
├── stores/                          # Zustand stores
│   ├── authStore.ts                 # User, token, logout
│   └── systemStore.ts               # Current system being edited
│
├── types/                           # TypeScript types
│   ├── organization.ts
│   ├── system.ts
│   ├── integration.ts
│   └── api.ts
│
├── utils/
│   ├── validation.ts                # Validation helpers
│   ├── formatters.ts                # Date, number formatters
│   └── constants.ts                 # Enums, options
│
└── hooks/
    ├── useAuth.ts
    ├── useSystem.ts
    └── useDebounce.ts
```

### 4.3. Form Wizard Flow

**Multi-step Form for System Creation**:

```
Step 1: Basic Info (PHẦN 1)
  ├── System name, code
  ├── Purpose, scope
  └── Users

Step 2: Architecture (PHẦN 2)
  ├── Architecture type
  ├── Technology stack
  └── Upload diagram

Step 3: Data (PHẦN 3)
  ├── Database info
  ├── Data size & growth
  └── Data sharing

Step 4: Operations (PHẦN 4)
  ├── Development team
  ├── Vendor info
  └── Warranty/maintenance

Step 5: Integrations (PHẦN 5)
  ├── Add integrations (table)
  └── API inventory

Step 6: Assessment (PHẦN 6)
  ├── Self-assessment
  └── Strengths/weaknesses

[If form_level === 2]
Step 7-11: Detailed Sections
  ├── Infrastructure
  ├── Security
  ├── Service Ops
  ├── Vendors
  └── Costs

Final: Review & Submit
  ├── Preview all data
  ├── Upload attachments
  └── Submit
```

**State Management**:
- `systemStore`: Lưu draft data mỗi step
- `localStorage`: Auto-save mỗi 30s (prevent data loss)
- Navigate giữa steps không gọi API
- API call chỉ khi Save Draft hoặc Submit

### 4.4. Responsive Design

**Breakpoints** (Ant Design default):
- xs: <576px (mobile) → Not primary target, show warning
- sm: ≥576px (tablet) → Minimal support
- md: ≥768px (tablet landscape) → Good support
- lg: ≥992px (desktop) → Primary target
- xl: ≥1200px (large desktop) → Optimal
- xxl: ≥1600px (wide screen) → Best experience

**Desktop-first approach**: Form dài, cần màn hình lớn.

---

## V. FILE STORAGE ARCHITECTURE

### 5.1. Storage Options

**Option 1: Local File System** (Phase 1)
```
/var/app/uploads/
  ├── {org_id}/
  │   └── {system_id}/
  │       ├── architecture_diagrams/
  │       ├── erd/
  │       ├── api_docs/
  │       ├── contracts/
  │       └── security_reports/
```

**Option 2: S3-compatible (MinIO/AWS S3)** (Phase 2+)
```
Bucket: system-reports
  └── {org_id}/{system_id}/{file_type}/{filename}
```

### 5.2. File Upload Flow

```
Frontend
  ├── Select file
  ├── Validate: size (<50MB), type (pdf/docx/jpg/png)
  └── POST /api/systems/{id}/attachments
      ↓
Backend
  ├── Authenticate & authorize
  ├── Validate file
  ├── Generate unique filename: {timestamp}_{uuid}_{original}
  ├── Save file to storage
  ├── Create attachment record in DB
  └── Return: {id, file_name, file_size, url}
      ↓
Frontend
  └── Show in FileList component
```

### 5.3. Security

- **File type whitelist**: pdf, docx, xlsx, jpg, png, svg
- **Max file size**: 50MB per file
- **Max total size per system**: 500MB
- **Virus scan**: ClamAV (optional, Phase 2)
- **Access control**: Only org members can download
- **Signed URLs**: Temporary download links (expire in 1 hour)

---

## VI. REPORT GENERATION

### 6.1. Word Export Architecture

**Library**: `python-docx`

**Flow**:
```python
1. Fetch system data (with all relations)
2. Load template:
   - Level 1: report_template_level1.docx
   - Level 2: report_template_level2.docx
3. Replace placeholders:
   - {{system_name}}
   - {{org_name}}
   - {{go_live_date}}
   - ... (100+ fields)
4. Generate tables (integrations, API inventory)
5. Insert images (architecture diagrams)
6. Save to /tmp/{uuid}.docx
7. Return download URL
8. Cleanup after 1 hour
```

**Template Structure**:
```
Header: Logo Bộ | Đơn vị: {{org_name}}
Footer: Trang {page} / {total_pages} | Ngày: {{date}}

CẤU TRÚC BÁO CÁO

PHẦN 1: TỔNG QUAN
  1.1. Thông tin chung
  1.2. Đối tượng sử dụng

PHẦN 2: KIẾN TRÚC
  2.1. Kiến trúc tổng thể
  2.2. Công nghệ
  2.3. CSDL

...

PHỤ LỤC
  - Sơ đồ kiến trúc
  - ERD
```

**Styling**:
- Font: Times New Roman 13pt (nội dung), 14pt (heading)
- Margins: 2cm (top/bottom), 3cm (left), 2cm (right)
- Line spacing: 1.15
- Heading: Bold, blue color (#1F4E78)

### 6.2. Excel Export Architecture

**Library**: `openpyxl`

**3 Sheets**:

**Sheet 1: System Inventory** (1 row per system)
```python
Columns = [
    'STT', 'System_ID', 'Tên hệ thống', 'Đơn vị',
    'Chủ quản nghiệp vụ', 'Quản trị kỹ thuật',
    'Nhóm hệ thống', 'Trạng thái', 'Go-live',
    'Criticality', 'DAU', 'MAU',
    'Frontend', 'Backend', 'Database',
    'Hosting', 'Còn bảo hành?', 'Đến ngày',
    'Phụ thuộc nhà thầu', 'Uptime 6 tháng (%)'
]
```

**Sheet 2: Integration Inventory** (1 row per integration)
```python
Columns = [
    'STT', 'From_System', 'To_System',
    'Data_Object', 'Method', 'Frequency',
    'Owner', 'API_Doc_Link', 'Issues'
]
```

**Sheet 3: Data Inventory** (1 row per system's dataset)
```python
Columns = [
    'STT', 'Dataset_Name', 'System_Source',
    'Data_Type', 'Volume (GB/TB)', 'Growth (%/year)',
    'Sensitivity', 'Sharing', 'Standard'
]
```

**Styling**:
- Header row: Bold, blue background, white text
- Freeze panes: Row 1
- Auto-filter enabled
- Column widths: Auto-fit
- Number formats:
  - Dates: dd/mm/yyyy
  - Decimals: #,##0.00

**Flow**:
```python
1. Fetch data (all orgs or filtered)
2. Create workbook with 3 sheets
3. Write headers
4. Write data rows
5. Apply styling
6. Save to /tmp/{uuid}.xlsx
7. Return download URL
```

---

## VII. SECURITY ARCHITECTURE

### 7.1. Authentication

- **JWT Tokens**:
  - Access token: 1 hour expiry
  - Refresh token: 7 days expiry (stored in httpOnly cookie)
- **Password**: bcrypt hashing (cost factor 12)
- **Login throttling**: Max 5 attempts / 15 minutes

### 7.2. Authorization

- **Role-based**: admin, org_admin, user
- **Resource-based**: Check org_id ownership
- **Decorator**: `@require_role("admin")`, `@require_org_access`

### 7.3. API Security

- **HTTPS only**: Enforce TLS 1.2+
- **CORS**: Whitelist frontend domain
- **Rate limiting**: 100 requests / minute per IP
- **Input validation**: Pydantic models
- **SQL Injection**: ORM prevents (SQLAlchemy)
- **XSS**: React auto-escapes

### 7.4. File Security

- **Upload validation**: Type, size, content-type
- **Filename sanitization**: Remove special chars
- **Storage isolation**: Per org/system folders
- **Access control**: Check ownership before download
- **No direct file access**: Downloads via API only

### 7.5. Audit Trail

All critical actions logged to `audit_logs`:
- Login/logout
- Create/update/delete org/system
- File upload/delete
- Report generation
- Admin actions

Log includes:
- User ID
- Action type
- Entity type & ID
- IP address
- Timestamp
- Full details (JSONB)

---

## VIII. SCALABILITY & PERFORMANCE

### 8.1. Database Optimization

**Indexes**:
```sql
CREATE INDEX idx_systems_org_id ON systems(org_id);
CREATE INDEX idx_systems_status ON systems(status);
CREATE INDEX idx_integrations_from ON integrations(system_id_from);
CREATE INDEX idx_integrations_to ON integrations(system_id_to);
CREATE INDEX idx_attachments_system ON attachments(system_id);
CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_created ON audit_logs(created_at);

-- JSONB indexes
CREATE INDEX idx_systems_target_users ON systems USING GIN(target_users);
CREATE INDEX idx_data_info_data_types ON system_data_info USING GIN(data_types);
```

**Query Optimization**:
- Eager loading: Use `joinedload()` for relations
- Pagination: LIMIT + OFFSET
- Filtering: WHERE clauses with indexed columns
- Aggregations: Use DB aggregation, not Python

**Connection Pooling**:
- SQLAlchemy pool size: 20
- Max overflow: 40
- Pool recycle: 3600s

### 8.2. Caching Strategy

**Redis Cache** (optional, Phase 2):
- System list: TTL 5 minutes
- Dashboard stats: TTL 10 minutes
- User permissions: TTL 1 hour

**Browser Cache**:
- Static assets: 1 year
- API responses: No cache (dynamic data)

### 8.3. File Upload Performance

- **Chunked upload**: For files >10MB (Phase 2)
- **Async processing**: Background task for virus scan
- **CDN**: Serve attachments via CDN (Phase 2)

### 8.4. Report Generation

- **Async tasks**: Use Celery (Phase 2)
  - Current: Synchronous (OK for <100 systems)
  - Phase 2: Async for bulk reports (>100 systems)
- **Queue**: Generate reports in background
- **Notification**: Email when ready

### 8.5. Horizontal Scaling

**Stateless Backend**:
- No session storage (JWT in token)
- File storage independent (S3)
- Can scale to N instances behind load balancer

**Database**:
- PostgreSQL read replicas (Phase 2)
- Write to primary, read from replicas

---

## IX. DEPLOYMENT ARCHITECTURE

### 9.1. Development Environment

```
Local Machine
  ├── Backend: uvicorn --reload
  ├── Frontend: npm run dev (Vite)
  └── Database: PostgreSQL (Docker)
```

### 9.2. Production Environment

**Option 1: Single Server** (Phase 1, <50 users)
```
Server (VPS / EC2)
  ├── Nginx (reverse proxy)
  ├── FastAPI (Gunicorn + Uvicorn workers)
  ├── React (static build served by Nginx)
  └── PostgreSQL
```

**Option 2: Multi-tier** (Phase 2+, 50-500 users)
```
Load Balancer (Nginx / ALB)
  ├── App Server 1 (FastAPI)
  ├── App Server 2 (FastAPI)
  └── App Server N
      ↓
Database Server (PostgreSQL primary)
  └── Read Replica 1, 2...
      ↓
File Storage (MinIO / S3)
```

### 9.3. Docker Compose Setup

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:14-alpine
    environment:
      POSTGRES_DB: system_reports
      POSTGRES_USER: app
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  backend:
    build: ./backend
    environment:
      DATABASE_URL: postgresql://app:${DB_PASSWORD}@postgres/system_reports
      JWT_SECRET: ${JWT_SECRET}
    volumes:
      - ./backend:/app
      - upload_data:/app/uploads
    ports:
      - "8000:8000"
    depends_on:
      - postgres

  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    depends_on:
      - backend

  nginx:
    image: nginx:alpine
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
    ports:
      - "80:80"
      - "443:443"
    depends_on:
      - frontend
      - backend

volumes:
  postgres_data:
  upload_data:
```

### 9.4. CI/CD Pipeline

```
Git Push
  ↓
GitHub Actions / GitLab CI
  ├── Run tests (pytest, jest)
  ├── Build Docker images
  ├── Push to registry
  └── Deploy to server
      ↓
Server
  ├── Pull latest images
  ├── Run migrations (alembic upgrade head)
  ├── Restart containers
  └── Health check
```

---

## X. MONITORING & OBSERVABILITY

### 10.1. Application Monitoring

- **Logs**: Structured logging (JSON format)
  - Backend: Python `logging` + `structlog`
  - Frontend: `console.error` + error boundary
- **Metrics**:
  - Request count, latency (p50, p95, p99)
  - Error rate
  - Active users
- **Alerts**:
  - API error rate >5%
  - Response time >2s
  - Disk usage >80%

### 10.2. Database Monitoring

- **Queries**: Slow query log (>1s)
- **Connections**: Monitor pool usage
- **Disk**: Table sizes, growth rate

### 10.3. Tools

**Phase 1** (built-in):
- FastAPI `/metrics` endpoint
- PostgreSQL logs
- Systemd journal

**Phase 2** (optional):
- Prometheus + Grafana
- ELK stack (Elasticsearch, Logstash, Kibana)
- Sentry (error tracking)

---

## XI. DISASTER RECOVERY

### 11.1. Backup Strategy

**Database**:
- Daily full backup: 2am
- Retention: 30 days
- Store: Off-site (S3 / backup server)

**Files**:
- Daily rsync to backup storage
- Retention: 30 days

**Configuration**:
- Git repository (version controlled)

### 11.2. Recovery Procedures

**Database Failure**:
1. Restore from latest backup
2. Apply WAL logs (if available)
3. Verify data integrity
4. Restart application

**File Storage Failure**:
1. Restore from backup storage
2. Verify file integrity
3. Update file paths if needed

**RTO**: 4 hours
**RPO**: 24 hours (daily backup)

---

## XII. MIGRATION STRATEGY (Phase 2+)

### 12.1. From SQLite to PostgreSQL

If starting with SQLite:
```bash
# Export data
sqlite3 app.db .dump > dump.sql

# Convert to PostgreSQL syntax
sed -i 's/AUTOINCREMENT/SERIAL/g' dump.sql

# Import to PostgreSQL
psql -U app -d system_reports -f dump.sql
```

### 12.2. From Local Storage to S3

```python
# Script to migrate files
for file in os.listdir('/var/app/uploads'):
    s3.upload_file(
        f'/var/app/uploads/{file}',
        'system-reports',
        file
    )
    # Update attachment.file_path in DB
```

---

## XIII. THAM KHẢO

**Tài liệu liên quan**:
- Requirements: `04-task-definition/01-requirements.md`
- Tech Stack: `02-principle-processes/tech-stack.md`
- Database Schema: `07-resources/database-schema.sql`
- Implementation Plan: `08-backlog-plan/implementation-roadmap.md`

**External Resources**:
- FastAPI docs: https://fastapi.tiangolo.com
- React docs: https://react.dev
- PostgreSQL docs: https://www.postgresql.org/docs
- Ant Design: https://ant.design
- python-docx: https://python-docx.readthedocs.io
