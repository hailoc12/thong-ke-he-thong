# Hướng dẫn Xóa Cache Cloudflare Thủ Công

## ⚠️ VẤN ĐỀ

API Token không có quyền xóa cache. Bạn cần xóa cache thủ công qua Cloudflare Dashboard.

## 🚀 GIẢI PHÁP NHANH: BẬT DEVELOPMENT MODE (3 giờ)

Development Mode tạm thời bypass cache trong 3 giờ - đủ để test và verify bug fix.

### Các Bước:

1. **Login Cloudflare Dashboard**
   - URL: https://dash.cloudflare.com/login
   - Dùng tài khoản: Admin@aivgroup.vn

2. **Chọn Domain**
   - Click vào domain: **mindmaid.ai**

3. **Bật Development Mode**
   - Sidebar trái → Click: **Caching** → **Configuration**
   - Tìm section: **Development Mode**
   - Toggle switch: **ON** (màu cam)
   - Confirm: **Enable Development Mode**

4. **Verify**
   - Development Mode sẽ active trong **3 giờ**
   - Trong thời gian này, Cloudflare sẽ bypass cache
   - User sẽ thấy code mới ngay lập tức

### Screenshot Path:
```
Cloudflare Dashboard
  → Select: mindmaid.ai
  → Sidebar: Caching
  → Tab: Configuration
  → Section: Development Mode
  → Toggle: ON
```

---

## 🔥 GIẢI PHÁP DÀI HẠN: XÓA CACHE HOÀN TOÀN

### Option 1: Purge Everything (Khuyến nghị)

1. **Login Cloudflare Dashboard**
   - https://dash.cloudflare.com/login

2. **Chọn Domain**
   - Click: **mindmaid.ai**

3. **Purge Cache**
   - Sidebar: **Caching** → **Configuration**
   - Tìm button: **Purge Everything** (màu đỏ)
   - Click: **Purge Everything**
   - Confirm popup: **Purge Everything**

4. **Kết quả**
   - ✅ Toàn bộ cache bị xóa
   - ✅ User sẽ tải code mới ngay lập tức
   - ⚠️ Website có thể load chậm hơn trong vài phút đầu (Cloudflare đang rebuild cache)

### Option 2: Purge By URL (Chỉ xóa trang cụ thể)

1. **Login Cloudflare → mindmaid.ai**

2. **Purge Custom URLs**
   - Caching → Configuration
   - Click: **Custom Purge** button
   - Select: **Purge by URL**

3. **Nhập URLs cần xóa**:
   ```
   https://thongkehethong.mindmaid.ai/
   https://thongkehethong.mindmaid.ai/index.html
   https://thongkehethong.mindmaid.ai/assets/index-RL5Jub9O.js
   https://thongkehethong.mindmaid.ai/systems/create
   ```

4. **Submit**
   - Click: **Purge**

---

## 📋 TẠO API TOKEN MỚI (Có quyền xóa cache)

Để tránh phải purge thủ công trong tương lai, tạo API token mới:

### Các Bước:

1. **Cloudflare Dashboard**
   - https://dash.cloudflare.com/profile/api-tokens

2. **Create Token**
   - Click: **Create Token**
   - Chọn template: **Edit zone** (hoặc Create Custom Token)

3. **Permissions**
   - **Zone** → **Cache Purge** → **Purge**
   - **Zone** → **Zone** → **Read**

4. **Zone Resources**
   - Include: **Specific zone** → **mindmaid.ai**

5. **Create & Copy Token**
   - Click: **Continue to summary**
   - Click: **Create Token**
   - ⚠️ Copy token ngay (chỉ hiển thị 1 lần)

### Test Token:

```bash
# Lưu token vào biến
export CF_TOKEN="<token_mới>"

# Test purge cache
curl -X POST "https://api.cloudflare.com/client/v4/zones/8f9647a1fa11089a450b6de7374623f1/purge_cache" \
  -H "Authorization: Bearer $CF_TOKEN" \
  -H "Content-Type: application/json" \
  --data '{"purge_everything":true}'
```

