import { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
  message,
  Tag,
  Space,
  Popconfirm,
  Typography,
} from 'antd';
import {
  PlusOutlined,
  CheckCircleOutlined,
  StopOutlined,
  UserOutlined,
  DeleteOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import api from '../config/api';
import type { User, Organization } from '../types';

const { Title } = Typography;

interface UserFormValues {
  username: string;
  email: string;
  password: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  role: 'admin' | 'org_user';
  organization?: number;
}

const Users = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingOrgs, setLoadingOrgs] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [deleteWarning, setDeleteWarning] = useState<string>('');
  const [form] = Form.useForm<UserFormValues>();
  const [selectedRole, setSelectedRole] = useState<'admin' | 'org_user'>('org_user');

  useEffect(() => {
    fetchUsers();
    fetchOrganizations();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await api.get<any>('/users/');
      // Handle both array and paginated response
      const usersData = Array.isArray(response.data)
        ? response.data
        : response.data.results || [];
      setUsers(usersData);
    } catch (error: any) {
      message.error('Lỗi khi tải danh sách người dùng');
    } finally {
      setLoading(false);
    }
  };

  const fetchOrganizations = async () => {
    try {
      console.log("Fetching organizations...");
      const response = await api.get<any>('/organizations/');
      console.log("Response data:", response.data);
      console.log("Is array?", Array.isArray(response.data));
      // Handle both array and paginated response
      const orgs = Array.isArray(response.data)
        ? response.data
        : response.data.results || [];
      console.log("Orgs extracted:", orgs);
      console.log("Orgs length:", orgs.length);
      setOrganizations(orgs);
      setLoadingOrgs(false);
    } catch (error) {
      console.error("Error fetching organizations:", error);
      message.error('Lỗi khi tải danh sách đơn vị');
      setLoadingOrgs(false);
    }
  };

  const handleCreate = async (values: UserFormValues) => {
    try {
      await api.post('/users/', values);
      message.success('Tạo người dùng thành công!');
      setIsModalOpen(false);
      form.resetFields();
      fetchUsers();
    } catch (error: any) {
      const errorMsg = error.response?.data?.username?.[0] ||
                       error.response?.data?.email?.[0] ||
                       'Tạo người dùng thất bại';
      message.error(errorMsg);
    }
  };

  const handleDeactivate = async (userId: number) => {
    try {
      await api.post(`/users/${userId}/deactivate/`);
      message.success('Vô hiệu hóa người dùng thành công');
      fetchUsers();
    } catch (error: any) {
      message.error(error.response?.data?.error || 'Vô hiệu hóa thất bại');
    }
  };

  const handleActivate = async (userId: number) => {
    try {
      await api.post(`/users/${userId}/activate/`);
      message.success('Kích hoạt người dùng thành công');
      fetchUsers();
    } catch (error) {
      message.error('Kích hoạt thất bại');
    }
  };

  const showDeleteConfirm = (user: User) => {
    setUserToDelete(user);

    // Generate warning message
    let warning = `Bạn có chắc muốn xóa người dùng "${user.username}"?`;

    if (user.organization_name) {
      warning += `\n\nLưu ý: Người dùng này thuộc đơn vị "${user.organization_name}". `;
      warning += 'Nếu đây là người dùng cuối cùng của đơn vị, các hệ thống của đơn vị sẽ không còn ai quản lý.';
    }

    setDeleteWarning(warning);
    setDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    if (!userToDelete) return;

    try {
      const response = await api.delete(`/users/${userToDelete.id}/`);

      if (response.data.warning) {
        message.warning(response.data.warning, 10);
      } else {
        message.success('Xóa người dùng thành công');
      }

      setDeleteModalOpen(false);
      setUserToDelete(null);
      fetchUsers();
    } catch (error: any) {
      message.error(error.response?.data?.error || 'Xóa người dùng thất bại');
    }
  };

  const columns: ColumnsType<User> = [
    {
      title: 'Tên đăng nhập',
      dataIndex: 'username',
      key: 'username',
      width: 150,
      render: (text) => (
        <Space>
          <UserOutlined />
          <span>{text}</span>
        </Space>
      ),
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      width: 200,
    },
    {
      title: 'Họ và tên',
      key: 'fullname',
      width: 180,
      render: (_, record) => {
        const fullName = [record.first_name, record.last_name]
          .filter(Boolean)
          .join(' ');
        return fullName || '-';
      },
    },
    {
      title: 'Vai trò',
      dataIndex: 'role',
      key: 'role',
      width: 120,
      render: (role: string) => (
        <Tag color={role === 'admin' ? 'red' : 'blue'}>
          {role === 'admin' ? 'Quản trị viên' : 'Người dùng đơn vị'}
        </Tag>
      ),
    },
    {
      title: 'Đơn vị',
      dataIndex: 'organization_name',
      key: 'organization_name',
      width: 200,
      render: (text) => text || '-',
    },
    {
      title: 'Trạng thái',
      dataIndex: 'is_active',
      key: 'is_active',
      width: 120,
      render: (isActive: boolean) => (
        <Tag color={isActive ? 'green' : 'red'}>
          {isActive ? 'Hoạt động' : 'Vô hiệu hóa'}
        </Tag>
      ),
    },
    {
      title: 'Hành động',
      key: 'action',
      width: 280,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          {record.is_active ? (
            <Popconfirm
              title="Vô hiệu hóa người dùng"
              description="Bạn có chắc muốn vô hiệu hóa người dùng này?"
              onConfirm={() => handleDeactivate(record.id)}
              okText="Có"
              cancelText="Không"
            >
              <Button
                type="text"
                danger
                size="small"
                icon={<StopOutlined />}
              >
                Vô hiệu hóa
              </Button>
            </Popconfirm>
          ) : (
            <Popconfirm
              title="Kích hoạt người dùng"
              description="Bạn có chắc muốn kích hoạt lại người dùng này?"
              onConfirm={() => handleActivate(record.id)}
              okText="Có"
              cancelText="Không"
            >
              <Button
                type="text"
                size="small"
                icon={<CheckCircleOutlined />}
                style={{ color: '#52c41a' }}
              >
                Kích hoạt
              </Button>
            </Popconfirm>
          )}
          <Button
            type="text"
            danger
            size="small"
            icon={<DeleteOutlined />}
            onClick={() => showDeleteConfirm(record)}
          >
            Xóa
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div
        style={{
          marginBottom: 16,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Title level={3} style={{ margin: 0 }}>
          Quản lý Người dùng
        </Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setIsModalOpen(true)}
        >
          Tạo người dùng
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={users}
        rowKey="id"
        loading={loading}
        pagination={{
          pageSize: 20,
          showSizeChanger: true,
          showTotal: (total) => `Tổng ${total} người dùng`,
        }}
        scroll={{ x: 1200 }}
      />

      <Modal
        title="Tạo người dùng mới"
        open={isModalOpen}
        onCancel={() => {
          setIsModalOpen(false);
          form.resetFields();
        }}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleCreate}
          initialValues={{ role: 'org_user' }}
        >
          <Form.Item
            name="username"
            label="Tên đăng nhập"
            rules={[
              { required: true, message: 'Vui lòng nhập tên đăng nhập' },
              { min: 3, message: 'Tên đăng nhập phải có ít nhất 3 ký tự' },
            ]}
          >
            <Input placeholder="username" />
          </Form.Item>

          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: 'Vui lòng nhập email' },
              { type: 'email', message: 'Email không hợp lệ' },
            ]}
          >
            <Input placeholder="user@example.com" />
          </Form.Item>

          <Form.Item
            name="password"
            label="Mật khẩu"
            rules={[
              { required: true, message: 'Vui lòng nhập mật khẩu' },
              { min: 8, message: 'Mật khẩu phải có ít nhất 8 ký tự' },
            ]}
          >
            <Input.Password placeholder="Mật khẩu" />
          </Form.Item>

          <Form.Item name="first_name" label="Họ">
            <Input placeholder="Nguyễn" />
          </Form.Item>

          <Form.Item name="last_name" label="Tên">
            <Input placeholder="Văn A" />
          </Form.Item>

          <Form.Item name="phone" label="Số điện thoại">
            <Input placeholder="024 1234 5678" />
          </Form.Item>

          <Form.Item
            name="role"
            label="Vai trò"
            rules={[{ required: true, message: 'Vui lòng chọn vai trò' }]}
          >
            <Select
              placeholder="Chọn vai trò"
              onChange={(value) => setSelectedRole(value)}
            >
              <Select.Option value="org_user">Người dùng đơn vị</Select.Option>
              <Select.Option value="admin">Quản trị viên</Select.Option>
            </Select>
          </Form.Item>

          {selectedRole === 'org_user' && !loadingOrgs && (
            <Form.Item
              name="organization"
              label="Đơn vị"
              rules={[
                {
                  required: selectedRole === 'org_user',
                  message: 'Vui lòng chọn đơn vị',
                },
              ]}
            >
              <Select
                placeholder="Chọn đơn vị"
                showSearch
                filterOption={(input, option) =>
                  (option?.label ?? '')
                    .toLowerCase()
                    .includes(input.toLowerCase())
                }
                options={organizations.map((org) => ({
                  value: org.id,
                  label: `${org.code} - ${org.name}`,
                }))}
              />
            </Form.Item>
          )}
          {selectedRole === 'org_user' && loadingOrgs && (
            <Form.Item label="Đơn vị">
              <Select
                placeholder="Đang tải danh sách đơn vị..."
                loading={true}
                disabled={true}
              />
            </Form.Item>
          )}

          <Form.Item style={{ marginBottom: 0, marginTop: 24 }}>
            <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
              <Button
                onClick={() => {
                  setIsModalOpen(false);
                  form.resetFields();
                }}
              >
                Hủy
              </Button>
              <Button type="primary" htmlType="submit">
                Tạo người dùng
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        title={
          <Space>
            <ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />
            <span>Xác nhận xóa người dùng</span>
          </Space>
        }
        open={deleteModalOpen}
        onOk={handleDelete}
        onCancel={() => {
          setDeleteModalOpen(false);
          setUserToDelete(null);
        }}
        okText="Xóa"
        cancelText="Hủy"
        okButtonProps={{ danger: true }}
      >
        <div style={{ whiteSpace: 'pre-line', marginTop: 16 }}>
          {deleteWarning}
        </div>
        <div style={{ marginTop: 16, padding: 12, background: '#fff1f0', borderRadius: 4, border: '1px solid #ffccc7' }}>
          <strong style={{ color: '#cf1322' }}>⚠️ Cảnh báo:</strong>
          <div style={{ marginTop: 8 }}>
            Hành động này không thể hoàn tác. Tất cả dữ liệu liên quan đến người dùng này sẽ bị mất.
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Users;
