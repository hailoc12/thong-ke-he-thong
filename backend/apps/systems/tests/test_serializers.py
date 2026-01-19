"""
P0.8: Backend Tests for System Serializers
Tests for validation, organization auto-fill, and new fields
"""
from django.test import TestCase
from rest_framework.test import APIRequestFactory
from apps.systems.serializers import SystemCreateUpdateSerializer
from apps.systems.models import System
from apps.organizations.models import Organization
from apps.accounts.models import User


class SystemSerializerTestCase(TestCase):
    """Test SystemCreateUpdateSerializer validation and logic"""

    def setUp(self):
        """Set up test data"""
        self.factory = APIRequestFactory()

        # Create organizations
        self.org1 = Organization.objects.create(
            code='ORG1',
            name='Organization 1',
            name_en='Org 1',
        )
        self.org2 = Organization.objects.create(
            code='ORG2',
            name='Organization 2',
            name_en='Org 2',
        )

        # Create users
        self.admin_user = User.objects.create_user(
            username='admin',
            password='admin123',
            email='admin@test.com',
            role='admin',
        )
        self.org_user = User.objects.create_user(
            username='orguser',
            password='org123',
            email='orguser@test.com',
            role='org_user',
            organization=self.org1,
        )

    def test_system_code_is_read_only(self):
        """P0.8: Test system_code is read-only (auto-generated)"""
        data = {
            'org': self.org1.id,
            'system_name': 'Test System',
            'description': 'Test',
            'system_code': 'CUSTOM-CODE',  # Should be ignored
        }

        request = self.factory.post('/api/systems/')
        request.user = self.admin_user

        serializer = SystemCreateUpdateSerializer(data=data, context={'request': request})
        self.assertTrue(serializer.is_valid())

        # system_code should not be in validated_data (it's read-only)
        self.assertNotIn('system_code', serializer.validated_data)

    def test_organization_auto_fill_for_org_user(self):
        """P0.8: Test org auto-fills for org_user"""
        # Org user tries to create system for different org
        data = {
            'org': self.org2.id,  # Different from user's org
            'system_name': 'Test System',
            'description': 'Test',
        }

        request = self.factory.post('/api/systems/')
        request.user = self.org_user

        serializer = SystemCreateUpdateSerializer(data=data, context={'request': request})
        self.assertTrue(serializer.is_valid())

        # Should auto-fill with user's org, not org2
        self.assertEqual(serializer.validated_data['org'], self.org1)

    def test_admin_must_select_organization(self):
        """P0.8: Test admin must select an organization"""
        data = {
            # Missing 'org' field
            'system_name': 'Test System',
            'description': 'Test',
        }

        request = self.factory.post('/api/systems/')
        request.user = self.admin_user

        serializer = SystemCreateUpdateSerializer(data=data, context={'request': request})
        self.assertFalse(serializer.is_valid())
        self.assertIn('org', serializer.errors)

    def test_business_objectives_max_5_validation(self):
        """P0.8: Test business_objectives max 5 items recommended"""
        data = {
            'org': self.org1.id,
            'system_name': 'Test System',
            'description': 'Test',
            'business_objectives': [
                'Objective 1',
                'Objective 2',
                'Objective 3',
                'Objective 4',
                'Objective 5',
                'Objective 6',  # Exceeds recommended max
            ],
        }

        request = self.factory.post('/api/systems/')
        request.user = self.admin_user

        serializer = SystemCreateUpdateSerializer(data=data, context={'request': request})
        self.assertFalse(serializer.is_valid())
        self.assertIn('business_objectives', serializer.errors)

    def test_user_types_validation(self):
        """P0.8: Test user_types validates against allowed choices"""
        # Valid user types
        valid_data = {
            'org': self.org1.id,
            'system_name': 'Test System',
            'description': 'Test',
            'user_types': ['internal_staff', 'external_citizen'],
        }

        request = self.factory.post('/api/systems/')
        request.user = self.admin_user

        serializer = SystemCreateUpdateSerializer(data=valid_data, context={'request': request})
        self.assertTrue(serializer.is_valid())

        # Invalid user type
        invalid_data = {
            'org': self.org1.id,
            'system_name': 'Test System',
            'description': 'Test',
            'user_types': ['invalid_type'],
        }

        serializer = SystemCreateUpdateSerializer(data=invalid_data, context={'request': request})
        self.assertFalse(serializer.is_valid())
        self.assertIn('user_types', serializer.errors)

    def test_annual_users_non_negative_validation(self):
        """P0.8: Test annual_users cannot be negative"""
        data = {
            'org': self.org1.id,
            'system_name': 'Test System',
            'description': 'Test',
            'annual_users': -100,  # Invalid: negative
        }

        request = self.factory.post('/api/systems/')
        request.user = self.admin_user

        serializer = SystemCreateUpdateSerializer(data=data, context={'request': request})
        self.assertFalse(serializer.is_valid())
        self.assertIn('annual_users', serializer.errors)

    def test_all_new_fields_accepted(self):
        """P0.8: Test all 24 new fields are accepted"""
        data = {
            'org': self.org1.id,
            'system_name': 'Complete System',
            'description': 'Test all fields',
            # Business Context
            'business_objectives': ['Obj 1', 'Obj 2'],
            'business_processes': ['Process 1', 'Process 2'],
            'has_design_documents': True,
            'user_types': ['internal_staff'],
            'annual_users': 5000,
            # Technology
            'programming_language': 'Python',
            'framework': 'Django',
            'database_name': 'PostgreSQL',
            'hosting_platform': 'cloud',
            # Data Architecture
            'data_sources': ['Database', 'API'],
            'data_classification_type': 'Internal',
            'data_volume': '100GB',
            # Integration
            'integrated_internal_systems': ['System A'],
            'integrated_external_systems': ['External API'],
            'api_list': ['API 1', 'API 2'],
            'data_exchange_method': 'REST API',
            # Security
            'authentication_method': 'sso',
            'has_encryption': True,
            'has_audit_log': True,
            'compliance_standards_list': 'ISO 27001',
            # Infrastructure
            'server_configuration': '8 CPU, 16GB RAM',
            'storage_capacity': '1TB',
            'backup_plan': 'Daily incremental',
            'disaster_recovery_plan': 'RTO 4h, RPO 1h',
        }

        request = self.factory.post('/api/systems/')
        request.user = self.admin_user

        serializer = SystemCreateUpdateSerializer(data=data, context={'request': request})
        self.assertTrue(serializer.is_valid(), serializer.errors)

        # Verify all fields in validated_data
        validated = serializer.validated_data
        self.assertEqual(validated['programming_language'], 'Python')
        self.assertEqual(validated['framework'], 'Django')
        self.assertEqual(validated['has_encryption'], True)
        self.assertEqual(validated['annual_users'], 5000)
