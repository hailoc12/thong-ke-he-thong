# REST API DOCUMENTATION

**Base URL**: https://thongkehethong.mindmaid.ai/api/

**Created**: 2026-01-15

---

## 📚 API Documentation

### Interactive Documentation

- **Swagger UI**: https://thongkehethong.mindmaid.ai/api/docs/
- **ReDoc**: https://thongkehethong.mindmaid.ai/api/redoc/
- **OpenAPI Schema**: https://thongkehethong.mindmaid.ai/api/schema/

---

## 🔐 Authentication

### JWT Token Authentication

All API endpoints (except token endpoints) require JWT authentication.

#### Obtain Token

```bash
POST /api/token/
Content-Type: application/json

{
  "username": "admin",
  "password": "your_password"
}
```

**Response:**
```json
{
  "access": "eyJhbGci...",
  "refresh": "eyJhbGci..."
}
```

#### Refresh Token

```bash
POST /api/token/refresh/
Content-Type: application/json

{
  "refresh": "eyJhbGci..."
}
```

#### Using Token

Include token in Authorization header for all API requests:

```bash
Authorization: Bearer eyJhbGci...
```

---

## 📋 Organizations API

Base: `/api/organizations/`

### Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/organizations/` | List all organizations | ✅ |
| POST | `/api/organizations/` | Create new organization | ✅ |
| GET | `/api/organizations/{id}/` | Get organization detail | ✅ |
| PUT | `/api/organizations/{id}/` | Update organization | ✅ |
| PATCH | `/api/organizations/{id}/` | Partial update | ✅ |
| DELETE | `/api/organizations/{id}/` | Delete organization | ✅ |
| GET | `/api/organizations/{id}/systems/` | Get systems in organization | ✅ |

### List Organizations

```bash
GET /api/organizations/

# With filtering & search
GET /api/organizations/?search=VNTT
GET /api/organizations/?ordering=name
```

**Response:**
```json
{
  "count": 1,
  "next": null,
  "previous": null,
  "results": [
    {
      "id": 1,
      "code": "VNTT",
      "name": "Vụ Công nghệ thông tin",
      "contact_person": "Nguyễn Văn A",
      "contact_email": "nva@example.com",
      "system_count": 5,
      "created_at": "2026-01-15T10:00:00Z"
    }
  ]
}
```

### Create Organization

```bash
POST /api/organizations/
Content-Type: application/json

{
  "name": "Vụ Kế hoạch tài chính",
  "code": "VKHTC",
  "description": "Vụ quản lý kế hoạch và tài chính",
  "contact_person": "Trần Văn B",
  "contact_email": "tvb@example.com",
  "contact_phone": "0987654321"
}
```

### Get Organization Detail

```bash
GET /api/organizations/1/
```

**Response:**
```json
{
  "id": 1,
  "name": "Vụ Công nghệ thông tin",
  "code": "VNTT",
  "description": "Vụ quản lý công nghệ thông tin",
  "contact_person": "Nguyễn Văn A",
  "contact_email": "nva@example.com",
  "contact_phone": "0123456789",
  "system_count": 5,
  "created_at": "2026-01-15T10:00:00Z",
  "updated_at": "2026-01-15T10:00:00Z"
}
```

---

## 🖥️ Systems API

Base: `/api/systems/`

### Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/systems/` | List all systems | ✅ |
| POST | `/api/systems/` | Create new system | ✅ |
| GET | `/api/systems/{id}/` | Get system detail | ✅ |
| PUT | `/api/systems/{id}/` | Update system | ✅ |
| PATCH | `/api/systems/{id}/` | Partial update | ✅ |
| DELETE | `/api/systems/{id}/` | Delete system | ✅ |
| POST | `/api/systems/{id}/save_draft/` | Save as draft | ✅ |
| POST | `/api/systems/{id}/submit/` | Submit (mark active) | ✅ |
| GET | `/api/systems/statistics/` | Get statistics | ✅ |

### List Systems

```bash
GET /api/systems/

# With filtering
GET /api/systems/?org=1
GET /api/systems/?status=active
GET /api/systems/?criticality_level=high
GET /api/systems/?form_level=2

# With search
GET /api/systems/?search=quản lý

# With ordering
GET /api/systems/?ordering=-created_at
```

