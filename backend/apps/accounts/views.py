from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import User
from .serializers import UserRegistrationSerializer, UserMeSerializer, UserSerializer


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
