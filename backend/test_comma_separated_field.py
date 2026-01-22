#!/usr/bin/env python3
"""
Test script to verify CommaSeparatedListField functionality
Run this from backend directory:
    python test_comma_separated_field.py
"""

import os
import sys
import django

# Setup Django environment
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apps.systems.serializers import CommaSeparatedListField


def test_to_internal_value():
    """Test conversion from frontend array to DB string"""
    field = CommaSeparatedListField()

    # Test 1: Array of strings
    result = field.to_internal_value(['Public', 'Internal', 'Confidential'])
    assert result == 'Public,Internal,Confidential', f"Expected 'Public,Internal,Confidential', got '{result}'"
    print("✓ Test 1 passed: Array to comma-separated string")

    # Test 2: Empty array
    result = field.to_internal_value([])
    assert result == '', f"Expected empty string, got '{result}'"
    print("✓ Test 2 passed: Empty array to empty string")

    # Test 3: Array with empty values
    result = field.to_internal_value(['Public', '', 'Internal', None, 'Secret'])
    assert result == 'Public,Internal,Secret', f"Expected 'Public,Internal,Secret', got '{result}'"
    print("✓ Test 3 passed: Array with empty values filtered out")

    # Test 4: Array with spaces
    result = field.to_internal_value(['  Public  ', 'Internal'])
    assert result == 'Public,Internal', f"Expected 'Public,Internal', got '{result}'"
    print("✓ Test 4 passed: Values trimmed")

    # Test 5: Already a string (should return as-is)
    result = field.to_internal_value('Already a string')
    assert result == 'Already a string', f"Expected 'Already a string', got '{result}'"
    print("✓ Test 5 passed: String input returns as-is")

    # Test 6: None/empty
    result = field.to_internal_value(None)
    assert result == '', f"Expected empty string, got '{result}'"
    print("✓ Test 6 passed: None to empty string")


def test_to_representation():
    """Test conversion from DB string to frontend array"""
    field = CommaSeparatedListField()

    # Test 1: Comma-separated string to array
    result = field.to_representation('Public,Internal,Confidential')
    assert result == ['Public', 'Internal', 'Confidential'], f"Expected array, got {result}"
    print("✓ Test 7 passed: Comma-separated string to array")

    # Test 2: Empty string to empty array
    result = field.to_representation('')
    assert result == [], f"Expected empty array, got {result}"
    print("✓ Test 8 passed: Empty string to empty array")

    # Test 3: String with spaces
    result = field.to_representation('  Public  ,  Internal  ')
    assert result == ['Public', 'Internal'], f"Expected trimmed array, got {result}"
    print("✓ Test 9 passed: Values trimmed in output")

    # Test 4: Single value (no comma)
    result = field.to_representation('Public')
    assert result == ['Public'], f"Expected ['Public'], got {result}"
    print("✓ Test 10 passed: Single value to array")

    # Test 5: None
    result = field.to_representation(None)
    assert result == [], f"Expected empty array, got {result}"
    print("✓ Test 11 passed: None to empty array")

    # Test 6: String with empty segments
    result = field.to_representation('Public,,Internal,  ,Secret')
    assert result == ['Public', 'Internal', 'Secret'], f"Expected filtered array, got {result}"
    print("✓ Test 12 passed: Empty segments filtered out")


def test_round_trip():
    """Test complete round trip: frontend → DB → frontend"""
    field = CommaSeparatedListField()

    # Original frontend data
    frontend_data = ['Public', 'Internal', 'Confidential']

    # Convert to DB format
    db_value = field.to_internal_value(frontend_data)

    # Convert back to frontend format
    result = field.to_representation(db_value)

    assert result == frontend_data, f"Round trip failed: {frontend_data} → {db_value} → {result}"
    print("✓ Test 13 passed: Complete round trip")


def main():
    """Run all tests"""
    print("=" * 60)
    print("Testing CommaSeparatedListField")
    print("=" * 60)
    print()

    try:
        test_to_internal_value()
        print()
        test_to_representation()
        print()
        test_round_trip()
        print()
        print("=" * 60)
        print("All tests passed! ✓")
        print("=" * 60)
        return 0
    except AssertionError as e:
        print()
        print("=" * 60)
        print(f"Test failed: {e}")
        print("=" * 60)
        return 1
    except Exception as e:
        print()
        print("=" * 60)
        print(f"Error: {e}")
        print("=" * 60)
        import traceback
        traceback.print_exc()
        return 1


if __name__ == '__main__':
    sys.exit(main())
