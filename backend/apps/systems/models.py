from django.db import models
from django.utils.translation import gettext_lazy as _


class System(models.Model):
    """Hệ thống/Ứng dụng - Core entity"""

    SCOPE_CHOICES = [
        ('internal_unit', 'Nội bộ đơn vị'),
        ('org_wide', 'Toàn bộ'),
        ('external', 'Bên ngoài'),
    ]

    GROUP_CHOICES = [
        ('platform', 'Nền tảng'),
        ('business', 'Nghiệp vụ'),
        ('portal', 'Cổng thông tin'),
        ('website', 'Website'),
        ('bi', 'BI/Báo cáo'),
        ('esb', 'ESB/Tích hợp'),
        ('other', 'Khác'),
    ]

    STATUS_CHOICES = [
        ('operating', 'Đang vận hành'),
        ('pilot', 'Thí điểm'),
        ('stopped', 'Dừng'),
        ('replacing', 'Sắp thay thế'),
    ]

    CRITICALITY_CHOICES = [
        ('critical', 'Tối quan trọng'),
        ('high', 'Quan trọng'),
        ('medium', 'Trung bình'),
        ('low', 'Thấp'),
    ]

    # Basic Info - PHẦN 1
    org = models.ForeignKey(
        'organizations.Organization',
        on_delete=models.CASCADE,
        related_name='systems',
        verbose_name=_('Organization')
    )
    system_code = models.CharField(max_length=100, verbose_name=_('System Code'))
    system_name = models.CharField(max_length=255, verbose_name=_('System Name'))
    system_name_en = models.CharField(
        max_length=255,
        blank=True,
        verbose_name=_('System Name (English)')
    )
    purpose = models.TextField(blank=True, verbose_name=_('Purpose'))
    scope = models.CharField(
        max_length=50,
        choices=SCOPE_CHOICES,
        blank=True,
        verbose_name=_('Scope')
    )
    target_users = models.JSONField(
        default=list,
        blank=True,
        help_text='["leader", "staff", "business", "citizen"]'
    )

    # System Group & Status
    system_group = models.CharField(
        max_length=50,
        choices=GROUP_CHOICES,
        blank=True,
        verbose_name=_('System Group')
    )
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='operating',
        verbose_name=_('Status')
    )
    go_live_date = models.DateField(null=True, blank=True, verbose_name=_('Go Live Date'))
    current_version = models.CharField(max_length=50, blank=True, verbose_name=_('Current Version'))
    upgrade_history = models.JSONField(default=list, blank=True)

    # Business & Technical Owners
    business_owner = models.CharField(max_length=255, blank=True, verbose_name=_('Business Owner'))
    technical_owner = models.CharField(max_length=255, blank=True, verbose_name=_('Technical Owner'))
    responsible_person = models.CharField(max_length=255, blank=True)
    responsible_phone = models.CharField(max_length=20, blank=True)
    responsible_email = models.EmailField(blank=True)

    # User Statistics
    users_total = models.IntegerField(null=True, blank=True, verbose_name=_('Total Users'))
    users_mau = models.IntegerField(null=True, blank=True, verbose_name=_('MAU'))
    users_dau = models.IntegerField(null=True, blank=True, verbose_name=_('DAU'))
    num_organizations = models.IntegerField(null=True, blank=True, verbose_name=_('Number of Organizations'))

    # Criticality
    criticality_level = models.CharField(
        max_length=20,
        choices=CRITICALITY_CHOICES,
        default='medium',
        verbose_name=_('Criticality Level')
    )

    # Form Level
    form_level = models.IntegerField(
        default=1,
        choices=[(1, 'Level 1'), (2, 'Level 2')],
        verbose_name=_('Form Level')
    )

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'systems'
        ordering = ['-created_at']
        unique_together = [['org', 'system_code']]
        indexes = [
            models.Index(fields=['org', 'status']),
            models.Index(fields=['system_code']),
        ]
        verbose_name = _('System')
        verbose_name_plural = _('Systems')

    def __str__(self):
        return f"{self.system_code} - {self.system_name}"


