"""
AI Response Feedback Model
User ratings and feedback to improve AI quality over time
"""
from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()


class AIResponseFeedback(models.Model):
    """Store user feedback on AI responses to generate improvement policies"""

    RATING_CHOICES = [
        ('positive', 'Thumbs Up - Helpful'),
        ('negative', 'Thumbs Down - Not Helpful'),
    ]

    # Core fields
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='ai_feedbacks',
        verbose_name='User'
    )

    # Query context
    query = models.TextField(
        verbose_name='User Question',
        help_text='The original question asked by user'
    )

    mode = models.CharField(
        max_length=20,
        choices=[('quick', 'Quick Mode'), ('deep', 'Deep Mode')],
        verbose_name='AI Mode',
        default='quick'
    )

    # Response data (store full response for analysis)
    response_data = models.JSONField(
        verbose_name='AI Response Data',
        help_text='Full response from AI including thinking, sql, answer, etc.'
    )

    # Conversation context (for follow-up questions)
    conversation_context = models.JSONField(
        null=True,
        blank=True,
        verbose_name='Conversation Context',
        help_text='Previous Q&A context if this was a follow-up question'
    )

    # User feedback
    rating = models.CharField(
        max_length=20,
        choices=RATING_CHOICES,
        verbose_name='Rating'
    )

    feedback_text = models.TextField(
        blank=True,
        null=True,
        verbose_name='Detailed Feedback',
        help_text='Optional: User can provide detailed feedback explaining the rating'
    )

    # Metadata
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Created At')

    # Policy generation tracking
    analyzed = models.BooleanField(
        default=False,
        verbose_name='Analyzed for Policy',
        help_text='Whether this feedback has been analyzed to generate policies'
    )

    generated_policies = models.JSONField(
        null=True,
        blank=True,
        verbose_name='Generated Policies',
        help_text='Policy rules extracted from this feedback'
    )

    class Meta:
        db_table = 'systems_ai_response_feedback'
        verbose_name = 'AI Response Feedback'
        verbose_name_plural = 'AI Response Feedbacks'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['-created_at']),
            models.Index(fields=['user', '-created_at']),
            models.Index(fields=['rating']),
            models.Index(fields=['analyzed']),
        ]

    def __str__(self):
        return f"{self.user.username} - {self.rating} - {self.query[:50]}"

    @classmethod
    def get_feedback_stats(cls):
        """Get statistics on feedback for analytics"""
        from django.db.models import Count

        return {
            'total': cls.objects.count(),
            'positive': cls.objects.filter(rating='positive').count(),
            'negative': cls.objects.filter(rating='negative').count(),
            'with_text': cls.objects.exclude(feedback_text='').exclude(feedback_text__isnull=True).count(),
            'analyzed': cls.objects.filter(analyzed=True).count(),
            'by_mode': dict(cls.objects.values('mode').annotate(count=Count('id')).values_list('mode', 'count')),
        }

    @classmethod
    def get_negative_feedback_patterns(cls):
        """
        Analyze negative feedback to identify common issues
        Returns list of common problems mentioned in negative feedback
        """
        negative_feedbacks = cls.objects.filter(
            rating='negative',
            analyzed=False
        ).exclude(
            feedback_text=''
        ).exclude(
            feedback_text__isnull=True
        )

        patterns = []
        for fb in negative_feedbacks:
            text = fb.feedback_text.lower()

            # Identify common complaint patterns
            if any(keyword in text for keyword in ['sai', 'không đúng', 'wrong', 'incorrect']):
                patterns.append({
                    'type': 'incorrect_answer',
                    'feedback_id': fb.id,
                    'query': fb.query,
                    'feedback': fb.feedback_text
                })

            if any(keyword in text for keyword in ['chậm', 'slow', 'lâu', 'timeout']):
                patterns.append({
                    'type': 'performance',
                    'feedback_id': fb.id,
                    'query': fb.query,
                    'feedback': fb.feedback_text
                })

            if any(keyword in text for keyword in ['không hiểu', 'confusing', 'unclear', 'khó hiểu']):
                patterns.append({
                    'type': 'unclear_response',
                    'feedback_id': fb.id,
                    'query': fb.query,
                    'feedback': fb.feedback_text
                })

            if any(keyword in text for keyword in ['thiếu', 'missing', 'không đầy đủ', 'incomplete']):
                patterns.append({
                    'type': 'incomplete',
                    'feedback_id': fb.id,
                    'query': fb.query,
                    'feedback': fb.feedback_text
                })

        return patterns

    @classmethod
    def generate_improvement_policies(cls):
        """
        Generate policy rules from accumulated feedback
        These policies will be injected into system prompts to improve AI behavior
        """
        patterns = cls.get_negative_feedback_patterns()

        policies = []

        # Count pattern types
        pattern_counts = {}
        for p in patterns:
            pattern_counts[p['type']] = pattern_counts.get(p['type'], 0) + 1

        # Generate policies based on frequent issues
        if pattern_counts.get('incorrect_answer', 0) >= 3:
            policies.append({
                'category': 'accuracy',
                'rule': 'CRITICAL: Always verify SQL query results before generating answer. Double-check calculations and aggregations.',
                'priority': 'high',
                'evidence_count': pattern_counts['incorrect_answer']
            })

        if pattern_counts.get('unclear_response', 0) >= 3:
            policies.append({
                'category': 'clarity',
                'rule': 'Always structure responses clearly with bullet points or numbered lists. Avoid technical jargon unless explicitly asked.',
                'priority': 'medium',
                'evidence_count': pattern_counts['unclear_response']
            })

        if pattern_counts.get('incomplete', 0) >= 3:
            policies.append({
                'category': 'completeness',
                'rule': 'Ensure answers are comprehensive. Include relevant context, examples, and specific system names when applicable.',
                'priority': 'medium',
                'evidence_count': pattern_counts['incomplete']
            })

        if pattern_counts.get('performance', 0) >= 2:
            policies.append({
                'category': 'performance',
                'rule': 'Optimize SQL queries for performance. Use LIMIT clauses and avoid complex joins when possible.',
                'priority': 'low',
                'evidence_count': pattern_counts['performance']
            })

        return policies


