# YÊU CẦU NHIỆM VỤ - HỆ THỐNG BÁO CÁO THỐNG KÊ HỆ THỐNG

**Ngày tạo**: 2026-01-14
**Người yêu cầu**: Bộ (vai trò Tổng Công Trình Sư)
**Mục tiêu**: Xây dựng hệ thống cho phép các đơn vị trong Bộ nhập thông tin về các hệ thống/ứng dụng của mình

---

## I. BỐI CẢNH

Bộ cần khảo sát và thống kê toàn bộ hệ thống CNTT của các đơn vị trực thuộc nhằm:

1. **Vẽ bản đồ tổng thể** (Vòng 1): Hiểu được "có gì", "nằm ở đâu", "kết nối thế nào"
2. **Thiết kế tổng thể chuyển đổi số**: Xác định hệ thống lõi, dữ liệu chiến lược, nền tảng dùng chung
3. **Phát hiện silo**: Công nghệ silo, dữ liệu silo, điểm nghẽn liên thông
4. **Đánh giá phụ thuộc**: Nhà thầu, công nghệ cũ, rủi ro dài hạn

**Nguyên tắc quan trọng**:
> "Đề nghị các đơn vị cung cấp thông tin trung thực, đầy đủ theo mẫu, nhằm phục vụ công tác thiết kế tổng thể chuyển đổi số toàn Bộ; **không sử dụng báo cáo này cho mục đích đánh giá, xếp loại đơn vị**."

---

## II. PHẠM VI HỆ THỐNG

### Quan hệ dữ liệu chính
```
Organization (Đơn vị) ──1:N──> Systems (Hệ thống)
                                    │
                                    ├── Architecture (Kiến trúc)
                                    ├── Data Info (Dữ liệu)
                                    ├── Operations (Vận hành)
                                    ├── Integrations (Tích hợp)
                                    ├── Assessment (Đánh giá)
                                    ├── Attachments (Tài liệu)
                                    ├── Costs (Chi phí)
                                    └── Vendors (Nhà thầu)
```

### Đặc điểm
- **1 đơn vị** có thể có **nhiều hệ thống**
- **2 mức độ chi tiết**:
  - **Level 1**: Báo cáo chuẩn (6 phần) - cho survey tổng thể
  - **Level 2**: Phiếu hệ thống chi tiết (11 phần) - cho thiết kế tổng thể

---

## III. CẤU TRÚC BÁO CÁO CẦN THU THẬP

### A. LEVEL 1 - BÁO CÁO CHUẨN (6 PHẦN)

#### PHẦN 1: TỔNG QUAN HỆ THỐNG / ỨNG DỤNG

**1.1. Thông tin chung**
- Tên hệ thống / ứng dụng
- Mục đích chính (1–2 câu)
- Phạm vi sử dụng:
  - ☐ Nội bộ đơn vị
  - ☐ Toàn Bộ
  - ☐ Kết nối ra ngoài (địa phương / DN / người dân)

**1.2. Đối tượng sử dụng**
- Lãnh đạo
- Cán bộ nghiệp vụ
- Doanh nghiệp
- Người dân
- Đối tượng khác (ghi rõ)

**📌 Mục tiêu**: Biết hệ thống phục vụ ai

---

#### PHẦN 2: KIẾN TRÚC & CÔNG NGHỆ

**2.1. Kiến trúc tổng thể**
- ☐ Monolithic
- ☐ Modular
- ☐ Microservices
- ☐ Khác (ghi rõ)
- Có sơ đồ kiến trúc không? ☐ Có ☐ Không
  → Nếu có: đính kèm

**2.2. Công nghệ Web / App**
- Backend: (Java, .NET, NodeJS, Python, …)
- Frontend: (React, Angular, Vue, …)
- Mobile App: (Native / Hybrid / Không có)

**2.3. Cơ sở dữ liệu**
- Loại CSDL: (Oracle, SQL Server, MySQL, PostgreSQL, NoSQL…)
- Mô hình dữ liệu:
  - ☐ Tập trung
  - ☐ Phân tán
  - ☐ Mỗi ứng dụng một CSDL
- Có tài liệu mô hình dữ liệu không? ☐ Có ☐ Không

