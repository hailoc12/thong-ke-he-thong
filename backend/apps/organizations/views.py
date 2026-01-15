from rest_framework import viewsets, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend

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

    queryset = Organization.objects.select_related('parent').all()
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['org_type', 'level', 'is_active', 'parent']
    search_fields = ['code', 'name', 'contact_person', 'contact_email']
    ordering_fields = ['created_at', 'code', 'name', 'level']
    ordering = ['level', 'code']

    def get_serializer_class(self):
        """Return appropriate serializer based on action"""
        if self.action == 'list':
            return OrganizationListSerializer
        elif self.action in ['create', 'update', 'partial_update']:
            return OrganizationCreateUpdateSerializer
        return OrganizationDetailSerializer

    @action(detail=False, methods=['get'])
    def tree(self, request):
        """Get organization tree structure"""
        # Get root organizations (no parent)
        roots = Organization.objects.filter(parent__isnull=True, is_active=True)

        def build_tree(org):
            """Recursively build organization tree"""
            children = Organization.objects.filter(parent=org, is_active=True)
            return {
                'id': org.id,
                'code': org.code,
                'name': org.name,
                'org_type': org.org_type,
                'level': org.level,
                'children': [build_tree(child) for child in children]
            }

        tree = [build_tree(root) for root in roots]
        return Response(tree)

    @action(detail=True, methods=['get'])
    def systems(self, request, pk=None):
        """Get all systems in this organization"""
        org = self.get_object()
        from apps.systems.serializers import SystemListSerializer
        systems = org.systems.all()
        serializer = SystemListSerializer(systems, many=True, context={'request': request})
        return Response(serializer.data)
