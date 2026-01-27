# Mô tả tính năng Dashboard chiến lược CDS
## Dành cho Bộ trưởng Bộ Khoa học và Công nghệ

**Ngày:** 26/01/2026
**Phiên bản:** 1.0
**Tài liệu:** Mô tả tính năng (Feature Description)

---

## 1. Dashboard chiến lược dùng để làm gì?

### 1.1 Mục đích chính

Dashboard chiến lược CDS là công cụ hỗ trợ Bộ trưởng **ra quyết định dựa trên dữ liệu** về toàn bộ hệ sinh thái công nghệ thông tin của Bộ Khoa học và Công nghệ.

Thay vì nhìn vào các báo cáo rời rạc, dashboard này tổng hợp toàn bộ thông tin về hàng trăm hệ thống phần mềm trong Bộ và trình bày theo cách giúp lãnh đạo:

- **Nhìn toàn cảnh** trong 30 giây
- **Phát hiện vấn đề** cần xử lý ngay
- **Tìm cơ hội** tối ưu, tiết kiệm
- **Ra chỉ đạo** có căn cứ

### 1.2 Các câu hỏi chiến lược mà dashboard trả lời

| Câu hỏi của Bộ trưởng | Dashboard cung cấp |
|----------------------|-------------------|
| "Tiền đổ vào đâu? Có hiệu quả không?" | Bản đồ phân bổ ngân sách theo đơn vị, hệ thống |
| "Hệ thống nào đang có vấn đề?" | Cảnh báo theo thời gian thực, danh sách hệ thống cần chú ý |
| "Có thể tích hợp, gom nhóm gì?" | Bản đồ kết nối hệ thống, đề xuất cơ hội tích hợp |
| "Chuyển đổi số đang ở đâu?" | Điểm số tiến độ, so sánh với mục tiêu |
| "Đơn vị nào làm tốt, ai cần hỗ trợ?" | Bảng xếp hạng đơn vị theo các tiêu chí |

### 1.3 Chu kỳ sử dụng

```
HÀNG NGÀY (5 phút)          HÀNG TUẦN (15 phút)         HÀNG THÁNG/QUÝ (30 phút)
─────────────────────       ─────────────────────       ─────────────────────────
• Kiểm tra sức khỏe         • Xem tiến độ dự án         • Đánh giá đầu tư
• Xử lý cảnh báo khẩn       • So sánh đơn vị            • Phê duyệt ngân sách
• Nắm tình hình chung       • Xem lại chỉ số            • Quyết định tích hợp
                                                         • Điều chỉnh chiến lược
```

---

## 2. Dashboard có những tính năng gì?

### 2.1 Cấu trúc 6 thẻ chức năng

