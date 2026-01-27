# Đặc tả Nâng cấp Dashboard Chiến lược CDS

**Version:** 1.0
**Ngày:** 28/01/2026
**Trạng thái:** Draft - Chờ Review

---

## Tổng quan

Tài liệu này mô tả 3 tính năng nâng cấp cho Dashboard Chiến lược CDS, nhằm cung cấp thêm giá trị phân tích và hỗ trợ ra quyết định cho lãnh đạo Bộ KH&CN.

---

## Feature 1: Bảng phân tích Insights từ dữ liệu hệ thống

### 1.1. Mục tiêu

Tự động phân tích dữ liệu của 110+ hệ thống để tạo ra các insights quan trọng, giúp lãnh đạo:
- Nhận diện nhanh các vấn đề cần quan tâm
- Phát hiện xu hướng và pattern
- Đưa ra quyết định dựa trên dữ liệu (data-driven decision)

### 1.2. Phân loại Insights

#### 1.2.1. Insights về Tài liệu & Thiết kế (Documentation)

| Insight | Query Logic | Mức độ | Icon |
|---------|-------------|--------|------|
| X hệ thống chưa có tài liệu thiết kế | `has_design_documents = False` | ⚠️ Warning | 📄 |
| X hệ thống chưa có sơ đồ kiến trúc | `architecture.has_architecture_diagram = False` | ⚠️ Warning | 🏗️ |
| X hệ thống chưa thiết kế theo API | `architecture.api_style IS NULL OR = 'none'` | ℹ️ Info | 🔌 |
| X hệ thống chưa có hướng dẫn sử dụng | `has_user_manual = False` | ℹ️ Info | 📖 |

#### 1.2.2. Insights về Công nghệ (Technology)

| Insight | Query Logic | Mức độ | Icon |
|---------|-------------|--------|------|
| Phân bố ngôn ngữ lập trình | `GROUP BY programming_language` | ℹ️ Info | 💻 |
| Phân bố framework | `GROUP BY framework` | ℹ️ Info | 🛠️ |
| Phân bố database | `GROUP BY database_name` | ℹ️ Info | 🗄️ |
| X% hệ thống dùng công nghệ cũ (legacy) | `programming_language IN ('COBOL', 'VB6', 'Classic ASP')` | 🔴 Critical | ⚡ |
| X% hệ thống chưa có CI/CD | `architecture.has_cicd = False` | ⚠️ Warning | 🔄 |
| X% hệ thống chưa containerize | `architecture.containerization = False` | ℹ️ Info | 📦 |

#### 1.2.3. Insights về Cloud & Hạ tầng (Infrastructure)

| Insight | Query Logic | Mức độ | Khuyến nghị |
|---------|-------------|--------|-------------|
| X% hệ thống đang dùng Cloud | `operations.deployment_location = 'cloud'` | ℹ️ Info | Đang theo đúng Cloud-first |
| X% hệ thống vẫn on-premise | `operations.deployment_location = 'on_premise'` | ⚠️ Warning | Cần xem xét chuyển Cloud theo Giai đoạn 1 (2026) |
| X hệ thống chưa có Disaster Recovery | `infrastructure.has_disaster_recovery = False` | 🔴 Critical | Cần bổ sung để đảm bảo ATTT |
| X hệ thống có RTO > 24h | `infrastructure.rto_hours > 24` | ⚠️ Warning | Cần cải thiện |

#### 1.2.4. Insights về Tích hợp (Integration)

| Insight | Query Logic | Mức độ | Khuyến nghị |
|---------|-------------|--------|-------------|
| X hệ thống là "data islands" | `integration.has_integration = False AND api_provided_count = 0` | ⚠️ Warning | Cần kết nối LGSP theo GĐ 1 |
| Tổng số API cung cấp | `SUM(api_provided_count)` | ℹ️ Info | - |
| Tổng số API tiêu thụ | `SUM(api_consumed_count)` | ℹ️ Info | - |
| X hệ thống chưa có API Gateway | `integration.has_api_gateway = False` | ℹ️ Info | Cần triển khai API Gateway |

#### 1.2.5. Insights về Bảo mật (Security)

| Insight | Query Logic | Mức độ | Khuyến nghị |
|---------|-------------|--------|-------------|
| X hệ thống chưa có MFA | `security.has_mfa = False` | 🔴 Critical | Bắt buộc theo Nguyên tắc 6 |
| X hệ thống chưa có RBAC | `security.has_rbac = False` | ⚠️ Warning | Cần triển khai phân quyền |
| X hệ thống chưa mã hóa dữ liệu | `security.has_encryption = False` | 🔴 Critical | Bắt buộc cho dữ liệu nhạy cảm |
| X hệ thống có dữ liệu cá nhân nhưng chưa tuân thủ | `data_info.has_personal_data = True AND security.compliance_standards NOT LIKE '%NĐ13%'` | 🔴 Critical | Vi phạm NĐ 13/2023/NĐ-CP |

