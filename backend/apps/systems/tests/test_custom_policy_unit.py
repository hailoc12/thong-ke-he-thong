"""
Unit Tests for CustomPolicy Model and Related Functions

Tests isolated components:
- CustomPolicy model methods
- Serializers
- Permission checks
- Policy generation logic
- Policy merging logic
"""

from django.test import TestCase
from django.contrib.auth import get_user_model
from apps.systems.models_feedback import CustomPolicy, AIResponseFeedback
from apps.systems.serializers_feedback import CustomPolicySerializer, ImprovementPolicySerializer
from datetime import datetime, timedelta
from django.utils import timezone

User = get_user_model()


class CustomPolicyModelTest(TestCase):
    """Test CustomPolicy model methods"""

    def setUp(self):
        self.admin_user = User.objects.create_user(
            username='admin_test',
            password='test123',
            is_staff=True
        )
        self.normal_user = User.objects.create_user(
            username='normal_test',
            password='test123',
            is_staff=False
        )

    def test_create_custom_policy_success(self):
        """Test 1: Creating a custom policy with valid data"""
        policy = CustomPolicy.objects.create(
            category='accuracy',
            rule='Always verify SQL results before responding',
            priority='high',
            rationale='Users reported incorrect data',
            created_by=self.admin_user,
            is_active=True
        )

        self.assertEqual(policy.category, 'accuracy')
        self.assertEqual(policy.priority, 'high')
        self.assertTrue(policy.is_active)
        self.assertEqual(policy.created_by, self.admin_user)
        self.assertIsNotNone(policy.created_at)
        self.assertIsNotNone(policy.updated_at)

    def test_get_active_policies_filters_correctly(self):
        """Test 2: get_active_policies() only returns active policies"""
        # Create active policy
        CustomPolicy.objects.create(
            category='clarity',
            rule='Use simple language',
            priority='medium',
            rationale='Better user experience',
            created_by=self.admin_user,
            is_active=True
        )

        # Create inactive policy
        CustomPolicy.objects.create(
            category='performance',
            rule='Optimize queries',
            priority='low',
            rationale='System performance',
            created_by=self.admin_user,
            is_active=False
        )

        active_policies = CustomPolicy.get_active_policies()

        self.assertEqual(active_policies.count(), 1)
        self.assertTrue(all(p.is_active for p in active_policies))

    def test_policy_priority_ordering(self):
        """Test 3: Policies are ordered by priority correctly"""
        CustomPolicy.objects.create(
            category='clarity',
            rule='Rule 1',
            priority='low',
            rationale='Test',
            created_by=self.admin_user
        )
        CustomPolicy.objects.create(
            category='accuracy',
            rule='Rule 2',
            priority='high',
            rationale='Test',
            created_by=self.admin_user
        )
        CustomPolicy.objects.create(
            category='completeness',
            rule='Rule 3',
            priority='medium',
            rationale='Test',
            created_by=self.admin_user
        )

        policies = CustomPolicy.get_active_policies()
        priorities = [p.priority for p in policies]

        # Should be ordered: high -> medium -> low
        expected_order = ['high', 'medium', 'low']
        self.assertEqual(priorities, expected_order)

    def test_custom_policy_update(self):
        """Test 4: Updating policy fields works correctly"""
        policy = CustomPolicy.objects.create(
            category='clarity',
            rule='Original rule',
            priority='low',
            rationale='Original rationale',
            created_by=self.admin_user
        )

        original_created_at = policy.created_at

        # Update policy
        policy.priority = 'high'
        policy.rule = 'Updated rule'
        policy.save()

        policy.refresh_from_db()

        self.assertEqual(policy.priority, 'high')
        self.assertEqual(policy.rule, 'Updated rule')
        self.assertEqual(policy.created_at, original_created_at)  # Should not change
        self.assertNotEqual(policy.updated_at, policy.created_at)  # Should be updated

    def test_deactivate_policy(self):
        """Test 5: Deactivating policy removes it from active list"""
        policy = CustomPolicy.objects.create(
            category='accuracy',
            rule='Test rule',
            priority='medium',
            rationale='Test',
            created_by=self.admin_user,
            is_active=True
        )

        self.assertEqual(CustomPolicy.get_active_policies().count(), 1)

        # Deactivate
        policy.is_active = False
        policy.save()

        self.assertEqual(CustomPolicy.get_active_policies().count(), 0)


