# HỆ THỐNG BÁO CÁO THỐNG KÊ HỆ THỐNG

**Project**: System Report Management System
**Tech Stack**: Django + React + PostgreSQL
**Created**: 2026-01-15

---

## 📋 OVERVIEW

Hệ thống cho phép các đơn vị trong Bộ nhập thông tin về hệ thống/ứng dụng, phục vụ thiết kế tổng thể chuyển đổi số.

### Mục tiêu

1. Vẽ bản đồ tổng thể hệ thống CNTT
2. Phát hiện silo (công nghệ, dữ liệu)
3. Đánh giá phụ thuộc nhà thầu
4. Hỗ trợ thiết kế tổng thể chuyển đổi số

---

## 🚀 QUICK START

### Using Docker (Recommended)

```bash
# Start all services
docker-compose up --build

# Create superuser (in another terminal)
docker-compose exec backend python manage.py createsuperuser

# Visit
# http://localhost:8000/admin - Django Admin
# http://localhost:8000/api/token/ - API
```

### Manual Setup

See `backend/README.md` and `frontend/README.md` for detailed instructions.

---

## 📂 PROJECT STRUCTURE

```
.
├── backend/                    # Django REST API
│   ├── config/                # Django settings
│   ├── apps/                  # Django apps
│   │   ├── accounts/         # User & Auth
│   │   ├── organizations/    # Organizations
│   │   ├── systems/          # Systems (main)
│   │   └── reports/          # Export reports
│   ├── utils/                # Utilities
│   ├── manage.py
│   └── requirements.txt
│
├── frontend/                  # React + TypeScript (TBD)
│
├── 01-history-advices/       # Structured thinking folders
├── 02-principle-processes/   # Tech decisions
├── 03-research/              # Architecture docs
├── 04-task-definition/       # Requirements
├── 07-resources/             # Database schema
├── 08-backlog-plan/          # Task lists
│   ├── MASTER_TASKLIST.md   # Master task list
│   ├── todo/                # Todo tasks
│   ├── doing/               # In progress
│   └── done/                # Completed
│
├── docker-compose.yml
└── README.md                 # This file
```

---

## 📚 DOCUMENTATION

| File | Description |
|------|-------------|
| `04-task-definition/01-requirements.md` | Full requirements (Level 1 & 2 forms) |
| `03-research/architecture-design.md` | Architecture design |
| `02-principle-processes/tech-stack.md` | Tech stack decisions |
| `07-resources/database-schema.sql` | Database schema (14 tables) |
| `08-backlog-plan/MASTER_TASKLIST.md` | Complete task list & roadmap |

---

## 🎯 CURRENT STATUS

**Phase 1: Core Setup** - In Progress

- ✅ Project structure created
- ✅ Django models (User, Organization)
- ✅ Django Admin configured
- ✅ Docker setup
- ⏳ REST API (next)
- ⏳ Frontend init (next)
- ⏳ Deployment (next)

See `08-backlog-plan/MASTER_TASKLIST.md` for detailed progress.

---

## 🔧 TECH STACK

### Backend
- Django 5.0.1 + Django REST Framework
- PostgreSQL 14+
- JWT Authentication
- **Django Admin Panel** for easy data management

### Frontend (TBD)
- React 18 + TypeScript
- Ant Design
- Axios + Zustand

### DevOps
- Docker + Docker Compose
- Nginx reverse proxy
- Cloudflare SSL

---

## 🚀 NEXT STEPS

1. Complete System models (14 tables)
2. Create REST API endpoints
3. Init React frontend
4. Deploy to https://thongkehethong.mindmaid.ai

See detailed tasks in `08-backlog-plan/todo/`

---

## 🔗 USEFUL COMMANDS

```bash
# Backend
cd backend
source venv/bin/activate
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver

# Docker
docker-compose up --build
docker-compose logs -f backend
docker-compose exec backend python manage.py shell

# Git
git status
git add .
git commit -m "message"
git push origin main
```

---

## 📞 DEPLOYMENT INFO

- **Server**: 34.142.152.104
- **Domain**: https://thongkehethong.mindmaid.ai
- **Credentials**: See `07-resources/deploy-credentials.md`

---

**Created**: 2026-01-15
**Status**: Phase 1 - In Progress
