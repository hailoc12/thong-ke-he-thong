# Excel Export Field Analysis

**Date:** 2026-01-29 (Updated)
**Purpose:** Document Excel export columns aligned with frontend SystemCreate form

## Summary

**Export now only includes fields that exist in the frontend SystemCreate form.**

| Section | Previous Cols | Current Cols | Removed |
|---------|---------------|--------------|---------|
| Cơ bản | 16 | 16 | 0 |
| Nghiệp vụ | 8 | 8 | 0 |
| Công nghệ | 21 | 21 | 0 |
| Dữ liệu | 18 | 18 | 0 |
| Tích hợp | 13 | 13 | 0 |
| Bảo mật | 18 | 5 | 13 |
| Hạ tầng | 19 | 8 | 11 |
| Vận hành | 17 | 5 | 12 |
| Đánh giá | 14 | 3 | 11 |
| Chi phí | 9 | 0 | 9 (entire section) |
| Nhà cung cấp | 13 | 0 | 13 (entire section) |
| Metadata | 2 | 2 | 0 |
| **TOTAL** | **168** | **99** | **69** |

## Fields Removed (2026-01-29)

### Tab 6 - Bảo mật (13 fields removed)
Fields not in frontend form:
- has_mfa
- has_rbac
- has_data_encryption_at_rest
- has_data_encryption_in_transit
- compliance_standards
- has_firewall
- has_waf
- has_ids_ips
- has_antivirus
- last_security_audit_date
- last_penetration_test_date
- has_vulnerability_scanning
- security_incidents_last_year
- security_notes

**Kept (5 fields):** authentication_method, has_encryption, has_audit_log, security_level, has_security_documents

### Tab 7 - Hạ tầng (11 fields removed)
Fields not in frontend form:
- hosting_platform (duplicated in Công nghệ)
- num_servers
- total_cpu_cores
- total_ram_gb
- total_storage_tb
- bandwidth_mbps
- has_cdn
- has_load_balancer
- backup_frequency
- backup_retention_days
- has_disaster_recovery
- rto_hours
- rpo_hours

**Kept (8 fields):** server_configuration, storage_capacity, backup_plan, disaster_recovery_plan, deployment_location, compute_specifications, compute_type, deployment_frequency

### Tab 8 - Vận hành (12 fields removed)
Fields not in frontend form:
- responsible_person
- dev_type
- developer
- dev_team_size
- operator
- ops_team_size
- warranty_status
- warranty_end_date
- has_maintenance_contract
- maintenance_end_date
- vendor_dependency
- can_self_maintain

**Kept (5 fields):** business_owner, technical_owner, responsible_phone, responsible_email, support_level

### Tab 9 - Đánh giá (11 fields removed)
Fields not in frontend form:
- performance_rating
- uptime_percent
- avg_response_time_ms
- user_satisfaction_rating
- technical_debt_level
- needs_replacement
- replacement_plan
- major_issues
- improvement_suggestions
- future_plans
- modernization_priority

**Kept (3 fields):** integration_readiness, blockers, recommendation

### Cost Section (9 fields removed - entire section)
No Cost tab in frontend form:
- initial_investment
- development_cost
- annual_license_cost
- annual_maintenance_cost
- annual_infrastructure_cost
- annual_personnel_cost
- total_cost_of_ownership
- cost_notes
- funding_source

### Vendor Section (13 fields removed - entire section)
No Vendor tab in frontend form:
- vendor_name
- vendor_type
- vendor_contact_person
- vendor_phone
- vendor_email
- contract_number
- contract_start_date
- contract_end_date
- contract_value
- vendor_performance_rating
- vendor_responsiveness_rating
- vendor_lock_in_risk
- alternative_vendors

## Frontend Form Field Mapping

### Tab 1 - Cơ bản (16 fields)
All fields in form, all exported.

### Tab 2 - Nghiệp vụ (8 fields)
All fields in form, all exported.

### Tab 3 - Công nghệ (21 fields)
All fields in form, all exported.

### Tab 4 - Dữ liệu (18 fields)
All fields in form, all exported.

### Tab 5 - Tích hợp (13 fields)
All fields in form, all exported.

### Tab 6 - Bảo mật (5 fields)
| Form Field | Export Column |
|------------|---------------|
| authentication_method | Phương thức xác thực |
| has_encryption | Có mã hóa |
| has_audit_log | Có Audit Log |
| security_level | Mức bảo mật |
| has_security_documents | Có tài liệu ATTT |

### Tab 7 - Hạ tầng (8 fields)
| Form Field | Export Column |
|------------|---------------|
| server_configuration | Cấu hình máy chủ |
| storage_capacity | Dung lượng lưu trữ |
| backup_plan | Phương án sao lưu |
| disaster_recovery_plan | Kế hoạch khôi phục thảm họa |
| deployment_location | Vị trí triển khai |
| compute_specifications | Cấu hình tính toán |
| compute_type | Loại hạ tầng tính toán |
| deployment_frequency | Tần suất triển khai |

### Tab 8 - Vận hành (5 fields)
| Form Field | Export Column |
|------------|---------------|
| business_owner | Người chịu trách nhiệm |
| technical_owner | Người quản trị kỹ thuật |
| responsible_phone | Số điện thoại liên hệ |
| responsible_email | Email liên hệ |
| support_level | Mức độ hỗ trợ |

### Tab 9 - Đánh giá (3 fields)
| Form Field | Export Column |
|------------|---------------|
| integration_readiness | Điểm phù hợp cho tích hợp |
| blockers | Điểm vướng mắc |
| recommendation | Đề xuất của đơn vị |

## Excel File Structure

- **Sheet "Full"**: All 99 columns in one sheet (Row 1: Tab names, Row 2: Headers, Row 3+: Data)
- **Sheet "1. Cơ bản"**: 16 columns
- **Sheet "2. Nghiệp vụ"**: 8 columns
- **Sheet "3. Công nghệ"**: 21 columns
- **Sheet "4. Dữ liệu"**: 18 columns
- **Sheet "5. Tích hợp"**: 13 columns
- **Sheet "6. Bảo mật"**: 5 columns (reduced from 18)
- **Sheet "7. Hạ tầng"**: 8 columns (reduced from 19)
- **Sheet "8. Vận hành"**: 5 columns (reduced from 17)
- **Sheet "9. Đánh giá"**: 3 columns (reduced from 14)
