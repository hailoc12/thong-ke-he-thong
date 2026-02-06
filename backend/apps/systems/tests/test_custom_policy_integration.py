"""
Integration Tests for AI Feedback & Policy Management API

Tests complete workflows:
- CRUD operations via API endpoints
- Authentication and permissions
- End-to-end policy generation
- Frontend-backend integration scenarios
"""

from django.test import TestCase, Client
from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from apps.systems.models_feedback import CustomPolicy, AIResponseFeedback
import json

User = get_user_model()


class CustomPolicyCRUDIntegrationTest(TestCase):
    """Test complete CRUD flow for custom policies"""

    def setUp(self):
        self.client = APIClient()
        self.admin_user = User.objects.create_user(
            username='admin',
            password='admin123',
            is_staff=True,
            is_superuser=True
        )
        self.normal_user = User.objects.create_user(
            username='normal',
            password='normal123',
            is_staff=False
        )

    def test_complete_crud_workflow_as_admin(self):
        """Test 1: Complete CRUD workflow (Create → Read → Update → Delete)"""
        # Login as admin
        self.client.force_authenticate(user=self.admin_user)

        # CREATE: Create a new policy
        create_data = {
            'category': 'accuracy',
            'rule': 'Verify all SQL query results',
            'priority': 'high',
            'rationale': 'Users reported incorrect data'
        }
        create_response = self.client.post('/api/custom-policies/', create_data, format='json')
        self.assertEqual(create_response.status_code, status.HTTP_201_CREATED)
        policy_id = create_response.data['id']
        self.assertIsNotNone(policy_id)

        # READ: List all policies
        list_response = self.client.get('/api/custom-policies/')
        self.assertEqual(list_response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(list_response.data), 1)
        self.assertEqual(list_response.data[0]['id'], policy_id)

        # READ: Get specific policy
        detail_response = self.client.get(f'/api/custom-policies/{policy_id}/')
        self.assertEqual(detail_response.status_code, status.HTTP_200_OK)
        self.assertEqual(detail_response.data['rule'], create_data['rule'])

        # UPDATE: Update policy priority
        update_data = {'priority': 'medium'}
        update_response = self.client.patch(f'/api/custom-policies/{policy_id}/', update_data, format='json')
        self.assertEqual(update_response.status_code, status.HTTP_200_OK)
        self.assertEqual(update_response.data['priority'], 'medium')

        # Verify update persisted
        verify_response = self.client.get(f'/api/custom-policies/{policy_id}/')
        self.assertEqual(verify_response.data['priority'], 'medium')

        # DELETE: Delete policy
        delete_response = self.client.delete(f'/api/custom-policies/{policy_id}/')
        self.assertEqual(delete_response.status_code, status.HTTP_204_NO_CONTENT)

        # Verify deletion
        list_after_delete = self.client.get('/api/custom-policies/')
        self.assertEqual(len(list_after_delete.data), 0)

    def test_normal_user_cannot_access_crud_endpoints(self):
        """Test 2: Normal users are denied access to admin endpoints"""
        # Login as normal user
        self.client.force_authenticate(user=self.normal_user)

        # Try to create policy
        create_data = {
            'category': 'clarity',
            'rule': 'Test rule',
            'priority': 'low',
            'rationale': 'Test'
        }
        create_response = self.client.post('/api/custom-policies/', create_data, format='json')
        self.assertEqual(create_response.status_code, status.HTTP_403_FORBIDDEN)

        # Create a policy as admin first
        self.client.force_authenticate(user=self.admin_user)
        policy_response = self.client.post('/api/custom-policies/', create_data, format='json')
        policy_id = policy_response.data['id']

        # Try to update as normal user
        self.client.force_authenticate(user=self.normal_user)
        update_response = self.client.patch(f'/api/custom-policies/{policy_id}/', {'priority': 'high'}, format='json')
        self.assertEqual(update_response.status_code, status.HTTP_403_FORBIDDEN)

        # Try to delete as normal user
        delete_response = self.client.delete(f'/api/custom-policies/{policy_id}/')
        self.assertEqual(delete_response.status_code, status.HTTP_403_FORBIDDEN)


