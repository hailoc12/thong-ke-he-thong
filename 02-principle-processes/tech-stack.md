# TECH STACK - HỆ THỐNG BÁO CÁO THỐNG KÊ HỆ THỐNG

**Ngày**: 2026-01-15 (Updated)
**Stack**: Python Django + React + PostgreSQL

---

## I. TỔNG QUAN

### Quyết định Tech Stack

**Backend**: Python Django REST Framework
**Frontend**: React + TypeScript
**Database**: PostgreSQL
**Deployment**: Docker + Nginx + Cloudflare

### Lý do chọn

| Component | Lựa chọn | Lý do |
|-----------|----------|-------|
| **Backend** | Django REST Framework | - **Built-in Admin Panel** (quản lý data dễ dàng)<br>- Mature, battle-tested framework<br>- Excellent ORM (Django Models)<br>- Word/Excel libraries (python-docx, openpyxl)<br>- Authentication sẵn có<br>- Security features tốt |
| **Frontend** | React + TypeScript | - Component-based, reusable<br>- Rich ecosystem<br>- Type safety với TypeScript<br>- Good form libraries |
| **Database** | PostgreSQL | - Enterprise-grade, reliable<br>- JSONB support (flexible schema)<br>- Good performance<br>- Free, open-source |
| **UI Library** | Ant Design | - Comprehensive components<br>- Form support tốt<br>- Professional look<br>- Good documentation |

---

## II. BACKEND STACK

### Core Framework

```
Django 5.0+
  └── Full-featured Python web framework
      - Built-in Admin Panel (tự động quản lý data)
      - Excellent ORM (Django Models)
      - Authentication & Authorization sẵn
      - Security features (CSRF, SQL injection protection)
      - Migrations (django-admin makemigrations/migrate)

Django REST Framework 3.14+
  └── REST API toolkit cho Django
      - Serializers (validation & conversion)
      - ViewSets & Routers
      - Authentication (JWT, Session, Token)
      - Permissions & Throttling
      - Browsable API (auto docs)
```

### Dependencies

```txt
# Core Django
Django==5.0.1
djangorestframework==3.14.0
django-cors-headers==4.3.1     # CORS support

# Database
psycopg2-binary==2.9.9         # PostgreSQL driver

# Authentication
djangorestframework-simplejwt==5.3.1  # JWT tokens
django-filter==23.5            # Filtering support

# Document Generation
python-docx==1.1.0             # Word export
openpyxl==3.1.2                # Excel export
Pillow==10.1.0                 # Image processing

# Utilities
python-dateutil==2.8.2
pytz==2023.3
django-environ==0.11.2         # Environment variables

# Development
pytest==7.4.3                  # Testing
pytest-django==4.7.0           # Django test support
black==23.12.0                 # Code formatting
flake8==6.1.0                  # Linting
mypy==1.7.1                    # Type checking
django-debug-toolbar==4.2.0    # Debug tools

# Production
gunicorn==21.2.0               # WSGI server
whitenoise==6.6.0              # Static files serving
```

### Project Structure

```
backend/
├── config/                     # Django project config
│   ├── __init__.py
│   ├── settings.py             # Django settings
│   ├── urls.py                 # Root URL config
│   ├── wsgi.py                 # WSGI entry
│   └── asgi.py                 # ASGI entry
│
├── apps/
│   ├── accounts/               # User & Auth app
│   │   ├── migrations/
│   │   ├── __init__.py
│   │   ├── models.py           # User model (extend AbstractUser)
│   │   ├── admin.py            # Admin config
│   │   ├── serializers.py      # DRF serializers
│   │   ├── views.py            # API views
│   │   └── urls.py             # App URLs
│   │
│   ├── organizations/          # Organizations app
│   │   ├── migrations/
│   │   ├── __init__.py
│   │   ├── models.py           # Organization model
│   │   ├── admin.py            # Admin panel config
│   │   ├── serializers.py      # DRF serializers
│   │   ├── views.py            # ViewSets
│   │   └── urls.py
│   │
│   ├── systems/                # Systems app (main business logic)
│   │   ├── migrations/
│   │   ├── __init__.py
│   │   ├── models.py           # System + related models (14 models)
│   │   ├── admin.py            # Admin panel (quan trọng!)
│   │   ├── serializers.py      # Serializers cho API
│   │   ├── views.py            # ViewSets (CRUD API)
│   │   ├── filters.py          # django-filter
│   │   ├── permissions.py      # Custom permissions
│   │   └── urls.py
│   │
│   └── reports/                # Export reports app
│       ├── __init__.py
│       ├── views.py            # Export views (Word/Excel)
│       ├── services/
│       │   ├── word_export.py
│       │   └── excel_export.py
│       └── urls.py
│
├── utils/                      # Shared utilities
│   ├── __init__.py
│   ├── validators.py           # Custom validators (5 rules)
│   ├── file_storage.py         # File upload handling
│   └── helpers.py
│
├── media/                      # Uploaded files (git-ignored)
├── staticfiles/                # Collected static files
│
├── manage.py                   # Django CLI
├── requirements.txt
├── requirements-dev.txt
├── .env.example
├── .gitignore
├── Dockerfile
└── README.md
```

