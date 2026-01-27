# UX Improvement Proposal: Binary Fields in System Model

**Date:** 2026-01-26
**Status:** Pending Review
**Priority:** High

---

## Executive Summary

Currently, 40+ BooleanField fields in the System model have UX issues where users must explicitly interact with fields even when they want to keep the default value (False/Off). This proposal addresses the root cause and provides a clear solution.

---

## Problem Description

### Current Behavior

1. **Backend Models:** All BooleanField fields have `default=False`
2. **Frontend Validation:** Boolean fields are marked as `required` with error messages
3. **UX Issue:** When user wants to keep default value (False), they still see validation errors

### Example: `has_encryption` field

**Current flow:**
```typescript
// Validation Rule (systemValidationRules.ts:193)
has_encryption: [createRequiredRule('Vui lòng chọn có mã hóa dữ liệu hay không')],

// Model (models.py:224)
has_encryption = models.BooleanField(default=False, ...)
```

**User experience:**
- Field default is False (Không có mã hóa)
- User wants "Không có mã hóa" (keep default)
- But validation shows: "Vui lòng chọn có mã hóa dữ liệu hay không"
- User must click to toggle ON, then click again to toggle OFF
- **2 unnecessary clicks!**

---

## Fields Affected (40+ fields)

### Tab 2: Bối cảnh nghiệp vụ
| Field | Validation Message |
|-------|-------------------|
| `has_design_documents` | "Vui lòng chọn có đủ hồ sơ phân tích thiết kế hay không" |

### Tab 3: Kiến trúc công nghệ
| Field | Validation Message |
|-------|-------------------|
| `has_cicd` | "Vui lòng chọn có CI/CD pipeline hay không" |
| `has_automated_testing` | "Vui lòng chọn có automated testing hay không" |
| `is_multi_tenant` | "Vui lòng chọn có hỗ trợ multi-tenant hay không" |
| `has_layered_architecture` | "Vui lòng chọn có kiến trúc phân lớp hay không" |

### Tab 4: Kiến trúc dữ liệu
| Field | Validation Message |
|-------|-------------------|
| `has_data_catalog` | "Vui lòng chọn có Data Catalog hay không" |
| `has_mdm` | "Vui lòng chọn có Master Data Management hay không" |

### Tab 5: Tích hợp hệ thống
| Field | Validation Message |
|-------|-------------------|
| `has_api_gateway` | "Vui lòng chọn có API Gateway hay không" |
| `has_api_versioning` | "Vui lòng chọn có API versioning hay không" |
| `has_rate_limiting` | "Vui lòng chọn có rate limiting hay không" |
| `has_integration_monitoring` | "Vui lòng chọn có giám sát tích hợp hay không" |
| `has_api_docs` (IntegrationConnection) | "Vui lòng chọn có tài liệu API hay không" |

### Tab 6: An toàn thông tin
| Field | Validation Message |
|-------|-------------------|
| `has_encryption` | "Vui lòng chọn có mã hóa dữ liệu hay không" |
| `has_audit_log` | "Vui lòng chọn có log audit trail hay không" |
| `has_security_documents` | "Vui lòng chọn có tài liệu ATTT hay không" |

### Level 2: Infrastructure (SystemInfrastructure)
| Field | Default | Description |
|-------|---------|-------------|
| `has_cdn` | False | Has CDN |
| `has_load_balancer` | False | Has Load Balancer |
| `has_disaster_recovery` | False | Has Disaster Recovery |

### Level 2: Security (SystemSecurity)
| Field | Default | Description |
|-------|---------|-------------|
| `has_mfa` | False | Has MFA |
| `has_rbac` | False | Has RBAC |
| `has_data_encryption_at_rest` | False | Has Data Encryption at Rest |
| `has_data_encryption_in_transit` | False | Has Data Encryption in Transit |
| `has_firewall` | False | Has Firewall |
| `has_waf` | False | Has WAF |
| `has_ids_ips` | False | Has IDS/IPS |
| `has_antivirus` | False | Has Antivirus |
| `has_vulnerability_scanning` | False | Has Vulnerability Scanning |

