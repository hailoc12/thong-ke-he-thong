# AI Assistant - Trợ lý Hỏi đáp Dữ liệu

**Feature**: Trợ lý AI tích hợp trong Strategic Dashboard cho phép người dùng hỏi câu hỏi tự nhiên về dữ liệu hệ thống và nhận câu trả lời thông minh với phân tích chiến lược.

**Version**: 2.0 (Enhanced Progress Tracking)
**Last Updated**: 2026-01-30
**Status**: ✅ Production Ready

---

## Overview

AI Assistant là tính năng chính trong tab "Phân tích" của Strategic Dashboard, cho phép:
- Hỏi câu hỏi bằng ngôn ngữ tự nhiên (Vietnamese)
- Hiển thị tiến trình xử lý real-time từng bước
- Cung cấp câu trả lời với insight chiến lược
- Hiển thị dữ liệu chi tiết khi cần thiết

---

## Architecture

### Frontend Components
**File**: `frontend/src/pages/StrategicDashboard.tsx`

| Component | Purpose | Lines |
|-----------|---------|-------|
| `AIThinkingTask` interface | Type definition cho task tracking | 365-380 |
| `phase_start` handler | Xử lý sự kiện bắt đầu phase | 563-592 |
| `phase_complete` handler | Xử lý sự kiện hoàn thành phase | 594-625 |
| Task Display Component | Hiển thị task với chi tiết | 3378-3465 |
| AI Response Display | Hiển thị kết quả phân tích | 3467+ |

### Backend Components
**File**: `backend/apps/systems/views.py`

| Component | Purpose | Method |
|-----------|---------|--------|
| `ai_query_stream` | SSE endpoint cho real-time progress | POST |
| Phase 1: SQL Generation | Tạo SQL query từ natural language | - |
| Phase 2: Data Query | Thực thi SQL và lấy dữ liệu | - |
| Phase 3: Response Generation | Tạo response với insight chiến lược | - |
| Phase 4: Self-Review | Kiểm tra chất lượng response | - |

---

## Data Flow

```
User Question (TextArea)
       ↓
handleAIQuery()
       ↓
EventSource (SSE connection)
       ↓
┌─────────────────────────────────────┐
│  Backend sends events:              │
│  - phase_start (1, 2, 3, 4)         │
│  - phase_complete (with data)       │
│  - complete (final response)        │
└─────────────────────────────────────┘
       ↓
Frontend updates state:
  - aiProgressTasks (real-time)
  - aiQueryResponse (final)
       ↓
Render UI:
  - Progress section (tasks với details)
  - Response section (insight + data)
```

---

## Features Implemented

### ✅ Phase 1: Real-time Progress Tracking

**Status**: COMPLETE (Deployed 2026-01-30)

**Features**:
1. **Server-Sent Events (SSE)**: Stream progress real-time từ backend
2. **Phase Tracking**: Hiển thị 4 phases chính:
   - SQL Generation (Tạo câu SQL)
   - Data Query (Truy vấn dữ liệu)
   - Response Generation (Tạo phản hồi)
   - Self-Review (Kiểm tra chất lượng)

3. **Enhanced Task Display**:
   - Primary row: Icon + Name + Duration badge
   - Secondary row: Description cho in-progress tasks
   - Tertiary row: Phase-specific details cho completed tasks:
     - SQL preview (monospace code block)
     - Result count tag
     - Review status tag

**Code Changes**:
- Interface `AIThinkingTask` với fields mới:
  - `description`, `thinking`, `sql`, `sqlPreview`
  - `resultCount`, `reviewPassed`
  - `startTime`, `endTime`, `duration`

**Commit**: `780ba38` - feat(ai): Enhance progress tracking with detailed task information

---

### ✅ Phase 2: Vietnamese Unit Display

**Status**: COMPLETE

**Features**:
- Mapping English column names sang Vietnamese units
- Hiển thị "87 Hệ thống" thay vì "87 total_systems"

**Implementation**: `getVietnameseUnit()` function applied to data details

---

### ✅ Phase 3: Admin Access

**Status**: COMPLETE

**Features**:
- Admin user có thể access Strategic Dashboard cho testing
- Configure trong `authStore.ts`: `LEADER_USERNAMES = ['lanhdaobo', 'admin']`

---

## UI/UX Specifications

### Progress Section Layout

```
┌─────────────────────────────────────────────────────┐
│ TIẾN ĐỘ (3/3)                                      │
├─────────────────────────────────────────────────────┤
│ ✓ SQL Generation                    [2.3s]          │
│   SELECT id, name, org_name FROM systems...         │
│                                                     │
│ ✓ Data Query                          [1.1s]          │
│   Found 87 rows                                      │
│                                                     │
│ ✓ Response Generation                   [0.8s]          │
│   ✓ Review Passed                                  │
└─────────────────────────────────────────────────────┘
```