```
┌─────────────────────────────────────────────────────────────────────────┐
│                     DASHBOARD CHIẾN LƯỢC CDS                            │
├─────────────────────────────────────────────────────────────────────────┤
│ [1. TỔNG QUAN] [2. ĐẦU TƯ] [3. TÍCH HỢP] [4. TỐI ƯU] [5. LỘ TRÌNH] [6. GIÁM SÁT] │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│                         NỘI DUNG CHÍNH                                  │
│                       (Thay đổi theo thẻ)                               │
│                                                                         │
├─────────────────────────────────────────────────────────────────────────┤
│ [TRUNG TÂM CẢNH BÁO - Thanh cố định phía dưới]                         │
│ Nghiêm trọng: 2 | Cảnh báo: 5 | Bấm để mở rộng                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### 2.2 Chi tiết từng tính năng

#### Thẻ 1: Tổng quan (Nhìn nhanh tình hình)

| Tính năng | Mô tả | Ưu tiên |
|-----------|-------|---------|
| **Điểm sức khỏe tổng thể** | Thang điểm 0-100, tổng hợp từ nhiều chỉ số | P0 |
| **Thẻ chỉ số chính** | Tổng hệ thống, ngân sách, sự cố, đơn vị | P0 |
| **Top 3 vấn đề cần xử lý** | Danh sách việc cần làm ngay | P0 |
| **Biểu đồ phân bổ trạng thái** | Tròn/cột theo trạng thái hệ thống | P1 |
| **Điểm chuyển đổi số** | So sánh với mục tiêu, xu hướng theo thời gian | P1 |

#### Thẻ 2: Đầu tư và ngân sách (Tiền đổ vào đâu?)

| Tính năng | Mô tả | Ưu tiên |
|-----------|-------|---------|
| **Bản đồ phân bổ ngân sách** | Biểu đồ Treemap theo đơn vị → hệ thống | P1 |
| **Phân tích hiệu quả chi phí** | Chi phí/người dùng, hệ thống chi nhiều dùng ít | P1 |
| **Phân tích khoảng cách đầu tư** | Đơn vị/lĩnh vực đầu tư chưa đủ | P2 |
| **Đề xuất ưu tiên đầu tư** | Gợi ý từ phân tích dữ liệu | P2 |

#### Thẻ 3: Tích hợp và liên thông (Hệ thống nào nên kết nối?)

| Tính năng | Mô tả | Ưu tiên |
|-----------|-------|---------|
| **Bản đồ mạng lưới tích hợp** | Đồ thị network hiển thị kết nối | P1 |
| **Phát hiện "ốc đảo dữ liệu"** | Hệ thống không kết nối với ai | P1 |
| **Đề xuất cơ hội tích hợp** | Gợi ý hệ thống nên kết nối | P2 |
| **Theo dõi chia sẻ dữ liệu** | Số lượng API, tỷ lệ thành công | P2 |

#### Thẻ 4: Tối ưu và hợp lý hóa (Cái gì thừa, trùng, nên bỏ?)

| Tính năng | Mô tả | Ưu tiên |
|-----------|-------|---------|
| **Phát hiện trùng lặp** | Hệ thống có chức năng giống nhau | P1 |
| **Radar hệ thống cũ** | Phân bổ tuổi, công nghệ lỗi thời | P1 |
| **Đề xuất tối ưu** | Giữ/nâng cấp/thay thế/hợp nhất | P2 |
| **Mô phỏng tiết kiệm** | Nếu làm X, tiết kiệm được Y | P2 |

#### Thẻ 5: Lộ trình và dự báo (Tương lai như thế nào?)

| Tính năng | Mô tả | Ưu tiên |
|-----------|-------|---------|
| **Lộ trình chuyển đổi số** | Biểu đồ Gantt các dự án | P1 |
| **Theo dõi danh mục dự án** | Trạng thái, ngân sách, tiến độ | P1 |
| **Radar xu hướng công nghệ** | Công nghệ nên áp dụng/thử nghiệm | P2 |
| **Dự báo năng lực** | Nhu cầu tương lai về hạ tầng, ngân sách | P2 |

#### Thẻ 6: Giám sát và đánh giá (Ai làm tốt?)

| Tính năng | Mô tả | Ưu tiên |
|-----------|-------|---------|
| **So sánh đơn vị** | Bảng xếp hạng, biểu đồ radar | P1 |
| **Theo dõi tuân thủ** | Điểm tuân thủ, lỗ hổng bảo mật | P1 |
| **Theo dõi danh mục dự án** | Tình trạng các dự án đang triển khai | P1 |

#### Tính năng xuyên suốt: Trung tâm cảnh báo

| Tính năng | Mô tả | Ưu tiên |
|-----------|-------|---------|
| **Cảnh báo theo thời gian thực** | Hệ thống quan trọng gặp sự cố | P0 |
| **Phân loại mức độ** | Nghiêm trọng / Cảnh báo / Thông tin | P0 |
| **Thao tác nhanh** | Xác nhận đã xem, chuyển tiếp | P1 |

---

## 3. Dữ liệu lấy từ đâu?

### 3.1 Dữ liệu hiện có trong hệ thống

Hệ thống hiện tại đã thu thập rất nhiều thông tin về mỗi hệ thống phần mềm:

#### Bảng System (Hệ thống chính)
```
✅ Thông tin cơ bản
   - Mã hệ thống, tên, mục đích
   - Đơn vị quản lý (org)
   - Phạm vi sử dụng (nội bộ/toàn Bộ/bên ngoài)
   - Trạng thái (đang vận hành/thí điểm/dừng...)
   - Mức độ quan trọng (cao/trung bình/thấp)

