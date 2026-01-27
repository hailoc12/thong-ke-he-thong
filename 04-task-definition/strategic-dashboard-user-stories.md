# Strategic Dashboard - User Stories & Feature Specification
## Dashboard Chiến lược cho Bộ trưởng Bộ KH&CN

**Version:** 1.0
**Date:** 2026-01-26
**Author:** AI Assistant
**Stakeholder Request:** "Một người Lãnh đạo sẽ muốn nhìn gì và cần nhìn thấy gì để quản lý, điều hành được?"

---

## 1. Bối cảnh & Tầm nhìn

### 1.1 Bối cảnh
- Bộ KH&CN sở hữu **hàng trăm hệ thống phần mềm** phục vụ các đơn vị trực thuộc
- Platform hiện tại đã thống kê được **toàn bộ** các hệ thống này
- Bộ KH&CN muốn **tiên phong chuyển đổi số**, sử dụng công nghệ, dữ liệu, tự động hóa làm sức mạnh

### 1.2 Vấn đề cần giải quyết
Bộ trưởng cần một công cụ để:
1. **Nhìn toàn cảnh** hệ sinh thái CNTT của Bộ
2. **Tư duy chiến lược** về đầu tư, nâng cấp, tích hợp
3. **Ra quyết định dựa trên dữ liệu** thay vì cảm tính
4. **Theo dõi tiến độ** chuyển đổi số của toàn Bộ

### 1.3 Tầm nhìn Strategic Dashboard
> **"Từ DATA → INSIGHT → DECISION → ACTION"**

Dashboard không chỉ hiển thị số liệu, mà phải:
- Kể câu chuyện về hiện trạng CNTT
- Chỉ ra cơ hội và rủi ro
- Đề xuất hành động cụ thể
- Hỗ trợ ra quyết định chiến lược

---

## 2. Phân tích vai trò Bộ trưởng

### 2.1 Các mối quan tâm chiến lược

| Khía cạnh | Câu hỏi của Bộ trưởng |
|-----------|----------------------|
| **Hiệu quả đầu tư** | "Tiền CNTT đổ vào đâu? Có hiệu quả không?" |
| **Rủi ro** | "Hệ thống nào đang có vấn đề? Rủi ro bảo mật ở đâu?" |
| **Cơ hội** | "Có thể tích hợp, gom nhóm gì để tiết kiệm và hiệu quả hơn?" |
| **Tiến độ** | "Chuyển đổi số đang ở đâu so với mục tiêu?" |
| **So sánh** | "Đơn vị nào làm tốt? Đơn vị nào cần hỗ trợ?" |

### 2.2 Chu kỳ ra quyết định

```
┌─────────────────────────────────────────────────────────────────┐
│                     CHU KỲ RA QUYẾT ĐỊNH                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  HÀNG NGÀY          HÀNG TUẦN           HÀNG THÁNG/QUÝ         │
│  ───────────        ──────────          ────────────────        │
│  • Health check     • Tiến độ dự án     • Đánh giá đầu tư      │
│  • Sự cố khẩn cấp   • Vấn đề tồn đọng   • Phê duyệt ngân sách  │
│  • Cảnh báo đỏ      • So sánh đơn vị    • Điều chỉnh chiến lược│
│                     • Review KPIs       • Quyết định tích hợp  │
│                                         • Loại bỏ/thay thế     │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 2.3 Các quyết định chiến lược cần data support

1. **Quyết định ĐẦU TƯ**: Hệ thống nào cần đầu tư thêm? Đơn vị nào thiếu hụt?
2. **Quyết định NÂNG CẤP**: Hệ thống nào lỗi thời cần hiện đại hóa?
3. **Quyết định TÍCH HỢP**: Hệ thống nào nên kết nối với nhau?
4. **Quyết định GOM NHÓM**: Dữ liệu nào trùng lặp cần hợp nhất?
5. **Quyết định LOẠI BỎ**: Hệ thống nào không còn giá trị, cần retire?
6. **Quyết định CHUẨN HÓA**: Công nghệ/platform nào nên là chuẩn chung?

---

## 3. User Stories

### 3.1 Nhóm 1: Tổng quan & Health Check

> *"Tôi cần biết NGAY tình hình chung trong 30 giây"*

#### US-1.1: Executive Summary at a Glance
```
As a Bộ trưởng,
I want to see a one-screen summary of the entire IT ecosystem
So that I can quickly assess overall health without drilling down.

