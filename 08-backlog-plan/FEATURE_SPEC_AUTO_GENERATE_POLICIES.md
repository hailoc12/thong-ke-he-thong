# Feature Spec: Tự động Tạo Giải Pháp (Auto-Generate Improvement Policies)

**Version:** 2.0
**Date:** 2026-02-06
**Status:** In Development

---

## 🎯 Mục Đích

Tự động phân tích các phản hồi tiêu cực từ user về AI Assistant và tạo ra **context prompts** (improvement policies) để inject vào system prompt, giúp AI Assistant:
1. Hiểu rõ hơn về database schema và domain knowledge
2. Generate SQL queries chính xác hơn
3. Trả lời đúng các câu hỏi tương tự trong tương lai

**Key Insight:** Policies không phải là rules đơn thuần, mà là **context information** về database/domain mà AI cần biết để map user questions → correct SQL queries.

---

## 📊 User Flow

### Flow 1: Automatic Policy Generation (Primary)

```
User asks question
    ↓
AI Assistant answers (with steps, SQL, results)
    ↓
User rates: 👎 Negative
    ↓
User adds feedback text explaining the issue
    ↓
User clicks "Gửi feedback"
    ↓
[AUTOMATIC TRIGGER]
    ↓
System checks: Has this feedback already generated policy?
    ├─ Yes → Skip generation (feedback.has_policy = True)
    └─ No → Generate policy immediately
        ↓
        Backend analyzes:
        - User question
        - User feedback text
        - AI response steps
        - SQL queries executed
        - Query results
        - Error/mismatch details
        ↓
        Extract key insight:
        "What database/domain knowledge is missing?"
        ↓
        Generate policy prompt:
        Category, Rule, Priority, Rationale, Examples
        ↓
        Save policy & mark feedback.has_policy = True
        ↓
        Return success to user
```

**User Experience:**
- User submits negative feedback
- Sees message: "✅ Đã ghi nhận phản hồi và tạo giải pháp tự động"
- Policy immediately active for future queries

---

### Flow 2: Manual Regeneration (Admin/Leader Only)

**Trigger:** User clicks button "Tự động tạo giải pháp" trong trang "Tinh chỉnh Trợ lý A.I"

**Use Cases:**
1. Batch regenerate all policies from scratch (improve algorithm)
2. Regenerate for specific feedbacks that failed auto-generation
3. Update existing policies with better analysis

```
Leader/Admin visits: /ai-feedback page
    ↓
Clicks "Tự động tạo giải pháp" button
    ↓
System shows confirm modal:
"Tạo lại policies từ TẤT CẢ feedbacks tiêu cực?
Policies hiện tại sẽ bị ghi đè."
    ↓
User confirms: "Có, tạo lại"
    ↓
Backend regenerates ALL policies:
    - Analyze all negative feedbacks (even if has_policy=True)
    - Re-extract insights with latest algorithm
    - Overwrite existing policies
    - Mark all as analyzed
    ↓
Return: "✅ Đã tạo lại X policies từ Y feedbacks"
```

---

## 🏗️ Technical Architecture

### 1. Data Model

#### AIResponseFeedback
```python
class AIResponseFeedback(models.Model):
    query = models.TextField()  # User's question
    mode = models.CharField(choices=['quick', 'deep'])
    response_data = models.JSONField()  # Full AI response with steps
    conversation_context = models.JSONField(null=True)
    rating = models.CharField(choices=['positive', 'negative'])
    feedback_text = models.TextField(blank=True)

    # Policy tracking
    has_policy = models.BooleanField(default=False)  # NEW FIELD
    policy_generated_at = models.DateTimeField(null=True)

    created_at = models.DateTimeField(auto_now_add=True)
    user = models.ForeignKey(User)
```

#### response_data Structure
```json
{
  "question": "Bao nhiêu hệ thống có trên 1.000 user?",
  "answer": "0 hệ thống",  // WRONG ANSWER
  "steps": [
    {
      "action": "analyze_question",
      "detail": "Phân tích câu hỏi để xác định intent",
      "result": "COUNT systems WHERE user_count > 1000"
    },
    {
      "action": "execute_query",
      "sql": "SELECT COUNT(*) FROM systems WHERE user_field > 1000",
      "result": 0,
      "execution_time": "0.05s"
    },
    {
      "action": "format_answer",
      "result": "Có 0 hệ thống có trên 1.000 user"
    }
  ],
  "queries": [
    {
      "sql": "SELECT COUNT(*) FROM systems WHERE user_field > 1000",
      "results": [],
      "row_count": 0
    }
  ],
  "metadata": {
    "model": "gpt-4",
    "execution_time": "2.3s",
    "confidence": 0.85
  }
}
```

