# Hướng Dẫn Deployment - Hệ Thống Thống Kê

**Ngày cập nhật**: 2026-01-16
**Trạng thái**: Server đang bị 502 Bad Gateway - Cần restart containers

---

## 🚨 KHẨN CẤP: Restart Server Ngay

Server hiện tại đang down (502 Bad Gateway). Docker containers cần được restart.

### Cách 1: SSH Trực Tiếp (NHANH NHẤT - 2 phút)

```bash
# Bước 1: SSH vào server
ssh admin_@34.142.152.104
# Password: aivnews_xinchao_#*2020

# Bước 2: Navigate to project
cd /home/admin_/apps/thong-ke-he-thong

# Bước 3: Pull code mới nhất
git pull origin main

# Bước 4: Restart containers
docker-compose down
docker-compose up -d

# Bước 5: Kiểm tra status (đợi 30 giây)
sleep 30
docker-compose ps
docker-compose logs --tail 30 backend

# Bước 6: Test site
curl -I http://localhost:8000/api/
```

**Kết quả mong đợi**:
- Containers đang chạy (Up)
- Backend logs không có ERROR
- curl trả về HTTP 200

### Cách 2: Từ Local Machine (Backup)

```bash
# Từ thư mục project local
cd /path/to/thong_ke_he_thong
./quick-restart.sh
```

⚠️ **Lưu ý**: Script này có thể chậm do network latency.

---

## ✅ Cải Tiến Đã Thực Hiện

### 1. Docker Compose - Restart Policy
Đã thêm `restart: always` cho tất cả services:
- ✅ Postgres: Auto-restart nếu crash
- ✅ Backend: Auto-restart nếu crash
- ✅ Frontend: Auto-restart nếu crash

### 2. Backend Health Check
Đã thêm health check cho backend:
```yaml
healthcheck:
  test: ["CMD", "curl", "-f", "http://localhost:8000/api/"]
  interval: 30s
  timeout: 10s
  retries: 3
  start_period: 60s
```

### 3. Backend Performance
- Workers: 1 → 3 (xử lý nhiều requests đồng thời)
- Timeout: 30s → 120s (tránh timeout với operations nặng)

### 4. GitHub Actions Auto-Deploy
Đã tạo workflow `.github/workflows/deploy.yml` để tự động deploy khi push code.

---

## 🔧 Setup GitHub Actions Auto-Deploy

Để enable tự động deploy, cần setup secrets trên GitHub:

### Bước 1: Truy cập GitHub Repository
https://github.com/hailoc12/thong-ke-he-thong/settings/secrets/actions

### Bước 2: Thêm Secrets

Click **New repository secret** và thêm 3 secrets:

| Secret Name | Value |
|-------------|-------|
| `SSH_HOST` | `34.142.152.104` |
| `SSH_USER` | `admin_` |
| `SSH_PASSWORD` | `aivnews_xinchao_#*2020` |

### Bước 3: Test Auto-Deploy

```bash
# Từ local, push bất kỳ thay đổi nào
git add .
git commit -m "test: trigger auto-deploy"
git push origin main

# Check workflow tại:
# https://github.com/hailoc12/thong-ke-he-thong/actions
```

Sau mỗi lần push, GitHub Actions sẽ tự động:
1. SSH vào server
2. Pull code mới
3. Restart containers
4. Hiển thị logs

---

## 📊 Kiểm Tra Trạng Thái Hệ Thống

### Check Containers
```bash
docker-compose ps
```

**Kết quả tốt**:
```
NAME                    STATUS
backend-1               Up (healthy)
frontend-1              Up (healthy)
postgres-1              Up (healthy)
```

### Check Backend Logs
```bash
docker-compose logs --tail 50 backend
```

**Không nên có**:
- ERROR
- Exception
- Connection refused

### Check Database
```bash
docker-compose exec postgres psql -U postgres -d system_reports -c "\dt"
```

**Nên thấy**: Danh sách tables (users, organizations, systems, etc.)

### Check Nginx
```bash
# Trên server
sudo nginx -t
sudo systemctl status nginx
```

---

## 🐛 Troubleshooting

### Lỗi 502 Bad Gateway

**Nguyên nhân**: Backend container không chạy hoặc không phản hồi

**Giải pháp**:
```bash
# 1. Check backend logs
docker-compose logs backend

# 2. Restart backend
docker-compose restart backend

# 3. Nếu vẫn lỗi, rebuild
docker-compose down
docker-compose up -d --build backend
```

### Container Không Start

**Kiểm tra logs**:
```bash
docker-compose logs [service_name]
```

**Rebuild từ đầu**:
```bash
docker-compose down -v
docker-compose up -d --build
```

### Database Connection Error

**Check postgres**:
```bash
docker-compose exec postgres pg_isready -U postgres
```

**Nếu fail, restart postgres**:
```bash
docker-compose restart postgres
sleep 10
docker-compose restart backend
```

### Port Conflict

**Check ports đang dùng**:
```bash
sudo netstat -tulpn | grep -E ':(8000|3000|5432)'
```

**Kill process đang dùng port**:
```bash
sudo kill -9 [PID]
```

---

## 📝 Maintenance Tasks

### Update Code
```bash
cd /home/admin_/apps/thong-ke-he-thong
git pull origin main
docker-compose up -d --build
```

### Backup Database
```bash
docker-compose exec -T postgres pg_dump -U postgres system_reports > backup_$(date +%Y%m%d).sql
```

### Restore Database
```bash
docker-compose exec -T postgres psql -U postgres system_reports < backup_20260116.sql
```

### View Real-time Logs
```bash
docker-compose logs -f
```

### Clean Up
```bash
# Remove old images
docker system prune -a

# Remove unused volumes
docker volume prune
```

---

## 🌐 URLs Quan Trọng

| Service | URL |
|---------|-----|
| **Frontend** | https://thongkehethong.mindmaid.ai/ |
| **Backend API** | https://thongkehethong.mindmaid.ai/api/ |
| **Admin Panel** | https://thongkehethong.mindmaid.ai/admin/ |
| **GitHub Repo** | https://github.com/hailoc12/thong-ke-he-thong |
| **GitHub Actions** | https://github.com/hailoc12/thong-ke-he-thong/actions |

---

## 📞 Quick Commands Reference

```bash
# SSH to server
ssh admin_@34.142.152.104

# Navigate to project
cd /home/admin_/apps/thong-ke-he-thong

# Check status
docker-compose ps

# Restart all
docker-compose restart

# View logs
docker-compose logs --tail 50 [service]

# Rebuild and restart
docker-compose down && docker-compose up -d --build

# Access Django shell
docker-compose exec backend python manage.py shell

# Run migrations
docker-compose exec backend python manage.py migrate

# Create superuser
docker-compose exec backend python manage.py createsuperuser
```

---

## ✅ Checklist Sau Khi Restart

- [ ] Tất cả containers đang Up (healthy)
- [ ] Backend logs không có ERROR
- [ ] Frontend accessible: https://thongkehethong.mindmaid.ai/
- [ ] Admin panel accessible: /admin/
- [ ] API responds: /api/
- [ ] Can login với admin account
- [ ] Can tạo Organization
- [ ] Can tạo System

---

**⚡ ACTION REQUIRED**: Cần restart server ngay để site hoạt động trở lại!
