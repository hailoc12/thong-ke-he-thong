from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend

from apps.accounts.permissions import IsOrgUserOrAdmin, IsAdmin
from .models import Organization
from .serializers import (
    OrganizationListSerializer,
    OrganizationDetailSerializer,
    OrganizationCreateUpdateSerializer,
)


class OrganizationViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Organization CRUD operations

    Endpoints:
    - GET /api/organizations/ - List all organizations
    - POST /api/organizations/ - Create new organization
    - GET /api/organizations/{id}/ - Retrieve organization detail
    - PUT /api/organizations/{id}/ - Update organization
    - PATCH /api/organizations/{id}/ - Partial update
    - DELETE /api/organizations/{id}/ - Delete organization
    - GET /api/organizations/tree/ - Get organization tree
    """

    queryset = Organization.objects.all()
    permission_classes = [IsOrgUserOrAdmin]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = []
    search_fields = ['code', 'name', 'contact_person', 'contact_email']
    ordering_fields = ['created_at', 'code', 'name']
    ordering = ['name']

    def get_queryset(self):
        """Filter queryset based on user role"""
        queryset = super().get_queryset()
        user = self.request.user

        # Admin can see all organizations
        if user.role == 'admin':
            return queryset

        # Org user can only see their own organization
        if user.role == 'org_user' and user.organization:
            return queryset.filter(id=user.organization.id)

        # If user has no organization assigned, return empty queryset
        return queryset.none()

    def get_serializer_class(self):
        """Return appropriate serializer based on action"""
        if self.action == 'list':
            return OrganizationListSerializer
        elif self.action in ['create', 'update', 'partial_update']:
            return OrganizationCreateUpdateSerializer
        return OrganizationDetailSerializer

    @action(detail=True, methods=['get'])
    def systems(self, request, pk=None):
        """Get all systems in this organization"""
        org = self.get_object()
        from apps.systems.serializers import SystemListSerializer
        systems = org.systems.all()
        serializer = SystemListSerializer(systems, many=True, context={'request': request})
        return Response(serializer.data)

    def destroy(self, request, *args, **kwargs):
        """
        Delete organization with extra safety checks
        Only admin can delete organizations
        Prevents deletion if organization has systems or users
        """
        # Only admin can delete organizations
        if not request.user.role == 'admin':
            return Response(
                {'error': 'Chỉ quản trị viên mới có quyền xóa đơn vị'},
                status=status.HTTP_403_FORBIDDEN
            )

        org = self.get_object()

        # Import here to avoid circular imports
        from apps.systems.models import System
        from apps.accounts.models import User

        # Check if organization has systems
        systems_count = System.objects.filter(organization=org).count()
        if systems_count > 0:
            return Response(
                {
                    'error': f'Không thể xóa đơn vị vì có {systems_count} hệ thống đang sử dụng. '
                             'Vui lòng xóa hoặc chuyển các hệ thống sang đơn vị khác trước.'
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        # Check if organization has users
        users_count = User.objects.filter(organization=org, is_active=True).count()
        if users_count > 0:
            return Response(
                {
                    'error': f'Không thể xóa đơn vị vì có {users_count} người dùng đang thuộc đơn vị này. '
                             'Vui lòng xóa hoặc chuyển người dùng sang đơn vị khác trước.'
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        # All checks passed, delete the organization
        org_name = org.name
        org.delete()

        return Response(
            {'message': f'Đã xóa đơn vị "{org_name}" thành công'},
            status=status.HTTP_204_NO_CONTENT
        )
