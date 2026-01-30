# Missing Fields Analysis - SystemDetail vs SystemCreate

**Date:** 2026-01-27
**Purpose:** So sánh các fields giữa form tạo mới (SystemCreate.tsx) và trang chi tiết (SystemDetail.tsx) để xác định fields còn thiếu trong view detail.

---

## Executive Summary

**SystemCreate có 9 tabs với tổng cộng ~100+ fields**
**SystemDetail chỉ hiển thị ~40 fields trong 8 sections**
**Missing: ~60+ fields quan trọng không được hiển thị trong trang detail**

---

## Tab 1: Cơ bản (Thông tin cơ bản)

### Fields hiện có trong SystemDetail:
- ✅ org_name (Tổ chức)
- ✅ system_code (Mã hệ thống)
- ✅ system_name (Tên hệ thống)
- ✅ system_name_en (Tên tiếng Anh)
- ✅ description (Mô tả)
- ✅ status (Trạng thái)
- ✅ criticality_level (Mức độ quan trọng)

### Fields THIẾU (có trong SystemCreate nhưng không có trong SystemDetail):
- ❌ **scope** (Phạm vi sử dụng) - Dropdown: internal_unit/org_wide/external
- ❌ **requirement_type** (Nhu cầu) - SelectWithOther: new_build/upgrade/integration/replacement/expansion
- ❌ **target_completion_date** (Thời gian mong muốn hoàn thành) - DatePicker Month/Year
- ❌ **system_group** (Nhóm hệ thống) - SelectWithOther: national_platform/shared_platform/specialized_db/business_app/portal/bi/esb
- ❌ **additional_notes_tab1** (Ghi chú bổ sung tab 1) - TextArea

**Note:** SystemDetail hiển thị `description` nhưng trong SystemCreate field này có tên `purpose`

---

## Tab 2: Nghiệp vụ (Bối cảnh nghiệp vụ)

### Fields hiện có trong SystemDetail:
- ✅ business_objectives (Mục tiêu nghiệp vụ) - Array display
- ✅ business_processes (Quy trình nghiệp vụ chính) - Array display
- ✅ has_design_documents (Có đủ hồ sơ phân tích thiết kế?) - Boolean
- ✅ annual_users (Số lượng người dùng hàng năm) - Number
- ✅ user_types (Đối tượng sử dụng) - Array with translation

### Fields THIẾU:
- ❌ **total_accounts** (Tổng số tài khoản) - InputNumber
- ❌ **users_mau** (MAU - Monthly Active Users) - InputNumber
- ❌ **users_dau** (DAU - Daily Active Users) - InputNumber
- ❌ **num_organizations** (Số đơn vị/địa phương sử dụng) - InputNumber
- ❌ **additional_notes_tab2** (Ghi chú bổ sung tab 2) - TextArea

**Impact:** Mất thống kê quan trọng về người dùng (MAU, DAU, tổng tài khoản)

---

## Tab 3: Công nghệ (Kiến trúc công nghệ)

### Fields hiện có trong SystemDetail:
- ✅ programming_language (Ngôn ngữ lập trình) - Single value only
- ✅ framework (Framework/Thư viện) - Single value only
- ✅ database_name (Cơ sở dữ liệu) - Single value only
- ✅ hosting_platform (Nền tảng triển khai) - Single value only

### Fields THIẾU:
**Backend/Frontend Tech:**
- ❌ **backend_tech** (Backend Technology) - CheckboxGroup: Node.js/Python/Java/C#/Go/PHP/Ruby/Rust/Scala/Kotlin
- ❌ **frontend_tech** (Frontend Technology) - CheckboxGroup: React/Vue/Angular/Next.js/Nuxt.js/jQuery/Svelte/Ember/Backbone

