# Task: Git Init + GitHub + Deployment

**ID**: TODO-007
**Phase**: 1 - Core Setup
**Priority**: P0 (Critical - User Request)
**Estimate**: 3 hours
**Status**: TODO

---

## 📋 Description

Init git repository, push lên GitHub, và deploy first commit lên server 34.142.152.104 với domain https://thongkehethong.mindmaid.ai

---

## ✅ Acceptance Criteria

- [ ] Git repository initialized
- [ ] `.gitignore` configured properly
- [ ] First commit created
- [ ] GitHub repository created
- [ ] Code pushed to GitHub
- [ ] Deployed to server 34.142.152.104
- [ ] Nginx configured as reverse proxy
- [ ] Cloudflare DNS pointing to server
- [ ] SSL working (https://)
- [ ] Can access https://thongkehethong.mindmaid.ai

---

## 🛠️ Implementation Steps

### 1. Init Git Repository
```bash
cd /Users/shimazu/Dropbox/9. active/consultant/support_b4t/thong_ke_he_thong

# Init git
git init

# Check .gitignore exists (already created)
cat .gitignore

# Add all files
git add .

# First commit
git commit -m "Initial commit: Django + React project structure

- Django 5.0 + DRF backend with admin panel
- PostgreSQL database models
- React + TypeScript + Ant Design frontend
- Docker Compose setup
- JWT authentication
- Organization & System management

Phase 1: Core Setup completed"
```

### 2. Create GitHub Repository
```bash
# Using GitHub CLI (if installed)
gh repo create thong-ke-he-thong --public --description "Hệ thống Báo cáo Thống kê Hệ thống"

# Or manually:
# 1. Go to https://github.com/new
# 2. Repository name: thong-ke-he-thong
# 3. Description: Hệ thống Báo cáo Thống kê Hệ thống
# 4. Public/Private: Choose
# 5. Don't initialize with README (we have it)
# 6. Create repository
```

### 3. Push to GitHub
```bash
# Set git config
git config user.email "hailoc12@gmail.com"
git config user.name "Loc Hai"

# Add remote (use GitHub token from credentials file)
git remote add origin https://YOUR_GITHUB_TOKEN@github.com/USERNAME/thong-ke-he-thong.git

# Push
git branch -M main
git push -u origin main
```

### 4. SSH to Server
```bash
ssh admin_@34.142.152.104
# Password: aivnews_xinchao_#*2020
```

### 5. Setup Server Environment
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
sudo apt install -y docker.io docker-compose

# Start Docker
sudo systemctl start docker
sudo systemctl enable docker

# Add user to docker group
sudo usermod -aG docker admin_

# Install Git
sudo apt install -y git

# Install Nginx
sudo apt install -y nginx
```

### 6. Clone Repository on Server
```bash
cd /opt
sudo mkdir -p apps
sudo chown admin_:admin_ apps
cd apps

# Clone (use token from credentials file)
git clone https://YOUR_GITHUB_TOKEN@github.com/USERNAME/thong-ke-he-thong.git

cd thong-ke-he-thong
```

### 7. Create Production .env
```bash
cd backend

# Create .env from example
cp .env.example .env

# Edit .env for production
nano .env
```

Edit `.env`:
```env
# Django
SECRET_KEY=change-this-to-a-strong-random-key-in-production-32-chars
DEBUG=False
ALLOWED_HOSTS=thongkehethong.mindmaid.ai,34.142.152.104,localhost

# Database
DB_NAME=system_reports
DB_USER=postgres
DB_PASSWORD=change-this-strong-postgres-password
DB_HOST=postgres
DB_PORT=5432

# CORS
CORS_ORIGINS=https://thongkehethong.mindmaid.ai
```

Generate SECRET_KEY:
```bash
python3 -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
```

### 8. Create Production docker-compose
Create `docker-compose.prod.yml`:
```yaml
version: '3.8'

services:
  postgres:
    image: postgres:14-alpine
    environment:
      POSTGRES_DB: system_reports
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: always
    networks:
      - app-network

  backend:
    build:
      context: ./backend
    command: >
      sh -c "python manage.py migrate &&
             python manage.py collectstatic --noinput &&
             gunicorn config.wsgi:application --bind 0.0.0.0:8000 --workers 3"
    volumes:
      - media_data:/app/media
      - static_data:/app/staticfiles
    environment:
      - DEBUG=False
      - SECRET_KEY=${SECRET_KEY}
      - DB_NAME=${DB_NAME}
      - DB_USER=${DB_USER}
      - DB_PASSWORD=${DB_PASSWORD}
      - DB_HOST=postgres
      - DB_PORT=5432
      - ALLOWED_HOSTS=${ALLOWED_HOSTS}
    depends_on:
      - postgres
    restart: always
    networks:
      - app-network

  frontend:
    build:
      context: ./frontend
      args:
        - VITE_API_URL=https://thongkehethong.mindmaid.ai
    restart: always
    networks:
      - app-network

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./nginx/ssl:/etc/nginx/ssl:ro
      - static_data:/static:ro
      - media_data:/media:ro
    depends_on:
      - backend
      - frontend
    restart: always
    networks:
      - app-network

volumes:
  postgres_data:
  media_data:
  static_data:

networks:
  app-network:
    driver: bridge
```

### 9. Configure Nginx
Create `nginx/nginx.conf`:
```nginx
events {
    worker_connections 1024;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    upstream backend {
        server backend:8000;
    }

    upstream frontend {
        server frontend:3000;
    }

    # HTTP -> HTTPS redirect
    server {
        listen 80;
        server_name thongkehethong.mindmaid.ai;
        return 301 https://$server_name$request_uri;
    }

    # HTTPS
    server {
        listen 443 ssl http2;
        server_name thongkehethong.mindmaid.ai;

        ssl_certificate /etc/nginx/ssl/cert.pem;
        ssl_certificate_key /etc/nginx/ssl/key.pem;

        # Security headers
        add_header X-Frame-Options "SAMEORIGIN" always;
        add_header X-XSS-Protection "1; mode=block" always;
        add_header X-Content-Type-Options "nosniff" always;

        # Frontend
        location / {
            proxy_pass http://frontend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        # Backend API
        location /api {
            proxy_pass http://backend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        # Django Admin
        location /admin {
            proxy_pass http://backend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
        }

        # Static files
        location /static {
            alias /static;
        }

        # Media files
        location /media {
            alias /media;
        }

        # File upload size
        client_max_body_size 50M;
    }
}
```

### 10. Configure Cloudflare DNS
1. Login to Cloudflare Dashboard
2. Select domain `mindmaid.ai`
3. Go to DNS settings
4. Add A record:
   - Type: A
   - Name: thongkehethong
   - IPv4: 34.142.152.104
   - Proxy status: Proxied (orange cloud)
   - TTL: Auto

### 11. Setup SSL with Cloudflare
Cloudflare handles SSL automatically with proxied status.

For nginx, create self-signed cert (Cloudflare to origin):
```bash
mkdir -p nginx/ssl
cd nginx/ssl

openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout key.pem -out cert.pem \
  -subj "/CN=thongkehethong.mindmaid.ai"
```

### 12. Deploy Application
```bash
# Build and start
docker-compose -f docker-compose.prod.yml up -d --build

# Check logs
docker-compose -f docker-compose.prod.yml logs -f

# Create superuser
docker-compose -f docker-compose.prod.yml exec backend python manage.py createsuperuser
```

### 13. Test Deployment
```bash
# Check from server
curl http://localhost
curl https://thongkehethong.mindmaid.ai

# From local machine
curl https://thongkehethong.mindmaid.ai
```

Visit:
- https://thongkehethong.mindmaid.ai - Frontend
- https://thongkehethong.mindmaid.ai/admin - Django Admin
- https://thongkehethong.mindmaid.ai/api/ - API Root

---

## 📦 Deliverables

- Git repository with first commit
- Code on GitHub
- Application deployed on server
- Nginx configured
- Cloudflare DNS configured
- SSL working
- Domain accessible: https://thongkehethong.mindmaid.ai

---

## 🔗 Dependencies

**Blocked by**:
- TODO-001 (Django Project)
- TODO-005 (Docker Setup)
- TODO-006 (Frontend Init)

**Blocks**: None (enables further development)

---

## 📝 Notes

- Use Cloudflare for SSL and CDN
- Nginx acts as reverse proxy
- Docker Compose manages all containers
- Use strong passwords in production
- Keep credentials secure in .env file (not in git)

---

**Credentials Used**: See `07-resources/deploy-credentials.md` for full credentials

---

**Created**: 2026-01-15