### Configuration (config/settings.py)

```python
import os
from pathlib import Path
import environ

# Build paths
BASE_DIR = Path(__file__).resolve().parent.parent

# Environment variables
env = environ.Env(DEBUG=(bool, False))
environ.Env.read_env(os.path.join(BASE_DIR, '.env'))

# Security
SECRET_KEY = env('SECRET_KEY')
DEBUG = env('DEBUG')
ALLOWED_HOSTS = env.list('ALLOWED_HOSTS', default=['localhost', '127.0.0.1'])

# Apps
INSTALLED_APPS = [
    # Django apps
    'django.contrib.admin',          # Admin panel (!)
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

# Database
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': env('DB_NAME'),
        'USER': env('DB_USER'),
        'PASSWORD': env('DB_PASSWORD'),
        'HOST': env('DB_HOST', default='localhost'),
        'PORT': env('DB_PORT', default='5432'),
    }
}

# REST Framework
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',
    ],
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 20,
    'DEFAULT_FILTER_BACKENDS': [
        'django_filters.rest_framework.DjangoFilterBackend',
    ],
}

# JWT Settings
from datetime import timedelta
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(hours=1),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
}

# CORS
CORS_ALLOWED_ORIGINS = env.list('CORS_ORIGINS', default=['http://localhost:3000'])

# Media Files (uploads)
MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'
MAX_FILE_SIZE_MB = 50

# Static Files
STATIC_URL = '/static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'
```

---

## III. FRONTEND STACK

### Core Framework

```
React 18.2+
TypeScript 5.0+
Vite 5.0+                     # Build tool (fast HMR)
```

### Dependencies

```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.20.0",

    "antd": "^5.11.0",
    "@ant-design/icons": "^5.2.0",

    "axios": "^1.6.0",
    "react-query": "^3.39.0",

    "react-hook-form": "^7.48.0",
    "zod": "^3.22.0",
    "@hookform/resolvers": "^3.3.0",

    "zustand": "^4.4.0",

    "dayjs": "^1.11.0",
    "recharts": "^2.10.0",
    "react-dropzone": "^14.2.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "@types/node": "^20.10.0",

    "@vitejs/plugin-react": "^4.2.0",
    "vite": "^5.0.0",

    "typescript": "^5.0.0",
    "eslint": "^8.55.0",
    "prettier": "^3.1.0",

    "@testing-library/react": "^14.1.0",
    "@testing-library/jest-dom": "^6.1.0",
    "vitest": "^1.0.0"
  }
}
```

### Project Structure