#### 1.2.6. Insights về Đánh giá & Khuyến nghị (Assessment)

| Insight | Query Logic | Mức độ | Ghi chú |
|---------|-------------|--------|---------|
| X hệ thống cần giữ nguyên (Keep) | `assessment.recommendation = 'keep'` | ✅ Good | Hoạt động tốt |
| X hệ thống cần nâng cấp (Upgrade) | `assessment.recommendation = 'upgrade'` | ⚠️ Warning | Cần lên kế hoạch |
| X hệ thống cần thay thế (Replace) | `assessment.recommendation = 'replace'` | 🔴 Critical | Ưu tiên cao |
| X hệ thống cần hợp nhất (Merge) | `assessment.recommendation = 'merge'` | ⚠️ Warning | Giảm trùng lặp |
| X hệ thống chưa đánh giá | `assessment.recommendation IS NULL` | ℹ️ Info | Cần khảo sát thêm |

### 1.3. Thiết kế UI

#### 1.3.1. Tab mới: "Insights"

```
┌─────────────────────────────────────────────────────────────────────┐
│  Dashboard Chiến lược CDS                                          │
├─────────────────────────────────────────────────────────────────────┤
│ [Tổng quan] [Đầu tư] [Tích hợp] [Tối ưu] [Lộ trình] [Giám sát]     │
│ [🆕 INSIGHTS]                                                       │
└─────────────────────────────────────────────────────────────────────┘
```

#### 1.3.2. Layout Insights Tab

```
┌─────────────────────────────────────────────────────────────────────┐
│ 🔴 Critical Issues (3)                              [Xem tất cả →] │
├─────────────────────────────────────────────────────────────────────┤
│ │🔴│ 5 hệ thống chưa có MFA             [Xem danh sách]           │
│ │🔴│ 3 hệ thống có dữ liệu cá nhân      [Xem danh sách]           │
│ │  │ nhưng chưa tuân thủ NĐ13                                      │
│ │🔴│ 8 hệ thống chưa có DR              [Xem danh sách]           │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│ ⚠️ Warnings (12)                                    [Xem tất cả →] │
├─────────────────────────────────────────────────────────────────────┤
│ │⚠️│ 25 hệ thống vẫn on-premise        [Xem danh sách]           │
│ │  │ → Cần chuyển Cloud theo GĐ1                                   │
│ │⚠️│ 40 hệ thống chưa có tài liệu      [Xem danh sách]           │
│ │⚠️│ 15 hệ thống là data islands       [Xem danh sách]           │
└─────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────┐ ┌──────────────────────────────┐
│ 📊 Phân bố Ngôn ngữ          │ │ 📊 Phân bố Database          │
├──────────────────────────────┤ ├──────────────────────────────┤
│     ████████ Java 35%        │ │     ████████ PostgreSQL 40% │
│     ██████ .NET 28%          │ │     ██████ SQL Server 30%   │
│     ████ PHP 15%             │ │     ████ MySQL 15%          │
│     ███ Python 12%           │ │     ███ Oracle 10%          │
│     ██ Khác 10%              │ │     ██ Khác 5%              │
└──────────────────────────────┘ └──────────────────────────────┘

┌──────────────────────────────┐ ┌──────────────────────────────┐
│ ☁️ Cloud Adoption            │ │ 🔒 Security Compliance       │
├──────────────────────────────┤ ├──────────────────────────────┤
│     Cloud: 30%               │ │     MFA: 45%                 │
│     Hybrid: 15%              │ │     RBAC: 60%                │
│     On-premise: 55%          │ │     Encryption: 50%          │
│                              │ │     Full compliance: 25%     │
└──────────────────────────────┘ └──────────────────────────────┘
```

### 1.4. OpenAI Integration (Optional Enhancement)

#### 1.4.1. Mục đích
Sử dụng OpenAI API để:
1. Tự động sinh mô tả insights bằng ngôn ngữ tự nhiên
2. Đưa ra khuyến nghị dựa trên context Kiến trúc số Bộ KH&CN
3. So sánh với best practices quốc tế

#### 1.4.2. Prompt Template