Acceptance Criteria:
- [ ] Tổng số hệ thống & phân bổ theo trạng thái (active/inactive/maintenance)
- [ ] Tổng ngân sách CNTT & tỷ lệ đã sử dụng
- [ ] Số sự cố đang mở & mức độ nghiêm trọng
- [ ] Điểm số sức khỏe tổng thể (0-100)
- [ ] Top 3 vấn đề cần chú ý ngay
```

#### US-1.2: Real-time Alert System
```
As a Bộ trưởng,
I want to receive real-time alerts for critical issues
So that I can respond immediately to urgent situations.

Acceptance Criteria:
- [ ] Cảnh báo hệ thống critical gặp sự cố
- [ ] Cảnh báo bảo mật (security breach, vulnerability)
- [ ] Cảnh báo ngân sách vượt ngưỡng
- [ ] Cảnh báo deadline dự án sắp đến/trễ hạn
- [ ] Phân loại mức độ: 🔴 Critical | 🟡 Warning | 🟢 Info
```

#### US-1.3: Digital Transformation Scorecard
```
As a Bộ trưởng,
I want to see a scorecard of digital transformation progress
So that I can track how far we've come and what remains.

Acceptance Criteria:
- [ ] Điểm chuyển đổi số tổng thể (scale 1-5 hoặc 0-100%)
- [ ] Breakdown theo các trụ cột: Hạ tầng, Dữ liệu, Ứng dụng, Con người
- [ ] So sánh với mục tiêu đề ra
- [ ] Trend theo thời gian (tháng/quý)
- [ ] Benchmark với các Bộ/ngành khác (nếu có data)
```

---

### 3.2 Nhóm 2: Phân tích Đầu tư

> *"Tôi cần biết tiền đổ vào đâu và có hiệu quả không"*

#### US-2.1: Investment Portfolio View
```
As a Bộ trưởng,
I want to see how IT budget is distributed across systems and units
So that I can identify over/under-investment areas.

Acceptance Criteria:
- [ ] Treemap/Sunburst hiển thị phân bổ ngân sách theo đơn vị
- [ ] Breakdown theo loại chi phí: Phần mềm, Hạ tầng, Vận hành, Phát triển mới
- [ ] Trend chi tiêu theo năm (3-5 năm)
- [ ] Highlight đơn vị chi tiêu cao bất thường
- [ ] ROI indicator cho từng hệ thống lớn
```

#### US-2.2: Investment Gap Analysis
```
As a Bộ trưởng,
I want to identify units/areas that are under-invested
So that I can prioritize budget allocation for next period.

Acceptance Criteria:
- [ ] So sánh mức đầu tư thực tế vs nhu cầu
- [ ] Hệ thống cần nâng cấp nhưng chưa có budget
- [ ] Đơn vị có tỷ lệ số hóa thấp
- [ ] Gap analysis: Thiếu gì để đạt mục tiêu chuyển đổi số?
- [ ] Đề xuất ưu tiên đầu tư (AI-powered recommendation)
```

#### US-2.3: Cost Efficiency Analysis
```
As a Bộ trưởng,
I want to identify inefficient spending patterns
So that I can optimize resource allocation.

Acceptance Criteria:
- [ ] Hệ thống có chi phí cao nhưng ít người dùng
- [ ] Hệ thống trùng chức năng (duplicate investment)
- [ ] License không sử dụng hết
- [ ] So sánh chi phí/user hoặc chi phí/transaction
- [ ] Tiềm năng tiết kiệm nếu hợp nhất/loại bỏ
```

---

### 3.3 Nhóm 3: Tích hợp & Liên thông

> *"Tôi cần biết hệ thống nào nên 'nói chuyện' với nhau"*

#### US-3.1: Integration Landscape Map
```
As a Bộ trưởng,
I want to see a visual map of how systems are connected
So that I can understand data flow and identify silos.