class SystemArchitecture(models.Model):
    """PHẦN 2/B.3: Kiến trúc & Công nghệ"""

    ARCHITECTURE_TYPE_CHOICES = [
        ('monolithic', 'Monolithic'),
        ('modular', 'Modular'),
        ('microservices', 'Microservices'),
        ('other', 'Khác'),
    ]

    MOBILE_CHOICES = [
        ('native', 'Native App'),
        ('hybrid', 'Hybrid App'),
        ('pwa', 'PWA'),
        ('none', 'Không có'),
    ]

    DATABASE_MODEL_CHOICES = [
        ('centralized', 'Tập trung'),
        ('distributed', 'Phân tán'),
        ('per_app', 'Riêng từng app'),
    ]

    system = models.OneToOneField(
        System,
        on_delete=models.CASCADE,
        related_name='architecture',
        primary_key=True
    )

    # Architecture
    architecture_type = models.CharField(
        max_length=50,
        choices=ARCHITECTURE_TYPE_CHOICES,
        blank=True,
        verbose_name=_('Architecture Type')
    )
    has_architecture_diagram = models.BooleanField(
        default=False,
        verbose_name=_('Has Architecture Diagram')
    )
    architecture_description = models.TextField(blank=True)

    # Technology Stack
    backend_tech = models.CharField(max_length=255, blank=True, verbose_name=_('Backend Technology'))
    frontend_tech = models.CharField(max_length=255, blank=True, verbose_name=_('Frontend Technology'))
    mobile_app = models.CharField(
        max_length=50,
        choices=MOBILE_CHOICES,
        default='none',
        verbose_name=_('Mobile App')
    )

    # Database
    database_type = models.CharField(max_length=100, blank=True, verbose_name=_('Database Type'))
    database_model = models.CharField(
        max_length=50,
        choices=DATABASE_MODEL_CHOICES,
        blank=True,
        verbose_name=_('Database Model')
    )
    has_data_model_doc = models.BooleanField(
        default=False,
        verbose_name=_('Has Data Model Documentation')
    )

    # Hosting
    hosting_type = models.CharField(
        max_length=100,
        blank=True,
        help_text='cloud, on-premise, hybrid'
    )
    cloud_provider = models.CharField(max_length=100, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'system_architecture'
        verbose_name = _('System Architecture')
        verbose_name_plural = _('System Architectures')


class SystemDataInfo(models.Model):
    """PHẦN 3: Dữ liệu"""

    system = models.OneToOneField(
        System,
        on_delete=models.CASCADE,
        related_name='data_info',
        primary_key=True
    )

    # Data Volume
    storage_size_gb = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True,
        verbose_name=_('Storage Size (GB)')
    )
    growth_rate_percent = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        null=True,
        blank=True,
        verbose_name=_('Growth Rate (%)')
    )

    # Data Types
    data_types = models.JSONField(
        default=list,
        blank=True,
        help_text='["business", "documents", "stats", "master"]'
    )

    # Data Sharing
    has_api = models.BooleanField(default=False, verbose_name=_('Has API'))
    api_endpoints_count = models.IntegerField(null=True, blank=True)
    shared_with_systems = models.TextField(blank=True)
    has_data_standard = models.BooleanField(default=False, verbose_name=_('Has Data Standard'))

    # Data Classification
    has_personal_data = models.BooleanField(default=False)
    has_sensitive_data = models.BooleanField(default=False)
    data_classification = models.CharField(
        max_length=50,
        blank=True,
        help_text='public, internal, confidential, secret'
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'system_data_info'
        verbose_name = _('System Data Info')
        verbose_name_plural = _('System Data Info')


class SystemOperations(models.Model):
    """PHẦN 4: Vận hành & Nhân sự"""

    DEV_TYPE_CHOICES = [
        ('internal', 'Nội bộ'),
        ('outsource', 'Thuê ngoài'),
        ('combined', 'Kết hợp'),
    ]

    WARRANTY_STATUS_CHOICES = [
        ('active', 'Còn bảo hành'),
        ('expired', 'Hết bảo hành'),
        ('none', 'Không có'),
    ]

    DEPENDENCY_CHOICES = [
        ('high', 'Cao'),
        ('medium', 'Trung bình'),
        ('low', 'Thấp'),
        ('none', 'Không'),
    ]

    system = models.OneToOneField(
        System,
        on_delete=models.CASCADE,
        related_name='operations',
        primary_key=True
    )

    # Development
    dev_type = models.CharField(
        max_length=50,
        choices=DEV_TYPE_CHOICES,
        blank=True,
        verbose_name=_('Development Type')
    )
    developer = models.CharField(max_length=255, blank=True, verbose_name=_('Developer'))
    dev_team_size = models.IntegerField(null=True, blank=True)

    # Warranty & Maintenance
    warranty_status = models.CharField(
        max_length=50,
        choices=WARRANTY_STATUS_CHOICES,
        blank=True,
        verbose_name=_('Warranty Status')
    )
    warranty_end_date = models.DateField(null=True, blank=True)
    has_maintenance_contract = models.BooleanField(default=False)
    maintenance_end_date = models.DateField(null=True, blank=True)

    # Operations Team
    operator = models.CharField(max_length=255, blank=True, verbose_name=_('Operator'))
    ops_team_size = models.IntegerField(null=True, blank=True)
    vendor_dependency = models.CharField(
        max_length=20,
        choices=DEPENDENCY_CHOICES,
        blank=True,
        verbose_name=_('Vendor Dependency')
    )
    can_self_maintain = models.BooleanField(default=False, verbose_name=_('Can Self Maintain'))

    # Support
    support_level = models.CharField(max_length=50, blank=True, help_text='24/7, business hours, etc.')
    avg_incident_response_hours = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        null=True,
        blank=True
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'system_operations'
        verbose_name = _('System Operations')
        verbose_name_plural = _('System Operations')


class SystemIntegration(models.Model):
    """PHẦN 5: Tích hợp"""

    INTEGRATION_TYPE_CHOICES = [
        ('api', 'API'),
        ('esb', 'ESB'),
        ('file', 'File Transfer'),
        ('database', 'Database'),
        ('other', 'Khác'),
    ]

    system = models.OneToOneField(
        System,
        on_delete=models.CASCADE,
        related_name='integration',
        primary_key=True
    )

    # Integration Status
    has_integration = models.BooleanField(default=False, verbose_name=_('Has Integration'))
    integration_count = models.IntegerField(default=0, verbose_name=_('Integration Count'))

    # Integration Types
    integration_types = models.JSONField(
        default=list,
        blank=True,
        help_text='["api", "esb", "file", "database"]'
    )

    # Connected Systems
    connected_internal_systems = models.TextField(blank=True)
    connected_external_systems = models.TextField(blank=True)

    # Integration Details
    has_integration_diagram = models.BooleanField(default=False)
    integration_description = models.TextField(blank=True)

    # Standards
    uses_standard_api = models.BooleanField(default=False)
    api_standard = models.CharField(max_length=100, blank=True, help_text='REST, SOAP, GraphQL, etc.')

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'system_integration'
        verbose_name = _('System Integration')
        verbose_name_plural = _('System Integrations')


class SystemAssessment(models.Model):
    """PHẦN 6: Đánh giá"""

    RATING_CHOICES = [
        (5, 'Rất tốt'),
        (4, 'Tốt'),
        (3, 'Trung bình'),
        (2, 'Kém'),
        (1, 'Rất kém'),
    ]

    system = models.OneToOneField(
        System,
        on_delete=models.CASCADE,
        related_name='assessment',
        primary_key=True
    )

    # Performance
    performance_rating = models.IntegerField(
        choices=RATING_CHOICES,
        null=True,
        blank=True,
        verbose_name=_('Performance Rating')
    )
    uptime_percent = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        null=True,
        blank=True,
        verbose_name=_('Uptime (%)')
    )
    avg_response_time_ms = models.IntegerField(null=True, blank=True)

    # User Satisfaction
    user_satisfaction_rating = models.IntegerField(
        choices=RATING_CHOICES,
        null=True,
        blank=True,
        verbose_name=_('User Satisfaction')
    )

    # Technical Debt
    technical_debt_level = models.CharField(
        max_length=20,
        blank=True,
        help_text='high, medium, low'
    )
    needs_replacement = models.BooleanField(default=False)
    replacement_plan = models.TextField(blank=True)

    # Issues & Improvements
    major_issues = models.TextField(blank=True)
    improvement_suggestions = models.TextField(blank=True)

    # Future Plans
    future_plans = models.TextField(blank=True)
    modernization_priority = models.CharField(
        max_length=20,
        blank=True,
        help_text='high, medium, low'
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'system_assessment'
        verbose_name = _('System Assessment')
        verbose_name_plural = _('System Assessments')


# =============================================================================
# LEVEL 2 MODELS (B.4 - B.11)
# =============================================================================

class SystemCost(models.Model):
    """PHẦN B.4: Chi phí (Level 2 only)"""

    system = models.OneToOneField(
        System,
        on_delete=models.CASCADE,
        related_name='cost',
        primary_key=True
    )

    # Development Cost
    initial_investment = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        null=True,
        blank=True,
        verbose_name=_('Initial Investment (VND)')
    )
    development_cost = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        null=True,
        blank=True
    )

    # Annual Costs
    annual_license_cost = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        null=True,
        blank=True
    )
    annual_maintenance_cost = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        null=True,
        blank=True
    )
    annual_infrastructure_cost = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        null=True,
        blank=True
    )
    annual_personnel_cost = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        null=True,
        blank=True
    )

    # TCO
    total_cost_of_ownership = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        null=True,
        blank=True,
        help_text='Total 5-year TCO'
    )

    # Cost Notes
    cost_notes = models.TextField(blank=True)
    funding_source = models.CharField(max_length=255, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'system_cost'
        verbose_name = _('System Cost')
        verbose_name_plural = _('System Costs')


class SystemVendor(models.Model):
    """PHẦN B.5: Nhà cung cấp (Level 2 only)"""

    system = models.OneToOneField(
        System,
        on_delete=models.CASCADE,
        related_name='vendor',
        primary_key=True
    )

    # Primary Vendor
    vendor_name = models.CharField(max_length=255, blank=True, verbose_name=_('Vendor Name'))
    vendor_type = models.CharField(
        max_length=100,
        blank=True,
        help_text='domestic, foreign, joint_venture'
    )
    vendor_contact_person = models.CharField(max_length=255, blank=True)
    vendor_phone = models.CharField(max_length=20, blank=True)
    vendor_email = models.EmailField(blank=True)

    # Contract
    contract_number = models.CharField(max_length=100, blank=True)
    contract_start_date = models.DateField(null=True, blank=True)
    contract_end_date = models.DateField(null=True, blank=True)
    contract_value = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        null=True,
        blank=True
    )

    # Vendor Assessment
    vendor_performance_rating = models.IntegerField(
        choices=SystemAssessment.RATING_CHOICES,
        null=True,
        blank=True
    )
    vendor_responsiveness_rating = models.IntegerField(
        choices=SystemAssessment.RATING_CHOICES,
        null=True,
        blank=True
    )

    # Risks
    vendor_lock_in_risk = models.CharField(
        max_length=20,
        blank=True,
        help_text='high, medium, low'
    )
    alternative_vendors = models.TextField(blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'system_vendor'
        verbose_name = _('System Vendor')
        verbose_name_plural = _('System Vendors')


class SystemInfrastructure(models.Model):
    """PHẦN B.6: Hạ tầng (Level 2 only)"""

    system = models.OneToOneField(
        System,
        on_delete=models.CASCADE,
        related_name='infrastructure',
        primary_key=True
    )

    # Servers
    num_servers = models.IntegerField(null=True, blank=True, verbose_name=_('Number of Servers'))
    server_specs = models.TextField(blank=True)

    # Computing Resources
    total_cpu_cores = models.IntegerField(null=True, blank=True)
    total_ram_gb = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    total_storage_tb = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)

    # Network
    bandwidth_mbps = models.IntegerField(null=True, blank=True)
    has_cdn = models.BooleanField(default=False)
    has_load_balancer = models.BooleanField(default=False)

    # Backup & DR
    backup_frequency = models.CharField(
        max_length=50,
        blank=True,
        help_text='daily, weekly, real-time, etc.'
    )
    backup_retention_days = models.IntegerField(null=True, blank=True)
    has_disaster_recovery = models.BooleanField(default=False)
    rto_hours = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        null=True,
        blank=True,
        verbose_name=_('RTO (hours)')
    )
    rpo_hours = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        null=True,
        blank=True,
        verbose_name=_('RPO (hours)')
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'system_infrastructure'
        verbose_name = _('System Infrastructure')
        verbose_name_plural = _('System Infrastructures')


