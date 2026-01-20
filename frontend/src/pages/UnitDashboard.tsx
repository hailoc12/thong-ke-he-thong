import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Row, Col, Statistic, Typography, Skeleton, Button, Table, Progress, Space, Tag, message } from 'antd';
import { motion } from 'framer-motion';
import {
  DashboardOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ReloadOutlined,
  AppstoreOutlined,
} from '@ant-design/icons';
import CountUp from 'react-countup';
import dayjs from 'dayjs';
import api from '../config/api';
import { colors, shadows, borderRadius } from '../theme/tokens';
import { useAuthStore } from '../stores/authStore';

const { Title, Text } = Typography;

// TypeScript interfaces
interface UnitDashboardData {
  organization: {
    id: number;
    name: string;
    org_code: string;
  };
  total_systems: number;
  overall_completion_percentage: number;
  complete_systems: number;
  incomplete_systems: number;
  systems: SystemProgressItem[];
}

interface SystemProgressItem {
  id: number;
  system_name: string;
  system_code: string;
  status: string;
  completion_percentage: number;
  created_at: string | null;
  updated_at: string | null;
}

const UnitDashboard = () => {
  const navigate = useNavigate();
  const { isAdmin } = useAuthStore();
  const [dashboardData, setDashboardData] = useState<UnitDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  // Redirect admin users to home page
  useEffect(() => {
    if (isAdmin) {
      message.warning('Trang này chỉ dành cho người dùng đơn vị');
      navigate('/');
    }
  }, [isAdmin, navigate]);

  useEffect(() => {
    if (!isAdmin) {
      fetchDashboardData();
    }
  }, [isAdmin]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await api.get<UnitDashboardData>('/systems/dashboard/unit-progress/');
      setDashboardData(response.data);
      setLastUpdated(new Date());
    } catch (error: any) {
      console.error('Failed to fetch dashboard data:', error);
      message.error(error.response?.data?.error || 'Không thể tải dữ liệu dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchDashboardData();
  };

  // Table columns
  const columns = [
    {
      title: 'Mã hệ thống',
      dataIndex: 'system_code',
      key: 'system_code',
      width: 150,
      render: (text: string) => <Text strong>{text || '-'}</Text>,
    },
    {
      title: 'Tên hệ thống',
      dataIndex: 'system_name',
      key: 'system_name',
      render: (text: string) => <Text>{text}</Text>,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status: string) => {
        const statusColors: Record<string, string> = {
          production: 'success',
          development: 'processing',
          maintenance: 'warning',
          inactive: 'default',
          planning: 'default',
        };
        const statusLabels: Record<string, string> = {
          production: 'Hoạt động',
          development: 'Phát triển',
          maintenance: 'Bảo trì',
          inactive: 'Ngừng hoạt động',
          planning: 'Lên kế hoạch',
        };
        return <Tag color={statusColors[status] || 'default'}>{statusLabels[status] || status}</Tag>;
      },
    },
    {
      title: 'Tiến độ báo cáo',
      dataIndex: 'completion_percentage',
      key: 'completion_percentage',
      width: 250,
      render: (percentage: number) => {
        let status: 'success' | 'exception' | 'normal' = 'normal';
        if (percentage >= 100) status = 'success';
        else if (percentage < 50) status = 'exception';

        return (
          <Space direction="vertical" size={4} style={{ width: '100%' }}>
            <Progress
              percent={percentage}
              status={status}
              strokeColor={
                percentage >= 100
                  ? colors.success.main
                  : percentage >= 70
                  ? colors.primary.main
                  : percentage >= 50
                  ? colors.warning.main
                  : colors.error.main
              }
            />
          </Space>
        );
      },
      sorter: (a: SystemProgressItem, b: SystemProgressItem) => a.completion_percentage - b.completion_percentage,
    },
    {
      title: 'Cập nhật lần cuối',
      dataIndex: 'updated_at',
      key: 'updated_at',
      width: 180,
      render: (date: string | null) => {
        if (!date) return '-';
        return dayjs(date).format('DD/MM/YYYY HH:mm');
      },
    },
  ];

  if (loading && !dashboardData) {
    return (
      <div style={{ padding: '24px' }}>
        <Skeleton active paragraph={{ rows: 8 }} />
      </div>
    );
  }

  return (
    <div style={{ padding: '24px', background: colors.background.default }}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card
          bordered={false}
          style={{
            marginBottom: '24px',
            borderRadius: borderRadius.lg,
            boxShadow: shadows.sm,
          }}
        >
          <Space direction="vertical" size={8} style={{ width: '100%' }}>
            <Space align="center" style={{ width: '100%', justifyContent: 'space-between' }}>
              <Space align="center">
                <DashboardOutlined style={{ fontSize: 28, color: colors.primary.main }} />
                <Title level={3} style={{ margin: 0 }}>
                  Dashboard Đơn vị
                </Title>
              </Space>
              <Button
                icon={<ReloadOutlined />}
                onClick={handleRefresh}
                loading={loading}
              >
                Làm mới
              </Button>
            </Space>
            {dashboardData && (
              <>
                <Text type="secondary">
                  Đơn vị: <Text strong>{dashboardData.organization.name}</Text> ({dashboardData.organization.org_code})
                </Text>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  Cập nhật lúc: {dayjs(lastUpdated).format('DD/MM/YYYY HH:mm:ss')}
                </Text>
              </>
            )}
          </Space>
        </Card>
      </motion.div>

      {/* Statistics Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} sm={12} lg={8}>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <Card
              bordered={false}
              style={{
                borderRadius: borderRadius.lg,
                boxShadow: shadows.sm,
                background: `linear-gradient(135deg, ${colors.primary.main} 0%, ${colors.primary.dark} 100%)`,
              }}
            >
              <Statistic
                title={<span style={{ color: 'rgba(255,255,255,0.85)' }}>Tổng số hệ thống</span>}
                value={dashboardData?.total_systems || 0}
                prefix={<AppstoreOutlined style={{ color: '#fff' }} />}
                valueStyle={{ color: '#fff', fontWeight: 'bold' }}
                formatter={(value) => <CountUp end={value as number} duration={1.5} />}
              />
            </Card>
          </motion.div>
        </Col>

        <Col xs={24} sm={12} lg={8}>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <Card
              bordered={false}
              style={{
                borderRadius: borderRadius.lg,
                boxShadow: shadows.sm,
                background: `linear-gradient(135deg, ${colors.success.main} 0%, #389e0d 100%)`,
              }}
            >
              <Statistic
                title={<span style={{ color: 'rgba(255,255,255,0.85)' }}>Tiến độ tổng thể</span>}
                value={dashboardData?.overall_completion_percentage || 0}
                suffix="%"
                prefix={<CheckCircleOutlined style={{ color: '#fff' }} />}
                valueStyle={{ color: '#fff', fontWeight: 'bold' }}
                formatter={(value) => <CountUp end={value as number} decimals={1} duration={1.5} />}
              />
            </Card>
          </motion.div>
        </Col>

        <Col xs={24} sm={12} lg={8}>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.3 }}
          >
            <Card
              bordered={false}
              style={{
                borderRadius: borderRadius.lg,
                boxShadow: shadows.sm,
                background: `linear-gradient(135deg, ${colors.warning.main} 0%, #d48806 100%)`,
              }}
            >
              <Statistic
                title={<span style={{ color: 'rgba(255,255,255,0.85)' }}>Hệ thống chưa hoàn thành</span>}
                value={dashboardData?.incomplete_systems || 0}
                prefix={<ClockCircleOutlined style={{ color: '#fff' }} />}
                valueStyle={{ color: '#fff', fontWeight: 'bold' }}
                formatter={(value) => <CountUp end={value as number} duration={1.5} />}
              />
              <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12 }}>
                Đã hoàn thành: {dashboardData?.complete_systems || 0}
              </Text>
            </Card>
          </motion.div>
        </Col>
      </Row>

      {/* Systems Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.4 }}
      >
        <Card
          bordered={false}
          style={{
            borderRadius: borderRadius.lg,
            boxShadow: shadows.sm,
          }}
          title={
            <Space>
              <AppstoreOutlined />
              <Text strong>Danh sách hệ thống ({dashboardData?.systems.length || 0})</Text>
            </Space>
          }
        >
          <Table
            dataSource={dashboardData?.systems || []}
            columns={columns}
            rowKey="id"
            loading={loading}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (total) => `Tổng ${total} hệ thống`,
              pageSizeOptions: ['10', '20', '50', '100'],
            }}
            scroll={{ x: 800 }}
          />
        </Card>
      </motion.div>
    </div>
  );
};

export default UnitDashboard;
