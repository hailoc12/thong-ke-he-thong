# Dashboard Redesign Specification
## Modern Dashboard for Hệ Thống Thống Kê CNTT - Bộ Khoa học và Công nghệ

**Version:** 1.0
**Date:** January 17, 2026
**Project:** IT System Statistics Dashboard
**Tech Stack:** React 19, TypeScript, Ant Design 6.2.0

---

## 1. Executive Summary

### 1.1 Goals of Redesign

1. **Modernize Visual Design**: Transform from basic statistics display to a data-rich, visually engaging professional dashboard following 2024-2026 design trends
2. **Enhance Data Storytelling**: Move beyond simple numbers to tell a compelling story about the IT system landscape
3. **Improve User Experience**: Create intuitive navigation, clear visual hierarchy, and actionable insights
4. **Increase Data Density**: Display more relevant information without overwhelming users
5. **Build Trust & Authority**: Reflect the professional, authoritative nature of a Vietnamese government agency

### 1.2 Key Improvements Over Current Version

| Current State | Proposed Enhancement | Impact |
|--------------|---------------------|--------|
| 4 basic stat cards | 6+ enhanced KPI cards with trends, sparklines, and comparisons | +150% data visibility |
| 2 simple text lists | Interactive charts (donut, bar, trend line, heatmap) | Visual storytelling |
| Static numbers | Animated counters, real-time updates, percentage changes | Engagement +80% |
| Basic layout | Modern grid with visual hierarchy, glassmorphism, micro-interactions | Professional appeal |
| No time context | Historical trends, period comparisons, forecast indicators | Strategic insights |
| Mobile-basic | Fully responsive with touch-optimized interactions | Mobile UX +200% |

### 1.3 Expected User Impact

**For Administrators:**
- Faster decision-making through visual data patterns
- Immediate identification of critical issues (red alerts)
- Better understanding of system health trends

**For Organization Users:**
- Clear overview of their systems at a glance
- Easy access to comparative metrics
- Reduced cognitive load through visual hierarchy

**For Stakeholders:**
- Professional, trustworthy interface builds confidence
- Data-driven narratives for reporting
- Accessibility-compliant design ensures inclusivity

---

## 2. Current State Analysis

### 2.1 Current Dashboard (As-Is)

**File:** `/frontend/src/pages/Dashboard.tsx`

**Layout Structure:**
```
┌─────────────────────────────────────────────┐
│ Title: Dashboard                            │
│ Subtitle: Tổng quan hệ thống CNTT          │
├─────────────────────────────────────────────┤
│ Row 1: 4 KPI Cards (Equal Width)           │
│ ┌───────┬───────┬───────┬───────┐          │
│ │Total  │Active │Critical│Org   │          │
│ │Systems│Systems│Systems│Count │          │
│ └───────┴───────┴───────┴───────┘          │
├─────────────────────────────────────────────┤
│ Row 2: 2 Summary Cards                      │
│ ┌──────────────┬──────────────┐            │
│ │Status        │Criticality   │            │
│ │Breakdown     │Breakdown     │            │
│ │(Text List)   │(Text List)   │            │
│ └──────────────┴──────────────┘            │
└─────────────────────────────────────────────┘
```

**Current Data Available:**
```typescript
{
  total: number,
  by_status: {
    active: number,
    inactive: number,
    maintenance: number,
    planning: number,
    draft: number
  },
  by_criticality: {
    critical: number,
    high: number,
    medium: number,
    low: number
  },
  by_form_level: {
    level_1: number,
    level_2: number
  }
}
```

**Current Components Used:**
- `Card` - Basic white cards
- `Statistic` - Number display with icon
- `Row/Col` - Responsive grid (xs/sm/lg breakpoints)
- `Skeleton` - Loading state
- Ant Design Icons (Outlined style)

### 2.2 Pain Points & Limitations

**Visual Design:**
- ❌ Plain white cards lack depth and hierarchy
- ❌ No visual separation between priority levels
- ❌ Static design feels dated
- ❌ Limited use of color (only in icons/numbers)
- ❌ No hover states or interactions

