# Brainstorm: Implementation Approaches for System Visualization

**Date**: 2026-01-24
**Feature**: Interactive Architecture Visualization

---

## Approach 1: Hierarchical Accordion Layout ⭐ RECOMMENDED

### Concept
Vertical stack của 5 tầng, mỗi tầng có thể expand/collapse như accordion.

### Pros
- ✅ **Simple & intuitive** - Users đã quen với accordion pattern
- ✅ **Mobile-friendly** - Responsive tốt trên tablet/mobile
- ✅ **Progressive disclosure** - Chỉ show info khi cần
- ✅ **Easy to implement** - Không cần complex graph library
- ✅ **Performant** - Lazy load data khi expand
- ✅ **Accessible** - Screen reader friendly

### Cons
- ❌ Không thể thấy "big picture" một lúc (phải scroll)
- ❌ Ít visual appeal hơn so với interactive graph

### Tech Stack
- React + Headless UI Accordion
- Framer Motion for smooth animations
- Tailwind CSS for styling

### Implementation Complexity
**Low-Medium** (2-3 weeks)

### Mockup
```
┌─────────────────────────────────────────────┐
│ ▼ Tầng 5 - Ứng dụng          [24/28] 85%   │
│   ┌─────────────────────────────────────┐   │
│   │ L5.1 - Kênh truy cập Bộ    [6/7]   │   │
│   │   • MST UGP Portal        🟢        │   │
│   │   • MST Leader Dashboard  🟢        │   │
│   │   • MST Officer Workspace 🟡        │   │
│   │   ...                               │   │
│   └─────────────────────────────────────┘   │
│                                             │
│ ► Tầng 4 - Tích hợp           [4/4] 100%   │
│ ► Tầng 3 - Dịch vụ            [32/45] 71%  │
│ ► Tầng 2 - Dữ liệu & AI       [15/18] 83%  │
│ ► Tầng 1 - Hạ tầng            [6/6] 100%   │
└─────────────────────────────────────────────┘
```

---

## Approach 2: Interactive Node Graph

### Concept
Diagram dạng flowchart/network graph với nodes & edges, như architecture diagram thực tế.

### Pros
- ✅ **Visual appeal** - Đẹp, impressive cho executive
- ✅ **Show relationships** - Thấy rõ dependencies giữa systems
- ✅ **Zooming** - Zoom in/out để xem detail/overview
- ✅ **Professional** - Trông giống architecture diagram thực

### Cons
- ❌ **Complex to implement** - Cần library như React Flow, D3
- ❌ **Layout challenges** - Auto-layout có thể messy với nhiều nodes
- ❌ **Performance** - Slow nếu có 100+ nodes
- ❌ **Mobile unfriendly** - Khó tương tác trên tablet/mobile
- ❌ **Accessibility** - Khó làm accessible

### Tech Stack
- React Flow hoặc D3.js
- Custom layout algorithm
- WebGL for performance (nếu cần)

### Implementation Complexity
**High** (6-8 weeks)

### Use Case
- Tốt cho **technical audience** (architects, developers)
- Không tốt cho **executive dashboard** (quá technical)

---

## Approach 3: Hybrid - Visual Blocks with Drill-Down

### Concept
Visual blocks cho mỗi tầng, arrange giống diagram gốc, nhưng click để drill-down.

### Pros
- ✅ **Balance** - Visual + usability
- ✅ **Familiar layout** - Giống architecture diagram gốc
- ✅ **Moderate complexity** - Không quá phức tạp
- ✅ **Shows structure** - Thấy rõ tầng và grouping

### Cons
- ❌ Cần design cẩn thận để không cluttered
- ❌ Responsive có thể phức tạp

### Tech Stack
- React + Tailwind
- CSS Grid for layout
- React Query for data

### Implementation Complexity
**Medium** (3-4 weeks)

### Mockup
```
┌───────────────────────────────────────────────┐
│        Tầng 5 - Ứng dụng [24/28]              │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐    │
│  │L5.1      │  │L5.2      │  │BFF       │    │
│  │Kênh Bộ   │  │Kênh Cục  │  │          │    │
│  │[6/7] 85% │  │[4/5] 80% │  │[2/2]100% │    │
│  └──────────┘  └──────────┘  └──────────┘    │
└───────────────────────────────────────────────┘
         ↓ Connections ↓
┌───────────────────────────────────────────────┐
│     Tầng 4 - Tích hợp & Trung gian [4/4]      │
│  ┌──────────┐  ┌──────────┐                   │
│  │L4.1      │  │L4.2      │                   │
│  │Tích hợp  │  │Bên ngoài │                   │
│  │[2/2]     │  │[2/2]     │                   │
│  └──────────┘  └──────────┘                   │
└───────────────────────────────────────────────┘
         ↓
       ...
```

