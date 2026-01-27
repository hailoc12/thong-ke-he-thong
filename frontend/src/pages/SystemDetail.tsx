/**
 * System Detail View - COMPLETE VERSION
 * Displays ALL 112 fields from SystemCreate
 * Including nested data: architecture, operations, data_info, integration, assessment
 * Date: 2026-01-27
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
  Empty,
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
  BulbOutlined,
  CodeOutlined,
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
      console.log('System data:', response.data); // Debug
      setSystem(response.data);
    } catch (error) {
      console.error('Failed to fetch system:', error);
      message.error('Không thể tải thông tin hệ thống');
      navigate('/systems');
    } finally {
      setLoading(false);
    }
  };

  // Utility functions
  const renderValue = (value: any, emptyText: string = '-') => {
    if (value === null || value === undefined || value === '') {
      return <Text type="secondary">{emptyText}</Text>;
    }
    return value;
  };

  const renderArrayField = (data: any[], emptyText: string = 'Chưa có dữ liệu') => {
    if (!data || data.length === 0) {
      return <Text type="secondary">{emptyText}</Text>;
    }
    return (
      <Space direction="vertical" size="small" wrap>
        {data.map((item, index) => (
          <Tag key={index} color="blue">{item}</Tag>
        ))}
      </Space>
    );
  };

  const renderBooleanField = (value: boolean) => {
    return value ? (
      <Tag icon={<CheckCircleOutlined />} color="success">Có</Tag>
    ) : (
      <Tag icon={<CloseCircleOutlined />} color="default">Không</Tag>
    );
  };

  const getStatusTag = (status: string) => {
    const map: Record<string, { text: string; color: string }> = {
      operating: { text: 'Đang vận hành', color: 'success' },
      pilot: { text: 'Thí điểm', color: 'processing' },
      testing: { text: 'Đang thử nghiệm', color: 'warning' },
      stopped: { text: 'Dừng', color: 'error' },
      replacing: { text: 'Sắp thay thế', color: 'orange' },
    };
    const config = map[status] || { text: status, color: 'default' };
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  const getCriticalityTag = (level: string) => {
    const map: Record<string, { text: string; color: string }> = {
      high: { text: 'Quan trọng', color: 'red' },
      medium: { text: 'Trung bình', color: 'orange' },
      low: { text: 'Thấp', color: 'blue' },
    };
    const config = map[level] || { text: level, color: 'default' };
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  const getScopeText = (scope: string) => {
    const map: Record<string, string> = {
      internal_unit: 'Nội bộ đơn vị',
      org_wide: 'Toàn bộ',
      external: 'Bên ngoài',
    };
    return map[scope] || scope;
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

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" tip="Đang tải dữ liệu..." />
      </div>
    );
  }

  if (!system) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Empty description="Không tìm thấy hệ thống" />
      </div>
    );
  }

  // Extract nested data
  const arch = system.architecture || {};
  const dataInfo = system.data_info || {};
  const ops = system.operations || {};
  const integ = system.integration || {};
  const assess = system.assessment || {};
  const infra = system.infrastructure || {};
  const sec = system.security || {};

  const collapseItems = [
    // TAB 1: CƠ BẢN
    {
      key: '1',
      label: (
        <span>
          <InfoCircleOutlined /> {isMobile ? 'Cơ bản' : 'Thông tin cơ bản'}
        </span>
      ),
      children: (
        <Descriptions bordered column={{ xs: 1, sm: 1, md: 2 }} size={isMobile ? 'small' : 'default'}>
          <Descriptions.Item label="Tổ chức" span={2}>
            {system.org_name || '-'}
          </Descriptions.Item>
          <Descriptions.Item label="Mã hệ thống">
            <Tag color="blue">{system.system_code}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Tên hệ thống">
            {system.system_name}
          </Descriptions.Item>
          {system.system_name_en && (
            <Descriptions.Item label="Tên tiếng Anh" span={2}>
              {system.system_name_en}
            </Descriptions.Item>
          )}
          <Descriptions.Item label="Mô tả" span={2}>
            {renderValue(system.purpose || system.description)}
          </Descriptions.Item>
          <Descriptions.Item label="Trạng thái">
            {getStatusTag(system.status)}
          </Descriptions.Item>
          <Descriptions.Item label="Mức độ quan trọng">
            {getCriticalityTag(system.criticality_level)}
          </Descriptions.Item>
          <Descriptions.Item label="Phạm vi sử dụng">
            {system.scope ? getScopeText(system.scope) : '-'}
          </Descriptions.Item>
          <Descriptions.Item label="Nhu cầu">
            {renderValue(system.requirement_type)}
          </Descriptions.Item>
          <Descriptions.Item label="Thời gian mong muốn hoàn thành">
            {system.target_completion_date ? new Date(system.target_completion_date).toLocaleDateString('vi-VN', { month: '2-digit', year: 'numeric' }) : '-'}
          </Descriptions.Item>
          <Descriptions.Item label="Nhóm hệ thống">
            {renderValue(system.system_group)}
          </Descriptions.Item>
          {system.additional_notes_tab1 && (
            <Descriptions.Item label="Ghi chú bổ sung" span={2}>
              {system.additional_notes_tab1}
            </Descriptions.Item>
          )}
        </Descriptions>
      ),
    },
    // TAB 2: NGHIỆP VỤ
    {
      key: '2',
      label: (
        <span>
          <AppstoreOutlined /> {isMobile ? 'Nghiệp vụ' : 'Bối cảnh nghiệp vụ'}
        </span>
      ),
      children: (
        <Descriptions bordered column={{ xs: 1, sm: 1, md: 2 }} size={isMobile ? 'small' : 'default'}>
          <Descriptions.Item label="Mục tiêu nghiệp vụ" span={2}>
            {renderArrayField(system.business_objectives, 'Chưa có mục tiêu')}
          </Descriptions.Item>
          <Descriptions.Item label="Quy trình nghiệp vụ chính" span={2}>
            {renderArrayField(system.business_processes, 'Chưa có quy trình')}
          </Descriptions.Item>
          <Descriptions.Item label="Có đủ hồ sơ phân tích thiết kế?">
            {renderBooleanField(system.has_design_documents)}
          </Descriptions.Item>
          <Descriptions.Item label="Số lượng người dùng hàng năm">
            {system.annual_users ? system.annual_users.toLocaleString() : '-'}
          </Descriptions.Item>
          <Descriptions.Item label="Tổng số tài khoản">
            {system.total_accounts ? system.total_accounts.toLocaleString() : '-'}
          </Descriptions.Item>
          <Descriptions.Item label="MAU (Monthly Active Users)">
            {system.users_mau ? system.users_mau.toLocaleString() : '-'}
          </Descriptions.Item>
          <Descriptions.Item label="DAU (Daily Active Users)">
            {system.users_dau ? system.users_dau.toLocaleString() : '-'}
          </Descriptions.Item>
          <Descriptions.Item label="Số đơn vị/địa phương sử dụng">
            {system.num_organizations ? system.num_organizations.toLocaleString() : '-'}
          </Descriptions.Item>
          <Descriptions.Item label="Đối tượng sử dụng" span={2}>
            {system.user_types && system.user_types.length > 0 ? (
              <Space wrap>
                {system.user_types.map((type: string, index: number) => (
                  <Tag key={index} color="purple">{getUserTypeText(type)}</Tag>
                ))}
              </Space>
            ) : (
              <Text type="secondary">Chưa xác định</Text>
            )}
          </Descriptions.Item>
          {system.additional_notes_tab2 && (
            <Descriptions.Item label="Ghi chú bổ sung" span={2}>
              {system.additional_notes_tab2}
            </Descriptions.Item>
          )}
        </Descriptions>
      ),
    },
    // TAB 3: CÔNG NGHỆ
    {
      key: '3',
      label: (
        <span>
          <CodeOutlined /> {isMobile ? 'Công nghệ' : 'Kiến trúc công nghệ'}
        </span>
      ),
      children: (
        <Descriptions bordered column={{ xs: 1, sm: 1, md: 2 }} size={isMobile ? 'small' : 'default'}>
          <Descriptions.Item label="Ngôn ngữ lập trình" span={2}>
            {renderArrayField(system.programming_language, 'Chưa xác định')}
          </Descriptions.Item>
          <Descriptions.Item label="Framework/Thư viện" span={2}>
            {renderArrayField(system.framework, 'Chưa xác định')}
          </Descriptions.Item>
          <Descriptions.Item label="Cơ sở dữ liệu">
            {renderValue(arch.database_name || system.database_name)}
          </Descriptions.Item>
          <Descriptions.Item label="Nền tảng triển khai">
            {renderValue(system.hosting_platform)}
          </Descriptions.Item>
          <Descriptions.Item label="Backend Technology" span={2}>
            {renderArrayField(arch.backend_tech, 'Chưa xác định')}
          </Descriptions.Item>
          <Descriptions.Item label="Frontend Technology" span={2}>
            {renderArrayField(arch.frontend_tech, 'Chưa xác định')}
          </Descriptions.Item>
          <Descriptions.Item label="Loại kiến trúc" span={2}>
            {renderArrayField(arch.architecture_type, 'Chưa xác định')}
          </Descriptions.Item>
          <Descriptions.Item label="Container hóa" span={2}>
            {renderArrayField(arch.containerization, 'Chưa có')}
          </Descriptions.Item>
          <Descriptions.Item label="Multi-tenant">
            {renderBooleanField(arch.is_multi_tenant)}
          </Descriptions.Item>
          <Descriptions.Item label="Phân lớp (Layered)">
            {renderBooleanField(arch.has_layered_architecture)}
          </Descriptions.Item>
          {arch.layered_architecture_details && (
            <Descriptions.Item label="Chi tiết phân lớp" span={2}>
              {arch.layered_architecture_details}
            </Descriptions.Item>
          )}
          <Descriptions.Item label="API Style" span={2}>
            {renderArrayField(arch.api_style, 'Chưa xác định')}
          </Descriptions.Item>
          <Descriptions.Item label="Messaging/Queue" span={2}>
            {renderArrayField(arch.messaging_queue, 'Không có')}
          </Descriptions.Item>
          <Descriptions.Item label="Cache System">
            {renderValue(arch.cache_system)}
          </Descriptions.Item>
          <Descriptions.Item label="Search Engine">
            {renderValue(arch.search_engine)}
          </Descriptions.Item>
          <Descriptions.Item label="Reporting/BI Tool">
            {renderValue(arch.reporting_bi_tool)}
          </Descriptions.Item>
          <Descriptions.Item label="Source Repository">
            {renderValue(arch.source_repository)}
          </Descriptions.Item>
          <Descriptions.Item label="CI/CD Pipeline">
            {renderBooleanField(arch.has_cicd)}
          </Descriptions.Item>
          <Descriptions.Item label="CI/CD Tool">
            {renderValue(arch.cicd_tool)}
          </Descriptions.Item>
          <Descriptions.Item label="Automated Testing">
            {renderBooleanField(arch.has_automated_testing)}
          </Descriptions.Item>
          <Descriptions.Item label="Testing Tools">
            {renderValue(arch.automated_testing_tools)}
          </Descriptions.Item>
          {arch.additional_notes && (
            <Descriptions.Item label="Ghi chú bổ sung" span={2}>
              {arch.additional_notes}
            </Descriptions.Item>
          )}
        </Descriptions>
      ),
    },
    // TAB 4: DỮ LIỆU
    {
      key: '4',
      label: (
        <span>
          <DatabaseOutlined /> {isMobile ? 'Dữ liệu' : 'Kiến trúc dữ liệu'}
        </span>
      ),
      children: (
        <Descriptions bordered column={{ xs: 1, sm: 1, md: 2 }} size={isMobile ? 'small' : 'default'}>
          <Descriptions.Item label="Nguồn dữ liệu" span={2}>
            {renderArrayField(dataInfo.data_sources, 'Chưa có nguồn dữ liệu')}
          </Descriptions.Item>
          <Descriptions.Item label="Loại dữ liệu" span={2}>
            {renderArrayField(dataInfo.data_types, 'Chưa xác định')}
          </Descriptions.Item>
          <Descriptions.Item label="Phân loại dữ liệu" span={2}>
            {renderArrayField(system.data_classification_type || dataInfo.data_classification_type, 'Chưa xác định')}
          </Descriptions.Item>
          <Descriptions.Item label="Khối lượng dữ liệu" span={2}>
            {renderValue(dataInfo.data_volume)}
          </Descriptions.Item>
          <Descriptions.Item label="Dung lượng CSDL hiện tại (GB)">
            {dataInfo.storage_size_gb ? `${dataInfo.storage_size_gb.toLocaleString()} GB` : '-'}
          </Descriptions.Item>
          <Descriptions.Item label="Dung lượng file đính kèm (GB)">
            {dataInfo.file_storage_size_gb ? `${dataInfo.file_storage_size_gb.toLocaleString()} GB` : '-'}
          </Descriptions.Item>
          <Descriptions.Item label="Tốc độ tăng trưởng dữ liệu (%)">
            {dataInfo.growth_rate_percent ? `${dataInfo.growth_rate_percent}%` : '-'}
          </Descriptions.Item>
          <Descriptions.Item label="Loại lưu trữ file" span={2}>
            {renderArrayField(dataInfo.file_storage_type, 'Chưa xác định')}
          </Descriptions.Item>
          <Descriptions.Item label="Số bản ghi">
            {dataInfo.record_count ? dataInfo.record_count.toLocaleString() : '-'}
          </Descriptions.Item>
          <Descriptions.Item label="CSDL phụ/khác">
            {renderArrayField(dataInfo.secondary_databases, 'Không có')}
          </Descriptions.Item>
          {dataInfo.data_retention_policy && (
            <Descriptions.Item label="Chính sách lưu trữ dữ liệu" span={2}>
              {dataInfo.data_retention_policy}
            </Descriptions.Item>
          )}
          <Descriptions.Item label="Data Catalog">
            {renderBooleanField(dataInfo.has_data_catalog)}
          </Descriptions.Item>
          <Descriptions.Item label="Master Data Management (MDM)">
            {renderBooleanField(dataInfo.has_mdm)}
          </Descriptions.Item>
          {dataInfo.data_catalog_notes && (
            <Descriptions.Item label="Ghi chú Data Catalog" span={2}>
              {dataInfo.data_catalog_notes}
            </Descriptions.Item>
          )}
          {dataInfo.mdm_notes && (
            <Descriptions.Item label="Ghi chú MDM" span={2}>
              {dataInfo.mdm_notes}
            </Descriptions.Item>
          )}
          {dataInfo.additional_notes && (
            <Descriptions.Item label="Ghi chú bổ sung" span={2}>
              {dataInfo.additional_notes}
            </Descriptions.Item>
          )}
        </Descriptions>
      ),
    },
    // TAB 5: TÍCH HỢP
    {
      key: '5',
      label: (
        <span>
          <ApiOutlined /> {isMobile ? 'Tích hợp' : 'Tích hợp hệ thống'}
        </span>
      ),
      children: (
        <Descriptions bordered column={{ xs: 1, sm: 1, md: 2 }} size={isMobile ? 'small' : 'default'}>
          <Descriptions.Item label="Số API cung cấp">
            {integ.api_provided_count || '-'}
          </Descriptions.Item>
          <Descriptions.Item label="Số API tiêu thụ">
            {integ.api_consumed_count || '-'}
          </Descriptions.Item>
          <Descriptions.Item label="Chuẩn API" span={2}>
            {renderArrayField(integ.api_standard, 'Chưa xác định')}
          </Descriptions.Item>
          <Descriptions.Item label="Có API Gateway?">
            {renderBooleanField(integ.has_api_gateway)}
          </Descriptions.Item>
          <Descriptions.Item label="Tên API Gateway">
            {renderValue(integ.api_gateway_name)}
          </Descriptions.Item>
          <Descriptions.Item label="Có API Versioning?">
            {renderBooleanField(integ.has_api_versioning)}
          </Descriptions.Item>
          <Descriptions.Item label="Có Rate Limiting?">
            {renderBooleanField(integ.has_rate_limiting)}
          </Descriptions.Item>
          {integ.api_documentation && (
            <Descriptions.Item label="Tài liệu API" span={2}>
              {integ.api_documentation}
            </Descriptions.Item>
          )}
          <Descriptions.Item label="Chuẩn phiên bản API">
            {renderValue(integ.api_versioning_standard)}
          </Descriptions.Item>
          <Descriptions.Item label="Có giám sát tích hợp?">
            {renderBooleanField(integ.has_integration_monitoring)}
          </Descriptions.Item>
          <Descriptions.Item label="Hệ thống nội bộ tích hợp" span={2}>
            {renderArrayField(integ.integrated_internal_systems, 'Không có')}
          </Descriptions.Item>
          <Descriptions.Item label="Hệ thống bên ngoài tích hợp" span={2}>
            {renderArrayField(integ.integrated_external_systems, 'Không có')}
          </Descriptions.Item>
          <Descriptions.Item label="API/Webservices" span={2}>
            {renderArrayField(integ.api_list, 'Chưa có API')}
          </Descriptions.Item>
          <Descriptions.Item label="Phương thức trao đổi dữ liệu" span={2}>
            {renderArrayField(system.data_exchange_method || integ.data_exchange_method, 'Chưa xác định')}
          </Descriptions.Item>
          {system.integration_connections && system.integration_connections.length > 0 && (
            <Descriptions.Item label="Danh sách tích hợp chi tiết" span={2}>
              <Space direction="vertical" style={{ width: '100%' }}>
                {system.integration_connections.map((conn: any, idx: number) => (
                  <Card key={idx} size="small" style={{ marginTop: 8 }}>
                    <Space direction="vertical" size="small">
                      <Text strong>Kết nối #{idx + 1}</Text>
                      <Text>Nguồn: {conn.source_system || '-'}</Text>
                      <Text>Đích: {conn.target_system || '-'}</Text>
                      <Text>Dữ liệu: {conn.data_objects || '-'}</Text>
                      <Text>Phương thức: {conn.integration_method || '-'}</Text>
                      <Text>Tần suất: {conn.frequency || '-'}</Text>
                    </Space>
                  </Card>
                ))}
              </Space>
            </Descriptions.Item>
          )}
          {integ.additional_notes && (
            <Descriptions.Item label="Ghi chú bổ sung" span={2}>
              {integ.additional_notes}
            </Descriptions.Item>
          )}
        </Descriptions>
      ),
    },
    // TAB 6: BẢO MẬT
    {
      key: '6',
      label: (
        <span>
          <SafetyOutlined /> {isMobile ? 'Bảo mật' : 'An toàn thông tin'}
        </span>
      ),
      children: (
        <Descriptions bordered column={{ xs: 1, sm: 1, md: 2 }} size={isMobile ? 'small' : 'default'}>
          <Descriptions.Item label="Phương thức xác thực" span={2}>
            {renderArrayField(system.authentication_method || sec.authentication_method, 'Chưa xác định')}
          </Descriptions.Item>
          <Descriptions.Item label="Mã hóa dữ liệu">
            {renderBooleanField(sec.has_encryption || system.has_encryption)}
          </Descriptions.Item>
          <Descriptions.Item label="Có log audit?">
            {renderBooleanField(sec.has_audit_log || system.has_audit_log)}
          </Descriptions.Item>
          <Descriptions.Item label="Cấp độ an toàn">
            {renderValue(sec.security_level)}
          </Descriptions.Item>
          <Descriptions.Item label="Có tài liệu ATTT?">
            {renderBooleanField(sec.has_security_documents)}
          </Descriptions.Item>
          {sec.additional_notes && (
            <Descriptions.Item label="Ghi chú bổ sung" span={2}>
              {sec.additional_notes}
            </Descriptions.Item>
          )}
        </Descriptions>
      ),
    },
    // TAB 7: HẠ TẦNG
    {
      key: '7',
      label: (
        <span>
          <CloudServerOutlined /> {isMobile ? 'Hạ tầng' : 'Hạ tầng kỹ thuật'}
        </span>
      ),
      children: (
        <Descriptions bordered column={{ xs: 1, sm: 1, md: 2 }} size={isMobile ? 'small' : 'default'}>
          <Descriptions.Item label="Vị trí triển khai">
            {renderValue(ops.deployment_location || infra.deployment_location)}
          </Descriptions.Item>
          <Descriptions.Item label="Loại hạ tầng tính toán">
            {renderValue(ops.compute_type || infra.compute_type)}
          </Descriptions.Item>
          <Descriptions.Item label="Cấu hình máy chủ" span={2}>
            {renderValue(infra.server_configuration || system.server_configuration)}
          </Descriptions.Item>
          <Descriptions.Item label="Cấu hình tính toán" span={2}>
            {renderValue(infra.compute_specifications)}
          </Descriptions.Item>
          <Descriptions.Item label="Dung lượng lưu trữ">
            {renderValue(infra.storage_capacity || system.storage_capacity)}
          </Descriptions.Item>
          <Descriptions.Item label="Tần suất triển khai">
            {renderValue(infra.deployment_frequency)}
          </Descriptions.Item>
          <Descriptions.Item label="Phương án sao lưu" span={2}>
            {renderArrayField(system.backup_plan || infra.backup_plan, 'Chưa có')}
          </Descriptions.Item>
          <Descriptions.Item label="Kế hoạch khôi phục thảm họa" span={2}>
            {renderValue(infra.disaster_recovery_plan || system.disaster_recovery_plan)}
          </Descriptions.Item>
          {infra.additional_notes && (
            <Descriptions.Item label="Ghi chú bổ sung" span={2}>
              {infra.additional_notes}
            </Descriptions.Item>
          )}
        </Descriptions>
      ),
    },
    // TAB 8: VẬN HÀNH
    {
      key: '8',
      label: (
        <span>
          <ToolOutlined /> Vận hành
        </span>
      ),
      children: (
        <Descriptions bordered column={{ xs: 1, sm: 1, md: 2 }} size={isMobile ? 'small' : 'default'}>
          <Descriptions.Item label="Người chịu trách nhiệm">
            {renderValue(ops.business_owner || system.business_owner)}
          </Descriptions.Item>
          <Descriptions.Item label="Người quản trị kỹ thuật">
            {renderValue(ops.technical_owner || system.technical_owner)}
          </Descriptions.Item>
          <Descriptions.Item label="Số điện thoại liên hệ">
            {renderValue(ops.responsible_phone || system.responsible_phone)}
          </Descriptions.Item>
          <Descriptions.Item label="Email liên hệ">
            {renderValue(ops.responsible_email || system.responsible_email)}
          </Descriptions.Item>
          <Descriptions.Item label="Mức độ hỗ trợ" span={2}>
            {renderValue(ops.support_level)}
          </Descriptions.Item>
          {ops.additional_notes && (
            <Descriptions.Item label="Ghi chú bổ sung" span={2}>
              {ops.additional_notes}
            </Descriptions.Item>
          )}
        </Descriptions>
      ),
    },
    // TAB 9: ĐÁNH GIÁ (NEW!)
    {
      key: '9',
      label: (
        <span>
          <BulbOutlined /> {isMobile ? 'Đánh giá' : 'Đánh giá mức nợ kỹ thuật'}
        </span>
      ),
      children: assess && Object.keys(assess).length > 0 ? (
        <Descriptions bordered column={{ xs: 1, sm: 1, md: 2 }} size={isMobile ? 'small' : 'default'}>
          <Descriptions.Item label="Điểm phù hợp cho tích hợp" span={2}>
            {renderArrayField(assess.integration_readiness, 'Chưa đánh giá')}
          </Descriptions.Item>
          <Descriptions.Item label="Điểm vướng mắc" span={2}>
            {renderArrayField(assess.blockers, 'Không có')}
          </Descriptions.Item>
          <Descriptions.Item label="Đề xuất của đơn vị" span={2}>
            {renderValue(assess.recommendation)}
          </Descriptions.Item>
        </Descriptions>
      ) : (
        <Empty description="Chưa có đánh giá" />
      ),
    },
  ];

  return (
    <div style={{ padding: isMobile ? '12px' : '24px', background: '#f0f2f5', minHeight: '100vh' }}>
      <Space style={{ marginBottom: 16 }} wrap>
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate('/systems')}
          size={isMobile ? 'middle' : 'large'}
        >
          {isMobile ? 'Quay lại' : 'Quay lại danh sách'}
        </Button>
        <Button
          type="primary"
          icon={<EditOutlined />}
          onClick={() => navigate(`/systems/${id}/edit`)}
          size={isMobile ? 'middle' : 'large'}
        >
          {isMobile ? 'Sửa' : 'Chỉnh sửa'}
        </Button>
      </Space>

      <Card
        title={
          <Title level={isMobile ? 4 : 3} style={{ margin: 0 }}>
            {system.system_code} - {system.system_name}
          </Title>
        }
      >
        <Text type="secondary" style={{ display: 'block', marginBottom: 16 }}>
          Hiển thị đầy đủ tất cả thông tin (112 fields) bao gồm kiến trúc, dữ liệu, tích hợp, bảo mật, hạ tầng, và đánh giá
        </Text>

        <Collapse
          items={collapseItems}
          defaultActiveKey={['1']}
          accordion={false}
        />
      </Card>
    </div>
  );
};

export default SystemDetail;
