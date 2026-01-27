# Live Test Execution Guide - Data Save Bug Fix Verification

**Objective**: Execute comprehensive live tests on production to verify 100% data persistence across all related tables.

**Bug Fix**: Resolved frontend-backend data structure mismatch causing data loss in nested tables.

**Production Environment**:
- API: `https://hientrangcds.mst.gov.vn/api`
- Server: `34.142.152.104`
- Database: `system_reports`

---

## Quick Start (5 minutes)

### Prerequisites

1. **Python 3.7+** installed
2. **Valid credentials** (admin or org_user)
3. **requests library**: `pip3 install requests`

### Step 1: Setup Test Script

```bash
cd /Users/shimazu/Dropbox/9. active/consultant/support_b4t/thong_ke_he_thong
```

Edit `live_test_simple.py` and fill in your credentials:

```python
USERNAME = "your_username"  # Replace with your actual username
PASSWORD = "your_password"  # Replace with your actual password
ORG_ID = 1                  # Replace with your organization ID
```

### Step 2: Run Test

```bash
python3 live_test_simple.py
```

### Step 3: Review Results

The test will:
1. **Authenticate** with production API
2. **Create** a new system with data in all nested tables
3. **Verify** data persistence by retrieving and comparing
4. **Update** existing system ID 115
5. **Verify** updates were persisted
6. **Generate** comprehensive report with pass/fail status

---

## Test Scenarios Explained

### Scenario 1: Create New System (End-to-End)

**What it tests**:
- Creating system with comprehensive data across ALL tabs
- Data persistence in 4 nested tables:
  - `systems_systemarchitecture` (backend_tech, frontend_tech, etc.)
  - `systems_systemdatainfo` (storage_size_gb, record_count, etc.)
  - `systems_systemoperations` (deployment_location, developer, etc.)
  - `systems_systemintegration` (api_count, api_standard, etc.)

**Test Data**:
```json
{
  "system_name": "LIVE_TEST_CREATE_20260125_143022",
  "architecture_data": {
    "backend_tech": ["python", "django"],
    "frontend_tech": ["react", "typescript"],
    "containerization": ["docker"]
  },
  "data_info_data": {
    "storage_size_gb": 500,
    "record_count": 1000000
  },
  "operations_data": {
    "deployment_location": "GCP asia-southeast1",
    "developer": "Internal Dev Team"
  },
  "integration_data": {
    "api_count": 10,
    "integration_count": 5
  }
}
```

**Verification Process**:
1. POST `/api/systems/` with nested data
2. Capture response with system ID
3. GET `/api/systems/{id}/` immediately
4. Compare field-by-field:
   - Basic fields (system_name, purpose, etc.)
   - Nested architecture data
   - Nested data info
   - Nested operations data
   - Nested integration data

**Success Criteria**:
- ✅ System created (status 200/201)
- ✅ All nested objects present in response
- ✅ 100% field match between request and response
- ✅ No fields are NULL when they should have data

### Scenario 2: Update Existing System (ID 115)

**What it tests**:
- Updating existing system with new data
- Data persistence in nested tables after UPDATE
- Focus on fields that were previously empty

**Test Data**:
```json
{
  "architecture_data": {
    "backend_tech": ["java", "spring_boot"],
    "frontend_tech": ["vue", "nuxt"]
  },
  "data_info_data": {
    "storage_size_gb": 800,
    "record_count": 3000000
  },
  "operations_data": {
    "deployment_location": "AWS ap-southeast-1",
    "developer": "External Vendor - TechCorp"
  }
}
```

**Verification Process**:
1. GET `/api/systems/115/` (baseline)
2. PATCH `/api/systems/115/` with updates
3. GET `/api/systems/115/` (verify)
4. Compare before/after values

**Success Criteria**:
- ✅ Update successful (status 200)
- ✅ All updated fields show NEW values
- ✅ No regression (other fields unchanged)
- ✅ Timestamps updated correctly

---

## Expected Output

### Successful Test Run