---

### 2. Policy Generation Algorithm

#### Input Data for AI Analysis
```python
def generate_policy_from_feedback(feedback: AIResponseFeedback):
    """
    Analyze negative feedback and generate improvement policy.

    The AI needs FULL CONTEXT to understand what went wrong:
    - What user asked
    - What AI did (steps, SQL queries)
    - What results were returned
    - Why user said it's wrong (feedback_text)
    """

    context = {
        # User's question
        "question": feedback.query,

        # User's explanation of the problem
        "feedback": feedback.feedback_text,

        # What AI did wrong
        "ai_response": {
            "answer": feedback.response_data.get("answer"),
            "steps": feedback.response_data.get("steps", []),
            "sql_queries": feedback.response_data.get("queries", []),
        },

        # Database schema (if available)
        "schema_info": get_relevant_schema_for_question(feedback.query),

        # Previous similar issues (if any)
        "similar_feedbacks": find_similar_feedbacks(feedback),

        # IMPORTANT: Existing policies to avoid duplicates
        "existing_policies": get_active_policies(),
        "current_system_prompt": build_system_prompt_with_policies(),
    }

    # Send to AI for analysis
    policy = ai_analyze_and_generate_policy(context)

    return policy
```

#### AI Analysis Prompt Template
```
You are analyzing why an AI Assistant gave a wrong answer.

QUESTION:
{question}

AI'S WRONG ANSWER:
{answer}

STEPS AI TOOK:
{steps}

SQL QUERIES EXECUTED:
{sql_queries}

QUERY RESULTS:
{results}

USER'S FEEDBACK:
{feedback_text}

DATABASE SCHEMA (relevant tables):
{schema_info}

EXISTING POLICIES (already in system prompt):
{existing_policies}

IMPORTANT: Check existing policies FIRST to avoid generating duplicates.
Only generate a NEW policy if:
1. This issue is NOT already covered by existing policies
2. The new policy adds DIFFERENT knowledge/context
3. The new policy complements (not overlaps with) existing ones

TASK:
Identify the ROOT CAUSE of the wrong answer. What DATABASE/DOMAIN KNOWLEDGE
was missing that caused the AI to generate incorrect SQL or misinterpret the question?

EXTRACT:
1. **Category**: accuracy | clarity | completeness | schema_mapping | domain_knowledge
2. **Missing Knowledge**: What specific information about the database/domain is needed?
3. **Correct Mapping**: What is the correct way to map user's question to database fields?
4. **Policy Rule**: Write a clear instruction that tells future AI queries how to handle similar questions
5. **Priority**: high | medium | low (based on how common this issue is)
6. **Rationale**: Brief explanation of why this policy is needed
7. **Examples**: 2-3 example questions that this policy helps with

OUTPUT FORMAT (JSON):
{
  "category": "schema_mapping",
  "rule": "Khi user hỏi về 'X user' hoặc 'X người dùng', map to column 'total_users' in table 'systems', NOT 'user_field' or 'user_count'",
  "priority": "high",
  "rationale": "Users often ask about user counts but AI was querying wrong column name. Correct column is 'total_users'.",
  "examples": [
    "Có bao nhiêu hệ thống trên 1.000 user?",
    "Hệ thống nào có nhiều user nhất?",
    "Top 5 hệ thống theo số người dùng"
  ],
  "missing_knowledge": "Column name for user count is 'total_users', not 'user_field'",
  "correct_mapping": "user/người dùng → total_users column"
}

IF DUPLICATE (policy already exists covering this):
{
  "skip": true,
  "reason": "Existing policy already covers this: [Policy #5] maps user questions to total_users column",
  "suggestion": "No new policy needed"
}
```

#### Example: Checking Existing Policies

**Scenario 1: New Issue (Should Generate)**
```
Existing Policies:
1. [schema_mapping] Map "user/người dùng" → total_users column
2. [schema_mapping] Map "năm triển khai" → deployment_year column

New Feedback:
"AI trả lời sai khi hỏi về 'hệ thống chuyển đổi số'.
AI search tất cả systems, nhưng đúng phải filter theo digital_transformation_level."

Analysis:
✅ GENERATE NEW POLICY
- Issue: Domain knowledge about "chuyển đổi số" mapping
- Not covered by existing policies (they only cover user & year mappings)
- New policy: Map "chuyển đổi số" → digital_transformation_level filter
```

