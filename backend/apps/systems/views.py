from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.views import APIView
from rest_framework.renderers import BaseRenderer
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q, Count, Sum, Avg
from django.db.models.functions import Coalesce
from django.conf import settings
from django.http import StreamingHttpResponse
import json
import logging
import time

from apps.accounts.permissions import IsOrgUserOrAdmin, CanManageOrgSystems
from .models import System, Attachment, AIConversation, AIMessage, AIRequestLog, AIResponseFeedback
from .serializers_feedback import AIResponseFeedbackSerializer, FeedbackStatsSerializer, ImprovementPolicySerializer

logger = logging.getLogger(__name__)

# JSON Serialization Helper for SSE - handles Decimal, date, datetime
def serialize_for_json(obj):
    """Convert non-JSON-serializable types to JSON-safe formats"""
    from decimal import Decimal
    from datetime import date, datetime

    if isinstance(obj, dict):
        return {k: serialize_for_json(v) for k, v in obj.items()}
    elif isinstance(obj, list):
        return [serialize_for_json(item) for item in obj]
    elif isinstance(obj, Decimal):
        return float(obj)
    elif isinstance(obj, (date, datetime)):
        return obj.isoformat()
    else:
        return obj

# AI Model Cost Estimation (USD per 1M tokens)
# Pricing as of 2025
AI_MODEL_PRICING = {
    # OpenAI Models
    'gpt-5.2': {'input': 5.0, 'output': 15.0},  # Estimated pricing
    'gpt-5': {'input': 5.0, 'output': 15.0},
    'gpt-4o': {'input': 2.5, 'output': 10.0},
    'gpt-4o-mini': {'input': 0.15, 'output': 0.60},
    # Anthropic Models
    'claude-sonnet-4-20250514': {'input': 3.0, 'output': 15.0},
    'claude-3-5-sonnet-20241022': {'input': 3.0, 'output': 15.0},
    'claude-3-opus-20240229': {'input': 15.0, 'output': 75.0},
}


# ========================================
# Interactive Data Visualization Generator
# ========================================

def generate_visualization(query_result, query_text="", request=None):
    """
    Generate interactive D3.js visualization with auto-recovery

    Features:
    - D3.js for dynamic, impressive visualizations
    - Auto-detection of best viz type
    - Error handling with fallback
    - Vietnamese labels throughout
    - Smooth animations and interactions

    Returns HTML string with embedded D3.js code
    """
    logger.info(f"[VIZ] Generating D3.js visualization for: {query_text[:50]}")

    if not query_result or not query_result.get('rows'):
        logger.warning(f"[VIZ] No data - returning None")
        return None

    rows = query_result.get('rows', [])
    columns = query_result.get('columns', [])

    if not rows or not columns:
        return None

    # Detect best visualization type
    viz_type = _detect_visualization_type(rows, columns, query_text)
    logger.info(f"[VIZ] Detected type: {viz_type}")

    try:
        # Try to generate visualization
        if viz_type == 'table':
            html = _generate_d3_table(rows, columns, query_text, request)
        elif viz_type == 'bar':
            html = _generate_d3_bar_chart(rows, columns, query_text)
        elif viz_type == 'pie':
            html = _generate_d3_pie_chart(rows, columns, query_text)
        elif viz_type == 'line':
            html = _generate_d3_line_chart(rows, columns, query_text)
        else:
            html = _generate_d3_table(rows, columns, query_text, request)

        # Validate HTML before returning
        if html and len(html) > 100 and '<div' in html:
            logger.info(f"[VIZ] Successfully generated {viz_type} visualization ({len(html)} chars)")
            return html
        else:
            raise ValueError("Invalid HTML output")

    except Exception as e:
        logger.error(f"[VIZ] Error generating {viz_type}: {e}")
        # Fallback to simple table
        try:
            html = _generate_d3_table(rows, columns, query_text, request)
            logger.info(f"[VIZ] Fallback table generated successfully")
            return html
        except Exception as fallback_error:
            logger.error(f"[VIZ] Fallback also failed: {fallback_error}")
            return None


def generate_visualization_data(query_result, query_text="", request=None):
    """
    Generate structured visualization data for React components (NEW APPROACH)

    Returns dict with visualization data instead of HTML string.
    This allows proper React component rendering with pagination, search, etc.

    Returns:
        dict or None: {
            'type': 'table'|'bar'|'pie'|'line',
            'data': {...},  # Structure depends on type
            'config': {...}  # Visualization configuration
        }
    """
    logger.info(f"[VIZ-DATA] Generating structured visualization data for: {query_text[:50]}")

    if not query_result or not query_result.get('rows'):
        logger.warning(f"[VIZ-DATA] No data - returning None")
        return None

    rows = query_result.get('rows', [])
    columns = query_result.get('columns', [])

    if not rows or not columns:
        return None

    # Detect best visualization type
    viz_type = _detect_visualization_type(rows, columns, query_text)
    logger.info(f"[VIZ-DATA] Detected type: {viz_type}")

    try:
        # Generate structured data based on type
        if viz_type == 'table':
            viz_data = _generate_d3_table_data(rows, columns, request)
        elif viz_type == 'bar':
            # TODO: Implement structured bar chart data
            viz_data = _generate_d3_table_data(rows, columns, request)  # Fallback for now
        elif viz_type == 'pie':
            # TODO: Implement structured pie chart data
            viz_data = _generate_d3_table_data(rows, columns, request)  # Fallback for now
        elif viz_type == 'line':
            # TODO: Implement structured line chart data
            viz_data = _generate_d3_table_data(rows, columns, request)  # Fallback for now
        else:
            viz_data = _generate_d3_table_data(rows, columns, request)

        # Validate data before returning
        if viz_data and 'type' in viz_data and 'data' in viz_data:
            logger.info(f"[VIZ-DATA] Successfully generated {viz_type} visualization data")
            return viz_data
        else:
            raise ValueError("Invalid visualization data structure")

    except Exception as e:
        logger.error(f"[VIZ-DATA] Error generating {viz_type}: {e}")
        # Fallback to simple table data
        try:
            viz_data = _generate_d3_table_data(rows, columns, request)
            logger.info(f"[VIZ-DATA] Fallback table data generated successfully")
            return viz_data
        except Exception as fallback_error:
            logger.error(f"[VIZ-DATA] Fallback also failed: {fallback_error}")
            return None


def _vietnamize_column_name(col_name):
    """Convert English column names to Vietnamese"""
    mapping = {
        # Common fields
        'id': 'ID',
        'count': 'Số lượng',
        'total': 'Tổng',
        'sum': 'Tổng cộng',
        'avg': 'Trung bình',
        'average': 'Trung bình',
        'min': 'Tối thiểu',
        'max': 'Tối đa',

        # System fields
        'system_name': 'Tên hệ thống',
        'system_code': 'Mã hệ thống',
        'system_id': 'ID hệ thống',

        # Organization fields
        'org_name': 'Đơn vị',
        'org_id': 'ID đơn vị',
        'organization': 'Tổ chức',
        'organization_name': 'Tên tổ chức',

        # Status and classification
        'status': 'Trạng thái',
        'type': 'Loại',
        'category': 'Danh mục',
        'group': 'Nhóm',

        # Technical fields
        'programming_language': 'Ngôn ngữ lập trình',
        'framework': 'Framework',
        'database': 'Cơ sở dữ liệu',
        'hosting': 'Nền tảng triển khai',

        # Security
        'security_level': 'Mức độ bảo mật',
        'has_firewall': 'Firewall',
        'has_mfa': 'MFA',

        # Metrics
        'user_count': 'Số người dùng',
        'data_volume': 'Dung lượng dữ liệu',
        'performance': 'Hiệu năng',
        'uptime': 'Thời gian hoạt động',

        # Time fields
        'created_at': 'Ngày tạo',
        'updated_at': 'Ngày cập nhật',
        'year': 'Năm',
        'month': 'Tháng',
        'date': 'Ngày',
    }

    col_lower = str(col_name).lower().strip()

    # Exact match
    if col_lower in mapping:
        return mapping[col_lower]

    # Partial match
    for eng, vie in mapping.items():
        if eng in col_lower:
            return vie

    # Return original with capitalization if no match
    return str(col_name).title()


def _detect_visualization_type(rows, columns, query_text):
    """Detect best visualization type based on data shape and query"""
    import re

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

    # Rules for visualization selection
    if has_date_column and numeric_columns:
        return 'line'  # Time series data

    if len(rows) <= 10 and numeric_columns and any(word in query_lower for word in ['phân bố', 'tỷ lệ', 'phần trăm', '%', 'distribution']):
        return 'pie'  # Small dataset with distribution

    if len(rows) <= 20 and numeric_columns and any(word in query_lower for word in ['so sánh', 'nhiều nhất', 'nhiều', 'nhất', 'ít nhất', 'ít', 'top', 'compare', 'most', 'least']):
        return 'bar'  # Comparison data

    # Default to table for detailed data
    return 'table'


def _generate_interactive_table(rows, columns, query_text):
    """Generate interactive table with clickable links"""
    import html

    # Limit to first 100 rows for performance
    display_rows = rows[:100]
    has_more = len(rows) > 100

    # Detect entity columns for linking
    system_col = None
    org_col = None

    for col in columns:
        col_lower = str(col).lower()
        if 'system' in col_lower or 'hệ thống' in col_lower:
            system_col = col
        elif 'org' in col_lower or 'đơn vị' in col_lower or 'tổ chức' in col_lower:
            org_col = col

    # Build HTML table
    html_parts = []
    html_parts.append('''
    <div class="ai-visualization" style="margin-top: 16px; margin-bottom: 16px;">
        <style>
            .ai-viz-table {
                width: 100%;
                border-collapse: separate;
                border-spacing: 0;
                font-size: 14px;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                background: #ffffff;
                box-shadow: 0 2px 8px rgba(0,0,0,0.08);
                border-radius: 8px;
                overflow: hidden;
                border: 1px solid #e8e8e8;
            }
            .ai-viz-table thead {
                background: linear-gradient(135deg, #1677ff 0%, #0958d9 100%);
                color: white;
            }
            .ai-viz-table th {
                padding: 14px 16px;
                text-align: left;
                font-weight: 600;
                font-size: 13px;
                letter-spacing: 0.3px;
                text-transform: uppercase;
                border-bottom: 3px solid #0958d9;
                white-space: nowrap;
            }
            .ai-viz-table td {
                padding: 12px 16px;
                border-bottom: 1px solid #f0f0f0;
                color: #262626;
                line-height: 1.6;
            }
            .ai-viz-table tbody tr {
                transition: all 0.2s ease;
            }
            .ai-viz-table tbody tr:hover {
                background-color: #f0f7ff;
                transform: scale(1.001);
            }
            .ai-viz-table tbody tr:last-child td {
                border-bottom: none;
            }
            .ai-viz-link {
                color: #1677ff;
                text-decoration: none;
                cursor: pointer;
                font-weight: 500;
                border-bottom: 1px solid transparent;
                transition: all 0.2s ease;
            }
            .ai-viz-link:hover {
                color: #0958d9;
                border-bottom-color: #0958d9;
            }
            .ai-viz-footer {
                margin-top: 12px;
                padding: 8px 12px;
                text-align: right;
                font-size: 13px;
                color: #8c8c8c;
                background: #fafafa;
                border-radius: 6px;
                border: 1px solid #f0f0f0;
            }
        </style>
        <table class="ai-viz-table">
            <thead>
                <tr>
    ''')

    # Table headers - Vietnamized
    for col in columns:
        col_vietnamese = _vietnamize_column_name(col)
        html_parts.append(f'<th>{html.escape(col_vietnamese)}</th>')

    html_parts.append('</tr></thead><tbody>')

    # Table rows
    for row in display_rows:
        html_parts.append('<tr>')
        for col in columns:
            value = row.get(col, '')

            # Check if this should be a link
            cell_html = html.escape(str(value)) if value is not None else ''

            # Add link if it's a system or org column
            if col == system_col and value:
                # Try to find system ID
                system_id = row.get('id') or row.get('system_id')
                if system_id:
                    cell_html = f'<a href="/systems/{system_id}" class="ai-viz-link" onclick="event.preventDefault(); window.navigateToSystem({system_id});">{html.escape(str(value))}</a>'
            elif col == org_col and value:
                # Try to find org ID
                org_id = row.get('org_id') or row.get('organization_id')
                if org_id:
                    cell_html = f'<a href="/dashboard/unit?org={org_id}" class="ai-viz-link" onclick="event.preventDefault(); window.navigateToDashboard({org_id});">{html.escape(str(value))}</a>'

            html_parts.append(f'<td>{cell_html}</td>')
        html_parts.append('</tr>')

    html_parts.append('</tbody></table>')

    # Footer
    if has_more:
        html_parts.append(f'<div class="ai-viz-footer">Hiển thị 100/{len(rows)} kết quả</div>')
    else:
        html_parts.append(f'<div class="ai-viz-footer">Tổng: {len(rows)} kết quả</div>')

    html_parts.append('</div>')

    return ''.join(html_parts)


def _generate_bar_chart(rows, columns, query_text):
    """Generate interactive bar chart"""
    import html

    # Find label and value columns
    label_col = columns[0]
    value_col = None

    for col in columns:
        if col != label_col:
            # Check if numeric
            try:
                if isinstance(rows[0].get(col), (int, float)):
                    value_col = col
                    break
            except:
                pass

    if not value_col:
        # Fallback to table
        return _generate_interactive_table(rows, columns, query_text)

    # Prepare data
    chart_data = []
    for row in rows[:20]:  # Limit to 20 bars
        label = str(row.get(label_col, ''))
        value = float(row.get(value_col, 0))
        chart_data.append({'label': label, 'value': value})

    # Generate Chart.js HTML
    import json
    chart_id = f"chart_{hash(query_text) % 10000}"

    html_output = f'''
    <div class="ai-visualization" style="margin-top: 16px; padding: 20px; background: white; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
        <canvas id="{chart_id}" style="max-height: 400px;"></canvas>
        <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"></script>
        <script>
        (function() {{
            const ctx = document.getElementById('{chart_id}');
            if (ctx) {{
                new Chart(ctx, {{
                    type: 'bar',
                    data: {{
                        labels: {json.dumps([d['label'] for d in chart_data])},
                        datasets: [{{
                            label: '{html.escape(_vietnamize_column_name(value_col))}',
                            data: {json.dumps([d['value'] for d in chart_data])},
                            backgroundColor: 'rgba(24, 144, 255, 0.6)',
                            borderColor: 'rgba(24, 144, 255, 1)',
                            borderWidth: 2
                        }}]
                    }},
                    options: {{
                        responsive: true,
                        maintainAspectRatio: true,
                        plugins: {{
                            legend: {{
                                display: true,
                                position: 'top'
                            }},
                            title: {{
                                display: true,
                                text: '{html.escape(query_text)}'
                            }}
                        }},
                        scales: {{
                            y: {{
                                beginAtZero: true
                            }}
                        }}
                    }}
                }});
            }}
        }})();
        </script>
    </div>
    '''

    return html_output


def _generate_pie_chart(rows, columns, query_text):
    """Generate interactive pie chart"""
    import html
    import json

    # Find label and value columns
    label_col = columns[0]
    value_col = columns[1] if len(columns) > 1 else None

    if not value_col:
        return _generate_interactive_table(rows, columns, query_text)

    # Prepare data
    chart_data = []
    colors = [
        'rgba(24, 144, 255, 0.8)',
        'rgba(82, 196, 26, 0.8)',
        'rgba(250, 173, 20, 0.8)',
        'rgba(245, 34, 45, 0.8)',
        'rgba(114, 46, 209, 0.8)',
        'rgba(19, 194, 194, 0.8)',
        'rgba(250, 84, 28, 0.8)',
        'rgba(250, 219, 20, 0.8)',
    ]

    for i, row in enumerate(rows[:8]):  # Limit to 8 slices
        label = str(row.get(label_col, ''))
        value = float(row.get(value_col, 0))
        chart_data.append({'label': label, 'value': value, 'color': colors[i % len(colors)]})

    chart_id = f"chart_{hash(query_text) % 10000}"

    html_output = f'''
    <div class="ai-visualization" style="margin-top: 16px; padding: 20px; background: white; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
        <canvas id="{chart_id}" style="max-height: 400px;"></canvas>
        <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"></script>
        <script>
        (function() {{
            const ctx = document.getElementById('{chart_id}');
            if (ctx) {{
                new Chart(ctx, {{
                    type: 'pie',
                    data: {{
                        labels: {json.dumps([d['label'] for d in chart_data])},
                        datasets: [{{
                            data: {json.dumps([d['value'] for d in chart_data])},
                            backgroundColor: {json.dumps([d['color'] for d in chart_data])},
                            borderWidth: 2,
                            borderColor: '#fff'
                        }}]
                    }},
                    options: {{
                        responsive: true,
                        maintainAspectRatio: true,
                        plugins: {{
                            legend: {{
                                display: true,
                                position: 'right'
                            }},
                            title: {{
                                display: true,
                                text: '{html.escape(query_text)}'
                            }}
                        }}
                    }}
                }});
            }}
        }})();
        </script>
    </div>
    '''

    return html_output


def _generate_line_chart(rows, columns, query_text):
    """Generate interactive line chart for time series"""
    import html
    import json

    # Find date and value columns
    date_col = None
    value_col = None

    for col in columns:
        col_lower = str(col).lower()
        if 'date' in col_lower or 'time' in col_lower or 'năm' in col_lower or 'tháng' in col_lower:
            date_col = col
        elif isinstance(rows[0].get(col), (int, float)):
            value_col = col

    if not date_col or not value_col:
        return _generate_interactive_table(rows, columns, query_text)

    # Prepare data
    chart_data = []
    for row in rows:
        label = str(row.get(date_col, ''))
        value = float(row.get(value_col, 0))
        chart_data.append({'label': label, 'value': value})

    chart_id = f"chart_{hash(query_text) % 10000}"

    html_output = f'''
    <div class="ai-visualization" style="margin-top: 16px; padding: 20px; background: white; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
        <canvas id="{chart_id}" style="max-height: 400px;"></canvas>
        <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"></script>
        <script>
        (function() {{
            const ctx = document.getElementById('{chart_id}');
            if (ctx) {{
                new Chart(ctx, {{
                    type: 'line',
                    data: {{
                        labels: {json.dumps([d['label'] for d in chart_data])},
                        datasets: [{{
                            label: '{html.escape(_vietnamize_column_name(value_col))}',
                            data: {json.dumps([d['value'] for d in chart_data])},
                            borderColor: 'rgba(24, 144, 255, 1)',
                            backgroundColor: 'rgba(24, 144, 255, 0.1)',
                            borderWidth: 3,
                            fill: true,
                            tension: 0.4
                        }}]
                    }},
                    options: {{
                        responsive: true,
                        maintainAspectRatio: true,
                        plugins: {{
                            legend: {{
                                display: true,
                                position: 'top'
                            }},
                            title: {{
                                display: true,
                                text: '{html.escape(query_text)}'
                            }}
                        }},
                        scales: {{
                            y: {{
                                beginAtZero: true
                            }}
                        }}
                    }}
                }});
            }}
        }})();
        </script>
    </div>
    '''

    return html_output


# ========================================
# D3.js Visualization Functions
# Beautiful, Interactive, Vietnamese
# ========================================

def _generate_d3_table_data(rows, columns, request=None):
    """
    Generate structured data for D3 table (React component approach)

    Returns:
        dict: Structured data for React D3Table component
        {
            'type': 'table',
            'data': {
                'columns': [{'key': 'col1', 'label': 'Vietnamese Label', 'type': 'text|number|link'}],
                'rows': [{col1: value1, col2: value2, _system_id: 123}],
                'totalRows': 87
            },
            'config': {
                'pagination': {'pageSize': 10},
                'baseUrl': 'https://hientrangcds.mindmaid.ai'
            }
        }
    """
    # Determine base URL based on environment
    try:
        if request and hasattr(request, 'get_host'):
            host = request.get_host()
            if 'mindmaid.ai' in host or ':8002' in host:
                base_url = 'https://hientrangcds.mindmaid.ai'
            else:
                base_url = 'https://hientrangcds.mst.gov.vn'
        else:
            import os
            port = os.environ.get('PORT', '8000')
            base_url = 'https://hientrangcds.mindmaid.ai' if port == '8002' else 'https://hientrangcds.mst.gov.vn'
    except Exception:
        base_url = 'https://hientrangcds.mst.gov.vn'

    # Detect system and org columns for links
    system_col = next((col for col in columns if 'system_name' in col.lower() or col.lower() == 'name'), None)
    org_col = next((col for col in columns if 'org' in col.lower() and 'name' in col.lower()), None)

    # Generate column definitions
    table_columns = []
    for col in columns:
        col_def = {
            'key': col,
            'label': _vietnamize_column_name(col),
            'sortable': True,
            'searchable': True,
        }

        # Determine column type
        if col == system_col:
            col_def['type'] = 'link'
            col_def['linkType'] = 'system'
        elif col == org_col:
            col_def['type'] = 'link'
            col_def['linkType'] = 'organization'
        elif 'count' in col.lower() or 'total' in col.lower() or 'number' in col.lower():
            col_def['type'] = 'number'
        else:
            col_def['type'] = 'text'

        table_columns.append(col_def)

    # Prepare row data
    table_rows = []
    for row in rows:
        row_data = {}
        for col in columns:
            value = row.get(col, '')
            row_data[col] = str(value) if value is not None else ''

            # Add IDs for linking
            if col == system_col:
                row_data['_system_id'] = row.get('id') or row.get('system_id')
            elif col == org_col:
                row_data['_organization_id'] = row.get('org_id') or row.get('organization_id')

        table_rows.append(row_data)

    return {
        'type': 'table',
        'data': {
            'columns': table_columns,
            'rows': table_rows,
            'totalRows': len(rows),
        },
        'config': {
            'pagination': {
                'pageSize': 10,
                'showSizeChanger': True,
                'showTotal': True,
            },
            'baseUrl': base_url,
        }
    }


