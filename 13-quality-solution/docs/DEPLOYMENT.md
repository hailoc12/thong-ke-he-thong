# Deployment Guide - Hệ thống Báo cáo Thống kê

## 📋 Prerequisites

- Docker & Docker Compose installed
- Domain name configured (thongkehethong.mindmaid.ai)
- SSL certificate (recommended: Let's Encrypt)

## 🚀 Quick Start - Full Stack Deployment

### 1. Clone the repository
```bash
git clone <repository-url>
cd thong_ke_he_thong
```

### 2. Configure environment variables

**Backend (.env)**
```bash
# Django settings
DEBUG=False
SECRET_KEY=your-secret-key-here
ALLOWED_HOSTS=thongkehethong.mindmaid.ai,localhost

# Database
DB_NAME=system_reports
DB_USER=postgres
DB_PASSWORD=your-secure-password
DB_HOST=postgres
DB_PORT=5432

# CORS
CORS_ORIGINS=https://thongkehethong.mindmaid.ai
```

**Frontend (.env.production)**
```bash
VITE_API_BASE_URL=https://thongkehethong.mindmaid.ai/api
```

### 3. Build and run with Docker Compose
```bash
# Build all services
docker compose build

# Start services
docker compose up -d

# Check logs
docker compose logs -f
```

### 4. Initialize database
```bash
# Create superuser
docker compose exec backend python manage.py createsuperuser

# Load sample data (optional)
docker compose exec backend python manage.py loaddata sample_data.json
```

### 5. Access the application
- Frontend: http://localhost (or your domain)
- Backend API: http://localhost:8000/api/
- Admin panel: http://localhost:8000/admin/
- API Documentation: http://localhost:8000/api/swagger/

## 🐳 Docker Services

### Services Overview

| Service | Port | Description |
|---------|------|-------------|
| postgres | 5432 | PostgreSQL 14 database |
| backend | 8000 | Django REST API |
| frontend | 80 | React app served by Nginx |

### Service Architecture
```
                    ┌──────────────┐
                    │   Frontend   │
                    │  (Nginx:80)  │
                    └──────┬───────┘
                           │
                    HTTP/HTTPS
                           │
                    ┌──────▼───────┐
                    │   Backend    │
                    │ (Django:8000)│
                    └──────┬───────┘
                           │
                    ┌──────▼───────┐
                    │  PostgreSQL  │
                    │   (Port:5432)│
                    └──────────────┘
```

## 📦 Individual Service Deployment

### Backend Only
```bash
docker compose up -d postgres backend
```

### Frontend Only
```bash
docker compose up -d frontend
```

## 🔧 Configuration Details

### Frontend Dockerfile
Multi-stage build:
1. **Build stage**: Node.js builds React app with Vite
2. **Production stage**: Nginx serves static files

Key features:
- Gzip compression enabled
- SPA routing configured
- Static asset caching (1 year)
- Security headers included
- Health check endpoint: `/health`

### Backend Dockerfile
Python 3.11-slim based:
- PostgreSQL client included
- Gunicorn WSGI server
- Automatic migrations on startup
- Static files collected

### Nginx Configuration
- Serves React SPA
- Falls back to index.html for all routes
- Gzip compression
- Security headers
- Static asset caching
- Health check endpoint

## 🔐 Production Security Checklist

- [ ] Change Django SECRET_KEY
- [ ] Set DEBUG=False
- [ ] Configure strong database passwords
- [ ] Set up SSL/TLS certificates
- [ ] Configure firewall rules
- [ ] Enable HTTPS only
- [ ] Set up backup strategy
- [ ] Configure log rotation
- [ ] Set up monitoring (CPU, memory, disk)
- [ ] Configure rate limiting
- [ ] Set up database backups

## 🌐 Domain & SSL Setup

### Using Let's Encrypt with Certbot

1. Install Certbot
```bash
sudo apt-get update
sudo apt-get install certbot python3-certbot-nginx
```

2. Obtain certificate
```bash
sudo certbot --nginx -d thongkehethong.mindmaid.ai
```

3. Update nginx configuration to use SSL
```nginx
server {
    listen 443 ssl http2;
    server_name thongkehethong.mindmaid.ai;

    ssl_certificate /etc/letsencrypt/live/thongkehethong.mindmaid.ai/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/thongkehethong.mindmaid.ai/privkey.pem;

    # ... rest of config
}

server {
    listen 80;
    server_name thongkehethong.mindmaid.ai;
    return 301 https://$server_name$request_uri;
}
```

4. Auto-renewal
```bash
sudo certbot renew --dry-run
```

## 📊 Monitoring & Logs

### View logs
```bash
# All services
docker compose logs -f

# Specific service
docker compose logs -f frontend
docker compose logs -f backend
docker compose logs -f postgres

# Last 100 lines
docker compose logs --tail=100 backend
```

### Check service health
```bash
# Check all services
docker compose ps

# Check frontend health
curl http://localhost/health

# Check backend API
curl http://localhost:8000/api/

# Check database connection
docker compose exec backend python manage.py dbshell
```

### Resource monitoring
```bash
# Container stats
docker stats

# Disk usage
docker system df
```

## 🔄 Updates & Maintenance

### Update application
```bash
# Pull latest code
git pull

# Rebuild and restart
docker compose build
docker compose up -d

# Run migrations
docker compose exec backend python manage.py migrate

# Collect static files
docker compose exec backend python manage.py collectstatic --noinput
```

### Database backup
```bash
# Backup
docker compose exec postgres pg_dump -U postgres system_reports > backup_$(date +%Y%m%d_%H%M%S).sql

# Restore
cat backup.sql | docker compose exec -T postgres psql -U postgres system_reports
```

### Clean up
```bash
# Remove unused images
docker image prune -a

# Remove unused volumes
docker volume prune

# Full cleanup (careful!)
docker system prune -a --volumes
```

## 🐛 Troubleshooting

### Frontend not loading
1. Check frontend logs: `docker compose logs frontend`
2. Verify frontend is running: `docker compose ps frontend`
3. Test nginx: `curl http://localhost/health`
4. Check browser console for errors

### Backend API errors
1. Check backend logs: `docker compose logs backend`
2. Verify database connection: `docker compose exec backend python manage.py dbshell`
3. Check migrations: `docker compose exec backend python manage.py showmigrations`
4. Test API endpoint: `curl http://localhost:8000/api/`

### Database connection issues
1. Check postgres logs: `docker compose logs postgres`
2. Verify postgres is running: `docker compose ps postgres`
3. Check network: `docker compose exec backend ping postgres`
4. Verify credentials in backend environment variables

### Port conflicts
```bash
# Find process using port 80
sudo lsof -i :80

# Kill process
sudo kill -9 <PID>
```

## 📈 Performance Optimization

### Frontend
- Static assets cached for 1 year
- Gzip compression enabled
- React production build (minified & optimized)

### Backend
- Gunicorn with multiple workers
- Database connection pooling
- Static files served efficiently

### Database
- PostgreSQL with persistent volume
- Regular VACUUM operations
- Proper indexing on frequently queried fields

## 🔗 Useful Commands

```bash
# Restart specific service
docker compose restart frontend

# Rebuild without cache
docker compose build --no-cache

# Scale backend workers
docker compose up -d --scale backend=3

# Execute command in container
docker compose exec backend python manage.py shell

# Access database
docker compose exec postgres psql -U postgres system_reports

# View environment variables
docker compose exec backend env
```

## 📞 Support

For issues or questions, contact the development team or create an issue in the repository.

---

**Deployment Version**: 1.0.0
**Last Updated**: 2026-01-16
