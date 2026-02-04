"""
AI Response Feedback Serializers
"""
from rest_framework import serializers
from .models import AIResponseFeedback


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