```python
INSIGHT_ANALYSIS_PROMPT = """
Bạn là chuyên gia tư vấn Kiến trúc số cho Bộ Khoa học và Công nghệ Việt Nam.

Context:
- Bộ đang thực hiện chuyển đổi số theo Kiến trúc tổng thể số thống nhất
- Giai đoạn 1 (2026): Ổn định hạ tầng – Hội tụ dữ liệu – Thiết lập nền tảng
- Giai đoạn 2 (2027-2028): Chuẩn hóa toàn diện – Tích hợp sâu – Số hóa nghiệp vụ
- Giai đoạn 3 (2029-2030): Tối ưu hóa – Thông minh hóa – Dữ liệu mở

Nguyên tắc cốt lõi:
1. Quản trị dựa trên kết quả
2. Lãnh đạo, điều hành dựa trên dữ liệu theo thời gian thực
3. Vận hành thông minh và tự động hóa (AI First)
4. Phân cấp, phân quyền trên nền tảng số
5. Lấy người dùng làm trung tâm
6. Bảo đảm an toàn thông tin, an ninh mạng
7. Thúc đẩy dữ liệu mở

Dữ liệu hiện tại:
{data_summary}

Hãy phân tích và đưa ra:
1. 3-5 insights quan trọng nhất cần chú ý
2. Khuyến nghị hành động cụ thể theo từng giai đoạn
3. Rủi ro nếu không xử lý kịp thời
"""
```

#### 1.4.3. API Flow

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  Frontend   │────▶│   Backend   │────▶│  OpenAI API │
│  Dashboard  │     │   /api/ai/  │     │  GPT-4      │
└─────────────┘     │   insights  │     └─────────────┘
                    └─────────────┘
                          │
                          ▼
                    ┌─────────────┐
                    │  Database   │
                    │  (110 sys)  │
                    └─────────────┘
```

### 1.5. Backend API

#### Endpoint: `GET /api/systems/insights/`

**Response:**
```json
{
  "generated_at": "2026-01-28T10:30:00Z",
  "critical": [
    {
      "id": "no_mfa",
      "title": "5 hệ thống chưa có MFA",
      "description": "Các hệ thống này cần triển khai xác thực đa yếu tố ngay",
      "count": 5,
      "systems": ["sys_1", "sys_2", ...],
      "recommendation": "Triển khai MFA theo Nguyên tắc 6 của Kiến trúc số",
      "deadline": "Q2/2026"
    }
  ],
  "warnings": [...],
  "info": [...],
  "charts": {
    "programming_language": {"Java": 35, ".NET": 28, ...},
    "database": {"PostgreSQL": 40, ...},
    "cloud_adoption": {"cloud": 30, "hybrid": 15, "on_premise": 55},
    "security_compliance": {"mfa": 45, "rbac": 60, ...}
  },
  "ai_summary": "Phân tích từ OpenAI..." // Optional
}
```

---

## Feature 2: Trợ lý AI với SQL Query

### 2.1. Mục tiêu

Xây dựng trợ lý AI cho phép lãnh đạo:
- Đặt câu hỏi bằng ngôn ngữ tự nhiên (tiếng Việt)
- Nhận câu trả lời dựa trên dữ liệu thực từ database
- Visualize kết quả với charts/tables tự động

### 2.2. Kiến trúc hệ thống

```
┌──────────────────────────────────────────────────────────────────┐
│                      Frontend (React)                            │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  Chat Interface                                             │ │
│  │  ┌──────────────────────────────────────────────────────┐  │ │
│  │  │ 👤 "Cho tôi biết có bao nhiêu hệ thống dùng Java?"   │  │ │
│  │  └──────────────────────────────────────────────────────┘  │ │
│  │  ┌──────────────────────────────────────────────────────┐  │ │
│  │  │ 🤖 Có 38 hệ thống sử dụng Java (34.5%)              │  │ │
│  │  │    ┌────────────────────────────────────┐            │  │ │
│  │  │    │ [Bar Chart: Top 5 ngôn ngữ]        │            │  │ │
│  │  │    └────────────────────────────────────┘            │  │ │
│  │  └──────────────────────────────────────────────────────┘  │ │
│  └────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────────┐
│                      Backend (Django)                            │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  POST /api/ai/chat/                                         │ │
│  │  1. Receive user question                                   │ │
│  │  2. Send to OpenAI with schema context                      │ │
│  │  3. Receive SQL query                                       │ │
│  │  4. Validate & sanitize SQL (SELECT only)                   │ │
│  │  5. Execute query                                           │ │
│  │  6. Send results to OpenAI for interpretation               │ │
│  │  7. Generate visualization config                           │ │
│  │  8. Return response                                         │ │
│  └────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────┘
                              │
              ┌───────────────┴───────────────┐
              ▼                               ▼
