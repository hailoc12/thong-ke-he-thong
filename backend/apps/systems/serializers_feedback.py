"""
AI Response Feedback Serializers
"""
from rest_framework import serializers
from .models_feedback import AIResponseFeedback, CustomPolicy


class AIResponseFeedbackSerializer(serializers.ModelSerializer):
    """Serializer for creating feedback"""

    class Meta:
        model = AIResponseFeedback
        fields = [
            'id',
            'query',
            'mode',
            'response_data',
            'conversation_context',
            'rating',
            'feedback_text',
            'created_at',
        ]
        read_only_fields = ['id', 'created_at']

    def create(self, validated_data):
        # Automatically set user from request
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)


class FeedbackStatsSerializer(serializers.Serializer):
    """Serializer for feedback statistics"""
    total = serializers.IntegerField()
    positive = serializers.IntegerField()
    negative = serializers.IntegerField()
    with_text = serializers.IntegerField()
    analyzed = serializers.IntegerField()
    by_mode = serializers.DictField()


class ImprovementPolicySerializer(serializers.Serializer):
    """Serializer for improvement policies"""
    category = serializers.CharField()
    rule = serializers.CharField()
    priority = serializers.CharField()
    evidence_count = serializers.IntegerField()
    is_custom = serializers.BooleanField(default=False, required=False)
    id = serializers.IntegerField(required=False)


class CustomPolicySerializer(serializers.ModelSerializer):
    """Serializer for custom policies"""
    created_by_username = serializers.CharField(source='created_by.username', read_only=True)

    class Meta:
        model = CustomPolicy
        fields = [
            'id',
            'category',
            'rule',
            'priority',
            'rationale',
            'created_by',
            'created_by_username',
            'created_at',
            'updated_at',
            'is_active',
        ]
        read_only_fields = ['id', 'created_by', 'created_by_username', 'created_at', 'updated_at']

    def create(self, validated_data):
        # Automatically set created_by from request
        validated_data['created_by'] = self.context['request'].user
        return super().create(validated_data)
