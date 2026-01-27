# SPEC: Export System Data to Excel

## 1. Tổng quan

### Mục tiêu
Cho phép admin export toàn bộ dữ liệu Hệ thống ra file Excel với định dạng đẹp, dễ đọc cho con người.

### Scope
- Export từ trang danh sách Hệ thống (Systems.tsx)
- Export tất cả systems (có pagination) hoặc filtered systems
- File Excel có nhiều sheet, organized by category
- Format đẹp với headers, colors, borders

---

## 2. User Flow

```
Admin vào trang "Danh sách Hệ thống"
    ↓
Click nút "Xuất Excel" (icon + text)
    ↓
Hiển thị modal cho phép chọn:
  □ Xuất tất cả hệ thống (XXX hệ thống)
  ○ Chỉ xuất kết quả tìm kiếm (YYY hệ thống)
    ↓
Click "Xuất file"
    ↓
Loading indicator hiện ra
    ↓
API call để lấy full data
    ↓
Generate Excel client-side
    ↓
Auto-download file: "Danh-sach-He-thong-YYYY-MM-DD.xlsx"
```

---

## 3. Excel Structure

### Sheet 1: "Thông tin chung" (General Info)
Core system fields - 1 row per system

| Column | Field | Width |
|--------|-------|-------|
| A | STT | 5 |
| B | Mã hệ thống | 20 |
| C | Tên hệ thống | 40 |
| D | Tên tiếng Anh | 40 |
| E | Đơn vị | 30 |
| F | Nhóm hệ thống | 20 |
| G | Trạng thái | 15 |
| H | Mức độ quan trọng | 15 |
| I | Mức bảo mật | 10 |
| J | Phạm vi | 15 |
| K | Loại yêu cầu | 20 |
| L | Mục đích | 50 |
| M | Ngày vận hành | 15 |
| N | Phiên bản | 10 |
| O | Hoàn thành (%) | 12 |

### Sheet 2: "Nghiệp vụ" (Business Context)
Business-related fields

| Column | Field | Width |
|--------|-------|-------|
| A | STT | 5 |
| B | Mã hệ thống | 20 |
| C | Tên hệ thống | 30 |
| D | Mục tiêu kinh doanh | 50 |
| E | Quy trình nghiệp vụ | 50 |
| F | Loại người dùng | 30 |
| G | Số người dùng/năm | 15 |
| H | Tổng số tài khoản | 15 |
| I | MAU | 12 |
| J | DAU | 12 |
| K | Số đơn vị sử dụng | 15 |

### Sheet 3: "Kiến trúc" (Architecture)
Technical architecture fields

| Column | Field | Width |
|--------|-------|-------|
| A | STT | 5 |
| B | Mã hệ thống | 20 |
| C | Tên hệ thống | 30 |
| D | Kiểu kiến trúc | 20 |
| E | Backend Tech | 25 |
| F | Frontend Tech | 25 |
| G | Mobile App | 15 |
| H | Ngôn ngữ lập trình | 25 |
| I | Framework | 25 |
| J | Database | 25 |
| K | Database Model | 20 |
| L | Hosting | 15 |
| M | Container | 15 |
| N | API Style | 15 |
| O | Message Queue | 20 |
| P | Cache | 15 |
| Q | Search Engine | 20 |
| R | BI/Reporting Tool | 20 |
| S | Source Repository | 20 |
| T | CI/CD Tool | 20 |

### Sheet 4: "Dữ liệu" (Data Info)
Data-related fields

| Column | Field | Width |
|--------|-------|-------|
| A | STT | 5 |
| B | Mã hệ thống | 20 |
| C | Tên hệ thống | 30 |
| D | Nguồn dữ liệu | 40 |
| E | Phân loại dữ liệu | 30 |
| F | Khối lượng dữ liệu | 20 |
| G | Storage (GB) | 15 |
| H | File Storage (GB) | 15 |
| I | Tăng trưởng (%/năm) | 15 |
| J | Loại dữ liệu | 30 |
| K | Secondary DBs | 30 |
| L | Số bản ghi | 15 |
| M | Có Data Catalog | 12 |
| N | Có MDM | 12 |

### Sheet 5: "Tích hợp" (Integration)
Integration fields

| Column | Field | Width |
|--------|-------|-------|
| A | STT | 5 |
| B | Mã hệ thống | 20 |
| C | Tên hệ thống | 30 |
| D | HT nội bộ tích hợp | 40 |
| E | HT bên ngoài tích hợp | 40 |
| F | Phương thức trao đổi | 25 |
| G | Số API cung cấp | 12 |
| H | Số API sử dụng | 12 |
| I | Có tích hợp | 10 |
| J | Số kết nối | 12 |
| K | Loại tích hợp | 30 |
| L | API Standard | 15 |
| M | API Gateway | 15 |
| N | Rate Limiting | 12 |

### Sheet 6: "Vận hành" (Operations)
Operations fields

| Column | Field | Width |
|--------|-------|-------|
| A | STT | 5 |
| B | Mã hệ thống | 20 |
| C | Tên hệ thống | 30 |
| D | Chủ sở hữu nghiệp vụ | 25 |
| E | Chủ sở hữu kỹ thuật | 25 |
| F | Người phụ trách | 25 |
| G | SĐT phụ trách | 15 |
| H | Email phụ trách | 30 |
| I | Loại phát triển | 15 |
| J | Đơn vị phát triển | 25 |
| K | Quy mô team dev | 12 |
| L | Đơn vị vận hành | 25 |
| M | Quy mô team ops | 12 |
| N | Tình trạng bảo hành | 15 |
| O | Hết bảo hành | 15 |
| P | Hết bảo trì | 15 |