Acceptance Criteria:
- [ ] Network graph hiển thị các hệ thống và kết nối
- [ ] Highlight các "data silos" (hệ thống không kết nối)
- [ ] Hiển thị flow dữ liệu chính (citizen data, business data)
- [ ] Phân loại mức độ tích hợp: Full | Partial | None
- [ ] Click để xem chi tiết integration
```

#### US-3.2: Integration Opportunity Finder
```
As a Bộ trưởng,
I want AI to suggest which systems should be integrated
So that I can improve efficiency and data consistency.

Acceptance Criteria:
- [ ] AI phân tích và đề xuất cơ hội tích hợp
- [ ] Dựa trên: Cùng loại dữ liệu, cùng đơn vị, cùng quy trình nghiệp vụ
- [ ] Estimate benefit của mỗi integration (tiết kiệm thời gian, giảm lỗi)
- [ ] Priority ranking: Quick wins vs Long-term
- [ ] Case studies từ các Bộ/ngành đã làm
```

#### US-3.3: Data Sharing Dashboard
```
As a Bộ trưởng,
I want to monitor inter-system data sharing activities
So that I can ensure data flows smoothly across the ministry.

Acceptance Criteria:
- [ ] Số lượng API calls/data exchanges theo thời gian
- [ ] Success rate của data sharing
- [ ] Bottlenecks & failures
- [ ] Top data providers và consumers
- [ ] Data freshness indicator
```

---

### 3.4 Nhóm 4: Tối ưu & Hợp lý hóa

> *"Tôi cần biết cái gì thừa, cái gì trùng, cái gì nên bỏ"*

#### US-4.1: Redundancy Detection
```
As a Bộ trưởng,
I want to identify duplicate or overlapping systems
So that I can consolidate and reduce waste.

Acceptance Criteria:
- [ ] Danh sách hệ thống có chức năng tương tự
- [ ] Matrix so sánh features của các hệ thống trùng
- [ ] Estimate chi phí duy trì song song
- [ ] Đề xuất hệ thống nên giữ lại (keep) vs loại bỏ (retire)
- [ ] Impact analysis nếu consolidate
```

#### US-4.2: Legacy System Radar
```
As a Bộ trưởng,
I want to identify aging/obsolete systems
So that I can plan modernization or replacement.

Acceptance Criteria:
- [ ] Age distribution của các hệ thống (< 3 năm, 3-5 năm, 5-10 năm, > 10 năm)
- [ ] Technology debt indicator (outdated tech stack)
- [ ] Security vulnerability score cho legacy systems
- [ ] Maintenance cost trend (tăng theo tuổi)
- [ ] Modernization roadmap suggestion
```

#### US-4.3: Resource Optimization Recommendations
```
As a Bộ trưởng,
I want AI-powered recommendations for optimization
So that I can make data-driven decisions on what to keep, merge, or retire.

Acceptance Criteria:
- [ ] "Quick Wins" - Actions có thể thực hiện ngay, ROI cao
- [ ] "Strategic Moves" - Actions cần planning, impact lớn
- [ ] "Watch List" - Hệ thống cần theo dõi thêm
- [ ] Simulation: Nếu làm X, tiết kiệm được Y
- [ ] Risk assessment cho mỗi recommendation
```

---

### 3.5 Nhóm 5: Dự báo & Roadmap

> *"Tôi cần biết tương lai sẽ như thế nào và chuẩn bị gì"*

#### US-5.1: Technology Trend Radar
```
As a Bộ trưởng,
I want to see emerging technology trends relevant to our ministry
So that I can plan strategic technology adoption.

Acceptance Criteria:
- [ ] Radar chart: Adopt | Trial | Assess | Hold
- [ ] Mapping với hệ thống hiện có
- [ ] Recommendation: Nên thử nghiệm công nghệ gì?
- [ ] Case studies từ government sector
- [ ] Budget estimate cho adoption
```

#### US-5.2: Capacity Planning Forecast
```
As a Bộ trưởng,
I want to forecast future IT needs
So that I can plan budget and resources ahead.

Acceptance Criteria:
- [ ] Dự báo tăng trưởng user/transactions
- [ ] Dự báo nhu cầu storage/compute
- [ ] Budget forecast cho 3-5 năm tới
- [ ] Resource gaps expected
- [ ] Scenario planning: Best case | Base case | Worst case
```

#### US-5.3: Strategic Roadmap Visualization
```
As a Bộ trưởng,
I want to see the IT transformation roadmap on a timeline
So that I can track milestones and adjust plans.

