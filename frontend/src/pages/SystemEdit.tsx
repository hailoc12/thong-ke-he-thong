/**
 * P0.8: System Form Redesign - EDIT VERSION
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
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../config/api';
import type { Organization } from '../types';
import { SelectWithOther } from '../components/form/SelectWithOther';

const { Title, Text } = Typography;
const { TextArea } = Input;

/**
 * P0.8 Phase 1: Predefined options for SelectWithOther components
 */
const systemGroupOptions = [
  { label: 'Nền tảng quốc gia', value: 'national_platform' },
  { label: 'Nền tảng dùng chung của Bộ', value: 'shared_platform' },
  { label: 'CSDL chuyên ngành', value: 'specialized_db' },
  { label: 'Ứng dụng nghiệp vụ', value: 'business_app' },
  { label: 'Cổng thông tin', value: 'portal' },
  { label: 'BI/Báo cáo', value: 'bi' },
  { label: 'ESB/Tích hợp', value: 'esb' },
  { label: 'Khác', value: 'other' },
];

const authenticationMethodOptions = [
  { label: 'Username/Password', value: 'username_password' },
  { label: 'SSO', value: 'sso' },
  { label: 'LDAP', value: 'ldap' },
  { label: 'OAuth', value: 'oauth' },
  { label: 'SAML', value: 'saml' },
  { label: 'Biometric', value: 'biometric' },
  { label: 'Khác', value: 'other' },
];

/**
 * P0.8 Phase 1 - Section 5: Integration Connection List Component
 * Complex dynamic form for managing integration connections
 */
interface IntegrationConnection {
  source_system: string;
  target_system: string;
  data_objects: string;
  integration_method: string;
  frequency: string;
  error_handling?: string;
  has_api_docs: boolean;
  notes?: string;
}