def _generate_d3_table(rows, columns, query_text, request=None):
    """
    Generate beautiful interactive D3.js table

    Features:
    - Sortable columns (click header)
    - Search functionality
    - Hover effects with smooth transitions
    - Clickable links to system/org details
    - Fully Vietnamese labels
    - Responsive design
    - Pagination (max 10 rows per page)
    """
    import html
    import json
    from django.conf import settings

    # Determine base URL based on environment
    # UAT: https://hientrangcds.mindmaid.ai
    # Production: https://hientrangcds.mst.gov.vn
    try:
        if request and hasattr(request, 'get_host'):
            host = request.get_host()
            if 'mindmaid.ai' in host:
                base_url = 'https://hientrangcds.mindmaid.ai'
            elif 'localhost:8002' in host or ':8002' in host:
                # UAT running on port 8002
                base_url = 'https://hientrangcds.mindmaid.ai'
            elif 'localhost:8000' in host or ':8000' in host:
                # Production running on port 8000
                base_url = 'https://hientrangcds.mst.gov.vn'
            else:
                base_url = 'https://hientrangcds.mst.gov.vn'
        else:
            # Fallback: use environment or default to production
            import os
            # Check port from environment or default
            port = os.environ.get('PORT', '8000')
            if port == '8002':
                base_url = 'https://hientrangcds.mindmaid.ai'
            else:
                base_url = 'https://hientrangcds.mst.gov.vn'
    except Exception as e:
        # If anything fails, default to production
        base_url = 'https://hientrangcds.mst.gov.vn'

    # Limit display
    display_rows = rows[:100]
    has_more = len(rows) > 100

    # Vietnamize all column names
    vie_columns = [_vietnamize_column_name(col) for col in columns]

    # Detect system and org columns for links
    system_col = next((col for col in columns if 'system_name' in col.lower() or col.lower() == 'name'), None)
    org_col = next((col for col in columns if 'org' in col.lower() and 'name' in col.lower()), None)

    # Prepare data as JSON for D3
    table_data = []
    for row in display_rows:
        row_data = {}
        for col in columns:
            value = row.get(col, '')
            row_data[col] = str(value) if value is not None else ''

            # Add IDs for linking
            if col == system_col:
                row_data['_system_id'] = row.get('id') or row.get('system_id')
            elif col == org_col:
                row_data['_org_id'] = row.get('org_id') or row.get('organization_id')

        table_data.append(row_data)

    viz_id = f"d3table_{abs(hash(query_text)) % 100000}"

    html_output = f'''
    <div id="{viz_id}" class="d3-viz-container" style="margin: 16px 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;">
        <style>
            #{viz_id} .d3-table-wrapper {{
                background: white;
                border-radius: 12px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.08);
                overflow: hidden;
            }}
            #{viz_id} .d3-table-header {{
                background: linear-gradient(135deg, #1677ff 0%, #0958d9 100%);
                color: white;
                padding: 16px 20px;
                font-size: 16px;
                font-weight: 600;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }}
            #{viz_id} .d3-search-box {{
                padding: 12px 20px;
                background: #fafafa;
                border-bottom: 1px solid #e8e8e8;
            }}
            #{viz_id} .d3-search-input {{
                width: 300px;
                padding: 8px 12px;
                border: 1px solid #d9d9d9;
                border-radius: 6px;
                font-size: 14px;
                transition: all 0.3s;
            }}
            #{viz_id} .d3-search-input:focus {{
                outline: none;
                border-color: #1677ff;
                box-shadow: 0 0 0 2px rgba(22, 119, 255, 0.1);
            }}
            #{viz_id} table {{
                width: 100%;
                border-collapse: collapse;
            }}
            #{viz_id} th {{
                background: #f5f5f5;
                padding: 14px 16px;
                text-align: left;
                font-weight: 600;
                font-size: 13px;
                color: #262626;
                border-bottom: 2px solid #e8e8e8;
                cursor: pointer;
                user-select: none;
                position: relative;
                transition: background 0.2s;
            }}
            #{viz_id} th:hover {{
                background: #e6f7ff;
            }}
            #{viz_id} th::after {{
                content: '⇅';
                position: absolute;
                right: 8px;
                opacity: 0.3;
                font-size: 12px;
            }}
            #{viz_id} th.sort-asc::after {{
                content: '↑';
                opacity: 1;
                color: #1677ff;
            }}
            #{viz_id} th.sort-desc::after {{
                content: '↓';
                opacity: 1;
                color: #1677ff;
            }}
            #{viz_id} td {{
                padding: 12px 16px;
                border-bottom: 1px solid #f0f0f0;
                color: #595959;
                font-size: 14px;
                transition: all 0.2s;
            }}
            #{viz_id} tr {{
                transition: all 0.2s ease;
            }}
            #{viz_id} tbody tr:hover {{
                background: linear-gradient(90deg, #e6f7ff 0%, #f0f7ff 100%);
                transform: translateX(2px);
            }}
            #{viz_id} .d3-link {{
                color: #1677ff;
                text-decoration: none;
                font-weight: 500;
                border-bottom: 1px solid transparent;
                transition: all 0.2s;
            }}
            #{viz_id} .d3-link:hover {{
                color: #0958d9;
                border-bottom-color: #0958d9;
            }}
            #{viz_id} .d3-footer {{
                padding: 12px 20px;
                background: #fafafa;
                color: #8c8c8c;
                font-size: 13px;
                display: flex;
                justify-content: space-between;
                align-items: center;
                border-top: 1px solid #e8e8e8;
            }}
            #{viz_id} .d3-pagination {{
                display: flex;
                gap: 8px;
                align-items: center;
            }}
            #{viz_id} .d3-page-btn {{
                padding: 6px 12px;
                border: 1px solid #d9d9d9;
                border-radius: 6px;
                background: white;
                color: #262626;
                cursor: pointer;
                font-size: 13px;
                transition: all 0.2s;
                user-select: none;
            }}
            #{viz_id} .d3-page-btn:hover:not(:disabled) {{
                border-color: #1677ff;
                color: #1677ff;
            }}
            #{viz_id} .d3-page-btn:disabled {{
                opacity: 0.4;
                cursor: not-allowed;
            }}
            #{viz_id} .d3-page-btn.active {{
                background: #1677ff;
                color: white;
                border-color: #1677ff;
            }}
            #{viz_id} .d3-page-info {{
                font-size: 13px;
                color: #595959;
            }}
            #{viz_id} .no-results {{
                padding: 40px;
                text-align: center;
                color: #8c8c8c;
                font-size: 14px;
            }}
        </style>

        <div class="d3-table-wrapper">
            <div class="d3-table-header">
                <span>📊 {html.escape(query_text[:60])}</span>
                <span id="{viz_id}-count">{len(display_rows)} kết quả</span>
            </div>
            <div class="d3-search-box">
                <input type="text"
                       class="d3-search-input"
                       placeholder="🔍 Tìm kiếm..."
                       id="{viz_id}-search">
            </div>
            <div style="overflow-x: auto; max-height: 600px;">
                <table id="{viz_id}-table"></table>
            </div>
            <div class="d3-footer">
                <span id="{viz_id}-footer" class="d3-page-info">
                    {f'Hiển thị 100/{len(rows)} kết quả' if has_more else f'Tổng: {len(rows)} kết quả'}
                </span>
                <div id="{viz_id}-pagination" class="d3-pagination"></div>
            </div>
        </div>

        <script src="https://d3js.org/d3.v7.min.js"></script>
        <script>
        (function() {{
            const data = {json.dumps(table_data, ensure_ascii=False)};
            const columns = {json.dumps(columns)};
            const vieColumns = {json.dumps(vie_columns, ensure_ascii=False)};
            const systemCol = {json.dumps(system_col)};
            const orgCol = {json.dumps(org_col)};
            const baseUrl = {json.dumps(base_url)};  // Base URL for links

            let filteredData = data;
            let sortColumn = null;
            let sortAscending = true;
            let currentPage = 1;
            const pageSize = 10;  // Max 10 systems per page

            function render() {{
                const table = d3.select('#{viz_id}-table');
                table.selectAll('*').remove();

                // Header
                const thead = table.append('thead').append('tr');
                vieColumns.forEach((vieCol, i) => {{
                    const th = thead.append('th')
                        .text(vieCol)
                        .classed('sort-asc', sortColumn === i && sortAscending)
                        .classed('sort-desc', sortColumn === i && !sortAscending)
                        .on('click', () => sortBy(i));
                }});

                // Body
                const tbody = table.append('tbody');

                if (filteredData.length === 0) {{
                    tbody.append('tr').append('td')
                        .attr('colspan', columns.length)
                        .attr('class', 'no-results')
                        .text('Không tìm thấy kết quả phù hợp');
                    d3.select('#{viz_id}-count').text('0 kết quả');
                    renderPagination();
                    return;
                }}

                // Pagination: only show current page
                const totalPages = Math.ceil(filteredData.length / pageSize);
                const startIndex = (currentPage - 1) * pageSize;
                const endIndex = Math.min(startIndex + pageSize, filteredData.length);
                const pageData = filteredData.slice(startIndex, endIndex);

                pageData.forEach(row => {{
                    const tr = tbody.append('tr')
                        .style('opacity', 0)
                        .transition()
                        .duration(300)
                        .style('opacity', 1);

                    columns.forEach(col => {{
                        const td = tr.append('td');
                        const value = row[col] || '';

                        if (col === systemCol && row._system_id) {{
                            // Direct URL to system detail page
                            const systemUrl = baseUrl + '/systems/' + row._system_id + '/';
                            td.append('a')
                                .attr('href', systemUrl)
                                .attr('class', 'd3-link')
                                .attr('target', '_blank')
                                .text(value);
                        }} else if (col === orgCol && row._org_id) {{
                            // Direct URL to organization dashboard
                            const orgUrl = baseUrl + '/dashboard/?org_id=' + row._org_id;
                            td.append('a')
                                .attr('href', orgUrl)
                                .attr('class', 'd3-link')
                                .attr('target', '_blank')
                                .text(value);
                        }} else {{
                            td.text(value);
                        }}
                    }});
                }});

                // Update footer info
                d3.select('#{viz_id}-count').text(filteredData.length + ' kết quả');
                d3.select('#{viz_id}-footer').text(
                    `Hiển thị ${{startIndex + 1}}-${{endIndex}} / ${{filteredData.length}} kết quả`
                );

                renderPagination();
            }}

            function renderPagination() {{
                const totalPages = Math.ceil(filteredData.length / pageSize);
                const pagination = d3.select('#{viz_id}-pagination');
                pagination.selectAll('*').remove();

                if (totalPages <= 1) return;  // No pagination needed

                // Previous button
                pagination.append('button')
                    .attr('class', 'd3-page-btn')
                    .attr('disabled', currentPage === 1 ? true : null)
                    .text('« Trước')
                    .on('click', () => goToPage(currentPage - 1));

                // Page numbers (show max 5 pages)
                let startPage = Math.max(1, currentPage - 2);
                let endPage = Math.min(totalPages, startPage + 4);
                if (endPage - startPage < 4) {{
                    startPage = Math.max(1, endPage - 4);
                }}

                if (startPage > 1) {{
                    pagination.append('button')
                        .attr('class', 'd3-page-btn')
                        .text('1')
                        .on('click', () => goToPage(1));
                    if (startPage > 2) {{
                        pagination.append('span').text('...');
                    }}
                }}

                for (let i = startPage; i <= endPage; i++) {{
                    pagination.append('button')
                        .attr('class', 'd3-page-btn' + (i === currentPage ? ' active' : ''))
                        .text(i)
                        .on('click', () => goToPage(i));
                }}

                if (endPage < totalPages) {{
                    if (endPage < totalPages - 1) {{
                        pagination.append('span').text('...');
                    }}
                    pagination.append('button')
                        .attr('class', 'd3-page-btn')
                        .text(totalPages)
                        .on('click', () => goToPage(totalPages));
                }}

                // Next button
                pagination.append('button')
                    .attr('class', 'd3-page-btn')
                    .attr('disabled', currentPage === totalPages ? true : null)
                    .text('Sau »')
                    .on('click', () => goToPage(currentPage + 1));
            }}

            function goToPage(page) {{
                const totalPages = Math.ceil(filteredData.length / pageSize);
                if (page < 1 || page > totalPages) return;
                currentPage = page;
                render();
            }}

            function sortBy(colIndex) {{
                if (sortColumn === colIndex) {{
                    sortAscending = !sortAscending;
                }} else {{
                    sortColumn = colIndex;
                    sortAscending = true;
                }}

                const col = columns[colIndex];
                filteredData.sort((a, b) => {{
                    let aVal = a[col] || '';
                    let bVal = b[col] || '';

                    // Try numeric comparison
                    const aNum = parseFloat(aVal);
                    const bNum = parseFloat(bVal);
                    if (!isNaN(aNum) && !isNaN(bNum)) {{
                        return sortAscending ? aNum - bNum : bNum - aNum;
                    }}

                    // String comparison
                    const result = String(aVal).localeCompare(String(bVal), 'vi');
                    return sortAscending ? result : -result;
                }});

                currentPage = 1;  // Reset to first page after sorting
                render();
            }}

            function search(query) {{
                const lowerQuery = query.toLowerCase();
                if (!lowerQuery) {{
                    filteredData = data;
                }} else {{
                    filteredData = data.filter(row => {{
                        return columns.some(col => {{
                            const value = String(row[col] || '').toLowerCase();
                            return value.includes(lowerQuery);
                        }});
                    }});
                }}
                currentPage = 1;  // Reset to first page after search
                render();
            }}

            d3.select('#{viz_id}-search').on('input', function() {{
                search(this.value);
            }});

            // Initial render
            render();
        }})();
        </script>
    </div>
    '''

    return html_output


def _generate_d3_bar_chart(rows, columns, query_text):
    """Generate impressive D3.js bar chart with animations"""
    import html
    import json

    # Find label and value columns
    label_col = columns[0]
    value_col = None

    for col in columns:
        if col != label_col:
            try:
                if isinstance(rows[0].get(col), (int, float)):
                    value_col = col
                    break
            except:
                pass

    if not value_col:
        return _generate_d3_table(rows, columns, query_text)

    # Prepare data
    chart_data = []
    for row in rows[:20]:
        label = str(row.get(label_col, ''))
        value = float(row.get(value_col, 0))
        chart_data.append({'label': label, 'value': value})

    viz_id = f"d3bar_{abs(hash(query_text)) % 100000}"
    value_label_vie = _vietnamize_column_name(value_col)

    html_output = f'''
    <div id="{viz_id}" class="d3-viz-container" style="margin: 16px 0;">
        <style>
            #{viz_id} .chart-wrapper {{
                background: white;
                border-radius: 12px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.08);
                padding: 24px;
            }}
            #{viz_id} .chart-title {{
                font-size: 16px;
                font-weight: 600;
                color: #262626;
                margin-bottom: 20px;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            }}
            #{viz_id} .bar {{
                transition: all 0.3s ease;
            }}
            #{viz_id} .bar:hover {{
                opacity: 0.8;
            }}
            #{viz_id} .tooltip {{
                position: absolute;
                background: rgba(0, 0, 0, 0.85);
                color: white;
                padding: 8px 12px;
                border-radius: 6px;
                font-size: 13px;
                pointer-events: none;
                opacity: 0;
                transition: opacity 0.2s;
                box-shadow: 0 2px 8px rgba(0,0,0,0.2);
            }}
        </style>

        <div class="chart-wrapper">
            <div class="chart-title">📊 {html.escape(query_text[:60])}</div>
            <svg id="{viz_id}-svg"></svg>
            <div id="{viz_id}-tooltip" class="tooltip"></div>
        </div>

        <script src="https://d3js.org/d3.v7.min.js"></script>
        <script>
        (function() {{
            const data = {json.dumps(chart_data, ensure_ascii=False)};
            const valueLabel = {json.dumps(value_label_vie, ensure_ascii=False)};

            const margin = {{top: 20, right: 30, bottom: 80, left: 60}};
            const width = 800 - margin.left - margin.right;
            const height = 400 - margin.top - margin.bottom;

            const svg = d3.select('#{viz_id}-svg')
                .attr('width', width + margin.left + margin.right)
                .attr('height', height + margin.top + margin.bottom)
                .append('g')
                .attr('transform', `translate(${{margin.left}},${{margin.top}})`);

            const x = d3.scaleBand()
                .domain(data.map(d => d.label))
                .range([0, width])
                .padding(0.3);

            const y = d3.scaleLinear()
                .domain([0, d3.max(data, d => d.value) * 1.1])
                .nice()
                .range([height, 0]);

            // X axis
            svg.append('g')
                .attr('transform', `translate(0,${{height}})`)
                .call(d3.axisBottom(x))
                .selectAll('text')
                .attr('transform', 'rotate(-45)')
                .style('text-anchor', 'end')
                .style('font-size', '12px');

            // Y axis
            svg.append('g')
                .call(d3.axisLeft(y))
                .style('font-size', '12px');

            // Y axis label
            svg.append('text')
                .attr('transform', 'rotate(-90)')
                .attr('y', -50)
                .attr('x', -height / 2)
                .attr('text-anchor', 'middle')
                .style('font-size', '13px')
                .style('font-weight', '600')
                .text(valueLabel);

            const tooltip = d3.select('#{viz_id}-tooltip');

            // Bars with animation
            svg.selectAll('.bar')
                .data(data)
                .enter()
                .append('rect')
                .attr('class', 'bar')
                .attr('x', d => x(d.label))
                .attr('y', height)
                .attr('width', x.bandwidth())
                .attr('height', 0)
                .attr('fill', (d, i) => d3.interpolateBlues(0.4 + (i / data.length) * 0.5))
                .attr('rx', 4)
                .on('mouseover', function(event, d) {{
                    d3.select(this)
                        .transition()
                        .duration(200)
                        .attr('fill', '#0958d9');

                    tooltip
                        .style('opacity', 1)
                        .html(`<strong>${{d.label}}</strong><br/>${{valueLabel}}: ${{d.value.toLocaleString('vi-VN')}}`)
                        .style('left', (event.pageX + 10) + 'px')
                        .style('top', (event.pageY - 28) + 'px');
                }})
                .on('mouseout', function(event, d) {{
                    const i = data.indexOf(d);
                    d3.select(this)
                        .transition()
                        .duration(200)
                        .attr('fill', d3.interpolateBlues(0.4 + (i / data.length) * 0.5));

                    tooltip.style('opacity', 0);
                }})
                .transition()
                .duration(800)
                .delay((d, i) => i * 50)
                .attr('y', d => y(d.value))
                .attr('height', d => height - y(d.value));

            // Value labels on top of bars
            svg.selectAll('.label')
                .data(data)
                .enter()
                .append('text')
                .attr('class', 'label')
                .attr('x', d => x(d.label) + x.bandwidth() / 2)
                .attr('y', height)
                .attr('text-anchor', 'middle')
                .style('font-size', '11px')
                .style('font-weight', '600')
                .style('fill', '#595959')
                .text(d => d.value.toLocaleString('vi-VN'))
                .transition()
                .duration(800)
                .delay((d, i) => i * 50)
                .attr('y', d => y(d.value) - 5);
        }})();
        </script>
    </div>
    '''

    return html_output


def _generate_d3_pie_chart(rows, columns, query_text):
    """Generate impressive D3.js pie chart with animations"""
    import html
    import json

    label_col = columns[0]
    value_col = columns[1] if len(columns) > 1 else None

    if not value_col:
        return _generate_d3_table(rows, columns, query_text)

    # Prepare data
    chart_data = []
    for row in rows[:10]:
        label = str(row.get(label_col, ''))
        value = float(row.get(value_col, 0))
        if value > 0:
            chart_data.append({'label': label, 'value': value})

    if not chart_data:
        return _generate_d3_table(rows, columns, query_text)

    viz_id = f"d3pie_{abs(hash(query_text)) % 100000}"
    value_label_vie = _vietnamize_column_name(value_col)

    html_output = f'''
    <div id="{viz_id}" class="d3-viz-container" style="margin: 16px 0;">
        <style>
            #{viz_id} .chart-wrapper {{
                background: white;
                border-radius: 12px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.08);
                padding: 24px;
            }}
            #{viz_id} .chart-title {{
                font-size: 16px;
                font-weight: 600;
                color: #262626;
                margin-bottom: 20px;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                text-align: center;
            }}
            #{viz_id} .arc {{
                transition: all 0.3s ease;
                cursor: pointer;
            }}
            #{viz_id} .tooltip {{
                position: absolute;
                background: rgba(0, 0, 0, 0.85);
                color: white;
                padding: 8px 12px;
                border-radius: 6px;
                font-size: 13px;
                pointer-events: none;
                opacity: 0;
                transition: opacity 0.2s;
            }}
            #{viz_id} .legend {{
                font-size: 12px;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            }}
        </style>

        <div class="chart-wrapper">
            <div class="chart-title">🥧 {html.escape(query_text[:60])}</div>
            <div style="display: flex; justify-content: center; align-items: center;">
                <svg id="{viz_id}-svg"></svg>
            </div>
            <div id="{viz_id}-tooltip" class="tooltip"></div>
        </div>

        <script src="https://d3js.org/d3.v7.min.js"></script>
        <script>
        (function() {{
            const data = {json.dumps(chart_data, ensure_ascii=False)};
            const valueLabel = {json.dumps(value_label_vie, ensure_ascii=False)};

            const width = 500;
            const height = 400;
            const radius = Math.min(width, height) / 2 - 40;

            const svg = d3.select('#{viz_id}-svg')
                .attr('width', width)
                .attr('height', height)
                .append('g')
                .attr('transform', `translate(${{width / 2}},${{height / 2}})`);

            const color = d3.scaleOrdinal()
                .domain(data.map(d => d.label))
                .range(d3.schemeSet2);

            const pie = d3.pie()
                .value(d => d.value)
                .sort(null);

            const arc = d3.arc()
                .innerRadius(radius * 0.5)
                .outerRadius(radius);

            const arcHover = d3.arc()
                .innerRadius(radius * 0.5)
                .outerRadius(radius * 1.08);

            const tooltip = d3.select('#{viz_id}-tooltip');

            const arcs = svg.selectAll('.arc')
                .data(pie(data))
                .enter()
                .append('g')
                .attr('class', 'arc');

            arcs.append('path')
                .attr('d', arc)
                .attr('fill', d => color(d.data.label))
                .attr('stroke', 'white')
                .attr('stroke-width', 2)
                .style('opacity', 0)
                .on('mouseover', function(event, d) {{
                    d3.select(this)
                        .transition()
                        .duration(200)
                        .attr('d', arcHover);

                    const percent = ((d.data.value / d3.sum(data, d => d.value)) * 100).toFixed(1);
                    tooltip
                        .style('opacity', 1)
                        .html(`<strong>${{d.data.label}}</strong><br/>${{valueLabel}}: ${{d.data.value.toLocaleString('vi-VN')}}<br/>Tỷ lệ: ${{percent}}%`)
                        .style('left', (event.pageX + 10) + 'px')
                        .style('top', (event.pageY - 28) + 'px');
                }})
                .on('mouseout', function() {{
                    d3.select(this)
                        .transition()
                        .duration(200)
                        .attr('d', arc);

                    tooltip.style('opacity', 0);
                }})
                .transition()
                .duration(800)
                .delay((d, i) => i * 100)
                .style('opacity', 1)
                .attrTween('d', function(d) {{
                    const i = d3.interpolate({{startAngle: 0, endAngle: 0}}, d);
                    return t => arc(i(t));
                }});

            // Labels
            arcs.append('text')
                .attr('transform', d => `translate(${{arc.centroid(d)}})`)
                .attr('text-anchor', 'middle')
                .style('font-size', '12px')
                .style('font-weight', '600')
                .style('fill', 'white')
                .style('opacity', 0)
                .text(d => {{
                    const percent = ((d.data.value / d3.sum(data, d => d.value)) * 100);
                    return percent > 5 ? percent.toFixed(0) + '%' : '';
                }})
                .transition()
                .duration(800)
                .delay((d, i) => i * 100 + 400)
                .style('opacity', 1);
        }})();
        </script>
    </div>
    '''

    return html_output


def _generate_d3_line_chart(rows, columns, query_text):
    """Generate impressive D3.js line chart for time series"""
    import html
    import json

    # Find date and value columns
    date_col = None
    value_col = None

    for col in columns:
        col_lower = str(col).lower()
        if 'date' in col_lower or 'time' in col_lower or 'năm' in col_lower or 'tháng' in col_lower:
            date_col = col
        elif isinstance(rows[0].get(col), (int, float)):
            value_col = col

    if not date_col or not value_col:
        return _generate_d3_table(rows, columns, query_text)

    # Prepare data
    chart_data = []
    for row in rows:
        label = str(row.get(date_col, ''))
        value = float(row.get(value_col, 0))
        chart_data.append({'date': label, 'value': value})

    viz_id = f"d3line_{abs(hash(query_text)) % 100000}"
    value_label_vie = _vietnamize_column_name(value_col)
    date_label_vie = _vietnamize_column_name(date_col)

    html_output = f'''
    <div id="{viz_id}" class="d3-viz-container" style="margin: 16px 0;">
        <style>
            #{viz_id} .chart-wrapper {{
                background: white;
                border-radius: 12px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.08);
                padding: 24px;
            }}
            #{viz_id} .chart-title {{
                font-size: 16px;
                font-weight: 600;
                color: #262626;
                margin-bottom: 20px;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            }}
            #{viz_id} .line {{
                fill: none;
                stroke: #1677ff;
                stroke-width: 3;
            }}
            #{viz_id} .area {{
                fill: url(#gradient);
                opacity: 0.3;
            }}
            #{viz_id} .dot {{
                fill: #1677ff;
                stroke: white;
                stroke-width: 2;
                cursor: pointer;
                transition: all 0.2s;
            }}
            #{viz_id} .dot:hover {{
                r: 8;
                fill: #0958d9;
            }}
            #{viz_id} .tooltip {{
                position: absolute;
                background: rgba(0, 0, 0, 0.85);
                color: white;
                padding: 8px 12px;
                border-radius: 6px;
                font-size: 13px;
                pointer-events: none;
                opacity: 0;
                transition: opacity 0.2s;
            }}
        </style>

        <div class="chart-wrapper">
            <div class="chart-title">📈 {html.escape(query_text[:60])}</div>
            <svg id="{viz_id}-svg"></svg>
            <div id="{viz_id}-tooltip" class="tooltip"></div>
        </div>

        <script src="https://d3js.org/d3.v7.min.js"></script>
        <script>
        (function() {{
            const data = {json.dumps(chart_data, ensure_ascii=False)};
            const valueLabel = {json.dumps(value_label_vie, ensure_ascii=False)};
            const dateLabel = {json.dumps(date_label_vie, ensure_ascii=False)};

            const margin = {{top: 20, right: 30, bottom: 60, left: 70}};
            const width = 800 - margin.left - margin.right;
            const height = 400 - margin.top - margin.bottom;

            const svg = d3.select('#{viz_id}-svg')
                .attr('width', width + margin.left + margin.right)
                .attr('height', height + margin.top + margin.bottom)
                .append('g')
                .attr('transform', `translate(${{margin.left}},${{margin.top}})`);

            // Gradient
            const gradient = svg.append('defs')
                .append('linearGradient')
                .attr('id', 'gradient')
                .attr('x1', '0%')
                .attr('y1', '0%')
                .attr('x2', '0%')
                .attr('y2', '100%');

            gradient.append('stop')
                .attr('offset', '0%')
                .attr('style', 'stop-color:#1677ff;stop-opacity:0.5');

            gradient.append('stop')
                .attr('offset', '100%')
                .attr('style', 'stop-color:#1677ff;stop-opacity:0');

            const x = d3.scaleBand()
                .domain(data.map(d => d.date))
                .range([0, width])
                .padding(0.1);

            const y = d3.scaleLinear()
                .domain([0, d3.max(data, d => d.value) * 1.1])
                .nice()
                .range([height, 0]);

            // X axis
            svg.append('g')
                .attr('transform', `translate(0,${{height}})`)
                .call(d3.axisBottom(x))
                .selectAll('text')
                .attr('transform', 'rotate(-45)')
                .style('text-anchor', 'end')
                .style('font-size', '12px');

            // X axis label
            svg.append('text')
                .attr('x', width / 2)
                .attr('y', height + 50)
                .attr('text-anchor', 'middle')
                .style('font-size', '13px')
                .style('font-weight', '600')
                .text(dateLabel);

            // Y axis
            svg.append('g')
                .call(d3.axisLeft(y))
                .style('font-size', '12px');

            // Y axis label
            svg.append('text')
                .attr('transform', 'rotate(-90)')
                .attr('y', -55)
                .attr('x', -height / 2)
                .attr('text-anchor', 'middle')
                .style('font-size', '13px')
                .style('font-weight', '600')
                .text(valueLabel);

            const line = d3.line()
                .x(d => x(d.date) + x.bandwidth() / 2)
                .y(d => y(d.value))
                .curve(d3.curveMonotoneX);

            const area = d3.area()
                .x(d => x(d.date) + x.bandwidth() / 2)
                .y0(height)
                .y1(d => y(d.value))
                .curve(d3.curveMonotoneX);

            // Area with animation
            const areaPath = svg.append('path')
                .datum(data)
                .attr('class', 'area')
                .attr('d', area);

            const areaLength = areaPath.node().getTotalLength();
            areaPath
                .attr('stroke-dasharray', areaLength + ' ' + areaLength)
                .attr('stroke-dashoffset', areaLength)
                .transition()
                .duration(1500)
                .attr('stroke-dashoffset', 0);

            // Line with animation
            const path = svg.append('path')
                .datum(data)
                .attr('class', 'line')
                .attr('d', line);

            const pathLength = path.node().getTotalLength();
            path
                .attr('stroke-dasharray', pathLength + ' ' + pathLength)
                .attr('stroke-dashoffset', pathLength)
                .transition()
                .duration(1500)
                .attr('stroke-dashoffset', 0);

            const tooltip = d3.select('#{viz_id}-tooltip');

            // Dots with animation
            svg.selectAll('.dot')
                .data(data)
                .enter()
                .append('circle')
                .attr('class', 'dot')
                .attr('cx', d => x(d.date) + x.bandwidth() / 2)
                .attr('cy', d => y(d.value))
                .attr('r', 0)
                .on('mouseover', function(event, d) {{
                    tooltip
                        .style('opacity', 1)
                        .html(`<strong>${{d.date}}</strong><br/>${{valueLabel}}: ${{d.value.toLocaleString('vi-VN')}}`)
                        .style('left', (event.pageX + 10) + 'px')
                        .style('top', (event.pageY - 28) + 'px');
                }})
                .on('mouseout', function() {{
                    tooltip.style('opacity', 0);
                }})
                .transition()
                .duration(500)
                .delay((d, i) => i * 50 + 1000)
                .attr('r', 5);
        }})();
        </script>
    </div>
    '''

    return html_output


def estimate_llm_cost(model_name: str, input_tokens: int, output_tokens: int) -> float:
    """
    Estimate cost for an LLM request in USD.

    Args:
        model_name: Name of the model
        input_tokens: Number of input tokens
        output_tokens: Number of output tokens

    Returns:
        Estimated cost in USD
    """
    pricing = AI_MODEL_PRICING.get(model_name, {'input': 1.0, 'output': 1.0})
    input_cost = (input_tokens / 1_000_000) * pricing['input']
    output_cost = (output_tokens / 1_000_000) * pricing['output']
    return input_cost + output_cost
from .serializers import (
    SystemListSerializer,
    SystemDetailSerializer,
    SystemCreateUpdateSerializer,
    AttachmentSerializer,
    AIConversationSerializer,
    AIConversationListSerializer,
    AIConversationCreateSerializer,
    AIMessageSerializer,
)
from .utils import calculate_system_completion_percentage


class EventStreamRenderer(BaseRenderer):
    """Custom renderer for Server-Sent Events (SSE)."""
    media_type = 'text/event-stream'
    format = 'txt'

    def render(self, data, accepted_media_type=None, renderer_context=None):
        if isinstance(data, bytes):
            return data
        return str(data).encode('utf-8')


