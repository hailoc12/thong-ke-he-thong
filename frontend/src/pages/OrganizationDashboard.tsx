import { useEffect, useState } from 'react';
import { Card, Row, Col, Statistic, Typography, Table, Button, Space, Progress, Tag, Skeleton } from 'antd';
import { motion } from 'framer-motion';
import {
  AppstoreOutlined,
  FileTextOutlined,
  EyeOutlined,
  EditOutlined,
  ReloadOutlined,
  CheckCircleOutlined,
  WarningOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import CountUp from 'react-countup';
import api from '../config/api';
import type { SystemStatistics } from '../types';
import { colors, shadows, borderRadius, spacing } from '../theme/tokens';

const { Title, Text } = Typography;

interface System {
  id: number;
  system_code: string;
  system_name: string;
  status: string;
  status_display: string;
  criticality_level: string;
  criticality_display: string;
  completion_percentage: number;
  created_at: string;
  updated_at: string;
}

const OrganizationDashboard = () => {
  const navigate = useNavigate();
  const [statistics, setStatistics] = useState<SystemStatistics | null>(null);
  const [systems, setSystems] = useState<System[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch statistics and systems in parallel
      const [statsResponse, systemsResponse] = await Promise.all([
        api.get<SystemStatistics>('/systems/statistics/'),
        api.get<{ results: System[] }>('/systems/'),
      ]);

      setStatistics(statsResponse.data);
      setSystems(systemsResponse.data.results || systemsResponse.data);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchData();
  };

  const getCompletionColor = (percentage: number): string => {
    if (percentage >= 80) return '#52c41a';
    if (percentage >= 50) return '#faad14';
    return '#ff4d4f';
  };

  const getCompletionStatus = (percentage: number): { text: string; color: string; icon: React.ReactNode } => {
    if (percentage >= 80) {
      return { text: 'Hoàn thành tốt', color: 'success', icon: <CheckCircleOutlined /> };
    }
    if (percentage >= 50) {
      return { text: 'Cần bổ sung', color: 'warning', icon: <ClockCircleOutlined /> };
    }
    return { text: 'Chưa đủ thông tin', color: 'error', icon: <WarningOutlined /> };
  };

  const columns = [
    {
      title: 'Tên hệ thống',
      dataIndex: 'system_name',
      key: 'system_name',
      width: 300,
      render: (text: string, record: System) => (
        <div>
          <div style={{ fontWeight: 500, marginBottom: 4 }}>{text}</div>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {record.system_code}
          </Text>
        </div>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status_display',
      key: 'status',
      width: 150,
      render: (text: string, record: System) => {
        const colorMap: Record<string, string> = {
          operating: 'green',
          pilot: 'blue',
          stopped: 'red',
          replacing: 'orange',
        };
        return <Tag color={colorMap[record.status] || 'default'}>{text}</Tag>;
      },
    },
    {
      title: 'Mức độ quan trọng',
      dataIndex: 'criticality_display',
      key: 'criticality',
      width: 150,
      render: (text: string, record: System) => {
        const colorMap: Record<string, string> = {
          high: 'red',
          medium: 'orange',
          low: 'green',
        };
        return <Tag color={colorMap[record.criticality_level] || 'default'}>{text}</Tag>;
      },
    },
    {
      title: '% Hoàn thành',
      dataIndex: 'completion_percentage',
      key: 'completion_percentage',
      width: 250,
      sorter: (a: System, b: System) => a.completion_percentage - b.completion_percentage,
      render: (percentage: number) => {
        const status = getCompletionStatus(percentage);
        return (
          <div>
            <Progress
              percent={percentage}
              strokeColor={getCompletionColor(percentage)}
              size="small"
              style={{ marginBottom: 4 }}
            />
            <div style={{ fontSize: 12, color: '#999' }}>
              {status.icon} {status.text}
            </div>
          </div>
        );
      },
    },
    {
      title: 'Hành động',
      key: 'actions',
      width: 150,
      render: (_: any, record: System) => (
        <Space size="small">
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => navigate(`/systems/${record.id}`)}
            size="small"
          >
            Xem
          </Button>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => navigate(`/systems/${record.id}/edit`)}
            size="small"
          >
            Sửa
          </Button>
        </Space>
      ),
    },
  ];

  const avgCompletion = statistics?.average_completion_percentage || 0;

  return (
    <div style={{ padding: spacing.lg }}>
      {/* Header */}
      <div style={{ marginBottom: spacing.xl, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <Title level={2} style={{ margin: 0 }}>
            Dashboard Đơn vị
          </Title>
          <Text type="secondary">
            Tổng quan báo cáo thông tin hệ thống của đơn vị
          </Text>
        </div>
        <Space>
          <Text type="secondary" style={{ fontSize: 12 }}>
            Cập nhật lúc: {lastUpdated.toLocaleTimeString('vi-VN')}
          </Text>
          <Button icon={<ReloadOutlined />} onClick={handleRefresh} loading={loading}>
            Làm mới
          </Button>
        </Space>
      </div>

      {/* Statistics Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: spacing.xl }}>
        <Col xs={24} sm={12} lg={8}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card
              bordered={false}
              style={{
                boxShadow: shadows.card,
                borderRadius: borderRadius.lg,
              }}
            >
              <Skeleton loading={loading} active paragraph={{ rows: 1 }}>
                <Statistic
                  title={
                    <span style={{ fontSize: 14, fontWeight: 500 }}>
                      <AppstoreOutlined style={{ marginRight: 8, color: colors.primary.main }} />
                      Tổng số hệ thống
                    </span>
                  }
                  value={statistics?.total || 0}
                  formatter={(value) => <CountUp end={value as number} duration={1.5} />}
                  valueStyle={{ color: colors.primary.main, fontSize: 32, fontWeight: 600 }}
                />
              </Skeleton>
            </Card>
          </motion.div>
        </Col>

        <Col xs={24} sm={12} lg={8}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card
              bordered={false}
              style={{
                boxShadow: shadows.card,
                borderRadius: borderRadius.lg,
              }}
            >
              <Skeleton loading={loading} active paragraph={{ rows: 1 }}>
                <Statistic
                  title={
                    <span style={{ fontSize: 14, fontWeight: 500 }}>
                      <FileTextOutlined style={{ marginRight: 8, color: getCompletionColor(avgCompletion) }} />
                      % Hoàn thành trung bình
                    </span>
                  }
                  value={avgCompletion}
                  suffix="%"
                  formatter={(value) => <CountUp end={value as number} duration={1.5} decimals={1} />}
                  valueStyle={{ color: getCompletionColor(avgCompletion), fontSize: 32, fontWeight: 600 }}
                />
                <Progress
                  percent={avgCompletion}
                  strokeColor={getCompletionColor(avgCompletion)}
                  showInfo={false}
                  style={{ marginTop: 8 }}
                />
              </Skeleton>
            </Card>
          </motion.div>
        </Col>

        <Col xs={24} sm={12} lg={8}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card
              bordered={false}
              style={{
                boxShadow: shadows.card,
                borderRadius: borderRadius.lg,
              }}
            >
              <Skeleton loading={loading} active paragraph={{ rows: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 16 }}>
                  Tiến độ báo cáo
                </div>
                <Space direction="vertical" size="small" style={{ width: '100%' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text style={{ fontSize: 13 }}>
                      <CheckCircleOutlined style={{ color: '#52c41a', marginRight: 4 }} />
                      Hoàn thành tốt (≥80%)
                    </Text>
                    <Text strong>
                      {systems.filter(s => s.completion_percentage >= 80).length}
                    </Text>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text style={{ fontSize: 13 }}>
                      <ClockCircleOutlined style={{ color: '#faad14', marginRight: 4 }} />
                      Cần bổ sung (50-79%)
                    </Text>
                    <Text strong>
                      {systems.filter(s => s.completion_percentage >= 50 && s.completion_percentage < 80).length}
                    </Text>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text style={{ fontSize: 13 }}>
                      <WarningOutlined style={{ color: '#ff4d4f', marginRight: 4 }} />
                      Chưa đủ thông tin (&lt;50%)
                    </Text>
                    <Text strong>
                      {systems.filter(s => s.completion_percentage < 50).length}
                    </Text>
                  </div>
                </Space>
              </Skeleton>
            </Card>
          </motion.div>
        </Col>
      </Row>

      {/* Systems Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card
          title={
            <span>
              <AppstoreOutlined style={{ marginRight: 8 }} />
              Danh sách hệ thống
            </span>
          }
          bordered={false}
          style={{
            boxShadow: shadows.card,
            borderRadius: borderRadius.lg,
          }}
        >
          <Table
            columns={columns}
            dataSource={systems}
            rowKey="id"
            loading={loading}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (total) => `Tổng số ${total} hệ thống`,
            }}
            scroll={{ x: 1000 }}
          />
        </Card>
      </motion.div>
    </div>
  );
};

export default OrganizationDashboard;
