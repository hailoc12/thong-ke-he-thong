# Test Case: Policy Generation for "1.000 User" Query

**Date:** 2026-02-06
**Tester:** QA Team
**Environment:** UAT Server
**Purpose:** Verify policy generation improves AI responses based on user feedback

---

## Background

**User Question:** "Bao nhiêu hệ thống có trên 1.000 user?"
**Current AI Answer:** 0 hệ thống (WRONG!)
**Issue:** AI không hiểu "1.000 user" liên quan đến cột nào trong database

**Expected:** AI cần map "1.000 user" → cột `total_users` trong bảng systems

---

## Test Objective

Kiểm chứng rằng:
1. ✅ User có thể rate câu trả lời là negative
2. ✅ User có thể thêm feedback giải thích lỗi
3. ✅ System tạo policy từ feedback
4. ✅ Policy được inject vào AI prompt
5. ✅ Lần sau AI trả lời đúng hơn nhờ policy

---

## Pre-conditions

### 1. Chuẩn bị data
Trong database cần có ít nhất 2-3 hệ thống với `total_users > 1000`:

```sql
-- Check existing data
SELECT id, name, total_users
FROM systems
WHERE total_users > 1000
ORDER BY total_users DESC
LIMIT 5;
```

**Expected Result:**
```
id  | name                          | total_users
----+-------------------------------+------------
1   | Hệ thống quản lý văn bản      | 5000
2   | Cổng thông tin điện tử        | 3000
3   | Hệ thống quản lý tài sản      | 1500
```

### 2. Login
- Username: `lanhdaobo`
- Password: `ThongkeCDS@2026#`
- Verify có quyền truy cập AI Assistant

---

## Test Steps

### Step 1: Baseline Test - Câu trả lời SAI

**Action:**
1. Navigate to Dashboard → AI Assistant
2. Chọn mode "Deep Analysis"
3. Nhập câu hỏi: `Bao nhiêu hệ thống có trên 1.000 user?`
4. Click "Hỏi AI"
5. Đợi AI trả lời

**Expected Result:**
- AI query SQL: `SELECT COUNT(*) FROM systems WHERE total_users > 1000`
- AI trả lời: "Có X hệ thống có trên 1.000 user" (với X là số thực tế)

**Actual Result (Before Fix):**
- ❌ AI trả lời: 0 hệ thống (SAI!)
- ❌ Hoặc: "Không tìm thấy thông tin"
- ❌ Hoặc: AI không hiểu câu hỏi

**Screenshot:** `baseline_wrong_answer.png`

---

### Step 2: Rate Negative & Add Feedback

**Action:**
1. Trong kết quả AI, click nút 👎 (Dislike)
2. Popup hiện ra cho phép nhập feedback
3. Nhập feedback chi tiết:

```
Câu trả lời sai!

Vấn đề: AI không hiểu "1.000 user" liên quan đến cột nào.

Giải thích:
- "1.000 user" ở đây là "total_users" trong bảng systems
- Cần query: SELECT COUNT(*) FROM systems WHERE total_users > 1000
- Hiện tại có 3 hệ thống: Hệ thống quản lý văn bản (5000 user), Cổng thông tin (3000 user), Quản lý tài sản (1500 user)

Yêu cầu: Khi user hỏi về "X user" hoặc "X người dùng", luôn map sang cột "total_users" của bảng systems.
```

4. Click "Gửi feedback"

**Expected Result:**
- ✅ Message success: "Cảm ơn feedback của bạn!"
- ✅ Feedback được lưu vào database
- ✅ Rating = 'negative'

**Verify in Database:**
```sql
SELECT * FROM ai_response_feedback
WHERE question LIKE '%1.000 user%'
ORDER BY created_at DESC
LIMIT 1;
```

**Screenshot:** `feedback_submitted.png`

---

### Step 3: Regenerate Policies

**Action:**
1. Navigate to `/ai-feedback` page
2. Verify statistics:
   - Negative Feedback count tăng lên 1
3. Click button "Tạo Lại Policies"
4. Confirm modal: "Có, tạo lại"
5. Đợi hệ thống xử lý (có thể mất 10-30 giây)

**Expected Result:**
- ✅ Loading spinner hiện ra
- ✅ Message success: "Đã tạo lại X policies từ feedback"
- ✅ Trang reload
- ✅ Có policy mới xuất hiện

**Verify Policy Created:**