```
frontend/
├── public/
│   ├── favicon.ico
│   └── logo.png
│
├── src/
│   ├── main.tsx                # Entry point
│   ├── App.tsx                 # Root component
│   ├── vite-env.d.ts
│   │
│   ├── components/
│   │   ├── Layout/
│   │   │   ├── AppLayout.tsx
│   │   │   ├── Header.tsx
│   │   │   └── Sidebar.tsx
│   │   │
│   │   ├── FormBuilder/        # Dynamic forms
│   │   │   ├── FormSection.tsx
│   │   │   ├── BasicInfoForm.tsx
│   │   │   ├── ArchitectureForm.tsx
│   │   │   ├── DataInfoForm.tsx
│   │   │   ├── OperationsForm.tsx
│   │   │   ├── IntegrationForm.tsx
│   │   │   ├── AssessmentForm.tsx
│   │   │   └── DetailedForms/
│   │   │       ├── InfrastructureForm.tsx
│   │   │       ├── SecurityForm.tsx
│   │   │       ├── ServiceOpsForm.tsx
│   │   │       ├── VendorForm.tsx
│   │   │       └── CostForm.tsx
│   │   │
│   │   ├── FileUpload/
│   │   │   ├── FileUploader.tsx
│   │   │   └── FileList.tsx
│   │   │
│   │   ├── DataTable/
│   │   │   ├── SystemsTable.tsx
│   │   │   └── IntegrationsTable.tsx
│   │   │
│   │   ├── Dashboard/
│   │   │   ├── StatsCards.tsx
│   │   │   ├── TechStackChart.tsx
│   │   │   └── IntegrationMap.tsx
│   │   │
│   │   └── Common/
│   │       ├── LoadingSpinner.tsx
│   │       ├── ErrorBoundary.tsx
│   │       └── ConfirmDialog.tsx
│   │
│   ├── pages/
│   │   ├── Login.tsx
│   │   ├── Dashboard.tsx
│   │   ├── Organizations/
│   │   │   ├── OrganizationList.tsx
│   │   │   ├── OrganizationCreate.tsx
│   │   │   └── OrganizationDetail.tsx
│   │   ├── Systems/
│   │   │   ├── SystemList.tsx
│   │   │   ├── SystemCreate.tsx
│   │   │   ├── SystemEdit.tsx
│   │   │   └── SystemDetail.tsx
│   │   └── Reports/
│   │       └── ReportExport.tsx
│   │
│   ├── services/               # API clients
│   │   ├── api.ts              # Axios instance
│   │   ├── auth.service.ts
│   │   ├── organization.service.ts
│   │   ├── system.service.ts
│   │   └── report.service.ts
│   │
│   ├── stores/                 # Zustand stores
│   │   ├── authStore.ts
│   │   └── systemStore.ts
│   │
│   ├── types/                  # TypeScript types
│   │   ├── organization.ts
│   │   ├── system.ts
│   │   ├── integration.ts
│   │   └── api.ts
│   │
│   ├── utils/
│   │   ├── validation.ts
│   │   ├── formatters.ts
│   │   └── constants.ts
│   │
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── useSystem.ts
│   │   └── useDebounce.ts
│   │
│   └── styles/
│       └── global.css
│
├── .env.example
├── .gitignore
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

### Vite Configuration

```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
})
```

### TypeScript Config

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,

    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",

    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,

    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

---

## IV. DATABASE STACK

### PostgreSQL 14+

**Lý do chọn PostgreSQL**:
1. ✅ **JSONB support**: Flexible schema cho dữ liệu không cố định
2. ✅ **Full-text search**: Tìm kiếm nhanh
3. ✅ **ACID compliant**: Data integrity
4. ✅ **Mature**: 20+ years, proven
5. ✅ **Open-source**: Free, no licensing cost
6. ✅ **Good tools**: pgAdmin, DBeaver, Postico

### Key Features Used

1. **JSONB columns**:
   ```sql
   target_users JSONB,           -- ["leader", "staff", "business"]
   data_types JSONB,              -- ["business", "documents"]
   licenses JSONB                 -- [{type, product, qty}]
   ```

2. **GIN Indexes** cho JSONB:
   ```sql
   CREATE INDEX idx_systems_target_users
   ON systems USING GIN(target_users);
   ```

3. **Foreign Keys với CASCADE**:
   ```sql
   org_id INTEGER REFERENCES organizations(id) ON DELETE CASCADE
   ```

4. **CHECK constraints**:
   ```sql
   CHECK (storage_size_gb >= 0)
   CHECK (criticality_level IN ('critical', 'high', 'medium', 'low'))
   ```

5. **Full-text search** (optional):
   ```sql
   CREATE INDEX idx_systems_fulltext
   ON systems USING GIN(to_tsvector('english', system_name || ' ' || purpose));
   ```

### Migration Tool: Alembic

```python
# alembic/env.py
from app.database import Base
from app.models import *

target_metadata = Base.metadata

# Auto-generate migrations
alembic revision --autogenerate -m "Add systems table"
alembic upgrade head
```

---

## V. DEPLOYMENT STACK

### Docker

**Dockerfile (Backend)**:
```dockerfile
FROM python:3.11-slim

WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy app
COPY . .

# Run
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