┌─────────────────────┐           ┌─────────────────────┐
│     OpenAI API      │           │     PostgreSQL      │
│  (GPT-4 Turbo)      │           │    (Read-only)      │
└─────────────────────┘           └─────────────────────┘
```

### 2.3. Database Schema Context

Cung cấp cho OpenAI hiểu cấu trúc database:

```python
SCHEMA_CONTEXT = """
Database Schema cho hệ thống Khảo sát CĐS Bộ KH&CN:

1. systems_system (Hệ thống thông tin)
   - id, name, short_name
   - organization_id (FK → organizations_organization)
   - status: 'operating', 'pilot', 'testing', 'developing', 'stopped'
   - criticality_level: 'high', 'medium', 'low'
   - scope: 'internal_unit', 'org_wide', 'external', 'national'
   - system_group: Nhóm hệ thống
   - programming_language: Java, .NET, PHP, Python, etc.
   - framework: Spring, Laravel, Django, etc.
   - database_name: PostgreSQL, MySQL, SQL Server, etc.
   - hosting_platform: On-premise, AWS, Azure, GCP, etc.
   - has_design_documents: boolean
   - api_provided_count, api_consumed_count: integer
   - user_count: Số người dùng
   - created_at, updated_at

2. systems_systemarchitecture (Kiến trúc)
   - system_id (FK)
   - architecture_type: 'monolith', 'microservices', 'serverless'
   - has_architecture_diagram: boolean
   - api_style: 'rest', 'soap', 'graphql', 'grpc'
   - containerization: boolean
   - has_cicd: boolean
   - has_layered_architecture: boolean
   - mobile_app: boolean
   - backend_tech, frontend_tech

3. systems_systemoperations (Vận hành)
   - system_id (FK)
   - dev_type: 'in_house', 'outsourced', 'cots'
   - warranty_status: 'under_warranty', 'expired', 'no_warranty'
   - deployment_location: 'on_premise', 'cloud', 'hybrid'
   - compute_type: 'physical', 'virtual', 'container'

4. systems_systemintegration (Tích hợp)
   - system_id (FK)
   - has_integration: boolean
   - integration_count: integer
   - has_api_gateway: boolean
   - api_provided_count, api_consumed_count

5. systems_systemsecurity (Bảo mật)
   - system_id (FK)
   - has_mfa: boolean
   - has_rbac: boolean
   - has_encryption: boolean
   - compliance_standards: text (e.g., "ISO27001,NĐ13")

6. systems_systeminfrastructure (Hạ tầng)
   - system_id (FK)
   - num_servers: integer
   - has_disaster_recovery: boolean
   - rto_hours, rpo_hours: integer

7. systems_systemassessment (Đánh giá)
   - system_id (FK)
   - recommendation: 'keep', 'upgrade', 'replace', 'merge'
   - blockers: text
   - integration_readiness: integer (1-5)

8. systems_systemcost (Chi phí)
   - system_id (FK)
   - initial_investment: decimal
   - development_cost: decimal
   - annual_license_cost: decimal
   - annual_maintenance_cost: decimal

9. organizations_organization (Đơn vị)
   - id, name, short_name
   - org_type: Loại đơn vị
   - parent_id: Đơn vị cha
"""
```

### 2.4. OpenAI Prompts

#### 2.4.1. SQL Generation Prompt

```python
SQL_GENERATION_PROMPT = """
Bạn là trợ lý AI chuyên tạo SQL queries cho hệ thống quản lý HTTT của Bộ KH&CN.

Database schema:
{schema_context}

Quy tắc:
1. CHỈ tạo SELECT queries (không INSERT, UPDATE, DELETE)
2. LUÔN dùng table aliases (s cho system, o cho organization, etc.)
3. LUÔN giới hạn kết quả với LIMIT 1000
4. Với aggregate queries, dùng GROUP BY phù hợp
5. Xử lý NULL values với COALESCE
6. Kết quả trả về dạng JSON với keys tiếng Việt

Câu hỏi của user: {user_question}

Trả về CHÍNH XÁC theo format JSON:
{{
  "sql": "SELECT ...",
  "explanation": "Giải thích ngắn gọn query này làm gì",
  "expected_columns": ["col1", "col2"],
  "visualization_type": "bar_chart|pie_chart|table|number|line_chart"
}}
"""
```

#### 2.4.2. Result Interpretation Prompt

```python
INTERPRETATION_PROMPT = """
Bạn là chuyên gia phân tích dữ liệu cho Bộ KH&CN.

Câu hỏi ban đầu: {user_question}

Kết quả truy vấn:
{query_results}

Hãy:
1. Trả lời câu hỏi bằng tiếng Việt, ngắn gọn, rõ ràng
2. Nêu insight quan trọng nếu có
3. Đề xuất câu hỏi follow-up nếu phù hợp

Trả về JSON:
{{
  "answer": "Câu trả lời...",
  "insights": ["Insight 1", "Insight 2"],
  "follow_up_questions": ["Câu hỏi gợi ý 1", ...]
}}
"""
```

### 2.5. Security Measures

#### 2.5.1. SQL Validation

```python
ALLOWED_SQL_PATTERNS = [
    r'^SELECT\s+',  # Must start with SELECT
]