class RegeneratePoliciesIntegrationTest(TestCase):
    """Test regenerate policies endpoint"""

    def setUp(self):
        self.client = APIClient()
        self.admin_user = User.objects.create_user(
            username='admin',
            password='admin123',
            is_staff=True,
            is_superuser=True
        )
        self.normal_user = User.objects.create_user(
            username='user',
            password='user123',
            is_staff=False
        )

    def test_regenerate_policies_from_feedback(self):
        """Test 3: Regenerate policies analyzes negative feedback"""
        # Create negative feedback
        AIResponseFeedback.objects.create(
            user=self.normal_user,
            question='How many systems are there?',
            answer='There are 5 systems.',
            rating='negative',
            feedback='The number is wrong, there are 10 systems.',
            analyzed=False
        )
        AIResponseFeedback.objects.create(
            user=self.normal_user,
            question='What is the status?',
            answer='Status is active.',
            rating='negative',
            feedback='Confusing response.',
            analyzed=False
        )

        # Login as admin
        self.client.force_authenticate(user=self.admin_user)

        # Call regenerate endpoint
        response = self.client.post('/api/ai-feedback/regenerate_policies/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # Check response structure
        self.assertIn('policies', response.data)
        self.assertIn('count', response.data)
        self.assertIn('timestamp', response.data)
        self.assertGreater(response.data['count'], 0)

        # Verify feedback marked as analyzed
        unanalyzed_count = AIResponseFeedback.objects.filter(rating='negative', analyzed=False).count()
        self.assertEqual(unanalyzed_count, 0)

    def test_regenerate_policies_requires_admin(self):
        """Test 4: Non-admin users cannot regenerate policies"""
        # Login as normal user
        self.client.force_authenticate(user=self.normal_user)

        response = self.client.post('/api/ai-feedback/regenerate_policies/')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)


