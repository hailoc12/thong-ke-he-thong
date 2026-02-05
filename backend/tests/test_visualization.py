#!/usr/bin/env python3
"""
Quick test for visualization generation
"""

import sys
import os
sys.path.insert(0, os.path.dirname(__file__))

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
import django
django.setup()

from apps.systems.views import generate_visualization

# Test data - system list
test_data_systems = {
    'columns': ['id', 'system_name', 'org_name', 'status'],
    'rows': [
        {'id': 1, 'system_name': 'Hệ thống A', 'org_name': 'Đơn vị 1', 'status': 'active'},
        {'id': 2, 'system_name': 'Hệ thống B', 'org_name': 'Đơn vị 2', 'status': 'active'},
        {'id': 3, 'system_name': 'Hệ thống C', 'org_name': 'Đơn vị 1', 'status': 'inactive'},
    ],
    'total_rows': 3
}

# Test data - comparison (bar chart)
test_data_comparison = {
    'columns': ['org_name', 'count'],
    'rows': [
        {'org_name': 'Đơn vị 1', 'count': 10},
        {'org_name': 'Đơn vị 2', 'count': 5},
        {'org_name': 'Đơn vị 3', 'count': 8},
    ],
    'total_rows': 3
}

# Test data - distribution (pie chart)
test_data_distribution = {
    'columns': ['status', 'count'],
    'rows': [
        {'status': 'Hoạt động', 'count': 15},
        {'status': 'Tạm dừng', 'count': 3},
        {'status': 'Ngừng', 'count': 2},
    ],
    'total_rows': 3
}

print("=" * 80)
print("TEST 1: System list (should generate table)")
print("=" * 80)
viz1 = generate_visualization(test_data_systems, "Danh sách hệ thống")
if viz1:
    print("✓ Generated visualization")
    print(f"  Length: {len(viz1)} chars")
    print(f"  Contains table: {'ai-viz-table' in viz1}")
    print(f"  Contains link: {'ai-viz-link' in viz1}")
    print("\nFirst 500 chars:")
    print(viz1[:500])
else:
    print("✗ No visualization generated")

print("\n" + "=" * 80)
print("TEST 2: Comparison data (should generate bar chart)")
print("=" * 80)
viz2 = generate_visualization(test_data_comparison, "Đơn vị nào có nhiều hệ thống nhất")
if viz2:
    print("✓ Generated visualization")
    print(f"  Length: {len(viz2)} chars")
    print(f"  Contains Chart.js: {'Chart' in viz2}")
    has_bar = "type: 'bar'" in viz2
    print(f"  Type: bar chart = {has_bar}")
    print("\nFirst 500 chars:")
    print(viz2[:500])
else:
    print("✗ No visualization generated")

print("\n" + "=" * 80)
print("TEST 3: Distribution data (should generate pie chart)")
print("=" * 80)
viz3 = generate_visualization(test_data_distribution, "Phân bố trạng thái hệ thống")
if viz3:
    print("✓ Generated visualization")
    print(f"  Length: {len(viz3)} chars")
    print(f"  Contains Chart.js: {'Chart' in viz3}")
    has_pie = "type: 'pie'" in viz3
    print(f"  Type: pie chart = {has_pie}")
    print("\nFirst 500 chars:")
    print(viz3[:500])
else:
    print("✗ No visualization generated")

print("\n" + "=" * 80)
print("TEST 4: Empty data (should return None)")
print("=" * 80)
viz4 = generate_visualization({'columns': [], 'rows': [], 'total_rows': 0}, "Empty query")
if viz4 is None:
    print("✓ Correctly returned None for empty data")
else:
    print("✗ Should return None for empty data")

print("\n" + "=" * 80)
print("All tests completed!")
print("=" * 80)