FORBIDDEN_SQL_PATTERNS = [
    r'\b(INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|TRUNCATE)\b',
    r'\b(EXEC|EXECUTE|CALL)\b',
    r'--',  # SQL comments
    r';.*SELECT',  # Multiple statements
    r'\bINTO\s+OUTFILE\b',
]

def validate_sql(sql: str) -> bool:
    sql_upper = sql.upper().strip()

    # Must match allowed patterns
    if not any(re.match(p, sql_upper) for p in ALLOWED_SQL_PATTERNS):
        return False

    # Must not match forbidden patterns
    if any(re.search(p, sql_upper) for p in FORBIDDEN_SQL_PATTERNS):
        return False

    return True
```

#### 2.5.2. Database Connection

```python
# Sử dụng read-only database user
DATABASES = {
    'ai_readonly': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'cds_db',
        'USER': 'ai_readonly_user',  # Limited permissions
        'PASSWORD': '...',
        'HOST': 'localhost',
        'OPTIONS': {
            'options': '-c default_transaction_read_only=on'
        }
    }
}
```

### 2.6. UI Design

#### 2.6.1. Chat Interface

```
┌─────────────────────────────────────────────────────────────────────┐
│ 🤖 Trợ lý AI Phân tích Dữ liệu                          [Đóng ✕]  │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│ ┌─────────────────────────────────────────────────────────────────┐│
│ │ 👤 Cho tôi biết phân bố hệ thống theo đơn vị                    ││
│ └─────────────────────────────────────────────────────────────────┘│
│                                                                     │
│ ┌─────────────────────────────────────────────────────────────────┐│
│ │ 🤖 Dưới đây là phân bố 110 hệ thống theo 32 đơn vị:            ││
│ │                                                                  ││
│ │ ┌──────────────────────────────────────────────────────────┐    ││
│ │ │ [Bar Chart]                                               │    ││
│ │ │ Trung tâm CNTT: 51 HT ████████████████████                │    ││
│ │ │ Vụ KHCN: 12 HT        ████████                            │    ││
│ │ │ Cục Ứng dụng: 10 HT   ██████                              │    ││
│ │ │ ...                                                       │    ││
│ │ └──────────────────────────────────────────────────────────┘    ││
│ │                                                                  ││
│ │ 📊 Insight: Trung tâm CNTT quản lý 46% tổng số hệ thống        ││
│ │                                                                  ││
│ │ 💡 Câu hỏi gợi ý:                                               ││
│ │ • Hệ thống nào của TTCNTT có criticality cao?                   ││
│ │ • Chi phí vận hành của TTCNTT là bao nhiêu?                     ││
│ └─────────────────────────────────────────────────────────────────┘│
│                                                                     │
│ ┌─────────────────────────────────────────────────────────────────┐│
│ │ 👤 Hệ thống nào cần thay thế theo đánh giá?                     ││
│ └─────────────────────────────────────────────────────────────────┘│
│                                                                     │
│ ┌─────────────────────────────────────────────────────────────────┐│
│ │ 🤖 Có 9 hệ thống được khuyến nghị thay thế:                    ││
│ │                                                                  ││
│ │ ┌──────────────────────────────────────────────────────────┐    ││
│ │ │ [Table]                                                   │    ││
│ │ │ STT │ Tên hệ thống    │ Đơn vị    │ Lý do               │    ││
│ │ │ 1   │ HT Quản lý A    │ Vụ X      │ Công nghệ cũ (VB6)  │    ││
│ │ │ 2   │ HT Báo cáo B    │ Cục Y     │ Không có hỗ trợ     │    ││
│ │ │ ...                                                       │    ││
│ │ └──────────────────────────────────────────────────────────┘    ││
│ │                                                                  ││
│ │ 📥 [Export Excel] [Export PDF]                                  ││
│ └─────────────────────────────────────────────────────────────────┘│
│                                                                     │
├─────────────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────────────┐    │
│ │ Nhập câu hỏi...                                      [Gửi] │    │
│ └─────────────────────────────────────────────────────────────┘    │
│                                                                     │
│ Gợi ý: • Phân bố theo công nghệ  • Chi phí đầu tư  • Bảo mật      │
└─────────────────────────────────────────────────────────────────────┘
```

### 2.7. Sample Queries

| Câu hỏi | SQL Generated | Visualization |
|---------|---------------|---------------|
| "Có bao nhiêu hệ thống?" | `SELECT COUNT(*) FROM systems_system` | Number |
| "Phân bố theo ngôn ngữ?" | `SELECT programming_language, COUNT(*) GROUP BY...` | Pie Chart |
| "Top 5 đơn vị có nhiều HT nhất?" | `SELECT o.name, COUNT(s.id) ... ORDER BY ... LIMIT 5` | Bar Chart |
| "HT nào chưa có MFA?" | `SELECT s.name, o.name FROM ... WHERE sec.has_mfa = false` | Table |
| "Tổng chi phí đầu tư?" | `SELECT SUM(initial_investment) FROM systems_systemcost` | Number |

### 2.8. Backend API

#### Endpoint: `POST /api/ai/chat/`

**Request:**
```json
{
  "message": "Cho tôi biết phân bố hệ thống theo đơn vị",
  "conversation_id": "uuid-xxx" // Optional, for context
}
```

**Response:**
```json
{
  "answer": "Dưới đây là phân bố 110 hệ thống theo 32 đơn vị...",
  "data": [
    {"organization": "Trung tâm CNTT", "count": 51},
    {"organization": "Vụ KHCN", "count": 12},
    ...
  ],
  "visualization": {
    "type": "bar_chart",
    "x_axis": "organization",
    "y_axis": "count",
    "title": "Phân bố hệ thống theo đơn vị"
  },
  "insights": ["Trung tâm CNTT quản lý 46% tổng số hệ thống"],
  "follow_up_questions": [
    "Hệ thống nào của TTCNTT có criticality cao?",
    "Chi phí vận hành của TTCNTT là bao nhiêu?"
  ],
  "sql_query": "SELECT o.name, COUNT(s.id)...", // For transparency
  "execution_time_ms": 45
}
```

---

## Feature 3: Cải thiện Tab Lộ trình

### 3.1. Mục tiêu

Cập nhật tab "Lộ trình" theo đúng tinh thần Kiến trúc tổng thể số thống nhất Bộ KH&CN với 3 giai đoạn cụ thể.

### 3.2. Nội dung theo Kiến trúc số

#### 3.2.1. Ba giai đoạn chuyển đổi số

| Giai đoạn | Thời gian | Chủ đề | Mục tiêu chính |
|-----------|-----------|--------|----------------|
| **GĐ 1** | 2026 | Ổn định hạ tầng – Hội tụ dữ liệu – Thiết lập nền tảng | Xây móng |
| **GĐ 2** | 2027-2028 | Chuẩn hóa toàn diện – Tích hợp sâu – Số hóa nghiệp vụ | Chuẩn hóa |
| **GĐ 3** | 2029-2030 | Tối ưu hóa – Thông minh hóa – Dữ liệu mở | Data-driven |

#### 3.2.2. Mục tiêu chi tiết từng giai đoạn

**Giai đoạn 1 (2026):**

| Lĩnh vực | Mục tiêu | Chỉ số |
|----------|----------|--------|
| Hạ tầng & ATTT | 100% HT di dời về Cloud tập trung | % on Cloud |
| Hạ tầng & ATTT | 100% HT được phê duyệt cấp độ ATTT | % compliant |
| Dữ liệu & Kết nối | Vận hành Data Lakehouse | Status |
| Dữ liệu & Kết nối | Kết nối LGSP cho Nhóm 1, 2 | % connected |
| Dữ liệu & Kết nối | Kết nối CSDL Quốc gia về dân cư | Status |
| Nền tảng | Đưa vào sử dụng One MST v1.0 | Status |

**Giai đoạn 2 (2027-2028):**

| Lĩnh vực | Mục tiêu | Chỉ số |
|----------|----------|--------|
| Dữ liệu chuyên ngành | 100% CSDL quốc gia chuẩn hóa | % standardized |
| Dữ liệu chuyên ngành | Hoàn thiện CSDL chuyên gia, tổ chức KH&CN | Status |
| Dịch vụ công | 100% TTHC trực tuyến toàn trình | % online |
| Báo cáo | 100% báo cáo tự động tích hợp | % automated |

**Giai đoạn 3 (2029-2030):**

| Lĩnh vực | Mục tiêu | Chỉ số |
|----------|----------|--------|
| AI & Big Data | Triển khai AI thẩm định nhiệm vụ KH&CN | Status |
| AI & Big Data | 100% DVC có trợ lý ảo hỗ trợ | % with AI |
| Dữ liệu mở | 50% dữ liệu được công bố mở | % open data |
| Hệ sinh thái | Hoàn thiện hệ sinh thái số ngành KH&CN | Status |

### 3.3. UI Design

#### 3.3.1. Timeline View

```
┌─────────────────────────────────────────────────────────────────────┐
│ 📅 Lộ trình Chuyển đổi số Bộ KH&CN                                 │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│ ◀ ═══════════════════════════════════════════════════════════ ▶   │
│     2026          2027         2028         2029         2030      │
│                                                                     │
│   ┌─────────┐   ┌───────────────────┐   ┌───────────────────┐      │
│   │ GĐ 1    │   │     GĐ 2          │   │     GĐ 3          │      │
│   │ Xây     │   │     Chuẩn hóa     │   │     Data-driven   │      │
│   │ móng    │   │     toàn diện     │   │     AI-powered    │      │
│   └─────────┘   └───────────────────┘   └───────────────────┘      │
│        ▲                                                            │
│        │                                                            │
│     [Hiện tại]                                                      │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

