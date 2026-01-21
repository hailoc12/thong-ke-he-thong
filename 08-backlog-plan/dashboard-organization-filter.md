# Dashboard: Filter theo Đơn vị

## 📋 Yêu cầu

**Từ khách hàng**:
> "Chị nhìn thấy Dashboard trong từng đơn vị thì có, nhưng ở màn hình tổng của admin nếu muốn xem của một đơn vị riêng lẻ thì xem ntn?"

**Giải pháp**: Thêm filter dropdown để Admin có thể lọc statistics theo từng đơn vị cụ thể.

## ✅ Đã hoàn thành

### Backend
- ✅ API `/api/systems/statistics/` đã support filter theo `org` parameter
- ✅ Queryset filtering logic: Admin thấy tất cả, có thể filter by org
- ✅ Không cần thay đổi backend code

### Frontend
- ✅ Thêm state `organizationFilter` vào Dashboard
- ✅ Fetch danh sách organizations từ API `/api/organizations/`
- ✅ Thêm dropdown "Lọc theo đơn vị" với search functionality
- ✅ Update `fetchStatistics()` để include `org` param khi filter != 'all'
- ✅ Auto refetch statistics khi organization filter thay đổi
- ✅ Update "Clear Filters" button để reset organization filter
- ✅ Update export functions (JSON/CSV) để include organization filter info

### File đã sửa
- `frontend/src/pages/Dashboard.tsx`
  - Line 47: Added `organizations` state
  - Line 53: Added `organizationFilter` state
  - Line 74-81: Added `fetchOrganizations()` function
  - Line 83-98: Updated `fetchStatistics()` to include org param
  - Line 69-72: Added useEffect to refetch when org filter changes
  - Line 201-203: Added `handleOrganizationFilterChange()` handler
  - Line 209: Updated `handleClearFilters()` to reset org filter
  - Line 552-569: Added organization filter dropdown with search
  - Line 574: Updated Clear button disabled condition
  - Line 106: Updated export to include org filter

## 📊 UI Components

### Filter Bar
```
[Bộ lọc:] [Date Range] [Status] [Criticality] [Organization ▼] [Clear Filters]
```

### Organization Dropdown Features
- **Placeholder**: "Đơn vị"
- **Width**: 220px (desktop), 100% (mobile)
- **Search**: Có (showSearch + filterOption)
- **Options**:
  - "Tất cả đơn vị" (value: 'all')
  - Danh sách 34 đơn vị (từ API)

## 🔄 Workflow

1. **Admin mở Dashboard** → Thấy statistics tổng (all organizations)
2. **Admin click dropdown "Đơn vị"** → List 34 đơn vị hiện ra
3. **Admin search/select đơn vị** → Statistics tự động refetch với filter
4. **Dashboard update** → Hiển thị statistics chỉ của đơn vị đó
5. **Admin click "Xóa bộ lọc"** → Quay lại xem tổng

## 🧪 Testing Checklist

- [ ] Dropdown hiển thị đầy đủ 34 đơn vị
- [ ] Search trong dropdown hoạt động (autocomplete)
- [ ] Chọn đơn vị → statistics update đúng
- [ ] KPI cards (Tổng, Đang hoạt động, Quan trọng, Đơn vị) update đúng
- [ ] Charts (Status, Criticality) update đúng với data của đơn vị
- [ ] Trend chart update theo đơn vị
- [ ] Recent Activities update theo đơn vị (nếu có)
- [ ] Click "Xóa bộ lọc" → Quay lại hiển thị tất cả
- [ ] Export JSON/CSV include org filter info
- [ ] Mobile responsive: dropdown full width
- [ ] Loading state khi fetch organizations
- [ ] Error handling nếu API fail

## 🚀 Deploy

**Status**: ⏳ **Chưa deploy** (code đã hoàn thành nhưng chưa build + deploy)

**Next steps**:
```bash
# Build frontend
cd frontend && npm run build

# Deploy
# (Waiting for deployment command)
```

## 📝 Notes

- Backend không cần thay đổi, đã support org filtering sẵn
- Organizations list được fetch 1 lần khi mount Dashboard
- Statistics refetch tự động khi org filter thay đổi (via useEffect)
- Dropdown có search nên dễ tìm trong 34 đơn vị
- Export reports sẽ ghi rõ đang filter theo đơn vị nào

## 🔗 Related

- [x] Create 34 organizations (đã tạo)
- [x] Create 34 unit users (đã tạo)
- [ ] Deploy frontend changes
- [ ] Test với data thật sau khi deploy
