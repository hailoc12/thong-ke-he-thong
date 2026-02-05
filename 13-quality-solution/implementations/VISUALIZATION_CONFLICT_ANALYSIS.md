# Visualization System Conflict Analysis

**Date**: 2026-02-05
**Issue**: Visualization feature not working despite code implementation
**Root Cause**: Two competing visualization systems

---

## Problem Discovery

User reported:
> "Query đã trả về data chi tiết rồi, nhưng phan table trong câu trả lời thì không có data"

Investigation revealed TWO separate visualization approaches:

### System 1: Config-Based (Currently Active)
**Location**: Prompt engineering in AI queries
**How it works**:
1. AI generates `chart_type` ("bar", "pie", "table", "number")
2. AI generates `chart_config` (x_field, y_field, title, unit)
3. AI generates `system_list_markdown` (markdown table)
4. Frontend receives configs and renders charts

**Response structure**:
```json
{
  "response": {
    "main_answer": "...",
    "chart_type": "table",
    "chart_config": {...},
    "system_list_markdown": "| STT | Name | ... |"
  }
}
```

### System 2: HTML-Based (Recently Added, Not Working)
**Location**: `generate_visualization()` function
**How it works**:
1. Backend generates complete HTML + JavaScript
2. Returns `visualization_html` with interactive table/charts
3. Frontend renders HTML directly

**Expected structure**:
```json
{
  "response": {
    "main_answer": "...",
    "visualization_html": "<div>...</div>"
  }
}
```

---

## Why System 2 Isn't Working

### Issue 1: Code is Being Called But Result Ignored
- `generate_visualization()` IS being executed
- Returns HTML string
- HTML is added to `response_content['visualization_html']`
- **BUT**: Frontend doesn't use it (uses chart_type/chart_config instead)

### Issue 2: Two Parallel Systems
- System 1 (config-based) embedded in AI prompt → always generates
- System 2 (HTML-based) runs after answer → generates but not used
- Frontend only knows about System 1

---

## User's Suggestion: 2-Step Separation

Hiện tại cả 2 bước đang chạy song song:
- **Bước 1**: AI generate answer + chart_config
- **Bước 2**: Backend generate visualization_html

**Vấn đề**: Không tích hợp với nhau!

---

## Solution Options

### Option A: Keep Config-Based (Current System)
**Pros**:
- Already working
- Frontend already implements rendering
- AI can decide best chart type

**Cons**:
- Less control over visualization quality
- Can't create complex interactive elements
- Depends on frontend Chart.js implementation

### Option B: Switch to HTML-Based (New System)
**Pros**:
- Full control over visualization
- Can create rich interactive elements
- Clickable links to detail pages
- Consistent rendering across clients

**Cons**:
- Need to update frontend to use visualization_html
- Need to remove/disable old system
- More backend processing

### Option C: Hybrid Approach ✅ **RECOMMENDED**
**Keep both, use appropriately**:

1. **Simple visualizations**: Use config-based
   - Single numbers
   - Simple bar/pie charts
   - Quick rendering

2. **Complex visualizations**: Use HTML-based
   - Interactive tables with clickable links
   - Multi-series charts
   - Custom layouts

**Implementation**:
```python
# After AI generates answer with chart_type
if chart_type in ['table'] and len(rows) > 5:
    # Complex table → use HTML
    visualization_html = generate_visualization(query_result, query)
    response_content['visualization_html'] = visualization_html
    response_content['use_html_viz'] = True
else:
    # Simple chart → use config
    response_content['chart_type'] = chart_type
    response_content['chart_config'] = chart_config
    response_content['use_html_viz'] = False
```

---

## Recommended Fix

### Step 1: Update Frontend
Add support for `visualization_html` in `StrategicDashboard.tsx`:

```typescript
{response.use_html_viz && response.visualization_html ? (
  <div
    dangerouslySetInnerHTML={{ __html: response.visualization_html }}
    className="visualization-container"
  />
) : (
  // Existing chart rendering with chart_type/chart_config
  <ChartComponent type={response.chart_type} config={response.chart_config} />
)}
```

### Step 2: Backend Logic
Add conditional visualization generation:

```python
# After answer is ready
if chart_type == 'table' and query_result.get('total_rows', 0) > 0:
    # Generate rich HTML table
    visualization_html = generate_visualization(query_result, query)
    response_content['visualization_html'] = visualization_html
    response_content['use_html_viz'] = True
else:
    # Use simple config-based charts
    response_content['use_html_viz'] = False
```

---

## User's Original Concern

> "Có lẽ nên tách riêng generate answer và generate visualization thành 2 step khác nhau, để đạt chất lượng tốt hơn"

**Analysis**: ✅ Correct observation!

Currently:
- **Step 1**: AI generates answer + chart_config (in one prompt)
- **Step 2**: Backend generates visualization_html (separate function)

**Problem**: Step 1 và Step 2 không kết nối! Frontend chỉ dùng Step 1.

**Solution**: Make them work together:
1. Step 1: AI focuses on ANSWER quality only
2. Step 2: Backend decides best visualization based on data
3. Frontend uses whichever is provided (HTML or config)

---

## Next Steps

1. ✅ Understand current system conflict
2. ⏳ Decide on Option A, B, or C
3. ⏳ Update frontend to support visualization_html
4. ⏳ Update backend to conditionally use HTML viz
5. ⏳ Test both simple and complex queries
6. ⏳ Deploy and verify

---

**Created**: 2026-02-05
**Status**: Analysis complete, waiting for decision
