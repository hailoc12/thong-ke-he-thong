# Technical Design - Tab Validation & Dashboard Stats

**Date**: 2026-01-21
**Phase**: Phase 2 - Technical Design
**Previous**: [FEATURE_REQUIREMENTS.md](./FEATURE_REQUIREMENTS.md)

---

## 📐 Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                       FRONTEND                               │
│                                                              │
│  ┌──────────────────┐         ┌──────────────────────┐     │
│  │ SystemCreate.tsx │◄────────┤ useTabValidation     │     │
│  │ SystemEdit.tsx   │         │ (custom hook)        │     │
│  └────────┬─────────┘         └──────────────────────┘     │
│           │                                                  │
│           │ Tab Switch Event                                │
│           │                                                  │
│           ▼                                                  │
│  ┌─────────────────────────────────────────────────┐        │
│  │ systemValidationRules.ts                        │        │
│  │ - validateTab(form, tabKey)                     │        │
│  │ - TabFieldGroups                                │        │
│  │ - AllValidationRules                            │        │
│  └─────────────────────────────────────────────────┘        │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ Dashboard.tsx                                         │   │
│  │ - Organization stats section                         │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ SystemCompletionList.tsx (NEW)                       │   │
│  │ - List systems with completion %                     │   │
│  │ - Progress bars                                       │   │
│  │ - Filters (org, completion range, status)            │   │
│  └────────────────┬─────────────────────────────────────┘   │
│                   │                                          │
└───────────────────┼──────────────────────────────────────────┘
                    │ HTTP GET /api/systems/completion-stats/
                    │
┌───────────────────▼──────────────────────────────────────────┐
│                       BACKEND                                 │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ SystemViewSet (views.py)                             │   │
│  │                                                       │   │
│  │ - statistics() ✅ EXISTING                          │   │
│  │   Returns: avg_completion, by_status, by_criticality│   │
│  │                                                       │   │
│  │ - completion_stats() 🆕 NEW                         │   │
│  │   Returns: per-org & per-system completion details  │   │
│  └────────────────┬─────────────────────────────────────┘   │
│                   │                                          │
│                   │ Uses                                     │
│                   │                                          │
│                   ▼                                          │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ utils.py ✅ EXISTING                                 │   │
│  │ - calculate_system_completion_percentage(system)     │   │
│  │ - get_tab_completion_status(system)                  │   │
│  │ - REQUIRED_FIELDS_MAP (matches frontend 25 fields)   │   │
│  │ - CONDITIONAL_FIELDS_MAP                             │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ SystemSerializer ✅ EXISTING                         │   │
│  │ - Add: completion_percentage (SerializerMethodField) │   │
│  │ - Add: incomplete_fields (SerializerMethodField)     │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

---

## 🎯 Feature 1: Tab Navigation Blocking

### 1.1 Component Architecture

#### Custom Hook: `useTabValidation`
**File**: `frontend/src/hooks/useTabValidation.ts` (NEW)

