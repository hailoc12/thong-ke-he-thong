# HƯỚNG DẪN: Cleanup và Tạo Lại Dữ Liệu Đúng

## Vấn đề hiện tại

1. ❌ **Chỉ có 20 users thay vì 34 users**
2. ❌ **Email được tự động generate** (`username@thongke.vn`) thay vì để trống
3. ❌ **Tên đơn vị có thể có lỗi chính tả**

## Giải pháp

Script đã được tạo để:
- ✅ **Xóa toàn bộ dữ liệu cũ** (systems, users không phải admin, organizations)
- ✅ **Tạo đúng 34 organizations** với tên chính xác từ Excel
- ✅ **Tạo đúng 34 users** với email TRỐNG (không auto-generate)
- ✅ **Org code = username.upper()** (VD: vu-buuchinh → VU-BUUCHINH)

## Cách chạy

### Bước 1: Mở Terminal và cd vào thư mục project

```bash
cd "/Users/shimazu/Dropbox/9. active/consultant/support_b4t/thong_ke_he_thong"
```

### Bước 2: Chạy script cleanup và tạo lại dữ liệu

```bash
cat 08-backlog-plan/complete-cleanup-and-fresh-data.py | docker compose exec -T backend python manage.py shell
```

## Kết quả mong đợi

Script sẽ in ra:

```
================================================================================
COMPLETE CLEANUP
================================================================================
✓ Deleted from system_architecture
✓ Deleted from system_assessment
... (các bảng khác)
✓ Deleted all systems
✓ Deleted [X] non-admin users
✓ Deleted [X] organizations

================================================================================
CREATING FRESH DATA - 34 ORGANIZATIONS AND 34 USERS
================================================================================
 1. ✓ Created org: VU-BUUCHINH          - Vụ Bưu chính
 2. ✓ Created org: VU-DGTD              - Vụ Đánh giá và Thẩm định công nghệ
 3. ✓ Created org: VU-KHKT              - Vụ Khoa học kỹ thuật và công nghệ
... (31 dòng nữa)
34. ✓ Created org: CD-TTTT              - Trường Cao đẳng Thông tin và Truyền thông

Total organizations created: 34

================================================================================
CREATING 34 USERS (with empty emails)
================================================================================
 1. ✓ Created user: vu-buuchinh          for VU-BUUCHINH
 2. ✓ Created user: vu-dgtd              for VU-DGTD
... (32 dòng nữa)
34. ✓ Created user: cd-tttt              for CD-TTTT

================================================================================
SUMMARY
================================================================================
Organizations created: 34
Users created: 34
Admin user preserved: 1

✅ Complete cleanup and fresh data creation successful!
✅ All 34 organizations and 34 users created with correct data
✅ Email fields are empty (not auto-generated)
✅ Organization codes match usernames (uppercase)
```

## Kiểm tra sau khi chạy

### Kiểm tra số lượng users:

```bash
docker compose exec postgres psql -U postgres -d thongke -c "SELECT COUNT(*) as total_users FROM users WHERE is_superuser = false;"
```

Kết quả phải là: **34 users**

### Kiểm tra email trống:

```bash
docker compose exec postgres psql -U postgres -d thongke -c "SELECT username, email FROM users WHERE is_superuser = false LIMIT 10;"
```

Tất cả email phải là **rỗng** (không phải `username@thongke.vn`)

### Kiểm tra org codes:

```bash
docker compose exec postgres psql -U postgres -d thongke -c "SELECT code, name FROM organizations ORDER BY code LIMIT 10;"
```

Org codes phải là **uppercase của username** (VD: VU-BUUCHINH, CDS, CNTT)

### Kiểm tra tên đơn vị:

```bash
docker compose exec postgres psql -U postgres -d thongke -c "SELECT code, name FROM organizations ORDER BY code;"
```

Tên đơn vị phải **chính xác** như trong file Excel

## Danh sách 34 đơn vị

1. Vụ Bưu chính
2. Vụ Đánh giá và Thẩm định công nghệ
3. Vụ Khoa học kỹ thuật và công nghệ
4. Vụ Khoa học Xã hội, Nhân văn và Tự nhiên
5. Vụ Kinh tế và Xã hội số
6. Văn phòng Bộ
7. Cục An toàn bức xạ và hạt nhân
8. Cục Bưu điện điện Trung ương
9. Cục Công nghiệp Công nghệ thông tin
10. Cục Chuyển đổi số quốc gia
11. Cục Đổi mới sáng tạo
12. Cục Khởi nghiệp và Doanh nghiệp công nghệ
13. Cục Sở hữu trí tuệ
14. Cục Tần số vô tuyến điện
15. Cục Thông tin, Thống kê
16. Cục Viễn thông
17. Uỷ ban Tiêu chuẩn Đo lường Chất lượng quốc gia
18. Trung tâm Công nghệ thông tin
19. Học viện Công nghệ Bưu chính Viễn thông
20. Học viện Chiến lược Khoa học và Công nghệ
21. Báo VNExpress
22. Quỹ Phát triển khoa học và công nghệ quốc gia
23. Quỹ Đổi mới công nghệ quốc gia
24. Quỹ Dịch vụ viễn thông công ích Việt Nam
25. Viện Công nghệ số và Chuyển đổi số quốc gia
26. Viện Năng lượng nguyên tử Việt Nam
27. Viện Khoa học và Công nghệ Việt Nam - Hàn Quốc
28. Viện Sở hữu trí tuệ quốc gia
29. Viện Ứng dụng công nghệ
30. Trung tâm Chứng thực điện tử quốc gia
31. Trung tâm Internet Việt Nam
32. Trung tâm Truyền thông khoa học và công nghệ
33. Nhà Xuất bản Khoa học - Công nghệ - Truyền thông
34. Trường Cao đẳng Thông tin và Truyền thông

## Files liên quan

- **Script chính**: `08-backlog-plan/complete-cleanup-and-fresh-data.py`
- **Dữ liệu gốc**: `03-research/danh-sach-tai-khoan-don-vi.xlsx`
- **Hướng dẫn này**: `08-backlog-plan/HUONG-DAN-CLEANUP-VA-TAO-LAI-DU-LIEU.md`
