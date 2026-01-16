import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Descriptions, Button, Space, Spin, message, Table, Typography } from 'antd';
import { EditOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import api from '../config/api';
import type { Organization, System } from '../types';

const { Title } = Typography;

const OrganizationDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [systems, setSystems] = useState<System[]>([]);
  const [loading, setLoading] = useState(true);
  const [systemsLoading, setSystemsLoading] = useState(false);

  useEffect(() => {
    fetchOrganization();
    fetchSystems();
  }, [id]);

  const fetchOrganization = async () => {
    setLoading(true);
    try {
      const response = await api.get<Organization>(`/organizations/${id}/`);
      setOrganization(response.data);
    } catch (error) {
      console.error('Failed to fetch organization:', error);
      message.error('Không thể tải thông tin đơn vị');
      navigate('/organizations');
    } finally {
      setLoading(false);
    }
  };

  const fetchSystems = async () => {
    setSystemsLoading(true);
    try {
      const response = await api.get('/systems/', {
        params: { org: id, page_size: 100 }
      });
      setSystems(response.data.results || []);
    } catch (error) {
      console.error('Failed to fetch systems:', error);
    } finally {
      setSystemsLoading(false);
    }
  };

  const systemColumns: ColumnsType<System> = [
    {
      title: 'Mã hệ thống',
      dataIndex: 'system_code',
      key: 'system_code',
      width: 120,
    },
    {
      title: 'Tên hệ thống',
      dataIndex: 'system_name',
      key: 'system_name',
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status: string) => {
        const statusMap: Record<string, string> = {
          operating: 'Đang vận hành',
          pilot: 'Thí điểm',
          stopped: 'Dừng',
          replacing: 'Sắp thay thế',
        };
        return statusMap[status] || status;
      },
    },
    {
      title: 'Mức độ quan trọng',
      dataIndex: 'criticality_level',
      key: 'criticality_level',
      width: 150,
      render: (level: string) => {
        const levelMap: Record<string, string> = {
          critical: 'Tối quan trọng',
          high: 'Quan trọng',
          medium: 'Trung bình',
          low: 'Thấp',
        };
        return levelMap[level] || level;
      },
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 100,
      fixed: 'right',
      render: (_: any, record: System) => (
        <Button
          type="link"
          size="small"
          onClick={() => navigate(`/systems/${record.id}`)}
        >
          Xem
        </Button>
      ),
    },
  ];

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!organization) {
    return null;
  }

  return (
    <div>
      <Space style={{ marginBottom: 16 }}>
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate('/organizations')}
        >
          Quay lại
        </Button>
        <Button
          type="primary"
          icon={<EditOutlined />}
          onClick={() => navigate(`/organizations/${id}/edit`)}
        >
          Chỉnh sửa
        </Button>
      </Space>

      <Card title={<Title level={3} style={{ margin: 0 }}>Thông tin đơn vị</Title>}>
        <Descriptions bordered column={2}>
          <Descriptions.Item label="Mã đơn vị" span={1}>
            {organization.code || '-'}
          </Descriptions.Item>
          <Descriptions.Item label="Tên đơn vị" span={1}>
            {organization.name}
          </Descriptions.Item>
          <Descriptions.Item label="Mô tả" span={2}>
            {organization.description || '-'}
          </Descriptions.Item>
          <Descriptions.Item label="Người liên hệ" span={1}>
            {organization.contact_person || '-'}
          </Descriptions.Item>
          <Descriptions.Item label="Email" span={1}>
            {organization.contact_email || '-'}
          </Descriptions.Item>
          <Descriptions.Item label="Số điện thoại" span={1}>
            {organization.contact_phone || '-'}
          </Descriptions.Item>
          <Descriptions.Item label="Số hệ thống" span={1}>
            {systems.length}
          </Descriptions.Item>
        </Descriptions>
      </Card>

      <Card
        title={<Title level={4} style={{ margin: 0 }}>Danh sách hệ thống ({systems.length})</Title>}
        style={{ marginTop: 24 }}
      >
        <Table
          columns={systemColumns}
          dataSource={systems}
          rowKey="id"
          loading={systemsLoading}
          pagination={false}
          scroll={{ x: 800 }}
          locale={{
            emptyText: 'Chưa có hệ thống nào',
          }}
        />
      </Card>
    </div>
  );
};

export default OrganizationDetail;
