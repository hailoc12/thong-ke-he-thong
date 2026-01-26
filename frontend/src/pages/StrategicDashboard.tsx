import { useEffect, useState, useMemo, useCallback } from 'react';
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
  Modal,
  Button,
  message,
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
  DownloadOutlined,
  RobotOutlined,
  BulbOutlined,
  SafetyOutlined,
  SyncOutlined,
  AlertOutlined,
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
import * as XLSX from 'xlsx';
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
  replacing: '#fa8c16',
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
  replacing: 'Sắp thay thế',
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

interface StrategicStats {
  overview: {
    total_systems: number;
    total_organizations: number;
    health_score: number;
    alerts: {
      critical: number;
      warning: number;
      info: number;
    };
  };
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

interface InvestmentStats {
  total_investment: number;
  by_organization: Array<{
    org_id: number;
    org_name: string;
    system_count: number;
    total_cost: number;
  }>;
  cost_breakdown: Record<string, number>;
  cost_efficiency: {
    avg_cost_per_user: number;
    total_users: number;
  };
}

interface IntegrationStats {
  total_api_provided: number;
  total_api_consumed: number;
  systems_with_integration: number;
  systems_without_integration: number;
  integration_rate: number;
  data_islands: string[];
  top_api_providers: Array<{ id: number; system_name: string; api_provided_count: number }>;
  top_api_consumers: Array<{ id: number; system_name: string; api_consumed_count: number }>;
}

interface OptimizationStats {
  recommendations: Record<string, number>;
  legacy_systems: Array<{
    id: number;
    name: string;
    org_name: string | null;
    go_live_date: string | null;
    users: number;
  }>;
  attention_needed: Array<{
    id: number;
    system_name: string;
    status: string;
    org__name: string;
  }>;
  total_needing_action: number;
  assessment_coverage: number;
}

interface MonitoringStats {
  organization_rankings: Array<{
    org_id: number;
    org_name: string;
    system_count: number;
    avg_completion: number;
    avg_performance: number | null;
  }>;
  summary: {
    total_organizations: number;
    avg_completion_all: number;
    orgs_with_100_percent: number;
    orgs_below_50_percent: number;
  };
}

interface DrilldownSystem {
  id: number;
  system_name: string;
  system_code: string;
  status: string;
  criticality_level: string;
  scope: string;
  org__name: string;
  users_total: number | null;
  go_live_date: string | null;
}

const StrategicDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<StrategicStats | null>(null);
  const [investmentStats, setInvestmentStats] = useState<InvestmentStats | null>(null);
  const [integrationStats, setIntegrationStats] = useState<IntegrationStats | null>(null);
  const [optimizationStats, setOptimizationStats] = useState<OptimizationStats | null>(null);
  const [monitoringStats, setMonitoringStats] = useState<MonitoringStats | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [alerts, setAlerts] = useState<Array<{ type: 'critical' | 'warning' | 'info'; message: string }>>([]);

  // Drill-down modal state
  const [drilldownVisible, setDrilldownVisible] = useState(false);
  const [drilldownTitle, setDrilldownTitle] = useState('');
  const [drilldownSystems, setDrilldownSystems] = useState<DrilldownSystem[]>([]);
  const [drilldownLoading, setDrilldownLoading] = useState(false);