### AI Response Section Layout

```
┌─────────────────────────────────────────────────────┐
│ Kết quả phân tích                                   │
├─────────────────────────────────────────────────────┤
│ Báo cáo anh/chị,                                    │
│                                                     │
│ **87 hệ thống** đang vận hành...                     │
│                                                     │
│ 💡 Chiến lược                                       │
│ 27% hệ thống cần nâng cấp...                        │
│                                                     │
│ 🎯 Đề xuất hành động                                │
│ Đề xuất phê duyệt ngân sách...                      │
│                                                     │
│ 📊 Danh sách 87 hệ thống                            │
│ [Table with data]                                   │
└─────────────────────────────────────────────────────┘
```

---

## Configuration

### Backend Environment Variables

```bash
# docker-compose.yml
USE_CLAUDE_AI=true
CLAUDE_API_KEY=sk-ant-api03-...
```

### Frontend Access Control

```typescript
// frontend/src/stores/authStore.ts
const LEADER_USERNAMES = ['lanhdaobo', 'admin'];
```

---

## Testing Checklist

- [x] Progress section hiển thị real-time
- [x] Tasks show name, duration, and phase-specific details
- [x] SQL preview displays for Phase 1
- [x] Result count displays for Phase 2
- [x] Review status displays for Phase 4
- [x] Vietnamese units display correctly
- [x] Progress section persists after completion
- [x] Progress section appears ABOVE AI response
- [x] Admin can access Strategic Dashboard

---

## Known Issues & Limitations

### Current Limitations
1. **Backend Permission**: Tạm thời cho admin access để testing
   - **Future**: Cần refine permission logic cho production

2. **Progress Data Persistence**: Tasks data chỉ lưu trong state (memory)
   - **Future**: Có thể lưu vào localStorage để refresh không mất data

3. **Error Handling**: Hiển thị error Alert nhưng chưa có retry mechanism
   - **Future**: Thêm retry button và detailed error messages

---

## Future Enhancements

### Phase 4: Executive Response Style (PENDING)

**Planned Features**:
1. **Enhanced Phase 2 Prompt**:
   - Executive summary style (2-3 sentences max)
   - Focus on strategic insight, not technical details
   - Add `strategic_insight` field
   - Add `recommended_action` field

2. **Frontend Boxes**:
   - Yellow background for "Chiến lược"
   - Green background for "Đề xuất hành động"

### Phase 5: Enhanced Data Table (PENDING)

**Planned Features**:
1. **New Component**: `AIDataModal.tsx`
   - Search input filter toàn bộ data
   - Column filters và sorting
   - Page size selector (10/20/50/100)
   - Export CSV button
   - Sticky header, scroll horizontal

---

## API Documentation

### SSE Endpoint: `/api/systems/ai_query_stream/`

**Method**: `POST`
**Content-Type**: `text/event-stream`

**Request**:
```typescript
const eventSource = new EventSource(
  `${API_BASE}/systems/ai_query_stream/?token=${token}&query=${encodeURIComponent(query)}`
);
```

**Events**:

#### 1. `phase_start`
```json
{
  "phase": 1,
  "name": "SQL Generation",
  "description": "Analyzing natural language query..."
}
```

#### 2. `phase_complete`
```json
{
  "phase": 1,
  "thinking": { "analysis": "..." },
  "sql": "SELECT id, name FROM systems",
  "total_rows": 87,
  "review_passed": true
}
```

#### 3. `complete`
```json
{
  "response": {
    "greeting": "Báo cáo anh/chị,",
    "main_answer": "**87 hệ thống**...",
    "strategic_insight": "...",
    "recommended_action": "..."
  },
  "data": {
    "columns": ["id", "name"],
    "rows": [...]
  }
}
```

---

## Deployment History

| Date | Version | Changes | Commit |
|------|---------|---------|--------|
| 2026-01-30 | 2.0 | Enhanced progress tracking with detailed task info | 780ba38 |
| 2026-01-29 | 1.5 | Fixed progress visibility + Vietnamese units | eeab195 |
| 2026-01-28 | 1.0 | Initial SSE implementation | - |

---

## References

- **Plan Document**: `/PLAN_AI_Assistant_Improvement.md`
- **Backend Code**: `backend/apps/systems/views.py`
- **Frontend Code**: `frontend/src/pages/StrategicDashboard.tsx`
- **Config**: `backend/config/settings.py`, `docker-compose.yml`

---

## Support

**Testing URL**: https://thongkehethong.mindmaid.ai
**Test Accounts**: `admin` / `Admin@2026`, `lanhdaobo` / `ThongkeCDS@2026#`

**Questions**: Contact hailoc12
