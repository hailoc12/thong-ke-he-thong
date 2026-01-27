# Đề Xuất Cải Tiến Responsive UI/UX

## Tổng Quan Vấn Đề

### Vấn đề hiện tại
1. **SystemDetail.tsx**: `Descriptions` component sử dụng `column={2}` cố định → title/label bị đè lên nhau trên màn hình nhỏ
2. **Systems.tsx**: Table scroll horizontal khó dùng trên mobile
3. **Thiếu breakpoint cho tablet** (chỉ có mobile <768px và desktop)

### Root Cause Analysis
```tsx
// SystemDetail.tsx - Vấn đề chính
<Descriptions bordered column={2}>  // ← column cố định, không responsive
  <Descriptions.Item label="Rất dài label text">
    {content}
  </Descriptions.Item>
</Descriptions>
```

---

## Giải Pháp Đề Xuất

### 1. Fix SystemDetail.tsx - Responsive Descriptions

**Thay đổi từ:**
```tsx
<Descriptions bordered column={2}>
```

**Thành:**
```tsx
<Descriptions
  bordered
  column={{ xs: 1, sm: 1, md: 2, lg: 2, xl: 2 }}
  size={isMobile ? 'small' : 'default'}
>
```

**Giải thích:**
- `xs: 1, sm: 1`: Mobile và tablet nhỏ → 1 column (label + value theo chiều dọc)
- `md: 2, lg: 2, xl: 2`: Tablet lớn và desktop → 2 columns

### 2. Add Mobile Detection Hook

**Tạo hook mới** `useMobileDetect.ts`:
```tsx
import { useState, useEffect } from 'react';
import { breakpoints } from '../theme/tokens';

export const useMobileDetect = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [isTablet, setIsTablet] = useState(window.innerWidth >= 768 && window.innerWidth < 992);

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setIsMobile(width < 768);
      setIsTablet(width >= 768 && width < 992);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return { isMobile, isTablet, isDesktop: !isMobile && !isTablet };
};
```

### 3. SystemDetail.tsx - Full Responsive Refactor

```tsx
const SystemDetail = () => {
  const { isMobile, isTablet } = useMobileDetect();

  // Responsive column configuration
  const descriptionColumns = { xs: 1, sm: 1, md: 2, lg: 2, xl: 2 };
  const descriptionSize = isMobile ? 'small' : 'default';

  // ... rest of component

  const collapseItems = [
    {
      key: '1',
      label: (
        <span>
          <InfoCircleOutlined /> {isMobile ? 'Cơ bản' : 'Thông tin cơ bản'}
        </span>
      ),
      children: (
        <Descriptions
          bordered
          column={descriptionColumns}
          size={descriptionSize}
          labelStyle={{
            width: isMobile ? '40%' : '30%',
            whiteSpace: 'normal',    // Cho phép wrap text
            wordBreak: 'break-word'
          }}
          contentStyle={{
            whiteSpace: 'normal',
            wordBreak: 'break-word'
          }}
        >
          {/* ... items */}
        </Descriptions>
      ),
    },
    // ... other sections
  ];

  return (
    <div style={{
      padding: isMobile ? '12px' : '24px',
      background: '#f0f2f5',
      minHeight: '100vh'
    }}>
      {/* ... */}
    </div>
  );
};
```

### 4. Thêm CSS Global cho Responsive Descriptions

**Thêm vào `index.css`:**
```css
/* ========================================
   RESPONSIVE DESCRIPTIONS
   ======================================== */

/* Mobile: Stack label và content theo chiều dọc */
@media (max-width: 767px) {
  .ant-descriptions-item-label {
    font-size: 12px !important;
    padding: 8px !important;
    width: auto !important;
    min-width: unset !important;
  }

  .ant-descriptions-item-content {
    font-size: 13px !important;
    padding: 8px !important;
  }

  /* Collapse panel header on mobile */
  .ant-collapse-header {
    padding: 12px 16px !important;
    font-size: 14px !important;
  }

  .ant-collapse-content-box {
    padding: 12px !important;
  }
}

/* Tablet: Vừa đủ spacing */
@media (min-width: 768px) and (max-width: 991px) {
  .ant-descriptions-item-label {
    font-size: 13px !important;
    padding: 10px !important;
  }

  .ant-descriptions-item-content {
    font-size: 14px !important;
    padding: 10px !important;
  }
}
```

---

## Cải Tiến Systems.tsx (Table List)

### 1. Mobile Card View thay vì Table

**Đề xuất:** Trên mobile, hiển thị dạng Card thay vì Table để UX tốt hơn

