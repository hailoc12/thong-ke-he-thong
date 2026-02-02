#!/usr/bin/env python3
"""
Script to populate data_volume_gb from existing data_volume text field
Converts "100GB", "1TB", "10TB" etc. to numeric GB values
"""
import os
import sys
import django
import re
from decimal import Decimal

# Setup Django
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apps.systems.models import System


def parse_volume_to_gb(volume_text):
    """
    Parse volume text to GB numeric value
    Examples:
    - "100GB" -> 100
    - "1TB" -> 1024
    - "1.5TB" -> 1536
    - "500MB" -> 0.5
    - "2PB" -> 2097152
    - "under_1gb" -> 0.5
    - "over_100tb" -> 102400
    """
    if not volume_text or not isinstance(volume_text, str):
        return None

    # Clean text
    volume_text = volume_text.strip().upper()

    # Handle special format strings
    special_formats = {
        'UNDER_1GB': Decimal('0.5'),        # Less than 1GB -> estimate 0.5GB
        'OVER_100TB': Decimal('102400'),    # More than 100TB -> estimate 100TB
    }

    if volume_text in special_formats:
        return special_formats[volume_text]

    # Extract number and unit
    match = re.match(r'([0-9.]+)\s*(B|KB|MB|GB|TB|PB)?', volume_text)
    if not match:
        return None

    number = match.group(1)
    unit = match.group(2) or 'GB'  # Default to GB if no unit

    try:
        value = Decimal(number)
    except:
        return None

    # Convert to GB
    conversions = {
        'B': Decimal('0.000000001'),    # 1 B = 10^-9 GB
        'KB': Decimal('0.000001'),       # 1 KB = 10^-6 GB
        'MB': Decimal('0.001'),          # 1 MB = 10^-3 GB
        'GB': Decimal('1'),              # 1 GB = 1 GB
        'TB': Decimal('1024'),           # 1 TB = 1024 GB
        'PB': Decimal('1048576'),        # 1 PB = 1024^2 GB
    }

    gb_value = value * conversions.get(unit, Decimal('1'))
    return gb_value


def populate_data_volume_gb():
    """Populate data_volume_gb field for all systems"""

    systems = System.objects.filter(is_deleted=False)
    total = systems.count()
    updated = 0
    skipped = 0
    errors = 0

    print(f"Found {total} systems to process...")
    print("-" * 60)

    for system in systems:
        if not system.data_volume:
            skipped += 1
            continue

        gb_value = parse_volume_to_gb(system.data_volume)

        if gb_value is not None:
            system.data_volume_gb = gb_value
            system.save(update_fields=['data_volume_gb'])
            updated += 1
            print(f"✓ {system.system_name[:50]:50} | {system.data_volume:15} → {gb_value:>10.2f} GB")
        else:
            errors += 1
            print(f"✗ {system.system_name[:50]:50} | {system.data_volume:15} → Parse failed")

    print("-" * 60)
    print(f"\nResults:")
    print(f"  Total systems: {total}")
    print(f"  Updated: {updated}")
    print(f"  Skipped (no data_volume): {skipped}")
    print(f"  Errors (parse failed): {errors}")

    # Show total
    if updated > 0:
        from django.db.models import Sum
        total_gb = System.objects.filter(is_deleted=False).aggregate(Sum('data_volume_gb'))['data_volume_gb__sum']
        print(f"\n📊 Total data volume: {total_gb:.2f} GB ({total_gb/1024:.2f} TB)")


if __name__ == '__main__':
    print("=" * 60)
    print("Populating data_volume_gb from data_volume text field")
    print("=" * 60)
    print()

    populate_data_volume_gb()

    print("\n✅ Done!")