Trong tab "📈 Thống kê & Policies", tìm policy mới có:
- **Category:** Độ chính xác (accuracy)
- **Priority:** Cao (high) hoặc Trung bình (medium)
- **Rule:** Chứa keyword "total_users" hoặc "1.000 user" hoặc "mapping"
- **Rationale:** Mention về việc user không hiểu cột nào

**Example Policy:**
```
Category: Độ chính xác
Priority: Cao
Rule: Khi user hỏi về "X user" hoặc "X người dùng", luôn map sang cột total_users của bảng systems
Rationale: Users reported confusion khi hỏi về số lượng user - AI không hiểu map sang cột nào. Cần explicit mapping.
```

**Screenshot:** `policy_generated.png`

---

### Step 4: Verify Policy Injection

**Action:**
1. Trong trang `/ai-feedback`
2. Click button "Xem Prompt Hiện Tại"
3. Modal hiện ra với system prompt

**Expected Result:**

Modal hiển thị prompt có chứa policy vừa tạo:

```
Bạn là AI Assistant hỗ trợ tra cứu thông tin về hệ thống.

IMPROVEMENT GUIDELINES:
1. [Độ chính xác] [Cao] Khi user hỏi về "X user" hoặc "X người dùng", luôn map sang cột total_users của bảng systems
   Lý do: Users reported confusion...

2. [Other policies...]

Hãy tuân thủ các guidelines trên khi trả lời câu hỏi.
```

**Verification:**
- ✅ Policy có trong prompt
- ✅ Format đúng: [Category] [Priority] Rule
- ✅ Có Rationale

**Screenshot:** `policy_in_prompt.png`

---

### Step 5: Test Again - Câu trả lời ĐÚNG (với Policy)

**Action:**
1. Quay lại Dashboard → AI Assistant
2. **Clear conversation** (hoặc start new session)
3. Nhập câu hỏi GIỐNG Y HỆT: `Bao nhiêu hệ thống có trên 1.000 user?`
4. Click "Hỏi AI"
5. Đợi AI trả lời

**Expected Result (After Policy Applied):**

AI response PHẢI cải thiện:

**Option A - Perfect (Best):**
```
Dựa trên dữ liệu, có 3 hệ thống có trên 1.000 người dùng:

1. Hệ thống quản lý văn bản - 5.000 user
2. Cổng thông tin điện tử - 3.000 user
3. Hệ thống quản lý tài sản - 1.500 user

SQL Query đã sử dụng:
SELECT name, total_users
FROM systems
WHERE total_users > 1000
ORDER BY total_users DESC;
```

**Option B - Good Enough:**
```
Có 3 hệ thống có trên 1.000 user.

(Followed by list or details)
```

**Option C - Acceptable (Shows understanding):**
```
Để trả lời câu hỏi này, tôi query cột total_users của bảng systems với điều kiện > 1000.

Kết quả: 3 hệ thống.
```

**NOT Acceptable:**
- ❌ Vẫn trả lời: 0 hệ thống
- ❌ "Không tìm thấy thông tin"
- ❌ Không mention total_users

**Screenshot:** `after_policy_correct_answer.png`

---

### Step 6: Verify Improvement

**Action:**
Compare 2 screenshots:
1. `baseline_wrong_answer.png` (Before policy)
2. `after_policy_correct_answer.png` (After policy)

**Success Criteria:**
- ✅ Answer changes from wrong → correct
- ✅ AI demonstrates understanding of "1.000 user" → "total_users" mapping
- ✅ Number matches database reality
- ✅ Response more accurate

**Quantitative Check:**
```sql
-- Verify actual count
SELECT COUNT(*) FROM systems WHERE total_users > 1000;
-- Should match AI's answer
```

---

## Detailed Verification Checklist

### 1. Database Verification

```sql
-- 1. Check feedback được lưu
SELECT * FROM ai_response_feedback
WHERE question LIKE '%1.000 user%'
ORDER BY created_at DESC;

-- Expected: 1 record with rating='negative'

-- 2. Check feedback được analyzed
SELECT * FROM ai_response_feedback
WHERE question LIKE '%1.000 user%'
AND analyzed = TRUE;

-- Expected: analyzed=TRUE sau khi regenerate

-- 3. Check custom policy được tạo
SELECT * FROM custom_policy
WHERE rule LIKE '%total_users%' OR rule LIKE '%user%'
ORDER BY created_at DESC;

-- Expected: 1 new policy
```

### 2. API Verification

**GET `/api/ai-feedback/active_policies/`:**

