# Hướng dẫn Deploy lên Server Production

## 📋 Chuẩn bị Server

### 1. Server requirements
- Ubuntu 20.04+ hoặc CentOS 8+
- Docker & Docker Compose
- Git
- Minimum: 2GB RAM, 2 CPU cores, 20GB disk

### 2. Cài đặt Docker trên server

```bash
# Update packages
sudo apt-get update

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Add user to docker group
sudo usermod -aG docker $USER

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Verify installation
docker --version
docker-compose --version
```

## 🚀 Deploy Application

### Bước 1: Clone code lên server

```bash
# Tạo thư mục deploy
sudo mkdir -p /opt/thong_ke_he_thong
sudo chown $USER:$USER /opt/thong_ke_he_thong
cd /opt/thong_ke_he_thong

# Clone repository
git clone <repository-url> .

# Hoặc nếu đã có code, copy lên server:
# scp -r thong_ke_he_thong/ user@server:/opt/
```

### Bước 2: Cấu hình environment variables

**Backend environment**
```bash
cd /opt/thong_ke_he_thong/backend

# Tạo file .env
cat > .env << 'EOF'
DEBUG=False
SECRET_KEY=your-production-secret-key-here-change-this
ALLOWED_HOSTS=thongkehethong.mindmaid.ai,localhost,backend

DB_NAME=system_reports
DB_USER=postgres
DB_PASSWORD=your-secure-database-password-here
DB_HOST=postgres
DB_PORT=5432

CORS_ORIGINS=https://thongkehethong.mindmaid.ai,http://localhost
EOF
```

**Frontend environment** (đã có .env.production)
```bash
cd /opt/thong_ke_he_thong/frontend
cat .env.production
# Verify: VITE_API_BASE_URL=https://thongkehethong.mindmaid.ai/api
```

### Bước 3: Deploy bằng script tự động

```bash
cd /opt/thong_ke_he_thong

# Chạy deployment script
./deploy.sh
```

Script sẽ tự động:
- ✓ Backup database và media files
- ✓ Build Docker images
- ✓ Run migrations
- ✓ Start services
- ✓ Health check

### Bước 4: Tạo superuser

```bash
docker compose exec backend python manage.py createsuperuser
```

### Bước 5: Verify deployment

```bash
# Check services
docker compose ps

# Check logs
docker compose logs -f

# Test frontend
curl http://localhost/health

# Test backend API
curl http://localhost:8000/api/

# Test admin
curl http://localhost:8000/admin/
```

## 🌐 Cấu hình Domain & SSL

### Option 1: Sử dụng Nginx Reverse Proxy (Recommended)

**1. Cài đặt Nginx trên server**
```bash
sudo apt-get install nginx
```

**2. Cấu hình Nginx**
```bash
sudo nano /etc/nginx/sites-available/thongkehethong
```

```nginx
server {
    listen 80;
    server_name thongkehethong.mindmaid.ai;

    # Frontend
    location / {
        proxy_pass http://localhost:80;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Backend API
    location /api/ {
        proxy_pass http://localhost:8000/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Admin
    location /admin/ {
        proxy_pass http://localhost:8000/admin/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # Static files
    location /static/ {
        proxy_pass http://localhost:8000/static/;
    }

    # Media files
    location /media/ {
        proxy_pass http://localhost:8000/media/;
    }
}
```

**3. Enable site**
```bash
sudo ln -s /etc/nginx/sites-available/thongkehethong /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

**4. Cài đặt SSL với Let's Encrypt**
```bash
sudo apt-get install certbot python3-certbot-nginx
sudo certbot --nginx -d thongkehethong.mindmaid.ai
```

Certbot sẽ tự động:
- Tạo SSL certificate
- Cấu hình HTTPS trong Nginx
- Set up auto-renewal

### Option 2: Direct Docker (No Nginx Proxy)

Nếu không dùng Nginx proxy, cần expose ports trực tiếp:

**Sửa docker-compose.yml**
```yaml
frontend:
  ports:
    - "80:80"
    - "443:443"
  volumes:
    - ./ssl:/etc/nginx/ssl  # Mount SSL certificates
