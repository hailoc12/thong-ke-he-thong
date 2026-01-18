import React from 'react';
import { Alert, Space, Typography, Statistic, Row, Col, Card } from 'antd';
import {
  ClockCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  SyncOutlined
} from '@ant-design/icons';
import BetaBadge from '../components/common/BetaBadge';
import ApprovalKanban from '../components/approvals/ApprovalKanban';
import { mockApprovalRequests } from '../mocks';

const { Title } = Typography;

/**
 * Approvals Page - Feature 2: Approval Workflow & E-Signature
 * Provides Kanban-style approval workflow management
 */
const Approvals: React.FC = () => {
  // Calculate statistics
  const stats = {
    total: mockApprovalRequests.length,
    pending: mockApprovalRequests.filter(r =>
      r.status.includes('pending')
    ).length,
    approved: mockApprovalRequests.filter(r => r.status === 'approved').length,
    rejected: mockApprovalRequests.filter(r => r.status === 'rejected').length,
    avgDays: (
      mockApprovalRequests
        .filter(r => r.status.includes('pending'))
        .reduce((sum, r) => sum + r.daysPending, 0) /
      mockApprovalRequests.filter(r => r.status.includes('pending')).length
    ).toFixed(1)
  };

  return (
    <div>
      {/* Page Header */}
      <div style={{ marginBottom: 24 }}>
        <Space align="center" style={{ marginBottom: 12 }}>
          <Title level={3} style={{ margin: 0 }}>
            Approval Workflow & E-Signature
          </Title>
          <BetaBadge size="default" />
        </Space>

        {/* BETA Notice */}
        <Alert
          message="Tính năng BETA - Dữ liệu mẫu"
          description="Tính năng quản lý quy trình phê duyệt với Kanban board và e-signature đang trong giai đoạn thử nghiệm. Dữ liệu hiển thị là dữ liệu mô phỏng."
          type="info"
          showIcon
          closable
          style={{ marginBottom: 24 }}
        />
      </div>

      {/* Statistics Dashboard */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Total Requests"
              value={stats.total}
              prefix={<SyncOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Pending Review"
              value={stats.pending}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Approved"
              value={stats.approved}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Avg. Days Pending"
              value={stats.avgDays}
              prefix={<ClockCircleOutlined />}
              suffix="days"
              valueStyle={{ color: parseFloat(stats.avgDays) > 5 ? '#ff4d4f' : '#52c41a' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Kanban Board */}
      <div>
        <Title level={5} style={{ marginBottom: 16 }}>
          Approval Pipeline
        </Title>
        <ApprovalKanban />
      </div>

      {/* Instructions */}
      <Alert
        message="💡 How to use"
        description="Click on any card to view details and approval timeline. Drag & drop cards to reorder within columns (demo only - status changes not persisted)."
        type="info"
        showIcon
        style={{ marginTop: 24 }}
      />
    </div>
  );
};

export default Approvals;
