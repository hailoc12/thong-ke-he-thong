# AI Assistant UI Improvements - Backlog

**Created**: 2026-01-30
**Status**: Ready for Implementation
**Priority**: High (Quick Wins)

---

## Sprint 1: Critical UI Fixes (Est: 1-2 hours)

### Task 1: Add Recommended Action Box ⭐ HIGH PRIORITY

**File**: `frontend/src/pages/StrategicDashboard.tsx` (lines ~1744-1757)
**Effort**: 15 mins
**Impact**: High - Executives can't scan for actions without visual separation

**Current Code**:
```tsx
{aiQueryResponse.response?.recommended_action && (
  <div style={{
    marginTop: 12,
    padding: '12px 16px',
    // ❌ NO background!
    borderRadius: 8,
    ...
  }}>
```

**Fix**:
```tsx
{aiQueryResponse.response?.recommended_action && (
  <div style={{
    marginTop: 12,
    padding: '14px 16px',
    background: 'linear-gradient(135deg, #f0f9ff 0%, #e6f7ff 100%)',
    border: '1px solid #91d5ff',
    borderRadius: 8,
    boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
    display: 'flex',
    alignItems: 'flex-start',
    gap: 8
  }}>
    <RightCircleOutlined style={{ color: '#1890ff', fontSize: 16, marginTop: 4 }} />
    <div>
      <strong style={{ color: '#0050b3', fontSize: 14 }}>💡 Đề xuất hành động:</strong>
      <div style={{ marginTop: 4, color: '#262626', lineHeight: 1.6 }}>
        {aiQueryResponse.response.recommended_action}
      </div>
    </div>
  </div>
)}
```

