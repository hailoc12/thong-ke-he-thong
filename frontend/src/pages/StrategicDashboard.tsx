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
  Input,
  Timeline,
  Collapse,
  Spin,
} from 'antd';

const { TextArea } = Input;
const { Panel } = Collapse;
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
  AlertOutlined,
  SendOutlined,
  HistoryOutlined,
  CloudOutlined,
  SecurityScanOutlined,
  FileTextOutlined,
  DeploymentUnitOutlined,
  DatabaseOutlined,
  CodeOutlined,
  ClockCircleOutlined,
  FlagOutlined,
  RocketOutlined,
  LineChartOutlined,
  SyncOutlined,
  QuestionCircleOutlined,
  LinkOutlined,
  UnorderedListOutlined,
  RightCircleOutlined,
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
import ReactMarkdown from 'react-markdown';
import api from '../config/api';
import { shadows, borderRadius, spacing } from '../theme/tokens';
import AIDataModal from '../components/AIDataModal';

const { Title, Text } = Typography;
const { TabPane } = Tabs;

// CSS Animations for AI Card
const aiCardStyles = `
@keyframes gradientAnimation {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

@keyframes glowPulse {
  0%, 100% {
    box-shadow: 0 0 20px rgba(114, 46, 209, 0.4), 0 0 40px rgba(114, 46, 209, 0.2);
  }
  50% {
    box-shadow: 0 0 30px rgba(114, 46, 209, 0.6), 0 0 60px rgba(114, 46, 209, 0.3);
  }
}

@keyframes floatAnimation {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-5px); }
}

@keyframes dotPulse {
  0%, 100% { opacity: 0.4; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.2); }
}

@keyframes slideInUp {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes countUp {
  from { opacity: 0; transform: scale(0.5); }
  to { opacity: 1; transform: scale(1); }
}

.ai-card-animated-bg {
  background: linear-gradient(-45deg, #667eea, #764ba2, #6B8DD6, #8E37D7);
  background-size: 400% 400%;
  animation: gradientAnimation 15s ease infinite;
}

.ai-avatar-glow {
  animation: glowPulse 2s ease-in-out infinite, floatAnimation 3s ease-in-out infinite;
}

.ai-status-dot {
  animation: dotPulse 1.5s ease-in-out infinite;
}

.ai-recommendation-card {
  animation: slideInUp 0.4s ease-out forwards;
}

.ai-count-badge {
  animation: countUp 0.5s ease-out forwards;
}

.ai-chat-bubble {
  animation: slideInUp 0.3s ease-out forwards;
}

.impact-bar {
  transition: width 0.8s ease-out;
}
`;

// Inject styles into document
if (typeof document !== 'undefined') {
  const styleId = 'ai-card-styles';
  if (!document.getElementById(styleId)) {
    const styleSheet = document.createElement('style');
    styleSheet.id = styleId;
    styleSheet.textContent = aiCardStyles;
    document.head.appendChild(styleSheet);
  }
}

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

// New interfaces for Insights feature
interface InsightItem {
  id: string;
  category: string;
  severity: 'critical' | 'warning' | 'info' | 'success';
  title: string;
  description: string;
  recommendation: string;
  metric: {
    count?: number;
    percentage?: number;
    top?: Array<{ [key: string]: string | number }>;
  };
  filter: {
    type: string;
    value?: string;
  };
}

interface InsightsStats {
  insights: InsightItem[];
  summary: {
    total_insights: number;
    critical: number;
    warning: number;
    info: number;
    success: number;
  };
  total_systems: number;
}

// New interfaces for Roadmap feature
interface RoadmapSystem {
  id: number;
  name: string;
  org_name: string | null;
  status: string;
  criticality: string;
  improvements_needed: Array<{
    phase: number;
    action: string;
    detail: string;
  }>;
  score: number;
  current_phase: number;
  phase_label: string;
}

interface RoadmapStats {
  summary: {
    phase1: { name: string; title: string; description: string; count: number; percentage: number };
    phase2: { name: string; title: string; description: string; count: number; percentage: number };
    phase3: { name: string; title: string; description: string; count: number; percentage: number };
    completed: { name: string; title: string; description: string; count: number; percentage: number };
  };
  top_priorities: {
    phase1: RoadmapSystem[];
    phase2: RoadmapSystem[];
    phase3: RoadmapSystem[];
  };
  improvement_actions: Array<{ action: string; count: number; phase: number }>;
  total_systems: number;
  systems_by_phase: {
    phase1: RoadmapSystem[];
    phase2: RoadmapSystem[];
    phase3: RoadmapSystem[];
    completed: RoadmapSystem[];
  };
}

// AI Query interfaces - Multi-agent thinking mode
interface AIThinkingTask {
  id: number;
  name: string;
  description?: string;
  status: 'pending' | 'in_progress' | 'completed';

  // Detailed information captured during execution
  thinking?: Record<string, any>;
  sql?: string;
  sqlPreview?: string;
  resultCount?: number;
  reviewPassed?: boolean;

  // Phase 1.5: Smart Data Details
  dataAnalysis?: string;
  enhanced?: boolean;
  addedInfo?: string[];

  // Timing information
  startTime?: number;
  endTime?: number;
  duration?: string;
}

interface AIThinking {
  plan: string;
  tasks: AIThinkingTask[];
  sql_queries: string[];
}

interface AIResponseContent {
  greeting?: string;
  main_answer: string;
  details?: string | null;
  strategic_insight?: string;
  recommended_action?: string;
  chart_type?: 'bar' | 'pie' | 'table' | 'number';
  chart_config?: {
    x_field?: string;
    y_field?: string;
    title?: string;
    x_label?: string;
    y_label?: string;
    unit?: string;
  };
  follow_up_suggestions?: string[];
}

interface AIQueryResponse {
  query: string;
  thinking?: AIThinking;
  response?: AIResponseContent;
  // Legacy format support
  ai_response?: {
    sql?: string;
    explanation?: string;
    chart_type?: 'bar' | 'pie' | 'table' | 'number';
    chart_config?: {
      x_field?: string;
      y_field?: string;
      title?: string;
    };
    error?: string;
  };
  data?: {
    columns: string[];
    rows: Array<Record<string, any>>;
    total_rows: number;
  };
  error?: string;
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

  // New feature states
  const [insightsStats, setInsightsStats] = useState<InsightsStats | null>(null);
  const [roadmapStats, setRoadmapStats] = useState<RoadmapStats | null>(null);

  // AI Query state
  const [aiQuery, setAiQuery] = useState('');
  const [aiQueryLoading, setAiQueryLoading] = useState(false);
  const [aiQueryResponse, setAiQueryResponse] = useState<AIQueryResponse | null>(null);
  const [aiQueryHistory, setAiQueryHistory] = useState<string[]>([]);
  const [dataModalVisible, setDataModalVisible] = useState(false);

