# Task: Create Database Models

**ID**: TODO-002
**Phase**: 1 - Core Setup
**Priority**: P0 (Critical)
**Estimate**: 4 hours
**Status**: TODO

---

## 📋 Description

Tạo tất cả Django models theo database schema đã thiết kế (14 tables).

---

## ✅ Acceptance Criteria

- [ ] Tất cả 14 models được tạo trong `apps/systems/models.py`
- [ ] User model được extend từ AbstractUser trong `apps/accounts/models.py`
- [ ] Organization model trong `apps/organizations/models.py`
- [ ] Tất cả relationships (ForeignKey, OneToOne) đúng
- [ ] JSONB fields sử dụng JSONField
- [ ] Migrations chạy thành công
- [ ] Có thể tạo dữ liệu test qua Django shell

---

## 🛠️ Implementation Steps

### 1. Create User Model (apps/accounts/models.py)
```python
from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    """Extended User model"""
    organization = models.ForeignKey(
        'organizations.Organization',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='users'
    )
    phone = models.CharField(max_length=20, blank=True)

    class Meta:
        db_table = 'users'
        verbose_name = 'User'
        verbose_name_plural = 'Users'
```

### 2. Create Organization Model (apps/organizations/models.py)
```python
from django.db import models

class Organization(models.Model):
    """Đơn vị trực thuộc Bộ"""
    name = models.CharField(max_length=255, unique=True)
    code = models.CharField(max_length=50, unique=True, null=True, blank=True)
    description = models.TextField(blank=True)
    contact_person = models.CharField(max_length=255, blank=True)
    contact_email = models.EmailField(blank=True)
    contact_phone = models.CharField(max_length=20, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'organizations'
        ordering = ['name']

    def __str__(self):
        return self.name
```

### 3. Create System Models (apps/systems/models.py)
```python
from django.db import models
from django.contrib.postgres.fields import ArrayField

class System(models.Model):
    """Hệ thống/Ứng dụng"""

    CRITICALITY_CHOICES = [
        ('critical', 'Tối quan trọng'),
        ('high', 'Quan trọng'),
        ('medium', 'Trung bình'),
        ('low', 'Thấp'),
    ]

    STATUS_CHOICES = [
        ('active', 'Đang vận hành'),
        ('pilot', 'Thí điểm'),
        ('inactive', 'Dừng'),
        ('replacing', 'Sắp thay thế'),
    ]

    # Basic Info (PHẦN 1)
    org = models.ForeignKey(
        'organizations.Organization',
        on_delete=models.CASCADE,
        related_name='systems'
    )
    system_code = models.CharField(max_length=50, unique=True)
    system_name = models.CharField(max_length=255)
    purpose = models.TextField()
    scope = models.JSONField(default=list)  # ['internal', 'ministry', 'external']
    target_users = models.JSONField(default=list)  # ['leader', 'staff', 'business', 'citizen']

    # System Identity
    go_live_date = models.DateField(null=True, blank=True)
    current_version = models.CharField(max_length=50, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')
    criticality = models.CharField(max_length=20, choices=CRITICALITY_CHOICES, default='medium')

    # Stats
    total_users = models.IntegerField(null=True, blank=True)
    dau = models.IntegerField(null=True, blank=True, verbose_name='Daily Active Users')
    mau = models.IntegerField(null=True, blank=True, verbose_name='Monthly Active Users')

    # Contact
    business_owner = models.CharField(max_length=255, blank=True)
    technical_owner = models.CharField(max_length=255, blank=True)
    contact_person = models.CharField(max_length=255, blank=True)
    contact_phone = models.CharField(max_length=20, blank=True)
    contact_email = models.EmailField(blank=True)

    # Metadata
    level = models.IntegerField(default=1, choices=[(1, 'Level 1'), (2, 'Level 2')])
    is_submitted = models.BooleanField(default=False)
    submitted_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'systems'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['org', 'status']),
            models.Index(fields=['system_code']),
        ]

    def __str__(self):
        return f"{self.system_code} - {self.system_name}"


class SystemArchitecture(models.Model):
    """PHẦN 2: Kiến trúc & Công nghệ"""
    system = models.OneToOneField(
        System,
        on_delete=models.CASCADE,
        related_name='architecture'
    )

    # Architecture
    architecture_type = models.CharField(max_length=50, blank=True)  # monolithic, modular, microservices
    has_architecture_diagram = models.BooleanField(default=False)

    # Technology
    backend_tech = models.CharField(max_length=255, blank=True)
    frontend_tech = models.CharField(max_length=255, blank=True)
    mobile_app = models.CharField(max_length=50, blank=True)  # native, hybrid, none

    # Database
    database_type = models.CharField(max_length=100, blank=True)
    database_model = models.CharField(max_length=50, blank=True)  # centralized, distributed, per-app
    has_data_model_doc = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'system_architecture'


class SystemDataInfo(models.Model):
    """PHẦN 3: Dữ liệu"""
    system = models.OneToOneField(
        System,
        on_delete=models.CASCADE,
        related_name='data_info'
    )

    # Data volume
    storage_size_gb = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    growth_rate_percent = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)

    # Data types
    data_types = models.JSONField(default=list)  # ['business', 'documents', 'stats', 'master']

    # Sharing
    has_api = models.BooleanField(default=False)
    shared_with_systems = models.TextField(blank=True)
    has_data_standard = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'system_data_info'


class SystemOperations(models.Model):
    """PHẦN 4: Vận hành & Nhân sự"""
    system = models.OneToOneField(
        System,
        on_delete=models.CASCADE,
        related_name='operations'
    )

    # Development
    dev_type = models.CharField(max_length=50, blank=True)  # internal, outsource, combined
    developer = models.CharField(max_length=255, blank=True)

    # Warranty
    warranty_status = models.CharField(max_length=50, blank=True)  # active, expired
    warranty_end_date = models.DateField(null=True, blank=True)
    has_maintenance_contract = models.BooleanField(default=False)
    maintenance_end_date = models.DateField(null=True, blank=True)

    # Operations
    operator = models.CharField(max_length=255, blank=True)
    vendor_dependency = models.CharField(max_length=20, blank=True)  # high, medium, low
    can_self_maintain = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'system_operations'


# ... Continue with other models (Integration, Assessment, Cost, Vendor, etc.)
```

### 4. Update config/settings.py
```python
# Use custom User model
AUTH_USER_MODEL = 'accounts.User'
```

### 5. Create & Run Migrations
```bash
python manage.py makemigrations
python manage.py migrate
```

### 6. Test in Django shell
```bash
python manage.py shell

from apps.organizations.models import Organization
from apps.systems.models import System

# Create organization
org = Organization.objects.create(name="Văn phòng Bộ", code="VPB")

# Create system
system = System.objects.create(
    org=org,
    system_code="SYS001",
    system_name="Hệ thống quản lý văn bản",
    purpose="Quản lý văn bản điện tử"
)

print(system)  # Should work
```

---

## 📦 Deliverables

- All 14 models in `apps/systems/models.py`
- User model in `apps/accounts/models.py`
- Organization model in `apps/organizations/models.py`
- Migration files generated
- Database tables created

---

## 🔗 Dependencies

**Blocked by**: TODO-001 (Init Django Project)
**Blocks**: TODO-003 (Django Admin Config)

---

## 📝 Notes

- Refer to `07-resources/database-schema.sql` for complete table structure
- Use JSONField for flexible data (target_users, data_types, etc.)
- All models should have created_at, updated_at timestamps
- Use meaningful related_name for reverse relationships

---

**Created**: 2026-01-15
