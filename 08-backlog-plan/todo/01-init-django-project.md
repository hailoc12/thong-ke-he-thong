# Task: Init Django Project Structure

**ID**: TODO-001
**Phase**: 1 - Core Setup
**Priority**: P0 (Critical)
**Estimate**: 2 hours
**Status**: TODO

---

## 📋 Description

Khởi tạo Django project với cấu trúc chuẩn, bao gồm Django core + Django REST Framework.

---

## ✅ Acceptance Criteria

- [ ] Django project được tạo với tên `config`
- [ ] 4 Django apps được tạo: accounts, organizations, systems, reports
- [ ] requirements.txt có đầy đủ dependencies
- [ ] .env.example được tạo với các variables cần thiết
- [ ] Django admin panel accessible tại `/admin`
- [ ] API root accessible tại `/api/`
- [ ] Django migrations chạy thành công
- [ ] Chạy `python manage.py runserver` không lỗi

---

## 🛠️ Implementation Steps

### 1. Setup virtual environment
```bash
cd backend
python3 -m venv venv
source venv/bin/activate  # Mac/Linux
# venv\Scripts\activate  # Windows
```

### 2. Install Django
```bash
pip install Django==5.0.1 djangorestframework==3.14.0
django-admin startproject config .
```

### 3. Create apps
```bash
mkdir apps
cd apps
python ../manage.py startapp accounts
python ../manage.py startapp organizations
python ../manage.py startapp systems
python ../manage.py startapp reports
cd ..
```

### 4. Install all dependencies
```bash
pip install djangorestframework-simplejwt==5.3.1 \
    django-cors-headers==4.3.1 \
    django-filter==23.5 \
    psycopg2-binary==2.9.9 \
    python-docx==1.1.0 \
    openpyxl==3.1.2 \
    Pillow==10.1.0 \
    django-environ==0.11.2 \
    gunicorn==21.2.0 \
    whitenoise==6.6.0

pip freeze > requirements.txt
```

### 5. Update config/settings.py
```python
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',

    # Third-party
    'rest_framework',
    'rest_framework_simplejwt',
    'corsheaders',
    'django_filters',

    # Local apps
    'apps.accounts',
    'apps.organizations',
    'apps.systems',
    'apps.reports',
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',  # Static files
    'corsheaders.middleware.CorsMiddleware',        # CORS
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]
```

### 6. Create .env.example
```env
# Django
SECRET_KEY=your-secret-key-here
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

# Database
DB_NAME=system_reports
DB_USER=postgres
DB_PASSWORD=postgres
DB_HOST=localhost
DB_PORT=5432

# CORS
CORS_ORIGINS=http://localhost:3000,http://localhost:5173
```

### 7. Run initial migrations
```bash
python manage.py makemigrations
python manage.py migrate
```

### 8. Create superuser
```bash
python manage.py createsuperuser
# Username: admin
# Email: admin@example.com
# Password: admin123
```

### 9. Test server
```bash
python manage.py runserver
# Visit http://localhost:8000/admin
```

---

## 📦 Deliverables

- `backend/` folder với Django project
- `backend/requirements.txt`
- `backend/.env.example`
- `backend/manage.py`
- `backend/config/settings.py` configured
- 4 apps: accounts, organizations, systems, reports

---

## 🔗 Dependencies

**Blocked by**: None (first task)
**Blocks**:
- TODO-002 (Database Models)
- TODO-003 (Django Admin Config)

---

## 📝 Notes

- Use Django 5.0.1 (latest stable)
- Use Python 3.10+
- PostgreSQL will be configured later, use SQLite for now in development

---

**Created**: 2026-01-15
**Updated**: 2026-01-15
