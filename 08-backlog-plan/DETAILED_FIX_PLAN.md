# Detailed Fix Implementation Plan
**Date**: 2026-02-03  
**Priority**: P0 CRITICAL  
**Estimated Time**: 2-3 days  
**Environment**: UAT → Production

---

## Overview

This plan addresses 2 critical P0 bugs preventing production deployment:
1. **Template Replacement Inconsistency** - 30% queries show placeholders
2. **Persistent Connection Errors** - 100% queries show error dialog

---

## Bug #1: Template Replacement Fix

### Problem Analysis
**Root Cause**: Quick mode and Deep mode use different template engines
- Quick mode: Simple/incomplete variable replacement
- Deep mode: Full template replacement with validation
- Empty results: Return variable names instead of "0"

**Affected Code**:
- Backend: `backend/apps/systems/views.py`
- Frontend: Response rendering components

### Fix Strategy

#### Option A: Unify Template Engine (RECOMMENDED)
Use the same template replacement logic for both modes.

**File**: `backend/apps/systems/views.py`

**Current Quick Mode** (~line 2080-2100):
```python
# Quick mode template replacement
quick_prompt = f"""Bạn là AI assistant phân tích dữ liệu CNTT.

{schema_context}

Câu hỏi: {query}

NHIỆM VỤ:
1. Tạo SQL query để lấy dữ liệu
2. Viết câu trả lời NGẮN GỌN (1-2 câu) với số liệu

Trả về JSON:
{{
    "sql": "SELECT query here",
    "answer": "Câu trả lời ngắn gọn với số liệu",
    "chart_type": "bar|pie|table|null"
}}
"""
```

**Problem**: AI returns answers with placeholders like "X hệ thống" or uses variable names in braces.

**Solution 1: Improve Quick Mode Prompt**
```python
quick_prompt = f"""Bạn là AI assistant phân tích dữ liệu CNTT.

{schema_context}

Câu hỏi: {query}

NHIỆM VỤ:
1. Tạo SQL query để lấy dữ liệu
2. Viết câu trả lời NGẮN GỌN (1-2 câu) với SỐ LIỆU THỰC TẾ

QUAN TRỌNG:
- KHÔNG dùng placeholder như "X", "{{{{variable}}}}", "<variable>"
- SỬ DỤNG số liệu thực tế từ query result
- VÍ DỤ TỐT: "Có 87 hệ thống đang vận hành"
- VÍ DỤ SAI: "Có X hệ thống đang vận hành"

Trả về JSON:
{{
    "sql": "SELECT COUNT(*) as count FROM ...",
    "answer": "Có [số thực tế] hệ thống đang vận hành",
    "chart_type": "bar|pie|table|null"
}}

Lưu ý: [số thực tế] sẽ được thay thế bằng giá trị từ SQL query.
"""
```

**Solution 2: Enhanced Template Replacement** (~line 2150-2180)
```python
def replace_template_vars(text, data):
    """Replace template variables with actual data from query result"""
    if not text:
        return text
    
    # Get first row for template replacement
    first_row = data.get('rows', [{}])[0] if data.get('rows') else {}
    
    # Replacement function that looks up value from data
    def replace_match(match):
        var_name = match.group(1)
        value = first_row.get(var_name)
        if value is not None:
            return str(value)
        # IMPORTANT: Return "0" for missing values, not the variable name
        logger.warning(f"Template variable {var_name} not found in data, using 0")
        return "0"  # Changed from: return match.group(0)
    
    import re
    # Replace all possible template patterns
    result = re.sub(r'\{\{(\w+)\}\}', replace_match, text)  # {{variable}}
    result = re.sub(r'\[(\w+)\]', replace_match, result)     # [variable]
    result = re.sub(r'\{(\w+)\}', replace_match, result)     # {variable}
    result = re.sub(r'<(\w+)>', replace_match, result)       # <variable>
    result = re.sub(r'\bX\b', lambda m: first_row.get('count', first_row.get('total', '0')), result)  # X placeholder
    
    return result
```