**Scenario 2: Duplicate (Should Skip)**
```
Existing Policies:
1. [schema_mapping] Map "user/người dùng" → total_users column
   Example: "Có bao nhiêu hệ thống trên 1.000 user?"

New Feedback:
"AI sai khi hỏi 'Top 5 hệ thống có nhiều user nhất'. AI query user_field thay vì total_users."

Analysis:
❌ SKIP - DUPLICATE
- Issue: Same as Policy #1 (user → total_users mapping)
- Policy #1 already covers this exact mapping
- Action: Update evidence_count on Policy #1, don't create new policy
```

**Scenario 3: Complementary (Should Generate)**
```
Existing Policies:
1. [schema_mapping] Map "user" → total_users column

New Feedback:
"AI trả lời đúng số lượng user, nhưng không biết distinguish giữa 'user active' vs 'total user'.
Khi hỏi về 'user đang hoạt động', cần filter thêm is_active=True."

Analysis:
✅ GENERATE NEW POLICY
- Issue: Distinction between active vs total users
- Complements Policy #1 (adds nuance, doesn't duplicate)
- New policy: When asking about "user đang hoạt động/active", filter by is_active=True
```

---

### 3. API Endpoints

#### POST /api/ai-feedback/ (Submit Feedback)
```python
# Request
{
  "query": "Bao nhiêu hệ thống có trên 1.000 user?",
  "mode": "deep",
  "response_data": { ... },  # Full AI response with steps
  "rating": "negative",
  "feedback_text": "AI trả lời sai! Thực tế có 3 hệ thống nhưng AI trả lời 0. Vấn đề: AI query cột 'user_field' nhưng đúng là 'total_users'"
}

# Response
{
  "id": 123,
  "message": "Đã ghi nhận phản hồi và tạo giải pháp tự động",
  "policy_generated": true,
  "policy_id": 456
}

# Backend Processing:
# 1. Save feedback
# 2. Check if has_policy = False
# 3. If False → Auto-generate policy asynchronously
# 4. Mark has_policy = True after successful generation
```

#### POST /api/ai-feedback/regenerate_policies/ (Manual Regeneration)
```python
# Request (no body needed)

# Response
{
  "message": "Đã tạo lại 15 policies từ 42 feedbacks tiêu cực",
  "policies_count": 15,
  "feedbacks_analyzed": 42,
  "timestamp": "2026-02-06T16:30:00Z",
  "policies": [
    {
      "category": "schema_mapping",
      "rule": "...",
      "priority": "high",
      "evidence_count": 3
    },
    ...
  ]
}

# Backend Processing:
# 1. Fetch ALL negative feedbacks (ignore has_policy flag)
# 2. Group by similar issues
# 3. Generate/regenerate policies for each group
# 4. Overwrite existing policies
# 5. Update all feedback.has_policy = True
```

#### GET /api/ai-feedback/active_policies/ (Get Policies for Injection)
```python
# Response
{
  "active_policies": [
    {
      "category": "schema_mapping",
      "rule": "Khi user hỏi về 'X user', map to 'total_users' column",
      "priority": "high",
      "rationale": "...",
      "examples": [...]
    },
    ...
  ],
  "total_policies": 15,
  "active_count": 15,
  "last_updated": "2026-02-06T16:30:00Z"
}

# Used by AI Assistant to inject into system prompt
```

---

### 4. System Prompt Injection

**Where:** AI Assistant's system prompt (before each query)

**Format:**
```
You are an AI Assistant for querying the system database.

DATABASE SCHEMA:
[Standard schema documentation]

IMPROVEMENT GUIDELINES:
Based on previous user feedback, follow these guidelines to improve accuracy:

1. [schema_mapping] [HIGH] Khi user hỏi về "X user" hoặc "X người dùng", map to column 'total_users' in table 'systems', NOT 'user_field' or 'user_count'
   Rationale: Users often ask about user counts but AI was querying wrong column. Correct column is 'total_users'.
   Examples: "Có bao nhiêu hệ thống trên 1.000 user?", "Hệ thống nào có nhiều user nhất?"

2. [accuracy] [HIGH] When filtering by deployment year, use 'deployment_year' column which stores integer year (e.g., 2024), not 'deployment_date'
   Rationale: Multiple queries failed because AI used deployment_date for year filtering instead of the dedicated year column.

3. [domain_knowledge] [MEDIUM] "Chuyển đổi số" means digital transformation - related to 'digital_transformation_level' field
   Rationale: Users asking about "hệ thống chuyển đổi số" should map to digital_transformation_level, not a generic search.

[Total: 15 policies active]

Now answer the user's question following these guidelines.
```