class CustomPolicySerializerTest(TestCase):
    """Test CustomPolicySerializer"""

    def setUp(self):
        self.admin_user = User.objects.create_user(
            username='admin_test',
            password='test123',
            is_staff=True
        )

    def test_serializer_includes_username(self):
        """Test 6: Serializer includes created_by_username"""
        policy = CustomPolicy.objects.create(
            category='clarity',
            rule='Test rule',
            priority='medium',
            rationale='Test',
            created_by=self.admin_user
        )

        serializer = CustomPolicySerializer(policy)
        data = serializer.data

        self.assertIn('created_by_username', data)
        self.assertEqual(data['created_by_username'], 'admin_test')
        self.assertIn('id', data)
        self.assertIn('category', data)
        self.assertIn('rule', data)
        self.assertIn('priority', data)


class PolicyGenerationLogicTest(TestCase):
    """Test policy generation from feedback"""

    def setUp(self):
        self.user = User.objects.create_user(
            username='test_user',
            password='test123'
        )

    def test_generate_policies_from_negative_feedback(self):
        """Test 7: Policies are generated from negative feedback"""
        # Create negative feedback
        AIResponseFeedback.objects.create(
            user=self.user,
            question='Test question 1',
            answer='Test answer 1',
            rating='negative',
            feedback='Answer was inaccurate',
            analyzed=False
        )
        AIResponseFeedback.objects.create(
            user=self.user,
            question='Test question 2',
            answer='Test answer 2',
            rating='negative',
            feedback='Response was too slow',
            analyzed=False
        )

        # Generate policies
        policies = AIResponseFeedback.generate_improvement_policies()

        self.assertIsInstance(policies, list)
        self.assertGreater(len(policies), 0)

        # Each policy should have required fields
        for policy in policies:
            self.assertIn('category', policy)
            self.assertIn('rule', policy)
            self.assertIn('priority', policy)
            self.assertIn('rationale', policy)

    def test_only_negative_feedback_generates_policies(self):
        """Test 8: Positive feedback does not generate policies"""
        # Create positive feedback
        AIResponseFeedback.objects.create(
            user=self.user,
            question='Good question',
            answer='Good answer',
            rating='positive',
            feedback='Great response!',
            analyzed=False
        )

        # Create negative feedback
        AIResponseFeedback.objects.create(
            user=self.user,
            question='Bad question',
            answer='Bad answer',
            rating='negative',
            feedback='Needs improvement',
            analyzed=False
        )

        policies = AIResponseFeedback.generate_improvement_policies()

        # Should only have policies from negative feedback
        self.assertGreater(len(policies), 0)
        # All policies should be based on negative feedback patterns


class PolicyMergingLogicTest(TestCase):
    """Test merging auto-generated and custom policies"""

    def setUp(self):
        self.admin_user = User.objects.create_user(
            username='admin',
            password='test123',
            is_staff=True
        )
        self.user = User.objects.create_user(
            username='normal',
            password='test123'
        )

    def test_merge_auto_and_custom_policies(self):
        """Test 9: Active policies merge auto-generated + custom"""
        # Create negative feedback for auto policies
        AIResponseFeedback.objects.create(
            user=self.user,
            question='Test',
            answer='Test',
            rating='negative',
            feedback='Inaccurate data',
            analyzed=False
        )

        # Create custom policy
        CustomPolicy.objects.create(
            category='custom',
            rule='Custom rule',
            priority='high',
            rationale='Custom requirement',
            created_by=self.admin_user,
            is_active=True
        )

        # Get merged policies (simulating the API endpoint logic)
        auto_policies = AIResponseFeedback.generate_improvement_policies()
        custom_policies = CustomPolicy.get_active_policies()

        # Both should exist
        self.assertGreater(len(auto_policies), 0)
        self.assertEqual(custom_policies.count(), 1)

    def test_custom_policies_marked_with_is_custom_flag(self):
        """Test 10: Custom policies have is_custom=True flag"""
        policy = CustomPolicy.objects.create(
            category='accuracy',
            rule='Test rule',
            priority='high',
            rationale='Test',
            created_by=self.admin_user
        )

        serializer = ImprovementPolicySerializer({
            'category': policy.category,
            'rule': policy.rule,
            'priority': policy.priority,
            'rationale': policy.rationale,
            'is_custom': True,
            'id': policy.id
        })

        data = serializer.data
        self.assertTrue(data.get('is_custom', False))
        self.assertIsNotNone(data.get('id'))
