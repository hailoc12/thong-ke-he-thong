# Quick Input: Convert Single-Select to Multi-Select

**Date:** 2026-01-20
**Status:** Backlog - Ready for Implementation
**Priority:** P1
**Estimated Effort:** 2-3 days

---

## 📋 Executive Summary

**Current State:** 32 fields using SelectWithOther (single-select dropdown + "Khác")

**Customer Requirement:** Hầu hết các tech stack fields nên cho phép chọn NHIỀU giá trị (vì thực tế hệ thống có thể dùng nhiều công nghệ cùng lúc)

**Action Required:** Convert 19 fields từ SelectWithOther → CheckboxGroupWithOther

**Rationale:**
- Backend có thể dùng nhiều ngôn ngữ (Node.js + Python microservices)
- Frontend có thể dùng React + Vue trong các modules khác nhau
- Database có thể dùng PostgreSQL + Redis + MongoDB
- Authentication có thể hỗ trợ nhiều phương thức (LDAP + Local + SSO)

---

## 🎯 Field Classification

### ✅ KEEP Single-Select (SelectWithOther) - 13 fields

Các field này chỉ nên chọn 1 giá trị duy nhất:

| # | Field | Reason | Tab |
|---|-------|--------|-----|
| 1 | `system_group` | Hệ thống chỉ thuộc 1 nhóm duy nhất | Tab 1: Basic Info |
| 2 | `support_level` | Chỉ có 1 mức hỗ trợ chính | Tab 7: Operations |
| 3 | `api_gateway_name` | Thường chỉ 1 gateway duy nhất | Tab 5: Integration |
| 4 | `cicd_tool` | Thường chỉ 1 CI/CD tool chính | Tab 3: Architecture |
| 5 | `cache_system` | Thường chỉ 1 loại cache chính | Tab 3: Architecture |
| 6 | `messaging_queue` | Thường chỉ 1 message queue | Tab 3: Architecture |
| 7 | `search_engine` | Thường chỉ 1 search engine | Tab 3: Architecture |
| 8 | `reporting_bi_tool` | Thường chỉ 1 BI tool chính | Tab 3: Architecture |
| 9 | `source_repository` | Thường chỉ 1 repository system | Tab 3: Architecture |
| 10 | `api_versioning_standard` | Chỉ 1 chuẩn versioning | Tab 5: Integration |
| 11 | `data_volume` | Chỉ 1 mức khối lượng dữ liệu | Tab 4: Data |
| 12 | `storage_capacity` | Chỉ 1 mức dung lượng | Tab 7: Operations |
| 13 | `server_configuration` | Chỉ 1 loại cấu hình chính | Tab 7: Operations |

**Action:** Giữ nguyên SelectWithOther ✅

---

### 🔄 CONVERT to Multi-Select (CheckboxGroupWithOther) - 19 fields

Các field này nên chuyển sang multi-select:

#### Section 1: Tech Stack (7 fields) - PRIORITY P0

| # | Field | Current | Target | Reason | Tab |
|---|-------|---------|--------|--------|-----|
| 1 | `programming_language` | Single | **Multi** | Microservices dùng nhiều ngôn ngữ (Node.js + Python + Go) | Tab 3 |
| 2 | `framework` | Single | **Multi** | Frontend có thể React + Vue, Backend có thể Express + FastAPI | Tab 3 |
| 3 | `backend_tech` | Single | **Multi** | Node.js + Python + Java trong cùng 1 hệ thống | Tab 3 |
| 4 | `frontend_tech` | Single | **Multi** | React + Vue + Angular trong các modules khác nhau | Tab 3 |
| 5 | `database_name` | Single | **Multi** | PostgreSQL + Redis + MongoDB + Elasticsearch | Tab 3 |
| 6 | `hosting_platform` | Single | **Multi** | Hybrid cloud: AWS + On-premise + Azure | Tab 3 |
| 7 | `containerization` | Single | **Multi** | Docker + Kubernetes + OpenShift | Tab 3 |

**Estimated Effort:** 3-4 hours

---

#### Section 2: Architecture & Integration (5 fields) - PRIORITY P1

| # | Field | Current | Target | Reason | Tab |
|---|-------|---------|--------|--------|-----|
| 8 | `architecture_type` | Single | **Multi** | Monolith + Microservices + Serverless hybrid | Tab 3 |
| 9 | `api_style` | Single | **Multi** | REST + GraphQL + gRPC cùng tồn tại | Tab 5 |
| 10 | `api_standard` | Single | **Multi** | OpenAPI + AsyncAPI + gRPC Proto | Tab 5 |
| 11 | `authentication_method` | Single | **Multi** | LDAP + Local + SSO + OAuth2 cùng hỗ trợ | Tab 6 |
| 12 | `data_exchange_method` | Single | **Multi** | API + File Transfer + Database Link + Message Queue | Tab 5 |