Acceptance Criteria:
- [ ] Gantt/Timeline view các dự án chuyển đổi số
- [ ] Milestones và deadlines
- [ ] Dependencies giữa các dự án
- [ ] Progress tracking (% complete)
- [ ] Resource allocation per project
- [ ] Risk flags cho projects at risk
```

---

### 3.6 Nhóm 6: Giám sát & Đánh giá

> *"Tôi cần biết ai làm tốt, ai cần hỗ trợ"*

#### US-6.1: Unit Performance Comparison
```
As a Bộ trưởng,
I want to compare IT performance across units
So that I can identify best practices and units needing support.

Acceptance Criteria:
- [ ] Bảng xếp hạng đơn vị theo các tiêu chí
- [ ] Radar chart so sánh multi-dimensional
- [ ] Trend: Đơn vị đang cải thiện vs đi xuống
- [ ] Best practice showcase từ top performers
- [ ] Action plan cho bottom performers
```

#### US-6.2: Compliance & Security Monitor
```
As a Bộ trưởng,
I want to monitor compliance and security posture
So that I can ensure ministry-wide standards are met.

Acceptance Criteria:
- [ ] Compliance score theo các quy chuẩn
- [ ] Security posture: Số vulnerabilities, patch status
- [ ] Audit findings và remediation status
- [ ] Risk heat map theo đơn vị/hệ thống
- [ ] Non-compliance alerts
```

#### US-6.3: Project Portfolio Status
```
As a Bộ trưởng,
I want to see status of all ongoing IT projects
So that I can ensure strategic initiatives are on track.

Acceptance Criteria:
- [ ] Portfolio view: All projects với status indicators
- [ ] Budget vs Actual cho từng project
- [ ] Schedule variance (ahead/on-time/delayed)
- [ ] Resource utilization
- [ ] Executive summary cho projects cần attention
```

---

## 4. Feature Mapping

### 4.1 User Story → Feature Matrix

| User Story | Feature Name | Priority | Complexity |
|------------|--------------|----------|------------|
| US-1.1 | Executive Summary Widget | P0 | Medium |
| US-1.2 | Alert Center | P0 | Medium |
| US-1.3 | DX Scorecard | P1 | High |
| US-2.1 | Investment Treemap | P1 | Medium |
| US-2.2 | Gap Analysis Report | P2 | High |
| US-2.3 | Cost Efficiency Dashboard | P1 | High |
| US-3.1 | Integration Network Map | P1 | High |
| US-3.2 | AI Integration Recommender | P2 | Very High |
| US-3.3 | Data Sharing Monitor | P2 | Medium |
| US-4.1 | Redundancy Detector | P1 | High |
| US-4.2 | Legacy Radar | P1 | Medium |
| US-4.3 | AI Optimization Engine | P2 | Very High |
| US-5.1 | Tech Trend Radar | P2 | Medium |
| US-5.2 | Capacity Forecast | P2 | High |
| US-5.3 | Strategic Roadmap | P1 | Medium |
| US-6.1 | Unit Comparison | P1 | Medium |
| US-6.2 | Compliance Monitor | P1 | High |
| US-6.3 | Project Portfolio | P1 | Medium |

### 4.2 Feature Details

#### F1: Executive Summary Widget
```yaml
Description: One-glance overview of entire IT ecosystem
Components:
  - Health Score Gauge (0-100)
  - Key Metrics Cards (Total Systems, Budget, Incidents)
  - Trend Sparklines
  - Top 3 Alerts
Data Sources:
  - systems table
  - incidents table (nếu có)
  - budget table (cần bổ sung)
Refresh: Real-time / 5 minutes
```

#### F2: Alert Center
```yaml
Description: Centralized alert management
Components:
  - Alert Feed (chronological)
  - Filter by severity/type/unit
  - Acknowledge/Dismiss actions
  - Alert trends chart
Alert Types:
  - System Down
  - Security Vulnerability
  - Budget Overrun
  - Project Delay
  - Compliance Violation
