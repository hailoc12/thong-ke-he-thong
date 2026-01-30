# Excel Column Name Fix - Live Test Verification Report
**Date:** 2026-01-27  
**Deployment:** Commit 84826ed  
**Frontend Bundle:** index-BO8WJeaC.js

---

## Test Results

### ✅ TEST 1: "THEO TÌNH TRẠNG NHẬP LIỆU" Text
- **Expected:** Text changed from "THEO TRÌNH ĐỘ NHẬP LIỆU" to "THEO TÌNH TRẠNG NHẬP LIỆU"
- **Result:** PASSED ✅
- **Location:** Sheet "1. Tổng quan", Cell A18
- **Status:** Fix deployed correctly

### ✅ TEST 2: Sheet 3 Column Header
- **Expected:** Column header changed from "Quan trọng" to "MỨC ĐỘ QUAN TRỌNG"
- **Result:** PASSED ✅
- **Sheet:** "3. Danh sách HT"
- **Column:** E (Column 5)
- **Status:** Header label updated correctly

### ❌ TEST 3: Data Values in "MỨC ĐỘ QUAN TRỌNG" Column
- **Expected:** Values should show: "Cực kỳ quan trọng", "Quan trọng", "Trung bình", "Thấp"
- **Result:** FAILED ❌
- **Actual:** All values are NULL/EMPTY
- **Impact:** **CRITICAL BUG** - Column E is completely empty for all 77 systems

### ✅ TEST 4: System Count
- **Expected:** 77 systems
- **Result:** PASSED ✅
- **Actual:** 77 systems included in Sheet 3

---

## Critical Issue Detected

### Problem Summary
The column header was successfully changed to "MỨC ĐỘ QUAN TRỌNG", but the **DATA is NOT being exported**. Column E is completely EMPTY for all 77 systems.

### Sample Data (Sheet 3: Danh sách HT)
```
STT | TÊN HỆ THỐNG                                    | COLUMN E (MỨC ĐỘ QUAN TRỌNG)
----|------------------------------------------------|-----------------------------
1   | Hệ thống công nghệ thông tin Báo VnExpress     | (EMPTY)
2   | Nền tảng số về an toàn bức xạ...              | (EMPTY)
3   | Test System                                     | (EMPTY)
4   | Hệ thống quản lý Bưu chính KT1                 | (EMPTY)
5   | Hệ thống quản lý, vận hành, giám sát mạng...  | (EMPTY)
```

---

## Root Cause Analysis

### Issue Location
**File:** `frontend/src/utils/exportExcel.ts`  
**Line:** 221  
**Function:** `generateSystemsSheet()`

### The Bug
```typescript
// CURRENT CODE (Line 221) - WRONG ❌
CRITICALITY_LABELS[sys.criticality] || sys.criticality,
```

The code attempts to access `sys.criticality`, but the **correct field name is `sys.criticality_level`** according to the TypeScript interface definition.

### Type Definition (from frontend/src/types/index.ts)
```typescript
export interface System {
  // ... other fields
  criticality_level: 'critical' | 'high' | 'medium' | 'low';  // ✅ CORRECT FIELD NAME
  // ... other fields
}
```

### Fix Required
```typescript
// CORRECTED CODE - Should be:
CRITICALITY_LABELS[sys.criticality_level] || sys.criticality_level,
```

---

## Additional Context

### CRITICALITY_LABELS Mapping (Lines 21-25)
```typescript
const CRITICALITY_LABELS: Record<string, string> = {
  high: 'Cực kỳ quan trọng',
  medium: 'Quan trọng',
  low: 'Trung bình',
  // Note: No mapping for 'Thấp' (lowest level)
};
```

**Potential Issue:** The mapping only includes `high`, `medium`, and `low`. If the backend uses `'critical'` as a level, it won't be mapped. The mapping may also need a `'critical'` key.

---

## Impact Assessment

### What Works
✅ Header label changed correctly  
✅ "THEO TÌNH TRẠNG NHẬP LIỆU" text updated  
✅ All 77 systems included in export  
✅ All other columns (STT, TÊN HỆ THỐNG, ĐƠN VỊ, TRẠNG THÁI, % HOÀN THÀNH, NGÀY CẬP NHẬT) working correctly

### What's Broken
❌ **MỨC ĐỘ QUAN TRỌNG column is completely empty**  
❌ **No criticality data is exported for any system**  
❌ **Users cannot see which systems are critical/important**

### Business Impact
- **HIGH SEVERITY**: Critical information (system importance level) is missing from the report
- **User Impact**: Decision-makers cannot prioritize systems based on criticality
- **Data Quality**: Report is incomplete and misleading

---

## Recommended Fix

### Step 1: Update Field Name
**File:** `frontend/src/utils/exportExcel.ts`  
**Line:** 221

```typescript
// Change this:
CRITICALITY_LABELS[sys.criticality] || sys.criticality,

// To this:
CRITICALITY_LABELS[sys.criticality_level] || sys.criticality_level,
```

### Step 2: Verify CRITICALITY_LABELS Mapping
If backend uses `'critical'` level, add it to the mapping:

```typescript
const CRITICALITY_LABELS: Record<string, string> = {
  critical: 'Cực kỳ quan trọng',  // Add if needed
  high: 'Cực kỳ quan trọng',
  medium: 'Quan trọng',
  low: 'Trung bình',
};
```

### Step 3: Test on Localhost
```bash
cd frontend
npm run dev
# Test Excel export and verify column E has data
```

### Step 4: Deploy Fix
```bash
cd frontend
npm run build
cd ..
./deploy-excel-column-fix.sh
```

### Step 5: Verify on Production
1. Login to https://hientrangcds.mst.gov.vn
2. Export Excel
3. Verify Column E contains criticality values
4. Verify all 77 systems have values

---

## Deployment Priority

**PRIORITY:** P0 - Critical Bug  
**URGENCY:** Immediate  
**REASON:** Core functionality broken - critical data missing from exported reports

---

## Verification Checklist

After deploying the fix:

- [ ] Column E header still shows "MỨC ĐỘ QUAN TRỌNG"
- [ ] Column E contains data for all systems
- [ ] Data values match: "Cực kỳ quan trọng", "Quan trọng", "Trung bình", "Thấp"
- [ ] All 77 systems have non-empty criticality values
- [ ] "THEO TÌNH TRẠNG NHẬP LIỆU" text still present

---

## Downloaded Test File

**File:** `Bao-cao-CDS-27-01-2026.xlsx`  
**Location:** `.playwright-mcp/Bao-cao-CDS-27-01-2026.xlsx`  
**Evidence:** File contains empty Column E in Sheet 3