**Solution 3: Add Validation Before Sending**
```python
def validate_response_text(text):
    """Validate that no template variables remain in response"""
    import re
    
    # Check for common placeholder patterns
    patterns = [
        r'\{\{(\w+)\}\}',  # {{variable}}
        r'<(\w+)>',        # <variable>
        r'\[(\w+)\]',      # [variable]
        r'\b[A-Z_]+\b',    # ALL_CAPS variable names
        r'\bX\b'           # Standalone X
    ]
    
    for pattern in patterns:
        matches = re.findall(pattern, text)
        if matches:
            logger.error(f"Template validation failed: found {matches} in response")
            # Try to fix or return error
            return None
    
    return text

# Use in response generation
processed_answer = replace_template_vars(answer, query_result)
validated_answer = validate_response_text(processed_answer)

if not validated_answer:
    # Fallback to safe response
    count = query_result.get('rows', [{}])[0].get('count', 0)
    validated_answer = f"Tìm thấy {count} kết quả."
```

### Implementation Steps

**Step 1: Update Quick Mode Template Replacement** (Est: 2 hours)
1. Open `backend/apps/systems/views.py`
2. Find `def replace_template_vars` in quick mode section (~line 2139)
3. Update replacement logic with improved version above
4. Add validation function
5. Test with various query patterns

**Step 2: Improve AI Prompt** (Est: 1 hour)
1. Update quick_prompt template (~line 2080)
2. Add explicit instructions to avoid placeholders
3. Test AI responses

**Step 3: Add Backend Validation** (Est: 2 hours)
1. Add `validate_response_text()` function
2. Call before sending response to frontend
3. Add logging for validation failures
4. Implement fallback responses

**Step 4: Frontend Safety Check** (Est: 1 hour)
1. Open frontend AI response component
2. Add client-side validation before display
3. Show generic message if placeholders detected

**File**: `frontend/src/pages/StrategicDashboard.tsx` or similar

```typescript
// Before displaying response
const sanitizeResponse = (text: string): string => {
  // Check for common placeholder patterns
  const placeholderPatterns = [
    /\{\{(\w+)\}\}/g,
    /<(\w+)>/g,
    /\[(\w+)\]/g,
    /\bX\b/g
  ];
  
  let hasPlaceholders = false;
  for (const pattern of placeholderPatterns) {
    if (pattern.test(text)) {
      hasPlaceholders = true;
      console.error('Placeholder detected in response:', text);
      break;
    }
  }
  
  if (hasPlaceholders) {
    // Return safe fallback
    return 'Đã tìm thấy kết quả. Vui lòng xem dữ liệu bên dưới.';
  }
  
  return text;
};

// Use when rendering
<p>{sanitizeResponse(response.main_answer)}</p>
```

### Testing Checklist

After implementing fixes:
- [ ] Test: "Có bao nhiêu hệ thống?" → Should show "87"
- [ ] Test: "Tổng số hệ thống là bao nhiêu?" → Should show "87" not "X"
- [ ] Test: "Cho tôi biết số lượng hệ thống" → Should show "87"
- [ ] Test: "Có bao nhiêu hệ thống sử dụng COBOL?" → Should show "0" not "cobol_system_count"
- [ ] Test: Empty results queries → Should show "0" not variable names
- [ ] Check backend logs for validation warnings
- [ ] Verify Deep mode still works correctly

---

## Bug #2: Connection Error Dialog Fix

### Problem Analysis
**Root Cause**: EventSource connection not closed cleanly after completion
- Backend sends all events successfully
- Frontend receives 'complete' event
- EventSource then fires 'error' event with undefined
- Frontend shows error dialog

**Evidence**:
```javascript
[AI DEBUG] EventSource created
[AI DEBUG] phase_start event received
[AI DEBUG] phase_complete event received
[AI DEBUG] *** COMPLETE EVENT RECEIVED ***
[AI DEBUG] ERROR event received: undefined  ← Problem
[AI DEBUG] Setting aiQueryResponse state
```

### Fix Strategy

#### Option A: Frontend Fix - Suppress Error After Completion (RECOMMENDED)

**File**: `frontend/src/pages/StrategicDashboard.tsx` or AI query handler

**Current Code** (approximate):
```typescript
const eventSource = new EventSource(url);

eventSource.addEventListener('complete', (event) => {
  const result = JSON.parse(event.data);
  setAiQueryResponse(result);
  setAiQueryLoading(false);
  eventSource.close();
});

eventSource.onerror = (error) => {
  console.error('EventSource error:', error);
  setError('Lỗi kết nối đến máy chủ');
  showErrorDialog();
  eventSource.close();
};
```

