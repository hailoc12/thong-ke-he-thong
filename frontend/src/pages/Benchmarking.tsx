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
            So sánh chuẩn mực & Thực tiễn tốt nhất
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
        message="💡 Hướng dẫn sử dụng"
        description="Biểu đồ radar hiển thị so sánh đa chiều qua 6 danh mục. Nhấp vào thẻ case study để xem các câu chuyện thành công chi tiết. Mở rộng phần thực tiễn tốt nhất để truy cập tài nguyên và hướng dẫn triển khai."
        type="info"
        showIcon
        style={{ marginTop: 24 }}
      />
    </div>
  );
};

export default Benchmarking;
