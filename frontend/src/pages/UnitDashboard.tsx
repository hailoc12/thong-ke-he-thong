import { useEffect, useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Row, Col, Statistic, Typography, Skeleton, Button, Space, Timeline, Badge, Select, DatePicker, Dropdown, message } from 'antd';
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
  DownloadOutlined,
  ClockCircleOutlined,
  PlusCircleOutlined,
  EditOutlined,
  ExclamationCircleOutlined,
  FilterOutlined,
  ClearOutlined,
  FileTextOutlined,
  FileDoneOutlined,
} from '@ant-design/icons';
import CountUp from 'react-countup';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line, AreaChart, Area } from 'recharts';
import dayjs from 'dayjs';
import api from '../config/api';
import type { SystemStatistics } from '../types';
import { colors, shadows, borderRadius, spacing } from '../theme/tokens';
import { useAuthStore } from '../stores/authStore';

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

const UnitDashboard = () => {
  const navigate = useNavigate();
  const { isAdmin, user } = useAuthStore();
  const [statistics, setStatistics] = useState<SystemStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // Filter states
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs | null, dayjs.Dayjs | null] | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [criticalityFilter, setCriticalityFilter] = useState<string>('all');

  // Redirect admin users to main dashboard
  useEffect(() => {
    if (isAdmin) {
      message.warning('Trang này chỉ dành cho người dùng đơn vị');
      navigate('/dashboard');
    }
  }, [isAdmin, navigate]);

  useEffect(() => {
    if (!isAdmin) {
      fetchStatistics();
    }
  }, [isAdmin]);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const fetchStatistics = async () => {
    try {
      // API /systems/statistics/ đã tự động filter theo organization của user
      const response = await api.get<SystemStatistics>('/systems/statistics/');
      setStatistics(response.data);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Failed to fetch statistics:', error);
      message.error('Không thể tải thống kê');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = useCallback(() => {
    setLoading(true);
    fetchStatistics();
  }, []);

  const exportToJSON = () => {
    const exportData = {
      metadata: {
        exportDate: new Date().toISOString(),
        reportType: 'Unit Dashboard Statistics',
        organization: user?.organization_name,
        filters: {
          dateRange: dateRange ? [dateRange[0]?.format('DD/MM/YYYY'), dateRange[1]?.format('DD/MM/YYYY')] : null,
          status: statusFilter !== 'all' ? statusFilter : null,
          criticality: criticalityFilter !== 'all' ? criticalityFilter : null,
        },
      },
      summary: {
        total: statistics?.total || 0,
        operatingCount: statistics?.by_status.operating || 0,
        operatingRate: getActiveRate() + '%',
        criticalCount: statistics?.by_criticality.high || 0,
        criticalRate: getCriticalRate() + '%',
        pilotRate: getPilotRate() + '%',
      },
      byStatus: statistics?.by_status || {},
      byCriticality: statistics?.by_criticality || {},
      trendData: trendChartData,
      recentActivities: recentActivities.map(activity => ({
        user: activity.user,
        action: activity.text,
        system: activity.system,
        time: activity.time,
      })),
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `unit-dashboard-${dayjs().format('YYYY-MM-DD-HHmm')}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const exportToCSV = () => {
    const headers = ['Metric', 'Value', 'Percentage'];
    const rows = [
      ['Tổng số hệ thống', statistics?.total || 0, '100%'],
      [STATUS_LABELS.operating, statistics?.by_status.operating || 0, getActiveRate() + '%'],
      [STATUS_LABELS.pilot, statistics?.by_status.pilot || 0, getPilotRate() + '%'],
      [STATUS_LABELS.stopped, statistics?.by_status.stopped || 0, ''],
      [STATUS_LABELS.replacing, statistics?.by_status.replacing || 0, ''],
      [''],
      ['Quan trọng', statistics?.by_criticality.high || 0, getCriticalRate() + '%'],
      ['Trung bình', statistics?.by_criticality.medium || 0, ''],
      ['Thấp', statistics?.by_criticality.low || 0, ''],
    ];

    const csvContent = [
      `Đơn vị: ${user?.organization_name || 'N/A'}`,
      '',
      headers.join(','),
      ...rows.map(row => row.join(',')),
      '',
      'Exported on: ' + new Date().toLocaleString('vi-VN'),
    ].join('\n');

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `unit-dashboard-${dayjs().format('YYYY-MM-DD-HHmm')}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };


  const handleDateRangeChange = useCallback((dates: any) => {
    setDateRange(dates);
    console.log('Date range changed:', dates);
  }, []);

  const handleStatusFilterChange = useCallback((value: string) => {
    setStatusFilter(value);
    console.log('Status filter changed:', value);
  }, []);

  const handleCriticalityFilterChange = useCallback((value: string) => {
    setCriticalityFilter(value);
    console.log('Criticality filter changed:', value);
  }, []);

  const handleClearFilters = useCallback(() => {
    setDateRange(null);
    setStatusFilter('all');
    setCriticalityFilter('all');
    console.log('Filters cleared');
  }, []);

  const formatLastUpdated = () => {
    const now = new Date();
    const diff = Math.floor((now.getTime() - lastUpdated.getTime()) / 1000 / 60);
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

  // Status chart colors
  const STATUS_COLORS = {
    active: colors.status.active,
    inactive: colors.status.inactive,
    maintenance: colors.status.maintenance,
    draft: colors.neutral.gray400,
  };

  // Criticality chart colors
  const CRITICALITY_COLORS = {
    critical: colors.status.warning,
    high: colors.status.inactive,
    medium: colors.info.main,
    low: colors.status.active,
  };

  // Prepare status chart data (memoized)
  const statusChartData = useMemo(() => {
    if (!statistics?.by_status) return [];
    return [
      { name: STATUS_LABELS.operating, value: statistics.by_status.operating || 0, color: STATUS_COLORS.active },
      { name: STATUS_LABELS.pilot, value: statistics.by_status.pilot || 0, color: STATUS_COLORS.maintenance },
      { name: STATUS_LABELS.stopped, value: statistics.by_status.stopped || 0, color: STATUS_COLORS.inactive },
      { name: STATUS_LABELS.replacing, value: statistics.by_status.replacing || 0, color: STATUS_COLORS.draft },
    ].filter(item => item.value > 0);
  }, [statistics]);

  // Prepare criticality chart data (memoized)
  const criticalityChartData = useMemo(() => {
    if (!statistics?.by_criticality) return [];
    return [
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
    const critical = statistics.by_criticality?.high ?? 0;
    return ((critical / statistics.total) * 100).toFixed(1);
  };

  const getPilotRate = () => {
    if (!statistics?.total || statistics.total === 0) return 0;
    const pilot = statistics.by_status?.pilot ?? 0;
    return ((pilot / statistics.total) * 100).toFixed(1);
  };

  // Generate sparkline data (7-day mini trend)
  const getSparklineData = (baseValue: number, trendDirection: 'up' | 'down' | 'neutral') => {
    const data = [];
    let current = baseValue * 0.9;

    for (let i = 0; i < 7; i++) {
      let change = 0;
      if (trendDirection === 'up') {
        change = (Math.random() * 0.03 + 0.01) * baseValue;
      } else if (trendDirection === 'down') {
        change = -(Math.random() * 0.03 + 0.01) * baseValue;
      } else {
        change = (Math.random() - 0.5) * 0.02 * baseValue;
      }

      current = Math.max(0, current + change);
      data.push({ value: Math.round(current) });
    }

    return data;
  };

  // Generate mock recent activities (memoized)
  const recentActivities = useMemo(() => {
    const activityTypes = [
      { type: 'created', icon: <PlusCircleOutlined />, color: '#52c41a', text: 'đã tạo hệ thống mới' },
      { type: 'updated', icon: <EditOutlined />, color: '#1890ff', text: 'đã cập nhật hệ thống' },
      { type: 'maintenance', icon: <ExclamationCircleOutlined />, color: '#faad14', text: 'đã chuyển sang bảo trì' },
      { type: 'activated', icon: <CheckCircleOutlined />, color: '#52c41a', text: 'đã kích hoạt hệ thống' },
    ];

    const systems = ['Hệ thống Quản lý Văn bản', 'Portal Dịch vụ công', 'Hệ thống Email nội bộ', 'Quản lý Nhân sự'];
    const users = ['Nguyễn Văn A', 'Trần Thị B', 'Lê Văn C', 'Phạm Thị D'];

    return Array.from({ length: 8 }, (_, i) => {
      const activity = activityTypes[Math.floor(Math.random() * activityTypes.length)];
      const system = systems[Math.floor(Math.random() * systems.length)];
      const user = users[Math.floor(Math.random() * users.length)];
      const minutesAgo = i * 15 + Math.floor(Math.random() * 15);

      return {
        ...activity,
        system,
        user,
        time: dayjs().subtract(minutesAgo, 'minute').format('HH:mm DD/MM'),
        timeAgo: minutesAgo < 60 ? `${minutesAgo} phút trước` : `${Math.floor(minutesAgo / 60)} giờ trước`,
      };
    });
  }, [statistics]);

  // Generate mock 30-day trend data (memoized)
  const trendChartData = useMemo(() => {
    const data = [];
    const today = dayjs();
    const baseTotal = statistics?.total || 50;
    const baseOperating = statistics?.by_status.operating || 0;
    const baseHigh = statistics?.by_criticality.high || 0;

    for (let i = 29; i >= 0; i--) {
      const date = today.subtract(i, 'day').format('DD/MM');
      const variance = Math.random() * 0.1 - 0.05;
      data.push({
        date,
        total: Math.round(baseTotal * (1 + variance)),
        operating: Math.round(baseOperating * (1 + variance)),
        high: Math.round(baseHigh * (1 + variance * 2)),
      });
    }
    return data;
  }, [statistics]);

  // Mock trend data
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
          <Title level={isMobile ? 3 : 2} style={{ marginBottom: 8 }}>Dashboard - {user?.organization_name}</Title>
          <Typography.Paragraph type="secondary" style={{ marginBottom: 0 }}>
            Thống kê hệ thống CNTT của đơn vị • Cập nhật: {formatLastUpdated()}
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
          <Dropdown
            menu={{
              items: [
                {
                  key: 'json',
                  label: 'Xuất JSON',
                  icon: <FileDoneOutlined />,
                  onClick: exportToJSON,
                },
                {
                  key: 'csv',
                  label: 'Xuất CSV',
                  icon: <FileTextOutlined />,
                  onClick: exportToCSV,
                },
              ],
            }}
            placement="bottomRight"
          >
            <Button
              icon={<DownloadOutlined />}
              aria-label="Xuất báo cáo dashboard"
              title="Xuất báo cáo"
            >
              {isMobile ? '' : 'Xuất báo cáo'}
            </Button>
          </Dropdown>
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
            style={{ width: isMobile ? '100%' : 200 }}
            size={isMobile ? 'middle' : 'middle'}
            aria-label="Lọc theo trạng thái"
          >
            <Option value="all">Tất cả trạng thái</Option>
            <Option value="operating">{STATUS_LABELS.operating}</Option>
            <Option value="pilot">{STATUS_LABELS.pilot}</Option>
            <Option value="stopped">{STATUS_LABELS.stopped}</Option>
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

          <Button
            icon={<ClearOutlined />}
            onClick={handleClearFilters}
            disabled={dateRange === null && statusFilter === 'all' && criticalityFilter === 'all'}
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
                }}
                className="kpi-card"
                hoverable
                role="article"
                aria-label="Tổng số hệ thống"
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
                boxShadow: shadows.card,
                transition: 'all 0.3s ease',
                backgroundColor: colors.background.paper,
              }}
              className="kpi-card"
              hoverable
              role="article"
              aria-label="Hệ thống đang hoạt động"
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
                {renderSparkline(statistics?.by_status.operating || 0, 'up', colors.status.active)}
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
                boxShadow: shadows.card,
                transition: 'all 0.3s ease',
                backgroundColor: colors.background.paper,
              }}
              className="kpi-card"
              hoverable
              role="article"
              aria-label="Hệ thống quan trọng"
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
                  value={user?.organization_name || ''}
                  prefix={<TeamOutlined style={{ fontSize: 24, color: colors.secondary.main }} />}
                  valueStyle={{ color: colors.secondary.main, fontSize: 18, fontWeight: 700 }}
                />
                <Typography.Text type="secondary" style={{ fontSize: 12, marginTop: 8, display: 'block' }}>
                  {user?.organization_name}
                </Typography.Text>
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
                    title="Tỷ lệ thí điểm"
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
                  <Timeline
                    items={recentActivities.map((activity, index) => ({
                      dot: <span style={{ color: activity.color }}>{activity.icon}</span>,
                      children: (
                        <div key={index}>
                          <div style={{ marginBottom: 4 }}>
                            <Typography.Text strong>{activity.user}</Typography.Text>
                            {' '}{activity.text}
                          </div>
                          <div style={{ marginBottom: 4 }}>
                            <Typography.Text type="secondary" style={{ fontSize: 13 }}>
                              {activity.system}
                            </Typography.Text>
                          </div>
                          <div>
                            <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                              <ClockCircleOutlined style={{ marginRight: 4 }} />
                              {activity.timeAgo}
                            </Typography.Text>
                          </div>
                        </div>
                      ),
                    }))}
                  />
                </div>
              </Skeleton>
            </Card>
          </motion.div>
        </Col>
      </Row>
      </motion.div>
    </div>
  );
};

export default UnitDashboard;