class SystemSecurity(models.Model):
    """PHẦN B.7: Bảo mật (Level 2 only)"""

    system = models.OneToOneField(
        System,
        on_delete=models.CASCADE,
        related_name='security',
        primary_key=True
    )

    # Authentication & Authorization
    auth_method = models.CharField(
        max_length=100,
        blank=True,
        help_text='username/password, SSO, LDAP, OAuth, etc.'
    )
    has_mfa = models.BooleanField(default=False, verbose_name=_('Has MFA'))
    has_rbac = models.BooleanField(default=False, verbose_name=_('Has RBAC'))

    # Encryption
    has_data_encryption_at_rest = models.BooleanField(default=False)
    has_data_encryption_in_transit = models.BooleanField(default=False)

    # Security Measures
    has_firewall = models.BooleanField(default=False)
    has_waf = models.BooleanField(default=False, verbose_name=_('Has WAF'))
    has_ids_ips = models.BooleanField(default=False, verbose_name=_('Has IDS/IPS'))
    has_antivirus = models.BooleanField(default=False)

    # Security Audits
    last_security_audit_date = models.DateField(null=True, blank=True)
    last_penetration_test_date = models.DateField(null=True, blank=True)
    has_vulnerability_scanning = models.BooleanField(default=False)

    # Compliance
    compliance_standards = models.JSONField(
        default=list,
        blank=True,
        help_text='["ISO27001", "GDPR", "PCIDSS", etc.]'
    )
    security_incidents_last_year = models.IntegerField(null=True, blank=True)

    # Security Notes
    security_notes = models.TextField(blank=True)
    security_improvements_needed = models.TextField(blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'system_security'
        verbose_name = _('System Security')
        verbose_name_plural = _('System Securities')


class Attachment(models.Model):
    """File đính kèm cho System"""

    ATTACHMENT_TYPE_CHOICES = [
        ('architecture_diagram', 'Architecture Diagram'),
        ('data_model', 'Data Model'),
        ('integration_diagram', 'Integration Diagram'),
        ('screenshot', 'Screenshot'),
        ('document', 'Document'),
        ('other', 'Other'),
    ]

    system = models.ForeignKey(
        System,
        on_delete=models.CASCADE,
        related_name='attachments'
    )
    attachment_type = models.CharField(
        max_length=50,
        choices=ATTACHMENT_TYPE_CHOICES,
        verbose_name=_('Attachment Type')
    )
    file = models.FileField(upload_to='attachments/%Y/%m/%d/')
    filename = models.CharField(max_length=255)
    file_size = models.IntegerField(help_text='File size in bytes')
    mime_type = models.CharField(max_length=100, blank=True)
    description = models.TextField(blank=True)

    uploaded_by = models.ForeignKey(
        'accounts.User',
        on_delete=models.SET_NULL,
        null=True,
        related_name='uploaded_attachments'
    )
    uploaded_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'attachments'
        ordering = ['-uploaded_at']
        verbose_name = _('Attachment')
        verbose_name_plural = _('Attachments')

    def __str__(self):
        return f"{self.filename} ({self.get_attachment_type_display()})"