**Problem**: 
- 'complete' event closes EventSource
- Browser fires 'error' event when connection closes
- Error handler shows dialog even though query succeeded

**Solution**:
```typescript
const handleAIQuery = (query: string, mode: string) => {
  const url = `${API_URL}/systems/ai-query-stream/?query=${encodeURIComponent(query)}&mode=${mode}&token=${token}`;
  
  const eventSource = new EventSource(url);
  let queryCompleted = false;  // Track completion state
  
  eventSource.addEventListener('phase_start', (event) => {
    const data = JSON.parse(event.data);
    console.log('[AI DEBUG] phase_start event received:', data);
    // Update progress UI
  });
  
  eventSource.addEventListener('phase_complete', (event) => {
    const data = JSON.parse(event.data);
    console.log('[AI DEBUG] phase_complete event received:', data);
    // Update progress UI
  });
  
  eventSource.addEventListener('complete', (event) => {
    console.log('[AI DEBUG] *** COMPLETE EVENT RECEIVED ***');
    queryCompleted = true;  // Mark as completed
    
    const result = JSON.parse(event.data);
    setAiQueryResponse(result);
    setAiQueryLoading(false);
    
    // Close EventSource immediately to prevent error event
    eventSource.close();
  });
  
  eventSource.onerror = (error) => {
    console.log('[AI DEBUG] ERROR event received:', error);
    
    // CRITICAL: Only show error if query didn't complete successfully
    if (!queryCompleted) {
      console.error('Real EventSource error:', error);
      setError('Lỗi kết nối đến máy chủ. Vui lòng thử lại.');
      showErrorDialog({
        title: 'Lỗi kết nối',
        message: 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng và thử lại.'
      });
    } else {
      // Query completed successfully, ignore this error
      console.log('[AI DEBUG] Ignoring error event after successful completion');
    }
    
    eventSource.close();
    setAiQueryLoading(false);
  };
  
  // Set timeout for queries that take too long
  const timeout = setTimeout(() => {
    if (!queryCompleted) {
      console.error('[AI DEBUG] Query timeout');
      eventSource.close();
      setError('Truy vấn mất quá nhiều thời gian. Vui lòng thử lại.');
      showErrorDialog({
        title: 'Timeout',
        message: 'Truy vấn mất quá nhiều thời gian. Vui lòng thử lại câu hỏi khác.'
      });
    }
  }, 60000); // 60 second timeout
  
  // Clear timeout when complete
  eventSource.addEventListener('complete', () => clearTimeout(timeout));
};
```

#### Option B: Backend Fix - Send Explicit Close Event

**File**: `backend/apps/systems/views.py`

**Current Code** (~line 2200):
```python
# Final result
yield f"event: complete\ndata: {json.dumps(final_response)}\n\n"

response = StreamingHttpResponse(event_stream(), content_type='text/event-stream')
```

**Enhanced Version**:
```python
# Final result
yield f"event: complete\ndata: {json.dumps(final_response)}\n\n"

# Send explicit close signal
yield f"event: close\ndata: {json.dumps({'status': 'done'})}\n\n"

# Close the connection cleanly
return

response = StreamingHttpResponse(event_stream(), content_type='text/event-stream')
response['Connection'] = 'close'  # Explicitly close connection
```

**Frontend Handler**:
```typescript
eventSource.addEventListener('close', (event) => {
  console.log('[AI DEBUG] Close event received');
  queryCompleted = true;
  eventSource.close();
});
```

### Implementation Steps

**Step 1: Frontend Fix** (Est: 1 hour)
1. Locate AI query handler in frontend
   ```bash
   cd frontend
   grep -r "EventSource" src/
   grep -r "ai-query-stream" src/
   ```

2. Add `queryCompleted` flag
3. Update error handler to check flag
4. Test error suppression

**Step 2: Add Timeout Handling** (Est: 30 minutes)
1. Add 60-second timeout
2. Show appropriate timeout message
3. Test with slow queries

**Step 3: Backend Enhancement** (Optional, Est: 30 minutes)
1. Add explicit 'close' event
2. Set Connection: close header
3. Test EventSource closure

**Step 4: Improve Error Messages** (Est: 30 minutes)
1. Differentiate between real errors and completion
2. Add more specific error messages
3. Log errors for debugging