class CustomPolicy(models.Model):
    """
    Manually created policies by admin
    These will be merged with auto-generated policies
    """

    CATEGORY_CHOICES = [
        ('accuracy', 'Accuracy'),
        ('clarity', 'Clarity'),
        ('completeness', 'Completeness'),
        ('performance', 'Performance'),
        ('custom', 'Custom'),
    ]

    PRIORITY_CHOICES = [
        ('high', 'High'),
        ('medium', 'Medium'),
        ('low', 'Low'),
    ]

    category = models.CharField(
        max_length=50,
        choices=CATEGORY_CHOICES,
        verbose_name='Category'
    )

    rule = models.TextField(
        verbose_name='Policy Rule',
        help_text='Description of what the AI should or should not do'
    )

    priority = models.CharField(
        max_length=20,
        choices=PRIORITY_CHOICES,
        verbose_name='Priority',
        default='medium'
    )

    rationale = models.TextField(
        verbose_name='Rationale',
        help_text='Explanation of why this policy is needed'
    )

    created_by = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='custom_policies',
        verbose_name='Created By'
    )

    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Created At')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='Updated At')

    is_active = models.BooleanField(
        default=True,
        verbose_name='Active',
        help_text='Whether this policy is currently being used'
    )

    class Meta:
        db_table = 'systems_custom_policy'
        verbose_name = 'Custom Policy'
        verbose_name_plural = 'Custom Policies'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['-created_at']),
            models.Index(fields=['is_active']),
            models.Index(fields=['priority']),
        ]

    def __str__(self):
        return f"[{self.priority.upper()}] {self.category}: {self.rule[:50]}"

    @classmethod
    def get_active_policies(cls):
        """Get all active custom policies formatted like auto-generated ones"""
        return [
            {
                'id': p.id,
                'category': p.category,
                'rule': p.rule,
                'priority': p.priority,
                'evidence_count': 0,  # Custom policies don't have evidence
                'is_custom': True,
            }
            for p in cls.objects.filter(is_active=True)
        ]
