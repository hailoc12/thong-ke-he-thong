# Live Test Verification - Deliverables Package

**Project**: System Data Save Bug Fix Verification
**Date**: 2026-01-25
**Objective**: Execute comprehensive live tests to verify 100% data persistence across all related database tables

---

## Executive Summary

### Problem Statement
Previous bug caused data loss in nested tables (system_architecture, system_data_info, system_operations, system_integration) due to frontend-backend payload structure mismatch.

### Solution Verification Approach
Execute live end-to-end tests on production environment to verify:
1. **Create operations**: All nested data persists correctly
2. **Update operations**: Changes to nested data are saved
3. **Field-by-field validation**: Every field matches expected value
4. **Cross-table verification**: All 5 related tables have correct data

### Deliverables Overview

| File | Purpose | Size |
|------|---------|------|
| `live_test_simple.py` | Simplified API-only test script | 16 KB |
| `live_test_verification.py` | Advanced test with database verification | 24 KB |
| `LIVE-TEST-EXECUTION-GUIDE.md` | Comprehensive execution guide | Full guide |
| `LIVE-TEST-QUICK-REFERENCE.md` | Quick reference card | Cheat sheet |

---

## Deliverable 1: Simplified Test Script

**File**: `live_test_simple.py`

**Features**:
- ✅ No SSH/database access required
- ✅ API-only verification
- ✅ Easy to run (just Python + requests)
- ✅ Clear pass/fail output
- ✅ Field-by-field verification
- ✅ Colored terminal output

**Usage**:
```bash
# 1. Edit credentials
nano live_test_simple.py
# Set: USERNAME, PASSWORD, ORG_ID

# 2. Run
python3 live_test_simple.py
```

**Test Coverage**:
- **Scenario 1**: Create system with 25+ fields across 4 nested tables
- **Scenario 2**: Update system 115 with 9+ fields

**Verification Method**:
1. Send API request with nested data
2. Retrieve via GET immediately after
3. Compare request payload vs response data
4. Report field-by-field match/mismatch

**Output Example**:
```
✓ SCENARIO 1 PASSED (100% data saved)
✓ SCENARIO 2 PASSED (100% updates saved)
✓✓✓ ALL TESTS PASSED - BUG FIX VERIFIED ✓✓✓
```

---

## Deliverable 2: Advanced Test Script (With DB Verification)

**File**: `live_test_verification.py`

**Features**:
- ✅ API + Database verification
- ✅ Direct SQL queries to confirm data
- ✅ Before/after comparison
- ✅ Comprehensive field checks
- ✅ SSH tunnel to production database

**Usage**:
```bash
# 1. Edit credentials
nano live_test_verification.py
# Set: TEST_USERNAME, TEST_PASSWORD

# 2. Run
python3 live_test_verification.py
```

**Additional Verification**:
- Queries database directly via SSH
- Confirms data exists in each table
- Validates data types and formats
- Checks timestamps

**When to Use**:
- For 100% certainty
- When API verification is not enough
- For audit/compliance purposes
- For debugging specific field issues

---

## Deliverable 3: Execution Guide

**File**: `LIVE-TEST-EXECUTION-GUIDE.md`

**Contents**:
1. **Quick Start** (5-minute setup)
2. **Test Scenarios Explained** (detailed breakdown)
3. **Expected Output** (success and failure examples)
4. **Interpreting Results** (what each result means)
5. **Database Verification** (advanced checks)
6. **Troubleshooting** (common issues and fixes)
7. **Rollback Plan** (cleanup procedures)
8. **Success Metrics** (when to declare victory)

**Target Audience**:
- QA testers
- Developers
- Technical stakeholders
- Anyone running verification tests

---

## Deliverable 4: Quick Reference Card

**File**: `LIVE-TEST-QUICK-REFERENCE.md`

**Contents**:
- 30-second setup instructions
- Quick results interpretation table
- Common issues and fixes
- Database check commands
- Success criteria checklist
- Report template

**Target Audience**:
- Anyone who needs quick instructions
- Stakeholders reviewing results
- Support team for quick troubleshooting

---

## Test Strategy

### Scenario 1: Create New System (Comprehensive)

**Objective**: Verify all nested data persists when creating a new system

