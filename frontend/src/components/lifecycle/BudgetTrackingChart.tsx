import React from 'react';
import { Card, Typography, Row, Col, Statistic, Space, Tag, Progress } from 'antd';
import { Column } from '@ant-design/charts';
import {
  ArrowUpOutlined,
  DollarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined
} from '@ant-design/icons';
import { mockBudgetTracking } from '../../mocks';

const { Title, Text } = Typography;

/**
 * Budget Tracking Chart - Quarterly budget execution tracking
 */
const BudgetTrackingChart: React.FC = () => {
  // Prepare chart data - group by quarter and show spent by category
  const chartData = mockBudgetTracking.map((item) => ({
    quarter: `${item.year} ${item.quarter}`,
    category: item.category,
    value: item.spent / 1_000_000_000 // Convert to billions
  }));

  // Calculate totals and statistics
  const totalAllocated = mockBudgetTracking.reduce((sum, item) => sum + item.allocated, 0);
  const totalSpent = mockBudgetTracking.reduce((sum, item) => sum + item.spent, 0);
  const utilizationRate = ((totalSpent / totalAllocated) * 100).toFixed(1);
  const remaining = totalAllocated - totalSpent;

  const config = {
    data: chartData,
    xField: 'quarter',
    yField: 'value',
    seriesField: 'category',
    isStack: true,
    color: ['#1890ff', '#52c41a', '#faad14', '#722ed1', '#8c8c8c'],
    label: false,
    yAxis: {
      label: {
        formatter: (v: string) => `${parseFloat(v).toFixed(0)}B VNĐ`
      }
    },
    legend: {
      position: 'bottom' as const
    },
    tooltip: {
      formatter: (datum: any) => {
        return {
          name: datum.category,
          value: `${datum.value.toFixed(2)}B VNĐ`
        };
      }
    }
  };

  return (
    <Card>
      <Title level={5} style={{ marginBottom: 24 }}>
        Theo dõi ngân sách
      </Title>

      {/* Statistics Dashboard */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={6}>
          <Card size="small">
            <Statistic
              title="Tổng ngân sách"
              value={totalAllocated.toFixed(2)}
              suffix="B VNĐ"
              prefix={<DollarOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card size="small">
            <Statistic
              title="Đã chi tiêu"
              value={totalSpent.toFixed(2)}
              suffix="B VNĐ"
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card size="small">
            <Statistic
              title="Còn lại"
              value={remaining.toFixed(2)}
              suffix="B VNĐ"
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: remaining < 5 ? '#ff4d4f' : '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card size="small">
            <div>
              <Text type="secondary" style={{ fontSize: 12 }}>Tỷ lệ sử dụng</Text>
              <br />
              <Text strong style={{ fontSize: 24, color: parseFloat(utilizationRate) > 90 ? '#ff4d4f' : '#52c41a' }}>
                {utilizationRate}%
              </Text>
              <Progress
                percent={parseFloat(utilizationRate)}
                showInfo={false}
                strokeColor={parseFloat(utilizationRate) > 90 ? '#ff4d4f' : parseFloat(utilizationRate) > 75 ? '#faad14' : '#52c41a'}
                size="small"
                style={{ marginTop: 8 }}
              />
            </div>
          </Card>
        </Col>
      </Row>

      {/* Quarterly Breakdown Chart */}
      <Column {...config} height={350} />

      {/* Quarterly Details Table */}
      <div style={{ marginTop: 24 }}>
        <Title level={5} style={{ marginBottom: 12 }}>Chi tiết theo quý</Title>
        <Space direction="vertical" size="small" style={{ width: '100%' }}>
          {Array.from(new Set(mockBudgetTracking.map(b => `${b.year} ${b.quarter}`))).map((quarterKey) => {
            const quarterData = mockBudgetTracking.filter(b => `${b.year} ${b.quarter}` === quarterKey);
            const totalAllocatedQ = quarterData.reduce((sum, item) => sum + item.allocated, 0);
            const totalSpentQ = quarterData.reduce((sum, item) => sum + item.spent, 0);
            const utilization = ((totalSpentQ / totalAllocatedQ) * 100).toFixed(1);
            const isOverBudget = totalSpentQ > totalAllocatedQ;

            return (
              <Card key={quarterKey} size="small" style={{ background: '#fafafa' }}>
                <Row align="middle" gutter={16}>
                  <Col xs={24} sm={6}>
                    <Text strong>{quarterKey}</Text>
                  </Col>
                  <Col xs={12} sm={4}>
                    <div>
                      <Text type="secondary" style={{ fontSize: 11 }}>Cấp phát</Text>
                      <br />
                      <Text strong>{(totalAllocatedQ / 1_000_000_000).toFixed(2)}B</Text>
                    </div>
                  </Col>
                  <Col xs={12} sm={4}>
                    <div>
                      <Text type="secondary" style={{ fontSize: 11 }}>Đã chi</Text>
                      <br />
                      <Text strong style={{ color: isOverBudget ? '#ff4d4f' : '#52c41a' }}>
                        {(totalSpentQ / 1_000_000_000).toFixed(2)}B
                      </Text>
                    </div>
                  </Col>
                  <Col xs={24} sm={10}>
                    <Space>
                      <Progress
                        percent={parseFloat(utilization)}
                        strokeColor={isOverBudget ? '#ff4d4f' : parseFloat(utilization) > 90 ? '#faad14' : '#52c41a'}
                        size="small"
                        style={{ width: 120 }}
                      />
                      <Tag color={isOverBudget ? 'red' : parseFloat(utilization) > 90 ? 'orange' : 'green'}>
                        {utilization}%
                      </Tag>
                      {isOverBudget && (
                        <Tag icon={<ArrowUpOutlined />} color="red">
                          Vượt ngân sách
                        </Tag>
                      )}
                    </Space>
                  </Col>
                </Row>
              </Card>
            );
          })}
        </Space>
      </div>
    </Card>
  );
};

export default BudgetTrackingChart;
