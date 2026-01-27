# Testing Guide - Critical Data Persistence Fix

**Fix Deployed**: 2026-01-25 12:02
**What was fixed**: transformFormValuesToAPIPayload (Frontend-Backend data structure mismatch)

---

## Quick Start Testing (5 minutes)

### Step 1: Access Production
```
URL: http://34.142.152.104
Login: Use your admin or org_user credentials
```

### Step 2: Create Test System

**Name it**: `Test Fix - [Your Name] - [Current Time]`

Example: `Test Fix - Admin - 12:05`

### Step 3: Fill Data in ALL 8 Tabs

**IMPORTANT**: Fill at least 5-10 fields in each tab to test thoroughly.

#### Tab 1: Thông tin cơ bản
```
- Tên hệ thống: Test Fix - [Your Name] - [Time]
- Mô tả: Testing transformFormValuesToAPIPayload fix deployment
- Đơn vị: [Select any]
- Mục đích: [Select any]
- Loại yêu cầu: [Select]
- Ngày đưa vào vận hành: 2026-01-01
- Website: http://test.example.com
- Số lượng người dùng: 100
- Đơn vị sử dụng: Phòng CNTT
- Người liên hệ: Nguyễn Văn A
- Email: test@example.com
- Điện thoại: 0123456789
```

#### Tab 2: Kiến trúc hệ thống
```
- Loại kiến trúc: Client-Server
- Công nghệ Backend: Java Spring Boot
- Công nghệ Frontend: React + TypeScript
- Loại CSDL: PostgreSQL
- Mô hình dữ liệu: Relational
- Loại hosting: Cloud
- Nhà cung cấp Cloud: Google Cloud Platform
- Phong cách API: REST
- CI/CD: Jenkins
- Automated Testing: Yes
```

#### Tab 3: Thông tin dữ liệu
```
- Dung lượng lưu trữ (GB): 50
- Số lượng API endpoints: 25
- Có API: Yes
- Có dữ liệu cá nhân: Yes
- Có dữ liệu nhạy cảm: Yes
- Phân loại dữ liệu: Confidential
- Loại dữ liệu: JSON, CSV, PDF
- Tốc độ tăng trưởng (%/năm): 15
```

#### Tab 4: Vận hành
```
- Nhà phát triển: Công ty ABC
- Số lượng dev team: 5
- Tình trạng bảo hành: Active
- Đơn vị vận hành: Phòng IT
- Số lượng ops team: 3
- Mức độ hỗ trợ: 24/7
- Vị trí triển khai: Cloud + On-premise
```

#### Tab 5: Tích hợp
```
- Có tích hợp: Yes
- Số lượng tích hợp: 3
- Loại tích hợp: REST API, Database
- Sử dụng API chuẩn: Yes
- API Standard: OpenAPI 3.0
- Có API Gateway: Yes
```

#### Tab 6: Người dùng
```
- Add at least 1 test user
  Name: Test User
  Role: Viewer
```

#### Tab 7: Tài liệu đính kèm
```
- Upload or link to any test document
```

#### Tab 8: Đánh giá
```
- Khuyến nghị: Should integrate
- Mức độ sẵn sàng tích hợp: High
- Rào cản: None
```

### Step 4: Save Process

**CRITICAL**:
1. Click "Lưu nháp" after filling EACH tab
2. Wait for green success message
3. Move to next tab
4. Repeat for all 8 tabs
5. Finally, click "Hoàn thành" to finalize

### Step 5: Note the System ID

After clicking "Hoàn thành", you'll see a message with the System ID.

**Write it down**: System ID = ______

---

## Verification (2 minutes)

### Option 1: Use Automated Script

```bash
cd /Users/shimazu/Dropbox/9. active/consultant/support_b4t/thong_ke_he_thong
./verify-fix-database.sh [SYSTEM_ID]
```

Replace `[SYSTEM_ID]` with the ID you noted.

### Option 2: Manual Database Check

```bash
ssh admin_@34.142.152.104
cd /home/admin_/thong_ke_he_thong
docker compose exec postgres psql -U postgres -d system_reports
```

Then run these queries (replace 999 with your System ID):

```sql
-- Check main system
SELECT id, name, description FROM systems WHERE id = 999;

-- Check architecture (SHOULD HAVE DATA)
SELECT backend_tech, frontend_tech, database_type
FROM system_architecture WHERE system_id = 999;

-- Check data info (SHOULD HAVE DATA)
SELECT storage_size_gb, api_endpoints_count, has_api
FROM system_data_info WHERE system_id = 999;

-- Check operations (SHOULD HAVE DATA)
SELECT developer, warranty_status, operator
FROM system_operations WHERE system_id = 999;

-- Check integration (SHOULD HAVE DATA)
SELECT has_integration, integration_count, uses_standard_api
FROM system_integration WHERE system_id = 999;

-- Check assessment (SHOULD HAVE DATA)
SELECT recommendation, integration_readiness
FROM system_assessment WHERE system_id = 999;
```

### Expected Results

**✅ SUCCESS** if you see:
- All queries return 1 row (not 0 rows)
- Fields you filled show actual values (not NULL)
- Values match what you entered in the form

**❌ FAILURE** if you see:
- Any query returns 0 rows
- Fields you filled are NULL
- Values don't match what you entered

---

## Quick Test Results Template