#### 3.3.2. Progress Dashboard

```
┌─────────────────────────────────────────────────────────────────────┐
│ 📊 Tiến độ Giai đoạn 1 (2026)                                      │
│                                                             ▼ ▼ ▼   │
│ Theme: Ổn định hạ tầng – Hội tụ dữ liệu – Thiết lập nền tảng       │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│ ┌─────────────────────────────────────────────────────────────────┐│
│ │ 🏗️ HẠ TẦNG & AN TOÀN THÔNG TIN                                  ││
│ ├─────────────────────────────────────────────────────────────────┤│
│ │                                                                  ││
│ │ ☁️ Di dời hệ thống về Cloud tập trung                           ││
│ │ ████████████████████████░░░░░░  30/110 HT (27%)    🎯 100%      ││
│ │                                                                  ││
│ │ 🔒 Phê duyệt cấp độ ATTT                                        ││
│ │ ████████████████████████████░░  45/110 HT (41%)    🎯 100%      ││
│ │                                                                  ││
│ └─────────────────────────────────────────────────────────────────┘│
│                                                                     │
│ ┌─────────────────────────────────────────────────────────────────┐│
│ │ 📊 DỮ LIỆU & KẾT NỐI                                            ││
│ ├─────────────────────────────────────────────────────────────────┤│
│ │                                                                  ││
│ │ 🗄️ Vận hành Data Lakehouse                                      ││
│ │ ████████████████████░░░░░░░░░░  Đang triển khai    🎯 Q2/2026   ││
│ │                                                                  ││
│ │ 🔗 Kết nối LGSP (Nhóm 1 & 2)                                    ││
│ │ ████████████████░░░░░░░░░░░░░░  25/60 HT (42%)     🎯 100%      ││
│ │                                                                  ││
│ │ 🏛️ Kết nối CSDL Quốc gia dân cư                                 ││
│ │ ██████████░░░░░░░░░░░░░░░░░░░░  Đang thử nghiệm    🎯 Q3/2026   ││
│ │                                                                  ││
│ └─────────────────────────────────────────────────────────────────┘│
│                                                                     │
│ ┌─────────────────────────────────────────────────────────────────┐│
│ │ 🖥️ NỀN TẢNG                                                     ││
│ ├─────────────────────────────────────────────────────────────────┤│
│ │                                                                  ││
│ │ 📱 Đưa vào sử dụng One MST v1.0                                 ││
│ │ ██████████████████████████████  ✅ Hoàn thành      🎯 Q1/2026   ││
│ │                                                                  ││
│ └─────────────────────────────────────────────────────────────────┘│
│                                                                     │
│ ┌───────────────────────────────────────────────────────────────┐  │
│ │ 📈 Tổng tiến độ Giai đoạn 1:  35%  ███████░░░░░░░░░░░░░░░░░░│  │
│ └───────────────────────────────────────────────────────────────┘  │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

#### 3.3.3. System Classification View

```
┌─────────────────────────────────────────────────────────────────────┐
│ 🗂️ Phân loại Hệ thống theo Lộ trình                                │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐│
│ │   Nhóm 1     │ │   Nhóm 2     │ │   Nhóm 3     │ │   Nhóm 4     ││
│ │   DUY TRÌ    │ │   NÂNG CẤP   │ │   THAY THẾ   │ │   HỢP NHẤT   ││
│ ├──────────────┤ ├──────────────┤ ├──────────────┤ ├──────────────┤│
│ │              │ │              │ │              │ │              ││
│ │     8 HT     │ │     8 HT     │ │     9 HT     │ │     4 HT     ││
│ │              │ │              │ │              │ │              ││
│ │ ✅ Hoạt động │ │ ⚠️ Cần nâng  │ │ 🔴 Cần thay  │ │ 🔄 Trùng lặp ││
│ │    tốt       │ │    cấp       │ │    thế       │ │    chức năng ││
│ │              │ │              │ │              │ │              ││
│ │ [Xem chi    │ │ [Xem chi    │ │ [Xem chi    │ │ [Xem chi    ││
│ │  tiết]       │ │  tiết]       │ │  tiết]       │ │  tiết]       ││
│ └──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘│
│                                                                     │
│ ┌──────────────┐                                                    │
│ │   Chưa       │   ← Cần đánh giá thêm                             │
│ │   đánh giá   │                                                    │
│ ├──────────────┤                                                    │
│ │              │                                                    │
│ │    81 HT     │                                                    │
│ │              │                                                    │
│ │ [Xem chi    │                                                    │
│ │  tiết]       │                                                    │
│ └──────────────┘                                                    │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### 3.4. Data Mapping

