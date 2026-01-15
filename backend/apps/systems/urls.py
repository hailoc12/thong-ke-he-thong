from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import SystemViewSet, AttachmentViewSet

router = DefaultRouter()
router.register(r'systems', SystemViewSet, basename='system')
router.register(r'attachments', AttachmentViewSet, basename='attachment')

urlpatterns = [
    path('', include(router.urls)),
]
