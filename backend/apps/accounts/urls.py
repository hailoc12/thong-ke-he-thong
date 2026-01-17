from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import UserRegistrationView, UserMeView, UserViewSet

router = DefaultRouter()
router.register(r'users', UserViewSet, basename='user')

app_name = 'accounts'

urlpatterns = [
    # Custom endpoints (must come before router)
    path('users/register/', UserRegistrationView.as_view(), name='user-register'),
    path('users/me/', UserMeView.as_view(), name='user-me'),

    # ViewSet routes
    path('', include(router.urls)),
]
