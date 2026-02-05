# UAT AI Assistant - Critical Bugs Summary
**Date**: 2026-02-03
**Environment**: https://hientrangcds.mindmaid.ai
**Status**: ⚠️ NOT PRODUCTION READY

---

## Critical Bugs Found

### 🔴 BUG #1: Template Replacement Failure
**Severity**: CRITICAL | **Priority**: P0

**Problem**: Template variables not replaced, showing placeholders to users

**Examples**:
- Query: "Tổng số hệ thống là bao nhiêu?"
- Quick mode shows: "Tổng số hệ thống là **X hệ thống**" ❌
- Deep mode shows: "Tổng số hệ thống là **87**" ✓
- Empty results show: "**cobol_system_count** hệ thống" ❌

**Impact**:
- Users see internal variable names
- Looks broken/unfinished
- Data accuracy concerns

**Root Cause**: Quick mode uses different (incomplete) template engine

**Fix**: Use same template engine for all modes, add validation

---

### 🔴 BUG #2: Persistent Connection Errors
**Severity**: HIGH | **Priority**: P0

**Problem**: Error dialog appears after EVERY query, even successful ones

**Evidence**:
- 100% of queries show "Lỗi kết nối" dialog
- User must click "Đã hiểu" after each query
- Console: `ERROR event received: undefined`

**Impact**:
- Terrible UX (extra click per query)
- Users think system is broken
- Loss of confidence in feature

**Root Cause**: EventSource connection not closed cleanly, frontend treats completion as error

**Fix**: Properly close SSE stream, suppress error dialog on successful completion

---

### 🟡 BUG #3: Variable Name Exposure
**Severity**: MEDIUM | **Priority**: P1

**Problem**: Internal variable names like "cobol_system_count" shown to users

**Impact**: Unprofessional, confusing

**Fix**: Add fallback logic to show "0" instead of variable names

---

## Test Results

| Test # | Query | Mode | Result | Bug |
|--------|-------|------|--------|-----|
| 1 | "Có bao nhiêu hệ thống?" | Quick | ✓ Shows 87 | - |
| 2 | "Tổng số hệ thống là bao nhiêu?" | Quick | ❌ Shows "X" | #1 |
| 3 | "Cho tôi biết số lượng hệ thống" | Quick | ✓ Shows 87 | - |
| 4 | "Đếm số hệ thống" | Quick | ✓ Shows 87 | - |
| 5 | "Hệ thống có tất cả bao nhiêu cái?" | Quick | ✓ Shows 87 | - |
| 6 | "Tổng số hệ thống là bao nhiêu?" | Deep | ✓ Shows 87 | - |
| 7 | "Có bao nhiêu hệ thống sử dụng COBOL?" | Quick | ❌ Shows placeholder | #1 |

**All tests**: Connection error dialog (Bug #2) ❌

---

## Reproduction Steps

### Bug #1 (Template Replacement)
1. Go to Strategic Dashboard
2. Select Quick mode
3. Ask: "Tổng số hệ thống là bao nhiêu?"
4. Observe: Text shows "X hệ thống" instead of "87 hệ thống"
5. Switch to Deep mode, ask same question
6. Observe: Now correctly shows "87"

### Bug #2 (Connection Errors)
1. Ask ANY question
2. Wait for response
3. Observe: Error dialog "Lỗi kết nối" appears
4. Note: Response is actually displayed correctly below
5. Must click "Đã hiểu" to continue

---

## Impact Assessment

| Metric | Value |
|--------|-------|
| Queries affected by Bug #1 | ~30% |
| Queries affected by Bug #2 | 100% |
| User trust impact | HIGH |
| Production readiness | NO |

---

## Recommendations

### DO NOT DEPLOY TO PRODUCTION
These bugs significantly degrade user experience and undermine trust in the AI feature.

### Fix Priority
1. **P0**: Fix connection error dialog (1 day)
2. **P0**: Fix template replacement (1-2 days)
3. **P1**: Add template validation (0.5 day)

### After Fixes
1. Deploy to UAT
2. Re-test all scenarios
3. Add regression tests
4. Then deploy to production

**Estimated time to production-ready**: 2-3 days

---

## Full Report
See `UAT_AI_ASSISTANT_TEST_REPORT.md` for complete details, technical analysis, and recommendations.

---

**Conclusion**: Core AI functionality works well, especially Deep mode. Infrastructure bugs prevent production deployment. Quick fixes possible.