**📌 Mục tiêu**: Nhìn ra silo công nghệ & silo dữ liệu

---

#### PHẦN 3: DỮ LIỆU

**3.1. Quy mô dữ liệu hiện tại**
- Dung lượng dữ liệu đang lưu trữ: …… GB / TB
- Tốc độ tăng trưởng trung bình / năm: …… %

**3.2. Loại dữ liệu**
- Dữ liệu nghiệp vụ
- Dữ liệu hồ sơ
- Dữ liệu thống kê / báo cáo
- Dữ liệu định danh / danh mục dùng chung

**3.3. Khả năng chia sẻ dữ liệu**
- Có API chia sẻ không? ☐ Có ☐ Không
- Đang chia sẻ với hệ thống nào?
- Có chuẩn dữ liệu dùng chung không?

**📌 Mục tiêu**: Xác định dữ liệu nào là "tài sản cấp Bộ"

---

#### PHẦN 4: VẬN HÀNH & NHÂN SỰ

**4.1. Đội ngũ phát triển**
- Ai phát triển chính:
  - ☐ Đội nội bộ
  - ☐ Thuê ngoài
  - ☐ Kết hợp
- Đơn vị / nhà thầu phát triển: ………

**4.2. Bảo hành – bảo trì**
- Thời hạn bảo hành còn hay hết?
- Hợp đồng bảo trì:
  - ☐ Có ☐ Không
- Nếu có: thời gian kết thúc

**4.3. Vận hành**
- Ai đang vận hành hàng ngày?
- Có phụ thuộc nhà thầu không?
- Khi có sự cố, đơn vị có tự xử lý được không?

**📌 Mục tiêu**: Biết điểm phụ thuộc – điểm rủi ro dài hạn

---

#### PHẦN 5: KÊT NỐI & TÍCH HỢP

**5.1. Tích hợp nội bộ**
- Đã tích hợp với hệ thống nào trong Bộ?
- Hình thức tích hợp:
  - ☐ API
  - ☐ File
  - ☐ Thủ công

**5.2. Tích hợp bên ngoài**
- Có kết nối CSDLQG / hệ thống quốc gia không?
- Có kết nối địa phương / DN không?

**📌 Mục tiêu**: Nhìn ra điểm nghẽn liên thông

---

#### PHẦN 6: ĐÁNH GIÁ TỰ NHẬN DIỆN

Yêu cầu đơn vị tự trả lời ngắn gọn:
- Hệ thống này còn phù hợp 3–5 năm tới không?
- Điểm mạnh nhất là gì?
- Điểm yếu lớn nhất là gì?
- Nếu làm lại từ đầu, đơn vị muốn thay đổi điều gì?

**📌 Mục tiêu**: Lộ ra sự thật nhất

---

### B. LEVEL 2 - PHIẾU HỆ THỐNG CHI TIẾT (11 PHẦN)

Chi tiết đầy đủ cho thiết kế tổng thể. Bao gồm tất cả thông tin Level 1 cộng thêm:

#### Phần 1: Nhận dạng hệ thống (System Identity)
- Mã hệ thống, tên VN/EN
- Nhóm hệ thống: Nền tảng lõi / Nghiệp vụ / Cổng/DVC / Website / BI / ESB
- Đơn vị chủ quản nghiệp vụ (Business Owner)
- Đơn vị quản trị kỹ thuật (Technical Owner)
- Người phụ trách: Họ tên – chức vụ – SĐT – email
- Trạng thái: Đang vận hành / Thí điểm / Dừng / Sắp thay thế
- Ngày go-live, phiên bản, lịch sử nâng cấp

#### Phần 2: Mục tiêu – phạm vi – người dùng
- Mục tiêu nghiệp vụ (tối đa 5 gạch đầu dòng)
- Quy trình nghiệp vụ chính
- Đối tượng: Nội bộ (vai trò) / Bên ngoài (DN/dân/địa phương)
- Quy mô: Tổng tài khoản, MAU, DAU, số đơn vị tham gia
- Mức độ quan trọng (Criticality): Tối quan trọng / Quan trọng / Trung bình / Thấp