```
======================================================================
LIVE TEST VERIFICATION - System Data Save Bug Fix
Simplified Version (API-only verification)
======================================================================

Production Environment:
  API: https://hientrangcds.mst.gov.vn/api
  Time: 2026-01-25 14:30:22

Authenticating...
Logging in as: test_user
✓ Login successful

======================================================================
SCENARIO 1: Create New System
======================================================================

Creating system with data in 4 nested tables...
  - system_name: LIVE_TEST_CREATE_20260125_143022
  - architecture_data: 7 fields
  - data_info_data: 5 fields
  - operations_data: 5 fields
  - integration_data: 4 fields
✓ System created: ID 118

Retrieving system to verify data...

Verifying data persistence:
  ✓ system_name
  ✓ purpose
  ✓ annual_users

Architecture data:
  ✓ architecture_data.backend_tech
  ✓ architecture_data.frontend_tech
  ✓ architecture_data.architecture_type
  ✓ architecture_data.mobile_support
  ✓ architecture_data.api_style
  ✓ architecture_data.has_load_balancer
  ✓ architecture_data.containerization

Data info:
  ✓ data_info_data.storage_size_gb
  ✓ data_info_data.record_count
  ✓ data_info_data.data_update_frequency
  ✓ data_info_data.data_retention_years
  ✓ data_info_data.has_data_archiving

Operations data:
  ✓ operations_data.deployment_location
  ✓ operations_data.developer
  ✓ operations_data.hosting_type
  ✓ operations_data.maintenance_window
  ✓ operations_data.has_disaster_recovery

Integration data:
  ✓ integration_data.api_count
  ✓ integration_data.api_standard
  ✓ integration_data.integration_count
  ✓ integration_data.has_api_gateway

SCENARIO 1 SUMMARY:
  Total fields verified: 25
  Passed: 25 (100.0%)
  Failed: 0
✓ SCENARIO 1 PASSED (100% data saved)

======================================================================
SCENARIO 2: Update Existing System (ID 115)
======================================================================

Getting baseline (before update)...
✓ Baseline retrieved

Current values:
  backend_tech: NULL
  frontend_tech: NULL
  storage_size_gb: NULL
  developer: NULL

Updating system...
✓ Update API call successful

Retrieving updated system...

Verifying updates:

Architecture updates:
  ✓ architecture_data.backend_tech
  ✓ architecture_data.frontend_tech
  ✓ architecture_data.containerization

Data info updates:
  ✓ data_info_data.storage_size_gb
  ✓ data_info_data.record_count
  ✓ data_info_data.data_update_frequency

Operations updates:
  ✓ operations_data.deployment_location
  ✓ operations_data.developer
  ✓ operations_data.hosting_type

SCENARIO 2 SUMMARY:
  Total fields verified: 9
  Passed: 9 (100.0%)
  Failed: 0
✓ SCENARIO 2 PASSED (100% updates saved)

======================================================================
FINAL TEST REPORT
======================================================================

Overall Results:
  Total Scenarios: 2
  Passed: 2
  Failed: 0
  Success Rate: 100.0%

  ✓ PASS SCENARIO 1
      System ID: 118

  ✓ PASS SCENARIO 2
      System ID: 115

✓✓✓ ALL TESTS PASSED - BUG FIX VERIFIED ✓✓✓
100% data persistence confirmed

Test completed: 2026-01-25 14:35:47
```

### Failed Test Example

If any field fails to save, you'll see:

```
Architecture data:
  ✗ architecture_data.backend_tech
      Expected: ['python', 'django']
      Actual:   None
  ✗ architecture_data.frontend_tech
      Expected: ['react', 'typescript']
      Actual:   None
```

---

## Interpreting Results

### 100% Pass (All Green ✓)

**Meaning**: Bug is COMPLETELY FIXED
- All data saved correctly to database
- Nested structure handled properly
- Frontend-backend communication working
- No data loss

**Action**: None. Bug fix verified successfully.

### Partial Pass (Some Red ✗)

**Meaning**: Bug PARTIALLY FIXED
- Some fields save, others don't
- Indicates specific field mapping issues

**Action**:
1. Note which fields failed
2. Check if issue is frontend or backend
3. Review serializer mappings for failed fields
4. Re-test after additional fixes

### Complete Fail (All Red ✗)

**Meaning**: Bug NOT FIXED
- No nested data persisting
- Likely deployment issue or regression

**Action**:
1. Verify deployment was successful
2. Check backend logs for errors
3. Review frontend transformFormValuesToAPIPayload
4. Check serializer update() methods

---

## Advanced: Database Verification

For 100% certainty, verify directly in database:

### SSH to Server

```bash
ssh admin_@34.142.152.104
cd /home/admin_/thong_ke_he_thong
```

### Check PostgreSQL

