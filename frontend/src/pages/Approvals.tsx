import React from 'react';
import { Alert, Space, Typography, Statistic, Row, Col, Card } from 'antd';
import {
  ClockCircleOutlined,
  CheckCircleOutlined,
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
            Phê duyệt & Chữ ký điện tử
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
              title="Tổng số yêu cầu"
              value={stats.total}
              prefix={<SyncOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Chờ xét duyệt"
              value={stats.pending}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Đã phê duyệt"
              value={stats.approved}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Trung bình chờ"
              value={stats.avgDays}
              prefix={<ClockCircleOutlined />}
              suffix="ngày"
              valueStyle={{ color: parseFloat(stats.avgDays) > 5 ? '#ff4d4f' : '#52c41a' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Kanban Board */}
      <div>
        <Title level={5} style={{ marginBottom: 16 }}>
          Quy trình phê duyệt
        </Title>
        <ApprovalKanban />
      </div>

      {/* Instructions */}
      <Alert
        message="💡 Hướng dẫn sử dụng"
        description="Click vào thẻ để xem chi tiết và dòng thời gian phê duyệt. Kéo thả thẻ để sắp xếp lại trong cột (chỉ demo - không lưu thay đổi trạng thái)."
        type="info"
        showIcon
        style={{ marginTop: 24 }}
      />
    </div>
  );
};

export default Approvals;