```typescript
import { useState, useCallback } from 'react';
import { FormInstance, message } from 'antd';
import { validateTab, TabDisplayNames } from '../utils/systemValidationRules';

interface UseTabValidationProps {
  form: FormInstance;
  currentTab: string;
  onTabChange: (newTab: string) => void;
}

interface UseTabValidationReturn {
  handleTabChange: (newTabKey: string) => void;
  tabValidationStatus: Record<string, boolean>;
  validateCurrentTab: () => Promise<boolean>;
}

export const useTabValidation = ({
  form,
  currentTab,
  onTabChange,
}: UseTabValidationProps): UseTabValidationReturn => {
  const [tabValidationStatus, setTabValidationStatus] = useState<Record<string, boolean>>({});

  // Validate current tab before switching
  const handleTabChange = useCallback(
    async (newTabKey: string) => {
      const currentTabNum = parseInt(currentTab, 10);
      const newTabNum = parseInt(newTabKey, 10);

      // Allow backward navigation without validation
      if (newTabNum < currentTabNum) {
        onTabChange(newTabKey);
        return;
      }

      // Validate current tab
      const validation = await validateTab(form, currentTab);

      if (!validation.isValid) {
        // Show error notification
        message.error({
          content: `Vui lòng điền đủ ${validation.errorCount} trường bắt buộc trong tab "${TabDisplayNames[currentTab]}" trước khi chuyển tab`,
          duration: 5,
        });

        // Highlight first error field
        if (validation.errorFields.length > 0) {
          form.scrollToField(validation.errorFields[0], {
            behavior: 'smooth',
            block: 'center',
          });
        }

        return; // Block navigation
      }

      // Update validation status
      setTabValidationStatus(prev => ({
        ...prev,
        [currentTab]: true,
      }));

      // Allow navigation
      onTabChange(newTabKey);
    },
    [form, currentTab, onTabChange]
  );

  // Validate current tab without switching
  const validateCurrentTab = useCallback(async () => {
    const validation = await validateTab(form, currentTab);
    setTabValidationStatus(prev => ({
      ...prev,
      [currentTab]: validation.isValid,
    }));
    return validation.isValid;
  }, [form, currentTab]);

  return {
    handleTabChange,
    tabValidationStatus,
    validateCurrentTab,
  };
};
```

### 1.2 Component Integration

#### SystemCreate.tsx Modifications
**File**: `frontend/src/pages/SystemCreate.tsx` (MODIFY)

**Changes**:

1. **Import custom hook**:
```typescript
import { useTabValidation } from '../hooks/useTabValidation';
```

2. **Replace tab state management**:
```typescript
// OLD
const [currentTab, setCurrentTab] = useState('1');
const handleTabChange = (key: string) => {
  setCurrentTab(key);
};

// NEW
const [currentTab, setCurrentTab] = useState('1');
const { handleTabChange, tabValidationStatus, validateCurrentTab } = useTabValidation({
  form,
  currentTab,
  onTabChange: setCurrentTab,
});
```

3. **Add tab validation indicator** (optional P1 feature):
```typescript
// Add TabLabel component
const TabLabel: React.FC<{ label: string; tabKey: string; isValid?: boolean }> = ({
  label,
  tabKey,
  isValid,
}) => {
  return (
    <span>
      {label}
      {isValid === true && <CheckCircleOutlined style={{ marginLeft: 8, color: '#52c41a' }} />}
      {isValid === false && <ExclamationCircleOutlined style={{ marginLeft: 8, color: '#faad14' }} />}
    </span>
  );
};

// Update Tabs items
const tabItems = [
  {
    key: '1',
    label: <TabLabel label="Thông tin cơ bản" tabKey="1" isValid={tabValidationStatus['1']} />,
    children: <Tab1Content />,
  },
  // ... other tabs
];
```

4. **Validate all tabs on submit**:
```typescript
const handleSubmit = async (values: SystemFormValues) => {
  // Validate all tabs before submission
  const allTabsValidation = await validateAllTabs(form);

  if (!allTabsValidation.isValid) {
    const invalidTabNames = allTabsValidation.invalidTabs
      .map(tabKey => TabDisplayNames[tabKey])
      .join(', ');

    message.error({
      content: `Còn ${allTabsValidation.errorCount} trường bắt buộc chưa điền trong các tab: ${invalidTabNames}`,
      duration: 8,
    });

    // Jump to first invalid tab
    if (allTabsValidation.invalidTabs.length > 0) {
      setCurrentTab(allTabsValidation.invalidTabs[0]);
    }

    return;
  }

  // Submit form
  try {
    await api.post('/systems/', values);
    message.success('Tạo hệ thống thành công!');
    navigate('/systems');
  } catch (error: any) {
    message.error('Tạo hệ thống thất bại');
  }
};
```

#### SystemEdit.tsx Modifications
**File**: `frontend/src/pages/SystemEdit.tsx` (MODIFY)

**Changes**: Same as SystemCreate.tsx (apply all 4 changes above)

### 1.3 Validation Rules - No Changes Needed
**File**: `frontend/src/utils/systemValidationRules.ts` (NO CHANGE)