**Estimated Effort:** 2-3 hours

---

#### Section 3: Data & Security (4 fields) - PRIORITY P1

| # | Field | Current | Target | Reason | Tab |
|---|-------|---------|--------|--------|-----|
| 13 | `data_classification_type` | Single | **Multi** | Dữ liệu vừa công khai vừa mật (nhiều loại) | Tab 4 |
| 14 | `file_storage_type` | Single | **Multi** | File Server + Object Storage + ECM cùng dùng | Tab 4 |
| 15 | `compliance_standards_list` | Single | **Multi** | GDPR + ISO27001 + SOC2 + Local regulations | Tab 6 |
| 16 | `backup_plan` | Single | **Multi** | Daily + Weekly + Monthly backups | Tab 7 |

**Estimated Effort:** 2 hours

---

#### Section 4: Integration Details (3 fields) - PRIORITY P2

| # | Field | Current | Target | Reason | Tab |
|---|-------|---------|--------|--------|-----|
| 17 | `integration_method` | Single | **Multi** | API + File + DB Link + Manual cùng dùng | Tab 5 (IntegrationConnectionList) |
| 18 | `api_gateway_name` | Single → **Keep** | Single | Reconsider: Có thể có Kong + AWS API Gateway | Tab 5 |
| 19 | `disaster_recovery_plan` | Single | **Multi** | Hot standby + Backup site + Cloud DR | Tab 7 |

**Estimated Effort:** 2 hours

**Note:** `integration_method` nằm trong IntegrationConnectionList component - cần update component này riêng.

---

## 📊 Summary Statistics

| Category | Count | Effort | Priority |
|----------|-------|--------|----------|
| Keep Single-Select | 13 fields | 0h (no change) | - |
| Convert to Multi-Select | 19 fields | 9-10 hours | P0-P2 |
| **Total Changes** | **19 fields** | **9-10 hours (~1.5 days)** | - |

---

## 🔧 Implementation Plan

### Phase 1: Tech Stack Fields (Day 1 morning)
**Fields:** programming_language, framework, backend_tech, frontend_tech, database_name, hosting_platform, containerization

**Steps:**
1. Update option lists (add more relevant options)
2. Replace `<SelectWithOther>` with `<CheckboxGroupWithOther>` in SystemCreate.tsx
3. Mirror changes to SystemEdit.tsx
4. Test: Create system → select multiple techs → save → verify JSON array in DB

**Verification:**
- Backend models already support JSONField for these fields
- No migration needed (CharField accepts both string and JSON array)

---

### Phase 2: Architecture & Integration (Day 1 afternoon)
**Fields:** architecture_type, api_style, api_standard, authentication_method, data_exchange_method

**Steps:**
1. Convert 5 fields in both SystemCreate.tsx and SystemEdit.tsx
2. Test with real data

---

### Phase 3: Data & Security (Day 2 morning)
**Fields:** data_classification_type, file_storage_type, compliance_standards_list, backup_plan

**Steps:**
1. Convert 4 fields
2. Verify security compliance fields work correctly

---

### Phase 4: IntegrationConnectionList Component (Day 2 afternoon)
**Field:** integration_method (special case)

**Steps:**
1. Update IntegrationConnectionList component
2. Replace `<SelectWithOther>` with `<CheckboxGroupWithOther>` inside the component
3. Update type definition: `integration_method: string` → `integration_method: string[]`
4. Test dynamic list with multi-select

---

## 📝 Detailed Field Specifications

### 1. programming_language

**Current:**
```typescript
<Form.Item name="programming_language">
  <SelectWithOther options={programmingLanguageOptions} />
</Form.Item>
```

**After:**
```typescript
<Form.Item name="programming_language">
  <CheckboxGroupWithOther options={programmingLanguageOptions} />
</Form.Item>
```

