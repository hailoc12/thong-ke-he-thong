import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Form, Input, Button, Space, Spin, message, Typography } from 'antd';
import { SaveOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import api from '../config/api';
import type { Organization, OrganizationCreatePayload } from '../types';

const { Title } = Typography;
const { TextArea } = Input;

const OrganizationEdit = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchOrganization();
  }, [id]);

  const fetchOrganization = async () => {
    setLoading(true);
    try {
      const response = await api.get<Organization>(`/organizations/${id}/`);
      const org = response.data;

      // Pre-populate form
      form.setFieldsValue({
        name: org.name,
        code: org.code,
        description: org.description,
        contact_person: org.contact_person,
        contact_email: org.contact_email,
        contact_phone: org.contact_phone,
      });
    } catch (error) {
      console.error('Failed to fetch organization:', error);
      message.error('Không thể tải thông tin đơn vị');
      navigate('/organizations');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values: OrganizationCreatePayload) => {
    setSubmitting(true);
    try {
      await api.patch(`/organizations/${id}/`, values);
      message.success('Cập nhật đơn vị thành công!');
      navigate(`/organizations/${id}`);
    } catch (error: any) {
      console.error('Failed to update organization:', error);

      // Handle specific error messages
      if (error.response?.data) {
        const errorData = error.response.data;
        if (errorData.name) {
          message.error(`Tên đơn vị: ${errorData.name[0]}`);
        } else if (errorData.code) {
          message.error(`Mã đơn vị: ${errorData.code[0]}`);
        } else {
          message.error('Có lỗi xảy ra khi cập nhật đơn vị');
        }
      } else {
        message.error('Có lỗi xảy ra khi cập nhật đơn vị');
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div>
      <Space style={{ marginBottom: 16 }}>
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate(`/organizations/${id}`)}
        >
          Quay lại
        </Button>
      </Space>

      <Card title={<Title level={3} style={{ margin: 0 }}>Chỉnh sửa đơn vị</Title>}>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          style={{ maxWidth: 800 }}
        >
          <Form.Item
            name="name"
            label="Tên đơn vị"
            rules={[
              { required: true, message: 'Vui lòng nhập tên đơn vị' },
              { max: 255, message: 'Tên đơn vị không được quá 255 ký tự' }
            ]}
          >
            <Input placeholder="Nhập tên đơn vị" />
          </Form.Item>

          <Form.Item
            name="code"
            label="Mã đơn vị"
            rules={[
              { max: 50, message: 'Mã đơn vị không được quá 50 ký tự' }
            ]}
          >
            <Input placeholder="Nhập mã đơn vị (tùy chọn)" />
          </Form.Item>

          <Form.Item
            name="description"
            label="Mô tả"
          >
            <TextArea
              rows={4}
              placeholder="Mô tả về đơn vị, chức năng, nhiệm vụ..."
              showCount
              maxLength={1000}
            />
          </Form.Item>

          <Form.Item
            name="contact_person"
            label="Người liên hệ"
            rules={[
              { max: 255, message: 'Tên người liên hệ không được quá 255 ký tự' }
            ]}
          >
            <Input placeholder="Tên người phụ trách hoặc liên hệ" />
          </Form.Item>

          <Form.Item
            name="contact_email"
            label="Email liên hệ"
            rules={[
              { type: 'email', message: 'Email không hợp lệ' }
            ]}
          >
            <Input placeholder="email@example.com" />
          </Form.Item>

          <Form.Item
            name="contact_phone"
            label="Số điện thoại"
            rules={[
              { max: 20, message: 'Số điện thoại không được quá 20 ký tự' },
              {
                pattern: /^[0-9\s\-\+\(\)]+$/,
                message: 'Số điện thoại chỉ được chứa số và các ký tự: + - ( ) khoảng trắng'
              }
            ]}
          >
            <Input placeholder="024 1234 5678" />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button
                type="primary"
                htmlType="submit"
                icon={<SaveOutlined />}
                loading={submitting}
              >
                Cập nhật đơn vị
              </Button>
              <Button onClick={() => navigate(`/organizations/${id}`)}>
                Hủy
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default OrganizationEdit;