```

**Update frontend nginx.conf để handle SSL**

## 🔄 Update Application

### Deploy bản mới

```bash
cd /opt/thong_ke_he_thong

# Pull code mới
git pull origin main

# Deploy
./deploy.sh
```

### Rollback nếu có lỗi

```bash
# Xem list backups
ls -lah /opt/backups/thong_ke_he_thong/

# Restore database
cat /opt/backups/thong_ke_he_thong/db_backup_YYYYMMDD_HHMMSS.sql | \
  docker compose exec -T postgres psql -U postgres system_reports

# Restart services
docker compose restart
```

## 📊 Monitoring & Maintenance

### Xem logs
```bash
cd /opt/thong_ke_he_thong

# Tất cả services
docker compose logs -f

# Specific service
docker compose logs -f frontend
docker compose logs -f backend
docker compose logs -f postgres
```

### Check resource usage
```bash
# Container stats
docker stats

# Disk usage
df -h
docker system df
```

### Backup định kỳ

**Setup cron job**
```bash
# Edit crontab
crontab -e

# Add daily backup at 2 AM
0 2 * * * docker compose -f /opt/thong_ke_he_thong/docker-compose.yml exec -T postgres pg_dump -U postgres system_reports > /opt/backups/thong_ke_he_thong/daily_backup_$(date +\%Y\%m\%d).sql
```

## 🐛 Troubleshooting

### Services không start
```bash
# Check logs
docker compose logs

# Restart specific service
docker compose restart backend

# Rebuild và restart
docker compose build backend
docker compose up -d backend
```

### Database connection error
```bash
# Check postgres logs
docker compose logs postgres

# Verify postgres is running
docker compose ps postgres

# Test connection
docker compose exec backend python manage.py dbshell
```

### Frontend không load
```bash
# Check nginx logs
docker compose logs frontend

# Test nginx
docker compose exec frontend nginx -t

# Restart nginx
docker compose restart frontend
```

### Port conflicts
```bash
# Check what's using port 80
sudo lsof -i :80

# Kill process if needed
sudo kill -9 <PID>
```

## 🔐 Security Checklist

- [x] Changed Django SECRET_KEY
- [x] Set DEBUG=False
- [x] Strong database password
- [x] SSL/HTTPS enabled
- [ ] Firewall configured (ufw/iptables)
- [ ] SSH key-only access
- [ ] Database backups automated
- [ ] Log rotation configured
- [ ] Monitoring set up

### Cấu hình firewall
```bash
# Enable firewall
sudo ufw enable

# Allow SSH
sudo ufw allow 22/tcp

# Allow HTTP/HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Check status
sudo ufw status
```

## 📞 Quick Commands Reference

```bash
# Deploy
./deploy.sh

# View logs
docker compose logs -f

# Restart all
docker compose restart

# Stop all
docker compose down

# Start all
docker compose up -d

# Database backup
docker compose exec postgres pg_dump -U postgres system_reports > backup.sql

# Database restore
cat backup.sql | docker compose exec -T postgres psql -U postgres system_reports

# Shell access
docker compose exec backend bash
docker compose exec frontend sh

# Django shell
docker compose exec backend python manage.py shell

# Create superuser
docker compose exec backend python manage.py createsuperuser
```

## 📱 Access URLs

- **Frontend**: https://thongkehethong.mindmaid.ai
- **Backend API**: https://thongkehethong.mindmaid.ai/api/
- **Admin Panel**: https://thongkehethong.mindmaid.ai/admin/
- **Swagger API Docs**: https://thongkehethong.mindmaid.ai/api/swagger/

---

**Deployment Guide Version**: 1.0.0
**Last Updated**: 2026-01-16
