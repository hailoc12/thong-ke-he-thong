# Task: Setup REST API with DRF

**ID**: TODO-004
**Phase**: 1 - Core Setup
**Priority**: P0 (Critical)
**Estimate**: 4 hours
**Status**: TODO

---

## 📋 Description

Setup Django REST Framework APIs cho Organizations và Systems (CRUD operations).

---

## ✅ Acceptance Criteria

- [ ] JWT authentication working
- [ ] `/api/token/` - Get JWT tokens
- [ ] `/api/organizations/` - List & Create
- [ ] `/api/organizations/<id>/` - Get, Update, Delete
- [ ] `/api/systems/` - List & Create
- [ ] `/api/systems/<id>/` - Get, Update, Delete
- [ ] Permissions working (IsAuthenticated)
- [ ] Pagination working
- [ ] Filtering working (by org, status)
- [ ] Browsable API accessible

---

## 🛠️ Implementation Steps

### 1. Create Serializers (apps/organizations/serializers.py)
```python
from rest_framework import serializers
from .models import Organization

class OrganizationSerializer(serializers.ModelSerializer):
    systems_count = serializers.SerializerMethodField()

    class Meta:
        model = Organization
        fields = [
            'id', 'name', 'code', 'description',
            'contact_person', 'contact_email', 'contact_phone',
            'systems_count', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def get_systems_count(self, obj):
        return obj.systems.count()
```

### 2. Create ViewSets (apps/organizations/views.py)
```python
from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Organization
from .serializers import OrganizationSerializer

class OrganizationViewSet(viewsets.ModelViewSet):
    """
    API endpoint for organizations.

    list: Get all organizations
    create: Create new organization
    retrieve: Get organization by ID
    update: Update organization
    partial_update: Partial update organization
    destroy: Delete organization
    """
    queryset = Organization.objects.all()
    serializer_class = OrganizationSerializer
    permission_classes = [permissions.IsAuthenticated]
    search_fields = ['name', 'code']
    ordering_fields = ['name', 'created_at']
    ordering = ['name']

    @action(detail=True, methods=['get'])
    def systems(self, request, pk=None):
        """Get all systems of this organization"""
        org = self.get_object()
        systems = org.systems.all()
        # Return systems data (serialized)
        return Response({'systems': systems.count()})
```

### 3. Create URLs (apps/organizations/urls.py)
```python
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import OrganizationViewSet

router = DefaultRouter()
router.register(r'', OrganizationViewSet, basename='organization')

urlpatterns = [
    path('', include(router.urls)),
]
```

### 4. Create System Serializers (apps/systems/serializers.py)
```python
from rest_framework import serializers
from .models import (
    System, SystemArchitecture, SystemDataInfo, SystemOperations
)

class SystemArchitectureSerializer(serializers.ModelSerializer):
    class Meta:
        model = SystemArchitecture
        exclude = ['id', 'system']

class SystemDataInfoSerializer(serializers.ModelSerializer):
    class Meta:
        model = SystemDataInfo
        exclude = ['id', 'system']

class SystemOperationsSerializer(serializers.ModelSerializer):
    class Meta:
        model = SystemOperations
        exclude = ['id', 'system']

class SystemDetailSerializer(serializers.ModelSerializer):
    architecture = SystemArchitectureSerializer(required=False)
    data_info = SystemDataInfoSerializer(required=False)
    operations = SystemOperationsSerializer(required=False)
    org_name = serializers.CharField(source='org.name', read_only=True)

    class Meta:
        model = System
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at', 'submitted_at']

    def create(self, validated_data):
        # Extract nested data
        arch_data = validated_data.pop('architecture', {})
        data_info = validated_data.pop('data_info', {})
        ops_data = validated_data.pop('operations', {})

        # Create system
        system = System.objects.create(**validated_data)

        # Create related objects
        SystemArchitecture.objects.create(system=system, **arch_data)
        SystemDataInfo.objects.create(system=system, **data_info)
        SystemOperations.objects.create(system=system, **ops_data)

        return system

class SystemListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for list view"""
    org_name = serializers.CharField(source='org.name', read_only=True)

    class Meta:
        model = System
        fields = [
            'id', 'system_code', 'system_name', 'org', 'org_name',
            'status', 'criticality', 'level', 'is_submitted', 'updated_at'
        ]
```

### 5. Create System ViewSet (apps/systems/views.py)
```python
from rest_framework import viewsets, permissions, filters
from django_filters.rest_framework import DjangoFilterBackend
from .models import System
from .serializers import SystemListSerializer, SystemDetailSerializer

class SystemViewSet(viewsets.ModelViewSet):
    """API endpoint for systems"""
    queryset = System.objects.select_related('org').prefetch_related(
        'architecture', 'data_info', 'operations'
    )
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['org', 'status', 'criticality', 'level', 'is_submitted']
    search_fields = ['system_code', 'system_name', 'purpose']
    ordering_fields = ['created_at', 'updated_at', 'system_name']
    ordering = ['-updated_at']

    def get_serializer_class(self):
        if self.action == 'list':
            return SystemListSerializer
        return SystemDetailSerializer
```

### 6. Configure Root URLs (config/urls.py)
```python
from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

urlpatterns = [
    path('admin/', admin.site.urls),

    # JWT Authentication
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

    # API Endpoints
    path('api/organizations/', include('apps.organizations.urls')),
    path('api/systems/', include('apps.systems.urls')),
]
```

### 7. Test APIs
```bash
# Get JWT token
curl -X POST http://localhost:8000/api/token/ \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "admin123"}'

# Response: {"access": "...", "refresh": "..."}

# List organizations
curl http://localhost:8000/api/organizations/ \
  -H "Authorization: Bearer <access_token>"

# Create organization
curl -X POST http://localhost:8000/api/organizations/ \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{"name": "Test Org", "code": "TEST"}'

# List systems
curl http://localhost:8000/api/systems/ \
  -H "Authorization: Bearer <access_token>"
```

---

## 📦 Deliverables

- Serializers for Organization & System
- ViewSets with full CRUD
- URL routing configured
- JWT authentication working
- Filterset_fields and search working
- Browsable API at `/api/`

---

## 🔗 Dependencies

**Blocked by**: TODO-002 (Database Models)
**Blocks**: Frontend development

---

## 📝 Notes

- Use `select_related` và `prefetch_related` để optimize queries
- Separate serializers for list (lightweight) and detail (full data)
- Browsable API is great for testing without frontend

---

**Created**: 2026-01-15
