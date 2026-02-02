from rest_framework import serializers
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
    SystemIntegrationConnection,  # P0.8 Phase 1 - Section 5
)
from apps.organizations.models import Organization


class CommaSeparatedListField(serializers.Field):
    """
    Custom field to handle conversion between:
    - Frontend: array of strings ['value1', 'value2']
    - Backend CharField: comma-separated string 'value1,value2'

    Used for CheckboxGroupWithOther component fields that are stored as CharField.
    """

    def to_representation(self, value):
        """Convert DB string to array for frontend"""
        if not value:
            return []
        return [v.strip() for v in value.split(',') if v.strip()]

    def to_internal_value(self, data):
        """Convert frontend array to DB string"""
        if not data:
            return ''
        if isinstance(data, list):
            # Filter out empty values and join with comma
            return ','.join(str(v).strip() for v in data if v)
        # If already a string, return as-is
        return str(data)


class FlexibleChoiceField(serializers.CharField):
    """
    Custom CharField that accepts both:
    1. Values from predefined choices (e.g., 'cloud', 'on_premise', 'hybrid', 'other')
    2. Custom text values (when user selects 'Khác' and types custom text)

    Used for SelectWithOther component fields.
    Bypasses strict choice validation to allow custom user input.
    """

    def __init__(self, **kwargs):
        # Remove choices from kwargs to prevent strict validation
        self.model_choices = kwargs.pop('choices', None)
        super().__init__(**kwargs)

    def to_internal_value(self, data):
        """Accept any string value within max_length"""
        if data == '' or data is None:
            if self.allow_blank or not self.required:
                return ''
            self.fail('blank')

        # Convert to string and strip whitespace
        value = str(data).strip()

        # Validate max_length if specified
        if self.max_length and len(value) > self.max_length:
            self.fail('max_length', max_length=self.max_length)

        return value


class SystemArchitectureSerializer(serializers.ModelSerializer):
    """Serializer for SystemArchitecture (PHẦN 2/B.3)"""

    # Fix: Convert array to comma-separated string for CharField fields
    architecture_type = CommaSeparatedListField(required=False)
    backend_tech = CommaSeparatedListField(required=False)
    frontend_tech = CommaSeparatedListField(required=False)
    containerization = CommaSeparatedListField(required=False)  # ADDED 2026-01-23
    api_style = CommaSeparatedListField(required=False)  # ADDED 2026-01-25 - Fix validation error
    messaging_queue = CommaSeparatedListField(required=False)  # ADDED 2026-01-25 - Fix validation error

    # Fix: Allow custom text for fields with 'other' option
    database_model = FlexibleChoiceField(max_length=10000, required=False, allow_blank=True)
    mobile_app = FlexibleChoiceField(max_length=10000, required=False, allow_blank=True)
    cache_system = FlexibleChoiceField(max_length=10000, required=False, allow_blank=True)
    search_engine = FlexibleChoiceField(max_length=10000, required=False, allow_blank=True)
    reporting_bi_tool = FlexibleChoiceField(max_length=10000, required=False, allow_blank=True)
    source_repository = FlexibleChoiceField(max_length=10000, required=False, allow_blank=True)

    class Meta:
        model = SystemArchitecture
        exclude = ['system']


class SystemDataInfoSerializer(serializers.ModelSerializer):
    """Serializer for SystemDataInfo (PHẦN 3)"""

    # Fix: Convert array to comma-separated string for CharField fields
    file_storage_type = CommaSeparatedListField(required=False)  # ADDED 2026-01-25 - Fix validation error

    class Meta:
        model = SystemDataInfo
        exclude = ['system']


class SystemOperationsSerializer(serializers.ModelSerializer):
    """Serializer for SystemOperations (PHẦN 4/B.2)"""

    # Fix: Allow custom text for fields with 'other' option
    deployment_location = FlexibleChoiceField(max_length=10000, required=False, allow_blank=True)
    compute_type = FlexibleChoiceField(max_length=10000, required=False, allow_blank=True)
    dev_type = FlexibleChoiceField(max_length=10000, required=False, allow_blank=True)
    warranty_status = FlexibleChoiceField(max_length=10000, required=False, allow_blank=True)
    vendor_dependency = FlexibleChoiceField(max_length=10000, required=False, allow_blank=True)

    class Meta:
        model = SystemOperations
        exclude = ['system']


