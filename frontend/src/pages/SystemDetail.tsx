import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Descriptions, Button, Space, Spin, message, Tag, Typography } from 'antd';
import { EditOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import api from '../config/api';
import type { System } from '../types';

const { Title } = Typography;

const SystemDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [system, setSystem] = useState<System | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSystem();
  }, [id]);

  const fetchSystem = async () => {
    setLoading(true);
    try {
      const response = await api.get<System>(`/systems/${id}/`);
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
      pilot: { text: 'Thí điểm', color: 'processing' },
      stopped: { text: 'Dừng', color: 'error' },
      replacing: { text: 'Sắp thay thế', color: 'warning' },
    };
    const config = statusMap[status] || { text: status, color: 'default' };
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  const getCriticalityTag = (level: string) => {
    const levelMap: Record<string, { text: string; color: string }> = {
      critical: { text: 'Tối quan trọng', color: 'red' },
      high: { text: 'Quan trọng', color: 'orange' },
      medium: { text: 'Trung bình', color: 'blue' },
      low: { text: 'Thấp', color: 'default' },
    };
    const config = levelMap[level] || { text: level, color: 'default' };
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  const getScopeText = (scope: string) => {
    const scopeMap: Record<string, string> = {
      internal_unit: 'Nội bộ đơn vị',
      org_wide: 'Toàn bộ',
      external: 'Bên ngoài',
    };
    return scopeMap[scope] || scope;
  };

  const getSystemGroupText = (group: string) => {
    const groupMap: Record<string, string> = {
      platform: 'Nền tảng',
      business: 'Nghiệp vụ',
      portal: 'Cổng thông tin',
      website: 'Website',
      bi: 'BI/Báo cáo',
      esb: 'ESB/Tích hợp',
      other: 'Khác',
    };
    return groupMap[group] || group;
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

  return (
    <div>
      <Space style={{ marginBottom: 16 }}>
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate('/systems')}
        >
          Quay lại
        </Button>
        <Button
          type="primary"
          icon={<EditOutlined />}
          onClick={() => navigate(`/systems/${id}/edit`)}
        >
          Chỉnh sửa
        </Button>
      </Space>

      <Card title={<Title level={3} style={{ margin: 0 }}>{system.system_code} - {system.system_name}</Title>}>
        <Descriptions bordered column={2}>
          <Descriptions.Item label="Mã hệ thống" span={1}>
            {system.system_code}
          </Descriptions.Item>
          <Descriptions.Item label="Tên hệ thống" span={1}>
            {system.system_name}
          </Descriptions.Item>

          {system.system_name_en && (
            <Descriptions.Item label="Tên tiếng Anh" span={2}>
              {system.system_name_en}
            </Descriptions.Item>
          )}

          <Descriptions.Item label="Đơn vị" span={2}>
            {system.org_name || '-'}
          </Descriptions.Item>

          <Descriptions.Item label="Mục đích" span={2}>
            {system.purpose || '-'}
          </Descriptions.Item>

          <Descriptions.Item label="Phạm vi" span={1}>
            {system.scope ? getScopeText(system.scope) : '-'}
          </Descriptions.Item>

          <Descriptions.Item label="Nhóm hệ thống" span={1}>
            {system.system_group ? getSystemGroupText(system.system_group) : '-'}
          </Descriptions.Item>

          <Descriptions.Item label="Trạng thái" span={1}>
            {getStatusTag(system.status)}
          </Descriptions.Item>

          <Descriptions.Item label="Mức độ quan trọng" span={1}>
            {getCriticalityTag(system.criticality_level)}
          </Descriptions.Item>

          <Descriptions.Item label="Ngày đưa vào vận hành" span={1}>
            {system.go_live_date || '-'}
          </Descriptions.Item>

          <Descriptions.Item label="Phiên bản hiện tại" span={1}>
            {system.current_version || '-'}
          </Descriptions.Item>

          <Descriptions.Item label="Chủ sở hữu nghiệp vụ" span={1}>
            {system.business_owner || '-'}
          </Descriptions.Item>

          <Descriptions.Item label="Chủ sở hữu kỹ thuật" span={1}>
            {system.technical_owner || '-'}
          </Descriptions.Item>

          <Descriptions.Item label="Người phụ trách" span={2}>
            {system.responsible_person || '-'}
            {system.responsible_phone && ` - ${system.responsible_phone}`}
            {system.responsible_email && ` - ${system.responsible_email}`}
          </Descriptions.Item>

          <Descriptions.Item label="Tổng số người dùng" span={1}>
            {system.users_total?.toLocaleString() || 0}
          </Descriptions.Item>

          <Descriptions.Item label="Người dùng hoạt động/tháng (MAU)" span={1}>
            {system.users_mau?.toLocaleString() || 0}
          </Descriptions.Item>

          <Descriptions.Item label="Người dùng hoạt động/ngày (DAU)" span={1}>
            {system.users_dau?.toLocaleString() || 0}
          </Descriptions.Item>

          <Descriptions.Item label="Số đơn vị sử dụng" span={1}>
            {system.num_organizations || 0}
          </Descriptions.Item>
        </Descriptions>
      </Card>
    </div>
  );
};

export default SystemDetail;
