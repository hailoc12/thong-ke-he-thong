# Task: Docker Setup

**ID**: TODO-005
**Phase**: 1 - Core Setup
**Priority**: P1 (High)
**Estimate**: 2 hours
**Status**: TODO

---

## 📋 Description

Setup Docker và Docker Compose để chạy PostgreSQL + Django + React.

---

## ✅ Acceptance Criteria

- [ ] `docker-compose.yml` tạo xong
- [ ] PostgreSQL container chạy được
- [ ] Django backend container chạy được
- [ ] React frontend container chạy được (sau khi frontend init)
- [ ] `docker-compose up` chạy toàn bộ stack
- [ ] Database migrations tự động chạy khi start
- [ ] Volumes cho database và media files

---

## 🛠️ Implementation Steps

### 1. Create Backend Dockerfile (backend/Dockerfile)
```dockerfile
FROM python:3.11-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Set work directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt /app/
RUN pip install --no-cache-dir -r requirements.txt

# Copy project
COPY . /app/

# Create media directory
RUN mkdir -p /app/media

# Run migrations and start server
CMD python manage.py migrate && \
    python manage.py collectstatic --noinput && \
    gunicorn config.wsgi:application --bind 0.0.0.0:8000 --workers 3
```

### 2. Create docker-compose.yml (root)
```yaml
version: '3.8'

services:
  postgres:
    image: postgres:14-alpine
    environment:
      POSTGRES_DB: system_reports
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    command: >
      sh -c "python manage.py migrate &&
             python manage.py collectstatic --noinput &&
             gunicorn config.wsgi:application --bind 0.0.0.0:8000 --reload"
    volumes:
      - ./backend:/app
      - media_data:/app/media
      - static_data:/app/staticfiles
    ports:
      - "8000:8000"
    environment:
      - DEBUG=True
      - SECRET_KEY=django-insecure-dev-key-change-in-production
      - DB_NAME=system_reports
      - DB_USER=postgres
      - DB_PASSWORD=postgres
      - DB_HOST=postgres
      - DB_PORT=5432
      - ALLOWED_HOSTS=localhost,127.0.0.1,backend
      - CORS_ORIGINS=http://localhost:3000,http://localhost:5173
    depends_on:
      postgres:
        condition: service_healthy

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    volumes:
      - ./frontend:/app
      - /app/node_modules
    ports:
      - "3000:3000"
    environment:
      - VITE_API_URL=http://localhost:8000
    depends_on:
      - backend
    command: npm run dev -- --host 0.0.0.0

volumes:
  postgres_data:
  media_data:
  static_data:
```

### 3. Create .dockerignore (backend/)
```
__pycache__
*.pyc
*.pyo
*.pyd
.Python
env/
venv/
.venv/
*.db
*.sqlite3
.env
.git
.gitignore
.coverage
htmlcov/
dist/
build/
*.egg-info/
```

### 4. Update backend/.env.example for Docker
```env
# Django
SECRET_KEY=your-secret-key-change-this
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1,backend

# Database (Docker)
DB_NAME=system_reports
DB_USER=postgres
DB_PASSWORD=postgres
DB_HOST=postgres
DB_PORT=5432

# CORS
CORS_ORIGINS=http://localhost:3000,http://localhost:5173
```

### 5. Test Docker Setup
```bash
# Build and start all services
docker-compose up --build

# Check running containers
docker-compose ps

# Check logs
docker-compose logs -f backend
docker-compose logs -f postgres

# Stop all
docker-compose down

# Stop and remove volumes (reset database)
docker-compose down -v
```

### 6. Create helper scripts (root/)

**start-dev.sh**:
```bash
#!/bin/bash
echo "Starting development environment..."
docker-compose up --build
```

**stop-dev.sh**:
```bash
#!/bin/bash
echo "Stopping development environment..."
docker-compose down
```

**reset-db.sh**:
```bash
#!/bin/bash
echo "Resetting database..."
docker-compose down -v
docker-compose up -d postgres
sleep 5
docker-compose up backend
```

Make them executable:
```bash
chmod +x start-dev.sh stop-dev.sh reset-db.sh
```

---

## 📦 Deliverables

- `backend/Dockerfile`
- `docker-compose.yml`
- `.dockerignore`
- Helper scripts (start-dev.sh, etc.)
- All containers running successfully

---

## 🔗 Dependencies

**Blocked by**: TODO-001 (Init Django Project)
**Blocks**: Deployment

---

## 📝 Notes

- Use alpine images for smaller size
- Health checks ensure database is ready before backend starts
- Volumes persist data across container restarts
- `--reload` in command for hot reload during development

---

**Created**: 2026-01-15