class SystemIntegrationSerializer(serializers.ModelSerializer):
    """Serializer for SystemIntegration (PHẦN 5)"""

    # Fix: Convert array to comma-separated string for CharField fields
    api_standard = CommaSeparatedListField(required=False)

    class Meta:
        model = SystemIntegration
        exclude = ['system']


class SystemAssessmentSerializer(serializers.ModelSerializer):
    """Serializer for SystemAssessment (PHẦN 6/B.1)"""

    # Fix: Allow custom text for fields with 'other' option
    recommendation = FlexibleChoiceField(max_length=10000, required=False, allow_blank=True)

    class Meta:
        model = SystemAssessment
        exclude = ['system']


class SystemCostSerializer(serializers.ModelSerializer):
    """Serializer for SystemCost (Level 2 - PHẦN B.4)"""

    class Meta:
        model = SystemCost
        exclude = ['system']


class SystemVendorSerializer(serializers.ModelSerializer):
    """Serializer for SystemVendor (Level 2 - PHẦN B.5)"""

    class Meta:
        model = SystemVendor
        exclude = ['system']


class SystemInfrastructureSerializer(serializers.ModelSerializer):
    """Serializer for SystemInfrastructure (Level 2 - PHẦN B.6)"""

    class Meta:
        model = SystemInfrastructure
        exclude = ['system']


class SystemSecuritySerializer(serializers.ModelSerializer):
    """Serializer for SystemSecurity (Level 2 - PHẦN B.7)"""

    class Meta:
        model = SystemSecurity
        exclude = ['system']


class AttachmentSerializer(serializers.ModelSerializer):
    """Serializer for Attachment"""

    file_url = serializers.SerializerMethodField()
    file_size_display = serializers.SerializerMethodField()

    class Meta:
        model = Attachment
        fields = '__all__'
        read_only_fields = ['file_size', 'mime_type', 'uploaded_by', 'uploaded_at']

    def get_file_url(self, obj):
        """Get full URL for file"""
        request = self.context.get('request')
        if obj.file and request:
            return request.build_absolute_uri(obj.file.url)
        return None

    def get_file_size_display(self, obj):
        """Display file size in human-readable format"""
        size = obj.file_size
        for unit in ['B', 'KB', 'MB', 'GB']:
            if size < 1024.0:
                return f"{size:.1f} {unit}"
            size /= 1024.0
        return f"{size:.1f} TB"


