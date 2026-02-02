# AI Assistant Speed Improvement Proposal

## Current State Analysis

### Current Workflow (4 Phases with SSE Streaming)
```
User Query
    │
    ▼
┌─────────────────────────────────────────────────────────┐
│ Phase 1: SQL Generation (~3-5s)                         │
│ - Call AI (GPT-5/Claude) to generate SQL                │
│ - Parse JSON response                                   │
│ - Extract thinking, sql_query, chart_type               │
└─────────────────────────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────────────────────────┐
│ Phase 1.5: Smart Data Details (~3-5s)                   │
│ - ONLY for complex queries (GROUP BY, JOIN, etc)       │
│ - Call AI to enhance SQL with more context             │
│ - Add JOIN to organizations, security, etc             │
└─────────────────────────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────────────────────────┐
│ Phase 2: Execute SQL (~0.5-1s)                          │
│ - Validate and execute SQL on database                 │
│ - Return result with columns and rows                  │
└─────────────────────────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────────────────────────┐
│ Phase 3: Generate Response (~3-5s)                      │
│ - Call AI to generate executive-style report           │
│ - Include strategic_insight, recommended_action        │
│ - Add follow_up_suggestions                            │
└─────────────────────────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────────────────────────┐
│ Phase 4: Self-Review (~2-3s)                            │
│ - Call AI to verify response matches data              │
│ - Check consistency                                     │
└─────────────────────────────────────────────────────────┘

TOTAL: ~12-20 seconds per query
```

### Bottlenecks Identified

| Phase | Time | Issue | Impact |
|-------|------|-------|--------|
| **Phase 1** | 3-5s | AI call for SQL generation | Necessary but could be faster |
| **Phase 1.5** | 3-5s | Additional AI call for enhancement | Often unnecessary for simple queries |
| **Phase 2** | 0.5-1s | SQL execution | Fast, minimal impact |
| **Phase 3** | 3-5s | AI call for report generation | Could be optional for quick answers |
| **Phase 4** | 2-3s | AI call for review | Often unnecessary, adds latency |

### User Feedback
> "Speed hoạt động hơi chậm" - User cảm thấy phải đợi 12-20s cho mỗi câu hỏi là quá lâu.

---

## Proposed Solution: Dual Workflow

### Quick Answer Mode (Fast Path)
```
User Query
    │
    ▼
┌─────────────────────────────────────────────────────────┐
│ Quick Mode: Single AI Call + SQL (~4-6s total)         │
│                                                         │
│ 1. Call AI with combined prompt:                       │
│    - Generate SQL                                       │
│    - Return simple answer format                       │
│                                                         │
│ 2. Execute SQL                                          │
│                                                         │
│ 3. Stream back:                                         │
│    - Direct answer                                      │
│    - Raw data table                                     │
│    - NO strategic insights                              │
│    - NO recommendations                                 │
│    - NO review phase                                    │
└─────────────────────────────────────────────────────────┘

TIME SAVINGS: ~50-60% faster
```

### Deep Analysis Mode (Quality Path)
```
User Query
    │
    ▼
┌─────────────────────────────────────────────────────────┐
│ Deep Mode: Full 4-Phase Workflow (~12-20s)            │
│                                                         │
│ 1. SQL Generation (Phase 1)                           │
│ 2. Data Enhancement (Phase 1.5)                       │
│ 3. SQL Execution (Phase 2)                            │
│ 4. Report Generation (Phase 3)                        │
│    - Strategic insights                                │
│    - Recommended actions                               │
│    - Follow-up suggestions                            │
│ 5. Self-Review (Phase 4)                              │
│                                                         │
│ Output: Full executive-style strategic report         │
└─────────────────────────────────────────────────────────┘
```

---

## UI Changes

### Frontend: StrategicDashboard.tsx

```tsx
// Add mode selector before AI input
<div className="ai-mode-selector">
  <Radio.Group value={aiMode} onChange={(e) => setAiMode(e.target.value)}>
    <Radio value="quick">
      <Space>
        <ThunderboltOutlined />
        <span>Hỏi đáp nhanh</span>
        <Tag color="green">4-6s</Tag>
      </Space>
    </Radio>
    <Radio value="deep">
      <Space>
        <FileTextOutlined />
        <span>Phân tích chuyên sâu</span>
        <Tag color="blue">12-20s</Tag>
      </Space>
    </Radio>
  </Radio.Group>
</div>

// Update query hints based on mode
{aiMode === 'quick' && (
  <Alert
    message="Chế độ nhanh: Trả lời trực tiếp, phù hợp câu hỏi đơn giản"
    description="Ví dụ: Có bao nhiêu hệ thống? Những hệ thống nào dùng Java?"
    type="info"
    showIcon
  />
)}
{aiMode === 'deep' && (
  <Alert
    message="Chế độ chuyên sâu: Báo cáo chiến lược với đề xuất hành động"
    description="Ví dụ: Đánh giá rủi ro bảo mật? Lộ trình chuyển đổi số?"
    type="info"
    showIcon
  />
)}
```

---

## Backend Changes

### New Endpoint: `/api/systems/ai_query_stream/`

Add `mode` parameter (default: `deep`):

