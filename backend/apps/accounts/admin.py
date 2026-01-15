from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ['username', 'email', 'organization', 'is_staff', 'is_active']
    list_filter = ['is_staff', 'is_active', 'organization']
    search_fields = ['username', 'email', 'first_name', 'last_name']

    fieldsets = BaseUserAdmin.fieldsets + (
        ('Additional Info', {
            'fields': ('organization', 'phone')
        }),
    )
