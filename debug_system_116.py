#!/usr/bin/env python3
"""
Debug script to analyze system 116 completion percentage
Run this on the server with: docker compose exec backend python debug_system_116.py
"""
import os
import sys
import django

# Setup Django
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'backend'))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apps.systems.models import System
from apps.systems.utils import calculate_system_completion_percentage, get_incomplete_fields, get_tab_completion_status


def debug_system(system_id: int):
    """Debug a single system and print detailed completion info"""
    try:
        system = System.objects.get(id=system_id)
    except System.DoesNotExist:
        print(f"❌ System {system_id} not found!")
        return

    print(f"\n{'='*60}")
    print(f"SYSTEM {system_id}: {system.system_name}")
    print(f"{'='*60}")

    # Get completion info
    percentage = calculate_system_completion_percentage(system)
    incomplete = get_incomplete_fields(system)
    tab_status = get_tab_completion_status(system)

    print(f"\n📊 Overall Completion: {percentage}%")
    print(f"   Missing Fields: {len(incomplete)}")

    # Print missing fields
    if incomplete:
        print(f"\n❌ Missing Required Fields:")
        for field in incomplete:
            print(f"   - {field}")
    else:
        print(f"\n✅ All required fields filled!")

    # Print tab-by-tab status
    print(f"\n📋 Tab-by-Tab Status:")
    for tab_key, status in tab_status.items():
        status_icon = "✅" if status['complete'] else "❌"
        print(f"   {status_icon} {tab_key.upper()}: {status['filled']}/{status['required']} ({status['percentage']}%)")

    # Print actual field values for debugging
    print(f"\n🔍 Field Value Debug:")

    # Tab 1 - Basic Info
    print(f"\n   TAB 1 (Basic Info):")
    for field in ['org', 'system_name', 'system_name_en', 'purpose', 'status', 'criticality_level', 'scope', 'system_group']:
        val = getattr(system, field, None)
        print(f"      {field}: {repr(val)}")

    # Tab 2 - Business Info
    print(f"\n   TAB 2 (Business Info):")
    for field in ['business_objectives', 'business_processes', 'user_types', 'annual_users']:
        val = getattr(system, field, None)
        print(f"      {field}: {repr(val)}")

    # Tab 3 - Architecture
    print(f"\n   TAB 3 (Architecture):")
    if hasattr(system, 'architecture') and system.architecture:
        arch = system.architecture
        for field in ['programming_language', 'framework', 'database_name', 'hosting_platform',
                      'architecture_type', 'backend_tech', 'frontend_tech', 'mobile_app']:
            val = getattr(arch, field, None)
            print(f"      {field}: {repr(val)}")
    else:
        print(f"      ⚠️  No architecture record found!")

    # Tab 4 - Data Info
    print(f"\n   TAB 4 (Data Info):")
    if hasattr(system, 'data_info') and system.data_info:
        data_info = system.data_info
        for field in ['data_sources', 'data_types', 'data_classification_type', 'data_volume',
                      'storage_size_gb', 'file_storage_size_gb', 'growth_rate_percent',
                      'file_storage_type', 'record_count', 'secondary_databases']:
            val = getattr(data_info, field, None)
            print(f"      {field}: {repr(val)}")
    else:
        print(f"      ⚠️  No data_info record found!")

    # Tab 5 - Integration
    print(f"\n   TAB 5 (Integration):")
    for field in ['data_exchange_method', 'api_provided_count']:
        val = getattr(system, field, None)
        print(f"      {field}: {repr(val)}")

    # Tab 6 - Security
    print(f"\n   TAB 6 (Security):")
    for field in ['authentication_method', 'has_encryption', 'has_audit_log', 'security_level']:
        val = getattr(system, field, None)
        print(f"      {field}: {repr(val)}")

    # Tab 7 - Infrastructure
    print(f"\n   TAB 7 (Infrastructure):")
    for field in ['server_configuration', 'backup_plan', 'storage_capacity', 'disaster_recovery_plan']:
        val = getattr(system, field, None)
        print(f"      {field}: {repr(val)}")

    # Tab 8 - Operations
    print(f"\n   TAB 8 (Operations):")
    if hasattr(system, 'operations') and system.operations:
        ops = system.operations
        for field in ['business_owner', 'technical_owner', 'responsible_phone', 'responsible_email', 'users_mau', 'users_dau']:
            val = getattr(ops, field, None)
            print(f"      {field}: {repr(val)}")
        # support_level is in operations
        val = getattr(ops, 'support_level', None)
        print(f"      support_level: {repr(val)}")
    else:
        print(f"      ⚠️  No operations record found!")

    # Tab 9 - Assessment
    print(f"\n   TAB 9 (Assessment):")
    if hasattr(system, 'assessment') and system.assessment:
        assess = system.assessment
        for field in ['integration_readiness', 'blockers']:
            val = getattr(assess, field, None)
            print(f"      {field}: {repr(val)}")
    else:
        print(f"      ⚠️  No assessment record found!")

    print(f"\n{'='*60}\n")


if __name__ == '__main__':
    import sys
    system_id = int(sys.argv[1]) if len(sys.argv) > 1 else 116
    debug_system(system_id)