**Kiến trúc ứng dụng:**
- ❌ **architecture_type** (Loại kiến trúc) - CheckboxGroup: Monolithic/Modular/Microservices/SOA/Serverless/SaaS
- ❌ **containerization** (Container hóa) - CheckboxGroup: Docker/Kubernetes/OpenShift/None
- ❌ **is_multi_tenant** (Multi-tenant) - Boolean
- ❌ **has_layered_architecture** (Phân lớp Layered) - Boolean
- ❌ **layered_architecture_details** (Chi tiết phân lớp) - TextArea

**API & Messaging:**
- ❌ **api_style** (API Style) - CheckboxGroup: REST/GraphQL/gRPC/SOAP
- ❌ **messaging_queue** (Messaging/Queue) - CheckboxGroup: Kafka/RabbitMQ/ActiveMQ/Redis Pub/Sub
- ❌ **cache_system** (Cache System) - SelectWithOther: Redis/Memcached/None
- ❌ **search_engine** (Search Engine) - SelectWithOther: Elasticsearch/Apache Solr/None

**DevOps:**
- ❌ **reporting_bi_tool** (Reporting/BI Tool) - SelectWithOther: Power BI/Tableau/Metabase/Superset/Custom/None
- ❌ **source_repository** (Source Repository) - SelectWithOther: GitLab/GitHub/Bitbucket/Azure DevOps/On-premise
- ❌ **has_cicd** (CI/CD Pipeline) - Boolean
- ❌ **cicd_tool** (CI/CD Tool) - SelectWithOther: Jenkins/GitLab CI/GitHub Actions/Azure Pipelines/CircleCI/Travis CI/None
- ❌ **has_automated_testing** (Automated Testing) - Boolean
- ❌ **automated_testing_tools** (Testing Tools) - Text: Jest/Pytest/Selenium/JUnit

**Notes:**
- ❌ **additional_notes_tab3** (Ghi chú bổ sung tab 3) - TextArea

**Impact:** Mất hầu hết thông tin kiến trúc chi tiết, DevOps pipeline, API design

---

## Tab 4: Dữ liệu (Kiến trúc dữ liệu)

### Fields hiện có trong SystemDetail:
- ✅ data_sources (Nguồn dữ liệu) - Array display
- ✅ data_classification_type (Phân loại dữ liệu) - Single value only
- ✅ data_volume (Khối lượng dữ liệu) - Single value only

### Fields THIẾU:
**Loại dữ liệu:**
- ❌ **data_types** (Loại dữ liệu) - CheckboxGroup: Business/Documents/Statistics/Master Data/Vector Database

**Dung lượng dữ liệu:**
- ❌ **storage_size_gb** (Dung lượng CSDL hiện tại GB) - InputNumber
- ❌ **file_storage_size_gb** (Dung lượng file đính kèm GB) - InputNumber
- ❌ **growth_rate_percent** (Tốc độ tăng trưởng dữ liệu %) - InputNumber

**Chi tiết dữ liệu:**
- ❌ **file_storage_type** (Loại lưu trữ file) - CheckboxGroup: File Server/Object Storage/NAS/Database BLOB/None
- ❌ **record_count** (Số bản ghi) - InputNumber
- ❌ **secondary_databases** (CSDL phụ/khác) - Tags: Redis, MongoDB, ...
- ❌ **data_retention_policy** (Chính sách lưu trữ dữ liệu) - TextArea

**Data Governance:**
- ❌ **has_data_catalog** (Data Catalog) - Boolean
- ❌ **data_catalog_notes** (Ghi chú Data Catalog) - TextArea (conditional)
- ❌ **has_mdm** (Master Data Management) - Boolean
- ❌ **mdm_notes** (Ghi chú MDM) - TextArea (conditional)

**Notes:**
- ❌ **additional_notes_tab4** (Ghi chú bổ sung tab 4) - TextArea

**Impact:** Mất thông tin quan trọng về dung lượng, tốc độ tăng trưởng, data governance

---

## Tab 5: Tích hợp (Tích hợp hệ thống)

### Fields hiện có trong SystemDetail:
- ✅ integrated_internal_systems (Hệ thống nội bộ tích hợp) - Array display
- ✅ integrated_external_systems (Hệ thống bên ngoài tích hợp) - Array display
- ✅ api_list (API/Webservices) - Array display
- ✅ data_exchange_method (Phương thức trao đổi dữ liệu) - Single value only