**Response:**
```json
{
  "count": 1,
  "next": null,
  "previous": null,
  "results": [
    {
      "id": 1,
      "system_code": "SYS001",
      "system_name": "Hệ thống quản lý văn bản",
      "system_name_en": "Document Management System",
      "org": 1,
      "org_name": "Vụ Công nghệ thông tin",
      "status": "active",
      "status_display": "active",
      "criticality_level": "high",
      "criticality_display": "Quan trọng",
      "form_level": 1,
      "business_owner": "Nguyễn Văn A",
      "technical_owner": "Trần Văn B",
      "users_total": 500,
      "users_mau": 300,
      "created_at": "2026-01-15T10:00:00Z",
      "updated_at": "2026-01-15T10:00:00Z"
    }
  ]
}
```

### Get System Detail

```bash
GET /api/systems/1/
```

**Response includes nested related models:**
```json
{
  "id": 1,
  "system_code": "SYS001",
  "system_name": "Hệ thống quản lý văn bản",
  "org_name": "Vụ Công nghệ thông tin",
  "status_display": "active",
  "criticality_display": "Quan trọng",

  // Level 1 related models (always included)
  "architecture": {
    "architecture_type": "web_based",
    "backend_tech": "Django",
    "frontend_tech": "React",
    "database_type": "PostgreSQL"
  },
  "data_info": {
    "data_volume": "medium",
    "data_types": ["text", "files"],
    "data_sharing": "internal"
  },
  "operations": {
    "development_model": "in_house",
    "warranty_period": 24
  },
  "integration": {
    "integration_count": 3,
    "integration_types": ["api", "database"]
  },
  "assessment": {
    "performance_rating": "good",
    "uptime_percent": 99.5
  },
  "attachments": [],

  // Level 2 models (only if form_level=2)
  "cost": null,
  "vendor": null,
  "infrastructure": null,
  "security": null,

  // ... other fields
}
```

### Create System

```bash
POST /api/systems/
Content-Type: application/json

{
  "org": 1,
  "system_code": "SYS002",
  "system_name": "Hệ thống email",
  "system_name_en": "Email System",
  "purpose": "Quản lý email nội bộ",
  "status": "draft",
  "criticality_level": "medium",
  "form_level": 1,
  "business_owner": "Nguyễn Văn C",
  "technical_owner": "Trần Văn D",

  // Nested related models data (optional)
  "architecture_data": {
    "architecture_type": "web_based",
    "backend_tech": "Node.js",
    "frontend_tech": "Vue.js"
  },
  "data_info_data": {
    "data_volume": "large",
    "data_types": ["email", "attachments"]
  }
  // ... other nested data
}
```

### Save Draft

```bash
POST /api/systems/1/save_draft/
```

**Response:** System object with `status` changed to `"draft"`

### Submit System

```bash
POST /api/systems/1/submit/
```

**Response:** System object with `status` changed to `"active"`

### Get Statistics

```bash
GET /api/systems/statistics/
```

**Response:**
```json
{
  "total": 15,
  "by_status": {
    "active": 10,
    "inactive": 2,
    "maintenance": 1,
    "planning": 1,
    "draft": 1
  },
  "by_criticality": {
    "critical": 3,
    "high": 5,
    "medium": 4,
    "low": 3
  },
  "by_form_level": {
    "level_1": 10,
    "level_2": 5
  }
}
```

---

## 📎 Attachments API

Base: `/api/attachments/`

### Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/attachments/` | List all attachments | ✅ |
| POST | `/api/attachments/` | Upload attachment | ✅ |
| GET | `/api/attachments/{id}/` | Get attachment detail | ✅ |
| PUT | `/api/attachments/{id}/` | Update attachment | ✅ |
| DELETE | `/api/attachments/{id}/` | Delete attachment | ✅ |

### Upload Attachment

```bash
POST /api/attachments/
Content-Type: multipart/form-data

{
  "system": 1,
  "attachment_type": "diagram",
  "file": <file upload>,
  "description": "Sơ đồ kiến trúc hệ thống"
}
```

### List Attachments

```bash
GET /api/attachments/?system=1
GET /api/attachments/?attachment_type=diagram
```

**Response:**
```json
{
  "count": 2,
  "results": [
    {
      "id": 1,
      "system": 1,
      "attachment_type": "diagram",
      "filename": "architecture.pdf",
      "description": "Sơ đồ kiến trúc",
      "file_url": "https://thongkehethong.mindmaid.ai/media/attachments/architecture.pdf",
      "file_size": 1024000,
      "file_size_display": "1.0 MB",
      "mime_type": "application/pdf",
      "uploaded_by": 1,
      "uploaded_at": "2026-01-15T10:00:00Z"
    }
  ]
}
```