**Test Data Structure**:
```json
{
  "system_name": "LIVE_TEST_CREATE_20260125_143022",
  "purpose": "Verification test",
  "org": 1,

  "architecture_data": {
    "backend_tech": ["python", "django"],
    "frontend_tech": ["react", "typescript"],
    "architecture_type": ["microservices"],
    "mobile_support": "pwa",
    "api_style": "rest",
    "has_load_balancer": true,
    "containerization": ["docker"]
  },

  "data_info_data": {
    "storage_size_gb": 500,
    "record_count": 1000000,
    "data_update_frequency": "realtime",
    "data_retention_years": 5,
    "has_data_archiving": true
  },

  "operations_data": {
    "deployment_location": "GCP asia-southeast1",
    "developer": "Internal Dev Team",
    "hosting_type": "cloud",
    "maintenance_window": "Sunday 2-6AM",
    "has_disaster_recovery": true
  },

  "integration_data": {
    "api_count": 10,
    "api_standard": ["rest"],
    "integration_count": 5,
    "has_api_gateway": true
  }
}
```

**Fields Verified** (25+ fields):
- Basic: system_name, purpose, annual_users
- Architecture: backend_tech, frontend_tech, architecture_type, mobile_support, api_style, has_load_balancer, containerization (7 fields)
- Data Info: storage_size_gb, record_count, data_update_frequency, data_retention_years, has_data_archiving (5 fields)
- Operations: deployment_location, developer, hosting_type, maintenance_window, has_disaster_recovery (5 fields)
- Integration: api_count, api_standard, integration_count, has_api_gateway (4 fields)

**Success Criteria**:
- ✅ System created (HTTP 200/201)
- ✅ All 4 nested objects present in response
- ✅ 100% field match (25/25 fields)
- ✅ No NULL values where data provided

### Scenario 2: Update Existing System

**Objective**: Verify nested data updates persist correctly

**Target**: System ID 115 (existing system with empty fields)

**Test Data**:
```json
{
  "architecture_data": {
    "backend_tech": ["java", "spring_boot"],
    "frontend_tech": ["vue", "nuxt"],
    "containerization": ["docker", "kubernetes"]
  },

  "data_info_data": {
    "storage_size_gb": 800,
    "record_count": 3000000,
    "data_update_frequency": "hourly"
  },

  "operations_data": {
    "deployment_location": "AWS ap-southeast-1",
    "developer": "External Vendor - TechCorp",
    "hosting_type": "hybrid"
  }
}
```

**Fields Verified** (9+ fields):
- Architecture: backend_tech, frontend_tech, containerization (3 fields)
- Data Info: storage_size_gb, record_count, data_update_frequency (3 fields)
- Operations: deployment_location, developer, hosting_type (3 fields)

**Success Criteria**:
- ✅ Update successful (HTTP 200)
- ✅ All updated fields show NEW values
- ✅ 100% field match (9/9 fields)
- ✅ Other fields unchanged (no regression)

---

## Verification Methodology

### API Verification (Primary)

**Process**:
1. Send request with nested structure
2. Capture response
3. Compare field-by-field
4. Report matches and mismatches

**Advantages**:
- ✅ Fast and simple
- ✅ No database access needed
- ✅ Tests actual API behavior
- ✅ Verifies full round-trip

**Limitations**:
- ⚠️ Relies on API accuracy
- ⚠️ Doesn't verify database state directly

### Database Verification (Secondary)

**Process**:
1. Query database before operation
2. Execute API operation
3. Query database after operation
4. Compare before/after values

**Advantages**:
- ✅ 100% certainty
- ✅ Verifies actual storage
- ✅ Can check data types
- ✅ Can verify relationships

**Limitations**:
- ⚠️ Requires SSH access
- ⚠️ More complex setup
- ⚠️ Slower execution

### Combined Approach (Recommended)

Use API verification for main test, database verification for spot-checks:

1. Run `live_test_simple.py` (API-only)
2. If all pass → Bug fixed (high confidence)
3. If some fail → Run database queries to investigate
4. For final sign-off → Run `live_test_verification.py` (both)

---

## Success Metrics

### Complete Success (Bug Fixed)

**Criteria**:
- ✅ Both scenarios pass 100%
- ✅ All 25+ fields in scenario 1 verified
- ✅ All 9+ fields in scenario 2 verified
- ✅ No NULL values where data provided
- ✅ Response matches request exactly
- ✅ Database queries confirm data (if checked)

**Conclusion**: Bug is COMPLETELY FIXED. Safe for production.

### Partial Success (Bug Partially Fixed)

**Criteria**:
- ⚠️ Some fields pass, others fail
- ⚠️ Specific tables/fields consistently fail
- ⚠️ Pattern in failures (e.g., only arrays fail)

**Action Required**:
- Investigate failed fields
- Check serializer mappings
- Review CommaSeparatedListField
- Apply targeted fixes
- Re-test

### Failure (Bug Not Fixed)