Integration: Email, SMS, Push notification
```

#### F3: Investment Treemap
```yaml
Description: Visual breakdown of IT spending
Components:
  - Treemap chart (hierarchical)
  - Drill-down: Ministry → Unit → System
  - Color coding by ROI/efficiency
  - Time range selector
  - Export to report
Metrics:
  - Total cost
  - Cost per user
  - Cost trend
  - Budget utilization %
```

#### F4: Integration Network Map
```yaml
Description: Visual representation of system connections
Components:
  - Force-directed graph
  - Node size = system importance
  - Edge thickness = data volume
  - Cluster by domain/unit
  - Highlight silos (isolated nodes)
Interactions:
  - Zoom/pan
  - Click node for details
  - Filter by integration status
  - Search system
```

#### F5: Legacy Radar
```yaml
Description: Age and obsolescence tracking
Components:
  - Age distribution chart
  - Technology stack heatmap
  - Security risk matrix
  - Modernization recommendations
Indicators:
  - System age (years)
  - Tech stack currency (current/outdated)
  - Vendor support status
  - Security patch level
```

#### F6: Unit Comparison
```yaml
Description: Cross-unit performance benchmarking
Components:
  - Ranking table with sort
  - Radar chart comparison
  - Trend lines per unit
  - Best practice badges
Dimensions:
  - Digital maturity score
  - System health
  - Budget efficiency
  - User satisfaction
  - Innovation index
```

---

## 5. Information Architecture

### 5.1 Dashboard Structure

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        STRATEGIC DASHBOARD                              │
│                     Bộ trưởng Bộ KH&CN                                  │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │ [TAB 1] TỔNG QUAN          [Currently Active]                   │   │
│  │ [TAB 2] ĐẦU TƯ & NGÂN SÁCH                                      │   │
│  │ [TAB 3] TÍCH HỢP & LIÊN THÔNG                                   │   │
│  │ [TAB 4] TỐI ƯU & HỢP LÝ HÓA                                     │   │
│  │ [TAB 5] ROADMAP & DỰ BÁO                                        │   │
│  │ [TAB 6] ĐÁNH GIÁ & GIÁM SÁT                                     │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│  ╔═══════════════════════════════════════════════════════════════════╗ │
│  ║                                                                   ║ │
│  ║                     MAIN CONTENT AREA                             ║ │
│  ║                     (Changes per tab)                             ║ │
│  ║                                                                   ║ │
│  ╚═══════════════════════════════════════════════════════════════════╝ │
│                                                                         │
│  [ALERT CENTER - Fixed Bottom Bar]                                      │
│  🔴 2 Critical | 🟡 5 Warning | Click to expand                         │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### 5.2 Tab 1: Tổng quan (Executive Summary)

```
┌─────────────────────────────────────────────────────────────────────────┐
│ TAB 1: TỔNG QUAN                                     [Refresh] [Export] │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐      │
│  │   HEALTH SCORE   │  │   DX PROGRESS    │  │   ALERT SUMMARY  │      │
│  │      ████████    │  │     67% ████░░   │  │   🔴 2  🟡 5  🟢 12   │      │
│  │        78/100    │  │   vs target: 75% │  │   [View All →]   │      │
│  │     ▲ +5 vs LM   │  │     ▲ +12% YoY   │  │                  │      │
│  └──────────────────┘  └──────────────────┘  └──────────────────┘      │
│                                                                         │
│  ┌─────────────────────────────────────┐  ┌─────────────────────────┐  │
│  │        KEY METRICS                  │  │    TOP 3 ACTIONS       │  │
│  │                                     │  │                         │  │
│  │  247 Hệ thống    ▲ +12 vs LY       │  │  1. Review hệ thống X   │  │
│  │  198 Đang hoạt động (80%)          │  │  2. Phê duyệt budget Y  │  │
│  │   23 Cần chú ý   ▲ +3              │  │  3. Họp về tích hợp Z   │  │
│  │  450 tỷ Budget   82% used          │  │                         │  │
│  │   32 Đơn vị      95% reported      │  │  [See all actions →]    │  │
│  └─────────────────────────────────────┘  └─────────────────────────┘  │
│                                                                         │
│  ┌───────────────────────────────────────────────────────────────────┐ │
│  │              SYSTEM DISTRIBUTION BY STATUS                        │ │
│  │  [Donut Chart]     [Bar by Unit]      [Trend 12 months]          │ │
│  └───────────────────────────────────────────────────────────────────┘ │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### 5.3 Tab 2: Đầu tư & Ngân sách