**Options to Add:**
```typescript
const programmingLanguageOptions = [
  { label: 'Python', value: 'Python' },
  { label: 'Java', value: 'Java' },
  { label: 'JavaScript/TypeScript', value: 'JavaScript' },
  { label: 'C#', value: 'C#' },
  { label: 'Go', value: 'Go' },
  { label: 'PHP', value: 'PHP' },
  { label: 'Ruby', value: 'Ruby' },
  { label: 'Kotlin', value: 'Kotlin' },
  { label: 'Rust', value: 'Rust' },
  { label: 'Swift', value: 'Swift' },
  { label: 'C++', value: 'C++' },
  { label: 'Scala', value: 'Scala' },
  { label: 'Khác', value: 'other' },
];
```

---

### 2. framework

**Options to Add:**
```typescript
const frameworkOptions = [
  // Backend
  { label: 'Django (Python)', value: 'Django' },
  { label: 'FastAPI (Python)', value: 'FastAPI' },
  { label: 'Flask (Python)', value: 'Flask' },
  { label: 'Spring Boot (Java)', value: 'Spring Boot' },
  { label: 'Express.js (Node)', value: 'Express' },
  { label: 'NestJS (Node)', value: 'NestJS' },
  { label: '.NET Core (C#)', value: 'ASP.NET Core' },
  { label: 'Laravel (PHP)', value: 'Laravel' },
  { label: 'Ruby on Rails', value: 'Rails' },

  // Frontend
  { label: 'React', value: 'React' },
  { label: 'Vue.js', value: 'Vue' },
  { label: 'Angular', value: 'Angular' },
  { label: 'Svelte', value: 'Svelte' },
  { label: 'Next.js', value: 'Next.js' },

  { label: 'Khác', value: 'other' },
];
```

---

### 3. database_name

**Options to Add:**
```typescript
const databaseOptions = [
  // Relational
  { label: 'PostgreSQL', value: 'PostgreSQL' },
  { label: 'MySQL/MariaDB', value: 'MySQL' },
  { label: 'Oracle Database', value: 'Oracle' },
  { label: 'Microsoft SQL Server', value: 'SQL Server' },

  // NoSQL
  { label: 'MongoDB', value: 'MongoDB' },
  { label: 'Redis', value: 'Redis' },
  { label: 'Elasticsearch', value: 'Elasticsearch' },
  { label: 'Cassandra', value: 'Cassandra' },
  { label: 'DynamoDB', value: 'DynamoDB' },

  // Cloud
  { label: 'Cloud SQL (GCP)', value: 'Cloud SQL' },
  { label: 'RDS (AWS)', value: 'RDS' },
  { label: 'Azure SQL', value: 'Azure SQL' },

  { label: 'Khác', value: 'other' },
];
```

---

### 4. hosting_platform

**Options:**
```typescript
const hostingPlatformOptions = [
  { label: 'On-premise (Data Center Bộ)', value: 'on_premise' },
  { label: 'AWS (Amazon Web Services)', value: 'aws' },
  { label: 'Azure (Microsoft)', value: 'azure' },
  { label: 'Google Cloud Platform', value: 'gcp' },
  { label: 'Viettel Cloud', value: 'viettel_cloud' },
  { label: 'VNPT Cloud', value: 'vnpt_cloud' },
  { label: 'FPT Cloud', value: 'fpt_cloud' },
  { label: 'DigitalOcean', value: 'digitalocean' },
  { label: 'Heroku', value: 'heroku' },
  { label: 'Khác', value: 'other' },
];
```

---

### 5. authentication_method

**Options:**
```typescript
const authenticationMethodOptions = [
  { label: 'LDAP (Lightweight Directory Access Protocol)', value: 'ldap' },
  { label: 'Active Directory (AD)', value: 'ad' },
  { label: 'SSO (Single Sign-On)', value: 'sso' },
  { label: 'OAuth 2.0', value: 'oauth2' },
  { label: 'SAML 2.0', value: 'saml' },
  { label: 'OpenID Connect (OIDC)', value: 'oidc' },
  { label: 'JWT (JSON Web Token)', value: 'jwt' },
  { label: 'Local Database', value: 'local' },
  { label: 'Biometric', value: 'biometric' },
  { label: 'OTP/2FA', value: 'otp' },
  { label: 'Khác', value: 'other' },
];
```

---

### 6. api_style

**Options:**
```typescript
const apiStyleOptions = [
  { label: 'REST (RESTful API)', value: 'rest' },
  { label: 'GraphQL', value: 'graphql' },
  { label: 'gRPC', value: 'grpc' },
  { label: 'SOAP (Web Services)', value: 'soap' },
  { label: 'WebSocket', value: 'websocket' },
  { label: 'Server-Sent Events (SSE)', value: 'sse' },
  { label: 'Khác', value: 'other' },
];
```

