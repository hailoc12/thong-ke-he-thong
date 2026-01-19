from rest_framework import generics, permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
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
