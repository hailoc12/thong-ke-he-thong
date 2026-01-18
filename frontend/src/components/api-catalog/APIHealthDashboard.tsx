import React from 'react';
import { Card, Row, Col, Statistic, Tag, Typography, Space, Alert, Progress, Timeline } from 'antd';
import {
  CheckCircleOutlined,
  WarningOutlined,
  CloseCircleOutlined,
  ThunderboltOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';
import { mockAPIHealth, mockAPIDefinitions } from '../../mocks';

const { Title, Text } = Typography;

/**
 * API Health Dashboard - Real-time API health monitoring
 */
const APIHealthDashboard: React.FC = () => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <CheckCircleOutlined style={{ color: '#52c41a' }} />;
      case 'degraded': return <WarningOutlined style={{ color: '#faad14' }} />;
      case 'down': return <CloseCircleOutlined style={{ color: '#ff4d4f' }} />;
      default: return <CheckCircleOutlined />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'success';
      case 'degraded': return 'warning';
      case 'down': return 'error';
      default: return 'default';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'red';
      case 'high': return 'orange';
      case 'medium': return 'gold';
      case 'low': return 'blue';
      default: return 'default';
    }
  };

  // Calculate statistics
  const stats = {
    total: mockAPIHealth.length,
    healthy: mockAPIHealth.filter(h => h.status === 'healthy').length,
    degraded: mockAPIHealth.filter(h => h.status === 'degraded').length,
    down: mockAPIHealth.filter(h => h.status === 'down').length,
    avgUptime: (mockAPIHealth.reduce((sum, h) => sum + h.uptime, 0) / mockAPIHealth.length).toFixed(2),
    totalAlerts: mockAPIHealth.reduce((sum, h) => sum + h.alerts.length, 0)
  };

  return (
    <Card>
      <Title level={5} style={{ marginBottom: 24 }}>
        API Health Monitoring
      </Title>

      {/* Statistics Dashboard */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={6}>
          <Card size="small">
            <Statistic
              title="Healthy APIs"
              value={stats.healthy}
              suffix={`/ ${stats.total}`}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card size="small">
            <Statistic
              title="Degraded"
              value={stats.degraded}
              prefix={<WarningOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card size="small">
            <Statistic
              title="Down"
              value={stats.down}
              prefix={<CloseCircleOutlined />}
              valueStyle={{ color: stats.down > 0 ? '#ff4d4f' : '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card size="small">
            <Statistic
              title="Avg. Uptime"
              value={stats.avgUptime}
              suffix="%"
              valueStyle={{ color: parseFloat(stats.avgUptime) >= 99.5 ? '#52c41a' : '#faad14' }}
            />
          </Card>
        </Col>
      </Row>

      {/* API Health Details */}
      <Space direction="vertical" size="middle" style={{ width: '100%' }}>
        {mockAPIHealth.map((health) => {
          const api = mockAPIDefinitions.find(a => a.id === health.apiId);
          if (!api) return null;

          const hasAlerts = health.alerts.length > 0;
          const criticalAlerts = health.alerts.filter(a => a.severity === 'critical').length;

          return (
            <Card
              key={health.apiId}
              size="small"
              style={{
                borderLeft: `4px solid ${
                  health.status === 'healthy' ? '#52c41a' :
                  health.status === 'degraded' ? '#faad14' : '#ff4d4f'
                }`
              }}
            >
              <Row gutter={[16, 16]}>
                {/* API Info */}
                <Col xs={24} md={8}>
                  <Space direction="vertical" size={4} style={{ width: '100%' }}>
                    <Space>
                      {getStatusIcon(health.status)}
                      <Text strong>{api.apiName}</Text>
                    </Space>
                    <Text type="secondary" style={{ fontSize: 11 }}>{api.apiCode}</Text>
                    <Tag color={health.status === 'healthy' ? 'success' : health.status === 'degraded' ? 'warning' : 'error'}>
                      {health.status.toUpperCase()}
                    </Tag>
                  </Space>
                </Col>

                {/* Metrics */}
                <Col xs={24} md={8}>
                  <Space direction="vertical" size={8} style={{ width: '100%' }}>
                    <div>
                      <Text type="secondary" style={{ fontSize: 11 }}>Uptime</Text>
                      <Progress
                        percent={health.uptime}
                        size="small"
                        strokeColor={health.uptime >= 99.5 ? '#52c41a' : health.uptime >= 99 ? '#faad14' : '#ff4d4f'}
                      />
                    </div>
                    <Row gutter={8}>
                      <Col span={12}>
                        <Space direction="vertical" size={0}>
                          <Text type="secondary" style={{ fontSize: 11 }}>Avg Response</Text>
                          <Space size={4}>
                            <ClockCircleOutlined style={{ fontSize: 11 }} />
                            <Text style={{ fontSize: 12 }}>{health.avgResponseTime}ms</Text>
                          </Space>
                        </Space>
                      </Col>
                      <Col span={12}>
                        <Space direction="vertical" size={0}>
                          <Text type="secondary" style={{ fontSize: 11 }}>Error Rate</Text>
                          <Tag color={health.errorRate < 0.5 ? 'green' : health.errorRate < 1 ? 'orange' : 'red'} style={{ fontSize: 11 }}>
                            {health.errorRate}%
                          </Tag>
                        </Space>
                      </Col>
                    </Row>
                  </Space>
                </Col>

                {/* Performance Details */}
                <Col xs={24} md={8}>
                  <Space direction="vertical" size={4} style={{ width: '100%' }}>
                    <div>
                      <Text type="secondary" style={{ fontSize: 11 }}>P95 Response Time</Text>
                      <br />
                      <Tag color={health.p95ResponseTime < 200 ? 'green' : health.p95ResponseTime < 500 ? 'blue' : 'orange'}>
                        {health.p95ResponseTime}ms
                      </Tag>
                    </div>
                    <div>
                      <Text type="secondary" style={{ fontSize: 11 }}>P99 Response Time</Text>
                      <br />
                      <Tag color={health.p99ResponseTime < 500 ? 'green' : health.p99ResponseTime < 1000 ? 'blue' : 'orange'}>
                        {health.p99ResponseTime}ms
                      </Tag>
                    </div>
                  </Space>
                </Col>

                {/* Alerts */}
                {hasAlerts && (
                  <Col span={24}>
                    <Alert
                      type={criticalAlerts > 0 ? 'error' : 'warning'}
                      message={
                        <Space>
                          <ExclamationCircleOutlined />
                          <Text strong>{health.alerts.length} Active Alert{health.alerts.length > 1 ? 's' : ''}</Text>
                          {criticalAlerts > 0 && (
                            <Tag color="red">{criticalAlerts} Critical</Tag>
                          )}
                        </Space>
                      }
                      description={
                        <Timeline
                          style={{ marginTop: 12 }}
                          items={health.alerts.map(alert => ({
                            color: getSeverityColor(alert.severity),
                            children: (
                              <div>
                                <Space>
                                  <Tag color={getSeverityColor(alert.severity)}>
                                    {alert.severity.toUpperCase()}
                                  </Tag>
                                  <Text>{alert.message}</Text>
                                </Space>
                                <br />
                                <Text type="secondary" style={{ fontSize: 11 }}>
                                  {alert.timestamp}
                                </Text>
                              </div>
                            )
                          }))}
                        />
                      }
                    />
                  </Col>
                )}
              </Row>
            </Card>
          );
        })}
      </Space>

      {/* Summary Alert */}
      {stats.totalAlerts > 0 && (
        <Alert
          message={`${stats.totalAlerts} Total Active Alerts`}
          description="Review and address API health issues to maintain service quality."
          type="warning"
          showIcon
          style={{ marginTop: 16 }}
        />
      )}
    </Card>
  );
};

export default APIHealthDashboard;