---

### 7. data_exchange_method

**Options:**
```typescript
const dataExchangeMethodOptions = [
  { label: 'API REST', value: 'api_rest' },
  { label: 'API SOAP', value: 'api_soap' },
  { label: 'API GraphQL', value: 'api_graphql' },
  { label: 'File Transfer (SFTP/FTP)', value: 'file_transfer' },
  { label: 'Database Link/Replication', value: 'database_link' },
  { label: 'Message Queue (Kafka/RabbitMQ)', value: 'message_queue' },
  { label: 'ETL Pipeline', value: 'etl' },
  { label: 'Webhook', value: 'webhook' },
  { label: 'Thủ công (Manual)', value: 'manual' },
  { label: 'Khác', value: 'other' },
];
```

---

## 🧪 Testing Strategy

### Unit Testing
For each converted field:
1. ✅ Select multiple predefined options → save → verify array in DB
2. ✅ Select predefined + check "Khác" + enter custom → save → verify array includes custom
3. ✅ Edit existing system → verify pre-fills correctly (both predefined and custom)
4. ✅ Uncheck "Khác" → verify custom input hides and value removed

### Integration Testing
1. Create system with multi-select tech stack → save → edit → verify all values display
2. Filter/search systems by tech stack → verify multi-value filtering works
3. Export systems to Excel → verify multi-value fields display correctly

---

## 📋 Implementation Checklist

### Pre-Implementation
- [x] Review all 32 SelectWithOther fields
- [x] Classify single vs multi-select
- [x] Create detailed backlog
- [ ] Get customer approval on classification

### Implementation
- [ ] **Day 1 Morning:** Convert 7 tech stack fields
  - [ ] programming_language
  - [ ] framework
  - [ ] backend_tech
  - [ ] frontend_tech
  - [ ] database_name
  - [ ] hosting_platform
  - [ ] containerization
  - [ ] Test all 7 fields

- [ ] **Day 1 Afternoon:** Convert 5 architecture/integration fields
  - [ ] architecture_type
  - [ ] api_style
  - [ ] api_standard
  - [ ] authentication_method
  - [ ] data_exchange_method
  - [ ] Test all 5 fields

- [ ] **Day 2 Morning:** Convert 4 data/security fields
  - [ ] data_classification_type
  - [ ] file_storage_type
  - [ ] compliance_standards_list
  - [ ] backup_plan
  - [ ] Test all 4 fields

- [ ] **Day 2 Afternoon:** Convert IntegrationConnectionList
  - [ ] Update integration_method in component
  - [ ] Test dynamic list with multi-select
  - [ ] Update disaster_recovery_plan

### Testing & Deployment
- [ ] **Day 3 Morning:** Comprehensive testing
  - [ ] Test all 19 converted fields
  - [ ] Test create/edit/save/load
  - [ ] Test with existing data
  - [ ] Test custom "Khác" input

- [ ] **Day 3 Afternoon:** Deploy to staging
  - [ ] Deploy frontend changes
  - [ ] Smoke test on staging
  - [ ] Customer UAT

- [ ] **Week 2:** Production deployment
  - [ ] Deploy to production
  - [ ] Monitor for issues
  - [ ] Collect user feedback

---

## ⚠️ Risks & Mitigation

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| **Backend expects string but receives array** | HIGH | LOW | Backend models already use JSONField/TextField - flexible |
| **Existing data incompatible** | MEDIUM | LOW | CheckboxGroupWithOther handles both string and array |
| **Too many checkboxes confuse users** | MEDIUM | MEDIUM | Use 2-3 columns layout, max 12 options per field |
| **Performance degradation** | LOW | LOW | CheckboxGroupWithOther is lightweight |

---

## 🎯 Success Metrics

After implementation:
- ✅ All 19 fields support multi-select
- ✅ Existing data displays correctly in edit mode
- ✅ New systems can select multiple values
- ✅ Search/filter works with multi-value fields
- ✅ Zero data loss
- ✅ User feedback: "Easier to input realistic tech stacks"

---

## 📞 Next Steps

1. **Immediate:** Get customer approval on this backlog
2. **Day 1:** Start Phase 1 (tech stack fields)
3. **Day 2:** Complete Phase 2-4
4. **Day 3:** Testing and staging deployment
5. **Week 2:** Production deployment

**Ready to start implementation?**

---

**Generated:** 2026-01-20
**Status:** Ready for customer approval
**Assignee:** TBD
**Estimated Completion:** 2026-01-23 (3 working days)