---

## 🔄 Deduplication Logic

### Problem: Avoid duplicate policy generation for same feedback

**Solution: `has_policy` flag**

```python
# When submitting feedback
if feedback.rating == 'negative' and not feedback.has_policy:
    # Auto-generate policy
    generate_policy_async(feedback.id)
    feedback.has_policy = True
    feedback.policy_generated_at = now()
    feedback.save()
```

### Handling Edge Cases

**Case 1: Policy generation fails**
```python
try:
    policy = generate_policy(feedback)
    save_policy(policy)
    feedback.has_policy = True
except Exception as e:
    feedback.has_policy = False  # Allow retry
    log_error(e)
```

**Case 2: Manual regeneration**
```python
# Ignore has_policy flag, regenerate all
def manual_regenerate():
    for feedback in Feedback.objects.filter(rating='negative'):
        policy = generate_policy(feedback)  # Even if has_policy=True
        save_or_update_policy(policy)
        feedback.has_policy = True
        feedback.policy_generated_at = now()
        feedback.save()
```

**Case 3: Feedback updated by user**
```python
# If user edits their feedback_text
def update_feedback(feedback_id, new_text):
    feedback.feedback_text = new_text
    feedback.has_policy = False  # Allow regeneration with new info
    feedback.save()

    # Auto-regenerate with updated context
    generate_policy_async(feedback_id)
```

---

## 🧪 Test Scenarios

### Test 1: Automatic Generation on Negative Feedback
```
1. User queries: "Bao nhiêu hệ thống có trên 1.000 user?"
2. AI answers: "0 hệ thống" (WRONG)
3. User rates: 👎
4. User adds feedback: "Sai! Thực tế có 3 hệ thống. AI query sai cột 'user_field', đúng là 'total_users'"
5. User clicks "Gửi feedback"
6. VERIFY:
   - ✅ Feedback saved with rating='negative'
   - ✅ Policy auto-generated within 5 seconds
   - ✅ feedback.has_policy = True
   - ✅ Policy contains correct mapping: "user/người dùng → total_users"
   - ✅ Policy priority = high (schema mapping issue)
7. Test same question again:
   - ✅ AI should now query "total_users" column
   - ✅ AI answers correctly: "3 hệ thống"
```

### Test 2: Manual Regeneration
```
1. Admin visits /ai-feedback page
2. Clicks "Tự động tạo giải pháp"
3. Confirms action
4. VERIFY:
   - ✅ Loading spinner shows
   - ✅ Success message: "Đã tạo lại X policies"
   - ✅ Policy count updates
   - ✅ ALL negative feedbacks have has_policy=True
   - ✅ Policy quality improved (if algorithm updated)
```

### Test 3: Deduplication
```
1. User submits negative feedback #1
2. VERIFY: Policy generated, has_policy=True
3. User submits SAME negative feedback #2 (same issue)
4. VERIFY:
   - ✅ No duplicate policy created
   - ✅ Existing policy evidence_count++
5. Manual regeneration
6. VERIFY:
   - ✅ Similar feedbacks grouped
   - ✅ Single policy with multiple examples
```

---

## 📈 Success Metrics

**Immediate (Technical):**
- ✅ 100% of negative feedbacks generate policies automatically
- ✅ < 5 seconds latency for policy generation
- ✅ No duplicate policies for same issue
- ✅ Policies contain correct schema mappings

**Short-term (1-2 weeks):**
- ✅ AI accuracy improves by 30% on previously failed queries
- ✅ Similar questions answered correctly after policy injection
- ✅ Reduced negative feedback rate from 20% → 10%

**Long-term (1-2 months):**
- ✅ AI learns domain-specific mappings automatically
- ✅ Self-improving system (more feedbacks → better policies → better answers)
- ✅ 90% user satisfaction rate

---

## 🚧 Implementation Status

### ✅ Completed
- [x] Basic feedback submission API
- [x] Manual policy regeneration button
- [x] Policy display in admin page
- [x] Policy injection into system prompt