### Sheet 7: "Bảo mật" (Security)
Security fields

| Column | Field | Width |
|--------|-------|-------|
| A | STT | 5 |
| B | Mã hệ thống | 20 |
| C | Tên hệ thống | 30 |
| D | Phương thức xác thực | 25 |
| E | Có MFA | 10 |
| F | Có RBAC | 10 |
| G | Có mã hóa | 12 |
| H | Có Audit Log | 12 |
| I | Có Firewall | 12 |
| J | Có WAF | 10 |
| K | Có IDS/IPS | 12 |
| L | Tiêu chuẩn tuân thủ | 30 |
| M | Có tài liệu bảo mật | 12 |
| N | Ngày audit cuối | 15 |
| O | Ghi chú bảo mật | 40 |

### Sheet 8: "Chi phí" (Cost - Level 2 only)
Cost fields

| Column | Field | Width |
|--------|-------|-------|
| A | STT | 5 |
| B | Mã hệ thống | 20 |
| C | Tên hệ thống | 30 |
| D | Đầu tư ban đầu | 18 |
| E | Chi phí phát triển | 18 |
| F | License/năm | 18 |
| G | Bảo trì/năm | 18 |
| H | Hạ tầng/năm | 18 |
| I | Nhân sự/năm | 18 |
| J | TCO | 18 |
| K | Nguồn tài trợ | 25 |

### Sheet 9: "Nhà cung cấp" (Vendor - Level 2 only)
Vendor fields

| Column | Field | Width |
|--------|-------|-------|
| A | STT | 5 |
| B | Mã hệ thống | 20 |
| C | Tên hệ thống | 30 |
| D | Tên NCC | 30 |
| E | Loại NCC | 20 |
| F | Người liên hệ | 25 |
| G | SĐT | 15 |
| H | Email | 30 |
| I | Số hợp đồng | 20 |
| J | Bắt đầu HĐ | 15 |
| K | Kết thúc HĐ | 15 |
| L | Đánh giá NCC | 12 |
| M | Rủi ro vendor lock-in | 15 |

---

## 4. Excel Styling

### Header Row
- Background: `#1890ff` (Ant Design primary blue)
- Font: Bold, White, Size 12
- Alignment: Center
- Border: Thin black

### Data Rows
- Font: Size 11
- Alignment: Left (text), Center (numbers, dates)
- Border: Thin gray
- Alternating row colors: White / `#f5f5f5`

### Special Formatting
- Status column: Color coded
  - Đang vận hành: Green background
  - Dừng hoạt động: Red background
  - Thay thế: Orange background
- Criticality column: Color coded
  - Cao: Red text
  - Trung bình: Orange text
  - Thấp: Green text
- Percentage: Right align with % symbol
- Currency: Right align with thousand separators
- Boolean: "Có" / "Không"
- Arrays: Comma-separated values
- Dates: DD/MM/YYYY format

### Column Auto-fit
- Auto-width based on content
- Maximum width: 60 characters
- Wrap text for long content

---

## 5. Technical Implementation

### Frontend Changes

#### 1. New Export Button in Systems.tsx
```tsx
<Button
  icon={<DownloadOutlined />}
  onClick={() => setExportModalVisible(true)}
>
  Xuất Excel
</Button>
```

#### 2. Export Modal Component
```tsx
<Modal
  title="Xuất dữ liệu Hệ thống"
  visible={exportModalVisible}
  onOk={handleExport}
  onCancel={() => setExportModalVisible(false)}
>
  <Radio.Group value={exportOption} onChange={e => setExportOption(e.target.value)}>
    <Radio value="all">Xuất tất cả ({totalSystems} hệ thống)</Radio>
    <Radio value="filtered">Chỉ xuất kết quả tìm kiếm ({filteredCount} hệ thống)</Radio>
  </Radio.Group>
</Modal>
```

#### 3. New Export Function: exportSystemsToExcel.ts
```typescript
// New utility file for system export
export const exportSystemsToExcel = async (systems: SystemDetail[]) => {
  // Generate multi-sheet workbook
  // Apply styling
  // Trigger download
}
```

### Backend Changes

#### 1. New Export API Endpoint
```python
# In SystemViewSet
@action(detail=False, methods=['get'])
def export_data(self, request):
    """Return all systems with full details for export"""
    queryset = self.get_queryset()
    # Apply any filters from request params
    serializer = SystemDetailSerializer(queryset, many=True)
    return Response(serializer.data)
```

### Dependencies
- `xlsx` (SheetJS) - Already installed
- No new dependencies needed

---

## 6. File Naming Convention

```
Danh-sach-He-thong-{YYYY-MM-DD}.xlsx
```

Example: `Danh-sach-He-thong-2026-01-27.xlsx`

---

## 7. Performance Considerations

- **Large datasets**: Use streaming for >1000 systems
- **Memory**: Generate workbook in chunks
- **Loading state**: Show progress indicator
- **Timeout**: Set reasonable API timeout (60s)

---

## 8. Testing Checklist

- [ ] Export all systems works
- [ ] Export filtered systems works
- [ ] All 9 sheets generated correctly
- [ ] Styling applied consistently
- [ ] Vietnamese characters display correctly
- [ ] Numbers formatted properly
- [ ] Dates in correct format
- [ ] File downloads with correct name
- [ ] Empty data handled gracefully
- [ ] Large dataset performance acceptable

---

## 9. Estimated Effort

| Task | Effort |
|------|--------|
| Export utility function | Medium |
| Excel styling | Medium |
| Export modal component | Low |
| Backend export endpoint | Low |
| Integration & testing | Medium |
| **Total** | ~4-6 hours |