✅ All required validation functions already exist:
- `validateTab(form, tabKey)`
- `validateAllTabs(form)`
- `TabFieldGroups` - Maps tab keys to required fields
- `TabDisplayNames` - Maps tab keys to Vietnamese labels

---

## 📊 Feature 2: Dashboard Statistics - System Completion Percentage

### 2.1 Backend API Design

#### Existing API (Already Working)
**Endpoint**: `GET /api/systems/statistics/`
**Location**: `backend/apps/systems/views.py` line 127

**Response** (EXISTING):
```json
{
  "total": 50,
  "average_completion_percentage": 78.5,
  "by_status": {
    "operating": 35,
    "pilot": 5,
    "stopped": 8,
    "replacing": 2
  },
  "by_criticality": {
    "high": 12,
    "medium": 25,
    "low": 13
  },
  "by_form_level": {
    "level_1": 30,
    "level_2": 20
  }
}
```

✅ **This endpoint already includes `average_completion_percentage`!**

#### New API Endpoint (To Be Created)
**Endpoint**: `GET /api/systems/completion-stats/`
**Location**: `backend/apps/systems/views.py` (ADD NEW ACTION)

**Query Parameters**:
- `org` (optional): Filter by organization ID
- `status` (optional): Filter by system status
- `completion_min` (optional): Min completion % (0-100)
- `completion_max` (optional): Max completion % (0-100)
- `ordering` (optional): Sort by field (e.g., `completion_percentage`, `-completion_percentage`, `system_name`)

**Response Format**:
```json
{
  "count": 50,
  "results": [
    {
      "id": 1,
      "system_name": "Hệ thống quản lý thuế",
      "system_code": "SYS-TCT-2024-0001",
      "org_id": 1,
      "org_name": "Tổng cục Thuế",
      "status": "operating",
      "criticality_level": "high",
      "completion_percentage": 92.0,
      "filled_fields": 23,
      "total_required_fields": 25,
      "incomplete_fields": ["cicd_tool", "automated_testing_tools"],
      "last_updated": "2026-01-20T10:30:00Z"
    },
    {
      "id": 2,
      "system_name": "Hệ thống QLNN",
      "system_code": "SYS-BTC-2024-0002",
      "org_id": 2,
      "org_name": "Bộ Tài chính",
      "status": "pilot",
      "criticality_level": "medium",
      "completion_percentage": 68.0,
      "filled_fields": 17,
      "total_required_fields": 25,
      "incomplete_fields": ["framework", "database_name", "cicd_tool", "automated_testing_tools", "data_catalog_notes", "mdm_notes", "technical_owner", "business_owner"],
      "last_updated": "2026-01-19T15:45:00Z"
    }
  ],
  "summary": {
    "organizations": [
      {
        "id": 1,
        "name": "Tổng cục Thuế",
        "system_count": 15,
        "avg_completion": 85.3,
        "systems_100_percent": 5,
        "systems_below_50_percent": 1
      },
      {
        "id": 2,
        "name": "Bộ Tài chính",
        "system_count": 10,
        "avg_completion": 72.1,
        "systems_100_percent": 2,
        "systems_below_50_percent": 3
      }
    ],
    "total_systems": 50,
    "avg_completion_all": 78.5,
    "systems_100_percent": 12,
    "systems_below_50_percent": 5
  }
}
```

