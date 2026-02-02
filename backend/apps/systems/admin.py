from django.contrib import admin
from .models import (
    System,
    SystemArchitecture,
    SystemDataInfo,
    SystemOperations,
    SystemIntegration,
    SystemAssessment,
    SystemCost,
    SystemVendor,
    SystemInfrastructure,
    SystemSecurity,
    Attachment,
    AIRequestLog,
)


class SystemArchitectureInline(admin.StackedInline):
    model = SystemArchitecture
    extra = 0
    can_delete = False


class SystemDataInfoInline(admin.StackedInline):
    model = SystemDataInfo
    extra = 0
    can_delete = False


class SystemOperationsInline(admin.StackedInline):
    model = SystemOperations
    extra = 0
    can_delete = False


class SystemIntegrationInline(admin.StackedInline):
    model = SystemIntegration
    extra = 0
    can_delete = False


class SystemAssessmentInline(admin.StackedInline):
    model = SystemAssessment
    extra = 0
    can_delete = False


class SystemCostInline(admin.StackedInline):
    model = SystemCost
    extra = 0
    can_delete = False


class SystemVendorInline(admin.StackedInline):
    model = SystemVendor
    extra = 0
    can_delete = False


class SystemInfrastructureInline(admin.StackedInline):
    model = SystemInfrastructure
    extra = 0
    can_delete = False


class SystemSecurityInline(admin.StackedInline):
    model = SystemSecurity
    extra = 0
    can_delete = False


class AttachmentInline(admin.TabularInline):
    model = Attachment
    extra = 1
    fields = ['attachment_type', 'file', 'filename', 'description']
    readonly_fields = ['file_size', 'uploaded_by', 'uploaded_at']


@admin.register(System)
class SystemAdmin(admin.ModelAdmin):
    list_display = [
        'system_code',
        'system_name',
        'org',
        'status',
        'criticality_level',
        'form_level',
        'created_at',
    ]
    list_filter = [
        'status',
        'criticality_level',
        'form_level',
        'system_group',
        'org',
        'created_at',
    ]
    search_fields = [
        'system_code',
        'system_name',
        'system_name_en',
        'purpose',
        'business_owner',
        'technical_owner',
    ]
    readonly_fields = ['created_at', 'updated_at']
    date_hierarchy = 'created_at'

    fieldsets = (
        ('Thông tin cơ bản', {
            'fields': (
                'org',
                'system_code',
                'system_name',
                'system_name_en',
                'purpose',
            )
        }),
        ('Phân loại & Trạng thái', {
            'fields': (
                'system_group',
                'scope',
                'target_users',
                'status',
                'criticality_level',
                'form_level',
            )
        }),
        ('Phiên bản & Lịch sử', {
            'fields': (
                'go_live_date',
                'current_version',
                'upgrade_history',
            )
        }),
        ('Người phụ trách', {
            'fields': (
                'business_owner',
                'technical_owner',
                'responsible_person',
                'responsible_phone',
                'responsible_email',
            )
        }),
        ('Thống kê người dùng', {
            'fields': (
                'users_total',
                'users_mau',
                'users_dau',
                'num_organizations',
            ),
            'classes': ['collapse'],
        }),
        ('Metadata', {
            'fields': ('created_at', 'updated_at'),
            'classes': ['collapse'],
        }),
    )

    # Show different inlines based on form_level
    def get_inline_instances(self, request, obj=None):
        inline_instances = []

        # Level 1 inlines (always shown)
        level1_inlines = [
            SystemArchitectureInline,
            SystemDataInfoInline,
            SystemOperationsInline,
            SystemIntegrationInline,
            SystemAssessmentInline,
            AttachmentInline,
        ]

        # Level 2 inlines (only if form_level == 2)
        level2_inlines = [
            SystemCostInline,
            SystemVendorInline,
            SystemInfrastructureInline,
            SystemSecurityInline,
        ]

        for inline_class in level1_inlines:
            inline_instances.append(inline_class(self.model, self.admin_site))

        if obj and obj.form_level == 2:
            for inline_class in level2_inlines:
                inline_instances.append(inline_class(self.model, self.admin_site))

        return inline_instances

    def save_model(self, request, obj, form, change):
        """Auto-create related models if they don't exist"""
        super().save_model(request, obj, form, change)

        # Create Level 1 related models
        SystemArchitecture.objects.get_or_create(system=obj)
        SystemDataInfo.objects.get_or_create(system=obj)
        SystemOperations.objects.get_or_create(system=obj)
        SystemIntegration.objects.get_or_create(system=obj)
        SystemAssessment.objects.get_or_create(system=obj)

        # Create Level 2 related models if form_level == 2
        if obj.form_level == 2:
            SystemCost.objects.get_or_create(system=obj)
            SystemVendor.objects.get_or_create(system=obj)
            SystemInfrastructure.objects.get_or_create(system=obj)
            SystemSecurity.objects.get_or_create(system=obj)