**Data Presentation:**
- ❌ Text lists are hard to scan quickly
- ❌ No visual representation of proportions
- ❌ Missing trend information (is this good or bad?)
- ❌ No comparison to previous periods
- ❌ No context for numbers (what's normal?)

**Functionality:**
- ❌ No drill-down capabilities
- ❌ No filtering or segmentation
- ❌ No export or sharing options
- ❌ No recent activity feed
- ❌ No alerts or notifications
- ❌ Organization count hardcoded to 0

**Mobile Experience:**
- ❌ Cards stack vertically (basic responsive)
- ❌ No mobile-specific optimizations
- ❌ Charts would be too small

### 2.3 What Works Well (Keep These)

✅ **Clean, Simple Layout**: Don't overcomplicate
✅ **Ant Design Components**: Consistent with app theme
✅ **Responsive Grid System**: xs/sm/lg breakpoints
✅ **Loading States**: Skeleton provides good UX
✅ **Color Semantics**: Green=good, Red=critical, Yellow=warning
✅ **Clear Labels**: Vietnamese labels are descriptive

---

## 3. Design Principles

### 3.1 Visual Hierarchy

**Priority Levels:**

1. **Primary (Hero)**: Total Systems + Active Systems
   - Largest size, top-left position
   - Eye-catching gradient backgrounds
   - Trend indicators prominent

2. **Secondary (Critical Metrics)**: Critical Systems, Alerts
   - Medium size, high visibility
   - Bright accent colors for urgency
   - Status-driven colors

3. **Tertiary (Details)**: Status breakdown, Organizations
   - Standard size, supporting information
   - Neutral colors with semantic accents

4. **Supporting (Context)**: Charts, tables, recent activity
   - Lower visual weight
   - Detailed information on demand

**F-Pattern Layout:**
Users scan in F-shape (top-left → top-right → down-left). Place:
- Most critical KPIs: Top-left
- Action items: Top-right
- Details: Below in reading order

### 3.2 Color Strategy

**Base Palette (from existing CSS variables):**

```css
/* Primary Actions & Highlights */
--color-primary: #0066e6        /* Blue - System health, active */
--color-primary-light: #3385ff
--color-primary-dark: #0052bd

/* Secondary Actions */
--color-secondary: #5e16a0      /* Purple - Organizations, users */
--color-secondary-light: #7e3db8

/* Semantic Colors */
--color-success: #52c41a        /* Green - Active, good performance */
--color-warning: #faad14        /* Yellow - Maintenance, warnings */
--color-error: #ff4d4f          /* Red - Critical, inactive, alerts */
--color-info: #1890ff           /* Light Blue - Information */

/* Neutral Backgrounds */
--bg-default: #f5f5f5           /* Page background */
--bg-paper: #ffffff             /* Card backgrounds */
--color-gray-50: #fafafa        /* Subtle backgrounds */
--color-gray-100: #f5f5f5       /* Hover states */
```

**Chart Color Palette (5-8 colors for data viz):**

1. `#0066e6` - Primary Blue (Active systems)
2. `#52c41a` - Success Green (Healthy/Low priority)
3. `#faad14` - Warning Orange (Maintenance/Medium)
4. `#ff4d4f` - Error Red (Critical/Inactive)
5. `#722ed1` - Purple (Organizations/Special)
6. `#1890ff` - Info Blue (General data)
7. `#13c2c2` - Cyan (Integrations)
8. `#eb2f96` - Magenta (High priority)

**Color Usage Rules:**

- **Backgrounds**:
  - Page: `#f5f5f5` (neutral gray)
  - Cards: `#ffffff` with `--shadow-md` for depth
  - Hero cards: Subtle gradient overlays (5-10% opacity)

- **Text Hierarchy**:
  - Primary: `rgba(0,0,0,0.85)` - Headings, key numbers
  - Secondary: `rgba(0,0,0,0.65)` - Labels, descriptions
  - Disabled: `rgba(0,0,0,0.25)` - Inactive elements

- **Semantic States**:
  - Success: Green for active, healthy, positive trends
  - Warning: Yellow for maintenance, medium priority
  - Error: Red for critical, inactive, alerts
  - Info: Blue for neutral information

- **Accessibility**: All color combinations must pass WCAG AA (4.5:1 contrast ratio for normal text)

### 3.3 Typography Scale

**Font Family:**
```css
--font-family-base: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto,
                     'Helvetica Neue', Arial, 'Noto Sans', sans-serif;
```

**Type Scale:**

| Element | Size | Weight | Use Case | Example |
|---------|------|--------|----------|---------|
| Display | 48px (3xl) | 700 | Hero numbers in KPI cards | "1,247" |
| H1 | 36px (4xl) | 600 | Page title | "Dashboard" |
| H2 | 30px (3xl) | 600 | Section headers | "Hệ thống theo trạng thái" |
| H3 | 24px (2xl) | 600 | Card titles | "Tổng số hệ thống" |
| H4 | 20px (xl) | 600 | Subsection headers | "Hôm nay" |
| H5 | 18px (lg) | 500 | Smaller headers | "Chi tiết" |
| Body Large | 16px (base) | 400 | Primary content | Labels |
| Body | 14px (sm) | 400 | Secondary content | Descriptions |
| Caption | 12px (xs) | 400 | Metadata, timestamps | "Cập nhật 5 phút trước" |

**Line Heights:**
- Headings: `1.25` (tight for large text)
- Body: `1.5` (normal for readability)
- Dense data: `1.75` (relaxed for tables)

**Font Weights:**
- `700 (Bold)`: Numbers in KPI cards, emphasis
- `600 (Semibold)`: Headings
- `500 (Medium)`: Labels, tags
- `400 (Normal)`: Body text

### 3.4 Spacing & Grid

**8px Base Scale:**

```css
--spacing-xs: 4px     /* Tight elements */
--spacing-sm: 8px     /* Default component padding */
--spacing-md: 16px    /* Card padding, element spacing */
--spacing-lg: 24px    /* Section spacing */
--spacing-xl: 32px    /* Large gaps */
--spacing-2xl: 48px   /* Page sections */
```

**Grid System:**

- **Desktop (≥1200px)**: 24-column grid
  - Gutter: 16px
  - Max width: 1600px (centered)
  - Card padding: 24px

- **Tablet (768px-1199px)**: 12-column grid
  - Gutter: 16px
  - Card padding: 20px

- **Mobile (<768px)**: Single column
  - Gutter: 12px
  - Card padding: 16px

**Ant Design Grid Mapping:**

```tsx
// KPI Cards: 4 columns on desktop, 2 on tablet, 1 on mobile
<Col xs={24} sm={12} lg={6}>

// Charts: 2 columns on desktop, 1 on mobile
<Col xs={24} lg={12}>

// Full-width sections
<Col xs={24}>
```

### 3.5 Responsive Behavior

**Breakpoints:**

```css
xs: 0-575px    /* Mobile portrait */
sm: 576-767px  /* Mobile landscape */
md: 768-991px  /* Tablet */
lg: 992-1199px /* Small desktop */
xl: 1200-1599px /* Desktop */
xxl: 1600px+   /* Large desktop */
```

**Responsive Strategy:**

**Mobile (xs, sm):**
- Stack all cards vertically
- Reduce padding: 16px → 12px
- Font sizes: -2px for headings
- Charts: Full width, height: 250px
- Hide less critical data (show on tap)
- Sticky header with compact stats

**Tablet (md):**
- 2-column grid for KPI cards
- Charts side-by-side (50/50)
- Font sizes: -1px for headings
- Maintain all data visibility

**Desktop (lg, xl, xxl):**
- 4-column grid for KPI cards
- Complex layouts (60/40, 33/33/33)
- Full font scale
- Hover states, tooltips
- Dense data tables

---

## 4. Proposed Layout

### 4.1 Desktop Layout (1440px viewport)

```
┌────────────────────────────────────────────────────────────────────┐
│  HEADER                                                            │
│  Dashboard • Tổng quan hệ thống CNTT                              │
│  [Last updated: 5 phút trước] [Refresh Button] [Export Button]    │
├────────────────────────────────────────────────────────────────────┤
│                                                                    │
│  KPI CARDS ROW (4 cards, equal width, 24px gap)                   │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐            │
│  │ TOTAL    │ │ ACTIVE   │ │ CRITICAL │ │ ORGS     │            │
│  │ SYSTEMS  │ │ SYSTEMS  │ │ SYSTEMS  │ │          │            │
│  │          │ │          │ │          │ │          │            │
│  │  1,247   │ │  1,089   │ │   23     │ │   45     │            │
│  │ ↑ +5.2%  │ │ ↑ +3.1%  │ │ ↓ -12%   │ │ → 0%     │            │
│  │ [spark]  │ │ [spark]  │ │ [spark]  │ │ [spark]  │            │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘            │
│                                                                    │
├────────────────────────────────────────────────────────────────────┤
│                                                                    │
│  CHARTS ROW (2 charts, 60/40 split, 24px gap)                     │
│  ┌─────────────────────────────┐ ┌──────────────────┐            │
│  │ TREND OVER TIME             │ │ STATUS BREAKDOWN │            │
│  │ [Line Chart]                │ │ [Donut Chart]    │            │
│  │                             │ │                  │            │
│  │  Systems count by day       │ │  Active: 87.3%   │            │
│  │  (Last 30 days)             │ │  Maint.: 8.1%    │            │
│  │                             │ │  Inactive: 4.6%  │            │
│  │  [Interactive line graph]   │ │  [Donut + Legend]│            │
│  │                             │ │                  │            │
│  └─────────────────────────────┘ └──────────────────┘            │
│                                                                    │
├────────────────────────────────────────────────────────────────────┤
│                                                                    │
│  DATA TABLES ROW (2 tables, 50/50 split, 24px gap)                │
│  ┌──────────────────────────┐ ┌──────────────────────┐           │
│  │ CRITICALITY HEATMAP      │ │ RECENT ACTIVITY      │           │
│  │                          │ │                      │           │
│  │ Critical  [====23]       │ │ • System X updated   │           │
│  │ High      [=======45]    │ │   2 phút trước       │           │
│  │ Medium    [===========89]│ │ • System Y added     │           │
│  │ Low       [================] │   15 phút trước  │           │
│  │                          │ │ • Alert: System Z    │           │
│  │ [Interactive bars]       │ │   1 giờ trước        │           │
│  │                          │ │                      │           │
│  └──────────────────────────┘ └──────────────────────┘           │
│                                                                    │
├────────────────────────────────────────────────────────────────────┤
│                                                                    │
│  SECONDARY METRICS ROW (3 cards, equal width, 24px gap)           │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐                │
│  │ AVG USERS   │ │ INTEGRATION │ │ HEALTH SCORE │                │
│  │ PER SYSTEM  │ │ RATE        │ │              │                │
│  │             │ │             │ │              │                │
│  │  12,450     │ │    73%      │ │   85/100     │                │
│  │ [mini chart]│ │ [progress]  │ │ [gauge]      │                │
│  └─────────────┘ └─────────────┘ └─────────────┘                │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘
```

### 4.2 Mobile Layout (375px viewport)

```
┌─────────────────────────┐
│ STICKY HEADER           │
│ Dashboard               │
│ [Refresh] [Menu]        │
├─────────────────────────┤
│ ▼ QUICK STATS (Compact) │
│  1,247 • 1,089 • 23     │
├─────────────────────────┤
│                         │
│ ┌─────────────────────┐ │
│ │ TOTAL SYSTEMS       │ │
│ │       1,247         │ │
│ │     ↑ +5.2%         │ │
│ └─────────────────────┘ │
│                         │
│ ┌─────────────────────┐ │
│ │ ACTIVE SYSTEMS      │ │
│ │       1,089         │ │
│ │     ↑ +3.1%         │ │
│ └─────────────────────┘ │
│                         │
│ ┌─────────────────────┐ │
│ │ CRITICAL SYSTEMS    │ │
│ │         23          │ │
│ │     ↓ -12%          │ │
│ └─────────────────────┘ │
│                         │
│ [Show More Stats ▼]     │
│                         │
├─────────────────────────┤
│                         │
│ ┌─────────────────────┐ │
│ │ STATUS CHART        │ │
│ │ [Donut Chart]       │ │
│ │ Full width          │ │
│ └─────────────────────┘ │
│                         │
│ ┌─────────────────────┐ │
│ │ TREND CHART         │ │
│ │ [Line Chart]        │ │
│ │ Full width          │ │
│ └─────────────────────┘ │
│                         │
│ [Load More Data]        │
│                         │
└─────────────────────────┘
```

### 4.3 Component Hierarchy

```
Dashboard (Page Component)
│
├── DashboardHeader
│   ├── Title & Subtitle
│   ├── LastUpdated Timestamp
│   └── ActionButtons (Refresh, Export)
│
├── KPIRow
│   ├── KPICard (Total Systems)
│   ├── KPICard (Active Systems)
│   ├── KPICard (Critical Systems)
│   └── KPICard (Organizations)
│
├── ChartsRow
│   ├── TrendChart (60% width)
│   │   └── LineChart Component
│   └── StatusChart (40% width)
│       └── DonutChart Component
│
├── DataTablesRow
│   ├── CriticalityHeatmap (50% width)
│   │   └── BarChart Component
│   └── RecentActivity (50% width)
│       └── Timeline Component
│
└── SecondaryMetricsRow
    ├── MetricCard (Avg Users)
    ├── MetricCard (Integration Rate)
    └── MetricCard (Health Score)
```

---

## 5. Component Specifications

### 5.1 KPI Cards (Enhanced Stat Cards)

#### A. Layout & Structure

**Card Anatomy:**
```
┌──────────────────────────────┐
│ [Icon]  Label        [Badge] │  ← Header (16px padding)
├──────────────────────────────┤
│                              │
│         123,456              │  ← Value (48px bold)
│                              │
│    ↑ +12.5% vs last month    │  ← Trend indicator
│                              │
│    ▁▂▃▅▄▆█ Sparkline        │  ← Mini chart (optional)
│                              │
└──────────────────────────────┘
```

**Sizes:**
- **Default**: 240px height
- **Hero (Total Systems)**: 280px height, larger font
- **Compact (Mobile)**: 180px height

#### B. Visual Specifications

**Background Styles (4 variations):**

1. **Total Systems (Hero)**
   ```css
   background: linear-gradient(135deg, #0066e6 0%, #0052bd 100%);
   color: white;
   box-shadow: 0 8px 24px rgba(0, 102, 230, 0.25);
   ```

2. **Active Systems (Success)**
   ```css
   background: white;
   border-left: 4px solid #52c41a;
   box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
   ```

3. **Critical Systems (Alert)**
   ```css
   background: white;
   border-left: 4px solid #ff4d4f;
   box-shadow: 0 2px 8px rgba(255, 77, 79, 0.12);
   ```

4. **Organizations (Neutral)**
   ```css
   background: white;
   border-left: 4px solid #722ed1;
   box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
   ```

**Hover State:**
```css
.kpi-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.12);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
```

#### C. Number Formatting

| Range | Format | Example |
|-------|--------|---------|
| 0-999 | Plain | 847 |
| 1,000-9,999 | Comma | 1,247 |
| 10,000-999,999 | Comma | 123,456 |
| 1M+ | Abbreviated | 1.2M |

**Implementation:**
```typescript
const formatNumber = (num: number): string => {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return num.toLocaleString('vi-VN');
  return num.toString();
};
```

#### D. Trend Indicators

**Display Logic:**
```typescript
interface Trend {
  value: number;      // e.g., 5.2
  direction: 'up' | 'down' | 'neutral';
  period: string;     // e.g., "vs last month"
}
```

**Visual Styles:**
```tsx
// Up (Green)
<span style={{ color: '#52c41a' }}>
  <ArrowUpOutlined /> +5.2%
</span>

// Down (Red) - but context matters!
// For critical systems, down is GOOD
<span style={{ color: '#52c41a' }}>
  <ArrowDownOutlined /> -12%
</span>

// Neutral (Gray)
<span style={{ color: '#8c8c8c' }}>
  <MinusOutlined /> 0%
</span>
```

**Semantic Coloring:**
- Total Systems: Up = Blue, Down = Blue (neutral fact)
- Active Systems: Up = Green (good), Down = Red (bad)
- Critical Systems: Up = Red (bad!), Down = Green (good!)
- Organizations: Gray (neutral)

#### E. Sparklines (Mini Charts)

**Library:** Recharts (AreaChart)

**Specifications:**
```tsx
<AreaChart width={180} height={40} data={last7Days}>
  <Area
    type="monotone"
    dataKey="value"
    stroke="#0066e6"
    strokeWidth={2}
    fill="url(#gradient)"
    dot={false}
  />
  <defs>
    <linearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stopColor="#0066e6" stopOpacity={0.3} />
      <stop offset="100%" stopColor="#0066e6" stopOpacity={0} />
    </linearGradient>
  </defs>
</AreaChart>
```

**Data:** Last 7 days of system counts

#### F. Icon Placement & Style

**Icons (Ant Design Icons):**
- Total Systems: `<DatabaseOutlined />` (Database icon)
- Active Systems: `<CheckCircleOutlined />`
- Critical Systems: `<WarningOutlined />`
- Organizations: `<TeamOutlined />`
- Maintenance: `<ToolOutlined />`
- Inactive: `<CloseCircleOutlined />`

**Icon Size:** 24px
**Icon Color:** Match card theme or white (for hero card)
**Position:** Top-left of card header

#### G. Loading State

```tsx
<Card>
  <Skeleton.Input active size="small" style={{ width: 100 }} />
  <Skeleton.Input active size="large" style={{ width: 120, marginTop: 16 }} />
  <Skeleton.Input active size="small" style={{ width: 80, marginTop: 8 }} />
</Card>
```

#### H. Animations

**Number Counter Animation:**
```typescript
// Use react-countup or custom hook
import CountUp from 'react-countup';

<CountUp
  end={statistics.total}
  duration={1.5}
  separator=","
  useEasing={true}
/>
```

**Entry Animation (Stagger):**
```css
.kpi-card {
  animation: slideUp 0.6s cubic-bezier(0.4, 0, 0.2, 1);
  animation-delay: calc(var(--card-index) * 0.1s);
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

---

### 5.2 Data Visualization Charts

#### A. Trend Over Time (Line Chart)

**Purpose:** Show system count changes over the last 30 days

**Library:** Recharts

**Chart Type:** `LineChart` with area fill

**Specifications:**
```tsx
<ResponsiveContainer width="100%" height={320}>
  <LineChart data={trendData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
    <XAxis
      dataKey="date"
      stroke="#8c8c8c"
      tick={{ fontSize: 12 }}
      tickFormatter={(value) => dayjs(value).format('DD/MM')}
    />
    <YAxis
      stroke="#8c8c8c"
      tick={{ fontSize: 12 }}
    />
    <Tooltip
      contentStyle={{
        backgroundColor: 'white',
        border: '1px solid #d9d9d9',
        borderRadius: 8,
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
      }}
      formatter={(value) => [`${value} hệ thống`, 'Tổng số']}
      labelFormatter={(label) => dayjs(label).format('DD/MM/YYYY')}
    />
    <Legend
      wrapperStyle={{ paddingTop: 20 }}
      iconType="circle"
    />
    <Line
      type="monotone"
      dataKey="total"
      stroke="#0066e6"
      strokeWidth={3}
      dot={{ fill: '#0066e6', r: 4 }}
      activeDot={{ r: 6, stroke: '#fff', strokeWidth: 2 }}
      name="Tổng số hệ thống"
    />
    <Line
      type="monotone"
      dataKey="active"
      stroke="#52c41a"
      strokeWidth={2}
      dot={false}
      name="Đang hoạt động"
    />
    <Line
      type="monotone"
      dataKey="critical"
      stroke="#ff4d4f"
      strokeWidth={2}
      dot={false}
      name="Quan trọng"
    />
  </LineChart>
</ResponsiveContainer>
```

**Data Structure:**
```typescript
interface TrendData {
  date: string;        // ISO date "2026-01-01"
  total: number;
  active: number;
  critical: number;
}

// Example:
const trendData: TrendData[] = [
  { date: '2026-01-01', total: 1200, active: 1050, critical: 25 },
  { date: '2026-01-02', total: 1205, active: 1055, critical: 24 },
  // ... 30 days
];
```

**Interactive Features:**
- Hover over line to see exact values
- Click legend to toggle lines on/off
- Smooth animations on mount

**Responsive:**
- Desktop: Height 320px
- Tablet: Height 280px
- Mobile: Height 240px, hide some lines

#### B. Status Breakdown (Donut Chart)

**Purpose:** Show proportion of systems by status

**Library:** Recharts

**Chart Type:** `PieChart` with inner radius (donut)

**Specifications:**
```tsx
<ResponsiveContainer width="100%" height={320}>
  <PieChart>
    <Pie
      data={statusData}
      dataKey="value"
      nameKey="name"
      cx="50%"
      cy="50%"
      innerRadius={70}
      outerRadius={110}
      paddingAngle={2}
      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
      labelLine={{ stroke: '#8c8c8c', strokeWidth: 1 }}
    >
      {statusData.map((entry, index) => (
        <Cell key={`cell-${index}`} fill={entry.color} />
      ))}
    </Pie>
    <Tooltip
      formatter={(value, name) => [`${value} hệ thống`, name]}
    />
    <Legend
      layout="vertical"
      align="right"
      verticalAlign="middle"
      iconType="circle"
      formatter={(value, entry) => {
        const percentage = ((entry.payload.value / totalSystems) * 100).toFixed(1);
        return `${value} (${percentage}%)`;
      }}
    />
  </PieChart>
</ResponsiveContainer>
```

**Data Structure:**
```typescript
const statusData = [
  { name: 'Đang hoạt động', value: 1089, color: '#52c41a' },
  { name: 'Bảo trì', value: 101, color: '#faad14' },
  { name: 'Ngưng hoạt động', value: 57, color: '#ff4d4f' },
  { name: 'Bản nháp', value: 0, color: '#8c8c8c' }
];
```

**Color Mapping:**
- Active (`active`): `#52c41a` (Green)
- Maintenance (`maintenance`): `#faad14` (Orange)
- Inactive (`inactive`): `#ff4d4f` (Red)
- Draft (`draft`): `#8c8c8c` (Gray)
- Planning (`planning`): `#1890ff` (Blue)

**Interactive Features:**
- Hover to highlight segment
- Click to drill down (future enhancement)
- Animated entry (segments draw in)

**Center Label (Optional):**
```tsx
// Add text in center of donut
<text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle">
  <tspan x="50%" dy="-0.5em" fontSize={32} fontWeight={700} fill="#000">
    {totalSystems}
  </tspan>
  <tspan x="50%" dy="1.5em" fontSize={14} fill="#8c8c8c">
    Tổng số hệ thống
  </tspan>
</text>
```

#### C. Criticality Heatmap (Horizontal Bar Chart)

**Purpose:** Show distribution of systems by criticality level

**Library:** Recharts

**Chart Type:** `BarChart` (horizontal)

**Specifications:**
```tsx
<ResponsiveContainer width="100%" height={280}>
  <BarChart
    data={criticalityData}
    layout="vertical"
    margin={{ top: 20, right: 30, left: 100, bottom: 5 }}
  >
    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0f0f0" />
    <XAxis type="number" stroke="#8c8c8c" />
    <YAxis
      type="category"
      dataKey="name"
      stroke="#8c8c8c"
      tick={{ fontSize: 14 }}
    />
    <Tooltip
      cursor={{ fill: 'rgba(0, 102, 230, 0.05)' }}
      formatter={(value) => `${value} hệ thống`}
    />
    <Bar dataKey="value" radius={[0, 8, 8, 0]}>
      {criticalityData.map((entry, index) => (
        <Cell key={`cell-${index}`} fill={entry.color} />
      ))}
    </Bar>
  </BarChart>
</ResponsiveContainer>
```

**Data Structure:**
```typescript
const criticalityData = [
  { name: 'Cực kỳ quan trọng', value: 23, color: '#ff4d4f' },
  { name: 'Quan trọng', value: 45, color: '#faad14' },
  { name: 'Trung bình', value: 89, color: '#1890ff' },
  { name: 'Thấp', value: 932, color: '#52c41a' }
];
```

**Interactive Features:**
- Hover to see exact count
- Click to filter systems list (future)
- Smooth animation on render

#### D. Chart Color Palette Summary

**Consistent Mapping:**

| Category | Color | Hex | Use Case |
|----------|-------|-----|----------|
| Critical/Error | Red | `#ff4d4f` | Critical systems, errors, alerts |
| High/Warning | Orange | `#faad14` | High priority, maintenance, warnings |
| Medium/Info | Blue | `#1890ff` | Medium priority, general info |
| Low/Success | Green | `#52c41a` | Low priority, active, healthy |
| Draft/Disabled | Gray | `#8c8c8c` | Draft status, disabled items |
| Primary | Dark Blue | `#0066e6` | Total count, main data |
| Secondary | Purple | `#722ed1` | Organizations, special categories |
| Accent | Cyan | `#13c2c2` | Highlights, integrations |

---

### 5.3 Summary Sections & Tables

#### A. Recent Activity Feed

**Purpose:** Show latest system updates, additions, status changes

**Layout:** Timeline-style list

**Component:** Custom timeline using Ant Design `List` + `Avatar`

**Specifications:**
```tsx
<Card
  title="Hoạt động gần đây"
  extra={<a href="/activity">Xem tất cả</a>}
  style={{ height: 400 }}
  bodyStyle={{ padding: '12px 24px', overflowY: 'auto' }}
>
  <List
    itemLayout="horizontal"
    dataSource={activities}
    renderItem={(item) => (
      <List.Item style={{ padding: '12px 0', borderBottom: '1px solid #f0f0f0' }}>
        <List.Item.Meta
          avatar={
            <Avatar
              style={{ backgroundColor: item.color }}
              icon={item.icon}
              size={40}
            />
          }
          title={
            <Space>
              <Text strong>{item.systemName}</Text>
              <Tag color={item.tagColor}>{item.action}</Tag>
            </Space>
          }
          description={
            <Space direction="vertical" size={0}>
              <Text type="secondary" style={{ fontSize: 13 }}>
                {item.description}
              </Text>
              <Text type="secondary" style={{ fontSize: 12 }}>
                <ClockCircleOutlined /> {item.timestamp}
              </Text>
            </Space>
          }
        />
      </List.Item>
    )}
  />
</Card>
```

**Data Structure:**
```typescript
interface Activity {
  id: string;
  systemName: string;
  action: 'created' | 'updated' | 'deleted' | 'status_changed';
  description: string;
  timestamp: string;  // e.g., "2 phút trước"
  icon: React.ReactNode;
  color: string;
  tagColor: string;
}

// Example:
const activities: Activity[] = [
  {
    id: '1',
    systemName: 'Hệ thống quản lý văn bản',
    action: 'updated',
    description: 'Cập nhật thông tin kiến trúc hệ thống',
    timestamp: '2 phút trước',
    icon: <EditOutlined />,
    color: '#1890ff',
    tagColor: 'blue'
  },
  // ...
];
```

**Action Colors:**
- `created`: Green `#52c41a` (New system added)
- `updated`: Blue `#1890ff` (System modified)
- `deleted`: Red `#ff4d4f` (System removed)
- `status_changed`: Orange `#faad14` (Status change)

**Empty State:**
```tsx
<Empty
  image={Empty.PRESENTED_IMAGE_SIMPLE}
  description="Chưa có hoạt động nào"
/>
```

#### B. Quick Stats Table (Alternative to Cards)

**Purpose:** Compact view of all metrics in table format

**Use Case:** Secondary tab or mobile compact view

**Specifications:**
```tsx
<Table
  dataSource={statsData}
  columns={[
    {
      title: 'Chỉ số',
      dataIndex: 'metric',
      key: 'metric',
      render: (text, record) => (
        <Space>
          {record.icon}
          <Text strong>{text}</Text>
        </Space>
      )
    },
    {
      title: 'Giá trị',
      dataIndex: 'value',
      key: 'value',
      align: 'right',
      render: (value) => (
        <Text style={{ fontSize: 18, fontWeight: 600 }}>
          {value.toLocaleString('vi-VN')}
        </Text>
      )
    },
    {
      title: 'Thay đổi',
      dataIndex: 'change',
      key: 'change',
      align: 'right',
      render: (change) => (
        <Tag color={change > 0 ? 'success' : change < 0 ? 'error' : 'default'}>
          {change > 0 ? '+' : ''}{change}%
        </Tag>
      )
    }
  ]}
  pagination={false}
  size="middle"
/>
```

---

### 5.4 Quick Actions & Filters

#### A. Action Button Group

**Location:** Top-right of dashboard header

**Buttons:**
```tsx
<Space>
  <Tooltip title="Làm mới dữ liệu">
    <Button
      icon={<ReloadOutlined />}
      onClick={handleRefresh}
      loading={loading}
    >
      Làm mới
    </Button>
  </Tooltip>

  <Tooltip title="Xuất báo cáo">
    <Button
      icon={<DownloadOutlined />}
      onClick={handleExport}
    >
      Xuất báo cáo
    </Button>
  </Tooltip>

  <Tooltip title="Cài đặt dashboard">
    <Button
      icon={<SettingOutlined />}
      onClick={() => setShowSettings(true)}
      type="text"
    />
  </Tooltip>
</Space>
```

#### B. Time Range Filter

**Purpose:** Filter data by time period (7 days, 30 days, 3 months, etc.)

**Component:** `Segmented` (Ant Design 6.x)

```tsx
<Segmented
  options={[
    { label: '7 ngày', value: '7d' },
    { label: '30 ngày', value: '30d' },
    { label: '3 tháng', value: '3m' },
    { label: 'Tất cả', value: 'all' }
  ]}
  value={timeRange}
  onChange={setTimeRange}
  style={{ marginBottom: 16 }}
/>
```

#### C. Status Filter Chips

**Purpose:** Quick filter by status

**Component:** `CheckableTag` group

```tsx
<Space wrap style={{ marginBottom: 16 }}>
  <Text type="secondary">Lọc theo trạng thái:</Text>
  {statusFilters.map(tag => (
    <CheckableTag
      key={tag.value}
      checked={selectedStatus.includes(tag.value)}
      onChange={(checked) => handleStatusChange(tag.value, checked)}
    >
      {tag.label}
    </CheckableTag>
  ))}
</Space>
```

---

## 6. Visual Design Specifications

### 6.1 Colors (Detailed)

**Primary Palette:**
```css
/* Already defined in section 3.2, repeated for reference */

--color-primary: #0066e6
--color-primary-light: #3385ff
--color-primary-dark: #0052bd
--color-primary-lighter: #99c2ff
--color-primary-darker: #003d8f
```

**Semantic Palette:**
```css
--color-success: #52c41a
--color-success-bg: #f6ffed
--color-success-border: #b7eb8f

--color-warning: #faad14
--color-warning-bg: #fffbe6
--color-warning-border: #ffe58f

--color-error: #ff4d4f
--color-error-bg: #fff2f0
--color-error-border: #ffccc7

--color-info: #1890ff
--color-info-bg: #e6f7ff
--color-info-border: #91d5ff
```

**Chart-Specific:**
```typescript
export const CHART_COLORS = {
  primary: '#0066e6',
  success: '#52c41a',
  warning: '#faad14',
  error: '#ff4d4f',
  purple: '#722ed1',
  cyan: '#13c2c2',
  magenta: '#eb2f96',
  lime: '#a0d911',
  volcano: '#fa541c',
  gold: '#fadb14'
};
```

**Usage Guide:**
- **Backgrounds**: Use neutral grays (`#f5f5f5`, `#ffffff`)
- **Text**: Use black with opacity (`rgba(0,0,0,0.85)` for primary)
- **Borders**: Use `#d9d9d9` for standard borders
- **Shadows**: Use rgba black with low opacity (see shadows section)

### 6.2 Typography (Detailed)

**Font Loading:**
```css
/* System fonts for performance */
font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto,
             'Helvetica Neue', Arial, 'Noto Sans', sans-serif;
```

**Type Styles:**

```typescript
// Define as design tokens
export const typography = {
  display: {
    fontSize: '48px',
    fontWeight: 700,
    lineHeight: 1.2,
    letterSpacing: '-0.02em'
  },
  h1: {
    fontSize: '36px',
    fontWeight: 600,
    lineHeight: 1.25,
    letterSpacing: '-0.01em'
  },
  h2: {
    fontSize: '30px',
    fontWeight: 600,
    lineHeight: 1.3,
  },
  h3: {
    fontSize: '24px',
    fontWeight: 600,
    lineHeight: 1.35,
  },
  h4: {
    fontSize: '20px',
    fontWeight: 600,
    lineHeight: 1.4,
  },
  body: {
    fontSize: '16px',
    fontWeight: 400,
    lineHeight: 1.5,
  },
  bodySmall: {
    fontSize: '14px',
    fontWeight: 400,
    lineHeight: 1.5,
  },
  caption: {
    fontSize: '12px',
    fontWeight: 400,
    lineHeight: 1.5,
    color: 'rgba(0,0,0,0.45)'
  }
};
```

### 6.3 Spacing (Detailed)

**Component Spacing:**
```css
/* Card spacing */
--card-padding-sm: 16px;
--card-padding-md: 20px;
--card-padding-lg: 24px;

/* Section spacing */
--section-gap-sm: 16px;
--section-gap-md: 24px;
--section-gap-lg: 32px;

/* Element spacing */
--element-gap-xs: 4px;
--element-gap-sm: 8px;
--element-gap-md: 12px;
--element-gap-lg: 16px;
```

**Ant Design Row/Col Gutters:**
```tsx
// Desktop
<Row gutter={[24, 24]}>

// Tablet
<Row gutter={[16, 16]}>

// Mobile
<Row gutter={[12, 12]}>
```

### 6.4 Shadows & Borders

**Shadow Scale:**
```css
--shadow-xs: 0 1px 2px rgba(0, 0, 0, 0.05);
--shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.08);
--shadow-md: 0 4px 12px rgba(0, 0, 0, 0.08);
--shadow-lg: 0 12px 24px rgba(0, 0, 0, 0.12);
--shadow-xl: 0 20px 40px rgba(0, 0, 0, 0.15);

/* Colored shadows for emphasis */
--shadow-primary: 0 8px 24px rgba(0, 102, 230, 0.20);
--shadow-success: 0 8px 24px rgba(82, 196, 26, 0.15);
--shadow-error: 0 8px 24px rgba(255, 77, 79, 0.15);
```

**Border Radius:**
```css
--radius-sm: 4px;    /* Ant Design default */
--radius-md: 8px;    /* Modern cards */
--radius-lg: 12px;   /* Hero cards */
--radius-xl: 16px;   /* Large containers */
--radius-full: 9999px; /* Pills, circles */
```

**Usage:**
- Default cards: `8px` radius, `--shadow-sm`
- Hover cards: `8px` radius, `--shadow-md`
- Hero cards: `12px` radius, `--shadow-lg`
- Buttons: `6px` radius (Ant Design default)

### 6.5 Animations

**Transitions:**
```css
--transition-fast: 150ms cubic-bezier(0.4, 0, 0.2, 1);
--transition-base: 250ms cubic-bezier(0.4, 0, 0.2, 1);
--transition-slow: 350ms cubic-bezier(0.4, 0, 0.2, 1);
```

**Common Animations:**

1. **Fade In:**
```css
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.fade-in {
  animation: fadeIn 0.4s ease-out;
}
```

2. **Slide Up:**
```css
@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.slide-up {
  animation: slideUp 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}
```

3. **Number Counter:**
```typescript
// Use react-countup
import CountUp from 'react-countup';

<CountUp
  start={0}
  end={statistics.total}
  duration={2}
  separator=","
  useEasing={true}
  easingFn={(t, b, c, d) => {
    // easeOutExpo
    return c * (-Math.pow(2, -10 * t / d) + 1) + b;
  }}
/>
```

4. **Hover Effects:**
```css
.card-hover {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.card-hover:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg);
}
```

5. **Stagger Animation:**
```tsx
// Using Framer Motion (optional)
import { motion } from 'framer-motion';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

<motion.div variants={container} initial="hidden" animate="show">
  {kpiCards.map((card, i) => (
    <motion.div key={i} variants={item}>
      <KPICard {...card} />
    </motion.div>
  ))}
</motion.div>
```

---

## 7. Data Enhancements

### 7.1 Current Data Available (from API)

```typescript
interface SystemStatistics {
  total: number;
  by_status: {
    active: number;
    inactive: number;
    maintenance: number;
    planning: number;
    draft: number;
  };
  by_criticality: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  by_form_level: {
    level_1: number;
    level_2: number;
  };
}
```

### 7.2 Recommended New API Endpoints

#### A. `/api/systems/statistics/trend/`

**Purpose:** Time-series data for trend charts

**Query Params:**
- `period`: `7d`, `30d`, `3m`, `6m`, `1y`
- `interval`: `day`, `week`, `month`

**Response:**
```typescript
interface TrendStatistics {
  period: string;
  interval: string;
  data: Array<{
    date: string;           // ISO date
    total: number;
    active: number;
    inactive: number;
    maintenance: number;
    critical: number;
    new_systems: number;    // New in this period
    updated_systems: number;
  }>;
}
```

#### B. `/api/systems/statistics/comparison/`

**Purpose:** Period-over-period comparison

**Response:**
```typescript
interface ComparisonStatistics {
  current: SystemStatistics;
  previous: SystemStatistics;
  changes: {
    total: { value: number; percent: number };
    active: { value: number; percent: number };
    critical: { value: number; percent: number };
    // ... for all metrics
  };
  trend: 'up' | 'down' | 'stable';
}
```

#### C. `/api/systems/statistics/health/`

**Purpose:** Overall system health score and metrics

**Response:**
```typescript
interface SystemHealth {
  health_score: number;        // 0-100
  uptime_average: number;      // Percentage
  response_time_avg: number;   // Milliseconds
  user_satisfaction: number;   // 1-5 rating
  alerts_count: number;        // Current active alerts
  performance_rating: 'excellent' | 'good' | 'fair' | 'poor';
  recommendations: string[];   // AI-generated suggestions
}
```

#### D. `/api/systems/activities/recent/`

**Purpose:** Recent activity feed

**Query Params:**
- `limit`: number (default: 10)
- `type`: `all`, `created`, `updated`, `deleted`, `status_changed`

**Response:**
```typescript
interface Activity {
  id: number;
  system_id: number;
  system_name: string;
  action: 'created' | 'updated' | 'deleted' | 'status_changed';
  description: string;
  user: string;               // Who made the change
  timestamp: string;          // ISO datetime
  metadata: {
    old_value?: string;
    new_value?: string;
    field_changed?: string;
  };
}

interface ActivitiesResponse {
  count: number;
  results: Activity[];
}
```

#### E. `/api/systems/statistics/by-organization/`

**Purpose:** Organization-level breakdown

**Response:**
```typescript
interface OrganizationStatistics {
  organizations: Array<{
    id: number;
    name: string;
    system_count: number;
    active_systems: number;
    critical_systems: number;
    health_score: number;
  }>;
  total_organizations: number;
}
```

### 7.3 Mock Data Generation (for Development)

```typescript
// utils/mockData.ts

export const generateTrendData = (days: number): TrendData[] => {
  const data: TrendData[] = [];
  const today = new Date();

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);

    data.push({
      date: date.toISOString().split('T')[0],
      total: 1200 + Math.floor(Math.random() * 50),
      active: 1050 + Math.floor(Math.random() * 40),
      critical: 20 + Math.floor(Math.random() * 10)
    });
  }

  return data;
};

export const generateActivities = (count: number): Activity[] => {
  const actions = ['created', 'updated', 'deleted', 'status_changed'];
  const systems = [
    'Hệ thống quản lý văn bản',
    'Hệ thống quản lý nhân sự',
    'Hệ thống kế toán',
    'Portal thông tin điện tử'
  ];

  return Array.from({ length: count }, (_, i) => ({
    id: String(i),
    systemName: systems[Math.floor(Math.random() * systems.length)],
    action: actions[Math.floor(Math.random() * actions.length)] as any,
    description: 'Cập nhật thông tin hệ thống',
    timestamp: `${Math.floor(Math.random() * 60)} phút trước`,
    icon: <EditOutlined />,
    color: '#1890ff',
    tagColor: 'blue'
  }));
};
```

### 7.4 Calculated Metrics (Frontend)

**Derive additional insights from existing data:**

```typescript
const calculateMetrics = (stats: SystemStatistics) => {
  return {
    // Health indicators
    activePercentage: (stats.by_status.active / stats.total) * 100,
    criticalPercentage: (stats.by_criticality.critical / stats.total) * 100,
    maintenancePercentage: (stats.by_status.maintenance / stats.total) * 100,

    // Risk assessment
    riskScore: calculateRiskScore(stats),
    healthGrade: getHealthGrade(stats),

    // Operational metrics
    operationalSystems: stats.by_status.active + stats.by_status.maintenance,
    nonOperationalSystems: stats.by_status.inactive + stats.by_status.draft,

    // Priority distribution
    highPrioritySystems: stats.by_criticality.critical + stats.by_criticality.high,
    lowPrioritySystems: stats.by_criticality.medium + stats.by_criticality.low
  };
};

const calculateRiskScore = (stats: SystemStatistics): number => {
  // Simple algorithm: weighted sum
  const weights = {
    critical: 10,
    high: 5,
    inactive: 8,
    maintenance: 3
  };

  const riskPoints =
    (stats.by_criticality.critical * weights.critical) +
    (stats.by_criticality.high * weights.high) +
    (stats.by_status.inactive * weights.inactive) +
    (stats.by_status.maintenance * weights.maintenance);

  const maxPoints = stats.total * weights.critical;

  return Math.round((riskPoints / maxPoints) * 100);
};

const getHealthGrade = (stats: SystemStatistics): string => {
  const activePercent = (stats.by_status.active / stats.total) * 100;
  const criticalPercent = (stats.by_criticality.critical / stats.total) * 100;

  if (activePercent > 90 && criticalPercent < 5) return 'Xuất sắc';
  if (activePercent > 80 && criticalPercent < 10) return 'Tốt';
  if (activePercent > 70 && criticalPercent < 15) return 'Trung bình';
  return 'Cần cải thiện';
};
```

---

## 8. Implementation Recommendations

### 8.1 Recommended Libraries

**Core Dependencies (Already in project):**
- ✅ React 19
- ✅ TypeScript
- ✅ Ant Design 6.2.0

**Additional Libraries to Install:**

```bash
npm install --save \
  recharts \              # Charting library
  react-countup \         # Number counter animations
  dayjs \                 # Date formatting (lighter than moment)
  framer-motion \         # Advanced animations (optional)
  lodash \                # Utility functions
  numeral                 # Number formatting
```

**Package Justifications:**

| Library | Purpose | Why? |
|---------|---------|------|
| **Recharts** | Charts | Best balance of simplicity & power for React; 22k+ stars; composable components |
| **react-countup** | Number animations | Smooth counter animations for KPI cards; 1.2k stars; lightweight |
| **dayjs** | Date handling | 2KB (vs 232KB moment.js); modern API; i18n support for Vietnamese |
| **framer-motion** | Animations | Best-in-class animation library for React; declarative; production-ready |
| **lodash** | Utilities | Debounce, throttle, groupBy, etc.; battle-tested |
| **numeral** | Number formatting | Format numbers, currencies, percentages; 9k+ stars |

**Icon Library:**
- Use existing `@ant-design/icons` - already comprehensive

### 8.2 Component Structure

**Proposed File Organization:**

```
frontend/src/
├── pages/
│   └── Dashboard/
│       ├── index.tsx                    # Main Dashboard component
│       ├── Dashboard.module.css         # CSS modules (optional)
│       ├── components/
│       │   ├── KPICard.tsx             # Reusable KPI card
│       │   ├── TrendChart.tsx          # Line chart for trends
│       │   ├── StatusDonutChart.tsx    # Status breakdown donut
│       │   ├── CriticalityBarChart.tsx # Horizontal bar chart
│       │   ├── ActivityFeed.tsx        # Recent activity list
│       │   ├── DashboardHeader.tsx     # Title + actions
│       │   └── MetricCard.tsx          # Secondary metric cards
│       ├── hooks/
│       │   ├── useStatistics.ts        # Fetch & manage stats data
│       │   ├── useTrendData.ts         # Fetch trend data
│       │   └── useActivities.ts        # Fetch activities
│       ├── utils/
│       │   ├── formatters.ts           # Number, date formatting
│       │   ├── calculations.ts         # Derived metrics
│       │   └── mockData.ts             # Mock data generators
│       └── types/
│           └── dashboard.ts            # Dashboard-specific types
│
├── components/                          # Shared components
│   └── charts/
│       ├── ChartContainer.tsx          # Wrapper with loading/error states
│       └── ChartTooltip.tsx            # Custom tooltip styles
│
└── config/
    └── chartTheme.ts                   # Recharts theme config
```

**Component Breakdown:**

```tsx
// Dashboard/index.tsx (Main orchestrator)
const Dashboard = () => {
  const { statistics, loading } = useStatistics();
  const { trendData } = useTrendData('30d');
  const { activities } = useActivities(10);

  return (
    <div className="dashboard-container">
      <DashboardHeader />
      <KPIRow statistics={statistics} loading={loading} />
      <ChartsRow trendData={trendData} statusData={statistics?.by_status} />
      <DataTablesRow
        criticalityData={statistics?.by_criticality}
        activities={activities}
      />
    </div>
  );
};

// Dashboard/components/KPICard.tsx (Reusable card)
interface KPICardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: string;
  trend?: {
    value: number;
    direction: 'up' | 'down' | 'neutral';
    isPositive: boolean;
  };
  sparklineData?: number[];
  loading?: boolean;
}

const KPICard: React.FC<KPICardProps> = ({ ... }) => {
  // Implementation
};
```

### 8.3 State Management Approach

**Strategy:** React hooks + Context (for simple app)

```typescript
// Dashboard/hooks/useStatistics.ts

import { useState, useEffect } from 'react';
import api from '@/config/api';
import type { SystemStatistics } from '@/types';

export const useStatistics = () => {
  const [statistics, setStatistics] = useState<SystemStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchStatistics = async () => {
    try {
      setLoading(true);
      const response = await api.get<SystemStatistics>('/systems/statistics/');
      setStatistics(response.data);
      setError(null);
    } catch (err) {
      setError(err as Error);
      console.error('Failed to fetch statistics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatistics();

    // Auto-refresh every 5 minutes
    const interval = setInterval(fetchStatistics, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  return { statistics, loading, error, refetch: fetchStatistics };
};
```

**For more complex state (future):**
- Consider **Zustand** (lightweight, 3KB) or **Redux Toolkit**
- Not needed for initial implementation

### 8.4 Performance Considerations

#### A. Lazy Loading for Charts

```tsx
import { lazy, Suspense } from 'react';
import { Skeleton } from 'antd';

const TrendChart = lazy(() => import('./components/TrendChart'));

// In component:
<Suspense fallback={<Skeleton.Node active style={{ height: 320 }} />}>
  <TrendChart data={trendData} />
</Suspense>
```

#### B. Memoization

```tsx
import { useMemo } from 'react';

const Dashboard = () => {
  const { statistics } = useStatistics();

  // Expensive calculation - only recalculate when stats change
  const derivedMetrics = useMemo(() => {
    return calculateMetrics(statistics);
  }, [statistics]);

  // Memoize chart data transformations
  const chartData = useMemo(() => {
    return transformToChartFormat(statistics);
  }, [statistics]);

  return (
    // ...
  );
};
```

```tsx
import React from 'react';

// Prevent unnecessary re-renders
const KPICard = React.memo<KPICardProps>(({ title, value, ... }) => {
  // Component implementation
}, (prevProps, nextProps) => {
  // Custom comparison
  return prevProps.value === nextProps.value &&
         prevProps.loading === nextProps.loading;
});
```

#### C. Virtualization for Long Lists

```tsx
import { List } from 'react-virtualized';

// For activity feed with 100+ items
<List
  width={400}
  height={400}
  rowCount={activities.length}
  rowHeight={80}
  rowRenderer={({ index, key, style }) => (
    <div key={key} style={style}>
      <ActivityItem activity={activities[index]} />
    </div>
  )}
/>
```

#### D. Code Splitting

```tsx
// Route-level splitting
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Systems = lazy(() => import('./pages/Systems'));

// In router:
<Route path="/dashboard" element={
  <Suspense fallback={<PageLoader />}>
    <Dashboard />
  </Suspense>
} />
```

#### E. Debounce API Calls

```tsx
import { debounce } from 'lodash';

const debouncedFetch = useMemo(
  () => debounce(fetchStatistics, 300),
  []
);

// Use for user-triggered refreshes
<Button onClick={debouncedFetch}>Refresh</Button>
```

### 8.5 Accessibility (WCAG AA Compliance)

**Checklist:**

- ✅ **Color Contrast**: All text meets 4.5:1 ratio
  - Test with [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)

- ✅ **Keyboard Navigation**: All interactive elements accessible via keyboard
  ```tsx
  <div
    role="button"
    tabIndex={0}
    onKeyPress={(e) => e.key === 'Enter' && handleClick()}
  >
  ```

- ✅ **ARIA Labels**: Charts and complex components have labels
  ```tsx
  <div role="img" aria-label="Biểu đồ trạng thái hệ thống">
    <DonutChart data={statusData} />
  </div>
  ```

- ✅ **Focus States**: Visible focus indicators (already in index.css)
  ```css
  *:focus-visible {
    outline: 2px solid var(--color-primary);
    outline-offset: 2px;
  }
  ```

- ✅ **Alt Text**: All decorative images have empty alt, meaningful images have descriptions

- ✅ **Screen Reader Support**: Use semantic HTML
  ```tsx
  <main aria-label="Dashboard chính">
    <section aria-labelledby="kpi-heading">
      <h2 id="kpi-heading">Chỉ số quan trọng</h2>
      {/* KPI cards */}
    </section>
  </main>
  ```

- ✅ **Skip Links**: Allow skipping to main content
  ```tsx
  <a href="#main-content" className="skip-link">
    Bỏ qua điều hướng
  </a>
  ```

---

## 9. Phased Implementation Plan

### Phase 1: Foundation & Quick Wins (Days 1-2)

**Goal:** Improve current dashboard with minimal new code

**Tasks:**

1. ✅ **Enhance KPI Cards** (4 hours)
   - Add border-left accent colors
   - Improve card padding and shadows
   - Add hover effects (transform + shadow)
   - Implement number counter animation (react-countup)

2. ✅ **Add Trend Indicators** (2 hours)
   - Calculate mock percentage changes
   - Add arrow icons (up/down/neutral)
   - Color code based on context (green/red/gray)

3. ✅ **Improve Layout Spacing** (2 hours)
   - Increase gutter between cards (16px → 24px)
   - Add proper section spacing (24px-32px)
   - Improve mobile padding

4. ✅ **Add Dashboard Header** (2 hours)
   - Add "Last updated" timestamp
   - Add Refresh button with loading state
   - Add Export button (stub for now)

**Deliverable:** Noticeably improved dashboard with better spacing, animations, and visual hierarchy

**Effort:** ~10 hours (1-2 days)

---

### Phase 2: Data Visualization (Days 3-5)

**Goal:** Replace text lists with interactive charts

**Tasks:**

1. ✅ **Install & Configure Recharts** (1 hour)
   ```bash
   npm install recharts dayjs
   ```
   - Create chart theme config
   - Set up color constants

2. ✅ **Implement Status Donut Chart** (4 hours)
   - Replace "Trạng thái hệ thống" text list
   - Add interactive donut with center label
   - Add legend with percentages
   - Implement hover effects

3. ✅ **Implement Criticality Bar Chart** (3 hours)
   - Replace "Mức độ quan trọng" text list
   - Horizontal bars with color coding
   - Tooltips on hover

4. ✅ **Add Trend Line Chart** (6 hours)
   - Create new chart row
   - Generate mock trend data (30 days)
   - Implement multi-line chart (total, active, critical)
   - Add time range filter (7d, 30d, 3m)
   - Responsive design

5. ✅ **Create Activity Feed** (4 hours)
   - Design activity timeline component
   - Generate mock activity data
   - Add icons and timestamps
   - Implement "View all" link

**Deliverable:** Fully visualized dashboard with 3 charts and activity feed

**Effort:** ~18 hours (3-4 days)

---

### Phase 3: Interactivity & Polish (Days 6-8)

**Goal:** Add micro-interactions, animations, and advanced features

**Tasks:**

1. ✅ **Stagger Animations** (3 hours)
   - Install framer-motion
   - Implement staggered card entry
   - Add chart draw-in animations
   - Smooth transitions between states

2. ✅ **Add Sparklines to KPI Cards** (4 hours)
   - Mini area charts showing 7-day trend
   - Gradient fills matching card theme
   - Responsive sizing

3. ✅ **Implement Filters** (4 hours)
   - Time range filter (Segmented control)
   - Status filter chips (CheckableTag)
   - Update charts based on filters

4. ✅ **Add Secondary Metrics Row** (3 hours)
   - Average users per system
   - Integration rate (progress bar)
   - Health score (gauge chart)

5. ✅ **Loading States** (2 hours)
   - Skeleton loaders for all components
   - Smooth transitions from loading to loaded
   - Error states with retry button

6. ✅ **Responsive Refinement** (3 hours)
   - Test on mobile devices
   - Optimize chart heights for mobile
   - Add collapsible sections for mobile
   - Sticky header on scroll

**Deliverable:** Polished, interactive dashboard with smooth animations and filters

**Effort:** ~19 hours (2-3 days)

---

### Phase 4: Backend Integration & Real Data (Days 9-10)

**Goal:** Replace mock data with real API calls

**Tasks:**

1. ✅ **Backend API Development** (Backend team, 6 hours)
   - Implement `/api/systems/statistics/trend/` endpoint
   - Implement `/api/systems/statistics/comparison/` endpoint
   - Implement `/api/systems/activities/recent/` endpoint
   - Add health score calculation

2. ✅ **Frontend Integration** (4 hours)
   - Create API hooks (useTrendData, useActivities)
   - Replace mock data with API calls
   - Handle loading/error states
   - Implement auto-refresh (5 min interval)

3. ✅ **Export Functionality** (3 hours)
   - Implement PDF export (html2canvas + jsPDF)
   - Implement CSV export for data tables
   - Add print-friendly styles

4. ✅ **Testing & Bug Fixes** (4 hours)
   - Cross-browser testing
   - Mobile device testing
   - Performance testing (Lighthouse)
   - Fix issues

**Deliverable:** Production-ready dashboard with real data and export features

**Effort:** ~17 hours (2 days)

---

### Summary Timeline

| Phase | Duration | Effort | Priority |
|-------|----------|--------|----------|
| Phase 1: Quick Wins | 1-2 days | 10 hours | P0 (Must have) |
| Phase 2: Charts | 3-4 days | 18 hours | P0 (Must have) |
| Phase 3: Polish | 2-3 days | 19 hours | P1 (Should have) |
| Phase 4: Backend | 2 days | 17 hours | P0 (Must have) |
| **Total** | **8-11 days** | **64 hours** | - |

**Recommended Approach:**
- **MVP (Minimum Viable Product)**: Phase 1 + Phase 2 (core functionality)
- **V1.0 (Full Release)**: All phases
- **Future Enhancements**: Advanced analytics, AI insights, real-time updates

---

## 10. Examples & References

### 10.1 Excellent Dashboard Examples

Here are 10 world-class dashboards for inspiration:

1. **[Vercel Analytics Dashboard](https://vercel.com/docs/analytics)**
   - Clean, minimalist design
   - Excellent use of line charts and sparklines
   - Real-time updates with smooth animations
   - **Key Takeaway:** Simplicity + data density

2. **[Stripe Dashboard](https://stripe.com/docs/dashboard)**
   - Professional financial dashboard
   - Great KPI card design with trends
   - Excellent typography and spacing
   - **Key Takeaway:** Trust through clarity

3. **[Notion Analytics](https://www.notion.so/)**
   - Modern card-based layout
   - Subtle shadows and hover effects
   - Good use of color for categorization
   - **Key Takeaway:** Friendly yet professional

4. **[Linear Project Dashboard](https://linear.app/)**
   - Stunning dark mode (optional for us)
   - Smooth animations and micro-interactions
   - Excellent data visualization
   - **Key Takeaway:** Attention to detail

5. **[Retool Dashboards](https://retool.com/)**
   - Customizable dashboard builder
   - Rich component library
   - Professional business intelligence look
   - **Key Takeaway:** Enterprise-grade UI

6. **[Grafana](https://grafana.com/)**
   - Real-time monitoring dashboards
   - Excellent chart variety
   - Great responsive design
   - **Key Takeaway:** Technical yet accessible

7. **[Tableau Public Gallery](https://public.tableau.com/app/discover)**
   - Data storytelling focus
   - Complex visualizations made simple
   - Good use of filters and drill-downs
   - **Key Takeaway:** Data-driven narratives

8. **[Google Analytics 4](https://analytics.google.com/)**
   - Comprehensive metrics overview
   - Excellent period comparison UI
   - Good use of color-coded cards
   - **Key Takeaway:** Enterprise analytics UX

9. **[Datadog Dashboard](https://www.datadoghq.com/)**
   - Infrastructure monitoring UI
   - Great KPI cards with health indicators
   - Real-time updates
   - **Key Takeaway:** System health visualization

10. **[Ant Design Pro Dashboard](https://preview.pro.ant.design/dashboard/analysis)**
    - Built with our tech stack!
    - Ready-to-use components
    - Good reference for Ant Design patterns
    - **Key Takeaway:** Battle-tested Ant Design implementation

### 10.2 Design Inspiration Galleries

**Dribbble Collections:**
- [Dashboard Designs](https://dribbble.com/search/dashboard)
- [Admin Panel UI](https://dribbble.com/search/admin-dashboard)
- [Analytics Dashboard](https://dribbble.com/search/analytics-dashboard)

**Behance Projects:**
- [SaaS Dashboard](https://www.behance.net/search/projects?search=saas+dashboard)
- [Enterprise Dashboard](https://www.behance.net/search/projects?search=enterprise+dashboard)

**Awwwards Winners:**
- [Data Visualization Sites](https://www.awwwards.com/websites/data-visualization/)

### 10.3 Component Libraries

**Ant Design Resources:**
- [Ant Design Charts](https://charts.ant.design/) - Official chart library
- [Ant Design Pro Components](https://procomponents.ant.design/) - Advanced components
- [Ant Design Mobile](https://mobile.ant.design/) - For mobile optimization

**Chart Libraries:**
- [Recharts Examples](https://recharts.org/en-US/examples)
- [Apache ECharts Gallery](https://echarts.apache.org/examples/en/index.html)
- [Chart.js Examples](https://www.chartjs.org/docs/latest/samples/information.html)

### 10.4 Vietnamese Government Design References

**Good Examples:**
- [Cổng Thông tin điện tử Chính phủ](https://chinhphu.vn/) - Color scheme, typography
- [Cổng Dịch vụ công Quốc gia](https://dichvucong.gov.vn/) - Professional tone
- [Bộ Thông tin và Truyền thông](https://mic.gov.vn/) - Layout structure

**Design Principles for Vietnamese Gov Dashboards:**
- **Authoritative:** Bold typography, structured layout
- **Trustworthy:** Clean design, no flashy elements
- **Accessible:** High contrast, clear labels, large touch targets
- **Professional:** Neutral colors, consistent spacing
- **Vietnamese-First:** Proper UTF-8 encoding, Vietnamese typography considerations

---

## 11. Mockup Descriptions

### 11.1 Desktop Layout (1440px)

**Overall Composition:**
```
DESKTOP DASHBOARD (1440px viewport, centered, max-width 1600px)
================================================================================

┌──────────────────────────────────────────────────────────────────────────┐
│ HEADER SECTION (Height: 80px, Background: white, Shadow: subtle)        │
│ ┌──────────────────────────────────────────────────────────────────┐    │
│ │ Left:                                                            │    │
│ │   • H1: "Dashboard" (36px, #000000DE, font-weight: 600)         │    │
│ │   • Subtitle: "Tổng quan hệ thống CNTT"                         │    │
│ │     (16px, #00000099, margin-top: 4px)                           │    │
│ │                                                                  │    │
│ │ Right (aligned):                                                 │    │
│ │   • Last Updated: "Cập nhật: 5 phút trước" (14px, #8c8c8c)      │    │
│ │   • [Refresh Button] Icon button, blue outline                  │    │
│ │   • [Export Button] Icon button, default                        │    │
│ │   • [Settings Button] Icon only, text                           │    │
│ └──────────────────────────────────────────────────────────────────┘    │
└──────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────────┐
│ KPI CARDS ROW (Margin-top: 24px, Gap: 24px between cards)               │
│ ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────┐            │
│ │ CARD 1     │ │ CARD 2     │ │ CARD 3     │ │ CARD 4     │            │
│ │ Total      │ │ Active     │ │ Critical   │ │ Orgs       │            │
│ │ Systems    │ │ Systems    │ │ Systems    │ │            │            │
│ │            │ │            │ │            │ │            │            │
│ │ [Hero]     │ │ [Success]  │ │ [Alert]    │ │ [Neutral]  │            │
│ │ Blue BG    │ │ White BG   │ │ White BG   │ │ White BG   │            │
│ │ White Text │ │ Green Left │ │ Red Left   │ │ Purple Left│            │
│ │            │ │ Border     │ │ Border     │ │ Border     │            │
│ │            │ │            │ │            │ │            │            │
│ │ 🗂️  Label  │ │ ✓  Label   │ │ ⚠️  Label  │ │ 👥  Label  │            │
│ │            │ │            │ │            │ │            │            │
│ │   1,247    │ │   1,089    │ │     23     │ │     45     │            │
│ │   (48px)   │ │   (48px)   │ │   (48px)   │ │   (48px)   │            │
│ │            │ │            │ │            │ │            │            │
│ │ ↑ +5.2%    │ │ ↑ +3.1%    │ │ ↓ -12%     │ │ → 0%       │            │
│ │ (Green)    │ │ (Green)    │ │ (Green!)   │ │ (Gray)     │            │
│ │            │ │            │ │            │ │            │            │
│ │ ▁▂▃▅▄▆█   │ │ ▁▂▃▅▄▆█   │ │ ▁▂▃▅▄▆█   │ │ ▁▂▃▅▄▆█   │            │
│ │ Sparkline  │ │ Sparkline  │ │ Sparkline  │ │ Sparkline  │            │
│ │ (40px h)   │ │ (40px h)   │ │ (40px h)   │ │ (40px h)   │            │
│ └────────────┘ └────────────┘ └────────────┘ └────────────┘            │
│ Width: 25%    Width: 25%    Width: 25%    Width: 25%                   │
│ Height: 240px  Height: 240px  Height: 240px  Height: 240px              │
└──────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────────┐
│ CHARTS ROW (Margin-top: 24px, Gap: 24px)                                │
│ ┌──────────────────────────────────────┐ ┌────────────────────────┐    │
│ │ TREND CHART CARD                     │ │ STATUS CHART CARD      │    │
│ │ Title: "Xu hướng hệ thống"          │ │ Title: "Phân bố       │    │
│ │                                      │ │         trạng thái"    │    │
│ │ [Filter: 7d | 30d | 3m | All]       │ │                        │    │
│ │                                      │ │                        │    │
│ │ ┌────────────────────────────────┐  │ │  ┌──────────────────┐  │    │
│ │ │                                │  │ │  │                  │  │    │
│ │ │  LINE CHART                    │  │ │  │  DONUT CHART     │  │    │
│ │ │  Height: 320px                 │  │ │  │  Height: 320px   │  │    │
│ │ │                                │  │ │  │                  │  │    │
│ │ │  Lines:                        │  │ │  │  Segments:       │  │    │
│ │ │  • Total (Blue, thick)         │  │ │  │  • Active (87%)  │  │    │
│ │ │  • Active (Green)              │  │ │  │  • Maint (8%)    │  │    │
│ │ │  • Critical (Red)              │  │ │  │  • Inactive (5%) │  │    │
│ │ │                                │  │ │  │                  │  │    │
│ │ │  X-axis: Dates (DD/MM)         │  │ │  │  Center Label:   │  │    │
│ │ │  Y-axis: System count          │  │ │  │  1,247           │  │    │
│ │ │                                │  │ │  │  Tổng số         │  │    │
│ │ │  Legend: Bottom                │  │ │  │                  │  │    │
│ │ │  Tooltip: On hover             │  │ │  │  Legend: Right   │  │    │
│ │ └────────────────────────────────┘  │ │  └──────────────────┘  │    │
│ │                                      │ │                        │    │
│ └──────────────────────────────────────┘ └────────────────────────┘    │
│ Width: 60%                              Width: 40%                     │
└──────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────────┐
│ DATA TABLES ROW (Margin-top: 24px, Gap: 24px)                           │
│ ┌────────────────────────────┐ ┌──────────────────────────────────┐    │
│ │ CRITICALITY HEATMAP        │ │ RECENT ACTIVITY FEED             │    │
│ │ Title: "Mức độ quan trọng" │ │ Title: "Hoạt động gần đây"       │    │
│ │                            │ │ [Link: Xem tất cả]               │    │
│ │ ┌────────────────────────┐ │ │                                  │    │
│ │ │ HORIZONTAL BAR CHART   │ │ │ ┌──────────────────────────────┐ │    │
│ │ │ Height: 280px          │ │ │ │ TIMELINE LIST                │ │    │
│ │ │                        │ │ │ │ Height: 320px, Scroll: auto  │ │    │
│ │ │ Bars:                  │ │ │ │                              │ │    │
│ │ │ Cực kỳ quan trọng ████ │ │ │ │ [Avatar] Hệ thống ABC        │ │    │
│ │ │   (Red, 23)            │ │ │ │          [Tag: Updated]      │ │    │
│ │ │                        │ │ │ │          Cập nhật kiến trúc  │ │    │
│ │ │ Quan trọng ██████████  │ │ │ │          ⏱ 2 phút trước      │ │    │
│ │ │   (Orange, 45)         │ │ │ │ ─────────────────────────    │ │    │
│ │ │                        │ │ │ │ [Avatar] Hệ thống XYZ        │ │    │
│ │ │ Trung bình ████████████│ │ │ │          [Tag: Created]      │ │    │
│ │ │   (Blue, 89)           │ │ │ │          Thêm hệ thống mới   │ │    │
│ │ │                        │ │ │ │          ⏱ 15 phút trước     │ │    │
│ │ │ Thấp ████████████████  │ │ │ │ ─────────────────────────    │ │    │
│ │ │   (Green, 932)         │ │ │ │ [Avatar] Hệ thống DEF        │ │    │
│ │ │                        │ │ │ │          [Tag: Alert]        │ │    │
│ │ │ Tooltip: On hover      │ │ │ │          Cảnh báo bảo mật    │ │    │
│ │ └────────────────────────┘ │ │ │          ⏱ 1 giờ trước       │ │    │
│ │                            │ │ │ ...                          │ │    │
│ └────────────────────────────┘ │ └──────────────────────────────┘ │    │
│ Width: 50%                     │ Width: 50%                       │    │
└──────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────────┐
│ SECONDARY METRICS ROW (Margin-top: 24px, Gap: 24px)                     │
│ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐                     │
│ │ METRIC CARD  │ │ METRIC CARD  │ │ METRIC CARD  │                     │
│ │              │ │              │ │              │                     │
│ │ 👥 Avg Users │ │ 🔗 Integr.  │ │ 💚 Health   │                     │
│ │              │ │              │ │              │                     │
│ │   12,450     │ │    73%       │ │   85/100     │                     │
│ │              │ │              │ │              │                     │
│ │ [Mini Line]  │ │ [Progress]   │ │ [Gauge]      │                     │
│ │              │ │              │ │              │                     │
│ └──────────────┘ └──────────────┘ └──────────────┘                     │
│ Width: 33.33%    Width: 33.33%    Width: 33.33%                        │
│ Height: 160px    Height: 160px    Height: 160px                        │
└──────────────────────────────────────────────────────────────────────────┘

DESIGN NOTES:
─────────────
• Background: #f5f5f5 (page), #ffffff (cards)
• Shadows: 0 2px 8px rgba(0,0,0,0.08) default, 0 12px 32px rgba(0,0,0,0.12) hover
• Border Radius: 8px (cards)
• Padding: 24px (card inner)
• Gaps: 24px (between cards and rows)
• Animations: Fade in on load, stagger by 0.1s per card
• Responsive: Stacks to single column on mobile
```

### 11.2 Mobile Layout (375px)

**Mobile-Optimized Composition:**
```
MOBILE DASHBOARD (375px viewport)
================================================================================

┌─────────────────────────────┐
│ STICKY HEADER (70px)        │
│ ┌─────────────────────────┐ │
│ │ Dashboard               │ │
│ │ [Refresh] [Menu]        │ │
│ └─────────────────────────┘ │
├─────────────────────────────┤
│ QUICK STATS BAR (Collapsed) │
│ ┌─────────────────────────┐ │
│ │ 1,247 • 1,089 • 23      │ │
│ │ [Tap to expand ▼]       │ │
│ └─────────────────────────┘ │
└─────────────────────────────┘

┌─────────────────────────────┐
│ KPI CARDS (Stacked, 12px gap)│
│                             │
│ ┌─────────────────────────┐ │
│ │ TOTAL SYSTEMS           │ │
│ │ [Blue gradient BG]      │ │
│ │ Height: 180px           │ │
│ │                         │ │
│ │ 🗂️ Tổng số hệ thống    │ │
│ │                         │ │
│ │       1,247             │ │
│ │       (36px)            │ │
│ │                         │ │
│ │    ↑ +5.2% tháng này    │ │
│ │                         │ │
│ │    ▁▂▃▅▄▆█ Sparkline   │ │
│ └─────────────────────────┘ │
│                             │
│ ┌─────────────────────────┐ │
│ │ ACTIVE SYSTEMS          │ │
│ │ Height: 160px           │ │
│ │                         │ │
│ │ ✓ Đang hoạt động       │ │
│ │       1,089             │ │
│ │    ↑ +3.1%             │ │
│ └─────────────────────────┘ │
│                             │
│ ┌─────────────────────────┐ │
│ │ CRITICAL SYSTEMS        │ │
│ │ Height: 160px           │ │
│ │                         │ │
│ │ ⚠️ Quan trọng          │ │
│ │         23              │ │
│ │    ↓ -12% (good!)      │ │
│ └─────────────────────────┘ │
│                             │
│ ┌─────────────────────────┐ │
│ │ [Show More Stats ▼]     │ │
│ │ (Collapsed by default)  │ │
│ └─────────────────────────┘ │
└─────────────────────────────┘

┌─────────────────────────────┐
│ CHARTS (Stacked, 12px gap)  │
│                             │
│ ┌─────────────────────────┐ │
│ │ TRẠNG THÁI HỆ THỐNG     │ │
│ │                         │ │
│ │ [Donut Chart]           │ │
│ │ Height: 280px           │ │
│ │                         │ │
│ │ Legend: Below chart     │ │
│ └─────────────────────────┘ │
│                             │
│ ┌─────────────────────────┐ │
│ │ XU HƯỚNG 30 NGÀY        │ │
│ │                         │ │
│ │ [Line Chart]            │ │
│ │ Height: 220px           │ │
│ │ (Simplified, 1-2 lines) │ │
│ └─────────────────────────┘ │
│                             │
│ ┌─────────────────────────┐ │
│ │ MỨC ĐỘ QUAN TRỌNG       │ │
│ │                         │ │
│ │ [Horizontal Bar Chart]  │ │
│ │ Height: 200px           │ │
│ └─────────────────────────┘ │
└─────────────────────────────┘

┌─────────────────────────────┐
│ RECENT ACTIVITY             │
│ (Show top 3, collapse rest) │
│                             │
│ ┌─────────────────────────┐ │
│ │ [Avatar] System X       │ │
│ │ Updated • 2 phút trước  │ │
│ └─────────────────────────┘ │
│ ┌─────────────────────────┐ │
│ │ [Avatar] System Y       │ │
│ │ Created • 15 phút trước │ │
│ └─────────────────────────┘ │
│ ┌─────────────────────────┐ │
│ │ [Avatar] System Z       │ │
│ │ Alert • 1 giờ trước     │ │
│ └─────────────────────────┘ │
│                             │
│ [Xem tất cả hoạt động ▼]    │
└─────────────────────────────┘

MOBILE-SPECIFIC NOTES:
─────────────────────
• Padding: 16px (page), 16px (cards)
• Gaps: 12px (between elements)
• Font sizes: -2px from desktop
• Touch targets: Minimum 44x44px
• Sticky header on scroll
• Swipe gestures for charts (optional)
• Lazy load charts below fold
• Collapse secondary metrics by default
```

### 11.3 Interaction Specifications

**Hover States:**
```
KPI CARD HOVER:
─────────────────
Before: transform: translateY(0), box-shadow: 0 2px 8px rgba(0,0,0,0.08)
After:  transform: translateY(-4px), box-shadow: 0 12px 32px rgba(0,0,0,0.12)
Transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1)

CHART POINT HOVER:
─────────────────
• Show tooltip with exact values
• Highlight hovered data point (scale up)
• Dim other data points (opacity 0.3)
• Crosshair lines (optional)

BUTTON HOVER:
─────────────
• Background color change
• Scale: 1.02
• Shadow increase
```

**Click/Tap Actions:**
```
KPI CARD CLICK:
─────────────────
Desktop: Navigate to filtered systems list (e.g., show only critical systems)
Mobile: Expand card to show more details (historical data, breakdown)

CHART SEGMENT CLICK:
─────────────────
• Filter dashboard by clicked segment
• Update other charts to reflect filter
• Show "Filtered by: [X]" badge with clear button

TIME FILTER CHANGE:
─────────────────
• Smooth transition of chart data (animate data points)
• Update KPI card trends
• Update "vs last [period]" text
```

---

## 12. Technical Specifications

### 12.1 Browser Support

| Browser | Minimum Version | Notes |
|---------|----------------|-------|
| Chrome | 90+ | Primary target |
| Firefox | 88+ | Full support |
| Safari | 14+ | Test on iOS |
| Edge | 90+ | Chromium-based |
| Mobile Chrome | Latest | Priority |
| Mobile Safari | iOS 14+ | Priority |

**Polyfills:** Not needed (React 19 + modern browsers)

### 12.2 Performance Targets

| Metric | Target | Measurement |
|--------|--------|-------------|
| **First Contentful Paint (FCP)** | < 1.5s | Lighthouse |
| **Largest Contentful Paint (LCP)** | < 2.5s | Lighthouse |
| **Time to Interactive (TTI)** | < 3.5s | Lighthouse |
| **Cumulative Layout Shift (CLS)** | < 0.1 | Lighthouse |
| **Total Bundle Size** | < 500KB | Webpack analyzer |
| **Chart Render Time** | < 100ms | React DevTools Profiler |

**Optimization Strategies:**
- Code splitting (lazy load charts)
- Tree shaking (remove unused Ant Design components)
- Image optimization (use WebP)
- Minification (production build)
- CDN for static assets

### 12.3 SEO & Meta Tags

```tsx
// In Dashboard page
<Helmet>
  <title>Dashboard - Hệ thống Thống kê CNTT | Bộ Khoa học và Công nghệ</title>
  <meta name="description" content="Tổng quan và thống kê các hệ thống CNTT của Bộ Khoa học và Công nghệ Việt Nam" />
  <meta name="keywords" content="dashboard, CNTT, thống kê, Bộ Khoa học" />
  <meta property="og:title" content="Dashboard - Hệ thống Thống kê CNTT" />
  <meta property="og:description" content="Tổng quan hệ thống CNTT" />
  <meta property="og:type" content="website" />
</Helmet>
```

### 12.4 Error Handling

```typescript
// Error Boundary for Dashboard
class DashboardErrorBoundary extends React.Component {
  state = { hasError: false };

  static getDerivedStateFromError(error: Error) {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Dashboard Error:', error, errorInfo);
    // Send to error tracking service (Sentry, LogRocket, etc.)
  }

  render() {
    if (this.state.hasError) {
      return (
        <Result
          status="500"
          title="Lỗi tải dashboard"
          subTitle="Xin lỗi, đã có lỗi xảy ra khi tải dữ liệu."
          extra={
            <Button type="primary" onClick={() => window.location.reload()}>
              Tải lại trang
            </Button>
          }
        />
      );
    }

    return this.props.children;
  }
}
```

**API Error Handling:**
```typescript
const { statistics, error } = useStatistics();

if (error) {
  return (
    <Alert
      message="Không thể tải dữ liệu"
      description="Vui lòng kiểm tra kết nối mạng và thử lại."
      type="error"
      showIcon
      action={
        <Button size="small" danger onClick={refetch}>
          Thử lại
        </Button>
      }
    />
  );
}
```

---

## 13. Conclusion

This comprehensive specification provides a complete blueprint for transforming the current basic dashboard into a modern, professional, data-rich interface that:

✅ **Follows 2024-2026 design trends** (data storytelling, minimalist palettes, micro-interactions)
✅ **Leverages existing tech stack** (React 19, Ant Design 6.2.0, TypeScript)
✅ **Maintains Vietnamese government standards** (professional, authoritative, accessible)
✅ **Provides clear implementation path** (4 phases, 8-11 days, 64 hours)
✅ **Includes detailed specifications** (colors, typography, spacing, animations)
✅ **References best practices** (10 world-class examples, accessibility, performance)

### Next Steps

1. **Review & Approval**: Stakeholder review of this spec
2. **Phase 1 Implementation**: Start with quick wins (2 days)
3. **Iterate**: Gather feedback after each phase
4. **Launch**: Deploy to production after Phase 4

### Contact & Collaboration

For questions or clarifications about this spec, please refer to:
- Design decisions: Section 3 (Design Principles)
- Implementation details: Section 8 (Implementation Recommendations)
- Timeline: Section 9 (Phased Implementation Plan)

---

**Document prepared by:** Claude Sonnet 4.5
**Date:** January 17, 2026
**Version:** 1.0

---

## Appendix: Quick Reference Checklists

### Pre-Implementation Checklist

- [ ] Install dependencies (recharts, react-countup, dayjs, framer-motion)
- [ ] Review current Dashboard.tsx and understand data flow
- [ ] Set up mock data generators for development
- [ ] Create component file structure (see Section 8.2)
- [ ] Define design tokens as CSS variables or TypeScript constants
- [ ] Set up Recharts theme configuration

### Phase 1 Checklist (Quick Wins)

- [ ] Add border-left accent colors to KPI cards
- [ ] Improve card shadows and hover effects
- [ ] Implement number counter animation (react-countup)
- [ ] Add trend indicators with arrows
- [ ] Increase spacing between cards (24px gutter)
- [ ] Add dashboard header with timestamp and buttons

### Phase 2 Checklist (Data Visualization)

- [ ] Install and configure Recharts
- [ ] Implement Status Donut Chart
- [ ] Implement Criticality Bar Chart
- [ ] Add Trend Line Chart with 30-day data
- [ ] Create Activity Feed component
- [ ] Add time range filter (7d, 30d, 3m)

### Phase 3 Checklist (Interactivity)

- [ ] Add stagger animations to card entry
- [ ] Implement sparklines in KPI cards
- [ ] Add filter chips for status
- [ ] Create secondary metrics row (3 cards)
- [ ] Improve loading states (Skeleton)
- [ ] Optimize responsive design for mobile

### Phase 4 Checklist (Backend Integration)

- [ ] Backend: Implement trend API endpoint
- [ ] Backend: Implement comparison API endpoint
- [ ] Backend: Implement activities API endpoint
- [ ] Frontend: Replace mock data with API calls
- [ ] Implement export functionality (PDF/CSV)
- [ ] Cross-browser testing
- [ ] Performance testing (Lighthouse)

### Accessibility Checklist (WCAG AA)

- [ ] Color contrast: All text meets 4.5:1 ratio
- [ ] Keyboard navigation: All interactive elements accessible
- [ ] ARIA labels: Charts and complex components labeled
- [ ] Focus states: Visible focus indicators
- [ ] Screen reader: Semantic HTML and ARIA attributes
- [ ] Skip links: Allow skipping navigation
- [ ] Alt text: All images have appropriate alt text

---

**End of Specification Document**
