from rest_framework import serializers
from .models import Organization


class OrganizationListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for Organization list view"""

    system_count = serializers.SerializerMethodField()

    class Meta:
        model = Organization
        fields = ['id', 'code', 'name', 'org_type', 'level', 'is_active', 'system_count', 'created_at']

    def get_system_count(self, obj):
        """Get number of systems in this organization"""
        return obj.systems.count()


class OrganizationDetailSerializer(serializers.ModelSerializer):
    """Complete serializer for Organization detail view"""

    system_count = serializers.SerializerMethodField()
    parent_name = serializers.CharField(source='parent.name', read_only=True, allow_null=True)

    class Meta:
        model = Organization
        fields = '__all__'

    def get_system_count(self, obj):
        """Get number of systems in this organization"""
        return obj.systems.count()


class OrganizationCreateUpdateSerializer(serializers.ModelSerializer):
    """Serializer for creating/updating Organization"""

    class Meta:
        model = Organization
        fields = '__all__'

    def validate_code(self, value):
        """Ensure code is unique"""
        if self.instance:
            # Update case - exclude current instance
            if Organization.objects.exclude(pk=self.instance.pk).filter(code=value).exists():
                raise serializers.ValidationError("Organization with this code already exists.")
        else:
            # Create case
            if Organization.objects.filter(code=value).exists():
                raise serializers.ValidationError("Organization with this code already exists.")
        return value

    def validate(self, data):
        """Validate parent relationship"""
        parent = data.get('parent')
        if parent:
            # Cannot set self as parent
            if self.instance and parent == self.instance:
                raise serializers.ValidationError({"parent": "Cannot set organization as its own parent."})

            # Cannot create circular reference
            if self.instance:
                current = parent
                while current:
                    if current == self.instance:
                        raise serializers.ValidationError({"parent": "Circular parent reference detected."})
                    current = current.parent

        return data
