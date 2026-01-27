#!/usr/bin/env python3
"""
Verification script to test nested data saving
Run this after deploying serializers.py fix

Usage:
    python verify_nested_save.py
"""

import os
import sys
import django

# Setup Django environment
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apps.systems.models import System, SystemArchitecture
from apps.systems.serializers import SystemCreateUpdateSerializer

def test_nested_save():
    """Test that nested data is properly saved"""

    print("=" * 70)
    print("NESTED DATA SAVE VERIFICATION TEST")
    print("=" * 70)

    # Find a test system (or use system ID 115)
    try:
        system = System.objects.get(id=115)
        print(f"\n✓ Found test system: {system.system_name} (ID: {system.id})")
    except System.DoesNotExist:
        print("\n✗ System 115 not found. Using first available system...")
        system = System.objects.first()
        if not system:
            print("✗ No systems found in database!")
            return False
        print(f"✓ Using system: {system.system_name} (ID: {system.id})")

    # Prepare test data
    test_data = {
        'system_name': system.system_name,  # Keep existing name
        'architecture_data': {
            'backend_tech': 'Python, Django, PostgreSQL',
            'frontend_tech': 'React, TypeScript, Ant Design',
            'architecture_description': 'Test from verification script',
        }
    }

    print(f"\n📝 Test data prepared:")
    print(f"   - backend_tech: {test_data['architecture_data']['backend_tech']}")
    print(f"   - frontend_tech: {test_data['architecture_data']['frontend_tech']}")

    # Simulate API update request
    print(f"\n🔄 Simulating PUT /api/systems/{system.id}/...")

    serializer = SystemCreateUpdateSerializer(
        instance=system,
        data=test_data,
        partial=True
    )

    if not serializer.is_valid():
        print(f"\n✗ Serializer validation failed!")
        print(f"   Errors: {serializer.errors}")
        return False

    print("✓ Serializer validation passed")

    # Save
    print("\n💾 Calling serializer.save()...")
    saved_system = serializer.save()
    print(f"✓ Save completed for system ID: {saved_system.id}")

    # Verify in database
    print("\n🔍 Verifying data in database...")
    system.refresh_from_db()

    # Check if architecture exists
    try:
        arch = system.architecture
        print(f"✓ SystemArchitecture record exists (ID: {arch.id})")
    except SystemArchitecture.DoesNotExist:
        print("✗ SystemArchitecture record NOT found!")
        return False

    # Check if data was saved
    print(f"\n📊 Saved values:")
    print(f"   backend_tech: {arch.backend_tech}")
    print(f"   frontend_tech: {arch.frontend_tech}")
    print(f"   description: {arch.architecture_description}")

    # Validate
    success = True
    if arch.backend_tech != 'Python, Django, PostgreSQL':
        print(f"\n✗ backend_tech NOT saved correctly!")
        print(f"   Expected: 'Python, Django, PostgreSQL'")
        print(f"   Got: '{arch.backend_tech}'")
        success = False

    if arch.frontend_tech != 'React, TypeScript, Ant Design':
        print(f"\n✗ frontend_tech NOT saved correctly!")
        print(f"   Expected: 'React, TypeScript, Ant Design'")
        print(f"   Got: '{arch.frontend_tech}'")
        success = False

    if success:
        print("\n" + "=" * 70)
        print("✅ SUCCESS! Nested data is being saved correctly!")
        print("=" * 70)
        print("\nAll tests passed:")
        print("  ✓ Serializer accepts nested data")
        print("  ✓ update() method processes nested fields")
        print("  ✓ Data persists to related tables")
        print("  ✓ Values match expected values")
        print("\nThe fix is working! 🎉")
        return True
    else:
        print("\n" + "=" * 70)
        print("❌ FAILED! Nested data NOT saved correctly!")
        print("=" * 70)
        print("\nIssue: update() method not saving nested data")
        print("Action: Check if serializers.py was deployed correctly")
        print("        Clear Python cache and restart backend")
        return False


if __name__ == '__main__':
    try:
        success = test_nested_save()
        sys.exit(0 if success else 1)
    except Exception as e:
        print(f"\n❌ Error during test: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
