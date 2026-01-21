# HƯỚNG DẪN CẤU HÌNH DOMAIN MỚI: hientrangcds.mst.gov.vn

## ✅ ĐÃ HOÀN THÀNH

- ✅ Tạo 34 organizations và 34 users (password: `ThongkeCDS@2026#`)
- ✅ Cấu hình nginx cho domain `hientrangcds.mst.gov.vn`
- ✅ Nginx đã reload thành công

## 📋 THÔNG TIN CẦN GỬI CHO ĐƠN VỊ QUẢN LÝ DOMAIN (.mst.gov.vn)

Gửi email hoặc công văn đến đơn vị quản lý domain `mst.gov.vn` với nội dung sau:

---

**Tiêu đề**: Yêu cầu cấu hình DNS cho subdomain hientrangcds.mst.gov.vn

**Nội dung**:

Kính gửi đơn vị quản lý domain mst.gov.vn,

Trung tâm CNTT - Bộ KH&CN đề nghị quý đơn vị hỗ trợ cấu hình DNS cho subdomain sau:

### 1. Thông tin subdomain

- **Subdomain**: `hientrangcds.mst.gov.vn`
- **Mục đích**: Hệ thống Khảo sát CĐS trực tuyến
- **Đơn vị quản lý**: Trung tâm CNTT - Bộ KH&CN

### 2. Yêu cầu cấu hình DNS

#### Phương án 1: A Record (Khuyến nghị)

```
Type: A
Host: hientrangcds
Value: 34.142.152.104
TTL: 3600 (1 hour)
```

#### Phương án 2: CNAME Record

```
Type: CNAME
Host: hientrangcds
Value: thongkehethong.mindmaid.ai
TTL: 3600 (1 hour)
```

**Lưu ý**: Nếu dùng CNAME, cần đảm bảo `thongkehethong.mindmaid.ai` luôn hoạt động ổn định.

### 3. Thông tin máy chủ

- **IP Address**: 34.142.152.104
- **Location**: Google Cloud Platform (GCP), asia-southeast1
- **Nginx config**: Đã cấu hình sẵn
- **SSL Certificate**: Sẽ cấu hình qua Let's Encrypt sau khi DNS được trỏ thành công

### 4. Thời gian dự kiến

Sau khi DNS được cấu hình, cần **24-48 giờ** để DNS lan truyền toàn cầu. Tuy nhiên, trong môi trường nội bộ Việt Nam, thường chỉ mất **1-2 giờ**.

---

## 🔧 CÁC BƯỚC SAU KHI ĐƠN VỊ ĐÃ CẤU HÌNH DNS

### Bước 1: Kiểm tra DNS đã hoạt động chưa

```bash
# Trên máy local
nslookup hientrangcds.mst.gov.vn

# Hoặc dùng dig
dig hientrangcds.mst.gov.vn +short

# Kết quả mong đợi
34.142.152.104
```

Nếu chưa thấy IP, đợi thêm 1-2 giờ và kiểm tra lại.

### Bước 2: Test HTTP (chưa có SSL)

Sau khi DNS đã trỏ về đúng IP:

```bash
curl -I http://hientrangcds.mst.gov.vn/health
```

Kết quả mong đợi:
```
HTTP/1.1 200 OK
```

Hoặc mở browser: http://hientrangcds.mst.gov.vn (cảnh báo "Not Secure" là bình thường vì chưa có SSL)

### Bước 3: Cấu hình SSL với Let's Encrypt

Khi DNS đã hoạt động ổn định (test được qua HTTP), chạy certbot để lấy SSL certificate:

```bash
# SSH vào server
ssh admin_@34.142.152.104

# Chạy certbot
sudo certbot --nginx -d hientrangcds.mst.gov.vn

# Certbot sẽ hỏi:
# - Email: admin@aivgroup.vn (hoặc email khác)
# - Terms of Service: Yes
# - Share email: No
# - Redirect HTTP to HTTPS: Yes (khuyến nghị)
```

**Kết quả**: Certbot sẽ tự động:
- Lấy SSL certificate từ Let's Encrypt
- Sửa nginx config để thêm SSL
- Thêm auto-redirect từ HTTP → HTTPS
- Cấu hình auto-renewal certificate (mỗi 90 ngày)

### Bước 4: Verify SSL đã hoạt động

```bash
# Test HTTPS
curl -I https://hientrangcds.mst.gov.vn/health

# Kết quả mong đợi
HTTP/2 200
```

Mở browser: https://hientrangcds.mst.gov.vn → Hiển thị khóa xanh (Secure)

## 🔐 THÔNG TIN SSL CERTIFICATE (SAU KHI CẤU HÌNH)

Sau khi chạy certbot thành công, thông tin SSL:

- **Certificate Authority**: Let's Encrypt
- **Certificate Type**: DV (Domain Validated)
- **Validity**: 90 days (tự động gia hạn)
- **Certificate Location**: `/etc/letsencrypt/live/hientrangcds.mst.gov.vn/`
- **Files**:
  - `fullchain.pem` - Certificate chain
  - `privkey.pem` - Private key
  - `cert.pem` - Certificate only
  - `chain.pem` - Intermediate certificates

## 📊 KIỂM TRA TỰ ĐỘNG GIA HẠN SSL

Certbot tự động cấu hình cron job để gia hạn certificate:

```bash
# Kiểm tra cronjob
sudo systemctl list-timers | grep certbot

# Test dry-run renewal
sudo certbot renew --dry-run
```