```python
@action(detail=False, methods=['get'], renderer_classes=[EventStreamRenderer])
def ai_query_stream(self, request):
    query = request.query_params.get('query', '').strip()
    mode = request.query_params.get('mode', 'deep')  # 'quick' or 'deep'

    if mode == 'quick':
        return self._quick_answer_stream(query)
    else:
        return self._deep_analysis_stream(query)


def _quick_answer_stream(self, query):
    """Fast path: Single AI call + direct answer"""

    # Combined prompt: SQL + simple answer
    quick_prompt = f"""Bạn là AI assistant phân tích dữ liệu CNTT.

{schema_context}

Câu hỏi: {query}

NHIỆM VỤ:
1. Tạo SQL query để lấy dữ liệu
2. Viết câu trả lời NGẮN GỌN (1-2 câu)

Trả về JSON:
{{
    "sql": "SELECT query",
    "answer": "Câu trả lời ngắn gọn với số liệu",
    "chart_type": "bar|pie|table|null"
}}

CHỈ trả về JSON."""

    yield f"event: phase_start\ndata: {json.dumps({'phase': 1, 'name': 'Phân tích nhanh'})}\n\n"

    # Single AI call
    content = call_ai_internal(quick_prompt, [{'role': 'user', 'content': query}])

    json_match = re.search(r'\{[\s\S]*\}', content)
    if json_match:
        data = json.loads(json_match.group())
        sql = data.get('sql')
        answer = data.get('answer')
        chart_type = data.get('chart_type')
    else:
        yield f"event: error\ndata: {json.dumps({'error': 'Không thể xử lý'})}\n\n"
        return

    # Execute SQL
    query_result, sql_error = validate_and_execute_sql_internal(sql)
    if query_result is None:
        yield f"event: error\ndata: {json.dumps({'error': sql_error})}\n\n"
        return

    # Stream result immediately
    final = {
        'query': query,
        'response': {
            'greeting': '',
            'main_answer': answer,
            'follow_up_suggestions': [
                'Xem chi tiết dữ liệu',
                'Phân tích sâu với chế độ chuyên sâu'
            ]
        },
        'data': query_result,
        'chart_type': chart_type,
        'mode': 'quick'
    }

    yield f"event: complete\ndata: {json.dumps(final, ensure_ascii=False, default=str)}\n\n"


def _deep_analysis_stream(self, query):
    """Quality path: Full 4-phase workflow (existing logic)"""
    # ... existing ai_query_stream logic ...
    final['mode'] = 'deep'
    return event_stream()
```

---

## Technical Improvements

### 1. Phase 1.5 Optimization
Current: Runs AI call for ANY complex query
Proposed: Pre-compute common JOIN patterns

```python
# Instead of AI call, use pre-defined enhancement patterns
ENHANCEMENT_PATTERNS = {
    'has_org': lambda sql: add_org_join_if_missing(sql),
    'has_security': lambda sql: add_security_join_if_needed(sql),
    'has_assessment': lambda sql: add_assessment_join_if_needed(sql),
}

def enhance_sql_fast(sql_query, query_result):
    """Fast path SQL enhancement without AI call"""
    enhanced = sql_query

    # Check what columns are needed
    needed = analyze_query_needs(query_result)

    if 'organization' in needed:
        enhanced = add_org_join(enhanced)
    if 'security' in needed:
        enhanced = add_security_join(enhanced)

    return enhanced
```

### 2. Phase 4 Elimination
Current: Always runs self-review
Proposed: Skip for quick mode, probabilistic for deep mode

```python
# Only run review 20% of the time for quality sampling
if mode == 'deep' and random.random() < 0.2:
    # Run review
else:
    # Skip review, assume consistent
```

### 3. Caching Strategy
```python
from django.core.cache import cache

def cache_key_for_query(query):
    import hashlib
    return f"ai_query:{hashlib.md5(query.encode()).hexdigest()}"

def _quick_answer_stream(self, query):
    # Check cache first
    cache_key = cache_key_for_query(query)
    cached = cache.get(cache_key)
    if cached:
        yield f"event: complete\ndata: {json.dumps(cached)}\n\n"
        return

    # ... process query ...

    # Cache result for 5 minutes
    cache.set(cache_key, final, 300)
```

---

## Expected Results

| Metric | Current | Quick Mode | Deep Mode |
|--------|---------|------------|-----------|
| **Avg Response Time** | 12-20s | 4-6s | 12-20s (unchanged) |
| **AI Calls** | 3-4 | 1 | 3-4 |
| **User Satisfaction** | Low (too slow) | High (fast) | High (quality) |

### Usage Projection
Based on typical query patterns:
- **60-70% queries**: Simple counts, lookups → Use Quick Mode
- **30-40% queries**: Strategic decisions → Use Deep Mode

**Overall improvement**: ~50% reduction in average response time

---

## Implementation Plan

### Phase 1: Backend (Week 1)
1. Add `mode` parameter to `ai_query_stream`
2. Implement `_quick_answer_stream`
3. Refactor existing logic to `_deep_analysis_stream`
4. Add caching layer

### Phase 2: Frontend (Week 2)
1. Add mode selector UI
2. Update SSE event handling for both modes
3. Add mode-specific loading states
4. Update progress indicators

### Phase 3: Testing (Week 3)
1. Unit tests for quick mode
2. Integration tests for mode switching
3. Performance testing
4. User acceptance testing

### Phase 4: Deployment (Week 4)
1. Gradual rollout (10% → 50% → 100%)
2. Monitor usage patterns
3. A/B test response times
4. Gather user feedback

---

## Open Questions

1. **Default Mode**: Should default be `quick` or `deep`?
   - Recommendation: `quick` for faster perceived performance

2. **Mode Auto-Detection**: Can we auto-select mode based on query?
   - Use keywords: "bao nhiêu", "có những hệ thống nào" → quick
   - Use keywords: "đánh giá", "phân tích", "chiến lược" → deep

3. **Progressive Enhancement**: Show quick result first, then deep analysis?
   - Risk: Confusing UX with two responses

4. **Cost Implications**: Quick mode reduces AI calls by ~60-70%
   - Estimate: $X/month savings
