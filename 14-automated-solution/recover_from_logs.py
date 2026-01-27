#!/usr/bin/env python3
"""
Log Data Recovery Script
Purpose: Extract and restore data from API request logs
Created: 2026-01-25
Usage: python recover_from_logs.py <log_file> <system_name>

Example:
    python recover_from_logs.py backend/logs/api_requests.log "test"
"""

import json
import sys
import argparse
from datetime import datetime
from pathlib import Path


def extract_system_data_from_logs(log_file, system_name=None):
    """
    Extract system creation/update requests from logs

    Args:
        log_file: Path to API request log file
        system_name: Optional filter for specific system name

    Returns:
        List of system data payloads
    """
    results = []

    with open(log_file, 'r', encoding='utf-8') as f:
        current_entry = []

        for line in f:
            line = line.strip()

            # Skip empty lines
            if not line:
                if current_entry:
                    # Try to parse accumulated JSON
                    try:
                        entry_json = '\n'.join(current_entry)
                        data = json.loads(entry_json)

                        # Check if this is a system-related request
                        if '/api/systems/' in data.get('path', ''):
                            if data.get('method') in ['POST', 'PUT', 'PATCH']:
                                body = data.get('body', {})

                                # Filter by system name if provided
                                if system_name:
                                    if system_name.lower() in str(body.get('system_name', '')).lower():
                                        results.append({
                                            'timestamp': data.get('timestamp'),
                                            'method': data.get('method'),
                                            'path': data.get('path'),
                                            'user': data.get('user'),
                                            'data': body
                                        })
                                else:
                                    results.append({
                                        'timestamp': data.get('timestamp'),
                                        'method': data.get('method'),
                                        'path': data.get('path'),
                                        'user': data.get('user'),
                                        'data': body
                                    })
                    except json.JSONDecodeError:
                        pass

                    current_entry = []
                continue

            current_entry.append(line)

    return results


def print_recovery_report(results):
    """Print a formatted report of found data"""
    if not results:
        print("❌ No matching system data found in logs")
        return

    print(f"\n✅ Found {len(results)} system save attempt(s)\n")
    print("=" * 80)

    for i, entry in enumerate(results, 1):
        print(f"\n📋 Entry {i}:")
        print(f"   Timestamp: {entry['timestamp']}")
        print(f"   Method: {entry['method']}")
        print(f"   Path: {entry['path']}")
        print(f"   User: {entry['user']}")
        print(f"\n   Data Preview:")

        data = entry['data']

        # Print key fields
        key_fields = [
            'system_name', 'system_name_en', 'org', 'scope',
            'status', 'system_group', 'purpose'
        ]

        for field in key_fields:
            if field in data:
                value = data[field]
                if isinstance(value, str) and len(value) > 50:
                    value = value[:50] + '...'
                print(f"   - {field}: {value}")

        # Check for architecture data
        if 'architecture' in data:
            arch = data['architecture']
            print(f"   - architecture fields: {len(arch)} fields")

            # Show the problematic fields
            problem_fields = [
                'containerization', 'is_multi_tenant',
                'has_layered_architecture', 'has_cicd',
                'has_automated_testing'
            ]

            for field in problem_fields:
                if field in arch:
                    print(f"     ✓ {field}: {arch[field]}")

        print(f"\n   Full JSON saved to: recovery_data_{i}.json")

        # Save full JSON to file
        output_file = f"recovery_data_{i}.json"
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(entry['data'], f, indent=2, ensure_ascii=False)

        print("=" * 80)


def generate_restore_script(results, output_file='restore_data.py'):
    """Generate a Python script to restore the data to database"""

    script = f'''#!/usr/bin/env python3
"""
Auto-generated data restoration script
Created: {datetime.now().isoformat()}
Source: Log file recovery

Usage:
    # From Django project root
    python manage.py shell < {output_file}
"""

import json
from apps.systems.models import System, SystemArchitecture
from apps.organizations.models import Organization
from django.contrib.auth import get_user_model

User = get_user_model()

def restore_system_data():
    """Restore system data from logs"""

    # Data extracted from logs
    recovered_data = {json.dumps([r['data'] for r in results], indent=4)}

    for i, data in enumerate(recovered_data, 1):
        print(f"\\n{'='*60}")
        print(f"Restoring system {{i}}: {{data.get('system_name', 'unknown')}}")
        print(f"{'='*60}")

        try:
            # Get or create organization
            org_id = data.get('org')
            org = Organization.objects.get(id=org_id)

            # Check if system already exists
            system_name = data.get('system_name')
            existing = System.objects.filter(
                org=org,
                system_name=system_name
            ).first()

            if existing:
                print(f"⚠️  System already exists (ID: {{existing.id}})")
                print(f"   Options:")
                print(f"   1. Update existing system")
                print(f"   2. Skip this entry")
                choice = input("   Enter choice (1/2): ")

                if choice == '2':
                    print("   ⏭️  Skipped")
                    continue

                system = existing
            else:
                # Create new system
                system = System(org=org)

            # Update system fields
            for field, value in data.items():
                if field in ['architecture', 'data_info', 'operations',
                            'integration', 'assessment']:
                    continue  # Handle nested models separately

                if hasattr(system, field):
                    setattr(system, field, value)

            system.save()
            print(f"✅ System saved (ID: {{system.id}})")

            # Update architecture data
            if 'architecture' in data:
                arch_data = data['architecture']
                arch, created = SystemArchitecture.objects.get_or_create(
                    system=system
                )

                for field, value in arch_data.items():
                    if hasattr(arch, field):
                        setattr(arch, field, value)

                arch.save()
                print(f"✅ Architecture data saved")

        except Exception as e:
            print(f"❌ Error restoring system {{i}}: {{e}}")
            import traceback
            traceback.print_exc()

# Run restoration
if __name__ == '__main__':
    restore_system_data()
    print("\\n✅ Restoration complete!")
'''

    with open(output_file, 'w', encoding='utf-8') as f:
        f.write(script)

    print(f"\n📝 Restore script generated: {output_file}")
    print(f"   To restore data, run:")
    print(f"   python manage.py shell < {output_file}")


def main():
    parser = argparse.ArgumentParser(
        description='Recover system data from API request logs'
    )
    parser.add_argument(
        'log_file',
        help='Path to API request log file'
    )
    parser.add_argument(
        '-s', '--system-name',
        help='Filter by system name (case-insensitive partial match)',
        default=None
    )
    parser.add_argument(
        '-o', '--output',
        help='Output file for restore script',
        default='restore_data.py'
    )

    args = parser.parse_args()

    # Check if log file exists
    if not Path(args.log_file).exists():
        print(f"❌ Error: Log file not found: {args.log_file}")
        print(f"\nNote: Logging middleware must be installed first.")
        print(f"See: 14-automated-solution/request_logging_middleware.py")
        sys.exit(1)

    print(f"🔍 Searching for system data in: {args.log_file}")
    if args.system_name:
        print(f"   Filter: system_name contains '{args.system_name}'")
    print()

    # Extract data from logs
    results = extract_system_data_from_logs(args.log_file, args.system_name)

    # Print report
    print_recovery_report(results)

    # Generate restore script if data found
    if results:
        generate_restore_script(results, args.output)

    return 0 if results else 1


if __name__ == '__main__':
    sys.exit(main())