```
┌─────────────────────────────────────────────────────────────────────────┐
│ TAB 2: ĐẦU TƯ & NGÂN SÁCH                            [Filter] [Export] │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌───────────────────────────────────────────────────────────────────┐ │
│  │                    INVESTMENT TREEMAP                             │ │
│  │  ┌─────────────────────┬─────────────┬────────────────────────┐  │ │
│  │  │                     │             │                        │  │ │
│  │  │     Đơn vị A       │  Đơn vị B   │       Đơn vị C         │  │ │
│  │  │      120 tỷ        │   85 tỷ     │        95 tỷ           │  │ │
│  │  │                     │             │                        │  │ │
│  │  ├─────────────────────┼─────────────┤                        │  │ │
│  │  │   Đơn vị D   │ E   │     F       │                        │  │ │
│  │  │    60 tỷ     │45tỷ │    45 tỷ    │                        │  │ │
│  │  └──────────────┴─────┴─────────────┴────────────────────────┘  │ │
│  │  [Click to drill down]                                           │ │
│  └───────────────────────────────────────────────────────────────────┘ │
│                                                                         │
│  ┌────────────────────────────┐  ┌────────────────────────────────┐   │
│  │    COST EFFICIENCY         │  │    GAP ANALYSIS                │   │
│  │                            │  │                                │   │
│  │  Top 5 High Cost/Low Use:  │  │  Under-invested areas:         │   │
│  │  1. System A - 50M/10 user │  │  • Cloud infrastructure        │   │
│  │  2. System B - 40M/15 user │  │  • Cybersecurity               │   │
│  │  ...                       │  │  • Data analytics platform     │   │
│  │                            │  │                                │   │
│  │  Potential saving: 2.5 tỷ  │  │  Investment needed: 15 tỷ      │   │
│  └────────────────────────────┘  └────────────────────────────────┘   │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### 5.4 Tab 3: Tích hợp & Liên thông

```
┌─────────────────────────────────────────────────────────────────────────┐
│ TAB 3: TÍCH HỢP & LIÊN THÔNG                         [Filter] [Export] │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌───────────────────────────────────────────────────────────────────┐ │
│  │                   INTEGRATION NETWORK MAP                         │ │
│  │                                                                   │ │
│  │              ●──────●                                             │ │
│  │             /        \         ● = System                         │ │
│  │            ●          ●        ─ = Integration                    │ │
│  │           / \        / \       🔴 = Silo (no connection)          │ │
│  │          ●   ●      ●   ●                                         │ │
│  │                                                                   │ │
│  │     🔴●    🔴●                 Silos detected: 12                 │ │
│  │                                                                   │ │
│  │  [Zoom] [Pan] [Filter by Domain] [Highlight Silos]               │ │
│  └───────────────────────────────────────────────────────────────────┘ │
│                                                                         │
│  ┌────────────────────────────┐  ┌────────────────────────────────┐   │
│  │  INTEGRATION OPPORTUNITIES │  │  DATA SHARING METRICS          │   │
│  │                            │  │                                │   │
│  │  AI Recommendations:       │  │  API calls/day: 1.2M ▲ 15%    │   │
│  │  1. HR + Payroll → Save 2M │  │  Success rate: 99.2%          │   │
│  │  2. CRM + Support → +30%   │  │  Avg latency: 120ms           │   │
│  │  3. Doc + Archive → ...    │  │  [View details →]             │   │
│  └────────────────────────────┘  └────────────────────────────────┘   │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### 5.5 Navigation & Drill-down

```
DRILL-DOWN HIERARCHY:

Ministry Overview
    │
    ├── By Unit (32 đơn vị)
    │       │
    │       └── By System (trong đơn vị)
    │               │
    │               └── System Detail Page
    │
    ├── By Domain (HR, Finance, Operations...)
    │       │
    │       └── Systems in Domain
    │
    ├── By Status (Active, Maintenance, Planning...)
    │       │
    │       └── Systems with that status
    │
    └── By Criticality (Critical, High, Medium, Low)
            │
            └── Systems at that level


CROSS-LINKING:
- From any system → See related systems (same unit, same domain, integrated with)
- From any unit → See all systems, compare with other units
- From any alert → Jump to affected system/unit
```