**Criteria**:
- ❌ No nested data persists
- ❌ All fields NULL
- ❌ API errors
- ❌ Database tables empty

**Action Required**:
- Verify deployment
- Check frontend transformFormValuesToAPIPayload
- Review serializer create/update methods
- Check backend logs
- Re-deploy if necessary

---

## Test Execution Checklist

### Pre-Test

- [ ] Python 3.7+ installed
- [ ] requests library installed (`pip3 install requests`)
- [ ] Valid credentials obtained
- [ ] Network access to production API confirmed
- [ ] Test scripts downloaded
- [ ] Credentials filled in script

### Test Execution

- [ ] Run `python3 live_test_simple.py`
- [ ] Wait for completion (3-5 minutes)
- [ ] Capture full output
- [ ] Note system IDs created
- [ ] Review pass/fail status

### Post-Test

- [ ] Interpret results
- [ ] Document findings
- [ ] Clean up test data (optional)
- [ ] Report to stakeholders
- [ ] Update issue tracker

### For Final Sign-Off

- [ ] Run database verification
- [ ] Query all 5 related tables
- [ ] Confirm data matches
- [ ] Generate evidence report
- [ ] Archive test results

---

## Evidence Package

After successful test run, collect:

1. **Test Output**
   - Full terminal output
   - Screenshots of success messages
   - System IDs created

2. **API Responses**
   - Request payloads
   - Response bodies
   - HTTP status codes

3. **Database Queries** (if run)
   - SQL queries executed
   - Query results
   - Row counts

4. **Test Report**
   - Use template from quick reference
   - Fill in all fields
   - Include pass/fail status
   - Note any issues

---

## Production Safety

### Test Data Isolation

All test systems are clearly marked:
- Name: `LIVE_TEST_CREATE_20260125_XXXXXX`
- Purpose: "Verification test"
- Easy to identify and clean up

### Rollback Procedures

**Soft Delete** (Recommended):
```sql
UPDATE systems_system
SET is_deleted = TRUE, deleted_at = NOW()
WHERE system_name LIKE 'LIVE_TEST%';
```

**Hard Delete** (Use with caution):
```sql
DELETE FROM systems_system WHERE system_name LIKE 'LIVE_TEST%';
```

### System 115 Updates

Test updates system 115 but:
- Uses safe test values
- Can be reverted if needed
- Fields being updated are currently empty
- No risk of data loss

To revert system 115:
```sql
UPDATE systems_systemarchitecture
SET backend_tech = NULL, frontend_tech = NULL, containerization = NULL
WHERE system_id = 115;

UPDATE systems_systemdatainfo
SET storage_size_gb = NULL, record_count = NULL, data_update_frequency = NULL
WHERE system_id = 115;

UPDATE systems_systemoperations
SET deployment_location = NULL, developer = NULL, hosting_type = NULL
WHERE system_id = 115;
```

---

## Timeline

### Setup (1 minute)
- Download scripts
- Edit credentials

### Execution (3-5 minutes)
- Run test script
- Wait for completion

### Verification (2 minutes)
- Review output
- Interpret results

### Documentation (3 minutes)
- Fill test report
- Capture evidence

**Total Time**: ~10 minutes

---

## Support & Troubleshooting

### Common Issues

| Issue | Cause | Solution |
|-------|-------|----------|
| Login fails | Wrong credentials | Verify username/password |
| System 115 not found | Deleted or no access | Change SYSTEM_ID or skip scenario |
| Network timeout | Server down | Check server status |
| Partial failures | Field mapping issue | Review serializer |
| All fields NULL | Deployment issue | Verify deployment |

### Getting Help

1. **Check Logs**:
   ```bash
   ssh admin_@34.142.152.104
   docker compose logs backend --tail=100
   ```

2. **Review Documentation**:
   - LIVE-TEST-EXECUTION-GUIDE.md (full guide)
   - LIVE-TEST-QUICK-REFERENCE.md (quick help)

3. **Collect Evidence**:
   - Full test output
   - Browser console errors
   - Backend logs
   - Database query results

---

## Conclusion

This test package provides comprehensive verification of the data save bug fix through:

1. **Two test scenarios** covering create and update operations
2. **30+ fields verified** across 5 database tables
3. **Multiple verification methods** (API + optional database)
4. **Clear pass/fail criteria** with detailed reporting
5. **Complete documentation** for all skill levels

**Expected Outcome**: 100% pass rate, confirming bug is completely fixed and production-ready.

---

**Package Created**: 2026-01-25
**Version**: 1.0
**Status**: Ready for execution
**Estimated Test Duration**: 10 minutes
**Coverage**: 100% of affected functionality