const IntegrationConnectionList = ({ value = [], onChange }: any) => {
  const [connections, setConnections] = useState<IntegrationConnection[]>(value || []);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editForm] = Form.useForm();

  useEffect(() => {
    setConnections(value || []);
  }, [value]);

  const integrationMethodOptions = [
    { label: 'API REST', value: 'api_rest' },
    { label: 'API SOAP', value: 'api_soap' },
    { label: 'API GraphQL', value: 'api_graphql' },
    { label: 'File Transfer', value: 'file_transfer' },
    { label: 'Database Link', value: 'database_link' },
    { label: 'Message Queue', value: 'message_queue' },
    { label: 'Thủ công', value: 'manual' },
    { label: 'Khác', value: 'other' },
  ];

  const frequencyOptions = [
    { label: 'Real-time', value: 'realtime' },
    { label: 'Near real-time (< 1 phút)', value: 'near_realtime' },
    { label: 'Batch - Mỗi giờ', value: 'batch_hourly' },
    { label: 'Batch - Hàng ngày', value: 'batch_daily' },
    { label: 'Batch - Hàng tuần', value: 'batch_weekly' },
    { label: 'Batch - Hàng tháng', value: 'batch_monthly' },
    { label: 'On-demand', value: 'on_demand' },
  ];

  const handleAdd = () => {
    setEditingIndex(connections.length);
    editForm.resetFields();
    editForm.setFieldsValue({ has_api_docs: false });
  };

  const handleSave = async () => {
    try {
      const values = await editForm.validateFields();
      const newConnections = [...connections];
      if (editingIndex !== null) {
        if (editingIndex < connections.length) {
          newConnections[editingIndex] = values;
        } else {
          newConnections.push(values);
        }
        setConnections(newConnections);
        onChange?.(newConnections);
        setEditingIndex(null);
        editForm.resetFields();
      }
    } catch (error) {
      console.error('Validation failed:', error);
    }
  };

  const handleEdit = (index: number) => {
    setEditingIndex(index);
    editForm.setFieldsValue(connections[index]);
  };

  const handleDelete = (index: number) => {
    const newConnections = connections.filter((_, i) => i !== index);
    setConnections(newConnections);
    onChange?.(newConnections);
  };

  const handleCancel = () => {
    setEditingIndex(null);
    editForm.resetFields();
  };

  return (
    <div style={{ border: '1px solid #d9d9d9', borderRadius: 4, padding: 16 }}>
      {/* Connection List */}
      {connections.map((conn, index) => (
        <Card
          key={index}
          size="small"
          style={{ marginBottom: 12 }}
          title={`Kết nối ${index + 1}: ${conn.source_system} → ${conn.target_system}`}
          extra={
            editingIndex === index ? null : (
              <Space>
                <Button size="small" icon={<EditOutlined />} onClick={() => handleEdit(index)}>
                  Sửa
                </Button>
                <Button
                  size="small"
                  danger
                  icon={<DeleteOutlined />}
                  onClick={() => handleDelete(index)}
                >
                  Xóa
                </Button>
              </Space>
            )
          }
        >
          {editingIndex === index ? (
            <Form form={editForm} layout="vertical">
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    label="Hệ thống nguồn"
                    name="source_system"
                    rules={[{ required: true, message: 'Vui lòng nhập hệ thống nguồn' }]}
                  >
                    <Input placeholder="VD: Hệ thống A" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label="Hệ thống đích"
                    name="target_system"
                    rules={[{ required: true, message: 'Vui lòng nhập hệ thống đích' }]}
                  >
                    <Input placeholder="VD: Hệ thống B" />
                  </Form.Item>
                </Col>
                <Col span={24}>
                  <Form.Item
                    label="Đối tượng dữ liệu trao đổi"
                    name="data_objects"
                    rules={[{ required: true, message: 'Vui lòng nhập đối tượng dữ liệu' }]}
                  >
                    <TextArea
                      rows={2}
                      placeholder="VD: Thông tin nhân viên, phòng ban, chức vụ"
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label="Phương thức tích hợp"
                    name="integration_method"
                    rules={[{ required: true, message: 'Vui lòng chọn phương thức' }]}
                  >
                    <SelectWithOther options={integrationMethodOptions} placeholder="Chọn phương thức" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label="Tần suất"
                    name="frequency"
                    rules={[{ required: true, message: 'Vui lòng chọn tần suất' }]}
                  >
                    <Select options={frequencyOptions} placeholder="Chọn tần suất" />
                  </Form.Item>
                </Col>
                <Col span={24}>
                  <Form.Item label="Xử lý lỗi/Retry" name="error_handling">
                    <TextArea
                      rows={2}
                      placeholder="VD: Retry 3 lần, delay 5 phút, gửi email cảnh báo"
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label="Có tài liệu API?" name="has_api_docs" valuePropName="checked">
                    <Switch />
                  </Form.Item>
                </Col>
                <Col span={24}>
                  <Form.Item label="Ghi chú" name="notes">
                    <TextArea rows={2} placeholder="Ghi chú thêm" />
                  </Form.Item>
                </Col>
              </Row>
              <Space>
                <Button type="primary" onClick={handleSave}>
                  Lưu
                </Button>
                <Button onClick={handleCancel}>Hủy</Button>
              </Space>
            </Form>
          ) : (
            <div>
              <p>
                <strong>Dữ liệu:</strong> {conn.data_objects}
              </p>
              <p>
                <strong>Phương thức:</strong>{' '}
                {integrationMethodOptions.find((o) => o.value === conn.integration_method)?.label}
              </p>
              <p>
                <strong>Tần suất:</strong>{' '}
                {frequencyOptions.find((o) => o.value === conn.frequency)?.label}
              </p>
              {conn.has_api_docs && (
                <Tag color="green" icon={<CheckCircleOutlined />}>
                  Có tài liệu API
                </Tag>
              )}
            </div>
          )}
        </Card>
      ))}

      {/* Add New Button */}
      {editingIndex === null && (
        <Button type="dashed" block icon={<PlusOutlined />} onClick={handleAdd}>
          Thêm kết nối tích hợp
        </Button>
      )}

      {/* Add Form (when adding new) */}
      {editingIndex === connections.length && (
        <Card size="small" style={{ marginTop: 12 }} title="Thêm kết nối mới">
          <Form form={editForm} layout="vertical">
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label="Hệ thống nguồn"
                  name="source_system"
                  rules={[{ required: true, message: 'Vui lòng nhập hệ thống nguồn' }]}
                >
                  <Input placeholder="VD: Hệ thống A" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="Hệ thống đích"
                  name="target_system"
                  rules={[{ required: true, message: 'Vui lòng nhập hệ thống đích' }]}
                >
                  <Input placeholder="VD: Hệ thống B" />
                </Form.Item>
              </Col>
              <Col span={24}>
                <Form.Item
                  label="Đối tượng dữ liệu trao đổi"
                  name="data_objects"
                  rules={[{ required: true, message: 'Vui lòng nhập đối tượng dữ liệu' }]}
                >
                  <TextArea
                    rows={2}
                    placeholder="VD: Thông tin nhân viên, phòng ban, chức vụ"
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="Phương thức tích hợp"
                  name="integration_method"
                  rules={[{ required: true, message: 'Vui lòng chọn phương thức' }]}
                >
                  <SelectWithOther options={integrationMethodOptions} placeholder="Chọn phương thức" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="Tần suất"
                  name="frequency"
                  rules={[{ required: true, message: 'Vui lòng chọn tần suất' }]}
                >
                  <Select options={frequencyOptions} placeholder="Chọn tần suất" />
                </Form.Item>
              </Col>
              <Col span={24}>
                <Form.Item label="Xử lý lỗi/Retry" name="error_handling">
                  <TextArea
                    rows={2}
                    placeholder="VD: Retry 3 lần, delay 5 phút, gửi email cảnh báo"
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="Có tài liệu API?" name="has_api_docs" valuePropName="checked">
                  <Switch />
                </Form.Item>
              </Col>
              <Col span={24}>
                <Form.Item label="Ghi chú" name="notes">
                  <TextArea rows={2} placeholder="Ghi chú thêm" />
                </Form.Item>
              </Col>
            </Row>
            <Space>
              <Button type="primary" onClick={handleSave}>
                Lưu
              </Button>
              <Button onClick={handleCancel}>Hủy</Button>
            </Space>
          </Form>
        </Card>
      )}
    </div>
  );
};

