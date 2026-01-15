# Backend - Django REST API

Hệ thống Báo cáo Thống kê Hệ thống - Django Backend

## Tech Stack

- Django 5.0.1
- Django REST Framework 3.14.0
- PostgreSQL 14+ (SQLite for local dev)
- JWT Authentication
- Docker support

## Setup (Local Development)

### Requirements

- Python 3.11+
- pip

### Installation

```bash
# Create virtual environment
python3.11 -m venv venv
source venv/bin/activate  # Mac/Linux
# venv\Scripts\activate  # Windows

# Install dependencies
pip install -r requirements.txt

# Create .env file
cp .env.example .env
# Edit .env with your settings

# Run migrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser

# Run development server
python manage.py runserver
```

Visit:
- http://localhost:8000/admin - Django Admin Panel
- http://localhost:8000/api/token/ - JWT Token endpoint

## Setup (Docker)

```bash
# Build and run
docker-compose up --build

# Create superuser
docker-compose exec backend python manage.py createsuperuser
```

## Project Structure

```
backend/
├── config/                 # Django settings
│   ├── settings.py
│   ├── urls.py
│   └── wsgi.py
├── apps/
│   ├── accounts/          # User management
│   ├── organizations/     # Organizations
│   ├── systems/           # Systems (main app)
│   └── reports/           # Report export
├── utils/                 # Utilities
├── media/                 # Uploaded files
├── manage.py
└── requirements.txt
```

## Next Steps

1. Complete System models (see `08-backlog-plan/todo/02-database-models.md`)
2. Create REST API serializers and viewsets
3. Add file upload functionality
4. Implement Word/Excel export

See `08-backlog-plan/MASTER_TASKLIST.md` for full roadmap.