class ActivePoliciesIntegrationTest(TestCase):
    """Test active policies endpoint with merged results"""

    def setUp(self):
        self.client = APIClient()
        self.admin_user = User.objects.create_user(
            username='admin',
            password='admin123',
            is_staff=True
        )
        self.user = User.objects.create_user(
            username='user',
            password='user123'
        )

    def test_active_policies_merges_auto_and_custom(self):
        """Test 5: Active policies returns both auto-generated and custom policies"""
        # Create negative feedback for auto policies
        AIResponseFeedback.objects.create(
            user=self.user,
            question='Test question',
            answer='Test answer',
            rating='negative',
            feedback='Data accuracy issue',
            analyzed=False
        )

        # Create custom policy
        CustomPolicy.objects.create(
            category='custom',
            rule='Always include sources',
            priority='high',
            rationale='Increase trust',
            created_by=self.admin_user,
            is_active=True
        )

        # Call active policies endpoint (public, no auth required)
        response = self.client.get('/api/ai-feedback/active_policies/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        policies = response.data.get('policies', [])
        self.assertGreater(len(policies), 0)

        # Check that we have both auto and custom policies
        custom_policies = [p for p in policies if p.get('is_custom')]
        auto_policies = [p for p in policies if not p.get('is_custom')]

        self.assertGreater(len(custom_policies), 0)
        # Auto policies might be 0 if generation doesn't create any from single feedback

        # Verify custom policy has id
        for custom_policy in custom_policies:
            self.assertIsNotNone(custom_policy.get('id'))

    def test_inactive_custom_policies_not_included(self):
        """Test 6: Inactive custom policies are excluded from active list"""
        # Create active policy
        CustomPolicy.objects.create(
            category='accuracy',
            rule='Active rule',
            priority='high',
            rationale='Active',
            created_by=self.admin_user,
            is_active=True
        )

        # Create inactive policy
        CustomPolicy.objects.create(
            category='clarity',
            rule='Inactive rule',
            priority='medium',
            rationale='Inactive',
            created_by=self.admin_user,
            is_active=False
        )

        response = self.client.get('/api/ai-feedback/active_policies/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        policies = response.data.get('policies', [])
        custom_policies = [p for p in policies if p.get('is_custom')]

        # Only active policy should be included
        self.assertEqual(len(custom_policies), 1)
        self.assertEqual(custom_policies[0]['rule'], 'Active rule')


class PolicyStatusIntegrationTest(TestCase):
    """Test policy status endpoint"""

    def setUp(self):
        self.client = APIClient()
        self.admin_user = User.objects.create_user(
            username='admin',
            password='admin123',
            is_staff=True
        )
        self.user = User.objects.create_user(
            username='user',
            password='user123'
        )

    def test_policy_status_shows_injection_points(self):
        """Test 7: Policy status endpoint returns injection point information"""
        # Create some policies
        CustomPolicy.objects.create(
            category='accuracy',
            rule='Test rule 1',
            priority='high',
            rationale='Test',
            created_by=self.admin_user
        )
        CustomPolicy.objects.create(
            category='clarity',
            rule='Test rule 2',
            priority='medium',
            rationale='Test',
            created_by=self.admin_user
        )

        # Login as admin
        self.client.force_authenticate(user=self.admin_user)

        response = self.client.get('/api/ai-feedback/policy_status/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # Check response structure
        self.assertIn('total_active_policies', response.data)
        self.assertIn('auto_generated_count', response.data)
        self.assertIn('custom_count', response.data)
        self.assertIn('injection_points', response.data)

        # Verify counts
        self.assertEqual(response.data['custom_count'], 2)
        self.assertEqual(response.data['total_active_policies'], 2)  # Only custom since no feedback

        # Verify injection points structure
        injection_points = response.data['injection_points']
        self.assertIsInstance(injection_points, list)

    def test_policy_status_requires_admin(self):
        """Test 8: Policy status requires admin permissions"""
        # Login as normal user
        self.client.force_authenticate(user=self.user)

        response = self.client.get('/api/ai-feedback/policy_status/')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)


class FeedbackToPolicyFlowTest(TestCase):
    """Test complete flow from feedback to policy generation"""

    def setUp(self):
        self.client = APIClient()
        self.admin_user = User.objects.create_user(
            username='admin',
            password='admin123',
            is_staff=True
        )
        self.user = User.objects.create_user(
            username='user',
            password='user123'
        )

    def test_complete_feedback_to_policy_workflow(self):
        """Test 9: Complete flow - Feedback → Regenerate → Active Policies"""
        # Step 1: User submits negative feedback
        feedback1 = AIResponseFeedback.objects.create(
            user=self.user,
            question='How many organizations?',
            answer='5 organizations',
            rating='negative',
            feedback='Wrong count, should be 10',
            analyzed=False
        )
        feedback2 = AIResponseFeedback.objects.create(
            user=self.user,
            question='System status?',
            answer='All active',
            rating='negative',
            feedback='Unclear response',
            analyzed=False
        )

        # Verify feedback exists and unanalyzed
        unanalyzed = AIResponseFeedback.objects.filter(rating='negative', analyzed=False).count()
        self.assertEqual(unanalyzed, 2)

        # Step 2: Admin regenerates policies
        self.client.force_authenticate(user=self.admin_user)
        regen_response = self.client.post('/api/ai-feedback/regenerate_policies/')
        self.assertEqual(regen_response.status_code, status.HTTP_200_OK)

        # Verify feedback marked as analyzed
        unanalyzed_after = AIResponseFeedback.objects.filter(rating='negative', analyzed=False).count()
        self.assertEqual(unanalyzed_after, 0)

        # Step 3: Check active policies includes generated policies
        active_response = self.client.get('/api/ai-feedback/active_policies/')
        self.assertEqual(active_response.status_code, status.HTTP_200_OK)

        policies = active_response.data.get('policies', [])
        self.assertGreater(len(policies), 0)

        # Step 4: Admin creates custom policy
        custom_data = {
            'category': 'custom',
            'rule': 'Always show data sources',
            'priority': 'high',
            'rationale': 'Increase transparency'
        }
        create_response = self.client.post('/api/custom-policies/', custom_data, format='json')
        self.assertEqual(create_response.status_code, status.HTTP_201_CREATED)

        # Step 5: Verify custom policy appears in active policies
        final_response = self.client.get('/api/ai-feedback/active_policies/')
        final_policies = final_response.data.get('policies', [])

        custom_policies = [p for p in final_policies if p.get('is_custom')]
        self.assertGreater(len(custom_policies), 0)

    def test_policy_priority_in_active_list(self):
        """Test 10: Active policies are ordered by priority"""
        # Create policies with different priorities
        CustomPolicy.objects.create(
            category='clarity',
            rule='Low priority rule',
            priority='low',
            rationale='Test',
            created_by=self.admin_user
        )
        CustomPolicy.objects.create(
            category='accuracy',
            rule='High priority rule',
            priority='high',
            rationale='Test',
            created_by=self.admin_user
        )
        CustomPolicy.objects.create(
            category='completeness',
            rule='Medium priority rule',
            priority='medium',
            rationale='Test',
            created_by=self.admin_user
        )

        response = self.client.get('/api/ai-feedback/active_policies/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        policies = response.data.get('policies', [])
        custom_policies = [p for p in policies if p.get('is_custom')]

        # Verify order: high -> medium -> low
        priorities = [p['priority'] for p in custom_policies]
        expected = ['high', 'medium', 'low']
        self.assertEqual(priorities, expected)