### Testing Checklist

After implementing fixes:
- [ ] Submit any query → No error dialog appears ✓
- [ ] Quick mode query → Completes without error ✓
- [ ] Deep mode query → Completes without error ✓
- [ ] Network disconnection → Shows appropriate error ✓
- [ ] Backend down → Shows appropriate error ✓
- [ ] Slow query → Timeout shows appropriate message ✓
- [ ] Check console logs → No error after successful completion ✓

---

## Deployment Plan

### Phase 1: Local Testing (Est: 4 hours)
1. Set up local development environment
2. Apply all fixes
3. Run comprehensive tests
4. Verify all bugs resolved
5. Document any issues found

### Phase 2: UAT Deployment (Est: 2 hours)
1. Backup current UAT code
2. Deploy fixes to UAT
3. Restart backend services
4. Clear frontend build cache
5. Rebuild frontend

**Commands**:
```bash
# SSH to UAT server
ssh admin_@34.142.152.104

cd /home/admin_/apps/thong-ke-he-thong-uat

# Backup
cp backend/apps/systems/views.py backend/apps/systems/views.py.backup.$(date +%Y%m%d)

# Apply backend fixes
# (Edit views.py with fixes)

# Restart backend
docker compose restart backend

# Frontend fixes
# (Edit frontend files)

# Rebuild frontend
docker builder prune -af
DOCKER_BUILDKIT=0 docker compose build frontend --no-cache
docker compose up -d frontend
```

### Phase 3: UAT Verification (Est: 2 hours)
1. Run all test cases from previous testing
2. Verify Bug #1 fixed (no placeholders)
3. Verify Bug #2 fixed (no error dialogs)
4. Test edge cases
5. Performance testing
6. Document results

### Phase 4: Production Deployment (Est: 2 hours)
1. Get approval from stakeholders
2. Schedule deployment window
3. Deploy to production
4. Monitor for issues
5. Rollback plan ready

---

## Rollback Plan

If issues found after deployment:

**Quick Rollback**:
```bash
# Restore backup
cp backend/apps/systems/views.py.backup.YYYYMMDD backend/apps/systems/views.py
docker compose restart backend

# Restore frontend
git checkout HEAD~1 frontend/
docker compose build frontend --no-cache
docker compose up -d frontend
```

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| New bugs introduced | Low | High | Comprehensive testing before deploy |
| Performance degradation | Very Low | Medium | Monitor response times |
| Template fix breaks Deep mode | Low | High | Test both modes thoroughly |
| Error suppression hides real errors | Medium | High | Add timeout, log all errors |

---

## Success Criteria

### Bug #1 Fix Success
- [ ] 0% queries show placeholders
- [ ] Empty results show "0" not variable names
- [ ] All query patterns work consistently
- [ ] Deep mode still works perfectly

### Bug #2 Fix Success
- [ ] 0% queries show connection error dialog
- [ ] Real errors still show appropriate messages
- [ ] Timeout works correctly
- [ ] Logs are clean

### Overall Success
- [ ] 100% test pass rate
- [ ] No regressions in existing features
- [ ] User feedback positive
- [ ] Ready for production deployment

---

## Timeline

| Day | Tasks | Owner |
|-----|-------|-------|
| Day 1 AM | Implement Bug #1 fixes (backend) | Dev Team |
| Day 1 PM | Implement Bug #2 fixes (frontend) | Dev Team |
| Day 2 AM | Local testing, bug fixes | QA + Dev |
| Day 2 PM | Deploy to UAT | DevOps |
| Day 3 AM | UAT verification testing | QA Team |
| Day 3 PM | Production deployment (if approved) | DevOps |

**Total Estimated Time**: 2-3 days

---

## Post-Deployment

### Monitoring
1. Track error rates in logs
2. Monitor response times
3. Watch for template validation failures
4. User feedback collection

### Documentation
1. Update API documentation
2. Update user guide if needed
3. Document lessons learned
4. Update test cases

---

## Contact & Escalation

**Questions**: Contact development team  
**Issues During Deployment**: Rollback immediately  
**User Reports**: Log and investigate priority based on severity

---

**Plan Version**: 1.0  
**Last Updated**: 2026-02-03  
**Status**: Ready for Implementation
