import { useState, useEffect } from 'react';
import { Form, Input, Button, Card, Typography, message, Select } from 'antd';
import { UserAddOutlined, LockOutlined, MailOutlined, PhoneOutlined, BankOutlined } from '@ant-design/icons';
import { useNavigate, Link } from 'react-router-dom';
import api from '../config/api';

const { Title, Text } = Typography;
const { Option } = Select;

interface Organization {
  id: number;
  code: string;
  name: string;
}

interface RegisterForm {
  username: string;
  email: string;
  password: string;
  password_confirm: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  organization: number;
}

const Register = () => {
  const [loading, setLoading] = useState(false);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchOrganizations();
  }, []);

  const fetchOrganizations = async () => {
    try {
      const response = await api.get('/organizations/');
      setOrganizations(response.data.results || []);
    } catch (error) {
      console.error('Failed to fetch organizations:', error);
    }
  };

  const onFinish = async (values: RegisterForm) => {
    setLoading(true);
    try {
      await api.post('/users/register/', values);
      message.success('Đăng ký thành công! Đang chuyển đến trang đăng nhập...');
      setTimeout(() => {
        navigate('/login');
      }, 1500);
    } catch (error: any) {
      const errorMsg = error.response?.data?.username?.[0] ||
                      error.response?.data?.email?.[0] ||
                      error.response?.data?.message ||
                      'Đăng ký thất bại. Vui lòng thử lại.';
      message.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '20px',
      }}
    >
      <Card
        style={{
          width: '100%',
          maxWidth: 500,
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <img
            src="/logo-khcn.jpeg"
            alt="Bộ Khoa học và Công nghệ"
            style={{
              width: 120,
              height: 'auto',
              marginBottom: 16,
              borderRadius: 8
            }}
          />
          <Title level={3}>ĐĂNG KÝ TÀI KHOẢN</Title>
          <Text type="secondary">
            Bộ Khoa học và Công nghệ
          </Text>
        </div>

        <Form
          name="register"
          onFinish={onFinish}
          autoComplete="off"
          layout="vertical"
          size="large"
        >
          <Form.Item
            label="Đơn vị"
            name="organization"
            rules={[
              { required: true, message: 'Vui lòng chọn đơn vị!' },
            ]}
          >
            <Select
              placeholder="Chọn đơn vị của bạn"
              prefix={<BankOutlined />}
              showSearch
              filterOption={(input, option) =>
                String(option?.children || '').toLowerCase().includes(input.toLowerCase())
              }
            >
              {organizations.map(org => (
                <Option key={org.id} value={org.id}>
                  {org.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label="Tên đăng nhập"
            name="username"
            rules={[
              { required: true, message: 'Vui lòng nhập tên đăng nhập!' },
              { min: 3, message: 'Tên đăng nhập phải có ít nhất 3 ký tự!' },
            ]}
          >
            <Input
              prefix={<UserAddOutlined />}
              placeholder="Tên đăng nhập"
            />
          </Form.Item>

          <Form.Item
            label="Email"
            name="email"
            rules={[
              { required: true, message: 'Vui lòng nhập email!' },
              { type: 'email', message: 'Email không hợp lệ!' },
            ]}
          >
            <Input
              prefix={<MailOutlined />}
              placeholder="email@example.com"
            />
          </Form.Item>

          <Form.Item
            label="Họ và tên"
            style={{ marginBottom: 8 }}
          >
            <Input.Group compact>
              <Form.Item
                name="last_name"
                noStyle
                style={{ width: '50%' }}
              >
                <Input placeholder="Họ" style={{ width: '50%' }} />
              </Form.Item>
              <Form.Item
                name="first_name"
                noStyle
              >
                <Input placeholder="Tên" style={{ width: '50%' }} />
              </Form.Item>
            </Input.Group>
          </Form.Item>

          <Form.Item
            label="Số điện thoại"
            name="phone"
          >
            <Input
              prefix={<PhoneOutlined />}
              placeholder="0123456789"
            />
          </Form.Item>

          <Form.Item
            label="Mật khẩu"
            name="password"
            rules={[
              { required: true, message: 'Vui lòng nhập mật khẩu!' },
              { min: 8, message: 'Mật khẩu phải có ít nhất 8 ký tự!' },
            ]}
            hasFeedback
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Mật khẩu"
            />
          </Form.Item>

          <Form.Item
            label="Xác nhận mật khẩu"
            name="password_confirm"
            dependencies={['password']}
            hasFeedback
            rules={[
              { required: true, message: 'Vui lòng xác nhận mật khẩu!' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('Mật khẩu xác nhận không khớp!'));
                },
              }),
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Nhập lại mật khẩu"
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              block
              loading={loading}
            >
              Đăng ký
            </Button>
          </Form.Item>
        </Form>

        <div style={{ textAlign: 'center', marginTop: 16 }}>
          <Text type="secondary">
            Đã có tài khoản?{' '}
            <Link to="/login" style={{ fontWeight: 'bold' }}>
              Đăng nhập ngay
            </Link>
          </Text>
        </div>

        <div style={{ textAlign: 'center', marginTop: 16 }}>
          <Text type="secondary" style={{ fontSize: 12 }}>
            Phiên bản 1.0.0 - 2026
          </Text>
        </div>
      </Card>
    </div>
  );
};

export default Register;
