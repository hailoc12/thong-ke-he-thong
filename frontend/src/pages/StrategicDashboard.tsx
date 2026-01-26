import { useEffect, useState, useMemo } from 'react';
import {
  Card,
  Row,
  Col,
  Statistic,
  Typography,
  Tabs,
  Table,
  Progress,
  Tag,
  Alert,
  Badge,
  Space,
  Skeleton,
  Divider,
} from 'antd';
import {
  DashboardOutlined,
  DollarOutlined,
  ApiOutlined,
  ThunderboltOutlined,
  ScheduleOutlined,
  EyeOutlined,
  WarningOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  RiseOutlined,
  FallOutlined,
  AppstoreOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from 'recharts';
import { motion } from 'framer-motion';
import CountUp from 'react-countup';
import api from '../config/api';
import { shadows, borderRadius, spacing } from '../theme/tokens';

const { Title, Text } = Typography;
const { TabPane } = Tabs;

// Color schemes
const COLORS = ['#1890ff', '#52c41a', '#faad14', '#f5222d', '#722ed1', '#13c2c2', '#eb2f96'];
const STATUS_COLORS: Record<string, string> = {
  operating: '#52c41a',
  pilot: '#1890ff',
  testing: '#faad14',
  stopped: '#f5222d',
};
const CRITICALITY_COLORS: Record<string, string> = {
  high: '#f5222d',
  medium: '#faad14',
  low: '#52c41a',
};

// Vietnamese labels
const STATUS_LABELS: Record<string, string> = {
  operating: 'Đang vận hành',
  pilot: 'Thí điểm',
  testing: 'Đang test',
  stopped: 'Dừng',
};
const CRITICALITY_LABELS: Record<string, string> = {
  high: 'Cao',
  medium: 'Trung bình',
  low: 'Thấp',
};
const RECOMMENDATION_LABELS: Record<string, string> = {
  keep: 'Giữ nguyên',
  upgrade: 'Nâng cấp',
  replace: 'Thay thế',
  merge: 'Hợp nhất',
  unknown: 'Chưa đánh giá',
};

interface DashboardStats {
  total_systems: number;
  total_organizations: number;
  status_distribution: Record<string, number>;
  criticality_distribution: Record<string, number>;
  scope_distribution: Record<string, number>;
  systems_per_org: Array<{ org__name: string; count: number }>;
  recommendation_distribution: Record<string, number>;
  integration: {
    total_api_provided: number;
    total_api_consumed: number;
    with_integration: number;
    without_integration: number;
  };
}

const StrategicDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [alerts, setAlerts] = useState<Array<{ type: 'critical' | 'warning' | 'info'; message: string }>>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch statistics from API
      const response = await api.get('/systems/statistics/');

      // Transform data to match our interface
      const data: DashboardStats = {
        total_systems: response.data.total || 0,
        total_organizations: response.data.organizations_count || 0,
        status_distribution: response.data.by_status || {},
        criticality_distribution: response.data.by_criticality || {},
        scope_distribution: response.data.by_scope || {},
        systems_per_org: response.data.by_organization || [],
        recommendation_distribution: response.data.by_recommendation || {},
        integration: {
          total_api_provided: response.data.total_api_provided || 0,
          total_api_consumed: response.data.total_api_consumed || 0,
          with_integration: response.data.systems_with_integration || 0,
          without_integration: response.data.systems_without_integration || 0,
        },
      };

      setStats(data);

      // Generate alerts based on data
      generateAlerts(data);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      // Use fallback data for prototype
      setStats({
        total_systems: 110,
        total_organizations: 32,
        status_distribution: { operating: 105, pilot: 2, testing: 2, stopped: 1 },
        criticality_distribution: { high: 53, medium: 57 },
        scope_distribution: { internal_unit: 61, org_wide: 37, external: 12 },
        systems_per_org: [
          { org__name: 'Trung tâm CNTT', count: 51 },
          { org__name: 'Trung tâm CTĐTQG', count: 8 },
          { org__name: 'Ủy ban TCĐLCL QG', count: 7 },
          { org__name: 'Cục Tần số VTĐ', count: 6 },
          { org__name: 'Cục TT, TK', count: 5 },
        ],
        recommendation_distribution: { keep: 8, upgrade: 8, replace: 9, unknown: 81 },
        integration: {
          total_api_provided: 5985,
          total_api_consumed: 2623,
          with_integration: 45,
          without_integration: 65,
        },
      });
      generateAlerts(null);
    } finally {
      setLoading(false);
    }
  };

  const generateAlerts = (data: DashboardStats | null) => {
    const newAlerts: Array<{ type: 'critical' | 'warning' | 'info'; message: string }> = [];

    if (data) {
      // Check for stopped systems
      if (data.status_distribution.stopped > 0) {
        newAlerts.push({
          type: 'warning',
          message: `${data.status_distribution.stopped} hệ thống đã dừng hoạt động`,
        });
      }

      // Check for systems needing replacement
      if (data.recommendation_distribution.replace > 0) {
        newAlerts.push({
          type: 'critical',
          message: `${data.recommendation_distribution.replace} hệ thống cần thay thế`,
        });
      }

      // Check for unassessed systems
      if (data.recommendation_distribution.unknown > 50) {
        newAlerts.push({
          type: 'info',
          message: `${data.recommendation_distribution.unknown} hệ thống chưa được đánh giá`,
        });
      }
    }

    setAlerts(newAlerts);
  };

  // Calculate health score (0-100)
  const healthScore = useMemo(() => {
    if (!stats) return 0;

    let score = 100;

    // Deduct for stopped systems
    score -= (stats.status_distribution.stopped || 0) * 5;

    // Deduct for systems needing replacement
    score -= (stats.recommendation_distribution.replace || 0) * 3;

    // Deduct for unassessed systems (less penalty)
    score -= (stats.recommendation_distribution.unknown || 0) * 0.5;

    // Add points for systems with integration
    const integrationRate = stats.integration.with_integration / stats.total_systems;
    score += integrationRate * 10;

    return Math.max(0, Math.min(100, Math.round(score)));
  }, [stats]);

  // Prepare chart data
  const statusChartData = useMemo(() => {
    if (!stats) return [];
    return Object.entries(stats.status_distribution).map(([key, value]) => ({
      name: STATUS_LABELS[key] || key,
      value,
      color: STATUS_COLORS[key] || '#999',
    }));
  }, [stats]);

  const criticalityChartData = useMemo(() => {
    if (!stats) return [];
    return Object.entries(stats.criticality_distribution).map(([key, value]) => ({
      name: CRITICALITY_LABELS[key] || key,
      value,
      color: CRITICALITY_COLORS[key] || '#999',
    }));
  }, [stats]);

  const orgChartData = useMemo(() => {
    if (!stats) return [];
    return stats.systems_per_org.slice(0, 10).map((org, index) => ({
      name: org.org__name.length > 20 ? org.org__name.substring(0, 20) + '...' : org.org__name,
      fullName: org.org__name,
      value: org.count,
      color: COLORS[index % COLORS.length],
    }));
  }, [stats]);

  const recommendationChartData = useMemo(() => {
    if (!stats) return [];
    return Object.entries(stats.recommendation_distribution)
      .filter(([key]) => key !== 'unknown')
      .map(([key, value], index) => ({
        name: RECOMMENDATION_LABELS[key] || key,
        value,
        color: COLORS[index % COLORS.length],
      }));
  }, [stats]);

  const radarData = useMemo(() => {
    if (!stats) return [];
    return [
      {
        subject: 'Vận hành',
        value: Math.round(((stats.status_distribution.operating || 0) / stats.total_systems) * 100),
        fullMark: 100,
      },
      {
        subject: 'Tích hợp',
        value: Math.round((stats.integration.with_integration / stats.total_systems) * 100),
        fullMark: 100,
      },
      {
        subject: 'Đánh giá',
        value: Math.round(((stats.total_systems - (stats.recommendation_distribution.unknown || 0)) / stats.total_systems) * 100),
        fullMark: 100,
      },
      {
        subject: 'Quan trọng cao',
        value: Math.round(((stats.criticality_distribution.high || 0) / stats.total_systems) * 100),
        fullMark: 100,
      },
      {
        subject: 'Toàn Bộ',
        value: Math.round(((stats.scope_distribution.org_wide || 0) / stats.total_systems) * 100),
        fullMark: 100,
      },
    ];
  }, [stats]);

  // Health score color
  const getHealthScoreColor = (score: number) => {
    if (score >= 80) return '#52c41a';
    if (score >= 60) return '#faad14';
    if (score >= 40) return '#fa8c16';
    return '#f5222d';
  };

  const getHealthScoreStatus = (score: number) => {
    if (score >= 80) return { text: 'Tốt', icon: <CheckCircleOutlined /> };
    if (score >= 60) return { text: 'Khá', icon: <ExclamationCircleOutlined /> };
    if (score >= 40) return { text: 'Cần cải thiện', icon: <WarningOutlined /> };
    return { text: 'Cần xử lý ngay', icon: <WarningOutlined /> };
  };

  if (loading) {
    return (
      <div style={{ padding: spacing.lg }}>
        <Skeleton active paragraph={{ rows: 10 }} />
      </div>
    );
  }

  return (
    <div style={{ padding: spacing.lg, background: '#f5f5f5', minHeight: '100vh' }}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card
          style={{
            marginBottom: spacing.lg,
            borderRadius: borderRadius.lg,
            boxShadow: shadows.sm,
          }}
        >
          <Row justify="space-between" align="middle">
            <Col>
              <Title level={2} style={{ margin: 0 }}>
                <DashboardOutlined style={{ marginRight: 12, color: '#1890ff' }} />
                Dashboard Chiến lược CDS
              </Title>
              <Text type="secondary">Tổng quan hệ sinh thái CNTT - Bộ Khoa học và Công nghệ</Text>
            </Col>
            <Col>
              <Space>
                <Badge count={alerts.filter(a => a.type === 'critical').length} color="red">
                  <Tag color="red" icon={<WarningOutlined />}>Nghiêm trọng</Tag>
                </Badge>
                <Badge count={alerts.filter(a => a.type === 'warning').length} color="orange">
                  <Tag color="orange" icon={<ExclamationCircleOutlined />}>Cảnh báo</Tag>
                </Badge>
              </Space>
            </Col>
          </Row>
        </Card>
      </motion.div>

      {/* Alert Banner */}
      {alerts.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          style={{ marginBottom: spacing.lg }}
        >
          <Alert
            type={alerts[0].type === 'critical' ? 'error' : alerts[0].type === 'warning' ? 'warning' : 'info'}
            message={
              <Space>
                {alerts.map((alert, index) => (
                  <Tag
                    key={index}
                    color={alert.type === 'critical' ? 'red' : alert.type === 'warning' ? 'orange' : 'blue'}
                  >
                    {alert.message}
                  </Tag>
                ))}
              </Space>
            }
            banner
            closable
          />
        </motion.div>
      )}

      {/* Main Tabs */}
      <Card
        style={{
          borderRadius: borderRadius.lg,
          boxShadow: shadows.sm,
        }}
      >
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          size="large"
          tabBarStyle={{ marginBottom: spacing.lg }}
        >
          {/* Tab 1: Overview */}
          <TabPane
            tab={
              <span>
                <DashboardOutlined />
                Tổng quan
              </span>
            }
            key="overview"
          >
            <Row gutter={[24, 24]}>
              {/* Health Score */}
              <Col xs={24} lg={8}>
                <Card
                  style={{
                    textAlign: 'center',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    borderRadius: borderRadius.lg,
                  }}
                >
                  <Title level={4} style={{ color: 'white', marginBottom: 8 }}>
                    Điểm sức khỏe tổng thể
                  </Title>
                  <Progress
                    type="dashboard"
                    percent={healthScore}
                    strokeColor={getHealthScoreColor(healthScore)}
                    strokeWidth={12}
                    size={180}
                    format={(percent) => (
                      <div style={{ color: 'white' }}>
                        <div style={{ fontSize: 48, fontWeight: 'bold' }}>
                          <CountUp end={percent || 0} duration={2} />
                        </div>
                        <div style={{ fontSize: 16 }}>
                          {getHealthScoreStatus(percent || 0).icon}{' '}
                          {getHealthScoreStatus(percent || 0).text}
                        </div>
                      </div>
                    )}
                  />
                </Card>
              </Col>

              {/* Key Metrics */}
              <Col xs={24} lg={16}>
                <Row gutter={[16, 16]}>
                  <Col xs={12} sm={6}>
                    <Card style={{ borderRadius: borderRadius.md }}>
                      <Statistic
                        title="Tổng hệ thống"
                        value={stats?.total_systems || 0}
                        prefix={<AppstoreOutlined style={{ color: '#1890ff' }} />}
                        valueStyle={{ color: '#1890ff' }}
                      />
                    </Card>
                  </Col>
                  <Col xs={12} sm={6}>
                    <Card style={{ borderRadius: borderRadius.md }}>
                      <Statistic
                        title="Đơn vị"
                        value={stats?.total_organizations || 0}
                        prefix={<TeamOutlined style={{ color: '#52c41a' }} />}
                        valueStyle={{ color: '#52c41a' }}
                      />
                    </Card>
                  </Col>
                  <Col xs={12} sm={6}>
                    <Card style={{ borderRadius: borderRadius.md }}>
                      <Statistic
                        title="API cung cấp"
                        value={stats?.integration.total_api_provided || 0}
                        prefix={<ApiOutlined style={{ color: '#722ed1' }} />}
                        valueStyle={{ color: '#722ed1' }}
                      />
                    </Card>
                  </Col>
                  <Col xs={12} sm={6}>
                    <Card style={{ borderRadius: borderRadius.md }}>
                      <Statistic
                        title="Cần thay thế"
                        value={stats?.recommendation_distribution.replace || 0}
                        prefix={<WarningOutlined style={{ color: '#f5222d' }} />}
                        valueStyle={{ color: '#f5222d' }}
                      />
                    </Card>
                  </Col>
                </Row>

                <Divider />

                {/* Top 3 Actions */}
                <Card
                  title="🎯 Top 3 việc cần làm"
                  size="small"
                  style={{ borderRadius: borderRadius.md }}
                >
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <Alert
                      type="error"
                      message={`Đánh giá ${stats?.recommendation_distribution.unknown || 0} hệ thống chưa có khuyến nghị`}
                      showIcon
                    />
                    <Alert
                      type="warning"
                      message={`Xem xét thay thế ${stats?.recommendation_distribution.replace || 0} hệ thống cũ`}
                      showIcon
                    />
                    <Alert
                      type="info"
                      message={`Tăng cường tích hợp cho ${stats?.integration.without_integration || 0} hệ thống độc lập`}
                      showIcon
                    />
                  </Space>
                </Card>
              </Col>

              {/* Charts Row */}
              <Col xs={24} md={12}>
                <Card
                  title="Phân bổ theo trạng thái"
                  style={{ borderRadius: borderRadius.md }}
                >
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={statusChartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                      >
                        {statusChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <RechartsTooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </Card>
              </Col>

              <Col xs={24} md={12}>
                <Card
                  title="Phân bổ theo mức độ quan trọng"
                  style={{ borderRadius: borderRadius.md }}
                >
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={criticalityChartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                      >
                        {criticalityChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <RechartsTooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </Card>
              </Col>
            </Row>
          </TabPane>

          {/* Tab 2: Investment */}
          <TabPane
            tab={
              <span>
                <DollarOutlined />
                Đầu tư
              </span>
            }
            key="investment"
          >
            <Row gutter={[24, 24]}>
              <Col xs={24}>
                <Alert
                  type="info"
                  message="Dữ liệu chi phí đang được thu thập"
                  description="Hiện tại chưa có dữ liệu chi phí chi tiết. Biểu đồ dưới đây hiển thị phân bổ số lượng hệ thống theo đơn vị."
                  showIcon
                />
              </Col>

              <Col xs={24}>
                <Card
                  title="Phân bổ hệ thống theo đơn vị (Top 10)"
                  style={{ borderRadius: borderRadius.md }}
                >
                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={orgChartData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis dataKey="name" type="category" width={150} />
                      <RechartsTooltip
                        formatter={(value, _name, props) => [
                          `${value} hệ thống`,
                          (props as { payload?: { fullName?: string } })?.payload?.fullName ?? '',
                        ]}
                      />
                      <Bar dataKey="value" fill="#1890ff" radius={[0, 4, 4, 0]}>
                        {orgChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </Card>
              </Col>
            </Row>
          </TabPane>

          {/* Tab 3: Integration */}
          <TabPane
            tab={
              <span>
                <ApiOutlined />
                Tích hợp
              </span>
            }
            key="integration"
          >
            <Row gutter={[24, 24]}>
              <Col xs={24} md={8}>
                <Card style={{ borderRadius: borderRadius.md }}>
                  <Statistic
                    title="Tổng API cung cấp"
                    value={stats?.integration.total_api_provided || 0}
                    prefix={<RiseOutlined style={{ color: '#52c41a' }} />}
                    valueStyle={{ color: '#52c41a' }}
                  />
                </Card>
              </Col>
              <Col xs={24} md={8}>
                <Card style={{ borderRadius: borderRadius.md }}>
                  <Statistic
                    title="Tổng API sử dụng"
                    value={stats?.integration.total_api_consumed || 0}
                    prefix={<FallOutlined style={{ color: '#1890ff' }} />}
                    valueStyle={{ color: '#1890ff' }}
                  />
                </Card>
              </Col>
              <Col xs={24} md={8}>
                <Card style={{ borderRadius: borderRadius.md }}>
                  <Statistic
                    title="Hệ thống chưa tích hợp"
                    value={stats?.integration.without_integration || 0}
                    prefix={<WarningOutlined style={{ color: '#faad14' }} />}
                    valueStyle={{ color: '#faad14' }}
                    suffix={
                      <Text type="secondary" style={{ fontSize: 14 }}>
                        / {stats?.total_systems}
                      </Text>
                    }
                  />
                </Card>
              </Col>

              <Col xs={24}>
                <Card
                  title="🏝️ Ốc đảo dữ liệu - Hệ thống chưa tích hợp"
                  style={{ borderRadius: borderRadius.md }}
                >
                  <Alert
                    type="warning"
                    message={`${stats?.integration.without_integration || 0} hệ thống đang hoạt động độc lập, không chia sẻ dữ liệu với hệ thống khác`}
                    description="Đề xuất: Xem xét tích hợp các hệ thống này để tăng hiệu quả chia sẻ thông tin và giảm nhập liệu trùng lặp."
                    showIcon
                    style={{ marginBottom: 16 }}
                  />

                  <Row gutter={[16, 16]}>
                    <Col xs={24} md={12}>
                      <Card size="small" title="Tỷ lệ tích hợp">
                        <Progress
                          percent={Math.round(
                            ((stats?.integration.with_integration || 0) / (stats?.total_systems || 1)) * 100
                          )}
                          status="active"
                          strokeColor="#52c41a"
                          format={(percent) => `${percent}% đã tích hợp`}
                        />
                      </Card>
                    </Col>
                    <Col xs={24} md={12}>
                      <Card size="small" title="Tỷ lệ API">
                        <Space direction="vertical" style={{ width: '100%' }}>
                          <div>
                            <Text>API cung cấp: </Text>
                            <Tag color="green">{stats?.integration.total_api_provided || 0}</Tag>
                          </div>
                          <div>
                            <Text>API sử dụng: </Text>
                            <Tag color="blue">{stats?.integration.total_api_consumed || 0}</Tag>
                          </div>
                        </Space>
                      </Card>
                    </Col>
                  </Row>
                </Card>
              </Col>
            </Row>
          </TabPane>

          {/* Tab 4: Optimization */}
          <TabPane
            tab={
              <span>
                <ThunderboltOutlined />
                Tối ưu
              </span>
            }
            key="optimization"
          >
            <Row gutter={[24, 24]}>
              <Col xs={24} md={12}>
                <Card
                  title="Khuyến nghị xử lý"
                  style={{ borderRadius: borderRadius.md }}
                >
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={recommendationChartData}
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        dataKey="value"
                        label={({ name, value }) => `${name}: ${value}`}
                      >
                        {recommendationChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <RechartsTooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </Card>
              </Col>

              <Col xs={24} md={12}>
                <Card
                  title="Radar đánh giá hệ thống"
                  style={{ borderRadius: borderRadius.md }}
                >
                  <ResponsiveContainer width="100%" height={300}>
                    <RadarChart data={radarData}>
                      <PolarGrid />
                      <PolarAngleAxis dataKey="subject" />
                      <PolarRadiusAxis angle={30} domain={[0, 100]} />
                      <Radar
                        name="Điểm"
                        dataKey="value"
                        stroke="#1890ff"
                        fill="#1890ff"
                        fillOpacity={0.6}
                      />
                      <RechartsTooltip formatter={(value) => [`${value}%`, 'Tỷ lệ']} />
                    </RadarChart>
                  </ResponsiveContainer>
                </Card>
              </Col>

              <Col xs={24}>
                <Card
                  title="📊 Tóm tắt đề xuất tối ưu"
                  style={{ borderRadius: borderRadius.md }}
                >
                  <Table
                    dataSource={[
                      {
                        key: '1',
                        action: 'Giữ nguyên',
                        count: stats?.recommendation_distribution.keep || 0,
                        description: 'Hệ thống hoạt động tốt, không cần thay đổi',
                        priority: 'low',
                      },
                      {
                        key: '2',
                        action: 'Nâng cấp',
                        count: stats?.recommendation_distribution.upgrade || 0,
                        description: 'Cần cập nhật công nghệ hoặc tính năng',
                        priority: 'medium',
                      },
                      {
                        key: '3',
                        action: 'Thay thế',
                        count: stats?.recommendation_distribution.replace || 0,
                        description: 'Hệ thống lỗi thời, cần thay thế hoàn toàn',
                        priority: 'high',
                      },
                      {
                        key: '4',
                        action: 'Chưa đánh giá',
                        count: stats?.recommendation_distribution.unknown || 0,
                        description: 'Cần đơn vị bổ sung đánh giá',
                        priority: 'info',
                      },
                    ]}
                    columns={[
                      {
                        title: 'Hành động',
                        dataIndex: 'action',
                        key: 'action',
                        render: (text: string, record: any) => (
                          <Tag
                            color={
                              record.priority === 'high'
                                ? 'red'
                                : record.priority === 'medium'
                                ? 'orange'
                                : record.priority === 'low'
                                ? 'green'
                                : 'blue'
                            }
                          >
                            {text}
                          </Tag>
                        ),
                      },
                      {
                        title: 'Số lượng',
                        dataIndex: 'count',
                        key: 'count',
                        render: (count: number) => <strong>{count}</strong>,
                      },
                      {
                        title: 'Mô tả',
                        dataIndex: 'description',
                        key: 'description',
                      },
                    ]}
                    pagination={false}
                    size="small"
                  />
                </Card>
              </Col>
            </Row>
          </TabPane>

          {/* Tab 5: Roadmap */}
          <TabPane
            tab={
              <span>
                <ScheduleOutlined />
                Lộ trình
              </span>
            }
            key="roadmap"
          >
            <Row gutter={[24, 24]}>
              <Col xs={24}>
                <Alert
                  type="info"
                  message="Tính năng đang phát triển"
                  description="Module theo dõi lộ trình dự án sẽ được triển khai ở giai đoạn 3. Hiện tại đang thu thập dữ liệu về các dự án CNTT đang triển khai."
                  showIcon
                />
              </Col>

              <Col xs={24}>
                <Card
                  title="🚀 Lộ trình triển khai Dashboard chiến lược"
                  style={{ borderRadius: borderRadius.md }}
                >
                  <Table
                    dataSource={[
                      {
                        key: '1',
                        phase: 'Giai đoạn 1',
                        name: 'Nền tảng',
                        status: 'Đang triển khai',
                        description: 'Dashboard cơ bản với dữ liệu hiện có',
                        progress: 80,
                      },
                      {
                        key: '2',
                        phase: 'Giai đoạn 2',
                        name: 'Đầu tư & Tối ưu',
                        status: 'Lên kế hoạch',
                        description: 'Phân tích chi phí và phát hiện cơ hội',
                        progress: 20,
                      },
                      {
                        key: '3',
                        phase: 'Giai đoạn 3',
                        name: 'Tích hợp & Lộ trình',
                        status: 'Chưa bắt đầu',
                        description: 'Bản đồ kết nối và theo dõi dự án',
                        progress: 0,
                      },
                      {
                        key: '4',
                        phase: 'Giai đoạn 4',
                        name: 'Nâng cao',
                        status: 'Chưa bắt đầu',
                        description: 'AI đề xuất và mô phỏng kịch bản',
                        progress: 0,
                      },
                    ]}
                    columns={[
                      {
                        title: 'Giai đoạn',
                        dataIndex: 'phase',
                        key: 'phase',
                        width: 120,
                        render: (text: string) => <strong>{text}</strong>,
                      },
                      {
                        title: 'Tên',
                        dataIndex: 'name',
                        key: 'name',
                        width: 150,
                      },
                      {
                        title: 'Trạng thái',
                        dataIndex: 'status',
                        key: 'status',
                        width: 150,
                        render: (status: string) => (
                          <Tag
                            color={
                              status === 'Đang triển khai'
                                ? 'processing'
                                : status === 'Lên kế hoạch'
                                ? 'warning'
                                : 'default'
                            }
                          >
                            {status}
                          </Tag>
                        ),
                      },
                      {
                        title: 'Mô tả',
                        dataIndex: 'description',
                        key: 'description',
                      },
                      {
                        title: 'Tiến độ',
                        dataIndex: 'progress',
                        key: 'progress',
                        width: 150,
                        render: (progress: number) => (
                          <Progress percent={progress} size="small" />
                        ),
                      },
                    ]}
                    pagination={false}
                  />
                </Card>
              </Col>
            </Row>
          </TabPane>

          {/* Tab 6: Monitoring */}
          <TabPane
            tab={
              <span>
                <EyeOutlined />
                Giám sát
              </span>
            }
            key="monitoring"
          >
            <Row gutter={[24, 24]}>
              <Col xs={24}>
                <Card
                  title="🏆 Xếp hạng đơn vị theo số lượng hệ thống"
                  style={{ borderRadius: borderRadius.md }}
                >
                  <Table
                    dataSource={stats?.systems_per_org.map((org, index) => ({
                      key: index,
                      rank: index + 1,
                      name: org.org__name,
                      count: org.count,
                      percentage: ((org.count / (stats?.total_systems || 1)) * 100).toFixed(1),
                    }))}
                    columns={[
                      {
                        title: 'Hạng',
                        dataIndex: 'rank',
                        key: 'rank',
                        width: 80,
                        render: (rank: number) => (
                          <Badge
                            count={rank}
                            style={{
                              backgroundColor:
                                rank === 1 ? '#ffd700' : rank === 2 ? '#c0c0c0' : rank === 3 ? '#cd7f32' : '#d9d9d9',
                            }}
                          />
                        ),
                      },
                      {
                        title: 'Đơn vị',
                        dataIndex: 'name',
                        key: 'name',
                      },
                      {
                        title: 'Số hệ thống',
                        dataIndex: 'count',
                        key: 'count',
                        width: 120,
                        render: (count: number) => <strong>{count}</strong>,
                      },
                      {
                        title: 'Tỷ lệ',
                        dataIndex: 'percentage',
                        key: 'percentage',
                        width: 150,
                        render: (percentage: string) => (
                          <Progress
                            percent={parseFloat(percentage)}
                            size="small"
                            format={(p) => `${p?.toFixed(1)}%`}
                          />
                        ),
                      },
                    ]}
                    pagination={{ pageSize: 10 }}
                    size="small"
                  />
                </Card>
              </Col>
            </Row>
          </TabPane>
        </Tabs>
      </Card>
    </div>
  );
};

export default StrategicDashboard;
