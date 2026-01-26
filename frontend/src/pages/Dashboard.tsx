import { useEffect, useState, useMemo, useCallback } from 'react';
import { Card, Row, Col, Statistic, Typography, Skeleton, Button, Space, Timeline, Badge, Select, DatePicker, Table, Progress, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  AppstoreOutlined,
  CheckCircleOutlined,
  WarningOutlined,
  TeamOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  MinusOutlined,
  ReloadOutlined,
  FilterOutlined,
  ClearOutlined,
  FileExcelOutlined,
} from '@ant-design/icons';
import CountUp from 'react-countup';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line, AreaChart, Area } from 'recharts';
import dayjs from 'dayjs';
import api from '../config/api';
import type { SystemStatistics, System, ApiResponse } from '../types';
import { colors, shadows, borderRadius, spacing } from '../theme/tokens';
import { useAuthStore } from '../stores/authStore';
import OrganizationDashboard from './OrganizationDashboard';
import DashboardSystemsList from '../components/DashboardSystemsList';
import { exportDashboardToExcel } from '../utils/exportExcel';

const { Title } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;

// Status mapping: English DB values → Vietnamese display names
const STATUS_LABELS: Record<string, string> = {
  operating: 'Đang vận hành',
  pilot: 'Thí điểm',
  stopped: 'Dừng',
  replacing: 'Sắp thay thế',
};

