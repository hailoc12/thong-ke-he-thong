# Spec: Xuất Báo Cáo Excel - Dashboard Admin

## Overview
Tính năng xuất báo cáo Excel từ dashboard admin với 4 sheets, format chuyên nghiệp theo mẫu.

## Yêu cầu Format

### Font & Style
- **Font**: Times New Roman
- **Size**: 14 (standard), 16-18 (headers), 12 (notes)
- **Alignment**:
  - Headers: Center, Middle
  - Numbers: Right
  - Text: Left/Center
- **Màu sắc**:
  - Header chính: Xanh đậm (#1F4E78 - Excel standard blue)
  - Header phụ: Xanh nhạt (#D9E1F2)
  - Border: Xanh đậm (#1F4E78)
  - Highlight cảnh báo: Cam (#FFC000), Đỏ (#FF0000)

---

## Sheet 1: TỔNG QUAN

### Layout
```
┌─────────────────────────────────────────────────────────────┐
│          BÁO CÁO TỔNG QUAN HỆ THỐNG CDS                    │
│                                                          Ngày 26/01/2026    │
├─────────────────────────────────────────────────────────────┤
│ CHỈ TIÊU                    │ GIÁ TRỊ      │ GHI CHÚ         │
├─────────────────────────────┼───────────────┼─────────────────┤
│ 1. Tổng số hệ thống          │ 125           │                 │
│ 2. Số hệ thống đang hoạt động│ 98            │ 78.4%           │
│ 3. Số hệ thống thí điểm      │ 15            │ 12.0%           │
│ 4. Số hệ thống dừng          │ 8             │ 6.4%            │
│ 5. Số hệ thống sắp thay thế  │ 4             │ 3.2%            │
├─────────────────────────────┼───────────────┼─────────────────┤
│ THEO MỨC ĐỘ QUAN TRỌNG      │               │                 │
├─────────────────────────────┼───────────────┼─────────────────┤
│ 6. Cực kỳ quan trọng         │ 35            │ 28.0%           │
│ 7. Quan trọng                │ 50            │ 40.0%           │
│ 8. Trung bình                │ 30            │ 24.0%           │
│ 9. Thấp                      │ 10            │ 8.0%            │
├─────────────────────────────┼───────────────┼─────────────────┤
│ THEO TRÌNH ĐỘ NHẬP LIỆU     │               │                 │
├─────────────────────────────┼───────────────┼─────────────────┤
│ 10. Tỷ lệ nhập liệu TB       │ 65.8%         │                 │
│ 11. Số hệ thống 100%        │ 42            │ 33.6%           │
│ 12. Số hệ thống <50%        │ 25            │ 20.0%           │
└─────────────────────────────┴───────────────┴─────────────────┘
```

### Styling
- Row 1 (Title): Merge A1:C1, Font 18 Bold, Center, Bg: #1F4E78, Text: White
- Row 2 (Date): Merge A2:C2, Font 14 Italic, Right
- Row 3 (Header): Font 14 Bold, Bg: #D9E1F2, Border: All
- Data rows: Font 14, Border: Horizontal only
- Summary row (nếu có): Bg: #FFC000, Font 14 Bold

---

## Sheet 2: THỐNG KÊ THEO ĐƠN VỊ

### Layout (Theo ảnh mẫu)
```
┌────┬──────────────────────────────────┬──────────┬───────────────────────────┬───────────────────────────┬──────────────┐
│ STT│ ĐƠN VỊ                           │TRẠNG THÁI│ TỶ LỆ NHẬP DỮ LIỆU...    │ TỶ LỆ NHẬP DỮ LIỆU...    │ SỐ LƯỢNG    │
│    │                                  │          │─────────────┬─────────────│─────────────┬─────────────│ ĐƠN VỊ      │
│    │                                  │          │Số hệ thống  │% hoàn thành  │Số hệ thống  │% hoàn thành  │             │
│    │                                  │          │             │ TB           │             │ TB           │             │
├────┼──────────────────────────────────┼──────────┼─────────────┼─────────────┼─────────────┼─────────────┼──────────────┤
│ 1  │ Trường Cao đẳng TT&TT            │ Hoạt động│ 2           │ 26,1        │ 2           │ 63,30       │              │
│ 2  │ NXB KHCN-TT&TT                   │ Hoạt động│ Chưa có DL  │ Chưa có DL  │ Chưa có DL  │ Chưa có DL  │              │
│... │ ...                              │ ...      │ ...         │ ...         │ ...         │ ...         │              │
├────┼──────────────────────────────────┼──────────┼─────────────┼─────────────┼─────────────┼─────────────┼──────────────┤
│    │ TỔNG HỢP:                        │          │             │             │             │             │              │
│    │ 32 Đơn vị                         │          │             │             │             │             │              │
│    │ Đã cập nhật: 21                  │          │             │             │             │             │              │
│    │ Trong đó:                         │          │             │             │             │             │              │
│    │ - Tỷ lệ >80%: 1                   │          │             │             │             │             │              │
│    │ - Tỷ lệ 60-80%: 9                 │          │             │             │             │             │              │
│    │ - Tỷ lệ <30%: 6                   │          │             │             │             │             │              │
│    │ Chưa cập nhật: 11                 │          │             │             │             │             │              │
└────┴──────────────────────────────────┴──────────┴─────────────┴─────────────┴─────────────┴─────────────┴──────────────┘
```

### Multi-Level Header (Merged Cells)
```
Row 1: │ A  │ B          │ C │   D            │   E            │   F            │ G            │
      │STT │ ĐƠN VỊ     │TRẠNG│ TỶ LỆ...      │ TỶ LỆ...      │ SỐ LƯỢNG     │
      │    │            │THÁI │ 17h30          │ 08h30          │ ĐƠN VỊ       │
Row 2: │    │            │    │─────────┼─────│─────────┼─────│              │
      │    │            │    │Số hệ th.│% Hoàn│Số hệ th.│% Hoàn│              │
      │    │            │    │         │ TB   │         │ TB   │              │
```

### Styling
- Row 1 (Header chính): Font 14 Bold, Bg: #1F4E78, Text: White, Center
- Row 2 (Header phụ): Font 13 Bold, Bg: #D9E1F2, Center
- Data rows: Font 14, Border: All
- Row n+1 (Summary): Bg: #FFC000, Font 14 Bold, Merge cells

---

## Sheet 3: THỐNG KÊ HỆ THỐNG

### Layout
```
┌──────┬─────────────────────────────────┬───────────────────┬──────────┬──────────┬─────────────┬─────────────┐
│ STT  │ TÊN HỆ THỐNG                    │ ĐƠN VỊ            │ TRẠNG THÁI│ QUAN TRỌNG│ % HOÀN THÀNH│ NGÀY CẬP    │
├──────┼─────────────────────────────────┼───────────────────┼──────────┼──────────┼─────────────┼─────────────┤
│ 1    │ Hệ thống quản lý tài sản        │ Cục Công nghệ TT  │ Hoạt động│ Cực kỳ   │ 85,5%       │ 25/01/2026  │
│ 2    │ Hệ thống giám sát mạng          │ Trung tâm Internet│ Thí điểm │ Quan     │ 42,3%       │ 20/01/2026  │
│ 3    │ ...                             │ ...               │ ...      │ ...      │ ...         │ ...         │
└──────┴─────────────────────────────────┴───────────────────┴──────────┴──────────┴─────────────┴─────────────┘
```

### Styling
- Header row: Font 14 Bold, Bg: #1F4E78, Text: White
- Freeze first row
- Auto-fit columns
- Sort theo: Đơn vị → % Hoàn thành (desc)
- Color code % hoàn thành:
  - >=80%: Green bg (#C6EFCE)
  - 60-79%: Yellow bg (#FFEB9C)
  - <60%: Red bg (#FFC7CE)

---

## Sheet 4: LƯU Ý ĐÔN ĐỐC (NEW)

### Layout
```
┌──────┬─────────────────────────────────┬─────────────┬───────────────────────────────────┐
│ STT  │ ĐƠN VỊ                          │ % HOÀN THÀNH│ LƯU Ý / GHI CHÚ                   │
├──────┼─────────────────────────────────┼─────────────┼───────────────────────────────────┤
│ 1    │ NXB KHCN-TT&TT                   │ 0%          │ Chưa cập nhật dữ liệu            │
│ 2    │ Viện Ứng dụng công nghệ         │ 0%          │ Chưa cập nhật dữ liệu            │
│ 3    │ Cục Sở hữu trí tuệ              │ 0%          │ Chưa cập nhật dữ liệu            │
│ 4    │ Trường CĐ TT&TT                  │ 26,1%       │ Cần đôn đốc nhập liệu          │
│ 5    │ Viện Năng lượng nguyên tử       │ 35,2%       │ Cần đôn đốc nhập liệu          │
│...   │ ...                              │ ...         │ ...                               │
└──────┴─────────────────────────────────┴─────────────┴───────────────────────────────────┘
```

### Criteria để vào Sheet 4
1. **Chưa cập nhật**: completion = 0%
2. **Nhập ít**: completion < 50%
3. **Đã lâu không cập nhật**: updated_at > 7 ngày
4. **Số hệ thống nhiều nhưng % thấp**: system_count >= 3 AND avg_completion < 60%

**Lưu ý đôn đốc**:
- Priority 1: 0% - Chưa cập nhật dữ liệu
- Priority 2: <30% - Cần đôn đốc khẩn cấp
- Priority 3: 30-50% - Cần đôn đốc nhập liệu

### Styling
- Header: Font 14 Bold, Bg: #1F4E78, Text: White
- Priority columns:
  - Priority 1 (Đỏ): 0% - Bg: #FFC7CE
  - Priority 2 (Cam): <30% - Bg: #FFEB9C
  - Priority 3 (Vàng): 30-50% - Bg: #FFF2CC
- Note column: Width 50, Wrap text

---

## Technical Implementation

### Frontend Changes
**File**: `frontend/src/pages/Dashboard.tsx`

1. Remove JSON & CSV export options
2. Add single "Xuất Excel" button
3. Install library: `xlsx` or `exceljs`

```typescript
// Install
npm install xlsx

// or
npm install exceljs
```

4. New export function:

```typescript
const exportToExcel = async () => {
  try {
    const selectedOrg = organizations.find(org => org.id.toString() === organizationFilter);

    // Fetch detailed data
    const [completionData, systemsData] = await Promise.all([
      api.get(`/systems/completion_stats/?${getParams()}`).then(r => r.data),
      api.get(`/systems/?${getSystemsParams()}`).then(r => r.data)
    ]);

    // Create workbook with 4 sheets
    const wb = XLSX.utils.book_new();

    // Sheet 1: Tổng quan
    const sheet1Data = generateSummarySheet(statistics, completionData);
    const ws1 = XLSX.utils.aoa_to_sheet(sheet1Data);
    applySheet1Style(ws1);
    XLSX.utils.book_append_sheet(wb, ws1, "1. Tong quan");

    // Sheet 2: Theo đơn vị
    const sheet2Data = generateOrgSheet(completionData.summary.organizations);
    const ws2 = XLSX.utils.aoa_to_sheet(sheet2Data);
    applySheet2Style(ws2);
    XLSX.utils.book_append_sheet(wb, ws2, "2. Theo don vi");

    // Sheet 3: Danh sách hệ thống
    const sheet3Data = generateSystemsSheet(systemsData.results);
    const ws3 = XLSX.utils.aoa_to_sheet(sheet3Data);
    applySheet3Style(ws3);
    XLSX.utils.book_append_sheet(wb, ws3, "3. Danh sach HT");

    // Sheet 4: Lưu ý đôn đốc
    const sheet4Data = generateFollowUpSheet(completionData.summary.organizations);
    const ws4 = XLSX.utils.aoa_to_sheet(sheet4Data);
    applySheet4Style(ws4);
    XLSX.utils.book_append_sheet(wb, ws4, "4. Luu y don doc");

    // Generate file
    const fileName = `Bao-cao-CDS-${dayjs().format('DD-MM-YYYY')}.xlsx`;
    XLSX.writeFile(wb, fileName);
  } catch (error) {
    message.error('Lỗi khi xuất Excel: ' + error.message);
  }
};
```

### Helper Functions

```typescript
// Sheet 1: Summary
function generateSummarySheet(stats: SystemStatistics, completionData: any): any[][] {
  return [
    // Title row
    ['BÁO CÁO TỔNG QUAN HỆ THỐNG CDS', '', '', `Ngày ${dayjs().format('DD/MM/YYYY')}`],
    [],
    // Header
    ['CHỈ TIÊU', 'GIÁ TRỊ', 'GHI CHÚ'],
    ['-----------------------------------------------------------------'],
    // Section 1: Theo trạng thái
    ['THEO TRẠNG THÁI', '', ''],
    ['1. Tổng số hệ thống', stats.total, ''],
    ['2. Số hệ thống đang hoạt động', stats.by_status.operating, `${getActiveRate()}%`],
    ['3. Số hệ thống thí điểm', stats.by_status.pilot, `${getPilotRate()}%`],
    ['4. Số hệ thống dừng', stats.by_status.stopped, ''],
    ['5. Số hệ thống sắp thay thế', stats.by_status.replacing, ''],
    [],
    // Section 2: Theo mức độ
    ['THEO MỨC ĐỘ QUAN TRỌNG', '', ''],
    ['6. Cực kỳ quan trọng', stats.by_criticality.high, `${getCriticalRate()}%`],
    ['7. Quan trọng', stats.by_criticality.high, ''],
    ['8. Trung bình', stats.by_criticality.medium, ''],
    ['9. Thấp', stats.by_criticality.low, ''],
    [],
    // Section 3: Theo trình độ nhập liệu
    ['THEO TRÌNH ĐỘ NHẬP LIỆU', '', ''],
    ['10. Tỷ lệ nhập liệu TB', `${stats.average_completion_percentage || 0}%`, ''],
    ['11. Số hệ thống hoàn thành 100%', completionData?.summary?.systems_100_percent || 0, ''],
    ['12. Số hệ thống dưới 50%', completionData?.summary?.systems_below_50_percent || 0, ''],
  ];
}

// Sheet 2: By Organization
function generateOrgSheet(orgs: OrganizationStats[]): any[][] {
  // Sort by avg_completion desc
  const sortedOrgs = [...orgs].sort((a, b) => b.avg_completion - a.avg_completion);

  const summary = calculateOrgSummary(sortedOrgs);

  return [
    // Multi-level header
    ['STT', 'ĐƠN VỊ', 'TRẠNG THÁI', 'TỶ LỆ NHẬP DỮ LIỆU TÍNH ĐẾN 17H30', '', 'TỶ LỆ NHẬP DỮ LIỆU TÍNH ĐẾN 8H30', '', 'SỐ LƯỢNG ĐƠN VỊ'],
    ['', '', '', 'Số hệ thống', '% hoàn thành', 'Số hệ thống', '% hoàn thành TB', ''],
    ['', '', '', '', '', '', '', ''],
    ...sortedOrgs.map((org, idx) => [
      idx + 1,
      org.name,
      'Hoạt động',
      org.system_count,
      org.avg_completion.toFixed(1).replace('.', ','),
      org.system_count,
      org.avg_completion.toFixed(1).replace('.', ','),
      ''
    ]),
    ['', '', '', '', '', '', '', ''],
    ['TỔNG HỢP:', '', '', '', '', '', '', ''],
    [`${orgs.length} Đơn vị`, '', '', '', '', '', '', ''],
    ['Đã cập nhật', summary.updated, '', '', '', '', '', ''],
    ['Trong đó:', '', '', '', '', '', '', ''],
    ['- Tỷ lệ >80%', summary.above80, '', '', '', '', '', ''],
    ['- Tỷ lệ 60-80%', summary.range60to80, '', '', '', '', '', ''],
    ['- Tỷ lệ <30%', summary.below30, '', '', '', '', '', ''],
    ['Chưa cập nhật', summary.notUpdated, '', '', '', '', '', ''],
  ];
}

// Sheet 3: Systems List
function generateSystemsSheet(systems: System[]): any[][] {
  // Sort by org name, then by completion desc
  const sorted = [...systems].sort((a, b) => {
    if (a.org_name !== b.org_name) return a.org_name.localeCompare(b.org_name);
    return (b.completion_percentage || 0) - (a.completion_percentage || 0);
  });

  return [
    ['STT', 'TÊN HỆ THỐNG', 'ĐƠN VỊ', 'TRẠNG THÁI', 'QUAN TRỌNG', '% HOÀN THÀNH', 'NGÀY CẬP NHẬT'],
    ...sorted.map((sys, idx) => [
      idx + 1,
      sys.system_name,
      sys.org_name || 'N/A',
      STATUS_LABELS[sys.status] || sys.status,
      CRITICALITY_LABELS[sys.criticality] || sys.criticality,
      `${sys.completion_percentage || 0}%`,
      dayjs(sys.updated_at).format('DD/MM/YYYY')
    ])
  ];
}

// Sheet 4: Lưu ý đôn đốc
function generateFollowUpSheet(orgs: OrganizationStats[]): any[][] {
  // Filter orgs needing follow-up
  const needFollowUp = orgs.filter(org => {
    const noData = org.avg_completion === 0;
    const lowData = org.avg_completion < 50;
    return noData || lowData;
  }).sort((a, b) => a.avg_completion - b.avg_completion);

  return [
    ['STT', 'ĐƠN VỊ', '% HOÀN THÀNH', 'LƯU Ý / GHI CHÚ'],
    ...needFollowUp.map((org, idx) => {
      let note = '';
      if (org.avg_completion === 0) note = 'Chưa cập nhật dữ liệu';
      else if (org.avg_completion < 30) note = 'Cần đôn đốc khẩn cấp';
      else note = 'Cần đôn đốc nhập liệu';

      return [
        idx + 1,
        org.name,
        `${org.avg_completion.toFixed(1).replace('.', ',')}%`,
        note
      ];
    })
  ];
}

function calculateOrgSummary(orgs: OrganizationStats[]) {
  const updated = orgs.filter(o => o.avg_completion > 0).length;
  const notUpdated = orgs.length - updated;

  const above80 = orgs.filter(o => o.avg_completion >= 80).length;
  const range60to80 = orgs.filter(o => o.avg_completion >= 60 && o.avg_completion < 80).length;
  const below30 = orgs.filter(o => o.avg_completion > 0 && o.avg_completion < 30).length;

  return { updated, notUpdated, above80, range60to80, below30 };
}
```

---

## UI Changes

### Button Update
```tsx
<Dropdown
  menu={{
    items: [
      {
        key: 'excel',
        label: 'Xuất Excel',
        icon: <FileExcelOutlined />,
        onClick: exportToExcel,
      },
    ],
  }}
>
  <Button icon={<DownloadOutlined />}>Xuất báo cáo</Button>
</Dropdown>
```

### Loading State
```tsx
<Button
  icon={<DownloadOutlined />}
  onClick={exportToExcel}
  loading={exporting}
>
  {exporting ? 'Đang xuất...' : 'Xuất báo cáo'}
</Button>
```

---

## Package Installation

```bash
cd frontend
npm install xlsx
# or
npm install exceljs
```

---

## Test Plan

1. **Test với dữ liệu thực**: Export từ production
2. **Verify format**: Check font, màu sắc, merge cells
3. **Verify data**: Compare với dashboard
4. **Edge cases**:
   - No data
   - Single organization
   - All systems 100%
   - All systems 0%

---

## Deployment

1. Update frontend code
2. Build & deploy
3. Test on staging
4. Deploy to production

---

## File References

- Frontend: `/frontend/src/pages/Dashboard.tsx`
- API: `/backend/apps/systems/views.py`
- Types: `/frontend/src/types/index.ts`