Mapping dữ liệu hiện có với các chỉ số của Lộ trình:

| Chỉ số Lộ trình | Field trong Database | Query |
|-----------------|---------------------|-------|
| % on Cloud | `operations.deployment_location` | `WHERE deployment_location = 'cloud'` |
| % ATTT compliant | `security.compliance_standards` | `WHERE compliance_standards IS NOT NULL` |
| % connected LGSP | `integration.has_integration` | `WHERE has_integration = true` |
| Nhóm 1 (Duy trì) | `assessment.recommendation = 'keep'` | Count |
| Nhóm 2 (Nâng cấp) | `assessment.recommendation = 'upgrade'` | Count |
| Nhóm 3 (Thay thế) | `assessment.recommendation = 'replace'` | Count |
| Nhóm 4 (Hợp nhất) | `assessment.recommendation = 'merge'` | Count |

### 3.5. Backend API

#### Endpoint: `GET /api/systems/roadmap-stats/`

**Response:**
```json
{
  "current_phase": 1,
  "phase_progress": {
    "phase_1": {
      "name": "Ổn định hạ tầng – Hội tụ dữ liệu – Thiết lập nền tảng",
      "timeline": "2026",
      "overall_progress": 35,
      "categories": [
        {
          "name": "Hạ tầng & ATTT",
          "targets": [
            {
              "name": "Di dời hệ thống về Cloud",
              "current": 30,
              "total": 110,
              "target": 100,
              "unit": "percent",
              "deadline": "Q4/2026"
            },
            {
              "name": "Phê duyệt cấp độ ATTT",
              "current": 45,
              "total": 110,
              "target": 100,
              "unit": "percent",
              "deadline": "Q4/2026"
            }
          ]
        },
        {
          "name": "Dữ liệu & Kết nối",
          "targets": [...]
        }
      ]
    },
    "phase_2": {...},
    "phase_3": {...}
  },
  "system_classification": {
    "keep": {"count": 8, "systems": [...]},
    "upgrade": {"count": 8, "systems": [...]},
    "replace": {"count": 9, "systems": [...]},
    "merge": {"count": 4, "systems": [...]},
    "unknown": {"count": 81, "systems": [...]}
  }
}
```