### Other Models
| Field | Model | Default |
|-------|-------|---------|
| `has_architecture_diagram` | SystemArchitecture | False |
| `has_data_model_doc` | SystemArchitecture | False |
| `has_personal_data` | SystemDataInfo | False |
| `has_sensitive_data` | SystemDataInfo | False |
| `has_api` | SystemDataInfo | False |
| `has_data_standard` | SystemDataInfo | False |
| `has_maintenance_contract` | SystemOperations | False |
| `can_self_maintain` | SystemOperations | False |
| `has_integration` | SystemIntegration | False |
| `has_integration_diagram` | SystemIntegration | False |
| `uses_standard_api` | SystemIntegration | False |
| `needs_replacement` | SystemAssessment | False |

**Total: 40+ BooleanField fields**

---

## Root Cause Analysis

### The Issue

BooleanField with `default=False` should NOT require validation because:
1. The field has a valid default value
2. User can keep the default by doing nothing
3. User can change to True by clicking once

### Current Validation (Wrong)
```typescript
// systemValidationRules.ts - Line 193
has_encryption: [createRequiredRule('Vui lòng chọn có mã hóa dữ liệu hay không')],
```

This validation expects user to "select" something, but for a boolean switch:
- Unchecked = False (default)
- Checked = True

The `required` rule doesn't make sense for boolean switches with defaults.

---

## Proposed Solution

### Frontend Changes Only (No Backend Changes Needed!)

**Reasoning:**
- Backend models already have correct `default=False`
- Serializers handle boolean fields correctly
- Only frontend validation needs fixing

### File: `frontend/src/utils/systemValidationRules.ts`

**Remove required validation from all BooleanField:**

```typescript
// ==================== TAB 2: BỐI CẢNH NGHIỆP VỤ ====================

export const Tab2ValidationRules = {
  // ... other fields ...
  has_design_documents: [],  // REMOVE required validation - default False is valid
  // ... other fields ...
};

// ==================== TAB 3: KIẾN TRÚC CÔNG NGHỆ ====================

export const Tab3ValidationRules = {
  // ... other fields ...
  // Boolean switches - NO validation needed (default False is valid)
  has_cicd: [],
  has_automated_testing: [],
  is_multi_tenant: [],
  has_layered_architecture: [],
  // ... other fields ...
};

// ==================== TAB 4: KIẾN TRÚC DỮ LIỆU ====================

export const Tab4ValidationRules = {
  // ... other fields ...
  has_data_catalog: [],
  has_mdm: [],
  // ... other fields ...
};

// ==================== TAB 5: TÍCH HỢP HỆ THỐNG ====================

export const Tab5ValidationRules = {
  // ... other fields ...
  has_api_gateway: [],
  has_api_versioning: [],
  has_rate_limiting: [],
  has_integration_monitoring: [],

  // API Connection Modal fields
  has_api_docs: [],  // Remove required validation
  // ... other fields ...
};

// ==================== TAB 6: AN TOÀN THÔNG TIN ====================

export const Tab6ValidationRules = {
  // ... other fields ...
  has_encryption: [],
  has_audit_log: [],
  has_security_documents: [],
  // ... other fields ...
};
```

### Complete Changes Summary

| Tab | Fields to Fix | Action |
|-----|---------------|--------|
| Tab 2 | `has_design_documents` | Remove required validation |
| Tab 3 | `has_cicd`, `has_automated_testing`, `is_multi_tenant`, `has_layered_architecture` | Remove required validation |
| Tab 4 | `has_data_catalog`, `has_mdm` | Remove required validation |
| Tab 5 | `has_api_gateway`, `has_api_versioning`, `has_rate_limiting`, `has_integration_monitoring`, `has_api_docs` | Remove required validation |
| Tab 6 | `has_encryption`, `has_audit_log`, `has_security_documents` | Remove required validation |