✅ Kiến trúc công nghệ
   - Ngôn ngữ lập trình, framework
   - Cơ sở dữ liệu
   - Nền tảng (cloud/on-premise/hybrid)

✅ Tích hợp
   - Danh sách hệ thống tích hợp nội bộ
   - Danh sách hệ thống tích hợp bên ngoài
   - Danh sách API
   - Số API cung cấp/sử dụng

✅ Người dùng
   - Tổng số người dùng
   - Số tài khoản
   - Người dùng hoạt động hàng tháng (MAU)
   - Người dùng hoạt động hàng ngày (DAU)

✅ Bảo mật
   - Phương thức xác thực
   - Mã hóa dữ liệu
   - Mức độ an toàn thông tin (1-5)

✅ Vận hành
   - Ngày đưa vào sử dụng
   - Phiên bản hiện tại
   - Người phụ trách
```

#### Bảng SystemArchitecture (Kiến trúc)
```
✅ Kiến trúc hệ thống
   - Loại kiến trúc (monolithic/microservices/serverless...)
   - Công nghệ backend/frontend
   - Ứng dụng di động

✅ Công cụ phát triển
   - Kho mã nguồn (GitLab/GitHub...)
   - Quy trình CI/CD
   - Kiểm thử tự động
```

#### Bảng SystemCost (Chi phí - Level 2)
```
✅ Chi phí đầu tư ban đầu
✅ Chi phí bản quyền hàng năm
✅ Chi phí bảo trì hàng năm
✅ Chi phí hạ tầng hàng năm
✅ Chi phí nhân sự hàng năm
✅ Tổng chi phí sở hữu (TCO)
```

#### Bảng SystemIntegration (Tích hợp)
```
✅ Có tích hợp hay không
✅ Số lượng tích hợp
✅ Loại tích hợp (API/ESB/file/database)
✅ Hệ thống kết nối nội bộ
✅ Hệ thống kết nối bên ngoài
✅ Có API Gateway không
✅ Có giám sát tích hợp không
```

#### Bảng SystemIntegrationConnection (Chi tiết tích hợp)
```
✅ Hệ thống nguồn → Hệ thống đích
✅ Dữ liệu trao đổi
✅ Phương thức tích hợp
✅ Tần suất
✅ Xử lý lỗi
```

#### Bảng SystemAssessment (Đánh giá)
```
✅ Điểm hiệu năng
✅ Tỷ lệ uptime
✅ Điểm hài lòng người dùng
✅ Mức độ nợ kỹ thuật
✅ Cần thay thế không
✅ Đề xuất (giữ/nâng cấp/thay thế/hợp nhất)
```

### 3.2 Nguồn dữ liệu cho Dashboard

```
┌─────────────────────────────────────────────────────────────────┐
│                    NGUỒN DỮ LIỆU DASHBOARD                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────┐     ┌─────────────────┐                   │
│  │  CƠ SỞ DỮ LIỆU  │     │   API BACKEND   │                   │
│  │   POSTGRESQL    │────▶│    /api/v1/     │                   │
│  └─────────────────┘     └────────┬────────┘                   │
│                                   │                             │
│         ┌─────────────────────────┼─────────────────────────┐   │
│         │                         ▼                         │   │
│         │  ┌─────────────────────────────────────────────┐ │   │
│         │  │           DASHBOARD FRONTEND                │ │   │
│         │  │                                             │ │   │
│         │  │  • Tổng hợp từ bảng systems                 │ │   │
│         │  │  • Tổng hợp từ bảng system_cost             │ │   │
│         │  │  • Tổng hợp từ bảng system_integration      │ │   │
│         │  │  • Tổng hợp từ bảng system_assessment       │ │   │
│         │  │  • Tổng hợp từ bảng organizations           │ │   │
│         │  │                                             │ │   │
│         │  └─────────────────────────────────────────────┘ │   │
│         │                                                   │   │
│         └───────────────────────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 4. Các trường yêu cầu hiện tại đã đủ chưa?

