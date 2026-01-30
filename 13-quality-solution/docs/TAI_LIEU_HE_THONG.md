# HỆ THỐNG BÁO CÁO THỐNG KÊ HỆ THỐNG CNTT

**Phiên bản**: 1.0.0
**Ngày phát hành**: 16/01/2026
**Đơn vị phát triển**: Đội ngũ CNTT - Bộ

---

## MỤC LỤC

1. [Giới thiệu hệ thống](#1-giới-thiệu-hệ-thống)
2. [Hướng dẫn dành cho Quản trị viên](#2-hướng-dẫn-dành-cho-quản-trị-viên)
3. [Hướng dẫn dành cho Đơn vị](#3-hướng-dẫn-dành-cho-đơn-vị)
4. [Câu hỏi thường gặp](#4-câu-hỏi-thường-gặp)

---

# 1. GIỚI THIỆU HỆ THỐNG

## 1.1. Tổng quan

Hệ thống Báo cáo Thống kê Hệ thống CNTT là nền tảng số được xây dựng nhằm thu thập, quản lý và phân tích thông tin về toàn bộ hệ thống công nghệ thông tin của các đơn vị trực thuộc Bộ. Hệ thống hỗ trợ công tác khảo sát, đánh giá hiện trạng CNTT và xây dựng chiến lược chuyển đổi số toàn Bộ.

## 1.2. Mục tiêu

### Mục tiêu chính:
- **Vẽ bản đồ tổng thể hệ thống CNTT**: Nắm bắt đầy đủ các hệ thống, ứng dụng hiện có của từng đơn vị
- **Phát hiện silo công nghệ và dữ liệu**: Xác định các hệ thống hoạt động độc lập, không liên thông
- **Đánh giá phụ thuộc nhà thầu**: Theo dõi các hợp đồng, đối tác công nghệ, rủi ro vendor lock-in
- **Hỗ trợ thiết kế tổng thể**: Cung cấp dữ liệu đầu vào cho việc lập kế hoạch chuyển đổi số

### Nguyên tắc quan trọng:
> **"Thông tin thu thập phục vụ mục đích thiết kế tổng thể chuyển đổi số, KHÔNG sử dụng để đánh giá, xếp loại đơn vị."**

Điều này đảm bảo các đơn vị cung cấp thông tin trung thực, đầy đủ mà không lo ngại bị đánh giá tiêu cực.

## 1.3. Đối tượng sử dụng

### Vai trò Quản trị viên (Admin)
- **Người dùng**: Tổng Công trình sư, Ban CNTT cấp Bộ
- **Quyền hạn**:
  - Quản lý danh sách đơn vị
  - Quản lý tài khoản người dùng
  - Xem báo cáo tổng hợp từ tất cả đơn vị
  - Phê duyệt dữ liệu
  - Xuất báo cáo tổng thể
- **Trách nhiệm**: Giám sát quá trình thu thập dữ liệu, đảm bảo chất lượng thông tin

### Vai trò Đơn vị (Organization Admin)
- **Người dùng**: Trưởng/Phó phòng CNTT các đơn vị trực thuộc
- **Quyền hạn**:
  - Quản lý thông tin đơn vị mình
  - Thêm mới, chỉnh sửa, xóa hệ thống của đơn vị
  - Nhập dữ liệu theo biểu mẫu Level 1 và Level 2
  - Tải lên tài liệu đính kèm
  - Xem báo cáo của đơn vị mình
- **Trách nhiệm**: Nhập liệu chính xác, đầy đủ về các hệ thống CNTT của đơn vị

### Vai trò Nhân viên kỹ thuật (Technical Staff)
- **Người dùng**: Cán bộ CNTT, kỹ thuật viên
- **Quyền hạn**:
  - Nhập liệu chi tiết kỹ thuật
  - Cập nhật thông tin hệ thống
  - Xem dữ liệu của đơn vị
- **Trách nhiệm**: Cung cấp thông tin kỹ thuật chi tiết, chính xác

## 1.4. Tính năng chính

### Quản lý Đơn vị
- Thêm/sửa/xóa thông tin đơn vị
- Quản lý người dùng theo đơn vị
- Theo dõi trạng thái nhập liệu

### Quản lý Hệ thống
- Khai báo hệ thống/ứng dụng mới
- Nhập thông tin theo 2 cấp độ:
  - **Level 1**: Báo cáo chuẩn (6 phần) - nhanh gọn, tổng quan
  - **Level 2**: Phiếu chi tiết (11 phần) - đầy đủ, sâu sát
- Upload tài liệu đính kèm (kiến trúc, ERD, hợp đồng...)

### Thu thập dữ liệu đa chiều

#### Level 1 - Báo cáo chuẩn (6 phần):
1. **Tổng quan hệ thống**: Tên, mục đích, phạm vi, đối tượng sử dụng
2. **Kiến trúc & Công nghệ**: Backend, Frontend, Database, Mobile
3. **Dữ liệu**: Loại dữ liệu, tính nhạy cảm, tần suất cập nhật
4. **Vận hành**: Môi trường, hosting, backup, monitoring
5. **Tích hợp**: Kết nối với hệ thống khác, API, SSO
6. **Đánh giá chung**: Điểm mạnh, điểm yếu, kế hoạch nâng cấp

#### Level 2 - Phiếu chi tiết (11 phần):
Bao gồm toàn bộ Level 1 + các phần mở rộng:
7. **Chi phí**: Đầu tư ban đầu, vận hành hàng năm
8. **Nhà thầu**: Danh sách vendor, hợp đồng, SLA
9. **Bảo mật**: Tuân thủ, audit, penetration test
10. **Hiệu suất**: Performance metrics, bottleneck
11. **Roadmap**: Kế hoạch phát triển 1-3 năm

### Báo cáo & Phân tích
- Dashboard tổng quan toàn Bộ
- Thống kê theo đơn vị, công nghệ, nhà thầu
- Biểu đồ phân bố kiến trúc, ngôn ngữ lập trình
- Xuất báo cáo Word/Excel

### Quản lý tài liệu
- Upload file đính kèm (PDF, Word, Excel, PNG, JPG)
- Lưu trữ sơ đồ kiến trúc, ERD, API docs
- Quản lý phiên bản tài liệu

## 1.5. Kiến trúc hệ thống

### Kiến trúc tổng thể
Hệ thống được xây dựng theo mô hình 3-tier hiện đại:

```
┌─────────────────────────────────────────┐
│  FRONTEND (Client Tier)                 │
│  React + TypeScript + Ant Design        │
│  - Giao diện responsive                 │
│  - Form builder động                    │
│  - Dashboard & Analytics                │
└─────────────────────────────────────────┘
              ↓ HTTPS/REST API
┌─────────────────────────────────────────┐
│  BACKEND (Application Tier)             │
│  Django + Django REST Framework         │
│  - JWT Authentication                   │
│  - Role-based Access Control            │
│  - API RESTful                          │
│  - File processing service              │
└─────────────────────────────────────────┘
              ↓ ORM
┌─────────────────────────────────────────┐
│  DATABASE (Data Tier)                   │
│  PostgreSQL 14+                         │
│  - Organizations                        │
│  - Systems & detailed data              │
│  - Users & permissions                  │
│  - Audit logs                           │
└─────────────────────────────────────────┘
```

### Công nghệ sử dụng

**Frontend:**
- React 18 + TypeScript
- Ant Design (UI component library)
- Vite (build tool)
- Axios (HTTP client)

**Backend:**
- Django 4.2
- Django REST Framework
- Simple JWT (authentication)
- PostgreSQL (database)

**Deployment:**
- Docker + Docker Compose
- Nginx (web server & reverse proxy)
- SSL/TLS (Let's Encrypt)

### Bảo mật
- Xác thực: JWT (JSON Web Token)
- Phân quyền: Role-based Access Control (RBAC)
- Mã hóa: HTTPS cho tất cả kết nối
- Audit log: Ghi lại mọi thao tác quan trọng

## 1.6. Truy cập hệ thống

- **URL chính**: https://thongkehethong.mindmaid.ai
- **API Documentation**: https://thongkehethong.mindmaid.ai/api/docs/
- **Admin Panel**: https://thongkehethong.mindmaid.ai/admin/

---

# 2. HƯỚNG DẪN DÀNH CHO QUẢN TRỊ VIÊN

## 2.1. Đăng nhập

1. Truy cập: https://thongkehethong.mindmaid.ai/admin/
2. Nhập tên đăng nhập và mật khẩu admin
3. Hệ thống sẽ chuyển đến trang quản trị Django Admin

## 2.2. Quản lý Đơn vị (Organizations)

### Thêm đơn vị mới

1. Vào menu **Organizations** > **Add Organization**
2. Điền thông tin:
   - **Code**: Mã đơn vị (viết tắt, không dấu, VD: VPCP, BCA)
   - **Name**: Tên đầy đủ đơn vị
   - **Contact Person**: Người đầu mối
   - **Email**: Email liên hệ
   - **Phone**: Số điện thoại
   - **Status**: Active/Inactive
3. Nhấn **Save**

### Chỉnh sửa thông tin đơn vị

1. Vào **Organizations** > Chọn đơn vị cần sửa
2. Chỉnh sửa các trường cần thiết
3. Nhấn **Save**

### Vô hiệu hóa đơn vị

1. Vào **Organizations** > Chọn đơn vị
2. Đổi **Status** thành **Inactive**
3. Nhấn **Save**

> **Lưu ý**: Không xóa đơn vị có dữ liệu hệ thống. Hãy đặt Status = Inactive.

## 2.3. Quản lý Người dùng (Users)

### Tạo tài khoản người dùng mới

1. Vào **Users** > **Add User**
2. Điền thông tin:
   - **Username**: Tên đăng nhập (unique)
   - **Password**: Mật khẩu (tối thiểu 8 ký tự)
   - **Email**: Email người dùng
   - **First name / Last name**: Họ tên
   - **Organization**: Chọn đơn vị
   - **Role**: Chọn vai trò:
     - `admin`: Quản trị viên toàn hệ thống
     - `org_admin`: Quản lý đơn vị
     - `technical_staff`: Nhân viên kỹ thuật
   - **Staff status**: Tick nếu cho phép truy cập admin panel
   - **Superuser status**: Chỉ tick cho admin cấp cao nhất
3. Nhấn **Save**

### Phân quyền người dùng

**Cấu trúc phân quyền:**

| Role | Quyền hạn |
|------|-----------|
| **Admin** | - Toàn quyền trên hệ thống<br>- Quản lý tất cả đơn vị<br>- Quản lý users<br>- Xem mọi báo cáo |
| **Org Admin** | - Quản lý hệ thống của đơn vị mình<br>- Xem báo cáo đơn vị<br>- Không truy cập admin panel |
| **Technical Staff** | - Nhập liệu hệ thống<br>- Xem dữ liệu đơn vị<br>- Không quản lý users |

**Cách phân quyền:**
1. Vào **Users** > Chọn user
2. Kéo xuống phần **Permissions**:
   - **Staff status**: Cho phép login admin panel
   - **Superuser**: Admin cấp cao nhất (full quyền)
   - **Groups**: Gán vào nhóm quyền
   - **User permissions**: Set quyền chi tiết từng model
3. Nhấn **Save**

### Reset mật khẩu cho người dùng

1. Vào **Users** > Chọn user cần reset
2. Click vào link **this form** ở phần password
3. Nhập mật khẩu mới 2 lần
4. Nhấn **Change password**

## 2.4. Quản lý Hệ thống

### Xem danh sách hệ thống

1. Vào **Systems** > **Systems**
2. Hiển thị danh sách tất cả hệ thống từ các đơn vị
3. Có thể filter theo:
   - Organization
   - Form Level (Level 1 / Level 2)
   - Status

### Duyệt dữ liệu hệ thống

1. Click vào hệ thống cần kiểm tra
2. Xem các tab:
   - **System Info**: Thông tin tổng quan
   - **Architecture**: Kiến trúc & công nghệ
   - **Data Info**: Thông tin dữ liệu
   - **Operations**: Vận hành
   - **Integrations**: Tích hợp
3. Kiểm tra tính đầy đủ, hợp lệ
4. Nếu cần chỉnh sửa, click **Change** và cập nhật

### Xuất báo cáo tổng hợp

#### Xuất Excel:
1. Vào **Systems** > **Systems**
2. Chọn các hệ thống cần xuất (hoặc chọn tất cả)
3. Chọn Action: **Export to Excel**
4. Nhấn **Go**
5. File Excel sẽ được download

#### Xuất Word:
1. Vào API endpoint: `/api/systems/export/word/`
2. Hoặc sử dụng script Python để gọi API

### Theo dõi tiến độ nhập liệu

1. Vào **Dashboard** (trang chủ admin)
2. Xem các chỉ số:
   - Số đơn vị đã nhập liệu / tổng số
   - Số hệ thống đã khai báo
   - Tỷ lệ hoàn thành Level 1 vs Level 2
3. Gửi nhắc nhở đến các đơn vị chậm tiến độ

## 2.5. Quản lý File đính kèm

### Xem danh sách file

1. Vào **Systems** > **Attachments**
2. Xem tất cả file đã upload từ các đơn vị
3. Filter theo:
   - System
   - File type (architecture_diagram, data_dictionary, api_doc...)
   - Ngày upload

### Download file

1. Click vào attachment cần xem
2. Phần **File** hiển thị link download
3. Click vào link để tải về

### Xóa file không hợp lệ

1. Chọn attachment cần xóa
2. Nhấn **Delete**
3. Confirm xóa

> **Lưu ý**: Xóa file sẽ không thể khôi phục. Hãy backup trước khi xóa.

## 2.6. Audit Log & Monitoring

### Xem nhật ký hoạt động

1. Vào **Admin Log** (menu phía dưới)
2. Xem lịch sử thao tác:
   - User nào đã thực hiện
   - Thao tác gì (Add/Change/Delete)
   - Đối tượng nào
   - Thời gian

### Theo dõi tình trạng hệ thống

```bash
# SSH vào server
ssh root@178.128.80.170

# Xem logs
docker-compose logs -f backend
docker-compose logs -f frontend

# Xem resource usage
docker stats
```

## 2.7. Backup & Restore

### Backup database

```bash
# SSH vào server
cd /opt/thong_ke_he_thong

# Chạy backup script
./deploy.sh

# Hoặc manual backup
docker-compose exec postgres pg_dump -U postgres system_reports > backup_$(date +%Y%m%d).sql
```

### Restore database

```bash
# Restore từ file backup
cat backup_20260116.sql | docker-compose exec -T postgres psql -U postgres system_reports
```

### Backup files

```bash
# Backup media files
tar -czf media_backup_$(date +%Y%m%d).tar.gz backend/media/
```

## 2.8. Troubleshooting

### Người dùng không đăng nhập được

**Nguyên nhân thường gặp:**
1. Tài khoản chưa active: Vào Users > Check **Active** checkbox
2. Sai mật khẩu: Reset password cho user
3. Tài khoản bị khóa: Đổi **Status** thành Active

### Không thể upload file

**Kiểm tra:**
1. Dung lượng file (max 10MB)
2. Định dạng file có được phép không
3. Thư mục `media/` có quyền write không

```bash
# Check quyền
ls -la backend/media/

# Set quyền nếu cần
chmod -R 755 backend/media/
```

### API trả về lỗi 500

**Debug:**
1. Xem logs backend:
```bash
docker-compose logs backend
```

2. Kiểm tra database connection:
```bash
docker-compose ps postgres
```

3. Restart services:
```bash
docker-compose restart backend
```

---

# 3. HƯỚNG DẪN DÀNH CHO ĐƠN VỊ

## 3.1. Đăng ký tài khoản

### Bước 1: Truy cập trang đăng ký

1. Mở trình duyệt web (Chrome, Firefox, Edge...)
2. Truy cập: https://thongkehethong.mindmaid.ai/register

### Bước 2: Điền thông tin đăng ký

Điền đầy đủ các thông tin sau:

1. **Đơn vị**: Chọn đơn vị của bạn từ danh sách dropdown
   - Tìm kiếm bằng cách gõ tên hoặc mã đơn vị
   - Nếu không thấy đơn vị, liên hệ Admin để thêm

2. **Tên đăng nhập**:
   - Tối thiểu 3 ký tự
   - Không dấu, không khoảng trắng
   - Ví dụ: `nguyenvana`, `vpcp_admin`

3. **Email**:
   - Email công vụ của bạn
   - Phải là email hợp lệ (có @)
   - Ví dụ: `nguyenvana@donvi.gov.vn`

4. **Họ và tên**:
   - Họ: Nguyễn Văn
   - Tên: A

5. **Số điện thoại** (không bắt buộc):
   - Số điện thoại liên hệ
   - Ví dụ: 0912345678

6. **Mật khẩu**:
   - Tối thiểu 8 ký tự
   - Nên kết hợp chữ hoa, chữ thường, số, ký tự đặc biệt
   - Ví dụ: `MyP@ssw0rd2026`

7. **Xác nhận mật khẩu**:
   - Nhập lại mật khẩu ở trên cho chính xác

### Bước 3: Đăng ký

1. Nhấn nút **"Đăng ký"**
2. Hệ thống sẽ kiểm tra thông tin:
   - Username chưa tồn tại
   - Email hợp lệ
   - Mật khẩu đủ mạnh
   - 2 mật khẩu khớp nhau

3. Nếu thành công:
   - Hiển thị thông báo "Đăng ký thành công!"
   - Tự động chuyển đến trang đăng nhập sau 1.5 giây

4. Nếu có lỗi:
   - Hiển thị thông báo lỗi cụ thể
   - Sửa lại thông tin và thử lại

### Lưu ý khi đăng ký:
- Mỗi email chỉ đăng ký được 1 tài khoản
- Tên đăng nhập không thể thay đổi sau khi tạo
- Nếu quên mật khẩu, liên hệ Admin để reset

## 3.2. Đăng nhập

### Bước 1: Truy cập trang đăng nhập

1. Truy cập: https://thongkehethong.mindmaid.ai/login
2. Hoặc từ trang đăng ký, click vào link **"Đăng nhập ngay"**

### Bước 2: Nhập thông tin

1. **Tên đăng nhập**: Nhập username đã đăng ký
2. **Mật khẩu**: Nhập mật khẩu

### Bước 3: Đăng nhập

1. Nhấn nút **"Đăng nhập"**
2. Hệ thống kiểm tra thông tin
3. Nếu đúng → Chuyển đến Dashboard
4. Nếu sai → Hiển thị thông báo lỗi, nhập lại

### Quên mật khẩu?

Liên hệ Quản trị viên hệ thống để được reset mật khẩu:
- Email: admin@donvi.gov.vn
- Hotline: 024.XXXXXXX

## 3.3. Giao diện chính

Sau khi đăng nhập, bạn sẽ thấy giao diện gồm:

### Menu bên trái:
- **Dashboard**: Tổng quan, thống kê
- **Hệ thống**: Danh sách hệ thống của đơn vị
- **Đơn vị**: Thông tin đơn vị (chỉ xem)
- **Tài khoản**: Thông tin cá nhân

### Thanh trên cùng:
- Logo hệ thống
- Tên đăng nhập
- Nút **Đăng xuất**

## 3.4. Quản lý thông tin đơn vị

### Xem thông tin đơn vị

1. Click menu **"Đơn vị"** hoặc **"Organizations"**
2. Xem thông tin:
   - Mã đơn vị
   - Tên đơn vị
   - Người liên hệ
   - Email, số điện thoại
3. Nếu cần sửa, liên hệ Admin

## 3.5. Khai báo Hệ thống

### Thêm hệ thống mới

1. Click menu **"Hệ thống"** > Nhấn nút **"Thêm hệ thống mới"**

2. **Chọn mức độ chi tiết**:
   - **Level 1**: Báo cáo nhanh (6 phần) - khuyến nghị cho khảo sát sơ bộ
   - **Level 2**: Báo cáo chi tiết (11 phần) - cho thiết kế tổng thể

3. **Điền thông tin cơ bản**:
   - **Mã hệ thống**: Mã viết tắt (VD: QLVB, HCSN, VNPT_DMS)
   - **Tên hệ thống**: Tên đầy đủ (VD: Hệ thống Quản lý Văn bản)
   - **Mục đích**: Mô tả ngắn gọn chức năng chính (1-2 câu)

4. Nhấn **"Tiếp tục"** để nhập chi tiết

### Nhập dữ liệu Level 1 (6 phần)

#### PHẦN 1: Tổng quan hệ thống

**Thông tin cần nhập:**

1. **Phạm vi sử dụng**:
   - ☑ Nội bộ đơn vị
   - ☑ Toàn Bộ
   - ☑ Kết nối ra ngoài (địa phương/doanh nghiệp/người dân)

2. **Đối tượng sử dụng**:
   - ☑ Lãnh đạo
   - ☑ Cán bộ nghiệp vụ
   - ☑ Doanh nghiệp
   - ☑ Người dân
   - ☑ Khác: [ghi rõ]

3. **Số lượng người dùng**:
   - Ước tính số user hoạt động

**Ví dụ:**
> Hệ thống Quản lý Văn bản sử dụng nội bộ toàn Bộ, phục vụ 200 cán bộ và 50 lãnh đạo.

#### PHẦN 2: Kiến trúc & Công nghệ

**Thông tin cần nhập:**

1. **Kiến trúc tổng thể**:
   - ☑ Monolithic (ứng dụng nguyên khối)
   - ☑ Modular (chia module)
   - ☑ Microservices (kiến trúc dịch vụ nhỏ)
   - ☑ Khác: [ghi rõ]

2. **Có sơ đồ kiến trúc không?**
   - ☑ Có → Upload file
   - ☑ Không

3. **Backend**:
   - Chọn ngôn ngữ/framework: Java, .NET, NodeJS, Python, PHP...
   - Ghi rõ phiên bản nếu biết

4. **Frontend**:
   - Chọn: React, Angular, Vue, jQuery, Vanilla JS...

5. **Mobile App**:
   - ☑ Có (Native iOS/Android)
   - ☑ Có (Hybrid: Flutter, React Native...)
   - ☑ Không có

6. **Cơ sở dữ liệu**:
   - Loại: Oracle, SQL Server, MySQL, PostgreSQL, MongoDB...
   - Mô hình:
     - ☑ Tập trung
     - ☑ Phân tán
     - ☑ Mỗi app một CSDL

**Ví dụ:**
> Kiến trúc: Monolithic, Backend: Java Spring Boot, Frontend: React, Database: PostgreSQL, không có mobile app.

#### PHẦN 3: Dữ liệu

**Thông tin cần nhập:**

1. **Loại dữ liệu chính**:
   - ☑ Văn bản hành chính
   - ☑ Dữ liệu nghiệp vụ (nghị định, thông tư...)
   - ☑ Dữ liệu cá nhân (CCCD, thông tin công dân)
   - ☑ Dữ liệu tài chính
   - ☑ Khác: [ghi rõ]

2. **Độ nhạy cảm**:
   - ☑ Công khai
   - ☑ Nội bộ
   - ☑ Mật
   - ☑ Tối mật

3. **Dữ liệu có chia sẻ với hệ thống khác không?**
   - ☑ Có → Ghi rõ hệ thống nào
   - ☑ Không

4. **Tần suất cập nhật dữ liệu**:
   - ☑ Realtime
   - ☑ Hàng ngày
   - ☑ Hàng tuần
   - ☑ Hàng tháng

**Ví dụ:**
> Dữ liệu: Văn bản hành chính (mật), có chia sẻ với Hệ thống Một Cửa, cập nhật hàng ngày.

#### PHẦN 4: Vận hành

**Thông tin cần nhập:**

1. **Môi trường triển khai**:
   - ☑ On-premise (server tại đơn vị)
   - ☑ Cloud (AWS, Azure, GCP...)
   - ☑ Hybrid (kết hợp)
   - ☑ Hosting thuê ngoài

2. **Chế độ sao lưu**:
   - ☑ Hàng ngày
   - ☑ Hàng tuần
   - ☑ Không có

3. **Có giám sát (monitoring) không?**
   - ☑ Có → Công cụ gì? (Zabbix, Prometheus, Nagios...)
   - ☑ Không

4. **Tình trạng hoạt động hiện tại**:
   - ☑ Đang vận hành ổn định
   - ☑ Có sự cố thỉnh thoảng
   - ☑ Cần nâng cấp gấp

**Ví dụ:**
> Triển khai on-premise, backup hàng ngày, có monitoring bằng Zabbix, đang hoạt động ổn định.

#### PHẦN 5: Tích hợp

**Thông tin cần nhập:**

1. **Có tích hợp với hệ thống khác không?**
   - ☑ Có
   - ☑ Không

2. **Nếu có, tích hợp với:**
   - Hệ thống nào?
   - Phương thức: API, Database link, File import/export, Web Service...

3. **Có sử dụng SSO (Single Sign-On) không?**
   - ☑ Có → Ghi rõ giải pháp (LDAP, OAuth, SAML...)
   - ☑ Không

4. **Có API công khai không?**
   - ☑ Có → Ghi rõ URL API docs
   - ☑ Không

**Ví dụ:**
> Tích hợp với Hệ thống Một Cửa qua REST API, có SSO bằng LDAP, không có API công khai.

#### PHẦN 6: Đánh giá chung

**Thông tin cần nhập:**

1. **Điểm mạnh của hệ thống**:
   - Liệt kê 2-3 điểm tốt nhất

2. **Hạn chế / Điểm yếu**:
   - Liệt kê các vấn đề hiện tại

3. **Kế hoạch nâng cấp**:
   - Có kế hoạch nâng cấp trong 1-2 năm tới không?
   - Nếu có, nâng cấp những gì?

**Ví dụ:**
> **Điểm mạnh**: Giao diện thân thiện, tốc độ xử lý nhanh.
> **Hạn chế**: Chưa có mobile app, backup chưa tự động.
> **Kế hoạch**: Phát triển mobile app trong năm 2026.

### Nhập dữ liệu Level 2 (11 phần)

Level 2 bao gồm **toàn bộ Level 1 + 5 phần mở rộng**:

#### PHẦN 7: Chi phí

1. **Chi phí đầu tư ban đầu**:
   - Số tiền (VNĐ)
   - Năm đầu tư

2. **Chi phí vận hành hàng năm**:
   - Bảo trì
   - Nhân sự
   - Hosting/cloud
   - License phần mềm

3. **Nguồn kinh phí**:
   - Ngân sách nhà nước
   - Vốn đơn vị
   - Dự án ODA
   - Khác

**Ví dụ:**
> Đầu tư: 5 tỷ VNĐ (2023), Vận hành: 500 triệu/năm, Nguồn: NSNN.

#### PHẦN 8: Nhà thầu

1. **Danh sách nhà thầu**:
   - Tên công ty
   - Vai trò (phát triển, bảo trì, hosting...)

2. **Hợp đồng**:
   - Số hợp đồng
   - Thời hạn
   - Giá trị

3. **SLA (Service Level Agreement)**:
   - Uptime cam kết
   - Thời gian phản hồi sự cố

**Ví dụ:**
> Nhà thầu: Công ty TNHH ABC, HĐ số 123/2023, giá trị 5 tỷ, thời hạn 3 năm, SLA 99.5% uptime.

#### PHẦN 9: Bảo mật

1. **Tuân thủ**:
   - ☑ Thông tư 03/2017/TT-BCA (ATTT cấp 2)
   - ☑ ISO 27001
   - ☑ NIST Cybersecurity Framework
   - ☑ Khác

2. **Audit bảo mật**:
   - Lần audit gần nhất: tháng/năm
   - Kết quả: Pass / Có phát hiện

3. **Penetration Test**:
   - ☑ Đã thực hiện
   - ☑ Chưa thực hiện

**Ví dụ:**
> Tuân thủ TT 03/2017, audit lần cuối 12/2025 (Pass), chưa thực hiện pentest.

#### PHẦN 10: Hiệu suất

1. **Performance metrics**:
   - Response time trung bình: ... ms
   - Concurrent users tối đa: ...
   - CPU/RAM usage trung bình: ... %

2. **Bottleneck**:
   - Điểm nghẽn nào đã phát hiện?
   - Nguyên nhân?

3. **Load testing**:
   - ☑ Đã thực hiện
   - ☑ Chưa thực hiện

**Ví dụ:**
> Response time: 200ms, max 500 users đồng thời, RAM usage 60%, bottleneck ở database query.

#### PHẦN 11: Roadmap

1. **Kế hoạch 1 năm**:
   - Tính năng mới
   - Nâng cấp kỹ thuật
   - Tích hợp mới

2. **Kế hoạch 2-3 năm**:
   - Chuyển đổi công nghệ?
   - Mở rộng phạm vi?
   - Thay thế hệ thống?

**Ví dụ:**
> **2026**: Phát triển mobile app, tích hợp AI chatbot.
> **2027-2028**: Migrate lên cloud AWS, mở rộng toàn Bộ.

### Lưu và gửi dữ liệu

1. Sau khi nhập xong từng phần, nhấn **"Lưu"**
2. Khi hoàn tất tất cả các phần, nhấn **"Gửi dữ liệu"**
3. Hệ thống sẽ kiểm tra tính đầy đủ:
   - Nếu thiếu trường bắt buộc → Thông báo lỗi, yêu cầu bổ sung
   - Nếu đầy đủ → Lưu thành công, chuyển về danh sách

## 3.6. Upload tài liệu đính kèm

### Loại tài liệu cần đính kèm

1. **Sơ đồ kiến trúc** (Architecture Diagram):
   - File PNG, JPG, PDF
   - Mô tả kiến trúc tổng thể hệ thống

2. **Mô hình dữ liệu** (ERD / Data Dictionary):
   - File PNG, JPG, PDF, Excel
   - ERD: Entity Relationship Diagram
   - Data Dictionary: Danh sách bảng, trường, kiểu dữ liệu

3. **Tài liệu API** (API Documentation):
   - File PDF, Word
   - Mô tả các API endpoint, request/response

4. **Hợp đồng** (Contract):
   - File PDF
   - Hợp đồng với nhà thầu, vendor

5. **Báo cáo khác** (Other Reports):
   - File PDF, Word, Excel
   - Báo cáo vận hành, bảo mật, audit...

### Cách upload file

1. Vào chi tiết hệ thống
2. Kéo xuống phần **"Tài liệu đính kèm"**
3. Nhấn **"Thêm tài liệu"**
4. Chọn loại tài liệu từ dropdown
5. Nhấn **"Chọn file"** → Chọn file từ máy tính
6. Nhập mô tả ngắn (tùy chọn)
7. Nhấn **"Upload"**

### Lưu ý khi upload:
- Dung lượng file tối đa: **10 MB**
- Định dạng cho phép:
  - Hình ảnh: PNG, JPG, JPEG
  - Tài liệu: PDF, DOC, DOCX, XLS, XLSX
- Tên file nên có dấu, không khoảng trắng
- Đặt tên file có ý nghĩa, dễ tìm

### Quản lý file đã upload

1. Xem danh sách file trong phần "Tài liệu đính kèm"
2. Click vào file để xem/download
3. Nhấn **"Xóa"** để xóa file (nếu upload nhầm)

## 3.7. Chỉnh sửa thông tin hệ thống

1. Vào menu **"Hệ thống"**
2. Click vào hệ thống cần sửa
3. Nhấn nút **"Chỉnh sửa"** (icon bút chì)
4. Sửa các trường cần thiết
5. Nhấn **"Lưu"**

> **Lưu ý**: Chỉ có thể sửa hệ thống của đơn vị mình. Không thể sửa hệ thống của đơn vị khác.

## 3.8. Xóa hệ thống

1. Vào menu **"Hệ thống"**
2. Click vào hệ thống cần xóa
3. Nhấn nút **"Xóa"** (icon thùng rác)
4. Xác nhận xóa

> **Cảnh báo**: Xóa hệ thống sẽ xóa luôn tất cả dữ liệu chi tiết và file đính kèm. Không thể khôi phục!

## 3.9. Xem báo cáo

### Dashboard

1. Click menu **"Dashboard"**
2. Xem các chỉ số:
   - Tổng số hệ thống đã khai báo
   - Số hệ thống Level 1 / Level 2
   - Biểu đồ phân bố công nghệ
   - Tiến độ hoàn thành

### Xuất báo cáo đơn vị

1. Vào **"Hệ thống"** > Nhấn **"Xuất báo cáo"**
2. Chọn định dạng:
   - **Excel**: Danh sách hệ thống dạng bảng
   - **Word**: Báo cáo chi tiết từng hệ thống
3. File sẽ được download về máy

## 3.10. Đổi mật khẩu

1. Click vào tên đăng nhập (góc phải trên)
2. Chọn **"Thông tin cá nhân"**
3. Nhấn **"Đổi mật khẩu"**
4. Nhập:
   - Mật khẩu hiện tại
   - Mật khẩu mới
   - Xác nhận mật khẩu mới
5. Nhấn **"Cập nhật"**

## 3.11. Đăng xuất

1. Click vào tên đăng nhập (góc phải trên)
2. Chọn **"Đăng xuất"**
3. Hệ thống sẽ logout và chuyển về trang login

---

# 4. CÂU HỎI THƯỜNG GẶP

## 4.1. Câu hỏi chung

### Hệ thống này dùng để làm gì?
Thu thập thông tin về các hệ thống CNTT của các đơn vị trực thuộc Bộ, phục vụ công tác thiết kế tổng thể chuyển đổi số.

### Dữ liệu có được dùng để đánh giá đơn vị không?
**Không.** Thông tin chỉ phục vụ mục đích thiết kế tổng thể, không dùng để xếp loại, đánh giá đơn vị.

### Phải khai báo hết tất cả hệ thống không?
**Có.** Đề nghị khai báo đầy đủ tất cả hệ thống/ứng dụng đang vận hành tại đơn vị, kể cả hệ thống nhỏ.

### Nên chọn Level 1 hay Level 2?
- **Level 1**: Nhanh gọn, phù hợp khảo sát sơ bộ (6 phần)
- **Level 2**: Chi tiết, phù hợp thiết kế tổng thể (11 phần)

Khuyến nghị: Nếu đơn vị có thời gian và dữ liệu đầy đủ, hãy chọn **Level 2** để cung cấp thông tin chi tiết nhất.

## 4.2. Đăng ký & Đăng nhập

### Tôi quên mật khẩu, làm sao?
Liên hệ Quản trị viên hệ thống để được reset mật khẩu.

### Tôi không thấy đơn vị mình trong danh sách đăng ký?
Liên hệ Admin để thêm đơn vị của bạn vào hệ thống.

### Tôi có thể đổi username không?
**Không.** Username không thể thay đổi sau khi tạo. Nếu muốn đổi, phải tạo tài khoản mới.

### Một đơn vị có thể có bao nhiêu tài khoản?
Không giới hạn. Mỗi cán bộ có thể có 1 tài khoản riêng.

## 4.3. Nhập liệu

### Tôi không biết thông tin kỹ thuật chi tiết, làm sao?
Liên hệ với nhân viên kỹ thuật hoặc nhà thầu để lấy thông tin. Nếu không có, hãy nhập những gì biết được, phần còn lại có thể bổ sung sau.

### Tôi có thể lưu tạm và nhập tiếp sau không?
**Có.** Nhấn "Lưu" để lưu tạm, sau đó vào lại để nhập tiếp.

### Tôi nhập sai thông tin, sửa như thế nào?
Vào chi tiết hệ thống → Nhấn "Chỉnh sửa" → Sửa thông tin → Lưu.

### Tôi không có sơ đồ kiến trúc, có bắt buộc phải upload không?
**Không bắt buộc.** Nếu không có, tick vào "Không có sơ đồ kiến trúc". Tuy nhiên, nếu có, hãy upload để cung cấp thông tin đầy đủ hơn.

### Hệ thống của tôi cũ, không còn dùng nữa, có phải khai báo không?
**Không.** Chỉ khai báo các hệ thống **đang vận hành**.

## 4.4. Upload file

### Upload file bị lỗi, tại sao?
Kiểm tra:
- Dung lượng file < 10 MB
- Định dạng file hợp lệ (PNG, JPG, PDF, DOC, XLS...)
- Tên file không chứa ký tự đặc biệt

### Tôi upload nhầm file, xóa như thế nào?
Vào danh sách file đính kèm → Nhấn "Xóa" ở file cần xóa.

### File đã upload có thể xem lại không?
**Có.** Vào chi tiết hệ thống → Phần "Tài liệu đính kèm" → Click vào file để xem/download.

## 4.5. Báo cáo

### Tôi có thể xuất báo cáo của đơn vị mình không?
**Có.** Vào "Hệ thống" → Nhấn "Xuất báo cáo" → Chọn định dạng Excel hoặc Word.

### Tôi có thể xem báo cáo của đơn vị khác không?
**Không.** Bạn chỉ xem được dữ liệu của đơn vị mình. Chỉ Admin mới xem được tất cả.

## 4.6. Kỹ thuật

### Hệ thống có tương thích với trình duyệt nào?
- Google Chrome (khuyến nghị)
- Firefox
- Microsoft Edge
- Safari

### Tôi có thể truy cập trên điện thoại không?
**Có.** Giao diện responsive, tương thích với mobile. Tuy nhiên, khuyến nghị dùng máy tính để nhập liệu cho tiện.

### Dữ liệu có được mã hóa không?
**Có.** Tất cả kết nối sử dụng HTTPS (SSL/TLS). Dữ liệu được lưu trữ an toàn trong database.

---

# PHỤ LỤC

## A. Liên hệ hỗ trợ

### Quản trị viên hệ thống
- **Email**: admin@donvi.gov.vn
- **Hotline**: 024.XXXXXXX
- **Giờ làm việc**: 8h00 - 17h00, Thứ 2 - Thứ 6

### Hỗ trợ kỹ thuật
- **Email**: support@donvi.gov.vn
- **Hotline**: 024.YYYYYYY

## B. Thuật ngữ

| Thuật ngữ | Giải thích |
|-----------|------------|
| **Level 1** | Báo cáo chuẩn (6 phần), phù hợp khảo sát nhanh |
| **Level 2** | Báo cáo chi tiết (11 phần), phù hợp thiết kế tổng thể |
| **Monolithic** | Kiến trúc nguyên khối, toàn bộ tính năng trong 1 ứng dụng |
| **Microservices** | Kiến trúc dịch vụ nhỏ, chia thành nhiều service độc lập |
| **API** | Application Programming Interface, giao diện lập trình |
| **SSO** | Single Sign-On, đăng nhập một lần cho nhiều hệ thống |
| **ERD** | Entity Relationship Diagram, sơ đồ quan hệ thực thể |
| **SLA** | Service Level Agreement, cam kết mức độ dịch vụ |
| **JWT** | JSON Web Token, phương thức xác thực |
| **RBAC** | Role-Based Access Control, phân quyền theo vai trò |

## C. Mẫu báo cáo

### Mẫu báo cáo Level 1 (Tóm tắt)

```
TÊN HỆ THỐNG: Hệ thống Quản lý Văn bản
ĐƠN VỊ: Văn phòng Bộ

1. TỔNG QUAN
   - Phạm vi: Toàn Bộ
   - Đối tượng: 200 cán bộ, 50 lãnh đạo

2. KIẾN TRÚC
   - Kiến trúc: Monolithic
   - Backend: Java Spring Boot
   - Frontend: React
   - Database: PostgreSQL

3. DỮ LIỆU
   - Loại: Văn bản hành chính (Mật)
   - Cập nhật: Hàng ngày

4. VẬN HÀNH
   - Môi trường: On-premise
   - Backup: Hàng ngày

5. TÍCH HỢP
   - Tích hợp: Hệ thống Một Cửa (REST API)
   - SSO: LDAP

6. ĐÁNH GIÁ
   - Điểm mạnh: Giao diện thân thiện, nhanh
   - Hạn chế: Chưa có mobile app
   - Kế hoạch: Phát triển mobile 2026
```

### Mẫu báo cáo Level 2 (Chi tiết)

Level 2 = Level 1 + các phần mở rộng:

```
7. CHI PHÍ
   - Đầu tư: 5 tỷ VNĐ (2023)
   - Vận hành: 500 triệu/năm

8. NHÀ THẦU
   - Công ty ABC, HĐ 123/2023, 3 năm, SLA 99.5%

9. BẢO MẬT
   - Tuân thủ: TT 03/2017/TT-BCA
   - Audit: 12/2025 (Pass)

10. HIỆU SUẤT
   - Response time: 200ms
   - Max users: 500

11. ROADMAP
   - 2026: Mobile app, AI chatbot
   - 2027: Migrate cloud AWS
```

## D. Checklist hoàn thành

### Checklist cho Đơn vị

- [ ] Đã đăng ký tài khoản thành công
- [ ] Đã đăng nhập được hệ thống
- [ ] Đã khai báo đầy đủ thông tin đơn vị
- [ ] Đã liệt kê tất cả hệ thống đang vận hành
- [ ] Đã nhập dữ liệu Level 1 (6 phần) cho từng hệ thống
- [ ] Đã nhập dữ liệu Level 2 (11 phần) nếu có thể
- [ ] Đã upload sơ đồ kiến trúc (nếu có)
- [ ] Đã upload ERD/Data Dictionary (nếu có)
- [ ] Đã upload tài liệu API (nếu có)
- [ ] Đã upload hợp đồng nhà thầu (nếu có)
- [ ] Đã kiểm tra lại tính đầy đủ, chính xác
- [ ] Đã gửi dữ liệu thành công

### Checklist cho Admin

- [ ] Đã tạo tài khoản admin
- [ ] Đã thêm tất cả đơn vị vào hệ thống
- [ ] Đã tạo tài khoản cho các đơn vị (nếu cần)
- [ ] Đã hướng dẫn cách sử dụng cho các đơn vị
- [ ] Đã theo dõi tiến độ nhập liệu
- [ ] Đã kiểm tra chất lượng dữ liệu
- [ ] Đã xuất báo cáo tổng hợp
- [ ] Đã backup database định kỳ
- [ ] Đã thiết lập monitoring
- [ ] Đã cấu hình SSL/HTTPS

---

**Kết thúc tài liệu**

*Mọi thắc mắc, vui lòng liên hệ: admin@donvi.gov.vn hoặc hotline 024.XXXXXXX*