@admin.register(Attachment)
class AttachmentAdmin(admin.ModelAdmin):
    list_display = [
        'filename',
        'system',
        'attachment_type',
        'file_size_display',
        'uploaded_by',
        'uploaded_at',
    ]
    list_filter = ['attachment_type', 'uploaded_at']
    search_fields = ['filename', 'description', 'system__system_name']
    readonly_fields = ['file_size', 'mime_type', 'uploaded_by', 'uploaded_at']
    date_hierarchy = 'uploaded_at'

    fieldsets = (
        ('File Information', {
            'fields': (
                'system',
                'attachment_type',
                'file',
                'filename',
                'description',
            )
        }),
        ('Metadata', {
            'fields': (
                'file_size',
                'mime_type',
                'uploaded_by',
                'uploaded_at',
            ),
            'classes': ['collapse'],
        }),
    )

    def file_size_display(self, obj):
        """Display file size in human-readable format"""
        size = obj.file_size
        for unit in ['B', 'KB', 'MB', 'GB']:
            if size < 1024.0:
                return f"{size:.1f} {unit}"
            size /= 1024.0
        return f"{size:.1f} TB"

    file_size_display.short_description = 'File Size'

    def save_model(self, request, obj, form, change):
        """Auto-set uploaded_by"""
        if not change:  # Only on create
            obj.uploaded_by = request.user

        # Auto-set file metadata
        if obj.file:
            obj.filename = obj.file.name
            obj.file_size = obj.file.size

        super().save_model(request, obj, form, change)


@admin.register(AIRequestLog)
class AIRequestLogAdmin(admin.ModelAdmin):
    """Admin interface for AI Request Logs - SUPERUSER ONLY"""

    list_display = [
        'id',
        'user',
        'query_preview',
        'mode',
        'status',
        'total_duration_display',
        'total_cost_display',
        'llm_requests_count',
        'started_at',
        'completed_at',
    ]

    list_filter = ['mode', 'status', 'started_at']
    search_fields = ['query', 'error_message']
    readonly_fields = [
        'user', 'query', 'mode', 'tasks', 'llm_requests',
        'total_duration_ms', 'total_cost_usd', 'started_at',
        'completed_at', 'created_at'
    ]
    date_hierarchy = 'started_at'

    fieldsets = (
        ('Request Information', {
            'fields': ('user', 'query', 'mode', 'status')
        }),
        ('Performance', {
            'fields': ('total_duration_ms', 'total_cost_usd', 'started_at', 'completed_at')
        }),
        ('Details', {
            'fields': ('tasks', 'llm_requests', 'error_message'),
            'classes': ['collapse'],
        }),
        ('User Feedback', {
            'fields': ('user_rating', 'user_feedback'),
        }),
        ('Conversation', {
            'fields': ('conversation',),
            'classes': ['collapse'],
        }),
    )

    def query_preview(self, obj):
        """Show truncated query"""
        return obj.query[:60] + '...' if len(obj.query) > 60 else obj.query
    query_preview.short_description = 'Query'

    def total_duration_display(self, obj):
        """Show duration in seconds"""
        if obj.total_duration_ms:
            return f"{obj.total_duration_ms / 1000:.1f}s"
        return "-"
    total_duration_display.short_description = 'Duration'

    def total_cost_display(self, obj):
        """Show cost formatted"""
        if obj.total_cost_usd:
            return f"${obj.total_cost_usd:.6f}"
        return "-"
    total_cost_display.short_description = 'Cost'

    def llm_requests_count(self, obj):
        """Count LLM requests"""
        if obj.llm_requests:
            return len(obj.llm_requests)
        return 0
    llm_requests_count.short_description = 'LLM Calls'

    def has_module_permission(self, request, obj=None):
        """Only superusers can access AI logs"""
        return request.user and request.user.is_superuser

    # Disable all modification permissions
    has_add_permission = lambda self, request: False
    has_change_permission = lambda self, request, obj=None: False
    has_delete_permission = lambda self, request, obj=None: request.user and request.user.is_superuser

    def has_view_permission(self, request, obj=None):
        """Only superusers can view AI logs"""
        return request.user and request.user.is_superuser