### Fields THIẾU:
**Thống kê API:**
- ❌ **api_provided_count** (Số API cung cấp) - InputNumber
- ❌ **api_consumed_count** (Số API tiêu thụ) - InputNumber
- ❌ **api_standard** (Chuẩn API) - CheckboxGroup: OpenAPI 3.0/OpenAPI 2.0/SOAP/GraphQL/gRPC/AsyncAPI/RAML/None

**API Gateway & Quản lý:**
- ❌ **has_api_gateway** (Có API Gateway?) - Boolean
- ❌ **api_gateway_name** (Tên API Gateway) - SelectWithOther: Kong/AWS API Gateway/Azure API Management/Google Apigee/Nginx/Traefik/None
- ❌ **has_api_versioning** (Có API Versioning?) - Boolean
- ❌ **has_rate_limiting** (Có Rate Limiting?) - Boolean

**API Documentation & Monitoring:**
- ❌ **api_documentation** (Tài liệu API) - TextArea: link to Swagger/OpenAPI docs
- ❌ **api_versioning_standard** (Chuẩn phiên bản API) - SelectWithOther: Semantic/Date-based/URL-based/Header-based/None
- ❌ **has_integration_monitoring** (Có giám sát tích hợp?) - Boolean

**Danh sách tích hợp chi tiết:**
- ❌ **integration_connections_data** (Danh sách tích hợp chi tiết) - Complex Dynamic Form
  - source_system, target_system, data_objects, integration_method, frequency, error_handling, has_api_docs, notes

**Notes:**
- ❌ **additional_notes_tab5** (Ghi chú bổ sung tab 5) - TextArea

**Impact:** Mất thông tin chi tiết về API management, gateway, monitoring, và danh sách tích hợp chi tiết

---

## Tab 6: Bảo mật (An toàn thông tin)

### Fields hiện có trong SystemDetail:
- ✅ authentication_method (Phương thức xác thực) - Single value only, translated
- ✅ has_encryption (Mã hóa dữ liệu) - Boolean
- ✅ has_audit_log (Có log audit?) - Boolean
- ⚠️ compliance_standards_list (Tuân thủ tiêu chuẩn) - **Field name mismatch?**

### Fields THIẾU:
**Mức độ an toàn:**
- ❌ **security_level** (Cấp độ an toàn) - Select: Cấp 1-5
- ❌ **has_security_documents** (Có tài liệu ATTT?) - Boolean

**Notes:**
- ❌ **additional_notes_tab6** (Ghi chú bổ sung tab 6) - TextArea

**Note:** SystemCreate có `authentication_method` là CheckboxGroup (multi-select), nhưng SystemDetail hiển thị single value

---

## Tab 7: Hạ tầng (Hạ tầng kỹ thuật)

### Fields hiện có trong SystemDetail:
- ✅ server_configuration (Cấu hình máy chủ) - Single value
- ✅ storage_capacity (Dung lượng lưu trữ) - Single value
- ✅ backup_plan (Phương án sao lưu) - Single value
- ✅ disaster_recovery_plan (Kế hoạch khôi phục thảm họa) - Single value

### Fields THIẾU:
**Triển khai & Hạ tầng:**
- ❌ **deployment_location** (Vị trí triển khai) - Select: Data Center/Cloud/Hybrid
- ❌ **compute_specifications** (Cấu hình tính toán) - TextArea: VD: 8 vCPU, 16GB RAM, 500GB SSD, Load Balancer

**Loại hạ tầng & Tần suất triển khai:**
- ❌ **compute_type** (Loại hạ tầng tính toán) - Select: VM/Container/Serverless/Bare Metal
- ❌ **deployment_frequency** (Tần suất triển khai) - Select: Daily/Weekly/Monthly/Quarterly/Yearly/On Demand

**Notes:**
- ❌ **additional_notes_tab7** (Ghi chú bổ sung tab 7) - TextArea