### 4.1 Đánh giá tổng quan

| Nhóm tính năng | Dữ liệu hiện có | Đánh giá | Ghi chú |
|----------------|-----------------|----------|---------|
| **Tổng quan** | 70% | Gần đủ | Thiếu điểm sức khỏe tổng hợp |
| **Đầu tư** | 60% | Cần bổ sung | Chỉ Level 2 có chi phí |
| **Tích hợp** | 80% | Khá đủ | Có đầy đủ kết nối |
| **Tối ưu** | 50% | Cần bổ sung | Thiếu phát hiện trùng lặp |
| **Lộ trình** | 20% | Thiếu nhiều | Không có bảng dự án |
| **Giám sát** | 40% | Cần bổ sung | Thiếu cảnh báo, sự cố |

### 4.2 Dữ liệu CẦN BỔ SUNG

#### 4.2.1 Bảng mới: Ngân sách theo năm (budget_allocations)

**Lý do:** Hiện tại chi phí chỉ có ở Level 2, và không theo dõi theo năm.

```python
class BudgetAllocation(models.Model):
    """Phân bổ ngân sách theo năm"""

    system = models.ForeignKey('System', on_delete=models.CASCADE)
    year = models.IntegerField()  # 2024, 2025, 2026...

    # Loại ngân sách
    CATEGORY_CHOICES = [
        ('development', 'Phát triển mới'),
        ('maintenance', 'Bảo trì'),
        ('license', 'Bản quyền'),
        ('infrastructure', 'Hạ tầng'),
        ('training', 'Đào tạo'),
    ]
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES)

    # Số tiền
    planned_amount = models.DecimalField(...)  # Kế hoạch
    actual_amount = models.DecimalField(...)   # Thực tế

    class Meta:
        unique_together = ['system', 'year', 'category']
```

#### 4.2.2 Bảng mới: Sự cố (incidents)

**Lý do:** Cần theo dõi sự cố để tính điểm sức khỏe và gửi cảnh báo.

```python
class Incident(models.Model):
    """Sự cố hệ thống"""

    system = models.ForeignKey('System', on_delete=models.CASCADE)

    # Mức độ nghiêm trọng
    SEVERITY_CHOICES = [
        ('critical', 'Nghiêm trọng'),
        ('high', 'Cao'),
        ('medium', 'Trung bình'),
        ('low', 'Thấp'),
    ]
    severity = models.CharField(max_length=20, choices=SEVERITY_CHOICES)

    # Trạng thái
    STATUS_CHOICES = [
        ('open', 'Đang mở'),
        ('in_progress', 'Đang xử lý'),
        ('resolved', 'Đã giải quyết'),
        ('closed', 'Đã đóng'),
    ]
    status = models.CharField(max_length=20, choices=STATUS_CHOICES)

    # Thông tin sự cố
    title = models.CharField(max_length=255)
    description = models.TextField()
    reported_at = models.DateTimeField()
    resolved_at = models.DateTimeField(null=True)
    resolution_notes = models.TextField(blank=True)
```

#### 4.2.3 Bảng mới: Dự án (projects)

**Lý do:** Cần theo dõi các dự án chuyển đổi số để hiển thị lộ trình.

```python
class Project(models.Model):
    """Dự án CNTT"""

    name = models.CharField(max_length=255)
    description = models.TextField()

    # Loại dự án
    TYPE_CHOICES = [
        ('new_development', 'Phát triển mới'),
        ('upgrade', 'Nâng cấp'),
        ('integration', 'Tích hợp'),
        ('migration', 'Di chuyển'),
        ('modernization', 'Hiện đại hóa'),
    ]
    project_type = models.CharField(max_length=50, choices=TYPE_CHOICES)

    # Trạng thái
    STATUS_CHOICES = [
        ('planning', 'Lập kế hoạch'),
        ('in_progress', 'Đang triển khai'),
        ('on_hold', 'Tạm dừng'),
        ('completed', 'Hoàn thành'),
        ('cancelled', 'Hủy bỏ'),
    ]
    status = models.CharField(max_length=20, choices=STATUS_CHOICES)

    # Thời gian
    start_date = models.DateField()
    end_date = models.DateField()
    actual_end_date = models.DateField(null=True)

    # Ngân sách
    planned_budget = models.DecimalField(...)
    actual_budget = models.DecimalField(...)

    # Tiến độ
    progress_percent = models.IntegerField(default=0)  # 0-100

    # Hệ thống liên quan
    systems = models.ManyToManyField('System', related_name='projects')

    # Đơn vị thực hiện
    organization = models.ForeignKey('Organization', on_delete=models.CASCADE)
```

