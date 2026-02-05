#!/usr/bin/env python3
"""
Simple test for visualization detection logic (no Django required)
"""

def detect_visualization_type(rows, columns, query_text, debug=False):
    """Copy of _detect_visualization_type for testing"""
    query_lower = query_text.lower()

    # Check for time series data
    has_date_column = any('date' in str(col).lower() or 'time' in str(col).lower() or 'năm' in str(col).lower() or 'tháng' in str(col).lower() for col in columns)

    # Check for numeric data
    numeric_columns = []
    for col in columns:
        if rows and col in rows[0]:
            try:
                val = rows[0][col]
                if isinstance(val, (int, float)) and not isinstance(val, bool):
                    numeric_columns.append(col)
            except:
                pass

    if debug:
        print(f"  DEBUG: has_date_column={has_date_column}, numeric_columns={numeric_columns}")
        print(f"  DEBUG: len(rows)={len(rows)}, query_lower contains 'nhiều nhất': {'nhiều nhất' in query_lower}")

    # Rules for visualization selection
    if has_date_column and numeric_columns:
        return 'line'  # Time series data

    if len(rows) <= 10 and numeric_columns and any(word in query_lower for word in ['phân bố', 'tỷ lệ', 'phần trăm', '%', 'distribution']):
        return 'pie'  # Small dataset with distribution

    if len(rows) <= 20 and numeric_columns and any(word in query_lower for word in ['so sánh', 'nhiều nhất', 'nhiều', 'nhất', 'ít nhất', 'ít', 'top', 'compare', 'most', 'least']):
        return 'bar'  # Comparison data

    # Default to table for detailed data
    return 'table'


# Test cases
tests = [
    {
        'name': 'System list (should be table)',
        'data': {
            'columns': ['id', 'system_name', 'org_name', 'status'],
            'rows': [
                {'id': 1, 'system_name': 'Hệ thống A', 'org_name': 'Đơn vị 1', 'status': 'active'},
                {'id': 2, 'system_name': 'Hệ thống B', 'org_name': 'Đơn vị 2', 'status': 'active'},
            ]
        },
        'query': 'Danh sách hệ thống',
        'expected': 'table'
    },
    {
        'name': 'Comparison query (should be bar)',
        'data': {
            'columns': ['org_name', 'count'],
            'rows': [
                {'org_name': 'Đơn vị 1', 'count': 10},
                {'org_name': 'Đơn vị 2', 'count': 5},
                {'org_name': 'Đơn vị 3', 'count': 8},
            ]
        },
        'query': 'Đơn vị nào có nhiều hệ thống nhất',
        'expected': 'bar'
    },
    {
        'name': 'Distribution query (should be pie)',
        'data': {
            'columns': ['status', 'count'],
            'rows': [
                {'status': 'Hoạt động', 'count': 15},
                {'status': 'Tạm dừng', 'count': 3},
                {'status': 'Ngừng', 'count': 2},
            ]
        },
        'query': 'Phân bố trạng thái hệ thống',
        'expected': 'pie'
    },
    {
        'name': 'Time series (should be line)',
        'data': {
            'columns': ['năm', 'số_hệ_thống'],
            'rows': [
                {'năm': '2023', 'số_hệ_thống': 10},
                {'năm': '2024', 'số_hệ_thống': 15},
                {'năm': '2025', 'số_hệ_thống': 20},
            ]
        },
        'query': 'Xu hướng số lượng hệ thống',
        'expected': 'line'
    },
    {
        'name': 'Large dataset (should be table)',
        'data': {
            'columns': ['name', 'count'],
            'rows': [{'name': f'Item {i}', 'count': i} for i in range(25)]
        },
        'query': 'Danh sách 25 items',
        'expected': 'table'
    }
]

print("=" * 80)
print("VISUALIZATION TYPE DETECTION TESTS")
print("=" * 80)

passed = 0
failed = 0

for test in tests:
    is_debug = (test['expected'] != 'table' and test['name'].startswith('Comparison'))
    result = detect_visualization_type(
        test['data']['rows'],
        test['data']['columns'],
        test['query'],
        debug=is_debug
    )

    if result == test['expected']:
        print(f"✓ {test['name']}")
        print(f"  Expected: {test['expected']}, Got: {result}")
        passed += 1
    else:
        print(f"✗ {test['name']}")
        print(f"  Expected: {test['expected']}, Got: {result}")
        failed += 1
    print()

print("=" * 80)
print(f"Results: {passed} passed, {failed} failed")
print("=" * 80)
