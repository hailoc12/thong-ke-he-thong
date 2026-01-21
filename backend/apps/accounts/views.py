from rest_framework import generics, permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.pagination import PageNumberPagination
from rest_framework_simplejwt.views import TokenObtainPairView
from .models import User
from .serializers import (
    UserRegistrationSerializer,
    UserMeSerializer,
    UserSerializer,
    UserCreateSerializer,
    CustomTokenObtainPairSerializer
)
from .permissions import IsAdmin


class CustomPagination(PageNumberPagination):
    """Custom pagination class that allows client to control page size"""
    page_size = 20
    page_size_query_param = 'page_size'
    max_page_size = 100


class CustomTokenObtainPairView(TokenObtainPairView):
    """Custom login view to include user role and organization info"""
    serializer_class = CustomTokenObtainPairSerializer


class UserRegistrationView(generics.CreateAPIView):
    """
    API endpoint for user registration
    POST /api/users/register/
    """
    queryset = User.objects.all()
    serializer_class = UserRegistrationSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        return Response({
            'message': 'Đăng ký thành công! Bạn có thể đăng nhập ngay bây giờ.',
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'organization': user.organization.id if user.organization else None
            }
        }, status=status.HTTP_201_CREATED)


class UserMeView(generics.RetrieveUpdateAPIView):
    """
    API endpoint for current user profile
    GET/PUT /api/users/me/
    """
    serializer_class = UserMeSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user


class UserListView(generics.ListAPIView):
    """
    API endpoint to list all users (admin only)
    GET /api/users/
    """
    queryset = User.objects.select_related('organization').all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated, permissions.IsAdminUser]

    def get_queryset(self):
        queryset = super().get_queryset()
        # Filter by organization if user is not admin
        if not self.request.user.is_superuser:
            queryset = queryset.filter(organization=self.request.user.organization)
        return queryset


class UserViewSet(viewsets.ModelViewSet):
    """
    ViewSet for User CRUD operations (Admin only)

    Endpoints:
    - GET /api/users/ - List all users
    - POST /api/users/ - Create new user
    - GET /api/users/{id}/ - Retrieve user detail
    - PUT /api/users/{id}/ - Update user
    - PATCH /api/users/{id}/ - Partial update
    - DELETE /api/users/{id}/ - Delete user
    - POST /api/users/{id}/deactivate/ - Deactivate user
    - POST /api/users/{id}/activate/ - Activate user
    """

    queryset = User.objects.select_related('organization').all()
    permission_classes = [IsAdmin]
    pagination_class = CustomPagination

    def get_serializer_class(self):
        """Return appropriate serializer based on action"""
        if self.action == 'create':
            return UserCreateSerializer
        return UserSerializer

    def get_queryset(self):
        """Admin can see all users"""
        queryset = super().get_queryset()
        # Optionally filter by organization query param
        org_id = self.request.query_params.get('organization')
        if org_id:
            queryset = queryset.filter(organization_id=org_id)
        return queryset.order_by('-date_joined')

    def list(self, request, *args, **kwargs):
        """Override list to handle custom page_size"""
        import logging
        logger = logging.getLogger(__name__)

        # Get page_size from query params
        page_size = request.query_params.get('page_size')
        logger.error(f"=== UserViewSet.list() called with page_size={page_size} ===")

        if page_size:
            # Disable pagination by setting pagination_class to None temporarily
            self.pagination_class = None
            queryset = self.filter_queryset(self.get_queryset())

            # Limit results to requested page_size (max 100)
            try:
                limit = min(int(page_size), 100)
                logger.error(f"=== Limiting to {limit} results ===")
                queryset = queryset[:limit]
            except (ValueError, TypeError):
                pass

            serializer = self.get_serializer(queryset, many=True)
            logger.error(f"=== Returning {len(serializer.data)} results ===")
            return Response({
                'count': self.get_queryset().count(),
                'results': serializer.data
            })

        # Default pagination behavior
        logger.error("=== Using default pagination ===")
        return super().list(request, *args, **kwargs)

    @action(detail=True, methods=['post'])
    def deactivate(self, request, pk=None):
        """Deactivate a user (set is_active to False)"""
        user = self.get_object()
        if user.role == 'admin' and User.objects.filter(role='admin', is_active=True).count() == 1:
            return Response(
                {'error': 'Không thể vô hiệu hóa admin cuối cùng'},
                status=status.HTTP_400_BAD_REQUEST
            )
        user.is_active = False
        user.save()
        serializer = self.get_serializer(user)
        return Response({
            'message': 'Vô hiệu hóa người dùng thành công',
            'user': serializer.data
        })

    @action(detail=True, methods=['post'])
    def activate(self, request, pk=None):
        """Activate a user (set is_active to True)"""
        user = self.get_object()
        user.is_active = True
        user.save()
        serializer = self.get_serializer(user)
        return Response({
            'message': 'Kích hoạt người dùng thành công',
            'user': serializer.data
        })

    def destroy(self, request, *args, **kwargs):
        """
        Delete a user with cascade warning
        Returns info about systems that belong to user's organization
        """
        user = self.get_object()

        # Prevent deleting the last admin
        if user.role == 'admin' and User.objects.filter(role='admin', is_active=True).count() == 1:
            return Response(
                {'error': 'Không thể xóa admin cuối cùng trong hệ thống'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Get statistics about systems
        systems_count = 0
        warning_message = ''

        if user.organization:
            # Count systems belonging to user's organization
            from apps.systems.models import System
            systems_count = System.objects.filter(org=user.organization).count()

            # Check if this is the last user in the organization
            org_users_count = User.objects.filter(
                organization=user.organization,
                is_active=True
            ).exclude(id=user.id).count()

            if org_users_count == 0 and systems_count > 0:
                warning_message = f'Đây là người dùng cuối cùng của đơn vị {user.organization.name}. ' \
                                f'Sau khi xóa, {systems_count} hệ thống của đơn vị này sẽ không còn ai quản lý.'

        # Perform deletion
        user.delete()

        return Response({
            'message': 'Xóa người dùng thành công',
            'systems_affected': systems_count,
            'warning': warning_message
        }, status=status.HTTP_200_OK)
