# Dashboard Component - Usage Guide

**Version:** 1.0.0
**Last Updated:** 2026-01-17
**Component:** `/frontend/src/pages/Dashboard.tsx`

---

## Table of Contents

1. [Overview](#overview)
2. [Features](#features)
3. [Architecture](#architecture)
4. [Components & Sections](#components--sections)
5. [Performance Optimizations](#performance-optimizations)
6. [Accessibility](#accessibility)
7. [Responsive Design](#responsive-design)
8. [Customization](#customization)
9. [Future Backend Integration](#future-backend-integration)
10. [Troubleshooting](#troubleshooting)

---

## Overview

The Dashboard is the main analytics and monitoring page for the IT Systems Management application. It provides a comprehensive overview of system statistics, trends, and recent activities with a modern, mobile-friendly interface.

### Key Characteristics

- **Real-time Statistics**: Displays key performance indicators (KPIs) with animated counters
- **Interactive Visualizations**: Multiple chart types (Line, Pie, Bar, Sparklines) using Recharts
- **Responsive Design**: Optimized for desktop (1920px+), tablet (768px+), and mobile (320px+)
- **Performance Optimized**: Uses React hooks (useMemo, useCallback) to minimize re-renders
- **Accessible**: WCAG 2.1 AA compliant with ARIA labels and keyboard navigation
- **Modern UX**: Framer Motion animations, micro-interactions, and smooth transitions

---

## Features

### 1. Key Performance Indicators (KPIs)

Four main KPI cards displaying:

- **Tổng số hệ thống** (Total Systems)
  - Total count with animated counter
  - Trend indicator (↑/↓/→)
  - 7-day sparkline chart
  - Color: Blue (#1890ff)

- **Đang hoạt động** (Active Systems)
  - Active systems count
  - Uptime trend
  - Mini trend visualization
  - Color: Green (#52c41a)

- **Quan trọng** (Critical Systems)
  - Critical systems count
  - Risk indicator
  - Trend sparkline
  - Color: Red (#ff4d4f)

- **Tổng người dùng** (Total Users)
  - User count across all systems
  - Growth trend
  - User activity sparkline
  - Color: Orange (#faad14)

### 2. Secondary Metrics

Three percentage cards showing:

- **Tỷ lệ hoạt động** (Active Rate %)
- **Tỷ lệ quan trọng** (Critical Rate %)
- **Tỷ lệ bảo trì** (Maintenance Rate %)

### 3. Trend Analysis

**30-Day Trend Line Chart**
- Displays 3 metrics over 30 days:
  - Total Systems (Blue)
  - Active Systems (Green)
  - Critical Systems (Red)
- Interactive tooltips with data on hover
- Responsive height (250px mobile, 350px desktop)

### 4. Status Distribution

**Donut Chart** showing system distribution by status:
- Đang hoạt động (Active) - Green
- Ngưng hoạt động (Inactive) - Red
- Bảo trì (Maintenance) - Orange
- Bản nháp (Draft) - Gray

### 5. Criticality Distribution

**Bar Chart** showing systems by criticality level:
- Cực kỳ quan trọng (Critical) - Red
- Quan trọng (High) - Orange
- Trung bình (Medium) - Blue
- Thấp (Low) - Green

### 6. Activity Feed

**Timeline** showing recent system activities:
- User actions (created, updated, maintenance, activated)
- System names
- Timestamps (relative: "X phút trước", "X giờ trước")
- Scrollable container (max 8 activities)
- Color-coded activity types

### 7. Filter Controls

**Filter Bar** with:
- **Date Range Picker**: Filter by time period (DD/MM/YYYY format)
- **Status Filter**: All / Active / Inactive / Maintenance / Draft
- **Criticality Filter**: All / Critical / High / Medium / Low
- **Clear Filters Button**: Reset all filters

### 8. Export Functionality

**Export Dropdown** with two formats:
- **JSON Export**: Structured data with metadata, filters, and full statistics
- **CSV Export**: Tabular format for spreadsheet analysis
- Filename format: `dashboard-report-YYYY-MM-DD-HHmm.{json|csv}`

---

## Architecture

### Component Structure

```
Dashboard
├── Header Section
│   ├── Title + Last Updated
│   └── Action Buttons (Refresh, Export)
│
├── Filter Bar
│   ├── Date Range Picker
│   ├── Status Select
│   ├── Criticality Select
│   └── Clear Filters Button
│
├── KPI Cards (Row 1)
│   ├── Total Systems Card
│   ├── Active Systems Card
│   ├── Critical Systems Card
│   └── Total Users Card
│
├── Secondary Metrics (Row 2)
│   ├── Active Rate Card
│   ├── Critical Rate Card
│   └── Maintenance Rate Card
│
├── Trend Chart (Row 3)
│   └── 30-Day Line Chart (Full Width)
│
└── Bottom Grid (Row 4) - 3 Columns
    ├── Status Donut Chart (lg={8})
    ├── Criticality Bar Chart (lg={8})
    └── Activity Feed Timeline (lg={8})
```

### State Management

```typescript
// Data State
const [statistics, setStatistics] = useState<SystemStatistics | null>(null);
const [loading, setLoading] = useState(true);
const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

// UI State
const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

// Filter State
const [dateRange, setDateRange] = useState<[dayjs.Dayjs | null, dayjs.Dayjs | null] | null>(null);
const [statusFilter, setStatusFilter] = useState<string>('all');
const [criticalityFilter, setCriticalityFilter] = useState<string>('all');
```

### Data Flow

1. **Initial Load**: `useEffect` → `fetchStatistics()` → API call
2. **Refresh**: User clicks refresh → `handleRefresh()` → `fetchStatistics()`
3. **Filter Change**: User changes filter → `handleXxxFilterChange()` → Console log (stub)
4. **Export**: User clicks export → `exportToJSON()` or `exportToCSV()` → File download

---

## Components & Sections

### KPI Card Component

**Location:** Inline in Dashboard.tsx (lines 538-653)

**Props/Features:**
- Border accent color (left border 4px)
- Animated counter using `react-countup`
- Trend indicator with icon and percentage
- 7-day sparkline chart
- Hover effect with shine animation
- Loading skeleton

**Example:**
```tsx
<Card className="kpi-card" style={{ borderLeft: '4px solid #1890ff' }}>
  <Statistic
    title="Tổng số hệ thống"
    value={statistics?.total || 0}
    prefix={<AppstoreOutlined />}
    formatter={(value) => <CountUp end={Number(value)} duration={1.5} />}
  />
  {renderTrend(getTrendData('total'))}
  {renderSparkline(statistics?.total || 50, 'up', '#1890ff')}
</Card>
```

### Sparkline Renderer

**Function:** `renderSparkline(baseValue, trend, color)`

**Parameters:**
- `baseValue`: Starting value for data generation
- `trend`: 'up' | 'down' | 'neutral'
- `color`: Line/gradient color

**Returns:** AreaChart with gradient fill (40px height)

### Trend Indicator

**Function:** `renderTrend(trendData)`

**Parameters:**
- `trendData.value`: Percentage change (-100 to 100)
- `trendData.trend`: 'up' | 'down' | 'neutral'

**Returns:** Formatted trend text with icon and color

### Charts

**Trend Line Chart:**
- Library: Recharts LineChart
- Data: 30 days of mock data
- Lines: Total, Active, Critical
- Responsive: 250px (mobile) / 350px (desktop)

**Status Donut Chart:**
- Library: Recharts PieChart
- Type: Donut (innerRadius: 60, outerRadius: 80)
- Legend: Bottom center
- Tooltip: On hover

**Criticality Bar Chart:**
- Library: Recharts BarChart
- Orientation: Vertical
- Color: Mapped by criticality level
- Grid: CartesianGrid with dashed lines

---

## Performance Optimizations

### useMemo Optimizations

All expensive computations are memoized:

```typescript
// Chart data - only recomputes when statistics change
const statusChartData = useMemo(() => { ... }, [statistics]);
const criticalityChartData = useMemo(() => { ... }, [statistics]);
const trendChartData = useMemo(() => { ... }, [statistics]);
const recentActivities = useMemo(() => { ... }, [statistics]);
```

**Benefits:**
- Prevents unnecessary recalculations on every render
- Reduces CPU usage during filter/state changes
- Maintains stable references for child components

### useCallback Optimizations

All event handlers are wrapped with useCallback:

```typescript
const handleRefresh = useCallback(() => { ... }, []);
const handleDateRangeChange = useCallback((dates) => { ... }, []);
const handleStatusFilterChange = useCallback((value) => { ... }, []);
const handleCriticalityFilterChange = useCallback((value) => { ... }, []);
const handleClearFilters = useCallback(() => { ... }, []);
```

**Benefits:**
- Prevents child component re-renders
- Stable function references
- Better React DevTools profiling

### Animation Optimizations

- **Framer Motion**: Stagger animations (0.1s delay between cards)
- **Chart Animations**: Disabled for static charts, enabled for sparklines
- **CSS Transitions**: Hardware-accelerated (transform, opacity)

---

## Accessibility

### ARIA Labels

All interactive elements have descriptive ARIA labels:

```typescript
<Button aria-label="Làm mới dữ liệu dashboard" title="Làm mới dữ liệu">
<RangePicker aria-label="Chọn khoảng thời gian" />
<Select aria-label="Lọc theo trạng thái" />
<Card role="article" aria-label="Tổng số hệ thống">
```

### Keyboard Navigation

- **Tab Order**: Logical flow (header → filters → cards → charts)
- **Focus Indicators**: Enhanced 3px blue outline with shadow
- **Skip Links**: Available for screen readers
- **Button Activation**: Enter/Space on all buttons

### Screen Reader Support

- **Role Attributes**: `region`, `article`, `search`
- **Hidden Icons**: `aria-hidden="true"` on decorative icons
- **Live Regions**: Updates announced on data changes
- **Semantic HTML**: Proper heading hierarchy

### Focus Styles

Enhanced focus indicators in `index.css`:

```css
.ant-btn:focus-visible {
  outline: 3px solid var(--color-primary);
  outline-offset: 2px;
  box-shadow: 0 0 0 4px rgba(0, 102, 230, 0.15);
}
```

---

## Responsive Design

### Breakpoints

```typescript
const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

// Ant Design Grid Breakpoints:
xs: 0-575px    (Mobile portrait)
sm: 576-767px  (Mobile landscape)
md: 768-991px  (Tablet)
lg: 992-1199px (Desktop)
xl: 1200px+    (Large desktop)
```

### Layout Adaptations

**Mobile (< 768px):**
- Single column layout (xs={24})
- Smaller font sizes (Title level 3)
- Icon-only buttons
- Reduced chart heights (250px)
- Vertical filter stacking
- Compact timeline

**Desktop (≥ 768px):**
- Multi-column grid (lg={6}, lg={8})
- Full button labels
- Larger charts (350px)
- Horizontal filter layout
- Enhanced hover effects

### Responsive Components

```typescript
<Col xs={24} sm={12} lg={6}>  // KPI Cards
<Col xs={24} lg={8}>          // Charts & Activity Feed
<Button>{isMobile ? '' : 'Làm mới'}</Button>
<ResponsiveContainer height={isMobile ? 250 : 350}>
```

---

## Customization

### Color Scheme

Defined in component constants:

```typescript
const STATUS_COLORS = {
  active: '#52c41a',    // Green
  inactive: '#ff4d4f',  // Red
  maintenance: '#faad14', // Orange
  draft: '#8c8c8c',     // Gray
};

const CRITICALITY_COLORS = {
  critical: '#ff4d4f',  // Red
  high: '#faad14',      // Orange
  medium: '#1890ff',    // Blue
  low: '#52c41a',       // Green
};
```

**To change colors:**
1. Update color constants
2. Ensure WCAG AA contrast ratio (4.5:1 for text)
3. Update CSS variables in `index.css` if needed

### Animations

**Framer Motion variants:**

```typescript
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: 'easeOut' },
  },
};
```

**To adjust animation speed:**
- Change `staggerChildren` (default: 0.1s)
- Change card `duration` (default: 0.4s)
- Modify `ease` function

### Chart Customization

**Line Chart:**
```typescript
<Line
  type="monotone"       // Line smoothing
  dataKey="total"
  stroke="#1890ff"      // Line color
  strokeWidth={2}       // Line thickness
  dot={{ r: 3 }}        // Dot size
/>
```

**Donut Chart:**
```typescript
<Pie
  innerRadius={60}      // Donut hole size
  outerRadius={80}      // Outer radius
  paddingAngle={2}      // Gap between segments
/>
```

---

## Future Backend Integration

### API Integration Points

**Current:** Mock data with stubs
**Future:** Real API calls

#### 1. Statistics Endpoint

```typescript
// Current
const fetchStatistics = async () => {
  const response = await api.get<SystemStatistics>('/systems/statistics/');
  setStatistics(response.data);
};

// Future: With filters
const fetchStatistics = async () => {
  const params = {
    date_from: dateRange?.[0]?.format('YYYY-MM-DD'),
    date_to: dateRange?.[1]?.format('YYYY-MM-DD'),
    status: statusFilter !== 'all' ? statusFilter : undefined,
    criticality: criticalityFilter !== 'all' ? criticalityFilter : undefined,
  };
  const response = await api.get<SystemStatistics>('/systems/statistics/', { params });
  setStatistics(response.data);
};
```

#### 2. Filter Handlers

**Current:** Console logs (stubs)

```typescript
const handleDateRangeChange = useCallback((dates: any) => {
  setDateRange(dates);
  console.log('Date range changed:', dates); // STUB
}, []);
```

**Future:** Trigger API refetch

```typescript
const handleDateRangeChange = useCallback((dates: any) => {
  setDateRange(dates);
  fetchStatistics(); // Real API call
}, []);
```

#### 3. Trend Data

**Current:** Mock data generation

```typescript
const trendChartData = useMemo(() => {
  // Generate 30 days of mock data with ±5% variance
  ...
}, [statistics]);
```

**Future:** Historical data from API

```typescript
const [trendData, setTrendData] = useState([]);

useEffect(() => {
  const fetchTrendData = async () => {
    const response = await api.get('/systems/trends/', {
      params: { days: 30 }
    });
    setTrendData(response.data);
  };
  fetchTrendData();
}, [dateRange]);
```

#### 4. Activity Feed

**Current:** Random mock activities

**Future:** Real activity log from backend

```typescript
const [activities, setActivities] = useState([]);

useEffect(() => {
  const fetchActivities = async () => {
    const response = await api.get('/systems/activities/', {
      params: { limit: 8, order: '-created_at' }
    });
    setActivities(response.data.results);
  };
  fetchActivities();
}, []);
```

### Backend Requirements

To support all dashboard features, the backend should provide:

1. **GET /systems/statistics/**
   - Query params: `date_from`, `date_to`, `status`, `criticality`
   - Response: SystemStatistics type

2. **GET /systems/trends/**
   - Query params: `days` (default: 30)
   - Response: Array of `{ date, total, active, critical }`

3. **GET /systems/activities/**
   - Query params: `limit`, `offset`, `order`
   - Response: Paginated activity list

---

## Troubleshooting

### Common Issues

#### 1. Charts Not Rendering

**Symptoms:** Empty chart areas or "undefined" errors

**Causes:**
- Missing Recharts library
- Invalid data format
- Null/undefined statistics

**Solution:**
```bash
npm install recharts
```

Check data shape matches expected format:
```typescript
// Status chart expects:
[{ name: string, value: number, color: string }]

// Trend chart expects:
[{ date: string, total: number, active: number, critical: number }]
```

#### 2. Animations Not Working

**Symptoms:** Cards appear instantly without fade-in

**Causes:**
- Framer Motion not installed
- Motion variants misconfigured

**Solution:**
```bash
npm install framer-motion
```

Verify `containerVariants` and `cardVariants` are defined before JSX.

#### 3. Mobile Layout Broken

**Symptoms:** Overlapping elements, horizontal scroll

**Causes:**
- Missing responsive props
- Fixed widths instead of percentages
- isMobile state not updating

**Solution:**

Check window resize listener:
```typescript
useEffect(() => {
  const handleResize = () => {
    setIsMobile(window.innerWidth < 768);
  };
  window.addEventListener('resize', handleResize);
  return () => window.removeEventListener('resize', handleResize);
}, []);
```

Ensure all Cols have `xs={24}`:
```typescript
<Col xs={24} sm={12} lg={6}>
```

#### 4. Export Not Downloading

**Symptoms:** No file download on export click

**Causes:**
- Blob/URL issues
- Browser blocking downloads
- Missing data

**Solution:**

Check browser console for errors. Verify:
```typescript
const blob = new Blob([data], { type: 'application/json' });
const url = URL.createObjectURL(blob);
const link = document.createElement('a');
link.href = url;
link.download = filename;
document.body.appendChild(link);
link.click();
document.body.removeChild(link);
URL.revokeObjectURL(url); // Clean up
```

#### 5. Performance Issues

**Symptoms:** Slow rendering, laggy animations

**Causes:**
- Missing useMemo/useCallback
- Large data sets
- Too many re-renders

**Solution:**

Check React DevTools Profiler:
1. Open DevTools → Profiler tab
2. Click Record
3. Interact with dashboard
4. Analyze render times

Ensure memoization:
```typescript
const chartData = useMemo(() => computeData(), [statistics]);
const handleClick = useCallback(() => { ... }, []);
```

#### 6. Filter Not Working

**Symptoms:** Filters change but data unchanged

**Causes:**
- Handler stubs not replaced with API calls
- API not supporting filter params

**Solution:**

Currently filters are stubs. To enable:
1. Implement filter API support in backend
2. Replace console.log stubs with fetchStatistics() calls
3. Test with real API

---

## Best Practices

### 1. Performance

- ✅ Use useMemo for expensive computations
- ✅ Use useCallback for event handlers
- ✅ Avoid inline functions in JSX
- ✅ Lazy load charts if needed
- ✅ Debounce filter changes (500ms)

### 2. Accessibility

- ✅ All interactive elements have ARIA labels
- ✅ Keyboard navigation tested
- ✅ Screen reader tested with NVDA/JAWS
- ✅ Color contrast meets WCAG AA
- ✅ Focus indicators visible

### 3. Responsiveness

- ✅ Test on real devices (iPhone, iPad, Android)
- ✅ Use relative units (%, rem) over px
- ✅ Touch targets min 44×44px
- ✅ Avoid horizontal scroll
- ✅ Optimize images/charts for mobile

### 4. Code Quality

- ✅ TypeScript strict mode
- ✅ ESLint no warnings
- ✅ Comments for complex logic
- ✅ Consistent naming conventions
- ✅ Small, focused functions

---

## Changelog

### v1.0.0 (2026-01-17)

**Features Added:**
- ✨ 30-day trend line chart with mock data
- ✨ Activity feed timeline with 8 recent activities
- ✨ Sparklines on all KPI cards
- ✨ Advanced filter UI (date range, status, criticality)
- ✨ Export functionality (JSON & CSV download)

**Enhancements:**
- 🎨 Micro-interactions and hover effects
- 🎨 Shimmer loading animations
- 🎨 Button ripple effects
- 🎨 Timeline hover transitions

**Accessibility:**
- ♿ ARIA labels on all interactive elements
- ♿ Enhanced keyboard navigation
- ♿ Screen reader support
- ♿ Skip-to-main link

**Performance:**
- ⚡ useMemo for chart data
- ⚡ useCallback for event handlers
- ⚡ Optimized re-renders
- ⚡ Animation performance improvements

---

## Support & Contact

For questions or issues with the Dashboard component:

- **Technical Lead:** [Your Name]
- **Email:** [your.email@example.com]
- **Documentation:** `/frontend/DASHBOARD_GUIDE.md`
- **Source Code:** `/frontend/src/pages/Dashboard.tsx`

---

**Last Updated:** January 17, 2026
**Version:** 1.0.0
**Status:** Production Ready (with mock data)
