import React from 'react';
import { Alert, Space, Typography } from 'antd';
import BetaBadge from '../components/common/BetaBadge';
import BenchmarkRadarChart from '../components/benchmarking/BenchmarkRadarChart';
import BestPracticesAccordion from '../components/benchmarking/BestPracticesAccordion';
import CaseStudyCards from '../components/benchmarking/CaseStudyCards';

const { Title } = Typography;

/**
 * Benchmarking Page - Feature 3: Benchmarking & Best Practices
 * Provides performance comparison, best practices library, and success case studies
 */
const Benchmarking: React.FC = () => {
  return (
    <div>
      {/* Page Header */}
      <div style={{ marginBottom: 24 }}>
        <Space align="center" style={{ marginBottom: 12 }}>
          <Title level={3} style={{ margin: 0 }}>
            Benchmarking & Best Practices
          </Title>
          <BetaBadge size="default" />
        </Space>

        {/* BETA Notice */}
        <Alert
          message="Tính năng BETA - Dữ liệu mẫu"
          description="Tính năng so sánh hiệu suất và thư viện best practices đang trong giai đoạn thử nghiệm. Dữ liệu benchmark và case studies hiển thị là dữ liệu mô phỏng nhằm minh họa khả năng phân tích và học hỏi từ các tổ chức hàng đầu."
          type="info"
          showIcon
          closable
          style={{ marginBottom: 24 }}
        />
      </div>

      {/* Main Content */}
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        {/* Performance Radar Chart */}
        <BenchmarkRadarChart />

        {/* Case Studies */}
        <CaseStudyCards />

        {/* Best Practices Library */}
        <BestPracticesAccordion />
      </Space>

      {/* Usage Instructions */}
      <Alert
        message="💡 How to use"
        description="Radar chart shows multi-dimensional comparison across 6 categories. Click on case study cards to view detailed success stories. Expand best practices to access resources and implementation guides."
        type="info"
        showIcon
        style={{ marginTop: 24 }}
      />
    </div>
  );
};

export default Benchmarking;
