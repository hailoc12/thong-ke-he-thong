# Customer Feedback - System Form Redesign

**Date:** 2026-01-18
**From:** Customer
**Topic:** Form "Thêm hệ thống mới" - Yêu cầu chỉnh sửa chi tiết
**Status:** Pending Analysis & Implementation

---

## 1. Thông tin cơ bản

### Bỏ các trường:
- ❌ **Chọn Đơn vị** - Vì tài khoản đơn vị nào thì mặc định có rồi mà?
- ❌ **Mã Hệ thống** - Vì cái này hệ thống tự sinh ra chứ đơn vị ko tự đặt tên nó loạn
- ❌ **Mục đích / Mô tả** - Bỏ phần này đưa vào dưới
- ❌ **Cấp độ form** - Bỏ trường này
- ❌ **Chủ sở hữu nghiệp vụ / Chủ sở hữu kỹ thuật**

### Giữ nguyên:
- ✅ **Tên Hệ thống** - Ok

### Thêm mới:
- ➕ **Tên tiếng Anh** - (nếu có)

### Chỉnh sửa:
- 📝 **Phạm vi** - Cho thành trường **Bắt buộc**
- 📝 **Nhóm hệ thống** - Cho thành trường **Bắt buộc**. Nội dung chọn bao gồm:
  - "Nền tảng quốc gia"
  - "Nền tảng dùng chung của Bộ"
  - "CSDL chuyên ngành"
  - "Ứng dụng nghiệp vụ"
  - "Cổng thông tin"
  - "BI/Báo cáo"
  - "ESB/Tích hợp"
  - "Khác"
- 📝 **Mức độ Quan trọng** - Quan trọng / Trung bình / Thấp
- 📝 **Ngày vận hành** - Chỉ chọn **tháng/năm** bỏ Ngày
- ➕ **Số lần nâng cấp** - Trường mới
- ➕ **Thời gian nâng cấp gần nhất** - Trường mới

---

## 2. Mục tiêu – phạm vi – người dùng (Business & Users)

**Nhận xét:** Em bổ sung phần này a thấy thiếu

### Bổ sung các trường:
- ➕ **Mục tiêu nghiệp vụ** (tối đa 5 gạch đầu dòng)
- ➕ **Quy trình nghiệp vụ chính mà hệ thống hỗ trợ** (liệt kê)
- ➕ **Có đủ hồ sơ phân tích thiết kế hệ thống?** Có / Không
- ➕ **Đối tượng sử dụng** (cho tích vì có thể nhiều đối tượng sử dụng):
  - Nội bộ: vai trò (lãnh đạo/cán bộ xử lý/kiểm duyệt…)
  - Bên ngoài: DN/người dân/địa phương/đơn vị khác…
- ➕ **Quy mô người dùng (định lượng)**:
  - Tổng số tài khoản:
  - Người dùng hoạt động tháng (MAU)
  - Người dùng hoạt động ngày (DAU):
  - Số đơn vị/địa phương: (Nếu có) → Trường này không bắt buộc

---

## 3. Kiến trúc ứng dụng (Application Architecture)

### Mô hình kiến trúc

**Câu hỏi:**
- Loại kiến trúc: Có thiếu **Serverless** và **SaaS** không?
- Liệu có thể nhiều hơn kiến trúc đồng thời ko để cho tích chọn?

### Bổ sung:
- ➕ **Có phân lớp không?** Presentation / Business / Data / Integration
- ➕ **Có multi-tenant không?** Có ☐ Không
- 📝 **Có container hóa không?** ☐ Có ☐ Không
  - Nếu có: ☐ Docker ☐ Kubernetes ☐ OpenShift ☐ Khác…

### Công nghệ chi tiết
- Frontend: framework + version (VD: React 18, Angular 15…)
- Backend: ngôn ngữ + framework + version (Java/Spring, .NET, Node…)
- API style: ☐ REST ☐ GraphQL ☐ gRPC ☐ SOAP ☐ Khác
- Messaging/Queue: Kafka/RabbitMQ/ActiveMQ/None
- Cache: Redis/Memcached/None
- Search: Elasticsearch/Solr/None
- Reporting/BI: PowerBI/Tableau/Metabase/Superset/Custom/None
- Authentication: ☐ LDAP ☐ AD ☐ SSO ☐ OIDC ☐ SAML ☐ Local account

### Mã nguồn & CI/CD
- Mã nguồn đặt ở đâu: GitLab/GitHub/Bitbucket/On-prem/Không quản lý tập trung
- Nhánh release/branching model
- CI/CD: ☐ Có ☐ Không
  - Nếu có: Jenkins/GitLab CI/Azure DevOps/ArgoCD…
- Tự động hóa kiểm thử: unit/integration/security scan? (có/không, công cụ)

---

## 4. CSDL & Mô hình dữ liệu (Data Architecture)

### Công nghệ DB
- DB chính: Oracle/SQL Server/PostgreSQL/MySQL/NoSQL… (version)
- DB phụ/khác: …
- Lưu file: ☐ File server ☐ Object Storage ☐ DB BLOB ☐ ECM/DMS

### Quy mô dữ liệu (bắt buộc số)
- Dung lượng DB hiện tại: … GB/TB
- Dung lượng file đính kèm: … GB/TB
- Tốc độ tăng trưởng: … GB/tháng hoặc …%/năm
- Số bản ghi (ước lượng): …
- Retention (lưu bao lâu): …