Nếu không có lỗi → Auto-renewal đã được cấu hình đúng.

## 🌐 THÔNG TIN HỆ THỐNG ĐÃ CẤU HÌNH

### Domains hiện tại

| Domain | Purpose | SSL Status |
|--------|---------|------------|
| `thongkehethong.mindmaid.ai` | Production (Cloudflare CDN) | ✅ Active |
| `hientrangcds.mst.gov.vn` | Production (direct nginx) | ⏳ Pending DNS |

### Backend & Frontend

- **Backend API**: `http://localhost:8000`
- **Frontend**: `http://localhost:3000` (Docker container)
- **Docker compose**: `/home/admin_/apps/thong-ke-he-thong/`

### 34 Organizations & Users

| Info | Value |
|------|-------|
| Total organizations | 34 |
| Total users | 34 + 1 admin = 35 |
| Common password | `ThongkeCDS@2026#` |
| User role | `unit_user` |
| Excel file | `03-research/danh-sach-tai-khoan-don-vi.xlsx` |

## ❓ FAQ

### Q1: DNS mất bao lâu để lan truyền?
**A**: Thông thường 1-2 giờ trong Việt Nam, tối đa 24-48 giờ toàn cầu.

### Q2: Có thể dùng cả 2 domain cùng lúc không?
**A**: Có, cả 2 domain đều trỏ về cùng backend/frontend. Nginx sẽ xử lý dựa trên `server_name`.

### Q3: Nếu SSL auto-renewal fail thì sao?
**A**: Certbot sẽ gửi email cảnh báo trước 20 ngày. Có thể manually renew bằng `sudo certbot renew`.

### Q4: Làm sao biết certbot đã cài chưa?
**A**: Chạy `certbot --version`. Nếu chưa cài:
```bash
sudo apt update && sudo apt install certbot python3-certbot-nginx -y
```

### Q5: Có thể dùng Cloudflare cho domain mst.gov.vn không?
**A**: Không, vì mst.gov.vn do đơn vị khác quản lý. Chỉ quản lý được `hientrangcds` subdomain.

## 🚨 LƯU Ý QUAN TRỌNG

1. **Chỉ chạy certbot SAU KHI DNS đã trỏ đúng về server**
   - Nếu chạy trước, certbot sẽ fail vì không verify được domain ownership

2. **Firewall phải mở port 80 và 443**
   ```bash
   sudo ufw status
   # Nếu chưa mở:
   sudo ufw allow 80/tcp
   sudo ufw allow 443/tcp
   ```

3. **Không xóa thư mục `/etc/letsencrypt/`**
   - Chứa certificate và renewal config

4. **Backup nginx config trước khi chạy certbot**
   ```bash
   sudo cp /etc/nginx/sites-available/hientrangcds.mst.gov.vn \
           /etc/nginx/sites-available/hientrangcds.mst.gov.vn.backup
   ```

## 📞 HỖ TRỢ

### Nếu gặp vấn đề DNS:
- Liên hệ đơn vị quản lý domain mst.gov.vn
- Cung cấp thông tin: subdomain `hientrangcds`, IP `34.142.152.104`

### Nếu gặp vấn đề SSL:
- Check nginx logs: `sudo tail -f /var/log/nginx/error.log`
- Check certbot logs: `sudo tail -f /var/log/letsencrypt/letsencrypt.log`

### Nếu gặp vấn đề application:
- Check backend: `docker compose logs backend`
- Check frontend: `docker compose logs frontend`

## ✅ CHECKLIST HOÀN THÀNH

### Phần đơn vị quản lý domain cần làm:
- [ ] Cấu hình DNS A record (hientrangcds → 34.142.152.104)
- [ ] Confirm đã config xong (thông báo qua email/công văn)

### Phần chúng ta cần làm sau khi DNS đã trỏ:
- [ ] Kiểm tra DNS với `nslookup` hoặc `dig`
- [ ] Test HTTP: `curl http://hientrangcds.mst.gov.vn/health`
- [ ] Chạy certbot để lấy SSL certificate
- [ ] Test HTTPS: `curl https://hientrangcds.mst.gov.vn/health`
- [ ] Verify SSL trên browser (khóa xanh)
- [ ] Test auto-renewal: `sudo certbot renew --dry-run`
- [ ] Gửi danh sách 34 accounts cho các đơn vị

---

## 📧 DRAFT EMAIL GỬI CHO ĐƠN VỊ QUẢN LÝ DOMAIN

```
To: [Email đơn vị quản lý mst.gov.vn]
Subject: Yêu cầu cấu hình DNS subdomain hientrangcds.mst.gov.vn

Kính gửi Quý đơn vị,

Trung tâm Công nghệ thông tin - Bộ Khoa học và Công nghệ đề nghị
Quý đơn vị hỗ trợ cấu hình DNS cho subdomain:

- Subdomain: hientrangcds.mst.gov.vn
- Loại record: A Record
- IP Address: 34.142.152.104
- TTL: 3600

Mục đích: Triển khai Hệ thống Khảo sát CĐS trực tuyến phục vụ
công tác báo cáo và thống kê của Bộ.

Trân trọng cảm ơn.

---
Trung tâm Công nghệ thông tin
Bộ Khoa học và Công nghệ
```

---

**Tóm tắt**: Nginx đã sẵn sàng, chỉ cần đợi DNS được cấu hình, sau đó chạy certbot để có SSL.