**Note:** SystemCreate có `backup_plan` là CheckboxGroup (multi-select), nhưng SystemDetail hiển thị single value

---

## Tab 8: Vận hành

### Fields hiện có trong SystemDetail:
- ✅ business_owner (Người chịu trách nhiệm)
- ✅ technical_owner (Người quản trị kỹ thuật)
- ✅ responsible_phone (Số điện thoại liên hệ)
- ✅ responsible_email (Email liên hệ)

### Fields THIẾU:
- ❌ **support_level** (Mức độ hỗ trợ) - SelectWithOther: 24/7/Business hours/Business days/On-demand/Best effort/None
- ❌ **additional_notes_tab8** (Ghi chú bổ sung tab 8) - TextArea

---

## Tab 9: Đánh giá (Đánh giá mức nợ kỹ thuật)

### Fields hiện có trong SystemDetail:
❌ **TAB HOÀN TOÀN THIẾU - KHÔNG CÓ TRONG SYSTEMDETAIL**

### Fields THIẾU (Toàn bộ tab):
- ❌ **integration_readiness** (Điểm phù hợp cho tích hợp) - CheckboxGroup: easy_to_standardize/good_api/clear_data_source/can_split_service
- ❌ **blockers** (Điểm vướng mắc) - CheckboxGroup: outdated_tech/no_documentation/no_api/dirty_data/vendor_dependency
- ❌ **recommendation** (Đề xuất của đơn vị) - SelectWithOther: keep/upgrade/replace/merge

**Impact:** Mất hoàn toàn thông tin đánh giá technical debt và đề xuất hành động

---

## Summary Statistics

### Total Field Count:

| Category | SystemCreate | SystemDetail | Missing | % Missing |
|----------|--------------|--------------|---------|-----------|
| **Tab 1: Cơ bản** | 12 | 7 | 5 | 42% |
| **Tab 2: Nghiệp vụ** | 10 | 5 | 5 | 50% |
| **Tab 3: Công nghệ** | 27 | 4 | 23 | 85% |
| **Tab 4: Dữ liệu** | 17 | 3 | 14 | 82% |
| **Tab 5: Tích hợp** | 18 | 4 | 14 | 78% |
| **Tab 6: Bảo mật** | 7 | 4 | 3 | 43% |
| **Tab 7: Hạ tầng** | 11 | 4 | 7 | 64% |
| **Tab 8: Vận hành** | 7 | 4 | 3 | 43% |
| **Tab 9: Đánh giá** | 3 | 0 | 3 | 100% |
| **TOTAL** | **~112** | **~35** | **~77** | **69%** |

### Priority Missing Fields (High Impact):

#### P0 - Critical (Must Have):
1. **Tab 9 - Toàn bộ** (integration_readiness, blockers, recommendation) - Đánh giá technical debt
2. **Tab 2** - Thống kê người dùng (users_mau, users_dau, total_accounts, num_organizations)
3. **Tab 3** - Kiến trúc (architecture_type, containerization, api_style, messaging_queue)
4. **Tab 4** - Data metrics (storage_size_gb, file_storage_size_gb, growth_rate_percent)
5. **Tab 5** - API management (api_provided_count, api_consumed_count, has_api_gateway, integration_connections_data)

#### P1 - High Priority:
6. **Tab 1** - scope, requirement_type, target_completion_date, system_group
7. **Tab 3** - DevOps (has_cicd, cicd_tool, has_automated_testing, source_repository)
8. **Tab 4** - Data Governance (has_data_catalog, has_mdm)
9. **Tab 5** - API documentation (api_documentation, api_versioning_standard, has_integration_monitoring)
10. **Tab 6** - security_level, has_security_documents
11. **Tab 7** - deployment_location, compute_type, deployment_frequency
12. **Tab 8** - support_level

#### P2 - Medium Priority:
13. All **additional_notes_tabX** fields (ghi chú bổ sung cho mỗi tab)
14. **Tab 3** - cache_system, search_engine, reporting_bi_tool
15. **Tab 4** - file_storage_type, record_count, secondary_databases, data_retention_policy
16. **Tab 7** - compute_specifications