#### Phần 3: Kiến trúc ứng dụng
- Mô hình: Monolith / Modular / Microservices / Serverless / SaaS
- Phân lớp: Presentation / Business / Data / Integration
- Multi-tenant, Container (Docker/K8s)
- Frontend: framework + version
- Backend: ngôn ngữ + framework + version
- API: REST / GraphQL / gRPC / SOAP
- Messaging/Queue, Cache, Search, Reporting/BI
- Authentication: LDAP / AD / SSO / OIDC / SAML
- Mã nguồn: GitLab/GitHub/Bitbucket
- CI/CD: Jenkins/GitLab CI/Azure DevOps

#### Phần 4: CSDL & Mô hình dữ liệu
- DB chính: Oracle/SQL Server/PostgreSQL/MySQL/NoSQL (version)
- DB phụ, lưu file: File server / Object Storage / ECM
- Dung lượng DB, dung lượng file (GB/TB)
- Tốc độ tăng trưởng (GB/tháng hoặc %/năm)
- Số bản ghi, retention (lưu bao lâu)
- ERD, danh mục dùng chung, dữ liệu master
- Dữ liệu nhạy cảm/PII

#### Phần 5: Tích hợp – liên thông
- Danh mục tích hợp: Hệ thống A ↔ B, dữ liệu trao đổi
- Cách tích hợp: API / file / DB link / manual
- Tần suất: real-time / theo lô (giờ/ngày/tuần)
- Cơ chế retry, API doc
- API Inventory: Số API cung cấp/tiêu thụ, API gateway, versioning

#### Phần 6: Hạ tầng triển khai
- Môi trường: Dev / Test / Staging / Prod
- Nơi đặt: DC Bộ / Thuê ngoài / Cloud (AWS/Azure/GCP) / Hybrid
- Compute: VM, CPU/RAM, OS
- Network: VLAN, firewall, WAF, Domain, SSL
- Monitoring: Prometheus/Grafana/Zabbix/ELK
- Backup: cơ chế + chu kỳ + nơi lưu + test restore
- DR/BCP: site dự phòng, RPO/RTO

#### Phần 7: ATTT – an toàn hệ thống
- Phân loại theo cấp độ (1-5)
- Hồ sơ ATTT
- IAM: RBAC/ABAC
- Mã hóa: In transit (TLS), At rest (DB/file encryption)
- Log & audit: Lưu bao lâu, ai truy cập
- VAPT: Thời điểm, đơn vị thực hiện, lỗ hổng tồn đọng

#### Phần 8: Vận hành dịch vụ
- SLA yêu cầu: uptime %, thời gian phản hồi
- SLA thực tế 6 tháng: uptime %, số sự cố
- Ticket/tháng, MTTR
- ITSM: helpdesk, tool
- Runbook, trực 24/7

#### Phần 9: Nhân sự – nhà thầu – bảo hành
- Đội nội bộ: số người + vai trò (BA/Dev/QA/DevOps)
- Nhà thầu: Tên, hợp đồng số/ngày/giá trị, phạm vi
- Bảo hành/bảo trì: còn/hết, đến ngày nào
- Phụ thuộc nhà thầu: Cao / Trung bình / Thấp

#### Phần 10: Chi phí – tài sản
- Tổng chi phí đầu tư ban đầu
- Chi phí vận hành/năm: hạ tầng + license + O&M + nhân sự
- License: OS, DB, middleware, BI, security tools (loại, số lượng, hạn)

#### Phần 11: Đánh giá "khả năng hợp nhất"
- Điểm phù hợp: Dễ chuẩn hóa / API tốt / Dữ liệu rõ nguồn gốc / Tách dịch vụ được
- Điểm vướng: Công nghệ cũ / Không tài liệu / Không API / Dữ liệu không sạch / Phụ thuộc nhà thầu
- Đề xuất: Giữ nguyên / Nâng cấp / Thay thế / Hợp nhất vào nền tảng chung

---

## IV. PHỤ LỤC BẮT BUỘC ĐÍNH KÈM

(Nếu không có phải nói "KHÔNG CÓ")