**Implementation**:
```python
# backend/apps/systems/views.py

from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status
from django.db.models import Q
from collections import defaultdict
from .utils import calculate_system_completion_percentage, get_incomplete_fields

class SystemViewSet(viewsets.ModelViewSet):
    # ... existing code ...

    @action(detail=False, methods=['get'])
    def completion_stats(self, request):
        """
        Get detailed completion statistics for systems.
        Includes per-system completion percentage and per-org aggregates.

        Query params:
        - org: Filter by organization ID
        - status: Filter by system status
        - completion_min: Min completion % (0-100)
        - completion_max: Max completion % (0-100)
        - ordering: Sort field (e.g., 'completion_percentage', '-system_name')
        """
        queryset = self.get_queryset()

        # Apply filters
        org_id = request.query_params.get('org')
        if org_id:
            queryset = queryset.filter(org_id=org_id)

        status_filter = request.query_params.get('status')
        if status_filter:
            queryset = queryset.filter(status=status_filter)

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

            # Calculate required fields count
            total_required = len(REQUIRED_FIELDS_MAP['tab1']) + \
                           len(REQUIRED_FIELDS_MAP['tab2']) + \
                           len(REQUIRED_FIELDS_MAP['tab3']) + \
                           len(REQUIRED_FIELDS_MAP['tab4']) + \
                           len(REQUIRED_FIELDS_MAP['tab6']) + \
                           len(REQUIRED_FIELDS_MAP['tab8'])

            # Add conditional fields if applicable
            if getattr(system, 'has_cicd', False):
                total_required += 1
            if getattr(system, 'has_automated_testing', False):
                total_required += 1
            if getattr(system, 'has_layered_architecture', False):
                total_required += 1
            if getattr(system, 'has_data_catalog', False):
                total_required += 1
            if getattr(system, 'has_mdm', False):
                total_required += 1

            filled = total_required - len(incomplete)

            system_data = {
                'id': system.id,
                'system_name': system.system_name,
                'system_code': system.system_code,
                'org_id': system.org.id if system.org else None,
                'org_name': system.org.name if system.org else None,
                'status': system.status,
                'criticality_level': system.criticality_level,
                'completion_percentage': completion,
                'filled_fields': filled,
                'total_required_fields': total_required,
                'incomplete_fields': incomplete,
                'last_updated': system.updated_at,
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
```

**Utility Function** (TO CREATE):
```python
# backend/apps/systems/utils.py

def get_incomplete_fields(system_instance: Any) -> List[str]:
    """
    Get list of incomplete required field names for a system.

    Args:
        system_instance: The System model instance

    Returns:
        list: List of field names that are required but not filled
    """
    incomplete = []

    # Check always-required fields
    for tab_key, field_names in REQUIRED_FIELDS_MAP.items():
        for field_name in field_names:
            try:
                field_value = getattr(system_instance, field_name, None)
                if not is_field_filled(field_value):
                    incomplete.append(field_name)
            except AttributeError:
                continue

    # Check conditional fields
    for field_name, condition_field in CONDITIONAL_FIELDS_MAP.items():
        try:
            condition_value = getattr(system_instance, condition_field, False)
            if condition_value is True:
                field_value = getattr(system_instance, field_name, None)
                if not is_field_filled(field_value):
                    incomplete.append(field_name)
        except AttributeError:
            continue

    return incomplete
```

### 2.2 Frontend Components

#### Dashboard.tsx Enhancement
**File**: `frontend/src/pages/Dashboard.tsx` (MODIFY)

**Changes**:

1. **Fetch completion stats** (replace existing statistics call):
```typescript
const [completionStats, setCompletionStats] = useState<any>(null);

const fetchCompletionStats = async () => {
  try {
    const params = new URLSearchParams();
    if (organizationFilter !== 'all') {
      params.append('org', organizationFilter);
    }
    const url = `/systems/completion-stats/${params.toString() ? '?' + params.toString() : ''}`;
    const response = await api.get(url);
    setCompletionStats(response.data);
  } catch (error) {
    console.error('Failed to fetch completion stats:', error);
  }
};
```