---

## 6. Data Requirements

### 6.1 Current Data Available
```yaml
From existing platform:
  - systems: id, name, status, criticality, unit, form_level, created_at...
  - organizations: id, name, type...
  - users: id, role, organization...
  - system_details: các trường chi tiết về mỗi hệ thống
```

### 6.2 Additional Data Needed

```yaml
For Investment Analysis:
  - budget_allocations: system_id, year, amount, category
  - cost_records: system_id, date, amount, type (license, maintenance, development)
  - roi_metrics: system_id, users_count, transactions_count

For Integration Analysis:
  - integrations: source_system_id, target_system_id, type, status
  - api_logs: endpoint, calls_count, success_rate, avg_latency
  - data_flows: source, target, data_type, volume, frequency

For Performance Analysis:
  - system_metrics: system_id, date, uptime, response_time, errors
  - user_activity: system_id, date, active_users, sessions
  - incidents: system_id, date, severity, status, resolution_time

For Compliance:
  - audits: system_id, date, findings, status
  - vulnerabilities: system_id, cve, severity, patch_status
  - compliance_scores: system_id, standard, score, date

For Projects:
  - projects: id, name, type, status, start_date, end_date
  - project_systems: project_id, system_id
  - project_budgets: project_id, planned, actual
```

---

## 7. Implementation Roadmap

### Phase 1: Foundation (MVP)
**Timeline: 4-6 weeks**

```
✅ Tab 1: Tổng quan (Executive Summary)
  - Health Score Widget
  - Key Metrics Cards
  - Basic Alert List
  - System Distribution Charts

✅ Tab 6: Đánh giá (partial)
  - Unit Comparison Table
  - Basic Ranking
```

### Phase 2: Investment & Analysis
**Timeline: 6-8 weeks**

```
✅ Tab 2: Đầu tư & Ngân sách
  - Investment Treemap
  - Cost Efficiency Analysis
  - Basic Gap Analysis

✅ Tab 4: Tối ưu (partial)
  - Legacy Radar
  - Redundancy Detection (manual rules)
```

### Phase 3: Integration & Roadmap
**Timeline: 6-8 weeks**

```
✅ Tab 3: Tích hợp & Liên thông
  - Integration Network Map
  - Data Sharing Metrics
  - Silo Detection

✅ Tab 5: Roadmap & Dự báo
  - Strategic Roadmap Timeline
  - Project Portfolio View
```

### Phase 4: AI & Advanced
**Timeline: 8-12 weeks**

```
✅ AI-Powered Features
  - Integration Opportunity Finder
  - Optimization Recommendations
  - Predictive Analytics
  - Natural Language Queries

✅ Advanced Visualizations
  - Interactive Network Graph
  - Scenario Simulation
  - What-if Analysis
```

---

## 8. Success Metrics

### 8.1 Dashboard Adoption
- Daily Active Users (especially executive level)
- Time spent on dashboard
- Features most used

### 8.2 Decision Support
- Number of strategic decisions informed by dashboard
- Time to insight (from question to answer)
- User satisfaction score

### 8.3 Business Impact
- Cost savings identified
- Integration opportunities discovered
- Legacy systems modernized
- Digital transformation score improvement

---

## 9. Appendix

### A. Glossary

| Term | Definition |
|------|------------|
| DX | Digital Transformation |
| ROI | Return on Investment |
| Silo | System không kết nối với hệ thống khác |
| Legacy | Hệ thống cũ, công nghệ lỗi thời |
| Integration | Kết nối, trao đổi dữ liệu giữa các hệ thống |

### B. References
- Research: `03-research/bo-truong-dashboard-best-practices.md`
- Current Dashboard: `07-resources/dashboard-redesign-spec.md`

### C. Version History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-01-26 | AI Assistant | Initial user stories and spec |

---

*"Data becomes insight. Insight becomes decision. Decision becomes action."*
