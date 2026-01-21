# Cách Chạy Nhanh - Kiểm Tra Database

## Phương Án 1: Copy-Paste SQL (Đơn giản nhất)

### Bước 1: Vào postgres container
```bash
docker compose exec postgres psql -U postgres -d thongke
```

### Bước 2: Copy-paste từng query này:

#### Query 1: Tổng số đơn vị
```sql
SELECT COUNT(*) as "Tổng số đơn vị" FROM organizations;
```

#### Query 2: Tổng số user đơn vị
```sql
SELECT COUNT(*) as "Tổng số user đơn vị" FROM users WHERE role = 'org_user';
```

#### Query 3: Danh sách đơn vị có user
```sql
SELECT
    o.code as "Mã đơn vị",
    o.name as "Tên đơn vị",
    u.username as "Username",
    u.is_active as "Active"
FROM organizations o
LEFT JOIN users u ON u.organization_id = o.id AND u.role = 'org_user'
WHERE u.username IS NOT NULL
ORDER BY o.name;
```

#### Query 4: Danh sách đơn vị THIẾU user
```sql
SELECT
    o.code as "Mã đơn vị",
    o.name as "Tên đơn vị"
FROM organizations o
LEFT JOIN users u ON u.organization_id = o.id AND u.role = 'org_user'
WHERE u.id IS NULL
ORDER BY o.name;
```

#### Query 5: Thống kê tổng hợp
```sql
SELECT
    (SELECT COUNT(*) FROM organizations) as "Tổng đơn vị",
    (SELECT COUNT(*) FROM users WHERE role = 'org_user') as "Có user",
    (SELECT COUNT(*) FROM organizations o
     WHERE NOT EXISTS (
         SELECT 1 FROM users u
         WHERE u.organization_id = o.id AND u.role = 'org_user'
     )) as "Thiếu user";
```

---

## Phương Án 2: Một Lệnh (Nếu Docker hoạt động)

```bash
cd "/Users/shimazu/Dropbox/9. active/consultant/support_b4t/thong_ke_he_thong"
docker compose exec postgres psql -U postgres -d thongke -f /08-backlog-plan/check-database-state.sql
```

---

## Phương Án 3: Chạy Python Script Để Tạo User

### Nếu có đơn vị thiếu user, chạy:

```bash
cd "/Users/shimazu/Dropbox/9. active/consultant/support_b4t/thong_ke_he_thong"

# Copy script vào backend container
docker compose cp 08-backlog-plan/check-and-create-missing-users.py backend:/app/

# Chạy script
docker compose exec backend python /app/check-and-create-missing-users.py
```

### Hoặc chạy trực tiếp từ host:

```bash
cd "/Users/shimazu/Dropbox/9. active/consultant/support_b4t/thong_ke_he_thong/backend"
python manage.py shell < ../08-backlog-plan/check-and-create-missing-users.py
```

---

## Kết Quả Mong Đợi

### Nếu tất cả đơn vị đã có user:
```
 Tổng đơn vị | Có user | Thiếu user
------------+---------+-----------
     39     |    39   |     0

✅ HOÀN HẢO!
```

### Nếu còn đơn vị thiếu user:
```
 Tổng đơn vị | Có user | Thiếu user
------------+---------+-----------
     39     |    34   |     5

⚠️ CẦN TẠO USER CHO 5 ĐƠN VỊ
```

Khi đó, chạy Python script để tạo user tự động.

---

## Debug Nếu Lỗi

### Lỗi: "docker: command not found"
```bash
# Kiểm tra Docker Desktop có chạy không
open -a Docker

# Đợi 10-15 giây, sau đó thử lại
```

### Lỗi: "No such file"
```bash
# Đảm bảo đang ở đúng thư mục
pwd
# Kết quả phải là: /Users/shimazu/Dropbox/9. active/consultant/support_b4t/thong_ke_he_thong
```

### Lỗi Python: "No module named openpyxl"
```bash
# Cài openpyxl trong container
docker compose exec backend pip install openpyxl
```