```bash
# Connect to database
docker compose exec postgres psql -U postgres -d system_reports
```

### Query for System ID 118 (example)

```sql
-- Main system
SELECT id, system_name, purpose, status
FROM systems_system
WHERE id = 118;

-- Architecture data (SHOULD HAVE DATA)
SELECT
    backend_tech,
    frontend_tech,
    architecture_type,
    containerization
FROM systems_systemarchitecture
WHERE system_id = 118;

-- Data info (SHOULD HAVE DATA)
SELECT
    storage_size_gb,
    record_count,
    data_update_frequency
FROM systems_systemdatainfo
WHERE system_id = 118;

-- Operations (SHOULD HAVE DATA)
SELECT
    deployment_location,
    developer,
    hosting_type
FROM systems_systemoperations
WHERE system_id = 118;

-- Integration (SHOULD HAVE DATA)
SELECT
    api_count,
    api_standard,
    integration_count
FROM systems_systemintegration
WHERE system_id = 118;
```

### Expected Database Results

Each query should return **1 row** with **non-NULL values** for fields you filled.

**Example**:
```
 backend_tech  | frontend_tech | architecture_type | containerization
---------------+---------------+-------------------+------------------
 python,django | react,typescript | microservices   | docker
(1 row)
```

---

## Troubleshooting

### Authentication Fails

**Error**: `✗ Login failed: 401`

**Solution**:
- Verify username/password are correct
- Ensure user account is active
- Check if account has proper role (admin or org_user)

### System 115 Not Found

**Error**: `✗ SCENARIO 2 FAILED: Cannot get system 115`

**Solution**:
- System might be soft-deleted
- Change SYSTEM_ID in script to a valid system you have access to
- Or skip scenario 2 by commenting it out

### Network Errors

**Error**: `Connection timeout` or `Connection refused`

**Solution**:
- Check internet connection
- Verify production server is up
- Try accessing API URL in browser: `https://hientrangcds.mst.gov.vn/api/systems/`

### Partial Field Mismatches

**Error**: Some fields show as failed but others pass

**Investigation**:
1. Check exact field names (typos?)
2. Review CommaSeparatedListField conversion
3. Check if backend expects different data type
4. Review serializer for that specific field

---

## Rollback Plan

If test creates unwanted data:

### Delete Test System

```python
import requests

api = TestAPI()
api.login("username", "password")

# Delete system created in test
api.session.delete(f"{api.base}/systems/118/")
```

### Or via Database

```sql
-- Soft delete (preferred)
UPDATE systems_system
SET is_deleted = TRUE, deleted_at = NOW()
WHERE id = 118 AND system_name LIKE 'LIVE_TEST%';

-- Hard delete (use with caution)
DELETE FROM systems_system WHERE id = 118;
```

---

## Success Metrics

Bug fix is considered **FULLY VERIFIED** when:

- ✅ Both scenarios pass 100%
- ✅ All 25+ fields verified in scenario 1
- ✅ All 9+ fields verified in scenario 2
- ✅ No NULL values where data was provided
- ✅ Response data matches request data exactly
- ✅ Nested objects present in API responses
- ✅ Database queries confirm data exists

**If all above are met** → Bug is COMPLETELY FIXED and production-ready.

---

## Next Steps After Successful Test

1. **Document Results**
   - Save test output to file
   - Note system IDs created
   - Record timestamp of verification

2. **Clean Up Test Data** (optional)
   - Delete test systems if needed
   - Or mark them for later cleanup

3. **Report to Stakeholders**
   - Confirm bug fix is verified
   - Provide test evidence
   - Clear for production use

4. **Monitor Production**
   - Watch for similar issues
   - Collect user feedback
   - Track error rates

---

## Contact & Support

If tests fail or you encounter issues:

1. **Collect Evidence**:
   - Full test output (copy from terminal)
   - System ID that failed
   - Specific fields that didn't save
   - Browser console errors (if testing via UI)

2. **Check Logs**:
   ```bash
   ssh admin_@34.142.152.104
   cd /home/admin_/thong_ke_he_thong
   docker compose logs backend --tail=100
   ```

3. **Review Recent Changes**:
   - Check git log for recent commits
   - Verify deployment was successful
   - Review recent migrations

---

**Test Prepared**: 2026-01-25
**Last Updated**: 2026-01-25
**Test Coverage**: Create + Update scenarios, 30+ fields verified