---

## Phụ lục: Tóm tắt cho Review

### A. Feature 1: Insights Dashboard

| Mục | Nội dung |
|-----|----------|
| **Giá trị** | Tự động phát hiện vấn đề, không cần phân tích thủ công |
| **Dữ liệu nguồn** | 110 systems × 70+ fields |
| **Phân loại** | Critical (đỏ) → Warning (vàng) → Info (xanh) |
| **OpenAI** | Optional - sinh mô tả và khuyến nghị tự động |
| **Effort** | Medium (3-5 ngày) |

### B. Feature 2: AI SQL Assistant

| Mục | Nội dung |
|-----|----------|
| **Giá trị** | Truy vấn dữ liệu bằng tiếng Việt, không cần biết SQL |
| **Công nghệ** | OpenAI GPT-4 + PostgreSQL read-only |
| **Bảo mật** | SQL validation, read-only user, whitelist patterns |
| **Visualization** | Auto-generate charts từ kết quả |
| **Effort** | High (7-10 ngày) |

### C. Feature 3: Roadmap Tab

| Mục | Nội dung |
|-----|----------|
| **Giá trị** | Theo dõi tiến độ CĐS theo Kiến trúc tổng thể |
| **3 Giai đoạn** | 2026 (Xây móng) → 2027-28 (Chuẩn hóa) → 2029-30 (AI-driven) |
| **Chỉ số** | % Cloud, % ATTT, % LGSP, phân loại HT |
| **Data** | Mapping từ fields hiện có |
| **Effort** | Medium (3-5 ngày) |

### D. Ưu tiên đề xuất

1. **Feature 3 - Roadmap** (Ưu tiên 1): Cần thiết nhất để align với Kiến trúc số
2. **Feature 1 - Insights** (Ưu tiên 2): Giá trị cao, effort vừa phải
3. **Feature 2 - AI Assistant** (Ưu tiên 3): Giá trị cao nhưng effort lớn hơn

---

## Câu hỏi cần xác nhận

1. **Feature 1**: Có cần tích hợp OpenAI cho insights hay chỉ cần rule-based?
2. **Feature 2**: OpenAI API key sẽ được cung cấp hay cần đăng ký mới?
3. **Feature 3**: Các milestone cụ thể (One MST, Data Lakehouse) có thông tin status thực tế không?
4. **Chung**: Thứ tự ưu tiên implement như đề xuất có phù hợp không?
