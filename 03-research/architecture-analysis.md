# Phân tích Kiến trúc Tổng thể Hệ thống MST

**Date**: 2026-01-24
**Purpose**: Phân tích chi tiết kiến trúc 5 tầng để thiết kế tính năng visualization

---

## Tổng quan Kiến trúc

Kiến trúc hệ thống MST được tổ chức theo **5 tầng** (layers), từ hạ tầng đến ứng dụng:

```
Tầng 5 - Ứng dụng
    ↓
Tầng 4 - Tích hợp & Trung gian liên thông
    ↓
Tầng 3 - Dịch vụ
    ↓
Tầng 2 - Dữ liệu & AI/ML
    ↓
Tầng 1 - Hạ tầng
```

---

## Tầng 1 - Hạ tầng (Infrastructure)

**Mục đích**: Vật lý và ảo hóa

### Các thành phần:
1. **CI CD Pipeline** - Hạ tầng triển khai
2. **Kubernetes Cluster** - Môi trường chạy ứng dụng
3. **Secrets KMS HSM** - Hệ thống mã hóa
4. **Network zero trust vpn** - Hạ tầng mạng, VPN nội bộ
5. **Object storage backup** - Lưu trữ & Sao lưu dữ liệu
6. **Government Cloud** - Môi trường đám mây chính phủ

---

## Tầng 2 - Dữ liệu & Trí tuệ nhân tạo & Máy học

**Mục đích**: Dữ liệu lớn & Dữ liệu nhỏ - Trí tuệ nhân tạo & Máy học

### L2.1 - Cơ sở dữ liệu vận hành của Bộ MST
- **MST Cơ sở dữ liệu vận hành** (2 instances)

### L2.2 - Cơ sở dữ liệu vận hành của Cục
- **Cục A Operational Database**
- **Cục B Operational Database**

### L2.3 - Cơ sở dữ liệu tenant của địa phương
- **Tỉnh X**: Tenant Cục A-X DB, Tenant Cục B-X DB
- **Tỉnh Y**: Tenant Cục A-Y DB, Tenant Cục B-Y DB

### L2.1a - Data lakehouse (hệ dữ liệu lớn)
- **MST Event bus & CDC hub**
- **Data catalog/ Metadata**
- **MST Data Lakehouse**
- **MST BI analytics engine**

### L2.1b - AI/ML (trí tuệ nhân tạo & máy học)
- **AI agent orchestration**
- **OCR AI model**
- **LLM AI model**
- **RAG module**
- **Data connector**
- **Vector DB**

---

## Tầng 3 - Dịch vụ

**Mục đích**: Services layer

### Khối dịch vụ/ ứng dụng quản trị, điều hành
- Phần hệ Báo cáo trực tuyến/ Phân tích, kiến nghị
- Phần hệ Lịch làm việc/ Quản lý công việc, nhiệm vụ
- Phần hệ Văn bản điện tử
- Phần hệ Thư điện tử công vụ

### Khối dịch vụ/ ứng dụng chuyên ngành dùng chung
- Phần hệ Giải quyết thủ tục hành chính
- Phần hệ Quản lý phân bổ ngân sách lĩnh vực KHCN, DMST, CDS
- Phần hệ Phục vụ chi đạo, điều hành (Văn phòng Bộ)
- Phần hệ Kế hoạch, tài chính nội bộ
- Phần hệ Quản lý cán bộ

### Khối nghiệp vụ riêng theo các đơn vị
- **Phần hệ Quản lý nhiệm vụ KHCN**
  - Hợp phần Quản lý nhiệm vụ KHCN (tại Trung ương)
  - Hợp phần Quản lý nhiệm vụ (tại Bộ ngành địa phương)
  - Hợp phần Quản lý bài báo đối với công nghệ CIS
- **Phần hệ Thông tin quốc gia KHCN (Cục TTCK)**
- **Các phần hệ nghiệp vụ riêng khác của các Đơn vị trực thuộc**

### Khối dịch vụ va cốt lõi (core) để bộ phát triển
- **MST Identity SSO** - Định danh hệ thống
- **MST Authentication** - Xác thực người dùng
- **MST Workflow/Rules engine** - Quy trình và nghiệp vụ
- **MST Workspace** - Không gian làm việc
- **MST Drive/ Search** - Lưu trữ/ Tìm kiếm
- **MST Observability** - Giám sát hệ thống
- **MST NotificationHub** - Hệ thống thông báo
- **MST Cyber Security** - Giám sát an toàn ATTT
- **MST eSignature** - Chữ ký số
- **MST BI &AI toàn bộ Bộ** - Báo cáo BI

