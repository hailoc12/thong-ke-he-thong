# Implementation Notes: Fix Deep Mode Progress Display Bug

**Date:** 2026-02-04
**Bug:** Progress tasks in Deep mode revert to Quick mode display after completion
**Target File:** `frontend/src/pages/StrategicDashboard.tsx`

---

## 🎯 Quick Summary

**Problem:** When Deep mode conversation completes, the detailed progress (5 phases with SQL, thinking, data) disappears and gets replaced with simplified 2-phase Quick mode display.

**Solution:** Deep copy progress tasks when saving to conversationHistory, clear global state, and add defensive rendering logic.

**Estimated Time:** 30 minutes

---

## 📍 Code Changes Required

### Change #1: Deep Copy Progress Tasks (Line ~870)

**Location:** Inside the SSE `complete` event handler, where conversation is saved

**Find this code:**
```typescript
setConversationHistory(prev => {
  const updated = [...prev];
  if (updated[pendingConversationIndex]) {
    updated[pendingConversationIndex] = {
      query: currentQuery,
      response: data,
      timestamp: Date.now(),
      progressTasks: [...aiProgressTasks]  // ← PROBLEM: Shallow copy
    };
  }
  return updated;
});
```

**Replace with:**
```typescript
setConversationHistory(prev => {
  const updated = [...prev];
  if (updated[pendingConversationIndex]) {
    // Deep copy progress tasks to prevent mutation
    const savedProgressTasks = JSON.parse(JSON.stringify(aiProgressTasks));

    updated[pendingConversationIndex] = {
      query: currentQuery,
      response: data,
      timestamp: Date.now(),
      progressTasks: savedProgressTasks  // ← FIXED: Deep copy
    };

    console.log('[SAVE] Conversation', pendingConversationIndex, 'saved with', savedProgressTasks.length, 'progress tasks');
  }
  return updated;
});
```

---

### Change #2: Clear Global Progress After Save (Line ~880)

**Location:** Right after saving conversation, before closing EventSource

**Add this code:**
```typescript
// Clear global progress tasks to prevent reuse in next conversation
setAiProgressTasks([]);
console.log('[CLEAR] Global progress tasks cleared');
```

**Full context:**
```typescript
setConversationHistory(prev => {
  // ... save logic ...
});

// Clear global progress to prevent contamination
setAiProgressTasks([]);

// Close EventSource
eventSource.close();
```

---

### Change #3: Defensive Rendering Logic (Line ~2161)

**Location:** Inside `conversationHistory.map()` where progress tasks are retrieved

**Find this code:**
```typescript
const conversationProgressTasks = (conv as any).progressTasks ||
  (idx === conversationHistory.length - 1 ? aiProgressTasks : []);
```

**Replace with:**
```typescript
// Get progress tasks for this conversation
// Priority: saved progressTasks > current aiProgressTasks (if last conv) > empty
const conversationProgressTasks = (() => {
  // If conversation has saved progress tasks, use them
  if (conv.progressTasks && conv.progressTasks.length > 0) {
    console.log('[RENDER] Conv', idx, 'using saved', conv.progressTasks.length, 'tasks');
    return conv.progressTasks;
  }

  // If this is the current (last) conversation, use global progress
  if (idx === conversationHistory.length - 1) {
    console.log('[RENDER] Conv', idx, 'using global', aiProgressTasks.length, 'tasks');
    return aiProgressTasks;
  }

  // Otherwise, no progress to show
  console.log('[RENDER] Conv', idx, 'has no progress tasks');
  return [];
})();
```

---

### Change #4: Add TypeScript Interface (Line ~500)

**Location:** Where conversationHistory state is defined

**Find this code:**
```typescript
const [conversationHistory, setConversationHistory] = useState<Array<{
  query: string;
  response: AIQueryResponse;
  timestamp: number;
  progressTasks?: Array<any>; // ← Weak typing
}>>([]);
```

