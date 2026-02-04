# Backlog: AI Deep Mode Progress Display Bug

**Date Created:** 2026-02-04
**Priority:** P1 - High (affects user experience and debugging capability)
**Status:** 🔴 Not Started
**Reporter:** User
**Environment:** UAT (https://hientrangcds.mindmaid.ai)

---

## 🐛 Bug Description

**Vietnamese:**
"Khi hỏi ở chế độ Phân tích sâu, trong quá trình generate câu trả lời thì phần AI Phân tích hiển thị đúng, chuẩn, với 4-5 bước và thông tin chi tiết. Tuy nhiên sau khi có câu trả lời, thì phần hiển thị ra của AI Phân tích lại bị chuyển thành giống như AI phân tích của quick mode, dẫn đến toàn bộ thông tin debug là bị mất hết."

**English Translation:**
When asking in Deep Analysis mode, during the generation process, the "AI Analysis" section displays correctly with 4-5 detailed steps and information. However, after the answer is complete, the displayed "AI Analysis" section changes to look like the Quick mode analysis, causing all debug information to be lost.

---

## 📊 Impact

**Severity:** High
- **User Impact:** Users cannot review the detailed analysis steps after completion
- **Debug Impact:** Developers/QA cannot see what SQL, thinking, or data was used
- **Trust Impact:** Makes Deep mode less transparent and trustworthy

**Affected Components:**
- Frontend: `StrategicDashboard.tsx` - Progress rendering logic
- State Management: `conversationHistory` and `progressTasks`

---

## 🔍 Root Cause Analysis

### Expected Behavior (DURING generation):
```
AI PHÂN TÍCH (2/5)
├─ ✓ Phase 1: Phân tích câu hỏi
│  └─ Thinking: "User hỏi về số lượng hệ thống..."
│  └─ SQL: SELECT COUNT(*) FROM systems WHERE...
│
├─ ⏳ Phase 2: Truy vấn dữ liệu (In Progress)
│  └─ Đang thực thi SQL query...
```

### Actual Behavior (AFTER completion):
```
AI PHÂN TÍCH (2/2)  ← Only 2 phases shown instead of 5!
├─ ✓ Phân tích nhanh
│  └─ Đang tạo câu trả lời...  ← Generic message, no details
│
├─ ✓ Completed
│  └─ No SQL, no thinking, no data shown ❌
```

### Technical Root Cause:

The bug occurs at line **847-877** in `StrategicDashboard.tsx`:

```typescript
// When SSE completes, update the placeholder conversation
setConversationHistory(prev => {
  const updated = [...prev];
  if (updated[pendingConversationIndex]) {
    updated[pendingConversationIndex] = {
      query: currentQuery,
      response: data,
      timestamp: Date.now(),
      progressTasks: [...aiProgressTasks]  // ← SAVES progress tasks
    };
  }
  return updated;
});
```

But then at line **2161-2165**, when rendering:

```typescript
const conversationProgressTasks = (conv as any).progressTasks ||
  (idx === conversationHistory.length - 1 ? aiProgressTasks : []);
```

**The Problem:**
When the response completes, `aiProgressTasks` is NOT cleared. On the NEXT render cycle after state update, if there's any timing issue or the state doesn't update atomically, the rendering might pick up a DIFFERENT set of tasks from the global `aiProgressTasks` state instead of the saved `conv.progressTasks`.

**Alternative Problem:**
The `aiProgressTasks` state might be getting RESET or MODIFIED after the conversation is saved, causing the saved `progressTasks` to reference stale data or simplified data.

---

## 🎯 Acceptance Criteria

**Must Have:**
- [ ] Deep mode progress tasks (all 4-5 phases) persist after conversation completes
- [ ] Each phase shows full details: thinking, SQL, query results, analysis
- [ ] Progress section can be collapsed/expanded after completion
- [ ] Debug information (SQL queries, row counts, etc.) remains visible

**Should Have:**
- [ ] Consistent progress display between "in progress" and "completed" states
- [ ] No data loss when switching between conversations
- [ ] Progress tasks stored immutably (deep copy, not reference)

**Nice to Have:**
- [ ] Ability to export progress log for debugging
- [ ] Visual indicator showing which mode was used (Quick vs Deep)

---

## 💡 Proposed Solution

### Option 1: Deep Copy Progress Tasks (Recommended)
**Pros:** Simple, reliable, no timing issues
**Cons:** Slightly more memory usage

```typescript
// When saving conversation, deep copy the progress tasks
progressTasks: JSON.parse(JSON.stringify(aiProgressTasks))
```

### Option 2: Freeze Progress at Completion
**Pros:** Prevents accidental mutations
**Cons:** Requires careful state management

```typescript
// Mark progress as frozen when conversation completes
progressTasks: aiProgressTasks.map(t => ({ ...t, frozen: true }))
```

### Option 3: Separate Progress State per Conversation
**Pros:** Complete isolation, no shared state issues
**Cons:** More complex state structure

```typescript
// Store progress keyed by conversation ID
const [conversationProgressMap, setConversationProgressMap] = useState<Map<number, Task[]>>(new Map());
```

**Recommended: Option 1** - Simple deep copy ensures data integrity

---

## 🔧 Implementation Plan

### Phase 1: Fix State Persistence (30 min)
**File:** `frontend/src/pages/StrategicDashboard.tsx`

1. **Deep copy progress tasks when saving** (Line ~870)
   ```typescript
   progressTasks: JSON.parse(JSON.stringify(aiProgressTasks))
   ```

2. **Clear global progress after save** (Line ~877)
   ```typescript
   setAiProgressTasks([]); // Clear to prevent reuse
   ```

3. **Add defensive check in rendering** (Line ~2161)
   ```typescript
   const conversationProgressTasks = conv.progressTasks?.length
     ? conv.progressTasks
     : (idx === conversationHistory.length - 1 ? aiProgressTasks : []);
   ```

### Phase 2: Verify Data Integrity (15 min)

4. **Add console logging for debugging**
   ```typescript
   console.log('[DEBUG] Saving progress tasks:', aiProgressTasks.length, 'tasks');
   console.log('[DEBUG] Rendering conv', idx, 'with', conversationProgressTasks.length, 'tasks');
   ```

5. **Test scenarios:**
   - Ask Deep mode question → Check progress during generation ✓
   - Wait for completion → Check progress still shows all phases ✓
   - Ask second question → Check first conversation progress unchanged ✓
   - Scroll back to first → Check all debug info still visible ✓

### Phase 3: Add Type Safety (10 min)

6. **Update TypeScript interface** (Line ~500)
   ```typescript
   const [conversationHistory, setConversationHistory] = useState<Array<{
     query: string;
     response: AIQueryResponse;
     timestamp: number;
     progressTasks?: ProgressTask[]; // Add proper typing
   }>>([]);
   ```

7. **Define ProgressTask interface**
   ```typescript
   interface ProgressTask {
     id: number;
     name: string;
     description: string;
     status: 'in_progress' | 'completed';
     startTime?: number;
     endTime?: number;
     duration?: string;
     thinking?: string;
     sql?: string;
     sqlPreview?: string;
     dataAnalysis?: string;
     resultCount?: number;
     sampleRows?: any[];
     columns?: string[];
     // ... other fields
   }
   ```

---

## 🧪 Testing Checklist

**Manual Testing:**
- [ ] Open Deep mode
- [ ] Ask: "Phân tích chi tiết về các hệ thống đang vận hành"
- [ ] During generation: Verify all 5 phases show up with details
- [ ] After completion: Verify all 5 phases STILL show with same details
- [ ] Collapse/expand "AI PHÂN TÍCH" → Verify details preserved
- [ ] Ask second Deep question → Verify first conversation progress unchanged
- [ ] Refresh page → Verify progress lost (expected - no persistence yet)

**Automated Testing (Optional):**
- [ ] Unit test for deep copy function
- [ ] Integration test for conversation state updates
- [ ] Visual regression test for progress section

---

## 📝 Notes

### Why This Matters:
Deep mode is expensive (4-5 AI calls, longer processing time). Users need to see the detailed analysis to:
1. Understand WHY the AI gave that answer
2. Debug if answer seems wrong
3. Trust the AI's reasoning
4. Learn from the SQL queries generated

Without persistent progress display, Deep mode loses its primary value proposition: **transparency and explainability**.

### Related Issues:
- #1: Conversation history disappearing (FIXED - commit `4c1fa42`)
- #2: UI not simplifying after first query (FIXED - commit `bd9eb6c`)
- This bug: Progress tasks changing after completion (NOT FIXED)

### Alternative Workarounds:
If proper fix is not feasible immediately, consider:
1. Add "Export Progress Log" button to save debug info before it disappears
2. Send progress data to backend for persistence
3. Add localStorage backup of progress tasks

---

## 🚀 Deployment Strategy

**Testing Environment:** UAT first
**Rollback Plan:** Revert commit if progress display breaks
**Success Metrics:**
- Zero reports of "lost debug information" after Deep mode queries
- User feedback: "Deep mode analysis is helpful and transparent"

---

## 📚 References

**Related Files:**
- `frontend/src/pages/StrategicDashboard.tsx` (lines 847-877, 2161-2165)
- `backend/apps/systems/views.py` (Deep mode SSE stream)

**Related Commits:**
- `b9f688c` - Show question immediately in chat
- `4c1fa42` - Each conversation has own progress section

**Documentation:**
- `AI_ASSISTANT_QUESTION_DISPLAY_IMPROVEMENT.md`
- `AI_ASSISTANT_UX_IMPROVEMENTS_DEPLOYMENT.md`

---

**Status Updates:**
- [ ] 2026-02-04: Bug reported, backlog created
- [ ] TBD: Implementation started
- [ ] TBD: Testing completed
- [ ] TBD: Deployed to UAT
- [ ] TBD: User acceptance

---

**Assignee:** TBD
**Estimated Effort:** 1 hour (30 min fix + 15 min test + 15 min deploy)
**Actual Effort:** TBD