const SystemEdit = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [userRole, setUserRole] = useState<string>('');

  useEffect(() => {
    fetchOrganizations();
    checkUserRole();
    fetchSystemData();
  }, [id]);

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
    } catch (error) {
      console.error('Failed to fetch user info:', error);
    }
  };

  const fetchSystemData = async () => {
    try {
      setFetching(true);
      const response = await api.get(`/systems/${id}/`);
      const systemData = response.data;

      // Pre-fill form with existing data
      form.setFieldsValue({
        ...systemData,
        // Ensure arrays are properly initialized
        business_objectives: systemData.business_objectives || [],
        business_processes: systemData.business_processes || [],
        user_types: systemData.user_types || [],
        data_sources: systemData.data_sources || [],
        integrated_internal_systems: systemData.integrated_internal_systems || [],
        integrated_external_systems: systemData.integrated_external_systems || [],
        api_list: systemData.api_list || [],
        // P0.8 Phase 1: Initialize integration_connections from nested response
        integration_connections_data: systemData.integration_connections || [],
      });
    } catch (error: any) {
      console.error('Failed to fetch system data:', error);
      message.error('Không thể tải thông tin hệ thống!');
      navigate('/systems');
    } finally {
      setFetching(false);
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      // Build payload - all fields are now flat (no nested _data objects)
      const payload = {
        ...values,
      };

      await api.put(`/systems/${id}/`, payload);
      message.success('Cập nhật hệ thống thành công!');
      navigate('/systems');
    } catch (error: any) {
      console.error('Failed to update system:', error);
      message.error(error.response?.data?.message || 'Cập nhật hệ thống thất bại!');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/systems');
  };

  // Helper component for dynamic list input
  const DynamicListInput = ({ value = [], onChange, placeholder }: any) => {
    const [items, setItems] = useState<string[]>(value || []);
    const [inputValue, setInputValue] = useState('');

    useEffect(() => {
      setItems(value || []);
    }, [value]);

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
              <Form.Item label="Mã hệ thống" name="system_code">
                <Input disabled placeholder="Mã tự động" />
              </Form.Item>
            </Col>

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

            {/* P0.8 Phase 1 - Section 1: New Required Fields */}
            <Col span={12}>
              <Form.Item
                label="Phạm vi sử dụng"
                name="scope"
                rules={[{ required: true, message: 'Vui lòng chọn phạm vi sử dụng' }]}
                tooltip="P0.8 Phase 1: REQUIRED field - Phạm vi sử dụng của hệ thống"
              >
                <Select>
                  <Select.Option value="internal_unit">Nội bộ đơn vị</Select.Option>
                  <Select.Option value="org_wide">Toàn bộ</Select.Option>
                  <Select.Option value="external">Bên ngoài</Select.Option>
                </Select>
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                label="Nhóm hệ thống"
                name="system_group"
                rules={[{ required: true, message: 'Vui lòng chọn nhóm hệ thống' }]}
                tooltip="P0.8 Phase 1: Dropdown với tùy chọn 'Khác' cho phép nhập tùy chỉnh"
              >
                <SelectWithOther
                  options={systemGroupOptions}
                  placeholder="Chọn nhóm hệ thống"
                />
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
                tooltip="Khuyến nghị tối đa 5 mục tiêu để tập trung"
              >
                <DynamicListInput placeholder="Nhập mục tiêu nghiệp vụ và nhấn Enter" />
              </Form.Item>
            </Col>

            <Col span={24}>
              <Form.Item label="Quy trình nghiệp vụ chính" name="business_processes">
                <DynamicListInput placeholder="Nhập quy trình nghiệp vụ và nhấn Enter" />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                label="Có đủ hồ sơ phân tích thiết kế?"
                name="has_design_documents"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
            </Col>

            <Col span={24}>
              <Form.Item label="Đối tượng sử dụng" name="user_types">
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

            {/* P0.8 Phase 1 - Section 2: User Metrics */}
            <Col span={24}>
              <Text strong style={{ fontSize: 16, display: 'block', marginBottom: 16 }}>
                Thống kê người dùng (P0.8 Phase 1)
              </Text>
            </Col>

            <Col span={12}>
              <Form.Item
                label="Tổng số tài khoản"
                name="total_accounts"
                tooltip="P0.8 Phase 1: Tổng số tài khoản đã tạo trong hệ thống"
              >
                <InputNumber
                  min={0}
                  style={{ width: '100%' }}
                  placeholder="Nhập tổng số tài khoản"
                  formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                label="MAU (Monthly Active Users)"
                name="users_mau"
                tooltip="P0.8 Phase 1: Số người dùng hoạt động hàng tháng"
              >
                <InputNumber
                  min={0}
                  style={{ width: '100%' }}
                  placeholder="Nhập MAU"
                  formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                label="DAU (Daily Active Users)"
                name="users_dau"
                tooltip="P0.8 Phase 1: Số người dùng hoạt động hàng ngày"
              >
                <InputNumber
                  min={0}
                  style={{ width: '100%' }}
                  placeholder="Nhập DAU"
                  formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                label="Số đơn vị/địa phương sử dụng"
                name="num_organizations"
                tooltip="P0.8 Phase 1: Số đơn vị/địa phương sử dụng hệ thống"
              >
                <InputNumber
                  min={0}
                  style={{ width: '100%' }}
                  placeholder="Nhập số đơn vị"
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
              <Form.Item label="Nguồn dữ liệu" name="data_sources">
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

            {/* P0.8 Phase 1 - Section 4: Data Volume Metrics */}
            <Col span={24}>
              <Text strong style={{ fontSize: 16, display: 'block', marginBottom: 16 }}>
                Dung lượng dữ liệu (P0.8 Phase 1 - REQUIRED)
              </Text>
            </Col>

            <Col span={12}>
              <Form.Item
                label="Dung lượng CSDL hiện tại (GB)"
                name="storage_size_gb"
                tooltip="P0.8 Phase 1 - REQUIRED: Dung lượng cơ sở dữ liệu hiện tại"
              >
                <InputNumber
                  min={0}
                  step={0.1}
                  style={{ width: '100%' }}
                  placeholder="Nhập dung lượng GB"
                  formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                label="Dung lượng file đính kèm (GB)"
                name="file_storage_size_gb"
                tooltip="P0.8 Phase 1 - REQUIRED: Dung lượng file, tài liệu lưu trữ"
              >
                <InputNumber
                  min={0}
                  step={0.1}
                  style={{ width: '100%' }}
                  placeholder="Nhập dung lượng GB"
                  formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                label="Tốc độ tăng trưởng dữ liệu (%)"
                name="growth_rate_percent"
                tooltip="P0.8 Phase 1 - REQUIRED: Tốc độ tăng trưởng (%/năm hoặc GB/tháng)"
              >
                <InputNumber
                  min={0}
                  max={100}
                  step={0.1}
                  style={{ width: '100%' }}
                  placeholder="Nhập % tăng trưởng"
                  formatter={(value) => `${value}%`}
                  parser={(value) => parseFloat(value!.replace('%', '')) as any}
                />
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
            {/* P0.8 Phase 1 - Section 5: API Inventory */}
            <Col span={24}>
              <Text strong style={{ fontSize: 16, display: 'block', marginBottom: 16 }}>
                Thống kê API (P0.8 Phase 1)
              </Text>
            </Col>

            <Col span={12}>
              <Form.Item
                label="Số API cung cấp"
                name="api_provided_count"
                tooltip="P0.8 Phase 1: Tổng số API mà hệ thống này cung cấp cho hệ thống khác"
              >
                <InputNumber
                  min={0}
                  style={{ width: '100%' }}
                  placeholder="Số API cung cấp"
                />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                label="Số API tiêu thụ"
                name="api_consumed_count"
                tooltip="P0.8 Phase 1: Tổng số API mà hệ thống này gọi từ hệ thống khác"
              >
                <InputNumber
                  min={0}
                  style={{ width: '100%' }}
                  placeholder="Số API tiêu thụ"
                />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item label="Hệ thống nội bộ tích hợp" name="integrated_internal_systems">
                <DynamicListInput placeholder="Nhập tên hệ thống nội bộ" />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item label="Hệ thống bên ngoài tích hợp" name="integrated_external_systems">
                <DynamicListInput placeholder="Nhập tên hệ thống bên ngoài" />
              </Form.Item>
            </Col>

            <Col span={24}>
              <Form.Item label="API/Webservices" name="api_list">
                <DynamicListInput placeholder="Nhập API endpoint hoặc tên service" />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item label="Phương thức trao đổi dữ liệu" name="data_exchange_method">
                <Input placeholder="VD: REST API, SOAP, File Transfer, Database Sync" />
              </Form.Item>
            </Col>

            {/* P0.8 Phase 1 - Section 5: Integration Connections (Complex Dynamic Form) */}
            <Col span={24}>
              <Text strong style={{ fontSize: 16, display: 'block', marginTop: 24, marginBottom: 16 }}>
                Danh sách tích hợp chi tiết (P0.8 Phase 1 - CRITICAL)
              </Text>
              <Text type="secondary" style={{ display: 'block', marginBottom: 16 }}>
                Liệt kê chi tiết các kết nối tích hợp giữa hệ thống này với các hệ thống khác
              </Text>
            </Col>

            <Col span={24}>
              <Form.Item
                name="integration_connections_data"
              >
                <IntegrationConnectionList />
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
                <SelectWithOther
                  options={authenticationMethodOptions}
                  placeholder="Chọn phương thức"
                />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item label="Mã hóa dữ liệu" name="has_encryption" valuePropName="checked">
                <Switch />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item label="Có log audit?" name="has_audit_log" valuePropName="checked">
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

  if (fetching) {
    return (
      <div style={{ padding: '24px', textAlign: 'center' }}>
        <Spin size="large" />
        <p>Đang tải dữ liệu...</p>
      </div>
    );
  }

  return (
    <Spin spinning={loading}>
      <div style={{ padding: '24px', background: '#f0f2f5', minHeight: '100vh' }}>
        <Card>
          <div style={{ marginBottom: 24 }}>
            <Button icon={<ArrowLeftOutlined />} onClick={handleCancel}>
              Quay lại
            </Button>
            <Title level={2} style={{ marginTop: 16 }}>
              Chỉnh sửa hệ thống
            </Title>
            <Text type="secondary">
              P0.8: Form mới với 8 phần - Cập nhật thông tin hệ thống
            </Text>
          </div>

          <Form form={form} layout="vertical" scrollToFirstError>
            <Tabs items={tabItems} />

            <div style={{ marginTop: 24, textAlign: 'right' }}>
              <Space>
                <Button onClick={handleCancel}>Hủy</Button>
                <Button type="primary" icon={<SaveOutlined />} onClick={handleSubmit}>
                  Lưu thay đổi
                </Button>
              </Space>
            </div>
          </Form>
        </Card>
      </div>
    </Spin>
  );
};

export default SystemEdit;
