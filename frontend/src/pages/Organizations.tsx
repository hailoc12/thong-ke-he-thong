import { useState, useEffect } from 'react';
import { Table, Button, Space, Typography, Input, Modal, Form, message, Popconfirm } from 'antd';
import { PlusOutlined, SearchOutlined, DeleteOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import type { ColumnsType } from 'antd/es/table';
import api from '../config/api';
import { useAuthStore } from '../stores/authStore';
import type { Organization, ApiResponse, OrganizationCreatePayload } from '../types';

const { Title } = Typography;
const { TextArea } = Input;

const Organizations = () => {
  const navigate = useNavigate();
  const { isAdmin } = useAuthStore();
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 20,
    total: 0,
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [form] = Form.useForm();

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

  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    form.resetFields();
  };

  const handleCreateOrganization = async (values: OrganizationCreatePayload) => {
    setModalLoading(true);
    try {
      await api.post('/organizations/', values);
      message.success('Tạo đơn vị thành công!');
      setIsModalOpen(false);
      form.resetFields();
      fetchOrganizations(1);
    } catch (error: any) {
      console.error('Failed to create organization:', error);
      message.error(error.response?.data?.message || 'Có lỗi xảy ra khi tạo đơn vị');
    } finally {
      setModalLoading(false);
    }
  };

  const handleDelete = async (id: number, name: string) => {
    try {
      await api.delete(`/organizations/${id}/`);
      message.success(`Đã xóa đơn vị "${name}" thành công`);
      fetchOrganizations(pagination.current);
    } catch (error: any) {
      console.error('Failed to delete organization:', error);
      const errorMessage = error.response?.data?.error || 'Có lỗi xảy ra khi xóa đơn vị';
      message.error(errorMessage, 8); // Show error for 8 seconds
    }
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
      width: 200,
      fixed: 'right',
      render: (_: any, record: Organization) => (
        <Space size="small">
          <Button type="link" size="small" onClick={() => navigate(`/organizations/${record.id}`)}>
            Xem
          </Button>
          <Button type="link" size="small" onClick={() => navigate(`/organizations/${record.id}/edit`)}>
            Sửa
          </Button>
          {isAdmin && (
            <Popconfirm
              title="Xóa đơn vị"
              description={
                <div style={{ maxWidth: 300 }}>
                  <p>Bạn có chắc chắn muốn xóa đơn vị <strong>"{record.name}"</strong>?</p>
                  <p style={{ color: '#ff4d4f', marginTop: 8, marginBottom: 0 }}>
                    <ExclamationCircleOutlined /> Thao tác này KHÔNG THỂ HOÀN TÁC!
                  </p>
                </div>
              }
              onConfirm={() => handleDelete(record.id, record.name)}
              okText="Xóa"
              cancelText="Hủy"
              okButtonProps={{ danger: true }}
            >
              <Button type="text" danger size="small" icon={<DeleteOutlined />}>
                Xóa
              </Button>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <div>
          <Title level={2} style={{ margin: 0 }}>
            Danh sách Đơn vị
          </Title>
          <div style={{ color: '#666', fontSize: '14px', marginTop: 4 }}>
            Tổng số: <strong style={{ color: '#1890ff', fontSize: '16px' }}>{pagination.total}</strong> đơn vị
          </div>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={showModal}>
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

      <Modal
        title="Thêm đơn vị mới"
        open={isModalOpen}
        onCancel={handleCancel}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleCreateOrganization}
        >
          <Form.Item
            name="name"
            label="Tên đơn vị"
            rules={[{ required: true, message: 'Vui lòng nhập tên đơn vị' }]}
          >
            <Input placeholder="Nhập tên đơn vị" />
          </Form.Item>

          <Form.Item
            name="code"
            label="Mã đơn vị"
          >
            <Input placeholder="Nhập mã đơn vị (tùy chọn)" />
          </Form.Item>

          <Form.Item
            name="description"
            label="Mô tả"
          >
            <TextArea rows={3} placeholder="Mô tả đơn vị" />
          </Form.Item>

          <Form.Item
            name="contact_person"
            label="Người liên hệ"
          >
            <Input placeholder="Họ tên người liên hệ" />
          </Form.Item>

          <Form.Item
            name="contact_email"
            label="Email"
            rules={[{ type: 'email', message: 'Email không hợp lệ' }]}
          >
            <Input type="email" placeholder="Email liên hệ" />
          </Form.Item>

          <Form.Item
            name="contact_phone"
            label="Số điện thoại"
          >
            <Input placeholder="Số điện thoại liên hệ" />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button onClick={handleCancel}>Hủy</Button>
              <Button type="primary" htmlType="submit" loading={modalLoading}>
                Tạo đơn vị
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Organizations;