#### 4.2.4 Bảng mới: Cảnh báo (alerts)

**Lý do:** Lưu trữ cảnh báo để hiển thị ở Trung tâm cảnh báo.

```python
class Alert(models.Model):
    """Cảnh báo hệ thống"""

    # Loại cảnh báo
    TYPE_CHOICES = [
        ('system_down', 'Hệ thống ngừng hoạt động'),
        ('security', 'Bảo mật'),
        ('performance', 'Hiệu năng'),
        ('budget_overrun', 'Vượt ngân sách'),
        ('deadline', 'Sắp đến hạn'),
        ('compliance', 'Tuân thủ'),
    ]
    alert_type = models.CharField(max_length=50, choices=TYPE_CHOICES)

    # Mức độ
    SEVERITY_CHOICES = [
        ('critical', 'Nghiêm trọng'),
        ('warning', 'Cảnh báo'),
        ('info', 'Thông tin'),
    ]
    severity = models.CharField(max_length=20, choices=SEVERITY_CHOICES)

    # Nội dung
    title = models.CharField(max_length=255)
    message = models.TextField()

    # Liên kết
    system = models.ForeignKey('System', null=True, on_delete=models.CASCADE)
    organization = models.ForeignKey('Organization', null=True, on_delete=models.CASCADE)
    project = models.ForeignKey('Project', null=True, on_delete=models.CASCADE)

    # Trạng thái
    is_read = models.BooleanField(default=False)
    is_acknowledged = models.BooleanField(default=False)
    acknowledged_by = models.ForeignKey('User', null=True, on_delete=models.SET_NULL)
    acknowledged_at = models.DateTimeField(null=True)

    # Thời gian
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField(null=True)
```

#### 4.2.5 Trường bổ sung vào bảng System

**Lý do:** Một số trường cần thêm để tính toán cho dashboard.

```python
# Thêm vào model System

# Điểm số tính toán
health_score = models.IntegerField(null=True, blank=True)  # 0-100, tính từ nhiều yếu tố

# Phân loại công nghệ
technology_age = models.CharField(
    max_length=20,
    choices=[
        ('current', 'Hiện đại (< 3 năm)'),
        ('aging', 'Đang cũ (3-5 năm)'),
        ('legacy', 'Cũ (5-10 năm)'),
        ('obsolete', 'Lỗi thời (> 10 năm)'),
    ],
    blank=True
)

# Nhóm chức năng (để phát hiện trùng lặp)
functional_category = models.CharField(
    max_length=50,
    choices=[
        ('hr', 'Quản lý nhân sự'),
        ('finance', 'Tài chính kế toán'),
        ('document', 'Quản lý văn bản'),
        ('crm', 'Quản lý khách hàng'),
        ('project', 'Quản lý dự án'),
        ('reporting', 'Báo cáo thống kê'),
        ('portal', 'Cổng thông tin'),
        ('other', 'Khác'),
    ],
    blank=True
)
```

### 4.3 Tóm tắt dữ liệu cần bổ sung