2. **Add organization stats table**:
```typescript
// After KPI cards section, add:
<Row gutter={[24, 24]} style={{ marginTop: 24 }}>
  <Col xs={24}>
    <Card
      title="Thống kê theo đơn vị"
      extra={
        <Button type="link" onClick={() => navigate('/systems/completion')}>
          Xem chi tiết
        </Button>
      }
    >
      <Table
        dataSource={completionStats?.summary?.organizations || []}
        columns={[
          {
            title: 'Đơn vị',
            dataIndex: 'name',
            key: 'name',
            sorter: (a, b) => a.name.localeCompare(b.name),
          },
          {
            title: 'Số hệ thống',
            dataIndex: 'system_count',
            key: 'system_count',
            sorter: (a, b) => a.system_count - b.system_count,
            align: 'center',
          },
          {
            title: '% hoàn thành TB',
            dataIndex: 'avg_completion',
            key: 'avg_completion',
            sorter: (a, b) => a.avg_completion - b.avg_completion,
            align: 'center',
            render: (value) => (
              <Progress
                type="circle"
                percent={value}
                width={60}
                strokeColor={getCompletionColor(value)}
              />
            ),
          },
          {
            title: 'Hoàn thành 100%',
            dataIndex: 'systems_100_percent',
            key: 'systems_100_percent',
            align: 'center',
            render: (value) => <Badge count={value} style={{ backgroundColor: '#52c41a' }} />,
          },
          {
            title: 'Dưới 50%',
            dataIndex: 'systems_below_50_percent',
            key: 'systems_below_50_percent',
            align: 'center',
            render: (value) => <Badge count={value} style={{ backgroundColor: '#ff4d4f' }} />,
          },
          {
            title: 'Hành động',
            key: 'action',
            align: 'center',
            render: (_, record) => (
              <Button
                type="link"
                onClick={() => navigate(`/systems/completion?org=${record.id}`)}
              >
                Xem chi tiết
              </Button>
            ),
          },
        ]}
        rowKey="id"
        pagination={{ pageSize: 10 }}
      />
    </Card>
  </Col>
</Row>
```

3. **Add completion color helper**:
```typescript
const getCompletionColor = (percentage: number): string => {
  if (percentage === 100) return '#22C55E';
  if (percentage >= 76) return '#84CC16';
  if (percentage >= 51) return '#FBBF24';
  if (percentage >= 26) return '#F59E0B';
  return '#EF4444';
};
```

#### OrganizationDashboard.tsx Enhancement
**File**: `frontend/src/pages/OrganizationDashboard.tsx` (MODIFY)

**Changes**: Similar to Dashboard.tsx but filtered to user's organization automatically

#### SystemCompletionList.tsx (NEW)
**File**: `frontend/src/pages/SystemCompletionList.tsx` (CREATE)

**Purpose**: Full-page view of systems with completion percentages, filters, and sorting