**Replace with:**
```typescript
// Define progress task interface for type safety
interface ProgressTask {
  id: number;
  name: string;
  description: string;
  status: 'in_progress' | 'completed';
  startTime?: number;
  endTime?: number;
  duration?: string;

  // Phase-specific data
  thinking?: string;
  sql?: string;
  sqlPreview?: string;

  // Data phase
  dataAnalysis?: string;
  enhanced?: boolean;
  addedInfo?: string[];
  resultCount?: number;
  sampleRows?: any[];
  columns?: string[];

  // Review phase
  reviewPassed?: boolean;
}

const [conversationHistory, setConversationHistory] = useState<Array<{
  query: string;
  response: AIQueryResponse;
  timestamp: number;
  progressTasks?: ProgressTask[]; // ← Strong typing
}>>([]);
```

---

### Change #5: Add Debug Mode Toggle (Optional - Line ~480)

**Location:** Near other state declarations

**Add this:**
```typescript
// Debug mode to show progress task info in console
const [debugProgressTasks, setDebugProgressTasks] = useState(false);

// In useEffect or wherever appropriate
useEffect(() => {
  if (debugProgressTasks) {
    console.log('[DEBUG MODE] ConversationHistory:', conversationHistory.map((c, i) => ({
      index: i,
      query: c.query.substring(0, 50),
      progressTaskCount: c.progressTasks?.length || 0,
      taskNames: c.progressTasks?.map(t => t.name) || []
    })));
  }
}, [conversationHistory, debugProgressTasks]);
```

---

## 🧪 Testing Instructions

### Test Case 1: Single Deep Mode Query
```
1. Open Strategic Dashboard
2. Switch to Deep mode (Phân tích sâu)
3. Ask: "Phân tích chi tiết về hệ thống CNTT"
4. DURING generation:
   ✓ Verify 5 phases show up one by one
   ✓ Verify each phase has detailed info (SQL, thinking, data)
5. AFTER completion:
   ✓ Verify all 5 phases still visible
   ✓ Verify SQL queries still shown
   ✓ Verify data tables still shown
   ✓ Verify can collapse/expand section
```

### Test Case 2: Multiple Deep Mode Queries
```
1. Ask first Deep question → Wait for completion
2. Verify first conversation shows all 5 phases
3. Ask second Deep question → Wait for completion
4. Verify second conversation shows all 5 phases
5. Scroll back to first conversation
6. ✓ Verify first still shows all 5 phases (NOT simplified!)
7. ✓ Verify details not lost
```

### Test Case 3: Mixed Mode Queries
```
1. Ask Quick mode question → Check shows 2 phases
2. Ask Deep mode question → Check shows 5 phases
3. Ask another Quick question → Check shows 2 phases
4. Scroll back through history
5. ✓ Verify each conversation preserves its own progress correctly
```

### Test Case 4: Refresh Behavior
```
1. Ask Deep question with all details showing
2. Refresh page (F5)
3. ✓ Verify conversation history lost (expected - no persistence)
4. ✓ Verify no console errors
```

---

## 🐛 Common Issues & Solutions

### Issue 1: "Cannot read property 'length' of undefined"
**Cause:** conv.progressTasks is undefined
**Fix:** Always use optional chaining: `conv.progressTasks?.length`

### Issue 2: Progress tasks still disappearing
**Cause:** Deep copy not working (circular references?)
**Fix:** Use structured clone or manual copy:
```typescript
const savedProgressTasks = aiProgressTasks.map(task => ({
  ...task,
  // Explicitly copy nested objects
  sampleRows: task.sampleRows ? [...task.sampleRows] : undefined,
  columns: task.columns ? [...task.columns] : undefined,
}));
```

### Issue 3: Memory leak with large progress data
**Cause:** Storing too much data in state (large sampleRows arrays)
**Fix:** Limit sample rows when saving:
```typescript
const savedProgressTasks = aiProgressTasks.map(task => ({
  ...task,
  sampleRows: task.sampleRows?.slice(0, 15), // Limit to 15 rows
}));
```

### Issue 4: Progress tasks mixed between conversations
**Cause:** Global state contamination
**Fix:** Ensure setAiProgressTasks([]) is called after save

---

## 📊 Before/After Comparison