### Khối giao tiếp tầng dữ liệu
- **Data access layer** - Lớp truy cập dữ liệu
- **Tenant resolver** - Bộ xác định tenant
- **DB router** - Bộ định tuyến CSDL

---

## Tầng 4 - Tích hợp và Trung gian liên thông

### L4.1 - Tích hợp của Bộ MST
- **MST Service Registry** - Đăng ký danh bạ dịch vụ
- **MST Service Mesh** - Mạn dịch vụ nội bộ MST
- **MST API Gateway** - Cổng tích hợp dịch vụ
- **Information Mediator** - Trung gian tiên thông dữ liệu

### L4.2 - Tích hợp với bên ngoài
- **API nền tảng quốc gia**
- **API đối tác bên ngoài**

---

## Tầng 5 - Ứng dụng

### L5.1 - Kênh truy cập và môi trường chạy ứng dụng của Bộ
- **MST UGP Portal** - Portal người dùng
- **MST Leader Dashboard** - Dashboard Lãnh đạo
- **MST Officer Workspace** - Không gian công chức
- **MST UGP Mobile** - Ứng dụng di động
- **MST Dev Portal** - Portal nhà phát triển
- **Backend For Frontend** - BFF layer

### L5.2 - Kênh ứng dụng riêng các đơn vị
- **Cục A: Ứng dụng nội bộ**
- **Cục B: Ứng dụng nội bộ**
- **BFF: Backend For Frontend**

---

## Người dùng (User Types)

Hệ thống phục vụ **7 loại người dùng**:
1. **Công dân**
2. **Doanh nghiệp**
3. **Lãnh đạo MST**
4. **Chuyên viên MST**
5. **Chuyên viên Cục**
6. **Chuyên viên địa phương**
7. **Nhà khoa học**

---

## Mối quan hệ giữa các tầng

```
User Types → Tầng 5 (Applications)
    ↓
Tầng 4 (API Gateway & Service Mesh)
    ↓
Tầng 3 (Business Services)
    ↓
Tầng 2 (Data & AI/ML)
    ↓
Tầng 1 (Infrastructure)
```

### Luồng dữ liệu điển hình:
1. **User** truy cập qua **MST Leader Dashboard** (Tầng 5)
2. Request đi qua **MST API Gateway** (Tầng 4)
3. Gọi các **Services** ở Tầng 3 (ví dụ: Phần hệ Báo cáo)
4. Service truy xuất **Data** từ Tầng 2 (MST Data Lakehouse)
5. Data được lưu trữ trên **Infrastructure** Tầng 1

---

## Phân loại theo Deployment Model

### Bộ MST (Central)
- MST Operational DB
- MST Data Lakehouse
- MST Core Services
- MST Leader Dashboard

### Cục (Department)
- Cục A/B Operational DB
- Cục A/B Applications

### Địa phương (Provincial)
- Tenant databases (multi-tenant)
- Shared applications

---

## Insights cho Visualization

### Cấu trúc hierarchical phù hợp cho drill-down:
1. **Level 0**: Tổng quan 5 tầng
2. **Level 1**: Click vào tầng → Xem các khối chức năng
3. **Level 2**: Click vào khối → Xem các hệ thống cụ thể
4. **Level 3**: Click vào hệ thống → Xem chi tiết + status + link

### Thông tin cần hiển thị cho mỗi hệ thống:
- Tên hệ thống
- Trạng thái (running, stopped, error)
- Số lượng instances
- Deployment environment
- Dependencies (hệ thống nào connect đến)
- Metrics (uptime, performance)
- Link đến hệ thống chi tiết trong database

### Color coding:
- **Tầng 1** (Infrastructure): Gray/Blue
- **Tầng 2** (Data & AI): Purple/Violet
- **Tầng 3** (Services): Green/Teal (chia sub-khối)
- **Tầng 4** (Integration): Pink/Red
- **Tầng 5** (Applications): Yellow/Orange

---

## Next Steps

1. Design wireframe cho visualization
2. Define data model linking systems to architecture layers
3. Design drill-down interaction flow
4. Technical implementation spec