### 🔨 In Progress
- [ ] Auto-generate on feedback submission
- [ ] `has_policy` flag and deduplication logic
- [ ] Rich context extraction (steps, SQL, results)
- [ ] AI analysis with full context
- [ ] Async policy generation

### 📋 Todo
- [ ] Schema information integration
- [ ] Similar feedback detection
- [ ] Policy quality metrics
- [ ] A/B testing framework
- [ ] Policy effectiveness tracking

---

## 🎓 Example: Complete Flow

### User Query: "Bao nhiêu hệ thống có trên 1.000 user?"

**Step 1: AI attempts to answer (WRONG)**
```
AI executes:
SELECT COUNT(*) FROM systems WHERE user_field > 1000
Result: 0

AI responds: "Có 0 hệ thống có trên 1.000 người dùng"
```

**Step 2: User rates negative + adds feedback**
```
Rating: 👎
Feedback: "Câu trả lời sai! Thực tế có 3 hệ thống (HT Văn bản: 5000 user,
Cổng thông tin: 3000 user, HT Tài sản: 1500 user).

Vấn đề: AI query cột 'user_field' nhưng trong database, cột đúng là 'total_users'.

Yêu cầu: Map 'user'/'người dùng' → 'total_users' column."
```

**Step 3: Auto-generate policy**
```
Backend receives feedback → triggers policy generation

AI Analyzer input:
{
  "question": "Bao nhiêu hệ thống có trên 1.000 user?",
  "answer": "0 hệ thống",
  "steps": [...],
  "sql": "SELECT COUNT(*) FROM systems WHERE user_field > 1000",
  "result": 0,
  "feedback": "Câu trả lời sai! ... Map 'user' → 'total_users'",
  "schema": {
    "systems": {
      "columns": ["id", "name", "total_users", "user_field", ...]
    }
  }
}

AI Analyzer output:
{
  "category": "schema_mapping",
  "rule": "Khi user hỏi về 'X user' hoặc 'X người dùng', luôn map to column 'total_users' của bảng systems. KHÔNG dùng 'user_field' hay 'user_count'.",
  "priority": "high",
  "rationale": "Column name mismatch causing zero results. Correct column is 'total_users' which stores actual user count per system.",
  "examples": [
    "Có bao nhiêu hệ thống trên 1.000 user?",
    "Hệ thống nào có nhiều user nhất?",
    "Top 5 systems theo số người dùng"
  ],
  "missing_knowledge": "Correct column name for user count is 'total_users' in systems table",
  "correct_mapping": "user/người dùng → systems.total_users (NOT user_field)"
}

Save policy → Mark feedback.has_policy = True
```

**Step 4: Next query uses the policy**
```
User asks again: "Bao nhiêu hệ thống có trên 1.000 user?"

AI's system prompt now includes:
"[schema_mapping] [HIGH] Khi user hỏi về 'X user', map to 'total_users' column in systems table"

AI executes:
SELECT COUNT(*) FROM systems WHERE total_users > 1000
Result: 3

AI responds: "Có 3 hệ thống có trên 1.000 người dùng:
1. Hệ thống quản lý văn bản - 5.000 user
2. Cổng thông tin điện tử - 3.000 user
3. Hệ thống quản lý tài sản - 1.500 user"

✅ CORRECT ANSWER!
```

---

## 🔧 Technical Notes

### Async Processing
```python
# Avoid blocking user feedback submission
@shared_task
def generate_policy_async(feedback_id):
    feedback = AIResponseFeedback.objects.get(id=feedback_id)

    if feedback.has_policy:
        return  # Already generated

    try:
        policy = generate_policy_from_feedback(feedback)
        save_policy(policy)

        feedback.has_policy = True
        feedback.policy_generated_at = timezone.now()
        feedback.save()

        logger.info(f"Auto-generated policy for feedback {feedback_id}")
    except Exception as e:
        logger.error(f"Failed to generate policy: {e}")
        # Retry later or notify admin
```

### Database Indexes
```sql
-- For fast lookup
CREATE INDEX idx_feedback_has_policy ON ai_response_feedback(has_policy);
CREATE INDEX idx_feedback_rating ON ai_response_feedback(rating);
CREATE INDEX idx_feedback_created ON ai_response_feedback(created_at);

-- For policy retrieval
CREATE INDEX idx_policy_priority ON improvement_policy(priority);
CREATE INDEX idx_policy_active ON improvement_policy(is_active);
```

---

**End of Spec**