const Dashboard = () => {
  const { user } = useAuthStore();

  // If user is org_user, show OrganizationDashboard instead
  if (user?.role === 'org_user') {
    return <OrganizationDashboard />;
  }

  // Admin dashboard (existing implementation)
  const navigate = useNavigate();
  const [statistics, setStatistics] = useState<SystemStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [organizations, setOrganizations] = useState<Array<{ id: number; name: string }>>([]);
  const [completionStats, setCompletionStats] = useState<any>(null);
  const [exporting, setExporting] = useState(false);
  const [orgCompletionPage, setOrgCompletionPage] = useState({ current: 1, pageSize: 10 });

  // Filter states
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs | null, dayjs.Dayjs | null] | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [criticalityFilter, setCriticalityFilter] = useState<string>('all');
  const [organizationFilter, setOrganizationFilter] = useState<string>('all');

  // Systems list states
  const [systems, setSystems] = useState<System[]>([]);
  const [systemsLoading, setSystemsLoading] = useState(false);
  const [systemsPagination, setSystemsPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [activeStatFilter, setActiveStatFilter] = useState<{ type: 'status' | 'criticality' | null; value: string | null }>({
    type: null,
    value: null,
  });

  useEffect(() => {
    fetchStatistics();
    fetchOrganizations();
    fetchCompletionStats();
    fetchSystems();
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    // Refetch statistics when organization filter changes
    fetchStatistics();
    fetchCompletionStats();
    fetchSystems();
  }, [organizationFilter]);

  useEffect(() => {
    // Refetch systems when active stat filter changes
    fetchSystems();
  }, [activeStatFilter]);

  const fetchOrganizations = async () => {
    try {
      // Fetch ALL organizations without pagination for Excel export
      const response = await api.get('/organizations/?page_size=1000');
      setOrganizations(response.data.results || response.data);
    } catch (error) {
      console.error('Failed to fetch organizations:', error);
    }
  };

  const fetchCompletionStats = async () => {
    try {
      const params = new URLSearchParams();
      if (organizationFilter !== 'all') {
        params.append('org', organizationFilter);
      }
      // Fetch ALL completion stats without pagination for Excel export
      params.append('page_size', '1000');
      const response = await api.get(`/systems/completion_stats/?${params.toString()}`);
      setCompletionStats(response.data);
    } catch (error) {
      console.error('Failed to fetch completion stats:', error);
    }
  };

  const fetchSystems = async (page = 1) => {
    setSystemsLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('page_size', systemsPagination.pageSize.toString());

      // Apply organization filter
      if (organizationFilter !== 'all') {
        params.append('org', organizationFilter);
      }

      // Apply active stat filter (from clicked card)
      if (activeStatFilter.type === 'status' && activeStatFilter.value) {
        params.append('status', activeStatFilter.value);
      } else if (activeStatFilter.type === 'criticality' && activeStatFilter.value) {
        params.append('criticality', activeStatFilter.value);
      }

      const response = await api.get<ApiResponse<System>>(`/systems/?${params.toString()}`);
      setSystems(response.data.results || []);
      setSystemsPagination({
        current: page,
        pageSize: systemsPagination.pageSize,
        total: response.data.count || 0,
      });
    } catch (error) {
      console.error('Failed to fetch systems:', error);
    } finally {
      setSystemsLoading(false);
    }
  };

  const fetchStatistics = async () => {
    try {
      const params = new URLSearchParams();
      if (organizationFilter !== 'all') {
        params.append('org', organizationFilter);
      }
      const url = `/systems/statistics/${params.toString() ? '?' + params.toString() : ''}`;
      const response = await api.get<SystemStatistics>(url);
      setStatistics(response.data);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Failed to fetch statistics:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = useCallback(() => {
    setLoading(true);
    fetchStatistics();
    fetchSystems();
  }, []);

  const handleSystemsTableChange = (pagination: any) => {
    fetchSystems(pagination.current);
  };

  const handleStatCardClick = (type: 'status' | 'criticality', value: string) => {
    // Toggle filter: if same card is clicked again, clear the filter
    if (activeStatFilter.type === type && activeStatFilter.value === value) {
      setActiveStatFilter({ type: null, value: null });
    } else {
      setActiveStatFilter({ type, value });
    }
  };

  const exportToExcel = async () => {
    setExporting(true);
    try {
      // Fetch all systems for the Excel export
      const params = new URLSearchParams();
      if (organizationFilter !== 'all') {
        params.append('org', organizationFilter);
      }
      params.append('page_size', '1000'); // Get all systems

      const systemsResponse = await api.get<ApiResponse<System>>(`/systems/?${params.toString()}`);

      // Pass all organizations to include those without systems
      await exportDashboardToExcel(
        statistics,
        completionStats,
        systemsResponse.data.results || [],
        organizations
      );

      message.success('Đã xuất báo cáo Excel thành công!');
    } catch (error) {
      console.error('Error exporting Excel:', error);
      message.error('Lỗi khi xuất báo cáo Excel');
    } finally {
      setExporting(false);
    }
  };


  const handleDateRangeChange = useCallback((dates: any) => {
    setDateRange(dates);
    // Stub: In real implementation, this would trigger API call with date filters
    console.log('Date range changed:', dates);
  }, []);

  const handleStatusFilterChange = useCallback((value: string) => {
    setStatusFilter(value);
    // Stub: In real implementation, this would trigger API call with status filter
    console.log('Status filter changed:', value);
  }, []);

  const handleCriticalityFilterChange = useCallback((value: string) => {
    setCriticalityFilter(value);
    // Stub: In real implementation, this would trigger API call with criticality filter
    console.log('Criticality filter changed:', value);
  }, []);

  const handleOrganizationFilterChange = useCallback((value: string) => {
    setOrganizationFilter(value);
  }, []);

  const handleClearFilters = useCallback(() => {
    setDateRange(null);
    setStatusFilter('all');
    setCriticalityFilter('all');
    setOrganizationFilter('all');
    // Stub: In real implementation, this would trigger API call without filters
    console.log('Filters cleared');
  }, []);

  const formatLastUpdated = () => {
    const now = new Date();
    const diff = Math.floor((now.getTime() - lastUpdated.getTime()) / 1000 / 60); // minutes
    if (diff < 1) return 'Vừa xong';
    if (diff < 60) return `${diff} phút trước`;
    const hours = Math.floor(diff / 60);
    if (hours < 24) return `${hours} giờ trước`;
    return lastUpdated.toLocaleDateString('vi-VN');
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
      },
    },
  };

  // Status chart colors - Using enhanced design system
  const STATUS_COLORS = {
    active: colors.status.active,      // '#22C55E'
    inactive: colors.status.inactive,  // '#EF4444'
    maintenance: colors.status.maintenance, // '#F59E0B'
    draft: colors.neutral.gray400,     // '#9CA3AF'
  };

  // Criticality chart colors - Using enhanced design system
  const CRITICALITY_COLORS = {
    critical: colors.status.warning,   // '#F59E0B' (removed 'critical' level per )
    high: colors.status.inactive,      // '#EF4444'
    medium: colors.info.main,          // '#3B82F6'
    low: colors.status.active,         // '#22C55E'
  };

  // Prepare status chart data (memoized)
  const statusChartData = useMemo(() => {
    if (!statistics?.by_status) return [];
    return [
      { name: STATUS_LABELS.operating, value: statistics.by_status.operating, color: STATUS_COLORS.active },
      { name: STATUS_LABELS.stopped, value: statistics.by_status.stopped, color: STATUS_COLORS.inactive },
      { name: STATUS_LABELS.pilot, value: statistics.by_status.pilot, color: STATUS_COLORS.maintenance },
      { name: STATUS_LABELS.replacing, value: statistics.by_status.replacing, color: STATUS_COLORS.draft },
    ].filter(item => item.value > 0);
  }, [statistics]);

  // Prepare criticality chart data (memoized)
  const criticalityChartData = useMemo(() => {
    if (!statistics?.by_criticality) return [];
    return [
      { name: 'Cực kỳ quan trọng', value: statistics.by_criticality.high, color: CRITICALITY_COLORS.critical },
      { name: 'Quan trọng', value: statistics.by_criticality.high, color: CRITICALITY_COLORS.high },
      { name: 'Trung bình', value: statistics.by_criticality.medium, color: CRITICALITY_COLORS.medium },
      { name: 'Thấp', value: statistics.by_criticality.low, color: CRITICALITY_COLORS.low },
    ];
  }, [statistics]);

  // Calculate secondary metrics
  const getActiveRate = () => {
    if (!statistics?.total || statistics.total === 0) return 0;
    const operating = statistics.by_status?.operating ?? 0;
    return ((operating / statistics.total) * 100).toFixed(1);
  };

  const getCriticalRate = () => {
    if (!statistics?.total || statistics.total === 0) return 0;
    const high = statistics.by_criticality?.high ?? 0;
    return ((high / statistics.total) * 100).toFixed(1);
  };

  const getPilotRate = () => {
    if (!statistics?.total || statistics.total === 0) return 0;
    const pilot = statistics.by_status?.pilot ?? 0;
    return ((pilot / statistics.total) * 100).toFixed(1);
  };

  // Generate sparkline data (7-day mini trend)
  const getSparklineData = (baseValue: number, trendDirection: 'up' | 'down' | 'neutral') => {
    const data = [];
    let current = baseValue * 0.9; // Start 10% lower

    for (let i = 0; i < 7; i++) {
      // Add variance based on trend
      let change = 0;
      if (trendDirection === 'up') {
        change = (Math.random() * 0.03 + 0.01) * baseValue; // +1% to +4%
      } else if (trendDirection === 'down') {
        change = -(Math.random() * 0.03 + 0.01) * baseValue; // -1% to -4%
      } else {
        change = (Math.random() - 0.5) * 0.02 * baseValue; // ±1%
      }

      current = Math.max(0, current + change);
      data.push({ value: Math.round(current) });
    }

    return data;
  };

  // Recent activities - cleared dummy data
  // TODO: Replace with real activity log API when available
  const recentActivities = useMemo(() => {
    return []; // Empty - no dummy data
  }, [statistics]);

  // Generate mock 30-day trend data (memoized)
  const trendChartData = useMemo(() => {
    const data = [];
    const today = dayjs();
    const baseTotal = statistics?.total || 50;
    const baseActive = statistics?.by_status.operating || 40;
    const baseCritical = statistics?.by_criticality.high || 10;

    for (let i = 29; i >= 0; i--) {
      const date = today.subtract(i, 'day').format('DD/MM');
      // Add some variance to make it look realistic
      const variance = Math.random() * 0.1 - 0.05; // ±5%
      data.push({
        date,
        total: Math.round(baseTotal * (1 + variance)),
        active: Math.round(baseActive * (1 + variance)),
        critical: Math.round(baseCritical * (1 + variance * 2)),
      });
    }
    return data;
  }, [statistics]);

  // Mock trend data (will be replaced with real API data later)
  const getTrendData = (key: string) => {
    const mockTrends: Record<string, { value: number; trend: 'up' | 'down' | 'neutral' }> = {
      total: { value: 5.2, trend: 'up' },
      active: { value: 3.1, trend: 'up' },
      critical: { value: -12.0, trend: 'down' },
      orgs: { value: 0, trend: 'neutral' },
    };
    return mockTrends[key] || { value: 0, trend: 'neutral' };
  };

  const renderTrend = (trendData: { value: number; trend: 'up' | 'down' | 'neutral' }) => {
    const { value, trend } = trendData;
    const isPositive = trend === 'up';
    const isNegative = trend === 'down';
    const color = isPositive ? '#52c41a' : isNegative ? '#ff4d4f' : '#8c8c8c';
    const Icon = isPositive ? ArrowUpOutlined : isNegative ? ArrowDownOutlined : MinusOutlined;
    const sign = value > 0 ? '+' : '';

    return (
      <div style={{ marginTop: 8, fontSize: 14, color, fontWeight: 500 }}>
        <Icon style={{ marginRight: 4 }} />
        {sign}{value.toFixed(1)}% vs tháng trước
      </div>
    );
  };

  const renderSparkline = (baseValue: number, trend: 'up' | 'down' | 'neutral', color: string) => {
    const data = getSparklineData(baseValue, trend);
    return (
      <div style={{ marginTop: 12, height: 40 }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id={`gradient-${color}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                <stop offset="95%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <Area
              type="monotone"
              dataKey="value"
              stroke={color}
              strokeWidth={2}
              fill={`url(#gradient-${color})`}
              dot={false}
              isAnimationActive={true}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    );
  };

  return (
    <div>
      <div style={{
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        justifyContent: 'space-between',
        alignItems: isMobile ? 'flex-start' : 'center',
        marginBottom: 16,
        gap: isMobile ? 12 : 0,
      }}>
        <div>
          <Title level={isMobile ? 3 : 2} style={{ marginBottom: 8 }}>Dashboard</Title>
          <Typography.Paragraph type="secondary" style={{ marginBottom: 0 }}>
            Tổng quan hệ thống CNTT • Cập nhật: {formatLastUpdated()}
          </Typography.Paragraph>
        </div>
        <Space size="small">
          <Button
            icon={<ReloadOutlined />}
            onClick={handleRefresh}
            loading={loading}
            aria-label="Làm mới dữ liệu dashboard"
            title="Làm mới dữ liệu"
          >
            {isMobile ? '' : 'Làm mới'}
          </Button>
          <Button
            type="primary"
            icon={<FileExcelOutlined />}
            onClick={exportToExcel}
            loading={exporting}
            aria-label="Xuất báo cáo Excel"
            title="Xuất báo cáo Excel"
          >
            {isMobile ? '' : exporting ? 'Đang xuất...' : 'Xuất Excel'}
          </Button>
        </Space>
      </div>

      {/* Filter Bar */}
      <Card
        size="small"
        style={{
          marginBottom: spacing.md,
          borderRadius: borderRadius.lg,
          boxShadow: shadows.sm,
          backgroundColor: colors.background.paper,
        }}
        role="search"
        aria-label="Bộ lọc dashboard"
      >
        <div
          style={{
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            gap: isMobile ? 12 : 16,
            alignItems: isMobile ? 'stretch' : 'center',
            flexWrap: 'wrap',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <FilterOutlined style={{ color: '#1890ff', fontSize: 16 }} aria-hidden="true" />
            <Typography.Text strong id="filter-label">Bộ lọc:</Typography.Text>
          </div>

          <RangePicker
            value={dateRange}
            onChange={handleDateRangeChange}
            format="DD/MM/YYYY"
            placeholder={['Từ ngày', 'Đến ngày']}
            style={{ width: isMobile ? '100%' : 280 }}
            size={isMobile ? 'middle' : 'middle'}
            aria-label="Chọn khoảng thời gian"
          />

          <Select
            value={statusFilter}
            onChange={handleStatusFilterChange}
            placeholder="Trạng thái"
            style={{ width: isMobile ? '100%' : 180 }}
            size={isMobile ? 'middle' : 'middle'}
            aria-label="Lọc theo trạng thái"
          >
            <Option value="all">Tất cả trạng thái</Option>
            <Option value="operating">{STATUS_LABELS.operating}</Option>
            <Option value="stopped">{STATUS_LABELS.stopped}</Option>
            <Option value="pilot">{STATUS_LABELS.pilot}</Option>
            <Option value="replacing">{STATUS_LABELS.replacing}</Option>
          </Select>

          <Select
            value={criticalityFilter}
            onChange={handleCriticalityFilterChange}
            placeholder="Mức độ quan trọng"
            style={{ width: isMobile ? '100%' : 200 }}
            size={isMobile ? 'middle' : 'middle'}
            aria-label="Lọc theo mức độ quan trọng"
          >
            <Option value="all">Tất cả mức độ</Option>
            <Option value="critical">Cực kỳ quan trọng</Option>
            <Option value="high">Quan trọng</Option>
            <Option value="medium">Trung bình</Option>
            <Option value="low">Thấp</Option>
          </Select>

          <Select
            value={organizationFilter}
            onChange={handleOrganizationFilterChange}
            placeholder="Đơn vị"
            style={{ width: isMobile ? '100%' : 220 }}
            size={isMobile ? 'middle' : 'middle'}
            aria-label="Lọc theo đơn vị"
            showSearch
            optionFilterProp="children"
            filterOption={(input, option) =>
              String(option?.children || '').toLowerCase().indexOf(input.toLowerCase()) >= 0
            }
          >
            <Option value="all">Tất cả đơn vị</Option>
            {organizations.map(org => (
              <Option key={org.id} value={org.id.toString()}>{org.name}</Option>
            ))}
          </Select>

          <Button
            icon={<ClearOutlined />}
            onClick={handleClearFilters}
            disabled={dateRange === null && statusFilter === 'all' && criticalityFilter === 'all' && organizationFilter === 'all'}
            style={{ width: isMobile ? '100%' : 'auto' }}
            size={isMobile ? 'middle' : 'middle'}
            aria-label="Xóa tất cả bộ lọc"
            title="Xóa bộ lọc"
          >
            Xóa bộ lọc
          </Button>
        </div>
      </Card>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        role="region"
        aria-label="Chỉ số hiệu suất chính"
      >
        <Row gutter={isMobile ? [16, 16] : [24, 24]} style={{ marginTop: 24 }}>
          <Col xs={24} sm={12} lg={6}>
            <motion.div variants={cardVariants}>
              <Card
                style={{
                  borderLeft: `4px solid ${colors.primary.main}`,
                  borderRadius: borderRadius.lg,
                  boxShadow: shadows.card,
                  transition: 'all 0.3s ease',
                  backgroundColor: colors.background.paper,
                  cursor: 'pointer',
                }}
                className="kpi-card"
                hoverable
                role="article"
                aria-label="Tổng số hệ thống"
                onClick={() => setActiveStatFilter({ type: null, value: null })}
              >
                <Skeleton loading={loading} active paragraph={{ rows: 3 }} aria-label="Đang tải dữ liệu">
                  <Statistic
                    title="Tổng số hệ thống"
                    value={statistics?.total || 0}
                    prefix={<AppstoreOutlined style={{ fontSize: 24, color: colors.primary.main }} aria-hidden="true" />}
                    valueStyle={{ color: colors.primary.main, fontSize: 32, fontWeight: 700 }}
                    formatter={(value) => (
                      <CountUp end={Number(value)} duration={1.5} separator="," aria-label={`${value} hệ thống`} />
                    )}
                  />
                  {renderTrend(getTrendData('total'))}
                  {renderSparkline(statistics?.total || 50, 'up', colors.primary.main)}
                </Skeleton>
              </Card>
            </motion.div>
          </Col>

        <Col xs={24} sm={12} lg={6}>
          <motion.div variants={cardVariants}>
            <Card
              style={{
                borderLeft: `4px solid ${colors.status.active}`,
                borderRadius: borderRadius.lg,
                boxShadow: activeStatFilter.type === 'status' && activeStatFilter.value === 'operating' ? '0 0 0 2px ' + colors.status.active : shadows.card,
                transition: 'all 0.3s ease',
                backgroundColor: colors.background.paper,
                cursor: 'pointer',
              }}
              className="kpi-card"
              hoverable
              role="article"
              aria-label="Hệ thống đang hoạt động"
              onClick={() => handleStatCardClick('status', 'operating')}
            >
              <Skeleton loading={loading} active paragraph={{ rows: 3 }}>
                <Statistic
                  title={STATUS_LABELS.operating}
                  value={statistics?.by_status.operating || 0}
                  prefix={<CheckCircleOutlined style={{ fontSize: 24, color: colors.status.active }} />}
                  valueStyle={{ color: colors.status.active, fontSize: 32, fontWeight: 700 }}
                  formatter={(value) => (
                    <CountUp end={Number(value)} duration={1.5} separator="," />
                  )}
                />
                {renderTrend(getTrendData('operating'))}
                {renderSparkline(statistics?.by_status.operating || 40, 'up', colors.status.active)}
              </Skeleton>
            </Card>
          </motion.div>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <motion.div variants={cardVariants}>
            <Card
              style={{
                borderLeft: `4px solid ${colors.status.warning}`,
                borderRadius: borderRadius.lg,
                boxShadow: activeStatFilter.type === 'criticality' && activeStatFilter.value === 'high' ? '0 0 0 2px ' + colors.status.warning : shadows.card,
                transition: 'all 0.3s ease',
                backgroundColor: colors.background.paper,
                cursor: 'pointer',
              }}
              className="kpi-card"
              hoverable
              role="article"
              aria-label="Hệ thống quan trọng"
              onClick={() => handleStatCardClick('criticality', 'high')}
            >
              <Skeleton loading={loading} active paragraph={{ rows: 3 }}>
                <Statistic
                  title="Quan trọng"
                  value={statistics?.by_criticality.high || 0}
                  prefix={<WarningOutlined style={{ fontSize: 24, color: colors.status.warning }} />}
                  valueStyle={{ color: colors.status.warning, fontSize: 32, fontWeight: 700 }}
                  formatter={(value) => (
                    <CountUp end={Number(value)} duration={1.5} separator="," />
                  )}
                />
                {renderTrend(getTrendData('critical'))}
                {renderSparkline(statistics?.by_criticality.high || 10, 'down', colors.status.warning)}
              </Skeleton>
            </Card>
          </motion.div>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <motion.div variants={cardVariants}>
            <Card
              style={{
                borderLeft: `4px solid ${colors.secondary.main}`,
                borderRadius: borderRadius.lg,
                boxShadow: shadows.card,
                transition: 'all 0.3s ease',
                backgroundColor: colors.background.paper,
              }}
              className="kpi-card"
              hoverable
              role="article"
              aria-label="Đơn vị"
            >
              <Skeleton loading={loading} active paragraph={{ rows: 3 }}>
                <Statistic
                  title="Đơn vị"
                  value={0}
                  prefix={<TeamOutlined style={{ fontSize: 24, color: colors.secondary.main }} />}
                  valueStyle={{ color: colors.secondary.main, fontSize: 32, fontWeight: 700 }}
                  formatter={(value) => (
                    <CountUp end={Number(value)} duration={1.5} separator="," />
                  )}
                />
                {renderTrend(getTrendData('orgs'))}
                {renderSparkline(5, 'neutral', colors.secondary.main)}
              </Skeleton>
            </Card>
          </motion.div>
        </Col>
      </Row>
      </motion.div>

      {/* Secondary Metrics Row */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <Row gutter={isMobile ? [16, 16] : [24, 24]} style={{ marginTop: 24 }}>
          <Col xs={24} sm={8}>
            <motion.div variants={cardVariants}>
              <Card>
                <Skeleton loading={loading} active paragraph={{ rows: 1 }}>
                  <Statistic
                    title="Tỷ lệ hoạt động"
                    value={getActiveRate()}
                    suffix="%"
                    valueStyle={{ color: '#52c41a', fontSize: 24 }}
                  />
                </Skeleton>
              </Card>
            </motion.div>
          </Col>
          <Col xs={24} sm={8}>
            <motion.div variants={cardVariants}>
              <Card>
                <Skeleton loading={loading} active paragraph={{ rows: 1 }}>
                  <Statistic
                    title="Tỷ lệ quan trọng"
                    value={getCriticalRate()}
                    suffix="%"
                    valueStyle={{ color: '#ff4d4f', fontSize: 24 }}
                  />
                </Skeleton>
              </Card>
            </motion.div>
          </Col>
          <Col xs={24} sm={8}>
            <motion.div variants={cardVariants}>
              <Card>
                <Skeleton loading={loading} active paragraph={{ rows: 1 }}>
                  <Statistic
                    title="Tỷ lệ bảo trì"
                    value={getPilotRate()}
                    suffix="%"
                    valueStyle={{ color: '#faad14', fontSize: 24 }}
                  />
                </Skeleton>
              </Card>
            </motion.div>
          </Col>
        </Row>
      </motion.div>

      {/* Trend Line Chart */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <Row gutter={isMobile ? [16, 16] : [24, 24]} style={{ marginTop: 24 }}>
          <Col xs={24}>
            <motion.div variants={cardVariants}>
              <Card title="Xu hướng 30 ngày">
                <Skeleton loading={loading} active paragraph={{ rows: 6 }}>
                  <ResponsiveContainer width="100%" height={isMobile ? 250 : 350}>
                    <LineChart
                      data={trendChartData}
                      margin={{ top: 5, right: 30, left: isMobile ? 0 : 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="date"
                        tick={{ fontSize: isMobile ? 10 : 12 }}
                        interval={isMobile ? 4 : 2}
                      />
                      <YAxis tick={{ fontSize: isMobile ? 10 : 12 }} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'rgba(255, 255, 255, 0.95)',
                          border: '1px solid #d9d9d9',
                          borderRadius: '8px',
                        }}
                      />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="total"
                        stroke="#1890ff"
                        strokeWidth={2}
                        name="Tổng số hệ thống"
                        dot={{ r: isMobile ? 2 : 3 }}
                        activeDot={{ r: isMobile ? 4 : 6 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="operating"
                        stroke="#52c41a"
                        strokeWidth={2}
                        name={STATUS_LABELS.operating}
                        dot={{ r: isMobile ? 2 : 3 }}
                        activeDot={{ r: isMobile ? 4 : 6 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="high"
                        stroke="#ff4d4f"
                        strokeWidth={2}
                        name="Quan trọng"
                        dot={{ r: isMobile ? 2 : 3 }}
                        activeDot={{ r: isMobile ? 4 : 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </Skeleton>
              </Card>
            </motion.div>
          </Col>
        </Row>
      </motion.div>

      {/* Organization Completion Statistics */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <Row gutter={isMobile ? [16, 16] : [24, 24]} style={{ marginTop: 24 }}>
          <Col xs={24}>
            <motion.div variants={cardVariants}>
              <Card
                title="Thống kê hoàn thành theo đơn vị"
                extra={
                  <Button
                    type="link"
                    onClick={() => navigate('/systems/completion')}
                  >
                    Xem chi tiết
                  </Button>
                }
              >
                <Skeleton loading={loading || !completionStats} active paragraph={{ rows: 4 }}>
                  <Table
                    dataSource={completionStats?.summary?.organizations || []}
                    rowKey="id"
                    pagination={{
                      current: orgCompletionPage.current,
                      pageSize: orgCompletionPage.pageSize,
                      showSizeChanger: true,
                      showTotal: (total, range) => `${range[0]}-${range[1]} / ${total} đơn vị`,
                      onChange: (page, pageSize) => setOrgCompletionPage({ current: page, pageSize }),
                    }}
                    scroll={{ x: 850 }}
                    columns={[
                      {
                        title: 'STT',
                        key: 'index',
                        width: 60,
                        fixed: 'left',
                        align: 'center',
                        render: (_: any, __: any, index: number) =>
                          (orgCompletionPage.current - 1) * orgCompletionPage.pageSize + index + 1,
                      },
                      {
                        title: 'Đơn vị',
                        dataIndex: 'name',
                        key: 'name',
                        width: 250,
                      },
                      {
                        title: 'Số hệ thống',
                        dataIndex: 'system_count',
                        key: 'system_count',
                        width: 120,
                        align: 'center',
                      },
                      {
                        title: '% hoàn thành TB',
                        dataIndex: 'avg_completion',
                        key: 'avg_completion',
                        width: 200,
                        render: (value: number) => (
                          <Space direction="vertical" size={4} style={{ width: '100%' }}>
                            <Progress
                              percent={value}
                              strokeColor={
                                value >= 80 ? '#52c41a' :
                                value >= 60 ? '#faad14' :
                                '#ff4d4f'
                              }
                              size="small"
                            />
                          </Space>
                        ),
                      },
                      {
                        title: '100%',
                        dataIndex: 'systems_100_percent',
                        key: 'systems_100_percent',
                        width: 100,
                        align: 'center',
                        render: (value: number) => (
                          <Badge
                            count={value}
                            style={{ backgroundColor: '#52c41a' }}
                          />
                        ),
                      },
                      {
                        title: '<50%',
                        dataIndex: 'systems_below_50_percent',
                        key: 'systems_below_50_percent',
                        width: 100,
                        align: 'center',
                        render: (value: number) => (
                          <Badge
                            count={value}
                            style={{ backgroundColor: '#ff4d4f' }}
                          />
                        ),
                      },
                    ]}
                  />
                </Skeleton>
              </Card>
            </motion.div>
          </Col>
        </Row>
      </motion.div>

      {/* Status/Criticality Charts and Activity Feed */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <Row gutter={isMobile ? [16, 16] : [24, 24]} style={{ marginTop: 24 }}>
        <Col xs={24} lg={8}>
          <motion.div variants={cardVariants}>
            <Card title="Trạng thái hệ thống" style={{ height: '100%' }}>
            <Skeleton loading={loading} active paragraph={{ rows: 4 }}>
              <ResponsiveContainer width="100%" height={isMobile ? 250 : 300}>
                <PieChart>
                  <Pie
                    data={statusChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={isMobile ? 50 : 70}
                    outerRadius={isMobile ? 80 : 100}
                    paddingAngle={3}
                    dataKey="value"
                    label={(props: any) => `${props.name}: ${((props.percent || 0) * 100).toFixed(0)}%`}
                  >
                    {statusChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number | undefined) => [`${value || 0} hệ thống`, 'Số lượng']}
                  />
                  <Legend
                    verticalAlign="bottom"
                    height={36}
                    formatter={(value: any, entry: any) => `${value} (${entry?.payload?.value || 0})`}
                  />
                </PieChart>
              </ResponsiveContainer>
            </Skeleton>
          </Card>
          </motion.div>
        </Col>

        <Col xs={24} lg={8}>
          <motion.div variants={cardVariants}>
            <Card title="Mức độ quan trọng" style={{ height: '100%' }}>
            <Skeleton loading={loading} active paragraph={{ rows: 4 }}>
              <ResponsiveContainer width="100%" height={isMobile ? 250 : 300}>
                <BarChart
                  data={criticalityChartData}
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: isMobile ? 80 : 120, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis
                    type="category"
                    dataKey="name"
                    width={isMobile ? 70 : 110}
                    tick={{ fontSize: isMobile ? 11 : 14 }}
                  />
                  <Tooltip
                    formatter={(value: number | undefined) => [`${value || 0} hệ thống`, 'Số lượng']}
                  />
                  <Bar dataKey="value" radius={[0, 8, 8, 0]}>
                    {criticalityChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Skeleton>
          </Card>
          </motion.div>
        </Col>

        <Col xs={24} lg={8}>
          <motion.div variants={cardVariants}>
            <Card
              title="Hoạt động gần đây"
              style={{ height: '100%' }}
              extra={
                <Badge count={recentActivities.length} style={{ backgroundColor: '#1890ff' }} />
              }
            >
              <Skeleton loading={loading} active paragraph={{ rows: 6 }}>
                <div style={{ maxHeight: isMobile ? 250 : 300, overflowY: 'auto' }}>
                  {recentActivities.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '40px 20px', color: '#999' }}>
                      <Typography.Text type="secondary">
                        Chưa có hoạt động gần đây
                      </Typography.Text>
                    </div>
                  ) : (
                    <Timeline items={recentActivities} />
                  )}
                </div>
              </Skeleton>
            </Card>
          </motion.div>
        </Col>
      </Row>
      </motion.div>

      {/* Systems List */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <DashboardSystemsList
          systems={systems}
          loading={systemsLoading}
          isMobile={isMobile}
          pagination={systemsPagination}
          onChange={handleSystemsTableChange}
        />
      </motion.div>
    </div>
  );
};

export default Dashboard;