class SystemViewSet(viewsets.ModelViewSet):
    """
    ViewSet for System CRUD operations

    Endpoints:
    - GET /api/systems/ - List all systems
    - POST /api/systems/ - Create new system
    - GET /api/systems/{id}/ - Retrieve system detail
    - PUT /api/systems/{id}/ - Update system
    - PATCH /api/systems/{id}/ - Partial update
    - DELETE /api/systems/{id}/ - Delete system
    - POST /api/systems/{id}/save_draft/ - Save as draft
    - POST /api/systems/{id}/submit/ - Submit for review
    """

    queryset = System.objects.select_related('org').prefetch_related(
        'architecture',
        'data_info',
        'operations',
        'integration',
        'assessment',
        'cost',
        'vendor',
        'infrastructure',
        'security',
        'attachments',
    ).all()
    permission_classes = [IsOrgUserOrAdmin]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    # P0.8: Added new filterset fields for technology stack
    filterset_fields = [
        'org', 'status', 'criticality_level', 'form_level', 'system_group',
        'programming_language', 'framework', 'database_name', 'hosting_platform'
    ]
    # Search by system code, system name, and organization name
    search_fields = [
        'system_code', 'system_name', 'org__name'
    ]
    ordering_fields = ['created_at', 'updated_at', 'system_code', 'system_name', 'go_live_date']
    ordering = ['-created_at']

    def get_serializer_class(self):
        """Return appropriate serializer based on action"""
        if self.action == 'list':
            return SystemListSerializer
        elif self.action in ['create', 'update', 'partial_update']:
            return SystemCreateUpdateSerializer
        return SystemDetailSerializer

    def get_queryset(self):
        """Filter queryset based on user role"""
        queryset = super().get_queryset()
        user = self.request.user

        # Exclude soft-deleted systems
        queryset = queryset.filter(is_deleted=False)

        # Admin can see all systems
        if user.role == 'admin':
            return queryset

        # Lanhdaobo can see all systems (read-only for strategic dashboard)
        if user.role == 'leader':
            return queryset

        # Org user can only see systems from their organization
        if user.role == 'org_user' and user.organization:
            return queryset.filter(org=user.organization)

        # If user has no organization assigned, return empty queryset
        return queryset.none()

    def perform_create(self, serializer):
        """
        Auto-set org field from logged-in user's organization
        - Org users: auto-set from their organization
        - Admin users: allow explicit org in request (can create for any org)
        """
        user = self.request.user

        # Org users: use their organization
        if user.role == 'org_user':
            if not user.organization:
                from rest_framework.exceptions import ValidationError
                raise ValidationError({'error': 'User must be assigned to an organization'})
            serializer.save(org=user.organization)
        # Admin users: require explicit org in request
        elif user.role == 'admin':
            serializer.save()
        else:
            from rest_framework.exceptions import ValidationError
            raise ValidationError({'error': 'Invalid user role'})

    @action(detail=True, methods=['post'])
    def save_draft(self, request, pk=None):
        """Save system as draft"""
        system = self.get_object()
        system.status = 'draft'
        system.save()
        serializer = self.get_serializer(system)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def submit(self, request, pk=None):
        """Submit system for review"""
        system = self.get_object()
        system.status = 'active'
        system.save()
        serializer = self.get_serializer(system)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def statistics(self, request):
        """Get system statistics with average completion percentage"""
        queryset = self.get_queryset()

        # Calculate average completion percentage
        systems = list(queryset)
        if systems:
            total_completion = sum(
                calculate_system_completion_percentage(system)
                for system in systems
            )
            avg_completion = round(total_completion / len(systems), 1)
        else:
            avg_completion = 0.0

        stats = {
            'total': queryset.count(),
            'average_completion_percentage': avg_completion,
            'by_status': {
                'operating': queryset.filter(status='operating').count(),
                'pilot': queryset.filter(status='pilot').count(),
                'stopped': queryset.filter(status='stopped').count(),
                'replacing': queryset.filter(status='replacing').count(),
            },
            'by_criticality': {
                # P0.8: Removed 'critical' option per customer request
                'high': queryset.filter(criticality_level='high').count(),
                'medium': queryset.filter(criticality_level='medium').count(),
                'low': queryset.filter(criticality_level='low').count(),
            },
            'by_form_level': {
                'level_1': queryset.filter(form_level=1).count(),
                'level_2': queryset.filter(form_level=2).count(),
            },
        }

        return Response(stats)

    @action(detail=False, methods=['get'])
    def strategic_stats(self, request):
        """
        Strategic Dashboard - Overview Statistics
        Returns comprehensive stats for strategic dashboard overview tab.
        Only accessible by lanhdaobo role.
        """
        user = request.user
        # Only allow leader role and admin role
        if user.role not in ['leader', 'admin']:
            return Response(
                {'error': 'Chỉ Lãnh đạo Bộ mới có quyền xem Dashboard chiến lược'},
                status=status.HTTP_403_FORBIDDEN
            )

        # Get all active systems
        queryset = System.objects.filter(is_deleted=False)
        total_systems = queryset.count()

        # Organization count
        from apps.organizations.models import Organization
        total_orgs = Organization.objects.count()

        # Status distribution
        status_distribution = {
            'operating': queryset.filter(status='operating').count(),
            'pilot': queryset.filter(status='pilot').count(),
            'testing': queryset.filter(status='testing').count(),
            'stopped': queryset.filter(status='stopped').count(),
            'replacing': queryset.filter(status='replacing').count(),
        }

        # Criticality distribution
        criticality_distribution = {
            'high': queryset.filter(criticality_level='high').count(),
            'medium': queryset.filter(criticality_level='medium').count(),
            'low': queryset.filter(criticality_level='low').count(),
        }

        # Scope distribution
        scope_distribution = {
            'internal_unit': queryset.filter(scope='internal_unit').count(),
            'org_wide': queryset.filter(scope='org_wide').count(),
            'external': queryset.filter(scope='external').count(),
        }

        # Systems per organization (top 10)
        systems_per_org = list(
            queryset.values('org__name')
            .annotate(count=Count('id'))
            .order_by('-count')[:10]
        )

        # Recommendation distribution (from assessment)
        recommendation_distribution = {
            'keep': 0,
            'upgrade': 0,
            'replace': 0,
            'merge': 0,
            'unknown': 0,
        }
        for system in queryset.select_related('assessment'):
            try:
                if hasattr(system, 'assessment') and system.assessment:
                    rec = system.assessment.recommendation
                    if rec in recommendation_distribution:
                        recommendation_distribution[rec] += 1
                    else:
                        recommendation_distribution['unknown'] += 1
                else:
                    recommendation_distribution['unknown'] += 1
            except Exception:
                recommendation_distribution['unknown'] += 1

        # Integration stats
        total_api_provided = queryset.aggregate(
            total=Coalesce(Sum('api_provided_count'), 0)
        )['total']
        total_api_consumed = queryset.aggregate(
            total=Coalesce(Sum('api_consumed_count'), 0)
        )['total']

        systems_with_integration = queryset.filter(
            Q(api_provided_count__gt=0) | Q(api_consumed_count__gt=0)
        ).count()
        systems_without_integration = total_systems - systems_with_integration

        # Calculate health score
        health_score = 100
        health_score -= status_distribution.get('stopped', 0) * 5
        health_score -= recommendation_distribution.get('replace', 0) * 3
        health_score -= recommendation_distribution.get('unknown', 0) * 0.5
        if total_systems > 0:
            integration_rate = systems_with_integration / total_systems
            health_score += integration_rate * 10
        health_score = max(0, min(100, round(health_score)))

        # Alerts
        alerts = {
            'critical': recommendation_distribution.get('replace', 0),
            'warning': status_distribution.get('stopped', 0),
            'info': recommendation_distribution.get('unknown', 0),
        }

        return Response({
            'overview': {
                'total_systems': total_systems,
                'total_organizations': total_orgs,
                'health_score': health_score,
                'alerts': alerts,
            },
            'status_distribution': status_distribution,
            'criticality_distribution': criticality_distribution,
            'scope_distribution': scope_distribution,
            'systems_per_org': systems_per_org,
            'recommendation_distribution': recommendation_distribution,
            'integration': {
                'total_api_provided': total_api_provided,
                'total_api_consumed': total_api_consumed,
                'with_integration': systems_with_integration,
                'without_integration': systems_without_integration,
            },
        })

    @action(detail=False, methods=['get'])
    def investment_stats(self, request):
        """
        Strategic Dashboard - Investment Analytics
        Returns cost/investment data per organization.
        Only accessible by lanhdaobo role.
        """
        user = request.user
        if user.role not in ['leader', 'admin']:
            return Response(
                {'error': 'Chỉ Lãnh đạo Bộ mới có quyền xem Dashboard chiến lược'},
                status=status.HTTP_403_FORBIDDEN
            )

        from apps.organizations.models import Organization

        queryset = System.objects.filter(is_deleted=False)

        # Total investment across all systems
        total_investment = 0
        cost_breakdown = {
            'development': 0,
            'license': 0,
            'maintenance': 0,
            'infrastructure': 0,
            'personnel': 0,
        }

        for system in queryset.select_related('cost'):
            try:
                if hasattr(system, 'cost') and system.cost:
                    cost = system.cost
                    if cost.initial_investment:
                        total_investment += float(cost.initial_investment)
                    if cost.development_cost:
                        cost_breakdown['development'] += float(cost.development_cost)
                    if cost.annual_license_cost:
                        cost_breakdown['license'] += float(cost.annual_license_cost)
                    if cost.annual_maintenance_cost:
                        cost_breakdown['maintenance'] += float(cost.annual_maintenance_cost)
                    if cost.annual_infrastructure_cost:
                        cost_breakdown['infrastructure'] += float(cost.annual_infrastructure_cost)
                    if cost.annual_personnel_cost:
                        cost_breakdown['personnel'] += float(cost.annual_personnel_cost)
            except Exception:
                pass

        # Investment by organization
        by_organization = []
        for org in Organization.objects.all():
            org_systems = queryset.filter(org=org)
            system_count = org_systems.count()
            org_total_cost = 0

            for sys in org_systems.select_related('cost'):
                try:
                    if hasattr(sys, 'cost') and sys.cost and sys.cost.initial_investment:
                        org_total_cost += float(sys.cost.initial_investment)
                except Exception:
                    pass

            if system_count > 0:
                by_organization.append({
                    'org_id': org.id,
                    'org_name': org.name,
                    'system_count': system_count,
                    'total_cost': org_total_cost,
                })

        by_organization.sort(key=lambda x: x['system_count'], reverse=True)

        # Cost efficiency metrics
        total_users = queryset.aggregate(total=Coalesce(Sum('users_total'), 0))['total']
        avg_cost_per_user = total_investment / total_users if total_users > 0 else 0

        return Response({
            'total_investment': total_investment,
            'by_organization': by_organization[:15],
            'cost_breakdown': cost_breakdown,
            'cost_efficiency': {
                'avg_cost_per_user': round(avg_cost_per_user, 2),
                'total_users': total_users,
            },
        })

    @action(detail=False, methods=['get'])
    def integration_stats(self, request):
        """
        Strategic Dashboard - Integration Analytics
        Returns API and integration statistics.
        Only accessible by lanhdaobo role.
        """
        user = request.user
        if user.role not in ['leader', 'admin']:
            return Response(
                {'error': 'Chỉ Lãnh đạo Bộ mới có quyền xem Dashboard chiến lược'},
                status=status.HTTP_403_FORBIDDEN
            )

        queryset = System.objects.filter(is_deleted=False)
        total_systems = queryset.count()

        # API counts
        total_api_provided = queryset.aggregate(
            total=Coalesce(Sum('api_provided_count'), 0)
        )['total']
        total_api_consumed = queryset.aggregate(
            total=Coalesce(Sum('api_consumed_count'), 0)
        )['total']

        # Systems with/without integration
        systems_with_integration = queryset.filter(
            Q(api_provided_count__gt=0) | Q(api_consumed_count__gt=0)
        ).count()
        systems_without_integration = total_systems - systems_with_integration

        # Data islands (systems with no integration)
        data_islands = list(
            queryset.filter(
                Q(api_provided_count__isnull=True) | Q(api_provided_count=0),
                Q(api_consumed_count__isnull=True) | Q(api_consumed_count=0)
            ).values_list('system_name', flat=True)[:10]
        )

        # Systems with most APIs
        top_api_providers = list(
            queryset.filter(api_provided_count__gt=0)
            .order_by('-api_provided_count')
            .values('id', 'system_name', 'api_provided_count')[:10]
        )

        top_api_consumers = list(
            queryset.filter(api_consumed_count__gt=0)
            .order_by('-api_consumed_count')
            .values('id', 'system_name', 'api_consumed_count')[:10]
        )

        return Response({
            'total_api_provided': total_api_provided,
            'total_api_consumed': total_api_consumed,
            'systems_with_integration': systems_with_integration,
            'systems_without_integration': systems_without_integration,
            'integration_rate': round((systems_with_integration / total_systems * 100), 1) if total_systems > 0 else 0,
            'data_islands': data_islands,
            'top_api_providers': top_api_providers,
            'top_api_consumers': top_api_consumers,
        })

    @action(detail=False, methods=['get'])
    def optimization_stats(self, request):
        """
        Strategic Dashboard - Optimization Analytics
        Returns recommendations and legacy system analysis.
        Only accessible by lanhdaobo role.
        """
        user = request.user
        if user.role not in ['leader', 'admin']:
            return Response(
                {'error': 'Chỉ Lãnh đạo Bộ mới có quyền xem Dashboard chiến lược'},
                status=status.HTTP_403_FORBIDDEN
            )

        from datetime import datetime, timedelta

        queryset = System.objects.filter(is_deleted=False)

        # Recommendation distribution
        recommendations = {
            'keep': 0,
            'upgrade': 0,
            'replace': 0,
            'merge': 0,
            'unknown': 0,
        }

        legacy_systems = []
        for system in queryset.select_related('assessment'):
            try:
                if hasattr(system, 'assessment') and system.assessment:
                    rec = system.assessment.recommendation
                    if rec in recommendations:
                        recommendations[rec] += 1
                    else:
                        recommendations['unknown'] += 1

                    # Collect systems marked for replacement
                    if rec == 'replace':
                        legacy_systems.append({
                            'id': system.id,
                            'name': system.system_name,
                            'org_name': system.org.name if system.org else None,
                            'go_live_date': system.go_live_date.isoformat() if system.go_live_date else None,
                            'users': system.users_total or 0,
                        })
                else:
                    recommendations['unknown'] += 1
            except Exception:
                recommendations['unknown'] += 1

        # Systems that need attention (stopped or replacing)
        attention_needed = list(
            queryset.filter(status__in=['stopped', 'replacing'])
            .values('id', 'system_name', 'status', 'org__name')[:10]
        )

        return Response({
            'recommendations': recommendations,
            'legacy_systems': legacy_systems[:10],
            'attention_needed': attention_needed,
            'total_needing_action': recommendations['replace'] + recommendations['upgrade'],
            'assessment_coverage': round(
                ((queryset.count() - recommendations['unknown']) / queryset.count() * 100), 1
            ) if queryset.count() > 0 else 0,
        })

    @action(detail=False, methods=['get'])
    def monitoring_stats(self, request):
        """
        Strategic Dashboard - Monitoring Analytics
        Returns organization rankings and completion stats.
        Only accessible by lanhdaobo role.
        """
        user = request.user
        if user.role not in ['leader', 'admin']:
            return Response(
                {'error': 'Chỉ Lãnh đạo Bộ mới có quyền xem Dashboard chiến lược'},
                status=status.HTTP_403_FORBIDDEN
            )

        from apps.organizations.models import Organization

        queryset = System.objects.filter(is_deleted=False)

        # Organization rankings
        organization_rankings = []
        for org in Organization.objects.all():
            org_systems = list(queryset.filter(org=org))
            system_count = len(org_systems)

            if system_count > 0:
                # Calculate average completion
                total_completion = sum(
                    calculate_system_completion_percentage(sys)
                    for sys in org_systems
                )
                avg_completion = round(total_completion / system_count, 1)

                # Calculate average performance (if available)
                performance_scores = []
                for sys in org_systems:
                    try:
                        if hasattr(sys, 'assessment') and sys.assessment and sys.assessment.performance_rating:
                            performance_scores.append(sys.assessment.performance_rating)
                    except Exception:
                        pass

                avg_performance = round(sum(performance_scores) / len(performance_scores), 1) if performance_scores else None

                organization_rankings.append({
                    'org_id': org.id,
                    'org_name': org.name,
                    'system_count': system_count,
                    'avg_completion': avg_completion,
                    'avg_performance': avg_performance,
                })

        # Sort by system count
        organization_rankings.sort(key=lambda x: x['system_count'], reverse=True)

        # Overall stats
        all_systems = list(queryset)
        total_completion = sum(
            calculate_system_completion_percentage(sys)
            for sys in all_systems
        )
        avg_completion_all = round(total_completion / len(all_systems), 1) if all_systems else 0

        return Response({
            'organization_rankings': organization_rankings,
            'summary': {
                'total_organizations': len(organization_rankings),
                'avg_completion_all': avg_completion_all,
                'orgs_with_100_percent': sum(1 for o in organization_rankings if o['avg_completion'] == 100),
                'orgs_below_50_percent': sum(1 for o in organization_rankings if o['avg_completion'] < 50),
            },
        })

    @action(detail=False, methods=['get'])
    def drilldown(self, request):
        """
        Strategic Dashboard - Drill-down endpoint
        Returns list of systems matching specific criteria.
        Query params:
        - filter_type: status, criticality, scope, recommendation, org, integration
        - filter_value: the specific value to filter by
        """
        user = request.user
        if user.role not in ['leader', 'admin']:
            return Response(
                {'error': 'Chỉ Lãnh đạo Bộ mới có quyền xem Dashboard chiến lược'},
                status=status.HTTP_403_FORBIDDEN
            )

        filter_type = request.query_params.get('filter_type')
        filter_value = request.query_params.get('filter_value')

        if not filter_type or not filter_value:
            return Response(
                {'error': 'filter_type and filter_value are required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        queryset = System.objects.filter(is_deleted=False)

        if filter_type == 'status':
            queryset = queryset.filter(status=filter_value)
        elif filter_type == 'criticality':
            queryset = queryset.filter(criticality_level=filter_value)
        elif filter_type == 'scope':
            queryset = queryset.filter(scope=filter_value)
        elif filter_type == 'org':
            queryset = queryset.filter(org__name=filter_value)
        elif filter_type == 'integration':
            if filter_value == 'with':
                queryset = queryset.filter(
                    Q(api_provided_count__gt=0) | Q(api_consumed_count__gt=0)
                )
            elif filter_value == 'without':
                queryset = queryset.filter(
                    Q(api_provided_count__isnull=True) | Q(api_provided_count=0),
                    Q(api_consumed_count__isnull=True) | Q(api_consumed_count=0)
                )
        elif filter_type == 'recommendation':
            # Need to filter through assessment relation
            # Match logic with strategic_stats recommendation_distribution calculation
            valid_recommendations = ['keep', 'upgrade', 'replace', 'merge']
            system_ids = []
            for system in queryset.select_related('assessment'):
                try:
                    if hasattr(system, 'assessment') and system.assessment:
                        rec = system.assessment.recommendation
                        if filter_value == 'unknown':
                            # System has assessment but recommendation not in valid list
                            if rec not in valid_recommendations:
                                system_ids.append(system.id)
                        else:
                            # Match specific recommendation
                            if rec == filter_value:
                                system_ids.append(system.id)
                    else:
                        # System has no assessment → counts as unknown
                        if filter_value == 'unknown':
                            system_ids.append(system.id)
                except Exception:
                    # Exception accessing assessment → counts as unknown
                    if filter_value == 'unknown':
                        system_ids.append(system.id)
            queryset = queryset.filter(id__in=system_ids)

        # Return paginated results
        systems = list(
            queryset.select_related('org')
            .values(
                'id', 'system_name', 'system_code', 'status',
                'criticality_level', 'scope', 'org__name',
                'users_total', 'go_live_date'
            )[:100]
        )

        return Response({
            'count': len(systems),
            'filter_type': filter_type,
            'filter_value': filter_value,
            'systems': systems,
        })

    @action(detail=False, methods=['get'])
    def insights(self, request):
        """
        Strategic Dashboard - Rule-based Insights
        Automatically analyzes system data and surfaces important insights.
        Only accessible by lanhdaobo role.
        """
        user = request.user
        if user.role not in ['leader', 'admin']:
            return Response(
                {'error': 'Chỉ Lãnh đạo Bộ mới có quyền xem Dashboard chiến lược'},
                status=status.HTTP_403_FORBIDDEN
            )

        queryset = System.objects.filter(is_deleted=False)
        total_systems = queryset.count()

        insights = []

        # === DOCUMENTATION INSIGHTS ===
        # Systems without design docs
        no_design_docs = queryset.filter(has_design_documents=False).count()
        if no_design_docs > 0:
            pct = round(no_design_docs / total_systems * 100, 1)
            insights.append({
                'id': 'no_design_docs',
                'category': 'documentation',
                'severity': 'warning' if pct > 50 else 'info',
                'title': f'{no_design_docs} hệ thống chưa có tài liệu thiết kế',
                'description': f'{pct}% hệ thống thiếu tài liệu thiết kế, ảnh hưởng đến khả năng bảo trì và nâng cấp.',
                'recommendation': 'Ưu tiên bổ sung tài liệu cho các hệ thống mức độ quan trọng cao.',
                'metric': {'count': no_design_docs, 'percentage': pct},
                'filter': {'type': 'no_design_docs'},
            })

        # Systems without architecture diagram
        no_arch_diagram = queryset.filter(
            Q(architecture__has_architecture_diagram=False) | Q(architecture__isnull=True)
        ).count()
        if no_arch_diagram > 0:
            pct = round(no_arch_diagram / total_systems * 100, 1)
            insights.append({
                'id': 'no_arch_diagram',
                'category': 'documentation',
                'severity': 'warning' if pct > 70 else 'info',
                'title': f'{no_arch_diagram} hệ thống chưa có sơ đồ kiến trúc',
                'description': f'{pct}% hệ thống thiếu sơ đồ kiến trúc, gây khó khăn trong việc đánh giá và tích hợp.',
                'recommendation': 'Xây dựng sơ đồ kiến trúc cho các hệ thống core trước.',
                'metric': {'count': no_arch_diagram, 'percentage': pct},
                'filter': {'type': 'no_arch_diagram'},
            })

        # === DEVOPS INSIGHTS ===
        # Systems without CI/CD
        no_cicd = queryset.filter(
            Q(architecture__has_cicd=False) | Q(architecture__isnull=True)
        ).count()
        if no_cicd > 0:
            pct = round(no_cicd / total_systems * 100, 1)
            insights.append({
                'id': 'no_cicd',
                'category': 'devops',
                'severity': 'warning' if pct > 80 else 'info',
                'title': f'{no_cicd} hệ thống chưa có CI/CD',
                'description': f'{pct}% hệ thống triển khai thủ công, tăng rủi ro lỗi và thời gian release.',
                'recommendation': 'Triển khai CI/CD pipeline cho các hệ thống có tần suất release cao.',
                'metric': {'count': no_cicd, 'percentage': pct},
                'filter': {'type': 'no_cicd'},
            })

        # Systems without API Gateway
        no_api_gateway = queryset.filter(
            Q(integration__has_api_gateway=False) | Q(integration__isnull=True)
        ).count()
        if no_api_gateway > 0:
            pct = round(no_api_gateway / total_systems * 100, 1)
            insights.append({
                'id': 'no_api_gateway',
                'category': 'integration',
                'severity': 'warning' if pct > 70 else 'info',
                'title': f'{no_api_gateway} hệ thống chưa có API Gateway',
                'description': f'{pct}% hệ thống thiếu API Gateway, khó kiểm soát và bảo mật API.',
                'recommendation': 'Triển khai API Gateway tập trung theo kiến trúc tổng thể.',
                'metric': {'count': no_api_gateway, 'percentage': pct},
                'filter': {'type': 'no_api_gateway'},
            })

        # === INFRASTRUCTURE INSIGHTS ===
        # Systems still on-premise
        on_premise = queryset.filter(hosting_platform='on_premise').count()
        if on_premise > 0:
            pct = round(on_premise / total_systems * 100, 1)
            insights.append({
                'id': 'on_premise',
                'category': 'infrastructure',
                'severity': 'info',
                'title': f'{on_premise} hệ thống còn on-premise',
                'description': f'{pct}% hệ thống chạy on-premise. Theo lộ trình chuyển đổi số, cần đánh giá khả năng di chuyển lên Cloud.',
                'recommendation': 'Lập kế hoạch Cloud migration theo giai đoạn 1 (2026).',
                'metric': {'count': on_premise, 'percentage': pct},
                'filter': {'type': 'hosting_platform', 'value': 'on_premise'},
            })

        # Systems on cloud
        on_cloud = queryset.filter(hosting_platform='cloud').count()
        if on_cloud > 0:
            pct = round(on_cloud / total_systems * 100, 1)
            insights.append({
                'id': 'cloud_ready',
                'category': 'infrastructure',
                'severity': 'success',
                'title': f'{on_cloud} hệ thống đã lên Cloud',
                'description': f'{pct}% hệ thống đã triển khai trên Cloud, đáp ứng định hướng kiến trúc hiện đại.',
                'recommendation': 'Tiếp tục mở rộng và tối ưu hóa chi phí Cloud.',
                'metric': {'count': on_cloud, 'percentage': pct},
                'filter': {'type': 'hosting_platform', 'value': 'cloud'},
            })

        # === TECHNOLOGY INSIGHTS ===
        # Technology distribution
        tech_stats = list(
            queryset.exclude(Q(programming_language__isnull=True) | Q(programming_language=''))
            .values('programming_language')
            .annotate(count=Count('id'))
            .order_by('-count')[:5]
        )
        if tech_stats:
            top_tech = tech_stats[0]
            top_pct = round(top_tech['count'] / total_systems * 100, 1)
            tech_list = ', '.join(["{} ({})".format(t['programming_language'], t['count']) for t in tech_stats])
            insights.append({
                'id': 'tech_distribution',
                'category': 'technology',
                'severity': 'info',
                'title': f"Ngôn ngữ phổ biến nhất: {top_tech['programming_language']} ({top_tech['count']} hệ thống)",
                'description': f"Top 5: {tech_list}",
                'recommendation': 'Xem xét chuẩn hóa công nghệ để dễ bảo trì và tìm nhân sự.',
                'metric': {'top': tech_stats},
                'filter': {'type': 'technology'},
            })

        # Database distribution
        db_stats = list(
            queryset.exclude(Q(database_name__isnull=True) | Q(database_name=''))
            .values('database_name')
            .annotate(count=Count('id'))
            .order_by('-count')[:5]
        )
        if db_stats:
            db_list = ', '.join(["{} ({})".format(d['database_name'], d['count']) for d in db_stats])
            insights.append({
                'id': 'database_distribution',
                'category': 'technology',
                'severity': 'info',
                'title': f"Database phổ biến nhất: {db_stats[0]['database_name']} ({db_stats[0]['count']} hệ thống)",
                'description': f"Top 5: {db_list}",
                'recommendation': 'Đánh giá khả năng hợp nhất database để giảm chi phí vận hành.',
                'metric': {'top': db_stats},
                'filter': {'type': 'database'},
            })

        # === SECURITY INSIGHTS ===
        # Systems without data encryption
        no_encryption = queryset.filter(has_encryption=False).count()
        if no_encryption > 0:
            pct = round(no_encryption / total_systems * 100, 1)
            insights.append({
                'id': 'no_encryption',
                'category': 'security',
                'severity': 'critical' if pct > 50 else 'warning',
                'title': f'{no_encryption} hệ thống chưa mã hóa dữ liệu',
                'description': f'{pct}% hệ thống chưa mã hóa dữ liệu at-rest, tiềm ẩn rủi ro bảo mật.',
                'recommendation': 'Ưu tiên triển khai mã hóa cho các hệ thống xử lý dữ liệu nhạy cảm.',
                'metric': {'count': no_encryption, 'percentage': pct},
                'filter': {'type': 'no_encryption'},
            })

        # === ASSESSMENT INSIGHTS ===
        # Systems not assessed
        not_assessed = 0
        needs_upgrade = 0
        needs_replace = 0
        for system in queryset.select_related('assessment'):
            try:
                if not hasattr(system, 'assessment') or not system.assessment:
                    not_assessed += 1
                elif system.assessment.recommendation == 'upgrade':
                    needs_upgrade += 1
                elif system.assessment.recommendation == 'replace':
                    needs_replace += 1
            except Exception:
                not_assessed += 1

        if not_assessed > 0:
            pct = round(not_assessed / total_systems * 100, 1)
            insights.append({
                'id': 'not_assessed',
                'category': 'assessment',
                'severity': 'warning' if pct > 50 else 'info',
                'title': f'{not_assessed} hệ thống chưa được đánh giá',
                'description': f'{pct}% hệ thống chưa có kết quả assessment, không thể lập kế hoạch tối ưu.',
                'recommendation': 'Hoàn thiện đánh giá để có cơ sở lập lộ trình nâng cấp.',
                'metric': {'count': not_assessed, 'percentage': pct},
                'filter': {'type': 'recommendation', 'value': 'unknown'},
            })

        if needs_replace > 0:
            insights.append({
                'id': 'needs_replace',
                'category': 'assessment',
                'severity': 'critical',
                'title': f'{needs_replace} hệ thống cần thay thế',
                'description': 'Các hệ thống này được đánh giá cần thay thế do lỗi thời hoặc không đáp ứng yêu cầu.',
                'recommendation': 'Lập kế hoạch thay thế và chuyển đổi dữ liệu.',
                'metric': {'count': needs_replace},
                'filter': {'type': 'recommendation', 'value': 'replace'},
            })

        if needs_upgrade > 0:
            insights.append({
                'id': 'needs_upgrade',
                'category': 'assessment',
                'severity': 'warning',
                'title': f'{needs_upgrade} hệ thống cần nâng cấp',
                'description': 'Các hệ thống này cần nâng cấp để cải thiện hiệu năng hoặc tính năng.',
                'recommendation': 'Lập kế hoạch nâng cấp theo thứ tự ưu tiên.',
                'metric': {'count': needs_upgrade},
                'filter': {'type': 'recommendation', 'value': 'upgrade'},
            })

        # Sort insights by severity
        severity_order = {'critical': 0, 'warning': 1, 'info': 2, 'success': 3}
        insights.sort(key=lambda x: severity_order.get(x['severity'], 99))

        # Summary stats
        summary = {
            'total_insights': len(insights),
            'critical': sum(1 for i in insights if i['severity'] == 'critical'),
            'warning': sum(1 for i in insights if i['severity'] == 'warning'),
            'info': sum(1 for i in insights if i['severity'] == 'info'),
            'success': sum(1 for i in insights if i['severity'] == 'success'),
        }

        return Response({
            'insights': insights,
            'summary': summary,
            'total_systems': total_systems,
        })

    # ============================================================================
    # DEPRECATED: POST endpoint không được sử dụng - TẤT CẢ APIs đều dùng SSE
    # Frontend gọi ai_query_stream (SSE), KHÔNG BAO GIỜ gọi endpoint POST này
    # Comment out để tránh nhầm lẫn trong tương lai
    # ============================================================================
    # @action(detail=False, methods=['post'])
    def ai_query_POST_DEPRECATED_DO_NOT_USE(self, request):
        """
        [DEPRECATED - DO NOT USE]
        Strategic Dashboard - AI SQL Assistant
        Uses OpenAI to interpret natural language queries about system data.
        Only accessible by lanhdaobo role.

        Features:
        - Retry mechanism (up to 3 attempts) with error feedback to OpenAI
        - User-friendly error messages in Vietnamese when all retries fail

        Request body:
        {
            "query": "Có bao nhiêu hệ thống đang dùng Java?"
        }
        """
        logger.info("[POST_ENDPOINT] ai_query POST function called!")
        user = request.user
        if user.role not in ['leader', 'admin']:
            return Response(
                {'error': 'Chỉ Lãnh đạo Bộ mới có quyền xem Dashboard chiến lược'},
                status=status.HTTP_403_FORBIDDEN
            )

        query = request.data.get('query', '').strip()
        if not query:
            return Response(
                {'error': 'Query is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Check which AI provider to use (default: OpenAI)
        import os
        use_claude = os.environ.get('USE_CLAUDE_AI', 'false').lower() == 'true'

        if use_claude:
            # Anthropic API key
            api_key = os.environ.get('ANTHROPIC_API_KEY', getattr(settings, 'ANTHROPIC_API_KEY', None))
            if not api_key:
                return Response(
                    {'error': 'Anthropic API key not configured'},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )
        else:
            # OpenAI API key (default)
            api_key = os.environ.get('OPENAI_API_KEY', getattr(settings, 'OPENAI_API_KEY', None))
            if not api_key:
                return Response(
                    {'error': 'OpenAI API key not configured'},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )

        # Build comprehensive database schema context
        schema_context = """
=== DATABASE SCHEMA FOR IT SYSTEMS INVENTORY ===

TABLE: systems (db_table='systems')
Primary Key: id (integer, auto-increment)
Foreign Keys: org_id -> organizations.id

Columns:
- id: INTEGER PRIMARY KEY
- org_id: INTEGER FK -> organizations.id (required)
- system_code: VARCHAR(100) - Auto-generated format: SYS-ORG-YYYY-XXXX
- system_name: VARCHAR(255) - Tên hệ thống (required)
- system_name_en: VARCHAR(255) - Tên tiếng Anh
- purpose: TEXT - Mục đích hệ thống
- scope: VARCHAR(50) - Phạm vi sử dụng
    VALUES: 'internal_unit' (Nội bộ đơn vị), 'org_wide' (Toàn bộ), 'external' (Bên ngoài)
- system_group: TEXT - Nhóm hệ thống
    COMMON VALUES: 'national_platform', 'shared_platform', 'specialized_db', 'business_app', 'portal', 'bi', 'esb', 'other'
- status: VARCHAR(20) - Trạng thái
    VALUES: 'operating' (Đang vận hành), 'pilot' (Thí điểm), 'testing' (Đang thử nghiệm), 'stopped' (Dừng), 'replacing' (Sắp thay thế)
- requirement_type: VARCHAR(10000) - Nhu cầu
    VALUES: 'new_build', 'upgrade', 'integration', 'replacement', 'expansion', 'other'
- criticality_level: VARCHAR(20) - Mức độ quan trọng
    VALUES: 'high' (Quan trọng), 'medium' (Trung bình), 'low' (Thấp)
- hosting_platform: VARCHAR(50) - Nền tảng triển khai
    VALUES: 'cloud', 'on_premise', 'hybrid', 'other'
- programming_language: TEXT - Ngôn ngữ lập trình (e.g., Python, Java, JavaScript)
- framework: TEXT - Framework/Library (e.g., Django, Spring Boot, React)
- database_name: TEXT - Database (e.g., PostgreSQL, MySQL, MongoDB)
- users_total: INTEGER - Tổng số người dùng
- total_accounts: INTEGER - Tổng số tài khoản
- users_mau: INTEGER - Monthly Active Users
- users_dau: INTEGER - Daily Active Users
- annual_users: INTEGER - Số người dùng hàng năm
- num_organizations: INTEGER - Số đơn vị sử dụng
- api_provided_count: INTEGER - Số API cung cấp
- api_consumed_count: INTEGER - Số API tiêu thụ
- go_live_date: DATE - Ngày vận hành
- target_completion_date: DATE - Ngày mong muốn hoàn thành
- current_version: VARCHAR(50) - Phiên bản hiện tại
- security_level: INTEGER - Mức độ ATTT (1-5)
- has_design_documents: BOOLEAN - Có tài liệu thiết kế?
- has_encryption: BOOLEAN - Có mã hóa dữ liệu?
- has_audit_log: BOOLEAN - Có audit log?
- has_data_catalog: BOOLEAN - Có Data Catalog?
- has_mdm: BOOLEAN - Có Master Data Management?
- has_security_documents: BOOLEAN - Có tài liệu ATTT?
- form_level: INTEGER - Level biểu mẫu (1 or 2)
- is_deleted: BOOLEAN - Soft delete flag (ALWAYS filter: is_deleted = false)
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
- business_owner: TEXT
- technical_owner: TEXT
- responsible_person: TEXT
- responsible_phone: VARCHAR(20)
- responsible_email: EMAIL

---

TABLE: organizations (db_table='organizations')
Primary Key: id (integer)

Columns:
- id: INTEGER PRIMARY KEY
- name: VARCHAR(255) UNIQUE - Tên đơn vị
- code: VARCHAR(50) UNIQUE - Mã đơn vị
- description: TEXT - Mô tả
- contact_person: VARCHAR(255) - Người liên hệ
- contact_email: EMAIL
- contact_phone: VARCHAR(20)
- created_at: TIMESTAMP
- updated_at: TIMESTAMP

---

TABLE: system_architecture (db_table='system_architecture')
Primary Key: system_id (FK -> systems.id, one-to-one)

Columns:
- system_id: INTEGER PRIMARY KEY FK -> systems.id
- architecture_type: VARCHAR(50) - Loại kiến trúc
    VALUES: 'monolithic', 'modular', 'microservices', 'soa', 'serverless', 'saas', 'other'
- has_architecture_diagram: BOOLEAN - Có sơ đồ kiến trúc?
- architecture_description: TEXT
- backend_tech: TEXT - Backend technology
- frontend_tech: TEXT - Frontend technology
- mobile_app: VARCHAR(50)
    VALUES: 'native', 'hybrid', 'pwa', 'none', 'other'
- database_type: TEXT - Loại database
- database_model: VARCHAR(50)
    VALUES: 'centralized' (Tập trung), 'distributed' (Phân tán), 'per_app' (Riêng từng app), 'other'
- has_data_model_doc: BOOLEAN - Có tài liệu data model?
- hosting_type: TEXT - cloud, on-premise, hybrid
- cloud_provider: TEXT
- has_layered_architecture: BOOLEAN - Có kiến trúc 4-tier?
- containerization: TEXT - Comma-separated: docker,kubernetes,openshift
- is_multi_tenant: BOOLEAN - Hỗ trợ multi-tenant?
- api_style: VARCHAR(50)
    VALUES: 'rest', 'graphql', 'grpc', 'soap', 'other'
- messaging_queue: VARCHAR(50)
    VALUES: 'kafka', 'rabbitmq', 'activemq', 'redis_pubsub', 'none', 'other'
- cache_system: VARCHAR(10000)
    VALUES: 'redis', 'memcached', 'none', 'other'
- search_engine: VARCHAR(10000)
    VALUES: 'elasticsearch', 'solr', 'none', 'other'
- reporting_bi_tool: VARCHAR(10000)
    VALUES: 'powerbi', 'tableau', 'metabase', 'superset', 'custom', 'none', 'other'
- source_repository: VARCHAR(10000)
    VALUES: 'gitlab', 'github', 'bitbucket', 'azure_devops', 'on_premise', 'none', 'other'
- has_cicd: BOOLEAN - Có CI/CD pipeline?
- cicd_tool: VARCHAR(100)
- has_automated_testing: BOOLEAN
- automated_testing_tools: TEXT
- created_at: TIMESTAMP
- updated_at: TIMESTAMP

---

TABLE: system_operations (db_table='system_operations')
Primary Key: system_id (FK -> systems.id, one-to-one)

Columns:
- system_id: INTEGER PRIMARY KEY FK -> systems.id
- dev_type: VARCHAR(50) - Loại phát triển
    VALUES: 'internal' (Nội bộ), 'outsource' (Thuê ngoài), 'combined' (Kết hợp), 'other'
- developer: TEXT - Đơn vị phát triển
- dev_team_size: INTEGER
- warranty_status: VARCHAR(50)
    VALUES: 'active' (Còn bảo hành), 'expired' (Hết bảo hành), 'none' (Không có), 'other'
- warranty_end_date: DATE
- has_maintenance_contract: BOOLEAN
- maintenance_end_date: DATE
- operator: TEXT - Đơn vị vận hành
- ops_team_size: INTEGER
- vendor_dependency: VARCHAR(20) - Phụ thuộc nhà cung cấp
    VALUES: 'high', 'medium', 'low', 'none', 'other'
- can_self_maintain: BOOLEAN - Tự vận hành được?
- support_level: TEXT
- avg_incident_response_hours: DECIMAL(5,2)
- deployment_location: VARCHAR(50)
    VALUES: 'datacenter', 'cloud', 'hybrid', 'other'
- compute_type: VARCHAR(50)
    VALUES: 'vm', 'container', 'serverless', 'bare_metal', 'other'
- compute_specifications: TEXT
- deployment_frequency: VARCHAR(50)
    VALUES: 'daily', 'weekly', 'monthly', 'quarterly', 'yearly', 'on_demand'
- created_at: TIMESTAMP
- updated_at: TIMESTAMP

---

TABLE: system_integration (db_table='system_integration')
Primary Key: system_id (FK -> systems.id, one-to-one)

Columns:
- system_id: INTEGER PRIMARY KEY FK -> systems.id
- has_integration: BOOLEAN - Có tích hợp?
- integration_count: INTEGER - Số lượng tích hợp
- integration_types: JSONB - Danh sách loại tích hợp: ["api", "esb", "file", "database"]
- connected_internal_systems: TEXT
- connected_external_systems: TEXT
- has_integration_diagram: BOOLEAN
- integration_description: TEXT
- uses_standard_api: BOOLEAN
- api_standard: TEXT - REST, SOAP, GraphQL, etc.
- has_api_gateway: BOOLEAN - Có API Gateway?
- api_gateway_name: TEXT - Tên API Gateway (Kong, AWS, Azure, etc.)
- has_api_versioning: BOOLEAN
- has_rate_limiting: BOOLEAN
- api_provided_count: INTEGER
- api_consumed_count: INTEGER
- api_documentation: TEXT
- api_versioning_standard: TEXT
- has_integration_monitoring: BOOLEAN
- created_at: TIMESTAMP
- updated_at: TIMESTAMP

---

TABLE: system_assessment (db_table='system_assessment')
Primary Key: system_id (FK -> systems.id, one-to-one)

Columns:
- system_id: INTEGER PRIMARY KEY FK -> systems.id
- performance_rating: INTEGER - Đánh giá hiệu năng (IMPORTANT: INTEGER 1-5, NOT VARCHAR!)
    VALUES: 1 (Rất kém), 2 (Kém), 3 (Trung bình), 4 (Tốt), 5 (Rất tốt)
- uptime_percent: DECIMAL(5,2) - Thời gian hoạt động (%)
- avg_response_time_ms: INTEGER - Thời gian phản hồi trung bình (ms)
- user_satisfaction_rating: INTEGER - Đánh giá hài lòng người dùng (1-5)
- technical_debt_level: VARCHAR(20) - Mức nợ kỹ thuật
    VALUES: 'high', 'medium', 'low'
- needs_replacement: BOOLEAN - Cần thay thế?
- replacement_plan: TEXT
- major_issues: TEXT
- improvement_suggestions: TEXT
- future_plans: TEXT
- modernization_priority: VARCHAR(20)
    VALUES: 'high', 'medium', 'low'
- integration_readiness: JSONB - Điểm phù hợp tích hợp
- blockers: JSONB - Điểm vướng
- recommendation: VARCHAR(10000) - Đề xuất của đơn vị
    VALUES: 'keep' (Giữ nguyên), 'upgrade' (Nâng cấp), 'replace' (Thay thế), 'merge' (Hợp nhất), 'other'
- recommendation_other: TEXT - Chi tiết nếu chọn 'other'
- created_at: TIMESTAMP
- updated_at: TIMESTAMP

---

TABLE: system_cost (db_table='system_cost')
Primary Key: system_id (FK -> systems.id, one-to-one)

Columns:
- system_id: INTEGER PRIMARY KEY FK -> systems.id
- initial_investment: DECIMAL(15,2) - Chi phí đầu tư ban đầu (VND)
- development_cost: DECIMAL(15,2) - Chi phí phát triển
- annual_license_cost: DECIMAL(15,2) - Chi phí license hàng năm
- annual_maintenance_cost: DECIMAL(15,2) - Chi phí bảo trì hàng năm
- annual_infrastructure_cost: DECIMAL(15,2) - Chi phí hạ tầng hàng năm
- annual_personnel_cost: DECIMAL(15,2) - Chi phí nhân sự hàng năm
- total_cost_of_ownership: DECIMAL(15,2) - TCO 5 năm
- cost_notes: TEXT
- funding_source: TEXT
- created_at: TIMESTAMP
- updated_at: TIMESTAMP

---

TABLE: system_security (db_table='system_security')
Primary Key: system_id (FK -> systems.id, one-to-one)

Columns:
- system_id: INTEGER PRIMARY KEY FK -> systems.id
- auth_method: VARCHAR(100) - Phương thức xác thực
- has_mfa: BOOLEAN - Có MFA?
- has_rbac: BOOLEAN - Có RBAC?
- has_data_encryption_at_rest: BOOLEAN - Mã hóa dữ liệu lưu trữ?
- has_data_encryption_in_transit: BOOLEAN - Mã hóa dữ liệu truyền tải?
- has_firewall: BOOLEAN
- has_waf: BOOLEAN - Có WAF?
- has_ids_ips: BOOLEAN - Có IDS/IPS?
- has_antivirus: BOOLEAN
- last_security_audit_date: DATE
- last_penetration_test_date: DATE
- has_vulnerability_scanning: BOOLEAN
- compliance_standards: JSONB - e.g., ["ISO27001", "GDPR", "PCIDSS"]
- security_incidents_last_year: INTEGER
- security_notes: TEXT
- security_improvements_needed: TEXT
- created_at: TIMESTAMP
- updated_at: TIMESTAMP

---

TABLE: system_data_info (db_table='system_data_info')
Primary Key: system_id (FK -> systems.id, one-to-one)

Columns:
- system_id: INTEGER PRIMARY KEY FK -> systems.id
- storage_size_gb: DECIMAL(10,2) - Dung lượng CSDL (GB)
- file_storage_size_gb: DECIMAL(10,2) - Dung lượng file (GB)
- growth_rate_percent: DECIMAL(5,2) - Tốc độ tăng trưởng (%/năm)
- data_types: JSONB - ["business", "documents", "stats", "master"]
- has_api: BOOLEAN
- api_endpoints_count: INTEGER
- shared_with_systems: TEXT
- has_data_standard: BOOLEAN
- has_personal_data: BOOLEAN - Có dữ liệu cá nhân?
- has_sensitive_data: BOOLEAN - Có dữ liệu nhạy cảm?
- data_classification: VARCHAR(50) - public, internal, confidential, secret
- secondary_databases: JSONB
- file_storage_type: VARCHAR(50)
    VALUES: 'file_server', 'object_storage', 'nas', 'database_blob', 'none', 'other'
- record_count: BIGINT - Số bản ghi
- created_at: TIMESTAMP
- updated_at: TIMESTAMP

---

TABLE: system_infrastructure (db_table='system_infrastructure')
Primary Key: system_id (FK -> systems.id, one-to-one)

Columns:
- system_id: INTEGER PRIMARY KEY FK -> systems.id
- num_servers: INTEGER
- server_specs: TEXT
- total_cpu_cores: INTEGER
- total_ram_gb: DECIMAL(10,2)
- total_storage_tb: DECIMAL(10,2)
- bandwidth_mbps: INTEGER
- has_cdn: BOOLEAN
- has_load_balancer: BOOLEAN
- backup_frequency: VARCHAR(50) - daily, weekly, real-time
- backup_retention_days: INTEGER
- has_disaster_recovery: BOOLEAN
- rto_hours: DECIMAL(5,2) - Recovery Time Objective
- rpo_hours: DECIMAL(5,2) - Recovery Point Objective
- created_at: TIMESTAMP
- updated_at: TIMESTAMP

---

TABLE: system_vendor (db_table='system_vendor')
Primary Key: system_id (FK -> systems.id, one-to-one)

Columns:
- system_id: INTEGER PRIMARY KEY FK -> systems.id
- vendor_name: TEXT
- vendor_type: VARCHAR(100) - domestic, foreign, joint_venture
- vendor_contact_person: TEXT
- vendor_phone: VARCHAR(20)
- vendor_email: EMAIL
- contract_number: VARCHAR(100)
- contract_start_date: DATE
- contract_end_date: DATE
- contract_value: DECIMAL(15,2)
- vendor_performance_rating: INTEGER (1-5)
- vendor_responsiveness_rating: INTEGER (1-5)
- vendor_lock_in_risk: VARCHAR(20) - high, medium, low
- alternative_vendors: TEXT
- created_at: TIMESTAMP
- updated_at: TIMESTAMP

---

TABLE: users (db_table='users')
Primary Key: id (integer)

Columns:
- id: INTEGER PRIMARY KEY
- username: VARCHAR
- email: EMAIL
- role: VARCHAR(20)
    VALUES: 'admin', 'org_user', 'lanhdaobo'
- organization_id: INTEGER FK -> organizations.id
- phone: VARCHAR(20)

=== CRITICAL NOTES ===
1. ALWAYS filter systems with: is_deleted = false
2. performance_rating is INTEGER (1-5), NOT a string!
3. recommendation is VARCHAR with values: keep, upgrade, replace, merge, other
4. Join related tables using system_id as the foreign key
5. Use table aliases: s for systems, o for organizations, sa for system_assessment, etc.
6. All one-to-one related tables use system_id as both PK and FK

=== EXAMPLE QUERIES ===

-- Count systems by status
SELECT status, COUNT(*) as count FROM systems WHERE is_deleted = false GROUP BY status;

-- Get systems with performance rating
SELECT s.system_name, sa.performance_rating, sa.recommendation
FROM systems s
LEFT JOIN system_assessment sa ON s.id = sa.system_id
WHERE s.is_deleted = false AND sa.performance_rating IS NOT NULL;

-- Systems by organization
SELECT o.name as org_name, COUNT(s.id) as system_count
FROM organizations o
LEFT JOIN systems s ON o.id = s.org_id AND s.is_deleted = false
GROUP BY o.id, o.name;
"""

        # Initialize AI client based on provider
        if use_claude:
            from anthropic import Anthropic
            client = Anthropic(api_key=api_key)
        else:
            import requests
            openai_client = None  # Use requests for OpenAI API

        # Helper function to validate and execute SQL
        def validate_and_execute_sql(sql):
            """
            Validate SQL safety and execute it.
            Returns (query_result, error_message) tuple.
            """
            # Clean SQL: remove markdown code blocks, extra whitespace
            sql = sql.strip()
            # Remove markdown code blocks (```sql ... ``` or ``` ... ```)
            if sql.startswith('```'):
                lines = sql.split('\n')
                # Remove first line (```sql or ```) and last line (```)
                if lines[0].startswith('```'):
                    lines = lines[1:]
                if lines and lines[-1].strip() == '```':
                    lines = lines[:-1]
                sql = '\n'.join(lines)
            sql = sql.strip().rstrip(';')  # Remove trailing semicolon

            # Basic safety check
            sql_upper = sql.upper()
            # Allow SELECT and WITH (for CTEs)
            is_safe_start = sql_upper.startswith('SELECT') or sql_upper.startswith('WITH')
            # Check for dangerous keywords as whole words (using regex word boundaries)
            # This prevents false positives like "is_deleted" matching "DELETE"
            import re as regex_check
            dangerous_keywords = ['DROP', 'DELETE', 'UPDATE', 'INSERT', 'ALTER', 'TRUNCATE', 'CREATE']
            has_dangerous = any(regex_check.search(rf'\b{keyword}\b', sql_upper) for keyword in dangerous_keywords)
            # Also check for SQL comments
            has_dangerous = has_dangerous or '--' in sql
            # Check for multiple statements (semicolon in middle of query)
            has_multiple_statements = ';' in sql

            if not is_safe_start or has_dangerous or has_multiple_statements:
                return None, 'Query không an toàn, chỉ cho phép SELECT'

            try:
                from django.db import connection
                with connection.cursor() as cursor:
                    cursor.execute(sql)
                    columns = [col[0] for col in cursor.description]
                    rows = cursor.fetchall()
                    query_result = {
                        'columns': columns,
                        'rows': [dict(zip(columns, row)) for row in rows[:200]],  # Limit 200 rows (increased for detailed queries)
                        'total_rows': len(rows),
                    }
                    return query_result, None
            except Exception as e:
                return None, str(e)

        # Helper function to call AI API (Claude or OpenAI)
        def call_ai(system_prompt, conversation_messages):
            """
            Call AI API with system prompt and conversation messages.
            Returns the text response from the AI.
            """
            if use_claude:
                # Claude API
                response = client.messages.create(
                    model='claude-3-5-sonnet-20241022',
                    max_tokens=2000,
                    system=system_prompt,
                    messages=conversation_messages,
                )
                return response.content[0].text
            else:
                # OpenAI API - using GPT-5 with reasoning via Responses API
                import openai as openai_sdk
                openai_client = openai_sdk.OpenAI(api_key=api_key)

                # Build input array with 'developer' role for system prompt
                input_array = [{'role': 'developer', 'content': system_prompt}]
                for msg in conversation_messages:
                    input_array.append({'role': msg['role'], 'content': msg['content']})

                response = openai_client.responses.create(
                    model='gpt-5.2',
                    reasoning={'effort': 'medium'},
                    input=input_array,
                    max_output_tokens=3000,
                )
                return response.output_text

        # User-friendly error message in Vietnamese
        FRIENDLY_ERROR_MESSAGE = (
            "Xin lỗi, tôi không thể trả lời câu hỏi này do thiếu thông tin cần thiết "
            "hoặc câu hỏi quá phức tạp. Vui lòng thử hỏi theo cách khác hoặc đặt câu hỏi đơn giản hơn."
        )

        # Maximum retry attempts
        MAX_RETRIES = 3

        # ====== PHASE 1 PROMPT: Generate SQL + Thinking ======
        critical_context = self._get_critical_context()
        phase1_prompt = f"""Bạn là Trợ lý AI phân tích dữ liệu hệ thống CNTT. Nhiệm vụ của bạn là PHÂN TÍCH yêu cầu và VIẾT SQL query.

{critical_context}

{schema_context}

=== NHIỆM VỤ PHASE 1 ===
1. Phân tích yêu cầu của người dùng
2. Lập kế hoạch các bước cần làm
3. Viết SQL query chính xác để lấy dữ liệu
4. KHÔNG viết câu trả lời cuối cùng - chỉ chuẩn bị SQL

=== RESPONSE FORMAT (BẮT BUỘC JSON) ===
{{
    "thinking": {{
        "plan": "Mô tả ngắn gọn kế hoạch phân tích...",
        "tasks": [
            {{"id": 1, "name": "Task cụ thể liên quan đến câu hỏi", "status": "completed"}},
            {{"id": 2, "name": "Task cụ thể khác", "status": "completed"}}
        ],
        "sql_queries": ["SELECT ..."]
    }},
    "sql": "SQL query chính để lấy dữ liệu"
}}

=== QUY TẮC TẠO TASKS (QUAN TRỌNG) ===
Tasks phải CỤ THỂ và LIÊN QUAN TRỰC TIẾP đến câu hỏi. KHÔNG dùng tasks chung chung.
Ví dụ:
- Câu hỏi "Có bao nhiêu hệ thống?" → Tasks: "Đếm tổng số hệ thống", "Loại bỏ hệ thống đã xóa"
- Câu hỏi "Dung lượng CSDL?" → Tasks: "Lấy thông tin database", "Tính tổng dung lượng GB"
- Câu hỏi "Đơn vị nào có nhiều hệ thống?" → Tasks: "Group by đơn vị", "Sắp xếp theo số lượng"
KHÔNG dùng: "Phân tích yêu cầu", "Xây dựng SQL", "Tổng hợp kết quả" (quá chung chung)

=== 🎯 POLICY: LUÔN FETCH SYSTEM LIST ĐỂ VISUALIZATION CÓ DATA (BẮT BUỘC) ===
**NGUYÊN TẮC QUAN TRỌNG NHẤT**:
Bất kỳ câu hỏi nào liên quan đến hệ thống (systems), SQL query PHẢI:

1. **LUÔN trả về danh sách systems** thay vì chỉ aggregate (COUNT, SUM, AVG)
2. **LUÔN bao gồm các trường sau để tạo hyperlinks trong visualization**:
   - `s.id AS system_id` (hoặc `s.id`) - REQUIRED cho link
   - `s.system_name` - REQUIRED cho display
   - `s.system_code` - Optional nhưng recommended
   - `s.status` - Optional nhưng recommended
   - `o.id AS org_id` (hoặc `o.id`) - REQUIRED nếu có join organizations
   - `o.name AS organization_name` - REQUIRED nếu có join organizations

3. **Ví dụ cụ thể**:
   ❌ SAI: `SELECT COUNT(*) FROM systems WHERE ...`
   ✅ ĐÚNG: `SELECT s.id, s.system_name, s.system_code, s.status, o.id AS org_id, o.name AS organization_name FROM systems s JOIN organizations o ON s.org_id = o.id WHERE ... AND s.is_deleted = false`

4. **Áp dụng cho TẤT CẢ các loại câu hỏi**:
   - "Có bao nhiêu hệ thống?" → Trả về list systems (không chỉ COUNT)
   - "Hệ thống nào đang hoạt động?" → Trả về list với id/name/org
   - "Top 5 hệ thống..." → Trả về list với full details
   - "Đơn vị nào có nhiều hệ thống?" → GROUP BY nhưng vẫn join để lấy system details

5. **Mục đích**: Để D3.js visualization có thể:
   - Hiển thị interactive table với clickable links
   - Navigate to system detail page (id)
   - Navigate to org dashboard (org_id)
   - Show meaningful data instead of just numbers

=== VÍ DỤ CỤ THỂ CHO CÂU HỎI THƯỜNG GẶP ===

**Câu hỏi: "Có bao nhiêu hệ thống?"**
❌ CŨ (SAI): SELECT COUNT(*) AS count FROM systems WHERE is_deleted = false
✅ MỚI (ĐÚNG): SELECT s.id, s.system_name, s.system_code, s.status, o.id AS org_id, o.name AS organization_name FROM systems s JOIN organizations o ON s.org_id = o.id WHERE s.is_deleted = false LIMIT 100

**Câu hỏi: "Đơn vị nào có nhiều hệ thống nhất?"**
❌ CŨ (SAI): SELECT o.name, COUNT(*) as count FROM systems s JOIN organizations o ON s.org_id = o.id WHERE s.is_deleted = false GROUP BY o.name ORDER BY count DESC LIMIT 10
✅ MỚI (ĐÚNG): SELECT s.id, s.system_name, s.system_code, s.status, o.id AS org_id, o.name AS organization_name FROM systems s JOIN organizations o ON s.org_id = o.id WHERE s.is_deleted = false ORDER BY o.name LIMIT 100

**Câu hỏi: "Top 5 hệ thống có nhiều người dùng nhất?"**
❌ CŨ (SAI): SELECT system_name, users_total FROM systems WHERE is_deleted = false ORDER BY users_total DESC LIMIT 5
✅ MỚI (ĐÚNG): SELECT s.id, s.system_name, s.system_code, s.status, s.users_total, o.id AS org_id, o.name AS organization_name FROM systems s JOIN organizations o ON s.org_id = o.id WHERE s.is_deleted = false ORDER BY s.users_total DESC NULLS LAST LIMIT 5

**LƯU Ý**: LUÔN JOIN với organizations để có org_id và organization_name cho hyperlinks!

=== QUY TẮC SQL ===
1. LUÔN lọc is_deleted = false khi query bảng systems
2. Tên bảng đúng: systems, organizations, system_architecture, system_assessment, system_operations, system_integration, system_security, system_cost, system_data_info, system_infrastructure, system_vendor
3. LUÔN dùng table aliases: s cho systems, o cho organizations, sa cho system_assessment
4. Join qua system_id (primary key và foreign key của các bảng one-to-one)
5. Chỉ SELECT queries, KHÔNG UPDATE/DELETE/DROP/INSERT
6. LUÔN trả về JSON hợp lệ
7. **LUÔN JOIN với organizations** để lấy org_id và organization_name cho hyperlinks
8. **LIMIT kết quả hợp lý**: Nếu không có LIMIT trong câu hỏi, mặc định LIMIT 100 để tránh quá tải

=== DATA TYPES ===
- performance_rating: INTEGER (1-5)
- user_satisfaction_rating: INTEGER (1-5)
- recommendation: VARCHAR ('keep', 'upgrade', 'replace', 'merge', 'other')
- Boolean: true/false

Nếu câu hỏi không liên quan đến dữ liệu, trả về JSON với sql = null."""

        # ====== PHASE 2 PROMPT: Generate Response with actual data (Executive Style) ======
        phase2_prompt_template = """Bạn là Trợ lý AI báo cáo cho Lãnh đạo Bộ Khoa học và Công nghệ Việt Nam.

=== DỮ LIỆU THỰC TẾ ĐÃ LẤY ===
Câu hỏi: {question}
Kết quả SQL (JSON):
{data_json}

=== NGUYÊN TẮC BÁO CÁO CHIẾN LƯỢC (QUAN TRỌNG) ===
1. NGẮN GỌN: main_answer TỐI ĐA 2-3 câu, chỉ nêu kết quả chính + kết luận
2. INSIGHT: Thêm strategic_insight phân tích ý nghĩa chiến lược (xu hướng, rủi ro, cơ hội)
3. HÀNH ĐỘNG: Thêm recommended_action gợi ý cụ thể cho lãnh đạo
4. KHÔNG liệt kê danh sách chi tiết trong main_answer - data sẽ hiển thị riêng

=== PHONG CÁCH ===
- Trang trọng, chuyên nghiệp cho Lãnh đạo cấp Bộ
- Mở đầu: "Báo cáo anh/chị,"
- Dùng **bold** cho số liệu quan trọng
- Kết thúc ngắn gọn, không cần "Kính báo cáo"

=== RESPONSE FORMAT (JSON) ===
{{
    "response": {{
        "greeting": "Báo cáo anh/chị,",
        "main_answer": "**Số liệu chính** + kết luận ngắn gọn (TỐI ĐA 2-3 câu)",
        "strategic_insight": "Ý nghĩa chiến lược: phân tích xu hướng, rủi ro, hoặc cơ hội từ dữ liệu (1-2 câu)",
        "recommended_action": "Đề xuất hành động cụ thể cho lãnh đạo (1 câu)",
        "details": null,
        "follow_up_suggestions": [
            "Câu hỏi về rủi ro/bảo mật?",
            "Câu hỏi về ngân sách/nguồn lực?",
            "Câu hỏi về lộ trình triển khai?"
        ]
    }}
}}

=== LƯU Ý QUAN TRỌNG ===
- main_answer PHẢI chứa số liệu thực từ data, KHÔNG dùng placeholder
- main_answer KHÔNG liệt kê chi tiết - chỉ tóm tắt kết quả chính
- strategic_insight phải có giá trị cho việc ra quyết định
- recommended_action phải là hành động cụ thể, khả thi
- follow_up_suggestions phải CHIẾN LƯỢC (rủi ro, ưu tiên, ngân sách, lộ trình)
- **CHỈ TRẢ VỀ CÁC FIELD TRONG RESPONSE FORMAT** - KHÔNG thêm chart_type, chart_config, system_list_markdown hay bất kỳ field nào khác"""

        # Build conversation for Phase 1
        conversation = [{'role': 'user', 'content': query}]

        try:
            import re

            # ====== PHASE 1: Generate SQL + Thinking ======
            for attempt in range(MAX_RETRIES):
                logger.info(f"Phase 1 - AI SQL generation attempt {attempt + 1}/{MAX_RETRIES}")

                try:
                    phase1_content = call_ai(phase1_prompt, conversation)
                except Exception as api_error:
                    provider = 'Claude' if use_claude else 'OpenAI'
                    logger.error(f"{provider} API error in Phase 1: {api_error}")
                    return Response(
                        {'error': 'AI service temporarily unavailable'},
                        status=status.HTTP_503_SERVICE_UNAVAILABLE
                    )

                # Parse Phase 1 response
                try:
                    json_match = re.search(r'\{[\s\S]*\}', phase1_content)
                    if json_match:
                        phase1_data = json.loads(json_match.group())
                    else:
                        phase1_data = {'thinking': {'plan': 'Direct response', 'tasks': [], 'sql_queries': []}, 'sql': None}
                except json.JSONDecodeError:
                    phase1_data = {'thinking': {'plan': 'Parse error', 'tasks': [], 'sql_queries': []}, 'sql': None}

                # Extract thinking and SQL
                thinking = phase1_data.get('thinking', {'plan': '', 'tasks': [], 'sql_queries': []})
                sql_query = phase1_data.get('sql')

                # If no SQL, return without data
                if not sql_query:
                    return Response({
                        'query': query,
                        'thinking': thinking,
                        'response': {
                            'greeting': 'Báo cáo anh/chị,',
                            'main_answer': 'Xin lỗi, tôi không thể tạo câu truy vấn cho yêu cầu này.',
                            'details': None,
                            'follow_up_suggestions': [],
                            'visualization_html': None
                        },
                        'data': None,
                    })

                # Execute SQL
                query_result, sql_error = validate_and_execute_sql(sql_query)

                if query_result is not None:
                    # 🎯 POST-PROCESS: If query is just COUNT, also fetch system list for visualization
                    sql_upper = sql_query.upper()
                    is_count_only = (
                        'COUNT(*)' in sql_upper and
                        'FROM SYSTEMS' in sql_upper and
                        len(query_result.get('columns', [])) == 1 and
                        query_result.get('columns', [None])[0].lower() == 'count'
                    )

                    if is_count_only:
                        logger.info("[POLICY] Detected COUNT-only query, fetching system list for visualization...")
                        # Fetch system list with IDs for visualization
                        supplementary_sql = """
                        SELECT
                            s.id,
                            s.system_name,
                            s.system_code,
                            s.status,
                            o.id AS org_id,
                            o.name AS organization_name
                        FROM systems s
                        JOIN organizations o ON s.org_id = o.id
                        WHERE s.is_deleted = false
                        LIMIT 100
                        """
                        system_list, list_error = validate_and_execute_sql(supplementary_sql)

                        if system_list is not None:
                            logger.info(f"[POLICY] Fetched {len(system_list.get('rows', []))} systems for visualization")
                            # Replace query_result with system list for better visualization
                            query_result = system_list
                        else:
                            logger.warning(f"[POLICY] Failed to fetch system list: {list_error}")

                if query_result is not None:
                    # ====== PHASE 2: Generate Response with actual data ======
                    logger.info("Phase 2 - Generating response with actual data")

                    # Prepare data summary for Phase 2
                    data_summary = json.dumps(query_result, ensure_ascii=False, indent=2, default=str)
                    # Limit data size for prompt (increased to handle larger result sets)
                    if len(data_summary) > 20000:
                        data_summary = data_summary[:20000] + "\n... (truncated)"

                    phase2_prompt = phase2_prompt_template.format(
                        question=query,
                        data_json=data_summary
                    )

                    try:
                        phase2_content = call_ai(phase2_prompt, [{'role': 'user', 'content': 'Generate response'}])

                        # Parse Phase 2 response
                        json_match2 = re.search(r'\{[\s\S]*\}', phase2_content)
                        if json_match2:
                            phase2_data = json.loads(json_match2.group())
                            response_content = phase2_data.get('response', {})

                            # CRITICAL: Remove numbered lists from main_answer (AI ignores instructions and adds full lists)
                            # This prevents duplicate visualization: table component shows data, main_answer should only have summary
                            if 'main_answer' in response_content and response_content['main_answer']:
                                main_text = response_content['main_answer']
                                # Find where numbered list starts (pattern: newline + number + dot/closing-paren + space)
                                list_match = re.search(r'\n\s*(\d+[\.\)])\s+', main_text)
                                if list_match:
                                    # Keep only text before the list
                                    response_content['main_answer'] = main_text[:list_match.start()].strip()
                                    logger.info(f"[CLEANUP] Removed numbered list from main_answer (was {len(main_text)} chars, now {len(response_content['main_answer'])} chars)")
                        else:
                            response_content = {
                                'greeting': 'Báo cáo anh/chị,',
                                'main_answer': phase2_content,
                                'details': None,
                                'follow_up_suggestions': []
                            }
                    except Exception as phase2_error:
                        logger.warning(f"Phase 2 error, using fallback: {phase2_error}")
                        # Fallback: generate simple response from data
                        if query_result.get('rows'):
                            first_row = query_result['rows'][0]
                            values = list(first_row.values())
                            main_value = values[0] if values else 'N/A'
                            response_content = {
                                'greeting': 'Báo cáo anh/chị,',
                                'main_answer': f'Kết quả: **{main_value}**',
                                'details': None,
                                'follow_up_suggestions': []
                            }
                        else:
                            response_content = {
                                'greeting': 'Báo cáo anh/chị,',
                                'main_answer': 'Không có dữ liệu phù hợp.',
                                'details': None,
                                'follow_up_suggestions': []
                            }

                    # ====== PHASE 3: Self-Review for Consistency (Max 2 retries) ======
                    MAX_REVIEW_RETRIES = 2
                    review_passed = False

                    for review_attempt in range(MAX_REVIEW_RETRIES + 1):
                        if review_attempt == 0:
                            # First time - do review
                            logger.info(f"Phase 3 - Self-review (attempt {review_attempt + 1})")
                        else:
                            logger.info(f"Phase 3 - Re-generating after inconsistency (attempt {review_attempt + 1})")

                        # Self-review prompt
                        review_prompt = f"""Bạn là QA reviewer. Kiểm tra xem câu trả lời có MÂU THUẪN với dữ liệu thực tế không.

=== CÂU HỎI GỐC ===
{query}

=== DỮ LIỆU THỰC TẾ (SQL result) ===
- Tổng số dòng: {query_result.get('total_rows', 0)}
- Dữ liệu: {json.dumps(query_result.get('rows', [])[:20], ensure_ascii=False, default=str)}

=== CÂU TRẢ LỜI ===
{response_content.get('main_answer', '')}

=== KIỂM TRA ===
1. Số lượng đề cập trong câu trả lời có KHỚP với total_rows không?
2. Nếu câu trả lời nói "X hệ thống" thì có đúng X dòng trong data không?
3. Các con số trong câu trả lời có khớp với data không?

=== TRẢ LỜI (JSON) ===
{{
    "is_consistent": true/false,
    "issues": ["Mô tả vấn đề nếu có"] hoặc []
}}

CHỈ trả về JSON, không giải thích."""

                        try:
                            review_content = call_ai(review_prompt, [{'role': 'user', 'content': 'Review consistency'}])
                            review_match = re.search(r'\{[\s\S]*\}', review_content)

                            if review_match:
                                review_result = json.loads(review_match.group())
                                is_consistent = review_result.get('is_consistent', True)
                                issues = review_result.get('issues', [])

                                if is_consistent:
                                    logger.info("Self-review passed - response is consistent with data")
                                    review_passed = True
                                    break
                                else:
                                    logger.warning(f"Self-review failed - issues: {issues}")

                                    if review_attempt < MAX_REVIEW_RETRIES:
                                        # Retry Phase 2 with correction instruction
                                        correction_prompt = f"""Câu trả lời trước có MÂU THUẪN với dữ liệu:
Vấn đề: {', '.join(issues)}

DỮ LIỆU THỰC TẾ:
- Tổng số dòng: {query_result.get('total_rows', 0)}
- Data: {data_summary}

Viết lại câu trả lời CHÍNH XÁC với dữ liệu. Số liệu trong main_answer PHẢI khớp với total_rows.

=== RESPONSE FORMAT (JSON) ===
{{
    "response": {{
        "greeting": "Báo cáo anh/chị,",
        "main_answer": "Câu trả lời với SỐ LIỆU CHÍNH XÁC từ data",
        "details": null,
        "follow_up_suggestions": ["Câu hỏi 1", "Câu hỏi 2"]
                                    }}
}}"""
                                        retry_content = call_ai(correction_prompt, [{'role': 'user', 'content': 'Regenerate response'}])
                                        retry_match = re.search(r'\{[\s\S]*\}', retry_content)
                                        if retry_match:
                                            retry_data = json.loads(retry_match.group())
                                            response_content = retry_data.get('response', response_content)
                                            logger.info("Response regenerated after self-review")
                                    else:
                                        logger.warning("Max review retries reached, using current response")
                                        review_passed = True
                                        break
                            else:
                                logger.warning("Could not parse review result, assuming consistent")
                                review_passed = True
                                break
                        except Exception as review_error:
                            logger.warning(f"Self-review error: {review_error}, skipping review")
                            review_passed = True
                            break

                    # Add review status to thinking
                    thinking['review_passed'] = review_passed

                    # STEP 2: Generate interactive visualization AFTER answer is ready
                    # This 2-step approach ensures better quality
                    # OLD: HTML string visualization (deprecated - causes duplicate tables)
                    # visualization_html = generate_visualization(query_result, query, request)
                    # response_content['visualization_html'] = visualization_html

                    # NEW: Generate structured data for React components (D3Table with pagination)
                    visualization_data = generate_visualization_data(query_result, query, request)
                    response_content['visualization_data'] = visualization_data

                    # Clean up: Remove old visualization fields (AI sometimes adds them despite instructions)
                    logger.info(f"[CLEANUP] Before: {list(response_content.keys())}")
                    response_content.pop('chart_type', None)
                    response_content.pop('chart_config', None)
                    response_content.pop('system_list_markdown', None)
                    logger.info(f"[CLEANUP] After: {list(response_content.keys())}")

                    return Response({
                        'query': query,
                        'thinking': thinking,
                        'response': response_content,
                        'data': query_result,
                    })

                # SQL failed - retry
                logger.warning(f"SQL execution failed (attempt {attempt + 1}): {sql_error}")

                if attempt < MAX_RETRIES - 1:
                    conversation.append({'role': 'assistant', 'content': phase1_content})
                    error_feedback = f"""SQL query bị lỗi: {sql_error}

Sửa lại SQL. Lưu ý:
- is_deleted = false cho bảng systems
- performance_rating là INTEGER (1-5)
- recommendation là VARCHAR: keep, upgrade, replace, merge, other
- Đúng tên bảng (system_assessment không phải system_assessments)

Trả về JSON với SQL đã sửa."""
                    conversation.append({'role': 'user', 'content': error_feedback})
                else:
                    logger.error(f"All {MAX_RETRIES} attempts failed for query: {query}")
                    return Response({
                        'query': query,
                        'thinking': thinking,
                        'response': {
                            'greeting': 'Báo cáo anh/chị,',
                            'main_answer': FRIENDLY_ERROR_MESSAGE,
                            'details': None,
                            'follow_up_suggestions': []
                        },
                        'data': None,
                        'error': sql_error,
                    })

            # Fallback
            return Response({
                'query': query,
                'thinking': {'plan': 'Query failed', 'tasks': [], 'sql_queries': []},
                'response': {'greeting': '', 'main_answer': FRIENDLY_ERROR_MESSAGE, 'follow_up_suggestions': []},
                'data': None,
            })

        except Exception as e:
            logger.error(f"AI query error: {e}")
            return Response(
                {'error': 'Internal server error'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=False, methods=['get'], renderer_classes=[EventStreamRenderer], authentication_classes=[], permission_classes=[])
    def ai_query_stream(self, request):
        """
        SSE Streaming endpoint for real-time AI progress.
        Streams events for each phase of AI processing.

        Authentication: Pass JWT token via 'token' query parameter
        (EventSource doesn't support custom headers).

        Events:
        - phase_start: When a phase begins
        - phase_complete: When a phase completes
        - error: When an error occurs
        - complete: Final result with all data
        """
        # Manual authentication from query param (EventSource limitation)
        from rest_framework_simplejwt.tokens import AccessToken
        from rest_framework.exceptions import AuthenticationFailed

        token_param = request.query_params.get('token')
        if not token_param:
            def error_stream():
                yield f"event: error\ndata: {json.dumps({'error': 'Token required'})}\n\n"
            response = StreamingHttpResponse(error_stream(), content_type='text/event-stream')
            response['Cache-Control'] = 'no-cache'
            response['X-Accel-Buffering'] = 'no'
            return response

        try:
            access_token = AccessToken(token_param)
            from apps.accounts.models import User
            user_id = access_token.payload.get('user_id')
            user = User.objects.get(id=user_id)
        except Exception as e:
            logger.warning(f"SSE authentication failed: {e}")
            def error_stream():
                yield f"event: error\ndata: {json.dumps({'error': 'Invalid token'})}\n\n"
            response = StreamingHttpResponse(error_stream(), content_type='text/event-stream')
            response['Cache-Control'] = 'no-cache'
            response['X-Accel-Buffering'] = 'no'
            return response
        # TEMP: Allow admin for testing
        if user.role not in ['leader', 'admin']:
            def error_stream():
                yield f"event: error\ndata: {json.dumps({'error': 'Chỉ Lãnh đạo Bộ mới có quyền sử dụng AI Assistant'})}\n\n"
            response = StreamingHttpResponse(error_stream(), content_type='text/event-stream')
            response['Cache-Control'] = 'no-cache'
            response['X-Accel-Buffering'] = 'no'
            return response

        query = request.query_params.get('query', '').strip()
        if not query:
            def error_stream():
                yield f"event: error\ndata: {json.dumps({'error': 'Vui lòng nhập câu hỏi'})}\n\n"
            response = StreamingHttpResponse(error_stream(), content_type='text/event-stream')
            response['Cache-Control'] = 'no-cache'
            response['X-Accel-Buffering'] = 'no'
            return response

        # Get mode parameter (default: 'quick' for faster perceived performance)
        mode = request.query_params.get('mode', 'quick')  # 'quick' or 'deep'

        # Get conversation context for follow-up questions
        context_param = request.query_params.get('context', '')
        context = None
        if context_param:
            try:
                context = json.loads(context_param)
                logger.info(f"Conversation context received: previous_query={context.get('previous_query', '')[:50]}")
            except Exception as e:
                logger.warning(f"Failed to parse context: {e}")

        if mode == 'quick':
            return self._quick_answer_stream(query, user, context, request)
        else:
            return self._deep_analysis_stream(query, user, context, request)

    def _get_critical_context(self):
        """
        Get critical context about "Bộ KH&CN" queries to prevent org name filtering bug.
        This context is shared between ai_query and ai_query_stream prompts.
        """
        return """
=== CRITICAL RULE - MUST FOLLOW ===
Context: Database của HỆ THỐNG THỐNG KÊ CNTT CỦA BỘ KHOA HỌC VÀ CÔNG NGHỆ.
Database chứa TẤT CẢ các hệ thống của Bộ KH&CN (từ tất cả đơn vị trực thuộc).

RULE: Khi user hỏi "Bộ KH&CN có bao nhiêu hệ thống?" hoặc "Bộ có bao nhiêu hệ thống?":
→ SQL PHẢI LÀ: SELECT ... FROM systems s LEFT JOIN organizations o ON s.org_id = o.id WHERE s.is_deleted = false
→ KHÔNG ĐƯỢC filter theo o.name (vì KHÔNG CÓ org nào tên "Bộ KH&CN")
→ CHỈ filter org KHI user nói TÊN ĐƠN VỊ CỤ THỂ (VD: "Văn phòng Bộ", "VNNIC")
===================================
"""

    def _get_active_policies_text(self):
        """
        Get active improvement policies and format as text to inject into system prompt
        Returns empty string if no policies are active
        """
        try:
            policies = AIResponseFeedback.generate_improvement_policies()

            # Filter to high and medium priority only
            active = [p for p in policies if p['priority'] in ['high', 'medium']]

            if not active:
                return ""

            # Format policies as text
            policy_text = "\n\n=== IMPROVEMENT POLICIES (Based on User Feedback) ===\n"
            policy_text += "Những chính sách này được tạo ra từ feedback của người dùng để cải thiện chất lượng câu trả lời:\n\n"

            for i, policy in enumerate(active, 1):
                priority_icon = "🔴" if policy['priority'] == 'high' else "🟡"
                policy_text += f"{i}. {priority_icon} [{policy['category'].upper()}] {policy['rule']}\n"
                policy_text += f"   (Dựa trên {policy['evidence_count']} feedback)\n\n"

            policy_text += "Vui lòng tuân thủ các policies trên khi generate câu trả lời.\n"
            policy_text += "=" * 70 + "\n"

            return policy_text

        except Exception as e:
            logger.warning(f"Failed to get improvement policies: {e}")
            return ""

    def _quick_answer_stream(self, query, user, context=None, request=None):
        """
        Quick Mode: Single AI call + direct answer (~4-6s)
        context: Optional dict with previous_query, previous_answer, previous_sql for follow-up questions

        Stream:
        - phase_start: "Phân tích nhanh"
        - complete: SQL + answer + data (NO strategic insights, NO review)
        """
        def event_stream():
            import re
            import requests
            from django.utils import timezone

            # API Configuration
            CLAUDE_API_KEY = getattr(settings, 'CLAUDE_API_KEY', None)
            OPENAI_API_KEY = getattr(settings, 'OPENAI_API_KEY', None)

            use_claude = bool(CLAUDE_API_KEY)
            use_openai = bool(OPENAI_API_KEY)

            if not use_claude and not use_openai:
                yield f"event: error\ndata: {json.dumps({'error': 'AI service not configured'})}\n\n"
                return

            # Create AI Request Log
            request_log = AIRequestLog.objects.create(
                user=user,
                query=query,
                mode='quick',
                status='success',
                started_at=timezone.now(),
                llm_requests=[],
                tasks=[]
            )

            # Helper function to call AI with logging
            def call_ai_internal(system_prompt, messages, phase_name='Phase'):
                start_time = time.time()
                model_used = None
                estimated_input_tokens = 0
                estimated_output_tokens = 0
                estimated_cost = 0.0

                try:
                    if use_openai:
                        import openai
                        client = openai.OpenAI(
                            api_key=OPENAI_API_KEY,
                            timeout=45.0
                        )
                        input_array = [{'role': 'developer', 'content': system_prompt}]
                        input_array.extend(messages)

                        # Estimate input tokens (rough estimate: 1 token ≈ 4 chars)
                        input_text = system_prompt + ''.join(m.get('content', '') for m in messages)
                        estimated_input_tokens = len(input_text) // 4

                        # Use GPT-5.2 with low reasoning effort for quick mode
                        response = client.responses.create(
                            model='gpt-5.2',
                            reasoning={'effort': 'low'},
                            input=input_array,
                            max_output_tokens=8192,
                        )
                        model_used = 'gpt-5.2'
                        result = response.output_text

                        # Estimate output tokens
                        estimated_output_tokens = len(result) // 4

                    elif use_claude:
                        import anthropic
                        client = anthropic.Anthropic(
                            api_key=CLAUDE_API_KEY,
                            timeout=45.0
                        )

                        input_text = system_prompt + ''.join(m.get('content', '') for m in messages)
                        estimated_input_tokens = len(input_text) // 4

                        response = client.messages.create(
                            model='claude-sonnet-4-20250514',
                            max_tokens=4096,
                            system=system_prompt,
                            messages=messages
                        )
                        model_used = 'claude-sonnet-4-20250514'
                        result = response.content[0].text

                        estimated_output_tokens = len(result) // 4

                    # Calculate duration and cost
                    duration_ms = int((time.time() - start_time) * 1000)
                    estimated_cost = estimate_llm_cost(model_used, estimated_input_tokens, estimated_output_tokens)

                    # Log this LLM request
                    llm_request = {
                        'phase': phase_name,
                        'model': model_used,
                        'duration_ms': duration_ms,
                        'estimated_input_tokens': estimated_input_tokens,
                        'estimated_output_tokens': estimated_output_tokens,
                        'estimated_cost_usd': round(estimated_cost, 6),
                        'timestamp': start_time
                    }

                    # Update request log's llm_requests
                    current_requests = request_log.llm_requests or []
                    current_requests.append(llm_request)
                    request_log.llm_requests = current_requests
                    request_log.save(update_fields=['llm_requests'])

                    return result

                except Exception as e:
                    logger.error(f"AI call error in {phase_name}: {e}")
                    raise

            # SQL validation function
            def validate_and_execute_sql_internal(sql):
                from django.db import connection
                sql_upper = sql.upper().strip()
                forbidden_pattern = r'\b(DROP|DELETE|UPDATE|INSERT|ALTER|CREATE|TRUNCATE)\b'
                if re.search(forbidden_pattern, sql_upper):
                    return None, "Only SELECT queries allowed"
                try:
                    with connection.cursor() as cursor:
                        cursor.execute(sql)
                        columns = [col[0] for col in cursor.description] if cursor.description else []
                        rows = cursor.fetchall()
                        result = {
                            'columns': columns,
                            'rows': [dict(zip(columns, row)) for row in rows],
                            'total_rows': len(rows)
                        }
                        return result, None
                except Exception as e:
                    return None, str(e)

            # Schema context (abbreviated for quick mode) - WITH VIETNAMESE LABELS
            schema_context = """Database Schema (với tên tiếng Việt):

- organizations:
  id, name (Tên tổ chức), code (Mã), description (Mô tả), contact_person (Người liên hệ)

- systems (Bảng hệ thống chính):
  id, system_name (Tên hệ thống), system_code (Mã hệ thống), status (Trạng thái),
  criticality_level (Mức độ quan trọng), org_id (Tổ chức),
  hosting_platform (Nền tảng triển khai), has_encryption (Mã hóa dữ liệu), is_deleted,
  storage_capacity (Dung lượng lưu trữ - TEXT), data_volume (Khối lượng dữ liệu - TEXT),
  data_volume_gb (Khối lượng dữ liệu GB - NUMERIC),
  programming_language (Ngôn ngữ lập trình), framework (Framework/Thư viện),
  database_name (Cơ sở dữ liệu),
  users_total (Tổng người dùng), users_mau (MAU), users_dau (DAU),
  total_accounts (Tổng số tài khoản),
  api_provided_count (Số API cung cấp), api_consumed_count (Số API tiêu thụ),
  authentication_method (Phương thức xác thực), compliance_standards_list (Chuẩn tuân thủ),
  business_owner (Người chịu trách nhiệm), technical_owner (Người quản trị kỹ thuật),
  go_live_date (Thời gian đưa vào vận hành),
  server_configuration (Cấu hình máy chủ), backup_plan (Phương án sao lưu),
  disaster_recovery_plan (Kế hoạch khôi phục thảm họa)

- system_architecture (Kiến trúc hệ thống):
  system_id, architecture_type (Loại kiến trúc), backend_tech (Backend Technology),
  frontend_tech (Frontend Technology), database_type (Loại CSDL), mobile_app (Ứng dụng di động),
  hosting_type (Loại hosting), cloud_provider (Nhà cung cấp cloud),
  api_style (API Style), has_cicd (CI/CD Pipeline), cicd_tool (CI/CD Tool),
  is_multi_tenant (Multi-tenant), containerization (Container hóa)

- system_assessment (Đánh giá hệ thống):
  system_id, performance_rating (Đánh giá hiệu năng), recommendation (Đề xuất của đơn vị),
  uptime_percent (Thời gian hoạt động %), technical_debt_level (Mức nợ kỹ thuật),
  needs_replacement (Cần thay thế), modernization_priority (Ưu tiên hiện đại hóa)

- system_data_info (Thông tin dữ liệu):
  system_id, data_classification (Phân loại dữ liệu),
  storage_size_gb (Dung lượng CSDL hiện tại GB - NUMERIC),
  growth_rate_percent (Tốc độ tăng trưởng dữ liệu %),
  has_personal_data (Có dữ liệu cá nhân), has_sensitive_data (Có dữ liệu nhạy cảm),
  record_count (Số bản ghi)

- system_integration (Tích hợp hệ thống):
  system_id, has_api_gateway (Có API Gateway), integration_count (Số tích hợp),
  api_provided_count (Số API cung cấp), api_consumed_count (Số API tiêu thụ),
  has_integration (Có tích hợp), uses_standard_api (Dùng API chuẩn),
  api_gateway_name (Tên API Gateway)

- system_security (An toàn thông tin):
  system_id, auth_method (Phương thức xác thực), has_mfa (Có MFA), has_rbac (Có RBAC),
  has_data_encryption_at_rest (Mã hóa dữ liệu lưu trữ),
  has_data_encryption_in_transit (Mã hóa dữ liệu truyền tải),
  has_firewall (Có Firewall), has_waf (Có WAF), has_ids_ips (Có IDS/IPS),
  has_antivirus (Có Antivirus),
  last_security_audit_date (Ngày audit ATTT gần nhất),
  has_vulnerability_scanning (Có quét lỗ hổng)

Lưu ý quan trọng:
- LUÔN LUÔN dùng WHERE is_deleted = false khi query bảng systems
- data_volume_gb, storage_size_gb là NUMERIC - dùng để tính SUM/AVG
- storage_capacity, data_volume là TEXT - chỉ để hiển thị, KHÔNG dùng cho phép tính
- Khi user hỏi bằng tiếng Việt, map sang đúng field name tiếng Anh trong database"""

            # Phase 1: Combined SQL Generation + Answer
            yield f"event: phase_start\ndata: {json.dumps({'phase': 1, 'name': 'Phân tích nhanh', 'description': 'Đang tạo câu trả lời...', 'mode': 'quick'})}\n\n"

            # Get active improvement policies from user feedback
            policies_text = self._get_active_policies_text()

            critical_context = self._get_critical_context()
            quick_prompt = f"""Bạn là AI assistant phân tích dữ liệu CNTT.

{critical_context}

{schema_context}
{policies_text}

VÍ DỤ CÁCH XỬ LÝ:

Example 1 - Đếm số lượng TOÀN BỘ:
User: "Có bao nhiêu hệ thống?"
User: "Bộ KH&CN có bao nhiêu hệ thống?"
User: "Bộ có bao nhiêu hệ thống CNTT?"
SQL: SELECT COUNT(*) as count FROM systems WHERE is_deleted = false
Answer: "Bộ KH&CN hiện có {{{{count}}}} hệ thống CNTT."
Xử lý:
- ĐÚNG: SELECT COUNT(*) FROM systems WHERE is_deleted = false
- SAI: SELECT COUNT(*) FROM systems s JOIN organizations o ... WHERE o.name = 'Bộ KH&CN'
- SAI: WHERE o.name ILIKE '%KH&CN%' OR o.name ILIKE '%Khoa học%'
- Lý do: KHÔNG CÓ organization nào tên "Bộ KH&CN". Database chứa TẤT CẢ hệ thống của Bộ.

Example 2 - Thống kê theo nhóm:
User: "Có bao nhiêu hệ thống dùng từng ngôn ngữ lập trình?"
SQL: SELECT programming_language, COUNT(*) as count FROM systems WHERE is_deleted = false AND programming_language IS NOT NULL GROUP BY programming_language ORDER BY count DESC
Answer: "Thống kê hệ thống theo ngôn ngữ lập trình"
Xử lý: GROUP BY để thống kê, ORDER BY count DESC

Example 2b - Đếm theo ĐƠN VỊ CỤ THỂ (khi user chỉ rõ tên đơn vị):
User: "Văn phòng Bộ có bao nhiêu hệ thống?"
User: "Cục KHCN có bao nhiêu hệ thống?"
SQL: SELECT COUNT(*) as count FROM systems s LEFT JOIN organizations o ON s.org_id = o.id WHERE s.is_deleted = false AND o.name ILIKE '%Văn phòng Bộ%'
Answer: "Văn phòng Bộ có {{{{count}}}} hệ thống."
Xử lý: CHỈ KHI user chỉ rõ TÊN ĐƠN VỊ cụ thể thì mới JOIN với organizations và filter. Dùng ILIKE với % để tìm gần đúng

Example 3 - Tổng/trung bình:
User: "Tổng dung lượng dữ liệu của các hệ thống?"
SQL: SELECT SUM(data_volume_gb) as total_gb, COUNT(*) as count FROM systems WHERE is_deleted = false AND data_volume_gb IS NOT NULL
Answer: "Tổng dung lượng dữ liệu là {{{{total_gb}}}} GB từ {{{{count}}}} hệ thống."
Xử lý: Dùng data_volume_gb (NUMERIC) để tính SUM, KHÔNG dùng data_volume (TEXT)

Example 4 - Tìm hệ thống theo điều kiện:
User: "Hệ thống nào dùng Java và có MFA?"
SQL: SELECT system_name, framework FROM systems s LEFT JOIN system_security ss ON s.id = ss.system_id WHERE s.is_deleted = false AND s.programming_language = 'Java' AND ss.has_mfa = true
Answer: "Danh sách các hệ thống dùng Java và có MFA. Bảng hiển thị Tên hệ thống và Framework."
Xử lý: JOIN nhiều bảng, WHERE với điều kiện cụ thể
LƯU Ý: Trong answer, dùng "Tên hệ thống" và "Framework" (canonical names), KHÔNG viết "system_name" hay "framework" (database names)

Example 5 - An toàn thông tin:
User: "Có bao nhiêu hệ thống chưa có Firewall?"
SQL: SELECT COUNT(*) as count FROM systems s LEFT JOIN system_security ss ON s.id = ss.system_id WHERE s.is_deleted = false AND (ss.has_firewall = false OR ss.has_firewall IS NULL)
Answer: "Có {{{{count}}}} hệ thống chưa có Firewall."
Xử lý: JOIN với system_security, check has_firewall = false OR IS NULL

Example 6 - Lọc theo trạng thái hoạt động:
User: "Có bao nhiêu hệ thống đang hoạt động?"
SQL: SELECT COUNT(*) as count FROM systems WHERE is_deleted = false AND status = 'operating'
Answer: "Có {{{{count}}}} hệ thống đang hoạt động."
Xử lý: QUAN TRỌNG - "đang hoạt động" = status = 'operating', KHÔNG phải 'active' hay 'running'
LƯU Ý: Các giá trị status: 'operating' (Đang vận hành), 'pilot' (Thí điểm), 'testing' (Đang thử nghiệm), 'stopped' (Dừng), 'replacing' (Sắp thay thế)

Example 7 - Tìm hệ thống theo tên (FULL-TEXT SEARCH):
User: "Thông tin về hệ thống Portal"
SQL: SELECT system_name, status, programming_language, organization FROM systems WHERE is_deleted = false AND system_name ILIKE '%Portal%'
Answer: "Danh sách các hệ thống có tên chứa 'Portal'. Bảng hiển thị Tên hệ thống, Trạng thái, Ngôn ngữ lập trình, Đơn vị."
Xử lý: QUAN TRỌNG - Dùng ILIKE '%keyword%' để tìm kiếm gần đúng, KHÔNG dùng = 'exact name'
Lý do: User thường không nhớ chính xác tên đầy đủ của hệ thống, ILIKE cho kết quả linh hoạt hơn
VÍ DỤ SAI: system_name = 'Portal' (sẽ không tìm thấy 'Portal VNNIC' hay 'Portal Cục SHTT')
VÍ DỤ ĐÚNG: system_name ILIKE '%Portal%' (tìm được tất cả hệ thống có chứa 'Portal')

---

{"NGỮCẢNH HỘI THOẠI (dùng để hiểu câu hỏi tiếp theo):" if context else ""}
{f'''
Câu hỏi trước: {context.get("previous_query", "")}
Câu trả lời trước: {context.get("previous_answer", "")}
SQL query trước: {context.get("previous_sql", "")}

LƯU Ý: Nếu câu hỏi hiện tại có từ "này", "đó", "của nó", "hệ thống đó" → tham chiếu đến thông tin từ câu hỏi trước
''' if context else ""}
Câu hỏi hiện tại: {query}

NHIỆM VỤ:
1. Tạo SQL query để lấy dữ liệu (học theo examples)
2. Viết câu trả lời NGẮN GỌN (1-2 câu) sử dụng placeholder

QUAN TRỌNG:
- LUÔN có WHERE is_deleted = false khi query bảng systems
- Dùng field _gb (NUMERIC) cho tính toán, field TEXT chỉ để hiển thị
- Placeholder: {{{{column_name}}}} hoặc [column_name]
- **KHI VIẾT CÂU TRẢ LỜI: Dùng tên tiếng Việt (canonical name) của field, KHÔNG dùng database field name**
  VD: Viết "Tên hệ thống" thay vì "system_name", "Trạng thái" thay vì "status"
- **KHI LỌC THEO TÊN HỆ THỐNG: Dùng ILIKE với % (full-text search), KHÔNG dùng = (exact match)**
  VD: system_name ILIKE '%Portal%' thay vì system_name = 'Portal VNNIC'
  Lý do: Exact search rất khó vì user không nhớ chính xác tên đầy đủ

Trả về JSON:
{{
    "sql": "SELECT query here",
    "answer": "Câu trả lời với {{{{column_name}}}} placeholder"
}}

CHỈ trả về JSON."""

            try:
                phase1_content = call_ai_internal(quick_prompt, [{'role': 'user', 'content': query}], 'SQL Generation + Answer')
                json_match = re.search(r'\{[\s\S]*\}', phase1_content)
                if json_match:
                    phase1_data = json.loads(json_match.group())
                else:
                    phase1_data = {'sql': None, 'answer': 'Không thể xử lý yêu cầu này.'}

                sql_query = phase1_data.get('sql')
                answer = phase1_data.get('answer')

                # Emit phase 1 complete with details (like Deep mode)
                yield f"event: phase_complete\ndata: {json.dumps({'phase': 1, 'sql': sql_query, 'answer_template': answer})}\n\n"

            except Exception as e:
                logger.error(f"Quick mode phase 1 error: {e}")
                # Update request log with error status
                request_log.status = 'error'
                request_log.error_message = str(e)
                request_log.completed_at = timezone.now()
                request_log.total_duration_ms = int((request_log.completed_at - request_log.started_at).total_seconds() * 1000)
                request_log.save(update_fields=['status', 'error_message', 'completed_at', 'total_duration_ms'])
                yield f"event: error\ndata: {json.dumps({'error': 'Lỗi xử lý', 'detail': str(e)})}\n\n"
                return

            if not sql_query:
                yield f"event: complete\ndata: {json.dumps({'query': query, 'response': {'greeting': '', 'main_answer': answer or 'Không thể tạo truy vấn cho yêu cầu này.', 'follow_up_suggestions': []}, 'data': None, 'mode': 'quick'})}\n\n"
                return

            # Phase 2: Execute SQL
            yield f"event: phase_start\ndata: {json.dumps({'phase': 2, 'name': 'Truy vấn dữ liệu', 'description': 'Đang lấy dữ liệu...', 'mode': 'quick'})}\n\n"

            query_result, sql_error = validate_and_execute_sql_internal(sql_query)
            if query_result is None:
                yield f"event: error\ndata: {json.dumps({'error': 'Lỗi truy vấn dữ liệu', 'detail': sql_error})}\n\n"
                return

            # 🎯 POST-PROCESS: If query is just COUNT, also fetch system list for visualization
            # KEEP BOTH results: original for answer, system list for visualization
            sql_upper = sql_query.upper()
            is_count_only = (
                'COUNT(*)' in sql_upper and
                'FROM SYSTEMS' in sql_upper and
                len(query_result.get('columns', [])) == 1 and
                query_result.get('columns', [None])[0].lower() == 'count'
            )

            answer_data = query_result  # Original query result for answer generation
            viz_data = query_result     # Will be replaced with system list if COUNT-only

            if is_count_only:
                logger.info("[POLICY-SSE] Detected COUNT-only query, fetching system list for visualization...")
                # Fetch system list with IDs for visualization
                supplementary_sql = """
                SELECT
                    s.id,
                    s.system_name,
                    s.system_code,
                    s.status,
                    o.id AS org_id,
                    o.name AS organization_name
                FROM systems s
                JOIN organizations o ON s.org_id = o.id
                WHERE s.is_deleted = false
                LIMIT 100
                """
                system_list, list_error = validate_and_execute_sql_internal(supplementary_sql)

                if system_list is not None:
                    logger.info(f"[POLICY-SSE] Fetched {len(system_list.get('rows', []))} systems for visualization")
                    # Keep original query_result for answer, use system_list for visualization
                    viz_data = system_list
                    logger.info(f"[POLICY-SSE] Using COUNT data for answer, system list for visualization")
                else:
                    logger.warning(f"[POLICY-SSE] Failed to fetch system list: {list_error}")

            # Check if result is empty (0 rows) - retry once with SQL review
            if query_result.get('total_rows', 0) == 0:
                yield f"event: phase_complete\ndata: {json.dumps({'phase': 2, 'total_rows': 0, 'retry': True})}\n\n"

                # Phase 2.5: Review and fix SQL
                yield f"event: phase_start\ndata: {json.dumps({'phase': 2.5, 'name': 'Kiểm tra SQL', 'description': 'Kết quả trống - đang kiểm tra và sửa SQL...', 'mode': 'quick'})}\n\n"

                review_prompt = f"""SQL query trả về 0 kết quả. Hãy kiểm tra và sửa lại SQL.

SQL hiện tại:
{sql_query}

Câu hỏi gốc: {query}

{schema_context}

KIỂM TRA:
1. WHERE clause có đúng không? (nhớ is_deleted = false)
2. JOIN có thiếu không?
3. Column names có chính xác không?
4. Logic có sai không?

Trả về JSON:
{{
    "issue": "Mô tả vấn đề tìm thấy",
    "fixed_sql": "SELECT query đã sửa (hoặc null nếu SQL đúng)",
    "explanation": "Giải thích ngắn gọn"
}}

CHỈ trả về JSON."""

                try:
                    review_content = call_ai_internal(review_prompt, [{'role': 'user', 'content': query}], 'SQL Review')
                    json_match = re.search(r'\{[\s\S]*\}', review_content)

                    if json_match:
                        review_data = json.loads(json_match.group())
                        fixed_sql = review_data.get('fixed_sql')

                        if fixed_sql and fixed_sql != sql_query:
                            logger.info(f"SQL reviewed: {review_data.get('explanation')}")
                            yield f"event: phase_complete\ndata: {json.dumps({'phase': 2.5, 'issue': review_data.get('issue'), 'fixed': True})}\n\n"

                            # Retry with fixed SQL
                            yield f"event: phase_start\ndata: {json.dumps({'phase': 2.6, 'name': 'Thử lại truy vấn', 'description': 'Đang chạy SQL đã sửa...', 'mode': 'quick'})}\n\n"

                            retry_result, retry_error = validate_and_execute_sql_internal(fixed_sql)
                            if retry_result and retry_result.get('total_rows', 0) > 0:
                                query_result = retry_result
                                sql_query = fixed_sql  # Update for logging
                                # Include sample rows for debugging
                                sample_rows = query_result.get('rows', [])[:5]
                                # Serialize data to handle Decimal and date types
                                phase_data = serialize_for_json({
                                    'phase': 2.6,
                                    'total_rows': query_result.get('total_rows', 0),
                                    'sample_rows': sample_rows,
                                    'columns': query_result.get('columns', []),
                                    'success': True
                                })
                                yield f"event: phase_complete\ndata: {json.dumps(phase_data)}\n\n"
                            else:
                                # Still 0 results after retry
                                yield f"event: phase_complete\ndata: {json.dumps({'phase': 2.6, 'total_rows': 0, 'success': False})}\n\n"
                        else:
                            # SQL is correct, 0 is expected result
                            yield f"event: phase_complete\ndata: {json.dumps({'phase': 2.5, 'issue': 'SQL đúng - kết quả thực sự là 0', 'fixed': False})}\n\n"

                except Exception as e:
                    logger.error(f"SQL review error: {e}")
                    yield f"event: phase_complete\ndata: {json.dumps({'phase': 2.5, 'error': str(e)})}\n\n"
            else:
                # Include sample rows for debugging (more rows for detailed analysis)
                sample_rows = query_result.get('rows', [])[:15]  # First 15 rows for detailed view
                # Serialize data to handle Decimal and date types
                phase_data = serialize_for_json({
                    'phase': 2,
                    'total_rows': query_result.get('total_rows', 0),
                    'sample_rows': sample_rows,
                    'columns': query_result.get('columns', [])
                })
                yield f"event: phase_complete\ndata: {json.dumps(phase_data)}\n\n"

            # Replace template variables in answer with actual data
            # AI might return "{{column_name}}" or "[column_name]" which needs to be replaced
            def replace_template_vars(text, data):
                """Replace template variables with actual data from query result"""
                if not text:
                    return text

                # Get first row for template replacement
                first_row = data.get('rows', [{}])[0] if data.get('rows') else {}

                # Replacement function that looks up value from data
                def replace_match(match):
                    var_name = match.group(1)  # Get column name from {{var}} or [var]
                    value = first_row.get(var_name)
                    if value is not None:
                        return str(value)
                    # CRITICAL FIX: Return "0" for missing values, not the variable name
                    logger.warning(f"Template variable '{var_name}' not found in data, using '0'")
                    return "0"

                import re
                # Replace all possible template patterns
                result = re.sub(r'\{\{(\w+)\}\}', replace_match, text)  # {{variable}}
                result = re.sub(r'\[(\w+)\]', replace_match, result)     # [variable]
                result = re.sub(r'\{(\w+)\}', replace_match, result)     # {variable}
                result = re.sub(r'<(\w+)>', replace_match, result)       # <variable>

                # Replace standalone "X" placeholder with count/total from data
                # Check for " X " (with spaces) or X at word boundaries
                if re.search(r'\bX\b', result):
                    count_value = first_row.get('count', first_row.get('total', first_row.get('total_systems', '0')))
                    result = re.sub(r'\bX\b', str(count_value), result)

                return result

            # Process answer to replace any template variables
            # Use answer_data (original COUNT result) for answer generation
            processed_answer = replace_template_vars(answer, answer_data)

            # Generate strategic follow-up suggestions based on query context
            def generate_strategic_suggestions(query_text, data):
                """Generate strategic follow-up questions for leadership decision-making"""
                query_lower = query_text.lower()

                # Default strategic suggestions
                suggestions = []

                # Context-aware suggestions based on query type
                if any(word in query_lower for word in ['bao nhiêu', 'số lượng', 'count', 'tổng']):
                    suggestions = [
                        'Đánh giá rủi ro của các hệ thống này?',
                        'Phân tích xu hướng tăng trưởng trong 3 năm qua?',
                        'Ưu tiên đầu tư nâng cấp cho hệ thống nào?'
                    ]
                elif any(word in query_lower for word in ['an toàn', 'bảo mật', 'attt', 'security', 'mfa', 'firewall']):
                    suggestions = [
                        'Lộ trình tăng cường ATTT cho các hệ thống yếu?',
                        'Ước tính ngân sách cần thiết cho bảo mật?',
                        'Hệ thống nào cần ưu tiên audit ATTT ngay?'
                    ]
                elif any(word in query_lower for word in ['công nghệ', 'tech', 'framework', 'ngôn ngữ', 'database']):
                    suggestions = [
                        'Rủi ro công nghệ lỗi thời trong các hệ thống?',
                        'Kế hoạch hiện đại hóa công nghệ?',
                        'Nguồn lực cần thiết để nâng cấp công nghệ?'
                    ]
                elif any(word in query_lower for word in ['dung lượng', 'storage', 'data', 'dữ liệu']):
                    suggestions = [
                        'Dự báo nhu cầu lưu trữ trong 2-3 năm tới?',
                        'Ngân sách cho hạ tầng lưu trữ?',
                        'Tối ưu hóa chi phí lưu trữ dữ liệu?'
                    ]
                elif any(word in query_lower for word in ['tích hợp', 'api', 'integration', 'liên thông']):
                    suggestions = [
                        'Lộ trình tích hợp và liên thông dữ liệu?',
                        'Rủi ro từ tích hợp chưa chuẩn hóa?',
                        'Ưu tiên tích hợp hệ thống nào trước?'
                    ]
                else:
                    # Generic strategic suggestions
                    suggestions = [
                        'Đánh giá rủi ro tổng thể hệ thống?',
                        'Ưu tiên đầu tư ngân sách cho mảng nào?',
                        'Lộ trình chuyển đổi số trong 3 năm tới?'
                    ]

                return suggestions[:3]  # Return max 3 suggestions

            # Generate strategic suggestions based on answer data
            strategic_suggestions = generate_strategic_suggestions(query, answer_data)

            # STEP 2: Generate interactive visualization AFTER answer is ready
            # This 2-step approach ensures better quality: answer first, then visualization
            # Use viz_data (system list with IDs) for rich visualization with hyperlinks
            visualization_html = generate_visualization(viz_data, query, request)

            # NEW: Also generate structured data for React components
            visualization_data = generate_visualization_data(viz_data, query, request)

            # Final result (no Phase 3, no Phase 4 for quick mode)
            final_response = {
                'query': query,
                'thinking': {'plan': 'Quick analysis', 'tasks': []},
                'response': {
                    'greeting': '',
                    'main_answer': processed_answer or answer or f'Tìm thấy **{answer_data.get("total_rows", 0)}** kết quả.',
                    'follow_up_suggestions': strategic_suggestions,
                    'visualization_html': visualization_html,  # Legacy HTML visualization
                    'visualization_data': visualization_data   # NEW: Structured data for React components
                },
                'data': viz_data,  # Use viz_data (system list) for rich display
                'mode': 'quick'
            }

            # Update request log with completion data
            request_log.completed_at = timezone.now()
            request_log.total_duration_ms = int((request_log.completed_at - request_log.started_at).total_seconds() * 1000)
            request_log.total_cost_usd = request_log.calculate_total_cost()
            request_log.tasks = [
                {'name': 'SQL Generation & Answer', 'status': 'completed'},
                {'name': 'SQL Execution', 'status': 'completed'},
            ]
            request_log.save(update_fields=['completed_at', 'total_duration_ms', 'total_cost_usd', 'tasks'])

            yield f"event: complete\ndata: {json.dumps(final_response, ensure_ascii=False, default=str)}\n\n"

        response = StreamingHttpResponse(event_stream(), content_type='text/event-stream')
        response['Cache-Control'] = 'no-cache'
        response['X-Accel-Buffering'] = 'no'
        response['Connection'] = 'keep-alive'
        return response

    def _deep_analysis_stream(self, query, user, context=None, request=None):
        """
        Deep Mode: Full 4-phase workflow (~12-20s)
        context: Optional dict with previous_query, previous_answer, previous_sql for follow-up questions

        Existing logic with strategic insights and self-review.
        """
        def event_stream():
            import re
            import requests
            import threading
            import time

            # API Configuration
            CLAUDE_API_KEY = getattr(settings, 'CLAUDE_API_KEY', None)
            OPENAI_API_KEY = getattr(settings, 'OPENAI_API_KEY', None)

            use_claude = bool(CLAUDE_API_KEY)
            use_openai = bool(OPENAI_API_KEY)

            if not use_claude and not use_openai:
                yield f"event: error\ndata: {json.dumps({'error': 'AI service not configured'})}\n\n"
                return

            # Keep-alive event to prevent connection timeout
            stop_keep_alive = threading.Event()
            def send_keep_alive():
                while not stop_keep_alive.is_set():
                    time.sleep(10)  # Send every 10 seconds
                    if not stop_keep_alive.is_set():
                        yield f"event: keep_alive\ndata: {json.dumps({'timestamp': time.time()})}\n\n"

            # Start keep-alive thread
            keep_alive_thread = threading.Thread(target=lambda: list(send_keep_alive()))
            keep_alive_thread.daemon = True
            keep_alive_thread.start()

            # Helper function to call AI with reduced timeout
            def call_ai_internal(system_prompt, messages):
                if use_openai:
                    # Use OpenAI Responses API for reasoning models (GPT-5.2)
                    # https://platform.openai.com/docs/guides/reasoning
                    import openai
                    client = openai.OpenAI(
                        api_key=OPENAI_API_KEY,
                        timeout=45.0  # Reduced from 60s to 45s for faster fail
                    )

                    # Build input array with system prompt and user messages
                    input_array = [{'role': 'developer', 'content': system_prompt}]
                    input_array.extend(messages)

                    response = client.responses.create(
                        model='gpt-5.2',
                        reasoning={'effort': 'medium'},
                        input=input_array,
                        max_output_tokens=16000,
                    )
                    return response.output_text
                elif use_claude:
                    import anthropic
                    client = anthropic.Anthropic(
                        api_key=CLAUDE_API_KEY,
                        timeout=60.0  # 60 second timeout
                    )
                    response = client.messages.create(
                        model='claude-sonnet-4-20250514',
                        max_tokens=4096,
                        system=system_prompt,
                        messages=messages
                    )
                    return response.content[0].text

            # SQL validation function
            def validate_and_execute_sql_internal(sql):
                from django.db import connection
                import re
                sql_upper = sql.upper().strip()
                # Use word boundaries to avoid matching keywords within identifiers (e.g., "DELETE" in "IS_DELETED")
                forbidden_pattern = r'\b(DROP|DELETE|UPDATE|INSERT|ALTER|CREATE|TRUNCATE)\b'
                if re.search(forbidden_pattern, sql_upper):
                    return None, "Only SELECT queries allowed"
                try:
                    with connection.cursor() as cursor:
                        cursor.execute(sql)
                        columns = [col[0] for col in cursor.description] if cursor.description else []
                        rows = cursor.fetchall()
                        result = {
                            'columns': columns,
                            'rows': [dict(zip(columns, row)) for row in rows],
                            'total_rows': len(rows)
                        }
                        return result, None
                except Exception as e:
                    return None, str(e)

            # ====== START STREAMING ======

            # Phase 1: SQL Generation
            yield f"event: phase_start\ndata: {json.dumps({'phase': 1, 'name': 'Phân tích yêu cầu', 'description': 'Đang phân tích câu hỏi và tạo truy vấn SQL...'})}\n\n"

            # Schema context (abbreviated for SSE) - WITH VIETNAMESE LABELS
            schema_context = """Database Schema (với tên tiếng Việt):

- organizations:
  id, name (Tên tổ chức), code (Mã), description (Mô tả), contact_person (Người liên hệ)

- systems (Bảng hệ thống chính):
  id, system_name (Tên hệ thống), system_code (Mã hệ thống), status (Trạng thái),
  criticality_level (Mức độ quan trọng), org_id (Tổ chức),
  hosting_platform (Nền tảng triển khai), has_encryption (Mã hóa dữ liệu), is_deleted,
  storage_capacity (Dung lượng lưu trữ - TEXT), data_volume (Khối lượng dữ liệu - TEXT),
  data_volume_gb (Khối lượng dữ liệu GB - NUMERIC),
  programming_language (Ngôn ngữ lập trình), framework (Framework/Thư viện),
  database_name (Cơ sở dữ liệu),
  users_total (Tổng người dùng), users_mau (MAU), users_dau (DAU),
  total_accounts (Tổng số tài khoản),
  api_provided_count (Số API cung cấp), api_consumed_count (Số API tiêu thụ),
  authentication_method (Phương thức xác thực), compliance_standards_list (Chuẩn tuân thủ),
  business_owner (Người chịu trách nhiệm), technical_owner (Người quản trị kỹ thuật),
  go_live_date (Thời gian đưa vào vận hành),
  server_configuration (Cấu hình máy chủ), backup_plan (Phương án sao lưu),
  disaster_recovery_plan (Kế hoạch khôi phục thảm họa)

- system_architecture (Kiến trúc hệ thống):
  system_id, architecture_type (Loại kiến trúc), backend_tech (Backend Technology),
  frontend_tech (Frontend Technology), database_type (Loại CSDL), mobile_app (Ứng dụng di động),
  hosting_type (Loại hosting), cloud_provider (Nhà cung cấp cloud),
  api_style (API Style), has_cicd (CI/CD Pipeline), cicd_tool (CI/CD Tool),
  is_multi_tenant (Multi-tenant), containerization (Container hóa)

- system_assessment (Đánh giá hệ thống):
  system_id, performance_rating (Đánh giá hiệu năng), recommendation (Đề xuất của đơn vị),
  uptime_percent (Thời gian hoạt động %), technical_debt_level (Mức nợ kỹ thuật),
  needs_replacement (Cần thay thế), modernization_priority (Ưu tiên hiện đại hóa)

- system_data_info (Thông tin dữ liệu):
  system_id, data_classification (Phân loại dữ liệu),
  storage_size_gb (Dung lượng CSDL hiện tại GB - NUMERIC),
  growth_rate_percent (Tốc độ tăng trưởng dữ liệu %),
  has_personal_data (Có dữ liệu cá nhân), has_sensitive_data (Có dữ liệu nhạy cảm),
  record_count (Số bản ghi)

- system_integration (Tích hợp hệ thống):
  system_id, has_api_gateway (Có API Gateway), integration_count (Số tích hợp),
  api_provided_count (Số API cung cấp), api_consumed_count (Số API tiêu thụ),
  has_integration (Có tích hợp), uses_standard_api (Dùng API chuẩn),
  api_gateway_name (Tên API Gateway)

- system_security (An toàn thông tin):
  system_id, auth_method (Phương thức xác thực), has_mfa (Có MFA), has_rbac (Có RBAC),
  has_data_encryption_at_rest (Mã hóa dữ liệu lưu trữ),
  has_data_encryption_in_transit (Mã hóa dữ liệu truyền tải),
  has_firewall (Có Firewall), has_waf (Có WAF), has_ids_ips (Có IDS/IPS),
  has_antivirus (Có Antivirus),
  last_security_audit_date (Ngày audit ATTT gần nhất),
  has_vulnerability_scanning (Có quét lỗ hổng)

Lưu ý quan trọng:
- QUAN TRỌNG: LUÔN LUÔN dùng WHERE is_deleted = false khi query bảng systems
- CHÍNH XÁC: CHỈ dùng columns có trong schema. KHÔNG dùng scalability_level, integration_level, organization_type
- storage_capacity, data_volume là TEXT (100GB, 1TB) - chỉ để hiển thị, KHÔNG dùng cho SUM/AVG
- data_volume_gb, storage_size_gb là NUMERIC - dùng để tính SUM/AVG
- Khi user hỏi bằng tiếng Việt, map sang đúng field name tiếng Anh trong database"""

            # Get active improvement policies from user feedback
            policies_text = self._get_active_policies_text()

            phase1_prompt = f"""Bạn là AI assistant chuyên phân tích dữ liệu hệ thống CNTT cho Bộ KH&CN.

QUAN TRỌNG - NGỮ CẢNH:
Người dùng đang HỎI VỀ DỮ LIỆU được khai báo trong database, KHÔNG phải hỏi về database engine/infrastructure.

{schema_context}
{policies_text}
VÍ DỤ CÁCH XỬ LÝ:

Example 1 - Phân tích tình trạng hệ thống:
User: "Phân tích tình trạng hệ thống hiện tại"
Thinking: {{"plan": "Lấy thống kê tổng quan về số lượng, trạng thái, công nghệ, an toàn thông tin", "tasks": ["Đếm tổng số hệ thống", "Thống kê theo trạng thái", "Phân tích công nghệ", "Kiểm tra ATTT"]}}
SQL: SELECT s.status, COUNT(*) as count, COUNT(CASE WHEN ss.has_mfa = true THEN 1 END) as has_mfa_count, COUNT(CASE WHEN ss.has_firewall = true THEN 1 END) as has_firewall_count FROM systems s LEFT JOIN system_security ss ON s.id = ss.system_id WHERE s.is_deleted = false GROUP BY s.status
Xử lý: Deep mode cần SQL phức tạp hơn với JOIN nhiều bảng, GROUP BY, CASE WHEN để phân tích sâu

Example 2 - Hệ thống cần nâng cấp:
User: "Hệ thống nào cần nâng cấp?"
Thinking: {{"plan": "Tìm hệ thống có modernization_priority cao, technical_debt_level cao, needs_replacement = true", "tasks": ["Query bảng assessment", "JOIN với systems", "Filter theo điều kiện"]}}
SQL: SELECT s.system_name, sa.technical_debt_level, sa.modernization_priority, sa.recommendation FROM systems s JOIN system_assessment sa ON s.id = sa.system_id WHERE s.is_deleted = false AND (sa.needs_replacement = true OR sa.modernization_priority IN ('high', 'critical') OR sa.technical_debt_level IN ('high', 'critical')) ORDER BY sa.modernization_priority DESC, sa.technical_debt_level DESC
Xử lý: JOIN system_assessment, multiple conditions trong WHERE, ORDER BY priority

Example 3 - Đánh giá rủi ro ATTT:
User: "Đánh giá rủi ro bảo mật?"
Thinking: {{"plan": "Phân tích các hệ thống thiếu biện pháp ATTT: không có MFA, Firewall, WAF, mã hóa", "tasks": ["Query system_security", "Đếm hệ thống thiếu từng biện pháp", "Tính phần trăm"]}}
SQL: SELECT COUNT(*) as total_systems, COUNT(CASE WHEN ss.has_mfa = false OR ss.has_mfa IS NULL THEN 1 END) as no_mfa, COUNT(CASE WHEN ss.has_firewall = false OR ss.has_firewall IS NULL THEN 1 END) as no_firewall, COUNT(CASE WHEN ss.has_waf = false OR ss.has_waf IS NULL THEN 1 END) as no_waf, COUNT(CASE WHEN ss.has_data_encryption_at_rest = false OR ss.has_data_encryption_at_rest IS NULL THEN 1 END) as no_encryption FROM systems s LEFT JOIN system_security ss ON s.id = ss.system_id WHERE s.is_deleted = false
Xử lý: Multiple CASE WHEN để đếm nhiều điều kiện, LEFT JOIN để bao gồm cả hệ thống chưa có security info

Example 4 - Phân tích hệ thống theo tên (FULL-TEXT SEARCH):
User: "Phân tích chi tiết các hệ thống Portal"
Thinking: {{"plan": "Tìm tất cả hệ thống có chứa 'Portal' trong tên, JOIN các bảng để lấy thông tin chi tiết về công nghệ, ATTT, đánh giá", "tasks": ["Query systems với ILIKE", "JOIN security info", "JOIN assessment", "Aggregate data"]}}
SQL: SELECT s.system_name, s.status, s.programming_language, s.organization, ss.has_mfa, ss.has_firewall, sa.technical_debt_level, sa.modernization_priority FROM systems s LEFT JOIN system_security ss ON s.id = ss.system_id LEFT JOIN system_assessment sa ON s.id = sa.system_id WHERE s.is_deleted = false AND s.system_name ILIKE '%Portal%' ORDER BY s.system_name
Xử lý: QUAN TRỌNG - Dùng ILIKE '%keyword%' để full-text search, KHÔNG dùng = 'exact name'. Multiple LEFT JOIN để lấy thông tin từ nhiều bảng
Lý do: ILIKE linh hoạt hơn exact match, tìm được nhiều hệ thống liên quan
VÍ DỤ: Câu hỏi "Portal" sẽ tìm được: "Portal VNNIC", "Portal Cục SHTT", "Portal thông tin", etc.

---

{"NGỮCẢNH HỘI THOẠI (dùng để hiểu câu hỏi tiếp theo):" if context else ""}
{f'''
Câu hỏi trước: {context.get("previous_query", "")}
Câu trả lời trước: {context.get("previous_answer", "")}
SQL query trước: {context.get("previous_sql", "")}

LƯU Ý: Nếu câu hỏi hiện tại có từ "này", "đó", "của nó", "hệ thống đó" → tham chiếu đến thông tin từ câu hỏi trước
''' if context else ""}
Câu hỏi hiện tại: {query}

NHIỆM VỤ:
1. Phân tích sâu câu hỏi (thinking)
2. Tạo SQL query phức tạp với JOIN, GROUP BY, CASE WHEN nếu cần
3. Chọn chart type phù hợp

QUAN TRỌNG:
- LUÔN có WHERE is_deleted = false
- Deep mode cần SQL chi tiết hơn Quick mode
- Dùng LEFT JOIN nếu có thể thiếu data trong bảng phụ
- CASE WHEN để tính toán conditional aggregates
- **KHI VIẾT CÂU TRẢ LỜI: Dùng tên tiếng Việt (canonical name) của field, KHÔNG dùng database field name**
  VD: Viết "Tên hệ thống" thay vì "system_name", "Trạng thái" thay vì "status"
- **KHI LỌC THEO TÊN HỆ THỐNG: Dùng ILIKE với % (full-text search), KHÔNG dùng = (exact match)**
  VD: system_name ILIKE '%Portal%' thay vì system_name = 'Portal VNNIC'
  Lý do: Exact search rất khó vì user không nhớ chính xác tên đầy đủ

🎯 **POLICY BẮT BUỘC: LUÔN FETCH SYSTEM LIST CHO VISUALIZATION**
Bất kỳ câu hỏi nào liên quan đến hệ thống, SQL query PHẢI:
1. **Trả về DANH SÁCH systems** (không chỉ COUNT/SUM/AVG)
2. **LUÔN bao gồm để tạo hyperlinks**: s.id, s.system_name, s.system_code, s.status, o.id AS org_id, o.name AS organization_name
3. **Ví dụ**:
   ❌ SAI: SELECT COUNT(*) FROM systems
   ✅ ĐÚNG: SELECT s.id, s.system_name, s.system_code, s.status, o.id AS org_id, o.name AS organization_name FROM systems s JOIN organizations o ON s.org_id = o.id WHERE s.is_deleted = false
4. **Áp dụng cho mọi câu hỏi**: "Có bao nhiêu?", "Top 5", "Hệ thống nào", "Đơn vị nào" → đều trả về list với full details
5. **Mục đích**: D3.js visualization cần id/name để tạo clickable links đến system detail và org dashboard

Trả về JSON:
{{
    "thinking": {{"plan": "Kế hoạch phân tích chi tiết", "tasks": ["task1", "task2", "..."]}},
    "sql": "SELECT query here (có thể phức tạp với nhiều JOIN)"
}}

CHỈ trả về JSON."""

            try:
                # Progress: Calling AI
                yield f"event: progress\ndata: {json.dumps({'message': 'Đang gọi AI tạo truy vấn SQL...'})}\n\n"

                phase1_content = call_ai_internal(phase1_prompt, [{'role': 'user', 'content': query}])

                # Progress: Processing response
                yield f"event: progress\ndata: {json.dumps({'message': 'Đang xử lý kết quả AI...'})}\n\n"

                json_match = re.search(r'\{[\s\S]*\}', phase1_content)
                if json_match:
                    phase1_data = json.loads(json_match.group())
                else:
                    phase1_data = {'thinking': {'plan': 'Direct response'}, 'sql': None}

                thinking = phase1_data.get('thinking', {})
                sql_query = phase1_data.get('sql')

                yield f"event: phase_complete\ndata: {json.dumps({'phase': 1, 'thinking': thinking, 'sql': sql_query})}\n\n"

            except Exception as e:
                logger.error(f"Phase 1 error: {e}")
                yield f"event: error\ndata: {json.dumps({'error': 'Lỗi phân tích yêu cầu', 'detail': str(e)})}\n\n"
                return

            if not sql_query:
                yield f"event: complete\ndata: {json.dumps({'query': query, 'thinking': thinking, 'response': {'greeting': 'Báo cáo anh/chị,', 'main_answer': 'Không thể tạo truy vấn cho yêu cầu này.', 'follow_up_suggestions': []}, 'data': None})}\n\n"
                return

            # Phase 1.5: Smart Data Details - Skip for simple queries
            # Determine if query needs enhancement based on complexity
            needs_enhancement = False
            sql_upper = sql_query.upper()

            # Skip Phase 1.5 if query is simple (single table COUNT/SUM without GROUP BY)
            is_simple_count = 'COUNT(*)' in sql_upper and 'GROUP BY' not in sql_upper and 'JOIN' not in sql_upper
            is_simple_sum = 'SUM(' in sql_upper and 'GROUP BY' not in sql_upper and 'JOIN' not in sql_upper

            # Run Phase 1.5 for complex queries that benefit from context
            has_group_by = 'GROUP BY' in sql_upper
            has_order_by = 'ORDER BY' in sql_upper
            has_filter = 'WHERE' in sql_upper and sql_upper.count('WHERE') > 1  # Multiple conditions

            needs_enhancement = (has_group_by or has_order_by or has_filter) and not (is_simple_count or is_simple_sum)

            if needs_enhancement:
                yield f"event: phase_start\ndata: {json.dumps({'phase': 1.5, 'name': 'Phân tích nhu cầu dữ liệu', 'description': 'Đang phân tích dữ liệu bổ sung cần thiết cho quyết định...'})}\n\n"

                phase15_prompt = f"""Bạn là AI chuyên về database và analytics cho lãnh đạo.

QUAN TRỌNG - NGỮ CẢNH:
User đang hỏi về DỮ LIỆU được khai báo trong database (các hệ thống CNTT), KHÔNG phải về database engine.
- "Dung lượng CSDL" = data_volume_gb (numeric, dùng cho SUM/AVG)
- "Số lượng" = COUNT(systems)
- storage_capacity, data_volume là TEXT fields - chỉ dùng để hiển thị
KHÔNG liên quan đến: PostgreSQL size, table count, database performance metrics.

SQL hiện tại:
```sql
{sql_query}
```

Câu hỏi gốc: "{query}"

Schema context:
{schema_context}
{policies_text}
NHIỆM VỤ:
1. Phân tích: Lãnh đạo sẽ cần thêm thông tin gì để ra quyết định tốt hơn?
2. Tăng cường SQL với:
   - JOIN thêm bảng liên quan (organizations, system_security, system_assessment, etc.)
   - SELECT thêm columns hữu ích (tên đơn vị, mức bảo mật, đánh giá, khuyến nghị)
   - GIỮ NGUYÊN logic WHERE, GROUP BY, ORDER BY
   - Đảm bảo SQL vẫn valid và không thay đổi câu trả lời chính

3. Trả về JSON:
{{
    "analysis": "Lãnh đạo có thể cần xem thêm [thông tin gì] để [mục đích gì]",
    "enhanced_sql": "SELECT ... với JOIN và columns bổ sung",
    "added_info": ["Tên đơn vị: giúp định danh", "Mức bảo mật: đánh giá rủi ro"]
}}

CHỈ trả về JSON, không giải thích."""

                try:
                    phase15_content = call_ai_internal(phase15_prompt, [])

                    # Parse JSON
                    json_match = re.search(r'\{[\s\S]*\}', phase15_content)
                    if json_match:
                        phase15_data = json.loads(json_match.group())
                        analysis = phase15_data.get('analysis', 'Đã phân tích nhu cầu dữ liệu bổ sung')
                        enhanced_sql = phase15_data.get('enhanced_sql', sql_query)
                        added_info = phase15_data.get('added_info', [])

                        # Use enhanced SQL if valid (basic check)
                        if enhanced_sql and 'SELECT' in enhanced_sql.upper() and 'FROM' in enhanced_sql.upper():
                            sql_query = enhanced_sql
                            thinking['enhanced_sql'] = True
                            thinking['data_analysis'] = analysis
                            thinking['added_fields'] = added_info

                        yield f"event: phase_complete\ndata: {json.dumps({'phase': 1.5, 'analysis': analysis, 'enhanced': True, 'added_info': added_info})}\n\n"
                    else:
                        # Fallback: use original SQL
                        yield f"event: phase_complete\ndata: {json.dumps({'phase': 1.5, 'analysis': 'Sử dụng SQL gốc', 'enhanced': False})}\n\n"

                except Exception as e:
                    logger.error(f"Phase 1.5 error: {e}")
                    # Non-critical error, continue with original SQL
                    yield f"event: phase_complete\ndata: {json.dumps({'phase': 1.5, 'analysis': 'Sử dụng SQL gốc', 'enhanced': False})}\n\n"
            else:
                # Skip Phase 1.5 for simple queries
                logger.info(f"Skipping Phase 1.5 for simple query: {sql_query[:100]}")

            # Phase 2: Execute SQL (now using enhanced SQL if available)
            yield f"event: phase_start\ndata: {json.dumps({'phase': 2, 'name': 'Truy vấn dữ liệu', 'description': 'Đang thực thi truy vấn SQL tăng cường...'})}\n\n"

            query_result, sql_error = validate_and_execute_sql_internal(sql_query)

            if query_result is None:
                yield f"event: error\ndata: {json.dumps({'error': 'Lỗi truy vấn dữ liệu', 'detail': sql_error})}\n\n"
                return

            # Check if result is empty (0 rows) - retry once with SQL review (Deep mode)
            if query_result.get('total_rows', 0) == 0:
                yield f"event: phase_complete\ndata: {json.dumps({'phase': 2, 'total_rows': 0, 'retry': True})}\n\n"

                # Phase 2.5: Review and fix SQL
                yield f"event: phase_start\ndata: {json.dumps({'phase': 2.5, 'name': 'Kiểm tra SQL', 'description': 'Kết quả trống - đang phân tích và sửa SQL...', 'mode': 'deep'})}\n\n"

                review_prompt = f"""SQL query trả về 0 kết quả trong Deep mode. Phân tích và sửa lỗi.

SQL hiện tại:
{sql_query}

Câu hỏi: {query}

{schema_context}

PHÂN TÍCH:
1. WHERE conditions có đúng không?
2. JOIN logic có sai không?
3. Column names có tồn tại không?
4. Có thể data thực sự không có không?

Trả về JSON:
{{
    "analysis": "Phân tích chi tiết vấn đề",
    "fixed_sql": "SELECT query đã sửa (hoặc null nếu 0 là kết quả đúng)",
    "is_valid_empty": true/false  (true nếu 0 là kết quả hợp lệ)
}}

CHỈ trả về JSON."""

                try:
                    review_content = call_ai_internal(review_prompt, [{'role': 'user', 'content': query}], 'Deep SQL Review')
                    json_match = re.search(r'\{[\s\S]*\}', review_content)

                    if json_match:
                        review_data = json.loads(json_match.group())
                        fixed_sql = review_data.get('fixed_sql')
                        is_valid_empty = review_data.get('is_valid_empty', False)

                        if fixed_sql and not is_valid_empty:
                            logger.info(f"Deep mode SQL reviewed: {review_data.get('analysis')}")
                            yield f"event: phase_complete\ndata: {json.dumps({'phase': 2.5, 'analysis': review_data.get('analysis'), 'fixed': True})}\n\n"

                            # Retry with fixed SQL
                            yield f"event: phase_start\ndata: {json.dumps({'phase': 2.6, 'name': 'Thử lại truy vấn', 'description': 'Đang chạy SQL đã tối ưu...', 'mode': 'deep'})}\n\n"

                            retry_result, retry_error = validate_and_execute_sql_internal(fixed_sql)
                            if retry_result and retry_result.get('total_rows', 0) > 0:
                                query_result = retry_result
                                sql_query = fixed_sql
                                # Include sample rows for debugging (15 rows for detail)
                                sample_rows = query_result.get('rows', [])[:15]
                                # Serialize data to handle Decimal and date types
                                phase_data = serialize_for_json({
                                    'phase': 2.6,
                                    'total_rows': query_result.get('total_rows', 0),
                                    'sample_rows': sample_rows,
                                    'columns': query_result.get('columns', []),
                                    'success': True
                                })
                                yield f"event: phase_complete\ndata: {json.dumps(phase_data)}\n\n"
                            else:
                                yield f"event: phase_complete\ndata: {json.dumps({'phase': 2.6, 'total_rows': 0, 'success': False})}\n\n"
                        else:
                            yield f"event: phase_complete\ndata: {json.dumps({'phase': 2.5, 'analysis': 'Kết quả 0 là chính xác', 'fixed': False})}\n\n"

                except Exception as e:
                    logger.error(f"Deep SQL review error: {e}")
                    yield f"event: phase_complete\ndata: {json.dumps({'phase': 2.5, 'error': str(e)})}\n\n"
            else:
                # Include sample rows for debugging (more rows for detailed analysis)
                sample_rows = query_result.get('rows', [])[:15]  # First 15 rows for detailed view
                # Serialize data to handle Decimal and date types
                phase_data = serialize_for_json({
                    'phase': 2,
                    'total_rows': query_result.get('total_rows', 0),
                    'sample_rows': sample_rows,
                    'columns': query_result.get('columns', [])
                })
                yield f"event: phase_complete\ndata: {json.dumps(phase_data)}\n\n"

            # Phase 3: Generate Response
            yield f"event: phase_start\ndata: {json.dumps({'phase': 3, 'name': 'Tạo báo cáo', 'description': 'Đang tạo báo cáo chiến lược...'})}\n\n"

            data_summary = json.dumps(query_result, ensure_ascii=False, indent=2, default=str)
            if len(data_summary) > 20000:
                data_summary = data_summary[:20000] + "\n... (truncated)"

            # Updated Phase 2 prompt for executive style
            phase2_prompt = f"""Bạn là AI assistant báo cáo cho Lãnh đạo Bộ KH&CN.

=== NGUYÊN TẮC BÁO CÁO CHIẾN LƯỢC ===
1. NGẮN GỌN: main_answer tối đa 2-3 câu, tập trung kết quả chính
2. INSIGHT: Thêm strategic_insight về ý nghĩa chiến lược của dữ liệu
3. HÀNH ĐỘNG: Thêm recommended_action gợi ý bước tiếp theo
4. KHÔNG liệt kê chi tiết trong main_answer - data chi tiết sẽ hiển thị riêng
5. **CANONICAL NAMES: Dùng tên tiếng Việt (canonical name) của field, KHÔNG dùng database field name**
   VD: Viết "Tên hệ thống" thay vì "system_name", "Trạng thái" thay vì "status"
{policies_text}
=== CÂU HỎI ===
{query}

=== DỮ LIỆU (JSON) ===
{data_summary}

=== RESPONSE FORMAT (JSON) ===
{{
    "response": {{
        "greeting": "Báo cáo anh/chị,",
        "main_answer": "**Số lượng** + kết luận ngắn gọn (2-3 câu)",
        "strategic_insight": "Ý nghĩa chiến lược: phân tích xu hướng, rủi ro, cơ hội (1-2 câu)",
        "recommended_action": "Đề xuất hành động cụ thể cho lãnh đạo (1 câu)",
        "details": null,
        "follow_up_suggestions": ["Rủi ro bảo mật?", "Ngân sách cần thiết?", "Lộ trình triển khai?"]
    }}
}}

CHỈ trả về JSON."""

            try:
                # Progress: Calling AI
                yield f"event: progress\ndata: {json.dumps({'message': 'Đang gọi AI tạo báo cáo...'})}\n\n"

                phase2_content = call_ai_internal(phase2_prompt, [{'role': 'user', 'content': 'Generate response'}])

                # Progress: Processing response
                yield f"event: progress\ndata: {json.dumps({'message': 'Đang hoàn thiện báo cáo...'})}\n\n"

                json_match2 = re.search(r'\{[\s\S]*\}', phase2_content)
                if json_match2:
                    phase2_data = json.loads(json_match2.group())
                    response_content = phase2_data.get('response', {})

                    # CRITICAL: Remove numbered lists from main_answer (AI ignores instructions and adds full lists)
                    # This prevents duplicate visualization: table component shows data, main_answer should only have summary
                    if 'main_answer' in response_content and response_content['main_answer']:
                        main_text = response_content['main_answer']
                        # Find where numbered list starts (pattern: newline + number + dot/closing-paren + space)
                        list_match = re.search(r'\n\s*(\d+[\.\)])\s+', main_text)
                        if list_match:
                            # Keep only text before the list
                            response_content['main_answer'] = main_text[:list_match.start()].strip()
                            logger.info(f"[DEEP_SSE_CLEANUP] Removed numbered list from main_answer (was {len(main_text)} chars, now {len(response_content['main_answer'])} chars)")
                else:
                    response_content = {'greeting': 'Báo cáo anh/chị,', 'main_answer': phase2_content, 'follow_up_suggestions': []}

                # Replace template variables in response with actual data
                # AI might return "{{column_name}}" or "[column_name]" which needs to be replaced
                def replace_template_vars(text, data):
                    """Replace template variables with actual data from query result"""
                    if not text:
                        return text

                    # Get first row for template replacement
                    first_row = data.get('rows', [{}])[0] if data.get('rows') else {}

                    # Replacement function that looks up value from data
                    def replace_match(match):
                        var_name = match.group(1)  # Get column name from {{var}} or [var]
                        value = first_row.get(var_name)
                        if value is not None:
                            return str(value)
                        # CRITICAL FIX: Return "0" for missing values, not the variable name
                        logger.warning(f"Template variable '{var_name}' not found in data, using '0'")
                        return "0"

                    import re
                    # Replace all possible template patterns
                    result = re.sub(r'\{\{(\w+)\}\}', replace_match, text)  # {{variable}}
                    result = re.sub(r'\[(\w+)\]', replace_match, result)     # [variable]
                    result = re.sub(r'\{(\w+)\}', replace_match, result)     # {variable}
                    result = re.sub(r'<(\w+)>', replace_match, result)       # <variable>

                    # Replace standalone "X" placeholder with count/total from data
                    # Check for " X " (with spaces) or X at word boundaries
                    if re.search(r'\bX\b', result):
                        count_value = first_row.get('count', first_row.get('total', first_row.get('total_systems', '0')))
                        result = re.sub(r'\bX\b', str(count_value), result)

                    return result

                # Process main_answer to replace any template variables
                if 'main_answer' in response_content:
                    original_answer = response_content['main_answer']
                    processed_answer = replace_template_vars(original_answer, query_result)
                    response_content['main_answer'] = processed_answer or original_answer

            except Exception as e:
                logger.error(f"Phase 3 error: {e}")
                response_content = {
                    'greeting': 'Báo cáo anh/chị,',
                    'main_answer': f'Tìm thấy **{query_result.get("total_rows", 0)}** kết quả.',
                    'follow_up_suggestions': []
                }

            yield f"event: phase_complete\ndata: {json.dumps({'phase': 3})}\n\n"

            # Phase 4: Self-Review
            yield f"event: phase_start\ndata: {json.dumps({'phase': 4, 'name': 'Kiểm tra', 'description': 'Đang kiểm tra tính nhất quán...'})}\n\n"

            review_prompt = f"""Kiểm tra câu trả lời có khớp với dữ liệu không.

Dữ liệu: {query_result.get('total_rows', 0)} dòng
Câu trả lời: {response_content.get('main_answer', '')}

Trả về JSON: {{"is_consistent": true/false, "issues": []}}"""

            try:
                review_content = call_ai_internal(review_prompt, [{'role': 'user', 'content': 'Review'}])
                review_match = re.search(r'\{[\s\S]*\}', review_content)
                if review_match:
                    review_result = json.loads(review_match.group())
                    is_consistent = review_result.get('is_consistent', True)
                else:
                    is_consistent = True
            except:
                is_consistent = True

            thinking['review_passed'] = is_consistent
            yield f"event: phase_complete\ndata: {json.dumps({'phase': 4, 'review_passed': is_consistent})}\n\n"

            # Stop keep-alive before final result
            stop_keep_alive.set()

            # STEP 2: Generate interactive visualization AFTER answer is ready
            # This 2-step approach ensures better quality: answer first, then visualization
            # OLD: HTML string visualization (deprecated - causes duplicate tables)
            # visualization_html = generate_visualization(query_result, query, request)

            # NEW: Generate structured data for React components (D3Table with pagination)
            visualization_data = generate_visualization_data(query_result, query, request)

            # Add visualization to response content
            # response_content['visualization_html'] = visualization_html  # REMOVED - causes duplicate
            response_content['visualization_data'] = visualization_data

            # Clean up: Remove old visualization fields (AI sometimes adds them despite instructions)
            logger.info(f"[DEEP_SSE_CLEANUP] Before: {list(response_content.keys())}")
            response_content.pop('chart_type', None)
            response_content.pop('chart_config', None)
            response_content.pop('system_list_markdown', None)
            logger.info(f"[DEEP_SSE_CLEANUP] After: {list(response_content.keys())}")

            # Final result
            final_response = {
                'query': query,
                'thinking': thinking,
                'response': response_content,
                'data': query_result,
                'mode': 'deep'  # Mark as deep mode
            }

            yield f"event: complete\ndata: {json.dumps(final_response, ensure_ascii=False, default=str)}\n\n"

        response = StreamingHttpResponse(event_stream(), content_type='text/event-stream')
        response['Cache-Control'] = 'no-cache'
        response['X-Accel-Buffering'] = 'no'
        response['Connection'] = 'keep-alive'
        return response

    @action(detail=False, methods=['get'])
    def roadmap_stats(self, request):
        """
        Strategic Dashboard - Roadmap Statistics
        Maps systems to digital transformation phases based on current state.
        Only accessible by lanhdaobo role.

        Phases based on "Kiến trúc tổng thể số thống nhất Bộ KH&CN":
        - Phase 1 (2026): Ổn định hạ tầng – Hội tụ dữ liệu – Thiết lập nền tảng
        - Phase 2 (2027-2028): Chuẩn hóa toàn diện – Tích hợp sâu – Số hóa nghiệp vụ
        - Phase 3 (2029-2030): Tối ưu hóa – Thông minh hóa – Dữ liệu mở
        """
        user = request.user
        if user.role not in ['leader', 'admin']:
            return Response(
                {'error': 'Chỉ Lãnh đạo Bộ mới có quyền xem Dashboard chiến lược'},
                status=status.HTTP_403_FORBIDDEN
            )

        queryset = System.objects.filter(is_deleted=False).select_related(
            'org', 'architecture', 'operations', 'integration', 'security', 'assessment'
        )
        total_systems = queryset.count()

        # Phase criteria mapping
        phase1_systems = []  # Need basic infrastructure improvements
        phase2_systems = []  # Need standardization and integration
        phase3_systems = []  # Ready for optimization and AI
        completed_systems = []  # Already meet most criteria

        for system in queryset:
            system_data = {
                'id': system.id,
                'name': system.system_name,
                'org_name': system.org.name if system.org else None,
                'status': system.status,
                'criticality': system.criticality_level,
                'improvements_needed': [],
                'score': 0,  # Higher = more mature
            }

            # Check Phase 1 criteria (Infrastructure & Foundation)
            # Cloud readiness
            if system.hosting_platform == 'cloud':
                system_data['score'] += 20
            elif system.hosting_platform == 'hybrid':
                system_data['score'] += 10
            else:
                system_data['improvements_needed'].append({
                    'phase': 1,
                    'action': 'Cloud Migration',
                    'detail': 'Di chuyển lên Cloud hoặc Hybrid',
                })

            # API Gateway
            has_api_gw = False
            try:
                if hasattr(system, 'integration') and system.integration:
                    has_api_gw = system.integration.has_api_gateway
            except Exception:
                pass

            if has_api_gw:
                system_data['score'] += 15
            else:
                system_data['improvements_needed'].append({
                    'phase': 1,
                    'action': 'API Gateway',
                    'detail': 'Triển khai API Gateway tập trung',
                })

            # Basic security (Encryption)
            has_encryption = system.has_encryption
            if has_encryption:
                system_data['score'] += 10
            else:
                system_data['improvements_needed'].append({
                    'phase': 1,
                    'action': 'Data Encryption',
                    'detail': 'Triển khai mã hóa dữ liệu',
                })

            # Check Phase 2 criteria (Standardization & Integration)
            # CI/CD
            has_cicd = False
            try:
                if hasattr(system, 'architecture') and system.architecture:
                    has_cicd = system.architecture.has_cicd
            except Exception:
                pass

            if has_cicd:
                system_data['score'] += 15
            else:
                system_data['improvements_needed'].append({
                    'phase': 2,
                    'action': 'CI/CD Pipeline',
                    'detail': 'Triển khai CI/CD tự động',
                })

            # Documentation
            has_docs = system.has_design_documents
            has_arch = False
            try:
                if hasattr(system, 'architecture') and system.architecture:
                    has_arch = system.architecture.has_architecture_diagram
            except Exception:
                pass

            if has_docs:
                system_data['score'] += 10
            else:
                system_data['improvements_needed'].append({
                    'phase': 2,
                    'action': 'Documentation',
                    'detail': 'Hoàn thiện tài liệu thiết kế',
                })

            if has_arch:
                system_data['score'] += 10
            else:
                system_data['improvements_needed'].append({
                    'phase': 2,
                    'action': 'Architecture Diagram',
                    'detail': 'Xây dựng sơ đồ kiến trúc',
                })

            # Audit Log (as proxy for monitoring)
            has_audit_log = system.has_audit_log
            if has_audit_log:
                system_data['score'] += 10
            else:
                system_data['improvements_needed'].append({
                    'phase': 2,
                    'action': 'Observability',
                    'detail': 'Triển khai Monitoring & Logging',
                })

            # Check Phase 3 criteria (Optimization & AI)
            # Data encryption
            has_encryption = False
            try:
                if hasattr(system, 'security') and system.security:
                    has_encryption = system.security.has_data_encryption_at_rest
            except Exception:
                pass

            if has_encryption:
                system_data['score'] += 10
            else:
                system_data['improvements_needed'].append({
                    'phase': 3,
                    'action': 'Data Encryption',
                    'detail': 'Mã hóa dữ liệu at-rest',
                })

            # Categorize by phase needed
            phase1_improvements = [i for i in system_data['improvements_needed'] if i['phase'] == 1]
            phase2_improvements = [i for i in system_data['improvements_needed'] if i['phase'] == 2]
            phase3_improvements = [i for i in system_data['improvements_needed'] if i['phase'] == 3]

            if phase1_improvements:
                system_data['current_phase'] = 1
                system_data['phase_label'] = 'Giai đoạn 1: Xây móng'
                phase1_systems.append(system_data)
            elif phase2_improvements:
                system_data['current_phase'] = 2
                system_data['phase_label'] = 'Giai đoạn 2: Chuẩn hóa'
                phase2_systems.append(system_data)
            elif phase3_improvements:
                system_data['current_phase'] = 3
                system_data['phase_label'] = 'Giai đoạn 3: Tối ưu hóa'
                phase3_systems.append(system_data)
            else:
                system_data['current_phase'] = 4
                system_data['phase_label'] = 'Hoàn thành'
                completed_systems.append(system_data)

        # Sort each phase by criticality (high first)
        criticality_order = {'high': 0, 'medium': 1, 'low': 2}
        for systems_list in [phase1_systems, phase2_systems, phase3_systems, completed_systems]:
            systems_list.sort(key=lambda x: criticality_order.get(x['criticality'], 99))

        # Phase summary
        phase_summary = {
            'phase1': {
                'name': 'Giai đoạn 1 (2026)',
                'title': 'Xây móng - Hội tụ dữ liệu',
                'description': 'Ổn định hạ tầng, Cloud migration, API Gateway, SSL/TLS',
                'count': len(phase1_systems),
                'percentage': round(len(phase1_systems) / total_systems * 100, 1) if total_systems > 0 else 0,
            },
            'phase2': {
                'name': 'Giai đoạn 2 (2027-2028)',
                'title': 'Chuẩn hóa - Tích hợp sâu',
                'description': 'CI/CD, Documentation, Monitoring, Logging',
                'count': len(phase2_systems),
                'percentage': round(len(phase2_systems) / total_systems * 100, 1) if total_systems > 0 else 0,
            },
            'phase3': {
                'name': 'Giai đoạn 3 (2029-2030)',
                'title': 'Tối ưu hóa - Thông minh hóa',
                'description': 'Data encryption, AI integration, Open data',
                'count': len(phase3_systems),
                'percentage': round(len(phase3_systems) / total_systems * 100, 1) if total_systems > 0 else 0,
            },
            'completed': {
                'name': 'Hoàn thành',
                'title': 'Đạt chuẩn',
                'description': 'Đã đáp ứng các tiêu chí chuyển đổi số',
                'count': len(completed_systems),
                'percentage': round(len(completed_systems) / total_systems * 100, 1) if total_systems > 0 else 0,
            },
        }

        # Top priorities for each phase
        top_priorities = {
            'phase1': phase1_systems[:10],
            'phase2': phase2_systems[:10],
            'phase3': phase3_systems[:10],
        }

        # Improvement actions summary
        all_improvements = []
        for system in queryset:
            system_data = {
                'id': system.id,
                'name': system.system_name,
            }
            # Re-calculate improvements for summary
            for sys_list in [phase1_systems, phase2_systems, phase3_systems]:
                for s in sys_list:
                    if s['id'] == system.id:
                        all_improvements.extend(s['improvements_needed'])
                        break

        # Count improvements by action
        from collections import Counter
        action_counts = Counter(i['action'] for i in all_improvements)
        improvement_actions = [
            {'action': action, 'count': count, 'phase': next(
                (i['phase'] for i in all_improvements if i['action'] == action), 1
            )}
            for action, count in action_counts.most_common()
        ]

        return Response({
            'summary': phase_summary,
            'top_priorities': top_priorities,
            'improvement_actions': improvement_actions,
            'total_systems': total_systems,
            'systems_by_phase': {
                'phase1': phase1_systems,
                'phase2': phase2_systems,
                'phase3': phase3_systems,
                'completed': completed_systems,
            },
        })

    @action(detail=False, methods=['get'])
    def export_data(self, request):
        """
        Export all systems with full details for Excel export.
        Returns SystemDetailSerializer data for all systems (no pagination).

        Query params:
        - search: Filter by search term
        - org: Filter by organization ID
        - status: Filter by status
        """
        queryset = self.get_queryset()

        # Apply search filter
        search = request.query_params.get('search', '')
        if search:
            queryset = queryset.filter(
                Q(system_code__icontains=search) |
                Q(system_name__icontains=search) |
                Q(system_name_en__icontains=search) |
                Q(purpose__icontains=search)
            )

        # Apply org filter
        org_id = request.query_params.get('org')
        if org_id:
            queryset = queryset.filter(org_id=org_id)

        # Apply status filter
        status_filter = request.query_params.get('status')
        if status_filter:
            queryset = queryset.filter(status=status_filter)

        # Order by org name, then system name
        queryset = queryset.order_by('org__name', 'system_name')

        # Serialize with full details
        serializer = SystemDetailSerializer(queryset, many=True)

        return Response({
            'count': queryset.count(),
            'results': serializer.data
        })

    @action(detail=False, methods=['get'])
    def completion_stats(self, request):
        """
        Get detailed completion statistics for systems.
        Includes per-system completion percentage and per-org aggregates.

        Query params:
        - org: Filter by organization ID
        - status: Filter by system status
        - search: Search by system name or code
        - completion_min: Min completion % (0-100)
        - completion_max: Max completion % (0-100)
        - ordering: Sort field (e.g., 'completion_percentage', '-system_name')
        """
        from collections import defaultdict
        from .utils import get_incomplete_fields, REQUIRED_FIELDS_MAP, CONDITIONAL_FIELDS_MAP

        queryset = self.get_queryset()

        # Apply filters
        org_id = request.query_params.get('org')
        if org_id:
            queryset = queryset.filter(org_id=org_id)

        status_filter = request.query_params.get('status')
        if status_filter:
            queryset = queryset.filter(status=status_filter)

        # Apply search filter
        search_query = request.query_params.get('search')
        if search_query:
            queryset = queryset.filter(
                Q(system_name__icontains=search_query) |
                Q(system_code__icontains=search_query)
            )

        # Get all systems with completion data
        systems_data = []
        org_stats = defaultdict(lambda: {
            'id': None,
            'name': '',
            'system_count': 0,
            'total_completion': 0.0,
            'systems_100_percent': 0,
            'systems_below_50_percent': 0,
        })

        for system in queryset.select_related('org'):
            completion = calculate_system_completion_percentage(system)
            incomplete = get_incomplete_fields(system)

            # Calculate total required fields for this system
            total_required = sum(len(fields) for fields in REQUIRED_FIELDS_MAP.values())

            # Add conditional fields if applicable
            for field_name, condition_field in CONDITIONAL_FIELDS_MAP.items():
                if getattr(system, condition_field, False):
                    total_required += 1

            filled = total_required - len(incomplete)

            system_data = {
                'id': system.id,
                'system_name': system.system_name,
                'system_code': system.system_code or f'SYS-{system.id}',
                'org_id': system.org.id if system.org else None,
                'org_name': system.org.name if system.org else None,
                'status': system.status,
                'criticality_level': system.criticality_level,
                'completion_percentage': completion,
                'filled_fields': filled,
                'total_required_fields': total_required,
                'incomplete_fields': incomplete,
                'last_updated': system.updated_at if hasattr(system, 'updated_at') else None,
            }

            # Apply completion range filter
            completion_min = request.query_params.get('completion_min')
            completion_max = request.query_params.get('completion_max')
            if completion_min and completion < float(completion_min):
                continue
            if completion_max and completion > float(completion_max):
                continue

            systems_data.append(system_data)

            # Update org stats
            if system.org:
                org_key = system.org.id
                org_stats[org_key]['id'] = system.org.id
                org_stats[org_key]['name'] = system.org.name
                org_stats[org_key]['system_count'] += 1
                org_stats[org_key]['total_completion'] += completion
                if completion == 100.0:
                    org_stats[org_key]['systems_100_percent'] += 1
                if completion < 50.0:
                    org_stats[org_key]['systems_below_50_percent'] += 1

        # Calculate org averages
        org_list = []
        for org_key, stats in org_stats.items():
            stats['avg_completion'] = round(
                stats['total_completion'] / stats['system_count'], 1
            ) if stats['system_count'] > 0 else 0.0
            del stats['total_completion']  # Remove temp field
            org_list.append(stats)

        # Include all organizations (even those without systems)
        from apps.organizations.models import Organization
        all_orgs = Organization.objects.all()
        existing_org_ids = {stats['id'] for stats in org_list}
        for org in all_orgs:
            if org.id not in existing_org_ids:
                org_list.append({
                    'id': org.id,
                    'name': org.name,
                    'system_count': 0,
                    'avg_completion': 0.0,
                    'systems_100_percent': 0,
                    'systems_below_50_percent': 0,
                })

        # Sort org_list by name for consistent ordering
        org_list.sort(key=lambda x: x['name'])

        # Sort systems
        ordering = request.query_params.get('ordering', 'system_name')
        reverse = ordering.startswith('-')
        sort_key = ordering.lstrip('-')

        if sort_key == 'completion_percentage':
            systems_data.sort(key=lambda x: x['completion_percentage'], reverse=reverse)
        elif sort_key == 'system_name':
            systems_data.sort(key=lambda x: x['system_name'], reverse=reverse)
        elif sort_key == 'org_name':
            systems_data.sort(key=lambda x: x['org_name'] or '', reverse=reverse)

        # Calculate summary
        total_systems = len(systems_data)
        avg_completion_all = round(
            sum(s['completion_percentage'] for s in systems_data) / total_systems, 1
        ) if total_systems > 0 else 0.0
        systems_100 = sum(1 for s in systems_data if s['completion_percentage'] == 100.0)
        systems_below_50 = sum(1 for s in systems_data if s['completion_percentage'] < 50.0)

        return Response({
            'count': total_systems,
            'results': systems_data,
            'summary': {
                'organizations': org_list,
                'total_systems': total_systems,
                'avg_completion_all': avg_completion_all,
                'systems_100_percent': systems_100,
                'systems_below_50_percent': systems_below_50,
            }
        })

    def destroy(self, request, *args, **kwargs):
        """
        Soft delete system
        - Admin can delete any system
        - Org user can only delete systems in their organization
        """
        system = self.get_object()
        user = request.user

        # Check permission: Admin can delete any, org_user can only delete their org's systems
        if user.role == 'org_user' and system.org != user.organization:
            return Response(
                {'error': 'Bạn không có quyền xóa hệ thống này'},
                status=status.HTTP_403_FORBIDDEN
            )

        # Soft delete
        from django.utils import timezone
        system.is_deleted = True
        system.deleted_at = timezone.now()
        system.deleted_by = user
        system.save()

        return Response(
            {'message': f'Đã xóa hệ thống "{system.system_name}" thành công'},
            status=status.HTTP_204_NO_CONTENT
        )


class AttachmentViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Attachment CRUD operations

    Endpoints:
    - GET /api/attachments/ - List all attachments
    - POST /api/attachments/ - Upload new attachment
    - GET /api/attachments/{id}/ - Retrieve attachment detail
    - PUT /api/attachments/{id}/ - Update attachment
    - DELETE /api/attachments/{id}/ - Delete attachment
    """

    queryset = Attachment.objects.select_related('system', 'uploaded_by').all()
    serializer_class = AttachmentSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['system', 'attachment_type']
    search_fields = ['filename', 'description']
    ordering_fields = ['uploaded_at', 'file_size']
    ordering = ['-uploaded_at']

    def perform_create(self, serializer):
        """Auto-set uploaded_by and file metadata"""
        serializer.save(uploaded_by=self.request.user)

    def get_queryset(self):
        """Filter attachments based on user role"""
        queryset = super().get_queryset()
        user = self.request.user

        # Admin can see all attachments
        if user.role == 'admin':
            return queryset

        # Org user can only see attachments from their organization's systems
        if user.role == 'org_user' and user.organization:
            return queryset.filter(system__org=user.organization)

        # If user has no organization assigned, return empty queryset
        return queryset.none()

class UnitProgressDashboardView(APIView):
    """
    P0.9: Unit Progress Dashboard API

    GET /api/systems/dashboard/unit-progress/

    Returns progress statistics for the current user's organization:
    - Total systems count
    - Overall completion percentage
    - Per-system completion data with percentages

    Permissions: IsAuthenticated (org_user or admin)
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        """Get progress dashboard data for the user's organization."""
        user = request.user

        # Admin users must specify an organization ID
        if user.role == 'admin':
            org_id = request.query_params.get('org_id')
            if not org_id:
                return Response(
                    {
                        'error': 'Admin users must specify org_id parameter',
                        'example': '/api/systems/dashboard/unit-progress/?org_id=1'
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )
            try:
                from apps.accounts.models import Organization
                organization = Organization.objects.get(id=org_id)
            except Organization.DoesNotExist:
                return Response(
                    {'error': f'Organization with id={org_id} not found'},
                    status=status.HTTP_404_NOT_FOUND
                )
        else:
            # Org users use their assigned organization
            organization = user.organization
            if not organization:
                return Response(
                    {'error': 'User is not assigned to any organization'},
                    status=status.HTTP_403_FORBIDDEN
                )

        # Get all systems for this organization (exclude soft-deleted)
        systems = System.objects.filter(
            org=organization,
            is_deleted=False
        ).select_related('org').order_by('-updated_at')

        # Calculate completion percentage for each system
        systems_data = []
        total_completion = 0.0
        for system in systems:
            completion_percentage = calculate_system_completion_percentage(system)
            total_completion += completion_percentage

            systems_data.append({
                'id': system.id,
                'system_name': system.system_name,
                'system_code': system.system_code,
                'status': system.status,
                'completion_percentage': completion_percentage,
                'created_at': system.created_at.isoformat() if system.created_at else None,
                'updated_at': system.updated_at.isoformat() if system.updated_at else None,
            })

        # Calculate overall completion percentage
        total_systems = len(systems_data)
        overall_completion_percentage = (
            round(total_completion / total_systems, 1) if total_systems > 0 else 0.0
        )

        # Count systems by completion level
        complete_systems = sum(1 for s in systems_data if s['completion_percentage'] >= 100.0)
        incomplete_systems = total_systems - complete_systems

        # Response data
        response_data = {
            'organization': {
                'id': organization.id,
                'name': organization.name,
                'org_code': organization.code,
            },
            'total_systems': total_systems,
            'overall_completion_percentage': overall_completion_percentage,
            'complete_systems': complete_systems,
            'incomplete_systems': incomplete_systems,
            'systems': systems_data,
        }

        return Response(response_data, status=status.HTTP_200_OK)


# ========================================
# AI Conversation ViewSet
# ========================================

class AIConversationViewSet(viewsets.ModelViewSet):
    """
    ViewSet for AI Conversation management

    Endpoints:
    - GET /api/ai-conversations/ - List user's conversations
    - POST /api/ai-conversations/ - Create new conversation
    - GET /api/ai-conversations/{id}/ - Get conversation details
    - DELETE /api/ai-conversations/{id}/ - Delete conversation
    - POST /api/ai-conversations/{id}/add_message/ - Add message to conversation
    """
    serializer_class = AIConversationSerializer
    permission_classes = [IsAuthenticated]
    # Disable pagination to return plain array
    pagination_class = None

    def get_queryset(self):
        """Only return conversations for current user"""
        return AIConversation.objects.filter(user=self.request.user).prefetch_related('messages')

    def get_serializer_class(self):
        """Use different serializers for different actions"""
        if self.action == 'list':
            return AIConversationListSerializer
        elif self.action == 'create':
            return AIConversationCreateSerializer
        return AIConversationSerializer

    def perform_create(self, serializer):
        """Auto-set user from logged-in user"""
        serializer.save(user=self.request.user)

    @action(detail=True, methods=['post'])
    def add_message(self, request, pk=None):
        """
        Add a message to conversation

        Request body:
        {
            "role": "user|assistant",
            "content": "message content",
            "response_data": {}  // optional, for assistant messages
        }
        """
        from django.utils import timezone

        conversation = self.get_object()

        # Verify ownership
        if conversation.user != request.user:
            return Response(
                {'error': 'Not authorized'},
                status=status.HTTP_403_FORBIDDEN
            )

        role = request.data.get('role')
        content = request.data.get('content')
        response_data = request.data.get('response_data')

        if not role or not content:
            return Response(
                {'error': 'role and content are required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if role not in ['user', 'assistant']:
            return Response(
                {'error': 'role must be user or assistant'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Create message
        message = AIMessage.objects.create(
            conversation=conversation,
            role=role,
            content=content,
            response_data=response_data
        )

        # Update conversation metadata
        if conversation.messages.count() == 1:
            conversation.first_message = content[:200]
        conversation.updated_at = timezone.now()
        conversation.save()

        # Serialize and return
        serializer = AIMessageSerializer(message)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['get'])
    def messages(self, request, pk=None):
        """Get all messages for a conversation"""
        conversation = self.get_object()

        if conversation.user != request.user:
            return Response(
                {'error': 'Not authorized'},
                status=status.HTTP_403_FORBIDDEN
            )

        messages = conversation.messages.all()
        serializer = AIMessageSerializer(messages, many=True)
        return Response(serializer.data)


class AIResponseFeedbackViewSet(viewsets.ModelViewSet):
    """
    API for AI Response Feedback
    - POST /api/systems/ai-feedback/ : Submit feedback
    - GET /api/systems/ai-feedback/ : Get user's feedback history
    - GET /api/systems/ai-feedback/stats/ : Get feedback statistics (admin only)
    - GET /api/systems/ai-feedback/policies/ : Get generated improvement policies (admin only)
    """
    queryset = AIResponseFeedback.objects.all()
    serializer_class = AIResponseFeedbackSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """Users can only see their own feedback"""
        if self.request.user.is_staff:
            return self.queryset
        return self.queryset.filter(user=self.request.user)

    @action(detail=False, methods=['get'], permission_classes=[IsAdminUser])
    def stats(self, request):
        """Get feedback statistics (admin only)"""
        stats = AIResponseFeedback.get_feedback_stats()
        serializer = FeedbackStatsSerializer(stats)
        return Response(serializer.data)

    @action(detail=False, methods=['get'], permission_classes=[IsAdminUser])
    def policies(self, request):
        """Get generated improvement policies (admin only)"""
        policies = AIResponseFeedback.generate_improvement_policies()
        serializer = ImprovementPolicySerializer(policies, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def active_policies(self, request):
        """
        Get currently active policies that are being injected into system prompts
        Available to all authenticated users so they know what policies are in effect
        """
        policies = AIResponseFeedback.generate_improvement_policies()
        
        # Filter to only high and medium priority policies
        active = [p for p in policies if p['priority'] in ['high', 'medium']]
        
        return Response({
            'active_policies': active,
            'total_policies': len(policies),
            'active_count': len(active),
        })