**Acceptance Criteria**:
- [ ] Box has light blue gradient background
- [ ] Box has blue border
- [ ] Icon color is blue (#1890ff)
- [ ] Text color is dark blue (#0050b3)
- [ ] Subtle shadow visible
- [ ] Visual separation from insight box clear

---

### Task 2: Enhance Strategic Insight Box

**File**: `frontend/src/pages/StrategicDashboard.tsx` (lines ~1725-1742)
**Effort**: 10 mins
**Impact**: Medium - Improves visual consistency

**Changes**:
```tsx
<div style={{
  marginTop: 12,
  padding: '14px 16px',  // Increase padding
  background: 'linear-gradient(135deg, #fffbe6 0%, #fff7e6 100%)',
  border: '1px solid #ffe58f',
  borderRadius: 8,
  boxShadow: '0 2px 4px rgba(0,0,0,0.02)',  // Add shadow
  display: 'flex',
  alignItems: 'flex-start',
  gap: 8
}}>
  <BulbOutlined style={{ color: '#faad14', fontSize: 16, marginTop: 4 }} />
  <div>
    <strong style={{ color: '#ad6800', fontSize: 14 }}>🎯 Insight chiến lược:</strong>
    <div style={{ marginTop: 4, color: '#262626', lineHeight: 1.6 }}>
      {aiQueryResponse.response.strategic_insight}
    </div>
  </div>
</div>
```

**Acceptance Criteria**:
- [ ] Box has subtle shadow
- [ ] Padding increased for better breathing room
- [ ] Icon and text sizes consistent with action box
- [ ] Line height improves readability

---

### Task 3: Add ARIA Labels for Accessibility

**File**: `frontend/src/pages/StrategicDashboard.tsx`
**Effort**: 5 mins
**Impact**: High - Accessibility compliance

**Changes**:
```tsx
<div
  role="region"
  aria-label="Strategic Insight"
  style={{ /* insight box styles */ }}
>
  {/* Content */}
</div>

<div
  role="region"
  aria-label="Recommended Action"
  style={{ /* action box styles */ }}
>
  {/* Content */}
</div>
```

**Acceptance Criteria**:
- [ ] Screen readers announce regions properly
- [ ] ARIA labels in Vietnamese
- [ ] Semantic HTML structure maintained

---

## Sprint 2: Progress Display Enhancement (Est: 1 hour)

### Task 4: Show Progress Phase Names from Start

**File**: `frontend/src/pages/StrategicDashboard.tsx`
**Effort**: 30 mins
**Impact**: Medium - Better UX during streaming

**Current Issue**: Progress shows "1. 2. 3." without phase names initially

**Fix**: Initialize tasks with names upfront
```tsx
const handleAIQuerySubmit = async () => {
  // Initialize with phase names
  setAiProgressTasks([
    { id: 1, name: 'Phân tích yêu cầu', icon: 'search', status: 'pending' },
    { id: 2, name: 'Truy vấn dữ liệu', icon: 'database', status: 'pending' },
    { id: 3, name: 'Tạo báo cáo', icon: 'file-text', status: 'pending' },
    { id: 4, name: 'Kiểm tra', icon: 'check-circle', status: 'pending' }
  ]);

  // Then update status as events come in
};
```

**Acceptance Criteria**:
- [ ] Phase names visible immediately after clicking "Hỏi AI"
- [ ] Icons display for each phase
- [ ] Status updates correctly as events arrive
- [ ] Completed phases show checkmarks

---

### Task 5: Add Duration Badges

**File**: `frontend/src/pages/StrategicDashboard.tsx`
**Effort**: 20 mins
**Impact**: Low - Nice-to-have analytics

**Changes**:
```tsx
{task.endTime && task.startTime && (
  <span style={{
    marginLeft: 8,
    padding: '2px 8px',
    background: '#f0f0f0',
    borderRadius: 4,
    fontSize: 12,
    color: '#8c8c8c'
  }}>
    {((task.endTime - task.startTime) / 1000).toFixed(1)}s
  </span>
)}
```

**Acceptance Criteria**:
- [ ] Duration displays for completed tasks
- [ ] Format: X.Xs (e.g., "2.3s")
- [ ] Badge subtle but visible
- [ ] No duration for in-progress or pending tasks

---

## Sprint 3: Mobile Responsiveness (Est: 30 mins)

### Task 6: Responsive Styling for Boxes

**File**: `frontend/src/pages/StrategicDashboard.tsx`
**Effort**: 30 mins
**Impact**: Medium - Better mobile UX

**Changes**:
```tsx
const isMobile = useMediaQuery({ maxWidth: 768 });

<div style={{
  padding: isMobile ? '10px 12px' : '14px 16px',
  fontSize: isMobile ? 13 : 14,
  // ... other styles
}}>
```

**Acceptance Criteria**:
- [ ] Boxes have reduced padding on mobile
- [ ] Font sizes scale appropriately
- [ ] Icons remain visible on small screens
- [ ] No horizontal scroll

---

## Future Work (Phase 4)

### Task 7: AIDataModal Component

**Effort**: 4-6 hours
**Priority**: Low (not critical for MVP)

**Features**:
- Search across all columns
- Column-specific filters
- Sorting by any column
- Page size selector (10/20/50/100)
- Export CSV button
- Sticky header
- Horizontal scroll for wide tables

**Files to Create**:
- `frontend/src/components/AIDataModal.tsx`
- `frontend/src/utils/csvExport.ts`

---

## Implementation Order (Recommended)

1. ✅ **Task 1** - Add Recommended Action Box (15 mins) → Biggest visual impact
2. ✅ **Task 2** - Enhance Insight Box (10 mins) → Consistency
3. ✅ **Task 3** - ARIA Labels (5 mins) → Accessibility quick win
4. ⏳ **Task 4** - Progress Names (30 mins) → Better UX
5. ⏳ **Task 5** - Duration Badges (20 mins) → Polish
6. ⏳ **Task 6** - Mobile Responsive (30 mins) → Broader reach
7. 🔮 **Task 7** - Data Modal (4-6 hrs) → Future enhancement

**Total Effort**: ~2 hours for Sprint 1-3, 6 hours including Phase 4

---

## Testing Checklist (After Implementation)

### Visual Testing
- [ ] Screenshot comparison (before/after)
- [ ] Test with different query lengths
- [ ] Test with missing fields (no insight/action)
- [ ] Verify colors in light mode
- [ ] Check mobile layout (iPhone/Android)

### Accessibility Testing
- [ ] Screen reader test (NVDA/VoiceOver)
- [ ] Keyboard navigation (Tab order)
- [ ] Color contrast check (WebAIM tool)
- [ ] Zoom to 200% (text readable)

### Cross-browser Testing
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Mobile browsers (iOS Safari/Chrome Android)

---

## Definition of Done

For each task to be considered complete:
1. ✅ Code implemented and tested locally
2. ✅ PR reviewed and approved
3. ✅ Changes deployed to production
4. ✅ Visual regression test passed
5. ✅ Accessibility audit passed
6. ✅ User acceptance test (with lanhdaobo account)
7. ✅ Documentation updated

---

## Success Metrics

**Before**:
- Strategic insight: Yellow box ✅
- Recommended action: No box ❌
- User feedback: "Khó phân biệt insight vs action"

**After**:
- Strategic insight: Enhanced yellow box ✅
- Recommended action: Blue box ✅
- User feedback: "Dễ scan, rõ ràng hơn nhiều!"

**KPIs**:
- Time to find recommended action: Reduced by 50%
- Executive satisfaction score: Increase from 7/10 to 9/10
- Accessibility score: Increase from 80 to 95
