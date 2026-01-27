# System 115 Missing Data Report

**Generated:** 2026-01-25
**System:** Test (ID: 115, Code: SYS-cntt-2026-0050)
**Status:** operating
**Created:** 2026-01-25 11:13:53
**Last Updated:** 2026-01-25 11:16:17

## Summary

Đã tìm thấy system "Test" trong production database. Hầu hết các field trong related tables đều RỖNG, chỉ có một số field cơ bản trong main `systems` table được lưu.

## Main Systems Table (✅ Has Data)

| Field | Value |
|-------|-------|
| id | 115 |
| system_code | SYS-cntt-2026-0050 |
| system_name | Test |
| programming_language | Python |
| framework | Angular |
| database_name | MySQL |

## Related Tables - Missing Data

### 1. system_architecture (❌ Most Fields Empty)

**Fields with data:**
- mobile_app: none
- has_architecture_diagram: false
- has_data_model_doc: false
- has_layered_architecture: false
- has_cicd: false
- has_automated_testing: false
- is_multi_tenant: false

**Missing/Empty fields:**
- architecture_type
- architecture_description
- backend_tech
- frontend_tech
- database_type
- database_model
- hosting_type
- cloud_provider
- api_style
- messaging_queue
- cache_system
- search_engine
- reporting_bi_tool
- source_repository
- layered_architecture_details
- containerization
- cicd_tool
- automated_testing_tools

### 2. system_data_info (❌ All Critical Fields Empty)

**Missing/Empty fields:**
- storage_size_gb
- growth_rate_percent
- api_endpoints_count
- shared_with_systems
- file_storage_size_gb
- secondary_databases
- file_storage_type
- record_count
- data_types (empty array)

**Only defaults:**
- has_api: false
- has_data_standard: false
- has_personal_data: false
- has_sensitive_data: false

### 3. system_operations (❌ All Fields Empty)

**Missing/Empty fields:**
- dev_type
- developer
- dev_team_size
- warranty_status
- warranty_end_date
- maintenance_end_date
- operator
- ops_team_size
- vendor_dependency
- support_level
- avg_incident_response_hours
- deployment_location
- compute_type
- compute_specifications
- deployment_frequency

**Only defaults:**
- has_maintenance_contract: false
- can_self_maintain: false

### 4. system_integration (❌ Most Fields Empty)

**Missing/Empty fields:**
- integration_count: 0
- integration_types: empty array
- connected_internal_systems
- connected_external_systems
- integration_description
- api_standard
- api_consumed_count
- api_gateway_name
- api_provided_count
- api_documentation
- api_versioning_standard

**Only defaults:**
- has_integration: false
- has_integration_diagram: false
- uses_standard_api: false
- has_api_gateway: false
- has_api_versioning: false
- has_rate_limiting: false
- has_integration_monitoring: false

### 5. system_assessment (❌ All Fields Empty)

**Missing/Empty fields:**
- performance_rating
- uptime_percent
- avg_response_time_ms
- user_satisfaction_rating
- technical_debt_level
- replacement_plan
- major_issues
- improvement_suggestions
- future_plans
- modernization_priority
- integration_readiness: empty array
- blockers: empty array
- recommendation
- recommendation_other

**Only defaults:**
- needs_replacement: false

## Diagnosis

Đây chính xác là bug đã được fix trong `SystemCreate.tsx` và `SystemEdit.tsx`. Data transformation function `transformFormValuesToAPIPayload()` đã được thêm vào để reorganize flat form values thành nested structure.

**Root cause:** Frontend gửi flat object, backend expect nested object → data bị silently ignored.

## Recovery Options

### Option 1: Manual Re-entry (Recommended)
User nhập lại data cho system này với code đã được fix.

### Option 2: Contact User for Original Data
Hỏi người nhập liệu còn nhớ data gì đã điền không.

### Option 3: Delete & Recreate
Xóa system 115 và tạo mới với full data.

## Production Database Info

**Database Name:** system_reports (NOT hientrang as documented)
**Server:** 34.142.152.104
**User:** admin_
**Project Path:** /home/admin_/thong_ke_he_thong

## Next Steps

1. ✅ Identify missing data (DONE - this report)
2. ⏭️ Install logging middleware to prevent future data loss
3. ⏭️ Contact user to recover original input data
4. ⏭️ Restore data or delete/recreate system

## Notes

- Bug đã được fix trong frontend code
- Logging middleware sẽ được cài đặt để capture future requests
- Database name documented as "hientrang" is INCORRECT - actual name is "system_reports"