```tsx
const Systems = () => {
  const { isMobile } = useMobileDetect();

  // Mobile: Render dạng Card
  if (isMobile) {
    return (
      <div>
        {/* Header */}
        <MobileHeader />

        {/* Card list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {systems.map(system => (
            <SystemCard key={system.id} system={system} />
          ))}
        </div>

        {/* Pagination */}
        <MobilePagination pagination={pagination} />
      </div>
    );
  }

  // Desktop/Tablet: Keep Table
  return (
    <Table columns={columns} ... />
  );
};

// SystemCard component
const SystemCard = ({ system }: { system: System }) => (
  <Card
    size="small"
    onClick={() => navigate(`/systems/${system.id}`)}
    style={{ cursor: 'pointer' }}
  >
    <Space direction="vertical" size={4} style={{ width: '100%' }}>
      <Space justify="space-between" style={{ width: '100%' }}>
        <Text strong>{system.system_code}</Text>
        <Tag color={getStatusColor(system.status)}>
          {getStatusLabel(system.status).short}
        </Tag>
      </Space>

      <Text
        style={{ fontSize: 15, fontWeight: 500 }}
        ellipsis={{ tooltip: system.system_name }}
      >
        {system.system_name}
      </Text>

      <Text type="secondary" style={{ fontSize: 12 }}>
        {system.org_name}
      </Text>

      <Divider style={{ margin: '8px 0' }} />

      <Space justify="space-between" style={{ width: '100%' }}>
        <Space size={4}>
          <Button size="small" type="link">Xem</Button>
          <Button size="small" type="link">Sửa</Button>
        </Space>
        <Text type="secondary" style={{ fontSize: 11 }}>
          {system.completion_percentage?.toFixed(0)}% hoàn thành
        </Text>
      </Space>
    </Space>
  </Card>
);
```

### 2. Cải tiến Table cho Tablet

```tsx
const columns: ColumnsType<System> = [
  {
    title: 'Hệ thống',  // Gộp mã + tên trên mobile/tablet
    dataIndex: 'system_name',
    key: 'system_name',
    render: (_, record) => (
      <Space direction="vertical" size={0}>
        <Text strong style={{ fontSize: 13 }}>{record.system_code}</Text>
        <Text ellipsis style={{ maxWidth: 200 }}>{record.system_name}</Text>
      </Space>
    ),
    responsive: ['xs', 'sm'] as any,  // Chỉ hiện trên mobile/small tablet
  },
  // ... columns cho desktop
];
```

---

## Priority Implementation

### Phase 1: Quick Wins (High Impact, Low Effort)
1. ✅ Fix `Descriptions column` responsive trong SystemDetail.tsx
2. ✅ Thêm CSS media queries cho Descriptions
3. ✅ Giảm font-size trên mobile

### Phase 2: Medium Term (Medium Impact, Medium Effort)
4. 🔲 Tạo `useMobileDetect` hook
5. 🔲 Shorten labels trên mobile (Collapse header)
6. 🔲 Optimize spacing/padding

### Phase 3: Full Redesign (High Impact, High Effort)
7. 🔲 Mobile Card View cho Systems list
8. 🔲 Bottom sheet cho actions trên mobile
9. 🔲 Pull-to-refresh

---

## Before/After Comparison

### SystemDetail - Current (Broken)
```
┌─────────────────────────────────────────────────┐
│ Mã hệ thống │ HT001 │ Tên hệ thống │ Hệ thống │
│─────────────┼───────┼──────────────┼──────────│
│ Trạng thái  │Đang vận│Mức độ quan   │Quan trọng│  ← Bị đè lên nhau!
│             │ hành   │trọng         │          │
└─────────────────────────────────────────────────┘
```

### SystemDetail - After (Fixed)
```
Mobile (< 768px):
┌─────────────────────┐
│ Mã hệ thống         │
│ HT001               │
├─────────────────────┤
│ Tên hệ thống        │
│ Hệ thống quản lý... │
├─────────────────────┤
│ Trạng thái          │
│ Đang vận hành       │
└─────────────────────┘

Desktop (≥ 768px):
┌─────────────────────┬─────────────────────┐
│ Mã hệ thống │ HT001 │ Tên hệ thống │ ... │
├─────────────────────┼─────────────────────┤
│ Trạng thái │ Đang  │ Mức độ       │ Quan│
│            │ vận...│ quan trọng   │ trọng│
└─────────────────────┴─────────────────────┘
```

---

## Implementation Files

| File | Changes |
|------|---------|
| `frontend/src/pages/SystemDetail.tsx` | Add responsive columns, mobile detection |
| `frontend/src/pages/Systems.tsx` | Optional: Mobile card view |
| `frontend/src/index.css` | Add media queries for Descriptions |
| `frontend/src/hooks/useMobileDetect.ts` | NEW: Shared mobile detection hook |

---

## Estimated Impact

| Metric | Before | After |
|--------|--------|-------|
| Mobile readability | 2/10 | 8/10 |
| Touch target size | Small | Adequate |
| Information density | Cramped | Comfortable |
| User task completion | Low | High |

---

## Next Steps

1. **Review đề xuất này** với stakeholders
2. **Implement Phase 1** (Quick wins) trước
3. **Test trên thiết bị thực** (iPhone, Android, iPad)
4. **Gather feedback** và iterate

