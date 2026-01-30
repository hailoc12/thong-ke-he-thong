# Field Mapping Fix - System Form to API

## Problem
Frontend sends **flat structure** but backend expects **nested structure**.

Frontend:
```json
{
  "system_name": "Test",
  "cache_system": "redis",
  "storage_size_gb": 100
}
```

Backend expects:
```json
{
  "system_name": "Test",
  "architecture_data": {
    "cache_system": "redis"
  },
  "data_info_data": {
    "storage_size_gb": 100
  }
}
```

## Field Distribution by Model

### System (root level - no nesting)
- org, system_code, system_name, system_name_en, purpose, scope
- requirement_type, requirement_type_other, target_completion_date
- business_objectives, business_processes, has_design_documents
- user_types, annual_users
- programming_language, framework, database_name, hosting_platform
- data_sources, data_classification_type, data_volume
- integrated_internal_systems, integrated_external_systems, api_list
- data_exchange_method, api_provided_count, api_consumed_count
- authentication_method, has_encryption, has_audit_log, compliance_standards_list
- server_configuration, storage_capacity, backup_plan, disaster_recovery_plan
- system_group, status, go_live_date, current_version, upgrade_history
- business_owner, technical_owner, responsible_person, responsible_phone, responsible_email
- users_total, total_accounts, users_mau, users_dau, num_organizations
- criticality_level, security_level, has_security_documents
- form_level, is_draft
- has_data_catalog, data_catalog_notes, has_mdm, mdm_notes
- additional_notes_tab1, additional_notes_tab2, additional_notes_tab3, additional_notes_tab4
- additional_notes_tab5, additional_notes_tab6, additional_notes_tab7, additional_notes_tab8

### SystemArchitecture → architecture_data
- architecture_type, has_architecture_diagram, architecture_description
- backend_tech, frontend_tech, mobile_app
- database_type, database_model, has_data_model_doc
- hosting_type, cloud_provider
- has_layered_architecture, layered_architecture_details
- containerization, is_multi_tenant
- api_style, messaging_queue
- cache_system, search_engine, reporting_bi_tool
- source_repository, has_cicd, cicd_tool
- has_automated_testing, automated_testing_tools

### SystemDataInfo → data_info_data
- storage_size_gb, file_storage_size_gb, growth_rate_percent
- data_types, has_api, api_endpoints_count, shared_with_systems
- has_data_standard, has_personal_data, has_sensitive_data
- data_classification
- secondary_databases, file_storage_type, record_count
- data_retention_policy (if exists)

### SystemOperations → operations_data
- dev_type, developer, dev_team_size
- warranty_status, warranty_end_date, has_maintenance_contract, maintenance_end_date
- operator, ops_team_size, vendor_dependency, can_self_maintain
- support_level, avg_incident_response_hours
- deployment_location, compute_type, compute_specifications, deployment_frequency

### SystemIntegration → integration_data
- has_integration, integration_count, integration_types
- connected_internal_systems, connected_external_systems
- has_integration_diagram, integration_description
- uses_standard_api, api_standard
- has_api_gateway, api_gateway_name, has_api_versioning, has_rate_limiting
- api_provided_count (duplicate - also in System), api_consumed_count (duplicate)
- api_documentation, api_versioning_standard, has_integration_monitoring

### SystemAssessment → assessment_data
- recommendation, recommendation_other
- blockers, integration_readiness
- (other assessment fields if any)

### SystemIntegrationConnection → integration_connections_data (array)
- source_system, target_system, data_objects
- integration_method, frequency
- error_handling, has_api_docs, notes

## Solution
Create `transformFormValuesToAPIPayload()` function to reorganize flat values into nested structure.