**Expected Response:**
```json
{
  "success": true,
  "errors": [],
  "messages": [],
  "result": {
    "id": "..."
  }
}
```

---

## ✅ VERIFY BUG FIX SAU KHI XÓA CACHE

### 1. Hard Refresh Browser
- **Chrome/Edge**: `Ctrl + Shift + R` (Windows) hoặc `Cmd + Shift + R` (Mac)
- **Firefox**: `Ctrl + F5` hoặc `Cmd + Shift + R`

### 2. Check Network Requests (F12 → Network tab)

Tìm request đến JS bundle:
```
✅ Đúng: GET /assets/index-BuLp4OmL.js [200]  ← Bundle MỚI
❌ Sai:  GET /assets/index-RL5Jub9O.js [200]  ← Bundle CŨ (vẫn bị cache)
```

### 3. Test Form Tab 3

Mở: https://thongkehethong.mindmaid.ai/systems/create

- Click tab: **Kiến trúc công nghệ**
- Kiểm tra 4 fields:

| Field | Đúng (Fixed) | Sai (Old) |
|-------|--------------|-----------|
| **Ngôn ngữ lập trình** | Dropdown 1 lựa chọn | Checkboxes nhiều lựa chọn |
| **Framework/Thư viện** | Dropdown 1 lựa chọn | Checkboxes nhiều lựa chọn |
| **Cơ sở dữ liệu** | Dropdown 1 lựa chọn | Checkboxes nhiều lựa chọn |
| **Nền tảng triển khai** | Dropdown (3 options) | Checkboxes (7 options) |

### 4. Test Save

- Chọn values trong 4 dropdowns
- Click: **Lưu & Tiếp tục**
- **Kết quả mong đợi**:
  - ✅ Lưu thành công
  - ✅ Chuyển sang Tab 4
  - ❌ **KHÔNG** có validation errors

---

## 🔧 NGINX ĐÃ CẬP NHẬT

Deploy mới nhất đã thêm headers để Cloudflare bypass cache cho các request sau:

```nginx
location / {
    add_header Cache-Control "no-store, no-cache, must-revalidate";
    add_header CDN-Cache-Control "no-cache";
    add_header Cloudflare-CDN-Cache-Control "no-cache";
    add_header Pragma "no-cache";
}
```

**Lưu ý**: Headers này chỉ áp dụng cho **requests mới** sau khi xóa cache. Cache hiện tại vẫn tồn tại cho đến khi được xóa hoặc expire.

---

## 📊 SUMMARY

| Phương án | Thời gian | Khuyến nghị |
|-----------|-----------|-------------|
| **Development Mode** | Bật trong 3 giờ | ✅ Nhanh nhất, test ngay |
| **Purge Everything** | Ngay lập tức | ✅ Dài hạn, xóa sạch |
| **Purge By URL** | Ngay lập tức | ⚠️ Cần list đủ URLs |
| **Chờ Cache Expire** | Không rõ (24h?) | ❌ Không khuyến nghị |

## 🎯 NEXT STEPS

1. ✅ **BẬT DEVELOPMENT MODE NGAY** (3 giờ để test)
2. ✅ Test xem bug fix hoạt động
3. ✅ Sau đó **PURGE EVERYTHING** để dài hạn
4. ✅ Tạo API token mới có quyền purge cache

---

## ⚠️ LƯU Ý QUAN TRỌNG

- **Development Mode** chỉ tồn tại 3 giờ → phải purge cache sau đó
- **Purge Everything** an toàn, không làm mất data, chỉ xóa cache
- Sau purge, website có thể load chậm 1-2 phút (Cloudflare rebuild cache)
- Nginx config mới đảm bảo không bị cache trong tương lai

---

## 🆘 SUPPORT

Nếu gặp issue:

1. Check Development Mode có đang ON không
2. Check network requests trong DevTools
3. Thử Incognito/Private mode
4. Clear browser cache: Settings → Privacy → Clear browsing data

**Contact**: Admin@aivgroup.vn (Cloudflare account owner)