---

## Approach 4: Tabbed View by Layer

### Concept
Tabs cho mỗi tầng, click tab để switch.

### Pros
- ✅ **Simple** - Rất dễ implement
- ✅ **Clean** - Không cluttered
- ✅ **Focus** - Chỉ focus vào 1 tầng at a time

### Cons
- ❌ **No overview** - Không thấy all layers cùng lúc
- ❌ **More clicks** - Phải click nhiều để explore
- ❌ **Lose context** - Không thấy relationship giữa layers

### Use Case
- Tốt cho **detailed exploration**
- Không tốt cho **strategic overview**

---

## Approach 5: Timeline/Roadmap View

### Concept
Horizontal timeline showing past → present → future của platform development.

### Pros
- ✅ **Strategic focus** - Show evolution over time
- ✅ **Future planning** - Visualize roadmap
- ✅ **Executive-friendly** - Story-telling approach

### Cons
- ❌ Không match với 5-layer architecture
- ❌ Khác với user request (muốn visualize layers)

### Use Case
- Tốt cho **separate roadmap feature**
- Không phù hợp cho **architecture visualization**

---

## Comparison Matrix

| Approach | Complexity | Visual Appeal | Usability | Mobile | Exec-Friendly | Recommend |
|----------|------------|---------------|-----------|--------|---------------|-----------|
| 1. Accordion | Low-Med | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ✅ YES |
| 2. Node Graph | High | ⭐⭐⭐⭐⭐ | ⭐⭐ | ⭐ | ⭐⭐ | ❌ No |
| 3. Visual Blocks | Medium | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ | 🤔 Maybe |
| 4. Tabs | Low | ⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ❌ No |
| 5. Timeline | Medium | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ | ❌ No |

---

## RECOMMENDATION: Hybrid Approach

**Primary View**: Accordion (Approach 1)
**Secondary View**: Visual Blocks (Approach 3) - Toggle

### Why Hybrid?

1. **Default: Accordion**
   - Easy to use, mobile-friendly
   - Fast to implement
   - Meet 80% use cases

2. **Optional: Visual Blocks**
   - For users who want "big picture"
   - Toggle button: [List View] [Diagram View]
   - Desktop only

### Implementation Strategy

**Phase 1** (MVP - 2-3 weeks):
- ✅ Accordion view only
- ✅ Basic drill-down
- ✅ System detail modal
- ✅ Search & filters

**Phase 2** (Enhancement - 2 weeks):
- ✅ Visual blocks view
- ✅ Toggle between views
- ✅ Better animations

**Phase 3** (Advanced - Optional):
- ✅ Export as image/PDF
- ✅ Customizable layout
- ✅ Real-time status updates

---

## Data Flow Design

### User Journey
```
1. User lands on dashboard
   ↓
2. See 5 layers in collapsed state
   ↓
3. Click "Tầng 3 - Dịch vụ"
   ↓
4. API call: GET /api/architecture/components?layer_id=3
   ↓
5. Expand to show 5 khối (clusters)
   ↓
6. Click "Khối core services"
   ↓
7. API call: GET /api/systems?component_id=15
   ↓
8. Show list of 8 systems with status
   ↓
9. Click "MST Identity SSO"
   ↓
10. API call: GET /api/systems/123
    ↓
11. Open modal with full detail
    ↓
12. Click "View Full Details"
    ↓
13. Navigate to /systems/123 page
```

### API Calls
- **Initial load**: GET `/api/architecture/layers` (only)
- **On expand layer**: GET `/api/architecture/components?layer_id={id}`
- **On expand cluster**: GET `/api/systems?component_id={id}`
- **On click system**: GET `/api/systems/{id}`

**Total API calls**: 1 + N (lazy loaded)
**Initial payload**: < 5KB
**Lazy loaded**: ~10-50KB per expansion

---

## Component Architecture