```typescript
import { useState, useEffect } from 'react';
import { Table, Card, Progress, Tag, Button, Select, Space, Typography, Row, Col } from 'antd';
import { EditOutlined, EyeOutlined } from '@ant-design/icons';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../config/api';

const { Title } = Typography;
const { Option } = Select;

interface SystemCompletionData {
  id: number;
  system_name: string;
  system_code: string;
  org_name: string;
  status: string;
  criticality_level: string;
  completion_percentage: number;
  filled_fields: number;
  total_required_fields: number;
  incomplete_fields: string[];
}

const SystemCompletionList = () => {
  const [data, setData] = useState<SystemCompletionData[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // Filters from URL
  const orgFilter = searchParams.get('org') || 'all';
  const statusFilter = searchParams.get('status') || 'all';
  const completionFilter = searchParams.get('completion') || 'all';

  useEffect(() => {
    fetchCompletionData();
  }, [orgFilter, statusFilter, completionFilter]);

  const fetchCompletionData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (orgFilter !== 'all') params.append('org', orgFilter);
      if (statusFilter !== 'all') params.append('status', statusFilter);

      // Map completion filter to min/max
      if (completionFilter === '0-25') {
        params.append('completion_min', '0');
        params.append('completion_max', '25');
      } else if (completionFilter === '26-50') {
        params.append('completion_min', '26');
        params.append('completion_max', '50');
      } else if (completionFilter === '51-75') {
        params.append('completion_min', '51');
        params.append('completion_max', '75');
      } else if (completionFilter === '76-99') {
        params.append('completion_min', '76');
        params.append('completion_max', '99');
      } else if (completionFilter === '100') {
        params.append('completion_min', '100');
        params.append('completion_max', '100');
      }

      params.append('ordering', '-completion_percentage');

      const response = await api.get(`/systems/completion-stats/?${params.toString()}`);
      setData(response.data.results);
    } catch (error) {
      console.error('Failed to fetch completion data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCompletionColor = (percentage: number): string => {
    if (percentage === 100) return '#22C55E';
    if (percentage >= 76) return '#84CC16';
    if (percentage >= 51) return '#FBBF24';
    if (percentage >= 26) return '#F59E0B';
    return '#EF4444';
  };

  const columns = [
    {
      title: 'Mã hệ thống',
      dataIndex: 'system_code',
      key: 'system_code',
      width: 150,
    },
    {
      title: 'Tên hệ thống',
      dataIndex: 'system_name',
      key: 'system_name',
      width: 250,
    },
    {
      title: 'Đơn vị',
      dataIndex: 'org_name',
      key: 'org_name',
      width: 180,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 130,
      render: (status: string) => {
        const statusMap = {
          operating: { label: 'Đang vận hành', color: 'green' },
          pilot: { label: 'Thí điểm', color: 'blue' },
          stopped: { label: 'Dừng', color: 'red' },
          replacing: { label: 'Sắp thay thế', color: 'orange' },
        };
        const config = statusMap[status] || { label: status, color: 'default' };
        return <Tag color={config.color}>{config.label}</Tag>;
      },
    },
    {
      title: '% hoàn thành',
      dataIndex: 'completion_percentage',
      key: 'completion_percentage',
      width: 200,
      sorter: (a, b) => a.completion_percentage - b.completion_percentage,
      defaultSortOrder: 'descend',
      render: (percentage: number, record: SystemCompletionData) => (
        <Space direction="vertical" size={4} style={{ width: '100%' }}>
          <Progress
            percent={percentage}
            strokeColor={getCompletionColor(percentage)}
            size="small"
          />
          <Typography.Text type="secondary" style={{ fontSize: 12 }}>
            {record.filled_fields}/{record.total_required_fields} trường
          </Typography.Text>
        </Space>
      ),
    },
    {
      title: 'Hành động',
      key: 'action',
      width: 150,
      fixed: 'right',
      render: (_, record: SystemCompletionData) => (
        <Space>
          <Button
            type="link"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => navigate(`/systems/${record.id}`)}
          >
            Xem
          </Button>
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => navigate(`/systems/${record.id}/edit`)}
          >
            Sửa
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Title level={3}>Thống kê hoàn thành hệ thống</Title>

      {/* Filters */}
      <Card style={{ marginBottom: 16 }}>
        <Row gutter={16}>
          <Col span={6}>
            <Select
              style={{ width: '100%' }}
              placeholder="Đơn vị"
              value={orgFilter}
              onChange={(value) => {
                const params = new URLSearchParams(searchParams);
                if (value === 'all') params.delete('org');
                else params.set('org', value);
                setSearchParams(params);
              }}
            >
              <Option value="all">Tất cả đơn vị</Option>
              {/* Load organizations dynamically */}
            </Select>
          </Col>

          <Col span={6}>
            <Select
              style={{ width: '100%' }}
              placeholder="Trạng thái"
              value={statusFilter}
              onChange={(value) => {
                const params = new URLSearchParams(searchParams);
                if (value === 'all') params.delete('status');
                else params.set('status', value);
                setSearchParams(params);
              }}
            >
              <Option value="all">Tất cả trạng thái</Option>
              <Option value="operating">Đang vận hành</Option>
              <Option value="pilot">Thí điểm</Option>
              <Option value="stopped">Dừng</Option>
              <Option value="replacing">Sắp thay thế</Option>
            </Select>
          </Col>

          <Col span={6}>
            <Select
              style={{ width: '100%' }}
              placeholder="% hoàn thành"
              value={completionFilter}
              onChange={(value) => {
                const params = new URLSearchParams(searchParams);
                if (value === 'all') params.delete('completion');
                else params.set('completion', value);
                setSearchParams(params);
              }}
            >
              <Option value="all">Tất cả</Option>
              <Option value="0-25">0-25%</Option>
              <Option value="26-50">26-50%</Option>
              <Option value="51-75">51-75%</Option>
              <Option value="76-99">76-99%</Option>
              <Option value="100">100%</Option>
            </Select>
          </Col>

          <Col span={6}>
            <Button
              onClick={() => {
                setSearchParams(new URLSearchParams());
              }}
            >
              Xóa bộ lọc
            </Button>
          </Col>
        </Row>
      </Card>

      {/* Table */}
      <Card>
        <Table
          columns={columns}
          dataSource={data}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 20,
            showSizeChanger: true,
            showTotal: (total) => `Tổng ${total} hệ thống`,
          }}
          scroll={{ x: 1200 }}
          expandable={{
            expandedRowRender: (record) => (
              <div style={{ padding: '12px 24px' }}>
                <Typography.Text strong>Các trường chưa điền:</Typography.Text>
                <br />
                {record.incomplete_fields.length > 0 ? (
                  <Space wrap style={{ marginTop: 8 }}>
                    {record.incomplete_fields.map((field) => (
                      <Tag key={field} color="red">
                        {field}
                      </Tag>
                    ))}
                  </Space>
                ) : (
                  <Typography.Text type="success" style={{ marginTop: 8 }}>
                    ✅ Đã điền đủ tất cả trường bắt buộc
                  </Typography.Text>
                )}
              </div>
            ),
            rowExpandable: (record) => record.completion_percentage < 100,
          }}
        />
      </Card>
    </div>
  );
};

export default SystemCompletionList;
```