class SystemIntegrationConnectionSerializer(serializers.ModelSerializer):
    """
    Serializer for SystemIntegrationConnection (P0.8 Phase 1 - Section 5)
    Detailed integration connection tracking
    """

    integration_method_display = serializers.CharField(
        source='get_integration_method_display',
        read_only=True
    )
    frequency_display = serializers.CharField(
        source='get_frequency_display',
        read_only=True
    )

    # Fix: Allow custom text for fields with 'other' option
    integration_method = FlexibleChoiceField(max_length=10000, required=False, allow_blank=True)

    class Meta:
        model = SystemIntegrationConnection
        fields = [
            'id',
            'source_system',
            'target_system',
            'data_objects',
            'integration_method',
            'integration_method_display',
            'frequency',
            'frequency_display',
            'error_handling',
            'has_api_docs',
            'notes',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['created_at', 'updated_at']


class SystemListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for System list view"""

    org_name = serializers.CharField(source='org.name', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    criticality_display = serializers.CharField(source='get_criticality_level_display', read_only=True)
    completion_percentage = serializers.SerializerMethodField()

    class Meta:
        model = System
        fields = [
            'id',
            'system_code',
            'system_name',
            'system_name_en',
            'org',
            'org_name',
            'status',
            'status_display',
            'criticality_level',
            'criticality_display',
            'form_level',
            'go_live_date',
            'current_version',
            'business_owner',
            'technical_owner',
            'users_total',
            'users_mau',
            'created_at',
            'updated_at',
            'completion_percentage',
        ]

    def get_completion_percentage(self, obj):
        """Calculate completion percentage for the system"""
        from .utils import calculate_system_completion_percentage
        return calculate_system_completion_percentage(obj)


class SystemDetailSerializer(serializers.ModelSerializer):
    """Complete serializer for System detail view with nested related models"""

    org_name = serializers.CharField(source='org.name', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    criticality_display = serializers.CharField(source='get_criticality_level_display', read_only=True)
    scope_display = serializers.CharField(source='get_scope_display', read_only=True)
    completion_percentage = serializers.SerializerMethodField()

    # Fix: Convert comma-separated string to array for frontend
    programming_language = CommaSeparatedListField(required=False)
    framework = CommaSeparatedListField(required=False)
    data_classification_type = CommaSeparatedListField(required=False)
    authentication_method = CommaSeparatedListField(required=False)
    data_exchange_method = CommaSeparatedListField(required=False)
    backup_plan = CommaSeparatedListField(required=False)

    # Level 1 related models (always included)
    architecture = SystemArchitectureSerializer(read_only=True)
    data_info = SystemDataInfoSerializer(read_only=True)
    operations = SystemOperationsSerializer(read_only=True)
    integration = SystemIntegrationSerializer(read_only=True)
    assessment = SystemAssessmentSerializer(read_only=True)
    attachments = AttachmentSerializer(many=True, read_only=True)

    # P0.8 Phase 1 - Integration Connections (nested list)
    integration_connections = SystemIntegrationConnectionSerializer(many=True, read_only=True)

    # Level 2 related models (conditionally included)
    cost = SystemCostSerializer(read_only=True)
    vendor = SystemVendorSerializer(read_only=True)
    infrastructure = SystemInfrastructureSerializer(read_only=True)
    security = SystemSecuritySerializer(read_only=True)

    class Meta:
        model = System
        fields = '__all__'

    def get_completion_percentage(self, obj):
        """Calculate completion percentage for the system"""
        from .utils import calculate_system_completion_percentage
        return calculate_system_completion_percentage(obj)

    def to_representation(self, instance):
        """Customize representation based on form_level"""
        data = super().to_representation(instance)

        # Remove Level 2 fields if form_level == 1
        if instance.form_level == 1:
            data.pop('cost', None)
            data.pop('vendor', None)
            data.pop('infrastructure', None)
            data.pop('security', None)

        return data


class SystemCreateUpdateSerializer(serializers.ModelSerializer):
    """Serializer for creating/updating System with nested writes"""

    # Fix: Convert array to comma-separated string for CharField fields
    programming_language = CommaSeparatedListField(required=False)
    framework = CommaSeparatedListField(required=False)
    data_classification_type = CommaSeparatedListField(required=False)
    authentication_method = CommaSeparatedListField(required=False)
    data_exchange_method = CommaSeparatedListField(required=False)
    backup_plan = CommaSeparatedListField(required=False)

    # Fix: Allow custom text for fields with 'other' option
    hosting_platform = FlexibleChoiceField(max_length=10000, required=False, allow_blank=True)
    requirement_type = FlexibleChoiceField(max_length=10000, required=False, allow_blank=True)

    # Nested writes for related models
    architecture_data = SystemArchitectureSerializer(source='architecture', required=False)
    data_info_data = SystemDataInfoSerializer(source='data_info', required=False)
    operations_data = SystemOperationsSerializer(source='operations', required=False)
    integration_data = SystemIntegrationSerializer(source='integration', required=False)
    assessment_data = SystemAssessmentSerializer(source='assessment', required=False)

    # P0.8 Phase 1 - Integration Connections (nested list)
    integration_connections_data = SystemIntegrationConnectionSerializer(source='integration_connections', many=True, required=False)

    # Level 2 nested writes
    cost_data = SystemCostSerializer(source='cost', required=False)
    vendor_data = SystemVendorSerializer(source='vendor', required=False)
    infrastructure_data = SystemInfrastructureSerializer(source='infrastructure', required=False)
    security_data = SystemSecuritySerializer(source='security', required=False)

    class Meta:
        model = System
        fields = '__all__'
        read_only_fields = ['system_code']  # P0.8: Auto-generated, not editable
        extra_kwargs = {
            'org': {'required': False},  # Auto-set in perform_create() for org_users
        }

    def validate_business_objectives(self, value):
        """P0.8: Validate business objectives (max 5 recommended)"""
        if value and len(value) > 5:
            raise serializers.ValidationError(
                "Khuyến nghị tối đa 5 mục tiêu nghiệp vụ để tập trung và dễ quản lý."
            )
        return value

    def validate_user_types(self, value):
        """P0.8: Validate user types against allowed choices"""
        allowed_types = [
            'internal_leadership',
            'internal_staff',
            'internal_reviewer',
            'external_business',
            'external_citizen',
            'external_local',
            'external_agency'
        ]
        if value:
            for user_type in value:
                if user_type not in allowed_types:
                    raise serializers.ValidationError(
                        f"'{user_type}' không phải loại người dùng hợp lệ. "
                        f"Chọn từ: {', '.join(allowed_types)}"
                    )
        return value

    def validate_annual_users(self, value):
        """P0.8: Validate annual users count"""
        if value is not None and value < 0:
            raise serializers.ValidationError("Số lượng người dùng không thể âm.")
        return value

    def validate(self, attrs):
        """P0.8: Cross-field validation"""
        # Auto-fill organization for org users
        request = self.context.get('request')
        if request and request.user:
            user = request.user
            # If user is org_user or org_admin, auto-fill their organization
            if user.role in ['org_user', 'org_admin']:
                # Override any org value with user's organization
                attrs['org'] = user.organization
            # If admin is creating without org specified, raise error
            elif user.role == 'admin' and not attrs.get('org'):
                raise serializers.ValidationError({
                    'org': 'Admin phải chọn tổ chức khi tạo hệ thống.'
                })

        return attrs

    def create(self, validated_data):
        """Create System with nested related models"""
        # Extract nested data (now using relationship names due to source parameter)
        architecture_data = validated_data.pop('architecture', {})
        data_info_data = validated_data.pop('data_info', {})
        operations_data = validated_data.pop('operations', {})
        integration_data = validated_data.pop('integration', {})
        assessment_data = validated_data.pop('assessment', {})
        integration_connections_data = validated_data.pop('integration_connections', [])  # P0.8 Phase 1
        cost_data = validated_data.pop('cost', {})
        vendor_data = validated_data.pop('vendor', {})
        infrastructure_data = validated_data.pop('infrastructure', {})
        security_data = validated_data.pop('security', {})

        # Create System
        system = System.objects.create(**validated_data)

        # Create Level 1 related models
        SystemArchitecture.objects.create(system=system, **architecture_data)
        SystemDataInfo.objects.create(system=system, **data_info_data)
        SystemOperations.objects.create(system=system, **operations_data)
        SystemIntegration.objects.create(system=system, **integration_data)
        SystemAssessment.objects.create(system=system, **assessment_data)

        # P0.8 Phase 1 - Create Integration Connections (dynamic list)
        for conn_data in integration_connections_data:
            SystemIntegrationConnection.objects.create(
                system=system,
                **conn_data
            )

        # Create Level 2 related models if form_level == 2
        if system.form_level == 2:
            SystemCost.objects.create(system=system, **cost_data)
            SystemVendor.objects.create(system=system, **vendor_data)
            SystemInfrastructure.objects.create(system=system, **infrastructure_data)
            SystemSecurity.objects.create(system=system, **security_data)

        return system

    def update(self, instance, validated_data):
        """Update System and nested related models"""
        import logging
        logger = logging.getLogger(__name__)

        # DEBUG: Log what data was received
        logger.info(f"🔍 UPDATE called for System {instance.id}")
        logger.info(f"🔍 validated_data keys: {list(validated_data.keys())}")

        # Extract nested data (now using relationship names due to source parameter)
        architecture_data = validated_data.pop('architecture', None)
        data_info_data = validated_data.pop('data_info', None)
        operations_data = validated_data.pop('operations', None)
        integration_data = validated_data.pop('integration', None)
        assessment_data = validated_data.pop('assessment', None)
        integration_connections_data = validated_data.pop('integration_connections', None)  # P0.8 Phase 1
        cost_data = validated_data.pop('cost', None)
        vendor_data = validated_data.pop('vendor', None)
        infrastructure_data = validated_data.pop('infrastructure', None)
        security_data = validated_data.pop('security', None)

        # DEBUG: Log extracted architecture data
        if architecture_data is not None:
            logger.info(f"🔍 architecture_data extracted: {architecture_data}")

        # Update System fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        # Update Level 1 related models
        if architecture_data is not None:
            arch, created = SystemArchitecture.objects.get_or_create(system=instance)
            logger.info(f"🔍 SystemArchitecture {'created' if created else 'retrieved'} for system {instance.id}")

            for attr, value in architecture_data.items():
                logger.info(f"🔍 Setting {attr} = {value}")
                setattr(arch, attr, value)

            arch.save()
            logger.info(f"✅ SystemArchitecture saved for system {instance.id}")
            logger.info(f"✅ Saved values - backend_tech: {arch.backend_tech}, frontend_tech: {arch.frontend_tech}, api_style: {arch.api_style}")

        if data_info_data is not None:
            data_info, _ = SystemDataInfo.objects.get_or_create(system=instance)
            for attr, value in data_info_data.items():
                setattr(data_info, attr, value)
            data_info.save()

        if operations_data is not None:
            ops, _ = SystemOperations.objects.get_or_create(system=instance)
            for attr, value in operations_data.items():
                setattr(ops, attr, value)
            ops.save()

        if integration_data is not None:
            integration, _ = SystemIntegration.objects.get_or_create(system=instance)
            for attr, value in integration_data.items():
                setattr(integration, attr, value)
            integration.save()

        if assessment_data is not None:
            assessment, _ = SystemAssessment.objects.get_or_create(system=instance)
            for attr, value in assessment_data.items():
                setattr(assessment, attr, value)
            assessment.save()

        # P0.8 Phase 1 - Update Integration Connections
        if integration_connections_data is not None:
            # Delete old connections
            instance.integration_connections.all().delete()
            # Create new connections
            for conn_data in integration_connections_data:
                SystemIntegrationConnection.objects.create(
                    system=instance,
                    **conn_data
                )

        # Update Level 2 related models if form_level == 2
        if instance.form_level == 2:
            if cost_data is not None:
                cost, _ = SystemCost.objects.get_or_create(system=instance)
                for attr, value in cost_data.items():
                    setattr(cost, attr, value)
                cost.save()

            if vendor_data is not None:
                vendor, _ = SystemVendor.objects.get_or_create(system=instance)
                for attr, value in vendor_data.items():
                    setattr(vendor, attr, value)
                vendor.save()

            if infrastructure_data is not None:
                infra, _ = SystemInfrastructure.objects.get_or_create(system=instance)
                for attr, value in infrastructure_data.items():
                    setattr(infra, attr, value)
                infra.save()

            if security_data is not None:
                sec, _ = SystemSecurity.objects.get_or_create(system=instance)
                for attr, value in security_data.items():
                    setattr(sec, attr, value)
                sec.save()

        return instance


# ========================================
# AI Conversation Serializers
# ========================================

class AIMessageSerializer(serializers.ModelSerializer):
    """Serializer for AI messages"""
    class Meta:
        model = AIMessage
        fields = ['id', 'role', 'content', 'response_data', 'created_at']
        read_only_fields = ['id', 'created_at']


class AIConversationSerializer(serializers.ModelSerializer):
    """Serializer for AI conversations with messages"""
    messages = AIMessageSerializer(many=True, read_only=True)
    message_count = serializers.SerializerMethodField()

    class Meta:
        model = AIConversation
        fields = [
            'id', 'title', 'mode', 'first_message',
            'message_count', 'created_at', 'updated_at', 'messages'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def get_message_count(self, obj):
        return obj.messages.count()


class AIConversationListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for conversation list"""
    message_count = serializers.SerializerMethodField()
    mode_display = serializers.CharField(source='get_mode_display', read_only=True)

    class Meta:
        model = AIConversation
        fields = ['id', 'title', 'mode', 'mode_display', 'first_message',
                  'message_count', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']

    def get_message_count(self, obj):
        return obj.messages.count()


class AIConversationCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating new conversation"""
    class Meta:
        model = AIConversation
        fields = ['title', 'mode']
        extra_kwargs = {
            'title': {'required': False, 'default': 'Cuộc trò chuyện mới'}
        }
