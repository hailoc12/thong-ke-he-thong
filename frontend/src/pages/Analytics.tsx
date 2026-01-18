import React from 'react';
import { Alert, Space, Typography } from 'antd';
import BetaBadge from '../components/common/BetaBadge';
import SystemLandscapeGraph from '../components/analytics/SystemLandscapeGraph';
import AIInsightsGrid from '../components/analytics/AIInsightsGrid';
import CostForecastChart from '../components/analytics/CostForecastChart';
import TechnologySiloTable from '../components/analytics/TechnologySiloTable';

const { Title } = Typography;

/**
 * Analytics Page - Feature 1: Intelligent Analytics
 * Provides AI-powered insights, system landscape visualization, and cost forecasting
 */
const Analytics: React.FC = () => {
  return (
    <div>
      {/* Page Header */}
      <div style={{ marginBottom: 24 }}>
        <Space align="center" style={{ marginBottom: 12 }}>
          <Title level={3} style={{ margin: 0 }}>
            Intelligent Analytics
          </Title>
          <BetaBadge size="default" />
        </Space>

        {/* BETA Notice */}
        <Alert
          message="Tính năng BETA - Dữ liệu mẫu"
          description="Tính năng này đang trong giai đoạn thử nghiệm với dữ liệu mô phỏng nhằm minh họa tiềm năng của phân tích thông minh hệ thống. Dữ liệu hiển thị không phải dữ liệu thực tế."
          type="info"
          showIcon
          closable
          style={{ marginBottom: 24 }}
        />
      </div>

      {/* Main Content */}
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        {/* AI Insights Section */}
        <AIInsightsGrid />

        {/* System Landscape Graph */}
        <SystemLandscapeGraph height={600} />

        {/* Cost Forecast */}
        <CostForecastChart />

        {/* Technology Silos */}
        <TechnologySiloTable />
      </Space>
    </div>
  );
};

export default Analytics;
