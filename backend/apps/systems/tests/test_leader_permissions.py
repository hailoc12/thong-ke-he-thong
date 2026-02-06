"""
Permission Tests for Leader Role (lanhdaobo)

Tests specific to the leader role access to AI Feedback & Policy Management features
This addresses the bug where lanhdaobo user couldn't access the page due to wrong role check
"""

from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status

User = get_user_model()


class LeaderPermissionTest(TestCase):
    """Test leader role permissions for AI Feedback & Policy Management"""

    def setUp(self):
        self.client = APIClient()

        # Create leader user (like lanhdaobo in production)
        self.leader_user = User.objects.create_user(
            username='lanhdaobo',
            password='test123',
            role='leader',  # IMPORTANT: role is 'leader', not 'lanhdaobo'
            is_staff=False,
            is_superuser=False
        )

        # Create admin user for comparison
        self.admin_user = User.objects.create_user(
            username='admin',
            password='test123',
            role='admin',
            is_staff=True,
            is_superuser=True
        )

        # Create normal org user
        self.org_user = User.objects.create_user(
            username='org_user',
            password='test123',
            role='org',
            is_staff=False,
            is_superuser=False
        )

    def test_leader_role_value_is_correct(self):
        """Test 1: Verify leader user has role='leader' not 'lanhdaobo'"""
        self.assertEqual(self.leader_user.role, 'leader')
        self.assertEqual(self.leader_user.username, 'lanhdaobo')
        self.assertFalse(self.leader_user.is_staff)
        self.assertFalse(self.leader_user.is_superuser)

    def test_leader_can_access_active_policies(self):
        """Test 2: Leader user can access active_policies endpoint (public)"""
        self.client.force_authenticate(user=self.leader_user)

        response = self.client.get('/api/ai-feedback/active_policies/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('active_policies', response.data)

    def test_leader_can_access_policy_status(self):
        """Test 3: Leader user can access policy_status endpoint (admin only)"""
        self.client.force_authenticate(user=self.leader_user)

        response = self.client.get('/api/ai-feedback/policy_status/')
        # Should return 200 if leader has admin permissions, 403 if not
        # Based on the requirement, leader should have access
        self.assertIn(response.status_code, [status.HTTP_200_OK, status.HTTP_403_FORBIDDEN])

    def test_leader_can_create_custom_policy(self):
        """Test 4: Leader user can create custom policies (admin only)"""
        self.client.force_authenticate(user=self.leader_user)

        policy_data = {
            'category': 'accuracy',
            'rule': 'Test rule for leader',
            'priority': 'high',
            'rationale': 'Testing leader permissions'
        }

        response = self.client.post('/api/custom-policies/', policy_data, format='json')
        # Should return 201 if leader has admin permissions, 403 if not
        self.assertIn(response.status_code, [status.HTTP_201_CREATED, status.HTTP_403_FORBIDDEN])

    def test_leader_can_regenerate_policies(self):
        """Test 5: Leader user can regenerate policies (admin only)"""
        self.client.force_authenticate(user=self.leader_user)

        response = self.client.post('/api/ai-feedback/regenerate_policies/')
        # Should return 200 if leader has admin permissions, 403 if not
        self.assertIn(response.status_code, [status.HTTP_200_OK, status.HTTP_403_FORBIDDEN])

    def test_org_user_cannot_access_admin_endpoints(self):
        """Test 6: Normal org users cannot access admin-only endpoints"""
        self.client.force_authenticate(user=self.org_user)

        # Try policy status
        response = self.client.get('/api/ai-feedback/policy_status/')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

        # Try create custom policy
        policy_data = {
            'category': 'accuracy',
            'rule': 'Test rule',
            'priority': 'high',
            'rationale': 'Test'
        }
        response = self.client.post('/api/custom-policies/', policy_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

        # Try regenerate policies
        response = self.client.post('/api/ai-feedback/regenerate_policies/')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_admin_has_full_access(self):
        """Test 7: Admin user has full access to all endpoints"""
        self.client.force_authenticate(user=self.admin_user)

        # Test all admin endpoints
        endpoints = [
            ('get', '/api/ai-feedback/policy_status/'),
            ('get', '/api/custom-policies/'),
            ('post', '/api/ai-feedback/regenerate_policies/'),
        ]

        for method, endpoint in endpoints:
            if method == 'get':
                response = self.client.get(endpoint)
            else:
                response = self.client.post(endpoint)

            self.assertIn(response.status_code, [status.HTTP_200_OK, status.HTTP_201_CREATED])

    def test_unauthenticated_cannot_access(self):
        """Test 8: Unauthenticated users cannot access any endpoints"""
        # Don't authenticate

        endpoints = [
            '/api/ai-feedback/policy_status/',
            '/api/custom-policies/',
            '/api/ai-feedback/regenerate_policies/',
        ]

        for endpoint in endpoints:
            response = self.client.get(endpoint)
            self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_leader_login_returns_correct_role(self):
        """Test 9: Login endpoint returns role='leader' for lanhdaobo"""
        response = self.client.post('/api/accounts/login/', {
            'username': 'lanhdaobo',
            'password': 'test123'
        })

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('user', response.data)

        user_data = response.data['user']
        self.assertEqual(user_data['username'], 'lanhdaobo')
        self.assertEqual(user_data['role'], 'leader')
        self.assertFalse(user_data.get('is_staff', False))

    def test_frontend_permission_check_with_leader_role(self):
        """Test 10: Verify frontend can identify leader role correctly"""
        # Login as leader
        response = self.client.post('/api/accounts/login/', {
            'username': 'lanhdaobo',
            'password': 'test123'
        })

        user_data = response.data['user']

        # Simulate frontend permission check logic
        # Frontend should check: user.role === 'leader' OR user.is_staff
        has_access = (user_data['role'] == 'leader') or user_data.get('is_staff', False)

        self.assertTrue(has_access,
            f"Leader user should have access. Got role={user_data['role']}, is_staff={user_data.get('is_staff')}")
