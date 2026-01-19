"""
P0.8: Backend Tests for System Model
Tests for auto-generation, validation, and new fields
"""
from django.test import TestCase
from django.utils import timezone
from apps.systems.models import System
from apps.organizations.models import Organization


class SystemModelTestCase(TestCase):
    """Test System model functionality"""

    def setUp(self):
        """Set up test data"""
        self.org = Organization.objects.create(
            code='TEST-ORG',
            name='Test Organization',
            name_en='Test Org',
        )

    def test_system_code_auto_generation(self):
        """P0.8: Test system_code auto-generates correctly"""
        system = System.objects.create(
            org=self.org,
            system_name='Test System',
            system_name_en='Test System EN',
            description='Test description',
        )

        # Check format: SYS-{ORG_CODE}-{YYYY}-{XXXX}
        expected_year = timezone.now().year
        self.assertTrue(system.system_code.startswith(f'SYS-TEST-ORG-{expected_year}-'))
        self.assertEqual(len(system.system_code.split('-')), 4)

        # Check counter format (4 digits)
        counter = system.system_code.split('-')[-1]
        self.assertEqual(len(counter), 4)
        self.assertEqual(counter, '0001')

    def test_system_code_increments(self):
        """P0.8: Test system_code increments for same org/year"""
        system1 = System.objects.create(
            org=self.org,
            system_name='System 1',
            description='Test 1',
        )
        system2 = System.objects.create(
            org=self.org,
            system_name='System 2',
            description='Test 2',
        )

        # Extract counters
        counter1 = int(system1.system_code.split('-')[-1])
        counter2 = int(system2.system_code.split('-')[-1])

        # Counter should increment
        self.assertEqual(counter2, counter1 + 1)

    def test_criticality_level_choices(self):
        """P0.8: Test criticality_level only accepts valid choices"""
        # Valid choices: high, medium, low (removed 'critical')
        system = System.objects.create(
            org=self.org,
            system_name='Test System',
            description='Test',
            criticality_level='high',
        )
        self.assertEqual(system.criticality_level, 'high')

        # Test default is 'medium'
        system2 = System.objects.create(
            org=self.org,
            system_name='Test System 2',
            description='Test 2',
        )
        self.assertEqual(system2.criticality_level, 'medium')

    def test_business_objectives_json_field(self):
        """P0.8: Test business_objectives JSONField"""
        objectives = [
            'Tăng hiệu quả',
            'Giảm chi phí',
            'Cải thiện dịch vụ'
        ]
        system = System.objects.create(
            org=self.org,
            system_name='Test System',
            description='Test',
            business_objectives=objectives,
        )

        self.assertEqual(system.business_objectives, objectives)
        self.assertEqual(len(system.business_objectives), 3)

    def test_user_types_json_field(self):
        """P0.8: Test user_types JSONField"""
        user_types = ['internal_staff', 'external_citizen']
        system = System.objects.create(
            org=self.org,
            system_name='Test System',
            description='Test',
            user_types=user_types,
        )

        self.assertEqual(system.user_types, user_types)
        self.assertIn('internal_staff', system.user_types)

    def test_annual_users_field(self):
        """P0.8: Test annual_users IntegerField"""
        system = System.objects.create(
            org=self.org,
            system_name='Test System',
            description='Test',
            annual_users=10000,
        )

        self.assertEqual(system.annual_users, 10000)
        self.assertIsInstance(system.annual_users, int)

    def test_technology_fields(self):
        """P0.8: Test technology architecture fields"""
        system = System.objects.create(
            org=self.org,
            system_name='Test System',
            description='Test',
            programming_language='Python',
            framework='Django',
            database_name='PostgreSQL',
            hosting_platform='cloud',
        )

        self.assertEqual(system.programming_language, 'Python')
        self.assertEqual(system.framework, 'Django')
        self.assertEqual(system.database_name, 'PostgreSQL')
        self.assertEqual(system.hosting_platform, 'cloud')

    def test_security_fields(self):
        """P0.8: Test security fields"""
        system = System.objects.create(
            org=self.org,
            system_name='Test System',
            description='Test',
            authentication_method='sso',
            has_encryption=True,
            has_audit_log=True,
        )

        self.assertEqual(system.authentication_method, 'sso')
        self.assertTrue(system.has_encryption)
        self.assertTrue(system.has_audit_log)

    def test_nullable_fields_default_to_blank(self):
        """P0.8: Test that new fields are nullable/blank for existing data"""
        # Create system with minimal required fields
        system = System.objects.create(
            org=self.org,
            system_name='Minimal System',
            description='Minimal test',
        )

        # All new P0.8 fields should allow blank/null
        self.assertEqual(system.business_objectives, [])
        self.assertEqual(system.business_processes, [])
        self.assertFalse(system.has_design_documents)
        self.assertEqual(system.user_types, [])
        self.assertIsNone(system.annual_users)
        self.assertEqual(system.programming_language, '')
        self.assertEqual(system.framework, '')
        self.assertEqual(system.database_name, '')
