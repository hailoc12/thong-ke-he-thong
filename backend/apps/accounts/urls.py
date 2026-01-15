from django.urls import path
from .views import UserRegistrationView, UserMeView, UserListView

app_name = 'accounts'

urlpatterns = [
    path('users/register/', UserRegistrationView.as_view(), name='user-register'),
    path('users/me/', UserMeView.as_view(), name='user-me'),
    path('users/', UserListView.as_view(), name='user-list'),
]
