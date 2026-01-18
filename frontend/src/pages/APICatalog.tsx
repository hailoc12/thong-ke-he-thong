import React from 'react';
import { Alert, Space, Typography } from 'antd';
import BetaBadge from '../components/common/BetaBadge';
import APICatalogTable from '../components/api-catalog/APICatalogTable';
import APIHealthDashboard from '../components/api-catalog/APIHealthDashboard';
import APIMarketplace from '../components/api-catalog/APIMarketplace';

const { Title } = Typography;

/**
 * API Catalog Page - Feature 5: API Catalog & Integration Management
 * Provides centralized API registry, health monitoring, and marketplace discovery
 */
const APICatalog: React.FC = () => {
  return (
    <div>
      {/* Page Header */}
      <div style={{ marginBottom: 24 }}>
        <Space align="center" style={{ marginBottom: 12 }}>
          <Title level={3} style={{ margin: 0 }}>
            Danh mục API & Quản lý tích hợp
          </Title>
          <BetaBadge size="default" />
        </Space>

        {/* BETA Notice */}
        <Alert
          message="Tính năng BETA - Dữ liệu mẫu"
          description="Tính năng quản lý API catalog và integration đang trong giai đoạn thử nghiệm. API registry, health monitoring, và marketplace recommendations hiển thị là dữ liệu mô phỏng nhằm minh họa khả năng quản lý tích hợp API tập trung."
          type="info"
          showIcon
          closable
          style={{ marginBottom: 24 }}
        />
      </div>

      {/* Main Content */}
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        {/* API Health Dashboard */}
        <APIHealthDashboard />

        {/* API Catalog Table */}
        <APICatalogTable />

        {/* API Marketplace */}
        <APIMarketplace />
      </Space>

      {/* Usage Instructions */}
      <Alert
        message="💡 Hướng dẫn sử dụng"
        description="Giám sát tình trạng API theo thời gian thực. Duyệt qua danh mục API đầy đủ với các số liệu SLA. Khám phá các API của bên thứ ba đã được xác minh trong marketplace để tích hợp."
        type="info"
        showIcon
        style={{ marginTop: 24 }}
      />
    </div>
  );
};

export default APICatalog;