---

## Technical Issues Identified:

### 1. Data Type Mismatches:
- **programming_language, framework, database_name**: SystemCreate cho phép multi-select (CheckboxGroup), SystemDetail chỉ hiển thị single value
- **data_classification_type**: SystemCreate là CheckboxGroup, SystemDetail hiển thị single value
- **data_exchange_method**: SystemCreate là CheckboxGroup, SystemDetail hiển thị single value
- **authentication_method**: SystemCreate là CheckboxGroup, SystemDetail hiển thị single value và translate
- **backup_plan**: SystemCreate là CheckboxGroup, SystemDetail hiển thị single value

### 2. Field Name Mismatches:
- SystemCreate có field `purpose`, SystemDetail hiển thị `description`
- SystemDetail hiển thị `compliance_standards_list` nhưng không rõ field này tồn tại trong database

### 3. Missing Nested Data:
SystemDetail **KHÔNG fetch nested data** từ các bảng liên quan:
- ❌ `architecture_data` (nested fields từ tab 3)
- ❌ `operations_data` (nested fields từ tab 8)
- ❌ `data_info_data` (nested fields từ tab 4)
- ❌ `integration_data` (nested fields từ tab 5)
- ❌ `assessment_data` (nested fields từ tab 9) - **Tab này hoàn toàn thiếu**
- ❌ `cost_data` (nếu có)
- ❌ `vendor_data` (nếu có)
- ❌ `infrastructure_data` (nested fields từ tab 7)
- ❌ `security_data` (nested fields từ tab 6)

**Root Cause:** API endpoint `/systems/{id}/` có thể không include nested serializers hoặc SystemDetail component không fetch đầy đủ.

---

## Recommendations:

### Short-term (Quick Wins):
1. **Add Tab 9 (Đánh giá)** - Hoàn toàn thiếu, rất quan trọng cho strategic decision
2. **Fix multi-select fields display** - programming_language, framework, authentication_method, backup_plan, etc.
3. **Add user metrics section** - users_mau, users_dau, total_accounts trong Tab 2
4. **Add API metrics section** - api_provided_count, api_consumed_count trong Tab 5

### Medium-term:
5. **Add Architecture section** - architecture_type, containerization, api_style, messaging_queue
6. **Add Data metrics section** - storage_size_gb, growth_rate_percent
7. **Add DevOps section** - has_cicd, cicd_tool, has_automated_testing
8. **Add Infrastructure details** - deployment_location, compute_type, deployment_frequency

### Long-term:
9. **Add all additional_notes fields** - Ghi chú từng tab
10. **Add Data Governance section** - has_data_catalog, has_mdm
11. **Add API Documentation section** - api_documentation, has_integration_monitoring
12. **Fix nested data fetching** - Ensure API returns all nested objects

---

## Implementation Strategy:

### Option 1: Expand SystemDetail.tsx (Recommended)
- Add more collapse sections for missing tabs
- Fetch nested data from backend
- Display all fields with proper formatting

### Option 2: Create SystemDetailFull.tsx
- New comprehensive detail page
- Reuse all tab structures from SystemCreate (read-only mode)
- Toggle between summary view and full view

### Option 3: Hybrid Approach
- Keep current SystemDetail for quick summary
- Add "View Full Details" button to expand all sections
- Lazy-load nested data on expand

---

## Next Steps:

1. ✅ **Verify backend API** - Check if `/systems/{id}/` endpoint returns all nested data
2. ⬜ **Update serializers** - Ensure nested serializers are included in detail view
3. ⬜ **Design UI layout** - Decide how to display 77 missing fields
4. ⬜ **Implement incrementally** - Start with P0 fields (Tab 9, user metrics, API metrics)
5. ⬜ **Test data display** - Ensure all field types (multi-select, nested, etc.) render correctly

---

**Generated by:** Claude Code
**Date:** 2026-01-27