  // Progressive AI loading state (Claude Code style)
  const [aiProgressTasks, setAiProgressTasks] = useState<AIThinkingTask[]>([]);

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
        } else if (activeTab === 'insights' && !insightsStats) {
          const response = await api.get('/systems/insights/');
          setInsightsStats(response.data);
        } else if (activeTab === 'roadmap' && !roadmapStats) {
          const response = await api.get('/systems/roadmap_stats/');
          setRoadmapStats(response.data);
        }
      } catch (error) {
        console.error(`Failed to fetch ${activeTab} data:`, error);
      }
    };
    fetchTabData();
  }, [activeTab, investmentStats, integrationStats, optimizationStats, monitoringStats, insightsStats, roadmapStats]);

  // AI Query handler with SSE streaming for real-time progress
  const handleAIQuery = useCallback(async () => {
    if (!aiQuery.trim()) {
      message.warning('Vui lòng nhập câu hỏi');
      return;
    }

    const currentQuery = aiQuery;
    setAiQuery(''); // Clear input immediately
    setAiQueryLoading(true);
    setAiQueryResponse(null); // Clear previous response

    // Reset progress states
    setAiProgressTasks([]);

    // Get token from localStorage or sessionStorage
    const token = localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
    if (!token) {
      message.error('Vui lòng đăng nhập lại');
      setAiQueryLoading(false);
      return;
    }

    // Create EventSource for SSE
    const queryString = encodeURIComponent(currentQuery);
    const sseUrl = `${window.location.protocol}//${window.location.hostname}/api/systems/ai_query_stream/?query=${queryString}&token=${token}`;

    const eventSource = new EventSource(sseUrl);
    console.log('[AI DEBUG] EventSource created:', sseUrl);

    // Track which phases we've seen
    const seenPhases = new Set<number>();

    eventSource.addEventListener('phase_start', (e: MessageEvent) => {
      try {
        console.log('[AI DEBUG] phase_start event received:', e.data);
        const data = JSON.parse(e.data);
        const phaseId = data.phase;
        seenPhases.add(phaseId);

        // Mark previous tasks as completed with end time and duration
        setAiProgressTasks(prev => {
          const now = Date.now();
          const completed = prev.map(t => {
            const updated = { ...t, status: 'completed' as const, endTime: now };
            if (t.startTime) {
              updated.duration = ((now - t.startTime) / 1000).toFixed(1) + 's';
            }
            return updated;
          });
          
          // Add new in-progress task with start time and description
          return [...completed, { 
            id: phaseId, 
            name: data.name, 
            description: data.description,
            status: 'in_progress' as const,
            startTime: now
          }];
        });
      } catch (err) {
        console.error('Error parsing phase_start:', err);
      }
    });

        eventSource.addEventListener('phase_complete', (e: MessageEvent) => {
      try {
        console.log('[AI DEBUG] phase_complete event received:', e.data);
        const data = JSON.parse(e.data);
        const phaseId = data.phase;
        const now = Date.now();

        setAiProgressTasks(prev => prev.map(t => {
          if (t.id === phaseId) {
            const updated = { ...t, status: 'completed' as const, endTime: now };
            
            // Add phase-specific details
            if (data.phase === 1) {
              // SQL Generation phase
              updated.thinking = data.thinking;
              updated.sql = data.sql;
              updated.sqlPreview = data.sql ?
                (data.sql.length > 80 ? data.sql.substring(0, 80) + '...' : data.sql)
                : undefined;
            } else if (data.phase === 1.5) {
              // Smart Data Details phase
              updated.dataAnalysis = data.analysis;
              updated.enhanced = data.enhanced;
              updated.addedInfo = data.added_info;
            } else if (data.phase === 2) {
              // Data Query phase
              updated.resultCount = data.total_rows;
            } else if (data.phase === 4) {
              // Self-Review phase
              updated.reviewPassed = data.review_passed;
            }
            
            // Calculate duration
            if (t.startTime) {
              updated.duration = ((now - t.startTime) / 1000).toFixed(1) + 's';
            }
            
            return updated;
          }
          return t;
        }));
      } catch (err) {
        console.error('Error parsing phase_complete:', err);
      }
    });

    // Handle progress updates (detailed status messages during processing)
    eventSource.addEventListener('progress', (e: MessageEvent) => {
      try {
        const data = JSON.parse(e.data);
        // Update the description of the current in-progress task
        setAiProgressTasks(prev => prev.map(t =>
          t.status === 'in_progress' ? { ...t, name: data.message || t.name } : t
        ));
      } catch (err) {
        console.error('Error parsing progress:', err);
      }
    });

    eventSource.addEventListener('complete', (e: MessageEvent) => {
      try {
        console.log('[AI DEBUG] *** COMPLETE EVENT RECEIVED ***', e.data);
        const data = JSON.parse(e.data);

        // Mark all tasks as completed
        setAiProgressTasks(prev => prev.map(t => ({ ...t, status: 'completed' as const })));

        // Small delay before showing result
        setTimeout(() => {
          console.log('[AI DEBUG] Setting aiQueryResponse state:', data);
          setAiQueryResponse(data);
          console.log('[AI DEBUG] Setting aiQueryLoading to false');
          setAiQueryHistory(prev => [currentQuery, ...prev.filter(q => q !== currentQuery)].slice(0, 10));
          setAiQueryLoading(false);
          eventSource.close();
        }, 400);
      } catch (err) {
        console.error('Error parsing complete:', err);
      }
    });

    eventSource.addEventListener('error', (e: MessageEvent) => {
      try {
        console.log('[AI DEBUG] ERROR event received:', e.data);
        const data = JSON.parse(e.data);
        message.error(data.error || 'Lỗi khi xử lý câu hỏi');
      } catch {
        message.error('Lỗi kết nối đến máy chủ');
      }
      setAiQueryLoading(false);
      // Don't clear progress tasks - keep them visible after completion
      // Tasks will be cleared when starting a new query
      eventSource.close();
    });

    // Cleanup on unmount
    return () => {
      eventSource.close();
    };
  }, [aiQuery]);

  const generateAlerts = (data: StrategicStats | null) => {
    const newAlerts: Array<{ type: 'critical' | 'warning' | 'info'; message: string }> = [];

    if (data) {
      if (data.status_distribution.stopped > 0) {
        newAlerts.push({
          type: 'warning',
          message: `${data.status_distribution.stopped} hệ thống đã dừng hoạt động`,
        });
      }

      // Removed: "hệ thống cần thay thế" alert - not needed in AI section

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
      drilldown?: { filterType: string; filterValue: string; title: string };
    }> = [];

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
        drilldown: { filterType: 'integration', filterValue: 'without', title: 'Hệ thống chưa tích hợp' },
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
        drilldown: { filterType: 'recommendation', filterValue: 'unknown', title: 'Hệ thống chưa được đánh giá' },
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
        drilldown: { filterType: 'recommendation', filterValue: 'upgrade', title: 'Hệ thống cần nâng cấp' },
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
        drilldown: { filterType: 'criticality', filterValue: 'high', title: 'Hệ thống mức độ quan trọng CAO' },
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
        drilldown: { filterType: 'integration', filterValue: 'with', title: 'Hệ thống đã tích hợp API' },
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

  // Excel Export - Escape formula injection characters
  const escapeExcelValue = (value: any): any => {
    if (typeof value === 'string' && value.length > 0) {
      const firstChar = value.charAt(0);
      if (firstChar === '=' || firstChar === '+' || firstChar === '-' || firstChar === '@') {
        return "'" + value;
      }
    }
    return value;
  };

  const escapeRow = (row: any[]): any[] => row.map(escapeExcelValue);

  // Vietnamese unit labels mapping for AI data display
  const getVietnameseUnit = (dataType: string): string => {
    const unitMap: Record<string, string> = {
      'total_systems': 'Hệ thống',
      'system_count': 'Hệ thống',
      'systems': 'Hệ thống',
      'total_organizations': 'Đơn vị',
      'organization_count': 'Đơn vị',
      'orgs': 'Đơn vị',
      'api_count': 'API',
      'total_apis': 'API',
      'apis': 'API',
      'investment_cost': 'Tỷ VNĐ',
      'cost': 'VNĐ',
      'storage_size': 'GB',
      'db_size': 'GB',
      'health_score': 'Điểm',
      'score': 'Điểm',
      'percentage': '%',
      'percent': '%',
      'count': 'Số lượng',
    };
    return unitMap[dataType.toLowerCase()] || dataType;
  };

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
    ].map(escapeRow);
    const wsOverview = XLSX.utils.aoa_to_sheet(overviewData);
    XLSX.utils.book_append_sheet(wb, wsOverview, 'Tổng quan');

    // Sheet 2: Organizations
    const orgData = [
      ['Phân bổ theo đơn vị'],
      [''],
      ['Đơn vị', 'Số hệ thống'],
      ...stats.systems_per_org.map(org => [org.org__name, org.count]),
    ].map(escapeRow);
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
    ].map(escapeRow);
    const wsIntegration = XLSX.utils.aoa_to_sheet(integrationData);
    XLSX.utils.book_append_sheet(wb, wsIntegration, 'Tích hợp');

    // Sheet 4: Recommendations
    const recData = [
      ['Khuyến nghị xử lý'],
      [''],
      ['Khuyến nghị', 'Số lượng'],
      ...Object.entries(stats.recommendation_distribution).map(([k, v]) => [RECOMMENDATION_LABELS[k] || k, v]),
    ].map(escapeRow);
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

      {/* AI Assistant Card - Hero Design */}
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
              boxShadow: '0 10px 40px rgba(114, 46, 209, 0.15)',
              background: 'linear-gradient(135deg, #fafbff 0%, #f0f4ff 100%)',
              border: 'none',
              overflow: 'hidden',
            }}
          >
            {/* Hero Header with Animated Gradient */}
            <div
              className="ai-card-animated-bg"
              style={{
                margin: '-24px -24px 0 -24px',
                padding: '20px 24px',
                borderRadius: `${borderRadius.lg} ${borderRadius.lg} 0 0`,
                position: 'relative',
              }}
            >
              {/* Glassmorphism overlay */}
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(10px)',
              }} />

              <Row justify="space-between" align="middle" style={{ position: 'relative', zIndex: 1 }}>
                <Col>
                  <Space size={16}>
                    {/* Floating AI Avatar with Glow */}
                    <div
                      className="ai-avatar-glow"
                      style={{
                        width: 56,
                        height: 56,
                        borderRadius: '50%',
                        background: 'rgba(255, 255, 255, 0.95)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: '3px solid rgba(255, 255, 255, 0.5)',
                      }}
                    >
                      <RobotOutlined style={{ fontSize: 28, color: '#722ed1' }} />
                    </div>
                    <div>
                      <Title level={4} style={{ margin: 0, color: 'white', textShadow: '0 1px 2px rgba(0,0,0,0.1)' }}>
                        Trợ lý ảo CDS
                      </Title>
                      <Space size={8} style={{ marginTop: 4 }}>
                        <span className="ai-status-dot" style={{
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          background: '#52c41a',
                          display: 'inline-block',
                        }} />
                        <Text style={{ fontSize: 13, color: 'rgba(255,255,255,0.9)' }}>
                          AI đang hoạt động
                        </Text>
                        <Text style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)' }}>
                          • {aiRecommendations.length} đề xuất hành động
                        </Text>
                      </Space>
                    </div>
                  </Space>
                </Col>
                <Col>
                  <Button
                    type="default"
                    onClick={() => setAiAssistantExpanded(!aiAssistantExpanded)}
                    style={{
                      background: 'rgba(255,255,255,0.2)',
                      borderColor: 'rgba(255,255,255,0.3)',
                      color: 'white',
                      fontWeight: 500,
                    }}
                  >
                    {aiAssistantExpanded ? '▲ Thu gọn' : '▼ Xem chi tiết'}
                  </Button>
                </Col>
              </Row>

              {/* Priority Summary Badges (always visible) */}
              <Row gutter={12} style={{ marginTop: 16, position: 'relative', zIndex: 1 }}>
                {(() => {
                  const criticalCount = aiRecommendations.filter(r => r.type === 'critical').length;
                  const warningCount = aiRecommendations.filter(r => r.type === 'warning').length;
                  const optimizationCount = aiRecommendations.filter(r => r.type === 'optimization').length;
                  const insightCount = aiRecommendations.filter(r => r.type === 'insight').length;

                  return (
                    <>
                      {criticalCount > 0 && (
                        <Col>
                          <div className="ai-count-badge" style={{
                            background: 'rgba(245, 34, 45, 0.9)',
                            borderRadius: 8,
                            padding: '8px 16px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8,
                          }}>
                            <span style={{ fontSize: 20, fontWeight: 700, color: 'white' }}>{criticalCount}</span>
                            <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.9)' }}>Nghiêm trọng</span>
                          </div>
                        </Col>
                      )}
                      {warningCount > 0 && (
                        <Col>
                          <div className="ai-count-badge" style={{
                            background: 'rgba(250, 140, 22, 0.9)',
                            borderRadius: 8,
                            padding: '8px 16px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8,
                          }}>
                            <span style={{ fontSize: 20, fontWeight: 700, color: 'white' }}>{warningCount}</span>
                            <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.9)' }}>Cảnh báo</span>
                          </div>
                        </Col>
                      )}
                      {optimizationCount > 0 && (
                        <Col>
                          <div className="ai-count-badge" style={{
                            background: 'rgba(24, 144, 255, 0.9)',
                            borderRadius: 8,
                            padding: '8px 16px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8,
                          }}>
                            <span style={{ fontSize: 20, fontWeight: 700, color: 'white' }}>{optimizationCount}</span>
                            <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.9)' }}>Tối ưu</span>
                          </div>
                        </Col>
                      )}
                      {insightCount > 0 && (
                        <Col>
                          <div className="ai-count-badge" style={{
                            background: 'rgba(82, 196, 26, 0.9)',
                            borderRadius: 8,
                            padding: '8px 16px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8,
                          }}>
                            <span style={{ fontSize: 20, fontWeight: 700, color: 'white' }}>{insightCount}</span>
                            <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.9)' }}>Gợi ý</span>
                          </div>
                        </Col>
                      )}
                    </>
                  );
                })()}
              </Row>
            </div>

            {/* Content Area - Padding adjustment */}
            <div style={{ paddingTop: 20 }}>

            {aiAssistantExpanded && (
              <div>
                {/* Enhanced Recommendation Cards */}
                <Row gutter={[16, 16]}>
                  {aiRecommendations.map((rec, index) => {
                    const typeColor = rec.type === 'critical' ? '#f5222d' :
                      rec.type === 'warning' ? '#fa8c16' :
                      rec.type === 'optimization' ? '#1890ff' : '#52c41a';
                    const bgColor = rec.type === 'critical' ? '#fff2f0' :
                      rec.type === 'warning' ? '#fffbe6' :
                      rec.type === 'optimization' ? '#e6f7ff' : '#f6ffed';
                    const impactScore = rec.type === 'critical' ? 9 :
                      rec.type === 'warning' ? 7 :
                      rec.type === 'optimization' ? 5 : 4;

                    return (
                      <Col xs={24} lg={12} key={rec.id}>
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.1 }}
                        >
                          <Card
                            size="small"
                            hoverable={!!rec.drilldown}
                            onClick={() => {
                              if (rec.drilldown) {
                                handleDrilldown(rec.drilldown.filterType, rec.drilldown.filterValue, rec.drilldown.title);
                              }
                            }}
                            style={{
                              borderRadius: 12,
                              border: 'none',
                              background: 'white',
                              boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                              cursor: rec.drilldown ? 'pointer' : 'default',
                              overflow: 'hidden',
                            }}
                          >
                            {/* Card Header with Priority Badge */}
                            <div style={{
                              display: 'flex',
                              alignItems: 'flex-start',
                              gap: 12,
                              marginBottom: 12,
                            }}>
                              {/* Priority Number Badge */}
                              <div style={{
                                width: 36,
                                height: 36,
                                borderRadius: 8,
                                background: typeColor,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0,
                              }}>
                                <span style={{ color: 'white', fontWeight: 700, fontSize: 16 }}>
                                  {rec.priority}
                                </span>
                              </div>

                              <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                                  {rec.icon}
                                  <Text strong style={{ fontSize: 14, flex: 1 }}>
                                    {rec.title}
                                  </Text>
                                </div>
                              </div>
                            </div>

                            {/* Description */}
                            <Text type="secondary" style={{ fontSize: 13, display: 'block', marginBottom: 12 }}>
                              {rec.description}
                            </Text>

                            {/* Impact Score Bar */}
                            <div style={{
                              background: '#f5f5f5',
                              borderRadius: 8,
                              padding: '10px 12px',
                              marginBottom: 12,
                            }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                                <Text style={{ fontSize: 12, color: '#8c8c8c' }}>Mức độ ảnh hưởng</Text>
                                <Text strong style={{ fontSize: 13, color: typeColor }}>{impactScore}/10</Text>
                              </div>
                              <div style={{
                                height: 6,
                                background: '#e8e8e8',
                                borderRadius: 3,
                                overflow: 'hidden',
                              }}>
                                <div
                                  className="impact-bar"
                                  style={{
                                    height: '100%',
                                    width: `${impactScore * 10}%`,
                                    background: `linear-gradient(90deg, ${typeColor}88, ${typeColor})`,
                                    borderRadius: 3,
                                  }}
                                />
                              </div>
                            </div>

                            {/* Action Box */}
                            <div style={{
                              padding: '10px 12px',
                              background: bgColor,
                              borderRadius: 8,
                              border: `1px solid ${typeColor}22`,
                            }}>
                              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                                <RocketOutlined style={{ color: typeColor, marginTop: 2 }} />
                                <div style={{ flex: 1 }}>
                                  <Text style={{ fontSize: 12, color: '#8c8c8c', display: 'block' }}>Đề xuất hành động</Text>
                                  <Text style={{ fontSize: 13 }}>{rec.action}</Text>
                                </div>
                              </div>
                            </div>

                            {/* Action Buttons */}
                            {rec.drilldown && (
                              <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
                                <Button
                                  type="primary"
                                  size="small"
                                  icon={<EyeOutlined />}
                                  style={{
                                    background: typeColor,
                                    borderColor: typeColor,
                                    borderRadius: 6,
                                    fontSize: 12,
                                  }}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (rec.drilldown) {
                                      handleDrilldown(rec.drilldown.filterType, rec.drilldown.filterValue, rec.drilldown.title);
                                    }
                                  }}
                                >
                                  Xem danh sách
                                </Button>
                              </div>
                            )}
                          </Card>
                        </motion.div>
                      </Col>
                    );
                  })}
                </Row>

                {/* AI Chat Section - Premium Hero Design */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  style={{
                    marginTop: 20,
                    marginBottom: 16,
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
                    borderRadius: 16,
                    padding: '16px 20px',
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                >
                  {/* Animated background dots */}
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    opacity: 0.1,
                    backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
                    backgroundSize: '20px 20px',
                  }} />

                  <Row align="middle" gutter={16}>
                    <Col flex="auto">
                      <Space direction="vertical" size={4}>
                        <Space align="center">
                          <motion.div
                            animate={{
                              scale: [1, 1.1, 1],
                              rotate: [0, 5, -5, 0],
                            }}
                            transition={{
                              duration: 2,
                              repeat: Infinity,
                              repeatDelay: 3,
                            }}
                          >
                            <RobotOutlined style={{ fontSize: 24, color: 'white' }} />
                          </motion.div>
                          <Text strong style={{ color: 'white', fontSize: 16 }}>
                            💬 Hỏi AI về dữ liệu hệ thống
                          </Text>
                          <Tag color="#52c41a" style={{ margin: 0, borderRadius: 12 }}>
                            <span style={{ fontSize: 11 }}>✨ Mới</span>
                          </Tag>
                        </Space>
                        <Text style={{ color: 'rgba(255,255,255,0.9)', fontSize: 13 }}>
                          Nhập câu hỏi bằng tiếng Việt tự nhiên, AI sẽ phân tích dữ liệu và trả lời ngay!
                        </Text>
                      </Space>
                    </Col>
                    <Col>
                      <motion.div
                        animate={{ y: [0, -3, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      >
                        <BulbOutlined style={{ fontSize: 32, color: 'rgba(255,255,255,0.7)' }} />
                      </motion.div>
                    </Col>
                  </Row>

                  {/* Quick suggestion chips */}
                  <div style={{ marginTop: 12 }}>
                    <Space wrap size={[6, 6]}>
                      <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 11 }}>Thử hỏi:</Text>
                      {[
                        'Có bao nhiêu hệ thống?',
                        'Hệ thống nào cần nâng cấp?',
                        'Tổng dung lượng CSDL?',
                      ].map((q, i) => (
                        <Tag
                          key={i}
                          style={{
                            cursor: 'pointer',
                            background: 'rgba(255,255,255,0.2)',
                            border: '1px solid rgba(255,255,255,0.3)',
                            color: 'white',
                            borderRadius: 12,
                            fontSize: 11,
                          }}
                          onClick={() => {
                            setAiQuery(q);
                            setTimeout(() => {
                              const submitButton = document.querySelector('.ai-submit-btn') as HTMLButtonElement;
                              if (submitButton) submitButton.click();
                            }, 100);
                          }}
                        >
                          {q}
                        </Tag>
                      ))}
                    </Space>
                  </div>
                </motion.div>

                {/* Chat Container */}
                <div style={{
                  background: '#f8f9fc',
                  borderRadius: 16,
                  padding: 20,
                  minHeight: 120,
                  border: '2px dashed #d3adf7',
                }}>
                  {/* Previous Q&A in Chat Style */}
                  {aiQueryResponse && !aiQueryLoading && (
                    <div style={{ marginBottom: 20 }}>
                      {/* User Question Bubble */}
                      <div style={{
                        display: 'flex',
                        justifyContent: 'flex-end',
                        marginBottom: 12,
                      }}>
                        <motion.div
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          style={{
                            maxWidth: '80%',
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            borderRadius: '16px 16px 4px 16px',
                            padding: '12px 16px',
                            color: 'white',
                          }}
                        >
                          <Text style={{ color: 'white', fontSize: 14 }}>
                            {aiQueryHistory[0] || 'Câu hỏi của bạn'}
                          </Text>
                        </motion.div>
                        <div style={{
                          width: 32,
                          height: 32,
                          borderRadius: '50%',
                          background: '#e6f7ff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          marginLeft: 8,
                          flexShrink: 0,
                        }}>
                          <TeamOutlined style={{ color: '#1890ff', fontSize: 14 }} />
                        </div>
                      </div>

                      {/* Enhanced Progress Section - BEFORE AI Response */}
                      {aiProgressTasks.length > 0 && (
                        <div style={{ marginBottom: 16 }}>
                          <Card
                            size="small"
                            style={{
                              background: 'linear-gradient(135deg, #f9f0ff 0%, #efdbff 100%)',
                              borderRadius: 12,
                              border: '2px solid #d3adf7',
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                              <div style={{
                                width: 36,
                                height: 36,
                                borderRadius: '50%',
                                background: 'linear-gradient(135deg, #722ed1 0%, #1890ff 100%)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0,
                              }}>
                                <RobotOutlined style={{ color: 'white', fontSize: 16 }} />
                              </div>
                              <div style={{ flex: 1 }}>
                                <div style={{ marginBottom: 10 }}>
                                  <Text type="secondary" style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                                    TIẾN ĐỘ ({aiProgressTasks.filter(t => t.status === 'completed').length}/{aiProgressTasks.length})
                                  </Text>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                                  {aiProgressTasks.map((task) => (
                                    <motion.div
                                      key={task.id}
                                      initial={{ opacity: 0, x: -10 }}
                                      animate={{ opacity: 1, x: 0 }}
                                      transition={{ duration: 0.2 }}
                                      style={{
                                        padding: '10px 12px',
                                        background: task.status === 'in_progress' ? 'rgba(114, 46, 209, 0.08)' : 'rgba(0, 0, 0, 0.02)',
                                        borderRadius: 8,
                                        border: task.status === 'in_progress' ? '1px solid rgba(114, 46, 209, 0.2)' : '1px solid transparent',
                                        transition: 'all 0.2s ease',
                                      }}
                                    >
                                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: task.description || task.status === 'completed' ? 6 : 0 }}>
                                        {task.status === 'completed' ? (
                                          <CheckCircleOutlined style={{ color: '#52c41a', fontSize: 14, flexShrink: 0 }} />
                                        ) : (
                                          <SyncOutlined spin style={{ color: '#722ed1', fontSize: 14, flexShrink: 0 }} />
                                        )}
                                        <Text
                                          style={{
                                            fontSize: 13,
                                            flex: 1,
                                            textDecoration: task.status === 'completed' ? 'line-through' : 'none',
                                            color: task.status === 'completed' ? '#8c8c8c' : '#262626',
                                            fontWeight: task.status === 'in_progress' ? 500 : 400,
                                          }}
                                        >
                                          {task.name}
                                        </Text>
                                        {task.duration && (
                                          <Tag color={task.status === 'completed' ? 'success' : 'processing'} style={{ fontSize: 11, margin: 0, padding: '0 6px', height: 18 }}>
                                            {task.duration}
                                          </Tag>
                                        )}
                                        {task.status === 'in_progress' && !task.duration && (
                                          <Spin size="small" />
                                        )}
                                      </div>

                                      {task.description && task.status === 'in_progress' && (
                                        <div style={{ marginLeft: 22, marginTop: 4 }}>
                                          <Text style={{ fontSize: 12, color: '#595959' }}>
                                            {task.description}
                                          </Text>
                                        </div>
                                      )}

                                      {task.status === 'completed' && (
                                        <div style={{ marginLeft: 22, marginTop: 6, display: 'flex', flexDirection: 'column', gap: 4 }}>
                                          {task.sqlPreview && (
                                            <div style={{
                                              background: '#f6f6f6',
                                              padding: '6px 8px',
                                              borderRadius: 4,
                                              border: '1px solid #e8e8e8',
                                              fontSize: 11,
                                              fontFamily: 'Monaco, Consolas, monospace',
                                              color: '#d73a49',
                                              overflow: 'hidden',
                                              textOverflow: 'ellipsis',
                                              whiteSpace: 'nowrap'
                                            }}>
                                              {task.sqlPreview}
                                            </div>
                                          )}

                                          {task.dataAnalysis && (
                                            <div style={{
                                              background: '#e6f7ff',
                                              padding: '8px 10px',
                                              borderRadius: 6,
                                              border: '1px solid #91d5ff',
                                              marginTop: 4,
                                            }}>
                                              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 6 }}>
                                                <BulbOutlined style={{ color: '#1890ff', fontSize: 12, marginTop: 2 }} />
                                                <div style={{ flex: 1 }}>
                                                  <Text style={{ fontSize: 11, color: '#096dd9', display: 'block', marginBottom: 4 }}>
                                                    <strong>Phân tích:</strong> {task.dataAnalysis}
                                                  </Text>
                                                  {task.addedInfo && task.addedInfo.length > 0 && (
                                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 4 }}>
                                                      {task.addedInfo.map((info, idx) => (
                                                        <Tag key={idx} color="cyan" style={{ fontSize: 10, margin: 0 }}>
                                                          {info}
                                                        </Tag>
                                                      ))}
                                                    </div>
                                                  )}
                                                  {task.enhanced && (
                                                    <Tag color="processing" style={{ fontSize: 10, marginTop: 4 }}>
                                                      ✓ SQL đã được tăng cường
                                                    </Tag>
                                                  )}
                                                </div>
                                              </div>
                                            </div>
                                          )}

                                          {task.resultCount !== undefined && (
                                            <Tag color="blue" style={{ fontSize: 11, width: 'fit-content' }}>
                                              Tìm thấy {task.resultCount} dòng
                                            </Tag>
                                          )}

                                          {task.reviewPassed !== undefined && (
                                            <Tag color={task.reviewPassed ? 'success' : 'warning'} style={{ fontSize: 11, width: 'fit-content' }}>
                                              {task.reviewPassed ? '✓ Đã kiểm tra' : '⚠ Phát hiện vấn đề'}
                                            </Tag>
                                          )}
                                        </div>
                                      )}
                                    </motion.div>
                                  ))}

                                  {aiProgressTasks.length === 0 && (
                                    <div style={{
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: 10,
                                      padding: '6px 10px',
                                    }}>
                                      <Spin size="small" />
                                      <Text style={{ color: '#722ed1', fontSize: 13 }}>
                                        Đang khởi tạo...
                                      </Text>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </Card>
                        </div>
                      )}

                      {/* AI Response Bubble */}
                      <div style={{
                        display: 'flex',
                        justifyContent: 'flex-start',
                      }}>
                        <div style={{
                          width: 36,
                          height: 36,
                          borderRadius: '50%',
                          background: 'linear-gradient(135deg, #722ed1 0%, #1890ff 100%)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          marginRight: 8,
                          flexShrink: 0,
                        }}>
                          <RobotOutlined style={{ color: 'white', fontSize: 16 }} />
                        </div>
                        <motion.div
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          style={{
                            maxWidth: '85%',
                            background: 'white',
                            borderRadius: '16px 16px 16px 4px',
                            padding: '16px 20px',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                          }}
                        >
                          {(aiQueryResponse.error || aiQueryResponse.ai_response?.error) ? (
                            <Alert
                              type="error"
                              message={aiQueryResponse.error || aiQueryResponse.ai_response?.error}
                              showIcon
                              style={{ border: 'none', background: 'transparent', padding: 0 }}
                            />
                          ) : (
                            <Space direction="vertical" size={12} style={{ width: '100%' }}>

                              {/* Main Answer - Highlighted with Markdown */}
                              <div style={{
                                background: 'linear-gradient(135deg, #f6ffed 0%, #e6fffb 100%)',
                                borderRadius: 10,
                                padding: '12px 16px',
                                borderLeft: '4px solid #52c41a',
                              }}>
                                {/* Greeting */}
                                {aiQueryResponse.response?.greeting && (
                                  <Text type="secondary" style={{ fontSize: 12, fontStyle: 'italic', display: 'block', marginBottom: 6 }}>
                                    {aiQueryResponse.response.greeting}
                                  </Text>
                                )}
                                {/* Main Answer with Markdown rendering */}
                                <div style={{ fontSize: 15, lineHeight: 1.8 }} className="ai-markdown-content">
                                  <ReactMarkdown
                                    components={{
                                      strong: ({ children }) => (
                                        <Text strong style={{ color: '#1890ff', fontSize: 'inherit' }}>{children}</Text>
                                      ),
                                      em: ({ children }) => (
                                        <Text italic style={{ fontSize: 'inherit' }}>{children}</Text>
                                      ),
                                      p: ({ children }) => (
                                        <p style={{ margin: '4px 0' }}>{children}</p>
                                      ),
                                    }}
                                  >
                                    {aiQueryResponse.response?.main_answer || aiQueryResponse.ai_response?.explanation || 'Không có kết quả'}
                                  </ReactMarkdown>
                                </div>
                                {/* Details */}
                                {aiQueryResponse.response?.details && (
                                  <div style={{ marginTop: 12, padding: '8px 12px', background: 'rgba(255,255,255,0.7)', borderRadius: 6 }}>
                                    <Text type="secondary" style={{ fontSize: 13 }}>{aiQueryResponse.response.details}</Text>
                                  </div>
                                )}

                                {/* Strategic Insight - Yellow background */}
                                {aiQueryResponse.response?.strategic_insight && (
                                  <div style={{
                                    marginTop: 12,
                                    padding: '12px 16px',
                                    background: 'linear-gradient(135deg, #fff7e6 0%, #fffbe6 100%)',
                                    borderRadius: 8,
                                    border: '1px solid #ffd591',
                                  }}>
                                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: 6 }}>
                                      <BulbOutlined style={{ color: '#fa8c16', fontSize: 16, marginRight: 8 }} />
                                      <Text strong style={{ color: '#d46b08', fontSize: 13 }}>Insight chiến lược:</Text>
                                    </div>
                                    <Text style={{ fontSize: 14, lineHeight: 1.6, display: 'block' }}>
                                      {aiQueryResponse.response.strategic_insight}
                                    </Text>
                                  </div>
                                )}

                                {/* Recommended Action - Blue background */}
                                {aiQueryResponse.response?.recommended_action && (
                                  <div style={{
                                    marginTop: 12,
                                    padding: '12px 16px',
                                    background: 'linear-gradient(135deg, #e6f7ff 0%, #f0f5ff 100%)',
                                    borderRadius: 8,
                                    border: '1px solid #91caff',
                                  }}>
                                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: 6 }}>
                                      <RightCircleOutlined style={{ color: '#1890ff', fontSize: 16, marginRight: 8 }} />
                                      <Text strong style={{ color: '#0958d9', fontSize: 13 }}>Đề xuất hành động:</Text>
                                    </div>
                                    <Text style={{ fontSize: 14, lineHeight: 1.6, display: 'block' }}>
                                      {aiQueryResponse.response.recommended_action}
                                    </Text>
                                  </div>
                                )}

                                {/* System List Table with Clickable Links */}
                                {aiQueryResponse.data && aiQueryResponse.data.rows.length > 0 &&
                                 aiQueryResponse.data.columns.some((col: string) =>
                                   ['system_name', 'tên hệ thống', 'ten_he_thong'].includes(col.toLowerCase())
                                 ) && (
                                  <div style={{ marginTop: 12 }} className="ai-system-list-table">
                                    <Text type="secondary" style={{ fontSize: 12, marginBottom: 8, display: 'block' }}>
                                      <UnorderedListOutlined style={{ marginRight: 6 }} />
                                      Danh sách {aiQueryResponse.data.rows.length} hệ thống:
                                    </Text>
                                    <table style={{
                                      width: '100%',
                                      borderCollapse: 'collapse',
                                      fontSize: 13,
                                      background: '#fff',
                                      borderRadius: 8,
                                      overflow: 'hidden',
                                    }}>
                                      <thead style={{ background: '#e6f7ff' }}>
                                        <tr>
                                          <th style={{ padding: '8px 12px', borderBottom: '2px solid #91caff', textAlign: 'center', fontWeight: 600, color: '#1677ff', width: 50 }}>STT</th>
                                          <th style={{ padding: '8px 12px', borderBottom: '2px solid #91caff', textAlign: 'left', fontWeight: 600, color: '#1677ff' }}>Tên hệ thống</th>
                                          {aiQueryResponse.data.columns.some((col: string) => ['name', 'org_name', 'tên đơn vị'].includes(col.toLowerCase())) && (
                                            <th style={{ padding: '8px 12px', borderBottom: '2px solid #91caff', textAlign: 'left', fontWeight: 600, color: '#1677ff' }}>Đơn vị</th>
                                          )}
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {aiQueryResponse.data.rows.map((row: any, idx: number) => {
                                          const systemId = row.id || row.system_id;
                                          const systemName = row.system_name || row['tên hệ thống'] || row.ten_he_thong || '';
                                          const orgName = row.name || row.org_name || row['tên đơn vị'] || '';
                                          const hasOrgColumn = aiQueryResponse.data!.columns.some((col: string) => ['name', 'org_name', 'tên đơn vị'].includes(col.toLowerCase()));

                                          return (
                                            <tr key={idx} style={{ background: idx % 2 === 0 ? '#fff' : '#fafafa' }}>
                                              <td style={{ padding: '6px 12px', borderBottom: '1px solid #f0f0f0', textAlign: 'center', color: '#8c8c8c' }}>{idx + 1}</td>
                                              <td style={{ padding: '6px 12px', borderBottom: '1px solid #f0f0f0' }}>
                                                {systemId ? (
                                                  <a
                                                    href={`/systems/${systemId}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    style={{ color: '#1677ff', textDecoration: 'none' }}
                                                    onClick={(e) => {
                                                      e.preventDefault();
                                                      window.open(`/systems/${systemId}`, '_blank');
                                                    }}
                                                  >
                                                    {systemName} <LinkOutlined style={{ fontSize: 11, marginLeft: 4 }} />
                                                  </a>
                                                ) : systemName}
                                              </td>
                                              {hasOrgColumn && (
                                                <td style={{ padding: '6px 12px', borderBottom: '1px solid #f0f0f0', color: '#595959' }}>{orgName}</td>
                                              )}
                                            </tr>
                                          );
                                        })}
                                      </tbody>
                                    </table>
                                  </div>
                                )}
                              </div>

                              {/* Visual Data Display */}
                              {aiQueryResponse.data && aiQueryResponse.data.rows.length > 0 && (
                                <div style={{
                                  background: '#fafafa',
                                  borderRadius: 10,
                                  padding: '12px 16px',
                                }}>
                                  {/* Single number display (e.g., COUNT result) */}
                                  {aiQueryResponse.data.rows.length === 1 && aiQueryResponse.data.columns.length === 1 && (
                                    <div style={{ textAlign: 'center', padding: '12px 0' }}>
                                      <Text style={{ fontSize: 32, fontWeight: 700, color: '#722ed1' }}>
                                        {Object.values(aiQueryResponse.data.rows[0])[0]?.toLocaleString() || '0'}
                                      </Text>
                                      <Text type="secondary" style={{ display: 'block', fontSize: 13, marginTop: 4 }}>
                                        {aiQueryResponse.response?.chart_config?.unit || getVietnameseUnit(aiQueryResponse.data.columns[0])}
                                      </Text>
                                    </div>
                                  )}

                                  {/* Multi-row data display */}
                                  {(aiQueryResponse.data.rows.length > 1 || aiQueryResponse.data.columns.length > 1) && (
                                    <>
                                      <Text type="secondary" style={{ fontSize: 12, marginBottom: 8, display: 'block' }}>
                                        <LineChartOutlined style={{ marginRight: 6 }} />
                                        Chi tiết dữ liệu ({Math.min(aiQueryResponse.data.rows.length, 5)} / {aiQueryResponse.data.total_rows} kết quả)
                                        {aiQueryResponse.response?.chart_config?.unit && (
                                          <Tag color="blue" style={{ marginLeft: 8, fontSize: 11 }}>
                                            Đơn vị: {getVietnameseUnit(aiQueryResponse.response.chart_config.unit)}
                                          </Tag>
                                        )}
                                      </Text>

                                      {/* Simple Visual Bars for numeric data */}
                                      {aiQueryResponse.data.rows.slice(0, 5).map((row: any, idx: number) => {
                                        const chartConfig = aiQueryResponse.response?.chart_config;
                                        const columns = aiQueryResponse.data!.columns;

                                        // Smart label detection: prioritize name columns over IDs
                                        let label = '';
                                        if (chartConfig?.x_field && row[chartConfig.x_field] !== undefined) {
                                          label = String(row[chartConfig.x_field]);
                                        } else {
                                          // Priority order for label columns (most specific to least)
                                          const labelPriority = [
                                            'system_name', 'tên hệ thống', 'ten_he_thong',
                                            'name', 'tên', 'ten',
                                            'org_name', 'tên đơn vị', 'ten_don_vi',
                                            'title', 'tiêu đề'
                                          ];

                                          // Find best matching column for label
                                          let labelCol = columns.find(col =>
                                            labelPriority.some(p => col.toLowerCase().includes(p))
                                          );

                                          // If no name column, find first string column (but not 'id' columns)
                                          if (!labelCol) {
                                            labelCol = columns.find(col =>
                                              typeof row[col] === 'string' &&
                                              !col.toLowerCase().includes('id') &&
                                              !col.toLowerCase().includes('code')
                                            );
                                          }

                                          // Fall back to first column if nothing else works
                                          if (!labelCol) {
                                            labelCol = columns[0];
                                          }

                                          label = row[labelCol] || `Dòng ${idx + 1}`;
                                        }

                                        // Smart value detection: use y_field from config, or first numeric column (but not 'id')
                                        let numericValue: number | undefined;
                                        if (chartConfig?.y_field && typeof row[chartConfig.y_field] === 'number') {
                                          numericValue = row[chartConfig.y_field];
                                        } else {
                                          // Find first numeric column that's not an ID
                                          const numCol = columns.find(col =>
                                            typeof row[col] === 'number' &&
                                            !col.toLowerCase().includes('id')
                                          );
                                          numericValue = numCol ? row[numCol] : undefined;
                                        }

                                        // Calculate max value excluding ID columns
                                        const maxVal = Math.max(...aiQueryResponse.data!.rows.slice(0, 5).map((r: any) => {
                                          if (chartConfig?.y_field) return r[chartConfig.y_field] || 0;
                                          // Get numeric values except from ID columns
                                          const numericValues = Object.entries(r)
                                            .filter(([key, val]) =>
                                              typeof val === 'number' &&
                                              !key.toLowerCase().includes('id')
                                            )
                                            .map(([, val]) => val as number);
                                          return numericValues.length > 0 ? Math.max(...numericValues) : 0;
                                        }), 1);
                                        const unit = chartConfig?.unit || '';

                                        return (
                                          <div key={idx} style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 12,
                                            marginBottom: idx < 4 ? 8 : 0,
                                            padding: '6px 0',
                                          }}>
                                            <Text style={{ minWidth: 150, fontSize: 13, flex: '0 0 auto' }} ellipsis title={label}>
                                              {label}
                                            </Text>
                                            <div style={{
                                              flex: 1,
                                              height: 24,
                                              background: '#e8e8e8',
                                              borderRadius: 4,
                                              overflow: 'hidden',
                                            }}>
                                              {numericValue !== undefined && numericValue > 0 && (
                                                <motion.div
                                                  initial={{ width: 0 }}
                                                  animate={{ width: `${Math.max((numericValue / maxVal) * 100, 8)}%` }}
                                                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                                                  style={{
                                                    height: '100%',
                                                    background: `linear-gradient(90deg, ${COLORS[idx % COLORS.length]}88, ${COLORS[idx % COLORS.length]})`,
                                                    borderRadius: 4,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'flex-end',
                                                    paddingRight: 8,
                                                  }}
                                                >
                                                  <Text style={{ fontSize: 12, color: 'white', fontWeight: 600 }}>
                                                    {numericValue.toLocaleString()}{unit ? ` ${unit}` : ''}
                                                  </Text>
                                                </motion.div>
                                              )}
                                              {(numericValue === undefined || numericValue === 0) && (
                                                <div style={{ padding: '4px 8px' }}>
                                                  <Text style={{ fontSize: 12, color: '#999' }}>0{unit ? ` ${unit}` : ''}</Text>
                                                </div>
                                              )}
                                            </div>
                                          </div>
                                        );
                                      })}

                                      {aiQueryResponse.data.rows.length > 5 && (
                                        <Button
                                          type="primary"
                                          size="small"
                                          onClick={() => {
                                            setDataModalVisible(true);
                                          }}
                                          style={{ marginTop: 8, borderRadius: 16 }}
                                          icon={<EyeOutlined />}
                                        >
                                          Xem đầy đủ {aiQueryResponse.data.total_rows} kết quả
                                        </Button>
                                      )}
                                    </>
                                  )}
                                </div>
                              )}

                              {/* Follow-up Suggestions - Truncated & Auto-send */}
                              <div>
                                <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 8 }}>
                                  <QuestionCircleOutlined style={{ marginRight: 6, color: '#722ed1' }} />
                                  Câu hỏi gợi ý (nhấn để hỏi):
                                </Text>
                                <Space wrap size={[6, 6]}>
                                  {(aiQueryResponse.response?.follow_up_suggestions && aiQueryResponse.response.follow_up_suggestions.length > 0
                                    ? aiQueryResponse.response.follow_up_suggestions
                                    : [
                                        'Hệ thống nào cần ưu tiên nâng cấp?',
                                        'Đơn vị nào có rủi ro CNTT cao?',
                                        'Hiệu quả đầu tư CNTT của các đơn vị?',
                                      ]
                                  ).map((suggestion, idx) => (
                                      <Tag
                                        key={idx}
                                        title={suggestion}
                                        style={{
                                          cursor: 'pointer',
                                          borderRadius: 16,
                                          padding: '6px 14px',
                                          background: 'linear-gradient(135deg, #f9f0ff 0%, #efdbff 100%)',
                                          borderColor: '#d3adf7',
                                          color: '#531dab',
                                          fontSize: 13,
                                          lineHeight: 1.4,
                                          whiteSpace: 'normal',
                                          display: 'inline-block',
                                          maxWidth: '100%',
                                        }}
                                        onClick={() => {
                                          // Auto-send on click
                                          setAiQuery(suggestion);
                                          setTimeout(() => {
                                            const submitButton = document.querySelector('.ai-submit-btn') as HTMLButtonElement;
                                            if (submitButton) submitButton.click();
                                          }, 100);
                                        }}
                                      >
                                        💡 {suggestion}
                                      </Tag>
                                    ))}
                                </Space>
                              </div>
                            </Space>
                          )}
                        </motion.div>
                      </div>
                    </div>
                  )}

                  {/* Input Area - Enhanced */}
                  <div style={{
                    background: 'linear-gradient(135deg, #ffffff 0%, #f9f0ff 100%)',
                    borderRadius: 16,
                    padding: '12px 16px',
                    boxShadow: '0 4px 12px rgba(114, 46, 209, 0.15)',
                    border: '2px solid #d3adf7',
                    transition: 'all 0.3s ease',
                  }}>
                    <div style={{ marginBottom: 8 }}>
                      <Space>
                        <RobotOutlined style={{ color: '#722ed1', fontSize: 16 }} />
                        <Text style={{ color: '#722ed1', fontSize: 13, fontWeight: 500 }}>
                          Nhập câu hỏi bằng tiếng Việt tự nhiên
                        </Text>
                      </Space>
                    </div>
                    <Input.Search
                      placeholder="Ví dụ: 'Có bao nhiêu hệ thống?' hoặc 'Đơn vị nào có nhiều hệ thống nhất?'"
                      value={aiQuery}
                      onChange={(e) => setAiQuery(e.target.value)}
                      onSearch={handleAIQuery}
                      enterButton={
                        <Button
                          type="primary"
                          icon={<SendOutlined />}
                          loading={aiQueryLoading}
                          className="ai-submit-btn"
                          style={{
                            background: 'linear-gradient(135deg, #722ed1 0%, #1890ff 100%)',
                            border: 'none',
                            borderRadius: 10,
                            height: 44,
                            paddingLeft: 24,
                            paddingRight: 24,
                            fontWeight: 500,
                            fontSize: 14,
                          }}
                        >
                          Hỏi AI ✨
                        </Button>
                      }
                      size="large"
                      style={{
                        border: 'none',
                        boxShadow: 'none',
                      }}
                    />
                    <div style={{ marginTop: 8, textAlign: 'center' }}>
                      <Text type="secondary" style={{ fontSize: 11 }}>
                        💡 Mẹo: Nhấn Enter để gửi nhanh
                      </Text>
                    </div>
                  </div>

                  {/* Recent Queries */}
                  {aiQueryHistory.length > 0 && !aiQueryResponse && (
                    <div style={{ marginTop: 12 }}>
                      <Space wrap size={[6, 6]}>
                        <HistoryOutlined style={{ color: '#8c8c8c' }} />
                        <Text type="secondary" style={{ fontSize: 12 }}>Gần đây:</Text>
                        {aiQueryHistory.slice(0, 4).map((q, idx) => (
                          <Tag
                            key={idx}
                            style={{
                              cursor: 'pointer',
                              fontSize: 12,
                              borderRadius: 8,
                              background: 'white',
                              border: '1px solid #d9d9d9',
                            }}
                            onClick={() => setAiQuery(q)}
                          >
                            {q.length > 30 ? q.substring(0, 30) + '...' : q}
                          </Tag>
                        ))}
                      </Space>
                    </div>
                  )}
                </div>
              </div>
            )}
            </div>
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
                  extra={<Text type="secondary">Click biểu đồ hoặc chú thích để xem chi tiết</Text>}
                >
                  <ResponsiveContainer width="100%" height={280}>
                    <PieChart>
                      <Pie
                        data={statusChartData}
                        cx="50%"
                        cy="40%"
                        innerRadius={50}
                        outerRadius={70}
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
                      <Legend
                        wrapperStyle={{ cursor: 'pointer' }}
                        onClick={(e) => {
                          // eslint-disable-next-line @typescript-eslint/no-explicit-any
                          const payload = e.payload as any;
                          const filterKey = payload?.filterKey;
                          if (filterKey) {
                            handleDrilldown('status', filterKey, `Hệ thống ${STATUS_LABELS[filterKey] || filterKey}`);
                          }
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </Card>
              </Col>

              <Col xs={24} md={12}>
                <Card
                  title="Phân bổ theo mức độ quan trọng"
                  style={{ borderRadius: borderRadius.md }}
                  extra={<Text type="secondary">Click biểu đồ hoặc chú thích để xem chi tiết</Text>}
                >
                  <ResponsiveContainer width="100%" height={280}>
                    <PieChart>
                      <Pie
                        data={criticalityChartData}
                        cx="50%"
                        cy="40%"
                        innerRadius={50}
                        outerRadius={70}
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
                      <Legend
                        wrapperStyle={{ cursor: 'pointer' }}
                        onClick={(e) => {
                          // eslint-disable-next-line @typescript-eslint/no-explicit-any
                          const payload = e.payload as any;
                          const filterKey = payload?.filterKey;
                          if (filterKey) {
                            handleDrilldown('criticality', filterKey, `Hệ thống mức độ ${CRITICALITY_LABELS[filterKey] || filterKey}`);
                          }
                        }}
                      />
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

          {/* Tab 5: Roadmap - Digital Transformation Phases */}
          <TabPane
            tab={
              <span>
                <ScheduleOutlined />
                Lộ trình CĐS
              </span>
            }
            key="roadmap"
          >
            <Row gutter={[24, 24]}>
              {!roadmapStats ? (
                <Col xs={24}>
                  <Skeleton active paragraph={{ rows: 8 }} />
                </Col>
              ) : (
                <>
                  {/* Phase Overview Cards */}
                  <Col xs={24}>
                    <Alert
                      type="info"
                      message="Lộ trình Chuyển đổi số theo Kiến trúc tổng thể Bộ KH&CN"
                      description="Hệ thống được phân loại theo 3 giai đoạn dựa trên mức độ sẵn sàng và các cải tiến cần thiết."
                      showIcon
                      icon={<RocketOutlined />}
                    />
                  </Col>

                  <Col xs={24} sm={12} lg={6}>
                    <Card
                      style={{
                        borderRadius: borderRadius.md,
                        borderLeft: '4px solid #f5222d',
                        background: '#fff2f0',
                      }}
                    >
                      <Statistic
                        title={
                          <Space>
                            <ClockCircleOutlined style={{ color: '#f5222d' }} />
                            <span>GĐ1: Xây móng (2026)</span>
                          </Space>
                        }
                        value={roadmapStats.summary.phase1.count}
                        suffix={`/ ${roadmapStats.total_systems}`}
                        valueStyle={{ color: '#f5222d' }}
                      />
                      <Progress
                        percent={roadmapStats.summary.phase1.percentage}
                        strokeColor="#f5222d"
                        size="small"
                        format={() => `${roadmapStats.summary.phase1.percentage}%`}
                      />
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        {roadmapStats.summary.phase1.description}
                      </Text>
                    </Card>
                  </Col>

                  <Col xs={24} sm={12} lg={6}>
                    <Card
                      style={{
                        borderRadius: borderRadius.md,
                        borderLeft: '4px solid #fa8c16',
                        background: '#fffbe6',
                      }}
                    >
                      <Statistic
                        title={
                          <Space>
                            <DeploymentUnitOutlined style={{ color: '#fa8c16' }} />
                            <span>GĐ2: Chuẩn hóa (2027-28)</span>
                          </Space>
                        }
                        value={roadmapStats.summary.phase2.count}
                        suffix={`/ ${roadmapStats.total_systems}`}
                        valueStyle={{ color: '#fa8c16' }}
                      />
                      <Progress
                        percent={roadmapStats.summary.phase2.percentage}
                        strokeColor="#fa8c16"
                        size="small"
                        format={() => `${roadmapStats.summary.phase2.percentage}%`}
                      />
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        {roadmapStats.summary.phase2.description}
                      </Text>
                    </Card>
                  </Col>

                  <Col xs={24} sm={12} lg={6}>
                    <Card
                      style={{
                        borderRadius: borderRadius.md,
                        borderLeft: '4px solid #1890ff',
                        background: '#e6f7ff',
                      }}
                    >
                      <Statistic
                        title={
                          <Space>
                            <LineChartOutlined style={{ color: '#1890ff' }} />
                            <span>GĐ3: Tối ưu (2029-30)</span>
                          </Space>
                        }
                        value={roadmapStats.summary.phase3.count}
                        suffix={`/ ${roadmapStats.total_systems}`}
                        valueStyle={{ color: '#1890ff' }}
                      />
                      <Progress
                        percent={roadmapStats.summary.phase3.percentage}
                        strokeColor="#1890ff"
                        size="small"
                        format={() => `${roadmapStats.summary.phase3.percentage}%`}
                      />
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        {roadmapStats.summary.phase3.description}
                      </Text>
                    </Card>
                  </Col>

                  <Col xs={24} sm={12} lg={6}>
                    <Card
                      style={{
                        borderRadius: borderRadius.md,
                        borderLeft: '4px solid #52c41a',
                        background: '#f6ffed',
                      }}
                    >
                      <Statistic
                        title={
                          <Space>
                            <CheckCircleOutlined style={{ color: '#52c41a' }} />
                            <span>Hoàn thành</span>
                          </Space>
                        }
                        value={roadmapStats.summary.completed.count}
                        suffix={`/ ${roadmapStats.total_systems}`}
                        valueStyle={{ color: '#52c41a' }}
                      />
                      <Progress
                        percent={roadmapStats.summary.completed.percentage}
                        strokeColor="#52c41a"
                        size="small"
                        format={() => `${roadmapStats.summary.completed.percentage}%`}
                      />
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        {roadmapStats.summary.completed.description}
                      </Text>
                    </Card>
                  </Col>

                  {/* Improvement Actions Summary */}
                  <Col xs={24} lg={12}>
                    <Card
                      title={
                        <Space>
                          <FlagOutlined style={{ color: '#722ed1' }} />
                          <span>Các cải tiến cần thực hiện</span>
                        </Space>
                      }
                      style={{ borderRadius: borderRadius.md }}
                    >
                      <Table
                        dataSource={roadmapStats.improvement_actions.map((action, idx) => ({
                          key: idx,
                          ...action,
                        }))}
                        columns={[
                          {
                            title: 'Hành động',
                            dataIndex: 'action',
                            key: 'action',
                            render: (action: string, record: any) => (
                              <Space>
                                {record.phase === 1 && <CloudOutlined style={{ color: '#f5222d' }} />}
                                {record.phase === 2 && <CodeOutlined style={{ color: '#fa8c16' }} />}
                                {record.phase === 3 && <SecurityScanOutlined style={{ color: '#1890ff' }} />}
                                <span>{action}</span>
                              </Space>
                            ),
                          },
                          {
                            title: 'Giai đoạn',
                            dataIndex: 'phase',
                            key: 'phase',
                            width: 100,
                            render: (phase: number) => (
                              <Tag
                                color={phase === 1 ? 'red' : phase === 2 ? 'orange' : 'blue'}
                              >
                                GĐ {phase}
                              </Tag>
                            ),
                          },
                          {
                            title: 'Số HT cần làm',
                            dataIndex: 'count',
                            key: 'count',
                            width: 100,
                            render: (count: number) => (
                              <Badge
                                count={count}
                                style={{ backgroundColor: count > 50 ? '#f5222d' : count > 20 ? '#fa8c16' : '#1890ff' }}
                                overflowCount={999}
                              />
                            ),
                          },
                        ]}
                        pagination={false}
                        size="small"
                      />
                    </Card>
                  </Col>

                  {/* Timeline View */}
                  <Col xs={24} lg={12}>
                    <Card
                      title={
                        <Space>
                          <ScheduleOutlined style={{ color: '#1890ff' }} />
                          <span>Timeline Chuyển đổi số</span>
                        </Space>
                      }
                      style={{ borderRadius: borderRadius.md }}
                    >
                      <Timeline
                        mode="left"
                        items={[
                          {
                            color: 'red',
                            label: '2026',
                            children: (
                              <div>
                                <Text strong>Giai đoạn 1: Xây móng - Hội tụ dữ liệu</Text>
                                <br />
                                <Text type="secondary">
                                  Cloud migration, API Gateway, SSL/TLS
                                </Text>
                                <br />
                                <Tag color="red">{roadmapStats.summary.phase1.count} hệ thống</Tag>
                              </div>
                            ),
                          },
                          {
                            color: 'orange',
                            label: '2027-2028',
                            children: (
                              <div>
                                <Text strong>Giai đoạn 2: Chuẩn hóa - Tích hợp sâu</Text>
                                <br />
                                <Text type="secondary">
                                  CI/CD, Documentation, Monitoring, Logging
                                </Text>
                                <br />
                                <Tag color="orange">{roadmapStats.summary.phase2.count} hệ thống</Tag>
                              </div>
                            ),
                          },
                          {
                            color: 'blue',
                            label: '2029-2030',
                            children: (
                              <div>
                                <Text strong>Giai đoạn 3: Tối ưu - Thông minh hóa</Text>
                                <br />
                                <Text type="secondary">
                                  Data encryption, AI integration, Open data
                                </Text>
                                <br />
                                <Tag color="blue">{roadmapStats.summary.phase3.count} hệ thống</Tag>
                              </div>
                            ),
                          },
                          {
                            color: 'green',
                            label: 'Đạt chuẩn',
                            children: (
                              <div>
                                <Text strong>Hoàn thành Chuyển đổi số</Text>
                                <br />
                                <Text type="secondary">
                                  Đáp ứng tất cả tiêu chí kiến trúc hiện đại
                                </Text>
                                <br />
                                <Tag color="green">{roadmapStats.summary.completed.count} hệ thống</Tag>
                              </div>
                            ),
                          },
                        ]}
                      />
                    </Card>
                  </Col>

                  {/* Priority Systems per Phase */}
                  <Col xs={24}>
                    <Card
                      title={
                        <Space>
                          <AlertOutlined style={{ color: '#f5222d' }} />
                          <span>Hệ thống ưu tiên theo giai đoạn</span>
                        </Space>
                      }
                      style={{ borderRadius: borderRadius.md }}
                    >
                      <Collapse defaultActiveKey={['1']}>
                        <Panel
                          header={
                            <Space>
                              <Tag color="red">GĐ1</Tag>
                              <span>Hệ thống cần Cloud migration & API Gateway ({roadmapStats.top_priorities.phase1.length})</span>
                            </Space>
                          }
                          key="1"
                        >
                          <Table
                            dataSource={roadmapStats.top_priorities.phase1}
                            columns={[
                              { title: 'Hệ thống', dataIndex: 'name', key: 'name', ellipsis: true },
                              { title: 'Đơn vị', dataIndex: 'org_name', key: 'org_name', width: 200, ellipsis: true },
                              {
                                title: 'Mức độ QT',
                                dataIndex: 'criticality',
                                key: 'criticality',
                                width: 100,
                                render: (c: string) => (
                                  <Tag color={CRITICALITY_COLORS[c]}>{CRITICALITY_LABELS[c]}</Tag>
                                ),
                              },
                              {
                                title: 'Cần làm',
                                dataIndex: 'improvements_needed',
                                key: 'improvements',
                                render: (improvements: any[]) => (
                                  <Space wrap>
                                    {improvements.filter(i => i.phase === 1).map((i, idx) => (
                                      <Tag key={idx} color="red">{i.action}</Tag>
                                    ))}
                                  </Space>
                                ),
                              },
                            ]}
                            pagination={false}
                            size="small"
                            rowKey="id"
                          />
                        </Panel>
                        <Panel
                          header={
                            <Space>
                              <Tag color="orange">GĐ2</Tag>
                              <span>Hệ thống cần CI/CD & Documentation ({roadmapStats.top_priorities.phase2.length})</span>
                            </Space>
                          }
                          key="2"
                        >
                          <Table
                            dataSource={roadmapStats.top_priorities.phase2}
                            columns={[
                              { title: 'Hệ thống', dataIndex: 'name', key: 'name', ellipsis: true },
                              { title: 'Đơn vị', dataIndex: 'org_name', key: 'org_name', width: 200, ellipsis: true },
                              {
                                title: 'Mức độ QT',
                                dataIndex: 'criticality',
                                key: 'criticality',
                                width: 100,
                                render: (c: string) => (
                                  <Tag color={CRITICALITY_COLORS[c]}>{CRITICALITY_LABELS[c]}</Tag>
                                ),
                              },
                              {
                                title: 'Cần làm',
                                dataIndex: 'improvements_needed',
                                key: 'improvements',
                                render: (improvements: any[]) => (
                                  <Space wrap>
                                    {improvements.filter(i => i.phase === 2).map((i, idx) => (
                                      <Tag key={idx} color="orange">{i.action}</Tag>
                                    ))}
                                  </Space>
                                ),
                              },
                            ]}
                            pagination={false}
                            size="small"
                            rowKey="id"
                          />
                        </Panel>
                        <Panel
                          header={
                            <Space>
                              <Tag color="blue">GĐ3</Tag>
                              <span>Hệ thống cần Data Encryption & AI ({roadmapStats.top_priorities.phase3.length})</span>
                            </Space>
                          }
                          key="3"
                        >
                          <Table
                            dataSource={roadmapStats.top_priorities.phase3}
                            columns={[
                              { title: 'Hệ thống', dataIndex: 'name', key: 'name', ellipsis: true },
                              { title: 'Đơn vị', dataIndex: 'org_name', key: 'org_name', width: 200, ellipsis: true },
                              {
                                title: 'Mức độ QT',
                                dataIndex: 'criticality',
                                key: 'criticality',
                                width: 100,
                                render: (c: string) => (
                                  <Tag color={CRITICALITY_COLORS[c]}>{CRITICALITY_LABELS[c]}</Tag>
                                ),
                              },
                              {
                                title: 'Cần làm',
                                dataIndex: 'improvements_needed',
                                key: 'improvements',
                                render: (improvements: any[]) => (
                                  <Space wrap>
                                    {improvements.filter(i => i.phase === 3).map((i, idx) => (
                                      <Tag key={idx} color="blue">{i.action}</Tag>
                                    ))}
                                  </Space>
                                ),
                              },
                            ]}
                            pagination={false}
                            size="small"
                            rowKey="id"
                          />
                        </Panel>
                      </Collapse>
                    </Card>
                  </Col>
                </>
              )}
            </Row>
          </TabPane>

          {/* Tab 6: Insights - Rule-based + AI Query */}
          <TabPane
            tab={
              <span>
                <BulbOutlined />
                Phân tích
              </span>
            }
            key="insights"
          >
            <Row gutter={[24, 24]}>
              {/* AI Query Section */}
              <Col xs={24}>
                <Card
                  title={
                    <Space>
                      <RobotOutlined style={{ color: '#722ed1' }} />
                      <span>Trợ lý AI - Hỏi đáp dữ liệu</span>
                    </Space>
                  }
                  style={{
                    borderRadius: borderRadius.md,
                    background: 'linear-gradient(135deg, #f9f0ff 0%, #efdbff 100%)',
                    border: '1px solid #d3adf7',
                  }}
                >
                  <Row gutter={[16, 16]}>
                    <Col xs={24}>
                      <TextArea
                        placeholder="Hỏi bất kỳ câu hỏi nào về dữ liệu hệ thống... Ví dụ: 'Có bao nhiêu hệ thống đang dùng Java?', 'Đơn vị nào có nhiều hệ thống nhất?', 'Tỷ lệ hệ thống đã lên Cloud là bao nhiêu?'"
                        value={aiQuery}
                        onChange={(e) => setAiQuery(e.target.value)}
                        onPressEnter={(e) => {
                          if (!e.shiftKey) {
                            e.preventDefault();
                            handleAIQuery();
                          }
                        }}
                        rows={2}
                        style={{ fontSize: 14 }}
                      />
                    </Col>
                    <Col xs={24}>
                      <Space wrap>
                        <Button
                          type="primary"
                          icon={<SendOutlined />}
                          loading={aiQueryLoading}
                          onClick={handleAIQuery}
                          className="ai-submit-btn"
                          style={{ background: '#722ed1', borderColor: '#722ed1' }}
                        >
                          Hỏi AI
                        </Button>
                        {aiQueryHistory.length > 0 && (
                          <Space>
                            <HistoryOutlined />
                            {aiQueryHistory.slice(0, 3).map((q, idx) => (
                              <Tag
                                key={idx}
                                style={{ cursor: 'pointer' }}
                                onClick={() => setAiQuery(q)}
                              >
                                {q.length > 30 ? q.substring(0, 30) + '...' : q}
                              </Tag>
                            ))}
                          </Space>
                        )}
                      </Space>
                    </Col>

                    {/* AI Response - Progressive Loading (Claude Code Style) */}
                    {(aiQueryLoading || (aiQueryResponse && aiProgressTasks.length > 0)) && (
                      <Col xs={24}>
                        <Card
                          size="small"
                          style={{
                            background: 'linear-gradient(135deg, #f9f0ff 0%, #efdbff 100%)',
                            borderRadius: 12,
                            border: '1px solid #d3adf7',
                          }}
                        >
                          <Row gutter={[16, 16]} align="middle">
                            {/* Left: Robot icon */}
                            <Col xs={24} md={3} style={{ textAlign: 'center' }}>
                              <div style={{ position: 'relative', display: 'inline-block' }}>
                                <RobotOutlined style={{ fontSize: 40, color: '#722ed1' }} />
                                <SyncOutlined spin style={{
                                  fontSize: 14,
                                  color: '#722ed1',
                                  position: 'absolute',
                                  top: -3,
                                  right: -8,
                                }} />
                              </div>
                            </Col>

                            {/* Right: Progress tasks */}
                            <Col xs={24} md={21}>
                              {/* Backlog Header */}
                              {aiProgressTasks.length > 0 && (
                                <div style={{ marginBottom: 10 }}>
                                  <Text type="secondary" style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                                    TIẾN ĐỘ ({aiProgressTasks.filter(t => t.status === 'completed').length}/{aiProgressTasks.length})
                                  </Text>
                                </div>
                              )}

                              {/* Task List - append progressively */}
                              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                                {aiProgressTasks.map((task) => (
                                  <motion.div
                                    key={task.id}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.2 }}
                                    style={{
                                      padding: '10px 12px',
                                      background: task.status === 'in_progress' ? 'rgba(114, 46, 209, 0.08)' : 'rgba(0, 0, 0, 0.02)',
                                      borderRadius: 8,
                                      border: task.status === 'in_progress' ? '1px solid rgba(114, 46, 209, 0.2)' : '1px solid transparent',
                                      transition: 'all 0.2s ease',
                                    }}
                                  >
                                    {/* Primary Row: Icon + Name + Duration */}
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: task.description || task.status === 'completed' ? 6 : 0 }}>
                                      {task.status === 'completed' ? (
                                        <CheckCircleOutlined style={{ color: '#52c41a', fontSize: 14, flexShrink: 0 }} />
                                      ) : (
                                        <SyncOutlined spin style={{ color: '#722ed1', fontSize: 14, flexShrink: 0 }} />
                                      )}
                                      <Text
                                        style={{
                                          fontSize: 13,
                                          flex: 1,
                                          textDecoration: task.status === 'completed' ? 'line-through' : 'none',
                                          color: task.status === 'completed' ? '#8c8c8c' : '#262626',
                                          fontWeight: task.status === 'in_progress' ? 500 : 400,
                                        }}
                                      >
                                        {task.name}
                                      </Text>
                                      {task.duration && (
                                        <Tag color={task.status === 'completed' ? 'success' : 'processing'} style={{ fontSize: 11, margin: 0, padding: '0 6px', height: 18 }}>
                                          {task.duration}
                                        </Tag>
                                      )}
                                      {task.status === 'in_progress' && !task.duration && (
                                        <Spin size="small" />
                                      )}
                                    </div>

                                    {/* Secondary Row: Description for in-progress tasks */}
                                    {task.description && task.status === 'in_progress' && (
                                      <div style={{ marginLeft: 22, marginTop: 4 }}>
                                        <Text style={{ fontSize: 12, color: '#595959' }}>
                                          {task.description}
                                        </Text>
                                      </div>
                                    )}

                                    {/* Tertiary Row: Phase-specific details for completed tasks */}
                                    {task.status === 'completed' && (
                                      <div style={{ marginLeft: 22, marginTop: 6, display: 'flex', flexDirection: 'column', gap: 4 }}>
                                        {/* SQL Preview for Phase 1 */}
                                        {task.sqlPreview && (
                                          <div style={{ 
                                            background: '#f6f6f6', 
                                            padding: '6px 8px', 
                                            borderRadius: 4,
                                            border: '1px solid #e8e8e8',
                                            fontSize: 11,
                                            fontFamily: 'Monaco, Consolas, monospace',
                                            color: '#d73a49',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            whiteSpace: 'nowrap'
                                          }}>
                                            {task.sqlPreview}
                                          </div>
                                        )}

                                        {/* Result Count for Phase 2 */}
                                        {task.resultCount !== undefined && (
                                          <Tag color="blue" style={{ fontSize: 11, width: 'fit-content' }}>
                                            Found {task.resultCount} rows
                                          </Tag>
                                        )}

                                        {/* Review Status for Phase 4 */}
                                        {task.reviewPassed !== undefined && (
                                          <Tag color={task.reviewPassed ? 'success' : 'warning'} style={{ fontSize: 11, width: 'fit-content' }}>
                                            {task.reviewPassed ? '✓ Review Passed' : '⚠ Review Issues Found'}
                                          </Tag>
                                        )}
                                      </div>
                                    )}
                                  </motion.div>
                                ))}

                                {/* Show initial loading if no tasks yet */}
                                {aiProgressTasks.length === 0 && (
                                  <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 10,
                                    padding: '6px 10px',
                                  }}>
                                    <Spin size="small" />
                                    <Text style={{ color: '#722ed1', fontSize: 13 }}>
                                      Đang khởi tạo...
                                    </Text>
                                  </div>
                                )}
                              </div>
                            </Col>
                          </Row>
                        </Card>
                      </Col>
                    )}

                    {aiQueryResponse && !aiQueryLoading && (
                      <Col xs={24}>
                        <Card
                          size="small"
                          title={
                            <Space>
                              <RobotOutlined style={{ color: '#722ed1' }} />
                              <span>Kết quả phân tích</span>
                            </Space>
                          }
                          style={{
                            borderRadius: 12,
                            boxShadow: '0 2px 8px rgba(114, 46, 209, 0.1)',
                          }}
                        >
                          {(aiQueryResponse.error || aiQueryResponse.ai_response?.error) ? (
                            <Alert
                              type="error"
                              message={aiQueryResponse.error || aiQueryResponse.ai_response?.error}
                              showIcon
                            />
                          ) : (
                            <Space direction="vertical" style={{ width: '100%' }} size={16}>
                              {/* AI Planning Tasks - Always visible */}
                              {aiQueryResponse.thinking?.tasks && aiQueryResponse.thinking.tasks.length > 0 && (
                                <div style={{
                                  padding: '12px 16px',
                                  background: 'linear-gradient(135deg, #f6ffed 0%, #e6fffb 50%, #f0f5ff 100%)',
                                  borderRadius: 10,
                                  border: '1px solid #b7eb8f',
                                }}>
                                  <div style={{ marginBottom: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <CheckCircleOutlined style={{ color: '#52c41a', fontSize: 16 }} />
                                    <Text strong style={{ fontSize: 13, color: '#389e0d' }}>
                                      AI đã phân tích qua {aiQueryResponse.thinking.tasks.length} bước:
                                    </Text>
                                  </div>
                                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                                    {aiQueryResponse.thinking.tasks.map((task, idx) => (
                                      <Tag
                                        key={task.id}
                                        color="green"
                                        style={{
                                          borderRadius: 12,
                                          padding: '4px 10px',
                                          fontSize: 12,
                                        }}
                                      >
                                        <CheckCircleOutlined style={{ marginRight: 4 }} />
                                        {idx + 1}. {task.name}
                                      </Tag>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Thinking Details - Collapsible */}
                              {aiQueryResponse.thinking && (aiQueryResponse.thinking.plan || (aiQueryResponse.thinking.sql_queries && aiQueryResponse.thinking.sql_queries.length > 0)) && (
                                <Collapse
                                  size="small"
                                  ghost
                                  style={{
                                    background: '#fafafa',
                                    borderRadius: 8,
                                  }}
                                >
                                  <Panel
                                    header={
                                      <Space>
                                        <BulbOutlined style={{ color: '#faad14' }} />
                                        <Text type="secondary">Chi tiết phân tích (kế hoạch & SQL)</Text>
                                      </Space>
                                    }
                                    key="thinking"
                                  >
                                    <Space direction="vertical" style={{ width: '100%' }} size={12}>
                                      {/* Plan */}
                                      {aiQueryResponse.thinking.plan && (
                                        <div style={{ padding: '8px 12px', background: '#fff7e6', borderRadius: 6 }}>
                                          <Text type="secondary" style={{ fontSize: 12 }}>Kế hoạch: </Text>
                                          <Text style={{ fontSize: 13 }}>{aiQueryResponse.thinking.plan}</Text>
                                        </div>
                                      )}

                                      {/* SQL Queries - Collapsed by default with better explanation */}
                                      {aiQueryResponse.thinking.sql_queries && aiQueryResponse.thinking.sql_queries.length > 0 && (
                                        <Collapse
                                          size="small"
                                          ghost
                                          defaultActiveKey={[]} // Collapsed by default
                                        >
                                          <Panel
                                            header={
                                              <Space>
                                                <CodeOutlined style={{ color: '#1890ff' }} />
                                                <Text type="secondary" style={{ fontSize: 12 }}>
                                                  Xem truy vấn SQL đã sử dụng ({aiQueryResponse.thinking.sql_queries.length})
                                                </Text>
                                              </Space>
                                            }
                                            key="sql"
                                          >
                                            <div style={{ marginBottom: 8 }}>
                                              <Text type="secondary" style={{ fontSize: 11, fontStyle: 'italic' }}>
                                                💡 AI đã tạo và thực thi truy vấn SQL dưới đây để lấy dữ liệu từ CSDL hệ thống.
                                              </Text>
                                            </div>
                                            {aiQueryResponse.thinking?.sql_queries?.map((sql, idx) => (
                                              <div key={idx}>
                                                {(aiQueryResponse.thinking?.sql_queries?.length ?? 0) > 1 && (
                                                  <Text strong style={{ fontSize: 11, display: 'block', marginBottom: 4 }}>
                                                    Query #{idx + 1}:
                                                  </Text>
                                                )}
                                                <pre style={{
                                                  background: '#282c34',
                                                  color: '#abb2bf',
                                                  padding: '10px',
                                                  borderRadius: '6px',
                                                  overflow: 'auto',
                                                  fontSize: '11px',
                                                  marginBottom: 8,
                                                  whiteSpace: 'pre-wrap',
                                                  wordBreak: 'break-word',
                                                }}>
                                                  {sql}
                                                </pre>
                                              </div>
                                            ))}
                                          </Panel>
                                        </Collapse>
                                      )}
                                    </Space>
                                  </Panel>
                                </Collapse>
                              )}

                              {/* Main Response */}
                              <div style={{
                                padding: '16px',
                                background: 'linear-gradient(135deg, #f6ffed 0%, #e6fffb 100%)',
                                borderRadius: 10,
                                borderLeft: '4px solid #52c41a',
                              }}>
                                {/* Greeting */}
                                {aiQueryResponse.response?.greeting && (
                                  <Text type="secondary" style={{ fontSize: 13, fontStyle: 'italic', display: 'block', marginBottom: 8 }}>
                                    {aiQueryResponse.response.greeting}
                                  </Text>
                                )}

                                {/* Main Answer with Markdown rendering */}
                                <div style={{ fontSize: 15, lineHeight: 1.8 }} className="ai-markdown-content">
                                  <ReactMarkdown
                                    components={{
                                      strong: ({ children }) => (
                                        <Text strong style={{ color: '#1890ff', fontSize: 'inherit' }}>{children}</Text>
                                      ),
                                      em: ({ children }) => (
                                        <Text italic style={{ fontSize: 'inherit' }}>{children}</Text>
                                      ),
                                      p: ({ children }) => (
                                        <p style={{ margin: '4px 0' }}>{children}</p>
                                      ),
                                    }}
                                  >
                                    {aiQueryResponse.response?.main_answer || aiQueryResponse.ai_response?.explanation || 'Không có kết quả'}
                                  </ReactMarkdown>
                                </div>

                                {/* Details */}
                                {aiQueryResponse.response?.details && (
                                  <div style={{ marginTop: 12, padding: '8px 12px', background: 'rgba(255,255,255,0.7)', borderRadius: 6 }}>
                                    <Text type="secondary" style={{ fontSize: 13 }}>{aiQueryResponse.response.details}</Text>
                                  </div>
                                )}
                              </div>

                              {/* Data Table with clickable system names */}
                              {aiQueryResponse.data && aiQueryResponse.data.rows.length > 0 && (
                                <Table
                                  dataSource={aiQueryResponse.data.rows.map((row, idx) => ({
                                    key: idx,
                                    ...row,
                                  }))}
                                  columns={aiQueryResponse.data.columns.map(col => {
                                    // Check if this column is a system name column
                                    const isSystemNameCol = ['name', 'system_name', 'tên hệ thống', 'ten_he_thong', 'hệ thống'].includes(col.toLowerCase());
                                    // Check if data has ID column for linking
                                    const hasIdColumn = aiQueryResponse.data?.columns.some(c =>
                                      ['id', 'system_id', 'ma_he_thong'].includes(c.toLowerCase())
                                    );

                                    if (isSystemNameCol && hasIdColumn) {
                                      return {
                                        title: col,
                                        dataIndex: col,
                                        key: col,
                                        ellipsis: true,
                                        render: (text: string, record: Record<string, any>) => {
                                          // Find ID from record
                                          const systemId = record.id || record.system_id || record.ma_he_thong;
                                          if (systemId) {
                                            return (
                                              <a
                                                href={`/systems/${systemId}`}
                                                style={{ color: '#1890ff' }}
                                                onClick={(e) => {
                                                  e.preventDefault();
                                                  window.open(`/systems/${systemId}`, '_blank');
                                                }}
                                              >
                                                {text}
                                              </a>
                                            );
                                          }
                                          return text;
                                        },
                                      };
                                    }

                                    return {
                                      title: col,
                                      dataIndex: col,
                                      key: col,
                                      ellipsis: true,
                                    };
                                  })}
                                  pagination={{ pageSize: 5 }}
                                  size="small"
                                  scroll={{ x: 'max-content' }}
                                  style={{ marginTop: 8 }}
                                />
                              )}

                              {/* Total rows info */}
                              {aiQueryResponse.data && (
                                <Text type="secondary" style={{ fontSize: 12 }}>
                                  Hiển thị {Math.min(aiQueryResponse.data.rows.length, 100)} / {aiQueryResponse.data.total_rows} kết quả
                                </Text>
                              )}

                              {/* Follow-up Suggestions - Truncated & Auto-send */}
                              {aiQueryResponse.response?.follow_up_suggestions && aiQueryResponse.response.follow_up_suggestions.length > 0 && (
                                <div style={{
                                  padding: '12px',
                                  background: '#f5f5f5',
                                  borderRadius: 8,
                                  marginTop: 8,
                                }}>
                                  <Text type="secondary" style={{ fontSize: 12, marginBottom: 8, display: 'block' }}>
                                    <QuestionCircleOutlined style={{ marginRight: 6 }} />
                                    Câu hỏi gợi ý (nhấn để hỏi):
                                  </Text>
                                  <Space wrap size={[6, 6]}>
                                    {aiQueryResponse.response.follow_up_suggestions.map((suggestion, idx) => (
                                        <Tag
                                          key={idx}
                                          title={suggestion}
                                          style={{
                                            cursor: 'pointer',
                                            borderRadius: 16,
                                            padding: '6px 14px',
                                            background: 'linear-gradient(135deg, #f9f0ff 0%, #efdbff 100%)',
                                            borderColor: '#d3adf7',
                                            color: '#531dab',
                                            fontSize: 13,
                                            lineHeight: 1.4,
                                            whiteSpace: 'normal',
                                            display: 'inline-block',
                                            maxWidth: '100%',
                                          }}
                                          onClick={() => {
                                            // Auto-send: set query and trigger immediately
                                            setAiQuery(suggestion);
                                            setTimeout(() => {
                                              const submitButton = document.querySelector('.ai-submit-btn') as HTMLButtonElement;
                                              if (submitButton) submitButton.click();
                                            }, 100);
                                          }}
                                        >
                                          💡 {suggestion}
                                        </Tag>
                                      ))}
                                  </Space>
                                </div>
                              )}
                            </Space>
                          )}
                        </Card>
                      </Col>
                    )}
                  </Row>
                </Card>
              </Col>

              {/* Rule-based Insights */}
              {!insightsStats ? (
                <Col xs={24}>
                  <Skeleton active paragraph={{ rows: 6 }} />
                </Col>
              ) : (
                <>
                  {/* Insights Summary */}
                  <Col xs={24}>
                    <Card
                      title={
                        <Space>
                          <AlertOutlined style={{ color: '#1890ff' }} />
                          <span>Phân tích tự động</span>
                          <Badge count={insightsStats.summary.total_insights} style={{ backgroundColor: '#1890ff' }} />
                        </Space>
                      }
                      extra={
                        <Space>
                          <Tag color="red">{insightsStats.summary.critical} nghiêm trọng</Tag>
                          <Tag color="orange">{insightsStats.summary.warning} cảnh báo</Tag>
                          <Tag color="blue">{insightsStats.summary.info} thông tin</Tag>
                          <Tag color="green">{insightsStats.summary.success} tốt</Tag>
                        </Space>
                      }
                      style={{ borderRadius: borderRadius.md }}
                    >
                      <Row gutter={[16, 16]}>
                        {insightsStats.insights.map((insight) => (
                          <Col xs={24} md={12} key={insight.id}>
                            <Card
                              size="small"
                              style={{
                                borderRadius: borderRadius.sm,
                                borderLeft: `4px solid ${
                                  insight.severity === 'critical' ? '#f5222d' :
                                  insight.severity === 'warning' ? '#fa8c16' :
                                  insight.severity === 'success' ? '#52c41a' : '#1890ff'
                                }`,
                                background:
                                  insight.severity === 'critical' ? '#fff2f0' :
                                  insight.severity === 'warning' ? '#fffbe6' :
                                  insight.severity === 'success' ? '#f6ffed' : '#e6f7ff',
                              }}
                            >
                              <Space direction="vertical" size={8} style={{ width: '100%' }}>
                                <Space>
                                  {insight.category === 'documentation' && <FileTextOutlined />}
                                  {insight.category === 'devops' && <DeploymentUnitOutlined />}
                                  {insight.category === 'integration' && <ApiOutlined />}
                                  {insight.category === 'infrastructure' && <CloudOutlined />}
                                  {insight.category === 'technology' && <DatabaseOutlined />}
                                  {insight.category === 'security' && <SecurityScanOutlined />}
                                  {insight.category === 'assessment' && <AlertOutlined />}
                                  <Text strong>{insight.title}</Text>
                                </Space>
                                <Text type="secondary" style={{ fontSize: 13 }}>
                                  {insight.description}
                                </Text>
                                <div style={{
                                  padding: '8px 12px',
                                  background: 'white',
                                  borderRadius: borderRadius.sm,
                                  border: '1px dashed #d9d9d9',
                                }}>
                                  <BulbOutlined style={{ marginRight: 8, color: '#faad14' }} />
                                  <Text style={{ fontSize: 13 }}>{insight.recommendation}</Text>
                                </div>
                              </Space>
                            </Card>
                          </Col>
                        ))}
                      </Row>
                    </Card>
                  </Col>
                </>
              )}
            </Row>
          </TabPane>

          {/* Tab 7: Monitoring */}
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

      {/* AI Data Full View Modal - Enhanced with search, filter, sort, export */}
      <AIDataModal
        visible={dataModalVisible}
        onClose={() => setDataModalVisible(false)}
        data={aiQueryResponse?.data || null}
      />
    </div>
  );
};

export default StrategicDashboard;
