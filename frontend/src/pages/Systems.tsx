import { useState, useEffect } from 'react';
import { Table, Button, Space, Typography, Tag, Input } from 'antd';
import { PlusOutlined, SearchOutlined } from '@ant-design/icons';
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
      inactive: 'red',
      maintenance: 'orange',
      planning: 'blue',
      draft: 'default',
    };
    return colors[status] || 'default';
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
      fixed: 'left',
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
      width: 120,
      render: (status: string) => (
        <Tag color={getStatusColor(status)}>
          {status.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: 'Mức độ',
      dataIndex: 'criticality_level',
      key: 'criticality_level',
      width: 120,
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
    },
    {
      title: 'Số người dùng',
      dataIndex: 'users_total',
      key: 'users_total',
      width: 120,
      align: 'right',
      render: (value: number) => value?.toLocaleString() || 0,
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 120,
      fixed: 'right',
      render: (_: any, record: System) => (
        <Space>
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
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <Title level={2} style={{ margin: 0 }}>
          Danh sách Hệ thống
        </Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/systems/create')}>
          Thêm hệ thống
        </Button>
      </div>

      <div style={{ marginBottom: 16 }}>
        <Input
          placeholder="Tìm kiếm theo tên, mã hệ thống..."
          prefix={<SearchOutlined />}
          style={{ width: 300 }}
          onPressEnter={(e) => fetchSystems(1, (e.target as HTMLInputElement).value)}
        />
      </div>

      <Table
        columns={columns}
        dataSource={systems}
        rowKey="id"
        loading={loading}
        pagination={pagination}
        onChange={handleTableChange}
        scroll={{ x: 1200 }}
      />
    </div>
  );
};

export default Systems;