```
<SystemArchitectureVisualization>
  ├── <ArchitectureHeader>
  │     ├── <ViewToggle>          // List | Diagram
  │     └── <FilterBar>           // Search, Layer, Status filters
  │
  ├── <AccordionView>             // Default view
  │     └── <LayerAccordion>      // For each layer
  │           └── <ClusterAccordion>   // For each cluster
  │                 └── <SystemList>   // List of systems
  │                       └── <SystemCard>  // Individual system
  │
  ├── <DiagramView>               // Optional toggle view
  │     └── <VisualBlocks>
  │
  ├── <SystemDetailModal>         // Modal on click
  │     ├── <SystemInfo>
  │     ├── <SystemStatus>
  │     ├── <SystemDependencies>
  │     └── <SystemActions>
  │
  └── <ArchitectureSummary>       // Bottom stats
```

---

## State Management

### Global State (Zustand)
```typescript
interface ArchitectureState {
  // View mode
  viewMode: 'accordion' | 'diagram';

  // Filters
  filters: {
    search: string;
    layerId: number | null;
    statusFilter: string[];
    orgFilter: string[];
  };

  // Expansion state
  expandedLayers: Set<number>;
  expandedClusters: Set<number>;

  // Selected system
  selectedSystemId: number | null;
  isModalOpen: boolean;

  // Actions
  toggleLayer: (layerId: number) => void;
  toggleCluster: (clusterId: number) => void;
  setFilters: (filters: Partial<Filters>) => void;
  openSystemDetail: (systemId: number) => void;
}
```

### Server State (React Query)
```typescript
// Queries
useArchitectureLayers()           // Cache: 1 hour
useArchitectureComponents(layerId) // Cache: 30 min
useSystems(componentId)            // Cache: 5 min
useSystemDetail(systemId)          // Cache: 5 min
useArchitectureMetrics()           // Cache: 1 min (real-time)
```

---

## Animation Strategy

### Accordion Animations
- **Expand/Collapse**: 300ms ease-in-out
- **Height**: auto (use Framer Motion)
- **Fade in**: Content fades while expanding

### System Cards
- **Hover**: Scale 1.02, shadow increase (100ms)
- **Click**: Ripple effect

### Modal
- **Open**: Fade + slide from bottom (200ms)
- **Close**: Fade out (150ms)

### Loading States
- **Skeleton**: Pulse animation
- **Spinner**: Only for long operations (>500ms)

---

## Responsive Breakpoints

### Desktop (>= 1024px)
- Full accordion view
- Optional diagram toggle
- Modal width: 800px

### Tablet (768px - 1023px)
- Accordion view only
- No diagram view
- Modal width: 90vw

### Mobile (< 768px)
- Out of scope for v1
- Show message: "Please use tablet or desktop"

---

## Accessibility

### Keyboard Navigation
- `Tab`: Navigate between layers/systems
- `Enter/Space`: Expand/collapse
- `Esc`: Close modal
- `Arrow keys`: Navigate within lists

### Screen Reader
- ARIA labels for all interactive elements
- Live regions for dynamic content
- Proper heading hierarchy (h1 → h6)

### Focus Management
- Visible focus indicators
- Trap focus in modal
- Restore focus on modal close

---

## Performance Optimization

### Code Splitting
```typescript
// Lazy load diagram view
const DiagramView = lazy(() => import('./DiagramView'));

// Lazy load modal
const SystemDetailModal = lazy(() => import('./SystemDetailModal'));
```

### Virtualization
- If system list > 50 items, use `react-window`
- Virtual scroll for long lists

### Memoization
```typescript
// Memo expensive calculations
const layerMetrics = useMemo(() =>
  calculateMetrics(systems),
  [systems]
);

// Memo components
const SystemCard = memo(SystemCardComponent);
```

### Image Optimization
- Use SVG for icons (not PNG)
- Lazy load images
- Use modern formats (WebP)

---

## Testing Strategy

### Unit Tests
- Component rendering
- State management logic
- Filter/search functions
- API response parsing

### Integration Tests
- User flows (expand → click → view detail)
- Filter combinations
- API integration

### E2E Tests (Playwright)
```typescript
test('User can drill down to system detail', async ({ page }) => {
  await page.goto('/dashboard');
  await page.click('text=Tầng 3 - Dịch vụ');
  await page.click('text=Khối core services');
  await page.click('text=MST Identity SSO');
  await expect(page.locator('.modal')).toBeVisible();
  await expect(page.locator('.modal h2')).toContainText('MST Identity SSO');
});
```

---

## Next Steps

1. ✅ **Brainstorming complete** → This document
2. ⏭️ Get stakeholder approval on approach
3. ⏭️ Design database schema
4. ⏭️ Design API endpoints
5. ⏭️ Create Figma mockup (optional)
6. ⏭️ Implement MVP (Accordion view)
7. ⏭️ User testing
8. ⏭️ Iterate based on feedback
