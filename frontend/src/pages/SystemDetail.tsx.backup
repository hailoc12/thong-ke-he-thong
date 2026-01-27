/**
 * System Detail View - Updated to show all 24 new fields
 * Organized into 8 sections with Collapse
 * Date: 2026-01-19
 */
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Card,
  Descriptions,
  Button,
  Space,
  Spin,
  message,
  Tag,
  Typography,
  Collapse,
} from 'antd';
import {
  EditOutlined,
  ArrowLeftOutlined,
  InfoCircleOutlined,
  AppstoreOutlined,
  DatabaseOutlined,
  ApiOutlined,
  SafetyOutlined,
  CloudServerOutlined,
  ToolOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
} from '@ant-design/icons';
import api from '../config/api';

const { Title, Text } = Typography;

const SystemDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [system, setSystem] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // Handle responsive
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    fetchSystem();
  }, [id]);

  const fetchSystem = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/systems/${id}/`);
      setSystem(response.data);
    } catch (error) {
      console.error('Failed to fetch system:', error);
      message.error('Không thể tải thông tin hệ thống');
      navigate('/systems');
    } finally {
      setLoading(false);
    }
  };

  const getStatusTag = (status: string) => {
    const statusMap: Record<string, { text: string; color: string }> = {
      operating: { text: 'Đang vận hành', color: 'success' },
      planning: { text: 'Đang lập kế hoạch', color: 'default' },
      development: { text: 'Đang phát triển', color: 'processing' },
      testing: { text: 'Đang thử nghiệm', color: 'warning' },
      inactive: { text: 'Ngừng hoạt động', color: 'error' },
      maintenance: { text: 'Bảo trì', color: 'orange' },
    };
    const config = statusMap[status] || { text: status, color: 'default' };
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  const getCriticalityTag = (level: string) => {
    const levelMap: Record<string, { text: string; color: string }> = {
      high: { text: 'Quan trọng', color: 'orange' },
      medium: { text: 'Trung bình', color: 'blue' },
      low: { text: 'Thấp', color: 'default' },
    };
    const config = levelMap[level] || { text: level, color: 'default' };
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  const getUserTypeText = (type: string) => {
    const map: Record<string, string> = {
      internal_leadership: 'Lãnh đạo nội bộ',
      internal_staff: 'Cán bộ nội bộ',
      internal_reviewer: 'Người thẩm định nội bộ',
      external_business: 'Doanh nghiệp',
      external_citizen: 'Người dân',
      external_local: 'Địa phương',
      external_agency: 'Cơ quan khác',
    };
    return map[type] || type;
  };

  const getAuthMethodText = (method: string) => {
    const map: Record<string, string> = {
      username_password: 'Username/Password',
      sso: 'SSO',
      ldap: 'LDAP',
      oauth: 'OAuth',
      saml: 'SAML',
      biometric: 'Biometric',
      other: 'Khác',
    };
    return map[method] || method;
  };

  const getHostingPlatformText = (platform: string) => {
    const map: Record<string, string> = {
      cloud: 'Cloud',
      on_premise: 'On-premise',
      hybrid: 'Hybrid',
    };
    return map[platform] || platform;
  };

  const renderArrayField = (data: any[], emptyText: string = 'Chưa có dữ liệu') => {
    if (!data || data.length === 0) {
      return <Text type="secondary">{emptyText}</Text>;
    }
    return (
      <Space direction="vertical" size="small">
        {data.map((item, index) => (
          <Tag key={index}>{item}</Tag>
        ))}
      </Space>
    );
  };

  const renderBooleanField = (value: boolean) => {
    return value ? (
      <Tag icon={<CheckCircleOutlined />} color="success">
        Có
      </Tag>
    ) : (
      <Tag icon={<CloseCircleOutlined />} color="default">
        Không
      </Tag>
    );
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!system) {
    return null;
  }

  const collapseItems = [
    {
      key: '1',
      label: (
        <span>
          <InfoCircleOutlined /> {isMobile ? 'Cơ bản' : 'Thông tin cơ bản'}
        </span>
      ),
      children: (
        <Descriptions bordered column={{ xs: 1, sm: 1, md: 2, lg: 2, xl: 2 }} size={isMobile ? 'small' : 'default'}>
          <Descriptions.Item label="Tổ chức" span={2}>
            {system.org_name || '-'}
          </Descriptions.Item>
          <Descriptions.Item label="Mã hệ thống" span={1}>
            <Tag color="blue">{system.system_code}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Tên hệ thống" span={1}>
            {system.system_name}
          </Descriptions.Item>
          {system.system_name_en && (
            <Descriptions.Item label="Tên tiếng Anh" span={2}>
              {system.system_name_en}
            </Descriptions.Item>
          )}
          <Descriptions.Item label="Mô tả" span={2}>
            {system.description || '-'}
          </Descriptions.Item>
          <Descriptions.Item label="Trạng thái" span={1}>
            {getStatusTag(system.status)}
          </Descriptions.Item>
          <Descriptions.Item label="Mức độ quan trọng" span={1}>
            {getCriticalityTag(system.criticality_level)}
          </Descriptions.Item>
        </Descriptions>
      ),
    },
    {
      key: '2',
      label: (
        <span>
          <AppstoreOutlined /> {isMobile ? 'Nghiệp vụ' : 'Bối cảnh nghiệp vụ'}
        </span>
      ),
      children: (
        <Descriptions bordered column={{ xs: 1, sm: 1, md: 2, lg: 2, xl: 2 }} size={isMobile ? 'small' : 'default'}>
          <Descriptions.Item label="Mục tiêu nghiệp vụ" span={2}>
            {renderArrayField(system.business_objectives, 'Chưa có mục tiêu')}
          </Descriptions.Item>
          <Descriptions.Item label="Quy trình nghiệp vụ chính" span={2}>
            {renderArrayField(system.business_processes, 'Chưa có quy trình')}
          </Descriptions.Item>
          <Descriptions.Item label="Có đủ hồ sơ phân tích thiết kế?" span={1}>
            {renderBooleanField(system.has_design_documents)}
          </Descriptions.Item>
          <Descriptions.Item label="Số lượng người dùng hàng năm" span={1}>
            {system.annual_users?.toLocaleString() || '-'}
          </Descriptions.Item>
          <Descriptions.Item label="Đối tượng sử dụng" span={2}>
            {system.user_types && system.user_types.length > 0 ? (
              <Space wrap>
                {system.user_types.map((type: string, index: number) => (
                  <Tag key={index} color="blue">
                    {getUserTypeText(type)}
                  </Tag>
                ))}
              </Space>
            ) : (
              <Text type="secondary">Chưa xác định</Text>
            )}
          </Descriptions.Item>
        </Descriptions>
      ),
    },
    {
      key: '3',
      label: (
        <span>
          <DatabaseOutlined /> {isMobile ? 'Công nghệ' : 'Kiến trúc công nghệ'}
        </span>
      ),
      children: (
        <Descriptions bordered column={{ xs: 1, sm: 1, md: 2, lg: 2, xl: 2 }} size={isMobile ? 'small' : 'default'}>
          <Descriptions.Item label="Ngôn ngữ lập trình" span={1}>
            {system.programming_language || '-'}
          </Descriptions.Item>
          <Descriptions.Item label="Framework/Thư viện" span={1}>
            {system.framework || '-'}
          </Descriptions.Item>
          <Descriptions.Item label="Cơ sở dữ liệu" span={1}>
            {system.database_name || '-'}
          </Descriptions.Item>
          <Descriptions.Item label="Nền tảng triển khai" span={1}>
            {system.hosting_platform ? getHostingPlatformText(system.hosting_platform) : '-'}
          </Descriptions.Item>
        </Descriptions>
      ),
    },
    {
      key: '4',
      label: (
        <span>
          <DatabaseOutlined /> {isMobile ? 'Dữ liệu' : 'Kiến trúc dữ liệu'}
        </span>
      ),
      children: (
        <Descriptions bordered column={{ xs: 1, sm: 1, md: 2, lg: 2, xl: 2 }} size={isMobile ? 'small' : 'default'}>
          <Descriptions.Item label="Nguồn dữ liệu" span={2}>
            {renderArrayField(system.data_sources, 'Chưa có nguồn dữ liệu')}
          </Descriptions.Item>
          <Descriptions.Item label="Phân loại dữ liệu" span={1}>
            {system.data_classification_type || '-'}
          </Descriptions.Item>
          <Descriptions.Item label="Khối lượng dữ liệu" span={1}>
            {system.data_volume || '-'}
          </Descriptions.Item>
        </Descriptions>
      ),
    },
    {
      key: '5',
      label: (
        <span>
          <ApiOutlined /> {isMobile ? 'Tích hợp' : 'Tích hợp hệ thống'}
        </span>
      ),
      children: (
        <Descriptions bordered column={{ xs: 1, sm: 1, md: 2, lg: 2, xl: 2 }} size={isMobile ? 'small' : 'default'}>
          <Descriptions.Item label="Hệ thống nội bộ tích hợp" span={1}>
            {renderArrayField(system.integrated_internal_systems, 'Không có')}
          </Descriptions.Item>
          <Descriptions.Item label="Hệ thống bên ngoài tích hợp" span={1}>
            {renderArrayField(system.integrated_external_systems, 'Không có')}
          </Descriptions.Item>
          <Descriptions.Item label="API/Webservices" span={2}>
            {renderArrayField(system.api_list, 'Chưa có API')}
          </Descriptions.Item>
          <Descriptions.Item label="Phương thức trao đổi dữ liệu" span={2}>
            {system.data_exchange_method || '-'}
          </Descriptions.Item>
        </Descriptions>
      ),
    },
    {
      key: '6',
      label: (
        <span>
          <SafetyOutlined /> {isMobile ? 'Bảo mật' : 'An toàn thông tin'}
        </span>
      ),
      children: (
        <Descriptions bordered column={{ xs: 1, sm: 1, md: 2, lg: 2, xl: 2 }} size={isMobile ? 'small' : 'default'}>
          <Descriptions.Item label="Phương thức xác thực" span={1}>
            {system.authentication_method ? getAuthMethodText(system.authentication_method) : '-'}
          </Descriptions.Item>
          <Descriptions.Item label="Mã hóa dữ liệu" span={1}>
            {renderBooleanField(system.has_encryption)}
          </Descriptions.Item>
          <Descriptions.Item label="Có log audit?" span={1}>
            {renderBooleanField(system.has_audit_log)}
          </Descriptions.Item>
          <Descriptions.Item label="Tuân thủ tiêu chuẩn" span={1}>
            {system.compliance_standards_list || '-'}
          </Descriptions.Item>
        </Descriptions>
      ),
    },
    {
      key: '7',
      label: (
        <span>
          <CloudServerOutlined /> {isMobile ? 'Hạ tầng' : 'Hạ tầng kỹ thuật'}
        </span>
      ),
      children: (
        <Descriptions bordered column={{ xs: 1, sm: 1, md: 2, lg: 2, xl: 2 }} size={isMobile ? 'small' : 'default'}>
          <Descriptions.Item label="Cấu hình máy chủ" span={1}>
            {system.server_configuration || '-'}
          </Descriptions.Item>
          <Descriptions.Item label="Dung lượng lưu trữ" span={1}>
            {system.storage_capacity || '-'}
          </Descriptions.Item>
          <Descriptions.Item label="Phương án sao lưu" span={2}>
            {system.backup_plan || '-'}
          </Descriptions.Item>
          <Descriptions.Item label="Kế hoạch khôi phục thảm họa" span={2}>
            {system.disaster_recovery_plan || '-'}
          </Descriptions.Item>
        </Descriptions>
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
        <Descriptions bordered column={{ xs: 1, sm: 1, md: 2, lg: 2, xl: 2 }} size={isMobile ? 'small' : 'default'}>
          <Descriptions.Item label="Người chịu trách nhiệm" span={1}>
            {system.business_owner || '-'}
          </Descriptions.Item>
          <Descriptions.Item label="Người quản trị kỹ thuật" span={1}>
            {system.technical_owner || '-'}
          </Descriptions.Item>
          <Descriptions.Item label="Số điện thoại liên hệ" span={1}>
            {system.responsible_phone || '-'}
          </Descriptions.Item>
          <Descriptions.Item label="Email liên hệ" span={1}>
            {system.responsible_email || '-'}
          </Descriptions.Item>
        </Descriptions>
      ),
    },
  ];

  return (
    <div style={{ padding: isMobile ? '12px' : '24px', background: '#f0f2f5', minHeight: '100vh' }}>
      <Space style={{ marginBottom: 16 }} wrap>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/systems')} size={isMobile ? 'middle' : 'large'}>
          {isMobile ? 'Quay lại' : 'Quay lại danh sách'}
        </Button>
        <Button type="primary" icon={<EditOutlined />} onClick={() => navigate(`/systems/${id}/edit`)} size={isMobile ? 'middle' : 'large'}>
          {isMobile ? 'Sửa' : 'Chỉnh sửa'}
        </Button>
      </Space>

      <Card
        title={
          <Title level={3} style={{ margin: 0 }}>
            {system.system_code} - {system.system_name}
          </Title>
        }
      >
        <Text type="secondary" style={{ display: 'block', marginBottom: 16 }}>
          Hiển thị đầy đủ 24 trường thông tin mới
        </Text>

        <Collapse items={collapseItems} defaultActiveKey={['1']} />
      </Card>
    </div>
  );
};

export default SystemDetail;
