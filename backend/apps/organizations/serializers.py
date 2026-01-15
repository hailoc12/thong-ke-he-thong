from rest_framework import serializers
from .models import Organization


class OrganizationListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for Organization list view"""

    system_count = serializers.SerializerMethodField()

    class Meta:
        model = Organization
        fields = ['id', 'code', 'name', 'contact_person', 'contact_email', 'system_count', 'created_at']

    def get_system_count(self, obj):
        """Get number of systems in this organization"""
        return obj.systems.count()


class OrganizationDetailSerializer(serializers.ModelSerializer):
    """Complete serializer for Organization detail view"""

    system_count = serializers.SerializerMethodField()

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
        if not value:  # code is optional (null=True, blank=True)
            return value

        if self.instance:
            # Update case - exclude current instance
            if Organization.objects.exclude(pk=self.instance.pk).filter(code=value).exists():
                raise serializers.ValidationError("Organization with this code already exists.")
        else:
            # Create case
            if Organization.objects.filter(code=value).exists():
                raise serializers.ValidationError("Organization with this code already exists.")
        return value
