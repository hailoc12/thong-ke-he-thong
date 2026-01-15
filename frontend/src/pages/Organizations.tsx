import { useState, useEffect } from 'react';
import { Table, Button, Space, Typography, Input } from 'antd';
import { PlusOutlined, SearchOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import api from '../config/api';
import { Organization, ApiResponse } from '../types';

const { Title } = Typography;

const Organizations = () => {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 20,
    total: 0,
  });

  useEffect(() => {
    fetchOrganizations();
  }, []);

  const fetchOrganizations = async (page = 1, search = '') => {
    setLoading(true);
    try {
      const response = await api.get<ApiResponse<Organization>>('/organizations/', {
        params: {
          page,
          search,
        },
      });
      setOrganizations(response.data.results || []);
      setPagination({
        current: page,
        pageSize: 20,
        total: response.data.count || 0,
      });
    } catch (error) {
      console.error('Failed to fetch organizations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTableChange = (pagination: any) => {
    fetchOrganizations(pagination.current);
  };

  const columns: ColumnsType<Organization> = [
    {
      title: 'Mã đơn vị',
      dataIndex: 'code',
      key: 'code',
      width: 120,
    },
    {
      title: 'Tên đơn vị',
      dataIndex: 'name',
      key: 'name',
      width: 250,
    },
    {
      title: 'Người liên hệ',
      dataIndex: 'contact_person',
      key: 'contact_person',
      width: 150,
    },
    {
      title: 'Email',
      dataIndex: 'contact_email',
      key: 'contact_email',
      width: 200,
    },
    {
      title: 'Số điện thoại',
      dataIndex: 'contact_phone',
      key: 'contact_phone',
      width: 150,
    },
    {
      title: 'Số hệ thống',
      dataIndex: 'system_count',
      key: 'system_count',
      width: 120,
      align: 'right',
      render: (value: number) => value || 0,
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 150,
      fixed: 'right',
      render: () => (
        <Space>
          <Button type="link" size="small">
            Xem
          </Button>
          <Button type="link" size="small">
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
          Danh sách Đơn vị
        </Title>
        <Button type="primary" icon={<PlusOutlined />}>
          Thêm đơn vị
        </Button>
      </div>

      <div style={{ marginBottom: 16 }}>
        <Input
          placeholder="Tìm kiếm theo tên, mã đơn vị..."
          prefix={<SearchOutlined />}
          style={{ width: 300 }}
          onPressEnter={(e) => fetchOrganizations(1, (e.target as HTMLInputElement).value)}
        />
      </div>

      <Table
        columns={columns}
        dataSource={organizations}
        rowKey="id"
        loading={loading}
        pagination={pagination}
        onChange={handleTableChange}
        scroll={{ x: 1000 }}
      />
    </div>
  );
};

export default Organizations;
