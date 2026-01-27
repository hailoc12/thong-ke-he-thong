# Spec: Xuất Báo Cáo Excel - Dashboard Admin

## Overview
Tính năng xuất báo cáo Excel từ dashboard admin với 4 sheets, format chuyên nghiệp theo mẫu.

---

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
- Summary row: Bg: #FFC000, Font 14 Bold

---

## Sheet 2: THỐNG KÊ THEO ĐƠN VỊ

### Layout (Format đơn giản - 1 cột tỷ lệ)
```
┌────┬──────────────────────────────────┬──────────┬─────────────────────────────────────┬──────────────────┐
│ STT│ ĐƠN VỊ                           │TRẠNG THÁI│ TỶ LỆ NHẬP DỮ LIỆU TÍNH ĐẾN       │                  │
│    │                                  │          │ 26/01 15:30                        │                  │
│    │                                  │          │───────────────────┬─────────────────│                  │
│    │                                  │          │ Số hệ thống      │ % hoàn thành TB │                  │
├────┼──────────────────────────────────┼──────────┼───────────────────┼─────────────────┼──────────────────┤
│ 1  │ Trường CĐ Thông tin & TT         │ Hoạt động│ 2                 │ 26,10           │                  │
│ 2  │ NXB KHCN-TT&TT                   │ Hoạt động│ Chưa có dữ liệu  │ Chưa có DL      │                  │
│... │ ...                              │ ...      │ ...               │ ...             │                  │
├────┼──────────────────────────────────┼──────────┼───────────────────┼─────────────────┼──────────────────┤
│    │ Tổng hợp: 32 Đơn vị              │          │                   │                 │                  │
│    │ Đã cập nhật                      │          │                   │                 │                  │
│    │ Trong đó:                        │          │                   │                 │                  │
│    │   Tỷ lệ CNDL > 80%               │          │                   │         1       │                  │
│    │   Tỷ lệ CNDL từ 60% đến 80%      │          │                   │         9       │                  │
│    │   Tỷ lệ CNDL < 60%               │          │                   │         6       │                  │
│    │   Tỷ lệ CNDL <30%                │          │                   │         3       │                  │
│    │ Chưa cập nhật                    │          │                   │        11       │                  │
│    │                                  │          │                   │                 │                  │
│    │ Danh sách đơn vị chưa CNDL:       │          │                   │                 │                  │
│    │ - Nhà Xuất bản KHCN-TT&TT        │          │                   │                 │                  │
│    │ - Viện Ứng dụng công nghệ       │          │                   │                 │                  │
│    │ ...                              │          │                   │                 │                  │
└────┴──────────────────────────────────┴──────────┴───────────────────┴─────────────────┴──────────────────┘
```

### Header Structure (2 rows)
```
Row 1: │ A  │ B          │ C │             D               │        E         │
      │STT │ ĐƠN VỊ     │TRẠNG│ TỶ LỆ NHẬP DỮ LIỆU TÍNH │                  │
      │    │            │THÁI │ ĐẾN 26/01 15:30           │                  │
Row 2: │    │            │    │─────────────────┬─────────│                  │
      │    │            │    │ Số hệ thống     │%HTTB    │                  │
```

### Time Format
- **Format**: `dd/MM HH:mm` (ví dụ: `26/01 15:30`)
- **Timezone**: UTC+7 (Giờ Việt Nam)
- **Dynamic**: Lấy thời điểm thực khi export

### Styling
- Row 1 (Header chính): Font 14 Bold, Bg: #1F4E78, Text: White, Center
- Row 2 (Header phụ): Font 13 Bold, Bg: #D9E1F2, Center
- Data rows: Font 14, Border: All
- Row "Tổng hợp": Bg: #FFC000, Font 14 Bold
- Row "Danh sách...": Bg: #1F4E78, Font 14 Bold, Text: White

### Summary Section
Sau danh sách đơn vị, thêm phần thống kê:
```
Tổng hợp: {N} Đơn vị
Đã cập nhật
Trong đó:
  Tỷ lệ cập nhật dữ liệu > 80%           {count}
  Tỷ lệ cập nhật dữ liệu từ 60% đến 80%  {count}
  Tỷ lệ cập nhật dữ liệu < 60%           {count}
  Tỷ lệ cập nhật dữ liệu <30%            {count}
Chưa cập nhật                           {count}

Danh sách đơn vị chưa cập nhật dữ liệu:
- [Tên đơn vị 1]
- [Tên đơn vị 2]
- ...
```

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

## Sheet 4: LƯU Ý ĐÔN ĐỐC

### Layout
```
┌──────┬─────────────────────────────────┬─────────────┬───────────────────────────────────┐
│ STT  │ ĐƠN VỊ                          │ % HOÀN THÀNH│ LƯU Ý / GHI CHÚ                   │
├──────┼─────────────────────────────────┼─────────────┼───────────────────────────────────┤
│ 1    │ NXB KHCN-TT&TT                   │ 0%          │ Chưa cập nhật dữ liệu            │
│ 2    │ Viện Ứng dụng công nghệ         │ 0%          │ Chưa cập nhật dữ liệu            │
│ 3    │ Cục Sở hữu trí tuệ              │ 0%          │ Chưa cập nhật dữ liệu            │
│ 4    │ Trường CĐ TT&TT                  │ 26,1%       │ Cần đôn đốc nhập liệu            │
│ 5    │ Viện Năng lượng nguyên tử       │ 35,2%       │ Cần đôn đốc nhập liệu            │
│...   │ ...                              │ ...         │ ...                               │
└──────┴─────────────────────────────────┴─────────────┴───────────────────────────────────┘
```

