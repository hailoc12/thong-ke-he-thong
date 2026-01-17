import { useState, useEffect } from 'react';
import { Table, Button, Space, Typography, Tag, Input, Empty } from 'antd';
import { PlusOutlined, SearchOutlined, InboxOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import type { ColumnsType } from 'antd/es/table';
import api from '../config/api';
import type { System, ApiResponse } from '../types';

const { Title } = Typography;

const Systems = () => {
  const navigate = useNavigate();
  const [systems, setSystems] = useState<System[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 20,
    total: 0,
  });
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    fetchSystems();
  }, []);

  const fetchSystems = async (page = 1, search = '') => {
    setLoading(true);
    try {
      const response = await api.get<ApiResponse<System>>('/systems/', {
        params: {
          page,
          search,
        },
      });
      setSystems(response.data.results || []);
      setPagination({
        current: page,
        pageSize: 20,
        total: response.data.count || 0,
      });
    } catch (error) {
      console.error('Failed to fetch systems:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTableChange = (pagination: any) => {
    fetchSystems(pagination.current);
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      active: 'green',
      operating: 'green',
      inactive: 'red',
      maintenance: 'orange',
      planning: 'blue',
      draft: 'default',
    };
    return colors[status.toLowerCase()] || 'default';
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, { full: string; short: string }> = {
      active: { full: 'Hoạt động', short: 'Hoạt động' },
      operating: { full: 'Hoạt động', short: 'Hoạt động' },
      inactive: { full: 'Ngưng', short: 'Ngưng' },
      maintenance: { full: 'Bảo trì', short: 'Bảo trì' },
      planning: { full: 'Lập kế hoạch', short: 'Kế hoạch' },
      draft: { full: 'Bản nháp', short: 'Nháp' },
    };
    return labels[status.toLowerCase()] || { full: status, short: status };
  };

  const getCriticalityColor = (level: string) => {
    const colors: Record<string, string> = {
      critical: 'red',
      high: 'orange',
      medium: 'blue',
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
      fixed: isMobile ? undefined : 'left',
      responsive: ['md'] as any, // Hide on mobile
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
      width: 180,
      ellipsis: {
        showTitle: true,
      },
      responsive: ['lg'] as any, // Hide on mobile and tablet
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: isMobile ? 90 : 120,
      render: (status: string) => {
        const label = getStatusLabel(status);
        return (
          <Tag color={getStatusColor(status)}>
            {isMobile ? label.short : label.full}
          </Tag>
        );
      },
    },
    {
      title: 'Mức độ',
      dataIndex: 'criticality_level',
      key: 'criticality_level',
      width: 120,
      responsive: ['lg'] as any, // Hide on mobile and tablet
      render: (level: string, record: System) => (
        <Tag color={getCriticalityColor(level)}>
          {record.criticality_display}
        </Tag>
      ),
    },
    {
      title: 'Người quản lý',
      dataIndex: 'business_owner',
      key: 'business_owner',
      width: 150,
      responsive: ['lg'] as any, // Hide on mobile and tablet
    },
    {
      title: 'Số người dùng',
      dataIndex: 'users_total',
      key: 'users_total',
      width: 120,
      align: 'right',
      responsive: ['md'] as any, // Hide on mobile
      render: (value: number) => value?.toLocaleString() || 0,
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: isMobile ? 100 : 120,
      fixed: isMobile ? undefined : 'right',
      render: (_: any, record: System) => (
        <Space direction={isMobile ? 'vertical' : 'horizontal'} size="small">
          <Button type="link" size="small" onClick={() => navigate(`/systems/${record.id}`)}>
            Xem
          </Button>
          <Button type="link" size="small" onClick={() => navigate(`/systems/${record.id}/edit`)}>
            Sửa
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
        alignItems: isMobile ? 'flex-start' : 'center',
        gap: isMobile ? 12 : 0,
        marginBottom: 16
      }}>
        <Title level={isMobile ? 3 : 2} style={{ margin: 0 }}>
          Danh sách Hệ thống
        </Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/systems/create')} block={isMobile}>
          {isMobile ? 'Thêm' : 'Thêm hệ thống'}
        </Button>
      </div>

      <div style={{ marginBottom: 16 }}>
        <Input
          placeholder={isMobile ? "Tìm kiếm..." : "Tìm kiếm theo tên, mã hệ thống..."}
          prefix={<SearchOutlined />}
          style={{ width: isMobile ? '100%' : 300 }}
          onPressEnter={(e) => fetchSystems(1, (e.target as HTMLInputElement).value)}
        />
      </div>

      <Table
        columns={columns}
        dataSource={systems}
        rowKey="id"
        loading={loading}
        locale={{
          emptyText: (
            <Empty
              image={<InboxOutlined style={{ fontSize: 48, color: '#bfbfbf' }} />}
              description={
                <span style={{ color: '#8c8c8c' }}>
                  Chưa có hệ thống nào
                </span>
              }
            >
              <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/systems/create')}>
                Thêm hệ thống mới
              </Button>
            </Empty>
          ),
        }}
        pagination={{
          ...pagination,
          ...(isMobile && { size: 'small' as const }),
          showSizeChanger: !isMobile,
          showQuickJumper: !isMobile,
        }}
        onChange={handleTableChange}
        scroll={{ x: isMobile ? 400 : 1200 }}
      />
    </div>
  );
};

export default Systems;
