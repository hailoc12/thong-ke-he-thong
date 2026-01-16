import { useState, useEffect } from 'react';
import {
  Steps,
  Form,
  Input,
  Select,
  Button,
  Card,
  Row,
  Col,
  DatePicker,
  InputNumber,
  Checkbox,
  Radio,
  Rate,
  message,
  Spin,
  Typography,
} from 'antd';
import { ArrowLeftOutlined, SaveOutlined } from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import dayjs from 'dayjs';
import api from '../config/api';
import type { Organization, SystemCreatePayload } from '../types';

const { Title } = Typography;
const { TextArea } = Input;

const SystemEdit = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [form] = Form.useForm();
  const [currentStep, setCurrentStep] = useState(0);
  const [formLevel, setFormLevel] = useState<1 | 2>(1);
  const [loading, setLoading] = useState(false);
  const [_loadingData, setLoadingData] = useState(true);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [formData, setFormData] = useState<Partial<SystemCreatePayload>>({});

  useEffect(() => {
    fetchOrganizations();
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

  const fetchSystemData = async () => {
    try {
      setLoadingData(true);
      const response = await api.get(`/systems/${id}/`);
      const system = response.data;

      // Set form level based on existing data
      setFormLevel(system.form_level || 1);

      // Prepare form values with proper date conversion
      const formValues: any = {
        org: system.organization,
        system_code: system.system_code,
        system_name: system.system_name,
        system_name_en: system.system_name_en,
        purpose: system.purpose,
        scope: system.scope,
        system_group: system.system_group,
        status: system.status,
        criticality_level: system.criticality_level,
        form_level: system.form_level,
        go_live_date: system.go_live_date ? dayjs(system.go_live_date) : null,
        business_owner: system.business_owner,
        technical_owner: system.technical_owner,
        responsible_person: system.responsible_person,
        responsible_phone: system.responsible_phone,
        responsible_email: system.responsible_email,
        users_total: system.users_total,
      };

      // Add architecture data if exists
      if (system.architecture) {
        formValues.architecture_type = system.architecture.architecture_type;
        formValues.backend_tech = system.architecture.backend_tech;
        formValues.frontend_tech = system.architecture.frontend_tech;
        formValues.database_type = system.architecture.database_type;
        formValues.database_model = system.architecture.database_model;
        formValues.hosting_type = system.architecture.hosting_type;
        formValues.mobile_app = system.architecture.mobile_app;
      }

      // Add data info if exists
      if (system.data_info) {
        formValues.storage_size_gb = system.data_info.storage_size_gb;
        formValues.has_api = system.data_info.has_api;
        formValues.has_personal_data = system.data_info.has_personal_data;
        formValues.has_sensitive_data = system.data_info.has_sensitive_data;
        formValues.data_classification = system.data_info.data_classification;
      }

      // Add operations data if exists
      if (system.operations) {
        formValues.dev_type = system.operations.dev_type;
        formValues.developer = system.operations.developer;
        formValues.warranty_status = system.operations.warranty_status;
        formValues.has_maintenance_contract = system.operations.has_maintenance_contract;
        formValues.operator = system.operations.operator;
        formValues.vendor_dependency = system.operations.vendor_dependency;
      }

      // Add integration data if exists
      if (system.integration) {
        formValues.has_integration = system.integration.has_integration;
        formValues.integration_count = system.integration.integration_count;
        formValues.connected_internal_systems = system.integration.connected_internal_systems;
        formValues.connected_external_systems = system.integration.connected_external_systems;
        formValues.uses_standard_api = system.integration.uses_standard_api;
      }

      // Add assessment data if exists
      if (system.evaluation) {
        formValues.performance_rating = system.evaluation.performance_rating;
        formValues.uptime_percent = system.evaluation.uptime_percent;
        formValues.user_satisfaction_rating = system.evaluation.user_satisfaction_rating;
        formValues.technical_debt_level = system.evaluation.technical_debt_level;
        formValues.needs_replacement = system.evaluation.needs_replacement;
        formValues.major_issues = system.evaluation.major_issues;
      }

      // Add Level 2 data if exists
      if (system.form_level === 2) {
        if (system.cost) {
          formValues.initial_investment = system.cost.initial_investment;
          formValues.development_cost = system.cost.development_cost;
          formValues.annual_license_cost = system.cost.annual_license_cost;
          formValues.annual_maintenance_cost = system.cost.annual_maintenance_cost;
          formValues.annual_infrastructure_cost = system.cost.annual_infrastructure_cost;
          formValues.total_cost_of_ownership = system.cost.total_cost_of_ownership;
          formValues.funding_source = system.cost.funding_source;
        }

        if (system.vendor) {
          formValues.vendor_name = system.vendor.vendor_name;
          formValues.vendor_type = system.vendor.vendor_type;
          formValues.vendor_contact_person = system.vendor.vendor_contact_person;
          formValues.vendor_phone = system.vendor.vendor_phone;
          formValues.vendor_email = system.vendor.vendor_email;
          formValues.contract_number = system.vendor.contract_number;
          formValues.contract_start_date = system.vendor.contract_start_date ? dayjs(system.vendor.contract_start_date) : null;
          formValues.contract_end_date = system.vendor.contract_end_date ? dayjs(system.vendor.contract_end_date) : null;
          formValues.vendor_lock_in_risk = system.vendor.vendor_lock_in_risk;
        }

        if (system.infrastructure) {
          formValues.num_servers = system.infrastructure.num_servers;
          formValues.server_specs = system.infrastructure.server_specs;
          formValues.total_cpu_cores = system.infrastructure.total_cpu_cores;
          formValues.total_ram_gb = system.infrastructure.total_ram_gb;
          formValues.total_storage_tb = system.infrastructure.total_storage_tb;
          formValues.backup_frequency = system.infrastructure.backup_frequency;
          formValues.has_disaster_recovery = system.infrastructure.has_disaster_recovery;
          formValues.rto_hours = system.infrastructure.rto_hours;
          formValues.rpo_hours = system.infrastructure.rpo_hours;
        }

        if (system.security) {
          formValues.auth_method = system.security.auth_method;
          formValues.has_mfa = system.security.has_mfa;
          formValues.has_rbac = system.security.has_rbac;
          formValues.has_data_encryption_at_rest = system.security.has_data_encryption_at_rest;
          formValues.has_data_encryption_in_transit = system.security.has_data_encryption_in_transit;
          formValues.has_firewall = system.security.has_firewall;
          formValues.has_waf = system.security.has_waf;
          formValues.last_security_audit_date = system.security.last_security_audit_date ? dayjs(system.security.last_security_audit_date) : null;
          formValues.compliance_standards = system.security.compliance_standards;
        }
      }

      // Set all form fields at once
      form.setFieldsValue(formValues);
      setFormData(formValues);
    } catch (error: any) {
      console.error('Failed to fetch system data:', error);
      message.error('Không thể tải thông tin hệ thống');
      navigate('/systems');
    } finally {
      setLoadingData(false);
    }
  };

  // Steps configuration
  const level1Steps = [
    { title: 'Thông tin cơ bản', key: 'basic' },
    { title: 'Kiến trúc', key: 'architecture' },
    { title: 'Dữ liệu', key: 'data' },
    { title: 'Vận hành', key: 'operations' },
    { title: 'Liên thông', key: 'integration' },
    { title: 'Đánh giá', key: 'assessment' },
  ];

  const level2Steps = [
    { title: 'Chi phí', key: 'cost' },
    { title: 'Nhà cung cấp', key: 'vendor' },
    { title: 'Hạ tầng', key: 'infrastructure' },
    { title: 'Bảo mật', key: 'security' },
  ];

  const allSteps = formLevel === 2 ? [...level1Steps, ...level2Steps] : level1Steps;

  const handleFormLevelChange = (level: 1 | 2) => {
    setFormLevel(level);
  };

  const handleNext = async () => {
    try {
      const values = await form.validateFields();
      setFormData({ ...formData, ...values });
      setCurrentStep(currentStep + 1);
    } catch (error) {
      console.error('Validation failed:', error);
    }
  };

  const handlePrev = () => {
    setCurrentStep(currentStep - 1);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const allData = { ...formData, ...values };
      setLoading(true);

      // Build the payload
      const payload: SystemCreatePayload = {
        org: allData.org,
        system_code: allData.system_code,
        system_name: allData.system_name,
        system_name_en: allData.system_name_en,
        purpose: allData.purpose,
        scope: allData.scope,
        system_group: allData.system_group,
        status: allData.status || 'operating',
        criticality_level: allData.criticality_level || 'medium',
        form_level: formLevel,
        go_live_date: allData.go_live_date?.format('YYYY-MM-DD'),
        business_owner: allData.business_owner,
        technical_owner: allData.technical_owner,
        responsible_person: allData.responsible_person,
        responsible_phone: allData.responsible_phone,
        responsible_email: allData.responsible_email,
        users_total: allData.users_total,
        architecture_data: {
          architecture_type: allData.architecture_type,
          backend_tech: allData.backend_tech,
          frontend_tech: allData.frontend_tech,
          database_type: allData.database_type,
          database_model: allData.database_model,
          hosting_type: allData.hosting_type,
          mobile_app: allData.mobile_app,
        },
        data_info_data: {
          storage_size_gb: allData.storage_size_gb,
          has_api: allData.has_api,
          has_personal_data: allData.has_personal_data,
          has_sensitive_data: allData.has_sensitive_data,
          data_classification: allData.data_classification,
        },
        operations_data: {
          dev_type: allData.dev_type,
          developer: allData.developer,
          warranty_status: allData.warranty_status,
          has_maintenance_contract: allData.has_maintenance_contract,
          operator: allData.operator,
          vendor_dependency: allData.vendor_dependency,
        },
        integration_data: {
          has_integration: allData.has_integration,
          integration_count: allData.integration_count,
          connected_internal_systems: allData.connected_internal_systems,
          connected_external_systems: allData.connected_external_systems,
          uses_standard_api: allData.uses_standard_api,
        },
        assessment_data: {
          performance_rating: allData.performance_rating,
          uptime_percent: allData.uptime_percent,
          user_satisfaction_rating: allData.user_satisfaction_rating,
          technical_debt_level: allData.technical_debt_level,
          needs_replacement: allData.needs_replacement,
          major_issues: allData.major_issues,
        },
      };

      // Add Level 2 data if applicable
      if (formLevel === 2) {
        payload.cost_data = {
          initial_investment: allData.initial_investment,
          development_cost: allData.development_cost,
          annual_license_cost: allData.annual_license_cost,
          annual_maintenance_cost: allData.annual_maintenance_cost,
          annual_infrastructure_cost: allData.annual_infrastructure_cost,
          total_cost_of_ownership: allData.total_cost_of_ownership,
          funding_source: allData.funding_source,
        };
        payload.vendor_data = {
          vendor_name: allData.vendor_name,
          vendor_type: allData.vendor_type,
          vendor_contact_person: allData.vendor_contact_person,
          vendor_phone: allData.vendor_phone,
          vendor_email: allData.vendor_email,
          contract_number: allData.contract_number,
          contract_start_date: allData.contract_start_date?.format('YYYY-MM-DD'),
          contract_end_date: allData.contract_end_date?.format('YYYY-MM-DD'),
          vendor_lock_in_risk: allData.vendor_lock_in_risk,
        };
        payload.infrastructure_data = {
          num_servers: allData.num_servers,
          server_specs: allData.server_specs,
          total_cpu_cores: allData.total_cpu_cores,
          total_ram_gb: allData.total_ram_gb,
          total_storage_tb: allData.total_storage_tb,
          backup_frequency: allData.backup_frequency,
          has_disaster_recovery: allData.has_disaster_recovery,
          rto_hours: allData.rto_hours,
          rpo_hours: allData.rpo_hours,
        };
        payload.security_data = {
          auth_method: allData.auth_method,
          has_mfa: allData.has_mfa,
          has_rbac: allData.has_rbac,
          has_data_encryption_at_rest: allData.has_data_encryption_at_rest,
          has_data_encryption_in_transit: allData.has_data_encryption_in_transit,
          has_firewall: allData.has_firewall,
          has_waf: allData.has_waf,
          last_security_audit_date: allData.last_security_audit_date?.format('YYYY-MM-DD'),
          compliance_standards: allData.compliance_standards,
        };
      }

      await api.patch(`/systems/${id}/`, payload);
      message.success('Cập nhật hệ thống thành công!');
      navigate(`/systems/${id}`);
    } catch (error: any) {
      console.error('Failed to update system:', error);
      message.error(error.response?.data?.message || 'Có lỗi xảy ra khi cập nhật hệ thống');
    } finally {
      setLoading(false);
    }
  };

  // Step 1: Basic Info
  const renderBasicInfoStep = () => (
    <>
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            name="org"
            label="Đơn vị"
            rules={[{ required: true, message: 'Vui lòng chọn đơn vị' }]}
          >
            <Select
              placeholder="Chọn đơn vị"
              showSearch
              optionFilterProp="children"
            >
              {organizations.map((org) => (
                <Select.Option key={org.id} value={org.id}>
                  {org.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            name="system_code"
            label="Mã hệ thống"
            rules={[{ required: true, message: 'Vui lòng nhập mã hệ thống' }]}
          >
            <Input placeholder="VD: HT001" />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            name="system_name"
            label="Tên hệ thống"
            rules={[{ required: true, message: 'Vui lòng nhập tên hệ thống' }]}
          >
            <Input placeholder="Tên hệ thống" />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item name="system_name_en" label="Tên tiếng Anh">
            <Input placeholder="English name" />
          </Form.Item>
        </Col>
      </Row>

      <Form.Item name="purpose" label="Mục đích / Mô tả">
        <TextArea rows={3} placeholder="Mô tả mục đích và chức năng chính của hệ thống" />
      </Form.Item>

      <Row gutter={16}>
        <Col span={8}>
          <Form.Item name="scope" label="Phạm vi">
            <Select placeholder="Chọn phạm vi">
              <Select.Option value="internal_unit">Nội bộ đơn vị</Select.Option>
              <Select.Option value="org_wide">Toàn bộ</Select.Option>
              <Select.Option value="external">Bên ngoài</Select.Option>
            </Select>
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item name="system_group" label="Nhóm hệ thống">
            <Select placeholder="Chọn nhóm">
              <Select.Option value="platform">Nền tảng</Select.Option>
              <Select.Option value="business">Nghiệp vụ</Select.Option>
              <Select.Option value="portal">Cổng thông tin</Select.Option>
              <Select.Option value="website">Website</Select.Option>
              <Select.Option value="bi">BI/Báo cáo</Select.Option>
              <Select.Option value="esb">ESB/Tích hợp</Select.Option>
              <Select.Option value="other">Khác</Select.Option>
            </Select>
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item name="go_live_date" label="Ngày vận hành">
            <DatePicker style={{ width: '100%' }} placeholder="Chọn ngày" />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={8}>
          <Form.Item
            name="status"
            label="Trạng thái"
            rules={[{ required: true, message: 'Vui lòng chọn trạng thái' }]}
            initialValue="operating"
          >
            <Select>
              <Select.Option value="operating">Đang vận hành</Select.Option>
              <Select.Option value="pilot">Thí điểm</Select.Option>
              <Select.Option value="stopped">Dừng</Select.Option>
              <Select.Option value="replacing">Sắp thay thế</Select.Option>
            </Select>
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item
            name="criticality_level"
            label="Mức độ quan trọng"
            rules={[{ required: true, message: 'Vui lòng chọn mức độ' }]}
            initialValue="medium"
          >
            <Select>
              <Select.Option value="critical">Tối quan trọng</Select.Option>
              <Select.Option value="high">Quan trọng</Select.Option>
              <Select.Option value="medium">Trung bình</Select.Option>
              <Select.Option value="low">Thấp</Select.Option>
            </Select>
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item
            name="form_level"
            label="Cấp độ form"
            rules={[{ required: true }]}
            initialValue={1}
          >
            <Radio.Group onChange={(e) => handleFormLevelChange(e.target.value)}>
              <Radio value={1}>Level 1 (6 phần)</Radio>
              <Radio value={2}>Level 2 (10 phần)</Radio>
            </Radio.Group>
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item name="business_owner" label="Chủ sở hữu nghiệp vụ">
            <Input placeholder="Họ tên" />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item name="technical_owner" label="Chủ sở hữu kỹ thuật">
            <Input placeholder="Họ tên" />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={8}>
          <Form.Item name="responsible_person" label="Người phụ trách">
            <Input placeholder="Họ tên" />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item name="responsible_phone" label="Số điện thoại">
            <Input placeholder="SĐT" />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item name="responsible_email" label="Email">
            <Input type="email" placeholder="Email" />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={8}>
          <Form.Item name="users_total" label="Tổng số người dùng">
            <InputNumber style={{ width: '100%' }} min={0} placeholder="0" />
          </Form.Item>
        </Col>
      </Row>
    </>
  );

  // Step 2: Architecture
  const renderArchitectureStep = () => (
    <>
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item name="architecture_type" label="Loại kiến trúc">
            <Select placeholder="Chọn loại">
              <Select.Option value="monolithic">Monolithic</Select.Option>
              <Select.Option value="modular">Modular</Select.Option>
              <Select.Option value="microservices">Microservices</Select.Option>
              <Select.Option value="other">Khác</Select.Option>
            </Select>
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item name="hosting_type" label="Loại hosting">
            <Select placeholder="Chọn loại">
              <Select.Option value="cloud">Cloud</Select.Option>
              <Select.Option value="on-premise">On-premise</Select.Option>
              <Select.Option value="hybrid">Hybrid</Select.Option>
            </Select>
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item name="backend_tech" label="Công nghệ Backend">
            <Input placeholder="VD: Java Spring, .NET, Python Django" />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item name="frontend_tech" label="Công nghệ Frontend">
            <Input placeholder="VD: React, Angular, Vue" />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item name="database_type" label="Loại Database">
            <Input placeholder="VD: PostgreSQL, MySQL, Oracle" />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item name="database_model" label="Mô hình Database">
            <Select placeholder="Chọn mô hình">
              <Select.Option value="centralized">Tập trung</Select.Option>
              <Select.Option value="distributed">Phân tán</Select.Option>
              <Select.Option value="per_app">Riêng từng app</Select.Option>
            </Select>
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item name="mobile_app" label="Mobile App">
            <Select placeholder="Chọn loại">
              <Select.Option value="native">Native App</Select.Option>
              <Select.Option value="hybrid">Hybrid App</Select.Option>
              <Select.Option value="pwa">PWA</Select.Option>
              <Select.Option value="none">Không có</Select.Option>
            </Select>
          </Form.Item>
        </Col>
      </Row>
    </>
  );

  // Step 3: Data Info
  const renderDataInfoStep = () => (
    <>
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item name="storage_size_gb" label="Dung lượng lưu trữ (GB)">
            <InputNumber style={{ width: '100%' }} min={0} placeholder="0" />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item name="data_classification" label="Phân loại dữ liệu">
            <Select placeholder="Chọn phân loại">
              <Select.Option value="public">Công khai</Select.Option>
              <Select.Option value="internal">Nội bộ</Select.Option>
              <Select.Option value="confidential">Bảo mật</Select.Option>
              <Select.Option value="secret">Tuyệt mật</Select.Option>
            </Select>
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={8}>
          <Form.Item name="has_api" valuePropName="checked">
            <Checkbox>Có API</Checkbox>
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item name="has_personal_data" valuePropName="checked">
            <Checkbox>Có dữ liệu cá nhân</Checkbox>
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item name="has_sensitive_data" valuePropName="checked">
            <Checkbox>Có dữ liệu nhạy cảm</Checkbox>
          </Form.Item>
        </Col>
      </Row>
    </>
  );

  // Step 4: Operations
  const renderOperationsStep = () => (
    <>
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item name="dev_type" label="Loại phát triển">
            <Select placeholder="Chọn loại">
              <Select.Option value="internal">Nội bộ</Select.Option>
              <Select.Option value="outsource">Thuê ngoài</Select.Option>
              <Select.Option value="combined">Kết hợp</Select.Option>
            </Select>
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item name="developer" label="Nhà phát triển">
            <Input placeholder="Tên công ty/đơn vị phát triển" />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item name="warranty_status" label="Trạng thái bảo hành">
            <Select placeholder="Chọn trạng thái">
              <Select.Option value="active">Còn bảo hành</Select.Option>
              <Select.Option value="expired">Hết bảo hành</Select.Option>
              <Select.Option value="none">Không có</Select.Option>
            </Select>
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item name="operator" label="Đơn vị vận hành">
            <Input placeholder="Tên đơn vị vận hành" />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item name="vendor_dependency" label="Mức phụ thuộc NCC">
            <Select placeholder="Chọn mức độ">
              <Select.Option value="high">Cao</Select.Option>
              <Select.Option value="medium">Trung bình</Select.Option>
              <Select.Option value="low">Thấp</Select.Option>
              <Select.Option value="none">Không</Select.Option>
            </Select>
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item name="has_maintenance_contract" valuePropName="checked">
            <Checkbox>Có hợp đồng bảo trì</Checkbox>
          </Form.Item>
        </Col>
      </Row>
    </>
  );

  // Step 5: Integration
  const renderIntegrationStep = () => (
    <>
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item name="has_integration" valuePropName="checked">
            <Checkbox>Có tích hợp với hệ thống khác</Checkbox>
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item name="integration_count" label="Số lượng tích hợp">
            <InputNumber style={{ width: '100%' }} min={0} placeholder="0" />
          </Form.Item>
        </Col>
      </Row>

      <Form.Item name="connected_internal_systems" label="Hệ thống nội bộ liên thông">
        <TextArea rows={2} placeholder="Liệt kê các hệ thống nội bộ đã kết nối" />
      </Form.Item>

      <Form.Item name="connected_external_systems" label="Hệ thống bên ngoài liên thông">
        <TextArea rows={2} placeholder="Liệt kê các hệ thống bên ngoài đã kết nối" />
      </Form.Item>

      <Form.Item name="uses_standard_api" valuePropName="checked">
        <Checkbox>Sử dụng API chuẩn (REST, SOAP, etc.)</Checkbox>
      </Form.Item>
    </>
  );

  // Step 6: Assessment
  const renderAssessmentStep = () => (
    <>
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item name="performance_rating" label="Đánh giá hiệu năng">
            <Rate />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item name="user_satisfaction_rating" label="Đánh giá người dùng">
            <Rate />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item name="uptime_percent" label="Uptime (%)">
            <InputNumber style={{ width: '100%' }} min={0} max={100} placeholder="99.9" />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item name="technical_debt_level" label="Mức nợ kỹ thuật">
            <Select placeholder="Chọn mức độ">
              <Select.Option value="high">Cao</Select.Option>
              <Select.Option value="medium">Trung bình</Select.Option>
              <Select.Option value="low">Thấp</Select.Option>
            </Select>
          </Form.Item>
        </Col>
      </Row>

      <Form.Item name="needs_replacement" valuePropName="checked">
        <Checkbox>Cần thay thế hệ thống</Checkbox>
      </Form.Item>

      <Form.Item name="major_issues" label="Vấn đề chính">
        <TextArea rows={3} placeholder="Mô tả các vấn đề chính của hệ thống" />
      </Form.Item>
    </>
  );

  // Step 7: Cost (Level 2)
  const renderCostStep = () => (
    <>
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item name="initial_investment" label="Đầu tư ban đầu (VND)">
            <InputNumber
              style={{ width: '100%' }}
              min={0}
              formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={(value) => value?.replace(/\$\s?|(,*)/g, '') as any}
              placeholder="0"
            />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item name="development_cost" label="Chi phí phát triển (VND)">
            <InputNumber
              style={{ width: '100%' }}
              min={0}
              formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={(value) => value?.replace(/\$\s?|(,*)/g, '') as any}
              placeholder="0"
            />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={8}>
          <Form.Item name="annual_license_cost" label="CP License/năm">
            <InputNumber
              style={{ width: '100%' }}
              min={0}
              formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={(value) => value?.replace(/\$\s?|(,*)/g, '') as any}
              placeholder="0"
            />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item name="annual_maintenance_cost" label="CP Bảo trì/năm">
            <InputNumber
              style={{ width: '100%' }}
              min={0}
              formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={(value) => value?.replace(/\$\s?|(,*)/g, '') as any}
              placeholder="0"
            />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item name="annual_infrastructure_cost" label="CP Hạ tầng/năm">
            <InputNumber
              style={{ width: '100%' }}
              min={0}
              formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={(value) => value?.replace(/\$\s?|(,*)/g, '') as any}
              placeholder="0"
            />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item name="total_cost_of_ownership" label="TCO 5 năm (VND)">
            <InputNumber
              style={{ width: '100%' }}
              min={0}
              formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={(value) => value?.replace(/\$\s?|(,*)/g, '') as any}
              placeholder="0"
            />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item name="funding_source" label="Nguồn kinh phí">
            <Input placeholder="VD: Ngân sách nhà nước, Vốn ODA" />
          </Form.Item>
        </Col>
      </Row>
    </>
  );

  // Step 8: Vendor (Level 2)
  const renderVendorStep = () => (
    <>
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item name="vendor_name" label="Tên nhà cung cấp">
            <Input placeholder="Tên công ty" />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item name="vendor_type" label="Loại NCC">
            <Select placeholder="Chọn loại">
              <Select.Option value="domestic">Trong nước</Select.Option>
              <Select.Option value="foreign">Nước ngoài</Select.Option>
              <Select.Option value="joint_venture">Liên doanh</Select.Option>
            </Select>
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={8}>
          <Form.Item name="vendor_contact_person" label="Người liên hệ">
            <Input placeholder="Họ tên" />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item name="vendor_phone" label="Số điện thoại">
            <Input placeholder="SĐT" />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item name="vendor_email" label="Email">
            <Input type="email" placeholder="Email" />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={8}>
          <Form.Item name="contract_number" label="Số hợp đồng">
            <Input placeholder="Số HĐ" />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item name="contract_start_date" label="Ngày bắt đầu HĐ">
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item name="contract_end_date" label="Ngày kết thúc HĐ">
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item name="vendor_lock_in_risk" label="Rủi ro phụ thuộc NCC">
            <Select placeholder="Chọn mức độ">
              <Select.Option value="high">Cao</Select.Option>
              <Select.Option value="medium">Trung bình</Select.Option>
              <Select.Option value="low">Thấp</Select.Option>
            </Select>
          </Form.Item>
        </Col>
      </Row>
    </>
  );

  // Step 9: Infrastructure (Level 2)
  const renderInfrastructureStep = () => (
    <>
      <Row gutter={16}>
        <Col span={8}>
          <Form.Item name="num_servers" label="Số lượng server">
            <InputNumber style={{ width: '100%' }} min={0} placeholder="0" />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item name="total_cpu_cores" label="Tổng CPU cores">
            <InputNumber style={{ width: '100%' }} min={0} placeholder="0" />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item name="total_ram_gb" label="Tổng RAM (GB)">
            <InputNumber style={{ width: '100%' }} min={0} placeholder="0" />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item name="total_storage_tb" label="Tổng storage (TB)">
            <InputNumber style={{ width: '100%' }} min={0} placeholder="0" />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item name="server_specs" label="Cấu hình server">
            <Input placeholder="VD: Dell R740, 2x Intel Xeon" />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item name="backup_frequency" label="Tần suất backup">
            <Select placeholder="Chọn tần suất">
              <Select.Option value="real-time">Real-time</Select.Option>
              <Select.Option value="hourly">Hàng giờ</Select.Option>
              <Select.Option value="daily">Hàng ngày</Select.Option>
              <Select.Option value="weekly">Hàng tuần</Select.Option>
            </Select>
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item name="has_disaster_recovery" valuePropName="checked">
            <Checkbox>Có Disaster Recovery</Checkbox>
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item name="rto_hours" label="RTO (giờ)">
            <InputNumber style={{ width: '100%' }} min={0} placeholder="0" />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item name="rpo_hours" label="RPO (giờ)">
            <InputNumber style={{ width: '100%' }} min={0} placeholder="0" />
          </Form.Item>
        </Col>
      </Row>
    </>
  );

  // Step 10: Security (Level 2)
  const renderSecurityStep = () => (
    <>
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item name="auth_method" label="Phương thức xác thực">
            <Select placeholder="Chọn phương thức">
              <Select.Option value="username/password">Username/Password</Select.Option>
              <Select.Option value="sso">SSO</Select.Option>
              <Select.Option value="ldap">LDAP/AD</Select.Option>
              <Select.Option value="oauth">OAuth</Select.Option>
            </Select>
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item name="last_security_audit_date" label="Ngày audit cuối">
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={6}>
          <Form.Item name="has_mfa" valuePropName="checked">
            <Checkbox>Có MFA</Checkbox>
          </Form.Item>
        </Col>
        <Col span={6}>
          <Form.Item name="has_rbac" valuePropName="checked">
            <Checkbox>Có RBAC</Checkbox>
          </Form.Item>
        </Col>
        <Col span={6}>
          <Form.Item name="has_firewall" valuePropName="checked">
            <Checkbox>Có Firewall</Checkbox>
          </Form.Item>
        </Col>
        <Col span={6}>
          <Form.Item name="has_waf" valuePropName="checked">
            <Checkbox>Có WAF</Checkbox>
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item name="has_data_encryption_at_rest" valuePropName="checked">
            <Checkbox>Mã hóa dữ liệu lưu trữ</Checkbox>
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item name="has_data_encryption_in_transit" valuePropName="checked">
            <Checkbox>Mã hóa dữ liệu truyền tải</Checkbox>
          </Form.Item>
        </Col>
      </Row>

      <Form.Item name="compliance_standards" label="Tiêu chuẩn tuân thủ">
        <Select mode="multiple" placeholder="Chọn tiêu chuẩn">
          <Select.Option value="ISO27001">ISO 27001</Select.Option>
          <Select.Option value="GDPR">GDPR</Select.Option>
          <Select.Option value="PCIDSS">PCI DSS</Select.Option>
          <Select.Option value="SOC2">SOC 2</Select.Option>
        </Select>
      </Form.Item>
    </>
  );

  const renderStepContent = () => {
    const stepKey = allSteps[currentStep]?.key;
    switch (stepKey) {
      case 'basic':
        return renderBasicInfoStep();
      case 'architecture':
        return renderArchitectureStep();
      case 'data':
        return renderDataInfoStep();
      case 'operations':
        return renderOperationsStep();
      case 'integration':
        return renderIntegrationStep();
      case 'assessment':
        return renderAssessmentStep();
      case 'cost':
        return renderCostStep();
      case 'vendor':
        return renderVendorStep();
      case 'infrastructure':
        return renderInfrastructureStep();
      case 'security':
        return renderSecurityStep();
      default:
        return null;
    }
  };

  return (
    <Spin spinning={loading}>
      <div style={{ marginBottom: 16 }}>
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate('/systems')}
        >
          Quay lại
        </Button>
      </div>

      <Card>
        <Title level={3} style={{ marginBottom: 24 }}>
          Chỉnh sửa hệ thống
        </Title>

        <Steps
          current={currentStep}
          items={allSteps.map((step) => ({ title: step.title }))}
          style={{ marginBottom: 32 }}
          size="small"
        />

        <Form
          form={form}
          layout="vertical"
          initialValues={formData}
          preserve={false}
        >
          {renderStepContent()}

          <div style={{ marginTop: 24, display: 'flex', justifyContent: 'space-between' }}>
            <div>
              {currentStep > 0 && (
                <Button onClick={handlePrev}>
                  Quay lại
                </Button>
              )}
            </div>
            <div>
              {currentStep < allSteps.length - 1 && (
                <Button type="primary" onClick={handleNext}>
                  Tiếp theo
                </Button>
              )}
              {currentStep === allSteps.length - 1 && (
                <Button
                  type="primary"
                  icon={<SaveOutlined />}
                  onClick={handleSubmit}
                  loading={loading}
                >
                  Cập nhật hệ thống
                </Button>
              )}
            </div>
          </div>
        </Form>
      </Card>
    </Spin>
  );
};

export default SystemEdit;
