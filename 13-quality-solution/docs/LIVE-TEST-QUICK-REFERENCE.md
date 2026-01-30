# Live Test Quick Reference Card

## 30-Second Setup

```bash
cd /Users/shimazu/Dropbox/9. active/consultant/support_b4t/thong_ke_he_thong

# Edit credentials
nano live_test_simple.py
# Fill in: USERNAME, PASSWORD, ORG_ID

# Run test
python3 live_test_simple.py
```

---

## What Gets Tested

| Scenario | Action | Fields Tested | Success Metric |
|----------|--------|---------------|----------------|
| 1 | Create new system | 25+ fields across 4 tables | 100% match |
| 2 | Update system 115 | 9+ fields in nested tables | 100% updated |

---

## Reading Results

### All Pass ✓
```
✓ SCENARIO 1 PASSED (100% data saved)
✓ SCENARIO 2 PASSED (100% updates saved)
✓✓✓ ALL TESTS PASSED - BUG FIX VERIFIED ✓✓✓
```
**Meaning**: Bug completely fixed. Production ready.

### Some Fail ✗
```
✗ architecture_data.backend_tech
    Expected: ['python', 'django']
    Actual:   None
```
**Meaning**: Specific fields not saving. Need investigation.

### Complete Fail
```
✗ SCENARIO 1 FAILED (25 fields not saved)
✗ SCENARIO 2 FAILED (9 fields not updated)
```
**Meaning**: Bug not fixed. Check deployment.

---

## Test Data Locations

| Table | Fields Tested |
|-------|---------------|
| `systems_system` | system_name, purpose, annual_users |
| `systems_systemarchitecture` | backend_tech, frontend_tech, containerization |
| `systems_systemdatainfo` | storage_size_gb, record_count, data_update_frequency |
| `systems_systemoperations` | deployment_location, developer, hosting_type |
| `systems_systemintegration` | api_count, api_standard, integration_count |

---

## Quick Database Check

```bash
ssh admin_@34.142.152.104
cd /home/admin_/thong_ke_he_thong
docker compose exec postgres psql -U postgres -d system_reports
```

```sql
-- Replace 118 with your test system ID
SELECT backend_tech, frontend_tech FROM systems_systemarchitecture WHERE system_id = 118;
SELECT storage_size_gb, record_count FROM systems_systemdatainfo WHERE system_id = 118;
SELECT deployment_location, developer FROM systems_systemoperations WHERE system_id = 118;
```

Expected: **Non-NULL values** matching what you sent in the test.

---

## Common Issues

| Issue | Fix |
|-------|-----|
| `Login failed: 401` | Check username/password |
| `System 115 not found` | Change SYSTEM_ID to valid system |
| `Connection timeout` | Check network/server status |
| Partial failures | Review serializer for failed fields |

---

## Success Criteria

✅ All scenarios pass 100%
✅ Response data = Request data
✅ No NULL where data provided
✅ Database confirms persistence

---

## Time Estimate

- Setup: 1 minute
- Run test: 3-5 minutes
- Review: 2 minutes
- **Total: ~10 minutes**

---

## Rollback

Delete test system if needed:

```bash
# Via API (soft delete)
curl -X DELETE https://hientrangcds.mst.gov.vn/api/systems/118/ \
  -H "Authorization: Bearer YOUR_TOKEN"

# Or via database
UPDATE systems_system SET is_deleted = TRUE WHERE id = 118;
```

---

## Report Template

```
LIVE TEST RESULTS - Data Save Bug Fix

Date: 2026-01-25
Tester: [Name]
Environment: Production (hientrangcds.mst.gov.vn)

Scenario 1 (Create):
- Status: [ ] PASS  [ ] FAIL
- System ID: ______
- Fields verified: ___/25
- Success rate: ____%

Scenario 2 (Update):
- Status: [ ] PASS  [ ] FAIL
- System ID: 115
- Fields verified: ___/9
- Success rate: ____%

Overall: [ ] BUG FIXED  [ ] BUG NOT FIXED

Failed fields (if any):
- _____________________
- _____________________

Notes:
_____________________
_____________________
```
