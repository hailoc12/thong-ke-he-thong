from django.contrib import admin
from .models import Organization


@admin.register(Organization)
class OrganizationAdmin(admin.ModelAdmin):
    list_display = ['code', 'name', 'contact_person', 'contact_email', 'created_at']
    search_fields = ['name', 'code', 'contact_person']
    list_filter = ['created_at']
    ordering = ['name']
    date_hierarchy = 'created_at'

    fieldsets = (
        ('Thông tin cơ bản', {
            'fields': ('name', 'code', 'description')
        }),
        ('Thông tin liên hệ', {
            'fields': ('contact_person', 'contact_email', 'contact_phone')
        }),
    )