1. Sơ đồ kiến trúc triển khai (logical + physical)
2. Sơ đồ luồng tích hợp (systems integration map)
3. Danh mục API (file Excel/CSV)
4. ERD / Data Dictionary (hoặc danh mục bảng chính)
5. Runbook / tài liệu vận hành
6. Hồ sơ ATTT / kết quả VAPT
7. Hợp đồng nhà thầu + phụ lục bảo hành/bảo trì (trích yếu)
8. Báo cáo sử dụng (DAU/MAU, số hồ sơ, 6 tháng gần nhất)

---

## V. OUTPUT YÊU CẦU

Hệ thống cần export:

### 1. Báo cáo Word
- Format theo 6 phần (Level 1) hoặc 11 phần (Level 2)
- Có header/footer: Logo Bộ, tên đơn vị, ngày
- Table of Contents tự động
- Hình ảnh/sơ đồ đính kèm

### 2. File Excel 3 Sheets

**Sheet 1 — System Inventory**
Columns:
- System_ID
- Tên hệ thống
- Chủ quản nghiệp vụ
- Quản trị kỹ thuật
- Nhóm hệ thống
- Trạng thái
- Go-live
- Criticality
- DAU/MAU
- Uptime 6 tháng
- Công nghệ chính (FE/BE)
- DB
- Hosting (onprem/cloud)
- Còn bảo hành? đến ngày
- Phụ thuộc nhà thầu (C/T/Thấp)

**Sheet 2 — Integration Inventory**
Columns:
- From_System
- To_System
- Data_Object
- Method (API/File/DB/Manual)
- Frequency
- Owner
- API_Doc_Link
- Issues

**Sheet 3 — Data Inventory**
Columns:
- Dataset_Name
- System_Source (system of record)
- Data_Type (master/transaction/report)
- Volume (GB/TB)
- Growth
- Sensitivity (PII/Confidential/Public)
- Sharing (Yes/No)
- Standard (code list)

---

## VI. QUY TẮC VALIDATION

**5 quy tắc bắt buộc**:

1. ❌ **KHÔNG** dùng từ chung chung ("hệ thống ổn định", "dữ liệu lớn")
   ✅ **BẮT BUỘC** có số cụ thể

2. ✅ Thông tin hợp đồng/bảo hành **PHẢI CÓ**:
   - Mã hợp đồng
   - Ngày hết hạn
   - Trạng thái (còn/hết)

3. ✅ Tích hợp **PHẢI LIỆT KÊ** theo từng luồng:
   - Hệ thống nguồn → đích
   - Dữ liệu trao đổi
   - Phương thức
   - KHÔNG nói chung chung "có tích hợp"

4. ✅ Dữ liệu **PHẢI CÓ**:
   - Dung lượng (GB/TB)
   - Tăng trưởng (%/năm hoặc GB/tháng)
   - Loại dữ liệu nhạy cảm (nếu có)

5. ✅ Nếu **KHÔNG CÓ** tài liệu:
   - Ghi rõ "KHÔNG CÓ"
   - Ghi lý do (chưa làm / mất / không bắt buộc)

---

## VII. WORKFLOW HỆ THỐNG

```
User (Đơn vị) Login
    ↓
Chọn Đơn vị / Tạo mới
    ↓
Thêm Hệ thống (có thể nhiều)
    ↓
Chọn Form Level (1 hoặc 2)
    ↓
Điền thông tin từng phần
    ↓
Upload attachments
    ↓
Lưu draft (có thể thoát, quay lại)
    ↓
Preview báo cáo
    ↓
Submit → Trạng thái: Submitted
    ↓
Export Word + Excel
    ↓
[Admin] Tổng hợp toàn bộ đơn vị
```

---

## VIII. PERSONAS

### 1. Admin (Bộ - vai trò Tổng Công Trình Sư)
**Mục tiêu**:
- Xem tổng quan tất cả hệ thống của tất cả đơn vị
- Dashboard analytics
- Export consolidated reports
- Phát hiện patterns, duplicates, issues

**Pain points cần giải quyết**:
- Dữ liệu phân tán, không thống nhất
- Không có bản đồ tổng thể
- Khó so sánh giữa các đơn vị
- Không biết integration map