Copy this and fill it out:

```
TEST RESULTS - Critical Data Persistence Fix
Date: 2026-01-25
Tester: [Your Name]
Time: [Time tested]

System Created:
- System ID: ______
- Name: ______

Database Verification:
- system_architecture: [ ] Has data  [ ] No data
- system_data_info: [ ] Has data  [ ] No data
- system_operations: [ ] Has data  [ ] No data
- system_integration: [ ] Has data  [ ] No data
- system_assessment: [ ] Has data  [ ] No data

Sample Field Checks:
- backend_tech: [Value from DB] (Expected: [What you entered])
- storage_size_gb: [Value from DB] (Expected: [What you entered])
- developer: [Value from DB] (Expected: [What you entered])
- has_integration: [Value from DB] (Expected: [What you entered])
- recommendation: [Value from DB] (Expected: [What you entered])

Overall Result: [ ] PASS  [ ] FAIL

Issues Found (if any):
[List any fields that didn't save or errors encountered]

Browser Console Errors (if any):
[Copy any red errors from browser console]
```

---

## If Test FAILS

### 1. Check Browser Console

1. Press F12 to open Developer Tools
2. Go to Console tab
3. Look for red error messages
4. Copy all errors

### 2. Check Network Tab

1. In Developer Tools, go to Network tab
2. Filter by "Fetch/XHR"
3. Find the POST/PATCH request to `/systems/`
4. Click on it
5. Go to "Payload" or "Request" tab
6. Check if the payload has nested structure like:

```json
{
  "name": "Test...",
  "architecture_data": {
    "backend_tech": "...",
    "frontend_tech": "..."
  },
  "data_info_data": {
    "storage_size_gb": 50
  }
}
```

**If payload is FLAT** (no nested objects) → Fix not applied
**If payload is NESTED** but data still not saved → Backend issue

### 3. Check Backend Logs

```bash
ssh admin_@34.142.152.104
cd /home/admin_/thong_ke_he_thong
docker compose logs backend --tail=100 | grep -i error
```

Look for:
- Serialization errors
- Database errors
- Validation errors

### 4. Report Issue

Include:
1. System ID created
2. Browser console errors
3. Network payload (screenshot or copy)
4. Backend log errors
5. Database query results showing missing data

---

## Edit Test (Optional but Recommended)

After creating the system, test editing:

1. Go to Systems list
2. Find your test system
3. Click "Sửa" (Edit)
4. Go to Tab 2 (Architecture)
5. Change "Backend Tech" to something different
6. Click "Lưu nháp"
7. Go to Tab 3 (Data Info)
8. Change "Storage Size" to a different number
9. Click "Lưu nháp"
10. Click "Hoàn thành"

**Verify**:
```sql
SELECT backend_tech, updated_at
FROM system_architecture
WHERE system_id = [YOUR_SYSTEM_ID];

SELECT storage_size_gb, updated_at
FROM system_data_info
WHERE system_id = [YOUR_SYSTEM_ID];
```

**Expected**: Both fields should show NEW values and updated_at should be recent.

---

## Performance Check

While testing, observe:

1. **Save Speed**: Each "Lưu nháp" should complete in < 2 seconds
2. **Page Load**: Tab switches should be instant
3. **Final Submit**: "Hoàn thành" should complete in < 3 seconds
4. **No Delays**: No spinning wheels or frozen UI

If you notice slowdowns, note them but they're not critical (performance can be optimized later).

---

## Common Questions

**Q: Do I need to fill every single field?**
A: No, but fill at least 5-10 fields per tab to ensure a good test.

**Q: What if I skip a tab?**
A: That's fine. The test is to verify that fields you DO fill are saved. Empty tabs will just have no data.

**Q: Can I use fake/dummy data?**
A: Yes! This is a test system. Use any realistic-looking data.

**Q: How do I know if it's really fixed?**
A: Run the database queries. If you see your data in the nested tables (system_architecture, system_data_info, etc.), it's fixed.

**Q: What about System #115 that was broken before?**
A: The fix prevents FUTURE data loss. It doesn't recover old lost data. System #115 would need manual data re-entry.

**Q: What if only SOME fields are saved?**
A: That's still a partial bug. Report which fields are missing so we can investigate specific field mappings.

---

## Success Criteria

Fix is considered SUCCESSFUL if:

- ✅ System creates without errors
- ✅ All 5 nested tables have data (architecture, data_info, operations, integration, assessment)
- ✅ Values in database match values entered in form
- ✅ Edit/update functionality works
- ✅ No console errors
- ✅ No backend errors in logs

Fix is considered FAILED if:

- ❌ Any nested table is empty after data entry
- ❌ Values don't match or are NULL when they should have data
- ❌ JavaScript errors in console
- ❌ 500 errors from backend
- ❌ Form submission fails

---

## Time Estimate

- **Create Test System**: 3-5 minutes
- **Database Verification**: 1-2 minutes
- **Edit Test**: 2 minutes
- **Total**: ~10 minutes

---

## Contact

If you encounter issues or have questions:

1. Check FIX-DEPLOYMENT-SUCCESS.md for detailed troubleshooting
2. Run verify-fix-database.sh for automated checks
3. Collect browser console + backend logs
4. Report with specific error details

---

**Good luck with testing! The fix should work perfectly if deployment was successful.**
