import { Table, Card, Tag, Button, Typography, Empty } from 'antd';
import { InboxOutlined, EyeOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import type { ColumnsType } from 'antd/es/table';
import type { System } from '../types';

const { Text } = Typography;

// Status mapping: English DB values → Vietnamese display names
const STATUS_LABELS: Record<string, string> = {
  operating: 'Đang vận hành',
  pilot: 'Thí điểm',
  stopped: 'Dừng',
  replacing: 'Sắp thay thế',
};

interface DashboardSystemsListProps {
  systems: System[];
  loading: boolean;
  isMobile: boolean;
  pagination?: {
    current: number;
    pageSize: number;
    total: number;
  };
  onChange?: (pagination: any) => void;
}

const DashboardSystemsList: React.FC<DashboardSystemsListProps> = ({
  systems,
  loading,
  isMobile,
  pagination,
  onChange,
}) => {
  const navigate = useNavigate();

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      operating: 'green',
      pilot: 'orange',
      stopped: 'red',
      replacing: 'blue',
    };
    return colors[status] || 'default';
  };

  const getStatusLabel = (status: string) => {
    return STATUS_LABELS[status] || status;
  };

  const getCriticalityColor = (level: string) => {
    const colors: Record<string, string> = {
      high: 'red',
      medium: 'orange',
      low: 'green',
    };
    return colors[level] || 'default';
  };

  const columns: ColumnsType<System> = [
    {
      title: 'Mã hệ thống',
      dataIndex: 'system_code',
      key: 'system_code',
      width: 120,
      responsive: ['md'] as any,
    },
    {
      title: 'Tên hệ thống',
      dataIndex: 'system_name',
      key: 'system_name',
      width: isMobile ? undefined : 250,
      ellipsis: {
        showTitle: true,
      },
    },
    {
      title: 'Đơn vị',
      dataIndex: 'org_name',
      key: 'org_name',
      width: 200,
      ellipsis: {
        showTitle: true,
      },
      responsive: ['lg'] as any,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 140,
      render: (status: string) => (
        <Tag color={getStatusColor(status)}>
          {getStatusLabel(status)}
        </Tag>
      ),
    },
    {
      title: 'Mức độ quan trọng',
      dataIndex: 'criticality_level',
      key: 'criticality_level',
      width: 150,
      responsive: ['lg'] as any,
      render: (level: string, record: System) => (
        <Tag color={getCriticalityColor(level)}>
          {record.criticality_display || level}
        </Tag>
      ),
    },
    {
      title: 'Người quản lý',
      dataIndex: 'business_owner',
      key: 'business_owner',
      width: 150,
      ellipsis: {
        showTitle: true,
      },
      responsive: ['md'] as any,
    },
    {
      title: 'Số người dùng',
      dataIndex: 'users_total',
      key: 'users_total',
      width: 120,
      align: 'right',
      responsive: ['md'] as any,
      render: (value: number) => value?.toLocaleString() || 0,
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 100,
      fixed: isMobile ? undefined : 'right',
      render: (_: any, record: System) => (
        <Button
          type="link"
          size="small"
          icon={<EyeOutlined />}
          onClick={() => navigate(`/systems/${record.id}`)}
        >
          Xem
        </Button>
      ),
    },
  ];

  return (
    <Card
      title={
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text strong>Danh sách hệ thống</Text>
          {!loading && (
            <Text type="secondary" style={{ fontSize: 14, fontWeight: 'normal' }}>
              Tổng: {pagination?.total || systems.length} hệ thống
            </Text>
          )}
        </div>
      }
      style={{ marginTop: 24 }}
    >
      <Table
        columns={columns}
        dataSource={systems}
        rowKey="id"
        loading={loading}
        pagination={pagination || false}
        onChange={onChange}
        scroll={{ x: isMobile ? 400 : 1200 }}
        locale={{
          emptyText: (
            <Empty
              image={<InboxOutlined style={{ fontSize: 48, color: '#bfbfbf' }} />}
              description={
                <span style={{ color: '#8c8c8c' }}>
                  Không tìm thấy hệ thống nào
                </span>
              }
            />
          ),
        }}
      />
    </Card>
  );
};

export default DashboardSystemsList;
