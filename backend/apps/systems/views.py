from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q

from apps.accounts.permissions import IsOrgUserOrAdmin, CanManageOrgSystems
from .models import System, Attachment
from .serializers import (
    SystemListSerializer,
    SystemDetailSerializer,
    SystemCreateUpdateSerializer,
    AttachmentSerializer,
)


class SystemViewSet(viewsets.ModelViewSet):
    """
    ViewSet for System CRUD operations

    Endpoints:
    - GET /api/systems/ - List all systems
    - POST /api/systems/ - Create new system
    - GET /api/systems/{id}/ - Retrieve system detail
    - PUT /api/systems/{id}/ - Update system
    - PATCH /api/systems/{id}/ - Partial update
    - DELETE /api/systems/{id}/ - Delete system
    - POST /api/systems/{id}/save_draft/ - Save as draft
    - POST /api/systems/{id}/submit/ - Submit for review
    """

    queryset = System.objects.select_related('org').prefetch_related(
        'architecture',
        'data_info',
        'operations',
        'integration',
        'assessment',
        'cost',
        'vendor',
        'infrastructure',
        'security',
        'attachments',
    ).all()
    permission_classes = [IsOrgUserOrAdmin]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    # P0.8: Added new filterset fields for technology stack
    filterset_fields = [
        'org', 'status', 'criticality_level', 'form_level', 'system_group',
        'programming_language', 'framework', 'database_name', 'hosting_platform'
    ]
    # P0.8: Added new search fields for technology stack
    search_fields = [
        'system_code', 'system_name', 'system_name_en', 'purpose',
        'business_owner', 'technical_owner',
        'programming_language', 'framework', 'database_name'
    ]
    ordering_fields = ['created_at', 'updated_at', 'system_code', 'system_name', 'go_live_date']
    ordering = ['-created_at']

    def get_serializer_class(self):
        """Return appropriate serializer based on action"""
        if self.action == 'list':
            return SystemListSerializer
        elif self.action in ['create', 'update', 'partial_update']:
            return SystemCreateUpdateSerializer
        return SystemDetailSerializer

    def get_queryset(self):
        """Filter queryset based on user role"""
        queryset = super().get_queryset()
        user = self.request.user

        # Admin can see all systems
        if user.role == 'admin':
            return queryset

        # Org user can only see systems from their organization
        if user.role == 'org_user' and user.organization:
            return queryset.filter(org=user.organization)

        # If user has no organization assigned, return empty queryset
        return queryset.none()

    @action(detail=True, methods=['post'])
    def save_draft(self, request, pk=None):
        """Save system as draft"""
        system = self.get_object()
        system.status = 'draft'
        system.save()
        serializer = self.get_serializer(system)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def submit(self, request, pk=None):
        """Submit system for review"""
        system = self.get_object()
        system.status = 'active'
        system.save()
        serializer = self.get_serializer(system)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def statistics(self, request):
        """Get system statistics"""
        queryset = self.get_queryset()

        stats = {
            'total': queryset.count(),
            'by_status': {
                'active': queryset.filter(status='active').count(),
                'inactive': queryset.filter(status='inactive').count(),
                'maintenance': queryset.filter(status='maintenance').count(),
                'planning': queryset.filter(status='planning').count(),
                'draft': queryset.filter(status='draft').count(),
            },
            'by_criticality': {
                # P0.8: Removed 'critical' option per customer request
                'high': queryset.filter(criticality_level='high').count(),
                'medium': queryset.filter(criticality_level='medium').count(),
                'low': queryset.filter(criticality_level='low').count(),
            },
            'by_form_level': {
                'level_1': queryset.filter(form_level=1).count(),
                'level_2': queryset.filter(form_level=2).count(),
            },
        }

        return Response(stats)

    def destroy(self, request, *args, **kwargs):
        """
        Soft delete system
        - Admin can delete any system
        - Org user can only delete systems in their organization
        """
        system = self.get_object()
        user = request.user

        # Check permission: Admin can delete any, org_user can only delete their org's systems
        if user.role == 'org_user' and system.org != user.organization:
            return Response(
                {'error': 'Bạn không có quyền xóa hệ thống này'},
                status=status.HTTP_403_FORBIDDEN
            )

        # Soft delete
        from django.utils import timezone
        system.is_deleted = True
        system.deleted_at = timezone.now()
        system.deleted_by = user
        system.save()

        return Response(
            {'message': f'Đã xóa hệ thống "{system.system_name}" thành công'},
            status=status.HTTP_204_NO_CONTENT
        )


class AttachmentViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Attachment CRUD operations

    Endpoints:
    - GET /api/attachments/ - List all attachments
    - POST /api/attachments/ - Upload new attachment
    - GET /api/attachments/{id}/ - Retrieve attachment detail
    - PUT /api/attachments/{id}/ - Update attachment
    - DELETE /api/attachments/{id}/ - Delete attachment
    """

    queryset = Attachment.objects.select_related('system', 'uploaded_by').all()
    serializer_class = AttachmentSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['system', 'attachment_type']
    search_fields = ['filename', 'description']
    ordering_fields = ['uploaded_at', 'file_size']
    ordering = ['-uploaded_at']

    def perform_create(self, serializer):
        """Auto-set uploaded_by and file metadata"""
        serializer.save(uploaded_by=self.request.user)

    def get_queryset(self):
        """Filter attachments based on user role"""
        queryset = super().get_queryset()
        user = self.request.user

        # Admin can see all attachments
        if user.role == 'admin':
            return queryset

        # Org user can only see attachments from their organization's systems
        if user.role == 'org_user' and user.organization:
            return queryset.filter(system__org=user.organization)

        # If user has no organization assigned, return empty queryset
        return queryset.none()
