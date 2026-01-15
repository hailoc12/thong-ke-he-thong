# Task: Configure Django Admin Panel

**ID**: TODO-003
**Phase**: 1 - Core Setup
**Priority**: P0 (Critical)
**Estimate**: 3 hours
**Status**: TODO

---

## 📋 Description

Cấu hình Django Admin Panel để quản lý dữ liệu dễ dàng. Đây là lý do chính chọn Django!

---

## ✅ Acceptance Criteria

- [ ] All models registered in admin
- [ ] Custom admin classes với list_display, search_fields, filters
- [ ] Inline editing cho related models (Architecture, DataInfo, etc.)
- [ ] Admin panel accessible tại `/admin`
- [ ] Can create, edit, delete organizations
- [ ] Can create, edit, delete systems với all related info
- [ ] Pretty UI với custom admin templates (optional)

---

## 🛠️ Implementation Steps

### 1. Register Organization Admin (apps/organizations/admin.py)
```python
from django.contrib import admin
from .models import Organization

@admin.register(Organization)
class OrganizationAdmin(admin.ModelAdmin):
    list_display = ['code', 'name', 'contact_person', 'contact_email', 'created_at']
    search_fields = ['name', 'code', 'contact_person']
    list_filter = ['created_at']
    ordering = ['name']
    date_hierarchy = 'created_at'

    fieldsets = (
        ('Basic Info', {
            'fields': ('name', 'code', 'description')
        }),
        ('Contact Info', {
            'fields': ('contact_person', 'contact_email', 'contact_phone')
        }),
    )
```

### 2. Register System Admin with Inlines (apps/systems/admin.py)
```python
from django.contrib import admin
from .models import (
    System, SystemArchitecture, SystemDataInfo,
    SystemOperations, Integration, Assessment
)

class SystemArchitectureInline(admin.StackedInline):
    model = SystemArchitecture
    extra = 0
    can_delete = False

class SystemDataInfoInline(admin.StackedInline):
    model = SystemDataInfo
    extra = 0
    can_delete = False

class SystemOperationsInline(admin.StackedInline):
    model = SystemOperations
    extra = 0
    can_delete = False

class IntegrationInline(admin.TabularInline):
    model = Integration
    extra = 1
    fk_name = 'from_system'

@admin.register(System)
class SystemAdmin(admin.ModelAdmin):
    list_display = [
        'system_code',
        'system_name',
        'org',
        'status',
        'criticality',
        'level',
        'is_submitted',
        'updated_at'
    ]
    search_fields = ['system_code', 'system_name', 'purpose']
    list_filter = ['status', 'criticality', 'level', 'is_submitted', 'org']
    date_hierarchy = 'created_at'
    ordering = ['-updated_at']

    inlines = [
        SystemArchitectureInline,
        SystemDataInfoInline,
        SystemOperationsInline,
        IntegrationInline,
    ]

    fieldsets = (
        ('Basic Info', {
            'fields': ('org', 'system_code', 'system_name', 'purpose', 'level')
        }),
        ('Scope & Users', {
            'fields': ('scope', 'target_users')
        }),
        ('Status', {
            'fields': ('status', 'criticality', 'go_live_date', 'current_version')
        }),
        ('Stats', {
            'fields': ('total_users', 'dau', 'mau'),
            'classes': ['collapse']
        }),
        ('Contact', {
            'fields': ('business_owner', 'technical_owner', 'contact_person', 'contact_phone', 'contact_email'),
            'classes': ['collapse']
        }),
        ('Submission', {
            'fields': ('is_submitted', 'submitted_at'),
            'classes': ['collapse']
        }),
    )

    readonly_fields = ['created_at', 'updated_at', 'submitted_at']

    def save_model(self, request, obj, form, change):
        """Auto-create related models if not exist"""
        super().save_model(request, obj, form, change)

        # Create architecture if not exist
        if not hasattr(obj, 'architecture'):
            SystemArchitecture.objects.create(system=obj)

        # Create data_info if not exist
        if not hasattr(obj, 'data_info'):
            SystemDataInfo.objects.create(system=obj)

        # Create operations if not exist
        if not hasattr(obj, 'operations'):
            SystemOperations.objects.create(system=obj)
```

### 3. Register User Admin (apps/accounts/admin.py)
```python
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User

@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ['username', 'email', 'organization', 'is_staff', 'is_active']
    list_filter = ['is_staff', 'is_active', 'organization']
    search_fields = ['username', 'email', 'first_name', 'last_name']

    fieldsets = BaseUserAdmin.fieldsets + (
        ('Additional Info', {
            'fields': ('organization', 'phone')
        }),
    )
```

### 4. Customize Admin Site (config/admin.py)
```python
from django.contrib import admin

admin.site.site_header = "Hệ thống Báo cáo Thống kê"
admin.site.site_title = "Admin Portal"
admin.site.index_title = "Quản lý Hệ thống"
```

Then in `config/urls.py`, import this to apply customization.

### 5. Test Admin Panel
```bash
python manage.py runserver
# Visit http://localhost:8000/admin
# Login with superuser created in TODO-001
# Test creating Organization
# Test creating System with related data
```

---

## 📦 Deliverables

- `apps/organizations/admin.py` configured
- `apps/systems/admin.py` with inlines
- `apps/accounts/admin.py` for users
- Admin panel fully functional
- Can manage all data via admin UI

---

## 🔗 Dependencies

**Blocked by**: TODO-002 (Database Models)
**Blocks**: None (parallel với API development)

---

## 📝 Notes

- Django Admin is a HUGE advantage - use it fully!
- Inlines make editing related data much easier
- Custom list_display and filters improve UX
- Consider django-admin-interface or grappelli for better UI (optional)

---

**Created**: 2026-01-15