### 2.3 Routing
**File**: `frontend/src/App.tsx` or routing config (MODIFY)

**Add route**:
```typescript
<Route path="/systems/completion" element={<SystemCompletionList />} />
```

---

## 🧪 Testing Strategy

### Unit Tests

**Frontend**:
- `useTabValidation.test.ts` - Test hook logic
- `systemValidationRules.test.ts` - Test validation functions (if not already tested)

**Backend**:
- `test_utils.py` - Test `calculate_system_completion_percentage()`, `get_incomplete_fields()`
- `test_views.py` - Test `completion_stats` endpoint with various filters

### Integration Tests

**API Tests**:
```bash
# Test completion stats endpoint
curl -H "Authorization: Bearer <token>" \
  "http://localhost:8000/api/systems/completion-stats/"

# Test with filters
curl -H "Authorization: Bearer <token>" \
  "http://localhost:8000/api/systems/completion-stats/?org=1&completion_min=75"

# Test with ordering
curl -H "Authorization: Bearer <token>" \
  "http://localhost:8000/api/systems/completion-stats/?ordering=-completion_percentage"
```

### Phase 5: Live Testing Plan (Playwright)
See [FEATURE_REQUIREMENTS.md Phase 5](./FEATURE_REQUIREMENTS.md#🧪-phase-5-testing-plan) for detailed test scenarios.

---

## 📊 Database Considerations

### No Schema Changes Needed ✅

- All required fields already exist in System model
- Completion percentage calculated dynamically (not stored)
- No migrations required

### Performance Optimization (Future)

If completion stats become slow with large datasets:
1. Add database index on frequently filtered fields:
   - `org_id`
   - `status`
   - `updated_at`
2. Consider caching completion stats (Redis)
3. Add pagination to completion-stats endpoint

---

## 🎯 Success Criteria

### Feature 1: Tab Navigation Blocking
- ✅ Tab navigation blocked when required fields empty
- ✅ Backward navigation always allowed
- ✅ Submit validates all tabs
- ✅ Clear error messages shown
- ✅ No performance degradation

### Feature 2: Dashboard Statistics
- ✅ Admin sees all org stats
- ✅ Org user sees their org stats
- ✅ Completion % accurate
- ✅ Filtering & sorting works
- ✅ API response time < 2 seconds

---

**Next Steps**: Proceed to Phase 4 (Implementation) or skip to Phase 3 (Prototype) if needed.