---

## 🔍 Filtering & Search

### Filter Parameters

All list endpoints support filtering:

```bash
# Organizations
GET /api/organizations/?search=công nghệ

# Systems
GET /api/systems/?org=1
GET /api/systems/?status=active
GET /api/systems/?criticality_level=high
GET /api/systems/?form_level=2
GET /api/systems/?search=quản lý

# Attachments
GET /api/attachments/?system=1
GET /api/attachments/?attachment_type=diagram
```

### Ordering

```bash
GET /api/systems/?ordering=created_at      # Ascending
GET /api/systems/?ordering=-created_at     # Descending
GET /api/systems/?ordering=system_name     # By name
```

### Pagination

Default page size: 20 items

```bash
GET /api/systems/?page=2
GET /api/systems/?page=1&page_size=50
```

---

## 📊 Response Format

### Success Response

```json
{
  "count": 100,
  "next": "https://thongkehethong.mindmaid.ai/api/systems/?page=2",
  "previous": null,
  "results": [...]
}
```

### Error Response

```json
{
  "detail": "Authentication credentials were not provided.",
  "code": "authentication_failed"
}
```

Or field-level errors:

```json
{
  "system_code": ["This field is required."],
  "status": ["\"invalid\" is not a valid choice."]
}
```

---

## 🔑 Choice Fields

### System Status

- `active` - Đang hoạt động
- `inactive` - Ngưng hoạt động
- `maintenance` - Bảo trì
- `planning` - Đang lập kế hoạch
- `draft` - Bản nháp

### Criticality Level

- `critical` - Cực kỳ quan trọng
- `high` - Quan trọng
- `medium` - Trung bình
- `low` - Thấp

### Form Level

- `1` - Level 1 (6 sections)
- `2` - Level 2 (11 sections)

### Attachment Types

- `diagram` - Sơ đồ
- `contract` - Hợp đồng
- `report` - Báo cáo
- `technical_doc` - Tài liệu kỹ thuật
- `user_manual` - Hướng dẫn sử dụng
- `other` - Khác

---

## 🧪 Testing

### Using cURL

```bash
# Get token
TOKEN=$(curl -s -X POST https://thongkehethong.mindmaid.ai/api/token/ \
  -H 'Content-Type: application/json' \
  -d '{"username":"admin","password":"Admin@2026"}' \
  | python3 -c "import sys, json; print(json.load(sys.stdin)['access'])")

# List systems
curl -H "Authorization: Bearer $TOKEN" \
  https://thongkehethong.mindmaid.ai/api/systems/

# Create organization
curl -X POST https://thongkehethong.mindmaid.ai/api/organizations/ \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Vụ Kế hoạch",
    "code": "VKH",
    "contact_email": "vkh@example.com"
  }'
```

### Using Python

```python
import requests

# Login
response = requests.post('https://thongkehethong.mindmaid.ai/api/token/', json={
    'username': 'admin',
    'password': 'Admin@2026'
})
token = response.json()['access']

# Headers with token
headers = {'Authorization': f'Bearer {token}'}

# Get systems
response = requests.get('https://thongkehethong.mindmaid.ai/api/systems/', headers=headers)
systems = response.json()

print(f"Total systems: {systems['count']}")
for system in systems['results']:
    print(f"- {system['system_name']}")
```

---

## 📝 Notes

1. **Token Expiration**: Access tokens expire after 1 hour. Use refresh token to get new access token.

2. **Nested Writes**: When creating/updating systems, you can include nested data for related models using `*_data` fields.

3. **File Uploads**: Use `multipart/form-data` for attachment uploads.

4. **Permissions**:
   - Superusers can access all data
   - Regular users can only access their organization's data

5. **Validation**: All required fields must be provided. Check field requirements in Swagger docs.

6. **Related Models**: System detail view includes all related models (architecture, data_info, etc.) as nested objects.

---

## 🚀 Next Steps

1. **Frontend Development**: Use these APIs to build React frontend
2. **More Endpoints**: Add export (Word/Excel) endpoints
3. **Advanced Filtering**: Add date range filters, multi-select filters
4. **Webhooks**: Add notification webhooks for system updates
5. **GraphQL**: Consider adding GraphQL endpoint

---

**Documentation Version**: 1.0.0
**Last Updated**: 2026-01-15
**Contact**: admin@mindmaid.ai
