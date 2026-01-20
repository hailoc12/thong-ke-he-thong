"""
Tests for systems app utility functions.
"""
from django.test import TestCase
from apps.systems.models import System, Organization
from apps.systems.utils import (
    is_field_filled,
    calculate_system_completion_percentage,
    get_tab_completion_status,
    REQUIRED_FIELDS_MAP
)


class IsFieldFilledTestCase(TestCase):
    """Test the is_field_filled utility function."""

    def test_none_value(self):
        """None values should not be considered filled."""
        self.assertFalse(is_field_filled(None))

    def test_empty_string(self):
        """Empty strings should not be considered filled."""
        self.assertFalse(is_field_filled(""))
        self.assertFalse(is_field_filled("   "))

    def test_filled_string(self):
        """Non-empty strings should be considered filled."""
        self.assertTrue(is_field_filled("test"))
        self.assertTrue(is_field_filled("  test  "))

    def test_empty_list(self):
        """Empty lists should not be considered filled."""
        self.assertFalse(is_field_filled([]))

    def test_filled_list(self):
        """Non-empty lists should be considered filled."""
        self.assertTrue(is_field_filled(["item1"]))
        self.assertTrue(is_field_filled(["item1", "item2"]))

    def test_empty_dict(self):
        """Empty dicts should not be considered filled."""
        self.assertFalse(is_field_filled({}))

    def test_filled_dict(self):
        """Non-empty dicts should be considered filled."""
        self.assertTrue(is_field_filled({"key": "value"}))

    def test_boolean_values(self):
        """Boolean values (True/False) should both be considered filled."""
        self.assertTrue(is_field_filled(True))
        self.assertTrue(is_field_filled(False))

    def test_numeric_values(self):
        """Numeric values should be considered filled."""
        self.assertTrue(is_field_filled(0))
        self.assertTrue(is_field_filled(1))
        self.assertTrue(is_field_filled(100))
        self.assertTrue(is_field_filled(0.0))
        self.assertTrue(is_field_filled(3.14))


class CalculateSystemCompletionPercentageTestCase(TestCase):
    """Test the calculate_system_completion_percentage function."""

    def setUp(self):
        """Set up test organization and systems."""
        self.org = Organization.objects.create(
            name="Test Organization",
            org_code="TEST"
        )

    def test_none_system(self):
        """None system should return 0% completion."""
        percentage = calculate_system_completion_percentage(None)
        self.assertEqual(percentage, 0.0)

    def test_empty_system(self):
        """Newly created system with no fields filled should return low percentage."""
        system = System.objects.create(
            organization=self.org
        )
        percentage = calculate_system_completion_percentage(system)
        # Should be 0% or very low since required fields are empty
        self.assertLessEqual(percentage, 10.0)

    def test_partially_filled_system(self):
        """System with some fields filled should return middle-range percentage."""
        system = System.objects.create(
            organization=self.org,
            system_name="Test System",
            system_name_en="Test System EN",
            status="production",
            scope="internal",
            system_group="business"
        )
        percentage = calculate_system_completion_percentage(system)
        # Tab 1 has 5 fields all filled, so at least 5/total should be filled
        # Total required fields across all tabs: 5+3+4+2+2+2+2+0 = 20
        # We filled 5 out of 20 = 25%
        self.assertGreaterEqual(percentage, 20.0)
        self.assertLessEqual(percentage, 35.0)

    def test_fully_filled_system(self):
        """System with all required fields filled should return 100%."""
        system = System.objects.create(
            organization=self.org,
            # Tab 1
            system_name="Test System",
            system_name_en="Test System EN",
            status="production",
            scope="internal",
            system_group="business",
            # Tab 2
            business_objectives=["objective1"],
            user_types=["internal"],
            annual_users=1000,
            # Tab 3
            programming_language=["Python"],
            framework=["Django"],
            database_name=["PostgreSQL"],
            hosting_platform=["AWS"],
            # Tab 4
            data_classification_type=["public"],
            data_volume="medium",
            # Tab 5
            integrated_internal_systems=["System A"],
            data_exchange_method=["API"],
            # Tab 6
            authentication_method=["LDAP"],
            has_encryption=True,
            # Tab 7
            has_support_team=True,
            support_level="tier1",
        )
        percentage = calculate_system_completion_percentage(system)
        self.assertEqual(percentage, 100.0)

    def test_percentage_rounds_to_one_decimal(self):
        """Percentage should be rounded to 1 decimal place."""
        system = System.objects.create(
            organization=self.org,
            system_name="Test System",
            status="production",
            scope="internal"
        )
        percentage = calculate_system_completion_percentage(system)
        # Check that result has at most 1 decimal place
        self.assertEqual(percentage, round(percentage, 1))


class GetTabCompletionStatusTestCase(TestCase):
    """Test the get_tab_completion_status function."""

    def setUp(self):
        """Set up test organization."""
        self.org = Organization.objects.create(
            name="Test Organization",
            org_code="TEST"
        )

    def test_none_system(self):
        """None system should return empty dict."""
        status = get_tab_completion_status(None)
        self.assertEqual(status, {})

    def test_empty_system(self):
        """Empty system should show all tabs incomplete."""
        system = System.objects.create(
            organization=self.org
        )
        status = get_tab_completion_status(system)

        # Should have entries for all tabs
        for tab_key in REQUIRED_FIELDS_MAP.keys():
            self.assertIn(tab_key, status)
            self.assertIn('required', status[tab_key])
            self.assertIn('filled', status[tab_key])
            self.assertIn('percentage', status[tab_key])
            self.assertIn('complete', status[tab_key])

            # Tab 8 is optional (0 required fields)
            if tab_key == 'tab8':
                self.assertEqual(status[tab_key]['percentage'], 100.0)
                self.assertFalse(status[tab_key]['complete'])  # 0 fields = not complete
            else:
                # Other tabs should have low completion
                self.assertLessEqual(status[tab_key]['percentage'], 10.0)
                self.assertFalse(status[tab_key]['complete'])

    def test_tab1_complete(self):
        """System with tab1 fields filled should show tab1 complete."""
        system = System.objects.create(
            organization=self.org,
            system_name="Test System",
            system_name_en="Test System EN",
            status="production",
            scope="internal",
            system_group="business"
        )
        status = get_tab_completion_status(system)

        # Tab 1 should be 100% complete
        self.assertEqual(status['tab1']['percentage'], 100.0)
        self.assertTrue(status['tab1']['complete'])
        self.assertEqual(status['tab1']['filled'], 5)
        self.assertEqual(status['tab1']['required'], 5)

    def test_tab_partially_filled(self):
        """Tab with some fields filled should show partial completion."""
        system = System.objects.create(
            organization=self.org,
            system_name="Test System",
            status="production"
            # Missing: system_name_en, scope, system_group
        )
        status = get_tab_completion_status(system)

        # Tab 1 has 5 required fields, 2 filled = 40%
        self.assertEqual(status['tab1']['filled'], 2)
        self.assertEqual(status['tab1']['required'], 5)
        self.assertEqual(status['tab1']['percentage'], 40.0)
        self.assertFalse(status['tab1']['complete'])