**Dockerfile (Frontend)**:
```dockerfile
FROM node:18-alpine as build

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### Docker Compose

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:14-alpine
    environment:
      POSTGRES_DB: system_reports
      POSTGRES_USER: app
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U app"]
      interval: 10s
      timeout: 5s
      retries: 5

  backend:
    build: ./backend
    environment:
      DATABASE_URL: postgresql://app:${DB_PASSWORD}@postgres/system_reports
      JWT_SECRET_KEY: ${JWT_SECRET}
    volumes:
      - ./backend:/app
      - upload_data:/app/uploads
    ports:
      - "8000:8000"
    depends_on:
      postgres:
        condition: service_healthy
    command: uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

  frontend:
    build: ./frontend
    ports:
      - "3000:80"
    depends_on:
      - backend

volumes:
  postgres_data:
  upload_data:
```

### Nginx (Production)

```nginx
# nginx.conf
server {
    listen 80;
    server_name system-reports.example.com;

    # Frontend
    location / {
        root /usr/share/nginx/html;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://backend:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    # File uploads (increase size)
    client_max_body_size 50M;
}
```

---

## VI. DEVELOPMENT TOOLS

### Backend Development

```bash
# Virtual environment
python -m venv venv
source venv/bin/activate  # or venv\Scripts\activate on Windows

# Install dependencies
pip install -r requirements-dev.txt

# Run dev server (auto-reload)
uvicorn app.main:app --reload --port 8000

# Run tests
pytest

# Code formatting
black app/
flake8 app/
mypy app/

# Database migrations
alembic revision --autogenerate -m "description"
alembic upgrade head
```

### Frontend Development

```bash
# Install dependencies
npm install

# Run dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Linting
npm run lint

# Type checking
npm run type-check

# Tests
npm run test
```

### Database Tools

- **pgAdmin 4**: GUI for PostgreSQL
- **DBeaver**: Universal database tool
- **psql**: Command-line client

---

## VII. TESTING STACK

### Backend Testing

```python
# pytest + httpx
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_create_system():
    response = client.post(
        "/api/systems",
        json={"system_name": "Test", "org_id": 1},
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 201
    assert response.json()["data"]["system_name"] == "Test"
```

### Frontend Testing

```typescript
// Vitest + React Testing Library
import { render, screen } from '@testing-library/react'
import { SystemList } from './SystemList'

test('renders system list', () => {
  render(<SystemList />)
  expect(screen.getByText('Danh sách hệ thống')).toBeInTheDocument()
})
```

### E2E Testing (Optional, Phase 2)

- **Playwright**: Browser automation
- **Cypress**: E2E testing

---

## VIII. CI/CD TOOLS

### GitHub Actions

```yaml
# .github/workflows/test.yml
name: Test

on: [push, pull_request]

jobs:
  backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-python@v4
        with:
          python-version: '3.11'
      - run: pip install -r requirements.txt
      - run: pytest

  frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run test
      - run: npm run build
```

---

## IX. MONITORING & LOGGING

### Application Logs

**Backend**:
```python
import logging

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

logger = logging.getLogger(__name__)
logger.info("System created", extra={"system_id": 123})
```

**Frontend**:
```typescript
// Console logging in development
if (import.meta.env.DEV) {
  console.log('[API]', response.data)
}

// Error tracking
window.addEventListener('error', (event) => {
  // Send to error tracking service (Sentry, etc.)
})
```

### Metrics (Optional, Phase 2)

- **Prometheus**: Metrics collection
- **Grafana**: Visualization
- **Sentry**: Error tracking

---

## X. SECURITY TOOLS

### Backend Security

```python
# Password hashing
from passlib.context import CryptContext
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# JWT
from jose import JWTError, jwt
SECRET_KEY = "your-secret-key"
ALGORITHM = "HS256"

# CORS
from fastapi.middleware.cors import CORSMiddleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### HTTPS

```bash
# Let's Encrypt (Certbot)
certbot --nginx -d system-reports.example.com
```

---

## XI. REFERENCE

**Official Docs**:
- FastAPI: https://fastapi.tiangolo.com
- React: https://react.dev
- TypeScript: https://www.typescriptlang.org
- PostgreSQL: https://www.postgresql.org/docs
- Ant Design: https://ant.design
- Vite: https://vitejs.dev

**Libraries**:
- SQLAlchemy: https://www.sqlalchemy.org
- Pydantic: https://docs.pydantic.dev
- React Hook Form: https://react-hook-form.com
- Zod: https://zod.dev
- python-docx: https://python-docx.readthedocs.io
- openpyxl: https://openpyxl.readthedocs.io

**Related Files**:
- Architecture: `03-research/architecture-design.md`
- Database: `07-resources/database-schema.sql`
- Implementation: `08-backlog-plan/implementation-roadmap.md`