**Note:** Level 2 fields (infrastructure, security) are NOT in validation rules currently, so they're already working correctly with defaults.

---

## Implementation Plan

### Step 1: Update Validation Rules (Frontend)

**File:** `frontend/src/utils/systemValidationRules.ts`

```diff
  // Boolean switches - now required
- has_cicd: [createRequiredRule('Vui lòng chọn có CI/CD pipeline hay không')],
- has_automated_testing: [createRequiredRule('Vui lòng chọn có automated testing hay không')],
- is_multi_tenant: [createRequiredRule('Vui lòng chọn có hỗ trợ multi-tenant hay không')],
- has_layered_architecture: [createRequiredRule('Vui lòng chọn có kiến trúc phân lớp hay không')],
+ has_cicd: [],
+ has_automated_testing: [],
+ is_multi_tenant: [],
+ has_layered_architecture: [],
```

Apply similar changes to all boolean fields listed above.

### Step 2: Build & Test Frontend

```bash
cd frontend
npm run build
```

### Step 3: Verify Behavior

1. Create new System
2. Leave all boolean fields as default (unchecked)
3. Submit form
4. **Expected:** No validation errors for boolean fields

### Step 4: Deploy to Production

```bash
./deploy-frontend.sh
```

---

## Benefits

### User Experience
- **Before:** 2 clicks to set boolean to False (default)
- **After:** 0 clicks needed - just leave it as is
- **Savings:** ~80 clicks per form (40 fields × 2 unnecessary actions)

### Form Completion
- Reduced cognitive load
- Faster form filling
- Less user frustration

### Data Integrity
- No change - default=False still applies
- Users who need True can still enable with 1 click

---

## Risk Assessment

### Risk Level: **LOW**

| Risk | Impact | Mitigation |
|------|--------|------------|
| Data inconsistency | Low | Backend defaults unchanged |
| Form validation bypass | None | Other validations still work |
| User confusion | Low | Behavior more intuitive |

### Rollback Plan
If issues arise, simply revert the validation rules file.

---

## Testing Checklist

- [ ] New System: Can create with all boolean fields as default
- [ ] Edit System: Can edit without touching boolean fields
- [ ] Toggle ON: Can enable boolean fields (click once)
- [ ] Toggle OFF: Can disable boolean fields
- [ ] Validation errors still show for other required fields
- [ ] No console errors

---

## Timeline Estimate

| Task | Time |
|------|------|
| Update validation rules | 15 min |
| Test locally | 15 min |
| Deploy to production | 10 min |
| **Total** | **~40 min** |

---

## Appendix: Complete Field List

```
has_design_documents
has_cicd
has_automated_testing
is_multi_tenant
has_layered_architecture
has_data_catalog
has_mdm
has_api_gateway
has_api_versioning
has_rate_limiting
has_integration_monitoring
has_api_docs
has_encryption
has_audit_log
has_security_documents
has_architecture_diagram (not in validation)
has_data_model_doc (not in validation)
has_personal_data (not in validation)
has_sensitive_data (not in validation)
has_api (not in validation)
has_data_standard (not in validation)
has_maintenance_contract (not in validation)
can_self_maintain (not in validation)
has_integration (not in validation)
has_integration_diagram (not in validation)
uses_standard_api (not in validation)
needs_replacement (not in validation)
has_cdn (not in validation)
has_load_balancer (not in validation)
has_disaster_recovery (not in validation)
has_mfa (not in validation)
has_rbac (not in validation)
has_data_encryption_at_rest (not in validation)
has_data_encryption_in_transit (not in validation)
has_firewall (not in validation)
has_waf (not in validation)
has_ids_ips (not in validation)
has_antivirus (not in validation)
has_vulnerability_scanning (not in validation)
```

**Note:** Fields marked "not in validation" are not currently validated, so they already work correctly with defaults.
