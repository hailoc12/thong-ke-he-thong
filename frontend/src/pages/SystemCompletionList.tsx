/**
 * SystemCompletionList - Full-page view of systems with completion percentages
 *
 * Features:
 * - Display all systems with completion percentage
 * - Progress bars with color-coded status
 * - Filters: organization, status, completion range
 * - Sorting by completion %, name, organization
 * - Expandable rows showing incomplete fields
 * - Actions: View, Edit system
 */

import { useState, useEffect } from 'react';
import {
  Table,
  Card,
  Progress,
  Tag,
  Button,
  Select,
  Space,
  Typography,
  Row,
  Col,
  message,
  Spin,
} from 'antd';
import { EditOutlined, EyeOutlined, ReloadOutlined } from '@ant-design/icons';
import { useNavigate, useSearchParams } from 'react-router-dom';
import type { ColumnsType } from 'antd/es/table';
import api from '../config/api';
import type { Organization } from '../types';

const { Title, Text } = Typography;
const { Option } = Select;

// Status mapping
const STATUS_LABELS: Record<string, string> = {
  operating: 'Đang vận hành',
  pilot: 'Thí điểm',
  stopped: 'Dừng',
  replacing: 'Sắp thay thế',
};

const STATUS_COLORS: Record<string, string> = {
  operating: 'green',
  pilot: 'blue',
  stopped: 'red',
  replacing: 'orange',
};

interface SystemCompletionData {
  id: number;
  system_name: string;
  system_code: string;
  org_id: number;
  org_name: string;
  status: string;
  criticality_level: string;
  completion_percentage: number;
  filled_fields: number;
  total_required_fields: number;
  incomplete_fields: string[];
  last_updated: string;
}

interface CompletionStatsResponse {
  count: number;
  results: SystemCompletionData[];
  summary: {
    organizations: Array<{
      id: number;
      name: string;
      system_count: number;
      avg_completion: number;
      systems_100_percent: number;
      systems_below_50_percent: number;
    }>;
    total_systems: number;
    avg_completion_all: number;
    systems_100_percent: number;
    systems_below_50_percent: number;
  };
}

const SystemCompletionList = () => {
  const [data, setData] = useState<SystemCompletionData[]>([]);
  const [summary, setSummary] = useState<CompletionStatsResponse['summary'] | null>(null);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // Filters from URL
  const orgFilter = searchParams.get('org') || 'all';
  const statusFilter = searchParams.get('status') || 'all';
  const completionFilter = searchParams.get('completion') || 'all';

  useEffect(() => {
    fetchOrganizations();
  }, []);

  useEffect(() => {
    fetchCompletionData();
  }, [orgFilter, statusFilter, completionFilter]);

  const fetchOrganizations = async () => {
    try {
      const response = await api.get<any>('/organizations/?page_size=100');
      const orgsData = Array.isArray(response.data)
        ? response.data
        : response.data.results || [];
      setOrganizations(orgsData);
    } catch (error) {
      console.error('Failed to fetch organizations:', error);
    }
  };

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

      const response = await api.get<CompletionStatsResponse>(
        `/systems/completion_stats/?${params.toString()}`
      );
      setData(response.data.results);
      setSummary(response.data.summary);
    } catch (error: any) {
      console.error('Failed to fetch completion data:', error);
      message.error('Lỗi khi tải dữ liệu thống kê');
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

  const handleFilterChange = (filterName: string, value: string) => {
    const params = new URLSearchParams(searchParams);
    if (value === 'all') {
      params.delete(filterName);
    } else {
      params.set(filterName, value);
    }
    setSearchParams(params);
  };

  const handleClearFilters = () => {
    setSearchParams(new URLSearchParams());
  };

  const columns: ColumnsType<SystemCompletionData> = [
    {
      title: 'Mã hệ thống',
      dataIndex: 'system_code',
      key: 'system_code',
      width: 150,
      fixed: 'left',
    },
    {
      title: 'Tên hệ thống',
      dataIndex: 'system_name',
      key: 'system_name',
      width: 250,
      fixed: 'left',
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
        const label = STATUS_LABELS[status] || status;
        const color = STATUS_COLORS[status] || 'default';
        return <Tag color={color}>{label}</Tag>;
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
          <Text type="secondary" style={{ fontSize: 12 }}>
            {record.filled_fields}/{record.total_required_fields} trường
          </Text>
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
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <div>
          <Title level={3} style={{ marginBottom: 8 }}>
            Thống kê hoàn thành hệ thống
          </Title>
          {summary && (
            <Space size="large">
              <Text type="secondary">
                Tổng: <strong>{summary.total_systems}</strong> hệ thống
              </Text>
              <Text type="secondary">
                TB: <strong>{summary.avg_completion_all}%</strong>
              </Text>
              <Text style={{ color: '#22C55E' }}>
                100%: <strong>{summary.systems_100_percent}</strong>
              </Text>
              <Text style={{ color: '#EF4444' }}>
                &lt;50%: <strong>{summary.systems_below_50_percent}</strong>
              </Text>
            </Space>
          )}
        </div>
        <Button
          icon={<ReloadOutlined />}
          onClick={fetchCompletionData}
          loading={loading}
        >
          Làm mới
        </Button>
      </div>

      {/* Filters */}
      <Card style={{ marginBottom: 16 }}>
        <Row gutter={16} align="middle">
          <Col flex="auto">
            <Space wrap>
              <Select
                style={{ width: 220 }}
                placeholder="Đơn vị"
                value={orgFilter}
                onChange={(value) => handleFilterChange('org', value)}
              >
                <Option value="all">Tất cả đơn vị</Option>
                {organizations.map((org) => (
                  <Option key={org.id} value={org.id.toString()}>
                    {org.name}
                  </Option>
                ))}
              </Select>

              <Select
                style={{ width: 180 }}
                placeholder="Trạng thái"
                value={statusFilter}
                onChange={(value) => handleFilterChange('status', value)}
              >
                <Option value="all">Tất cả trạng thái</Option>
                <Option value="operating">{STATUS_LABELS.operating}</Option>
                <Option value="pilot">{STATUS_LABELS.pilot}</Option>
                <Option value="stopped">{STATUS_LABELS.stopped}</Option>
                <Option value="replacing">{STATUS_LABELS.replacing}</Option>
              </Select>

              <Select
                style={{ width: 180 }}
                placeholder="% hoàn thành"
                value={completionFilter}
                onChange={(value) => handleFilterChange('completion', value)}
              >
                <Option value="all">Tất cả</Option>
                <Option value="0-25">0-25%</Option>
                <Option value="26-50">26-50%</Option>
                <Option value="51-75">51-75%</Option>
                <Option value="76-99">76-99%</Option>
                <Option value="100">100%</Option>
              </Select>
            </Space>
          </Col>
          <Col>
            <Button onClick={handleClearFilters}>Xóa bộ lọc</Button>
          </Col>
        </Row>
      </Card>

      {/* Table */}
      <Card>
        {loading && !data.length ? (
          <div style={{ textAlign: 'center', padding: 40 }}>
            <Spin size="large" />
          </div>
        ) : (
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
                  <Text strong>Các trường chưa điền:</Text>
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
                    <Text type="success" style={{ marginTop: 8 }}>
                      ✅ Đã điền đủ tất cả trường bắt buộc
                    </Text>
                  )}
                </div>
              ),
              rowExpandable: (record) => record.completion_percentage < 100,
            }}
          />
        )}
      </Card>
    </div>
  );
};

export default SystemCompletionList;
