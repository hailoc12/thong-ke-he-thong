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
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // Handle responsive
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
      title: isMobile ? 'Mã' : 'Mã hệ thống',
      dataIndex: 'system_code',
      key: 'system_code',
      width: isMobile ? 80 : 150,
      fixed: isMobile ? undefined : 'left',
      responsive: isMobile ? undefined : ['md'] as any,
    },
    {
      title: 'Tên hệ thống',
      dataIndex: 'system_name',
      key: 'system_name',
      width: isMobile ? 150 : 250,
      fixed: isMobile ? undefined : 'left',
      ellipsis: { showTitle: true },
    },
    {
      title: 'Đơn vị',
      dataIndex: 'org_name',
      key: 'org_name',
      width: 180,
      ellipsis: { showTitle: true },
      responsive: ['lg'] as any, // Hide on mobile and tablet
    },
    {
      title: isMobile ? 'TT' : 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: isMobile ? 80 : 130,
      render: (status: string) => {
        const label = STATUS_LABELS[status] || status;
        const color = STATUS_COLORS[status] || 'default';
        return <Tag color={color}>{isMobile ? label.substring(0, 6) : label}</Tag>;
      },
    },
    {
      title: isMobile ? '%' : '% hoàn thành',
      dataIndex: 'completion_percentage',
      key: 'completion_percentage',
      width: isMobile ? 100 : 200,
      sorter: (a, b) => a.completion_percentage - b.completion_percentage,
      defaultSortOrder: 'descend',
      render: (percentage: number, record: SystemCompletionData) => (
        <Space direction="vertical" size={4} style={{ width: '100%' }}>
          <Progress
            percent={percentage}
            strokeColor={getCompletionColor(percentage)}
            size="small"
            format={(p) => isMobile ? `${p}%` : `${p}%`}
          />
          {!isMobile && (
            <Text type="secondary" style={{ fontSize: 12 }}>
              {record.filled_fields}/{record.total_required_fields} trường
            </Text>
          )}
        </Space>
      ),
    },
    {
      title: '',
      key: 'action',
      width: isMobile ? 80 : 150,
      fixed: isMobile ? undefined : 'right',
      render: (_, record: SystemCompletionData) => (
        <Space size={isMobile ? 4 : 8}>
          <Button
            type="link"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => navigate(`/systems/${record.id}`)}
          >
            {!isMobile && 'Xem'}
          </Button>
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => navigate(`/systems/${record.id}/edit`)}
          >
            {!isMobile && 'Sửa'}
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        justifyContent: 'space-between',
        alignItems: isMobile ? 'stretch' : 'flex-start',
        gap: isMobile ? 12 : 0,
        marginBottom: 16
      }}>
        <div>
          <Title level={isMobile ? 4 : 3} style={{ marginBottom: 8 }}>
            {isMobile ? 'Thống kê hoàn thành' : 'Thống kê hoàn thành hệ thống'}
          </Title>
          {summary && (
            <Space size={isMobile ? 'small' : 'large'} wrap>
              <Text type="secondary" style={{ fontSize: isMobile ? 12 : 14 }}>
                Tổng: <strong>{summary.total_systems}</strong>
              </Text>
              <Text type="secondary" style={{ fontSize: isMobile ? 12 : 14 }}>
                TB: <strong>{summary.avg_completion_all}%</strong>
              </Text>
              <Text style={{ color: '#22C55E', fontSize: isMobile ? 12 : 14 }}>
                100%: <strong>{summary.systems_100_percent}</strong>
              </Text>
              <Text style={{ color: '#EF4444', fontSize: isMobile ? 12 : 14 }}>
                &lt;50%: <strong>{summary.systems_below_50_percent}</strong>
              </Text>
            </Space>
          )}
        </div>
        <Button
          icon={<ReloadOutlined />}
          onClick={fetchCompletionData}
          loading={loading}
          size={isMobile ? 'small' : 'middle'}
          block={isMobile}
        >
          {isMobile ? 'Làm mới' : 'Làm mới'}
        </Button>
      </div>

      {/* Filters */}
      <Card size={isMobile ? 'small' : 'default'} style={{ marginBottom: 16 }}>
        <Row gutter={[8, 8]} align="middle">
          <Col xs={24} sm={24} md={18} lg={18}>
            <Space wrap size={isMobile ? 'small' : 'middle'} style={{ width: '100%' }}>
              <Select
                style={{ width: isMobile ? '100%' : 220, minWidth: isMobile ? 'unset' : 180 }}
                placeholder="Đơn vị"
                value={orgFilter}
                onChange={(value) => handleFilterChange('org', value)}
                size={isMobile ? 'small' : 'middle'}
              >
                <Option value="all">Tất cả đơn vị</Option>
                {organizations.map((org) => (
                  <Option key={org.id} value={org.id.toString()}>
                    {org.name}
                  </Option>
                ))}
              </Select>

              <Select
                style={{ width: isMobile ? 120 : 180 }}
                placeholder="Trạng thái"
                value={statusFilter}
                onChange={(value) => handleFilterChange('status', value)}
                size={isMobile ? 'small' : 'middle'}
              >
                <Option value="all">{isMobile ? 'Tất cả' : 'Tất cả trạng thái'}</Option>
                <Option value="operating">{STATUS_LABELS.operating}</Option>
                <Option value="pilot">{STATUS_LABELS.pilot}</Option>
                <Option value="stopped">{STATUS_LABELS.stopped}</Option>
                <Option value="replacing">{STATUS_LABELS.replacing}</Option>
              </Select>

              <Select
                style={{ width: isMobile ? 100 : 180 }}
                placeholder="% hoàn thành"
                value={completionFilter}
                onChange={(value) => handleFilterChange('completion', value)}
                size={isMobile ? 'small' : 'middle'}
              >
                <Option value="all">{isMobile ? 'Tất cả' : 'Tất cả %'}</Option>
                <Option value="0-25">0-25%</Option>
                <Option value="26-50">26-50%</Option>
                <Option value="51-75">51-75%</Option>
                <Option value="76-99">76-99%</Option>
                <Option value="100">100%</Option>
              </Select>
            </Space>
          </Col>
          <Col xs={24} sm={24} md={6} lg={6} style={{ textAlign: isMobile ? 'left' : 'right' }}>
            <Button onClick={handleClearFilters} size={isMobile ? 'small' : 'middle'}>
              {isMobile ? 'Xóa lọc' : 'Xóa bộ lọc'}
            </Button>
          </Col>
        </Row>
      </Card>

      {/* Table */}
      <Card size={isMobile ? 'small' : 'default'}>
        {loading && !data.length ? (
          <div style={{ textAlign: 'center', padding: isMobile ? 20 : 40 }}>
            <Spin size={isMobile ? 'default' : 'large'} />
          </div>
        ) : (
          <Table
            columns={columns}
            dataSource={data}
            rowKey="id"
            loading={loading}
            size={isMobile ? 'small' : 'middle'}
            pagination={{
              pageSize: isMobile ? 10 : 20,
              showSizeChanger: !isMobile,
              showTotal: isMobile ? undefined : (total) => `Tổng ${total} hệ thống`,
              size: isMobile ? 'small' : 'default',
            }}
            scroll={{ x: isMobile ? 'max-content' : 1200 }}
            tableLayout={isMobile ? 'auto' : 'fixed'}
            expandable={{
              expandedRowRender: (record) => (
                <div style={{ padding: isMobile ? '8px 12px' : '12px 24px' }}>
                  <Text strong style={{ fontSize: isMobile ? 12 : 14 }}>
                    {isMobile ? 'Chưa điền:' : 'Các trường chưa điền:'}
                  </Text>
                  <br />
                  {record.incomplete_fields.length > 0 ? (
                    <Space wrap size={isMobile ? 4 : 8} style={{ marginTop: 8 }}>
                      {record.incomplete_fields.map((field) => (
                        <Tag key={field} color="red" style={{ fontSize: isMobile ? 11 : 14 }}>
                          {field}
                        </Tag>
                      ))}
                    </Space>
                  ) : (
                    <Text type="success" style={{ marginTop: 8, fontSize: isMobile ? 12 : 14 }}>
                      ✅ Đã điền đủ
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
