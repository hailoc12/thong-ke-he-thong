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

### Production Site (LIVE NOW!)

**URL**: https://thongkehethong.mindmaid.ai/admin/

**Admin Login**: See `ADMIN_CREDENTIALS.md` (in .gitignore - credentials in Dropbox only)

### Local Development

#### Using Docker (Recommended)

```bash
# Start all services
docker-compose up --build

# Create superuser (in another terminal)
docker-compose exec backend python manage.py createsuperuser

# Visit
# http://localhost:8000/admin - Django Admin
# http://localhost:8000/api/token/ - API
```

#### Manual Setup

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
├── frontend/                  # React + TypeScript
│   ├── src/
│   │   ├── components/       # Layout, ProtectedRoute
│   │   ├── pages/           # Login, Dashboard, Systems, Organizations
│   │   ├── stores/          # Zustand auth store
│   │   ├── config/          # Axios with JWT
│   │   └── types/           # TypeScript types
│   ├── Dockerfile           # Multi-stage build (Node + Nginx)
│   ├── nginx.conf           # SPA routing config
│   └── package.json
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
| `API_DOCUMENTATION.md` | **REST API complete reference** |
| `SERVER_DEPLOYMENT.md` | **Production deployment guide** |
| `DEPLOYMENT.md` | **Full deployment reference** |
| `backend/README.md` | Backend setup & development |
| `frontend/README.md` | Frontend setup & development |
| `04-task-definition/01-requirements.md` | Full requirements (Level 1 & 2 forms) |
| `03-research/architecture-design.md` | Architecture design |
| `02-principle-processes/tech-stack.md` | Tech stack decisions |
| `07-resources/database-schema.sql` | Database schema (14 tables) |
| `08-backlog-plan/MASTER_TASKLIST.md` | Complete task list & roadmap |

---

## 🎯 CURRENT STATUS

**Phase 1: Core Setup** - ✅ COMPLETED & DEPLOYED!

- ✅ Project structure created
- ✅ Django models (User, Organization, 11 System models)
- ✅ Django Admin configured
- ✅ Docker setup
- ✅ Deployed to production server
- ✅ Nginx reverse proxy configured
- ✅ DNS & SSL configured (Cloudflare)
- ✅ **LIVE**: https://thongkehethong.mindmaid.ai/admin/

**Phase 2: REST API** - ✅ COMPLETED & DEPLOYED!

- ✅ Serializers for all models (nested serializers)
- ✅ ViewSets with CRUD operations
- ✅ JWT authentication
- ✅ Filtering, search, pagination
- ✅ Custom actions (save_draft, submit, statistics)
- ✅ Swagger UI documentation
- ✅ **LIVE**: https://thongkehethong.mindmaid.ai/api/docs/

**Phase 3: Frontend** - ✅ COMPLETED (Ready for deployment)

- ✅ React 18 + TypeScript project with Vite
- ✅ Ant Design UI library (Vietnamese locale)
- ✅ Axios configured with JWT interceptor
- ✅ Zustand auth store
- ✅ Login page with authentication
- ✅ Dashboard with system statistics
- ✅ Systems list page (search, pagination)
- ✅ Organizations list page
- ✅ Main layout with sidebar navigation
- ✅ Protected routes
- ✅ Docker multi-stage build (Node + Nginx)
- ✅ Nginx configuration for SPA routing
- ✅ Production environment config
- ✅ Deployment script (`deploy.sh`)

**Phase 4: Deployment** - ⏳ NEXT

- See `SERVER_DEPLOYMENT.md` for step-by-step deployment guide
- Run `./deploy.sh` on server to deploy full stack

See `DEPLOYMENT_STATUS.md` for deployment details and `08-backlog-plan/MASTER_TASKLIST.md` for roadmap.

---

## 🔧 TECH STACK

### Backend
- Django 5.0.1 + Django REST Framework
- PostgreSQL 14+
- JWT Authentication
- **Django Admin Panel** for easy data management

### Frontend
- React 18 + TypeScript + Vite
- Ant Design (Vietnamese locale)
- Axios + JWT interceptor (auto token refresh)
- Zustand state management
- React Router DOM
- Nginx (production)

### DevOps
- Docker + Docker Compose
- Nginx reverse proxy
- Cloudflare SSL

---

## 🚀 NEXT STEPS

**Immediate:**
1. Deploy frontend to production server (see `SERVER_DEPLOYMENT.md`)
2. Configure domain & SSL
3. Test full stack on production

**Future Enhancements:**
1. Implement Create/Edit forms for Systems & Organizations
2. Add file upload functionality
3. Add form wizards for Level 1 & Level 2
4. Add data export (Word/Excel)
5. Add advanced filters

See detailed tasks in `08-backlog-plan/todo/` and `frontend/README.md`

---

## 🔗 USEFUL COMMANDS

```bash
# Development - Backend
cd backend
source venv/bin/activate
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver

# Development - Frontend
cd frontend
npm install
npm run dev  # http://localhost:5173

# Docker - Local Development
docker-compose up --build
docker-compose logs -f
docker-compose exec backend python manage.py shell

# Deployment - Production Server
./deploy.sh  # Automated deployment script

# Git
git status
git add .
git commit -m "message"
git push origin main
```

---

## 📞 DEPLOYMENT INFO

### Current Status
- **Backend API**: https://thongkehethong.mindmaid.ai/api/ ✅ LIVE
- **Admin Panel**: https://thongkehethong.mindmaid.ai/admin/ ✅ LIVE
- **API Docs**: https://thongkehethong.mindmaid.ai/api/docs/ ✅ LIVE
- **Frontend**: ⏳ Ready for deployment (see `SERVER_DEPLOYMENT.md`)

### Server Details
- **Server IP**: 34.142.152.104
- **Server Credentials**: See `07-resources/deploy-credentials.md`
- **Admin Credentials**: See `ADMIN_CREDENTIALS.md`

### Deployment Guides
- **Quick Deploy**: Run `./deploy.sh` on server
- **Full Guide**: See `SERVER_DEPLOYMENT.md`
- **Reference**: See `DEPLOYMENT.md`

---

**Created**: 2026-01-15
**Last Updated**: 2026-01-16
**Status**: Phase 3 Completed - Ready for Production Deployment