### BEFORE (Buggy)
```
[User asks Deep question]
   ↓
During: Shows 5 phases ✓
   Phase 1: Phân tích câu hỏi ✓
   Phase 2: Tạo SQL ✓
   Phase 3: Truy vấn dữ liệu ✓
   Phase 4: Phân tích thông minh ✓
   Phase 5: Tạo câu trả lời ✓
   ↓
After: Shows 2 phases ✗
   Phase 1: Phân tích nhanh ✗
   Phase 2: Completed ✗
   [All debug info lost!]
```

### AFTER (Fixed)
```
[User asks Deep question]
   ↓
During: Shows 5 phases ✓
   Phase 1: Phân tích câu hỏi ✓
   Phase 2: Tạo SQL ✓
   Phase 3: Truy vấn dữ liệu ✓
   Phase 4: Phân tích thông minh ✓
   Phase 5: Tạo câu trả lời ✓
   ↓
After: Still shows 5 phases ✓
   Phase 1: Phân tích câu hỏi ✓
   Phase 2: Tạo SQL ✓ (with SQL query visible)
   Phase 3: Truy vấn dữ liệu ✓ (with data table)
   Phase 4: Phân tích thông minh ✓ (with analysis)
   Phase 5: Tạo câu trả lời ✓
   [All debug info preserved!]
```

---

## 🚀 Deployment Checklist

**Pre-Deploy:**
- [ ] Code changes made in `StrategicDashboard.tsx`
- [ ] TypeScript compiles without errors
- [ ] All 4 test cases pass locally
- [ ] Console logs added for debugging (can be removed later)
- [ ] Git commit created with clear message

**Deploy to UAT:**
```bash
cd /path/to/project
git add frontend/src/pages/StrategicDashboard.tsx
git commit -m "fix(ai-ui): Preserve Deep mode progress tasks after completion

- Deep copy progress tasks when saving to conversation history
- Clear global progress state after save to prevent contamination
- Add defensive rendering logic with proper fallbacks
- Add TypeScript interfaces for type safety

Fixes bug where Deep mode progress (5 phases with details)
would revert to Quick mode display (2 phases) after completion."

git push origin develop

# Deploy to UAT server
ssh admin_@34.142.152.104
cd /home/admin_/apps/thong-ke-he-thong
git pull origin develop
cd /home/admin_/apps/thong-ke-he-thong-uat
git pull origin develop
docker builder prune -af
DOCKER_BUILDKIT=0 docker compose build frontend --no-cache
docker compose up -d frontend
```

**Post-Deploy Verification:**
- [ ] Open UAT: https://hientrangcds.mindmaid.ai
- [ ] Login as lanhdaobo
- [ ] Run all 4 test cases
- [ ] Check browser console for debug logs
- [ ] Verify no TypeScript/React errors
- [ ] Ask user to test and confirm fix

**Rollback Plan:**
```bash
# If issues occur, revert commit
git revert <commit-hash>
git push origin develop
# Redeploy
```

---

## 📝 Code Review Checklist

**For Reviewer:**
- [ ] Deep copy implementation correct (no circular refs)
- [ ] State clearing happens at right time
- [ ] Rendering logic handles all edge cases (undefined, empty array, etc.)
- [ ] TypeScript types added correctly
- [ ] No memory leaks (check with React DevTools Profiler)
- [ ] Console logs can be removed or gated behind debug flag
- [ ] No breaking changes to Quick mode
- [ ] Backward compatible with existing conversation data

---

## 🎓 Learning Notes

**Key Takeaway:** When storing derived state (like progress tasks) in React state, always deep copy if the source will be mutated later. Shallow copy (`[...array]`) only copies first level.

**React State Mutation Pitfall:**
```typescript
// BAD: Shallow copy
progressTasks: [...aiProgressTasks]
// If aiProgressTasks items are mutated later, saved copy is affected!

// GOOD: Deep copy
progressTasks: JSON.parse(JSON.stringify(aiProgressTasks))
// Completely independent copy, mutations don't affect it

// BEST: Structured clone (if available)
progressTasks: structuredClone(aiProgressTasks)
// Modern API, handles more edge cases
```

**Why This Matters:**
In React, when you update state, React does a shallow comparison to decide if re-render is needed. If you mutate nested objects/arrays, React might miss the changes. Deep copying ensures complete isolation.

---

**Last Updated:** 2026-02-04
**Status:** Ready for Implementation
**Next Action:** Apply code changes and test
