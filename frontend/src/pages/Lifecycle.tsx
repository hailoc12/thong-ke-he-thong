import React from 'react';
import { Alert, Space, Typography } from 'antd';
import BetaBadge from '../components/common/BetaBadge';
import LifecycleRoadmap from '../components/lifecycle/LifecycleRoadmap';
import PlanningPipelineTable from '../components/lifecycle/PlanningPipelineTable';
import BudgetTrackingChart from '../components/lifecycle/BudgetTrackingChart';

const { Title } = Typography;

/**
 * Lifecycle Management Page - Feature 4: Lifecycle Management & Planning
 * Provides system roadmaps, planning pipeline, and budget tracking
 */
const Lifecycle: React.FC = () => {
  return (
    <div>
      {/* Page Header */}
      <div style={{ marginBottom: 24 }}>
        <Space align="center" style={{ marginBottom: 12 }}>
          <Title level={3} style={{ margin: 0 }}>
            Quản lý vòng đời
          </Title>
          <BetaBadge size="default" />
        </Space>

        {/* BETA Notice */}
        <Alert
          message="Tính năng BETA - Dữ liệu mẫu"
          description="Tính năng quản lý vòng đời hệ thống và planning đang trong giai đoạn thử nghiệm. Roadmaps, planning pipeline, và budget tracking hiển thị là dữ liệu mô phỏng nhằm minh họa khả năng theo dõi và lập kế hoạch toàn diện."
          type="info"
          showIcon
          closable
          style={{ marginBottom: 24 }}
        />
      </div>

      {/* Main Content */}
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        {/* Budget Tracking */}
        <BudgetTrackingChart />

        {/* Planning Pipeline */}
        <PlanningPipelineTable />

        {/* System Roadmaps */}
        <LifecycleRoadmap />
      </Space>

      {/* Usage Instructions */}
      <Alert
        message="💡 How to use"
        description="Monitor budget execution across quarters. Track planning pipeline from idea to ready-to-start. Review individual system roadmaps with timelines, risks, and milestones."
        type="info"
        showIcon
        style={{ marginTop: 24 }}
      />
    </div>
  );
};

export default Lifecycle;