### Criteria để vào Sheet 4
1. **Chưa cập nhật**: completion = 0%
2. **Nhập ít**: completion < 50%
3. **Đã lâu không cập nhật**: updated_at > 7 ngày
4. **Số hệ thống nhiều nhưng % thấp**: system_count >= 3 AND avg_completion < 60%

### Lưu ý đôn đốc
- Priority 1 (Đỏ): 0% - "Chưa cập nhật dữ liệu"
- Priority 2 (Cam): <30% - "Cần đôn đốc khẩn cấp"
- Priority 3 (Vàng): 30-50% - "Cần đôn đốc nhập liệu"

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

```bash
npm install xlsx
# or
npm install exceljs
```

### Data Fetching

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
    XLSX.utils.book_append_sheet(wb, ws1, "1. Tong quan");

    // Sheet 2: Theo đơn vị
    const sheet2Data = generateOrgSheet(completionData.summary.organizations);
    const ws2 = XLSX.utils.aoa_to_sheet(sheet2Data);
    XLSX.utils.book_append_sheet(wb, ws2, "2. Theo don vi");

    // Sheet 3: Danh sách hệ thống
    const sheet3Data = generateSystemsSheet(systemsData.results);
    const ws3 = XLSX.utils.aoa_to_sheet(sheet3Data);
    XLSX.utils.book_append_sheet(wb, ws3, "3. Danh sach HT");

    // Sheet 4: Lưu ý đôn đốc
    const sheet4Data = generateFollowUpSheet(completionData.summary.organizations);
    const ws4 = XLSX.utils.aoa_to_sheet(sheet4Data);
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
// Sheet 2: By Organization (UPDATED - Single column format)
function generateOrgSheet(orgs: OrganizationStats[]): any[][] {
  // Vietnam time (UTC+7)
  const vnTime = dayjs().utcOffset(7).format('DD/MM HH:mm');

  // Sort by avg_completion desc
  const sortedOrgs = [...orgs].sort((a, b) => b.avg_completion - a.avg_completion);

  // Calculate summary
  const summary = calculateOrgSummary(sortedOrgs);

  return [
    // Header row 1
    ['STT', 'ĐƠN VỊ', 'TRẠNG THÁI', `TỶ LỆ NHẬP DỮ LIỆU TÍNH ĐẾN ${vnTime}`, ''],
    // Header row 2
    ['', '', '', 'Số hệ thống', '% hoàn thành trung bình'],
    [''],
    ...sortedOrgs.map((org, idx) => [
      idx + 1,
      org.name,
      'Hoạt động',
      org.system_count || 'Chưa có dữ liệu',
      org.avg_completion > 0
        ? org.avg_completion.toFixed(2).replace('.', ',')
        : 'Chưa có dữ liệu'
    ]),
    [''],
    // Summary section
    [`Tổng hợp: ${orgs.length} Đơn vị`, '', '', '', ''],
    ['Đã cập nhật', '', '', '', ''],
    ['Trong đó:', '', '', '', ''],
    ['  Tỷ lệ cập nhật dữ liệu > 80%', '', '', '', summary.above80],
    ['  Tỷ lệ cập nhật dữ liệu từ 60% đến 80%', '', '', '', summary.range60to80],
    ['  Tỷ lệ cập nhật dữ liệu < 60%', '', '', '', summary.below60],
    ['  Tỷ lệ cập nhật dữ liệu <30%', '', '', '', summary.below30],
    ['Chưa cập nhật', '', '', '', summary.notUpdated],
    [''],
    ['Danh sách đơn vị chưa cập nhật dữ liệu:', '', '', '', ''],
    ...orgs.filter(o => o.avg_completion === 0).map(o => [`- ${o.name}`, '', '', '', ''])
  ];
}

function calculateOrgSummary(orgs: OrganizationStats[]) {
  const updated = orgs.filter(o => o.avg_completion > 0).length;
  const notUpdated = orgs.length - updated;

  const above80 = orgs.filter(o => o.avg_completion >= 80).length;
  const range60to80 = orgs.filter(o => o.avg_completion >= 60 && o.avg_completion < 80).length;
  const below60 = orgs.filter(o => o.avg_completion > 0 && o.avg_completion < 60).length;
  const below30 = orgs.filter(o => o.avg_completion > 0 && o.avg_completion < 30).length;

  return { updated, notUpdated, above80, range60to80, below60, below30 };
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
```

### UI Changes

```tsx
// Replace dropdown with single button
<Button
  icon={<FileExcelOutlined />}
  onClick={exportToExcel}
  loading={exporting}
>
  {exporting ? 'Đang xuất...' : 'Xuất Excel'}
</Button>
```

---

## File References

- Frontend: `/frontend/src/pages/Dashboard.tsx`
- API: `/backend/apps/systems/views.py`
- Types: `/frontend/src/types/index.ts`
- Spec: `/13-quality-solution/excel-export-spec-v3.md`
- Sample Generator: `/14-automated-solution/generate_excel_sample.py`
- Sample Output: `Bao-cao-CDS-mau-*.xlsx`