```json
{
  "active_policies": [
    {
      "category": "accuracy",
      "rule": "Khi user hỏi về 'X user'...",
      "priority": "high",
      "rationale": "Users reported confusion...",
      "is_custom": false,
      "id": null
    }
  ],
  "total_policies": 1,
  "active_count": 1
}
```

**GET `/api/ai-feedback/policy_status/`:**

```json
{
  "total_policies": 1,
  "auto_generated_count": 1,
  "custom_count": 0,
  "injection_points": ["AI Assistant System Prompt"],
  "policies_breakdown": {
    "high": 1,
    "medium": 0,
    "low": 0
  }
}
```

---

## Edge Cases to Test

### Edge Case 1: Multiple Similar Questions

Test with variations:
- "Bao nhiêu hệ thống có trên 1000 user?" (no comma)
- "Có bao nhiêu hệ thống có hơn 1.000 người dùng?"
- "Liệt kê các hệ thống có từ 1.000 user trở lên"

**Expected:** AI handles all variations correctly after policy

### Edge Case 2: Related Questions

Test related queries:
- "Hệ thống nào có nhiều user nhất?"
- "Top 5 hệ thống theo số lượng user"
- "Hệ thống có dưới 1.000 user"

**Expected:** AI applies same mapping logic

### Edge Case 3: Policy Conflicts

If multiple policies exist:
- Test priority ordering (high > medium > low)
- Test that newer policies don't override useful old ones

---

## Troubleshooting

### If Step 1 already returns CORRECT answer:

Possible reasons:
1. Policy already exists from previous test
2. Database seeded with instructions
3. AI naturally understands (unlikely)

**Solution:** Delete existing policies first:
```sql
DELETE FROM custom_policy WHERE rule LIKE '%total_users%';
-- Then rerun test
```

### If Policy NOT Generated in Step 3:

Check:
1. Feedback có `rating='negative'`?
2. Feedback có `analyzed=False`?
3. Backend logs có error?

**Debug:**
```bash
docker compose logs backend | grep -A 10 "generate_improvement_policies"
```

### If Step 5 still WRONG:

Check:
1. Policy có trong active_policies?
2. Policy có `priority='high'` hoặc `medium`? (low policies không được inject)
3. System prompt có chứa policy?
4. Conversation có được clear? (old context may interfere)

---

## Success Metrics

Test PASS if:
- ✅ Feedback submitted successfully
- ✅ Policy generated from feedback
- ✅ Policy appears in active list
- ✅ Policy injected into system prompt
- ✅ AI answer improves from wrong → correct
- ✅ Improvement is repeatable (test 2-3 lần)

Test FAIL if:
- ❌ Policy không được generate
- ❌ Policy generate nhưng không relevant
- ❌ Policy có trong list nhưng không inject vào prompt
- ❌ AI answer vẫn sai sau khi có policy

---

## Expected Timeline

| Step | Time | Notes |
|------|------|-------|
| Step 1 | 2 min | Baseline test |
| Step 2 | 3 min | Submit feedback |
| Step 3 | 30 sec | Regenerate (AI processing) |
| Step 4 | 1 min | Verify injection |
| Step 5 | 2 min | Test improvement |
| Step 6 | 2 min | Verify & compare |
| **Total** | **~10 min** | One complete cycle |

---

## Post-Test Actions

After successful test:

1. **Document Results:**
   - Attach all screenshots
   - Note exact AI responses
   - Record policy text generated

2. **Keep Policy:**
   - Do NOT delete the generated policy
   - It's now part of production knowledge base
   - Will help future users with similar questions

3. **Update Training Data:**
   - Add this test case to regression suite
   - Document expected behavior
   - Use as example for similar issues

---

## Related Test Cases

After this test passes, try similar patterns:

1. **Test Case 2:** "Hệ thống nào có API endpoint?"
   - Map to `has_api_endpoint` field

2. **Test Case 3:** "Có bao nhiêu đơn vị sử dụng cloud?"
   - Map to organizations' `uses_cloud` field

3. **Test Case 4:** "System nào được triển khai năm 2024?"
   - Map to `deployment_year` field

---

## Regression Testing

Schedule regular checks:
- ⏰ Weekly: Re-test question to ensure policy persists
- ⏰ After deploy: Verify policies migrate correctly
- ⏰ After DB changes: Check if field mappings still valid

---

**Test Created:** 2026-02-06
**Created By:** Claude Code AI Assistant
**Status:** Ready for Execution
**Priority:** P0 - Critical (validates core feature)
