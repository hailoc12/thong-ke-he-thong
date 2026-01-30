#!/usr/bin/env python3
"""
Script to find and add 'other' option to all dropdown arrays in frontend
that correspond to backend fields with 'other' choice
"""

import re
import os

# Fields that need 'other' option (from backend models)
FIELDS_NEED_OTHER = [
    ('hosting_platform', 'Hosting Platform', 'Khác'),
    ('database_model', 'Database Model', 'Khác'),
    ('mobile_app', 'Mobile App', 'Khác'),
    ('dev_type', 'Development Type', 'Khác'),
    ('warranty_status', 'Warranty Status', 'Khác'),
    ('vendor_dependency', 'Vendor Dependency', 'Khác'),
    ('deployment_location', 'Deployment Location', 'Khác'),
    ('compute_type', 'Compute Type', 'Khác'),
]

# Files to check
FILES_TO_CHECK = [
    'frontend/src/pages/SystemCreate.tsx',
    'frontend/src/pages/SystemEdit.tsx',
]

def find_options_arrays(content):
    """Find all const arrays that define options"""
    # Pattern: const xxxOptions = [...]
    pattern = r'const\s+(\w+Options)\s*=\s*\[(.*?)\];'
    matches = re.findall(pattern, content, re.DOTALL)
    return matches

def has_other_option(options_content):
    """Check if options array has 'other' value"""
    return "value: 'other'" in options_content or 'value: "other"' in options_content

def main():
    print("=" * 70)
    print("Frontend Options Arrays Analysis")
    print("=" * 70)

    for file_path in FILES_TO_CHECK:
        full_path = f'/Users/shimazu/Dropbox/9. active/consultant/support_b4t/thong_ke_he_thong/{file_path}'

        if not os.path.exists(full_path):
            print(f"\n⚠️  File not found: {file_path}")
            continue

        print(f"\n📄 File: {file_path}")
        print("-" * 70)

        with open(full_path, 'r', encoding='utf-8') as f:
            content = f.read()

        options_arrays = find_options_arrays(content)

        if not options_arrays:
            print("   No options arrays found")
            continue

        print(f"   Found {len(options_arrays)} options arrays:\n")

        for array_name, array_content in options_arrays:
            has_other = has_other_option(array_content)
            status = "✅ HAS 'other'" if has_other else "❌ MISSING 'other'"

            # Check if this array is for one of our target fields
            is_target = False
            for field_name, _, _ in FIELDS_NEED_OTHER:
                # Convert field_name to camelCase for matching
                camel_name = ''.join(word.capitalize() for word in field_name.split('_'))
                if camel_name.lower() in array_name.lower():
                    is_target = True
                    break

            marker = "🎯" if is_target else "  "
            print(f"   {marker} {array_name}: {status}")

    print("\n" * 2)
    print("=" * 70)
    print("Summary")
    print("=" * 70)
    print("""
Next Steps:
1. Review the arrays marked with 🎯 (target fields)
2. For any missing 'other' option, manually add:
   { label: 'Khác', value: 'other' }
3. Some fields may use inline options or come from API
4. Check if form fields exist for all nested data (architecture_data, operations_data)
""")

if __name__ == '__main__':
    main()