| STT | Nội dung | Loại | Mức ưu tiên | Ghi chú |
|-----|----------|------|-------------|---------|
| 1 | Bảng BudgetAllocation | Bảng mới | P1 | Theo dõi ngân sách theo năm |
| 2 | Bảng Incident | Bảng mới | P0 | Theo dõi sự cố |
| 3 | Bảng Project | Bảng mới | P1 | Theo dõi dự án chuyển đổi số |
| 4 | Bảng Alert | Bảng mới | P0 | Lưu trữ cảnh báo |
| 5 | Trường health_score | Trường mới | P0 | Điểm sức khỏe tổng hợp |
| 6 | Trường technology_age | Trường mới | P1 | Phân loại tuổi công nghệ |
| 7 | Trường functional_category | Trường mới | P1 | Nhóm chức năng để phát hiện trùng lặp |

---

## 5. Lộ trình triển khai đề xuất

### Giai đoạn 1: Nền tảng (4-6 tuần)

**Mục tiêu:** Dashboard hoạt động cơ bản với dữ liệu hiện có.

```
✅ Thẻ Tổng quan
   - Thẻ chỉ số chính (từ dữ liệu có sẵn)
   - Biểu đồ phân bổ trạng thái
   - Danh sách cảnh báo đơn giản

✅ Thẻ Giám sát (một phần)
   - Bảng so sánh đơn vị
   - Xếp hạng cơ bản

✅ Bổ sung dữ liệu
   - Bảng Alert
   - Trường health_score
```

### Giai đoạn 2: Đầu tư và tối ưu (6-8 tuần)

**Mục tiêu:** Phân tích chi phí và phát hiện cơ hội tối ưu.

```
✅ Thẻ Đầu tư
   - Bản đồ phân bổ ngân sách
   - Phân tích hiệu quả chi phí

✅ Thẻ Tối ưu
   - Radar hệ thống cũ
   - Phát hiện trùng lặp

✅ Bổ sung dữ liệu
   - Bảng BudgetAllocation
   - Trường technology_age
   - Trường functional_category
```

### Giai đoạn 3: Tích hợp và lộ trình (6-8 tuần)

**Mục tiêu:** Nhìn toàn cảnh kết nối và theo dõi dự án.

```
✅ Thẻ Tích hợp
   - Bản đồ mạng lưới tích hợp
   - Phát hiện ốc đảo dữ liệu
   - Theo dõi chia sẻ dữ liệu

✅ Thẻ Lộ trình
   - Biểu đồ Gantt dự án
   - Theo dõi danh mục dự án

✅ Bổ sung dữ liệu
   - Bảng Project
   - Bảng Incident
```

### Giai đoạn 4: Nâng cao (8-12 tuần)

**Mục tiêu:** Tính năng thông minh và đề xuất tự động.

```
✅ Đề xuất cơ hội tích hợp (phân tích dữ liệu)
✅ Đề xuất tối ưu (phân tích dữ liệu)
✅ Mô phỏng kịch bản
✅ Truy vấn bằng ngôn ngữ tự nhiên
```

---

## 6. Kết luận

### 6.1 Điểm mạnh của dữ liệu hiện có

- Đã thu thập đầy đủ thông tin kỹ thuật về hệ thống
- Có thông tin tích hợp chi tiết (SystemIntegrationConnection)
- Có đánh giá và đề xuất từ đơn vị (SystemAssessment)
- Có chi phí (dù chỉ Level 2)

### 6.2 Điểm cần bổ sung

- **Quan trọng nhất:** Bảng Alert và Incident để có cảnh báo theo thời gian thực
- **Quan trọng:** Bảng Project để theo dõi lộ trình chuyển đổi số
- **Hữu ích:** Bảng BudgetAllocation để theo dõi ngân sách theo năm
- **Hữu ích:** Các trường phân loại để phát hiện trùng lặp, công nghệ cũ

### 6.3 Khuyến nghị

1. **Bắt đầu với dữ liệu có sẵn** - Giai đoạn 1 có thể triển khai ngay
2. **Bổ sung dữ liệu song song** - Trong khi phát triển, yêu cầu đơn vị cập nhật thêm
3. **Tích hợp dần** - Không cần hoàn hảo từ đầu, bổ sung theo từng giai đoạn

---

*"Từ DỮ LIỆU đến HIỂU BIẾT, từ HIỂU BIẾT đến QUYẾT ĐỊNH, từ QUYẾT ĐỊNH đến HÀNH ĐỘNG."*
