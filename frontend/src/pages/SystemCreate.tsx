/**
 * P0.8: System Form Redesign - NEW VERSION
 * Simplified Tabs-based form with 24 new fields
 * Date: 2026-01-19
 */
import { useState, useEffect } from 'react';
import {
  Tabs,
  Form,
  Input,
  Select,
  Button,
  Card,
  Row,
  Col,
  InputNumber,
  Switch,
  Checkbox,
  message,
  Spin,
  Typography,
  Tag,
  Space,
} from 'antd';
import {
  ArrowLeftOutlined,
  SaveOutlined,
  InfoCircleOutlined,
  AppstoreOutlined,
  DatabaseOutlined,
  ApiOutlined,
  SafetyOutlined,
  CloudServerOutlined,
  ToolOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import api from '../config/api';
import type { Organization } from '../types';

const { Title, Text } = Typography;
const { TextArea } = Input;

const SystemCreate = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [userRole, setUserRole] = useState<string>('');

  useEffect(() => {
    fetchOrganizations();
    checkUserRole();
  }, []);

  const fetchOrganizations = async () => {
    try {
      const response = await api.get('/organizations/');
      setOrganizations(response.data.results || []);
    } catch (error) {
      console.error('Failed to fetch organizations:', error);
    }
  };

  const checkUserRole = async () => {
    try {
      const response = await api.get('/auth/me/');
      setUserRole(response.data.role);
      if (response.data.organization) {
        form.setFieldsValue({ org: response.data.organization });
      }
    } catch (error) {
      console.error('Failed to fetch user info:', error);
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      // Build payload - all fields are now flat (no nested _data objects)
      const payload = {
        ...values,
        // org will be auto-filled by backend for org users
      };

      await api.post('/systems/', payload);
      message.success('Tạo hệ thống thành công!');
      navigate('/systems');
    } catch (error: any) {
      console.error('Failed to create system:', error);
      message.error(error.response?.data?.message || 'Tạo hệ thống thất bại!');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/systems');
  };

  // Helper component for dynamic list input
  const DynamicListInput = ({ value = [], onChange, placeholder }: any) => {
    const [items, setItems] = useState<string[]>(value);
    const [inputValue, setInputValue] = useState('');

    const handleAdd = () => {
      if (inputValue.trim()) {
        const newItems = [...items, inputValue.trim()];
        setItems(newItems);
        onChange?.(newItems);
        setInputValue('');
      }
    };

    const handleRemove = (index: number) => {
      const newItems = items.filter((_, i) => i !== index);
      setItems(newItems);
      onChange?.(newItems);
    };

    return (
      <div>
        <Space.Compact style={{ width: '100%', marginBottom: 8 }}>
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onPressEnter={handleAdd}
            placeholder={placeholder}
          />
          <Button type="primary" onClick={handleAdd}>
            Thêm
          </Button>
        </Space.Compact>
        <div>
          {items.map((item, index) => (
            <Tag
              key={index}
              closable
              onClose={() => handleRemove(index)}
              style={{ marginBottom: 8 }}
            >
              {item}
            </Tag>
          ))}
        </div>
      </div>
    );
  };

  const tabItems = [
    {
      key: '1',
      label: (
        <span>
          <InfoCircleOutlined /> Thông tin cơ bản
        </span>
      ),
      children: (
        <Card>
          <Row gutter={[16, 16]}>
            {/* Organization - admin only */}
            {userRole === 'admin' && (
              <Col span={12}>
                <Form.Item
                  label="Tổ chức"
                  name="org"
                  rules={[{ required: true, message: 'Vui lòng chọn tổ chức' }]}
                >
                  <Select
                    showSearch
                    placeholder="Chọn tổ chức"
                    options={organizations.map((org) => ({
                      label: org.name,
                      value: org.id,
                    }))}
                    filterOption={(input, option) =>
                      (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                    }
                  />
                </Form.Item>
              </Col>
            )}

            <Col span={12}>
              <Form.Item
                label="Tên hệ thống"
                name="system_name"
                rules={[{ required: true, message: 'Vui lòng nhập tên hệ thống' }]}
              >
                <Input placeholder="Nhập tên hệ thống" />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item label="Tên tiếng Anh" name="system_name_en">
                <Input placeholder="Nhập tên tiếng Anh" />
              </Form.Item>
            </Col>

            <Col span={24}>
              <Text type="secondary">
                <InfoCircleOutlined /> Mã hệ thống sẽ được tự động tạo sau khi lưu (SYS-ORG-YYYY-XXXX)
              </Text>
            </Col>

            <Col span={24}>
              <Form.Item
                label="Mô tả"
                name="description"
                rules={[{ required: true, message: 'Vui lòng nhập mô tả' }]}
              >
                <TextArea rows={4} placeholder="Mô tả chức năng và mục đích của hệ thống" />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                label="Trạng thái"
                name="status"
                initialValue="operating"
                rules={[{ required: true, message: 'Vui lòng chọn trạng thái' }]}
              >
                <Select>
                  <Select.Option value="operating">Đang vận hành</Select.Option>
                  <Select.Option value="planning">Đang lập kế hoạch</Select.Option>
                  <Select.Option value="development">Đang phát triển</Select.Option>
                  <Select.Option value="testing">Đang thử nghiệm</Select.Option>
                  <Select.Option value="inactive">Ngừng hoạt động</Select.Option>
                  <Select.Option value="maintenance">Bảo trì</Select.Option>
                </Select>
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                label="Mức độ quan trọng"
                name="criticality_level"
                initialValue="medium"
                rules={[{ required: true, message: 'Vui lòng chọn mức độ quan trọng' }]}
                tooltip="P0.8: Đã bỏ 'Cực kỳ quan trọng' - chỉ còn 3 mức"
              >
                <Select>
                  <Select.Option value="high">Quan trọng</Select.Option>
                  <Select.Option value="medium">Trung bình</Select.Option>
                  <Select.Option value="low">Thấp</Select.Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
        </Card>
      ),
    },
    {
      key: '2',
      label: (
        <span>
          <AppstoreOutlined /> Bối cảnh nghiệp vụ
        </span>
      ),
      children: (
        <Card>
          <Row gutter={[16, 16]}>
            <Col span={24}>
              <Form.Item
                label="Mục tiêu nghiệp vụ"
                name="business_objectives"
                initialValue={[]}
                tooltip="Khuyến nghị tối đa 5 mục tiêu để tập trung"
              >
                <DynamicListInput placeholder="Nhập mục tiêu nghiệp vụ và nhấn Enter" />
              </Form.Item>
            </Col>

            <Col span={24}>
              <Form.Item
                label="Quy trình nghiệp vụ chính"
                name="business_processes"
                initialValue={[]}
              >
                <DynamicListInput placeholder="Nhập quy trình nghiệp vụ và nhấn Enter" />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                label="Có đủ hồ sơ phân tích thiết kế?"
                name="has_design_documents"
                valuePropName="checked"
                initialValue={false}
              >
                <Switch />
              </Form.Item>
            </Col>

            <Col span={24}>
              <Form.Item
                label="Đối tượng sử dụng"
                name="user_types"
                initialValue={[]}
              >
                <Checkbox.Group>
                  <Row>
                    <Col span={8}>
                      <Checkbox value="internal_leadership">Lãnh đạo nội bộ</Checkbox>
                    </Col>
                    <Col span={8}>
                      <Checkbox value="internal_staff">Cán bộ nội bộ</Checkbox>
                    </Col>
                    <Col span={8}>
                      <Checkbox value="internal_reviewer">Người thẩm định nội bộ</Checkbox>
                    </Col>
                    <Col span={8}>
                      <Checkbox value="external_business">Doanh nghiệp</Checkbox>
                    </Col>
                    <Col span={8}>
                      <Checkbox value="external_citizen">Người dân</Checkbox>
                    </Col>
                    <Col span={8}>
                      <Checkbox value="external_local">Địa phương</Checkbox>
                    </Col>
                    <Col span={8}>
                      <Checkbox value="external_agency">Cơ quan khác</Checkbox>
                    </Col>
                  </Row>
                </Checkbox.Group>
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item label="Số lượng người dùng hàng năm" name="annual_users">
                <InputNumber
                  min={0}
                  style={{ width: '100%' }}
                  placeholder="Nhập số lượng người dùng"
                  formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                />
              </Form.Item>
            </Col>
          </Row>
        </Card>
      ),
    },
    {
      key: '3',
      label: (
        <span>
          <DatabaseOutlined /> Kiến trúc công nghệ
        </span>
      ),
      children: (
        <Card>
          <Row gutter={[16, 16]}>
            <Col span={12}>
              <Form.Item label="Ngôn ngữ lập trình" name="programming_language">
                <Input placeholder="VD: Python, Java, JavaScript, C#" />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item label="Framework/Thư viện" name="framework">
                <Input placeholder="VD: Django, Spring Boot, React, Angular" />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item label="Cơ sở dữ liệu" name="database_name">
                <Input placeholder="VD: PostgreSQL, MySQL, MongoDB, Oracle" />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item label="Nền tảng triển khai" name="hosting_platform">
                <Select placeholder="Chọn nền tảng">
                  <Select.Option value="cloud">Cloud</Select.Option>
                  <Select.Option value="on_premise">On-premise</Select.Option>
                  <Select.Option value="hybrid">Hybrid</Select.Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
        </Card>
      ),
    },
    {
      key: '4',
      label: (
        <span>
          <DatabaseOutlined /> Kiến trúc dữ liệu
        </span>
      ),
      children: (
        <Card>
          <Row gutter={[16, 16]}>
            <Col span={24}>
              <Form.Item label="Nguồn dữ liệu" name="data_sources" initialValue={[]}>
                <DynamicListInput placeholder="VD: Database, API, File, External System" />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item label="Phân loại dữ liệu" name="data_classification_type">
                <Input placeholder="VD: Public, Internal, Confidential, Secret" />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item label="Khối lượng dữ liệu" name="data_volume">
                <Input placeholder="VD: 100GB, 1TB, 10TB" />
              </Form.Item>
            </Col>
          </Row>
        </Card>
      ),
    },
    {
      key: '5',
      label: (
        <span>
          <ApiOutlined /> Tích hợp hệ thống
        </span>
      ),
      children: (
        <Card>
          <Row gutter={[16, 16]}>
            <Col span={12}>
              <Form.Item
                label="Hệ thống nội bộ tích hợp"
                name="integrated_internal_systems"
                initialValue={[]}
              >
                <DynamicListInput placeholder="Nhập tên hệ thống nội bộ" />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                label="Hệ thống bên ngoài tích hợp"
                name="integrated_external_systems"
                initialValue={[]}
              >
                <DynamicListInput placeholder="Nhập tên hệ thống bên ngoài" />
              </Form.Item>
            </Col>

            <Col span={24}>
              <Form.Item label="API/Webservices" name="api_list" initialValue={[]}>
                <DynamicListInput placeholder="Nhập API endpoint hoặc tên service" />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item label="Phương thức trao đổi dữ liệu" name="data_exchange_method">
                <Input placeholder="VD: REST API, SOAP, File Transfer, Database Sync" />
              </Form.Item>
            </Col>
          </Row>
        </Card>
      ),
    },
    {
      key: '6',
      label: (
        <span>
          <SafetyOutlined /> An toàn thông tin
        </span>
      ),
      children: (
        <Card>
          <Row gutter={[16, 16]}>
            <Col span={12}>
              <Form.Item label="Phương thức xác thực" name="authentication_method">
                <Select placeholder="Chọn phương thức">
                  <Select.Option value="username_password">Username/Password</Select.Option>
                  <Select.Option value="sso">SSO</Select.Option>
                  <Select.Option value="ldap">LDAP</Select.Option>
                  <Select.Option value="oauth">OAuth</Select.Option>
                  <Select.Option value="saml">SAML</Select.Option>
                  <Select.Option value="biometric">Biometric</Select.Option>
                  <Select.Option value="other">Khác</Select.Option>
                </Select>
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                label="Mã hóa dữ liệu"
                name="has_encryption"
                valuePropName="checked"
                initialValue={false}
              >
                <Switch />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                label="Có log audit?"
                name="has_audit_log"
                valuePropName="checked"
                initialValue={false}
              >
                <Switch />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item label="Tuân thủ tiêu chuẩn" name="compliance_standards_list">
                <Input placeholder="VD: ISO 27001, GDPR, PCI DSS, SOC 2" />
              </Form.Item>
            </Col>
          </Row>
        </Card>
      ),
    },
    {
      key: '7',
      label: (
        <span>
          <CloudServerOutlined /> Hạ tầng kỹ thuật
        </span>
      ),
      children: (
        <Card>
          <Row gutter={[16, 16]}>
            <Col span={12}>
              <Form.Item label="Cấu hình máy chủ" name="server_configuration">
                <Input placeholder="VD: 8 CPU, 16GB RAM, 500GB SSD" />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item label="Dung lượng lưu trữ" name="storage_capacity">
                <Input placeholder="VD: 1TB, 5TB, 10TB" />
              </Form.Item>
            </Col>

            <Col span={24}>
              <Form.Item label="Phương án sao lưu" name="backup_plan">
                <TextArea rows={3} placeholder="VD: Sao lưu hàng ngày, lưu giữ 30 ngày" />
              </Form.Item>
            </Col>

            <Col span={24}>
              <Form.Item label="Kế hoạch khôi phục thảm họa" name="disaster_recovery_plan">
                <TextArea rows={3} placeholder="VD: RTO 4 giờ, RPO 1 giờ, standby site ở ..." />
              </Form.Item>
            </Col>
          </Row>
        </Card>
      ),
    },
    {
      key: '8',
      label: (
        <span>
          <ToolOutlined /> Vận hành
        </span>
      ),
      children: (
        <Card>
          <Row gutter={[16, 16]}>
            <Col span={12}>
              <Form.Item label="Người chịu trách nhiệm" name="business_owner">
                <Input placeholder="Tên người chịu trách nhiệm" />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item label="Người quản trị kỹ thuật" name="technical_owner">
                <Input placeholder="Tên người quản trị kỹ thuật" />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item label="Số điện thoại liên hệ" name="responsible_phone">
                <Input placeholder="Số điện thoại" />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item label="Email liên hệ" name="responsible_email">
                <Input type="email" placeholder="Email" />
              </Form.Item>
            </Col>
          </Row>
        </Card>
      ),
    },
  ];

  return (
    <Spin spinning={loading}>
      <div style={{ padding: '24px', background: '#f0f2f5', minHeight: '100vh' }}>
        <Card>
          <div style={{ marginBottom: 24 }}>
            <Button icon={<ArrowLeftOutlined />} onClick={handleCancel}>
              Quay lại
            </Button>
            <Title level={2} style={{ marginTop: 16 }}>
              Tạo hệ thống mới
            </Title>
            <Text type="secondary">
              P0.8: Form mới với 8 phần - Điền thông tin hệ thống theo từng tab
            </Text>
          </div>

          <Form form={form} layout="vertical" scrollToFirstError>
            <Tabs items={tabItems} />

            <div style={{ marginTop: 24, textAlign: 'right' }}>
              <Space>
                <Button onClick={handleCancel}>Hủy</Button>
                <Button type="primary" icon={<SaveOutlined />} onClick={handleSubmit}>
                  Lưu hệ thống
                </Button>
              </Space>
            </div>
          </Form>
        </Card>
      </div>
    </Spin>
  );
};

export default SystemCreate;
