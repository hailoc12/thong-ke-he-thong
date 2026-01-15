import { useEffect, useState } from 'react';
import { Card, Row, Col, Statistic, Typography, Spin } from 'antd';
import {
  AppstoreOutlined,
  CheckCircleOutlined,
  WarningOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import api from '../config/api';
import type { SystemStatistics } from '../types';

const { Title } = Typography;

const Dashboard = () => {
  const [statistics, setStatistics] = useState<SystemStatistics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStatistics();
  }, []);

  const fetchStatistics = async () => {
    try {
      const response = await api.get<SystemStatistics>('/systems/statistics/');
      setStatistics(response.data);
    } catch (error) {
      console.error('Failed to fetch statistics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: 50 }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div>
      <Title level={2}>Dashboard</Title>
      <Typography.Paragraph type="secondary">
        Tổng quan hệ thống CNTT
      </Typography.Paragraph>

      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Tổng số hệ thống"
              value={statistics?.total || 0}
              prefix={<AppstoreOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Đang hoạt động"
              value={statistics?.by_status.active || 0}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Quan trọng"
              value={statistics?.by_criticality.critical || 0}
              prefix={<WarningOutlined />}
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Đơn vị"
              value={0}
              prefix={<TeamOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        <Col xs={24} lg={12}>
          <Card title="Trạng thái hệ thống">
            <div style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Đang hoạt động</span>
                <span style={{ fontWeight: 'bold', color: '#52c41a' }}>
                  {statistics?.by_status.active || 0}
                </span>
              </div>
            </div>
            <div style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Ngưng hoạt động</span>
                <span style={{ fontWeight: 'bold', color: '#ff4d4f' }}>
                  {statistics?.by_status.inactive || 0}
                </span>
              </div>
            </div>
            <div style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Bảo trì</span>
                <span style={{ fontWeight: 'bold', color: '#faad14' }}>
                  {statistics?.by_status.maintenance || 0}
                </span>
              </div>
            </div>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Bản nháp</span>
                <span style={{ fontWeight: 'bold', color: '#8c8c8c' }}>
                  {statistics?.by_status.draft || 0}
                </span>
              </div>
            </div>
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card title="Mức độ quan trọng">
            <div style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Cực kỳ quan trọng</span>
                <span style={{ fontWeight: 'bold', color: '#ff4d4f' }}>
                  {statistics?.by_criticality.critical || 0}
                </span>
              </div>
            </div>
            <div style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Quan trọng</span>
                <span style={{ fontWeight: 'bold', color: '#faad14' }}>
                  {statistics?.by_criticality.high || 0}
                </span>
              </div>
            </div>
            <div style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Trung bình</span>
                <span style={{ fontWeight: 'bold', color: '#1890ff' }}>
                  {statistics?.by_criticality.medium || 0}
                </span>
              </div>
            </div>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Thấp</span>
                <span style={{ fontWeight: 'bold', color: '#52c41a' }}>
                  {statistics?.by_criticality.low || 0}
                </span>
              </div>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;