### Mô hình dữ liệu
- Có ERD không? ☐ Có (đính kèm) ☐ Không
- Danh mục dùng chung nào đang dùng? (đơn vị/địa bàn/đối tượng/chuẩn mã…)
- Dữ liệu "master" của hệ thống là gì? (hệ thống là nguồn gốc dữ liệu nào)
- Dữ liệu nhạy cảm/PII? ☐ Có ☐ Không
  - Nếu có: loại dữ liệu nhạy cảm

---

## 5. Tích hợp – liên thông (Integration)

**Câu hỏi:** Em xem cái của em đã đủ chưa? A thấy có hơi ít ko? Em xem dưới có cần thêm ko?

### Danh mục tích hợp
Với mỗi kết nối, ghi:
- Hệ thống A ↔ hệ thống B
- Dữ liệu trao đổi (đối tượng dữ liệu)
- Cách tích hợp: API / file / DB link / manual
- Tần suất: real-time / theo lô (giờ/ngày/tuần)
- Cơ chế đồng bộ lỗi & retry
- Có API doc không? ☐ Có ☐ Không

### API Inventory (bắt buộc)
- Tổng số API đang cung cấp: …
- Tổng số API đang tiêu thụ: …
- Có API gateway không? ☐ Có ☐ Không
- Chuẩn versioning, throttling, logging?

---

## 6. Vận hành

**Câu hỏi:** Chỗ này a cần bổ sung thêm mấy cái dưới đây để vào đây phù hợp ko?

### Bổ sung:
- ➕ **Nơi đặt:** ☐ DC Bộ ☐ Thuê ngoài ☐ Cloud (AWS/Azure/GCP/VC…) ☐ Hybrid
- ➕ **Compute:** số VM / cấu hình CPU/RAM; OS

---

## 7. ATTT – an toàn hệ thống (Security)

### Bổ sung:
- ➕ **Phân loại hệ thống theo cấp độ** (nếu đã phê duyệt): Cấp 1–5? (theo quy định)
- ➕ **Đã có hồ sơ ATTT chưa?** ☐ Có ☐ Không

---

## 8. Đánh giá: Mức nợ kỹ thuật

**Câu hỏi:** A đang ko hiểu?

### Bổ sung:

**Điểm phù hợp để tích hợp vào kiến trúc chung:**
- ☐ Dễ chuẩn hóa
- ☐ Có API tốt
- ☐ Dữ liệu rõ nguồn gốc
- ☐ Có thể tách dịch vụ

**Điểm vướng:**
- ☐ Công nghệ quá cũ
- ☐ Không có tài liệu
- ☐ Không có API
- ☐ Dữ liệu không sạch / chồng chéo
- ☐ Phụ thuộc nhà thầu

**Đề xuất của đơn vị:**
- Giữ nguyên / Nâng cấp / Thay thế / Hợp nhất vào nền tảng chung

---

## Summary of Changes

### ❌ Remove (9 fields):
1. Chọn Đơn vị
2. Mã Hệ thống
3. Mục đích / Mô tả
4. Cấp độ form
5. Chủ sở hữu nghiệp vụ
6. Chủ sở hữu kỹ thuật

### ➕ Add (30+ new fields):
**Section 1: Thông tin cơ bản**
1. Tên tiếng Anh
2. Số lần nâng cấp
3. Thời gian nâng cấp gần nhất

**Section 2: Mục tiêu - phạm vi - người dùng**
4. Mục tiêu nghiệp vụ (5 gạch đầu dòng)
5. Quy trình nghiệp vụ chính
6. Có đủ hồ sơ phân tích thiết kế
7. Đối tượng sử dụng (checkbox)
8. Tổng số tài khoản
9. MAU
10. DAU
11. Số đơn vị/địa phương

**Section 3: Kiến trúc ứng dụng**
12. Có phân lớp không
13. Multi-tenant
14. Container options (Docker/K8s/OpenShift)
15. Frontend tech stack
16. Backend tech stack
17. API style
18. Messaging/Queue
19. Cache
20. Search
21. Reporting/BI
22. Authentication methods
23. Mã nguồn repository
24. CI/CD
25. Tự động hóa kiểm thử

**Section 6: Vận hành**
26. Nơi đặt (DC/Cloud/Hybrid)
27. Compute (VM/CPU/RAM/OS)

**Section 7: ATTT**
28. Phân loại hệ thống theo cấp độ
29. Hồ sơ ATTT

**Section 8: Đánh giá**
30. Điểm phù hợp (checkboxes)
31. Điểm vướng (checkboxes)
32. Đề xuất của đơn vị

### 📝 Modify (5 fields):
1. Phạm vi → Bắt buộc
2. Nhóm hệ thống → Bắt buộc + 8 options
3. Ngày vận hành → Chỉ tháng/năm
4. Loại kiến trúc → Thêm Serverless, SaaS
5. Container hóa → Thêm options chi tiết

---

**Total Changes:** ~44 field-level changes
**Complexity:** HIGH - Requires major form redesign
**Impact:** Backend schema + Frontend form + Validation logic

---

**Next Steps:**
1. ✅ Save feedback to file (DONE)
2. ⏳ Analyze with vibe coding agent
3. ⏳ Create detailed implementation plan
4. ⏳ Customer review & approval
5. ⏳ Implementation