### 2. Org Admin (Đơn vị trực thuộc)
**Mục tiêu**:
- Quản lý danh sách hệ thống của đơn vị mình
- Tạo/sửa/xóa systems
- Assign người nhập liệu
- Submit khi hoàn thành

**Pain points**:
- Nhiều hệ thống, khó theo dõi
- Không nhớ chi tiết kỹ thuật
- Cần hỏi người kỹ thuật

### 3. Technical Staff (Người nhập liệu)
**Mục tiêu**:
- Nhập thông tin kỹ thuật chính xác
- Upload documents
- Cần form rõ ràng, dễ hiểu

**Pain points**:
- Form quá dài, mất nhiều thời gian
- Không biết điền gì vào đâu
- Không có sẵn tài liệu/số liệu
- Sợ điền sai bị trách

---

## IX. SUCCESS CRITERIA

Hệ thống được coi là thành công khi:

✅ **Functional**:
1. Cho phép nhập đa hệ thống cho 1 đơn vị
2. Hỗ trợ cả Level 1 (6 phần) và Level 2 (11 phần)
3. Validation chặt chẽ theo 5 quy tắc
4. Upload & quản lý attachments
5. Export Word theo template chuẩn
6. Export Excel 3 sheets chính xác
7. Draft/Submit workflow hoạt động tốt

✅ **Non-functional**:
1. Form dễ nhập, UX tốt
2. Không bị mất dữ liệu khi thoát
3. Load nhanh (<2s cho form)
4. Export nhanh (<5s cho 1 báo cáo)
5. Responsive (desktop ưu tiên)

✅ **Business Impact**:
1. Thu thập đủ thông tin để vẽ bản đồ tổng thể
2. Dữ liệu chuẩn hóa, dễ phân tích
3. Tiết kiệm thời gian so với Word/Excel thủ công
4. Giảm sai sót nhờ validation

---

## X. OUT OF SCOPE (Không làm ở Phase 1)

❌ Real-time collaboration (nhiều người cùng nhập 1 form)
❌ Mobile app
❌ Advanced analytics / ML predictions
❌ Integration với hệ thống khác (chỉ là database độc lập)
❌ Notifications / Email alerts
❌ Workflow approval (chỉ có Submit, không có approve/reject)
❌ Version control cho từng lần chỉnh sửa
❌ Comments/Discussion threads

---

## XI. ASSUMPTIONS & DEPENDENCIES

**Assumptions**:
- Users có kiến thức kỹ thuật cơ bản về hệ thống của họ
- Có người phụ trách từng hệ thống
- Users làm việc trên desktop (không phải mobile)
- Internet ổn định
- Browser hiện đại (Chrome/Firefox/Edge)

**Dependencies**:
- PostgreSQL server available
- File storage (local hoặc S3-compatible)
- Python 3.10+ environment
- Node.js 18+ environment
- Infrastructure để deploy (server/cloud)

---

## XII. RISKS & MITIGATIONS

| Risk | Impact | Mitigation |
|------|--------|------------|
| Users không có số liệu chính xác | High | Cho phép "Ước tính", ghi chú rõ |
| Form quá dài, users bỏ dở | High | Save draft tự động, cho phép điền dần |
| Không có tài liệu đính kèm | Medium | Không bắt buộc, cho ghi "KHÔNG CÓ" |
| Validation quá chặt | Medium | Cho phép skip validation với lý do |
| Export Word lỗi format | Medium | Test kỹ với nhiều template |
| Database quá lớn | Low | PostgreSQL scale tốt, optimize queries |

---

## XIII. THAM KHẢO

**Tài liệu gốc**:
- File requirements từ user (nội dung đầu bài)
- CLAUDE.md (methodology, folder structure)

**Vị trí lưu trữ**:
- Project root: `/Users/shimazu/Dropbox/9. active/consultant/support_b4t/thong_ke_he_thong`
- Requirements: `04-task-definition/01-requirements.md` (file này)
- Architecture: `03-research/architecture-design.md`
- Tech stack: `02-principle-processes/tech-stack.md`
- Implementation: `08-backlog-plan/implementation-roadmap.md`
- Database: `07-resources/database-schema.sql`