  // AI Assistant state
  const [aiAssistantExpanded, setAiAssistantExpanded] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch strategic stats
      const response = await api.get('/systems/strategic_stats/');
      setStats(response.data);
      generateAlerts(response.data);
    } catch (error: any) {
      console.error('Failed to fetch strategic stats:', error);
      if (error.response?.status === 403) {
        message.error('Bạn không có quyền xem Dashboard chiến lược');
      }
    } finally {
      setLoading(false);
    }
  };

  // Fetch tab-specific data when tab changes
  useEffect(() => {
    const fetchTabData = async () => {
      try {
        if (activeTab === 'investment' && !investmentStats) {
          const response = await api.get('/systems/investment_stats/');
          setInvestmentStats(response.data);
        } else if (activeTab === 'integration' && !integrationStats) {
          const response = await api.get('/systems/integration_stats/');
          setIntegrationStats(response.data);
        } else if (activeTab === 'optimization' && !optimizationStats) {
          const response = await api.get('/systems/optimization_stats/');
          setOptimizationStats(response.data);
        } else if (activeTab === 'monitoring' && !monitoringStats) {
          const response = await api.get('/systems/monitoring_stats/');
          setMonitoringStats(response.data);
        }
      } catch (error) {
        console.error(`Failed to fetch ${activeTab} data:`, error);
      }
    };
    fetchTabData();
  }, [activeTab, investmentStats, integrationStats, optimizationStats, monitoringStats]);

  const generateAlerts = (data: StrategicStats | null) => {
    const newAlerts: Array<{ type: 'critical' | 'warning' | 'info'; message: string }> = [];

    if (data) {
      if (data.status_distribution.stopped > 0) {
        newAlerts.push({
          type: 'warning',
          message: `${data.status_distribution.stopped} hệ thống đã dừng hoạt động`,
        });
      }

      if (data.recommendation_distribution.replace > 0) {
        newAlerts.push({
          type: 'critical',
          message: `${data.recommendation_distribution.replace} hệ thống cần thay thế`,
        });
      }

      if (data.recommendation_distribution.unknown > 50) {
        newAlerts.push({
          type: 'info',
          message: `${data.recommendation_distribution.unknown} hệ thống chưa được đánh giá`,
        });
      }
    }

    setAlerts(newAlerts);
  };

  // AI Assistant - Generate intelligent recommendations
  const aiRecommendations = useMemo(() => {
    if (!stats) return [];

    const recommendations: Array<{
      id: string;
      type: 'critical' | 'warning' | 'optimization' | 'insight';
      icon: React.ReactNode;
      title: string;
      description: string;
      action: string;
      priority: number;
    }> = [];

    // Critical: Systems needing replacement
    if (stats.recommendation_distribution.replace > 0) {
      recommendations.push({
        id: 'replace-systems',
        type: 'critical',
        icon: <AlertOutlined style={{ color: '#f5222d' }} />,
        title: `${stats.recommendation_distribution.replace} hệ thống cần thay thế gấp`,
        description: 'Các hệ thống này đã lỗi thời, tiềm ẩn rủi ro bảo mật và hiệu suất. Việc trì hoãn thay thế có thể dẫn đến gián đoạn dịch vụ và tăng chi phí khắc phục.',
        action: 'Lập kế hoạch thay thế trong Q1-Q2/2026',
        priority: 1,
      });
    }

    // Warning: Low integration rate
    if (stats.integration.without_integration > stats.integration.with_integration) {
      const isolatedPercent = Math.round((stats.integration.without_integration / stats.overview.total_systems) * 100);
      recommendations.push({
        id: 'integration-gap',
        type: 'warning',
        icon: <ApiOutlined style={{ color: '#fa8c16' }} />,
        title: `${isolatedPercent}% hệ thống chưa được tích hợp`,
        description: `Có ${stats.integration.without_integration} hệ thống hoạt động độc lập, tạo ra "đảo dữ liệu" làm giảm hiệu quả vận hành và khả năng ra quyết định dựa trên dữ liệu.`,
        action: 'Xây dựng lộ trình tích hợp dữ liệu liên thông',
        priority: 2,
      });
    }

    // Warning: Many systems not assessed
    if (stats.recommendation_distribution.unknown > 30) {
      const unknownPercent = Math.round((stats.recommendation_distribution.unknown / stats.overview.total_systems) * 100);
      recommendations.push({
        id: 'assessment-gap',
        type: 'warning',
        icon: <ExclamationCircleOutlined style={{ color: '#faad14' }} />,
        title: `${unknownPercent}% hệ thống chưa được đánh giá`,
        description: `${stats.recommendation_distribution.unknown} hệ thống chưa có đánh giá chất lượng. Thiếu đánh giá làm khó khăn trong việc xác định ưu tiên đầu tư và rủi ro tiềm ẩn.`,
        action: 'Triển khai đánh giá hệ thống toàn diện',
        priority: 3,
      });
    }

    // Optimization: Systems to upgrade
    if (stats.recommendation_distribution.upgrade > 5) {
      recommendations.push({
        id: 'upgrade-opportunity',
        type: 'optimization',
        icon: <RiseOutlined style={{ color: '#1890ff' }} />,
        title: `${stats.recommendation_distribution.upgrade} hệ thống có thể nâng cấp`,
        description: 'Nâng cấp các hệ thống này sẽ cải thiện hiệu suất, bảo mật và trải nghiệm người dùng mà không cần thay thế hoàn toàn.',
        action: 'Ưu tiên nâng cấp hệ thống quan trọng cao',
        priority: 4,
      });
    }

    // Insight: High criticality systems
    const highCriticalPercent = Math.round((stats.criticality_distribution.high / stats.overview.total_systems) * 100);
    if (highCriticalPercent > 50) {
      recommendations.push({
        id: 'high-criticality',
        type: 'insight',
        icon: <SafetyOutlined style={{ color: '#722ed1' }} />,
        title: `${highCriticalPercent}% hệ thống có mức độ quan trọng CAO`,
        description: 'Tỷ lệ hệ thống quan trọng cao đòi hỏi đầu tư nhiều hơn cho bảo mật, backup và disaster recovery.',
        action: 'Rà soát kế hoạch DR/BCP cho các hệ thống này',
        priority: 5,
      });
    }

    // Insight: Integration potential
    if (stats.integration.total_api_provided > 500) {
      recommendations.push({
        id: 'integration-potential',
        type: 'insight',
        icon: <BulbOutlined style={{ color: '#52c41a' }} />,
        title: `${stats.integration.total_api_provided.toLocaleString()} API đang được cung cấp`,
        description: 'Đây là nền tảng tốt để xây dựng hệ sinh thái dữ liệu liên thông. Cân nhắc tập trung hóa API Gateway để quản lý và bảo mật tốt hơn.',
        action: 'Đánh giá triển khai API Gateway tập trung',
        priority: 6,
      });
    }

    // Sort by priority
    return recommendations.sort((a, b) => a.priority - b.priority);
  }, [stats]);

  // Drill-down function
  const handleDrilldown = useCallback(async (filterType: string, filterValue: string, title: string) => {
    setDrilldownLoading(true);
    setDrilldownTitle(title);
    setDrilldownVisible(true);

    try {
      const response = await api.get('/systems/drilldown/', {
        params: { filter_type: filterType, filter_value: filterValue },
      });
      setDrilldownSystems(response.data.systems);
    } catch (error) {
      console.error('Drill-down failed:', error);
      message.error('Không thể tải danh sách hệ thống');
      setDrilldownSystems([]);
    } finally {
      setDrilldownLoading(false);
    }
  }, []);

  // Excel Export
  const handleExportExcel = useCallback(() => {
    if (!stats) {
      message.warning('Chưa có dữ liệu để xuất');
      return;
    }

    const wb = XLSX.utils.book_new();

    // Sheet 1: Overview
    const overviewData = [
      ['Tổng quan Dashboard Chiến lược CDS'],
      [''],
      ['Chỉ số', 'Giá trị'],
      ['Tổng hệ thống', stats.overview.total_systems],
      ['Tổng đơn vị', stats.overview.total_organizations],
      ['Điểm sức khỏe', stats.overview.health_score],
      ['Cảnh báo nghiêm trọng', stats.overview.alerts.critical],
      ['Cảnh báo', stats.overview.alerts.warning],
      [''],
      ['Phân bổ theo trạng thái'],
      ...Object.entries(stats.status_distribution).map(([k, v]) => [STATUS_LABELS[k] || k, v]),
      [''],
      ['Phân bổ theo mức độ quan trọng'],
      ...Object.entries(stats.criticality_distribution).map(([k, v]) => [CRITICALITY_LABELS[k] || k, v]),
    ];
    const wsOverview = XLSX.utils.aoa_to_sheet(overviewData);
    XLSX.utils.book_append_sheet(wb, wsOverview, 'Tổng quan');

    // Sheet 2: Organizations
    const orgData = [
      ['Phân bổ theo đơn vị'],
      [''],
      ['Đơn vị', 'Số hệ thống'],
      ...stats.systems_per_org.map(org => [org.org__name, org.count]),
    ];
    const wsOrg = XLSX.utils.aoa_to_sheet(orgData);
    XLSX.utils.book_append_sheet(wb, wsOrg, 'Đơn vị');

    // Sheet 3: Integration
    const integrationData = [
      ['Thống kê tích hợp'],
      [''],
      ['Chỉ số', 'Giá trị'],
      ['Tổng API cung cấp', stats.integration.total_api_provided],
      ['Tổng API sử dụng', stats.integration.total_api_consumed],
      ['HT có tích hợp', stats.integration.with_integration],
      ['HT chưa tích hợp', stats.integration.without_integration],
    ];
    const wsIntegration = XLSX.utils.aoa_to_sheet(integrationData);
    XLSX.utils.book_append_sheet(wb, wsIntegration, 'Tích hợp');

    // Sheet 4: Recommendations
    const recData = [
      ['Khuyến nghị xử lý'],
      [''],
      ['Khuyến nghị', 'Số lượng'],
      ...Object.entries(stats.recommendation_distribution).map(([k, v]) => [RECOMMENDATION_LABELS[k] || k, v]),
    ];
    const wsRec = XLSX.utils.aoa_to_sheet(recData);
    XLSX.utils.book_append_sheet(wb, wsRec, 'Khuyến nghị');

    // Download
    const now = new Date();
    const filename = `Dashboard-CDS-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}.xlsx`;
    XLSX.writeFile(wb, filename);
    message.success(`Đã xuất file ${filename}`);
  }, [stats]);

  // Calculate health score
  const healthScore = useMemo(() => {
    return stats?.overview.health_score || 0;
  }, [stats]);

  // Prepare chart data
  const statusChartData = useMemo(() => {
    if (!stats) return [];
    return Object.entries(stats.status_distribution)
      .filter(([, value]) => value > 0)
      .map(([key, value]) => ({
        name: STATUS_LABELS[key] || key,
        value,
        color: STATUS_COLORS[key] || '#999',
        filterKey: key,
      }));
  }, [stats]);

  const criticalityChartData = useMemo(() => {
    if (!stats) return [];
    return Object.entries(stats.criticality_distribution)
      .filter(([, value]) => value > 0)
      .map(([key, value]) => ({
        name: CRITICALITY_LABELS[key] || key,
        value,
        color: CRITICALITY_COLORS[key] || '#999',
        filterKey: key,
      }));
  }, [stats]);

  const recommendationChartData = useMemo(() => {
    if (!stats) return [];
    return Object.entries(stats.recommendation_distribution)
      .filter(([key]) => key !== 'unknown')
      .filter(([, value]) => value > 0)
      .map(([key, value], index) => ({
        name: RECOMMENDATION_LABELS[key] || key,
        value,
        color: COLORS[index % COLORS.length],
        filterKey: key,
      }));
  }, [stats]);

  const radarData = useMemo(() => {
    if (!stats) return [];
    const total = stats.overview.total_systems || 1;
    return [
      {
        subject: 'Vận hành',
        value: Math.round(((stats.status_distribution.operating || 0) / total) * 100),
        fullMark: 100,
      },
      {
        subject: 'Tích hợp',
        value: Math.round((stats.integration.with_integration / total) * 100),
        fullMark: 100,
      },
      {
        subject: 'Đánh giá',
        value: Math.round(((total - (stats.recommendation_distribution.unknown || 0)) / total) * 100),
        fullMark: 100,
      },
      {
        subject: 'Quan trọng cao',
        value: Math.round(((stats.criticality_distribution.high || 0) / total) * 100),
        fullMark: 100,
      },
      {
        subject: 'Toàn Bộ',
        value: Math.round(((stats.scope_distribution.org_wide || 0) / total) * 100),
        fullMark: 100,
      },
    ];
  }, [stats]);

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

  // Drill-down columns
  const drilldownColumns = [
    {
      title: 'Mã HT',
      dataIndex: 'system_code',
      key: 'system_code',
      width: 150,
    },
    {
      title: 'Tên hệ thống',
      dataIndex: 'system_name',
      key: 'system_name',
      ellipsis: true,
    },
    {
      title: 'Đơn vị',
      dataIndex: 'org__name',
      key: 'org__name',
      width: 200,
      ellipsis: true,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status: string) => (
        <Tag color={STATUS_COLORS[status] || 'default'}>
          {STATUS_LABELS[status] || status}
        </Tag>
      ),
    },
    {
      title: 'Mức độ QT',
      dataIndex: 'criticality_level',
      key: 'criticality_level',
      width: 100,
      render: (level: string) => (
        <Tag color={CRITICALITY_COLORS[level] || 'default'}>
          {CRITICALITY_LABELS[level] || level}
        </Tag>
      ),
    },
    {
      title: 'Người dùng',
      dataIndex: 'users_total',
      key: 'users_total',
      width: 100,
      render: (users: number | null) => users || '-',
    },
  ];

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
                <Button
                  type="primary"
                  icon={<DownloadOutlined />}
                  onClick={handleExportExcel}
                >
                  Xuất Excel
                </Button>
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

      {/* AI Assistant Card */}
      {aiRecommendations.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          style={{ marginBottom: spacing.lg }}
        >
          <Card
            style={{
              borderRadius: borderRadius.lg,
              boxShadow: shadows.md,
              background: 'linear-gradient(135deg, #f6f8fc 0%, #eef2f7 100%)',
              border: '1px solid #e6f4ff',
            }}
          >
            <Row justify="space-between" align="middle" style={{ marginBottom: aiAssistantExpanded ? 16 : 0 }}>
              <Col>
                <Space>
                  <div style={{
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #1890ff 0%, #722ed1 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    <RobotOutlined style={{ fontSize: 20, color: 'white' }} />
                  </div>
                  <div>
                    <Title level={4} style={{ margin: 0 }}>
                      Trợ lý ảo CDS
                    </Title>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      <SyncOutlined spin style={{ marginRight: 4 }} />
                      Phân tích dữ liệu và đề xuất hành động
                    </Text>
                  </div>
                </Space>
              </Col>
              <Col>
                <Button
                  type="text"
                  onClick={() => setAiAssistantExpanded(!aiAssistantExpanded)}
                >
                  {aiAssistantExpanded ? 'Thu gọn' : `Xem ${aiRecommendations.length} đề xuất`}
                </Button>
              </Col>
            </Row>

            {aiAssistantExpanded && (
              <div>
                <Divider style={{ margin: '0 0 16px 0' }} />
                <Row gutter={[16, 16]}>
                  {aiRecommendations.map((rec) => (
                    <Col xs={24} lg={12} key={rec.id}>
                      <Card
                        size="small"
                        style={{
                          borderRadius: borderRadius.base,
                          borderLeft: `4px solid ${
                            rec.type === 'critical' ? '#f5222d' :
                            rec.type === 'warning' ? '#fa8c16' :
                            rec.type === 'optimization' ? '#1890ff' : '#52c41a'
                          }`,
                          background: rec.type === 'critical' ? '#fff2f0' :
                            rec.type === 'warning' ? '#fffbe6' :
                            rec.type === 'optimization' ? '#e6f7ff' : '#f6ffed',
                        }}
                      >
                        <Space direction="vertical" size={8} style={{ width: '100%' }}>
                          <Space>
                            {rec.icon}
                            <Text strong style={{ fontSize: 14 }}>
                              {rec.title}
                            </Text>
                            <Tag color={
                              rec.type === 'critical' ? 'red' :
                              rec.type === 'warning' ? 'orange' :
                              rec.type === 'optimization' ? 'blue' : 'green'
                            } style={{ marginLeft: 'auto' }}>
                              {rec.type === 'critical' ? 'Nghiêm trọng' :
                               rec.type === 'warning' ? 'Cảnh báo' :
                               rec.type === 'optimization' ? 'Tối ưu' : 'Gợi ý'}
                            </Tag>
                          </Space>
                          <Text type="secondary" style={{ fontSize: 13 }}>
                            {rec.description}
                          </Text>
                          <div style={{
                            padding: '8px 12px',
                            background: 'white',
                            borderRadius: borderRadius.sm,
                            border: '1px dashed #d9d9d9',
                          }}>
                            <Text style={{ fontSize: 13 }}>
                              <BulbOutlined style={{ marginRight: 8, color: '#faad14' }} />
                              <strong>Đề xuất:</strong> {rec.action}
                            </Text>
                          </div>
                        </Space>
                      </Card>
                    </Col>
                  ))}
                </Row>
              </div>
            )}
          </Card>
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
                        value={stats?.overview.total_systems || 0}
                        prefix={<AppstoreOutlined style={{ color: '#1890ff' }} />}
                        valueStyle={{ color: '#1890ff' }}
                      />
                    </Card>
                  </Col>
                  <Col xs={12} sm={6}>
                    <Card style={{ borderRadius: borderRadius.md }}>
                      <Statistic
                        title="Đơn vị"
                        value={stats?.overview.total_organizations || 0}
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
                    <Card
                      style={{ borderRadius: borderRadius.md, cursor: 'pointer' }}
                      onClick={() => handleDrilldown('recommendation', 'replace', 'Hệ thống cần thay thế')}
                    >
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
                      message={
                        <span
                          style={{ cursor: 'pointer' }}
                          onClick={() => handleDrilldown('recommendation', 'unknown', 'Hệ thống chưa đánh giá')}
                        >
                          Đánh giá {stats?.recommendation_distribution.unknown || 0} hệ thống chưa có khuyến nghị
                        </span>
                      }
                      showIcon
                    />
                    <Alert
                      type="warning"
                      message={
                        <span
                          style={{ cursor: 'pointer' }}
                          onClick={() => handleDrilldown('recommendation', 'replace', 'Hệ thống cần thay thế')}
                        >
                          Xem xét thay thế {stats?.recommendation_distribution.replace || 0} hệ thống cũ
                        </span>
                      }
                      showIcon
                    />
                    <Alert
                      type="info"
                      message={
                        <span
                          style={{ cursor: 'pointer' }}
                          onClick={() => handleDrilldown('integration', 'without', 'Hệ thống chưa tích hợp')}
                        >
                          Tăng cường tích hợp cho {stats?.integration.without_integration || 0} hệ thống độc lập
                        </span>
                      }
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
                  extra={<Text type="secondary">Click để xem chi tiết</Text>}
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
                        onClick={(data) => {
                          if (data?.filterKey) {
                            handleDrilldown('status', data.filterKey, `Hệ thống ${STATUS_LABELS[data.filterKey] || data.filterKey}`);
                          }
                        }}
                        style={{ cursor: 'pointer' }}
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
                  extra={<Text type="secondary">Click để xem chi tiết</Text>}
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
                        onClick={(data) => {
                          if (data?.filterKey) {
                            handleDrilldown('criticality', data.filterKey, `Hệ thống mức độ ${CRITICALITY_LABELS[data.filterKey] || data.filterKey}`);
                          }
                        }}
                        style={{ cursor: 'pointer' }}
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
              {!investmentStats ? (
                <Col xs={24}>
                  <Skeleton active />
                </Col>
              ) : (
                <>
                  <Col xs={24}>
                    <Alert
                      type="info"
                      message="Dữ liệu chi phí đang được thu thập"
                      description="Hiện tại chưa có đầy đủ dữ liệu chi phí chi tiết. Biểu đồ dưới đây hiển thị phân bổ số lượng hệ thống theo đơn vị."
                      showIcon
                    />
                  </Col>

                  <Col xs={24}>
                    <Card
                      title="Phân bổ hệ thống theo đơn vị (Top 15)"
                      style={{ borderRadius: borderRadius.md }}
                      extra={<Text type="secondary">Click cột để xem chi tiết</Text>}
                    >
                      <ResponsiveContainer width="100%" height={400}>
                        <BarChart
                          data={investmentStats.by_organization}
                          layout="vertical"
                          onClick={(data) => {
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            const chartData = data as any;
                            if (chartData?.activePayload?.[0]?.payload?.org_name) {
                              handleDrilldown('org', chartData.activePayload[0].payload.org_name, `Hệ thống của ${chartData.activePayload[0].payload.org_name}`);
                            }
                          }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis type="number" />
                          <YAxis
                            dataKey="org_name"
                            type="category"
                            width={200}
                            tick={{ fontSize: 12 }}
                            tickFormatter={(value) => value.length > 25 ? value.substring(0, 25) + '...' : value}
                          />
                          <RechartsTooltip
                            formatter={(value, _name, props) => [
                              `${value} hệ thống`,
                              props?.payload?.org_name || '',
                            ]}
                          />
                          <Bar dataKey="system_count" fill="#1890ff" radius={[0, 4, 4, 0]} style={{ cursor: 'pointer' }}>
                            {investmentStats.by_organization.map((_, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </Card>
                  </Col>
                </>
              )}
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
              {!integrationStats && !stats ? (
                <Col xs={24}>
                  <Skeleton active />
                </Col>
              ) : (
                <>
                  <Col xs={24} md={8}>
                    <Card style={{ borderRadius: borderRadius.md }}>
                      <Statistic
                        title="Tổng API cung cấp"
                        value={integrationStats?.total_api_provided || stats?.integration.total_api_provided || 0}
                        prefix={<RiseOutlined style={{ color: '#52c41a' }} />}
                        valueStyle={{ color: '#52c41a' }}
                      />
                    </Card>
                  </Col>
                  <Col xs={24} md={8}>
                    <Card style={{ borderRadius: borderRadius.md }}>
                      <Statistic
                        title="Tổng API sử dụng"
                        value={integrationStats?.total_api_consumed || stats?.integration.total_api_consumed || 0}
                        prefix={<FallOutlined style={{ color: '#1890ff' }} />}
                        valueStyle={{ color: '#1890ff' }}
                      />
                    </Card>
                  </Col>
                  <Col xs={24} md={8}>
                    <Card
                      style={{ borderRadius: borderRadius.md, cursor: 'pointer' }}
                      onClick={() => handleDrilldown('integration', 'without', 'Hệ thống chưa tích hợp')}
                    >
                      <Statistic
                        title="Hệ thống chưa tích hợp"
                        value={integrationStats?.systems_without_integration || stats?.integration.without_integration || 0}
                        prefix={<WarningOutlined style={{ color: '#faad14' }} />}
                        valueStyle={{ color: '#faad14' }}
                        suffix={
                          <Text type="secondary" style={{ fontSize: 14 }}>
                            / {stats?.overview.total_systems}
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
                        message={`${integrationStats?.systems_without_integration || stats?.integration.without_integration || 0} hệ thống đang hoạt động độc lập, không chia sẻ dữ liệu với hệ thống khác`}
                        description="Đề xuất: Xem xét tích hợp các hệ thống này để tăng hiệu quả chia sẻ thông tin và giảm nhập liệu trùng lặp."
                        showIcon
                        style={{ marginBottom: 16 }}
                      />

                      <Row gutter={[16, 16]}>
                        <Col xs={24} md={12}>
                          <Card size="small" title="Tỷ lệ tích hợp">
                            <Progress
                              percent={integrationStats?.integration_rate || Math.round(
                                ((stats?.integration.with_integration || 0) / (stats?.overview.total_systems || 1)) * 100
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
                                <Tag color="green">{integrationStats?.total_api_provided || stats?.integration.total_api_provided || 0}</Tag>
                              </div>
                              <div>
                                <Text>API sử dụng: </Text>
                                <Tag color="blue">{integrationStats?.total_api_consumed || stats?.integration.total_api_consumed || 0}</Tag>
                              </div>
                            </Space>
                          </Card>
                        </Col>
                      </Row>

                      {integrationStats?.data_islands && integrationStats.data_islands.length > 0 && (
                        <div style={{ marginTop: 16 }}>
                          <Text strong>Một số hệ thống chưa tích hợp:</Text>
                          <div style={{ marginTop: 8 }}>
                            {integrationStats.data_islands.map((name, idx) => (
                              <Tag key={idx} style={{ marginBottom: 4 }}>{name}</Tag>
                            ))}
                          </div>
                        </div>
                      )}
                    </Card>
                  </Col>
                </>
              )}
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
              {!optimizationStats && !stats ? (
                <Col xs={24}>
                  <Skeleton active />
                </Col>
              ) : (
                <>
                  <Col xs={24} md={12}>
                    <Card
                      title="Khuyến nghị xử lý"
                      style={{ borderRadius: borderRadius.md }}
                      extra={<Text type="secondary">Click để xem chi tiết</Text>}
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
                            onClick={(data) => {
                              if (data?.filterKey) {
                                handleDrilldown('recommendation', data.filterKey, `Hệ thống ${RECOMMENDATION_LABELS[data.filterKey] || data.filterKey}`);
                              }
                            }}
                            style={{ cursor: 'pointer' }}
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
                            count: optimizationStats?.recommendations.keep || stats?.recommendation_distribution.keep || 0,
                            description: 'Hệ thống hoạt động tốt, không cần thay đổi',
                            priority: 'low',
                            filterKey: 'keep',
                          },
                          {
                            key: '2',
                            action: 'Nâng cấp',
                            count: optimizationStats?.recommendations.upgrade || stats?.recommendation_distribution.upgrade || 0,
                            description: 'Cần cập nhật công nghệ hoặc tính năng',
                            priority: 'medium',
                            filterKey: 'upgrade',
                          },
                          {
                            key: '3',
                            action: 'Thay thế',
                            count: optimizationStats?.recommendations.replace || stats?.recommendation_distribution.replace || 0,
                            description: 'Hệ thống lỗi thời, cần thay thế hoàn toàn',
                            priority: 'high',
                            filterKey: 'replace',
                          },
                          {
                            key: '4',
                            action: 'Chưa đánh giá',
                            count: optimizationStats?.recommendations.unknown || stats?.recommendation_distribution.unknown || 0,
                            description: 'Cần đơn vị bổ sung đánh giá',
                            priority: 'info',
                            filterKey: 'unknown',
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
                            render: (count: number, record: any) => (
                              <Button
                                type="link"
                                style={{ padding: 0, fontWeight: 'bold' }}
                                onClick={() => handleDrilldown('recommendation', record.filterKey, `Hệ thống ${record.action}`)}
                              >
                                {count}
                              </Button>
                            ),
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
                </>
              )}
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
                        status: 'Hoàn thành',
                        description: 'Dashboard cơ bản với dữ liệu thực',
                        progress: 100,
                      },
                      {
                        key: '2',
                        phase: 'Giai đoạn 2',
                        name: 'Drill-down & Export',
                        status: 'Hoàn thành',
                        description: 'Xem chi tiết và xuất Excel',
                        progress: 100,
                      },
                      {
                        key: '3',
                        phase: 'Giai đoạn 3',
                        name: 'Tích hợp & Lộ trình',
                        status: 'Lên kế hoạch',
                        description: 'Bản đồ kết nối và theo dõi dự án',
                        progress: 20,
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
                              status === 'Hoàn thành'
                                ? 'success'
                                : status === 'Đang triển khai'
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
              {!monitoringStats && !stats ? (
                <Col xs={24}>
                  <Skeleton active />
                </Col>
              ) : (
                <Col xs={24}>
                  <Card
                    title="🏆 Xếp hạng đơn vị theo số lượng hệ thống"
                    style={{ borderRadius: borderRadius.md }}
                    extra={<Text type="secondary">Click hàng để xem chi tiết</Text>}
                  >
                    <Table
                      dataSource={(monitoringStats?.organization_rankings || stats?.systems_per_org.map((org, index) => ({
                        org_id: index,
                        org_name: org.org__name,
                        system_count: org.count,
                        avg_completion: 0,
                        avg_performance: null,
                      })))?.map((org, index) => ({
                        key: index,
                        rank: index + 1,
                        name: org.org_name,
                        count: org.system_count,
                        completion: org.avg_completion,
                        percentage: ((org.system_count / (stats?.overview.total_systems || 1)) * 100).toFixed(1),
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
                          title: '% Hoàn thiện TB',
                          dataIndex: 'completion',
                          key: 'completion',
                          width: 130,
                          render: (completion: number) => (
                            <Progress
                              percent={completion}
                              size="small"
                              status={completion >= 80 ? 'success' : completion >= 50 ? 'normal' : 'exception'}
                            />
                          ),
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
                      onRow={(record) => ({
                        onClick: () => handleDrilldown('org', record.name, `Hệ thống của ${record.name}`),
                        style: { cursor: 'pointer' },
                      })}
                    />
                  </Card>
                </Col>
              )}
            </Row>
          </TabPane>
        </Tabs>
      </Card>

      {/* Drill-down Modal */}
      <Modal
        title={drilldownTitle}
        open={drilldownVisible}
        onCancel={() => setDrilldownVisible(false)}
        width={1000}
        footer={[
          <Button key="close" onClick={() => setDrilldownVisible(false)}>
            Đóng
          </Button>,
        ]}
      >
        <Table
          dataSource={drilldownSystems}
          columns={drilldownColumns}
          loading={drilldownLoading}
          pagination={{ pageSize: 10 }}
          size="small"
          rowKey="id"
          scroll={{ x: 800 }}
        />
      </Modal>
    </div>
  );
};

export default StrategicDashboard;
